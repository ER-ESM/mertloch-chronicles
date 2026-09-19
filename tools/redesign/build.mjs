import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit,bounds} from '../sprite-pipeline/png.mjs';
import {segment} from '../sprite-pipeline/segment.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
import {bodyAnchor} from '../sprite-pipeline/build-walk.mjs';
import {rigWalk,WALK_RIG} from './walk-rig.mjs';
import {wearMasks} from './wear-masks.mjs';

const root=new URL('../../',import.meta.url),base='assets/redesign/';
export const DIRECTIONS=['se','sw','ne','nw'];
export const COLUMNS={poses:['idle','anticipation','impact','recovery','hit','parry','cast','rest'],walk:Array.from({length:8},(_,i)=>'walk-'+i),specials:['ranged-aim','ranged-release','dash','dead'],heavy:['idle','anticipation','impact','recovery'],heavywalk:Array.from({length:8},(_,i)=>'walk-'+i)};
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const hash=data=>createHash('sha256').update(data).digest('hex');
function cleanAlphaIslands(frame){
 const seen=new Uint8Array(frame.width*frame.height),minimum=8*(frame.width/192)**2;
 for(let start=0;start<seen.length;start++){
  if(seen[start]||!frame.data[start*4+3])continue;const queue=[start];seen[start]=1;
  for(let n=0;n<queue.length;n++){const p=queue[n],x=p%frame.width,y=Math.floor(p/frame.width);for(let yy=Math.max(0,y-1);yy<=Math.min(frame.height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(frame.width-1,x+1);xx++){const q=yy*frame.width+xx;if(!seen[q]&&frame.data[q*4+3]){seen[q]=1;queue.push(q);}}}
  if(queue.length<minimum)for(const p of queue)frame.data.fill(0,p*4,p*4+4);
 }
}

/** Semantic garment mask: torso only, selected fabric ramps; skin/head/metal are excluded. */
function garmentMask(frame,b,hero,row,pose){
 const out=surface(frame.width,frame.height),back=row>1;
 for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++){
  const u=(x-b.x)/b.w,v=(y-b.y)/b.h,i=(y*frame.width+x)*4,minV=pose==='anticipation'?.44:pose==='rest'?.46:hero==='anni'?.36:.29;
  if(!frame.data[i+3]||u<.18||u>.82||v<minV||v>.66||pose==='dead')continue;
  // Orange blouse is distinguished from skin by its low blue channel; in back
  // views only the sleeve strips are garment, never the central copper tank.
  const [r,g,blue]=frame.data.subarray(i,i+3),fabric=hero==='anni'?(!back||u<.30||u>.70)&&r>g*1.5&&g>blue*1.28&&blue<r*.32&&r>85:hero==='dieter'?g>=r*.88&&g>blue*1.12&&r<150:(g>=r*.88&&g>blue*1.06&&r<140)||(blue>r*1.03&&g>r*1.03&&r<110);
  if(fabric)out.data.set(frame.data.subarray(i,i+4),i);
 }return out;
}
function maskRuns(mask){const runs=[];for(let y=0;y<mask.height;y++){let x=0;while(x<mask.width){while(x<mask.width&&!mask.data[(y*mask.width+x)*4+3])x++;const start=x;while(x<mask.width&&mask.data[(y*mask.width+x)*4+3])x++;if(x>start)runs.push([y,start,x-start]);}}return runs;}

/** Coordinates belong to a pose, then refine each point against nearby skin pixels. */
function frameSockets(frame,b,row,state,column){
 const back=row>1,west=row%2===1;
 // Coordinates are authored in an east-facing source silhouette; western views mirror the registration.
 let main=[.23,.58],off=[.85,.60],angle=-.12;
 if(state==='poses'){
  if(column===1){main=[.21,.13];off=[.78,.38];angle=-.7;}
  if(column===2){main=[.92,.32];off=[.20,.48];angle=1.05;}
  if(column===3){main=[.22,.60];off=[.83,.58];}
  if(column===4){main=[.20,.55];off=[.87,.26];angle=.35;}
  if(column===5){main=[.25,.52];off=[.89,.31];}
  if(column===6){main=[.87,.35];off=[.72,.37];angle=.8;}
  if(column===7){main=[.26,.59];off=[.68,.59];angle=.65;}
 }else if(state==='specials'){
  if(column===0){main=[.82,.32];off=[.54,.39];angle=.7;}
  if(column===1){main=[.91,.29];off=[.29,.45];angle=1.05;}
  if(column===2){main=[.25,.43];off=[.78,.35];angle=.2;}
  if(column===3){main=[.72,.64];off=[.65,.65];angle=1.5;}
 }else if(state==='heavy'){
  if(column===0){main=[.67,.57];off=[.65,.48];angle=.05;}
  if(column===1){main=[.55,.20];off=[.55,.10];angle=-.1;}
  if(column===2){main=[.80,.59];off=[.72,.50];angle=1.1;}
  if(column===3){main=[.65,.59];off=[.64,.49];angle=.3;}
 }else{
  const swing=Math.sin(column/8*Math.PI*2);main=[.25+swing*.08,.57+swing*.06];off=[.83-swing*.07,.55-swing*.06];
 }
 if(back){if(state==='poses'&&[0,3].includes(column)||state==='walk'){main=[.91,main[1]];off=[.18,off[1]];}else if(state==='poses'&&column===1){main=[.74,.13];off=[.22,.4];}}
 const point=([u,v])=>({x:b.x+b.w*(west?1-u:u),y:b.y+b.h*v});
 const refine=p=>{let sx=0,sy=0,total=0;const radius=7;for(let y=Math.max(0,Math.floor(p.y-radius));y<Math.min(192,p.y+radius);y++)for(let x=Math.max(0,Math.floor(p.x-radius));x<Math.min(192,p.x+radius);x++){
  const i=(y*192+x)*4,r=frame.data[i],g=frame.data[i+1],blue=frame.data[i+2];if(frame.data[i+3]&&r>135&&g/r>.48&&g/r<.87&&blue/r>.36&&blue/r<.76){const w=1/(1+Math.hypot(x-p.x,y-p.y)**2);sx+=x*w;sy+=y*w;total+=w;}
 }return total?{x:Math.round(sx/total),y:Math.round(sy/total)}:{x:Math.round(p.x),y:Math.round(p.y)};};
 const mainAt=refine(point(main)),offAt=refine(point(off));
 const foot=side=>{const minX=Math.floor(b.x+b.w*(side?.5:0)),maxX=Math.ceil(b.x+b.w*(side?1:.5));let bottom=0;for(let y=Math.floor(b.y+b.h*.6);y<b.y+b.h;y++)for(let x=minX;x<maxX;x++)if(frame.data[(y*192+x)*4+3])bottom=y;let sum=0,count=0;for(let y=Math.max(b.y,bottom-3);y<=bottom;y++)for(let x=minX;x<maxX;x++)if(frame.data[(y*192+x)*4+3]){sum+=x;count++;}return {x:count?sum/count:(minX+maxX)/2,y:bottom+1};};
 const result={main:mainAt,off:offAt,mainAngle:(west?-1:1)*angle,offAngle:0,head:point([.5,0]),torso:{...point([.5,.43]),w:b.w*.60,h:b.h*.37},waist:point([.5,.68]),shoulders:[point([.22,.33]),point([.78,.33])],feet:[foot(0),foot(1)],back,west};
 if(state==='heavy'&&column===1)result.head=point([.55,.18]);
 if(state==='poses'&&column===7)result.feet=[point([.70,.90]),point([.88,.94])];
 if(state==='specials'&&column===3){
  result.head=point(back?[.20,.36]:[.83,.48]);result.torso={...point([.5,.48]),w:b.w*.38,h:b.h*.65};result.waist=point(back?[.65,.6]:[.4,.61]);
  result.headAngle=(back?-1:1)*(west?-1:1)*Math.PI/2;
  result.shoulders=[point(back?[.30,.40]:[.68,.35]),point(back?[.34,.62]:[.68,.70])];result.feet=[point(back?[.91,.78]:[.13,.81]),point(back?[.85,.91]:[.23,.95])];
 }
 return result;
}

export function buildRedesign({partial=false}={}){
 const jobs=JSON.parse(readFileSync(new URL('tools/redesign/jobs.json',root))),files=new Map();
 const registration=JSON.parse(readFileSync(new URL('tools/redesign/registration.json',root)));
 const catalog={version:1,style:'Mertloch Themenhelden · Detailpixel',frameSize:192,pivot:{x:96,y:160},nativeHeight:104,worldHeight:26,directions:DIRECTIONS,stride:WALK_RIG.stride,complete:false,aliases:{baerbel:'anni'},assets:{},source:'tools/redesign',animated:true};
 for(const job of jobs){
  if(job.state==='walk')continue;
  const file=new URL(job.output,root);if(!existsSync(file)){if(partial)continue;throw Error('Missing animation source: '+job.output);}
  const bytes=readFileSync(file),image=decodePng(bytes),cells=segment(image,job.cols,job.rows);
  const standing=cells.filter((_,i)=>['poses','heavy'].includes(job.state)?[0,3].includes(i%job.cols):job.state==='specials'?i%job.cols<2:true);
  const sourceHeight=median(standing.map(b=>b.h)),scale=104/sourceHeight,size=192,sheet=surface(size*job.cols,size*job.rows),detail=surface(size*job.cols*2,size*job.rows*2),cloth=surface(size*job.cols*2,size*job.rows*2),frames=[];
  for(const [i,b] of cells.entries()){
   const pose=COLUMNS[job.state][i%job.cols],anchor=pose==='dead'?b.x+b.w/2:bodyAnchor(image,b),frame=surface(size,size),big=surface(size*2,size*2),at={x:96-Math.round((anchor-b.x)*scale),y:160-Math.round(b.h*scale)};
   resample(image,frame,b,at,scale);resample(image,big,b,{x:at.x*2,y:at.y*2},scale*2);
   cleanAlphaIslands(frame);cleanAlphaIslands(big);
   if(registration.flips[job.id]?.includes(i))for(const target of [frame,big]){const copy=target.data.slice();for(let y=0;y<target.height;y++)for(let x=0;x<target.width;x++)target.data.set(copy.subarray((y*target.width+x)*4,(y*target.width+x)*4+4),(y*target.width+target.width-1-x)*4);}
   const box=bounds(frame);if(box.x<2||box.y<2||box.x+box.w>190||box.y+box.h>190)throw Error(job.id+' clipped frame '+i);
   const x=i%job.cols*size,y=Math.floor(i/job.cols)*size,sockets=frameSockets(frame,box,Math.floor(i/job.cols),job.state,i%job.cols);
   const authored=registration.sockets[job.id]?.[i];if(authored){sockets.main={x:box.x+box.w*authored[0],y:box.y+box.h*authored[1]};sockets.off={x:box.x+box.w*authored[2],y:box.y+box.h*authored[3]};sockets.mainAngle=Math.atan2(sockets.off.y-sockets.main.y,sockets.off.x-sockets.main.x)-(sockets.west?-.85:-2.30);}
   blit(frame,sheet,{x:0,y:0,w:size,h:size},{x,y});blit(big,detail,{x:0,y:0,w:size*2,h:size*2},{x:x*2,y:y*2});
   blit(garmentMask(big,bounds(big),job.hero,Math.floor(i/job.cols),pose),cloth,{x:0,y:0,w:384,h:384},{x:x*2,y:y*2});
   frames.push({x,y,pose,direction:DIRECTIONS[Math.floor(i/job.cols)],sourceBounds:b,bounds:box,sockets,wearRuns:wearMasks(frame,sockets,job.hero),clothRuns:maskRuns(garmentMask(frame,box,job.hero,Math.floor(i/job.cols),pose)),hash:hash(frame.data)});
  }
  const path=base+'runtime/'+job.id+'.png',detailPath=base+'runtime/'+job.id+'-detail.png',data=encodePng(sheet);files.set(path,data);files.set(detailPath,encodePng(detail));
  const clothPath=base+'runtime/'+job.id+'-cloth.png';files.set(clothPath,encodePng(cloth));
  catalog.assets[job.id]={hero:job.hero,state:job.state,path,detailPath,clothPath,frameSize:size,pivot:catalog.pivot,columns:COLUMNS[job.state],nativeHeight:104,worldHeight:26,source:job.output,sourceHash:hash(bytes),hash:hash(data),sourceHeight,sourceScale:scale,frames};
 }
 for(const hero of ['dieter','anni','kevin'])for(const heavy of [false,true]){
  const poses=catalog.assets[hero+(heavy?'-heavy':'-poses')];if(!poses)continue;
  const original=decodePng(files.get(poses.detailPath)),sheet=surface(1536,768),detail=surface(3072,1536),cloth=surface(3072,1536),frames=[];
  for(let row=0;row<4;row++){
   const source=surface(384,384),idle=poses.frames[row*poses.columns.length];blit(original,source,{x:idle.x*2,y:idle.y*2,w:384,h:384},{x:0,y:0});
   for(let column=0;column<8;column++){
    const rig=rigWalk(source,column,row,{hero,heavy,sockets:idle.sockets}),big=rig.image,frame=surface(192,192);resample(big,frame,{x:0,y:0,w:384,h:384},{x:0,y:0},.5);
    const x=column*192,y=row*192,box=bounds(frame),sockets=structuredClone(idle.sockets);
    for(const key of ['main','off','head','torso','waist'])Object.assign(sockets[key],rig.bodyTransform(sockets[key]));
    sockets.shoulders.forEach(p=>Object.assign(p,rig.bodyTransform(p)));sockets.feet=rig.joints.map(j=>({...j.ankle,angle:j.footAngle}));
    blit(frame,sheet,{x:0,y:0,w:192,h:192},{x,y});blit(big,detail,{x:0,y:0,w:384,h:384},{x:x*2,y:y*2});blit(garmentMask(big,bounds(big),hero,row,'walk'),cloth,{x:0,y:0,w:384,h:384},{x:x*2,y:y*2});
    frames.push({x,y,pose:'walk-'+column,direction:DIRECTIONS[row],bounds:box,sockets,wearRuns:{...wearMasks(frame,sockets,hero,rig.joints),...rig.wearRuns},clothRuns:maskRuns(garmentMask(frame,box,hero,row,'walk')),joints:rig.joints,legOrder:rig.legOrder,hash:hash(frame.data)});
   }
  }
  const state=heavy?'heavywalk':'walk',id=hero+'-'+state,path=base+'runtime/'+id+'.png',detailPath=base+'runtime/'+id+'-detail.png',clothPath=base+'runtime/'+id+'-cloth.png',data=encodePng(sheet);
  files.set(path,data);files.set(detailPath,encodePng(detail));files.set(clothPath,encodePng(cloth));
  catalog.assets[id]={hero,state,path,detailPath,clothPath,frameSize:192,pivot:catalog.pivot,columns:COLUMNS.walk,nativeHeight:104,worldHeight:26,source:poses.source,sourceHash:poses.sourceHash,hash:hash(data),sourceHeight:poses.sourceHeight,sourceScale:poses.sourceScale,animation:'registered-painted-mesh',rig:WALK_RIG,frames};
 }
 const gearFile=new URL(base+'sources/theme-gear.png',root);
 if(existsSync(gearFile)){
  const bytes=readFileSync(gearFile),source=decodePng(bytes),cells=segment(source,6,4),sheet=surface(6*128,4*128),names=['beerhammer','barrelshield','coppersprayer','citrusshield','pfandsling','pfandshield'];catalog.gear={};
  cells.forEach((b,i)=>{const column=i%6,row=Math.floor(i/6),scale=96/Math.max(b.w,b.h),frame=surface(128,128);resample(source,frame,b,{x:Math.round((128-b.w*scale)/2),y:Math.round((128-b.h*scale)/2)},scale);const box=bounds(frame);blit(frame,sheet,{x:0,y:0,w:128,h:128},{x:column*128,y:row*128});
   // Grip locations are authored against the isolated source, not its cell margin.
   const grips=column===0?[[.77,.78],[.24,.78],[.77,.78],[.24,.78]]:column===2?[[.22,.69],[.77,.69],[.3,.70],[.7,.70]]:column===4?[[.50,.80],[.5,.80],[.5,.8],[.5,.8]]:Array(4).fill([.5,.52]);
   (catalog.gear[names[column]]||=[]).push({x:column*128,y:row*128,size:128,bounds:box,grip:{x:box.x+box.w*grips[row][0],y:box.y+box.h*grips[row][1]}});
  });files.set(base+'runtime/theme-gear.png',encodePng(sheet));catalog.gearPath=base+'runtime/theme-gear.png';catalog.gearSourceHash=hash(bytes);
 }
 catalog.complete=jobs.every(j=>catalog.assets[j.id])&&!!catalog.gear;
 files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return {files,catalog};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildRedesign({partial:process.argv.includes('--partial')});for(const [p,bytes]of files){const url=new URL(p,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);}console.log(JSON.stringify({sheets:Object.keys(catalog.assets).length,frames:Object.values(catalog.assets).reduce((n,a)=>n+a.frames.length,0),complete:catalog.complete}));}
