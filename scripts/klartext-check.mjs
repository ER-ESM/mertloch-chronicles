// Klartext (2026-09-23): Kniffe-Buch zeigt Eigenarten & Leisten (Rausch), Tooltips verschwinden sofort, Talente nennen konkrete Kniffe.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9437,serverPort:4237});const read=s=>b.evaluate(s),dir='visual-review/klartext/';mkdirSync(dir,{recursive:true});
try{await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:8,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50,talents:{spec:'dieter-brawl',learned:[]}}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];game.rpg.talents.spec='dieter-brawl';`);await wait(4000);
 await b.press('k');await wait(1000);
 const book=await read(`(()=>{const s=document.querySelector('.book-passives');s?.scrollIntoView({block:'center'});return {has:!!s,rausch:!!s?.querySelector('[data-describe="glossary:rausch"]'),open:!!s?.querySelector('.passive-tile.is-on[data-describe="mechanic:dieter-brawl"]')};})()`);
 assert.deepEqual(book,{has:true,rausch:true,open:true},JSON.stringify(book));await wait(300);await b.screenshot(dir+'1-kniffe-buch-leisten.jpg');
 {const r=await read(`(()=>{const e=document.querySelector('[data-describe="glossary:rausch"]').getBoundingClientRect();return {x:e.x+e.width/2,y:e.y+e.height/2};})()`);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y});await wait(500);assert.match(await read(`document.querySelector('#itemTooltip').textContent`),/Rausch/,'Tooltip erklärt Rausch');await b.screenshot(dir+'1b-rausch-tooltip.jpg');}
 // Tooltip: Hover auf ein Kniff-Symbol, dann weg – nach 60 ms muss er verschwunden sein.
 const at=await read(`(()=>{const el=document.querySelector('[data-book-skill]');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:at.x,y:at.y});await wait(400);
 const shown=await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`);assert.ok(shown,'Tooltip erscheint beim Hover');
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:at.x-300,y:at.y+300});await wait(60);
 assert.ok(await read(`document.querySelector('#itemTooltip').classList.contains('hidden')`),'Tooltip ist 60 ms nach dem Verlassen weg');
 // Talent-Tooltip: Zapfmeister, „Pils zuerst“ nennt Anstich und woher er kommt.
 await b.press('n');await wait(800);await read(`document.querySelector('[data-view-tree="dieter-brew"]')?.click()`);await wait(500);
 const tip=await read(`(async()=>{const t=[...document.querySelectorAll('[data-tooltip-talent]')].find(e=>e.getAttribute('aria-label')?.startsWith('Pils zuerst'));if(!t)return null;t.click();await new Promise(r=>setTimeout(r,400));return document.querySelector('.tt-details, .tt-detail-heading')?.closest('section,aside,div')?.textContent||'';})()`);
 await b.screenshot(dir+'2-talent-anstich.jpg');
 console.log('PASS klartext:',JSON.stringify(book),'talent detail:',(tip||'').slice(0,200));
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
