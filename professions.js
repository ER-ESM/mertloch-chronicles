import {PROFESSION_RULES as R,PROFESSION_UI as T,PROFESSION_SOURCES as SRC} from './content/index.js';
import {restoreProfessions,professionPlan,resourcePhase,actionSite,actionName,actionDuration} from './profession-rules.js';
import {professionWorld} from './profession-world.js';
import {placeUsables} from './rpg.js';
export function initProfessions(g,raw){g.professions=restoreProfessions(raw);g.professionCast=null;g.professionCommit=false;g.professionNodes={};}
export const savedProfessions=g=>structuredClone(restoreProfessions(g.professions));
export function professionReason(g,site){if(g.dead||g.player.hp<=0||g.player.inCombat>0||g.autoAttack?.enabled||g.casting||g.activity||g.aiming||g.paused)return T.combat;if(g.instance)return T.room;if(!site||Math.hypot(g.player.x-site.x,g.player.y-site.y)>R.range||!g.world.lineClear(g.player,site))return T.range;return '';}
const moving=g=>!!g.moveTo||!!(g.touchMove?.x||g.touchMove?.y)||['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>g.keys.has(k));
export function cancelProfession(g){if(!g.professionCast)return false;g.professionCast=null;g.professionCancel?.();g.toast(T.cancelled);return true;}
export function tickProfession(g,dt){const c=g.professionCast;if(!c)return;if(professionReason(g,c.site)||moving(g)||Math.hypot(g.player.x-c.x,g.player.y-c.y)>.5){cancelProfession(g);return;}c.remaining=Math.max(0,c.remaining-dt);if(!c.remaining){g.professionCast=null;g.professionFinish?.(c);}}
export function nodeStatus(g,node,now=Date.now()){if(g.professionOnline)return g.professionNodes[node.id]||{phase:'loading'};const raw=g.professions.solo[node.id]||{},p=resourcePhase(raw,now);return {...p,spent:raw.claimed===p.cycle};}
export function professionTarget(g,point=null){if(g.instance||g.tutorial&&!g.tutorial.completed)return null;const l=professionWorld(g.world),p=point||g.player;return [...l.stations,...l.nodes].filter(n=>Math.hypot(n.x-p.x,n.y-(point?p.y+(n.type==='professionStation'?16:4):p.y))<(point?(n.type==='professionStation'?38:22):R.range)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;}
/** Host owns transport and durable browser storage. No local fallback for an online-linked hero. */
export function mountProfessions(host){
 let pending=null,polling=false,lastPoll=0,beginning=false;
 const g=host.game;
 function mode(){const online=host.online();g().professionOnline=!!online?.account||g().professions.online;return online;}
 function notify(){host.refresh?.();}
 async function poll(){const game=g(),online=mode();if(polling||game.professionCommit||!game.professionOnline||Date.now()-lastPoll<R.pollMs)return;if(!online?.account||!online.state.connected){game.professionStatus=T.offline;return;}lastPoll=Date.now();polling=true;try{const r=await online.profession({op:'state'});if(game!==g())return;if(r.error)throw Error(r.error);game.professionNodes=r.nodes;game.professionStatus=T.online;}catch{game.professionStatus=T.offline;}finally{polling=false;notify();}}
 function apply(game,save){if(game!==g())return;host.write(save);game.rpg.inventory=structuredClone(save.rpg.inventory);game.rpg.coins=save.rpg.coins;game.professions=restoreProfessions(save.professions);placeUsables(game,game.rpg.inventory.map(e=>e.id));game.professionCommit=false;pending=null;host.lock(false);game.emit('rpgChanged');game.emit('save');game.toast(T.done);lastPoll=0;notify();}
 async function retry(){if(!pending)return;const p=pending;if(p.busy)return;p.busy=true;try{const r=await p.online.profession(p.body);if(p.game!==g())return;if(r.stale&&r.server?.save){host.pull(r.server.save);return;}if(r.error){p.game.professionCommit=false;pending=null;host.lock(false);p.game.toast(r.error);return;}apply(p.game,r.save);}catch{host.lock(true,T.locked,retry);}finally{p.busy=false;notify();}}
 function finish(c){const game=g();if(professionReason(game,c.site)){game.toast(T.cancelled);return;}const snapshot={...game.save(),savedAt:Date.now()};
  if(c.online){game.professionCommit=true;pending={game,online:c.online,body:{op:'finish',id:c.id,token:c.token,save:snapshot}};host.lock(true,T.pending);retry();return;}
  const phase=c.action.kind==='gather'?nodeStatus(game,c.site):null;if(phase&&(phase.spent||phase.cycle!==c.cycle||phase.phase==='empty')){game.toast(T.expired);return;}const plan=professionPlan(snapshot,c.action);if(plan.error){game.toast(plan.error);return;}
  if(phase)plan.professions.solo[c.site.id]={cycle:phase.cycle,opened:phase.opened||Date.now(),claimed:phase.cycle};try{apply(game,{...snapshot,...plan});}catch{game.toast(T.full);}
 }
 async function start(action){const game=g(),online=mode();if(game.professionCast||game.professionCommit||beginning)return false;const site=actionSite(professionWorld(game.world),action);if(action.kind==='gather')action={...action,target:site?.kind};const error=professionReason(game,site)||(moving(game)?T.moving:'')||professionPlan(game.save(),action).error;if(error){game.toast(error);return false;}
  if(game.professionOnline&&(!online?.account||!online?.state.connected)){game.toast(T.offline);return false;}const phase=action.kind==='gather'?nodeStatus(game,site):null;if(phase&&(phase.spent||phase.phase==='empty')){game.toast(phase.spent?T.harvested:T.expired);return false;}
  game.dismount();game.player.moving=false;game.player.vx=game.player.vy=0;const c={action,site,x:game.player.x,y:game.player.y,cycle:phase?.cycle,id:crypto.randomUUID(),name:actionName(action),total:actionDuration(action),remaining:actionDuration(action),online:game.professionOnline?online:null};
  game.professionFinish=finish;game.professionCancel=()=>{if(c.online)c.online.profession({op:'cancel'}).catch(()=>{});};
  if(c.online){beginning=true;try{const r=await online.profession({op:'begin',id:c.id,action,save:{...game.save(),savedAt:Date.now()}});if(r.stale&&r.server?.save){host.pull(r.server.save);return false;}if(r.error){game.toast(r.error);return false;}c.token=r.token;if(game!==g()||professionReason(game,site)||moving(game)||Math.hypot(game.player.x-c.x,game.player.y-c.y)>.5){game.professionCancel();return false;}}catch{game.toast(T.offline);return false;}finally{beginning=false;}}
  if(c.total)game.professionCast=c;else finish(c);notify();return true;
 }
 return {start,poll,retry};
}
