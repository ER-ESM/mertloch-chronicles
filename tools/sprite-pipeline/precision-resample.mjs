// Area sampling preserves small material features when exporting from detailed originals.
// Alpha stays binary; no interpolated blurry enlargement and no sharpening halos.
import {PRECISION_PALETTE} from '../../art-quality.js';
const cache=new Map();
export function precisionColor(rgb){const key=rgb.map(v=>v>>2).join(',');let p=cache.get(key);if(p)return p;let score=Infinity;for(const q of PRECISION_PALETTE){const d=rgb.reduce((s,v,k)=>s+(v-q[k])**2*[.8,1,.7][k],0);if(d<score){score=d;p=q;}}cache.set(key,p);return p;}
// Eigene Palette als Feld (z. B. NPC-Porträts: PRECISION_PALETTE + Farben der Anziehpuppe, tools/sprite-pipeline/portraet-palette.json).
// Gleiche Gewichtung wie precisionColor; Cache je Palette und exakter Farbe, damit das Ergebnis nicht von der Bildreihenfolge abhängt.
const own=new WeakMap();
export function paletteColor(rgb,pal){let c=own.get(pal);if(!c)own.set(pal,c=new Map());const key=rgb.join(',');let p=c.get(key);if(p)return p;let score=Infinity;for(const q of pal){const d=rgb.reduce((s,v,k)=>s+(v-q[k])**2*[.8,1,.7][k],0);if(d<score){score=d;p=q;}}c.set(key,p);return p;}
/** palette: true = PRECISION_PALETTE, false = Originalfarben, Feld von [r,g,b] = diese Palette. */
export function resample(src,dst,b,at,scale,{palette=true}={}){
 const w=Math.max(1,Math.round(b.w*scale)),h=Math.max(1,Math.round(b.h*scale));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const dx=at.x+x,dy=at.y+y;if(dx<0||dy<0||dx>=dst.width||dy>=dst.height)throw Error('Precision sprite clipped');
  const left=b.x+x*b.w/w,right=b.x+(x+1)*b.w/w,top=b.y+y*b.h/h,bottom=b.y+(y+1)*b.h/h;
  let alpha=0,total=0,r=0,g=0,blue=0;
  for(let sy=Math.floor(top);sy<Math.ceil(bottom);sy++)for(let sx=Math.floor(left);sx<Math.ceil(right);sx++){
   const weight=(Math.min(right,sx+1)-Math.max(left,sx))*(Math.min(bottom,sy+1)-Math.max(top,sy));
   const i=(sy*src.width+sx)*4,a=src.data[i+3]/255*weight;total+=weight;alpha+=a;r+=src.data[i]*a;g+=src.data[i+1]*a;blue+=src.data[i+2]*a;
  }
  if(alpha<total*.5)continue;
  const rgb=[r,g,blue].map(v=>Math.round(v/alpha));dst.data.set([...(Array.isArray(palette)?paletteColor(rgb,palette):palette?precisionColor(rgb):rgb),255],(dy*dst.width+dx)*4);
 }
}
