// Browserabnahme E-53: Rucksackfilter, Sortierung, deutsche Suche, Vergleich im Tooltip, Werte auf der Figurenseite.
// Desktop 2024×900 und Handy 390×844 mit Touch. Aufruf: node scripts/bag-check.mjs [url]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/bag-20260923';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9399,serverPort:4209}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
async function until(expression){for(let i=0;i<80;i++){if(await read(expression))return;await wait(100);}throw Error('Timeout: '+expression);}
async function point(selector){const p=await read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();return r&&r.width?{x:r.left+r.width/2,y:r.top+r.height/2}:null})()`);assert.ok(p,'sichtbar: '+selector);return p;}
async function click(selector,touch=false){const p=await point(selector);
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)})`),'frei klickbar: '+selector);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
 await wait(150);}
const visibleItems=`[...document.querySelectorAll('.popup-bag [data-item]')].filter(el=>!el.hidden).map(el=>el.dataset.item)`;
async function load(touch){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:11,trainingXp:140,tutorial:{version:1,step:8,completed:true},
  rpg:{version:4,coins:200,inventory:[{id:'brezel',count:3},{id:'kabel',count:10},{id:'kutte',count:1},{id:'pfandring',count:1},{id:'dosenbrecher',count:1},{id:'blechtalisman',count:1}]}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];game.player.inCombat=0;`);await wait(4000);
}
async function openBag(){await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(200);await b.press('i');await until(`!!document.querySelector('.popup-bag [data-bag-filter]')`);await wait(400);}
try{
 // ---------- Desktop 2024×900
 await b.resize(2024,900);await load(false);await openBag();
 await read(`localStorage.removeItem('mertloch-bag-view')`);
 await click('[data-bag-filter="gear"]');
 assert.deepEqual((await read(visibleItems)).sort(),['blechtalisman','dosenbrecher','kutte','pfandring']);
 await click('[data-bag-filter="better"]');const better=await read(visibleItems);
 assert.ok(better.length>0&&!better.includes('brezel')&&!better.includes('kabel'),'Besser zeigt nur Ausrüstung mit ▲: '+better);
 await click('[data-bag-filter="food"]');assert.deepEqual(await read(visibleItems),['brezel']);
 await click('[data-bag-filter="all"]');assert.equal((await read(visibleItems)).length,6);
 checks.push('desktop: Filter Ausrüstung/Besser/Verpflegung/Alles');
 // Deutsche Suche: Art und Wertname
 await read(`(()=>{const i=document.querySelector('[data-bag-search]');i.value='verpflegung';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
 assert.deepEqual(await read(visibleItems),['brezel']);
 await read(`(()=>{const i=document.querySelector('[data-bag-search]');i.value='bastelgrips';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
 assert.ok((await read(visibleItems)).includes('pfandring'));
 await read(`(()=>{const i=document.querySelector('[data-bag-search]');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
 await read(`(()=>{const i=document.querySelector('[data-bag-search]');i.value='tempo';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
 assert.ok((await read(visibleItems)).includes('dosenbrecher'),'Suche nach einer Wirkung findet Waffen');
 await read(`(()=>{const i=document.querySelector('[data-bag-search]');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
 checks.push('desktop: Suche findet „Verpflegung“, Wertnamen und Wirkungen („Tempo“)');
 // Sortieren nach Güte, Auswahl bleibt nach Neuaufbau erhalten
 await read(`(()=>{const s=document.querySelector('[data-bag-sort-mode]');s.value='rarity';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 await click('[data-sort-bag]');await wait(300);
 assert.equal(await read(`game.rpg.inventory[0].id`),'pfandring');
 assert.equal(await read(`document.querySelector('[data-bag-sort-mode]').value`),'rarity');
 checks.push('desktop: Sortieren nach Güte, Wahl bleibt nach dem Neuaufbau');
 // Filter wird gemerkt
 await click('[data-bag-filter="gear"]');await openBag();
 assert.equal(await read(`document.querySelector('[data-bag-filter="gear"]').getAttribute('aria-pressed')`),'true');
 assert.equal((await read(visibleItems)).length,4);await click('[data-bag-filter="all"]');
 checks.push('desktop: Filter bleibt beim erneuten Öffnen');
 // Tooltip mit Wirkungen und Vergleich
 const p=await point('.popup-bag [data-item="dosenbrecher"]');await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await until(`!document.querySelector('#itemTooltip').classList.contains('hidden')`);await wait(300);
 const tip=await read(`(()=>{const t=document.querySelector('#itemTooltip');return {compare:!!t.querySelector('.tooltip-compare .compare-changes span'),line:t.querySelector('.stat-line')?.textContent||'',chips:[...t.querySelectorAll('.compare-changes>span')].map(s=>s.textContent)}})()`);
 assert.ok(tip.compare,'Vergleich im Tooltip');assert.match(tip.line,/Wumms.*Schaden \+/);
 await shot('tooltip-desktop');checks.push('desktop: Tooltip „'+tip.line+'“, Vergleich: '+tip.chips.join(' · '));
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});await wait(500);await shot('rucksack-desktop');
 // Anlegen per Doppelklick meldet sich (Playtest-Befund: vorher stumm)
 await read(`document.querySelector('.popup-bag [data-item="dosenbrecher"]').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))`);await wait(400);
 assert.equal(await read(`game.rpg.equipment.weapon`),'dosenbrecher');
 assert.ok(await read(`game.events.some(e=>e.type==='toast'&&/^Angelegt: Dosenbrecher · Haupthand$/.test(e.text))||[...document.querySelectorAll('[class*=toast]')].some(t=>/Angelegt: Dosenbrecher/.test(t.textContent))`),'Meldung nach dem Anlegen');
 checks.push('desktop: Doppelklick legt an und meldet „Angelegt: Dosenbrecher · Haupthand“');
 // Figurenseite
 await b.press('c');await until(`document.querySelectorAll('.popup-person .stat-effect').length===5`);await read(`[...document.querySelectorAll('.popup-person .panel-tabs button')].find(x=>/Werte/i.test(x.textContent))?.click()`);await wait(400);
 const effects=await read(`[...document.querySelectorAll('.popup-person .stat-effect')].map(e=>e.textContent)`);
 assert.ok(effects.every(Boolean));await shot('figur-desktop');checks.push('desktop: Figur zeigt Wirkung je Wert: '+effects.join(' | '));
 // ---------- Handy 390×844 mit Touch
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.resize(390,844);await load(true);await openBag();
 const sizes=await read(`[...document.querySelectorAll('.popup-bag .bag-filter,.popup-bag [data-bag-sort-mode],.popup-bag [data-sort-bag]')].map(e=>Math.round(e.getBoundingClientRect().height))`);
 assert.ok(sizes.every(h=>h>=44),'Daumenziele ≥ 44 px: '+sizes);
 const fits=await read(`(()=>{const p=document.querySelector('.popup-bag').getBoundingClientRect();return p.left>=0&&p.right<=innerWidth&&document.querySelector('.popup-bag .popup-body').scrollWidth<=document.querySelector('.popup-bag .popup-body').clientWidth+1})()`);
 assert.ok(fits,'Rucksack ohne waagrechten Überlauf');
 await click('[data-bag-filter="gear"]',true);assert.equal((await read(visibleItems)).length,4);
 await wait(700);
 await shot('rucksack-phone');checks.push('phone: Filter per Tippen, Daumenziele ≥ 44 px, kein Überlauf');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));console.log(JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
