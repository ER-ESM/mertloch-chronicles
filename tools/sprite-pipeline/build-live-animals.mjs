import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit,bounds} from './png.mjs';
import {segment} from './segment.mjs';
import {styles} from './config.mjs';
const root=new URL('../../assets/maifeld-live/',import.meta.url);
const palette=styles.find(s=>s.id==='detailpixel').palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const hash=b=>createHash('sha256').update(b).digest('hex');
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
export function buildAnimals(){
 const files=new Map(),catalog={};
 for(const id of ['badger','fox','cat','goose','raven','chicken']){
  const source=id+'.png',path=new URL('sources/'+source,root);if(!existsSync(path))continue;
  const bird=['goose','raven','chicken'].includes(id),names=bird?['body','nearFront','farFront']:['body','nearFront','nearRear','farFront','farRear'];
  const raw=readFileSync(path),im=decodePng(raw),cols=names.length,cells=segment(im,cols,4,{ranked:true}),atlas=surface(cols*96,384);
  const bodyHeight=bird?32:29,legHeight=bird?10:16,bodyScale=bodyHeight/median(cells.filter((_,i)=>i%cols===0).map(b=>b.h)),legScale=legHeight/median(cells.filter((_,i)=>i%cols!==0).map(b=>b.h));
  const rig={version:1,source,sourceHash:hash(raw),atlas:id+'-rig.png',height:37,pivot:{x:48,y:80},stride:bird?22:32,directions:[]};
  for(const [row,direction] of ['se','sw','ne','nw'].entries()){
   const parts={};for(let col=0;col<cols;col++){const frame=surface(96,96);blit(im,frame,cells[row*cols+col],{x:4,y:4},col?legScale:bodyScale,palette);const b=bounds(frame);if(b.x+b.w>92||b.y+b.h>92)throw Error(id+' clipped '+names[col]);blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:col*96,y:row*96});parts[names[col]]={rect:{x:col*96+b.x,y:row*96+b.y,w:b.w,h:b.h}};}
   const body=parts.body,w=body.rect.w;body.at={x:48-w/2,y:43};const east=direction.endsWith('e'),rear=direction.startsWith('n');
   for(const name of names.slice(1)){const p=parts[name],far=name.startsWith('far');let x=bird?(far?.44:.56):name.endsWith('Front')?(rear?.78:.72):(rear?.34:.30);if(!bird&&far)x+=rear?-.10:.08;p.pivot={x:p.rect.w/2,y:0};p.at={x:body.at.x+(east?x:1-x)*w,y:(far?78:80)-p.rect.h};p.phase=bird?(far?.5:0):({nearRear:0,nearFront:.25,farRear:.5,farFront:.75}[name]);}
   rig.directions.push({id:direction,parts});
  }
  const bytes=encodePng(atlas);rig.atlasHash=hash(bytes);files.set(rig.atlas,bytes);files.set(id+'-rig.json',Buffer.from(JSON.stringify(rig,null,2)+'\n'));catalog[id]=id+'-rig.json';
 }
 return{files,catalog};
}
