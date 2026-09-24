import test from 'node:test';
import assert from 'node:assert/strict';
import {companionWire,remoteCompanionViews} from '../companions.js';
import {cleanCompanionWire} from '../server/game/server.mjs';

test('Söldner im Netz: Besitzer schickt nur Katalog-ID und Zustand, im Raum „privat“ nichts',()=>{
 const c={def:{id:'merc-pils-peter'},x:10.4,y:20.6,facing:-1,state:'follow',moving:true,hp:50,maxHp:100,level:7};
 assert.deepEqual(companionWire({companions:[c]}),[{i:'merc-pils-peter',x:10,y:21,f:-1,s:'walk',h:50,l:7}]);
 assert.equal(companionWire({companions:[c],instance:{}}),undefined);assert.equal(companionWire({companions:[]}),undefined);
});

test('Server säubert: fremde IDs, Doppelte, Werte außerhalb, mehr als vier',()=>{
 const raw=[{i:'merc-pils-peter',x:1,y:2,f:5,s:'tanzt',h:400,l:99,n:'<b>Böse</b>'},{i:'merc-pils-peter'},{i:'boss-drache'},{i:'merc-a-b'},{i:'merc-c-d'},{i:'merc-e-f'},{i:'merc-g-h'}];
 const out=cleanCompanionWire(raw);assert.equal(out.length,2,'nur die ersten vier Einträge werden gelesen, Doppelte und fremde fallen weg');
 assert.deepEqual(out[0],{i:'merc-pils-peter',x:1,y:2,f:1,s:'idle',h:100,l:60});assert.equal(cleanCompanionWire('x'),undefined);assert.equal(cleanCompanionWire([{i:'nope'}]),undefined);
});

test('Empfänger baut Name und Aussehen aus dem Katalog, unbekannte IDs fallen weg, Überblendung ab sichtbarer Stelle',()=>{
 const owner={name:'Rudi',party:true,floor:0};
 const [v]=remoteCompanionViews([{i:'merc-pils-peter',x:100,y:0,f:1,s:'down',h:0,l:5},{i:'merc-gibtsnicht'}],[],owner,1000);
 assert.equal(v.name,'Pils-Peter');assert.equal(v.owner,'Rudi');assert.equal(v.down,true);assert.equal(v.state,'dead');assert.equal(v.party,true);assert.equal(v.remote,true);
 const [w]=remoteCompanionViews([{i:'merc-pils-peter',x:200,y:0,f:1,s:'walk',h:90,l:5}],[v],owner,1080,160);
 assert.equal(w.fromX,100,'startet am letzten Punkt');assert.equal(w.moving,true);
});
