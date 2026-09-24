// Laufzeit-Bögen der Anziehpuppe lesen wie paperdoll-art.js (tile): Zeilen = Bänder der Quelle (cat.layout 'bands'), Bilder ab cat.split im
// Aktionsbogen (-akt). Ab Katalog version 3 ist jede Kachel auf die Zelle der Quelle zugeschnitten (cat.sources[src].cell={x,y,w,h}):
// Spalte je Bild cell.w, Zeile je Band cell.h, Pixel (x,y) liegt bei (col*cell.w + x-cell.x, row*cell.h + y-cell.y). Ältere Kataloge:
// volle Leinwand W×H. Gemeinsam für die paperdoll-*-Tests, damit sie nicht jeder das Bogenformat nachbauen.
import {readFileSync,existsSync} from 'node:fs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';

export function sheetReader(RT,cat){const cache=new Map();
 const split=cat.split??cat.frames.length;
 const file=(src,arch,dir,frame)=>`${src}-${arch}${cat.dirs[dir]}${frame>=split?'-akt':''}.png`;
 const rows=src=>cat.layout==='bands'?(cat.sources[src]?.bands||cat.bands):cat.bands;
 /** Zelle der Quelle in Leinwandkoordinaten (ohne Zuschnitt: ganze Leinwand). */
 const cell=src=>cat.sources[src]?.cell||{x:0,y:0,w:cat.W,h:cat.H};
 const img=f=>{if(!cache.has(f))cache.set(f,decodePng(readFileSync(new URL(f,RT))));return cache.get(f);};
 /** Datei vorhanden? (Grundbogen für frame < split, sonst Aktionsbogen) */
 const has=(src,arch,dir,frame=0)=>existsSync(new URL(file(src,arch,dir,frame),RT));
 /** Deckende Pixel [x,y,r,g,b] (Leinwandkoordinaten) eines Bandes in einem Bild; leer, wenn die Quelle das Band nicht zeichnet. */
 function pixels(src,arch,dir,band,frame){const row=rows(src).indexOf(band),out=[];if(row<0)return out;const im=img(file(src,arch,dir,frame)),col=frame>=split?frame-split:frame,c=cell(src);
  for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){const i=((row*c.h+y)*im.width+col*c.w+x)*4;if(im.data[i+3])out.push([x+c.x,y+c.y,im.data[i],im.data[i+1],im.data[i+2]]);}return out;}
 /** Spaltenzahl beider Bögen zusammen = Bilder im Katalog? */
 const frames=(src,arch,dir)=>img(file(src,arch,dir,0)).width/cell(src).w+(split<cat.frames.length?img(file(src,arch,dir,split)).width/cell(src).w:0);
 return {file,has,pixels,frames,split,cell};}
