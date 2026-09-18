import test from 'node:test';
import assert from 'node:assert/strict';
import {touchPopupBounds} from '../popup-layout.js';
import {Game} from '../engine.js';
import {talentTooltip,talentSkillsHtml} from '../talent-ui.js';
import {describeCard} from '../describe-ui.js';
import {KITS,SKILL_DAMAGE,TALENT_ROWS,CLASS_SPECS,PROC_RULES} from '../content/index.js';

const world=()=>({id:'hof',spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}],findClear:(x,y)=>({x,y})});
const box=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});

test('Touch windows stay between asymmetric controls and safe areas in either hand mode',()=>{
 const safe={left:47,right:47,top:0,bottom:21};
 const normal=[box(59,240,104,104),box(595,172,190,173)];
 const reverse=normal.map(r=>box(844-r.right,r.top,r.width,r.height));
 for(const controls of [normal,reverse])for(const fill of [false,true]){
  const r=touchPopupBounds({width:844,height:390,safe,controls,preferredWidth:340,fill});
  const left=controls.find(r=>r.left<422),right=controls.find(r=>r.left>422);
  assert.ok(r.left>=left.right+8);assert.ok(r.left+r.width<=right.left-8);
  assert.ok(r.top>=safe.top);assert.ok(r.top+r.maxHeight<=390-safe.bottom);
  if(fill)assert.equal(r.width,right.left-left.right-16);
 }
});
test('Rotation recomputes portrait size from viewport and HUD, independent of previous width',()=>{
 const args={width:390,height:844,safe:{top:47,bottom:34,left:0,right:0},controls:[box(20,665,128,128),box(190,575,184,218)]};
 const r=touchPopupBounds({...args,preferredWidth:700});
 assert.deepEqual(r,{left:12,top:151,width:366,maxHeight:416});
 assert.deepEqual(touchPopupBounds({...args,preferredWidth:420}),r);
 const smaller=touchPopupBounds({...args,controls:[...args.controls,box(200,550,40,40)]});
 assert.equal(smaller.top+smaller.maxHeight,542);
});
test('Skill tooltip damage follows the combat model after a balance change, without stale prose',()=>{
 const g=new Game(world()),model=SKILL_DAMAGE.dieter.strike,old=model.weapon;
 assert.equal(old,2);assert.doesNotMatch(KITS.dieter[0].text,/\d/);
 try{
  model.weapon=2.57;
  const html=describeCard(g,'skill','strike');
  assert.match(html,/>257</);assert.doesNotMatch(html,/300\s*%|200\s*%/);
 }finally{model.weapon=old;}
});
test('Talent explanations show affected skill names, current bindings and no keyboard hints on touch',()=>{
 const g=new Game(world(),{level:11});
 for(const [cls,specs] of Object.entries(CLASS_SPECS)){
  const game=new Game(world(),{classId:cls,level:11});
  for(const spec of specs)for(const [i,t] of TALENT_ROWS[spec].entries()){
   const html=talentSkillsHtml(game,spec+'-'+i,true);
   for(const id of t.skills)assert.ok(html.includes(game.skills.find(s=>s.id===id).name),spec+'-'+i+': '+id);
   assert.doesNotMatch(html,/<kbd>/);
  }
 }
 g.rpg.actionBars.dieter=['auto',null,null,'strike'];
 assert.match(talentSkillsHtml(g,'dieter-wall-0'),/Kronkorken-Kelle.*<kbd>4<\/kbd>/);
 assert.doesNotMatch(talentTooltip(g,'dieter-wall-0',true),/<kbd>/);
});
test('Talent numbers derive from effects in both tooltip and handbook, without legacy numeric text',()=>{
 const g=new Game(world()),t=TALENT_ROWS['dieter-wall'][0],effect=PROC_RULES.deckelwirtschaft.effect,old=effect.shield;
 try{
  effect.shield=37;
  for(const html of [talentTooltip(g,'dieter-wall-0'),describeCard(g,'talent','dieter-wall-0')]){
   assert.match(html,/>37</);assert.ok(!html.includes(t.text));
  }
 }finally{effect.shield=old;}
});
