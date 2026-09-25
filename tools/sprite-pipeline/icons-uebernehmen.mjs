// Einbauweg für neu gemalte 64er-Symbole (Icon-Runde 2026-09-25). Die Maler legen je Gruppe fertige Bilder unter
//   D:/Dev/_prototypen/icons-2026-09-25/<gruppe>/ids/<kennung>.png
// ab (Palette = Waffenkammer-Palette waffen-palette.json, Export 1:1). Dieses Skript
//  1. prüft jedes Bild: 64×64, Alpha nur 0/255, jede deckende Farbe aus waffen-palette.json, Kennung bekannt,
//  2. kopiert es byte-gleich nach assets/precision/sources/2026-09-25/icons/<kennung>.png,
//  3. trägt es in tools/sprite-pipeline/icons-20260925-jobs.json ein (kind items, padding 0, palette waffen, painter-Verweis),
//  4. baut den Präzisionskatalog neu (build-precision.mjs) und den Offline-Cache (scripts/pwa-cache.mjs).
// Die Kennung ist die Gegenstandskennung (content/items.js); gear-blade/gear-club u. a. ersetzen die gleichnamigen Familienbilder.
// Ein neu gemaltes Bild gewinnt immer: über ältere Aufträge derselben Kennung (precision-september.mjs) und über Zwilling-Aliase
// (items-20260925.mjs). Bereits übernommene Kennungen bleiben im Auftragsbogen, auch wenn der Gruppenordner sie nicht mehr enthält.
// Aufruf: node tools/sprite-pipeline/icons-uebernehmen.mjs [--quelle <ordner>] [--gruppe <name>] [--ohne-build] [--trocken]
import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {basename,join} from 'node:path';
import {decodePng} from './png.mjs';
import {ITEM_CATALOG,ICONS} from '../../content/index.js';
const root=new URL('../../',import.meta.url),JOBS=new URL('./icons-20260925-jobs.json',import.meta.url),TARGET='assets/precision/sources/2026-09-25/icons/';
const PALETTE=new Set(JSON.parse(readFileSync(new URL('./waffen-palette.json',import.meta.url))).map(p=>p.join(',')));
const HILFSSKRIPTE=/^(maler\d*|messen|analyse|zeige|vorschau|lib|pruefen|werkzeug)\.mjs$/;

/** Bekannte Kennung: Gegenstand aus dem Katalog, gear-Familienbild oder Symbolwort mit eigenem Präzisionsbild. */
export function knownId(id,catalog){
 if(ITEM_CATALOG[id])return 'gegenstand';
 if(/^gear-[a-z]+$/.test(id)&&catalog.assets[id])return 'familie';
 if(ICONS.includes(id)&&catalog.assets[id])return 'symbolwort';
 return null;
}
/** Prüft ein Malerbild; gibt die Liste der Verstöße zurück (leer = in Ordnung). */
export function checkIcon(im){
 const bad=[];if(im.width!==64||im.height!==64)bad.push('Größe '+im.width+'×'+im.height+' statt 64×64');
 let opaque=0,alpha=0;const foreign=new Set();
 for(let i=0;i<im.data.length;i+=4){const a=im.data[i+3];if(a!==0&&a!==255)alpha++;if(!a)continue;opaque++;const k=im.data[i]+','+im.data[i+1]+','+im.data[i+2];if(!PALETTE.has(k))foreign.add(k);}
 if(alpha)bad.push(alpha+' halbtransparente Pixel');if(!opaque)bad.push('leer');
 if(foreign.size)bad.push(foreign.size+' Farben außerhalb der Waffen-Palette (z. B. '+[...foreign].slice(0,3).map(k=>'rgb('+k+')').join(', ')+')');
 return bad;
}
const painterOf=dir=>{const own=readdirSync(dir).filter(f=>f.endsWith('.mjs'));const main=own.find(f=>f===basename(dir)+'.mjs')||own.find(f=>!HILFSSKRIPTE.test(f))||own.find(f=>/^maler/.test(f))||'';return main?join(dir,main).replace(/\\/g,'/'):dir.replace(/\\/g,'/');};

export function uebernehmen({quelle='D:/Dev/_prototypen/icons-2026-09-25',gruppe=null,trocken=false}={}){
 const catalog=JSON.parse(readFileSync(new URL('assets/precision/runtime/catalog.json',root)));
 const jobs=new Map(JSON.parse(readFileSync(JOBS)).map(j=>[j.id,j])),seen=new Map(),taken=[],rejected=[];
 const groups=existsSync(quelle)?readdirSync(quelle,{withFileTypes:true}).filter(d=>d.isDirectory()&&(!gruppe||d.name===gruppe)&&existsSync(join(quelle,d.name,'ids'))).map(d=>d.name).sort():[];
 for(const g of groups){const dir=join(quelle,g),ids=join(dir,'ids'),painter=painterOf(dir);
  for(const file of readdirSync(ids).filter(f=>f.endsWith('.png')).sort()){const id=file.slice(0,-4),path=join(ids,file);
   if(seen.has(id)){rejected.push({id,gruppe:g,grund:'doppelt (auch in '+seen.get(id)+')'});continue;}seen.set(id,g);
   const art=knownId(id,catalog);if(!art){rejected.push({id,gruppe:g,grund:'unbekannte Kennung'});continue;}
   let bad;try{bad=checkIcon(decodePng(readFileSync(path)));}catch(e){bad=['kein lesbares PNG: '+e.message];}
   if(bad.length){rejected.push({id,gruppe:g,grund:bad.join('; ')});continue;}
   const item=ITEM_CATALOG[id],output=TARGET+id+'.png';
   if(!trocken){mkdirSync(new URL(TARGET,root),{recursive:true});copyFileSync(path,new URL(output,root));}
   jobs.set(id,{id,output,width:64,height:64,padding:0,kind:'items',palette:'waffen',delivery:'2026-09-25',date:'2026-09-25',
    tool:'Pixelmaler (Code, kein Imagegen)',painter:painter+' · '+id,gruppe:g,
    motif:item?item.name+(item.look?': '+item.look:''):art==='familie'?'Familienbild '+id.slice(5)+' (ersetzt das gleichnamige gear-Bild)':'Symbolwort '+id});
   taken.push({id,gruppe:g,art});
  }
 }
 const list=[...jobs.values()].sort((a,b)=>(a.gruppe||'').localeCompare(b.gruppe||'')||a.id.localeCompare(b.id));
 if(!trocken)writeFileSync(JOBS,JSON.stringify(list,null,2)+'\n');
 return {groups,taken,rejected,total:list.length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:undefined;},flag=n=>process.argv.includes(n);
 const r=uebernehmen({quelle:arg('--quelle'),gruppe:arg('--gruppe'),trocken:flag('--trocken')});
 console.log('Gruppen: '+(r.groups.join(', ')||'keine'));
 for(const t of r.taken)console.log('  übernommen  '+t.gruppe.padEnd(12)+t.id+(t.art==='gegenstand'?'':' ('+t.art+')'));
 for(const x of r.rejected)console.log('  ABGELEHNT   '+x.gruppe.padEnd(12)+x.id+': '+x.grund);
 console.log(r.taken.length+' übernommen, '+r.rejected.length+' abgelehnt, '+r.total+' im Auftragsbogen');
 if(!flag('--ohne-build')&&!flag('--trocken')){
  for(const cmd of [['tools/sprite-pipeline/build-precision.mjs'],['scripts/pwa-cache.mjs']]){const p=spawnSync(process.execPath,cmd,{cwd:fileURLToPath(root),stdio:'inherit'});if(p.status)process.exit(p.status);}
 }
 if(r.rejected.length)process.exitCode=1;
}
