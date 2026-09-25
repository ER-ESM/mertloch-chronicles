// Reiten mit der Anziehpuppe (Laufzeit): Reiter (Archetyp, Aussehen, Ausrüstung ohne Waffen) + Reittier aus den Reit-Bögen
// (node tools/paperdoll/puppe.mjs --reiten → assets/paperdoll/reiten, Format siehe tools/paperdoll/reiten.mjs). Geladen wird nur bei
// Bedarf: Katalog beim ersten Reittier, je Reittier Kacheltabellen + Tierseiten, Reiterseiten nur für den gebrauchten Archetyp.
// Zusammengesetzt Band für Band mit demselben Kern wie im Werkzeug (je Band erst der Reiter, dann das Tier), Haut/Haar umgefärbt und
// für die Welt verkleinert wie paperdoll-art.js. Fällt etwas aus (noch nicht geladen, unbekannte Figur), liefert jede Funktion false.
import {composeCore,sources as orderSources} from './paperdoll-kern.js';
import {paperdoll,loadPaperdoll,paperdollArch,paperdollSources,lookSources,recolorMap,recolor,snap,unitScale,contextScale} from './paperdoll-art.js';
import {MOUNT_RULES,MOUNTS} from './content/index.js';
/** Dungeon Etappe 4 Teil A: Reittier ohne eigene Bögen (art = vorhandenes Reittier) mit Tönung nur auf dem Tier (nicht dem Reiter) –
 *  Platzhalter für „Das halbe Pferd“, bis eigene Grafik freigegeben ist. → {id (Bogen), tint} */
export const mountArtOf=id=>{const d=MOUNTS[id];return d?.art?{id:d.art,tint:d.tint||null}:{id,tint:null};};
const hex=c=>[1,3,5].map(i=>parseInt(String(c).slice(i,i+2),16)||0);

const BASE='./assets/paperdoll/reiten/',DIRS=['se','sw','nw','ne'],STOWED=['weapon','offhand','ranged'];
export const ride={catalog:null,mounts:new Map(),failed:false};
const image=src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src;});
const json=async url=>{try{const r=await fetch(url);return r.ok?await r.json():null;}catch{return null;}};
let catalogJob;const loads=new Map(),dataJobs=new Map();
const loadCatalog=()=>catalogJob||=json(BASE+'catalog.json').then(cat=>{ride.catalog=cat;ride.failed=!cat;return !!cat;});
/** Reittier (Tierseiten) und optional die Reiterseiten eines Archetyps nachladen; true, wenn danach zeichenbar. Fehlschläge bleiben gemerkt. */
export function loadPaperdollMount(id,arch=null){const key=id+'|'+(arch||'@');if(loads.has(key))return loads.get(key);
 const job=(async()=>{if(!await loadCatalog()||!ride.catalog.mounts[id])return false;
  const M=await (dataJobs.get(id)||dataJobs.set(id,json(BASE+ride.catalog.mounts[id].file).then(d=>{if(d){d.images={};ride.mounts.set(id,d);}return d;})).get(id));if(!M)return false;
  for(const k of ['@',...(arch?[arch]:[])]){if(!M.pages[k])return false;if(M.images[k])continue;const imgs=await Promise.all(M.pages[k].map(f=>image(BASE+f)));if(imgs.some(i=>!i))return false;M.images[k]=imgs;}
  return true;})();
 loads.set(key,job);return job;}
const drawable=(id,arch)=>{const M=ride.mounts.get(id);return !!M&&!!M.images['@']&&(!arch||!!M.images[arch]);};
export const paperdollMountIds=()=>Object.keys(ride.catalog?.mounts||{});

// ---------- Bild und Quellen wählen ----------
const directionOf=p=>{const d=p.direction||((p.facing||1)>0?'se':'sw');return DIRS.includes(d)?d:'se';};
/** Bild 0 = Stand, 1–8 = Bewegung nach Wegstrecke (Schrittweite MOUNT_RULES.stride, wie die bisherigen Reittierbögen). */
export function rideFrameIndex(p={},time=0){return p.moving?1+((Math.floor((p.walkDistance??time*70)/MOUNT_RULES.stride*8)%8)+8)%8:0;}
/** Reiterquellen: sichtbare Ausrüstung ohne Waffen/Nebenhand/Fernwaffe (verstaut) + Editor-Aussehen; nur, was die Reit-Bögen kennen. */
export function rideSourceSet(items=[],tint=null,cat=ride.catalog){const set=new Set(),ok=s=>cat.sources[s]&&!STOWED.includes(cat.sources[s].slot)&&cat.sources[s].slot!=='body-base';
 for(const s of paperdollSources(items.filter(i=>!STOWED.includes(i.slot)),false))if(ok(s))set.add(s);
 for(const s of lookSources(tint,items))if(ok(s))set.add(s);return set;}

// ---------- Kacheln und Zusammensetzen ----------
const scratch=typeof document!=='undefined'?document.createElement('canvas'):null,sctx=scratch?.getContext('2d',{willReadFrequently:true});
const tileCache=new Map(),TILE_LIMIT=2400;
function tileData(M,key,t){const ck=M.id+'|'+key+'|'+t;let d=tileCache.get(ck);if(d)return d;const [pg,x,y,w,h]=M.tiles[key][t];
 if(scratch.width<w||scratch.height<h){scratch.width=Math.max(scratch.width,w);scratch.height=Math.max(scratch.height,h);}sctx.clearRect(0,0,w,h);
 sctx.drawImage(M.images[key][pg],x,y,w,h,0,0,w,h);d=sctx.getImageData(0,0,w,h).data;tileCache.set(ck,d);if(tileCache.size>TILE_LIMIT)tileCache.delete(tileCache.keys().next().value);return d;}
let shadeMerged=false;
/** Fehlende Schattenstufen der Reit-Palette in die Tabelle der Puppe übernehmen (gleiche Tabelle für composeCore). */
function mergeShade(){if(shadeMerged||!paperdoll.catalog?.shade||!ride.catalog?.shade)return;const s=paperdoll.catalog.shade;for(const [k,v] of Object.entries(ride.catalog.shade))if(!(k in s))s[k]=v;shadeMerged=true;}
const frameCache=new Map(),FRAME_LIMIT=90;
/** Ein Reitbild (Richtung, Bild k) im Ausschnitt seines Inhalts: {px,x0,y0,w,h} in Reittier-Leinwand-Koordinaten. */
function composed(id,arch,dir,k,srcs,mt=null){const order=arch?orderSources(srcs,ride.catalog.sources):[],key=[id,arch||'@',dir,k,order.join(','),mt?mt.color+mt.alpha:''].join('|'),tc=mt?hex(mt.color):null,ta=mt?.alpha||0;
 const hit=frameCache.get(key);if(hit){frameCache.delete(key);frameCache.set(key,hit);return hit;}
 mergeShade();const M=ride.mounts.get(id),bands=ride.catalog.bands,groups=new Map();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 const add=(s,atlas,e)=>{const [b,t,X,Y,flip]=e,T=M.tiles[atlas][t],g=s+'|'+b;if(!groups.has(g))groups.set(g,[]);groups.get(g).push({atlas,t,X,Y,flip,w:T[3],h:T[4]});x0=Math.min(x0,X);y0=Math.min(y0,Y);x1=Math.max(x1,X+T[3]);y1=Math.max(y1,Y+T[4]);};
 for(const e of M.mount[dir][k])add('@','@',e);
 if(arch){const R=M.riders[arch],P=R.poses[R[dir][k]];for(const s of order)for(const e of P[s]||[])add(s,arch,e);}
 const w=Math.max(1,x1-x0),h=Math.max(1,y1-y0),buf=new Uint8ClampedArray(w*h*4);let dirty=[];
 const px=composeCore(w,h,bands,[...order,'@'],(s,band)=>{const list=groups.get(s+'|'+bands.indexOf(band));if(!list)return null;
  for(const r of dirty)for(let y=0;y<r.h;y++)buf.fill(0,((r.Y-y0+y)*w+r.X-x0)*4,((r.Y-y0+y)*w+r.X-x0+r.w)*4);dirty=list;
  const tint=s==='@'&&tc;/* Etappe 4 Teil A: nur das Tier tönen */
  for(const r of list){const d=tileData(M,r.atlas,r.t);for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const si=(y*r.w+(r.flip?r.w-1-x:x))*4;if(!d[si+3])continue;const di=((r.Y-y0+y)*w+r.X-x0+x)*4;if(tint){buf[di]=d[si]*(1-ta)+tc[0]*ta;buf[di+1]=d[si+1]*(1-ta)+tc[1]*ta;buf[di+2]=d[si+2]*(1-ta)+tc[2]*ta;}else{buf[di]=d[si];buf[di+1]=d[si+1];buf[di+2]=d[si+2];}buf[di+3]=255;}}
  return buf;});
 const fr={px,x0,y0,w,h,full:new Map(),small:new Map()};frameCache.set(key,fr);if(frameCache.size>FRAME_LIMIT)frameCache.delete(frameCache.keys().next().value);return fr;}
function canvasOf(px,w,h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').putImageData(new ImageData(px,w,h),0,0);return cv;}
/** Vollbild (UI, starker Zoom): Kopie umfärben. */
function full(fr,m,tk){let cv=fr.full.get(tk);if(cv)return cv;cv=canvasOf(recolor(new Uint8ClampedArray(fr.px),m),fr.w,fr.h);fr.full.set(tk,cv);if(fr.full.size>2)fr.full.delete(fr.full.keys().next().value);return cv;}
/** Weltgröße wie paperdoll-art.js: Flächenmittel → nächste Palettenfarbe → Umfärben → Kontur. */
function small(fr,k,m,tk){const key=k.toFixed(2)+'|'+tk;let cv=fr.small.get(key);if(cv)return cv;const {px,w:W,h:H}=fr,w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k)),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0,n=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4,al=px[i+3]/255;r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;a+=al;n++;}
  if(!n||a/n<.42)continue;const c=snap(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 recolor(o,m);const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
  if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;
 cv=canvasOf(o,w,h);fr.small.set(key,cv);if(fr.small.size>3)fr.small.delete(fr.small.keys().next().value);return cv;}

// ---------- Zeichnen (Vertrag wie drawMount: Fußpunkt x/y, magnify 1 = Weltgröße, Reiter 26 E) ----------
const NO_TINT=new Map();
/** Welteinheiten je Bogenpixel ohne Reiter: mittlere Archetypgröße. */
function meanScale(){const cat=paperdoll.catalog,hs=Object.values(cat.archetypes).map(a=>a.height);return cat.worldHeight/(hs.reduce((a,b)=>a+b,0)/hs.length);}
/** Archetyp des Reiters: Aussehen (look) vor Klasse, wie drawMount. */
const archOf=p=>paperdollArch(p.look)||paperdollArch(p.classId);
/** Wartet, bis Reittier (und Reiter) zeichenbar sind; false bei fehlenden Bögen. */
export async function whenPaperdollMount(p={},rider=true){await loadPaperdoll();if(!paperdoll.ready||!p.mount)return false;const arch=rider?archOf(p):null;if(rider&&!arch)return false;return loadPaperdollMount(p.mount,arch);}
/** Bereitmachen: false (und Nachladen anstoßen), solange Puppe, Katalog oder Seiten fehlen. */
function prepare(p,rider){if(!paperdoll.ready){loadPaperdoll();return null;}if(!p.mount)return null;const art=mountArtOf(p.mount),id=art.id;
 const arch=rider?archOf(p):null;if(rider&&!arch)return null;
 if(!ride.catalog||!drawable(id,arch)){loadPaperdollMount(id,arch);return null;}if(!ride.catalog.mounts[id]||(arch&&!ride.mounts.get(id).riders[arch]))return null;
 const tint=rider?p.tint||null:null,srcs=rider?rideSourceSet(p.visualEquipment||[],tint):new Set(),dir=directionOf(p);
 return {id,arch,dir,tint,srcs,M:ride.mounts.get(id),mt:art.tint};}
function paint(c,s,fr,u,x,y,magnify,shadow=true){const cat=ride.catalog,dev=u*contextScale(c),k=Math.min(1,Math.round(dev*50)/50),m=s.arch?recolorMap(s.arch,s.tint):NO_TINT,tk=(s.tint?.skin||'')+'.'+(s.tint?.hair||'');
 const bmp=k<.82?small(fr,k,m,tk):full(fr,m,tk),sh=s.M.shadow[s.arch||'@'][s.dir];
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 if(shadow){c.fillStyle='#182b2948';c.beginPath();c.ellipse((sh.cx+.5-cat.pivot.x)*u,.6*magnify,sh.rx*u,sh.rx*u*.26,0,0,Math.PI*2);c.fill();}
 c.drawImage(bmp,0,0,bmp.width,bmp.height,(fr.x0-cat.pivot.x)*u,(fr.y0-cat.pivot.y)*u,fr.w*u,fr.h*u);c.restore();}
/** Reittier mit (rider) oder ohne Reiter an Fußpunkt x/y zeichnen; Bild nach Wegstrecke. */
export function drawPaperdollMount(c,x,y,p={},time=0,magnify=1,rider=true){const s=prepare(p,rider);if(!s)return false;
 const fr=composed(s.id,s.arch,s.dir,rideFrameIndex(p,time),s.srcs,s.mt),u=(s.arch?unitScale(s.arch):meanScale())*magnify;paint(c,s,fr,u,x,y,magnify);return true;}
/** In ein Rechteck einpassen (Vorschau, Symbol): unten bündig, waagrecht mittig; scale ≤ max (Bogenpixel → Leinwandpixel). */
export function drawPaperdollMountFit(c,box,p={},time=0,rider=true,max=1){const s=prepare(p,rider);if(!s)return false;
 const fr=composed(s.id,s.arch,s.dir,rideFrameIndex(p,time),s.srcs,s.mt),u=Math.min(max,box.w/fr.w,box.h/fr.h),cat=ride.catalog;
 paint(c,s,fr,u,box.x+box.w/2-(fr.x0+fr.w/2-cat.pivot.x)*u,box.y+box.h-(fr.y0+fr.h-cat.pivot.y)*u,u/((s.arch?unitScale(s.arch):meanScale())),false);return true;}
/** Aktionsleisten-/Sammlungssymbol; malt nach dem Nachladen selbst nach. */
export function paintPaperdollMountIcon(cv,id){const c=cv.getContext('2d'),box={x:cv.width*.04,y:cv.height*.08,w:cv.width*.92,h:cv.height*.84},p={mount:id,direction:'se'};
 cv.paperdollMount=id;c.clearRect(0,0,cv.width,cv.height);if(drawPaperdollMountFit(c,box,p,0,false))return true;
 if(id&&!ride.failed)Promise.all([loadPaperdoll(),loadPaperdollMount(id)]).then(([,ok])=>{if(ok&&paperdoll.ready&&cv.paperdollMount===id){c.clearRect(0,0,cv.width,cv.height);drawPaperdollMountFit(c,box,p,0,false);}});
 return false;}
