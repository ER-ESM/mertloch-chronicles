// Anbindung der Dungeon-Oberfläche an das Spiel (Etappe 2 „Lesbar wie WoW“, E-71): Eingangskarte, Übergang, Journal.
// app.js ruft nur mountDungeonUI() und an drei Stellen openEntry/leave/openJournal – alles andere bleibt hier.
// Fenster im Einzelfenster-System (E-67): „dungeonEntry“ und „journal“ stehen mittig (popup-windows.js GRID_OVERLAY),
// das Journal darf neben offenen Fenstern (Karte) stehen. Am Handy zeigt Tippen auf ein Symbol seinen Tooltip als Detail.
import {DUNGEONS,DUNGEON_TEXT as T,DUNGEON_UI as U} from './content/index.js';
import {entryCard,dungeonTransition} from './dungeon-entry.js';
import {journalPanel,paintDungeonIcons,paintBossPortraits} from './dungeon-journal.js';
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
 /** Nach Anheuern/Entlassen: offene Karte nachziehen. */
 function refresh(){if(entryId&&api.popups.isOpen('dungeonEntry')){const w=api.popups.get('dungeonEntry'),key=(api.game().companions||[]).map(c=>c.id).join('|');if(w.body.dataset.party!==key){renderEntry(entryId);api.popups.get('dungeonEntry').body.dataset.party=key;}}}
 return {openEntry,enter,leave,openJournal,refresh,busy:()=>busy,journalOpen:()=>api.popups.isOpen('journal')?journalBoss:null};
}
