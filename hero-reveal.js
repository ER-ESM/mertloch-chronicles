// Held nie unter Fenstern verloren (Runde 2, 2026-09-24, Neuling-Playtest Hänger 1):
// Läuft die Figur von selbst (Klick auf Auftragskasten oder Karte) oder steckt sie im Kampf, werden Fenster, die sie auf dem Bildschirm
// überdecken, halbdurchsichtig (≈ 30 %) und lassen Klicks durch. Fährt die Maus über so ein Fenster, wird es wieder ganz sichtbar und
// bedienbar. Zusätzlich zeichnet der Renderer den Umriss des Helden, solange ein Fenster über ihm liegt (renderer.heroCovered,
// derselbe Umriss wie hinter Dächern). Fenster werden nie geschlossen.
const PAD=18,TICK=120;
export function mountHeroReveal({renderer,game,root=document}){
 let pointer={x:-1,y:-1},timer=0;
 const touch=()=>document.body.classList.contains('touch-mode');
 /** Bildschirmrechteck der Figur (Füße bis Kopf) aus Kamera und Zeichenfläche. */
 function heroRect(r,g){const cv=r.canvas;if(!cv||!r.viewWidth)return null;const b=cv.getBoundingClientRect(),sx=b.width/r.viewWidth,sy=b.height/r.viewHeight,p=g.player;
  const x=b.left+(p.x-r.camera.x+r.viewWidth/2)*sx,y=b.top+(p.y-r.camera.y+r.viewHeight/2)*sy;return{left:x-14*sx-PAD,right:x+14*sx+PAD,top:y-40*sy-PAD,bottom:y+6*sy+PAD};}
 const hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
 const inside=(b,x,y)=>x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
 function update(){const r=renderer(),g=game();const wins=[...root.querySelectorAll('.game-popup')];
  if(!r||!g||!g.player||g.dead){for(const w of wins)w.classList.remove('hero-seethrough');if(r)r.heroCovered=false;return;}
  const hero=heroRect(r,g);if(!hero)return;
  const busy=!touch()&&(!!g.moveTo||(g.player.inCombat||0)>0);let covered=false;
  for(const w of wins){const b=w.getBoundingClientRect(),over=b.width>0&&hit(hero,b);if(over)covered=true;w.classList.toggle('hero-seethrough',busy&&over&&!inside(b,pointer.x,pointer.y));}
  r.heroCovered=covered;document.body.classList.toggle('hero-reveal',busy&&covered);}
 // Maus über einem durchsichtigen Fenster: sofort wieder ganz sichtbar (das Fenster selbst bekommt wegen pointer-events:none kein Hover).
 addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};for(const w of root.querySelectorAll('.game-popup.hero-seethrough'))if(inside(w.getBoundingClientRect(),e.clientX,e.clientY))w.classList.remove('hero-seethrough');},{passive:true});
 timer=setInterval(update,TICK);
 return{update,stop:()=>clearInterval(timer)};
}
