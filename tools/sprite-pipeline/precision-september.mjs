// Graphics handoff 2026-09-23: export directly from preserved imagegen originals.
import {readFileSync} from 'node:fs';
import {surface,bounds} from './png.mjs';
import {resample} from './precision-resample.mjs';
// Both sheets of the day: props/intro/ui first, then the 22 inventory and tab icons.
const jobs=['./grafik-20260923-jobs.json','./items-20260923-jobs.json']
 .flatMap(p=>JSON.parse(readFileSync(new URL(p,import.meta.url))));
export function buildSeptemberDelivery({catalog,put,read,hashSource}){
 for(const job of jobs){
  const {id,output:source,width,height,kind,padding=0,worldProp,tileSize}=job;
  const im=read(source),out=surface(width,height);
  let b=padding?bounds(im):{x:0,y:0,w:im.width,h:im.height};
  // Opaque film stills use a centered 16:9 crop; sprites keep their silhouette.
  if(kind==='intro'){
   const ratio=width/height;
   if(b.w/b.h>ratio){const w=Math.floor(b.h*ratio);b={...b,x:Math.floor((b.w-w)/2),w};}
   else{const h=Math.floor(b.w/ratio);b={...b,y:Math.floor((b.h-h)/2),h};}
  }
  const scale=Math.min((width-padding*2)/b.w,(height-padding*2)/b.h);
  const x=Math.floor((width-Math.round(b.w*scale))/2),h=Math.round(b.h*scale);
  resample(im,out,b,{x,y:worldProp?height-padding-h:Math.floor((height-h)/2)},scale);
  put(id,out,{kind,source,sourceHash:hashSource(source),padding,
   ...(worldProp?{worldProp,pivot:{x:width/2,y:height-padding}}:{}),...(tileSize?{tileSize}:{}),delivery:'2026-09-23'});
  if(worldProp)catalog.aliases[worldProp.id]=id;
 }
}
