// Demo-Bogen aus dem Pre-Render-Katalog: Basis + Ausrüstungsebenen zusammengesetzt, 3× vergrößert.
// Aufruf: node tools/prerender/demo-sheet.mjs [hero] [asset,asset,...] [ausgabe.png]
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,decodePng,surface,blit} from '../sprite-pipeline/png.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const hero=process.argv[2]||'dieter',assets=(process.argv[3]||'jacket,helmet,pauldron,belt,boot,club').split(','),out=process.argv[4]||'visual-review/prerender-2026-09-18/demo-'+hero+'.png';
const cat=JSON.parse(readFileSync(root+'assets/prerender/runtime/catalog.json','utf8'));
const img=p=>decodePng(readFileSync(root+p));
const SIZE=cat.frameSize,SCALE=3,COLS=8,ROWS=4,CROP={x:48,y:28,w:96,h:140};
const sheet=surface(CROP.w*COLS*SCALE,CROP.h*ROWS*2*SCALE);
// Hintergrund: Zeltstoff
for(let i=0;i<sheet.data.length;i+=4){sheet.data[i]=0x22;sheet.data[i+1]=0x3a;sheet.data[i+2]=0x2f;sheet.data[i+3]=255;}
for(const [band,state] of [[0,'poses'],[1,'walk']]){
 const base=cat.assets[hero+'-'+state];if(!base)continue;const baseImg=img(base.path);
 const layers=assets.map(a=>({meta:cat.gear[hero+'-gear-'+a+'-'+state],image:cat.gear[hero+'-gear-'+a+'-'+state]?img(cat.gear[hero+'-gear-'+a+'-'+state].path):null})).filter(l=>l.meta&&l.image);
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
  const f=base.frames[row*COLS+col];const at={x:col*CROP.w*SCALE,y:(band*ROWS+row)*CROP.h*SCALE};
  blit(baseImg,sheet,{x:f.x+CROP.x,y:f.y+CROP.y,w:CROP.w,h:CROP.h},at,SCALE);
  for(const l of layers){const g=l.meta.frames[row*COLS+col];if(g?.bounds?.count)blit(l.image,sheet,{x:g.x+CROP.x,y:g.y+CROP.y,w:CROP.w,h:CROP.h},at,SCALE);}
 }
}
writeFileSync(root+out,encodePng(sheet));
console.log('Demo geschrieben: '+out+' ('+sheet.width+'×'+sheet.height+')');
