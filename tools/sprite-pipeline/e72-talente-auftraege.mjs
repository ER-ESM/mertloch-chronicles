// E-72 Talentbilder: Auftragsblätter für Imagegen, erzeugt aus dem Inhalt (content/talents/*.js, content/procs/*.js).
// 1) Sechs 6×5-Talentraster für Schorsch und Käthe – gleiches Format und gleicher Prompt-Stil wie die E-32-Raster
//    (assets/content-art/e32/generation.json), Reihenfolge exakt TALENT_ROWS[spec] (Index = Speicherschlüssel).
// 2) Einzel-Icons für alte Talente, deren gemaltes Rasterbild seit E-72 inhaltlich falsch ist (Talent getauscht).
//    build-talents.mjs legt ein vorhandenes Einzelbild über die Zelle des Rasters (Überschreibung im Katalog).
// Aufruf: node tools/sprite-pipeline/e72-talente-auftraege.mjs   → schreibt beide JSON-Blätter neu (nur bei Änderung).
// e72-bilder.mjs ruft dasselbe vor dem Erzeugen auf, damit die Bilder die Talente zum Zeitpunkt des Laufs zeigen.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {CLASS_SPECS,SPECS,TALENT_ROWS,TALENT_CELLS} from '../../content/talents.js';
import {PROC_RULES} from '../../content/procs.js';
import {talentSheetPath,talentOverridePath} from '../class-visuals/build-talents.mjs';

export const SHEET_JOBS='tools/sprite-pipeline/e72-talente-jobs.json';
export const SINGLE_JOBS='tools/sprite-pipeline/e72-talente-einzeln-jobs.json';
export const NEW_CLASSES=['schorsch','kaethe'];
export const DELIVERY='2026-09-26';
// Stilvorlage: je Klasse ein fertiges E-32-Raster im Zielformat (nur Stil, nie die Motive).
export const STYLE_REFS={schorsch:'assets/content-art/e32/sources/dieter-brew-v1.png',kaethe:'assets/content-art/e32/sources/baerbel-care-v1.png'};
// Wortgleich der Kopf der neun E-32-Raster (generation.json, 19.09.2026).
export const E32_HEAD='Mertloch Chronicles premium detailed comic pixel art inventory icons, warm kraft copper highlights and dark petrol shadows, rich engraved materials, consistent light upper left. True transparent RGBA background. No checkerboard painted in. No words, letters, numbers, labels, borders, cell frames or grid lines. Every icon has a bold individual silhouette legible at 64px, detailed like our reference. Exactly 6 columns by 5 rows, 1536x1280 total, evenly spaced cell centers. Each icon fully isolated in its cell with 15% empty margins. Exactly 30 icons. Do not repeat the same silhouette: show the gameplay interaction using one dominant recognizable object and at most two secondary signs. The reference is style only. Read the German names and gameplay effects below to design their visual meaning. ';
export const CLASS_CONTEXT={
 dieter:'Class: Dosen-Dieter, a burly village pub brawler who tanks with his fists and a bottle-cap ladle; his rage is called Randale, and damage he takes is written on his bar tab (Zeche: a long cream cash receipt with pencil tally marks, paid off with coins or skipped by slamming the counter).',
 baerbel:'Class: Aperol-Anni, a 34-year-old country-house influencer and healer (Aperol spritz, cleaning brush, jam jars, goose Gisela, smartphone on a ring light); her resource is Likes (pink hearts and thumbs-up) and her Trend (a badge with five hearts, going viral, brown shitstorm clouds).',
 kevin:'Class: Klo-Kevin, a tinkerer who fires empty green deposit bottles; his resource is a beer crate of twelve bottles, refilled at a bottle-deposit machine that prints golden deposit tickets (Pfandbon); his tin-can robot is called Dosen-Robbi.',
 schorsch:'Class: Schwenker-Schorsch, a burly 52-year-old grill master of a German village grill hut (apron, long grill tongs, a swing grill hanging from a tripod chain over charcoal, bratwurst, pork neck steak, grilled halloumi, corn cob, mustard squeeze bottle, beer bottle for dousing the embers, bellows, grill lid used as a shield). His resource is the glowing ember heat (Glut) and the grill grate where food cooks to a golden point.',
 kaethe:'Class: Kreuz-Kaethe, a 71-year-old pub card player (Skat) in a plum knitted cardigan with reading glasses on a chain, French-suited playing cards (clubs, spades, hearts, diamonds), a Skat score pad with pencil tally marks, eggnog in a small stemmed glass, knitting needles and wool. Vary the objects: not every icon may be a playing card.'
};
const NO_TEXT='Where a motif hint mentions writing, a slogan, a number or an exclamation, suggest it with scribbles or symbols only, never readable letters or digits.';

const talent=(spec,i)=>TALENT_ROWS[spec][i];
/** Proc-Looks eines Talents (content/procs/*.js look), in Reihenfolge der Effekte. */
export function talentLooks(t){return Object.keys(t.effects||{}).filter(k=>k.startsWith('proc:')).map(k=>PROC_RULES[k.slice(5)]?.look).filter(Boolean);}
function entryLine(t,n){const look=talentLooks(t);return `${n}. ${t.name}: ${t.info.effect}`+(look.length?` Motiv: ${look.join(' / ')}.`:'');}

/** Die sechs Talentraster (je 30 Zellen, 6×5, zeilenweise in TALENT_ROWS-Reihenfolge). */
export function sheetJobs(){
 const jobs=[];
 for(const member of NEW_CLASSES)for(const spec of CLASS_SPECS[member]||[]){
  const list=TALENT_ROWS[spec],s=SPECS[spec];
  const prompt=E32_HEAD+CLASS_CONTEXT[member]+` This sheet is ${spec} (${s.name}, ${s.role}): ${s.text} `+NO_TEXT+
   ' In strict row-major order (left to right, top to bottom):\n'+list.map((t,i)=>entryLine(t,i+1)).join('\n');
  jobs.push({id:'talente-'+spec,spec,output:talentSheetPath(spec),width:1536,height:1280,kind:'talent-sheet',grid:{columns:6,rows:5},
   prompt,references:[STYLE_REFS[member]],delivery:DELIVERY,
   entries:list.map((t,i)=>({id:spec+'-'+i,name:t.name,effect:t.info.effect,...(talentLooks(t).length?{look:talentLooks(t).join(' / ')}:{}),row:TALENT_CELLS[spec][i].row,path:TALENT_CELLS[spec][i].path}))});
 }
 return jobs;
}

// Alte Talente, deren E-32-Bild seit E-72 das getauschte Vorgänger-Talent zeigt (Liste und Urteil: docs/e72-runde3/bilder.md).
// was = Motiv des alten Bildes, das nicht wieder auftauchen darf; motif = neues Motiv (Proc-Look, wo vorhanden, ist eingearbeitet).
export const SINGLES=[
 {id:'dieter-wall-12',was:'Kronkorken-Panzer (a chainmail shirt of bottle caps)',motif:'a round cardboard beer mat covered in pencil tally marks with an extra-long curling cream cash receipt hanging from it on a wooden bar counter, a small upward arrow for a bigger tab',avoid:'no armour, no chainmail shirt, no bottle caps'},
 {id:'dieter-wall-26',was:'Hausbier-Nachschub (a beer mug with a flame swirl)',motif:'a torn cream cash receipt bursting apart into a bold golden shockwave ring with coins flying outward, a pub swing door flung open behind it',avoid:'no beer mug, no flames'},
 {id:'dieter-brawl-25',was:'Anlauf nehmen (a dashing boot)',motif:'a torn cash receipt in front of a knocked-over wooden beer-tent table, a small golden circular arrow meaning the smash is instantly ready again',avoid:'no boot, no running figure, no dash trail'},
 {id:'dieter-brew-2',was:'Nichts wegkippen (beer pouring onto a shield)',motif:'a tall foaming wheat-beer glass standing on a long cash receipt whose pencil tally marks are crossed out and washed away by the spilling foam, a small green plus',avoid:'no shield, no second mug'},
 {id:'baerbel-care-15',was:'Freilaufgans (a goose in a green circle)',motif:'a thick fluffy sheepskin fur stole shrugging off a small brown storm cloud that rains brown splats, a pink heart badge underneath stays intact and glowing',avoid:'no goose, no circle on the ground'},
 {id:'baerbel-care-17',was:'Schrubben heilt (a scrub brush with a plus)',motif:'three loyal fans as dark silhouettes on a small wooden bench raising glowing pink hearts toward a smartphone on a ring light, the first of five small heart pips already lit',avoid:'no scrub brush, no sword'},
 {id:'baerbel-stage-21',was:'Like-Welle (a four-leaf clover with coins)',motif:'a brass megaphone blasting a rising wave of pink hearts and thumbs-up signs, one bold upward arrow for the rising trend',avoid:'no four-leaf clover, no coins'},
 {id:'kevin-fuse-25',was:'Warmlaufen (a burning gear with an hourglass)',motif:'a golden paper deposit ticket with a red stamp crackling with blue-white lightning, three more tickets fanned behind it',avoid:'no gear, no hourglass, no flames'},
 {id:'kevin-iron-11',was:'Weiter Bremsweg (the robot in a frost circle with ghostly enemies)',motif:'Dosen-Robbi, the small robot built from tin cans (drawn like in the reference sheet), standing in a faint ring on the ground and pulling empty green deposit bottles into a beer crate with a magnet claw',avoid:'no frost swirl, no ghostly enemies'},
 {id:'kevin-iron-23',was:'Zusatzladung (the robot exploding)',motif:'a tin bottle crate filled with twelve shiny green bottles, a golden deposit ticket with a red stamp lying on top, a small bright spark meaning the next overload is free',avoid:'no explosion as the main object, no robot'},
 {id:'kevin-hunt-25',was:'Gewinnausschüttung (a skull with a heart and coins)',motif:'a shower of glittering intact green deposit bottles raining down and landing upright around a knocked-over enemy cap, small sparkles where they land',avoid:'no skull, no heart, no coins'}
];

/** Einzel-Icons (64×64 im Spiel) als Ersatz für eine Rasterzelle; Stilvorlage = das Raster derselben Spezialisierung. */
export function singleJobs(){
 return SINGLES.map(({id,was,motif,avoid})=>{
  // Der Proc-Look (falls vorhanden) steckt schon in motif, darum hier nicht noch einmal.
  const cut=id.lastIndexOf('-'),spec=id.slice(0,cut),i=Number(id.slice(cut+1)),t=talent(spec,i),member=spec.split('-')[0];
  const prompt='Mertloch Chronicles premium detailed comic pixel art inventory icon, warm kraft copper highlights and dark petrol shadows, rich engraved materials, consistent light upper left. True transparent RGBA background. No checkerboard painted in. No words, letters, numbers, labels, borders, frames or grid lines. '+
   'Exactly ONE single icon centered on a square canvas with 15% empty margins on every side; not a sheet, not a grid, not a tile. Bold individual silhouette legible at 64px, detailed like our reference. Show the gameplay interaction using one dominant recognizable object and at most two secondary signs. '+
   `The reference is a finished talent icon sheet of the same skill tree (${spec}): match its rendering, ink outline, palette, lighting and icon size exactly so the new icon sits seamlessly among them, but do not copy any of its motifs. `+
   CLASS_CONTEXT[member]+' '+NO_TEXT+` Talent (German name and gameplay effect): ${t.name}: ${t.info.effect}`+
   ` Motif: ${motif}. It replaces an older picture of a different talent, ${was}, so ${avoid}.`;
  return {id:'talent-'+id,talent:id,spec,index:i,name:t.name,effect:t.info.effect,replaces:was,output:talentOverridePath(id),width:64,height:64,kind:'talent-icon',
   prompt,references:[talentSheetPath(spec)],delivery:DELIVERY};
 });
}

const root=new URL('../../',import.meta.url);
/** Beide Blätter aus dem aktuellen Inhalt neu schreiben; liefert, welche Datei sich geändert hat. write:false = nur vergleichen. */
export function refreshJobSheets({write=true}={}){
 const changed=[];
 for(const [path,jobs] of [[SHEET_JOBS,sheetJobs()],[SINGLE_JOBS,singleJobs()]]){
  const text=JSON.stringify(jobs,null,1)+'\n',file=new URL(path,root),old=existsSync(file)?readFileSync(file,'utf8'):null;
  if(old!==text){changed.push(path);if(write)writeFileSync(file,text);}
 }
 return changed;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const changed=refreshJobSheets();
 console.log(changed.length?'Neu geschrieben: '+changed.join(', '):'Auftragsblätter sind aktuell.');
 console.log(`${sheetJobs().length} Talentraster, ${singleJobs().length} Einzel-Icons.`);
}
