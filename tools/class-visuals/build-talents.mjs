import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
import {CLASS_SPECS,TALENT_ROWS,TALENT_CELLS} from '../../content/talents.js';
import {E32_SKILL_MOTIFS} from '../../e32-art.js';
const root=new URL('../../',import.meta.url),base='assets/content-art/e32/',hash=b=>createHash('sha256').update(b).digest('hex');
// E-32-Klassen: ihre Kniff-Motive (E32_SKILL_MOTIFS, skills.png) und ihre Raster sind Pflicht.
const E32_CLASSES=['dieter','baerbel','kevin'];
/** Gemaltes 6×5-Talentraster einer Spezialisierung (Imagegen-Original). */
export const talentSheetPath=spec=>base+'sources/'+spec+'-v1.png';
/** Gemaltes Einzel-Icon, das die Rasterzelle eines Talents ersetzt (E-72: Talent getauscht, Rasterbild falsch). */
export const talentOverridePath=id=>base+'sources/einzeln/'+id+'-v1.png';
const fsExists=p=>existsSync(new URL(p,root)),fsRead=p=>readFileSync(new URL(p,root));
const hardAlpha=im=>{for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]>=128?255:0;return im;};
const unusable=b=>b.w<10||b.h<10||b.x<2||b.y<2||b.x+b.w>62||b.y+b.h>62;
// Find transparent gutters near the prompted grid, rather than assuming exact cell borders.
function cuts(im,axis,count){const length=axis==='x'?im.width:im.height,other=axis==='x'?im.height:im.width,values=new Uint32Array(length);for(let a=0;a<length;a++)for(let b=0;b<other;b++){const x=axis==='x'?a:b,y=axis==='x'?b:a;if(im.data[(y*im.width+x)*4+3]>=128)values[a]++;}const result=[0];for(let n=1;n<count;n++){const center=length*n/count,reach=length/count*.14;let best=Math.round(center),score=Infinity;for(let a=Math.round(center-reach);a<=center+reach;a++){const cost=values[a]+Math.abs(a-center)*.03;if(cost<score){score=cost;best=a;}}result.push(best);}return [...result,length];}
function sheetCells(im){const xs=cuts(im,'x',6),ys=cuts(im,'y',5);return {xs,ys,cells:Array.from({length:30},(_,i)=>({x:xs[i%6],y:ys[Math.floor(i/6)],w:xs[i%6+1]-xs[i%6],h:ys[Math.floor(i/6)+1]-ys[Math.floor(i/6)]}))};}
function crop(im,sourceRect,scale){const frame=surface(64,64),at={x:Math.round((64-sourceRect.w*scale)/2),y:Math.round((64-sourceRect.h*scale)/2)};resample(im,frame,sourceRect,at,scale);return {frame,b:bounds(frame)};}
/** Ein gemaltes Raster in 30 Talentzellen zerlegen (wirft bei unbrauchbarer Zelle). */
function cutSheet(im,label){
 const {xs,ys,cells}=sheetCells(im),scale=56/Math.max(...cells.flatMap(b=>[b.w,b.h]));
 return {xs,ys,frames:cells.map((sourceRect,i)=>{const {frame,b}=crop(im,sourceRect,scale);if(unusable(b))throw Error('Unusable talent crop '+label+'-'+i);return {frame,b,sourceRect};})};
}
// Einzelbild: Motiv auf die typische Motivgröße seines Rasters bringen (Median der 30 Zellen), damit es zwischen den Nachbarn nicht auffällt.
// Vereinzelte Sprenkel weit draußen (Imagegen-Staub) sollen das Motiv nicht verkleinern: je Seite höchstens 0,5 % der Deckpixel abschneiden.
function motifBounds(im){const cols=new Uint32Array(im.width),rows=new Uint32Array(im.height);let total=0;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(im.data[(y*im.width+x)*4+3]>=128){cols[x]++;rows[y]++;total++;}if(!total)throw Error('Empty sprite cell');const cut=total*.005,trim=a=>{let lo=0,hi=a.length-1,s=0;while(s+a[lo]<=cut)s+=a[lo++];s=0;while(s+a[hi]<=cut)s+=a[hi--];return [lo,hi];},[x0,x1]=trim(cols),[y0,y1]=trim(rows);return {x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
function cutSingle(im,size,label){const motif=motifBounds(im),{frame,b}=crop(im,motif,size/Math.max(motif.w,motif.h));if(unusable(b))throw Error('Unusable talent icon '+label);return {frame,b,sourceRect:motif};}
const medianSize=frames=>{const s=frames.map(f=>Math.max(f.b.w,f.b.h)).sort((a,b)=>a-b);return s[Math.floor(s.length/2)];};
const problemOf=e=>String(e?.message||e);
/** Prüft ein frisch gemaltes Talentraster, ohne etwas zu schreiben: [] = brauchbar, sonst Gründe. */
export function checkTalentSheet(bytes){
 try{const im=hardAlpha(decodePng(bytes)),ratio=im.width/im.height,problems=[];let clear=0;for(let i=3;i<im.data.length;i+=4)if(!im.data[i])clear++;
  if(ratio<1.05||ratio>1.4)problems.push('Seitenverhältnis '+ratio.toFixed(2)+' statt 6:5');
  if(clear/(im.width*im.height)<.3)problems.push('kaum durchsichtiger Grund ('+Math.round(clear/(im.width*im.height)*100)+' %) – Hintergrund gemalt?');
  if(!problems.length)cutSheet(im,'sheet');return problems;}catch(e){return [problemOf(e)];}
}
/** Prüft ein frisch gemaltes Einzel-Icon (freigestellt, Motiv nicht am Rand). */
export function checkTalentIcon(bytes){
 try{const im=hardAlpha(decodePng(bytes)),b=motifBounds(im),problems=[];let clear=0;for(let i=3;i<im.data.length;i+=4)if(!im.data[i])clear++;
  if(clear/(im.width*im.height)<.3)problems.push('kaum durchsichtiger Grund – Hintergrund gemalt?');
  if(b.x<2||b.y<2||b.x+b.w>im.width-2||b.y+b.h>im.height-2)problems.push('Motiv stößt an den Bildrand');
  if(!problems.length)cutSingle(im,44,'icon');return problems;}catch(e){return [problemOf(e)];}
}
/** Talentatlanten + Katalog. Klassen ohne gemaltes Raster fehlen im Katalog: das Spiel zeichnet dann ihr Ersatz-Icon
 *  (talent-art.js paintVocabTalent); gemalt geht immer vor gezeichnet, weil paintE32Talent zuerst fragt.
 *  exists/read nur für Tests (andere Quellen unterschieben). */
export function buildTalentArt({exists=fsExists,read=fsRead}={}){
 const files=new Map(),catalog={version:1,density:4,talents:{},sources:[],atlases:{}},sheets=new Map(),cut=new Map(),overrides=new Map();
 const members=Object.entries(CLASS_SPECS).map(([member,specs])=>({member,specs,painted:specs.filter(spec=>exists(talentSheetPath(spec)))}));
 for(const {member,specs,painted} of members)if(E32_CLASSES.includes(member)&&painted.length<specs.length)throw Error('E-32-Raster fehlt: '+specs.filter(s=>!painted.includes(s)).join(', '));
 // Reihenfolge zählt: precisionColor merkt sich je Farbton die erste Palettenfarbe (Cache über den ganzen Lauf). Darum erst die
 // E-32-Raster und ihre Kniff-Motive in der alten Reihenfolge, dann neue Klassen, zuletzt Einzelbilder – so bleibt alles
 // Vorhandene byte-gleich, wenn Neues dazukommt (tests/e72-bilder.test.mjs prüft das in einem frischen Prozess).
 const cutSpec=spec=>{const source=talentSheetPath(spec),bytes=read(source);cut.set(spec,{source,bytes,...cutSheet(hardAlpha(decodePng(bytes)),spec)});};
 for(const {member,painted} of members)if(E32_CLASSES.includes(member))painted.forEach(cutSpec);
 for(const [spec,c] of cut)c.frames.forEach((f,i)=>sheets.set(spec+'-'+i,f.frame));
 // Kniff-Motive der E-32-Klassen (skills.png) kommen immer aus dem Raster bzw. der Signatur, nie aus einem Einzelbild.
 const signatures=JSON.parse(read('assets/class-visuals/runtime/catalog.json')),precision=JSON.parse(read('assets/precision/runtime/catalog.json')),icons=decodePng(read('assets/class-visuals/runtime/icons.png')),skillAtlas=surface(240,432),skillPath=base+'runtime/skills.png',skills={};
 for(const [row,spec]of Object.keys(TALENT_ROWS).filter(s=>E32_CLASSES.includes(s.split('-')[0])).entries())for(const [col,slot]of ['mark','burst','ground','buff','variant'].entries()){
  const id=E32_SKILL_MOTIFS[spec][slot],member=spec.split('-')[0];let source;
  if(id?.startsWith('signature:')){const a=signatures.icons[id.slice(10)];source=surface(64,64);blit(icons,source,{x:a.x,y:a.y,w:64,h:64},{x:0,y:0});}
  else if(id)source=sheets.get(id);
  else{const a=precision.assets['skill-'+member+'-'+slot];if(!a)throw Error('Missing base skill '+member+'/'+slot);source=decodePng(read(a.path));}
  const frame=surface(48,48);resample(source,frame,{x:0,y:0,w:source.width,h:source.height},{x:0,y:0},48/source.width);blit(frame,skillAtlas,{x:0,y:0,w:48,h:48},{x:col*48,y:row*48});skills[spec+'/'+slot]={atlas:skillPath,x:col*48,y:row*48,cell:48,motif:id||'skill-'+member+'-'+slot,sha256:hash(frame.data)};
 }
 for(const {member,painted} of members)if(!E32_CLASSES.includes(member))painted.forEach(cutSpec);
 for(const [spec,c] of cut){const size=medianSize(c.frames);for(let i=0;i<c.frames.length;i++){const id=spec+'-'+i,source=talentOverridePath(id);if(!exists(source))continue;const bytes=read(source);overrides.set(id,{source,bytes,...cutSingle(hardAlpha(decodePng(bytes)),size,id)});}}
 for(const {member,specs,painted} of members){
  if(!painted.length)continue;
  const atlas=surface(640,576),path=base+'runtime/talents-'+member+'.png';
  for(const [specIndex,spec] of specs.entries()){
   if(!painted.includes(spec))continue;
   const {source,bytes,xs,ys,frames}=cut.get(spec);catalog.sources.push({source,sha256:hash(bytes),x:xs,y:ys});
   for(const [i,t] of TALENT_ROWS[spec].entries()){
    const id=spec+'-'+i,cell=TALENT_CELLS[spec][i],x=cell.row*64,y=(specIndex*3+cell.path)*64,o=overrides.get(id),{frame,b,sourceRect}=o||frames[i];
    if(o)catalog.sources.push({source:o.source,sha256:hash(o.bytes),talent:id});
    blit(frame,atlas,{x:0,y:0,w:64,h:64},{x,y});sheets.set(id,frame);
    catalog.talents[id]={atlas:path,x,y,cell:64,name:t.name,effect:t.info.effect,spec,...cell,source:o?o.source:source,...(o?{sheet:source}:{}),sourceRect,bounds:b,sha256:hash(frame.data)};
   }
  }
  const atlasBytes=encodePng(atlas);files.set(path,atlasBytes);catalog.atlases[path]={sha256:hash(atlasBytes)};
 }
 catalog.skills=skills;
 const skillBytes=encodePng(skillAtlas);files.set(skillPath,skillBytes);catalog.atlases[skillPath]={sha256:hash(skillBytes)};
 files.set(base+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));
 return {files,catalog,sheets};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {files,catalog}=buildTalentArt();for(const [p,b]of files){mkdirSync(new URL('.',new URL(p,root)),{recursive:true});writeFileSync(new URL(p,root),b);}const pending=Object.values(CLASS_SPECS).flat().filter(s=>!fsExists(talentSheetPath(s)));console.log(Object.keys(catalog.talents).length+' talent icons exported.'+(pending.length?' Noch ohne gemaltes Raster (Ersatz-Icon im Spiel): '+pending.join(', '):''));}
