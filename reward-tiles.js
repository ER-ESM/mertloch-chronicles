// Belohnung als Kacheln wie im WoW-Questfenster (Runde 2, 2026-09-24): 36-px-Slots für Erfahrung, Pfandmarken, Gegenstand und
// „Ausrüstung nach Wahl“, die Zahl unten rechts in der Kachel, Name und Wirkung nur im Tooltip. Ein Satz „600 EP · 25 Pfandmarken …“
// steht im aria-label der Reihe (Vorlesen, Prüfungen), nicht auf dem Schirm.
import {QUESTLOG_UI as T} from './content/index.js';
import {deNum} from './number-format.js';
import {itemArt} from './rpg-ui.js';
import {ITEMS} from './rpg.js';
import {ICON_STEP} from './icon-steps.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Symbol 32 in der 36er-Kachel (2 px Rand), 1:1 (icon-steps.js). Gegenstände über itemArt wie im Rucksack. */
const px=ICON_STEP.reward,cv=attrs=>`<canvas width="${px}" height="${px}" ${attrs} aria-hidden="true"></canvas>`;
const tile=(cls,art,label,note,count='')=>`<span class="rt-tile ${cls}" tabindex="0" data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}">${art}${count!==''?`<b>${esc(count)}</b>`:''}</span>`;
/** r = {xp, coins, items:[itemId], relic, relicEffect, choice:bool, note}. summary = gesprochene Zeile (aria-label). */
export function rewardTiles(r={},summary=''){
 const out=[];
 if(r.xp)out.push(tile('rt-xp',cv('data-ui-icon="ui-levelup-crest"'),T.xp(deNum(r.xp)),'',deNum(r.xp)));
 if(r.coins)out.push(tile('rt-coins',cv('data-ui-icon="coins"'),T.coins(deNum(r.coins)),'',deNum(r.coins)));
 for(const id of r.items||[]){const it=ITEMS[id];if(!it)continue;out.push(tile('rt-item '+esc(it.rarity||''),cv(`data-item-art="${esc(itemArt(id))}"`),it.name,it.description||''));}
 if(r.relic)out.push(tile('rt-item rt-relic',cv('data-ui-icon="reward"'),r.relic,r.relicEffect||''));
 if(r.choice)out.push(tile('rt-choice',cv('data-ui-icon="bag"'),T.choice,T.choiceNote));
 if(!out.length)return '';
 return `<div class="reward-tiles" role="group" aria-label="${esc(summary||'')}">${out.join('')}${r.note?`<small class="rt-note" hidden>${esc(r.note)}</small>`:''}</div>`;
}
