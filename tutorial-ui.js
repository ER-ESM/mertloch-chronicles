import {TUTORIAL as D} from './content/index.js';
import {tutorialActive,tutorialDestination,tutorialStepFor} from './tutorial.js';
import {classEmblem} from './class-emblem.js';
import {conversationHeader} from './dialogue-ui.js';
import {contentAsset} from './content-art.js';
/** E-72: eine Zeile zur Klassenressource mit dem Klassen-Symbol (Hofprobe-Gespräch, Handyleiste). */
const hintLine=(g,text,cls='tutorial-res-hint')=>text?`<p class="${cls}">${classEmblem(g.member?.id)}<span>${text}</span></p>`:'';
export function tutorialDialogue(g,touch=false){const t=g.tutorial,s=tutorialStepFor(g),dressed=['body','legs','feet'].some(slot=>g.rpg.equipment[slot]),early=(g.player?.level||1)<5,welcome=(dressed?D.welcomeDressed:D.welcome)+' '+(early?D.welcomeToolsEarly:D.welcomeTools);return `${conversationHeader('ida')}<span class="eyebrow">${D.title} · ${t.step+1}/${D.steps.length}</span><h2>${s.title}</h2><p>${t.step===0?welcome:s.text}</p>${t.step===0?hintLine(g,s.clothes,'tutorial-clothes'):hintLine(g,s.hint)}${t.step===0||t.step===7?'':`<p class="dialog-keyhint">${touch?s.touch:s.desktop}</p>`}<div class="dialog-actions">${t.step===0&&!early?`<button class="outline-button" data-shell="talents">${D.clan}</button>`:''}${t.step===0||t.step===7?`<button class="gold-button" data-tutorial-next>${t.step===0?D.start:D.finish}</button>`:('<button class="outline-button" data-close>'+D.continue+'</button>')}</div>`;}
export function mountTutorialUI(root,game,touch,show){
 const box=document.createElement('aside');box.id='tutorialGuide';
 box.innerHTML='<button type="button" class="outline-button" data-tutorial-collapse aria-controls="tutorialHint" aria-expanded="true" aria-label="Hofprobe einklappen">⌃</button><span class="eyebrow"></span><strong></strong><div id="tutorialHint"><p></p><small></small></div><div class="tutorial-res-hint" hidden></div><button type="button" class="outline-button" data-tutorial-help aria-label="'+D.guide+'">?</button>';
 root.append(box);box.querySelector('[data-tutorial-help]').onclick=show;let last='',device=null,collapsed=false;
 const fold=()=>{box.classList.toggle('collapsed',collapsed);box.querySelector('#tutorialHint').hidden=collapsed;const b=box.querySelector('[data-tutorial-collapse]');b.setAttribute('aria-expanded',String(!collapsed));b.setAttribute('aria-label',collapsed?'Hofprobe ausklappen':'Hofprobe einklappen');b.textContent=collapsed?'⌄':'⌃';};
 box.querySelector('[data-tutorial-collapse]').onclick=()=>{collapsed=!collapsed;fold();};
 return{update(){const g=game(),on=tutorialActive(g);
  // Runde 4b (Prüfer-Brüche 2 und 4): Am Desktop steht die Hofprobe als Auftrag in der Verfolgung (quest-tracker.js) – kein eigener Kasten
  // mit Überschrift und Absatz mehr. Am Handy bleibt die kompakte Leiste oben (dort gibt es keine Verfolgung).
  if(device!==touch()){device=touch();collapsed=device;fold();last='';}
  box.hidden=!on||!device;root.classList.toggle('in-tutorial',on&&device);if(!on||!device)return;
  if(device){const own=box.getBoundingClientRect(),panels=[...root.querySelectorAll('.player-panel,#targetPanel:not(.hidden)')].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.left<own.right&&r.right>own.left);if(panels.length)box.style.top=(Math.max(...panels.map(r=>r.bottom))+6-root.getBoundingClientRect().top)+'px';else box.style.removeProperty('top');}else box.style.removeProperty('top');
  const t=g.tutorial,s=tutorialStepFor(g),key=[t.step,t.hits,t.autos,device,s.hint].join(':');if(key===last)return;last=key;
  {const h=box.querySelector('.tutorial-res-hint');h.hidden=!s.hint;h.innerHTML=s.hint?classEmblem(g.member?.id)+'<span></span>':'';if(s.hint)h.querySelector('span').textContent=s.hint;}
  box.querySelector('.eyebrow').textContent='Hofprobe · '+(t.step+1)+'/'+D.steps.length;box.querySelector('strong').textContent=s.title;box.querySelector('p').textContent=s.text;
  box.querySelector('small').textContent=(device?s.touch:s.desktop)+(t.step===3?' · '+D.hitsLabel+' '+t.hits+'/'+D.hits+' · '+D.autoLabel+' '+t.autos+'/'+D.autos:'');
 }};
}
export function drawTutorial(c,g,time){if(!tutorialActive(g))return;const destination=tutorialDestination(g),p=destination.point;c.save();c.strokeStyle='#e6ca834f';c.lineWidth=1;c.setLineDash([7,5]);c.beginPath();c.arc(g.world.spawn.x,g.world.spawn.y,D.radius,0,Math.PI*2);c.stroke();c.setLineDash([]);c.strokeStyle='#f9dd97';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y+2,18,7,0,0,Math.PI*2);c.stroke();c.fillStyle='#edca77';c.fillRect(p.x-1,p.y-23-Math.sin(time*2)*2,3,10);c.fillRect(p.x-1,p.y-10-Math.sin(time*2)*2,3,3);c.restore();}
// Übungspuppe: geliefertes Einzelbild (props/ui-arena-dummy.png), Fußpunkt und Maßstab aus dem Katalog.
// Das Wackeln bei Treffern bleibt Sache des Renderers; ohne Bild bleibt die gezeichnete Puppe.
export function drawTrainingDummy(c,e){
 const dummy=contentAsset('ui-arena-dummy');
 if(dummy){const m=dummy.meta,k=(m.worldHeight||26)/(m.nativeHeight||52),wobble=e.hurt>0?Math.sin(e.hurt*90)*2:0;
  c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(e.x*2)/2,Math.round(e.y*2)/2);
  c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,6,2,0,0,7);c.fill();
  c.rotate(wobble*.012);c.scale(k,k);c.translate(-m.pivot.x,-m.pivot.y);
  c.drawImage(dummy.image,0,0,m.width,m.height,0,0,m.width,m.height);c.restore();return;}
 const x=Math.round(e.x),y=Math.round(e.y);c.fillStyle='#293b44';c.fillRect(x-3,y-38,6,40);c.fillRect(x-14,y-28,28,19);c.fillRect(x-10,y-40,20,14);c.fillStyle='#b08c55';c.fillRect(x-12,y-26,24,15);c.fillStyle='#ead3a0';c.fillRect(x-8,y-38,16,10);c.fillStyle='#564d41';c.fillRect(x-5,y-35,3,2);c.fillRect(x+3,y-35,3,2);c.fillRect(x-3,y-31,7,1);c.fillStyle='#e4cb8e';c.fillRect(x-8,y-23,15,1);c.fillRect(x-8,y-20,12,1);c.fillStyle='#986a49';c.fillRect(x-11,y-2,23,4);}
