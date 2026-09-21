import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {TALENTS,talentState,talentRank,talentById,talentPrerequisites,learnTalent,unlearnTalent,spentPoints,pathCounts,pathEffects,pathBuild,talentEffects,changeSpec,resetTalents,talentPoints} from '../talents.js';
import {effectsAt,effectAt,RANKS} from '../talent-ranks.js';
import {PROC_RULES} from '../content/index.js';
import {combatStats} from '../rpg.js';
import {fireProcs} from '../procs.js';
import {talentsPanel,talentTooltip,viewTalentTree} from '../talent-ui.js';
const world=()=>({id:'hof',spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}],findClear:(x,y)=>({x,y})});
const game=(classId='dieter',spec='dieter-brew')=>new Game(world(),{classId,level:30,rpg:{talents:{spec,learned:[]}}});
test('all paths have exactly three columns, five sparse tiers and only straight local dependencies',()=>{
 for(const tree of Object.values(TALENTS))for(const path of [0,1,2]){const nodes=tree.filter(t=>t.path===path);assert.deepEqual([0,1,2,3,4].map(tier=>nodes.filter(t=>t.tier===tier).length),[3,1,2,3,1]);assert.equal(new Set(nodes.map(t=>t.tier+':'+t.slot)).size,10);assert.equal(nodes.filter(t=>t.parents.length).length,2);for(const t of nodes)for(const id of t.parents){const p=talentById(id);assert.equal(p.path,t.path);assert.equal(p.spec,t.spec);assert.ok(p.tier<t.tier&&Math.abs(p.slot-t.slot)<=1);}}
 assert.deepEqual([...new Set(Object.values(TALENTS).flat().map(t=>t.maxRank))].sort(),[1,2,3,5]);
});
test('ranks consume actual points, open later tiers and earn path loyalty without duplicate skills',()=>{
 const g=game(),id='dieter-brew-1',t=talentById(id);for(let i=1;i<=5;i++){assert.ok(learnTalent(g,id));assert.equal(talentRank(g.rpg.talents,id),i);assert.equal(spentPoints(g.rpg.talents),i);assert.equal(g.rpg.talents.learned.length,1);assert.equal(pathCounts(g)[t.path],i);if(i===4)assert.ok(Object.keys(pathEffects(g)).length);}
 assert.equal(learnTalent(g,id),false);assert.equal(talentEffects(g)['proc:nachfuellen'],1);assert.equal(combatStats(g)['talentProcChance:nachfuellen'],.45);
 const other=TALENTS[t.spec].find(n=>n.tier===1&&n.path!==t.path);assert.ok(learnTalent(g,other.id),'lower points in any path of this spec unlock the row');
 const neighbor=TALENTS['dieter-wall'].find(n=>n.tier===1);assert.equal(learnTalent(g,neighbor.id),false,'another spec has its own gates');
});
test('same/higher tiers cannot fund their own gate; refunds protect gates and parent rank one',()=>{
 const g=game(),root='dieter-brew-1';assert.ok(learnTalent(g,root));assert.ok(learnTalent(g,root));const child=TALENTS['dieter-brew'].find(t=>t.tier===1);assert.ok(learnTalent(g,child.id));assert.equal(unlearnTalent(g,root),false);assert.ok(unlearnTalent(g,child.id));assert.ok(unlearnTalent(g,root));
 const gated=TALENTS['dieter-brew'].find(t=>t.tier===2&&t.parents.length),parent=gated.parents[0];const same=TALENTS['dieter-brew'].filter(t=>t.tier>=2).map(t=>t.id);assert.equal(talentPrerequisites(gated,[parent,...same]),false);
 const state=talentState({spec:'dieter-brew',learned:pathBuild('dieter-brew',gated.path,8)},'dieter');g.rpg.talents=state;assert.ok(state.learned.includes(gated.id));assert.equal(unlearnTalent(g,parent),false);
});
test('authored rank one stays intact; each curve changes only its declared scalar or proc parameter',()=>{
 for(const id of Object.keys(RANKS)){const t=talentById(id),first=effectsAt(t,1),last=effectsAt(t,t.maxRank),key=Object.keys(t.effects)[0];if(key.startsWith('proc:')){assert.equal(last[key],1);const proc=PROC_RULES[key.slice(5)],chance=t.scaling.label==='Auslösechance',override=(chance?'talentProcChance:':'talentProcLeech:')+key.slice(5);assert.equal(first[override],chance?proc.chance:proc.effect.heal.damage);assert.ok(last[override]>first[override]);}else{assert.equal(first[key],t.effects[key]);assert.ok(last[key]>first[key]);}assert.ok(effectAt(t,t.maxRank).includes(String(t.scaling.values.at(-1))));}
});
test('combat proc probability and damage-based healing really use upgraded ranks',()=>{
 const g=game();for(let i=0;i<5;i++)learnTalent(g,'dieter-brew-1');g.random=()=>.4;g.player.runes=0;assert.equal(fireProcs(g,'markTick',combatStats(g)),1);assert.equal(g.player.runes,1);unlearnTalent(g,'dieter-brew-1');unlearnTalent(g,'dieter-brew-1');assert.equal(fireProcs(g,'markTick',combatStats(g)),0);
 const h=game();for(let i=0;i<3;i++)assert.ok(learnTalent(h,'dieter-brew-0'));h.player.hp=100;const before=h.player.hp;fireProcs(h,'markedHit',combatStats(h),{damage:100});assert.ok(h.player.hp-before>=9,'rank three heals at least 9% before healing modifiers');
});
test('save reload preserves ranks and class builds; old incompatible choices refund once and budgets clamp',()=>{
 const g=game();for(let i=0;i<5;i++)learnTalent(g,'dieter-brew-1');learnTalent(g,'dieter-wall-0');const loaded=new Game(world(),JSON.parse(JSON.stringify(g.save())));assert.deepEqual(loaded.rpg.talents,g.rpg.talents);assert.equal(spentPoints(loaded.rpg.talents),6);assert.ok(changeSpec(loaded,'dieter-wall'));assert.equal(talentRank(loaded.rpg.talents,'dieter-brew-1'),5);assert.ok(resetTalents(loaded));assert.deepEqual(loaded.rpg.talents.ranks,{});
 const legacy=talentState({spec:'dieter-wall',learned:['dieter-wall-0','dieter-wall-29']},'dieter');assert.deepEqual(legacy.learned,['dieter-wall-0']);assert.equal(legacy.refundedPoints,1);assert.deepEqual(talentState(legacy,'dieter'),legacy);
 const capped=new Game(world(),{level:5,rpg:{talents:{spec:'dieter-brew',learned:['dieter-brew-1','dieter-brew-0'],ranks:{'dieter-brew-1':5,'dieter-brew-0':3}}}});assert.equal(spentPoints(capped.rpg.talents),talentPoints(capped));
 const all=talentState({spec:'dieter-wall',learned:Object.values(TALENTS).flat().map(t=>t.id),ranks:{'dieter-wall-5':999}},'dieter');assert.ok(spentPoints(all)<=talentPoints(g));assert.ok(all.learned.every(id=>id.startsWith('dieter-')));
});
test('combat/death restrictions remain and rendered tree has ranks but no visible talent names',()=>{
 const g=game();g.player.inCombat=1;assert.equal(learnTalent(g,'dieter-brew-1'),false);g.player.inCombat=0;learnTalent(g,'dieter-brew-1');g.dead=true;assert.equal(unlearnTalent(g,'dieter-brew-1'),false);g.dead=false;viewTalentTree('dieter-brew');const html=talentsPanel(g),board=html.slice(html.indexOf('class="tt-board'),html.indexOf('class="tt-bonuses'));
 assert.equal((board.match(/data-talent="/g)||[]).length,10);assert.equal((html.match(/role="tab"/g)||[]).length,3);assert.ok(!board.replace(/<[^>]+>/g,'').includes(talentById('dieter-brew-1').name));const tip=talentTooltip(g,'dieter-brew-1');assert.ok(tip.includes('25 %')&&tip.includes('30 %')&&tip.includes('Rang 1/5'));
});
