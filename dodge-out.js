// Ausweichen verständlich (Runde 5a, 2026-09-24, Kenner-Befund 7): Die rote Bodenmarke eines Gegnerzaubers liegt fest am
// Aufschlagort (engine.startCast merkt x/y beim Beginn). Ohne Richtungstaste sprang Ausweichen bisher „vom Ziel weg“ – steht das
// Ziel neben dem Kreis oder eine Wand im Weg, landete der Held wieder in der Marke. Jetzt: Steht er in einer roten Marke, springt
// er auf dem kürzesten freien Weg HERAUS (weg von der Kreismitte; in der Mitte weg vom Zaubernden), mit Ausweichrichtungen, falls
// Hindernisse den geraden Weg blockieren.
// Dungeon-Fix 3 (Big-B-Abnahme #721): „Ausweichen [Leer]“ ist die Antwort der Warnleiste für jede Klasse – auch ohne Schild gegen den
// Siegelring. Damit das überall trägt, kennt Ausweichen jetzt auch die Warnflächen der Dungeon-Zauber (dungeon.js activeWarnAreas):
// Bahnen (quer heraus, zur nahen Kante), Bodenstellen, Kegel, Trümmer, Streifen. Der Sprung endet nie in einer anderen aktiven Fläche.
import {activeWarnAreas,inDungeon} from './dungeon.js';

/** Liegt p in der Bodenmarke c (Ellipse wie beim Einschlag, y × 0,75)? */
export const inMark=(p,c)=>Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;
/** Aktive rote Marken, in denen p steht (die am frühesten einschlagende zuerst). */
export function marksAt(g,p=g.player){return (g.enemies||[]).filter(e=>e.hp>0&&e.cast?.ground&&inMark(p,e.cast)).map(e=>({e,c:e.cast})).sort((a,b)=>a.c.remaining-b.c.remaining);}
/** Alle Gefahren als {contains(q), from(p)→Fluchtwinkel}: Bodenmarken der Zauber, im Dungeon dazu die treffenden Warnflächen. */
function dangers(g){const out=(g.enemies||[]).filter(e=>e.hp>0&&e.cast?.ground).map(e=>{const c=e.cast;return {contains:q=>inMark(q,c),at:c.remaining,
  from:p=>{let bx=p.x-c.x,by=(p.y-c.y)/.75;if(Math.hypot(bx,by)<3){bx=p.x-e.x;by=p.y-e.y;}if(Math.hypot(bx,by)<.1){bx=p.facing||1;by=0;}return Math.atan2(by,bx);}};}).sort((a,b)=>a.at-b.at);
 if(inDungeon(g))for(const a of activeWarnAreas(g)){if(!a.danger||a.kind==='ground')continue;const b=a.box,cx=b.x+b.w/2,cy=b.y+b.h/2;
  out.push({contains:a.contains,at:9,from:p=>{/* Rechtecke (Bahnen, Streifen): quer zur langen Seite zur nahen Kante; sonst weg von der Mitte */
   if(a.kind==='lane'||a.kind==='stripe'){if(b.h>=b.w){const l=p.x-b.x,r=b.x+b.w-p.x;return l<r?Math.PI:0;}const t=p.y-b.y,d=b.y+b.h-p.y;return t<d?-Math.PI/2:Math.PI/2;}
   const dx=p.x-cx,dy=p.y-cy;return Math.hypot(dx,dy)<.1?(p.facing||1)>0?0:Math.PI:Math.atan2(dy,dx);}});}
 return out;}
/** Richtung (Einheitsvektor) aus der Marke heraus oder null (keine Marke). reach = Sprungweite in E. blocked(x,y) prüft Hindernisse. */
export function dodgeDirection(g,reach,blocked=(x,y)=>!!g.world?.blocked?.(x,y,7)){
 const p=g.player,all=dangers(g),hit=all.find(d=>d.contains(p));if(!hit)return null;
 const base=hit.from(p),tries=[0,.5,-.5,1,-1,1.6,-1.6,2.2,-2.2,Math.PI];
 for(const t of tries){const a=base+t,dx=Math.cos(a),dy=Math.sin(a);let free=true,end=null;
  for(let s=8;s<=reach;s+=8){const x=p.x+dx*s,y=p.y+dy*s;if(blocked(x,y)){free=false;break;}end={x,y};}
  if(free&&end&&!all.some(d=>d.contains(end)))return {dx,dy};}
 return {dx:Math.cos(base),dy:Math.sin(base)};
}
