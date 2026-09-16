import {writeFileSync,mkdirSync} from 'node:fs';
import {Game} from '../engine.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
const world={id:'v2-56753-72-1',seed:56753,spawn:{x:0,y:0},npc:{x:0,y:0},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]};
const g=new Game(world,{level:11});
for(const [i,slot] of ['head','neck','shoulders','wrists','hands','waist','legs','feet'].entries()){const id=registerRoll(g.rpg,ITEMS,{slot,spec:'tresen',level:3,quality:'rare',roll:201+i*20});addItem(g.rpg,id);equipItem(g,id);}
for(const [id,slot] of [['pfandring','ring1'],['pfandring','ring2'],['keilerzahn','trinket1'],['gansorden','trinket2']]){addItem(g.rpg,id);equipItem(g,id,slot);}
for(const id of ['tresenhammer','dosenklinge','regenjacke','bierdeckelweste','megafon','ruhepfeife','giesskanne'])addItem(g.rpg,id);
const save=g.save();delete save.position;mkdirSync('visual-review',{recursive:true});writeFileSync('visual-review/live-fixture.json',JSON.stringify(save));
