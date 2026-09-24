// Optimierung Runde 4, Teil A „Weltkarte“ (2026-09-24): jeder Punkt per Klickpfad mit echten Maus- und Tippereignissen.
// 1 keine Ziffern-/Buchstabenmarker, keine Dauerschilder in Sätzen, keine Legende/Fußzeile/Stempel (nur die OSM-Nennung)
// 2 POI-Tooltip beim Überfahren (Name, Art, Entfernung) + Hervorhebung
// 3 Bündel bei engen Markern (keine zwei Marker < 24 px), Tooltip listet alle, Klick zoomt; Standort nie verdeckt
// 4 Zielgebiet schraffiert, Name im Tooltip, verfolgtes Gebiet hervorgehoben
// 5 Filterliste in der Titelzeile, kombinierbar; Zu mir/Übersicht als Symbolknöpfe
// 6 Seitenleiste: Trenner, einzeilig, verfolgtes Ziel oben; Stiefel läuft hin und schließt die Karte
// 7 Karte ≈ 1600 × 799, nichts scrollt, OSM-Nennung sichtbar
// 8 Handy quer/hoch: Werkzeuge in der Titelzeile, Karte füllt das Fenster, Ortsliste aufklappbar, 44-px-Ziele, Tippen zeigt Tooltip
// Screenshots: visual-review/optimierung-r4a/. Ports: CDP 9520, Server 4320 (CDP_PORT/SERVER_PORT). ONLY=1,2,… für einzelne Teile.
import assert from 'node:assert/strict';
import {session,wait} from './r3a-lib.mjs';
const s=await session({dir:'visual-review/optimierung-r4a',cdp:Number(process.env.CDP_PORT||9520),server:Number(process.env.SERVER_PORT||4320)});
const {b,read,rect,mouse,click,shot,zoom}=s;
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const only=process.env.ONLY?process.env.ONLY.split(','):null,run=n=>!only||only.includes(String(n));
const SAVE={level:12,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1}};
/** Karte öffnen (M) und warten, bis sie gezeichnet ist. */
async function openMap(){for(let i=0;i<3;i++){if(!await read(`return !!document.querySelector('.popup-map #largeMap')`)){await b.press('m');}for(let j=0;j<20;j++){await wait(150);if(await read(`const c=document.querySelector('#largeMap');return !!(c&&c.atlasHits&&c.width>300)`))return;}}throw Error('Karte geht nicht auf');}
const CANVAS=`const c=document.querySelector('#largeMap'),r=c.getBoundingClientRect(),k=r.width/c.width;const scr=h=>({x:r.left+h.x*k,y:r.top+h.y*k});`;
/** Punkte, die kein Marker/Bündel/Nadel/Standort ist (für Zielgebiete). */
const free=`const busy=[...(c.atlasHits||[]),c.atlasPin,c.atlasPlayer].filter(Boolean);const isFree=(x,y)=>busy.every(h=>Math.hypot(h.x-x,h.y-y)>h.r+10);`;
const tipText=()=>read(`const t=document.querySelector('.wk-tip');return t&&!t.hidden?t.textContent.replace(/\\s+/g,' ').trim():''`);
/** Nichts scrollt im Kartenfenster (auch nicht abgeschnitten mit Scrollbalken). */
const scrolling=()=>read(`return [...document.querySelectorAll('.popup-map, .popup-map *')].filter(e=>{const cs=getComputedStyle(e);return /(auto|scroll)/.test(cs.overflowY+cs.overflowX)&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1);}).map(e=>e.className||e.id||e.tagName)`);
try{
 await s.start(SAVE);
 await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x,w.npc.y+30,9));g.player.inCombat=0;`);
 await openMap();await wait(1100);await shot('r4a-01-karte');await zoom('r4a-01z-titelzeile',await rect('.popup-map .popup-titlebar'),6);
 // ---------- 1) Symbole statt Ziffern/Buchstaben, keine Satz-Schilder, keine Legende ----------
 if(run(1)){
  const t=await read(`const c=document.querySelector('#largeMap'),P=CanvasRenderingContext2D.prototype,orig=P.fillText,seen=[];/* nur Schrift auf der Karte selbst, nicht in den Symbol-Zwischenspeichern */P.fillText=function(x,...a){if(this.canvas===c)seen.push(String(x));return orig.call(this,x,...a);};return new Promise(res=>setTimeout(()=>{P.fillText=orig;res({seen,clusters:c.atlasHits.filter(h=>h.cluster).map(h=>String(h.ids.length)),dom:['.atlas-key','.data-note','.atlas-stamp','#atlasSelection','.atlas-toolbar','[data-filter]'].filter(s=>document.querySelector('.popup-map '+s)),hubs:(window.game.world.hubs||[]).map(h=>h.name.split(' · ')[0]),bosses:window.game.enemies.filter(e=>e.worldBoss).map(e=>e.name)});},450));`);
  assert.equal(t.dom.length,0,'keine Legende/Fußzeile/Stempel/Werkzeugleiste '+t.dom);
  const allowed=new Set(['N','50 m',...t.clusters,...t.hubs,'St. Gangolf',...t.bosses]);
  const bad=t.seen.filter(x=>!allowed.has(x));
  assert.deepEqual(bad.filter(x=>/^\d+$/.test(x)),[],'keine Ziffernmarker');assert.deepEqual(bad.filter(x=>/^[A-ZÄÖÜ!?]$/.test(x)),[],'keine Buchstabenmarker');
  assert.deepEqual(bad,[],'keine Dauerschilder außer Ortsnamen');assert.ok(t.seen.length>0,'Karte gezeichnet');
  ok('1 Karte: '+t.seen.length+' Schriftzüge, nur Ortsnamen ('+[...new Set(t.seen.filter(x=>t.hubs.includes(x)))].join(', ')+'), Nordpfeil, Maßstab und Bündelzahlen; keine Ziffern-/Buchstabenmarker, keine Legende');
 }
 // ---------- 2) POI-Tooltip + Hervorhebung ----------
 if(run(2)){
  const m=await read(CANVAS+`const g=window.game,one=c.atlasHits.filter(h=>!h.cluster&&h.id.startsWith('camp:'))[0]||c.atlasHits.find(h=>!h.cluster);return {...scr(one),id:one.id}`);
  await mouse(m.x-40,m.y-40);await wait(150);await mouse(m.x,m.y);await wait(350);
  const tip=await tipText();
  const name=await b.evaluate(`import("./cartography.js").then(M=>M.mapPlaces(window.game).find(p=>p.id===${JSON.stringify(m.id)})?.title)`);
  assert.ok(tip.length>0,'Tooltip beim Überfahren');assert.ok(name&&tip.includes(name),'Name im Tooltip: '+tip+' / '+name);assert.match(tip,/\d+ m/,'Entfernung im Tooltip');
  const box=await rect('.wk-tip');assert.ok(box.w>=250&&box.w<=270,'Tooltip ≈ 260 px breit: '+box.w);
  const side=await rect('.popup-map .wk-side');assert.ok(box.r<=side.l+2,'Tooltip nie über der Seitenleiste');
  assert.equal(await read(`return document.querySelector('#largeMap').classList.contains('wk-over')`),true,'Zeiger/Hervorhebung über dem Marker');
  await zoom('r4a-02z-tooltip',{l:Math.min(box.l,m.x-30),t:Math.min(box.t,m.y-30),w:Math.max(box.r,m.x+30)-Math.min(box.l,m.x-30),h:Math.max(box.b,m.y+30)-Math.min(box.t,m.y-30)},12);
  ok('2 Tooltip: Überfahren von „'+name+'“ zeigt „'+tip.slice(0,80)+'…“ ('+box.w+' px, links der Seitenleiste), Marker hervorgehoben');
 }
 // ---------- 3) Bündel + Standort ----------
 if(run(3)){
  const d=await read(CANVAS+`const H=c.atlasHits;let min=1e9;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)min=Math.min(min,Math.hypot(H[i].x-H[j].x,H[i].y-H[j].y));const cl=H.filter(h=>h.cluster).sort((a,b)=>b.ids.length-a.ids.length)[0];return {min,n:H.length,cl:cl?{...scr(cl),n:cl.ids.length,ids:cl.ids}:null,scale:c.atlasView.scale}`);
  assert.ok(d.min>=24,'keine zwei Marker näher als 24 px: '+d.min.toFixed(1));assert.ok(d.cl&&d.cl.n>=2,'mindestens ein Bündel');
  await mouse(d.cl.x+30,d.cl.y+30);await wait(120);await mouse(d.cl.x,d.cl.y);await wait(350);
  const tip=await read(`const t=document.querySelector('.wk-tip');return t&&!t.hidden?[...t.querySelectorAll('.wk-tip-row')].length:0`);
  assert.equal(tip,d.cl.n,'Tooltip listet alle '+d.cl.n+' Orte des Bündels');await shot('r4a-03-buendel-tooltip');
  // Standort: Pfeil liegt oben (Bildpunkt an der Pfeilspitze ist hell), auch wenn Marker daneben liegen.
  const px=await read(CANVAS+`const p=c.atlasPlayer;const x=c.getContext('2d');const a=x.getImageData(Math.round(p.x-2),Math.round(p.y-3),1,1).data;return {p,rgb:[a[0],a[1],a[2]]}`);
  assert.ok(px.p&&px.rgb[0]>200&&px.rgb[1]>170,'Standortpfeil oben sichtbar '+JSON.stringify(px));
  await click(d.cl.x,d.cl.y);await wait(400);
  const after=await read(`return document.querySelector('#largeMap').atlasView.scale`);assert.ok(after>d.scale*1.8,'Klick auf das Bündel zoomt hinein');await shot('r4a-04-buendel-gezoomt');
  await clickTool('[data-zoom="fit"]');
  ok('3 Bündel: '+d.n+' Marker/Bündel, Mindestabstand '+Math.round(d.min)+' px; Bündel mit '+d.cl.n+' Orten listet alle im Tooltip, Klick zoomt ×2; Standortpfeil liegt oben (Pixel '+px.rgb.join(',')+')');
 }
 // ---------- 4) Zielgebiet ----------
 if(run(4)){
  const a=await read(CANVAS+free+`const A=(c.atlasAreas||[]).find(a=>a.area.tracked)||(c.atlasAreas||[])[0];if(!A)return null;for(let r=A.r*.7;r>=2;r-=3)for(let t=0;t<12;t++){const x=A.x+Math.cos(t/12*6.283)*r,y=A.y+Math.sin(t/12*6.283)*r;if(isFree(x,y))return {...scr({x,y}),title:A.area.title,tracked:!!A.area.tracked,n:c.atlasAreas.length};}return {...scr(A),title:A.area.title,tracked:!!A.area.tracked,n:c.atlasAreas.length};`);
  assert.ok(a,'Zielgebiet auf der Karte');assert.ok(a.tracked,'verfolgtes Zielgebiet hervorgehoben');
  await mouse(a.x+80,a.y+80);await wait(120);await mouse(a.x,a.y);await wait(350);const tip=await tipText();
  assert.ok(tip.includes(a.title),'Name des Zielgebiets im Tooltip: '+tip+' / '+a.title);assert.match(tip,/\d+\/\d+/,'Fortschritt im Tooltip');
  const box=await rect('.wk-tip');await zoom('r4a-05z-zielgebiet',{l:Math.min(box.l,a.x-90),t:Math.min(box.t,a.y-90),w:Math.max(box.r,a.x+90)-Math.min(box.l,a.x-90),h:Math.max(box.b,a.y+90)-Math.min(box.t,a.y-90)},8);
  ok('4 Zielgebiet: '+a.n+' Gebiete schraffiert, verfolgtes golden mit Symbol; Tooltip „'+tip.slice(0,70)+'“');
 }
 // ---------- 5) Filterliste kombinierbar, Werkzeuge in der Titelzeile ----------
 if(run(5)){
  const tools=await read(`const bar=document.querySelector('.popup-map .popup-titlebar');return ['[data-wk-filter]','[data-zoom="player"]','[data-zoom="fit"]'].map(s=>{const e=bar.querySelector(s);return e&&e.offsetParent?{s,w:e.offsetWidth,text:e.textContent.trim()}:null})`);
  assert.ok(tools.every(Boolean),'Filter, Zu mir, Übersicht in der Titelzeile');assert.ok(tools.every(t=>t.text===''),'Symbolknöpfe ohne Text');
  await clickTool('[data-wk-filter]');await wait(250);
  const items=await read(`return [...document.querySelectorAll('.wk-filter:not([hidden]) [role=menuitemcheckbox]')].map(e=>({id:e.dataset.wkShow,on:e.getAttribute('aria-checked')==='true'}))`);
  assert.ok(items.length>=7,'Filterliste mit Häkchen ('+items.length+')');await zoom('r4a-06z-filterliste',await rect('.wk-filter'),10);
  const count=k=>read(`return document.querySelector('#largeMap').atlasHits.flatMap(h=>h.ids).filter(id=>id.startsWith(${JSON.stringify(k)})).length`);
  const before={camp:await count('camp:'),quest:await count('hotspot:')};
  const box=await rect('.wk-filter [data-wk-show="camp"]');await click(box.l+box.w/2,box.t+box.h/2);await wait(400);
  const mid={camp:await count('camp:'),quest:await count('hotspot:'),open:await read(`return !document.querySelector('.wk-filter').hidden`)};
  assert.equal(mid.camp,0,'Lager aus');assert.equal(mid.quest,before.quest,'Aufträge bleiben an (kombinierbar)');assert.ok(mid.open,'Liste bleibt offen');
  const box2=await rect('.wk-filter [data-wk-show="quest"]');await click(box2.l+box2.w/2,box2.t+box2.h/2);await wait(400);
  const both={camp:await count('camp:'),quest:await count('hotspot:'),hub:await count('hub:')};assert.equal(both.quest,0,'Aufträge aus');assert.ok(both.hub>0,'Treffpunkte weiter an');
  await shot('r4a-06-filter');
  for(const k of ['camp','quest']){const r=await rect(`.wk-filter [data-wk-show="${k}"]`);await click(r.l+r.w/2,r.t+r.h/2);await wait(250);}
  await b.press('Escape');await wait(250);assert.ok(await read(`return document.querySelector('.wk-filter').hidden&&!!document.querySelector('.popup-map')`),'Esc schließt nur die Filterliste');
  // Zu mir / Übersicht
  const s0=await read(`return document.querySelector('#largeMap').atlasView.scale`);await clickTool('[data-zoom="player"]');await wait(300);const s1=await read(`return document.querySelector('#largeMap').atlasView.scale`);await clickTool('[data-zoom="fit"]');await wait(300);const s2=await read(`return document.querySelector('#largeMap').atlasView.scale`);
  assert.ok(s1>s0*1.5&&Math.abs(s2-s0)<1e-6,'Zu mir zoomt, Übersicht zurück');
  ok('5 Titelzeile: Filter/Zu mir/Übersicht als Symbolknöpfe ('+tools.map(t=>t.w+' px').join(', ')+'); Filterliste '+items.length+' Gruppen, kombinierbar (Lager aus: Aufträge bleiben '+mid.quest+'; dann Aufträge aus: Treffpunkte bleiben '+both.hub+'), Esc schließt nur die Liste');
 }
 // ---------- 7) Maße, kein Scrollen, OSM ----------
 if(run(7)){
  const m=await read(`const c=document.querySelector('#largeMap').getBoundingClientRect(),o=document.querySelector('.wk-osm'),or=o.getBoundingClientRect(),p=document.querySelector('.wk-paper').getBoundingClientRect(),s=document.querySelector('.wk-side');const rows=[...s.querySelectorAll('.wk-row')],last=rows.at(-1).getBoundingClientRect();return {w:Math.round(c.width),h:Math.round(c.height),osm:o.textContent,op:+getComputedStyle(o).opacity,osmIn:or.left>=p.left&&or.right<=p.right+1&&or.bottom<=p.bottom+1&&or.width>0,lastIn:last.bottom<=s.getBoundingClientRect().bottom+1,rows:rows.length,tall:rows.filter(r=>r.getBoundingClientRect().height>32).length,first:rows[0].className,seps:s.querySelectorAll('.wk-sep').length,chat:(()=>{const c=document.querySelector('.chat-window');return c?getComputedStyle(c).visibility:'none'})()}`);
  assert.ok(m.w>=1580&&m.h>=770,'Karte ≈ 1600 × 799: '+m.w+'×'+m.h);assert.deepEqual(await scrolling(),[],'nichts scrollt');
  assert.match(m.osm,/OpenStreetMap/);assert.ok(m.osmIn&&m.op>=.5,'OSM-Nennung sichtbar auf der Karte');
  assert.ok(m.lastIn,'alle Orte ohne Blättern sichtbar');assert.equal(m.tall,0,'jede Zeile einzeilig');assert.match(m.first,/atlas-tracked/,'verfolgtes Ziel oben');assert.ok(m.seps>=3,'Gruppentrenner');
  await zoom('r4a-07z-seitenleiste',await rect('.popup-map .wk-side'),6);
  ok('7 Maße: Karte '+m.w+'×'+m.h+' (vorher 1572×653), nichts scrollt, '+m.rows+' Zeilen + '+m.seps+' Trenner ohne Blättern, OSM-Nennung auf der Karte ('+m.op+'), Chat bei offener Karte '+m.chat);
 }
 // ---------- 6) Stiefel läuft hin, Karte zu ----------
 if(run(6)){
  const row=await rect('.popup-map .wk-row.atlas-tracked .wk-boot');assert.ok(row,'Stiefel in der verfolgten Zeile');
  await click(row.l+row.w/2,row.t+row.h/2);await wait(500);
  const st=await read(`const g=window.game;return {map:!!document.querySelector('#largeMap'),route:!!g.routeGoal,moving:!!g.moveTo}`);
  assert.ok(!st.map&&st.route&&st.moving,'Stiefel: Karte zu, Figur läuft '+JSON.stringify(st));
  ok('6 Stiefel in der verfolgten Zeile: Karte schließt, Figur läuft los (Verhalten aus 3a)');
  await read(`const g=window.game;g.moveTo=null;g.path=[];g.routeGoal=null;g.autopilot=null;`);
 }
 // ---------- 8) Handy quer und hoch ----------
 if(run(8)){
  const SAFE=(w,h)=>w>h?{left:47,right:47,top:0,bottom:21}:{top:47,bottom:34,left:0,right:0};
  await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'normal',layouts:{}}))`);
  for(const [w,h,name] of [[844,390,'quer'],[390,844,'hoch']]){
   await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
   const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'normal',layouts:{}}));"});/* unter Last braucht der Start länger: ein zweiter Anlauf */try{await b.goto(b.url);}catch(e){if(!/did not initialize/.test(e.message))throw e;console.log('(Start dauerte zu lange, zweiter Anlauf)');await b.goto(b.url);}await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<160&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);
   await b.evaluate(`(s=>{for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');})(${JSON.stringify(SAFE(w,h))})`);await wait(600);
   await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x,w.npc.y+30,9));`);
   await openMap();await wait(900);
   const m=await read(`const pop=document.querySelector('.popup-map'),bar=pop.querySelector('.popup-titlebar'),P=pop.getBoundingClientRect(),c=document.querySelector('#largeMap').getBoundingClientRect(),tools=[...bar.querySelectorAll('.wk-tool')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]});return {touch:document.body.classList.contains('touch-mode'),pop:[Math.round(P.width),Math.round(P.height)],map:[Math.round(c.width),Math.round(c.height)],tools,body:[Math.round(pop.querySelector('.popup-body').clientWidth),Math.round(pop.querySelector('.popup-body').clientHeight)],tabs:!!pop.querySelector('.panel-tabs'),sideShown:!!pop.querySelector('.wk-side')?.offsetParent}`);
   assert.ok(m.touch,'Touch-Modus');assert.ok(!m.tabs,'keine Reiter mehr');assert.ok(m.tools.length>=4&&m.tools.every(([x,y])=>x>=44&&y>=44),'Werkzeuge 44 px in der Titelzeile '+JSON.stringify(m.tools));
   assert.ok(m.map[0]>=m.body[0]-24&&m.map[1]>=m.body[1]-24,'Karte füllt das Fenster '+JSON.stringify(m));assert.ok(!m.sideShown,'Ortsliste eingeklappt');
   assert.deepEqual(await scrolling(),[],'nichts scrollt ('+name+')');
   await shot('r4a-8'+(name==='quer'?'1':'3')+'-handy-'+name);
   // Tippen auf einen Marker: Tooltip mit Stiefel
   const t=await read(CANVAS+`const one=c.atlasHits.find(h=>!h.cluster&&h.x>30&&h.y>30&&h.x<c.width-60&&h.y<c.height-60)||c.atlasHits[0];return scr(one)`);
   await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:Math.round(t.x),y:Math.round(t.y)}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(500);
   const tip=await read(`const e=document.querySelector('.wk-tip');if(!e||e.hidden)return null;const w=e.querySelector('[data-tip-walk]')?.getBoundingClientRect();return {text:e.textContent.trim().slice(0,60),walk:w?[Math.round(w.width),Math.round(w.height)]:null}`);
   assert.ok(tip&&tip.walk&&tip.walk[1]>=44,'Tippen zeigt den Tooltip mit Stiefel '+JSON.stringify(tip));
   await shot('r4a-8'+(name==='quer'?'1':'3')+'b-handy-'+name+'-tipp');
   // Ortsliste aufklappen
   const sideBtn=await rect('.popup-map .popup-titlebar [data-wk-side]');await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sideBtn.l+sideBtn.w/2,y:sideBtn.t+sideBtn.h/2}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(500);
   const side=await read(`const s=document.querySelector('.popup-map .wk-side');if(!s?.offsetParent)return null;const rows=[...s.querySelectorAll('.wk-row')].filter(r=>r.getClientRects().length);return {rows:rows.length,small:rows.filter(r=>r.getBoundingClientRect().height<44).length,boots:rows.filter(r=>{const b=r.querySelector('.wk-boot').getBoundingClientRect();return b.width>=44&&b.height>=44}).length,inside:rows.every(r=>r.getBoundingClientRect().bottom<=s.querySelector('.wk-list').getBoundingClientRect().bottom+1)}`);
   assert.ok(side&&side.rows>=3&&side.small===0&&side.boots===side.rows&&side.inside,'Ortsliste klappt auf, 44-px-Zeilen und Stiefel '+JSON.stringify(side));assert.deepEqual(await scrolling(),[],'Ortsliste scrollt nicht');
   await shot('r4a-8'+(name==='quer'?'2':'4')+'-handy-'+name+'-liste');
   // Blättern: Seite 2 zeigt andere Orte
   const shown=()=>read(`return [...document.querySelectorAll('.popup-map .wk-row')].filter(r=>r.getClientRects().length).map(r=>r.dataset.row).join('|')`);
   const first=await shown();const next=await rect('.popup-map .wk-pager [data-wk-page="1"]');await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:next.l+next.w/2,y:next.t+next.h/2}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(300);
   const second=await shown();assert.ok(second&&second!==first&&!second.split('|').some(id=>first.split('|').includes(id)),'Seite 2 zeigt andere Orte');
   ok('8 Handy '+name+' '+w+'×'+h+': Fenster '+m.pop.join('×')+', Karte '+m.map.join('×')+' (Fensterinhalt '+m.body.join('×')+'), '+m.tools.length+' Werkzeuge 44 px in der Titelzeile, Tippen zeigt Tooltip mit Stiefel '+tip.walk.join('×')+', Ortsliste aufklappbar mit '+side.rows+' Zeilen je Seite');
   await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());document.querySelector('.popup-map .popup-close')?.click()`);
  }
 }
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('ROT:',e.message);await shot('r4a-99-fehler').catch(()=>{});process.exitCode=1;}
finally{s.close();}
async function clickTool(sel){const r=await rect('.popup-map .popup-titlebar '+sel)||await rect('.popup-map '+sel);if(!r)throw Error('fehlt: '+sel);await click(r.l+r.w/2,r.t+r.h/2);await wait(300);}
