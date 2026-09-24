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
/** Stehende Teile mit feinem dunklem Umriss (Stardew-Lesbarkeit): einmal je Sprite erzeugt – Silhouette in Tinte, 8 Richtungen versetzt, Bild darüber. */
const OUTLINED=new Map();
function outlined(s,id){if(typeof document==='undefined')return s.img;let o=OUTLINED.get(id);if(o)return o;const p=2,W=s.img.width+p*2,H=s.img.height+p*2,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])c.drawImage(s.img,p+dx*p,p+dy*p);c.globalCompositeOperation='source-in';c.fillStyle='#1c130d';c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';c.drawImage(s.img,p,p);
 o={canvas:cv,pad:p};OUTLINED.set(id,o);return o;}
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
  // Senkrechte Wandkrone mit Körper: Licht von links (light-convention), Schatten rechts, Lichtkante und feine Putzfugen.
  if(!flat&&w>=3&&typeof c.createLinearGradient==='function'){const g=c.createLinearGradient(wall.minX,0,wall.maxX,0);g.addColorStop(0,shade(color,1.24));g.addColorStop(.45,shade(color,1.1));g.addColorStop(1,shade(color,.86));c.fillStyle=g;c.fillRect(wall.minX,wall.minY-h,w,d);
   c.fillStyle=shade(color,1.02);for(let y=wall.minY-h+6;y<wall.maxY-h-1;y+=11)c.fillRect(wall.minX+1,y,w-2,1);fill(c,shade(color,1.34),wall.minX,wall.minY-h,1,d);fill(c,shade(color,.7),wall.maxX-1,wall.minY-h,1,d);}
  if(h>0)fill(c,shade(color,.62),wall.minX,wall.maxY-2,w,2);
  if(wall.kind==='zaun'&&h>0){c.fillStyle=shade(color,.6);for(let x=wall.minX+2;x<wall.maxX;x+=5)c.fillRect(x,wall.maxY-h,1,h);}
 }
 if(flat&&h>12)for(const seg of wall.papers||[])drawPaper(c,seg,wall.maxY-h,h);
 for(const it of wall.decor||[])drawWallDecor(c,it,wall);
}
/** Rückwand-Bild eines Raums (content/bude-house.js rooms[].paper) auf der Front einer waagerechten Wand, Stardew-Stil:
 *  Schatten unter der Krone, Tapete mit Muster, Zierleiste, Sockel (Holzvertäfelung/Fliesen), Fußleiste, dazu abgerissene Stellen.
 *  Deterministisch aus der Weltposition – jedes Bild gleich. */
const hash=n=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v);};
function drawPaper(c,{x0,x1,paper:P},top,h){const w=x1-x0,a=c.globalAlpha;if(w<=0)return;
 const lower=P.lower?Math.round(h*.38):0,base=top+h,upperH=h-lower-2;
 fill(c,P.base,x0,top,w,h);
 // Muster der Tapete (obere Fläche)
 c.fillStyle=P.accent;
 if(P.pattern==='streifen')for(let x=x0+2;x<x1;x+=6)c.fillRect(x,top,2,upperH);
 else if(P.pattern==='damast')for(let y=top+3,row=0;y<top+upperH-3;y+=7,row++)for(let x=x0+(row%2?5:1);x<x1-2;x+=8){c.fillRect(x+1,y,1,1);c.fillRect(x,y+1,3,1);c.fillRect(x+1,y+2,1,1);}
 else if(P.pattern==='lilien')for(let y=top+2,row=0;y<top+upperH-4;y+=6,row++)for(let x=x0+(row%2?4:0);x<x1-3;x+=8){c.fillRect(x+1,y,1,1);c.fillRect(x,y+1,1,1);c.fillRect(x+2,y+1,1,1);c.fillRect(x+1,y+2,1,1);}
 else if(P.pattern==='ziegel'){for(let y=top,row=0;y<base-2;y+=4,row++){c.fillRect(x0,y,w,1);for(let x=x0+(row%2?4:0);x<x1;x+=8)c.fillRect(x,y,1,4);}c.fillStyle=shade(P.base,1.1);for(let y=top+1,row=0;y<base-2;y+=4,row++)for(let x=x0+(row%2?5:1);x<x1-3;x+=8)if(hash(x*3.1+y)>.6)c.fillRect(x,y,5,1);}
 else if(P.pattern==='bretter'){for(let x=x0;x<x1;x+=7){c.fillRect(x,top,1,h-2);if(hash(x+top)>.5)c.fillRect(x+3,top+Math.round(hash(x)*h*.6),1,1);}}
 // Lichtverlauf: oben dunkler (Schatten unter der Krone), unten Streiflicht
 if(typeof c.createLinearGradient==='function'){const g=c.createLinearGradient(0,top,0,base);g.addColorStop(0,'#0c0806aa');g.addColorStop(.18,'#0c080626');g.addColorStop(.6,'#ffffff00');g.addColorStop(1,'#0c080633');c.fillStyle=g;c.fillRect(x0,top,w,h);}
 // Sockel: Holzvertäfelung oder Fliesen, darüber die Zierleiste
 if(lower){const y=base-lower-2;
  if(P.lower==='fliesen'){fill(c,P.tile||'#e6e8e2',x0,y,w,lower);c.fillStyle=shade(P.tile||'#e6e8e2',.8);for(let yy=y+4;yy<base-2;yy+=4)c.fillRect(x0,yy,w,1);for(let yy=y,row=0;yy<base-2;yy+=4,row++)for(let x=x0+(row%2?2:0);x<x1;x+=4)c.fillRect(x,yy,1,4);}
  else{const wood=P.wood||'#5a3a22';fill(c,wood,x0,y,w,lower);c.fillStyle=shade(wood,1.25);for(let x=x0+1;x<x1;x+=6)c.fillRect(x,y+2,4,lower-3);c.fillStyle=shade(wood,.7);for(let x=x0+5;x<x1;x+=6)c.fillRect(x,y+1,1,lower-1);}
  fill(c,shade(P.wood||'#6b4a2f',1.35),x0,y-1,w,1);fill(c,shade(P.wood||'#6b4a2f',.85),x0,y,w,1);}
 fill(c,'#1e140d',x0,base-2,w,2);
 // Abgerissene Tapete: helle Putzflecken mit dunkler Rissnase
 const n=Math.floor((P.tear||0)*w/22);for(let i=0;i<n;i++){const r=hash(x0*1.3+i*7.7),x=x0+2+r*(w-10),y=top+3+hash(x*1.9)*(upperH-8),tw=3+Math.round(hash(x)*5),th=2+Math.round(hash(y)*4);fill(c,'#cdbf9e',x,y,tw,th);fill(c,'#8f7f62',x,y+th,tw,1);fill(c,shade(P.base,.6),x+tw,y,1,th);}
 c.globalAlpha=a;}
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
 if(s){const [sx,sy,sw,sh]=frameOf(s,seedOf(it)),hh=sh/sw*it.w;if(!(s.m.frames>1)){const o=outlined(s,it.sprite),k=it.w/sw,pp=o.pad*k;c.drawImage(o.canvas,sx,sy,sw+o.pad*2,sh+o.pad*2,it.minX-pp,it.maxY-lift-hh-pp,it.w+pp*2,hh+pp*2);return;}c.drawImage(s.img,sx,sy,sw,sh,it.minX,it.maxY-lift-hh,it.w,hh);return;}
 const color=it.def.color||'#8a6a48',h=it.height||8,y0=it.minY-lift,y1=it.maxY-lift;
 fill(c,INK,it.minX-.5,y0-h-.5,it.w+1,it.h+h+1);fill(c,shade(color,.72),it.minX,y1-h,it.w,h);fill(c,shade(color,1.1),it.minX,y0-h,it.w,it.h);
}
/** Ein Sprite in eine feste Fläche einpassen (Treppe, Treppenloch); false, solange das Bild fehlt. */
export function drawKitFill(c,id,x,y,w,h){const s=sprite(id);if(!s)return false;const [sx,sy,sw,sh]=frameOf(s);c.drawImage(s.img,sx,sy,sw,sh,x,y,w,h);return true;}
