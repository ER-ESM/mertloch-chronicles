// Weltkarte (M), Runde 4a (2026-09-24, Zielbild 1 des Grafikberichts R4, Vorbild WoW-Weltkarte):
// - eine Symbolsprache mit der Minikarte (map-symbols.js), keine Ziffern/Buchstaben, keine Legende, keine Dauerschilder in Sätzen;
// - POI-Tooltip beim Überfahren (Name, Art, Stufe/Auftrag, Entfernung), Hervorhebung, Bündel für Marker näher als 24 px;
// - Werkzeuge als Symbolknöpfe in der Titelzeile, Filter als kombinierbare Häkchenliste (wie die Lupe der Minikarte);
// - Seitenleiste mit Gruppentrennern und einzeiligen Einträgen, Stiefel = hinlaufen (schließt die Karte, Runde 3a);
// - am Handy: Karte füllt das Fenster, die Ortsliste klappt über ein Symbol auf, Tippen zeigt den Tooltip mit Stiefel.
import {MINIMAP_UI as MT,WORLD_MAP_UI as T} from './content/index.js';
import {mapPlaces,mapView,levelTone} from './cartography.js';
import {distance,SCALE} from './world.js';
import {glyph} from './ui-glyphs.js';
import {paintMapIcon} from './map-symbols.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORE='mertloch-weltkarte-v1',MAX_ZOOM=6;
const tool=(attr,icon,label,note,extra='')=>`<button type="button" class="ql-tool wk-tool" ${attr} aria-label="${esc(label)}" data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"${extra}>${glyph(icon)}</button>`;
export function atlasPanel(){return `<span hidden data-ui-window-title="${esc(T.title)}"></span><div class="wk" data-wk>`
 +`<div class="wk-tools" role="toolbar" aria-label="${esc(T.filter)}">${tool('data-wk-filter','funnel',T.filter,T.filterNote,' aria-haspopup="menu" aria-expanded="false"')}${tool('data-zoom="player"','crosshair',T.toMe,T.toMeNote)}${tool('data-zoom="fit"','frame',T.overview,T.overviewNote)}${tool('data-wk-side','list',T.list,T.listNote,' aria-expanded="false"')}</div>`
 +`<div class="wk-filter" role="menu" aria-label="${esc(T.filter)}" hidden></div>`
 +`<div class="wk-body"><div class="atlas-paper wk-paper"><canvas id="largeMap" width="780" height="580" aria-label="Weltkarte. Orte auch in der Liste auswählbar."></canvas>`
 +`<div class="wk-zoom">${tool('data-zoom="in"','plus',T.zoomIn,'')}${tool('data-zoom="out"','minus',T.zoomOut,'')}</div>`
 +/* ODbL: Nennung sichtbar auf der Karte; am Handy ohne Link (kein Tipp-Ziel unter 44 px) */(document.body?.classList.contains('touch-mode')?`<span class="wk-osm">${esc(T.osm)}</span>`:`<a class="wk-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" data-tooltip-label="${esc(T.osm)}" data-tooltip-note="${esc(T.osmNote)}">${esc(T.osm)}</a>`)+`</div>`
 +`<aside class="atlas-sidebar wk-side" aria-label="${esc(T.list)}"><div id="atlasPlaces" class="wk-list"></div><nav class="wk-pager" hidden><button type="button" class="ql-tool wk-tool" data-wk-page="-1" aria-label="Zurück">${glyph('back')}</button><span></span><button type="button" class="ql-tool wk-tool" data-wk-page="1" aria-label="Weiter">${glyph('next')}</button></nav></aside></div></div>`;}
function loadShow(){const base=Object.fromEntries(T.groups.map(x=>[x.id,x.on]));try{const raw=JSON.parse(localStorage.getItem(STORE)||'null');if(raw?.show)for(const k of Object.keys(base))if(typeof raw.show[k]==='boolean')base[k]=raw.show[k];}catch{}return base;}
function saveShow(show){try{localStorage.setItem(STORE,JSON.stringify({show}));}catch{}}
/** Art-Zeile eines Orts im Tooltip (dieselben Wörter wie auf der Minikarte). */
function kindLine(h,level){
 if(h.group==='quest')return esc(h.ready?MT.kinds.questReady:h.low?MT.kinds.questLow:MT.kinds.questGiver);
 if(h.group==='hub')return esc(MT.kinds.hub+(h.quests?' · '+MT.quests(h.quests):''));
 if(h.group==='camp'){const lv=h.level;let s=esc(h.busy?MT.kinds.campBusy:MT.kinds.campFree);if(lv){const txt=lv.min===lv.max?MT.level(lv.min):MT.levels(lv.min,lv.max);s+=' · <span style="color:'+levelTone(Math.round((lv.min+lv.max)/2)-level)+'">'+esc(txt)+'</span>';}return s;}
 if(h.group==='trainer')return esc(MT.kinds.trainer);
 if(h.icon==='stable')return esc(MT.kinds.stable);
 if(h.kind==='tracked')return esc(T.tracked);
 if(h.kind==='target')return esc(MT.kinds.destination);
 return esc(MT.kinds.trader);
}
const detailOf=h=>h.group==='quest'?h.quest:h.group==='camp'?'':h.group==='hub'?'':h.detail||'';
export function mountAtlas(root,renderer,navigate,initial=null){
 const g=renderer.game,canvas=root.querySelector('#largeMap'),paper=root.querySelector('.wk-paper'),list=root.querySelector('#atlasPlaces'),menu=root.querySelector('.wk-filter'),popup=root.closest('.game-popup'),touch=()=>document.body.classList.contains('touch-mode');
 const places=mapPlaces(g),options={show:loadShow(),zoom:1,openedAt:performance.now()};
 // Das verfolgte Ziel steht hervorgehoben oben in der Liste (Runde 2); auf der Karte ist es die Stecknadel.
 const dest=g.destination?.();if(dest?.point)places.unshift({id:'quest-destination',kind:'tracked',group:'tracked',icon:'dest',tracked:true,title:dest.label||MT.kinds.destination,detail:'',point:dest.point,route:dest.route});
 let chosen=null;
 // Ziel von außen (Aufträge „auf der Karte“, Kiosk): bekannter Ort → dieser; sonst eine eigene Zeile oben.
 const adopt=t=>{if(!t)return null;if(t.id==='quest-destination')return places[0]?.tracked?places[0]:null;const known=places.find(h=>h.id===t.id)||places.find(h=>Math.hypot(h.point.x-t.point.x,h.point.y-t.point.y)<30);if(known)return known;const row={...t,kind:'target',group:'target',icon:'waypoint'};places.splice(places[0]?.tracked?1:0,0,row);return row;};
 // Werkzeuge in die Titelzeile (neben die Tastenkappe), wie bei Talenten und Aufträgen.
 const tools=root.querySelector('.wk-tools'),bar=popup?.querySelector('.popup-titlebar');if(bar&&tools){bar.querySelectorAll('.wk-tools').forEach(e=>e!==tools&&e.remove());(bar.querySelector('.popup-key')||bar.querySelector('.popup-close')).before(tools);}
 popup?.classList.add('wk-window');
 const tip=document.createElement('aside');tip.className='item-tooltip wk-tip';tip.setAttribute('role','tooltip');tip.hidden=true;(document.querySelector('#gameShell')||document.body).append(tip);
 let hover=null,tipFor=null,pinned=false,raf=0;
 function draw(){options.target=chosen?.group==='target'?chosen:null;renderer.map(canvas,true,chosen?.point,options);canvas.classList.toggle('can-pan',options.zoom>1);}
 // Der Puls der Stecknadel beim Öffnen braucht ein paar Bilder mehr als der 200-ms-Takt der Karte.
 const pulse=()=>{draw();if(performance.now()-options.openedAt<950)raf=requestAnimationFrame(pulse);};
 // ---------------- Seitenleiste
 const dist=pt=>Math.round(distance(g.player,pt)/SCALE);
 const SECTIONS=[['quest',h=>h.group==='quest'],['hub',h=>h.group==='hub'],['camp',h=>h.group==='camp'],['shop',h=>h.group==='shop'||h.group==='trainer']];
 function row(h){const on=h.id===chosen?.id,cls=`atlas-place wk-row ${h.group}${h.tracked?' atlas-tracked':''}${h.group==='target'?' wk-target':''}${h.low?' low':''}`;
  /* Runde 5b: Lager führen ihren Ortsnamen, der Auftragssatz steht im Tooltip */const name=h.group==='camp'&&h.short?h.short:h.title,tipAttr=name!==h.title?` data-tooltip-label="${esc(h.title)}" data-tooltip-note="${esc(h.short)}"`:'';
  return `<div class="${cls}" data-row="${esc(h.id)}" aria-pressed="${on}"><button type="button" class="wk-pick" data-place="${esc(h.id)}" aria-label="${esc(h.title)} · ${dist(h.point)} m"${tipAttr}><canvas class="wk-ico" width="40" height="40" data-wk-icon="${h.icon}" aria-hidden="true"></canvas><b>${esc(name)}</b><em>${dist(h.point)} m</em></button><button type="button" class="wk-boot" data-navigate="${esc(h.id)}" aria-label="${esc(T.walk)}: ${esc(h.title)}" data-tooltip-label="${esc(T.walk)}" data-tooltip-note="${esc(T.walkNote)}">${glyph('boot')}</button></div>`;}
 function render(){
  const top=places.filter(h=>h.tracked||h.group==='target');let html=top.map(row).join('');const seps=!touch();
  for(const [id,test] of SECTIONS){const rows=places.filter(h=>!h.tracked&&h.group!=='target'&&test(h)).sort((a,b)=>distance(g.player,a.point)-distance(g.player,b.point));if(!rows.length)continue;
   /* Runde 5b (Entscheidung des Orchestrators): Kopf = Symbol + ein Wort + Anzahl wie im WoW-Questlog */
   const icon=T.groups.find(x=>x.id===id)?.icon||'hub';if(seps)html+=`<div class="wk-sep" role="separator" aria-label="${esc(T.sections[id])} · ${rows.length}" data-tooltip-label="${esc(T.sections[id])}" data-tooltip-note=""><canvas width="32" height="32" data-wk-icon="${icon}" aria-hidden="true"></canvas><span class="wk-sep-word">${esc(T.sectionWords?.[id]||T.sections[id])}</span><b class="wk-sep-count">${rows.length}</b><hr></div>`;html+=rows.map(row).join('');}
  list.innerHTML=html;list.querySelectorAll('[data-wk-icon]').forEach(cv=>paintMapIcon(cv,cv.dataset.wkIcon));pageList();draw();document.dispatchEvent(new CustomEvent('panel-reflow',{detail:'map'}));
 }
 // Handy: die aufgeklappte Ortsliste blättert seitenweise (44-px-Zeilen, quer zweispaltig), statt zu scrollen.
 const pager=root.querySelector('.wk-pager');let listPage=0;
 function pageList(){const rows=[...list.children];rows.forEach(r=>r.hidden=false);if(!touch()||!list.offsetParent){pager.hidden=true;return;}pager.hidden=false;
  const cols=list.clientWidth>=440?2:1;list.style.gridTemplateColumns=cols>1?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)';const gap=parseFloat(getComputedStyle(list).rowGap)||6,rh=rows[0]?.getBoundingClientRect().height||44,per=Math.max(1,Math.floor((list.clientHeight+gap)/(rh+gap)))*cols,pages=Math.max(1,Math.ceil(rows.length/per));
  listPage=Math.min(listPage,pages-1);rows.forEach((r,i)=>r.hidden=Math.floor(i/per)!==listPage);pager.hidden=pages<=1;pager.querySelector('span').textContent=(listPage+1)+' / '+pages;pager.children[0].disabled=listPage===0;pager.children[2].disabled=listPage>=pages-1;}
 pager.addEventListener('click',e=>{const b=e.target.closest('[data-wk-page]');if(!b)return;listPage+=Number(b.dataset.wkPage);pageList();});
 function select(place){place=adopt(place)||place;chosen=place||null;options.selected=place?.id;if(options.zoom>1&&place)options.center=place.point;if(touch())side(false);render();}
 const walk=place=>{if(!place)return;hideTip();navigate(place.route||place.point);};
 // ---------------- Filterliste (kombinierbar, wie die Lupe der Minikarte)
 function renderMenu(){menu.innerHTML=`<strong>${esc(T.filter)}</strong>`+T.groups.map(x=>`<button type="button" role="menuitemcheckbox" data-wk-show="${x.id}" aria-checked="${!!options.show[x.id]}"><canvas width="32" height="32" data-wk-icon="${x.icon}" aria-hidden="true"></canvas><span>${esc(x.name)}</span><i>${options.show[x.id]?glyph('check'):''}</i></button>`).join('');menu.querySelectorAll('[data-wk-icon]').forEach(cv=>paintMapIcon(cv,cv.dataset.wkIcon));}
 const filterBtn=tools.querySelector('[data-wk-filter]');
 function openMenu(open){menu.hidden=!open;filterBtn.setAttribute('aria-expanded',String(open));filterBtn.classList.toggle('on',open);if(open){renderMenu();hideTip();const r=filterBtn.getBoundingClientRect(),pr=popup.getBoundingClientRect();menu.style.left=Math.round(Math.max(8,Math.min(r.left-pr.left,pr.width-menu.offsetWidth-8)))+'px';menu.style.top=Math.round(r.bottom-pr.top+6)+'px';}}
 popup.append(menu);
 menu.addEventListener('click',e=>{const b=e.target.closest('[data-wk-show]');if(!b)return;e.stopPropagation();options.show={...options.show,[b.dataset.wkShow]:!options.show[b.dataset.wkShow]};saveShow(options.show);renderMenu();draw();});
 const outside=e=>{if(!menu.hidden&&!menu.contains(e.target)&&!filterBtn.contains(e.target))openMenu(false);if(pinned&&!tip.contains(e.target)&&e.target!==canvas)hideTip();};
 const escKey=e=>{if(e.key==='Escape'&&!menu.hidden){openMenu(false);e.stopPropagation();e.preventDefault();}};
 document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escKey,true);
 // ---------------- Seitenleiste am Handy: aufklappbar
 const sideBtn=tools.querySelector('[data-wk-side]');
 function side(open){root.querySelector('.wk-body').classList.toggle('wk-side-open',open);sideBtn.setAttribute('aria-expanded',String(open));sideBtn.classList.toggle('on',open);if(open){hideTip();listPage=0;render();}document.dispatchEvent(new CustomEvent('panel-reflow',{detail:'map'}));}
 // ---------------- Zoom
 function zoomAt(x,y,zoom){zoom=Math.min(MAX_ZOOM,Math.max(1,zoom));if(zoom===options.zoom)return;const W=canvas.width,H=canvas.height,v=mapView(g.world,g.player,W,H,true,options),at={x:v.ox+x/v.scale,y:v.oy+y/v.scale},scale=v.scale/options.zoom*zoom;options.zoom=zoom;options.center=zoom>1?{x:at.x-(x-W/2)/scale,y:at.y-(y-H/2)/scale}:undefined;draw();}
 tools.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if('wkFilter' in b.dataset){openMenu(menu.hidden);return;}if('wkSide' in b.dataset){side(sideBtn.getAttribute('aria-expanded')!=='true');return;}zoomButton(b.dataset.zoom);});
 function zoomButton(z){if(!z)return;hideTip();if(z==='in'||z==='out'){zoomAt(canvas.width/2,canvas.height/2,z==='in'?options.zoom*1.5:options.zoom/1.5);return;}options.zoom=z==='player'?2:1;options.center=z==='player'?{x:g.player.x,y:g.player.y}:undefined;draw();}
 paper.querySelector('.wk-zoom').addEventListener('click',e=>{const b=e.target.closest('[data-zoom]');if(b)zoomButton(b.dataset.zoom);});
 // ---------------- Liste: Klick wählt, Stiefel läuft hin; Überfahren hebt den Marker hervor
 list.addEventListener('click',e=>{const boot=e.target.closest('[data-navigate]');if(boot){walk(places.find(h=>h.id===boot.dataset.navigate));return;}const b=e.target.closest('[data-place]');if(b)select(places.find(h=>h.id===b.dataset.place));});
 list.addEventListener('pointerover',e=>{const r=e.target.closest('[data-row]');const id=r?.dataset.row;const h=id&&(canvas.atlasHits||[]).find(x=>x.ids.includes(id));const key=id==='quest-destination'?'pin':h?.key||null;if(key!==options.hover){options.hover=key;draw();}});
 list.addEventListener('pointerleave',()=>{if(options.hover){options.hover=null;draw();}});
 // ---------------- Tooltip (WoW WorldMapTooltip, 260 px, rechts unten am Marker, nie über der Seitenleiste)
 const placeOf=id=>places.find(h=>h.id===id);
 function tipHtml(t){
  const lvl=g.player.level||1,foot=touch()?'':`<footer class="wk-tip-foot"><span><kbd>${glyph('mouse')}</kbd>${esc(T.click)}</span><span><kbd>⇧</kbd>+<kbd>${glyph('mouse')}</kbd>${esc(T.shiftClick)}</span></footer>`,walkBtn=pt=>touch()&&pt?`<button type="button" class="wk-tip-walk" data-tip-walk>${glyph('boot')}<span>${esc(T.tapWalk)}</span></button>`:'';
  const head=(icon,name,cls='')=>`<div class="wk-tip-head"><canvas width="40" height="40" data-wk-icon="${icon}" aria-hidden="true"></canvas><strong class="${cls}">${esc(name)}</strong></div>`;
  if(t.type==='player')return head('player',T.you);
  if(t.type==='person')return head(t.hit.party?'party':'player',t.hit.name)+`<small>${esc(t.hit.party?MT.kinds.party:MT.kinds.player)}</small>`;
  if(t.type==='cluster'){const rows=t.hit.ids.map(placeOf).filter(Boolean);return `<div class="wk-tip-title">${esc(T.cluster(rows.length))}</div>`+rows.map(h=>`<div class="wk-tip-row"><canvas width="32" height="32" data-wk-icon="${h.icon}" aria-hidden="true"></canvas><b class="${h.group==='camp'?'hostile':''}">${esc(h.title)}</b><small>${kindLine(h,lvl)}</small><em>${dist(h.point)} m</em></div>`).join('')+(touch()?'':`<footer class="wk-tip-foot"><span><kbd>${glyph('mouse')}</kbd>${esc(T.clusterNote)}</span></footer>`);}
  if(t.type==='area'){const a=t.hit.area;return head(a.spawn?'neutral':'claw',a.title)+`<small>${esc(a.spawn?T.spawnArea:a.tracked?T.areaActive:T.area)}${a.need?' · '+esc(T.progress(a.done,a.need)):''}</small>${a.detail&&a.detail!==a.title?`<em>${esc(a.detail)}</em>`:''}<span class="wk-tip-dist">${dist(a)} m</span>`+walkBtn(a)+foot;}
  const h=t.type==='pin'?places.find(x=>x.tracked):placeOf(t.hit.id);if(!h)return '';const d=detailOf(h);
  return head(h.icon,h.title,h.group==='camp'?'hostile':'')+`<small>${kindLine(h,lvl)}</small>${d?`<em>${esc(d)}</em>`:''}<span class="wk-tip-dist">${dist(h.point)} m</span>`+walkBtn(h.point)+foot;
 }
 function showTip(t,x,y){const html=tipHtml(t);if(!html){hideTip();return;}tipFor=t;tip.innerHTML=html;tip.querySelectorAll('[data-wk-icon]').forEach(cv=>paintMapIcon(cv,cv.dataset.wkIcon));tip.classList.toggle('wk-tip-touch',touch());tip.hidden=false;
  const pr=paper.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let left=x+12,top=y+12;if(left+w>pr.right-4)left=x-12-w;left=Math.max(pr.left+4,Math.min(left,pr.right-w-4));if(top+h>innerHeight-8)top=y-12-h;tip.style.left=Math.round(left)+'px';tip.style.top=Math.round(Math.max(8,top))+'px';}
 function hideTip(){tip.hidden=true;tipFor=null;pinned=false;}
 tip.addEventListener('click',e=>{if(!e.target.closest('[data-tip-walk]')||!tipFor)return;const t=tipFor;walk(t.type==='area'?{point:{x:t.hit.area.x,y:t.hit.area.y}}:t.type==='pin'?places.find(x=>x.tracked):placeOf(t.hit.id));});
 // ---------------- Treffertest auf der Karte: Marker/Bündel vor Stecknadel vor Standort vor Zielgebiet
 const local=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height,sx:r.width/canvas.width,r};};
 function hitAt(q){const near=(canvas.atlasHits||[]).map(h=>({h,d:Math.hypot(h.x-q.x,h.y-q.y)})).filter(o=>o.d<=o.h.r).sort((a,b)=>a.d-b.d)[0];if(near)return{type:near.h.cluster?'cluster':'place',hit:near.h,key:near.h.key,x:near.h.x,y:near.h.y};
  const pin=canvas.atlasPin;if(pin&&Math.hypot(pin.x-q.x,pin.y-q.y)<=pin.r)return{type:'pin',key:'pin',x:pin.x,y:pin.y+12};
  const mate=(canvas.atlasPeople||[]).find(o=>Math.hypot(o.x-q.x,o.y-q.y)<=o.r);if(mate)return{type:'person',hit:mate,key:'person:'+mate.name,x:mate.x,y:mate.y};
  const me=canvas.atlasPlayer;if(me&&Math.hypot(me.x-q.x,me.y-q.y)<=me.r)return{type:'player',key:'player',x:me.x,y:me.y};
  const area=(canvas.atlasAreas||[]).filter(a=>Math.hypot(a.x-q.x,a.y-q.y)<=a.r).sort((a,b)=>a.r-b.r)[0];if(area)return{type:'area',hit:area,key:area.id,x:q.x,y:q.y};return null;}
 function hoverAt(e){const q=local(e),t=hitAt(q);const key=t?.key||null;canvas.classList.toggle('wk-over',!!t);if(key!==options.hover){options.hover=key;draw();}hover=t;if(!t){if(!pinned)hideTip();return;}const at=t.type==='area'?{x:e.clientX,y:e.clientY}:{x:q.r.left+t.x*q.sx,y:q.r.top+t.y*q.sx};showTip(t,at.x,at.y);}
 // Ziehen verschiebt den gezoomten Ausschnitt; zwei Finger zoomen (Handy). Ein Zug zählt nicht als Klick.
 let drag=null,dragged=false;const fingers=new Map();let pinch=null;
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(fingers.size===2){const [a,b]=[...fingers.values()],q=local({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2});pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,zoom:options.zoom,x:q.x,y:q.y};drag=null;dragged=true;return;}}
  if(e.button!==0||options.zoom<=1)return;const W=canvas.width,H=canvas.height,v=mapView(g.world,g.player,W,H,true,options),fit=mapView(g.world,g.player,W,H,true,{});drag={id:e.pointerId,x:e.clientX,y:e.clientY,k:W/canvas.getBoundingClientRect().width/v.scale,center:{x:v.ox+W/v.scale/2,y:v.oy+H/v.scale/2},fit:{x0:fit.ox,y0:fit.oy,x1:fit.ox+W/fit.scale,y1:fit.oy+H/fit.scale}};dragged=false;});
 canvas.addEventListener('pointermove',e=>{if(fingers.has(e.pointerId)){fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&fingers.size===2){const [a,b]=[...fingers.values()];zoomAt(pinch.x,pinch.y,pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d);return;}}
  if(drag&&e.pointerId===drag.id){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!dragged&&Math.hypot(dx,dy)<5)return;if(!dragged){dragged=true;canvas.setPointerCapture(e.pointerId);canvas.classList.add('panning');hideTip();}const f=drag.fit;options.center={x:Math.min(f.x1,Math.max(f.x0,drag.center.x-dx*drag.k)),y:Math.min(f.y1,Math.max(f.y0,drag.center.y-dy*drag.k))};draw();return;}
  if(e.pointerType==='mouse'&&!pinned)hoverAt(e);});
 for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{fingers.delete(e.pointerId);if(fingers.size<2)pinch=null;if(drag?.id===e.pointerId){drag=null;canvas.classList.remove('panning');}});
 canvas.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;canvas.classList.remove('wk-over');if(!pinned)hideTip();if(options.hover){options.hover=null;draw();}});
 canvas.addEventListener('click',e=>{if(dragged){dragged=false;return;}const q=local(e),t=hitAt(q);
  if(!t){hideTip();return;}
  if(t.type==='cluster'){hideTip();const v=canvas.atlasView,world={x:v.ox+t.x/v.scale,y:v.oy+t.y/v.scale};options.zoom=Math.min(MAX_ZOOM,options.zoom*2);options.center=world;options.hover=null;draw();return;}
  const place=t.type==='place'?placeOf(t.hit.id):t.type==='pin'?places.find(x=>x.tracked):null;
  if(e.shiftKey&&!touch()){if(place)walk(place);else if(t.type==='area')walk({point:{x:t.hit.area.x,y:t.hit.area.y}});return;}
  if(place)select(place);
  // Handy: Tippen zeigt den Tooltip (mit Stiefel), er bleibt bis zum nächsten Tippen daneben.
  if(e.pointerType!=='mouse'||touch()){const at=t.type==='area'?{x:e.clientX,y:e.clientY}:{x:q.r.left+t.x*q.sx,y:q.r.top+t.y*q.sx};showTip(t,at.x,at.y);pinned=true;}});
 canvas.addEventListener('wheel',e=>{e.preventDefault();const q=local(e);hideTip();zoomAt(q.x,q.y,options.zoom*(e.deltaY<0?1.2:1/1.2));},{passive:false});
 const resize=()=>{const width=Math.max(1,Math.round(canvas.clientWidth)),height=Math.max(1,Math.round(canvas.clientHeight));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}draw();};
 chosen=adopt(initial);options.selected=chosen?.id;
 render();resize();raf=requestAnimationFrame(pulse);const observer=new ResizeObserver(resize);observer.observe(canvas);/* Handy: Seiten der Ortsliste nach der echten Höhe neu schneiden */const listObserver=new ResizeObserver(()=>pageList());listObserver.observe(list);
 return{select,refresh:()=>{draw();list.querySelectorAll('[data-row]').forEach(el=>{const place=placeOf(el.dataset.row);if(place)el.querySelector('em').textContent=dist(place.point)+' m';});/* Entfernungen im offenen Tooltip mitlaufen lassen, ohne ihn zu verschieben */if(tipFor&&!tip.hidden){const html=tipHtml(tipFor);if(html){tip.innerHTML=html;tip.querySelectorAll('[data-wk-icon]').forEach(cv=>paintMapIcon(cv,cv.dataset.wkIcon));}}},
  destroy:()=>{observer.disconnect();listObserver.disconnect();cancelAnimationFrame(raf);tip.remove();menu.remove();document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escKey,true);popup?.classList.remove('wk-window');}};
}
