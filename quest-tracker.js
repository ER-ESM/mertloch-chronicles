// Auftragsverfolgung im HUD nach dem Vorbild der WoW-Zielverfolgung (Nutzerwunsch 2026-09-23): je Auftrag nur Titel und
// der NÄCHSTE offene Schritt, Entfernung rechts; alle Schritte, Belohnung und „Klick verfolgt“ stehen im Tooltip.
// Kein Kopf, kein Erklärtext, kein Scrollen: was nicht passt, fasst „+N“ zusammen (Namen im Tooltip).
import {hotspotQuests,questStatus,questTitle,objectiveText,hotspotDestination,trackHotspotQuest,giverPoint,turnInOf} from './hotspots.js';
import {tutorialActive,tutorialDestination,tutorialStepFor} from './tutorial.js';
import {classEmblem} from './class-emblem.js';
import {tutorialGuide,guideHtml} from './tutorial-guide.js';
import {questProgress} from './quest-status-ui.js';
import {chapterState,rewardLine} from './chapter-ui.js';
import {hotspotTracker} from './hotspot-ui.js';
import {QUEST_TRACKER_UI as T,ACTS,STORY_CHAPTERS,TUTORIAL as TUT} from './content/index.js';
import {isDailyTitle} from './daily-mark.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Welche Quest die Wegmarke hat: Nebenauftrag, sonst Startreihe/Stammgast/Aushang, sonst die Hauptquest. */
export const focusedKey=g=>g.trackedQuest?'side:'+g.trackedQuest:g.hotspots?.tracked?'hs:'+g.hotspots.tracked:'main';

/** Hauptquest: nur der erste offene Schritt; steps für den Tooltip. */
function mainEntry(g){
 const q=g.quest,npc=g.world.npc?.name||'';
 if(q.actDone){const title=chapterState(q.chapter,'claimed')?.title||g.chapter().title;return {key:'main',title,task:T.actDone,done:true,steps:ACTS[0].chapters.map(id=>({text:STORY_CHAPTERS.find(c=>c.id===id)?.title||'',done:true}))};}
 const steps=q.accepted?g.chapterProgress().map(s=>({text:s.objective.label+' '+s.done+'/'+s.need,done:s.complete})):[],open=steps.find(s=>!s.done),ready=!!q.accepted&&g.questReady();
 return {key:'main',title:g.chapter().title,task:!q.accepted?T.talkTo(npc):ready?T.turnIn(npc):open?.text||'',done:ready,steps,reward:rewardLine(g.chapter().reward||{}),dest:g.mainDestination?.()};
}
/** Tastenzeile „F: mit Ida sprechen · I: Rucksack“ → Kappen + Wort (Schlüssel vor dem Doppelpunkt, „Tab/Klick“ = zwei Kappen). */
export function keyLineHtml(line){return String(line||'').split(' · ').map(seg=>{const m=/^([^:\s]+(?:\/[^:\s]+)*):\s*(.*)$/.exec(seg);return m?m[1].split('/').map(k=>`<kbd>${esc(k)}</kbd>`).join('')+' '+esc(m[2]):esc(seg);}).join('<i class="qt-sep" aria-hidden="true">·</i>');}
/** Hofprobe wie jeder Auftrag (Runde 4b, Prüfer-Brüche 2 und 4): Titel = Schritt, eine Tastenzeile, Entfernung zum Schrittziel;
 *  Erklärtext, Fortschritt „Hofprobe · 6/8“ und Belohnung im Tooltip. */
export function tutorialTrackerEntry(g){
 const t=g.tutorial,s=tutorialStepFor(g);if(!s)return null;const hits=t.step===3;
 /* E-72: Schritt je Klasse; `hint` = eine Zeile zur eigenen Ressource mit Klassen-Symbol unter der Tastenzeile */
 return {key:'tutorial',title:s.title,task:s.desktop,taskHtml:keyLineHtml(s.desktop),count:hits?(t.hits+t.autos)+'/'+(TUT.hits+TUT.autos):'',done:false,hint:s.hint,hintClass:g.member?.id,guide:tutorialGuide(g),
  label:TUT.title+' · '+(t.step+1)+'/'+TUT.steps.length,note:s.text+(hits?' ('+TUT.hitsLabel+' '+t.hits+'/'+TUT.hits+' · '+TUT.autoLabel+' '+t.autos+'/'+TUT.autos+')':''),
  reward:TUT.rewardXp+' EP · '+TUT.loot.coins+' Pfandmarken',dest:tutorialDestination(g)};
}
/** Alle laufenden Aufträge als {key,title,task,done,steps?,reward?,dest}. Reihenfolge: Hauptquest, Hotspot-Aufträge, Nebenaufträge. */
export function trackerEntries(g){
 const out=[];
 if(tutorialActive(g)){const t=tutorialTrackerEntry(g);if(t)out.push(t);}
 if(g.quest&&!g.quest.actDone)out.push(mainEntry(g));
 for(const hq of hotspotQuests()){const st=questStatus(g,hq.id);if(st!=='accepted'&&st!=='ready')continue;const at=!hq.notice&&st==='ready'?giverPoint(g,turnInOf(hq)):null;
  out.push({key:'hs:'+hq.id,title:questTitle(g,hq),task:at?T.turnIn(at.name):objectiveText(g,hq),done:st==='ready',dest:hotspotDestination(g,hq.id)});}
 for(const def of g.world.quests||[]){const s=g.sideQuests?.[def.id];if(!s?.accepted||s.claimed)continue;const ready=s.progress>=def.required;
  out.push({key:'side:'+def.id,title:def.title,task:ready?T.turnIn(def.giver.name):questProgress(def,s),done:ready,steps:[{text:questProgress(def,s),done:ready},{text:ready?T.turnIn(def.giver.name):def.location,done:false}],dest:g.questDestination?.(def.id)});}
 return out;
}
/** Der verfolgte Auftrag (auch nach Akt-Ende und für Hotspot-Aufträge mit Belohnungstext). */
function focusedEntry(g,entries){
 if(tutorialActive(g)){const t=entries.find(e=>e.key==='tutorial');if(t)return t;}
 const key=focusedKey(g),hit=entries.find(e=>e.key===key);
 if(key.startsWith('hs:')){const hs=hotspotTracker(g);if(hs)return {...hit,key,title:hs.title,task:hs.task,reward:hs.reward};}
 if(hit)return hit;
 return g.quest&&!tutorialActive(g)?mainEntry(g):null;
}
/** Verfolgen per Klick: setzt die Wegmarke auf diese Quest. */
export function focusQuest(g,key){
 if(key==='main'){g.trackedQuest=null;if(g.hotspots)g.hotspots.tracked=null;return true;}
 if(key.startsWith('hs:'))return trackHotspotQuest(g,key.slice(3));
 if(key.startsWith('side:')){const id=key.slice(5);if(!g.sideQuests?.[id]?.accepted)return false;g.trackedQuest=id;return true;}
 return false;
}
/** Tooltip-Inhalt (HTML, landet über data-tooltip-note im Tooltip aus popup-controls.js). */
function tipNote(e,focus){
 /* klein (Runde 2b): ein einzelner Schritt steht schon im Kasten – der Tooltip nennt dann nur Belohnung und Klick */
 const steps=(e.steps?.length>1?e.steps:[]).map(s=>`<span class="qt-tip-step${s.done?' done':''}">${s.done?'✓':'◇'} ${esc(s.text)}</span>`).join('<br>');
 return [e.note?esc(e.note):'',steps,e.reward?`<small>${esc(T.reward)}: ${esc(e.reward)}</small>`:'',`<small>${esc(focus?T.run:T.track)}</small>`].filter(Boolean).join('<br>');
}
/** Runde 1 (2026-09-24, Grafikbefund Quick Win 8): „Daily:“ wird ein Symbol vor dem Titel, der Zähler „0/3“ steht in der
 *  Distanzspalte statt auf einer eigenen Zeile. */
const DAILY=/^Daily:\s*/i,COUNT=/^(.*?)[\s·:]+(\d+\s*\/\s*\d+)$/;
const titleHtml=t=>DAILY.test(t)||isDailyTitle(t)?`<i class="qt-daily" aria-label="Täglich"></i>${esc(t.replace(DAILY,''))}`:esc(t);
function row(e,{focus,dist}){
 const count=e.count?[null,e.task,e.count]:e.taskHtml?null:COUNT.exec(e.task||''),text=count?count[1]:e.task;
 const tip=`data-tooltip-label="${esc(e.label||e.title)}" data-tooltip-note="${esc(tipNote(e,focus))}"`,task=`<div class="quest-task${focus&&dist!=null?' waypoint':''}${e.done?' done':''}"><i aria-hidden="true"></i><span>${e.taskHtml||esc(text)}</span>${count?`<b class="qt-count">${esc(count[2].replace(/\s+/g,''))}</b>`:''}${dist!=null?`<em>${dist} m</em>`:''}</div>`;
 /* E-72 Runde 3: Bild-Schritte (tutorial-guide.js) ersetzen die Erklärzeile */const hint=e.guide?guideHtml(e.guide):e.hint?`<div class="qt-hint">${classEmblem(e.hintClass)}<span>${esc(e.hint)}</span></div>`:'';
 return focus?`<div class="qt-quest is-focus${e.done?' is-done':''}" ${tip}><b id="questTitle" class="qt-title">${titleHtml(e.title)}</b><div id="questTasks">${task}${hint}</div></div>`
  :`<div class="qt-quest${e.done?' is-done':''}" role="button" tabindex="0" data-track-quest="${esc(e.key)}" ${tip}><b class="qt-title">${titleHtml(e.title)}</b>${task}</div>`;
}
/**
 * HTML der Verfolgung: verfolgter Auftrag oben, darunter bis zu `room` weitere, der Rest als „+N“.
 * `metres(point)` → Entfernung in m oder null (Dungeon); `waypoint` = aktuelle Wegmarke des verfolgten Auftrags.
 */
export function trackerHtml(g,{metres,waypoint,room=4}={}){
 const entries=trackerEntries(g),focus=focusedEntry(g,entries),others=entries.filter(e=>e.key!==focus?.key),shown=others.slice(0,room),rest=others.slice(room);
 const near=pt=>metres&&pt?Math.round(metres(pt)):null,far=pt=>{if(!metres||!pt)return null;const m=metres(pt);/* Runde 4b: kein „0 m“ – wer schon dort steht, braucht keine Zahl */return m<5?null:Math.round(m/10)*10;};
 return (focus?row(focus,{focus:true,dist:waypoint?near(waypoint.point):null}):'')
  +`<div id="questOthers" class="quest-others">${shown.map(e=>row(e,{focus:false,dist:far(e.dest?.point)})).join('')}${rest.length?`<small class="qt-more" data-tooltip-label="${esc(T.moreTitle)}" data-tooltip-note="${esc(rest.map(e=>esc(e.title)).join('<br>'))}">+${rest.length}</small>`:''}</div>`;
}
/** Baut die Verfolgung in `panel` (.quest-panel) – nur neu, wenn sich der Inhalt ändert. */
export function renderTracker(panel,g,opts){
 const body=panel?.querySelector('.qt-body');if(!body)return;
 // Ohne Scrollen: so viele weitere Aufträge, wie zwischen Verfolgung und Aktionsleiste passen (~44 px je Auftrag).
 // Platz nach unten nur alle 1,5 s bzw. nach Größenänderung messen: getBoundingClientRect erzwingt direkt nach den HUD-Schreibvorgängen
 // ein volles Layout (gemessen 1,6 ms je Aufruf, zehnmal pro Sekunde; auf dem Handy ein Mehrfaches).
 const now=performance.now();if(!panel.roomAt||now-panel.roomAt>1500||panel.roomH!==innerHeight){panel.roomAt=now;panel.roomH=innerHeight;panel.room=Math.max(1,Math.min(6,Math.floor((innerHeight-panel.getBoundingClientRect().top-230)/44)-1));}
 const room=panel.room;
 const html=trackerHtml(g,{...opts,room});if(body.dataset.sig===html)return;body.dataset.sig=html;body.innerHTML=html;
}
