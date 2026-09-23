// Kniffe-Buch: Eigenarten und Leisten als Kacheln im Schema der Kniffe (Nutzerwünsche 2026-09-23: Passives wie „Rausch“ müssen im
// Skillbuch nachlesbar sein – aber nicht als Fließtext, sondern mit Icon wie die Kniffe, anderer Hintergrund, nicht in die Leiste
// ziehbar). Erklärung, Zahlen, Herkunft und Kniff-Ersetzungen stehen im Hover-Tooltip (data-describe → describe.js).
import {SPECS,CLASS_SPECS,GLOSSARY,PASSIVE_BOOK_UI as T} from './content/index.js';
import {mechanicHelp,TERM_SPECS} from './mechanic-help.js';
import {iconMarkup} from './describe-ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Begriffe (Glossar), die zur Kernmechanik eines Baums gehören – z. B. Rausch, Kater und Deckel-Uhr beim Kneipenschläger. */
export const specTerms=spec=>Object.keys(TERM_SPECS).filter(id=>TERM_SPECS[id]===spec&&GLOSSARY[id]).map(id=>({id,...GLOSSARY[id]}));

const tile=({describe,icon,name,origin,on})=>`<button type="button" class="book-skill icon-skill passive-tile ${on?'is-on':'locked'}" data-describe="${esc(describe)}" draggable="false" aria-label="${esc(name+' · '+origin)}">${icon}<span class="book-skill-name">${esc(name)}</span><span class="book-skill-origin">${esc(origin)}</span></button>`;

export function passiveBook(g){
 const main=g.rpg?.talents?.spec,cls=g.member.id,tiles=[tile({describe:'passive:'+cls,icon:iconMarkup({set:'clan',member:cls}),name:T.classTitle(g.member.name),origin:T.classScope,on:true})];
 for(const spec of CLASS_SPECS[cls]||[]){const h=mechanicHelp(g,spec);if(!h)continue;const on=main===spec,origin=on?T.active(SPECS[spec].name):T.withMain(SPECS[spec].name),art=`<canvas width="64" height="64" data-spec-art="${esc(spec)}" aria-hidden="true"></canvas>`;
  tiles.push(tile({describe:'mechanic:'+spec,icon:art,name:h.name,origin,on}));
  for(const t of specTerms(spec))tiles.push(tile({describe:'glossary:'+t.id,icon:art,name:t.name,origin,on}));}
 return `<section class="book-passives" aria-label="${esc(T.title)}"><h3>${esc(T.title)}</h3><div class="icon-skillbook passive-book">${tiles.join('')}</div></section>`;
}
