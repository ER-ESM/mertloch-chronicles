// Trainingsarena (Admin): Gegner nach Wahl neben dem Spieler aufstellen, Puppen ohne Angriff, Schadensmessung.
// Arenagegner geben keine EP, keine Beute, zählen für keinen Auftrag und kehren nie nach Hause zurück.
import {ARCHETYPES,ELITES,BOSSES,ENEMY_AUTOS} from './content/index.js';
import {ITEMS,addItem,equipItem} from './rpg.js';
import {makeEnemy} from './encounters.js';
import {distance} from './world.js';
export const ARENA_KINDS=[...Object.entries(ARCHETYPES).map(([id,d])=>({id,name:d.name,group:'Feld'})),...Object.entries(ELITES).map(([id,d])=>({id,name:d.name,group:'Elite'})),...Object.entries(BOSSES).map(([id,d])=>({id,name:d.name,group:'Boss'}))];
const definition=id=>ARCHETYPES[id]||ELITES[id]||BOSSES[id]||ARCHETYPES.boar;
export const freshArenaStats=()=>({damage:0,hits:0,kills:0,start:null,last:0,taken:0});
/** Stellt `count` Gegner der Art `kind` im Halbkreis vor den Spieler. `dummy` = Übungspuppe: greift nie an, stirbt nie, heilt sich außerhalb des Kampfes. */
export function spawnArena(g,{kind='boar',count=1,dummy=false,level=null}={}){const def=definition(kind),p=g.player,list=[];count=Math.max(1,Math.min(10,Math.floor(count)||1));
 for(let i=0;i<count;i++){const angle=Math.PI/2+(i-(count-1)/2)*(Math.PI/Math.max(4,count)),r=dummy?42:110,spot=g.world.findClear?g.world.findClear(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r,9):{x:p.x+Math.cos(angle)*r,y:p.y+Math.sin(angle)*r};
  const hp=dummy?100000:Math.round(def.hp*(level&&def.level?1+Math.max(0,level-def.level)*.12:1));
  const e=makeEnemy(spot,90000+(g.arenaSerial=(g.arenaSerial||0)+1),{...def,hp,level:level||def.level,bossId:def.id,arena:true,ambient:true,dummy,behavior:'aggressive',respawn:[1e9,1e9],leash:1e9,aggroRange:dummy?0:def.aggroRange||100,spawnGrace:0,name:dummy?'Übungspuppe · '+def.name:def.name});
  if(dummy)e.autoAttack={...(e.autoAttack||ENEMY_AUTOS.boar),min:0,max:0};if(!dummy){e.aggro=true;e.ai='combat';e.attackTimer=2;}g.enemies.push(e);list.push(e);}
 if(!g.target||g.target.hp<=0)g.target=list[0];g.player.inCombat=dummy?g.player.inCombat:7;g.arenaStats=freshArenaStats();g.toast((dummy?'Übungspuppe':count+' × '+def.name)+' steht bereit. Arena misst deinen Schaden.');g.emit('rpgChanged');return list;}
export function clearArena(g){const n=g.enemies.filter(e=>e.arena).length;g.enemies=g.enemies.filter(e=>!e.arena);if(g.target?.arena)g.target=null;g.player.inCombat=0;g.toast(n?'Arena geräumt. '+arenaSummary(g):'Arena ist leer.');g.arenaStats=freshArenaStats();g.emit('rpgChanged');return n;}
export function arenaHit(g,e,dealt){const s=g.arenaStats||(g.arenaStats=freshArenaStats());if(s.start===null)s.start=g.time;s.last=g.time;s.damage+=dealt;s.hits++;}
export function arenaReport(g){const s=g.arenaStats||freshArenaStats(),seconds=s.start===null?0:Math.max(1,s.last-s.start),alive=g.enemies.filter(e=>e.arena&&e.hp>0).length;return {damage:Math.round(s.damage),hits:s.hits,kills:s.kills,seconds:+seconds.toFixed(1),dps:Math.round(s.damage/seconds),taken:Math.round(s.taken),alive,active:g.enemies.some(e=>e.arena)};}
export const arenaSummary=g=>{const r=arenaReport(g);return r.hits?`${r.damage} Schaden in ${r.seconds} s = ${r.dps} DPS · ${r.hits} Treffer · ${r.kills} Kills · ${r.taken} eingesteckt`:'Noch kein Treffer gemessen.';};
/** Hebt die Stufe für Tests an (nie senken; dafür Admin-Neustart). */
export function setArenaLevel(g,level){level=Math.max(1,Math.min(30,Math.floor(level)||1));let guard=0;while(g.player.level<level&&guard++<400)g.gainXp(g.player.level*140-g.player.xp);outfitForLevel(g,level);g.refreshStats?.();g.player.hp=g.player.maxHp;g.player.energy=100;return g.player.level;}
/** Testausrüstung: je Platz das stärkste Katalogteil bis zur Stufe (Playtest 2026-09-19: Stufe 15 ohne Ausrüstung starb an Stufe-1-Dachsen). */
export function outfitForLevel(g,level){const slots=['weapon','offhand','ranged','body','feet','head','ring','trinket','charm'];let changed=0;for(const slot of slots){const candidates=Object.entries(ITEMS).filter(([,it])=>it.slot===slot&&(it.level||1)<=level&&!it.unique).sort((a,b)=>((b[1].level||1)-(a[1].level||1))||((b[1].value||0)-(a[1].value||0)));for(const [id] of candidates){if(Object.values(g.rpg.equipment||{}).includes(id))break;addItem(g.rpg,id,1);if(equipItem(g,id)){changed++;break;}}}if(changed)g.toast?.('Testausrüstung angelegt: '+changed+' Teile bis Stufe '+level+'.');return changed;}
export function tickArena(g,dt){for(const e of g.enemies){if(!e.arena)continue;if(e.dummy){e.aggro=e.hp<e.maxHp&&g.player.inCombat>0;e.ai=e.aggro?'combat':'roaming';e.cast=null;e.attackTimer=99;e.autoTimer=99;if(g.player.inCombat<=0&&e.hp<e.maxHp)e.hp=e.maxHp;e.roamGoal=null;continue;}if(e.hp>0&&distance(e,g.player)>600)e.aggro=true;}}
