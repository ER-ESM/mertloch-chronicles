import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit} from '../sprite-pipeline/png.mjs';
import {segment} from '../sprite-pipeline/segment.mjs';
import {resample,precisionColor} from '../sprite-pipeline/precision-resample.mjs';
import {UI_ICONS,UI_RECIPES,UI_STATES} from '../../ui-kit.js';
const root=new URL('../../',import.meta.url),base='assets/ui-kit/runtime/',hash=v=>createHash('sha256').update(v).digest('hex');
const frameNames=['panel','paper','inset','primary','danger','character'],states=['rest','hover','pressed','disabled'];
export const MMO_ICON_NAMES=['account','identity','group','chat','realm','connected','disconnected','queue','mail','storage','search','settings'];
const source=id=>{const path='assets/ui-kit/sources/'+id+'.png',bytes=readFileSync(new URL(path,root));return{path,hash:hash(bytes),image:decodePng(bytes)};};
function tint(im,state){const out=surface(im.width,im.height);for(let i=0;i<im.data.length;i+=4){if(!im.data[i+3])continue;const rgb=[...im.data.subarray(i,i+3)],l=rgb[0]*.25+rgb[1]*.6+rgb[2]*.15;
 const next=state==='hover'?rgb.map(v=>Math.min(255,v*1.12+6)):state==='pressed'?rgb.map(v=>v*.74):state==='disabled'?rgb.map(v=>v*.22+l*.45):rgb;
 out.data.set([...(state==='rest'?rgb:precisionColor(next.map(Math.round))),255],i);}return out;}
export function buildUiKit(){
 const files=new Map(),catalog={version:1,style:'Mertloch / Bierdeckel',states:UI_STATES,frames:{},icons:{},illustrations:{},recipes:UI_RECIPES,minimumTouch:44,source:'tools/ui-kit/build.mjs'};
 const frames=source('frames'),cells=segment(frames.image,3,2),atlas=surface(96*6,96*4);
 cells.forEach((b,i)=>{
  const name=frameNames[i],scale=96/Math.max(b.w,b.h),im=surface(Math.round(b.w*scale),Math.round(b.h*scale));resample(frames.image,im,b,{x:0,y:0},scale);
  for(const [row,state]of states.entries()){
   const pixels=tint(im,state),path=base+`frame-${name}-${state}.png`,data=encodePng(pixels);files.set(path,data);blit(pixels,atlas,{x:0,y:0,w:pixels.width,h:pixels.height},{x:i*96,y:row*96});
   catalog.frames[name+'-'+state]={path,width:im.width,height:im.height,slice:[16,16,16,16],cssBorder:8,minSize:[32,32],atlas:{x:i*96,y:row*96,w:im.width,h:im.height},source:frames.path,sourceHash:frames.hash,sourceBounds:b,transform:state,hash:hash(data)};
  }
  const texture=surface(24,24),region={x:b.x+b.w*.40,y:b.y+b.h*.40,w:b.w*.20,h:b.h*.20};resample(frames.image,texture,region,{x:0,y:0},24/region.w);
  const path=base+'texture-'+name+'.png';files.set(path,encodePng(texture));catalog.frames[name+'-rest'].texture=path;
 });
 files.set(base+'frames.png',encodePng(atlas));catalog.frameAtlas={path:base+'frames.png',width:atlas.width,height:atlas.height};
 for(const [id,a]of Object.entries(UI_ICONS).filter(([,a])=>a.reused))catalog.icons[id]={...a,sha256:hash(readFileSync(new URL(a.path,root)))};
 const icons=source('mmo-icons'),parts=segment(icons.image,4,3),iconAtlas=surface(48*4,48*3);
 parts.forEach((b,i)=>{const id=MMO_ICON_NAMES[i],im=surface(48,48),scale=42/Math.max(b.w,b.h);resample(icons.image,im,b,{x:Math.round((48-b.w*scale)/2),y:Math.round((48-b.h*scale)/2)},scale);const path=base+'icon-'+id+'.png',bytes=encodePng(im);files.set(path,bytes);blit(im,iconAtlas,{x:0,y:0,w:48,h:48},{x:i%4*48,y:Math.floor(i/4)*48});catalog.icons[id]={path,size:48,atlas:{x:i%4*48,y:Math.floor(i/4)*48,w:48,h:48},source:icons.path,sourceHash:icons.hash,hash:hash(bytes),reused:false};});
 files.set(base+'mmo-icons.png',encodePng(iconAtlas));catalog.iconAtlas={path:base+'mmo-icons.png',width:192,height:144};
 for(const id of ['village-gate','clan-hall']){const src=source(id),scale=960/src.image.width,im=surface(960,Math.round(src.image.height*scale));resample(src.image,im,{x:0,y:0,w:src.image.width,h:src.image.height},{x:0,y:0},scale);const path=base+id+'.png',bytes=encodePng(im);files.set(path,bytes);catalog.illustrations[id]={path,width:im.width,height:im.height,source:src.path,sourceHash:src.hash,hash:hash(bytes),focalPoint:id==='village-gate'?[.73,.52]:[.5,.68]};}
 files.set(base+'catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));
 return{files,catalog};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildUiKit();for(const [path,bytes]of files){const url=new URL(path,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);}console.log(JSON.stringify({files:files.size,frames:Object.keys(catalog.frames).length,icons:Object.keys(catalog.icons).length,illustrations:Object.keys(catalog.illustrations).length}));}
