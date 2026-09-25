// Dungeon-Karte im Kartenfenster (M) – Etappe 2 „Lesbar wie WoW“ (E-71; Grafik-Review Dungeon Befund 9, Zielbild A).
// Die Leinwand füllt das Fenster (kein Erklärsatz, kein festes 4:3), die Ebenen sind Symbolreiter in der Titelzeile, daneben ein
// Info-Symbol (die Idee „Prospekt gegen Wirklichkeit“ steht im Tooltip) und der Schalter „Prospekt“. Rechts eine schmale Leiste mit
// Siegeln, Beweisen und den Bossen (Klick öffnet das Journal); am Handy liegt sie als Zeile oben. Überfahren zeigt einen Tooltip
// (Raum: Schild, Wirklichkeit, geräumt/Gegner übrig; Boss; Übergang), Klick auf einen Boss öffnet das Journal, Klick auf die Karte
// setzt eine Wegmarke (auch über Ebenen, der Pfeil am Helden führt zum nächsten Übergang), Umschalt+Klick läuft hin.
import {DUNGEON_BOSSES,DUNGEON_UI as DU,PANEL_UI} from './content/index.js';
import {dungeonRun,floorAt,dungeonDestination,setDungeonWaypoint,requiredSeals} from './dungeon.js';
import {drawDungeonMapFull,mapToWorld} from './dungeon-map-art.js';
import {dicon,paintDungeonIcons} from './dungeon-journal.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const touch=()=>document.body.classList.contains('touch-mode');
const tip=(label,note='')=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;

export function mountDungeonMap({game,popups,openModal,openJournal}){
 let floor=null,prospect=false,hover=null,tipEl=null,heading=-Math.PI/2,last=null,route={key:'',path:[]},w=null;
 const run=()=>dungeonRun(game());
 function panel(){const r=run(),def=r.def,here=floorAt(def,game().player.x,game().player.y)||r.checkpoint.floor,cur=floor||here;
  const tabs=Object.entries(def.floors).map(([id,f])=>`<button type="button" class="dm-floor ${id===cur?'gold-button':'outline-button'}" data-dungeon-floor="${id}" aria-pressed="${id===cur}" ${tip(f.name,id===here?DU.map.you:'')}>${dicon(id==='e0'?'exit':'stairs',16)}<b>${esc(DU.map.floorShort[id]||id)}</b></button>`).join('');
  const tools=`<div class="dm-tools" role="toolbar">${tabs}<button type="button" class="ql-tool dm-tool" data-dm-prospect aria-pressed="${prospect}" ${tip(DU.map.prospect,DU.map.prospectNote)}>${dicon('eye',18)}</button><span class="dm-tool dm-info" tabindex="0" ${tip(DU.map.info,DU.map.infoNote)}>${dicon('info',18)}</span></div>`;
  return `<span hidden data-ui-window-title="${esc(def.name)}"></span><div class="dm" data-dm>${tools}<div class="dm-body"><div class="dm-paper"><canvas class="dungeon-map" width="640" height="480"></canvas></div><aside class="dm-side" aria-label="${esc(def.name)}"></aside></div></div>`;}
 function side(){const r=run();if(!w?.body)return;const el=w.body.querySelector('.dm-side');if(!el)return;const def=r.def,seals=requiredSeals(def,def.doors.find(d=>d.lock?.seals)?.lock.seals)/* Etappe 3: nur gebaute Siegelträger */;
  const html=`<div class="dm-row" ${tip(DU.tracker.seals,DU.tracker.sealNote)}>${seals.map(s=>dicon(r.seals.has(s)?'seal':'seal-empty',22)).join('')}<b>${r.seals.size}/${seals.length}</b></div>`
   +`<div class="dm-row" ${tip(DU.tracker.proofs,DU.tracker.proofNote)}>${[0,1,2].map(i=>dicon((r.evidence?.size||0)>i?'lens':'lens-empty',22)).join('')}<b>${r.evidence?.size||0}/3</b></div>`
   +`<div class="dm-bosses">${def.bosses.filter(b=>DUNGEON_BOSSES[b.id]).map(b=>{const dead=r.killed.has(b.id);return `<button type="button" class="dm-boss${dead?' dead':''}" data-dm-boss="${b.id}" ${tip(DUNGEON_BOSSES[b.id].name,(dead?DU.map.bossDead:DU.map.boss)+' · '+DU.map.bossNote)}>${dicon(dead?'skull-dead':b.id==='bigb'?'crown':'skull',22)}<span>${esc(DUNGEON_BOSSES[b.id].name)}</span></button>`;}).join('')}</div>`;
  if(el.dataset.sig!==html){el.dataset.sig=html;el.innerHTML=html;paintDungeonIcons(el);}}
 function size(canvas){const dpr=Math.min(2,window.devicePixelRatio||1),cw=Math.max(1,Math.round(canvas.clientWidth||640)),ch=Math.max(1,Math.round(canvas.clientHeight||480)),wd=Math.round(cw*dpr),ht=Math.round(ch*dpr);if(canvas.width!==wd||canvas.height!==ht){canvas.width=wd;canvas.height=ht;}}
 /** Route zur Wegmarke auf der gezeigten Ebene (Weg bis zum nächsten Übergang bzw. bis zur Marke); nur neu, wenn sich etwas bewegt. */
 function routeFor(g,r,cur){const wp=r.waypoint;if(!wp)return [];const dest=dungeonDestination(g);if(!dest||floorAt(r.def,g.player.x,g.player.y)!==cur)return [];const key=[Math.round(g.player.x/16),Math.round(g.player.y/16),Math.round(dest.point.x),Math.round(dest.point.y),cur].join(',');if(route.key!==key){let path=[];try{path=g.world.findPath(g.player,dest.point)||[];}catch{}route={key,path:[{x:g.player.x,y:g.player.y},...path]};}return route.path;}
 function draw(){w=popups.get('map');const canvas=w?.body?.querySelector('canvas.dungeon-map'),r=run(),g=game();if(!canvas||!r)return false;
  const here=floorAt(r.def,g.player.x,g.player.y)||r.checkpoint.floor,cur=floor||here;
  if(last){const dx=g.player.x-last.x,dy=g.player.y-last.y;if(dx*dx+dy*dy>1)heading=Math.atan2(dy,dx);}last={x:g.player.x,y:g.player.y};
  for(const b of w.el.querySelectorAll('[data-dungeon-floor]')){const on=b.dataset.dungeonFloor===cur;b.classList.toggle('gold-button',on);b.classList.toggle('outline-button',!on);b.setAttribute('aria-pressed',String(on));}
  size(canvas);drawDungeonMapFull(canvas,g,{floor:cur,prospect,hover:hover?.key,waypoint:r.waypoint,route:r.waypoint?.floor===cur?routeFor(g,r,cur):[],heading});side();return true;}
 function hitAt(canvas,e){const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top,hits=canvas.dungeonHits||[];
  const point=hits.filter(h=>h.r!=null&&Math.hypot(h.x-x,h.y-y)<=h.r).sort((a,c)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(c.x-x,c.y-y))[0];if(point)return {...point,key:point.kind+':'+(point.id||point.label),x,y,cx:b.left+point.x,cy:b.top+point.y};
  const room=hits.find(h=>h.kind==='room'&&h.rects.some(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h));return room?{...room,key:'room:'+room.id,x,y,cx:e.clientX,cy:e.clientY}:{kind:'none',x,y,key:null};}
 function showTip(h){if(!tipEl){tipEl=document.createElement('aside');tipEl.className='item-tooltip wk-tip dm-tip';tipEl.setAttribute('role','tooltip');(document.querySelector('#gameShell')||document.body).append(tipEl);}
  if(!h||h.kind==='none'||!h.label){tipEl.hidden=true;return;}tipEl.innerHTML=`<div class="wk-tip-head"><strong>${esc(h.label)}</strong></div>${h.note?`<small>${esc(h.note)}</small>`:''}`;tipEl.hidden=false;
  const wd=tipEl.offsetWidth,ht=tipEl.offsetHeight;let left=h.cx+14,top=h.cy+14;if(left+wd>innerWidth-8)left=h.cx-14-wd;if(top+ht>innerHeight-8)top=h.cy-14-ht;tipEl.style.left=Math.round(Math.max(8,left))+'px';tipEl.style.top=Math.round(Math.max(8,top))+'px';}
 function hideTip(){if(tipEl)tipEl.hidden=true;}
 function bind(){const canvas=w.body.querySelector('canvas.dungeon-map');
  // Werkzeuge in die Titelzeile (neben Tastenkappe und Schließen), wie bei der Weltkarte
  const tools=w.body.querySelector('.dm-tools'),bar=w.el.querySelector('.popup-titlebar');if(bar&&tools){bar.querySelectorAll('.dm-tools').forEach(e=>e!==tools&&e.remove());(bar.querySelector('.popup-key')||bar.querySelector('.popup-close')).before(tools);}
  w.el.setAttribute('aria-label',PANEL_UI.tabMap+' · '+run().def.name);w.el.classList.add('dm-window');
  tools.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.dungeonFloor){floor=b.dataset.dungeonFloor;hover=null;hideTip();draw();return;}if('dmProspect' in b.dataset){prospect=!prospect;b.setAttribute('aria-pressed',String(prospect));b.classList.toggle('on',prospect);draw();}});
  w.body.querySelector('.dm-side').addEventListener('click',e=>{const b=e.target.closest('[data-dm-boss]');if(b)openJournal(b.dataset.dmBoss);});
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const h=hitAt(canvas,e);canvas.classList.toggle('dm-over',!!h.key);if(h.key!==hover?.key){hover=h;draw();}showTip(h);});
  canvas.addEventListener('pointerleave',()=>{hover=null;hideTip();draw();});
  canvas.addEventListener('click',e=>{const g=game(),r=run(),h=hitAt(canvas,e);
   if(h.kind==='boss'){hideTip();openJournal(h.id);return;}
   if(h.kind==='step'&&h.floor&&!e.shiftKey){floor=h.floor;hover=null;hideTip();draw();return;}
   if(touch()&&h.label&&h.kind!=='room'){showTip(h);return;}
   const pt=mapToWorld(canvas,h.x,h.y);if(!pt)return;const ok=setDungeonWaypoint(g,pt);if(!ok){showTip(h);return;}
   if(e.shiftKey&&!touch()){const dest=dungeonDestination(g);if(dest&&g.navigate?.(dest.point))popups.close('map');return;}
   draw();showTip(touch()?{...h,label:DU.map.waypointSet,note:DU.map.waypointNote}:h);});}
 function show(f=null){floor=f;hover=null;const html=panel();w=openModal(html,true,'map');if(w.minimized)popups.minimize('map');popups.focus('map');w.cleanup=()=>{floor=null;hideTip();};bind();paintDungeonIcons(w.el);requestAnimationFrame(()=>draw());draw();return w;}
 globalThis.__dgShowMap=()=>show();/* Prüfzugang (scripts/dungeon-e2-check.mjs) */
 return {show,draw,hideTip};
}
