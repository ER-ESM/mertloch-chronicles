import test from 'node:test';
import assert from 'node:assert/strict';
import {collectAuras} from '../auras.js';
import {Game} from '../engine.js';
import {MOUNTS,MOUNT_RULES} from '../content/index.js';
import {restoreMounts,mountStation,acquisitionReason,tickMount,ridingSkillReason,mountSpeed,mountSound} from '../mounts.js';
import {addItem,countItem,bindSkill,actionBar,ITEMS} from '../rpg.js';
import {stepPlayer} from '../movement.js';
import {mountPresence} from '../mount-wire.js';
import {presenceMessage,applySnapshot} from '../online.js';
import {makeEnemy} from '../encounters.js';
const world=()=>({id:'mount-test',spawn:{x:0,y:0},npc:{x:-1000,y:-1000},places:{kiosk:{approach:{...MOUNT_RULES.stationOffset}}},landmarks:[],camps:[],quests:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b]});
function game(save={}){const g=new Game(world(),{level:6,...save});g.tutorial={completed:true};Object.assign(g.player,mountStation(g.world));g.rpg.coins=500;return g;}
function owner(){return game({mounts:{owned:Object.keys(MOUNTS),selected:'klappermofa'}});}
const assets=g=>structuredClone({inventory:g.rpg.inventory,coins:g.rpg.coins,mounts:g.mounts});
test('Mount saves migrate safely, reject unknown IDs, and remain character-specific',()=>{
 assert.deepEqual(restoreMounts(null),{version:1,ridingSkill:false,owned:[],selected:null});
 assert.deepEqual(restoreMounts({owned:['klappermofa','__proto__','klappermofa',null,'hofpferd'],selected:'unknown'}),{version:1,ridingSkill:false,owned:['klappermofa','hofpferd'],selected:'klappermofa'});
 const g=owner();assert.ok(bindSkill(g,'mount',9));g.player.mount='klappermofa';const next=game(g.save());assert.deepEqual(next.mounts,g.mounts);assert.equal(next.player.mount,null);assert.equal(actionBar(next)[9],'mount');assert.deepEqual(game().mounts.owned,[]);
});
test('Acquisition charges exactly once, and all blocked transactions are atomic',()=>{
 for(const id of Object.keys(MOUNTS)){const g=game(),d=MOUNTS[id];for(const [item,n] of Object.entries(d.materials))addItem(g.rpg,item,n);const coins=g.rpg.coins,before=Object.fromEntries(Object.keys(d.materials).map(i=>[i,countItem(g.rpg,i)]));assert.ok(g.acquireMount(id));assert.equal(g.rpg.coins,coins-d.coins);for(const [i,n]of Object.entries(d.materials))assert.equal(countItem(g.rpg,i),before[i]-n);const after=assets(g);assert.ok(g.acquireMount(id));assert.deepEqual(assets(g),after);}
 for(const change of [g=>g.player.level=1,g=>g.player.x+=100,g=>g.world.lineClear=()=>false,g=>g.player.inCombat=1,g=>g.dead=true,g=>g.paused=true,g=>g.instance={},g=>g.tutorial.completed=false,g=>g.rpg.coins=0,g=>g.mountCast={}]){const g=game();change(g);const before=assets(g);assert.ok(acquisitionReason(g,'blechroller'));assert.equal(g.acquireMount('blechroller'),false);assert.deepEqual(assets(g),before);}
 const g=game(),before=assets(g);assert.equal(g.acquireMount('unknown'),false);assert.equal(g.acquireMount('klappermofa'),false);assert.deepEqual(assets(g),before);
});
test('Main quest material remains reserved during mount repair',()=>{
 const g=game();addItem(g.rpg,'dosenblech',6);addItem(g.rpg,'kabel',2);g.quest.accepted=true;g.objectives=()=>[{kind:'gather',item:'kabel',count:1}];const before=assets(g);assert.equal(g.acquireMount('klappermofa'),false);assert.deepEqual(assets(g),before);addItem(g.rpg,'kabel',1);assert.ok(g.acquireMount('klappermofa'));assert.equal(countItem(g.rpg,'kabel'),1);
});
test('Mount cast waits, cancels on movement and state changes, toggles, and requires ownership',()=>{
 assert.equal(game().toggleMount('hofpferd'),false);
 const g=owner();assert.ok(g.toggleMount());tickMount(g,1);assert.equal(g.player.mount,null);tickMount(g,.5);assert.equal(g.player.mount,'klappermofa');assert.ok(g.toggleMount());assert.equal(g.player.mount,null);
 for(const change of [g=>g.keys.add('d'),g=>g.moveTo={x:4,y:5},g=>g.touchMove={x:1,y:0},g=>g.player.x++,g=>g.player.inCombat=1,g=>g.activity={},g=>g.casting={},g=>g.dead=true]){const g=owner();assert.ok(g.toggleMount());change(g);tickMount(g,2);assert.equal(g.player.mount,null);assert.equal(g.mountCast,null);}
});
test('Selecting a neutral target preserves mount; attacks, damage, death and interiors dismount',()=>{
 const g=owner(),e=makeEnemy({x:g.player.x+20,y:g.player.y},1,{hp:1000,behavior:'neutral'});g.enemies=[e];g.player.mount='klappermofa';g.target=e;tickMount(g,.1);assert.equal(g.player.mount,'klappermofa');g.startAttack();assert.equal(g.player.mount,null);
 g.stopAuto();g.player.mount='klappermofa';g.action('strike');assert.equal(g.player.mount,null);g.player.mount='hofpferd';g.hitPlayer(e,10,false);assert.equal(g.player.mount,null);
 g.player.inCombat=0;g.enemies=[];g.player.mount='hofpferd';assert.ok(g.enterKiosk());assert.equal(g.player.mount,null);assert.equal(g.toggleMount(),false);
 const dead=owner();dead.player.mount='hofpferd';dead.dead=true;tickMount(dead,.1);assert.equal(dead.player.mount,null);
});
test('Riding skill purchase is atomic, charges once and persists only for this hero',()=>{
 const g=owner(),coins=g.rpg.coins;assert.ok(g.learnRiding());assert.equal(g.rpg.coins,coins-MOUNT_RULES.ridingSkill.coins);assert.equal(g.mounts.ridingSkill,true);
 const after=assets(g);assert.ok(g.learnRiding());assert.deepEqual(assets(g),after);
 const restored=game(g.save());assert.equal(restored.mounts.ridingSkill,true);assert.equal(mountSpeed(restored),2);assert.equal(game().mounts.ridingSkill,false);
 for(const change of [g=>g.player.level=2,g=>g.player.x+=100,g=>g.world.lineClear=()=>false,g=>g.player.inCombat=1,g=>g.autoAttack.enabled=true,g=>g.dead=true,g=>g.player.hp=0,g=>g.paused=true,g=>g.instance={},g=>g.tutorial.completed=false,g=>g.rpg.coins=MOUNT_RULES.ridingSkill.coins-1,g=>g.mountCast={},g=>g.casting={},g=>g.professionCast={},g=>g.professionCommit={}]){
  const blocked=owner();change(blocked);const before=assets(blocked);assert.ok(ridingSkillReason(blocked));assert.equal(blocked.learnRiding(),false);assert.deepEqual(assets(blocked),before);
 }
 const exact=owner();exact.rpg.coins=MOUNT_RULES.ridingSkill.coins;exact.player.level=MOUNT_RULES.ridingSkill.level;assert.ok(exact.learnRiding());assert.equal(exact.rpg.coins,0);
 for(const value of [undefined,null,false,1,2,'true',{},[]])assert.equal(restoreMounts({ridingSkill:value}).ridingSkill,false);
 assert.equal(restoreMounts({ridingSkill:true}).ridingSkill,true);
});

test('Every mount gains 60% or 100% from riding skill; walking, diagonals and collisions remain correct',()=>{
 function move(id,ridingSkill=false,blocked=false,diagonal=false){const g=owner();g.mounts.ridingSkill=ridingSkill;g.player.mount=id;g.player.x=g.player.y=0;if(blocked)g.world.blocked=(x)=>x>50;for(let i=0;i<60;i++)stepPlayer(g,1,diagonal?1:0,1/60);return Math.hypot(g.player.x,g.player.y);}
 const foot=move(null);assert.equal(move(null,true),foot);
 for(const skill of [false,true])for(const id of Object.keys(MOUNTS)){
  const expected=skill?2:1.6;assert.ok(Math.abs(move(id,skill)/foot-expected)<1e-8);assert.ok(move(id,skill,true)<=50);assert.ok(Math.abs(move(id,skill,false,true)-move(id,skill))<1e-8);
 }
 const g=owner();g.player.mount='hofpferd';assert.match(collectAuras(g).buffs.find(a=>a.id==='mount').text,/60 % schneller/i);
 g.learnRiding();assert.match(collectAuras(g).buffs.find(a=>a.id==='mount').text,/100 % schneller/i);
});

test('Cosmetic network presence validates mount, direction and gear; old clients and private rooms stay compatible',()=>{
 const g=owner();g.player.mount='hofpferd';g.player.direction='nw';g.player.look='anni';const packet=presenceMessage(g,'mount-test'),sanitized=mountPresence(packet);assert.equal(sanitized.mt,'hofpferd');assert.equal(sanitized.md,'nw');const [p]=applySnapshot([],[{...packet,n:'Reiter'}],100);assert.equal(p.mount,'hofpferd');assert.equal(p.look,'anni');assert.equal(p.direction,'nw');
 assert.equal(mountPresence({...packet,s:'dead'}).mt,null);assert.equal(mountPresence({mt:'__proto__'}).mt,null);assert.deepEqual(mountPresence({}),{mt:null,md:null,eq:[]});
 assert.equal(mountPresence({mt:'hofpferd',eq:[{slot:'body',asset:'jacket',rarity:'rare'},{slot:'body',asset:'jacket'},{slot:'weapon',asset:'external-url'},{slot:'__proto__',asset:'jacket'}]}).eq.length,1);
 g.instance={};assert.equal(presenceMessage(g,'mount-test').mt,null);assert.equal(presenceMessage(g,'mount-test').w,'');
});

test('Paperdoll mounts: donkey, bicycle and mower are complete content with fitting mount sounds',()=>{
 assert.deepEqual(Object.keys(MOUNTS),['klappermofa','blechroller','hofpferd','packesel','drahtesel','rasenkoenig']);
 assert.deepEqual(Object.fromEntries(Object.values(MOUNTS).map(d=>[d.id,d.kind])),{klappermofa:'mofa',blechroller:'scooter',hofpferd:'horse',packesel:'donkey',drahtesel:'bicycle',rasenkoenig:'mower'});
 for(const d of Object.values(MOUNTS)){assert.equal(d.id,Object.keys(MOUNTS).find(k=>MOUNTS[k]===d));assert.ok(d.name&&d.description&&d.source&&d.acquire&&d.color);assert.ok(d.level>=3&&d.level<=6);for(const item of Object.keys(d.materials))assert.ok(ITEMS[item],item);}
 assert.deepEqual(Object.keys(MOUNTS).map(mountSound),['mount-motor','mount-motor','mount-horse','mount-horse','mount-bell','mount-motor']);assert.equal(mountSound('unknown'),'mount-motor');
 for(const [id,sound] of [['packesel','mount-horse'],['drahtesel','mount-bell'],['rasenkoenig','mount-motor']]){const g=owner();assert.ok(g.toggleMount(id));g.events=[];tickMount(g,2);assert.equal(g.player.mount,id);assert.deepEqual(g.events.filter(e=>e.type==='sound').map(e=>e.id),[sound]);}
 assert.deepEqual(restoreMounts({owned:['rasenkoenig','packesel','drahtesel','unknown'],selected:'drahtesel'}),{version:1,ridingSkill:false,owned:['rasenkoenig','packesel','drahtesel'],selected:'drahtesel'});
 const low=game({level:4});low.player.level=4;assert.match(acquisitionReason(low,'rasenkoenig'),/Stufe 5/);
});
