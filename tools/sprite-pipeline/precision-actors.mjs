import {readFileSync} from 'node:fs';
import {surface,bounds,blit} from './png.mjs';
import {segment} from './segment.mjs';
import {bodyAnchor} from './build-walk.mjs';
import {resample} from './precision-resample.mjs';
const root=new URL('../../',import.meta.url);
export function buildPrecisionActors({catalog,put,read,hashSource}){
 const jobs=JSON.parse(readFileSync(new URL('tools/sprite-pipeline/precision-jobs.json',root)));
 for(const j of jobs){
  const source='assets/precision/sources/'+j.id+'.png',im=read(source),cells=segment(im,j.cols,j.rows),median=[...cells.map(b=>b.h)].sort((a,b)=>a-b)[Math.floor(cells.length/2)],scale=j.nativeHeight/median,size=j.frameSize,out=surface(size*j.cols,size*j.rows),frames=[];
  for(let i=0;i<cells.length;i++){
   const b=cells[i],frame=surface(size,size),x=j.pivot.x-Math.round((bodyAnchor(im,b,j.animal)-b.x)*scale),y=j.pivot.y-Math.round(b.h*scale);
   resample(im,frame,b,{x,y},scale);const box=bounds(frame);
   if(box.x<2||box.y<2||box.x+box.w>size-2||box.y+box.h>size-2)throw Error(j.id+' clipped frame '+i);
   const f={x:i%j.cols*size,y:Math.floor(i/j.cols)*size,bounds:box};blit(frame,out,{x:0,y:0,w:size,h:size},f);frames.push(f);
  }
  put(j.id,out,{kind:j.kind,source,sourceHash:hashSource(source),padding:2,frames,frameSize:size,pivot:j.pivot,nativeHeight:j.nativeHeight,worldHeight:j.worldHeight,columns:j.columns});
  catalog.aliases[(j.kind==='bosses'?'boss-':j.kind==='npcs'?'npc-':'enemy-')+j.id]=j.id;
  if(!j.animal){const b={...cells[0],h:Math.round(cells[0].h*.44)},s=Math.min(116/b.w,116/b.h),portrait=surface(128,128);resample(im,portrait,b,{x:Math.floor((128-Math.round(b.w*s))/2),y:6},s);put('portrait-'+j.id,portrait,{kind:'portraits',source,sourceHash:hashSource(source),sourceBounds:b,padding:6});}
 }
 const source='assets/precision/sources/campfire.png',im=read(source),cells=segment(im,4,2),scale=112/Math.max(...cells.map(b=>b.h)),out=surface(128*8,128),frames=[];
 for(let i=0;i<8;i++){const b=cells[i],frame=surface(128,128);resample(im,frame,b,{x:64-Math.round(b.w*scale/2),y:120-Math.round(b.h*scale)},scale);blit(frame,out,{x:0,y:0,w:128,h:128},{x:i*128,y:0});frames.push({x:i*128,y:0,bounds:bounds(frame)});}
 put('campfire',out,{kind:'effects',source,sourceHash:hashSource(source),frameSize:128,frames,pivot:{x:64,y:120},worldHeight:28,nativeHeight:112,padding:4});
}
