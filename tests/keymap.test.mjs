import test from 'node:test';
import assert from 'node:assert/strict';
import {keysOf,actionFor,moveFor,assignKey,cleanKeymap,takenByAction,loadKeymap,saveKeymap,setLiveKeymap} from '../keymap.js';
import {isReserved} from '../bar-keys.js';
import {KEYBIND_ACTIONS} from '../content/index.js';

test('Standardbelegung: jede Taste liegt auf höchstens einer Aktion, Bewegung auch mit Modifikator',()=>{
 const seen=new Map();for(const a of KEYBIND_ACTIONS)for(const b of keysOf({},a.id))if(b){assert.ok(!seen.has(b),b+' doppelt: '+seen.get(b)+' und '+a.id);seen.set(b,a.id);}
 assert.equal(actionFor({},'KeyC'),'person');assert.equal(actionFor({},'Shift+KeyB'),'professions');assert.equal(actionFor({},'KeyE'),null);
 assert.equal(moveFor({},'KeyW'),'w');assert.equal(moveFor({},'ArrowLeft'),'a');assert.equal(moveFor({},'KeyE'),null);
});

test('Neu belegen: die neue Taste gewinnt, die alte Aktion verliert sie; Standard wird nicht gespeichert',()=>{
 let r=assignKey({},'bag','0','KeyB');assert.equal(r.ok,false,'Platz muss 0 oder 1 sein');
 r=assignKey({},'bag',0,'KeyB');assert.equal(r.ok,true);assert.deepEqual(r.released,[{id:'base',slot:0}]);
 assert.equal(actionFor(r.map,'KeyB'),'bag');assert.deepEqual(keysOf(r.map,'base'),['','']);
 r=assignKey(r.map,'bag',0,'KeyI');r=assignKey(r.map,'base',0,'KeyB');assert.deepEqual(r.map,{},'zurück auf Standard = keine Abweichung');
 r=assignKey({},'moveUp',0,'KeyE');assert.equal(moveFor(r.map,'KeyE'),'w');assert.equal(moveFor(r.map,'KeyW'),null);
});

test('Gesperrt: Browsertasten, die feste Esc-Taste und unbekannte Aktionen',()=>{
 assert.equal(assignKey({},'bag',0,'Ctrl+KeyW').reason,'browser');assert.equal(assignKey({},'bag',0,'Mouse0').reason,'browser');
 assert.equal(assignKey({},'bag',0,'Escape').reason,'fixed');assert.equal(assignKey({},'menu',0,'KeyE').reason,'fixed');
 assert.equal(assignKey({},'gibtsnicht',0,'KeyE').reason,'action');assert.equal(assignKey({},'bag',0,'Key W').reason,'invalid');
 assert.equal(assignKey({},'bag',1,'').ok,true,'leeren geht');
});

test('Speicher: bereinigt fremde und kaputte Einträge, übersteht fehlenden Speicher',()=>{
 assert.deepEqual(cleanKeymap({bag:['KeyE',''],menu:['KeyE',''],nope:['KeyE',''],map:'KeyM',talents:['Ctrl+KeyW','']}),{bag:['KeyE','']});
 const box={v:null,getItem(){return this.v;},setItem(k,v){this.v=v;},removeItem(){this.v=null;}};
 saveKeymap({bag:['KeyE','']},box);assert.deepEqual(loadKeymap(box),{bag:['KeyE','']});saveKeymap({},box);assert.equal(box.v,null);
 assert.deepEqual(loadKeymap({getItem(){throw Error('gesperrt');}}),{});
});

test('Aktionsleisten sperren genau die Tasten der wirksamen Belegung',()=>{
 setLiveKeymap({});assert.equal(takenByAction({},'Shift+KeyW'),true);assert.equal(isReserved('KeyE'),false);
 setLiveKeymap(assignKey({},'interact',0,'KeyE').map);assert.equal(isReserved('KeyE'),true);assert.equal(isReserved('KeyF'),false,'F ist jetzt frei');
 setLiveKeymap({});
});
