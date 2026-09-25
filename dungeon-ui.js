// Anbindung der Dungeon-Oberfläche an das Spiel (Etappe 2 „Lesbar wie WoW“, E-71): Eingangskarte, Übergang, Journal.
// app.js ruft nur mountDungeonUI() und an drei Stellen openEntry/leave/openJournal – alles andere bleibt hier.
// Fenster im Einzelfenster-System (E-67): „dungeonEntry“ und „journal“ stehen mittig (popup-windows.js GRID_OVERLAY),
// das Journal darf neben offenen Fenstern (Karte) stehen. Am Handy zeigt Tippen auf ein Symbol seinen Tooltip als Detail.
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_TEXT as T,DUNGEON_UI as U} from './content/index.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {entryCard,dungeonTransition} from './dungeon-entry.js';
import {journalPanel,paintDungeonIcons,paintBossPortraits,dicon} from './dungeon-journal.js';
import {showPanelDetail} from './panel-pages.js';
import {paintUnitPortraits} from './unit-frame.js';

const touch=()=>document.body.classList.contains('touch-mode');
export function mountDungeonUI(api){
 // api: {game, popups, openModal, paint, events, save, toast, showPanel, unlocked}
 let entryId=null,journalBoss=null,busy=false;
 function paintAll(w){if(!w?.body)return;paintDungeonIcons(w.body);paintBossPortraits(w.body,api.game()?.time||0);paintUnitPortraits(w.body);api.paint?.();}
 /** Handy: Tippen auf ein Symbol mit Tooltip zeigt dessen Text als Detail (die Maus-Tooltips gibt es dort nicht). */
 function touchTip(e){if(!touch())return false;const el=e.target.closest('[data-tooltip-label]');if(!el)return false;showPanelDetail('<p>'+(el.dataset.tooltipNote||'')+'</p>',el.dataset.tooltipLabel);return true;}
 // ── Eingangskarte
 function renderEntry(id){const g=api.game();entryId=id;const w=api.openModal(entryCard(g,id,{talents:api.unlocked?.('talents')!==false}),false,'dungeonEntry');w.cleanup=()=>{entryId=null;};paintAll(w);
  w.body.onclick=e=>{const b=e.target.closest('button');if(!b){touchTip(e);return;}
   if('dgEnter' in b.dataset){enter(id);return;}
   if('dgJournal' in b.dataset){openJournal(null,id);return;}
   if('dgTalents' in b.dataset){api.popups.close('dungeonEntry');api.showPanel('talents');return;}
   if(b.dataset.dgHire){if(b.getAttribute('aria-disabled')==='true'){api.toast(U.entry.noMoney,true);return;}const r=g.hireCompanion(b.dataset.dgHire);api.events();if(r?.ok)renderEntry(id);return;}
   touchTip(e);};
  return w;}
 /** F am Rolltor: Karte öffnen; steht sie schon offen, heißt F „Betreten“ (Tastatur wie im Gruppenbrowser). */
 function openEntry(id='schloss-bigb'){if(api.popups.isOpen('dungeonEntry')&&entryId===id){enter(id);return;}renderEntry(id);}
 function enter(id=entryId||'schloss-bigb'){
  const g=api.game(),def=DUNGEONS[id];if(busy||!g||!def)return;
  if(g.player.level<def.level.enter){api.toast(T.tooLow(def.level.enter));return;}
  if(g.dead||g.player.inCombat>0||g.casting){api.toast(T.busy);return;}
  api.popups.close('dungeonEntry');busy=true;
  dungeonTransition('enter',()=>{const ok=g.enterDungeon(id);api.events();return ok;},{caption:T.welcome}).finally(()=>{busy=false;});
 }
 function leave(){const g=api.game();if(busy||!g)return;busy=true;
  dungeonTransition('leave',()=>{const ok=g.leaveDungeon();api.events();if(ok)api.save();return ok;},{caption:T.outside}).finally(()=>{busy=false;});}
 // ── Journal
 function openJournal(bossId=null,dungeonId='schloss-bigb'){const g=api.game();journalBoss=bossId;const w=api.openModal(journalPanel(g,bossId,dungeonId),false,'journal');w.cleanup=()=>{journalBoss=null;};api.popups.focus('journal');paintAll(w);
  w.body.onclick=e=>{const tab=e.target.closest('[data-dj-boss]');if(tab){if(!tab.disabled)openJournal(tab.dataset.djBoss,dungeonId);return;}touchTip(e);};
  return w;}
 globalThis.__dgOpenJournal=(id)=>openJournal(id);/* Prüfzugang (scripts/dungeon-e2-check.mjs) */
 /** Nach Anheuern/Entlassen: offene Karte nachziehen. */
 function refresh(){if(entryId&&api.popups.isOpen('dungeonEntry')){const w=api.popups.get('dungeonEntry'),key=(api.game().companions||[]).map(c=>c.id).join('|');if(w.body.dataset.party!==key){renderEntry(entryId);api.popups.get('dungeonEntry').body.dataset.party=key;}}}
 /** Verfolgung im Dungeon (statt Weltauftrag): Siegel und Beweise als Felder, dazu der nächste lebende Boss; Klick öffnet dessen Journal. */
 function tracker(panel){const body=panel?.querySelector('.qt-body'),g=api.game(),run=g?.instance?.run;if(!body||!run)return;const def=run.def,seals=def.doors.find(d=>d.lock?.seals)?.lock.seals||[],ev=run.evidence?.size||0,boss=def.bosses.find(b=>DUNGEON_BOSSES[b.id]&&!run.killed.has(b.id));
  const html=`<div class="qt-quest is-focus dg-track" data-tooltip-label="${esc(def.name)}" data-tooltip-note="${esc(U.tracker.sealNote)}"><b id="questTitle" class="qt-title">${esc(def.name)}</b><div id="questTasks">`
   +`<div class="quest-task dg-track-row" data-tooltip-label="${esc(U.tracker.seals)}" data-tooltip-note="${esc(U.tracker.sealNote)}"><span class="dg-track-icons">${seals.map(s=>dicon(run.seals.has(s)?'seal':'seal-empty',18)).join('')}</span><b class="qt-count">${run.seals.size}/${seals.length}</b></div>`
   +`<div class="quest-task dg-track-row" data-tooltip-label="${esc(U.tracker.proofs)}" data-tooltip-note="${esc(U.tracker.proofNote)}"><span class="dg-track-icons">${[0,1,2].map(i=>dicon(ev>i?'lens':'lens-empty',18)).join('')}</span><b class="qt-count">${ev}/3</b></div>`
   +(boss?`<div class="quest-task dg-track-row dg-track-boss" role="button" tabindex="0" data-dg-track-boss="${esc(boss.id)}" data-tooltip-label="${esc(DUNGEON_BOSSES[boss.id].name)}" data-tooltip-note="${esc(U.map.bossNote)}"><span class="dg-track-icons">${dicon('skull',18)}</span><span>${esc(DUNGEON_BOSSES[boss.id].name)}</span></div>`:'')
   +`</div></div><div id="questOthers" class="quest-others"></div>`;
  if(body.dataset.sig===html)return;body.dataset.sig=html;body.innerHTML=html;paintDungeonIcons(body);
  if(!body.dataset.dgBound){body.dataset.dgBound='1';body.addEventListener('click',e=>{const b=e.target.closest('[data-dg-track-boss]');if(b){e.stopPropagation();openJournal(b.dataset.dgTrackBoss);}});}}
 return {openEntry,enter,leave,openJournal,refresh,tracker,busy:()=>busy,journalOpen:()=>api.popups.isOpen('journal')?journalBoss:null};
}
