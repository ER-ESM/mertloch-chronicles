// Codex-Lauf „MertlochIcons“ (Sa 26.09.2026, 23:00; docs/ICONS-CODEX-2026-09-26.md). Wird von
// D:\Dev\_prototypen\icons-2026-09-25\codex-samstag.cmd (geplante Aufgabe) aufgerufen, geht aber auch direkt:
//   node tools/sprite-pipeline/icons-codex-lauf.mjs [--dry-run] [--bis=60] [--warte=MertlochPortraets] [--warte-max=90]
//        [--review=D:/Dev/_review/icons-codex] [--nur=talente,spez,kniffe,dicht]
// Ablauf:
//  1. warten, bis die Porträt-Aufgabe fertig ist (höchstens --warte-max Minuten; Bilder werden je Sitzung zugeordnet)
//  2. Kontingent lesen (codex app-server, kostenlos); gesperrt oder über --bis Prozent → nichts erzeugen
//  3. in Priorität erzeugen: Talent-Atlanten → Spez-Symbole → 28 Kniffe (schorsch-parry, kaethe-dash, kevin-reload zuerst)
//     → 4 dichte Dieter-Kniffe. Vor jedem Bild Kontingent prüfen; beim Nutzungslimit sofort aufhören.
//  4. Herkunft nachziehen: ersetzte Code-Originale aus herkunft.json, neue Talentbögen in e32/generation.json
//  5. Zuschnitt und Export: build-talents, build-precision, pwa-cache
//  6. Kontaktbogen nach --review, 7. Prüfungen ins Protokoll. Kein Commit, kein Push, keine Rücksetz-Gutschrift.
// Trockenlauf: 1–3 nur ansehen (Kontingent wird gelesen, kein Bild angefordert), Kontaktbogen vom Ist-Stand.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runJobs} from './imagegen.mjs';
import {readCodexQuota,describeQuota} from './codex-kontingent.mjs';
import {FILES} from './icons-codex-jobs.mjs';
import {writeContactSheets} from './icons-codex-kontaktbogen.mjs';

const root=new URL('../../',import.meta.url),P=p=>new URL(p,root),json=p=>JSON.parse(readFileSync(P(p),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),now=()=>new Date().toLocaleString('de-DE',{timeZone:'Europe/Berlin'});
const log=(...a)=>console.log(`[${now()}]`,...a);
const argv=process.argv.slice(2),arg=(k,d)=>{const a=argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):d;};
const DRY=argv.includes('--dry-run'),BIS=Number(arg('bis',60)),WAIT_TASK=arg('warte','MertlochPortraets'),WAIT_MAX=Number(arg('warte-max',90));
const REVIEW=arg('review','D:/Dev/_review/icons-codex'),ONLY=arg('nur','talente,spez,kniffe,dicht').split(',');
// Kosten je Bild (Prozent Wochenkontingent): gemessen 24.09. 88 → 100 % über 77 Einzelbilder ≈ 0,16 %; angesetzt 0,2 %,
// für die größeren Talentbögen (1536 × 1280) vorsichtig 0,3 %.
export const COST={'talent-atlas':.3,skills:.2};
const HERKUNFT='assets/precision/sources/2026-09-25/e71-kniffe/herkunft.json',E32_GEN='assets/content-art/e32/generation.json';
export const QUEUE=[
 {group:'talente',file:FILES.talente,force:false},
 {group:'spez',file:FILES.spez,force:false},
 {group:'kniffe',file:FILES.e71,force:true,first:['skill-schorsch-parry','skill-kaethe-dash','skill-kevin-reload']},
 {group:'dicht',file:FILES.dicht,force:false}
];

// Offen = Original fehlt; bei den e71-Kniffen auch: das Original ist noch die Code-Zeichnung (Hash steht in herkunft.json).
export function pendingJobs(){
 const code=new Set((existsSync(P(HERKUNFT))?json(HERKUNFT).records:[]).map(r=>r.output+'#'+r.sha256)),out=[];
 for(const q of QUEUE){
  let jobs=json(q.file);if(q.first)jobs=[...q.first.map(id=>jobs.find(j=>j.id===id)).filter(Boolean),...jobs.filter(j=>!q.first.includes(j.id))];
  for(const j of jobs){const has=existsSync(P(j.output));
   const open=!has||(q.group==='kniffe'&&code.has(j.output+'#'+sha(readFileSync(P(j.output)))));
   out.push({...q,job:j,open});}
 }
 return out;
}
function taskState(name){
 if(!name||process.platform!=='win32')return 'unbekannt';
 const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`(Get-ScheduledTask -TaskName '${name}' -ErrorAction SilentlyContinue).State`],{encoding:'utf8'});
 return (r.stdout||'').trim()||'nicht vorhanden';
}
async function quota(){try{return await readCodexQuota();}catch(e){log('Kontingent nicht lesbar:',e.message);return null;}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function run(cmd,args){log('>',cmd,args.join(' '));const r=spawnSync(cmd,args,{cwd:fileURLToPath(root),encoding:'utf8',maxBuffer:256*1024*1024});
 const out=((r.stdout||'')+(r.stderr||'')).trim();if(out)console.log(out.split('\n').slice(-40).join('\n'));log(`< Code ${r.status}`);return r.status===0;}

// Herkunft: ersetzte Code-Originale verlassen herkunft.json (sonst meldet tests/e71-kniffe.test.mjs den Hash-Unterschied),
// neue Talentbögen bekommen ihren Eintrag in e32/generation.json (Format wie E-32: key, source, original, prompt, refs, entries, sha256).
function afterJob(q,j){
 if(q.group==='kniffe'&&existsSync(P(HERKUNFT))){const h=json(HERKUNFT),n=h.records.length;h.records=h.records.filter(r=>r.output!==j.output);
  if(h.records.length!==n){writeFileSync(P(HERKUNFT),JSON.stringify(h,null,1)+'\n');log(`  herkunft.json: ${j.id} entfernt (jetzt Imagegen)`);}}
 if(q.group==='talente'){const g=json(E32_GEN),rec=json('assets/precision/generation.json').records.find(r=>r.id===j.id&&r.output===j.output),bytes=readFileSync(P(j.output));
  const entry={key:j.spec,source:j.output,original:rec?.originalFile||'unbekannt',prompt:j.prompt,refs:j.references,via:rec?.via,date:rec?.date,
   entries:j.entries.map(e=>({id:e.id,name:e.name,glyph:e.glyph})),sha256:sha(bytes)};
  const at=g.jobs.findIndex(x=>x.key===j.spec);if(at>=0)g.jobs[at]=entry;else g.jobs.push(entry);
  writeFileSync(P(E32_GEN),JSON.stringify(g,null,2)+'\n');log(`  e32/generation.json: ${j.spec} eingetragen`);}
}

export async function main(){
 log(`==== Icons-Codex-Lauf ${DRY?'(TROCKENLAUF) ':''}· Grenze ${BIS} % · Worktree ${fileURLToPath(root)}`);
 const status={start:new Date().toISOString(),dryRun:DRY,bis:BIS,done:[],failed:[],skipped:[],stop:null};
 // 1 Porträt-Aufgabe abwarten
 let state=taskState(WAIT_TASK),waited=0;log(`Aufgabe „${WAIT_TASK}“: ${state}`);
 while(!DRY&&state==='Running'&&waited<WAIT_MAX){await sleep(60000);waited++;state=taskState(WAIT_TASK);if(state!=='Running')log(`Aufgabe „${WAIT_TASK}“ fertig nach ${waited} min Warten`);}
 if(!DRY&&state==='Running')log(`Aufgabe „${WAIT_TASK}“ läuft nach ${WAIT_MAX} min noch – weiter, Bilder werden je Sitzung zugeordnet`);
 // 2 Kontingent und Plan
 let q=await quota();if(q)log(describeQuota(q));status.quotaBefore=q;
 const all=pendingJobs(),open=all.filter(p=>p.open&&ONLY.includes(p.group));
 for(const g of QUEUE.map(x=>x.group)){const a=all.filter(p=>p.group===g);log(`  ${g.padEnd(8)} ${a.filter(p=>p.open).length}/${a.length} offen${ONLY.includes(g)?'':' (abgewählt)'}`);}
 const need=open.reduce((s,p)=>s+(COST[p.job.kind]??.2),0);
 log(`Plan: ${open.length} Bilder ≈ ${need.toFixed(1)} % Wochenkontingent`+(q?.usedPercent!=null?` (frei bis zur Grenze: ${Math.max(0,BIS-q.usedPercent)} %)`:''));
 const blocked=q&&(q.allowed===false||q.usedPercent>=BIS);
 if(blocked){status.stop=q.allowed===false?'gesperrt':'Grenze';log(`${DRY?'Trockenlauf: der echte Lauf würde jetzt aufhören':'Stopp'} – Kontingent ${q.allowed===false?'gesperrt bis '+q.resetsAt?.toLocaleString('de-DE',{timeZone:'Europe/Berlin'}):'über der Grenze'}.`);}
 // 3 Erzeugen
 let fails=0;
 for(const p of open){
  if(!DRY&&status.stop)break;
  const {job:j}=p;
  if(DRY){runJobs(p.file,{only:[j.id],force:true,dryRun:true});status.skipped.push(j.id);continue;}
  if(status.done.length){q=await quota();if(q&&(q.allowed===false||q.usedPercent>=BIS)){status.stop=q.allowed===false?'gesperrt':'Grenze';log('Stopp –',describeQuota(q));break;}}
  try{const r=runJobs(p.file,{only:[j.id],force:p.force});if(r.done.length){status.done.push(j.id);afterJob(p,j);fails=0;}}
  catch(e){status.failed.push({id:j.id,error:e.code==='USAGE_LIMIT'?'Nutzungslimit':e.message.split('\n')[0]});
   if(e.code==='USAGE_LIMIT'){status.stop='Nutzungslimit';log(`Nutzungslimit erreicht${e.retryAt?' (wieder frei: '+e.retryAt+')':''} – Stopp.`);break;}
   log(`  ${j.id}: ${e.message.split('\n')[0]}`);if(++fails>=3){status.stop='3 Fehler in Folge';log('Drei Fehler in Folge – Stopp.');break;}}
 }
 log(`Erzeugt: ${status.done.length}, fehlgeschlagen: ${status.failed.length}${status.stop?', Stopp: '+status.stop:''}`);
 // 5 Zuschnitt und Export (nur wenn etwas Neues da ist)
 if(!DRY&&status.done.length){
  status.export={talente:run('node',['tools/class-visuals/build-talents.mjs']),precision:run('node',['tools/sprite-pipeline/build-precision.mjs']),pwa:run('node',['scripts/pwa-cache.mjs'])};
 }
 // 6 Kontaktbogen
 try{const f=writeContactSheets({out:REVIEW,dryRun:DRY,done:status.done});log('Kontaktbogen:',f.join(', '));}catch(e){log('Kontaktbogen fehlgeschlagen:',e.message);}
 // 7 Prüfungen
 if(!DRY&&status.done.length)status.tests=run('node',['--test','tests/icons-codex.test.mjs','tests/e71-kniffe.test.mjs','tests/e32-delivery.test.mjs','tests/art-precision.test.mjs','tests/imagegen.test.mjs']);
 status.quotaAfter=DRY?q:await quota();if(status.quotaAfter&&!DRY)log(describeQuota(status.quotaAfter));
 // Ergebniscode für die Aufgabenplanung: 0 alles erzeugt (oder Trockenlauf), 3 gestoppt mit offenen Bildern, 1 Fehler.
 status.open=open.length-status.done.length;process.exitCode=DRY?0:status.failed.some(f=>!/Nutzungslimit/.test(f.error))&&!status.done.length?1:status.open?3:0;
 status.end=new Date().toISOString();mkdirSync(REVIEW,{recursive:true});writeFileSync(REVIEW+'/status'+(DRY?'-trockenlauf':'')+'.json',JSON.stringify(status,null,1)+'\n');
 log(`==== Ende (Code ${process.exitCode}, offen ${status.open}). Kein Commit, kein Push – Abnahme: Kontaktbogen ansehen, dann im Worktree committen.`);
 return status;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])await main();
