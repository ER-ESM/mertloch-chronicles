// Anbindung der Dungeon-Oberfläche an das Spiel (Etappe 2 „Lesbar wie WoW“, E-71): Eingangskarte, Übergang, Journal.
// app.js ruft nur mountDungeonUI() und an drei Stellen openEntry/leave/openJournal – alles andere bleibt hier.
// Fenster im Einzelfenster-System (E-67): „dungeonEntry“ und „journal“ stehen mittig (popup-windows.js GRID_OVERLAY),
// das Journal darf neben offenen Fenstern (Karte) stehen. Am Handy zeigt Tippen auf ein Symbol seinen Tooltip als Detail.
import {requiredSeals,dungeonAct,e4bState,dungeonToday} from './dungeon.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_TEXT as T,DUNGEON_UI as U,DUNGEON_E4B as U4} from './content/index.js';
import {mountVendor} from './dungeon-vendor-ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {entryCard,dungeonTransition} from './dungeon-entry.js';
import {journalPanel,paintDungeonIcons,paintBossPortraits,dicon} from './dungeon-journal.js';
import {showPanelDetail} from './panel-pages.js';
import {paintUnitPortraits} from './unit-frame.js';

const touch=()=>document.body.classList.contains('touch-mode');
export function mountDungeonUI(api){
 // api: {game, popups, openModal, paint, events, save, toast, showPanel, unlocked}
 let entryId=null,journalBoss=null,journalBack=null,busy=false;
 /* Etappe 4 Teil B: Händler Vermieter Volker (eigenes Fenster) und die F-Ziele Truhe, Beweis, Ereignis, Vorlegen */
 const vendor=mountVendor({game:api.game,openModal:api.openModal,paint:api.paint,toast:api.toast,save:api.save,events:api.events});
 function act(it){const g=api.game();if(!g)return null;const r=dungeonAct(g,it);if(r?.vendor&&r.ok)vendor.open();return r;}
 function paintAll(w){if(!w?.body)return;paintDungeonIcons(w.body);paintBossPortraits(w.body,api.game()?.time||0);paintUnitPortraits(w.body);api.paint?.();}
 /** Handy: Tippen auf ein Symbol mit Tooltip zeigt dessen Text als Detail (die Maus-Tooltips gibt es dort nicht). */
 function touchTip(e){if(!touch())return false;const el=e.target.closest('[data-tooltip-label]');if(!el)return false;showPanelDetail('<p>'+(el.dataset.tooltipNote||'')+'</p>',el.dataset.tooltipLabel);return true;}
 // ── Eingangskarte
 function renderEntry(id){const g=api.game();entryId=id;const w=api.openModal(entryCard(g,id,{talents:api.unlocked?.('talents')!==false}),false,'dungeonEntry');w.cleanup=()=>{entryId=null;};paintAll(w);
  w.body.onclick=e=>{const b=e.target.closest('button');if(!b){touchTip(e);return;}
   if('dgEnter' in b.dataset){enter(id);return;}
   if('dgJournal' in b.dataset){openJournal(null,id,{back:id});return;}
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
 /** back (Hotfix 2026-09-25, Prüfer): von der Eingangskarte geöffnet – das Journal ersetzt sie im Einzelfenster-System; schließt der Spieler
  *  das Journal (X, Esc), kommt die Eingangskarte zurück. Öffnet stattdessen ein anderes Fenster oder beginnt der Dungeon, bleibt es dabei. */
 function openJournal(bossId=null,dungeonId='schloss-bigb',{back=null,keep=false}={}){const g=api.game();journalBoss=bossId;if(!keep)journalBack=back;const w=api.openModal(journalPanel(g,bossId,dungeonId),false,'journal');
  const before=new Set(api.popups.windows?.keys?.()||[]);w.cleanup=()=>{journalBoss=null;const to=journalBack;journalBack=null;if(!to)return;
   setTimeout(()=>{const now=[...(api.popups.windows?.keys?.()||[])];if(busy||api.game()?.instance||now.some(k=>!before.has(k)))return;renderEntry(to);},0);};api.popups.focus('journal');paintAll(w);
  w.body.onclick=e=>{const tab=e.target.closest('[data-dj-boss]');if(tab){if(!tab.disabled&&tab.getAttribute('aria-disabled')!=='true')openJournal(tab.dataset.djBoss,dungeonId,{keep:true});return;}touchTip(e);};
  return w;}
 globalThis.__dgOpenJournal=(id)=>openJournal(id);/* Prüfzugang (scripts/dungeon-e2-check.mjs) */
 /** Nach Anheuern/Entlassen: offene Karte nachziehen. */
 function refresh(){if(entryId&&api.popups.isOpen('dungeonEntry')){const w=api.popups.get('dungeonEntry'),key=(api.game().companions||[]).map(c=>c.id).join('|');if(w.body.dataset.party!==key){renderEntry(entryId);api.popups.get('dungeonEntry').body.dataset.party=key;}}}
 /** Verfolgung im Dungeon (statt Weltauftrag): Siegel und Beweise als Felder, dazu der nächste lebende Boss; Klick öffnet dessen Journal. */
 /** Verfolgung im Dungeon (Etappe 2, Etappe 4 Teil B): Flügel heute (je Flügel das Siegel seines Trägers), Beweise gegen Big B (gefunden
  *  bzw. im Thronsaal vorgelegt) und der nächste lebende Boss (Klick: Journal). Jede Zeile hat ein Wort, jedes Symbol einen Tooltip. */
 function tracker(panel){const body=panel?.querySelector('.qt-body'),g=api.game(),run=g?.instance?.run;if(!body||!run)return;const def=run.def,W=U4.tracker,st=e4bState(g),today=dungeonToday(g,run.id),boss=def.bosses.find(b=>DUNGEON_BOSSES[b.id]&&!run.killed.has(b.id));
  const wings=(def.wings||[]).map(w=>{const b=DUNGEON_BOSSES[w.boss],seal=def.bosses.find(x=>x.id===w.boss)?.seal,done=!!b&&(today.wings.includes(w.id)||run.seals.has(seal));return {w,name:b?.name||'',done,missing:!b};}),built=wings.filter(x=>!x.missing),done=built.filter(x=>x.done).length;
  const ev=st.evidence,got=ev.filter(x=>x.state!=='missing').length,names=U4.evidence;
  const span=(icon,label,note)=>`<span class="dg-track-ico" tabindex="0" data-tooltip-label="${esc(label)}" data-tooltip-note="${esc(note)}">${dicon(icon,18)}</span>`;
  const html=`<div class="qt-quest is-focus dg-track"><b id="questTitle" class="qt-title">${esc(def.name)}</b><div id="questTasks">`
   +`<div class="quest-task dg-track-row" data-tooltip-label="${esc(W.wings)}" data-tooltip-note="${esc(W.wingsNote)}"><span class="dg-track-icons">${wings.map(x=>span(x.done?'seal':x.missing?'seal-empty:dim':'seal-empty',W.wingTip(x.w.name,x.name),x.missing?W.wingMissing:x.done?W.wingDone:W.wingOpen)).join('')}</span><span class="dg-track-word">${esc(U.tracker.seals)}</span><b class="qt-count">${done}/${built.length}</b></div>`
   +`<div class="quest-task dg-track-row" data-tooltip-label="${esc(W.proofs)}" data-tooltip-note="${esc(W.proofsNote)}"><span class="dg-track-icons">${ev.map(x=>span(x.state==='shown'?'lens':x.state==='found'?'lens-found':'lens-empty',names[x.id]?.name||x.id,x.state==='shown'?W.proofShown+' · '+(def.evidence.effects[x.id]?.note||''):x.state==='found'?W.proofFound:W.proofMissing+' · '+(names[x.id]?.hint||''))).join('')}</span><span class="dg-track-word">${esc(U.tracker.proofs)}</span><b class="qt-count">${got}/${ev.length}</b></div>`
   +(boss?`<div class="quest-task dg-track-row dg-track-boss" role="button" tabindex="0" data-dg-track-boss="${esc(boss.id)}" data-tooltip-label="${esc(DUNGEON_BOSSES[boss.id].name)}" data-tooltip-note="${esc(U.map.bossNote)}"><span class="dg-track-icons">${dicon('skull',18)}</span><span>${esc(DUNGEON_BOSSES[boss.id].name)}</span></div>`:'')
   +`</div></div><div id="questOthers" class="quest-others"></div>`;
  if(body.dataset.sig===html)return;body.dataset.sig=html;body.innerHTML=html;paintDungeonIcons(body);
  if(!body.dataset.dgBound){body.dataset.dgBound='1';body.addEventListener('click',e=>{const b=e.target.closest('[data-dg-track-boss]');if(b){e.stopPropagation();openJournal(b.dataset.dgTrackBoss);return;}if(touchTip(e))e.stopPropagation();});}}
 return {openEntry,enter,leave,openJournal,refresh,tracker,act,openVendor:()=>vendor.open(),busy:()=>busy,journalOpen:()=>api.popups.isOpen('journal')?journalBoss:null};
}
