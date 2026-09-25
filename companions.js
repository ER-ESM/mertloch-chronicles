// Begleiter (E-45): ein Baustein für alles, was an der Seite des Spielers selbstständig kämpft – Söldner heute,
// dauerhafte Klassen-Pets später. Die Begleiter leben im Client des Besitzers (wie der Kampf, E-35): sie reagieren
// ohne Netzverzögerung, funktionieren in Instanzen und offline. Ihr Schaden zieht Gegnern Leben ab und wird damit
// von net-world.js automatisch als Schaden des Besitzers gemeldet – der Server braucht dafür nichts Neues.
//
// Drei Teile:  1. Bedrohung je Gegner (e.threat) und Zielwahl  →  ein Gegner kann statt des Spielers einen Begleiter angreifen
//              2. Begleiter-KI: folgen, Ziel wählen, Rollenverhalten, auf Ansagen reagieren (Fläche verlassen, unterbrechen)
//              3. Vertrag: anheuern, entlassen, Befehle, Speichern
// Alle Zahlen, Namen und Texte stehen in content/companions.js. Fähigkeiten werden allein über `kind` ausgeführt.
import {COMPANIONS,COMPANION_RULES as R,COMPANION_ROLES,COMPANION_ABILITIES,COMPANION_TEXT as T,companionById,companionCost,companionStats,CAST_SETS,COMBAT_RULES} from './content/index.js';
import {distance} from './world.js';
import {walkClear,moveAlong,beginReturn} from './encounters.js';
import {resolveDungeonCast,dungeonBossCast,coneHits,inDungeon,dungeonRun,reviveHero,dungeonCastSpot} from './dungeon.js';
import {DUNGEON_CASTS,FIGUREN,FIGUR_HANDSTUECKE} from './content/index.js';
import {emitCombatFx} from './combat-fx.js';
import {recordMeterDamage,recordMeterHealing} from './combat-meter.js';
import {tutorialActive} from './tutorial.js';
import {walkFacing} from './maifeld-locomotion.js';
import {classBuffValue,savedClassBuffs,restoreClassBuffs} from './class-buffs.js';
import {MARK_IDS} from './target-marks.js';

const PLAYER='player';
const alive=c=>c.state!=='down'&&c.hp>0;
/** Dungeon-Arena (E-71): Solange ein Boss hinter geschlossener Tür kämpft, bleiben Söldner im Kampf – auch wenn der Held als Geist
 *  liegt oder über die Treppenkante gefallen ist. Kein Heranspringen zum Helden, kein Abbruch wegen Abstand. */
const holdFight=(g,c)=>c.inCombat>0&&!!dungeonRun(g)?.arena;
const fighting=e=>e.hp>0&&e.aggro&&e.ai!=='returning'&&!e.dummy&&!e.tutorial;
const ratio=x=>x.hp/x.maxHp;
const abilitySource=id=>({id,name:COMPANION_ABILITIES[id].name});
/** Aussehen des Söldners als Anziehpuppe (content/figuren.js): Körper über die Figur (paperdollId npc:<id>, Archetyp darf vom look
 *  abweichen – look bleibt für Klasseneffekte und Kampftextfarbe), Tönung und sichtbare Kleidung für den Heldenweg im Renderer. */
function mercLook(def){const f=FIGUREN[def.id];if(!f?.arch)return {};
 return {paperdollId:'npc:'+def.id,tint:f.tint,visualEquipment:f.gear.map(id=>{const h=FIGUR_HANDSTUECKE[id];return {slot:h?.slot||'figur',id,asset:h?.asset||id,rarity:'common',hands:h?.hands??null};})};}
const companionFx=(g,c,kind,at,data={})=>emitCombatFx(g,kind,at,{...data,companion:c.id,classId:c.def.look});
const companionText=(g,c,data)=>g.sct({actor:c.id,member:c.def.look,text:c.name,...data});
const face=(c,target)=>{c.facing=target.x<c.x?-1:1;c.direction=walkFacing(target.x-c.x,target.y-c.y,c.direction||'se');};
const inEllipse=(p,c,extra=0)=>Math.hypot((p.x-c.x)/(c.radius+extra),(p.y-c.y)/((c.radius+extra)*.75))<1;

/** Heilung durch den Besitzer: seine Statistik und Bedrohung, Text und Effekt am geheilten Söldner. */
export function healCompanionByPlayer(g,c,amount,source='heal'){
 if(!c||!alive(c)||g.dead||!(amount>0))return 0;
 amount=Math.round(amount*(1+classBuffValue(c,'healTaken')));const actual=Math.max(0,Math.min(amount,c.maxHp-c.hp));c.hp+=actual;
 if(c.inCombat>0)g.player.inCombat=Math.max(g.player.inCombat,7);
 recordMeterHealing(g,amount,actual,source);
 if(actual>0){emitCombatFx(g,'heal',c,{amount:actual,direct:source==='heal',companion:c.id});
  if(!g.sct({actor:c.id,area:'in',kind:'heal',value:actual,text:g.member.name,skill:source==='heal'?'heal':null,iconKey:'food'}))g.float(c.x,c.y-20,'+'+actual,'#b7df92');
  const foes=g.enemies.filter(fighting);for(const e of foes)addThreat(e,PLAYER,actual*R.healThreat/foes.length);
 }
 return actual;
}
export function buffCompanionByPlayer(g,c,b){if(!c||!alive(c))return;c.aidBuff={...b,tick:1};emitCombatFx(g,'guard',c,{companion:c.id,amount:b.shield||0});}

// ── 1. Bedrohung und Zielwahl ─────────────────────────────────────────────────────────────────────────────────
/** Bedrohung gutschreiben. who: 'player' oder Begleiter-ID. */
export function addThreat(e,who,n){if(!e||!(n>0))return;const t=e.threat||(e.threat={});t[who]=(t[who]||0)+n;}
export function clearThreat(e,who){if(!e?.threat)return;if(who===undefined){e.threat=null;e.focus=null;return;}delete e.threat[who];if(e.focus===who)e.focus=null;}

/** Wen greift dieser Gegner an? → Begleiter oder null (= Spieler). Zielwechsel erst bei 10 % mehr Bedrohung. */
export function companionFocus(g,e){
 if(!g.companions?.length||!e.threat)return null;
 // Dungeon (E-71): Der gefallene Held ist Geist und kein Ziel mehr – die Gegner wenden sich den stehenden Söldnern zu.
 const ghost=g.dead&&inDungeon(g);
 const value=who=>who===PLAYER?(ghost?-1:e.threat[PLAYER]||0):(g.companions.find(c=>c.id===who&&alive(c))?e.threat[who]||0:-1);
 let top=PLAYER,best=value(PLAYER);for(const c of g.companions){const v=value(c.id);if(v>best){best=v;top=c.id;}}
 const current=e.focus&&value(e.focus)>=0?e.focus:null;
 if(!current||(top!==current&&best>value(current)*R.threatSwitch))e.focus=top;
 return e.focus===PLAYER?null:g.companions.find(c=>c.id===e.focus)||null;
}

export function hitCompanion(g,e,c,n){
 if(!alive(c))return;n=Math.max(1,Math.round(n*(e.damage||1)*(c.guard>0?1-c.guardReduction:1)*(1-classBuffValue(c,'armor'))));
 const b=c.aidBuff;if(b?.remaining>0){n=Math.round(n*(1-(b.reduction||0)));const absorbed=Math.min(n,b.shield||0);b.shield=Math.max(0,(b.shield||0)-absorbed);n-=absorbed;if(absorbed>0)companionFx(g,c,'guard',c,{amount:absorbed,absorbed:true});}
 c.hp=Math.max(0,c.hp-n);if(n>0)c.hurt=.16;c.inCombat=6;
 companionFx(g,c,'hurt',c,{amount:n,from:{x:e.x,y:e.y}});if(!companionText(g,c,{area:'in',kind:'damage',value:n}))g.float(c.x,c.y-18,'−'+n,'#e9b48c');
 if(c.hp<=0)down(g,c);
}
function down(g,c){
 c.channel=null;c.state='down';c.aidBuff=null;c.aidHot=null;c.hp=0;c.downUntil=g.time+R.downSeconds;c.target=null;c.path=[];c.moving=false;
 for(const e of g.enemies)clearThreat(e,c.id);
 g.toast(T.down(c.name));if(c.def.lines?.down)g.bark?.(c,c.def.lines.down,'companion');g.emit('companion',{type:'down',id:c.id});
}

/** Gegner-KI gegen einen Begleiter – Gegenstück zum Spieler-Zweig in Game.tick(). true = Gegner ist für diesen Takt versorgt. */
export function tickEnemyOnCompanion(g,e,c,dt){
 const p=g.player,d=distance(e,c);
 if(!e.arena&&(distance(e,e.home)>e.leash||!e.dungeon&&distance(e,p)>760)){clearThreat(e);beginReturn(g,e);return true;}/* Dungeon (E-71): Gegner halten an ihrer Leine, nicht am Abstand zum Helden – fällt er über die Kante oder liegt er, kämpfen die Söldner weiter */
 p.inCombat=7;c.inCombat=6;e.facing=e.x<c.x?1:-1;
 if(e.stun>0){e.autoTimer=Math.max(0,(e.autoTimer||0)-dt);return true;}
 if(e.cast){
  e.cast.remaining-=dt;
  if(e.cast.remaining<=0){
   const k=e.cast;e.cast=null;e.attackTimer=k.next??COMBAT_RULES.specialInterval;e.attack=.3;
   if(e.dungeon&&resolveDungeonCast(g,e,k,c))return true;
   if(k.ground){emitCombatFx(g,'impact',k,{radius:k.radius,hostile:true});for(const o of g.companions)if(alive(o)&&inEllipse(o,k))hitCompanion(g,e,o,k.damage);if(inEllipse(p,k))g.hitPlayer(e,k.damage);}
   else if(k.interruptible){if(d<R.castSight&&g.world.lineClear(e,c))hitCompanion(g,e,c,k.damage);}
   else if(d<k.radius)hitCompanion(g,e,c,k.damage);
  }
  return true;
 }
 const reach=e.autoAttack.range*.8;
 if(d>reach){
  const speed=e.speed*(e.mark>0?e.slow:1)*(e.controlSlow>0?.5:1);e.pathTimer=(e.pathTimer||0)-dt;
  if(walkClear(g.world,e,c,7)){const step=Math.min(speed*dt,d-reach+1);g.move(e,(c.x-e.x)/d*step,(c.y-e.y)/d*step);e.moving=true;e.chasePath=[];}
  else{if(e.pathTimer<=0){e.pathTimer=1.1;e.chasePath=g.world.findPath(e,c);}moveAlong(g,e,e.chasePath,speed,dt);}
 }
 e.autoTimer=Math.max(0,(e.autoTimer||0)-dt);
 const a=e.autoAttack;
 if(e.autoTimer<=0&&!(e.spawnGrace>0)&&distance(e,c)<=a.range&&g.world.lineClear(e,c)){e.autoTimer=a.speed;e.attack=.25;hitCompanion(g,e,c,a.min+g.random()*(a.max-a.min));emitCombatFx(g,'attack',c,{from:{x:e.x,y:e.y},ranged:a.ranged,hostile:true,duration:.3});}
 e.attackTimer=Math.max(0,e.attackTimer-dt);
 if(alive(c)&&distance(e,c)<=reach&&e.attackTimer<=0&&g.world.lineClear(e,c)){
  if(e.dungeon&&e.bossId)dungeonBossCast(g,e);const set=CAST_SETS[e.castSet]||DUNGEON_CASTS[e.castSet]||CAST_SETS[e.type==='boss'?'horst':e.type]||CAST_SETS.wolf,type=set.cycle[e.cycle%set.cycle.length],k={...set.casts[type]};
  e.cycle++;e.cast={...k,type,remaining:k.total,x:k.ground?c.x:e.x,y:k.ground?c.y:e.y,focus:c.id,angle:Math.atan2(c.y-e.y,c.x-e.x)};if(e.dungeon)dungeonCastSpot(g,e,e.cast,c);
 }
 return true;
}

// ── 2. Begleiter-KI ───────────────────────────────────────────────────────────────────────────────────────────
/** Werte nach Stufe; im Dungeon mit dem Instanzfaktor (E-71, COMPANION_RULES.instanceFactor) – die offene Welt bleibt unverändert. */
function refreshStats(g,c){const level=g.player.level,pct=classBuffValue(c,'health'),inst=inDungeon(g);if(c.level===level&&c.maxHp&&c.hpPct===pct&&c.inst===inst)return;const before=c.maxHp?ratio(c):1,s=companionStats(c.def.role,level),f=inst?R.instanceFactor:{};c.level=level;c.hpPct=pct;c.inst=inst;c.maxHp=Math.round(s.maxHp*(f.health||1)*(1+pct));c.damage=s.damage*(f.damage||1);c.heal=s.damage*(f.heal||1);c.hp=Math.round(c.maxHp*before);}
function slot(g,c){const i=Math.max(0,g.companions.indexOf(c))%R.formation.length,[fx,fy]=R.formation[i],side=g.player.facing<0?-1:1;return {x:g.player.x+fx*side,y:g.player.y+fy};}
function place(g,c,at){let p=at;try{p=g.world.findClear(at.x,at.y,9);}catch{}c.x=p.x;c.y=p.y;c.path=[];}

function walkTo(g,c,goal,speed,dt,stopAt=6){
 speed*=1+classBuffValue(c,'speed');const d=distance(c,goal);if(d<=stopAt){c.moving=false;return true;}
 if(walkClear(g.world,c,goal,8)){const step=Math.min(speed*dt,d-stopAt+1);g.move(c,(goal.x-c.x)/d*step,(goal.y-c.y)/d*step);c.path=[];}
 else{c.pathTimer=(c.pathTimer||0)-dt;if(c.pathTimer<=0||!c.path?.length){c.pathTimer=.9;try{c.path=g.world.findPath(c,goal);}catch{c.path=[];}}moveAlong(g,c,c.path,speed,dt);}
 c.moving=true;if(Math.abs(goal.x-c.x)>2)c.facing=goal.x<c.x?-1:1;return false;
}

/** Ziel nach Haltung und Rolle. Schutz-Begleiter sammeln zuerst Gegner ein, die jemand anderen angreifen. */
function chooseTarget(g,c){
 if(c.stance==='passive')return null;
 const p=g.player,near=e=>distance(e,c.order==='stay'||holdFight(g,c)?c:p)<=R.assistRange;
 if(c.order==='attack'&&g.target?.hp>0&&g.target.ai!=='returning'&&!g.target.tutorial)return g.target;
 const list=g.enemies.filter(e=>fighting(e)&&near(e));if(!list.length)return null;
 const role=COMPANION_ROLES[c.def.role];
 if(role.picksUpLoose){const loose=list.filter(e=>(e.focus||PLAYER)!==c.id).sort((a,b)=>distance(a,c)-distance(b,c))[0];if(loose)return loose;}
 // Zielmarkierungen der Gruppe (target-marks.js): Totenkopf vor Kreuz vor Stern vor Kreis, dann das Ziel des Spielers.
 const marked=list.filter(e=>e.groupMark).sort((a,b)=>MARK_IDS.indexOf(a.groupMark)-MARK_IDS.indexOf(b.groupMark))[0];if(marked)return marked;
 if(g.target&&list.includes(g.target))return g.target;
 return list.sort((a,b)=>distance(a,c)-distance(b,c))[0];
}

function damageEnemy(g,c,e,n,id){
 if(!e||e.hp<=0||e.ai==='returning'||e.tutorial)return 0;
 const crit=g.random()<R.critChance+classBuffValue(c,'crit'),amount=Math.max(1,Math.round(n*(R.spread[0]+g.random()*(R.spread[1]-R.spread[0]))*(crit?R.critFactor:1)*(e.vulnerable>0?R.vulnerableFactor:1))),dealt=Math.min(e.hp,amount);
 e.aggro=true;e.ai='combat';g.player.inCombat=7;c.inCombat=6;e.hp=Math.max(0,e.hp-amount);e.hurt=.15;
 addThreat(e,c.id,dealt*COMPANION_ROLES[c.def.role].threat);
 recordMeterDamage(g,e,amount,dealt,abilitySource(id),crit,c);
 companionFx(g,c,'hit',e,{amount:dealt,critical:crit,label:COMPANION_ABILITIES[id].name});
 // Keep the existing RNG sequence independent of the combat-text setting.
 const textX=e.x+(g.random()-.5)*14;
 if(!companionText(g,c,{area:'out',kind:'damage',value:amount,crit,ability:id,enemyId:e.id}))g.float(textX,e.y-27,String(amount)+(crit?'!':''),'#c9dcf0');
 if(e.hp<=0){clearThreat(e);g.kill(e);}
 return dealt;
}
/** Verletztester Mitspieler (Gruppe, lebt, unter der Heilschwelle, in Reichweite des Söldners und des Hilfswegs) oder null. */
function partyPatient(g,c,a,range){if(!g.netParty?.aidHeal)return null;return (g.others||[]).filter(o=>o.party&&o.state!=='dead'&&(o.hp??100)<a.below*100&&(o.hp??100)>0&&distance(o,c)<=range&&g.netParty.canAid?.(o.name)).sort((x,y)=>x.hp-y.hp)[0]||null;}
function healMate(g,c,o,amount,id){amount=Math.round(amount);if(!g.netParty.aidHeal(o.name,amount,(COMPANION_ABILITIES[id]?.name||'')+' ('+c.name+')'))return 0;face(c,o);recordMeterHealing(g,amount,amount,abilitySource(id),c);companionFx(g,c,'heal',o,{amount,direct:true,from:{x:c.x,y:c.y}});g.float(o.x,o.y-20,'+'+amount,'#b7df92');return amount;}
function heal(g,c,target,amount,id){
 amount=Math.round(amount*(1+classBuffValue(target===g.player?g:target,'healTaken')));const actual=Math.min(amount,target.maxHp-target.hp);if(actual<=0)return 0;target.hp+=actual;
 face(c,target);
 recordMeterHealing(g,amount,actual,abilitySource(id),c);
 companionFx(g,c,'heal',target,{amount:actual,direct:true,from:{x:c.x,y:c.y}});
 if(!companionText(g,c,{area:'out',kind:'heal',value:actual,ability:id,targetId:target===g.player?'player':target.id}))g.float(target.x,target.y-20,'+'+actual,'#b7df92');
 const foes=g.enemies.filter(fighting);for(const e of foes)addThreat(e,c.id,actual*R.healThreat/foes.length);
 return actual;
}

/** Eine Fähigkeit ausführen, wenn ihre Bedingung passt. true = ausgeführt (löst die gemeinsame Pause aus). */
function use(g,c,id,target){
 const a=COMPANION_ABILITIES[id];if(!a||(c.cooldowns[id]||0)>0)return false;
 const range=a.range||COMPANION_ROLES[c.def.role].range,done=()=>{c.cooldowns[id]=a.cooldown;c.gcd=R.pause;c.attack=.3;c.castPose=a.kind==='heal'?.3:0;c.usingRanged=!!a.ranged;return true;};
 if(a.kind==='guard'){if(ratio(c)>a.below||c.inCombat<=0)return false;c.guard=a.duration;c.guardReduction=a.reduction;companionFx(g,c,'guard',c,{amount:0});return done();}
 if(a.kind==='heal'){const allies=[...(g.dead?[]:[g.player]),...g.companions.filter(alive)].filter(x=>ratio(x)<a.below&&distance(x,c)<=range).sort((x,y)=>ratio(x)-ratio(y));
  // Gruppe (2026-09-24): Heil-Söldner kümmern sich auch um Mitspieler in Reichweite; die Heilung reist über den Hilfsweg (net-social aidHeal).
  const mate=partyPatient(g,c,a,range);if(mate&&(!allies.length||mate.hp/100<ratio(allies[0]))){healMate(g,c,mate,(c.heal??c.damage)*a.power,id);return done();}
  if(!allies.length)return false;heal(g,c,allies[0],(c.heal??c.damage)*a.power,id);return done();}
 if(a.kind==='taunt'){const e=g.enemies.filter(e=>fighting(e)&&(e.focus||PLAYER)!==c.id&&distance(e,c)<=range).sort((x,y)=>distance(x,c)-distance(y,c))[0];if(!e)return false;
  const top=Math.max(0,...Object.values(e.threat||{}));e.threat={...(e.threat||{}),[c.id]:top*R.threatSwitch+R.tauntLead};e.focus=c.id;if(!companionText(g,c,{area:'note',kind:'proc',text:T.taunted,ability:id}))g.float(e.x,e.y-38,T.taunted,'#f0c987');return done();}
 if(a.kind==='interrupt'){const e=g.enemies.find(e=>fighting(e)&&e.cast?.interruptible&&distance(e,c)<=range&&(!e.cast.claimed||e.cast.claimed===c.id));if(!e)return false;
  e.cast.claimed=c.id;if(!reacted(g,c,e.cast))return false;e.cast=null;e.attackTimer=COMBAT_RULES.specialInterval;e.stun=Math.max(e.stun||0,R.interruptStun);if(!companionText(g,c,{area:'note',kind:'proc',text:T.interrupted,ability:id}))g.float(e.x,e.y-38,T.interrupted,'#f2da92');companionFx(g,c,'interrupt',e);addThreat(e,c.id,R.interruptThreat);return done();}
 if(!target)return false;
 if(a.kind==='cleave'){const hits=g.enemies.filter(e=>fighting(e)&&distance(e,c)<=a.radius);if(hits.length<(a.minTargets||1))return false;companionFx(g,c,'attack',target,{from:{x:c.x,y:c.y},radius:a.radius});for(const e of hits)damageEnemy(g,c,e,c.damage*a.power,id);return done();}
 if(a.kind==='strike'){if(distance(target,c)>range||!g.world.lineClear(c,target))return false;face(c,target);companionFx(g,c,'attack',target,{from:{x:c.x,y:c.y},ranged:!!a.ranged,duration:.3});damageEnemy(g,c,target,c.damage*a.power*a.cooldown,id);return done();}
 return false;
}
/** Reaktionszeit: eine Ansage zählt erst, wenn der Begleiter sie `reaction` Sekunden gesehen hat. */
function reacted(g,c,cast){const seen=c.seen||(c.seen=new WeakMap());if(!seen.has(cast))seen.set(cast,g.time);return g.time-seen.get(cast)>=R.reaction;}

/** Steht der Begleiter in einer angesagten Fläche? → Fluchtpunkt knapp außerhalb, sonst null. */
/** Kegel (Dungeon-Merkmal cone): Söldner, die nicht selbst das Ziel sind, treten seitlich aus dem Kegel. */
function coneExit(g,c){
 for(const e of g.enemies){const k=e.cast;if(!k?.cone||e.hp<=0||k.focus===c.id||!coneHits(e,k,c,g)||!reacted(g,c,k))continue;
  for(const turn of [1,-1]){const a=(k.angle??0)+turn*(k.cone.angle*Math.PI/360+.5),r=Math.max(30,Math.min(k.cone.range*.8,distance(e,c))),q={x:e.x+Math.cos(a)*r,y:e.y+Math.sin(a)*r};if(!g.world.blocked(q.x,q.y,9)&&walkClear(g.world,c,q,8))return q;}}
 return null;
}
function dangerExit(g,c){
 const cone=coneExit(g,c);if(cone)return cone;
 for(const e of g.enemies){const k=e.cast;if(!k?.ground||e.hp<=0||!inEllipse(c,k,R.avoidMargin*.5)||!reacted(g,c,k))continue;
  const base=Math.atan2(c.y-k.y,c.x-k.x)||0;for(const turn of [0,.6,-.6,1.3,-1.3,2.2,-2.2,Math.PI]){const a=base+turn,q={x:k.x+Math.cos(a)*(k.radius+R.avoidMargin),y:k.y+Math.sin(a)*(k.radius+R.avoidMargin)*.75};if(!g.world.blocked(q.x,q.y,9)&&walkClear(g.world,c,q,8))return q;}}
 return null;
}

/** Aufhelfen (Dungeon Etappe 1, E-71): Liegt der Held als Geist im Dungeon, geht ein Heil-Söldner mit `revive` an den Körper und wirkt
 *  8 s lang. Einmal je Kampf; ein Ausweichschritt oder das eigene Umfallen bricht ab, dann beginnt er von vorn. true = Takt versorgt. */
function tickRevive(g,c,dt){
 if(!g.dead||!inDungeon(g)){c.channel=null;if(c.inCombat<=0)c.reviveUsed=false;return false;}
 const id=c.def.abilities.find(x=>COMPANION_ABILITIES[x]?.kind==='revive');if(!id||c.reviveUsed||g.companions.some(o=>o!==c&&o.channel&&alive(o)))return false;
 const a=COMPANION_ABILITIES[id],p=g.player;
 if(!c.channel){if(distance(c,p)>a.range){walkTo(g,c,p,R.catchUpSpeed,dt,a.range*.6);return true;}c.channel={id,start:g.time,until:g.time+a.cast,total:a.cast};g.toast(T.reviving(c.name));g.emit('companion',{type:'reviving',id:c.id});}
 face(c,p);c.castPose=.3;c.state='combat';c.inCombat=6;c.moving=false;
 if(g.time<c.channel.until)return true;
 c.channel=null;c.reviveUsed=true;reviveHero(g,c,a.share);companionFx(g,c,'heal',p,{amount:Math.round(p.hp),direct:true,from:{x:c.x,y:c.y}});return true;
}
function tickOne(g,c,dt){
 refreshStats(g,c);
 const quick=dt*(1+classBuffValue(c,'haste'));for(const id in c.cooldowns)c.cooldowns[id]=Math.max(0,c.cooldowns[id]-quick);c.gcd=Math.max(0,(c.gcd||0)-quick);
 for(const key of ['guard','hurt','attack','castPose','inCombat'])c[key]=Math.max(0,(c[key]||0)-dt);
 if(c.contract!=null){c.contract-=dt;if(c.contract<=0){dismissCompanion(g,c.id,'expired');return;}}
 c.moving=false;
 if(c.state==='down'){if(g.time>=c.downUntil&&!g.enemies.some(e=>fighting(e)&&distance(e,g.player)<R.assistRange)){c.state='follow';c.hp=Math.round(c.maxHp*R.reviveHealth);place(g,c,slot(g,c));g.toast(T.revived(c.name));if(c.def.lines?.revive)g.bark?.(c,c.def.lines.revive,'companion');g.emit('companion',{type:'revived',id:c.id});}return;}
 for(const [key,source]of [['aidBuff','buff'],['aidHot','hot']]){const b=c[key];if(!b)continue;b.remaining-=dt;if(b.remaining<=0){c[key]=null;continue;}const power=b.hot||b.power;if(power){b.tick-=dt;if(b.tick<=0){b.tick=1;healCompanionByPlayer(g,c,power,source);}}}
 const p=g.player,far=distance(c,p);
 if(far>R.teleport&&!holdFight(g,c)){place(g,c,slot(g,c));c.target=null;return;}
 const exit=dangerExit(g,c);
 if(exit){c.channel=null;walkTo(g,c,exit,R.catchUpSpeed,dt,3);return;}                     // erst raus aus der Fläche, dann alles andere
 if(tickRevive(g,c,dt))return;                                                               // Held liegt im Dungeon: aufhelfen geht vor
 if(c.target&&(!(c.target.hp>0)||c.target.ai==='returning'||(c.order!=='stay'&&far>R.leashToOwner&&!holdFight(g,c)))){if(c.order==='attack')c.order='follow';c.target=null;}
 if(!c.target||c.retarget<=g.time){c.target=chooseTarget(g,c);c.retarget=g.time+.5;}
 const role=COMPANION_ROLES[c.def.role],e=c.target;
 if(c.gcd<=0)for(const id of c.def.abilities){const a=COMPANION_ABILITIES[id];if(a&&a.kind!=='strike'&&a.kind!=='cleave'&&use(g,c,id,e))break;}
 if(e){
  c.state='combat';c.inCombat=6;face(c,e);
  const reach=(role.range||44)*.8,d=distance(c,e);
  if(c.order!=='stay'&&(d>reach||!g.world.lineClear(c,e)))walkTo(g,c,e,R.speed,dt,reach);
  if(c.gcd<=0)for(const id of c.def.abilities){const a=COMPANION_ABILITIES[id];if(a&&(a.kind==='strike'||a.kind==='cleave')&&use(g,c,id,e))break;}
  return;
 }
 c.state=c.order==='stay'?'stay':'follow';
 if(c.inCombat<=0)c.hp=Math.min(c.maxHp,c.hp+c.maxHp*R.outOfCombatRegen*dt);
 if(c.order==='stay')return;
 const goal=slot(g,c);if(distance(c,goal)>(p.moving?10:R.followDistance*.4))walkTo(g,c,goal,far>R.catchUp?R.catchUpSpeed:R.speed,dt,8);
 else c.facing=p.facing||c.facing;
}

/** Je Takt aus Game.tick(): Bedrohung pflegen, Begleiter führen, Ansicht für den Renderer füllen. */
export function tickCompanions(g,dt){
 if(!g.companions?.length)return;
 if(tutorialActive(g))return;
 for(const e of g.enemies){if(e.hp<=0||!e.aggro||e.ai==='returning'){if(e.threat)clearThreat(e);continue;}if(!e.threat)addThreat(e,PLAYER,1);}
 for(const c of [...g.companions]){try{tickOne(g,c,dt);}catch(err){c.target=null;c.path=[];g.emit('companion',{type:'error',id:c.id,message:String(err?.message||err)});}}
 for(const c of g.companions)Object.assign(c.view,{name:c.name,x:c.x,y:c.y,fromX:c.x,fromY:c.y,at:0,lerp:1,facing:c.facing,direction:c.direction,walkDistance:c.walkDistance||0,classId:c.def.look,look:c.def.look,spec:c.def.spec,level:c.level,state:c.state==='down'?'dead':c.state==='combat'?'combat':c.moving?'walk':'idle',hp:Math.round(ratio(c)*100),party:true,moving:c.moving,reviving:c.channel?Math.min(1,(g.time-c.channel.start)/c.channel.total):0,attack:c.attack,hurt:c.hurt,castPose:c.castPose,usingRanged:c.usingRanged,parry:c.guard,companion:c.id,role:c.def.role,down:c.state==='down',tint:c.figure?.tint,visualEquipment:c.figure?.visualEquipment,paperdollId:c.figure?.paperdollId});
}
/** Nach dem Tod des Besitzers: Begleiter stehen geheilt neben ihm, alle Kämpfe sind vergessen. */
export function resetCompanions(g){for(const e of g.enemies)clearThreat(e);for(const c of g.companions||[]){c.state='follow';c.hp=c.maxHp;c.target=null;c.guard=0;c.aidBuff=null;c.aidHot=null;place(g,c,slot(g,c));}}

// ── 3. Vertrag: anheuern, entlassen, Befehle, Speichern ───────────────────────────────────────────────────────
function create(g,def,saved={}){
 const c={id:def.id,def,name:def.name,kind:def.kind,x:g.player.x,y:g.player.y,facing:1,level:0,maxHp:0,hp:0,damage:0,state:'follow',
  stance:T.stances[saved.stance]?saved.stance:COMPANION_ROLES[def.role].stance,order:['follow','stay'].includes(saved.order)?saved.order:'follow',
  contract:def.kind==='merc'?Math.max(1,Number(saved.contract)||R.contractHours*3600):null,cooldowns:{},gcd:0,guard:0,guardReduction:0,inCombat:0,target:null,path:[],retarget:0,view:{},figure:mercLook(def),classBuffs:restoreClassBuffs(saved.classBuffs)};
 refreshStats(g,c);c.hp=Math.round(c.maxHp*Math.max(.1,Math.min(1,Number(saved.hp)||1)));place(g,c,slot({...g,companions:[...(g.companions||[]),c]},c));return c;
}
/** Freie Plätze: vier Begleiter, zusammen mit echten Gruppenmitgliedern (g.partyHumans, setzt die Netzschicht) höchstens fünf Köpfe. */
export const companionSlots=g=>Math.max(0,Math.min(R.maxActive,4-(g.partyHumans||0)-(g.partyCompanions||0))-(g.companions?.length||0));
/** Gruppe über fünf Köpfen (Menschen + alle Söldner, z. B. nach einem Beitritt): welche MEINER Söldner gehen?
 *  Alle Clients rechnen gleich: zuerst die Söldner des alphabetisch letzten Besitzers, je Besitzer der zuletzt angeheuerte. */
export function partyOverflow(me,mine,others){const all=[{name:me,ids:mine},...others].flatMap(o=>o.ids.map((id,i)=>({owner:o.name,id,i})));
 const over=1+others.length+all.length-5;if(over<=0)return [];
 return all.sort((a,b)=>b.owner.localeCompare(a.owner)||b.i-a.i).slice(0,over).filter(x=>x.owner===me).map(x=>x.id);}
/** Liste fürs Schwarze Brett: [{def,cost,hired,affordable,free}] */
export function companionOffers(g){const cost=companionCost(g.player.level);return COMPANIONS.filter(d=>d.kind==='merc').map(def=>({def,cost,hired:g.companions.some(c=>c.id===def.id),affordable:(g.rpg.coins||0)>=cost,free:companionSlots(g)>0}));}
const fail=(g,text)=>{g.toast(text);return {ok:false,message:text};};

export function hireCompanion(g,id,{free=false}={}){
 const def=companionById(id);if(!def)return fail(g,T.unknown);
 if(g.companions.some(c=>c.id===id))return fail(g,T.already);
 if(companionSlots(g)<=0)return fail(g,(g.partyHumans||0)>0?T.partyFull:T.full);
 const cost=def.kind==='merc'&&!free?companionCost(g.player.level):0;if((g.rpg.coins||0)<cost)return fail(g,T.money);
 g.rpg.coins-=cost;const c=create(g,def);g.companions.push(c);
 g.toast(T.hired(c.name));if(def.lines?.hire)g.bark?.(c,def.lines.hire,'companion');g.emit('companion',{type:'hired',id});g.emit('save');return {ok:true,companion:c,cost};
}
export function dismissCompanion(g,id,reason='dismissed'){
 const c=g.companions.find(x=>x.id===id);if(!c)return {ok:false};
 if(g.friend?.ref===c)g.friend=null;g.companions=g.companions.filter(x=>x!==c);for(const e of g.enemies)clearThreat(e,id);
 g.toast((reason==='expired'?T.expired:reason==='party'?T.partyLeave:T.dismissed)(c.name));if(reason!=='expired'&&c.def.lines?.dismiss)g.bark?.(c,c.def.lines.dismiss,'companion');g.emit('companion',{type:reason,id});g.emit('save');return {ok:true};
}
/** Befehl an einen (id) oder alle: 'follow' | 'stay' | 'attack' (= aktuelles Ziel des Spielers, auch ohne dass es schon kämpft). */
export function orderCompanions(g,order,id){if(!T.orders[order])return false;for(const c of g.companions)if(!id||c.id===id){c.order=order;c.target=null;c.retarget=0;}g.toast(T.orderSet(T.orders[order]));g.emit('companion',{type:'order',order,id:id||null});return true;}
export function setCompanionStance(g,stance,id){if(!T.stances[stance])return false;for(const c of g.companions)if(!id||c.id===id){c.stance=stance;c.target=null;c.retarget=0;}g.toast(T.stanceSet(T.stances[stance]));g.emit('companion',{type:'stance',stance,id:id||null});g.emit('save');return true;}

/** Chat-Befehl ausführen (online.js → parseChatCommand). Rückgabe: Zeilen für das Chatfenster. */
export function companionCommand(g,cmd){
 const find=(list,name,key)=>list.find(x=>key(x).toLowerCase()===name)||list.find(x=>key(x).toLowerCase().includes(name)),name=String(cmd.name||'').trim().toLowerCase();
 if(cmd.op==='board'){if(!name)return [T.board+':',...companionOffers(g).map(o=>T.chat.offer(o,COMPANION_ROLES[o.def.role].name)),T.chat.help];const o=find(companionOffers(g),name,o=>o.def.name);return [o?hireCompanion(g,o.def.id).message||T.hired(o.def.name):T.unknown];}
 if(cmd.op==='dismiss'){if(!g.companions.length)return [T.chat.none];const list=name?[find(g.companions,name,c=>c.name)].filter(Boolean):[...g.companions];if(!list.length)return [T.unknown];return list.map(c=>{dismissCompanion(g,c.id);return T.dismissed(c.name);});}
 if(cmd.op==='order'){const order=T.chat.orderWords[name];if(!order)return [T.chat.needOrder];if(!g.companions.length)return [T.chat.none];orderCompanions(g,order);return [T.orderSet(T.orders[order])];}
 if(cmd.op==='stance'){const stance=T.chat.stanceWords[name];if(!stance)return [T.chat.needStance];if(!g.companions.length)return [T.chat.none];setCompanionStance(g,stance);return [T.stanceSet(T.stances[stance])];}
 return [T.chat.help];
}

export const savedCompanions=g=>(g.companions||[]).map(c=>({defId:c.id,hp:Math.round(ratio(c)*100)/100,contract:c.contract==null?null:Math.round(c.contract),stance:c.stance,order:c.order==='stay'?'stay':'follow',...(Object.keys(c.classBuffs||{}).length?{classBuffs:savedClassBuffs(c)}:{})}));
export function initCompanions(g,saved){g.companions=[];g.partyHumans=g.partyHumans||0;for(const s of Array.isArray(saved)?saved.slice(0,R.maxActive):[]){const def=companionById(s?.defId);if(def&&!g.companions.some(c=>c.id===def.id))g.companions.push(create(g,def,s));}}

// Netz (2026-09-24): Mitspieler sehen meine Söldner. Übertragen werden nur Katalog-ID und Zustand; Name und Aussehen
// setzt der Empfänger aus dem Katalog zusammen (keine fremden Texte im Netz). Der Server säubert dieselben Felder (server.mjs).
export function companionWire(g){if(g.instance)return undefined;const list=(g.companions||[]).slice(0,R.maxActive).map(c=>({i:c.def.id,x:Math.round(c.x),y:Math.round(c.y),f:c.facing<0?-1:1,s:c.state==='down'?'down':c.state==='combat'?'combat':c.moving?'walk':'idle',h:Math.round(ratio(c)*100),l:c.level,...(c.attack>0?{a:1}:c.castPose>0?{a:2}:{}),...(c.usingRanged?{r:1}:{})}));return list.length?list:undefined;}
/** Empfänger: Netzangabe → Zeichenansicht wie c.view; Überblendung startet an der zuletzt sichtbaren Stelle (wie applySnapshot). */
export function remoteCompanionViews(list,prev,owner,now,lerp=160){
 return (Array.isArray(list)?list:[]).map(w=>{const def=companionById(w?.i);if(!def)return null;const p=(prev||[]).find(v=>v.companion===w.i);let fromX=w.x,fromY=w.y;
  if(p){const k=Math.min(1,(now-p.at)/(p.lerp||lerp));fromX=p.fromX+(p.x-p.fromX)*k;fromY=p.fromY+(p.y-p.fromY)*k;if(Math.abs(fromX-w.x)+Math.abs(fromY-w.y)>600){fromX=w.x;fromY=w.y;}}
  const f=mercLook(def);return {name:def.name,owner:owner.name,x:w.x,y:w.y,fromX,fromY,at:now,lerp,facing:w.f,classId:def.look,look:def.look,spec:def.spec,level:w.l,state:w.s==='down'?'dead':w.s,hp:w.h,party:owner.party,floor:owner.floor,
   moving:w.s==='walk'||Math.abs(fromX-w.x)+Math.abs(fromY-w.y)>1,companion:w.i,role:def.role,down:w.s==='down',remote:true,attack:w.a===1?.2:0,castPose:w.a===2?.2:0,usingRanged:!!w.r,tint:f.tint,visualEquipment:f.visualEquipment,paperdollId:f.paperdollId};}).filter(Boolean);
}
