// Zeichnung des begehbaren Hauses (E-52, E-54). Innenräume, Hof und Einrichtung kommen aus dem Sprite-Baukasten (kit-art.js);
// gemalt bleiben die Außenansicht mit Dach und die Möbel der Basisbau-Stufen (tools/sprite-pipeline/build-bude-house.mjs).
// Schräge Draufsicht: Boden 1:1, Höhen nach oben.
import {drawBelag,drawDecal,drawKitWall,drawKitItem,drawKitFill} from './kit-art.js';
import {LIGHTING} from './content/index.js';
import {LIGHT} from './light-convention.js';
const INK='#293b44';
const BASE='./assets/precision/runtime/buildings/',ART={meta:null,aussen:null};let requested=false;
/** Nur Platzhalter zeichnen (Bildvorlagen der Pipeline), nie die gemalten Bilder. */
export function houseArtOff(){ART.off=true;}
function art(){
 if(ART.off)return {meta:null};
 if(!requested&&typeof Image!=='undefined'&&typeof fetch!=='undefined'){requested=true;
  fetch(BASE+'bude-haus.json').then(r=>r.ok?r.json():null).then(meta=>{if(!meta)return;ART.meta=meta;
   if(meta.aussen){const img=new Image();img.onload=()=>{ART.aussen=img;};img.src=BASE+meta.aussen.file;}}).catch(()=>{});}
 return ART;
}
/** Geschoss: 0 = Erdgeschoss (Felder am Haus selbst), 1 = Obergeschoss (`house.upper`). */
export const houseLevel=(house,level)=>level&&house.upper?house.upper:house;
const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
/** Treppe (Erdgeschoss: Stufen) beziehungsweise Treppenloch mit Geländer (Obergeschoss). */
function paintStairs(c,f,level){
 const s=f.stairs;if(!s)return;const w=s.maxX-s.minX,d=s.maxY-s.minY,steps=Math.max(4,Math.round((d>w?d:w)/6)),long=d>w;
 // Baukasten-Sprite (Holztreppe unten, Treppenloch mit Geländer oben), sonst Platzhalter. Unterkante und Breite = Treppenfeld;
 // oben der Überstand der geschert gerenderten Höhe (Modellhöhen in tools/sprite-forge/models/aussen.mjs: 52+24 und 52+10 E).
 if(level?drawKitFill(c,'treppenloch',s.minX,s.minY-10,w,d+10):drawKitFill(c,'treppe-holz',s.minX,s.minY-24,w,d+24))return;
 if(level){fill(c,'#1b1410',s.minX,s.minY,w,d);for(let i=1;i<4;i++)fill(c,'#2c2119',long?s.minX:s.minX+w*i/4,long?s.minY+d*i/4:s.minY,long?w:2,long?2:d);
  // Geländer an der offenen Seite und am oberen Ende
  fill(c,INK,s.maxX,s.minY-10,3,d+10);fill(c,'#7b5634',s.maxX,s.minY-10,2,d+8);fill(c,'#7b5634',s.minX,s.minY-10,w+2,2);for(let y=s.minY;y<=s.maxY;y+=10)fill(c,'#7b5634',s.maxX,y-8,2,8);}
 else{fill(c,INK,s.minX-1,s.minY-1,w+2,d+2);
  for(let i=0;i<steps;i++){const t=i/steps;if(long){const y=s.minY+t*d;fill(c,i%2?'#8a6443':'#9c7450',s.minX,y,w,d/steps);fill(c,'#5c3f28',s.minX,y,w,1);}else{const x=s.minX+t*w;fill(c,i%2?'#8a6443':'#9c7450',x,s.minY,w/steps,d);fill(c,'#5c3f28',x,s.minY,1,d);}}
  // Handlauf an der offenen Seite
  if(long){fill(c,INK,s.maxX-1,s.minY-10,3,d+10);fill(c,'#7b5634',s.maxX-1,s.minY-10,2,d+8);}}
}

/** Schatten am Wandfuß: Der Boden dunkelt zur Wand hin ab (unter waagerechten Wänden nach Süden, an senkrechten beidseitig),
 *  damit Räume Tiefe bekommen statt wie ein Grundriss zu wirken. Die südliche Außenwand wirft nach draußen – dort nichts. */
function wallShade(c,house,f){
 const S=LIGHTING.interior?.wallShade;if(!S||typeof c.createLinearGradient!=='function')return;const a=c.globalAlpha,ink='26,17,11';
 const band=(x0,y0,x1,y1,gx0,gy0,gx1,gy1)=>{const g=c.createLinearGradient(gx0,gy0,gx1,gy1);g.addColorStop(0,`rgba(${ink},${S.alpha})`);g.addColorStop(.45,`rgba(${ink},${S.alpha*.35})`);g.addColorStop(1,`rgba(${ink},0)`);c.fillStyle=g;c.fillRect(x0,y0,x1-x0,y1-y0);};
 for(const w of f.walls){if(w.outdoor)continue;
  if(w.maxX-w.minX>w.maxY-w.minY){if(w.maxY>=house.maxY-1)continue;band(w.minX,w.maxY,w.maxX,w.maxY+S.depth,0,w.maxY,0,w.maxY+S.depth);}
  else{band(w.maxX,w.minY,w.maxX+S.side,w.maxY,w.maxX,0,w.maxX+S.side,0);band(w.minX-S.side,w.minY,w.minX,w.maxY,w.minX,0,w.minX-S.side,0);}}
 c.globalAlpha=a;
}
/** Offene Kante eines Außenbelags (Hof nach Süden): Kies streut unregelmäßig ins Gras, Grasbüschel wachsen in den Kies –
 *  statt einer linealgeraden Kante. Deterministisch aus der Position, gleiche Kante in jedem Bild. */
function softEdge(c,x0,y,w){const h=(n)=>{const v=Math.sin(n*127.1+y*.311)*43758.5453;return v-Math.floor(v);},a=c.globalAlpha;
 // Überlappende Kiesflecken wechselnder Größe knapp unter der Kante, dazu einzelne Steinchen weiter draußen.
 for(let x=x0-2;x<x0+w+2;x+=4){const r=h(x),rx=2.5+r*4.5,ry=1.4+h(x*.61)*2.4,cy=y+ry*.4+h(x*.29)*3;c.globalAlpha=.85;c.fillStyle=r>.55?'#8f7d5d':'#9a8868';c.beginPath();c.ellipse(x+h(x*.13)*3,cy,rx,ry,0,0,Math.PI*2);c.fill();
  for(let k=0;k<3;k++){const q=h(x*1.7+k*9.1);if(q<.5)continue;c.globalAlpha=.55+.3*(1-q);c.fillStyle=q>.8?'#b8a888':'#7d6d52';c.fillRect(x+Math.round(q*4),y+Math.round(4+q*11),q>.8?2:1,1);}
  const t=h(x*3.3);if(t>.58){c.globalAlpha=.95;c.fillStyle=t>.82?'#5f8a3c':'#4d7a33';const bx=x+1,by=y-1-Math.round(t*6);c.fillRect(bx,by,1,3);c.fillRect(bx-1,by+1,1,2);c.fillRect(bx+1,by+1,1,2);}}
 c.globalAlpha=a;}
/** Schlagschatten des Hauses auf Hof und Gras (Lichtrichtung aus light-convention.js, wie Bäume und Nachbarhäuser):
 *  mit sichtbarem Dach lang (Wand + halbes Dach), drinnen nur so hoch wie die geschnittenen Wände. Zwei Lagen für eine weiche Kante. */
function castShadow(c,house,fade){
 const n=Math.hypot(LIGHT.dir.x,LIGHT.dir.y),dx=LIGHT.dir.x/n,dy=LIGHT.dir.y/n,H=house.heights,len=(H.wall+H.roof*.5)*(1-fade)+H.cut*fade,k=LIGHTING.shadow?.building??.5;
 const {minX:x0,maxX:x1,minY:y0,maxY:y1}=house,a=c.globalAlpha;c.fillStyle=LIGHT.shadow.color;
 // Eine Lage, die vom Hausfuß in Lichtrichtung ausläuft (zwei harte Lagen zeichneten sichtbare Rechteckstufen).
 const ox=dx*len*k,oy=dy*len*k,sh=LIGHT.shadow.color,g=typeof c.createLinearGradient==='function'?c.createLinearGradient(x1,y1,x1+ox,y1+oy):null;if(g){g.addColorStop(0,sh+'66');g.addColorStop(.55,sh+'33');g.addColorStop(1,sh+'00');c.fillStyle=g;c.globalAlpha=1;}else c.globalAlpha=.25;
 c.beginPath();c.moveTo(x1,y0);c.lineTo(x1+ox,y0+oy);c.lineTo(x1+ox,y1+oy);c.lineTo(x0+ox,y1+oy);c.lineTo(x0,y1);c.lineTo(x1,y1);c.closePath();c.fill();
 c.globalAlpha=a;
}
/** Böden des Geschosses: Belag je Raum und Bodendeko. Innenräume folgen dem Ausblenden des Dachs (`alpha`),
 *  der Hof liegt draußen und wird immer gezeichnet (er gehört zum Erdgeschoss). */
export function drawHouseFloor(c,house,alpha,level=0){
 const f=houseLevel(house,level);
 c.globalAlpha=1;for(const room of house.rooms)if(room.outdoor)drawBelag(c,room,house.origin);
 for(const it of house.items)if(it.outdoor&&it.layer==='decal')drawDecal(c,it);
 for(const room of house.rooms)if(room.outdoor)for(const q of room.rects)softEdge(c,q.x,q.y+q.h,q.w);
 if(level===0)castShadow(c,house,alpha);
 if(alpha>0){c.globalAlpha=alpha;
  for(const room of f.rooms)if(!room.outdoor)drawBelag(c,room,house.origin);
  for(const it of f.items)if(!it.outdoor&&it.layer==='decal')drawDecal(c,it);
  wallShade(c,house,f);
  paintStairs(c,f,level);}
 c.globalAlpha=1;
}
/** Eine Wand samt Wandschmuck, tiefensortiert an ihrer Südkante; Zäune draußen sind immer sichtbar. */
export function drawHouseWall(c,wall,house,alpha){
 const a=wall.outdoor?1:alpha;if(a<=0)return;c.globalAlpha=a;drawKitWall(c,wall,house.heights.cut);c.globalAlpha=1;
}
/** Stehendes Teil der Einrichtung; drinnen mit dem Dach ausgeblendet, draußen immer. */
export function drawHouseItem(c,it,alpha){
 const a=it.outdoor?1:alpha;if(a<=0)return;c.globalAlpha=a;drawKitItem(c,it);c.globalAlpha=1;
}

/** Gemaltes Möbel einer Basisbau-Stufe (`prop.art`, etwa „tresen-2“): unten mittig auf der Vorderkante der Standfläche,
 *  so breit wie die Stufe in der Welt. Liefert false, solange das Bild fehlt – dann zeichnet drawProp den Ersatz. */
const stageImages=new Map();
export function drawStageFurniture(c,prop){
 const a=art(),m=a.meta?.stages?.[prop.art];if(!m)return false;
 let img=stageImages.get(prop.art);if(!img){img=new Image();img.src=BASE+m.file;stageImages.set(prop.art,img);}
 if(!img.complete||!img.naturalWidth)return false;
 const k=a.meta.pxPerUnit,w=prop.w,scale=w/(m.width/k),h=m.height/k*scale,base=prop.y+prop.h/2;
 c.save();c.imageSmoothingEnabled=false;c.fillStyle='#2438294d';c.beginPath();c.ellipse(prop.x,prop.y,w/2,prop.h/2,0,0,Math.PI*2);c.fill();
 c.drawImage(img,Math.round((prop.x-w/2)*2)/2,Math.round((base-h)*2)/2,w,h);c.restore();return true;
}

/** Außenansicht: Fassade mit zwei Geschossen und Satteldach, halb abgedeckt (Plane, freie Sparren). */
export function drawHouseExterior(c,house,alpha,door){
 if(alpha<=0)return;
 const a=art();
 if(a.aussen){const m=a.meta.aussen,k=a.meta.pxPerUnit;c.globalAlpha=alpha;c.drawImage(a.aussen,house.origin.x+m.local.x,house.origin.y+m.local.y,a.aussen.width/k,a.aussen.height/k);c.globalAlpha=1;return;}
 const {minX:x0,maxX:x1,minY:y0,maxY:y1}=house,W=x1-x0,H=house.heights.wall,R=house.heights.roof;
 const eaveF=y1-H,eaveB=y0-H,ridge=(y0+y1)/2-H-R;
 c.globalAlpha=alpha;
 // Dach: hintere Fläche, vordere Fläche
 c.fillStyle=INK;c.beginPath();c.moveTo(x0-8,eaveB-2);c.lineTo(x1+8,eaveB-2);c.lineTo(x1+8,eaveF+4);c.lineTo(x0-8,eaveF+4);c.closePath();c.fill();
 fill(c,'#3e4953',x0-6,eaveB,W+12,ridge-eaveB);
 fill(c,'#566571',x0-6,ridge,W+12,eaveF-ridge+2);
 c.fillStyle='#48545f';for(let y=ridge+6;y<eaveF;y+=7)c.fillRect(x0-6,y,W+12,1);
 for(let y=ridge+6,row=0;y<eaveF;y+=7,row++)for(let x=x0-6+(row%2?5:0);x<x1+6;x+=11)c.fillRect(x,y-6,1,6);
 fill(c,'#2f3942',x0-6,ridge-2,W+12,4);
 // abgedeckter Teil: Sparren und Plane
 const hx=x0+W*.46,hw=W*.3;fill(c,'#3a2a1d',hx,ridge+3,hw,(eaveF-ridge)*.62);
 c.fillStyle='#8b6440';for(let x=hx+4;x<hx+hw;x+=12)c.fillRect(x,ridge+3,3,(eaveF-ridge)*.62);for(let y=ridge+14;y<ridge+(eaveF-ridge)*.62;y+=16)c.fillRect(hx,y,hw,2);
 c.fillStyle='#3f6fb0';c.beginPath();c.moveTo(hx+hw*.45,ridge+2);c.lineTo(hx+hw+18,ridge+4);c.lineTo(hx+hw+10,eaveF-20);c.lineTo(hx+hw*.55,eaveF-34);c.closePath();c.fill();
 c.fillStyle='#5c8fd0';c.fillRect(hx+hw*.6,ridge+10,hw*.4,2);
 fill(c,'#8b8577',x1-44,eaveB-20,14,ridge-eaveB+20);fill(c,'#6f6a5f',x1-44,eaveB-20,14,3);
 // Fassade: Putz, Fachwerk, Sockel
 fill(c,INK,x0-1,eaveF-1,W+2,H+2);fill(c,'#e8d3a0',x0,eaveF,W,H);
 c.fillStyle='#5a3b26';c.fillRect(x0,eaveF,W,3);c.fillRect(x0,y1-H/2-1,W,3);for(let x=x0;x<=x1;x+=W/8)c.fillRect(Math.min(x,x1-3),eaveF,3,H);
 fill(c,'#8b8577',x0,y1-9,W,9);c.fillStyle='#6f6a5f';for(let x=x0+6;x<x1;x+=12)c.fillRect(x,y1-9,1,9);
 // Fenster in zwei Reihen, Tür am Eingang
 const win=(x,y)=>{fill(c,INK,x-1,y-1,15,17);fill(c,'#2f5f63',x,y,13,15);fill(c,'#7fb4ad',x+1,y+1,5,6);fill(c,'#e8d3a0',x+6,y,1,15);fill(c,'#e8d3a0',x,y+7,13,1);fill(c,'#6f3c2c',x-4,y+14,21,3);};
 for(let i=0;i<7;i++){const x=x0+14+i*W/7;if(door&&Math.abs(x+6-door.x)<24)continue;win(x,y1-H+10);win(x,y1-H/2+8);}
 if(door){fill(c,INK,door.x-14,y1-31,28,31);fill(c,'#6b4a2f',door.x-12,y1-29,24,29);fill(c,'#4e3522',door.x-1,y1-29,2,29);fill(c,'#e0b45c',door.x+6,y1-15,2,2);fill(c,'#8b8577',door.x-16,y1-2,32,2);}
 c.globalAlpha=1;
}

/** Birnen einer Lichterkette: gleichmäßig entlang eines durchhängenden Bogens, je Birne Bodenpunkt (x, y) und Höhe (lift). */
export function garlandBulbs(g){const len=Math.hypot(g.x2-g.x1,g.y2-g.y1),n=Math.max(3,Math.floor(len/9)),out=[];
 for(let i=1;i<n;i++){const t=i/n;out.push({x:g.x1+(g.x2-g.x1)*t,y:g.y1+(g.y2-g.y1)*t,lift:g.h-g.sag*4*t*(1-t),i});}return out;}
const BULBS=['#ffd36a','#ff8f6a','#8fd6ff','#b8f08a','#ffb0e0'];
/** Lichterketten über dem Hof, über allen Figuren gezeichnet (hängen oben): Kabel mit Durchhang, farbige Birnen mit Glanzpunkt, sachtes Funkeln. */
export function drawGarlands(c,house,time){if(!house?.garlands?.length)return;c.save();
 for(const g of house.garlands){c.strokeStyle='#2a2018';c.lineWidth=.8;c.beginPath();for(let i=0;i<=24;i++){const t=i/24,x=g.x1+(g.x2-g.x1)*t,y=g.y1+(g.y2-g.y1)*t-(g.h-g.sag*4*t*(1-t));i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  for(const b of garlandBulbs(g)){const col=BULBS[b.i%BULBS.length],tw=.75+.25*Math.sin(time*2.2+b.i*1.7),x=b.x,y=b.y-b.lift+2;c.globalAlpha=1;c.fillStyle='#2a2018';c.fillRect(x-.5,y-2,1,1.5);
   c.globalAlpha=.35*tw;c.fillStyle=col;c.beginPath();c.arc(x,y+1,3.2,0,Math.PI*2);c.fill();c.globalAlpha=tw;c.beginPath();c.ellipse(x,y+1,1.5,2,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.fillStyle='#ffffffcc';c.fillRect(x-.6,y,.8,.8);}}
 c.restore();}
