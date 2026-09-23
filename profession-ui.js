// Berufe nach MMO-Vorbild (Nutzerauftrag 2026-09-23): gelernt wird nur beim Lehrer (trainerPanel), das Berufefenster (Shift + B)
// zeigt in Reitern die eigenen Berufe, die Rezepte (Liste links, Details rechts, Herstellen an der Station) und die Materialien.
import {itemIcon,itemStats} from './rpg-ui.js';
import {PROFESSIONS as P,PROFESSION_RECIPES as REC,PROFESSION_STATIONS as ST,PROFESSION_SOURCES as SRC,PROFESSION_RULES as R,PROFESSION_UI as T,PROFESSION_BOOK as B,PROFESSION_TRAINER as TR,SHOP_STOCK,DROP_TABLES,PERSON_APPEARANCE} from './content/index.js';
import {ITEMS,countItem} from './rpg.js';
import {professionWorld} from './profession-world.js';
import {nodeStatus,professionReason} from './professions.js';
import {professionPlan,restoreProfessions,trainState} from './profession-rules.js';
import {paintItem} from './item-art.js';
import {paintPersonPortraits} from './person-art.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,attrs,disabled=false,cls='outline-button')=>`<button type="button" class="${cls}" ${attrs} ${disabled?'disabled':''}>${esc(text)}</button>`;
const recipesOf=prof=>Object.keys(REC).filter(id=>REC[id].profession===prof).sort((a,b)=>REC[a].required-REC[b].required);
const sourcesOf=prof=>Object.keys(SRC).filter(id=>SRC[id].profession===prof).sort((a,b)=>SRC[a].required-SRC[b].required);
/** Sinnbild eines Berufs: Ertrag der ersten Fundstelle bzw. Ergebnis des Einstiegsrezepts. */
const emblem=prof=>P[prof].kind==='gather'?Object.keys(SRC[sourcesOf(prof)[0]].items)[0]:REC[recipesOf(prof)[0]].output;
const rank=skill=>B.ranks.filter(([n])=>skill>=n).pop()?.[1]||B.ranks[0][1];
const bar=(skill,cls='')=>`<div class="prof-bar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="${R.cap}" aria-valuenow="${skill}"><i style="width:${Math.round(100*skill/R.cap)}%"></i><span>${skill} / ${R.cap}</span></div>`;
const teacherOf=(g,prof)=>professionWorld(g.world).teachers.find(t=>t.id===prof);
const stationOf=(g,prof)=>professionWorld(g.world).stations.find(s=>s.id===P[prof].station);
const busyOf=g=>!!(g.professionCast||g.professionCommit)||g.professionOnline&&g.professionStatus!==T.online;
/** Schwierigkeit wie im Vorbild: bringt Fertigkeit (orange) · zu einfach (grau) · noch nicht gelernt. */
export function recipeTone(state,id){const r=REC[id],skill=state.learned[r.profession]||0;return !state.recipes.includes(id)?'locked':skill>=r.grey?'grey':'up';}
/** Wie oft das Rezept mit dem Rucksackinhalt und den Pfandmarken gerade ginge (Reserve des Hauptauftrags nicht abgezogen). */
export function craftableCount(g,id){const r=REC[id];return Math.max(0,Math.min(Math.floor(g.rpg.coins/R.recipeFee),...Object.entries(r.materials).map(([i,n])=>Math.floor(countItem(g.rpg,i)/n))));}
/** Was als Nächstes freigeschaltet wird: nächstes Rezept beim Lehrer bzw. nächste Fundstelle. */
function nextUnlock(state,prof){const skill=state.learned[prof]||0,p=P[prof];
 if(p.kind==='craft'){const id=recipesOf(prof).find(id=>!state.recipes.includes(id));if(!id)return B.maxed;const r=REC[id];return skill>=r.required?TR.need(r.required)+' · '+B.nextRecipe(r.name,p.teacher):B.next(r.required,B.nextRecipe(r.name,p.teacher));}
 const id=sourcesOf(prof).find(id=>SRC[id].required>skill);return id?B.next(SRC[id].required,B.nextSource(SRC[id].name)):B.maxed;}

function slotCard(g,prof,state,view,busy){const p=P[prof],skill=state.learned[prof],gather=p.kind==='gather';
 const sources=gather?`<h4>${B.sources}</h4><ul class="prof-sources">${sourcesOf(prof).map(id=>{const s=SRC[id];return `<li class="${skill<s.required?'is-locked':skill>=s.grey?'is-grey':'is-up'}"><b>${esc(s.name)}</b><small>${esc(TR.need(s.required))} · ${B.yields}: ${Object.entries(s.items).map(([i,n])=>n+' × '+esc(ITEMS[i].name)).join(', ')}</small></li>`;}).join('')}</ul>`:'';
 const known=gather?'':`<p class="prof-known">${state.recipes.filter(id=>REC[id].profession===prof).length} / ${recipesOf(prof).length} ${T.recipes}</p>`;
 const forget=view.confirm===prof?`<div class="prof-confirm" role="alert"><p>${T.forgetConfirm}</p>${button(T.confirm,`data-prof-forget="${prof}"`,busy,'gold-button')}${button(T.cancel,'data-prof-confirm=""')}</div>`:button(T.forget,`data-prof-confirm="${prof}"`,busy,'outline-button prof-forget');
 return `<section class="prof-slot" data-prof-slot="${prof}"><header>${itemIcon(emblem(prof))}<div><h3>${esc(p.name)}</h3><small>${esc(rank(skill))} · ${gather?'Sammelberuf':'Herstellberuf'}</small></div></header>${bar(skill)}<p>${esc(p.description)}</p>${known}<p class="prof-next">${esc(nextUnlock(state,prof))}</p>${sources}
  <footer>${button(B.toTeacher,`data-prof-route="teacher:${prof}"`)}${gather?button(B.toNode,`data-prof-route="node:${prof}"`):button(B.toStation,`data-prof-route="station:${prof}"`)}${forget}</footer></section>`;}
function freeSlot(state){const open=Object.keys(P).filter(id=>!state.learned[id]);
 return `<section class="prof-slot is-free"><header><div><h3>${B.freeSlot}</h3></div></header><p>${B.freeSlotText}</p><ul class="prof-teachers">${open.map(id=>`<li>${itemIcon(emblem(id))}<div><b>${esc(P[id].name)}</b><small>${esc(B.teacherAt(P[id].teacher,ST[P[id].station].name))}</small></div>${button(B.toTeacher,`data-prof-route="teacher:${id}"`)}</li>`).join('')}</ul></section>`;}
function professionsTab(g,state,view,busy){const learned=Object.keys(P).filter(id=>state.learned[id]);
 return `<div class="prof-slots">${learned.map(id=>slotCard(g,id,state,view,busy)).join('')}${Array.from({length:Math.max(0,R.slots-learned.length)},()=>freeSlot(state)).join('')}</div>`;}

function recipeDetail(g,id,state,busy){const r=REC[id],p=P[r.profession],d=ITEMS[r.output],skill=state.learned[r.profession]||0,learned=state.recipes.includes(id),station=stationOf(g,r.profession);
 const error=learned?professionReason(g,station)||professionPlan(g.save(),{kind:'craft',target:id}).error:'',far=!!station&&!!professionReason(g,station)&&professionReason(g,station)===T.range;
 const mats=Object.entries(r.materials).map(([i,n])=>{const have=countItem(g.rpg,i);return `<li class="${have<n?'missing':''}">${itemIcon(i)}<span>${esc(ITEMS[i].name)}</span><b>${have} / ${n}</b></li>`;}).join('');
 const tone=recipeTone(state,id);
 return `<article class="prof-detail" data-prof-detail="${id}"><header>${itemIcon(r.output)}<div><h3 class="rarity-${d.rarity}">${esc(d.name)}${r.count>1?' × '+r.count:''}</h3><small>${r.name!==d.name?esc(r.name)+' · ':''}${esc(p.name)}</small></div></header><p class="prof-item-text">${esc(itemStats(d)||d.description)}</p>
  <h4>${B.reagents}</h4><ul class="prof-reagents">${mats}</ul>
  <ul class="prof-facts"><li class="${far?'missing':''}">${esc(B.station(ST[p.station].name))}</li><li>${esc(B.fee(R.recipeFee))}</li><li class="tone-${tone}">${tone==='grey'?B.grey:tone==='up'?B.gain:esc(TR.need(r.required))}</li></ul>
  ${learned?`<p class="profession-reason" aria-live="polite">${esc(error||'')}</p><div class="prof-actions">${button(T.craft,`data-prof-craft="${id}"`,busy||!!error,'gold-button')}${far?button(B.toStation,`data-prof-route="station:${r.profession}"`):''}</div>`
   :`<p class="prof-unlearned">${esc(B.unlearned(p.teacher,r.required))}${skill&&skill<r.required?' '+esc(TR.skill(skill,R.cap))+'.':''}</p><div class="prof-actions">${button(B.toTeacher,`data-prof-route="teacher:${r.profession}"`)}</div>`}</article>`;}
function recipesTab(g,state,view,busy){const crafts=Object.keys(P).filter(id=>P[id].kind==='craft'&&(state.learned[id]||view.all));
 // Wie im Vorbild ist immer ein Rezept ausgewählt: das gemerkte, sonst das erste der Liste.
 const shown=crafts.flatMap(prof=>recipesOf(prof).filter(id=>view.all||state.recipes.includes(id))),selected=shown.includes(view.recipe)?view.recipe:shown[0]||null;
 const groups=crafts.map(prof=>{const ids=recipesOf(prof).filter(id=>view.all||state.recipes.includes(id));if(!ids.length)return '';const skill=state.learned[prof]||0;
  return `<section class="prof-group"><h4>${esc(P[prof].name)}${skill?` <small>${skill} / ${R.cap}</small>`:''}</h4>${ids.map(id=>{const n=state.recipes.includes(id)?craftableCount(g,id):0;return `<button type="button" class="prof-recipe tone-${recipeTone(state,id)}" data-prof-recipe="${id}" aria-pressed="${selected===id}"><i aria-hidden="true"></i><span>${esc(REC[id].name)}</span>${n?`<b>[${n}]</b>`:''}</button>`;}).join('')}</section>`;}).join('');
 const list=groups||`<p class="prof-empty">${B.noCraft}</p>`;
 return `<div class="prof-recipes"><aside class="prof-recipe-list"><label class="prof-toggle"><input type="checkbox" data-prof-all ${view.all?'checked':''}> ${B.showAll}</label>${list}<ul class="prof-legend">${B.legend.map(([k,t])=>`<li class="tone-${k}"><i aria-hidden="true"></i>${t}</li>`).join('')}</ul></aside>${selected?recipeDetail(g,selected,state,busy):`<article class="prof-detail is-empty"><p>${B.select}</p></article>`}</div>`;}

/** Alle Berufsmaterialien: gesammelt oder in Rezepten verbraucht. */
export function professionMaterials(){return [...new Set([...Object.values(SRC).flatMap(s=>Object.keys(s.items)),...Object.values(REC).flatMap(r=>Object.keys(r.materials))])];}
function materialsTab(g,state){const rows=professionMaterials().map(i=>{const d=ITEMS[i],have=countItem(g.rpg,i);
  const from=[...Object.values(SRC).filter(s=>s.items[i]).map(s=>B.node(s.name,P[s.profession].name,s.required)),...(SHOP_STOCK.includes(i)&&d.price?[B.kiosk(d.price)]:[]),...(Object.values(DROP_TABLES).some(t=>t.material===i)?[B.loot]:[])];
  const used=Object.entries(REC).filter(([,r])=>r.materials[i]).map(([id,r])=>`<span class="${state.recipes.includes(id)?'is-known':''}">${esc(r.name)} (${r.materials[i]})</span>`);
  return `<li class="prof-material ${have?'':'is-none'}">${itemIcon(i)}<div><b class="rarity-${d.rarity}">${esc(d.name)}</b><small>${B.from}: ${esc(from.join(' · ')||'—')}</small>${used.length?`<small>${B.usedIn}: ${used.join(', ')}</small>`:''}</div><strong title="${B.have}">${have}</strong></li>`;}).join('');
 return `<p class="prof-intro">${B.materialsIntro}</p><ul class="prof-materials">${rows}</ul>`;}

/** Berufefenster. view = {tab, recipe, all, confirm} */
export function professionPanel(g,view){const state=restoreProfessions(g.professions),busy=busyOf(g),tab=B.tabs[view.tab]?view.tab:'professions',save=g.save(),locked=(save.level||1)<R.level||!!save.tutorial&&!save.tutorial.completed;
 const body=tab==='recipes'?recipesTab(g,state,view,busy):tab==='materials'?materialsTab(g,state):professionsTab(g,state,view,busy);
 return `<div class="profession-panel prof-book" data-ui-window-title="${T.title}"><nav class="prof-tabs" role="tablist" aria-label="${T.title}">${Object.entries(B.tabs).map(([id,label])=>`<button type="button" role="tab" class="outline-button" data-prof-tab="${id}" aria-selected="${tab===id}">${label}</button>`).join('')}<kbd>${T.keys}</kbd></nav>${locked?`<p class="prof-locked">${B.locked}</p>`:''}<div class="prof-page" data-prof-page="${tab}">${body}</div><p class="profession-mode">${esc(B.mode(g.professionOnline?g.professionStatus||T.loading:T.solo,g.rpg.coins,Object.keys(state.learned).length,R.slots))}</p></div>`;}

/** Lehrer-Gespräch: Beruf lernen, Rezepte lernen. Sonst nichts. */
export function trainerPanel(g,prof){const p=P[prof],state=restoreProfessions(g.professions),skill=state.learned[prof]||0,busy=busyOf(g),teacher=teacherOf(g,prof),save=g.save(),away=professionReason(g,teacher);
 const portrait=PERSON_APPEARANCE[p.look]?`<canvas width="96" height="96" data-person-art="${esc(p.look)}" role="img" aria-label="Porträt von ${esc(p.teacher)}"></canvas>`:'';
 let body;
 if(!skill){const error=away||professionPlan(save,{kind:'learn',target:prof}).error;
  body=`<section class="trainer-learn"><p><b>${TR.notLearned}</b> ${esc(p.description)}</p><small>${esc(TR.otherSlots(Object.keys(state.learned).length,R.slots))}</small><div class="prof-actions">${button(TR.learn+' · '+TR.cost(R.learnCost),`data-prof-learn="${prof}"`,busy||!!error,'gold-button')}</div>${error?`<p class="profession-reason">${esc(error)}</p>`:''}</section>`;}
 else body=`<section class="trainer-skill"><b>${esc(p.name)} · ${esc(rank(skill))}</b>${bar(skill)}</section>`;
 if(p.kind==='craft')body+=`<h3>${TR.recipes}</h3><ul class="trainer-recipes">${recipesOf(prof).map(id=>{const r=REC[id],known=state.recipes.includes(id),why=skill?trainState(state,id):TR.errProfession,error=away||why||professionPlan(save,{kind:'train',target:id}).error;
  const right=known?`<span class="trainer-known">${TR.known}</span>`:r.starter?`<span class="trainer-note">${TR.starter}</span>`:skill&&skill>=r.required?button(TR.train+' · '+TR.cost(r.cost),`data-prof-train="${id}"`,busy||!!error,'gold-button'):`<span class="trainer-need">${esc(TR.need(r.required))}</span>`;
  return `<li class="${known?'is-known':skill>=r.required?'is-ready':'is-locked'}">${itemIcon(r.output)}<div><b>${esc(r.name)}</b><small>${esc(TR.need(r.required))} · ${Object.entries(r.materials).map(([i,n])=>n+' × '+esc(ITEMS[i].name)).join(', ')}</small>${!known&&skill>=r.required&&error&&error!==TR.errKnown?`<small class="profession-reason">${esc(error)}</small>`:''}</div>${right}</li>`;}).join('')}</ul><p class="trainer-hint">${TR.craftHint}</p>`;
 else body+=`<p class="trainer-hint">${TR.gatherOnly}</p><ul class="trainer-recipes">${sourcesOf(prof).map(id=>{const s=SRC[id];return `<li class="${skill>=s.required?'is-known':'is-locked'}">${itemIcon(Object.keys(s.items)[0])}<div><b>${esc(s.name)}</b><small>${B.yields}: ${Object.entries(s.items).map(([i,n])=>n+' × '+esc(ITEMS[i].name)).join(', ')}</small></div><span class="${skill>=s.required?'trainer-known':'trainer-need'}">${esc(TR.need(s.required))}</span></li>`;}).join('')}</ul>`;
 return `<div class="profession-panel trainer-panel" data-ui-window-title="${esc(p.teacher)}"><header class="conversation-person"><span class="conversation-portrait"><span aria-hidden="true" class="conversation-initial">${esc(p.teacher[0])}</span>${portrait}</span><div><strong>${esc(p.teacher)}</strong><small>${esc(p.name)} · ${esc(ST[p.station].name)}</small></div></header><p class="conversation-quote">„${esc(p.greet)}“</p>${away&&away!==T.combat?`<p class="profession-reason">${esc(away)}</p>`:''}${body}<p class="profession-mode">${esc(B.mode(g.professionOnline?g.professionStatus||T.loading:T.solo,g.rpg.coins,Object.keys(state.learned).length,R.slots))}</p></div>`;}

// Neuzeichnen zwischen Drücken und Loslassen würde den Knopf ersetzen – der Browser feuert dann kein click, der Klick ginge still verloren. Solange gedrückt ist (höchstens 1 s), wartet der Neuaufbau.
function watchPress(root){if(root._pressWatch)return;root._pressWatch=true;root.addEventListener('pointerdown',()=>{root._pressed=performance.now();const up=()=>{root._pressed=0;removeEventListener('pointerup',up,true);removeEventListener('pointercancel',up,true);};addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);});}
/** Baut nur neu, wenn sich das HTML geändert hat; Fokus und Scrollstände (Fenster und Rezeptliste) bleiben erhalten. */
export function renderProfessionHtml(root,html){if(!root)return;watchPress(root);if(root._pressed&&performance.now()-root._pressed<1000)return;if(root._professionHtml===html)return;
 const active=root.contains(document.activeElement)?{...document.activeElement.dataset}:null,scroll=root.scrollTop,inner=[...root.querySelectorAll('.prof-recipe-list,.prof-detail')].map(e=>e.scrollTop);
 root.innerHTML=html;root._professionHtml=html;root.scrollTop=scroll;root.querySelectorAll('.prof-recipe-list,.prof-detail').forEach((e,i)=>e.scrollTop=inner[i]||0);root.querySelectorAll('[data-item-art]').forEach(c=>paintItem(c,c.dataset.itemArt));paintPersonPortraits(root);
 if(active){const [k,v]=Object.entries(active)[0]||[];if(k)for(const b of root.querySelectorAll('button,input'))if(b.dataset[k]===v){b.focus({preventScroll:true});break;}}}
export const updateProfessionPanel=(root,g,view)=>renderProfessionHtml(root,professionPanel(g,view));
export const updateTrainerPanel=(root,g,prof)=>renderProfessionHtml(root,trainerPanel(g,prof));
/** Ziel eines Hinlaufen-Knopfs: 'teacher:<beruf>' · 'station:<beruf>' · 'node:<beruf>' (nächste erntereife Fundstelle). */
export function professionRoute(g,key){const [kind,prof]=String(key).split(':');if(!P[prof])return null;if(kind==='teacher')return teacherOf(g,prof);if(kind==='station')return stationOf(g,prof);
 const skill=g.professions.learned[prof]||0,nodes=professionWorld(g.world).nodes.filter(n=>SRC[n.kind].profession===prof&&SRC[n.kind].required<=skill),ready=nodes.filter(n=>{const s=nodeStatus(g,n);return !s.spent&&s.phase!=='empty';});
 return (ready.length?ready:nodes).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0]||null;}
