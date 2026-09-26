// Kampfschleife der Dungeon-Simulation (ausgelagert in Dungeon-Fix 7 aus scripts/dungeon-sim.mjs, damit das Serien-Nachstellen im echten Spiel
// (scripts/dungeon-serie.mjs) denselben Spieler-Bot nutzt): fight() spielt einen Kampf mit echter Spiellogik (g.tick) bis Sieg, Wipe oder
// Zeitlimit; der Held weicht aus, zieht, heilt oder bleibt passiv je nach Optionen. Unverändert übernommen; neu sind nur die Optionen dt (Takt,
// Zahl oder Funktion – das Spiel im Browser tickt mit der Bildrate) und autoFor (so viele Sekunden nur Autoangriff, danach passiv).
import {DUNGEONS} from '../content/index.js';
import {toWorld,coneHits,floorAt,inLane,roomAt,inHazard,hideSpots,lostSight,arenaAhead,addressBoss,bossReady,pullBoss,engageBoss} from '../dungeon.js';
import {beginReturn} from '../encounters.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from './balance-rotation.mjs';
import {available} from '../progression.js';
import {usable} from '../alert-answer.js';
import {hitCompanion} from '../companions.js';
import {meterReport} from '../combat-meter.js';
const DEF=DUNGEONS['schloss-bigb'],TRACE=!!process.env.SIM_TRACE;
export const MERCS={tank:'merc-pils-peter',heal:'merc-schorle-susi',dps1:'merc-radler-rita',dps2:'merc-hopfen-horst'};
export const inEll=(p,c)=>Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1;
export const party=g=>[g.player,...(g.companions||[])];

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
export function fight(g,foes,{dodge=true,behind=true,front=false,limit=600,immortal=false,lie='truth',calls=false,release=false,noDamage=false,stayDead=false,heroDownAt=null,downMercs=[],healer=false,stand=false,dt:step=.05,autoFor=0}={}){
 let dt=.05;const nextDt=typeof step==='function'?step:()=>step,p=g.player,stats={time:0,deaths:0,revives:0,wipes:0,mercDowns:0,mechHits:0,fell:0,taken:0,healed:0,minHpPct:100,minPartyPct:100,cones:0,coneNonTanks:0,lieHits:0,signed:0,sold:0,tankDowns:0},seenCones=new WeakSet(),seenFoes=new Set();
 const primary=foes[0];g.target=primary;primary.aggro=true;primary.ai='combat';p.inCombat=7;startAuto(g);g.adminGod=immortal;
 for(let t=0;t<limit;t+=dt){dt=nextDt();/* Dungeon-Fix 7: Takt wie im Browser (Bildrate) oder fest */
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
   /* Dungeon-Fix 6: „steht nur da“ – der passive Held der Prüferin läuft nicht und weicht nicht aus */if(stand)goal=null;
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){const to=g.world.findClear(goal.x,goal.y,7);/* Etappe 4 Teil A: um Deckung herum per Wegsuche */let via=to;if(!g.world.walkClear(p,to,6)){const path=g.world.findPath(p,to);via=path.find(q=>Math.hypot(q.x-p.x,q.y-p.y)>12)||to;}g.moveTo=via;g.path=[];}else g.moveTo=null;
   /* Feinschliff 2026-09-26, „ein Pack je Zug“: wer sorgfältig spielt, unterbricht den Funkspruch (Q, Hinweis „Unterbrechen“) nach 0,35 s – sonst
      kommen die Nachbarn, und die Flügelzeit hängt an Wipes statt am Pack */if(calls&&!g.casting&&available(g,'interrupt')&&!(g.cooldowns.interrupt>0)){const call=g.enemies.find(e=>e.hp>0&&e.cast?.callHelp&&e.cast.total-e.cast.remaining>=.35&&Math.hypot(e.x-p.x,e.y-p.y)<=130&&g.world.lineClear(p,e));if(call){const keep=g.target;g.target=call;g.action('interrupt');if(keep?.hp>0)g.target=keep;}}
   /* Dungeon-Fix 3: wer richtig spielt, beantwortet den Siegelring wie die Warnleiste – Parieren, ohne Schild Ausweichen (Leer) */if(dodge&&lie==='truth'&&!g.casting&&!noDamage/* Held aktiv: der passive Held nutzt keine Kniffe, auch keine Parade */){const ring=g.enemies.find(e=>e.hp>0&&e.sideCast?.tankDebuff&&(e.sideCast.focus||'player')==='player'&&e.sideCast.remaining<=.3);if(ring){if(usable(g,'parry')&&!(g.cooldowns.parry>0))g.action('parry');else if(!(g.cooldowns.dash>0))g.action('dash');}}
   /* Dungeon-Fix 4, --only=ohneheld: ein Held-Heiler wählt wie ein Spieler den schwächsten Söldner als Freund, solange er heilt */let mate=null;if(healer){mate=g.companions.filter(c=>c.state!=='down'&&c.hp>0&&c.hp/c.maxHp<.9&&Math.hypot(c.x-p.x,c.y-p.y)<400).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||null;/* Heiler-WoW: der schwächste Verbündete – ist es der Held selbst, heilt er sich (kein Freund gewählt) */if(mate&&mate.hp/mate.maxHp>p.hp/p.maxHp)mate=null;if(mate)g.friend={kind:'companion',ref:mate,player:false};}
   if(!noDamage&&!g.casting&&g.gcd<=0&&tgt&&!(careGround&&inGround(p)&&g.moveTo))rotate(g,{healer:healer&&(!!mate||p.hp/p.maxHp<.9)});/* nur solange er aus der Fläche läuft */if(healer)g.friend=null;
   /* Dungeon-Fix 4, --only=nohero: der Held macht keinen Schaden (Autoangriff aus, keine Kniffe) */if(noDamage&&g.autoAttack?.enabled&&!(stats.time<autoFor))g.stopAuto?.();
   /* Dungeon-Fix 7 (Prüferin #770): „wie die Prüferin“ – die ersten autoFor Sekunden nur Autoangriff, danach passiv */if(noDamage&&stats.time<autoFor&&tgt?.hp>0&&!g.autoAttack?.enabled)startAuto(g);
  }
  /* Dungeon-Fix 4, --only=ohneheld: bei heroDownAt Bossleben fällt der Held (und downMercs), danach bleibt er liegen */if(heroDownAt!=null&&stats.heroDown==null&&foes[0].hp>0&&foes[0].hp/foes[0].maxHp<=heroDownAt){stats.heroDown=Math.round(stats.time);for(const k of downMercs){const c=g.companions.find(x=>x.id===MERCS[k]);if(c&&c.state!=='down')hitCompanion(g,foes[0],c,1e7);}}
  if(foes[0]?.dungeonBoss)stats.bossMin=Math.min(stats.bossMin??100,Math.ceil(Math.max(0,foes[0].hp)/foes[0].maxHp*100));/* tiefster Stand (nach einem Wipe setzt er zurück) */
  if(stats.heroDown!=null&&!g.dead){g.adminGod=false;p.invulnerable=0;p.parry=0;g.hitPlayer(foes[0],0,false,50);}
  /* Dungeon-Fix 4, --only=nohero: „Held liegt“ – wer ihm aufhilft, sieht ihn gleich wieder fallen */if(stayDead!==false&&stats.time>=stayDead&&!g.dead){g.adminGod=false;p.invulnerable=0;p.parry=0;g.hitPlayer(foes[0],0,false,50);}
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
 {/* Heiler-WoW: Anteil des Helden an der Heilung der Gruppe (Kampfstatistik, ohne Überheilung) */const hr=meterReport(g,'overall','healing'),me=hr.actors?.find(a=>a.id===g.member.id);stats.heroHeal=Math.round(me?.amount||0);stats.heroHealShare=hr.total?Math.round((me?.amount||0)/hr.total*100):0;}
 const done=foes.reduce((n,e)=>n+e.maxHp-Math.max(0,e.hp),0);stats.groupDps=Math.round(done/Math.max(1,stats.time));stats.heroDps=Math.round(g.stats.damage/Math.max(1,stats.time));
 const left=foes.filter(e=>e.hp>0);stats.won=!left.length&&!stats.wipes;stats.bossLeft=left.length?Math.round(left[0].hp/left[0].maxHp*100)+'%':'0%';stats.time=Math.round(stats.time);
 stats.taken=Math.round(stats.taken);stats.healed=Math.round(stats.healed);if(!stats.deathBy)delete stats.deathBy;
 stats.lieHits=foes.reduce((n,e)=>n+(e.lieHits||0),0);if(stats.cones)stats.conePerCast=+(stats.coneNonTanks/stats.cones).toFixed(2);else{delete stats.cones;delete stats.coneNonTanks;}
 return stats;
}
/** Dungeon-Fix 5 (Prüfer #728): Big B wartet nach seiner Rede, bis der Held angreift. Der Sim-Held spricht ihn an, die Rede läuft (Söldner folgen),
 *  dann zieht er selbst – pullBoss, derselbe Weg wie ein Angriff im Spiel (engine.js damage). → Sekunden der Rede (zählen nicht zur Kampfzeit). */
export function heroPulls(g,big){let t=0;if(addressBoss(g,big))for(;t<30&&!bossReady(g,big);t+=.05)g.tick(.05);g.events.length=0;if(!pullBoss(g,big))engageBoss(g,big);return t;}
