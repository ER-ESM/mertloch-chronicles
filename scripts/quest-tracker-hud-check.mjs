// Auftragsverfolgung im Browser (2026-09-23): kein Kopf/Erklärtext, je Auftrag nur ein Schritt, kein Scrollbalken,
// Tooltip mit allen Schritten beim Überfahren, Klick auf einen weiteren Auftrag verfolgt ihn (ohne Loslaufen).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/quest-tracker';mkdirSync(dir,{recursive:true});const b=await browserSession({port:9432,serverPort:4232});
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`);
const mouse=(type,x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type,x,y,pointerType:'mouse',...extra});
try{
 const made=createCharacter(null,{name:'Auftrags Prüfer',classId:'dieter',look:'dieter'}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',level:4,classId:'dieter',tutorial:{version:1,step:8,completed:true},rpg:{inventory:[],coins:50}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete Navigator.prototype.serviceWorker;localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(save.worldKey,made.character))+','+JSON.stringify(JSON.stringify(save))+');'});
 await b.resize(2024,900);await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);for(let i=0;i<100&&!await b.evaluate('!!window.game');i++)await wait(150);
 // Hauptquest annehmen und zwei Aufträge der Startreihe holen, damit Verfolgung und Liste gefüllt sind.
 await run(`g.tutorial.completed=true;g.enemies=[];g.player.inCombat=0;g.stopAuto();g.quest.accepted=true;const H=await import('./hotspots.js');const L=H.hotspotLayout(g.world);for(const [spot,id] of [['bude-nyalol','st-nyalol-1'],['kirchhof','hs-kirchhof-1']]){const h=L.hotspots.find(h=>h.id===spot);g.player.x=h.giver.x;g.player.y=h.giver.y;H.acceptHotspotQuest(g,id);}g.moveTo=null;g.keys.clear();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
 await wait(1200);await mouse('mouseMoved',10,880);await wait(300);
 const state=await run(`const p=document.querySelector('.quest-panel'),cs=getComputedStyle(p),r=p.getBoundingClientRect();return {text:p.innerText,width:r.width,scroll:p.scrollHeight>p.clientHeight+1,overflow:cs.overflowY,focusTasks:p.querySelectorAll('.qt-quest.is-focus .quest-task').length,others:p.querySelectorAll('.quest-others .qt-quest').length,rect:{x:r.x,y:r.y,w:r.width,h:r.height}};`);
 console.log(JSON.stringify(state));
 assert.doesNotMatch(state.text,/POO-TANG|Weitere Aufträge|Klick verfolgt|BELOHNUNG/i,'kein Kopf, kein Erklärtext');
 assert.ok(state.width>=280,'breiter als vorher (212 px)');assert.equal(state.scroll,false,'kein Scrollen');assert.equal(state.focusTasks,1,'nur der nächste Schritt');assert.ok(state.others>=2,'weitere Aufträge darunter');
 await b.screenshot(dir+'/verfolgung.jpg');
 // Tooltip über dem verfolgten Auftrag
 const focus=await run(`const r=document.querySelector('.qt-quest.is-focus').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};`);
 await mouse('mouseMoved',Math.round(focus.x),Math.round(focus.y));await wait(400);
 const tip=await run(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.textContent:'';`);console.log('Tooltip:',tip);
 assert.ok(tip.length>10,'Tooltip mit Details beim Überfahren');await b.screenshot(dir+'/verfolgung-tooltip.jpg');
 // Klick auf einen weiteren Auftrag verfolgt ihn, ohne loszulaufen
 const other=await run(`const e=document.querySelector('.quest-others .qt-quest');const r=e.getBoundingClientRect();return {key:e.dataset.trackQuest,x:r.x+r.width/2,y:r.y+r.height/2};`);
 await mouse('mouseMoved',Math.round(other.x),Math.round(other.y));await mouse('mousePressed',Math.round(other.x),Math.round(other.y),{button:'left',clickCount:1});await mouse('mouseReleased',Math.round(other.x),Math.round(other.y),{button:'left',clickCount:1});await wait(400);
 const after=await run(`const {focusedKey}=await import('./quest-tracker.js');return {key:focusedKey(g),moving:!!g.moveTo,top:document.querySelector('#questTitle')?.textContent};`);console.log(JSON.stringify(after));
 assert.equal(after.key,other.key,'Klick verfolgt den Auftrag');assert.equal(after.moving,false,'Klick auf die Liste läuft nicht los');
 await mouse('mouseMoved',10,880);await wait(300);await b.screenshot(dir+'/verfolgung-gewechselt.jpg');
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({state,tip,after},null,2));console.log('PASS Auftragsverfolgung');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
