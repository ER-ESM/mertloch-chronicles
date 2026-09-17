// Akt-1-Oberflächen: Ida je Kapitel, Erinnerungsfetzen, Basisbau, Kapitelliste.
// Kein Text steht hier: Titel, Zeilen, Namen, Zahlen und Vorteile kommen aus content/ und dem Spielzustand.
import {conversationHeader} from './dialogue-ui.js';
import {escapeQuest as esc} from './quest-status-ui.js';
import {distance} from './world.js';
import {countItem,ITEMS} from './rpg.js';
import {ACTS,STORY,STORY_CHAPTERS,MAIN_DIALOGUE,chapterDialogue,MEMORY_FRAGMENTS,SYSTEM_LINES,LORE,BUILDINGS,BUILDING_EFFECTS,buildingsUnlocked,NPCS,FACTIONS} from './content/index.js';

/** Akt des laufenden Kapitels. */
export const actOf=chapter=>ACTS.find(a=>a.chapters.includes(chapter))||ACTS[0];
/** Kapitel eines Akts ohne Reservekapitel späterer Akte. */
export const actChapterList=act=>STORY_CHAPTERS.filter(c=>!c.reserve&&act.chapters.includes(c.id));
/** Beschriftung der Erinnerungen aus der vorhandenen Systemzeile ableiten statt sie hier zu erfinden. */
export const MEMORY_LABEL=SYSTEM_LINES.memory('').replace(/[:\s]+$/,'');

/** Ein Gesprächszustand eines Kapitels. Kapitel 1 trägt ongoing/reward/claimed neben dem Angebot,
 *  Kapitel 2–4 unter ihrem eigenen Schlüssel – ein Zugriff, keine Sonderfälle. */
export function chapterState(chapter,state){const d=chapterDialogue(chapter);return d?.[state]||MAIN_DIALOGUE.ida[state]||null;}

export const rewardLine=(r={})=>[r.xp?r.xp+' EP':'',r.coins?r.coins+' Pfandmarken':'',r.relic].filter(Boolean).join(' · ');
export const rewardNote=(r={})=>[r.relicEffect,'Ausrüstung nach Wahl'].filter(Boolean).join(' · ');
function rewardBox(chapter){const r=chapter.reward||{};return `<div class="loot"><canvas width="48" height="48" data-ui-icon="reward" aria-label="${esc(r.relic||'')}"></canvas><div><strong>${esc(rewardLine(r))}</strong><small>${esc(rewardNote(r))}</small></div></div>`;}
const lines=d=>(d.lines||[]).map(line=>`<p>${line}</p>`).join('');
const eyebrow=d=>d.eyebrow?`<span class="eyebrow">${esc(d.eyebrow)}</span>`:'';

/** Angebot eines Kapitels (annehmen / ablehnen). */
export function offerDialogue(game,chapter=game.chapter()){const d=chapterDialogue(chapter.id)||{};
 return `${conversationHeader('ida')}${eyebrow(d)}<h2>${esc(d.title||chapter.title)}</h2>${lines(d)}<p class="chapter-summary">${esc(chapter.summary||'')}</p>${rewardBox(chapter)}<div class="dialog-actions"><button class="gold-button" id="acceptQuest">${esc(d.accept||'')}</button><button class="outline-button" data-close>${esc(d.decline||'')}</button></div>`;}
/** Abgabe eines Kapitels: Belohnung abholen. */
export function rewardDialogue(game,chapter=game.chapter()){const d=chapterState(chapter.id,'reward')||{};
 return `${conversationHeader('ida')}${eyebrow(d)}<h2>${esc(d.title||chapter.title)}</h2>${lines(d)}${rewardBox(chapter)}<div class="dialog-actions"><button class="gold-button" id="claimQuest">${esc(d.claim||'')}</button></div>`;}
/** Laufendes oder abgeschlossenes Kapitel: eine Zeile, ein Knopf. */
export function closingDialogue(d){if(!d)return '';
 return `${conversationHeader('ida')}<h2>${esc(d.title||'')}</h2><p>${d.line||''}</p><button class="gold-button" data-close>${esc(d.close||'')}</button>`;}

/** Der eine Ida-Dialog. Zustand kommt aus dem Spielstand, Text immer aus dem Kapitel des Spielstands. */
export function idaDialogue(game){
 const q=game.quest,chapter=game.chapter();
 if(q.actDone||q.chapterClaimed>=q.chapter)return closingDialogue(chapterState(q.chapter,'claimed'));
 if(!q.accepted)return offerDialogue(game,chapter);
 if(game.questReady())return rewardDialogue(game,chapter);
 return closingDialogue(chapterState(q.chapter,'ongoing'));
}

/** Gespräch mit einem Mentor an der Bude (Ereignis mentorTalk). */
export function mentorDialogue(talk){
 return `${conversationHeader(talk.npc,talk.name)}<h2>${esc(talk.name)}</h2><p class="conversation-quote">${esc(talk.line||'')}</p><button class="gold-button" data-close>Weiterziehen</button>`;}

/** Einblendung eines Erinnerungsfetzens (Sepia, eine Schaltfläche, pausiert nichts). */
export function memoryOverlay(fragment){
 return `<article class="memory-flash"><span class="eyebrow">${esc(MEMORY_LABEL)}</span><h2>${esc(fragment.title)}</h2><p>${esc(fragment.text)}</p><div class="dialog-actions"><button class="gold-button" data-memory-next>Weiter</button></div></article>`;}

/** Reiterinhalt „Erinnerungen“: alle Fetzen in ihrer Erzählreihenfolge, ungesehene verdeckt. */
export function memoriesPanel(game){
 const seen=game.memories?.seen||[],order=[...MEMORY_FRAGMENTS].sort((a,b)=>a.order-b.order);
 return `<section class="memory-panel"><header class="rpg-heading"><h2>${esc(MEMORY_LABEL)}</h2><p>${seen.length} / ${order.length}</p></header><div class="memory-list">`+
  order.map(m=>{const known=seen.includes(m.id);
   return `<article class="memory-entry ${known?'known':'unknown'}"><h3>${known?esc(m.title):'…'}</h3>${known?`<p>${esc(m.text)}</p><p class="memory-clue">${esc(m.clue)}</p>`:'<p>…</p>'}</article>`;}).join('')+
  '</div></section>';}

const FLAT_EFFECTS=new Set(['consumableCd','energyOnKill']);
const effectValue=(key,value)=>key==='damageTaken'?'×'+value.toFixed(2):FLAT_EFFECTS.has(key)?'+'+value:'+'+Math.round(value*100)+' %';
/** Übersicht „Was die Bude bringt“ aus den gebauten Stufen. */
export function baseEffectList(game){
 const effects=Object.entries(game.baseEffects());
 if(!effects.length)return '';
 return `<ul class="base-effects">${effects.map(([key,value])=>`<li><b>${esc(effectValue(key,value))}</b> ${esc(BUILDING_EFFECTS[key]||key)}</li>`).join('')}</ul>`;}

/** Gebaut wird nur am Treffpunkt – dieselbe Regel wie der Klamottenwechsel. */
export const canBuild=game=>!game.dead&&game.player.inCombat<=0&&distance(game.player,game.world.spawn)<150;

function stageCost(game,stage){
 return Object.entries(stage.cost).map(([item,need])=>{const have=countItem(game.rpg,item);
  return `<li class="${have>=need?'stat-gain':'requirements-failed'}">${esc(ITEMS[item]?.name||item)} <b>${have} / ${need}</b></li>`;}).join('');}
const enoughMaterial=(game,stage)=>Object.entries(stage.cost).every(([item,need])=>countItem(game.rpg,item)>=need);

/** Reiterinhalt „Bude“: nur freigeschaltete Gebäude, je Gebäude Pate, Stufe, nächste Kosten, Vorteil. */
export function basePanel(game){
 const ids=buildingsUnlocked(game.quest.chapterClaimed),here=canBuild(game);
 if(!ids.length)return `<section class="base-build"><header class="rpg-heading"><h2>${esc(FACTIONS.clan.name)}</h2></header><p class="base-locked">${esc(LORE.destruction)}</p></section>`;
 const cards=ids.map(id=>{
  const b=BUILDINGS[id],level=game.buildings[id]||0,current=level?b.stages[level-1]:null,next=game.nextBuildStage(id),ready=next&&enoughMaterial(game,next);
  return `<article class="build-card" data-building="${esc(id)}"><header><canvas width="48" height="48" data-ui-icon="${esc(b.icon)}" aria-hidden="true"></canvas><div><h3>${esc(b.name)}</h3><small>${esc(NPCS[b.owner]?.name||b.owner)}</small></div></header>`+
   `<p class="build-stage">${current?esc('Stufe '+level+' · '+current.name):'Trümmer'}</p><p>${esc(b.text)}</p>`+
   (next?`<div class="build-next"><b>${esc('Stufe '+next.stage+' · '+next.name)}</b><ul class="build-cost">${stageCost(game,next)}</ul><p class="build-effect">${esc(next.text)}</p><button class="gold-button" data-build="${esc(id)}" ${ready&&here?'':'disabled'}>Ausbauen</button>${ready&&!here?'<small class="requirements-failed">Ausgebaut wird nur an der Bude beim Treffpunkt.</small>':''}</div>`
    :`<p class="build-done">${level>=b.stages.length?'Endausbau erreicht.':'Dafür fehlt noch ein Kapitel.'}</p>`)+
   '</article>';}).join('');
 return `<section class="base-build"><header class="rpg-heading"><h2>${esc(FACTIONS.clan.name)}</h2><p>${esc(FACTIONS.clan.motto)}</p></header>${baseEffectList(game)}<div class="build-grid">${cards}</div></section>`;}

const chapterStatus=(game,chapter)=>game.quest.chapterClaimed>=chapter.id?'erledigt':chapter.id===game.quest.chapter&&!game.quest.actDone?(game.quest.accepted?'läuft':'offen bei '+STORY.giver):'offen';
/** Reiterinhalt „Geschichte“: Akt, Kapitel mit Status, nach Abschluss der Hinweis und die Freischaltungen. */
export function chaptersPanel(game){
 const act=actOf(game.quest.chapter),chapters=actChapterList(act);
 return `<section class="chapter-log"><header class="rpg-heading"><h2>${esc(act.title)}</h2><p>${esc(act.subtitle)}</p></header><div class="chapter-list">`+
  chapters.map(c=>{const claimed=game.quest.chapterClaimed>=c.id,reached=c.id<=game.quest.chapter;
   return `<article class="chapter-entry ${claimed?'done':c.id===game.quest.chapter?'active':'later'}"><h3>${esc(c.title)}</h3><small class="chapter-status">${esc(chapterStatus(game,c))}</small>`+
    (reached?`<p>${esc(c.summary)}</p>`:'')+
    (claimed&&c.clue?`<p class="chapter-clue"><b>Was wir wissen:</b> ${esc(c.clue)}</p>`:'')+
    (claimed&&c.unlocks?.length?`<ul class="chapter-unlocks">${c.unlocks.map(u=>`<li>${esc(u)}</li>`).join('')}</ul>`:'')+
    '</article>';}).join('')+
  '</div></section>';}
