// Deterministic pacing budget, not a human play-time measurement.
// Real combat/XP/regen, single pulls, 16–24 seconds search/travel between kills.
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {rng,distance} from '../world.js';
import {available} from '../progression.js';
import {TALENTS,learnTalent} from '../talents.js';
import {writeFileSync,mkdirSync} from 'node:fs';
const world=()=>({id:'pacing',spawn:{x:0,y:0},npc:{x:0,y:10},landmarks:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]});
function run(classId,seed,mixed){const g=new Game(world(),{classId}),random=rng(seed);g.random=rng(seed+999);g.player.x=500;let combat=0,travel=0,deaths=0,kills=0,four=null,quests=0;
 const advance=seconds=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};
 while(g.player.level<6&&g.time<7200){g.player.inCombat=0;for(const t of TALENTS[g.rpg.talents.spec])learnTalent(g,t.id);const type=random()<.15?'cultist':'wolf',hp=type==='cultist'?600:random()<.5?360:460,e=makeEnemy({x:g.player.x+30,y:g.player.y},kills+1,{type,hp,aggro:true,ai:'combat'});g.enemies=[e];g.target=e;const start=g.time;
  for(let i=0;i<1200&&e.hp>0&&!g.dead;i++){if(e.cast?.interruptible&&available(g,'interrupt')&&g.cooldowns.interrupt===0)g.action('interrupt');if(g.gcd===0){const ready=id=>available(g,id)&&g.cooldowns[id]===0;let id='strike';if(ready('heal')&&g.player.hp/g.player.maxHp<.65)id='heal';else if(ready('buff')&&!g.buffs.remaining)id='buff';else if(ready('burst')&&g.player.runes===3&&e.mark>0)id='burst';else if(ready('mark')&&!e.mark&&e.hp>120)id='mark';else if(ready('throw'))id='throw';g.action(id);}if(distance(g.player,e)>45){const d=distance(g.player,e);g.move(g.player,(e.x-g.player.x)/d*4,(e.y-g.player.y)/d*4);}g.tick(.05);}
  combat+=g.time-start;if(g.dead){deaths++;g.respawn();g.player.x=500;}else if(e.hp<=0)kills++;else throw Error('Unfinished encounter');g.enemies=[];g.target=null;
  const walk=16+random()*8,before=g.time;advance(walk);while(g.player.hp<g.player.maxHp*.8)advance(1);travel+=g.time-before;
  // Mixed route: one side quest per 15 kills, 3 min budget for NPC travel/activity.
  // Reward is real authored quest amount; completion travel is an explicit estimate.
  if(mixed&&kills>0&&kills%15===0&&quests<6){advance(180);travel+=180;g.gainXp(180);quests++;}
  if(four===null&&g.player.level>=5)four=g.time/60;
 }
 return {classId,mixed,minutes:+(g.time/60).toFixed(2),fourMinutes:+four?.toFixed(2),kills,quests,deaths,combatMinutes:+(combat/60).toFixed(2),travelRecoveryMinutes:+(travel/60).toFixed(2)};
}
const runs=[];for(const id of ['dieter','baerbel','kevin'])for(const mixed of [false,true])for(let seed=1;seed<=5;seed++)runs.push(run(id,seed,mixed));
const summary=[];for(const classId of ['dieter','baerbel','kevin'])for(const mixed of [false,true]){const a=runs.filter(r=>r.classId===classId&&r.mixed===mixed);summary.push({classId,route:mixed?'mixed quests':'single pulls',fourMinutes:+(a.reduce((n,r)=>n+r.fourMinutes,0)/a.length).toFixed(1),fiveMinutes:+(a.reduce((n,r)=>n+r.minutes,0)/a.length).toFixed(1),deaths:a.reduce((n,r)=>n+r.deaths,0)});}
mkdirSync('progression-review/classes-013',{recursive:true});writeFileSync('progression-review/classes-013/pacing.json',JSON.stringify({assumptions:'Real combat and recovery; 16–24 s search/travel per single pull, 15% wardens, no gear or consumables. Mixed route adds a 180 XP side quest with 3 min travel/activity per 15 kills, at most six. Five seeds per class and route. Human navigation, looting, skill reading and mistakes can differ.',summary,runs},null,2));console.table(summary);
