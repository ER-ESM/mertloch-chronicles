// Ortsschild und Zonentitel wie in WoW (Runde 1, 2026-09-24, Nutzervorgabe): Beim Betreten eines neuen Gebiets blendet der große
// Zonentitel oben mittig und das Ortsschild der Minikarte kurz ein (≈3,6 s), dann wieder aus. Dauerhaft steht keins da;
// das Ortsschild zeigt sich zusätzlich, solange die Maus über der Minikarte liegt (CSS). Touch zeigt beides wie bisher nicht.
// Die Welt schreibt #zoneName in jedem Bild neu (app.js); gemeldet wird nur ein Name, der sich SETTLE ms lang hält,
// damit ein Weg entlang zweier Straßen nicht flackert. Steht gerade eine Meilenstein-Einblendung (milestone-ui.js), wartet der Titel.
// Dungeon-Fix 2 (Endabnahme #715): Wartet der Titel länger als ZONE_STALE_MS (etwa auf das Ende eines Kampfs), ist der Moment des
// Betretens vorbei – er entfällt dann, statt mitten im Plündern aufzutauchen. Kurze Wartezeiten (Meilenstein, kurzer Kampf) holt er nach.
export const ZONE_SHOW_MS=3600,ZONE_SETTLE_MS=500,ZONE_STALE_MS=8000;
export function mountZoneAnnounce({label=document.querySelector('.region-label'),minimap=document.querySelector('#miniButton'),name=document.querySelector('#zoneName'),wait=()=>false,now=()=>performance.now()}={}){
 if(!label||!name)return null;
 let shown='',pending='',settle=0,hide=0,since=0,sinceText='';
 const set=on=>{label.classList.toggle('zone-show',on);minimap?.classList.toggle('zone-show',on);/* Handy: der Ortsname unter dem Spielerrahmen erscheint ebenso nur kurz (Runde 2b) */document.body.classList.toggle('zone-announcing',on);};
 function announce(text=name.textContent.trim()){/* nacheinander (Runde 2b): nicht zugleich mit einer großen Einblendung an derselben Stelle *//* Runde 5a (Kenner: „KUMPEL KOMMT“ und „IM THÜRIG“ übereinander): auch ein frischer Weltruf lässt den Titel warten */
  if(sinceText!==text){sinceText=text;since=now();}
  if(document.querySelector('.milestone.show')||wait()){clearTimeout(settle);if(now()-since>ZONE_STALE_MS){shown=text;document.body.dataset.zoneSkipped=text;return;}settle=setTimeout(()=>{if(name.textContent.trim()===text)announce(text);},400);return;}
  shown=text;set(true);clearTimeout(hide);hide=setTimeout(()=>set(false),ZONE_SHOW_MS);document.body.dataset.zoneAnnounced=text;}
 function check(){const t=name.textContent.trim();if(!t||t===shown){if(pending){clearTimeout(settle);pending='';}return;}if(t===pending)return;pending=t;clearTimeout(settle);settle=setTimeout(()=>{if(name.textContent.trim()===pending)announce(pending);pending='';},ZONE_SETTLE_MS);}
 new MutationObserver(check).observe(name,{childList:true,characterData:true,subtree:true});
 document.body.classList.add('zone-fade');check();
 return {announce,shown:()=>shown,visible:()=>label.classList.contains('zone-show')};
}
