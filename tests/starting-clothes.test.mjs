import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {tutorialConfirm} from '../tutorial.js';
import {tutorialDialogue} from '../tutorial-ui.js';
import {TUTORIAL,CLASS_CLOTHES} from '../content/index.js';
const world={id:'hof',spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}],findClear:(x,y)=>({x,y})};
test('fresh guided heroes wake without equipment and retain that state across reloads',()=>{
 for(const member of ['dieter','baerbel','kevin']){
  const g=new Game(world,{},{guidedStart:true});g.switchMember(member);
  assert.ok(Object.values(g.rpg.equipment).every(v=>v===null));
  assert.ok(tutorialDialogue(g).includes(TUTORIAL.welcome));
  const loaded=new Game(world,JSON.parse(JSON.stringify(g.save())),{guidedStart:true});
  assert.deepEqual(loaded.rpg.equipment,g.rpg.equipment);
  assert.equal(tutorialConfirm(loaded),true);
  for(const [slot,id]of Object.entries({...TUTORIAL.starterEquipment,...(CLASS_CLOTHES[member]||{})}))assert.equal(loaded.rpg.equipment[slot],id,member+': '+slot);// E-72: Klassenkleidung statt Kutte
  assert.equal(loaded.rpg.equipment.legs,null);assert.equal(loaded.rpg.equipment.feet,null);
  assert.equal(tutorialConfirm(loaded),false,'the gift cannot be claimed twice');
 }
});
test('Ida acknowledges existing clothes and never replaces saved equipment',()=>{
 const old=new Game(world),save=old.save();
 const restored=new Game(world,save,{guidedStart:true});assert.deepEqual(restored.rpg.equipment,old.rpg.equipment);
 const g=new Game(world,{},{guidedStart:true});g.rpg.equipment.body='kutte';g.rpg.equipment.weapon='tresenhammer';
 const before=JSON.parse(JSON.stringify(g.save())),loaded=new Game(world,before,{guidedStart:true});
 assert.ok(tutorialDialogue(loaded).includes(TUTORIAL.welcomeDressed));
 assert.ok(!tutorialDialogue(loaded).includes(TUTORIAL.welcome));
 assert.ok(tutorialConfirm(loaded));assert.equal(loaded.rpg.equipment.weapon,'tresenhammer');assert.equal(loaded.rpg.equipment.offhand,null);assert.equal(loaded.rpg.equipment.body,'kutte');
});
test('E-72: Anni, Kevin, Schorsch und Käthe holen sich ihre Klassenkleidung vom Kleiderhaufen statt der Kutte, Dieter die Kutte',()=>{
 const want={schorsch:{body:'grillschuerze',head:'schorschmuetze'},kaethe:{body:'kaethestrickjacke',neck:'kaethebrille'},dieter:{body:'kutte'},
  baerbel:{body:'annischuerze',head:'annibrille'},kevin:{body:'kevinweste',waist:'kevinguertel'}};
 for(const [member,slots] of Object.entries(want)){
  const g=new Game(world,{},{guidedStart:true});g.switchMember(member);assert.equal(g.member.id,member);
  assert.ok(Object.values(g.rpg.equipment).every(v=>v===null),member+': startet in Unterwäsche');
  assert.equal(tutorialConfirm(g),true);
  for(const [slot,id] of Object.entries(slots))assert.equal(g.rpg.equipment[slot],id,member+': '+slot);
  for(const slot of ['weapon','offhand','ranged'])assert.equal(g.rpg.equipment[slot],TUTORIAL.starterEquipment[slot],member+': Werkzeug aus der Clankiste');
  if(member!=='dieter')assert.ok(!Object.values(g.rpg.equipment).includes('kutte'),member+': keine Kutte');
  assert.equal(g.rpg.equipment.legs,null);assert.equal(g.rpg.equipment.feet,null);
 }
});
