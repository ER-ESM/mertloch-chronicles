import test from 'node:test';
import assert from 'node:assert/strict';
import {talentSearch,searchWords} from '../talent-ui.js';
const g={member:{id:'dieter'}};
test('Talentsuche findet über Name, Kategorie und veränderten Kniff – in allen drei Bäumen',()=>{
 assert.deepEqual(searchWords('  Hei  x '),['hei']);
 assert.equal(talentSearch(g,'').ids.size,0);
 const name=talentSearch(g,'Deckelwirtschaft');assert.ok(name.ids.has('dieter-wall-0'));assert.equal(name.perSpec['dieter-wall'],1);
 const heal=talentSearch(g,'heilung');assert.ok(heal.ids.size>5);assert.ok(Object.values(heal.perSpec).filter(n=>n>0).length>=2,'Treffer in mehreren Bäumen');
 const skill=talentSearch(g,'kronkorken-kelle');assert.ok(skill.ids.has('dieter-wall-0'));
 const both=talentSearch(g,'kelle deckung');assert.ok(both.ids.has('dieter-wall-0'));assert.ok(both.ids.size<skill.ids.size,'mehrere Wörter grenzen ein');
 assert.equal(talentSearch(g,'gibtsnichtxyz').ids.size,0);
});
