// Etappe 2 „Lesbar wie WoW“ (Dungeon Schloss Big B, E-71): Eingang auf Karte und Minikarte, Zauberbeschreibung aus den Merkmalen,
// Journal aus den Daten, Eingangskarte. Browserprüfung: scripts/dungeon-e2-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_UI,WORLD_MAP_UI,MINIMAP_GROUPS,MINIMAP_UI,describeCast,castTraits} from '../content/index.js';
import {mapPlaces,dungeonPlaces,PLACE_PRIO} from '../cartography.js';
import {MAP_PAINT} from '../map-symbols.js';
import {bossCasts,roleHints,bossLoot,journalPanel} from '../dungeon-journal.js';
import {entryCard,heroRole} from '../dungeon-entry.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;return g;}

test('Eingang steht auf der Weltkarte, auch unter der Einlassstufe (grau), mit Stufenband und Gruppengröße',()=>{
 for(const level of [4,10]){const g=game(level),p=mapPlaces(g).find(h=>h.group==='dungeon');
  assert.ok(p,'Dungeon in den Orten (Stufe '+level+')');assert.equal(p.title,'Schloss Big B');assert.deepEqual(p.level,{min:8,max:10});assert.equal(p.heads,5);
  assert.equal(p.low,level<8);assert.equal(p.icon,level<8?'dungeon-low':'dungeon');assert.ok(MAP_PAINT[p.icon],'Symbol gemalt');}
 assert.ok(PLACE_PRIO.dungeon>PLACE_PRIO.hub,'Dungeon führt ein Bündel vor Treffpunkten');
 assert.equal(DUNGEON_UI.line('Schloss Big B',8,10,5),'Schloss Big B · Stufe 8–10 · 5 Köpfe');
});
test('eine Kategorie „Dungeons“ in beiden Filterlisten, standardmäßig an',()=>{
 const w=WORLD_MAP_UI.groups.find(x=>x.id==='dungeon');assert.ok(w&&w.on,'Weltkarte');assert.equal(w.name,'Dungeons');
 assert.ok(MINIMAP_GROUPS.includes('dungeon'),'Minikarte');assert.equal(MINIMAP_UI.groups.dungeon,'Dungeons');assert.equal(WORLD_MAP_UI.sectionWords.dungeon,'Dungeons');
});
test('Zauberhinweise stehen im Feld hint, nicht mehr im Namen; Symbol und Merkmale kommen aus den Daten',()=>{
 for(const [setId,set] of Object.entries(DUNGEON_CASTS))for(const [id,c] of Object.entries(set.casts)){
  assert.ok(!c.name.includes('·'),'kein Hinweis im Namen: '+setId+'.'+id);
  const d=describeCast(setId,id);assert.ok(d.icon&&MAP_PAINT[d.icon],'Symbol: '+id);assert.ok(d.hint&&d.hint.split(' ').length<=3,'2–3 Wörter: '+id+' → '+d.hint);assert.ok(d.traits.length>=1);}
 const r=describeCast('d-gerd','rausschmiss');assert.equal(r.main,'cone');assert.equal(r.hint,'Seitlich stehen');assert.deepEqual(r.traits.map(t=>t.id).filter(id=>['cone','knockback','tank'].includes(id)),['cone','knockback','tank']);
 assert.equal(describeCast('d-gerd','liste').main,'interrupt');assert.equal(describeCast('d-gerd','liste',{interrupt:false}).hint,DUNGEON_UI.traits.noInterrupt.answer);
 assert.equal(describeCast('d-gerd','dresscode').main,'ground');
 assert.deepEqual(castTraits({damage:10}),['hit'],'ohne Merkmal: gezielter Treffer');
});
test('Journal aus den Daten: Fähigkeiten über alle Phasen je einmal, Rollenhinweise aus den Merkmalen, Beute ohne eigene Tabelle leer',()=>{
 assert.deepEqual(bossCasts('gerd').map(c=>c.type).sort(),['dresscode','liste','rausschmiss']);
 const hints=roleHints('gerd');assert.ok(hints.tank.length&&hints.heal.length&&hints.damage.length,'jede Rolle hat einen Hinweis');
 assert.ok(hints.damage.includes(DUNGEON_UI.journal.roleHints.damage.interrupt));
 assert.ok(Array.isArray(bossLoot('gerd')));
 const html=journalPanel(game(),'gerd');assert.match(html,/data-dj-cast="rausschmiss"/);assert.match(html,/data-dicon="trait-cone"/);assert.match(html,/data-dj-role="tank"/);
 for(const b of DUNGEONS['schloss-bigb'].bosses)assert.match(html,new RegExp('data-dj-boss="'+b.id+'"'),'Reiter für '+b.id);
 assert.equal((html.match(/class="dj-ability"/g)||[]).length,3+(DUNGEON_BOSSES.gerd.phases.some(p=>p.summon)?1:0),'drei Fähigkeiten und Verstärkung');
});
test('Eingangskarte: fünf Plätze, drei Beuteplätze, Stufenband; unter Stufe 8 gesperrt',()=>{
 const g=game(10),html=entryCard(g);assert.equal((html.match(/class="dg-slot/g)||[]).length,5);assert.equal((html.match(/class="dg-loot[ "]/g)||[]).length,3);assert.match(html,/Stufe 8–10/);assert.doesNotMatch(html,/aria-disabled="true" data-tooltip-label="Erst ab/);
 assert.ok(['tank','heal','damage'].includes(heroRole(g)));
 const low=entryCard(game(4));assert.match(low,/data-dg-enter aria-disabled="true"/,'unter Stufe 8 ausgegraut');
 g.rpg.coins=999;g.hireCompanion('merc-pils-peter');const two=entryCard(g);assert.match(two,/data-dg-mate="merc-pils-peter"/);assert.doesNotMatch(two,/data-dg-hire="merc-pils-peter"/,'Angeheuerte stehen nicht mehr im Angebot');
});
test('Warnleiste: kommende Fähigkeiten aus Zyklus und Zauberabstand, Phasenwechsel beginnt den neuen Zyklus',async()=>{
 const {upcomingCasts}=await import('../boss-alerts.js');const {COMBAT_RULES}=await import('../content/index.js');
 const boss={bossId:'gerd',castSet:'d-gerd',cycle:1,hp:90000,maxHp:90000,attackTimer:2,cast:null};
 const up=upcomingCasts(boss);assert.equal(up[0].type,'rausschmiss');assert.equal(up[0].start,2);assert.equal(up[0].hit,2+DUNGEON_CASTS['d-gerd'].casts.rausschmiss.total);
 assert.equal(up[1].type,'dresscode');assert.ok(Math.abs(up[1].start-(up[0].hit+COMBAT_RULES.specialInterval))<1e-9);
 const casting={...boss,cast:{type:'liste',remaining:1,total:2.4},cycle:1};const c=upcomingCasts(casting);assert.equal(c[0].active,true);assert.equal(c[0].hit,1);assert.equal(c[1].type,'rausschmiss');
 const phase2={...boss,hp:20000,saidPhases:new Set([.5])};assert.equal(upcomingCasts(phase2)[0].set,'d-gerd2','unter 25 % gilt der neue Zyklus');assert.equal(upcomingCasts(phase2)[0].type,'rausschmiss');
 assert.deepEqual(upcomingCasts({hp:0}),[]);
});
test('Heldenlücke umfasst Held und Ziel',async()=>{
 const {unionBox,heroBox}=await import('../hero-frame.js');const h=heroBox(2,2,10),u=unionBox(h,100,-20,heroBox(2,2,10));
 assert.equal(u.left,h.left);assert.equal(u.right,100+h.right);assert.equal(u.up,h.up+20);assert.equal(u.down,h.down);
});
test('Wegmarke über Ebenen: der Pfeil führt zum nächsten benutzbaren Übergang',async()=>{
 const {floorRoute,setDungeonWaypoint,dungeonDestination,toWorld}=await import('../dungeon.js');const g=game(10);g.enterDungeon('schloss-bigb',{force:true});const r=g.dungeonRun;
 assert.equal(floorRoute(r,'e0','k1').t.id,'lichtschacht','Kette zu: nach unten nur durch den Lichtschacht');assert.equal(floorRoute(r,'k1','e0').t.id,'treppe-zugbruecke','von unten ist die Kette offen');
 r.killed.add('gerd');const step=floorRoute(r,'e0','k1');assert.equal(step.t.id,'treppe-zugbruecke','nach Gerd die Treppe');assert.equal(step.t[step.side].floor,'e0');assert.equal(floorRoute(r,'e0','k2').t.id,'treppe-zugbruecke','über Keller 1 nach Keller 2');
 assert.ok(setDungeonWaypoint(g,{floor:'k1',...toWorld(r.def,'k1',30,8)}));const d=dungeonDestination(g);assert.ok(d.step,'Ziel ist ein Übergang');
 Object.assign(g.player,toWorld(r.def,'k1',30,8.5));assert.equal(dungeonDestination(g),null,'angekommen: Marke fällt weg');
});
test('Schwarm-Sammelschild: ruhende Pfandratten zeigen ein Schild je Schwarm',async()=>{
 const {swarmPlates,inIdleSwarm,dungeonScale,dungeonRole}=await import('../dungeon-actors.js');const g=game(10);g.enterDungeon('schloss-bigb',{force:true});
 const plates=swarmPlates(g,()=>true);assert.equal(plates.length,2,'zwei Schwärme im Weinkeller');assert.deepEqual(plates.map(p=>p.count),[8,8]);
 const rat=g.enemies.find(e=>e.dungeonKind==='kellerratte');assert.ok(inIdleSwarm(g,rat));rat.aggro=true;assert.equal(inIdleSwarm(g,rat),false,'im Kampf eigenes Schild');
 const gerd=g.enemies.find(e=>e.bossId==='gerd');assert.equal(dungeonScale(gerd),1.35);assert.equal(dungeonRole(gerd),'boss');
 assert.equal(dungeonRole(g.enemies.find(e=>e.dungeonKind==='maklerpraktikant')),'heal');assert.equal(dungeonRole(g.enemies.find(e=>e.dungeonKind==='baumarktritter')),'elite');
});
test('Warnleiste rechnet eigene Abstände im Zyklus (gaps: doppelter Rausschmiss in Phase 2)',async()=>{
 const {upcomingCasts}=await import('../boss-alerts.js');const set=DUNGEON_CASTS['d-gerd2'];if(!set.gaps)return;
 const boss={bossId:'gerd',castSet:'d-gerd2',cycle:0,hp:20000,maxHp:90000,attackTimer:1,cast:null,saidPhases:new Set([.5,.25])};
 const up=upcomingCasts(boss,{count:3});assert.equal(up[0].type,'rausschmiss');assert.equal(up[1].type,'rausschmiss');
 assert.ok(Math.abs(up[1].start-(up[0].hit+set.gaps[0]))<1e-9,'zweiter Rausschmiss nach dem eigenen Abstand');
});
