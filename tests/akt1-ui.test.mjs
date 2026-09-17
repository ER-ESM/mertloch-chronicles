// Akt-1-Oberflächen gegen den echten Spielstand: Bude, Erinnerungen, Kapitelliste, Auftragsbuch.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game,ACT_CHAPTERS} from '../engine.js';
import {basePanel,memoriesPanel,chaptersPanel,baseEffectList,canBuild,rewardLine} from '../chapter-ui.js';
import {questlogPanel} from '../questlog-ui.js';
import {clanMenu} from '../clan-ui.js';
import {BOOK_TABS} from '../popup-windows.js';
import {BUILDINGS,MEMORY_FRAGMENTS,LORE,TUTORIAL,CLAN_MEMBERS} from '../content/index.js';
import {addItem,ITEMS} from '../rpg.js';

const world=new World(JSON.parse(readFileSync('data/mertloch.json','utf8')));
const fresh=()=>new Game(world,{});

test('Das Clanbuch bleibt ein Fenster mit höchstens sieben Reitern und trägt die Bude',()=>{
 assert.ok(BOOK_TABS.length<=7,'höchstens sieben Reiter');
 assert.equal(new Set(BOOK_TABS.map(t=>t[0])).size,BOOK_TABS.length);
 assert.equal(new Set(BOOK_TABS.map(t=>t[3])).size,BOOK_TABS.length,'jede Taste kommt genau einmal vor');
 assert.ok(BOOK_TABS.some(t=>t[0]==='base'));
});

test('Reiter „Bude“ zeigt vor Kapitel 2 die Trümmer und danach nur freigeschaltete Gebäude',()=>{
 const g=fresh();
 assert.ok(basePanel(g).includes(LORE.destruction.slice(0,40)),'ohne Freischaltung der Hinweis aus LORE.destruction');
 g.quest.chapterClaimed=2;
 const panel=basePanel(g);
 for(const id of ['tresen','grill','werkstatt'])assert.ok(panel.includes(BUILDINGS[id].name),id);
 assert.ok(!panel.includes(BUILDINGS.anlage.name),'Kapitel-3-Gebäude bleibt verborgen');
 // Kosten stehen dem Rucksackbestand gegenüber und färben sich erst grün, wenn es reicht.
 assert.ok(panel.includes('0 / '+BUILDINGS.tresen.stages[0].cost.palettenholz));
 assert.ok(panel.includes('requirements-failed'));
 assert.match(panel,/data-build="tresen"[^>]*disabled/);
 for(const [item,n] of Object.entries(BUILDINGS.tresen.stages[0].cost))for(let i=0;i<n;i++)addItem(g.rpg,item);
 const stocked=basePanel(g);
 assert.ok(stocked.includes('stat-gain'));assert.ok(!/data-build="tresen"[^>]*disabled/.test(stocked));
 for(const item of Object.keys(BUILDINGS.tresen.stages[0].cost))assert.ok(stocked.includes(ITEMS[item].name));
});

test('Gebaut wird nur am Treffpunkt – dieselbe Regel wie die Klamottenwahl',()=>{
 const g=fresh();g.quest.chapterClaimed=2;
 for(const [item,n] of Object.entries(BUILDINGS.tresen.stages[0].cost))for(let i=0;i<n;i++)addItem(g.rpg,item);
 Object.assign(g.player,world.spawn);assert.equal(canBuild(g),true);
 assert.ok(!/data-build="tresen"[^>]*disabled/.test(basePanel(g)));
 g.player.x=world.spawn.x+400;assert.equal(canBuild(g),false);
 assert.match(basePanel(g),/data-build="tresen"[^>]*disabled/);
 assert.ok(clanMenu(g).includes('disabled'),'auch die Klamottenwahl sperrt fern vom Treffpunkt');
});

test('„Was die Bude bringt“ summiert die gebauten Stufen mit ihren Beschreibungen',()=>{
 const g=fresh();assert.equal(baseEffectList(g),'');
 g.quest.chapterClaimed=2;g.buildings.tresen=1;g.buildings.grill=1;
 const list=baseEffectList(g);
 assert.ok(list.includes('+25 %'),'Regeneration aus Tresen Stufe 1');
 assert.ok(list.includes('+15 %'),'Verpflegung aus Grill Stufe 1');
 assert.equal(Object.keys(g.baseEffects()).length,2);
});

test('Erinnerungen stehen in Erzählreihenfolge; ungesehene bleiben verdeckt',()=>{
 const g=fresh();
 const empty=memoriesPanel(g);
 assert.ok(!empty.includes(MEMORY_FRAGMENTS[0].text),'ungesehener Fetzen verrät seinen Text nicht');
 assert.equal((empty.match(/class="memory-entry unknown"/g)||[]).length,MEMORY_FRAGMENTS.length);
 g.memories.seen=[MEMORY_FRAGMENTS[2].id,MEMORY_FRAGMENTS[0].id];
 const seen=memoriesPanel(g);
 assert.ok(seen.includes(MEMORY_FRAGMENTS[0].title)&&seen.includes(MEMORY_FRAGMENTS[0].clue));
 assert.ok(seen.includes('2 / '+MEMORY_FRAGMENTS.length));
 // Reihenfolge folgt `order`, nicht der Erlebnisreihenfolge im Spielstand.
 assert.ok(seen.indexOf(MEMORY_FRAGMENTS[0].title)<seen.indexOf(MEMORY_FRAGMENTS[2].title));
});

test('Die Kapitelliste zeigt Status, Hinweis und Freischaltungen erst nach Abschluss',()=>{
 const g=fresh();
 const open=chaptersPanel(g);
 for(const c of ACT_CHAPTERS)assert.ok(open.includes(c.title),c.title);
 assert.ok(!open.includes(ACT_CHAPTERS[0].clue),'der Hinweis bleibt bis zum Abschluss weg');
 assert.ok(!open.includes(ACT_CHAPTERS[3].summary),'spätere Kapitel verraten ihren Inhalt nicht');
 g.quest.chapter=2;g.quest.chapterClaimed=1;
 const after=chaptersPanel(g);
 assert.ok(after.includes(ACT_CHAPTERS[0].clue));
 for(const unlock of ACT_CHAPTERS[0].unlocks)assert.ok(after.includes(unlock));
 assert.ok(after.includes(ACT_CHAPTERS[1].summary),'das laufende Kapitel zeigt seine Zusammenfassung');
});

test('Das Auftragsbuch nimmt Titel, Ziele und Belohnung aus dem laufenden Kapitel',()=>{
 const g=fresh();g.quest.accepted=true;
 for(const chapter of ACT_CHAPTERS){
  g.quest.chapter=chapter.id;g.quest.chapterClaimed=chapter.id-1;
  const html=questlogPanel(g,'all');
  assert.ok(html.includes(chapter.title),'Titel Kapitel '+chapter.id);
  for(const step of g.chapterProgress())assert.ok(html.includes(step.objective.label),'Ziel „'+step.objective.label+'“');
  assert.ok(html.includes(rewardLine(chapter.reward)),'Belohnung Kapitel '+chapter.id);
 }
});

test('Die Klamottenwahl spricht von Klamotten, nicht vom Übernehmen',()=>{
 const g=fresh();const html=clanMenu(g);
 assert.ok(html.includes(TUTORIAL.clan));
 assert.ok(html.includes(LORE.hero.slice(0,40)));
 assert.ok(!html.includes('übernehmen'));
 // Playtest P7: drei sichtbare Karten zum Aussuchen, danach genau ein Knopf zum Bestätigen.
 for(const m of CLAN_MEMBERS)assert.ok(html.includes('data-member-pick="'+m.id+'"'),m.name);
 assert.equal((html.match(/data-member="/g)||[]).length,1);
 for(const m of CLAN_MEMBERS)if(m.id!==g.member.id){const picked=clanMenu(g,m.id);
  assert.ok(picked.includes(m.name+'s Klamotten anziehen'),m.name);
  assert.ok(picked.includes('data-member="'+m.id+'"'),m.name);}
});
