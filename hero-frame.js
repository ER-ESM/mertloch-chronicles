// Eigene Figur nie verdeckt – auch beim normalen Laufen (Runde 4b, 2026-09-24, Prüfer-Bruch 7):
// Liegen offene Fenster über der Bildmitte, legt die Kamera den Helden weich in die freie Lücke zwischen den Fenstern
// (und den festen HUD-Flächen). Sind die Fenster zu, steht er wieder mittig. Gibt es keine Lücke, liefert findHeroSpot null –
// dann klappen die Fenster über dem Helden ein (hero-reveal.js, Runde 3b), jetzt auch beim manuellen Laufen.
// Reine Rechnung in Bildschirm-Pixeln; hero-reveal.js misst und setzt renderer.heroShift, renderer.js folgt weich.

/** Ausmaße der Figur um den Fußpunkt (Pixel), wie hero-reveal.js: 14 E zur Seite, 40 E hoch, 6 E unter die Füße, dazu Luft. */
export function heroBox(sx,sy,pad=14){return {left:14*sx+pad,right:14*sx+pad,up:40*sy+pad,down:6*sy+pad};}
const hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
const rectAt=(x,y,box)=>({left:x-box.left,right:x+box.right,top:y-box.up,bottom:y+box.down});

/**
 * Freier Fußpunkt für den Helden, möglichst nah an der Bildmitte.
 * view: {left,top,right,bottom} der Weltfläche; box: heroBox(); obstacles: [{left,top,right,bottom}]; prev: letzter Punkt (Ruhe statt Springen).
 * margin: Mindestabstand der Figur zum Bildrand (Pixel, Standard 8 % seitlich, 18 % oben, 12 % unten). → {x,y} (Fußpunkt in Pixeln) oder null (keine Lücke).
 */
export function findHeroSpot({view,box,obstacles,prev=null,step=16,margin=null,keep=60}){
 /* nicht an den Rand: wer ganz unten oder in der Ecke steht, sieht nicht, wohin er läuft – dann lieber einklappen */
 margin??={x:(view.right-view.left)*.08,top:(view.bottom-view.top)*.18,bottom:(view.bottom-view.top)*.12};
 const cx=(view.left+view.right)/2,cy=(view.top+view.bottom)/2,free=(x,y)=>{const r=rectAt(x,y,box);return !obstacles.some(o=>hit(r,o));};
 if(free(cx,cy))return {x:cx,y:cy};
 const x0=view.left+margin.x+box.left,x1=view.right-margin.x-box.right,y0=view.top+margin.top+box.up,y1=view.bottom-margin.bottom-box.down;
 if(x0>x1||y0>y1)return null;
 /* senkrecht wiegt etwas schwerer: seitlich neben den Fenstern liest sich ruhiger als ganz oben oder unten */
 const cost=(x,y)=>Math.hypot(x-cx,(y-cy)*1.25);
 let best=null,bestCost=Infinity;
 for(let y=y0;y<=y1;y+=step)for(let x=x0;x<=x1;x+=step){const k=cost(x,y);if(k<bestCost&&free(x,y)){best={x,y};bestCost=k;}}
 /* genauer: vom Rasterpunkt aus in kleinen Schritten zur Mitte rücken, solange frei */
 if(best){for(let i=0;i<step;i++){const nx=best.x+Math.sign(cx-best.x)*Math.min(1,Math.abs(cx-best.x)),ny=best.y+Math.sign(cy-best.y)*Math.min(1,Math.abs(cy-best.y));
  if(nx!==best.x&&free(nx,best.y)&&cost(nx,best.y)<cost(best.x,best.y))best.x=nx;if(ny!==best.y&&free(best.x,ny)&&cost(best.x,ny)<cost(best.x,best.y))best.y=ny;}bestCost=cost(best.x,best.y);}
 if(prev&&prev.x>=x0&&prev.x<=x1&&prev.y>=y0&&prev.y<=y1&&free(prev.x,prev.y)&&cost(prev.x,prev.y)<=bestCost+keep)return {x:prev.x,y:prev.y};
 return best;
}
/** Welches Element zählt als Hindernis? Fenster (außer der Vollbild-Karte) und feste HUD-Flächen. */
export const FRAME_HUD=['.action-area','.player-panel','#targetPanel:not(.hidden)','.quest-panel','#miniButton','.game-menu-rail','.chat-window'];
/** Große Fenster (Karte, > 70 % der Fläche) sind modal: an ihnen ist kein Platz zu suchen, sie bleiben wie bisher. */
export function frameObstacles(root,view){/* root = Fensterebene (#popupLayer); HUD-Flächen liegen außerhalb, darum document */
 const wins=[],hud=[];const area=(view.right-view.left)*(view.bottom-view.top);
 for(const w of root.querySelectorAll('.game-popup')){const r=w.classList.contains('hero-seethrough')&&w._heroRect?w._heroRect:w.getBoundingClientRect();if(r.width<2||r.height<2)continue;if(r.width*r.height>area*.7)continue;wins.push({left:r.left,top:r.top,right:r.right,bottom:r.bottom});}
 for(const s of FRAME_HUD)for(const el of document.querySelectorAll(s)){const r=el.getBoundingClientRect();if(r.width>1&&r.height>1&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none')hud.push({left:r.left,top:r.top,right:r.right,bottom:r.bottom});}
 return {wins,hud};
}
/** Weicher Versatz (Pixel) in Richtung Ziel; rate 1/s. */
export function easeShift(cur,target,dt,rate=5){const k=1-Math.exp(-rate*Math.max(0,dt));return {x:cur.x+(target.x-cur.x)*k,y:cur.y+(target.y-cur.y)*k};}
