// Weltbeschriftungen wie in WoW (Runde 2b, 2026-09-24, Grafikbefund 4, Kenner-Befund 9):
// – Orts-, Gebäude- und Raumnamen stehen nicht dauerhaft in der Welt, sondern nur unter der Maus (dazu Zonentitel und Karte).
// – Schilder von Gegnern und Beute weichen seitlich aus, statt auf der eigenen Figur zu liegen.
// – Ein Weltschild, das eine HUD-Fläche berührt (Aktionsleisten, Rahmen, Minikarte, Verfolgung), wird gar nicht gezeichnet –
//   sonst ragen halbe Wörter wie ein einzelnes „E“ neben der Leiste hervor.
const HUD=['.action-area>.action-bar','.action-area>.special-actions','.action-area>#interact','.player-panel','#targetPanel:not(.hidden)','#miniButton','.quest-panel','.game-menu-rail','.world-menu-brand','#meterToggle'];
const HERO={half:11,height:34};

/** Liegt die Maus (Weltpunkt g.hover) höchstens r vom Punkt entfernt (dy verschiebt den Prüfpunkt nach oben/unten)? */
export function hoverNear(g,pt,r,dy=0){const h=g?.hover;return !!h&&!!pt&&Math.hypot(h.x-pt.x,h.y-(pt.y+dy))<r;}
/** Maus über einem Gebäude (minX/maxX/minY/maxY) oder seinem Schild darunter? */
export function hoverInBox(g,b,pad=0){const h=g?.hover;return !!h&&!!b&&h.x>=b.minX-pad&&h.x<=b.maxX+pad&&h.y>=b.minY-pad&&h.y<=b.maxY+pad+26;}
/** Schild bei (x,y) mit halber Breite half: überdeckt es die eigene Figur, rückt es seitlich neben sie (auf die Seite des Trägers). */
export function liftOffHero(g,x,y,half){
 const p=g?.player;if(!p)return {x,y};const lift=g.stairLift?.()||0,top=p.y-HERO.height-lift,bottom=p.y-lift;
 const hits=x+half>p.x-HERO.half&&x-half<p.x+HERO.half&&y+6>top&&y-10<bottom;
 if(!hits)return {x,y};return {x:x>=p.x?p.x+HERO.half+half+2:p.x-HERO.half-half-2,y};
}
let boxes=[],measured=0;
function hudBoxes(cv){const now=performance.now();if(now-measured<300)return boxes;measured=now;const o=cv.getBoundingClientRect();
 boxes=[];for(const s of HUD)for(const el of document.querySelectorAll(s)){const r=el.getBoundingClientRect();if(r.width>1&&r.height>1&&getComputedStyle(el).visibility!=='hidden')boxes.push({l:r.left-o.left,t:r.top-o.top,r:r.right-o.left,b:r.bottom-o.top});}
 return boxes;}
/** Prüffunktion je Schild der Schrift-Ebene: false, wenn sein Kasten eine HUD-Fläche berührt. */
export function labelHudFree(cv,dpr,k){
 const list=hudBoxes(cv);if(!list.length)return ()=>true;const f=k/dpr;
 return l=>{const b=l.b,t=l.t;if(!b||!t)return true;const x0=(t.a*b.x+t.c*b.y+t.e)*f,y0=(t.b*b.x+t.d*b.y+t.f)*f,x1=(t.a*(b.x+b.w)+t.c*(b.y+b.h)+t.e)*f,y1=(t.b*(b.x+b.w)+t.d*(b.y+b.h)+t.f)*f;
  const l0=Math.min(x0,x1),r0=Math.max(x0,x1),t0=Math.min(y0,y1),b0=Math.max(y0,y1);
  return !list.some(h=>l0<h.r&&r0>h.l&&t0<h.b&&b0>h.t);};
}
