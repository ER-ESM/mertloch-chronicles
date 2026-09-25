// Graphics handoff 2026-09-23: export directly from preserved imagegen originals.
import {readFileSync,existsSync} from 'node:fs';
import {surface,bounds} from './png.mjs';
import {resample} from './precision-resample.mjs';
import {inkFrame} from '../../ability-tile.js';
// Both sheets of the day: props/intro/ui first, then the 22 inventory and tab icons.
// 2026-09-24: NPC-Gesprächsporträts (eigene Brustbilder, 128 px). palette:'portraet' = PRECISION_PALETTE + Farben der Anziehpuppe,
// eingefroren in portraet-palette.json, damit Porträt und Figur dieselben Kleidungsfarben tragen (Lila, Mint, Hellblau, Gelb).
// 2026-09-25 (E-72): Kniff-Icons der Klassen-Ressourcen, 64 × 64 randlos wie alle Kniffe (Kachel bis an den Rand, 1 px Tintenrahmen
// erzwingt der Export für kind 'skills' ohne Rand, damit auch Imagegen-Ersatz ihn trägt). Die Originale unter
// assets/precision/sources/2026-09-25/e71-kniffe/ zeichnet vorerst e71-kniffe-draw.mjs (Herkunft: herkunft.json daneben);
// ein späterer Imagegen-Lauf mit demselben Auftragsblatt (--force) ersetzt sie an Ort und Stelle.
// 2026-09-25: acht Waffensymbole (64 px), fertig gemalt vom Pixelmaler der Waffenkammer. palette:'waffen' = Porträtpalette + dessen
// Materialtreppen und Kontur, eingefroren in waffen-palette.json; Export 1:1 ohne Rand, jedes Pixel bleibt, wie es gemalt ist.
// 2026-09-25 (Icon-Review R0): Freistellungen aus dem semantischen Atlas (freistellen.mjs, 64 px, Export 1:1) und die neu gemalten
// 64er-Symbole der Maler (icons-uebernehmen.mjs, palette:'waffen', Export 1:1). Spätere Aufträge gewinnen: trägt ein Bogen weiter unten
// dieselbe Kennung (z. B. sigizange neu gemalt), fällt der ältere Auftrag beim Export weg; seine Quelle bleibt als Herkunft liegen.
const jobs=[...new Map(['./grafik-20260923-jobs.json','./items-20260923-jobs.json','./einzelfenster-20260923-jobs.json','./portraets-20260924-jobs.json','./e71-kniffe-jobs.json','./waffen-20260925-jobs.json','./freigestellt-20260925-jobs.json','./icons-20260925-jobs.json']
 .flatMap(p=>JSON.parse(readFileSync(new URL(p,import.meta.url)))).map(j=>[j.id,j])).values()];
// 2026-09-26 (Codex-Lauf Sa 23:00, docs/ICONS-CODEX-2026-09-26.md): Spez-Symbole Schorsch/Käthe und die vier vereinfachten
// Dieter-Kniffe. Sie gelten erst, wenn ihr Original vorliegt; bis dahin bleibt der bisherige Export. Danach gewinnt dieser
// Auftrag, weil er nach der älteren Quelle exportiert wird (put überschreibt Katalogeintrag und Laufzeitbild derselben ID).
jobs.push(...['./spez-symbole-20260926-jobs.json','./kniffe-dicht-20260926-jobs.json'].flatMap(p=>JSON.parse(readFileSync(new URL(p,import.meta.url))))
 .filter(j=>existsSync(new URL('../../'+j.output,import.meta.url))));
const PALETTES=Object.fromEntries(['portraet','waffen'].map(name=>[name,JSON.parse(readFileSync(new URL('./'+name+'-palette.json',import.meta.url)))]));
export function buildSeptemberDelivery({catalog,put,read,hashSource}){
 for(const job of jobs){
  const {id,output:source,width,height,kind,padding=0,worldProp,tileSize}=job;
  const im=read(source),out=surface(width,height);
  let b=padding?bounds(im):{x:0,y:0,w:im.width,h:im.height};
  // Opaque film stills use a centered 16:9 crop; sprites keep their silhouette.
  if(kind==='intro'){
   const ratio=width/height;
   if(b.w/b.h>ratio){const w=Math.floor(b.h*ratio);b={...b,x:Math.floor((b.w-w)/2),w};}
   else{const h=Math.floor(b.w/ratio);b={...b,y:Math.floor((b.h-h)/2),h};}
  }
  const scale=Math.min((width-padding*2)/b.w,(height-padding*2)/b.h);
  const x=Math.floor((width-Math.round(b.w*scale))/2),h=Math.round(b.h*scale);
  if(job.palette&&!PALETTES[job.palette])throw Error(id+': unbekannte Palette '+job.palette);
  resample(im,out,b,{x,y:worldProp?height-padding-h:Math.floor((height-h)/2)},scale,job.palette?{palette:PALETTES[job.palette]}:undefined);
  if(kind==='skills'&&!padding)inkFrame(out);
  put(id,out,{kind,source,sourceHash:hashSource(source),padding,...(job.palette?{palette:job.palette}:{}),
   ...(worldProp?{worldProp,pivot:{x:width/2,y:height-padding}}:{}),...(tileSize?{tileSize}:{}),delivery:job.delivery||'2026-09-23'});
  if(worldProp)catalog.aliases[worldProp.id]=id;
 }
}
