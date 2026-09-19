import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit,bounds} from '../sprite-pipeline/png.mjs';
import {segment} from '../sprite-pipeline/segment.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
import {bodyAnchor} from '../sprite-pipeline/build-walk.mjs';
import {rigWalk} from './walk-rig.mjs';
import {wearMasks} from './wear-masks.mjs';
const root=new URL('../../',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
function runs(mask){const out=[];for(let y=0;y<192;y++){let x=0;while(x<192){while(x<192&&!mask[y*192+x])x++;const start=x;while(x<192&&mask[y*192+x])x++;if(x>start)out.push([y,start,x-start]);}}return out;}
function exclusiveWear(frame,wear){
 const owned=new Uint8Array(192*192);
 for(const slot of ['feet','legs','body']){const mask=new Uint8Array(192*192);for(const [y,x,w]of wear[slot])for(let xx=x;xx<x+w;xx++){const i=y*192+xx;if(!owned[i]&&frame.data[i*4+3]){mask[i]=1;owned[i]=1;}}wear[slot]=runs(mask);}return wear;
}
function dressing(frame,s,hero,pose,b,joints){
 const wear=wearMasks(frame,s,hero,joints),masks=Object.fromEntries(['body','legs','feet'].map(k=>[k,new Uint8Array(192*192)]));
 const dead=pose==='dead',west=s.west;
 for(let y=0;y<192;y++)for(let x=0;x<192;x++){
  const i=(y*192+x)*4,[r,g,blue,a]=frame.data.subarray(i,i+4);if(!a)continue;
  const u=(x-b.x)/b.w,v=(y-b.y)/b.h,hand=[s.main,s.off].some(h=>Math.hypot(x-h.x,y-h.y)<6);
  const cream=r>70&&g>r*.82&&blue>r*.60,foot=s.feet.some(f=>Math.hypot(x-f.x,y-f.y+3)<8);
  const headLeft=s.head.x<s.waist.x,lower=dead?(headLeft?x>s.waist.x:x<s.waist.x):y>=s.waist.y;
  if(foot&&!hand)masks.feet[y*192+x]=1;
  else if(lower&&!hand)masks.legs[y*192+x]=1;
  else if(cream&&!hand&&(dead?Math.hypot(x-s.head.x,y-s.head.y)>b.h*.28:y>s.head.y+b.h*.25))masks.body[y*192+x]=1;
 }
 // Reject isolated skin highlights; cloth is a contiguous garment, not freckles.
 const visited=new Uint8Array(192*192),groups=[];
 for(let i=0;i<visited.length;i++){if(visited[i]||!masks.body[i])continue;const q=[i];visited[i]=1;for(let n=0;n<q.length;n++){const x=q[n]%192,y=Math.floor(q[n]/192);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*192+xx;if(xx>=0&&xx<192&&yy>=0&&yy<192&&!visited[k]&&masks.body[k]){visited[k]=1;q.push(k);}}}groups.push(q);}
 for(const g of groups)if(g.length<6)for(const i of g)masks.body[i]=0;
 return {...wear,...Object.fromEntries(Object.entries(masks).map(([k,v])=>[k,runs(v)]))};
}
/** Authored unclothed poses share one atlas scale; walks use the same continuous rig. */
export function buildUnderwear(catalog,files,{frameSockets,cleanAlphaIslands}){
 for(const a of Object.values(catalog.assets).filter(a=>!a.state.includes('walk'))){
  const id=a.hero+'-'+a.state,source='assets/redesign/sources/underwear/'+id+'.png',bytes=readFileSync(new URL(source,root)),im=decodePng(bytes),cols=a.columns.length,cells=segment(im,cols,4);
  const standing=cells.filter((_,i)=>a.state==='specials'?i%cols<2:[0,3].includes(i%cols)),scale=104/median(standing.map(b=>b.h));
  const native=surface(cols*192,768),detail=surface(cols*384,1536);
  for(const [i,b]of cells.entries()){
   const f=a.frames[i],row=Math.floor(i/cols),frame=surface(192,192),big=surface(384,384),anchor=f.pose==='dead'?b.x+b.w/2:bodyAnchor(im,b),at={x:96-Math.round((anchor-b.x)*scale),y:160-Math.round(b.h*scale)};
   resample(im,frame,b,at,scale);resample(im,big,b,{x:at.x*2,y:at.y*2},scale*2);cleanAlphaIslands(frame);cleanAlphaIslands(big);
   const box=bounds(frame),s=frameSockets(frame,box,row,a.state,i%cols);
   if(f.pose==='dead'&&(a.hero!=='dieter'||row===3)){
    // The new lying poses face east/west in both front and back rows.
    Object.assign(s,frameSockets(frame,box,row%2,a.state,i%cols));s.back=row>1;
   }else if(f.pose!=='dead')s.waist.y=box.y+box.h*(a.state==='heavy'&&i%cols===1?.65:f.pose==='rest'?.75:a.hero==='dieter'?.59:.55);
   if(f.pose==='dead'){
    const left=s.head.x<s.waist.x;s.main={x:box.x+box.w*(left?.18:.82),y:box.y+box.h*.76};s.off={x:box.x+box.w*(left?.30:.70),y:box.y+box.h*.80};
   }
   if(a.state==='poses'&&[0,3].includes(i%cols)){
    const left={x:box.x+box.w*.10,y:box.y+box.h*.62},right={x:box.x+box.w*.91,y:box.y+box.h*.61};
    s.main=s.west!==s.back?right:left;s.off=s.west!==s.back?left:right;
   }
   f.base={bounds:box,sockets:s,wearRuns:dressing(frame,s,a.hero,f.pose,box),hash:hash(frame.data)};
   blit(frame,native,{x:0,y:0,w:192,h:192},{x:f.x,y:f.y});blit(big,detail,{x:0,y:0,w:384,h:384},{x:f.x*2,y:f.y*2});
  }
  a.basePath='assets/redesign/runtime/'+id+'-base.png';a.baseDetailPath='assets/redesign/runtime/'+id+'-base-detail.png';a.baseSource=source;a.baseSourceHash=hash(bytes);a.baseScale=scale;
  files.set(a.basePath,encodePng(native));files.set(a.baseDetailPath,encodePng(detail));
 }
 for(const a of Object.values(catalog.assets).filter(a=>a.state.includes('walk'))){
  const heavy=a.state==='heavywalk',poses=catalog.assets[a.hero+(heavy?'-heavy':'-poses')],source=decodePng(files.get(poses.baseDetailPath)),native=surface(1536,768),detail=surface(3072,1536);
  for(let row=0;row<4;row++){
   const idle=poses.frames[row*poses.columns.length],src=surface(384,384);blit(source,src,{x:idle.x*2,y:idle.y*2,w:384,h:384},{x:0,y:0});
   for(let col=0;col<8;col++){
    const f=a.frames[row*8+col],rig=rigWalk(src,col,row,{hero:a.hero,heavy,underwear:true,sockets:idle.base.sockets}),frame=surface(192,192);resample(rig.image,frame,{x:0,y:0,w:384,h:384},{x:0,y:0},.5);
    const s=structuredClone(idle.base.sockets);for(const k of ['main','off','head','torso','waist'])Object.assign(s[k],rig.bodyTransform(s[k]));s.shoulders.forEach(p=>Object.assign(p,rig.bodyTransform(p)));s.feet=rig.joints.map(j=>({...j.ankle,angle:j.footAngle}));
    const box=bounds(frame),wear=dressing(frame,s,a.hero,f.pose,box,rig.joints);
    // Include boxer waistband above the rig's hip cut; keep the articulated ownership below it.
    const hip=Math.min(...rig.joints.map(j=>j.hip.y));wear.legs=[...wear.legs.filter(([y])=>y<hip),...rig.wearRuns.legs];wear.feet=rig.wearRuns.feet;
    f.base={bounds:box,sockets:s,wearRuns:exclusiveWear(frame,wear),joints:rig.joints,legOrder:rig.legOrder,hash:hash(frame.data)};
    blit(frame,native,{x:0,y:0,w:192,h:192},{x:f.x,y:f.y});blit(rig.image,detail,{x:0,y:0,w:384,h:384},{x:f.x*2,y:f.y*2});
   }
  }
  const id=a.hero+'-'+a.state;a.basePath='assets/redesign/runtime/'+id+'-base.png';a.baseDetailPath='assets/redesign/runtime/'+id+'-base-detail.png';a.baseSource=poses.baseSource;a.baseSourceHash=poses.baseSourceHash;
  files.set(a.basePath,encodePng(native));files.set(a.baseDetailPath,encodePng(detail));
 }
 catalog.dressing={version:1,slots:['body','legs','feet','hands','wrists'],complete:true};
}
