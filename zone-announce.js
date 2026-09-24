// Ortsschild und Zonentitel wie in WoW (Runde 1, 2026-09-24, Nutzervorgabe): Beim Betreten eines neuen Gebiets blendet der große
// Zonentitel oben mittig und das Ortsschild der Minikarte kurz ein (≈3,6 s), dann wieder aus. Dauerhaft steht keins da;
// das Ortsschild zeigt sich zusätzlich, solange die Maus über der Minikarte liegt (CSS). Touch zeigt beides wie bisher nicht.
// Die Welt schreibt #zoneName in jedem Bild neu (app.js); gemeldet wird nur ein Name, der sich SETTLE ms lang hält,
// damit ein Weg entlang zweier Straßen nicht flackert. Steht gerade eine Meilenstein-Einblendung (milestone-ui.js), wartet der Titel.
export const ZONE_SHOW_MS=3600,ZONE_SETTLE_MS=500;
export function mountZoneAnnounce({label=document.querySelector('.region-label'),minimap=document.querySelector('#miniButton'),name=document.querySelector('#zoneName'),wait=()=>false}={}){
 if(!label||!name)return null;
 let shown='',pending='',settle=0,hide=0;
 const set=on=>{label.classList.toggle('zone-show',on);minimap?.classList.toggle('zone-show',on);/* Handy: der Ortsname unter dem Spielerrahmen erscheint ebenso nur kurz (Runde 2b) */document.body.classList.toggle('zone-announcing',on);};
 function announce(text=name.textContent.trim()){/* nacheinander (Runde 2b): nicht zugleich mit einer großen Einblendung an derselben Stelle *//* Runde 5a (Kenner: „KUMPEL KOMMT“ und „IM THÜRIG“ übereinander): auch ein frischer Weltruf lässt den Titel warten */if(document.querySelector('.milestone.show')||wait()){clearTimeout(settle);settle=setTimeout(()=>{if(name.textContent.trim()===text)announce(text);},400);return;}shown=text;set(true);clearTimeout(hide);hide=setTimeout(()=>set(false),ZONE_SHOW_MS);document.body.dataset.zoneAnnounced=text;}
 function check(){const t=name.textContent.trim();if(!t||t===shown){if(pending){clearTimeout(settle);pending='';}return;}if(t===pending)return;pending=t;clearTimeout(settle);settle=setTimeout(()=>{if(name.textContent.trim()===pending)announce(pending);pending='';},ZONE_SETTLE_MS);}
 new MutationObserver(check).observe(name,{childList:true,characterData:true,subtree:true});
 document.body.classList.add('zone-fade');check();
 return {announce,shown:()=>shown,visible:()=>label.classList.contains('zone-show')};
}
