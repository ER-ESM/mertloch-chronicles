// Quellen-Wächter: bricht ab, wenn eine ausgelieferte Quelle Konfliktmarker trägt oder nicht parsbar ist.
// Läuft als erster Schritt von `npm run build` – ein kaputter Stand fasst _site damit gar nicht erst an
// (Anlass: 2026-09-20 gingen Rebase-Marker in chat-window.js live).
import {readdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function sourceProblems(root=fileURLToPath(new URL('../',import.meta.url))){
 const problems=[],files=[];
 for(const dir of ['.','content','content/talents','content/procs','content/checks','server/game','scripts','tests']){
  let names=[];try{names=readdirSync(path.join(root,dir));}catch{continue;}
  for(const n of names)if(/\.(js|mjs|css|html|json)$/.test(n))files.push(path.join(dir,n));
 }
 for(const f of files){
  const text=readFileSync(path.join(root,f),'utf8');
  if(/^(<{7}|>{7}) |^={7}$/m.test(text))problems.push(f+': Konfliktmarker');
  else if(/\.(js|mjs)$/.test(f)&&!f.startsWith('tests')){try{execFileSync(process.execPath,['--input-type=module','--check'],{input:text,stdio:['pipe','pipe','pipe']});}catch(e){problems.push(f+': Syntaxfehler – '+String(e.stderr||e.message).split('\n').find(l=>/Error/.test(l)));}}
 }
 return problems;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const problems=sourceProblems();if(problems.length){console.error('Quellen-Wächter: Abbruch.\n - '+problems.join('\n - '));process.exit(1);}
 console.log('Quellen-Wächter: sauber.');
}
