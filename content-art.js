// Anbindung der Grafiklieferung vom 2026-09-17 (docs/UEBERGABE-GRAFIK-AN-UI-2026-09-17.md).
// Verbindlich ist assets/precision/runtime/catalog.json: `path`, `aliases`, je Asset
// `frameSize`/`pivot`/`columns` und pro Frame Ausschnitt und Sockets.
// Diese Datei lädt und schlägt nach; gezeichnet wird in live-art.js, ui-art.js und talent-art.js.
// Fehlt der Katalog oder ein Bild, liefert jede Funktion null/false — die alten Zeichenwege bleiben.
import {PRECISION_PALETTE} from './art-quality.js';
const CATALOG='./assets/precision/runtime/catalog.json';
export const contentArt={ready:false,catalog:null,images:new Map()};
let pending=null;
const loadImage=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});

export function loadContentArt(){return pending||=(async()=>{
 let catalog=null;
 try{const r=await fetch(CATALOG);if(r.ok)catalog=await r.json();}catch{}
 if(!catalog?.assets)return;
 contentArt.catalog=catalog;
 await Promise.all(Object.entries(catalog.assets).map(async([id,a])=>{const img=await loadImage('./'+a.path);if(img)contentArt.images.set(id,img);}));
 // Registered biped cycles replace the short pose alternation for NPCs and human enemies.
 try{const r=await fetch('./assets/content-art/locomotion/runtime/catalog.json');if(r.ok){const walking=await r.json();await Promise.all(Object.entries(walking.assets).map(async([id,a])=>{const img=await loadImage('./'+a.path);if(img){contentArt.catalog.assets[id]=a;contentArt.images.set(id,img);}}));}}catch{}
 // Sprite-Schmiede (E-58, tools/sprite-forge/figures.mjs): selbst gerenderte Figuren aus Körperteilen ersetzen gleichnamige Einträge
 // (z. B. `ida`, `ida-walk`) und bringen neue (`mentor-dieter` …). Gleiches Bogenformat: 192er Zellen, Fußpunkt 96/160, se/sw/ne/nw.
 try{const r=await fetch('./assets/forge/runtime/figures/catalog.json');if(r.ok){const forge=await r.json();await Promise.all(Object.entries(forge.assets).map(async([id,a])=>{const img=await loadImage('./'+a.path);if(img){if(a.frames?.length&&!id.endsWith('-walk'))a.paintedHeight=paintedHeight(img,a.frames[0],a.frameSize||192);contentArt.catalog.assets[id]=a;contentArt.images.set(id,img);}}));}}catch{}
 contentArt.ready=true;
})();}

/**
 * Gezeichnete Figurenhöhe in nativen Pixeln: Kopf bis Fuß (Deckkraft ab 50 %) im Ruhebild Richtung se.
 * Schmiede-Figuren (E-58) rechnen Höhen 1:1 in der Schrägkamera: der Körper ist 26 E hoch, aber der vordere Fuß reicht unter
 * den Fußpunkt und der Kopf liegt hinten – gezeichnet ≈ 31 E statt 26 E. Präzisions- und Heldenbögen sind dagegen auf
 * 104 px Figur gemalt. Damit alle Menschen gleich groß erscheinen, gleicht contentActor über diese gemessene Höhe ab
 * (nicht über die Bildbreite). Prüfung: scripts/figure-size-check.mjs.
 */
export function paintedHeight(img,frame,size){
 try{const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d',{willReadFrequently:true});
  c.drawImage(img,frame.x,frame.y,size,size,0,0,size,size);const d=c.getImageData(0,0,size,size).data;let top=-1,bottom=-1;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(d[(y*size+x)*4+3]>=128){if(top<0)top=y;bottom=y;break;}
  return top<0?0:bottom-top+1;
 }catch{return 0;}
}

/** Präfix-IDs der Bedarfsliste (`hero-dieter`, `villager-0`, `enemy-raven`) auf Inhalts-IDs. */
export const contentId=id=>contentArt.catalog?(contentArt.catalog.aliases?.[id]||id):id;
/** Katalogeintrag mit geladenem Bild oder null. */
export function contentAsset(id){const key=contentId(id),meta=contentArt.catalog?.assets?.[key],image=contentArt.images.get(key);return meta&&image?{id:key,meta,image}:null;}
export const hasContentAsset=id=>!!contentAsset(id);

// ---------------------------------------------------------------- Weltfiguren
const DEFAULT_STRIDE=48;
/** Figurenbogen samt separatem Laufbogen (Helden) und Spaltenbelegung. */
export function contentActor(id){
 const poses=contentAsset(id);
 if(!poses||!poses.meta.columns||!poses.meta.frames)return null;
 const walk=contentAsset(poses.id.endsWith('-poses')?poses.id.replace(/-poses$/,'-walk'):poses.id+'-walk');
 const m=poses.meta,frameSize=m.frameSize??contentArt.catalog.frameSize,pivot=m.pivot??contentArt.catalog.pivot;
 return {id:poses.id,poses,walk,frameSize,pivot,columns:m.columns,rows:contentArt.catalog.directions.length,
  // paintedHeight (nur Schmiede-Figuren, beim Laden gemessen) ersetzt die Rahmenhöhe; der Schritt schrumpft mit der Figur.
 nativeHeight:m.paintedHeight||m.nativeHeight||frameSize,worldHeight:m.worldHeight||frameSize/2,
  gearScale:m.gearScale||1,stride:walk?.meta.stride?walk.meta.stride*(m.paintedHeight?(m.nativeHeight||frameSize)/m.paintedHeight:1):DEFAULT_STRIDE*((m.worldHeight||26)/26)};
}
export const hasContentActor=id=>!!contentActor(id);
/** Welthöhe des gelieferten Bogens (4 native Pixel = 1 Welteinheit) oder 0. */
export const contentActorHeight=id=>contentActor(id)?.worldHeight||0;

/**
 * Wählt Bogen und Einzelbild für Richtung und Zustand.
 * Laufen taktet über die zurückgelegte Strecke und steht im Stand still.
 */
export function contentFrame(actor,row,p={}){
 const cols=actor.columns,at=name=>cols.indexOf(name);
 const sheet=(p.moving&&actor.walk)?actor.walk:actor.poses;
 const width=(sheet===actor.walk?actor.walk.meta.columns:cols).length;
 let column=0;
 if(p.moving){
  const cycle=sheet===actor.walk?[0,1,2,3,4,5,6,7]
   :at('walk-pass')>=0?[at('walk-a'),at('walk-pass'),at('walk-b'),at('walk-pass')]
   :at('walk-b')>=0?[at('walk-a'),at('walk-b')]:[0];
  const distance=p.walkDistance||0;
  column=cycle[Math.floor(distance/actor.stride*cycle.length)%cycle.length]??0;
 }else if(p.hurt>0&&at('hit')>=0)column=at('hit');
 else if(p.attack>0){const progress=1-Math.min(1,p.attack/.3);
  column=at('anticipation')>=0&&progress<.45?at('anticipation'):at('impact')>=0?at('impact'):0;}
 else if(p.phase&&at('phase')>=0)column=at('phase');
 const frames=sheet.meta.frames,index=Math.min(frames.length-1,row*width+column);
 return {image:sheet.image,frame:frames[index]||frames[0],column,size:actor.frameSize};
}

// ------------------------------------------------------------------- Symbole
// Verkleinern wie die Pipeline (tools/sprite-pipeline/precision-resample.mjs): Flächenmittel, deckend ab 50 %. Vorher nächster Nachbar –
// 64 → 48 ließ jede vierte Zeile und Spalte weg. Die Farbe rastet auf die Farben des Quellausschnitts ein, nicht auf PRECISION_PALETTE:
// der fehlen gesättigte Rot- und Lilatöne, Waffenkammer-Bilder (757 Töne) wurden sonst ziegelorange. Ergebnis je Bild, Ausschnitt und Größe im Cache.
const shrunkIcons=new WeakMap(),motifBounds=new WeakMap();let scratch=null;
/** Farben der deckenden Pixel eines RGBA-Puffers; ohne deckende Pixel die PRECISION_PALETTE. */
export function sourcePalette(src){const seen=new Set(),out=[];for(let i=0;i<src.length;i+=4)if(src[i+3]>=128){const k=src[i]<<16|src[i+1]<<8|src[i+2];if(!seen.has(k)){seen.add(k);out.push([src[i],src[i+1],src[i+2]]);}}return out.length?out:PRECISION_PALETTE;}
export function shrinkPixels(src,w,h,dw,dh,palette=sourcePalette(src)){const out=new Uint8ClampedArray(dw*dh*4),memo=new Map();
 const snap=(r,g,b)=>{const key=(r>>2)<<12|(g>>2)<<6|b>>2;let p=memo.get(key);if(p)return p;let score=Infinity;for(const q of palette){const d=(r-q[0])**2*.8+(g-q[1])**2+(b-q[2])**2*.7;if(d<score){score=d;p=q;}}memo.set(key,p);return p;};
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const left=x*w/dw,right=(x+1)*w/dw,top=y*h/dh,bottom=(y+1)*h/dh;let alpha=0,total=0,r=0,g=0,b=0;
  for(let sy=Math.floor(top);sy<Math.ceil(bottom);sy++)for(let sx=Math.floor(left);sx<Math.ceil(right);sx++){const wt=(Math.min(right,sx+1)-Math.max(left,sx))*(Math.min(bottom,sy+1)-Math.max(top,sy)),i=(sy*w+sx)*4,a=src[i+3]/255*wt;total+=wt;alpha+=a;r+=src[i]*a;g+=src[i+1]*a;b+=src[i+2]*a;}
  if(alpha<total*.5)continue;const p=snap(Math.round(r/alpha),Math.round(g/alpha),Math.round(b/alpha)),o=(y*dw+x)*4;out[o]=p[0];out[o+1]=p[1];out[o+2]=p[2];out[o+3]=255;}
 return out;}
/** RGBA-Pixel eines Bildausschnitts (gemeinsame Hilfsfläche mit willReadFrequently). */
function rectPixels(image,sx,sy,sw,sh){const cv=scratch||=document.createElement('canvas');if(cv.width<sw)cv.width=sw;if(cv.height<sh)cv.height=sh;const c=cv.ctx||=cv.getContext('2d',{willReadFrequently:true});
 c.clearRect(0,0,sw,sh);c.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);return c.getImageData(0,0,sw,sh).data;}
function shrunkRect(image,sx,sy,sw,sh,dw,dh){let m=shrunkIcons.get(image);if(!m)shrunkIcons.set(image,m=new Map());const k=sx+','+sy+','+sw+','+sh+'>'+dw+'x'+dh;let cv=m.get(k);if(cv)return cv;
 cv=document.createElement('canvas');cv.width=dw;cv.height=dh;cv.getContext('2d').putImageData(new ImageData(shrinkPixels(rectPixels(image,sx,sy,sw,sh),sw,sh,dw,dh),dw,dh),0,0);m.set(k,cv);return cv;}
/** Bildausschnitt mittig in ein Feld der Kantenlänge `size`: ganzzahlig vergrößert, 1:1 oder per Flächenmittel verkleinert –
 *  nie nächster Nachbar beim Verkleinern (Stilbibel A4). Gemeinsamer Weg für Katalogbilder, e32-Zellen und Ausrüstungsteile. */
export function drawPixelRect(c,image,sx,sy,sw,sh,x,y,size){
 const natural=Math.max(sw,sh),factor=size>=natural?Math.max(1,Math.floor(size/natural)):size/natural;
 const dw=Math.max(1,Math.round(sw*factor)),dh=Math.max(1,Math.round(sh*factor)),dx=Math.round(x+(size-dw)/2),dy=Math.round(y+(size-dh)/2);
 c.save();c.imageSmoothingEnabled=false;
 if(factor<1&&typeof document!=='undefined')c.drawImage(shrunkRect(image,sx,sy,sw,sh,dw,dh),dx,dy);else c.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
 c.restore();return true;
}
/** Umriss des Motivs im Ausschnitt (Deckkraft ab 50 %), je Bild und Ausschnitt im Cache; null bei leerem Ausschnitt. */
function opaqueBounds(image,sx,sy,sw,sh){let m=motifBounds.get(image);if(!m)motifBounds.set(image,m=new Map());const k=sx+','+sy+','+sw+','+sh;if(m.has(k))return m.get(k);
 const d=rectPixels(image,sx,sy,sw,sh);let x0=sw,y0=sh,x1=-1,y1=-1;
 for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(d[(y*sw+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 const b=x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};m.set(k,b);return b;}
/** Freies Motiv (Talente, Symbol auf Grund): auf seinen Umriss beschnitten und mittig ins Feld `size`. 1:1, solange die Langseite in
 *  `room` px passt, sonst per Flächenmittel verkleinert; nie vergrößert. Ersetzt fitMotif (Stilbibel A4: kein Strecken per nächstem Nachbarn). */
export function drawMotif(c,image,sx,sy,sw,sh,x,y,size,room=size){
 if(typeof document==='undefined')return drawPixelRect(c,image,sx,sy,sw,sh,x,y,size);
 const b=opaqueBounds(image,sx,sy,sw,sh);if(!b)return false;const k=Math.min(1,room/Math.max(b.w,b.h));
 const dw=Math.max(1,Math.round(b.w*k)),dh=Math.max(1,Math.round(b.h*k)),dx=Math.round(x+(size-dw)/2),dy=Math.round(y+(size-dh)/2);
 c.save();c.imageSmoothingEnabled=false;
 if(k<1)c.drawImage(shrunkRect(image,sx+b.x,sy+b.y,b.w,b.h,dw,dh),dx,dy);else c.drawImage(image,sx+b.x,sy+b.y,b.w,b.h,dx,dy,b.w,b.h);
 c.restore();return true;
}
/** Katalogbild als freies Motiv (drawMotif); false, wenn das Asset fehlt. */
export function drawContentMotif(c,id,x,y,size,room=size){const a=contentAsset(id);if(!a||a.meta.frames)return false;return drawMotif(c,a.image,0,0,a.meta.width,a.meta.height,x,y,size,room);}
/** Einzelbild mittig in ein Feld der Kantenlänge `size` (drawPixelRect). Füllt das Bild den Canvas, wird er als Präzisionssymbol
 * markiert – styleIcon (32 px, 40 Farben) lässt ihn dann in Ruhe. */
export function drawContentIcon(c,id,x,y,size){
 const a=contentAsset(id);if(!a||a.meta.frames)return false;
 drawPixelRect(c,a.image,0,0,a.meta.width,a.meta.height,x,y,size);
 if(c.canvas?.dataset&&size>=Math.min(c.canvas.width,c.canvas.height)*.75)c.canvas.dataset.precision='true';return true;
}
export function paintContentIcon(canvas,id){
 const c=canvas.getContext('2d');if(!contentAsset(id))return false;
 c.clearRect(0,0,canvas.width,canvas.height);
 return drawContentIcon(c,id,0,0,Math.min(canvas.width,canvas.height));
}
/** Dateipfad für CSS (`border-image`, `<img src>`); leer, wenn das Asset fehlt. */
export const contentPath=id=>{const key=contentId(id);const meta=contentArt.catalog?.assets?.[key];return meta?'./'+meta.path:'';};

/** 9-Slice mit unskalierten Ecken; Kanten und Mitte werden gestreckt. */
export function drawNineSlice(c,id,x,y,w,h){
 const a=contentAsset(id),slice=a?.meta.nineSlice;if(!slice)return false;
 const {left:l,right:r,top:t,bottom:b}=slice,W=a.meta.width,H=a.meta.height;
 if(w<l+r||h<t+b)return false;
 c.save();c.imageSmoothingEnabled=false;
 const put=(sx,sy,sw,sh,dx,dy,dw,dh)=>{if(sw>0&&sh>0&&dw>0&&dh>0)c.drawImage(a.image,sx,sy,sw,sh,dx,dy,dw,dh);};
 const mw=W-l-r,mh=H-t-b,iw=w-l-r,ih=h-t-b;
 put(0,0,l,t,x,y,l,t);put(l,0,mw,t,x+l,y,iw,t);put(W-r,0,r,t,x+w-r,y,r,t);
 put(0,t,l,mh,x,y+t,l,ih);put(l,t,mw,mh,x+l,y+t,iw,ih);put(W-r,t,r,mh,x+w-r,y+t,r,ih);
 put(0,H-b,l,b,x,y+h-b,l,b);put(l,H-b,mw,b,x+l,y+h-b,iw,b);put(W-r,H-b,r,b,x+w-r,y+h-b,r,b);
 c.restore();return true;
}
