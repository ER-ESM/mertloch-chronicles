// Optimierung Runde 3b „UI-Grafik & Handy“ (2026-09-24): prüft jeden Punkt per Klickpfad im echten Spiel.
// 1 Handy ohne Scrollen (quer 844×390, hoch 390×844), Menükacheln ohne Überlauf, HP einzeilig, Meldungen nicht übereinander, 44-px-Ziele
// 2 Fensterhöhe nach Inhalt (Kniffe, Gespräch), „Mehr“ nicht auf dem letzten Wort · 3 Gegenstands-Tooltip (≤ 300×300, Vergleich daneben)
// 4 Hilfe als Tastenbelegungsliste · 5 Aktionsfläche 122 px, Haltung im Rahmen · 6 Zonentitel frei von Fenstertiteln, nur EIN Schriftzug
// 7 Fenster über dem Helden klappen ein · 8 Tooltips nie auf Auslöser/Verfolgung/Menüleiste · 9 Rucksack-Kopf eine Zeile, Auswahlfelder
// Scrollmessung je Fenster auf allen drei Größen (scrollHeight gegen clientHeight von .popup-body und jedem overflow:auto/scroll).
// Bilder: visual-review/optimierung-r3b/check/. Ports: CDP 9515, Server 4315 (über CDP_PORT/SERVER_PORT änderbar).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/optimierung-r3b/check';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9515),serverPort:Number(process.env.SERVER_PORT||4315)});
const read=js=>b.evaluate(`(async()=>{const g=window.game;${js}})()`);
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}:null;`);
const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(250);};
const mouse=(x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse',...extra});
const clickAt=async(x,y)=>{await mouse(x,y);await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});await wait(250);};
async function hover(sel){const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await mouse(5,450);await wait(80);await mouse(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2));await wait(450);return r;}
const tips=()=>read(`const out={};for(const s of ['#itemTooltip','#itemCompareTip']){const e=document.querySelector(s);if(e&&!e.classList.contains('hidden')&&getComputedStyle(e).display!=='none'){const r=e.getBoundingClientRect();out[s]={l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height),text:e.innerText};}}return out;`);
const hit=(a,c)=>!!a&&!!c&&a.l<c.r&&c.l<a.r&&a.t<c.b&&c.t<a.b;
const scrolling=()=>read(`return [...document.querySelectorAll('.game-popup')].filter(p=>p.offsetParent).flatMap(p=>[p.querySelector('.popup-body'),...p.querySelectorAll('.popup-body *')].filter(e=>e&&e.offsetParent&&(e.classList.contains('popup-body')||/auto|scroll/.test(getComputedStyle(e).overflowY))&&e.scrollHeight>e.clientHeight+2).map(e=>p.dataset.window+' '+(e.classList.contains('popup-body')?'.popup-body':String(e.className||e.tagName).split(' ')[0])+' '+e.scrollHeight+'/'+e.clientHeight))`);
const shot=async name=>{await b.screenshot(`${dir}/${name}.jpg`);};
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};const report={};
const made=createCharacter(null,{name:'Runde Drei',classId:'dieter',look:'dieter'});
const INV=[{id:'brezel',count:3},{id:'dosenklinge',count:1},{id:'regenjacke',count:1},{id:'pfandring',count:1},{id:'keilerzahn',count:1},{id:'megafon',count:1},{id:'currywurst',count:2},{id:'feder',count:7}];
function seed(touch){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',level:12,tutorial:{version:1,step:8,completed:true},rpg:{inventory:INV,coins:237}};return 'delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-intro-'+made.character.id+'","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));');}
const ACCEPT=`g.quest.accepted=true;const H=await import('./hotspots.js');const L=H.hotspotLayout(g.world);for(const [spot,id] of [['bude-nyalol','st-nyalol-1'],['kirchhof','hs-kirchhof-1']]){const h=L.hotspots.find(h=>h.id===spot);if(!h)continue;g.player.x=h.giver.x;g.player.y=h.giver.y;try{H.acceptHotspotQuest(g,id);}catch(e){}}`;
async function start({touch=false,w=2024,h=900}={}){
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(touch)});
 if(touch){await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
 else{await b.send('Emulation.clearDeviceMetricsOverride');await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(w,h);}
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<120&&!await b.evaluate('!!window.game');i++)await wait(150);
 await read(`document.querySelector('.intro-skip')?.click();g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();${ACCEPT}g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;g.moveTo=null;g.keys.clear();`);
 await closeAll();await wait(3500);}
const calm=()=>read(`g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>600);g.player.inCombat=0;g.target=null;g.stopAuto?.();g.moveTo=null;g.path=null;`);
const popup=id=>rect(`.game-popup[data-window="${id}"]`);
try{
 // =============== Desktop 2024×900 ===============
 await start();await calm();
 // ---------- Scrollmessung je Fenster ----------
 const desk={};
 for(const k of ['c','j','p','i','n','h','m']){await closeAll();await b.press(k);await wait(800);desk[k]={win:await read(`const p=document.querySelector('.game-popup');if(!p)return null;const r=p.getBoundingClientRect();return {id:p.dataset.window,t:Math.round(r.top),h:Math.round(r.height)}`),scroll:await scrolling()};assert.ok(desk[k].win,'Fenster '+k+' fehlt');assert.deepEqual(desk[k].scroll,[],'Desktop: '+k+' scrollt');}
 await closeAll();await b.press('Escape');await wait(600);assert.deepEqual(await scrolling(),[],'Spielmenü scrollt');
 await read(`document.querySelector('.popup-menu [data-shell="settings"]')?.click()`);await wait(600);assert.ok(await popup('settings'),'Einstellungen');assert.deepEqual(await scrolling(),[],'Einstellungen scrollen');await closeAll();
 report.desktop=desk;ok('Desktop: kein Fenster scrollt (Figur, Aufträge, Kniffe, Rucksack, Talente, Hilfe, Karte, Spielmenü, Einstellungen)');
 // ---------- 2 Fensterhöhe nach Inhalt, gemeinsame Oberkante ----------
 await b.press('c');await wait(400);await b.press('j');await wait(400);await b.press('p');await wait(600);
 const book=await read(`const p=document.querySelector('.game-popup[data-window="book"]'),body=p.querySelector('.popup-body'),r=p.getBoundingClientRect(),last=[...body.querySelectorAll('.book-skill')].reduce((m,e)=>Math.max(m,e.getBoundingClientRect().bottom),0);return {t:Math.round(r.top),h:Math.round(r.height),b:Math.round(r.bottom),empty:Math.round(r.bottom-last)}`);
 const person=await popup('quest')||await popup('person');
 assert.equal(book.t,person.t,'gemeinsame Oberkante');assert.ok(book.h<person.h-60,'Kniffe so hoch wie der Inhalt, nicht wie das Questlog '+JSON.stringify({book,person}));assert.ok(book.empty<=40,'kein leeres Drittel unten '+JSON.stringify(book));
 await shot('r3b-20-kniffe-inhaltshoch');ok('2 Kniffe inhaltshoch ('+book.h+' px statt '+person.h+'), gemeinsame Oberkante '+book.t+', Rest unter dem letzten Platz '+book.empty+' px');
 await closeAll();
 await read(`g.quest.accepted=false;g.player.x=g.world.npc.x+20;g.player.y=g.world.npc.y+10;g.moveTo=null;`);await wait(500);await mouse(1000,120);await b.press('f');await wait(1200);
 const dlg=await read(`const p=document.querySelector('.popup-dialog');if(!p)return null;const r=p.getBoundingClientRect(),l=p.querySelector('.dlg-lines'),m=p.querySelector('.dlg-more'),lr=l.getBoundingClientRect(),mr=m&&!m.hidden?m.getBoundingClientRect():null,lh=parseFloat(getComputedStyle(l).lineHeight);return {t:Math.round(r.top),h:Math.round(r.height),lines:Math.round(l.clientHeight/lh),clipped:l.scrollHeight>l.clientHeight+2,more:!!mr,moreBelow:mr?mr.top>=lr.bottom-1:true,accept:!!p.querySelector('.dialog-actions button')}`);
 assert.ok(dlg,'Gespräch offen');assert.equal(dlg.t,person.t,'Gespräch auf der Oberkante');assert.ok(dlg.lines>3,'mehr als drei Zeilen Text, wenn Platz ist '+JSON.stringify(dlg));assert.equal(dlg.clipped,dlg.more,'„Mehr“ genau dann, wenn der Text nicht passt');assert.ok(dlg.moreBelow,'„Mehr“ liegt unter dem Text, nicht auf dem letzten Wort');assert.ok(dlg.accept);
 assert.deepEqual(await scrolling(),[],'Gespräch scrollt nicht');report.dialog=dlg;await shot('r3b-21-gespraech');ok('2 Gespräch: '+dlg.lines+' Zeilen Text, Höhe '+dlg.h+' nach Inhalt'+(dlg.more?', „Mehr“ als eigene Zeile':''));
 await closeAll();await read(`g.quest.accepted=true;g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;`);await calm();await wait(300);
 // ---------- 3 Gegenstands-Tooltip + 9 Rucksack-Kopf ----------
 await b.press('i');await wait(700);
 const head=await read(`const p=document.querySelector('.popup-bag'),h=p.querySelector('.bag-head'),r=h.getBoundingClientRect(),kids=[...h.querySelectorAll('button')].filter(e=>e.offsetParent);return {h:Math.round(r.height),rows:(()=>{const c=kids.map(e=>{const q=e.getBoundingClientRect();return q.top+q.height/2;});return Math.max(...c)-Math.min(...c)<8?1:2;})(),lupe:!!p.querySelector('.bag-lupe'),search:getComputedStyle(p.querySelector('.bag-search')).display,foot:!!p.querySelector('.bag-foot .bag-mode select')}`);
 assert.equal(head.rows,1,'Rucksack-Kopf eine Zeile '+JSON.stringify(head));assert.ok(head.lupe&&head.search==='none'&&head.foot,'Suche als Lupe, Sortierart im Fuß '+JSON.stringify(head));
 await hover('.popup-bag .bag-lupe');await clickAt((await rect('.popup-bag .bag-lupe')).l+10,(await rect('.popup-bag .bag-lupe')).t+10);assert.equal(await read(`return getComputedStyle(document.querySelector('.popup-bag .bag-search')).display!=='none'&&document.activeElement?.matches('[data-bag-search]')`),true,'Lupe klappt das Suchfeld auf');
 await b.press('Escape');await wait(200);assert.equal(await read(`return getComputedStyle(document.querySelector('.popup-bag .bag-search')).display`),'none','Esc klappt die Suche zu');
 ok('9 Rucksack: Kopf eine Zeile ('+head.h+' px), Lupe klappt die Suche auf, Münzen/Platz/Art unten');
 const bag=await popup('bag'),track=await rect('.quest-panel'),rail=await rect('.game-menu-rail');report.itemTips={};
 for(const it of ['megafon','dosenklinge','regenjacke','brezel']){const cell=await hover(`.popup-bag [data-item="${it}"]`);const t=await tips(),main=t['#itemTooltip'],cmp=t['#itemCompareTip'];report.itemTips[it]={main:main&&{...main,text:undefined},cmp:cmp&&{...cmp,text:undefined}};
  assert.ok(main,'Tooltip '+it);assert.ok(main.w<=302&&main.h<=300,'Tooltip ≤ 300 × 300: '+it+' '+JSON.stringify(main));
  const c={l:cell.l,t:cell.t,r:cell.l+cell.w,b:cell.t+cell.h};assert.ok(!hit(main,c)&&!hit(main,bag&&{l:bag.l,t:bag.t,r:bag.r,b:bag.b}),'Tooltip nicht auf Zelle/Rucksack '+it);assert.ok(main.r<=bag.l,'links vom Rucksack');
  for(const x of [main,cmp].filter(Boolean)){assert.ok(!hit(x,track),'nicht über der Verfolgung '+it);assert.ok(!hit(x,rail),'nicht über der Menüleiste '+it);}
  assert.doesNotMatch(main.text,/Glückstreffer-Chance|Vergleich|Ø je Treffer/,'ohne abgeleitete Werte und Vergleichsblock '+it);
  if(cmp){assert.ok(cmp.r<=main.l&&Math.abs(cmp.t-main.t)<=2,'Vergleich links daneben, gleiche Oberkante '+it);assert.match(cmp.text,/Angelegt/);}
  assert.ok((main.text.match(/[▲▼]/g)||[]).length<=3,'höchstens drei Delta-Zeilen '+it);
  if(it==='megafon'){await shot('r3b-30-tooltip-gegenstand');assert.ok(cmp,'Megafon zeigt den Vergleich „Angelegt“');}}
 const nameFont=await read(`const s=document.querySelector('#itemTooltip .tooltip-heading strong');return s?getComputedStyle(s).fontFamily+' '+getComputedStyle(s).fontSize+' '+getComputedStyle(s).textTransform:''`);assert.match(nameFont,/Nunito.*15px none/,'Name Nunito 15, gemischte Schreibung '+nameFont);
 await hover('.popup-bag [data-item="megafon"]');await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Shift',code:'ShiftLeft',modifiers:8});await wait(400);const sh=(await tips())['#itemTooltip'];await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Shift',code:'ShiftLeft'});
 assert.ok(sh&&sh.h<=420&&/%/.test(sh.text),'Shift zeigt die abgeleiteten Werte '+JSON.stringify(sh&&{h:sh.h}));
 ok('3 Gegenstands-Tooltip: ≤ 300×300 ('+Object.entries(report.itemTips).map(([k,v])=>k+' '+v.main.h).join(', ')+'), links vom Rucksack, Vergleich „Angelegt“ daneben, Shift '+sh.h+' px');
 await closeAll();
 // ---------- 8 Tooltips nie auf dem Auslöser ----------
 await calm();const slot2=await hover('#actionBar [data-action-slot="2"]');const bt=(await tips())['#itemTooltip'],area=await rect('.action-area');
 assert.ok(bt&&bt.b<=area.t,'Kniff-Tooltip über dem Leistenstapel, nicht auf den Plätzen '+JSON.stringify({bt,area}));await shot('r3b-40-tooltip-leiste');
 await b.press('c');await wait(600);await hover('.popup-person .gear-cell button[data-tooltip-label]');const st=(await tips())['#itemTooltip'],pw=await popup('person');
 assert.ok(st&&!/Zieh|anlegen|Platz frei/i.test(st.text)&&st.text.trim().split(/\s+/).length<=3,'Figur-Slot nur mit Namen '+JSON.stringify(st?.text));assert.ok(st.l>=pw.r,'Figur-Tooltip rechts neben dem Fenster');await closeAll();
 await calm();const qt=await rect('.quest-panel .qt-quest');assert.ok(qt,'Auftragskasten');await mouse(5,450);await wait(80);await mouse(qt.l+40,qt.t+12);await wait(450);assert.ok((await tips())['#itemTooltip'],'Tooltip am Auftragskasten');
 await clickAt(qt.l+40,qt.t+12);await mouse(1000,120);await wait(1500);assert.equal((await tips())['#itemTooltip'],undefined,'Tooltip des Auftragskastens bleibt nach dem Klick nicht stehen');await calm();
 ok('8 Tooltips: Leiste darüber (Unterkante '+bt.b+' ≤ '+area.t+'), Figur-Slot nur „'+st.text.trim()+'“ rechts neben dem Fenster, Auftragskasten schließt nach dem Klick');
 // ---------- 4 Hilfe als Tastenbelegungsliste ----------
 await b.press('h');await wait(700);const help=await read(`const p=document.querySelector('.popup-guide'),r=p.getBoundingClientRect(),items=[...p.querySelectorAll('.hk-list .hk-item')],words=items.map(i=>i.querySelector('.hk-word')?.textContent.trim()||'');return {w:Math.round(r.width),h:Math.round(r.height),t:Math.round(r.top),cols:p.querySelectorAll('.hk-list .hk-col').length,items:items.length,words,maxWords:Math.max(...words.map(w=>w.split(/\\s+/).length)),arrows:p.querySelectorAll('.hk-arrow,.hk-to').length,tips:items.filter(i=>i.dataset.tooltipNote).length,oneLine:items.every(i=>i.getBoundingClientRect().height<=30),prose:p.querySelectorAll('.help-grid p,.help-grid li').length}`);
 assert.equal(help.cols,3,'drei Spalten');assert.ok(help.items>=25,'Tastenliste vollständig '+help.items);assert.ok(help.maxWords<=2&&help.words.every(Boolean),'Kappe + ein Wort je Zeile '+JSON.stringify(help.words));assert.equal(help.arrows,0,'kein Pfeil, kein Zielsymbol');assert.ok(help.oneLine,'jede Zeile einzeilig');assert.equal(help.prose,0);
 assert.ok(help.tips<help.items,'Tooltip nur mit Mehrwert ('+help.tips+' von '+help.items+')');assert.deepEqual(await scrolling(),[],'Hilfe scrollt nicht');assert.ok(help.h<=400&&help.t===person.t,'Hilfe ≈ 720×370 auf der Oberkante '+JSON.stringify(help));
 await shot('r3b-50-hilfe');ok('4 Hilfe: '+help.cols+' Spalten, '+help.items+' Zeilen Kappe + Wort, '+help.tips+' Tooltips mit Mehrwert, '+help.w+'×'+help.h);await closeAll();
 // ---------- 5 Aktionsfläche ----------
 await calm();const bars=await read(`const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};const main=q('#actionBar'),sp=q('#specialActions'),extra=[...document.querySelectorAll('#actionBar2 .skill:not(.empty-slot)')].map(e=>e.getBoundingClientRect());const mainSlots=[...document.querySelectorAll('#actionBar .skill')].map(e=>e.getBoundingClientRect());const extraSlots=[...document.querySelectorAll('#actionBar2 .skill')].map(e=>e.getBoundingClientRect());const plate=getComputedStyle(document.querySelector('#actionBar2')).backgroundImage;const top=extra.length?Math.min(...extra.map(r=>r.top)):main.t;const loose=[...document.querySelectorAll('.action-area .skill')].filter(e=>{const r=e.getBoundingClientRect();return e.offsetParent&&!e.closest('#actionBar,#actionBar2,#actionBar3')&&r.bottom<=main.t+1;}).length;return {main,sp,stack:Math.round(main.b-top),extra:extra.length,cols:extraSlots.every((r,i)=>Math.abs(r.left-mainSlots[i].left)<1),plate,loose,spSlots:[...document.querySelectorAll('#specialActions .skill')].map(e=>Math.round(e.getBoundingClientRect().width))}`);
 assert.ok(bars.extra>0,'Fixture: zweite Leiste belegt');assert.ok(bars.stack<=124,'Stapel ≈ 122 px statt 194: '+bars.stack);assert.ok(Math.abs(bars.sp.t-bars.main.t)<1&&Math.abs(bars.sp.b-bars.main.b)<1&&Math.abs(bars.sp.r-bars.main.l)<2,'Haltung im Rahmen der Hauptleiste links '+JSON.stringify(bars));
 assert.ok(bars.cols,'zweite Leiste spaltengenau über der Hauptleiste');assert.equal(bars.loose,0,'kein loses Kästchen über der Hauptleiste');assert.deepEqual(bars.spSlots,[40,40],'zwei 40-px-Haltungsplätze');
 report.bars=bars;await b.send('Page.captureScreenshot',{format:'jpeg',quality:90}).then(()=>{});await shot('r3b-60-aktionsflaeche');ok('5 Aktionsfläche: Stapel '+bars.stack+' px, Ausweichen/Unterbrechen im Rahmen links, zweite Leiste spaltengenau ohne Platte');
 // ---------- 6 Zonentitel gegen Fenstertitel, nur ein Schriftzug ----------
 for(const k of 'cjpi'){await b.press(k);await wait(350);}
 await read(`const l=document.querySelector('.region-label');l.classList.add('zone-show');`);await wait(900);
 const zone=await read(`const l=document.querySelector('.region-label'),r=l.getBoundingClientRect(),titles=[...document.querySelectorAll('.game-popup .popup-titlebar')].map(t=>t.getBoundingClientRect());const labels=[...document.querySelectorAll('.region-label,#zoneSplash')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0);return {t:Math.round(r.top),b:Math.round(r.bottom),hits:titles.filter(t=>t.left<r.right&&r.left<t.right&&t.top<r.bottom&&r.top<t.bottom).length,splash:!!document.querySelector('#zoneSplash'),labels:labels.length,toast:parseFloat(getComputedStyle(document.querySelector('#toast')).top)}`);
 assert.equal(zone.hits,0,'Zonentitel trifft keine Fenstertitelzeile '+JSON.stringify(zone));assert.ok(zone.b<=176,'Zonentitel im Band über den Fenstern '+JSON.stringify(zone));assert.equal(zone.splash,false,'kein zweiter Ortswechsel-Schriftzug (#zoneSplash)');assert.equal(zone.labels,1,'nur EIN Ortswechsel-Schriftzug');assert.ok(Math.abs(zone.toast-64)<=2,'Fehlerzeile bei 64 px');
 await shot('r3b-70-zonentitel-fenster');await read(`document.querySelector('.region-label').classList.remove('zone-show')`);ok('6 Zonentitel mit vier Fenstern bei y '+zone.t+'–'+zone.b+', keine Titelzeile getroffen, Fehlerzeile 64 px, nur ein Schriftzug');
 // ---------- 7 Fenster über dem Helden klappen ein ----------
 await closeAll();await calm();await b.press('p');await wait(500);await read(`g.navigate({x:g.player.x+600,y:g.player.y+40});`);await mouse(1000,885);await wait(500);
 const fold=await read(`const p=document.querySelector('.game-popup[data-window="book"]');return {cls:p.classList.contains('hero-seethrough'),h:Math.round(p.getBoundingClientRect().height),op:parseFloat(getComputedStyle(p).opacity),body:getComputedStyle(p.querySelector('.popup-body')).display}`);
 assert.ok(fold.cls&&fold.h<60&&fold.op>.8&&fold.body==='none','Kniffe klappen auf die Titelzeile ein '+JSON.stringify(fold));await shot('r3b-80-eingeklappt');
 const bk=await popup('book');await mouse(bk.l+60,bk.t+15);await wait(400);assert.equal(await read(`return document.querySelector('.game-popup[data-window="book"]').classList.contains('hero-seethrough')`),false,'Hover über der Titelzeile klappt auf');
 await read(`g.moveTo=null;g.path=null;`);ok('7 Fenster über dem Helden: Titelzeile bleibt ('+fold.h+' px), Körper weg, Hover klappt auf');await closeAll();
 // =============== Handy quer und hoch ===============
 for(const [name,w,h] of [['quer',844,390],['hoch',390,844]]){
  await start({touch:true,w,h});await calm();const res={};
  for(const id of ['menu','quest','guide','book','person','bag','talents','map']){await closeAll();await read(`document.querySelector('#touchMenu')?.click()`);await wait(400);
   if(id==='menu'){res.menu=await scrolling();const m=await read(`const tiles=[...document.querySelectorAll('.popup-menu .game-menu-windows button')];return {tiles:tiles.length,over:tiles.filter(t=>{const s=t.querySelector('span');if(!s)return false;const a=s.getBoundingClientRect(),c=t.getBoundingClientRect();return a.left<c.left-1||a.right>c.right+1||a.bottom>c.bottom+1;}).length,small:[...document.querySelectorAll('.popup-menu button')].filter(e=>e.offsetParent&&Math.min(e.getBoundingClientRect().width,e.getBoundingClientRect().height)<44).length}`);assert.equal(m.over,0,name+': Menükacheln ohne überlaufende Beschriftung');assert.ok(m.tiles>=10,name+': Berufe/Fahrzeuge/Söldner als Kacheln');assert.equal(m.small,0,name+': Menü-Ziele ≥ 44 px');assert.deepEqual(res.menu,[],name+': Spielmenü scrollt');await shot(`r3b-90-${name}-menue`);continue;}
   await read(`document.querySelector('.game-menu-windows [data-shell="${id}"]')?.click()`);await wait(900);res[id]=await scrolling();assert.ok(await popup(id),name+': '+id+' offen');assert.deepEqual(res[id],[],name+': '+id+' scrollt');
   const small=await read(`return [...document.querySelectorAll('.game-popup button,.game-popup .item-slot,.game-popup select')].filter(e=>{const r=e.getBoundingClientRect();return e.offsetParent&&r.width>0&&getComputedStyle(e).visibility!=='hidden'&&Math.min(r.width,r.height)<44&&!e.closest('.empty')}).map(e=>(e.getAttribute('aria-label')||e.className).slice(0,30)+' '+Math.round(e.getBoundingClientRect().width)+'×'+Math.round(e.getBoundingClientRect().height))`);
   assert.deepEqual(small,[],name+': '+id+' Tipp-Ziele ≥ 44 px');
   if(['book','person','talents','bag'].includes(id))await shot(`r3b-91-${name}-${id}`);}
  const hp=await read(`const s=document.querySelector('#hpText');return {h:Math.round(s.getBoundingClientRect().height),lines:Math.round(s.getBoundingClientRect().height/parseFloat(getComputedStyle(s).lineHeight))}`);assert.ok(hp.lines<=1,name+': Lebenszahl einzeilig neben offenem Fenster '+JSON.stringify(hp));
  await closeAll();await read(`g.toast('Neuer Auftrag: Prüfmeldung');g.log?.('Neuer Auftrag: Chatzeile');`);await wait(400);
  const msg=await read(`const t=document.querySelector('#toast'),tr=t.getBoundingClientRect();const lines=[...document.querySelectorAll('.chat-window .chat-line')].filter(e=>e.offsetParent&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect());return {toast:t.classList.contains('visible'),hits:lines.filter(r=>r.left<tr.right&&tr.left<r.right&&r.top<tr.bottom&&tr.top<r.bottom).length}`);
  assert.equal(msg.hits,0,name+': Meldung und Chatzeilen nicht übereinander '+JSON.stringify(msg));
  report['handy-'+name]=res;ok('1 Handy '+name+': Spielmenü, Aufträge, Hilfe, Kniffe, Figur, Rucksack, Talente, Karte ohne Scrollen, Ziele ≥ 44 px, HP einzeilig, Meldungen nicht übereinander');}
 writeFileSync(dir+'/messwerte.json',JSON.stringify(report,null,1));
 assert.deepEqual(b.errors||[],[],'Laufzeitfehler');
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('FAIL',e.message);try{await shot('failure');}catch{}writeFileSync(dir+'/messwerte-partial.json',JSON.stringify(report,null,1));process.exitCode=1;}finally{b.close();}
