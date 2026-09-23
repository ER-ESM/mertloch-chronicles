// Sprite-Schmiede · Pixelmaler (E-58). Macht aus dem G-Buffer des Renderers (Material, Helligkeit, Normale, Tiefe je Pixel)
// ein Sprite im Stil der gemalten Bögen statt eines verkleinerten 3D-Bilds:
//  1. Tonstufen: je Material wenige harte Töne aus seiner Farbtreppe (Schatten · Kern · Licht · Glanz) statt weicher Verläufe.
//  2. Cluster: einzelne Ausreißerpixel gehen im umgebenden Ton auf (keine Sprenkel).
//  3. Linien: an Tiefensprüngen zwischen Teilen und an scharfen Knicken (Falten, Kinn, Ärmelkante) eine dunkle Linie
//     im Ton des hinteren Materials – gefärbt, nicht grau.
//  4. Kontur: außen die dunkelste Stufe des angrenzenden Materials, zum warmen Dunkelbraun gezogen (wie `#3d3530` im Original).
// Zum Schluss rasten alle Farben auf PRECISION_PALETTE ein.
import {precisionColor} from '../sprite-pipeline/precision-resample.mjs';
import {hex} from './materials.mjs';
import {STAMPS} from './figure/stamps.mjs';

const mix=(a,b,t)=>a.map((c,k)=>Math.round(c+(b[k]-c)*t));
const INK=hex('#2a2024');
/** Standard-Tonschwellen (Helligkeit → Stufe der 7er-Farbtreppe). */
export const TONES={cut:[.2,.38,.58,.78],stops:[1,2,3,4,5]};
/** Kontrast je Material um die Mitte gespreizt: Haut und Haar brauchen sichtbares Licht und Schatten, sonst wirken sie flach. */
export const CONTRAST={haut:1.7,haar:1.45,stoff:1.2};

export function paint(g,{tones=TONES,crease=.72,lineDepth=.35,glint=.3,outlineInk=.55}={}){
 const {width:W,height:H,ids,depth,gb,solids}=g,N=W*H,col=new Array(N).fill(null),tone=new Int8Array(N).fill(-1);
 const group=i=>{const s=solids[ids[i]];return s.group??ids[i];};
 // 1 Tonstufen
 for(let i=0;i<N;i++){const d=gb[i];if(!d)continue;
  if(d.emissive){col[i]=d.emissive.map(Math.round);continue;}
  const v=.5+(d.val-.5)*(CONTRAST[d.mat]||1);let t=0;while(t<tones.cut.length&&v>=tones.cut[t])t++;tone[i]=t;
  let c=d.ramp[tones.stops[t]]||d.ramp[d.ramp.length-1];
  if(d.spec>glint)c=d.ramp[6]||c;
  if(d.glow&&(d.glow[0]+d.glow[1]+d.glow[2])>.08)c=c.map((v,k)=>Math.min(255,v+d.glow[k]*120));
  col[i]=c.map(Math.round);}
 const key=c=>c?c.join(','):'',nb=i=>{const x=i%W;return [x>0?i-1:-1,x<W-1?i+1:-1,i>=W?i-W:-1,i<N-W?i+W:-1];};
 // 2 Cluster: Ausreißer (kein Nachbar gleicher Farbe, ≥3 Nachbarn einig) übernehmen die Mehrheitsfarbe
 for(let pass=0;pass<2;pass++)for(let i=0;i<N;i++){if(!col[i]||gb[i].emissive)continue;const n=nb(i).filter(j=>j>=0&&col[j]&&ids[j]===ids[i]);
  if(n.length<3||n.some(j=>key(col[j])===key(col[i])))continue;const count=new Map();for(const j of n)count.set(key(col[j]),(count.get(key(col[j]))||0)+1);
  const [best,c]=[...count].sort((a,b)=>b[1]-a[1])[0];if(c>=3)col[i]=best.split(',').map(Number);}
 // 2b Gesichts-Stempel: Merkmale über die Kopfkoordinaten der Gesichtshaut finden und handgesetzte Pixel setzen
 const stamped=new Uint8Array(N);stampFace(g,col,stamped);
 // 3 Linien
 const line=new Uint8Array(N);
 for(let i=0;i<N;i++){if(!col[i])continue;for(const j of nb(i)){if(j<0||!col[j])continue;
  if(stamped[i])break;if(group(i)!==group(j)&&depth[j]-depth[i]>lineDepth){line[i]=2;break;}
  const a=gb[i].n,b=gb[j].n,dot=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  if(dot<crease&&depth[j]>depth[i]&&!line[i])line[i]=1;}}
 for(let i=0;i<N;i++){if(!line[i]||gb[i].emissive)continue;const r=gb[i].ramp;col[i]=line[i]===2?mix(r[0],INK,.35):r[Math.max(0,tones.stops[Math.max(0,tone[i]-1)]-1)]||r[0];}
 // 4 Kontur
 const out=new Uint8Array(W*H*4),ink=new Array(N).fill(null);
 for(let i=0;i<N;i++){if(col[i])continue;const n=nb(i).filter(j=>j>=0&&col[j]);if(!n.length)continue;
  const dark=n.map(j=>gb[j].ramp[0]).reduce((a,b)=>(a[0]+a[1]+a[2]<b[0]+b[1]+b[2]?a:b));ink[i]=mix(dark,INK,outlineInk);}
 for(let i=0;i<N;i++){const c=col[i]||ink[i];if(!c)continue;out.set([...precisionColor(c),255],i*4);}
 return {width:W,height:H,data:out,ids};
}

/** Augen, Brauen, Nase, Mund und Rouge als Pixel-Stempel. Das nähere Auge (weiter von der Nase) bekommt die volle Vorlage. */
function stampFace(g,col,stamped){const {ids,gb,solids,width:W}=g,face=[];
 for(let i=0;i<ids.length;i++)if(gb[i]&&solids[ids[i]]?.stamp)face.push(i);if(!face.length)return;
 const st=solids[ids[face[0]]].stamp,P=STAMPS[st.kind];if(!P)return;
 const at=i=>{const [u,v,w]=gb[i].uvw;return [u/st.h,v/st.h,w/st.h-st.FZ];},px=i=>[i%W,i/W|0];
 const nearest=(X,Z)=>{let best=-1,bd=.3;for(const i of face){const [x,y,z]=at(i);if(y<.9)continue;const d=Math.hypot(x-X,z-Z);if(d<bd){bd=d;best=i;}}return best;};
 const put=(pat,[ax,ay],i,flip)=>{const [x0,y0]=px(i);pat.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='.')return;const x=x0+(flip?ax-c:c-ax),y=y0+r-ay,j=y*W+x;
  if(x<0||x>=W||j<0||j>=ids.length||!gb[j]||!solids[ids[j]]?.stamp)return;col[j]=st.colors[ch];stamped[j]=1;}));};
 const eyes=[nearest(-st.EX,st.EZ),nearest(st.EX,st.EZ)].filter(i=>i>=0),nose=nearest(0,-.62),mouth=nearest(0,st.MZ+.04);
 const noseX=nose>=0?px(nose)[0]:eyes.reduce((s,e)=>s+px(e)[0],0)/Math.max(1,eyes.length);
 const dist=eyes.map(e=>Math.abs(px(e)[0]-noseX)),nearI=dist.length===2&&dist[1]>dist[0]?1:0;
 eyes.forEach((e,k)=>{const flip=px(e)[0]>noseX;// Vorlage: Nase links vom Auge; liegt die Nase rechts, spiegeln
  if(k===nearI)put(P.near,P.nearAnchor,e,!flip);else put(P.far,P.farAnchor,e,!flip);});
 if(nose>=0)put(P.nose,P.noseAnchor,nose,false);
 if(mouth>=0)put(P.mouth,P.mouthAnchor,mouth,false);
 for(const s of [-1,1]){const c=nearest(s*1.05,-.5);if(c>=0)put(P.cheek,P.cheekAnchor,c,s<0);}
}
