// Eingangskarte am Rolltor und Übergang (Etappe 2 „Lesbar wie WoW“, E-71; Plan §14, Analyse Verbesserung 6, Zielbild C).
// F am Rolltor öffnet die Karte statt sofort zu betreten: Stufenband, Gruppengröße, Bestzeit, fünf Rollenplätze (eigener Held und
// Söldner, freie Plätze heuern direkt an), drei Beute-Symbole, Journal und „Betreten“. Erst „Betreten“ ruft enterDungeon – hinter einem
// kurzen Übergang (Abdunkeln, Name, Aufhellen) statt dem harten Schnitt. Keine Sätze, Erklärungen stehen in den Tooltips.
import {DUNGEONS,DUNGEON_UI as U,DUNGEON_TEXT,COMPANION_ROLES} from './content/index.js';
import {unitPortrait} from './unit-frame.js';
import {levelTone} from './cartography.js';
import {SPECS,talentPoints,spentPoints} from './talents.js';
import {companionSlots} from './companions.js';
import {itemArt} from './rpg-ui.js';
import {ICON_STEP} from './icon-steps.js';
import {dicon,bossLoot} from './dungeon-journal.js';
import {entryChips} from './dungeon-e4b-ui.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(label,note='')=>`data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}"`;
/** Rolle des eigenen Helden aus seiner Spezialisierung (Schutz, Heilung, Schaden). */
export function heroRole(g){const r=SPECS[g?.rpg?.talents?.spec]?.role||'';return /^Tank/.test(r)?'tank':/^(Heilung|Schutz & Heilung)$/.test(r)?'heal':'damage';}
const mmss=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
/** Drei Beute-Symbole für die Karte: je Boss das erste eigene Teil, dann weitere. */
export function entryLoot(id){const out=[];for(const b of DUNGEONS[id].bosses)for(const item of bossLoot(b.id))if(!out.includes(item))out.push(item);return out.slice(0,3);}

/** talents: Talente freigeschaltet (unlocks.js) – nur dann zeigt die Karte unverteilte Punkte. */
export function entryCard(g,id='schloss-bigb',{talents=true}={}){
 const def=DUNGEONS[id],E=U.entry,p=g.player,low=p.level<def.level.enter,rec=g.dungeons?.[id]||{},mid=Math.round((def.level.min+def.level.max)/2);
 const tone=low?'#a4a29a':levelTone(mid-p.level),free=companionSlots(g),role=heroRole(g),size=def.group.size;
 const slots=[`<span class="dg-slot dg-you" data-role="${role}" ${tip(g.heroName||E.you,E.roles[role]+' · '+U.band(p.level,p.level))}>${unitPortrait(g.member?.id||'dieter',p.level)}${dicon('role-'+role,18,'dg-role')}</span>`,
  ...(g.companions||[]).map(c=>`<span class="dg-slot" data-role="${c.def.role}" data-dg-mate="${esc(c.id)}" ${tip(c.name,E.roles[c.def.role])}>${unitPortrait(c.def.look,c.level||p.level)}${dicon('role-'+c.def.role,18,'dg-role')}</span>`)];
 while(slots.length<size)slots.push(`<span class="dg-slot dg-empty" ${tip(E.empty,E.emptyNote)}>${dicon('group',22,'dim')}</span>`);
 const offers=free>0?g.companionOffers().filter(o=>!o.hired):[];
 const hire=offers.length?`<div class="dg-hire" aria-label="${esc(E.hire)}">${offers.map(o=>`<button type="button" class="dg-offer" data-dg-hire="${esc(o.def.id)}" data-role="${o.def.role}" ${o.affordable?'':'aria-disabled="true"'} aria-label="${esc(E.hire+': '+o.def.name+' · '+E.hireNote(o.cost,COMPANION_ROLES[o.def.role].name)+(o.affordable?'':' · '+E.noMoney))}" ${tip(E.hire+': '+o.def.name,E.hireNote(o.cost,COMPANION_ROLES[o.def.role].name)+(o.affordable?'':' · '+E.noMoney))}>${unitPortrait(o.def.look,null)}${dicon('role-'+o.def.role,16,'dg-role')}</button>`).join('')}</div>`:'';
 const loot=entryLoot(id),lootHtml=(loot.length?loot.map(it=>`<span class="dg-loot" tabindex="0" data-tooltip-item="${esc(it)}"><canvas width="${ICON_STEP.dungeonLoot}" height="${ICON_STEP.dungeonLoot}" data-item-art="${esc(itemArt(it))}" aria-hidden="true"></canvas></span>`):Array.from({length:3},()=>`<span class="dg-loot empty" tabindex="0" ${tip(E.loot,E.lootNone)}>${dicon('loot',20,'dim')}</span>`)).join('');
 const points=talents?Math.max(0,talentPoints(g)-spentPoints(g.rpg.talents)):0;
 const best=rec.best>0?mmss(rec.best):'–';
 return `<span hidden data-ui-window-title="${esc(def.name)}"></span><div class="dg-entry" data-dg-entry="${esc(id)}">
<div class="dg-facts"><span class="dg-chip" ${tip(E.band,low?U.from(def.level.enter):U.line(def.name,def.level.min,def.level.max,size))}>${dicon(low?'dungeon-low':'dungeon',20)}<b style="color:${tone}">${esc(U.band(def.level.min,def.level.max))}</b></span><span class="dg-chip" ${tip(E.group,U.heads(size))}>${dicon('group',20)}<b>${size}</b></span><span class="dg-chip" ${tip(E.best,rec.best>0?best:E.bestNone)}>${dicon('clock',20)}<b>${best}</b></span>${entryChips(g,id)/* Etappe 4 Teil B: Flügel heute, Erfolge */}${points>0?`<button type="button" class="dg-chip dg-talents" data-dg-talents aria-label="${esc(E.talents(points))}" ${tip(E.talents(points),E.talentsNote)}>${dicon('talent',20)}<b>${points}</b></button>`:''}</div>
<div class="dg-party" aria-label="${esc(E.group)}">${slots.join('')}</div>
${hire}
<div class="dg-foot"><div class="dg-loots" aria-label="${esc(E.loot)}">${lootHtml}</div><button type="button" class="outline-button dg-journal" data-dg-journal aria-label="${esc(E.journal+' · '+E.journalNote)}" ${tip(E.journal,E.journalNote)}>${dicon('book',26)}</button><button type="button" class="gold-button dg-enter" data-dg-enter ${low?'aria-disabled="true" '+tip(E.low(def.level.enter),E.lowNote):tip(E.enter,E.enterNote)}>${esc(E.enter)}</button></div>
</div>`;
}

/** Übergang Rolltor ↔ Hof: kurz abdunkeln, Name zeigen, im Dunkeln wechseln, aufhellen. run() liefert true bei Erfolg.
 *  Ohne Erfolg (Kampf, Stufe) hellt sofort wieder auf. Bewegungsarm: nur Deckkraft. */
export function dungeonTransition(kind,run,{caption=''}={}){
 let el=document.querySelector('.dg-transition');if(!el){el=document.createElement('div');el.className='dg-transition';el.setAttribute('aria-hidden','true');el.innerHTML='<div class="dg-tr-card"><b></b><small></small></div>';(document.querySelector('#gameShell')||document.body).append(el);}
 el.querySelector('b').textContent=kind==='leave'?U.transition.leave:U.transition.enter;el.querySelector('small').textContent=caption;el.dataset.kind=kind;
 const reduce=matchMedia?.('(prefers-reduced-motion: reduce)').matches,dark=reduce?60:260,hold=reduce?250:650;
 el.classList.remove('out');el.classList.add('show');/* Prüfzugang: wann abgedunkelt, wann gewechselt */const log=(globalThis.__dgTransitions||=[]),entry={kind,shownAt:performance.now(),runAt:0,ok:false};log.push(entry);if(log.length>8)log.shift();
 return new Promise(resolve=>setTimeout(()=>{let ok=false;entry.runAt=performance.now();try{ok=run()!==false;}catch(e){console.error(e);}entry.ok=ok;setTimeout(()=>{el.classList.add('out');el.classList.remove('show');setTimeout(()=>el.classList.remove('out'),420);resolve(ok);},ok?hold:0);},dark));
}
export const welcomeLine=()=>DUNGEON_TEXT.welcome;
export const leaveLine=()=>DUNGEON_TEXT.outside;
