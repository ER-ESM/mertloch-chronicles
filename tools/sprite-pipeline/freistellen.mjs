// Freistellen 2026-09-25 (Icon-Review R0, Abschnitt 3.3): Atlas-Symbole ohne Kachelgrund.
// Quelle ist die Originalauflösung des semantischen Atlas (≈ 240 px je Zelle, heller Moosgrund, schwarze Tintenkontur) –
// dort trennt sich Grund und Motiv sauber, im 64er-Export (dunkler, gefleckter Grund) nicht mehr.
// Ablauf je Auftrag aus freigestellt-20260925-jobs.json:
//  1. Grund = gesättigtes Dunkelgrün des Atlas (Flutfüllung vom Zellenrand, 4er-Nachbarschaft; die Tintenkontur hält sie auf),
//  2. eingeschlossene Grundtaschen (Henkel, Kabelschlaufe) ab `hole` Pixeln ebenfalls frei, wenn Tinte sie einfasst,
//  3. Splitter unter `part` Pixeln (Gitterlinien, Rauschen) fallen weg,
//  4. Motiv auf 58/64 (3 px Rand) mit Präzisionspalette verkleinern (precision-resample, Flächenmittel),
//  5. Kontur schließen: jedes Außenkantenpixel heller als Luminanz 70 wird Tinte #171f29 (Stilbibel A1).
// Ergebnis: 64×64-Quelle unter assets/precision/sources/2026-09-25/freigestellt/, Export 1:1 (padding 0).
// Aufruf: node tools/sprite-pipeline/freistellen.mjs   (schreibt alle Quellen neu; byte-gleich reproduzierbar, siehe Test)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface} from './png.mjs';
import {resample} from './precision-resample.mjs';
const root=new URL('../../',import.meta.url);
export const FREISTELLEN_JOBS=JSON.parse(readFileSync(new URL('./freigestellt-20260925-jobs.json',import.meta.url)));
const INK=[23,31,41],SIZE=64,BOX=58;
// palette:'waffen' wie die gemalten Symbole (Präzisionspalette + Porträt- und Materialtreppen, waffen-palette.json): mehr Grüntöne für Hopfen und Etiketten.
const PALETTES={waffen:JSON.parse(readFileSync(new URL('./waffen-palette.json',import.meta.url)))};
// Rasterkanten des semantischen Atlas (wie precision-icons.mjs), 4 px nach innen gegen die schwarzen Gitterlinien.
const EDGES={x:[0,251,500,751,1002,1254],y:[0,250,493,733,969,1254]};
export const atlasRect=i=>{const c=i%5,r=Math.floor(i/5);return{x:EDGES.x[c]+4,y:EDGES.y[r]+4,w:EDGES.x[c+1]-EDGES.x[c]-8,h:EDGES.y[r+1]-EDGES.y[r]-8};};
const lum=(r,g,b)=>.299*r+.587*g+.114*b;
/** Atlasgrund: Moosgrün mit wenig Rot und Blau (gemessen im Zellenrand: G 32–64, R ≤ 32, B ≤ 15). */
const isGround=(r,g,b)=>g>=20&&g<=100&&g-r>=12&&g-b>=18&&r<=64&&b<=44;
export function freistellen(atlas,job){
 const R=atlasRect(job.cell),W=R.w,H=R.h,cut=surface(W,H);
 for(let y=0;y<H;y++)cut.data.set(atlas.data.subarray(((R.y+y)*atlas.width+R.x)*4,((R.y+y)*atlas.width+R.x+W)*4),y*W*4);
 const d=cut.data,ground=new Uint8Array(W*H),free=new Uint8Array(W*H),queue=new Int32Array(W*H);
 for(let i=0;i<W*H;i++)ground[i]=isGround(d[i*4],d[i*4+1],d[i*4+2])?1:0;
 // 1. Flutfüllung vom Rand
 let head=0,tail=0;const push=i=>{if(ground[i]&&!free[i]){free[i]=1;queue[tail++]=i;}};
 for(let x=0;x<W;x++){push(x);push((H-1)*W+x);}for(let y=0;y<H;y++){push(y*W);push(y*W+W-1);}
 const n4=(i,f)=>{const x=i%W,y=(i/W)|0;if(x>0)f(i-1);if(x<W-1)f(i+1);if(y>0)f(i-W);if(y<H-1)f(i+W);};
 while(head<tail)n4(queue[head++],push);
 // 2. eingeschlossene Grundtaschen
 const seen=new Uint8Array(W*H);
 const region=(start,test)=>{let h=0,t=0;queue[t++]=start;seen[start]=1;while(h<t){const i=queue[h++];n4(i,j=>{if(!seen[j]&&test(j)){seen[j]=1;queue[t++]=j;}});}return queue.slice(0,t);};
 // Nur Taschen, die ringsum von Tinte eingefasst sind (≥ 85 % der Randnachbarn dunkel) – dunkelgrüne Schattierung im Motiv
 // (Hopfendolden, Etiketten, Hutkrempe) grenzt an hellere Motivfarben und bleibt stehen.
 if(job.hole)for(let i=0;i<W*H;i++)if(ground[i]&&!free[i]&&!seen[i]){const px=region(i,j=>ground[j]&&!free[j]);if(px.length<job.hole)continue;
  const inside=new Set(px);let ring=0,dark=0;for(const j of px)n4(j,k=>{if(inside.has(k))return;ring++;if(lum(d[k*4],d[k*4+1],d[k*4+2])<45)dark++;});
  if(dark>=ring*.85)for(const j of px)free[j]=1;}
 // 3. Splitter entfernen
 seen.fill(0);
 for(let i=0;i<W*H;i++)if(!free[i]&&!seen[i]){const px=region(i,j=>!free[j]);if(px.length<(job.part??150))for(const j of px)free[j]=1;}
 for(let i=0;i<W*H;i++)d[i*4+3]=free[i]?0:255;
 // 4. Motivrahmen und Export auf 64 mit 3 px Rand
 let x0=W,y0=H,x1=-1,y1=-1;for(let i=0;i<W*H;i++)if(!free[i]){const x=i%W,y=(i/W)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 const b={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1},s=Math.min(BOX/b.w,BOX/b.h),out=surface(SIZE,SIZE);
 resample(cut,out,b,{x:Math.floor((SIZE-Math.round(b.w*s))/2),y:Math.floor((SIZE-Math.round(b.h*s))/2)},s,job.palette?{palette:PALETTES[job.palette]}:undefined);
 // 5. Kontur schließen
 const o=out.data,A=(x,y)=>x<0||y<0||x>=SIZE||y>=SIZE?0:o[(y*SIZE+x)*4+3],fix=[];
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const i=(y*SIZE+x)*4;if(!o[i+3])continue;if((A(x-1,y)&&A(x+1,y)&&A(x,y-1)&&A(x,y+1)))continue;if(lum(o[i],o[i+1],o[i+2])>=70)fix.push(i);}
 for(const i of fix)o.set(INK,i);
 return out;
}
export function buildFreigestellt(){const atlas=new Map(),files=new Map();
 for(const job of FREISTELLEN_JOBS){if(!atlas.has(job.from))atlas.set(job.from,decodePng(readFileSync(new URL(job.from,root))));files.set(job.output,encodePng(freistellen(atlas.get(job.from),job)));}
 return files;}
if(process.argv[1]===fileURLToPath(import.meta.url)){for(const[p,bytes]of buildFreigestellt()){const url=new URL(p,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,bytes);console.log(p);}}
