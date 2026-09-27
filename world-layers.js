// Welt-Ebenen (Handy-Leistung Runde 3, 27.09.2026): Schalter der Maßnahmen, die die Zahl der Zeichenbefehle je Bild senken.
// Jeder Schalter lässt sich einzeln abschalten – `scripts/world-layer-check.mjs` vergleicht so jede Maßnahme Pixel für Pixel mit dem alten Weg
// (feste Szene, eingefrorene Zeit) und meldet den Anteil abweichender Pixel. Diagnose im Spiel: `?layers=off` (alle aus) oder
// `?layers=off:garlands,camp` (einzelne aus).
//   cull      Clan-Lager und Brunnen nur zeichnen, wenn sie im Bild liegen (bitgleich: außerhalb landet kein Pixel)
//   garlands  Lichterketten als Zwischenbild in 24 Phasen je Funkelperiode (optisch gleich)
//   camp      Clan-Lager: Wimpelkette und Schild als Zwischenbilder in Phasen (optisch gleich)
//   props     ruhende Kulissen, Möbel, Hofteile und Zäune als Zwischenbild je Objekt (optisch gleich)
//   neutral   kein save/restore um Objekte, deren Zeichenweg den Zustand nachweislich unverändert lässt (bitgleich)
//   pollen    Pollen in wenigen Deckkraftstufen als je ein Pfad statt 28 Einzelflächen (optisch gleich)
//   memo      Anziehpuppe: Bogenprüfung und Vorbestellung je Figur merken statt je Bild neu (bitgleich, nur Rechenzeit)
export const worldLayers={cull:true,garlands:true,camp:true,props:true,neutral:true,pollen:true,memo:true};
export const WORLD_LAYER_KEYS=Object.keys(worldLayers);
/** Alle Schalter setzen (true/false) oder einzelne: setWorldLayers({garlands:false}). */
export function setWorldLayers(v){if(typeof v==='boolean'){for(const k of WORLD_LAYER_KEYS)worldLayers[k]=v;return worldLayers;}for(const k of WORLD_LAYER_KEYS)if(k in v)worldLayers[k]=!!v[k];return worldLayers;}
try{const q=new URLSearchParams(globalThis.location?.search||'').get('layers');if(q==='off')setWorldLayers(false);else if(q?.startsWith('off:'))for(const k of q.slice(4).split(','))if(k.trim() in worldLayers)worldLayers[k.trim()]=false;}catch{}
/** Objektarten ohne save/restore im Renderer (Schalter neutral): ihr Zeichenweg lässt Transformation, Deckkraft, Füll-/Linienstil, Schrift,
 *  Filter, Mischmodus, Schatten und Clip unverändert – belegt mit scripts/world-layer-check.mjs (Zustand vor/nach jedem Objekt in festen Szenen,
 *  dazu Pixelvergleich neutral an/aus: bitgleich). Deckkraft setzt der Renderer selbst zurück (verdeckende Häuser auf 0,38). */
export const NEUTRAL_ITEMS=new Set(['tree','kitItem','houseWall','prop','estate','clanCamp','building','professionStation','professionNode']);
/** Ausnahme: Kalles Kiosk (Art „prop“) schreibt ein Schild ohne Klammer. */
export const neutralItem=item=>NEUTRAL_ITEMS.has(item.type)&&!(item.type==='prop'&&item.obj?.kind==='kiosk');
