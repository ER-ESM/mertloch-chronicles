// E-57: Balance-Sheet – die Messung ist deterministisch und reagiert auf Ausrüstung, Werte und Talente.
import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate,roleGroup,METRIC,SHEET} from '../scripts/balance-sheet.mjs';

const base={classId:'kevin',spec:'kevin-fuse',path:0,level:10,seconds:20};

test('gleiche Einstellung ergibt dieselben Zahlen',()=>{
 const a=simulate({...base,gear:'rare'}),b=simulate({...base,gear:'rare'});
 assert.equal(a.dps,b.dps);assert.equal(a.hps,b.hps);assert.deepEqual(a.talents,b.talents);
});

test('Ausrüstung, Wumms und Talente verschieben den Schaden in die erwartete Richtung',()=>{
 const start=simulate({...base,gear:'none'}),rare=simulate({...base,gear:'rare'}),might=simulate({...base,gear:'rare',extra:{might:SHEET.statProbe}});
 assert.ok(rare.dps>start.dps,'voller Satz schlägt die Startausrüstung');
 assert.ok(might.dps>rare.dps,'mehr Wumms, mehr Schaden');
 assert.ok(rare.talents.length>0,'Stufe 10 lernt Talente');
 // Talentbeitrag: das letzte Talent des Pfads lässt sich verlernen, ein früheres, auf dem andere aufbauen, ist gebunden.
 const last=simulate({...base,gear:'rare',drop:rare.talents.at(-1)});
 assert.equal(last.dropped,true,'letztes Talent lässt sich verlernen');
 assert.ok(rare.talents.some(id=>simulate({...base,gear:'rare',drop:id}).dropped===false),'frühe Talente sind gebunden');
 assert.ok(rare.skills.length>0&&Math.abs(rare.skills.reduce((n,s)=>n+s.share,0)-100)<1,'Kniff-Anteile summieren sich auf 100 %');
});

test('Rollen messen sich an ihrer eigenen Kennzahl',()=>{
 assert.equal(roleGroup('Tank'),'tank');assert.equal(roleGroup('Heilung'),'heal');assert.equal(roleGroup('Schutz & Heilung'),'heal');assert.equal(roleGroup('Fernkampf-Schaden'),'dps');
 assert.deepEqual(Object.keys(METRIC).sort(),['dps','heal','tank']);
 const healer=simulate({classId:'baerbel',spec:'baerbel-care',path:0,level:10,gear:'rare',seconds:20});
 assert.ok(healer.hps>0,'Heiler heilen im Übungskampf');
});
