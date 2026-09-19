import test from 'node:test';
import assert from 'node:assert/strict';
import {unitAt,selectUnitAt,syncFriend,friendUnit,friendPanel,ringColor,remotePosition} from '../target-ui.js';
import {TARGET_RULES} from '../content/index.js';

const enemy=(x,y,o={})=>({x,y,hp:10,maxHp:10,name:'Wildsau',behavior:'aggressive',...o});
const game=(o={})=>({world:{npc:{x:0,y:0,name:'Horst'},mentors:[{x:200,y:0,name:'Dieter'}],quests:[{giver:{x:400,y:0,name:'Gisela'}}]},life:{actors:[{kind:'villager',variant:0,x:600,y:0}]},others:[],enemies:[],target:null,friend:null,events:[],emit(e){this.events.push(e);},stopAuto(){this.stopped=true;},...o});

test('Klick wählt NPC, Mentor, Questgeber, Dorfbewohner und Mitspieler als freundliches Ziel',()=>{
 const g=game({others:[{name:'Eddi',level:7,hp:80,x:800,y:0,fromX:800,fromY:0,at:0,lerp:1}]});
 for(const [x,kind,name] of [[0,'npc','Horst'],[200,'mentor','Dieter'],[400,'questgiver','Gisela'],[600,'resident','Opa Alwin'],[800,'player','Eddi']]){
  const u=selectUnitAt(g,x,-TARGET_RULES.hitLift);assert.equal(u.kind,kind);assert.equal(u.name,name);assert.equal(g.friend.kind,kind);assert.equal(g.target,null);}
 const p=friendPanel(g,friendUnit(g));assert.equal(p.disposition,'player');assert.equal(p.hp,80);assert.match(p.level,/ST\. 7/);
});
test('Gegner gewinnt bei Überlappung und löst das freundliche Ziel ab',()=>{
 const e=enemy(5,0),g=game({enemies:[e]});g.friend={kind:'npc',ref:g.world.npc};
 assert.equal(selectUnitAt(g,0,-10).kind,'enemy');assert.equal(g.target,e);assert.equal(g.friend,null);
 g.target=null;selectUnitAt(g,200,-10);assert.ok(g.friend&&g.stopped);g.target=e;syncFriend(g);assert.equal(g.friend,null);
});
test('Mitspieler-Ziel überlebt neue Schnappschüsse (Name statt Objekt) und fällt weg, wenn er geht',()=>{
 const g=game({others:[{name:'Eddi',x:800,y:0}]});selectUnitAt(g,800,-10);
 g.others=[{name:'Eddi',x:820,y:0}];syncFriend(g);assert.equal(friendUnit(g).x,820);
 g.others=[];syncFriend(g);assert.equal(g.friend,null);
});
test('Leerer Klick trifft nichts; Rahmenfarben unterscheiden Feind, neutral, NPC, Spieler',()=>{
 const g=game();assert.equal(unitAt(g,100,100),null);
 const R=TARGET_RULES.ring;
 assert.equal(ringColor(g,{kind:'enemy',ref:enemy(0,0)}),R.enemy);assert.equal(ringColor(g,{kind:'enemy',ref:enemy(0,0,{behavior:'neutral'})}),R.neutral);
 assert.equal(ringColor(g,{kind:'npc'}),R.friendly);assert.equal(ringColor(g,{kind:'player'}),R.player);
 assert.deepEqual(remotePosition({x:10,y:0,fromX:0,fromY:0,at:0,lerp:100},50),{x:5,y:0});
});
