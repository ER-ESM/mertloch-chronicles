import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {BossSpeech} from '../enemy-ui.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
const barks=g=>g.events.filter(e=>e.type==='bark');

test('Dorfbewohner reden höchstens alle 7 s, Gegner höchstens alle 4 s; Boss-Zeilen sind nie gedrosselt',()=>{
 const g=new Game(arena());g.events.length=0;
 assert.equal(g.bark({id:1,name:'A',x:0,y:0},'Moin','villager'),'Moin');
 assert.equal(g.bark({id:2,name:'B',x:0,y:0},'Tach','villager'),null,'zweiter Bewohner im selben Moment schweigt');
 g.time=8;assert.equal(g.bark({id:2,name:'B',x:0,y:0},'Tach','villager'),'Tach');
 g.time=8;assert.equal(g.bark({id:3,name:'Wart',x:0,y:0},'Halt!','enemy'),'Halt!');
 assert.equal(g.bark({id:4,name:'Wart 2',x:0,y:0},'Halt!','enemy'),null,'Gruppenmitglied im selben Moment schweigt');
 g.time=9;assert.equal(g.bark({id:5,name:'C',x:0,y:0},'Moin','villager'),null,'kein Bewohner, solange ein Gegner spricht');
 g.time=8;assert.equal(g.bark({id:9,name:'Boss',x:0,y:0},'Rrr','boss'),'Rrr');
 assert.equal(g.bark({id:9,name:'Boss',x:0,y:0},'Phase','phase'),'Phase');
 assert.equal(barks(g).length,5);
});

test('Sprechblasen-Layout zeigt höchstens zwei Blasen, Boss vor Gegner vor Bewohner',()=>{
 const speech=new BossSpeech(),game={time:0,enemies:[],life:{actors:[]}};
 speech.bark({enemyId:1,name:'V',text:'v',kind:'villager',x:0,y:0},game);
 speech.bark({enemyId:2,name:'E',text:'e',kind:'enemy',x:0,y:0},game);
 speech.bark({enemyId:3,name:'B',text:'b',kind:'boss',x:0,y:0},game);
 speech.bark({enemyId:4,name:'V2',text:'v2',kind:'villager',x:0,y:0},game);
 const shown=speech.activeBarks(game).map(b=>b.text);
 assert.deepEqual(shown,['b','e']);
});
