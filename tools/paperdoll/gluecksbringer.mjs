// Glücksbringer an der Anziehpuppe (2026-09-27): zwei getragene Glücksbringer dürfen sich nie überdecken.
// Jeder Glücksbringer hat Fassungen (puppe.mjs GLUECKSBRINGER: Stammquelle + Ausweichfassungen `_gegen` = andere Körperseite,
// `_guertel` = am Gürtel statt am Hals). Hier wird aus den fertigen Laufzeit-Bögen gemessen, welche Fassungen sich überdecken; die Wahl
// trifft paperdoll-kern.js gluecksbringerWahl (Spiel und Werkzeug gleich).
//
// Katalog cat.gluecksbringer = {toleranz, fassungen:{id:[Stamm, Ausweich …]}, deckung:{'a>b':px}}
//  deckung['a>b'] = größte Zahl sichtbarer Pixel, die eine der beiden Fassungen verliert, wenn a vor b gezeichnet wird – über alle
//  Archetypen × Richtungen × Bilder; nur Werte über der Toleranz (Berührung an der Kontur zählt nicht).
// Gemessen wie das Spiel zeichnet (paperdoll-kern.js composeCore): Band für Band, im Band erst der Körper, dann a, dann b. b verdeckt ein
// Pixel von a, wenn b dort im selben oder einem höheren Band liegt; a verdeckt b nur aus einem höheren Band. Sichtbar ist ein Pixel, solange
// der Körper ihn nicht aus einem höheren Band verdeckt. sw/ne ohne eigenen Bogen = gespiegeltes se/nw (paperdoll-art.js baseDir).
import {readFileSync,existsSync} from 'node:fs';
import {decodePng} from '../sprite-pipeline/png.mjs';

/** Leinwandpixel, die als Berührung gelten (bei Weltgröße k = 0,3–0,6 weniger als ein Pixel). */
export const TOLERANZ=3;

const own=(cat,src,dir,f)=>dir==='se'||dir==='nw'||!!cat.own[dir]?.includes(src)||f>=cat.split&&!!cat.ownAkt?.[dir]?.includes(src);

/** Oberstes Band je Pixel einer Quelle, je Archetyp × Richtung × Bild: {arch:{dir:[{idx:Int32Array (aufsteigend), band:Int8Array, box}]}}. */
export function bandKarten(RT,cat,src){const s=cat.sources[src],c=s.cell,split=cat.split??cat.frames.length,imgs=new Map(),out={};
 const img=(dir,arch,part)=>{const f=`${RT}/${src}-${arch}${cat.dirs[dir]}${part?'-akt':''}.png`,k=f;if(!imgs.has(k))imgs.set(k,existsSync(f)?decodePng(readFileSync(f)):null);return imgs.get(k);};
 for(const arch of Object.keys(cat.archetypes)){out[arch]={};
  for(const dir of Object.keys(cat.dirs)){out[arch][dir]=cat.frames.map((_,f)=>{const mine=own(cat,src,dir,f),d=mine?dir:dir==='sw'?'se':'nw',part=f>=split,im=img(d,arch,part),col=part?f-split:f;
    const top=new Map();if(!im)return {idx:new Int32Array(0),band:new Int8Array(0),box:null};
    s.bands.forEach((b,row)=>{const bi=cat.bands.indexOf(b);for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){const i=((row*c.h+y)*im.width+col*c.w+x)*4;if(!im.data[i+3])continue;
     const X=mine?x+c.x:cat.W-1-(x+c.x),Y=y+c.y,p=Y*cat.W+X;if(!(top.get(p)>=bi))top.set(p,bi);}});
    const idx=Int32Array.from([...top.keys()].sort((a,b)=>a-b)),band=Int8Array.from(idx,p=>top.get(p));
    let x0=1e9,y0=1e9,x1=-1,y1=-1;for(const p of idx){const x=p%cat.W,y=p/cat.W|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    return {idx,band,box:x1<0?null:[x0,y0,x1,y1]};});}}
 return out;}

/** Nur die über dem Körper sichtbaren Pixel (Körper aus einem höheren Band verdeckt). */
function sichtbar(k,koerper){const keep=[];let j=0;const K=koerper.idx,KB=koerper.band;
 for(let i=0;i<k.idx.length;i++){const p=k.idx[i];while(j<K.length&&K[j]<p)j++;if(j<K.length&&K[j]===p&&KB[j]>k.band[i])continue;keep.push(i);}
 const idx=Int32Array.from(keep,i=>k.idx[i]),band=Int8Array.from(keep,i=>k.band[i]);return {idx,band,box:k.box};}

/** Deckung zweier Fassungen in einem Bild, beide Zeichenfolgen: [a vor b, b vor a] (je größter Verlust einer der beiden). */
export function deckungBild(A,B){if(!A.box||!B.box||A.box[2]<B.box[0]||B.box[2]<A.box[0]||A.box[3]<B.box[1]||B.box[3]<A.box[1])return [0,0];
 let i=0,j=0,ge=0,gt=0,le=0,lt=0;// ge: b ≥ a, gt: a > b, le: a ≥ b, lt: b > a (Bänder an gemeinsamen Pixeln)
 while(i<A.idx.length&&j<B.idx.length){const p=A.idx[i],q=B.idx[j];if(p<q){i++;continue;}if(q<p){j++;continue;}
  const a=A.band[i],b=B.band[j];if(b>=a)ge++;else gt++;if(a>=b)le++;else lt++;i++;j++;}
 return [Math.max(ge,gt),Math.max(le,lt)];}

/** Deckung aller Fassungspaare aus den Laufzeit-Bögen in RT; Rückgabe {'a>b':px} (nur über der Toleranz), Reihenfolge wie ids. */
export function deckungMessen(RT,cat,ids,{toleranz=TOLERANZ}={}){
 const K=bandKarten(RT,cat,'koerper'),M=Object.fromEntries(ids.map(id=>{const k=bandKarten(RT,cat,id);
  for(const a in k)for(const d in k[a])k[a][d]=k[a][d].map((m,f)=>sichtbar(m,K[a][d][f]));return [id,k];}));
 const out={};
 for(let x=0;x<ids.length;x++)for(let y=x+1;y<ids.length;y++){const a=ids[x],b=ids[y];let ab=0,ba=0;
  for(const arch in M[a])for(const dir in M[a][arch])M[a][arch][dir].forEach((m,f)=>{const [u,v]=deckungBild(m,M[b][arch][dir][f]);if(u>ab)ab=u;if(v>ba)ba=v;});
  if(ab>toleranz)out[a+'>'+b]=ab;if(ba>toleranz)out[b+'>'+a]=ba;}
 return out;}

/** Katalogeintrag: Fassungen (nur Quellen, die im Katalog stehen) + gemessene Deckung. */
export function gluecksbringerKatalog(RT,cat,fassungen){const f={};for(const [id,list] of Object.entries(fassungen)){if(!cat.sources[id])continue;f[id]=list.filter(s=>cat.sources[s]);}
 const ids=[...new Set(Object.values(f).flat())];return {toleranz:TOLERANZ,fassungen:f,deckung:deckungMessen(RT,cat,ids)};}
