// Kampfsimulation Dungeon „Schloss Big B“ (E-71, Etappe 1 „Gerd richtig“). Übernommen aus der Game-Design-Analyse
// (docs/DUNGEON-ANALYSE-2026-09-24.md, `_review/dungeon-sim.mjs`) und auf die Etappe erweitert: feste Seeds, drei Klassen, zwei Profile
// („weicht aus“, „weicht nie aus“), Held allein, Trash-Packs mit Gruppenschaden und Heilung, der Flügel Burghof mit EP je Minute
// gegen das Feld auf Stufe 10. Held Stufe 10, voller Satz auf Stufe 10 (ungewöhnlich), Talentpfad 0, Söldner Stufe 10.
// Die Rotation ist dieselbe wie im Balance-Sheet (scripts/balance-rotation.mjs); Ausweichen ist ideal gesetzt, also eher zu gut.
// Etappe 3 „Big B“ (E-71): Big B mit Held und vier Söldnern in zwei Profilen („folgt dem Nachsatz“, „folgt der Behauptung“ – glaubt jede
// Ansage, läuft nach ihr und weicht sonst nichts aus), Aufstellung nach Rolle (Nicht-Tanks im Kegel bei Gerd) und die Farm-Schleife über
// eine Stunde (Boss-EP ab dem zweiten Sieg am Tag ein Drittel). Nur einzelne Teile: --only=gerd,bigb,farm,…
// Aufruf: node scripts/dungeon-sim.mjs [--json]   → Tabelle auf der Konsole; Rückgabewert 1, wenn ein Prüfkriterium rot ist.
// Prüfkriterien (Bauplan Etappe 1): Gerd mit Held und 4 Söldnern 60–100 s · Held allein über 240 s · „weicht nie aus“ stirbt bei
// Gerd mindestens einmal, „weicht aus“ höchstens einmal · EP je Minute im Dungeon ≥ Feld auf Stufe 9–10.
// Etappe 3: Big B 150–200 s · „folgt der Behauptung“ stirbt mindestens einmal, „folgt dem Nachsatz“ höchstens einmal · bei Gerd im Mittel
// höchstens ein Nicht-Tank im Kegel (beim Zauberbeginn) · Farm-Schleife Gerd über eine Stunde ≤ 2× Feld.
import {readFileSync} from 'node:fs';
import {World,rng} from '../world.js';
import {Game} from '../engine.js';
import {makeEnemy,scaledStats} from '../encounters.js';
import {DUNGEONS,TUTORIAL,CLASS_SPECS,ARCHETYPES} from '../content/index.js';
import {toWorld,coneHits,floorAt,inLane} from '../dungeon.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from './balance-rotation.mjs';
import {changeSpec,pathBuild,learnTalent,talentPoints,TALENTS} from '../talents.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {WALK_SPEED} from '../movement.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],JSON_OUT=process.argv.includes('--json'),ONLY=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7).split(',').filter(Boolean),part=n=>!ONLY.length||ONLY.includes(n);
const GEAR_SLOTS=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
const PROFILES=['tresen','bass','pfand'];
export const CLASSES=[{classId:'dieter',spec:'dieter-brawl',label:'Dieter Kneipenschläger'},{classId:'baerbel',spec:'baerbel-feedback',label:'Bärbel Filter-Furie'},{classId:'kevin',spec:'kevin-hunt',label:'Kevin Pfandjäger'}];
export const SEEDS=[7,8,9];
const MERCS={tank:'merc-pils-peter',heal:'merc-schorle-susi',dps1:'merc-radler-rita',dps2:'merc-hopfen-horst'};
function equipSet(g,quality,level){g.rpg.inventory=[];for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;if(quality==='none'){for(const [slot,id] of Object.entries(TUTORIAL.starterEquipment)){addItem(g.rpg,id);equipItem(g,id,slot);}return;}
 GEAR_SLOTS.forEach(([slot,target,roll],i)=>{const id=registerRoll(g.rpg,ITEMS,{slot,spec:PROFILES[i%3],level,quality,roll,family:'boar'});addItem(g.rpg,id);equipItem(g,id,target);});}
function learnBuild(g,spec,path=0){const budget=Math.max(0,talentPoints(g));for(const id of pathBuild(spec,path,budget))learnTalent(g,id);
 for(const tree of [spec,...Object.values(CLASS_SPECS).find(l=>l.includes(spec)).filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<budget)learnTalent(g,t.id);}
function hero(g,{classId,spec,gear='uncommon',seed}){g.random=rng(seed);g.lootRandom=()=>.99;g.toast=()=>{};changeSpec(g,spec);equipSet(g,gear,10);g.refreshStats();learnBuild(g,spec);g.refreshStats();g.player.hp=g.player.maxHp;g.rpg.coins=9999;return g;}
function setup({classId='dieter',spec='dieter-brawl',gear='uncommon',mercs=['tank','heal','dps1','dps2'],seed=7}){
 const g=hero(new Game(world,{classId,level:10,tutorial:{version:1,step:8,completed:true}},{}),{classId,spec,gear,seed});
 g.enterDungeon('schloss-bigb',{force:true});for(const m of mercs)g.hireCompanion(MERCS[m],{free:true});return g;
}
const quiet=(g,keep=()=>false)=>{for(const e of g.enemies)if(!e.dungeonBoss&&!keep(e)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
/** Nur der Boss, um den es geht (Etappe 3): andere Bosse in fernen Räumen würfeln sonst beim Umherlaufen mit und verschieben die Zufallsfolge. */
const onlyBoss=(g,id)=>{g.enemies=g.enemies.filter(e=>!e.dungeonBoss||e.bossId===id);g.instance.run.enemies=g.enemies;};
const inEll=(p,c)=>Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;
const party=g=>[g.player,...(g.companions||[])];

/** Kampf bis Sieg, Wipe oder Zeitlimit. dodge: Held verlässt Kegel und Flächen; behind: steht hinter dem Boss (vom Tank aus);
 *  front: steht vorn beim Tank (Profil „weicht nie aus“ wie in der Analyse: „steht vor dem Boss“).
 *  immortal: Held kann nicht sterben (reine Zeitmessung „Held allein“). Der Tod läuft wie im Spiel: Geist, Söldner kämpfen weiter. */
/** Big-B-Merkmale für den Helden (Etappe 3). lie 'truth' = folgt dem Nachsatz: wartet die Wahrheit ab, dann raus aus den echten Bahnen,
 *  Stellen und Trümmern. lie 'claim' = folgt der Behauptung: „nach LINKS“ heißt für ihn „nach rechts laufen“ (Gegenbahn) und dort bleiben;
 *  „der Boden ist sicher“ heißt stehen bleiben. → Laufziel oder null. */
function mechGoal(g,p,lie){
 for(const e of g.enemies){const k=e.cast;if(!k||!(e.hp>0))continue;
  if(k.lanes){if(lie==='claim'){if(!k.told)k.heroClaim=true;if(k.heroClaim){const opp=k.lanes[k.lanes.length-1-k.claimLane];return {x:opp.x+opp.w/2,y:p.y};}continue;}
   if(!k.told)continue;const bad=(k.truthLanes||[]).map(i=>k.lanes[i]).filter(Boolean);if(!bad.some(r=>inLane(r,p,8)))continue;
   const lo=Math.min(...k.lanes.map(r=>r.x))+10,hi=Math.max(...k.lanes.map(r=>r.x+r.w))-10;/* nur Punkte in der Arena */const xs=bad.flatMap(r=>[r.x-16,r.x+r.w+16]).filter(x=>x>=lo&&x<=hi&&!bad.some(r=>inLane(r,{x,y:p.y},8))).sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x));if(xs.length)return {x:xs[0],y:p.y};continue;}
  if(lie!=='claim'&&k.spots&&k.told){for(const s of k.spots)if(inEll(p,{x:s.x,y:s.y,radius:k.radius*1.1})){const a=Math.atan2(p.y-s.y,p.x-s.x);return {x:s.x+Math.cos(a)*(k.radius+16),y:s.y+Math.sin(a)*(k.radius+16)*.75};}}}
 if(lie!=='claim')for(const h of g.dungeonRun?.hazards||[])if(Math.hypot(p.x-h.x,p.y-h.y)<h.radius+4){const a=Math.atan2(p.y-h.y,p.x-h.x);return {x:h.x+Math.cos(a)*(h.radius+14),y:h.y+Math.sin(a)*(h.radius+14)};}
 return null;
}
/** Nicht-Tanks im Kegel beim Zauberbeginn (Etappe 3, Aufstellung nach Rolle): Held und Söldner außer dem, den der Gegner angeht. */
function coneCount(g,e,k){const holder=k.focus||(e.focus&&e.focus!=='player'?e.focus:'player');let n=0;if(!g.dead&&holder!=='player'&&coneHits(e,k,g.player,g))n++;for(const c of g.companions)if(c.state!=='down'&&c.hp>0&&c.id!==holder&&coneHits(e,k,c,g))n++;return n;}
function fight(g,foes,{dodge=true,behind=true,front=false,limit=600,immortal=false,lie='truth'}={}){
 const dt=.05,p=g.player,stats={time:0,deaths:0,revives:0,wipes:0,mercDowns:0,mechHits:0,fell:0,taken:0,healed:0,minHpPct:100,minPartyPct:100,cones:0,coneNonTanks:0,lieHits:0},seenCones=new WeakSet();
 const primary=foes[0];g.target=primary;primary.aggro=true;primary.ai='combat';p.inCombat=7;startAuto(g);g.adminGod=immortal;
 for(let t=0;t<limit;t+=dt){
  if(!foes.some(e=>e.hp>0)&&!g.enemies.some(e=>e.hp>0&&e.aggro&&e.ai==='combat'))break;
  // Über die Kante gefallen (ab Phase 2): wie ein Spieler die Kellertreppe gleich neben der Landestelle wieder hoch
  if(!g.dead&&floorAt(DEF,p.x,p.y)==='k1'&&foes.some(e=>e.hp>0&&floorAt(DEF,e.x,e.y)==='e0')){Object.assign(p,toWorld(DEF,'k1',10.5,8));g.dungeonStep('treppe-zugbruecke','b');}
  if(!g.dead){
   if(!(g.target?.hp>0)){g.target=g.enemies.filter(e=>e.hp>0&&e.aggro).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;if(g.target)startAuto(g);}
   const tgt=g.target;let goal=null;
   goal=mechGoal(g,p,dodge?lie:'claim');
   if(dodge&&!goal){for(const e of g.enemies){const k=e.cast;if(!k||e.hp<=0)continue;
     if(k.cone&&coneHits(e,k,p,g)){const a=(k.angle??0)+Math.PI*.6;goal={x:e.x+Math.cos(a)*40,y:e.y+Math.sin(a)*40};}
     else if(k.ground&&inEll(p,k)){const a=Math.atan2(p.y-k.y,p.x-k.x);goal={x:k.x+Math.cos(a)*(k.radius+14),y:k.y+Math.sin(a)*(k.radius+14)*.75};}}}
   if(!goal&&tgt){const holder=g.companions.find(c=>c.id===tgt.focus&&c.state!=='down');/* wen der Gegner gerade angeht (meist der Schutz-Söldner) */
    if((behind||front)&&holder){const d=Math.hypot(tgt.x-holder.x,tgt.y-holder.y)||1,side=front?-1:1;goal={x:tgt.x+side*(tgt.x-holder.x)/d*26,y:tgt.y+side*(tgt.y-holder.y)/d*26};}
    else if(Math.hypot(tgt.x-p.x,tgt.y-p.y)>30)goal={x:tgt.x,y:tgt.y};}
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){g.moveTo=g.world.findClear(goal.x,goal.y,7);g.path=[];}else g.moveTo=null;
   if(!g.casting&&g.gcd<=0&&tgt)rotate(g);
  }
  const before=party(g).map(u=>u.hp),floor=floorAt(DEF,p.x,p.y),casting=g.enemies.map(e=>[e,e.cast?.type,e.sideCast?.type]);
  g.tick(dt);stats.time+=dt;
  for(const e of foes){const k=e.cast;if(k?.cone&&!seenCones.has(k)){seenCones.add(k);stats.cones++;stats.coneNonTanks+=coneCount(g,e,k);}}
  party(g).forEach((u,i)=>{const d=u.hp-before[i];if(d<0)stats.taken-=d;else if(d>0&&before[i]>0)stats.healed+=d;if(u===p&&d<-.15*p.maxHp)stats.mechHits++;
   /* Etappe 3: woran Söldner fallen (Zauber, der in diesem Takt endete, sonst Autoangriff) */if(u!==p&&before[i]>0&&u.hp<=0){const src=casting.find(([e,a,b])=>(a&&!e.cast)||(b&&!e.sideCast));(stats.mercDownBy||=[]).push(u.name.split("-")[0]+":"+(src?(src[1]&&!src[0].cast?src[1]:src[2]):"auto"));}});
  if(floorAt(DEF,p.x,p.y)!==floor&&!g.dead)stats.fell++;
  for(const ev of g.events){if(ev.type==='death'){stats.deaths++;(stats.deathBy||=[]).push(ev.skill?.split(' · ')[0]||'Autoangriff');}if(ev.type==='revived'&&ev.from!==undefined)stats.revives++;if(ev.type==='down')stats.mercDowns++;if(ev.type==='dungeonWipe')stats.wipes++;}
  g.events.length=0;
  if(!g.dead)stats.minHpPct=Math.min(stats.minHpPct,Math.round(p.hp/p.maxHp*100));
  for(const c of g.companions)if(c.state!=='down')stats.minPartyPct=Math.min(stats.minPartyPct,Math.round(c.hp/c.maxHp*100));
  if(stats.wipes)break;
 }
 g.adminGod=false;
 const done=foes.reduce((n,e)=>n+e.maxHp-Math.max(0,e.hp),0);stats.groupDps=Math.round(done/Math.max(1,stats.time));stats.heroDps=Math.round(g.stats.damage/Math.max(1,stats.time));
 const left=foes.filter(e=>e.hp>0);stats.won=!left.length&&!stats.wipes;stats.bossLeft=left.length?Math.round(left[0].hp/left[0].maxHp*100)+'%':'0%';stats.time=Math.round(stats.time);
 stats.taken=Math.round(stats.taken);stats.healed=Math.round(stats.healed);if(!stats.deathBy)delete stats.deathBy;
 stats.lieHits=foes.reduce((n,e)=>n+(e.lieHits||0),0);if(stats.cones)stats.conePerCast=+(stats.coneNonTanks/stats.cones).toFixed(2);else{delete stats.cones;delete stats.coneNonTanks;}
 return stats;
}
function gerdRun(opts,fightOpts){const g=setup(opts);quiet(g);onlyBoss(g,'gerd');const gerd=g.enemies.find(e=>e.bossId==='gerd');Object.assign(g.player,toWorld(DEF,'e0',8.5,26));
 for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 return fight(g,[gerd],fightOpts);}
const packAt=id=>{const pack=DEF.packs.find(p=>p.id===id),room=DEF.rooms.find(r=>r.id===pack.room);return {pack,floor:room.floor,center:toWorld(DEF,room.floor,...pack.at),stand:toWorld(DEF,room.floor,pack.at[0],pack.at[1]+3)};};
function pull(g,id,fightOpts){const {pack,stand}=packAt(id),members=g.enemies.filter(e=>e.pack===pack.id&&e.hp>0);Object.assign(g.player,g.world.findClear(stand.x,stand.y,9));g.player.inCombat=0;
 for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const foes=members.filter(e=>!e.cardboard),label=pack.id+' ('+pack.members.join('+')+')';if(!foes.length)return {pack:label,time:0,deaths:0,note:'schon gelegt'};for(const e of foes){e.aggro=true;e.ai='combat';}return {pack:label,...fight(g,foes,fightOpts)};}
function trashRun(opts,id,fightOpts){const g=setup(opts),members=new Set(g.enemies.filter(e=>e.pack===id));quiet(g,e=>members.has(e));return pull(g,id,fightOpts);}
/** Kette: zieht ein Pack den Nachbarpack mit? (Kenner-Befund 7) – Held steht zwischen beiden Hof-Packs, einer wird gezogen. */
function chainCheck(){const g=setup({mercs:[]});quiet(g,e=>e.pack==='hof-west'||e.pack==='hof-ost');const west=g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard),east=g.enemies.filter(e=>e.pack==='hof-ost'&&!e.cardboard);
 Object.assign(g.player,g.world.findClear(west[0].x,west[0].y+30,9));west[0].aggro=true;west[0].ai='combat';g.adminGod=true;for(let t=0;t<6;t+=.05){g.tick(.05);for(const e of g.enemies)if(e.cast?.callHelp)e.cast=null;}
 return {westAggro:west.filter(e=>e.aggro).length+'/'+west.length,eastAggro:east.filter(e=>e.aggro).length+'/'+east.length};}

/** Big B (Etappe 3): Tresortür mit Gerds Siegel offen, Held und vier Söldner betreten den Thronsaal an der Tür. */
function bigbRun(opts,fightOpts){const g=setup(opts);quiet(g);onlyBoss(g,'bigb');const run=g.dungeonRun;run.seals.add('siegel-gerd');run.version++;const big=g.enemies.find(e=>e.bossId==='bigb');
 Object.assign(g.player,toWorld(DEF,'k2',49,24));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const r=fight(g,[big],{limit:420,...fightOpts});r.feat=(g.dungeons['schloss-bigb'].feats||[]).includes('nachsatz');return r;}
/** Flügel Burghof am Stück: Hof, Kanzlei, Gerd – Kampf, Erholung auf 80 % und Laufweg (Pfadlänge / Lauftempo) zusammen. */
const WING=['hof-west','hof-ost','kanzlei-nord','kanzlei-sued'];
function wingRun(opts){const g=setup(opts),xp0=g.trainingXp;let time=0,fightTime=0,from=toWorld(DEF,'e0',DEF.start.x,DEF.start.y),deaths=0;const rows=[];
 const walk=to=>{const path=g.world.findPath(from,to);let len=0,at=from;for(const q of path){len+=Math.hypot(q.x-at.x,q.y-at.y);at=q;}from=to;return len/WALK_SPEED+3;};
 const recover=()=>{let t=0;g.player.inCombat=0;while(t<30&&party(g).some(u=>u.hp/u.maxHp<.8&&!(u.state==='down'))){g.tick(.05);t+=.05;}g.events.length=0;return t;};
 for(const id of WING){const {stand}=packAt(id);time+=walk(stand);const r=pull(g,id,{});fightTime+=r.time;time+=r.time+recover();deaths+=r.deaths;rows.push(r.time);}
 const gerd=g.enemies.find(e=>e.bossId==='gerd'),at=toWorld(DEF,'e0',8.5,26);time+=walk(at);Object.assign(g.player,at);for(const c of g.companions){const q=g.world.findClear(at.x+10,at.y+10,9);c.x=q.x;c.y=q.y;}
 const r=fight(g,[gerd],{});fightTime+=r.time;time+=r.time;deaths+=r.deaths;rows.push(r.time);
 const xp=g.trainingXp-xp0;return {minutes:+(time/60).toFixed(1),fightMinutes:+(fightTime/60).toFixed(1),xp,xpPerMin:Math.round(xp/(time/60)),deaths,fights:rows.join('/')};}

/** Farm-Schleife über eine Stunde (Etappe 3, Farm-Lücke): immer wieder Hof West + Gerd (route 'gerd') bzw. der ganze Flügel ('wing'), alles
 *  am selben Spieltag. lockout: wie im Spiel verfällt ein verlassener Durchgang erst nach resetAfter (30 min) – die Wartezeit läuft im Feld
 *  mit der gemessenen Feld-Rate (fieldRate EP/min). Ohne Sperre: sofort ein neuer Durchgang (schlimmster Fall, z. B. künftige Instanz-Rücksetzung). */
function farmHour(opts,{route='gerd',lockout=false,fieldRate=0,minutes=60}={}){
 const g=setup(opts),day=Date.UTC(2026,8,25,12);let clock=day;g.clock=()=>clock;const xp0=g.trainingXp;let time=0,fieldXp=0,runs=0,deaths=0,bossXp=[];
 const walkLen=(from,to)=>{const path=g.world.findPath(from,to);let len=0,at=from;for(const q of path){len+=Math.hypot(q.x-at.x,q.y-at.y);at=q;}return len/WALK_SPEED+3;};
 const recover=()=>{let t=0;g.player.inCombat=0;while(t<30&&party(g).some(u=>u.hp/u.maxHp<.8&&!(u.state==='down'))){g.tick(.05);t+=.05;}g.events.length=0;return t;};
 const packs=route==='wing'?WING:['hof-west'];
 while(time<minutes*60){let from=toWorld(DEF,'e0',DEF.start.x,DEF.start.y);const t0=time;
  for(const id of packs){const {stand}=packAt(id);time+=walkLen(from,stand);from=stand;const r=pull(g,id,{});time+=r.time+recover();deaths+=r.deaths;}
  const gerd=g.enemies.find(e=>e.bossId==='gerd'),at=toWorld(DEF,'e0',8.5,26);time+=walkLen(from,at);Object.assign(g.player,at);for(const c of g.companions){const q=g.world.findClear(at.x+10,at.y+10,9);c.x=q.x;c.y=q.y;}
  const before=g.trainingXp,r=fight(g,[gerd],{});time+=r.time+recover();deaths+=r.deaths;bossXp.push(gerd.hp>0?'–':gerd.xp);runs++;
  // Ausgang (Rückweg) und neuer Durchgang
  time+=walkLen(at,toWorld(DEF,'e0',DEF.exit.x,DEF.exit.y));g.leaveDungeon({force:true});
  if(lockout){const wait=Math.min(minutes*60-time,Math.max(0,DEF.resetAfter-0));if(wait>0){fieldXp+=fieldRate*wait/60;time+=wait;}}
  clock=day+time*1000;g.time+=DEF.resetAfter+1;g.dead=false;g.player.inCombat=0;g.casting=null;g.enterDungeon('schloss-bigb',{force:true});for(const c of g.companions){c.hp=c.maxHp;c.state='follow';}g.player.hp=g.player.maxHp;
  if(time-t0<1)break;}
 const dungeonXp=g.trainingXp-xp0,total=dungeonXp+fieldXp;return {route,lockout,minutes:Math.round(time/60),runs,dungeonXp,fieldXp:Math.round(fieldXp),xpPerMin:Math.round(total/(time/60)),deaths,gerdXp:bossXp.join('/')};}
/** Feld auf Stufe 10 zum Vergleich (wie scripts/class-pacing.mjs): Einzelzüge auf Pfandkeiler (85 %) und Ruhewarte (15 %) mit
 *  Werten der offenen Welt für Stufe 10, 16–24 s Suche und Weg, Erholung auf 80 %. mercs: vier Söldner in Welt-Stärke. */
function fieldRun({classId,spec,seed},{mercs=false,kills=24}={}){
 const stub={id:'feld',spawn:{x:0,y:0},npc:{x:0,y:10},landmarks:[],camps:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]};
 const g=hero(new Game(stub,{classId,level:10,tutorial:{version:1,step:8,completed:true}},{}),{classId,spec,seed}),random=rng(seed+31);g.player.x=500;
 if(mercs)for(const m of Object.values(MERCS))g.hireCompanion(m,{free:true});
 const advance=s=>{for(let t=0;t<s;t+=.05)g.tick(.05);g.events.length=0;},xp0=g.trainingXp,t0=g.time;let deaths=0;
 for(let k=0;k<kills;k++){const kind=random()<.15?'warden':'boar',def=ARCHETYPES[kind],e=makeEnemy({x:g.player.x+30,y:g.player.y},k+1,{...def,...scaledStats(def,10,true)});e.aggro=true;e.ai='combat';e.spawnGrace=0;g.enemies=[e];g.target=e;startAuto(g);
  for(let i=0;i<1600&&e.hp>0&&!g.dead;i++){if(!g.casting&&g.gcd<=0)rotate(g,{healAt:.65});if(Math.hypot(g.player.x-e.x,g.player.y-e.y)>45){const d=Math.hypot(g.player.x-e.x,g.player.y-e.y);g.move(g.player,(e.x-g.player.x)/d*4,(e.y-g.player.y)/d*4);}g.tick(.05);}
  if(g.dead){deaths++;g.respawn();g.player.x=500;}g.enemies=[];g.target=null;advance(16+random()*8);let n=0;while(g.player.hp<g.player.maxHp*.8&&n++<60)advance(1);}
 const minutes=(g.time-t0)/60;return {xpPerMin:Math.round((g.trainingXp-xp0)/minutes),deaths};}

const out={gerd:[],profiles:[],alone:[],trash:[],wing:[],field:[],chain:null,bigb:[],bigbClaim:[],farm:[]};
const log=(group,label,r)=>{out[group].push({label,...r});if(!JSON_OUT)console.log(label.padEnd(62),JSON.stringify(r));};
if(part('gerd'))for(const c of CLASSES)for(const seed of SEEDS)log('gerd','Gerd · '+c.label+' + 4 Söldner · Seed '+seed,gerdRun({...c,seed},{}));
if(part('gerd'))for(const c of CLASSES)for(const seed of SEEDS){log('profiles','weicht nie aus, steht vorn · '+c.label+' · Seed '+seed,gerdRun({...c,seed},{dodge:false,behind:false,front:true}));}
if(part('alone'))for(const c of CLASSES){log('alone','Held allein (unsterblich, reine Zeit) · '+c.label,gerdRun({...c,mercs:[]},{behind:false,immortal:true,limit:900}));
 log('alone','Held allein (sterblich) · '+c.label,gerdRun({...c,mercs:[]},{behind:false,limit:900}));}
if(part('trash'))for(const id of ['hof-west','kanzlei-nord','rittersaal-west','rittersaal-sued','weinkeller-west','wehrgang-mitte'])log('trash','Pack '+id+' · Dieter + 4 Söldner',trashRun({},id,{}));
if(part('wing'))for(const c of CLASSES)log('wing','Flügel Burghof · '+c.label+' + 4 Söldner',wingRun({...c,seed:7}));
if(part('field')||part('wing')||part('farm'))for(const c of CLASSES){log('field','Feld Stufe 10 · '+c.label+' allein',fieldRun({...c,seed:7}));log('field','Feld Stufe 10 · '+c.label+' + 4 Söldner (Welt)',fieldRun({...c,seed:7},{mercs:true}));}
if(part('chain')){out.chain=chainCheck();if(!JSON_OUT)console.log('Kette im Hof (hof-west gezogen)'.padEnd(62),JSON.stringify(out.chain));}
// Etappe 3: Big B in zwei Profilen, Farm-Schleife über eine Stunde
if(part('bigb'))for(const c of CLASSES)for(const seed of SEEDS){log('bigb','Big B · folgt dem Nachsatz · '+c.label+' + 4 Söldner · Seed '+seed,bigbRun({...c,seed},{}));
 log('bigbClaim','Big B · folgt der Behauptung · '+c.label+' + 4 Söldner · Seed '+seed,bigbRun({...c,seed},{lie:'claim'}));}
if(part('farm')){const fieldRate=Math.max(...out.field.map(r=>r.xpPerMin));
 for(const [route,lockout] of [['gerd',false],['gerd',true],['wing',false],['wing',true]])log('farm','Farm-Schleife '+(route==='gerd'?'Hof West + Gerd':'Flügel Burghof')+(lockout?' · mit 30-min-Sperre, Rest Feld':' · ohne Sperre')+' · Dieter · 60 min',farmHour({seed:7},{route,lockout,fieldRate}));}

// Prüfkriterien
const gerdTimes=out.gerd.map(r=>r.time),aloneTimes=out.alone.filter(r=>r.label.includes('unsterblich')).map(r=>r.time),neverDeaths=out.profiles.map(r=>r.deaths),dodgeDeaths=out.gerd.map(r=>r.deaths);
const bestField=Math.max(...out.field.map(r=>r.xpPerMin)),worstWing=Math.min(...out.wing.map(r=>r.xpPerMin));
const bigbTimes=out.bigb.map(r=>r.time),claimDeaths=out.bigbClaim.map(r=>r.deaths),truthDeaths=out.bigb.map(r=>r.deaths),coneAvg=out.gerd.length?+(out.gerd.reduce((n,r)=>n+(r.coneNonTanks||0),0)/Math.max(1,out.gerd.reduce((n,r)=>n+(r.cones||0),0))).toFixed(2):0;
const farmGerd=out.farm.find(r=>r.route==='gerd'&&r.lockout),farmWing=out.farm.find(r=>r.route==='wing'&&r.lockout),farmFree=out.farm.find(r=>r.route==='gerd'&&!r.lockout);
const checks=[
 ...(part('gerd')?[['Gerd mit Held und 4 Söldnern 60–100 s',gerdTimes.every(t=>t>=60&&t<=100)&&out.gerd.every(r=>r.won),Math.min(...gerdTimes)+'–'+Math.max(...gerdTimes)+' s'],
  ['„weicht nie aus“ stirbt mindestens einmal',neverDeaths.every(n=>n>=1),'Tode je Lauf '+neverDeaths.join('/')],
  ['„weicht aus“ stirbt höchstens einmal',dodgeDeaths.every(n=>n<=1),'Tode je Lauf '+dodgeDeaths.join('/')],
  ['Gerd: im Mittel höchstens ein Nicht-Tank im Kegel',coneAvg<=1,coneAvg+' je Rausschmiss (beim Zauberbeginn)']]:[]),
 ...(part('alone')?[['Held allein über 240 s',aloneTimes.every(t=>t>240),Math.min(...aloneTimes)+'–'+Math.max(...aloneTimes)+' s']]:[]),
 ...(part('wing')?[['EP je Minute Flügel Burghof ≥ Feld Stufe 10',worstWing>=bestField,'Flügel mind. '+worstWing+' · Feld höchstens '+bestField]]:[]),
 ...(part('chain')?[['Trash-Pack zieht keine Kette',out.chain.eastAggro.startsWith('0/'),'hof-ost '+out.chain.eastAggro]]:[]),
 ...(part('bigb')?[['Big B mit Held und 4 Söldnern 150–200 s',bigbTimes.every(t=>t>=150&&t<=200)&&out.bigb.every(r=>r.won),Math.min(...bigbTimes)+'–'+Math.max(...bigbTimes)+' s'],
  ['„folgt der Behauptung“ stirbt mindestens einmal',claimDeaths.every(n=>n>=1),'Tode je Lauf '+claimDeaths.join('/')],
  ['„folgt dem Nachsatz“ stirbt höchstens einmal',truthDeaths.every(n=>n<=1),'Tode je Lauf '+truthDeaths.join('/')]]:[]),
 ...(part('farm')?[['Farm-Schleife über eine Stunde ≤ 2× Feld (30-min-Sperre wie im Spiel)',Math.max(farmGerd.xpPerMin,farmWing.xpPerMin)<=2*bestField,'Gerd '+farmGerd.xpPerMin+' · Flügel '+farmWing.xpPerMin+' EP/min · Feld '+bestField+' (ohne Sperre, nur Info: Gerd '+farmFree.xpPerMin+')']]:[])
];
out.checks=checks.map(([name,ok,value])=>({name,ok,value}));
if(JSON_OUT)console.log(JSON.stringify(out,null,1));else{console.log('\nPrüfkriterien');for(const c of out.checks)console.log((c.ok?'GRÜN ':'ROT  ')+c.name.padEnd(48)+c.value);}
if(out.checks.some(c=>!c.ok))process.exitCode=1;
