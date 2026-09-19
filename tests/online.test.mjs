// Online-Schicht (Stufe A): Abgleichregel und Aktivierung ohne Browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {decideSync,onlineEnabled,ONLINE_UI} from '../online.js';
import {validSave} from '../save-store.js';
import {readFileSync} from 'node:fs';

test('Abgleich: Server neuer → pull, lokal neuer oder Server leer → push, gleich → same',()=>{
 assert.equal(decideSync({savedAt:10},{save:{},savedAt:20}),'pull');
 assert.equal(decideSync({savedAt:30},{save:{},savedAt:20}),'push');
 assert.equal(decideSync({savedAt:20},{save:{},savedAt:20}),'same');
 assert.equal(decideSync({savedAt:5},{save:null}),'push');
 assert.equal(decideSync(null,{save:null}),'same');
 assert.equal(decideSync({},{save:{},savedAt:1}),'pull','lokaler Stand ohne Zeitstempel gilt als älter');
});

test('außerhalb des Browsers ist die Online-Schicht aus; ein Spielstand mit savedAt bleibt gültig',()=>{
 assert.equal(onlineEnabled(),false);
 assert.ok(validSave({version:1,savedAt:Date.now(),rpg:{inventory:[]}}));
 assert.ok(ONLINE_UI.title.length>3);
});

test('der Client spricht den Spielserver ohne .php-Pfade an und verbindet sich per WebSocket',()=>{
 const src=readFileSync(new URL('../online.js',import.meta.url),'utf8');
 assert.ok(!src.includes('.php'));assert.ok(src.includes("new URL('../ws',API)"));
 for(const f of ['server.mjs','store.mjs','ws.mjs'])assert.ok(readFileSync(new URL('../server/game/'+f,import.meta.url),'utf8').length>500,f);
});
