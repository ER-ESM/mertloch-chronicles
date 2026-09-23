// Online-Server sofort auf den neuesten main-Stand bringen, statt auf die 10-Minuten-Aufgabe zu warten.
//   node scripts/server-refresh.mjs            → Update anstoßen, warten bis der Build von origin/main live ist
//   node scripts/server-refresh.mjs --status   → nur anzeigen, welcher Build live ist
// Token: Umgebungsvariable MERTLOCH_DEPLOY_TOKEN oder Datei ~/.mertloch-deploy-token (eine Zeile, nie ins Repo).
// Server: MERTLOCH_SERVER (Standard https://mertloch.esm-consultant.de).
import {readFileSync,existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const base=(process.env.MERTLOCH_SERVER||'https://mertloch.esm-consultant.de').replace(/\/$/,'');
const tokenFile=join(homedir(),'.mertloch-deploy-token');
const token=process.env.MERTLOCH_DEPLOY_TOKEN||(existsSync(tokenFile)?readFileSync(tokenFile,'utf8').trim():'');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const live=async()=>{try{const r=await fetch(base+'/api/version',{cache:'no-store'});return r.ok?(await r.json()).build:null;}catch{return null;}};
const label=b=>b?`#${b.number} · ${b.commit} · ${b.date}`:'unbekannt';

let target=null;
try{execFileSync('git',['fetch','-q','origin','main']);target=Number(execFileSync('git',['rev-list','--count','origin/main']).toString().trim());}catch{}
const before=await live();
console.log('Live:   '+label(before)+(target?'   · origin/main: #'+target:''));
if(process.argv.includes('--status'))process.exit(0);
if(!token){console.error('Kein Token: MERTLOCH_DEPLOY_TOKEN setzen oder '+tokenFile+' anlegen.');process.exit(2);}
if(target&&before?.number>=target){console.log('Schon aktuell.');process.exit(0);}

const res=await fetch(base+'/api/deploy',{method:'POST',headers:{authorization:'Bearer '+token}});
const body=await res.json().catch(()=>({}));
if(!res.ok){console.error('Abgelehnt ('+res.status+'): '+(body.message||body.error||'?'));process.exit(1);}
console.log('Update angestoßen ('+(body.task||body.via)+'). Warte auf den neuen Build …');
for(let i=0;i<60;i++){ // bis 5 Minuten: ziehen, bauen, Neustart
 await wait(5000);const now=await live();
 if(now&&(target?now.number>=target:now.commit!==before?.commit)){console.log('Live:   '+label(now)+'  ✔');process.exit(0);}
 process.stdout.write('.');
}
console.error('\nNach 5 Minuten noch nicht aktuell. Live: '+label(await live()));process.exit(1);
