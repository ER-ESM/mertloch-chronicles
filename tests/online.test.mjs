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

test('API-Dateien und Schema liegen vollständig vor und benutzen nur vorbereitete Abfragen',()=>{
 for(const f of ['_lib.php','auth.php','save.php','presence.php','leaderboard.php','health.php']){const src=readFileSync(new URL('../server/api/'+f,import.meta.url),'utf8');assert.ok(src.startsWith('<?php'),f);assert.ok(!/\$_(GET|POST)\[[^\]]+\]\s*\./.test(src),f+': keine String-Verkettung von Eingaben in SQL');}
 const schema=readFileSync(new URL('../server/schema.sql',import.meta.url),'utf8');
 for(const t of ['account','session','character_save','presence','leaderboard_entry','login_attempt'])assert.ok(schema.includes('CREATE TABLE IF NOT EXISTS '+t),t);
});
