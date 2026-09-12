import test from 'node:test';
import assert from 'node:assert/strict';
import {NPCS,NPC_PORTRAITS,SIDE_QUESTS} from '../content/index.js';
import {conversationHeader,rewardConversationHeader,sideQuestDialogue} from '../dialogue-ui.js';
import {introDialogue,rewardDialogue,ongoingDialogue} from '../clan-ui.js';

test('Every conversation NPC has its own portrait cell',()=>{
 const ids=new Set(['ida',...SIDE_QUESTS.map(q=>q.npc)]),cells=[];
 for(const id of ids){assert.ok(NPCS[id]);const cell=NPC_PORTRAITS.cells[id];assert.ok(Number.isInteger(cell)&&cell>=0&&cell<NPC_PORTRAITS.columns*NPC_PORTRAITS.rows,id);cells.push(cell);}
 assert.equal(new Set(cells).size,ids.size);
});
test('Ida retains her identity through every main conversation state',()=>{
 for(const html of [introDialogue(),rewardDialogue(),ongoingDialogue({quest:{claimed:false}}),ongoingDialogue({quest:{claimed:true}})])assert.match(html,/data-conversation-npc="ida"/);
 assert.match(introDialogue(),/id="acceptQuest"/);assert.match(rewardDialogue(),/id="claimQuest"/);
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
