import {KIOSK_ROOM as R,KIOSK_TEXT as T} from './content/index.js';
import {circleIntersectsBox} from './world-collision.js';
import {stepPlayer} from './movement.js';
import {tutorialActive} from './tutorial.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const kioskEntrance=g=>g.world.places?.kiosk?.entrance||g.world.places?.kiosk?.approach||null;
export const inKiosk=g=>g.instance?.id===R.id;
export const roomWorld={
 blocked(x,y,r=5){return !Number.isFinite(x)||!Number.isFinite(y)||x<16+r||x>R.width-16-r||y<20+r||y>R.height-16-r||R.furniture.some(b=>circleIntersectsBox(x,y,r,{minX:b.x,maxX:b.x+b.w,minY:b.y,maxY:b.y+b.h}));},
 lineClear(a,b){return this.walkClear(a,b,1);},
 walkClear(a,b,r=9){const n=Math.ceil(distance(a,b)/4);for(let i=0;i<=n;i++)if(this.blocked(a.x+(b.x-a.x)*i/(n||1),a.y+(b.y-a.y)*i/(n||1),r))return false;return true;},
 findPath(start,end){
  if(this.blocked(end.x,end.y,9))return [];if(this.blocked(start.x,start.y,9)&&!this.blocked(start.x,start.y,5)){for(let d=6;d<=24;d+=6)for(let a=0;a<Math.PI*2;a+=Math.PI/4){const safe={x:start.x+Math.cos(a)*d,y:start.y+Math.sin(a)*d};if(this.blocked(safe.x,safe.y,9)||!this.walkClear(start,safe,5))continue;const rest=this.findPath(safe,end);if(rest.length)return [safe,...rest];}return [];}if(this.walkClear(start,end))return [{...end}];
  const step=12,key=p=>Math.round(p.x/step)+','+Math.round(p.y/step),seed={x:Math.round(start.x/step)*step,y:Math.round(start.y/step)*step};
  if(!this.walkClear(start,seed))return [];const queue=[seed],prev=new Map([[key(seed),null]]),points=new Map([[key(seed),seed]]);let last=null;
  for(let i=0;i<queue.length&&i<1000;i++){const p=queue[i];if(this.walkClear(p,end)){last=p;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx*step,y:p.y+dy*step},k=key(q);if(prev.has(k)||!this.walkClear(p,q))continue;prev.set(k,key(p));points.set(k,q);queue.push(q);}}
  if(!last)return [];const path=[{...end}];for(let k=key(last);k;k=prev.get(k))path.unshift(points.get(k));let from=start;const result=[];while(path.length){let i=path.length-1;while(i>0&&!this.walkClear(from,path[i]))i--;from=path[i];result.push(from);path.splice(0,i+1);}return result;
 }
};
function stop(g){g.stopAuto();g.keys.clear();g.touchMove=null;g.moveTo=null;g.path=[];g.routeGoal=null;g.target=null;g.aiming=null;g.aimPoint=null;g.casting=null;g.player.vx=g.player.vy=0;g.player.moving=false;g.player.attack=g.player.dash=g.player.hurt=g.player.castPose=0;}
export function enterKiosk(g,saved=null){
 if(inKiosk(g))return false;const door=kioskEntrance(g);
 if(!door)return false;
 if(g.dead||g.paused||g.player.inCombat>0||g.casting||tutorialActive(g)){g.toast(T.cannotEnter);return false;}
 if(!saved&&(distance(g.player,door)>R.range||!g.world.lineClear(g.player,door))){g.toast(T.far);return false;}
 const position=saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&!roomWorld.blocked(saved.x,saved.y,9)?{x:saved.x,y:saved.y}:R.spawn;
 g.instance={id:R.id,outsidePosition:{...door,facing:g.player.facing||1},time:0};stop(g);Object.assign(g.player,position);g.fx=[];g.texts=[];g.emit('instanceChanged');g.emit('save');g.toast(T.welcome);return true;
}
export function leaveKiosk(g,force=false){
 if(!inKiosk(g)||(!force&&distance(g.player,R.exit)>R.range))return false;
 const point=g.instance.outsidePosition;stop(g);g.instance=null;Object.assign(g.player,point);g.emit('instanceChanged');g.emit('save');g.toast(T.outside);return true;
}
export function roomInteraction(g){
 if(distance(g.player,R.exit)<=R.range)return{kind:'leaveKiosk',point:R.exit,name:T.exit,priority:0};
 if(distance(g.player,R.service)<=R.range&&roomWorld.lineClear(g.player,R.service))return{kind:'shop',point:R.service,id:'kalle',name:T.counter,priority:0};return null;
}
export function tickKiosk(g,dt){
 g.instance.time+=dt;const p=g.player;let dx=(g.keys.has('d')||g.keys.has('arrowright')?1:0)-(g.keys.has('a')||g.keys.has('arrowleft')?1:0),dy=(g.keys.has('s')||g.keys.has('arrowdown')?1:0)-(g.keys.has('w')||g.keys.has('arrowup')?1:0);
 if(g.touchMove){dx=g.touchMove.x;dy=g.touchMove.y;}if(dx||dy){g.moveTo=null;g.path=[];g.routeGoal=null;}else if(g.moveTo){dx=g.moveTo.x-p.x;dy=g.moveTo.y-p.y;if(Math.hypot(dx,dy)<5){g.moveTo=g.path.shift()||null;if(!g.moveTo)g.routeGoal=null;dx=dy=0;}}
 stepPlayer(g,dx,dy,dt);
}
export const savedKiosk=g=>inKiosk(g)?{id:R.id,x:g.player.x,y:g.player.y}:null;
