// Codex-Kontingent lesen, ohne es zu verbrauchen: fragt den lokalen App-Server der Codex-CLI
// (`codex app-server`, JSON-RPC über stdio) nach `account/rateLimits/read`. Das ist dieselbe Anzeige wie
// „Usage“ in der Codex-Oberfläche: Wochenfenster (primary, 10080 min) mit usedPercent und resetsAt.
// Es wird kein Modell aufgerufen und nichts verbraucht. Rücksetz-Gutschriften (rateLimitResetCredits) werden nur
// gemeldet, NIE eingelöst: das entscheidet der Nutzer.
//
//   node tools/sprite-pipeline/codex-kontingent.mjs         → eine Zeile Klartext
//   node tools/sprite-pipeline/codex-kontingent.mjs --json  → Rohwerte
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveCodex} from './imagegen.mjs';

/** @returns {Promise<{usedPercent:number|null,resetsAt:Date|null,windowMins:number|null,allowed:boolean|null,planType:string|null,reached:string|null,resetCredits:number}>} */
export function readCodexQuota({bin=resolveCodex(),timeoutMs=30000}={}){
 return new Promise((resolve,reject)=>{
  const ch=spawn(bin,['app-server'],{stdio:['pipe','pipe','pipe'],windowsHide:true});
  let buf='',err='',done=false;
  const finish=(fn,v)=>{if(done)return;done=true;clearTimeout(timer);try{ch.kill();}catch{}fn(v);};
  const timer=setTimeout(()=>finish(reject,new Error('Codex-App-Server antwortet nicht ('+timeoutMs/1000+' s). '+err.slice(-300))),timeoutMs);
  const send=o=>ch.stdin.write(JSON.stringify(o)+'\n');
  ch.on('error',e=>finish(reject,e));
  ch.on('close',code=>finish(reject,new Error('Codex-App-Server beendet (Code '+code+'). '+err.slice(-300))));
  ch.stderr.on('data',d=>{err+=d;});
  ch.stdout.on('data',d=>{
   buf+=d;let i;
   while((i=buf.indexOf('\n'))>=0){
    const line=buf.slice(0,i);buf=buf.slice(i+1);let m;try{m=JSON.parse(line);}catch{continue;}
    if(m.id===1){if(m.error)return finish(reject,new Error('initialize: '+JSON.stringify(m.error)));send({method:'initialized'});send({id:2,method:'account/rateLimits/read'});}
    else if(m.id===2){
     if(m.error)return finish(reject,new Error('account/rateLimits/read: '+JSON.stringify(m.error)));
     const r=m.result||{},rl=r.rateLimits||{},w=rl.primary||rl.secondary||null;
     finish(resolve,{usedPercent:w?.usedPercent??null,resetsAt:w?.resetsAt?new Date(w.resetsAt*1000):null,windowMins:w?.windowDurationMins??null,
      allowed:r.ordinaryUsageAllowed??null,planType:rl.planType??null,reached:rl.rateLimitReachedType??null,
      resetCredits:r.rateLimitResetCredits?.availableCount??0});
    }
   }
  });
  send({id:1,method:'initialize',params:{clientInfo:{name:'mertloch-kontingent',version:'1.0'}}});
 });
}

export function describeQuota(q){
 const at=q.resetsAt?q.resetsAt.toLocaleString('de-DE',{timeZone:'Europe/Berlin'}):'?';
 return `Codex-Kontingent: ${q.usedPercent??'?'} % der Woche verbraucht, frei ${q.usedPercent==null?'?':Math.max(0,100-q.usedPercent)} %, `+
  `Nutzung ${q.allowed===false?'GESPERRT':'erlaubt'}${q.reached?' ('+q.reached+')':''}, Rücksetzung ${at}`+
  (q.resetCredits?`, ${q.resetCredits} Rücksetz-Gutschrift(en) vorhanden (nicht angetastet)`:'');
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const q=await readCodexQuota();
 console.log(process.argv.includes('--json')?JSON.stringify(q,null,1):describeQuota(q));
}
