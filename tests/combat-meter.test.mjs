import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {spawnArena,clearArena} from '../arena.js';
import {healPlayer,tickClass} from '../class-mechanics.js';
import {fireProcs} from '../procs.js';
import {addItem,combatStats,useItem} from '../rpg.js';
import {beginMeterCombat,recordMeterDamage,recordMeterHealing,finishMeterCombat,tickCombatMeter,resetCombatMeter,meterReport} from '../combat-meter.js';

const world=()=>({id:'meter-test',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
const game=(saved={})=>{const g=new Game(world(),{level:11,...saved});g.random=()=>.5;g.player.x=g.player.y=0;return g;};
const enemy={name:'Testgegner',arena:true};
const event=(g,damage=100,label='Kelle',critical=false)=>{g.player.inCombat=7;recordMeterDamage(g,enemy,damage,damage,label,critical);};

test('actual engine damage is counted once, excludes overkill, and uses the real class skill name',()=>{
 const g=game(),[e]=spawnArena(g,{dummy:true});e.hp=25;g.random=()=>0;
 g.damage(e,1000,'Kelle');const r=meterReport(g),row=r.actors[0].abilities[0];
 assert.equal(r.total,25);assert.equal(g.stats.damage,25);assert.ok(r.excess>0);assert.equal(row.crit,1);assert.equal(row.name,g.skills.find(s=>s.id==='strike').name);
 assert.equal(row.hits,1);g.damage(e,1000,'Kelle');assert.equal(meterReport(g).total,25);
});
test('DPS/HPS use combat time, remain frozen after the fight, and total time excludes gaps',()=>{
 const g=game();event(g);g.time=5;recordMeterHealing(g,60,40,'heal');
 assert.equal(meterReport(g).rate,20);assert.equal(meterReport(g,'current','healing').rate,8);
 g.player.inCombat=0;tickCombatMeter(g);g.time=100;
 assert.equal(meterReport(g).seconds,5);assert.equal(meterReport(g).rate,20);
 event(g,50);g.time=105;finishMeterCombat(g);
 assert.equal(meterReport(g,'overall').seconds,10);assert.equal(meterReport(g,'overall').rate,15);
 assert.equal(meterReport(g,'1').total,100);assert.equal(meterReport(g).total,50);
});
test('direct healing tracks effective values and overheal without counting out-of-combat recovery',()=>{
 const g=game(),cs=combatStats(g);g.player.hp-=10;
 healPlayer(g,100,cs,true);assert.equal(meterReport(g,'overall','healing').total,0);assert.equal(g.meter.current,null);
 event(g);g.player.hp-=10;healPlayer(g,100,cs,true);
 const r=meterReport(g,'current','healing');assert.equal(r.total,10);assert.ok(r.excess>0);assert.equal(r.actors[0].abilities[0].id,'heal');
 const previous=r.excess;healPlayer(g,100,cs,true);assert.equal(meterReport(g,'current','healing').total,10);assert.ok(meterReport(g,'current','healing').excess>previous);
});
test('healing over time, healing zones, food and proc healing retain separate sources',()=>{
 const g=game(),cs=combatStats(g);event(g);g.player.hp=10;
 Object.assign(g.classState,{hot:6,hotPower:10,hotTick:0});g.fields=[{kind:'keg',x:0,y:0,radius:100,remaining:4,tick:0,power:24}];tickClass(g,.05,cs);
 addItem(g.rpg,'brezel',1);assert.equal(useItem(g,'brezel'),true);
 fireProcs(g,'markedHit',{...cs,'proc:ruecklaufleitung':1},{damage:100});
 const r=meterReport(g,'current','healing');assert.deepEqual(r.actors[0].abilities.map(s=>s.id).sort(),['hot','item:brezel','keg','proc:ruecklaufleitung']);
 assert.equal(r.total,g.player.hp-10);assert.match(r.actors[0].abilities.find(s=>s.id==='proc:ruecklaufleitung').name,/Rücklauf/i);
});
test('marked-hit life steal and passive parry healing are counted at their actual applied values',()=>{
 const g=game({classId:'baerbel',rpg:{talents:{spec:'baerbel-feedback',learned:[]}}}),[e]=spawnArena(g,{dummy:true});
 g.rpg.talents.spec='baerbel-feedback';g.refreshStats();g.player.hp=100;e.mark=5;g.damage(e,100,'Kelle');
 assert.equal(meterReport(g,'current','healing').total,g.player.hp-100);assert.ok(g.player.hp>100);
 const d=game(),[attacker]=spawnArena(d,{dummy:true});d.player.hp=100;d.player.parry=1;d.player.parryCharges=1;d.hitPlayer(attacker,50);
 const r=meterReport(d,'current','healing');assert.equal(r.total,35);assert.equal(r.actors[0].abilities[0].id,'parryHeal');
});
test('different clan figures remain separate in the session total and ability variants share one row',()=>{
 const g=game();event(g,20,'Entladung');event(g,30,'RESONANZ');g.time=2;finishMeterCombat(g);
 g.player.inCombat=0;Object.assign(g.player,g.world.spawn);assert.equal(g.switchMember('baerbel'),true);
 event(g,40,'Kelle');event(g,30,'Markierung');
 const rows=meterReport(g,'overall').actors;assert.equal(rows.length,2);
 const dieter=rows.find(a=>a.id==='dieter');assert.equal(dieter.abilities.length,1);assert.equal(dieter.abilities[0].amount,50);assert.equal(dieter.abilities[0].hits,2);
 assert.equal(rows.find(a=>a.id==='baerbel').abilities.length,2);
});
test('history is bounded while overall keeps older fights; reset clears only meter data',()=>{
 const g=game();for(let i=0;i<15;i++){event(g);g.time+=2;finishMeterCombat(g);g.time+=20;}
 assert.equal(g.meter.history.length,10);assert.equal(g.meter.history[0].id,15);assert.equal(g.meter.history.at(-1).id,6);
 assert.equal(meterReport(g,'overall').total,1500);assert.equal(meterReport(g,'overall').seconds,30);
 const saved=g.save(),hp=g.player.hp;resetCombatMeter(g);assert.equal(g.meter.history.length,0);assert.equal(meterReport(g,'overall').total,0);assert.equal(g.player.hp,hp);assert.deepEqual(g.save(),saved);
 assert.equal(new Game(world(),saved).meter.history.length,0);assert.ok(!('meter' in saved));
});
test('death finishes the segment and respawn/level-up do not add healing',()=>{
 const g=game(),[e]=spawnArena(g,{dummy:true});g.damage(e,40,'Kelle');g.time=4;g.player.hp=1;g.hitPlayer(e,100000);
 assert.ok(g.dead);assert.equal(g.meter.current,null);assert.equal(g.meter.history.length,1);assert.equal(meterReport(g).seconds,4);
 g.respawn();g.gainXp(999);assert.equal(meterReport(g,'overall','healing').total,0);
});
test('empty pulls and invalid values do not create bogus rows or divide by zero',()=>{
 const g=game();beginMeterCombat(g,enemy);finishMeterCombat(g);assert.equal(g.meter.history.length,0);
 recordMeterDamage(g,enemy,NaN,NaN,'Kelle');g.player.inCombat=7;recordMeterHealing(g,Infinity,20);assert.equal(meterReport(g,'overall','healing').total,0);
 event(g,50);assert.equal(meterReport(g).rate,50);assert.equal(meterReport(g).seconds,1);
});
test('pausing the game does not increase elapsed combat time',()=>{
 const g=game();event(g);g.time=3;g.paused=true;g.tick(.05);assert.equal(meterReport(g).seconds,3);
});


test('DPS and healing retain the character name in current, overall and finished fights without renaming companions',()=>{
 for(const classId of ['dieter','baerbel','kevin']){
  const g=game({classId});g.hero={id:'hero-test',name:'Pfandpirat'};event(g);recordMeterHealing(g,60,40);
  const ally={id:'companion:test',name:'Kumpel Karl',color:'#ffffff'};
  recordMeterDamage(g,enemy,20,20,'Kelle',false,ally);recordMeterHealing(g,20,10,'heal',ally);
  const check=selection=>{for(const kind of ['damage','healing']){const rows=meterReport(g,selection,kind).actors;assert.equal(rows.find(a=>a.id===classId).name,'Pfandpirat');assert.equal(rows.find(a=>a.id===ally.id).name,'Kumpel Karl');}};
  check('current');check('overall');g.time=3;finishMeterCombat(g);check('1');check('overall');
 }
 const legacy=game();event(legacy);assert.equal(meterReport(legacy).actors[0].name,legacy.member.name);
});
