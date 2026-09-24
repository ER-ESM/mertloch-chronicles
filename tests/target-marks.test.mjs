import test from 'node:test';
import assert from 'node:assert/strict';
import {setMark,applyNetMark,markedEnemies,TARGET_MARK_MENU} from '../target-marks.js';

const world=()=>{const enemies=[{id:1,netId:'c:0',name:'Keiler',hp:10},{id:2,netId:'c:1',name:'Fuchs',hp:10},{id:3,netId:'c:2',name:'Wolf',hp:0}];return {enemies,netEnemy:id=>enemies.find(e=>e.netId===id)||null};};

test('Markierung gibt es nur einmal; dieselbe noch einmal nimmt sie weg',()=>{
 const g=world(),[a,b]=g.enemies;
 assert.deepEqual(setMark(g,a,'skull'),{mark:'skull',changed:true});
 setMark(g,b,'skull');assert.equal(a.groupMark,'','Totenkopf wandert zum neuen Gegner');assert.equal(b.groupMark,'skull');
 assert.deepEqual(setMark(g,b,'skull'),{mark:'',changed:true});assert.equal(setMark(g,b,'quatsch').mark,'');
});

test('Netz: Endzustand übernehmen, ohne Umschalten; unbekannte Gegner übergehen',()=>{
 const g=world();assert.equal(applyNetMark(g,'c:0','cross').name,'Keiler');assert.equal(applyNetMark(g,'c:0','cross'),null,'gleicher Zustand ändert nichts');
 assert.equal(applyNetMark(g,'c:0','').groupMark,'');assert.equal(applyNetMark(g,'weg','skull'),null);
});

test('Söldner-Reihenfolge: Totenkopf vor Kreuz, Tote fallen weg; Menü mit Häkchen',()=>{
 const g=world(),[a,b,c]=g.enemies;setMark(g,a,'cross');setMark(g,b,'skull');c.groupMark='star';
 assert.deepEqual(markedEnemies(g).map(e=>e.name),['Fuchs','Keiler']);
 const menu=TARGET_MARK_MENU(b);assert.ok(menu[0].label.startsWith('✓ Totenkopf'));assert.equal(menu.at(-1).id,'');
});
