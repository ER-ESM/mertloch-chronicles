// E-72 Runde 3 (Kenner-Befund 10 „Erinnerungsfenster blockieren“): Am Desktop erscheint ein Erinnerungsfetzen als Randkarte statt als
// Fenster mitten über dem Spiel (vorher 600 px breit, 28–35 % der Fläche, F schloss es statt mit Ida zu reden). Die Karte steht rechts
// unter Minikarte und Auftragsverfolgung, über den Menüknöpfen; Laufen, Kampf, F und Klicks in die Welt gehen weiter. Schließen: Esc,
// Kreuz oder Klick aufs Bild (dann öffnet sich das große Bild mit Text). Nachlesbar bleibt alles unter Aufträge → Erinnerungen.
// Am Handy bleibt das bisherige Fenster (memoryOverlay in chapter-ui.js).
// E-72 Runde 4 (Kenner-Befunde 3/4, Zeitsteuerung – das Aussehen bleibt): Die Karte tritt zurück, solange eine große Einblendung, Kampf,
// Tod, Spielmenü, Einführungsfilm oder HUD-Editor dran sind (hold), und kommt danach wieder. Sie geht nach ihrer Lesedauer von selbst
// (Maus darüber hält sie an); war sie schon größtenteils gelesen, wenn etwas dazwischenkommt, gilt sie als gelesen statt wiederzukommen.
// Die Kampfstatistik überdeckt sie nie: Sie dockt darüber oder darunter an oder weicht links neben sie aus (avoid).
// Dungeon-Fix 5 (Prüfer-Playtest #728): kompakte Meldung statt Randkarte mit Bild und Prosa – Symbol, „Erinnerung“, Titel; Text im Tooltip, Klick öffnet
// Bild und Text. Gilt auch am Handy (dort vorher ein Fenster mitten im Bild), oben mittig unter der Kopfleiste.
import {MEMORY_CARD as T} from './content/index.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CARD_WIDTH=300,CARD_GAP=10,CARD_MIN_HEIGHT=180;
/** Lesedauer: Grundzeit plus Zeichen je Sekunde, begrenzt. Danach geht die Karte von selbst. */
export const READ_CPS=14,READ_BASE_MS=5000,READ_MIN_MS=12000,READ_MAX_MS=40000;
/** Ruhe, bevor eine zurückgehaltene Karte wiederkommt; Anteil der Lesedauer, ab dem sie beim Zurückhalten als gelesen gilt. */
export const HOLD_CALM_MS=1500,READ_DONE=.6;
export function readingMs(fragment){const n=String(fragment?.title||'').length+String(fragment?.text||'').length;return Math.round(Math.min(READ_MAX_MS,Math.max(READ_MIN_MS,READ_BASE_MS+n/READ_CPS*1000)));}

/** Platz der Karte aus den sichtbaren HUD-Rechtecken (Viewport-Pixel): rechts bündig mit der Spalte aus Minikarte und Verfolgung,
 *  oben unter ihr, unten über Menüleiste/EP-Leiste. `column`, `floor` und `avoid` sind Rechtecke {left,right,top,bottom}; `avoid`
 *  (Kampfstatistik) darf nie verdeckt werden: Die Karte nimmt den größten freien Streifen der Spalte (darüber/darunter) oder – wenn
 *  der zu niedrig ist – rückt sie links neben das Hindernis. Rein, getestet. */
export function cardPlace({width,height,column=[],floor=[],avoid=[]}){
 const col=column.filter(r=>r&&r.left>width*.55);
 const edge=col.length?Math.max(...col.map(r=>r.right)):width-14;
 const right=Math.max(8,Math.round(width-edge));
 const top=Math.round((col.length?Math.max(...col.map(r=>r.bottom)):80)+CARD_GAP);
 const left=width-right-CARD_WIDTH;
 const low=floor.filter(r=>r&&r.top>height*.5&&r.right>left&&r.left<width-right);
 const bottom=Math.round((low.length?Math.min(...low.map(r=>r.top)):height)-CARD_GAP);
 const plain={right,top,maxHeight:Math.max(0,bottom-top)};
 const hit=avoid.filter(r=>r&&r.right>left&&r.left<width-right&&r.bottom>top&&r.top<bottom);
 if(!hit.length)return plain;
 // Freie Streifen der Spalte zwischen den Hindernissen.
 let slots=[[top,bottom]];
 for(const r of hit)slots=slots.flatMap(([a,b])=>[[a,Math.min(b,Math.round(r.top)-CARD_GAP)],[Math.max(a,Math.round(r.bottom)+CARD_GAP),b]]).filter(([a,b])=>b-a>0);
 const best=slots.sort((x,y)=>(y[1]-y[0])-(x[1]-x[0]))[0];
 if(best&&best[1]-best[0]>=CARD_MIN_HEIGHT)return {right,top:best[0],maxHeight:best[1]-best[0]};
 // Zu wenig Platz über/unter der Statistik: links daneben, volle Spaltenhöhe.
 const aside=Math.round(width-(Math.min(...hit.map(r=>r.left))-CARD_GAP));
 if(width-aside-CARD_WIDTH>=8)return {right:aside,top,maxHeight:plain.maxHeight};
 return best?{right,top:best[0],maxHeight:best[1]-best[0]}:plain;
}

/** Zeitsteuerung einer offenen Karte je UI-Takt (rein, getestet). s = {held,heldAt,visibleMs,lastTick}. Liefert den neuen Zustand und
 *  was zu tun ist: 'hide' (zurückhalten), 'show' (nach Ruhe wiederkommen), 'close' (gelesen) oder null. Verdeckt ein Fenster die Karte
 *  (covered), läuft ihre Lesezeit nicht weiter – sie bleibt aber stehen. */
export function cardTiming(s,{hold=false,covered=false,hover=false,now,readMs}){
 const dt=Math.max(0,Math.min(500,now-(s.lastTick??now))),n={...s,lastTick:now};
 if(hold){n.heldAt=now;if(s.held)return {state:n,act:null};if((s.visibleMs||0)>=READ_DONE*readMs)return {state:n,act:'close'};n.held=true;return {state:n,act:'hide'};}
 if(s.held){if(now-(s.heldAt??now)<HOLD_CALM_MS)return {state:n,act:null};n.held=false;return {state:n,act:'show'};}
 if(!hover&&!covered)n.visibleMs=(s.visibleMs||0)+dt;
 return {state:n,act:n.visibleMs>=readMs?'close':null};
}

/** Dungeon-Fix 5 (Prüfer-Playtest #728: am Hinterausgang ging ungefragt „ERINNERUNG · Wurst Case“ mit Bild und sieben Zeilen Prosa auf): Die Karte ist
 *  eine kompakte Meldung – Symbol, „Erinnerung“ und Titel in einer Zeile. Der Text steht im Tooltip, ein Klick öffnet Bild und Text (onZoom). Keine
 *  ungefragte Textwand mehr; nachlesbar bleibt alles unter Aufträge → Erinnerungen. */
export function memoryCardHtml(fragment){
 const title=esc(fragment.title);
 return `<header class="memory-card-head"><button type="button" class="memory-card-open" data-memory-card-art aria-label="${title} – ${esc(T.open)}" data-tooltip-label="${title}" data-tooltip-note="${esc(fragment.text)}"><canvas width="48" height="48" data-ui-icon="paper" aria-hidden="true"></canvas><span class="memory-card-label">${esc(T.label)}</span><strong>${title}</strong></button>`+
  `<button type="button" class="memory-card-close" data-memory-next aria-label="${esc(T.close)}" data-tooltip-label="${esc(T.close)}" data-tooltip-note="${esc(T.closeNote)}">×</button></header>`;
}
/** Dungeon-Fix 5: Standzeit der kompakten Meldung (statt der Lesedauer des ganzen Texts). */
export const noticeMs=()=>T.showMs||9000;

/** Schon einmal als Karte gezeigte Fetzen, browserweit (E-72 Runde 5, Kenner-Befund klicks 4): Ein weiterer Held schaltet sie nur still frei. */
export const MEMORY_POPUP_KEY='mertloch-memory-popups';
const popupIds=storage=>{try{const v=JSON.parse(storage?.getItem(MEMORY_POPUP_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}};
/** Wurde dieser Fetzen in diesem Browser schon als Karte/Fenster gezeigt (bei irgendeinem Helden)? Rein, getestet. */
export const memoryPopupSeen=(storage,id)=>!!id&&popupIds(storage).includes(id);
/** Fetzen als gezeigt merken (höchstens 60 Einträge). */
export function markMemoryPopup(storage,id){if(!id)return;const l=popupIds(storage);if(l.includes(id))return;try{storage?.setItem(MEMORY_POPUP_KEY,JSON.stringify([...l,id].slice(-60)));}catch{}}

/** Karte in `shell` einhängen. onClose(fragment, grund) nach jedem Schließen, onZoom(fragment) beim Klick aufs Bild.
 *  E-72 Runde 5 (Kenner-Befund klicks 2): Rechtsklick auf die Karte läuft wie ein Rechtsklick in die Welt (onRightClick) – die Karte liegt
 *  über der Welt und schluckte das Laufen; ihr Bild-Tooltip geht mit ihr (hideTip beim Zurücktreten und Schließen). */
export function mountMemoryCard(shell,{onClose,onZoom,onRightClick,hideTip,paint,now=()=>performance.now()}={}){
 const el=document.createElement('aside');el.className='memory-card';el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 shell.append(el);let current=null,timing={},hover=false,lastRect=null;
 const rect=sel=>{const e=document.querySelector(sel);if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return r.width&&r.height?r:null;};
 function place(){
  if(!current||timing.held)return;
  /* Dungeon-Fix 5: am Handy oben mittig unter allem, was dort oben steht (Kopfleiste, Heldenrahmen, Ziel, Bossrahmen) */
  if(document.body.classList.contains('touch-mode')){const W=innerWidth,w=el.offsetWidth||CARD_WIDTH,mid=r=>r.left<W/2+w/2&&r.right>W/2-w/2;
   const top=Math.round(Math.max(8,...['.touch-topline','.player-panel','#targetPanel:not(.hidden)','.boss-frame:not([hidden])','#unitGroupDock.unit-dock-landscape'].map(rect).filter(r=>r&&mid(r)&&r.top<innerHeight*.4).map(r=>r.bottom+6)));
   const right=Math.max(8,Math.round((W-w)/2));for(const [k,v] of [['right',right+'px'],['top',top+'px'],['maxHeight','']])if(el.style[k]!==v)el.style[k]=v;
   const r=el.getBoundingClientRect();if(r.width&&r.height)lastRect={left:r.left,right:r.right,top:r.top,bottom:r.bottom};return;}
  const p=cardPlace({width:innerWidth,height:innerHeight,column:['.minimap','#miniButton','.quest-panel'].map(rect),floor:['.game-menu-rail','.xp-track'].map(rect),avoid:['#combatMeter'].map(rect)});
  const s=el.style;for(const [k,v] of [['right',p.right],['top',p.top],['maxHeight',p.maxHeight]])if(s[k]!==v+'px')s[k]=v+'px';
  // Reicht die Höhe nicht (lange Verfolgung, kleiner Schirm), wird zuerst das Bild flacher, zuletzt fällt es weg – der Text bleibt.
  // Läuft alle 100 ms mit (updateUI): nur schreiben, was sich ändert.
  const pic=el.querySelector('.memory-card-picture');
  if(pic){const shown=pic.hidden?0:pic.offsetHeight,rest=el.scrollHeight-shown,natural=Math.round((pic.hidden?el.clientWidth:pic.offsetWidth)*2/3),frame=el.offsetHeight-el.clientHeight,h=Math.min(natural,p.maxHeight-frame-rest),hide=h<56;
   if(pic.hidden!==hide)pic.hidden=hide;if(!hide&&pic.style.height!==h+'px')pic.style.height=h+'px';}
  const r=el.getBoundingClientRect();if(r.width&&r.height)lastRect={left:r.left,right:r.right,top:r.top,bottom:r.bottom};
 }
 /* E-72 R5 (klicks 2, schorsch-03): Erscheint die Karte unter der ruhenden Maus (nach Aufwachen/Teleport, wo man gerade hinklickte), kam ihr
    Bild-Tooltip gleich mit – zwei Fenster auf einmal. Tooltips der Karte schlafen daher, bis sich die Maus über ihr wirklich bewegt. */
 const TIP=['label','note'];
 function quietTips(){for(const n of el.querySelectorAll('[data-tooltip-label]'))for(const k of TIP){const a='data-tooltip-'+k;if(n.hasAttribute(a)){n.setAttribute('data-quiet-'+k,n.getAttribute(a));n.removeAttribute(a);}}}
 function wakeTips(target){const list=el.querySelectorAll('[data-quiet-label]');if(!list.length)return;for(const n of list)for(const k of TIP){const q='data-quiet-'+k;if(n.hasAttribute(q)){n.setAttribute('data-tooltip-'+k,n.getAttribute(q));n.removeAttribute(q);}}
  if(typeof PointerEvent==='function')target?.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));}
 function reveal(){el.hidden=false;quietTips();place();el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));}
 function show(fragment){
  current=fragment;timing={held:false,visibleMs:0,lastTick:now()};hover=false;el.innerHTML=memoryCardHtml(fragment);el.setAttribute('aria-label',T.label+': '+fragment.title);paint?.(el);
  el.querySelector('img')?.addEventListener('load',place,{once:true});reveal();
 }
 /** Tooltip eines Kartenteils (Bild, Kreuz) weg, bevor die Karte verschwindet – er blieb sonst stehen und lag später neben der wiederkehrenden Karte. */
 const dropTip=()=>{if(el.querySelector('[aria-describedby]'))hideTip?.();};
 function close(reason='close'){if(!current)return false;const f=current;dropTip();current=null;timing={};el.classList.remove('show');el.hidden=true;el.innerHTML='';onClose?.(f,reason);return true;}
 /** Je UI-Takt: hold = große Einblendung, Kampf, Tod … (Karte tritt zurück); covered = Fenster liegt über ihr (Lesezeit hält an). */
 function update({hold=false,covered=false}={}){
  if(!current)return;const r=cardTiming(timing,{hold,covered,hover,now:now(),readMs:noticeMs()/* Dungeon-Fix 5: kompakte Meldung */});timing=r.state;
  if(r.act==='hide'){dropTip();el.classList.remove('show');el.hidden=true;}else if(r.act==='show')reveal();else if(r.act==='close')close(hold?'hold':'read');
 }
 el.addEventListener('pointerdown',e=>{if(e.button!==2||e.pointerType==='touch'||!onRightClick)return;e.preventDefault();e.stopPropagation();onRightClick(e);});
 el.addEventListener('click',e=>{if(e.target.closest('[data-memory-next]')){close('close');return;}if(e.target.closest('[data-memory-card-art]')){const f=current;close('zoom');onZoom?.(f);}});
 el.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&(e.movementX||e.movementY))wakeTips(e.target);});
 el.addEventListener('pointerenter',()=>{hover=true;});el.addEventListener('pointerleave',()=>{hover=false;});
 addEventListener('resize',place);
 return {show,close,place,update,el,get open(){return !!current;},get held(){return !!timing.held;},get fragment(){return current;},get rect(){return current?lastRect:null;},state:()=>({open:!!current,id:current?.id||null,held:!!timing.held,visibleMs:Math.round(timing.visibleMs||0),readMs:current?noticeMs():0,hidden:el.hidden})};
}
