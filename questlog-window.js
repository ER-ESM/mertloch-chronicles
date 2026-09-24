// Aufträge-Fenster (Runde 2, 2026-09-24): verdrahtet das Questlog aus questlog-ui.js im Fenster.
// - Filter Aktiv/Dorf/Erledigt als drei Symbolschalter in der Titelzeile.
// - Aufträge/Bude/Erinnerungen als Symbolreiter unten (Name im Tooltip), je eine Seite – nichts steht untereinander und scrollt.
// - Klick auf eine Zeile wählt aus (nur Umblenden), Doppelklick verfolgt; „Lesen“ zeigt Beschreibung und Zitat als eigene Seite.
// - Passt die Liste nicht, blättert sie seitenweise (‹ 1/2 ›) statt zu scrollen. Touch: Liste oder Detail, mit Zurück-Pfeil.
import {QUESTLOG_UI as T} from './content/index.js';
import {chooseQuest} from './questlog-ui.js';
const touch=()=>document.body.classList.contains('touch-mode');
const SECTIONS={log:'.quest-log',base:'.quest-base',memories:'.quest-memories'};

function showTab(w,id){const b=w.body;if(!b.querySelector(SECTIONS[id]))id='log';w.qlTab=id;
 for(const [key,sel] of Object.entries(SECTIONS)){const el=b.querySelector(sel);if(el)el.hidden=key!==id;}
 for(const t of b.querySelectorAll('[data-ql-tab]')){const on=t.dataset.qlTab===id;t.setAttribute('aria-selected',String(on));t.classList.toggle('selected',on);t.tabIndex=on?0:-1;}
 const filters=w.el.querySelector('.popup-titlebar .ql-filters');if(filters)filters.hidden=id!=='log';
 w.el.dataset.qlTab=id;paginate(w);}
function select(w,key,{show=true}={}){const b=w.body;chooseQuest(key);
 for(const r of b.querySelectorAll('[data-ql-select]')){const on=r.dataset.qlSelect===key;r.classList.toggle('selected',on);r.setAttribute('aria-pressed',String(on));}
 for(const d of b.querySelectorAll('[data-ql-detail]'))d.hidden=d.dataset.qlDetail!==key;
 if(touch()&&show){w.qlTouchDetail=true;b.querySelector('.ql')?.classList.add('ql-show-detail');}}
function read(w,key){const b=w.body,ql=b.querySelector('.ql');if(!ql)return;w.qlRead=key;
 for(const p of b.querySelectorAll('[data-ql-page]'))p.hidden=p.dataset.qlPage!==key;ql.classList.toggle('ql-reading',!!key);}
/** Seiten statt Scrollen: Zeilen und Gruppenköpfe auf Seiten verteilen, die gewählte Zeile bestimmt die Startseite. */
function paginate(w){const b=w.body,list=b.querySelector('.ql-list'),pager=b.querySelector('.ql-pager');if(!list||!pager)return;
 const items=[...list.children];items.forEach(el=>el.hidden=false);pager.hidden=true;
 const fit=()=>{const room=list.clientHeight;if(!room)return null;const pages=[];let start=null,page=0;
  for(const el of items){const top=el.offsetTop-list.offsetTop,bottom=top+el.offsetHeight;if(start===null)start=top;if(bottom-start>room+1&&el!==items[0]){page++;start=top;}pages.push(page);}
  // Ein Gruppenkopf allein am Seitenende wandert mit auf die nächste Seite.
  for(let i=0;i<items.length-1;i++)if(items[i].matches('.ql-group')&&pages[i+1]!==pages[i])pages[i]=pages[i+1];
  return pages;};
 let pages=fit();if(!pages)return;
 if(pages.at(-1)>0){pager.hidden=false;pages=fit()||pages;}
 const count=(pages.at(-1)||0)+1,sel=items.findIndex(el=>el.classList?.contains('selected'));
 if(w.qlPage==null||w.qlPage>=count)w.qlPage=sel>=0?pages[sel]:0;
 items.forEach((el,i)=>el.hidden=pages[i]!==w.qlPage);
 pager.hidden=count<2;pager.querySelector('span').textContent=(w.qlPage+1)+' / '+count;
 pager.querySelector('[data-ql-page-prev]').disabled=w.qlPage<=0;pager.querySelector('[data-ql-page-next]').disabled=w.qlPage>=count-1;}
function wire(w){if(w.el.dataset.qlWired)return;w.el.dataset.qlWired='1';
 w.el.addEventListener('click',e=>{const t=e.target.closest('[data-ql-select],[data-ql-read],[data-ql-back],[data-ql-tab],[data-ql-page-prev],[data-ql-page-next]');if(!t)return;const d=t.dataset;
  if(d.qlSelect){select(w,d.qlSelect);return;}
  if(d.qlRead){read(w,d.qlRead);return;}
  if('qlBack' in d){if(w.qlRead){read(w,null);return;}w.qlTouchDetail=false;w.body.querySelector('.ql')?.classList.remove('ql-show-detail');return;}
  if(d.qlTab){showTab(w,d.qlTab);return;}
  if('qlPagePrev' in d){w.qlPage=Math.max(0,(w.qlPage||0)-1);paginate(w);return;}
  if('qlPageNext' in d){w.qlPage=(w.qlPage||0)+1;paginate(w);}});
 // Doppelklick auf eine Zeile verfolgt den Auftrag (wie die Verfolgung rechts).
 w.el.addEventListener('dblclick',e=>{const r=e.target.closest('[data-ql-select]');if(!r)return;w.body.querySelector(`[data-ql-detail="${CSS.escape(r.dataset.qlSelect)}"] [data-ql-track]`)?.click();});}
/** Nach jedem Aufbau (panel-pages.js → decoratePanel). */
export function questWindow(w){const b=w.body,bar=w.el.querySelector('.popup-titlebar');
 // Filter in die Titelzeile, vor Tastenkappe und ×.
 bar.querySelector('.ql-filters')?.remove();const filters=b.querySelector('.ql-filters');if(filters)(bar.querySelector('.popup-key')||bar.querySelector('.popup-close')).before(filters);
 // Symbolreiter unten: Aufträge, Bude, Erinnerungen – nur die freigeschalteten.
 const tabs=T.tabs.filter(([id])=>b.querySelector(SECTIONS[id]));
 if(tabs.length>1){const nav=document.createElement('nav');nav.className='ql-tabs panel-tabs';nav.setAttribute('role','tablist');
  nav.innerHTML=tabs.map(([id,name,icon])=>`<button type="button" role="tab" data-ql-tab="${id}" aria-label="${name}" data-tooltip-label="${name}" data-tooltip-note=""><canvas width="48" height="48" data-ui-icon="${icon}" aria-hidden="true"></canvas><span class="ql-tab-name">${name}</span></button>`).join('');b.append(nav);}
 wire(w);
 const ql=b.querySelector('.ql');if(ql&&touch()&&w.qlTouchDetail)ql.classList.add('ql-show-detail');
 if(w.qlRead&&b.querySelector(`[data-ql-page="${CSS.escape(w.qlRead)}"]`))read(w,w.qlRead);else w.qlRead=null;
 showTab(w,w.qlTab||'log');
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(w.el.isConnected)paginate(w);}));}
export const questWindowReflow=w=>paginate(w);
