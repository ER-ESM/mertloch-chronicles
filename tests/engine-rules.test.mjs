// Runde A: Sprüche als Ereignis `bark`, Bau-Ortsregel, Belohnungsgüte epic, Umland-Skalierung, Start ohne Hose.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,rng} from '../world.js';
import {Game,HUB_RADIUS} from '../engine.js';
import {makeEnemy,scaledStats,ENCOUNTER_RULES} from '../encounters.js';
import {rolledDefinition,restoreRolls,QUALITIES} from '../itemization.js';
import {ITEMS,addItem,equipItem,rewardOptions,countItem} from '../rpg.js';
import {ARCHETYPES,BOSSES,BOSS_LINES,ENEMY_BARKS,VILLAGERS,SPAWN_TABLES,BALANCE,BUILDINGS,enemyScale} from '../content/index.js';

const realWorld=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const arena=()=>({id:'arena',seed:1,spawn:{x:0,y:0},npc:{x:10,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[b]});
const barks=g=>g.events.filter(e=>e.type==='bark');

test('Gegner-Sprüche laufen als Ereignis `bark` an die UI: Feldgegner, Boss-Auftritt, Boss-Phase, Boss-Ende',()=>{
 const g=new Game(arena(),{level:12,trainingXp:20000});
 const thug=makeEnemy({x:40,y:0},7,{...ARCHETYPES.scrounger,archetype:'scrounger',aggro:true,ai:'combat'});
 g.enemies=[thug];g.target=thug;g.startCast(thug);
 const first=barks(g);
 assert.equal(first.length,1,'ein Spruch beim ersten Spezialangriff');
 assert.deepEqual({enemyId:first[0].enemyId,name:first[0].name,kind:first[0].kind},{enemyId:thug.id,name:thug.name,kind:'enemy'});
 assert.ok(ENEMY_BARKS.scrounger.includes(first[0].text),'Text stammt aus ENEMY_BARKS');
 assert.ok(g.messages.some(m=>m.text.includes(first[0].text)),'Spruch steht weiterhin im Kampflog');
 g.startCast(thug);
 assert.equal(barks(g).length,1,'kein Spruch bei jedem weiteren Angriff');
 // Tiere schweigen.
 const boar=makeEnemy({x:40,y:0},8,{...ARCHETYPES.boar,archetype:'boar',aggro:true,ai:'combat'});
 g.enemies.push(boar);g.startCast(boar);
 assert.equal(barks(g).length,1,'Tiere haben keine Sprüche');

 const h=new Game(arena(),{level:14,trainingXp:40000});
 const boss=makeEnemy({x:40,y:0},1,{...BOSSES.gisela,bossId:'gisela',aggro:true,ai:'combat'});
 h.enemies=[boss];h.target=boss;
 h.startCast(boss);
 assert.deepEqual(barks(h).map(b=>b.kind),['boss']);
 assert.equal(barks(h)[0].text,BOSS_LINES.gisela.engage);
 boss.hp=boss.maxHp*.4;h.startCast(boss);
 const phase=barks(h).find(b=>b.kind==='phase');
 assert.ok(phase&&phase.text.includes('Kurzwahl'),'Phasenzeile als kind:phase');
 boss.hp=1;h.damage(boss,50,'Kelle');
 assert.ok(barks(h).some(b=>b.kind==='boss'&&b.text===BOSS_LINES.gisela.defeat),'Niederlage als kind:boss');
});

test('Dorfbewohner sprechen als `bark` mit kind:villager, jede Blase genau einmal',()=>{
 const g=new Game(realWorld,{level:5,trainingXp:2000});
 const actor=g.life.actors.find(a=>a.kind==='villager');
 assert.ok(actor,'die Welt hat Bewohner');
 const villager=VILLAGERS.find(v=>v.variant===actor.variant);
 actor.bubble=3;g.events.length=0;g.villagerBarks();
 const said=barks(g);
 assert.equal(said.length,1);
 assert.equal(said[0].kind,'villager');
 assert.equal(said[0].name,villager.name);
 assert.ok(villager.says.includes(said[0].text));
 g.events.length=0;g.villagerBarks();
 assert.equal(barks(g).length,0,'dieselbe Blase spricht nicht zweimal');
 actor.bubble=0;g.villagerBarks();actor.bubble=3;g.events.length=0;g.villagerBarks();
 assert.equal(barks(g).length,1,'die nächste Blase spricht wieder');
 assert.equal(g.messages.length,0,'Dorfgeplauder verstopft das Kampflog nicht');
});

test('Basisbau nur am Treffpunkt und außerhalb des Kampfes',()=>{
 const g=new Game(arena(),{level:12,trainingXp:20000});
 g.quest.chapterClaimed=4;
 const stage=g.nextBuildStage('tresen');
 for(const [item,n] of Object.entries(stage.cost))addItem(g.rpg,item,n);
 Object.assign(g.player,{x:HUB_RADIUS+40,y:0});
 assert.equal(g.build('tresen'),false,'zu weit weg vom Treffpunkt');
 assert.ok(g.events.some(e=>e.type==='toast'&&e.text.includes(BUILDINGS.tresen.name)||e.type==='toast'&&e.text.includes('Treffpunkt')));
 assert.equal(g.buildings.tresen,undefined);
 Object.assign(g.player,{x:0,y:0});g.player.inCombat=7;
 assert.equal(g.build('tresen'),false,'nicht im Kampf');
 g.player.inCombat=0;
 assert.equal(g.build('tresen'),true);
 assert.equal(g.buildings.tresen,1);
});

test('Belohnungsgüte epic würfelt echt: mehr Budget und höhere Gegenstandsstufe als rare, und sie übersteht das Laden',()=>{
 assert.ok(QUALITIES.includes('epic'));
 for(const level of [1,9,20,30]){
  const raw={slot:'body',spec:'tresen',level,quality:'epic',roll:500};
  const epic=rolledDefinition(raw),rare=rolledDefinition({...raw,quality:'rare'});
  assert.equal(epic.rarity,'epic','Güte bleibt epic');
  assert.ok(epic.stats.might>rare.stats.might,'Budget epic > rare auf Stufe '+level);
  assert.ok(epic.itemLevel>rare.itemLevel,'Gegenstandsstufe epic > rare auf Stufe '+level);
  const factor=BALANCE.items.quality.epic/BALANCE.items.quality.rare;
  assert.ok(Math.abs(epic.stats.might/rare.stats.might-factor)<.05,'Budget folgt BALANCE.items.quality.epic');
 }
 const weapon=rolledDefinition({slot:'weapon',spec:'tresen',level:20,quality:'epic',roll:120});
 assert.ok(weapon.weapon?.max>0,'epische Waffen bekommen Waffenschaden');
 const saved={'roll-body-tresen-20-epic-500-quest-1':{slot:'body',spec:'tresen',level:20,quality:'epic',roll:500,family:'quest'}};
 const registry={},restored=restoreRolls(saved,registry);
 assert.equal(restored['roll-body-tresen-20-epic-500-quest-1'].quality,'epic','epische Fundstücke laden wieder');
 assert.equal(registry['roll-body-tresen-20-epic-500-quest-1'].rarity,'epic');
});

test('Kapitel 4 vergibt echte epische Belohnungen',()=>{
 const g=new Game(arena(),{level:20,trainingXp:200000});
 const options=rewardOptions(g,'main-4','epic');
 assert.equal(options.length,3);
 for(const id of options)assert.equal(ITEMS[id].rarity,'epic',id);
});

test('Feldgegner im Umland wachsen mit der Spielerstufe, der Dorfkern bleibt fest',()=>{
 const fox=ARCHETYPES.fox;
 assert.deepEqual(scaledStats(fox,10,false),{},'Dorfkern ohne Skalierung');
 const scaled=scaledStats(fox,10,true),factor=enemyScale(10-(BALANCE.enemies.playerLead??2),fox.level);
 assert.equal(scaled.hp,Math.round(fox.hp*factor.hp));
 assert.ok(scaled.hp>fox.hp&&scaled.damage>1,'Umland wächst mit');
 assert.deepEqual(scaledStats(fox,1,true),{hp:fox.hp,damage:1},'Stufe 1 ändert nichts');

 // Echte Welt: Dorfkern auf Stufe 1 unverändert, Umland auf Stufe 10 skaliert.
 const C=ENCOUNTER_RULES.cellSize;
 const cells=(level)=>{const g=new Game(realWorld,{level,trainingXp:level*level*70}),out=[];
  for(let cy=0;cy*C<realWorld.height;cy++)for(let cx=0;cx*C<realWorld.width;cx++)for(const e of g.ecology.buildCell(cx,cy))out.push(e);return out;};
 const low=cells(1),high=cells(10);
 const core=e=>Math.hypot(e.home.x-realWorld.spawn.x,e.home.y-realWorld.spawn.y)<=SPAWN_TABLES.tierDistance;
 for(const e of low.filter(core))assert.equal(e.hp,ARCHETYPES[e.archetype].hp,e.archetype+' im Dorfkern verändert');
 for(const e of high.filter(core))assert.equal(e.hp,ARCHETYPES[e.archetype].hp,e.archetype+' im Dorfkern verändert (Stufe 10)');
 const far=high.filter(e=>!core(e)&&ARCHETYPES[e.archetype]&&!e.elite);
 assert.ok(far.length,'es gibt Umland-Gegner');
 for(const e of far)assert.ok(e.hp>ARCHETYPES[e.archetype].hp,e.archetype+' im Umland nicht skaliert');
});

test('Umland-Tiere halten auf Spielerstufe 10 mindestens 2,5 Sekunden durch',()=>{
 // Tempo-Helfer nach tests/content.test.mjs: gleiche Rotation und Ausrüstungsauswahl, aber als
 // Schaden je Sekunde an einer Puppe gemessen — so verfälschen Leine und Rückzug die Zeit nicht.
 const WINDOW=20;
 const dps=level=>{
  const g=new Game(arena(),{level,classId:'dieter',trainingXp:level*level*70});g.random=rng(7);g.player.x=g.player.y=0;
  for(const slot of ['weapon','body','feet','charm']){const id=Object.keys(ITEMS).find(k=>ITEMS[k].slot===slot&&(ITEMS[k].level||1)<=level&&!ITEMS[k].unique);if(id){addItem(g.rpg,id);equipItem(g,id);}}
  const e=makeEnemy({x:30,y:0},1,{...ARCHETYPES.boar,hp:1e9,aggro:true,ai:'combat',behavior:'aggressive'});g.enemies=[e];g.target=e;g.player.inCombat=7;
  while(g.time<WINDOW&&!g.dead){if(g.gcd===0){if(g.player.runes===3&&g.cooldowns.burst===0)g.action('burst');else if(!e.mark&&g.cooldowns.mark===0)g.action('mark');else g.action('strike');}g.tick(.05);}
  assert.ok(!g.dead,'Puppe hat den Spieler auf Stufe '+level+' umgebracht');
  return g.stats.damage/g.time;
 };
 const throughput=dps(10);
 for(const kind of ['badger','goose','raven','fox']){
  const def=ARCHETYPES[kind],scaled=scaledStats(def,10,true);
  const before=def.hp/throughput,after=scaled.hp/throughput;
  assert.ok(after>=2.5,kind+' im Umland nur '+after.toFixed(1)+' s auf Stufe 10');
  assert.ok(after>before,kind+' skaliert nicht: '+after.toFixed(1)+' vs '+before.toFixed(1));
 }
});

test('Start ohne Hose: der Beinschutz bleibt leer, Kapitel 1 legt ein gewürfeltes Beinteil in den Rucksack',()=>{
 const g=new Game(arena(),{level:9,trainingXp:5000});
 assert.equal(g.rpg.equipment.legs,null,'Startausrüstung ohne Hose');
 assert.equal(g.rpg.inventory.some(e=>ITEMS[e.id].slot==='legs'),false,'auch nicht im Rucksack');
 g.acceptQuest();
 for(const type of ['wolf','wolf','wolf','cultist','cultist','boss'])g.kill({name:type,type,hp:10,maxHp:10,x:150,y:0});
 assert.equal(g.questReady(),true);
 Object.assign(g.player,g.world.npc);
 assert.equal(g.claimQuest(rewardOptions(g,g.rewardKey(),g.chapter().reward.gear)[0]),true);
 const legs=g.rpg.inventory.map(e=>ITEMS[e.id]).filter(d=>d.slot==='legs');
 assert.equal(legs.length,1,'genau ein Beinteil aus der Kapitelbelohnung');
 assert.equal(legs[0].rarity,QUALITIES[0],'einfachste Güte');
 assert.equal(legs[0].level,g.player.level);
 const loaded=new Game(arena(),g.save());
 assert.equal(loaded.rpg.inventory.filter(e=>ITEMS[e.id].slot==='legs').length,1,'das Beinteil übersteht das Speichern');
});

test('alte Spielstände bleiben ohne Hose und bekommen kein Beinteil nachgereicht',()=>{
 const legacy=new Game(arena(),{level:9,trainingXp:5000,quest:{wolves:3,cultists:2,boss:true,accepted:true,claimed:true}});
 assert.equal(legacy.quest.chapterClaimed,1,'alter Stand läuft als Kapitel 1 abgeholt weiter');
 assert.equal(legacy.rpg.equipment.legs,null);
 assert.equal(legacy.rpg.inventory.some(e=>ITEMS[e.id].slot==='legs'),false,'keine nachträgliche Hose');
 assert.equal(countItem(legacy.rpg,'brezel'),3,'Startrucksack unverändert');
});
