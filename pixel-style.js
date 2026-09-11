// MAIFELD-MÄRCHEN: plum ink, honey light, cel shadows and deliberately placed pixels.
// Geometry is drawn on the half-world-pixel grid; object scale stays in world units.
export const PALETTE=Object.freeze({ink:'#293b44',softInk:'#495560',cream:'#ebd9a4',paper:'#cbb782',gold:'#ecb95c',coral:'#e18569',rust:'#ad5260',teal:'#429d96',blue:'#628eb3',leaf:'#78a865',deepLeaf:'#395f58',shadow:'#304951'});
export const snap=n=>Math.round(n*2)/2;
export function box(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(snap(x),snap(y),snap(w),snap(h));}
export function shape(c,color,points,ink=null,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(snap(x),snap(y)):c.moveTo(snap(x),snap(y)));c.closePath();c.fillStyle=color;c.fill();if(ink){c.strokeStyle=ink;c.lineWidth=width;c.lineJoin='bevel';c.stroke();}}
// Scanline ellipses give leaves, cheeks and stones crisp stepped silhouettes.
export function oval(c,color,x,y,rx,ry){for(let row=Math.ceil(-ry*2);row<=Math.floor(ry*2);row++){const dy=row/2,span=Math.sqrt(Math.max(0,1-dy*dy/(ry*ry)))*rx;box(c,color,x-span,y+dy,span*2,.5);}}
export function line(c,color,points,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(snap(x),snap(y)):c.moveTo(snap(x),snap(y)));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.lineCap='square';c.stroke();}
export function framed(c,color,x,y,w,h,ink=PALETTE.ink,thickness=1){box(c,ink,x-thickness,y-thickness,w+thickness*2,h+thickness*2);box(c,color,x,y,w,h);if(w>=12&&h>=7){for(let i=0;i<Math.min(10,w/3);i++){const xx=x+2+(i*17)%(w-4),yy=y+2+(i*7)%(h-4);box(c,i%3?'#213b421a':'#f2dca62b',xx,yy,Math.min(3+(i%3),x+w-xx-1),.5);}}}
export function sprig(c,x,y,color=PALETTE.leaf,size=1){line(c,'#397b60',[[x,y],[x-1*size,y-7*size]],.75);shape(c,color,[[x,y-2*size],[x-5*size,y-5*size],[x-4*size,y-7*size],[x-1*size,y-5*size]]);shape(c,color,[[x-1*size,y-4*size],[x+2*size,y-8*size],[x+5*size,y-7*size],[x+1*size,y-4*size]]);box(c,'#bad780',x-3*size,y-6*size,1.5*size,.5);}
export function blossom(c,x,y,color=PALETTE.coral,size=1){box(c,'#3e654f',x-.5,y,1,5*size);for(const [dx,dy]of [[-2,0],[1,0],[0,-2],[0,1]])box(c,color,x+dx*size,y+dy*size,2*size,2*size);box(c,PALETTE.cream,x,y,1*size,1*size);}
export function spark(c,x,y,color=PALETTE.cream){box(c,color,x,y-2,.5,4);box(c,color,x-1.5,y,3.5,.5);}
export const STYLE={name:'Maifeld · Tiny Swords',version:2,outline:PALETTE.ink,worldPixelDensity:2};
