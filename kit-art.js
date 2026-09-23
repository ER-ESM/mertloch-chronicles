// Zeichnung des Sprite-Baukastens (E-54): Belag je Raum, Bodendeko, Wände mit Wandschmuck, stehende Teile.
// Geliefert: assets/precision/runtime/kit/kit.json (tools/sprite-pipeline/build-kit.mjs); fehlt ein Bild, zeichnet die Art
// einen Platzhalter in ihrer Farbe – nichts darf ohne Bild kaputtgehen. Schräge Draufsicht: Boden 1:1, Höhen nach oben.
import {resolveSprite} from './world-kit.js';

// Zwei Quellen (E-58): die Sprite-Schmiede (assets/forge/runtime/kit/kit-forge.json, tools/sprite-forge/kit.mjs) hat Vorrang
// vor den imagegen-Bögen. Schmiede-Einträge können Bildfolgen sein: `frames` Bilder à `width` px nebeneinander, Takt `fps`.
const INK='#293b44',BASE='./assets/precision/runtime/kit/',FORGE='./assets/forge/runtime/kit/',KIT={meta:null,images:new Map(),patterns:new Map(),off:false};let requested=false;
/** Nur Platzhalter (Bildvorlagen der Pipeline). */
export function kitArtOff(){KIT.off=true;}
function meta(){
 if(KIT.off)return null;
 if(!requested&&typeof fetch!=='undefined'&&typeof Image!=='undefined'){requested=true;
  const load=(base,file)=>fetch(base+file).then(r=>r.ok?r.json():null).catch(()=>null).then(m=>m&&Object.fromEntries(Object.entries(m.sprites||{}).map(([id,s])=>[id,{...s,base}])));
  Promise.all([load(BASE,'kit.json'),load(FORGE,'kit-forge.json')]).then(([a,b])=>{if(a||b)KIT.meta={pxPerUnit:4,sprites:{...a,...b}};});}
 return KIT.meta;
}
/** Geladenes Bild einer Sprite-Art samt Registrierung, sonst null. */
function sprite(id){const m=meta()?.sprites?.[id];if(!m)return null;let img=KIT.images.get(id);if(!img){img=new Image();img.src=m.base+m.file;KIT.images.set(id,img);}return img.complete&&img.naturalWidth?{img,m,k:KIT.meta.pxPerUnit}:null;}
const clock=()=>(typeof performance!=='undefined'?performance.now():Date.now())/1000;
/** Quellrechteck des aktuellen Bilds; `seed` versetzt die Phase je Teil, damit gleiche Lampen nicht im Gleichtakt flackern. */
function frameOf(s,seed=0){const {m}=s,w=m.width||s.img.width,h=m.height||s.img.height;if(!(m.frames>1))return [0,0,w,h];
 const i=Math.floor(clock()*(m.fps||8)+(Math.abs(Math.sin(seed*12.9898)*43758.5453)%1)*m.frames)%m.frames;return [i*w,0,w,h];}
const seedOf=it=>(it.x||0)*.37+(it.y||0)*1.13;
const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const shade=(color,f)=>{const n=parseInt(color.slice(1),16),m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[m(n>>16&255),m(n>>8&255),m(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');};

/** Platzhalter-Muster je Belag-Familie, aus der Farbe der Art abgeleitet. */
function placeholderFloor(c,def,q){
 const base=def.color||'#8d8a84',line=shade(base,.78);fill(c,base,q.x,q.y,q.w,q.h);c.fillStyle=line;
 const id=def.id;
 if(id.startsWith('dielen')||id.startsWith('bretter'))for(let y=q.y+7;y<q.y+q.h;y+=7){c.fillRect(q.x,y,q.w,1);for(let x=q.x+((y/7|0)%2?11:27);x<q.x+q.w;x+=34)c.fillRect(x,y-6,1,6);}
 else if(id.startsWith('fliesen')||id==='estrich'){const s=id==='estrich'?14:9;for(let y=q.y+s;y<q.y+q.h;y+=s)c.fillRect(q.x,y,q.w,1);for(let x=q.x+s;x<q.x+q.w;x+=s)c.fillRect(x,q.y,1,q.h);}
 else if(id.startsWith('kies'))for(let y=q.y+4;y<q.y+q.h;y+=11)for(let x=q.x+((y/11|0)%2?3:8);x<q.x+q.w;x+=11)c.fillRect(x,y,2,1);
 else if(id.startsWith('teppich')){c.strokeStyle=shade(base,1.5);c.lineWidth=2;c.strokeRect(q.x+10,q.y+10,q.w-20,q.h-20);}
}
/** Belag eines Raums: gekacheltes Sprite, ausgerichtet am Haus, sonst Platzhalter. */
export function drawBelag(c,room,origin){
 const def=resolveSprite(room.belag),s=sprite(room.belag);
 for(const q of room.rects){
  if(s&&typeof c.createPattern==='function'){let p=KIT.patterns.get(room.belag);if(!p){p=c.createPattern(s.img,'repeat');KIT.patterns.set(room.belag,p);}
   if(p?.setTransform&&typeof DOMMatrix!=='undefined'){p.setTransform(new DOMMatrix([1/s.k,0,0,1/s.k,origin.x,origin.y]));c.fillStyle=p;c.fillRect(q.x,q.y,q.w,q.h);continue;}}
  placeholderFloor(c,def,q);
 }
}
/** Flach liegende Teile (Bodendeko): unter allen Figuren, keine Höhe. */
export function drawDecal(c,it){
 const s=sprite(it.sprite);
 if(s){const [sx,sy,sw,sh]=frameOf(s,seedOf(it));// Längs gezeichnete Bodendeko darf quer liegen: dann um 90° gedreht statt verzerrt.
  if((it.w>it.h)!==(sw>sh)&&Math.abs(it.w-it.h)>2){c.save();c.translate(it.x,it.y);c.rotate(Math.PI/2);c.drawImage(s.img,sx,sy,sw,sh,-it.h/2,-it.w/2,it.h,it.w);c.restore();return;}
  c.drawImage(s.img,sx,sy,sw,sh,it.minX,it.minY,it.w,it.h);return;}
 const color=it.def.color||'#888';c.fillStyle=shade(color,.7);c.fillRect(it.minX,it.minY,it.w,it.h);c.fillStyle=color;c.fillRect(it.minX+.5,it.minY+.5,it.w-1,it.h-1);
}
/** Eine Wand samt ihrem Wandschmuck. Waagerecht: Front (`wall.face`) und Krone; senkrecht: nur die Krone und das Südende. */
export function drawKitWall(c,wall,cut){
 const flat=wall.maxX-wall.minX>wall.maxY-wall.minY,h=flat?wall.face:cut,def=wall.style?resolveSprite(wall.style):{color:'#cdbb92'},w=wall.maxX-wall.minX,d=wall.maxY-wall.minY,s=wall.style&&sprite(wall.style);
 if(s&&flat&&typeof c.createPattern==='function'){
  // Wandstreifen: oberer Teil Krone, unterer Teil Front; horizontal gekachelt, auf die Frontthöhe gestaucht.
  const cap=s.m.cap||0,k=s.k,frontPx=s.img.height-cap;
  for(let x=0;x<w;x+=s.img.width/k){const cw=Math.min(s.img.width/k,w-x);
   if(cap)c.drawImage(s.img,0,0,cw*k,cap,wall.minX+x,wall.minY-h,cw,d);else if(x===0)fill(c,shade(def.color||'#7a5a3a',.8),wall.minX,wall.minY-h,w,d);
   c.drawImage(s.img,0,cap,cw*k,frontPx,wall.minX+x,wall.maxY-h,cw,h);}
 }else{
  const color=def.color||'#cdbb92';
  fill(c,INK,wall.minX-1,wall.minY-h-1,w+2,d+h+2);
  if(h>0)fill(c,shade(color,.85),wall.minX,wall.maxY-h,w,h);
  fill(c,shade(color,1.12),wall.minX,wall.minY-h,w,d);
  if(h>0)fill(c,shade(color,.62),wall.minX,wall.maxY-2,w,2);
  if(wall.kind==='zaun'&&h>0){c.fillStyle=shade(color,.6);for(let x=wall.minX+2;x<wall.maxX;x+=5)c.fillRect(x,wall.maxY-h,1,h);}
 }
 for(const it of wall.decor||[])drawWallDecor(c,it,wall);
}
/** Wandschmuck an der Front seiner Wand: unten auf Aufhängehöhe über dem Wandfuß. */
export function drawWallDecor(c,it,wall){
 const def=it.def,top=wall.maxY-(def.mount||0)-(it.height||8),s=sprite(it.sprite);
 if(s){const [sx,sy,sw,sh]=frameOf(s,seedOf(it)),hh=sh/sw*it.w;c.drawImage(s.img,sx,sy,sw,sh,it.minX,top+(it.height-hh),it.w,hh);return;}
 const color=def.color||'#888';fill(c,INK,it.minX-.5,top-.5,it.w+1,it.height+1);fill(c,color,it.minX,top,it.w,it.height);fill(c,shade(color,1.3),it.minX+1,top+1,it.w-2,1);
}
/** Stehendes Teil (Möbel, Draußen, Tischdeko): unten mittig auf der Vorderkante der Standfläche, tiefensortiert. */
export function drawKitItem(c,it){
 const s=sprite(it.sprite);
 if(it.def.shadow&&!it.lift){c.fillStyle='#24382940';c.beginPath();c.ellipse(it.x,it.y,it.w/2+1,it.h/2+1,0,0,Math.PI*2);c.fill();}
 const lift=it.lift||0;
 if(s){const [sx,sy,sw,sh]=frameOf(s,seedOf(it)),hh=sh/sw*it.w;c.drawImage(s.img,sx,sy,sw,sh,it.minX,it.maxY-lift-hh,it.w,hh);return;}
 const color=it.def.color||'#8a6a48',h=it.height||8,y0=it.minY-lift,y1=it.maxY-lift;
 fill(c,INK,it.minX-.5,y0-h-.5,it.w+1,it.h+h+1);fill(c,shade(color,.72),it.minX,y1-h,it.w,h);fill(c,shade(color,1.1),it.minX,y0-h,it.w,it.h);
}
/** Ein Sprite in eine feste Fläche einpassen (Treppe, Treppenloch); false, solange das Bild fehlt. */
export function drawKitFill(c,id,x,y,w,h){const s=sprite(id);if(!s)return false;const [sx,sy,sw,sh]=frameOf(s);c.drawImage(s.img,sx,sy,sw,sh,x,y,w,h);return true;}
