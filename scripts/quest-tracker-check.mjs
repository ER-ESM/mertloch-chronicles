// Quest-Tracker (2026-09-23): mehrere Aufträge im Auftragsfeld, Klick verfolgt, Entfernung; Ollis Abgabe bei Ida trotz Hauptquest.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9438,serverPort:4238});const read=s=>b.evaluate(s),dir='visual-review/quest-tracker/';mkdirSync(dir,{recursive:true});
try{await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(4000);
 await read(`(async()=>{const m=await import('./hotspots.js');game.quest.accepted=true;for(const [h,q] of [['bude-nyalol','st-nyalol-1'],['bude-olli','st-olli-1'],['kirchhof','hs-kirchhof-1']]){const g=m.hotspotLayout(game.world).hotspots.find(x=>x.id===h).giver;Object.assign(game.player,{x:g.x,y:g.y});m.acceptHotspotQuest(game,q);}const p=game.world.base.house.spots.wake;Object.assign(game.player,{x:p.x,y:p.y});document.querySelectorAll('[data-window-close],[data-close]').forEach(b=>b.click());})()`);await wait(1500);
 const list=await read(`[...document.querySelectorAll('#questOthers [data-track-quest]')].map(b=>b.dataset.trackQuest+' | '+b.textContent)`);
 assert.ok(list.length>=2,JSON.stringify(list));await b.screenshot(dir+'1-tracker.jpg');
 const r=await read(`(()=>{const b=document.querySelector('#questOthers [data-track-quest="hs:st-nyalol-1"]');const q=b.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2};})()`);
 for(const type of ['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:r.x,y:r.y,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});await wait(700);
 const title=await read(`document.querySelector('#questTitle').textContent`);assert.match(title,/Kabelsalat/,'Klick verfolgt Nyalols Auftrag: '+title);await b.screenshot(dir+'2-nach-klick.jpg');
 // Ida: Ollis Pitch ist fertig und steht in ihrem Gespräch.
 await read(`(()=>{Object.assign(game.player,{x:game.world.npc.x,y:game.world.npc.y+10});})()`);await wait(600);await b.press('f');await wait(800);
 const claim=await read(`!!document.querySelector('[data-hs-claim="st-olli-1"]')`);assert.ok(claim,'Abgabe bei Ida sichtbar');await b.screenshot(dir+'3-ida-abgabe.jpg');
 await read(`document.querySelector('[data-hs-claim="st-olli-1"]').click()`);await wait(600);
 assert.equal(await read(`(async()=>(await import('./hotspots.js')).questStatus(game,'st-olli-1'))()`),'claimed');
 console.log('PASS quest tracker:',list.length,'weitere Aufträge · Klick verfolgt · Ida nimmt Ollis Pitch an');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
