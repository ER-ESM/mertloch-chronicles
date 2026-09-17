import {readFileSync} from 'node:fs';
import {APEROL_ART,TALENT_ART,CLASS_SPECS,DETAIL_ICONS,ICONS} from '../../content/index.js';
import {surface,bounds,gridCell,blit} from './png.mjs';
import {segment,components} from './segment.mjs';
import {resample} from './precision-resample.mjs';
const root=new URL('../../',import.meta.url);
const skillOrder=['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash'];
const extras={dieter:['barricade','slam','keg'],baerbel:['sanctuary','infusion','encore'],kevin:['detonate','magnet','snare']};
const semanticEdges={x:[0,251,500,751,1002,1254],y:[0,250,493,733,969,1254]};
const semanticRect=i=>{const b=edgeRect(semanticEdges,i,5);return{x:b.x+4,y:b.y+4,w:b.w-8,h:b.h-8};};
const edgeRect=(edges,i,cols)=>({x:edges.x[i%cols],y:edges.y[Math.floor(i/cols)],w:edges.x[i%cols+1]-edges.x[i%cols],h:edges.y[Math.floor(i/cols)+1]-edges.y[Math.floor(i/cols)]});
export function buildPrecisionIcons({catalog,put,read,hashSource}){
 const icon=(id,source,b,kind='items')=>{const im=read(source),out=surface(64,64),s=Math.min(58/b.w,58/b.h);resample(im,out,b,{x:Math.floor((64-Math.round(b.w*s))/2),y:Math.floor((64-Math.round(b.h*s))/2)},s);put(id,out,{kind,source,sourceHash:hashSource(source),sourceBounds:b,padding:3});};
 // Skills retain all established IDs and motifs, exported at their actual action-button resolution.
 for(const member of ['dieter','baerbel','kevin']){
  const source=member==='baerbel'?APEROL_ART.path+'skills.png':'assets/clan-skills-013/'+member+'.png',im=read(source),names=[...skillOrder,...extras[member],...CLASS_SPECS[member]];
 for(let i=0;i<names.length;i++){const b=member==='baerbel'?bounds(im,edgeRect(APEROL_ART.skills,i,5)):gridCell(im,i%4,Math.floor(i/4),4,4);icon('skill-'+member+'-'+names[i],source,b,'skills');}
  const path=member==='baerbel'?APEROL_ART.path+'talents.png':TALENT_ART.path+member+'.png',a=read(path),edges=member==='baerbel'?APEROL_ART.talents:TALENT_ART.edges[member];
  for(let i=0;i<30;i++){const id=CLASS_SPECS[member][Math.floor(i/10)]+'-'+i%10;if(catalog.assets[id])continue;icon(id,path,bounds(a,edgeRect(edges,i,5)),'talents');}
 }
 const semantic='assets/content-art/items/semantic-atlas.png',sem=read(semantic);
 for(let i=0;i<DETAIL_ICONS.length;i++){const id=DETAIL_ICONS[i];if(!catalog.assets[id])icon(id,semantic,semanticRect(i));}
 icon('megafon',semantic,semanticRect(17));
 icon('auto-baerbel',APEROL_ART.path+'skills.png',bounds(read(APEROL_ART.path+'skills.png'),edgeRect(APEROL_ART.skills,16,5)));
 for(const member of ['dieter','baerbel','kevin'])catalog.aliases['skill-'+member+'-auto']='auto-'+member;
 // Rendered equipment and inventory symbols come from the same detailed source parts.
 const gearSource='assets/maifeld-live/sources/equipment.png',gear=read(gearSource),cells=segment(gear,8,5),config=JSON.parse(readFileSync(new URL('tools/sprite-pipeline/live-prompts.json',root))).jobs.find(j=>j.id==='equipment'),atlas=surface(1024,640),parts={};
 for(const[i,id]of config.parts.entries()){
  const b=cells[i],out=surface(128,128),s=96/Math.max(b.w,b.h);resample(gear,out,b,{x:16,y:16},s);const box=bounds(out);blit(out,atlas,{x:0,y:0,w:128,h:128},{x:i%8*128,y:Math.floor(i/8)*128});parts[id]={x:i%8*128+box.x,y:Math.floor(i/8)*128+box.y,w:box.w,h:box.h};icon('gear-'+id,gearSource,b);
 }
 put('equipment-parts',atlas,{kind:'library',source:gearSource,sourceHash:hashSource(gearSource),padding:0});catalog.equipment=parts;
 const gearAliases={coat:'jacket',boots:'boot',necklace:'chain',shoulders:'pauldron',bracers:'bracer',gloves:'glove',trousers:'trouser',reinforced:'club','anni-spray':'sprayer',speaker:'sprayer',trinket:'pendant'};
 for(const id of ICONS){if(catalog.assets[id])continue;const p=gearAliases[id]||id;if(parts[p])catalog.aliases[id]='gear-'+p;}
 // Remaining general inventory/HUD motifs originate in the existing high resolution icon sheet.
 const names=['bottle','coat','boots','ring','food','water','scrap','cable','paper','reinforced','coins','bag','book','map','quest','person','menu','sound','speaker','dash','shield','mark','burst','interrupt'];
 const src='assets/maifeld-ui-011/icons.png',ui=read(src),clean={...ui,data:ui.data.slice()};
 for(let i=0;i<clean.data.length;i+=4)if(Math.min(...clean.data.subarray(i,i+3))>185&&Math.max(...clean.data.subarray(i,i+3))-Math.min(...clean.data.subarray(i,i+3))<19)clean.data[i+3]=0;
 const pieces=components(clean);
 for(let i=0;i<names.length;i++){const id=names[i];if(catalog.assets[id]||catalog.aliases[id])continue;const parts=pieces.filter(p=>Math.floor(p.cx/clean.width*6)===i%6&&Math.floor(p.cy/clean.height*4)===Math.floor(i/6)),left=Math.min(...parts.map(p=>p.x)),top=Math.min(...parts.map(p=>p.y)),b={x:left,y:top,w:Math.max(...parts.map(p=>p.x+p.w))-left,h:Math.max(...parts.map(p=>p.y+p.h))-top},out=surface(64,64),s=Math.min(58/b.w,58/b.h);resample(clean,out,b,{x:Math.floor((64-Math.round(b.w*s))/2),y:Math.floor((64-Math.round(b.h*s))/2)},s);put(id,out,{kind:'items',source:src,sourceHash:hashSource(src),sourceBounds:b,padding:3});}
 catalog.coverage={itemIcons:ICONS.map(id=>({id,asset:catalog.aliases[id]||id})),skills:Object.keys(catalog.assets).filter(id=>id.startsWith('skill-')),talents:Object.values(CLASS_SPECS).flat().flatMap(spec=>Array.from({length:10},(_,i)=>spec+'-'+i))};
}
