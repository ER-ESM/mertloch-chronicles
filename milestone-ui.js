// Große Einblendungen für Meilensteine: Stufenaufstieg (goldener Schriftzug mit Zugewinn) und neu freigeschaltete Menüs.
// Eine Warteschlange, damit Aufstieg und Freischaltung nacheinander statt übereinander erscheinen.
// Runde 2b (2026-09-24, Neuling-Befund 5): Freischaltungen, die zusammen fällig werden (Hofprobe bestanden → Kampfstatistik und
// UI bearbeiten), erscheinen als EINE Einblendung; zwischen zwei Freischalt-Einblendungen liegen mindestens UNLOCK_GAP ms.
// Sie ist einzeilig (Name, darunter nur der Ort als Kleindruck); die Erklärung steht im Tooltip des Namens.
// Warten Kurzmeldungen (toast-queue.js), kürzt sich die Einblendung auf HURRY_MS.
import {MILESTONE_UI as T} from './content/index.js';
import {contentPath} from './content-art.js';

export const UNLOCK_BUNDLE_MS=1500,UNLOCK_GAP=45000,UNLOCK_MS=3600,HURRY_MS=1600;
export function mountMilestones(shell,{sound,blocked,hurry,translate=t=>t,now=()=>performance.now()}={}){
 const el=document.createElement('section');el.className='milestone';el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 shell.append(el);const queue=[];let timer=0,poll=0,busy=false,lastUnlock=-Infinity,bundle=null;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function next(){
  if(busy||!queue.length)return;
  // Freischaltungen im Abstand von UNLOCK_GAP: vorher wartet sie (ein Aufstieg davor darf schon).
  const head=queue[0];if(head.kind==='unlock'&&now()-lastUnlock<UNLOCK_GAP){clearTimeout(timer);timer=setTimeout(next,Math.min(5000,UNLOCK_GAP-(now()-lastUnlock)+20));return;}
  // Nicht über Gespräch, Erinnerung, Tod-Fenster, Zonentitel oder eine frische Kurzmeldung legen – kurz warten und erneut versuchen.
  if(blocked?.()){clearTimeout(timer);timer=setTimeout(next,400);return;}busy=true;const m=queue.shift();if(m.kind==='unlock')lastUnlock=now();
  el.className='milestone milestone-'+m.kind;el.innerHTML=m.html;el.hidden=false;
  const src=m.kind==='level'&&contentPath('ui-levelup-crest');
  if(src){const art=document.createElement('img');art.className='milestone-crest';art.alt='';art.src=src;el.prepend(art);}
  requestAnimationFrame(()=>el.classList.add('show'));sound?.(m.kind==='level'?'levelUp':'unlock');
  const started=now();timer=setTimeout(close,queue.length?m.ms*.65:m.ms);/* bei Stau kürzer */
  clearInterval(poll);poll=setInterval(()=>{if(hurry?.()&&now()-started>=HURRY_MS)close();},200);
 }
 function close(){clearTimeout(timer);clearInterval(poll);if(!busy||el.hidden)return;el.classList.remove('show');setTimeout(()=>{el.hidden=true;busy=false;next();},350);}
 function unlockEntry(defs){
  const names=defs.map(d=>d.name),tips=defs.map(d=>translate(d.text)).join(' · '),where=defs.length===1?translate(defs[0].where):'';
  return {kind:'unlock',ms:UNLOCK_MS,defs,html:`<span class="milestone-eyebrow">${esc(T.unlockEyebrow)}</span><strong class="milestone-title${defs.length>1?' is-many':''}" data-tooltip-label="${esc(names.join(' · '))}" data-tooltip-note="${esc(tips)}">${esc(names.join(' · '))}</strong>${where?`<small class="milestone-where">${esc(where)}</small>`:''}`};
 }
 /* klickdurchlässig: die Einblendung blockiert nie das Spiel, sie läuft über die Zeit ab (nur der Name trägt einen Tooltip) */
 return {
  level({level,hpGain=0,points=0,skills=[]}){
   // Mehrere Aufstiege auf einmal (Kapitelbelohnung) zu EINER Einblendung zusammenfassen: höchste Stufe, Zugewinne addiert.
   const prev=queue.find(m=>m.kind==='level');if(prev){queue.splice(queue.indexOf(prev),1);hpGain+=prev.hpGain;points+=prev.points;skills=[...prev.skills,...skills];}
   const gains=[hpGain>0?T.hp(hpGain):'',points>0?T.points(points):'',...skills.map(T.skill)].filter(Boolean);
   // Aufstieg vor Freischaltungen derselben Stufe (Ursache vor Wirkung).
   queue.unshift({kind:'level',ms:4200,hpGain,points,skills,html:`<span class="milestone-eyebrow">${esc(T.levelEyebrow)}</span><strong class="milestone-title">${esc(T.level(level))}</strong>${gains.length?`<ul class="milestone-gains">${gains.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>`:''}`});next();},
  unlock(def){
   // Bündeln: Was innerhalb von UNLOCK_BUNDLE_MS fällig wird, oder was noch wartet, landet in derselben Einblendung.
   const waiting=queue.find(m=>m.kind==='unlock');
   if(waiting){const i=queue.indexOf(waiting);queue[i]=unlockEntry([...waiting.defs,def]);return;}
   queue.push(unlockEntry([def]));clearTimeout(bundle);bundle=setTimeout(next,UNLOCK_BUNDLE_MS);},
  get busy(){return busy;},
  state:()=>({busy,queued:queue.map(m=>m.kind==='unlock'?m.defs.map(d=>d.id||d.name).join('+'):m.kind)}),
 };
}
