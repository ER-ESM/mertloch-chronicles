// Position belongs to a generated world. Old saves continue at its spawn.
const spawnPosition=world=>({x:world.spawn.x,y:world.spawn.y,facing:1});
export function restorePosition(world,saved){
 const p=saved.position,fallback=spawnPosition(world);
 if(saved.worldKey!==world.id||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return fallback;
 const inBounds=p=>p.x>=0&&p.y>=0&&(!Number.isFinite(world.width)||p.x<=world.width)&&(!Number.isFinite(world.height)||p.y<=world.height);
 if(!inBounds(p))return fallback;
 let point={x:p.x,y:p.y};
 try{
  if(world.blocked(point.x,point.y,5))point=world.findClear(point.x,point.y,5);
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||!inBounds(point)||world.blocked(point.x,point.y,5))return fallback;
 }catch{return fallback;}
 return {...point,facing:p.facing===-1?-1:1};
}
export function savedPosition(game){
 return game.dead?spawnPosition(game.world):{x:game.player.x,y:game.player.y,facing:game.player.facing===-1?-1:1};
}
