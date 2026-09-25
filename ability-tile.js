// Fähigkeitskachel nach Stilbibel B (Icon-Review R0, Abschnitt 4): alles, was als Fähigkeit erscheint, steht auf derselben
// Moos-Kachel – Kniffe, e32-Spec-Kniffe, Klassen-Buffs, Gegenstände auf der Leiste, Spez-Symbole.
// Rezept (64 × 64, randlos, der Knopf rahmt): Basis #263530, 27 % Moosflecken #354b36, 16 % Tupfen #171f29, 5 % warm #3d3530;
// äußere 4 px eine Stufe dunkler (Moos → Basis, Basis → Tinte), 1 px Tintenrahmen #171f29; Motiv auf 85 % (54 px Langseite),
// Schlagschatten 2 px nach rechts unten in Tinte. Das Muster ist deterministisch und je Kennung geseedet.
// Ein Modul, zwei Aufrufer: der Export in Node (precision-icons.mjs, build-talents.mjs, e71-kniffe-draw.mjs) und die Laufzeit
// (skill-art.js, item-art.js) rechnen dieselben Pixel; die Laufzeit verkleinert danach wie jedes Präzisionssymbol per Flächenmittel.
import {PRECISION_PALETTE} from './art-quality.js';
import {shrinkPixels,contentArt} from './content-art.js';
export const TILE_SIZE=64,TILE_FILL=.85,TILE_SHADOW=2,TILE_VIGNETTE=4;
export const TILE_COLORS={base:[38,53,48],moss:[53,75,54],speck:[23,31,41],warm:[61,53,48],ink:[23,31,41]};
export const TILE_SHARES={moss:.27,speck:.16,warm:.05};
const DARKER={moss:'base',base:'ink',warm:'base',speck:'ink',ink:'ink'};

/** Zufallsfolge je Kennung (FNV-1a + Mulberry, wie e71-kniffe-draw.mjs). */
export function tileRandom(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);let s=h>>>0;
 return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function valueNoise(r,G,size){const g=Array.from({length:(G+1)*(G+1)},()=>r()),s=t=>t*t*(3-2*t);
 return(x,y)=>{const fx=x/(size-1)*G,fy=y/(size-1)*G,i=Math.min(G-1,Math.floor(fx)),j=Math.min(G-1,Math.floor(fy)),u=s(fx-i),v=s(fy-j),at=(a,b)=>g[b*(G+1)+a];
  return at(i,j)*(1-u)*(1-v)+at(i+1,j)*u*(1-v)+at(i,j+1)*(1-u)*v+at(i+1,j+1)*u*v;};}
const edge=(x,y,size)=>Math.min(x,y,size-1-x,size-1-y);

/** Grundmuster je Pixel als Name (base/moss/speck/warm/ink), ohne Vignette. Anteile exakt über den Rang je Feld. Tupfen in kleinen
 *  Gruppen statt Einzelpixeln: verkleinert auf 48 mischen sich Tinte und Basis sonst zum bläulichen #1e2c35 (gemessen 7 % statt 3 %). */
export function tilePattern(seed,size=TILE_SIZE){
 const r=tileRandom('kachel:'+seed),moss=valueNoise(r,8,size),mossFine=valueNoise(r,20,size),warm=valueNoise(r,6,size),speckFine=valueNoise(r,12,size);
 const cells=[];for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++)cells.push({i:y*size+x,m:moss(x,y)+mossFine(x,y)*.45+r()*.25,w:warm(x,y)+r()*.5,s:r()*.2+speckFine(x,y)});
 const out=new Array(size*size).fill('ink'),n=cells.length;let rest=cells;
 for(const [name,key] of [['moss','m'],['warm','w'],['speck','s']]){rest=[...rest].sort((a,b)=>b[key]-a[key]||a.i-b.i);const k=Math.round(TILE_SHARES[name]*n);for(const c of rest.slice(0,k))out[c.i]=name;rest=rest.slice(k);}
 for(const c of rest)out[c.i]='base';
 return out;}

/** Leere Kachel: Muster, Vignette, Tintenrahmen. */
export function tileGround(seed,size=TILE_SIZE){
 const pattern=tilePattern(seed,size),data=new Uint8ClampedArray(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*size+x,d=edge(x,y,size);let name=pattern[i];if(d<TILE_VIGNETTE)name=DARKER[name];if(d===0)name='ink';data.set([...TILE_COLORS[name],255],i*4);}
 return{width:size,height:size,data};}

/** Schlagschatten: Pixel, auf die das Motiv um 1–2 px nach rechts unten fällt, ohne das Motiv selbst. */
export function tileShadowMask(occ,size=TILE_SIZE){const out=new Uint8Array(size*size),on=(x,y)=>x>=0&&y>=0&&occ[y*size+x]===1;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!occ[y*size+x]&&(on(x-1,y-1)||on(x-2,y-2)||on(x-1,y-2)||on(x-2,y-1)))out[y*size+x]=1;return out;}

/** Äußeren Ring auf Tinte setzen (gemalte Kacheln aus den alten Atlanten: Rahmen bleibt 1 px, auch nach dem Verkleinern). */
export function inkFrame(img){const {width:w,height:h,data}=img;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x===0||y===0||x===w-1||y===h-1)data.set([...TILE_COLORS.ink,255],(y*w+x)*4);return img;}

/** Palette aller Kniff-Kacheln: PRECISION_PALETTE ohne das bläuliche #1e2c35 (Stilbibel B „kein #1e2c35“). Beim Verkleinern mischen
 *  sich Tinte und Basis sonst genau zu diesem Ton (Review R1: 2–4 % in den e32-Zellen). */
export const TILE_PALETTE=PRECISION_PALETTE.filter(q=>q.join(',')!=='30,44,53');
// Palettenfarbe je exakter Farbe: das Ergebnis hängt nicht von der Reihenfolge ab (Export und Laufzeit gleich).
const snaps=new Map();
function snap(r,g,b){const key=r<<16|g<<8|b;let p=snaps.get(key);if(p)return p;let score=Infinity;for(const q of TILE_PALETTE){const d=(r-q[0])**2*.8+(g-q[1])**2+(b-q[2])**2*.7;if(d<score){score=d;p=q;}}snaps.set(key,p);return p;}
/** Deckende Hülle (Alpha ≥ 128) innerhalb von rect oder null. */
export function motifBounds(src,rect={x:0,y:0,w:src.width,h:src.height}){let x0=Infinity,y0=Infinity,x1=-1,y1=-1;
 for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)if(src.data[(y*src.width+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
/** Flächenmittel wie precision-resample/shrinkPixels: deckend ab 50 % Deckung, Farbe auf TILE_PALETTE. */
export function areaMean(src,b,dw,dh){const out=new Uint8ClampedArray(dw*dh*4),d=src.data;
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const left=b.x+x*b.w/dw,right=b.x+(x+1)*b.w/dw,top=b.y+y*b.h/dh,bottom=b.y+(y+1)*b.h/dh;let alpha=0,total=0,r=0,g=0,bl=0;
  for(let sy=Math.floor(top);sy<Math.ceil(bottom);sy++)for(let sx=Math.floor(left);sx<Math.ceil(right);sx++){const wt=(Math.min(right,sx+1)-Math.max(left,sx))*(Math.min(bottom,sy+1)-Math.max(top,sy)),i=(sy*src.width+sx)*4,a=d[i+3]/255*wt;total+=wt;alpha+=a;r+=d[i]*a;g+=d[i+1]*a;bl+=d[i+2]*a;}
  if(alpha<total*.5)continue;const p=snap(Math.round(r/alpha),Math.round(g/alpha),Math.round(bl/alpha)),o=(y*dw+x)*4;out[o]=p[0];out[o+1]=p[1];out[o+2]=p[2];out[o+3]=255;}
 return out;}

/**
 * Atlaskachel als Motiv (deckendes Quadrat, z. B. Dose oder Becher aus dem semantic-atlas): den dunklen Grund vom Rand her per
 * Flutfüllung freistellen (Luminanz < 70, grünlich/neutral), danach 1 px Tintenkontur ums Motiv (Stilbibel A1). Sonst null.
 */
export function freeTileMotif(src,b){const {width:w,height:h}=src,d=src.data;let n=0;
 for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(d[(y*w+x)*4+3]>=128)n++;if(n<b.w*b.h*.97)return null;
 const out=new Uint8ClampedArray(d),seen=new Uint8Array(w*h),queue=[],inB=(x,y)=>x>=b.x&&y>=b.y&&x<b.x+b.w&&y<b.y+b.h;
 const ground=i=>{const r=out[i*4],g=out[i*4+1],bl=out[i*4+2];return out[i*4+3]>=128&&.299*r+.587*g+.114*bl<70&&g+6>=r&&g+12>=bl;};
 for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if((x===b.x||y===b.y||x===b.x+b.w-1||y===b.y+b.h-1)&&ground(y*w+x)){seen[y*w+x]=1;queue.push(y*w+x);}
 while(queue.length){const i=queue.pop(),x=i%w,y=(i/w)|0;out[i*4+3]=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=(y+dy)*w+x+dx;if(inB(x+dx,y+dy)&&!seen[j]&&ground(j)){seen[j]=1;queue.push(j);}}}
 const res=new Uint8ClampedArray(out);for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const i=y*w+x;if(out[i*4+3])continue;
  if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>inB(x+dx,y+dy)&&out[((y+dy)*w+x+dx)*4+3]))res.set([...TILE_COLORS.ink,255],i*4);}
 return{width:w,height:h,data:res};}

/**
 * Fertige Kachel (size × size, deckend): Motiv aus src (RGBA, optional nur rect) auf 85 % der Kachel, mittig samt Schatten;
 * eine Atlaskachel als Motiv wird vorher freigestellt (freeTileMotif), damit keine Kachel in der Kachel steht.
 * Ohne Motiv bleibt die leere Kachel (z. B. Grafik noch nicht geladen).
 */
export function abilityTile(seed,src,{rect,size=TILE_SIZE,fill=TILE_FILL}={}){
 const out=tileGround(seed,size);let b=src&&motifBounds(src,rect);if(!b)return out;
 const area=rect||{w:src.width,h:src.height},freed=b.w>=area.w*.6&&b.h>=area.h*.6&&freeTileMotif(src,b);if(freed){src=freed;b=motifBounds(src,b);if(!b)return out;}
 const box=Math.round(size*fill),s=box/Math.max(b.w,b.h),w=Math.max(1,Math.round(b.w*s)),h=Math.max(1,Math.round(b.h*s));
 const px=areaMean(src,b,w,h),ox=Math.floor((size-w-TILE_SHADOW)/2),oy=Math.floor((size-h-TILE_SHADOW)/2),occ=new Uint8Array(size*size);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(px[(y*w+x)*4+3])occ[(oy+y)*size+ox+x]=1;
 const shadow=tileShadowMask(occ,size);
 for(let i=0;i<size*size;i++)if(shadow[i])out.data.set([...TILE_COLORS.ink,255],i*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(px[k+3])out.data.set(px.subarray(k,k+4),((oy+y)*size+ox+x)*4);}
 return inkFrame(out);}

// ------------------------------------------------------------------ Laufzeit (Browser)
const MOTIF=128,painted=new Map();
/**
 * Malt die Kachel auf den Canvas: `paintMotif(canvas)` zeichnet das Motiv frei auf einen leeren 128er-Canvas (Gegenstandsbild,
 * Detailsymbol …); danach Kachel in 64 und Flächenmittel auf die Canvasgröße, wie drawContentIcon es mit exportierten Kacheln tut; der 1-px-Rahmen
 * wird danach neu gesetzt (wie inkRim in skill-art.js).
 * `key` (optional) hält das fertige Bild je Canvasgröße im Speicher. Markiert den Canvas als Präzisionssymbol (kein styleIcon).
 */
export function paintAbilityTile(canvas,seed,paintMotif,key=null){
 const W=canvas.width,H=canvas.height,cacheKey=key&&key+'|'+seed+'|'+W+'x'+H+'|'+contentArt.images.size;/* neu, sobald Grafik nachlädt */let px=cacheKey&&painted.get(cacheKey);
 if(!px){const m=document.createElement('canvas');m.width=m.height=MOTIF;paintMotif(m);let src=null;try{src=m.getContext('2d',{willReadFrequently:true}).getImageData(0,0,MOTIF,MOTIF);}catch{}
  const tile=abilityTile(seed,src&&{width:MOTIF,height:MOTIF,data:src.data});px=W===TILE_SIZE&&H===TILE_SIZE?tile.data:inkFrame({width:W,height:H,data:shrinkPixels(tile.data,TILE_SIZE,TILE_SIZE,W,H)}).data;
  if(cacheKey){if(painted.size>400)painted.clear();painted.set(cacheKey,px);}}
 const c=canvas.getContext('2d');c.clearRect(0,0,W,H);c.putImageData(new ImageData(new Uint8ClampedArray(px),W,H),0,0);
 canvas.dataset.tile=seed;canvas.dataset.precision='true';return true;}
