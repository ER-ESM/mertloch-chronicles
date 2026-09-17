import test from 'node:test';
import assert from 'node:assert/strict';
import {NPCS,NPC_PORTRAITS,SIDE_QUESTS} from '../content/index.js';
import {conversationHeader,rewardConversationHeader,sideQuestDialogue} from '../dialogue-ui.js';
import {ACT_CHAPTERS} from '../engine.js';
import {chapterState,idaDialogue,mentorDialogue,memoryOverlay} from '../chapter-ui.js';
import {MEMORY_FRAGMENTS,HUB_TALK,NPCS as PEOPLE} from '../content/index.js';
/** Minimaler Spielstand für die reinen Textfunktionen: nur die Felder, die der Ida-Dialog liest. */
const fakeGame=(quest,ready=false)=>({quest:{chapter:1,accepted:false,chapterClaimed:0,actDone:false,...quest},chapter:()=>ACT_CHAPTERS.find(c=>c.id===(quest.chapter||1)),questReady:()=>ready});

test('Every conversation NPC has its own portrait cell',()=>{
 const ids=new Set(['ida',...SIDE_QUESTS.map(q=>q.npc)]),cells=[];
 for(const id of ids){assert.ok(NPCS[id]);const cell=NPC_PORTRAITS.cells[id];assert.ok(Number.isInteger(cell)&&cell>=0&&cell<NPC_PORTRAITS.columns*NPC_PORTRAITS.rows,id);cells.push(cell);}
 assert.equal(new Set(cells).size,ids.size);
});
test('Ida behält ihre Identität in jedem Zustand jedes Akt-1-Kapitels',()=>{
 for(const c of ACT_CHAPTERS){
  const offer=idaDialogue(fakeGame({chapter:c.id})),ongoing=idaDialogue(fakeGame({chapter:c.id,accepted:true})),
   reward=idaDialogue(fakeGame({chapter:c.id,accepted:true},true)),claimed=idaDialogue(fakeGame({chapter:c.id,accepted:true,chapterClaimed:c.id,actDone:true}));
  for(const html of [offer,ongoing,reward,claimed])assert.match(html,/data-conversation-npc="ida"/,'Kapitel '+c.id);
  assert.match(offer,/id="acceptQuest"/,'Kapitel '+c.id);assert.match(reward,/id="claimQuest"/,'Kapitel '+c.id);
  // Jedes Kapitel bringt eigene Zeilen mit; Kapitel 1 erbt ongoing/reward/claimed vom gemeinsamen Ida-Eintrag.
  for(const state of ['ongoing','reward','claimed'])assert.ok(chapterState(c.id,state),'Kapitel '+c.id+' · '+state);
  assert.ok(offer.includes(c.summary.slice(0,24)),'Kapitelzusammenfassung fehlt in Kapitel '+c.id);
  assert.ok(ongoing.includes(chapterState(c.id,'ongoing').title));
  assert.ok(claimed.includes(chapterState(c.id,'claimed').title));
 }
 // Nach Aktschluss spricht Ida die Schlusszeile des letzten Kapitels („Der Bus nach nirgendwo“).
 const last=ACT_CHAPTERS.at(-1);assert.ok(idaDialogue(fakeGame({chapter:last.id,chapterClaimed:last.id,actDone:true})).includes(chapterState(last.id,'claimed').line.slice(0,20)));
});
test('Mentorengespräch und Erinnerungsfetzen tragen Name, Zeile und Titel aus content/',()=>{
 const line=HUB_TALK.dieter[1][0],html=mentorDialogue({npc:'dieter',name:PEOPLE.dieter.name,line});
 assert.match(html,/data-conversation-npc="dieter"/);assert.ok(html.includes(PEOPLE.dieter.name));
 const flash=memoryOverlay(MEMORY_FRAGMENTS[0]);assert.ok(flash.includes(MEMORY_FRAGMENTS[0].title));assert.match(flash,/data-memory-next/);
});
test('Side conversations select personal responses and retain giver at reward choice',()=>{
 const t=SIDE_QUESTS[0],q={...t,id:'generated-quest-5',giver:{npc:t.npc,name:NPCS[t.npc].name},required:3,description:'Am Feld',location:'Feld',reward:80};
 for(const [s,line] of [[{accepted:false},q.quote],[{accepted:true,progress:1},q.lines.progress],[{accepted:true,progress:3},q.lines.complete],[{accepted:true,progress:3,claimed:true},q.lines.claimed]]){
  const html=sideQuestDialogue(q,s);assert.ok(html.includes(line));assert.ok(html.includes(`data-conversation-npc="${t.npc}"`));
 }
 const game={world:{quests:[q]}};assert.ok(rewardConversationHeader(game,q.id).includes(NPCS[t.npc].name));assert.match(rewardConversationHeader(game,'main'),/data-conversation-npc="ida"/);
});
test('Unknown portraits keep an escaped name without a broken image',()=>{
 const html=conversationHeader('new','<Bewohner>');assert.ok(html.includes('&lt;Bewohner&gt;'));assert.ok(!html.includes('<img'));assert.equal(conversationHeader(null),'');
});
