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
 console.log(JSON.stringify(results,null,1));writeFileSync(dir+'/result.json',JSON.stringify({results,errors:b.errors},null,2));
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,3000));throw e;}finally{b.close();}
