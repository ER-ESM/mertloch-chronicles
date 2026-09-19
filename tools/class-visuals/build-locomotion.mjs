import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {rigWalk,WALK_RIG} from '../redesign/walk-rig.mjs';
const root=new URL('../../',import.meta.url),folder='assets/content-art/locomotion/runtime/',hash=b=>createHash('sha256').update(b).digest('hex');
const humanEnemies=new Set(['scrounger','inspector','warden','kegler','jga']),humanBosses=new Set(['horst','sigi','klaus','timo']);
// Reviewed in native 192px coordinates. Keep long held props out of the leg cuts.
const props={villager0:[[112,109,12,53],[69,109,12,53],[113,109,12,53],[67,109,12,53]],villager4:[[104,54,14,108],[75,54,14,108],[104,54,14,108],[74,54,14,108]],kurt:[[69,62,21,100],[104,62,23,100],[114,62,18,100],[65,62,22,100]],villager7:[[108,120,25,42],[61,120,25,42],[57,120,25,42],[110,120,25,42]]};
const coats={
 villager7:{hipFraction:.90,kneeFraction:.95,stepReach:4,stepLift:2,groundDepth:2},
 fenja:{hipFraction:.84,kneeFraction:.92,stepReach:6,stepLift:2,groundDepth:2},
 hedwig:{hipFraction:.87,kneeFraction:.94,stepReach:5,stepLift:2,groundDepth:2},
 villager5:{hipFraction:.78,kneeFraction:.89,stepReach:7,stepLift:3,groundDepth:3},
 villager2:{hipFraction:.77,kneeFraction:.88,stepReach:7,stepLift:3,groundDepth:3},
 kalle:{hipFraction:.78,kneeFraction:.89,stepReach:7,stepLift:3,groundDepth:3},
 oskar:{hipFraction:.77,kneeFraction:.88,stepReach:7,stepLift:3,groundDepth:3},
 ida:{hipFraction:.75,kneeFraction:.87,stepReach:8,stepLift:4,groundDepth:3},
 horst:{hipFraction:.78,kneeFraction:.9,stepReach:10,stepLift:4}
};
export function buildLocomotion(){
 const sourceCatalog=JSON.parse(readFileSync(new URL('assets/precision/runtime/catalog.json',root))),catalog={version:1,rig:WALK_RIG,assets:{}},files=new Map();
 for(const [id,a] of Object.entries(sourceCatalog.assets)){
  if(!a.frames||!a.columns||!(a.kind==='npcs'||humanEnemies.has(id)||humanBosses.has(id)))continue;
  const bytes=readFileSync(new URL(a.path,root)),original=decodePng(bytes),size=a.frameSize,atlas=surface(size*8,size*4),frames=[];
  for(let row=0;row<4;row++){
   const idle=a.frames[row*a.columns.length],source=surface(size,size);blit(original,source,{x:idle.x,y:idle.y,w:size,h:size},{x:0,y:0});
   const preserved=surface(size,size),rect=props[id]?.[row];if(rect){const [x,y,w,h]=rect;blit(source,preserved,{x,y,w,h},{x,y});for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)source.data.fill(0,(yy*size+xx)*4,(yy*size+xx)*4+4);}
   for(let phase=0;phase<8;phase++){
    const r=rigWalk(source,phase,row,coats[id]),x=phase*size,y=row*size;
    if(rect){const [px,py,pw,ph]=rect;blit(preserved,r.image,{x:px,y:py,w:pw,h:ph},{x:px+Math.round(r.bodySway*size/192),y:py+Math.round(r.bodyOffset*size/192)});}
    const b=bounds(r.image);
    if(b.x<2||b.y<2||b.x+b.w>size-2||b.y+b.h>size-2)throw Error(id+' clipped walk '+row+':'+phase);
    blit(r.image,atlas,{x:0,y:0,w:size,h:size},{x,y});frames.push({x,y,bounds:b,joints:r.joints,legOrder:r.legOrder,hash:hash(r.image.data)});
   }
  }
  const path=folder+id+'-walk.png',data=encodePng(atlas);files.set(path,data);
  catalog.assets[id+'-walk']={...a,path,source:a.path,sourceHash:hash(bytes),hash:hash(data),width:atlas.width,height:atlas.height,columns:Array.from({length:8},(_,i)=>'walk-'+i),frames,stride:32*a.worldHeight/26,animation:'registered-two-leg-gait'};
 }
 files.set(folder+'catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return {files,catalog};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildLocomotion();for(const [p,b] of files){mkdirSync(new URL('.',new URL(p,root)),{recursive:true});writeFileSync(new URL(p,root),b);}console.log(Object.keys(catalog.assets).length+' human walk sheets exported.');}
