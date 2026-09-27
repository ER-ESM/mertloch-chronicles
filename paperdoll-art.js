// Anziehpuppe im Spiel (E-58 Punkt 6, Hybrid-Stand 2026-09-24): Figuren = Archetyp (dieter/baerbel/kevin) + Aussehen (hero-tint) + Ausrüstung.
// Bögen aus tools/paperdoll (node tools/paperdoll/puppe.mjs --runtime): je Quelle (Körper, Dutt, Aussehen, Gegenstand) × Archetyp × Richtung
// ein Grundbogen (Stehen/Blinzeln/Laufen) und ein Aktionsbogen (Kampf, Zaubern, Rasten …), Zeilen = Tiefenbänder der Quelle. Zusammengesetzt wird zur Laufzeit mit demselben Kern wie im Werkzeug (paperdoll-kern.js), dann
// Haut/Haar über die Farbtreppen umgefärbt und für die Welt hochwertig verkleinert (Flächenmittel → Palette → Kontur).
import {worldLayers} from './world-layers.js';
import {useShade,gluecksbringerWahl} from './paperdoll-kern.js';
import {shrinkPixels,makeSnap,tintPalette} from './paperdoll-shrink.js';
import {makeTiles,composeFigure,layersOf,sheetKeyOf,sheetsFor,partOf as partOfCat,baseDirOf} from './paperdoll-tiles.js';

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
// part 0 Grundbogen, 1 Aktionsbogen (-akt), 2 Sonderbogen (-sonder: Ansagen der Dungeon-Figuren, cat.sonder, Bildnummern ab cat.frames.length)
const sheetKey=(src,arch,dir,part)=>sheetKeyOf(paperdoll.catalog,src,arch,dir,part);
/** Teil eines Bilds: 2 = Sonderbild (ab cat.frames.length), 1 = Aktionsbild (ab cat.split), 0 = Grundbild. */
const partOf=partOfCat;
// sw/ne: eigener Bogen nur für seitenabhängige Quellen (cat.own), sonst gespiegeltes se/nw. Aktionsbilder hängen an der Waffenseite und
// haben für sw/ne eigene Bögen (cat.ownAkt), damit Körper und Kleidung in derselben Pose stehen.
const baseDir=(src,dir,part=0)=>baseDirOf(paperdoll.catalog,src,dir,part);
/** Meldet, wenn nachgeladene Bögen da sind (Standbilder wie Heldenkarten oder Figurenfenster zeichnen dann neu). */
/** Einen Bogen des Laufzeitordners nach Bedarf holen (Motive der Dungeon-Figuren, dungeon-figuren-art.js): Promise auf das Bild bzw. null. */
export function loadPaperdollSheet(key,low=false){return paperdoll.images.has(key)?Promise.resolve(paperdoll.images.get(key)):paperdoll.missing.has(key)?Promise.resolve(null):want(key,low);}
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
 if(Number.isInteger(p.artFrame))return p.artFrame;// feste Bildnummer (Dungeon-Figuren: Sonderbilder, dungeon-figuren-art.js)
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
 *  Einhandwaffe im Nebenhandplatz → Quelle „Kennung_nh“ (linke Hand); Handschuh + Schild → „Handschuh_faust“ über der Schildfaust.
 *  Glücksbringer (cat.gluecksbringer) überdecken sich nie: gluecksbringerWahl (paperdoll-kern.js) wählt je Glücksbringer die Fassung
 *  (Stammplatz oder Ausweichplatz), Glücksbringer I (trinket1) vor II (trinket2), NPC-Figuren in Kleidungsreihenfolge. */
export function paperdollSources(items=[],usingRanged=false){
 const cat=paperdoll.catalog,set=new Set(),gear=cat.sources,two=items.some(i=>i.slot==='weapon'&&i.hands===2),gb=cat.gluecksbringer,out=[],gbAt=[],gbList=[];
 const rank=it=>it.slot==='trinket1'?0:it.slot==='trinket2'?1:2;
 for(const it of items){if(usingRanged&&(it.slot==='weapon'||it.slot==='offhand'))continue;if(!usingRanged&&it.slot==='ranged')continue;if(two&&it.slot==='offhand')continue;
  let src=cat.items[it.id]||cat.families[it.asset];if(it.slot==='offhand'&&gear[src]?.slot==='weapon')src=src+'_nh';
  if(!src||!gear[src]||gear[src].slot==='body-base')continue;
  if(gb?.fassungen?.[src]){gbAt.push(out.length);gbList.push([rank(it),gbList.length,src]);out.push(null);}else out.push(src);}
 if(gbList.length){const chosen=gluecksbringerWahl(gbList.sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(e=>e[2]),gb);gbAt.forEach((k,n)=>{out[k]=chosen[n];});}
 for(const s of out)if(gear[s])set.add(s);
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
// Kachelspeicher und Zusammensetzen: paperdoll-tiles.js (gemeinsam mit dem Rechen-Worker paperdoll-worker.js).
let auditRun=0;/* compareWorker: eigener Schlüssel je Vergleich */
const mainTiles=makeTiles({getImage:k=>paperdoll.images.get(k)||null,makeCanvas:()=>document.createElement('canvas')});
// Diagnose (Konsole): (await import('./paperdoll-art.js')).paperdoll.debug.compose('dieter','se',5,['kutte','jeans']) setzt ohne Speicher zusammen und misst.
paperdoll.debug={compose:(arch,dir,f,srcs)=>{const t0=performance.now();composed(arch,dir,f,new Set(['koerper',...srcs]),'debug|'+Math.random());return performance.now()-t0;},clearTiles:()=>mainTiles.clear(),tiles:()=>mainTiles.stats(),/** Prüfung: die letzten n Worker-Bilder im Hauptfaden nachrechnen und Pixel vergleichen (tests/…, perf-handy). */
compareWorker:async(n=20)=>{const list=(pdw.audit||[]).slice(-n),cat=paperdoll.catalog,run='audit'+(++auditRun)+'|';let px=0,diff=0,frames=0,bad=0,rawDiff=0,skipped=0;for(const {j,data,px:wpx} of list){
  /* Bögen, die bisher nur der Worker geladen hat (andere Richtungen, Aktionsbilder), erst im Hauptfaden laden – sonst verglichen wir mit einem unvollständigen Bild */const keys=sheetsFor(cat,j.arch,j.dir,j.f,j.srcs);await Promise.all(keys.map(k=>loadPaperdollSheet(k)));if(keys.some(k=>!paperdoll.images.has(k))){skipped++;continue;}
  const fr=composed(j.arch,j.dir,j.f,j.srcs,run+j.key);const pick=j.m.size?tintedSnap(j.m):snap,{W,H}=paperdoll.catalog,r=shrinkPixels(fr.px,fr.box,W,H,j.k,j.m,pick);frames++;let d=0;for(let i=0;i<r.data.length;i++)if(r.data[i]!==data[i])d++;if(d)bad++;diff+=d;px+=r.data.length;if(wpx){let dp=0;for(let i=0;i<fr.px.length;i++)if(fr.px[i]!==wpx[i])dp++;rawDiff+=dp;}}return {frames,skipped,bad,diffBytes:diff,bytes:px,rawDiff};},
audit:on=>{pdw.audit=on?[]:null;},
worker:()=>{pdw.w?.postMessage({type:'stats'});return {...pdw.stats,pending:pdw.jobs.size,failed:pdw.failed,bad:pdw.bad.size,last:pdw.last||null};}};
const frameCache=new Map(),FRAME_LIMIT=60;// je Eintrag Pixelfeld (138 KB) + höchstens 2 Vollbilder; Weltbilder liegen in worldCache
function remember(map,key,val,limit){map.set(key,val);if(map.size>limit)map.delete(map.keys().next().value);return val;}
/** Zeichenfolge der Quellen (Kern) ohne doppelten Körper; Dutt nur bei Archetypen mit Dutt. */
function layers(arch,srcs){return layersOf(paperdoll.catalog,arch,srcs);}
function composed(arch,dir,f,srcs,key){const hit=frameCache.get(key);if(hit){frameCache.delete(key);frameCache.set(key,hit);return hit;}
 const cat=paperdoll.catalog,{W,H}=cat;
 paperdoll.stats.composed++;const px=composeFigure(cat,mainTiles.tile,arch,dir,f,srcs);
 return remember(frameCache,key,{px,box:px.box,full:new Map()},FRAME_LIMIT);}
/** Farbtreppen ersetzen (Haut/Haar); nur exakte Palettenfarben, daher vor der Kontur. */
export function recolor(px,m){if(m.size)for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const c=m.get(px[i]<<16|px[i+1]<<8|px[i+2]);if(c){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];}}return px;}
/** Vollbild nur für UI/Nahansicht (Editor, Porträt, starker Zoom). */
function full(fr,m,tk){let cv=fr.full.get(tk);if(cv)return cv;const {W,H}=paperdoll.catalog;cv=document.createElement('canvas');cv.width=W;cv.height=H;
 cv.getContext('2d').putImageData(new ImageData(recolor(new Uint8ClampedArray(fr.px),m),W,H),0,0);fr.full.set(tk,cv);if(fr.full.size>2)fr.full.delete(fr.full.keys().next().value);return cv;}

// ---------- Weltgröße: Flächenmittel → nächste Palettenfarbe → Kontur (wie die Codex-Einpassung) ----------
let PALETTE=[],baseSnap=null;
function buildPalette(cat){PALETTE=cat.palette.map(k=>[k>>16,k>>8&255,k&255]);baseSnap=makeSnap(PALETTE);}
/** Einrasten gegen die umgefärbte Palette (Haut/Haar des Editors); genau und reihenfolgeunabhängig (paperdoll-shrink.js makeSnap, Runde 2). */
const tintedSnaps=new WeakMap();
function tintedSnap(m){let f=tintedSnaps.get(m);if(!f){f=makeSnap(tintPalette(PALETTE,m));tintedSnaps.set(m,f);}return f;}
export function snap(r,g,b){return (baseSnap||=makeSnap(PALETTE))(r,g,b);}
function shrunk(fr,k,m){const pick=m.size?tintedSnap(m):snap,{W,H}=paperdoll.catalog,r=shrinkPixels(fr.px,fr.box,W,H,k,m,pick);
 const s=document.createElement('canvas');s.width=r.w;s.height=r.h;s.getContext('2d').putImageData(new ImageData(r.data,r.w,r.h),0,0);return s;}

// ---------- Zeichnen (gleicher Vertrag wie drawDetailedHero: Fußpunkt x/y, magnify 1 = Weltgröße) ----------
export const contextScale=c=>{const t=c.getTransform();return Math.hypot(t.a,t.b);};
/** Welteinheiten je Bogenpixel: Archetypen (Höhe mit Dutt) auf 26 E angeglichen, ein Fünftel der natürlichen Streuung bleibt –
 *  so bleiben alle Figuren innerhalb ±5 % der Heldenhöhe (scripts/figure-size-check.mjs), die Körpertypen unterscheiden sich in den Proportionen. */
export function unitScale(arch){const cat=paperdoll.catalog,hs=Object.values(cat.archetypes).map(a=>a.height),mean=hs.reduce((a,b)=>a+b,0)/hs.length;
 return cat.worldHeight/(cat.archetypes[arch].height*.8+mean*.2);}
// Weltbilder (verkleinert, umgefärbt) je Zusammensetzung × Maßstab × Tönung: bei Treffer wird gar nicht zusammengesetzt.
// Budget: höchstens BUDGET neue Weltbilder je Bild (~12 ms Fenster); darüber zeigt eine Figur ihr letztes Bild weiter,
// damit viele NPCs beim ersten Anblick nicht ruckeln. Nahansichten (Editor, Porträt) laufen immer sofort.
const worldCache=new Map(),WORLD_LIMIT=1400/* Runde 2: vorbereitete Bilder aller Richtungen (Kämpfer ~108, Bewohner ~16 je Figur) */,lastDrawn=new Map(),budget={f:-1,n:0};let frameNo=0,warming=false;
/** Neue Weltbilder je Bild (Handy-Messung 2026-09-27): ein Zusammensetzen kostet 4–16 ms (Mittelklasse-Handy ×4). Der Renderer setzt bei
 *  „Niedriger Auflösung“ 1 statt 2 – eine Figur hält dann höchstens ein Bild länger ihre letzte Haltung, das Bild ruckelt nicht. */
export const paperdollBudget={perFrame:2};
// Geschwisterbilder (übrige Lauf-/Atembilder derselben Richtung) im Leerlauf vorbereiten, damit das Budget im Bild selten greift.
const warmQueue=[],warmKeys=new Set();let warmPending=false;
function queueWarm(job){if(pdw.w)return;/* mit Worker bestellt warmFigure */if(warmKeys.has(job.wkey)||worldCache.has(job.wkey)||warmQueue.length>64)return;warmKeys.add(job.wkey);warmQueue.push(job);
 if(warmPending||typeof requestIdleCallback!=='function')return;warmPending=true;requestIdleCallback(runWarm);}
function runWarm(deadline){warmPending=false;
 while(warmQueue.length&&deadline.timeRemaining()>10){const j=warmQueue.shift();warmKeys.delete(j.wkey);if(worldCache.has(j.wkey))continue;
  /* nur mit vollständig geladenen Bögen – sonst bliebe ein unvollständiges Bild im Speicher */const part=partOf(paperdoll.catalog,j.f);if(['koerper',...layers(j.arch,j.srcs)].some(src=>!paperdoll.images.has(sheetKey(src,j.arch,baseDir(src,j.dir,part),part))))continue;
  worldCache.set(j.wkey,shrunk(composed(j.arch,j.dir,j.f,j.srcs,j.key),j.k,j.m));if(worldCache.size>WORLD_LIMIT)worldCache.delete(worldCache.keys().next().value);paperdoll.stats.warmed++;}
 if(warmQueue.length){warmPending=true;requestIdleCallback(runWarm);}}
/** Übrige Bilder desselben Zyklus: Laufen (8 Bilder ab „laufen“) bzw. Atmen (0–3). */
function cycleOf(f){const cat=paperdoll.catalog,walk=cat.frames.findIndex(x=>x.anim==='laufen');if(walk>=0&&f>=walk&&f<walk+8)return Array.from({length:8},(_,i)=>walk+i);if(f>=0&&f<4)return [0,1,2,3];return [];}
/** Nach dem Nachladen je angemeldeter Figur ein Standbild (se/sw, Bild 0) in Leerlaufpausen zusammensetzen: Beim ersten Anblick hat jede
 *  Figur schon ein Bild, das Budget greift, und viele NPCs auf einmal kosten keinen Ruckler. Maßstab wie in der Welt (2 px/E × Pixeldichte). */
function prewarm(idle){const ids=[...ACTORS.keys()],cv=document.createElement('canvas');cv.width=cv.height=1;const c=cv.getContext('2d');let i=0;
 const step=deadline=>{c.setTransform(2*(globalThis.devicePixelRatio||1),0,0,2*(globalThis.devicePixelRatio||1),0,0);
  do{const n=i++;if(n>=ids.length*2)return;const id=ids[n>>1],dir=n&1?'sw':'se';warming=true;try{if(drawPaperdoll(c,id,0,0,{direction:dir,seed:0},1))paperdoll.stats.warmed++;}finally{warming=false;}}
  while(deadline?.timeRemaining?deadline.timeRemaining()>8:false);idle(step);};idle(step);}
// ---------- Rechen-Worker (Handy-Leistung Runde 2, 27.09.2026) ----------
// Neue Weltbilder entstehen im Worker (paperdoll-worker.js): Der Hauptfaden zeigt so lange das letzte Bild derselben Richtung (wie beim
// Budget bisher) und bestellt nebenbei die Bilder, die als Nächstes gebraucht werden – übrige Bilder des laufenden Zyklus, Atmen und Laufen
// in allen Richtungen, bei Kämpfern auch alle Aktionsbilder. Nur ganz ohne Vorbild (erster Anblick in dieser Richtung) setzt der
// Hauptfaden selbst zusammen. Ohne Worker/OffscreenCanvas (ältere Browser) bleibt alles wie vorher.
const pdw={w:null,failed:false,seq:1,jobs:new Map(),byKey:new Map(),tints:new Set(),bad:new Set(),warmed:new Set(),stats:{sent:0,done:0,missing:0,errors:0},last:null};
function pdWorker(){if(pdw.w||pdw.failed)return pdw.w;
 if(typeof Worker!=='function'||typeof OffscreenCanvas!=='function'||typeof document==='undefined'||!paperdoll.catalog||globalThis.__paperdollWorker===false){pdw.failed=true;return null;}
 try{const w=new Worker(new URL('./paperdoll-worker.js',import.meta.url),{type:'module'});w.onmessage=onPdMessage;
  w.onerror=()=>{pdw.failed=true;pdw.w=null;for(const j of pdw.jobs.values())pdw.bad.add(j.wkey);pdw.jobs.clear();pdw.byKey.clear();};
  w.postMessage({type:'init',catalog:paperdoll.catalog,base:new URL(BASE,location.href).href});pdw.w=w;}catch{pdw.failed=true;}
 return pdw.w;}
function onPdMessage(e){const d=e.data;if(d.type==='stats'){pdw.last=d;return;}const j=pdw.jobs.get(d.id);if(!j)return;pdw.jobs.delete(d.id);pdw.byKey.delete(j.wkey);
 if(d.data){const cv=document.createElement('canvas');cv.width=d.w;cv.height=d.h;cv.getContext('2d').putImageData(new ImageData(d.data,d.w,d.h),0,0);remember(worldCache,j.wkey,cv,WORLD_LIMIT);pdw.stats.done++;/* erstes fertiges Bild einer Richtung dient als Vorbild, bis das gewünschte kommt (statt im Hauptfaden zusammenzusetzen) */if(j.fig&&!lastDrawn.has(j.fig+'|'+j.dir))lastDrawn.set(j.fig+'|'+j.dir,cv);if(pdw.audit)pdw.audit.push({j,data:d.data,px:d.px});}
 else{pdw.bad.add(j.wkey);if(d.missing)pdw.stats.missing++;else pdw.stats.errors++;}}
/** Weltbild beim Worker bestellen (prio 0 = jetzt gebraucht); true = bestellt oder schon unterwegs. */
function orderWorld(j,prio){if(pdw.bad.has(j.wkey))return false;const w=pdWorker();if(!w)return false;if(worldCache.has(j.wkey))return true;
 const open=pdw.byKey.get(j.wkey);if(open!==undefined){const o=pdw.jobs.get(open);if(prio<o.prio){o.prio=prio;w.postMessage({type:'prio',id:open,prio});}return true;}
 const id=pdw.seq++;j.prio=prio;pdw.jobs.set(id,j);pdw.byKey.set(j.wkey,id);
 const msg={type:'job',id,prio,arch:j.arch,dir:j.dir,f:j.f,srcs:[...j.srcs],k:j.k,mKey:j.mKey,audit:!!pdw.audit};if(!pdw.tints.has(j.mKey)){msg.m=[...j.m];pdw.tints.add(j.mKey);}
 w.postMessage(msg);pdw.stats.sent++;return true;}
/** Was als Nächstes gebraucht wird, beim Worker vorbestellen: Zyklus der aktuellen Richtung (1), Atmen/Laufen aller Richtungen (2),
 *  Aktionsbilder aller Richtungen bei Kämpfern (3). Je Figur und Stufe nur einmal. */
/* Runde 3 (Handy-Leistung): je Figur den zuletzt vorbestellten Stand merken – solange Richtung, Zyklus und Maßstab gleich bleiben, ist nichts Neues
   zu bestellen; vorher baute jeder Aufruf je Bild ein halbes Dutzend Schlüssel-Zeichenketten, nur um sie in pdw.warmed wiederzufinden. */
const warmState=new Map();let walkIndex=-2,walkCat=null;
function warmFigure(id,fig,arch,dir,f,srcs,k,m,tk,sorted){if(!pdw.w)return;const cat=paperdoll.catalog,split=cat.split??cat.frames.length;if(walkCat!==cat){walkCat=cat;walkIndex=cat.frames.findIndex(x=>x.anim==='laufen');}
 const walk=walkIndex,cycle=f>=split&&f<cat.frames.length?'akt':walk>=0&&f>=walk&&f<walk+8?'lauf':f<4?'atem':'';
 const ws=warmState.get(fig);if(worldLayers.memo&&ws&&ws.dir===dir&&ws.cycle===cycle&&ws.k===k&&ws.size===pdw.warmed.size)return;if(warmState.size>600)warmState.clear();warmState.set(fig,{dir,cycle,k,size:0});
 const tail='|'+sorted,ks=k.toFixed(2),mKey=arch+'|'+tk,base=fig+'|'+ks;
 const order=(d,g,prio)=>{const key=arch+'|'+d+'|'+g+tail;orderWorld({wkey:key+'|'+ks+'|'+tk,arch,dir:d,f:g,srcs,key,k,m,mKey,fig},prio);};
 const tag=base+'|'+dir+'|'+cycle;if(cycle&&!pdw.warmed.has(tag)){pdw.warmed.add(tag);const list=cycle==='akt'?Array.from({length:cat.frames.length-split},(_,i)=>split+i):cycle==='lauf'?Array.from({length:8},(_,i)=>walk+i):[0,1,2,3];for(const g of list)if(g!==f)order(dir,g,1);}
 const fighter=!!ARCH[id]||cycle==='akt';
 if(!pdw.warmed.has(base)){pdw.warmed.add(base);for(const d of DIRS){for(const g of [0,1,2,3])order(d,g,2);}}
 if(fighter&&!pdw.warmed.has(base+'|kampf')){pdw.warmed.add(base+'|kampf');for(const d of DIRS){if(walk>=0)for(let i=0;i<8;i++)order(d,walk+i,2);for(let g=split;g<cat.frames.length;g++)order(d,g,3);}}
 if(pdw.warmed.size>4000)pdw.warmed.clear();warmState.get(fig).size=pdw.warmed.size;}
const complete=new Set(),NONE=[];
export function drawPaperdoll(c,id,x,y,p={},magnify=1){
 if(!paperdoll.ready){if(!pending)loadPaperdoll();return false;}
 const actor=ACTORS.get(id),arch=ARCH[id]||actor?.arch;if(!arch||!paperdoll.catalog.archetypes[arch])return false;
 const cat=paperdoll.catalog,dir=DIRS.includes(directionOf(p))?directionOf(p):'se',dead=p.dead||p.hp===0;
 const items=p.visualEquipment||actor?.equipment||[],tint=p.tint||actor?.tint||null;
 const srcs=paperdollSources(items,!!p.usingRanged&&!(p.parry>0));srcs.add('koerper');for(const s of lookSources(tint,items))if(cat.sources[s])srcs.add(s);// Parade immer mit Nahkampfwaffe (wie redesign-art)
 // Rückfallbild je Figur (Kennung + Quellen + Tönung): Mitspieler mit gleichem Archetyp teilen es nie
 let sorted=[...srcs].sort().join(',');/* Runde 3: einmal statt dreimal je Aufruf */const fig=id+'|'+sorted+'|'+(tint?.skin||'')+'.'+(tint?.hair||''),lastKey=fig+'|'+dir,anyKey=fig+'|*';
 let f=dead?0:paperdollFrame(p,undefined,items);const split=cat.split??cat.frames.length;
 // Sonderbild: nur, wenn jede Ebene einen Sonderbogen hat – sonst das Rückfallbild aus dem Katalog (cat.sonder.frames[k].fb)
 const sonderFb=()=>{const q=cat.sonder?.frames?.[f-cat.frames.length];return q&&q.fb>=0?q.fb:0;};
 if(f>=cat.frames.length&&(!cat.sonder||['koerper',...layers(arch,srcs)].some(s=>{const q=cat.sources[s]?.sonder;return !q||q.archs&&!q.archs.includes(arch);})))f=sonderFb();
 const need=s=>{const part=partOf(cat,f);return sheetKey(s,arch,baseDir(s,dir,part),part);},open=()=>['koerper',...layers(arch,srcs)].filter(s=>!paperdoll.images.has(need(s)));
 /* Runde 3: Sind alle Bögen für Archetyp, Richtung, Bildteil und Quellen einmal da, bleiben sie da (paperdoll.images wächst nur) – dann
    entfällt die Prüfung samt Bogen-Schlüsseln je Ebene und Bild. */
 const ck=arch+'|'+dir+'|'+partOf(cat,f)+'|'+sorted;let miss=worldLayers.memo&&complete.has(ck)?NONE:open();if(!miss.length&&miss!==NONE){complete.add(ck);if(complete.size>4000)complete.clear();}
 if(miss.length){const n0=srcs.size;for(const s of miss)want(need(s));
  if(f>=cat.frames.length){f=sonderFb();miss=open();for(const s of miss)want(need(s));}// Sonderbögen laden noch: so lange das Rückfallbild
  if(f>=split){f=Math.floor(performance.now()/300)%4;miss=open();for(const s of miss)want(need(s));}// Aktionsbilder laden noch: so lange Stand
  for(const s of miss)if(paperdoll.missing.has(need(s)))srcs.delete(s);// Bogen fehlt dauerhaft: ohne diese Ebene
  miss=miss.filter(s=>srcs.has(s)||s==='dutt'&&!paperdoll.missing.has(need(s)));
  if(miss.length){const last=lastDrawn.get(lastKey)||lastDrawn.get(anyKey);if(!last||miss.includes('koerper')){paperdoll.stats.legacy++;return false;}return blit(c,x,y,p,magnify,arch,dir,dead,last);}
  if(srcs.size!==n0)sorted=[...srcs].sort().join(',');}
 const m=recolorMap(arch,tint),tk=(tint?.skin||'')+'.'+(tint?.hair||''),key=arch+'|'+dir+'|'+f+'|'+sorted;
 const u=unitScale(arch)*magnify,dev=u*contextScale(c),k=Math.min(1,Math.round(dev*50)/50);let bmp;
 if(k<.82){const wkey=key+'|'+k.toFixed(2)+'|'+tk;bmp=worldCache.get(wkey);
  if(bmp){worldCache.delete(wkey);worldCache.set(wkey,bmp);}
  else{const last=lastDrawn.get(lastKey),job={wkey,arch,dir,f,srcs,key,k,m,mKey:arch+'|'+tk,fig};if(budget.f!==frameNo){budget.f=frameNo;budget.n=0;}// nur dieselbe Richtung – nie eine falsche Ansicht zeigen
   if(!warming&&last&&orderWorld(job,0)){bmp=last;paperdoll.stats.deferred++;}
   else if(warming&&orderWorld(job,3))return true;/* Vorwärmen beim Laden: bestellen statt im Hauptfaden rechnen */
   else if(!warming&&budget.n>=paperdollBudget.perFrame&&last){bmp=last;paperdoll.stats.deferred++;queueWarm({wkey,arch,dir,f,srcs,key,k,m});}else{budget.n++;bmp=remember(worldCache,wkey,shrunk(composed(arch,dir,f,srcs,key),k,m),WORLD_LIMIT);
    if(!warming&&typeof requestIdleCallback==='function'){const tail='|'+sorted;for(const g of cycleOf(f))if(g!==f){const gk=arch+'|'+dir+'|'+g+tail;queueWarm({wkey:gk+'|'+k.toFixed(2)+'|'+tk,arch,dir,f:g,srcs,key:gk,k,m});}}}}}
 else bmp=full(composed(arch,dir,f,srcs,key),m,tk);
 if(k<.82&&!warming)warmFigure(id,fig,arch,dir,f,srcs,k,m,tk,sorted);
 remember(lastDrawn,lastKey,bmp,600);lastDrawn.set(anyKey,bmp);return blit(c,x,y,p,magnify,arch,dir,dead,bmp);
}
function blit(c,x,y,p,magnify,arch,dir,dead,bmp){const cat=paperdoll.catalog,u=unitScale(arch)*magnify;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,5.2*magnify,1.56*magnify,0,0,7);c.fill();
 if(dead){c.rotate(dir.endsWith('w')?Math.PI/2:-Math.PI/2);c.translate(0,-28.8*u);}// 28,8 Bogenpixel (= 0,18 × frühere Bogenbreite 160): Liegende hängt am Körper, nicht an der Leinwandbreite
 c.drawImage(bmp,0,0,bmp.width,bmp.height,-cat.pivot.x*u,-cat.pivot.y*u,cat.W*u,cat.H*u);
 if(p.parry>0&&!dead){c.strokeStyle='#f3b84b';c.lineWidth=1.2;c.lineCap='round';const r=13*magnify;c.beginPath();c.arc(0,-13*magnify,r,dir.endsWith('w')?2:-1.3,dir.endsWith('w')?4.5:1.1);c.stroke();}
 c.restore();return true;}
