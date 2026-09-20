import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tickAuto,tickCasting} from '../auto-combat.js';
import {combatStats} from '../rpg.js';
import {changeSpec,learnTalent,TALENTS} from '../talents.js';
import {procCount,procGlow} from '../procs.js';
import {modifyHit} from '../class-mechanics.js';
import {PROC_RULES,validateContent} from '../content/index.js';
import {drawTreeOcclusion} from '../world-presence.js';

const arena=()=>({id:'integration',seed:1,spawn:{x:0,y:0},npc:{x:0,y:0},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function setup(spec='dieter-wall'){
 const g=new Game(arena(),{classId:spec.split('-')[0],level:11});g.random=()=>.99;
 assert.ok(changeSpec(g,spec));for(const t of TALENTS[spec].slice(0,10))assert.ok(learnTalent(g,t.id));
 const e=makeEnemy({x:25,y:0},1,{hp:100000,behavior:'neutral',roamWait:100,attackTimer:100});g.enemies=[e];g.target=e;
 return {g,e};
}
function cast(g,id,point){g.gcd=0;g.cooldowns[id]=0;g.player.energy=50;assert.ok(g.action(id,point),id);if(g.casting)tickCasting(g,g.casting.total);}
const fired=(g,id)=>g.events.filter(e=>e.type==='proc'&&e.id===id).length;

test('selection is passive, offensive skills start autos; range, walls and target death gate hits',()=>{
 const {g,e}=setup();g.target=null;assert.ok(g.selectAt(e.x,e.y-10));tickAuto(g,1);assert.equal(e.hp,e.maxHp);assert.equal(g.autoAttack.enabled,false);
 cast(g,'strike');assert.equal(g.autoAttack.enabled,true);const hp=e.hp;
 e.x=100;tickAuto(g,5);assert.equal(e.hp,hp);e.x=25;g.world.lineClear=()=>false;tickAuto(g,5);assert.equal(e.hp,hp);
 g.world.lineClear=()=>true;tickAuto(g,.1);assert.ok(e.hp<hp);g.damage(e,1000000,'Kelle');assert.equal(g.autoAttack.enabled,false);
 const next=makeEnemy({x:30,y:0},2,{hp:10000});g.enemies.push(next);g.selectAt(30,-10);tickAuto(g,5);assert.equal(next.hp,next.maxHp);
});

test('offensive ground casts start autos after placement, while healing zones stay passive',()=>{
 const {g,e}=setup('dieter-brew');assert.equal(g.action('ground'),false);assert.equal(g.autoAttack.enabled,false);
 cast(g,'ground',{x:e.x,y:e.y});assert.equal(g.autoAttack.enabled,false,'Anstich (Fass) ist keine Offensive');g.stopAuto();cast(g,'keg',{x:0,y:0});assert.equal(g.autoAttack.enabled,false);const wall=setup('dieter-wall').g;wall.player.energy=100;cast(wall,'ground',{x:wall.target.x,y:wall.target.y});assert.equal(wall.autoAttack.enabled,true,'Böller startet den Autoangriff');
});

test('Deckelwirtschaft counts successful strikes only, shows a named HUD counter and fires every third',()=>{
 const {g,e}=setup();
 for(let i=1;i<=6;i++){
  cast(g,'strike');assert.equal(procCount(g,'deckelwirtschaft'),i);assert.equal(fired(g,'deckelwirtschaft'),Math.floor(i/3));
  const chip=g.activeBuffs().find(b=>b.id==='deckelwirtschaft');
  if(i%3){assert.equal(chip.count,i%3);assert.equal(chip.name,'Deckelwirtschaft');}else assert.equal(chip,undefined);
 }
 g.gcd=0;g.cooldowns.strike=0;e.x=500;assert.equal(g.action('strike'),false);assert.equal(procCount(g,'deckelwirtschaft'),6);
 g.resetClassState();assert.equal(procCount(g,'deckelwirtschaft'),0);
});

test('Frisch gewischt empowers exactly every second direct heal',()=>{
 const {g}=setup('baerbel-care');
 for(let i=1;i<=4;i++){cast(g,'heal');assert.equal(fired(g,'frisch-gewischt'),Math.floor(i/2));assert.equal(procCount(g,'frisch-gewischt'),i);}
});

for(const [spec,id] of [['dieter-brew','ruecklaufleitung'],['baerbel-feedback','provision-vom-schmerz']])test(id+' heals from actual marked damage, including the lethal hit, and never from unmarked hits',()=>{
 const {g,e}=setup(spec);g.player.hp=100;g.damage(e,100,'Kelle');assert.equal(fired(g,id),0);
 g.player.hp=100;e.mark=10;const before=g.player.hp,dealt=g.damage(e,100,'Kelle'),cs=combatStats(g),factor=1+cs.healPower+(cs.healBonus||0)+cs.mastery*.4;
 const base=(spec==='dieter-brew'?.06:.15)+(cs.markedLeech||0);
 assert.equal(g.player.hp-before,Math.round(dealt*base*factor)+Math.round(dealt*PROC_RULES[id].effect.heal.damage*factor));assert.equal(fired(g,id),1);
 g.player.hp=100;e.hp=10;g.damage(e,100000,'Kelle');assert.equal(fired(g,id),2);assert.ok(g.player.hp<110,'overkill damage cannot inflate healing');
});

test('beat and own live keg zone dispatch their talent rules once per matching strike',()=>{
 const {g}=setup('baerbel-stage');g.time=10;g.lastStrike=8;cast(g,'strike');assert.equal(fired(g,'perfekter-upload'),0);
 g.time=11;cast(g,'strike');assert.equal(fired(g,'perfekter-upload'),1);assert.equal(g.player.energy,81);
 const {g:h}=setup('dieter-brew');h.fields=[{kind:'keg',x:0,y:0,radius:50,remaining:5}];cast(h,'strike');assert.equal(fired(h,'letzter-ausschank'),1);
 h.fields[0].remaining=0;cast(h,'strike');assert.equal(fired(h,'letzter-ausschank'),1);
 h.fields[0].remaining=5;h.fields[0].x=500;cast(h,'strike');assert.equal(fired(h,'letzter-ausschank'),1);
});

for(const [spec,id,action,affected,seconds] of [
 ['dieter-brawl','hinterher','dash','throw',3],['dieter-brew','gut-gekuehlt','parry','heal',3],
 ['baerbel-feedback','kurzer-hausbesuch','heal','mark',3],['kevin-fuse','doppelte-sicherung','heal','ground',3],
 ['kevin-hunt','nachladen-im-rennen','dash','throw',3],['kevin-hunt','schritt-voraus','interrupt','dash',2]
])test(id+' reduces the cooldown on its real gameplay trigger without granting a free skill',()=>{
 const {g,e}=setup(spec);g.cooldowns[affected]=10;
 if(action==='interrupt')e.cast={interruptible:true};cast(g,action);
 if(action==='parry')g.hitPlayer(e,10);
 assert.equal(fired(g,id),1);assert.equal(g.cooldowns[affected],10-seconds);assert.equal(g.procState.free[affected],undefined);
 assert.equal(procGlow(g,affected),false,'partially reduced cooldown is not announced as ready');
 if(action==='interrupt'){cast(g,action);assert.equal(fired(g,id),1,'no proc without interrupted cast');}
});

test('class passives drive runtime skill values, damage reduction, parry, beat and interrupt bonuses',()=>{
 const {g,e}=setup();g.member={...g.member,passives:{...g.member.passives,strikeCd:2.7,dashCd:8,damageTaken:.5,parryHeal:17}};g.refreshStats();
 assert.equal(g.skills.find(s=>s.id==='strike').cd,2.7);assert.equal(g.skills.find(s=>s.id==='dash').cd,8);g.classState.guard=0;assert.equal(modifyHit(g,100,combatStats(g)),50);
 g.player.hp=100;g.player.parry=1;g.hitPlayer(e,10);assert.equal(g.player.hp,117);
 const {g:a}=setup('baerbel-stage');a.member={...a.member,passives:{...a.member.passives,beatWindow:[2,3],beatRunes:3}};a.time=10;a.lastStrike=7.5;a.player.runes=0;cast(a,'strike');assert.equal(a.player.runes,3);assert.equal(fired(a,'perfekter-upload'),1);
 const {g:k,e:ke}=setup('kevin-fuse');k.member={...k.member,passives:{strikeRange:240,strikeGain:23,dashCd:7,interruptRunes:2,interruptBurstCd:5}};k.refreshStats();
 assert.equal(k.skills.find(s=>s.id==='strike').range,240);cast(k,'strike');assert.equal(k.player.energy,73);
 k.player.runes=0;k.cooldowns.burst=10;ke.cast={interruptible:true};cast(k,'interrupt');assert.equal(k.player.runes,2);assert.equal(k.cooldowns.burst,5);
});

test('schema rejects malformed proc counters, cooldown reductions and damage healing',()=>{
 const rule=PROC_RULES.deckelwirtschaft,original=structuredClone(rule);
 try{for(const patch of [{every:1.5},{skill:'unknown'},{effect:{cdReduce:{skill:'heal',seconds:-1}}},{effect:{heal:{damage:2}}}]){
  Object.assign(rule,original,patch);assert.ok(validateContent().some(p=>p.startsWith('proc deckelwirtschaft:')));
 }}finally{Object.assign(rule,original);}
 assert.deepEqual(validateContent(),[]);
});

test('whole-tree fade covers player and target down to the trunk, respects scale and restores canvas state',()=>{
 for(const size of [.6,1,1.8]){
  const tree={x:100,y:200,size},stack=[],c={globalAlpha:.5,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();}};
  for(const focus of [[{x:100,y:199}],[{x:100,y:200-100*size}],[{x:0,y:300},{x:100,y:190}]]){
   let calls=0;drawTreeOcclusion(c,tree,focus,()=>{calls++;assert.equal(c.globalAlpha,.14);});assert.equal(calls,1);assert.equal(c.globalAlpha,.5);
  }
  for(const focus of [[{x:100,y:201}],[{x:100+56*size,y:190}],[{x:100,y:200-117*size}]])drawTreeOcclusion(c,tree,focus,()=>assert.equal(c.globalAlpha,.5));
  assert.throws(()=>drawTreeOcclusion(c,tree,[{x:100,y:199}],()=>{throw Error('draw failed');}));assert.equal(c.globalAlpha,.5);
 }
});
