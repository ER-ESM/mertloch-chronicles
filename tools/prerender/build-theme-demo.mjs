// Deterministic import of the authored imagegen turnarounds; no invented animation frames.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,bounds,gridCell,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
const root=new URL('../../',import.meta.url),base='assets/theme-demo/';
const definitions=[
 {id:'dieter-braumeister',hero:'dieter',name:'Dosen-Dieter',theme:'Hopfen & Hämmer',subtitle:'Der Braumeister',color:'#d7aa60',description:'Kupfer, Eiche und ein guter Schluck Standfestigkeit.',gear:[{name:'Schaumkrone',type:'Bierkrug-Hammer',detail:'Gehämmerter Stahl, Kupferbänder und ein kräftiger Eichenstiel.'},{name:'Letzte Runde',type:'Fassschild',detail:'Genieteter Eisenreif, sichtbare Holzmaserung und ein massiver Messinghahn.'},{name:'Tragbares Feierabendfass',type:'Rücken & Rüstung',detail:'Ledergurte, Hopfenranken und kupferne Schulterbeschläge.'}]},
 {id:'anni-aperol',hero:'baerbel',name:'Aperol-Anni',theme:'Zitrus & Zauber',subtitle:'Die Aperol-Alchemistin',color:'#ee9e61',description:'Orangenlicht, feines Glas und Heilung mit Nachdruck.',gear:[{name:'Sonnenstrahl',type:'Hochdruckspray',detail:'Polierte Kupferdüse, orangefarbenes Reservoir und eine grüne Druckleitung.'},{name:'Zitruswache',type:'Heilerschild',detail:'Orangensegmente aus Glas in einem gehämmerten Kupferrahmen.'},{name:'Goldene Stunde',type:'Kleidung & Tränke',detail:'Blumenstickerei, karierte Schürze, kleine Elixiere und Messingschnallen.'}]},
 {id:'kevin-pfand',hero:'kevin',name:'Klo-Kevin',theme:'Pfand & Präzision',subtitle:'Der Pfand-Ingenieur',color:'#a8bc85',description:'Aus Leergut wird Ausrüstung. Aus Kabelbindern wird Kunst.',gear:[{name:'Rückgaberecht',type:'Mechanische Pfandschleuder',detail:'Holzgabel, Messingbeschläge, doppelte Gummibänder und ein grünes Visier.'},{name:'Drei gewinnt',type:'Flaschenträger',detail:'Grüne und bernsteinfarbene Mehrwegflaschen in einem Metall-Holz-Gestell.'},{name:'Alles noch gut',type:'Werkzeug & Kleidung',detail:'Kronkorken-Panzerung, geflickter Denim, Karabiner und verstärkte Taschen.'}]}
];
export function buildThemeDemo(){
 const files=new Map(),catalog={version:1,source:'built-in imagegen',type:'authored-theme-turnarounds',directions:['se','sw','ne','nw'],frameSize:192,pivot:{x:96,y:160},nativeHeight:104,worldHeight:26,animated:false,modularGear:false,assets:{}};
 for(const def of definitions){
  const source=base+'sources/'+def.id+'.png',bytes=readFileSync(new URL(source,root)),im=decodePng(bytes);
  const cells=Array.from({length:4},(_,i)=>bounds(im,gridCell(im,i%2,Math.floor(i/2),2,2)));
  // One scale for the entire turnaround; never stretch individual views independently.
  const referenceHeight=cells[0].h,scale=104/referenceHeight,out=surface(192*4,192),frames=[];
  cells.forEach((b,i)=>{
   const frame=surface(192,192),x=96-Math.round(b.w*scale/2),y=160-Math.round(b.h*scale);
   resample(im,frame,b,{x,y},scale);
   const f={x:i*192,y:0,bounds:bounds(frame),sourceBounds:b};
   if(f.bounds.x<2||f.bounds.y<2||f.bounds.x+f.bounds.w>190||f.bounds.y+f.bounds.h>190)throw Error('Clipped export: '+def.id);
   blit(frame,out,{x:0,y:0,w:192,h:192},{x:f.x,y:0});frames.push(f);
   // Detail views retain source resolution and transparency; native sprites are exported separately.
   const detail=surface(b.w,b.h);for(let yy=0;yy<b.h;yy++)detail.data.set(im.data.subarray(((b.y+yy)*im.width+b.x)*4,((b.y+yy)*im.width+b.x+b.w)*4),yy*b.w*4);
   files.set(base+'runtime/'+def.id+'-'+catalog.directions[i]+'.png',encodePng(detail));
  });
  const path=base+'runtime/'+def.id+'.png',data=encodePng(out);files.set(path,data);
  catalog.assets[def.id]={...def,path,source,sourceHash:createHash('sha256').update(bytes).digest('hex'),hash:createHash('sha256').update(data).digest('hex'),frames,referenceHeight,scale,detailPaths:catalog.directions.map(d=>base+'runtime/'+def.id+'-'+d+'.png')};
 }
 files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));
 return {files,catalog};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildThemeDemo();for(const [path,bytes] of files){const url=new URL(path,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);}console.log(JSON.stringify({themes:Object.keys(catalog.assets).length,files:files.size}));}
