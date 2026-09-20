// Ausrüstung: Fundstücke für leere Plätze werden angelegt (mit Log-Hinweis); Einschätzung Verbesserung/Verschlechterung.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {addItem,equipItem,upgradeVerdict,autoLootBag,takeLoot} from '../rpg.js';
import {itemTooltip,inventoryPanel} from '../rpg-ui.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
const hero=()=>{const g=new Game(arena(),{level:11});for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;g.rpg.inventory=[];return g;};

test('Einschätzung: leerer Platz, Verbesserung, Verschlechterung, angelegt = keine, Verbrauchsgut = keine',()=>{
 const g=hero();addItem(g.rpg,'kutte');addItem(g.rpg,'regenjacke');addItem(g.rpg,'brezel');
 assert.equal(upgradeVerdict(g,'kutte').verdict,'empty');assert.equal(upgradeVerdict(g,'brezel'),null);
 assert.ok(equipItem(g,'kutte'));assert.equal(upgradeVerdict(g,'kutte'),null,'angelegt');
 const up=upgradeVerdict(g,'regenjacke');assert.equal(up.verdict,'upgrade');assert.ok(up.score>0);
 assert.ok(equipItem(g,'regenjacke'));assert.equal(upgradeVerdict(g,'kutte').verdict,'downgrade');
 assert.match(itemTooltip(g,'kutte'),/Verschlechterung/);assert.match(inventoryPanel(g,null),/item-verdict verdict-loss/);
 const low=new Game(arena(),{level:1});addItem(low.rpg,'regenjacke');const v=upgradeVerdict(low,'regenjacke');if((v&&v.reason)==='level')assert.equal(v.verdict,'blocked');
});

test('Fundstück für einen leeren Platz wird angelegt und gemeldet; belegter Platz bleibt unangetastet',()=>{
 const g=hero();const bag={id:1,x:0,y:0,coins:0,items:[{id:'kutte',count:1},{id:'brezel',count:1}],source:{name:'Pfanddachs'}};g.rpg.loot=[bag];
 autoLootBag(g,bag);assert.equal(g.rpg.equipment.body,'kutte');assert.ok(!g.rpg.inventory.some(e=>e.id==='kutte'));assert.ok(g.messages.some(m=>/Angelegt: .*Platz war frei/.test(m.text)));
 const second={id:2,x:0,y:0,coins:0,items:[{id:'regenjacke',count:1}],source:{name:'Pfanddachs'}};g.rpg.loot=[second];
 assert.ok(takeLoot(g,2));assert.equal(g.rpg.equipment.body,'kutte','Verbesserung wird nie ungefragt getauscht');assert.ok(g.rpg.inventory.some(e=>e.id==='regenjacke'));
});
