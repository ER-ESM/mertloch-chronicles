import {KIOSK_ROOM} from '../content/index.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {ITEMS,BAG_SIZE,countItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {SHOP_STOCK,SHOP_RULES,ITEM_CATALOG} from '../content/index.js';
import {shopUnavailable,salePrice,reservedCount} from '../shop.js';
import {restoreShopHistory} from '../shop-state.js';
import {mapPlaces} from '../cartography.js';
const world=()=>({id:'shop-test',spawn:{x:100,y:100},npc:{x:1000,y:1000},places:{kiosk:{approach:{x:100,y:100}}},landmarks:[],camps:[],quests:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b]});
const game=s=>{const g=new Game(world(),s);g.player.x=100;g.player.y=100;g.enterKiosk();Object.assign(g.player,KIOSK_ROOM.service);return g;};
const snapshot=g=>structuredClone({inventory:g.rpg.inventory,coins:g.rpg.coins,equipment:g.rpg.equipment,buyback:g.rpg.buyback});

test('shop stock has working consumables, valid prices and no buy/sell profit',()=>{
 assert.equal(new Set(SHOP_STOCK).size,SHOP_STOCK.length);
 for(const id of SHOP_STOCK){const d=ITEM_CATALOG[id];assert.ok(d.kind==='consumable'&&(d.heal||d.energy)||d.kind==='material'&&['brauwasser','leerflasche'].includes(id));assert.ok(Number.isSafeInteger(d.price)&&d.price>salePrice(id));}
 assert.equal(SHOP_STOCK.includes('pfandbon'),false,'unfinished bonus mechanic is not sold');
});
test('purchase deducts the exact total, stacks and persists',()=>{
 const g=game();g.rpg.coins=100;g.events=[];const before=countItem(g.rpg,'brezel');
 assert.ok(g.buyItem('brezel',3));assert.equal(g.rpg.coins,64);assert.equal(countItem(g.rpg,'brezel'),before+3);
 assert.ok(g.events.some(e=>e.type==='save'));assert.ok(g.events.some(e=>e.type==='rpgChanged'));
 const loaded=game(g.save());assert.deepEqual(snapshot(loaded),snapshot(g));
});
test('full bag and partial-stack capacity never cause partial charges or partial purchases',()=>{
 const g=game();g.rpg.coins=100;g.rpg.inventory=Array.from({length:BAG_SIZE},(_,i)=>i?{id:'flasche',count:1}:{id:'brezel',count:ITEMS.brezel.stack-1});
 const before=snapshot(g);assert.equal(g.buyItem('brezel',2),false);assert.deepEqual(snapshot(g),before);
 assert.ok(g.buyItem('brezel'));assert.equal(g.rpg.coins,88);assert.equal(g.rpg.inventory[0].count,ITEMS.brezel.stack);
});
test('insufficient funds, level locks and malformed quantities preserve the complete transaction state',()=>{
 const g=game();g.rpg.coins=100;const before=snapshot(g);
 for(const [id,n] of [['currywurst',1],['no-such-item',1],['regenjacke',1],['brezel',0],['brezel',-1],['brezel',1.5],['brezel',NaN],['brezel',Infinity],['brezel','1'],['brezel',100]]){assert.equal(g.buyItem(id,n),false);assert.deepEqual(snapshot(g),before);}
 g.rpg.coins=11;const poor=snapshot(g);assert.equal(g.buyItem('brezel'),false);assert.deepEqual(snapshot(g),poor);
});
test('range, sight, combat, death, tutorial and pause gates apply to all transactions',()=>{
 for(const change of [g=>g.player.x=300,g=>{g.player.x=190;g.player.y=100;},g=>g.player.inCombat=2,g=>g.dead=true,g=>g.paused=true,g=>g.casting={},g=>g.tutorial={completed:false},g=>g.instance=null]){
  const g=game();g.rpg.coins=100;g.rpg.inventory=[{id:'kabel',count:3}];assert.ok(g.sellItem('kabel'));const token=g.rpg.buyback[0].token;change(g);const before=snapshot(g);
  assert.ok(shopUnavailable(g));assert.equal(g.buyItem('brezel'),false);assert.equal(g.sellItem('kabel'),false);assert.equal(g.buybackItem(token),false);assert.deepEqual(snapshot(g),before);
 }
});
test('material quantities sell across stacks and buy back exactly once at the same price',()=>{
 const g=game();g.rpg.inventory=[{id:'kabel',count:2},{id:'kabel',count:4}];const start=snapshot(g);
 assert.ok(g.sellItem('kabel',5));assert.equal(countItem(g.rpg,'kabel'),1);assert.equal(g.rpg.coins,5);
 const token=g.rpg.buyback[0].token;assert.ok(g.buybackItem(token));assert.equal(countItem(g.rpg,'kabel'),6);assert.equal(g.rpg.coins,start.coins);assert.equal(g.buybackItem(token),false);
});
test('sales cannot take equipped items or material reserved for an active main quest',()=>{
 const g=game();g.rpg.inventory=[{id:'palettenholz',count:20}];Object.assign(g.quest,{accepted:true,chapter:2,chapterClaimed:1});
 const reserved=reservedCount(g,'palettenholz');assert.ok(reserved>0);const before=snapshot(g);
 assert.equal(g.sellItem('kutte'),false);assert.equal(g.sellItem('palettenholz',20),false);assert.deepEqual(snapshot(g),before);
 assert.ok(g.sellItem('palettenholz',20-reserved));assert.equal(countItem(g.rpg,'palettenholz'),reserved);
 g.quest.accepted=false;assert.ok(g.sellItem('palettenholz',reserved));
});
test('selling spare equipment leaves equipped copies and their stats intact',()=>{
 const g=game();g.rpg.inventory=[{id:'kutte',count:1}];const gear=structuredClone(g.rpg.equipment),hp=g.player.maxHp;
 assert.ok(g.sellItem('kutte'));assert.deepEqual(g.rpg.equipment,gear);assert.equal(g.player.maxHp,hp);assert.equal(g.rpg.inventory.length,0);
});
test('rolled equipment retains its exact definition through sale, reload and buyback',()=>{
 const g=game(),id=registerRoll(g.rpg,ITEMS,{slot:'body',spec:'tresen',level:4,quality:'rare',roll:337,family:'boar'}),definition=structuredClone(ITEMS[id]);g.rpg.inventory=[{id,count:1}];
 assert.ok(g.sellItem(id));const save=g.save();assert.ok(save.rpg.generated[id]);delete ITEMS[id];
 const loaded=game(save);assert.deepEqual(ITEMS[id],definition);assert.ok(loaded.buybackItem(loaded.rpg.buyback[0].token));assert.equal(loaded.rpg.inventory[0].id,id);
});
test('buyback survives a full bag or insufficient coins without consuming its entry',()=>{
 const g=game();g.rpg.inventory=[{id:'regenjacke',count:1}];g.sellItem('regenjacke');const token=g.rpg.buyback[0].token;
 g.rpg.inventory=Array.from({length:BAG_SIZE},()=>({id:'flasche',count:1}));let before=snapshot(g);assert.equal(g.buybackItem(token),false);assert.deepEqual(snapshot(g),before);
 g.rpg.inventory=[];g.rpg.coins=0;before=snapshot(g);assert.equal(g.buybackItem(token),false);assert.deepEqual(snapshot(g),before);
});
test('history is bounded and tokens remain unique across reloads and consumed entries',()=>{
 let g=game();g.rpg.inventory=[{id:'kabel',count:15}];for(let i=0;i<13;i++)assert.ok(g.sellItem('kabel'));
 assert.equal(g.rpg.buyback.length,SHOP_RULES.buybackLimit);assert.equal(g.rpg.buyback[0].token,2);assert.equal(g.buybackItem(1),false);
 g=game(g.save());assert.ok(g.buybackItem(13));assert.ok(g.sellItem('kabel'));assert.equal(g.rpg.buyback.at(-1).token,14);
});
test('invalid history is discarded, old saves load and currency overflow cannot delete items',()=>{
 const e={id:'kabel',count:2,total:2,token:1};assert.deepEqual(restoreShopHistory([null,e,e,{...e,token:2,total:-1},{...e,token:3,count:100},{...e,token:4,id:'missing'}],ITEMS),[e]);
 const g=game();assert.deepEqual(g.rpg.buyback,[]);g.rpg.coins=SHOP_RULES.maxCoins;g.rpg.inventory=[{id:'kabel',count:1}];const before=snapshot(g);assert.equal(g.sellItem('kabel'),false);assert.deepEqual(snapshot(g),before);
});
test('the interaction and atlas entry use the kiosk walkable approach',()=>{
 const g=game();assert.equal(g.interaction().kind,'shop');const p=mapPlaces(g).find(p=>p.kind==='shop');assert.deepEqual(p.point,g.world.places.kiosk.approach);assert.equal(p.title,'Kalles Kiosk');
 g.player.x+=SHOP_RULES.range+1;assert.notEqual(g.interaction()?.kind,'shop');
});

test('named unique items without market values cannot be sold for the fallback minimum',()=>{
 const g=game();g.rpg.inventory=[{id:'keilerzahn',count:1}];const before=snapshot(g);
 assert.equal(salePrice('keilerzahn'),0);assert.equal(g.sellItem('keilerzahn'),false);assert.deepEqual(snapshot(g),before);
});
