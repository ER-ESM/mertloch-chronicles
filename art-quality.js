// Precision export contract: world measurements are independent of bitmap resolution.
import {DETAIL_PALETTE} from './art-style.js';
export const WORLD_ART_DENSITY=4;
export const ICON_ART_SIZE=64;
const anchors=DETAIL_PALETTE.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16)));
const ramps=[...anchors];
for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(Math.hypot(...anchors[i].map((v,k)=>v-anchors[j][k]))<100)ramps.push(anchors[i].map((v,k)=>Math.round((v+anchors[j][k])/2)));
export const PRECISION_PALETTE=[...new Map(ramps.map(p=>[p.join(','),p])).values()];
