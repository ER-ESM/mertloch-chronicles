// Sprite-Schmiede · Baukasten-Export (E-58). Rendert die Modelle aus tools/sprite-forge/models/*.mjs mit den Maßen aus
// content/sprite-kit.js und schreibt assets/forge/runtime/kit/ samt kit-forge.json. kit-art.js bevorzugt diese Bilder
// vor den imagegen-Bögen (assets/precision/runtime/kit/) und spielt Bildfolgen (`frames`, `fps`) ab.
//   node tools/sprite-forge/kit.mjs                 alle Modelle
//   node tools/sprite-forge/kit.mjs --only=ofen,stuhl --sheet   nur diese, plus Kontaktbogen zur Sichtprüfung
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {resolveSprite,kitIs} from '../../world-kit.js';
import {renderScene,cropTop,PX,PITCH} from './render.mjs';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const OUT='assets/forge/runtime/kit/',CATALOG=OUT+'kit-forge.json',REVIEW='visual-review/forge/';

/** Alle Modelle aus models/*.mjs einsammeln: export const MODELS={id:{build(t,def)→scene, frames?, fps?, pitch?, top?}}. */
/** `tolerant`: kaputte Modelldateien anderer (z. B. parallel arbeitender Agenten) nur melden statt abbrechen. */
export async function loadModels({tolerant=false}={}){const dir=path.join(ROOT,'tools/sprite-forge/models'),all={};
 for(const f of readdirSync(dir).filter(f=>f.endsWith('.mjs')).sort()){let mod;
  try{mod=await import(pathToFileURL(path.join(dir,f)).href);}catch(e){if(!tolerant)throw e;console.log(`! ${f} übersprungen: ${e.message.split('\n')[0]}`);continue;}
  for(const [id,m] of Object.entries(mod.MODELS||{})){if(all[id])throw Error(`Modell ${id} doppelt (${f})`);all[id]={...m,file:f};}}
 return all;}

/** Bildrahmen einer Art: Breite = Standfläche × 4 px, Unterkante = Vorderkante der Standfläche auf z=0. */
export function kitFrame(def,model){
 const w=model.w??def.w,h=model.h??def.h,T=Math.tan((model.pitch??PITCH)*Math.PI/180);
 // Beläge: eine Kachel von `tile` E (Standard 64) senkrecht von oben; das Muster muss mit dieser Periode nahtlos sein.
 if(kitIs(def,'belag')){const s=model.tile??(typeof def.tile==='number'?def.tile:64);return {view:'top',x0:-s/2,y0:-s/2,width:Math.round(s*PX),height:Math.round(s*PX),tile:s};}
 if(kitIs(def,'bodendeko')||model.view==='top')return {view:'top',x0:-w/2,y0:-h/2,width:Math.round(w*PX),height:Math.round(h*PX)};
 const tall=(model.height??def.height??12)+(model.extraTop??6),bottom=h/2*T,y0=-h/2*T-tall;
 return {view:'oblique',x0:-w/2,y0,width:Math.round(w*PX),height:Math.ceil((bottom-y0)*PX)};}

/** Wandstreifen (Klasse wand/zaun): oben die Krone von oben (Tiefe = Wandstärke), darunter die Front von vorn (Höhe = def.cut).
 * Das Modell steht mit der Wand entlang x (Länge `length` E, periodisch), Wandmitte y=0, Fuß z=0. */
function renderStrip(def,model,scene){
 const L=model.length??64,thick=model.thickness??def.thickness??6,cut=def.cut??22;
 const crown=renderScene(scene,{view:'top',x0:-L/2,y0:-thick/2,width:Math.round(L*PX),height:Math.round(thick*PX),outline:false,ss:model.ss??2});
 const front=renderScene(scene,{view:'front',x0:-L/2,y0:-cut,width:Math.round(L*PX),height:Math.round(cut*PX),outline:false,ss:model.ss??2});
 const img=surface(crown.width,crown.height+front.height);img.data.set(crown.data,0);img.data.set(front.data,crown.data.length);
 return {img,cap:crown.height};}

export function renderModel(id,model){
 const def=resolveSprite(id),n=model.frames||1,imgs=[];
 if(kitIs(def,'wand')){const {img,cap}=renderStrip(def,model,model.build(0,def));return {sheet:img,frameWidth:img.width,height:img.height,frames:1,cap};}
 const fr=kitFrame(def,model);
 for(let i=0;i<n;i++){const scene=model.build(n>1?i/n:0,def);imgs.push(renderScene(scene,{...fr,pitch:model.pitch??PITCH,view:fr.view,ss:model.ss??2,outline:!fr.tile}));}
 // Gemeinsamer Zuschnitt oben über alle Bilder, damit der Anker (Unterkante) bei jeder Bildfolge gleich bleibt.
 const cut=fr.view==='top'?0:Math.min(...imgs.map(im=>cropTop(im).cropped));
 const fw=fr.width,fh=fr.height-cut,sheet=surface(fw*n,fh);
 imgs.forEach((im,k)=>{for(let y=0;y<fh;y++)sheet.data.set(im.data.subarray((y+cut)*fw*4,(y+cut+1)*fw*4),(y*fw*n+k*fw)*4);});
 return {sheet,frameWidth:fw,height:fh,frames:n,tile:fr.tile};}

function contactSheet(results){// Dunkler Grund, 2× vergrößert, Bildfolgen nebeneinander – nur zur Sichtprüfung, nicht im Spiel.
 const pad=12,sc=2,tile2=s=>{const o=surface(s.width*2,s.height*2);for(let y=0;y<o.height;y++)for(let x=0;x<o.width;x++)o.data.set(s.data.subarray(((y%s.height)*s.width+x%s.width)*4,((y%s.height)*s.width+x%s.width)*4+4),(y*o.width+x)*4);return o;};
 const rows=results.map(r=>r.tile?{...r,sheet:tile2(r.sheet)}:r).map(r=>({...r,W:r.sheet.width*sc,H:r.sheet.height*sc}));
 const W=Math.max(...rows.map(r=>r.W))+pad*2,H=rows.reduce((s,r)=>s+r.H+pad,pad),img=surface(W,H);
 for(let i=0;i<W*H;i++)img.data.set([34,30,36,255],i*4);
 let oy=pad;for(const r of rows){for(let y=0;y<r.H;y++)for(let x=0;x<r.W;x++){const si=((y/sc|0)*r.sheet.width+(x/sc|0))*4;if(!r.sheet.data[si+3])continue;img.data.set(r.sheet.data.subarray(si,si+4),((oy+y)*W+pad+x)*4);}oy+=r.H+pad;}
 return img;}

if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 process.chdir(ROOT);
 // --dry: nur rendern und Kontaktbogen schreiben, nichts unter assets/ und nicht den gemeinsamen Katalog (für parallele Arbeit).
 const arg=k=>(process.argv.find(a=>a.startsWith('--'+k+'='))||'').slice(k.length+3);
 const only=arg('only').split(',').filter(Boolean),dry=process.argv.includes('--dry'),wantSheet=dry||process.argv.includes('--sheet');
 const models=await loadModels({tolerant:dry||only.length>0}),ids=Object.keys(models).filter(id=>!only.length||only.includes(id)).sort();
 for(const id of only)if(!models[id])console.log('! kein Modell für',id);
 const cat=existsSync(CATALOG)?JSON.parse(readFileSync(CATALOG,'utf8')):{format:'kit-v1',pxPerUnit:PX,source:'sprite-forge',sprites:{}};
 if(!dry)mkdirSync(OUT,{recursive:true});
 const done=[];
 for(const id of ids){const t0=Date.now(),m=models[id],r=renderModel(id,m),file='kit-'+id+'.png';
  if(!dry){writeFileSync(OUT+file,encodePng(r.sheet));
   cat.sprites[id]={file,width:r.frameWidth,height:r.height,...(r.tile?{tile:r.tile}:{}),...(r.cap!=null?{cap:r.cap}:{}),...(r.frames>1?{frames:r.frames,fps:m.fps||8}:{}),...(m.meta||{})};}
  done.push({id,...r});console.log(`✓ ${id} ${r.frameWidth}×${r.height}${r.frames>1?' ×'+r.frames:''} (${Date.now()-t0} ms)`);}
 if(!dry){if(!only.length)for(const id of Object.keys(cat.sprites))if(!models[id]){delete cat.sprites[id];console.log('- entfernt (kein Modell mehr):',id);}
  cat.sprites=Object.fromEntries(Object.entries(cat.sprites).sort(([a],[b])=>a<b?-1:1));writeFileSync(CATALOG,JSON.stringify(cat,null,1)+'\n');}
 const name=arg('name')||(only.length?only.join('-').slice(0,60):'alle');
 if(wantSheet&&done.length){mkdirSync(REVIEW,{recursive:true});const f=REVIEW+'kontakt-'+name+'.png';writeFileSync(f,encodePng(contactSheet(done)));console.log('Kontaktbogen:',f);}
}
