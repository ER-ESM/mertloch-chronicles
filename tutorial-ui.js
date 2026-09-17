import {TUTORIAL as D} from './content/index.js';
import {tutorialActive,tutorialDestination} from './tutorial.js';
import {conversationHeader} from './dialogue-ui.js';
import {contentAsset} from './content-art.js';
export function tutorialDialogue(g,touch=false){const t=g.tutorial,s=D.steps[t.step];return `${conversationHeader('ida')}<span class="eyebrow">${D.title} · ${t.step+1}/${D.steps.length}</span><h2>${s.title}</h2><p>${t.step===0?D.welcome:s.text}</p><p>${touch?s.touch:s.desktop}</p><div class="dialog-actions">${t.step===0?`<button class="outline-button" data-shell="clan">${D.clan}</button>`:''}${t.step===0||t.step===7?`<button class="gold-button" data-tutorial-next>${t.step===0?D.start:D.finish}</button>`:('<button class="outline-button" data-close>'+D.continue+'</button>')}</div>`;}
export function mountTutorialUI(root,game,touch,show){
 const box=document.createElement('aside');box.id='tutorialGuide';
 box.innerHTML='<button type="button" data-tutorial-collapse aria-controls="tutorialHint" aria-expanded="true" aria-label="Hofprobe einklappen">⌃</button><span class="eyebrow"></span><strong></strong><div id="tutorialHint"><p></p><small></small></div><button type="button" data-tutorial-help aria-label="'+D.guide+'">?</button>';
 root.append(box);box.querySelector('[data-tutorial-help]').onclick=show;let last='',device=null,collapsed=false;
 const fold=()=>{box.classList.toggle('collapsed',collapsed);box.querySelector('#tutorialHint').hidden=collapsed;const b=box.querySelector('[data-tutorial-collapse]');b.setAttribute('aria-expanded',String(!collapsed));b.setAttribute('aria-label',collapsed?'Hofprobe ausklappen':'Hofprobe einklappen');b.textContent=collapsed?'⌄':'⌃';};
 box.querySelector('[data-tutorial-collapse]').onclick=()=>{collapsed=!collapsed;fold();};
 return{update(){const g=game(),on=tutorialActive(g);box.hidden=!on;root.classList.toggle('in-tutorial',on);if(!on)return;
  if(device!==touch()){device=touch();collapsed=device;fold();}
  if(device){const own=box.getBoundingClientRect(),panels=[...root.querySelectorAll('.player-panel,#targetPanel:not(.hidden)')].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.left<own.right&&r.right>own.left);box.style.top=(Math.max(...panels.map(r=>r.bottom))+6-root.getBoundingClientRect().top)+'px';}else box.style.removeProperty('top');
  const t=g.tutorial,s=D.steps[t.step],key=[t.step,t.hits,t.autos,device].join(':');if(key===last)return;last=key;
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
