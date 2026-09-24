// Minikarte rechts oben (Vorbild WoW): runder Messingring oder eckiger Rahmen, Zoom über Knöpfe und Mausrad, Symbolgruppen
// zum Ein-/Ausschalten (Lupe), Optionen (Form, Größe, Drehen, Uhr) und Mouse-Over-Tooltips für jedes Symbol.
// Leistung (E-46–E-50): Die Grundkarte (Flächen, Wasser, Wege, Häuser, Bäume) liegt in einem Zwischenspeicher je Zoomstufe
// und Größe, etwas größer als der Ausschnitt; je Bild wird er nur kopiert, darüber liegen die Symbole. Keine Blend-Modi.
// Einstellungen je Browser in localStorage (`mertloch-minimap-v1`). Kiosk und Verlies zeichnet weiter renderer.map.
import {MINIMAP as M,MINIMAP_GROUPS as GROUPS,MINIMAP_UI as T,PROFESSIONS,PROFESSION_SOURCES as SRC,PROFESSION_STATIONS as PST,MOUNT_UI,SHOP_UI,DUNGEONS,DUNGEON_TEXT} from './content/index.js';
import {hotspotMapMarks} from './hotspots.js';
import {chapterAreas} from './quest-mobs.js';
import {professionWorld} from './profession-world.js';
import {nodeStatus} from './professions.js';
import {mountStation} from './mounts.js';
import {inKiosk} from './kiosk-instance.js';
import {inDungeon,dungeonEntrance} from './dungeon.js';
import {isElite} from './enemy-ui.js';
import {SCALE} from './world.js';
import {mapIcon,paintMapIcon,MAP_OUTLINE} from './map-symbols.js';

export const MINIMAP_KEY='mertloch-minimap-v1';
const DPR=2,TAU=Math.PI*2;
const esc=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

// ------------------------------------------------------------------ Einstellungen (rein, testbar)
export function readMinimapSettings(raw){
 const r=raw&&typeof raw==='object'?raw:{},track={};for(const g of GROUPS)track[g]=r.track?.[g]!==false;
 return{zoom:Number.isInteger(r.zoom)&&r.zoom>=0&&r.zoom<M.zoomSpans.length?r.zoom:M.defaultZoom,shape:r.shape==='square'?'square':'round',
  size:Object.hasOwn(M.sizes,r.size)?r.size:'m',rotate:r.rotate===true,clock:r.clock!==false,track};
}
function loadSettings(){try{return readMinimapSettings(JSON.parse(localStorage.getItem(MINIMAP_KEY)||'null'));}catch{return readMinimapSettings(null);}}
function saveSettings(s){try{localStorage.setItem(MINIMAP_KEY,JSON.stringify(s));}catch{}}
/** Durchmesser der Karte (CSS-Pixel) aus Größe und Form. */
export const minimapDisc=s=>Math.round(M.sizes[s.size]*(s.shape==='square'?M.discSquare:M.disc));
/** Punkt am Kartenrand in Richtung (dx,dy) – für Ziele außerhalb. R = halber Durchmesser minus Rand. */
export function edgePoint(dx,dy,R,shape='round'){
 const len=Math.hypot(dx,dy)||1;if(shape==='round')return{x:dx/len*R,y:dy/len*R};
 const f=R/Math.max(Math.abs(dx),Math.abs(dy),.001);return{x:dx*f,y:dy*f};
}
export const insideDisc=(dx,dy,R,shape='round')=>shape==='round'?dx*dx+dy*dy<=R*R:Math.abs(dx)<=R&&Math.abs(dy)<=R;

// ------------------------------------------------------------------ Symbole (Runde 4a: gemeinsam mit der Weltkarte, map-symbols.js)
const OUT=MAP_OUTLINE;
const icon=key=>mapIcon(key,16);
/** Kleines Symbol in ein Menü-Canvas malen (Lupe, Legende). */
export const paintMinimapIcon=paintMapIcon;
const GROUP_ICON={quest:'quest',trade:'trade',trainer:'trainer-werkhof',places:'base',nodes:'node-herbs',people:'party',enemies:'camp',route:'waypoint'};

// ------------------------------------------------------------------ Grundkarte (Zwischenspeicher)
const boxes=new WeakMap();
function worldBoxes(w){let b=boxes.get(w);if(b)return b;const box=pts=>{let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of pts){if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;if(p.y<minY)minY=p.y;if(p.y>maxY)maxY=p.y;}return{minX,minY,maxX,maxY};};
 b={areas:w.areas.map(a=>({a,...box(a.points)})),water:w.water.map(a=>({a,...box(a.points)})),roads:w.roads.filter(r=>!r.entrance).map(a=>({a,...box(a.points)}))};boxes.set(w,b);return b;}
const hit=(b,x0,y0,x1,y1)=>b.maxX>=x0&&b.minX<=x1&&b.maxY>=y0&&b.minY<=y1;
const AREA_FILL=a=>{const t=a.tags||{},use=t.landuse||t.natural||t.leisure;return use==='farmland'?'#8a8454':use==='residential'?'#7f9a5c':['forest','wood'].includes(use)?'#2f5534':['meadow','grass','park','village_green'].includes(use)?'#6f9150':'#6a8a4c';};
/** Dachfarbe je Gebäude wie auf der großen Karte (cartography.js drawRoof): Ziegel, Reet, Schiefer, Dunkelrot – fest aus der Id. */
const ROOFS=[['#a4523a','#c9714f','#7c3f2e'],['#c29a4e','#e0bd6e','#8f6f33'],['#5d6670','#7f8a94','#454c54'],['#8e4a36','#b0654a','#6a3526']];
const roofOf=b=>{const id=String(b.id??(b.minX+','+b.minY));let n=7;for(const ch of id)n=n*31+ch.charCodeAt(0)>>>0;return ROOFS[n%4];};
let stripe=null;
function farmPattern(c){if(stripe)return c.createPattern(stripe,'repeat');stripe=document.createElement('canvas');stripe.width=stripe.height=8;const s=stripe.getContext('2d');s.fillStyle='#b39a5a';s.fillRect(0,0,8,8);s.fillStyle='#8f7a3e';s.fillRect(0,0,8,1);s.fillRect(0,4,8,1);s.fillStyle='#c9b070';s.fillRect(0,2,8,1);s.fillRect(0,6,8,1);return c.createPattern(stripe,'repeat');}
function paintBase(cv,w,ox,oy,cs,zoom){
 const c=cv.getContext('2d'),W=cv.width,H=cv.height,x1=ox+W/cs,y1=oy+H/cs,B=worldBoxes(w),path=pts=>{c.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i],x=(p.x-ox)*cs,y=(p.y-oy)*cs;i?c.lineTo(x,y):c.moveTo(x,y);}};
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#58724b';c.fillRect(0,0,W,H);c.lineCap='round';c.lineJoin='round';
 for(const b of B.areas){if(!hit(b,ox,oy,x1,y1))continue;const fill=AREA_FILL(b.a);path(b.a.points);c.closePath();c.fillStyle=fill==='#8a8454'?farmPattern(c):fill;c.fill();c.strokeStyle='#2f40301f';c.lineWidth=1;c.stroke();}
 for(const b of B.water){if(!hit(b,ox-200,oy-200,x1+200,y1+200))continue;path(b.a.points);c.strokeStyle='#2f5c68';c.lineWidth=Math.max(3,14*cs)+2;c.stroke();c.strokeStyle='#72b3c0';c.lineWidth=Math.max(2,14*cs);c.stroke();}
 // Feine Körnung, an Weltkoordinaten verankert (springt beim Neuaufbau nicht).
 const step=Math.max(3,Math.round(7/cs*10)/10);for(let gx=Math.floor(ox/step);gx*step<x1;gx++)for(let gy=Math.floor(oy/step);gy*step<y1;gy++){const h=((gx*73856093)^(gy*19349663))>>>0;if(h%7>1)continue;c.fillStyle=h%7?'#ffffff0e':'#0000001a';c.fillRect(Math.round((gx*step-ox)*cs)+(h>>4)%4,Math.round((gy*step-oy)*cs)+(h>>8)%4,1.5,1.5);}
 const trees=zoom>=M.treesFromZoom;if(trees){c.fillStyle='#2b4735';for(const t of w.trees){if(t.x<ox-20||t.x>x1+20||t.y<oy-20||t.y>y1+20)continue;c.beginPath();c.arc((t.x-ox)*cs,(t.y-oy)*cs,Math.max(1.6,6*(t.size||1)*cs),0,TAU);c.fill();}}
 const roads=B.roads.filter(b=>hit(b,ox-60,oy-60,x1+60,y1+60)),main=r=>!['footway','path','track'].includes(r.tags?.highway);
 for(const pass of [0,1])for(const b of roads){const r=b.a,m=main(r),wid=Math.max(m?2.4:1.6,(r.width||10)*cs*.55);path(r.points);c.strokeStyle=pass?(m?'#e6d6a6':'#b9a97a'):'#3b3a2b';c.lineWidth=wid+(pass?0:2.2);c.stroke();}
 for(const b of w.buildings){if(b.maxX<ox||b.minX>x1||b.maxY<oy||b.minY>y1)continue;c.save();c.translate(1,1.4);path(b.points);c.closePath();c.fillStyle='#1f2a2066';c.fill();c.restore();path(b.points);c.closePath();const roof=roofOf(b);c.fillStyle=b.church?'#dcb970':roof[0];c.fill();c.strokeStyle=b.church?'#f4dc9c':roof[1];c.lineWidth=1;c.stroke();const bw=(b.maxX-b.minX)*cs,bh=(b.maxY-b.minY)*cs;if(bw>5&&bh>5){c.strokeStyle=b.church?'#b8944e':roof[2];c.beginPath();if(bw>=bh){const y=((b.minY+b.maxY)/2-oy)*cs;c.moveTo((b.minX-ox)*cs+1.5,y);c.lineTo((b.maxX-ox)*cs-1.5,y);}else{const x=((b.minX+b.maxX)/2-ox)*cs;c.moveTo(x,(b.minY-oy)*cs+1.5);c.lineTo(x,(b.maxY-oy)*cs-1.5);}c.stroke();}}
 const base=w.base;if(base?.minX!=null){c.fillStyle='#3b2a22';c.fillRect((base.minX-ox)*cs-1,(base.minY-oy)*cs-1,(base.maxX-base.minX)*cs+2,(base.maxY-base.minY)*cs+2);c.fillStyle='#9c6a44';c.fillRect((base.minX-ox)*cs,(base.minY-oy)*cs,(base.maxX-base.minX)*cs,(base.maxY-base.minY)*cs);}
}

// ------------------------------------------------------------------ Symbolliste (etwa jede Sekunde neu)
function questLine(m){return m.glyph==='?'?T.kinds.questReady:m.glyph==='low'?T.kinds.questLow:T.kinds.questGiver;}
function stationTeaches(id){return Object.values(PROFESSIONS).filter(p=>p.station===id).map(p=>p.name).join(', ');}
function collectPlaces(g){
 const w=g.world,list=[],track=(group,o)=>list.push({group,...o});
 if(g.hotspots)for(const m of hotspotMapMarks(g).givers)track('quest',{x:m.x,y:m.y,icon:m.glyph==='?'?'quest-ready':m.glyph==='low'?'quest-low':'quest',name:m.name,kind:questLine(m),detail:m.title!==m.name?m.title:'',prio:3});
 const kiosk=w.places?.kiosk;if(kiosk)track('trade',{...(kiosk.entrance||kiosk.approach||kiosk),icon:'trade',name:SHOP_UI.title,kind:T.kinds.trader,detail:SHOP_UI.mapDetail,prio:2});
 if(w.spawn&&w.findClear){const pw=professionWorld(w);for(const s of pw.stations)track('trainer',{x:s.x,y:s.y,icon:'trainer-'+(s.id==='werkhof'?'werkhof':'braugarten'),name:PST[s.id]?.name||s.id,kind:T.kinds.trainer,detail:T.teaches(stationTeaches(s.id)),prio:2});
  for(const n of pw.nodes){const d=SRC[n.kind];if(!d)continue;let spent=false;try{const s=nodeStatus(g,n);spent=s.spent||s.phase==='empty';}catch{}track('nodes',{x:n.x,y:n.y,icon:'node-'+n.kind+(spent?':dim':''),name:d.name,kind:T.nodeLine(PROFESSIONS[d.profession]?.name||'',d.required),detail:spent?T.nodeSpent:'',prio:1});}
  const st=mountStation(w);if(st)track('places',{x:st.x,y:st.y,icon:'stable',name:MOUNT_UI.station,kind:T.kinds.stable,detail:MOUNT_UI.title,prio:2});}
 if(w.base?.x!=null)track('places',{x:w.base.x,y:w.base.y,icon:'base',name:w.base.name||T.kinds.base,kind:T.kinds.base,prio:2});
 for(const h of w.hubs||[]){const n=(w.quests||[]).filter(q=>q.giver?.hubId===h.id&&!g.sideQuests?.[q.id]?.claimed).length;track('places',{x:h.x,y:h.y,icon:'hub',name:h.name.split(' · ')[0],kind:T.kinds.hub,detail:n?T.quests(n):'',prio:2});}
 try{const door=dungeonEntrance(g);const def=DUNGEONS['schloss-bigb'];if(door)track('places',{x:door.x,y:door.y,icon:'dungeon',name:DUNGEON_TEXT.entranceName,kind:T.kinds.dungeon,detail:def?T.levels(def.level.min,def.level.max):'',prio:2});}catch{}
 for(const camp of w.camps){const busy=g.enemies.some(e=>e.campId===camp.id&&e.hp>0),p=camp.approach||camp;track('enemies',{x:camp.x,y:camp.y,icon:busy?'camp':'camp-free',name:camp.title,kind:busy?T.kinds.campBusy:T.kinds.campFree,prio:1,approach:p});}
 // Wichtiges zuletzt zeichnen (liegt oben): Aufträge über Treffpunkten, Treffpunkte über Fundstellen.
 return list.sort((a,b)=>a.prio-b.prio);
}

// ------------------------------------------------------------------ Einbau
let api=null;
/** Aus renderer.map(canvas) für #minimap: bindet die Minikarte beim ersten Aufruf ein. false = Kiosk/Verlies (alter Zeichenweg). */
export function attachMinimap(renderer,canvas){
 if(!api){const root=canvas.closest('#miniButton');if(!root)return false;api=mountMinimap(root,canvas);}
 api.bind(renderer);const g=renderer.game;if(!g)return true;
 // Kiosk/Verlies: alter Innenraum-Zeichner auf ein Nebenbild, verkleinert in den Ring (rund würde er sonst an den Ecken abgeschnitten).
 if(inKiosk(g)||inDungeon(g)){api.indoor(true);const off=api.offscreen();renderer.map(off);api.paintIndoor(off);return true;}api.indoor(false);return true;
}

function svg(d){return '<svg viewBox="0 0 16 16" aria-hidden="true">'+d+'</svg>';}
const ICONS={
 plus:svg('<path d="M8 3.5v9M3.5 8h9"/>'),minus:svg('<path d="M3.5 8h9"/>'),
 track:svg('<circle cx="6.8" cy="6.8" r="3.8"/><path d="M9.6 9.6 13 13"/>'),
 gear:svg('<path d="M6.9 1.8h2.2l.4 1.8 1.3.6 1.6-1 1.5 1.5-1 1.6.6 1.3 1.8.4v2.2l-1.8.4-.6 1.3 1 1.6-1.5 1.5-1.6-1-1.3.6-.4 1.8H6.9l-.4-1.8-1.3-.6-1.6 1-1.5-1.5 1-1.6-.6-1.3-1.8-.4V6.9l1.8-.4.6-1.3-1-1.6 1.5-1.5 1.6 1 1.3-.6z"/><circle cx="8" cy="8" r="2"/>'),
 map:svg('<path d="M2.5 4 6 2.8l4 1.4 3.5-1.2v9L10 13.2l-4-1.4-3.5 1.2z"/><path d="M6 2.8v9M10 4.2v9"/>'),
 check:svg('<path d="m3.5 8.4 3 3 6-6.6"/>')
};

function mountMinimap(root,canvas){
 let s=loadSettings(),renderer=null,indoor=false,raf=0,last=0,base={key:'',cv:null,ox:0,oy:0,cs:1,cx:0,cy:0},places=[],areas=[],placesAt=0,hits=[],hover=null,tipFrom=null,menu=null,heading=-Math.PI/2,viewRot=0,lastPos=null,northDeg=null,clockAt=0,zoneAt=0,stats={frames:0,rebuilds:0,rebuildMs:0,drawMs:0};
 root.classList.add('mm');root.setAttribute('role','group');root.setAttribute('aria-label',T.label);
 // Aufbau: Ortsschild, Ring mit Karte, Knöpfe am Rand, Uhr unten, Menüs daneben. Die Karte selbst ist ein Knopf (öffnet die Weltkarte).
 const disc=document.createElement('button');disc.type='button';disc.className='mm-disc';disc.setAttribute('aria-label',T.openMap+' ('+T.openMapKey+')');canvas.replaceWith(disc);disc.append(canvas);
 root.querySelector('.north')?.remove();root.querySelector('.map-caption')?.remove();
 const plate=document.createElement('div');plate.className='mm-plate';plate.innerHTML='<span class="mm-zone"></span>';
 const ring=document.createElement('span');ring.className='mm-ring';ring.setAttribute('aria-hidden','true');
 const north=document.createElement('span');north.className='mm-north';north.setAttribute('aria-hidden','true');north.textContent=T.north;north.dataset.tip=T.northTip;
 const clock=document.createElement('span');clock.className='mm-clock';
 const knob=(cls,act,tip,html)=>{const b=document.createElement('button');b.type='button';b.className='mm-knob '+cls;b.dataset.mm=act;b.dataset.tip=tip;b.setAttribute('aria-label',tip);b.innerHTML=html;return b;};
 const kTrack=knob('mm-k-track','track',T.tracking,ICONS.track),kOpts=knob('mm-k-opts','options',T.options,ICONS.gear),kMap=knob('mm-k-map','map',T.openMap,ICONS.map),kIn=knob('mm-k-in','in',T.zoomIn,ICONS.plus),kOut=knob('mm-k-out','out',T.zoomOut,ICONS.minus);
 kMap.dataset.key=T.openMapKey;
 const body=document.createElement('div');body.className='mm-body';body.append(disc,ring,north,kTrack,kOpts,kMap,kIn,kOut,clock);
 root.replaceChildren(plate,body);
 const tip=document.createElement('aside');tip.className='item-tooltip mm-tip';tip.setAttribute('role','tooltip');tip.hidden=true;(root.closest('#gameShell')||document.body).append(tip);
 const zoneEl=plate.firstChild;

 function apply(){
  const D=minimapDisc(s);root.dataset.shape=s.shape;root.dataset.size=s.size;root.dataset.rotate=s.rotate?'1':'0';root.style.setProperty('--mm-size',M.sizes[s.size]+'px');root.style.setProperty('--mm-disc',D+'px');
  clock.hidden=!s.clock;if(canvas.width!==D*DPR){canvas.width=canvas.height=D*DPR;}kIn.disabled=s.zoom>=M.zoomSpans.length-1;kOut.disabled=s.zoom<=0;
  kIn.dataset.tip=T.zoomIn+' · '+T.zoomLevel(s.zoom+1);kOut.dataset.tip=T.zoomOut+' · '+T.zoomLevel(s.zoom+1);last=0;if(tipFrom&&!tip.hidden)knobTip(tipFrom);
  // Unterkante für Nachbarn (Auftragsverfolgung darunter): --minimap-bottom am Spielfeld.
  requestAnimationFrame(publishBottom);
 }
 let bottom=null;function publishBottom(){const shell=root.closest('#gameShell');if(!shell||!root.offsetParent)return;const v=Math.round(root.getBoundingClientRect().bottom-shell.getBoundingClientRect().top)+'px';if(v!==bottom){bottom=v;shell.style.setProperty('--minimap-bottom',v);}}
 const change=fn=>{fn(s);s=readMinimapSettings(s);saveSettings(s);apply();if(menu)renderMenu(menu);};
 const zoomBy=d=>change(x=>{x.zoom=Math.max(0,Math.min(M.zoomSpans.length-1,x.zoom+d));});

 // ---------------- Menüs (Lupe, Zahnrad)
 const panel=document.createElement('div');panel.className='mm-menu';panel.hidden=true;panel.setAttribute('role','menu');root.append(panel);
 function renderMenu(kind){
  if(kind==='track'){panel.innerHTML='<strong>'+esc(T.tracking)+'</strong>'+GROUPS.map(g=>'<button type="button" role="menuitemcheckbox" data-mm-track="'+g+'" aria-checked="'+s.track[g]+'"><canvas width="32" height="32" data-mm-icon="'+GROUP_ICON[g]+'"></canvas><span>'+esc(T.groups[g])+'</span><i>'+(s.track[g]?ICONS.check:'')+'</i></button>').join('');panel.querySelectorAll('[data-mm-icon]').forEach(cv=>paintMinimapIcon(cv,cv.dataset.mmIcon));}
  else{const seg=(key,vals,label)=>'<div class="mm-seg" role="group" aria-label="'+esc(label)+'"><span>'+esc(label)+'</span><div>'+vals.map(([v,t])=>'<button type="button" data-mm-set="'+key+'" data-mm-val="'+v+'" aria-pressed="'+(s[key]===v)+'">'+esc(t)+'</button>').join('')+'</div></div>';
   const tog=(key,label)=>'<button type="button" role="menuitemcheckbox" data-mm-toggle="'+key+'" aria-checked="'+s[key]+'"><span>'+esc(label)+'</span><i>'+(s[key]?ICONS.check:'')+'</i></button>';
   panel.innerHTML='<strong>'+esc(T.options)+'</strong>'+seg('shape',[['round',T.round],['square',T.square]],T.shape)+seg('size',Object.keys(M.sizes).map(k=>[k,T.sizes[k]]),T.size)+tog('rotate',T.rotate)+tog('clock',T.clock)+'<button type="button" class="mm-reset" data-mm-reset>'+esc(T.reset)+'</button>';}
  panel.dataset.kind=kind;
 }
 function openMenu(kind){if(menu===kind){closeMenu();return;}menu=kind;renderMenu(kind);panel.hidden=false;hideTip();kTrack.setAttribute('aria-expanded',kind==='track');kOpts.setAttribute('aria-expanded',kind==='options');}
 function closeMenu(){menu=null;panel.hidden=true;kTrack.setAttribute('aria-expanded','false');kOpts.setAttribute('aria-expanded','false');}
 panel.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;
  if(b.dataset.mmTrack)change(x=>{x.track[b.dataset.mmTrack]=!x.track[b.dataset.mmTrack];});
  else if(b.dataset.mmSet)change(x=>{x[b.dataset.mmSet]=b.dataset.mmVal;});
  else if(b.dataset.mmToggle)change(x=>{x[b.dataset.mmToggle]=!x[b.dataset.mmToggle];});
  else if('mmReset' in b.dataset)change(x=>{Object.assign(x,readMinimapSettings(null));});});
 document.addEventListener('pointerdown',e=>{if(menu&&!root.contains(e.target))closeMenu();},true);
 document.addEventListener('keydown',e=>{if(menu&&e.key==='Escape'){closeMenu();}},true);
 // Knöpfe nehmen dem Spiel den Fokus nicht weg (Leertaste würde sonst den Knopf drücken) und öffnen die Weltkarte nicht.
 root.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault();});
 body.addEventListener('click',e=>{const b=e.target.closest('.mm-knob');if(!b||b.dataset.mm==='map')return;e.stopPropagation();const a=b.dataset.mm;if(a==='in')zoomBy(1);else if(a==='out')zoomBy(-1);else openMenu(a==='track'?'track':'options');});
 root.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();zoomBy(e.deltaY<0?1:-1);},{passive:false});
 // Umschalt + Klick auf die Karte: hinlaufen (wie Klick auf die Welt). Normaler Klick öffnet weiter die Weltkarte (app.js).
 disc.addEventListener('click',e=>{if(!e.shiftKey)return;const g=renderer?.game,p=toWorld(e);if(!g||!p)return;e.stopPropagation();g.navigate?.(p);});

 // ---------------- Tooltips
 function showTip(html,x,y){tip.innerHTML=html;tip.hidden=false;const w=tip.offsetWidth,h=tip.offsetHeight;let left=x-w-14,top=y+14;if(left<8)left=x+16;if(top+h>innerHeight-8)top=y-h-10;tip.style.left=Math.round(left)+'px';tip.style.top=Math.round(Math.max(8,top))+'px';}
 function hideTip(){tip.hidden=true;hover=null;tipFrom=null;}
 function knobTip(t){tipFrom=t;const r=t.getBoundingClientRect();showTip('<strong>'+esc(t.dataset.tip)+'</strong>'+(t.dataset.key?' <kbd>'+esc(t.dataset.key)+'</kbd>':''),r.left,r.bottom-4);}
 root.addEventListener('pointerover',e=>{const t=e.target.closest('[data-tip]');if(!t||menu)return;knobTip(t);});
 root.addEventListener('pointerout',e=>{if(e.target.closest('[data-tip]')&&!e.relatedTarget?.closest?.('[data-tip]')){tip.hidden=true;tipFrom=null;}});
 const local=e=>{const r=canvas.getBoundingClientRect(),D=minimapDisc(s);return{x:(e.clientX-r.left)*D/r.width,y:(e.clientY-r.top)*D/r.height};};
 function toWorld(e){const g=renderer?.game;if(!g)return null;const D=minimapDisc(s),k=D/M.zoomSpans[s.zoom],q=local(e),dx=q.x-D/2,dy=q.y-D/2,cos=Math.cos(-viewRot),sin=Math.sin(-viewRot);return{x:g.player.x+(dx*cos-dy*sin)/k,y:g.player.y+(dx*sin+dy*cos)/k};}
 function hoverAt(clientX,clientY){
  const r=canvas.getBoundingClientRect(),D=minimapDisc(s),q={x:(clientX-r.left)*D/r.width,y:(clientY-r.top)*D/r.height};
  const found=hits.filter(h=>Math.hypot(h.x-q.x,h.y-q.y)<=M.hitRadius+h.r).sort((a,b)=>b.prio-a.prio||Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y));
  const seen=new Set(),list=found.filter(h=>{const k=h.name+'|'+h.kind;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,8);
  if(!list.length){tip.hidden=true;return;}
  const one=list.length===1;showTip(list.map(h=>'<div class="mm-tip-row"><b>'+esc(h.name)+'</b><small>'+esc(h.kind)+'</small>'+(one&&h.detail?'<em>'+esc(h.detail)+'</em>':'')+'</div>').join(''),clientX,clientY);
 }
 disc.addEventListener('pointermove',e=>{if(menu)return;hover={x:e.clientX,y:e.clientY};hoverAt(e.clientX,e.clientY);});
 disc.addEventListener('pointerleave',()=>hideTip());

 // ---------------- Zeichnen
 function ensureBase(w,p,span,D){
  const cs=D/span*DPR,L=span*M.cacheSpan,key=(w.id||w.seed)+'|'+s.zoom+'|'+D,margin=span*(s.shape==='square'?.75:.6);
  if(base.key===key&&Math.abs(p.x-base.cx)<L/2-margin&&Math.abs(p.y-base.cy)<L/2-margin)return base;
  const t=performance.now(),px=Math.ceil(L*cs);base.cv||=document.createElement('canvas');if(base.cv.width!==px){base.cv.width=base.cv.height=px;}
  base.key=key;base.cx=p.x;base.cy=p.y;base.ox=p.x-L/2;base.oy=p.y-L/2;base.cs=cs;paintBase(base.cv,w,base.ox,base.oy,cs,s.zoom);
  stats.rebuilds++;stats.rebuildMs=Math.round((performance.now()-t)*10)/10;return base;
 }
 function draw(now){
  const g=renderer.game,w=g?.world,p=g?.player;if(!w||!p)return;const t0=performance.now();
  const D=minimapDisc(s),R=D/2,span=M.zoomSpans[s.zoom],k=D/span,c=canvas.getContext('2d');
  // Blickrichtung aus der Bewegung (die Figur kennt nur links/rechts).
  if(lastPos){const dx=p.x-lastPos.x,dy=p.y-lastPos.y;if(dx*dx+dy*dy>.25&&dx*dx+dy*dy<4e4)heading=Math.atan2(dy,dx);}lastPos={x:p.x,y:p.y};
  const goal=s.rotate?-(heading+Math.PI/2):0;let diff=((goal-viewRot+Math.PI)%TAU+TAU)%TAU-Math.PI;viewRot+=Math.abs(diff)<.002?diff:diff*M.turnEase;
  const cos=Math.cos(viewRot),sin=Math.sin(viewRot),proj=o=>{const dx=(o.x-p.x)*k,dy=(o.y-p.y)*k;return{x:R+dx*cos-dy*sin,y:R+dx*sin+dy*cos};};
  const b=ensureBase(w,p,span,D);
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.save();
  if(s.shape==='round'){c.beginPath();c.arc(R*DPR,R*DPR,R*DPR,0,TAU);c.clip();}
  c.translate(R*DPR,R*DPR);c.rotate(viewRot);c.imageSmoothingEnabled=true;c.drawImage(b.cv,(b.ox-p.x)*b.cs,(b.oy-p.y)*b.cs);c.restore();
  c.setTransform(DPR,0,0,DPR,0,0);c.save();if(s.shape==='round'){c.beginPath();c.arc(R,R,R,0,TAU);c.clip();}
  hits=[];const pad=5,inside=a=>insideDisc(a.x-R,a.y-R,R-pad,s.shape),iz=16*M.iconScale[s.zoom]*(s.size==='s'?.86:1),put=(key,a,info,r=5)=>{const cv=icon(key),z=key.startsWith('node-')?iz*.85:iz;c.drawImage(cv,Math.round(a.x*2)/2-z/2,Math.round(a.y*2)/2-z/2,z,z);if(info)hits.push({x:a.x,y:a.y,r,...info});};
  const edge=(o,m=9)=>{const a=proj(o);if(inside(a))return{a,off:false};const e=edgePoint(a.x-R,a.y-R,R-m,s.shape);return{a:{x:R+e.x,y:R+e.y},off:true,dir:Math.atan2(a.y-R,a.x-R)};};
  // Auftragsgebiete und Laufweg liegen unter den Symbolen.
  if(now-placesAt>1000||!places.length){places=collectPlaces(g);areas=[...(g.hotspots?hotspotMapMarks(g).areas.filter(a=>a.active):[]),/* Zielgebiet des Kapitelziels (Runde 3a) */...chapterAreas(g).map(a=>({...a,active:true,title:a.label}))];placesAt=now;}
  if(s.track.quest)for(const ar of areas){const a=proj(ar),r=Math.max(6,ar.r*k);if(Math.hypot(a.x-R,a.y-R)-r>R)continue;c.beginPath();c.arc(a.x,a.y,r,0,TAU);c.fillStyle='#f1cd7733';c.fill();c.strokeStyle='#f1cd77d0';c.lineWidth=1.4;c.stroke();hits.push({x:a.x,y:a.y,r:Math.max(0,r-M.hitRadius),name:ar.title||ar.label,kind:T.kinds.area,detail:ar.label,prio:0,group:'quest'});}
  const destination=g.destination?.(),dest=g.moveTo||destination?.point;
  if(s.track.route&&dest){const route=g.path?.length?g.path:[dest];c.beginPath();const a0=proj(p);c.moveTo(a0.x,a0.y);for(const q of route){const a=proj(q);c.lineTo(a.x,a.y);}c.lineJoin='round';c.lineCap='round';c.strokeStyle='#1d252bcc';c.lineWidth=3.6;c.stroke();c.setLineDash([4,3]);c.strokeStyle='#f1cd77';c.lineWidth=1.8;c.stroke();c.setLineDash([]);}
  const range2=(span*.75)**2;
  for(const o of places){if(!s.track[o.group])continue;const dx=o.x-p.x,dy=o.y-p.y;if(dx*dx+dy*dy>range2)continue;const a=proj(o);if(!inside(a))continue;put(o.icon,a,{name:o.name,kind:o.kind,detail:o.detail,prio:o.prio,group:o.group});}
  if(s.track.enemies){const rr=M.creatureRange**2;for(const e of g.enemies){if(e.hp<=0||e.worldBoss)continue;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy>rr&&e!==g.target)continue;const a=proj(e);if(!inside(a))continue;const elite=isElite(e),neutral=e.behavior==='neutral'&&!e.aggro;if(neutral&&!elite&&e!==g.target&&dx*dx+dy*dy>M.neutralRange**2)continue;if(e===g.target){c.beginPath();c.arc(a.x,a.y,5.6,0,TAU);c.strokeStyle='#fff1bb';c.lineWidth=1.4;c.stroke();}put(elite?'elite':neutral?'neutral':'enemy',a,{name:e.name,kind:(elite?T.kinds.elite:T.kinds.enemy)+(e.level?' · '+T.level(e.level):''),prio:1,group:'enemies'},3);}}
  if(s.track.people){for(const o of g.others||[]){if((o.floor||0)!==(p.floor||0)&&o.floor!=null&&p.floor!=null)continue;const party=!!o.party,m=party?edge(o):{a:proj(o),off:false};if(!party&&!inside(m.a))continue;put(party?'party':'player',m.a,{name:o.name,kind:(party?T.kinds.party:T.kinds.player)+(o.level?' · '+T.level(o.level):''),prio:2,group:'people'},4);}
   for(const cp of g.companions||[]){if(!cp.view?.name)continue;const a=proj(cp);if(inside(a))put('companion',a,{name:cp.view.name,kind:T.kinds.companion,prio:1,group:'people'},3);}}
  // Weltbosse immer, außerhalb am Rand.
  for(const e of g.enemies){if(!e.worldBoss||e.hp<=0)continue;const m=edge(e,10);put('boss',m.a,{name:e.name,kind:T.kinds.boss,prio:3},6);}
  // Ziel: Raute auf der Karte, außerhalb ein Pfeil am Rand (wie das Auftragsziel in WoW). Eigene Wegmarke: Kreuz.
  const goalMark=(pt,info,key)=>{const m=edge(pt,8);
   if(m.off){c.save();c.translate(m.a.x,m.a.y);c.rotate(m.dir);c.beginPath();c.moveTo(6.5,0);c.lineTo(-4,-5);c.lineTo(-1.6,0);c.lineTo(-4,5);c.closePath();c.fillStyle=key==='dest'?'#f3c44e':'#fff0c4';c.strokeStyle=OUT;c.lineWidth=1.6;c.lineJoin='round';c.stroke();c.fill();c.restore();hits.push({x:m.a.x,y:m.a.y,r:5,...info});}
   else{if(key==='dest'){const pulse=(now%1400)/1400;c.beginPath();c.arc(m.a.x,m.a.y,4+pulse*7,0,TAU);c.strokeStyle='rgba(243,196,78,'+(1-pulse).toFixed(2)+')';c.lineWidth=1.4;c.stroke();}put(key,m.a,info,6);}};
  const dp=destination?.point,own=g.moveTo&&(!dp||Math.hypot(g.moveTo.x-dp.x,g.moveTo.y-dp.y)>30);
  if(dp)goalMark(dp,{name:destination.label||dp.name||T.kinds.destination,kind:T.kinds.destination,prio:4},'dest');
  if(own)goalMark(g.moveTo,{name:T.kinds.waypoint,kind:T.walkHint,prio:4},'waypoint');
  // Held in der Mitte: Pfeil in Laufrichtung (beim Drehen zeigt er nach oben).
  c.save();c.translate(R,R);c.rotate(heading+viewRot+Math.PI/2);c.beginPath();c.moveTo(0,-7);c.lineTo(5,5.4);c.lineTo(0,2.8);c.lineTo(-5,5.4);c.closePath();c.fillStyle=OUT;c.lineWidth=2.6;c.strokeStyle=OUT;c.lineJoin='round';c.stroke();c.fillStyle='#fff3cf';c.fill();c.beginPath();c.moveTo(0,-7);c.lineTo(0,2.8);c.lineTo(5,5.4);c.closePath();c.fillStyle='#e9b84a';c.fill();c.restore();
  // Maßstab unten links (nur eckig; rund liegt dort der Ring).
  if(s.shape==='square'){const m=M.scaleMeters[s.zoom],len=m*SCALE*k;const x0=R-len/2;c.fillStyle='#1d252bb0';c.fillRect(x0-5,D-14,len+10,11);c.fillStyle='#e6d6a6';c.fillRect(x0,D-6,len,1.2);c.font='600 7px Nunito,system-ui,sans-serif';c.textAlign='center';c.fillText(m+' m',R,D-8);}
  c.restore();
  // Norden am Ring
  const nd=Math.round(viewRot*180/Math.PI*2)/2;if(nd!==northDeg){northDeg=nd;north.style.setProperty('--mm-north',nd+'deg');}
  chrome(now);
  if(hover&&!tip.hidden)hoverAt(hover.x,hover.y);
  stats.frames++;stats.drawMs=Math.round((performance.now()-t0)*100)/100;
 }
 // Ortsschild, Uhr und Unterkante laufen auch im Kiosk/Verlies weiter.
 function chrome(now){if(now-clockAt>5000&&s.clock){clockAt=now;const d=new Date();clock.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  if(now-zoneAt>500){zoneAt=now;const z=document.querySelector('#zoneName')?.textContent||'';if(zoneEl.textContent!==z)zoneEl.textContent=z;publishBottom();}}
 function loop(now){raf=requestAnimationFrame(loop);if(now-last<M.frameMs||!renderer||document.hidden||!root.offsetParent)return;if(indoor){chrome(now);return;}last=now;try{draw(now);}catch(e){console.error('Minikarte',e);cancelAnimationFrame(raf);}}
 apply();raf=requestAnimationFrame(loop);
 let spare=null;
 const self={offscreen:()=>{spare||=document.createElement('canvas');if(spare.width!==canvas.width){spare.width=spare.height=canvas.width;}return spare;},
  paintIndoor:off=>{const c=canvas.getContext('2d'),W=canvas.width,f=s.shape==='round'?.8:1,w=W*f;c.setTransform(1,0,0,1,0,0);c.fillStyle='#1d2a22';c.fillRect(0,0,W,W);c.imageSmoothingEnabled=true;c.drawImage(off,(W-w)/2,(W-w)/2,w,w);},
  bind:r=>{if(renderer!==r){renderer=r;base.key='';places=[];}},indoor:v=>{if(indoor!==v){indoor=v;if(v)hits=[];}},settings:()=>({...s,track:{...s.track}}),stats:()=>({...stats,hits:hits.length,disc:minimapDisc(s)}),hits:()=>hits.map(h=>({...h})),set:patch=>change(x=>Object.assign(x,patch)),close:closeMenu};
 root.minimap=self;return self;
}
