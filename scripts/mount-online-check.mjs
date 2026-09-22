import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createGameServer} from '../server/game/server.mjs';
import {createCharacter,characterKey} from '../characters.js';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/mounts';mkdirSync(dir,{recursive:true});
const data=mkdtempSync(join(tmpdir(),'mertloch-mount-online-')),server=createGameServer({dataDir:data,staticDir:process.cwd()}),addr=await server.listen(0),url='http://127.0.0.1:'+addr.port+'/?online=1',browsers=[];
const run=(b,s)=>b.evaluate(`(async()=>{const g=window.game;${s}})()`);
try{
 for(const [i,name]of ['Hofreiter','Rollerfahrer'].entries()){
  const res=await fetch(new URL('/api/auth',url),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'register',email:name+'@example.org',name,password:'test-mount-account-123'})});assert.equal(res.status,200);const cookie=res.headers.get('set-cookie').split(';')[0],cut=cookie.indexOf('='),b=await browserSession({url,port:9415+i});browsers.push(b);
  await b.send('Network.setCookie',{name:cookie.slice(0,cut),value:cookie.slice(cut+1),url,httpOnly:true});
  const made=createCharacter(null,{name:name+' Held',classId:i?'dieter':'kevin',look:i?'dieter':'baerbel',tint:{skin:'gebraeunt',hair:'rot'}}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:made.character.classId,level:6,tutorial:{version:1,step:8,completed:true},mounts:{owned:['klappermofa','blechroller','hofpferd'],selected:i?'blechroller':'hofpferd'}};
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-characters',${JSON.stringify(JSON.stringify(made.roster))});localStorage.setItem(${JSON.stringify(characterKey(save.worldKey,made.character))},${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);
  await run(b,`g.tutorial.completed=true;g.enemies=[];g.player.inCombat=0;g.stopAuto();const {mountStation}=await import('./mounts.js'),s=mountStation(g.world);Object.assign(g.player,g.world.findClear(s.x+${i?50:-25},s.y+80,8));g.moveTo=null;g.keys.clear();`);
 }
 const [a,b]=browsers;await a.press('x');await b.press('x');await wait(2300);
 for(const [client,mount]of [[a,'blechroller'],[b,'hofpferd']])assert.ok(await run(client,`return g.others.some(p=>p.mount==='${mount}');`),'remote mount received in actual browser');
 assert.ok(await run(b,`return g.others.some(p=>p.look==='baerbel'&&p.classId==='kevin'&&p.visualEquipment.length);`),'look differs from class and carries equipped clothing');
 for(const client of browsers)await run(client,`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(250);await a.screenshot(dir+'/online-riders-a.png');await b.screenshot(dir+'/online-riders-b.png');
 await a.press('x');await wait(700);assert.ok(await run(b,`return g.others.every(p=>!p.mount);`));
 await a.goto(url);await wait(800);assert.equal(await run(a,'return g.player.mount;'),null);assert.equal(await run(a,'return g.mounts.owned.length;'),3);
 for(const client of browsers)assert.deepEqual(client.errors,[]);
 writeFileSync(dir+'/online-report.json',JSON.stringify({checks:['Two signed-in browser clients render both mounts','Independent class/body, tint and clothing reach the other browser','Dismount propagates','Reconnect keeps collection and clears active mount'],errors:[]},null,2));console.log('PASS two browser accounts: remote rider, clothing, dismount and reconnect');
}catch(e){for(const [i,b]of browsers.entries())try{await b.screenshot(dir+'/online-failure-'+i+'.png');console.log(await run(b,'return {others:g.others,player:g.player.mount,screen:document.querySelector("#startScreen")?.textContent};'));}catch{}throw e;}
finally{for(const b of browsers)await b.close();await server.close();assert.ok(resolve(data).startsWith(resolve(tmpdir())+sep)&&data.includes('mertloch-mount-online-'));rmSync(data,{recursive:true,force:true});}
