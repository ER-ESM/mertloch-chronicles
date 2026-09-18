import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
const root=new URL('../../',import.meta.url),base='assets/skill-fx/',hash=b=>createHash('sha256').update(b).digest('hex');
// Reviewed cell boundaries include disconnected droplets. These effects are not single silhouettes.
const sheets=[{source:'themes-v2.png',x:[0,260,543,890,1200,1512,1774],y:[0,310,585,887],names:['beer','citrus','electric']},{source:'utility-v2.png',x:[0,256,512,768,1024,1280,1536],y:[0,256,512,768,1024],names:['heal','ward','proc','hostile']}];
export function buildSkillFx(){
 const files=new Map(),atlas=surface(128*6,128*7),catalog={version:1,path:base+'runtime/effects.png',cell:128,frames:6,alpha:'binary',effects:{},sources:[]};let row=0;
 for(const sheet of sheets){const path=base+'sources/'+sheet.source,bytes=readFileSync(new URL(path,root)),im=decodePng(bytes);if(im.width!==sheet.x.at(-1)||im.height!==sheet.y.at(-1))throw Error('Unreviewed sheet dimensions '+path);
  // Discard the generated diffuse halo, keeping only the authored solid foreground material.
  for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]>=128?255:0;
  const scale=112/Math.max(...sheet.x.slice(1).map((x,i)=>x-sheet.x[i]),...sheet.y.slice(1).map((y,i)=>y-sheet.y[i]));
  catalog.sources.push({path,sha256:hash(bytes),scale,columns:sheet.x,rows:sheet.y});
  for(let r=0;r<sheet.names.length;r++,row++){
   const frames=[];
   for(let col=0;col<6;col++){
    const rect={x:sheet.x[col],y:sheet.y[r],w:sheet.x[col+1]-sheet.x[col],h:sheet.y[r+1]-sheet.y[r]},frame=surface(128,128);
    // Fixed per-sheet scale preserves the build-up and dissipation instead of stretching each silhouette.
    resample(im,frame,rect,{x:Math.round(64-rect.w*scale/2),y:Math.round(64-rect.h*scale/2)},scale);
    const b=bounds(frame);if(b.x<3||b.y<3||b.x+b.w>125||b.y+b.h>125)throw Error('Clipped '+sheet.names[r]+' '+col);
    blit(frame,atlas,{x:0,y:0,w:128,h:128},{x:col*128,y:row*128});frames.push({x:col*128,y:row*128,bounds:b,sha256:hash(frame.data)});
   }
   catalog.effects[sheet.names[r]]={frames};
  }
 }
 const png=encodePng(atlas);catalog.sha256=hash(png);files.set(catalog.path,png);files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return files;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){for(const [path,bytes]of buildSkillFx()){mkdirSync(new URL('.',new URL(path,root)),{recursive:true});writeFileSync(new URL(path,root),bytes);}console.log('7 effects × 6 authored frames exported.');}
