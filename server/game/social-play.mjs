// Miteinander (E-44): Hilfe auf Mitspieler (Heilung/Schutz), Aufhelfen, Handel und Weltbosse.
// Wie party-play.mjs: der Server rechnet keinen Kampf, er prüft Nähe und Zustand, reicht weiter und führt den Handel
// als Zustandsautomat. Ohne Netz testbar: clients() → Iterable, members(c) → Gruppe inkl. c, send, now, random,
// shared → createSharedWorld (für die Lebenspunkte des Weltbosses), say(text) → Ansage im Weltchat.
import {cleanItem} from './party-play.mjs';
export const SOCIAL_RULES=Object.freeze({aidRange:420,reviveRange:140,tradeRange:260,askMs:30000,tradeSlots:6,maxCoins:1e6,
 // Klassen-Buffs (class-buffs.js): der Server reicht nur weiter; Grenzen wie CLASS_BUFF_TUNING (30 min, Stärke ≤ 2), der Empfänger prüft die ID.
 classBuff:{maxSeconds:1800,maxPower:2},
 boss:{everyMs:30*60e3,firstMs:5*60e3,lifeMs:20*60e3,minPlayers:1,hpPerPlayer:.75,ids:['gisela','sigi','klaus','timo']}});
export const SOCIAL_TEXT={
 far:n=>n+' ist zu weit weg.',notDead:n=>n+' steht doch noch.',youDead:'Erst selbst aufstehen.',busy:n=>n+' handelt gerade.',gone:n=>'„'+n+'“ ist gerade nicht online.',
 askSent:n=>'Handelsanfrage an '+n+' geschickt.',declined:n=>n+' möchte gerade nicht handeln.',cancelled:n=>n+' hat den Handel abgebrochen.',done:n=>'Handel mit '+n+' abgeschlossen.',
 revived:(a,b)=>a+' hilft '+b+' wieder auf die Beine.',
 bossUp:(n,w)=>'WELTBOSS · '+n+' ist '+w+' aufgetaucht. Alle Mann hin!',bossDown:(n,list)=>'WELTBOSS · '+n+' liegt am Boden. Dabei waren: '+list.join(', ')+'.',bossGone:n=>'WELTBOSS · '+n+' hat sich verzogen.'
};
const text=(s,n)=>String(s??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const int=(v,lo,hi)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;};
const dist=(a,b)=>a.placed&&b.placed&&a.world===b.world?Math.hypot(a.x-b.x,a.y-b.y):Infinity;

/** Handelsgut säubern: beliebige Seltenheit, Stückzahl 1–99, gewürfelte Teile mit Bauplan. */
export function cleanGoods(list){
 const out=[];for(const raw of Array.isArray(list)?list.slice(0,SOCIAL_RULES.tradeSlots):[]){
  const probe=cleanItem({...raw,rarity:'rare'});if(!probe)continue;out.push({...probe,rarity:text(raw.rarity,12)||'common',count:int(raw.count,1,99)});}
 return out;
}

export function createSocialPlay({clients,members,send,shared=null,say=()=>{},now=Date.now,random=Math.random,bossFirstMs=SOCIAL_RULES.boss.firstMs}){
 const trades=new Map(),asks=new Map(),bosses=new Map();let bossSerial=0,nextBossAt=now()+bossFirstMs;
 const all=()=>[...clients()],byName=n=>all().find(c=>c.name.toLowerCase()===String(n||'').trim().toLowerCase())||null;
 const notice=(c,t)=>send(c,{t:'notice',text:t});

 // ── Hilfe: Heilung oder Schutz auf ein Gruppenmitglied in Reichweite ──
 function aid(c,msg){
  const o=byName(msg.to);if(!o||o===c||!members(c).includes(o))return false;if(dist(c,o)>SOCIAL_RULES.aidRange){notice(c,SOCIAL_TEXT.far(o.name));return false;}
  if(o.s==='dead')return false;
  send(o,{t:'aid',from:c.name,name:text(msg.name,40),heal:int(msg.heal,0,5000),b:msg.b&&typeof msg.b==='object'?{name:text(msg.b.name,40),icon:text(msg.b.icon,24),duration:int(msg.b.duration,1,60),reduction:Math.max(0,Math.min(.5,Number(msg.b.reduction)||0)),hot:int(msg.b.hot,0,200),shield:int(msg.b.shield,0,5000)}:null,
   cb:msg.cb&&typeof msg.cb==='object'&&/^[a-zA-Z]{1,40}$/.test(String(msg.cb.id))?{id:String(msg.cb.id),power:Math.max(1,Math.min(SOCIAL_RULES.classBuff.maxPower,Number(msg.cb.power)||1)),duration:int(msg.cb.duration,1,SOCIAL_RULES.classBuff.maxSeconds)}:null});return true;
 }
 // ── Aufhelfen: jeder darf jedem helfen, der am Boden liegt ──
 function revive(c,msg){
  const o=byName(msg.to);if(!o||o===c)return false;if(c.s==='dead'){notice(c,SOCIAL_TEXT.youDead);return false;}
  if(o.s!=='dead'){notice(c,SOCIAL_TEXT.notDead(o.name));return false;}if(dist(c,o)>SOCIAL_RULES.reviveRange){notice(c,SOCIAL_TEXT.far(o.name));return false;}
  o.s='idle';send(o,{t:'revived',from:c.name});for(const p of all())if(p===c||p===o||dist(p,o)<1400)notice(p,SOCIAL_TEXT.revived(c.name,o.name));return true;
 }

 // ── Handel ──
 const side=(t,c)=>t.a.c===c?t.a:t.b,other=(t,c)=>t.a.c===c?t.b:t.a;
 const tradeWire=(t,c)=>{const me=side(t,c),o=other(t,c);return {t:'trade',with:o.c.name,mine:{items:me.items,coins:me.coins,ok:me.ok},theirs:{items:o.items,coins:o.coins,ok:o.ok}};};
 const tradePush=t=>{send(t.a.c,tradeWire(t,t.a.c));send(t.b.c,tradeWire(t,t.b.c));};
 function endTrade(t,by){trades.delete(t.a.c);trades.delete(t.b.c);for(const s of [t.a,t.b]){send(s.c,{t:'tradeend'});if(by&&s.c!==by)notice(s.c,SOCIAL_TEXT.cancelled(by.name));}}
 function trade(c,msg){
  const op=String(msg.op||''),t=trades.get(c);
  if(op==='ask'){
   const o=byName(msg.name);if(!o||o===c)return notice(c,SOCIAL_TEXT.gone(text(msg.name,20)));if(t||trades.has(o))return notice(c,SOCIAL_TEXT.busy(t?c.name:o.name));
   if(dist(c,o)>SOCIAL_RULES.tradeRange)return notice(c,SOCIAL_TEXT.far(o.name));
   asks.set(o,{from:c,until:now()+SOCIAL_RULES.askMs});send(o,{t:'tradeask',from:c.name});notice(c,SOCIAL_TEXT.askSent(o.name));
  }else if(op==='accept'||op==='decline'){
   const ask=asks.get(c);asks.delete(c);const from=ask&&ask.until>now()&&all().includes(ask.from)?ask.from:null;if(!from)return;
   if(op==='decline')return notice(from,SOCIAL_TEXT.declined(c.name));if(trades.has(c)||trades.has(from))return notice(c,SOCIAL_TEXT.busy(from.name));
   if(dist(c,from)>SOCIAL_RULES.tradeRange)return notice(c,SOCIAL_TEXT.far(from.name));
   const nt={a:{c:from,items:[],coins:0,ok:false},b:{c,items:[],coins:0,ok:false}};trades.set(from,nt);trades.set(c,nt);tradePush(nt);
  }else if(!t)return;
  else if(op==='offer'){const me=side(t,c);me.items=cleanGoods(msg.items);me.coins=int(msg.coins,0,SOCIAL_RULES.maxCoins);t.a.ok=t.b.ok=false;tradePush(t);} // jede Änderung nimmt beide Zusagen zurück
  else if(op==='confirm'){side(t,c).ok=true;if(!(t.a.ok&&t.b.ok))return tradePush(t);
   trades.delete(t.a.c);trades.delete(t.b.c);
   for(const s of [t.a,t.b]){const o=other(t,s.c);send(s.c,{t:'tradedone',with:o.c.name,give:{items:s.items,coins:s.coins},get:{items:o.items,coins:o.coins}});notice(s.c,SOCIAL_TEXT.done(o.c.name));}}
  else if(op==='cancel')endTrade(t,c);
 }

 // ── Weltboss: der Server sagt an, wo; die Lebenspunkte führt die geteilte Welt ──
 const bossWire=b=>({t:'wboss',e:b.e,boss:b.boss,spot:b.spot,hpx:b.hpx,left:Math.max(0,Math.round((b.until-now())/1000))});
 function spawnBoss(world,boss){
  const players=all().filter(c=>c.placed&&c.world===world).length,b={e:'wboss:'+(++bossSerial),world,boss:boss||SOCIAL_RULES.boss.ids[Math.floor(random()*SOCIAL_RULES.boss.ids.length)],spot:Math.floor(random()*1000),hpx:Math.round((1+SOCIAL_RULES.boss.hpPerPlayer*Math.max(0,players-1))*100)/100,until:now()+SOCIAL_RULES.boss.lifeMs,hitters:new Set()};
  bosses.set(world,b);for(const c of all())if(c.placed&&c.world===world)send(c,bossWire(b));return b;
 }
 return {trades,bosses,aid,revive,trade,spawnBoss,
  /** Client meldet den Namen und Ort seines Weltbosses zurück (nur der erste zählt) → Ansage im Weltchat. */
  bossSeen(c,msg){const b=bosses.get(c.world);if(!b||b.announced||msg.e!==b.e)return;b.announced=true;b.name=text(msg.name,40)||'Ein Weltboss';say(SOCIAL_TEXT.bossUp(b.name,text(msg.where,40)||'im Dorf'));},
  bossHit(c,e){const b=bosses.get(c.world);if(b&&b.e===e)b.hitters.add(c.name);},
  bossKilled(world,e,credit){const b=bosses.get(world);if(!b||b.e!==e)return;bosses.delete(world);say(SOCIAL_TEXT.bossDown(b.name||'Der Weltboss',[...new Set([...(credit||[]),...b.hitters])].slice(0,12)));},
  sync(c){const b=bosses.get(c.world);if(b)send(c,bossWire(b));},
  gone(c){const t=trades.get(c);if(t)endTrade(t,c);asks.delete(c);},
  tick(){
   const t=now();for(const [k,a] of asks)if(a.until<=t)asks.delete(k);
   for(const tr of new Set(trades.values()))if(dist(tr.a.c,tr.b.c)>SOCIAL_RULES.tradeRange*2)endTrade(tr,null);
   for(const [w,b] of bosses)if(b.until<=t){bosses.delete(w);shared?.mobs.delete(w+'|'+b.e);for(const c of all())if(c.placed&&c.world===w)send(c,{t:'wbossgone',e:b.e});if(b.announced)say(SOCIAL_TEXT.bossGone(b.name));}
   if(t>=nextBossAt){nextBossAt=t+SOCIAL_RULES.boss.everyMs;const worlds=new Map();for(const c of all())if(c.placed)worlds.set(c.world,(worlds.get(c.world)||0)+1);for(const [w,n] of worlds)if(n>=SOCIAL_RULES.boss.minPlayers&&!bosses.has(w))spawnBoss(w);}
  }};
}
