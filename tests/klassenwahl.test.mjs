// E-72 · Klassenwahl mit fünf Klassen: Helden-Slots, Klassenkarten-Inhalt, Klassen-Symbole und die Hofprobe je Klasse.
import test from 'node:test';
import assert from 'node:assert/strict';
import {CLASSES,CLASS_LOOKS,LOOKS,defaultLook,createCharacter,normalizeRoster,adoptLegacy,activeCharacter} from '../characters.js';
import {CLASS_CHOICE,CLASS_IDS,RESOURCES,TUTORIAL,LOADING_UI,LORE,START_UI} from '../content/index.js';
import {classEmblem} from '../class-emblem.js';
import {Game} from '../engine.js';
import {tutorialConfirm,tutorialSignal,tickTutorial,tutorialStepFor,lessonHints,tutorialActive} from '../tutorial.js';
import {takeLoot} from '../rpg.js';
import {available} from '../progression.js';

test('Helden-Slots kennen alle fünf Klassen; Schorsch und Käthe bekommen einen gezeichneten Körper als Vorschlag',()=>{
 assert.deepEqual([...CLASSES].sort(),[...CLASS_IDS].sort(),'Erstellung = spielbare Klassen der Engine');
 for(const id of CLASSES){assert.ok(LOOKS.some(l=>l.id===defaultLook(id)),id+' hat einen gültigen Körper');const r=createCharacter(null,{name:'Held '+id.slice(0,4),classId:id});assert.equal(r.character.classId,id);assert.ok(LOOKS.some(l=>l.id===r.character.look));}
 assert.equal(defaultLook('schorsch'),'dieter');assert.equal(defaultLook('kaethe'),'baerbel');assert.equal(CLASS_LOOKS.kaethe.tint.hair,'grau');
 const kept=normalizeRoster({list:[{id:'h1',name:'Grillmeister',classId:'schorsch'},{id:'h2',name:'Zockerin',classId:'kaethe',look:'kevin'}]});
 assert.equal(kept.list.length,2);assert.equal(kept.list[0].look,'dieter','ohne Körper: Vorschlag der Klasse');assert.equal(kept.list[1].look,'kevin','Aussehen bleibt frei');
 assert.equal(activeCharacter(adoptLegacy(normalizeRoster(null),{level:3,classId:'kaethe'},'')).name,'Käthe');
});

test('Klassenkarte: Name, Rolle, Klamotte und Ressource mit Kurzfassung je Klasse, Symbol je Ressource',()=>{
 const titles=new Set(),kinds=new Set();
 for(const id of CLASSES){const c=CLASS_CHOICE.classes[id];assert.ok(c,id);
  for(const k of ['title','role','clothes','resource','from','spend'])assert.ok(c[k]&&c[k].length>=4,id+'.'+k);
  assert.ok(c.from.length<=48&&c.spend.length<=52,id+': Kurzfassung bleibt kurz');titles.add(c.title);kinds.add(RESOURCES[id].kind);
  const svg=classEmblem(id);assert.match(svg,/^<svg class="class-emblem"/);assert.ok(svg.includes(RESOURCES[id].color),id+': Rand in Klassenfarbe');}
 assert.equal(titles.size,5);assert.equal(kinds.size,5,'fünf verschiedene Ressourcenmodelle');
 assert.ok(!/allen dreien/.test(START_UI.rosterText(3)));
});

test('Geschichte zählt fünf Klassen: Kleiderhaufen, Ladeschirm-Tipps, Clan',()=>{
 for(const id of CLASSES){assert.match(TUTORIAL.clothes[id],/Kleiderhaufen/);assert.ok(TUTORIAL.hints[id]?.attack?.length,id+': Hinweis im ersten Kampf');}
 assert.match(TUTORIAL.clothes.schorsch,/Grillschürze/);assert.match(TUTORIAL.clothes.kaethe,/Strickjacke/);
 for(const name of ['Dosen-Dieter','Aperol-Anni','Klo-Kevin','Schwenker-Schorsch','Kreuz-Käthe'])assert.ok(LOADING_UI.tips.some(t=>t.includes(name)),name+' im Ladeschirm');
 assert.match(LORE.clan,/Schorsch/);assert.match(LORE.clan,/Käthe/);
});

const world=()=>({id:'hof',spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}],findClear:(x,y)=>({x,y})});
/** Hofprobe mit echten Kniffen der Klasse: erster Kniff + Autoangriff, Ausweichen, Kiste, Rucksack, zurück zu Ida. */
function playHofprobe(classId){
 const g=new Game(world(),{classId},{guidedStart:true}),tick=(n=1)=>{for(let i=0;i<n;i++)g.tick(.05);};
 Object.assign(g.player,g.world.npc);assert.equal(tutorialConfirm(g),true);
 Object.assign(g.player,g.tutorial.course);tick(3);assert.equal(g.tutorial.step,2,classId+': Laufmarke');
 const e=g.enemies.find(x=>x.tutorial);g.target=e;tick(3);assert.equal(g.tutorial.step,3,classId+': Ziel');
 Object.assign(g.player,{x:e.x-24,y:e.y});
 for(let t=0;t<30&&g.tutorial.step===3;t+=.05){g.target=e;if(g.gcd<=0)g.action('strike');g.tick(.05);}
 assert.equal(g.tutorial.step,4,classId+': zwei Treffer mit dem ersten Kniff und zwei Autoangriffe');
 for(let t=0;t<30&&g.tutorial.step===4;t+=.05){const c=e.cast;if(c&&c.remaining<.3&&!g.tutorial.dash)g.action('dash');g.tick(.05);}
 assert.equal(g.tutorial.step,5,classId+': Ausweichen');
 Object.assign(g.player,g.tutorial.dummy);assert.ok(takeLoot(g,TUTORIAL.loot.id));tick(3);assert.equal(g.tutorial.step,6);
 tutorialSignal(g,'inventory');assert.equal(g.tutorial.step,7);Object.assign(g.player,g.world.npc);assert.ok(tutorialConfirm(g));
 assert.equal(tutorialActive(g),false,classId+': Hofprobe bestanden');return g;
}
for(const id of CLASSES)test('Hofprobe mit '+id+' bis zum Ende spielbar',()=>{playHofprobe(id);});

test('Hofprobe-Schritt je Klasse: Titel nach dem ersten Kniff, Ressourcenzeile, Idas Satz; Lernzeile beim Aufstieg',()=>{
 const g=new Game(world(),{classId:'kaethe'},{guidedStart:true});
 assert.match(tutorialStepFor(g,0).clothes,/Strickjacke/);assert.equal(tutorialStepFor(g,3).title,'Karten auf den Tisch');assert.match(tutorialStepFor(g,3).hint,/Kartenfarbe/);
 assert.equal(tutorialStepFor(g,1).hint,'');assert.equal(tutorialStepFor(g,1).title,TUTORIAL.steps[1].title,'ohne Abweichung bleibt der Grundtext');
 const kevin=new Game(world(),{classId:'kevin'},{guidedStart:true});assert.equal(!!tutorialStepFor(kevin,4).hint,available(kevin,'reload'),'Pfandautomat-Zeile nur, wenn der Kniff gelernt ist');
 const s=new Game(world(),{classId:'schorsch'});assert.deepEqual(lessonHints(s,['mark','burst']),[TUTORIAL.lessons.schorsch.mark]);assert.deepEqual(lessonHints(s,['dash']),[]);
});
