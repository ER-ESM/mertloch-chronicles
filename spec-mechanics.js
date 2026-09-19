// Laufzeit der Spezialisierungs-Kernmechaniken (E-32). Daten: content/mechanics.js. Zustand liegt in g.classState.m
// (wird mit dem Klassenzustand zurückgesetzt). Engine und class-mechanics rufen die Haken auf; alle Prüfungen laufen
// über das gewählte Spec (g.rpg.talents.spec). Ohne Mechanik-Eintrag verhalten sich alle Haken neutral.
import {SPEC_MECHANICS,MECHANIC_UI} from './content/index.js';
import {distance} from './world.js';
import {applyMark,healPlayer,addGuard,markedEnemies} from './class-mechanics.js';
import {procGlow,fireProcs} from './procs.js';
import {combatStats} from './rpg.js';

export const mechanic=g=>SPEC_MECHANICS[g.rpg?.talents?.spec]||null;
/** Mechanik-Zustand; lazily angelegt, Teil von classState (resetClassState leert ihn mit). */
export const M=g=>{const st=g.classState;return st.m||(st.m={stack:0,stackUntil:0,hangover:0,supply:0,clean:0,state:0,jackpot:0,miss:0,over:0,heat:[],reaction:0,hausverbot:0,hausverbotCd:0,tapHaste:0,hasteBonus:0,fassHaste:0,last:''});};
const num=(cs,key,base)=>base+(cs?.[key]||0);
const nb=(g,point,radius,except=null,engagedOnly=true)=>g.enemies.filter(e=>e!==except&&e.hp>0&&e.ai!=='returning'&&!e.spawnGrace&&(!engagedOnly||e.aggro)&&distance(e,point)<=radius&&g.world.lineClear(point,e)).sort((a,b)=>distance(a,point)-distance(b,point));
const note=(g,text,color='#ffd77a',skill=null)=>{const p=g.player;if(!g.sct?.({area:'note',kind:'momentum',text,color,skill}))g.float?.(p.x,p.y-48,text,color);};
const fieldsOf=(g,kind)=>g.fields.filter(z=>z.kind===kind);
const mechFields=(g,m)=>m?.field?fieldsOf(g,m.field.kind):[];

/** Kit-Überschreibungen (Name, Text) und Laufzauber-Flags je Spec. */
export function applySpecKit(g,skills){
 const m=mechanic(g);if(!m)return skills;
 for(const [id,over] of Object.entries(m.kit||{})){const s=skills.find(s=>s.id===id);if(!s)continue;if(over.name)s.name=over.name;if(over.text)s.text=over.text;}
 return skills;
}
/** Darf dieser Kniff im Laufen gewirkt werden? Spec-Zustand (Putzwut), Kit-Flag oder Talent (mobileStrike, mobileHeal …). */
export function isMobile(g,s){
 if(!s)return false;if(s.mobile)return true;
 const cs=combatStats(g),key='mobile'+s.id[0].toUpperCase()+s.id.slice(1);if(cs[key])return true;
 const m=mechanic(g);if(!m)return false;
 if(m.gamble&&s.id==='throw')return true;
 if(m.state&&M(g).state>0&&(cs.stateMobileAll||m.state.mobile.includes(s.id)))return true;
 return false;
}
/** Kosten in einem Zustand, der alles kostenlos macht (Putzwut). */
export function skillCostMech(g,s,cost){const m=mechanic(g);if(m?.state&&M(g).state>0)return 0;return cost;}
/** Kurzer GCD (E-32 Nr. 4): Kniff in einer Variante oder proc-ausgelöst. */
export function quickGcd(g,id,e){
 const st=g.classState,p=g.player;
 if(procGlow(g,id))return true;
 if(id==='strike'&&(st.freeStrike||st.empowered>0))return true;
 if(id==='throw'&&st.freeThrow)return true;
 if(id==='burst'&&p.runes===3&&e?.mark>0)return true;
 if(mechVariant(g,id))return true;
 return false;
}
/** Beschriftung/Ton der Leiste, solange die Bedingung der Mechanik erfüllt ist (combat-ui skillStatus). */
export function mechVariant(g,id){
 const m=mechanic(g);if(!m?.variant?.[id])return null;const v=m.variant[id],s=M(g),cs=combatStats(g);
 const on={hausverbot:()=>s.hausverbot>0,stackFull:()=>s.stack>0&&s.stack>=Math.max(1,m.stack.max-(cs.stackBurstAt||0)),fieldsUp:()=>mechFields(g,m).length>0,supplyFull:()=>s.supply>=num(cs,'supplyMax',m.supply.max),marked3:()=>markedEnemies(g,num(cs,'dotRadius',m.dot.explode.radius)).length>=3,state:()=>s.state>0,reaction:()=>s.reaction>0,jackpot:()=>s.jackpot>0}[v.when];
 return on?.()?{name:s.stack&&v.when==='stackFull'?'ABRISS ×'+s.stack:v.name,tone:v.tone||'gold'}:null;
}
/** Grundangriff traf: Pegelstrich, Schimmel-Übertragung. */
export function onStrikeMech(g,e,cs){
 const m=mechanic(g);if(!m)return;const s=M(g);
 if(m.stack){s.stack=Math.min(m.stack.max,s.stack+m.stack.gainOnStrike);s.stackUntil=g.time+num(cs,'stackDecay',m.stack.decay);}
 if(m.dot&&e?.mark>0)spreadDot(g,e,num(cs,'dotSpread',m.dot.spreadOnStrike),cs);
}
function spreadDot(g,from,count,cs){const m=mechanic(g);if(!m?.dot||count<=0)return;const targets=nb(g,from,num(cs,'dotRadius',m.dot.radius),from).filter(e=>!(e.mark>0)).slice(0,count);for(const t of targets){applyMark(g,t,cs,false);g.effect?.('projectile',t.x,t.y,{from:{x:from.x,y:from.y},life:.3,max:.3,classId:g.member.id});}if(targets.length)note(g,MECHANIC_UI.schimmel||'SCHIMMEL SPRINGT','#a7e88d','mark');}
/** Geglückte Parade: Ansage/Antwort – Parade während eines angesagten Zaubers gibt Randale (Filter-Furie). */
export function onParryMech(g,e,cs){const m=mechanic(g);if(!m?.prost||!e?.cast)return;g.player.energy=Math.min(100,g.player.energy+m.prost.energy);note(g,'PROST!','#ecc3fc','parry');}
/** Held kassiert einen Treffer: Pegelstrich (Kneipenschläger). */
export function onHitTakenMech(g,n,cs){const m=mechanic(g);if(!m?.stack||n<=0)return;const s=M(g);s.stack=Math.min(m.stack.max,s.stack+m.stack.gainOnHit);s.stackUntil=g.time+num(cs,'stackDecay',m.stack.decay);}
/** Eskalation vor dem Schaden: Faktor aus Pegel/Zustand, Nebenwirkungen (Fässer anstechen, Robbi überlasten, Schimmel platzen, Deckung als Welle). */
export function burstMultiplier(g,e,cs,context={}){
 const m=mechanic(g);if(!m)return 1;const s=M(g),p=g.player;let f=1;
 if(m.stack&&s.stack>0){f*=1+num(cs,'stackBonus',m.stack.bonusPerStack)*s.stack;if(cs.stackWave)for(const o of nb(g,e,80,e))g.damage(o,Math.round(20*s.stack),'Abriss');context.stack=s.stack;s.stack=0;s.stackUntil=0;}
 if(m.state&&s.state>0){f*=1+num(cs,'stateDamage',m.state.damage)-1;context.extra=Math.round(p.energy*m.state.finisherPerEnergy);s.state=0;p.energy=0;note(g,'AUSGEWRUNGEN','#ecc3fc','burst');}
 if(m.kind==='guard'&&!cs.guardBurst&&g.classState.guard>0){const others=nb(g,p,num(cs,'waveRadius',m.waveRadius),e);if(others.length){const spend=Math.min(m.burstGuard,g.classState.guard);g.classState.guard-=spend;for(const o of others)g.damage(o,spend,'Rausschmiss');}}
 if(m.kind==='fields'){const fields=mechFields(g,m);if(fields.length){for(const z of fields){const tap=m.tap[z.sort];if(z.sort==='bock')for(const o of nb(g,z,tap.radius))g.damage(o,num(cs,'tapDamage',tap.damage),'Fassanstich');if(z.sort==='weizen'&&distance(p,z)<=z.radius+20)healPlayer(g,tap.heal,cs,false,'fassanstich');if(z.sort==='pils'){s.tapHaste=tap.duration;}g.effect?.('burst',z.x,z.y,{life:.6,max:.6,radius:z.radius});z.remaining=0;}g.fields=g.fields.filter(z=>z.remaining>0);note(g,'FASSANSTICH','#ffe08a','burst');}}
 if(m.kind==='turret'){for(const z of mechFields(g,m)){for(const o of nb(g,z,num(cs,'overloadRadius',m.overload.radius))){g.damage(o,num(cs,'overloadDamage',m.overload.damage),'Überlast');if(cs.overloadStun)o.stun=Math.max(o.stun,cs.overloadStun);}g.effect?.('burst',z.x,z.y,{life:.7,max:.7,radius:m.overload.radius,strong:true});z.remaining=0;}g.fields=g.fields.filter(z=>z.remaining>0);}
 if(m.dot){const targets=markedEnemies(g,num(cs,'dotRadius',m.dot.explode.radius));if(targets.length>=1){for(const t of targets){g.damage(t,(t.dotDamage||12)*num(cs,'dotExplodeTicks',m.dot.explode.perTick),'Durchputzen');if(cs.dotHeal)healPlayer(g,(t.dotDamage||12),cs,false,'durchputzen');t.mark=0;t.slow=1;g.effect?.('burst',t.x,t.y,{life:.5,max:.5,radius:30});}if(targets.length>=3)note(g,'DURCHGEPUTZT','#a7e88d','burst');}}
 if(m.supply&&s.supply>=num(cs,'supplyMax',m.supply.max)){s.supply=0;s.clean=num(cs,'cleanDuration',m.supply.cleanDuration);note(g,'GROSSREINEMACHEN','#ffe08a','burst');}
 return f;
}
/** Eskalation nach dem Schaden: Kettenblitz und Bonusschaden aus dem Zustand. */
export function afterBurst(g,e,cs,dealt,context={}){
 const m=mechanic(g);if(!m)return;const s=M(g);
 if(context.extra>0&&e?.hp>0)g.damage(e,context.extra,'Auswringen');
 if(m.chain){const reacting=s.reaction>0,jumps=reacting?m.reaction.jumps:num(cs,'chainJumps',m.chain.jumps),falloff=Math.max(0,num(cs,'chainFalloff',m.chain.falloff));let from=e,n=dealt;const hit=new Set([e]);
  if(e?.mark>0)fuseExplode(g,e,cs);
  for(let i=0;i<jumps;i++){const next=nb(g,from,num(cs,'chainRadius',m.chain.radius)).find(o=>!hit.has(o));if(!next)break;n=Math.round(n*(1-falloff));hit.add(next);g.effect?.('chain',next.x,next.y,{from:{x:from.x,y:from.y-10},life:.35,max:.35});g.damage(next,n,'Kurzschluss');if(next.mark>0)fuseExplode(g,next,cs);from=next;}
  if(reacting)s.reaction=0;}
}
function fuseExplode(g,e,cs){const m=mechanic(g);if(!m?.fuse)return;const s=M(g),ex=m.fuse.explode;e.mark=0;e.slow=1;for(const o of nb(g,e,ex.radius))g.damage(o,num(cs,'fuseDamage',ex.damage),'Lunte');g.effect?.('burst',e.x,e.y,{life:.5,max:.5,radius:ex.radius});
 if(cs.fuseSpread){const t=nb(g,e,90,e).find(o=>!(o.mark>0));if(t)applyMark(g,t,cs,false);}
 const window=num(cs,'reactionWindow',m.reaction.window);s.heat=s.heat.filter(t=>g.time-t<window);s.heat.push(g.time);
 if(s.heat.length>=m.reaction.count&&s.reaction<=0){s.reaction=num(cs,'reactionDuration',m.reaction.duration);s.heat=[];g.cooldowns.burst=0;note(g,'KETTENREAKTION','#9bdce4','burst');fireProcs(g,'reactionStart',cs);}}
/** Markierung läuft ab: Lunte zündet. */
export function onMarkExpire(g,e){const m=mechanic(g);if(m?.fuse&&e.hp>0){e.mark=.01;fuseExplode(g,e,combatStats(g));}}
/** Kill: Schimmel springt weiter. */
export function onKillMech(g,e,wasMarked,cs){const m=mechanic(g);if(m?.dot&&wasMarked)spreadDot(g,e,num(cs,'dotSpread',m.dot.spreadOnKill),cs);}
/** Bodenkniff: platziertes Objekt statt Böller, wenn die Mechanik eines definiert. */
export function onGroundMech(g,s,point,cs){
 const m=mechanic(g);if(!m?.field)return false;const f=m.field,z={...point,kind:f.kind,radius:num(cs,'fieldRadius',f.radius),remaining:num(cs,'fieldDuration',f.duration),tick:1,power:0,fire:0,hp:f.hp||0};
 if(f.kind==='fass'){z.sort=cs.fassBock?'bock':cs.fassPils?'pils':cs.fassWeizen?'weizen':f.defaultSort;const max=num(cs,'fieldCount',f.max),mine=fieldsOf(g,'fass');while(mine.length>=max){const old=mine.shift();old.remaining=0;}}
 else{for(const old of fieldsOf(g,f.kind))old.remaining=0;}
 g.fields=g.fields.filter(x=>x.remaining>0);g.fields.push(z);g.effect?.('rune',z.x,z.y,{life:.8,max:.8});
 return true;
}
/** Schadensfaktor auf ausgehenden Schaden: Kater, Putzwut, Bastler-Glück (Fehl-/Überzündung, Pity, Jackpot). */
export function damageMultiplier(g,e,label,cs){
 const m=mechanic(g);if(!m)return 1;const s=M(g);let f=1;
 if(m.stack&&s.hangover>0)f*=m.stack.hangoverDamage;
 if(m.state&&s.state>0)f*=num(cs,'stateDamage',m.state.damage);
 if(m.gamble&&!s.rolling){const skill={Kelle:'strike',Pfandwurf:'throw'}[label];if(skill&&m.gamble.skills.includes(skill)){const r=g.random();let out='normal';
  if(s.jackpot>0||s.miss>=num(cs,'gamblePity',m.gamble.pity))out='over';else if(r<m.gamble.misfire)out='miss';else if(r>1-num(cs,'gambleOver',m.gamble.overcharge))out='over';
  if(out==='miss'){s.miss++;s.over=0;f*=num(cs,'gambleMisfireMult',m.gamble.misfireMult);note(g,'FEHLZÜNDUNG','#c9c2b4',skill);fireProcs(g,'misfire',cs,{skill});}
  else if(out==='over'){s.miss=0;if(s.jackpot<=0){s.over++;if(s.over>=num(cs,'jackpotStreak',m.gamble.jackpot.streak)){s.over=0;s.jackpot=num(cs,'jackpotDuration',m.gamble.jackpot.duration);note(g,'JACKPOT','#ffe08a',skill);fireProcs(g,'jackpotStart',cs);}}f*=m.gamble.overMult;note(g,'ÜBERZÜNDUNG','#ffd77a',skill);fireProcs(g,'overcharge',cs,{skill});
   if(e&&m.gamble.overSplash){s.rolling=true;try{for(const o of nb(g,e,m.gamble.overSplash.radius,e).slice(0,3))g.damage(o,Math.round(20*num(cs,'overSplashShare',m.gamble.overSplash.share)*f),'Überzündung');}finally{s.rolling=false;}}}
  else s.over=0;s.last=out;}}
 return f;
}
/** Direkte Heilung: Vorratsglas füllen; Großreinemachen macht aus Heilung Schaden am Ziel. */
export function onHealMech(g,amount,cs){const m=mechanic(g);if(!m?.supply)return;const s=M(g);s.supply=Math.min(num(cs,'supplyMax',m.supply.max),s.supply+1);if(s.clean>0&&g.target?.hp>0)g.damage(g.target,Math.round(amount*num(cs,'cleanDamage',m.supply.cleanDamage)),'Großreinemachen');}
/** Jede Bildwiederholung: Uhren, Zustände, platzierte Objekte. Wird aus tickClass aufgerufen (vor der Feldbereinigung). */
export function tickMech(g,dt,cs){
 const m=mechanic(g);if(!m)return;const s=M(g),p=g.player;
 for(const k of ['hangover','clean','state','jackpot','reaction','hausverbot','hausverbotCd','tapHaste'])if(s[k]>0)s[k]=Math.max(0,s[k]-dt);
 if(m.stack&&s.stack>0&&g.time>=s.stackUntil){s.stack=0;s.hangover=cs.hangoverShort?m.stack.hangover/2:m.stack.hangover;note(g,'KATER','#c9c2b4');}
 if(m.state){if(s.state>0){p.energy=Math.max(0,p.energy-num(cs,'stateDrain',m.state.drain)*dt);if(s.state<=0||p.energy<=0){s.state=0;}}
  else if(p.inCombat>0&&p.energy>=num(cs,'stateTrigger',m.state.trigger)){s.state=num(cs,'stateDuration',m.state.duration);note(g,'PUTZWUT','#ecc3fc','burst');}}
 if(m.kind==='guard'&&m.hausverbot){const cap=p.maxHp*.38;if(s.hausverbot<=0&&s.hausverbotCd<=0&&g.classState.guard>=cap*m.hausverbot.threshold){s.hausverbot=num(cs,'hausverbotDuration',m.hausverbot.duration);s.hausverbotCd=20;note(g,'HAUSVERBOT','#ffe08a','parry');}}
 s.fassHaste=0;
 for(const z of g.fields){
  if(z.kind==='fass'){const sort=m.field?.sorts?.[z.sort];if(!sort)continue;if(distance(p,z)<=z.radius){if(sort.haste)s.fassHaste=sort.haste;}z.tick-=dt;if(z.tick<=0){z.tick=1;if(sort.heal&&distance(p,z)<=z.radius)healPlayer(g,sort.heal,cs,false,'fass');if(sort.damage)for(const o of nb(g,z,z.radius))g.damage(o,sort.damage,'Bockfass');}}
  else if(z.kind==='robbi'){z.fire-=dt;for(const o of nb(g,z,z.radius))o.controlSlow=Math.max(o.controlSlow||0,.3);if(z.fire<=0){z.fire=m.field.interval;const t=nb(g,z,z.radius*2)[0];if(t){g.damage(t,num(cs,'robbiDamage',m.field.damage),'Robbi');g.effect?.('projectile',t.x,t.y,{from:{x:z.x,y:z.y-8},life:.3,max:.3,classId:'kevin'});if(cs.robbiGuard)addGuard(g,4,cs);}}}
  else if(z.kind==='nest'){z.tick-=dt;if(z.tick<=0){z.tick=1;if(distance(p,z)<=z.radius)healPlayer(g,num(cs,'fieldHeal',m.field.heal),cs,false,'nest');}
   if(z.remaining<=dt&&!z.honked){z.honked=true;const h=m.field.honk;for(const o of nb(g,z,h.radius))o.stun=Math.max(o.stun,h.stun*(cs.nestHonk?2:1));g.effect?.('interrupt',z.x,z.y);note(g,'GISELA SCHNATTERT','#a7e88d');}}
  else if(z.kind==='spores'){z.tick-=dt;if(z.tick<=0){z.tick=.5;for(const o of nb(g,z,z.radius))if(!(o.mark>0))applyMark(g,o,cs,false);}}
 }
 s.hasteBonus=(s.tapHaste>0?m.tap?.pils?.haste||0:0)+s.fassHaste;
}
/** Anzeige-Chips für die Stärkungsleiste. */
export function mechChips(g){
 const m=mechanic(g);if(!m)return [];const s=M(g),cs=combatStats(g),out=[],t=v=>Math.ceil(v)+' s';
 const pips=(n,max,on='▮',off='▯')=>on.repeat(Math.max(0,Math.min(max,n)))+off.repeat(Math.max(0,max-n));
 const bar=(v,max,len=5)=>{const k=Math.round(Math.max(0,Math.min(1,v/max))*len);return '▰'.repeat(k)+'▱'.repeat(len-k);};
 if(m.stack&&s.stack>0)out.push(MECHANIC_UI.pegel+' '+pips(s.stack,m.stack.max)+' '+t(Math.max(0,s.stackUntil-g.time)));
 if(s.hangover>0)out.push(MECHANIC_UI.kater+' '+bar(s.hangover,m.stack.hangover)+' '+t(s.hangover));
 if(m.supply)out.push(MECHANIC_UI.vorrat+' '+pips(s.supply,num(cs,'supplyMax',m.supply.max),'●','○'));
 if(s.clean>0)out.push('Großreinemachen '+bar(s.clean,num(cs,'cleanDuration',m.supply.cleanDuration))+' '+t(s.clean));
 if(m.state)out.push(s.state>0?MECHANIC_UI.putzwut+' '+bar(s.state,num(cs,'stateDuration',m.state.duration))+' '+t(s.state):MECHANIC_UI.putzwut+' '+bar(g.player.energy,num(cs,'stateTrigger',m.state.trigger)));
 if(s.jackpot>0)out.push(MECHANIC_UI.jackpot+' '+bar(s.jackpot,num(cs,'jackpotDuration',m.gamble.jackpot.duration))+' '+t(s.jackpot));
 else if(m.gamble&&(s.miss>0||s.over>0))out.push(s.miss>0?'Fehlzündungen '+pips(s.miss,num(cs,'gamblePity',m.gamble.pity),'✖','·'):'Überzündungen '+pips(s.over,num(cs,'jackpotStreak',m.gamble.jackpot.streak),'★','☆'));
 if(s.reaction>0)out.push(MECHANIC_UI.kettenreaktion+' '+bar(s.reaction,num(cs,'reactionDuration',m.reaction.duration))+' '+t(s.reaction));
 else if(m.chain&&s.heat.length)out.push('Zündungen '+pips(s.heat.length,m.reaction.count,'●','○'));
 if(s.hausverbot>0)out.push(MECHANIC_UI.hausverbot+' '+bar(s.hausverbot,num(cs,'hausverbotDuration',m.hausverbot.duration))+' '+t(s.hausverbot));
 for(const z of mechFields(g,m))out.push((z.kind==='fass'?MECHANIC_UI.fass+' '+z.sort:z.kind==='robbi'?MECHANIC_UI.robbi:z.kind==='nest'?MECHANIC_UI.nest:'Sporen')+' '+bar(z.remaining,num(cs,'fieldDuration',m.field.duration))+' '+t(z.remaining));
 if(s.tapHaste>0)out.push('Laufzauber '+t(s.tapHaste));
 return out;
}
