// Proc-Laufzeit: wertet die Regeln aus content/procs.js aus. Talente aktivieren eine Regel über den Effektschlüssel `proc:<id>`.
// Zeitfenster liegen in g.procState; die Leiste leuchtet über procGlow(), Kosten und Verstärkung werden beim Einsatz verbraucht.
import {emitCombatFx,procVisual} from './combat-fx.js';
import {PROC_RULES,METER_TEXT,TALENT_ROWS} from './content/index.js';
import {addGuard,healPlayer} from './class-mechanics.js';
import {M,mechanic} from './spec-mechanics.js';
import {grantResource,resourceProcEffect} from './class-resources.js';
import {RESOURCES,COMBAT_FLOW_TUNING,PROCS} from './content/index.js';
import {ITEMS} from './rpg.js';
import {distance} from './world.js';
export const freshProcState=()=>({free:{},empower:{},glow:{},counts:{},haste:0,hasteUntil:0,fired:0});
/** E-75 Waffenkammer: Wirkungen fester Waffen und Schilde (content/items.js PROCS, Einträge mit `trigger`). Dieselben Auslöser-Wörter und
 *  derselbe Zählweg wie fireProcs (every, chance über g.random, Zähler in g.procState.counts unter „item:<id>“), dazu eine interne
 *  Abklingzeit (icd). weapon:true bindet an den Autoangriff genau dieser Waffe (info.slot = ihr Platz) – eine Nahkampfwaffe wirkt also nur
 *  bei Nahkampf-Autoangriff, eine Fernkampfwaffe nur bei Fernkampf-Autoangriff. Die Wirkungen nutzen vorhandene Zustände: Bodenfläche mit
 *  Bremse (wie die Hopfenpfütze des Katerfasses), controlSlow, Glutbrand (e.burn), Heilung, Ressource, Schaden über g.damage. Neu ist nur
 *  die Einschüchterung (e.cowed/e.cowedBy), die foeDamageFactor() in den Gegnertreffer rechnet. Nichts davon steht im Spielstand.
 *  info: {foe, base (Grundtreffer vor Wumms und Glückstreffer), slot}. Rückgabe: Zahl der ausgelösten Wirkungen. */
export function fireItemProcs(g,trigger,cs,info={}){
 const eq=g.rpg?.equipment;if(!eq||g.dead)return 0;
 const st=g.procState||(g.procState=freshProcState());st.counts||(st.counts={});st.itemCd||(st.itemCd={});
 const level=g.player.level||1,seen=new Set();let fired=0;
 for(const [slot,itemId] of Object.entries(eq)){
  const d=ITEMS[itemId],id=d?.proc,r=id&&PROCS[id];
  if(!r?.trigger||![].concat(r.trigger).includes(trigger)||(d.level||1)>level||seen.has(id))continue;
  if(r.weapon&&(trigger==='autoHit'||trigger==='crit')&&slot!==info.slot)continue;/* Waffenwirkung: nur der eigene Autoangriff zählt */
  seen.add(id);const key='item:'+id,foe=info.foe,alive=!!foe&&foe.hp>0&&foe.ai!=='returning',base=info.base||0;
  if((st.itemCd[key]||0)>g.time)continue;
  if(r.every>1){const n=st.counts[key]=(st.counts[key]||0)+1;
   if(n%r.every){if(r.countLabel)itemNote(g,r.countLabel+' '+(n%r.every)+'/'+r.every,itemId);continue;}
   if(r.overload&&!alive){st.counts[key]=n-1;continue;}/* der volle Akku wartet auf den nächsten Treffer an einem lebenden Ziel */}
  if(r.chance<1&&(g.itemRandom||g.random)()>=r.chance)continue;/* g.itemRandom: eigener Strom der Balance-Simulation, damit Vorher/Nachher dieselben Glückstreffer würfeln */
  fired++;if(r.icd)st.itemCd[key]=g.time+r.icd;
  if(r.heal)healPlayer(g,r.heal,cs,false,{id:key,name:r.name||d.name});
  if(r.energy)grantResource(g,r.energy,'item');
  if(r.field&&foe)g.fields.push({kind:r.field,x:foe.x,y:foe.y,radius:r.radius,remaining:r.duration,tick:1,power:0,slow:true,source:key});
  if(r.slow&&alive)foe.controlSlow=Math.max(foe.controlSlow||0,r.slow);
  if(r.burn&&alive){const dps=Math.max(1,Math.round(base*r.burn/r.duration));/* ein stärkerer Brand (Glutbrocken) bleibt stehen */if(!(foe.burn?.t>0)||foe.burn.dps<dps)foe.burn={t:r.duration+.1,tick:1,dps,label:r.name};}
  if(r.weaken&&alive){foe.cowed=r.duration;foe.cowedBy=r.weaken;emitCombatFx(g,'proc',foe,{procId:key,signal:'weaken',label:r.label});}
  if(r.splash&&foe){const n=Math.max(1,Math.round(base*r.splash)),near=g.enemies.filter(o=>o!==foe&&o.hp>0&&o.aggro&&o.ai!=='returning'&&!(o.spawnGrace>0)&&distance(o,foe)<=r.radius&&g.world.lineClear(foe,o)).sort((a,b)=>distance(a,foe)-distance(b,foe)).slice(0,r.targets);
   /* nur Gegner, die schon kämpfen: ein Kronkorken zieht keine neutrale Gruppe */emitCombatFx(g,'burst',foe,{radius:r.radius,skillId:key});for(const o of near)g.damage(o,n,r.name);}
  if(r.overload&&alive){emitCombatFx(g,'interrupt',foe,{successful:true,skillId:key});g.damage(foe,Math.max(1,Math.round(base*r.overload)),r.name);}
  itemNote(g,r.label,itemId);g.emit?.('itemProc',{id,item:itemId});
 }
 return fired;}
/** Kampftext-Meldung einer Waffenwirkung mit dem Symbol der Waffe (gleiche Meldungen fasst der Kampftext zu „×N“ zusammen). */
function itemNote(g,text,itemId){const p=g.player;if(!g.sct?.({area:'note',kind:'proc',text,iconKey:itemId,color:'#ffd77a',procId:'item:'+itemId}))g.float?.(p.x,p.y-44,text,'#ffd77a');}
/** Schadensfaktor eines Gegners aus Waffenwirkungen (E-75 Gartenzwerg: eingeschüchtert = weniger Schaden). */
export const foeDamageFactor=e=>e?.cowed>0?1-(e.cowedBy||0):1;
/** Zählstand eines Zählauslösers ("jede dritte Kelle") – für die Anzeige auf der Leiste. */
export const procCount=(g,id)=>g.procState?.counts?.[id]||0;
export const procIds=cs=>Object.keys(cs).filter(k=>k.startsWith('proc:')&&cs[k]>0).map(k=>k.slice(5));
/** Löst alle Regeln mit diesem Auslöser aus; gibt die Zahl der gezündeten Procs zurück. */
export function fireProcs(g,trigger,cs,info={}){const st=g.procState||(g.procState=freshProcState());st.counts||(st.counts={});let fired=0;const p=g.player;
 for(const id of procIds(cs)){const r=PROC_RULES[id];if(!r||r.trigger!==trigger)continue;
  // Auslöser mit Kniff-Bindung (skillHit) zünden nur beim genannten Kniff; `every` zählt deterministisch mit.
  if(r.skill&&r.skill!==info.skill)continue;if(r.suit&&r.suit!==info.suit)continue;if(r.item&&r.item!==info.item)continue;/* E-72: Filter Kartenfarbe / Grillgut */if(r.zone&&![].concat(r.zone).some(z=>info.zones?.includes(z)))continue;/* zone: eine Art oder eine Liste (E-60) */
  if(r.every>1){const n=st.counts[id]=(st.counts[id]||0)+1;if(n%r.every)continue;}
  const chance=cs['talentProcChance:'+id]??r.chance;
  if(chance<1&&g.random()>=chance)continue;fired++;st.fired++;const until=g.time+r.window,leech=cs['talentProcLeech:'+id],ef=leech===undefined?r.effect:{...r.effect,heal:{damage:leech}};
  if(ef.free)st.free[ef.free]=until;if(ef.empower)st.empower[ef.empower]=until;if(ef.reset)g.cooldowns[ef.reset]=0;if(ef.energy)grantResource(g,ef.energy,'proc');if(ef.shield)addGuard(g,ef.shield,cs);if(ef.heal)healPlayer(g,typeof ef.heal==='number'?ef.heal:(info.damage||0)*ef.heal.damage,cs,false,{id:'proc:'+id,name:Object.values(TALENT_ROWS).flat().find(t=>t.effects?.['proc:'+id])?.name||METER_TEXT.proc},typeof ef.heal!=='number');if(ef.cdReduce)for(const c of [].concat(ef.cdReduce))if(c?.skill in g.cooldowns)g.cooldowns[c.skill]=Math.max(0,g.cooldowns[c.skill]-(c.seconds||0));if(ef.haste){st.haste=Math.max(st.haste,ef.haste);st.hasteUntil=until;}resourceProcEffect(g,ef,cs);if(ef.supply){const mm=mechanic(g);if(mm?.supply)M(g).supply=Math.min(mm.supply.max+(cs.supplyMax||0),M(g).supply+ef.supply);}if(ef.clean){const mm=mechanic(g);if(mm?.supply)M(g).clean=Math.max(M(g).clean,ef.clean);}
  if(r.glow&&(!ef.cdReduce||g.cooldowns[r.glow]<=0))st.glow[r.glow]=until;
    {const line=procVisual(r,g).label;if(!g.sct?.({area:'note',kind:'proc',text:line,icon:{set:'talents',spec:(id.match(/^(.*)-\d+$/)||[])[1]||'',index:Number((id.match(/-(\d+)$/)||[])[1]||0)},iconKey:'burst',color:'#ffd77a',procId:id}))g.float(p.x,p.y-44,line,'#ffd77a');}g.log('Proc · '+r.text);g.emit('proc',{id});emitCombatFx(g,'proc',p,{procId:id,...procVisual(r,g)});}
 return fired;}
/** E-72 Runde 4 (Kenner-Befund „Proc-Flut“): „Fällt dein Leben unter 35 %“ zündete bei JEDEM Treffer unter der Schwelle – fünfmal Deckung,
 *  fünf Chatzeilen. Jetzt einmal beim Unterschreiten; scharf wird die Regel erst wieder über der Schwelle (tickProcs) und frühestens nach
 *  der internen Abklingzeit (COMBAT_FLOW_TUNING.lowHealth.icd). → true = jetzt auslösen (und damit verbraucht). */
export function lowHealthReady(g){const p=g.player,T=COMBAT_FLOW_TUNING.lowHealth;if(!(p?.hp>0)||p.hp>=p.maxHp*T.below)return false;const st=g.procState||(g.procState=freshProcState());
 if(st.lowArmed===false||(g.time||0)<(st.lowNext||0))return false;st.lowArmed=false;st.lowNext=(g.time||0)+T.icd;return true;}
export const procFree=(g,id)=>(g.procState?.free[id]||0)>g.time;
export const procEmpowered=(g,id)=>(g.procState?.empower[id]||0)>g.time;
export const procGlow=(g,id)=>procFree(g,id)||procEmpowered(g,id)||(g.procState?.glow[id]||0)>g.time;
export function consumeProc(g,kind,id){const st=g.procState;if(!st||!(st[kind][id]>g.time))return false;delete st[kind][id];if(kind!=='glow')emitCombatFx(g,'proc-use',g.player,{skillId:id,signal:kind});return true;}
export function tickProcs(g){const st=g.procState;if(!st)return;st.counts||(st.counts={});/* Unter-35-%-Procs: wieder scharf, sobald das Leben über der Schwelle steht */if(!st.lowArmed&&g.player&&g.player.hp>=g.player.maxHp*COMBAT_FLOW_TUNING.lowHealth.below)st.lowArmed=true;for(const kind of ['free','empower','glow'])for(const k of Object.keys(st[kind]))if(st[kind][k]<=g.time)delete st[kind][k];if(st.hasteUntil<=g.time)st.haste=0;}
export const procHaste=g=>g.procState&&g.procState.hasteUntil>g.time?g.procState.haste:0;
export const activeProcChips=g=>{const st=g.procState;if(!st)return [];const names=id=>g.skills.find(s=>s.id===id)?.name||id;return [...Object.entries(st.free).filter(([,t])=>t>g.time).map(([id,t])=>names(id)+' gratis '+Math.ceil(t-g.time)+' s'),...Object.entries(st.empower).filter(([,t])=>t>g.time).map(([id,t])=>names(id)+' ×2 '+Math.ceil(t-g.time)+' s')];};
