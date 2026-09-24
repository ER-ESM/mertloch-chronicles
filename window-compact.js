// Einzelfenster verdichten (2026-09-23): Fließtext und Beschriftungen wandern in Tooltips, Knöpfe und Filter
// werden Symbole mit Namen im Hover. Läuft nach dem Aufbau jedes Fensters (panel-pages.js → decoratePanel),
// arbeitet nur auf dem fertigen DOM und lässt Datenattribute, Klickwege und aria-Namen unangetastet.
import {BAG_UI,WINDOW_UI} from './content/index.js';
const C=WINDOW_UI.compact;
const icon=id=>{const c=document.createElement('canvas');c.width=c.height=48;c.dataset.uiIcon=id;c.setAttribute('aria-hidden','true');return c;};
/** Tooltip statt Beschriftung: Name in den Hover, sichtbar bleibt nur das Symbol. */
function tip(el,label,note=''){if(!el)return;el.dataset.tooltipLabel=label;el.dataset.tooltipNote=note;el.removeAttribute('title');}
/** Knopf auf ein Symbol reduzieren; der alte Text bleibt als Tooltip und Vorlesename. */
function iconButton(b,id,note=''){if(!b||b.dataset.compact)return;const label=b.textContent.trim();b.dataset.compact='1';b.classList.add('icon-only');if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',label);tip(b,label,note);b.replaceChildren(icon(id));}
const text=(el)=>el?.textContent.trim()||'';
function person(b,touch){
 if(!touch)b.querySelector('.meter-entry-wrap')?.remove();
 const head=b.querySelector('.rpg-heading');if(head){const sub=head.querySelector('p');if(sub){head.dataset.sub=sub.textContent;sub.classList.add('sub-line');}}
 b.querySelectorAll('.gear-cell>small').forEach(e=>e.remove());b.querySelectorAll('.gear-footer h4').forEach(e=>e.remove());
 const [turn,roster]=b.querySelectorAll('.armory-controls button');iconButton(turn,'ui-reset');iconButton(roster,'person');
 const starter=b.querySelector('.starter-armory');if(starter){const note=starter.querySelector('small');tip(starter.querySelector('button'),text(starter.querySelector('button')),text(note));note?.remove();}
 // Werte: Symbol + Zahl, Name und Wirkung im Tooltip (Zweitwerte haben ihren eigenen Wert-Tooltip).
 const chip=(row,id)=>{const label=row.querySelector('small');if(!label||row.dataset.compact)return;row.dataset.compact='1';tip(row,label.textContent.trim(),'');row.tabIndex=0;label.replaceWith(icon(id));};
 const [melee,ranged]=b.querySelectorAll('.weapon-summary>div');chip(melee,'ui-stat-nahkampf');chip(ranged,'ui-stat-fernkampf');
 const [hp,coins]=b.querySelectorAll('.character-stats>div');chip(hp,'ui-stat-leben');chip(coins,'coins');
 for(const row of b.querySelectorAll('.secondary-stats>[data-stat-tip]')){const name=row.querySelector('span');if(!name||row.dataset.compact)continue;row.dataset.compact='1';row.setAttribute('aria-label',name.textContent);name.replaceWith(icon(C.statIcons[row.dataset.statTip]||'person'));}
 // Alles in eine Werteleiste: Waffen, Leben, Geld, Zweitwerte.
 const stats=document.createElement('div');stats.className='compact-stats';for(const row of b.querySelectorAll('.weapon-summary>div,.character-stats>div,.secondary-stats>[data-stat-tip]'))stats.append(row);
 const anchor=b.querySelector('.weapon-summary');if(anchor&&stats.children.length){anchor.before(stats);b.querySelectorAll('.weapon-summary,.character-stats,.secondary-stats').forEach(e=>e.remove());}
}
function quest(b){
 const jump=b.querySelector('.section-jump');if(jump)for(const btn of jump.querySelectorAll('button')){const id=C.sectionIcons[btn.dataset.jump];if(id){const label=btn.textContent;btn.classList.add('with-icon');btn.replaceChildren(icon(id),Object.assign(document.createElement('span'),{textContent:label}));}}
 const log=b.querySelector('.quest-log');const count=log?.querySelector(':scope>.rpg-heading');const filters=[...b.querySelectorAll('.quest-tabs button')];
 for(const f of filters){const id=C.questFilters[f.dataset.questFilter];if(!id||f.dataset.compact)continue;const label=f.textContent.trim();f.dataset.compact='1';f.setAttribute('aria-label',label);tip(f,label,f.dataset.questFilter==='active'?text(count):'');f.replaceChildren(icon(id),Object.assign(document.createElement('span'),{textContent:label}));}
 count?.remove();
 // Kapitel: Erzähltext in den Tooltip der Kapitelzeile, die Liste bleibt eine Zeile je Kapitel.
 b.querySelector('.chapter-log>.rpg-heading')?.remove();
 for(const ch of b.querySelectorAll('.chapter-entry')){const ps=[...ch.querySelectorAll(':scope>p')];const h=ch.querySelector('h3');if(ps.length){tip(ch,text(h),ps.map(p=>p.textContent.trim()).join(' '));ps.forEach(p=>p.remove());ch.tabIndex=0;}}
 const ruined=b.querySelector('.base-locked');if(ruined&&!ruined.dataset.compact){ruined.dataset.compact='1';const row=document.createElement('p');row.className='base-locked compact-row';row.tabIndex=0;tip(row,C.baseRuined,ruined.textContent.trim());row.append(icon('lock'),Object.assign(document.createElement('span'),{textContent:C.baseRuined}));ruined.replaceWith(row);}
 // Erinnerungen: bekannte als Bildkachel mit Text im Tooltip, unbekannte als stille Platzhalter.
 const list=b.querySelector('.memory-list');if(list&&!list.dataset.compact){list.dataset.compact='1';list.classList.add('memory-tiles');
  for(const m of list.querySelectorAll('.memory-entry')){const h=m.querySelector('h3');if(m.classList.contains('unknown')){m.replaceChildren();tip(m,C.memoryUnknown,text(h));m.tabIndex=0;continue;}
   const ps=[...m.querySelectorAll(':scope>p')];tip(m.querySelector('.memory-picture')||m,text(h),ps.map(p=>p.textContent.trim()).join(' '));ps.forEach(p=>p.remove());m.querySelector('.memory-picture span')?.remove();}}
}
function book(b){
 iconButton(b.querySelector('[data-reset-bar]'),'ui-reset');
 const bar=b.querySelector('.book-actionbar');if(bar){const h=bar.querySelector('h3');if(h){bar.setAttribute('aria-label',h.textContent);h.remove();}}
 const passives=b.querySelector('.book-passives');const ph=passives?.querySelector(':scope>h3');if(ph){ph.classList.add('compact-head');}
}
function bag(b){
 for(const f of b.querySelectorAll('[data-bag-filter]')){const id=C.bagFilters[f.dataset.bagFilter];if(id)iconButton(f,id,BAG_UI.filterHints[f.dataset.bagFilter]||'');}
 const sort=b.querySelector('[data-sort-bag]');if(sort){const note=sort.getAttribute('title')||'';iconButton(sort,'ui-sort',note);}
 iconButton(b.querySelector('[data-shop-find]'),'ui-map-laden');
 const tools=b.querySelector('.bag-controls'),top=b.querySelector('.bag-toolbar'),shop=b.querySelector('[data-shop-find]');
 if(tools&&top&&!top.dataset.compact){top.dataset.compact='1';const coins=top.querySelector('span');if(coins){const n=coins.querySelector('b');coins.replaceChildren(icon('coins'),n||'');tip(coins,BAG_UI.coins,'');coins.tabIndex=0;}
  const cap=top.querySelector('.bag-capacity');if(cap){tip(cap,BAG_UI.slots,'');cap.tabIndex=0;cap.textContent=cap.textContent.replace(/\s*\D+$/,'');}
  if(shop)top.append(shop);tools.querySelector('.bag-search')?.before(top);}
}
function map(b){
 for(const f of b.querySelectorAll('.atlas-filters [data-filter]')){const id=C.mapFilters[f.dataset.filter];if(id)iconButton(f,id);}
 b.querySelector('.atlas-sidebar>.eyebrow')?.remove();
}
function talents(b){
 // Hinweiskasten „Wähle deinen Hauptbaum“ wird Tooltip des Knopfs „★ Hauptbaum wählen“ daneben.
 const box=b.querySelector('.tt-main-callout'),pick=b.querySelector('.tt-main-pick');if(box&&pick){tip(pick,text(box.querySelector('b')),text(box.querySelector('span')));box.remove();}
}
export function compactWindow(w){const b=w.body,touch=document.body.classList.contains('touch-mode');b.classList.add('compact-window');
 if(w.id==='person')person(b,touch);else if(w.id==='quest')quest(b);else if(w.id==='book')book(b);else if(w.id==='bag')bag(b);else if(w.id==='map')map(b);else if(w.id==='talents')talents(b);
}
