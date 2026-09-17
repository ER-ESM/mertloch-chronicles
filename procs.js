// Proc-Laufzeit: wertet die Regeln aus content/procs.js aus. Talente aktivieren eine Regel über den Effektschlüssel `proc:<id>`.
// Zeitfenster liegen in g.procState; die Leiste leuchtet über procGlow(), Kosten und Verstärkung werden beim Einsatz verbraucht.
import {PROC_RULES} from './content/index.js';
import {addGuard,healPlayer} from './class-mechanics.js';
export const freshProcState=()=>({free:{},empower:{},glow:{},counts:{},haste:0,hasteUntil:0,fired:0});
/** Zählstand eines Zählauslösers ("jede dritte Kelle") – für die Anzeige auf der Leiste. */
export const procCount=(g,id)=>g.procState?.counts?.[id]||0;
export const procIds=cs=>Object.keys(cs).filter(k=>k.startsWith('proc:')&&cs[k]>0).map(k=>k.slice(5));
/** Löst alle Regeln mit diesem Auslöser aus; gibt die Zahl der gezündeten Procs zurück. */
export function fireProcs(g,trigger,cs,info={}){const st=g.procState||(g.procState=freshProcState());st.counts||(st.counts={});let fired=0;const p=g.player;
 for(const id of procIds(cs)){const r=PROC_RULES[id];if(!r||r.trigger!==trigger)continue;
  // Auslöser mit Kniff-Bindung (skillHit) zünden nur beim genannten Kniff; `every` zählt deterministisch mit.
  if(r.skill&&r.skill!==info.skill)continue;
  if(r.every>1){const n=st.counts[id]=(st.counts[id]||0)+1;if(n%r.every)continue;}
  if(r.chance<1&&g.random()>=r.chance)continue;fired++;st.fired++;const until=g.time+r.window,ef=r.effect;
  if(ef.free)st.free[ef.free]=until;if(ef.empower)st.empower[ef.empower]=until;if(ef.reset)g.cooldowns[ef.reset]=0;if(ef.energy)p.energy=Math.min(100,p.energy+ef.energy);if(ef.points)p.runes=Math.min(3,p.runes+ef.points);if(ef.shield)addGuard(g,ef.shield,cs);if(ef.heal)healPlayer(g,ef.heal,cs);if(ef.cdReduce)for(const c of [].concat(ef.cdReduce))if(c?.skill in g.cooldowns)g.cooldowns[c.skill]=Math.max(0,g.cooldowns[c.skill]-(c.seconds||0));if(ef.haste){st.haste=Math.max(st.haste,ef.haste);st.hasteUntil=until;}
  if(r.glow)st.glow[r.glow]=until;
  const skill=r.glow&&g.skills.find(s=>s.id===r.glow);g.float(p.x,p.y-44,skill?skill.name.toUpperCase()+' BEREIT':'PROC','#ffd77a');g.log('Proc · '+r.text);g.emit('proc',{id});}
 return fired;}
export const procFree=(g,id)=>(g.procState?.free[id]||0)>g.time;
export const procEmpowered=(g,id)=>(g.procState?.empower[id]||0)>g.time;
export const procGlow=(g,id)=>procFree(g,id)||procEmpowered(g,id)||(g.procState?.glow[id]||0)>g.time;
export function consumeProc(g,kind,id){const st=g.procState;if(!st||!(st[kind][id]>g.time))return false;delete st[kind][id];return true;}
export function tickProcs(g){const st=g.procState;if(!st)return;st.counts||(st.counts={});for(const kind of ['free','empower','glow'])for(const k of Object.keys(st[kind]))if(st[kind][k]<=g.time)delete st[kind][k];if(st.hasteUntil<=g.time)st.haste=0;}
export const procHaste=g=>g.procState&&g.procState.hasteUntil>g.time?g.procState.haste:0;
export const activeProcChips=g=>{const st=g.procState;if(!st)return [];const names=id=>g.skills.find(s=>s.id===id)?.name||id;return [...Object.entries(st.free).filter(([,t])=>t>g.time).map(([id,t])=>names(id)+' gratis '+Math.ceil(t-g.time)+' s'),...Object.entries(st.empower).filter(([,t])=>t>g.time).map(([id,t])=>names(id)+' ×2 '+Math.ceil(t-g.time)+' s')];};
