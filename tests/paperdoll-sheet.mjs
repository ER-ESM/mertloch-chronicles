// Laufzeit-Bögen der Anziehpuppe lesen wie paperdoll-art.js (tile): Zeilen = Bänder der Quelle (cat.layout 'bands'), Bilder ab cat.split im
// Aktionsbogen (-akt). Gemeinsam für die paperdoll-*-Tests, damit sie nicht jeder das Bogenformat nachbauen.
import {readFileSync,existsSync} from 'node:fs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';

export function sheetReader(RT,cat){const cache=new Map();
 const split=cat.split??cat.frames.length;
 const file=(src,arch,dir,frame)=>`${src}-${arch}${cat.dirs[dir]}${frame>=split?'-akt':''}.png`;
 const rows=src=>cat.layout==='bands'?(cat.sources[src]?.bands||cat.bands):cat.bands;
 const img=f=>{if(!cache.has(f))cache.set(f,decodePng(readFileSync(new URL(f,RT))));return cache.get(f);};
 /** Datei vorhanden? (Grundbogen für frame < split, sonst Aktionsbogen) */
 const has=(src,arch,dir,frame=0)=>existsSync(new URL(file(src,arch,dir,frame),RT));
 /** Deckende Pixel [x,y,r,g,b] eines Bandes in einem Bild; leer, wenn die Quelle das Band nicht zeichnet. */
 function pixels(src,arch,dir,band,frame){const row=rows(src).indexOf(band),out=[];if(row<0)return out;const im=img(file(src,arch,dir,frame)),col=frame>=split?frame-split:frame;
  for(let y=0;y<cat.H;y++)for(let x=0;x<cat.W;x++){const i=((row*cat.H+y)*im.width+col*cat.W+x)*4;if(im.data[i+3])out.push([x,y,im.data[i],im.data[i+1],im.data[i+2]]);}return out;}
 /** Spaltenzahl beider Bögen zusammen = Bilder im Katalog? */
 const frames=(src,arch,dir)=>img(file(src,arch,dir,0)).width/cat.W+(split<cat.frames.length?img(file(src,arch,dir,split)).width/cat.W:0);
 return {file,has,pixels,frames,split};}
