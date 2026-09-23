// Aktionsleisten-Bedienung (2026-09-23): Taste am Platz belegen (Maus darüber + B oder Rechtsklick → „Taste belegen"),
// Tastatur inkl. Modifikatoren und Maus-Sonderknöpfe (Mausrad-Klick, Seitentasten, weitere – nie Links-/Rechtsklick) lösen den Platz aus,
// Anzahl der Leisten in Hilfe → Einstellungen. Belegungslogik: bar-keys.js, Speicher: rpg.barKeys / rpg.barCount.
import {ACTION_BAR_TEXT as T} from './content/index.js';
import {actionBar,bindSkill,setBarCount,BAR_SIZE,MAX_BARS} from './rpg.js';
import {bindingAt,assignBinding,bindingFromKey,bindingFromMouse,bindingLabel,slotForBinding,slotName} from './bar-keys.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typing=t=>!!t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')||t.isContentEditable);
const plain=e=>!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey;

/** Zeile für Hilfe → Einstellungen: Anzahl der Aktionsleisten (1–4). */
export function barSettings(game){const n=game.rpg.barCount||1;
 return `<div class="bar-settings" data-bar-settings><span class="setting-label">${T.settingsLabel}</span><span class="bar-count-control"><button type="button" class="outline-button" data-bar-count="-1" aria-label="${T.remove}"${n<=1?' disabled':''}>−</button><output aria-live="polite">${n}</output><button type="button" class="outline-button" data-bar-count="1" aria-label="${T.add}"${n>=MAX_BARS?' disabled':''}>+</button></span><small>${T.settingsHint}</small></div>`;}

/** api: game(), canAct(), trigger(index), rebuild(), events(), toast(text) */
export function mountActionBars(api){
 let capture=null,swallowClick=false,swallowContext=false;
 const shell=document.querySelector('#gameShell')||document.body,hint=document.createElement('div');
 hint.className='bind-capture';hint.hidden=true;hint.setAttribute('role','status');shell.append(hint);
 const slotEl=i=>document.querySelector('.action-area .action-bar [data-action-slot="'+i+'"]');
 const hovered=()=>document.querySelector('.action-area .action-bar [data-action-slot]:hover');
 function paint(){
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
  e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)api.trigger(i);
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
