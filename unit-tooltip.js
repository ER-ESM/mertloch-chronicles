// Gegner-Tooltip in der Welt wie WoWs GameTooltip (Runde 5a, 2026-09-24, Kenner-Befund 2): Maus über einem Gegner zeigt Name,
// Stufe, Elite/Neutral und – wenn er für einen Auftrag zählt – die Auftragszeile „Pfandkeiler von den Trümmern jagen 0/3“.
// Sammelziele tragen die Dropchance als Würfel „~50 %“. Gleiche Art außerhalb des Zielgebiets steht blass mit „zählt hier nicht“.
// Der Tooltip sitzt wie in WoW fest unten rechts über der Menüleiste – nie auf der eigenen Figur (Kenner-Befund 3) und nie auf dem
// Namensschild des Gegners, über dem die Maus gerade steht (am Mauszeiger verdeckte er genau dieses Schild).
import {UNIT_TIP as T} from './content/index.js';
import {questLines} from './quest-mobs.js';
import {isNeutralUnit} from './unit-colors.js';
import {glyph} from './ui-glyphs.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/** Inhalt (rein, testbar). */
export function unitTipHtml(g,e){
 const neutral=isNeutralUnit(e),sub=[T.level(e.level||1),e.elite?T.elite:'',neutral?T.neutral:''].filter(Boolean).join(' · ');
 const lines=questLines(g,e).map(l=>`<div class="ut-quest${l.outside?' outside':''}${l.done>=l.need?' done':''}"><i aria-hidden="true"></i><span>${esc(l.title)}</span><b>${l.done}/${l.need}</b>`
  +(l.chance?`<small class="ut-drop" data-chance="${Math.round(l.chance*100)}">${glyph('dice')}${esc(l.item||'')} ${esc(T.chance(Math.round(l.chance*100)))}</small>`:'')
  +(l.outside?`<small class="ut-drop">${esc(T.outside)}</small>`:'')+`</div>`).join('');
 return `<strong class="ut-name ${neutral?'neutral':'hostile'}">${esc(e.name)}</strong><span class="ut-sub">${esc(sub)}</span>${lines}`;
}
/** Feste Lage unten rechts: rechte Kante bündig mit der Menüleiste, 10 px darüber (ohne Leiste 16/90 px vom Rand). */
export function tipAnchor(size,rail,view){const right=rail?.width?rail.right:view.r-16,bottom=rail?.height?rail.top-10:view.b-90;return {x:Math.round(Math.max(view.l+8,right-size.w)),y:Math.round(Math.max(view.t+8,bottom-size.h))};}
export function mountUnitTooltip({game,world=document.querySelector('#world'),shell=document.querySelector('#gameShell')}={}){
 const el=document.createElement('aside');el.className='unit-tooltip';el.hidden=true;el.setAttribute('role','tooltip');(shell||document.body).append(el);
 let mouse=null,shownFor=null,html='';
 world?.addEventListener('pointermove',e=>{mouse=e.pointerType==='touch'?null:{x:e.clientX,y:e.clientY};},{passive:true});
 world?.addEventListener('pointerleave',()=>{mouse=null;});
 function update(){const g=game(),u=g?.hoverUnit;const e=u?.kind==='enemy'&&!g.dead&&!g.paused?u.ref:null;
  if(!e||!mouse||document.body.classList.contains('touch-mode')){if(!el.hidden){el.hidden=true;shownFor=null;}return;}
  const next=unitTipHtml(g,e);if(next!==html||shownFor!==e){html=next;el.innerHTML=next;shownFor=e;}el.hidden=false;
  const rail=document.querySelector('.game-menu-rail')?.getBoundingClientRect(),p=tipAnchor({w:el.offsetWidth,h:el.offsetHeight},rail,{l:0,t:0,r:innerWidth,b:innerHeight});el.style.left=p.x+'px';el.style.top=p.y+'px';}
 const timer=setInterval(update,80);
 return {update,stop:()=>clearInterval(timer),el};
}
