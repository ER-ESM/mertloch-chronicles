// Position belongs to a generated world. New heroes and saves from another world start where the world says:
// in der Bude (E-52, `world.start`), sonst am Spawn. Wer stirbt, steht weiterhin am Spawn auf.
const spawnPosition=world=>({x:world.spawn.x,y:world.spawn.y,facing:1});
const startPosition=world=>world.start?{x:world.start.x,y:world.start.y,facing:1}:spawnPosition(world);
export function restorePosition(world,saved){
 const p=saved.position,fallback=startPosition(world);
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
 if(game.instance?.outsidePosition)return {...game.instance.outsidePosition};
 return game.dead?spawnPosition(game.world):{x:game.player.x,y:game.player.y,facing:game.player.facing===-1?-1:1};
}
