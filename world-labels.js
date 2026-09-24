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

// ---------- Runde 4b (Grafikbefunde 3 und 4, Zielbild 2 „Schichtordnung der Weltbeschriftung“) ----------
/** Namensschilder als EINE Einheit (Name + Balken) stapeln statt nur den Namen wegzulassen (WoW). list: [{id,x,y,w,prio}] mit
 *  prio 0 = Ziel (nie verschoben, nie ausgeblendet), 1 = Angreifer (stapeln, nie ausgeblendet), 2 = übrige (stapeln bis `max` Lagen, sonst ganz weg).
 *  y = Grundlinie des Namens; die Einheit reicht von y-9 bis y+10. → Map id → Versatz nach oben (≤ 0) oder null (ausgeblendet). */
export const PLATE={top:9,bottom:10,step:18,max:3};
export function stackPlates(list,{step=PLATE.step,max=PLATE.max}={}){
 const order=[...list].sort((a,b)=>a.prio-b.prio||b.y-a.y),placed=[],out=new Map();
 const box=(p,dy)=>({l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-PLATE.top+dy,b:p.y+PLATE.bottom+dy});
 const free=b=>!placed.some(q=>q.l<b.r&&b.l<q.r&&q.t<b.b&&b.t<q.b);
 for(const p of order){
  if(p.prio===0){placed.push(box(p,0));out.set(p.id,0);continue;}
  const limit=p.prio===1?12:max;let dy=null;
  for(let i=0;i<limit;i++){const b=box(p,-i*step);if(free(b)){dy=i?-i*step:0;placed.push(b);break;}}
  if(dy==null&&p.prio===1){dy=-limit*step;placed.push(box(p,dy));}
  out.set(p.id,dy);
 }
 return out;
}
/** Namensschild am Bildrand ganz oder gar nicht: Einheit in den Ausschnitt (ox,oy,W,H in Welteinheiten) klemmen. */
export function clampPlate(x,y,w,view,pad=2){
 const minX=view.x+w/2+pad,maxX=view.x+view.w-w/2-pad,minY=view.y+PLATE.top+pad,maxY=view.y+view.h-PLATE.bottom-pad;
 return {x:Math.max(minX,Math.min(maxX,x)),y:Math.max(minY,Math.min(maxY,y))};
}
/** Zonentitel hat Vorrang (3,6 s): Schrift im Titelband (Kasten von .region-label.zone-show + 16 px) tritt auf 25 % zurück,
 *  Auftragszeichen auf 45 %. Ausblenden 0,45 s mit dem Titel, Einblenden 0,6 s danach. */
export const YIELD={sel:'.region-label.zone-show',pad:16,/* Kontur und Füllung liegen übereinander: .18 je Schicht ergibt ≈ 30 % sichtbare Deckkraft (Mess-Soll Zielbild 2) */text:.18,badge:.4,fadeOut:.45,fadeIn:.6};
let band=null,bandAt=0,level=0,levelAt=0;
/** Eigentliche Rechnung (testbar): Faktor für ein Schild mit Kasten r (CSS-Pixel) bei Titelband band und Stärke level 0…1. */
export function yieldFactor(r,bandBox,lvl,kind){if(!bandBox||lvl<=0||!r)return 1;const hitBand=r.l<bandBox.r&&r.r>bandBox.l&&r.t<bandBox.b&&r.b>bandBox.t;if(!hitBand)return 1;const floor=kind==='badge'?YIELD.badge:YIELD.text;return 1-lvl*(1-floor);}
export function labelYield(cv,dpr,k){
 const now=performance.now();
 if(now-bandAt>150){bandAt=now;const el=document.querySelector(YIELD.sel),o=cv.getBoundingClientRect();band=null;if(el){const r=el.getBoundingClientRect();if(r.width>1&&r.height>1)band={l:r.left-o.left-YIELD.pad,t:r.top-o.top-YIELD.pad,r:r.right-o.left+YIELD.pad,b:r.bottom-o.top+YIELD.pad,live:true};}}
 const dt=Math.min(.25,Math.max(0,(now-(levelAt||now))/1000));levelAt=now;
 if(band)level=Math.min(1,level+dt/YIELD.fadeOut);else level=Math.max(0,level-dt/YIELD.fadeIn);
 if(band)labelYield.last=band;const use=band||labelYield.last;if(level<=0){labelYield.last=null;return ()=>1;}
 const f=k/dpr;
 return l=>{const b=l.b,t=l.t;if(!b||!t)return 1;const x0=(t.a*b.x+t.c*b.y+t.e)*f,y0=(t.b*b.x+t.d*b.y+t.f)*f,x1=(t.a*(b.x+b.w)+t.c*(b.y+b.h)+t.e)*f,y1=(t.b*(b.x+b.w)+t.d*(b.y+b.h)+t.f)*f;
  return yieldFactor({l:Math.min(x0,x1),r:Math.max(x0,x1),t:Math.min(y0,y1),b:Math.max(y0,y1)},use,level,l.kind);};
}
/** Stärke des Zurücktretens (für Prüfungen): 0 = volle Schrift, 1 = Titel steht. */
export const labelYieldLevel=()=>level;
/** Wegmarke auf einer Kreisbahn um die Körpermitte des Helden (Runde 4b, Grafikbefund 10): Richtung dx/dy → Punkt auf dem Kreis und Winkel. */
export const WAYPOINT={radius:36};
export function waypointOrbit(dx,dy,radius=WAYPOINT.radius){const n=Math.hypot(dx,dy)||1;return {x:dx/n*radius,y:dy/n*radius,angle:Math.atan2(dy,dx)};}
/** Runde 5a (Kenner-Befund 8): Der Pfeil samt Entfernung darf kein Gegner-Namensschild überdecken. Probiert die Kreisbahn in
 *  wachsenden Halbmessern (36 → 54 → 72 E); ist keine frei, bleibt er auf der engsten Bahn, wird aber blass (fade 0,3).
 *  plates: [{l,r,t,b}] in Welteinheiten. → {x,y,angle,radius,fade,labelY} relativ zur Körpermitte. */
export const WAYPOINT_RADII=[36,54,72];
export function waypointPlace(dx,dy,plates=[],radii=WAYPOINT_RADII,cx=0,cy=0){
 const boxOf=o=>{const ly=o.y>-4?15:-8;return [{l:o.x-7,r:o.x+7,t:o.y-7,b:o.y+7},{l:o.x-13,r:o.x+13,t:o.y+ly-7,b:o.y+ly+2}];};
 const hits=o=>boxOf(o).some(a=>plates.some(q=>a.l+cx<q.r&&q.l<a.r+cx&&a.t+cy<q.b&&q.t<a.b+cy));
 for(const r of radii){const o=waypointOrbit(dx,dy,r);if(!hits(o))return {...o,radius:r,fade:1,labelY:o.y>-4?15:-8};}
 const o=waypointOrbit(dx,dy,radii[0]);return {...o,radius:radii[0],fade:.3,labelY:o.y>-4?15:-8};
}
