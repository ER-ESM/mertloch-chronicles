// Sprite-Schmiede in der Bude (E-58): lädt der Baukasten die selbst gerenderten Sprites, laufen die Bildfolgen,
// stehen die Figuren an ihren Plätzen? Aufnahmen unter visual-review/forge/bude/ (Schankraum, Küche, Obergeschoss, Ida).
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/forge/bude';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9433,serverPort:4233}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.png');
const put=(x,y,floor=0)=>read(`(()=>{const h=game.world.base.house;game.floor=${floor};Object.assign(game.player,{x:h.minX+${x},y:h.minY+${y},inCombat:0});game.moveTo=null;game.path=[];game.enemies=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`performance.setResourceTimingBufferSize(8000);delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(3500);
 await read(`__mertloch.renderer.setZoomFactor(1.8)`);
 // 1 Schankraum am Ofen: Schmiede-Katalog und Ofen-Bildfolge geladen.
 await put(40,112);await wait(6000);
 const loaded=await read(`performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/assets/forge/runtime/kit/')).map(n=>n.split('/').pop())`);
 console.log(JSON.stringify(await read(`({kit:performance.getEntriesByType("resource").map(e=>e.name).filter(n=>n.includes("/runtime/kit/")).map(n=>n.split("/").slice(-3).join("/")).slice(0,12),fade:__mertloch.renderer.houseFade,p:[game.player.x,game.player.y],h:[game.world.base.house.minX,game.world.base.house.minY]})`)));
 for(const f of ["kit-forge.json","kit-kanonenofen.png"])assert.ok(loaded.includes(f),'geladen: '+f+' · '+loaded.join(','));
 checks.push('forge catalog and stove sheet loaded ('+loaded.length+' forge files)');
 await shot('1-schankraum-ofen-a');await wait(260);await shot('1-schankraum-ofen-b');
 // 2 Sitzecke mit rundem Tisch und Stühlen.
 await put(150,140);await wait(1500);await shot('2-sitzecke');
 // 3 Küche mit Wandlampe.
 await put(170,40);await wait(1500);await shot('3-kueche');
 // 4 Eingang mit Ida.
 const ida=await read(`(()=>{const h=game.world.base.house,s=h.spots.ida,w=s.x>=h.minX;return {x:w?s.x-h.minX:s.x,y:w?s.y-h.minY:s.y};})()`);
 await put(ida.x+20,ida.y+10);await wait(1500);await shot('4-eingang-ida');
 // 5 Obergeschoss.
 await put(60,60,1);await wait(1500);await shot('5-obergeschoss');
 const errors=await read(`(window.__errors||[]).length`);assert.ok(!errors,'keine Skriptfehler');
 console.log('✔ forge-bude-check\n - '+checks.join('\n - ')+'\n Aufnahmen: '+dir);
}finally{b.close();}
