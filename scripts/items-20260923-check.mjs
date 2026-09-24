// Abnahme der Symbolrunde 2026-09-23 (tools/sprite-pipeline/items-20260923-jobs.json):
// alle 22 Bilder geladen, Rucksack und Buch-Reiter „Talente" zeichnen die neuen Symbole.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/items-20260923';mkdirSync(dir,{recursive:true});
const jobs=JSON.parse(readFileSync(new URL('../tools/sprite-pipeline/items-20260923-jobs.json',import.meta.url)));
const items=jobs.filter(j=>j.kind==='items').map(j=>j.id);
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9398,serverPort:4208}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
async function until(expression){for(let i=0;i<80;i++){if(await read(expression))return;await wait(100);}throw Error('Timeout: '+expression);}
// Anteil der gezeichneten Pixel, die farblich zum Katalogbild passen. styleIcon() legt danach
// noch Kontur und Stil darüber, deshalb kein Bitvergleich, sondern Übereinstimmung je Pixel.
const match=(selector,id)=>`(async()=>{const {drawContentIcon}=await import('./content-art.js');const cv=document.querySelector(${JSON.stringify(selector)});if(!cv)return -1;
 const ref=document.createElement('canvas');ref.width=cv.width;ref.height=cv.height;if(!drawContentIcon(ref.getContext('2d'),${JSON.stringify(id)},0,0,Math.min(cv.width,cv.height)))return -2;
 const a=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,r=ref.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let both=0,near=0;
 for(let i=0;i<a.length;i+=4){if(!a[i+3]||!r[i+3])continue;both++;if(Math.abs(a[i]-r[i])+Math.abs(a[i+1]-r[i+1])+Math.abs(a[i+2]-r[i+2])<90)near++;}
 return both<40?0:+(near/both).toFixed(2);})()`;
try{
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,trainingXp:140,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(6500);
 const assets=await read(`(async()=>{const {contentAsset}=await import('./content-art.js');return ${JSON.stringify(jobs.map(j=>j.id))}.map(id=>({id,loaded:!!contentAsset(id)?.image?.complete,size:contentAsset(id)?.meta.width}));})()`);
 assert.deepEqual(assets.filter(a=>!a.loaded||a.size!==48),[]);checks.push(assets.length+' runtime images loaded at 48 px');
 for(const phone of [false,true]){
  const name=phone?'phone':'desktop';await b.resize(phone?390:1440,phone?844:900);await wait(400);
  await read(`(async()=>{const {addItem}=await import('./rpg.js');game.rpg.inventory=[];for(const id of ${JSON.stringify(items)})addItem(game.rpg,id);game.player.inCombat=0;game.enemies=[];})()`);
  await b.press('i');await until(`!!document.querySelector('.game-popup [data-item-art]')`);await wait(900);
  // data-item-art trägt die Gegenstands-ID nur, wenn itemArt() das Katalogbild gefunden hat; sonst das alte Ersatzsymbol.
  const bag=[];for(const id of items)bag.push([id,await read(match(`.game-popup [data-item-art="${id}"]`,id))]);
  await shot('rucksack-'+name);
  assert.deepEqual(bag.filter(([,v])=>v<0.6),[]);checks.push(name+': bag paints all '+items.length+' item icons from the catalog (min match '+Math.min(...bag.map(([,v])=>v))+')');
  await b.press('n');await until(`!!document.querySelector('[data-window="talents"] .popup-emblem')`);await wait(600);
  const tab='[data-window="talents"] .popup-emblem',now=await read(match(tab,'ui-tab-talente')),before=await read(match(tab,'ui-elite-badge'));
  assert.ok(now>=0.6&&now>before,'Talente-Reiter: ui-tab-talente '+now+' / ui-elite-badge '+before);
  await shot('talente-'+name);checks.push(name+': book tab "Talente" shows ui-tab-talente ('+now+' vs. old badge '+before+')');
  await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(300);
 }
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,assets,errors:b.errors},null,2));console.log(JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
