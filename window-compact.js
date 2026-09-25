// Einzelfenster verdichten (2026-09-23): Fließtext und Beschriftungen wandern in Tooltips, Knöpfe und Filter
// werden Symbole mit Namen im Hover. Läuft nach dem Aufbau jedes Fensters (panel-pages.js → decoratePanel),
// arbeitet nur auf dem fertigen DOM und lässt Datenattribute, Klickwege und aria-Namen unangetastet.
import {BAG_UI,WINDOW_UI,TALENT_COMPACT as TC} from './content/index.js';
import {glyph} from './ui-glyphs.js';
const C=WINDOW_UI.compact;
const icon=id=>{const c=document.createElement('canvas');c.width=c.height=48;c.dataset.uiIcon=id;c.setAttribute('aria-hidden','true');return c;};
/** Tooltip statt Beschriftung: Name in den Hover, sichtbar bleibt nur das Symbol. */
function tip(el,label,note=''){if(!el)return;el.dataset.tooltipLabel=label;el.dataset.tooltipNote=note;el.removeAttribute('title');}
/** Knopf auf ein Symbol reduzieren; der alte Text bleibt als Tooltip und Vorlesename. */
function iconButton(b,id,note=''){if(!b||b.dataset.compact)return;const label=b.textContent.trim();b.dataset.compact='1';b.classList.add('icon-only');if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',label);tip(b,label,note);b.replaceChildren(icon(id));}
const text=(el)=>el?.textContent.trim()||'';
function person(b,touch){
 // Runde 3b (2026-09-24): das Handy bekommt dieselbe verdichtete Figur wie der Desktop (keine Reiter, Werteleiste, Name in der Titelzeile).
 b.querySelector('.meter-entry-wrap')?.remove();
 const head=b.querySelector('.rpg-heading');if(head){const sub=head.querySelector('p');if(sub){head.dataset.sub=sub.textContent;sub.classList.add('sub-line');}}
 // Name nur einmal (Runde 1, 2026-09-24): der Heldenname wandert in die Titelzeile wie im Charakterfenster des Vorbilds, die Überschrift entfällt.
 const name=head?.querySelector('h2'),bar=b.closest('.game-popup')?.querySelector('.popup-titlebar strong');if(name&&bar){const badge=name.querySelector('.dg-title-badge')/* Dungeon Etappe 4 Teil B: Titel als Medaille neben dem Namen */;bar.textContent=name.textContent.trim();if(badge)bar.append(badge);name.remove();}
 b.querySelectorAll('.gear-cell>small').forEach(e=>e.remove());b.querySelectorAll('.gear-footer h4').forEach(e=>e.remove());
 const [turn,roster]=b.querySelectorAll('.armory-controls button');iconButton(turn,'ui-reset');iconButton(roster,'person');
 const starter=b.querySelector('.starter-armory');if(starter){const note=starter.querySelector('small');tip(starter.querySelector('button'),text(starter.querySelector('button')),text(note));note?.remove();}
 // Runde 2 (2026-09-24, gemeinsame Unterkante): die Figur muss in 484 px passen. Die Zeile „Stufe 12 · Tresenbrecher · …“ wird
 // Tooltip des Namens in der Titelzeile, „Clankiste“ ein Symbol neben Drehen/Wechseln.
 {const sub=head?.querySelector('.sub-line');if(sub&&bar){tip(bar,bar.textContent.trim(),sub.textContent.trim());bar.tabIndex=0;sub.remove();}
  const box=b.querySelector('.starter-armory'),chest=box?.querySelector('button'),controls=b.querySelector('.armory-controls');if(chest&&controls){const label=chest.dataset.tooltipLabel||text(chest),note=chest.dataset.tooltipNote||'';iconButton(chest,'bag',note);tip(chest,label,note);controls.append(chest);box.remove();}}
 // Werte: Symbol + Zahl, Name und Wirkung im Tooltip (Zweitwerte haben ihren eigenen Wert-Tooltip).
 const chip=(row,id)=>{const label=row.querySelector('small');if(!label||row.dataset.compact)return;row.dataset.compact='1';tip(row,label.textContent.trim(),'');row.tabIndex=0;label.replaceWith(icon(id));};
 const [melee,ranged]=b.querySelectorAll('.weapon-summary>div');chip(melee,'ui-stat-nahkampf');chip(ranged,'ui-stat-fernkampf');
 const [hp,coins]=b.querySelectorAll('.character-stats>div');chip(hp,'ui-stat-leben');chip(coins,'coins');
 // Runde 4c: Handy quer hat nur Platz für die aktuelle Lebenszahl – „/ Höchstwert“ steht in eigener Spanne (quer ausgeblendet, fenster-r4c.css) und im Tooltip.
 {const v=hp?.querySelector('b'),m=v&&!v.querySelector('.hp-max')&&v.textContent.match(/^(.*?)\s*\/\s*(.+)$/);if(m){tip(hp,hp.dataset.tooltipLabel||'',v.textContent.trim());v.replaceChildren(m[1],Object.assign(document.createElement('span'),{className:'hp-max',textContent:' / '+m[2]}));}}
 for(const row of b.querySelectorAll('.secondary-stats>[data-stat-tip]')){const name=row.querySelector('span');if(!name||row.dataset.compact)continue;row.dataset.compact='1';row.setAttribute('aria-label',name.textContent);name.replaceWith(icon(C.statIcons[row.dataset.statTip]||'person'));}
 // Alles in eine Werteleiste: Waffen, Leben, Geld, Zweitwerte.
 const stats=document.createElement('div');stats.className='compact-stats';for(const row of b.querySelectorAll('.weapon-summary>div,.character-stats>div,.secondary-stats>[data-stat-tip]'))stats.append(row);
 const anchor=b.querySelector('.weapon-summary');if(anchor&&stats.children.length){anchor.before(stats);b.querySelectorAll('.weapon-summary,.character-stats,.secondary-stats').forEach(e=>e.remove());}
 // Runde 3b: sehr schmale Hochkant-Schirme teilen die Figur in zwei Reiter – Schmuck und Waffen stehen dann bei den Werten.
 if(touch&&b.querySelector(':scope>.panel-tabs')){const pane=stats.closest('.panel-page'),foot=b.querySelector('.gear-footer');if(pane&&foot)pane.prepend(foot);}
 // Runde 3b: am Handy stehen Drehen/Wechseln/Clankiste als Symbole in der Titelzeile – die Puppe braucht die Höhe.
 const pop=b.closest('.game-popup'),controls=b.querySelector('.armory-controls');if(touch&&pop&&controls){const title=pop.querySelector('.popup-titlebar');title.querySelector('.person-title-tools')?.remove();const tools=document.createElement('div');tools.className='book-title-tools person-title-tools';for(const btn of controls.querySelectorAll('button')){btn.classList.add('ql-tool');tools.append(btn);}title.querySelector('.popup-close').before(tools);controls.remove();}
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
 // Bude (Runde 2): jedes Gebäude eine Zeile – Symbol, Name, Stufe, Knopf „Ausbauen“; Text, Kosten und Vorteil im Tooltip.
 for(const card of b.querySelectorAll('.build-card')){if(card.dataset.compact)continue;card.dataset.compact='1';const head=card.querySelector('header'),name=text(head?.querySelector('h3'));
  const stage=card.querySelector('.build-stage'),next=card.querySelector('.build-next'),btn=next?.querySelector('[data-build]');
  const notes=[text(stage),...[...card.querySelectorAll(':scope>p:not(.build-stage),.build-next>b,.build-next li,.build-effect,.build-next small')].map(e=>text(e))].filter(Boolean);
  tip(card,name,notes.map(n=>n.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))).join('<br>'));card.tabIndex=0;head?.removeAttribute('data-describe');head?.removeAttribute('tabindex');
  const badge=document.createElement('span');badge.className='build-badge';badge.textContent=/^Stufe\s+(\d+)/.exec(text(stage))?.[1]||'0';
  card.querySelectorAll(':scope>p').forEach(e=>e.remove());next?.remove();card.append(badge);if(btn){btn.classList.add('build-go');card.append(btn);}}
 const effects=b.querySelector('.base-effects');if(effects&&!effects.dataset.compact){effects.dataset.compact='1';effects.classList.add('compact-effects');}
 b.querySelector('.base-build>.rpg-heading')?.remove();
 // Erinnerungen: bekannte als Bildkachel mit Text im Tooltip, unbekannte als stille Platzhalter.
 const list=b.querySelector('.memory-list');if(list&&!list.dataset.compact){list.dataset.compact='1';list.classList.add('memory-tiles');
  for(const m of list.querySelectorAll('.memory-entry')){const h=m.querySelector('h3');if(m.classList.contains('unknown')){m.replaceChildren();tip(m,C.memoryUnknown,text(h));m.tabIndex=0;continue;}
   const ps=[...m.querySelectorAll(':scope>p')];tip(m.querySelector('.memory-picture')||m,text(h),ps.map(p=>p.textContent.trim()).join(' '));ps.forEach(p=>p.remove());m.querySelector('.memory-picture span')?.remove();}}
}
function book(b,touch){
 iconButton(b.querySelector('[data-reset-bar]'),'ui-reset');
 const bar=b.querySelector('.book-actionbar');if(bar){const h=bar.querySelector('h3');if(h){bar.setAttribute('aria-label',h.textContent);h.remove();}}
 const passives=b.querySelector('.book-passives');const ph=passives?.querySelector(':scope>h3');if(ph){ph.classList.add('compact-head');}
 // Runde 3b (2026-09-24): auch am Handy das Zauberbuch – „Touchbuttons belegen“ wird ein Symbol in der Titelzeile.
 const touchEdit=touch?b.querySelector('.person-skills>[data-shell="mobile"]'):null;
 // Runde 2 (2026-09-24, WoW-Zauberbuch): „Leiste: Standardbelegung“ als Symbol in die Titelzeile, Eigenarten hinter einem Trenner mit
 // Symbol (Name im Tooltip), der Knopf „Eigene Spezialisierungen [N]“ entfällt (Taste N und Menüleiste).
 const title=b.closest('.game-popup')?.querySelector('.popup-titlebar');title?.querySelector('.book-title-tools')?.remove();
 const reset=b.querySelector('[data-reset-bar]');if(reset&&title){const tools=document.createElement('div');tools.className='book-title-tools';reset.classList.add('ql-tool');tools.append(reset);if(touchEdit){const label=touchEdit.textContent.trim();touchEdit.className='ql-tool';touchEdit.setAttribute('aria-label',label);tip(touchEdit,label,'');touchEdit.innerHTML=glyph('hand');tools.prepend(touchEdit);}(title.querySelector('.popup-key')||title.querySelector('.popup-close')).before(tools);}
 bar?.remove();
 if(ph){const line=document.createElement('div');line.className='book-divider';line.tabIndex=0;line.setAttribute('role','separator');line.setAttribute('aria-label',ph.textContent);tip(line,ph.textContent,'');line.innerHTML=glyph('leaf');ph.replaceWith(line);}
}
function bag(b){
 for(const f of b.querySelectorAll('[data-bag-filter]')){const id=C.bagFilters[f.dataset.bagFilter];if(id)iconButton(f,id,BAG_UI.filterHints[f.dataset.bagFilter]||'');}
 const sort=b.querySelector('[data-sort-bag]');if(sort){const note=sort.getAttribute('title')||'';iconButton(sort,'ui-sort',note);}
 iconButton(b.querySelector('[data-shop-find]'),'ui-map-laden');
 const tools=b.querySelector('.bag-controls'),top=b.querySelector('.bag-toolbar'),shop=b.querySelector('[data-shop-find]');
 if(tools&&top&&!top.dataset.compact){top.dataset.compact='1';const coins=top.querySelector('span');if(coins){const n=coins.querySelector('b');coins.replaceChildren(icon('coins'),n||'');tip(coins,BAG_UI.coins,'');coins.tabIndex=0;}
  const cap=top.querySelector('.bag-capacity');if(cap){tip(cap,BAG_UI.slots,'');cap.tabIndex=0;cap.textContent=cap.textContent.replace(/\s*\D+$/,'');}
  if(shop)top.append(shop);tools.querySelector('.bag-search')?.before(top);}
 // Runde 3b (2026-09-24, WoW-Beutel): der Kopf ist EINE Zeile – Filter und Lupe (klappt das Suchfeld über den Filtern auf).
 // Münzen, Platz, Sortierart, Sortieren und Laden stehen unten wie im Beutel des Vorbilds.
 const pop=b.closest('.game-popup'),grid=b.querySelector('.bag-grid'),search=tools?.querySelector('.bag-search');
 if(tools&&grid&&top&&!tools.dataset.r3){tools.dataset.r3='1';tools.classList.add('bag-head');
  const input=search?.querySelector('input'),lupe=document.createElement('button');lupe.type='button';lupe.className='ql-tool bag-lupe';lupe.innerHTML=glyph('magnify');lupe.setAttribute('aria-label',BAG_UI.search);tip(lupe,BAG_UI.search,'');
  const open=on=>{pop?.classList.toggle('bag-search-open',on);lupe.classList.toggle('on',on);};
  lupe.onclick=()=>{const on=!pop?.classList.contains('bag-search-open');open(on);if(on)input?.focus();else if(input&&input.value){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}};
  input?.addEventListener('blur',()=>{if(!input.value)open(false);});input?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));open(false);input.blur();}});
  lupe.classList.toggle('on',!!pop?.classList.contains('bag-search-open'));
  const sortBox=tools.querySelector('.bag-sort'),sortBtn=sortBox?.querySelector('[data-sort-bag]'),mode=sortBox?.querySelector('label');
  const end=document.createElement('div');end.className='bag-head-tools';end.append(lupe);tools.append(end);
  const foot=document.createElement('div');foot.className='bag-foot';foot.append(...[...top.childNodes]);if(mode){mode.querySelector('span')?.remove();mode.classList.add('bag-mode');tip(mode,BAG_UI.sortLabel,'');foot.append(mode);}if(sortBtn){sortBtn.classList.add('ql-tool');foot.append(sortBtn);}
  const shopBtn=foot.querySelector('[data-shop-find]');if(shopBtn){shopBtn.classList.add('ql-tool');foot.append(shopBtn);}
  top.remove();sortBox?.remove();grid.after(foot);}
 // Runde 3b: am Handy passt der volle Rucksack quer (mit Safe Areas) nicht in 44-px-Reihen – dann zeigt das Raster leere Plätze nur bis
 // zum Ende der letzten belegten Reihe (die freie Zahl steht unten: 8/24), statt die Reihen unter 44 px zu drücken.
 if(document.body.classList.contains('touch-mode')&&grid)requestAnimationFrame(()=>{if(!grid.isConnected)return;const first=grid.firstElementChild;if(!first||first.getBoundingClientRect().height>=43.5)return;const cols=getComputedStyle(grid).gridTemplateColumns.split(' ').length||1,slots=[...grid.children],used=slots.filter(e=>!e.classList.contains('empty')).length,keep=Math.max(cols,Math.ceil(used/cols)*cols);slots.slice(keep).forEach(e=>{if(e.classList.contains('empty'))e.remove();});});
}
/** Karte: seit Runde 4a baut atlas-ui.js Titelzeile, Filterliste und Seitenleiste selbst (Symbole, keine Reiter). */
function map(){}
function talents(b,touch){
 // Hinweiskasten „Wähle deinen Hauptbaum“ wird Tooltip des Knopfs „★ Hauptbaum wählen“ daneben.
 const box=b.querySelector('.tt-main-callout'),pick=b.querySelector('.tt-main-pick');if(box&&pick){tip(pick,text(box.querySelector('b')),text(box.querySelector('span')));box.remove();}
 talentsDesktop(b,touch);
}
/** Runde 2 (2026-09-24): Talente ohne Scrollen auf der gemeinsamen Oberkante. Keine Suche, keine Pergament-Detailspalte (Details im
 *  Tooltip, Klick lernt, Rechtsklick nimmt zurück), Spec-Wappen, Punkte, Hauptbaum und Zurücksetzen als Symbole in der Titelzeile,
 *  die drei Pfade als Symbolreiter unten neben der Pfadtreue. Vor Stufe 5 nur eine kleine Vorschau: drei Wappen und ein Schloss. */
function talentsDesktop(b,touch=false){
 const menu=b.querySelector('.tt-menu'),popup=b.closest('.game-popup'),bar=popup?.querySelector('.popup-titlebar');if(!menu||!bar)return;
 b.classList.add('tt-compact');bar.querySelectorAll('.tt-title-tools').forEach(e=>e.remove());
 b.querySelectorAll('.talent-search,[data-talent-search-info],.tt-details,.tt-main-callout,.talent-preview-note').forEach(e=>e.remove());
 const specs=b.querySelector('.tt-spec-tabs');for(const s of specs?.querySelectorAll('[data-view-tree]')||[]){s.classList.add('tt-spec-icon');s.removeAttribute('title');}
 const unlocked=menu.dataset.specUnlocked==='true';b.classList.toggle('tt-locked',!unlocked);popup.classList.toggle('narrow',!unlocked);
 if(!unlocked){const lock=document.createElement('div');lock.className='tt-lock-row';lock.tabIndex=0;tip(lock,TC.locked(menu.dataset.specLevel||5),TC.lockedNote);lock.innerHTML=glyph('lock')+'<span>'+TC.locked(menu.dataset.specLevel||5)+'</span>';specs?.after(lock);return;}
 const tools=document.createElement('div');tools.className='tt-title-tools';
 const bank=b.querySelector('.tt-bank');if(bank){tip(bank,TC.free,TC.freeNote);bank.tabIndex=0;tools.append(bank);}
 const main=b.querySelector('.tt-toolbar [data-spec]'),active=b.querySelector('.tt-main-active');
 if(main){const note=main.dataset.tooltipNote||TC.mainNote;main.classList.add('ql-tool','tt-star');main.setAttribute('aria-label',TC.main);tip(main,TC.main,note);main.innerHTML=glyph('spark');tools.append(main);}
 else if(active){active.classList.add('ql-tool','on','tt-star');tip(active,TC.mainActive,TC.mainNote);active.tabIndex=0;active.innerHTML=glyph('spark');tools.append(active);}
 const reset=b.querySelector('[data-reset-talents]');if(reset){reset.classList.add('ql-tool');tip(reset,TC.reset,'');tools.append(reset);}
 // Runde 3b: am Handy ist die Titelzeile zu schmal – die Wappen stehen dort neben den Pfaden (unten bzw. quer rechts).
 if(specs&&!touch)tools.append(specs);
 (bar.querySelector('.popup-key')||bar.querySelector('.popup-close')).before(tools);
 b.querySelector('.tt-toolbar')?.remove();
 // Pfade als Symbolreiter unten, in einer Zeile mit Pfadtreue und Boni.
 const paths=b.querySelector('.tt-path-tabs'),bonus=b.querySelector('.tt-bonuses');if(paths&&bonus){bonus.prepend(paths);bonus.querySelector(':scope>span')?.remove();}
 if(touch&&specs&&bonus){specs.classList.add('tt-spec-body');bonus.prepend(specs);}
}
/** Einstellungen (Runde 2): Erklärsätze in Tooltips, damit das Fenster ohne Scrollen passt. */
function settings(b){
 const bars=b.querySelector('.bar-settings');const small=bars?.querySelector('small');if(small){const label=bars.querySelector('.setting-label');if(label){tip(label,text(label),text(small));label.tabIndex=0;}small.remove();}
 for(const el of b.querySelectorAll('.help-settings [title]')){const label=text(el.querySelector('.setting-label'))||text(el);tip(el,label,el.getAttribute('title'));}
}
/** Spielmenü am Handy (Runde 3b): Berufe, Fahrzeuge und Söldner werden weitere Kacheln im Fensterraster statt Textknöpfen,
 *  die Trennstriche entfallen – so passt das Menü quer und hoch ohne Scrollen. */
function menu(b,touch){if(!touch)return;const grid=b.querySelector('.game-menu-windows'),acts=b.querySelector('.game-menu-actions');if(!grid||!acts)return;
 for(const [shell,id,short] of C.menuTiles){const btn=acts.querySelector(`[data-shell="${shell}"]`);if(!btn)continue;const full=(btn.querySelector('span')||btn).textContent.trim(),label=short||full;btn.removeAttribute('title');btn.setAttribute('aria-label',full);btn.classList.add('menu-extra-tile');btn.replaceChildren(icon(id),Object.assign(document.createElement('span'),{textContent:label}));grid.append(btn);}
 acts.querySelectorAll('.game-menu-sep').forEach(e=>e.remove());}
export function compactWindow(w){const b=w.body,touch=document.body.classList.contains('touch-mode');b.classList.add('compact-window');
 if(w.id==='person')person(b,touch);else if(w.id==='quest')quest(b);else if(w.id==='book')book(b,touch);else if(w.id==='bag')bag(b);else if(w.id==='map')map(b);else if(w.id==='talents')talents(b,touch);else if(w.id==='settings')settings(b);else if(w.id==='menu')menu(b,touch);
}
