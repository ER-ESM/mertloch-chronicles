// Aktionsleisten (2026-09-23): zwei Leisten ab Start, weitere per Einstellung, Tastenbelegung am Platz inkl. Maustasten.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {actionBar,bindSkill,barSlots,setBarCount,slotKey,keyFor,barItemEntry,addItem} from '../rpg.js';
import {defaultBinding,bindingAt,assignBinding,bindingFromKey,bindingFromMouse,bindingLabel,slotForBinding,isReserved,cleanBarKeys,MAX_BARS} from '../bar-keys.js';

const arena=()=>({id:'leisten',spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[{x:30,y:0,type:'wolf',count:1}],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b]});
const key=(code,mods={})=>({code,ctrlKey:!!mods.ctrl,altKey:!!mods.alt,shiftKey:!!mods.shift,metaKey:false});

test('neuer Held: zwei Leisten, Leiste 1 auf 1–0, Leiste 2 auf Umschalt+1–0',()=>{
 const g=new Game(arena());
 assert.equal(g.rpg.barCount,2);assert.equal(actionBar(g).length,20);assert.equal(barSlots(g).length,20);
 assert.equal(barSlots(g)[12].row,1);
 assert.equal(bindingAt(g.rpg,0),'Digit1');assert.equal(bindingAt(g.rpg,9),'Digit0');assert.equal(bindingAt(g.rpg,11),'Shift+Digit2');assert.equal(bindingAt(g.rpg,25),'');
 assert.equal(slotKey(g,0),'1');assert.equal(slotKey(g,11),'⇧2');assert.equal(slotKey(g,25),'');
});

test('alter Spielstand mit einer Leiste wird zu zwei Leisten, Belegung von Leiste 1 bleibt',()=>{
 const old=new Game(arena());const saved=old.save();
 const before=actionBar(old).slice(0,10);
 saved.rpg.actionBars={dieter:before};delete saved.rpg.barCount;delete saved.rpg.barKeys;
 const g=new Game(arena(),saved);
 assert.equal(g.rpg.barCount,2);assert.deepEqual(actionBar(g).slice(0,10),before);assert.deepEqual(actionBar(g).slice(10),Array(10).fill(null));
 assert.deepEqual(g.rpg.barKeys,{});
});

test('zweite Leiste belegen, tauschen über Leisten hinweg, Speichern und Laden',()=>{
 const g=new Game(arena());
 assert.ok(bindSkill(g,'strike',13));assert.equal(actionBar(g)[13],'strike');assert.equal(actionBar(g)[1],null,'der Kniff wandert, er verdoppelt sich nicht');
 assert.equal(keyFor(g,'strike'),'⇧4');
 addItem(g.rpg,'currywurst',1);assert.ok(bindSkill(g,barItemEntry('currywurst'),0));assert.ok(bindSkill(g,barItemEntry('currywurst'),13),'Gegenstand auf den Platz eines Kniffs: die beiden tauschen');
 assert.equal(actionBar(g)[0],'strike');assert.equal(actionBar(g)[13],barItemEntry('currywurst'));
 assert.equal(bindSkill(g,'auto',20),false,'Leiste 3 gibt es noch nicht');
 const loaded=new Game(arena(),g.save());assert.equal(actionBar(loaded)[13],barItemEntry('currywurst'));assert.equal(loaded.rpg.barCount,2);
});

test('Leisten hinzufügen und entfernen: höchstens vier, mindestens eine, entfernte Plätze werden geräumt',()=>{
 const g=new Game(arena());
 assert.ok(setBarCount(g,4));assert.equal(actionBar(g).length,40);assert.equal(setBarCount(g,MAX_BARS+1),false);assert.equal(setBarCount(g,0),false);
 assert.ok(bindSkill(g,'strike',35));assert.ok(setBarCount(g,3));assert.equal(actionBar(g).length,30);assert.equal(actionBar(g).includes('strike'),false);
 assert.equal(new Game(arena(),g.save()).rpg.barCount,3);
});

test('Tastenkonflikt: dieselbe Taste an einem zweiten Platz löst die alte Belegung',()=>{
 const g=new Game(arena());
 const r=assignBinding(g.rpg,12,'Digit5');
 assert.deepEqual(r,{ok:true,released:[4]});
 assert.equal(bindingAt(g.rpg,12),'Digit5');assert.equal(bindingAt(g.rpg,4),'','Platz 5 von Leiste 1 hat keine Taste mehr');
 assert.equal(slotForBinding(g.rpg,'Digit5'),12);
 // Zurück auf den Standard: gespeichert wird nur die Abweichung.
 assert.deepEqual(assignBinding(g.rpg,4,'Digit5'),{ok:true,released:[12]});assert.equal(g.rpg.barKeys[4],undefined);assert.equal(g.rpg.barKeys[12],'');
 // Löschen und Speichern.
 assert.ok(assignBinding(g.rpg,0,'').ok);assert.equal(slotForBinding(g.rpg,'Digit1'),-1);
 const loaded=new Game(arena(),g.save());assert.equal(bindingAt(loaded.rpg,0),'');assert.equal(bindingAt(loaded.rpg,12),'');
});

test('fest vergebene Tasten und Links-/Rechtsklick lassen sich nicht belegen',()=>{
 const g=new Game(arena());
 for(const b of ['KeyW','Shift+KeyW','Space','KeyQ','KeyB','Escape','Tab','Mouse0','Mouse2','Ctrl+KeyW'])assert.equal(isReserved(b),true,b);
 assert.equal(assignBinding(g.rpg,3,'KeyW').reason,'reserved');assert.equal(bindingAt(g.rpg,3),'Digit4');
 assert.equal(isReserved('KeyE'),false);assert.equal(isReserved('Ctrl+Digit1'),false);
 assert.equal(bindingFromMouse({button:0}),null);assert.equal(bindingFromMouse({button:2}),null);
 assert.equal(bindingFromKey(key('ShiftLeft',{shift:true})),null,'nur Umschalt: weiter warten');
});

test('Maustasten belegen: Mausrad und Seitentasten, Beschriftung M3/M4/M5, Auslösen über den Platz',()=>{
 const g=new Game(arena());
 const side=bindingFromMouse({button:3,ctrlKey:false,altKey:false,shiftKey:false});assert.equal(side,'Mouse3');
 assert.ok(assignBinding(g.rpg,14,side).ok);assert.equal(slotKey(g,14),'M4');assert.equal(bindingLabel(side,true),'Maustaste 4');
 assert.equal(bindingLabel('Mouse1'),'M3');assert.equal(bindingLabel('Mouse1',true),'Mausrad-Klick');assert.equal(bindingLabel('Mouse4'),'M5');
 assert.equal(bindingFromMouse({button:1,shiftKey:true}),'Shift+Mouse1');assert.equal(bindingLabel('Shift+Mouse1'),'⇧M3');
 assert.equal(slotForBinding(g.rpg,'Mouse3'),14);
 assert.ok(bindSkill(g,'strike',14));assert.equal(actionBar(g)[slotForBinding(g.rpg,'Mouse3')],'strike');
 // Tastatur mit Modifikatoren.
 assert.equal(bindingFromKey(key('Digit2',{shift:true})),'Shift+Digit2');assert.equal(bindingFromKey(key('KeyE',{ctrl:true,shift:true})),'Ctrl+Shift+KeyE');
 assert.equal(bindingLabel('Ctrl+Shift+KeyE',true),'Strg+Umschalt+E');
});

test('Spielstand-Tasten werden bereinigt',()=>{
 assert.deepEqual(cleanBarKeys({0:'Digit1',3:'',4:'<script>',99:'KeyE',x:'KeyE',5:7}),{0:'Digit1',3:''});
 assert.equal(defaultBinding(19),'Shift+Digit0');
});
