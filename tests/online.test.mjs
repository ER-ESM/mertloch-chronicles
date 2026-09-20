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

test('Erster Abgleich auf einem neuen Gerät: ein frischer Stand überschreibt keinen Cloud-Fortschritt',async()=>{
 const {progressed}=await import('../online.js');
 assert.equal(progressed({level:1,xp:0,savedAt:9e12},{level:7,xp:50}),false,'frisch erzeugt, aber neuerer Zeitstempel');
 assert.equal(progressed(null,{level:1}),false);assert.equal(progressed({level:1,xp:0},{level:1,xp:0}),false);
 assert.equal(progressed({level:8,xp:0},{level:7,xp:900}),true);assert.equal(progressed({level:7,xp:60},{level:7,xp:50}),true);assert.equal(progressed({level:7,xp:10},{level:7,xp:50}),false);
});

test('übernommener Cloud-Stand wird vom laufenden Spiel nicht mehr überschrieben (Sperre bis zum Neuladen)',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/writeLocal:s=>\{[^}]*cloudPulled=true;/);assert.match(app,/function save\(\)\{if\(saveBlocked\|\|cloudPulled\)return false;/);
});
