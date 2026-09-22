import {MOUNTS} from './content/index.js';
import {mountSpeed} from './mounts.js';
export const WALK_SPEED=122,COMBAT_SPEED=96;
// P6 (Playtest Akt 1): Ein Laufbefehl gilt bis zum Klickpunkt. Bleibt der Schritt an einer Kante hängen, wird der
// Laufweg zuerst neu berechnet (ROUTE_RETRY) und erst nach ROUTE_GIVEUP ganz aufgegeben – vorher warf schon der erste
// blockierte Schritt den kompletten Rest des Weges weg, weshalb je Klick nur ein kurzes Stück gelaufen wurde.
export const ROUTE_RETRY=.3,ROUTE_GIVEUP=1.4;
// Exponential acceleration is independent of framerate; braking is quicker than starting.
export function stepPlayer(game,dx,dy,dt){const p=game.player,requested=!!(dx||dy),len=Math.hypot(dx,dy)||1,speed=(p.mount&&Object.hasOwn(MOUNTS,p.mount)?WALK_SPEED*mountSpeed(game):p.inCombat>0?COMBAT_SPEED:WALK_SPEED)*(game.touchMove?Math.min(1,len):1);
 const alpha=1-Math.exp(-(requested?13:24)*dt);p.vx=(p.vx||0)+(dx/len*speed-(p.vx||0))*alpha;p.vy=(p.vy||0)+(dy/len*speed-(p.vy||0))*alpha;
 if(!requested&&Math.hypot(p.vx,p.vy)<1)p.vx=p.vy=0;
 let mx=p.vx*dt,my=p.vy*dt;if(game.moveTo){const d=Math.hypot(game.moveTo.x-p.x,game.moveTo.y-p.y),n=Math.hypot(mx,my);if(n>d){mx*=d/n;my*=d/n;}}
 const before={x:p.x,y:p.y};game.move(p,mx,my);const travelled=Math.hypot(p.x-before.x,p.y-before.y),moving=dt>0&&travelled/dt>2;
 // Restart on a contact pose, without changing the measured distance or speed.
 // A speed threshold keeps start/stop detection consistent at 30–144 Hz.
 if(moving&&!p.moving)p.walkStartDistance=p.walkDistance||0;
 p.walkDistance=(p.walkDistance||0)+travelled;p.moving=moving;
 if(Math.abs(dx)>.08)p.facing=dx>0?1:-1;
 if(!game.moveTo){game.routeStuck=0;game.routeRetried=false;return;}
 if(travelled>.05){game.routeStuck=0;game.routeRetried=false;return;}
 game.routeStuck=(game.routeStuck||0)+dt;
 if(game.routeStuck>=ROUTE_GIVEUP){game.routeStuck=0;game.moveTo=null;game.path=[];game.routeGoal=null;p.vx=p.vy=0;game.toast?.('Der Weg ist blockiert. Wähle einen anderen Laufweg.');return;}
 if(game.routeStuck>=ROUTE_RETRY&&!game.routeRetried){game.routeRetried=true;p.vx=p.vy=0;game.repath?.();}
}
