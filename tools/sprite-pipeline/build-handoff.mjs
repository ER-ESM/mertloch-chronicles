// Deterministic technical export of generated sources; originals remain untouched.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit,bounds,gridCell} from './png.mjs';
import {segment} from './segment.mjs';
import {bodyAnchor} from './build-walk.mjs';
import {sockets} from './build-live.mjs';
import {styles} from './config.mjs';
const root=new URL('../../',import.meta.url);
const palette=styles.find(s=>s.id==='detailpixel').palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const hash=b=>createHash('sha256').update(b).digest('hex');
export function buildHandoff(){
 const jobs=JSON.parse(readFileSync(new URL('handoff-jobs.json',import.meta.url))),files=new Map(),catalog={version:1,style:'Maifeld-Detailpixel',humanNativePixelsPerWorldUnit:2,frameSize:96,pivot:{x:48,y:80},directions:['se','sw','ne','nw'],assets:{},missing:[]};
 for(const j of jobs){
  const source='assets/content-art/sources/2026-09-17/'+j.id+'.png',file=new URL(source,root);
  if(!existsSync(file)){catalog.missing.push(j.id);continue;}
  const raw=readFileSync(file),im=decodePng(raw);let out,frames;
  if(j.motifs){
   const cells=Array.from({length:j.cols*j.rows},(_,i)=>bounds(im,j.edges?{x:j.edges.x[i%j.cols],y:j.edges.y[Math.floor(i/j.cols)],w:j.edges.x[i%j.cols+1]-j.edges.x[i%j.cols],h:j.edges.y[Math.floor(i/j.cols)+1]-j.edges.y[Math.floor(i/j.cols)]}:gridCell(im,i%j.cols,Math.floor(i/j.cols),j.cols,j.rows))),atlas=surface(240,288);
   for(const[m,b]of j.motifs.map((m,i)=>[m,cells[i]])){
    const icon=surface(48,48),scale=Math.min(44/b.w,44/b.h);blit(im,icon,b,{x:Math.floor((48-Math.round(b.w*scale))/2),y:Math.floor((48-Math.round(b.h*scale))/2)},scale,palette);
    const path='assets/content-art/talents/procs/'+m.id+'.png',bytes=encodePng(icon);files.set(path,bytes);
    catalog.assets[m.id]={kind:'talents',path,width:48,height:48,source,sourceHash:hash(raw),hash:hash(bytes),job:j.id,member:j.member,talentIndex:m.index};
    blit(icon,atlas,{x:0,y:0,w:48,h:48},{x:m.index%5*48,y:Math.floor(m.index/5)*48});
   }
   const path='assets/content-art/talents/procs/'+j.id+'.png',bytes=encodePng(atlas);files.set(path,bytes);
   catalog.patches??={};catalog.patches[j.member]={path,width:240,height:288,cell:48,indices:j.motifs.map(m=>m.index),hash:hash(bytes),note:'Sparse overlay only: preserve the other 24 existing talent cells.'};continue;
  }
  if(j.width&&j.height){
   const box=bounds(im),pad=j.padding??2,scale=j.nativeHeight?j.nativeHeight/box.h:Math.min((j.width-pad*2)/box.w,(j.height-pad*2)/box.h);out=surface(j.width,j.height);
   if(j.nineSlice){
    // A nine-slice panel is resizable: register the full panel to its target rectangle.
    const sample=surface(j.width-4,j.height-4);
    for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){const sx=box.x+Math.min(box.w-1,Math.floor((x+.5)*box.w/sample.width)),sy=box.y+Math.min(box.h-1,Math.floor((y+.5)*box.h/sample.height));sample.data.set(im.data.subarray((sy*im.width+sx)*4,(sy*im.width+sx)*4+4),(y*sample.width+x)*4);}
    blit(sample,out,{x:0,y:0,w:sample.width,h:sample.height},{x:2,y:2},1,palette);
   }else blit(im,out,box,{x:Math.floor((j.width-Math.round(box.w*scale))/2),y:j.kind==='props'?80-Math.round(box.h*scale):Math.floor((j.height-Math.round(box.h*scale))/2)},scale,palette);
  }else{
   const cells=j.segmentation==='grid'?Array.from({length:j.cols*j.rows},(_,i)=>bounds(im,gridCell(im,i%j.cols,Math.floor(i/j.cols),j.cols,j.rows))):segment(im,j.cols,j.rows),median=[...cells.map(b=>b.h)].sort((a,b)=>a-b)[Math.floor(cells.length/2)],scale=j.nativeHeight/median;
   const size=j.frameSize??96,pivot=j.pivot??{x:48,y:80};out=surface(j.cols*size,j.rows*size);frames=[];
   for(let i=0;i<cells.length;i++){
    const b=cells[i],frame=surface(size,size),x=pivot.x-Math.round((bodyAnchor(im,b,j.animal)-b.x)*scale),y=pivot.y-Math.round(b.h*scale);
    if(x<2||y<2||x+Math.round(b.w*scale)>size-2||y+Math.round(b.h*scale)>size-2)throw Error(j.id+' source frame '+i+' exceeds margins: '+JSON.stringify({x,y,w:Math.round(b.w*scale),h:Math.round(b.h*scale)}));
    blit(im,frame,b,{x,y},scale,palette);const box=bounds(frame);
    if(box.x<2||box.y<2||box.x+box.w>size-2||box.y+box.h>size-2)throw Error(j.id+' clipped '+i);
    blit(frame,out,{x:0,y:0,w:size,h:size},{x:i%j.cols*size,y:Math.floor(i/j.cols)*size});
    const pose=j.columns[i%j.cols],poseIndex=pose==='impact'?5:pose==='anticipation'?4:pose==='hit'?6:i%j.cols;
    frames.push({x:i%j.cols*size,y:Math.floor(i/j.cols)*size,bounds:box,hash:hash(frame.data),...(!j.animal&&j.kind!=='bosses'&&j.rig!=='machine'?{sockets:sockets(frame,box,Math.floor(i/j.cols),poseIndex,pose.startsWith('walk'),j.id.split('-')[0])}:{})});
   }
  }
  const path='assets/content-art/'+j.kind+'/'+j.id+'.png',bytes=encodePng(out);files.set(path,bytes);
  catalog.assets[j.id]={kind:j.kind,path,width:out.width,height:out.height,padding:j.padding??2,...(j.nativeHeight&&!frames?{nativeHeight:j.nativeHeight,worldHeight:j.worldHeight,pivot:{x:48,y:80}}:{}),source,sourceHash:hash(raw),hash:hash(bytes),...(frames?{frames,frameSize:j.frameSize??96,pivot:j.pivot??{x:48,y:80},nativeHeight:j.nativeHeight,worldHeight:j.worldHeight,columns:j.columns}:{}),...(j.nineSlice?{nineSlice:j.nineSlice}:{})};
 }
 catalog.aliases={'hero-dieter':'dieter-poses','hero-kevin':'kevin-poses',dieter:'dieter-poses',kevin:'kevin-poses'};
 for(const[id,a]of Object.entries(catalog.assets)){if(['enemies','bosses','npcs'].includes(a.kind))catalog.aliases[(a.kind==='enemies'?'enemy-':a.kind==='bosses'?'boss-':'npc-')+id]=id;if(/^villager\d$/.test(id))catalog.aliases[id.replace('villager','villager-')]=id;}
 files.set('assets/content-art/handoff-catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return files;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const files=buildHandoff();for(const [path,bytes]of files){const url=new URL(path,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);}console.log('Handoff exports: '+(files.size-1));
}
