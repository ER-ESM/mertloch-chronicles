import {initProfessions,savedProfessions,tickProfession,cancelProfession} from './professions.js';
import {initMounts,savedMounts,toggleMount,dismount,tickMount,acquireMount,learnRiding,selectMount,mountStation} from './mounts.js';
import {MOUNT_UI,MOUNT_RULES,specOutput} from './content/index.js';
import {inKiosk,enterKiosk,leaveKiosk,roomInteraction,roomWorld,tickKiosk,savedKiosk} from './kiosk-instance.js';
import {upperWorld} from './world-house.js';
import {KIOSK_ROOM,KIOSK_TEXT,BUDE_HOUSE_TEXT} from './content/index.js';
import {shopInteraction,buyItem,sellItem,buybackItem} from './shop.js';
import {emitCombatFx,emitSkillFx} from './combat-fx.js';
import {createCombatMeter,beginMeterCombat,finishMeterCombat,tickCombatMeter,recordMeterDamage,restoreMeterHealth} from './combat-meter.js';
import {moveWithCollisions} from './world-collision.js';
import {walkFacing} from './maifeld-locomotion.js';
import {APEROL_TEXT} from './content/index.js';
import {initTutorial,savedTutorial,tutorialActive,tutorialConfirm,tutorialSignal,tutorialDamage,tutorialDestination,tutorialAllowsTravel,tickTutorial} from './tutorial.js';
import {restorePosition,savedPosition} from './player-save.js';
import {tickAuto,startAuto,stopAuto,toggleAuto,enemyAuto,tickCasting,movingToCast} from './auto-combat.js'
import {robbiTaunt,burstMultiplier,afterBurst,onGroundMech,damageMultiplier,onMarkExpire,onStrikeMech,onHitTakenMech,onKillMech,isMobile,quickGcd,skillCostMech,onHealMech} from './spec-mechanics.js';
import {arenaHit,tickArena,freshArenaStats} from './arena.js';
import {freshProcState,fireProcs,procFree,consumeProc,tickProcs} from './procs.js';
import {weaponSkillDamage,skillDamage} from './equipment.js';
import {ITEMS,createRpg,equipmentStats,combatStats,chooseReward,savedRpg,refreshEquipment,createDrop,unlockOnBar,addItem,countItem,hasMaterials,consumeMaterials,nearestLoot,actionBar,barSlots,barItemId,useItem,autoLootBag,placeUsables} from './rpg.js';
import {describeEntry,activeBuffs,skillCooldown} from './describe.js';
import {registerRoll,QUALITIES} from './itemization.js';
import {startActivity,tickActivity} from './activities.js';
import {stepPlayer} from './movement.js';
import {available,xpToNext} from './progression.js';
import {talentPoints,talentState} from './talents.js';
import {freshClassState,classSkills,healPlayer,addGuard,beforeSkill,skillCost,performTalent,afterSkill,afterDamage,onParry,onKill,modifyHit,tickClass} from './class-mechanics.js';
import {VillageLife} from './village-life.js';
import {distance,rng,SCALE} from './world.js';
import {inDungeon,dungeonRun,tickDungeon,dungeonInteraction,dungeonDoorInteraction,enterDungeon,leaveDungeon,dungeonStep,dungeonSecret,dungeonBossCast,resolveDungeonCast,dungeonDamageFactor,onDungeonKill,dungeonRespawn,normalizeDungeons} from './dungeon.js';
import {DUNGEON_CASTS} from './content/index.js';
import {initCompanions,tickCompanions,tickEnemyOnCompanion,companionFocus,addThreat,resetCompanions,savedCompanions,companionOffers,hireCompanion,dismissCompanion,orderCompanions,setCompanionStance} from './companions.js';
import {companionAid,companionAidFailure,healCompanionByPlayer,buffCompanionByPlayer} from './companions.js';
import {castClassBuff,receiveClassBuff,tickClassBuffs,savedClassBuffs,restoreClassBuffs,classBuffValue} from './class-buffs.js';
import {TANK_SPECS} from './net-world.js';
import {member,skillsFor,STORY} from './clan.js';
import {EncounterDirector,makeEnemy,idleEnemy,beginReturn,tryRespawn,walkClear,moveAlong,inSanctuary,ARCHETYPES} from './encounters.js';
import {HotspotDirector,restoreHotspots,onHotspotKill,hotspotInteraction,hotspotDestination} from './hotspots.js';
import {BALANCE,SPEC_MECHANICS,CAST_SETS,killXp,PROCS,SYSTEM_LINES,BOSS_LINES,BOSSES,ENEMY_BARKS,VILLAGERS,COMBAT_RULES,COMBAT_TEXT,STORY_CHAPTERS,triggeredMemories,BUILDINGS,BUILDING_IDS,nextStage,buildingEffects,hubLine} from './content/index.js';
export const COMBAT_FX_VERSION=1;
export const SKILLS=skillsFor('dieter');
/** Kapitel des laufenden Akts (Reserve-Kapitel späterer Akte bleiben aus). */
export const ACT_CHAPTERS=STORY_CHAPTERS.filter(c=>!c.reserve&&c.act===STORY.act);
export const FIRST_CHAPTER=ACT_CHAPTERS[0].id,LAST_CHAPTER=ACT_CHAPTERS.at(-1).id;
export const chapterAt=n=>ACT_CHAPTERS.find(c=>c.id===n)||ACT_CHAPTERS[0];
/** Treffpunkt-Regel: Clanwechsel und Basisbau gehen nur im Umkreis von HUB_RADIUS um world.spawn oder in der Bude
 *  (Haus und Hof, E-52) und außerhalb des Kampfes. */
export const HUB_RADIUS=150;
/** Gesprächsreichweite zu Ida und den Mentoren; die Aktionstaste der UI arbeitet mit denselben Zahlen. */
export const TALK_RANGE=50,MENTOR_RANGE=42,GATHER_RANGE=36;
const hubRule=what=>what+' nur am sicheren Treffpunkt, außerhalb eines Kampfes.';
const clampInt=(n,min,max,fallback=min)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Math.floor(Number(n)))):fallback;
/** Nötige Anzahl eines Kapitelziels. Boss-Ziele sind erledigt oder nicht. */
const objectiveNeed=o=>o.kind==='boss'?1:Math.max(1,o.count|0);
/** Spielstand des Kapitelfortschritts. Alte Stände kennen nur wolves/cultists/boss/accepted/claimed und laufen als Kapitel 1 weiter. */
function restoreQuest(s={},sameWorld=true){
 const legacy=!('chapter' in s);
 const chapterClaimed=clampInt(s.chapterClaimed,0,LAST_CHAPTER,s.claimed?FIRST_CHAPTER:0);
 const chapter=clampInt(s.chapter,FIRST_CHAPTER,LAST_CHAPTER,Math.min(LAST_CHAPTER,chapterClaimed+1));
 const counts={};for(const [key,value] of Object.entries(s.counts&&typeof s.counts==='object'?s.counts:{}))if(/^\d+:\d+$/.test(key))counts[key]=Math.max(0,Number(value)||0);
 const first=chapterAt(FIRST_CHAPTER).objectives;
 return {chapter,accepted:legacy&&s.claimed?false:!!s.accepted,claimed:chapterClaimed>=FIRST_CHAPTER,chapterClaimed,actDone:!!s.actDone||chapterClaimed>=LAST_CHAPTER,
  wolves:clampInt(s.wolves,0,objectiveNeed(first[0]),0),cultists:clampInt(s.cultists,0,objectiveNeed(first[1]),0),boss:!!s.boss,counts,
  gathered:sameWorld&&Array.isArray(s.gathered)?s.gathered.filter(id=>typeof id==='string').slice(0,400):[]};
}
/** Geteilte Welt: Gegner folgt dem Spieler, den er laut Server bekämpft, und schlägt dort sichtbar zu (ohne lokalen Schaden). */
function followRemote(g,e,dt){const t=e.remoteTarget,d=distance(e,t),reach=e.autoAttack.range*.8;e.facing=e.x<t.x?1:-1;e.direction=walkFacing(t.x-e.x,t.y-e.y,e.direction||'se');if(e.stun>0)return;if(d>reach){const step=Math.min(e.speed*(e.mark>0?e.slow:1)*dt,d-reach+1);if(walkClear(g.world,e,t,7)){g.move(e,(t.x-e.x)/d*step,(t.y-e.y)/d*step);e.moving=true;}else{e.pathTimer-=dt;if(e.pathTimer<=0){e.pathTimer=1.1;e.chasePath=g.world.findPath(e,t);}moveAlong(g,e,e.chasePath,e.speed,dt);}}else{e.autoTimer=(e.autoTimer||0)-dt;if(e.autoTimer<=0){e.autoTimer=e.autoAttack.speed||2;e.attack=.3;}}}
/** Interne Schadensschlüssel, die für einen Klassenkniff stehen – angezeigt wird der Kniffname der Klasse. */
const SKILL_LABEL_KEYS=new Set(['Kelle','Pfandwurf','Parade','Markierung','Sprung']);
export class Game{
  constructor(world,saved={},options={}){
    this.meter=createCombatMeter();this.world=world;this.member=member(saved.classId);this.skills=skillsFor(this.member.id);this.lastStrike=-100;this.trainingXp=Math.max(0,Number(saved.trainingXp) || ((Number(saved.level)||1)*((Number(saved.level)||1)-1)*70+(Number(saved.xp)||0)));this.seenSkills=new Set([...(saved.seenSkills||['strike','dash']),'auto']);this.autoAttack={enabled:false,timers:{}};this.casting=null;this.buffs={};this.classState=freshClassState();this.fields=[];this.aiming=null;this.aimPoint=null;this.zones=[];this.life=new VillageLife(world);this.time=0;this.paused=false;this.keys=new Set();this.target=null;this.fx=[];this.texts=[];this.events=[];this.messages=[];this.cooldowns=Object.fromEntries(this.skills.map(s=>[s.id,0]));this.gcd=0;this.moveTo=null;this.path=[];this.dead=false;this.random=rng(9876);this.momentum={stacks:0,until:0,restUntil:0};this.procState=freshProcState();
    const level=Number.isInteger(saved.level)?Math.max(1,Math.min(30,saved.level)):1;
    const baseHp=BALANCE.player.baseHp+(level-1)*BALANCE.player.hpPerLevel;
    this.player={...restorePosition(world,saved),classId:this.member.id,hp:baseHp,maxHp:baseHp,energy:100,level,xp:Math.max(0,Number(saved.xp)||0),parry:0,invulnerable:0,moving:false,attack:0,inCombat:0};
    this.classBuffs=restoreClassBuffs(saved.classBuffs);
    this.quest=restoreQuest(saved.quest||{},saved.worldKey===world.id);
    // Spieleinstellungen. Auto-Loot ist der Standard; die UI schaltet ihn über setSetting('autoLoot', …) ab.
    this.settings={autoLoot:saved.settings?.autoLoot!==false,prerender:saved.settings?.prerender===true,sct:saved.settings?.sct!==false,light:saved.settings?.light!==false,fx:saved.settings?.fx!==false,fps:saved.settings?.fps===true,fullRes:saved.settings?.fullRes===true,autoRes:saved.settings?.autoRes!==false};
    this.memories={seen:Array.isArray(saved.memories?.seen)?saved.memories.seen.filter(id=>typeof id==='string'):[]};
    this.buildings=Object.fromEntries(BUILDING_IDS.map(id=>[id,clampInt(saved.buildings?.[id],0,BUILDINGS[id].stages.length,0)]).filter(([,stage])=>stage>0));
    this.mentorTalks=saved.mentorTalks&&typeof saved.mentorTalks==='object'?Object.fromEntries(Object.entries(saved.mentorTalks).map(([id,n])=>[id,clampInt(n,0,1e6,0)])):{};
    this.relic=!!saved.relic;this.discovered=new Set(saved.discovered||[]);this.stats={damage:0,interrupts:0,parries:0,dodges:0,kills:0};this.enemies=[];
    const sameWorld=saved.worldKey===world.id;
    this.sideQuests=Object.fromEntries((world.quests||[]).map(q=>{const old=sameWorld?saved.sideQuests?.[q.id]:null;return[q.id,{accepted:!!old?.accepted,progress:Math.min(q.required,Math.max(0,Number(old?.progress)||0)),collected:Array.isArray(old?.collected)?old.collected.filter(id=>q.items.some(i=>i.id===id)):[],claimed:!!old?.claimed}];}));
    this.trackedQuest=sameWorld&&this.sideQuests[saved.trackedQuest]?saved.trackedQuest:null;this.hotspots=restoreHotspots(saved.hotspots);
    this.campSerial=0;this.populateCamps();
    initMounts(this,saved.mounts);initProfessions(this,saved.professions);
    this.rpg=createRpg(saved.rpg,world.id,this.member.id);for(const [id,build] of Object.entries(this.rpg.talentBuilds))Object.assign(build,talentState(build,id,talentPoints(this)));this.refreshStats();this.ecology=new EncounterDirector(this);this.hotspotDirector=new HotspotDirector(this);placeUsables(this,this.rpg.inventory.map(e=>e.id));
    initCompanions(this,sameWorld?saved.companions:null);this.dungeons=normalizeDungeons(saved.dungeons);
    initTutorial(this,saved,options.guidedStart);if(sameWorld&&saved.instance?.id===KIOSK_ROOM.id)enterKiosk(this,saved.instance);
  }
  toggleMount(id){return toggleMount(this,id);}
  dismount(){return dismount(this);}
  acquireMount(id){return acquireMount(this,id);}
  learnRiding(){return learnRiding(this);}
  selectMount(id){return selectMount(this,id);}
  refreshStats(){this.skills=classSkills(this);for(const s of this.skills)this.cooldowns[s.id]??=0;refreshEquipment(this);}
  resetClassState(){this.autoAttack.enabled=false;this.casting=null;this.touchMove=null;this.classState=freshClassState();this.procState=freshProcState();this.fields=[];this.zones=[];this.aiming=null;this.aimPoint=null;this.player.parry=0;this.player.hurt=0;this.player.dash=0;this.player.castPose=0;this.player.parryCharges=0;this.buffs={};}
  learnTalentSkill(id){if(id)unlockOnBar(this,[id]);}
  lootRandom(){let n=this.rpg.lootState|0;n^=n<<13;n^=n>>>17;n^=n<<5;this.rpg.lootState=n>>>0;return this.rpg.lootState/4294967296;}
  /** Helden-Slots (E-38): jeder Held behält seine Klasse – auch der übernommene Altstand; andere Klassen sind eigene Helden. */
  get classLocked(){return !!this.hero;}
  /** Anzeigename und Rollenzeile des Helden (eigener Name statt Klassenfigur). */
  get heroName(){return this.hero?.name||this.member.name;}
  switchMember(id){if(this.classLocked&&id!==this.member.id){this.toast('Dein Held bleibt bei seiner Klasse. Für eine andere Klasse erstellst du in der Heldenhalle einen neuen Helden.');return false;}if(this.dead||this.paused||!this.atHub()){this.toast(hubRule('Clanwechsel'));return false;}if(member(id).id!==id)return false;finishMeterCombat(this);this.member=member(id);this.rpg.talents=this.rpg.talentBuilds[id];this.player.classId=id;this.lastStrike=-100;this.resetClassState();this.refreshStats();this.target=null;this.emit('classChanged');this.emit('save');return true;}
  log(text){this.messages.push({text,time:this.time});this.messages=this.messages.slice(-5);}
  toast(text){this.events.push({type:'toast',text});}
  emit(type,data={}){this.events.push({type,...data});}
  /** Am Treffpunkt und nicht im Kampf? Gilt für Clanwechsel und Basisbau. */
  /** Figurenwahl am Anmeldebildschirm: außerhalb des Clan-Treffs startet die neue Figur dort; mitten im Kampf oder am Boden geht kein Wechsel. */
  enterAs(id){if(member(id).id!==id)return false;if(id===this.member.id)return true;if(this.dead||this.player.inCombat>0)return false;const paused=this.paused;this.paused=false;if(!this.atHub()){if(inKiosk(this))leaveKiosk(this,true);Object.assign(this.player,this.world.spawn,{vx:0,vy:0,moving:false});this.path=[];}const ok=this.switchMember(id);this.paused=paused;return ok;}
  atHub(){const p=this.player,b=this.world.base;return !inKiosk(this)&&p.inCombat<=0&&(distance(p,this.world.spawn)<=HUB_RADIUS||!!b&&p.x>b.minX-20&&p.x<b.maxX+20&&p.y>b.minY-20&&p.y<b.maxY+20);}
  /** Spruch einer Figur: steht im Kampflog und geht als Ereignis `bark` an die UI (Sprechblase). */
  /** Scrolling Combat Text (combat-text.js): eine Zeile mit Icon und Wert; Schwebetexte am Helden fallen weg, wenn der Kampftext an ist. */
  sct(data){this.emit('combat',{member:this.member.id,...data});return this.settings?.sct!==false;}
  bark(source,text,kind){if(!text)return null;
   // Sprechblasen-Drossel (Nutzerbefund 2026-09-18: viele Blasen auf einmal): je Art höchstens eine Blase innerhalb der Sperrfrist;
   // Boss-, Phasen- und Kapitelzeilen sind wichtig und nie gedrosselt. Dorfbewohner reden nicht, solange ein Gegner spricht.
   const gap={villager:7,enemy:4}[kind];const last=this.barkClock||(this.barkClock={});if(gap!==undefined){const busy=Object.entries(last).some(([k,t])=>k!=='villager'&&this.time-t<3);if(this.time-(last[kind]??-Infinity)<gap||(kind==='villager'&&busy))return null;}last[kind]=this.time;
   if(kind!=='villager')this.log(source.name+': „'+text+'“');this.emit('bark',{enemyId:source.id??null,name:source.name,text,kind,x:source.x,y:source.y});return text;}
  /** Sprechblasen der Dorfbewohner: village-life.js öffnet die Blase, die Zeile kommt aus content/npcs.js. */
  villagerBarks(){
    const state=this.barkState||(this.barkState=new Map());
    for(const a of this.life?.actors||[]){
      if(a.kind!=='villager')continue;
      const seen=state.get(a.id)||{open:false,count:0};
      if(a.bubble>0&&!seen.open){
        const villager=VILLAGERS.find(v=>v.variant===a.variant)||VILLAGERS[0];
        this.bark({id:a.id,name:villager.name,x:a.x,y:a.y},villager.says[seen.count%villager.says.length],'villager');
        seen.count++;
      }
      seen.open=a.bubble>0;state.set(a.id,seen);
    }
  }
  float(x,y,text,color='#f3dfaa'){this.texts.push({x,y,text,color,life:1.25,max:1.25});}
  effect(type,x,y,data={}){this.fx.push({type,x,y,id:this.fxSerial=(this.fxSerial||0)+1,life:.5,max:.5,...data});if(this.fx.length>256)this.fx.splice(0,this.fx.length-256);}
  selectNext(reverse=false){if(inKiosk(this)||this.floor)return false;const p=this.player,fighting=p.inCombat>0,all=this.enemies.filter(e=>(!tutorialActive(this)||e.tutorial||e.arena)&&e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0)&&this.world.lineClear(p,e));let choices=all.filter(e=>fighting?(e.aggro&&distance(e,p)<260||e.behavior==='aggressive'&&distance(e,p)<65):distance(e,p)<240);if(fighting&&choices.some(e=>e.aggro))choices=choices.filter(e=>e.aggro);choices.sort((a,b)=>distance(a,p)-distance(b,p));if(!choices.length){this.target=null;this.toast('Kein passendes Ziel in direkter Nähe.');return;}const nearest=distance(choices[0],p);choices=choices.filter(e=>distance(e,p)<=nearest+85);const i=choices.indexOf(this.target);this.target=i<0?choices[0]:choices[(i+(reverse?-1:1)+choices.length)%choices.length];this.emit('target');}
  selectAt(x,y){if(inKiosk(this)||this.floor)return false;const e=this.enemies.filter(e=>(!tutorialActive(this)||e.tutorial||e.arena)&&e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0)&&distance({x,y:y+10},e)<27).sort((a,b)=>distance({x,y},a)-distance({x,y},b))[0];if(e){this.target=e;this.emit('target');return true;}return false;}
  action(id,point=null,completing=false,aidId=this.companionAidId){
    if(inKiosk(this)){this.toast(KIOSK_TEXT.noCombat);return false;}
    if(this.paused||this.dead)return false;
    // Ein Leistenplatz darf auch als Zahl kommen; benutzbare Gegenstände laufen ohne Menü direkt in useItem.
    if(this.professionCommit)return false;cancelProfession(this);
    if(Number.isInteger(id))id=actionBar(this)[id]??null;
    if(id==='mount')return toggleMount(this);
    const barItem=barItemId(id);if(barItem)return useItem(this,barItem);
    const s=this.skills.find(s=>s.id===id);if(!s)return false;if(!available(this,id)){this.toast('Diesen Kniff lernst du später. Dein Fortschritt steht unter der Spielwelt.');return false;}
    dismount(this);
    if(id==='auto')return toggleAuto(this);if(this.casting&&!completing){if(id==='dash')this.casting=null;else if(!s.offGcd){this.toast(COMBAT_TEXT.busy);return false;}}
    const p=this.player,cs=combatStats(this),cost=procFree(this,id)?0:skillCostMech(this,s,skillCost(this,s,cs)),context={interrupted:!!this.target?.cast?.interruptible};const failure=beforeSkill(this,s,cs);if(failure){this.toast(failure);return false;}if(this.cooldowns[id]>.01){this.toast(COMBAT_TEXT.cooldown?.(s.name,this.cooldowns[id].toFixed(1))||`${s.name} ist noch nicht bereit · ${this.cooldowns[id].toFixed(1)} s.`);return false;}
    if(!completing&&!s.offGcd&&this.gcd>0)return false;
    if(p.energy<cost){this.toast(COMBAT_TEXT.needResources);return false;}
    const aid=['heal','buff'].includes(id)?companionAid(this,aidId):null;
    if(['heal','buff'].includes(id)){const failure=companionAidFailure(this,aidId);if(failure){this.toast(failure);return false;}}
    // Klassen-Buff (class-buffs.js): Ziel ist Söldner, Gruppenmitglied oder man selbst; kostenlos, nur globale Abklingzeit.
    if(s.classBuff){if(!castClassBuff(this,s,aidId))return false;this.cooldowns[id]=skillCooldown(this,s,cs);if(!s.offGcd&&!completing)this.gcd=cs.gcd;p.castPose=.28;tutorialSignal(this,id);this.emit('sound',{id:'buff'});this.emit('save');return true;}
    let e=this.target;
    if(s.ground){if(!point){this.aiming=id;this.aimPoint={...p};this.toast('Boden wählen · Rechtsklick / Esc abbrechen.');return false;}if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||distance(p,point)>s.range+(cs.range||0)||this.world.blocked(point.x,point.y,3)||!this.world.lineClear(p,point)){this.toast('Freien Boden in Reichweite und Sicht wählen.');return false;}}
    if(s.range&&!s.ground){
      if(!e||e.hp<=0){this.selectNext();e=this.target;}
      if(!e){return false;}if(e.ai==='returning'||e.spawnGrace>0){this.toast('Dieses Ziel zieht gerade ab oder kommt erst an.');return false;}
      if(distance(p,e)>s.range+(cs.range||0)){this.toast(`Zu weit entfernt · ${Math.ceil(distance(p,e)/SCALE)} m. Bewege dich näher zum Ziel.`);return false;}
      if(!this.world.lineClear(p,e)){this.toast('Ein Gebäude oder Hindernis versperrt die Sicht.');return false;}
    }
    if(id==='heal'&&p.hp>=p.maxHp&&!(aid&&aid.hp<aid.maxHp)&&!this.netParty?.friend?.()&&!cs.overhealShield&&!cs.healEmpower&&this.rpg.talents.spec!=='baerbel-stage'){this.toast('Deine Gesundheit ist bereits vollständig.');return false;}
    if(s.castTime&&!completing){if(!isMobile(this,s)&&movingToCast(this)){this.toast(COMBAT_TEXT.moving);return false;}this.casting={id,name:s.name,aidId:aidId||null,point:point?{...point}:null,targetId:s.range&&!s.ground?e.id:null,remaining:s.castTime,total:s.castTime};if(!s.offGcd)this.gcd=quickGcd(this,id,e)?Math.min(cs.gcd,BALANCE.player.gcdQuick||1):cs.gcd;this.aiming=null;this.aimPoint=null;return true;}
    const origin={x:p.x,y:p.y},fxTarget={x:(s.ground?point:e||p).x,y:(s.ground?point:e||p).y};context.marked=e?.mark>0;context.interrupted=!!e?.cast?.interruptible;
    const base=this.baseEffects(),quick=quickGcd(this,id,e);
    this.cooldowns[id]=skillCooldown(this,s,cs);const surge=id==='burst'&&p.energy>=BALANCE.momentum.surgeAt;p.energy-=cost;consumeProc(this,'glow',id);consumeProc(this,'free',id);const pm=consumeProc(this,'empower',id)?2:1;
    if(!s.offGcd&&!completing)this.gcd=quick?Math.min(cs.gcd,BALANCE.player.gcdQuick||1):cs.gcd;
    if(!['dash','parry'].includes(id)&&!(s.range&&!s.ground))p.castPose=.28;
    if(s.range&&!s.ground){this.autoAttack.enabled=true;e.aggro=true;e.ai='combat';p.inCombat=7;p.facing=e.x>p.x?1:-1;p.direction=walkFacing(e.x-p.x,e.y-p.y,p.direction||'se');p.attack=.25;p.attackSource=s.weaponSource||'melee';}
    if((s.ground&&s.damage||id==='detonate'||id==='snare')&&this.target?.hp>0)startAuto(this);
    if(s.talent){performTalent(this,s,point,cs);if(s.ground){this.aiming=null;this.aimPoint=null;}}
    if(id==='strike'){const empowered=this.classState.empowered>0;if(empowered)this.classState.empowered--;this.damage(e,skillDamage(this,s,s.damage,ITEMS)*(empowered||this.classState.freeStrike?2:1)*pm,'Kelle');onStrikeMech(this,e,cs);const passives=this.member.passives||{},window=passives.beatWindow,beat=!!window&&this.time-this.lastStrike>=window[0]&&this.time-this.lastStrike<=window[1];if(beat)p.energy=Math.min(100,p.energy+(passives.beatEnergy||0));this.lastStrike=this.time;context.beat=beat;if(beat)this.float(p.x,p.y-35,APEROL_TEXT.combo,this.member.color);p.energy=Math.min(100,p.energy+s.gain);}
    if(id==='throw'){this.damage(e,skillDamage(this,s,s.damage,ITEMS)*pm,'Pfandwurf');}
    if(id==='ground'){this.aiming=null;this.aimPoint=null;if(!onGroundMech(this,s,point,cs))this.zones.push({...point,remaining:s.delay,radius:s.radius,damage:skillDamage(this,s,s.damage,ITEMS)});}
    if(id==='mark'){e.mark=s.duration;e.dotTimer=1;e.dotDamage=s.dot;e.slow=s.slow||1;this.float(e.x,e.y-23,'MARKIERT!','#9fdacb');this.log(s.name+' · '+s.duration+' s markiert.');}
    if(id==='burst'){const marked=e.mark>0;let n=skillDamage(this,s,s.base,ITEMS)*(marked?s.multiplier:1)*pm;if(this.relic)n*=1.12;if(this.rpg.talents.spec==='dieter-brawl'&&this.classState.rage>=5)n*=1.25;if(this.rpg.talents.spec==='kevin-iron')n*=.7;n*=burstMultiplier(this,e,cs,context);if(surge){n*=1+BALANCE.momentum.surgeBonus;if(!this.sct({area:'note',kind:'proc',text:'IN FAHRT',color:'#ffd37a'}))this.float(p.x,p.y-46,'IN FAHRT','#ffd37a');}this.damage(e,Math.round(n),marked?'RESONANZ':'Entladung');afterBurst(this,e,cs,Math.round(n),context);fireProcs(this,'burst',cs,{damage:Math.round(n)});if(s.splash)for(const other of this.enemies){if(other!==e&&other.hp>0&&other.ai!=='returning'&&other.spawnGrace<=0&&distance(e,other)<s.splash&&this.world.lineClear(e,other))this.damage(other,Math.round(n*.55)*(1+(cs.aoe||0)),APEROL_TEXT.splash);}if(s.knockback&&e.hp>0){const d=distance(p,e)||1;for(let i=0;i<7;i++)this.move(e,(e.x-p.x)/d*(s.knockback+(cs.hunterFinish?35:0))/7,(e.y-p.y)/d*(s.knockback+(cs.hunterFinish?35:0))/7);}e.mark=0;e.slow=1;if(marked){this.emit('shake',{strength:4});}}
    if(id==='interrupt'){
      if(e.cast&&e.cast.interruptible){e.cast=null;e.stun=2;fireProcs(this,'interrupt',cs);e.attackTimer=3;e.vulnerable=4;this.stats.interrupts++;const passives=this.member.passives||{};this.cooldowns.burst=Math.max(0,this.cooldowns.burst-(passives.interruptBurstCd||0));p.energy=Math.min(100,p.energy+15+(cs.procs.includes('silence')?10:0));if(!this.sct({area:'note',kind:'avoid',text:'UNTERBROCHEN',skill:'interrupt',color:'#9bdce4'}))this.float(e.x,e.y-30,'UNTERBROCHEN','#9bdce4');this.log('Klare Ansage · unterbrochen! +35 % Schaden für 4 s.');}
      else this.toast('Kein unterbrechbarer Zauber aktiv. Achte auf gelbe Balken.');
      this.damage(e,skillDamage(this,s,s.damage,ITEMS),'Ansage');
    }
    if(id==='parry'){p.parry=s.window+(cs.parryWindow||0);p.parryCharges=cs.doubleParry?2:1;}
    if(id==='dash'){
      p.dash=.22;
      let dx=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),dy=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);
      if(this.touchMove&&(this.touchMove.x||this.touchMove.y)){dx=this.touchMove.x;dy=this.touchMove.y;}if(!dx&&!dy){dx=e?p.x-e.x:p.facing;dy=e?p.y-e.y:0;}const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;p.invulnerable=.4;this.moveTo=null;this.path=[];this.routeGoal=null;
      for(let i=0;i<s.steps;i++){this.move(p,dx*4,dy*4);}
    }
    if(id==='buff'){this.buffs={...s,remaining:s.duration*(1+(base.buffDuration||0)),shield:s.shield?Math.round(s.shield*(cs.flatScale||1)*(1+cs.shieldPower+(cs.shieldBonus||0))):0};this.log(s.name+' · '+s.duration+' s aktiv.');if(aid)buffCompanionByPlayer(this,aid,this.buffs);if(!aid)this.netParty?.buffFriend?.({name:s.name,icon:s.icon,duration:this.buffs.remaining,reduction:s.reduction||0,hot:s.hot||0,shield:this.buffs.shield||0});this.netParty?.buff?.({name:s.name,icon:s.icon,duration:this.buffs.remaining,reduction:s.reduction||0,hot:s.hot||0,shield:this.buffs.shield||0});}
    if(id==='heal'){const amount=Math.round(s.heal*(cs.flatScale||1)*(1+cs.healPower+(cs.healBonus||0))),own=healPlayer(this,s.heal,cs,true),help=aid?healCompanionByPlayer(this,aid,amount):0;if(aid&&(cs.hotHeal||this.rpg.talents.spec==='baerbel-care')&&this.classState.hot>0)aid.aidHot={remaining:this.classState.hot,power:Math.round(this.classState.hotPower*(1+cs.healPower+(cs.healBonus||0))),tick:1};onHealMech(this,own+help,cs);if(!aid)this.netParty?.aidHeal?.(amount,s.name);fireProcs(this,'heal',cs);}
    afterSkill(this,id,e,cs,context);emitSkillFx(this,s,origin,fxTarget,context);if(id==='dash')fireProcs(this,'dash',cs);fireProcs(this,'skillHit',cs,{skill:id});if(context.beat)fireProcs(this,'beat',cs,{skill:id});const zones=this.fields.filter(z=>z.remaining>0&&distance(p,z)<z.radius).map(z=>z.kind);if(zones.length)fireProcs(this,'inZone',cs,{skill:id,zones});tutorialSignal(this,id);this.emit('sound',{id});return true;
  }
  damage(e,n,label){if(e.tutorial){const before=e.hp,result=tutorialDamage(this,e,n,label);if(e.hp<before)emitCombatFx(this,'hit',e,{amount:before-e.hp,label});return result;}if(tutorialActive(this)&&!e.arena)return 0;if(e.hp<=0||e.ai==='returning')return;e.aggro=true;e.ai='combat';this.player.inCombat=7;const cs=combatStats(this),critical=this.random()<cs.crit,mark=e.mark>0,bonus=(label==='Markierung'?(cs.markBonus||0):label==='RESONANZ'||label==='Entladung'?(cs.burstBonus||0):0)+(cs.execute&&e.hp/e.maxHp<.3?cs.execute:0)+(mark&&cs.procs.includes('verdict')?.1:0);n*=damageMultiplier(this,e,label,cs);if(e.dungeon)n*=dungeonDamageFactor(this,e);const actual=Math.round(n*specOutput(cs.spec).damage*(1+cs.power)*(1+bonus)*(critical?1.6+(cs.critDamage||0):1)*(e.vulnerable>0?1.35:1)*(this.buffs.remaining>0?this.buffs.power||1:1));const dealt=Math.min(e.hp,actual);recordMeterDamage(this,e,actual,dealt,label,critical);if(e.arena)arenaHit(this,e,dealt);if(critical)fireProcs(this,'crit',cs);if(label==='Autoangriff')fireProcs(this,'autoHit',cs);if(label==='Markierung')fireProcs(this,'markTick',cs);if(mark)fireProcs(this,'markedHit',cs,{skill:label,enemy:e,damage:dealt});e.hp=Math.max(0,e.hp-actual);this.stats.damage+=dealt;if(this.companions.length)addThreat(e,'player',dealt*(TANK_SPECS.includes(this.rpg.talents.spec)?3:1));if(dealt>0)emitCombatFx(this,'hit',e,{amount:dealt,critical,label});if(critical&&cs.procs.includes('rage')){const before=this.player.energy;this.player.energy=Math.min(100,this.player.energy+PROCS.rage.energy);if(this.player.energy>before)emitCombatFx(this,'proc',this.player,{procId:'item:rage',signal:'resource',label:'RANDALE'});}if(cs.leech){const back=restoreMeterHealth(this,Math.round(dealt*cs.leech),'leech');if(back>0){this.sct({area:'in',kind:'heal',value:back,text:'Lebensraub',iconKey:'food'});emitCombatFx(this,'heal',this.player,{amount:back,direct:false});}}afterDamage(this,e,dealt,cs);e.hurt=.15;const sctSkill={Autoangriff:null,Kelle:'strike',Pfandwurf:'throw',Parade:'parry',Markierung:'mark',Entladung:'burst',RESONANZ:'burst',Sprung:'ground',Deckelwelle:'burst',Spezialkniff:'strike'}[label]||null;/* Anzeige: echter Kniffname der Klasse statt des internen Schlüssels ("Kelle" hieß bei jeder Klasse Kelle) */const sctText=SKILL_LABEL_KEYS.has(label)?(this.skills.find(s=>s.id===sctSkill)?.name||label):label;if(!this.sct({area:'out',kind:'damage',value:actual,crit:critical,skill:sctSkill,text:sctText,enemyId:e.id}))this.float(e.x+(this.random()-.5)*14,e.y-27,String(actual)+(critical?'!':''),critical?'#ffdf78':label==='RESONANZ'?'#ecc3fc':'#fff0bf');if(e.hp<=0)this.kill(e);return dealt;}
  kill(e){const wasMarked=e.mark>0,cs=combatStats(this);onKill(this,e,wasMarked,cs);onKillMech(this,e,wasMarked,cs);this.gainMomentum(cs);if(cs.procs.includes('thirst')){const before=this.player.energy;this.player.energy=Math.min(100,this.player.energy+PROCS.thirst.energy);if(this.player.energy>before)emitCombatFx(this,'proc',this.player,{procId:'item:thirst',signal:'resource',label:'RANDALE'});}e.hp=0;const wasAuto=this.autoAttack.enabled;if(this.target===e){stopAuto(this,false);const next=this.enemies.filter(o=>o!==e&&o.hp>0&&o.aggro&&o.ai!=='returning'&&!(o.spawnGrace>0)).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];if(next&&this.player.inCombat>0){this.target=next;if(wasAuto)startAuto(this);}}e.aggro=false;e.cast=null;e.dead=(e.respawn?.[0]||35)+this.random()*((e.respawn?.[1]||55)-(e.respawn?.[0]||35));e.respawnAt=this.time+e.dead;e.ai='dead';e.mark=0;e.roamGoal=null;this.stats.kills++;
    if(e.arena){(this.arenaStats||(this.arenaStats=freshArenaStats())).kills++;e.respawnAt=Infinity;this.effect('death',e.x,e.y,{life:1.5,max:1.5});this.log(e.name+' besiegt · Arena, keine EP.');if(e.type==='boss'&&BOSS_LINES[e.bossId])this.bark(e,BOSS_LINES[e.bossId].defeat,'boss');return;}
    if(e.dungeon)onDungeonKill(this,e);
    createDrop(this,e);const xp=Math.round(killXp(e)*(1+BALANCE.party.xpPerMember*Math.min(4,this.netParty?.near?.()||0)));this.gainXp(xp);if(e.type==='boss'&&BOSS_LINES[e.bossId])this.bark(e,BOSS_LINES[e.bossId].defeat,'boss');if(!this.sct({area:'note',kind:'xp',value:xp,unit:'EP',iconKey:'coins',color:'#bacd8b'}))this.float(e.x,e.y-40,'+'+xp+' EP','#bacd8b');this.effect('death',e.x,e.y,{life:1.5,max:1.5});this.log(e.name+' besiegt · +'+xp+' EP.');
    const sq=this.sideQuests[e.questId],def=this.world.quests?.find(q=>q.id===e.questId);if(sq?.accepted&&!sq.claimed&&def){sq.progress=Math.min(def.required,sq.progress+1);if(sq.progress===def.required)this.toast(SYSTEM_LINES.questDone(def.giver.name));}onHotspotKill(this,e);
    if(this.quest.accepted&&!e.ambient&&!e.questId&&!e.worldBoss&&!e.dungeon&&this.quest.chapterClaimed<this.quest.chapter){
      const chapter=this.quest.chapter;let progressed=false;
      for(const [i,o] of this.objectives(chapter).entries()){
        const hit=o.kind==='boss'?e.type==='boss'&&(!e.bossId||e.bossId===o.boss):o.kind==='kill'&&(o.type?e.type===o.type:e.family===o.family);
        if(!hit)continue;this.setQuestCount(chapter,i,this.questCount(chapter,i)+1);progressed=true;
      }
      if(progressed&&this.questReady())this.toast(chapter===FIRST_CHAPTER?SYSTEM_LINES.mainReady:SYSTEM_LINES.chapterReady(STORY.giver));
    }
    if(e.type==='boss'&&!e.worldBoss){this.emit('bossVictory',{boss:e.bossId});if(e.bossId)this.memoryEvent({kind:'bossDefeat',boss:e.bossId});}this.emit('save');
  }
  gainMomentum(cs=combatStats(this)){const M=BALANCE.momentum,m=this.momentum,p=this.player;m.stacks=Math.min(M.maxStacks,m.stacks+1);m.until=this.time+M.duration;m.restUntil=this.time+M.restSeconds;p.energy=Math.min(100,p.energy+M.energyOnKill+(this.baseEffects().energyOnKill||0));this.cooldowns.mark=0;fireProcs(this,'kill',cs);if(!this.sct({area:'note',kind:'momentum',text:'SCHWUNG '+'▲'.repeat(m.stacks),iconKey:'boots',color:'#f4c06a'}))this.float(p.x,p.y-52,'SCHWUNG '+'▲'.repeat(m.stacks),'#f4c06a');}
  gainXp(n){if(!Number.isFinite(n)||n<=0)return;n=Math.round(n*(1+(this.baseEffects().xpBonus||0)));const oldSkills=this.skills.filter(s=>available(this,s.id)).map(s=>s.id),p=this.player;this.trainingXp+=n;p.xp+=n;while(p.level<30&&p.xp>=xpToNext(p.level)){p.xp-=xpToNext(p.level);const hpBefore=p.maxHp;p.level++;this.refreshStats();p.hp=p.maxHp;/* Stufenaufstieg: die UI zeigt die große Einblendung (milestone-ui.js); text bleibt als Rückfall */this.emit('levelUp',{level:p.level,hpGain:p.maxHp-hpBefore,text:SYSTEM_LINES.levelUp(p.level)});if(p.level===BALANCE.player.specLevel&&!this.rpg.talents?.spec){this.emit('specUnlocked');this.log('Stufe '+p.level+': Wähle im Clanbuch unter Talente deinen Hauptbaum – deine gesparten Punkte warten.');}this.memoryEvent({kind:'level',level:p.level});this.emit('rpgChanged');this.effect('heal',p.x,p.y,{life:1.5,max:1.5});}if(p.level===30)p.xp=Math.min(p.xp,xpToNext(p.level));const learned=this.skills.filter(s=>available(this,s.id)&&!oldSkills.includes(s.id)).map(s=>s.id);if(learned.length){/* Klassen-Buffs (30 min) nicht automatisch auf die Leiste: sie liegen im Kniffe-Menü und verdrängen sonst Kampfkniffe */unlockOnBar(this,learned.filter(id=>!this.skills.find(s=>s.id===id)?.classBuff));this.emit('skillsUnlocked',{ids:learned});}this.emit('save');}
  // ---------- Akt 1: Kapitel, Lager, Erinnerungsfetzen, Basisbau, Mentoren ----------
  /** Lager gehört zu einem Kapitel, das schon läuft? Lager ohne `chapter` sind Kapitel 1 bzw. Nebenquest-Lager. */
  // ── Geteilte Welt (online.js, E-35): der Server führt Lebenspunkte, Bedrohung und Ziel der Lagergegner ──
  /** Gruppenspiel (E-42): ein Gruppenmitglied in der Nähe hat gesammelt – mein gleiches Sammelziel zählt mit. */
  sharedGather(item,from){if(this.dead||!this.quest.accepted||this.quest.chapterClaimed>=this.quest.chapter)return false;const index=this.objectives().findIndex(o=>o.kind==='gather'&&o.item===item);if(index<0)return false;const before=this.questCount(this.quest.chapter,index);if(this.setQuestCount(this.quest.chapter,index,before+1)===before)return false;const p=this.objectiveProgress(index);this.toast(from+' sammelt für die Gruppe · '+(ITEMS[item]?.name||item)+' '+p.done+'/'+p.need);if(this.questReady())this.toast(SYSTEM_LINES.chapterReady(STORY.giver));this.emit('rpgChanged');this.emit('save');return true;}
  /** Gruppenspiel (E-42): Klassenbuff eines Gruppenmitglieds wirkt anteilig (BALANCE.party.buffShare) auch auf mich. */
  applyPartyBuff(b,from,k=BALANCE.party.buffShare){if(this.dead||!b?.name)return false;this.partyBuff={name:b.name,from,icon:b.icon,remaining:Math.min(60,Number(b.duration)||0),reduction:(Number(b.reduction)||0)*k,shield:Math.round((Number(b.shield)||0)*k),hot:Math.round((Number(b.hot)||0)*k),tick:1};this.effect('heal',this.player.x,this.player.y,{life:.8,max:.8});this.log(from+' stärkt die Gruppe: '+b.name+'.');return true;}
  /** Miteinander (E-44): ein Gruppenmitglied heilt oder schützt mich gezielt – volle Stärke, anders als der Gruppenanteil. */
  receiveAid({from,name,heal=0,b=null,cb=null}={}){if(this.dead)return false;const p=this.player;if(cb)receiveClassBuff(this,cb,from);if(heal>0){const actual=Math.min(Math.round(heal*(1+classBuffValue(this,'healTaken'))),p.maxHp-p.hp);p.hp+=actual;this.effect('heal',p.x,p.y,{life:.8,max:.8});if(!this.sct?.({area:'in',kind:'heal',value:actual,crit:false,text:from,iconKey:'food'}))this.float(p.x,p.y-20,'+'+actual,'#b7df92');this.log(from+' heilt dich'+(name?' mit '+name:'')+' · +'+actual+' Leben.');}if(b)this.applyPartyBuff(b,from,1);return true;}
  /** Miteinander (E-44): ein Mitspieler hilft mir auf – ich stehe an Ort und Stelle wieder, ohne Heimweg. */
  reviveHere(from){if(!this.dead)return false;const p=this.player;Object.assign(p,{hp:Math.max(1,Math.round(p.maxHp*BALANCE.party.reviveHp)),energy:Math.max(p.energy,30),inCombat:0,hurt:0,invulnerable:3,vx:0,vy:0,moving:false});this.dead=false;this.attackers?.clear();this.target=null;this.enemies.forEach(e=>{if(e.aggro&&!e.netId)this.resetEnemy(e);});this.effect('heal',p.x,p.y,{life:1.5,max:1.5});this.toast(from+' hilft dir wieder auf die Beine.');this.emit('revived',{from});this.emit('save');return true;}
  /** Miteinander (E-44): der Server sagt einen Weltboss an; alle Clients stellen ihn an dieselbe Stelle (Lager `spot`). */
  spawnWorldBoss({e,boss,spot=0,hpx=1}={}){const old=this.netEnemy(e);if(old)return old;const def=BOSSES[boss],camps=(this.world.camps||[]).filter(c=>!c.questId);if(!def||!camps.length||!e)return null;const camp=camps[spot%camps.length],at=this.world.findClear?.(camp.x+70,camp.y+50)||{x:camp.x+70,y:camp.y+50},{id,chapter,...rest}=def;const en=makeEnemy(at,800000+(this.worldBossSerial=(this.worldBossSerial||0)+1),{...rest,type:'boss',bossId:boss,name:def.name+' · Weltboss',hp:Math.round(def.hp*BALANCE.party.worldBossHp*hpx),level:(def.level||1)+BALANCE.party.worldBossLevel,netId:e,worldBoss:true,respawn:[1e9,1e9]});this.enemies.push(en);return en;}
  removeWorldBoss(e){const en=this.netEnemy(e);if(!en?.worldBoss)return false;if(this.target===en){this.target=null;stopAuto(this,false);}this.enemies=this.enemies.filter(x=>x!==en);return true;}
  // Begleiter (E-45) – Schnittstelle für die Oberfläche, Regeln in companions.js
  companionOffers(){return companionOffers(this);}
  hireCompanion(id,options){return hireCompanion(this,id,options);}
  dismissCompanion(id){return dismissCompanion(this,id);}
  orderCompanions(order,id){return orderCompanions(this,order,id);}
  setCompanionStance(stance,id){return setCompanionStance(this,stance,id);}
  netEnemy(netId){return this.enemies.find(e=>e.netId===netId)||null;}
  /** Schaden anderer Spieler: senkt nur die Lebenspunkte, keine Procs, keine Statistik. */
  applyRemoteHp(e,hp,by){if(!e||e.hp<=0||!(hp<e.hp))return false;const lost=Math.round(e.hp-hp);e.hp=Math.max(1,hp);e.hurt=.15;if(lost>0&&by)this.float(e.x+(this.random()-.5)*14,e.y-27,String(lost),'#9fc4e8');return true;}
  /** Der Server meldet: Gegner kämpft gegen einen anderen Spieler (Position) – oder wieder gegen mich/niemanden (null). */
  setRemoteTarget(e,point){if(!e||e.hp<=0)return;if(!point){e.remoteTarget=null;return;}e.remoteTarget={x:point.x,y:point.y,until:this.time+3};e.ai='combat';e.cast=null;}
  /** Der Server meldet den Tod. credit: ich war beteiligt → volle Belohnung über kill(); sonst verschwindet der Gegner still. */
  remoteKill(e,{credit=false,respawnIn=45}={}){if(!e)return false;e.remoteTarget=null;if(e.hp>0){if(credit)this.kill(e);else{if(this.target===e){this.target=null;stopAuto(this,false);}e.hp=0;e.aggro=false;e.cast=null;e.ai='dead';e.mark=0;e.roamGoal=null;this.effect('death',e.x,e.y,{life:1.5,max:1.5});}}e.dead=respawnIn;e.respawnAt=this.time+respawnIn;return true;}
  /** Der Server meldet: niemand kämpft mehr – Gegner läuft heim und heilt. */
  remoteReset(e){if(!e||e.hp<=0)return;e.remoteTarget=null;if(!e.aggro)beginReturn(this,e);}
  campActive(c){return !c.chapter||c.chapter<=this.quest.chapter;}
  /** Gegnerwerte eines Lagers: Kapitel-Lager nehmen ihren Archetyp bzw. Boss aus content/enemies.js. */
  campDefinition(c){
    if(c.type==='boss'){const bossId=c.boss||chapterAt(c.chapter||FIRST_CHAPTER).boss,def=BOSSES[bossId];if(!def)return {};const {id,...rest}=def;return {...rest,bossId};}
    return c.archetype&&ARCHETYPES[c.archetype]?{...ARCHETYPES[c.archetype]}:{};
  }
  /** Bevölkert alle aktiven, noch leeren Lager. Läuft beim Laden und nach jedem Kapitelwechsel. */
  populateCamps(){
    const w=this.world;
    for(const c of w.camps||[]){
      if(!this.campActive(c)||this.enemies.some(e=>e.campId===c.id))continue;
      const def=this.campDefinition(c);
      for(let i=0;i<c.count;i++){
        const spot=c.spawns?.[i]||w.findClear(c.x+(i-1)*42,c.y+Math.sin(i*3)*48,9);
        this.enemies.push(makeEnemy(spot,++this.campSerial,{...def,type:c.type,campId:c.id,chapter:c.chapter,questId:c.questId,
          netId:c.id+':'+i,roamRadius:c.type==='wolf'&&!c.questId?24:40,aggroRange:c.type==='wolf'&&!c.questId?78:c.type==='boss'?105:105,
          spawnPoints:c.spawns||[spot],name:c.questId?(w.quests?.find(q=>q.id===c.questId)?.enemyName||'Pfandkeiler am Grillplatz'):def.name}));
      }
    }
  }
  chapter(){return chapterAt(this.quest.chapter);}
  objectives(chapter=this.quest.chapter){return chapterAt(chapter).objectives||[];}
  /** Zählerstand eines Ziels. Kapitel 1 nutzt weiter die alten Speicherfelder wolves/cultists/boss. */
  questCount(chapter,index){
    if(chapter===FIRST_CHAPTER)return [this.quest.wolves,this.quest.cultists,this.quest.boss?1:0][index]||0;
    return this.quest.counts[chapter+':'+index]||0;
  }
  setQuestCount(chapter,index,value){
    const need=objectiveNeed(this.objectives(chapter)[index]||{}),n=Math.max(0,Math.min(need,value));
    if(chapter===FIRST_CHAPTER){if(index===0)this.quest.wolves=n;else if(index===1)this.quest.cultists=n;else this.quest.boss=n>0;return n;}
    this.quest.counts[chapter+':'+index]=n;return n;
  }
  /** Fortschritt eines Ziels. Sammelziele zählen Sammelpunkte ODER den Bestand im Rucksack – was mehr ist. */
  objectiveProgress(index,chapter=this.quest.chapter){
    const objective=this.objectives(chapter)[index];if(!objective)return null;
    const need=objectiveNeed(objective);let done=this.questCount(chapter,index);
    if(objective.kind==='gather')done=Math.max(done,countItem(this.rpg,objective.item));
    return {objective,done:Math.min(done,need),need,complete:done>=need};
  }
  chapterProgress(chapter=this.quest.chapter){return this.objectives(chapter).map((_,i)=>this.objectiveProgress(i,chapter));}
  questReady(){return !this.quest.actDone&&this.quest.chapterClaimed<this.quest.chapter&&this.chapterProgress().every(p=>p.complete);}
  /** Lager, das ein Ziel des Kapitels bedient. */
  campFor(objective,chapter=this.quest.chapter){
    const camps=(this.world.camps||[]).filter(c=>!c.questId&&(c.chapter||FIRST_CHAPTER)===chapter);
    if(objective.kind==='boss')return camps.find(c=>c.type==='boss');
    if(objective.kind==='gather')return camps.find(c=>c.gathers?.some(g=>g.item===objective.item));
    return camps.find(c=>c.type!=='boss'&&(objective.type?c.type===objective.type:ARCHETYPES[c.archetype]?.family===objective.family));
  }
  /** Offene Sammelpunkte des laufenden Kapitels. */
  gatherPoints(chapter=this.quest.chapter){
    return (this.world.camps||[]).filter(c=>(c.chapter||FIRST_CHAPTER)===chapter&&c.gathers?.length&&this.campActive(c))
      .flatMap(c=>c.gathers).filter(g=>!this.quest.gathered.includes(g.id));
  }
  /** Sammelpunkt in Reichweite (für die Aktionstaste der UI). */
  gatherInteraction(){if(tutorialActive(this)||!this.quest.accepted)return null;return this.gatherPoints().filter(g=>distance(this.player,g)<GATHER_RANGE).sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0]||null;}
  /** Sammelpunkt einsammeln: Material wandert in den Rucksack, das Kapitelziel zählt hoch. */
  collectGather(id){
    const point=this.gatherPoints().find(g=>g.id===id);
    if(this.paused||this.dead||!point||distance(this.player,point)>36)return false;
    if(addItem(this.rpg,point.item)){this.toast('Dein Rucksack ist voll.');return false;}
    this.quest.gathered.push(id);
    const index=this.objectives().findIndex(o=>o.kind==='gather'&&o.item===point.item);
    if(index>=0)this.setQuestCount(this.quest.chapter,index,this.questCount(this.quest.chapter,index)+1);
    this.netParty?.gather?.(point.item);
    const progress=index>=0?this.objectiveProgress(index):null;
    this.effect('heal',point.x,point.y,{life:.8,max:.8});
    this.toast(progress?SYSTEM_LINES.gatherProgress(progress.done,progress.need,ITEMS[point.item].name):ITEMS[point.item].name+' eingepackt.');
    if(this.questReady())this.toast(SYSTEM_LINES.chapterReady(STORY.giver));
    this.emit('rpgChanged');this.emit('save');return true;
  }
  /** Meldet ein Ereignis an die Erinnerungsfetzen. Jeder Fetzen erscheint genau einmal. */
  memoryEvent(event){
    const found=triggeredMemories(event,this.memories.seen);
    for(const fragment of found){this.memories.seen.push(fragment.id);this.emit('memory',{fragment});this.toast(SYSTEM_LINES.memory(fragment.title));}
    if(found.length)this.emit('save');
    return found;
  }
  /** Summe der Basisbau-Vorteile. Wird in Regeneration, Verpflegung, Beute, EP, Schaden und Abklingzeiten eingerechnet. */
  baseEffects(){return buildingEffects(this.buildings);}
  /** Nächste baubare Stufe eines Gebäudes (oder null, wenn Kapitel fehlt oder Endausbau erreicht). */
  nextBuildStage(id){return nextStage(id,this.buildings[id]||0,this.quest.chapterClaimed);}
  /** Baut die nächste Stufe: prüft Ort (Treffpunkt, kein Kampf), Kapitel und Material, meldet Fetzen-Ereignis. */
  build(id){
    if(this.paused||this.dead||!BUILDINGS[id])return false;
    if(!this.atHub()){this.toast(SYSTEM_LINES.buildPlace?.(BUILDINGS[id].name)||hubRule('Ausbau'));return false;}
    const stage=this.nextBuildStage(id);
    if(!stage){this.toast(BUILDINGS[id].name+': dafür fehlt noch ein Kapitel.');return false;}
    if(!hasMaterials(this.rpg,stage.cost)){this.toast('Material fehlt: '+Object.entries(stage.cost).map(([item,n])=>ITEMS[item].name+' '+countItem(this.rpg,item)+'/'+n).join(' · '));return false;}
    consumeMaterials(this.rpg,stage.cost);
    this.buildings[id]=stage.stage;
    this.toast(SYSTEM_LINES.building(stage.name,stage.stage));
    this.log(BUILDINGS[id].name+' · '+stage.name+': '+stage.text);
    this.emit('buildingsChanged',{building:id,stage:stage.stage});this.emit('rpgChanged');
    this.memoryEvent({kind:'buildingStage',building:id,stage:stage.stage});
    this.emit('save');return true;
  }
  /** Auftragsziel in Reichweite der Aktionstaste (P3/P5): Beute des laufenden Auftrags, Sammelpunkt oder die
   *  Person, auf die die goldene Wegmarke zeigt. Steht eines davon, hat es Vorrang vor Mentoren und Nebenquests. */
  questFocus(){
    const p=this.player,bag=nearestLoot(this);
    if(bag)return {kind:'loot',point:{x:bag.x,y:bag.y},id:bag.id,priority:0};
    const gather=this.gatherInteraction();
    if(gather)return {kind:'gather',point:{x:gather.x,y:gather.y},id:gather.id,item:gather.item,priority:1};
    const goal=this.destination(),npc=this.world.npc;
    if(goal&&npc&&distance(goal.point,npc)<1&&distance(p,npc)<TALK_RANGE)return {kind:'npc',point:{x:npc.x,y:npc.y},id:npc.id??null,name:npc.name,label:goal.label,priority:2};
    return null;
  }
  /** Rangfolge der Aktionstaste als ein Wert: Auftragsziel, dann Mentor, dann Nebenquest, dann Ida, dann Konterbrunnen.
   *  Reine Zustandsbeschreibung (kind, point, priority, id) – die Beschriftungen baut die UI aus content/. */
  enterKiosk(){return enterKiosk(this);}
  enterDungeon(id='schloss-bigb',options){return enterDungeon(this,id,options);}
  leaveDungeon(options){return leaveDungeon(this,options);}
  dungeonStep(id,side){return dungeonStep(this,id,side);}
  dungeonSecret(id){return dungeonSecret(this,id);}
  get dungeonRun(){return dungeonRun(this);}
  leaveKiosk(force=false){return leaveKiosk(this,force);}
  interaction(){
    if(inKiosk(this))return roomInteraction(this);
    if(inDungeon(this))return dungeonInteraction(this);
    // Obergeschoss der Bude (E-52): Leute und Orte im Erdgeschoss oder draußen sind von oben nicht ansprechbar.
    if(this.floor)return null;
    const p=this.player,focus=this.questFocus();if(focus)return focus;{const door=dungeonDoorInteraction(this);if(door)return door;}
    const hotspot=hotspotInteraction(this);if(hotspot)return hotspot;
    const mentor=this.mentorInteraction();if(mentor)return {kind:'mentor',point:{x:mentor.x,y:mentor.y},id:mentor.id,name:mentor.name,priority:3};
    const stable=mountStation(this.world);if(!tutorialActive(this)&&distance(p,stable)<=MOUNT_RULES.range&&this.world.lineClear(p,stable))return {kind:'mounts',point:stable,name:MOUNT_UI.station,priority:4};
    const shop=shopInteraction(this);if(shop)return shop;
    const side=this.questInteraction();if(side)return {...side,point:{x:side.point.x,y:side.point.y},priority:4};
    if(this.world.npc&&distance(p,this.world.npc)<TALK_RANGE)return {kind:'npc',point:{x:this.world.npc.x,y:this.world.npc.y},name:this.world.npc.name,priority:5};
    if(this.world.shrine&&distance(p,this.world.shrine)<GATHER_RANGE)return {kind:'shrine',point:{x:this.world.shrine.x,y:this.world.shrine.y},priority:6};
    return null;
  }
  buyItem(id,count=1){return buyItem(this,id,count);}
  sellItem(id,count=1){return sellItem(this,id,count);}
  buybackItem(token){return buybackItem(this,token);}
  /** Rechtsklick startet ausdrücklich; der Angriffsbutton schaltet um, Esc beendet. */
  startAttack(){return !inKiosk(this)&&!this.dead&&!this.paused&&startAuto(this);}
  stopAuto(){return stopAuto(this);}
  /** Spieleinstellung setzen (heute nur `autoLoot`). Meldet `settingsChanged` und speichert. */
  setSetting(key,value){if(!Object.hasOwn(this.settings,key))return false;this.settings[key]=!!value;this.emit('settingsChanged',{key,value:this.settings[key]});this.emit('save');return true;}
  /** Beutel öffnen: bei Auto-Loot wandert alles sofort in den Rucksack, sonst bekommt die UI den Beutel fürs Fenster. */
  openLoot(id){const bag=this.rpg.loot.find(b=>b.id===id);if(!bag||this.dead)return null;
   if(distance(this.player,bag)>COMBAT_RULES.lootRange){this.toast('Der Beutel ist zu weit weg. Geh näher heran.');return null;}
   if(!this.settings.autoLoot)return bag;
   autoLootBag(this,bag);return null;}
  /** Beschreibung eines Elements: content-Info plus Laufzeitwerte (Schaden, Abklingzeit, Restdauer, Stapel). */
  describe(kind,id){return describeEntry(this,kind,id);}
  /** Laufende Stärkungen und Proc-Fenster mit Restzeit; `describe` nennt Art und Id für game.describe(). */
  activeBuffs(){return activeBuffs(this);}
  /** Leistenplätze für die UI: Kniff, Gegenstand (Stapel, Bereitschaft) oder leer. */
  bar(){return barSlots(this);}
  /** Mentor in Gesprächsreichweite (Dieter, Anni, Kevin an der Bude). */
  mentorInteraction(){if(tutorialActive(this)||this.questFocus())return null;return (this.world.mentors||[]).filter(m=>distance(this.player,m)<MENTOR_RANGE).sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0]||null;}
  /** Spricht einen Mentor an: liefert und meldet dessen Zeile für das laufende Kapitel. */
  talkToMentor(id){
    const mentor=(this.world.mentors||[]).find(m=>m.id===id);
    if(this.paused||this.dead||!mentor||distance(this.player,mentor)>42)return null;
    const index=this.mentorTalks[id]=(this.mentorTalks[id]||0)+1;
    const line=hubLine(id,this.quest.chapter,index-1,this.quest.actDone);
    this.emit('mentorTalk',{npc:id,name:mentor.name,line,chapter:this.quest.chapter,actDone:this.quest.actDone});
    this.emit('save');return {npc:id,name:mentor.name,line};
  }
  acceptQuest(){if(tutorialActive(this)||this.quest.actDone||this.quest.accepted)return false;this.quest.accepted=true;this.log('Auftrag angenommen: '+this.chapter().title);this.emit('save');return true;}
  /** Belohnung abholen und ins nächste Kapitel wechseln. Nach dem letzten Kapitel ist der Akt abgeschlossen. */
  claimQuest(choice){
    if(this.paused||!this.questReady()||this.dead||distance(this.player,this.world.npc)>50)return false;
    const chapter=this.chapter(),reward=chapter.reward||{};
    if(!chooseReward(this,this.rewardKey(),choice,reward.gear))return false;
    this.quest.chapterClaimed=chapter.id;this.quest.claimed=this.quest.chapterClaimed>=FIRST_CHAPTER;this.relic=true;
    this.rpg.coins+=reward.coins||0;this.gainXp(reward.xp||0);
    // Ohne Hose gestartet: die erste Kapitelbelohnung legt zusätzlich ein gewürfeltes Beinteil in den Rucksack.
    if(chapter.id===FIRST_CHAPTER){const legs=registerRoll(this.rpg,ITEMS,{slot:'legs',spec:'tresen',level:this.player.level,quality:QUALITIES[0],roll:(this.world.seed||0)%1000,family:'quest'});if(addItem(this.rpg,legs))this.rpg.recovery.push(legs);}
    this.memoryEvent({kind:'chapterClaimed',chapter:chapter.id});
    if(chapter.id>=LAST_CHAPTER)this.quest.actDone=true;
    else{this.quest.chapter=chapter.id+1;this.quest.accepted=false;this.populateCamps();}
    this.emit('chapterChanged',{chapter:this.quest.chapter,claimed:chapter.id,actDone:this.quest.actDone});
    this.emit('save');return true;
  }
  /** Schlüssel der Belohnungsauswahl. Kapitel 1 behält 'main' (alte Spielstände und alte UI). */
  rewardKey(chapter=this.quest.chapter){return chapter===FIRST_CHAPTER?'main':'main-'+chapter;}
  acceptSideQuest(id){const q=this.world.quests?.find(q=>q.id===id),s=this.sideQuests[id];if(tutorialActive(this)||this.paused||this.dead||!q||!s||s.accepted||distance(this.player,q.giver)>45)return false;s.accepted=true;this.trackedQuest=id;this.log('Auftrag angenommen: '+q.title);this.emit('save');return true;}
  questInteraction(){if(tutorialActive(this))return null;const p=this.player,choices=[];for(const q of this.world.quests||[]){const s=this.sideQuests[q.id];if(distance(p,q.giver)<42)choices.push({kind:'giver',quest:q,point:q.giver,label:`Mit ${q.giver.name} sprechen`});if(s.accepted&&!s.claimed)for(const item of q.items)if(!s.collected.includes(item.id)&&distance(p,item)<36)choices.push({kind:'item',quest:q,item,point:item,label:item.type==='herb'?(q.itemName||'Antikater-Minze')+' sammeln':q.activity==='wires'?'Kabelrätsel lösen':'Soundcheck spielen'});}return choices.sort((a,b)=>distance(p,a.point)-distance(p,b.point))[0]||null;}
  collectQuestItem(questId,itemId,verified=false){const q=this.world.quests?.find(q=>q.id===questId),s=this.sideQuests[questId],item=q?.items.find(i=>i.id===itemId);if(this.paused||this.dead||!item||!s?.accepted||s.claimed||s.collected.includes(itemId)||distance(this.player,item)>36)return false;if(q.activity&&!verified){startActivity(this,q,item);return false;}if(q.activity&&(!this.activity||this.activity.questId!==questId||this.activity.itemId!==itemId||this.activity.score<(this.activity.mode==='rhythm'?3:4)))return false;s.collected.push(itemId);s.progress=s.collected.length;this.effect('heal',item.x,item.y,{life:.8,max:.8});this.toast(s.progress===q.required?`Alles erledigt. Kehre zu ${q.giver.name} zurück.`:SYSTEM_LINES.gatherProgress(s.progress,q.required,q.itemName||'Antikater-Minze'));this.emit('save');return true;}
  claimSideQuest(id,choice){const q=this.world.quests?.find(q=>q.id===id),s=this.sideQuests[id];if(this.paused||this.dead||!q||!s?.accepted||s.claimed||s.progress<q.required||distance(this.player,q.giver)>45)return false;if(!chooseReward(this,id,choice))return false;s.claimed=true;this.rpg.coins+=10;this.gainXp(q.reward);if(this.trackedQuest===id)this.trackedQuest=null;this.log(q.title+' abgeschlossen · +'+q.reward+' EP.');this.emit('save');return true;}
  questDestination(id=this.trackedQuest){const q=this.world.quests?.find(q=>q.id===id);if(!q)return null;const s=this.sideQuests[q.id],camp=this.world.camps.find(c=>c.questId===q.id),approach=camp?.approach&&distance(this.player,camp.approach)>110?camp.approach:q.target;return {point:s.progress>=q.required?q.giver:q.items.find(i=>!s.collected.includes(i.id))||approach,label:s.progress>=q.required?q.giver.name:q.title};}
  /** Goldene Wegmarke: nächstes offenes Ziel des laufenden Kapitels, sonst Ida. Beschriftungen kommen aus content/story.js. */
  destination(){
    if(inKiosk(this))return {point:KIOSK_ROOM.service,label:KIOSK_TEXT.counter};
    const intro=tutorialDestination(this);if(intro)return intro;
    const side=this.questDestination();if(side)return side;
    const hotspot=hotspotDestination(this);if(hotspot)return hotspot;
    return this.mainDestination();
  }
  /** Ziel der Hauptquest allein (ohne Neben- und Hotspot-Aufträge) – auch für die Tracker-Liste. */
  mainDestination(){
    if(this.quest.actDone)return null;
    if(!this.quest.accepted||this.questReady())return {point:this.world.npc,label:STORY.giver};
    for(const [i,o] of this.objectives().entries()){
      const progress=this.objectiveProgress(i);if(progress.complete)continue;
      if(o.kind==='gather'){const spot=this.gatherPoints().sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0];if(spot)return {point:spot,label:o.label};}
      const camp=this.campFor(o);if(!camp)continue;
      return {point:camp.approach&&distance(this.player,camp.approach)>110?camp.approach:camp,label:o.label};
    }
    return {point:this.world.npc,label:STORY.giver};
  }
  /** Welt, in der eine Figur läuft: Kiosk-Raum, Obergeschoss der Bude (nur der eigene Held, E-52) oder das Dorf. */
  walkWorld(entity=this.player){return inKiosk(this)?roomWorld:(this.floor&&entity===this.player&&upperWorld(this.world.base?.house))||this.world;}
  /** Treppe der Bude in Reichweite? Liefert Beschriftung und Ziel des Wechsels. */
  stairsInteraction(){const s=this.stairsTarget();return s&&distance(this.player,s.from)<s.range?s:null;}
  /** Wechsel über die Treppe des eigenen Geschosses, ohne Reichweite: Treppe (Box), Standpunkt davor (from) und Ziel. */
  stairsTarget(){const h=this.world.base?.house;if(!h?.stairs||!h.upper?.stairs||inKiosk(this)||this.dead)return null;
    return this.floor?{label:BUDE_HOUSE_TEXT.down,to:0,point:h.stairs.foot,from:h.upper.stairs.landing,range:h.upper.stairs.range,box:h.upper.stairs}
      :{label:BUDE_HOUSE_TEXT.up,to:1,point:h.upper.stairs.landing,from:h.stairs.foot,range:h.stairs.range,box:h.stairs};}
  /** Treppe begehbar (Nutzerwunsch 2026-09-23: „so aussehen, dass man sie wirklich hochrennt und erst ab der passenden Stufe umschaltet“):
   *  Laufspur innerhalb der Treppenbreite, Einstieg nur am Antritt (unten, Süden); seitlich halten Geländer und Wand. */
  stairLane(x,y,r=5){const b=!this.floor&&this.world.base?.house?.stairs;return !!b&&x-r>=b.minX-.01&&x+r<=b.maxX+.01&&y>=b.minY&&y-r<=b.maxY;}
  /** Hub des Helden auf der Treppe: 0 am Antritt, `rise` auf der obersten Stufe – der Renderer zeichnet ihn so viel höher. */
  stairLift(p=this.player){const b=this.world.base?.house?.stairs;if(this.floor||!b||!this.stairLane(p.x,p.y))return 0;return (b.rise||15)*Math.max(0,Math.min(1,(b.maxY-p.y)/(b.maxY-b.minY)));}
  /** Laufwelt des Helden im Erdgeschoss: wie die Dorfwelt, nur die Treppenspur ist frei. */
  stairsWorld(){const w=this.world;if(!w.base?.house?.stairs)return w;if(this.laneWorld?.base!==w){const game=this;this.laneWorld={base:w,w:{blocked:(x,y,r=6)=>game.stairLane(x,y,r)?false:w.blocked(x,y,r)}};}return this.laneWorld.w;}
  /** Am Antritt leicht zur Treppenmitte führen, damit man nicht an der Wange hängen bleibt. */
  stairFunnel(old,dy){const b=this.world.base?.house?.stairs,p=this.player;if(this.floor||!b||dy>=0||Math.abs(p.y-old.y)>.01||p.y>b.maxY+9||p.y<b.maxY-1||p.x<b.minX||p.x>b.maxX||this.stairLane(p.x,p.y))return;
    const cx=(b.minX+b.maxX)/2,nx=p.x+Math.sign(cx-p.x)*Math.min(Math.abs(cx-p.x),2);if(!this.stairsWorld().blocked(nx,p.y,5))p.x=nx;}
  /** Klick auf die Treppe: zum Antritt laufen und die Stufen hinauf; oben zum Absatz, durch den Zugang hinein und hinunter. */
  climbStairs(){const h=this.world.base?.house,b=this.floor?h?.upper?.stairs:h?.stairs;if(!b||!h.upper?.stairs||this.paused||inKiosk(this)||this.dead)return false;const cx=(h.stairs.minX+h.stairs.maxX)/2;
    if(!this.floor){const top={x:cx,y:h.stairs.minY+2};if(this.stairLane(this.player.x,this.player.y)){this.moveTo=top;this.path=[];this.routeGoal=null;return true;}
      if(!this.navigate({x:cx,y:h.stairs.maxY+6.5}))return false;this.path.push({x:cx,y:h.stairs.maxY+6},{x:cx,y:h.stairs.maxY-4},top);this.routeGoal=null;return true;}
    if(!this.navigate(b.landing))return false;this.path.push({x:b.minX+4,y:b.landing.y});this.routeGoal=null;this.stairsAutoDown=true;return true;}
  /** Stockwerk wechseln; `then` = nächster Laufpunkt (Klickweg die Treppe hinunter). */
  switchFloor(to,point,then=null){dismount(this);this.floor=to;this.stairsHeld=true;this.stairsFrom={x:point.x,y:point.y};this.stairsAutoDown=false;Object.assign(this.player,{x:point.x,y:point.y,moving:false,vx:0,vy:0});this.moveTo=then;this.path=[];this.routeGoal=null;this.target=null;this.stopAuto();this.emit('floorChanged',{floor:this.floor});return true;}
  /** Taste F am Treppenfuß beziehungsweise am Absatz: direkter Wechsel (Abkürzung). */
  useStairs(anywhere=false){const s=anywhere?this.stairsTarget():this.stairsInteraction();if(!s||this.paused)return false;this.keys.clear();return this.switchFloor(s.to,s.point);}
  move(entity,dx,dy){const old={x:entity.x,y:entity.y},mine=entity===this.player,w=inKiosk(this)?roomWorld:mine?(this.floor?upperWorld(this.world.base?.house)||this.world:this.stairsWorld?.()||this.world):this.world;moveWithCollisions(w,entity,dx,dy);if(mine&&!inKiosk(this))this.stairFunnel?.(old,dy);const travelled=Math.hypot(entity.x-old.x,entity.y-old.y);if(travelled>.001){entity.direction=walkFacing(entity.x-old.x,entity.y-old.y,entity.direction||'se');if(entity!==this.player)entity.walkDistance=(entity.walkDistance||0)+travelled;}}
  /** Umschalten erst auf der passenden Stufe: unten auf der obersten Stufe (Laufrichtung Norden) ins Obergeschoss auf den Absatz;
   *  oben am Zugang im Nordosten (Laufrichtung Westen) hinab auf die oberen Stufen. Nach einem Wechsel erst wieder scharf nach einer
   *  Viertelsekunde ohne Laufrichtung oder zehn Einheiten Weg – gehaltene Tasten pendeln sonst. */
  walkStairs(dx,dy,routed,dt){const h=this.world.base?.house,p=this.player;if(!h?.stairs||!h.upper?.stairs||inKiosk(this)||this.dead||this.paused)return false;
    this.stairsIdle=dx||dy?0:(this.stairsIdle||0)+dt;if(this.stairsHeld&&(this.stairsIdle>=.25||!this.stairsFrom||distance(p,this.stairsFrom)>=10))this.stairsHeld=false;if(this.stairsHeld)return false;
    const g=h.stairs,u=h.upper.stairs,cx=(g.minX+g.maxX)/2;
    if(!this.floor)return dy<0&&this.stairLane(p.x,p.y)&&p.y<=g.minY+(g.topStep||8)?this.switchFloor(1,u.landing,this.moveTo&&this.moveTo.y<=g.minY+(g.topStep||8)?{x:u.landing.x+10,y:u.landing.y}:null):false;
    return dx<0&&p.x>u.maxX&&p.x-6<=u.maxX+1.5&&p.y>=u.minY&&p.y<=u.minY+(u.access||22)?this.switchFloor(0,{x:cx,y:g.minY+(g.topStep||8)+6},this.stairsAutoDown||routed?{x:cx,y:g.maxY+8}:null):false;}
  /** Laufbefehl bis zum Klickpunkt. Der Wunschort bleibt in routeGoal stehen, damit ein hängengebliebener
   *  Schritt den Weg neu berechnen kann statt den Rest der Strecke wegzuwerfen (P6). */
  navigate(point){if(this.dead||this.paused||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||!tutorialAllowsTravel(this,point))return false;this.casting=null;this.keys.clear();this.routeGoal={x:point.x,y:point.y};this.routeStuck=0;this.routeRetried=false;this.path=this.walkWorld().findPath(this.player,point);this.moveTo=this.path.shift()||null;if(!this.moveTo){this.routeGoal=null;this.toast('Dieser Ort ist nicht erreichbar. Wähle einen freien Weg.');return false;}return true;}
  /** Laufweg zur goldenen Wegmarke – ein Befehl statt vieler kurzer Klicks am Bildschirmrand (P6). */
  navigateDestination(){const goal=this.destination();return goal?this.navigate(goal.point):false;}
  /** Neuberechnung des laufenden Laufbefehls, wenn der Schritt an einer Kante klemmt. */
  repath(){const goal=this.routeGoal;if(!goal)return false;this.path=this.walkWorld().findPath(this.player,goal);this.moveTo=this.path.shift()||null;if(!this.moveTo){this.path=[];this.routeGoal=null;return false;}return true;}
  /** Erster Treffer eines neuen Angreifers oder Wechsel inCombat 0→1 (P1): Ereignis `attacked` für den großen
   *  Hinweis der UI, dazu die Zielwahl auf den Angreifer, solange kein Ziel steht. */
  noteAttacker(e,damage,fresh){
    const set=this.attackers||(this.attackers=new Set());
    if(!fresh&&set.has(e.id))return false;
    set.add(e.id);
    if(!this.target?.hp){this.target=e;this.emit('target');}
    this.emit('attacked',{enemyId:e.id,damage,first:true});
    return true;
  }
  hitPlayer(e,n,avoidable=true){dismount(this);if(robbiTaunt(this,e,n))return;beginMeterCombat(this,e);if(this.adminGod)return;/* Admin-Konsole: god */const p=this.player,fresh=p.inCombat<=0;if(p.invulnerable>0&&avoidable){this.stats.dodges++;emitCombatFx(this,'dodge',p,{from:{x:e.x,y:e.y}});fireProcs(this,'dodge',combatStats(this));if(!this.sct({area:'in',kind:'avoid',text:'AUSGEWICHEN',skill:'dash'}))this.float(p.x,p.y-25,'AUSGEWICHEN','#b8e0d3');return;}
    if(p.parry>0&&avoidable){p.parryCharges=Math.max(0,(p.parryCharges||1)-1);if(!p.parryCharges)p.parry=0;fireProcs(this,'parry',combatStats(this));onParry(this,e,combatStats(this));p.energy=Math.min(100,p.energy+20);this.stats.parries++;this.damage(e,this.skills.find(s=>s.id==='parry').reflect*(1+(combatStats(this).reflect||0))*(this.classState.m?.hausverbot>0?(SPEC_MECHANICS[this.rpg.talents.spec]?.hausverbot?.reflect||2):1),'Parade');{const back=restoreMeterHealth(this,this.member.passives?.parryHeal||0,'parryHeal');if(back>0)this.sct({area:'in',kind:'heal',value:back,text:'Parade',skill:'parry'});}if(!this.sct({area:'in',kind:'avoid',text:'PARIERT',skill:'parry'}))this.float(p.x,p.y-25,'PARIERT','#f2da92');emitCombatFx(this,'parry',p,{from:{x:e.x,y:e.y}});this.log('Perfekte Parade · +20 Randale.');return;}
    const guardBefore=(this.classState.guard||0)+(this.buffs.remaining>0?this.buffs.shield||0:0),hpBefore=p.hp,cs=combatStats(this);n=Math.round(n*(e.damage||1)*(1-cs.armor)*(p.hp/p.maxHp<.35?1-(cs.lastStand||0)-(cs.procs.includes('stout')?.08:0):1));if(this.buffs.remaining>0){n=Math.round(n*(1-(this.buffs.reduction||0)));const absorbed=Math.min(n,this.buffs.shield||0);this.buffs.shield=Math.max(0,(this.buffs.shield||0)-absorbed);n-=absorbed;}if(this.partyBuff?.remaining>0){n=Math.round(n*(1-(this.partyBuff.reduction||0)));const soaked=Math.min(n,this.partyBuff.shield||0);this.partyBuff.shield-=soaked;n-=soaked;}n=Math.round(modifyHit(this,n,cs)*(this.baseEffects().damageTaken??1));onHitTakenMech(this,n,cs);p.hp=Math.max(0,p.hp-n);const absorbedFx=guardBefore-(this.classState.guard||0)-(this.buffs.remaining>0?this.buffs.shield||0:0);if(absorbedFx>0)emitCombatFx(this,'guard',p,{amount:absorbedFx,absorbed:true,from:{x:e.x,y:e.y}});if(p.hp<hpBefore)emitCombatFx(this,'hurt',p,{amount:hpBefore-p.hp,from:{x:e.x,y:e.y}});if(n>0)p.hurt=.16;p.inCombat=7;if(p.hp>0&&p.hp/p.maxHp<.35)fireProcs(this,'lowHealth',cs);if(e.arena)(this.arenaStats||(this.arenaStats=freshArenaStats())).taken+=n;this.noteAttacker(e,n,fresh);if(!this.sct({area:'in',kind:'damage',value:n,text:e.name,iconKey:'claw'}))this.float(p.x,p.y-18,'−'+n,'#f09a81');this.emit('shake',{strength:1.7});this.emit('sound',{id:'hit'});if(p.hp===0){this.dead=true;finishMeterCombat(this);stopAuto(this,false);this.casting=null;this.keys.clear();this.moveTo=null;this.path=[];this.routeGoal=null;this.memoryEvent({kind:'firstDeath'});this.emit('death');}
  }
  startCast(e){if(e.dungeon&&e.bossId)dungeonBossCast(this,e);const p=this.player,set=CAST_SETS[e.castSet]||DUNGEON_CASTS[e.castSet]||CAST_SETS[e.type==='boss'?'horst':e.type]||CAST_SETS.wolf,type=set.cycle[e.cycle%set.cycle.length];
    e.cycle++;if(e.type==='boss'&&e.cycle===1&&BOSS_LINES[e.bossId])this.bark(e,BOSS_LINES[e.bossId].engage,'boss');
    const phases=BOSSES[e.bossId]?.phases||[];for(const ph of phases)if(ph.at<1&&e.hp/e.maxHp<=ph.at&&!(e.saidPhases||=new Set()).has(ph.at)){e.saidPhases.add(ph.at);this.bark(e,ph.line,'phase');}
    // Menschliche Feldgegner rufen beim ersten Spezialangriff eines Kampfes; die Zeile wechselt je Auftritt.
    const barks=ENEMY_BARKS[e.archetype];if(barks?.length&&e.cycle===1)this.bark(e,barks[((e.id|0)+(e.spawnCount|0))%barks.length],'enemy');
    const d={...set.casts[type]};if(!available(this,'parry'))d.name=d.name.replace('Parade','Abstand halten');if(!available(this,'interrupt'))d.name=d.name.replace('Q unterbricht','Sichtlinie verlassen');e.cast={...d,type,remaining:d.total,x:d.ground?p.x:e.x,y:d.ground?p.y:e.y,angle:Math.atan2(p.y-e.y,p.x-e.x)};
  }
  resetEnemy(e){e.x=e.home.x;e.y=e.home.y;e.ai='roaming';e.roamGoal=null;e.returnPath=[];e.chasePath=[];e.slow=1;e.cycle=0;e.hp=e.maxHp;e.aggro=false;e.cast=null;e.mark=0;e.vulnerable=0;e.stun=0;e.attackTimer=COMBAT_RULES.firstSpecial;e.autoTimer=0;e.spawnGrace=2;}
  respawn(){dismount(this);this.floor=0;if(inKiosk(this))leaveKiosk(this,true);finishMeterCombat(this);const p=this.player;this.attackers?.clear();Object.assign(p,this.world.spawn,{hp:p.maxHp,energy:100,inCombat:0,parry:0,attack:0,hurt:0,dash:0,castPose:0,invulnerable:2,vx:0,vy:0,moving:false});this.dead=false;this.resetClassState();this.target=null;this.enemies.forEach(e=>{if(e.aggro)this.resetEnemy(e);});resetCompanions(this);if(inDungeon(this))dungeonRespawn(this);
    const share=this.baseEffects().respawnHp||0;if(share>0)addGuard(this,p.maxHp*share,combatStats(this));
    this.toast(SYSTEM_LINES.respawn);}
  tick(dt){
    if(this.professionCommit)return;tickProfession(this,dt);if(this.professionCommit)return;if(this.paused||this.dead)return;tickClassBuffs(this,Math.min(dt,.05));if(inKiosk(this)){tickKiosk(this,Math.min(dt,.05));return;}dt=Math.min(dt,.05);this.time+=dt;
    if(this.tutorial?.completed&&!this.tutorialReported){this.tutorialReported=true;this.memoryEvent({kind:'tutorialDone'});}tickActivity(this);const p=this.player;tickClass(this,dt,combatStats(this));if(this.partyBuff?.remaining>0){const b=this.partyBuff;b.remaining=Math.max(0,b.remaining-dt);if(b.hot){b.tick-=dt;if(b.tick<=0){b.tick=1;healPlayer(this,b.hot,combatStats(this),false,'hot');}}}tickArena(this,dt);tickProcs(this);if(this.momentum.until<=this.time)this.momentum.stacks=0;for(const z of this.zones){z.remaining-=dt;if(z.remaining<=0){const victims=this.enemies.filter(e=>e.hp>0&&e.ai!=='returning'&&!e.spawnGrace&&distance(e,z)<z.radius&&this.world.lineClear(z,e)).sort((a,b)=>distance(a,z)-distance(b,z)).slice(0,5);for(const e of victims)this.damage(e,z.damage*(1+(combatStats(this).aoe||0)),'Böller');if(this.rpg.talents.spec==='kevin-fuse'||combatStats(this).burnGround)this.fields.push({...z,kind:'burn',remaining:combatStats(this).burnGround?6:2,tick:1,power:0});emitCombatFx(this,'burst',z,{skillId:'ground',radius:z.radius});}}this.zones=this.zones.filter(z=>z.remaining>0);if(inDungeon(this))tickDungeon(this,dt);else{this.life.tick(dt,p);this.villagerBarks();if(!tutorialActive(this)){this.ecology.tick(dt);this.hotspotDirector.tick(dt);}}if(this.buffs.remaining>0)this.buffs.remaining=Math.max(0,this.buffs.remaining-dt);
    if(this.target&&(!this.target.hp||distance(this.target,p)>520&&!this.target.aggro))this.target=null;
    for(const key in this.cooldowns)this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);this.gcd=Math.max(0,this.gcd-dt);
    for(const key of ['parry','invulnerable','attack','inCombat','dash','hurt','castPose'])p[key]=Math.max(0,(p[key]||0)-dt);
    if(p.inCombat<=0&&this.attackers?.size)this.attackers.clear();
    const tickStats=combatStats(this);p.energy=Math.min(100,p.energy+dt*((p.inCombat>0?BALANCE.momentum.combatEnergyRegen:BALANCE.player.energyRegen)+(tickStats.energyRegen||0)));
    // The combat timeout outlasts the kill bonus; rest can start once no opponent is fighting.
    const resting=this.time<this.momentum.restUntil&&!this.enemies.some(e=>e.hp>0&&e.aggro&&e.ai!=='returning');
    if(p.inCombat===0||resting)p.hp=Math.min(p.maxHp,p.hp+dt*(resting?BALANCE.momentum.restRegen:BALANCE.player.outOfCombatRegen)*(tickStats.procs.includes('hops')?PROCS.hops.regen:1)*(1+(this.baseEffects().restRegen||0)));
    let dx=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),dy=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);
    if(this.touchMove){dx=this.touchMove.x;dy=this.touchMove.y;}if(dx||dy){this.moveTo=null;this.path=[];this.routeGoal=null;}else if(this.moveTo){dx=this.moveTo.x-p.x;dy=this.moveTo.y-p.y;if(Math.hypot(dx,dy)<5){this.moveTo=this.path.shift()||null;if(!this.moveTo)this.routeGoal=null;dx=dy=0;}}
    const routed=!!this.moveTo;tickMount(this,dt);stepPlayer(this,dx,dy,dt);this.walkStairs(dx,dy,routed,dt);tickTutorial(this,dt);tickCasting(this,dt);tickAuto(this,dt);tickCompanions(this,dt);
    for(const e of this.enemies){
      if((tutorialActive(this)&&!e.arena)||e.tutorial)continue;
      e.attack=Math.max(0,e.attack-dt);e.hurt=Math.max(0,(e.hurt||0)-dt);e.moving=false;e.spawnGrace=Math.max(0,e.spawnGrace-dt);
      if(e.hp<=0){e.dead=Math.max(0,e.respawnAt-this.time);tryRespawn(this,e);continue;}
      if(e.mark>0){e.mark-=dt;if(e.mark<=0)onMarkExpire(this,e);e.dotTimer-=dt;if(e.dotTimer<=0){this.damage(e,e.dotDamage||12,'Markierung');e.dotTimer=1;}if(e.hp<=0)continue;}
      e.vulnerable=Math.max(0,e.vulnerable-dt);e.stun=Math.max(0,e.stun-dt);
      if(e.remoteTarget){if(this.time>e.remoteTarget.until){e.remoteTarget=null;if(!e.aggro||e.ai!=='combat')beginReturn(this,e);}else{followRemote(this,e,dt);continue;}}
      // Begleiter (E-45): hält ein Begleiter die höchste Bedrohung, kämpft der Gegner gegen ihn statt gegen den Spieler.
      if(e.aggro&&e.ai==='combat'&&!e.dummy){const companion=companionFocus(this,e);if(companion){tickEnemyOnCompanion(this,e,companion,dt);if(this.dead)break;continue;}}
      const d=distance(e,p);
      if(!e.aggro&&e.ai!=='returning'&&e.behavior==='aggressive'&&e.spawnGrace<=0&&!e.dummy){const buddy=this.enemies.some(o=>o!==e&&o.aggro&&o.hp>0&&!o.dummy&&distance(o,e)<BALANCE.procs.chainJoinRange);if(buddy&&e.joinAt==null)e.joinAt=this.time+BALANCE.procs.chainJoinDelay;else if(e.joinAt!=null&&this.time>=e.joinAt){e.joinAt=null;if(!this.enemies.some(o=>o!==e&&o.aggro&&o.hp>0&&!o.dummy&&distance(o,e)<BALANCE.procs.chainJoinRange*3))continue;e.aggro=true;e.ai='combat';e.attackTimer=COMBAT_RULES.firstSpecial;this.float(e.x,e.y-30,'KUMPEL KOMMT','#f0b070');}}
      if(!e.aggro&&e.ai!=='returning'&&e.behavior==='aggressive'&&e.spawnGrace<=0&&d<e.aggroRange&&!inSanctuary(this.world,p)&&this.world.lineClear(e,p)){e.aggro=true;e.ai='combat';e.attackTimer=COMBAT_RULES.firstSpecial;if(!this.target||this.target.hp<=0)this.target=e;}
      if(!e.aggro){if(!e.dummy)idleEnemy(this,e,dt);continue;}
      if(e.dummy){e.facing=e.x<p.x?1:-1;continue;}
      if(!e.arena&&(distance(e,e.home)>e.leash||d>620||inSanctuary(this.world,p))){beginReturn(this,e);continue;}
      p.inCombat=7;e.facing=e.x<p.x?1:-1;e.direction=walkFacing(p.x-e.x,p.y-e.y,e.direction||'se');
      if(e.stun>0){e.autoTimer=Math.max(0,(e.autoTimer||0)-dt);continue;}
      if(e.cast){e.cast.remaining-=dt;if(e.cast.remaining<=0){const c=e.cast;e.cast=null;e.attackTimer=COMBAT_RULES.specialInterval;let hit=false;if(e.dungeon&&resolveDungeonCast(this,e,c,'player')){e.attack=.3;if(this.dead)break;continue;}if(c.ground){hit=Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;emitCombatFx(this,'impact',c,{radius:c.radius,hostile:true});if(!hit){this.stats.dodges++;if(!this.sct({area:'in',kind:'avoid',text:'VERMIEDEN',skill:'dash'}))this.float(p.x,p.y-24,'VERMIEDEN','#aed4bd');}}else if(c.interruptible)hit=d<230&&this.world.lineClear(e,p);else hit=d<c.radius;
          if(hit)this.hitPlayer(e,c.damage);e.attack=.3;if(this.dead)break;
        }continue;}
      const reach=e.autoAttack.range*.8;
      if(d>reach){const speed=e.speed*(e.mark>0?e.slow:1)*(e.controlSlow>0?.5:1);e.pathTimer-=dt;if(walkClear(this.world,e,p,7)){const step=Math.min(speed*dt,d-reach+1);this.move(e,(p.x-e.x)/d*step,(p.y-e.y)/d*step);e.moving=true;e.chasePath=[];}else{if(e.pathTimer<=0){e.pathTimer=1.1;e.chasePath=this.world.findPath(e,p);}moveAlong(this,e,e.chasePath,speed,dt);}}

      e.attackTimer=Math.max(0,e.attackTimer-dt);enemyAuto(this,e,dt);if(this.dead)break;if(distance(e,p)<=reach&&e.attackTimer<=0&&this.world.lineClear(e,p))this.startCast(e);
    }
    for(const e of this.enemies){const target=e.moving?1:0;e.gaitWeight=(e.gaitWeight||0)+(target-(e.gaitWeight||0))*(1-Math.exp(-16*dt));if(e.gaitWeight<.001)e.gaitWeight=0;}
    tickCombatMeter(this);this.fx=this.fx.filter(f=>(f.life-=dt)>0);this.texts=this.texts.filter(f=>(f.life-=dt)>0);
    for(const l of this.world.landmarks){if(!tutorialActive(this)&&distance(p,l)<95&&!this.discovered.has(l.id)){this.discovered.add(l.id);this.emit('discovery',{name:l.tags.name});this.gainXp(BALANCE.xp.discovery);this.emit('save');}}
  }
  save(){return {version:1,progressionVersion:2,position:savedPosition(this),...(inKiosk(this)?{instance:savedKiosk(this)}:{}),...(this.tutorial?{tutorial:savedTutorial(this)}:{}),rpg:savedRpg(this),trainingXp:this.trainingXp,seenSkills:[...this.seenSkills],classId:this.member.id,worldKey:this.world.id,worldSeed:this.world.seed,level:this.player.level,xp:this.player.xp,quest:this.quest,settings:{...this.settings},memories:{seen:[...this.memories.seen]},buildings:{...this.buildings},mentorTalks:{...this.mentorTalks},sideQuests:this.sideQuests,trackedQuest:this.trackedQuest,hotspots:this.hotspots,mounts:savedMounts(this),professions:savedProfessions(this),companions:savedCompanions(this),dungeons:this.dungeons,classBuffs:savedClassBuffs(this),relic:this.relic,discovered:[...this.discovered]};}
}
