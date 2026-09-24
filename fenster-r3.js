// Optimierung Runde 3b „UI-Grafik & Handy“ (2026-09-24): kleine Nacharbeiten an fertigen Fenstern, die app.js nur aufruft.
// Belege in docs/OPTIMIERUNG-2026-09-24-runde-3b.md.
const touch=()=>document.body.classList.contains('touch-mode');
/** Kniffe am Handy: Die Touch-Übersetzung macht aus der Taste „Knopf 3“ oder „Seite 2 · Knopf 3“ – als Chip über der Kachel überdeckten
 *  sich die Beschriftungen. Wie am Desktop steht nur ein kurzes Tastenlabel oben rechts: „3“ bzw. „2·3“ (Seite·Knopf). Stiefel und Hand
 *  haben eigene feste Knöpfe und brauchen kein Label. Läuft nach translator.node(). */
export function touchKeys(w){if(!touch()||!w?.body)return;
 for(const k of w.body.querySelectorAll('.icon-skillbook kbd')){const t=k.textContent.trim(),m=/^\D*?(\d+)\D+(\d+)\s*$/.exec(t),n=/^\D*(\d+)\s*$/.exec(t);
  if(m){k.textContent=m[1]+'·'+m[2];k.classList.add('kbd-long');}else if(n){k.textContent=n[1];k.classList.remove('kbd-long');}else k.remove();}}
import {paintItem} from './item-art.js';
import {heroScreenRect} from './hero-reveal.js';
/** Runde 5b (Spielerbericht R5, Punkt 3): Rechteck des Helden auf dem Bildschirm; ohne Messung die Bildmitte (±60 × ±90 px). */
const heroBox=()=>{const h=heroScreenRect();if(h)return h;const cx=innerWidth/2,cy=innerHeight/2;return {left:cx-60,right:cx+60,top:cy-90,bottom:cy+30};};
const rect=s=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const b=e.getBoundingClientRect();return b.width&&b.height?b:null;};
const hit=(a,b)=>a&&b&&a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
let cmp=null;
/** Vergleichs-Tooltip ausblenden (mit dem Haupt-Tooltip). */
export function hideCompareTip(){cmp?.classList.add('hidden');}
/** Runde 3b (2026-09-24), Punkte 3 und 8: Tooltips liegen nie auf ihrem Auslöser.
 *  - In einem Fenster: seitlich daneben (rechts angedockte links, links angedockte rechts), Oberkante auf Höhe des Auslösers – nie über
 *    dem Fensterinhalt (WoW). Der Gegenstands-Vergleich „Angelegt“ steht als zweiter Tooltip außen daneben (ShoppingTooltip).
 *  - Aktionsleisten: über dem ganzen Leistenstapel, mittig über dem Platz – die Plätze bleiben frei.
 *  - Menüleiste: über der Leiste, rechtsbündig.
 *  - Immer: nie über Menüleiste oder Auftragsverfolgung (außer der Tooltip gehört zur Verfolgung), nie aus dem Bild. */
export function placeTooltip(tip,el,compareHtml=''){
 if(touch()||!tip||!el){hideCompareTip();return;}
 const W=innerWidth,H=innerHeight,G=8,w=tip.offsetWidth,h=tip.offsetHeight,r=el.getBoundingClientRect();
 const rail=rect('.game-menu-rail'),track=rect('.quest-panel'),area=rect('.action-area'),pop=el.closest('.game-popup:not(.popup-map)');
 let x=parseFloat(tip.style.left)||0,y=parseFloat(tip.style.top)||0,side='right';
 if(el.closest('.quest-panel')){/* Runde 2b: unter der Verfolgung in der HUD-Spalte – bleibt */}
 else if(pop){const p=pop.getBoundingClientRect();side=(p.left+p.right)/2>W/2?'left':'right';x=side==='left'?p.left-w-G:p.right+G;if(x<G||x+w>W-G){side=side==='left'?'right':'left';x=side==='left'?p.left-w-G:p.right+G;}y=r.top;}
 else if(el.closest('.action-area')){y=(area?Math.min(area.top,r.top):r.top)-h-G;x=r.left+r.width/2-w/2;
  /* Runde 5b: direkt über der Leiste, aber nie auf dem Helden – ein hoher Tooltip über einem mittleren Platz rückt seitlich neben ihn
     (auf die Seite des Platzes). Passt es dort nicht, auf die andere Seite. */
  const hero=heroBox(),over=()=>hit({left:x,top:y,right:x+w,bottom:y+h},hero);
  if(over()){const right=r.left+r.width/2>=(hero.left+hero.right)/2,a=right?hero.right+G:hero.left-w-G,b=right?hero.left-w-G:hero.right+G;x=a>=G&&a+w<=W-G?a:b>=G&&b+w<=W-G?b:x;}}
 else if(el.closest('.game-menu-rail')&&rail){y=rail.top-h-G;x=W-w-16;}
 x=Math.max(G,Math.min(W-w-G,x));y=Math.max(G,Math.min(H-h-G,y));
 const box=()=>({left:x,top:y,right:x+w,bottom:y+h});
 if(rail&&hit(box(),rail))y=Math.max(G,rail.top-h-G);
 if(track&&!el.closest('.quest-panel')&&hit(box(),track))x=Math.max(G,track.left-w-G);
 tip.style.left=Math.round(x)+'px';tip.style.top=Math.round(y)+'px';
 if(!compareHtml){hideCompareTip();return;}
 if(!cmp){cmp=document.createElement('aside');cmp.id='itemCompareTip';cmp.className='item-tooltip tip-compare hidden';cmp.setAttribute('role','tooltip');(document.querySelector('#gameShell')||document.body).append(cmp);}
 cmp.innerHTML=compareHtml;cmp.querySelectorAll('[data-item-art]').forEach(c=>paintItem(c,c.dataset.itemArt));cmp.classList.remove('hidden');
 const cw=cmp.offsetWidth,ch=cmp.offsetHeight;let cx=side==='left'?x-cw-6:x+w+6;if(cx<G||cx+cw>W-G)cx=side==='left'?x+w+6:x-cw-6;
 let cy=Math.max(G,Math.min(H-ch-G,y));const cb={left:cx,top:cy,right:cx+cw,bottom:cy+ch};if(rail&&hit(cb,rail))cy=Math.max(G,rail.top-ch-G);
 cmp.style.left=Math.round(Math.max(G,Math.min(W-cw-G,cx)))+'px';cmp.style.top=Math.round(cy)+'px';}
