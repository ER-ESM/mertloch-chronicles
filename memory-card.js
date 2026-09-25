// E-72 Runde 3 (Kenner-Befund 10 „Erinnerungsfenster blockieren“): Am Desktop erscheint ein Erinnerungsfetzen als Randkarte statt als
// Fenster mitten über dem Spiel (vorher 600 px breit, 28–35 % der Fläche, F schloss es statt mit Ida zu reden). Die Karte steht rechts
// unter Minikarte und Auftragsverfolgung, über den Menüknöpfen; Laufen, Kampf, F und Klicks in die Welt gehen weiter. Schließen: Esc,
// Kreuz oder Klick aufs Bild (dann öffnet sich das große Bild mit Text). Nachlesbar bleibt alles unter Aufträge → Erinnerungen.
// Am Handy bleibt das bisherige Fenster (memoryOverlay in chapter-ui.js).
import {memoryArtFor} from './memory-art.js';
import {MEMORY_CARD as T} from './content/index.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CARD_WIDTH=300,CARD_GAP=10;

/** Platz der Karte aus den sichtbaren HUD-Rechtecken (Viewport-Pixel): rechts bündig mit der Spalte aus Minikarte und Verfolgung,
 *  oben unter ihr, unten über Menüleiste/EP-Leiste. `column` und `floor` sind Rechtecke {left,right,top,bottom}. Rein, getestet. */
export function cardPlace({width,height,column=[],floor=[]}){
 const col=column.filter(r=>r&&r.left>width*.55);
 const edge=col.length?Math.max(...col.map(r=>r.right)):width-14;
 const right=Math.max(8,Math.round(width-edge));
 const top=Math.round((col.length?Math.max(...col.map(r=>r.bottom)):80)+CARD_GAP);
 const left=width-right-CARD_WIDTH;
 const low=floor.filter(r=>r&&r.top>height*.5&&r.right>left&&r.left<width-right);
 const bottom=Math.round((low.length?Math.min(...low.map(r=>r.top)):height)-CARD_GAP);
 return {right,top,maxHeight:Math.max(0,bottom-top)};
}

export function memoryCardHtml(fragment){
 const art=memoryArtFor(fragment.id),title=esc(fragment.title);
 return `<header class="memory-card-head"><canvas width="48" height="48" data-ui-icon="paper" aria-hidden="true"></canvas><span class="memory-card-label">${esc(T.label)}</span><strong>${title}</strong>`+
  `<button type="button" class="memory-card-close" data-memory-next aria-label="${esc(T.close)}" data-tooltip-label="${esc(T.close)}" data-tooltip-note="${esc(T.closeNote)}">×</button></header>`+
  (art?`<button type="button" class="memory-card-picture" data-memory-card-art aria-label="${title} – ${esc(T.zoom)}" data-tooltip-label="${title}" data-tooltip-note="${esc(T.zoom)}"><img src="${art.src}" width="${art.width}" height="${art.height}" alt="${esc(art.alt)}" decoding="async"></button>`:'')+
  `<p>${esc(fragment.text)}</p>`;
}

/** Karte in `shell` einhängen. onClose(fragment, grund) nach jedem Schließen, onZoom(fragment) beim Klick aufs Bild. */
export function mountMemoryCard(shell,{onClose,onZoom,paint}={}){
 const el=document.createElement('aside');el.className='memory-card';el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 shell.append(el);let current=null;
 const rect=sel=>{const e=document.querySelector(sel);if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return r.width&&r.height?r:null;};
 function place(){
  if(!current)return;
  const p=cardPlace({width:innerWidth,height:innerHeight,column:['.minimap','#miniButton','.quest-panel'].map(rect),floor:['.game-menu-rail','.xp-track','#combatMeter'].map(rect)});
  const s=el.style;for(const [k,v] of [['right',p.right],['top',p.top],['maxHeight',p.maxHeight]])if(s[k]!==v+'px')s[k]=v+'px';
  // Reicht die Höhe nicht (lange Verfolgung, kleiner Schirm), wird zuerst das Bild flacher, zuletzt fällt es weg – der Text bleibt.
  // Läuft alle 100 ms mit (updateUI): nur schreiben, was sich ändert.
  const pic=el.querySelector('.memory-card-picture');if(!pic)return;
  const shown=pic.hidden?0:pic.offsetHeight,rest=el.scrollHeight-shown,natural=Math.round((pic.hidden?el.clientWidth:pic.offsetWidth)*2/3),frame=el.offsetHeight-el.clientHeight,h=Math.min(natural,p.maxHeight-frame-rest),hide=h<56;
  if(pic.hidden!==hide)pic.hidden=hide;if(!hide&&pic.style.height!==h+'px')pic.style.height=h+'px';
 }
 function show(fragment){
  current=fragment;el.innerHTML=memoryCardHtml(fragment);el.setAttribute('aria-label',T.label+': '+fragment.title);el.hidden=false;paint?.(el);place();
  el.querySelector('img')?.addEventListener('load',place,{once:true});
  el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));
 }
 function close(reason='close'){if(!current)return false;const f=current;current=null;el.classList.remove('show');el.hidden=true;el.innerHTML='';onClose?.(f,reason);return true;}
 el.addEventListener('click',e=>{if(e.target.closest('[data-memory-next]')){close('close');return;}if(e.target.closest('[data-memory-card-art]')){const f=current;close('zoom');onZoom?.(f);}});
 addEventListener('resize',place);
 return {show,close,place,el,get open(){return !!current;},get fragment(){return current;}};
}
