// Nur schreiben, was sich ändert (Handy-Messung 2026-09-27). Das HUD wird zehnmal je Sekunde aktualisiert – auf einem gedrosselten
// Handy (8–12 Bilder/s) also in JEDEM Bild. Gleiche Werte neu zu setzen ist dabei nicht gratis: `textContent=` ersetzt immer den Textknoten
// (Stil + Layout für das Element), `hidden=`/`setAttribute` erzeugen Mutationen. Im Stillstand waren das ~28 DOM-Änderungen je Bild.
/** Text setzen, wenn er sich ändert. Nur für Elemente, die ausschließlich Text enthalten. */
export function setText(el,value){if(!el)return;const v=value==null?'':String(value);if(el.textContent!==v)el.textContent=v;}
/** `hidden` setzen, wenn es sich ändert. */
export function setHidden(el,value){if(el&&el.hidden!==!!value)el.hidden=!!value;}
/** Attribut setzen, wenn es sich ändert. */
export function setAttr(el,name,value){if(!el)return;const v=String(value);if(el.getAttribute(name)!==v)el.setAttribute(name,v);}
/** data-Attribut setzen (`dataset[key]`), wenn es sich ändert. */
export function setData(el,key,value){if(!el)return;const v=String(value);if(el.dataset[key]!==v)el.dataset[key]=v;}
/** Inline-Stil (`style[prop]`), wenn er sich ändert. */
export function setStyle(el,prop,value){if(el&&el.style[prop]!==value)el.style[prop]=value;}
/** Eigene CSS-Eigenschaft (`--name`), wenn sie sich ändert. */
export function setVar(el,name,value){if(el&&el.style.getPropertyValue(name)!==value)el.style.setProperty(name,value);}
/** innerHTML nur bei neuem Inhalt. Vergleicht mit dem zuletzt HIER gesetzten Text – das Element darf sonst nicht anders befüllt werden. */
const lastHtml=new WeakMap();
export function setHtml(el,html){if(!el)return;if(lastHtml.get(el)===html&&el.firstChild)return;lastHtml.set(el,html);el.innerHTML=html;}
