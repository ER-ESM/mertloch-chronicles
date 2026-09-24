// Scrolling Combat Text (2026-09-18), Vorbild MSBT (Mik's Scrolling Battle Text): drei Laufbereiche um den Helden –
// links eingehend (Schaden, Heilung, Parade/Ausweichen), rechts ausgehend (eigener Schaden je Kniff), oben Meldungen
// (Procs, Schwung, Spezialkniff, Unterbrechen, EP). Jede Zeile hat Icon + Wert, steigt dezent auf und blendet aus; Glückstreffer
// poppen größer. Gleiche Treffer innerhalb von 350 ms werden zu einer Summe zusammengefasst (MSBT „merge").
// Quelle ist das Engine-Ereignis `combat` (engine.js sct()). Keine Inhaltstexte hier; Namen kommen mit dem Ereignis.
import {iconMarkup,paintDescribeIcons} from './describe-ui.js';
const LIFE=1.6,MERGE=.35,MAX=6;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
/** Icon je Eintrag: Kniff, Talent/Proc, Gegenstand oder Symbol; `icon` ist ein Beschreibungs-Icon (describe) oder ein Item-Art-Schlüssel. */
function icon(e){
 if(e.icon)return iconMarkup(e.icon,e.iconKey||'');
 if(e.skill)return iconMarkup({set:'skills',skill:e.skill,member:e.member},e.skill);
 return iconMarkup(e.iconKey||({heal:'food',avoid:'shield',damage:e.area==='out'?'blade':'claw',xp:'coins',proc:'burst'}[e.kind]||'burst'));
}
export function mountCombatText(shell,api){
 const root=document.createElement('div');root.id='sct';root.setAttribute('aria-hidden','true');shell.append(root);
 function makeAreas(parent){const areas={};for(const a of ['in','out','note']){const el=document.createElement('div');el.className='sct-area sct-'+a;parent.append(el);areas[a]={el,last:0,rows:[]};}return areas;}
 const areas=makeAreas(root),companions=new Map();
 function companionAreas(id){
  if(!api.game()?.companions?.some(c=>c.id===id))return null;
  if(!companions.has(id)){const el=document.createElement('div');el.className='sct-companion';el.dataset.companion=id;root.append(el);companions.set(id,{el,areas:makeAreas(el)});}
  return companions.get(id).areas;
 }
 let enabled=true;
 /** Feinschalter aus Einstellungen → Spiel → Kampf (WoW „Kampftext“): eingehend, Meldungen, Söldner; ausgehend hängt nur am Hauptschalter. */
 const hidden=e=>{const s=api.game()?.settings;if(!s)return false;if(e.actor)return s.sctCompanions===false;const a=e.area==='in'||e.area==='out'?e.area:'note';return a==='in'?s.sctIn===false:a==='note'&&s.sctNotes===false;};
 function push(e){
  if(!enabled||hidden(e))return;const group=e.actor?companionAreas(e.actor):areas;if(!group)return;const area=group[e.area]||group.note,now=performance.now();
  // Zusammenfassen: gleiche Art + gleicher Kniff kurz nacheinander → eine Zeile mit Summe
  const twin=e.value!==undefined&&area.rows.find(r=>r.e.kind===e.kind&&r.e.skill===e.skill&&r.e.ability===e.ability&&r.e.text===e.text&&now-r.at<MERGE*1000);
  if(twin){twin.e.value+=e.value;twin.e.crit=twin.e.crit||e.crit;twin.node.querySelector('b').textContent=fmt(twin.e);twin.node.classList.toggle('sct-crit',!!twin.e.crit);return;}
  const node=document.createElement('div');node.className='sct-row sct-'+e.kind+(e.crit?' sct-crit':'')+(e.big?' sct-big':'');
  node.innerHTML=icon(e)+'<b>'+esc(fmt(e))+'</b>'+(e.text&&e.value!==undefined?'<small>'+esc(e.text)+'</small>':'');
  if(e.color)node.style.color=e.color;
  // Stapeln: kommt der nächste Eintrag dicht hinter dem letzten, startet er ein Stück höher (MSBT-Warteschlange ohne Warten)
  const gap=now-area.last;const offset=gap<220?Math.min(3,Math.round((220-gap)/70))*18:0;node.style.setProperty('--sct-offset',(-offset)+'px');area.last=now;
  area.el.append(node);area.rows.push({e:{...e},node,at:now});paintDescribeIcons(node,api.game());
  while(area.rows.length>(e.actor?3:MAX)){const old=area.rows.shift();old.node.remove();}
  setTimeout(()=>{node.remove();const i=area.rows.findIndex(r=>r.node===node);if(i>=0)area.rows.splice(i,1);},LIFE*1000+50);
 }
 const fmt=e=>e.value===undefined?e.text:(e.kind==='damage'&&e.area==='in'?'−':e.kind==='heal'||e.kind==='xp'?'+':'')+Math.round(e.value)+(e.crit?'!':'')+(e.unit?' '+e.unit:'');
 /** Jede Bildwiederholung: Laufbereiche über den Helden legen (Bildschirmkoordinaten aus der Kamera). */
 function update(renderer,game){
  if(!renderer||!game)return;const r=renderer.canvas.getBoundingClientRect(),shellRect=shell.getBoundingClientRect();
  const kx=r.width/renderer.viewWidth,ky=r.height/renderer.viewHeight,p=game.player;
  const o=renderer.viewOrigin||{x:renderer.camera.x-renderer.viewWidth/2,y:renderer.camera.y-renderer.viewHeight/2};
  const x=(p.x-o.x)*kx+r.left-shellRect.left,y=(p.y-o.y)*ky+r.top-shellRect.top;
  root.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
  // Eigener Schaden steigt über dem Ziel auf (WoW/Diablo), oberhalb von Namensschild und Balken – nicht neben dem Helden auf dem Gegner.
  const t=game.target;if(t&&t.hp>0&&Math.hypot(t.x-p.x,t.y-p.y)<320){const head=(t.type==='boss'?58:t.elite?48:44)*ky;areas.out.el.style.transform='translate('+Math.round((t.x-p.x)*kx-46-14)+'px,'+Math.round((t.y-p.y)*ky-head+26)+'px)';}else if(areas.out.el.style.transform)areas.out.el.style.transform='';
  for(const [id,group]of companions){const c=game.companions?.find(c=>c.id===id);if(!c){group.el.remove();companions.delete(id);continue;}group.el.style.transform=`translate(${Math.round((c.x-p.x)*kx)}px,${Math.round((c.y-p.y)*ky)}px)`;}
 }
 function clear(){for(const a of Object.values(areas)){a.el.innerHTML='';a.rows=[];}for(const group of companions.values())group.el.remove();companions.clear();}
 return {push,update,set enabled(v){enabled=!!v;root.hidden=!v;if(!v)clear();},get enabled(){return enabled;},clear};
}
