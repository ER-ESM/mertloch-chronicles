// Welle D (Nutzerauftrag 2026-09-17): benutzbare Gegenstände in der Aktionsleiste, Auto-Loot mit Ereignis,
// Beschreibungs-API game.describe()/game.activeBuffs().
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {ITEMS,addItem,actionBar,barSlots,bindSkill,barItemEntry,usableItem,createDrop,takeLoot,BAG_SIZE} from '../rpg.js';
import {BALANCE,PROC_RULES} from '../content/index.js';

const arena=()=>({id:'welle-d',seed:7,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],
 camps:[{id:'camp-1',x:30,y:0,type:'wolf',count:1}],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{...b}]});
const events=(g,type)=>g.events.filter(e=>e.type===type);
const toasts=g=>g.events.filter(e=>e.type==='toast').map(e=>e.text);

// ---------- 1. Benutzbare Gegenstände in der Aktionsleiste ----------

test('Verpflegung liegt auf der Leiste, wird ohne Menü benutzt und respektiert die Abklingzeit',()=>{
 const g=new Game(arena());
 assert.ok(usableItem('brezel'),'kind:consumable reicht als Rückfall für usable');
 // Startverpflegung nimmt von hinten freie Plätze, Kniffe behalten die vorderen.
 const bar=actionBar(g);
 assert.ok(bar.includes(barItemEntry('brezel'))&&bar.includes(barItemEntry('wasser')));
 assert.deepEqual(bar.slice(0,2),['auto','strike']);
 const slot=bar.indexOf(barItemEntry('brezel'));
 const before=barSlots(g)[slot];
 assert.equal(before.kind,'item');assert.equal(before.id,'brezel');assert.equal(before.count,3);assert.equal(before.empty,false);
 g.player.hp=100;g.events.length=0;
 assert.equal(g.action(slot),true,'ein Leistenplatz darf auch als Zahl kommen');
 assert.equal(g.player.hp,260);
 assert.equal(barSlots(g)[slot].count,2,'der Stapel zählt herunter');
 // consumableCd: sofort nochmal geht nicht, nach der Abklingzeit schon.
 g.player.hp=100;
 assert.equal(g.action(barItemEntry('brezel')),false);
 assert.ok(toasts(g).some(t=>t.includes('noch nicht bereit')));
 assert.equal(g.rpg.consumableReady,BALANCE.player.consumableCooldown);
 g.time=BALANCE.player.consumableCooldown;
 assert.equal(g.action(barItemEntry('brezel')),true);
 assert.equal(barSlots(g)[slot].count,1);
});

test('Basisbau verkürzt die Abklingzeit der Verpflegung',()=>{
 const g=new Game(arena());g.buildings={grill:2};g.player.hp=100;
 assert.equal(g.action(barItemEntry('brezel')),true);
 assert.equal(g.rpg.consumableReady,BALANCE.player.consumableCooldown-3,'Warmhaltezone: 3 s schneller bereit');
});

test('Belegung wird gespeichert; ein leerer Stapel lässt den Platz reserviert und ausgegraut',()=>{
 const g=new Game(arena());
 addItem(g.rpg,'currywurst',1);
 g.events.length=0;
 assert.ok(bindSkill(g,barItemEntry('currywurst'),4));
 assert.equal(events(g,'barChanged').length,1,'Ereignis barChanged bei jeder Änderung');
 assert.equal(actionBar(g)[4],barItemEntry('currywurst'));
 assert.equal(bindSkill(g,barItemEntry('kronkorken'),5),false,'Material ist nicht benutzbar');
 const loaded=new Game(arena(),g.save());
 assert.equal(actionBar(loaded)[4],barItemEntry('currywurst'),'die Belegung überlebt das Laden');
 // Stapel aufgebraucht: der Platz bleibt, die UI graut ihn aus.
 loaded.rpg.inventory=loaded.rpg.inventory.filter(e=>e.id!=='currywurst');
 const slot=barSlots(loaded)[4];
 assert.equal(slot.kind,'item');assert.equal(slot.count,0);assert.equal(slot.empty,true);assert.equal(slot.available,false);
 loaded.player.hp=100;
 assert.equal(loaded.action(4),false,'ein leerer Stapel lässt sich nicht benutzen');
 assert.ok(toasts(loaded).some(t=>t.includes('nichts mehr dabei')));
});

test('Kniffe haben Vorrang: neu gelernte Kniffe verdrängen den letzten Gegenstand',()=>{
 const g=new Game(arena());
 assert.equal(actionBar(g).filter(e=>e&&e.startsWith('item:')).length,2,'zwei Verpflegungsplätze auf Stufe 1');
 g.gainXp(40000);
 const bar=actionBar(g);
 assert.equal(bar.filter(Boolean).length,10,'die Leiste ist voll');
 assert.equal(bar.filter(e=>e.startsWith('item:')).length,1,'neun Kniffe verdrängen einen der beiden Gegenstände');
 assert.ok(g.skills.filter(s=>bar.includes(s.id)).length>=9);
});

// ---------- 2. Auto-Loot ----------

test('Auto-Loot sammelt beim Kill ein, meldet das Ereignis und öffnet kein Beutefenster',()=>{
 const g=new Game(arena());g.lootRandom=()=>0;
 assert.equal(g.settings.autoLoot,true,'Standard an');
 const e=g.enemies[0];e.name='Pfanddachs';
 const coinsBefore=g.rpg.coins;
 g.events.length=0;
 g.kill(e);
 const loot=events(g,'loot');
 assert.equal(loot.length,1);
 assert.ok(loot[0].items.length,'Beute im Ereignis');
 for(const item of loot[0].items){assert.ok(ITEMS[item.id]);assert.ok(item.count>0);assert.ok(item.rarity);assert.equal(typeof item.rolled,'boolean');}
 assert.equal(loot[0].source.name,'Pfanddachs');
 assert.equal(loot[0].source.kind,'enemy');
 assert.ok(g.rpg.coins>=coinsBefore);
 assert.equal(g.rpg.loot.length,0,'kein Beutel bleibt liegen – das Beutefenster hat nichts zu zeigen');
 for(const item of loot[0].items)assert.ok(g.rpg.inventory.some(x=>x.id===item.id),'Beute liegt im Rucksack');
});

test('Voller Rucksack: Auto-Loot legt den Rest in rpg.recovery und meldet es',()=>{
 const g=new Game(arena());g.lootRandom=()=>0;
 g.rpg.inventory=Array.from({length:BAG_SIZE},()=>({id:'regenjacke',count:1}));
 g.events.length=0;
 g.kill(g.enemies[0]);
 assert.ok(g.rpg.recovery.length,'nichts geht verloren – Ausrüstung zurückholen');
 assert.ok(toasts(g).some(t=>t.includes('Rucksack voll')));
 assert.equal(events(g,'loot').length,1,'das Ereignis kommt auch bei vollem Rucksack');
 assert.equal(g.rpg.loot.length,0);
});

test('Ohne Auto-Loot bleibt der Beutel liegen; das loot-Ereignis kommt auch von Hand',()=>{
 const g=new Game(arena());g.lootRandom=()=>0;g.settings.autoLoot=false;
 const bag=createDrop(g,{id:9,type:'boss',name:'Horst',x:20,y:0});
 assert.equal(g.rpg.loot.length,1,'ohne Auto-Loot gibt es ein Beutefenster');
 assert.equal(g.openLoot(bag.id),bag,'die UI bekommt den Beutel');
 g.events.length=0;
 assert.ok(takeLoot(g,bag.id));
 const loot=events(g,'loot');
 assert.equal(loot.length,1);
 assert.equal(loot[0].source.name,'Horst');
 assert.equal(loot[0].source.kind,'boss');
 // Mit Auto-Loot räumt openLoot() den Beutel selbst ab (Kiste öffnen).
 g.settings.autoLoot=true;g.rpg.inventory=[];
 const chest=createDrop(g,{id:10,type:'wolf',name:'Clankiste',x:20,y:0});
 assert.equal(g.rpg.loot.length,0,'schon beim Anlegen eingesammelt');
 assert.equal(g.openLoot(chest.id),null);
 assert.ok(g.setSetting('autoLoot',false));
 assert.equal(new Game(arena(),g.save()).settings.autoLoot,false,'die Einstellung überlebt das Laden');
});

// ---------- 3. Beschreibungs-API ----------

test('game.describe liefert Info und Laufzeitwerte für jede Art',()=>{
 const g=new Game(arena());g.gainXp(40000);
 const strike=g.describe('skill','strike');
 assert.ok(strike.name&&strike.icon);
 assert.ok(strike.info.effect.length,'Text aus content/');
 assert.ok(Array.isArray(strike.info.numbers)&&Array.isArray(strike.info.links)&&Array.isArray(strike.info.terms));
 assert.ok(strike.live.damage.min>0&&strike.live.damage.max>=strike.live.damage.min,'tatsächlicher Schaden min–max');
 assert.ok(strike.live.damage.critMax>strike.live.damage.max);
 const s=g.skills.find(s=>s.id==='strike');
 assert.ok(strike.live.cooldown<s.cd,'tatsächliche Abklingzeit mit Tempo');
 assert.equal(strike.live.available,true);
 assert.equal(strike.live.cost,s.cost);
 // Ausrüstung wirkt: eine stärkere Waffe hebt den Schaden.
 const before=g.describe('skill','strike').live.damage.max;
 g.rpg.equipment.weapon='tresenhammer';
 assert.notEqual(g.describe('skill','strike').live.damage.max,before);

 const heal=g.describe('skill','heal');
 assert.ok(heal.live.heal>0);

 const item=g.describe('item','brezel');
 assert.equal(item.live.count,3);
 assert.equal(item.live.usable,true);
 assert.equal(item.live.heal,ITEMS.brezel.heal);
 g.buildings={grill:1};
 assert.ok(g.describe('item','brezel').live.heal>ITEMS.brezel.heal,'Basisbau wirkt auf die Verpflegung');

 g.quest.chapterClaimed=4;
 const building=g.describe('building','grill');
 assert.equal(building.live.stage,1);
 assert.ok(building.live.next.cost&&typeof building.live.next.affordable==='boolean');
 assert.ok(Object.keys(building.live.effect).length);

 const talent=g.describe('talent','dieter-wall-0');
 assert.ok(talent&&talent.name&&talent.info.effect.length);
 assert.equal(typeof talent.live.learned,'boolean');

 const passive=g.describe('passive','dieter');
 assert.ok(passive.info.effect.length);
 assert.ok(Object.keys(passive.live.values).length);

 const procId=Object.keys(PROC_RULES)[0];
 const proc=g.describe('proc',procId);
 assert.equal(proc.live.trigger,PROC_RULES[procId].trigger);
 assert.ok(proc.info.effect.length);

 const cast=g.describe('cast','pounce');
 assert.ok(cast.live.total>0&&cast.live.expected>0);

 assert.equal(g.describe('skill','gibtsnicht'),null);
 assert.equal(g.describe('quatsch','strike'),null);
});

test('game.activeBuffs zeigt laufende Stärkungen mit Restzeit und Zugriff auf describe',()=>{
 const g=new Game(arena());g.gainXp(40000);
 assert.deepEqual(g.activeBuffs(),[]);
 assert.equal(g.action('buff'),true);
 const running=g.activeBuffs();
 const buff=running.find(b=>b.id==='buff');
 assert.ok(buff&&buff.remaining>0);
 assert.deepEqual(buff.describe,{kind:'buff',id:'buff'});
 const described=g.describe(buff.describe.kind,buff.describe.id);
 assert.equal(described.live.active,true);
 assert.ok(described.live.remaining>0);
 // Schwung nach einem Kill
 g.kill(g.enemies[0]);
 const schwung=g.activeBuffs().find(b=>b.id==='momentum');
 assert.ok(schwung&&schwung.stacks===1&&schwung.remaining>0);
 assert.equal(g.describe('buff','momentum').live.stacks,1);
 // Fenster laufen ab
 g.time+=60;g.buffs.remaining=0;g.momentum.until=0;g.classState.guard=0;g.classState.hot=0;
 assert.equal(g.activeBuffs().filter(b=>b.kind==='buff').length,0);
});

test('FPS-Anzeige ist standardmäßig aus, per setSetting schaltbar und überlebt das Laden',()=>{
 const g=new Game(arena());assert.equal(g.settings.fps,false,'Standard aus');
 assert.equal(g.setSetting('fps',true),true);assert.equal(new Game(arena(),g.save()).settings.fps,true);
});

test('Weltdichte folgt dem Bildschirm (mindestens 2, höchstens Grafikdichte 4); „Volle Grafikauflösung“ erzwingt 4 und wird gespeichert',async()=>{
 const {worldDensity,WORLD_ART_DENSITY}=await import('../art-quality.js');
 assert.equal(worldDensity(2,false,1),2,'Standardmonitor, Zoom 2');assert.equal(worldDensity(1.6,false,1),2);assert.equal(worldDensity(2,false,1.5),3);assert.equal(worldDensity(1.75,false,3),WORLD_ART_DENSITY,'gedeckelt');assert.equal(worldDensity(2,true,1),WORLD_ART_DENSITY);
 const g=new Game(arena());assert.equal(g.settings.fullRes,false);g.setSetting('fullRes',true);assert.equal(new Game(arena(),g.save()).settings.fullRes,true);
});
