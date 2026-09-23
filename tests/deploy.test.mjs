import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDeploy,tokenMatches,DEPLOY_COOLDOWN_MS} from '../server/game/deploy.mjs';
import {createGameServer} from '../server/game/server.mjs';

const TOKEN='x'.repeat(40);
const req=auth=>({headers:auth?{authorization:auth}:{}});

test('ohne Token ist der Endpunkt abgeschaltet, falsches Token wird abgelehnt',()=>{
 const runs=[];
 assert.equal(createDeploy({env:{},run:(...a)=>runs.push(a)}).trigger(req('Bearer '+TOKEN)).status,404);
 const d=createDeploy({env:{MERTLOCH_DEPLOY_TOKEN:TOKEN},run:(...a)=>runs.push(a)});
 assert.equal(d.trigger(req()).status,401);assert.equal(d.trigger(req('Bearer falsch')).status,401);
 assert.equal(runs.length,0);assert.equal(tokenMatches('kurz','kurz'),false);
});
test('richtiges Token startet die geplante Aufgabe einmal und sperrt dann für eine Minute',()=>{
 const runs=[];let t=1_000_000;
 const d=createDeploy({env:{MERTLOCH_DEPLOY_TOKEN:TOKEN},run:(...a)=>runs.push(a),now:()=>t});
 const r=d.trigger(req('Bearer '+TOKEN));assert.equal(r.started,true);assert.deepEqual(runs[0],['schtasks',['/Run','/TN','MertlochUpdate'],false]);
 assert.equal(d.trigger(req('Bearer '+TOKEN)).status,429);
 t+=DEPLOY_COOLDOWN_MS;assert.equal(d.trigger(req('Bearer '+TOKEN)).started,true);assert.equal(runs.length,2);
});
test('eigener Update-Befehl ersetzt die Aufgabe; /api/version meldet den Build',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'mertloch-deploy-')),buildFile=join(dir,'build-info.js');
 writeFileSync(buildFile,'export const BUILD={"number":42,"commit":"abc1234","date":"2026-09-23","version":"0.20.0"};\n');
 const runs=[],deploy=createDeploy({env:{MERTLOCH_DEPLOY_TOKEN:TOKEN,MERTLOCH_UPDATE_COMMAND:'echo update'},buildFile,run:(...a)=>runs.push(a)});
 const game=createGameServer({dataDir:join(dir,'data'),deploy}),addr=await game.listen(0),base='http://127.0.0.1:'+addr.port;
 try{
  const v=await (await fetch(base+'/api/version')).json();assert.equal(v.build.number,42);
  assert.equal((await fetch(base+'/api/deploy',{method:'POST'})).status,401);
  const ok=await (await fetch(base+'/api/deploy',{method:'POST',headers:{authorization:'Bearer '+TOKEN}})).json();
  assert.equal(ok.ok,true);assert.equal(ok.via,'command');assert.deepEqual(runs[0],['echo update',[],true]);
 }finally{await game.close();rmSync(dir,{recursive:true,force:true});}
});
