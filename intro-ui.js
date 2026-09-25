// Einführungsfilm: Kamerafahrt durch die laufende Welt (renderer.cameraFocus) mit Kinobalken, Untertiteln und
// Tasten-Einblendungen. Überspringen jederzeit (Knopf oder Esc); Klick, Enter oder Leertaste springen zur nächsten Szene.
// Solange der Film läuft, gehören alle Eingaben ihm – der Held bleibt stehen, die Welt lebt weiter.
// E-72 Runde 4 (Kenner-Befunde 1/2): Der Film wartet, bis der Ladeschirm abblendet (host.ready), statt über ihm zu starten; bis dahin
// gehören die Tasten schon ihm (Esc überspringt ihn auch jetzt). Szenen mit Standbild haben von Anfang an einen deckenden Grund – vorher
// schien bis zum Laden des Bildes der Ladeschirm durch, die Texte lagen übereinander. Die Tasten hört der Film als ERSTER (window, Capture),
// damit keine Leistentaste (Leertaste, Ziffern) sie ihm wegnimmt.
import {INTRO_SCENES,INTRO_UI as T} from './content/index.js';
import {contentPath} from './content-art.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const seenKey=id=>'mertloch-intro-'+(id||'gast');
export const introSeen=id=>{try{return localStorage.getItem(seenKey(id))==='1';}catch{return true;}};
export const markIntroSeen=id=>{try{localStorage.setItem(seenKey(id),'1');}catch{}};
/** Taste im Film → 'skip' (Esc), 'next' (Enter/Leertaste) oder null (wird nur geschluckt). Rein, getestet. */
export function introKey(e){
 const k=e?.key,c=e?.code;
 if(k==='Escape'||k==='Esc'||c==='Escape'||e?.keyCode===27)return 'skip';
 if(k==='Enter'||k===' '||k==='Spacebar'||c==='Space'||c==='Enter'||c==='NumpadEnter')return 'next';
 return null;
}

/** Längstes Warten auf den Ladeschirm (ms). */
export const WAIT_MAX_MS=10000;
// Tastenhörer schon beim Laden des Moduls (vor allen Leisten-/Spieltasten, die erst beim Spielstart ihre Hörer anmelden).
const films=new Set();
if(typeof addEventListener==='function'){
 addEventListener('keydown',e=>{for(const f of films)if(f.owns()){f.key(e);return;}},true);
 addEventListener('keyup',e=>{for(const f of films)if(f.owns()){e.stopImmediatePropagation();e.preventDefault();return;}},true);
}

/** host: {shell, game:()=>Game, renderer:()=>Renderer, heroId:()=>string|null, ready?:()=>boolean (Ladeschirm fertig), onEnd()} */
export function mountIntro(host){
 const el=document.createElement('section');el.className='intro-film';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label',T.label);el.tabIndex=-1;
 el.innerHTML=`<div class="intro-bar intro-top"><div class="intro-progress" aria-hidden="true"></div><button type="button" class="intro-skip" data-intro-skip>${esc(T.skip)} <kbd>${esc(T.skipKey)}</kbd></button></div><img class="intro-still" alt="" hidden><div class="intro-bar intro-bottom"><div class="intro-caption" aria-live="polite"></div></div>`;
 host.shell.append(el);
 const caption=el.querySelector('.intro-caption'),progress=el.querySelector('.intro-progress');
 let index=-1,timer=0,running=false,waiting=false,waitTimer=0,waitSince=0;
 function point(focus){const g=host.game(),w=g.world;
  if(focus==='bude')return w.base;if(focus==='ida')return w.npc;if(focus==='treff')return w.spawn;
  // Maifeld: die nächste Gruppe lebender Feldgegner zeigen (Lager ohne Bewohner wirken leer).
  if(focus==='camp'){const d=e=>Math.hypot(e.x-w.spawn.x,e.y-w.spawn.y),foe=(g.enemies||[]).filter(e=>e.hp>0&&!e.arena&&!e.worldBoss&&e.type!=='boss'&&d(e)>220).sort((a,b)=>d(a)-d(b))[0];if(foe)return foe;const c=(w.camps||[]).filter(c=>!c.questId).sort((a,b)=>d(a)-d(b))[0];return c||w.spawn;}
  return g.player;}
 function show(i){
  clearTimeout(timer);index=i;const s=INTRO_SCENES[i];if(!s){end();return;}
  const pt=point(s.focus),r=host.renderer();if(r&&pt){r.cameraFocus={x:pt.x,y:pt.y-(s.focus==='hero'?0:10),speed:1.4};/* erste Szene: harter Schnitt statt Fahrt */if(i===0)r.camera={...r.camera,x:pt.x,y:pt.y-10};}
  // Standbild der Szene (Bildlieferung), sonst die Kamerafahrt durch die Welt. Mit Standbild deckt der Grund sofort (auch während das Bild lädt).
  const still=el.querySelector('.intro-still'),src=s.image&&contentPath(s.image);still.hidden=true;el.classList.toggle('intro-has-still',!!src);
  still.onload=()=>{still.hidden=!running||index!==i;};still.onerror=()=>{still.hidden=true;el.classList.remove('intro-has-still');};
  if(src)still.src=src;else still.removeAttribute('src');
  progress.innerHTML=INTRO_SCENES.map((_,n)=>`<i class="${n<i?'done':n===i?'on':''}"></i>`).join('');
  caption.classList.remove('show');
  caption.innerHTML=`<span class="intro-eyebrow">${esc(s.eyebrow)}</span><strong class="intro-title">${esc(s.title)}</strong><p class="intro-text">${esc(s.text)}</p>${s.keys?`<ul class="intro-keys">${s.keys.map(([k,t])=>`<li><kbd>${esc(k)}</kbd><span>${esc(t)}</span></li>`).join('')}</ul>`:''}${s.final?`<button type="button" class="gold-button intro-start" data-intro-next>${esc(T.start)}</button>`:''}`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>caption.classList.add('show')));
  if(!s.final){const ms=Math.max(s.seconds*1000,(s.text.length/T.readingSpeed)*1000+1500);el.style.setProperty('--scene-ms',ms+'ms');progress.querySelector('.on')?.style.setProperty('animation-duration',ms+'ms');timer=setTimeout(()=>show(i+1),ms);}
 }
 const ready=()=>!host.ready||!!host.ready();
 /** Film anfordern: läuft der Ladeschirm noch, wartet der Film (und hält schon die Tasten), sonst beginnt er sofort. */
 function start(){if(running||waiting)return;const g=host.game();if(!g)return;
  // Erstes Standbild schon vorladen, damit es beim Abblenden des Ladeschirms bereitliegt.
  const first=INTRO_SCENES[0]?.image&&contentPath(INTRO_SCENES[0].image);if(first&&typeof Image==='function')new Image().src=first;
  g.keys?.clear?.();if(ready()){begin();return;}waiting=true;waitSince=Date.now();poll();}
 /* Sicherung: Hängt der Ladeschirm (sollte nie passieren), beginnt der Film nach WAIT_MAX_MS trotzdem – er hält sonst alle Tasten fest. */
 function poll(){clearTimeout(waitTimer);if(!waiting)return;if(ready()||Date.now()-waitSince>WAIT_MAX_MS){waiting=false;begin();return;}waitTimer=setTimeout(poll,60);}
 function begin(){if(running)return;running=true;host.game()?.keys?.clear?.();el.hidden=false;document.body.classList.add('intro-open');el.focus({preventScroll:true});show(0);}
 function end(){
  if(waiting){/* Esc vor dem ersten Bild: Film gar nicht erst zeigen */waiting=false;clearTimeout(waitTimer);markIntroSeen(host.heroId());host.onEnd?.();return;}
  if(!running)return;running=false;clearTimeout(timer);const r=host.renderer();/* Runde 4b (Prüfer-Nebenbefund): harter Schnitt zurück auf den Helden – sonst fährt die Kamera bei niedriger Bildrate sekundenlang von der Bude zurück */if(r){r.cameraFocus=null;const p=host.game()?.player;if(p)r.camera={...r.camera,x:p.x,y:p.y};}el.hidden=true;el.classList.remove('intro-has-still');document.body.classList.remove('intro-open');markIntroSeen(host.heroId());host.onEnd?.();}
 el.addEventListener('click',e=>{if(e.target.closest('[data-intro-skip]')){end();return;}if(e.target.closest('[data-intro-next]')){end();return;}show(index+1);});
 const owns=()=>running||waiting;
 const swallow=e=>{if(!owns())return;e.stopImmediatePropagation();e.preventDefault();};
 films.add({owns,key:e=>{swallow(e);if(e.repeat)return;const k=introKey(e);if(k==='skip')end();else if(k==='next'&&running)show(index+1);}});
 for(const type of ['pointerdown','contextmenu','wheel'])host.shell.addEventListener(type,e=>{if(running&&!el.contains(e.target))swallow(e);},true);
 return {start,end,get running(){return running;},get waiting(){return waiting;},get busy(){return running||waiting;}};
}
