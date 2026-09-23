// Akt 1 „Filmriss“: Kapitelumschalter, Kapitel-Lager, Erinnerungsfetzen, Basisbau.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game,ACT_CHAPTERS,FIRST_CHAPTER,LAST_CHAPTER,chapterAt} from '../engine.js';
import {rewardOptions,addItem,countItem,useItem} from '../rpg.js';
import {rollDrop} from '../itemization.js';
import {ITEMS} from '../rpg.js';
import {STORY_CHAPTERS,SPAWN_TABLES,MEMORY_FRAGMENTS,BUILDINGS,SIDE_QUESTS,NPCS,ARCHETYPES,hubLine,pickTemplates} from '../content/index.js';

const realWorld=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const arena=()=>({id:'arena',seed:1,spawn:{x:0,y:0},npc:{x:10,y:0},shrine:{x:40,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[b]});
const lab=(saved={})=>new Game(arena(),{level:9,trainingXp:5000,...saved});
const memoryOf=id=>MEMORY_FRAGMENTS.find(m=>m.id===id);
/** Erfüllt alle Ziele des laufenden Kapitels und holt die Belohnung bei Ida ab. */
function playChapter(g){
 g.acceptQuest();
 for(const [i,objective] of g.objectives().entries()){
  if(objective.kind==='gather')for(const spot of g.gatherPoints().filter(p=>p.item===objective.item)){Object.assign(g.player,{x:spot.x,y:spot.y});g.collectGather(spot.id);}
  else for(const e of g.enemies.filter(e=>e.campId===g.campFor(objective)?.id)){e.hp=1;Object.assign(g.player,{x:e.x,y:e.y});g.damage(e,50,'Kelle');}
  assert.equal(g.objectiveProgress(i).complete,true,`Ziel ${i} in Kapitel ${g.quest.chapter} nicht erfüllt`);
 }
 Object.assign(g.player,g.world.npc);
 return g.claimQuest(rewardOptions(g,g.rewardKey(),g.chapter().reward.gear)[0]);
}

test('Akt 1 läuft von Kapitel 1 bis 4 durch; Reserve-Kapitel bleiben aus und danach ist der Akt abgeschlossen',()=>{
 // Kapitelablauf unabhängig von zufälliger Auto-Beute prüfen: Seed 65 füllt sonst
 // vor Kapitel 4 alle 24 Plätze und verhindert zu Recht die Belohnungsannahme.
 const g=new Game(realWorld,{level:14,trainingXp:40000,settings:{autoLoot:false}});g.rpg.lootState=65;
 assert.deepEqual(ACT_CHAPTERS.map(c=>c.id),[1,2,3,4]);
 assert.equal(STORY_CHAPTERS.filter(c=>c.reserve).every(c=>!ACT_CHAPTERS.includes(c)),true);
 for(const chapter of ACT_CHAPTERS){
  assert.equal(g.quest.chapter,chapter.id);
  assert.equal(g.questReady(),false);
  assert.equal(playChapter(g),true);
  assert.equal(g.quest.chapterClaimed,chapter.id);
 }
 assert.equal(g.quest.actDone,true);
 assert.equal(g.quest.chapter,LAST_CHAPTER);
 assert.equal(g.questReady(),false);
 assert.equal(g.acceptQuest(),false);
 assert.equal(g.destination(),null);
 // Kapitel 5/6 (Gisela, Automat) werden nie aktiviert.
 assert.equal((realWorld.camps||[]).some(c=>c.chapter>LAST_CHAPTER),false);
});

test('jedes Kapitel hat sein Lager; bevölkert wird es erst, wenn das Kapitel läuft',()=>{
 const g=new Game(realWorld,{level:14,trainingXp:40000,settings:{autoLoot:false}});g.rpg.lootState=65;
 const campsOf=chapter=>realWorld.camps.filter(c=>c.chapter===chapter);
 for(const chapter of ACT_CHAPTERS.filter(c=>c.id>FIRST_CHAPTER)){
  const camps=campsOf(chapter.id);
  assert.equal(camps.length,2,`Kapitel ${chapter.id} braucht Mob- und Boss-Lager`);
  assert.equal(camps.some(c=>c.type==='boss'&&c.boss===chapter.boss),true);
  const gather=chapter.objectives.find(o=>o.kind==='gather');
  assert.equal(camps.find(c=>c.type==='boss').gathers.length,gather.count);
  assert.equal(camps.find(c=>c.type==='boss').gathers.every(p=>p.item===gather.item),true);
  // Noch nicht bevölkert, solange das Kapitel nicht läuft.
  assert.equal(g.enemies.some(e=>camps.some(c=>c.id===e.campId)),false);
 }
 while(!g.quest.actDone)playChapter(g);
 for(const chapter of ACT_CHAPTERS.filter(c=>c.id>FIRST_CHAPTER)){
  const kill=chapter.objectives.find(o=>o.kind==='kill');
  const mob=g.enemies.filter(e=>e.campId===`chapter-${chapter.id}-mob`);
  assert.equal(mob.length,kill.count);
  assert.equal(mob.every(e=>e.family===kill.family),true);
  assert.equal(g.enemies.filter(e=>e.campId===`chapter-${chapter.id}-boss`)[0].bossId,chapter.boss);
 }
 // Kapitelgegner tauchen nie in den freien Spawn-Tabellen auf.
 const free=[...SPAWN_TABLES.aggressive,...SPAWN_TABLES.neutral].map(r=>r.kind);
 for(const [id,def] of Object.entries(ARCHETYPES))if(def.chapter)assert.equal(free.includes(id),false,`${id} gehört nicht in die freie Spawn-Tabelle`);
});

test('ein alter Spielstand lädt als Kapitel 1 weiter und behält seine abgeholte Belohnung',()=>{
 const running=new Game(realWorld,{quest:{accepted:true,wolves:2,cultists:1,boss:false,claimed:false}});
 assert.equal(running.quest.chapter,FIRST_CHAPTER);
 assert.equal(running.quest.accepted,true);
 assert.equal(running.questReady(),false);
 assert.equal(running.objectiveProgress(0).done,2);
 assert.equal(running.destination().label,chapterAt(1).objectives[0].label);
 const done=new Game(realWorld,{quest:{accepted:true,wolves:3,cultists:2,boss:true,claimed:true},relic:true});
 assert.equal(done.quest.claimed,true);
 assert.equal(done.quest.chapterClaimed,FIRST_CHAPTER);
 assert.equal(done.quest.chapter,FIRST_CHAPTER+1);
 assert.equal(done.quest.accepted,false);
 assert.equal(done.quest.actDone,false);
 // Der Spielstand überlebt einen Neuaufbau samt Kapitel, Fetzen und Bude.
 done.acceptQuest();done.buildings={tresen:1};done.memories.seen.push('stempel');
 const reloaded=new Game(realWorld,done.save());
 assert.equal(reloaded.quest.chapter,FIRST_CHAPTER+1);
 assert.equal(reloaded.quest.accepted,true);
 assert.deepEqual(reloaded.buildings,{tresen:1});
 assert.deepEqual(reloaded.memories.seen,['stempel']);
});

test('jeder Erinnerungsfetzen erscheint genau einmal und meldet sich an die UI',()=>{
 const g=lab();
 const fired=()=>g.events.filter(e=>e.type==='memory').map(e=>e.fragment.id);
 g.tutorial={completed:true};g.tick(.05);
 assert.deepEqual(fired(),['stempel']);
 assert.equal(g.events.some(e=>e.type==='toast'&&e.text.includes(memoryOf('stempel').title)),true);
 g.tutorialReported=false;g.tick(.05);
 assert.deepEqual(fired(),['stempel'],'Fetzen erscheint nicht zweimal');
 // Verpflegung, Boss, Tod, Basisbau, Kapitelbelohnung
 g.player.energy=0;addItem(g.rpg,'kaltgetraenk',2);
 useItem(g,'kaltgetraenk');
 g.rpg.consumableReady=0;g.player.energy=0;useItem(g,'kaltgetraenk');
 assert.deepEqual(fired().filter(id=>id==='kasten-feuerzeug'),['kasten-feuerzeug']);
 g.memoryEvent({kind:'bossDefeat',boss:'klaus'});
 g.memoryEvent({kind:'bossDefeat',boss:'klaus'});
 assert.deepEqual(fired().filter(id=>id==='neues-spiel'),['neues-spiel']);
 g.hitPlayer({name:'Tresen',damage:1},10000,false);
 assert.deepEqual(fired().filter(id=>id==='wurst-ins-gesicht'),['wurst-ins-gesicht']);
 g.memoryEvent({kind:'buildingStage',building:'tresen',stage:1});
 assert.deepEqual(fired().filter(id=>id==='kastenturm'),['kastenturm']);
 g.memoryEvent({kind:'chapterClaimed',chapter:1});
 assert.deepEqual(fired().filter(id=>id==='pizzeria'),['pizzeria']);
 assert.equal(new Set(g.memories.seen).size,g.memories.seen.length);
});

test('Basisbau prüft das Kapitel, zieht Material ab und hebt die Stufe',()=>{
 const g=lab();
 assert.equal(g.nextBuildStage('tresen'),null,'ohne abgeholtes Kapitel 2 ist nichts baubar');
 assert.equal(g.build('tresen'),false);
 g.quest.chapterClaimed=2;
 const stage=g.nextBuildStage('tresen');
 assert.equal(stage.stage,1);
 assert.equal(g.build('tresen'),false,'ohne Material wird nicht gebaut');
 for(const [item,count] of Object.entries(stage.cost))addItem(g.rpg,item,count+1);
 assert.equal(g.build('tresen'),true);
 assert.equal(g.buildings.tresen,1);
 for(const [item,count] of Object.entries(stage.cost))assert.equal(countItem(g.rpg,item),1,`${item} nicht korrekt abgezogen`);
 assert.equal(g.events.some(e=>e.type==='buildingsChanged'&&e.building==='tresen'&&e.stage===1),true);
 assert.equal(g.events.some(e=>e.type==='memory'&&e.fragment.id==='kastenturm'),true);
 // Stufe 2 des Tresens verlangt Kapitel 3.
 assert.equal(g.nextBuildStage('tresen'),null);
 g.quest.chapterClaimed=3;
 assert.equal(g.nextBuildStage('tresen').stage,2);
 // Endausbau: danach gibt es keine Stufe mehr.
 g.quest.chapterClaimed=4;g.buildings.pfandlager=BUILDINGS.pfandlager.stages.length;
 assert.equal(g.nextBuildStage('pfandlager'),null);
});

test('jeder Basisbau-Vorteil wirkt an seiner Stellschraube',()=>{
 // Regeneration außerhalb des Kampfes (Tresen)
 const plain=lab(),built=lab();built.buildings={tresen:1};
 for(const g of [plain,built]){g.player.hp=100;g.player.inCombat=0;g.momentum.restUntil=-1;g.tick(.05);}
 assert.ok(built.player.hp>plain.player.hp);
 assert.equal(Math.round((built.player.hp-100)/(plain.player.hp-100)*100)/100,1.25);
 // Verpflegung heilt mehr und ist schneller bereit (Grill)
 const grill=lab();grill.buildings={grill:2};grill.player.hp=1;addItem(grill.rpg,'brezel');
 useItem(grill,'brezel');
 assert.equal(grill.player.hp,1+Math.round(ITEMS.brezel.heal*1.3));
 assert.equal(Math.round(grill.rpg.consumableReady),12);
 // Erlittener Schaden (Landhaus-Ecke)
 const soft=lab();soft.buildings={landhausecke:2};
 const hard=lab();
 for(const g of [soft,hard]){g.player.parry=0;g.hitPlayer({damage:1},200,false);}
 assert.ok(soft.player.maxHp-soft.player.hp<hard.player.maxHp-hard.player.hp);
 // Erfahrung (Pfandlager)
 const xp=lab();xp.buildings={pfandlager:2};const before=xp.trainingXp;xp.gainXp(100);
 assert.equal(xp.trainingXp-before,110);
 // Stärkung hält länger, Ausweichen ist schneller bereit (Anlage)
 const loud=lab();loud.buildings={anlage:3};const quiet=lab();
 for(const g of [loud,quiet]){g.gcd=0;g.action('buff');g.gcd=0;g.action('dash');}
 assert.ok(loud.buffs.remaining>quiet.buffs.remaining);
 assert.equal(Math.round(loud.buffs.remaining/quiet.buffs.remaining*100)/100,1.3);
 assert.equal(Math.round(loud.cooldowns.dash/quiet.cooldowns.dash*100)/100,.9);
 // Randale je Kill und Erwachen mit Deckung (Werkstatt, Tresen)
 const shop=lab();shop.buildings={werkstatt:3,tresen:2};shop.player.energy=0;
 shop.gainMomentum();
 assert.equal(shop.player.energy,30);
 shop.dead=true;shop.respawn();
 assert.ok(shop.classState.guard>0);
 assert.equal(lab().classState.guard,0);
 // Beute: Ausrüstungschance und Pfandmarken (Werkstatt)
 const drop=(g,draws)=>{let i=0;g.lootRandom=()=>draws[i++]??.5;return rollDrop(g,{family:'warden',level:3,type:'cultist',x:0,y:0},ITEMS);};
 const shopped=()=>Object.assign(lab(),{buildings:{werkstatt:3}});
 const gearDraws=[.9,.25];                       // Material nein · Ausrüstung nur mit Werkstatt (20 % → 30 %)
 assert.equal(drop(lab(),gearDraws).items.length,0);
 assert.equal(drop(shopped(),gearDraws).items.length,1);
 const coinDraws=[.9,.9,.9,.9,.8];               // nur Pfandmarken unterscheiden sich (70 % → 90 %)
 assert.equal(drop(lab(),coinDraws).coins,0);
 assert.ok(drop(shopped(),coinDraws).coins>0);
});

// Seit E-61 stehen Dieter, Anni und Kevin nicht mehr als Mentoren in der Bude – Stammgäste: tests/stammgaeste.test.mjs.

test('die Akt-1-Nebenquests kommen mit ihren eigenen Questgebern an ihre Orte',()=>{
 const act=SIDE_QUESTS.filter(t=>['dieter','baerbel','kevin','pit','ida'].includes(t.npc));
 assert.equal(act.length,10);
 for(const t of act)assert.ok(NPCS[t.npc],`NPC ${t.npc} fehlt`);
 // In der echten Welt trägt jede Nebenquest den Namen ihres Questgebers und steht an einem Treffpunkt.
 for(const q of realWorld.quests){
  const template=SIDE_QUESTS.find(t=>t.id===q.template);
  assert.ok(template,'Quest ohne Vorlage');
  assert.equal(q.giver.name,NPCS[template.npc].name);
  assert.ok(q.giver.hubId,'Questgeber steht an einem Treffpunkt');
  assert.ok(q.title&&q.description&&q.lines);
 }
 // Jede Akt-1-Vorlage kommt bei mindestens einem Welt-Seed an die Reihe (Rotation in pickTemplates).
 const pattern=Array.from({length:6},(_,i)=>({type:['gather','scout','hunt'][i%3]}));
 const rotated=new Set();
 for(let seed=0;seed<60;seed++)for(const t of pickTemplates(pattern,seed))rotated.add(t.id);
 // strom-kevin steht an fünfter Stelle der Scout-Vorlagen und wird von der Rotation nie erreicht (content/BACKLOG.md).
 for(const id of ['paletten-dieter','glaeser-anni','amtshilfe-pit','sperrmuell-ida'])assert.equal(rotated.has(id),true,`Vorlage ${id} wird nie ausgewählt`);
});
