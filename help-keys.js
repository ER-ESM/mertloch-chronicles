// Hilfe als Tastenkappen-Raster (Runde 2, 2026-09-24, Zielbild 2 aus docs/REVIEW-GRAFIK-2026-09-24-r2.md):
// Zeilen nach Thema, je Kappe „Taste → Symbol“, die Erklärung nur im Tooltip. Reiter als Symbole in der Titelzeile (Tasten, Kniffe),
// dazu der Einführungsfilm als Symbolknopf. Einstellungen stehen im Spielmenü (eigenes Fenster), nicht mehr hier.
import {HELP_GRID as T,INTRO_UI} from './content/index.js';
import {glyph} from './ui-glyphs.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MOUSE={mouse:['mouse',''],mouseR:['mouse','r'],mouse2:['mouse','2×'],drag:['hand','']};
const symbol=id=>id?.startsWith('ui:')?`<canvas width="48" height="48" data-ui-icon="${esc(id.slice(3))}" aria-hidden="true"></canvas>`:glyph(id);
const cap=k=>{const m=MOUSE[k];if(m)return `<kbd class="hk-cap hk-mouse${m[1]==='r'?' hk-right':''}">${glyph(m[0])}${m[1]&&m[1]!=='r'?`<small>${esc(m[1])}</small>`:''}</kbd>`;return k==='–'?'<span class="hk-dash">–</span>':`<kbd class="hk-cap${k.length>2?' hk-wide':''}">${esc(k)}</kbd>`;};
function item(e){return `<span class="hk-item" tabindex="0" data-tooltip-label="${esc(e.label)}" data-tooltip-note="${esc(e.note)}" aria-label="${esc(e.label+': '+e.note)}">${e.keys.map(cap).join('')}<i class="hk-arrow" aria-hidden="true"></i><span class="hk-to">${symbol(e.to)}</span></span>`;}
export function helpPanel({touch=false,kniffe=''}={}){
 const rows=(touch?T.touch:T.desktop).map(([name,icon,items])=>`<div class="hk-row"><span class="hk-topic" tabindex="0" data-tooltip-label="${esc(name)}" data-tooltip-note="" aria-label="${esc(name)}">${symbol(icon)}</span>${items.map(item).join('')}</div>`).join('');
 const tabs=`<nav class="help-tabs panel-tabs" role="tablist">${T.tabs.map(([id,name,icon,note])=>`<button type="button" role="tab" class="ql-tool" data-help-tab="${id}" aria-label="${esc(name)}" data-tooltip-label="${esc(name)}" data-tooltip-note="${esc(note)}">${glyph(icon)}<span class="ql-tab-name">${esc(name)}</span></button>`).join('')}<button type="button" class="ql-tool" data-intro-replay aria-label="${esc(INTRO_UI.helpButton||T.film)}" data-tooltip-label="${esc(T.film)}" data-tooltip-note="${esc(T.filmNote)}">${glyph('film')}</button></nav>`;
 return `${tabs}<section class="help-grid" data-help-page="keys">${rows}</section><section class="guide-kniffe" data-help-page="kniffe">${kniffe}</section>`;
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
