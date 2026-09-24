// Anziehpuppe im Spiel (E-58 Punkt 6, Hybrid-Stand 2026-09-24): Figuren = Archetyp (dieter/baerbel/kevin) + Aussehen (hero-tint) + Ausrüstung.
// Bögen aus tools/paperdoll (node tools/paperdoll/puppe.mjs --runtime): je Quelle (Körper, Dutt, Gegenstand) × Archetyp × Richtung
// 13 Bilder × 7 Tiefenbänder. Zusammengesetzt wird zur Laufzeit mit demselben Kern wie im Werkzeug (paperdoll-kern.js), dann
// Haut/Haar über die Farbtreppen umgefärbt und für die Welt hochwertig verkleinert (Flächenmittel → Palette → Kontur).
import {composeCore,sources as orderSources,useShade} from './paperdoll-kern.js';

export const paperdoll={ready:false,catalog:null,images:new Map(),failed:false};
const BASE='./assets/paperdoll/runtime/';
const ARCH={dieter:'dieter',baerbel:'baerbel',anni:'baerbel',kevin:'kevin'};
/** Weitere Figuren (NPCs, Söldner) melden sich mit Archetyp, Aussehen und fester Ausrüstung an. */
const ACTORS=new Map();
export function registerPaperdollActor(id,def){ACTORS.set(id,def);}
export const paperdollArch=id=>ARCH[id]||ACTORS.get(id)?.arch||null;

const image=src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src;});
let pending;
/** Katalog + alle Bögen vorladen (Ladebildschirm); bis dahin zeichnen die bisherigen Wege. */
export function loadPaperdoll(){return pending||=(async()=>{
 try{
  const r=await fetch(BASE+'catalog.json');if(!r.ok){paperdoll.failed=true;return;}
  const cat=await r.json();const files=[];
  for(const src of Object.keys(cat.sources))for(const arch of Object.keys(cat.archetypes))for(const [dir,suffix] of Object.entries(cat.dirs)){
   if((dir==='sw'||dir==='ne')&&!cat.own[dir].includes(src))continue;files.push(`${src}-${arch}${suffix}`);}
  const loaded=await Promise.all(files.map(async f=>[f,await image(BASE+f+'.png')]));
  if(loaded.some(([,im])=>!im)){paperdoll.failed=true;return;}
  paperdoll.images=new Map(loaded);paperdoll.catalog=cat;useShade(cat.shade);buildPalette(cat);paperdoll.ready=true;
 }catch{paperdoll.failed=true;}
})();}

// ---------- Farben: Haut- und Haarfarbe aus dem Editor (hero-tint.js) über die Farbtreppen ----------
const hex=c=>c[0]<<16|c[1]<<8|c[2];
function rgbToHsl([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
 if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
function hslToRgb(h,s,l){h=((h%360)+360)%360/360;if(!s)return [l,l,l].map(v=>Math.round(v*255));const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return [f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(Math.max(0,Math.min(1,v))*255));}
// Hauttöne wie hero-tint.js (h/s/m = Farbton, Sättigung, Helligkeitsfaktor zum gezeichneten Ton); „hell“ = wie gezeichnet.
const SKIN={mittel:{h:26,s:.5,m:.9},gebraeunt:{h:23,s:.52,m:.74},dunkel:{h:20,s:.46,m:.5}};
const HAIR={schwarz:{h:230,s:.12,l:.16},braun:{h:24,s:.45,l:.3},blond:{h:44,s:.62,l:.62},rot:{h:14,s:.72,l:.42},grau:{h:210,s:.06,l:.62},blau:{h:205,s:.6,l:.45}};
const recolorCache=new Map();
function recolorMap(arch,tint){const key=arch+'|'+(tint?.skin||'hell')+'|'+(tint?.hair||'natur');if(recolorCache.has(key))return recolorCache.get(key);
 const cat=paperdoll.catalog,m=new Map(),sk=SKIN[tint?.skin],hc=HAIR[tint?.hair];
 if(sk)for(const c of [...cat.ramps.skin,...cat.ramps.blush]){const [h,s,l]=rgbToHsl(c);m.set(hex(c),hslToRgb(sk.h+(h-26)*.3,Math.min(1,s*.5+sk.s*.5),l*sk.m+(1-sk.m)*.06));}
 if(hc){const ramp=cat.ramps[cat.archetypes[arch].hair]||[],mid=rgbToHsl(ramp[Math.min(2,ramp.length-1)]||[128,128,128])[2]||.4;
  for(const c of ramp){const [,,l]=rgbToHsl(c);m.set(hex(c),hslToRgb(hc.h,hc.s,Math.max(.05,Math.min(.95,l*hc.l/mid))));}}
 recolorCache.set(key,m);return m;}

// ---------- Bild wählen ----------
const DIRS=['se','sw','nw','ne'];
const directionOf=p=>p.direction||((p.facing||1)>0?'se':'sw');
/** Bildnummer im Bogen: Laufen nach Wegstrecke, sonst Atmen mit gelegentlichem Blinzeln. */
export function paperdollFrame(p={},time=performance.now()){
 const frames=paperdoll.catalog.frames,walk=frames.findIndex(f=>f.anim==='laufen'),blink=frames.findIndex(f=>f.anim==='blinzeln');
 if(p.moving&&walk>=0){const stride=paperdoll.catalog.stride||64,d=(p.walkDistance||0)-(p.walkStartDistance||0);return walk+((Math.floor(d/stride*8)%8)+8)%8;}
 const cyc=(time+(p.seed||0)*977)%3600;if(blink>=0&&cyc>3350&&cyc<3500)return blink;return Math.floor(time/300)%4;
}
/** Quellen aus der sichtbaren Ausrüstung (equipment-appearance.js): feste Kennung vor Familie; Zweihänder verdrängt die Nebenhand. */
export function paperdollSources(items=[],usingRanged=false){
 const cat=paperdoll.catalog,set=new Set(),gear=cat.sources,two=items.some(i=>i.slot==='weapon'&&i.hands===2);
 for(const it of items){if(usingRanged&&it.slot==='weapon')continue;if(!usingRanged&&it.slot==='ranged')continue;if(two&&it.slot==='offhand')continue;
  const src=cat.items[it.id]||cat.families[it.asset];if(src&&gear[src]&&gear[src].slot!=='body-base')set.add(src);}
 return set;}

/** Editor-Aussehen als Ebenen (tools/paperdoll/aussehen.mjs): Bart, Brille/Sonnenbrille/Stirnband, Frisur. Ein Helm verdeckt Kopfsachen. */
export function lookSources(tint,items=[]){return [];}

// ---------- Zusammensetzen ----------
const tileCanvas=typeof document!=='undefined'?document.createElement('canvas'):null,tctx=tileCanvas?.getContext('2d',{willReadFrequently:true});
function tile(arch,src,dir,band,f){const cat=paperdoll.catalog,{W,H}=cat,mirror=(dir==='sw'||dir==='ne')&&!cat.own[dir].includes(src),base=mirror?(dir==='sw'?'se':'nw'):dir;
 const img=paperdoll.images.get(`${src}-${arch}${cat.dirs[base]}`);if(!img)return null;const row=cat.bands.indexOf(band);
 if(tileCanvas.width!==W){tileCanvas.width=W;tileCanvas.height=H;}tctx.clearRect(0,0,W,H);tctx.save();if(mirror){tctx.translate(W,0);tctx.scale(-1,1);}
 tctx.drawImage(img,f*W,row*H,W,H,0,0,W,H);tctx.restore();const d=tctx.getImageData(0,0,W,H).data;for(let i=3;i<d.length;i+=4)if(d[i])return d;return null;}
const frameCache=new Map(),FRAME_LIMIT=180;// je Eintrag nur Pixelfeld (138 KB) + kleine Weltbilder
function remember(map,key,val,limit){map.set(key,val);if(map.size>limit)map.delete(map.keys().next().value);return val;}
function composed(arch,dir,f,srcs){const key=[arch,dir,f,[...srcs].sort().join(',')].join('|');
 const hit=frameCache.get(key);if(hit){frameCache.delete(key);frameCache.set(key,hit);return hit;}
 const cat=paperdoll.catalog,{W,H}=cat,order=orderSources(srcs,cat.sources);
 const px=composeCore(W,H,cat.bands,order,(s,band)=>{if(s==='dutt'&&(band!=='kopf'||!cat.archetypes[arch].dutt))return null;if(cat.sources[s]&&!cat.sources[s].bands.includes(band))return null;return tile(arch,s,dir,band,f);});
 return remember(frameCache,key,{px,full:new Map(),small:new Map()},FRAME_LIMIT);}
/** Farbtreppen ersetzen (Haut/Haar); nur exakte Palettenfarben, daher vor der Kontur. */
function recolor(px,m){if(m.size)for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const c=m.get(px[i]<<16|px[i+1]<<8|px[i+2]);if(c){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];}}return px;}
/** Vollbild nur für UI/Nahansicht (Editor, Porträt, starker Zoom). */
function full(fr,m,tk){let cv=fr.full.get(tk);if(cv)return cv;const {W,H}=paperdoll.catalog;cv=document.createElement('canvas');cv.width=W;cv.height=H;
 cv.getContext('2d').putImageData(new ImageData(recolor(new Uint8ClampedArray(fr.px),m),W,H),0,0);fr.full.set(tk,cv);if(fr.full.size>2)fr.full.delete(fr.full.keys().next().value);return cv;}

// ---------- Weltgröße: Flächenmittel → nächste Palettenfarbe → Kontur (wie die Codex-Einpassung) ----------
let PALETTE=[];const snapCache=new Map();
function buildPalette(cat){PALETTE=cat.palette.map(k=>[k>>16,k>>8&255,k&255]);}
function snap(r,g,b){const key=(r>>2)<<12|(g>>2)<<6|(b>>2);let c=snapCache.get(key);if(c)return c;let bd=1e18;
 for(const q of PALETTE){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}snapCache.set(key,c);return c;}
function shrunk(cv,k,m,tk){const key=k.toFixed(2)+'|'+tk;let s=cv.small.get(key);if(s)return s;
 const {W,H}=paperdoll.catalog,px=cv.px,w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k)),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0,n=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4,al=px[i+3]/255;r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;a+=al;n++;}
  if(!n||a/n<.42)continue;const c=snap(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 recolor(o,m);
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
  if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;
 s=document.createElement('canvas');s.width=w;s.height=h;s.getContext('2d').putImageData(new ImageData(o,w,h),0,0);cv.small.set(key,s);
 if(cv.small.size>4)cv.small.delete(cv.small.keys().next().value);return s;}

// ---------- Zeichnen (gleicher Vertrag wie drawDetailedHero: Fußpunkt x/y, magnify 1 = Weltgröße) ----------
const contextScale=c=>{const t=c.getTransform();return Math.hypot(t.a,t.b);};
/** Welteinheiten je Bogenpixel: Archetypen auf 26 E angeglichen, halbe natürliche Streuung bleibt. */
function unitScale(arch){const cat=paperdoll.catalog,hs=Object.values(cat.archetypes).map(a=>a.height),mean=hs.reduce((a,b)=>a+b,0)/hs.length;
 return cat.worldHeight/(cat.archetypes[arch].height*.5+mean*.5);}
export function drawPaperdoll(c,id,x,y,p={},magnify=1){
 if(!paperdoll.ready){if(!pending)loadPaperdoll();return false;}
 const actor=ACTORS.get(id),arch=ARCH[id]||actor?.arch;if(!arch||!paperdoll.catalog.archetypes[arch])return false;
 const cat=paperdoll.catalog,dir=DIRS.includes(directionOf(p))?directionOf(p):'se',dead=p.dead||p.hp===0;
 const items=p.visualEquipment||actor?.equipment||[],tint=p.tint||actor?.tint||null;
 const srcs=paperdollSources(items,!!p.usingRanged);srcs.add('koerper');for(const s of lookSources(tint,items))if(paperdoll.catalog.sources[s])srcs.add(s);
 const f=dead?0:paperdollFrame(p),cv=composed(arch,dir,f,srcs),m=recolorMap(arch,tint),tk=(tint?.skin||'')+'.'+(tint?.hair||'');
 const u=unitScale(arch)*magnify,dev=u*contextScale(c),k=Math.min(1,Math.round(dev*50)/50),bmp=k<.82?shrunk(cv,k,m,tk):full(cv,m,tk);
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,5.2*magnify,1.56*magnify,0,0,7);c.fill();
 if(dead){c.rotate(dir.endsWith('w')?Math.PI/2:-Math.PI/2);c.translate(0,-cat.W*u*.18);}
 c.drawImage(bmp,0,0,bmp.width,bmp.height,-cat.pivot.x*u,-cat.pivot.y*u,cat.W*u,cat.H*u);
 if(p.parry>0&&!dead){c.strokeStyle='#f3b84b';c.lineWidth=1.2;c.lineCap='round';const r=13*magnify;c.beginPath();c.arc(0,-13*magnify,r,dir.endsWith('w')?2:-1.3,dir.endsWith('w')?4.5:1.1);c.stroke();}
 c.restore();return true;
}
