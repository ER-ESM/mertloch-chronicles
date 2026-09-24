import {TUTORIAL as D} from './content/index.js';
import {makeEnemy} from './encounters.js';
import {distance} from './world.js';
import {ITEMS} from './rpg.js';
import {equipmentPlan} from './equipment.js';
export const tutorialActive=g=>!!g.tutorial&&!g.tutorial.completed;
export function savedTutorial(g){const t=g.tutorial;return t?{version:D.version,completed:t.completed,step:t.step,hits:t.hits,autos:t.autos,bagSpawned:t.bagSpawned}:undefined;}
/** P8 (Playtest Akt 1): Kein Schritt darf sich ohne Eingabe erledigen. `gate` sperrt den Tick, in dem ein Schritt
 *  beginnt – erst der nächste Tick darf ihn abschließen. Damit kann keine Bedingung aus dem vorigen Schritt
 *  durchschlagen und zwei Schritte auf einmal überspringen. */
const GATE=1;
// Choose an accessible paved clearing, including visual room beneath tree canopies.
// Mitte der Hofprobe: die Bude (E-52), in älteren oder künstlichen Welten der Spawn.
export const tutorialCenter=w=>w.start||w.spawn;
function point(g,offset){
 const w=g.world,r=D.placement,preferred={x:w.spawn.x+offset.x,y:w.spawn.y+offset.y},candidates=[preferred];
 if(w.plaza)for(let y=-r.searchRadius;y<=r.searchRadius;y+=r.grid)for(let x=-r.searchRadius;x<=r.searchRadius;x+=r.grid)candidates.push({x:w.plaza.x+x,y:w.plaza.y+y});
 candidates.sort((a,b)=>distance(a,preferred)-distance(b,preferred));
 for(const p of candidates){if(distance(p,w.spawn)>=D.radius||w.blocked(p.x,p.y,r.collision))continue;
  if(w.plaza&&distance(p,w.plaza)>w.plaza.radius-r.plazaInset)continue;
  if((w.trees||[]).some(t=>Math.abs(p.x-t.x)<r.treeHalfWidth*(t.size||1)&&p.y<t.y+r.treeFoot&&p.y>t.y-r.treeHeight*(t.size||1)))continue;
  if([w.npc,w.shrine].filter(Boolean).some(o=>distance(p,o)<r.personSpace))continue;
  if((w.props||[]).some(o=>['cart','bench','lantern'].includes(o.type)&&distance(p,o)<r.propSpace))continue;
  if(w.findPath(w.spawn,p).length)return p;
 }
 try{return w.findClear(w.spawn.x,w.spawn.y,9);}catch{return {...w.spawn};}
}
export function initTutorial(g,saved,enabled=false){
 const old=saved.tutorial;if(!old&&!enabled)return;
 const completed=old?!!old.completed:!!saved.version;
 // The film-break opening precedes Ida's equipment handover. Never undress a save.
 if(enabled&&!saved.version&&!saved.rpg){for(const slot of Object.keys(g.rpg.equipment))g.rpg.equipment[slot]=null;g.refreshStats();}
 g.tutorial={completed,step:Number.isInteger(old?.step)?Math.max(0,Math.min(D.steps.length-1,old.step)):0,hits:Math.max(0,Math.min(D.hits,Number(old?.hits)||0)),autos:Math.max(0,Math.min(D.autos,Number(old?.autos)||0)),bagSpawned:!!old?.bagSpawned,clock:D.castPause};
 if(completed)return;const t=g.tutorial,home=g.world.base?.house?.spots;
 // In der Bude stehen Laufmarke und Papp-Horst an festen Plätzen (content/bude-house.js), sonst sucht point() am Kirchvorplatz.
 t.course=home?.course?{...home.course}:point(g,D.course);t.dummy=home?.dummy?{...home.dummy}:point(g,D.dummy);
 const center=tutorialCenter(g.world);if(distance(g.player,center)>D.radius)Object.assign(g.player,{x:center.x,y:center.y});t.last={x:g.player.x,y:g.player.y};ensureProps(g);
}
function ensureProps(g){const t=g.tutorial;if(t.step>=2&&t.step<=4&&!g.enemies.some(e=>e.tutorial)){g.enemies.push(makeEnemy(t.dummy,D.enemy.id,D.enemy));}
 if(t.step===5&&!t.bagSpawned){g.rpg.loot.push({...structuredClone(D.loot),...t.dummy});t.bagSpawned=true;}
}
function advance(g){const t=g.tutorial;t.step++;t.clock=D.castPause;t.dash=false;t.gate=GATE;t.tries=0;t.hits=0;t.autos=0;g.autoAttack.enabled=false;g.player.inCombat=0;g.target=null;for(const e of g.enemies)if(e.tutorial){e.aggro=false;e.ai='roaming';e.cast=null;}if(t.step>4)g.enemies=g.enemies.filter(e=>!e.tutorial);ensureProps(g);g.emit('tutorialStep');g.emit('save');}
export function tutorialConfirm(g){if(!tutorialActive(g)||g.dead||g.paused||distance(g.player,g.world.npc)>=D.talkRange)return false;const t=g.tutorial;if(t.step===0){
 for(const [slot,id]of Object.entries(D.starterEquipment))if(!g.rpg.equipment[slot]){const plan=equipmentPlan(g.rpg.equipment,ITEMS,id,slot);if(!plan.error&&!plan.displaced.length)g.rpg.equipment=plan.next;}
 g.refreshStats();advance(g);return true;
 }if(t.step===7){t.completed=true;g.player.inCombat=0;g.gainXp(D.rewardXp);g.toast(D.done);g.emit('tutorialStep');g.emit('save');return true;}return false;}
export function tutorialSignal(g,type){if(!tutorialActive(g))return;const t=g.tutorial;if(type==='inventory'&&t.step===6)advance(g);if(type==='dash'&&t.step===4&&g.enemies.find(e=>e.tutorial)?.cast)t.dash=true;}
export function tutorialDamage(g,e,n,label){if(!tutorialActive(g)||!e.tutorial)return 0;const t=g.tutorial;if(t.step!==3)return 0;const amount=Math.max(0,Math.round(n));e.hp=Math.max(1,e.hp-amount);g.float(e.x,e.y-30,String(amount),'#f4d993');if(label==='Autoangriff')t.autos=Math.min(D.autos,t.autos+1);else if(label==='Kelle')t.hits=Math.min(D.hits,t.hits+1);g.emit('save');return amount;}
export function tutorialDestination(g){if(!tutorialActive(g))return null;const t=g.tutorial;return {point:t.step===0||t.step===7?g.world.npc:t.step===1?t.course:t.dummy,label:D.steps[t.step].title};}
export function tutorialAllowsTravel(g,p){if(!tutorialActive(g)||distance(p,tutorialCenter(g.world))<=D.radius)return true;if(!g.tutorial.warnAt||g.time>g.tutorial.warnAt){g.toast(D.boundary);g.tutorial.warnAt=g.time+D.warningPause;}return false;}
export function tickTutorial(g,dt){if(!tutorialActive(g))return;const t=g.tutorial,p=g.player;
 if(!tutorialAllowsTravel(g,p)){Object.assign(p,t.last,{vx:0,vy:0,moving:false});g.moveTo=null;g.path=[];g.routeGoal=null;}else t.last={x:p.x,y:p.y};
 if(t.gate>0){t.gate--;return;}
 if(t.step===1&&distance(p,t.course)<D.reach)advance(g);
 else if(t.step===2&&g.target?.tutorial){advance(g);g.target=g.enemies.find(e=>e.tutorial);}
 else if(t.step===3&&t.hits>=D.hits&&t.autos>=D.autos){advance(g);g.target=g.enemies.find(e=>e.tutorial);}
 else if(t.step===4){const e=g.enemies.find(e=>e.tutorial);if(!e)return;if(e.cast){e.cast.remaining-=dt;if(e.cast.remaining<=0){const avoided=distance(p,e.cast)>=e.cast.radius||p.invulnerable>0;e.cast=null;/* klare Rückmeldung je Versuch (Runde 2b, Neuling-Befund 6) */if(avoided&&t.dash){g.toast(D.dodged);advance(g);return;}t.tries=(t.tries||0)+1;const why=avoided?D.walked:D.late;t.dash=false;t.clock=D.castPause;if(t.tries>=D.maxDodgeTries){g.toast(D.giveUp);advance(g);return;}g.toast(why);}}else if((t.clock-=dt)<=0){/* der erste Kreis steht länger (Runde 2b) */const cast=t.tries?D.castTime:(D.firstCastTime||D.castTime);e.cast={name:D.cast,total:cast,remaining:cast,ground:true,x:p.x,y:p.y,radius:D.radiusAttack};t.dash=false;}}
 else if(t.step===5&&t.bagSpawned&&!g.rpg.loot.some(b=>b.id===D.loot.id))advance(g);
}
