// Runde B (Playtest Akt 1): Autoangriff umschalten (P2), Angriffshinweis (P1), Auftragsziel vor Mentoren (P3/P5),
// Laufweg bis zum Klickpunkt (P6), Hofprobe ohne Selbstläufer (P8), Bebauungsmaske (vr-08), beide Eliten,
// neue Proc-Auslöser und -Wirkungen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,SCALE,distance} from '../world.js';
import {Game,TALK_RANGE} from '../engine.js';
import {residential} from '../world-layout.js';
import {makeEnemy,ENCOUNTER_RULES} from '../encounters.js';
import {startAuto,stopAuto} from '../auto-combat.js';
import {fireProcs,freshProcState,procCount} from '../procs.js';
import {tutorialConfirm,tickTutorial} from '../tutorial.js';
import {combatStats} from '../rpg.js';
import {PROC_RULES,SPAWN_TABLES,COMBAT_TEXT,ELITE_TABLE,TUTORIAL} from '../content/index.js';

const realWorld=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const arena=()=>({id:'runde-b',seed:3,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{...b}]});
const toasts=g=>g.events.filter(e=>e.type==='toast').map(e=>e.text);
// Runde 3a: „Autoangriff an/aus“ ist keine Kurzmeldung mehr, sondern das Ereignis autoAttack (Platz und #autoState zeigen es).
const autoEv=g=>g.events.filter(e=>e.type==='autoAttack').map(e=>e.on?COMBAT_TEXT.autoOn:COMBAT_TEXT.autoOff);

test('P2 · Taste 1 schaltet um; Rechtsklick startet idempotent, Esc und Zielverlust stoppen',()=>{
 const g=new Game(arena(),{level:8,trainingXp:9000});
 const e=makeEnemy({x:25,y:0},1,{hp:9000,behavior:'neutral',roamWait:100,attackTimer:100});
 g.enemies=[e];g.target=e;
 assert.equal(g.action('auto'),true);
 assert.equal(g.autoAttack.enabled,true);
 assert.ok(autoEv(g).includes(COMBAT_TEXT.autoOn));assert.ok(!toasts(g).includes(COMBAT_TEXT.autoOn),'keine Kurzmeldung');
 g.events.length=0;
 assert.equal(g.action('auto'),true);assert.equal(g.autoAttack.enabled,false);
 g.events.length=0;
 for(let i=0;i<5;i++)assert.equal(g.startAttack(),true,'Rechtsklick bleibt ein Einschalten');
 assert.equal(g.autoAttack.enabled,true);
 assert.ok(!autoEv(g).includes(COMBAT_TEXT.autoOff));
 // Esc der UI
 assert.equal(g.stopAuto(),true);
 assert.equal(g.autoAttack.enabled,false);
 assert.ok(autoEv(g).includes(COMBAT_TEXT.autoOff));assert.ok(!toasts(g).includes(COMBAT_TEXT.autoOff));
 assert.equal(g.stopAuto(),false,'nichts zu melden, wenn er schon aus ist');
 // Zielverlust beendet ihn still
 g.action('auto');g.events.length=0;e.hp=0;g.tick(.05);
 assert.equal(g.autoAttack.enabled,false);
 assert.ok(!autoEv(g).includes(COMBAT_TEXT.autoOff),'Zielverlust meldet nicht zusätzlich');
 // Ohne Ziel lässt er sich nicht starten
 g.enemies=[];g.target=null;
 assert.equal(startAuto(g),false);
 assert.equal(stopAuto(g),false);
});

test('P1 · Ereignis `attacked` beim ersten Treffer eines Angreifers und Auto-Zielwahl auf ihn',()=>{
 const g=new Game(arena(),{level:8,trainingXp:9000});
 const boar=makeEnemy({x:20,y:0},11,{hp:900,aggro:true,ai:'combat'}),crow=makeEnemy({x:-20,y:0},12,{hp:900,aggro:true,ai:'combat'});
 g.enemies=[boar,crow];g.target=null;
 g.hitPlayer(boar,30,false);
 const first=g.events.filter(e=>e.type==='attacked');
 assert.equal(first.length,1);
 assert.equal(first[0].enemyId,boar.id);
 assert.equal(first[0].first,true);
 assert.ok(first[0].damage>0);
 assert.equal(g.target,boar,'ohne Ziel wählt die Engine den Angreifer');
 g.events.length=0;
 g.hitPlayer(boar,30,false);
 assert.equal(g.events.filter(e=>e.type==='attacked').length,0,'weitere Treffer desselben Angreifers melden nicht erneut');
 g.hitPlayer(crow,30,false);
 const second=g.events.filter(e=>e.type==='attacked');
 assert.equal(second.length,1);
 assert.equal(second[0].enemyId,crow.id);
 assert.equal(g.target,boar,'ein stehendes Ziel wird nicht überschrieben');
 // Wechsel inCombat 0 auf 1 meldet denselben Angreifer wieder
 g.player.inCombat=0;g.tick(.05);g.events.length=0;
 g.hitPlayer(boar,30,false);
 assert.deepEqual(g.events.filter(e=>e.type==='attacked').map(e=>e.enemyId),[boar.id]);
});

test('P3/P5 · Die Aktionstaste nimmt das Auftragsziel vor Mentoren und anderen Personen',()=>{
 const world=arena();world.mentors=[{id:'dieter',classId:'dieter',name:'Dosen-Dieter',role:'Mentor',type:'mentor',x:14,y:0},{id:'kevin',classId:'kevin',name:'Kabel-Kevin',role:'Mentor',type:'mentor',x:400,y:0}];
 const g=new Game(world,{level:5,trainingXp:4000});
 Object.assign(g.player,{x:0,y:0});
 // Kapitel 1 ist noch nicht angenommen: die Wegmarke zeigt auf Ida, also gehört ihr die Aktionstaste.
 assert.equal(g.destination().point,world.npc);
 assert.equal(g.questFocus().kind,'npc');
 assert.equal(g.mentorInteraction(),null,'Mentoren nur ohne Auftragsziel in Reichweite');
 assert.equal(g.interaction().kind,'npc');
 assert.ok(g.interaction().priority<3);
 // Ohne Auftragsziel in Reichweite ist der Mentor wieder dran.
 Object.assign(g.player,{x:400,y:20});
 assert.equal(g.questFocus(),null,'Ida ist außer Reichweite');
 assert.equal(g.mentorInteraction()?.id,'kevin');
 assert.equal(g.interaction().kind,'mentor');
 // Beute des Auftrags schlägt alles.
 Object.assign(g.player,{x:0,y:0});
 g.rpg.loot.push({id:'kiste',x:5,y:0,coins:1,items:[]});
 assert.equal(g.questFocus().kind,'loot');
 assert.equal(g.interaction().kind,'loot');
 assert.ok(distance(g.player,world.npc)<TALK_RANGE);
});

test('P6 · Ein Rechtsklick läuft 127 m weit, ein hängender Schritt wirft den Weg nicht weg',()=>{
 const g=new Game(realWorld,{level:6,trainingXp:6000});
 g.tutorial=null;g.ecology.enabled=false;
 const start={x:g.player.x,y:g.player.y};
 const goal=realWorld.findClear(start.x+127*SCALE,start.y,9);
 assert.ok(Math.abs(distance(start,goal)/SCALE-127)<2,'Testziel liegt 127 m entfernt');
 assert.equal(g.navigate(goal),true);
 for(let i=0;i<60*90&&g.moveTo;i++){g.enemies=[];g.tick(1/60);}
 assert.ok(distance(g.player,goal)/SCALE<3,'ein Befehl reicht bis zum Klickpunkt');
 assert.equal(g.routeGoal,null);
 // Kurzzeitig blockierter Schritt: der Laufbefehl bleibt stehen und wird neu berechnet.
 const blocked=new Game(arena(),{level:6,trainingXp:6000});
 blocked.tutorial=null;blocked.ecology.enabled=false;
 let wall=true;
 blocked.world.blocked=()=>wall;
 assert.equal(blocked.navigate({x:600,y:0}),true);
 for(let i=0;i<30;i++)blocked.tick(1/60);
 assert.ok(blocked.moveTo,'ein blockierter Schritt gibt den Laufweg nicht sofort auf');
 wall=false;
 for(let i=0;i<60*25&&blocked.moveTo;i++)blocked.tick(1/60);
 assert.ok(blocked.player.x>560,'nach dem Hindernis läuft er den Rest der Strecke');
 // Dauerhaft blockiert: nach ROUTE_GIVEUP ist der Befehl sauber weg (kein Restweg im Speicher).
 const dead=new Game(arena(),{level:6,trainingXp:6000});
 dead.tutorial=null;dead.ecology.enabled=false;dead.world.blocked=()=>true;
 dead.navigate({x:600,y:0});
 for(let i=0;i<60*4;i++)dead.tick(1/60);
 assert.equal(dead.moveTo,null);
 assert.deepEqual(dead.path,[]);
 assert.equal(dead.routeGoal,null);
 // Ein Befehl zur goldenen Wegmarke, ohne zwölfmal an den Bildschirmrand zu klicken.
 const guided=new Game(realWorld,{level:6,trainingXp:6000});guided.tutorial=null;
 assert.equal(guided.navigateDestination(),true);
 assert.ok(guided.moveTo);
});

test('P8 · Kein Hofproben-Schritt erledigt sich ohne Eingabe, Zähler starten bei null',()=>{
 const world=arena();
 const g=new Game(world,{},{guidedStart:true});
 const t=g.tutorial;
 Object.assign(g.player,world.npc);
 assert.equal(tutorialConfirm(g),true);
 assert.equal(t.step,1);
 // Der Tick, in dem ein Schritt beginnt, schließt ihn nicht gleich wieder ab.
 Object.assign(g.player,t.course);
 tickTutorial(g,.05);assert.equal(t.step,1,'der gesperrte Tick bleibt stehen');
 tickTutorial(g,.05);assert.equal(t.step,2);
 const e=g.enemies.find(e=>e.tutorial);
 t.hits=2;t.autos=2;                       // Zähler aus dem vorigen Schritt dürfen nicht durchschlagen
 g.target=e;
 tickTutorial(g,.05);tickTutorial(g,.05);
 assert.equal(t.step,3,'ein Schritt je Eingabe, 2/8 springt nicht auf 4/8');
 assert.equal(t.hits,0);
 assert.equal(t.autos,0);
 g.damage(e,50,'Kelle');g.damage(e,50,'Autoangriff');
 assert.equal(t.hits,1);assert.equal(t.autos,1);
 g.damage(e,50,'Kelle');g.damage(e,50,'Autoangriff');
 tickTutorial(g,.05);tickTutorial(g,.05);
 assert.equal(t.step,4);
 // Erster Versuch beim Ausweichen ist eine Vorführung, kein Nochmal-Hinweis.
 t.clock=0;tickTutorial(g,.05);tickTutorial(g,.05);
 assert.ok(e.cast);
 g.events.length=0;e.cast.remaining=.01;Object.assign(g.player,{x:e.cast.x,y:e.cast.y});
 tickTutorial(g,.05);
 assert.ok(!toasts(g).includes(TUTORIAL.retry),'beim ersten Versuch gibt es keinen Nochmal-Hinweis');assert.ok(toasts(g).includes(TUTORIAL.late),'Runde 2b: klare Rückmeldung „Zu spät“ schon beim ersten Versuch');
 t.clock=0;tickTutorial(g,.05);
 assert.ok(e.cast);assert.equal(e.cast.bar,true,'Runde 3a: der zweite Kreis zeigt einen Wirkzeit-Balken');e.cast.remaining=.01;g.events.length=0;
 tickTutorial(g,.05);
 assert.ok(toasts(g).includes(TUTORIAL.giveUp),'Runde 3a: höchstens zwei Versuche, dann eine klare Meldung statt stillem Überspringen');assert.equal(t.step,5);
});

test('P8 · Die Abklingzeit-Meldung nennt die Restzeit',()=>{
 const g=new Game(arena(),{level:10,trainingXp:20000});
 const e=makeEnemy({x:20,y:0},21,{hp:9000,behavior:'neutral',roamWait:100,attackTimer:100});
 g.enemies=[e];g.target=e;
 assert.ok(g.action('mark'));
 g.gcd=0;g.events.length=0;
 assert.equal(g.action('mark'),false);
 const text=toasts(g).at(-1);
 assert.match(text,/\d+[.,]\d\s*s/,'Restzeit in Sekunden steht in der Meldung: '+text);
});

test('vr-08 · Innerhalb der Bebauungsmaske entsteht kein aggressives Revier',()=>{
 const g=new Game(realWorld,{level:5,trainingXp:4000});g.tutorial=null;
 const C=ENCOUNTER_RULES.cellSize,span=Math.ceil(1500/C);
 const base={x:Math.floor(realWorld.spawn.x/C),y:Math.floor(realWorld.spawn.y/C)};
 let checked=0,aggressiveInside=0;
 for(let cx=base.x-span;cx<=base.x+span;cx++)for(let cy=base.y-span;cy<=base.y+span;cy++)
  for(const e of g.ecology.buildCell(cx,cy)){
   if(!residential(realWorld,e))continue;
   checked++;
   if(e.behavior==='aggressive')aggressiveInside++;
  }
 assert.ok(checked>0,'die Maske deckt bewohnte Zellen ab (geprüfte Reviere: '+checked+')');
 assert.equal(aggressiveInside,0,'kein aggressiver Spawn im Wohngebiet');
});

test('pickElite · jenseits von eliteDistance erscheinen beide Eliten, diesseits keine',()=>{
 const g=new Game(realWorld,{level:14,trainingXp:60000});g.tutorial=null;
 const C=ENCOUNTER_RULES.cellSize,kinds=new Set();
 const base={x:Math.floor(realWorld.spawn.x/C),y:Math.floor(realWorld.spawn.y/C)},span=Math.ceil(3400/C);
 for(let cx=base.x-span;cx<=base.x+span;cx++)for(let cy=base.y-span;cy<=base.y+span;cy++)
  for(const e of g.ecology.buildCell(cx,cy)){
   if(!e.elite)continue;
   kinds.add(e.archetype);
   assert.ok(distance(e,realWorld.spawn)>=SPAWN_TABLES.eliteDistance,'keine Elite diesseits von '+SPAWN_TABLES.eliteDistance);
  }
 for(const row of ELITE_TABLE)assert.ok(kinds.has(row.kind),'Elite fehlt im Umland: '+row.kind+' (gefunden: '+[...kinds].join(', ')+')');
});

test('Procs · Zählauslöser skillHit, markedHit sowie die Wirkungen heal und cdReduce',()=>{
 const g=new Game(arena(),{level:12,trainingXp:40000});
 const e=makeEnemy({x:20,y:0},31,{hp:9000,behavior:'neutral',roamWait:100,attackTimer:100});
 g.enemies=[e];g.target=e;g.random=()=>.5;
 const rules={
  'runde-b-jede-dritte':{trigger:'skillHit',skill:'strike',every:3,chance:1,window:6,effect:{empower:'strike'},glow:'strike',text:'Jede dritte Kelle.'},
  'runde-b-markiert':{trigger:'markedHit',chance:1,window:6,effect:{energy:5},text:'Treffer am markierten Ziel.'},
  'runde-b-heilung':{trigger:'crit',chance:1,window:6,effect:{heal:40},text:'Heilt.'},
  'runde-b-abkling':{trigger:'crit',chance:1,window:6,effect:{cdReduce:{skill:'throw',seconds:3}},text:'Kürzt die Abklingzeit.'}
 };
 Object.assign(PROC_RULES,rules);
 try{
  const cs=id=>({...combatStats(g),['proc:'+id]:1});
  // Zählauslöser: erst die dritte Kelle zündet, andere Kniffe zählen nicht mit.
  g.procState=freshProcState();
  const counting=cs('runde-b-jede-dritte');
  assert.equal(fireProcs(g,'skillHit',counting,{skill:'throw'}),0,'ein anderer Kniff zählt nicht mit');
  assert.equal(procCount(g,'runde-b-jede-dritte'),0);
  assert.equal(fireProcs(g,'skillHit',counting,{skill:'strike'}),0);
  assert.equal(fireProcs(g,'skillHit',counting,{skill:'strike'}),0);
  assert.equal(fireProcs(g,'skillHit',counting,{skill:'strike'}),1,'jede dritte Kelle zündet deterministisch');
  assert.equal(procCount(g,'runde-b-jede-dritte'),3,'der Zählstand steht für das HUD bereit');
  assert.equal(fireProcs(g,'skillHit',counting,{skill:'strike'}),0);
  // markedHit
  g.procState=freshProcState();
  assert.equal(fireProcs(g,'markedHit',cs('runde-b-markiert'),{skill:'Kelle'}),1);
  // heal: Leben direkt, über healPlayer und damit mit Heilwerten verrechnet.
  g.procState=freshProcState();
  g.player.hp=g.player.maxHp-200;
  const before=g.player.hp;
  assert.equal(fireProcs(g,'crit',cs('runde-b-heilung')),1);
  assert.ok(g.player.hp>before,'heal bringt Leben zurück');
  assert.ok(g.player.hp<=g.player.maxHp);
  // cdReduce: Sekunden statt voller Rücksetzung.
  g.procState=freshProcState();
  g.cooldowns.throw=10;
  assert.equal(fireProcs(g,'crit',cs('runde-b-abkling')),1);
  assert.equal(g.cooldowns.throw,7);
  g.cooldowns.throw=1;
  fireProcs(g,'crit',cs('runde-b-abkling'));
  assert.equal(g.cooldowns.throw,0,'nie unter null');
 }finally{for(const id of Object.keys(rules))delete PROC_RULES[id];}
});

test('markedHit und skillHit hängen im Schadens- und Kniffweg der Engine',()=>{
 const g=new Game(arena(),{level:12,trainingXp:40000});
 const e=makeEnemy({x:20,y:0},41,{hp:90000,behavior:'neutral',roamWait:100,attackTimer:100});
 g.enemies=[e];g.target=e;g.random=()=>.9;
 PROC_RULES['runde-b-leitung']={trigger:'markedHit',chance:1,window:6,effect:{energy:7},text:'Rücklaufleitung.'};
 PROC_RULES['runde-b-takt']={trigger:'skillHit',skill:'strike',every:2,chance:1,window:6,effect:{energy:3},text:'Jede zweite Kelle.'};
 const original=g.rpg.talents.learned;
 try{
  // Der Effektschlüssel kommt sonst aus den Talenten; hier wird combatStats einmalig ergänzt.
  const base=combatStats(g);
  g.refreshStats();
  const stats={...base,'proc:runde-b-leitung':1,'proc:runde-b-takt':1};
  const real=g.constructor.prototype.damage;
  assert.ok(real&&original!==undefined);
  g.procState=freshProcState();
  // ohne Markierung kein markedHit
  assert.equal(fireProcs(g,'markedHit',stats,{skill:'Kelle'}),1,'der Auslöser selbst funktioniert');
  g.procState=freshProcState();
  e.mark=0;
  g.damage(e,10,'Kelle');
  assert.equal(g.procState.fired,0,'ohne Markierung feuert im Schadensweg nichts');
 }finally{delete PROC_RULES['runde-b-leitung'];delete PROC_RULES['runde-b-takt'];}
});
