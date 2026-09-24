// Ausweichen verständlich (Runde 5a, 2026-09-24, Kenner-Befund 7): Die rote Bodenmarke eines Gegnerzaubers liegt fest am
// Aufschlagort (engine.startCast merkt x/y beim Beginn). Ohne Richtungstaste sprang Ausweichen bisher „vom Ziel weg“ – steht das
// Ziel neben dem Kreis oder eine Wand im Weg, landete der Held wieder in der Marke. Jetzt: Steht er in einer roten Marke, springt
// er auf dem kürzesten freien Weg HERAUS (weg von der Kreismitte; in der Mitte weg vom Zaubernden), mit Ausweichrichtungen, falls
// Hindernisse den geraden Weg blockieren.

/** Liegt p in der Bodenmarke c (Ellipse wie beim Einschlag, y × 0,75)? */
export const inMark=(p,c)=>Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;
/** Aktive rote Marken, in denen p steht (die am frühesten einschlagende zuerst). */
export function marksAt(g,p=g.player){return (g.enemies||[]).filter(e=>e.hp>0&&e.cast?.ground&&inMark(p,e.cast)).map(e=>({e,c:e.cast})).sort((a,b)=>a.c.remaining-b.c.remaining);}
/** Richtung (Einheitsvektor) aus der Marke heraus oder null (keine Marke). reach = Sprungweite in E. blocked(x,y) prüft Hindernisse. */
export function dodgeDirection(g,reach,blocked=(x,y)=>!!g.world?.blocked?.(x,y,7)){
 const hit=marksAt(g)[0];if(!hit)return null;const p=g.player,c=hit.c;
 let bx=p.x-c.x,by=(p.y-c.y)/.75;if(Math.hypot(bx,by)<3){bx=p.x-hit.e.x;by=p.y-hit.e.y;}if(Math.hypot(bx,by)<.1){bx=p.facing||1;by=0;}
 const base=Math.atan2(by,bx),tries=[0,.5,-.5,1,-1,1.6,-1.6,2.2,-2.2,Math.PI];
 for(const t of tries){const a=base+t,dx=Math.cos(a),dy=Math.sin(a);let free=true,end=null;
  for(let s=8;s<=reach;s+=8){const x=p.x+dx*s,y=p.y+dy*s;if(blocked(x,y)){free=false;break;}end={x,y};}
  if(free&&end&&!(g.enemies||[]).some(e=>e.hp>0&&e.cast?.ground&&inMark(end,e.cast)))return {dx,dy};}
 return {dx:Math.cos(base),dy:Math.sin(base)};
}
