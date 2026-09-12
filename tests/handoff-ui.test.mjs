import test from 'node:test';
import assert from 'node:assert/strict';
import {BossSpeech,targetIdentity,isElite} from '../enemy-ui.js';
import {questlogPanel} from '../questlog-ui.js';
import {sideQuestDialogue} from '../dialogue-ui.js';
import {questProgress} from '../quest-status-ui.js';
import {visibleCreatures,drawCreatureMarker} from '../cartography.js';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {BOSSES,BOSS_LINES,ELITES,SIDE_QUESTS,NPCS} from '../content/index.js';

test('Quest dialogue and journal share personal responses and named gathering progress',()=>{
 const t=SIDE_QUESTS.find(q=>q.type==='gather'),q={...t,id:'review',required:3,location:'Feld',giver:{npc:t.npc,name:NPCS[t.npc].name}};
 for(const [status,key] of [[{accepted:false,progress:0},'quote'],[{accepted:true,progress:2},'progress'],[{accepted:true,progress:3},'complete'],[{accepted:true,progress:3,claimed:true},'claimed']]){
  const g={quest:{},world:{quests:[q]},sideQuests:{review:status}},line=key==='quote'?q.quote:q.lines[key];
  for(const html of [sideQuestDialogue(q,status),questlogPanel(g,'all')]){assert.ok(html.includes(line));if(status.accepted&&!status.claimed)assert.ok(html.includes(questProgress(q,status)));}
 }
 const html=sideQuestDialogue({...q,itemName:'<Hopfen & Minze>',lines:{progress:'<b>Text</b>'}},{accepted:true,progress:1});assert.match(html,/&lt;Hopfen &amp; Minze&gt;/);assert.match(html,/&lt;b&gt;Text&lt;\/b&gt;/);
});
test('All gathering and hunt objectives use their own content labels',()=>{
 for(const q of SIDE_QUESTS){const p=questProgress({...q,required:3},{progress:2});if(q.type==='gather')assert.ok(p.includes(q.itemName));if(q.type==='hunt')assert.ok(p.includes(q.enemyName));}
});
test('Elites and bosses have distinct map crowns and target subtitles',()=>{
 for(const e of [ELITES.alphaBoar,BOSSES.horst,BOSSES.gisela]){assert.ok(isElite(e));assert.match(targetIdentity(e).level,/ELITE/);assert.equal(targetIdentity(e).title,e.title);}
 const camp=makeEnemy({x:0,y:0},1,{type:'boss'});assert.equal(targetIdentity(camp).title,BOSSES.horst.title);
 assert.deepEqual(targetIdentity({level:1}),{level:'ST. 1',title:''});
 let arcs=0,segments=0;const c={beginPath(){},moveTo(){},lineTo(){segments++;},closePath(){},fill(){},stroke(){},arc(){arcs++;}};
 drawCreatureMarker(c,ELITES.alphaBoar,{x:20,y:20});assert.equal(arcs,0);assert.ok(segments>=6);drawCreatureMarker(c,{},{x:20,y:20});assert.equal(arcs,1);
});
test('Minimap includes nearby neutral elites, respecting dead/distant enemies and atlas filter',()=>{
 const e={...ELITES.alphaBoar,x:20,y:0,behavior:'neutral'},g={player:{x:0,y:0},enemies:[e,{...e,hp:0},{...e,x:500}]};
 assert.deepEqual(visibleCreatures(g,false),[e]);assert.equal(visibleCreatures(g,true).length,0);assert.equal(visibleCreatures(g,true,true).length,2);g.target=g.enemies[2];assert.equal(visibleCreatures(g,false).length,2);
});
test('Boss quotes last three seconds, ignore unrelated logs, and may repeat on later events',()=>{
 const e={...BOSSES.gisela,bossId:'gisela',maxHp:4200,cycle:0},g={enemies:[e],time:0,messages:[]},speech=new BossSpeech();
 g.messages=[{text:e.name+': „'+BOSS_LINES.gisela.engage+'“',time:0}];assert.equal(speech.update(g)[0].text,BOSS_LINES.gisela.engage);
 g.time=2.99;assert.equal(speech.update(g).length,1);g.time=3;assert.equal(speech.update(g).length,0);
 g.messages.push({text:'Ein Bewohner: „Hallo“',time:3});assert.equal(speech.update(g).length,0);
 g.messages.push({text:e.name+': „'+BOSS_LINES.gisela.engage+'“',time:3});assert.equal(speech.update(g).length,1);
 g.messages.push({text:e.name+': „'+BOSS_LINES.gisela.defeat+'“',time:3});e.hp=0;assert.equal(speech.update(g)[0].text,BOSS_LINES.gisela.defeat);
 assert.equal(speech.update({...g,time:10,messages:[]}).length,0);
});
test('Chapter-one boss speech works with real engine casts, phase transitions, death and reset',()=>{
 const world={id:'speech-test',spawn:{x:-1000,y:-1000},npc:{x:-1000,y:-980},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]};
 const g=new Game(world),e=makeEnemy({x:0,y:0},1,{type:'boss'}),speech=new BossSpeech();g.enemies=[e];speech.update(g);
 assert.equal(e.bossId,undefined);g.startCast(e);assert.equal(speech.update(g)[0].text,BOSS_LINES.horst.engage);
 e.hp=e.maxHp*.45;g.startCast(e);assert.equal(speech.update(g)[0].text,BOSSES.horst.phases[1].line);
 e.hp=e.maxHp*.1;g.startCast(e);assert.equal(speech.update(g)[0].text,BOSSES.horst.phases[2].line);
 g.kill(e);assert.equal(speech.update(g)[0].text,BOSS_LINES.horst.defeat);g.time=3;assert.equal(speech.update(g).length,0);
 g.resetEnemy(e);speech.update(g);g.startCast(e);assert.equal(speech.update(g)[0].text,BOSS_LINES.horst.engage);
 e.ai='returning';assert.equal(speech.update(g).length,0);
});
test('Boss log text wins over compatibility observation and is never consumed',()=>{
 const e=makeEnemy({x:0,y:0},1,{type:'boss'}),g={time:0,enemies:[e],messages:[]},speech=new BossSpeech();speech.update(g);e.cycle=1;
 g.messages.push({text:e.name+': „'+BOSSES.horst.phases[1].line+'“',time:0});assert.equal(speech.update(g)[0].text,BOSSES.horst.phases[1].line);assert.equal(g.messages.length,1);g.enemies=[];assert.equal(speech.update(g).length,0);
});
