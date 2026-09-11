import {rng,distance} from './world.js';
/** Cosmetic inhabitants use collision-checked routes, but never obstruct the player. */
export class VillageLife{
  constructor(world){this.world=world;this.actors=[];this.time=0;this.random=rng((world.seed||0)+835);if(!world.nodes)return;
    const local=world.nodes.filter(n=>world.connected.has(n.id)&&distance(n,world.spawn)<2300);
    const choices=[...local.filter(n=>distance(n,world.spawn)<240),...local];
    for(let i=0;i<24;i++){const pool=i<6?choices.slice(0,local.filter(n=>distance(n,world.spawn)<240).length):local;const a=pool[Math.floor(this.random()*pool.length)];if(!a)continue;const near=local.filter(n=>distance(n,a)>70&&distance(n,a)<(i<6?300:520));const b=near[Math.floor(this.random()*near.length)];if(!b)continue;const route=world.findPath(a,b);if(!route.length)continue;this.actors.push({id:i,x:a.x,y:a.y,home:{x:a.x,y:a.y},route:route.map(p=>({x:p.x,y:p.y})),path:route.map(p=>({x:p.x,y:p.y})),wait:this.random()*4,speed:16+this.random()*11,kind:'villager',variant:i%8,facing:1,moving:false,bubble:0,cooldown:10+i});}
    for(let i=0;i<16;i++){const base=i<7?world.plaza:world.buildings.filter(b=>distance(b,world.spawn)<1600)[i*7%world.buildings.filter(b=>distance(b,world.spawn)<1600).length];if(!base)continue;const anchor={x:base.x+(this.random()-.5)*120,y:(base.maxY||base.y)+30+(this.random()-.5)*90};const start=world.findClear(anchor.x,anchor.y,7);const points=[];for(let j=0;j<4;j++){const dest={x:start.x+(this.random()-.5)*80,y:start.y+(this.random()-.5)*70};if(world.walkClear(start,dest,5))points.push(dest);}if(!points.length){for(let a=0;a<Math.PI*2;a+=.4){const dest={x:start.x+Math.cos(a)*12,y:start.y+Math.sin(a)*12};if(world.walkClear(start,dest,5)){points.push(dest);break;}}}if(!points.length)points.push({...start});this.actors.push({id:100+i,...start,home:start,route:points,path:[points[0]],wait:this.random()*5,speed:i%3===0?19:13,kind:i%5===0?'cat':'chicken',variant:i%3,facing:1,moving:false,bubble:0,cooldown:100});}
  }
  tick(dt,player){this.time+=dt;for(const a of this.actors){a.bubble=Math.max(0,a.bubble-dt);a.cooldown-=dt;a.moving=false;
    if(distance(a,player)<26){a.facing=player.x>a.x?1:-1;if(a.kind==='villager'&&a.cooldown<0){a.bubble=3;a.cooldown=25+this.random()*20;}continue;}
    if(a.wait>0){a.wait-=dt;continue;}
    let target=a.path[0];if(!target){a.wait=1.5+this.random()*4;const end=distance(a,a.home)>25?a.home:a.route.at(-1);a.path=this.world.findPath(a,end);if(!a.path.length)a.path=[a.home];continue;}
    const d=distance(a,target);if(d<2){a.path.shift();continue;}const step=Math.min(d,a.speed*dt),x=a.x+(target.x-a.x)/d*step,y=a.y+(target.y-a.y)/d*step;if(!this.world.blocked(x,y,4)){a.x=x;a.y=y;a.facing=target.x>a.x?1:-1;a.moving=true;}else{a.path=[];a.wait=2;}
  }}
}
export {drawComicResident as drawResident} from './comic-actors.js';
