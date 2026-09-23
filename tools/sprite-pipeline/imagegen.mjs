// Bildbeschaffung ohne Dateiübergabe: fordert die Motive eines Auftragsblatts direkt beim
// eingebauten Imagegen-Werkzeug von Codex an (ChatGPT-Abo, kein API-Schlüssel) und legt die
// unveränderten Originale unter job.output ab. Zuschnitt, Palette und Export bleiben bei
// `npm run sprites:precision` — dieses Werkzeug erzeugt nur die Quelle und die Herkunft.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,existsSync,mkdirSync,readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname,join,resolve} from 'node:path';

const ROOT=resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,'')),'../..');
const CODEX_HOME=process.env.CODEX_HOME||join(homedir(),'.codex');
const IMAGE_DIR=join(CODEX_HOME,'generated_images');
const JOB_TIMEOUT_MS=Number(process.env.IMAGEGEN_TIMEOUT_MS||15*60*1000);

// Codex kann nur erzeugen, wenn codex-code-mode-host.exe neben codex.exe liegt; die Kopie in
// ~/.codex/.sandbox-bin bringt den Host nicht mit und scheitert am Werkzeugaufruf.
export function resolveCodex(){
 const candidates=[];
 if(process.env.CODEX_BIN)candidates.push(process.env.CODEX_BIN);
 const win=process.platform==='win32';
 const ext=join(homedir(),'.vscode','extensions');
 if(existsSync(ext))for(const name of readdirSync(ext).filter(n=>n.startsWith('openai.chatgpt-')))
  candidates.push(win?join(ext,name,'bin','windows-x86_64','codex.exe'):join(ext,name,'bin','linux-x86_64','codex'));
 candidates.push(join(CODEX_HOME,'.sandbox-bin','codex.exe'),
  'C:/Program Files/Nimbalyst/resources/app.asar.unpacked/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe');
 const usable=candidates.filter(p=>existsSync(p)&&
  (existsSync(join(dirname(p),'codex-code-mode-host.exe'))||existsSync(join(dirname(p),'codex-code-mode-host'))));
 if(!usable.length)throw new Error('Kein vollständiger Codex gefunden (codex.exe mit codex-code-mode-host daneben). CODEX_BIN setzen.');
 return usable.map(p=>({p,m:statSync(p).mtimeMs})).sort((a,b)=>b.m-a.m)[0].p;
}

function codexVersion(bin){
 const r=spawnSync(bin,['--version'],{encoding:'utf8'});
 return (r.stdout||'').trim()||'unbekannt';
}

function pngsSince(since){
 const out=[];
 if(!existsSync(IMAGE_DIR))return out;
 for(const dir of readdirSync(IMAGE_DIR)){
  const full=join(IMAGE_DIR,dir);
  if(!statSync(full).isDirectory())continue;
  for(const file of readdirSync(full)){
   if(!file.endsWith('.png'))continue;
   const p=join(full,file),m=statSync(p).mtimeMs;
   if(m>=since)out.push({path:p,mtime:m});
  }
 }
 return out.sort((a,b)=>b.mtime-a.mtime);
}

// Ein Auftrag, ein Bild, kein Nachbearbeiten: der Agent darf nichts schreiben (read-only),
// damit das Original bitgleich so bleibt, wie das Bildwerkzeug es geliefert hat.
function instruction(job){
 return [
  'Erzeuge GENAU EIN Bild mit dem eingebauten Bildwerkzeug (Skill "imagegen").',
  `Zielgröße beim Erzeugen: ${job.width} x ${job.height} Pixel oder das nächstgrößere unterstützte Format.`,
  'Verwende den folgenden Bildauftrag unverändert und ergänze nichts:',
  '---',job.prompt,'---',
  'Danach: nichts kopieren, nichts skalieren, nichts nachbearbeiten, keine Datei schreiben, keine Shell-Befehle.',
  'Antworte ausschließlich mit dem absoluten Pfad der erzeugten PNG-Datei in der letzten Zeile.'
 ].join('\n');
}

function generate(bin,job,refs){
 const started=Date.now()-2000,before=new Set(pngsSince(0).map(f=>f.path));
 const args=['exec','--cd',ROOT,'--sandbox','read-only','--skip-git-repo-check','-c','model_reasoning_effort=low'];
 // `--image` ist variadisch: nur die Gleichheitsform bindet genau einen Pfad und lässt den Prompt stehen.
 for(const r of refs)args.push(`--image=${r}`);
 args.push(instruction(job));
 const run=spawnSync(bin,args,{encoding:'utf8',timeout:JOB_TIMEOUT_MS,maxBuffer:64*1024*1024});
 if(run.error)throw new Error(`Codex-Aufruf fehlgeschlagen: ${run.error.message}`);
 const fresh=pngsSince(started).filter(f=>!before.has(f.path));
 if(!fresh.length)throw new Error(`Kein Bild erzeugt.\n${(run.stdout||'').slice(-1500)}\n${(run.stderr||'').slice(-800)}`);
 if(fresh.length>1)console.warn(`  Hinweis: ${fresh.length} neue Bilder, jüngstes verwendet.`);
 return fresh[0].path;
}

export function runJobs(jobsPath,{only=null,force=false,dryRun=false,generationPath='assets/precision/generation.json'}={}){
 const jobs=JSON.parse(readFileSync(resolve(ROOT,jobsPath),'utf8'))
  .filter(j=>!only||only.includes(j.id));
 if(!jobs.length)throw new Error('Kein Auftrag ausgewählt.');
 // Codex wird erst gesucht, wenn wirklich ein Bild ansteht — Trockenlauf und Tests
 // laufen damit auch dort, wo kein Codex installiert ist (GitHub Actions).
 let bin=null,version=null;
 const codex=()=>{
  if(!bin){bin=resolveCodex();version=codexVersion(bin);console.log(`Codex: ${bin} (${version})`);}
  return bin;
 };
 const genFile=resolve(ROOT,generationPath);
 const generation=existsSync(genFile)?JSON.parse(readFileSync(genFile,'utf8')):{date:new Date().toISOString().slice(0,10),records:[]};
 const done=[],skipped=[];
 for(const job of jobs){
  const target=resolve(ROOT,job.output);
  if(existsSync(target)&&!force){skipped.push(job.id);console.log(`- ${job.id}: vorhanden, übersprungen`);continue;}
  if(dryRun){console.log(`- ${job.id}: würde erzeugt → ${job.output}`);continue;}
  console.log(`- ${job.id}: erzeuge …`);
  const refs=(job.references||[]).map(r=>resolve(ROOT,r));
  for(const r of refs)if(!existsSync(r))throw new Error(`Referenzbild fehlt: ${r}`);
  const source=generate(codex(),job,refs);
  mkdirSync(dirname(target),{recursive:true});
  copyFileSync(source,target);
  const bytes=readFileSync(target),sourceHash=createHash('sha256').update(bytes).digest('hex');
  const record={id:job.id,kind:job.kind,output:job.output,prompt:job.prompt,references:job.references||[],
   tool:'built-in imagegen',model:'Not exposed by built-in tool',via:`codex exec ${version}`,
   date:new Date().toISOString().slice(0,10),originalFile:source.split(/[\\/]/).pop(),sourceHash};
  const at=generation.records.findIndex(r=>r.id===job.id&&r.output===job.output);
  if(at>=0)generation.records[at]=record;else generation.records.push(record);
  // Herkunft sofort sichern: bricht der Lauf später ab, überspringt ein Folgelauf dieses Bild
  // (Datei vorhanden) und würde seine Herkunft sonst nie mehr schreiben.
  writeFileSync(genFile,JSON.stringify(generation,null,2)+'\n');
  done.push(job.id);
  console.log(`  → ${job.output} (${(bytes.length/1024).toFixed(0)} kB)`);
 }
 return {done,skipped};
}

if(process.argv[1]&&import.meta.url.endsWith(process.argv[1].replace(/\\/g,'/').split('/').pop())){
 const argv=process.argv.slice(2),jobsPath=argv.find(a=>!a.startsWith('--'));
 if(!jobsPath){
  console.error('Aufruf: node tools/sprite-pipeline/imagegen.mjs <auftraege.json> [--only id,id] [--force] [--dry-run]');
  process.exit(2);
 }
 const onlyArg=argv.find(a=>a.startsWith('--only='));
 const {done,skipped}=runJobs(jobsPath,{
  only:onlyArg?onlyArg.slice(7).split(',').map(s=>s.trim()).filter(Boolean):null,
  force:argv.includes('--force'),dryRun:argv.includes('--dry-run')});
 console.log(`Fertig: ${done.length} erzeugt, ${skipped.length} übersprungen.`);
 if(done.length)console.log('Nächster Schritt: npm run sprites:precision && node scripts/pwa-cache.mjs');
}
