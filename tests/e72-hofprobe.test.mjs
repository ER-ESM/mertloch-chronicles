// E-72 Runde 3 · Hofprobe-Befunde aus dem Kenner-Playtest vom 25.09. (Befund 10): Ida aus der Ferne ansprechen, Ida-Name aus der
// Ferne, Erinnerung als Randkarte statt Fenster, Tastenspalte der Hilfe misst sich selbst. Browserprüfung: scripts/e72-hofprobe-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {tutorialIdaReach,tutorialConfirm} from '../tutorial.js';
import {walkToTalk,arrivedToTalk,TALK_REACH,sameRoom} from '../talk-target.js';
import {idaShowsName} from '../quest-mobs.js';
import {cardPlace,memoryCardHtml,CARD_WIDTH} from '../memory-card.js';
import {TUTORIAL,MEMORY_FRAGMENTS,MEMORY_CARD} from '../content/index.js';

const arena=(extra={})=>({id:'e72-hofprobe',seed:3,spawn:{x:0,y:0},npc:{x:150,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{x:(a.x+b.x)/2,y:(a.y+b.y)/2},{...b}],...extra});
const hofprobe=step=>new Game(arena(),{level:1,tutorial:{version:1,step,completed:false}});

test('Hofprobe: Ida wartet am Anfang und bei der Rückkehr – in Gesprächsweite „talk“, weiter weg „walk“, dazwischen nichts',()=>{
 const g=hofprobe(0);Object.assign(g.player,{x:0,y:0});
 assert.equal(tutorialIdaReach(g),'walk','150 E vor Ida: F läuft hin');
 g.player.x=150-TUTORIAL.talkRange+1;assert.equal(tutorialIdaReach(g),'talk','in Gesprächsweite: F spricht sofort');
 for(const step of [1,2,3,4,5,6]){g.tutorial.step=step;assert.equal(tutorialIdaReach(g),null,'Schritt '+(step+1)+': kein Ida-Hinweis');}
 g.tutorial.step=7;g.player.x=0;assert.equal(tutorialIdaReach(g),'walk');
 g.tutorial.completed=true;assert.equal(tutorialIdaReach(g),null,'nach der Hofprobe gilt wieder die normale Rangfolge');
});

test('Hofprobe: F aus der Ferne läuft zu Ida, hält in Gesprächsweite an und die Rückkehr lässt sich abschließen',()=>{
 assert.ok(TALK_REACH.npc<TUTORIAL.talkRange,'Ankunft (talk-target) liegt innerhalb der Gesprächsweite der Hofprobe');
 const g=hofprobe(7);Object.assign(g.player,{x:0,y:0});
 assert.equal(walkToTalk(g,{kind:'npc',ref:g.world.npc}),'walk');
 let arrived=null;for(let i=0;i<600&&!arrived;i++){g.tick(1/60);arrived=arrivedToTalk(g);}
 assert.equal(arrived?.kind,'npc','kommt an');assert.equal(g.moveTo,null,'bleibt vor Ida stehen, läuft nicht in sie hinein');
 assert.ok(Math.hypot(g.player.x-150,g.player.y)>20);
 assert.equal(tutorialIdaReach(g),'talk');assert.equal(tutorialConfirm(g),true);assert.equal(g.tutorial.completed,true);
});

test('Drinnen wird drinnen geredet: vor der Tür der Bude hält der Held nicht an, sondern geht zu Ida hinein',()=>{
 const house={minX:0,maxX:200,minY:0,maxY:120},ida={x:100,y:100,name:'Kisten-Ida'},goal={x:100,y:100};
 const g={world:{base:{house}},player:{x:100,y:135},keys:new Set(),routeGoal:goal,moveTo:{x:100,y:110},path:[],talkTo:{kind:'npc',ref:ida,goal}};
 assert.equal(sameRoom(g,ida),false);assert.equal(arrivedToTalk(g),null,'35 E vor Ida, aber draußen: weiterlaufen');assert.ok(g.talkTo,'Gesprächsziel bleibt gemerkt');
 g.player.y=112;assert.equal(arrivedToTalk(g)?.ref,ida,'drinnen: anhalten und reden');assert.equal(g.moveTo,null);
 const tut=hofprobe(0);tut.world.base={house:{minX:100,maxX:220,minY:-50,maxY:20}};Object.assign(tut.player,{x:150,y:30});
 assert.ok(Math.hypot(tut.player.x-150,tut.player.y)<TUTORIAL.talkRange);assert.equal(tutorialIdaReach(tut),'walk','Hofprobe: in Reichweite, aber vor der Tür – F läuft erst hinein');
 tut.player.y=10;assert.equal(tutorialIdaReach(tut),'talk');
});

test('Ida-Name: mit „!“ oder „?“ aus der Ferne, sonst nur als nächster Sprecher in 70 E',()=>{
 const g=hofprobe(0);Object.assign(g.player,{x:-60,y:0});
 assert.ok(idaShowsName(g),'„!“ – Name aus 210 E');
 g.tutorial.step=3;assert.ok(!idaShowsName(g),'„…“ – kein Name aus der Ferne');
 g.player.x=100;assert.ok(idaShowsName(g),'nah dran – Name wie bisher');
 g.tutorial.step=7;g.player.x=-60;assert.ok(idaShowsName(g),'„?“ (Rückkehr) – Name aus der Ferne');
});

test('Erinnerungskarte: rechts bündig unter Minikarte und Verfolgung, über der Menüleiste, Bild vor Text',()=>{
 const column=[{left:1420,right:1580,top:20,bottom:190},{left:1290,right:1580,top:200,bottom:254}],floor=[{left:1240,right:1590,top:810,bottom:870},{left:0,right:1600,top:880,bottom:890}];
 const p=cardPlace({width:1600,height:900,column,floor});
 assert.deepEqual(p,{right:20,top:264,maxHeight:536});
 const q=cardPlace({width:1600,height:900,column:[null,{left:10,right:300,top:0,bottom:400}],floor:[{left:0,right:600,top:700,bottom:760}]});
 assert.equal(q.right,14,'linke HUD-Teile zählen nicht zur Spalte');assert.equal(q.top,90);assert.equal(q.maxHeight,800,'Leiste links unten begrenzt die Karte rechts nicht');
 const f=MEMORY_FRAGMENTS[0],html=memoryCardHtml(f);
 assert.match(html,/data-memory-next/);assert.ok(html.includes(f.title)&&html.includes(MEMORY_CARD.label));
 assert.ok(html.indexOf('<img')<html.indexOf('<p>'),'Bild vor dem Text');assert.ok(html.includes('data-memory-card-art'),'Klick aufs Bild vergrößert');
 assert.ok(!memoryCardHtml({id:'x',title:'<b>',text:'"a"'}).includes('<b>'),'Titel wird maskiert');
 assert.ok(CARD_WIDTH<=320,'schmal genug für 1280 × 720');
});

test('Hilfe: Tastenspalte misst sich selbst (keine festen 30/52 px mehr, die „J L“ und „P K“ ins Wort schoben)',()=>{
 const css=readFileSync(new URL('../fenster-r3.css',import.meta.url),'utf8');
 assert.ok(!/hk-col:nth-child\(\d\) \.hk-item\{grid-template-columns:\d+px/.test(css),'keine feste Tastenspalte je Spalte');
 assert.match(css,/\.hk-list \.hk-col\{display:grid;grid-template-columns:max-content/);
 assert.match(css,/grid-template-columns:subgrid/);
});
