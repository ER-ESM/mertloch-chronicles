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
// Dungeon-Fix 4 (docs/DUNGEON-FIX4-2026-09-26.md, Nachprüfung #726): Big B beginnt wie im Spiel über engageBoss (Anlaufzeit bis zum ersten Zauber).
// Neuer Teil --only=nohero (nur Angabe, kein Kriterium): Big B mit vier Söldnern, der Held macht keinen Schaden – „Held ohne Schaden“ (lebt, weicht aus,
// Autoangriff aus, keine Kniffe) und „Held liegt“ (fällt nach 20 s, wenn der Schutz Big B hält, und bleibt liegen). Frage des Prüfers: Legen die Söldner Big B allein?
// Neuer Teil --only=ohneheld (Nutzerentscheidung zu Fix 4, nur Angabe): jeder Boss, der Held fällt bei 50 % Bossleben und bleibt liegen –
// (a) Held Tank + Heilung + 2× Schaden, (b) Held Heiler + Schutz + 2× Schaden, (c) Held Schaden + Schutz, Heilung, 2× Schaden, (d) wie (c), bei 50 %
// fallen auch Schutz und Heilung, nur die zwei Schadens-Söldner stehen. Ein Held-Heiler heilt wie ein Spieler den schwächsten Söldner (Freund gewählt).
// Dungeon-Fix 5 (docs/DUNGEON-FIX5-2026-09-26.md, Prüfer #728): Big B wartet nach der Rede, bis der Held angreift – der Sim-Held spricht ihn an und
// zieht selbst (heroPulls → pullBoss). Die Rede zählt nicht zur Kampfzeit, im vollen Durchgang aber zur Gesamtzeit.
// Held aktiv (docs/DUNGEON-AKTIV-2026-09-26.md, Nutzerentscheidung zu Fix 4): ohneheld und nohero laufen jetzt immer mit, mit eigener Stichprobe
// (SIM_ROLE_SEEDS, Vorgabe 7–14) und Kriterien: (a) Held Tank fällt → Hauptbosse zusammen ≤ 25 % Siege, keiner über 40 % · (b) Held Heiler fällt →
// alle Bosse ≤ 25 % · (c) Held Schaden fällt → ≥ 50 % · (d) nur zwei Schadens-Söldner → zusammen mit (d25) (alle drei fallen erst bei 25 %) 10–35 %,
// bei 50 % höchstens 15 % · Held passiv (lebt, weicht aus, kein Schaden, keine
// Kniffe) an den Hauptbossen ≤ 30 % Siege. nohero läuft an allen Hauptbossen (Gerd, Exposé, Kurt, Big B); „Held liegt ab 20 s“ ist nur Angabe.
// SIM_BOSS begrenzt ohneheld und nohero auf einzelne Bosse.
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {World,rng} from '../world.js';
import {Game} from '../engine.js';
import {makeEnemy,scaledStats,ENCOUNTER_RULES,beginReturn} from '../encounters.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_ENEMIES,TUTORIAL,CLASS_SPECS,ARCHETYPES,EINSATZ_RULES,COMPANION_RULES} from '../content/index.js';
import {resetEnemySerial,toWorld,coneHits,floorAt,inLane,roomAt,inHazard,hideSpots,spawnRareBoss,lostSight,transitionUsable,dungeonAct,arenaAhead,packFirstSpecial,engageBoss,addressBoss,bossReady,pullBoss,enrageAfter} from '../dungeon.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from './balance-rotation.mjs';
import {changeSpec,pathBuild,learnTalent,talentPoints,TALENTS} from '../talents.js';
import {available} from '../progression.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {WALK_SPEED} from '../movement.js';
import {applyGearProfile} from './gear-profiles.mjs';
import {usable} from '../alert-answer.js';
import {hitCompanion} from '../companions.js';
import {heroRole} from '../dungeon-einsatz.js';
import {meterReport} from '../combat-meter.js';
import {fight,MERCS,inEll,party,heroPulls} from './sim-fight.mjs';/* Dungeon-Fix 7: Kampfschleife ausgelagert (auch fürs Serien-Nachstellen) */

/* Held aktiv: Versuchsschalter SIM_TUNE (JSON) – überschreibt Zahlen für einen Lauf, ohne die Inhaltsdateien zu ändern, z. B.
   SIM_TUNE='{"rules":{"rally":{"bonus":0.5}},"bosses":{"gerd":{"enrage":{"after":110,"every":10,"damage":1}}}}'. rules = EINSATZ_RULES, bosses = DUNGEON_BOSSES,
   companions = COMPANION_RULES (nur verschachtelte Werte wie instanceFactor). */
{const tune=process.env.SIM_TUNE?JSON.parse(process.env.SIM_TUNE):null,merge=(to,from)=>{for(const [k,v] of Object.entries(from||{})){if(v&&typeof v==='object'&&!Array.isArray(v)&&to[k]&&typeof to[k]==='object')merge(to[k],v);else to[k]=v;}};
 if(tune){merge(EINSATZ_RULES,tune.rules);merge(DUNGEON_BOSSES,tune.bosses);merge(COMPANION_RULES,tune.companions);}}
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
export const SEEDS=(process.env.SIM_SEEDS?process.env.SIM_SEEDS.split(',').map(Number):[7,8,9]).filter(x=>!process.env.SIM_SEED||String(x)===process.env.SIM_SEED);
/** Held aktiv: Stichprobe für die Rollen-Fälle (ohneheld, nohero) – acht Seeds je Fall und Boss, damit die Quoten belastbar sind. */
export const ROLE_SEEDS=(process.env.SIM_ROLE_SEEDS||process.env.SIM_SEEDS||'7,8,9,10,11,12,13,14').split(',').map(Number).filter(x=>!process.env.SIM_SEED||String(x)===process.env.SIM_SEED);
function equipSet(g,quality,level){/* Dungeon-Fix 2: typische Ausrüstung aus dem Leveln (scripts/gear-profiles.mjs) */if(quality==='typical'){applyGearProfile(g,'typical',{ITEMS,addItem,equipItem,registerRoll});return;}if(quality==='start')quality='none';g.rpg.inventory=[];for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;if(quality==='none'){for(const [slot,id] of Object.entries(TUTORIAL.starterEquipment)){addItem(g.rpg,id);equipItem(g,id,slot);}return;}
 GEAR_SLOTS.forEach(([slot,target,roll],i)=>{const id=registerRoll(g.rpg,ITEMS,{slot,spec:PROFILES[i%3],level,quality,roll,family:'boar'});addItem(g.rpg,id);equipItem(g,id,target);});}
function learnBuild(g,spec,path=0){const budget=Math.max(0,talentPoints(g));for(const id of pathBuild(spec,path,budget))learnTalent(g,id);
 for(const tree of [spec,...Object.values(CLASS_SPECS).find(l=>l.includes(spec)).filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<budget)learnTalent(g,t.id);}
function hero(g,{classId,spec,gear=SIM_GEAR,seed}){resetEnemySerial();/* Dungeon-Fix 3: jeder Lauf unabhängig von den vorigen */g.random=rng(seed);g.lootRandom=()=>.99;g.toast=()=>{};changeSpec(g,spec);equipSet(g,gear,10);g.refreshStats();learnBuild(g,spec);g.refreshStats();g.player.hp=g.player.maxHp;g.rpg.coins=9999;return g;}
export function setup({classId='dieter',spec='dieter-brawl',gear=SIM_GEAR,mercs=['tank','heal','dps1','dps2'],seed=7}){
 const g=hero(new Game(world,{classId,level:10,tutorial:{version:1,step:8,completed:true}},{}),{classId,spec,gear,seed});
 g.enterDungeon('schloss-bigb',{force:true});for(const m of mercs)g.hireCompanion(MERCS[m],{free:true});return g;
}
const quiet=(g,keep=()=>false)=>{for(const e of g.enemies)if(!e.dungeonBoss&&!keep(e)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
/** Nur der Boss, um den es geht (Etappe 3): andere Bosse in fernen Räumen würfeln sonst beim Umherlaufen mit und verschieben die Zufallsfolge. */
const onlyBoss=(g,id)=>{g.enemies=g.enemies.filter(e=>!e.dungeonBoss||e.bossId===id);g.instance.run.enemies=g.enemies;};
function gerdRun(opts,fightOpts){const g=setup(opts);quiet(g);onlyBoss(g,'gerd');const gerd=g.enemies.find(e=>e.bossId==='gerd');Object.assign(g.player,toWorld(DEF,'e0',8.5,26));
 for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 return einsatzOf(fight(g,[gerd],fightOpts),gerd);}
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
/** Dungeon-Fix 6 (Prüferin #741): Laufstand vor Big B. S0 = Rita steht, keine Beweise (bisher immer gemessen, der schwerste Stand); S1 = Rita liegt,
 *  keine Beweise; S3 = Rita liegt, alle drei Beweise gefunden (wie der Testzugang --preset=bigb und jeder volle Durchgang). Die Beweise legt der Held
 *  wie im Spiel beim Ansprechen am Thron vor (addressBoss). */
export const BIGB_STATES={S0:{label:'Rita steht, 0 Beweise'},S1:{label:'Rita liegt, 0 Beweise',rita:true},S3:{label:'Rita liegt, 3 Beweise',rita:true,evidence:true}};
function applyBigbState(g,state='S0'){const s=BIGB_STATES[state]||BIGB_STATES.S0,run=g.dungeonRun;if(s.rita)run.killed.add('rita');if(s.evidence)for(const id of DEF.evidence.ids)run.found.add(id);run.version++;}
function bigbRun(opts,fightOpts){const g=setup(opts);quiet(g);onlyBoss(g,'bigb');const run=g.dungeonRun;for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])run.seals.add(s);applyBigbState(g,opts.state);const big=g.enemies.find(e=>e.bossId==='bigb');
 Object.assign(g.player,toWorld(DEF,'k2',49,24));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 heroPulls(g,big);/* Dungeon-Fix 5: wie im Spiel – Rede, dann zieht der Held selbst (erster Zauber nach der Anlaufzeit) */
 const r=fight(g,[big],{limit:420,...fightOpts});r.feat=(g.dungeons['schloss-bigb'].feats||[]).includes('nachsatz');einsatzOf(r,big);r.enrage=enrageAfter(run,'bigb');/* Dungeon-Fix 6 */return r;}
/** Held aktiv: Einsatz-Wertung des Siegs (Punkte, Bonus-Siegelmarken) an das Ergebnis hängen. */
function einsatzOf(r,boss){const x=boss.dungeonReward?.einsatz;if(x){r.einsatz=x.score;r.einsatzBonus=x.bonus;r.rally=x.rally;}return r;}
/** Etappe 4 Teil A: einer der restlichen Bosse mit Held und vier Söldnern, alle Siegel da (Tresortür egal), nur dieser Boss steht. Der Held
 *  startet an der Arenatür. Das halbe Pferd wird erzwungen (sonst 30 %). */
export const E4_BOSSES={expose:['k1',32,40.6],korkenkurt:['k2',16.2,27.6],rita:['k1',58.4,18.2],halbespferd:['k1',27.2,4]};
export function bossRun(id,opts,fightOpts){const g=setup(opts);quiet(g);if(DEF.bosses.find(b=>b.id===id)?.rare)spawnRareBoss(g,id);onlyBoss(g,id);const run=g.dungeonRun;for(const b of DEF.bosses)if(b.seal)run.seals.add(b.seal);run.version++;
 const boss=g.enemies.find(e=>e.bossId===id),[f,x,y]=E4_BOSSES[id];Object.assign(g.player,toWorld(DEF,f,x,y));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 const r=einsatzOf(fight(g,[boss],{limit:420,...fightOpts}),boss);return Object.assign(r,{laneHits:boss.laneHits||0,blinded:boss.blinded||0,drank:boss.drank||0,hides:boss.hides||0,stack:(boss.stackShares||[]).join('/'),overlaps:boss.spreadOverlaps||0});}
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
 total+=heroPulls(g,bb);/* Dungeon-Fix 5: Rede zählt zur Durchgangszeit, der Held zieht selbst */const t0=total,x0=g.trainingXp,rb=fight(g,[bb],{limit:420});total+=rb.time+legSeconds(g,at,toWorld(DEF,DEF.chest.floor,DEF.chest.x,DEF.chest.y))/* Dungeon-Fix 3: Endtruhe mitten im Thronsaal */+STOP_TIME.chest;deaths+=rb.deaths||0;
 rows.push({wing:'bigb',minutes:+((total-t0)/60).toFixed(1),xp:g.trainingXp-x0,xpPerMin:Math.round((g.trainingXp-x0)/((total-t0)/60)),packs:0,placeholder:'–'});
 return {wings:rows,totalMinutes:+(total/60).toFixed(1),xp:g.trainingXp-xp0,xpPerMin:Math.round((g.trainingXp-xp0)/(total/60)),deaths,wipes,rita:bossTimes.rita??null,returnMax};
}

const out={heiler:[],gerd:[],profiles:[],alone:[],trash:[],wing:[],field:[],chain:null,bigb:[],bigbClaim:[],farm:[],e4:[],e4Ignore:[],wings:[],gearPacks:[],firstPull:[],gearBoss:[],nohero:[],ohneheld:[],passiv:[],live:[],aktiv3:[]};
const log2=(label,text)=>{if(!JSON_OUT)console.log(label.padEnd(62),text);};
const log=(group,label,r)=>{out[group].push({label,...r});if(!JSON_OUT)console.log(label.padEnd(62),JSON.stringify(r));};
/* Held aktiv: Die Rollen-Fälle (ohneheld, nohero; rund 1 300 Kämpfe) laufen im vollen Lauf je Boss in eigenen Prozessen neben dem Rest
   (SIM_JOBS, Vorgabe 6; 1 = alles nacheinander). Die Kinder schreiben JSON, der Hauptlauf übernimmt ihre Zeilen vor den Kriterien. */
const JOBS=Math.max(1,Number(process.env.SIM_JOBS||6)),ROLE_BOSSES=['gerd','expose','korkenkurt','rita','halbespferd','bigb'],roleTasks=[];
if(!process.env.SIM_CHILD&&JOBS>1)for(const [key,list] of [['ohneheld',ROLE_BOSSES],['nohero',['gerd','expose','korkenkurt','bigb']]])if(part(key))for(const b of (process.env.SIM_BOSS?list.filter(x=>process.env.SIM_BOSS.split(',').includes(x)):list))roleTasks.push({key,b});
/* Dungeon-Fix 6: Teile passiv (Big B je Laufstand ein Prozess), live und aktiv3 ebenfalls nebenher; die großen zuerst */
if(!process.env.SIM_CHILD&&JOBS>1){const fix6=[];const boss=b=>!process.env.SIM_BOSS||process.env.SIM_BOSS.split(',').includes(b);
 if(part('passiv'))for(const b of ['bigb','gerd','expose','korkenkurt'])if(boss(b))for(const st of (b==='bigb'?['S3','S1','S0']:[null]))if(!process.env.SIM_STATE||!st||process.env.SIM_STATE.split(',').includes(st))fix6.push({key:'passiv',b,state:st});
 for(const key of ['aktiv3','live'])if(part(key)&&boss('bigb'))fix6.push({key,b:'bigb'});roleTasks.unshift(...fix6);}
const roleJobs=(()=>{if(!roleTasks.length)return null;const queue=[...roleTasks],res=[];let running=0;return new Promise((done,fail)=>{const next=()=>{if(!queue.length&&!running)return done(res);while(running<JOBS&&queue.length){const t=queue.shift();running++;let buf='';
 const ch=spawn(process.execPath,[fileURLToPath(import.meta.url),'--only='+t.key,'--json'],{env:{...process.env,SIM_CHILD:'1',SIM_BOSS:t.b,...(t.state?{SIM_STATE:t.state}:{})},stdio:['ignore','pipe','inherit'],windowsHide:true});ch.stdout.on('data',d=>buf+=d);
 ch.on('close',code=>{running--;try{const j=JSON.parse(buf);res.push(...(j[t.key]||[]).map(r=>({group:t.key,...r})));}catch(e){return fail(Error('Teillauf '+t.key+'/'+t.b+(t.state?'/'+t.state:'')+' ohne Ergebnis (Code '+code+')'));}next();});}};next();});})();
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
// Dungeon-Fix 4: Big B mit vier Söldnern ohne Heldenschaden – lebend (weicht aus) und liegend. Held aktiv (2026-09-26): an allen Hauptbossen, mit Kriterium.
const MAIN_BOSSES=['gerd','expose','korkenkurt','bigb'],onlyBosses=list=>process.env.SIM_BOSS?list.filter(b=>process.env.SIM_BOSS.split(',').includes(b)):list;
const bossFightRun=(id,opts,fo)=>id==='gerd'?gerdRun(opts,fo):id==='bigb'?bigbRun(opts,fo):bossRun(id,opts,fo);
if(part('nohero')&&!roleJobs)for(const id of onlyBosses(MAIN_BOSSES))for(const c of CLASSES)for(const seed of ROLE_SEEDS){const pick=r=>({time:r.time,won:r.won,wipes:r.wipes,bossLeft:r.bossLeft,deaths:r.deaths,mercDowns:r.mercDowns,einsatz:r.einsatz??null,rally:r.rally??null});
 log('nohero',id+' · Held ohne Schaden (lebt, weicht aus) · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,mode:'alive',...pick(bossFightRun(id,{...c,seed},{noDamage:true}))});
 log('nohero',id+' · Held liegt ab 20 s · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,mode:'dead',...pick(bossFightRun(id,{...c,seed},{noDamage:true,stayDead:20}))});}
// Dungeon-Fix 4 (nur mit --only=ohneheld, Angabe ohne Kriterium): jeder Boss, der Held fällt bei 50 % und bleibt liegen – vier Aufstellungen
const TANKS=[['dieter','dieter-wall'],['kevin','kevin-iron'],['schorsch','schorsch-rauch']],HEALERS=[['baerbel','baerbel-care'],['schorsch','schorsch-chef'],['kaethe','kaethe-herz']];
const HEROLESS=[['a','Held Tank + Heilung + 2× Schaden',TANKS.map(([classId,spec])=>({classId,spec})),['heal','dps1','dps2'],[],false],
 ['b','Held Heiler + Schutz + 2× Schaden',HEALERS.map(([classId,spec])=>({classId,spec})),['tank','dps1','dps2'],[],true],
 ['c','Held Schaden + Schutz, Heilung, 2× Schaden',CLASSES.map(({classId,spec})=>({classId,spec})),['tank','heal','dps1','dps2'],[],false],
 ['d','wie (c), bei 50 % fallen auch Schutz und Heilung',CLASSES.map(({classId,spec})=>({classId,spec})),['tank','heal','dps1','dps2'],['tank','heal'],false],
 /* Held aktiv: wie (d), aber alle drei fallen erst bei 25 % („wenn der Boss schon tief ist“) – nur Angabe */['d25','wie (d), alle drei fallen bei 25 %',CLASSES.map(({classId,spec})=>({classId,spec})),['tank','heal','dps1','dps2'],['tank','heal'],false,.25]];
if(part('ohneheld')&&!roleJobs)for(const id of onlyBosses(['gerd',...Object.keys(E4_BOSSES),'bigb']))for(const [key,label,heroes,mercs,down,healer,at=.5] of HEROLESS)for(const h of heroes)for(const seed of ROLE_SEEDS){
 const opts={...h,mercs,seed},fo={heroDownAt:at,downMercs:down,healer},r=bossFightRun(id,opts,fo);
 log('ohneheld','ohne Held ab 50 % · '+id+' · ('+key+') '+h.spec+' · Seed '+seed,{boss:id,case:key,spec:h.spec,time:r.time,won:r.won,wipes:r.wipes,heroDown:r.heroDown??null,bossLeft:r.bossLeft,bossMin:r.bossMin??null,mercDowns:r.mercDowns});}
// ── Dungeon-Fix 6 (Prüferin #741, docs/DUNGEON-FIX6-2026-09-26.md) ───────────────────────────────────────────────────────────────────────
// Teil passiv: Held passiv in jeder Spezialisierung mit der Testzugang-Gruppe (Schutz, Heilung, 2× Schaden – als Tank oder Heiler also mit doppelter
// Rolle) an allen Hauptbossen, Big B in allen drei Laufständen (BIGB_STATES). Drei Arten passiv (PASSIVE_MODES): „passiv“ = lebt, weicht aus, kein
// Schaden, keine Kniffe; „steht“ = wie die Prüferin: zieht, steht dann nur da, weicht nichts aus, fällt und wird aufgehoben; „liegt“ = fällt nach 20 s
// und bleibt liegen. Seeds SIM_PASSIVE_SEEDS (Vorgabe 7,8). Kriterien: Hauptbosse zusammen ≤ 30 % Siege, jede Kombination (Boss, Laufstand, Rolle,
// Art) ≤ 40 %. Teil live: der Live-Fall selbst (Bärbel Heilung, typische Ausrüstung, S3, „steht“) mit den Regeln von #741 und jetzt – die Simulation
// muss den Live-Fall treffen. Teil aktiv3: aktiver Held jeder Rolle mit derselben Gruppe an Big B in S0 und S3, dazu (a)–(c) in S3 als Angabe.
export const PASSIVE_MODES={passiv:{noDamage:true},steht:{noDamage:true,dodge:false,lie:'none',behind:false,stand:true},liegt:{noDamage:true,stayDead:20}};
export const ALL_SPECS=Object.entries(CLASS_SPECS).flatMap(([classId,list])=>list.map(spec=>({classId,spec,role:heroRole({rpg:{talents:{spec}}})})));
const PASSIVE_SEEDS=(process.env.SIM_PASSIVE_SEEDS||'7,8').split(',').map(Number),STATE_ONLY=process.env.SIM_STATE?process.env.SIM_STATE.split(','):null;
const statesFor=id=>id==='bigb'?Object.keys(BIGB_STATES).filter(s=>!STATE_ONLY||STATE_ONLY.includes(s)):['–'];
const pickRun=r=>({time:r.time,won:r.won,wipes:r.wipes,bossLeft:r.bossLeft,bossMin:r.bossMin??null,deaths:r.deaths,einsatz:r.einsatz??null,einsatzBonus:r.einsatzBonus??null,enrage:r.enrage??null});
if(part('passiv')&&!roleJobs)for(const id of onlyBosses(MAIN_BOSSES))for(const state of statesFor(id))for(const [mode,fo] of Object.entries(PASSIVE_MODES))for(const h of ALL_SPECS)for(const seed of PASSIVE_SEEDS){
 const opts={classId:h.classId,spec:h.spec,seed,...(id==='bigb'?{state}:{})};
 log('passiv','passiv · '+id+(id==='bigb'?' '+state:'')+' · '+mode+' · '+h.spec+' · Seed '+seed,{boss:id,state,mode,role:h.role,spec:h.spec,...pickRun(bossFightRun(id,opts,fo))});}
const LIVE_SEEDS=(process.env.SIM_LIVE_SEEDS||'7,8,9,10,11,12,13,14').split(',').map(Number);
if(part('live')&&!roleJobs){const en=DUNGEON_BOSSES.bigb.enrage,now=en.sooner;
 for(const [rules,sooner] of [['#741',{}],['jetzt',now]]){en.sooner=sooner;for(const seed of LIVE_SEEDS)log('live','Live-Fall #741 (Bärbel Heilung, S3, steht) · Regeln '+rules+' · Seed '+seed,{rules,seed,...pickRun(bigbRun({classId:'baerbel',spec:'baerbel-care',seed,state:'S3'},PASSIVE_MODES.steht))});}
 en.sooner=now;}
const ACTIVE_HEROES=[...TANKS.map(([classId,spec])=>({classId,spec,role:'tank'})),...HEALERS.map(([classId,spec])=>({classId,spec,role:'heal'})),...CLASSES.map(({classId,spec})=>({classId,spec,role:'damage'}))];
if(part('aktiv3')&&!roleJobs){for(const state of ['S0','S3'])for(const h of ACTIVE_HEROES)for(const seed of PASSIVE_SEEDS)log('aktiv3','Big B aktiv · '+state+' · '+h.spec+' · Seed '+seed,{kind:'active',state,role:h.role,spec:h.spec,...pickRun(bigbRun({...h,seed,state},{healer:h.role==='heal'}))});
 for(const [key,,heroes,mercs,down,healer,at=.5] of HEROLESS.slice(0,3))for(const h of heroes)for(const seed of [7,8,9,10])log('aktiv3','Big B S3 · ('+key+') '+h.spec+' · Seed '+seed,{kind:key,state:'S3',spec:h.spec,...pickRun(bigbRun({...h,mercs,seed,state:'S3'},{heroDownAt:at,downMercs:down,healer}))});}
// Etappe 4 Teil A: die restlichen Bosse in zwei Profilen („spielt richtig“, „ignoriert Mechanik“)
const E4_PARTS={expose:'expose',korkenkurt:'kurt',rita:'rita',halbespferd:'pferd'},E4_NAMES={expose:'Frau Dr. Exposé',korkenkurt:'Korken-Kurt',rita:'Reichweiten-Rita',halbespferd:'Das halbe Pferd'};
/* Heiler-WoW (2026-09-26, docs/HEILER-WOW-2026-09-26.md): jeder Heiler-Held an den Hauptbossen, Rotation aus healerFirst (Heil-Kit).
   (H1) Standardgruppe Schutz, Heilung, 2× Schaden, Held heilt mit · (H2) ohne Söldner-Heiler, Held heilt · (H3) ohne Söldner-Heiler, Held passiv
   (lebt, weicht aus, heilt nicht). Seeds SIM_HEAL_SEEDS (Vorgabe 7,8,9,10). */
const HEAL_SEEDS=(process.env.SIM_HEAL_SEEDS||'7,8,9,10').split(',').map(Number);
if(part('heiler')&&!process.env.SIM_CHILD)for(const id of onlyBosses(MAIN_BOSSES))for(const [classId,spec] of HEALERS)for(const seed of HEAL_SEEDS){const pick=r=>({time:r.time,won:r.won,wipes:r.wipes,deaths:r.deaths,mercDowns:r.mercDowns,heroHeal:r.heroHeal,share:r.heroHealShare,minParty:r.minPartyPct,bossLeft:r.bossLeft});
 log('heiler','Heiler · '+id+' · (H1) Standardgruppe · '+spec+' · Seed '+seed,{boss:id,case:'H1',spec,...pick(bossFightRun(id,{classId,spec,mercs:['tank','heal','dps1','dps2'],seed},{healer:true}))});
 log('heiler','Heiler · '+id+' · (H2) ohne Söldner-Heiler · '+spec+' · Seed '+seed,{boss:id,case:'H2',spec,...pick(bossFightRun(id,{classId,spec,mercs:['tank','dps1','dps2'],seed},{healer:true}))});
 log('heiler','Heiler · '+id+' · (H3) ohne Söldner-Heiler, Held passiv · '+spec+' · Seed '+seed,{boss:id,case:'H3',spec,...pick(bossFightRun(id,{classId,spec,mercs:['tank','dps1','dps2'],seed},{noDamage:true}))});
 /* Big B im schwersten Wut-Stand (Fix 6: Rita liegt, drei Beweise – Wut nach 3:35): ohne Söldner-Heiler */if(id==='bigb'){const r=bigbRun({classId,spec,mercs:['tank','dps1','dps2'],seed,state:'S3'},{healer:true});log('heiler','Heiler · bigb S3 · (H2) ohne Söldner-Heiler · '+spec+' · Seed '+seed,{boss:id,case:'H2-S3',spec,enrage:r.enrage,...pick(r)});}}
for(const [id,key] of Object.entries(E4_PARTS))if(part(key)||part('e4'))for(const c of CLASSES)for(const seed of SEEDS){log('e4',E4_NAMES[id]+' · spielt richtig · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,...bossRun(id,{...c,seed},{})});
 log('e4Ignore',E4_NAMES[id]+' · ignoriert Mechanik · '+c.label+' · Seed '+seed,{boss:id,cls:c.classId,...bossRun(id,{...c,seed},{dodge:false,lie:'none'})});}
// Etappe 4 Teil B: drei Flügel und der volle Durchgang (Held mit vier Söldnern); ohne --only=wings nur Dieter
if(part('wings'))for(const careful of [true,false].filter(x=>!process.env.SIM_MODE||(process.env.SIM_MODE==='careful')===x))for(const c of (ONLY.includes('wings')?CLASSES:CLASSES.slice(0,1))){const r=wingsRun({...c,seed:+(process.env.SIM_WING_SEED||7)},{careful}),how=careful?' · ein Pack je Zug':' · Nachbarn ziehen mit';for(const w of r.wings)if(!process.env.WING||w.wing===process.env.WING)log('wings','Flügel '+w.wing+' · '+c.label+how,{...w,careful});log('wings','Voller Durchgang · '+c.label+how,{full:true,careful,cls:c.classId,minutes:r.totalMinutes,xp:r.xp,xpPerMin:r.xpPerMin,deaths:r.deaths,wipes:r.wipes,rita:r.rita,returnMax:r.returnMax});}
if(part('farm')){const fieldRate=Math.max(...out.field.map(r=>r.xpPerMin));
 for(const [route,lockout] of [['gerd',false],['gerd',true],['wing',false],['wing',true]])log('farm','Farm-Schleife '+(route==='gerd'?'Hof West + Gerd':'Flügel Burghof')+(lockout?' · mit 30-min-Sperre, Rest Feld':' · ohne Sperre')+' · Dieter · 60 min',farmHour({seed:7},{route,lockout,fieldRate}));}

if(roleJobs){const order=b=>ROLE_BOSSES.indexOf(b);for(const r of (await roleJobs).sort((x,y)=>order(x.boss)-order(y.boss))){const {group,label,...rest}=r;log(group,label,rest);}}
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
/* Held aktiv (2026-09-26, Nutzerentscheidung zu Fix 4): Rollen-Fälle mit Kriterium. Quote = Siege/Läufe; Hauptbosse = Gerd, Exposé, Kurt, Big B. */
{const rate=rs=>rs.length?rs.filter(r=>r.won).length/rs.length:0,pc=x=>Math.round(x*100)+' %',frac=rs=>rs.filter(r=>r.won).length+'/'+rs.length,oh=out.ohneheld,bosses=[...new Set(oh.map(r=>r.boss))];
 const perBoss=k=>bosses.map(b=>{const rs=oh.filter(r=>r.boss===b&&r.case===k);return b.slice(0,5)+' '+frac(rs);}).join(' · ');
 if(oh.length){const main=oh.filter(r=>MAIN_BOSSES.includes(r.boss)),a=main.filter(r=>r.case==='a'),worst=Math.max(0,...MAIN_BOSSES.map(b=>rate(a.filter(r=>r.boss===b)))),bb=oh.filter(r=>r.case==='b'),cc=oh.filter(r=>r.case==='c'),dd=oh.filter(r=>r.case==='d');
  if(a.length)checks.push(['(a) Held Tank fällt bei 50 %: Hauptbosse ≤ 25 % Siege, keiner über 40 %',rate(a)<=.25&&worst<=.4,pc(rate(a))+' · '+perBoss('a')]);
  if(bb.length)checks.push(['(b) Held Heiler fällt bei 50 %: alle Bosse ≤ 25 % Siege',rate(bb)<=.25,pc(rate(bb))+' · '+perBoss('b')]);
  if(cc.length)checks.push(['(c) Held Schaden fällt bei 50 %: Söldner gewinnen ≥ 50 %',rate(cc)>=.5,pc(rate(cc))+' · '+perBoss('c')]);
  /* (d) nur zwei Schadens-Söldner: gelegentlich ein Sieg, „eher, wenn der Boss schon tief ist“ – beide Absturzpunkte zusammen (50 % und 25 %), bei 50 % selten */
  const d25=oh.filter(r=>r.case==='d25'),dAll=[...dd,...d25];if(dAll.length)checks.push(['(d) nur zwei Schadens-Söldner (fallen bei 50 % bzw. 25 %): zusammen 10–35 % Siege, bei 50 % höchstens 15 %',rate(dAll)>=.1&&rate(dAll)<=.35&&rate(dd)<=.15,pc(rate(dAll))+' · bei 50 %: '+pc(rate(dd))+' ('+perBoss('d')+') · bei 25 %: '+pc(rate(d25))+' ('+perBoss('d25')+')']);
  for(const id of bosses)checks.push(['Info · ohne Held ab 50 % · '+id,true,['a','b','c','d','d25'].map(k=>{const rs=oh.filter(r=>r.boss===id&&r.case===k),w=rs.filter(r=>r.won),ts=w.map(r=>r.time);const lost=rs.filter(r=>!r.won).map(r=>r.bossMin);return '('+k+') '+w.length+'/'+rs.length+(ts.length?' '+Math.min(...ts)+'–'+Math.max(...ts)+' s':'')+(lost.length?' · verloren bei '+Math.min(...lost)+'–'+Math.max(...lost)+' %':'');}).join(' · ')]);}
 const nh=out.nohero;if(nh.length){const alive=nh.filter(r=>r.mode==='alive'),dead=nh.filter(r=>r.mode==='dead'),nb=[...new Set(nh.map(r=>r.boss))];
  const sum=rs=>nb.map(b=>{const x=rs.filter(r=>r.boss===b),w=x.filter(r=>r.won).map(r=>r.time);return b.slice(0,5)+' '+frac(x)+(w.length?' ('+Math.min(...w)+'–'+Math.max(...w)+' s)':'');}).join(' · ');
  checks.push(['Held passiv (lebt, kein Schaden, keine Kniffe): Hauptbosse ≤ 30 % Siege',rate(alive)<=.3,pc(rate(alive))+' · '+sum(alive)],['Info · Held liegt ab 20 s (Söldner allein)',true,pc(rate(dead))+' · '+sum(dead)]);}
 /* Einsatz-Wertung: der aktive Held („folgt dem Nachsatz“, „spielt richtig“) verdient den Bonus, der passive nicht */
 const act=[...out.bigb,...out.e4,...out.gerd].filter(r=>r.einsatz!=null);if(act.length)checks.push(['Einsatz: aktiver Held (Big B, Gerd, Etappe-4-Bosse) verdient den Bonus in jedem Sieg',act.filter(r=>r.won).every(r=>r.einsatzBonus>0),'Punkte '+Math.min(...act.map(r=>r.einsatz))+'–'+Math.max(...act.map(r=>r.einsatz))+' · Bonus '+act.map(r=>r.einsatzBonus).join('')]);
 const pas=nh.filter(r=>r.mode==='alive'&&r.won&&r.einsatz!=null);if(pas.length)checks.push(['Einsatz: passiver Held bekommt keinen Bonus',pas.every(r=>!r.einsatzBonus),'Punkte '+Math.min(...pas.map(r=>r.einsatz))+'–'+Math.max(...pas.map(r=>r.einsatz))]);}
/* Dungeon-Fix 6 (Prüferin #741): passiv verliert in jeder Rolle, jedem Laufstand und jeder Art; der Live-Fall wird getroffen; aktiv bleibt gut schaffbar. */
{const rate=rs=>rs.length?rs.filter(r=>r.won).length/rs.length:0,pc=x=>Math.round(x*100)+' %',frac=rs=>rs.filter(r=>r.won).length+'/'+rs.length,ROLE_NAME={tank:'Tank',heal:'Heiler',damage:'Schaden'};
 const ps=out.passiv;if(ps.length){const combos=new Map();for(const r of ps){const k=[r.boss,r.state,r.role,r.mode].join('|');if(!combos.has(k))combos.set(k,[]);combos.get(k).push(r);}
  const worst=[...combos].map(([k,rs])=>({k,rs,q:rate(rs)})).sort((a,b)=>b.q-a.q),bad=worst.filter(x=>x.q>.4),name=k=>{const [b,s,ro,m]=k.split('|');return b+(s!=='–'?' '+s:'')+' '+ROLE_NAME[ro]+' '+m;};
  checks.push(['Held passiv, jede Rolle, Testzugang-Gruppe, Big B mit 0/3 Beweisen (Fix 6): Hauptbosse zusammen ≤ 30 % Siege',rate(ps)<=.3,pc(rate(ps))+' ('+frac(ps)+') · je Rolle '+Object.keys(ROLE_NAME).map(ro=>ROLE_NAME[ro]+' '+pc(rate(ps.filter(r=>r.role===ro)))).join(', ')+' · je Art '+Object.keys(PASSIVE_MODES).map(m=>m+' '+pc(rate(ps.filter(r=>r.mode===m)))).join(', ')],
   ['Held passiv (Fix 6): jede Kombination Boss × Laufstand × Rolle × Art ≤ 40 % Siege',!bad.length,combos.size+' Kombinationen · höchste: '+worst.slice(0,3).map(x=>name(x.k)+' '+frac(x.rs)).join(', ')+(bad.length?' · rot: '+bad.map(x=>name(x.k)+' '+frac(x.rs)).join(', '):'')]);
  for(const b of [...new Set(ps.map(r=>r.boss))])for(const s of [...new Set(ps.filter(r=>r.boss===b).map(r=>r.state))])checks.push(['Info · passiv '+b+(s!=='–'?' '+s+' ('+BIGB_STATES[s].label+')':''),true,Object.keys(ROLE_NAME).map(ro=>ROLE_NAME[ro]+' '+Object.keys(PASSIVE_MODES).map(m=>frac(ps.filter(r=>r.boss===b&&r.state===s&&r.role===ro&&r.mode===m))).join(' ')).join(' · ')+' (passiv/steht/liegt)']);
  const pw=ps.filter(r=>r.won&&r.einsatz!=null);if(pw.length)checks.push(['Einsatz (Fix 6): passiver Held bekommt nie einen Bonus',pw.every(r=>!r.einsatzBonus),'Punkte '+Math.min(...pw.map(r=>r.einsatz))+'–'+Math.max(...pw.map(r=>r.einsatz))]);}
 const lv=out.live;if(lv.length){const old=lv.filter(r=>r.rules==='#741'),cur=lv.filter(r=>r.rules==='jetzt'),ow=old.filter(r=>r.won).map(r=>r.time);
  checks.push(['Live-Fall #741 in der Simulation getroffen: mit den Regeln von #741 Sieg um 4:10 (Prüferin: Sieg nach ≈ 250 s, zwei Tode)',rate(old)>=.75&&ow.every(t=>t>=225&&t<=285),'Regeln #741: '+frac(old)+(ow.length?' in '+Math.min(...ow)+'–'+Math.max(...ow)+' s':'')+', Tode '+old.map(r=>r.deaths).join('/')],
   ['Live-Fall #741 verliert jetzt (≤ 25 % Siege)',rate(cur)<=.25,'jetzt: '+frac(cur)+' · Wut nach '+(cur[0]?.enrage??'?')+' s · verloren bei '+cur.filter(r=>!r.won).map(r=>r.bossMin+' %').join('/')]);}
 const ak=out.aktiv3;if(ak.length){const act=ak.filter(r=>r.kind==='active'),slow=act.filter(r=>!r.won||r.time>r.enrage-40);
  checks.push(['Big B aktiv, jede Rolle mit der Testzugang-Gruppe (auch Heiler-Held), 0 und 3 Beweise: jeder Sieg ≥ 40 s vor der Wut',!slow.length,['S0','S3'].map(s=>s+' '+Object.keys(ROLE_NAME).map(ro=>{const x=act.filter(r=>r.state===s&&r.role===ro),t=x.map(r=>r.time);return ROLE_NAME[ro]+' '+frac(x)+(t.length?' '+Math.min(...t)+'–'+Math.max(...t)+' s':'');}).join(', ')+' (Wut '+(act.find(r=>r.state===s)?.enrage??'?')+' s)').join(' · ')+(slow.length?' · rot: '+slow.map(r=>r.state+'/'+r.spec+' '+r.time+' s').join(', '):'')]);
  checks.push(['Info · Big B S3 (3 Beweise, Rita liegt): Held fällt bei 50 %',true,['a','b','c'].map(k=>{const x=ak.filter(r=>r.kind===k),t=x.filter(r=>r.won).map(r=>r.time);return '('+k+') '+frac(x)+(t.length?' '+Math.min(...t)+'–'+Math.max(...t)+' s':'');}).join(' · ')]);}}
/* Heiler-WoW (2026-09-26): der aktive Heiler-Held schafft die Hauptbosse auch ohne Söldner-Heiler, passiv nicht, und trägt in der Standardgruppe spürbar */
{const hs=out.heiler;if(hs.length){const frac=rs=>rs.filter(r=>r.won).length+'/'+rs.length,rate=rs=>rs.length?rs.filter(r=>r.won).length/rs.length:0,specs=[...new Set(hs.map(r=>r.spec))],med=a=>{const b=[...a].sort((x,y)=>x-y);return b.length?b[Math.floor(b.length/2)]:0;};
 const h2=hs.filter(r=>r.case==='H2'),h3=hs.filter(r=>r.case==='H3'),h1=hs.filter(r=>r.case==='H1'),s3=hs.filter(r=>r.case==='H2-S3');
 checks.push(['Heiler-WoW (H2): ohne Söldner-Heiler gewinnt der aktive Heiler-Held die Hauptbosse (je Spezialisierung ≥ 75 %)',specs.every(sp=>rate(h2.filter(r=>r.spec===sp))>=.75),specs.map(sp=>sp+' '+frac(h2.filter(r=>r.spec===sp))).join(' · ')+' · Big B '+(()=>{const t=h2.filter(r=>r.boss==='bigb'&&r.won).map(r=>r.time);return t.length?Math.min(...t)+'–'+Math.max(...t)+' s':'–';})()]);
 checks.push(['Heiler-WoW (H3): ohne Söldner-Heiler und Held passiv ≤ 25 % Siege (der Heiler wird gebraucht)',rate(h3)<=.25,Math.round(rate(h3)*100)+' % ('+frac(h3)+')']);
 checks.push(['Heiler-WoW (H1): Standardgruppe – alle Siege, der Held trägt im Median ≥ 50 % der Heilung',h1.every(r=>r.won)&&med(h1.map(r=>r.share||0))>=50,frac(h1)+' · Heilanteil Median '+med(h1.map(r=>r.share||0))+' % ('+specs.map(sp=>sp+' '+med(h1.filter(r=>r.spec===sp).map(r=>r.share||0))+' %').join(', ')+')']);
 if(s3.length)checks.push(['Info · Heiler-WoW: Big B S3 (Wut 3:35) ohne Söldner-Heiler',true,specs.map(sp=>{const x=s3.filter(r=>r.spec===sp),t=x.filter(r=>r.won).map(r=>r.time);return sp+' '+frac(x)+(t.length?' '+Math.min(...t)+'–'+Math.max(...t)+' s':'');}).join(' · ')+' (Wut '+(s3[0].enrage||'?')+' s)']);}}
out.checks=checks.map(([name,ok,value])=>({name,ok,value}));
if(JSON_OUT)console.log(JSON.stringify(out,null,1));else{console.log('\nPrüfkriterien');for(const c of out.checks)console.log((c.ok?'GRÜN ':'ROT  ')+c.name.padEnd(48)+c.value);}
if(out.checks.some(c=>!c.ok))process.exitCode=1;
