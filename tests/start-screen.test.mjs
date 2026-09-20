import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decideSync} from '../online.js';

// start-screen.js zieht Browser-Module nach; die reinen Regeln werden hier über den Quelltext und decideSync geprüft.
const src=readFileSync(new URL('../start-screen.js',import.meta.url),'utf8');
const firstStep=new Function('return '+/export function firstStep(\([^]*?\})\n/.exec(src)[0].replace('export function firstStep','function'))();
const switchVerdict=new Function('return '+/export function switchVerdict(\([^]*?\})\n/.exec(src)[0].replace('export function switchVerdict','function'))();

test('Erster Schritt: Anmeldung nur mit Server und ohne Konto; Gast und Offline landen in der Figurenwahl',()=>{
 assert.equal(firstStep({enabled:true,account:null,guest:false}),'login');
 assert.equal(firstStep({enabled:true,account:{name:'E'},guest:false}),'roster');
 assert.equal(firstStep({enabled:true,account:null,guest:true}),'roster');
 assert.equal(firstStep({enabled:false,account:null,guest:false}),'roster');
});
test('Figurenwechsel: gleich, am Clan-Treff, unterwegs (startet daheim), im Kampf gesperrt',()=>{
 const g=(o={})=>({member:{id:'dieter'},dead:false,player:{inCombat:0},atHub:()=>true,...o});
 assert.equal(switchVerdict(g(),'dieter'),'same');assert.equal(switchVerdict(g(),'kevin'),'ok');
 assert.equal(switchVerdict(g({atHub:()=>false}),'kevin'),'home');assert.equal(switchVerdict(g({player:{inCombat:3}}),'kevin'),'combat');
});
test('Kontowechsel im selben Browser: fremder lokaler Stand wird nie über den Server-Stand geschoben',()=>{
 const local={savedAt:200},server={save:{},savedAt:100};
 assert.equal(decideSync(local,server),'push');assert.equal(decideSync(local,server,{foreign:true}),'pull');
 assert.equal(decideSync(local,null,{foreign:true}),'push');
});
test('Konto-Karte ist aus den Einstellungen verschwunden, Spielmenü führt zum Anmeldebildschirm',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),shell=readFileSync(new URL('../rpg-shell.js',import.meta.url),'utf8');
 assert.ok(!/settingsPanel\(\)\{[^\n]*online\.card\(\)/.test(app));assert.match(shell,/data-start-screen="roster"/);assert.match(shell,/data-start-screen="logout"/);
});
