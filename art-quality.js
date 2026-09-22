// Precision export contract: world measurements are independent of bitmap resolution.
import {DETAIL_PALETTE} from './art-style.js';
export const WORLD_ART_DENSITY=4;
export const ICON_ART_SIZE=64;
/**
 * Canvas-Pixel je Welteinheit für die Weltfläche. Die Grafik liegt in Dichte 4 vor; gezeichnet wird nur so fein, wie der Bildschirm
 * zeigen kann (Zoom × Gerätepixel), mindestens 2. Bei Zoom 2 auf einem Standardmonitor ist das ein Viertel der Pixel (Messung 2026-09-21:
 * Zeichenzeit 23 → 10 ms). `fullRes` (Einstellung) erzwingt die volle Grafikdichte.
 */
/** Gerätepixel je Einheit im aktuellen Zeichenraum von `c` (Betrag der Transformation; Spiegelungen zählen nicht). */
export function contextScale(c){const t=c.getTransform();return Math.hypot(t.a,t.b);}
/**
 * Zwischenbild in Zieldichte (E-49): Grafik liegt in Dichte 4 vor. Wird sie je Bild kleiner gezeichnet, lässt der Browser ohne Glättung Pixel aus –
 * das kostet ohne Grafikkarte Zeit und flimmert. Stattdessen EINMAL hochwertig auf die Zielgröße verkleinern und danach 1:1 kopieren.
 */
const scaled=new Map();
export function scaledFrame(image,sx,sy,sw,sh,pw,ph){const key=sx+','+sy+','+sw+','+sh+','+pw+','+ph;let set=scaled.get(image);if(!set)scaled.set(image,set=new Map());let cv=set.get(key);
 if(cv){set.delete(key);set.set(key,cv);return cv;}/* zuletzt benutzt nach hinten */
 cv=document.createElement('canvas');cv.width=pw;cv.height=ph;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,sx,sy,sw,sh,0,0,pw,ph);set.set(key,cv);if(set.size>SCALED_LIMIT)set.delete(set.keys().next().value);return cv;}
const SCALED_LIMIT=260;
export function worldDensity(zoom,fullRes=false,ratio=globalThis.devicePixelRatio||1,cap=null){if(fullRes)return WORLD_ART_DENSITY;const native=Math.min(WORLD_ART_DENSITY,Math.max(2,Math.ceil(zoom*ratio-.01)));/* Automatik spart nur HiDPI-Reserve; mindestens ein Canvas-Pixel je CSS-Pixel, bis zur maximalen Grafikdichte. */const floor=Math.min(native,Math.max(2,Math.ceil(zoom-.01)));return cap==null?native:Math.max(floor,Math.min(native,cap));}
const anchors=DETAIL_PALETTE.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const ramps=[...anchors];
for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(Math.hypot(...anchors[i].map((v,k)=>v-anchors[j][k]))<100)ramps.push(anchors[i].map((v,k)=>Math.round((v+anchors[j][k])/2)));
export const PRECISION_PALETTE=[...new Map(ramps.map(p=>[p.join(','),p])).values()];
