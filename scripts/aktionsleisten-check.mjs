// Aktionsleisten (2026-09-23): zwei Leisten ab Start, Kniff aus dem Clanbuch auf Leiste 2 ziehen (Hervorhebung während des Ziehens),
// Gegenstand aus dem Rucksack ziehen, Umsortieren, Herausziehen entfernt, Taste per Hover + B belegen, Tastenkonflikt,
// Maustaste 4 belegen und auslösen, Rechtsklickmenü, dritte Leiste über Spielmenü → Einstellungen. Vollbild 2024×900.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/aktionsleisten';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9477,serverPort:4277}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.png');
const mouse=(type,x,y,button='none',buttons=0)=>b.send('Input.dispatchMouseEvent',{type,x,y,button,buttons,clickCount:type==='mouseMoved'?0:1});
const center=sel=>read(`(()=>{const el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;el.scrollIntoView?.({block:'nearest'});const r=el.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
const slot=i=>`.action-area .action-bar [data-action-slot="${i}"]`;
const bar=()=>read('window.mertloch.state().actionBar');
const keyOf=i=>read(`(document.querySelector('${slot(i)} .key')?.textContent||'')`);
async function drag(fromSel,to,{shotName,steps=8}={}){const a=await center(fromSel);assert.ok(a,'Quelle fehlt: '+fromSel);const z=typeof to==='string'?await center(to):to;assert.ok(z,'Ziel fehlt: '+to);
 await mouse('mouseMoved',a.x,a.y);await mouse('mousePressed',a.x,a.y,'left',1);
 for(let i=1;i<=steps;i++){await mouse('mouseMoved',Math.round(a.x+(z.x-a.x)*i/steps),Math.round(a.y+(z.y-a.y)*i/steps),'left',1);await wait(25);}
 await wait(120);const during=await read(`({ghost:!!document.querySelector('.drag-ghost'),ghostSize:(()=>{const g=document.querySelector('.drag-ghost');return g?Math.round(g.getBoundingClientRect().width):0;})(),barDrop:document.body.classList.contains('bar-drop'),remove:document.body.classList.contains('drag-remove'),over:document.querySelector('.drag-over')?.dataset.actionSlot??document.querySelector('.drag-over')?.className??null,emptyVisible:[...document.querySelectorAll('.action-area .skill.empty-slot')].every(el=>getComputedStyle(el).opacity==='1'),outlined:[...document.querySelectorAll('.action-area .action-bar')].every(el=>getComputedStyle(el).outlineStyle==='dashed')})`);
 if(shotName)await shot(shotName);
 await mouse('mouseReleased',z.x,z.y,'left',0);await wait(250);return during;}
async function hoverBind(i,press){const p=await center(slot(i));await mouse('mouseMoved',p.x,p.y);await wait(150);await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'b',code:'KeyB',windowsVirtualKeyCode:66});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'b',code:'KeyB',windowsVirtualKeyCode:66});await wait(150);
 const capturing=await read(`!!document.querySelector('${slot(i)}.key-capture')&&!document.querySelector('.bind-capture').hidden`);assert.ok(capturing,'Belegungsmodus nach Hover + B an Platz '+i);await press();await wait(200);}
const key=async(code,key,vk,mods=0)=>{await b.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:vk,modifiers:mods});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk,modifiers:mods});};
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,trainingXp:900,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50,actionBars:{dieter:['auto','strike','buff','throw','parry','mark',null,null,'item:wasser','item:brezel']}}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(6000);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];game.player.inCombat=0;`);await wait(400);
 // 1 Zwei Leisten ab Start, alte Belegung (eine Leiste) liegt unverändert auf Leiste 1.
 let s=await bar();assert.equal(s.length,20,'zwei Leisten');assert.deepEqual(s.slice(0,6),['auto','strike','buff','throw','parry','mark']);
 assert.equal(await read(`document.querySelectorAll('.action-area .action-bar').length`),2);assert.equal(await keyOf(0),'1');assert.equal(await keyOf(12),'⇧3');
 await shot('01-zwei-leisten');checks.push('two bars from the start, old single-bar save migrated to bar 1, bar 2 labelled ⇧1…⇧0');
 // 2 Clanbuch → Kniffe: keine Aktionsplätze mehr; Kniff auf Leiste 2 ziehen.
 await b.press('k');await wait(700);
 assert.equal(await read(`document.querySelectorAll('.popup-book [data-bind-slot],.popup-book .binding-slots').length`),0,'das Kniffe-Menü zeigt keine Aktionsplätze mehr');
 {const p=await center('[data-book-skill="strike"]');await mouse('mouseMoved',p.x,p.y);await wait(300);/* Runde 1 (2026-09-24): keine Bedienhilfe mehr im Kniff-Tooltip, Ziehen/Belegen steht in der Hilfe */assert.doesNotMatch(await read("document.querySelector('#itemTooltip').textContent"),/Aktionsleiste ziehen/,'Kniff-Tooltip ohne Bedienhilfe');await shot('02a-kniff-tooltip');}
 const skill=await read(`[...document.querySelectorAll('[data-book-skill]')].find(el=>!el.classList.contains('locked')&&!['dash','interrupt'].includes(el.dataset.bookSkill)&&!window.mertloch.state().actionBar.includes(el.dataset.bookSkill))?.dataset.bookSkill||'burst'`);
 let during=await drag(`[data-book-skill="${skill}"]`,slot(12),{shotName:'02-kniff-ziehen'});
 assert.ok(during.ghost&&during.ghostSize<=44,'nur ein kleines Symbol wandert mit: '+JSON.stringify(during));assert.ok(during.barDrop&&during.outlined&&during.emptyVisible,'Leisten hervorgehoben, leere Plätze sichtbar: '+JSON.stringify(during));assert.equal(during.over,'12','Zielplatz markiert');
 s=await bar();assert.equal(s[12],skill,'Kniff liegt auf Leiste 2, Platz 3');assert.equal(await read(`!!document.querySelector('.drag-ghost')`),false,'Symbol verschwindet nach dem Loslassen');
 checks.push(`book skill ${skill} dragged onto bar 2 (40 px ghost, bars outlined, empty slots shown, target slot marked)`);
 // 3 Gegenstand aus dem Rucksack ziehen.
 await read(`game.rpg.inventory.push({id:'currywurst',count:2});game.emit('rpgChanged');`);await b.press('i');await wait(700);
 during=await drag(`[data-item="currywurst"]`,slot(15),{shotName:'03-gegenstand-ziehen'});assert.ok(during.barDrop&&during.ghost,'Verpflegung hebt die Leisten hervor');
 s=await bar();assert.equal(s[15],'item:currywurst');checks.push('bag item (Currywurst) dragged onto bar 2');
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(300);
 // 4 Umsortieren: Platz 3 von Leiste 2 auf Platz 1 von Leiste 1 – die beiden tauschen.
 await drag(slot(12),slot(0),{shotName:'04-umsortieren'});s=await bar();assert.equal(s[0],skill);assert.equal(s[12],'auto');checks.push('reorder across bars swaps the two slots');
 // 5 Entfernen: Leisteneintrag neben die Leiste ziehen.
 during=await drag(slot(15),{x:1000,y:420},{shotName:'05-entfernen'});assert.ok(during.remove,'Entfernen wird angezeigt');s=await bar();assert.equal(s[15],null,'Gegenstand verlässt die Leiste');
 assert.equal(await read(`game.rpg.inventory.some(e=>e.id==='currywurst')`),true,'der Gegenstand bleibt im Rucksack');checks.push('dropping a bar entry outside the bars removes it (item stays in the bag)');
 // 6 Taste per Hover + B belegen (E auf Leiste 2, Platz 2).
 await hoverBind(11,async()=>{await shot('06-taste-belegen');await key('KeyE','e',69);});
 assert.equal(await read(`game.rpg.barKeys[11]`),'KeyE');assert.equal(await keyOf(11),'E');checks.push('hover + B, then E binds bar 2 slot 2 to E');
 await read(`window.__actions=[];{const a=game.action.bind(game);game.action=(...x)=>{window.__actions.push(x[0]);return a(...x);};}`);
 // 7 Konflikt: Taste 1 auf Leiste 2, Platz 5 – Platz 1 von Leiste 1 verliert sie.
 await hoverBind(14,()=>key('Digit1','1',49));
 assert.equal(await read(`game.rpg.barKeys[14]`),'Digit1');assert.equal(await read(`game.rpg.barKeys[0]`),'');assert.equal(await keyOf(0),'');
 /* Runde 2b: Kurzmeldungen laufen nacheinander (toast-queue.js) – die Meldung kann kurz hinter der vorigen warten */let toast='';for(let i=0;i<30&&!/lag vorher/.test(toast);i++){toast=await read(`[...document.querySelectorAll('.toast,#toast,[class*=toast]')].map(t=>t.textContent).join(' | ')`);if(!/lag vorher/.test(toast))await wait(100);}assert.match(toast,/lag vorher auf Leiste 1 · Platz 1/,'Hinweis auf gelöste Belegung: '+toast);
 await shot('07-konflikt');checks.push('conflict: binding 1 to bar 2 slot 5 clears it from bar 1 slot 1 with a hint');
 // 8 Gesperrte Taste (W) bleibt im Belegungsmodus mit Grund, Esc bricht ab.
 await hoverBind(16,async()=>{await key('KeyW','w',87);});assert.equal(await read(`!document.querySelector('.bind-capture').hidden&&/fest vergeben/.test(document.querySelector('.bind-capture').textContent)`),true);
 await shot('08-gesperrt');await key('Escape','Escape',27);await wait(150);assert.equal(await read(`document.querySelector('.bind-capture').hidden`),true);assert.equal(await read(`game.rpg.barKeys[16]`),undefined);
 checks.push('reserved key W is refused with a reason, Esc cancels');
 // 9 Maustaste 4 belegen und auslösen.
 await hoverBind(16,async()=>{const p=await center(slot(16));await mouse('mousePressed',p.x,p.y,'back',8);await mouse('mouseReleased',p.x,p.y,'back',0);});
 assert.equal(await read(`game.rpg.barKeys[16]`),'Mouse3');assert.equal(await keyOf(16),'M4');
 await read(`(()=>{const bar=game.rpg.actionBars.dieter;bar[16]='mark';bar[5]=null;bar[11]='strike';bar[1]=null;bar[14]='throw';bar[3]=null;game.emit('barChanged');})()`);await wait(200);
 const href=await read('location.href');await mouse('mouseMoved',1300,420);await mouse('mousePressed',1300,420,'back',8);await mouse('mouseReleased',1300,420,'back',0);await wait(300);
 assert.deepEqual(await read('window.__actions'),['mark'],'Maustaste 4 löst den Platz aus');assert.equal(await read('location.href'),href,'kein Browser-Zurück');
 await key('KeyE','e',69);await wait(100);assert.deepEqual(await read('window.__actions'),['mark','strike'],'E löst Leiste 2, Platz 2 aus');
 await key('Digit1','1',49,8);await wait(100);assert.equal((await read('window.__actions')).length,2,'Umschalt+1 ist nicht belegt');
 await key('Digit1','1',49);await wait(100);assert.equal((await read('window.__actions'))[2],'throw','1 löst jetzt Leiste 2, Platz 5 aus');
 // Mausrad-Klick
 await hoverBind(17,async()=>{const p=await center(slot(17));await mouse('mousePressed',p.x,p.y,'middle',4);await mouse('mouseReleased',p.x,p.y,'middle',0);});assert.equal(await keyOf(17),'M3');
 await shot('09-maustasten');checks.push('mouse button 4 bound (label M4) and fires the slot on the playfield without navigating back; wheel click binds as M3; E fires its slot');
 // 10 Rechtsklickmenü am Platz.
 {const p=await center(slot(11));await mouse('mouseMoved',p.x,p.y);await mouse('mousePressed',p.x,p.y,'right',2);await mouse('mouseReleased',p.x,p.y,'right',0);await wait(200);
  const items=await read(`[...document.querySelectorAll('.context-menu button')].map(b=>b.textContent)`);assert.ok(items.some(t=>t.startsWith('Taste belegen'))&&items.some(t=>t.startsWith('Platz leeren')),JSON.stringify(items));await shot('10-rechtsklick');
  await read(`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent.startsWith('Taste belegen')).click()`);await wait(150);assert.equal(await read(`!!document.querySelector('${slot(11)}.key-capture')`),true);await key('Delete','Delete',46);await wait(150);assert.equal(await read(`game.rpg.barKeys[11]`),'');assert.equal(await keyOf(11),'');}
 checks.push('right-click menu offers Taste belegen / Taste löschen / Platz leeren; Entf clears the key');
 // 11 Dritte Leiste über Spielmenü → Einstellungen.
 /* Runde 2a: Einstellungen sind ein eigenes Fenster aus dem Spielmenü */await read(`document.querySelector('#gameMenuButton').click()`);await wait(500);
 await read(`document.querySelector('.popup-menu [data-shell="settings"]')?.click()`);await wait(400);
 assert.ok(await center('[data-bar-settings]'),'Einstellung Aktionsleisten fehlt');await shot('11-einstellungen');
 await read(`document.querySelector('[data-bar-count="1"]').click()`);await wait(300);
 assert.equal(await read('game.rpg.barCount'),3);assert.equal(await read(`document.querySelectorAll('.action-area .action-bar').length`),3);assert.equal(await read(`document.querySelector('[data-bar-settings] output').textContent`),'3');
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(300);
 during=await drag(slot(11),slot(22),{shotName:'12-drei-leisten-ziehen'});assert.equal((await bar())[22],'strike');assert.equal(await keyOf(22),'','Leiste 3 startet ohne Tasten');
 await shot('13-drei-leisten');checks.push('third bar added in Spielmenü → Einstellungen, starts without keys, accepts drops');
 // 12 Speichern und neu laden: Leisten, Tasten und Belegung bleiben.
 const before={bar:await bar(),keys:await read('game.rpg.barKeys'),count:await read('game.rpg.barCount')};
 await read('window.mertloch.save?.()');await read(`dispatchEvent(new Event('pagehide'))`);await wait(300);
 await b.goto(b.url);await wait(2500);await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(800);
 const after={bar:await bar(),keys:await read('game.rpg.barKeys'),count:await read('game.rpg.barCount')};
 assert.deepEqual(after,before,'nach dem Neuladen unverändert');assert.equal(await keyOf(16),'M4');checks.push('bars, keys and count survive a reload');
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:[]},null,2));console.log('PASS aktionsleisten:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);try{await shot('failure');}catch{}process.exitCode=1;}
finally{await b.close();}
