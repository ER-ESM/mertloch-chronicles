import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
import {CLASS_SPECS,TALENT_ROWS,TALENT_CELLS} from '../../content/talents.js';
import {E32_SKILL_MOTIFS} from '../../e32-art.js';
const root=new URL('../../',import.meta.url),base='assets/content-art/e32/',hash=b=>createHash('sha256').update(b).digest('hex');
// Find transparent gutters near the prompted grid, rather than assuming exact cell borders.
function cuts(im,axis,count){const length=axis==='x'?im.width:im.height,other=axis==='x'?im.height:im.width,values=new Uint32Array(length);for(let a=0;a<length;a++)for(let b=0;b<other;b++){const x=axis==='x'?a:b,y=axis==='x'?b:a;if(im.data[(y*im.width+x)*4+3]>=128)values[a]++;}const result=[0];for(let n=1;n<count;n++){const center=length*n/count,reach=length/count*.14;let best=Math.round(center),score=Infinity;for(let a=Math.round(center-reach);a<=center+reach;a++){const cost=values[a]+Math.abs(a-center)*.03;if(cost<score){score=cost;best=a;}}result.push(best);}return [...result,length];}
export function buildTalentArt(){
 const files=new Map(),catalog={version:1,density:4,talents:{},sources:[],atlases:{}},sheets=new Map();
 // E-71: Die Astra-Talentbilder gibt es nur für die drei E-32-Klassen; neue Klassen zeichnen ihr Talent-Icon (content/talents/<klasse>.js icon).
 const E32_CLASSES=['dieter','baerbel','kevin'];
 for(const [member,specs] of Object.entries(CLASS_SPECS).filter(([m])=>E32_CLASSES.includes(m))){
  const atlas=surface(640,576),path=base+'runtime/talents-'+member+'.png';
  for(const [specIndex,spec] of specs.entries()){
   const source=base+'sources/'+spec+'-v1.png',bytes=readFileSync(new URL(source,root)),im=decodePng(bytes);
   for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]>=128?255:0;
   const xs=cuts(im,'x',6),ys=cuts(im,'y',5);catalog.sources.push({source,sha256:hash(bytes),x:xs,y:ys});
   const cells=Array.from({length:30},(_,i)=>({x:xs[i%6],y:ys[Math.floor(i/6)],w:xs[i%6+1]-xs[i%6],h:ys[Math.floor(i/6)+1]-ys[Math.floor(i/6)]}));
   const scale=56/Math.max(...cells.flatMap(b=>[b.w,b.h]));
   for(const [i,t] of TALENT_ROWS[spec].entries()){
    const sourceRect=cells[i],frame=surface(64,64),at={x:Math.round((64-sourceRect.w*scale)/2),y:Math.round((64-sourceRect.h*scale)/2)};
    resample(im,frame,sourceRect,at,scale);const b=bounds(frame),cell=TALENT_CELLS[spec][i],x=cell.row*64,y=(specIndex*3+cell.path)*64,id=spec+'-'+i;
    if(b.w<10||b.h<10||b.x<2||b.y<2||b.x+b.w>62||b.y+b.h>62)throw Error('Unusable talent crop '+id);
    blit(frame,atlas,{x:0,y:0,w:64,h:64},{x,y});sheets.set(id,frame);
    catalog.talents[id]={atlas:path,x,y,cell:64,name:t.name,effect:t.info.effect,spec,...cell,source,sourceRect,bounds:b,sha256:hash(frame.data)};
   }
  }
  const bytes=encodePng(atlas);files.set(path,bytes);catalog.atlases[path]={sha256:hash(bytes)};
 }
 const signatures=JSON.parse(readFileSync(new URL('assets/class-visuals/runtime/catalog.json',root))),precision=JSON.parse(readFileSync(new URL('assets/precision/runtime/catalog.json',root))),icons=decodePng(readFileSync(new URL('assets/class-visuals/runtime/icons.png',root))),skillAtlas=surface(240,432),skillPath=base+'runtime/skills.png';catalog.skills={};
 for(const [row,spec]of Object.keys(TALENT_ROWS).filter(s=>E32_CLASSES.includes(s.split('-')[0])).entries())for(const [col,slot]of ['mark','burst','ground','buff','variant'].entries()){
  const id=E32_SKILL_MOTIFS[spec][slot],member=spec.split('-')[0];let source;
  if(id?.startsWith('signature:')){const a=signatures.icons[id.slice(10)];source=surface(64,64);blit(icons,source,{x:a.x,y:a.y,w:64,h:64},{x:0,y:0});}
  else if(id)source=sheets.get(id);
  else{const a=precision.assets['skill-'+member+'-'+slot];if(!a)throw Error('Missing base skill '+member+'/'+slot);source=decodePng(readFileSync(new URL(a.path,root)));}
  const frame=surface(48,48);resample(source,frame,{x:0,y:0,w:source.width,h:source.height},{x:0,y:0},48/source.width);blit(frame,skillAtlas,{x:0,y:0,w:48,h:48},{x:col*48,y:row*48});catalog.skills[spec+'/'+slot]={atlas:skillPath,x:col*48,y:row*48,cell:48,motif:id||'skill-'+member+'-'+slot,sha256:hash(frame.data)};
 }
 const skillBytes=encodePng(skillAtlas);files.set(skillPath,skillBytes);catalog.atlases[skillPath]={sha256:hash(skillBytes)};
 files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));
 return {files,catalog,sheets};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildTalentArt();for(const [p,b]of files){mkdirSync(new URL('.',new URL(p,root)),{recursive:true});writeFileSync(new URL(p,root),b);}console.log(Object.keys(catalog.talents).length+' talent icons exported.');}
