// Große Einblendungen für Meilensteine: Stufenaufstieg (goldener Schriftzug mit Zugewinn) und neu freigeschaltete Menüs.
// Eine Warteschlange, damit Aufstieg und Freischaltung nacheinander statt übereinander erscheinen.
import {MILESTONE_UI as T} from './content/index.js';

export function mountMilestones(shell,{sound,blocked}={}){
 const el=document.createElement('section');el.className='milestone';el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 shell.append(el);const queue=[];let timer=0,busy=false;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function next(){
  if(busy||!queue.length)return;
  // Nicht über Gespräch, Erinnerung oder Tod-Fenster legen – kurz warten und erneut versuchen.
  if(blocked?.()){clearTimeout(timer);timer=setTimeout(next,500);return;}busy=true;const m=queue.shift();
  el.className='milestone milestone-'+m.kind;el.innerHTML=m.html;el.hidden=false;
  requestAnimationFrame(()=>el.classList.add('show'));sound?.(m.kind==='level'?'levelUp':'unlock');
  timer=setTimeout(close,m.ms);
 }
 function close(){clearTimeout(timer);el.classList.remove('show');setTimeout(()=>{el.hidden=true;busy=false;next();},350);}
 /* klickdurchlässig: die Einblendung blockiert nie das Spiel, sie läuft über die Zeit ab */
 return {
  level({level,hpGain=0,points=0,skills=[]}){
   const gains=[hpGain>0?T.hp(hpGain):'',points>0?T.points(points):'',...skills.map(T.skill)].filter(Boolean);
   // Aufstieg vor Freischaltungen derselben Stufe (Ursache vor Wirkung).
   queue.unshift({kind:'level',ms:4200,html:`<span class="milestone-eyebrow">${esc(T.levelEyebrow)}</span><strong class="milestone-title">${esc(T.level(level))}</strong>${gains.length?`<ul class="milestone-gains">${gains.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>`:''}`});next();},
  unlock(def){
   queue.push({kind:'unlock',ms:5600,html:`<span class="milestone-eyebrow">${esc(T.unlockEyebrow)}</span><strong class="milestone-title">${esc(def.name)}</strong><p class="milestone-text">${esc(def.text)}</p><small class="milestone-where">${esc(def.where)}</small>`});next();},
  get busy(){return busy;}
 };
}
