// Held nie unter Fenstern verloren (Runde 2, 2026-09-24, Neuling-Playtest Hänger 1):
// Läuft die Figur von selbst (Klick auf Auftragskasten oder Karte) oder steckt sie im Kampf, klappen Fenster, die sie auf dem Bildschirm
// überdecken, auf ihre Titelzeile ein (Runde 3b, statt 30 %-Geisterbild) und lassen Klicks durch. Fährt die Maus über so ein Fenster, wird es wieder ganz sichtbar und
// bedienbar. Zusätzlich zeichnet der Renderer den Umriss des Helden, solange ein Fenster über ihm liegt (renderer.heroCovered,
// derselbe Umriss wie hinter Dächern). Fenster werden nie geschlossen.
// Runde 4b (Prüfer-Bruch 7): Zuerst sucht hero-frame.js eine freie Lücke zwischen den offenen Fenstern; die Kamera legt den Helden
// weich dorthin (renderer.heroShift). Nur ohne Lücke klappen Fenster ein – dann auch beim manuellen Laufen (WASD, Stick).
import {dungeonScale} from './dungeon-actors.js';
import {heroBox,findHeroSpot,frameObstacles,isModalWindow,heroFloor,unionBox} from './hero-frame.js';
const PAD=18,TICK=120,GRACE=2000;
/** Runde 5b: letztes Bildschirmrechteck des Helden (Füße bis Kopf) – Tooltips der Leiste weichen ihm aus (fenster-r3.js placeTooltip). */
let lastHero=null;
export const heroScreenRect=()=>lastHero&&{...lastHero};
export function mountHeroReveal({renderer,game,root=document}){
 let pointer={x:-1,y:-1},timer=0,busySince=0,wasBusy=false,spot=null;const seen=new WeakMap();
 const touch=()=>document.body.classList.contains('touch-mode');
 /** Bildschirmrechteck der Figur (Füße bis Kopf) aus Kamera und Zeichenfläche. */
 function heroRect(r,g){const cv=r.canvas;if(!cv||!r.viewWidth)return null;const b=cv.getBoundingClientRect(),sx=b.width/r.viewWidth,sy=b.height/r.viewHeight,p=g.player;
  const x=b.left+(p.x-r.camera.x+r.viewWidth/2)*sx,y=b.top+(p.y-r.camera.y+r.viewHeight/2)*sy;return{left:x-14*sx-PAD,right:x+14*sx+PAD,top:y-40*sy-PAD,bottom:y+6*sy+PAD};}
 const hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
 /** Feste Flächen am Handy im Bosskampf (Rahmen, Truppe, Warnleiste, Steuerung). */
 const touchHud=()=>['.player-panel','.boss-frame:not([hidden])','#targetPanel:not(.hidden)','#unitGroupDock','.boss-alerts','#touchStick','#touchActions','#touchUtility','#touchMenu','.touch-topline','#miniButton'].flatMap(s=>[...document.querySelectorAll(s)]).map(e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return null;const b=e.getBoundingClientRect();return b.width>1&&b.height>1?{left:b.left,top:b.top,right:b.right,bottom:b.bottom}:null;}).filter(Boolean);
 const inside=(b,x,y)=>x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
 /** Runde 4b: freie Lücke suchen und der Kamera als Versatz (Welteinheiten) geben. → Rechteck der Figur am Zielpunkt oder null. */
 function frame(r,g){const cv=r.canvas;if(!cv||!r.viewWidth){spot=null;return null;}
  const b=cv.getBoundingClientRect(),sx=b.width/r.viewWidth,sy=b.height/r.viewHeight,view={left:b.left,top:b.top,right:b.right,bottom:b.bottom};
  /* Etappe 2 (Dungeon, Handy-Kampfansicht): im Bosskampf am Handy sucht die Kamera eine Lücke zwischen Rahmen, Warnleiste und Knöpfen für Held UND Boss */const touchFight=touch()&&document.body.classList.contains('boss-fight')&&!r.cameraFocus&&document.body.dataset.heroFrame!=='off';
  /* body[data-hero-frame=off] schaltet die Lückensuche ab (Prüfskripte, die das Einklappen allein prüfen) */const {wins,hud}=touchFight?{wins:[],hud:touchHud()}:touch()||r.cameraFocus||document.body.dataset.heroFrame==='off'?{wins:[],hud:[]}:frameObstacles(root,view);
  if(!wins.length&&!touchFight){spot=null;r.heroShift={x:0,y:0,on:false};return null;}
  /* Runde 5b (Punkt 7): nie neben oder dicht über der Aktionsleiste – der Fußpunkt bleibt eine Figurhöhe über ihrer Oberkante, höchstens +25 % unter der Mitte */
  const hbox=heroBox(sx,sy,PAD-4),bar=document.querySelector('.action-area')?.getBoundingClientRect(),figure=hbox.up+hbox.down;
  /* Etappe 2: im Kampf umfasst die Lücke Held und Ziel (Boss), solange das Ziel nah genug ist; sonst nur den Helden */const t=g.target,fight=t&&t.hp>0&&(g.player.inCombat||0)>0&&Math.abs(t.x-g.player.x)*sx<(view.right-view.left)*.4&&Math.abs(t.y-g.player.y)*sy<(view.bottom-view.top)*.35;
  const both=fight?unionBox(hbox,(t.x-g.player.x)*sx,(t.y-g.player.y)*sy,heroBox(sx*(t.type==='boss'?Math.max(1.35,dungeonScale(t)):1),sy*(t.type==='boss'?Math.max(1.35,dungeonScale(t)):1),PAD-4)/* Dungeon-Fix 7: Big B ×1,5 */):null;
  const before=spot;const maxY=heroFloor(view,bar&&bar.height?bar.top:NaN,figure);let box=both||hbox;spot=findHeroSpot({view,box,obstacles:[...wins,...hud],prev:spot,maxY});if(!spot&&both){box=hbox;spot=findHeroSpot({view,box,obstacles:[...wins,...hud],prev:before,maxY});}
  if(!spot){r.heroShift={x:0,y:0,on:false};return null;}
  {const off=Math.hypot(spot.x-(view.left+view.right)/2,spot.y-(view.top+view.bottom)/2)>24,was=before&&Math.hypot(before.x-(view.left+view.right)/2,before.y-(view.top+view.bottom)/2)>24;if(off&&!was)pulse(spot,box);}
  const cx=(view.left+view.right)/2,cy=(view.top+view.bottom)/2;r.heroShift={x:(spot.x-cx)/sx,y:(spot.y-cy)/sy,on:true};
  return{left:spot.x-box.left,right:spot.x+box.right,top:spot.y-box.up,bottom:spot.y+box.down};}
 /** Runde 5b (Punkt 7): beim ersten Sprung in die Lücke pulst einmal ein Bodenring (0,4 s), damit das Auge dem Helden folgt. DOM statt Renderer. */
 function pulse(p,box){if(touch()||matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;const el=document.createElement('i');el.className='hero-gap-pulse';el.setAttribute('aria-hidden','true');const w=Math.round((box.left+box.right)*1.4);
  Object.assign(el.style,{left:Math.round(p.x-w/2)+'px',top:Math.round(p.y-w/4)+'px',width:w+'px',height:Math.round(w/2)+'px'});(document.querySelector('#gameShell')||document.body).append(el);setTimeout(()=>el.remove(),650);}
 function update(){const r=renderer(),g=game();const wins=[...root.querySelectorAll('.game-popup')].filter(w=>!isModalWindow(w));/* Runde 5b: modale Fenster klappen nie ein */
  for(const w of root.querySelectorAll('.game-popup.hero-seethrough'))if(isModalWindow(w))w.classList.remove('hero-seethrough');
  if(!r||!g||!g.player||g.dead){for(const w of wins)w.classList.remove('hero-seethrough');if(r){r.heroCovered=false;r.heroShift={x:0,y:0,on:false};}spot=null;lastHero=null;return;}
  const target=frame(r,g),hero=target||heroRect(r,g);if(!hero)return;lastHero=heroRect(r,g)||hero;
  // Runde 4b: auch manuelles Laufen zählt – greift aber nur, wenn keine Lücke frei ist (dann liegt kein Fenster über dem Ziel).
  const auto=!touch()&&(!!g.moveTo||(g.player.inCombat||0)>0),busy=auto||!touch()&&!!g.player.moving,cv=r.canvas?.getBoundingClientRect(),area=cv?cv.width*cv.height:0;let covered=false;const now=performance.now();if(busy&&!wasBusy)busySince=now;wasBusy=busy;
  // Runde 3b: Ein Fenster, das du erst im Kampf oder beim Laufen öffnest, willst du benutzen – es klappt die ersten 2 s nicht ein.
  // Fenster, die schon vorher offen waren, weichen dem Helden sofort.
  // Runde 3b: eingeklappt zählt das volle Rechteck von vorher – sonst klappte das Fenster im nächsten Takt wieder auf (Flackern).
  for(const w of wins){const folded=w.classList.contains('hero-seethrough'),b=folded&&w._heroRect?w._heroRect:w.getBoundingClientRect();if(!folded)w._heroRect=b;if(!seen.has(w))seen.set(w,now);const over=b.width>0&&hit(hero,b),modal=b.width*b.height>area*.7/* Vollbild-Karte: weicht nur Autolauf und Kampf, nicht dem eigenen Laufen */,fold=(modal?auto:busy)&&over&&(seen.get(w)<busySince||now-seen.get(w)>GRACE)&&!inside(b,pointer.x,pointer.y);if(over&&!fold)covered=true;w.classList.toggle('hero-seethrough',fold);}
  r.heroCovered=covered;document.body.classList.toggle('hero-reveal',busy&&covered);}
 // Maus über einem durchsichtigen Fenster: sofort wieder ganz sichtbar (das Fenster selbst bekommt wegen pointer-events:none kein Hover).
 addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};for(const w of root.querySelectorAll('.game-popup.hero-seethrough'))if(inside(w.getBoundingClientRect(),e.clientX,e.clientY)||(w._heroRect&&inside(w._heroRect,e.clientX,e.clientY)))w.classList.remove('hero-seethrough');/* über der stehenden Titelzeile klappt es wieder auf */},{passive:true});
 timer=setInterval(update,TICK);
 return{update,stop:()=>clearInterval(timer),spot:()=>spot&&{...spot}};
}
