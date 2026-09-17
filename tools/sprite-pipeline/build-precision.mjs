import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,bounds,gridCell,blit} from './png.mjs';
import {segment} from './segment.mjs';
import {bodyAnchor} from './build-walk.mjs';
import {resample} from './precision-resample.mjs';
import {buildPrecisionActors} from './precision-actors.mjs';
import {buildPrecisionIcons} from './precision-icons.mjs';
const root=new URL('../../',import.meta.url),folder='assets/precision/runtime/';
const json=p=>JSON.parse(readFileSync(new URL(p,root))),sha=b=>createHash('sha256').update(b).digest('hex');
export function buildPrecision(){
 const old=json('assets/content-art/handoff-catalog.json'),jobs=json('tools/sprite-pipeline/handoff-jobs.json'),refined=json('assets/content-art/refinement/runtime/catalog.json');
 const catalog={version:2,style:'Maifeld-Präzisionspixel',humanNativePixelsPerWorldUnit:4,frameSize:192,pivot:{x:96,y:160},directions:old.directions,aliases:{...old.aliases},assets:{},missing:[]},files=new Map(),sources=new Map();
 const read=p=>{if(!sources.has(p))sources.set(p,decodePng(readFileSync(new URL(p,root))));return sources.get(p);};
 const put=(id,im,meta)=>{const path=folder+meta.kind+'/'+id+'.png',bytes=encodePng(im);files.set(path,bytes);catalog.assets[id]={...meta,path,width:im.width,height:im.height,hash:sha(bytes),revision:'precision-v1'};};
 for(const[id,a]of Object.entries(old.assets)){
  const j=jobs.find(j=>j.id===(a.job||id)),im=read(a.source),meta={...a};delete meta.path;delete meta.hash;
  if(a.frames){
   const cells=j.segmentation==='grid'?Array.from({length:j.cols*j.rows},(_,i)=>bounds(im,gridCell(im,i%j.cols,Math.floor(i/j.cols),j.cols,j.rows))):segment(im,j.cols,j.rows);
   const median=[...cells.map(b=>b.h)].sort((a,b)=>a-b)[Math.floor(cells.length/2)],scale=a.nativeHeight*2/median,size=a.frameSize*2,pivot={x:a.pivot.x*2,y:a.pivot.y*2},out=surface(size*j.cols,size*j.rows),frames=[];
   for(let i=0;i<cells.length;i++){
    const b=cells[i],frame=surface(size,size),x=pivot.x-Math.round((bodyAnchor(im,b,j.animal)-b.x)*scale),y=pivot.y-Math.round(b.h*scale);
    resample(im,frame,b,{x,y},scale);const f={...a.frames[i],x:i%j.cols*size,y:Math.floor(i/j.cols)*size,bounds:bounds(frame),hash:sha(frame.data)};
    blit(frame,out,{x:0,y:0,w:size,h:size},{x:f.x,y:f.y});frames.push(f);
   }
   put(id,out,{...meta,nativeHeight:a.nativeHeight*2,frameSize:size,pivot,frames,gearScale:2,padding:a.padding*2});
  }else{
   let b;
   if(refined.icons[id])b=refined.icons[id].sourceBounds;
   else if(j.motifs){const i=j.motifs.findIndex(m=>m.id===id);b=bounds(im,j.edges?{x:j.edges.x[i%j.cols],y:j.edges.y[Math.floor(i/j.cols)],w:j.edges.x[i%j.cols+1]-j.edges.x[i%j.cols],h:j.edges.y[Math.floor(i/j.cols)+1]-j.edges.y[Math.floor(i/j.cols)]}:gridCell(im,i%j.cols,Math.floor(i/j.cols),j.cols,j.rows));}
   else if(j.portraitCrop){b=segment(im,4,4)[0];b={...b,h:Math.round(b.h*.48)};}
   else b=bounds(im);
   const w=a.width*2,h=a.height*2,pad=(a.padding??2)*2,out=surface(w,h),scale=Math.min((w-pad*2)/b.w,(h-pad*2)/b.h);
   if(j.nineSlice){const tmp=surface(w-pad*2,h-pad*2);for(let y=0;y<tmp.height;y++)for(let x=0;x<tmp.width;x++){const sx=b.x+Math.floor(x*b.w/tmp.width),sy=b.y+Math.floor(y*b.h/tmp.height);tmp.data.set(im.data.subarray((sy*im.width+sx)*4,(sy*im.width+sx)*4+4),(y*tmp.width+x)*4);}resample(tmp,out,{x:0,y:0,w:tmp.width,h:tmp.height},{x:pad,y:pad},1);}
   else resample(im,out,b,{x:Math.floor((w-Math.round(b.w*scale))/2),y:a.worldProp?h-pad-Math.round(b.h*scale):Math.floor((h-Math.round(b.h*scale))/2)},scale);
   put(id,out,{...meta,padding:pad,...(a.pivot?{pivot:{x:a.pivot.x*2,y:a.pivot.y*2}}:{}),...(a.nativeHeight?{nativeHeight:a.nativeHeight*2}:{}),...(a.nineSlice?{nineSlice:Object.fromEntries(Object.entries(a.nineSlice).map(([k,v])=>[k,v*2]))}:{})});
  }
 }
 buildPrecisionActors({catalog,put,read,hashSource:p=>sha(readFileSync(new URL(p,root)))});
 buildPrecisionIcons({catalog,put,read,hashSource:p=>sha(readFileSync(new URL(p,root)))});
 files.set(folder+'catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return{catalog,files};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const{files,catalog}=buildPrecision();for(const[path,data]of files){const url=new URL(path,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,data);}console.log(JSON.stringify({assets:Object.keys(catalog.assets).length,files:files.size,missing:catalog.missing}));}
