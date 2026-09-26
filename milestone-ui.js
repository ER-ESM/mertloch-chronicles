// Große Einblendungen für Meilensteine: Stufenaufstieg (goldener Schriftzug mit Zugewinn) und neu freigeschaltete Menüs.
// Eine Warteschlange, damit Aufstieg und Freischaltung nacheinander statt übereinander erscheinen.
// Runde 2b (2026-09-24, Neuling-Befund 5): Freischaltungen, die zusammen fällig werden (Hofprobe bestanden → Kampfstatistik und
// UI bearbeiten), erscheinen als EINE Einblendung; zwischen zwei Freischalt-Einblendungen liegen mindestens UNLOCK_GAP ms.
// Sie ist einzeilig (Name, darunter nur der Ort als Kleindruck); die Erklärung steht im Tooltip des Namens.
// Warten Kurzmeldungen (toast-queue.js), kürzt sich die Einblendung auf HURRY_MS.
import {MILESTONE_UI as T,QUEST_DONE_UI as Q} from './content/index.js';
import {rewardTiles} from './reward-tiles.js';
import {contentPath} from './content-art.js';
import {classEmblem} from './class-emblem.js';

export const UNLOCK_BUNDLE_MS=1500,UNLOCK_GAP=45000,UNLOCK_MS=3600,HURRY_MS=1600;
export function mountMilestones(shell,{sound,blocked,hurry,paint,translate=t=>t,now=()=>performance.now()}={}){
 const el=document.createElement('section');el.className='milestone';el.hidden=true;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 shell.append(el);const queue=[];let timer=0,poll=0,busy=false,lastUnlock=-Infinity,bundle=null;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function next(){
  if(busy||!queue.length)return;
  // Freischaltungen im Abstand von UNLOCK_GAP: vorher wartet sie (ein Aufstieg davor darf schon).
  const head=queue[0];if(head.kind==='unlock'&&now()-lastUnlock<UNLOCK_GAP){clearTimeout(timer);timer=setTimeout(next,Math.min(5000,UNLOCK_GAP-(now()-lastUnlock)+20));return;}
  // Nicht über Gespräch, Erinnerung, Tod-Fenster, Zonentitel oder eine frische Kurzmeldung legen – kurz warten und erneut versuchen.
  if(blocked?.()){clearTimeout(timer);timer=setTimeout(next,400);return;}busy=true;const m=queue.shift();if(m.kind==='unlock')lastUnlock=now();
  el.className='milestone milestone-'+m.kind;el.innerHTML=m.html;el.hidden=false;paint?.(el);
  const src=m.kind==='level'&&contentPath('ui-levelup-crest');
  if(src){const art=document.createElement('img');art.className='milestone-crest';art.alt='';art.src=src;el.prepend(art);}
  requestAnimationFrame(()=>el.classList.add('show'));sound?.(m.kind==='level'?'levelUp':m.kind==='quest'?'questDone':'unlock');
  /* Dungeon-Fix 4 (Nachprüfung #726: „Erfolg: Termin eingehalten“ stand nur im Log, gleichzeitig lief „STUFE 11“): Erfolg und Titel stehen nach dem
     Aufstieg in der Schlange und bekommen ihre volle Zeit – kein Kürzen bei Stau oder wartenden Kurzmeldungen (die warten die 3,2 s ab) */
  const full=m.kind==='feat',started=now();timer=setTimeout(close,queue.length&&!full?m.ms*.65:m.ms);/* bei Stau kürzer */
  clearInterval(poll);poll=setInterval(()=>{if(!full&&hurry?.()&&now()-started>=HURRY_MS)close();},200);
 }
 function close(){clearTimeout(timer);clearInterval(poll);if(!busy||el.hidden)return;el.classList.remove('show');setTimeout(()=>{el.hidden=true;busy=false;next();},350);}
 /** Dungeon-Fix 4: Einblendung für einen oder mehrere Erfolge/Titel. */
 function featEntry(items){const one=items.length===1,icon=i=>`<canvas class="dicon milestone-feat-icon" width="56" height="56" style="width:${one?28:22}px;height:${one?28:22}px" data-dicon="${esc(i.icon)}" aria-hidden="true"></canvas>`;
  if(one){const i=items[0];return {kind:'feat',ms:3200,items,html:`<span class="milestone-eyebrow">${esc(i.title?T.titleEyebrow:T.featEyebrow)}</span><strong class="milestone-title" data-tooltip-label="${esc(i.name)}" data-tooltip-note="${esc(i.note)}">${icon(i)}${esc(i.name)}</strong>`};}
  return {kind:'feat',ms:Math.min(5600,3200+800*(items.length-1)),items,html:`<span class="milestone-eyebrow">${esc(T.featsEyebrow(items.length))}</span><strong class="milestone-title is-many">${items.map(i=>`<span class="milestone-feat-item" data-tooltip-label="${esc(i.title?T.titleShort+': '+i.name:i.name)}" data-tooltip-note="${esc(i.note)}">${icon(i)}${esc(i.title?T.titleShort+': '+i.name:i.name)}</span>`).join('')}</strong>`};}
 function unlockEntry(defs){
  const names=defs.map(d=>d.name),tips=defs.map(d=>translate(d.text)).join(' · '),where=defs.length===1?translate(defs[0].where):'';
  return {kind:'unlock',ms:UNLOCK_MS,defs,html:`<span class="milestone-eyebrow">${esc(T.unlockEyebrow)}</span><strong class="milestone-title${defs.length>1?' is-many':''}" data-tooltip-label="${esc(names.join(' · '))}" data-tooltip-note="${esc(tips)}">${esc(names.join(' · '))}</strong>${where?`<small class="milestone-where">${esc(where)}</small>`:''}`};
 }
 /* klickdurchlässig: die Einblendung blockiert nie das Spiel, sie läuft über die Zeit ab (nur der Name trägt einen Tooltip) */
 return {
  level({level,hpGain=0,points=0,skills=[],hints=[],classId=null}){
   // Mehrere Aufstiege auf einmal (Kapitelbelohnung) zu EINER Einblendung zusammenfassen: höchste Stufe, Zugewinne addiert.
   const prev=queue.find(m=>m.kind==='level');if(prev){queue.splice(queue.indexOf(prev),1);hpGain+=prev.hpGain;points+=prev.points;skills=[...prev.skills,...skills];hints=[...(prev.hints||[]),...hints].slice(-2);}
   // E-72: „Neuer Kniff“ mit einer Zeile zur Klassenressource (content/tutorial.js lessons), Klassen-Symbol davor.
   const tips=hints.map(h=>`<p class="milestone-hint">${classId?classEmblem(classId):''}<span>${esc(h)}</span></p>`).join('');
   const gains=[hpGain>0?T.hp(hpGain):'',points>0?T.points(points):'',...skills.map(T.skill)].filter(Boolean);
   // Aufstieg vor Freischaltungen derselben Stufe (Ursache vor Wirkung).
   queue.unshift({kind:'level',ms:hints.length?5600:4200,hpGain,points,skills,hints,html:`<span class="milestone-eyebrow">${esc(T.levelEyebrow)}</span><strong class="milestone-title">${esc(T.level(level))}</strong>${gains.length?`<ul class="milestone-gains">${gains.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>`:''}${tips}`});next();},
  unlock(def){
   // Bündeln: Was innerhalb von UNLOCK_BUNDLE_MS fällig wird, oder was noch wartet, landet in derselben Einblendung.
   const waiting=queue.find(m=>m.kind==='unlock');
   if(waiting){const i=queue.indexOf(waiting);queue[i]=unlockEntry([...waiting.defs,def]);return;}
   queue.push(unlockEntry([def]));clearTimeout(bundle);bundle=setTimeout(next,UNLOCK_BUNDLE_MS);},
  /** Runde 5a (Kenner-Befund 9, WoW): „Auftrag abgeschlossen“ groß mittig wie der Aufstieg, darunter die Belohnung als Kacheln. */
  quest({title,xp=0,coins=0,item=null}={}){const tiles=rewardTiles({xp,coins,items:item?[item]:[]},[xp?Q.xp(xp):'',coins?Q.coins(coins):''].filter(Boolean).join(' · '));
   queue.push({kind:'quest',ms:3400,html:`<span class="milestone-eyebrow">${esc(Q.eyebrow)}</span><strong class="milestone-title">${esc(title||'')}</strong>${tiles}`});next();},
  /** Dungeon-Fix 3 (Big-B-Abnahme #721): Erfolg bzw. Titel als kurze Einblendung oben mittig (klein, einzeilig, Symbol davor), nicht nur
   *  als Chatzeile. icon = Kartensymbol (map-symbols.js), gemalt über paint. Wartet wie jede Einblendung (Tod, Kampf, Fenster).
   *  Dungeon-Fix 4 (Nachprüfung #726): Was zusammen fällig wird (erster Abschluss: bis zu fünf Erfolge und ein Titel), steht als EINE
   *  Einblendung nach dem Aufstieg in der Schlange – jeder Name mit Symbol und Tooltip, volle Zeit statt gekürzt. */
  feat({name,icon='medal',note='',title=false}={}){const item={name,icon,note,title},waiting=queue.find(m=>m.kind==='feat');
   if(waiting){const i=queue.indexOf(waiting);queue[i]=featEntry([...waiting.items,item]);return;}queue.push(featEntry([item]));next();},
  get busy(){return busy;},
  /** E-72 Runde 4 (Kenner-Befund 3): Läuft eine Einblendung oder ist eine fällig (auch während der Bündelzeit einer Freischaltung)?
   *  Die Erinnerungskarte wartet dann bzw. tritt zurück. Eine Freischaltung, die noch den Abstand UNLOCK_GAP abwartet, zählt nicht. */
  due(){if(busy)return true;const head=queue[0];return !!head&&!(head.kind==='unlock'&&now()-lastUnlock<UNLOCK_GAP);},
  state:()=>({busy,queued:queue.map(m=>m.kind==='unlock'?m.defs.map(d=>d.id||d.name).join('+'):m.kind)}),
 };
}
