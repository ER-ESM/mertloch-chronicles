// Precision export contract: world measurements are independent of bitmap resolution.
import {DETAIL_PALETTE} from './art-style.js';
export const WORLD_ART_DENSITY=4;
export const ICON_ART_SIZE=64;
/**
 * Canvas-Pixel je Welteinheit für die Weltfläche. Die Grafik liegt in Dichte 4 vor; gezeichnet wird nur so fein, wie der Bildschirm
 * zeigen kann (Zoom × Gerätepixel), mindestens 2. Bei Zoom 2 auf einem Standardmonitor ist das ein Viertel der Pixel (Messung 2026-09-21:
 * Zeichenzeit 23 → 10 ms). `fullRes` (Einstellung) erzwingt die volle Grafikdichte.
 */
export function worldDensity(zoom,fullRes=false,ratio=globalThis.devicePixelRatio||1){return fullRes?WORLD_ART_DENSITY:Math.min(WORLD_ART_DENSITY,Math.max(2,Math.ceil(zoom*ratio-.01)));}
const anchors=DETAIL_PALETTE.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const ramps=[...anchors];
for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(Math.hypot(...anchors[i].map((v,k)=>v-anchors[j][k]))<100)ramps.push(anchors[i].map((v,k)=>Math.round((v+anchors[j][k])/2)));
export const PRECISION_PALETTE=[...new Map(ramps.map(p=>[p.join(','),p])).values()];
