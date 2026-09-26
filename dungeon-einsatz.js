// Einsatz im Dungeon (Auftrag „Held aktiv“, docs/DUNGEON-AKTIV-2026-09-26.md): Rollen-Balance ohne den Helden, Rückenwind für einen Helden,
// der mitkämpft, und die Wertung nach dem Boss. Zahlen und Texte: content/dungeon-einsatz.js. Aufgerufen aus dungeon.js (tickDungeon,
// resolveDungeonCast, onDungeonKill) und companions.js (Autoangriff, Schaden, Letztes Aufgebot).
//   1. Rolle zählt: Autoangriffe der Bosse gegen Söldner (Ausweichen im Letzten Aufgebot, untanked); Tank-Buster in dungeon.js.
//   2. Angefeuert: Solange der Held selbst trifft, heilt, unterbricht oder pariert, machen die Söldner gegen den Boss mehr Schaden.
//   3. Letztes Aufgebot: Steht niemand mehr, der schützt oder heilt, greifen die Schadens-Söldner einmal zu „Alles oder nichts“ und zur Schorle.
//   4. Wertung („Einsatz“): Anteil in der Rolle, Unterbrechungen, beantwortete Warnungen, Ausweichen, Tode → Bonus-Siegelmarken.
import {EINSATZ_RULES as R,EINSATZ_SCORE as S,EINSATZ_TEXT as T,SPECS} from './content/index.js';
import {emitCombatFx} from './combat-fx.js';

const runOf=g=>g?.instance?.kind==='dungeon'?g.instance.run:null;
const standing=c=>c.state!=='down'&&c.hp>0;
const fightingBoss=e=>!!e?.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat';
/** Rolle des Helden aus seiner Spezialisierung: 'tank', 'heal' oder 'damage'. */
export function heroRole(g){const r=SPECS[g?.rpg?.talents?.spec]?.role;return r==='Tank'?'tank':r==='Heilung'?'heal':'damage';}
const bossOf=e=>e?.dungeonBoss?e:e?.summoner?.dungeonBoss?e.summoner:null;
/** Summe dessen, was der Held selbst getan hat: Schaden, Heilung (Meter), Unterbrechen, Paraden. Steigt sie, kämpft er mit. */
function heroOutput(g){const a=g.meter?.overall?.actors?.[g.member?.id];return (g.stats?.damage||0)+(a?.healing||0)+(g.stats?.interrupts||0)+(g.stats?.parries||0);}

// ── 1. Rolle zählt ────────────────────────────────────────────────────────────────────────────────────────────────
/** Faktor auf den Autoangriff eines Gegners gegen einen Söldner: 0, solange er im Letzten Aufgebot ausweicht; sonst schlagen Dungeon-Bosse
 *  Söldner ohne Schutz-Rolle mit untanked.auto (1 = wie den Schutz). */
export function bossAutoFactor(g,e,c){if(!runOf(g)||!e?.dungeonBoss)return 1;if(c?.evade?.until>g.time){say(g,c,T.lastStand.evaded,'#aed4bd');return 0;}return c?.def?.role!=='tank'?R.untanked.auto:1;}
/** Hält gerade ein Söldner ohne Schutz-Rolle diesen Boss? → Söldner oder null (Anzeige „Ungeschützt“ im Bossrahmen). */
export function untankedHolder(g,e){if(!runOf(g)||!fightingBoss(e)||!e.focus||e.focus==='player')return null;const c=(g.companions||[]).find(o=>o.id===e.focus&&standing(o));return c&&c.def?.role!=='tank'?c:null;}

// ── 2. Angefeuert ─────────────────────────────────────────────────────────────────────────────────────────────────
/** Kämpft der Held gerade mit (lebt, hat in den letzten hold Sekunden getroffen, geheilt, unterbrochen oder pariert)? */
export function rallyActive(g){const run=runOf(g);return !!run&&!g.dead&&run.rallyAt!=null&&g.time-run.rallyAt<=R.rally.hold;}
/** Schadensfaktor eines Söldners gegen e: Angefeuert (gegen alle Dungeon-Gegner) und „Alles oder nichts“. */
export function mercDamageFactor(g,c,e){let f=1;if(e?.dungeon&&rallyActive(g))f*=1+R.rally.bonus;if(c?.lastStand?.until>g.time)f*=1+R.lastStand.burst.damage;return f;}

/** Buffleiste (auras.js): „Angefeuert“ mit Restzeit, solange der Held mit Söldnern im Dungeon mitkämpft. */
export function rallyAura(g){const run=runOf(g);if(!run||!g.companions?.length||!rallyActive(g))return null;
 return {id:'rally',name:T.rally.name,text:T.rally.tip(R.rally),itemIcon:'megaphone',icon:'buff',remaining:Math.max(0,R.rally.hold-(g.time-run.rallyAt)),duration:R.rally.hold};}

// ── 3. Letztes Aufgebot ───────────────────────────────────────────────────────────────────────────────────────────
/** Steht im Bosskampf noch jemand, der schützt bzw. heilt? Der Held zählt nach seiner Spezialisierung, solange er steht. */
function roleStanding(g,role){if(!g.dead&&heroRole(g)===role)return true;return (g.companions||[]).some(c=>standing(c)&&c.def?.role===role);}
const inBossFight=g=>(g.enemies||[]).some(fightingBoss);
/** Je Takt für jeden Schadens-Söldner (companions.js tickOne): „Alles oder nichts“ und Notfall-Schorle, je einmal je Kampf. */
export function tickLastStand(g,c){
 if(!runOf(g)||c.def?.role!=='damage'||!standing(c))return;
 if(!inBossFight(g)){if(c.inCombat<=0){c.lastStand=null;c.potionUsed=false;c.lastStandUsed=false;c.evade=null;c.evadeUsed=false;}return;}
 const noHeal=!roleStanding(g,'heal'),noTank=!roleStanding(g,'tank');
 if(noHeal&&noTank&&!c.lastStandUsed){c.lastStandUsed=true;c.lastStand={until:g.time+R.lastStand.burst.duration};
  g.bark?.(c,T.lastStand.lines[c.id]||T.lastStand.line,'companion');say(g,c,T.lastStand.shout,'#ffb070');emitCombatFx(g,'proc',c,{companion:c.id,label:T.lastStand.shout});}
 /* Ausweichen: wer im Letzten Aufgebot den Boss am Hals hat, weicht einmal je Kampf seinen Schlägen aus */const ev=R.lastStand.evade;if(c.lastStandUsed&&noTank&&!c.evadeUsed&&c.hp/c.maxHp<ev.below&&g.enemies.some(e=>fightingBoss(e)&&e.focus===c.id)){c.evadeUsed=true;c.evade={until:g.time+ev.duration};say(g,c,T.lastStand.evade,'#aed4bd');}
 const pot=R.lastStand.potion;if(noHeal&&!c.potionUsed&&c.hp/c.maxHp<pot.below){c.potionUsed=true;const n=Math.round(Math.min(c.maxHp-c.hp,c.maxHp*pot.heal));c.hp+=n;
  say(g,c,T.lastStand.potion+' +'+n,'#b7df92');emitCombatFx(g,'heal',c,{amount:n,direct:true,companion:c.id});}
}
/* Dungeon-Fix 6 (Prüferin #741 sah „ANGEFEUERT“ nie): Ansagen über den Söldnern sind Ausrufe (callout) – groß, farbig, länger und auch im Bosskampf
   mit Text (dort zeigen Meldungszeilen sonst nur das Symbol, dungeon-e4b.css). */
function say(g,c,text,color,iconKey){if(!g.sct?.({actor:c.id,member:c.def?.look,area:'note',kind:'proc',text,callout:true,color,...(iconKey?{iconKey}:{})}))g.float?.(c.x,c.y-40,text,color);}

/** Einblendung beim Wutausbruch eines Bosses (Big B hat seine eigene: „Die ganze Wahrheit“). */
export function enrageText(e){return T.enrage[e?.bossId]||T.enrage.other;}

// ── 4. Wertung je Bosskampf ───────────────────────────────────────────────────────────────────────────────────────
const actorTotals=g=>{const out={};for(const [id,a] of Object.entries(g.meter?.overall?.actors||{}))out[id]={damage:a.damage||0,healing:a.healing||0};return out;};
function startRecord(g,e){return {start:g.time,actors:actorTotals(g),stats:{...(g.stats||{})},time:0,hold:0,rally:0,deaths:0,warn:0,warnOk:0,wasDead:!!g.dead};}
/** Je Takt aus tickDungeon: Angefeuert erkennen, laufende Bosskämpfe mitschreiben. */
export function tickEinsatz(g,run,dt){
 const out=heroOutput(g);if(run.rallyOut!=null&&out>run.rallyOut&&!g.dead)run.rallyAt=g.time;run.rallyOut=out;
 const on=rallyActive(g);
 for(const e of g.enemies||[]){
  if(!e.dungeonBoss)continue;
  if(!fightingBoss(e)){if(e.hp>0&&e.einsatz&&!e.aggro)e.einsatz=null;continue;}
  const r=e.einsatz||(e.einsatz=startRecord(g,e));r.time+=dt;
  if(!g.dead&&(!e.focus||e.focus==='player'))r.hold+=dt;
  if(on)r.rally+=dt;
  if(g.dead&&!r.wasDead)r.deaths++;r.wasDead=!!g.dead;
 }
 /* Einblendung „Angefeuert“ über den Söldnern, wenn der Rückenwind (wieder) einsetzt */
 if(on&&!run.rallyShown&&inBossFight(g)){run.rallyShown=true;for(const c of g.companions||[])if(standing(c))say(g,c,T.rally.shout,'#ffcf6a','megaphone');}
 if(!on&&run.rallyShown&&(g.dead||run.rallyAt==null||g.time-run.rallyAt>R.rally.hold+R.rally.shout))run.rallyShown=false;
}
/** Warnung ausgewertet (resolveDungeonCast): galt die Mechanik dem Helden, und kam er ohne Treffer bzw. richtig durch? */
const AVOID=c=>!!(c.line||c.ground||c.circles||c.los||c.cone||c.spread);
export function noteWarning(g,e,c,victim,struck,heroHere){
 const boss=bossOf(e),r=boss?.einsatz;if(!r||g.dead||!c||c.interruptible)return;
 if(!runOf(g)||!heroHere)return;
 let counts=false,ok=false;
 if(c.tankDebuff){counts=victim==='player';ok=!struck;}
 else if(c.stack){counts=true;ok=struck>0;}
 else if(c.spread){counts=true;ok=struck<=1;}
 else if(c.cone&&heroRole(g)==='tank'&&victim==='player'){counts=false;}
 else if(AVOID(c)){counts=true;ok=!struck;}
 if(!counts)return;r.warn++;if(ok)r.warnOk++;
}
/** Nach dem Sieg (onDungeonKill): Anteile, Zählwerte, Punkte und Bonus-Siegelmarken. → Ergebnis oder null. */
export function finishEinsatz(g,e){
 const r=e.einsatz;if(!r)return null;e.einsatz=null;const now=actorTotals(g),hero=g.member?.id,role=heroRole(g);
 let dmg=0,heal=0,hd=0,hh=0;for(const [id,a] of Object.entries(now)){const b=r.actors[id]||{damage:0,healing:0},d=Math.max(0,a.damage-b.damage),h=Math.max(0,a.healing-b.healing);dmg+=d;heal+=h;if(id===hero){hd=d;hh=h;}}
 const pct=(a,b)=>b>0?Math.round(a/b*100):0,st=g.stats||{},diff=k=>Math.max(0,(st[k]||0)-(r.stats[k]||0));
 const res={role,damage:pct(hd,dmg),healing:pct(hh,heal),hold:r.time>0?Math.round(r.hold/r.time*100):0,interrupts:diff('interrupts'),dodges:diff('dodges'),
  warn:r.warn,warnOk:r.warnOk,deaths:r.deaths,rally:r.time>0?Math.round(r.rally/r.time*100):0,seconds:Math.round(r.time)};
 const share=role==='tank'?res.hold:role==='heal'?res.healing:res.damage;
 const parts={share:Math.round(Math.min(1,share/100/(S.share.target[role]||1))*S.share.points),interrupt:Math.min(S.interrupt.max,res.interrupts*S.interrupt.points),
  warn:Math.round((res.warn?res.warnOk/res.warn:1)*S.warn.points),death:res.deaths*S.death.points};
 res.parts=parts;res.score=Math.max(0,Math.min(S.max,parts.share+parts.interrupt+parts.warn+parts.death));
 const tier=[...S.reward].sort((a,b)=>b.min-a.min).find(t=>res.score>=t.min)||null;res.bonus=tier?tier.marks:0;res.tier=tier?.tier||null;
 return res;
}
