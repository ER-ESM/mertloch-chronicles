// Kniffe-Buch: Eigenarten und Leisten (Nutzerwunsch 2026-09-23: „Passives wie Rausch müssen im Skillbuch sichtbar sein, damit man
// immer nachlesen kann, was woher kommt und wie es funktioniert“). Klassen-Eigenart und die Kernmechanik aller drei Bäume der Klasse:
// was sie tut, ob sie gerade wirkt (Hauptbaum) und welche Kniffe der Hauptbaum ersetzt. Texte kommen aus mechanic-help.js.
import {SPECS,CLASS_SPECS,GLOSSARY,PASSIVE_BOOK_UI as T} from './content/index.js';
import {mechanicHelp,passiveHelp,kitSwaps,TERM_SPECS} from './mechanic-help.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Begriffe (Glossar), die zur Kernmechanik eines Baums gehören – z. B. Rausch, Kater und Deckel-Uhr beim Kneipenschläger. */
export const specTerms=spec=>Object.keys(TERM_SPECS).filter(id=>TERM_SPECS[id]===spec&&GLOSSARY[id]).map(id=>({id,...GLOSSARY[id]}));

export function passiveBook(g){
 const main=g.rpg?.talents?.spec,specs=CLASS_SPECS[g.member.id]||[];
 const own=`<article class="book-passive active" id="book-passive-${esc(g.member.id)}"><header><b>${esc(T.classTitle(g.member.name))}</b><small>${esc(T.classScope)}</small></header><p>${esc(passiveHelp(g))}</p></article>`;
 const trees=specs.map(spec=>{const h=mechanicHelp(g,spec);if(!h)return '';const on=main===spec,swaps=kitSwaps(g,spec),terms=specTerms(spec);
  return `<details class="book-passive ${on?'active':''}" id="book-passive-${esc(spec)}" ${on?'open':''}><summary><b>${esc(h.name)}</b><small>${esc(SPECS[spec].name)} · ${esc(on?T.active:T.withMain(SPECS[spec].name))}</small></summary>`+
   (terms.length?`<p class="book-terms">${terms.map(t=>`<span class="book-term" title="${esc(t.short)}">${esc(t.name)}</span>`).join('')}</p>`:'')+
   h.lines.map(l=>`<p>${esc(l)}</p>`).join('')+
   (swaps.length?`<p class="book-swaps"><b>${esc(T.swaps)}</b> ${swaps.map(k=>`${esc(k.role)} „${esc(k.replaces)}“ → „${esc(k.name)}“`).join(' · ')}</p>`:'')+
   terms.map(t=>`<p class="book-term-long"><b>${esc(t.name)}:</b> ${esc(t.long||t.short)}</p>`).join('')+
   `<small class="book-scope">${esc(h.scope)}</small></details>`;}).join('');
 return `<section class="book-passives" aria-label="${esc(T.title)}"><h3>${esc(T.title)}</h3><p class="book-passives-hint">${esc(main?T.hint:T.hintNoMain)}</p>${own}${trees}</section>`;
}
