// Held nie unter Fenstern verloren (Runde 2, 2026-09-24, Neuling-Playtest Hänger 1):
// Läuft die Figur von selbst (Klick auf Auftragskasten oder Karte) oder steckt sie im Kampf, klappen Fenster, die sie auf dem Bildschirm
// überdecken, auf ihre Titelzeile ein (Runde 3b, statt 30 %-Geisterbild) und lassen Klicks durch. Fährt die Maus über so ein Fenster, wird es wieder ganz sichtbar und
// bedienbar. Zusätzlich zeichnet der Renderer den Umriss des Helden, solange ein Fenster über ihm liegt (renderer.heroCovered,
// derselbe Umriss wie hinter Dächern). Fenster werden nie geschlossen.
const PAD=18,TICK=120,GRACE=2000;
export function mountHeroReveal({renderer,game,root=document}){
 let pointer={x:-1,y:-1},timer=0,busySince=0,wasBusy=false;const seen=new WeakMap();
 const touch=()=>document.body.classList.contains('touch-mode');
 /** Bildschirmrechteck der Figur (Füße bis Kopf) aus Kamera und Zeichenfläche. */
 function heroRect(r,g){const cv=r.canvas;if(!cv||!r.viewWidth)return null;const b=cv.getBoundingClientRect(),sx=b.width/r.viewWidth,sy=b.height/r.viewHeight,p=g.player;
  const x=b.left+(p.x-r.camera.x+r.viewWidth/2)*sx,y=b.top+(p.y-r.camera.y+r.viewHeight/2)*sy;return{left:x-14*sx-PAD,right:x+14*sx+PAD,top:y-40*sy-PAD,bottom:y+6*sy+PAD};}
 const hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
 const inside=(b,x,y)=>x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
 function update(){const r=renderer(),g=game();const wins=[...root.querySelectorAll('.game-popup')];
  if(!r||!g||!g.player||g.dead){for(const w of wins)w.classList.remove('hero-seethrough');if(r)r.heroCovered=false;return;}
  const hero=heroRect(r,g);if(!hero)return;
  const busy=!touch()&&(!!g.moveTo||(g.player.inCombat||0)>0);let covered=false;const now=performance.now();if(busy&&!wasBusy)busySince=now;wasBusy=busy;
  // Runde 3b: Ein Fenster, das du erst im Kampf oder beim Laufen öffnest, willst du benutzen – es klappt die ersten 2 s nicht ein.
  // Fenster, die schon vorher offen waren, weichen dem Helden sofort.
  // Runde 3b: eingeklappt zählt das volle Rechteck von vorher – sonst klappte das Fenster im nächsten Takt wieder auf (Flackern).
  for(const w of wins){const folded=w.classList.contains('hero-seethrough'),b=folded&&w._heroRect?w._heroRect:w.getBoundingClientRect();if(!folded)w._heroRect=b;if(!seen.has(w))seen.set(w,now);const over=b.width>0&&hit(hero,b),fold=busy&&over&&(seen.get(w)<busySince||now-seen.get(w)>GRACE)&&!inside(b,pointer.x,pointer.y);if(over&&!fold)covered=true;w.classList.toggle('hero-seethrough',fold);}
  r.heroCovered=covered;document.body.classList.toggle('hero-reveal',busy&&covered);}
 // Maus über einem durchsichtigen Fenster: sofort wieder ganz sichtbar (das Fenster selbst bekommt wegen pointer-events:none kein Hover).
 addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};for(const w of root.querySelectorAll('.game-popup.hero-seethrough'))if(inside(w.getBoundingClientRect(),e.clientX,e.clientY)||(w._heroRect&&inside(w._heroRect,e.clientX,e.clientY)))w.classList.remove('hero-seethrough');/* über der stehenden Titelzeile klappt es wieder auf */},{passive:true});
 timer=setInterval(update,TICK);
 return{update,stop:()=>clearInterval(timer)};
}
