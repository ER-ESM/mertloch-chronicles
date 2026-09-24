// Aufträge als WoW-Questlog (Runde 2, 2026-09-24, Zielbild 1 aus docs/REVIEW-GRAFIK-2026-09-24-r2.md):
// oben die Titelliste (Gruppe → Zeile mit Symbol, Titel, Zähler, Entfernung), unten das Detail des gewählten Auftrags mit
// Häkchen-Schritten, Belohnung als Kacheln und drei Symbolknöpfen (Verfolgen, Ziel auf der Karte, Lesen). Keine Pergamentkarten,
// kein Fließtext im Fenster: Beschreibung und Zitat stehen hinter „Lesen“ (eigene Seite im selben Fenster) und im Tooltip des Titels.
// Alle Einträge stehen im HTML; die Auswahl blendet nur um (questlog-window.js), damit ein Klick kein Neuaufbau ist.
import {questResponse,questProgress,escapeQuest as esc} from './quest-status-ui.js';
import {rewardLine,rewardNote,actOf,actChapterList} from './chapter-ui.js';
import {STORY,STORY_CHAPTERS,TUTORIAL,HOTSPOT_UI as H,QUESTLOG_UI as T} from './content/index.js';
import {tutorialActive,tutorialDestination} from './tutorial.js';
import {hotspotQuests,questStatus,giverPoint,turnInOf,objectiveText,fillText,hotspotDestination} from './hotspots.js';
import {rewardTiles} from './reward-tiles.js';
import {glyph} from './ui-glyphs.js';
import {distance,SCALE} from './world.js';

const COUNT=/^(.*?)[\s·:]+(\d+\s*\/\s*\d+)$/,DAILY=/^Daily:\s*/i;
const split=text=>{const m=COUNT.exec(text||'');return m?{text:m[1],count:m[2].replace(/\s+/g,'')}:{text:text||'',count:''};};
const metres=(g,pt)=>g.player&&pt&&Number.isFinite(pt.x)?Math.round(distance(g.player,pt)/SCALE):null;
/** Gewählter Auftrag (Schlüssel wie in der Verfolgung: 'main', 'side:id', 'hs:id', 'tutorial'). Bleibt über Neuaufbauten stehen. */
let chosen=null;
export const chooseQuest=key=>{chosen=key;};
export const chosenQuest=()=>chosen;

function tutorialEntry(g){const step=g.tutorial.step||0;
 return {key:'tutorial',group:T.hofprobe,mark:'main',title:TUTORIAL.title,state:'active',tutorial:true,
  steps:TUTORIAL.steps.map((s,i)=>({text:s.title,note:s.text,done:i<step,current:i===step})),lore:[],
  /* Runde 4b (Prüfer-Bruch 10): Belohnung als Kacheln und „Ziel auf der Karte“ wie bei jedem Auftrag */
  reward:{xp:TUTORIAL.rewardXp,coins:TUTORIAL.loot.coins,items:TUTORIAL.loot.items.map(i=>i.id)},rewardSummary:TUTORIAL.rewardXp+' EP · '+TUTORIAL.loot.coins+' Pfandmarken',
  target:tutorialDestination(g)?.point||null,targetIsGiver:false};}
function mainEntry(g){
 const q=g.quest||{},chapter=g.chapter?g.chapter():STORY_CHAPTERS[0],progress=g.chapterProgress?g.chapterProgress():[],done=!!q.actDone,ready=!!q.accepted&&!done&&!!g.questReady?.();
 const steps=q.accepted&&!done?progress.map(p=>({text:p.objective.label,count:p.done+'/'+p.need,done:p.complete})):[{text:done?STORY.giver+' wartet an der Bude.':'Sprich mit '+STORY.giver+', um anzufangen.',done}];
 if(ready)steps.push({text:H.turnInAt(STORY.giver),done:false});
 const dest=q.accepted&&!done?g.mainDestination?.():null,act=actOf(chapter.id);
 const open=steps.find(s=>!s.done);
 return {key:'main',group:act.title,groupNote:actChapterList(act).map(c=>c.title).join(' · '),mark:ready?'ready':'main',title:chapter.title,count:open?.count||'',state:done?'done':q.accepted?'active':'open',
  steps,reward:{xp:chapter.reward?.xp,coins:chapter.reward?.coins,relic:chapter.reward?.relic,relicEffect:chapter.reward?.relicEffect,choice:true},rewardSummary:rewardLine(chapter.reward)+' · '+rewardNote(chapter.reward),
  lore:[chapter.summary||''],track:q.accepted&&!done,tracked:!g.trackedQuest&&!g.hotspots?.tracked,
  target:dest?.point||g.world?.npc,targetIsGiver:!dest};}
function sideEntry(g,d){const s=g.sideQuests[d.id]||{},ready=s.progress>=d.required,line=questResponse(d,s),state=s.claimed?'done':s.accepted?'active':'open';
 const count=s.accepted?`${s.progress}/${d.required}`:'';
 const steps=s.accepted?[{text:questProgress(d,s),count,done:ready},...(ready&&!s.claimed?[{text:H.turnInAt(d.giver.name),done:false}]:[])]:[{text:T.notAccepted+' · '+d.giver.name,done:false}];
 return {key:'side:'+d.id,group:T.village,mark:ready&&!s.claimed?'ready':'side',title:d.title,count:s.claimed?'':count,state,steps,
  reward:{xp:d.reward,coins:10,choice:true},rewardSummary:d.reward+' EP · 10 Pfandmarken · '+T.choice,lore:[d.description||''],quote:line||'',giver:d.giver.name,
  track:s.accepted&&!s.claimed,tracked:g.trackedQuest===d.id,target:s.accepted&&!s.claimed?g.questDestination?.(d.id)?.point||d.target:d.giver,targetIsGiver:!(s.accepted&&!s.claimed)};}
function hotspotEntry(g,q){const st=questStatus(g,q.id),active=st==='accepted'||st==='ready',at=q.notice?null:giverPoint(g,active?turnInOf(q):q.hotspot);
 const title=fillText(g,q,q.title),daily=DAILY.test(title),o=split(st==='ready'&&at?H.turnInAt(at.name):objectiveText(g,q));
 const note=q.objective?.kind==='drop'?H.dropHint(q.objective.chance):'',line=fillText(g,q,st==='claimed'?q.lines?.done:active?q.lines?.progress:q.lines?.offer);
 const dest=active?hotspotDestination(g,q.id):null;
 return {key:'hs:'+q.id,group:q.notice?H.notices:q.regular?H.regulars:H.series,mark:st==='ready'?'ready':daily?'daily':'side',title:title.replace(DAILY,''),count:st==='claimed'?'':o.count,
  state:st==='claimed'?'done':active?'active':'open',low:st==='low'||st==='locked',
  steps:[{text:o.text,count:o.count,note,done:st==='ready'||st==='claimed'},...(st==='low'?[{text:H.level(q.minLevel),done:false,warn:true}]:[])],
  reward:{xp:q.reward?.xp,coins:q.reward?.coins,items:q.reward?.item?[q.reward.item]:[]},rewardSummary:[q.reward?.xp&&q.reward.xp+' Erfahrung',q.reward?.coins&&q.reward.coins+' Pfandmarken'].filter(Boolean).join(' · '),
  lore:[fillText(g,q,q.text)||''],quote:line||'',giver:at?.name||'',
  track:active,tracked:!g.trackedQuest&&g.hotspots?.tracked===q.id,target:dest?.point||(at?{x:at.x,y:at.y}:null),targetIsGiver:!dest};}
/** Alle Einträge eines Filters in Anzeigereihenfolge: Hofprobe, Hauptgeschichte, Startreihe/Aushänge, Nebenaufträge. */
export function questlogEntries(g,filter='active'){
 const want=e=>filter==='all'||e.state===filter||filter==='active'&&e.key==='main'&&e.state==='open';
 const out=[];
 if((filter==='active'||filter==='all')&&g.tutorial&&tutorialActive(g))out.push(tutorialEntry(g));
 if(g.quest)out.push(mainEntry(g));
 if(g.hotspots)for(const q of hotspotQuests())out.push(hotspotEntry(g,q));
 for(const d of g.world?.quests||[])out.push(sideEntry(g,d));
 return out.filter(e=>e.tutorial||want(e));
}
const mark=m=>`<i class="ql-mark ql-${m}" aria-hidden="true"></i>`;
function row(g,e,sel){const dist=e.state==='done'?null:metres(g,e.target);
 const tip=[...e.lore,e.quote?'„'+e.quote+'“':''].filter(Boolean).map(esc).join('<br>');
 return `<button type="button" class="ql-row${sel?' selected':''}${e.tracked&&e.track?' tracked':''}${e.state==='done'?' done':''}${e.low?' low':''}" data-ql-select="${esc(e.key)}" aria-pressed="${sel}" data-tooltip-label="${esc(e.title)}" data-tooltip-note="${esc(tip)}">${mark(e.mark)}<span class="ql-title">${esc(e.title)}</span><b class="ql-count">${esc(e.count||'')}</b><em>${dist!=null?dist+' m':''}</em></button>`;}
function detail(g,e,sel){
 const tools=[e.track?`<button type="button" class="ql-tool${e.tracked?' on':''}" data-ql-track="${esc(e.key)}" aria-pressed="${!!e.tracked}" aria-label="${esc(e.tracked?T.tracked:T.track)}" data-tooltip-label="${esc(e.tracked?T.tracked:T.track)}" data-tooltip-note="${esc(T.trackNote)}">${glyph(e.tracked?'eyeOn':'eye')}</button>`:'',
  e.target?`<button type="button" class="ql-tool" data-ql-map="${esc(e.key)}" aria-label="${esc(e.targetIsGiver?T.mapGiver:T.mapTarget)}" data-tooltip-label="${esc(e.targetIsGiver?T.mapGiver:T.mapTarget)}" data-tooltip-note="${esc(T.mapNote)}">${glyph('pin')}</button>`:'',
  e.lore.some(Boolean)||e.quote?`<button type="button" class="ql-tool" data-ql-read="${esc(e.key)}" aria-label="${esc(T.read)}" data-tooltip-label="${esc(T.read)}" data-tooltip-note="">${glyph('book')}</button>`:''].join('');
 const steps=e.steps.map(s=>`<li class="${s.done?'done':''}${s.current?' current':''}${s.warn?' warn':''}" data-tooltip-label="${esc(s.text)}" data-tooltip-note="${esc(s.note||'')}"><span>${esc(s.text)}</span>${s.count?`<b>${esc(s.count)}</b>`:''}</li>`).join('');
 const state=e.state==='done'?T.done:e.mark==='ready'?T.ready:'';
 return `<section class="ql-detail${e.tutorial?' tutorial-quest':''}" data-ql-detail="${esc(e.key)}"${sel?'':' hidden'}><header><button type="button" class="ql-tool ql-back" data-ql-back aria-label="${esc(T.back)}" data-tooltip-label="${esc(T.back)}" data-tooltip-note="">${glyph('back')}</button><h3>${esc(e.title)}</h3>${state?`<small class="ql-state">${esc(state)}</small>`:''}<div class="ql-tools">${tools}</div></header><ul class="ql-steps${e.tutorial?' tutorial-steps':''}">${steps}</ul>${e.reward?rewardTiles(e.reward,e.rewardSummary):''}</section>`;}
function readPage(e){if(!e.lore.some(Boolean)&&!e.quote)return '';
 return `<article class="ql-read-page" data-ql-page="${esc(e.key)}" hidden><header><button type="button" class="ql-tool" data-ql-back aria-label="${esc(T.back)}" data-tooltip-label="${esc(T.back)}" data-tooltip-note="">${glyph('back')}</button><h3>${esc(e.title)}</h3></header>${e.lore.filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}${e.quote?`<p class="ql-quote">„${esc(e.quote)}“${e.giver?`<small> – ${esc(e.giver)}</small>`:''}</p>`:''}</article>`;}
/** Filter als drei Symbolschalter; questlog-window.js hängt sie in die Titelzeile. */
export const questFilters=filter=>`<nav class="ql-filters" aria-label="Aufträge filtern">${T.filters.map(([id,name,icon])=>`<button type="button" class="ql-filter${filter===id?' selected':''}" data-quest-filter="${id}" aria-pressed="${filter===id}" aria-label="${esc(name)}" data-tooltip-label="${esc(name)}" data-tooltip-note="${esc(T.filterNotes[id]||'')}"><canvas width="48" height="48" data-ui-icon="${icon}" aria-hidden="true"></canvas></button>`).join('')}</nav>`;
export function questlogPanel(g,filter='active'){
 const entries=questlogEntries(g,filter);
 if(!entries.some(e=>e.key===chosen))chosen=(entries.find(e=>e.tutorial)||entries.find(e=>e.tracked&&e.track)||entries[0])?.key||null;
 const groups=[];for(const e of entries){let grp=groups.find(x=>x.name===e.group);if(!grp)groups.push(grp={name:e.group,note:e.groupNote||'',list:[]});grp.list.push(e);}
 const list=groups.map(grp=>`<h4 class="ql-group" data-tooltip-label="${esc(grp.name)}" data-tooltip-note="${esc(grp.note)}">${esc(grp.name)}</h4>${grp.list.map(e=>row(g,e,e.key===chosen)).join('')}`).join('');
 return `${questFilters(filter)}<div class="ql" data-ql-filter="${esc(filter)}">${entries.length?`<div class="ql-list" role="list">${list}</div><nav class="ql-pager" hidden><button type="button" data-ql-page-prev aria-label="${esc(T.previous)}">${glyph('back')}</button><span></span><button type="button" data-ql-page-next aria-label="${esc(T.next)}">${glyph('next')}</button></nav>${entries.map(e=>detail(g,e,e.key===chosen)).join('')}${entries.map(readPage).join('')}`
  :`<div class="ql-empty" data-tooltip-label="${esc(T.empty)}" data-tooltip-note="${esc(T.emptyNote)}">${glyph('leaf')}<span>${esc(T.empty)}</span><button type="button" class="ql-tool" data-quest-filter="open" aria-label="${esc(T.filters[1][1])}" data-tooltip-label="${esc(T.filters[1][1])}" data-tooltip-note="${esc(T.emptyNote)}"><canvas width="48" height="48" data-ui-icon="ui-quest-dorf" aria-hidden="true"></canvas></button></div>`}</div>`;
}
/** Ziel für „auf der Karte“: bei laufenden Aufträgen das verfolgte Ziel (nicht der Auftraggeber), sonst der Auftraggeber. */
export function questMapTarget(g,key){const e=questlogEntries(g,'all').find(e=>e.key===key);if(!e?.target)return null;
 return {id:'questlog:'+key,track:!!e.track,title:e.title,point:e.target,detail:e.targetIsGiver?(e.giver||STORY.giver):e.steps.find(s=>!s.done)?.text||e.title};}
