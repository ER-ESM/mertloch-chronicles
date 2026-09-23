// Ein Ziel (E-65): Söldner, Gruppenmitglied oder Gegner – nie zwei gleichzeitig. Heilung, Schutz und Buffs wirken auf
// den gewählten Freund, bei Gegner oder ohne Ziel auf den Spieler selbst.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {spawnArena} from '../arena.js';
import {tickCompanions,tickEnemyOnCompanion} from '../companions.js';
import {selectFriend,selectEnemy,clearSelection,selectedCompanion} from '../help-target.js';
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

test('one target: selecting a companion drops the enemy and stops auto-attack; selecting the enemy drops the companion',()=>{
 const {g,c,e}=fixture();g.autoAttack.enabled=true;assert.equal(g.target,e);
 assert.equal(selectUnitAt(g,c.x,c.y-10).kind,'companion');assert.equal(selectedCompanion(g),c);
 assert.equal(g.target,null,'kein Gegner mehr gewählt');assert.equal(g.autoAttack.enabled,false,'Autoangriff stoppt wie beim Abwählen');
 syncFriend(g);assert.equal(friendUnit(g).ref,c);
 const panel=friendPanel(g,friendUnit(g));assert.equal(panel.hpText,Math.ceil(c.hp)+' / '+c.maxHp);assert.equal(panel.disposition,'party');assert.doesNotMatch(panel.effect,/hilfs\s*ziel/i);
 selectUnitAt(g,e.x,e.y-10);assert.equal(g.target,e);assert.equal(selectedCompanion(g),null,'Gegner löst den Söldner ab');
 selectFriend(g,'companion',c);g.selectNext();assert.ok(g.target);assert.equal(g.friend,null,'Tab wählt einen Gegner und löst den Freund ab');
 selectFriend(g,'companion',c);g.noteAttacker(e,5,true);assert.equal(selectedCompanion(g),c,'ein Angreifer lenkt den Heiler nicht vom Söldner ab');assert.equal(g.target,null);
 selectFriend(g,'npc',g.world.npc);g.noteAttacker(e,5,true);assert.equal(g.target,e,'NPC gewählt: der Angreifer wird Ziel');assert.equal(g.friend,null);
 selectFriend(g,'companion',c);assert.equal(clearSelection(g),true);assert.equal(g.friend,null);assert.equal(g.target,null);assert.equal(clearSelection(g),false);
});

test('healing goes to the selected companion only; the meter credits the player',()=>{
 for(const classId of ['dieter','baerbel','kevin']){
  const {g,c,other}=fixture(classId),hp=c.hp,untouched=other.hp;g.player.hp=g.player.maxHp-50;const own=g.player.hp;selectFriend(g,'companion',c);
  assert.equal(g.action('heal'),true);assert.ok(c.hp>hp);assert.equal(g.player.hp,own,'kein zweites Ziel: du selbst bleibst ungeheilt');assert.equal(other.hp,untouched);
  assert.ok(g.cooldowns.heal>0);const report=meterReport(g,'current','healing');assert.equal(report.total,c.hp-hp);assert.equal(report.actors.length,1);assert.equal(report.actors[0].id,classId);
  assert.ok(g.events.some(e=>e.type==='combat'&&e.actor===c.id&&e.kind==='heal'));assert.ok(g.fx.some(e=>e.kind==='heal'&&e.companion===c.id));
 }
});

test('with an enemy or nothing selected, healing and protection work on yourself',()=>{
 for(const pick of ['enemy','nothing']){
  const {g,c,e}=fixture('kevin'),hp=c.hp;g.player.hp=g.player.maxHp-150;
  if(pick==='enemy')selectEnemy(g,e);else clearSelection(g);
  const own=g.player.hp;assert.equal(g.action('heal'),true);assert.ok(g.player.hp>own,pick+': heilt dich');assert.equal(c.hp,hp,pick+': Söldner bleibt ungeheilt');
  g.gcd=0;assert.equal(g.action('buff'),true);assert.ok(g.buffs.remaining>0);assert.equal(c.aidBuff,undefined);
 }
 const {g}=fixture();g.player.hp=g.player.maxHp;clearSelection(g);assert.equal(g.action('heal'),false);assert.match(g.lastToast,/vollständig/);
});

test('a selected, unhurt companion is not healed; a friendly NPC counts as no help target',()=>{
 const {g,c}=fixture('kevin');c.hp=c.maxHp;g.player.hp=g.player.maxHp-100;selectFriend(g,'companion',c);
 assert.equal(g.action('heal'),false);assert.match(g.lastToast,/unverletzt/);assert.equal(g.cooldowns.heal||0,0);
 selectFriend(g,'npc',g.world.npc);const own=g.player.hp;assert.equal(g.action('heal'),true);assert.ok(g.player.hp>own,'NPC ist kein Hilfeziel: heilt dich');
});

test('down, out-of-range and obstructed targets reject healing and buffs without spending resources',()=>{
 for(const mutate of [({c})=>{c.state='down';c.hp=0;},({c})=>{c.x=1000;},({g})=>{g.world.lineClear=()=>false;}]){
  const f=fixture(),{g,c}=f;selectFriend(g,'companion',c);mutate(f);
  for(const id of ['heal','buff']){const before={hp:c.hp,energy:g.player.energy,gcd:g.gcd,cd:g.cooldowns[id]};assert.equal(g.action(id),false);assert.deepEqual({hp:c.hp,energy:g.player.energy,gcd:g.gcd,cd:g.cooldowns[id]},before);assert.ok(g.lastToast);assert.doesNotMatch(g.lastToast,/hilfs\s*ziel/i);}
 }
});

test('cast completion retains the original ally; losing it does not consume the heal',()=>{
 for(const lost of [false,true]){
  const {g,c,other}=fixture();g.skills.find(s=>s.id==='heal').castTime=.2;selectFriend(g,'companion',c);
  const hp=c.hp,otherHp=other.hp;assert.equal(g.action('heal'),true);selectFriend(g,'companion',other);
  if(lost)g.dismissCompanion(c.id);tickCasting(g,.3);
  assert.equal(other.hp,otherHp);assert.equal(selectedCompanion(g),other);
  if(lost){assert.equal(g.cooldowns.heal,0);assert.equal(c.hp,hp);}else assert.ok(c.hp>hp);
 }
});

test('shield buffs protect the selected companion and expire; healing zones also heal unselected allies',()=>{
 const {g,c,other,e}=fixture('kevin');selectFriend(g,'companion',c);assert.equal(g.action('buff'),true);assert.ok(c.aidBuff.shield>0);assert.ok(!(g.buffs.remaining>0),'Schutz nur auf dem Ziel');
 Object.assign(e,{x:c.x+5,y:c.y,autoTimer:0,attackTimer:99,damage:1,autoAttack:{range:40,speed:2,min:20,max:20}});
 const hp=c.hp,shield=c.aidBuff.shield;tickEnemyOnCompanion(g,e,c,.01);assert.equal(c.hp,hp);assert.equal(c.aidBuff.shield,shield-20);
 c.aidBuff.remaining=.01;tickCompanions(g,.05);assert.equal(c.aidBuff,null);
 const near=other.hp;g.fields=[{kind:'keg',x:other.x,y:other.y,radius:45,remaining:3,tick:0,power:24}];tickClass(g,.05,combatStats(g));assert.ok(other.hp>near);assert.equal(c.hp,hp);
});

test('a party member is the same single target as a companion; dismissal clears a selected companion',()=>{
 const {g,c}=fixture(),hooks={},sent=[],others=[{name:'Eddi',x:0,y:0,party:true}];g.netParty=hooks;g.others=others;
 const social=createNetSocial({game:()=>g,me:()=>g.member.name,send:m=>sent.push(m),others:()=>others,hooks});
 assert.equal(social.selectTarget('Eddi'),'Eddi');assert.equal(social.selected(),'Eddi');assert.equal(selectedCompanion(g),null);assert.equal(g.target,null);
 const hp=c.hp,own=g.player.hp;assert.equal(g.action('heal'),true);assert.equal(c.hp,hp);assert.equal(g.player.hp,own);assert.equal(sent.at(-1).t,'aid');assert.equal(sent.at(-1).to,'Eddi');assert.ok(sent.at(-1).heal>0);
 selectFriend(g,'companion',c);assert.equal(social.selected(),null,'Söldner löst das Gruppenmitglied ab');
 assert.equal(social.selectTarget('Niemand'),null);assert.equal(selectedCompanion(g),c,'Abwesende lassen sich nicht wählen');
 g.dismissCompanion(c.id);assert.equal(g.friend,null);
});

test('healing an ally outside combat does not open the meter or resurrect a downed companion',()=>{
 const {g,c}=fixture();g.enemies=[];g.target=null;g.player.inCombat=0;c.inCombat=0;selectFriend(g,'companion',c);
 assert.equal(g.action('heal'),true);assert.equal(g.meter.current,null);
});
