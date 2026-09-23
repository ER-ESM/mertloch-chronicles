import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/companion-aid';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9392),serverPort:4198});
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`),checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
async function tapPoint(p,touch=false){if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await wait(180);}
async function click(selector,touch=false){const p=await run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};`);assert.ok(await run(`return !!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)});`),selector+' accessible');await tapPoint(p,touch);}
async function healKey(){const key=await run(`const {actionBar,SLOT_KEYS}=await import('./rpg.js');return SLOT_KEYS[actionBar(g).indexOf('heal')];`);assert.ok(key);await b.press(key);}
async function fixture(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:10,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200,inventory:[]}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await wait(1200);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 await run(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());g.tutorial.completed=true;g.enemies=[];g.companions=[];g.paused=false;g.hireCompanion('merc-hopfen-horst',{free:true});g.hireCompanion('merc-radler-rita',{free:true});
 for(const [i,c]of g.companions.entries())Object.assign(c,{x:g.player.x+(i?110:-90),y:g.player.y+85,order:'stay',stance:'passive',inCombat:999,hp:c.maxHp-300});
 const {spawnArena}=await import('./arena.js');const [e]=spawnArena(g,{kind:'wolf'});Object.assign(e,{x:g.player.x+200,y:g.player.y,stun:999});g.player.hp=g.player.maxHp;g.player.energy=100;g.gcd=0;g.cooldowns.heal=0;g.stopAuto();`);await wait(300);
}
try{
 await b.resize(1440,1000);await fixture();
 await click('[data-companion-select="merc-hopfen-horst"]');assert.equal(await run('return g.companionAidId;'),'merc-hopfen-horst');assert.equal(await run('return !!g.target;'),true);assert.equal(await run('return !!document.querySelector(".popup-companions");'),false);
 assert.equal(await run('return document.querySelector(".companion-frame.is-selected").getAttribute("aria-pressed");'),'true');
 const hp=await run('return g.companions[0].hp;');await healKey();await wait(350);assert.ok(await run(`return g.companions[0].hp>${hp}&&g.cooldowns.heal>0&&g.player.hp===g.player.maxHp;`));
 await b.press('v');await click('[data-meter-mode="healing"]');assert.match(await run('return document.querySelector(".meter-rows").textContent;'),/Dieter/);await b.screenshot(dir+'/desktop-heal.jpg');await b.press('v');
 pass('Party frame selects without opening management or losing the enemy; healing key works at full player health and credits player healing');
 // Real click in the world, away from enemy hit boxes and interface controls.
 const point=await run(`const c=g.companions[1],r=__mertloch.renderer,box=r.canvas.getBoundingClientRect();return{x:box.left+(c.x-r.viewOrigin.x)*box.width/r.viewWidth,y:box.top+(c.y-10-r.viewOrigin.y)*box.height/r.viewHeight};`);
 await tapPoint(point);assert.equal(await run('return g.companionAidId;'),'merc-radler-rita');
 await click('[data-companion-select=""]');assert.equal(await run('return g.companionAidId;'),null);
 await run('g.target=null;g.stopAuto();');await tapPoint(point);assert.equal(await run('return g.companionAidId;'),'merc-radler-rita');await wait(150);assert.match(await run('return document.querySelector("#targetName").textContent;'),/Radler-Rita/);assert.match(await run('return document.querySelector("#targetHp").textContent;'),/\//);
 await run('g.companions[1].x=g.player.x+600;g.cooldowns.heal=0;g.gcd=0;');await healKey();assert.equal(await run('return g.cooldowns.heal;'),0);/* Rahmen aktualisiert sich mit dem HUD-Takt (100 ms) */await wait(300);assert.ok(await run('return document.querySelector(".companion-frame.is-selected").classList.contains("aid-unavailable");'));
 pass('World selection, friendly target health, explicit self-selection and range failure without cooldown');
 await click('[data-companion-manage=""]');assert.ok(await run('return !!document.querySelector(".popup-companions");'));await b.press('Escape');
 await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await fixture(true);
 await click('[data-companion-select="merc-hopfen-horst"]',true);const mobileHp=await run('return g.companions[0].hp;');
 if(!await run(`return !!document.querySelector('[data-touch-skill="heal"]');`))await click('#touchPage',true);
 await click('[data-touch-skill="heal"]',true);
 await wait(350);assert.ok(await run(`return g.companions[0].hp>${mobileHp};`));await b.screenshot(dir+'/touch-heal.jpg');
 assert.ok(await run(`const panel=document.querySelector('.companion-frames').getBoundingClientRect();return [...document.querySelectorAll('#targetPanel,#targetDebuffStrip,#touchActions,#touchStick,#touchUtility')].every(el=>{const r=el.getBoundingClientRect();return !r.width||!r.height||Math.min(r.right,panel.right)<=Math.max(r.left,panel.left)||Math.min(r.bottom,panel.bottom)<=Math.max(r.top,panel.top);});`),'group frames do not overlap target, auras or touch controls');
 await click('[data-companion-select="merc-hopfen-horst"]',true);assert.equal(await run('return g.companionAidId;'),null);
 assert.ok(await run(`return [...document.querySelectorAll('.companion-frames button')].every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44;});`));
 pass('Touch frame selection, healing, toggle back to self and 44px controls');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(error){try{await b.screenshot(dir+'/failure.jpg');}catch{}throw error;}finally{await b.close();}
