// Bounded, session-only aggregates. Recording never changes combat or consumes random numbers.
import {METER_RULES,METER_TEXT,APEROL_TEXT} from './content/index.js';

const totals=()=>({damage:0,healing:0,overheal:0,overkill:0});
const segment=(id,start)=>({id,start,end:null,seconds:0,title:'',training:false,actors:{},...totals()});
export const createCombatMeter=()=>({serial:0,current:null,history:[],overall:segment('overall',0),revision:0});
const meter=g=>g.meter||(g.meter=createCombatMeter());
const clock=g=>Number.isFinite(g.time)?g.time:0;
export function beginMeterCombat(g,enemy){
 const m=meter(g);
 if(!m.current){m.current=segment(++m.serial,clock(g));m.revision++;}
 if(enemy&&!m.current.title){m.current.title=enemy.name||METER_TEXT.fight;m.current.training=!!(enemy.arena||enemy.tutorial);}
 return m.current;
}
export function finishMeterCombat(g){
 const m=meter(g),s=m.current;if(!s)return;
 s.end=clock(g);s.seconds=Math.max(METER_RULES.minSeconds,s.end-s.start);
 // A pull with no damage or healing has no rows worth retaining.
 if(Object.keys(s.actors).length){m.overall.seconds+=s.seconds;m.history.unshift(s);m.history.length=Math.min(m.history.length,METER_RULES.history);}
 m.current=null;m.revision++;
}
export function tickCombatMeter(g){
 if(g.dead||g.player.inCombat<=0)finishMeterCombat(g);
 else if(!g.meter?.current){const enemy=g.enemies.find(e=>e.hp>0&&e.aggro&&e.ai!=='returning');if(enemy)beginMeterCombat(g,enemy);}
}
export function resetCombatMeter(g){g.meter=createCombatMeter();}
function record(g,kind,amount,excess,source,critical=false,actor=g.member){
 if(!Number.isFinite(amount)||!Number.isFinite(excess)||amount<0||excess<0||amount+excess<=0)return;
 const m=meter(g),s=m.current||beginMeterCombat(g);
 for(const scope of [s,m.overall]){
  const a=scope.actors[actor.id]||(scope.actors[actor.id]={id:actor.id,name:actor===g.member?(g.heroName||actor.name):actor.name,color:actor.color,abilities:{damage:{},healing:{}},...totals()});
  const rows=a.abilities[kind],r=rows[source.id]||(rows[source.id]={id:source.id,name:source.name,amount:0,excess:0,hits:0,crit:0,max:0});
  r.amount+=amount;r.excess+=excess;r.hits++;r.crit+=critical?1:0;r.max=Math.max(r.max,amount);
  scope[kind]+=amount;a[kind]+=amount;const extra=kind==='healing'?'overheal':'overkill';scope[extra]+=excess;a[extra]+=excess;
 }
 m.revision++;
}
export function recordMeterDamage(g,enemy,actual,dealt,label,critical=false,actor=g.member){
 if(!(actual>0)||!Number.isFinite(actual)||!Number.isFinite(dealt))return;
 beginMeterCombat(g,enemy);
 const id=METER_TEXT.damageSources[label]||(label===APEROL_TEXT.splash?'burst':null),skill=g.skills.find(s=>s.id===id);
 const source=typeof label==='object'?label:{id:id||'other',name:skill?.name||label||METER_TEXT.unknown};
 record(g,'damage',Math.max(0,dealt),Math.max(0,actual-dealt),source,critical,actor);
}
export function recordMeterHealing(g,amount,actual,source='heal',actor=g.member){
 // OOC healing must not open a fight or inflate a previous encounter's HPS.
 if(g.dead||!(g.player.inCombat>0))return;
 const names={leech:METER_TEXT.leech,feedback:METER_TEXT.feedback,hot:METER_TEXT.hot,killHeal:METER_TEXT.killHeal,parryHeal:METER_TEXT.parryHeal};
 const info=typeof source==='object'?source:{id:source,name:g.skills?.find(s=>s.id===source)?.name||names[source]||METER_TEXT.healingOther};
 record(g,'healing',actual,Math.max(0,amount-actual),info,false,actor);
}
// Heal raw values without applying talent multipliers (food, gear leech and passive parry).
export function restoreMeterHealth(g,amount,source){
 const p=g.player,actual=Math.max(0,Math.min(amount,p.maxHp-p.hp));
 p.hp+=actual;recordMeterHealing(g,amount,actual,source);return actual;
}
export function meterReport(g,selection='current',kind='damage'){
 const m=meter(g),s=selection==='overall'?m.overall:selection==='current'?(m.current||m.history[0]):m.history.find(s=>String(s.id)===String(selection));
 const live=s===m.current&&!!s,liveSeconds=m.current?Math.max(METER_RULES.minSeconds,clock(g)-m.current.start):0;
 const seconds=s?(selection==='overall'?s.seconds+liveSeconds:live?liveSeconds:s.seconds):0;
 const total=s?.[kind]||0,actors=Object.values(s?.actors||{}).map(a=>({id:a.id,name:a.name,color:a.color,amount:a[kind],rate:seconds?a[kind]/seconds:0,share:total?a[kind]/total*100:0,
  abilities:Object.values(a.abilities[kind]).map(r=>({...r,rate:seconds?r.amount/seconds:0,share:a[kind]?r.amount/a[kind]*100:0,average:r.hits?r.amount/r.hits:0})).sort((a,b)=>b.amount-a.amount||b.excess-a.excess||a.name.localeCompare(b.name))
 })).filter(a=>a.abilities.length).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
 return {id:s?.id??null,title:s?.title||'',training:!!s?.training,live,seconds,total,rate:seconds?total/seconds:0,excess:s?.[kind==='healing'?'overheal':'overkill']||0,actors,revision:m.revision};
}
