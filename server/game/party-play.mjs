// Gruppenspiel (E-39): Bedarf/Gier um seltene Beute, geteilter Sammelfortschritt, Gruppen-Buffs.
// Der Server rechnet keinen Kampf: er kennt nur, wer mit wem in Reichweite steht, würfelt und reicht weiter.
// Ohne Netz testbar: members(c) → Gruppenmitglieder (inkl. c), send(client,msg), now() in ms, random() 0..1.
export const PARTY_RULES=Object.freeze({range:1600,rollMs:30000,maxOpenRolls:8,rarities:['rare','epic'],choices:['need','greed','pass'],buffMaxSeconds:60});
export const PARTY_TEXT={
 won:(n,item,c,v)=>n+' gewinnt '+item+' ('+(c==='need'?'Bedarf':'Gier')+' '+v+').',
 allPassed:(n,item)=>'Alle passen – '+item+' bleibt bei '+n+'.',
 offered:(n,item)=>n+' hat '+item+' gefunden. Würfelt!'
};
const text=(s,n)=>String(s??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const int=(v,lo,hi)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;};
const near=(a,b)=>a.placed&&b.placed&&a.world===b.world&&Math.hypot(a.x-b.x,a.y-b.y)<=PARTY_RULES.range;

/** Beute-Angabe des Finders säubern. Gewürfelte Teile tragen `raw` (Bauplan), feste Teile nur die id. */
export function cleanItem(item){
 if(!item||typeof item!=='object')return null;const id=text(item.id,80),name=text(item.name,60),rarity=text(item.rarity,12);
 if(!/^[a-zA-Z0-9_-]+$/.test(id)||!name||!PARTY_RULES.rarities.includes(rarity))return null;
 const out={id,name,rarity,icon:text(item.icon,24),slot:text(item.slot,16)};
 if(item.raw&&typeof item.raw==='object'){const r=item.raw;out.raw={slot:text(r.slot,16),spec:text(r.spec,16),level:int(r.level,1,60),quality:text(r.quality,12),roll:int(r.roll,0,999),family:text(r.family,16)};}
 return out;
}

export function createPartyPlay({members,send,now=Date.now,random=Math.random}){
 const rolls=new Map();let serial=0;
 const group=c=>members(c).filter(o=>o===c||near(c,o));
 const notice=(list,t)=>{for(const o of list)send(o,{t:'notice',text:t});};

 function finish(r){
  rolls.delete(r.id);const alive=r.eligible,results=[];
  for(const o of alive){const c=r.choices.get(o.id)||'pass';results.push({n:o.name,c,v:c==='pass'?0:1+Math.floor(random()*100),o});}
  const rank=x=>(x.c==='need'?1000:0)+x.v,best=results.filter(x=>x.c!=='pass').sort((a,b)=>rank(b)-rank(a))[0]||null;
  const winner=best?best.o:r.from,wire={t:'rolled',id:r.id,item:r.item,winner:winner.name,rolls:results.map(({n,c,v})=>({n,c,v}))};
  for(const o of alive)send(o,wire);
  notice(alive,best?PARTY_TEXT.won(winner.name,r.item.name,best.c,best.v):PARTY_TEXT.allPassed(winner.name,r.item.name));
 }
 /** Finder bietet ein seltenes Teil an. Allein (oder niemand in Reichweite): sofort zurück an den Finder. */
 function offer(c,msg){
  const item=cleanItem(msg.item);if(!item)return false;const eligible=group(c);
  if(eligible.length<2||[...rolls.values()].filter(r=>r.from===c).length>=PARTY_RULES.maxOpenRolls){send(c,{t:'rolled',id:0,item,winner:c.name,rolls:[]});return true;}
  const r={id:++serial,item,from:c,eligible,choices:new Map(),until:now()+PARTY_RULES.rollMs};rolls.set(r.id,r);
  for(const o of eligible)send(o,{t:'roll',id:r.id,item,from:c.name,secs:Math.round(PARTY_RULES.rollMs/1000)});
  notice(eligible,PARTY_TEXT.offered(c.name,item.name));return true;
 }
 function choice(c,msg){
  const r=rolls.get(int(msg.id,0,1e9)),pick=PARTY_RULES.choices.includes(msg.c)?msg.c:null;
  if(!r||!pick||!r.eligible.includes(c)||r.choices.has(c.id))return false;
  r.choices.set(c.id,pick);for(const o of r.eligible)send(o,{t:'rollpick',id:r.id,n:c.name,c:pick});
  if(r.choices.size>=r.eligible.length)finish(r);return true;
 }
 /** Sammelfortschritt und Buffs: an Gruppenmitglieder in Reichweite weiterreichen. */
 function share(c,msg){
  const others=group(c).filter(o=>o!==c);if(!others.length)return 0;let wire=null;
  if(msg.t==='qshare'){const item=text(msg.item,60);if(!/^[a-zA-Z0-9_-]+$/.test(item))return 0;wire={t:'qshare',from:c.name,k:'gather',item};}
  else if(msg.t==='buff'){const b=msg.b&&typeof msg.b==='object'?msg.b:{},name=text(b.name,40);if(!name)return 0;
   wire={t:'buff',from:c.name,b:{name,icon:text(b.icon,24),duration:int(b.duration,1,PARTY_RULES.buffMaxSeconds),reduction:Math.max(0,Math.min(.5,Number(b.reduction)||0)),hot:int(b.hot,0,200),shield:int(b.shield,0,5000)}};}
  if(!wire)return 0;for(const o of others)send(o,wire);return others.length;
 }
 return {rolls,offer,choice,share,
  /** Spieler weg: zählt als Passen; sein eigenes Angebot fällt an den Besten der übrigen. */
  gone(c){for(const r of [...rolls.values()]){if(!r.eligible.includes(c))continue;r.eligible=r.eligible.filter(o=>o!==c);r.choices.delete(c.id);if(r.from===c)r.from=r.eligible[0];if(!r.eligible.length)rolls.delete(r.id);else if(r.choices.size>=r.eligible.length)finish(r);}},
  tick(){const t=now();for(const r of [...rolls.values()])if(r.until<=t)finish(r);}};
}
