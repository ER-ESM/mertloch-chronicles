// Sprite-Schmiede · Figuren-Export (E-58). Rendert die Rezepte aus tools/sprite-forge/figures/*.mjs in das Bogenformat des
// Präzisionskatalogs (192er Zellen, Fußpunkt 96/160, Zeilen se/sw/ne/nw): `<id>.png` mit den acht Posen und `<id>-walk.png`
// mit acht Laufbildern. Katalog: assets/forge/runtime/figures/catalog.json – content-art.js lädt ihn nach dem Präzisionskatalog,
// Schmiede-Figuren ersetzen dort gleichnamige Einträge. Die 64 Zellen je Figur rendern parallel in Worker-Threads.
//   node tools/sprite-forge/figures.mjs [--only=ida] [--dry] [--layers] [--quick] [--rows=se]
// --quick: ohne Doppelauflösung (schnelle Zwischenstände), --rows=se: nur diese Blickrichtung(en). Testfiguren in figures/_*.mjs nur mit --dry.
// Jeder Lauf schreibt auch visual-review/forge/zoom-<name>.png: Grundhaltung in allen Richtungen, 3× vergrößert.
// --layers schreibt zusätzlich je Ebene (haut, haar, hemd …) einen Bogen mit eingerechneter Verdeckung nach visual-review/forge/ebenen/.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Worker,isMainThread,parentPort} from 'node:worker_threads';
import {cpus} from 'node:os';
import path from 'node:path';
import {renderScene,autoBounds} from './render.mjs';
import {setMood} from './materials.mjs';
setMood('warm');// Figuren im warmen Licht der gemalten Bögen (gilt im Haupt- und in jedem Worker-Thread)
import {figureScene,place,POSES,POSE_COLUMNS,walkPose,DIRECTIONS,characterRecipe} from './figure.mjs';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';

const SELF=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SELF),'../..');
export const OUT='assets/forge/runtime/figures/',CELL=192,PIVOT={x:96,y:160},WALK_FRAMES=8;
// Fenster um den Fußpunkt (in E): ±12 breit, 32 nach oben, 8 nach unten (Sitzpose) – liegt in der Zelle bei (48,32).
const WIN={x0:-12,y0:-32,w:96,h:160},AT={x:PIVOT.x-48,y:PIVOT.y-128};

export async function loadFigures({tests=false}={}){const dir=path.join(ROOT,'tools/sprite-forge/figures'),all={};
 for(const f of readdirSync(dir).filter(f=>f.endsWith('.mjs')&&(tests||!f.startsWith('_'))).sort()){const mod=await import(pathToFileURL(path.join(dir,f)).href);
  for(const [id,d] of Object.entries(mod.FIGURES||{})){if(all[id])throw Error('Figur doppelt: '+id);all[id]=d;}}
 return all;}

/** Eine Zelle rendern: Rezept + Pose + Blickrichtung → 96×136-Fenster samt Ebenenname je Pixel. */
/** Malstufen der Figuren (render.mjs): Doppelauflösung, Kantenlicht, gemalte Helligkeitsstufen. */
// Figuren: flache Kamera (15°, fast frontal wie die gemalten Bögen), warmes Kantenlicht, weiche Übergänge.
export const FIGURE_STYLE={oversample:2,ss:1,rim:.3,rimTint:'#ffd9a0',bands:0,pitch:15,exposure:.84},QUICK_STYLE={...FIGURE_STYLE,oversample:1};
export function renderCell(recipe,pose,facing,style=FIGURE_STYLE){
 const scene=autoBounds(place(figureScene(recipe,pose),facing));
 const img=renderScene(scene,{view:'oblique',x0:WIN.x0,y0:WIN.y0,width:WIN.w,height:WIN.h,zTop:38,...style});
 const names=[...new Set(scene.solids.map(s=>s.layer))],layer=new Int8Array(img.ids.length).fill(-1);
 for(let i=0;i<layer.length;i++)if(img.ids[i]>=0)layer[i]=names.indexOf(scene.solids[img.ids[i]].layer);
 return {data:img.data,layer,names};}

// ---------- Worker ----------
if(!isMainThread&&parentPort){parentPort.on('message',({key,recipe,pose,facing,style})=>{const r=renderCell(recipe,pose,facing,style);parentPort.postMessage({key,...r},[r.data.buffer,r.layer.buffer]);});}

function pool(n){const workers=[...Array(n)].map(()=>new Worker(SELF)),queue=[],busy=new Set();let pending=new Map();
 const pump=()=>{for(const w of workers){if(busy.has(w)||!queue.length)continue;const t=queue.shift();busy.add(w);pending.set(t.key,t);w.postMessage(t.msg);}};
 for(const w of workers)w.on('message',m=>{busy.delete(w);const t=pending.get(m.key);pending.delete(m.key);t.resolve(m);pump();});
 return {run:(key,msg)=>new Promise(resolve=>{queue.push({key,msg:{key,...msg},resolve});pump();}),close:()=>workers.forEach(w=>w.terminate())};}

function blitCell(sheet,cell,col,row,filter=null){for(let y=0;y<WIN.h;y++)for(let x=0;x<WIN.w;x++){const i=y*WIN.w+x;if(!cell.data[i*4+3])continue;
  if(filter&&!filter(i))continue;sheet.data.set(cell.data.subarray(i*4,i*4+4),((row*CELL+AT.y+y)*sheet.width+col*CELL+AT.x+x)*4);}}

export async function renderFigure(fig,{layers=false,workers,style=FIGURE_STYLE,rows=DIRECTIONS}={}){
 const base=fig.pose||{},poses=surface(CELL*8,CELL*4),walk=surface(CELL*WALK_FRAMES,CELL*4),layerSheets=new Map(),frames=[],walkFrames=[],jobs=[];
 const P=workers||pool(Math.max(2,Math.min(12,cpus().length-2)));
 DIRECTIONS.forEach((dir,row)=>{if(!rows.includes(dir))return;
  POSE_COLUMNS.forEach((name,col)=>{frames.push({x:col*CELL,y:row*CELL,pose:name,direction:dir});
   jobs.push(P.run(`p${row}-${col}`,{recipe:characterRecipe(fig),pose:POSES[name](base),facing:dir,style}).then(c=>{blitCell(poses,c,col,row);
    if(layers)c.names.forEach((L,li)=>{if(!layerSheets.has(L))layerSheets.set(L,surface(CELL*8,CELL*4));blitCell(layerSheets.get(L),c,col,row,i=>c.layer[i]===li);});}));});
  for(let f=0;f<WALK_FRAMES;f++){walkFrames.push({x:f*CELL,y:row*CELL,pose:'walk-'+f,direction:dir});
   jobs.push(P.run(`w${row}-${f}`,{recipe:characterRecipe(fig),pose:walkPose(f/WALK_FRAMES,{base}),facing:dir,style}).then(c=>blitCell(walk,c,f,row)));}
 });
 await Promise.all(jobs);if(!workers)P.close();
 return {poses,walk,frames,walkFrames,layerSheets};
}

/** Grundhaltung (Spalte idle) in allen gerenderten Richtungen, 3× vergrößert – für Gesichter und Details. */
function zoom(results,sc=3){const cw=WIN.w*sc,ch=WIN.h*sc,img=surface(cw*4,ch*results.length);for(let i=0;i<img.width*img.height;i++)img.data.set([34,30,36,255],i*4);
 results.forEach((r,k)=>DIRECTIONS.forEach((d,row)=>{for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const sx=AT.x+(x/sc|0),sy=row*CELL+AT.y+(y/sc|0),si=(sy*r.poses.width+sx)*4;if(r.poses.data[si+3])img.data.set(r.poses.data.subarray(si,si+4),((k*ch+y)*img.width+row*cw+x)*4);}}));
 return img;}
function contact(results){// Nur zur Sichtprüfung: je Figur die Zeile „se“ der Posen und des Laufzyklus auf dunklem Grund.
 const W=CELL*8,img=surface(W,CELL*results.length*2);for(let i=0;i<img.width*img.height;i++)img.data.set([34,30,36,255],i*4);
 results.forEach((r,k)=>[r.poses,r.walk].forEach((sheet,sub)=>{for(let y=0;y<CELL;y++)for(let x=0;x<W;x++){const si=(y*sheet.width+x)*4;if(sheet.data[si+3])img.data.set(sheet.data.subarray(si,si+4),(((k*2+sub)*CELL+y)*W+x)*4);}}));
 return img;}

if(isMainThread&&process.argv[1]&&SELF===path.resolve(process.argv[1])){
 process.chdir(ROOT);
 const arg=k=>(process.argv.find(a=>a.startsWith('--'+k+'='))||'').slice(k.length+3);
 const only=arg('only').split(',').filter(Boolean),dry=process.argv.includes('--dry'),layers=process.argv.includes('--layers'),quick=process.argv.includes('--quick');
 const rows=arg('rows')?arg('rows').split(','):DIRECTIONS,style=quick?QUICK_STYLE:FIGURE_STYLE;
 if(!dry&&(quick||rows.length<4))throw Error('--quick und --rows nur zusammen mit --dry');
 const figs=await loadFigures({tests:dry}),ids=Object.keys(figs).filter(id=>!only.length||only.includes(id)).sort();
 const catFile=OUT+'catalog.json',cat=existsSync(catFile)?JSON.parse(readFileSync(catFile,'utf8')):{format:'forge-figures-v1',directions:DIRECTIONS,frameSize:CELL,pivot:PIVOT,assets:{}};
 if(!dry)mkdirSync(OUT,{recursive:true});const results=[],workers=pool(Math.max(2,Math.min(12,cpus().length-2)));
 for(const id of ids){const t0=Date.now(),r=await renderFigure(figs[id],{layers,workers,style,rows});results.push(r);
  if(!dry){writeFileSync(OUT+id+'.png',encodePng(r.poses));writeFileSync(OUT+id+'-walk.png',encodePng(r.walk));
   const common={frameSize:CELL,pivot:PIVOT,nativeHeight:104,worldHeight:26,source:'sprite-forge'};
   cat.assets[id]={...common,path:OUT+id+'.png',columns:POSE_COLUMNS,frames:r.frames};
   // Schrittweite: ein Laufzyklus (8 Bilder) = zwei Schritte à 2 · Beinlänge · sin 27° ≈ 2 · 11,4 E.
   cat.assets[id+'-walk']={...common,path:OUT+id+'-walk.png',columns:[...Array(WALK_FRAMES).keys()].map(i=>'walk-'+i),stride:24,animation:'forge-rig',frames:r.walkFrames};}
  if(dry){mkdirSync('visual-review/forge/bogen',{recursive:true});writeFileSync('visual-review/forge/bogen/'+(arg('name')||'vorschau')+'-'+id+'.png',encodePng(r.poses));}
  if(layers){const dir='visual-review/forge/ebenen/';mkdirSync(dir,{recursive:true});for(const [L,s] of r.layerSheets)writeFileSync(dir+id+'-'+L+'.png',encodePng(s));}
  console.log(`✓ ${id} (${((Date.now()-t0)/1000).toFixed(1)} s)`);}
 workers.close();
 if(!dry){cat.assets=Object.fromEntries(Object.entries(cat.assets).sort(([a],[b])=>a<b?-1:1));writeFileSync(catFile,JSON.stringify(cat)+'\n');}
 mkdirSync('visual-review/forge',{recursive:true});const name=arg('name')||only.join('-')||'alle',sheet='visual-review/forge/figuren-'+name+'.png';writeFileSync(sheet,encodePng(contact(results)));writeFileSync('visual-review/forge/zoom-'+name+'.png',encodePng(zoom(results)));
 console.log('Kontaktbogen:',sheet);
}
