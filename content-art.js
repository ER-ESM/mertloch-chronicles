// Anbindung der Grafiklieferung vom 2026-09-17 (docs/UEBERGABE-GRAFIK-AN-UI-2026-09-17.md).
// Verbindlich ist assets/precision/runtime/catalog.json: `path`, `aliases`, je Asset
// `frameSize`/`pivot`/`columns` und pro Frame Ausschnitt und Sockets.
// Diese Datei lädt und schlägt nach; gezeichnet wird in live-art.js, ui-art.js und talent-art.js.
// Fehlt der Katalog oder ein Bild, liefert jede Funktion null/false — die alten Zeichenwege bleiben.
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
 try{const r=await fetch('./assets/forge/runtime/figures/catalog.json');if(r.ok){const forge=await r.json();await Promise.all(Object.entries(forge.assets).map(async([id,a])=>{const img=await loadImage('./'+a.path);if(img){contentArt.catalog.assets[id]=a;contentArt.images.set(id,img);}}));}}catch{}
 contentArt.ready=true;
})();}

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
  nativeHeight:m.nativeHeight||frameSize,worldHeight:m.worldHeight||frameSize/2,
  gearScale:m.gearScale||1,stride:walk?.meta.stride||DEFAULT_STRIDE*((m.worldHeight||26)/26)};
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
/** Einzelbild ganzzahlig vergrößert und mittig in ein Feld der Kantenlänge `size`. */
export function drawContentIcon(c,id,x,y,size){
 const a=contentAsset(id);if(!a||a.meta.frames)return false;
 const w=a.meta.width,h=a.meta.height,natural=Math.max(w,h);
 const factor=size>=natural?Math.max(1,Math.floor(size/natural)):size/natural;
 const dw=Math.round(w*factor),dh=Math.round(h*factor);
 c.save();c.imageSmoothingEnabled=false;
 c.drawImage(a.image,0,0,w,h,Math.round(x+(size-dw)/2),Math.round(y+(size-dh)/2),dw,dh);
 c.restore();return true;
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
