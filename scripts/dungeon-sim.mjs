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
// Etappe 4 Teil A: Frau Dr. Exposé, Korken-Kurt, Reichweiten-Rita und das halbe Pferd je 70–110 s mit Held und 4 Söldnern · „ignoriert
// Mechanik“ (weicht nicht aus, sammelt und verteilt nicht, geht nicht hinter Deckung, nimmt keine Adds) stirbt je Lauf mindestens einmal,
// „spielt richtig“ höchstens einmal · Gerds Schutz-Söldner überlebt die meisten Läufe (Nebenbefund Etappe 3). --only=expose,kurt,rita,pferd
// Feinschliff 2026-09-26 (docs/DUNGEON-FEINSCHLIFF-2026-09-26.md): Rita auch mit allen fünf Klassen und im Flügel 70–110 s; Rückweg-Gegner nach der Frist
// zu Hause. Messung der Flügel ehrlicher: Wege von Punkten dicht an der Wand (vorher kein Weg → pauschal 60 s), das halbe Pferd immer dabei, nach einem
// Wipe weiter vom Kontrollpunkt und den Pack noch einmal, „ein Pack je Zug“ unterbricht den Funkspruch, trifft ruhende Nachbarn nicht und verschnauft
// ungestört, kein Schritt in eine offene Boss-Arena, und ein Kampf ohne Fortschritt endet wie beim Spieler (Aufstehen bzw. Weggehen).
// Weitere Schalter: SIM_WING_SEED (Flügel-Seed, Vorgabe 7).
// Dungeon-Fix 2 (docs/DUNGEON-FIX2-2026-09-26.md, Prüfer-Endabnahme #715): Der Held trägt jetzt die typische Ausrüstung aus dem Leveln
// (scripts/gear-profiles.mjs; SIM_GEAR=typical|start|uncommon, Vorgabe typical) statt eines vollen Satzes ungewöhnlich auf Stufe 10. Neuer Teil
// --only=gear: jeder Pack mit typischer und Startausrüstung (SIM_GEAR_SEEDS, Vorgabe 7), der erste Pull wie ein Neuling (Hof West ohne
// Unterbrechen, Nachbarpacks stehen) und jeder Boss mit Startausrüstung. Fortschritt eines Kampfs zählt über alle, die je mitkämpften.
import {readFileSync} from 'node:fs';
import {World,rng} from '../world.js';
import {Game} from '../engine.js';
import {makeEnemy,scaledStats,ENCOUNTER_RULES,beginReturn} from '../encounters.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_ENEMIES,TUTORIAL,CLASS_SPECS,ARCHETYPES} from '../content/index.js';
import {toWorld,coneHits,floorAt,inLane,roomAt,inHazard,hideSpots,spawnRareBoss,lostSight,transitionUsable,dungeonAct,arenaAhead,packFirstSpecial} from '../dungeon.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from './balance-rotation.mjs';
import {changeSpec,pathBuild,learnTalent,talentPoints,TALENTS} from '../talents.js';
import {available} from '../progression.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {WALK_SPEED} from '../movement.js';
import {applyGearProfile} from './gear-profiles.mjs';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const TRACE=!!process.env.SIM_TRACE,DEF=DUNGEONS['schloss-bigb'],JSON_OUT=process.argv.includes('--json'),ONLY=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7).split(',').filter(Boolean),part=n=>!ONLY.length||ONLY.includes(n);
/* Dungeon-Fix 2 (2026-09-26): Ausrüstung des Helden – 'typical' (Vorgabe, aus dem Leveln hergeleitet, scripts/gear-profiles.mjs), 'start' (Startausrüstung) oder
   'uncommon' (voller Satz ungewöhnlich auf Stufe 10, bisherige Vorgabe). Umschalten mit SIM_GEAR. */
export const SIM_GEAR=process.env.SIM_GEAR||'typical';
const GEAR_SLOTS=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
const PROFILES=['tresen','bass','pfand'];
// E-72 (Klassen-Ressourcen): Schwenker-Schorsch (Flambierer, Nahkampf) und Kreuz-Käthe (Grand-Spielerin, Fernkampf) sind spielbar und laufen mit;
// die Rotation spielt jede Ressource wie ein geübter Spieler (scripts/balance-rotation.mjs).
export const CLASSES=[{classId:'dieter',spec:'dieter-brawl',label:'Dieter Kneipenschläger'},{classId:'baerbel',spec:'baerbel-feedback',label:'Bärbel Putzpyramide'},{classId:'kevin',spec:'kevin-hunt',label:'Kevin Pfandjäger'},
 {classId:'schorsch',spec:'schorsch-flamme',label:'Schorsch Flambierer'},{classId:'kaethe',spec:'kaethe-grand',label:'Käthe Grand-Spielerin'}].filter(c=>!process.env.SIM_CLASS||c.classId===process.env.SIM_CLASS);
export const SEEDS=[7,8,9].filter(x=>!process.env.SIM_SEED||String(x)===process.env.SIM_SEED);
const MERCS={tank:'merc-pils-peter',heal:'merc-schorle-susi',dps1:'merc-radler-rita',dps2:'merc-hopfen-horst'};
function equipSet(g,quality,level){/* Dungeon-Fix 2: typische Ausrüstung aus dem Leveln (scripts/gear-profiles.mjs) */if(quality==='typical'){applyGearProfile(g,'typical',{ITEMS,addItem,equipItem,registerRoll});return;}if(quality==='start')quality='none';g.rpg.inventory=[];for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;if(quality==='none'){for(const [slot,id] of Object.entries(TUTORIAL.starterEquipment)){addItem(g.rpg,id);equipItem(g,id,slot);}return;}
 GEAR_SLOTS.forEach(([slot,target,roll],i)=>{const id=registerRoll(g.rpg,ITEMS,{slot,spec:PROFILES[i%3],level,quality,roll,family:'boar'});addItem(g.rpg,id);equipItem(g,id,target);});}
function learnBuild(g,spec,path=0){const budget=Math.max(0,talentPoints(g));for(const id of pathBuild(spec,path,budget))learnTalent(g,id);
 for(const tree of [spec,...Object.values(CLASS_SPECS).find(l=>l.includes(spec)).filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<budget)learnTalent(g,t.id);}
function hero(g,{classId,spec,gear=SIM_GEAR,seed}){g.random=rng(seed);g.lootRandom=()=>.99;g.toast=()=>{};changeSpec(g,spec);equipSet(g,gear,10);g.refreshStats();learnBuild(g,spec);g.refreshStats();g.player.hp=g.player.maxHp;g.rpg.coins=9999;return g;}
export function setup({classId='dieter',spec='dieter-brawl',gear=SIM_GEAR,mercs=['tank','heal','dps1','dps2'],seed=7}){
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
  if(lie==='none')continue;/* Etappe 4 Teil A: „ignoriert Mechanik“ */
  if(k.lanes){if(lie==='claim'){if(!k.lie)continue;if(!k.told)k.heroClaim=true;if(k.heroClaim){const opp=k.lanes[k.lanes.length-1-k.claimLane];return {x:opp.x+opp.w/2,y:p.y};}continue;}
   if(k.told===false)continue;const bad=(k.truthLanes||[]).map(i=>k.lanes[i]).filter(Boolean);if(!bad.some(r=>inLane(r,p,8)))continue;
   if(k.lanes[0].axis==='y'){/* Etappe 4 Teil A: waagrechte Rinnen – senkrecht heraus */const lo=Math.min(...k.lanes.map(r=>r.y))-30,hi=Math.max(...k.lanes.map(r=>r.y+r.h))+30,ys=bad.flatMap(r=>[r.y-16,r.y+r.h+16]).filter(y=>y>=lo&&y<=hi&&!bad.some(r=>inLane(r,{x:p.x,y},8))).sort((a,b)=>Math.abs(a-p.y)-Math.abs(b-p.y));if(ys.length)return {x:p.x,y:ys[0]};continue;}
   const lo=Math.min(...k.lanes.map(r=>r.x))+10,hi=Math.max(...k.lanes.map(r=>r.x+r.w))-10;/* nur Punkte in der Arena */const xs=bad.flatMap(r=>[r.x-16,r.x+r.w+16]).filter(x=>x>=lo&&x<=hi&&!bad.some(r=>inLane(r,{x,y:p.y},8))).sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x));if(xs.length)return {x:xs[0],y:p.y};continue;}
  if(lie!=='claim'&&k.spots&&k.told!==false){for(const s of k.spots.filter(s=>!s.decoy))if(inEll(p,{x:s.x,y:s.y,radius:k.radius*1.1})){const a=Math.atan2(p.y-s.y,p.x-s.x);return escape(g,p,s,k.radius+16);}}}
 if(lie!=='claim'&&lie!=='none')for(const h of g.dungeonRun?.hazards||[])if(!h.rect&&Math.hypot(p.x-h.x,p.y-h.y)<h.radius+4){const a=Math.atan2(p.y-h.y,p.x-h.x);return {x:h.x+Math.cos(a)*(h.radius+14),y:h.y+Math.sin(a)*(h.radius+14)};}
 return null;
}
/** Etappe 4 Teil A, Profil „spielt richtig“: zum Markierten (Sammeln), weg vom Nächsten (Verteilen), hinter Deckung (Blitzlicht), raus aus
 *  nassen Streifen. Wie die Söldner erst nach einer Reaktionszeit von 0,35 s. → Laufziel (auch „stehen bleiben“) oder null. */
function e4Goal(g,p){const run=g.dungeonRun;if(!run)return null;const mates=g.companions.filter(c=>c.state!=='down'&&c.hp>0),d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 for(const e of g.enemies){const k=e.cast;if(!k||!(e.hp>0)||k.total-k.remaining<.35)continue;
  if(k.stack){const m=k.victim==='player'?p:mates.find(c=>c.id===k.victim);if(!m)continue;if(m===p||d(m,p)<=k.stack.radius-14)return {x:p.x,y:p.y};return {x:m.x,y:m.y};}
  if(k.spread){const r=k.spread.radius+12;if(mates.every(o=>d(o,p)>=r))return {x:p.x,y:p.y};let best=null,bd=1e9;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;for(const f of [.9,1.3,1.8]){const q={x:p.x+Math.cos(a)*r*f,y:p.y+Math.sin(a)*r*f};if(roomAt(DEF,q.x,q.y)?.id!==e.dungeonBoss?.room||g.world.blocked(q.x,q.y,9)||mates.some(o=>d(o,q)<r))continue;const v=d(q,p)+d(q,e)*.3;if(v<bd){bd=v;best=q;}}}if(best)return best;continue;}
  if(k.los){if(!g.world.lineClear(e,p))return {x:p.x,y:p.y};let best=null,bd=1e9;for(const q of hideSpots(g,e))if(d(p,q)<bd){bd=d(p,q);best=q;}if(best)return best;}}
 const wet=(run.hazards||[]).filter(h=>h.rect),h=wet.find(w=>inHazard(w,p,4));
 if(h)for(let s=8;s<400;s+=8)for(const sgn of [1,-1]){const q={x:p.x+sgn*s,y:p.y};if(!wet.some(w=>inHazard(w,q,12))&&roomAt(DEF,q.x,q.y)?.id===roomAt(DEF,h.x,h.y)?.id&&!g.world.blocked(q.x,q.y,9))return q;}
 return null;}
/** Raus aus einer Fläche (Ellipse wie am Boden): erst direkt weg vom Mittelpunkt, sonst seitlich – in engen Räumen (Stallungen) liegt
 *  „direkt weg“ oft in der Wand (Etappe 4 Teil A). */
function escape(g,p,c,r){const base=Math.atan2(p.y-c.y,p.x-c.x)||0;let first=null;for(const turn of [0,.6,-.6,1.3,-1.3,2.2,-2.2,Math.PI]){const a=base+turn,q={x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r*.75};first||=q;if(!g.world.blocked(q.x,q.y,9))return q;}return first;}
/** Nicht-Tanks im Kegel beim Zauberbeginn (Etappe 3, Aufstellung nach Rolle): Held und Söldner außer dem, den der Gegner angeht. */
function coneCount(g,e,k){const holder=k.focus||(e.focus&&e.focus!=='player'?e.focus:'player');let n=0;if(!g.dead&&holder!=='player'&&coneHits(e,k,g.player,g))n++;for(const c of g.companions)if(c.state!=='down'&&c.hp>0&&c.id!==holder&&coneHits(e,k,c,g))n++;return n;}
export function fight(g,foes,{dodge=true,behind=true,front=false,limit=600,immortal=false,lie='truth',calls=false,release=false}={}){
 const dt=.05,p=g.player,stats={time:0,deaths:0,revives:0,wipes:0,mercDowns:0,mechHits:0,fell:0,taken:0,healed:0,minHpPct:100,minPartyPct:100,cones:0,coneNonTanks:0,lieHits:0,signed:0,sold:0,tankDowns:0},seenCones=new WeakSet(),seenFoes=new Set();
 const primary=foes[0];g.target=primary;primary.aggro=true;primary.ai='combat';p.inCombat=7;startAuto(g);g.adminGod=immortal;
 for(let t=0;t<limit;t+=dt){
  if(!foes.some(e=>e.hp>0)&&!g.enemies.some(e=>e.hp>0&&e.aggro&&e.ai==='combat'))break;
  // Über die Kante gefallen (ab Phase 2): wie ein Spieler die Kellertreppe gleich neben der Landestelle wieder hoch
  if(!g.dead&&floorAt(DEF,p.x,p.y)==='k1'&&foes.some(e=>e.hp>0&&floorAt(DEF,e.x,e.y)==='e0')){Object.assign(p,toWorld(DEF,'k1',10.5,8));g.dungeonStep('treppe-zugbruecke','b');}
  if(!g.dead){
   /* Etappe 4 Teil A: wer richtig spielt, nimmt den Interessenten am nächsten zum Tisch; unsichtbare Ziele fallen weg */if(dodge&&lie!=='none'){const add=g.enemies.filter(e=>e.goalAt&&e.hp>0&&!e.signedOff&&e.aggro).sort((a,b)=>Math.hypot(a.x-a.goalAt.x,a.y-a.goalAt.y)-Math.hypot(b.x-b.goalAt.x,b.y-b.goalAt.y))[0];if(add&&g.target!==add){g.target=add;startAuto(g);}}
   if(g.target?.hidden)g.target=null;
   /* nach einem Rücksetzen (VERKAUFT) zieht der Held den Boss wieder */if(!(g.target?.hp>0)&&primary.hp>0&&!primary.aggro&&!g.enemies.some(e=>e.hp>0&&e.aggro&&!e.hidden)){g.target=primary;startAuto(g);}
   /* Feinschliff 2026-09-26: kein Nachhelfen mehr bei Ratten auf dem Rückweg – das Spiel bringt sie selbst zurück (dungeon.js findPath, Frist in
      encounters.js); gemessen wird der längste Rückweg (returnMax) */
   /* Etappe 4 Teil B: ist der erste schon tot und der Rest des Packs zurückgelaufen, zieht der Held den nächsten Rest wieder (sonst 600 s Stillstand) */if(
!(g.target?.hp>0)&&!(primary.hp>0)&&!g.enemies.some(e=>e.hp>0&&e.aggro&&!e.hidden)){const rest=foes.filter(e=>e.hp>0&&!e.hidden).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(rest){g.target=rest;startAuto(g);}}
   if(!(g.target?.hp>0)){g.target=g.enemies.filter(e=>e.hp>0&&e.aggro&&!e.hidden).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;if(g.target)startAuto(g);}
   const tgt=g.target;let goal=null;
   goal=(dodge&&lie==='truth'?e4Goal(g,p):null)||mechGoal(g,p,dodge?lie:lie==='none'?'none':'claim');
   if(dodge&&!goal){for(const e of g.enemies){const k=e.cast;if(!k||e.hp<=0)continue;
     if(k.cone&&coneHits(e,k,p,g)){const a=(k.angle??0)+Math.PI*.6;goal={x:e.x+Math.cos(a)*40,y:e.y+Math.sin(a)*40};}
     else if(k.ground&&inEll(p,k))goal=escape(g,p,k,k.radius+14);}}
   if(!goal&&tgt){const holder=g.companions.find(c=>c.id===tgt.focus&&c.state!=='down');/* wen der Gegner gerade angeht (meist der Schutz-Söldner) */
    if((behind||front)&&holder){const d=Math.hypot(tgt.x-holder.x,tgt.y-holder.y)||1,side=front?-1:1;goal={x:tgt.x+side*(tgt.x-holder.x)/d*26,y:tgt.y+side*(tgt.y-holder.y)/d*26};}
    else if(Math.hypot(tgt.x-p.x,tgt.y-p.y)>30)goal={x:tgt.x,y:tgt.y};
    /* Etappe 4 Teil A: wer geübt spielt, bleibt nicht hinter Deckung stehen, wenn gerade kein Blitzlicht kommt – Stelle mit Sicht aufs Ziel */
    const at=goal||p;if(lostSight(g,tgt,at)/* nur in Räumen mit Deckung (Studio), wie die Söldner */){let best=null,bd=1e9;for(const r of [26,18,36])for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:tgt.x+Math.cos(a)*r,y:tgt.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,9)||!g.world.lineClear(q,tgt)||roomAt(DEF,q.x,q.y)?.id!==roomAt(DEF,tgt.x,tgt.y)?.id)continue;const v=Math.hypot(q.x-at.x,q.y-at.y);if(v<bd){bd=v;best=q;}}if(best)goal=best;}}
   /* Feinschliff 2026-09-26: wer sorgfältig spielt, tritt beim Trash nicht in eine offene Boss-Arena (vorher stellte sich Schorsch „hinter“ einen
      Azubi an der Zugbrücke, also in Gerds Arena) */if(goal&&arenaAhead(g,goal))goal=null;
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6&&arenaAhead(g,g.world.findClear(goal.x,goal.y,7)))goal=null;/* auch der freigerückte Punkt nicht in einer offenen Arena */
   /* Dungeon-Fix 2 (2026-09-26): wer sorgfältig spielt, geht nicht in eine laufende Bodenfläche zurück und zaubert nicht, solange er in einer steht –
      vorher lief der Held nach dem Ausweichen gleich wieder „hinter“ den Boss in die Fläche (Kevin im Wiehern des halben Pferds, typische Ausrüstung) */
   const inGround=q=>g.enemies.some(e=>e.hp>0&&e.cast?.ground&&Number.isFinite(e.cast.x)&&inEll(q,e.cast)),careGround=dodge&&lie!=='none';
   if(careGround&&goal&&!inGround(p)&&inGround(goal))goal=null;
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){const to=g.world.findClear(goal.x,goal.y,7);/* Etappe 4 Teil A: um Deckung herum per Wegsuche */let via=to;if(!g.world.walkClear(p,to,6)){const path=g.world.findPath(p,to);via=path.find(q=>Math.hypot(q.x-p.x,q.y-p.y)>12)||to;}g.moveTo=via;g.path=[];}else g.moveTo=null;
   /* Feinschliff 2026-09-26, „ein Pack je Zug“: wer sorgfältig spielt, unterbricht den Funkspruch (Q, Hinweis „Unterbrechen“) nach 0,35 s – sonst
      kommen die Nachbarn, und die Flügelzeit hängt an Wipes statt am Pack */if(calls&&!g.casting&&available(g,'interrupt')&&!(g.cooldowns.interrupt>0)){const call=g.enemies.find(e=>e.hp>0&&e.cast?.callHelp&&e.cast.total-e.cast.remaining>=.35&&Math.hypot(e.x-p.x,e.y-p.y)<=130&&g.world.lineClear(p,e));if(call){const keep=g.target;g.target=call;g.action('interrupt');if(keep?.hp>0)g.target=keep;}}
   if(!g.casting&&g.gcd<=0&&tgt&&!(careGround&&inGround(p)&&g.moveTo))rotate(g);/* nur solange er aus der Fläche läuft */
  }
  const before=party(g).map(u=>u.hp),floor=floorAt(DEF,p.x,p.y),casting=g.enemies.map(e=>[e,e.cast?.type,e.sideCast?.type]);
  g.tick(dt);stats.time+=dt;for(const e of foes)if(e.ai==='returning')stats.returnMax=Math.max(stats.returnMax||0,+e.returnTime.toFixed(1));
  if(process.env.SIM_POS&&Math.round(stats.time*20)%100===0){const o=DEF.floors[floorAt(DEF,p.x,p.y)||"k1"].origin,mm=u=>((u.x-o.x)/8).toFixed(1)+","+((u.y-o.y)/8).toFixed(1),b=foes[0];console.error("  pos t="+stats.time.toFixed(0)+" Held@"+mm(p)+(g.target?" Ziel "+g.target.name:"")+" Boss@"+mm(b)+" "+Math.round(b.hp/b.maxHp*100)+"%"+(g.moveTo?" moveTo@"+mm(g.moveTo):"")+(g.casting?" zaubert "+g.casting.id:"")+(p.moving?" läuft":"")+(g.activity?" akt "+g.activity.kind:"")+(b.hidden?" unsichtbar":"")+(b.retreat?" rückzug":"")+" fokus "+b.focus+" "+g.companions.map(c=>c.name.slice(0,4)+"@"+mm(c)+c.state[0]).join(" "));}
  for(const e of foes){const k=e.cast;if(k?.cone&&!seenCones.has(k)){seenCones.add(k);stats.cones++;stats.coneNonTanks+=coneCount(g,e,k);}}
  party(g).forEach((u,i)=>{const d=u.hp-before[i];if(d<0)stats.taken-=d;else if(d>0&&before[i]>0)stats.healed+=d;if(u===p&&d<-.15*p.maxHp)stats.mechHits++;if(TRACE&&u===p&&d<-.08*p.maxHp){const src=casting.find(([e,x,y])=>(x&&!e.cast)||(y&&!e.sideCast));console.error("  t="+stats.time.toFixed(1)+" Held "+Math.round(u.hp/u.maxHp*100)+" % ("+Math.round(d/p.maxHp*100)+" %) "+(src?(src[1]&&!src[0].cast?src[1]:src[2]):"auto"));}
   /* Etappe 3: woran Söldner fallen (Zauber, der in diesem Takt endete, sonst Autoangriff) */if(u!==p&&before[i]>0&&u.hp<=0){const src=casting.find(([e,a,b])=>(a&&!e.cast)||(b&&!e.sideCast));(stats.mercDownBy||=[]).push(u.name.split("-")[0]+":"+(src?(src[1]&&!src[0].cast?src[1]:src[2]):"auto"));}});
  if(floorAt(DEF,p.x,p.y)!==floor&&!g.dead)stats.fell++;
  for(const ev of g.events){if(ev.type==='death'){stats.deaths++;(stats.deathBy||=[]).push(ev.skill?.split(' · ')[0]||'Autoangriff');}if(ev.type==='revived'&&ev.from!==undefined)stats.revives++;if(ev.type==='down'){stats.mercDowns++;if(g.companions.find(c=>c.id===ev.id)?.def.role==='tank')stats.tankDowns++;}if(ev.type==='dungeonSigned')stats.signed++;if(ev.type==='dungeonSold')stats.sold++;if(ev.type==='dungeonWipe')stats.wipes++;}
  g.events.length=0;
  if(!g.dead)stats.minHpPct=Math.min(stats.minHpPct,Math.round(p.hp/p.maxHp*100));
  for(const c of g.companions)if(c.state!=='down')stats.minPartyPct=Math.min(stats.minPartyPct,Math.round(c.hp/c.maxHp*100));
  if(stats.wipes)break;
  /* Feinschliff 2026-09-26: Kommt ein Kampf 30 s (mit Boss 60 s) lang nicht voran (die Gegner verlieren zusammen keine 3 % ihres Lebens – etwa ein Heiler in der
     Ecke gegen Söldner ohne Held, oder ein Gegner ohne Weg), handelt der Held wie ein Spieler: als Geist steht er am Kontrollpunkt auf, lebend geht er,
     und die Gegner lassen ab und gehen zurück. Vorher hing so ein Kampf bis zum Limit von 600 s. */if(release){const on=g.enemies.filter(e=>e.aggro&&e.hp>0);/* Dungeon-Fix 2: Fortschritt über alle, die im Kampf waren – wer später dazukommt (Streife, Pack-Zug), setzte vorher den Maßstab zurück, und der Kampf galt nach 30 s als festgefahren (Galerie-Streife) */for(const e of on)seenFoes.add(e);const seen=[...seenFoes],lost=seen.reduce((n,e)=>n+e.maxHp-Math.max(0,e.hp),0),max=seen.reduce((n,e)=>n+e.maxHp,0);
   if(stats.progAt==null||lost>stats.progLost+.03*max){stats.progAt=stats.time;stats.progLost=lost;}else if(stats.time-stats.progAt>(on.some(e=>e.dungeonBoss)?60:30)/* Bosse mit Heilung (Trog, Notartermin): 60 s */){if(g.dead){g.respawn();stats.wipes++;stats.released=true;}else for(const e of on){e.threat=null;e.focus=null;beginReturn(g,e);}stats.stalled=true;break;}}
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
const ambush=(pack,floor)=>{const others=[...DEF.packs.filter(p=>p.id!==pack.id&&!p.patrol&&DEF.rooms.find(r=>r.id===p.room)?.floor===floor).map(p=>p.at),...DEF.bosses.filter(b=>DEF.rooms.find(r=>r.id===b.room)?.floor===floor).map(b=>b.at),...(DEF.doors||[]).filter(d=>d.floor===floor&&d.arena).map(d=>[d.rect[0]+d.rect[2]/2,d.rect[1]+d.rect[3]/2])];let best=pack.patrol[0],bd=-1;for(const w of pack.patrol){const d=Math.min(...others.map(o=>Math.hypot(o[0]-w[0],o[1]-w[1])));if(d>bd){bd=d;best=w;}}return toWorld(DEF,floor,best[0],best[1]);};
export function pull(g,id,fightOpts){const {pack,stand:at,floor}=packAt(id),members=g.enemies.filter(e=>e.pack===pack.id&&e.hp>0);/* Etappe 4 Teil B: Streifen wartet der Held an der Ecke ihres Wegs ab, die am weitesten von anderen Packs und Bosstüren liegt */let stand=at;if(pack.patrol){stand=ambush(pack,floor);for(const e of members){const q=g.world.findClear(stand.x+(g.random()-.5)*20,stand.y+(g.random()-.5)*20,9);e.x=q.x;e.y=q.y;}}Object.assign(g.player,g.world.findClear(stand.x,stand.y,9));g.player.inCombat=0;
 for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const foes=members.filter(e=>!e.cardboard),label=pack.id+' ('+pack.members.join('+')+')';if(!foes.length)return {pack:label,time:0,deaths:0,note:'schon gelegt'};/* Dungeon-Fix 2: wie im Spiel über den Pack-Zug – gleiche Gegner fangen versetzt an (dungeon.js packFirstSpecial) */for(const e of foes){e.attackTimer=packFirstSpecial(g,e);e.aggro=true;e.ai='combat';}return {pack:label,...fight(g,foes,fightOpts)};}
function trashRun(opts,id,fightOpts){const g=setup(opts),members=new Set(g.enemies.filter(e=>e.pack===id));quiet(g,e=>members.has(e));return pull(g,id,fightOpts);}
// ── Dungeon-Fix 2 (2026-09-26, Endabnahme Build #715): Ausrüstungsprofile ────────────────────────────────────────────────────────────
// Ein Pack allein (sorgfältig: unterbricht den Funkspruch, weicht aus) mit Start-, typischer und voller Ausrüstung. heal = an der Gruppe
// geheiltes Leben als Anteil am Höchstleben der ganzen Gruppe („kostet den Heiler spürbar“). downs = Tode des Helden + Söldner am Boden.
const partyMax=g=>party(g).reduce((n,u)=>n+u.maxHp,0);
export function packProfile(opts,id){const g=setup(opts),members=new Set(g.enemies.filter(e=>e.pack===id));quiet(g,e=>members.has(e));const max=partyMax(g),heroHp=g.player.maxHp;const r=pull(g,id,{calls:true,release:true});
 return {pack:id,gear:opts.gear,cls:opts.classId,time:r.time,won:!!r.won||r.note==='schon gelegt',deaths:r.deaths||0,mercDowns:r.mercDowns||0,wipes:r.wipes||0,downs:(r.deaths||0)+(r.mercDowns||0),heal:+((r.healed||0)/max).toFixed(2),minParty:r.minPartyPct,minHero:r.minHpPct,heroHp};}
/** Packs mit echten Gegnern (ohne reine Pappwachen und ohne die Projektion, die mit dem Beamer geht). */
export const FIGHT_PACKS=DEF.packs.filter(p=>p.members.some(k=>!DUNGEON_ENEMIES[k]?.cardboard&&!DUNGEON_ENEMIES[k]?.illusion)).map(p=>p.id);
/** Erster Pull wie ein Neuling (Prüfer-Endabnahme #715): Held kommt vom Kontrollpunkt des Hofs, zielt den nächsten Azubi von Hof West an,
 *  läuft heran (Fernkämpfer bleiben auf Wurfweite), Autoangriff und Rotation, weicht nichts aus und unterbricht nicht; die Nachbarpacks
 *  stehen. Die Söldner spielen wie immer. → Wipe, Tode, wer mitkam. */
export function firstPull(opts,{pack='hof-west',from=[31,37],limit=180}={}){
 const g=setup(opts),p=g.player,start=toWorld(DEF,'e0',...from),ranged=g.skills.find(s=>s.id==='auto')?.weaponSource==='ranged';Object.assign(p,start);p.inCombat=0;
 g.companions.forEach((m,i)=>{const q=g.world.findClear(start.x-24+i*16,start.y+16,9);m.x=q.x;m.y=q.y;});
 const near=u=>(a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y);g.target=g.enemies.filter(e=>e.pack===pack&&!e.cardboard).sort(near(start))[0];const max=partyMax(g);
 const st={deaths:0,mercDowns:0,wipes:0,healed:0,packs:new Set()};let t=0;
 for(;t<limit;t+=.05){
  if(!g.dead){if(!(g.target?.hp>0)){g.target=g.enemies.filter(e=>e.hp>0&&e.aggro&&!e.hidden).sort(near(p))[0]||null;if(g.target)startAuto(g);}
   const e=g.target;if(e){const d=Math.hypot(e.x-p.x,e.y-p.y),reach=ranged?90:28;if(d>reach){g.moveTo=g.world.findClear(e.x,e.y,7);g.path=[];}else g.moveTo=null;if(d<160&&!g.autoAttack)startAuto(g);if(!g.casting&&g.gcd<=0&&d<reach+30)rotate(g);}}
  const before=party(g).map(u=>u.hp);g.tick(.05);party(g).forEach((u,i)=>{const d=u.hp-before[i];if(d>0&&before[i]>0)st.healed+=d;});
  for(const e of g.enemies)if(e.aggro&&e.pack&&e.hp>0)st.packs.add(e.pack);
  for(const ev of g.events){if(ev.type==='death')st.deaths++;if(ev.type==='down')st.mercDowns++;if(ev.type==='dungeonWipe')st.wipes++;}g.events.length=0;
  if(st.wipes||t>5&&!g.enemies.some(e=>e.hp>0&&e.aggro&&e.ai==='combat'))break;}
 return {gear:opts.gear,cls:opts.classId,time:Math.round(t),won:!st.wipes&&!g.enemies.some(e=>e.pack===pack&&e.hp>0&&!e.cardboard),deaths:st.deaths,mercDowns:st.mercDowns,downs:st.deaths+st.mercDowns,wipes:st.wipes,heal:+(st.healed/max).toFixed(2),packs:[...st.packs].join('+')};}
/** Kette: zieht ein Pack den Nachbarpack mit? (Kenner-Befund 7) – Held steht zwischen beiden Hof-Packs, einer wird gezogen. */
function chainCheck(){const g=setup({mercs:[]});quiet(g,e=>e.pack==='hof-west'||e.pack==='hof-ost');const west=g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard),east=g.enemies.filter(e=>e.pack==='hof-ost'&&!e.cardboard);
 Object.assign(g.player,g.world.findClear(west[0].x,west[0].y+30,9));west[0].aggro=true;west[0].ai='combat';g.adminGod=true;for(let t=0;t<6;t+=.05){g.tick(.05);for(const e of g.enemies)if(e.cast?.callHelp)e.cast=null;}
 return {westAggro:west.filter(e=>e.aggro).length+'/'+west.length,eastAggro:east.filter(e=>e.aggro).length+'/'+east.length};}

/** Big B (Etappe 3): Tresortür mit Gerds Siegel offen, Held und vier Söldner betreten den Thronsaal an der Tür. */
function bigbRun(opts,fightOpts){const g=setup(opts);quiet(g);onlyBoss(g,'bigb');const run=g.dungeonRun;for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])run.seals.add(s);run.version++;const big=g.enemies.find(e=>e.bossId==='bigb');
 Object.assign(g.player,toWorld(DEF,'k2',49,24));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const r=fight(g,[big],{limit:420,...fightOpts});r.feat=(g.dungeons['schloss-bigb'].feats||[]).includes('nachsatz');return r;}
/** Etappe 4 Teil A: einer der restlichen Bosse mit Held und vier Söldnern, alle Siegel da (Tresortür egal), nur dieser Boss steht. Der Held
 *  startet an der Arenatür. Das halbe Pferd wird erzwungen (sonst 30 %). */
export const E4_BOSSES={expose:['k1',32,40.6],korkenkurt:['k2',16.2,27.6],rita:['k1',58.4,18.2],halbespferd:['k1',27.2,4]};
export function bossRun(id,opts,fightOpts){const g=setup(opts);quiet(g);if(DEF.bosses.find(b=>b.id===id)?.rare)spawnRareBoss(g,id);onlyBoss(g,id);const run=g.dungeonRun;for(const b of DEF.bosses)if(b.seal)run.seals.add(b.seal);run.version++;
 const boss=g.enemies.find(e=>e.bossId===id),[f,x,y]=E4_BOSSES[id];Object.assign(g.player,toWorld(DEF,f,x,y));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const r=fight(g,[boss],{limit:420,...fightOpts});return Object.assign(r,{laneHits:boss.laneHits||0,blinded:boss.blinded||0,drank:boss.drank||0,hides:boss.hides||0,stack:(boss.stackShares||[]).join('/'),overlaps:boss.spreadOverlaps||0});}
/** Flügel Burghof am Stück: Hof, Kanzlei, Gerd – Kampf, Erholung auf 80 % und Laufweg (Pfadlänge / Lauftempo) zusammen. */
const WING=['hof-west','hof-ost','kanzlei-nord','kanzlei-sued'];
function wingRun(opts){const g=setup(opts),xp0=g.trainingXp;let time=0,fightTime=0,from=toWorld(DEF,'e0',DEF.start.x,DEF.start.y),deaths=0;const rows=[];
 const walk=to=>{const path=g.world.findPath(from,to);let len=0,at=from;for(const q of path){len+=Math.hypot(q.x-at.x,q.y-at.y);at=q;}from=to;return len/WALK_SPEED+3;};
 const recover=()=>{let t=0;if(g.dead)g.respawn();/* Etappe 4 Teil B: nach einem Wipe am Kontrollpunkt aufstehen, Söldner wieder auf den Beinen */g.player.inCombat=0;while(t<60&&(party(g).some(u=>u.hp/u.maxHp<.8)||g.companions.some(c=>c.state==='down'))){g.tick(.05);t+=.05;}g.events.length=0;return t;};
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
 const recover=()=>{let t=0;if(g.dead)g.respawn();/* Etappe 4 Teil B: nach einem Wipe am Kontrollpunkt aufstehen, Söldner wieder auf den Beinen */g.player.inCombat=0;while(t<60&&(party(g).some(u=>u.hp/u.maxHp<.8)||g.companions.some(c=>c.state==='down'))){g.tick(.05);t+=.05;}g.events.length=0;return t;};
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

// ── Etappe 4 Teil B (E-71): drei Flügel à 10–15 min und der volle Durchgang (docs/DUNGEON-ETAPPE-4B-2026-09-25.md). Ein Held mit vier Söldnern
// geht die Flügel der Reihe nach durch (Burghof → Rittergeschoss → Basaltgewölbe → Big B): je Flügel alle Packs seiner Räume, Funde und Ereignisse
// (feste Zeit), die Bosse seiner Räume und die kleine Truhe; Reihenfolge je Flügel „nächstes Ziel zuerst“. Laufzeit = echter Weg (findPath über
// Türen und Übergänge, Lauftempo) + 3 s je Weg; nach jedem Kampf Erholung auf 80 %. Nicht gebaute Bosse (Teil A: Exposé, Kurt, Rita, Pferd) zählen
// mit ihrer Zielzeit aus der Planung (Abschnitt 7) und ohne Boss-EP – sobald sie in DUNGEON_BOSSES stehen, kämpft die Simulation sie echt.
const REWARD_REPEAT=1/3;/* DUNGEON_REWARDS.repeatXp: jeder weitere Sieg am selben Tag */
const PLAN_TIME={expose:88,korkenkurt:100,rita:55,halbespferd:40},STOP_TIME={find:4,event:8,chest:3,loot:4,bossLoot:8};/* loot = Beutel nach einem Pack, bossLoot = Beute-Moment */
const lenOf=(W,a,b)=>{if(Math.hypot(a.x-b.x,a.y-b.y)<6)return 0;if(W.walkClear(a,b,6))return Math.hypot(a.x-b.x,a.y-b.y);const path=W.findPath(a,b);if(!path.length)return Infinity;let len=0,at=a;for(const q of path){len+=Math.hypot(q.x-at.x,q.y-at.y);at=q;}return len;};
/** Laufzeit in Sekunden zwischen zwei Weltpunkten, auch über Ebenen: kürzester Weg über benutzbare Übergänge (je Übergang 2 s). */
function legSeconds(g,from,to){
 const run=g.dungeonRun,W=g.world,f1=floorAt(DEF,to.x,to.y),ends=[];
 for(const t of DEF.transitions)for(const side of ['a','b']){if(!transitionUsable(run,t,side))continue;const s=t[side],o=t[side==='a'?'b':'a'];ends.push({p:toWorld(DEF,s.floor,s.x,s.y),f:s.floor,to:toWorld(DEF,o.floor,o.x,o.y)});}
 const best=new Map(),queue=[{p:from,cost:0}];let out=Infinity;
 while(queue.length){queue.sort((a,b)=>a.cost-b.cost);const {p,cost}=queue.shift();if(cost>=out)break;const f=floorAt(DEF,p.x,p.y);
  if(f===f1){const d=lenOf(W,p,to);if(cost+d<out)out=cost+d;}
  for(const e of ends){if(e.f!==f)continue;const d=lenOf(W,p,e.p);if(!Number.isFinite(d))continue;const c=cost+d+2*WALK_SPEED,key=Math.round(e.to.x)+','+Math.round(e.to.y);if((best.get(key)??Infinity)<=c)continue;best.set(key,c);queue.push({p:e.to,cost:c});}}
 return Number.isFinite(out)?out/WALK_SPEED+3:60;
}
const roomPoint=(room,x,y)=>toWorld(DEF,room.floor,x,y);
/** Ziele eines Flügels: Packs, Funde, Ereignisse und Nebenbosse der Flügelräume (der Siegelträger kommt zuletzt). */
export function wingStops(g,wing){
 const rooms=new Set(wing.rooms),stops=[];
 for(const p of DEF.packs){if(!rooms.has(p.room)||g.dungeonRun.trash.has(p.id))continue;const room=DEF.rooms.find(r=>r.id===p.room);if(!g.enemies.some(e=>e.pack===p.id&&e.hp>0&&!e.cardboard))continue;if(p.members.every(k=>DUNGEON_ENEMIES[k]?.illusion))continue;/* das Gespenst geht mit dem Beamer */stops.push({kind:'pack',id:p.id,at:roomPoint(room,p.at[0],p.at[1]+3)});}
 for(const [id,f] of Object.entries(DEF.evidence?.finds||{}))if(f.room&&rooms.has(f.room)&&f.floor)stops.push({kind:'find',id,at:toWorld(DEF,f.floor,f.x,f.y)});
 for(const ev of DEF.events||[])if(rooms.has(ev.room)&&ev.floor)stops.push({kind:'event',id:ev.id,at:toWorld(DEF,ev.floor,ev.x,ev.y),first:!!ev.ghost});/* das Gespenst zeigt PROJEKTION: erst den Beamer ausstecken, sonst endet kein Kampf daneben */
 for(const b of DEF.bosses){if(!rooms.has(b.room)||b.id===wing.boss)continue;const room=DEF.rooms.find(r=>r.id===b.room);if(DUNGEON_BOSSES[b.id]&&!g.enemies.some(x=>x.bossId===b.id&&x.hp>0))continue;if(b.rare&&!DUNGEON_BOSSES[b.id])continue;stops.push({kind:'boss',id:b.id,at:roomPoint(room,b.at[0],b.at[1]+4)});}
 return stops;
}
/** careful = ein Pack je Zug (Nachbarn bemerken den Helden währenddessen nicht, wie bei sorgfältigem Ziehen); sonst ziehen Nachbarpacks mit. */
function wingsRun(opts,{careful=false}={}){
 const g=setup(opts),rows=[];/* Feinschliff 2026-09-26: das seltene halbe Pferd ist hier wirklich immer dabei (vorher würfelte setup, bei Käthe fehlte es) */spawnRareBoss(g,'halbespferd');const bossTimes={};let returnMax=0;let pos=toWorld(DEF,DEF.start.floor,DEF.start.x,DEF.start.y),total=0,deaths=0,wipes=0;const xp0=g.trainingXp;g.dungeonRun.secrets.add('pappwand');
 const cpPos=()=>{const c=g.dungeonRun.checkpoint;return toWorld(DEF,c.floor,c.x,c.y);};
 /* Feinschliff 2026-09-26, „ein Pack je Zug“: wer sorgfältig zieht, holt den Pack von den Nachbarn weg – Flächenschaden trifft ruhende Nachbarn
    nicht (vorher räumte Schorschs Maiskolben halbe Räume in einem Zug). Ruft ein Azubi sie per Funkspruch, kämpfen sie regulär mit. */
 if(careful){const dmg=g.damage.bind(g);g.damage=(e,...a)=>e.simHeld&&!e.aggro?0:dmg(e,...a);}
 /* Feinschliff 2026-09-26: Erholung ist nicht mehr wehrlos – bemerkt ein Nachbarpack den Helden beim Verschnaufen, kämpft er (vorher starb er dabei
    ungesehen, stand als Geist in den nächsten Zug und der Kampf hing 600 s); danach am Kontrollpunkt aufstehen und weiter verschnaufen */
 const up=()=>{if(g.dead){g.respawn();wipes++;pos=cpPos();/* weiter vom Kontrollpunkt aus */}g.player.inCombat=0;};
 const near=e=>e.hp>0&&e.aggro&&e.ai==='combat'&&floorAt(DEF,e.x,e.y)===floorAt(DEF,g.player.x,g.player.y)&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<480;/* wer den Helden hier angreift */
 const recover=()=>{let t=0;up();for(let n=0;n<4;n++){while(t<60&&(party(g).some(u=>u.hp/u.maxHp<.8)||g.companions.some(c=>c.state==='down'))&&!g.enemies.some(near)){g.tick(.05);t+=.05;}g.events.length=0;
  const foes=g.enemies.filter(near);if(!foes.length)break;const r=fight(g,foes,{calls:careful,limit:300,release:true});if(process.env.SIM_DEBUG)console.log('  Erholung: Kampf',[...new Set(foes.map(e=>e.pack||e.bossId||e.dungeonKind))].join('+'),JSON.stringify({time:r.time,won:r.won}));t+=r.time;deaths+=r.deaths||0;returnMax=Math.max(returnMax,r.returnMax||0);up();}return t;};
 const bossFight=(id,at)=>{const e=g.enemies.find(x=>x.bossId===id&&x.hp>0);if(!e)return {time:DUNGEON_BOSSES[id]?0:PLAN_TIME[id]||90,placeholder:!DUNGEON_BOSSES[id]};
  Object.assign(g.player,g.world.findClear(at.x,at.y,9));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}const r=fight(g,[e],{limit:600,release:true});bossTimes[id]=r.time;returnMax=Math.max(returnMax,r.returnMax||0);if(process.env.SIM_DEBUG)console.log('  Boss',id,JSON.stringify({time:r.time,won:r.won,deaths:r.deaths,wipes:r.wipes,left:r.bossLeft}));return {time:r.time,deaths:r.deaths,won:r.won};};
 for(const wing of DEF.wings){const t0=total,x0=g.trainingXp,placeholders=[];let bossXp=0,bossBase=0;const stops=wingStops(g,wing);
  while(stops.length){let bi=0,bt=Infinity;const firstIdx=stops.findIndex(x=>x.first);stops.forEach((s,i)=>{const t=legSeconds(g,pos,s.at);if(firstIdx<0?t<bt:i===firstIdx){bt=t;bi=i;}});const s=stops.splice(bi,1)[0];total+=bt;pos=s.at;
   if(s.kind==='pack'){const held=careful?g.enemies.filter(e=>e.pack!==s.id&&e.hp>0&&!e.aggro).map(e=>[e,e.aggroRange]):[];for(const [e] of held){e.aggroRange=0;e.simHeld=true;}const r=pull(g,s.id,{calls:careful,release:true});const unhold=()=>{for(const [e,a] of held){e.aggroRange=a;e.simHeld=false;}};returnMax=Math.max(returnMax,r.returnMax||0);if(process.env.SIM_DEBUG)console.log('  Pack',s.id,JSON.stringify({time:r.time,won:r.won,deaths:r.deaths,wipes:r.wipes}));if(process.env.SIM_DEBUG&&r.time>=590)for(const e of g.enemies)if(e.hp>0&&((e.aggro&&e.ai==='combat')||e.pack===s.id)){const f=floorAt(DEF,e.x,e.y),o=DEF.floors[f]?.origin||{x:0,y:0};console.log('    hängt',e.name,e.pack||e.bossId,f,((e.x-o.x)/8).toFixed(1),((e.y-o.y)/8).toFixed(1),Math.round(e.hp/e.maxHp*100)+'%','ai='+e.ai,e.aggro?'aggro':'',e.hidden?'versteckt':'',e.stun?'betäubt':'',e.fear?'Furcht':'',e.path?.length??'',g.world.lineClear?.(e,g.player)?'Sicht':'keine Sicht');}/* sorgfältig: verschnauft wird dort, wo kein Nachbar hinsieht – die Ruhe der Nachbarn gilt bis nach der Erholung */total+=r.time+recover();unhold();deaths+=r.deaths||0;/* Feinschliff 2026-09-26: verloren (Wipe, meist nach einem Hilferuf) → der Pack steht wieder, der Held zieht ihn noch einmal (einmal) */if(r.time>0&&!r.won&&!s.again&&g.enemies.some(e=>e.pack===s.id&&e.hp>0&&!e.cardboard)){s.again=true;stops.push(s);continue;}total+=STOP_TIME.loot;}
 else if(s.kind==='boss'){const xb=g.trainingXp,r=bossFight(s.id,s.at);if(!r.placeholder&&!r.won&&!s.again&&g.enemies.some(x=>x.bossId===s.id&&x.hp>0)){total+=r.time+recover();deaths+=r.deaths||0;pos=cpPos();s.again=true;stops.push(s);continue;}bossXp+=g.trainingXp-xb;bossBase+=DUNGEON_BOSSES[s.id]&&!r.placeholder?DUNGEON_BOSSES[s.id].xp||0:0;total+=r.time+(r.placeholder?0:recover());if(r.placeholder)placeholders.push(s.id);deaths+=r.deaths||0;}
   else{if(s.kind==='event'||s.kind==='find'){Object.assign(g.player,g.world.findClear(s.at.x,s.at.y,9));const res=dungeonAct(g,{act:s.kind,id:s.id});if(!res.ok&&!s.retried){s.retried=true;stops.push(s);continue;}}total+=STOP_TIME[s.kind]||4;}}
  const b=DEF.bosses.find(x=>x.id===wing.boss),room=DEF.rooms.find(r=>r.id===b.room),at=roomPoint(room,b.at[0],b.at[1]+5);total+=legSeconds(g,pos,at);pos=at;
  const xb=g.trainingXp;let r=bossFight(wing.boss,at);/* Feinschliff: verloren → aufstehen, zurücklaufen, noch einmal */if(!r.placeholder&&!r.won&&g.enemies.some(x=>x.bossId===wing.boss&&x.hp>0)){total+=r.time+recover()+legSeconds(g,cpPos(),at);deaths+=r.deaths||0;r=bossFight(wing.boss,at);}bossXp+=g.trainingXp-xb;if(!r.placeholder)bossBase+=DUNGEON_BOSSES[wing.boss].xp||0;total+=r.time+STOP_TIME.bossLoot;deaths+=r.deaths||0;
  if(r.placeholder){placeholders.push(wing.boss);/* Siegel und Abkürzung wie nach dem Sieg */g.dungeonRun.seals.add(b.seal);g.dungeonRun.killed.add(b.id);g.dungeonRun.version++;}
  if(wing.chest)total+=STOP_TIME.chest;total+=recover();
  const secs=total-t0,xp=g.trainingXp-x0,xpRepeat=xp-bossXp+Math.round(bossBase*REWARD_REPEAT);rows.push({wing:wing.id,minutes:+(secs/60).toFixed(1),xp,xpPerMin:Math.round(xp/(secs/60)),xpPerMinRepeat:Math.round(xpRepeat/(secs/60)),packs:DEF.packs.filter(p=>wing.rooms.includes(p.room)).length,placeholder:placeholders.join('+')||'–'});}
 // Big B: Tresortür, Thronsaal, Endtruhe
 const at=toWorld(DEF,'k2',49,24);total+=legSeconds(g,pos,at);const bb=g.enemies.find(e=>e.bossId==='bigb');Object.assign(g.player,at);for(const c of g.companions){const q=g.world.findClear(at.x+10,at.y+10,9);c.x=q.x;c.y=q.y;}
 const t0=total,x0=g.trainingXp,rb=fight(g,[bb],{limit:420});total+=rb.time+legSeconds(g,at,toWorld(DEF,DEF.chest.floor,DEF.chest.x,DEF.chest.y))/* Dungeon-Fix 3: Endtruhe mitten im Thronsaal */+STOP_TIME.chest;deaths+=rb.deaths||0;
 rows.push({wing:'bigb',minutes:+((total-t0)/60).toFixed(1),xp:g.trainingXp-x0,xpPerMin:Math.round((g.trainingXp-x0)/((total-t0)/60)),packs:0,placeholder:'–'});
 return {wings:rows,totalMinutes:+(total/60).toFixed(1),xp:g.trainingXp-xp0,xpPerMin:Math.round((g.trainingXp-xp0)/(total/60)),deaths,wipes,rita:bossTimes.rita??null,returnMax};
}

const out={gerd:[],profiles:[],alone:[],trash:[],wing:[],field:[],chain:null,bigb:[],bigbClaim:[],farm:[],e4:[],e4Ignore:[],wings:[],gearPacks:[],firstPull:[],gearBoss:[]};
const log2=(label,text)=>{if(!JSON_OUT)console.log(label.padEnd(62),text);};
const log=(group,label,r)=>{out[group].push({label,...r});if(!JSON_OUT)console.log(label.padEnd(62),JSON.stringify(r));};
if(part('gerd'))for(const c of CLASSES)for(const seed of SEEDS)log('gerd','Gerd · '+c.label+' + 4 Söldner · Seed '+seed,{cls:c.classId,...gerdRun({...c,seed},{})});
if(part('gerd'))for(const c of CLASSES)for(const seed of SEEDS){log('profiles','weicht nie aus, steht vorn · '+c.label+' · Seed '+seed,{cls:c.classId,...gerdRun({...c,seed},{dodge:false,behind:false,front:true})});}
if(part('alone'))for(const c of CLASSES){log('alone','Held allein (unsterblich, reine Zeit) · '+c.label,{cls:c.classId,...gerdRun({...c,mercs:[]},{behind:false,immortal:true,limit:900})});
 log('alone','Held allein (sterblich) · '+c.label,{cls:c.classId,...gerdRun({...c,mercs:[]},{behind:false,limit:900})});}
if(part('trash'))for(const id of ['hof-west','kanzlei-nord','rittersaal-west','rittersaal-sued','weinkeller-west','wehrgang-mitte'])log('trash','Pack '+id+' · Dieter + 4 Söldner',trashRun({},id,{}));
if(part('wing'))for(const c of CLASSES)log('wing','Flügel Burghof · '+c.label+' + 4 Söldner',wingRun({...c,seed:7}));
if(part('field')||part('wing')||part('farm')||part('wings'))for(const c of CLASSES){log('field','Feld Stufe 10 · '+c.label+' allein',fieldRun({...c,seed:7}));log('field','Feld Stufe 10 · '+c.label+' + 4 Söldner (Welt)',fieldRun({...c,seed:7},{mercs:true}));}
// Dungeon-Fix 2 (2026-09-26): Ausrüstungsprofile – jeder Pack mit Start- und typischer Ausrüstung (sorgfältig), der erste Pull wie ein Neuling und
// jeder Boss mit Startausrüstung. Seeds für die Packs: SIM_GEAR_SEEDS (Vorgabe 7; der Bericht nennt den Lauf mit 7,8,9).
const GEAR_SEEDS=(process.env.SIM_GEAR_SEEDS||'7').split(',').map(Number);
if(part('gear')){const quiet2=(r)=>JSON.stringify({t:r.time,won:r.won,downs:r.downs,wipes:r.wipes,heal:r.heal,minParty:r.minParty});
 for(const gear of ['typical','start'])for(const c of CLASSES)for(const seed of GEAR_SEEDS)for(const id of FIGHT_PACKS){const r=packProfile({...c,gear,seed},id);out.gearPacks.push({...r,seed});if(process.env.SIM_DEBUG||r.downs||!r.won)log2('Pack '+id+' · '+gear+' · '+c.label+' · Seed '+seed,quiet2(r));}
 for(const gear of ['typical','start'])for(const c of CLASSES)for(const seed of SEEDS)log('firstPull','Erster Pull Hof West wie ein Neuling · '+gear+' · '+c.label+' · Seed '+seed,firstPull({...c,gear,seed}));
 /* „schwer, aber schaffbar“: wie im Spiel darf ein verlorener Bosskampf einmal wiederholt werden (Kontrollpunkt, neuer Versuch mit vollem Leben –
    wie der Flügel-Lauf); gezählt werden Versuche und die Tode im gewonnenen */
 for(const c of CLASSES)for(const [id] of [['gerd'],...Object.keys(E4_BOSSES).map(x=>[x]),['bigb']]){let r=null,tries=0;for(;tries<2&&!r?.won;tries++){const opts={...c,gear:'start',seed:7+tries};r=id==='gerd'?gerdRun(opts,{}):id==='bigb'?bigbRun(opts,{}):bossRun(id,opts,{});}
  log('gearBoss','Boss '+id+' · Startausrüstung · '+c.label,{boss:id,cls:c.classId,tries,time:r.time,won:r.won,deaths:r.deaths,wipes:r.wipes,mercDowns:r.mercDowns});}}
if(part('chain')){out.chain=chainCheck();if(!JSON_OUT)console.log('Kette im Hof (hof-west gezogen)'.padEnd(62),JSON.stringify(out.chain));}
// Etappe 3: Big B in zwei Profilen, Farm-Schleife über eine Stunde
if(part('bigb'))for(const c of CLASSES)for(const seed of SEEDS){log('bigb','Big B · folgt dem Nachsatz · '+c.label+' + 4 Söldner · Seed '+seed,{cls:c.classId,...bigbRun({...c,seed},{})});
 log('bigbClaim','Big B · folgt der Behauptung · '+c.label+' + 4 Söldner · Seed '+seed,{cls:c.classId,...bigbRun({...c,seed},{lie:'claim'})});}
// Etappe 4 Teil A: die restlichen Bosse in zwei Profilen („spielt richtig“, „ignoriert Mechanik“)
const E4_PARTS={expose:'expose',korkenkurt:'kurt',rita:'rita',halbespferd:'pferd'},E4_NAMES={expose:'Frau Dr. Exposé',korkenkurt:'Korken-Kurt',rita:'Reichweiten-Rita',halbespferd:'Das halbe Pferd'};
for(const [id,key] of Object.entries(E4_PARTS))if(part(key)||part('e4'))for(const c of CLASSES)for(const seed of SEEDS){log('e4',E4_NAMES[id]+' · spielt richtig · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,...bossRun(id,{...c,seed},{})});
 log('e4Ignore',E4_NAMES[id]+' · ignoriert Mechanik · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,...bossRun(id,{...c,seed},{dodge:false,lie:'none'})});}
// Etappe 4 Teil B: drei Flügel und der volle Durchgang (Held mit vier Söldnern); ohne --only=wings nur Dieter
if(part('wings'))for(const careful of [true,false].filter(x=>!process.env.SIM_MODE||(process.env.SIM_MODE==='careful')===x))for(const c of (ONLY.includes('wings')?CLASSES:CLASSES.slice(0,1))){const r=wingsRun({...c,seed:+(process.env.SIM_WING_SEED||7)},{careful}),how=careful?' · ein Pack je Zug':' · Nachbarn ziehen mit';for(const w of r.wings)if(!process.env.WING||w.wing===process.env.WING)log('wings','Flügel '+w.wing+' · '+c.label+how,{...w,careful});log('wings','Voller Durchgang · '+c.label+how,{full:true,careful,cls:c.classId,minutes:r.totalMinutes,xp:r.xp,xpPerMin:r.xpPerMin,deaths:r.deaths,wipes:r.wipes,rita:r.rita,returnMax:r.returnMax});}
if(part('farm')){const fieldRate=Math.max(...out.field.map(r=>r.xpPerMin));
 for(const [route,lockout] of [['gerd',false],['gerd',true],['wing',false],['wing',true]])log('farm','Farm-Schleife '+(route==='gerd'?'Hof West + Gerd':'Flügel Burghof')+(lockout?' · mit 30-min-Sperre, Rest Feld':' · ohne Sperre')+' · Dieter · 60 min',farmHour({seed:7},{route,lockout,fieldRate}));}

// Prüfkriterien – bewertet für die drei Stammklassen Dieter, Bärbel und Kevin (Auftrag Etappe 4 Teil A nach E-72). Schorsch und Käthe laufen
// mit und stehen als Info-Zeilen darunter (neue Klassen, eigene Balance-Sitzung).
const CORE=['dieter','baerbel','kevin'];
{const keep=r=>!r?.cls||CORE.includes(r.cls);for(const k of ['gerd','profiles','alone','bigb','bigbClaim','e4','e4Ignore'])out[k+'All']=out[k],out[k]=out[k].filter(keep);}
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
 ...Object.entries(E4_PARTS).filter(([id,key])=>part(key)||part('e4')).flatMap(([id])=>{const ok=out.e4.filter(r=>r.boss===id),bad=out.e4Ignore.filter(r=>r.boss===id),t=ok.map(r=>r.time);
  return [[E4_NAMES[id]+' mit Held und 4 Söldnern 70–110 s',t.every(x=>x>=70&&x<=110)&&ok.every(r=>r.won),Math.min(...t)+'–'+Math.max(...t)+' s'],
   [E4_NAMES[id]+': „ignoriert Mechanik“ stirbt mindestens einmal',bad.every(r=>r.deaths>=1),'Tode je Lauf '+bad.map(r=>r.deaths).join('/')],
   [E4_NAMES[id]+': „spielt richtig“ stirbt höchstens einmal',ok.every(r=>r.deaths<=1),'Tode je Lauf '+ok.map(r=>r.deaths).join('/')]];}),
 ...((part('rita')||part('e4'))?(()=>{const t=(out.e4All||[]).filter(r=>r.boss==='rita').map(r=>r.time);return [['Reichweiten-Rita mit allen fünf Klassen 70–110 s (Feinschliff)',t.every(x=>x>=70&&x<=110)&&(out.e4All||[]).filter(r=>r.boss==='rita').every(r=>r.won),Math.min(...t)+'–'+Math.max(...t)+' s']];})():[]),
 ...(part('gerd')?[['Gerd: Schutz-Söldner überlebt die meisten Läufe',out.gerd.filter(r=>r.tankDowns>0).length<=Math.floor(out.gerd.length/3),'Schutz fällt in '+out.gerd.filter(r=>r.tankDowns>0).length+' von '+out.gerd.length+' Läufen']]:[]),
...(part('wings')?(()=>{const wr=out.wings.filter(w=>w.careful&&w.wing&&w.wing!=='bigb'),full=out.wings.filter(w=>w.full),bf=Math.max(...out.field.map(r=>r.xpPerMin)),built=wr.filter(w=>w.placeholder==='–'),rep=built.map(w=>w.xpPerMinRepeat),first=built.map(w=>w.xpPerMin),open=[...new Set(wr.filter(w=>w.placeholder!=='–').map(w=>w.wing))];
  const fc=full.filter(w=>w.careful),rita=fc.map(w=>w.rita).filter(x=>x!=null),ret=Math.max(0,...full.map(w=>w.returnMax||0));
  return [['Jeder Flügel 10–15 min (ein Pack je Zug, Held + 4 Söldner)',wr.every(w=>w.minutes>=10&&w.minutes<=15),wr.map(w=>w.wing.slice(0,4)+' '+w.minutes).join(' · ')+' min'+(wr.some(w=>w.placeholder!=='–')?' (ungebaute Bosse mit Zielzeit)':'')],
   ['Voller Durchgang mit Söldnern unter 50 min (ein Pack je Zug)',full.filter(w=>w.careful).every(w=>w.minutes<50),full.filter(w=>w.careful).map(w=>w.minutes).join(' / ')+' min · Nachbarn ziehen mit (nur Angabe): '+full.filter(w=>!w.careful).map(w=>w.minutes).join(' / ')+' min'],
   /* Feinschliff 2026-09-26: Rita endet im Flügel mit jeder Klasse (vorher bis 480 s bei 4 % im Greenscreen) */['Reichweiten-Rita im Flügel 70–110 s (jede Klasse, ein Pack je Zug)',rita.length===fc.length&&rita.every(t=>t>=70&&t<=110),fc.map(w=>w.cls+' '+w.rita).join(' · ')+' s'],
   /* Feinschliff 2026-09-26: Rückweg-Gegner hängen nicht (Ratten im Basaltgewölbe) */['Rückweg-Gegner nach spätestens '+ENCOUNTER_RULES.dungeonReturnLimit+' s zu Hause (auch mit dem Helden daneben)',ret<=ENCOUNTER_RULES.dungeonReturnLimit+.1,'längster Rückweg '+ret+' s'],
   ['EP je Minute je Flügel 1–2× Feld (Wiederholung am selben Tag, Flügel mit gebautem Siegelträger)',rep.every(x=>x>=bf&&x<=2*bf),'Wiederholung '+Math.min(...rep)+'–'+Math.max(...rep)+' · erster Lauf des Tages (Tagesbonus) '+Math.min(...first)+'–'+Math.max(...first)+' · Feld '+bf+' EP/min'+(open.length?' · ohne Boss-EP gemessen: '+open.join(', '):'')]];})():[]),
 /* Dungeon-Fix 2 (2026-09-26): Ausrüstungsprofile. Bewertet für die Stammklassen; Schorsch und Käthe stehen als Angabe dabei. */
 ...(part('gear')?(()=>{const core=r=>CORE.includes(r.cls),typ=out.gearPacks.filter(r=>r.gear==='typical'),st=out.gearPacks.filter(r=>r.gear==='start'),med=a=>{const x=[...a].sort((p,q)=>p-q);return x[Math.floor(x.length/2)]??0;},fp=out.firstPull,gb=out.gearBoss,pct=x=>Math.round(x*100)+' %';
  const badTyp=typ.filter(r=>core(r)&&(r.downs||!r.won)),badSt=st.filter(r=>core(r)&&(r.downs>1||!r.won)),name=r=>r.cls+'/'+r.pack+'/'+r.seed+':'+r.downs+(r.won?'':'W');
  return [['Typische Ausrüstung: jeder Pack ohne Wipe und ohne Tod (Held und Söldner, sorgfältig)',!badTyp.length,typ.filter(core).length+' Pulls'+(badTyp.length?' · rot: '+badTyp.map(name).join(' '):'')+' · neue Klassen (Angabe): '+typ.filter(r=>!core(r)&&(r.downs||!r.won)).map(name).join(' ')],
   ['Typische Ausrüstung: ein Pack kostet den Heiler spürbar (Median ≥ 25 % des Gruppenlebens geheilt)',med(typ.map(r=>r.heal))>=.25,'Median '+pct(med(typ.map(r=>r.heal)))+', leichtester Pack '+pct(Math.min(...typ.map(r=>r.heal)))+', schwerster '+pct(Math.max(...typ.map(r=>r.heal)))],
   ['Startausrüstung: jeder Pack schaffbar (kein Wipe, höchstens ein Ausfall)',!badSt.length,st.filter(core).length+' Pulls, Ausfälle gesamt '+st.filter(core).reduce((n,r)=>n+r.downs,0)+(badSt.length?' · rot: '+badSt.map(name).join(' '):'')+' · Heilung Median '+pct(med(st.map(r=>r.heal)))],
   ['Erster Pull wie ein Neuling (Hof West, ohne Unterbrechen): typisch ohne Ausfall, Start ohne Wipe',fp.filter(r=>r.gear==='typical'&&core(r)).every(r=>!r.downs&&!r.wipes)&&fp.filter(r=>r.gear==='start'&&core(r)).every(r=>!r.wipes&&r.downs<=1),['typical','start'].map(gg=>gg+' '+fp.filter(r=>r.gear===gg).map(r=>r.cls.slice(0,3)+r.downs+(r.wipes?'W':'')).join(' ')).join(' · ')+' (Ausfälle je Lauf)'],
   ['Startausrüstung: jeder Boss schaffbar (gewonnen, höchstens ein zweiter Versuch, höchstens ein Tod des Helden)',gb.filter(core).every(r=>r.won&&r.deaths<=1),gb.map(r=>r.boss+' '+r.cls.slice(0,3)+' '+r.time+' s/'+r.deaths+' T'+(r.tries>1?' (2. Versuch)':'')+(r.won?'':' verloren')).join(', ')]];})():[]),
 ...(part('farm')?[['Farm-Schleife über eine Stunde ≤ 2× Feld (30-min-Sperre wie im Spiel)',Math.max(farmGerd.xpPerMin,farmWing.xpPerMin)<=2*bestField,'Gerd '+farmGerd.xpPerMin+' · Flügel '+farmWing.xpPerMin+' EP/min · Feld '+bestField+' (ohne Sperre, nur Info: Gerd '+farmFree.xpPerMin+')']]:[])
];
// Info: neue Klassen (E-72) gegen dieselben Kriterien, ohne Rückgabewert
const novel=k=>(out[k+'All']||[]).filter(r=>r.cls&&!CORE.includes(r.cls)),infoRow=(name,rows,f)=>rows.length?[['Info · '+name,true,f(rows)]]:[];
checks.push(...infoRow('neue Klassen: Held allein (unsterblich)',novel('alone').filter(x=>x.label.includes('unsterblich')),r=>r.map(x=>x.cls+' '+x.time+' s').join(', ')),...infoRow('neue Klassen: Gerd',novel('gerd'),r=>r.map(x=>x.cls+' '+x.time+' s/'+x.deaths+' T').join(', ')),...infoRow('neue Klassen: Gerd, weicht nie aus (Tode)',novel('profiles'),r=>r.map(x=>x.cls+' '+x.deaths).join(', ')),
 ...infoRow('neue Klassen: Big B',novel('bigb'),r=>r.map(x=>x.cls+' '+x.time+' s/'+x.deaths+' T').join(', ')),...infoRow('neue Klassen: Big B, folgt der Behauptung (Tode)',novel('bigbClaim'),r=>r.map(x=>x.cls+' '+x.deaths).join(', ')),
 ...infoRow('neue Klassen: Etappe-4-Bosse, spielt richtig',novel('e4'),r=>r.map(x=>x.boss+' '+x.cls+' '+x.time+' s/'+x.deaths+' T').join(', ')),...infoRow('neue Klassen: Etappe-4-Bosse, ignoriert Mechanik (Tode)',novel('e4Ignore'),r=>r.map(x=>x.boss+' '+x.cls+' '+x.deaths).join(', ')));
out.checks=checks.map(([name,ok,value])=>({name,ok,value}));
if(JSON_OUT)console.log(JSON.stringify(out,null,1));else{console.log('\nPrüfkriterien');for(const c of out.checks)console.log((c.ok?'GRÜN ':'ROT  ')+c.name.padEnd(48)+c.value);}
if(out.checks.some(c=>!c.ok))process.exitCode=1;
