import test from 'node:test';
import assert from 'node:assert/strict';
import {conditionMet,featureUnlocked,lockedMessage} from '../unlocks.js';
import {FEATURE_UNLOCKS} from '../content/index.js';

const game=(o={})=>({player:{level:o.level||1},tutorial:{completed:!!o.tutorial},quest:{chapterClaimed:o.chapter||0,actDone:!!o.actDone},memories:{seen:o.memories||[]}});

test('neuer Held sieht nur die Grundmenüs',()=>{
 const g=game();for(const f of FEATURE_UNLOCKS)assert.equal(featureUnlocked(g,f.id),false,f.id);
 for(const always of ['person','bag','map','book','guide','quest'])assert.equal(featureUnlocked(g,always),true,always);
});
test('Hofprobe, Stufe und Kapitel schalten schrittweise frei',()=>{
 assert.equal(featureUnlocked(game({tutorial:true}),'meter'),true);
 assert.equal(featureUnlocked(game({tutorial:true,level:2}),'professions'),false);
 assert.equal(featureUnlocked(game({tutorial:true,level:3}),'professions'),true);
 assert.equal(featureUnlocked(game({tutorial:true,level:5}),'talents'),true);
 assert.equal(featureUnlocked(game({tutorial:true,chapter:1}),'mounts'),true);
 assert.equal(featureUnlocked(game({tutorial:true,memories:['stempel']}),'memories'),true);
});
test('alte Spielstände ohne Hofprobe-Status gelten als eingeführt',()=>{
 assert.equal(conditionMet({player:{level:1},quest:{},memories:{seen:[]}},{tutorial:true}),true);
});
test('gesperrte Menüs sagen, wann es sie gibt',()=>{
 assert.match(lockedMessage('talents'),/Stufe 5/);assert.match(lockedMessage('mounts'),/Kapitel 1/);
});
