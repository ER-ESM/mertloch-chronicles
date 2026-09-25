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
/**
 * Eingebackene Farbabstimmung (E-50): Ohne Grafikkarte kostet der CSS-Filter über der Weltfläche den Compositor ~10 ms je Bild.
 * Dann setzt der Renderer hier den Filtertext, und alle Zwischenbilder (Boden, Sprites, Kleinbilder) werden beim Anlegen damit gefiltert.
 * Leer = kein Einbacken (Grafikkarte vorhanden oder Licht aus); der Schlüssel jedes Zwischenbilds enthält den Filter.
 */
export const bakedGrade={filter:''};
/** Zeichnet mit eingebackener Farbabstimmung, falls aktiv. */
export function withGrade(c,draw){const f=bakedGrade.filter;if(!f){draw();return;}const old=c.filter;c.filter=f;draw();c.filter=old;}
const scaled=new Map();
export function scaledFrame(image,sx,sy,sw,sh,pw,ph){const key=sx+','+sy+','+sw+','+sh+','+pw+','+ph+bakedGrade.filter;let set=scaled.get(image);if(!set)scaled.set(image,set=new Map());let cv=set.get(key);
 if(cv){set.delete(key);set.set(key,cv);return cv;}/* zuletzt benutzt nach hinten */
 cv=document.createElement('canvas');cv.width=pw;cv.height=ph;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';withGrade(c,()=>c.drawImage(image,sx,sy,sw,sh,0,0,pw,ph));set.set(key,cv);if(set.size>SCALED_LIMIT)set.delete(set.keys().next().value);return cv;}
const SCALED_LIMIT=260;
/**
 * Vektor-Kleinbild (E-50): Pixelkunst, die aus vielen Rechtecken und Pfaden besteht (Blumen, Kräuter), einmal je Gestalt und Zieldichte
 * in ein kleines Bild malen und danach nur noch kopieren. Ohne Grafikkarte kostet jeder Zeichenbefehl beim Rastern Zeit – die wiegenden
 * Blumen allein waren ~1.200 Befehle je Bild. `paint(ctx)` zeichnet um den Ursprung (0,0); `box` = belegter Bereich in Welteinheiten.
 * Gesetzt wird auf dem Halbpixel-Raster (`snap` in pixel-style.js), damit das Ergebnis dem direkten Zeichnen entspricht.
 */
const vectors=new Map();
export function drawVectorSprite(c,key,box,x,y,paint){const d=Math.max(1,Math.round(contextScale(c))),k=key+'@'+d+bakedGrade.filter;let cv=vectors.get(k);
 if(cv){vectors.delete(k);vectors.set(k,cv);}else{cv=document.createElement('canvas');cv.width=Math.ceil((box.x1-box.x0)*d);cv.height=Math.ceil((box.y1-box.y0)*d);const v=cv.getContext('2d');v.setTransform(d,0,0,d,-box.x0*d,-box.y0*d);if(bakedGrade.filter){/* Filter wirkt je Zeichenbefehl – auf Kleinbilder aus vielen Formen einmal als Ganzes anwenden */const raw=document.createElement('canvas');raw.width=cv.width;raw.height=cv.height;const r=raw.getContext('2d');r.setTransform(d,0,0,d,-box.x0*d,-box.y0*d);paint(r);v.setTransform(1,0,0,1,0,0);withGrade(v,()=>v.drawImage(raw,0,0));}else paint(v);vectors.set(k,cv);if(vectors.size>VECTOR_LIMIT)vectors.delete(vectors.keys().next().value);}
 const sx=Math.round(x*2)/2,sy=Math.round(y*2)/2,smooth=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;c.drawImage(cv,sx+box.x0,sy+box.y0,cv.width/d,cv.height/d);c.imageSmoothingEnabled=smooth;}
const VECTOR_LIMIT=400;
export function worldDensity(zoom,fullRes=false,ratio=globalThis.devicePixelRatio||1,cap=null){if(fullRes)return WORLD_ART_DENSITY;const native=Math.min(WORLD_ART_DENSITY,Math.max(2,Math.ceil(zoom*ratio-.01)));/* Automatik (Nutzerentscheidung 2026-09-25): bei Überlast bis Dichte 2, auch unter die Bildschirmauflösung (dann pixelig hochskaliert). */return cap==null?native:Math.max(2,Math.min(native,cap));}
const anchors=DETAIL_PALETTE.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const ramps=[...anchors];
for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(Math.hypot(...anchors[i].map((v,k)=>v-anchors[j][k]))<100)ramps.push(anchors[i].map((v,k)=>Math.round((v+anchors[j][k])/2)));
export const PRECISION_PALETTE=[...new Map(ramps.map(p=>[p.join(','),p])).values()];
