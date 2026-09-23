// Minikarte (minimap.js): Zoom per Knopf und Mausrad, Lupe schaltet Symbolgruppen, Form/Größe bleiben nach Neuladen,
// Mouse-Over-Tooltip nennt den Namen, Klick öffnet weiter die Weltkarte, Umschalt+Klick läuft hin, HUD-Editor verschiebt die
// Minikarte, keine Konsolenfehler. Echte Maus-/Radereignisse über CDP. Bilder: visual-review/minimap/.
// Aufruf: node scripts/minimap-check.mjs   (CDP 9451, Server 4251; CDP_PORT/SERVER_PORT überschreiben)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createCharacter,characterKey} from '../characters.js';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/minimap';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9451),serverPort:Number(process.env.SERVER_PORT||4251)});
const read=s=>b.evaluate(s),checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
const mm=s=>read(`(()=>{const m=document.querySelector('#miniButton').minimap;return ${s};})()`);
const rect=sel=>read(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
const mouse=(type,x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',clickCount:type==='mouseMoved'?0:1,...extra});
async function clickAt(x,y,modifiers=0){await mouse('mouseMoved',x,y,{modifiers});await wait(30);await mouse('mousePressed',x,y,{modifiers});await wait(30);await mouse('mouseReleased',x,y,{modifiers});await wait(220);}
async function click(sel){const r=await rect(sel),x=r.x+r.width/2,y=r.y+r.height/2;assert.ok(await read(`!!document.elementFromPoint(${x},${y})?.closest(${JSON.stringify(sel)})`),'frei klickbar: '+sel);await clickAt(x,y);}
const shot=async(name,zoom=true)=>{await b.screenshot(dir+'/'+name+'.jpg');if(!zoom)return;const q=await rect('#miniButton'),x=Math.max(0,q.x-250),r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x,y:0,width:Math.min(2024-x,q.width+q.x-x+18),height:q.y+q.height+70,scale:3}});writeFileSync(dir+'/'+name+'-zoom.jpg',Buffer.from(r.data,'base64'));};
async function boot(extra=''){
 const made=createCharacter(null,{name:'Karten Pruefer',classId:'dieter',look:'dieter'}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',level:6,classId:'dieter',tutorial:{version:1,step:8,completed:true},rpg:{inventory:[],coins:200},professions:{learned:{herbs:12}}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete Navigator.prototype.serviceWorker;if(!sessionStorage.getItem("mm-check")){sessionStorage.setItem("mm-check","1");localStorage.clear();localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-intro-'+made.character.id+'","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(save.worldKey,made.character))+','+JSON.stringify(JSON.stringify(save))+');}'+extra});
 return init;
}
async function ready(){for(let i=0;i<120&&!await read('!!window.game&&!!document.querySelector("#miniButton")?.minimap');i++)await wait(150);await read("document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());");await wait(1200);}
// Held an einen festen Ort mit Fundstellen, Stationen und Auftraggebern in Reichweite; Gegner weg, damit nichts dazwischenfunkt.
const settle=()=>read(`(async()=>{const g=game;g.enemies=g.enemies.filter(e=>!e.aggro);g.player.inCombat=0;g.stopAuto?.();g.moveTo=null;g.path=[];g.keys?.clear?.();const {professionWorld}=await import('./profession-world.js');const L=professionWorld(g.world);g.player.x=(L.stations[0].x+L.stations[1].x)/2;g.player.y=(L.stations[0].y+L.stations[1].y)/2+20;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return true;})()`);
try{
 await b.resize(2024,900);const init=await boot();await b.goto(b.url);await ready();await settle();await wait(900);
 const box=await rect('#miniButton');assert.ok(box.width>=150&&box.width<=180,'Größe mittel ≈ bisher: '+JSON.stringify(box));
 assert.equal(await mm('m.settings().zoom'),2);await shot('01-standard');pass('Minikarte gezeichnet ('+Math.round(box.width)+'×'+Math.round(box.height)+' px bei x='+Math.round(box.x)+', y='+Math.round(box.y)+'), Standard-Zoom 3/5');

 // Zoom über Knöpfe
 await click('.mm-k-in');assert.equal(await mm('m.settings().zoom'),3);await click('.mm-k-in');assert.equal(await mm('m.settings().zoom'),4);
 assert.equal(await read(`document.querySelector('.mm-k-in').disabled`),true,'nächste Stufe gesperrt');await wait(200);await shot('02-zoom-nah');
 for(let i=0;i<4;i++)await click('.mm-k-out');assert.equal(await mm('m.settings().zoom'),0);assert.equal(await read(`document.querySelector('.mm-k-out').disabled`),true);await wait(200);await shot('03-zoom-weit');
 pass('Zoom-Knöpfe +/− (5 Stufen, Grenzen gesperrt)');
 // Zoom über Mausrad
 const disc=await rect('.mm-disc'),cx=disc.x+disc.width/2,cy=disc.y+disc.height/2;
 await mouse('mouseMoved',cx,cy);await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:cx,y:cy,deltaX:0,deltaY:-120});await wait(200);assert.equal(await mm('m.settings().zoom'),1);
 await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:cx,y:cy,deltaX:0,deltaY:-120});await wait(200);assert.equal(await mm('m.settings().zoom'),2);
 pass('Mausrad über der Karte zoomt die Minikarte');

 // Lupe: Symbolgruppe Fundstellen aus und wieder an
 const groups=async()=>{await wait(150);return mm('[...new Set(m.hits().map(h=>h.group).filter(Boolean))]');};
 assert.ok((await groups()).includes('nodes'),'Fundstellen sichtbar');
 await click('.mm-k-track');assert.equal(await read(`document.querySelector('.mm-menu').hidden`),false);assert.equal(await read(`document.querySelector('.mm-menu').dataset.kind`),'track');await shot('04-lupe');
 await click('[data-mm-track=nodes]');assert.equal(await mm('m.settings().track.nodes'),false);assert.ok(!(await groups()).includes('nodes'),'Fundstellen ausgeblendet');await shot('05-lupe-ohne-fundstellen');
 await click('[data-mm-track=nodes]');assert.ok((await groups()).includes('nodes'),'Fundstellen wieder da');
 await clickAt(1000,500);assert.equal(await read(`document.querySelector('.mm-menu').hidden`),true,'Klick daneben schließt die Lupe');
 pass('Lupe schaltet die Gruppe „Fundstellen“ ab und wieder an; Klick daneben schließt');

 // Tooltip: Maus über ein Symbol
 const target=await mm(`m.hits().find(h=>h.group==='nodes'||h.group==='trainer'||h.group==='quest')`);assert.ok(target,'Symbol zum Überfahren');
 const dr=await rect('.mm-canvas-probe, #minimap'),scale=dr.width/await mm('m.stats().disc');
 await mouse('mouseMoved',dr.x+target.x*scale,dr.y+target.y*scale);await wait(250);
 const tip=await read(`(()=>{const t=document.querySelector('.mm-tip');return t&&!t.hidden?t.textContent:''})()`);
 assert.ok(tip.includes(target.name),'Tooltip nennt '+target.name+': '+tip);await shot('06-tooltip');
 // mehrere Symbole übereinander: alle auflisten
 const pair=await mm(`(()=>{const h=m.hits();for(const a of h)for(const c of h)if(a!==c&&a.name!==c.name&&Math.hypot(a.x-c.x,a.y-c.y)<7)return [a,c];return null;})()`);
 let multi='';if(pair){await mouse('mouseMoved',dr.x+(pair[0].x+pair[1].x)/2*scale,dr.y+(pair[0].y+pair[1].y)/2*scale);await wait(250);multi=await read(`document.querySelectorAll('.mm-tip:not([hidden]) .mm-tip-row').length`);assert.ok(multi>=2,'mehrere Zeilen');await shot('07-tooltip-mehrere');}
 await mouse('mouseMoved',1000,600);await wait(150);assert.equal(await read(`document.querySelector('.mm-tip').hidden`),true,'Tooltip weg');
 pass('Mouse-Over-Tooltip: „'+tip+'“'+(pair?' · '+multi+' Zeilen bei übereinanderliegenden Symbolen':''));
 // Knopf-Tooltip
 const zin=await rect('.mm-k-in');await mouse('mouseMoved',zin.x+zin.width/2,zin.y+zin.height/2);await wait(150);assert.match(await read(`document.querySelector('.mm-tip').textContent`),/Näher heran/);await mouse('mouseMoved',1000,600);pass('Knöpfe erklären sich per Tooltip');

 // Klickverhalten wie bisher: Klick öffnet die Weltkarte; Umschalt+Klick läuft hin
 await clickAt(cx,cy);await wait(300);assert.ok((await b.state()).popups.some(p=>p.id==='map'),'Weltkarte offen');await shot('08-klick-weltkarte',false);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(200);
 await clickAt(cx+disc.width*.3,cy,8);await wait(200);const nav=await read('game.moveTo?{x:game.moveTo.x,y:game.moveTo.y}:null');
 assert.ok(nav,'Umschalt+Klick setzt ein Laufziel');assert.ok(!(await b.state()).popups.some(p=>p.id==='map'),'Umschalt+Klick öffnet keine Karte');
 await wait(400);await shot('09-umschalt-klick-wegmarke');await read('game.moveTo=null;game.path=[];');pass('Klick öffnet die Weltkarte wie bisher; Umschalt+Klick setzt Wegmarke/läuft hin');

 // Optionen: Form eckig, Größe groß – nach Neuladen gemerkt
 await click('.mm-k-opts');assert.equal(await read(`document.querySelector('.mm-menu').dataset.kind`),'options');await shot('10-optionen');
 await click('[data-mm-set=shape][data-mm-val=square]');await click('[data-mm-set=size][data-mm-val=l]');await click('[data-mm-toggle=clock]');
 assert.deepEqual(await read(`(()=>{const r=document.querySelector('#miniButton');return[r.dataset.shape,r.dataset.size,document.querySelector('.mm-clock').hidden]})()`),['square','l',true]);
 await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await b.goto(b.url);await ready();await settle();await wait(700);
 const after=await read(`(()=>{const r=document.querySelector('#miniButton');return{shape:r.dataset.shape,size:r.dataset.size,clock:document.querySelector('.mm-clock').hidden,width:r.getBoundingClientRect().width}})()`);
 assert.deepEqual([after.shape,after.size,after.clock],['square','l',true],JSON.stringify(after));assert.ok(after.width>200);await shot('11-eckig-gross-nach-neuladen');
 pass('Form eckig + Größe groß + Uhr aus bleiben nach Neuladen ('+after.width+' px breit)');
 await mm(`m.set({shape:'round',size:'l',clock:true})`);await wait(300);await shot('12-rund-gross');
 await mm(`m.set({shape:'round',size:'s'})`);await wait(300);await shot('13-rund-klein');
 await mm(`m.set({shape:'round',size:'m',rotate:true})`);
 // Drehen mit der Blickrichtung: Held läuft nach rechts → Norden wandert nach links
 await b.hold('d',900);await wait(500);const north=await read(`getComputedStyle(document.querySelector('.mm-north')).getPropertyValue('--mm-north')`);
 assert.ok(parseFloat(north)<-45,'Norden dreht mit: '+north);assert.equal(await read(`getComputedStyle(document.querySelector('.mm-north')).display`),'grid');await shot('14-drehen');
 await mm(`m.set({rotate:false})`);pass('Drehen mit der Blickrichtung (Norden-Schild wandert auf '+north.trim()+')');

 // HUD-Editor: Minikarte verschieben
 const before=await rect('#miniButton');await b.press('Escape');await wait(250);assert.ok(await read(`!!document.querySelector('.popup-menu')`),'Spielmenü');await click('.popup-menu [data-hud-open]');await wait(300);
 const handle=await rect('[data-hud-handle="map"]');const p={x:handle.x+25,y:handle.y+25};await mouse('mouseMoved',p.x,p.y);await wait(40);await mouse('mousePressed',p.x,p.y);await wait(40);
 for(let i=1;i<=6;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x-160*i/6,y:p.y+120*i/6,button:'left',buttons:1});await wait(25);}await mouse('mouseReleased',p.x-160,p.y+120);await wait(300);
 await shot('15-hud-editor',false);await click('[data-hud-save]');await wait(300);const moved=await rect('#miniButton');
 assert.ok(moved.x<before.x-100&&moved.y>before.y+80,JSON.stringify({before,moved}));await wait(300);await shot('16-verschoben');pass('HUD-Editor verschiebt die Minikarte');
 await read(`localStorage.removeItem('mertloch-hud-layouts-v1')`);

 // Kiosk und Verlies: dort zeichnet weiter der alte Innenraum-Weg (renderer.map), die Minikarte pausiert ohne Fehler.
 for(const [enter,leave,name] of [['const k=await import("./kiosk-instance.js");game.paused=false;game.player.inCombat=0;const d=k.kioskEntrance(game);game.player.x=d.x;game.player.y=d.y;k.enterKiosk(game)','(await import("./kiosk-instance.js")).leaveKiosk(game,true)','Kiosk'],['(await import("./dungeon.js")).enterDungeon(game,"schloss-bigb",{force:true})','(await import("./dungeon.js")).leaveDungeon(game,{force:true})','Verlies']]){
  await read(`(async()=>{${enter};})()`);await wait(900);assert.ok(await read(`game.instance?true:false`),name+' betreten');
  const painted=await read(`(()=>{const c=document.querySelector('#minimap'),d=c.getContext('2d').getImageData(c.width/2-20,c.height/2-20,40,40).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;})()`);assert.ok(painted>100,name+': Innenraumkarte gezeichnet');
  await shot('17-'+name.toLowerCase());await read(`(async()=>{${leave};})()`);await wait(700);assert.equal(await read(`game.instance?true:false`),false,name+' verlassen');
 }
 await wait(400);assert.ok((await mm('m.hits().length'))>0,'nach dem Verlassen wieder Symbole');pass('Kiosk und Verlies: Innenraumkarte wie bisher, danach wieder die Minikarte');

 // Leistung: Zeichenzeit der Minikarte je Bild und Neuaufbau der Grundkarte
 const stats=await mm('m.stats()');assert.ok(stats.drawMs<3,'Zeichnen je Bild < 3 ms: '+stats.drawMs);assert.ok(stats.rebuildMs<40,'Neuaufbau < 40 ms: '+stats.rebuildMs);
 pass('Leistung: Symbole je Bild '+stats.drawMs+' ms, Grundkarte neu '+stats.rebuildMs+' ms ('+stats.rebuilds+' Neuaufbauten)');
 assert.deepEqual(b.errors,[]);pass('keine Konsolenfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks,box,stats},null,2));console.log('PASS Minikarte ('+checks.length+' Prüfungen)');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');console.log(JSON.stringify(b.errors).slice(0,1500));}catch{}process.exitCode=1;}finally{b.close();}
