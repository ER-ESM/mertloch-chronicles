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
 const r=describeCast('d-gerd','rausschmiss');assert.equal(r.main,'cone');assert.equal(r.hint,'Seitlich stehen');assert.deepEqual(r.traits.map(t=>t.id),['cone','knockback','tank']);
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
