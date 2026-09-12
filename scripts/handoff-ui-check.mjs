import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World} from '../world.js';
import {browser,wait} from './browser-polish.mjs';
const url=process.argv[2]||'http://localhost:4173/',dir=process.argv[3]||'combat-review/handoff',key='mertloch-chronicles-v2-56753-72-1';mkdirSync(dir,{recursive:true});
const world=new World(JSON.parse(readFileSync('data/mertloch.json','utf8'))),save=new Game(world).save(),q=world.quests.find(q=>q.type==='gather');
save.sideQuests[q.id]={accepted:true,progress:2,collected:q.items.slice(0,2).map(i=>i.id),claimed:false};save.trackedQuest=q.id;
const b=await browser(),checks=[];let backup;
async function load(source){const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source});await b.goto(url);await wait(1100);await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});}
async function screenshot(name){await b.screenshot(dir+'/'+name+'.jpg');}
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});await b.send('Network.setCacheDisabled',{cacheDisabled:true});await b.goto(url);await wait(1000);
 backup=await b.evaluate('Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith("mertloch")))');
 await load(`localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(JSON.stringify(save))});`);await b.resize(2024,900);await b.press('j');await wait(200);
 let text=await b.evaluate('document.querySelector(".popup-quest").innerText');assert.ok(text.includes(q.itemName));assert.ok(text.includes(q.lines.progress));assert.ok(await b.evaluate(`document.querySelector('#questTasks').textContent.includes(${JSON.stringify(q.itemName)})`));
 await screenshot('desktop-quest');const before=await b.state();await b.hold('s',400);const after=await b.state();assert.ok(after.time>before.time&&!after.paused);assert.ok(Math.hypot(after.player.x-before.player.x,after.player.y-before.player.y)>4);checks.push('Actual quest popup: named progress, personal response, movement stays active');
 for(const claimed of [false,true]){save.sideQuests[q.id]={...save.sideQuests[q.id],progress:q.required,claimed};await load(`localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(JSON.stringify(save))});`);await b.press('j');await b.click('[data-quest-filter="all"]');await wait(200);text=await b.evaluate('document.querySelector(".popup-quest").innerText');assert.ok(text.includes(claimed?q.lines.claimed:q.lines.complete));}
 checks.push('Actual quest journal: complete and claimed responses');await b.press('Escape');
 // Isolated visual combat fixture: real World, Game, Renderer and HUD helpers.
 // It does not mutate the running game's enemies, position or save.
 await b.evaluate(`(async()=>{
  const [{World},{Game},{Renderer},{makeEnemy},{ELITES,BOSSES,BOSS_LINES},{updateTargetIdentity},{atlasPanel,mountAtlas}]=await Promise.all(['world.js','engine.js','renderer.js','encounters.js','content/index.js','enemy-ui.js','atlas-ui.js'].map(p=>import(new URL(p,location.href))));
  const w=new World(await(await fetch(new URL('data/mertloch.json',location.href))).json()),g=new Game(w),boss=g.enemies.find(e=>e.type==='boss');
  Object.assign(g.player,w.findClear(boss.x-55,boss.y+40,9));g.target=boss;g.quest.accepted=true;
  const canvas=document.createElement('canvas');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';document.querySelector('#world').after(canvas);
  const r=new Renderer(canvas,w,g);r.draw();
  const elite=makeEnemy({x:boss.x+65,y:boss.y+10},9999,ELITES.alphaBoar);g.enemies.push(elite);
  const review={g,r,boss,elite,canvas,run:true,view:e=>{g.target=e;},draw:()=>{r.resize();r.draw();updateTargetIdentity(document,g.target);document.querySelector('#targetPanel').classList.remove('hidden');r.map(document.querySelector('#minimap'));},atlas:()=>{const panel=document.createElement('div');panel.className='game-popup';panel.style.cssText='position:absolute;left:330px;top:150px;width:900px;max-height:650px;overflow:auto;z-index:200;padding:20px';panel.innerHTML=atlasPanel();document.querySelector('#gameShell').append(panel);const api=mountAtlas(panel,r,()=>{});panel.querySelector('#atlasCreatures').click();return panel;}};
  window.__handoffReview=review;
  function frame(){if(!review.run)return;review.draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
  g.startCast(boss);
 })()`);await wait(300);assert.equal(await b.evaluate('window.__handoffReview.r.bossSpeech.bubbles.size'),1);assert.ok(await b.evaluate('document.querySelector("#targetTitle").textContent.includes("Vorstand")'));await screenshot('desktop-boss');
 await b.evaluate('window.__handoffReview.view(window.__handoffReview.elite)');await wait(150);assert.match(await b.evaluate('document.querySelector("#targetLevel").textContent'),/ELITE/);assert.match(await b.evaluate('document.querySelector("#targetTitle").textContent'),/Alphakeiler/);await screenshot('desktop-elite');
 await b.evaluate('window.__handoffMap=window.__handoffReview.atlas()');await wait(200);assert.ok(await b.evaluate('!!document.querySelector(".elite-key")'));await screenshot('desktop-atlas');await b.evaluate('window.__handoffMap.remove()');
 for(const [width,height,name] of [[390,844,'phone'],[844,390,'landscape']]){
  await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await b.evaluate('window.__handoffReview.view(window.__handoffReview.boss)');await wait(400);assert.ok(await b.evaluate('window.__handoffReview.r.speechLayout.length===1'),'Boss bubble remains visible at '+name);await screenshot(name+'-boss');
  const bounds=await b.evaluate('(()=>{const p=document.querySelector("#targetPanel").getBoundingClientRect(),t=document.querySelector("#targetTitle").getBoundingClientRect();return {right:p.right,bottom:p.bottom,titleBottom:t.bottom,width:innerWidth,height:innerHeight,touch:document.body.classList.contains("touch-mode")};})()');assert.ok(await b.evaluate('getComputedStyle(document.querySelector("#targetLevel")).display!=="none"'));assert.ok(await b.evaluate(`(()=>{const {r}=window.__handoffReview,z=r.zoom;return r.speechLayout.every(a=>['#targetPanel','.player-panel','#touchMenu','#touchActions'].every(selector=>{const b=document.querySelector(selector).getBoundingClientRect();return a.x*z>=b.right||a.x*z+a.w*z<=b.left||a.y*z>=b.bottom||a.y*z+a.h*z<=b.top;}));})()`),'Speech stays clear of touch HUD');assert.ok(bounds.touch);assert.ok(bounds.right<=width&&bounds.bottom<=height&&bounds.titleBottom<=bounds.bottom);
 }
 await b.evaluate('(()=>{const {g,boss}=window.__handoffReview;boss.hp=boss.maxHp*.45;g.startCast(boss);})()');await wait(100);assert.ok(await b.evaluate('window.__handoffReview.r.bossSpeech.bubbles.get(window.__handoffReview.boss).text.includes("DOKUMENTIERT")'));
 await b.evaluate('(()=>{const {g,boss}=window.__handoffReview;g.kill(boss);})()');await wait(100);assert.ok(await b.evaluate('window.__handoffReview.r.bossSpeech.bubbles.size===1'));await screenshot('landscape-defeat');
 await b.evaluate('window.__handoffReview.g.time+=3');await wait(100);assert.equal(await b.evaluate('window.__handoffReview.r.bossSpeech.bubbles.size'),0);
 checks.push('Isolated real-engine/render fixture: elite target + crown on atlas/minimap, Horst engage/phase/death, exact 3-second expiry; desktop and both touch orientations');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/checks.json',JSON.stringify({url,checks,errors:b.errors},null,2));console.log(JSON.stringify({url,checks}));
}finally{
 if(backup){await load(`for(const k of Object.keys(localStorage))if(k.startsWith('mertloch'))localStorage.removeItem(k);for(const [k,v] of Object.entries(${JSON.stringify(backup)}))localStorage.setItem(k,v);`);}
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(2024,900);await b.send('Network.setBypassServiceWorker',{bypass:false});await b.send('Network.setCacheDisabled',{cacheDisabled:false});b.close();
}
