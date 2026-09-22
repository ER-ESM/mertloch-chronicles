import {MOUNTS,MOUNT_RULES as R,MOUNT_UI as T} from './content/index.js';
import {consumeMaterials,countItem} from './rpg.js';
import {reservedCount} from './shop.js';
import {tutorialActive} from './tutorial.js';
const stations=new WeakMap();
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const mountDefinition=id=>typeof id==='string'&&Object.hasOwn(MOUNTS,id)?MOUNTS[id]:null;
export function restoreMounts(raw){const owned=[...new Set((Array.isArray(raw?.owned)?raw.owned:[]).filter(id=>mountDefinition(id)))];return {version:1,ridingSkill:raw?.ridingSkill===true,owned,selected:owned.includes(raw?.selected)?raw.selected:owned[0]||null};}
export function initMounts(g,raw){g.mounts=restoreMounts(raw);g.player.mount=null;g.mountCast=null;}
export const savedMounts=g=>restoreMounts(g.mounts);
export const mountSpeed=g=>g.mounts?.ridingSkill===true?R.ridingSkill.speed:R.speed;
export const mountSpeedBonus=g=>Math.round((mountSpeed(g)-1)*100);
export function ridingSkillReason(g){
 if(g.mounts.ridingSkill)return '';
 const reason=mountUnavailable(g)||(g.mountCast?T.busy:'');if(reason)return reason;
 if(g.player.level<R.ridingSkill.level)return T.level(R.ridingSkill.level);
 const point=mountStation(g.world);if(distance(g.player,point)>R.range||!g.world.lineClear(g.player,point))return T.far;
 return g.rpg.coins<R.ridingSkill.coins?T.money:'';
}
export function learnRiding(g){
 if(g.mounts.ridingSkill)return true;
 const reason=ridingSkillReason(g);if(reason){g.toast(reason);return false;}
 g.rpg.coins-=R.ridingSkill.coins;g.mounts.ridingSkill=true;
 g.emit('rpgChanged');g.emit('barChanged');g.emit('mountChanged');g.emit('save');g.toast(T.ridingUnlocked);return true;
}
export function mountStation(world){
 if(stations.has(world))return stations.get(world);
 const wanted={x:world.spawn.x+R.stationOffset.x,y:world.spawn.y+R.stationOffset.y};
 const candidates=[wanted];for(let radius=30;radius<=240;radius+=30)for(let i=0;i<16;i++)candidates.push({x:wanted.x+Math.cos(i*Math.PI/8)*radius,y:wanted.y+Math.sin(i*Math.PI/8)*radius});
 const actors=[world.npc,world.shrine,...(world.mentors||[])].filter(Boolean);
 const clear=p=>!world.blocked?.(p.x,p.y,58)&&actors.every(a=>distance(a,p)>65)&&(world.trees||[]).every(t=>Math.abs(t.x-p.x)>90*(t.size||1)||t.y<p.y-50||t.y>p.y+95*(t.size||1));
 // Display mounts and the approach must fit together, including foreground tree canopies.
 const point=candidates.find(p=>clear(p)&&world.findPath(world.spawn,p).length)||world.findClear?.(wanted.x,wanted.y,18)||{...world.spawn};
 stations.set(world,point);return point;
}
export function mountUnavailable(g){
 if(g.dead||g.player.hp<=0)return T.dead;if(g.paused)return T.paused;if(g.instance)return T.inside;
 if(tutorialActive(g))return T.tutorial;
 if(g.player.inCombat>0||g.autoAttack?.enabled||g.enemies.some(e=>e.hp>0&&e.aggro&&e.ai!=='returning'&&!e.remoteTarget))return T.combat;
 if(g.casting||g.activity||g.aiming||g.professionCast||g.professionCommit)return T.busy;return '';
}
export function acquisitionReason(g,id){const d=mountDefinition(id);if(!d)return T.invalid;if(g.mounts.owned.includes(id))return '';
 const reason=mountUnavailable(g)||(g.mountCast?T.busy:'');if(reason)return reason;if(g.player.level<d.level)return T.level(d.level);
 const point=mountStation(g.world);if(distance(g.player,point)>R.range||!g.world.lineClear(g.player,point))return T.far;
 if(g.rpg.coins<d.coins)return T.money;
 if(Object.entries(d.materials).some(([item,n])=>countItem(g.rpg,item)-reservedCount(g,item)<n))return T.missing;return '';
}
export function acquireMount(g,id){if(g.mounts.owned.includes(id))return true;const reason=acquisitionReason(g,id);if(reason){g.toast(reason);return false;}
 const d=MOUNTS[id];if(!consumeMaterials(g.rpg,d.materials))return false;g.rpg.coins-=d.coins;g.mounts.owned.push(id);g.mounts.selected=id;
 g.emit('rpgChanged');g.emit('barChanged');g.emit('save');g.toast(T.unlocked(d.name));return true;
}
export function selectMount(g,id){if(!g.mounts.owned.includes(id))return false;g.mounts.selected=id;g.emit('save');g.emit('barChanged');return true;}
export function dismount(g,announce=false){const had=!!(g.player.mount||g.mountCast);g.player.mount=null;g.mountCast=null;if(had){g.player.vx=g.player.vy=0;g.emit('mountChanged');if(announce)g.toast(T.cancelled);}return had;}
const moving=g=>!!g.moveTo||!!(g.touchMove?.x||g.touchMove?.y)||['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>g.keys.has(k));
export function toggleMount(g,id=g.mounts.selected){
 if(g.player.mount||g.mountCast)return dismount(g);
 const reason=mountUnavailable(g)||(!g.mounts.owned.includes(id)?T.empty:moving(g)?T.moving:'');if(reason){g.toast(reason);return false;}
 g.player.vx=g.player.vy=0;g.player.moving=false;g.mountCast={id,remaining:R.castSeconds,total:R.castSeconds,name:T.casting(MOUNTS[id].name),x:g.player.x,y:g.player.y};g.emit('mountChanged');return true;
}
export function tickMount(g,dt){
 if(g.player.mount&&(g.dead||g.instance||g.player.hp<=0))dismount(g);
 const cast=g.mountCast;if(!cast)return;
 if(mountUnavailable(g)||moving(g)||distance(g.player,cast)>.5){dismount(g,true);return;}
 cast.remaining-=dt;if(cast.remaining>0)return;
 g.player.mount=cast.id;g.mountCast=null;g.emit('mountChanged');g.emit('sound',{id:MOUNTS[cast.id].kind==='horse'?'mount-horse':'mount-motor'});
}
