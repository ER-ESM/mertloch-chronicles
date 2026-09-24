// Optimierung Runde 2a „Fenster“ (2026-09-24): prüft jeden Punkt per Klickpfad im echten Spiel (Desktop 2024×900, dazu Handy).
// 1 Aufträge als WoW-Questlog · 2 Fensterhöhe nur an sichtbaren Leisten · 3 Fensterraster (Ober-/Unterkante, Gespräch, Mitte, Menü)
// 4 Gespräch kompakt · 5 Hilfe als Tastenraster + Einstellungen im Spielmenü · 6 Kniffe wie das Zauberbuch · 7 Talente ohne Scrollen
// 8 Kartenliste einzeilig mit verfolgtem Ziel oben · 9 Esc schließt alle Fenster · 10 Held nie unter Fenstern verloren · 11 kein Scrollen
// Misst je Fenster scrollHeight gegen clientHeight (die Prüfskripte blenden Scrollbalken aus). Bilder: visual-review/optimierung-r2a/.
// Ports: CDP 9487, Server 4287 (änderbar über CDP_PORT/SERVER_PORT).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {DIALOG_UI,QUESTLOG_UI} from '../content/index.js';
const dir='visual-review/optimierung-r2a';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9487),serverPort:Number(process.env.SERVER_PORT||4287)});
const read=js=>b.evaluate(`(async()=>{const g=window.game;${js}})()`);
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}:null;`);
const win=id=>rect(`.game-popup[data-window="${id}"]`);
const open=()=>read(`return [...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window)`);
const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(250);};
const mouse=(x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse',...extra});
const clickAt=async(x,y,button='left')=>{await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button,clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button,clickCount:1});await wait(250);};
const click=async sel=>{const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await clickAt(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2));};
async function hoverTip(sel){const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await mouse(5,450);await wait(80);await mouse(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2));await wait(300);return read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:''`);}
async function zoom(path,sel,pad=16){const r=typeof sel==='string'?await rect(sel):sel;if(!r)return;const x=Math.max(0,r.l-pad),y=Math.max(0,r.t-pad);const shot=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x,y,width:r.w+2*pad,height:r.h+2*pad,scale:2}});writeFileSync(path,Buffer.from(shot.data,'base64'));}
const shot=async name=>{await mouse(1000,885);await wait(120);await b.screenshot(`${dir}/${name}.jpg`);};
/** Scrollt etwas in einem Fenster? .popup-body immer, Innenbereiche mit overflow auto/scroll. Liefert „fenster bereich innen/sichtbar“. */
const scrolling=()=>read(`return [...document.querySelectorAll('.game-popup')].filter(p=>p.offsetParent).flatMap(p=>[p.querySelector('.popup-body'),...p.querySelectorAll('.popup-body *')].filter(e=>e&&e.offsetParent&&(e.classList.contains('popup-body')||/auto|scroll/.test(getComputedStyle(e).overflowY))&&e.scrollHeight>e.clientHeight+2).map(e=>p.dataset.window+' '+(e.classList.contains('popup-body')?'.popup-body':String(e.className||e.tagName).split(' ')[0])+' '+e.scrollHeight+'/'+e.clientHeight))`);
const measures={};const measure=async key=>{measures[key]=await read(`return [...document.querySelectorAll('.game-popup')].map(p=>{const r=p.getBoundingClientRect(),body=p.querySelector('.popup-body');return {id:p.dataset.window,x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),scroll:body.scrollHeight+'/'+body.clientHeight};})`);return measures[key];};
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const near=(a,b,tol=2)=>Math.abs(a-b)<=tol;
const made=createCharacter(null,{name:'Runde Zwei',classId:'dieter',look:'dieter'});
function seed(save,{touch=false}={}){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',...save};return 'delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-intro-'+made.character.id+'","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));');}
const ACCEPT=`g.quest.accepted=true;const H=await import('./hotspots.js');const L=H.hotspotLayout(g.world);for(const [spot,id] of [['bude-nyalol','st-nyalol-1'],['kirchhof','hs-kirchhof-1']]){const h=L.hotspots.find(h=>h.id===spot);if(!h)continue;g.player.x=h.giver.x;g.player.y=h.giver.y;try{H.acceptHotspotQuest(g,id);}catch(e){}}`;
async function start({level=12,accept=true,touch=false,w=2024,h=900}={}){
 const save={level,tutorial:{version:1,step:8,completed:true},rpg:{inventory:[{id:'brezel',count:3},{id:'dosenklinge',count:1},{id:'regenjacke',count:1},{id:'currywurst',count:2}],coins:237}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(save,{touch})});
 if(touch){await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
 else{await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(w,h);}
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<120&&!await b.evaluate('!!window.game');i++)await wait(150);
 await read(`document.querySelector('.intro-skip')?.click();g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();${accept?ACCEPT:''}g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;g.moveTo=null;g.keys.clear();`);
 await closeAll();await wait(2500);
}
const calm=()=>read(`g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>600);g.player.inCombat=0;g.target=null;g.stopAuto?.();g.moveTo=null;`);
try{
 await start();await calm();
 // ---------- 1) Aufträge als WoW-Questlog ----------
 await b.press('j');await wait(700);
 const q=await read(`const p=document.querySelector('.popup-quest');return {rows:p.querySelectorAll('.ql-row').length,details:p.querySelectorAll('.ql-detail:not([hidden])').length,filters:p.querySelectorAll('.popup-titlebar .ql-filters [data-quest-filter]').length,tabs:[...p.querySelectorAll('.ql-tabs [data-ql-tab]')].map(t=>t.dataset.qlTab),cards:p.querySelectorAll('.quest-entry,.quest-reward,.conversation-quote').length,tiles:p.querySelectorAll('.ql-detail:not([hidden]) .rt-tile').length,tools:[...p.querySelectorAll('.ql-detail:not([hidden]) .ql-tool')].map(t=>t.dataset.tooltipLabel),prose:[...p.querySelectorAll('.quest-log p')].filter(e=>e.offsetParent).length}`);
 assert.ok(q.rows>=3,'Titelliste mit allen laufenden Aufträgen '+JSON.stringify(q));assert.equal(q.details,1,'genau ein Detail');assert.equal(q.filters,3,'Aktiv/Dorf/Erledigt in der Titelzeile');
 assert.deepEqual(q.tabs,['log','base','memories'],'Symbolreiter unten');assert.equal(q.cards,0,'keine Pergamentkarten, keine Zitatkarte');assert.ok(q.tiles>=2,'Belohnung als Kacheln');assert.equal(q.prose,0,'kein Fließtext im Questlog');
 assert.ok(q.tools.some(t=>t===QUESTLOG_UI.mapTarget),'„Ziel auf der Karte“ statt Auftraggeber '+JSON.stringify(q.tools));
 const qw=await win('quest');assert.ok(near(qw.l,460,3)&&near(qw.t,183,3)&&qw.w===420,'Platz 460/183, 420 breit '+JSON.stringify(qw));
 assert.deepEqual(await scrolling(),[],'Aufträge scrollen nicht');
 await shot('r2a-01-auftraege');await zoom(`${dir}/r2a-01z-auftraege.jpg`,'.popup-quest');
 // Auswahl wechselt das Detail ohne Neuaufbau, Doppelklick verfolgt
 const second=await read(`return [...document.querySelectorAll('.popup-quest .ql-row:not(.selected)')][0]?.dataset.qlSelect`);await click(`.popup-quest [data-ql-select="${second}"]`);
 assert.equal(await read(`return document.querySelector('.popup-quest .ql-detail:not([hidden])').dataset.qlDetail`),second,'Klick wählt aus');
 assert.match(await hoverTip(`.popup-quest [data-ql-select="${second}"]`),/\S/,'Titel-Tooltip trägt Beschreibung');
 if(await read(`return !!document.querySelector('.popup-quest .ql-detail:not([hidden]) [data-ql-track]:not(.on)')`)){await click('.popup-quest .ql-detail:not([hidden]) [data-ql-track]');await wait(300);
  const tracked=await read(`const {focusedKey}=await import('./quest-tracker.js');return focusedKey(g)`);assert.equal(tracked,second,'Verfolgen setzt die Wegmarke');}
 // Lesen: Beschreibung als eigene Seite, Zurück
 await click('.popup-quest .ql-detail:not([hidden]) [data-ql-read]');assert.ok(await read(`return !!document.querySelector('.popup-quest .ql.ql-reading .ql-read-page:not([hidden]) p')`),'Lesen zeigt die Beschreibung');await zoom(`${dir}/r2a-02z-auftrag-lesen.jpg`,'.popup-quest');
 assert.deepEqual(await scrolling(),[],'Leseseite scrollt nicht');await click('.popup-quest .ql-read-page:not([hidden]) [data-ql-back]');assert.equal(await read(`return document.querySelector('.popup-quest .ql').classList.contains('ql-reading')`),false);
 // Filter und Reiter
 await click('.popup-quest .popup-titlebar [data-quest-filter="open"]');await wait(300);assert.equal(await read(`return document.querySelector('.popup-quest .ql').dataset.qlFilter`),'open','Filter „Im Dorf“');assert.deepEqual(await scrolling(),[],'Im Dorf scrollt nicht');await zoom(`${dir}/r2a-03z-auftraege-im-dorf.jpg`,'.popup-quest');
 await click('.popup-quest .popup-titlebar [data-quest-filter="active"]');await wait(300);
 for(const tab of ['base','memories']){await click(`.popup-quest [data-ql-tab="${tab}"]`);assert.equal(await read(`return document.querySelector('.popup-quest').dataset.qlTab`),tab);assert.deepEqual(await scrolling(),[],tab+' scrollt nicht');await zoom(`${dir}/r2a-04z-reiter-${tab}.jpg`,'.popup-quest');}
 await click('.popup-quest [data-ql-tab="log"]');
 // „auf der Karte“ beim Hauptauftrag zeigt das verfolgte Ziel, nicht Kisten-Ida
 await click('.popup-quest [data-ql-select="main"]');await click('.popup-quest .ql-detail:not([hidden]) [data-ql-map]');await wait(900);
 /* Runde 4a: statt des Blocks „Dein nächster Halt“ ist die gewählte Zeile der Seitenleiste markiert */const sel=await read(`return document.querySelector('.popup-map .wk-row[aria-pressed="true"] b')?.textContent||''`),dest=await read(`return g.mainDestination()?.label||''`);
 assert.ok((await open()).includes('map'),'Karte geht auf');assert.ok(sel,'Karte wählt ein Ziel');assert.notEqual(sel,'Kisten-Ida','Karte zeigt nicht den Auftraggeber');assert.equal(await read(`return !g.trackedQuest&&!g.hotspots?.tracked`),true,'Hauptauftrag wird verfolgt');
 ok('1 Aufträge: Titelliste, ein Detail mit Häkchen und Kacheln, Filter oben, Symbolreiter unten, Lesen, Karte zeigt das Ziel („'+sel+'“ / Ziel „'+dest+'“)');
 // ---------- 8) Karte: Liste einzeilig, verfolgtes Ziel oben ----------
 const m=await read(`const rows=[...document.querySelectorAll('.popup-map .atlas-place')];return {n:rows.length,first:rows[0]?.className,tall:rows.filter(r=>r.getBoundingClientRect().height>34).length,second:rows.some(r=>r.querySelector('small')&&r.querySelector('small').offsetParent),numbers:rows.filter(r=>/^\\s*\\d+\\s*$/.test(r.querySelector('i')?.textContent||'')).length,dim:getComputedStyle(rows[1]).opacity,lastVisible:(()=>{const s=document.querySelector('.popup-map #atlasPlaces').getBoundingClientRect(),l=rows.at(-1).getBoundingClientRect();return l.bottom<=s.bottom+1;})()}`);
 assert.match(m.first,/atlas-tracked/,'verfolgtes Ziel steht oben');assert.equal(m.tall,0,'jede Zeile einzeilig');assert.equal(m.second,false,'keine Zweitzeile');assert.equal(m.numbers,0,'keine eigene Nummerierung');assert.ok(Number(m.dim)<1,'Rest gedimmt');assert.ok(m.lastVisible,'alle Orte sichtbar ohne Scrollen');
 assert.deepEqual(await scrolling(),[],'Karte scrollt nicht');await shot('r2a-08-karte');await zoom(`${dir}/r2a-08z-karte-liste.jpg`,'.popup-map .atlas-sidebar');
 ok('8 Karte: '+m.n+' Orte einzeilig (Symbol, Name, m), verfolgtes Ziel hervorgehoben oben, Rest gedimmt, keine Nummern, kein Scrollen');
 await closeAll();
 // ---------- 2) Fensterhöhe nur an sichtbaren Leisten ----------
 await b.press('j');await wait(500);const withBars=await win('quest');
 const bars=await read(`const {visibleBars}=await import('./popup-windows.js');return visibleBars().map(r=>({l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right)}))`);
 const hide=`for(const el of document.querySelectorAll('.action-area>*:not(#actionBar)'))el.dataset.r2aHidden=el.style.visibility||'x',el.style.visibility='hidden';window.dispatchEvent(new Event('resize'));`;
 await read(hide);await wait(400);const withoutBars=await win('quest');await read(`for(const el of document.querySelectorAll('[data-r2a-hidden]')){el.style.visibility=el.dataset.r2aHidden==='x'?'':el.dataset.r2aHidden;delete el.dataset.r2aHidden;}window.dispatchEvent(new Event('resize'));`);await wait(400);
 const mainBar=await rect('#actionBar');assert.ok(withoutBars.b>withBars.b+40,'unsichtbare Leisten kosten keine Höhe '+JSON.stringify({withBars,withoutBars}));assert.ok(withoutBars.b<=mainBar.t,'endet über der sichtbaren Hauptleiste');
 assert.equal(await win('quest').then(r=>r.b),withBars.b,'wieder sichtbar: wieder die alte Kante');
 ok(`2 Boden aus sichtbaren Leisten (${bars.length} sichtbar): mit Haltungs-/zweiter Leiste Unterkante ${withBars.b}, ohne ${withoutBars.b} (Hauptleiste ${mainBar.t})`);
 await closeAll();
 // ---------- 3) Fensterraster ----------
 for(const k of 'cjip'){await b.press(k);await wait(350);}await wait(300);
 const four=await Promise.all(['person','quest','book','bag'].map(win));const tops=new Set(four.map(r=>r.t)),bottoms=new Set(four.map(r=>r.b));
 assert.equal(tops.size,1,'eine Oberkante '+JSON.stringify(four));/* Runde 3b (WoW teilt nur die Oberkante): Figur, Kniffe und Rucksack sind so hoch wie ihr Inhalt, keine Unterkante liegt tiefer als die der Aufträge */const qb=four[1].b;assert.ok(four.every(r=>r.b<=qb),'keine Unterkante unter der gemeinsamen Grenze '+JSON.stringify(four));
 assert.deepEqual(await scrolling(),[],'vier Fenster scrollen nicht');await measure('vier');await shot('r2a-10-vier-fenster');
 const top=four[0].t,bottom=four[1].b;await closeAll();
 await read(`g.quest.accepted=false;g.player.x=g.world.npc.x+20;g.player.y=g.world.npc.y+10;`);await wait(300);await b.press('f');await wait(900);
 const d=await win('dialog');assert.ok(d,'Gespräch offen');assert.ok(near(d.l,12,2)&&d.t===top&&d.b<=bottom,'Gespräch auf dem Figurplatz, gleiche Oberkante, Höhe nach Inhalt '+JSON.stringify({d,top,bottom}));
 ok(`3 Raster: Figur/Aufträge/Kniffe/Rucksack und Gespräch auf y=${top}…${bottom}, Gespräch bei x=${d.l}`);
 // ---------- 4) Gespräch kompakt ----------
 const g4=await read(`const p=document.querySelector('.popup-dialog'),body=p.querySelector('.popup-body'),acc=p.querySelector('#acceptQuest'),r=acc.getBoundingClientRect(),pr=p.getBoundingClientRect(),lines=p.querySelector('.dlg-lines');return {portrait:!!p.querySelector('.popup-titlebar .dlg-portrait'),name:p.querySelector('.popup-titlebar strong').textContent,head:!!p.querySelector('.conversation-person:not([hidden])'),parchment:p.querySelectorAll('.loot,.hotspot-offer .conversation-quote:not(.dlg-lines *)').length,accept:acc.textContent.trim(),acceptNote:acc.dataset.tooltipNote||'',acceptVisible:r.bottom<=pr.bottom&&r.top>=pr.top&&r.height>0,lineH:lines?lines.clientHeight:0,lineFont:lines?parseFloat(getComputedStyle(lines).lineHeight):0,more:!!p.querySelector('.dlg-more:not([hidden])'),tiles:p.querySelectorAll('.rt-tile').length,emptyTitle:p.querySelector('.popup-titlebar strong').offsetHeight>0}`);
 assert.ok(g4.portrait,'Porträt in der Titelzeile');assert.equal(g4.name,'Kisten-Ida');assert.equal(g4.head,false,'keine Kopfkarte');assert.equal(g4.parchment,0,'keine Pergamentkarten');
 assert.equal(g4.accept,DIALOG_UI.accept,'Knopf heißt Annehmen');assert.ok(g4.acceptNote.length>5,'witziger Satz im Tooltip');assert.ok(g4.acceptVisible,'Annehmen sichtbar ohne Scrollen');
 /* Runde 3b: so viele Zeilen, wie das Fenster hergibt, höchstens zehn */assert.ok(g4.lineH<=g4.lineFont*10+2,'höchstens 10 Zeilen Text '+JSON.stringify(g4));assert.ok(g4.tiles>=2,'Belohnung als Kacheln');
 assert.match(await hoverTip('.popup-dialog #acceptQuest'),/Annehmen[\s\S]*Hose/i,'Tooltip: Annehmen + witziger Satz');
 assert.deepEqual(await scrolling(),[],'Gespräch scrollt nicht');await shot('r2a-20-gespraech');await zoom(`${dir}/r2a-20z-gespraech.jpg`,'.popup-dialog');
 if(g4.more){await click('.popup-dialog .dlg-more');assert.ok(await read(`return document.querySelector('.popup-dialog .dlg-text').classList.contains('open')`),'Mehr klappt auf');await zoom(`${dir}/r2a-21z-gespraech-mehr.jpg`,'.popup-dialog');assert.deepEqual(await scrolling(),[],'aufgeklappt scrollt nichts');}
 ok('4 Gespräch: Porträt+Name in der Titelzeile, '+Math.round(g4.lineH/g4.lineFont)+' Zeilen Text'+(g4.more?' + Mehr':'')+', Kacheln, „Annehmen“ sichtbar, witziger Satz im Tooltip');
 await closeAll();await read(`g.quest.accepted=true;g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;`);await calm();await wait(300);
 // ---------- 3b/5) Hilfe als Tastenraster, mittig auf der Oberkante; Einstellungen im Spielmenü ----------
 await b.press('h');await wait(600);const h=await win('guide');
 const h5=await read(`const p=document.querySelector('.popup-guide');return {caps:p.querySelectorAll('.help-grid .hk-cap').length,rows:p.querySelectorAll('.help-grid .hk-item').length,prose:[...p.querySelectorAll('.help-grid p,.help-grid li,.help-grid table')].length,settings:p.querySelectorAll('.help-settings').length,tabs:p.querySelectorAll('.popup-titlebar [data-help-tab]').length,film:!!p.querySelector('.popup-titlebar [data-intro-replay]'),rowsOneLine:[...p.querySelectorAll('.help-grid .hk-item')].every(r=>r.getBoundingClientRect().height<48)}`);
 assert.equal(h.t,top,'Hilfe auf der gemeinsamen Oberkante');/* Runde 3b: Tastenbelegungsliste 720×≈370 (Zielbild 3) */assert.ok(h.w<=740&&h.h<=400,'Hilfe ≈ 720×370 '+JSON.stringify(h));assert.ok(h5.caps>=25&&h5.rows>=20,'Tastenliste '+JSON.stringify(h5));
 assert.equal(h5.prose,0,'keine Sätze im Raster');assert.equal(h5.settings,0,'keine Einstellungen in der Hilfe');assert.equal(h5.tabs,2);assert.ok(h5.film,'Film als Symbol');assert.ok(h5.rowsOneLine,'jede Themenzeile einzeilig');
 assert.match(await hoverTip('.popup-guide .hk-item[data-tooltip-note]'),/Laufweg|Rechtsklick/i,'Zusatzwissen im Tooltip');assert.deepEqual(await scrolling(),[],'Hilfe scrollt nicht');
 await shot('r2a-30-hilfe');await zoom(`${dir}/r2a-30z-hilfe.jpg`,'.popup-guide');
 await click('.popup-guide [data-help-tab="kniffe"]');await wait(300);assert.deepEqual(await scrolling(),[],'Hilfe/Kniffe scrollt nicht');await zoom(`${dir}/r2a-31z-hilfe-kniffe.jpg`,'.popup-guide');
 await closeAll();await b.press('Escape');await wait(500);const menu=await win('menu');/* Spielmenü nach WoW-Vorbild (Feinschliff 8a10565) hat zwei Einträge mehr: 393 px, weiter schmal und ohne Scrollen */assert.ok(menu&&menu.w<=240&&menu.h<=420,'Spielmenü kompakt '+JSON.stringify(menu));assert.deepEqual(await scrolling(),[],'Spielmenü scrollt nicht');await zoom(`${dir}/r2a-32z-spielmenue.jpg`,'.popup-menu');
 await click('.popup-menu [data-shell="settings"]');await wait(500);assert.deepEqual(await open(),['settings'],'Einstellungen als eigenes Fenster');assert.deepEqual(await scrolling(),[],'Einstellungen scrollen nicht');await zoom(`${dir}/r2a-33z-einstellungen.jpg`,'.popup-settings');
 ok(`5 Hilfe ${h.w}×${h.h} mit ${h5.caps} Kappen in ${h5.rows} Zeilen, Erklärung im Tooltip; Einstellungen eigenes Fenster aus dem Spielmenü (${menu.w}×${menu.h})`);
 await closeAll();
 // ---------- 6) Kniffe wie das Zauberbuch ----------
 await b.press('p');await wait(600);
 const k=await read(`const p=document.querySelector('.popup-book'),tiles=[...p.querySelectorAll('.icon-skillbook:not(.passive-book)>.book-skill')];return {keys:tiles.map(t=>t.querySelector('kbd')?.textContent||''),locked:tiles.filter(t=>t.classList.contains('locked')).map(t=>({lock:!!t.querySelector('.book-lock'),kbd:!!t.querySelector('kbd'),star:/★/.test(t.textContent.replace(t.querySelector('.book-skill-name')?.textContent||'','').replace(t.querySelector('.book-skill-origin')?.textContent||''))})),size:tiles.map(t=>Math.round(t.getBoundingClientRect().width)),canvasBorder:getComputedStyle(tiles[0].querySelector('canvas')).borderTopWidth,divider:!!p.querySelector('.book-divider[data-tooltip-label]'),reset:!!p.querySelector('.popup-titlebar [data-reset-bar]'),head:[...p.querySelectorAll('.book-passives h3')].filter(e=>e.offsetParent).length,passives:p.querySelectorAll('.passive-book .book-skill').length}`);
 const bound=k.keys.filter(Boolean),order=['1','2','3','4','5','6','7','8','9','0','Q','Leer'];assert.deepEqual(bound,order.filter(x=>bound.includes(x)),'nach Taste sortiert '+JSON.stringify(k.keys));
 assert.ok(k.locked.length>0&&k.locked.every(l=>l.lock&&!l.kbd&&!l.star),'gesperrt: Schloss, kein Stern, keine Taste '+JSON.stringify(k.locked));assert.ok(k.size.every(s=>s===44),'Slots 44 px');assert.equal(k.canvasBorder,'0px','kein doppelter Rahmen');
 assert.ok(k.divider,'Trenner mit Symbol');assert.equal(k.head,0,'keine Überschrift „Eigenarten & Leisten“');assert.ok(k.reset,'Zurücksetzen in der Titelzeile');assert.ok(k.passives>0);
 assert.deepEqual(await scrolling(),[],'Kniffe scrollen nicht');await shot('r2a-40-kniffe');await zoom(`${dir}/r2a-40z-kniffe.jpg`,'.popup-book');
 ok('6 Kniffe: 44-px-Slots nach Taste ('+bound.join(' ')+'), '+k.locked.length+' gesperrt mit Schloss, Eigenarten hinter Trenner, ein Rahmen');
 await closeAll();
 // ---------- 7) Talente ohne Scrollen ----------
 await b.press('n');await wait(700);const t=await win('talents');
 const t7=await read(`const p=document.querySelector('.popup-talents');return {search:p.querySelectorAll('[data-talent-search]').length,details:p.querySelectorAll('.tt-details,[data-learn-talent]').length,specs:p.querySelectorAll('.popup-titlebar [data-view-tree]').length,paths:p.querySelectorAll('.tt-bonuses [data-view-path]').length,cards:[...p.querySelectorAll('.tt-spec-name')].filter(e=>e.offsetParent).length}`);
 assert.equal(t.t,top,'Talente auf der gemeinsamen Oberkante');assert.equal(t7.search,0,'keine Suche');assert.equal(t7.details,0,'keine Pergament-Detailbox');assert.equal(t7.specs,3,'Spec-Wappen in der Titelzeile');assert.equal(t7.cards,0,'Spec-Karten nur Symbol');assert.equal(t7.paths,3,'Pfade als Symbolreiter unten');
 assert.match(await hoverTip('.popup-talents .popup-titlebar [data-view-tree]'),/\S/,'Spec-Tooltip');
 assert.deepEqual(await scrolling(),[],'Talente scrollen nicht');await shot('r2a-50-talente');await zoom(`${dir}/r2a-50z-talente.jpg`,'.popup-talents');
 const learnable=await read(`return document.querySelector('.popup-talents .tt-node.available')?.dataset.talent||''`);if(learnable){const before=await read('return g.rpg.talents.learned.length');await click(`.popup-talents [data-talent="${learnable}"]`);await wait(300);assert.equal(await read('return g.rpg.talents.learned.length'),before+1,'Klick lernt');
  const r=await rect(`.popup-talents [data-talent="${learnable}"]`);await clickAt(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2),'right');await wait(300);assert.equal(await read('return g.rpg.talents.learned.length'),before,'Rechtsklick nimmt zurück');}
 ok(`7 Talente ${t.w}×${t.h} auf y=${t.t}: Wappen oben, Pfade unten, keine Suche/Detailbox, Klick lernt, Rechtsklick nimmt zurück`);
 await closeAll();
 // ---------- 9) Esc wie in WoW ----------
 for(const k2 of 'cji'){await b.press(k2);await wait(300);}assert.equal((await open()).length,3);
 await read(`const {spawnArena}=await import('./arena.js');spawnArena(g,{kind:'boar',count:1,dummy:true});g.target=g.enemies.find(e=>e.arena);`);const hadTarget=await read('return !!g.target');
 await b.press('Escape');await wait(300);assert.deepEqual(await open(),[],'Esc schließt alle Fenster auf einmal');if(hadTarget)assert.ok(await read('return !!g.target'),'Ziel bleibt beim ersten Esc');
 if(hadTarget){await b.press('Escape');await wait(250);assert.equal(await read('return !!g.target'),false,'zweites Esc wählt das Ziel ab');assert.deepEqual(await open(),[]);}
 await b.press('Escape');await wait(400);assert.deepEqual(await open(),['menu'],'erst ohne Fenster kommt das Spielmenü');await b.press('Escape');await wait(250);
 ok('9 Esc: drei Fenster mit einem Druck zu'+(hadTarget?', dann Ziel ab':'')+', dann Spielmenü');
 // ---------- 10) Held nie unter Fenstern verloren ----------
 await calm();await b.press('p');await wait(500);
 const covered=await read(`await new Promise(r=>setTimeout(r,300));return !!window.mertloch&&document.querySelector('.popup-book').getBoundingClientRect().left<innerWidth/2&&document.querySelector('.popup-book').getBoundingClientRect().right>innerWidth/2`);
 assert.ok(covered,'Kniffe liegen über der Bildmitte (Held)');
 assert.equal(await read(`return document.querySelector('.popup-book').classList.contains('hero-seethrough')`),false,'in Ruhe bleibt das Fenster voll');
 await read(`g.navigate({x:g.player.x+600,y:g.player.y+40});`);await mouse(1000,885);await wait(450);
 const r10=await read(`const p=document.querySelector('.popup-book'),cs=getComputedStyle(p);return {cls:p.classList.contains('hero-seethrough'),op:parseFloat(cs.opacity),folded:getComputedStyle(p.querySelector('.popup-body')).display==='none'&&p.getBoundingClientRect().height<60,pe:getComputedStyle(p.querySelector('button')).pointerEvents,moving:!!g.moveTo,ghost:window.game&&document.querySelector('#world')?true:false}`);
 assert.ok(r10.moving,'Figur läuft von selbst');/* Runde 3b: statt 30 %-Geisterbild klappt das Fenster auf die Titelzeile ein */assert.ok(r10.cls&&r10.folded&&r10.pe==='none','eingeklappt und klickdurchlässig '+JSON.stringify(r10));
 await shot('r2a-60-held-unter-fenster');
 const bk=await win('book');await mouse(bk.l+60,bk.t+15);/* Maus über der stehenden Titelzeile */await wait(350);assert.equal(await read(`return document.querySelector('.popup-book').classList.contains('hero-seethrough')`),false,'Hover macht es wieder voll');await mouse(1000,885);await wait(400);
 await read(`g.moveTo=null;g.path=null;g.player.inCombat=6;`);await wait(400);assert.ok(await read(`return document.querySelector('.popup-book').classList.contains('hero-seethrough')`),'im Kampf ebenfalls durchsichtig');
 await zoom(`${dir}/r2a-60z-held-umriss.jpg`,{l:1012-160,t:450-140,w:320,h:240},0);
 await read(`g.player.inCombat=0;`);await wait(400);assert.equal(await read(`return document.querySelector('.popup-book').classList.contains('hero-seethrough')`),false,'nach dem Kampf wieder voll');assert.deepEqual(await open(),['book'],'Fenster bleibt offen');
 ok('10 Held: beim Auto-Laufen und im Kampf klappen überdeckende Fenster auf die Titelzeile ein (Runde 3b) und sind klickdurchlässig, Hover klappt sie auf, Umriss über den Renderer, nichts schließt');
 await closeAll();
 // ---------- 11) kein Fenster scrollt (alle einzeln, Desktop 2024×900) ----------
 const all=[];for(const k3 of 'cjinphm'){await closeAll();await b.press(k3);await wait(600);all.push(...await scrolling());}await closeAll();
 assert.deepEqual(all,[],'kein Fenster scrollt');ok('11 kein Fenster scrollt am Desktop (C J I N P H M, Gespräch, Einstellungen, Spielmenü)');
 // Vorschau der Talente auf Stufe 1
 await start({level:1});await calm();await b.press('n');await wait(700);const t1=await win('talents');
 const p1=await read(`const p=document.querySelector('.popup-talents');return {locked:!!p.querySelector('.tt-locked .tt-lock-row'),paths:[...p.querySelectorAll('[data-view-path]')].filter(e=>e.offsetParent).length,specs:[...p.querySelectorAll('[data-view-tree]')].filter(e=>e.offsetParent).length}`);
 assert.ok(p1.locked&&p1.paths===0&&p1.specs===3,'Stufe 1: drei Wappen und Schloss '+JSON.stringify(p1));assert.ok(t1.h<=260,'kompakt '+JSON.stringify(t1));assert.deepEqual(await scrolling(),[]);await zoom(`${dir}/r2a-51z-talente-stufe1.jpg`,'.popup-talents');
 ok(`7 Stufe 1: kompakte Vorschau ${t1.w}×${t1.h} statt drei Reiter plus drei Unterreiter`);
 // Handy quer und hoch: Messwerte und Bilder (Ziel: nicht scrollen; bildschirmfüllend erlaubt)
 const phone={};
 for(const [name,w,h2] of [['quer',844,390],['hoch',390,844]]){await start({touch:true,w,h:h2});
  for(const id of ['quest','guide','book','person','bag']){await closeAll();await read(`document.querySelector('#touchMenu').click()`);await wait(400);await read(`document.querySelector('.game-menu-windows [data-shell="${id}"]')?.click()`);await wait(700);phone[name+' '+id]=await scrolling();await b.screenshot(`${dir}/r2a-70-handy-${name}-${id}.jpg`);}
  for(const id of ['quest','guide'])assert.deepEqual(phone[name+' '+id],[],'Handy '+name+': '+id+' scrollt nicht');}
 writeFileSync(`${dir}/messwerte.json`,JSON.stringify({measures,phone},null,2));
 ok('Handy quer/hoch: Aufträge und Hilfe ohne Scrollen; Rest siehe messwerte.json '+JSON.stringify(Object.fromEntries(Object.entries(phone).filter(([,v])=>v.length))));
 if(b.errors.length)console.log('Konsolenfehler',JSON.stringify(b.errors).slice(0,1500));
 console.log(`\n${checks.length} Prüfungen grün. Bilder: ${dir}/`);
}catch(e){console.error('FAIL',e);await b.screenshot(`${dir}/r2a-fehler.jpg`).catch(()=>{});process.exitCode=1;}finally{b.close();}
