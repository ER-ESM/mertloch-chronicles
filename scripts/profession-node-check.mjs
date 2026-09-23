// Fundstellen der Sammelberufe in der Welt: klein, mit Schimmer, Name nur beim Mouse-Over (Rahmen + Tooltip mit Beruf und Fertigkeit).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/profession-nodes';mkdirSync(dir,{recursive:true});const b=await browserSession({port:9431,serverPort:4231});
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`);
const mouse=(x,y)=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse'});
try{
 const made=createCharacter(null,{name:'Fundstellen Prüfer',classId:'dieter',look:'dieter'}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',level:6,classId:'dieter',tutorial:{version:1,step:8,completed:true},rpg:{inventory:[],coins:200},professions:{learned:{herbs:12}}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete Navigator.prototype.serviceWorker;localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(save.worldKey,made.character))+','+JSON.stringify(JSON.stringify(save))+');'});
 await b.resize(2024,900);await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);for(let i=0;i<100&&!await b.evaluate('!!window.game');i++)await wait(150);
 // Held zwischen eine Kräuter- und eine Hopfen-Fundstelle stellen, damit beide im Bild sind.
 const nodes=await run(`g.tutorial.completed=true;g.player.level=6;g.enemies=[];g.player.inCombat=0;g.stopAuto();const {professionWorld}=await import('./profession-world.js');const L=professionWorld(g.world).nodes;const n=L.find(n=>n.kind==='hops');g.player.x=n.x-60;g.player.y=n.y+10;g.moveTo=null;g.keys.clear();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return {hops:n,learned:g.professions.learned};`);
 await wait(900);
 // Bildschirmposition aus zwei Mauspunkten eichen (screenToWorld ist linear).
 // Die Kamera läuft dem versetzten Helden nach: erst eichen, wenn derselbe Mauspunkt zweimal denselben Weltpunkt liefert.
 const probe=async x=>{await mouse(x,450);await wait(80);return run('return g.hover');};let a=await probe(1000);for(let i=0;i<40;i++){await wait(150);const again=await probe(1000);if(Math.hypot(again.x-a.x,again.y-a.y)<.5){a=again;break;}a=again;}
 const c=await probe(1100),k=100/(c.x-a.x),sx=wx=>1000+(wx-a.x)*k,sy=wy=>450+(wy-a.y)*k;
 await mouse(10,880);await wait(250);await b.screenshot(dir+'/fundstelle-ohne-hover.jpg');
 assert.equal(await run("return document.querySelector('#worldTip')?.hidden??true"),true,'kein Tooltip ohne Mouse-Over');
 await mouse(Math.round(sx(nodes.hops.x)),Math.round(sy(nodes.hops.y-6)));await wait(250);
 assert.equal(await run('return g.hoverNode?.id'),nodes.hops.id,'Mouse-Over erkennt die Fundstelle');
 const tip=await run("const t=document.querySelector('#worldTip');return t&&!t.hidden?[...t.children].map(e=>e.textContent).join('\\n'):''");
 assert.match(tip,/Wilder Hopfen/);assert.match(tip,/Kräutersammeln/);assert.match(tip,/25/);
 await b.screenshot(dir+'/fundstelle-hover.jpg');
 await mouse(10,880);await wait(200);assert.equal(await run("return document.querySelector('#worldTip').hidden"),true,'Tooltip verschwindet beim Verlassen');
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({checks:['Fundstelle ohne Namen ohne Mouse-Over','Mouse-Over: Rahmen, Name, Tooltip mit Beruf und Fertigkeit','Tooltip verschwindet beim Verlassen'],tip},null,2));console.log('PASS Fundstellen: Hover-Rahmen und Tooltip\n'+tip);
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
