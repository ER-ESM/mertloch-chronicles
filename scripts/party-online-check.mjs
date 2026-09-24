// Gruppenspiel mit echten Mitspielern (2026-09-24): eigener Spielserver, zwei angemeldete Browser, Einladung über den Chat,
// Gruppenrahmen, Söldner und gemeinsamer Kampf. Aufnahmen nach visual-review/party/. Aufruf: node scripts/party-online-check.mjs [szene]
// Szenen: basis (Standard) – weitere Schritte hängen die Runden an STEPS an.
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createGameServer} from '../server/game/server.mjs';
import {createCharacter,characterKey} from '../characters.js';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/party';mkdirSync(dir,{recursive:true});
const data=mkdtempSync(join(tmpdir(),'mertloch-party-online-')),server=createGameServer({dataDir:data,staticDir:process.cwd()}),addr=await server.listen(0),url='http://127.0.0.1:'+addr.port+'/?online=1',browsers=[];
const run=(b,s)=>b.evaluate(`(async()=>{const g=window.game,M=globalThis.__mertloch,on=M.online;${s}})()`);
const until=async(b,expr,ms=6000,what=expr)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await run(b,'return !!('+expr+');'))return;await wait(150);}throw Error('Zeit abgelaufen: '+what);};
const shot=async(b,name)=>{const c=process.env.CLIP?.split(',').map(Number),r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,...(c?{clip:{x:c[0],y:c[1],width:c[2],height:c[3],scale:1}}:{})});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));};
const HEROES=[{name:'Rudi',classId:'dieter',look:'dieter',tint:{skin:'mittel',hair:'braun'}},{name:'Moni',classId:'baerbel',look:'baerbel',tint:{skin:'hell',hair:'blond'}}];
const passed=[];const ok=t=>{passed.push(t);console.log('PASS '+t);};
try{
 for(const [i,h]of HEROES.entries()){
  const res=await fetch(new URL('/api/auth',url),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'register',email:h.name.toLowerCase()+'@example.org',name:h.name,password:'test-party-account-123'})});assert.equal(res.status,200);
  const cookie=res.headers.get('set-cookie').split(';')[0],cut=cookie.indexOf('='),b=await browserSession({url,port:Number(process.env.CDP_PORT||9470)+i});browsers.push(b);
  await b.resize(1600,900);await b.send('Network.setCookie',{name:cookie.slice(0,cut),value:cookie.slice(cut+1),url,httpOnly:true});
  const made=createCharacter(null,{name:h.name,classId:h.classId,look:h.look,tint:h.tint}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:h.classId,level:12,rpg:{version:4,coins:900},tutorial:{version:1,step:8,completed:true}};
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-touch-v1','{"mode":"desktop"}');localStorage.setItem('mertloch-characters',${JSON.stringify(JSON.stringify(made.roster))});localStorage.setItem(${JSON.stringify(characterKey(save.worldKey,made.character))},${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);
  await run(b,`g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x+${i?40:-20},n.y+60,9));g.moveTo=null;g.path=[];g.keys.clear();document.querySelectorAll('[data-window-close]').forEach(x=>x.click());`);
 }
 const [a,b]=browsers;
 await until(a,`on.state.connected&&g.others.some(o=>o.name==='Moni')`,8000,'A sieht B');ok('Beide Browser verbunden und sehen sich');
 await run(a,`on.social.invite('Moni');`);await until(b,`document.querySelector('[data-online=party-accept]')`,5000,'Einladung kommt an');
 await run(b,`document.querySelector('[data-online=party-accept]').click();`);
 await until(a,`on.state.party.members.some(m=>m.n==='Moni')`,5000,'Gruppe gebildet');await until(b,`on.state.party.members.some(m=>m.n==='Rudi')`,5000,'Gruppe bei B');ok('Einladung angenommen, Gruppe steht');
 await wait(1200);await shot(a,'basis-a');await shot(b,'basis-b');
 const scene=process.argv[2]||'basis';
 if(process.env.EVAL_A)await run(a,process.env.EVAL_A);if(process.env.EVAL_B)await run(b,process.env.EVAL_B);
 if(process.env.EVAL_A||process.env.EVAL_B){await wait(Number(process.env.WAIT||1500));await shot(a,scene+'-a');await shot(b,scene+'-b');}
 for(const [i,x]of browsers.entries())assert.deepEqual(x.errors,[],'Browserfehler bei Spieler '+i);
 writeFileSync(dir+'/report.json',JSON.stringify({passed},null,2));console.log('PASS Gruppenspiel online ('+passed.length+' Prüfungen)');
}catch(e){for(const [i,x]of browsers.entries())try{await shot(x,'fehler-'+i);console.log(JSON.stringify(await run(x,'return {party:on.state.party,others:g.others.map(o=>o.name),errors:[]};')));}catch{}throw e;}
finally{for(const x of browsers)await x.close();await server.close();assert.ok(resolve(data).startsWith(resolve(tmpdir())+sep)&&data.includes('mertloch-party-online-'));rmSync(data,{recursive:true,force:true});}
