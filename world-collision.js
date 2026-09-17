// Feet are a circle in world space. Roof overhangs never become invisible walls.
export function circleIntersectsBox(x,y,r,b){
  if(x>b.minX&&x<b.maxX&&y>b.minY&&y<b.maxY)return true;
  const dx=Math.max(b.minX-x,0,x-b.maxX),dy=Math.max(b.minY-y,0,y-b.maxY);
  return dx*dx+dy*dy<r*r;
}

// Subdivide displacement, including dashes/knockback: an unblocked endpoint alone
// does not prove that the route is clear. Independent axes preserve wall sliding.
export function moveWithCollisions(world,entity,dx,dy,radius=5){
  if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
  const count=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2.5));
  const sx=dx/count,sy=dy/count;
  for(let i=0;i<count;i++){
    if(sx&&!world.blocked(entity.x+sx,entity.y,radius))entity.x+=sx;
    if(sy&&!world.blocked(entity.x,entity.y+sy,radius))entity.y+=sy;
  }
}
