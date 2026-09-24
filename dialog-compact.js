// Gespräch kompakt wie das WoW-Questfenster (Runde 2, 2026-09-24):
// - Porträt und Name in die Titelzeile, die Kopfkarte entfällt (Rolle im Tooltip des Namens).
// - Keine Pergamentkarten; der Gesprächstext zeigt so viel, wie Platz ist (Runde 3b: bis zehn Zeilen), der Rest steht im Tooltip und hinter „Mehr“.
// - Antwortknöpfe immer sichtbar unten; „Annehmen“ heißt Annehmen, der witzige Satz steht im Tooltip.
// - Mehrere Aufträge eines Gebers als Gossip-Zeilen (Symbol ! oder ?), ein Klick zeigt den Auftrag.
// Arbeitet nur auf dem fertigen DOM; Datenattribute und Klickwege bleiben unangetastet.
import {DIALOG_UI as T} from './content/index.js';
import {glyph} from './ui-glyphs.js';
const text=el=>el?.textContent.replace(/\s+/g,' ').trim()||'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tip(el,label,note=''){el.dataset.tooltipLabel=label;el.dataset.tooltipNote=note;el.removeAttribute('title');}
/** Knopftext kurz, der ursprüngliche Satz wandert in den Tooltip. */
function shortLabel(b,label){const was=text(b);if(!was||b.dataset.dlgShort)return;b.dataset.dlgShort='1';if(was!==label){tip(b,label,esc(was));b.setAttribute('aria-label',label+': '+was);}b.textContent=label;}
/** Aufeinanderfolgende Absätze und Zitate zu einem Textblock mit höchstens drei sichtbaren Zeilen. */
function textBlocks(root,name=''){
 const isText=el=>el.matches?.('p:not(.requirements-failed):not(.build-line),.conversation-quote,.chapter-summary')&&!el.closest('.dialog-actions,.reward-picker,.reward-tiles');
 const kids=[...root.children];let run=[];
 const flush=()=>{if(!run.length)return;const box=document.createElement('div');box.className='dlg-text';run[0].before(box);const inner=document.createElement('div');inner.className='dlg-lines';for(const p of run)inner.append(p);box.append(inner);
  const full=run.map(p=>esc(text(p))).join('<br><br>');box.tabIndex=0;tip(box,name||' ',full);
  const more=document.createElement('button');more.type='button';more.className='dlg-more';more.setAttribute('aria-label',T.more);tip(more,T.more,'');more.innerHTML=glyph('more');more.hidden=true;box.append(more);run=[];};
 for(const el of kids){if(isText(el))run.push(el);else flush();}flush();
 for(const card of root.querySelectorAll(':scope>.hotspot-offer,:scope>article'))textBlocks(card,name);}
/** Nach dem Layout: „Mehr“ nur zeigen, wo der Text wirklich abgeschnitten ist. */
// Runde 3b (2026-09-24): Der Text zeigt so viele Zeilen, wie das Fenster bis zur gemeinsamen Unterkante hergibt (höchstens zehn, fenster-r3.css);
// nur wenn er dann noch nicht passt, erscheint „Mehr“ – als eigene Zeile rechts unter dem Text, nie auf dem letzten Wort. Abgeschnitten wird
// immer an einer ganzen Zeile.
export function measureDialog(w){for(const box of w.body.querySelectorAll('.dlg-text')){const lines=box.querySelector('.dlg-lines'),more=box.querySelector('.dlg-more');if(!lines||!more)continue;
  lines.style.maxHeight='';more.hidden=true;if(box.classList.contains('open')){more.hidden=false;continue;}
  const lh=parseFloat(getComputedStyle(lines).lineHeight)||20;if(lines.scrollHeight<=lines.clientHeight+2)continue;
  more.hidden=false;const room=lines.clientHeight;lines.style.maxHeight=Math.max(lh*2,Math.floor(room/lh)*lh)+'px';}}
function portrait(w){const bar=w.el.querySelector('.popup-titlebar'),head=w.body.querySelector('.conversation-person');bar.querySelector('.dlg-portrait')?.remove();bar.classList.remove('has-portrait');
 if(!head)return;const pic=head.querySelector('.conversation-portrait');const name=text(head.querySelector('strong')),role=text(head.querySelector('small'));
 if(pic){pic.classList.remove('conversation-portrait');pic.classList.add('dlg-portrait');pic.dataset.conversationNpc=head.dataset.conversationNpc||'';bar.querySelector('.popup-emblem')?.after(pic);bar.classList.add('has-portrait');}
 const strong=bar.querySelector('strong');if(name){strong.textContent=name;tip(strong,name,esc(role));}
 // Die Kopfkarte bleibt als unsichtbarer Anker (Prüfungen fragen data-conversation-npc ab), zeigt aber nichts mehr.
 head.hidden=true;head.classList.add('dlg-head-hidden');}
function gossip(w){const offers=[...w.body.querySelectorAll(':scope>.hotspot-offer')];if(offers.length<2)return;
 const list=document.createElement('nav');list.className='dlg-gossip';list.setAttribute('aria-label',T.offers);
 list.innerHTML=offers.map((o,i)=>{const ready=!!o.querySelector('[data-hs-claim]'),title=text(o.querySelector('h2'));return `<button type="button" data-dlg-offer="${i}"><i class="ql-mark ${ready?'ql-ready':'ql-side'}" aria-hidden="true"></i><span>${esc(title)}</span></button>`;}).join('');
 offers[0].before(list);offers.forEach(o=>o.hidden=true);
 const back=document.createElement('button');back.type='button';back.className='ql-tool dlg-back';back.setAttribute('aria-label','Zurück');tip(back,'Zurück','');back.innerHTML=glyph('back');
 list.onclick=e=>{const b=e.target.closest('[data-dlg-offer]');if(!b)return;list.hidden=true;const o=offers[Number(b.dataset.dlgOffer)];o.hidden=false;o.querySelector('h2')?.prepend(back);measureDialog(w);};
 back.onclick=e=>{e.stopPropagation();offers.forEach(o=>o.hidden=true);list.hidden=false;back.remove();};}
export function dialogWindow(w){const b=w.body;b.classList.add('dlg-compact');
 portrait(w);
 b.querySelectorAll(':scope>.eyebrow').forEach(e=>e.remove());
 // Kleingedrucktes zum Ziel (Dropchance, Abgabeort) wird Tooltip am Ziel.
 for(const obj of b.querySelectorAll('.quest-objective')){const after=obj.nextElementSibling?.matches('small')?obj.nextElementSibling:null,notes=[...obj.querySelectorAll('small'),...(after?[after]:[])];if(!notes.length)continue;const note=notes.map(text).join(' · ');notes.forEach(n=>n.remove());tip(obj,text(obj),esc(note));obj.tabIndex=0;obj.classList.add('has-note');}
 textBlocks(b,text(w.el.querySelector('.popup-titlebar strong')));
 for(const a of b.querySelectorAll('#acceptQuest,[data-hs-accept],[data-accept-side]'))shortLabel(a,T.accept);
 for(const bar of b.querySelectorAll('.dialog-actions')){if(!bar.querySelector('#acceptQuest,[data-hs-accept],[data-accept-side]'))continue;for(const c of bar.querySelectorAll('[data-close]'))if(text(c).length>12)shortLabel(c,T.later);}
 gossip(w);
 b.onclick=e=>{const more=e.target.closest('.dlg-more');if(!more)return;const box=more.closest('.dlg-text');box.classList.toggle('open');tip(more,box.classList.contains('open')?T.less:T.more,'');measureDialog(w);};
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(w.el.isConnected)measureDialog(w);}));}
