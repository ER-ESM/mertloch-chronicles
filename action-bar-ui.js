// Aktionsleisten-Bedienung (2026-09-23): Taste am Platz belegen (Maus darüber + B oder Rechtsklick → „Taste belegen"),
// Tastatur inkl. Modifikatoren und Maus-Sonderknöpfe (Mausrad-Klick, Seitentasten, weitere – nie Links-/Rechtsklick) lösen den Platz aus,
// Anzahl der Leisten in Hilfe → Einstellungen. Belegungslogik: bar-keys.js, Speicher: rpg.barKeys / rpg.barCount.
import {ACTION_BAR_TEXT as T,describe as contentDescribe,SLOT_FUNCTION,TALENT_SKILLS,RESOURCES} from './content/index.js';
import {actionBar,bindSkill,setBarCount,BAR_SIZE,MAX_BARS} from './rpg.js';
import {bindingAt,assignBinding,bindingFromKey,bindingFromMouse,bindingLabel,slotForBinding,slotName} from './bar-keys.js';
import {handCard,rostState,resourceKind} from './class-resources.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typing=t=>!!t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')||t.isContentEditable);
const plain=e=>!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey;

/** Zeile für Hilfe → Einstellungen: Anzahl der Aktionsleisten (1–4). */
export function barSettings(game){const n=game.rpg.barCount||1;
 return `<div class="bar-settings" data-bar-settings><span class="setting-label">${T.settingsLabel}</span><span class="bar-count-control"><button type="button" class="outline-button" data-bar-count="-1" aria-label="${T.remove}"${n<=1?' disabled':''}>−</button><output aria-live="polite">${n}</output><button type="button" class="outline-button" data-bar-count="1" aria-label="${T.add}"${n>=MAX_BARS?' disabled':''}>+</button></span><small>${T.settingsHint}</small></div>`;}

// --- Eckzeichen „heilt / schützt“ (E-72 R5, Kenner-Nachtest: „auf der Leiste sieht man nicht, was heilt und was Schaden macht“) ---
// Grünes Plus = Heilung, Schild = Schutz (Parade, Deckung, Schild); Schaden ist der Normalfall und bleibt ohne Zeichen. Quelle sind die
// Kategorien der Kniffe (content/categories.js: Leistenplatz + Glossarbegriffe). Lebensraub zählt nicht als Heilung (Nebenwirkung).
const HEAL_TERMS=new Set(['heilung','hauspflege','vorrat','grossreinemachen']),GUARD_TERMS=new Set(['deckung','parade','schadensminderung']);
const SLOT_IDS=new Set(['strike','mark','burst','interrupt','parry','dash','heal']),CARD_IDS=new Set(['strike','mark','burst','aermel']),roleCache=new Map();
/** Rolle eines Kniffs laut seinen Kategorien: 'heal', 'guard' oder null. */
export function staticSkillRole(cls,id){
 const key=cls+'/'+id;if(roleCache.has(key))return roleCache.get(key);
 const ref=SLOT_IDS.has(id)?['skill',cls+'/'+id]:id==='throw'||id==='ground'?[id,cls]:id==='buff'?['buff',cls]:TALENT_SKILLS[id]?['talentSkill',id]:null,terms=(ref&&contentDescribe(...ref)?.terms)||[],slot=ref?SLOT_FUNCTION[id]:null;
 const role=slot==='heilung'||terms.some(t=>HEAL_TERMS.has(t))?'heal':slot==='abwehr'||terms.some(t=>GUARD_TERMS.has(t))?'guard':null;roleCache.set(key,role);return role;}
/** Laufende Rolle: Käthes Karten nach Farbe (Herz heilt, Pik schützt), Schorschs Servieren nach dem garsten Stück (Wurst heilt, Käse schützt). */
export function skillRole(game,id){const kind=resourceKind(game);
 if(kind==='cards'&&CARD_IDS.has(id)){const c=id==='aermel'?game.res?.sleeve:handCard(game,id);return c?.suit==='herz'?'heal':c?.suit==='pik'?'guard':null;}
 if(kind==='grill'&&id==='burst'){const charcoal=RESOURCES.schorsch?.rost?.charcoal||1.4,it=rostState(game).filter(x=>x.done<charcoal).sort((a,b)=>b.done-a.done)[0];return it?.item==='wurst'?'heal':it?.item==='kaese'?'guard':null;}
 return staticSkillRole(game.member?.id,id);}
/** Eckzeichen an allen Kniff-Knöpfen (nach jedem Leistenaufbau über paint(), laufend aus resource-hud.js für Karten und Grillgut). */
export function syncSkillRoles(game,root=globalThis.document){if(!game?.member||!root)return;
 for(const b of root.querySelectorAll('.action-area .skill[data-skill],#touchActions .touch-skill[data-skill]')){const role=skillRole(game,b.dataset.skill);let i=b.querySelector(':scope>.skill-role');
  if(!role){if(i)i.remove();if('skillRole' in b.dataset)delete b.dataset.skillRole;continue;}
  if(b.dataset.skillRole!==role)b.dataset.skillRole=role;if(!i){i=document.createElement('i');i.className='skill-role';i.setAttribute('aria-hidden','true');b.append(i);}}}

/** api: game(), canAct(), trigger(index), rebuild(), events(), toast(text) */
export function mountActionBars(api){
 let capture=null,swallowClick=false,swallowContext=false;
 const shell=document.querySelector('#gameShell')||document.body,hint=document.createElement('div');
 hint.className='bind-capture';hint.hidden=true;hint.setAttribute('role','status');shell.append(hint);
 const slotEl=i=>document.querySelector('.action-area .action-bar [data-action-slot="'+i+'"]');
 const hovered=()=>document.querySelector('.action-area .action-bar [data-action-slot]:hover');
 function paint(){
  /* E-72 R5: buildActions ruft paint() nach jedem Aufbau – Eckzeichen „heilt/schützt“ gleich mitsetzen */try{syncSkillRoles(api.game());}catch{}
  document.querySelectorAll('.action-bar .key-capture').forEach(el=>el.classList.remove('key-capture'));
  if(!capture){hint.hidden=true;return;}
  const el=slotEl(capture.index);if(!el){stop();return;}
  el.classList.add('key-capture');const current=bindingLabel(bindingAt(api.game().rpg,capture.index),true);
  hint.innerHTML='<strong>'+esc(slotName(capture.index))+(current?' · '+esc(current):'')+'</strong><span>'+esc(T.capturePrompt)+'</span><small'+(capture.note?' class="is-warning"':'')+'>'+esc(capture.note||T.captureHelp)+'</small>';
  hint.hidden=false;const r=el.getBoundingClientRect(),base=shell.getBoundingClientRect(),w=hint.offsetWidth,h=hint.offsetHeight;
  hint.style.left=Math.round(Math.max(8,Math.min(base.width-w-8,r.left-base.left+r.width/2-w/2)))+'px';
  hint.style.top=Math.round(Math.max(8,r.top-base.top-h-12))+'px';
 }
 function start(index){capture={index,note:''};api.game().keys?.clear?.();paint();}
 function stop(){capture=null;paint();}
 /** Belegung übernehmen; '' löscht. Bei gesperrter Taste bleibt der Belegungsmodus offen und nennt den Grund. */
 function commit(index,binding){
  const g=api.game(),r=assignBinding(g.rpg,index,binding);
  if(!r.ok){if(capture){capture.note=T.reserved(bindingLabel(binding,true));paint();}else api.toast(T.reserved(bindingLabel(binding,true)));return false;}
  if(capture?.index===index)stop();
  const label=bindingLabel(binding,true);
  api.toast(binding?[T.bound(label,slotName(index)),...r.released.map(j=>T.released(label,slotName(j)))].join(' '):T.cleared(slotName(index)));
  g.emit('save');api.rebuild();api.events();return true;
 }
 addEventListener('keydown',e=>{
  if(capture){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
   if(e.code==='Escape'){stop();return;}
   if((e.code==='Delete'||e.code==='Backspace')&&plain(e)){commit(capture.index,'');return;}
   const b=bindingFromKey(e);if(b)commit(capture.index,b);return;}
  if(!api.canAct()||typing(e.target))return;
  if(e.code==='KeyB'&&plain(e)){const el=hovered();if(el){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)start(Number(el.dataset.actionSlot));return;}}
  const b=bindingFromKey(e),i=b?slotForBinding(api.game().rpg,b):-1;if(i<0)return;
  /* E-72 R4: Taste gedrückt halten wirkt wie in WoW („Gedrückt halten zum Wirken“): Wiederholungen versuchen es still weiter */
  e.preventDefault();e.stopImmediatePropagation();api.trigger(i,e.repeat?{hold:true}:undefined);
 },true);
 addEventListener('pointerdown',e=>{
  if(capture){e.preventDefault();e.stopImmediatePropagation();swallowClick=true;setTimeout(()=>swallowClick=false,400);
   if(e.button===0||e.button===2){if(e.button===2)swallowContext=true;stop();return;}
   const b=bindingFromMouse(e);if(b)commit(capture.index,b);return;}
  if(e.pointerType==='touch'||e.button===0||e.button===2||!api.canAct())return;
  const b=bindingFromMouse(e),i=b?slotForBinding(api.game().rpg,b):-1;if(i<0)return;
  e.preventDefault();e.stopImmediatePropagation();api.trigger(i);
 },true);
 // Seitentasten (zurück/vor) sollen die Seite nicht verlassen; Mausrad-Klick startet kein Autoscrollen, wenn er belegt ist.
 const quiet=e=>{if(!api.canAct()&&!capture)return;if(e.button===3||e.button===4||e.button===1&&(capture||slotForBinding(api.game().rpg,bindingFromMouse(e))>=0))e.preventDefault();};
 for(const type of ['mousedown','mouseup','pointerup','auxclick'])addEventListener(type,quiet,true);
 addEventListener('click',e=>{if(swallowClick){swallowClick=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 addEventListener('contextmenu',e=>{if(swallowContext){swallowContext=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 addEventListener('resize',()=>{if(capture)paint();});
 // Einstellungen: Leisten dazu/weg.
 document.addEventListener('click',e=>{const b=e.target.closest('[data-bar-count]');if(!b)return;const g=api.game(),next=(g.rpg.barCount||1)+Number(b.dataset.barCount);
  if(next<1){api.toast(T.minimum);return;}if(next>MAX_BARS){api.toast(T.limit);return;}
  const before=g.rpg.barCount||1;if(!setBarCount(g,next))return;if(capture&&capture.index>=next*BAR_SIZE)stop();
  api.toast(next>before?T.addedBar(next):T.removedBar(before));api.events();
  const row=b.closest('[data-bar-settings]');if(row){row.outerHTML=barSettings(g);document.querySelector('[data-bar-settings] [data-bar-count="'+b.dataset.barCount+'"]:not(:disabled)')?.focus({preventScroll:true});}});
 /** Rechtsklick auf einen Platz: Menü für das Kontextmenü-Modul. */
 function menu(index){const g=api.game(),entry=actionBar(g)[index],binding=bindingAt(g.rpg,index);
  return {title:slotName(index)+(binding?' · '+bindingLabel(binding,true):''),items:[
   {label:T.bindMenu,hint:T.bindMenuHint,action:()=>start(index)},
   {label:T.clearKey,disabled:!binding,action:()=>commit(index,'')},
   {separator:true},
   {label:T.clearSlot,danger:true,disabled:!entry,action:()=>{bindSkill(g,null,index);api.events();}}]};}
 return {menu,start,stop,paint,get capturing(){return capture?capture.index:null;}};
}
