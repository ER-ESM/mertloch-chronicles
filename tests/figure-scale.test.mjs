// Figurengröße an EINER Stelle (world-scale.js PERSON_SCALE): Held, Söldner, andere Spieler und NPCs werden mit demselben
// Maß gezeichnet; Schmiede-Figuren gleicht content-art.js über die gemessene Figurenhöhe ab. Pixelmessung im Browser:
// scripts/figure-size-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WORLD_SCALE,FIGURE_BASE,PERSON_SCALE} from '../world-scale.js';
import {contentArt,contentActor} from '../content-art.js';

const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
/** Alle Aufrufe `name(...)` samt Argumenten (Klammern gezählt). */
function calls(text,name){
 const out=[];let i=0;
 while((i=text.indexOf(name+'(',i))>=0){
  if(/[\w.]/.test(text[i-1]||'')||text.slice(Math.max(0,i-16),i).includes('function ')){i+=name.length;continue;}
  let depth=0,j=i+name.length;
  for(;j<text.length;j++){if(text[j]==='(')depth++;else if(text[j]===')'&&--depth===0)break;}
  out.push(text.slice(i,j+1));i=j;
 }
 return out;
}

test('PERSON_SCALE ergibt Erwachsene mit WORLD_SCALE.adult',()=>{
 assert.equal(PERSON_SCALE*FIGURE_BASE,WORLD_SCALE.adult);
 assert.equal(WORLD_SCALE.npc,WORLD_SCALE.adult,'NPCs sind so groß wie Erwachsene/Held');
});

test('Menschenfiguren in der Welt nutzen alle PERSON_SCALE (Held, Söldner, andere Spieler, NPCs)',()=>{
 for(const file of ['renderer.js','kiosk-room-art.js','profession-art.js']){
  const text=source(file);
  assert.doesNotMatch(text,/\/\s*33\b|26\/33/,file+': Figurenmaß nur über PERSON_SCALE, keine eigene 33er-Rechnung');
  const found=['drawHero','drawClanHero','drawWorldPerson','drawLivePerson'].flatMap(n=>calls(text,n));
  for(const call of found)assert.match(call,/PERSON_SCALE/,file+': ohne zentrales Figurenmaß: '+call.slice(0,90));
  if(file==='renderer.js')assert.ok(found.length>=8,'renderer.js zeichnet Held, andere/Söldner, NPCs: '+found.length);
 }
 // Söldner laufen über den Zweig „other“ (companions.js → c.view); früher ohne Maß = 33 E statt 26 E.
 const other=source('renderer.js').split("item.type==='other'")[1].split("else if(item.type==='player')")[0];
 assert.equal(calls(other,'drawHero').length,2);
 for(const call of calls(other,'drawHero'))assert.match(call,/,false,PERSON_SCALE\)$/);
});

test('Zeichenwege rechnen mit PERSON_SCALE statt 26/33',()=>{
 for(const file of ['live-art.js','clan-art.js'])assert.doesNotMatch(source(file),/26\/33/,file);
});

test('Schmiede-Figur: gemessene Figurenhöhe ersetzt die Rahmenhöhe, Schritt schrumpft mit',()=>{
 const before={...contentArt};
 try{
  const frames=[{x:0,y:0}];
  contentArt.catalog={frameSize:192,pivot:{x:96,y:160},directions:['se','sw','ne','nw'],assets:{
   figur:{frameSize:192,nativeHeight:104,worldHeight:26,paintedHeight:124,columns:['idle'],frames,source:'sprite-forge'},
   'figur-walk':{frameSize:192,nativeHeight:104,worldHeight:26,columns:['walk-0'],frames,stride:24},
   bogen:{frameSize:192,nativeHeight:104,worldHeight:26,columns:['idle'],frames}}};
  contentArt.images=new Map([['figur',{}],['figur-walk',{}],['bogen',{}]]);
  const forge=contentActor('figur'),painted=contentActor('bogen');
  assert.equal(forge.nativeHeight,124);assert.equal(forge.worldHeight,26);
  assert.ok(Math.abs(forge.stride-24*104/124)<1e-9);
  assert.equal(painted.nativeHeight,104,'Präzisionsbogen bleibt bei der gelieferten Höhe');
 }finally{Object.assign(contentArt,before);}
});
