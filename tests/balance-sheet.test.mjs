// E-57: Balance-Sheet – die Messung ist deterministisch und reagiert auf Ausrüstung, Werte und Talente.
import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate,blend,foeLife,roleGroup,METRIC,SHEET} from '../scripts/balance-sheet.mjs';

const base={classId:'kevin',spec:'kevin-fuse',path:0,level:10,seconds:20};

test('gleiche Einstellung ergibt dieselben Zahlen',()=>{
 const a=simulate({...base,gear:'rare'}),b=simulate({...base,gear:'rare'});
 assert.equal(a.dps,b.dps);assert.equal(a.hps,b.hps);assert.deepEqual(a.talents,b.talents);
});

test('Ausrüstung, Wumms und Talente verschieben den Schaden in die erwartete Richtung',()=>{
 const start=simulate({...base,gear:'none'}),rare=simulate({...base,gear:'rare'});
 assert.ok(rare.dps>start.dps,'voller Satz schlägt die Startausrüstung');
 // Wertprobe gegen dieselbe Probe ohne Werte (die Probe belegt trinket2), gemittelt wie im Sheet.
 const probe=blend({...base,gear:'rare',extra:{}}),might=blend({...base,gear:'rare',extra:{might:SHEET.statProbe}});
 assert.ok(might.dps>probe.dps,'mehr Wumms, mehr Schaden');
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

test('E-60: Gegner sterben und werden ersetzt – Kill-Talente zählen, der Boss hält länger',()=>{
 const group=simulate({...base,gear:'rare',targets:3}),boss=simulate({...base,gear:'rare',targets:1});
 assert.ok(group.kills>=3,'die Feldgruppe fällt mehrfach');
 assert.ok(boss.kills<group.kills,'der Boss hat mehr Leben');
 assert.equal(foeLife(10,1),foeLife(10,3)*SHEET.foe.boss);
 assert.ok(foeLife(20,3)>foeLife(10,3),'Feldleben wächst mit der Stufe wie im Umland');
});

test('E-60: Zufall mit Startwert – Krits lösen aus, verschiedene Startwerte geben verschiedene Kämpfe',()=>{
 const a=simulate({...base,gear:'rare',seed:1}),b=simulate({...base,gear:'rare',seed:2});
 assert.notEqual(a.dps,b.dps);
 const probe=blend({...base,gear:'rare',extra:{}}),crit=blend({...base,gear:'rare',extra:{finesse:SHEET.statProbe*4}});
 assert.ok(crit.dps>probe.dps,'Taktgefühl (Krit) bringt Schaden – mit festem Zufall 0,5 fiel nie ein Krit');
});
