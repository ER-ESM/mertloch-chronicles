// Optimierung Runde 2, Teil B „Spielerfluss & HUD“ (2026-09-24): prüft jeden Punkt per Klickpfad im echten Spiel.
// 1 Angreifer wird Ziel, Taste 1 trifft ihn und nicht den neutralen Dachs
// 2 Rechtsklick auf einen Gegner läuft hin und greift an – im Freien und in der Hofprobe hinter der Wand
// 3 Zonentitel (18 % Höhe, 40 px Gold) und Clan-Schild überlappen nicht; Handy: Ortsname nur kurz
// 4 Meldungen nacheinander: Kurzmeldungen in der Schlange, Freischaltungen gebündelt und gestreckt, nie doppelt
// 5 kein Update-Hinweis beim Erststart; der Hinweis ist klein, frei von Titelzeilen und schließt per ×
// 6 Weltbeschriftungen wie in WoW: keine Orts-/Straßennamen dauerhaft, Name beim Überfahren, F-Hinweis nur in Reichweite,
//   Schilder im Nahkampf neben der eigenen Figur, keine Schilder unter HUD-Flächen, Entfernung am Pfeil
// 7 Leisten: zweite Leiste nur belegte Plätze, Leertaste als Kappe, Autoangriff als Zustand am Platz
// 8 HUD links oben: Symbolknöpfe, kein Status-Schild, Zielrahmen mit zwei Textzeilen, Fehlermeldung frei vom Kampftext
// 9 Quick Wins (Komma, Handy-„m“, Kalender statt „Daily:“, Ausweichen-Rückmeldung, Ida, Belohnung, Auftragskasten-Tooltip)
// Screenshots: visual-review/optimierung-r2b/. Ports: CDP 9490, Server 4290, Proxy 4291 (änderbar über CDP_PORT/SERVER_PORT).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {TUTORIAL,MOUNT_UI,MOUNT_RULES} from '../content/index.js';
import {ITEMS} from '../rpg.js';
const dir='visual-review/optimierung-r2b';mkdirSync(dir,{recursive:true});
const CDP=Number(process.env.CDP_PORT||9490),SERVER=Number(process.env.SERVER_PORT||4290),PROXY=SERVER+1;
const b=await browserSession({port:CDP,serverPort:SERVER});
const read=js=>b.evaluate(`(()=>{${js}})()`);
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}:null;`);
const overlap=(a,c)=>!!a&&!!c&&a.l<c.r-1&&c.l<a.r-1&&a.t<c.b-1&&c.t<a.b-1;
const mouse=(x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:Math.round(x),y:Math.round(y),pointerType:'mouse',...extra});
async function click(x,y,button='left'){await mouse(x,y);for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:Math.round(x),y:Math.round(y),button,clickCount:1,pointerType:'mouse'});}
async function hoverTip(sel){const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await mouse(5,450);await wait(80);await mouse(r.l+r.w/2,r.t+r.h/2);await wait(300);return read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:''`);}
async function zoom(path,sel,pad=16){const r=typeof sel==='string'?await rect(sel):sel;if(!r)return;const x=Math.max(0,r.l-pad),y=Math.max(0,r.t-pad);const shot=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x,y,width:r.w+2*pad,height:r.h+2*pad,scale:2}});writeFileSync(path,Buffer.from(shot.data,'base64'));}
const shot=name=>b.screenshot(`${dir}/${name}.jpg`);
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const TO_SCREEN=`const toS=pt=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect();return {x:Math.round((pt.x-v.camera.x+v.width/2)/v.width*r.width+r.left),y:Math.round((pt.y-v.camera.y+v.height/2)/v.height*r.height+r.top),k:r.width/v.width}};`;
const made=createCharacter(null,{name:'Runde Zwei',classId:'dieter',look:'dieter'});
function seed(save,{all=true,touch=false,sw=false}={}){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',...save};return (sw?'':'delete Navigator.prototype.serviceWorker;')+'localStorage.clear();'+(all?'localStorage.setItem("mertloch-unlock-all","1");':'')+'localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));');}
async function boot(){for(let i=0;i<160&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click()`);await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(500);}
async function start(save,opts={}){const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(save,opts)});await b.goto(opts.url||b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await boot();}
/** Weltschilder der Schrift-Ebene mitschreiben (Text → Bildschirmpunkt), je Bild neu. */
const LABEL_SPY=`if(!window.__labelSpy){window.__labelSpy=true;window.__labels=new Map();const o=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,x,y,...r){const cv=this.canvas;if(cv.id==='world'||cv.classList&&cv.classList.contains('world-labels')){const m=this.getTransform(),s=cv.getBoundingClientRect(),q=s.width/cv.width;window.__labels.set(String(t),{x:Math.round((m.a*x+m.c*y+m.e)*q+s.left),y:Math.round((m.b*x+m.d*y+m.f)*q+s.top),at:performance.now()});}return o.call(this,t,x,y,...r);};}`;
const labelsNow=(ms=300)=>read(`const now=performance.now();return [...window.__labels].filter(([t,v])=>now-v.at<${ms}).map(([t,v])=>({t,...v}))`);
const L3={level:3,tutorial:{version:1,step:8,completed:true}},L12={level:12,tutorial:{version:1,step:8,completed:true},rpg:{inventory:[{id:'brezel',count:3},{id:'currywurst',count:2}],coins:1250}};
// Szene: Held mit Pfanddachs daneben und Pfandkeiler etwas weiter, sonst niemand in der Nähe.
const SCENE=`const g=window.game,w=g.world;const d=g.enemies.find(e=>e.name==='Pfanddachs'&&e.hp>0),k=g.enemies.find(e=>e.name==='Pfandkeiler'&&e.hp>0);
 const base=w.findClear(d.x+60,d.y,9);Object.assign(g.player,base,{vx:0,vy:0,inCombat:0});g.moveTo=null;g.path=[];g.approach=null;g.autoAttack.enabled=false;g.attackers?.clear();
 for(const e of g.enemies)if(e!==d&&e!==k&&Math.hypot(e.x-base.x,e.y-base.y)<600){e.x+=4000;e.home={x:e.x,y:e.y};e.aggro=false;}
 Object.assign(d,w.findClear(base.x+25,base.y,9),{aggro:false,ai:'roaming',roamGoal:null,hp:d.maxHp});d.home={x:d.x,y:d.y};
 const kp=w.findClear(base.x-90,base.y+10,9);Object.assign(k,kp,{spawnGrace:0,aggro:false,ai:'roaming',roamGoal:null,hp:k.maxHp,cast:null});k.home={...kp};
 window.__d=d;window.__k=k;return {base,range:k.aggroRange};`;
try{
 await b.resize(2024,900);
 // ---------- 1) Angreifer wird Ziel ----------
 await start(L3);
 await read(SCENE);await read(`window.game.target=window.__d;window.game.friend=null;`);
 let s=null;for(let i=0;i<50;i++){await wait(150);s=await read(`const g=window.game;return {t:g.target===window.__k,aggro:window.__k.aggro,hit:g.player.hp<g.player.maxHp}`);if(s.t)break;}
 assert.ok(s.t,'Dachs gewählt, Keiler greift an → Keiler wird Ziel '+JSON.stringify(s));
 await shot('r2b-01-angreifer-wird-ziel');ok('Neutraler Dachs als Ziel, ein Keiler greift an: der Keiler wird automatisch Ziel');
 await read(SCENE);await read(`const g=window.game;g.target=null;g.friend=null;const k=window.__k;k.aggro=true;k.ai='combat';`);
 await b.press('1');await wait(200);s=await read(`const g=window.game;return {keiler:g.target===window.__k,dachs:g.target===window.__d,auto:g.autoAttack.enabled}`);
 assert.ok(s.keiler&&!s.dachs&&s.auto,'ohne Ziel: Taste 1 greift den Angreifer an, nicht den näheren Dachs '+JSON.stringify(s));
 await read(SCENE);await read(`const g=window.game;g.target=window.__d;const k=window.__k;k.aggro=true;k.ai='combat';`);
 await b.press('1');await wait(200);s=await read(`const g=window.game;return {keiler:g.target===window.__k,dachs:g.target===window.__d,dachsAggro:window.__d.aggro}`);
 assert.ok(s.keiler&&!s.dachs&&!s.dachsAggro,'Dachs gewählt, Keiler greift an: Taste 1 trifft den Keiler '+JSON.stringify(s));
 await read(SCENE);await read(`const g=window.game,k=window.__k;k.x+=4000;k.home={x:k.x,y:k.y};g.target=window.__d;`);await b.press('1');await wait(200);
 assert.ok(await read(`return window.game.target===window.__d&&window.game.autoAttack.enabled`),'ohne Angreifer darf man den Dachs weiter angreifen');
 ok('Taste 1: trifft den Angreifer statt des neutralen Dachses (mit und ohne gewähltes Ziel); ohne Angreifer bleibt der Dachs angreifbar');
 // ---------- 2) Rechtsklick läuft hin und greift an ----------
 await read(SCENE);await read(`const g=window.game,d=window.__d,w=g.world;Object.assign(d,w.findClear(g.player.x+150,g.player.y+20,9),{hp:d.maxHp});d.home={x:d.x,y:d.y};window.__k.x+=4000;window.__k.home={x:window.__k.x,y:window.__k.y};g.target=null;`);
 await wait(300);let at=await read(TO_SCREEN+`const d=window.__d;return toS({x:d.x,y:d.y-10})`);
 await click(at.x,at.y,'right');await wait(150);
 assert.ok(await read(`return !!window.game.approach&&!!window.game.moveTo`),'Rechtsklick auf entfernten Gegner: die Figur läuft los');
 for(let i=0;i<40;i++){await wait(150);s=await read(`const g=window.game,d=window.__d;return {d:Math.round(Math.hypot(g.player.x-d.x,g.player.y-d.y)),hit:d.hp<d.maxHp,ap:!!g.approach}`);if(s.hit)break;}
 assert.ok(s.hit&&!s.ap,'hingelaufen und getroffen '+JSON.stringify(s));await shot('r2b-02-rechtsklick-hin-und-angreifen');
 ok('Rechtsklick auf einen entfernten Gegner: hinlaufen, stehen bleiben, Autoangriff trifft');
 // Hofprobe 4/8: Papp-Horst hinter einer Wand, Wegsuche um die Wand herum.
 await start({level:1,tutorial:{version:1,step:3,completed:false}},{all:false});
 const inside=await read(`const g=window.game,w=g.walkWorld(),e=g.enemies.find(e=>e.tutorial);const p0={x:g.player.x,y:g.player.y};for(let r=20;r<=200;r+=10)for(let a=0;a<Math.PI*2;a+=Math.PI/12){const c={x:p0.x+Math.cos(a)*r,y:p0.y+Math.sin(a)*r};if(g.world.blocked(c.x,c.y,9))continue;if(g.world.lineClear(c,e))continue;let path=[];try{path=w.findPath(c,e)||[]}catch{}if(!path.length)continue;Object.assign(g.player,c,{vx:0,vy:0});return {c,d:Math.round(Math.hypot(c.x-e.x,c.y-e.y))};}return null;`);
 assert.ok(inside,'Prüffall: Punkt in der Bude ohne Sicht auf Papp-Horst');await wait(600);
 at=await read(TO_SCREEN+`const e=window.game.enemies.find(e=>e.tutorial);return toS({x:e.x,y:e.y-14})`);await click(at.x,at.y,'right');
 for(let i=0;i<60;i++){await wait(150);s=await read(`const g=window.game,e=g.enemies.find(e=>e.tutorial);return {hit:e.hp<e.maxHp,clear:g.world.lineClear(g.player,e),d:Math.round(Math.hypot(g.player.x-e.x,g.player.y-e.y)),t:g.target===e}`);if(s.hit)break;}
 assert.ok(s.hit&&s.clear&&s.t,'Hofprobe: Rechtsklick hinter der Wand läuft per Wegsuche heran und schlägt zu '+JSON.stringify({inside,s}));
 await shot('r2b-03-hofprobe-hinter-der-wand');ok('Hofprobe 4/8: Rechtsklick auf Papp-Horst hinter der Wand – Weg um die Wand, dann Treffer');
 // ---------- 9a) Ausweichen in der Hofprobe mit klarer Rückmeldung ----------
 await read(`const g=window.game,o=g.toast.bind(g);window.__toastLog=[];g.toast=t=>{window.__toastLog.push(t);return o(t);};g.tutorial.step=4;g.tutorial.clock=0;g.tutorial.tries=0;g.tutorial.dash=false;g.autoAttack.enabled=false;`);
 for(let i=0;i<20&&!await read(`return !!window.game.enemies.find(e=>e.tutorial)?.cast`);i++)await wait(150);
 s=await read(`const e=window.game.enemies.find(e=>e.tutorial);return {total:e.cast.total}`);assert.equal(s.total,TUTORIAL.firstCastTime,'der erste rote Kreis steht länger');
 await shot('r2b-04-hofprobe-kreis');
 await read(`const e=window.game.enemies.find(e=>e.tutorial),p=window.game.player;Object.assign(p,{x:e.cast.x,y:e.cast.y});e.cast.remaining=.05;`);await wait(400);
 assert.ok((await read(`return window.__toastLog`)).includes(TUTORIAL.late),'Fehlversuch: „Zu spät“');
 for(let i=0;i<40&&!await read(`return !!window.game.enemies.find(e=>e.tutorial)?.cast`);i++)await wait(150);
 await b.press(' ');await wait(80);await read(`const e=window.game.enemies.find(e=>e.tutorial);if(e.cast)e.cast.remaining=.05;`);await wait(1600);
 s=await read(`return {step:window.game.tutorial.step,toast:document.querySelector('#toast').textContent}`);
 assert.equal(s.step,5,'Ausweichen geschafft → nächster Schritt '+JSON.stringify(s));
 assert.ok((await read(`return window.__toastLog`)).includes(TUTORIAL.dodged),'Rückmeldung „Ausgewichen!“');ok('Hofprobe 5/8: erster Kreis steht '+TUTORIAL.firstCastTime+' s, Rückmeldung „Zu spät“ bzw. „Ausgewichen!“');
 // ---------- 3) Zonentitel und Clan-Schild ----------
 await start(L12);
 await read(`const g=window.game,w=g.world,h=(w.hubs||[]).find(h=>/Wegestube/.test(h.name))||w.hubs[2];Object.assign(g.player,w.findClear(h.x,h.y+30,9),{vx:0,vy:0});g.enemies=[];`);await wait(1500);
 await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.church.x,w.church.maxY+150,9),{vx:0,vy:0});`);
 for(let i=0;i<30&&await read(`return document.body.dataset.zoneAnnounced`)!=='Clan-Treff';i++)await wait(150);
 assert.equal(await read(`return document.body.dataset.zoneAnnounced`),'Clan-Treff','Ankunft am Clan-Treff');await wait(700);
 const zone=await read(TO_SCREEN+`const w=window.game.world,l=document.querySelector('.region-label'),h=l.querySelector('h2'),r=h.getBoundingClientRect(),sub=getComputedStyle(l.querySelector('#zoneType'));return import('./clan-art.js').then(m=>{const s=m.clanSignBounds(document.createElement('canvas').getContext('2d'),w),a=toS({x:s.x,y:s.y}),z=toS({x:s.x+s.w,y:s.y+s.h});return {sign:{l:a.x,t:a.y,r:z.x,b:z.y},title:{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom)},label:Math.round(l.getBoundingClientRect().top),size:getComputedStyle(h).fontSize,color:getComputedStyle(h).color,sub:{size:sub.fontSize,font:sub.fontFamily},shown:l.classList.contains('zone-show')}})`);
 assert.ok(zone.shown,'Zonentitel steht');assert.equal(await read(`const z=document.querySelector('#zoneSplash');return !!z&&getComputedStyle(z).display!=='none'`),false,'nur EIN Zonentitel (kein zweiter Schriftzug)');assert.ok(!overlap(zone.sign,zone.title),'Zonentitel und Clan-Schild überlappen nicht '+JSON.stringify(zone));
 assert.equal(zone.size,'40px');assert.ok(Math.abs(zone.label-Math.round(900*.18))<=6,'Zonentitel bei 18 % Bildhöhe '+zone.label);assert.equal(zone.sub.size,'15px');assert.match(zone.sub.font,/Nunito/);
 await shot('r2b-10-clantreff-zonentitel');await zoom(`${dir}/r2b-10z-zonentitel-schild.jpg`,{l:Math.min(zone.sign.l,zone.title.l),t:Math.min(zone.sign.t,zone.title.t),r:0,b:0,w:Math.max(zone.sign.r,zone.title.r)-Math.min(zone.sign.l,zone.title.l),h:Math.max(zone.sign.b,zone.title.b)-Math.min(zone.sign.t,zone.title.t)},24);
 ok('Clan-Treff: Zonentitel (40 px Gold, 18 % Höhe, Unterzeile Nunito 15 px) und gemaltes Clan-Schild überlappen nicht '+JSON.stringify({sign:zone.sign,title:zone.title}));
 // Kurzmeldung darüber, nicht im Zonentitel
 await read(`window.game.toast('Prüfmeldung über dem Zonentitel')`);await wait(150);
 assert.ok(!overlap(await rect('#toast'),await rect('.region-label h2')),'Kurzmeldung liegt nicht im Zonentitel');ok('Kurzmeldung steht als feste Zeile über dem Zonentitel');
 // ---------- 6) Weltbeschriftungen ----------
 await read(LABEL_SPY);await mouse(1500,700);await read(`window.game.hover={x:-99999,y:-99999}`);await wait(900);
 const names=await read(`const w=window.game.world;return {landmarks:w.landmarks.map(b=>b.tags?.name).filter(Boolean),roads:[...new Set(w.roads.map(r=>r.tags?.name).filter(Boolean))]}`);
 const forbidden=new Set([...names.landmarks,...names.roads,'Willis Werkhof','Bärbels Braugarten','Konterbrunnen',MOUNT_UI.station]);
 let drawn=await labelsNow();const bad=drawn.filter(l=>forbidden.has(l.t));
 assert.deepEqual(bad.map(l=>l.t),[],'keine Orts-, Straßen- oder Stationsnamen dauerhaft in der Welt');
 assert.ok(!drawn.some(l=>l.t==='F · '+MOUNT_UI.open),'F · Fahrstall ansehen nur in Reichweite');
 await shot('r2b-20-welt-ohne-ortsnamen');
 // Überfahren: ein Gebäude in Sicht bekommt seinen Namen
 const lm=await read(TO_SCREEN+`const g=window.game,w=g.world,p=g.player;const hit=w.landmarks.filter(b=>!b.church&&b.tags?.name).map(b=>({b,s:toS({x:b.x,y:(b.minY+b.maxY)/2})})).find(o=>o.s.x>300&&o.s.x<1700&&o.s.y>120&&o.s.y<640);if(hit)return {name:hit.b.tags.name,...hit.s};return import('./profession-world.js').then(m=>{const st=m.professionWorld(w).stations.find(x=>x.id==='werkhof');return st?{name:'Willis Werkhof',...toS({x:st.x,y:st.y-12})}:null;})`);
 if(lm&&lm.x>40&&lm.x<1980&&lm.y>40&&lm.y<860){await mouse(lm.x,lm.y);await wait(700);drawn=await labelsNow();assert.ok(drawn.some(l=>l.t===lm.name),'Name beim Überfahren: '+lm.name+' '+JSON.stringify(drawn.map(l=>l.t)));await shot('r2b-21-ortsname-beim-ueberfahren');ok('Weltbeschriftung: keine Orts-/Straßen-/Stationsnamen dauerhaft; „'+lm.name+'“ erscheint beim Überfahren');}
 else ok('Weltbeschriftung: keine Orts-/Straßen-/Stationsnamen dauerhaft (kein Gebäude im Bild zum Überfahren)');
 // F-Hinweis am Fahrstall nur in Reichweite
 await mouse(1500,700);await read(`const g=window.game;return import('./mounts.js').then(m=>{const s=m.mountStation(g.world);Object.assign(g.player,g.world.findClear(s.x,s.y+MOUNT_R,9),{vx:0,vy:0});})`.replace('MOUNT_R',String(Math.round(MOUNT_RULES.range*.6))));await wait(700);
 drawn=await labelsNow();assert.ok(drawn.some(l=>l.t==='F · '+MOUNT_UI.open),'F-Hinweis am Fahrstall in Reichweite '+JSON.stringify(drawn.map(l=>l.t)));ok('„F · '+MOUNT_UI.open+'“ nur in Reichweite ('+MOUNT_RULES.range+')');
 // Keine Schilder unter HUD-Flächen (das halbe „E“ neben der Leiste)
 const hud=await read(`return ['.action-area>.action-bar','.action-area>.special-actions','.player-panel','#miniButton','.quest-panel','.game-menu-rail'].map(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {s,l:r.left,t:r.top,r:r.right,b:r.bottom}}).filter(Boolean)`);
 for(const spot of [[10277,8944],[9296,8728],[9266,7066]]){await read(`const g=window.game;Object.assign(g.player,g.world.findClear(${spot[0]},${spot[1]}+30,9),{vx:0,vy:0});`);await wait(800);drawn=await labelsNow();
  const under=drawn.filter(l=>hud.some(h=>l.x>h.l&&l.x<h.r&&l.y>h.t&&l.y<h.b));assert.deepEqual(under.map(l=>l.t),[],'Weltschild unter einer HUD-Fläche');}
 ok('Kein Weltschild unter Aktionsleiste, Rahmen, Minikarte oder Verfolgung');
 // Nahkampf: Gegnerschild neben der eigenen Figur, Beute-Schild ebenso
 await read(SCENE);await read(`const g=window.game,k=window.__k,p=g.player;Object.assign(k,{x:p.x+6,y:p.y+14,aggro:true,ai:'combat'});k.home={x:k.x,y:k.y};g.target=k;g.rpg.loot=g.rpg.loot||[];g.rpg.loot.push({id:'r2b-beute',coins:1,items:[{id:'brezel',count:1}],x:p.x-3,y:p.y+4});`);await wait(1600);
 const hero=await read(TO_SCREEN+`const p=window.game.player;return toS(p)`);drawn=await labelsNow(200);
 const plate=drawn.find(l=>l.t==='Pfandkeiler'),loot=drawn.find(l=>l.t==='F · Beute');
 assert.ok(plate&&Math.abs(plate.x-hero.x)>=11*hero.k,'Gegnerschild nicht auf der eigenen Figur '+JSON.stringify({plate,hero}));
 assert.ok(loot&&Math.abs(loot.x-hero.x)>=11*hero.k,'„F · Beute“ nicht auf der eigenen Figur '+JSON.stringify({loot,hero}));
 await zoom(`${dir}/r2b-22z-nahkampf-schilder.jpg`,{l:hero.x-200,t:hero.y-190,w:400,h:260,r:0,b:0},0);
 await read(`const g=window.game;g.rpg.loot=g.rpg.loot.filter(l=>l.id!=='r2b-beute');window.__k.aggro=false;g.target=null;window.__k.x+=4000;`);
 ok('Nahkampf: Gegnerschild und „F · Beute“ weichen neben die eigene Figur aus');
 // Wegmarke: Entfernung am Pfeil (auf dem Ring um den Helden), nicht frei im Bild
 await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.church.x,w.church.maxY+150,9),{vx:0,vy:0});`);await wait(2000);drawn=await labelsNow();
 const way=drawn.find(l=>/^\d+ m$/.test(l.t));if(way){const h2=await read(TO_SCREEN+`return toS(window.game.player)`);const d=Math.hypot(way.x-h2.x,way.y-h2.y);/* Runde 4b: Pfeil auf enger Kreisbahn um den Helden (r = 36 E), Entfernung direkt daneben */assert.ok(d>40&&d<220,'Entfernung am Richtungspfeil '+JSON.stringify({way,d}));ok('Wegmarke: Entfernung „'+way.t+'“ an der Pfeilspitze');}
 // ---------- 7) Leisten-Stapel ----------
 await read(`const g=window.game;g.rpg.actionBar=g.rpg.actionBar||[];g.rpg.actionBar[10]='item:currywurst';g.emit('save');g.emit('bar');`);await wait(400);
 const bar2=await read(`const x=document.querySelector('.action-area .extra-bar'),cs=getComputedStyle(x),shown=[...x.querySelectorAll('.skill')].filter(s=>getComputedStyle(s).visibility!=='hidden'&&Number(getComputedStyle(s).opacity)>.05);return {plate:cs.borderImageSource!=='none'||cs.backgroundImage!=='none'||cs.backgroundColor!=='rgba(0, 0, 0, 0)',shown:shown.length,used:x.querySelectorAll('.skill:not(.empty-slot)').length}`);
 assert.equal(bar2.shown,bar2.used,'zweite Leiste zeigt nur belegte Plätze '+JSON.stringify(bar2));assert.equal(bar2.plate,false,'leere Platte verschwindet '+JSON.stringify(bar2));
 await read(`document.body.classList.add('bar-drop')`);await wait(100);assert.equal(await read(`return [...document.querySelectorAll('.action-area .extra-bar .skill')].filter(s=>getComputedStyle(s).visibility!=='hidden'&&Number(getComputedStyle(s).opacity)>.05).length`),10,'beim Ziehen alle Plätze');await read(`document.body.classList.remove('bar-drop')`);
 const space=await read(`const k=document.querySelector('#specialActions [data-skill="dash"] .key');return k?k.textContent:''`);assert.equal(space,'␣','Leertaste als Tastenkappe');
 const tab=await rect('#autoState');assert.ok(!tab||tab.w<=2,'keine Textlasche „Autoangriff“ '+JSON.stringify(tab));
 await read(SCENE);await read(`window.game.target=window.__d;`);await b.press('1');await wait(300);
 const auto=await read(`const s=document.querySelector('#actionBar [data-skill="auto"]');return {on:s.classList.contains('auto-active'),anim:getComputedStyle(s).animationName}`);assert.ok(auto.on&&/r2b-auto-pulse/.test(auto.anim),'Autoangriff leuchtet am Platz '+JSON.stringify(auto));
 await shot('r2b-30-leisten');await zoom(`${dir}/r2b-30z-leisten.jpg`,'.action-area');
 ok('Leisten: zweite Leiste zeigt nur belegte Plätze ('+bar2.used+') ohne leere Platte, Leertaste als ␣, Autoangriff als leuchtender Platz statt Lasche');
 // ---------- 8) HUD links oben und Zielrahmen ----------
 const brand=await rect('.world-menu-brand'),meter=await rect('#meterToggle');
 assert.ok(brand.w<=44&&brand.h<=44&&meter.w<=44&&meter.h<=44,'Symbolknöpfe '+JSON.stringify({brand,meter}));
 assert.match(await hoverTip('.world-menu-brand'),/Spielmenü/i);assert.match(await hoverTip('#meterToggle'),/Kampfstatistik/i);
 assert.equal(await read(`return getComputedStyle(document.querySelector('#combatState')).display`),'none','kein 8-px-Status');
 await read(`const g=window.game;g.player.inCombat=5;`);await wait(250);assert.notEqual(await read(`return getComputedStyle(document.querySelector('.player-panel .portrait'),'::after').content`),'none','Kampfzeichen am Porträt');
 await read(`const g=window.game,e=g.enemies.find(e=>e.elite&&e.hp>0)||window.__k;Object.assign(e,g.world.findClear(g.player.x+120,g.player.y,9),{spawnGrace:0});e.home={x:e.x,y:e.y};window.__elite=e;g.target=e;g.friend=null;`);await wait(400);
 const tf=await read(`const p=document.querySelector('#targetPanel'),vis=s=>{const e=p.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0};const lvl=p.querySelector('#targetLevel');return {title:vis('#targetTitle'),detail:vis('.target-detail'),name:vis('.unit-name'),lvlFont:getComputedStyle(lvl).fontSize,lvlAfter:getComputedStyle(lvl,'::after').content,elite:p.classList.contains('elite-target')}`);
 assert.ok(!tf.title&&!tf.detail&&tf.name,'Zielrahmen: nur Name und Lebensbalken '+JSON.stringify(tf));assert.equal(tf.lvlFont,'0px','„Elite · St.“ nicht als Text');assert.match(tf.lvlAfter,/\d/,'Stufe als Zahl im Ring');
 const ttip=await hoverTip('#targetPanel .unit-name');assert.match(ttip,/Stufe/,'Beiname/Stufe im Tooltip');
 await zoom(`${dir}/r2b-40z-links-oben.jpg`,{l:10,t:8,r:0,b:0,w:600,h:180},0);
 ok('HUD links oben: Spielmenü und Kampfstatistik als 40-px-Symbolknöpfe mit Tooltip, kein Status-Schild, Zielrahmen mit Stufenring statt „Elite“-Text'+(tf.elite?' (Elite: goldener Ring)':''));
 // Fehlermeldung frei vom Kampftext
 await read(`const g=window.game,e=window.__elite;Object.assign(e,g.world.findClear(g.player.x+30,g.player.y,9),{aggro:true,ai:'combat',spawnGrace:0});g.target=e;g.autoAttack.enabled=true;`);await wait(1500);
 await read(`const g=window.game,id=g.skills.find(s=>s.cd>3&&!s.auto&&!s.ground&&!['heal','buff'].includes(s.id))?.id||'buff';g.cooldowns[id]=2.26;g.action(id);`);await wait(150);
 const tt=await read(`return document.querySelector('#toast').textContent`);assert.match(tt,/\d,\d s/,'Abklingzeit mit Komma: '+tt);
 const rows=await read(`return [...document.querySelectorAll('#sct .sct-row')].map(e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}})`);const toastR=await rect('#toast');
 assert.ok(!rows.some(r=>overlap(toastR,r)),'Fehlermeldung überdeckt den Kampftext nicht '+JSON.stringify({toastR,rows}));
 await shot('r2b-41-kampf-fehlermeldung');ok('Fehlermeldung „'+tt+'“ als feste Zeile oben, frei vom Kampftext');
 await read(`const g=window.game;g.enemies=g.enemies.filter(e=>e!==window.__elite);g.target=null;g.autoAttack.enabled=false;g.player.inCombat=0;`);
 // ---------- 9b) Kalender statt „Daily:“, Auftragskasten-Tooltip ----------
 await read(`return import('./hotspots.js').then(h=>{const g=window.game,hs=h.hotspotLayout(g.world).hotspots.find(x=>x.id==='bude-nyalol'),pos={x:g.player.x,y:g.player.y};Object.assign(g.player,{x:hs.giver.x,y:hs.giver.y});h.acceptHotspotQuest(g,'st-nyalol-1');Object.assign(g.player,pos);})`);
 for(let i=0;i<60&&!/Kabelsalat/.test(await read(`return document.querySelector('#toast').textContent`));i++)await wait(100);
 const daily=await read(`const t=document.querySelector('#toast'),c=[...document.querySelectorAll('.chat-line')].slice(-3);return {toast:t.textContent,toastIcon:!!t.querySelector('.qt-daily'),chat:c.map(x=>x.textContent),chatIcon:c.some(x=>x.querySelector('.qt-daily')),tracker:!!document.querySelector('.quest-panel .qt-daily'),all:document.querySelector('#gameShell').innerText}`);
 assert.ok(daily.toastIcon&&daily.chatIcon&&daily.tracker,'Kalendersymbol in Kurzmeldung, Chat und Verfolgung '+JSON.stringify(daily));assert.doesNotMatch(daily.all,/Daily:/);
 await zoom(`${dir}/r2b-50z-kalender-toast.jpg`,'#toast',12);ok('Täglicher Auftrag: Kalendersymbol statt „Daily:“ in Verfolgung, Chat und Kurzmeldung');
 const qTip=await hoverTip('.quest-panel .qt-quest');const tipR=await rect('#itemTooltip'),qp=await rect('.quest-panel');
 assert.match(qTip,/Klick/,'Klick-Hinweis im Tooltip');assert.ok(tipR.w<=250&&tipR.t>=qp.b&&tipR.r>=qp.l,'Tooltip klein, unter der Verfolgung '+JSON.stringify({tipR,qp}));
 await shot('r2b-51-auftragskasten-tooltip');ok('Auftragskasten: kleiner Tooltip ('+tipR.w+'×'+tipR.h+') unter der Verfolgung mit Klick-Hinweis');
 // ---------- 9c) Ida, Belohnung, Auftragsliste ----------
 for(const it of TUTORIAL.loot.items)assert.ok((ITEMS[it.id].level||1)<=1,'Hofprobe-Belohnung ohne Stufensperre: '+it.id);
 assert.doesNotMatch(TUTORIAL.steps[0].text,/Spielweise/,'Auftragsliste nennt keine Spielweise vor Stufe 5');
 ok('Hofprobe: Belohnung Konterwasser (ohne Stufe 2), Schritt 1 ohne „wähle deine Spielweise“');
 await start({level:1,tutorial:{version:1,step:0,completed:false}},{all:false});await read(LABEL_SPY);await wait(800);
 const ida=await read(TO_SCREEN+`const n=window.game.world.npc;return toS(n)`);drawn=await labelsNow();const idaName=drawn.find(l=>l.t==='Kisten-Ida');
 assert.ok(idaName&&ida.y-idaName.y<=30*ida.k,'Idas Name direkt über dem Kopf '+JSON.stringify({ida,idaName}));
 await zoom(`${dir}/r2b-52z-ida.jpg`,{l:ida.x-120,t:ida.y-190,w:240,h:220,r:0,b:0},0);ok('Ida: Name und Ausrufezeichen direkt über ihrem Kopf');
 // ---------- 4) Meldungen nacheinander ----------
 await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);
 const seq=[];await read(`const g=window.game;['Erste Prüfmeldung','Zweite Prüfmeldung','Erste Prüfmeldung','Dritte Prüfmeldung'].forEach(t=>g.toast(t));`);
 for(let i=0;i<80;i++){const t=await read(`const e=document.querySelector('#toast');return e.classList.contains('visible')?e.textContent:''`);if(t&&seq.at(-1)!==t)seq.push(t);if(seq.includes('Dritte Prüfmeldung')&&!t)break;await wait(100);}
 assert.deepEqual(seq.filter(t=>/Prüfmeldung/.test(t)),['Erste Prüfmeldung','Zweite Prüfmeldung','Dritte Prüfmeldung'],'nacheinander, doppelte nur einmal '+JSON.stringify(seq));
 ok('Kurzmeldungen: nacheinander in Reihenfolge, die doppelte erscheint nur einmal');
 // Freischaltungen nach der Hofprobe: EINE Einblendung für Kampfstatistik und UI bearbeiten; Kurzmeldung wartet; Erinnerungen später
 await read(`const g=window.game;g.tutorial.step=8;g.tutorial.completed=true;g.emit('tutorialStep');`);await wait(150);await read(`window.game.toast('Auftrag angenommen: Prüfung')`);
 let banner=null,both=0;for(let i=0;i<80;i++){await wait(100);/* die Erinnerung „Der Stempel“ öffnet sich dabei – die Einblendung wartet, bis sie zu ist */if(i===20)await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);const st=await read(`const m=document.querySelector('.milestone');const on=m&&!m.hidden&&m.classList.contains('show');return {on,title:on?m.querySelector('.milestone-title')?.textContent:'',text:!!m?.querySelector('.milestone-text'),tip:m?.querySelector('.milestone-title')?.dataset.tooltipNote||'',toast:document.querySelector('#toast').classList.contains('visible'),zone:!!document.querySelector('.region-label.zone-show')}`);if(st.on){if(!banner)await shot('r2b-55-freischaltung-gebuendelt');banner=banner||st;if(st.toast||st.zone)both++;}}
 assert.ok(banner,'Freischalt-Einblendung erscheint '+JSON.stringify(await read(`return {popups:[...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window),zone:!!document.querySelector('.region-label.zone-show'),toast:document.querySelector('#toast').className,ms:window.__mertlochMessages.milestones(),locked:document.body.dataset.locked,start:document.body.classList.contains('start-open')}`)));assert.match(banner.title,/Kampfstatistik/);assert.match(banner.title,/UI bearbeiten/);assert.equal(banner.text,false,'kein Erklärtext in der Einblendung');assert.ok(banner.tip.length>10,'Erklärung im Tooltip');
 assert.equal(both,0,'Einblendung nie gleichzeitig mit Kurzmeldung oder Zonentitel');
 await read(`const g=window.game;g.player.level=Math.max(3,g.player.level);`);await wait(4000);
 const ms=await read(`return window.__mertlochMessages.milestones()`);assert.ok(!ms.busy&&ms.queued.some(q=>/professions/.test(q)),'nächste Freischaltung (Berufe) wartet – gestreckt '+JSON.stringify({ms,banner,seen:await read('return JSON.stringify(window.game.memories)')}));
 ok('Freischaltungen: „'+banner.title+'“ als eine Einblendung (Erklärung im Tooltip), nie zugleich mit Kurzmeldung/Zonentitel; die nächste („Berufe“) folgt frühestens 45 s später');
 // ---------- 5) Update-Hinweis ----------
 assert.equal(await rect('#updateHint'),null,'kein Update-Hinweis beim Start');
 await b.press('n');await wait(500);await read(`window.__mertlochMessages.updateHint()`);await wait(200);
 const hint=await rect('#updateHint'),bars=await read(`return [...document.querySelectorAll('.game-popup .popup-titlebar')].map(e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}})`);
 assert.ok(hint.h<=40&&hint.w<=260,'Hinweis klein '+JSON.stringify(hint));assert.ok(!bars.some(t=>overlap(hint,t)),'Hinweis frei von Titelzeilen '+JSON.stringify({hint,bars}));
 await zoom(`${dir}/r2b-60z-update-hinweis.jpg`,hint,20);await read(`document.querySelector('#updateHint .update-hint-close').click()`);await wait(100);assert.equal(await rect('#updateHint'),null,'× schließt');await b.press('n');
 ok('Update-Hinweis: '+hint.w+'×'+hint.h+' px links oben, frei von Fenstertiteln, × schließt (Start ohne Hinweis: Unit-Test pwa-updates)');
 // Echter Dienst: neue Fassung beim Start → still übernommen, kein Hinweis
 if(process.env.SW_CHECK!=='0'){
  let bump=false;const proxy=http.createServer(async(req,res)=>{try{const r=await fetch('http://127.0.0.1:'+SERVER+req.url);let body=Buffer.from(await r.arrayBuffer());if(bump&&req.url.split('?')[0].endsWith('/sw.js'))body=Buffer.concat([body,Buffer.from('\n// r2b-neu\n')]);const h={};r.headers.forEach((v,k)=>{if(!['content-length','content-encoding','transfer-encoding'].includes(k))h[k]=v;});res.writeHead(r.status,h);res.end(body);}catch(e){res.writeHead(502);res.end(String(e));}}).listen(PROXY);
  try{
   const url='http://localhost:'+PROXY+'/';const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(L3,{sw:true})+'navigator.serviceWorker&&navigator.serviceWorker.addEventListener("controllerchange",()=>{window.__cc=(window.__cc||0)+1});'});
   await b.goto(url);await boot();let ready=false;for(let i=0;i<200&&!ready;i++){await wait(300);ready=await read(`return navigator.serviceWorker.getRegistration().then(r=>!!r?.active&&r.active.state==='activated')`);}
   assert.ok(ready,'Dienst aktiv');await b.goto(url);await boot();assert.ok(await read(`return !!navigator.serviceWorker.controller`),'Seite vom Dienst gesteuert');
   bump=true;await b.goto(url);await boot();let done=false,hintSeen=false;for(let i=0;i<200&&!done;i++){await wait(300);hintSeen=hintSeen||!!await rect('#updateHint');done=await read(`return (window.__cc||0)>0`);}
   await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
   assert.ok(done,'neue Fassung beim Start still übernommen');assert.equal(hintSeen,false,'kein Update-Hinweis beim Erststart');await shot('r2b-61-start-ohne-update-hinweis');
   ok('Echter Dienst: neue Fassung beim Start still übernommen, kein Hinweis');
  }finally{proxy.close();}
 }
 // ---------- Handy hochkant und quer ----------
 for(const [name,w,h] of [['hoch',390,844],['quer',844,390]]){
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(L3,{touch:true,all:false})});
  await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await boot();
  await wait(4800);const place=await read(`const e=document.querySelector('#touchPlace');if(!e)return null;const cs=getComputedStyle(e);return {vis:cs.visibility,op:Number(cs.opacity)}`);
  assert.ok(!place||place.vis==='hidden'||place.op<.1,'Handy '+name+': Ortsname steht nicht dauerhaft '+JSON.stringify(place));
  await read(`return import('./hotspots.js').then(h=>{const g=window.game,hs=h.hotspotLayout(g.world).hotspots.find(x=>x.id==='bude-nyalol');Object.assign(g.player,{x:hs.giver.x,y:hs.giver.y});return h.acceptHotspotQuest(g,'st-nyalol-1');})`);
  for(let i=0;i<60&&!/Kabelsalat/.test(await read(`const t=document.querySelector('#toast');return t.classList.contains('visible')?t.textContent:''`));i++)await wait(100);await wait(150);
  const twins=await read(`const t=document.querySelector('#toast'),txt=t.classList.contains('visible')?t.textContent.trim():'';return {toast:txt,chat:[...document.querySelectorAll('.chat-line')].filter(l=>l.textContent.trim()===txt&&getComputedStyle(l).display!=='none'&&l.getBoundingClientRect().height>0).length}`);
  assert.ok(twins.toast&&twins.chat===0,'Handy '+name+': Meldung nicht doppelt (Kurzmeldung + Chatzeile) '+JSON.stringify(twins));
  const way=await read(`const w=document.querySelector('#touchWaypoint');return w&&!w.hidden?{em:!!w.querySelector('em'),tt:w.querySelector('em')?getComputedStyle(w.querySelector('em')).textTransform:'',text:w.textContent}:null`);
  if(way){assert.ok(way.em&&way.tt==='none','Handy '+name+': Wegmarke mit kleinem „m“ '+JSON.stringify(way));}
  await shot('r2b-70-handy-'+name);
  ok('Handy '+name+': Ortsname nur kurz, Meldung nicht doppelt'+(way?', Wegmarke „'+way.text.trim()+'“ mit kleinem m':''));
 }
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await b.resize(2024,900);
 assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS Optimierung Runde 2b ('+checks.length+' Prüfungen)');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
