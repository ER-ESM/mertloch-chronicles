// Ein Ziel (E-65) im echten Browser: Söldner, Gegner oder nichts – Heilung folgt dem einen Ziel, ohne Ziel heilt sie dich.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/companion-aid';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9392),serverPort:4198});
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`),checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
async function tapPoint(p,touch=false){if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await wait(180);}
async function click(selector,touch=false){const p=await run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};`);assert.ok(await run(`return !!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)});`),selector+' accessible');await tapPoint(p,touch);}
async function healKey(){const key=await run(`const {actionBar,SLOT_KEYS}=await import('./rpg.js');return SLOT_KEYS[actionBar(g).indexOf('heal')];`);assert.ok(key);await run('g.gcd=0;g.cooldowns.heal=0;');await b.press(key);await wait(350);}
/** Bildschirmpunkt einer Weltposition (Körpermitte, wie der Treffertest). */
const screen=expr=>run(`const u=${expr},r=__mertloch.renderer,box=r.canvas.getBoundingClientRect();return{x:box.left+(u.x-r.viewOrigin.x)*box.width/r.viewWidth,y:box.top+(u.y-10-r.viewOrigin.y)*box.height/r.viewHeight};`);
const pick=()=>run(`return {enemy:g.target?g.target.name:null,friend:g.friend?.ref?.id||g.friend?.kind||null,auto:g.autoAttack.enabled};`);
const hp=()=>run(`return {me:g.player.hp,horst:g.companions[0].hp,rita:g.companions[1].hp};`);
async function fixture(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:10,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200,inventory:[]}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await wait(1200);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 // Aufstellung im Freien: neue Helden starten seit E-52 in der Bude, Begleiter stünden sonst hinter der Wand. Nach dem Sprung Szene und Rahmen zur Ruhe kommen lassen.
 await run(`Object.assign(g.player,{x:g.world.spawn.x,y:g.world.spawn.y});g.moveTo=null;g.path=[];`);await wait(1500);
 await run(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());g.tutorial.completed=true;g.enemies=[];g.companions=[];g.paused=false;g.hireCompanion('merc-hopfen-horst',{free:true});g.hireCompanion('merc-radler-rita',{free:true});
 for(const [i,c]of g.companions.entries())Object.assign(c,{x:g.player.x+(i?110:-90),y:g.player.y+85,order:'stay',stance:'passive',inCombat:999,hp:c.maxHp-300});
 const {spawnArena}=await import('./arena.js');const [e]=spawnArena(g,{kind:'wolf'});Object.assign(e,{x:g.player.x+200,y:g.player.y,stun:999,attackTimer:999,autoTimer:999,damage:0});g.player.hp=g.player.maxHp-250;g.player.energy=100;g.gcd=0;g.cooldowns.heal=0;g.stopAuto();`);await wait(300);
}
try{
 await b.resize(1440,1000);await fixture();
 assert.ok((await pick()).enemy,'Ausgangslage: Gegner gewählt');await run('g.startAttack();');assert.equal((await pick()).auto,true);
 assert.equal(await run('return !!document.querySelector(".companion-frames [data-companion-select=\\"\\"]");'),false,'kein „Selbst“-Knopf mehr');
 assert.doesNotMatch(await run('return document.body.innerText;'),/hilfs\s*ziel/i);
 // 1. Söldner anklicken → er ist das Ziel, der Gegner ist abgewählt, der Autoangriff stoppt.
 await click('[data-companion-select="merc-hopfen-horst"]');await wait(150);
 assert.deepEqual(await pick(),{enemy:null,friend:'merc-hopfen-horst',auto:false});assert.equal(await run('return !!document.querySelector(".popup-companions");'),false);
 assert.equal(await run('return document.querySelector(".companion-frame.is-selected").getAttribute("aria-pressed");'),'true');
 assert.match(await run('return document.querySelector("#targetName").textContent;'),/Hopfen-Horst/);assert.ok(await run('return document.querySelector("#targetPanel").classList.contains("friendly-target");'));
 // 2. Heilung → heilt den Söldner, nicht dich.
 let before=await hp();await healKey();let after=await hp();assert.ok(after.horst>before.horst,'Söldner geheilt');assert.equal(after.me,before.me,'du bleibst ungeheilt');
 await b.press('v');await click('[data-meter-mode="healing"]');assert.match(await run('return document.querySelector(".meter-rows").textContent;'),/Dieter/);await b.screenshot(dir+'/desktop-heal-companion.jpg');await b.press('v');
 pass('Söldner anklicken: einziges Ziel, Gegner abgewählt, Autoangriff aus; Heilung heilt ihn und zählt für dich');
 // 3. Gegner anklicken → Söldner abgewählt; Heilung → heilt dich.
 await tapPoint(await screen('g.enemies[0]'));assert.deepEqual(await pick(),{enemy:await run('return g.enemies[0].name;'),friend:null,auto:false});
 assert.equal(await run('return document.querySelector(".companion-frame.is-selected");'),null);
 before=await hp();await healKey();after=await hp();assert.ok(after.me>before.me,'Heilung auf dich');assert.equal(after.horst,before.horst,'Söldner bleibt ungeheilt');
 pass('Gegner anklicken löst den Söldner ab; Heilung heilt dich');
 // 4. Escape → nichts gewählt (das Spielmenü öffnet erst das nächste Esc); Heilung → heilt dich.
 await b.press('Escape');await wait(150);assert.deepEqual(await pick(),{enemy:null,friend:null,auto:false});assert.equal(await run('return !!document.querySelector(".popup-menu,[data-popup=\\"menu\\"]:not(.hidden)");'),false);
 await run('g.player.hp=g.player.maxHp-250;');before=await hp();await healKey();after=await hp();assert.ok(after.me>before.me,'ohne Ziel heilt sie dich');assert.equal(after.horst,before.horst);
 await b.press('Escape');await wait(200);assert.ok(await run('return [...document.querySelectorAll("button")].some(b=>b.getClientRects().length&&/Zurück zum Spiel/.test(b.textContent));'),'zweites Esc öffnet das Spielmenü');await b.press('Escape');await wait(150);
 pass('Esc wählt ab, erst das nächste Esc öffnet das Spielmenü; ohne Ziel heilt die Heilung dich');
 // 5. Weltklick auf den zweiten Söldner; Zielrahmen freundlich mit Leben; Klick ins Leere wählt ab.
 const rita=await screen('g.companions[1]');await tapPoint(rita);assert.equal((await pick()).friend,'merc-radler-rita');await wait(150);
 assert.match(await run('return document.querySelector("#targetName").textContent;'),/Radler-Rita/);assert.match(await run('return document.querySelector("#targetHp").textContent;'),/\//);await b.screenshot(dir+'/desktop-target-frame.jpg');
 // Freier Bodenpunkt: keine Einheit, kein Hindernis, und am Bildschirm liegt dort wirklich die Welt (kein HUD-Fenster darüber).
 const empty=await run(`const {unitAt}=await import('./target-ui.js'),r=__mertloch.renderer,box=r.canvas.getBoundingClientRect();
  for(const [dx,dy] of [[60,-60],[-60,-70],[0,-110],[130,40],[-150,30],[0,160]]){const p={x:g.player.x+dx,y:g.player.y+dy},s={x:box.left+(p.x-r.viewOrigin.x)*box.width/r.viewWidth,y:box.top+(p.y-r.viewOrigin.y)*box.height/r.viewHeight};
   if(!unitAt(g,p.x,p.y)&&!g.world.blocked(p.x,p.y,3)&&document.elementFromPoint(s.x,s.y)?.closest('#world'))return s;}return null;`);assert.ok(empty,'freier Punkt');
 await tapPoint(empty);assert.deepEqual(await pick(),{enemy:null,friend:null,auto:false});
 pass('Weltklick wählt den Söldner, Zielrahmen zeigt Name und Leben; Klick ins Leere wählt ab');
 // 6. Außer Reichweite: keine Abklingzeit, Rahmen markiert.
 await tapPoint(rita);await run('g.companions[1].x=g.player.x+600;');await healKey();assert.equal(await run('return g.cooldowns.heal;'),0);/* Rahmen aktualisiert sich mit dem HUD-Takt (100 ms) */await wait(300);assert.ok(await run('return document.querySelector(".companion-frame.is-selected").classList.contains("target-unavailable");'));
 assert.doesNotMatch(await run('return document.body.innerText;'),/hilfs\s*ziel/i);
 pass('Ziel außer Reichweite: keine Abklingzeit, Rahmen markiert, Meldung ohne das alte Zweitziel-Wort');
 await click('[data-companion-manage=""]');assert.ok(await run('return !!document.querySelector(".popup-companions");'));await b.press('Escape');
 await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await fixture(true);
 await click('[data-companion-select="merc-hopfen-horst"]',true);assert.equal((await pick()).friend,'merc-hopfen-horst');const mobileHp=await run('return g.companions[0].hp;');
 if(!await run(`return !!document.querySelector('[data-touch-skill="heal"]');`))await click('#touchPage',true);
 await click('[data-touch-skill="heal"]',true);
 await wait(350);assert.ok(await run(`return g.companions[0].hp>${mobileHp};`));await b.screenshot(dir+'/touch-heal.jpg');
 assert.ok(await run(`const panel=document.querySelector('.companion-frames').getBoundingClientRect();return [...document.querySelectorAll('#targetPanel,#targetDebuffStrip,#touchActions,#touchStick,#touchUtility')].every(el=>{const r=el.getBoundingClientRect();return !r.width||!r.height||Math.min(r.right,panel.right)<=Math.max(r.left,panel.left)||Math.min(r.bottom,panel.bottom)<=Math.max(r.top,panel.top);});`),'group frames do not overlap target, auras or touch controls');
 assert.ok(await run(`return [...document.querySelectorAll('.companion-frames button')].every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44;});`));
 pass('Touch: Rahmen antippen wählt den Söldner, Heilknopf heilt ihn, 44-px-Knöpfe');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(error){try{await b.screenshot(dir+'/failure.jpg');}catch{}throw error;}finally{await b.close();}
