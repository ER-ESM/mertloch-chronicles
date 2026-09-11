import {fillMaifeldGround} from './maifeld-art.js';
import {groundDetails} from './world-details.js';
import {shape as comicShape,box,oval} from './pixel-style.js';
import {rng} from './world.js';
export const TERRAIN_SIZE=512;
export const DETAIL=2;
const canvas=()=>{const c=document.createElement('canvas');c.width=c.height=TERRAIN_SIZE*DETAIL;return c;};
const hash=(x,y)=>{let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function shape(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}
/** Corners soften inside the existing corridor, without displacing junction ends. */
export function roadPath(c,points,corner=7){if(!points.length)return;c.beginPath();c.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++){const p=points[i],a=points[i-1],b=points[i+1],d1=Math.hypot(p.x-a.x,p.y-a.y)||1,d2=Math.hypot(b.x-p.x,b.y-p.y)||1,r=Math.min(corner,d1*.22,d2*.22);c.lineTo(p.x+(a.x-p.x)/d1*r,p.y+(a.y-p.y)/d1*r);c.quadraticCurveTo(p.x,p.y,p.x+(b.x-p.x)/d2*r,p.y+(b.y-p.y)/d2*r);}if(points.length>1){const end=points.at(-1);c.lineTo(end.x,end.y);}}
function roadMask(world,roads,ox,oy,pad=0,filter=()=>true,feather=1.4){const border=16,cv=document.createElement('canvas');cv.width=cv.height=(TERRAIN_SIZE+border*2)*DETAIL;const c=cv.getContext('2d');c.scale(DETAIL,DETAIL);c.translate(-ox+border,-oy+border);c.lineCap='round';c.lineJoin='round';c.strokeStyle='#fff';c.fillStyle='#fff';for(const r of roads){if(!filter(r))continue;roadPath(c,r.points,Math.min(20,r.width*.28));c.lineWidth=r.width+pad*2;c.stroke();}const p=world.plaza;if(p&&filter({width:60,plaza:true,tags:{}})){c.beginPath();c.ellipse(p.x,p.y,p.radius+pad,(p.radius+pad)*.8,0,0,Math.PI*2);c.fill();}const output=canvas(),oc=output.getContext('2d');oc.filter=`blur(${feather*DETAIL}px)`;oc.drawImage(cv,-border*DETAIL,-border*DETAIL);oc.filter='none';return output;}
function paintMask(mask,ox,oy,draw){const c=mask.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#b0aa8d';c.fillRect(0,0,mask.width,mask.height);c.globalCompositeOperation='source-atop';c.setTransform(DETAIL,0,0,DETAIL,-ox*DETAIL,-oy*DETAIL);draw(c);c.globalCompositeOperation='source-over';return mask;}
export function createTerrainChunk(world,gx,gy){
  const cv=canvas(),c=cv.getContext('2d',{alpha:false}),ox=gx*TERRAIN_SIZE,oy=gy*TERRAIN_SIZE,S=TERRAIN_SIZE,random=rng(gx*991+gy*317+world.seed),roads=world.roads.filter(r=>r.maxX>ox-96&&r.minX<ox+S+96&&r.maxY>oy-96&&r.minY<oy+S+96);
  c.scale(DETAIL,DETAIL);c.translate(-ox,-oy);rect(c,'#8ba767',ox,oy,S,S);
  for(const a of world.areas){if(a.maxX<ox-14||a.minX>ox+S+14||a.maxY<oy-14||a.minY>oy+S+14)continue;const t=a.tags;const color=t.landuse==='farmland'?'#b8af70':t.landuse==='residential'?'#8ba767':t.landuse==='forest'||t.natural==='wood'?'#5d865f':t.landuse==='meadow'||t.landuse==='grass'?'#a5b977':t.natural==='water'?'#66b9b4':t.landuse==='cemetery'?'#78966d':'#8ba767';c.save();c.filter='blur(9px)';shape(c,a.points);c.fillStyle=color;c.fill();c.restore();
    if(t.landuse==='farmland'){c.save();shape(c,a.points);c.clip();for(let y=Math.floor((oy-50)/8)*8;y<oy+S+50;y+=8){c.strokeStyle='#cad18845';c.lineWidth=2;c.beginPath();c.moveTo(ox,y+Math.sin(ox/200)*2);c.lineTo(ox+S,y+Math.sin((ox+S)/200)*2);c.stroke();}for(let yy=Math.floor(oy/13)*13;yy<oy+S;yy+=13)for(let xx=Math.floor(ox/11)*11;xx<ox+S;xx+=11){const n=hash(xx,yy);if(n<.32)continue;const x=xx+n*4,y=yy+n*3;rect(c,'#8a9b5955',x,y,1,5);rect(c,'#e2cf8b88',x-1,y-2,3,3);rect(c,'#f1dfaa99',x,y-3,1,2);rect(c,'#87935a50',x+1,y+2,2,.5);}c.restore();}
  }
  fillMaifeldGround(c,'groundGrass',ox,oy,S,S,.4);
  // Quiet painted ground planes, with deliberate clover and blade clusters.
  for(let gy=Math.floor(oy/16)-1;gy<Math.ceil((oy+S)/16)+1;gy++)for(let gx=Math.floor(ox/16)-1;gx<Math.ceil((ox+S)/16)+1;gx++){const n=hash(gx,gy),x=gx*16+n*9,y=gy*16+hash(gy,gx)*9;
    if(n>.72){comicShape(c,'#65986d60',[[x-4,y+1],[x-6,y-2],[x-3,y-1],[x-3,y-5],[x,y-2],[x+3,y-6],[x+3,y-1],[x+6,y-2],[x+4,y+1]]);box(c,'#d2df995e',x-2,y-3,1,2);box(c,'#d2df995e',x+2,y-4,1,3);}
    if(n<.055){for(const [dx,dy]of [[-2,0],[2,0],[0,-2]]){oval(c,'#67a17b',x+dx,y+dy,2,1.5);box(c,'#a7ce8b',x+dx,y+dy,1,.5);}}
    if(n>.94){box(c,'#e1dc9c66',x+6,y+3,2,.5);box(c,'#527f7040',x-4,y+5,3,.5);}
  }
  for(const river of world.water){roadPath(c,river.points);for(const [width,color] of [[17,'#456844'],[13,'#8d9c6d'],[10,'#2b6565'],[6,'#4a8982'],[1,'#86b6a23d']]){c.lineWidth=width;c.strokeStyle=color;c.stroke();}}
  groundDetails(c,world,ox,oy,S);
  // All shoulders, then the union of all roads: no internal outlines or rounded end caps at junctions.
  const shoulder=roadMask(world,roads,ox,oy,7,()=>true,3.5);paintMask(shoulder,ox,oy,cc=>{rect(cc,'#849d61',ox,oy,S,S);for(let i=0;i<1800;i++){const x=ox+random()*S,y=oy+random()*S;rect(cc,random()>.5?'#b2b08080':'#4f714b80',x,y,1+random()*3,.5+random());}});c.globalAlpha=.5;c.drawImage(shoulder,ox,oy,S,S);c.globalAlpha=1;
  const paving=roadMask(world,roads,ox,oy,0);paintMask(paving,ox,oy,cc=>{
    rect(cc,'#8e9484',ox,oy,S,S);
    if(fillMaifeldGround(cc,'groundPaving',ox,oy,S,S))return;
    for(let row=Math.floor(oy/6)-1;row<Math.ceil((oy+S)/6)+1;row++)for(let col=Math.floor(ox/9)-1;col<Math.ceil((ox+S)/9)+1;col++){const n=hash(col,row),x=col*9+(row%2)*4.5,y=row*6,colors=['#b6b494','#c0bc98','#adad91','#c9c3a0','#b9b190'];comicShape(cc,colors[Math.floor(n*5)%5],[[x+1,y+.5],[x+7,y+.5],[x+8,y+1.5],[x+8,y+4],[x+7,y+5],[x+1.5,y+5],[x+.5,y+4],[x+.5,y+1.5]]);box(cc,'#dcd2a678',x+2,y+1,4,.5);box(cc,'#918c935c',x+2,y+4.5,4,.5);if(n>.84){box(cc,'#91878e',x+7,y+2,.5,2);box(cc,'#91878e',x+6,y+3,1,.5);box(cc,'#fff0c2',x+2,y+2,1,.5);}if(n<.07){box(cc,'#87a77d',x+1,y+4,2,.5);}}

  });
  c.drawImage(paving,ox,oy,S,S);
  // A broken grassy fringe gives paving a worn, organic outline. Sampling the union
  // keeps crossings free of stray grass and keeps the actual corridor unobstructed.
  const pixels=paving.getContext('2d').getImageData(0,0,S*DETAIL,S*DETAIL).data;
  const paved=(x,y)=>{const ix=Math.round((x-ox)*DETAIL),iy=Math.round((y-oy)*DETAIL);return ix>=0&&iy>=0&&ix<S*DETAIL&&iy<S*DETAIL&&pixels[(iy*S*DETAIL+ix)*4+3]>180;};
  for(let y=Math.floor(oy/4)*4+4;y<oy+S-4;y+=4)for(let x=Math.floor(ox/4)*4+4;x<ox+S-4;x+=4){const n=hash(x+31,y-72);if(n<.35||paved(x,y)||![[-3,0],[3,0],[0,-3],[0,3]].some(([dx,dy])=>paved(x+dx,y+dy)))continue;rect(c,'#557548a0',x,y,2,.5);rect(c,'#8da567',x+.5,y-1.5,.5,2);rect(c,'#c1c78b',x+1,y-1,.5,1);if(n>.78)rect(c,'#c1bba0',x+2,y+1,1.5,.5);}
  // Earth paths dissolve into the paved street; street coverage erases their endpoint seams.
  const isDirt=r=>['track','path','cycleway'].includes(r.tags.highway),dirt=roadMask(world,roads,ox,oy,0,isDirt,2.6),dc=dirt.getContext('2d');const streets=roadMask(world,roads,ox,oy,2,r=>!isDirt(r));dc.setTransform(1,0,0,1,0,0);dc.globalCompositeOperation='destination-out';dc.drawImage(streets,0,0);dc.globalCompositeOperation='source-over';paintMask(dirt,ox,oy,cc=>{rect(cc,'#d3b185',ox,oy,S,S);if(fillMaifeldGround(cc,'groundDirt',ox,oy,S,S,.65))return;for(let i=0;i<4200;i++){const x=ox+random()*S,y=oy+random()*S;rect(cc,random()>.6?'#d5c49a60':'#7e875e55',x,y,.5+random()*2,.5);}});c.drawImage(dirt,ox,oy,S,S);
  for(const g of world.gardens||[]){if(g.x<ox-30||g.x>ox+S+30||g.y<oy-30||g.y>oy+S+30)continue;c.save();c.beginPath();c.roundRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h,3);c.clip();rect(c,'#705b3e',g.x-g.w/2,g.y-g.h/2,g.w,g.h);fillMaifeldGround(c,'groundDirt',g.x-g.w/2,g.y-g.h/2,g.w,g.h,.65);c.restore();for(let row=0;row<2;row++)for(let col=0;col<5;col++){const n=hash(col+g.variant,row+g.x),x=g.x-13+col*6+n*2,y=g.y-5+row*7+n;oval(c,'#463f2c88',x,y+2,3,1.5);comicShape(c,'#427344',[[x-3,y],[x-2,y-3],[x,y-1],[x+2,y-4],[x+3,y],[x,y+2]]);rect(c,'#a9bb64',x-1,y-2,1,3);rect(c,g.variant%2?'#d69c55':'#b6ce73',x,y,2,2);}for(let i=0;i<9;i++){const x=g.x-18+i*4;rect(c,'#726546',x,g.y+9,3,2);rect(c,'#b4a16b',x,g.y+8,3,1);}}
  return cv;
}
