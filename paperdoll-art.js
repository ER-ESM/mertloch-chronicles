// Anziehpuppe im Spiel (E-58 Punkt 6, Hybrid-Stand 2026-09-24): Figuren = Archetyp (dieter/baerbel/kevin) + Aussehen (hero-tint) + Ausrüstung.
// Bögen aus tools/paperdoll (node tools/paperdoll/puppe.mjs --runtime): je Quelle (Körper, Dutt, Aussehen, Gegenstand) × Archetyp × Richtung
// ein Grundbogen (Stehen/Blinzeln/Laufen) und ein Aktionsbogen (Kampf, Zaubern, Rasten …), Zeilen = Tiefenbänder der Quelle. Zusammengesetzt wird zur Laufzeit mit demselben Kern wie im Werkzeug (paperdoll-kern.js), dann
// Haut/Haar über die Farbtreppen umgefärbt und für die Welt hochwertig verkleinert (Flächenmittel → Palette → Kontur).
import {composeCore,sources as orderSources,useShade} from './paperdoll-kern.js';

// stats: Diagnose (Konsole: (await import('./paperdoll-art.js')).paperdoll.stats) – zusammengesetzt, vorgewärmt, per Budget vertagt, Rückfall auf alten Weg
export const paperdoll={ready:false,catalog:null,images:new Map(),missing:new Set(),version:0,failed:false,stats:{composed:0,warmed:0,deferred:0,legacy:0}};
const BASE='./assets/paperdoll/runtime/';
const ARCH={dieter:'dieter',baerbel:'baerbel',anni:'baerbel',kevin:'kevin'};
/** Weitere Figuren (NPCs, Söldner) melden sich mit Archetyp, Aussehen und fester Ausrüstung an. */
const ACTORS=new Map();
export function registerPaperdollActor(id,def){ACTORS.set(id,def);}
export const paperdollArch=id=>ARCH[id]||ACTORS.get(id)?.arch||null;

const image=(src,low)=>new Promise(resolve=>{const i=new Image();if(low)i.fetchPriority='low';i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src;});
let pending;
// Bögen nach Bedarf: je Quelle × Archetyp × Richtung ein Grundbogen (Stehen/Blinzeln/Laufen) und ein Aktionsbogen (-akt, ab cat.split),
// Zeilen = nur die Tiefenbänder der Quelle (cat.sources[s].bands). Vorab kommen Körper, Dutt und Aussehen-Ebenen (Grundbögen);
// NPC-Kleidung lädt danach leise im Hintergrund, Ausrüstung und Aktionsbilder beim ersten Gebrauch.
const loading=new Map(),listeners=new Set();let notifyTimer=0;
const sheetKey=(src,arch,dir,part)=>`${src}-${arch}${paperdoll.catalog.dirs[dir]}${part?'-akt':''}`;
// sw/ne: eigener Bogen nur für seitenabhängige Quellen (cat.own), sonst gespiegeltes se/nw. Aktionsbilder hängen an der Waffenseite und
// haben für sw/ne eigene Bögen (cat.ownAkt), damit Körper und Kleidung in derselben Pose stehen.
const baseDir=(src,dir,part=0)=>{if(dir!=='sw'&&dir!=='ne')return dir;const cat=paperdoll.catalog;return cat.own[dir].includes(src)||part&&cat.ownAkt?.[dir]?.includes(src)?dir:dir==='sw'?'se':'nw';};
/** Meldet, wenn nachgeladene Bögen da sind (Standbilder wie Heldenkarten oder Figurenfenster zeichnen dann neu). */
export function onPaperdollLoad(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
function notify(){if(notifyTimer)return;notifyTimer=setTimeout(()=>{notifyTimer=0;for(const fn of listeners)try{fn();}catch{}},60);}
// Fehlgeschlagene Bögen (Netz, Server unter Last) zweimal nachfordern, erst dann gelten sie als fehlend.
const fetchSheet=async(key,low)=>{for(const wait of [0,1500,5000]){if(wait)await new Promise(r=>setTimeout(r,wait));const im=await image(BASE+key+'.png',low);if(im)return im;}return null;};
function want(key,low=false){if(paperdoll.images.has(key)||loading.has(key)||paperdoll.missing.has(key))return loading.get(key);
 const pr=fetchSheet(key,low).then(im=>{loading.delete(key);if(im){paperdoll.images.set(key,im);paperdoll.version++;notify();}else paperdoll.missing.add(key);return im;});
 loading.set(key,pr);return pr;}
function sheetsOf(src,part,archs=Object.keys(paperdoll.catalog.archetypes)){const cat=paperdoll.catalog,out=[];
 for(const arch of archs)for(const dir of Object.keys(cat.dirs))if(baseDir(src,dir,part)===dir)out.push(sheetKey(src,arch,dir,part));return out;}
/** Quellen einer Figur vorab holen (z. B. Held vor dem Figurenfenster); löst auf, wenn alles da ist. */
export async function preloadPaperdoll(srcs,arch=null,part=0){await loadPaperdoll();if(!paperdoll.ready)return false;
 await Promise.all([...srcs].filter(s=>paperdoll.catalog.sources[s]).flatMap(s=>sheetsOf(s,part,arch?[arch]:undefined)).map(k=>want(k)));return true;}
/** Figur (Held) vorab vollständig holen – Grund- und Aktionsbögen ihrer Ausrüstung und ihres Aussehens –, damit beim Spielstart kein Bild fehlt. */
export async function preloadFigure(id,items=[],tint=null){await loadPaperdoll();const arch=paperdollArch(id);if(!paperdoll.ready||!arch)return false;
 const srcs=new Set(['koerper','dutt',...paperdollSources(items),...paperdollSources(items,true),...lookSources(tint,items)]);
 return Promise.all([preloadPaperdoll(srcs,arch,0),preloadPaperdoll(srcs,arch,1)]).then(r=>r.every(Boolean));}
/** Katalog + Grundbögen von Körper, Dutt und Aussehen (Ladebildschirm); bis dahin zeichnen die bisherigen Wege. */
export function loadPaperdoll(){return pending||=(async()=>{
 try{
  const r=await fetch(BASE+'catalog.json');if(!r.ok){paperdoll.failed=true;return;}
  const cat=await r.json();paperdoll.catalog=cat;
  const first=Object.keys(cat.sources).filter(s=>s==='koerper'||s==='dutt'||cat.sources[s].slot==='look');
  const got=await Promise.all(first.flatMap(s=>sheetsOf(s,0)).map(k=>want(k)));
  if(got.some(im=>!im)){paperdoll.failed=true;paperdoll.catalog=null;return;}
  useShade(cat.shade);buildPalette(cat);paperdoll.ready=true;
  // NPC-Kleidung (angemeldete Akteure) leise nachladen, damit Figuren beim ersten Anblick vollständig sind.
  const idle=globalThis.requestIdleCallback||(fn=>setTimeout(fn,200));
  idle(()=>{const srcs=new Set();for(const a of ACTORS.values())for(const s of paperdollSources(a.equipment||[]))srcs.add(s);
   const keys=[...srcs].flatMap(s=>sheetsOf(s,0));let i=0;const next=()=>{const batch=keys.slice(i,i+=4);if(batch.length)Promise.all(batch.map(k=>want(k,true))).then(next);else prewarm(idle);};next();});
  if(typeof requestAnimationFrame==='function'){const tick=()=>{frameNo++;requestAnimationFrame(tick);};requestAnimationFrame(tick);}
 }catch{paperdoll.failed=true;paperdoll.catalog=null;}
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
export function recolorMap(arch,tint){const key=arch+'|'+(tint?.skin||'hell')+'|'+(tint?.hair||'natur');if(recolorCache.has(key))return recolorCache.get(key);
 const cat=paperdoll.catalog,m=new Map(),sk=SKIN[tint?.skin],hc=HAIR[tint?.hair];
 if(sk)for(const c of [...cat.ramps.skin,...cat.ramps.blush]){const [h,s,l]=rgbToHsl(c);m.set(hex(c),hslToRgb(sk.h+(((h-26)%360+540)%360-180)*.3,Math.min(1,s*.5+sk.s*.5),l*sk.m+(1-sk.m)*.06));}
 if(hc){const ramp=cat.ramps[cat.archetypes[arch].hair]||[],mid=rgbToHsl(ramp[Math.min(2,ramp.length-1)]||[128,128,128])[2]||.4;
  for(const c of ramp){const [,,l]=rgbToHsl(c);m.set(hex(c),hslToRgb(hc.h,hc.s,Math.max(.05,Math.min(.95,l*hc.l/mid))));}}
 recolorCache.set(key,m);return m;}

// ---------- Bild wählen ----------
const DIRS=['se','sw','nw','ne'];
const directionOf=p=>p.direction||((p.facing||1)>0?'se':'sw');
/** Spielpose mit derselben Rangfolge wie redesignPose (redesign-art.js): tot > Sprint > getroffen > Parade > Zaubern >
 *  Angriffsphasen (Fernkampf: zielen/abdrücken) > Laufen > Rasten > Stehen; p.artPose (z. B. 'walk-3', 'impact') geht vor. */
export function paperdollPose(p={}){
 if(p.artPose)return p.artPose;
 if(p.dead||p.hp===0)return 'dead';
 if(p.dash>0)return 'dash';
 if(p.hurt>0)return 'hit';
 if(p.parry>0)return 'parry';
 if(p.casting)return p.usingRanged?'ranged-aim':'cast';
 if(p.castPose>0)return 'cast';
 if(p.attack>0){if(p.usingRanged)return p.attack>.12?'ranged-aim':'ranged-release';return p.attack>.18?'anticipation':p.attack>.07?'impact':'recovery';}
 if(p.moving)return 'walk';
 if(p.resting)return 'rest';
 return 'idle';
}
/** Spielpose → Bild im Bogen (tools/paperdoll/puppe.mjs FRAMES); Zweihänder (ohne Fernkampf) nehmen die Zweihand-Bilder. */
export const PAPERDOLL_POSE_FRAMES={dash:['sprint',0],hit:['getroffen',0],parry:['parade',0],cast:['zaubern',0],anticipation:['hieb',0],impact:['hieb',1],recovery:['hieb',2],'ranged-aim':['zielen',0],'ranged-release':['schuss',0],rest:['rasten',0]};
const TWO_HAND_FRAMES={hieb:'hieb2',parade:'parade2'},frameIndex=new WeakMap();
/** Reine Zuordnung (ohne geladene Bögen testbar): Bildnummer für Pose p; fehlt ein Bild im Katalog, gilt Atmen/Blinzeln. */
export function paperdollFrameFor(frames,p={},time=0,{stride=64,items=[]}={}){
 let ix=frameIndex.get(frames);if(!ix){ix=new Map(frames.map((f,n)=>[f.anim+':'+(f.i||0),n]));frameIndex.set(frames,ix);}
 const at=(anim,i=0)=>ix.get(anim+':'+i)??-1,pose=paperdollPose(p);
 if(pose==='dead')return 0;// liegt: Drehung in drawPaperdoll
 if(pose.startsWith('walk')){const walk=at('laufen');if(walk>=0){const k=pose.startsWith('walk-')?+pose.slice(5):Math.floor(((p.walkDistance||0)-(p.walkStartDistance||0))/stride*8);return walk+((k%8)+8)%8;}}
 const m=PAPERDOLL_POSE_FRAMES[pose];
 if(m){const two=(!p.usingRanged||p.parry>0)&&items.some(i=>i.slot==='weapon'&&i.hands===2),f2=two&&TWO_HAND_FRAMES[m[0]]?at(TWO_HAND_FRAMES[m[0]],m[1]):-1,f=f2>=0?f2:at(m[0],m[1]);if(f>=0)return f;}
 const blink=at('blinzeln'),cyc=(time+(p.seed||0)*977)%3600;if(blink>=0&&cyc>3350&&cyc<3500)return blink;return Math.floor(time/300)%4;
}
/** Bildnummer im Bogen für die aktuelle Spielpose (items = sichtbare Ausrüstung, für Zweihand). */
export function paperdollFrame(p={},time=performance.now(),items=p.visualEquipment||[]){const cat=paperdoll.catalog;return paperdollFrameFor(cat.frames,p,time,{stride:cat.stride||64,items});}
/** Quellen aus der sichtbaren Ausrüstung (equipment-appearance.js): feste Kennung vor Familie; Zweihänder verdrängt die Nebenhand.
 *  Fernkampf (usingRanged) zeigt die Fernwaffe statt Haupt- und Nebenhand (wie equipment-art/prerender-art), sonst umgekehrt.
 *  Einhandwaffe im Nebenhandplatz → Quelle „Kennung_nh“ (linke Hand); Handschuh + Schild → „Handschuh_faust“ über der Schildfaust. */
export function paperdollSources(items=[],usingRanged=false){
 const cat=paperdoll.catalog,set=new Set(),gear=cat.sources,two=items.some(i=>i.slot==='weapon'&&i.hands===2);
 for(const it of items){if(usingRanged&&(it.slot==='weapon'||it.slot==='offhand'))continue;if(!usingRanged&&it.slot==='ranged')continue;if(two&&it.slot==='offhand')continue;
  let src=cat.items[it.id]||cat.families[it.asset];if(it.slot==='offhand'&&gear[src]?.slot==='weapon')src=src+'_nh';
  if(src&&gear[src]&&gear[src].slot!=='body-base')set.add(src);}
 if([...set].some(s=>gear[s].slot==='offhand'&&!gear[s].hands))for(const s of [...set])if(gear[s].slot==='hands'&&gear[s+'_faust'])set.add(s+'_faust');
 return set;}

/** Editor-Aussehen als Ebenen (tools/paperdoll/aussehen.mjs): Frisur, Bart, Brille/Sonnenbrille/Stirnband – Reihenfolge = Zeichenfolge im
 *  Kopfband. frisur-* bringt den ganzen Kopf mit (paperdoll-kern.js lässt Körperkopf und Dutt weg). Brillen und Bart bleiben immer (Kopfteile
 *  liegen ohnehin darüber); Quellen am Scheitel (Katalog crownLooks: Irokese, Stirnband) entfallen nur unter einem gezeichneten Kopfteil, das
 *  den Scheitel bedeckt – Kopfteile mit offenem Scheitel stehen im Katalog unter openHead (z. B. Kopfhörer). */
export function lookSources(tint,items=[]){if(!tint)return [];const cat=paperdoll.catalog,out=[];
 const crown=new Set(cat?.crownLooks||[]),open=new Set(cat?.openHead||[]);
 const covered=!!cat&&items.some(i=>{if(i?.slot!=='head')return false;const s=cat.items[i.id]||cat.families[i.asset];return !!s&&!!cat.sources[s]&&!open.has(s);});
 const add=s=>{if(!(covered&&crown.has(s)))out.push(s);};
 if(tint.style&&tint.style!=='natur')add('frisur-'+tint.style);
 if(tint.beard&&tint.beard!=='natur')add('bart-'+tint.beard);
 if(tint.face&&tint.face!=='ohne')add(tint.face);
 return out;}

// ---------- Zusammensetzen ----------
const tileCanvas=typeof document!=='undefined'?document.createElement('canvas'):null,tctx=tileCanvas?.getContext('2d',{willReadFrequently:true});
function tile(arch,src,dir,band,f){const cat=paperdoll.catalog,{W,H}=cat,split=cat.split??cat.frames.length,part=f>=split?1:0,base=baseDir(src,dir,part),mirror=base!==dir;
 const img=paperdoll.images.get(sheetKey(src,arch,base,part));if(!img)return null;const rows=cat.layout==='bands'?(cat.sources[src]?.bands||cat.bands):cat.bands,row=rows.indexOf(band);if(row<0)return null;
 if(tileCanvas.width!==W){tileCanvas.width=W;tileCanvas.height=H;}tctx.clearRect(0,0,W,H);tctx.save();if(mirror){tctx.translate(W,0);tctx.scale(-1,1);}
 tctx.drawImage(img,(part?f-split:f)*W,row*H,W,H,0,0,W,H);tctx.restore();const d=tctx.getImageData(0,0,W,H).data;for(let i=3;i<d.length;i+=4)if(d[i])return d;return null;}
const frameCache=new Map(),FRAME_LIMIT=120;// je Eintrag Pixelfeld (138 KB) + höchstens 2 Vollbilder; Weltbilder liegen in worldCache
function remember(map,key,val,limit){map.set(key,val);if(map.size>limit)map.delete(map.keys().next().value);return val;}
/** Zeichenfolge der Quellen (Kern) ohne doppelten Körper; Dutt nur bei Archetypen mit Dutt. */
function layers(arch,srcs){const cat=paperdoll.catalog,rest=new Set(srcs);rest.delete('koerper');return orderSources(rest,cat.sources).filter(s=>s!=='dutt'||cat.archetypes[arch].dutt);}
function composed(arch,dir,f,srcs,key){const hit=frameCache.get(key);if(hit){frameCache.delete(key);frameCache.set(key,hit);return hit;}
 const cat=paperdoll.catalog,{W,H}=cat;
 paperdoll.stats.composed++;const px=composeCore(W,H,cat.bands,layers(arch,srcs),(s,band)=>{if(s==='dutt'&&band!=='kopf')return null;if(cat.sources[s]&&!cat.sources[s].bands.includes(band))return null;return tile(arch,s,dir,band,f);});
 return remember(frameCache,key,{px,full:new Map()},FRAME_LIMIT);}
/** Farbtreppen ersetzen (Haut/Haar); nur exakte Palettenfarben, daher vor der Kontur. */
export function recolor(px,m){if(m.size)for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const c=m.get(px[i]<<16|px[i+1]<<8|px[i+2]);if(c){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];}}return px;}
/** Vollbild nur für UI/Nahansicht (Editor, Porträt, starker Zoom). */
function full(fr,m,tk){let cv=fr.full.get(tk);if(cv)return cv;const {W,H}=paperdoll.catalog;cv=document.createElement('canvas');cv.width=W;cv.height=H;
 cv.getContext('2d').putImageData(new ImageData(recolor(new Uint8ClampedArray(fr.px),m),W,H),0,0);fr.full.set(tk,cv);if(fr.full.size>2)fr.full.delete(fr.full.keys().next().value);return cv;}

// ---------- Weltgröße: Flächenmittel → nächste Palettenfarbe → Kontur (wie die Codex-Einpassung) ----------
let PALETTE=[];const snapCache=new Map();
function buildPalette(cat){PALETTE=cat.palette.map(k=>[k>>16,k>>8&255,k&255]);}
export function snap(r,g,b){const key=(r>>2)<<12|(g>>2)<<6|(b>>2);let c=snapCache.get(key);if(c)return c;let bd=1e18;
 for(const q of PALETTE){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}snapCache.set(key,c);return c;}
function shrunk(fr,k,m){let s;
 const {W,H}=paperdoll.catalog,px=fr.px,w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k)),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0,n=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4,al=px[i+3]/255;r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;a+=al;n++;}
  if(!n||a/n<.42)continue;const c=snap(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 recolor(o,m);
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
  if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;
 s=document.createElement('canvas');s.width=w;s.height=h;s.getContext('2d').putImageData(new ImageData(o,w,h),0,0);return s;}

// ---------- Zeichnen (gleicher Vertrag wie drawDetailedHero: Fußpunkt x/y, magnify 1 = Weltgröße) ----------
export const contextScale=c=>{const t=c.getTransform();return Math.hypot(t.a,t.b);};
/** Welteinheiten je Bogenpixel: Archetypen (Höhe mit Dutt) auf 26 E angeglichen, ein Fünftel der natürlichen Streuung bleibt –
 *  so bleiben alle Figuren innerhalb ±5 % der Heldenhöhe (scripts/figure-size-check.mjs), die Körpertypen unterscheiden sich in den Proportionen. */
export function unitScale(arch){const cat=paperdoll.catalog,hs=Object.values(cat.archetypes).map(a=>a.height),mean=hs.reduce((a,b)=>a+b,0)/hs.length;
 return cat.worldHeight/(cat.archetypes[arch].height*.8+mean*.2);}
// Weltbilder (verkleinert, umgefärbt) je Zusammensetzung × Maßstab × Tönung: bei Treffer wird gar nicht zusammengesetzt.
// Budget: höchstens BUDGET neue Weltbilder je Bild (~12 ms Fenster); darüber zeigt eine Figur ihr letztes Bild weiter,
// damit viele NPCs beim ersten Anblick nicht ruckeln. Nahansichten (Editor, Porträt) laufen immer sofort.
const worldCache=new Map(),WORLD_LIMIT=900,lastDrawn=new Map(),budget={f:-1,n:0},BUDGET=2;let frameNo=0,warming=false;
/** Nach dem Nachladen je angemeldeter Figur ein Standbild (se/sw, Bild 0) in Leerlaufpausen zusammensetzen: Beim ersten Anblick hat jede
 *  Figur schon ein Bild, das Budget greift, und viele NPCs auf einmal kosten keinen Ruckler. Maßstab wie in der Welt (2 px/E × Pixeldichte). */
function prewarm(idle){const ids=[...ACTORS.keys()],cv=document.createElement('canvas');cv.width=cv.height=1;const c=cv.getContext('2d');let i=0;
 const step=deadline=>{c.setTransform(2*(globalThis.devicePixelRatio||1),0,0,2*(globalThis.devicePixelRatio||1),0,0);
  do{const n=i++;if(n>=ids.length*2)return;const id=ids[n>>1],dir=n&1?'sw':'se';warming=true;try{if(drawPaperdoll(c,id,0,0,{direction:dir,seed:0},1))paperdoll.stats.warmed++;}finally{warming=false;}}
  while(deadline?.timeRemaining?deadline.timeRemaining()>8:false);idle(step);};idle(step);}
export function drawPaperdoll(c,id,x,y,p={},magnify=1){
 if(!paperdoll.ready){if(!pending)loadPaperdoll();return false;}
 const actor=ACTORS.get(id),arch=ARCH[id]||actor?.arch;if(!arch||!paperdoll.catalog.archetypes[arch])return false;
 const cat=paperdoll.catalog,dir=DIRS.includes(directionOf(p))?directionOf(p):'se',dead=p.dead||p.hp===0;
 const items=p.visualEquipment||actor?.equipment||[],tint=p.tint||actor?.tint||null;
 const srcs=paperdollSources(items,!!p.usingRanged&&!(p.parry>0));srcs.add('koerper');for(const s of lookSources(tint,items))if(cat.sources[s])srcs.add(s);// Parade immer mit Nahkampfwaffe (wie redesign-art)
 // Rückfallbild je Figur (Kennung + Quellen + Tönung): Mitspieler mit gleichem Archetyp teilen es nie
 const fig=id+'|'+[...srcs].sort().join(',')+'|'+(tint?.skin||'')+'.'+(tint?.hair||''),lastKey=fig+'|'+dir,anyKey=fig+'|*';
 let f=dead?0:paperdollFrame(p,undefined,items);const split=cat.split??cat.frames.length;
 const need=s=>{const part=f>=split?1:0;return sheetKey(s,arch,baseDir(s,dir,part),part);},open=()=>['koerper',...layers(arch,srcs)].filter(s=>!paperdoll.images.has(need(s)));
 let miss=open();
 if(miss.length){for(const s of miss)want(need(s));
  if(f>=split){f=Math.floor(performance.now()/300)%4;miss=open();for(const s of miss)want(need(s));}// Aktionsbilder laden noch: so lange Stand
  for(const s of miss)if(paperdoll.missing.has(need(s)))srcs.delete(s);// Bogen fehlt dauerhaft: ohne diese Ebene
  miss=miss.filter(s=>srcs.has(s)||s==='dutt'&&!paperdoll.missing.has(need(s)));
  if(miss.length){const last=lastDrawn.get(lastKey)||lastDrawn.get(anyKey);if(!last||miss.includes('koerper')){paperdoll.stats.legacy++;return false;}return blit(c,x,y,p,magnify,arch,dir,dead,last);}}
 const m=recolorMap(arch,tint),tk=(tint?.skin||'')+'.'+(tint?.hair||''),key=arch+'|'+dir+'|'+f+'|'+[...srcs].sort().join(',');
 const u=unitScale(arch)*magnify,dev=u*contextScale(c),k=Math.min(1,Math.round(dev*50)/50);let bmp;
 if(k<.82){const wkey=key+'|'+k.toFixed(2)+'|'+tk;bmp=worldCache.get(wkey);
  if(bmp){worldCache.delete(wkey);worldCache.set(wkey,bmp);}
  else{const last=lastDrawn.get(lastKey);if(budget.f!==frameNo){budget.f=frameNo;budget.n=0;}// nur dieselbe Richtung – nie eine falsche Ansicht zeigen
   if(!warming&&budget.n>=BUDGET&&last){bmp=last;paperdoll.stats.deferred++;}else{budget.n++;bmp=remember(worldCache,wkey,shrunk(composed(arch,dir,f,srcs,key),k,m),WORLD_LIMIT);}}}
 else bmp=full(composed(arch,dir,f,srcs,key),m,tk);
 remember(lastDrawn,lastKey,bmp,600);lastDrawn.set(anyKey,bmp);return blit(c,x,y,p,magnify,arch,dir,dead,bmp);
}
function blit(c,x,y,p,magnify,arch,dir,dead,bmp){const cat=paperdoll.catalog,u=unitScale(arch)*magnify;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,5.2*magnify,1.56*magnify,0,0,7);c.fill();
 if(dead){c.rotate(dir.endsWith('w')?Math.PI/2:-Math.PI/2);c.translate(0,-cat.W*u*.18);}
 c.drawImage(bmp,0,0,bmp.width,bmp.height,-cat.pivot.x*u,-cat.pivot.y*u,cat.W*u,cat.H*u);
 if(p.parry>0&&!dead){c.strokeStyle='#f3b84b';c.lineWidth=1.2;c.lineCap='round';const r=13*magnify;c.beginPath();c.arc(0,-13*magnify,r,dir.endsWith('w')?2:-1.3,dir.endsWith('w')?4.5:1.1);c.stroke();}
 c.restore();return true;}
