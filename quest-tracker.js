// Quest-Tracker (Nutzerwunsch 2026-09-23): „Es sollen mehr als 1 Quest getrackt werden … Questname + Ziele und wie viel davon
// erledigt ist, mit einem Klick lässt sich diese Quest tracken (+ Info zur Laufdistanz).“ Oben im Auftragsfeld steht weiter die
// verfolgte Quest mit Wegmarke; darunter listet dieses Modul alle anderen laufenden Aufträge kompakt. Ein Klick verfolgt sie.
import {hotspotQuests,questStatus,questTitle,objectiveText,hotspotDestination,trackHotspotQuest,giverPoint,turnInOf} from './hotspots.js';
import {tutorialActive} from './tutorial.js';
import {questProgress} from './quest-status-ui.js';
import {QUEST_TRACKER_UI as T} from './content/index.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Welche Quest die Wegmarke hat: Nebenauftrag, sonst Startreihe/Stammgast/Aushang, sonst die Hauptquest. */
export const focusedKey=g=>g.trackedQuest?'side:'+g.trackedQuest:g.hotspots?.tracked?'hs:'+g.hotspots.tracked:'main';

/** Alle laufenden Aufträge als {key,title,task,done,dest}. Reihenfolge: Hauptquest, Hotspot-Aufträge, Nebenaufträge. */
export function trackerEntries(g){
 if(tutorialActive(g))return [];
 const out=[],q=g.quest;
 if(q&&!q.actDone){const steps=q.accepted?g.chapterProgress():[],open=steps.find(s=>!s.complete);
  out.push({key:'main',title:g.chapter().title,task:!q.accepted?T.talkTo(g.world.npc?.name||''):g.questReady()?T.turnIn(g.world.npc?.name||''):open?open.objective.label+' '+open.done+'/'+open.need:'',done:!!q.accepted&&g.questReady(),dest:g.mainDestination?.()});}
 for(const hq of hotspotQuests()){const st=questStatus(g,hq.id);if(st!=='accepted'&&st!=='ready')continue;const at=!hq.notice&&st==='ready'?giverPoint(g,turnInOf(hq)):null;
  out.push({key:'hs:'+hq.id,title:questTitle(g,hq),task:at?T.turnIn(at.name):objectiveText(g,hq),done:st==='ready',dest:hotspotDestination(g,hq.id)});}
 for(const def of g.world.quests||[]){const s=g.sideQuests?.[def.id];if(!s?.accepted||s.claimed)continue;const ready=s.progress>=def.required;
  out.push({key:'side:'+def.id,title:def.title,task:ready?T.turnIn(def.giver.name):questProgress(def,s),done:ready,dest:g.questDestination?.(def.id)});}
 return out;
}
/** Verfolgen per Klick: setzt die Wegmarke auf diese Quest. */
export function focusQuest(g,key){
 if(key==='main'){g.trackedQuest=null;if(g.hotspots)g.hotspots.tracked=null;return true;}
 if(key.startsWith('hs:'))return trackHotspotQuest(g,key.slice(3));
 if(key.startsWith('side:')){const id=key.slice(5);if(!g.sideQuests?.[id]?.accepted)return false;g.trackedQuest=id;return true;}
 return false;
}
/** Kompakte Liste der nicht verfolgten Aufträge unter dem Auftragsfeld. `metres(point)` → Entfernung in m. */
export function questOthersHtml(g,metres,max=4){
 const focus=focusedKey(g),others=trackerEntries(g).filter(e=>e.key!==focus);if(!others.length)return '';
 const rows=others.slice(0,max).map(e=>`<button type="button" class="quest-other${e.done?' done':''}" data-track-quest="${esc(e.key)}" title="${esc(T.track)}"><b>${esc(e.title)}</b><span><i>${e.done?'✓':'◇'}</i>${esc(e.task)}</span>${metres&&e.dest?.point?`<em>${metres(e.dest.point)} m</em>`:''}</button>`).join('');
 return `<div class="quest-others-head">${esc(T.others)}</div>${rows}${others.length>max?`<small class="quest-others-more">${esc(T.more(others.length-max))}</small>`:''}`;
}
