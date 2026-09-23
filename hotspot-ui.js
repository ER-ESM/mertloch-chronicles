// Startreihe (E-55): Dialog am Geber, Aushang, Questbuch-Einträge und Tracker. Texte aus content/hotspots.js.
import {HOTSPOT_UI as T,ITEM_CATALOG,NPCS} from './content/index.js';
import {hotspotQuests,questStatus,giverOffers,giverPoint,turnInOf,objectiveText,hotspotQuest,fillText} from './hotspots.js';
import {conversationHeader} from './dialogue-ui.js';
import {escapeQuest as esc} from './quest-status-ui.js';

const rewardText=q=>{const r=q.reward||{};return [r.xp&&r.xp+' Erfahrung',r.coins&&r.coins+' Pfandmarken',r.item&&ITEM_CATALOG[r.item]?.name].filter(Boolean).join(' · ');};
const seriesName=q=>q.regular?T.regulars:T.series;
const dropNote=q=>q.objective.kind==='drop'?' <small class="hotspot-drop">'+esc(T.dropHint(q.objective.chance))+'</small>':'';
function card(g,q,action){const st=questStatus(g,q.id),line=fillText(g,q,action==='claim'?q.lines?.done:st==='accepted'?q.lines?.progress:q.lines?.offer),at=giverPoint(g,turnInOf(q));
 const button=action==='accept'?`<button class="gold-button" data-hs-accept="${q.id}">${T.accept}</button>`:action==='claim'?`<button class="gold-button" data-hs-claim="${q.id}">${T.claim}</button>`:action==='progress'?`<button class="outline-button" data-hs-track="${q.id}">${T.track}</button>`:`<button class="outline-button" disabled>${esc(T.level(q.minLevel))}</button>`;
 return `<article class="hotspot-offer"><h2>${esc(fillText(g,q,q.title))}</h2><p>${esc(fillText(g,q,q.text))}</p>${line?`<p class="conversation-quote">„${esc(line)}“</p>`:''}<div class="quest-objective">${esc(objectiveText(g,q))}${dropNote(q)}</div>${at&&turnInOf(q)!==q.hotspot?`<small>${esc(T.turnInAt(at.name))}</small>`:''}<div class="loot"><span>✧</span><div><strong>${esc(rewardText(q))}</strong><small>${esc(seriesName(q))}</small></div></div><div class="dialog-actions">${button}</div></article>`;}
/** Gespräch am Hotspot-Geber (oder bei Ida für die letzte Überleitung): Abgaben zuerst, dann neue Aufträge.
 *  `chatter` = Gesprächszeile eines Stammgasts (giverChatter), steht vor den Aufträgen. */
export function hotspotDialogue(g,giverId,chatter=null){const at=giverPoint(g,giverId),offers=giverOffers(g,giverId);
 return `${conversationHeader(at?.npc||giverId,at?.name||NPCS[giverId]?.name||'')}${chatter?`<p class="conversation-quote hotspot-chatter">${esc(chatter)}</p>`:''}${offers.map(o=>card(g,o.q,o.action)).join('')}<div class="dialog-actions"><button class="outline-button" data-close>${T.close}</button></div>`;}
/** Abgaben bei einem Geber als Karten ohne Rahmen – für Idas Hauptquest-Dialog, der sonst jede Abgabe bei ihr verdeckt
 *  (Nutzerbefund 2026-09-23: Ollis Pitch ließ sich bei laufender Hauptquest nicht abgeben). */
export function hotspotTurnIns(g,giverId){return giverOffers(g,giverId).filter(o=>o.action==='claim').map(o=>card(g,o.q,o.action)).join('');}
/** Aushang: Titel, Text, Ziel und Belohnung – der Auftrag läuft bereits. */
export function noticeDialogue(g,id){const q=hotspotQuest(id),st=questStatus(g,id);
 return `<header class="conversation-header"><span class="eyebrow">${esc(T.notices)}</span><strong>${esc(q.found)}</strong></header><h2>${esc(q.title)}</h2><p>${esc(q.text)}</p><div class="quest-objective">${esc(objectiveText(g,q))}${dropNote(q)}</div>${st==='low'||st==='locked'?`<p class="requirements-failed">${esc(T.level(q.minLevel))}</p>`:''}<div class="loot"><span>✧</span><div><strong>${esc(rewardText(q))}</strong><small>${esc(T.notices)}</small></div></div><div class="dialog-actions">${st==='accepted'?`<button class="gold-button" data-hs-track="${id}">${T.track}</button>`:''}<button class="outline-button" data-close>${T.close}</button></div>`;}
/** Einträge fürs Questbuch: aktiv = angenommen/fertig, offen = annehmbar, erledigt = abgegeben. */
export function hotspotQuestEntries(g,filter){const want=st=>filter==='all'||filter==='active'&&(st==='accepted'||st==='ready')||filter==='open'&&(st==='available'||st==='low')||filter==='done'&&st==='claimed';
 return hotspotQuests().filter(q=>want(questStatus(g,q.id))).map(q=>{const st=questStatus(g,q.id),tracked=g.hotspots.tracked===q.id,at=q.notice?null:giverPoint(g,st==='ready'||st==='accepted'?turnInOf(q):q.hotspot);
  return `<article class="quest-entry hotspot-entry ${tracked?'tracked':''}"><span class="eyebrow">${esc(q.notice?T.notices:seriesName(q))}${at?' · '+esc(at.name):''}</span><h3>${esc(fillText(g,q,q.title))}</h3><div class="quest-objective">${esc(st==='ready'&&at?T.turnInAt(at.name):objectiveText(g,q))}</div>${st==='low'?`<small class="requirements-failed">${esc(T.level(q.minLevel))}</small>`:''}<div class="quest-reward">${esc(rewardText(q))}</div><div class="quest-entry-actions">${st==='accepted'||st==='ready'?`<button class="${tracked?'outline-button':'gold-button'}" data-hs-track="${q.id}">${T.track}</button>`:''}${at?`<button class="outline-button" data-hs-route="${q.id}">${esc(st==='accepted'||st==='ready'?T.route:T.toGiver)}</button>`:''}</div></article>`;}).join('');}
export const hotspotActiveCount=g=>hotspotQuests().filter(q=>['accepted','ready'].includes(questStatus(g,q.id))).length;
export const hotspotDoneCount=g=>hotspotQuests().filter(q=>questStatus(g,q.id)==='claimed').length;
/** Tracker oben rechts für den verfolgten Auftrag der Startreihe. */
export function hotspotTracker(g){const id=g.hotspots?.tracked,q=id&&hotspotQuest(id);if(!q||g.trackedQuest)return null;const st=questStatus(g,id);if(st!=='accepted'&&st!=='ready')return null;
 const at=q.notice?null:giverPoint(g,turnInOf(q));return {title:fillText(g,q,q.title),task:st==='ready'&&at?T.turnInAt(at.name):objectiveText(g,q),reward:rewardText(q)};}
