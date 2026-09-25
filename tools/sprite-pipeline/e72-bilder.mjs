// E-72 Bilder in einem Befehl (nach dem Codex-Kontingent-Reset):   npm run e72:bilder   ·   Plan ohne Imagegen: npm run e72:bilder -- --dry
// Reihenfolge: 1 Talentraster (Schorsch, Käthe) → 2 Einzel-Talente (alte Klassen, Bild seit E-72 falsch) → 3 Kniff-Icons (gemalt statt gezeichnet).
// Nach jedem Block mit Neuem wird eingebaut (build-talents.mjs bzw. sprites:precision + Kontaktbogen), am Ende Precache und npm test.
// Wiederaufnehmbar: Fertiges wird übersprungen (Talent: Quelle vorhanden · Kniff: Original trägt eine Imagegen-Herkunft mit passendem Hash).
// Endet das Kontingent mittendrin, baut der Lauf das bis dahin Erzeugte ein und nennt, was fehlt (Exit 3). Anleitung: docs/e72-runde3/bilder.md
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {decodePng,bounds} from './png.mjs';
import {runJobs} from './imagegen.mjs';
import {SHEET_JOBS,SINGLE_JOBS,sheetJobs,singleJobs,refreshJobSheets} from './e72-talente-auftraege.mjs';
import {checkTalentSheet,checkTalentIcon} from '../class-visuals/build-talents.mjs';
import {iconPng,PROVENANCE} from './e71-kniffe-draw.mjs';

const root=new URL('../../',import.meta.url);
export const KNIFF_JOBS='tools/sprite-pipeline/e71-kniffe-jobs.json';
export const GENERATION='assets/precision/generation.json';
export const REJECTED='generated/e72-abgelehnt/';
export const QUOTA_RESET='26.09.2026, 21:21';
// Die drei schwächsten Code-Kniffe (docs/GRAFIK-LIEFERUNG-2026-09-25-e71-kniffe.md) zuerst, falls das Kontingent nicht reicht.
export const KNIFF_FIRST=['skill-schorsch-parry','skill-kaethe-dash','skill-kevin-reload'];
const PENDING=new Set(['fehlt','gezeichnet']);
const TALENT_BUILD=[['tools/class-visuals/build-talents.mjs']];
const KNIFF_BUILD=[['tools/sprite-pipeline/build-precision.mjs'],['tools/sprite-pipeline/e71-kniffe-draw.mjs','--kontaktbogen']];

/** Codex meldet ein erschöpftes Abo z. B. mit „You've hit your usage limit … try again at Sep 26th, 2026 9:21 PM“. */
export const isQuotaError=text=>/usage limit|rate.?limit|limit reached|try again (at|in|later)|quota|kontingent|nutzungslimit|too many requests|\b429\b/i.test(String(text||''));
export const quotaHint=text=>String(text||'').match(/try again at ([^.\n]+)/i)?.[1]?.trim()||null;
// Ohne diese Voraussetzung scheitert jeder weitere Auftrag genauso – sofort aufhören.
const isFatal=text=>/Kein vollständiger Codex|Referenzbild fehlt|ENOENT/.test(String(text||''));

const fsIO={
 exists:p=>existsSync(new URL(p,root)),
 read:p=>readFileSync(new URL(p,root)),
 json:p=>existsSync(new URL(p,root))?JSON.parse(readFileSync(new URL(p,root),'utf8')):null,
 hash:p=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')
};

/** Plan: drei Blöcke mit Status je Auftrag. sheets liefert die Auftragsblätter (Pfad → Aufträge). */
export function planBlocks({io=fsIO,sheets}={}){
 const jobsOf=p=>sheets?.[p]||io.json(p)||[];
 const records=io.json(GENERATION)?.records||[];
 const painted=out=>records.some(r=>r.output===out&&r.sourceHash===io.hash(out));
 const kniffe=jobsOf(KNIFF_JOBS).slice().sort((a,b)=>(KNIFF_FIRST.includes(b.id)-KNIFF_FIRST.includes(a.id))||(KNIFF_FIRST.indexOf(a.id)-KNIFF_FIRST.indexOf(b.id)));
 const talent=j=>({id:j.id,output:j.output,status:io.exists(j.output)?'vorhanden':'fehlt'});
 return [
  {key:'raster',title:'Talentraster Schorsch/Käthe (6×5, 1536×1280)',sheet:SHEET_JOBS,build:TALENT_BUILD,jobs:jobsOf(SHEET_JOBS).map(talent)},
  {key:'einzeln',title:'Einzel-Talente alter Klassen (ersetzen die Rasterzelle)',sheet:SINGLE_JOBS,build:TALENT_BUILD,jobs:jobsOf(SINGLE_JOBS).map(talent)},
  {key:'kniffe',title:'Kniff-Icons Schorsch/Käthe/Zeche/Pfandautomat (gemalt statt gezeichnet)',sheet:KNIFF_JOBS,build:KNIFF_BUILD,
   jobs:kniffe.map(j=>({id:j.id,output:j.output,status:!io.exists(j.output)?'fehlt':painted(j.output)?'gemalt':'gezeichnet'}))}
 ];
}

/** Der Lauf selbst, mit austauschbaren Schritten (Tests): generate(block,job) · check(block,job) → Probleme ·
 *  reject(block,job,probleme) · accept(block,job) · build(block) → true/false. */
export function runPlan(blocks,{generate,check,reject,accept,build,log=console.log,maxErrors=3}){
 const report={made:[],rejected:[],failed:[],missing:[],quota:null,stopped:null,built:[],buildFailed:null};
 let errors=0;
 for(const [n,block] of blocks.entries()){
  const todo=block.jobs.filter(j=>PENDING.has(j.status));let fresh=0;
  log(`\n${n+1} ${block.title}: ${todo.length} zu erzeugen, ${block.jobs.length-todo.length} fertig`);
  for(const job of todo){
   if(report.stopped){report.missing.push({block:block.key,id:job.id,reason:report.stopped});continue;}
   try{generate(block,job);}
   catch(e){
    const msg=String(e?.message||e);
    if(isQuotaError(msg)){report.quota=quotaHint(msg)||true;report.stopped='Kontingent erschöpft';report.missing.push({block:block.key,id:job.id,reason:report.stopped});log(`  ${job.id}: Kontingent erschöpft – Abbruch`);continue;}
    errors++;report.failed.push({block:block.key,id:job.id,reason:msg.split('\n')[0]});report.missing.push({block:block.key,id:job.id,reason:'Fehler: '+msg.split('\n')[0]});log(`  ${job.id}: FEHLER ${msg.split('\n')[0]}`);
    if(isFatal(msg)||errors>=maxErrors)report.stopped=isFatal(msg)?'Voraussetzung fehlt: '+msg.split('\n')[0]:`${errors} Fehler – Abbruch`;
    continue;
   }
   const problems=check(block,job);
   if(problems.length){reject(block,job,problems);report.rejected.push({block:block.key,id:job.id,problems});report.missing.push({block:block.key,id:job.id,reason:'abgelehnt: '+problems.join('; ')});log(`  ${job.id}: abgelehnt (${problems.join('; ')})`);continue;}
   accept(block,job);fresh++;report.made.push({block:block.key,id:job.id});
  }
  if(fresh){log(`  einbauen: ${block.build.map(a=>'node '+a.join(' ')).join(' && ')}`);if(!build(block)){report.buildFailed=block.key;report.stopped||='Einbau fehlgeschlagen';break;}report.built.push(block.key);}
 }
 return report;
}

// ------------------------------------------------------------------ echte Schritte
const node=args=>spawnSync(process.execPath,args,{cwd:fileURLToPath(root),stdio:'inherit'}).status===0;
function removeRecord(output){const g=fsIO.json(GENERATION);if(!g)return;const before=g.records.length;g.records=g.records.filter(r=>r.output!==output);if(g.records.length!==before)writeFileSync(new URL(GENERATION,root),JSON.stringify(g,null,2)+'\n');}
/** Kniff-Kachel: Motivfläche annähernd quadratisch und deckend (der Export skaliert sie auf 58 × 58). */
export function checkKniffTile(bytes){
 try{const im=decodePng(bytes),b=bounds(im),ratio=b.w/b.h;let solid=0;for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(im.data[(y*im.width+x)*4+3]>=128)solid++;
  const problems=[];if(ratio<.9||ratio>1.1)problems.push('nicht quadratisch ('+ratio.toFixed(2)+')');if(solid/(b.w*b.h)<.9)problems.push('Kachel nicht deckend');return problems;}
 catch(e){return [String(e?.message||e)];}
}
/** Echter Bildschritt: ein Auftrag über imagegen.mjs (schreibt Original + Herkunft in assets/precision/generation.json). */
export const imagegenStep=(block,job)=>{const {done}=runJobs(block.sheet,{only:[job.id],force:job.status==='gezeichnet'});if(!done.includes(job.id))throw Error('Kein Bild übernommen: '+job.id);};
const realSteps={
 generate:imagegenStep,
 check:(block,job)=>{const bytes=fsIO.read(job.output);return block.key==='raster'?checkTalentSheet(bytes):block.key==='einzeln'?checkTalentIcon(bytes):checkKniffTile(bytes);},
 reject:(block,job)=>{
  // Unbrauchbares Original beiseitelegen (Ordner ist git-ignoriert), Herkunft zurücknehmen; ein Kniff bekommt sein Code-Original zurück.
  const dir=new URL(REJECTED,root);mkdirSync(dir,{recursive:true});renameSync(new URL(job.output,root),new URL(job.id+'-'+Date.now()+'.png',dir));
  removeRecord(job.output);if(block.key==='kniffe')writeFileSync(new URL(job.output,root),iconPng(job.id));
 },
 accept:(block,job)=>{
  if(block.key!=='kniffe')return;
  // Das gemalte Original ersetzt das gezeichnete: dessen Code-Herkunft fällt weg (tests/e71-kniffe.test.mjs verlangt genau eine passende Herkunft).
  const prov=fsIO.json(PROVENANCE);if(!prov)return;const before=prov.records.length;prov.records=prov.records.filter(r=>r.output!==job.output);
  if(prov.records.length!==before)writeFileSync(new URL(PROVENANCE,root),JSON.stringify(prov,null,1)+'\n');
 },
 build:block=>block.build.every(args=>node(args))
};

function printPlan(blocks,staleSheets){
 const all=blocks.flatMap(b=>b.jobs),todo=all.filter(j=>PENDING.has(j.status));
 console.log(`E-72 Bilder – Plan (Trockenlauf, kein Imagegen, nichts wird geschrieben)\nKontingent laut Codex wieder frei ab ${QUOTA_RESET}. Allein laufen lassen: imagegen.mjs nimmt das jüngste neue Bild aus ~/.codex/generated_images.`);
 console.log(staleSheets.length?`Auftragsblätter weichen vom Inhalt ab und würden vor dem Lauf neu geschrieben: ${staleSheets.join(', ')}`:'Auftragsblätter entsprechen dem aktuellen Inhalt.');
 for(const [n,b] of blocks.entries()){
  const t=b.jobs.filter(j=>PENDING.has(j.status));
  console.log(`\n${n+1} ${b.title}: ${t.length} von ${b.jobs.length} zu erzeugen`);
  for(const j of b.jobs)console.log(`  ${PENDING.has(j.status)?'+':'='} ${j.id} [${j.status}${j.status==='gezeichnet'?' → wird ersetzt':''}] → ${j.output}`);
  console.log(`  danach, falls neu: ${b.build.map(a=>'node '+a.join(' ')).join(' && ')}`);
 }
 console.log(`\nEnde: node scripts/pwa-cache.mjs && npm test\nSumme: ${todo.length} Bilder (${blocks[0].jobs.filter(j=>PENDING.has(j.status)).length} Raster, ${todo.length-blocks[0].jobs.filter(j=>PENDING.has(j.status)).length} Einzelbilder). Grobe Dauer: ${Math.round(todo.length*1.2)}–${todo.length*2} Minuten.`);
 return todo.length;
}

function printReport(r){
 console.log(`\nErgebnis: ${r.made.length} neu eingebaut, ${r.rejected.length} abgelehnt, ${r.failed.length} Fehler.`);
 if(r.quota)console.log(`Kontingent erschöpft${r.quota===true?'':' – Codex: wieder ab '+r.quota}.`);
 if(r.missing.length){console.log('Es fehlt noch:');for(const m of r.missing)console.log(`  ${m.block}: ${m.id} (${m.reason})`);console.log('Weiter mit demselben Befehl: npm run e72:bilder (Fertiges wird übersprungen).');}
 if(r.rejected.length)console.log(`Abgelehnte Originale liegen unter ${REJECTED} (git-ignoriert).`);
}

/** Ganzer Befehl. generate ist nur für die Generalprobe austauschbar (Platzhalterbilder statt Imagegen). Liefert den Exit-Code. */
export function main(argv=process.argv.slice(2),{generate=imagegenStep}={}){
 if(argv.includes('--dry')||argv.includes('--dry-run')){
  const stale=refreshJobSheets({write:false});
  printPlan(planBlocks({sheets:{[SHEET_JOBS]:sheetJobs(),[SINGLE_JOBS]:singleJobs()}}),stale);return 0;
 }
 const changed=refreshJobSheets();if(changed.length)console.log('Auftragsblätter aus dem Inhalt neu geschrieben: '+changed.join(', '));
 const blocks=planBlocks();printPlan(blocks,[]);
 const report=runPlan(blocks,{...realSteps,generate});let code=0;
 if(report.made.length&&!report.buildFailed){
  console.log('\nPrecache und Tests …');
  const cache=node(['scripts/pwa-cache.mjs']),tests=cache&&spawnSync('npm',['test'],{cwd:fileURLToPath(root),stdio:'inherit',shell:true}).status===0;
  console.log(tests?'npm test grün.':'npm test ROT – bitte ansehen, bevor committet wird.');if(!tests)code=1;
 }
 printReport(report);
 if(report.buildFailed){console.log('Einbau fehlgeschlagen im Block '+report.buildFailed+'.');return 1;}
 return code||(report.quota?3:report.missing.length?1:0);
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])process.exitCode=main();
