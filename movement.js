export const WALK_SPEED=122,COMBAT_SPEED=96;
// Exponential acceleration is independent of framerate; braking is quicker than starting.
export function stepPlayer(game,dx,dy,dt){const p=game.player,requested=!!(dx||dy),len=Math.hypot(dx,dy)||1,speed=(p.inCombat>0?COMBAT_SPEED:WALK_SPEED)*(game.touchMove?Math.min(1,len):1);
 const alpha=1-Math.exp(-(requested?13:24)*dt);p.vx=(p.vx||0)+(dx/len*speed-(p.vx||0))*alpha;p.vy=(p.vy||0)+(dy/len*speed-(p.vy||0))*alpha;
 if(!requested&&Math.hypot(p.vx,p.vy)<1)p.vx=p.vy=0;
 let mx=p.vx*dt,my=p.vy*dt;if(game.moveTo){const d=Math.hypot(game.moveTo.x-p.x,game.moveTo.y-p.y),n=Math.hypot(mx,my);if(n>d){mx*=d/n;my*=d/n;}}
 const before={x:p.x,y:p.y};game.move(p,mx,my);const travelled=Math.hypot(p.x-before.x,p.y-before.y);p.walkDistance=(p.walkDistance||0)+travelled;p.moving=travelled>.05;
 if(Math.abs(dx)>.08)p.facing=dx>0?1:-1;
 if(requested&&travelled<.001&&Math.hypot(p.vx,p.vy)>20){game.moveTo=null;p.vx=p.vy=0;}
}
