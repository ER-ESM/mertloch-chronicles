export const WALK_FRAMES=8;
export function walkFrame(distance,stride=36){return Math.floor(Math.max(0,distance)/stride*WALK_FRAMES)%WALK_FRAMES;}
// Ignore tiny horizontal input noise when moving vertically. Preserve the last side.
export function walkFacing(dx,dy,last='se'){if(Math.hypot(dx,dy)<.0001)return last;const horizontal=Math.abs(dx)>Math.abs(dy)*.25?dx:0,vertical=Math.abs(dy)>Math.abs(dx)*.2?dy:0;return(vertical<0?'n':vertical>0?'s':last[0])+(horizontal<0?'w':horizontal>0?'e':last[1]);}
export function advanceVelocity(current,input,dt){const n=Math.hypot(input.x,input.y),strength=Math.min(1,n),target=n?{x:input.x/n*strength,y:input.y/n*strength}:{x:0,y:0},blend=1-Math.exp(-(n?22:32)*Math.max(0,dt)),v={x:current.x+(target.x-current.x)*blend,y:current.y+(target.y-current.y)*blend};if(Math.hypot(v.x,v.y)<.025)return{x:0,y:0};return v;}
