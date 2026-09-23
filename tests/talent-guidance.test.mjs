// Talentfenster (Nutzerwunsch 2026-09-23): Hauptbaum-Wahl hervorheben, solange keiner gewählt ist; Richtung je Pfad.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {renderTalentTree,viewTalentPath} from '../talent-tree-view.js';
import {classSpecs} from '../talents.js';
import {PATH_FOCUS,SPEC_MECHANICS,BALANCE} from '../content/index.js';

const arena=()=>({id:'talents',seed:1,spawn:{x:0,y:0},npc:{x:10,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 blocked:()=>false,walkClear:()=>true,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b],onRoad:()=>false,width:4000,height:4000});
const none={words:[],ids:new Set(),perSpec:{}};

test('jeder Pfad jeder Spec hat eine kurze Richtung',()=>{
 for(const [spec,m] of Object.entries(SPEC_MECHANICS)){assert.equal(PATH_FOCUS[spec]?.length,m.paths.length,spec);
  for(const t of PATH_FOCUS[spec]){assert.ok(t.length>=20&&t.length<=90,spec+': '+t);assert.match(t,/\.$/);}}
});

test('ohne Hauptbaum steht ein deutlicher Hinweis über den Bäumen, danach verschwindet er',()=>{
 const g=new Game(arena(),{version:1,level:BALANCE.player.specLevel});const spec=classSpecs(g.member.id)[0];g.rpg.talents.spec=null;
 let html=renderTalentTree(g,spec,none,'');
 assert.match(html,/tt-main-callout"/);assert.match(html,/tt-main-pick/);assert.match(html,/tt-choose/);
 viewTalentPath(spec,1);html=renderTalentTree(g,spec,none,'');assert.ok(html.includes(PATH_FOCUS[spec][1].replace(/&/g,'&amp;')),'Richtung steht im Hover-Tooltip des Pfadreiters');
 g.rpg.talents.spec=spec;html=renderTalentTree(g,spec,none,'');assert.doesNotMatch(html,/tt-main-callout/);assert.doesNotMatch(html,/tt-main-pick/);
 const young=new Game(arena(),{version:1,level:1});young.rpg.talents.spec=null;html=renderTalentTree(young,spec,none,'');
 assert.match(html,/tt-main-callout quiet/,'vor dem Spec-Tor nur ein ruhiger Vorhinweis');
});
