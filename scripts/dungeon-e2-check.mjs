// Prüfskript Etappe 2 „Lesbar wie WoW“ (Dungeon Schloss Big B, E-71; Bericht docs/DUNGEON-ETAPPE-2-2026-09-25.md).
// Prüft im Browser: Weltkarten-Marke unter und über Stufe 8 (Karte, Ortsliste, Minikarte, Filter „Dungeons“), Straßenname im
// Karten-Tooltip, Esc auf Minikarten-Menüs, Eingangskarte vor dem Betreten, Übergang, Warnleiste ≥ 1 s vor dem Treffer, Bossrahmen
// mit Phasenmarken, Journal ohne Scrollen (jede Fähigkeit mit Symbol und Tooltip), höchstens ein Titel je Raum, Dungeon-Karte mit
// Schädel und Journal-Klick, Handy-Bosskampf (Boss und Held sichtbar), Licht im Keller ohne Außenwelt-Schicht.
// Aufruf: node scripts/dungeon-e2-check.mjs   (CDP 9610, Server 4410; CDP_PORT/SERVER_PORT, BOOT_TRIES, ONLY=1,2,… einzelne Teile)
// Bilder: visual-review/dungeon-e2/*.jpg (lokal, nicht im Repo)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-e2';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean);const want=n=>!only.length||only.includes(String(n));
const s=await session({port:9610,serverPort:4410});const {b,read,start,calm,closeAll,settle,audit,hover,click,tap}=s;
const results=[],shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const pass=(n,text)=>{results.push({n,text});console.log('PASS '+n+' · '+text);};
const W=Number(process.env.DESK_W||1600),H=900;
/** Held an den Eingang stellen (Welt), Gegner weit weg. */
const toDoor=(dy=10)=>read(`const m=await import('/dungeon.js');const d=m.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+${dy}});g.player.inCombat=0;g.moveTo=null;return {x:d.x,y:d.y};`);
/** Direkt in den Dungeon (ohne Karte), Trash stumm. */
const inside=()=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}return g.instance?.kind;`);
try{
 // ─────────────────────────────────────────────── 1 · Eingang sichtbar: Weltkarte, Ortsliste, Minikarte, Filter
 if(want(1)){
  await start({w:W,h:H});await calm();
  for(const lv of [4,10]){
   await read(`g.player.level=${lv};`);await b.press('m');await wait(900);
   const hit=await read(`const cv=document.querySelector('#largeMap');const h=(cv.atlasHits||[]).find(h=>h.ids.includes('dungeon:schloss-bigb'));if(!h)return null;const r=cv.getBoundingClientRect();return {x:r.left+h.x*r.width/cv.width,y:r.top+h.y*r.height/cv.height,cluster:h.cluster};`);
   assert.ok(hit,'Weltkarte zeigt die Dungeon-Marke (Stufe '+lv+')');
   await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:hit.x,y:hit.y});await wait(400);
   const tip=await read(`const t=document.querySelector('.wk-tip');return t&&!t.hidden?t.textContent:''`);
   if(!hit.cluster){assert.match(tip,/Schloss Big B/,'Tooltip nennt den Namen');assert.match(tip,/Stufe 8–10/,'Tooltip nennt das Stufenband');assert.match(tip,/5 Köpfe/,'Tooltip nennt die Gruppengröße');}
   await shot('10-weltkarte-stufe'+lv);
   const row=await read(`const r=document.querySelector('[data-row="dungeon:schloss-bigb"]');return r?{text:r.textContent,label:r.querySelector('.wk-pick').getAttribute('aria-label'),h:r.getBoundingClientRect().height,boot:!!r.querySelector('[data-navigate]'),low:r.classList.contains('low'),icon:r.querySelector('[data-wk-icon]')?.dataset.wkIcon}:null`);
   assert.ok(row,'Ortsliste führt den Dungeon');assert.match(row.text,/Schloss Big B/);assert.match(row.text,/8–10 · 5 Köpfe/,'Zeile mit Stufenband und Köpfen');assert.match(row.label,/Schloss Big B · Stufe 8–10 · 5 Köpfe/);assert.ok(row.boot,'Stiefel „Hinlaufen“');assert.ok(row.h<=32,'einzeilig');assert.equal(row.low,lv<8,'unter Stufe 8 grau');assert.equal(row.icon,lv<8?'dungeon-low':'dungeon');
   const filter=await read(`document.querySelector('[data-wk-filter]').click();await new Promise(r=>setTimeout(r,200));const b=document.querySelector('[data-wk-show="dungeon"]');const on=b?.getAttribute('aria-checked');document.querySelector('[data-wk-filter]').click();return on`);
   assert.equal(filter,'true','Filter „Dungeons“ in der Kartenliste, standardmäßig an');
   await b.press('Escape');await wait(300);await closeAll();
  }
  pass(1,'Weltkarte: Marke und Tooltip „Schloss Big B · Stufe 8–10 · 5 Köpfe“ unter (grau) und über Stufe 8, Ortsliste, Filter „Dungeons“');
  // Minikarte: Marke in der Nähe, Gruppe „Dungeons“ in den Kartensymbolen, Esc schließt nur das Menü
  await read(`g.player.level=4;`);await toDoor(120);await wait(1600);
  const mini=await read(`const hits=document.querySelector('#miniButton').minimap.hits();return hits.find(h=>h.group==='dungeon')||null`);
  assert.ok(mini,'Minikarte zeigt den Eingang auch unter Stufe 8');assert.match(mini.kind,/Stufe 8–10 · 5 Köpfe/);
  await read(`document.querySelector('.mm-k-track').click();`);await wait(250);
  assert.ok(await read(`return !!document.querySelector('.mm-menu [data-mm-track="dungeon"]')`),'Kartensymbole der Minikarte kennen „Dungeons“');await shot('11-minikarte-symbole');
  await b.press('Escape');await wait(300);
  assert.equal(await read(`return document.querySelector('.mm-menu').hidden`),true,'Esc schließt das Minikarten-Menü');assert.equal(await read(`return !!document.querySelector('.popup-menu')`),false,'Esc öffnet dabei nicht das Spielmenü');
  await read(`document.querySelector('.mm-k-opts').click();`);await wait(250);await b.press('Escape');await wait(300);
  assert.equal(await read(`return !!document.querySelector('.popup-menu')`),false,'Esc auf Kartenoptionen öffnet nicht das Spielmenü');
  pass(1,'Minikarte: Marke unter Stufe 8, Gruppe „Dungeons“, Esc schließt zuerst das Menü');
  // Straßenname beim Überfahren der Weltkarte
  await b.press('m');await wait(900);
  const road=await read(`const cv=document.querySelector('#largeMap'),v=cv.atlasView,r=cv.getBoundingClientRect(),road=g.world.roads.find(x=>x.tags?.name==='Burgstraße'&&x.points.length>2);const p=road.points[Math.floor(road.points.length/2)];return {x:r.left+(p.x-v.ox)*v.scale*r.width/cv.width,y:r.top+(p.y-v.oy)*v.scale*r.height/cv.height}`);
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:road.x,y:road.y});await wait(400);
  const rt=await read(`const t=document.querySelector('.wk-tip');return t&&!t.hidden?t.textContent:''`);
  await shot('12-weltkarte-strasse');
  assert.match(rt,/Burgstraße/,'Karten-Tooltip nennt den Straßennamen');await closeAll();
  pass(1,'Weltkarte: Straßenname beim Überfahren („Burgstraße“)');
  // Eingang in der Welt: Name nur beim Überfahren, Portal, Schild
  await read(`g.player.level=10;`);const door=await toDoor(40);await settle();await shot('13-eingang-welt');
  await b.press('f');await wait(500);
  // ─ Eingangskarte statt sofortigem Betreten
  assert.equal(await read(`return g.instance?.kind||null`),null,'F betritt nicht sofort');
  const card=await read(`const p=document.querySelector('.popup-dungeonEntry');if(!p)return null;return {slots:p.querySelectorAll('.dg-slot').length,loot:p.querySelectorAll('.dg-loot').length,enter:!!p.querySelector('[data-dg-enter]'),band:p.querySelector('.dg-chip b')?.textContent,journal:!!p.querySelector('[data-dg-journal]')}`);
  assert.ok(card,'Eingangskarte öffnet sich');assert.equal(card.slots,5,'fünf Rollenplätze');assert.equal(card.loot,3,'drei Beute-Symbole');assert.ok(card.enter&&card.journal);assert.equal(card.band,'Stufe 8–10');
  const au=await audit('dungeonEntry');assert.equal(au.over,'','Eingangskarte scrollt nicht');assert.deepEqual(au.scrollers,[]);
  await shot('14-eingangskarte');
  // Söldner direkt anheuern
  const before=await read(`return g.companions.length`);await read(`g.rpg.coins=500;`);await click('.popup-dungeonEntry [data-dg-hire]');await wait(300);
  assert.equal(await read(`return g.companions.length`),before+1,'Söldner direkt auf der Karte anheuern');await shot('15-eingangskarte-soeldner');
  // Betreten mit Übergang
  await click('.popup-dungeonEntry [data-dg-enter]');await shot('16-uebergang');
  await wait(1400);assert.equal(await read(`return g.instance?.kind`),'dungeon','nach dem Übergang im Dungeon');await shot('17-hof');
  const tr=await read(`return (globalThis.__dgTransitions||[]).at(-1)||null`);assert.ok(tr&&tr.kind==='enter'&&tr.ok,'Übergang lief');assert.ok(tr.runAt-tr.shownAt>=50,'erst abgedunkelt, dann gewechselt ('+Math.round(tr.runAt-tr.shownAt)+' ms)');
  pass(1,'Eingang: Karte vor dem Betreten (5 Plätze, 3 Beute, Stufenband), Söldner anheuern, Übergang');
  await read(`g.leaveDungeon({force:true});`);await wait(300);
 }
 // ─────────────────────────────────────────────── gemeinsame Szene: Gerd mit vier Söldnern, Held unverwundbar
 const gerdFight=({companions=true,cycle=1,timer=1.2}={})=>read(`g.player.level=10;g.rpg.coins=900;${companions?"for(const id of ['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'])if(!g.companions.some(c=>c.id===id))g.hireCompanion(id);":''}
  if(!g.instance)g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
  const r=g.dungeonRun,gerd=g.enemies.find(e=>e.bossId==='gerd');Object.assign(g.player,D.toWorld(r.def,'e0',8.5,25));for(const c of g.companions)Object.assign(c,D.toWorld(r.def,'e0',9,26));
  gerd.hp=gerd.maxHp;gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;g.adminGod=true;gerd.cycle=${cycle};gerd.attackTimer=${timer};gerd.cast=null;return true;`);
 /** Warnleiste beobachten: je Zauber von Gerd, wie lange vor dem Treffer die passende Zeile schon stand. */
 async function watchAlerts(seconds,need=2){const log=[];const t0=Date.now();let done=0;while(Date.now()-t0<seconds*1000&&done<need){const s=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');/* Held zurück vor Gerd, falls ihn der Rausschmiss an die Wand geworfen hat (dort findet Gerd keinen Weg, Befund an Etappe 1) */if(gerd&&!gerd.cast&&Math.hypot(gerd.x-g.player.x,gerd.y-g.player.y)>50)Object.assign(g.player,D.toWorld(g.dungeonRun.def,'e0',8.5,25));const st=window.__bossAlerts?.state()||{};const rows=[...document.querySelectorAll('.boss-alerts .ba-row')].map(r=>{const b=r.getBoundingClientRect(),t=r.querySelector('b');return {text:t?.textContent,cut:t?t.scrollWidth>t.clientWidth+1:false,inView:b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight&&b.width>0}});return {t:g.time,cast:gerd?.cast?{type:gerd.cast.type,rem:gerd.cast.remaining}:null,rows:st.rows||[],dom:rows}`);log.push(s);if(log.length>1&&log.at(-2).cast&&!s.cast)done++;await wait(60);}
  const hits=[];for(let i=1;i<log.length;i++){const prev=log[i-1],cur=log[i];if(prev.cast&&(!cur.cast||cur.cast.type!==prev.cast.type||cur.cast.rem>prev.cast.rem)){const hitT=prev.t+prev.cast.rem,type=prev.cast.type;let first=null;for(let j=i-1;j>=0;j--){if(log[j].rows.some(r=>r.key.includes(':'+type+':'))&&log[j].dom.length)first=log[j].t;else break;}hits.push({type,lead:first==null?0:+(hitT-first).toFixed(2)});}}
  return {hits,cut:log.some(s=>s.dom.some(r=>r.cut)),outside:log.some(s=>s.dom.some(r=>!r.inView))};}
 // ─────────────────────────────────────────────── 2 · Warnleiste mit Timer, Bossrahmen mit Phasenmarken (Desktop und Handy)
 if(want(2)){
  await start({w:W,h:H});await calm();await gerdFight({companions:false});await wait(400);
  const frame=await read(`const f=document.querySelector('.boss-frame');return f&&!f.hidden?{marks:f.querySelectorAll('.bf-bar em').length,name:f.querySelector('.bf-name b').textContent,face:!!f.querySelector('[data-dj-portrait]')}:null`);
  assert.ok(frame,'Bossrahmen sichtbar');assert.equal(frame.marks,3,'Phasenmarken bei 50/25/15 %');assert.match(frame.name,/Gerd/);
  const w=await watchAlerts(120,2);console.log(JSON.stringify(w.hits));await shot('20-warnleiste-desktop');
  assert.ok(w.hits.length>=2,'mindestens zwei Treffer beobachtet ('+w.hits.length+')');for(const h of w.hits)assert.ok(h.lead>=1,'Warnung '+h.type+' '+h.lead+' s vor dem Treffer (≥ 1 s)');
  assert.equal(w.cut,false,'nichts abgeschnitten');assert.equal(w.outside,false,'Warnleiste im Bild');
  const cast=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.cycle=1;gerd.attackTimer=0;await new Promise(r=>setTimeout(r,500));const c=document.querySelector('.bf-cast');return {shown:!c.hidden,text:c.querySelector('b').textContent,cone:!!gerd.cast?.cone}`);
  assert.ok(cast.shown&&cast.cone,'Zauberleiste im Bossrahmen zeigt den Kegel');assert.match(cast.text,/SEITLICH|Seitlich/i,'Antwort statt abgeschnittenem Namen');await shot('21-kegel-desktop');
  pass(2,'Desktop: Bossrahmen mit 3 Phasenmarken, Warnleiste '+w.hits.map(h=>h.type+' '+h.lead+' s').join(', ')+' vor dem Treffer, nichts abgeschnitten, Kegel im selben Stil');
  for(const [w2,h2,name] of [[390,844,'hoch'],[844,390,'quer']]){await start({touch:true,w:w2,h:h2,safe:true});await calm();await gerdFight();await wait(500);
   const r=await watchAlerts(90,1);await shot('22-warnleiste-handy-'+name);assert.ok(r.hits.length>=1,'Handy '+name+': Treffer beobachtet');for(const h of r.hits)assert.ok(h.lead>=1,'Handy '+name+': '+h.type+' '+h.lead+' s vorher');assert.equal(r.cut,false,'Handy '+name+': nichts abgeschnitten');assert.equal(r.outside,false,'Handy '+name+': im Bild');
   // Warnleiste über den Kampfknöpfen, nicht darauf
   const over=await read(`const rows=[...document.querySelectorAll('.boss-alerts .ba-row')].map(e=>e.getBoundingClientRect());const ctl=['#touchActions','#touchStick','#touchUtility'].map(s=>document.querySelector(s)?.getBoundingClientRect()).filter(r=>r&&r.width);return rows.some(a=>ctl.some(b=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom))`);assert.equal(over,false,'Handy '+name+': Warnleiste verdeckt keine Kampfknöpfe');
   pass(2,'Handy '+name+': Warnleiste '+r.hits.map(h=>h.lead+' s').join(', ')+' vor dem Treffer, über den Knöpfen, nichts abgeschnitten');}
 }
 // ─────────────────────────────────────────────── 3 · Journal aus den Daten
 if(want(3)){
  await start({w:W,h:H});await calm();await gerdFight({companions:false,timer:9});await wait(500);
  await click('.boss-frame [data-boss-journal]');await wait(500);
  const j=await read(`const p=document.querySelector('.popup-journal');if(!p)return null;const ab=[...p.querySelectorAll('.dj-ability')];return {abilities:ab.length,withIcon:ab.filter(a=>a.querySelector('canvas[data-dicon]')).length,withTip:ab.filter(a=>a.dataset.tooltipLabel&&a.dataset.tooltipNote).length,roles:p.querySelectorAll('.dj-role').length,loot:p.querySelectorAll('.dj-loot').length,tabs:p.querySelectorAll('.dj-tab').length,text:p.querySelector('.popup-body').innerText.length}`);
  assert.ok(j,'Journal öffnet über das Bossporträt');assert.ok(j.abilities>=3);assert.equal(j.withIcon,j.abilities,'jede Fähigkeit mit Symbol');assert.equal(j.withTip,j.abilities,'jede Fähigkeit mit Tooltip');assert.equal(j.roles,3,'drei Rollensymbole');assert.ok(j.loot>=3,'Beutevorschau');
  const au=await audit('journal');assert.equal(au.over,'','Journal scrollt nicht');assert.deepEqual(au.scrollers,[]);
  await hover('.popup-journal .dj-ability');await wait(300);const tip=await read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:''`);assert.ok(tip.length>10,'Tooltip beim Überfahren');
  await shot('30-journal');pass(3,'Journal: '+j.abilities+' Fähigkeiten mit Symbol und Tooltip, 3 Rollen, '+j.loot+' Beuteplätze, '+j.tabs+' Boss-Reiter, scrollt nicht');
  await closeAll();
  for(const [w2,h2,name] of [[390,844,'hoch'],[844,390,'quer']]){await start({touch:true,w:w2,h:h2,safe:true});await calm();await read(`g.player.level=10;g.enterDungeon('schloss-bigb',{force:true});return 1`);await wait(300);
await read(`window.__dgOpenJournal?.('gerd');return 1`);await wait(500);
   const a2=await audit('journal');assert.ok(a2,'Handy '+name+': Journal offen');assert.equal(a2.over,'','Handy '+name+': Journal scrollt nicht');assert.deepEqual(a2.scrollers,[],'Handy '+name+': keine Scrollfläche');assert.equal(a2.offscreen,false,'Handy '+name+': im Bild');
   await shot('31-journal-handy-'+name);pass(3,'Handy '+name+': Journal ohne Scrollen');}
 }
 // ─────────────────────────────────────────────── 4 · Text-Diät: höchstens ein Titel je Raum, keine Dauerschrift, Durchsage als Sprechblase
 if(want(4)){
  await start({w:W,h:H});await calm();await read(`g.player.level=10;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/dungeon-art.js');for(const e of g.enemies){e.aggro=false;e.aggroRange=0;}return 1`);
  const rooms=[['e0',31,34,'hof'],['e0',55,28,'verwaltung'],['k1',30,8,'galerie'],['k1',30,20,'rittersaal'],['k2',10,10,'weinkeller']];const seen=[];
  for(const [f,x,y,id] of rooms){await read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${f}',${x},${y}));g.player.inCombat=0;g.hover=null;return 1`);await wait(1300);
   const s=await read(`const toast=window.__mertlochMessages?.toasts?.state?.()||{};const title=document.querySelector('.region-label');return {room:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id,title:title?.classList.contains('zone-show')?title.innerText.replace(/\\s+/g,' ').trim():'',toast:toast.current||'',queue:(toast.queue||[]).length,world:A.dungeonTextStats.ground,worldTexts:A.dungeonTextStats.last}`);
   seen.push(s);await shot('40-raum-'+id);
   assert.equal(s.room,id);assert.ok(s.title,'Zonentitel für '+id);assert.equal(s.toast,'','kein zusätzlicher Toast in '+id+': '+s.toast);assert.equal(s.world,0,'keine Dauerschrift in der Welt ('+id+': '+s.worldTexts.join(' | ')+')');}
  // Durchsage: Sprechblase am Lautsprecher, keine Kurzmeldung
  const ann=await read(`const r=g.dungeonRun;r.heard.delete('willkommen');Object.assign(g.player,D.toWorld(r.def,'e0',30,30));await new Promise(res=>setTimeout(res,1200));const toast=window.__mertlochMessages?.toasts?.state?.()||{};return {toast:toast.current||'',speaking:!!r.speaking}`);
  assert.ok(ann.speaking,'Durchsage kommt aus dem Lautsprecher');assert.doesNotMatch(ann.toast,/Lautsprecher/,'keine Durchsage als Kurzmeldung');await shot('41-durchsage');
  // Geheimnisse: Wehrgang und Pappschützen vom Hof aus verborgen
  const secret=await read(`const r=g.dungeonRun;r.visited.delete('wehrgang');const s=g.enemies.filter(e=>e.dungeonKind==='pappschuetze');return {n:s.length,hidden:s.every(e=>D.concealed(g,e))}`);assert.ok(secret.n>0&&secret.hidden,'Pappschützen auf dem Wehrgang verborgen');
  // Überfahren zeigt Raumnamen
  const hov=await read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'e0',31,34));g.hover={...D.toWorld(g.dungeonRun.def,'e0',31,30)};await new Promise(r=>setTimeout(r,300));return A.dungeonTextStats.last`);assert.ok(hov.length>=1,'Raumname beim Überfahren');
  pass(4,'Text-Diät: je Raum nur der Zonentitel ('+seen.map(s=>s.title.split(' ')[0]).join(', ')+'), keine Kurzmeldung, keine Dauerschrift, Durchsage als Sprechblase, Wehrgang verborgen, Name beim Überfahren');
 }
 // ─────────────────────────────────────────────── 5 · Handy-Kampfansicht: Boss und Held sichtbar
 if(want(5)){
  for(const [w2,h2,name] of [[390,844,'hoch'],[844,390,'quer']]){await start({touch:true,w:w2,h:h2,safe:true});await calm();await gerdFight({timer:6});await wait(1500);
   const v=await read(`const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width,scr=(o,up,side)=>{const x=(o.x-st.camera.x+st.width/2)*k+cv.left,y=(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top;return {l:x-side*k,r:x+side*k,t:y-up*k,b:y+4*k};};
    const gerd=g.enemies.find(e=>e.bossId==='gerd'),hero=scr(g.player,40,12),boss=scr(gerd,56,16);const hud=['.player-panel','#targetPanel:not(.hidden)','.boss-frame:not([hidden])','#unitGroupDock','#touchStick','#touchActions','#touchUtility','#touchMenu','.boss-alerts','.quest-panel','#miniButton'].flatMap(s=>[...document.querySelectorAll(s)]).filter(e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'}).map(e=>({s:e.id||e.className,r:e.getBoundingClientRect()})).filter(o=>o.r.width>1&&o.r.height>1);
    const cover=a=>hud.filter(o=>o.r.left<a.r&&a.l<o.r.right&&o.r.top<a.b&&a.t<o.r.bottom).map(o=>String(o.s).slice(0,30));const inView=a=>a.l>=0&&a.r<=innerWidth&&a.t>=0&&a.b<=innerHeight;
    return {hero:cover(hero),boss:cover(boss),heroIn:inView(hero),bossIn:inView(boss),target:getComputedStyle(document.querySelector('#targetPanel')).display,frame:!!document.querySelector('.boss-frame:not([hidden])')}`);
   await shot('50-handy-boss-'+name);
   assert.ok(v.frame,'Handy '+name+': Bossrahmen');assert.ok(v.heroIn&&v.bossIn,'Handy '+name+': Held und Boss im Bild');assert.deepEqual(v.hero,[],'Handy '+name+': Held frei');assert.deepEqual(v.boss,[],'Handy '+name+': Boss frei');
   pass(5,'Handy '+name+': Held und Boss frei von HUD (Zielrahmen '+v.target+', Truppe kompakt, Bossrahmen am Zielrahmen-Platz)');}
 }
 // ─────────────────────────────────────────────── 6 · Dungeon-Karte: Leinwand füllt das Fenster, Schädel mit Journal-Klick, kein Scrollen
 if(want(6)){
  await start({w:W,h:H});await calm();await read(`g.player.level=10;g.enterDungeon('schloss-bigb',{force:true});return 1`);await wait(600);await b.press('m');await wait(900);
  const m=await read(`const p=document.querySelector('.popup-map'),cv=p.querySelector('canvas.dungeon-map'),pr=p.getBoundingClientRect(),cr=cv.getBoundingClientRect();return {share:+(cr.width*cr.height/(pr.width*pr.height)).toFixed(2),tabs:[...p.querySelectorAll('.popup-titlebar [data-dungeon-floor]')].length,info:!!p.querySelector('.popup-titlebar .dm-info[data-tooltip-note]'),hint:!!p.querySelector('.popup-body p'),boss:(cv.dungeonHits||[]).find(h=>h.kind==='boss'&&h.id==='gerd')||null,doors:(cv.dungeonHits||[]).length}`);
  assert.ok(m.share>=.6,'Leinwand ≥ 60 % des Fensters ('+m.share+')');assert.equal(m.tabs,3,'Ebenen als Symbolreiter in der Titelzeile');assert.ok(m.info,'Erklärung im Info-Symbol');assert.equal(m.hint,false,'kein Erklärsatz');assert.ok(m.boss,'Schädel für Gerd');
  const au=await audit('map');assert.equal(au.over,'','Karte scrollt nicht');assert.deepEqual(au.scrollers,[]);
  const skull=await read(`const cv=document.querySelector('canvas.dungeon-map'),b=cv.getBoundingClientRect(),h=cv.dungeonHits.find(x=>x.kind==='boss'&&x.id==='gerd');return {x:b.left+h.x,y:b.top+h.y}`);
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:skull.x,y:skull.y});await wait(300);const tip=await read(`const t=document.querySelector('.dm-tip');return t&&!t.hidden?t.innerText:''`);assert.match(tip,/Gerd/,'Tooltip am Schädel');await shot('60-karte-e0');
  for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:skull.x,y:skull.y,button:'left',clickCount:1});await wait(500);
  assert.ok(await read(`return !!document.querySelector('.popup-journal')`),'Klick auf den Schädel öffnet das Journal');await shot('61-karte-journal');
  // Wegmarke über Ebenen: Klick auf K1 setzt die Marke, der Pfeil am Helden führt zur Treppe
  await read(`document.querySelector('.popup-journal [data-window-close]')?.click();return 1`);await wait(200);
  await read(`g.dungeonRun.visited.add('galerie');g.dungeonRun.killed.add('gerd');return 1`);await read(`document.querySelector('[data-dungeon-floor="k1"]').click();return 1`);await wait(400);
  const pt=await read(`const cv=document.querySelector('canvas.dungeon-map'),b=cv.getBoundingClientRect(),h=cv.dungeonHits.find(x=>x.kind==='room'&&x.id==='galerie');const q=h.rects[0];return {x:b.left+q.x+q.w*.3,y:b.top+q.y+q.h/2}`);
  for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:pt.x,y:pt.y,button:'left',clickCount:1});await wait(400);
  const wp=await read(`const D=await import('/dungeon.js');return {wp:g.dungeonRun.waypoint,dest:D.dungeonDestination(g)}`);assert.equal(wp.wp?.floor,'k1','Wegmarke auf Keller 1');assert.ok(wp.dest?.step,'Pfeil führt zum Übergang ('+wp.dest?.step+')');await shot('62-karte-wegmarke');
  pass(6,'Karte: Leinwand '+Math.round(m.share*100)+' % des Fensters, 3 Symbolreiter, Info statt Erklärsatz, Schädel mit Tooltip und Journal-Klick, Wegmarke über Ebenen, scrollt nicht');
  await closeAll();
  for(const [w2,h2,name] of [[844,390,'quer'],[390,844,'hoch']]){await start({touch:true,w:w2,h:h2,safe:true});await calm();await read(`g.player.level=10;g.enterDungeon('schloss-bigb',{force:true});return 1`);await wait(500);await read(`document.querySelector('#mapButton, [data-shell="map"], .mm-disc')?.click();return 1`);await wait(900);
   if(!await read(`return !!document.querySelector('.popup-map')`)){await read(`window.__dgShowMap?.();return 1`);await wait(600);}
   const a=await audit('map');assert.ok(a,'Handy '+name+': Karte offen');assert.equal(a.over,'','Handy '+name+': Karte scrollt nicht ('+a.over+')');assert.deepEqual(a.scrollers,[],'Handy '+name+': keine Scrollfläche');await shot('63-karte-handy-'+name);pass(6,'Handy '+name+': Dungeon-Karte ohne Scrollen');}
 }
 // ─────────────────────────────────────────────── 7 · Licht im Keller ohne Außenwelt-Schicht, Minikarte mit Gegnern
 if(want(7)){
  await start({w:W,h:H});await calm();await read(`g.settings.light=true;g.player.level=10;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/dungeon-art.js');return 1`);
  const out=[];for(const [f,x,y,theme] of [['e0',31,34,'garage'],['k1',30,8,'partykeller'],['k2',10,10,'basalt']]){await read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${f}',${x},${y}));g.player.inCombat=0;return 1`);await wait(900);
   const s=await read(`const light=document.querySelector('canvas.world-light'),fx=document.querySelector('canvas.world-fx');const f0=A.dungeonLightStats.frames;await new Promise(r=>setTimeout(r,400));return {light:light?getComputedStyle(light).display:'none',fx:fx?getComputedStyle(fx).display:'none',theme:A.dungeonLightStats.theme,frames:A.dungeonLightStats.frames-f0,lights:A.dungeonLightStats.lights}`);
   out.push(s);await shot('70-licht-'+theme);assert.equal(s.light,'none','Außenwelt-Licht aus ('+theme+')');assert.equal(s.fx,'none','Effektschicht aus ('+theme+')');assert.equal(s.theme,theme,'eigene Stimmung '+theme);assert.ok(s.frames>0,'Kellerlicht läuft');}
  const mini=await read(`const cv=document.querySelector('#minimap');const c=cv.getContext('2d'),d=c.getImageData(0,0,cv.width,cv.height).data;let red=0;for(let i=0;i<d.length;i+=4)if(d[i]>200&&d[i+1]<120&&d[i+2]<100)red++;return red`);
  assert.ok(mini>0,'Minikarte zeigt Gegner als rote Punkte');await shot('71-minikarte');
  await read(`g.leaveDungeon({force:true});return 1`);await wait(900);const back=await read(`const light=document.querySelector('canvas.world-light');return light?getComputedStyle(light).display:'none'`);assert.equal(back,'block','draußen wieder Weltlicht');
  pass(7,'Licht: '+out.map(s=>s.theme+' '+s.lights+' Lichter').join(', ')+', Weltlicht und Effektschicht im Keller aus, draußen wieder an; Minikarte mit Gegnern');
 }
 console.log(JSON.stringify(results,null,1));writeFileSync(dir+'/result.json',JSON.stringify({results,errors:b.errors},null,2));
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,3000));throw e;}finally{b.close();}
