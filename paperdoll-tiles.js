// Kacheln lesen und Figur zusammensetzen – gemeinsam für den Hauptfaden (paperdoll-art.js) und den Rechen-Worker (paperdoll-worker.js,
// Handy-Leistung Runde 2, 27.09.2026). Derselbe Code an beiden Orten: gleiche Kacheln, gleiche Zusammensetzung, gleiche Pixel.
// Abhängigkeiten werden hereingereicht (Bildquelle, Leinwand), damit der Worker ImageBitmap + OffscreenCanvas nutzen kann.
import {composeCore,sources as orderSources} from './paperdoll-kern.js';

// part 0 Grundbogen, 1 Aktionsbogen (-akt), 2 Sonderbogen (-sonder: Ansagen der Dungeon-Figuren, cat.sonder, Bildnummern ab cat.frames.length)
export const sheetKeyOf=(cat,src,arch,dir,part)=>`${src}-${arch}${cat.dirs[dir]}${part===2?'-sonder':part?'-akt':''}`;
/** Teil eines Bilds: 2 = Sonderbild (ab cat.frames.length), 1 = Aktionsbild (ab cat.split), 0 = Grundbild. */
export const partOf=(cat,f)=>f>=cat.frames.length?2:f>=(cat.split??cat.frames.length)?1:0;
// sw/ne: eigener Bogen nur für seitenabhängige Quellen (cat.own), sonst gespiegeltes se/nw. Aktionsbilder hängen an der Waffenseite und
// haben für sw/ne eigene Bögen (cat.ownAkt), damit Körper und Kleidung in derselben Pose stehen.
export const baseDirOf=(cat,src,dir,part=0)=>{if(dir!=='sw'&&dir!=='ne'||part===2)return dir;return cat.own[dir].includes(src)||part&&cat.ownAkt?.[dir]?.includes(src)?dir:dir==='sw'?'se':'nw';};
/** Zeichenfolge der Quellen (Kern) ohne doppelten Körper; Dutt nur bei Archetypen mit Dutt. */
export function layersOf(cat,arch,srcs){const rest=new Set(srcs);rest.delete('koerper');return orderSources(rest,cat.sources).filter(s=>s!=='dutt'||cat.archetypes[arch].dutt);}
/** Bögen, die ein Bild braucht (Körper + Ebenen). */
export function sheetsFor(cat,arch,dir,f,srcs){const part=partOf(cat,f);return [...new Set(['koerper',...layersOf(cat,arch,srcs)].map(s=>sheetKeyOf(cat,s,arch,baseDirOf(cat,s,dir,part),part)))];}

/**
 * Kachelspeicher: jede Kachel (Bogen × Band × Bild × Spiegelung) wird einmal ausgelesen und auf ihren Inhalt zugeschnitten; viele Figuren
 * teilen sich Körper-, Hosen- und Schuhkacheln. Grenze nach Bytes (LRU), leere Kacheln merken sich nur „leer“.
 * getImage(sheetKey) → Bild/ImageBitmap oder null; makeCanvas() → Leinwand (DOM oder OffscreenCanvas).
 */
export function makeTiles({getImage,makeCanvas,budget=48e6}){
 let tileCanvas=null,tctx=null,tileBytes=0;const tileCache=new Map();
 function tile(cat,arch,src,dir,band,f){const {W,H}=cat,split=cat.split??cat.frames.length,part=partOf(cat,f),base=baseDirOf(cat,src,dir,part),mirror=base!==dir;
  const sk=sheetKeyOf(cat,src,arch,base,part),img=getImage(sk);if(!img)return null;const rows=cat.layout==='bands'?(cat.sources[src]?.bands||cat.bands):cat.bands,row=rows.indexOf(band);if(row<0)return null;
  const key=sk+'|'+row+'|'+f+(mirror?'|m':''),hit=tileCache.get(key);if(hit!==undefined){tileCache.delete(key);tileCache.set(key,hit);return hit;}
  // Zelle der Quelle (Katalog ab version 3: Bögen nur so groß wie der Inhalt der Quelle); ältere Bögen = volle Leinwand
  const cell=(part===2?cat.sources[src]?.sonder?.cell:cat.sources[src]?.cell)||{x:0,y:0,w:W,h:H},cw=cell.w,ch=cell.h;
  if(!tileCanvas){tileCanvas=makeCanvas();tctx=tileCanvas.getContext('2d',{willReadFrequently:true});}
  if(tileCanvas.width<cw||tileCanvas.height<ch){tileCanvas.width=Math.max(tileCanvas.width,cw);tileCanvas.height=Math.max(tileCanvas.height,ch);}
  tctx.clearRect(0,0,cw,ch);tctx.save();if(mirror){tctx.translate(cw,0);tctx.scale(-1,1);}
  tctx.drawImage(img,(part===2?f-cat.frames.length:part?f-split:f)*cw,row*ch,cw,ch,0,0,cw,ch);tctx.restore();const d=tctx.getImageData(0,0,cw,ch).data;
  let x0=cw,y0=ch,x1=-1,y1=-1;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(d[(y*cw+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;y1=y;}
  // Lage auf der Leinwand: gespiegelt liegt die Zelle bei W-cell.x-cell.w
  const cx=mirror?W-cell.x-cw:cell.x,cy=cell.y;
  let t=null;if(x1>=0){const w=x1-x0+1,h=y1-y0+1,data=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)data.set(d.subarray(((y+y0)*cw+x0)*4,((y+y0)*cw+x0+w)*4),y*w*4);t={data,x:cx+x0,y:cy+y0,w,h};tileBytes+=data.length;}
  tileCache.set(key,t);while(tileBytes>budget&&tileCache.size){const [k,v]=tileCache.entries().next().value;tileCache.delete(k);if(v)tileBytes-=v.data.length;}
  return t;}
 return {tile,clear(){tileCache.clear();tileBytes=0;},stats:()=>({count:tileCache.size,mb:+(tileBytes/1e6).toFixed(1)})};
}
/** Pixelfeld W×H einer Figur (composeCore) aus den Kacheln von `tile`. */
export function composeFigure(cat,tile,arch,dir,f,srcs){
 return composeCore(cat.W,cat.H,cat.bands,layersOf(cat,arch,srcs),(s,band)=>{if(s==='dutt'&&band!=='kopf')return null;if(cat.sources[s]&&!cat.sources[s].bands.includes(band))return null;return tile(cat,arch,s,dir,band,f);});
}
