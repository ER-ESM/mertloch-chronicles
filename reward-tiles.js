// Belohnung als Kacheln wie im WoW-Questfenster (Runde 2, 2026-09-24): 36-px-Slots für Erfahrung, Pfandmarken, Gegenstand und
// „Ausrüstung nach Wahl“, die Zahl unten rechts in der Kachel, Name und Wirkung nur im Tooltip. Ein Satz „600 EP · 25 Pfandmarken …“
// steht im aria-label der Reihe (Vorlesen, Prüfungen), nicht auf dem Schirm.
import {ITEM_CATALOG,QUESTLOG_UI as T} from './content/index.js';
import {deNum} from './number-format.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tile=(cls,art,label,note,count='')=>`<span class="rt-tile ${cls}" tabindex="0" data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}">${art}${count!==''?`<b>${esc(count)}</b>`:''}</span>`;
/** r = {xp, coins, items:[itemId], relic, relicEffect, choice:bool, note}. summary = gesprochene Zeile (aria-label). */
export function rewardTiles(r={},summary=''){
 const out=[];
 if(r.xp)out.push(tile('rt-xp','<canvas width="48" height="48" data-ui-icon="ui-levelup-crest" aria-hidden="true"></canvas>',T.xp(deNum(r.xp)),'',deNum(r.xp)));
 if(r.coins)out.push(tile('rt-coins','<canvas width="48" height="48" data-ui-icon="coins" aria-hidden="true"></canvas>',T.coins(deNum(r.coins)),'',deNum(r.coins)));
 for(const id of r.items||[]){const it=ITEM_CATALOG[id];if(!it)continue;out.push(tile('rt-item '+esc(it.rarity||''),`<canvas width="48" height="48" data-item-art="${esc(it.icon||id)}" aria-hidden="true"></canvas>`,it.name,it.description||''));}
 if(r.relic)out.push(tile('rt-item rt-relic','<canvas width="48" height="48" data-ui-icon="reward" aria-hidden="true"></canvas>',r.relic,r.relicEffect||''));
 if(r.choice)out.push(tile('rt-choice','<canvas width="48" height="48" data-ui-icon="bag" aria-hidden="true"></canvas>',T.choice,T.choiceNote));
 if(!out.length)return '';
 return `<div class="reward-tiles" role="group" aria-label="${esc(summary||'')}">${out.join('')}${r.note?`<small class="rt-note" hidden>${esc(r.note)}</small>`:''}</div>`;
}
