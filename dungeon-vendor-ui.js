// Händler Vermieter Volker (Dungeon Etappe 4 Teil B, E-71; Analyse Verbesserung 7, Plan 4.4): tauscht Siegelmarken gegen gezielte Teile
// aus den Beutetabellen des Schlosses – Pech-Ausgleich wie Wappen in WoW. Ein Einzelfenster ohne Scrollen: Kopf mit Volker und dem
// Markenstand, darunter je Ware ein Feld mit Symbol und Preis; was die Ware ist, steht im Gegenstands-Tooltip, der Rest im Tooltip.
// Die Ware kommt aus den Daten (dungeon.js vendorStock): Dorflegenden der gebauten Bosse, dazu der Hafersack, sobald es ihn gibt.
import {vendorStock,vendorBuy,dungeonMarks} from './dungeon.js';
import {DUNGEON_E4B as U} from './content/index.js';
import {dicon,paintDungeonIcons} from './dungeon-journal.js';
import {ITEMS} from './rpg.js';
import {itemArt} from './rpg-ui.js';
import {paintPersonPortraits} from './person-art.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(label,note='')=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;

/** Fensterinhalt: Kopf (Volker, Siegelmarken), Waren als Felder mit Symbol und Preis. */
export function vendorPanel(g){
 const V=U.vendor,marks=dungeonMarks(g),stock=vendorStock(g);
 const tiles=stock.map(o=>{const state=o.locked?'locked':o.owned?'owned':o.affordable?'':'poor',note=o.locked?V.lockedNote:o.owned?V.ownedNote:o.affordable?V.buyNote(o.price):V.poorNote(o.price-marks);
  return `<div class="dv-offer ${state}" data-dv-offer="${esc(o.id)}"><button type="button" class="dv-item" ${o.item&&ITEMS[o.item]?`data-tooltip-item="${esc(o.item)}"`:tip(o.name,V.lockedNote)} aria-label="${esc(o.name)}"><canvas width="48" height="48" data-item-art="${esc((o.item&&itemArt(o.item))||'bag')}" aria-hidden="true"></canvas>${o.owned?dicon('skull-dead',14,'dv-owned'):''}${o.count>1?`<small>×${o.count}</small>`:''}</button>`
   +`<button type="button" class="dv-buy" data-dv-buy="${esc(o.id)}" ${o.locked||o.owned||!o.affordable?'aria-disabled="true"':''} ${tip(o.name+' · '+o.price+' '+V.marks,note)}>${dicon('seal',14)}<b>${o.price}</b></button></div>`;}).join('');
 return `<span hidden data-ui-window-title="${esc(V.name)}"></span><div class="dv-vendor" data-dv-vendor>
<div class="dv-head"><span class="dv-face" ${tip(V.name,V.hello)}><canvas width="96" height="96" data-person-art="${esc(V.look)}" aria-hidden="true"></canvas></span><span class="dv-marks" ${tip(V.marks,V.marksNote)}>${dicon('seal',20)}<b>${marks}</b></span></div>
<div class="dv-grid" aria-label="${esc(V.stock)}">${tiles||`<span class="dv-empty" ${tip(V.stock,V.emptyNote)}>${dicon('loot',20,'dim')}</span>`}</div></div>`;
}

/** Fenster öffnen, Tausch per Klick auf den Preis. api: {game, openModal, paint, toast, save, events} */
export function mountVendor(api){
 function paint(w){if(!w?.body)return;paintDungeonIcons(w.body);paintPersonPortraits(w.body);api.paint?.();}
 function open(){const g=api.game();if(!g)return null;const w=api.openModal(vendorPanel(g),false,'volker');paint(w);
  w.body.onclick=e=>{const b=e.target.closest('[data-dv-buy]');if(!b)return;const r=vendorBuy(g,b.dataset.dvBuy);api.toast?.(r.message,!r.ok);if(r.ok){api.events?.();api.save?.();open();}};
  return w;}
 return {open};
}
