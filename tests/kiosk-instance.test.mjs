import {presenceMessage} from '../online.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {KIOSK_ROOM as R} from '../content/index.js';
import {roomWorld} from '../kiosk-instance.js';
const world=()=>({id:'room-test',spawn:{x:1000,y:1000},npc:{x:2000,y:2000},places:{kiosk:{entrance:{x:1000,y:1000},approach:{x:1000,y:1000}}},landmarks:[],camps:[],quests:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b]});
const game=s=>new Game(world(),s);
test('door entry is explicit and rejects combat, death, pause, tutorial and distance',()=>{
 const g=game();assert.equal(g.interaction().kind,'enterKiosk');assert.equal(g.buyItem('brezel'),false);assert.ok(g.enterKiosk());assert.equal(g.instance.id,'kiosk');assert.deepEqual({x:g.player.x,y:g.player.y},R.spawn);assert.equal(g.enterKiosk(),false);
 for(const edit of [g=>g.player.inCombat=2,g=>g.dead=true,g=>g.paused=true,g=>g.tutorial={completed:false},g=>g.player.x+=100,g=>g.world.lineClear=()=>false]){const h=game();edit(h);assert.equal(h.enterKiosk(),false);assert.equal(h.instance,undefined);}
});
test('interior movement respects furniture and walls while the village simulation stays outside',()=>{
 const g=game();g.enterKiosk();g.enemies=[{id:'outside',x:1000,y:1000,hp:100}];const before=structuredClone(g.enemies);g.keys.add('w');for(let i=0;i<180;i++)g.tick(.05);assert.ok(g.player.y>=R.furniture.find(b=>b.kind==='counter').y+R.furniture.find(b=>b.kind==='counter').h+5);assert.ok(g.player.y<R.spawn.y);assert.deepEqual(g.enemies,before);assert.equal(g.action('strike'),false);assert.equal(g.startAttack(),false);
 assert.ok(g.navigate(R.service));for(let i=0;i<140;i++)g.tick(.05);assert.ok(Math.hypot(g.player.x-R.service.x,g.player.y-R.service.y)<6);
});
test('paths enter every public aisle without cutting through furniture',()=>{
 for(const goal of [R.service,R.exit,{x:94,y:170},{x:275,y:210},{x:95,y:78}]){const path=roomWorld.findPath(R.spawn,goal);assert.ok(path.length);let previous=R.spawn;for(const p of path){assert.ok(roomWorld.walkClear(previous,p));previous=p;}}
 assert.deepEqual(roomWorld.findPath(R.spawn,{x:40,y:60}),[]);assert.equal(roomWorld.blocked(-20,100),true);
});
test('save keeps exterior and interior coordinates separate; reload preserves trading and exit returns to the same door',()=>{
 const g=game();g.rpg.coins=100;g.enterKiosk();Object.assign(g.player,R.service);assert.ok(g.buyItem('brezel'));const save=g.save();assert.equal(save.position.x,1000);assert.equal(save.instance.x,R.service.x);
 const h=game(save);assert.equal(h.instance.id,'kiosk');assert.equal(h.player.x,R.service.x);assert.equal(h.rpg.coins,88);assert.ok(h.rpg.inventory.some(i=>i.id==='brezel'));assert.equal(h.leaveKiosk(),false);Object.assign(h.player,R.exit);assert.ok(h.leaveKiosk());assert.equal(h.instance,null);assert.equal(h.player.x,1000);assert.equal(h.player.y,1000);assert.equal(h.save().instance,undefined);
});
test('malformed or foreign-world room positions cannot put the hero inside furniture or outside the room',()=>{
 const g=game();g.enterKiosk();const save=g.save();for(const position of [{x:-100,y:10},{x:40,y:60},{x:Infinity,y:NaN}]){const h=game({...save,instance:{id:'kiosk',...position}});assert.deepEqual({x:h.player.x,y:h.player.y},R.spawn);}
 assert.equal(game({...save,worldKey:'other'}).instance,undefined);
});

test('an explicit debug return leaves the instance before changing the village position',()=>{const g=game();g.enterKiosk();Object.assign(g.player,R.service);assert.equal(g.leaveKiosk(),false);assert.ok(g.leaveKiosk(true));assert.equal(g.instance,null);assert.equal(g.player.x,1000);});

test('online presence removes a private interior from the shared village and restores it on exit',()=>{const g=game();assert.equal(presenceMessage(g,g.world.id).w,'room-test');g.enterKiosk();const m=presenceMessage(g,g.world.id);assert.equal(m.w,'');assert.equal(m.x,0);assert.equal(m.y,0);assert.equal(m.s,'idle');g.leaveKiosk(true);const outside=presenceMessage(g,g.world.id);assert.equal(outside.w,'room-test');assert.equal(outside.x,1000);});
