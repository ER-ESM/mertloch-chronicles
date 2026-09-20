import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {tickCasting} from '../auto-combat.js';
import {Game} from '../engine.js';import {World} from '../world.js';import {makeEnemy} from '../encounters.js';import {combatStats} from '../rpg.js';import {learnTalent,changeSpec,TALENTS} from '../talents.js';import {fireProcs,procFree,procEmpowered,procGlow} from '../procs.js';import {skillStatus} from '../combat-ui.js';import {BALANCE,PROC_RULES,CLASS_LESSONS,CAST_TIMES,SPAWN_TABLES} from '../content/index.js';
const arena=()=>({id:'flow-test',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
const game=(save={level:6},classId='dieter')=>{const g=new Game(arena(),{...save,classId});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;};
const build=(g,spec)=>{g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;assert.ok(changeSpec(g,spec),'spec '+spec);for(const t of TALENTS[spec].slice(0,10))assert.ok(learnTalent(g,t.id),t.id);g.player.x=g.player.y=0;};
const enemy=(g,x=30,hp=10000)=>{const e=makeEnemy({x,y:0},g.enemies.length+1,{hp,aggro:true,ai:'combat',attackTimer:100});g.enemies.push(e);g.target=e;return e;};
const cast=(g,id,point)=>{assert.ok(g.action(id,point));if(g.casting)tickCasting(g,g.casting.total);};

test('finishers spend their original points but retain points earned by a lethal hit for every class',()=>{
 for(const classId of ['dieter','baerbel','kevin']){
  const g=game({level:11},classId),e=enemy(g,30,1);g.player.runes=3;
  cast(g,'burst');assert.equal(e.hp,0,classId);
  assert.equal(g.player.runes,BALANCE.momentum.pointsOnKill,classId+' keeps the kill reward');
  const survivor=enemy(g);g.gcd=0;g.cooldowns.burst=0;
  cast(g,'burst');assert.ok(survivor.hp>0);
  assert.equal(g.player.runes,0,classId+' spends points without a kill');
 }
});

test('finisher splash kills accumulate points up to the cap and preserve kill talent rewards',()=>{
 const g=game({level:11},'baerbel');for(let i=0;i<4;i++)enemy(g,30+i,1);g.player.runes=3;
 cast(g,'burst');assert.ok(g.enemies.every(e=>e.hp===0));assert.equal(g.player.runes,3);
 const h=game({level:11},'kevin');build(h,'kevin-hunt');enemy(h,30,1);h.player.runes=3;
 cast(h,'burst');assert.equal(h.player.runes,BALANCE.momentum.pointsOnKill+PROC_RULES.beutefieber.effect.points);
});

test('reset procs highlight their declared skills until the window expires',()=>{
 for(const [id,classId] of [['tresenkante','dieter'],['kurzschluss','kevin'],['zugabe-rhythmus','baerbel'],['beutefieber','kevin']]){
  const g=game({level:11},classId),rule=PROC_RULES[id];enemy(g);g.random=()=>.1;g.cooldowns[rule.effect.reset]=20;
  assert.equal(fireProcs(g,rule.trigger,{['proc:'+id]:1}),1);
  assert.equal(g.cooldowns[rule.effect.reset],0);assert.ok(procGlow(g,rule.glow),id);
  assert.ok(skillStatus(g,rule.glow).ideal,id+' highlights a usable skill');
  g.time=rule.window+.01;g.tick(.05);assert.equal(procGlow(g,rule.glow),false,id+' expires');
 }
});

test('reset proc glow survives rejected actions and is consumed only by a successful use',()=>{
 const g=game({level:11});g.random=()=>.1;fireProcs(g,'crit',{'proc:tresenkante':1});
 g.paused=true;assert.equal(g.action('parry'),false);assert.ok(procGlow(g,'parry'));
 g.paused=false;assert.ok(g.action('dash'));assert.ok(procGlow(g,'parry'),'another skill does not consume it');
 assert.ok(g.action('parry'));assert.equal(procGlow(g,'parry'),false);
});

test('a ground reset keeps glowing while aiming and stops after placement',()=>{
 const g=game({level:11},'kevin');g.random=()=>.1;fireProcs(g,'crit',{'proc:kurzschluss':1});
 assert.equal(g.action('ground'),false);assert.ok(procGlow(g,'ground'));
 assert.equal(g.action('ground',{x:9999,y:0}),false);assert.ok(procGlow(g,'ground'));
 assert.ok(g.action('ground',{x:30,y:0}));assert.ok(procGlow(g,'ground'),'starting a cast does not consume it');
 tickCasting(g,g.casting.total);assert.equal(procGlow(g,'ground'),false);
});
test('the core rotation is complete on level 4 for every figure: build, mark, finisher, answer',()=>{for(const id of ['dieter','baerbel','kevin']){const L=CLASS_LESSONS[id];assert.equal(L.strike,1);assert.ok(L.mark<=3,id+' mark');assert.ok(L.burst<=4,id+' burst');assert.ok(L.interrupt<=4,id+' interrupt');assert.ok(L.parry<=7);}assert.equal(CAST_TIMES.baerbel.mark,undefined,'mark casts while moving');assert.equal(CAST_TIMES.kevin.mark,undefined);});
test('a kill gives momentum: energy, a point, mark reset, haste stacks that expire',()=>{const g=game();g.settings.autoLoot=false;/* Fundstücke würden sonst angelegt und das Tempo verschieben */const e=enemy(g,30,10);g.player.energy=20;g.player.runes=0;g.cooldowns.mark=5;const haste=combatStats(g).haste;g.damage(e,999,'Kelle');assert.equal(g.momentum.stacks,1);assert.ok(g.player.energy>=45);assert.equal(g.player.runes,1);assert.equal(g.cooldowns.mark,0);assert.ok(combatStats(g).haste>haste+BALANCE.momentum.hastePerStack-.001);for(let i=0;i<3;i++)g.damage(enemy(g,30,10),999,'Kelle');assert.equal(g.momentum.stacks,BALANCE.momentum.maxStacks);for(let i=0;i<200;i++)g.tick(.05);assert.equal(g.momentum.stacks,0);assert.ok(Math.abs(combatStats(g).haste-haste)<.001);});
test('energy regenerates faster in combat',()=>{const g=game();g.player.inCombat=7;g.player.energy=0;g.tick(.05);assert.ok(g.player.energy>=BALANCE.momentum.combatEnergyRegen*.05-.01);});

test('the final kill heals during the combat timeout, then returns to normal regeneration',()=>{
 const g=game(),e=enemy(g,30,10);g.player.hp=100;g.damage(e,999,'Kelle');
 assert.ok(g.player.inCombat>BALANCE.momentum.restSeconds);
 g.tick(.05);
 assert.ok(g.player.inCombat>0,'the combat timeout remains intact');
 assert.equal(g.player.hp,100+BALANCE.momentum.restRegen*.05);
 while(g.time<BALANCE.momentum.restSeconds+.1)g.tick(.05);
 const expired=g.player.hp;g.tick(.05);
 assert.equal(g.player.hp,expired,'the kill bonus expires even while the combat timeout runs');
 while(g.player.inCombat>0)g.tick(.05);
 const rested=g.player.hp;g.tick(.05);
 assert.ok(Math.abs(g.player.hp-rested-BALANCE.player.outOfCombatRegen*.05)<1e-6);
});

test('a kill cannot heal while another enemy is fighting; the final kill renews the window',()=>{
 const g=game(),first=enemy(g,30,10),last=enemy(g,40,10);last.stun=100;
 g.player.hp=100;g.damage(first,999,'Kelle');
 for(let i=0;i<100;i++)g.tick(.05);
 assert.equal(g.player.hp,100,'no rest healing during an ongoing fight');
 g.damage(last,999,'Kelle');g.tick(.05);
 assert.equal(g.player.hp,100+BALANCE.momentum.restRegen*.05);
});

test('post-kill rest does not overfill health or activate without a kill',()=>{
 const g=game();g.settings.autoLoot=false;g.player.hp=g.player.maxHp-1;g.damage(enemy(g,30,10),999,'Kelle');g.tick(.05);
 assert.equal(g.player.hp,g.player.maxHp);
 const fresh=game();fresh.player.hp=100;fresh.player.inCombat=7;fresh.tick(.05);
 assert.equal(fresh.player.hp,100,'a combat timeout alone does not grant kill healing');
});
test('every rule in content has a talent; proc talents fire on their trigger and respect chance',()=>{const used=new Set(Object.values(TALENTS).flat().flatMap(t=>Object.keys(t.effects).filter(k=>k.startsWith('proc:')).map(k=>k.slice(5))));for(const id of Object.keys(PROC_RULES))assert.ok(used.has(id),'rule without talent: '+id);const g=game({level:11},'dieter');build(g,'dieter-brawl');const cs=combatStats(g);assert.ok(cs['proc:kellenwut']);g.random=()=>.9;assert.equal(fireProcs(g,'crit',cs),0,'35 % chance misses at 0.9');g.random=()=>.1;assert.equal(fireProcs(g,'crit',cs),1);assert.ok(procFree(g,'burst'));assert.ok(procGlow(g,'burst'));g.time+=7;g.tick(.05);assert.equal(procFree(g,'burst'),false,'window expires');});
test('a free proc makes the skill cost nothing once; an empower proc doubles it once; both glow on the bar',()=>{const g=game({level:11},'dieter');build(g,'dieter-brawl');const e=enemy(g);g.player.runes=3;g.player.energy=100;const cs=combatStats(g);g.random=()=>.1;fireProcs(g,'crit',cs);assert.ok(skillStatus(g,'burst').ideal,'burst glows');g.gcd=0;g.cooldowns.burst=0;assert.ok(g.action('burst'));assert.equal(g.player.energy,100,'free burst');assert.equal(procFree(g,'burst'),false,'consumed');g.gcd=0;g.cooldowns.strike=0;g.random=()=>.5;g.player.runes=0;const before=e.hp;g.action('strike');const normal=before-e.hp;g.gcd=0;g.cooldowns.strike=0;fireProcs(g,'kill',combatStats(g));assert.ok(procEmpowered(g,'strike'));const mid=e.hp;g.action('strike');assert.ok(mid-e.hp>=normal*1.9,'empowered strike');assert.equal(procEmpowered(g,'strike'),false);});
test('parry, interrupt, heal and dodge all reach the proc system',()=>{const g=game({level:11},'kevin');build(g,'kevin-iron');const e=enemy(g);g.player.parry=1;g.player.parryCharges=1;g.hitPlayer(e,50);assert.ok(procFree(g,'burst'),'Dampfdruck after parry');const h=game({level:11},'kevin');build(h,'kevin-hunt');const f=enemy(h);h.player.invulnerable=.3;h.hitPlayer(f,50);assert.ok(procEmpowered(h,'throw'),'Fangschuss after dodge');const a=game({level:11},'baerbel');build(a,'baerbel-feedback');const b=enemy(a,40);b.cast={interruptible:true,remaining:2,total:2};a.gcd=0;assert.ok(a.action('interrupt'));assert.ok(procFree(a,'burst'),'Mehrwegflasche after interrupt');const d=game({level:11},'dieter');build(d,'dieter-brew');d.player.hp=100;d.cooldowns.mark=4;d.gcd=0;assert.ok(d.action('heal'));assert.equal(d.cooldowns.mark,0,'Zapfhahn auf resets mark');assert.ok(procFree(d,'strike'));});
test('outskirts habitats spawn companion groups and a companion joins the fight after two seconds',()=>{const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'))),g=new Game(world),C=320;let groups=0,near=0;for(let cy=0;cy*C<world.height;cy++)for(let cx=0;cx*C<world.width;cx++)for(const e of g.ecology.buildCell(cx,cy)){if(e.companion){groups++;if(Math.hypot(e.home.x-world.spawn.x,e.home.y-world.spawn.y)<=SPAWN_TABLES.tierDistance)near++;}}assert.ok(groups>=5,'companions spawn: '+groups);assert.equal(near,0,'no groups in the village');
 const h=game();const a=makeEnemy({x:60,y:0},1,{hp:1000,aggro:true,ai:'combat',attackTimer:100}),b=makeEnemy({x:120,y:0},2,{hp:1000,attackTimer:100,aggroRange:10});h.enemies=[a,b];h.target=a;h.player.inCombat=7;h.tick(.05);assert.equal(b.aggro,false);assert.ok(b.joinAt>h.time);for(let i=0;i<50;i++)h.tick(.05);assert.ok(b.aggro,'companion joined');});
