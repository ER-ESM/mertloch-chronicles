// Einzelfenster (Nutzerauftrag 2026-09-23, löst das Clanbuch mit Reitern ab): jede Seite ist ein eigenes Fenster
// mit eigener Taste. Wie im MMO-Vorbild docken sie an: links Figur und Aufträge, rechts Rucksack und Kniffe,
// mittig Talente und Hilfe, die Karte fast bildschirmfüllend. Mehrere dürfen gleichzeitig offen sein.
// Feste Plätze (Runde 1, 2026-09-24, WoW-Vorbild): jedes angedockte Fenster hat seinen Platz, nichts rutscht nach, wenn ein
// anderes schließt. Links und rechts beginnen auf derselben Oberkante (unter dem Spielerrahmen); rechts enden die Fenster vor
// der Spalte aus Minikarte und Auftragsverfolgung und teilen eine Unterkante über der Aktionsleiste. Talente/Hilfe stehen mittig
// in der Lücke zwischen den offenen Seitenfenstern, soweit sie hineinpassen. Overlays (Gespräch, Beute, Tod, Anlage) liegen daneben.
// Details (Gegenstand, Erklärung) hängen an ihrem Fenster und schließen mit ihm. Touch: immer nur ein Fenster.
import {PANEL_UI as UI,GAME_MENU_UI as MENU,SHOP_UI,MOUNT_UI,WINDOW_UI} from './content/index.js';
import {touchPopupBounds} from './popup-layout.js';
const titles={professions:'Berufe',trainer:'Lehrer',mounts:MOUNT_UI.title,shop:SHOP_UI.title,inspection:'Gegenstand',detail:'Details',mobile:'Deine Touchbuttons',install:'Poo-Tang als App',touchhelp:'Kniff erklärt',talents:UI.talents,activity:'Anlagenprüfung',bag:UI.tabBag,person:UI.tabFigure,book:UI.tabSkills,quest:UI.tabQuests,base:UI.tabBase,map:UI.tabMap,menu:MENU.title,clan:UI.tabFigure,guide:UI.tabHelp,admin:'Admin',loot:'Beute',dialog:'Gespräch',memory:'Erinnerung',memoryart:'Erinnerungsbild',death:'Wieder auf die Beine'};
const widths={
professions:900,trainer:520,mounts:820,companions:780,
shop:920,inspection:360,detail:390,mobile:390,install:360,touchhelp:340,talents:1040,activity:430,bag:400,person:440,book:400,quest:420,base:420,map:760,menu:320,clan:470,guide:620,admin:620,loot:296,dialog:440,memory:600,memoryart:800,death:420};
/** Die Fenster mit eigener Taste: [id, Name, Symbol, Taste, Andockseite, Zweittaste]. Reihenfolge = Menüleiste. */
export const WINDOWS=WINDOW_UI.windows;
export const DOCK=Object.fromEntries(WINDOWS.map(w=>[w[0],w[4]]));
/** Feste Plätze je Seite, vom Rand nach innen: links in Menüreihenfolge (Figur, Aufträge), rechts von außen (Rucksack, dann Kniffe). */
export const SLOTS={left:WINDOWS.filter(w=>w[4]==='left').map(w=>w[0]),right:WINDOWS.filter(w=>w[4]==='right').map(w=>w[0]).reverse()};
/** Aufrufe, die in einem der Fenster landen (Bude ist ein Abschnitt der Aufträge). */
export const WINDOW_OF={...Object.fromEntries(WINDOWS.map(w=>[w[0],w[0]])),clan:'person',base:'quest'};
const CHILD=new Set(['inspection','detail','touchhelp']);
/** Beute darf neben offenen Fenstern stehen (Rucksack + Beutel wie im Vorbild). */
const BESIDE=new Set(['loot']);
export const isDocked=id=>DOCK[id]!==undefined;
/** Alter Name, bleibt für Aufrufer, die „ist ein Buchfenster“ fragen. */
export const isBook=isDocked;
const touch=()=>document.body.classList.contains('touch-mode');
const GAP=8,EDGE=10;
/** Rechteck eines sichtbaren HUD-Teils oder null. */
function box(selector){const el=document.querySelector(selector);if(!el||el.hidden)return null;const r=el.getBoundingClientRect();return r.width&&r.height?r:null;}
export class PopupWindows{
 constructor(root){this.root=root;this.windows=new Map();this.serial=20;this.opened=0;this.positions={};try{this.positions=JSON.parse(localStorage.getItem('mertloch-popup-positions')||'{}')||{};}catch{}root.addEventListener('pointerdown',e=>{const el=e.target.closest('.game-popup');if(el)this.focus(el.dataset.window);},true);root.addEventListener('click',e=>{const el=e.target.closest('.game-popup');if(el)this.focus(el.dataset.window);},true);root.addEventListener('click',e=>{const b=e.target.closest('[data-window-close]');if(b)this.close(b.closest('.game-popup').dataset.window);});window.addEventListener('resize',()=>this.reflow());window.addEventListener('orientationchange',()=>this.reflow());this.observedControls=new WeakSet();if(typeof ResizeObserver!=='undefined')this.controlObserver=new ResizeObserver(()=>this.reflow());if(typeof MutationObserver!=='undefined'){this.layoutObserver=new MutationObserver(()=>this.reflow());this.layoutObserver.observe(document.body,{attributes:true,attributeFilter:['class','style','data-touch-hand','data-touch-size']});}}
 isOpen(id){return this.windows.has(id);}
 get(id){return this.windows.get(id);}
 top(){return [...this.windows.values()].sort((a,b)=>b.z-a.z)[0]?.id;}
 /** Das zuletzt vorn liegende angedockte Fenster, falls eines offen ist. */
 book(){return [...this.windows.values()].filter(w=>isDocked(w.id)).sort((a,b)=>b.z-a.z)[0]?.id||null;}
 docked(){return [...this.windows.keys()].filter(isDocked);}
 focus(id){const w=this.get(id);if(!w)return;w.z=++this.serial;w.el.style.zIndex=w.z;for(const p of this.windows.values())p.el.classList.toggle('is-front',p===w);}
 label(w){const title=w.body.querySelector('[data-ui-window-title]')?.dataset.uiWindowTitle||titles[w.id]||w.id;w.el.setAttribute('aria-label',title);w.el.querySelector('.popup-titlebar strong').textContent=title;w.el.querySelector('.popup-close').setAttribute('aria-label',title+' schließen');}
 /** deferClamp: Der Aufrufer passt das Fenster selbst ein (clamp), nachdem er den Inhalt geschmückt hat – spart am Desktop ein volles Layout des noch ungekürzten Inhalts. Touch braucht die Maße sofort. */
 open(id,html,{deferClamp=false}={}){const later=deferClamp&&!touch();let w=this.get(id);if(w){const y=w.body.scrollTop;w.body.innerHTML=html;w.body.scrollTop=y;this.label(w);if(!later)this.clamp(w);this.focus(id);return w;}
  const docked=isDocked(id);
  // Angedockte Fenster stehen nebeneinander; sie schließen nur Overlays (Gespräch, Menü, Laden …), nicht einander.
  // Touch hat nur Platz für eines. Overlays schließen weiter alles – außer Beute, die neben den Fenstern stehen darf.
  if(!CHILD.has(id))for(const other of [...this.windows.keys()]){if(other===id||CHILD.has(other))continue;
   const keep=!touch()&&(docked?isDocked(other)||BESIDE.has(other):BESIDE.has(id)&&isDocked(other));if(!keep)this.close(other);}
  const parent=CHILD.has(id)?this.book():null;
  const win=WINDOWS.find(x=>x[0]===id),icon=win?.[2]||({base:'base',menu:'menu',clan:'person',admin:'menu',loot:'bag',dialog:'quest',memory:'paper',memoryart:'paper',death:'food'})[id]||'menu';
  const el=document.createElement('section');el.className='game-popup popup-'+id+(docked?' popup-book popup-dock dock-'+DOCK[id]:'');el.dataset.window=id;el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-label',titles[id]||id);el.tabIndex=-1;el.innerHTML=`<header class="popup-titlebar"><canvas class="popup-emblem" width="48" height="48" data-ui-icon="${icon}" aria-hidden="true"></canvas><strong>${titles[id]||id}</strong>${win&&!touch()?`<kbd class="popup-key" title="${WINDOW_UI.keyHint(win[3])}">${win[3]}</kbd>`:''}<button class="popup-close" data-window-close aria-label="${titles[id]} schließen" title="${WINDOW_UI.close}">×</button></header><div class="popup-body"></div>`;
  const body=el.querySelector('.popup-body');body.innerHTML=html;this.root.append(el);w={id,el,body,z:0,minimized:false,cleanup:null,opened:++this.opened,parent};this.windows.set(id,w);this.label(w);
  if(docked){this.focus(id);if(!later)this.clamp(w);return w;}
  const key=id;el.style.width=Math.min(widths[id]||440,innerWidth-18)+'px';const saved=this.positions[key],mobile=innerWidth<700;
  // Ohne gemerkte Position startet ein Overlay rechts neben dem Spielerrahmen statt darauf (breite Schirme).
  const hud=!mobile&&innerWidth>=1100?document.querySelector('.player-panel')?.getBoundingClientRect():null,edge=hud?Math.max(hud.right,...['#meterToggle','.world-menu-brand','.target-panel:not(.hidden)'].map(s=>document.querySelector(s)?.getBoundingClientRect()).filter(r=>r&&r.width&&r.top<hud.bottom).map(r=>r.right)):0,dock=hud&&hud.width?{x:Math.round(edge+12),y:Math.round(hud.top)}:null;
  // Gespräche docken wie in WoW links unter dem Spielerrahmen an: die Bildmitte mit Held und Gesprächspartner bleibt frei (Persona-Befund 2026-09-24).
  if(id==='dialog'&&dock)Object.assign(dock,{x:Math.round(hud.left),y:Math.round(hud.bottom+10)});
  el.style.left=(saved?.x??(mobile?9:id==='loot'?innerWidth-360:dock?dock.x:60))+'px';el.style.top=(saved?.y??(mobile?154:dock?dock.y:120))+'px';
  if(CHILD.has(id)&&!saved&&!mobile&&parent)this.besideParent(w);
  this.focus(id);if(!later)this.clamp(w);
  const handle=el.querySelector('.popup-titlebar');let drag=null;handle.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:el.offsetLeft,top:el.offsetTop};handle.setPointerCapture(e.pointerId);e.preventDefault();});handle.addEventListener('pointermove',e=>{if(!drag)return;el.style.left=drag.left+e.clientX-drag.x+'px';el.style.top=drag.top+e.clientY-drag.y+'px';this.clamp(w);});for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,()=>{if(drag){drag=null;this.positions[key]={x:el.offsetLeft,y:el.offsetTop};try{localStorage.setItem('mertloch-popup-positions',JSON.stringify(this.positions));}catch{}}});return w;
 }
 /** Anhang neben sein Fenster: rechts angedockte bekommen ihn links daneben, alle anderen rechts daneben. */
 besideParent(w){const p=this.get(w.parent);if(!p)return;const r=p.el.getBoundingClientRect(),width=w.el.offsetWidth||widths[w.id]||360;const left=DOCK[p.id]==='right'?r.left-width-GAP:r.right+GAP;w.el.style.left=Math.max(EDGE,Math.min(innerWidth-width-EDGE,left))+'px';w.el.style.top=Math.max(EDGE,r.top+40)+'px';}
 /** Andockflächen aus dem echten HUD: links unter Menüknopf/Spielerrahmen, rechts vor Minikarte und Auftragsverfolgung. */
 dockArea(){const W=innerWidth,H=innerHeight;let top=EDGE,right=W-EDGE;
  for(const r of ['.world-menu-brand','#meterToggle','.player-panel'].map(box))if(r&&r.left<W*.3&&r.top<H*.4)top=Math.max(top,Math.round(r.bottom+GAP));
  for(const r of ['#miniButton','.minimap','.quest-panel'].map(box))if(r&&r.left>W*.6&&r.top<H*.5)right=Math.min(right,Math.round(r.left-GAP));
  // Auftragsverfolgung gerade leer/verborgen (Hofprobe, Kampfstart): ihr Platz bleibt trotzdem frei, sonst läge der Rucksack
  // über ihr, sobald sie erscheint (Kenner-Befund 2026-09-24). Breite und Randabstand aus dem Stil.
  const qp=document.querySelector('.quest-panel');if(qp&&!box('.quest-panel')&&!touch()){const cs=getComputedStyle(qp),w=parseFloat(cs.width),rr=parseFloat(cs.right);if(w>0&&rr>=0&&w<W*.4)right=Math.min(right,Math.round(W-rr-w-GAP));}
  const xp=box('.xp-track'),bottom=Math.round((xp&&xp.top>H*.8?xp.top:H)-GAP);
  return{left:EDGE,top,right,bottom,width:W,height:H};}
 /** Feste Plätze (Runde 1): x hängt nur vom Platz ab, nicht davon, was sonst offen ist. Links vom Rand nach rechts, rechts von der
  *  Minikarten-/Verfolgungsspalte nach links. Liefert {left,width} je Fenster-id. */
 slots(a){const room=Math.max(240,a.right-a.left),out={};let x=a.left;for(const id of SLOTS.left){const width=Math.min(widths[id],room);out[id]={left:Math.min(x,a.width-EDGE-width),width};x+=width+GAP;}
  let r=a.right;for(const id of SLOTS.right){const width=Math.min(widths[id],room);out[id]={left:Math.max(EDGE,r-width),width};r-=width+GAP;}return out;}
 /** Alle angedockten Fenster setzen: feste Plätze links/rechts, Mitte in der freien Lücke, Karte fast Vollbild. */
 layout(){const a=this.dockArea(),list=[...this.windows.values()].filter(w=>isDocked(w.id)).sort((x,y)=>x.opened-y.opened),slot=this.slots(a);
  const low=['.action-area','.game-menu-rail'].map(box).filter(r=>r&&r.top>a.height*.6),floor=(left,width,bottom)=>low.reduce((b,r)=>left<r.right&&left+width>r.left?Math.min(b,Math.round(r.top-GAP)):b,bottom),place=(w,left,top,width,height,fixed=DOCK[w.id]==='full')=>{if(DOCK[w.id]!=='full')height=Math.min(height,floor(left,width,top+height)-top);Object.assign(w.el.style,{left:Math.round(left)+'px',top:Math.round(top)+'px',width:Math.round(width)+'px',maxWidth:'',minWidth:'',maxHeight:Math.round(height)+'px',height:fixed?Math.round(height)+'px':''});};
  for(const w of list.filter(w=>DOCK[w.id]==='left')){const s=slot[w.id];place(w,s.left,a.top,s.width,a.bottom-a.top);}
  // Rechts: die Fenster stehen als Block mit gemeinsamer Unterkante – alle so hoch wie das höchste (zuletzt gemessene Inhaltshöhe je
  // Fenster, auch wenn es gerade zu ist: schließt der Rucksack, behält Kniffe seine Höhe), soweit der Platz über Aktions- und Menüleiste
  // reicht (dann endet eines etwas früher, statt dass eines scrollen muss).
  const right=list.filter(w=>DOCK[w.id]==='right');this.natural??={};for(const w of right){const s=slot[w.id];place(w,s.left,a.top,s.width,a.bottom-a.top);this.natural[w.id]=w.el.offsetHeight;}
  if(right.length){const tall=Math.max(...SLOTS.right.map(id=>this.natural[id]||0));for(const w of right)w.el.style.height=Math.min(tall,parseFloat(w.el.style.maxHeight)||tall)+'px';}
  // Mitte: Talente/Hilfe als Gruppe bildschirmmittig, wenn dort nichts offen ist; sonst mittig in der Lücke zwischen den offenen
  // Seitenfenstern; passt sie auch dort nicht, bildschirmmittig (dann überdeckt sie, was nicht anders geht).
  const center=list.filter(w=>DOCK[w.id]==='center');if(center.length){const side=list.filter(w=>DOCK[w.id]==='left'||DOCK[w.id]==='right').map(w=>({dock:DOCK[w.id],...slot[w.id]}));
   const L=Math.max(a.left,...side.filter(s=>s.dock==='left').map(s=>s.left+s.width+GAP)),R=Math.min(a.right,...side.filter(s=>s.dock==='right').map(s=>s.left-GAP));
   const sizes=center.map(w=>Math.min(widths[w.id],a.width-2*EDGE)),total=sizes.reduce((s,v)=>s+v,0)+GAP*(sizes.length-1);
   // Passt die Gruppe nicht in die Lücke: bildschirmmittig, aber nie über die Minikarten-/Verfolgungsspalte hinaus.
   const mid=(a.width-total)/2;let x=mid>=L&&mid+total<=R?mid:total<=R-L?L+(R-L-total)/2:total<=a.right-a.left?Math.min((a.width-total)/2,a.right-total):null;
   center.forEach((w,i)=>{const width=sizes[i],left=x===null?Math.max(EDGE,Math.min((a.width-width)/2,a.right-width)):x;place(w,left,EDGE,width,a.bottom-EDGE);/* mittig auch in der Höhe, soweit das Fenster kürzer ist */const h=w.el.offsetHeight,room=parseFloat(w.el.style.maxHeight)||a.bottom-EDGE;if(h<room)w.el.style.top=Math.round(EDGE+(room-h)/2*.6)+'px';if(x!==null)x+=width+GAP;});}
  // Karte: fast Vollbild – ein schmaler Rand bleibt, damit klar ist, dass die Welt dahinter weiterläuft.
  for(const w of list.filter(w=>DOCK[w.id]==='full')){const mx=Math.max(EDGE,Math.round(a.width*.025)),my=Math.max(EDGE,Math.round(a.height*.02));place(w,mx,my,a.width-2*mx,a.bottom-my-(my-EDGE));}
  for(const c of this.windows.values())if(c.parent&&CHILD.has(c.id)&&!this.positions[c.id])this.besideParent(c);}
 reflow(){if(this.reflowFrame)return;this.reflowFrame=requestAnimationFrame(()=>{this.reflowFrame=0;if(!touch()&&this.docked().length)this.layout();for(const w of this.windows.values())if(touch()||!isDocked(w.id))this.clamp(w);});}
 clamp(w){const {el}=w;if(touch()){
  if(!this.safeProbe){this.safeProbe=document.createElement('div');this.safeProbe.style.cssText='position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:var(--safe-top,0px) var(--safe-right,0px) var(--safe-bottom,0px) var(--safe-left,0px)';this.root.append(this.safeProbe);}
  const css=getComputedStyle(this.safeProbe),safe=Object.fromEntries(['Top','Right','Bottom','Left'].map(side=>[side.toLowerCase(),parseFloat(css['padding'+side])||0]));
  const controls=[...document.querySelectorAll('#touchStick,#touchActions,#touchUtility')];for(const control of controls)if(this.controlObserver&&!this.observedControls.has(control)){this.observedControls.add(control);this.controlObserver.observe(control);}
  const r=touchPopupBounds({width:innerWidth,height:innerHeight,safe,controls:controls.map(c=>c.getBoundingClientRect()),hud:[...document.querySelectorAll('#gameShell>.player-panel')].map(c=>c.getBoundingClientRect()),preferredWidth:w.id==='map'?innerWidth:widths[w.id]||360,fill:CHILD.has(w.id)||['shop','map','talents'].includes(w.id),topInset:['shop','talents','map'].includes(w.id)?28:undefined});
  Object.assign(el.style,{width:r.width+'px',maxWidth:r.width+'px',minWidth:'0px',maxHeight:r.maxHeight+'px',height:'',left:r.left+'px',top:r.top+'px'});return;
 }if(isDocked(w.id)){this.layout();return;}
 el.style.maxHeight='';el.style.minWidth='';el.style.maxWidth=Math.max(240,innerWidth-18)+'px';/* erst alles lesen, dann schreiben: ein Layout statt zwei */const left=el.offsetLeft,width=el.offsetWidth,top=el.offsetTop,height=el.offsetHeight;el.style.left=Math.max(5,Math.min(left,innerWidth-width-5))+'px';el.style.top=Math.max(5,Math.min(top,Math.max(5,innerHeight-112-height)))+'px';}
 /** Einklappen gibt es nicht mehr; bleibt als Leerlauf für ältere Aufrufer. */
 minimize(){}
 toggle(id,show){const w=this.get(id);if(!w){show();return;}this.close(id);}
 close(id=this.top()){const w=this.get(id);if(!w)return;w.cleanup?.();w.el.remove();this.windows.delete(id);for(const child of [...this.windows.values()])if(child.parent===id)this.close(child.id);if(isDocked(id)&&!touch()&&this.docked().length)this.layout();this.focus(this.top());this.onClose?.(id);}
 closeAll(){for(const id of [...this.windows.keys()])this.close(id);}
 state(){return [...this.windows.values()].map(w=>({id:w.id,minimized:false,x:w.el.offsetLeft,y:w.el.offsetTop}));}
}
