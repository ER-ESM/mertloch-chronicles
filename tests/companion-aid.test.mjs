import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {spawnArena} from '../arena.js';
import {selectCompanionAid,companionAid,tickCompanions,tickEnemyOnCompanion} from '../companions.js';
import {selectUnitAt,syncFriend,friendUnit,friendPanel} from '../target-ui.js';
import {tickCasting} from '../auto-combat.js';
import {tickClass} from '../class-mechanics.js';
import {combatStats} from '../rpg.js';
import {meterReport} from '../combat-meter.js';
import {createNetSocial} from '../net-social.js';

function fixture(classId='baerbel'){
 const world={id:'aid-test',seed:1,spawn:{x:0,y:0},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]};
 const g=new Game(world,{classId,level:10});g.random=()=>.5;g.skills.find(s=>s.id==='heal').castTime=0;g.toast=t=>g.lastToast=t;
 for(const id of ['merc-hopfen-horst','merc-radler-rita']){g.hireCompanion(id,{free:true});Object.assign(g.companions.at(-1),{x:80+g.companions.length*80,y:0,order:'stay',stance:'passive'});}
 const [e]=spawnArena(g,{kind:'wolf'});Object.assign(e,{x:0,y:150,hp:10000,maxHp:10000});g.events=[];g.player.hp=g.player.maxHp;
 const [c,other]=g.companions;c.hp-=200;other.hp-=200;
 return {g,c,other,e};
}

test('world and party selection keep an independent aid target without interrupting combat',()=>{
 const {g,c,e}=fixture();g.autoAttack.enabled=true;
 assert.equal(selectUnitAt(g,c.x,c.y-10).kind,'companion');assert.equal(companionAid(g),c);
 assert.equal(g.target,e);assert.equal(g.autoAttack.enabled,true);syncFriend(g);assert.equal(friendUnit(g).ref,c);
 const panel=friendPanel(g,friendUnit(g));assert.equal(panel.hpText,Math.ceil(c.hp)+' / '+c.maxHp);assert.equal(panel.disposition,'party');
 selectUnitAt(g,e.x,e.y-10);assert.equal(companionAid(g),c);assert.equal(g.target,e);
 selectCompanionAid(g,c.id,{toggle:true});assert.equal(companionAid(g),null);
});

test('a healthy player can heal the selected companion; meter attributes effective healing to the player',()=>{
 for(const classId of ['dieter','baerbel','kevin']){
  const {g,c,other}=fixture(classId),hp=c.hp,untouched=other.hp;selectCompanionAid(g,c.id);
  assert.equal(g.action('heal'),true);assert.ok(c.hp>hp);assert.equal(g.player.hp,g.player.maxHp);assert.equal(other.hp,untouched);
  assert.ok(g.cooldowns.heal>0);const report=meterReport(g,'current','healing');assert.equal(report.total,c.hp-hp);assert.equal(report.actors.length,1);assert.equal(report.actors[0].id,classId);
  assert.ok(g.events.some(e=>e.type==='combat'&&e.actor===c.id&&e.kind==='heal'));assert.ok(g.fx.some(e=>e.kind==='heal'&&e.companion===c.id));
 }
});

test('down, out-of-range and obstructed aid targets reject healing and buffs without spending resources',()=>{
 for(const mutate of [({c})=>{c.state='down';c.hp=0;},({c})=>{c.x=1000;},({g})=>{g.world.lineClear=()=>false;}]){
  const f=fixture(),{g,c}=f;selectCompanionAid(g,c.id);mutate(f);
  for(const id of ['heal','buff']){const before={hp:c.hp,energy:g.player.energy,gcd:g.gcd,cd:g.cooldowns[id]};assert.equal(g.action(id),false);assert.deepEqual({hp:c.hp,energy:g.player.energy,gcd:g.gcd,cd:g.cooldowns[id]},before);assert.ok(g.lastToast);}
 }
});

test('cast completion retains the original ally; losing it does not consume the heal',()=>{
 for(const lost of [false,true]){
  const {g,c,other}=fixture();g.skills.find(s=>s.id==='heal').castTime=.2;selectCompanionAid(g,c.id);
  const hp=c.hp,otherHp=other.hp;assert.equal(g.action('heal'),true);selectCompanionAid(g,other.id);
  if(lost)g.dismissCompanion(c.id);tickCasting(g,.3);
  assert.equal(other.hp,otherHp);assert.equal(companionAid(g),other);
  if(lost){assert.equal(g.cooldowns.heal,0);assert.equal(c.hp,hp);}else assert.ok(c.hp>hp);
 }
});

test('shield buffs protect the selected companion and expire; healing zones also heal unselected allies',()=>{
 const {g,c,other,e}=fixture('kevin');selectCompanionAid(g,c.id);assert.equal(g.action('buff'),true);assert.ok(c.aidBuff.shield>0);
 Object.assign(e,{x:c.x+5,y:c.y,autoTimer:0,attackTimer:99,damage:1,autoAttack:{range:40,speed:2,min:20,max:20}});
 const hp=c.hp,shield=c.aidBuff.shield;tickEnemyOnCompanion(g,e,c,.01);assert.equal(c.hp,hp);assert.equal(c.aidBuff.shield,shield-20);
 c.aidBuff.remaining=.01;tickCompanions(g,.05);assert.equal(c.aidBuff,null);
 const near=other.hp;g.fields=[{kind:'keg',x:other.x,y:other.y,radius:45,remaining:3,tick:0,power:24}];tickClass(g,.05,combatStats(g));assert.ok(other.hp>near);assert.equal(c.hp,hp);
});

test('human and companion aid are mutually exclusive; self-selection and dismissal remove companion aid',()=>{
 const {g,c}=fixture(),hooks={},sent=[];g.netParty=hooks;
 const social=createNetSocial({game:()=>g,me:()=>g.member.name,send:m=>sent.push(m),others:()=>[{name:'Eddi',x:0,y:0,party:true}],hooks});
 social.setFriend('Eddi');selectCompanionAid(g,c.id);assert.equal(hooks.friend(),null);
 social.setFriend('Eddi');assert.equal(companionAid(g),null);const hp=c.hp;assert.equal(g.action('heal'),true);assert.equal(c.hp,hp);assert.equal(sent.at(-1).to,'Eddi');
 selectCompanionAid(g,c.id);selectCompanionAid(g,null);assert.equal(companionAid(g),null);assert.equal(hooks.friend(),null);
 selectCompanionAid(g,c.id);g.dismissCompanion(c.id);assert.equal(g.companionAidId,null);assert.equal(g.friend,null);
});

test('healing an ally outside combat does not open the meter or resurrect a downed companion',()=>{
 const {g,c}=fixture();g.enemies=[];g.target=null;g.player.inCombat=0;c.inCombat=0;selectCompanionAid(g,c.id);
 assert.equal(g.action('heal'),true);assert.equal(g.meter.current,null);
});
