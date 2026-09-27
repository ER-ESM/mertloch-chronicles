// :has() am <body> als Klassen (Handy-Messung 2026-09-27). 62 Regeln fragten „body/.touch-mode:has(X) …“ – Chrome muss dann bei JEDER
// DOM-Änderung im Spiel (jede Schadenszahl, jeder neue Text im HUD) prüfen, ob sich :has() am body geändert haben könnte, und Teile des
// ganzen Baums neu berechnen: im Kampf 60 % der Stilzeit (4× gedrosselt 16 → 6 ms je Bild ohne diese Regeln, 178 → 36 Elemente).
// Hier werden dieselben Bedingungen einmal je DOM-Änderung per querySelector geprüft und als Klasse an <body> (bzw. <html>) gesetzt;
// das CSS fragt die Klasse. Gleiche Bedingungen, gleiches Aussehen.
// Zeitpunkt: Der MutationObserver läuft vor dem nächsten Stilberechnen (Mikrotask nach dem Skript, das geändert hat). Wer direkt nach dem
// Öffnen eines Fensters misst, ruft syncHasState() selbst (popup-windows.js tut das beim Öffnen und Schließen).
/** Klasse → Bedingung (Selektor unter <body>), in derselben Schreibweise wie früher im :has(). */
export const HAS_STATE=[
 ['hs-popup','.game-popup'],
 ['hs-popup-window','.game-popup:not(.popup-menu):not(.popup-map)'],
 ['hs-popup-menu','.popup-menu'],
 ['hs-popup-map','.popup-map'],
 ['hs-popup-settings','.popup-settings'],
 ['hs-popup-shop','.popup-shop'],
 ['hs-book','.popup-book:not(.minimized)'],
 ['hs-map-full','.popup-map.dock-full'],
 ['hs-target','#targetPanel:not(.hidden)'],
 ['hs-mechanic','#classMechanicArt:not([hidden])'],
 ['hs-tray','#resourceTray'],
 ['hs-tray-grill','#resourceTray[data-kind=grill]'],
 ['hs-toast','#toast.visible'],
 ['hs-low-health','.player-panel.is-low-health'],
 ['hs-meter','#combatMeter:not([hidden])'],
 ['hs-milestone','.milestone.show'],
 ['hs-tutorial','#tutorialGuide']
];
/** Am <html>: früher html:has(dialog[open]). */
export const HAS_STATE_ROOT=[['hs-dialog','dialog[open]']];
export function syncHasState(doc=typeof document!=='undefined'?document:null){
 const b=doc?.body;if(!b)return;
 for(const [cls,sel] of HAS_STATE){const on=!!b.querySelector(sel);if(b.classList.contains(cls)!==on)b.classList.toggle(cls,on);}
 const root=doc.documentElement;for(const [cls,sel] of HAS_STATE_ROOT){const on=!!doc.querySelector(sel);if(root.classList.contains(cls)!==on)root.classList.toggle(cls,on);}
}
let observer=null;
/** Einmal beim Start: Klassen setzen und bei jeder relevanten Änderung nachführen. */
export function mountHasState(doc=document){
 if(observer||typeof MutationObserver!=='function'||!doc?.body)return;syncHasState(doc);
 observer=new MutationObserver(()=>syncHasState(doc));
 observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','open','data-kind']});
}
