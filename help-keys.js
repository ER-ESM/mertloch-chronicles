// Hilfe als Tastenbelegungsliste (Runde 3b, 2026-09-24, Zielbild 3 aus docs/REVIEW-GRAFIK-2026-09-24-r3.md; löst das Kappen-Raster aus Runde 2 ab):
// je Zeile Taste + ein Wort, Themen in drei Spalten, Tooltip nur mit Mehrwert. Reiter als Symbole in der Titelzeile (Tasten, Kniffe),
// dazu der Einführungsfilm als Symbolknopf. Einstellungen stehen im Spielmenü (eigenes Fenster), nicht mehr hier.
import {HELP_GRID as T,INTRO_UI} from './content/index.js';
import {glyph} from './ui-glyphs.js';
import {keysOf,liveKeymap} from './keymap.js';
import {bindingLabel} from './bar-keys.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MOUSE={mouse:['mouse',''],mouseR:['mouse','r'],mouse2:['mouse','2×'],drag:['hand','']};
const symbol=id=>id?.startsWith('ui:')?`<canvas width="48" height="48" data-ui-icon="${esc(id.slice(3))}" aria-hidden="true"></canvas>`:glyph(id);
const cap=k=>{const m=MOUSE[k];if(m)return `<kbd class="hk-cap hk-mouse${m[1]==='r'?' hk-right':''}">${glyph(m[0])}${m[1]&&m[1]!=='r'?`<small>${esc(m[1])}</small>`:''}</kbd>`;return k==='–'?'<span class="hk-dash">–</span>':`<kbd class="hk-cap${k.length>2?' hk-wide':''}">${esc(k)}</kbd>`;};
/** Hilfe-Einträge → Aktionen der Tastenbelegung (keymap.js): die Kappen zeigen die wirksame Taste statt des Standards. */
const ACT={'run|WASD':['moveUp','moveLeft','moveDown','moveRight'],'hand|F':['interact'],'ui:boots|X':['mount'],'target|Tab':['targetNext'],'ui:dash|Leer':['dash'],'ui:interrupt|Q':['interrupt'],'ui:person|C':['person'],'ui:quest|J':['quest'],'ui:talents|N':['talents'],'ui:map|M':['map'],'ui:book|P':['book'],'ui:bag|I':['bag'],'chart|V':['meter'],'ui:base|B':['base'],'hand|⇧B':['professions'],'ui:person|U':['companions'],'target|R':['aggro']};
const liveKeys=e=>{const ids=ACT[e.to+'|'+e.keys.join('')];if(!ids)return e.keys;const k=ids.map(id=>bindingLabel(keysOf(liveKeymap(),id)[0])||'–');return k;};
/** Runde 3b (2026-09-24, Zielbild 3): Tastenbelegungsliste wie im Vorbild – je Zeile Kappe(n) + ein Wort, kein Pfeil, kein Zielsymbol.
 *  Tooltip nur, wo er etwas hinzufügt (note nicht leer). Themen als Köpfe in drei Spalten (Handy zwei). */
function item(e){e={...e,keys:liveKeys(e)};const tip=e.note?` tabindex="0" data-tooltip-label="${esc(e.label)}" data-tooltip-note="${esc(e.note)}"`:'';return `<div class="hk-item${e.note?' hk-has-tip':''}"${tip} aria-label="${esc(e.label+(e.note?': '+e.note:''))}"><span class="hk-keys">${e.keys.map(cap).join('')}</span><span class="hk-word">${esc(e.label)}</span></div>`;}
export function helpPanel({touch=false,kniffe=''}={}){
 const groups=touch?T.touch:T.desktop,cols=(touch?T.columns?.touch:T.columns?.desktop)||[groups.map((_,i)=>i)];
 const section=([name,icon,items])=>`<section class="hk-group"><h3 class="hk-head"><span class="hk-topic" aria-hidden="true">${symbol(icon)}</span>${esc(name)}</h3>${items.map(item).join('')}</section>`;
 const rows=cols.map(list=>`<div class="hk-col">${list.map(i=>groups[i]).filter(Boolean).map(section).join('')}</div>`).join('');
 const tabs=`<nav class="help-tabs panel-tabs" role="tablist">${T.tabs.map(([id,name,icon,note])=>`<button type="button" role="tab" class="ql-tool" data-help-tab="${id}" aria-label="${esc(name)}" data-tooltip-label="${esc(name)}" data-tooltip-note="${esc(note)}">${glyph(icon)}<span class="ql-tab-name">${esc(name)}</span></button>`).join('')}<button type="button" class="ql-tool" data-intro-replay aria-label="${esc(INTRO_UI.helpButton||T.film)}" data-tooltip-label="${esc(T.film)}" data-tooltip-note="${esc(T.filmNote)}">${glyph('film')}</button></nav>`;
 return `${tabs}<section class="help-grid hk-list" data-help-page="keys">${rows}</section><section class="guide-kniffe" data-help-page="kniffe">${kniffe}</section>`;
}
function show(w,id){w.helpTab=id;for(const p of w.body.querySelectorAll('[data-help-page]'))p.hidden=p.dataset.helpPage!==id;for(const b of w.el.querySelectorAll('[data-help-tab]')){const on=b.dataset.helpTab===id;b.setAttribute('aria-selected',String(on));b.classList.toggle('on',on);}}
/** Reiter „Kniffe“: die Talente aller drei Bäume passen nicht zugleich ohne Scrollen – je Baum ein Umschalter, ein Baum sichtbar. */
function specPages(w){const sec=w.body.querySelector('.guide-kniffe .kniff-section:has(h4)');if(!sec)return;const heads=[...sec.querySelectorAll(':scope>h4')];if(heads.length<2)return;
 const nav=document.createElement('div');nav.className='kniff-spec-tabs';heads.forEach((h,i)=>{const grid=h.nextElementSibling;grid?.classList.add('kniff-spec-grid');grid.dataset.spec=String(i);const b=document.createElement('button');b.type='button';b.className='kniff-spec-tab';b.dataset.kniffSpec=String(i);b.textContent=h.textContent;nav.append(b);h.remove();});
 sec.querySelector(':scope>h3')?.after(nav);const pick=i=>{w.kniffSpec=i;for(const g of sec.querySelectorAll('.kniff-spec-grid'))g.hidden=g.dataset.spec!==String(i);for(const b of nav.children)b.classList.toggle('on',b.dataset.kniffSpec===String(i));};
 nav.onclick=e=>{const b=e.target.closest('[data-kniff-spec]');if(b)pick(Number(b.dataset.kniffSpec));};pick(w.kniffSpec||0);}
/** Lange Kachelreihen (Regeln: über hundert) blättern seitenweise statt zu scrollen: drei Zeilen je Seite. */
const PER_PAGE=42;
function gridPages(w){w.kniffPages??={};for(const [n,grid] of [...w.body.querySelectorAll('.guide-kniffe .kniff-grid')].entries()){const tiles=[...grid.children];if(tiles.length<=PER_PAGE)continue;const pages=Math.ceil(tiles.length/PER_PAGE);
 const nav=document.createElement('span');nav.className='kniff-pager';nav.innerHTML='<button type="button" data-kp="-1" aria-label="Vorherige Seite">'+glyph('back')+'</button><b></b><button type="button" data-kp="1" aria-label="Nächste Seite">'+glyph('next')+'</button>';grid.after(nav);
 const show=i=>{i=Math.max(0,Math.min(pages-1,i));w.kniffPages[n]=i;tiles.forEach((t,j)=>t.hidden=Math.floor(j/PER_PAGE)!==i);nav.querySelector('b').textContent=(i+1)+' / '+pages;nav.querySelector('[data-kp="-1"]').disabled=i===0;nav.querySelector('[data-kp="1"]').disabled=i===pages-1;};
 nav.onclick=e=>{const b=e.target.closest('[data-kp]');if(b)show((w.kniffPages[n]||0)+Number(b.dataset.kp));};show(w.kniffPages[n]||0);}}
/** Nach dem Aufbau: Reiter in die Titelzeile, gewählten Reiter zeigen. */
export function helpWindow(w){const bar=w.el.querySelector('.popup-titlebar');bar.querySelector('.help-tabs')?.remove();const tabs=w.body.querySelector('.help-tabs');if(tabs)(bar.querySelector('.popup-key')||bar.querySelector('.popup-close')).before(tabs);
 if(!w.el.dataset.helpWired){w.el.dataset.helpWired='1';w.el.addEventListener('click',e=>{const t=e.target.closest('[data-help-tab]');if(t)show(w,t.dataset.helpTab);});}
 specPages(w);gridPages(w);show(w,w.helpTab||'keys');}
