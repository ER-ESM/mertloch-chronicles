import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,blit,bounds} from './png.mjs';
import {segment} from './segment.mjs';
import {styles} from './config.mjs';

const root=new URL('../../assets/maifeld-prototype/',import.meta.url);
const palette=styles.find(s=>s.id==='detailpixel').palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const hash=b=>createHash('sha256').update(b).digest('hex');
const names=['body','nearFront','nearRear','farFront','farRear'];

export function buildBoarRig(){
 const source='keiler-rig-v1.png',raw=readFileSync(new URL('sources/'+source,root)),im=decodePng(raw);
 const cells=segment(im,5,4),atlas=surface(480,384);
 const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
 const bodyScale=29/median(cells.filter((_,i)=>i%5===0).map(b=>b.h));
 const legScale=16/median(cells.filter((_,i)=>i%5!==0).map(b=>b.h));
 const rig={version:1,source,sourceHash:hash(raw),atlas:'keiler-rig.png',height:37,pivot:{x:48,y:80},stride:32,directions:[]};
 for(const [row,direction] of ['se','sw','ne','nw'].entries()){
  const parts={};
  for(let col=0;col<5;col++){
   const b=cells[row*5+col],scale=col===0?bodyScale:legScale;
   const frame=surface(96,96);blit(im,frame,b,{x:4,y:4},scale,palette);
   const box=bounds(frame);
   if(box.x+box.w>92||box.y+box.h>92)throw Error('Rig part clipped: '+direction+' '+names[col]);
   blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:col*96,y:row*96});
   parts[names[col]]={source:b,rect:{x:col*96+box.x,y:row*96+box.y,w:box.w,h:box.h}};
  }
  const body=parts.body,w=body.rect.w;
  body.at={x:48-w/2,y:43};
  const east=direction.endsWith('e'),rearView=direction.startsWith('n');
  const front=rearView?.78:.67,rear=rearView?.34:.27;
  for(const name of names.slice(1)){
   const part=parts[name],far=name.startsWith('far'),frontLeg=name.endsWith('Front');
   let x=frontLeg?front:rear;if(far)x+=rearView?-.13:.10;
   part.pivot={x:part.rect.w/2,y:0};
   part.at={x:body.at.x+(east?x:1-x)*w,y:(far?77:80)-part.rect.h};
   part.phase={nearRear:0,nearFront:.25,farRear:.5,farFront:.75}[name];
  }
  rig.directions.push({id:direction,parts});
 }
 const bytes=encodePng(atlas);rig.atlasHash=hash(bytes);
 return new Map([['keiler-rig.png',bytes],['keiler-rig.json',Buffer.from(JSON.stringify(rig,null,2)+'\n')]]);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 mkdirSync(new URL('runtime/',root),{recursive:true});
 for(const [name,bytes] of buildBoarRig())writeFileSync(new URL('runtime/'+name,root),bytes);
 console.log('Built four fixed boar bodies and sixteen independently animated legs.');
}
