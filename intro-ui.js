// Einführungsfilm: Kamerafahrt durch die laufende Welt (renderer.cameraFocus) mit Kinobalken, Untertiteln und
// Tasten-Einblendungen. Überspringen jederzeit (Knopf oder Esc); Klick, Enter oder Leertaste springen zur nächsten Szene.
// Solange der Film läuft, gehören alle Eingaben ihm – der Held bleibt stehen, die Welt lebt weiter.
import {INTRO_SCENES,INTRO_UI as T} from './content/index.js';
import {contentPath} from './content-art.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const seenKey=id=>'mertloch-intro-'+(id||'gast');
export const introSeen=id=>{try{return localStorage.getItem(seenKey(id))==='1';}catch{return true;}};
export const markIntroSeen=id=>{try{localStorage.setItem(seenKey(id),'1');}catch{}};

/** host: {shell, game:()=>Game, renderer:()=>Renderer, heroId:()=>string|null, onEnd()} */
export function mountIntro(host){
 const el=document.createElement('section');el.className='intro-film';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label',T.label);el.tabIndex=-1;
 el.innerHTML=`<div class="intro-bar intro-top"><div class="intro-progress" aria-hidden="true"></div><button type="button" class="intro-skip" data-intro-skip>${esc(T.skip)} <kbd>${esc(T.skipKey)}</kbd></button></div><img class="intro-still" alt="" hidden><div class="intro-bar intro-bottom"><div class="intro-caption" aria-live="polite"></div></div>`;
 host.shell.append(el);
 const caption=el.querySelector('.intro-caption'),progress=el.querySelector('.intro-progress');
 let index=-1,timer=0,running=false;
 function point(focus){const g=host.game(),w=g.world;
  if(focus==='bude')return w.base;if(focus==='ida')return w.npc;if(focus==='treff')return w.spawn;
  // Maifeld: die nächste Gruppe lebender Feldgegner zeigen (Lager ohne Bewohner wirken leer).
  if(focus==='camp'){const d=e=>Math.hypot(e.x-w.spawn.x,e.y-w.spawn.y),foe=(g.enemies||[]).filter(e=>e.hp>0&&!e.arena&&!e.worldBoss&&e.type!=='boss'&&d(e)>220).sort((a,b)=>d(a)-d(b))[0];if(foe)return foe;const c=(w.camps||[]).filter(c=>!c.questId).sort((a,b)=>d(a)-d(b))[0];return c||w.spawn;}
  return g.player;}
 function show(i){
  clearTimeout(timer);index=i;const s=INTRO_SCENES[i];if(!s){end();return;}
  const pt=point(s.focus),r=host.renderer();if(r&&pt){r.cameraFocus={x:pt.x,y:pt.y-(s.focus==='hero'?0:10),speed:1.4};/* erste Szene: harter Schnitt statt Fahrt */if(i===0)r.camera={...r.camera,x:pt.x,y:pt.y-10};}
  // Standbild der Szene (Bildlieferung), sonst die Kamerafahrt durch die Welt.
  const still=el.querySelector('.intro-still'),src=s.image&&contentPath(s.image);still.hidden=!src;if(src)still.src=src;
  progress.innerHTML=INTRO_SCENES.map((_,n)=>`<i class="${n<i?'done':n===i?'on':''}"></i>`).join('');
  caption.classList.remove('show');
  caption.innerHTML=`<span class="intro-eyebrow">${esc(s.eyebrow)}</span><strong class="intro-title">${esc(s.title)}</strong><p class="intro-text">${esc(s.text)}</p>${s.keys?`<ul class="intro-keys">${s.keys.map(([k,t])=>`<li><kbd>${esc(k)}</kbd><span>${esc(t)}</span></li>`).join('')}</ul>`:''}${s.final?`<button type="button" class="gold-button intro-start" data-intro-next>${esc(T.start)}</button>`:''}`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>caption.classList.add('show')));
  if(!s.final){const ms=Math.max(s.seconds*1000,(s.text.length/T.readingSpeed)*1000+1500);el.style.setProperty('--scene-ms',ms+'ms');progress.querySelector('.on')?.style.setProperty('animation-duration',ms+'ms');timer=setTimeout(()=>show(i+1),ms);}
 }
 function start(){if(running)return;const g=host.game();if(!g)return;running=true;g.keys?.clear?.();el.hidden=false;document.body.classList.add('intro-open');el.focus({preventScroll:true});show(0);}
 function end(){if(!running)return;running=false;clearTimeout(timer);const r=host.renderer();if(r)r.cameraFocus=null;el.hidden=true;document.body.classList.remove('intro-open');markIntroSeen(host.heroId());host.onEnd?.();}
 el.addEventListener('click',e=>{if(e.target.closest('[data-intro-skip]')){end();return;}if(e.target.closest('[data-intro-next]')){end();return;}show(index+1);});
 const swallow=e=>{if(!running)return;e.stopPropagation();e.preventDefault();};
 document.addEventListener('keydown',e=>{if(!running)return;swallow(e);if(e.key==='Escape')end();else if(e.key==='Enter'||e.key===' ')show(index+1);},true);
 document.addEventListener('keyup',swallow,true);
 for(const type of ['pointerdown','contextmenu','wheel'])host.shell.addEventListener(type,e=>{if(running&&!el.contains(e.target))swallow(e);},true);
 return {start,end,get running(){return running;}};
}
