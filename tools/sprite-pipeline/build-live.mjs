import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,blit,bounds} from './png.mjs';
import {segment} from './segment.mjs';
import {styles} from './config.mjs';
import {buildAnimals} from './build-live-animals.mjs';
import {bodyAnchor} from './build-walk.mjs';

const root=new URL('../../assets/maifeld-live/',import.meta.url);
const palette=styles.find(s=>s.id==='detailpixel').palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const sha=b=>createHash('sha256').update(b).digest('hex');
const prompts=JSON.parse(readFileSync(new URL('./live-prompts.json',import.meta.url)));
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
export function sockets(frame,b,row,index,walking,id){
 const east=row%2===0,back=row>1,at=(u,v)=>({x:b.x+b.w*u,y:b.y+b.h*v});
 const mainX=east?.86:.14,offX=1-mainX;
 let main=at(mainX,id==='anni'?.52:.61),off=at(offX,.67);
 if(!walking){if(index===4)main=at(offX,.36);if(index===5)main=at(east?.96:.04,.42);if(index===6)main=at(offX,.43);}
 // Search the local skin cluster, rather than attaching gear to the silhouette edge.
 const skinPoint=point=>{let sx=0,sy=0,n=0;for(let y=Math.max(b.y,Math.floor(point.y-3));y<Math.min(95,point.y+4);y++)for(let x=Math.max(0,Math.floor(point.x-4));x<Math.min(95,point.x+4);x++){const i=(y*96+x)*4,[r,g,blue,a]=frame.data.subarray(i,i+4);if(a&&r>170&&r>g*1.15&&g>blue*1.15){const weight=1/(1+Math.hypot(x-point.x,y-point.y));sx+=x*weight;sy+=y*weight;n+=weight;}}return n?{x:sx/n,y:sy/n}:point;};
 main=skinPoint(main);off=skinPoint(off);
 const feet=[0,1].map(side=>{let sx=0,sy=0,n=0;for(let y=b.y+b.h-7;y<b.y+b.h;y++)for(let x=b.x+Math.floor(b.w*side/2);x<b.x+b.w*(side+1)/2;x++)if(frame.data[(y*96+x)*4+3]){sx+=x;sy+=y;n++;}return n?{x:sx/n,y:sy/n+2}:at(side?.7:.3,.97);});
 return{main,off,head:{x:48,y:b.y+3},torso:{x:b.x+b.w*.5,y:b.y+b.h*.46,w:Math.min(id==='dieter'?25:21,b.w*.64),h:20},waist:at(.5,.69),shoulders:[at(.23,.42),at(.75,.42)],feet,back};
}
export function buildLive(){
 const out=new Map(),catalog={version:1,style:'Maifeld-Detailpixel',palette:palette.map(p=>'#'+p.map(v=>v.toString(16).padStart(2,'0')).join('')),frameSize:96,pivot:{x:48,y:80},directions:['se','sw','ne','nw'],heroes:{},people:{},equipment:{}};
 for(const id of ['anni','dieter','kevin']){
  const actor={id,height:52,stride:48,sheets:{}};
  for(const state of ['poses','walk']){
   const source=id+'-'+state+'.png',sourceFile=id==='kevin'&&state==='walk'?'kevin-walk-v2.png':source,raw=readFileSync(new URL('sources/'+sourceFile,root)),im=decodePng(raw),cells=segment(im,8,4);
   const scale=52/median(cells.filter((_,i)=>state==='walk'||i%8<4).map(b=>b.h)),atlas=surface(768,384),frames=[];
   for(let i=0;i<32;i++){
    const b=cells[i],frame=surface(96,96),x=48-Math.round((bodyAnchor(im,b)-b.x)*scale),y=80-Math.round(b.h*scale);
    blit(im,frame,b,{x,y},scale,palette);const box=bounds(frame);
    if(box.x<2||box.y<2||box.x+box.w>94||box.y+box.h>94)throw Error(source+' clipped frame '+i);
    blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:i%8*96,y:Math.floor(i/8)*96});
    frames.push({bounds:box,sockets:sockets(frame,box,Math.floor(i/8),i%8,state==='walk',id),hash:sha(frame.data)});
   }
   const bytes=encodePng(atlas);out.set(source,bytes);actor.sheets[state]={atlas:source,source:sourceFile,sourceHash:sha(raw),atlasHash:sha(bytes),frames};
  }
  catalog.heroes[id]=actor;
 }
 const gear=prompts.jobs.find(j=>j.id==='equipment'),raw=readFileSync(new URL('sources/equipment.png',root)),im=decodePng(raw),cells=segment(im,8,5),atlas=surface(512,320);
 for(const [i,id] of gear.parts.entries()){
  const b=cells[i],scale=48/Math.max(b.w,b.h),frame=surface(64,64);blit(im,frame,b,{x:8,y:8},scale,palette);const box=bounds(frame);
  blit(frame,atlas,{x:0,y:0,w:64,h:64},{x:i%8*64,y:Math.floor(i/8)*64});catalog.equipment[id]={x:i%8*64+box.x,y:Math.floor(i/8)*64+box.y,w:box.w,h:box.h};
 }
 out.set('equipment.png',encodePng(atlas));catalog.equipmentSourceHash=sha(raw);
 for(const job of prompts.jobs.filter(j=>j.people)){
  const file=new URL('sources/'+job.id+'.png',root);if(!existsSync(file))continue;
  const raw=readFileSync(file),im=decodePng(raw),cells=segment(im,job.cols,job.rows),atlas=surface(job.cols*96,job.rows*96);
  for(const [i,[id]] of job.people.entries()){
   const scale=52/median([cells[i*2].h,cells[i*2+1].h]),frames=[];
   for(let side=0;side<2;side++){const idx=i*2+side,b=cells[idx],frame=surface(96,96);blit(im,frame,b,{x:48-Math.round(b.w*scale/2),y:80-Math.round(b.h*scale)},scale,palette);const box=bounds(frame);if(box.x<2||box.x+box.w>94)throw Error('NPC clipped '+id);blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:idx%job.cols*96,y:Math.floor(idx/job.cols)*96});frames.push({x:idx%job.cols*96,y:Math.floor(idx/job.cols)*96,bounds:box});}
   catalog.people[id]={sourceHash:sha(raw),atlas:job.id+'.png',height:52,frames};
  }
  out.set(job.id+'.png',encodePng(atlas));
 }
 const animals=buildAnimals();catalog.animals=animals.catalog;for(const [name,data] of animals.files)out.set(name,data);
 out.set('catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return out;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 mkdirSync(new URL('runtime/',root),{recursive:true});for(const [name,data] of buildLive())writeFileSync(new URL('runtime/'+name,root),data);console.log('Built live heroes, equipment and available townspeople.');
}
