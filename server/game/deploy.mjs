// Server-Refresh auf Zuruf: POST /api/deploy stößt die geplante Aufgabe an, die sonst alle 10 Minuten läuft
// (origin/main ziehen, _site bauen, Spielserver neu starten). GET /api/version zeigt den live ausgelieferten Build.
// Konfiguration (C:\Mertloch\mertloch.env):
//   MERTLOCH_DEPLOY_TOKEN=<mind. 32 Zeichen>   ohne Token ist der Endpunkt abgeschaltet (404)
//   MERTLOCH_UPDATE_TASK=MertlochUpdate        Name der geplanten Windows-Aufgabe
//   MERTLOCH_UPDATE_COMMAND=...                statt der Aufgabe ein eigener Befehl (z. B. auf Linux oder zum Testen)
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {timingSafeEqual,createHash} from 'node:crypto';

export const DEPLOY_COOLDOWN_MS=60_000;
const digest=s=>createHash('sha256').update(String(s)).digest();
/** Token vergleichen, ohne über die Laufzeit Länge oder Inhalt zu verraten. */
export function tokenMatches(given,expected){if(!expected||expected.length<32||!given)return false;return timingSafeEqual(digest(given),digest(expected));}
export function bearer(req){const m=/^Bearer\s+(\S+)$/i.exec(req.headers.authorization||'');return m?m[1]:'';}

/** Build des ausgelieferten Stands aus _site/build-info.js (schreibt `npm run build`). */
export function readBuild(file){
 try{const m=/BUILD=(\{.*?\});/.exec(readFileSync(file,'utf8'));return m?JSON.parse(m[1]):null;}catch{return null;}
}

/** env: Umgebung · run: (cmd,args)=>void (Tests ersetzen den Prozessstart) · now: ()=>ms */
export function createDeploy({env=process.env,buildFile,log=()=>{},run=launch,now=Date.now}={}){
 let last=0,count=0;
 const enabled=()=>String(env.MERTLOCH_DEPLOY_TOKEN||'').length>=32;
 return {
  enabled,
  version:()=>({build:readBuild(buildFile),deploys:count,lastDeploy:last?new Date(last).toISOString():null}),
  /** → {started:true,...} · Fehler als {status,code,message} */
  trigger(req){
   if(!enabled())return {status:404,code:'not-found',message:'Unbekannter Endpunkt.'};
   if(!tokenMatches(bearer(req),env.MERTLOCH_DEPLOY_TOKEN))return {status:401,code:'token',message:'Token fehlt oder stimmt nicht.'};
   const wait=last+DEPLOY_COOLDOWN_MS-now();if(wait>0)return {status:429,code:'cooldown',message:'Update läuft bereits. Erneut in '+Math.ceil(wait/1000)+' s.'};
   const command=String(env.MERTLOCH_UPDATE_COMMAND||'').trim(),task=String(env.MERTLOCH_UPDATE_TASK||'MertlochUpdate');
   try{if(command)run(command,[],true);else run('schtasks',['/Run','/TN',task],false);}
   catch(e){return {status:500,code:'spawn',message:'Update konnte nicht gestartet werden: '+e.message};}
   last=now();count++;log('Server-Refresh angestoßen ('+(command?'Befehl':'Aufgabe '+task)+').');
   return {started:true,via:command?'command':'task',task:command?null:task,build:readBuild(buildFile)};
  }
 };
}
// Losgelöst starten: die Aufgabe startet den Spielserver neu – die Antwort ist dann längst unterwegs.
function launch(cmd,args,shell){const child=spawn(cmd,args,{detached:true,stdio:'ignore',windowsHide:true,shell});child.on('error',()=>{});child.unref();}
