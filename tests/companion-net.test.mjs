import test from 'node:test';
import assert from 'node:assert/strict';
import {companionWire,remoteCompanionViews} from '../companions.js';
import {cleanCompanionWire} from '../server/game/server.mjs';
import {COMPANION_PLATE} from '../content/index.js';

test('Namensschild: Besitzer im Genitiv',()=>{assert.equal(COMPANION_PLATE.owner('Rudi'),'Rudis Söldner');assert.equal(COMPANION_PLATE.owner('Klaus'),'Klaus’ Söldner');assert.equal(COMPANION_PLATE.owner('Max'),'Max’ Söldner');});

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

test('Gruppe über fünf Köpfen: alle rechnen gleich, der alphabetisch letzte Besitzer gibt zuerst den neuesten ab',async()=>{
 const {partyOverflow,companionSlots}=await import('../companions.js');
 assert.deepEqual(partyOverflow('Rudi',['a','b','c'],[{name:'Moni',ids:['x','y']}]),['c','b']);
 assert.deepEqual(partyOverflow('Moni',['x','y'],[{name:'Rudi',ids:['a','b','c']}]),[]);
 assert.deepEqual(partyOverflow('Anna',['a'],[{name:'Bert',ids:[]},{name:'Carl',ids:[]},{name:'Dora',ids:[]},{name:'Emil',ids:[]}]),['a'],'fünf Menschen: kein Platz mehr für Söldner');
 assert.deepEqual(partyOverflow('Rudi',['a','b'],[{name:'Moni',ids:['x']}]),[],'genau fünf bleibt');
 assert.equal(companionSlots({partyHumans:1,partyCompanions:3,companions:[]}),0,'Anheuern zählt fremde Söldner mit');
 assert.equal(companionSlots({partyHumans:1,partyCompanions:1,companions:[{}]}),1);
});

test('Kampfpose reist mit: Schlag/Zauber/Fernkampf für Helden und Söldner',async()=>{
 const {applySnapshot,poseCode}=await import('../online.js');
 assert.equal(poseCode({attack:.1}),1);assert.equal(poseCode({castPose:.2}),2);assert.equal(poseCode({}),undefined);
 const [o]=applySnapshot([],[{n:'Moni',x:0,y:0,a:1,r:1}],0);assert.equal(o.attack,.2);assert.equal(o.usingRanged,true);assert.equal(o.castPose,0);
 const [w]=companionWire({companions:[{def:{id:'merc-radler-rita'},x:0,y:0,facing:1,state:'combat',hp:1,maxHp:1,level:3,castPose:.2,usingRanged:true}]});assert.equal(w.a,2);assert.equal(w.r,1);
 assert.equal(cleanCompanionWire([{...w}])[0].a,2);assert.equal(cleanCompanionWire([{...w,a:9}])[0].a,undefined);
 const [v]=remoteCompanionViews([w],[],{name:'Rudi',party:true},0);assert.equal(v.castPose,.2);assert.equal(v.usingRanged,true);
});
