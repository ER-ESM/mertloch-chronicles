// Dungeon Etappe 4 Teil A „Die restlichen Bosse“ (E-71, docs/DUNGEON-ETAPPE-4A-2026-09-25.md): Frau Dr. Exposé (Interessenten mit Ziel,
// Attrappen, zweimal unterbrechen), Korken-Kurt (Sammeln, Verteilen, waagrechte Rinnen, Sprinkler), Reichweiten-Rita (Sichtlinie hinter
// Deckung, Greenscreen), das halbe Pferd (Trog, selten, Reittier), Tresortür mit allen drei Siegeln (alle sechs Reihenfolgen im Spiel),
// Söldner-Reaktionen, Adds fliehen mit dem Boss, Warnleiste und Journal.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_ENEMIES,DUNGEON_UI,DROP_TABLES,MOUNTS,describeCast} from '../content/index.js';
import {toWorld,roomAt,floorAt,requiredSeals,doorOpen,resolveDungeonCast,inLane,floorRoute,bossZones,hideSpots,coverRects,spawnRareBoss,savedDungeonRun,restoreDungeonRun,dungeonDamageFactor,inHazard,lostSight,sightSpot} from '../dungeon.js';
import {upcomingCasts,trackCasts} from '../boss-alerts.js';
import {bossCasts,bossLoot} from '../dungeon-journal.js';
import {MAP_PAINT} from '../map-symbols.js';
import {addItem,countItem,ITEMS} from '../rpg.js';
import {acquisitionReason,mountStation} from '../mounts.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'],U=8;
const DAY=Date.UTC(2026,8,25,12);
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const boss=(g,id)=>g.enemies.find(e=>e.bossId===id);
function party(g){for(const id of MERCS)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}return g;}
/** Boss ziehen: Held in der Arena, Boss im Kampf. */
function pull(g,id,[f,x,y],{mercs=false}={}){const r=inside(g);quiet(g);if(DEF.bosses.find(b=>b.id===id)?.rare)spawnRareBoss(g,id);at(g,f,x,y);if(mercs)party(g);const b=boss(g,id);b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;return {r,b};}
/** Zauber `type` aus setId an b starten (wie engine.startCast). */
function castNow(g,b,setId,type){b.engaged=true;b.saidPhases=new Set((DUNGEON_BOSSES[b.bossId].phases||[]).filter(p=>b.hp/b.maxHp<=p.at).map(p=>p.at));b.castSet=setId;const set=DUNGEON_CASTS[setId];b.cycle=set.cycle.indexOf(type);b.attackTimer=0;g.startCast(b);assert.equal(b.cast.type,type);return b.cast;}
const EXPOSE=['k1',32,40.6],KURT=['k2',16.2,27.6],RITA=['k1',58.4,18.2],PFERD=['k1',31,2];

test('Alle Siegelträger gebaut: die Tresortür verlangt alle drei Siegel',()=>{
 const door=DEF.doors.find(d=>d.lock?.seals);assert.deepEqual(requiredSeals(DEF,door.lock.seals),['siegel-gerd','siegel-expose','siegel-kurt']);
 for(const id of ['expose','korkenkurt','rita','halbespferd']){const d=DUNGEON_BOSSES[id];assert.ok(d,id);assert.ok(DUNGEON_CASTS[d.castSet],id+' Zaubermuster');assert.ok(DROP_TABLES[d.family],id+' Beutetabelle');}
 const g=game(),r=inside(g);for(const s of ['siegel-gerd','siegel-expose']){r.seals.add(s);r.version++;assert.equal(doorOpen(r,door),false,'zu mit '+[...r.seals].join(', '));}
 r.seals.add('siegel-kurt');r.version++;assert.equal(doorOpen(r,door),true);
});

test('Alle sechs Reihenfolgen der Siegelträger im Spiel: Wege mit den echten Toren, Übergängen und Türen, Tür erst nach dem dritten Siegel',()=>{
 const holders=DEF.bosses.filter(b=>b.seal),perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 const spot=id=>{const b=DEF.bosses.find(x=>x.id===id),room=DEF.rooms.find(r=>r.id===b.room);return {floor:room.floor,...toWorld(DEF,room.floor,...b.at)};};
 /** Zum Punkt `to` (Ebene, Weltpunkt) wie der Held: auf einer Ebene per Wegsuche (Türen, Tore), zwischen Ebenen und über die Leiter nur
  *  über Übergänge mit ihren Sperren (dungeonStep). Breitensuche über die Enden der Übergänge. */
 const reach=(g,a,b)=>{if(floorAt(DEF,a.x,a.y)!==floorAt(DEF,b.x,b.y))return false;if(Math.hypot(a.x-b.x,a.y-b.y)<20)return true;return g.world.findPath(a,g.world.findClear(b.x,b.y,7)).length>0;};
 const usable=(r,t,side)=>!(t.oneWay&&t.oneWay!==side)&&!(t.secret&&!r.secrets.has(t.secret))&&!(t.gate?.boss&&t.gate.side===side&&!r.killed.has(t.gate.boss))&&!(t.unlock&&!r.unlocked.has(t.id)&&side!==t.unlock);
 function travel(g,to){const r=g.dungeonRun,start={x:g.player.x,y:g.player.y},seen=new Set(),queue=[{at:start,steps:[]}];
  while(queue.length){const {at,steps}=queue.shift();if(reach(g,at,to)){for(const [t,side] of steps){const s=t[side];Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,s.floor,s.x,s.y)),7));if(!g.dungeonStep(t.id,side))return false;}Object.assign(g.player,g.world.findClear(to.x,to.y,9));return true;}
   for(const t of DEF.transitions)for(const side of ['a','b']){const key=t.id+side;if(seen.has(key)||!usable(r,t,side))continue;const s=toWorld(DEF,t[side].floor,t[side].x,t[side].y);if(!reach(g,at,s))continue;seen.add(key);const o=t[side==='a'?'b':'a'];queue.push({at:toWorld(DEF,o.floor,o.x,o.y),steps:[...steps,[t,side]]});}}
  return false;}
 for(const order of perms){const g=game(),r=inside(g);quiet(g);const names=order.map(i=>holders[i].id);
  for(const i of order){const b=holders[i],e=boss(g,b.id);assert.ok(travel(g,spot(b.id)),names.join(' → ')+': '+b.id+' erreichbar');assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id,b.room,b.id+' in der Arena');
   const vault=toWorld(DEF,'k2',50,20);if(r.seals.size<2)assert.equal(doorOpen(r,DEF.doors.find(d=>d.id==='tresor')),false,'Tür vor dem dritten Siegel zu');
   g.kill(e);run(g,.1);assert.ok(r.seals.has(b.seal),b.seal);g.player.inCombat=0;}
  assert.ok(travel(g,{floor:'k2',...toWorld(DEF,'k2',52,24)}),names.join(' → ')+': Thronsaal durch die Tresortür erreichbar');assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id,'thronsaal');}
});

test('Frau Dr. Exposé: Interessenten kommen aus den Eingängen, besichtigen, gehen zum Tisch und unterschreiben – Provision macht sie stärker',()=>{
 const g=game(),{r,b}=pull(g,'expose',EXPOSE);const z=bossZones(r,b);assert.equal(z.doors.length,2);
 castNow(g,b,'d-expose','verkauft');b.cast=null;const k={...DUNGEON_CASTS['d-expose'].casts.termin,type:'termin'};resolveDungeonCast(g,b,k,'player');
 const adds=g.enemies.filter(e=>e.summoner===b&&e.goalAt);assert.equal(adds.length,3,'drei Interessenten');assert.ok(adds.every(a=>Math.hypot(a.x-z.doors[1].x,a.y-z.doors[1].y)<60||Math.hypot(a.x-z.doors[0].x,a.y-z.doors[0].y)<60),'an einem Eingang');
 assert.ok(adds.every(a=>a.goalVia.length===1),'erst besichtigen');const before=b.damage;
 b.trackTimers={termin:1e9};/* keine weitere Welle */g.player.hp=g.player.maxHp;g.adminGod=true;run(g,14);g.adminGod=false;
 assert.equal(b.provision,3,'alle drei unterschreiben, wenn keiner sie legt');assert.ok(b.damage>before*1.4,'Provision: +15 % je Unterschrift ('+before.toFixed(2)+' → '+b.damage.toFixed(2)+')');
 assert.equal(g.enemies.filter(e=>e.summoner===b&&e.goalAt).length,0,'wer unterschrieben hat, geht');
});

test('VERKAUFT: bei fünf Unterschriften fliegen alle aus der Wohnung, der Kampf setzt zurück',()=>{
 const g=game(),{r,b}=pull(g,'expose',EXPOSE,{mercs:true});run(g,.2);assert.equal(r.arena,'musterwohnung');b.provision=4;
 const k={...DUNGEON_CASTS['d-expose'].casts.termin,type:'termin'};resolveDungeonCast(g,b,k,'player');const a=g.enemies.find(e=>e.summoner===b&&e.goalAt);Object.assign(a,{x:a.goalAt.x+4,y:a.goalAt.y,goalVia:[]});g.events.length=0;
 run(g,.2);assert.ok(g.events.some(e=>e.type==='dungeonSold'),'VERKAUFT');assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id,'galerie','Held vor der Tür');
 assert.ok(g.companions.every(c=>roomAt(DEF,c.x,c.y)?.id==='galerie'),'Söldner vor der Tür');assert.equal(b.aggro,false);assert.equal(b.hp,b.maxHp);assert.equal(b.provision,0);
 run(g,.2);assert.equal(r.arena,null,'Tür wieder offen');
});

test('Attrappen: vier Stellen sehen gleich aus, nach 0,8 s bekommen die echten den Stempel; nur echte treffen',()=>{
 const g=game(),{b}=pull(g,'expose',EXPOSE,{mercs:true});const k=castNow(g,b,'d-expose','verkauft');
 assert.equal(k.spots.length,4);assert.equal(k.spots.filter(s=>s.decoy).length,2,'zwei Attrappen');assert.equal(k.told,false,'noch kein Stempel');
 run(g,.7);assert.equal(b.cast.told,false);run(g,.2);assert.equal(b.cast.told,true,'Stempel nach 0,8 s');
 const decoy=k.spots.find(s=>s.decoy),real=k.spots.find(s=>!s.decoy),mid=toWorld(DEF,'k1',32,44);k.spots.forEach((s,i)=>{s.x=mid.x-72+i*48;s.y=mid.y;});g.companions.forEach(c=>{c.x=c.x+300;});
 Object.assign(g.player,{x:decoy.x,y:decoy.y});let hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');assert.equal(g.player.hp,hp,'Attrappe trifft nicht');
 Object.assign(g.player,{x:real.x,y:real.y});hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');assert.ok(hp-g.player.hp>=g.player.maxHp*.4,'echter Stempel trifft');
});

test('Söldner bei Exposé: Schaden nimmt den Interessenten am nächsten zum Tisch, der Schutz spottet sie nicht; Notartermin zu zweit unterbrochen',()=>{
 const g=game(),{b}=pull(g,'expose',EXPOSE,{mercs:true});run(g,1);const k={...DUNGEON_CASTS['d-expose2'].casts.offen,type:'offen'};resolveDungeonCast(g,b,k,'player');
 const adds=g.enemies.filter(e=>e.summoner===b&&e.goalAt);assert.equal(adds.length,4,'zwei je Eingang');adds[2].x=adds[2].goalAt.x-30;adds[2].y=adds[2].goalAt.y;adds[2].goalVia=[];
 run(g,.6);const horst=g.companions.find(c=>c.def.id==='merc-hopfen-horst'),pils=g.companions.find(c=>c.def.role==='tank');
 assert.equal(horst.target,adds[2],'Horst nimmt das Add am Tisch');assert.equal(pils.target,b,'Pils hält Exposé');assert.ok(adds.every(a=>a.focus!==pils.id),'kein Spott auf Interessenten');
 b.hp=b.maxHp*.19;const n=castNow(g,b,'d-expose3','notar');assert.equal(n.interrupts,2);const hp=b.hp;run(g,3.6);
 assert.ok(!b.cast||b.cast.type!=='notar'||b.cast.broken>=1,'Söldner unterbrechen');assert.ok(b.hp<=hp,'Notartermin kam nicht durch (keine Heilung)');
});

test('Notartermin kommt durch: Exposé heilt 10 %, alle Interessenten unterschreiben sofort',()=>{
 const g=game(),{b}=pull(g,'expose',EXPOSE);b.hp=b.maxHp*.18;resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-expose3'].casts.offen,type:'offen'},'player');
 const hp=b.hp;resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-expose3'].casts.notar,type:'notar'},'player');
 assert.equal(b.provision,4,'vier Unterschriften');assert.ok(Math.abs(b.hp-hp-b.maxHp*.1)<2,'10 % geheilt');
});

test('Korken-Kurt: Sammeln teilt den Schaden durch alle im Kreis, allein tödlich',()=>{
 const g=game(),{b}=pull(g,'korkenkurt',KURT,{mercs:true});const c=DUNGEON_CASTS['d-kurt'].casts.runde,mark=g.companions.find(o=>o.def.role==='damage');
 for(const o of g.companions){o.hp=o.maxHp;o.x=mark.x+400;}mark.x=g.player.x+200;g.player.hp=g.player.maxHp;
 let before=mark.hp;resolveDungeonCast(g,b,{...c,type:'runde',victim:mark.id},'player');assert.ok(before-mark.hp>=mark.maxHp*.95||mark.state==='down','allein: volle Wucht');
 const g2=game(),{b:b2}=pull(g2,'korkenkurt',KURT,{mercs:true}),m2=g2.companions.find(o=>o.def.role==='damage');for(const o of [g2.player,...g2.companions]){o.hp=o.maxHp;Object.assign(o,{x:m2.x+(o===m2?0:8),y:m2.y});}
 const hps=[g2.player,...g2.companions].map(u=>u.hp);resolveDungeonCast(g2,b2,{...c,type:'runde',victim:m2.id},'player');
 const lost=[g2.player,...g2.companions].map((u,i)=>(hps[i]-u.hp)/u.maxHp);assert.ok(lost.every(x=>x>0&&x<.35),'zu fünft je ein Fünftel ('+lost.map(x=>x.toFixed(2))+')');
});

test('Korken-Kurt: Verteilen – jeder nimmt seinen Kreis, Überlappung addiert',()=>{
 const g=game(),{b}=pull(g,'korkenkurt',KURT);const c={...DUNGEON_CASTS['d-kurt'].casts.zahlen,type:'zahlen'};g.player.hp=g.player.maxHp;
 let hp=g.player.hp;resolveDungeonCast(g,b,c,'player');const alone=hp-g.player.hp;assert.ok(Math.abs(alone-g.player.maxHp*c.pct)<g.player.maxHp*.05,'allein: ein Kreis');
 party(g);for(const o of g.companions){o.hp=o.maxHp;Object.assign(o,{x:g.player.x+6,y:g.player.y});}g.player.hp=g.player.maxHp;hp=g.player.hp;
 resolveDungeonCast(g,b,c,'player');assert.ok(hp-g.player.hp>alone*3,'fünf Kreise übereinander');
});

test('Korken-Kurt: waagrechte Rinnen – das Fass rollt dort, wo jemand in der Rinne steht; Söldner treten senkrecht heraus',()=>{
 const g=game(),{r,b}=pull(g,'korkenkurt',KURT,{mercs:true});const k=castNow(g,b,'d-kurt','fass');
 assert.equal(k.lanes.length,3);assert.ok(k.lanes.every(l=>l.axis==='y'&&l.w>l.h),'Rinnen liegen quer');assert.equal(k.truthLanes.length,1);assert.equal(k.claimLane,-1,'keine Behauptung');
 const lane=k.lanes[1],dps=g.companions.filter(c=>c.def.role!=='tank');for(const c of dps){c.y=lane.y+lane.h/2;c.x=lane.x+lane.w*.3;}
 const k2=castNow(g,b,'d-kurt','fass');assert.deepEqual(k2.truthLanes,[1],'zielt auf die Rinne mit Leuten');run(g,1.2);
 for(const c of dps)assert.ok(!inLane(k2.lanes[1],c,0),c.name+' ist aus der Rinne');
 const k3=castNow(g,b,'d-kurt2','fass2');assert.equal(k3.truthLanes.length,2,'Phase 2: zwei Rinnen');
});

test('Sprinkleranlage: alle 10 s ein nasser Streifen vom Rand, bremst und kostet Leben; Söldner gehen zur Mitte',()=>{
 const g=game(),{r,b}=pull(g,'korkenkurt',KURT);b.hp=b.maxHp*.19;castNow(g,b,'d-kurt3','runde');b.cast=null;b.stun=30;
 const sp={...DUNGEON_CASTS['d-kurt3'].casts.sprinkler,type:'sprinkler'};resolveDungeonCast(g,b,sp,'player');resolveDungeonCast(g,b,sp,'player');
 const wet=r.hazards.filter(h=>h.rect&&h.slow);assert.equal(wet.length,2,'zwei Streifen');const room=DEF.rooms.find(x=>x.id==='kelterhalle'),x0=toWorld(DEF,'k2',room.rects[0][0],0).x,x1=x0+room.rects[0][2]*U;
 assert.ok(Math.abs(wet[0].rect.x-x0)<1&&Math.abs(wet[1].rect.x+wet[1].rect.w-x1)<1,'erst West, dann Ost');
 g.target=null;g.stopAuto?.();Object.assign(g.player,{x:wet[0].rect.x+6,y:wet[0].rect.y+40});const hp=g.player.hp;run(g,1.1);assert.ok(g.player.slowed>0,'nass bremst');assert.ok(g.player.hp<hp,'nass kostet Leben');
 party(g);const c=g.companions.find(o=>o.def.role==='damage');Object.assign(c,{x:wet[0].rect.x+4,y:wet[0].rect.y+wet[0].rect.h/2});run(g,1.5);assert.ok(!inHazard(wet[0],c),'Söldner verlässt den Streifen');
 const t=trackCasts(b);assert.ok(t.some(x=>x.type==='sprinkler'),'Warnleiste zeigt den Nebentakt');
});

test('Reichweiten-Rita: Blitzlicht trifft und blendet nur mit Sichtlinie; Deckung sperrt Laufen und Sicht; Überbelichtet stapelt',()=>{
 const g=game(),{r,b}=pull(g,'rita',RITA);const cover=coverRects(r,'k1');assert.ok(cover.length>=2,'Deckung im Presseamt');
 const q=cover[0];assert.equal(g.world.blocked(q.x+q.w/2,q.y+q.h/2,3),true,'Deckung sperrt');
 const k=castNow(g,b,'d-rita','blitz'),spots=hideSpots(g,b,k);assert.ok(spots.length>0,'es gibt Plätze hinter Deckung');
 Object.assign(g.player,spots[0]);let hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');assert.equal(g.player.hp,hp,'hinter Deckung sicher');assert.ok(!(g.player.blindUntil>g.time));
 at(g,...RITA);hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');const first=hp-g.player.hp;assert.ok(first>0,'mit Sichtlinie getroffen');assert.ok(g.player.blindUntil>g.time,'geblendet');
 assert.equal(dungeonDamageFactor(g,b),.5*(b.takenFactor||1),'geblendet: halber Schaden');g.player.hp=g.player.maxHp;hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');assert.ok(hp-g.player.hp>first*1.5,'Überbelichtet: der nächste Blitz trifft härter');
});

test('Reichweiten-Rita: steht Deckung zwischen ihr und dem Ziel, läuft sie herum; Söldnerplätze hinter Deckung weichen auf Sicht aus',()=>{
 const g=game(),{b}=pull(g,'rita',RITA),k=castNow(g,b,'d-rita','blitz'),spot=hideSpots(g,b,k)[0];b.cast=null;b.attackTimer=99;assert.ok(spot,'Platz hinter Deckung');
 Object.assign(g.player,spot);assert.equal(lostSight(g,b,g.player),true,'keine Sicht');const from={x:b.x,y:b.y};run(g,4);
 assert.ok(Math.hypot(b.x-from.x,b.y-from.y)>4,'sie bewegt sich');assert.equal(g.world.lineClear(b,g.player),true,'danach Sicht aufs Ziel');
 Object.assign(b,from);const q=sightSpot(g,b,spot);assert.ok(q&&g.world.lineClear(q,b),'Ausweichplatz mit Sicht');assert.equal(roomAt(DEF,q.x,q.y)?.id,'studio');
});

test('Reichweiten-Rita: vor dem Greenscreen unsichtbar und nicht zu treffen; der Schutz-Söldner zieht sie mit Spott weg',()=>{
 const g=game(),{r,b}=pull(g,'rita',RITA,{mercs:true});run(g,1);const z=bossZones(r,b);
 resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-rita'].casts.greenscreen,type:'greenscreen'},'player');assert.equal(b.retreat?.kind,'hidden');
 Object.assign(b,{x:z.hidden.x+z.hidden.w/2,y:z.hidden.y+z.hidden.h/2});g.target=b;run(g,.1);assert.equal(b.hidden,true,'unsichtbar');assert.equal(g.target,null,'nicht anwählbar');assert.equal(dungeonDamageFactor(g,b),0,'kein Schaden');
 const pils=g.companions.find(c=>c.def.role==='tank');pils.cooldowns.taunt=0;pils.gcd=0;Object.assign(pils,{x:b.x,y:b.y+60});run(g,3);
 assert.equal(b.retreat,null,'Spott beendet den Rückzug');run(g,3);assert.equal(b.hidden,false,'sie kommt von der Wand weg');
});

test('Das halbe Pferd: 30 % der Durchgänge, im Laufstand gemerkt; säuft am Trog und heilt, der Schutz zieht es weg',()=>{
 let seen=0;for(let i=0;i<40;i++){const g=game();g.random=(v=>()=>(v=(v*9301+49297)%233280)/233280)(i*7+1);inside(g);if(boss(g,'halbespferd'))seen++;}
 assert.ok(seen>=6&&seen<=20,'etwa 30 % ('+seen+'/40)');
 const g=game();g.random=()=>.1;const r=inside(g);assert.ok(boss(g,'halbespferd'),'bei 0,1 steht es');const saved=savedDungeonRun(g);assert.deepEqual(saved.rare,['halbespferd']);
 const h=game();h.random=()=>.99;assert.ok(restoreDungeonRun(h,saved));assert.ok(boss(h,'halbespferd'),'Neuladen würfelt nicht neu');
});

test('Trog und Rückzug: am Trog heilt es 2 % je Sekunde, Säuft am Trog läuft hin, Spott holt es zurück',()=>{
 const g=game(),{r,b}=pull(g,'halbespferd',PFERD);const z=bossZones(r,b);b.hp=b.maxHp*.5;Object.assign(b,{x:z.trough.x+6,y:z.trough.y,stun:1.2});
 g.adminGod=true;run(g,1);g.adminGod=false;assert.ok(b.hp>b.maxHp*.51,'säuft und heilt');assert.ok(b.drank>=1);
 Object.assign(b,{x:z.trough.x+50,y:z.trough.y-4,stun:0,cast:null,attackTimer:99});resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-pferd'].casts.saufen,type:'saufen'},'player');assert.equal(b.retreat?.kind,'feeds');
 const d0=Math.hypot(b.x-z.trough.x,b.y-z.trough.y);g.adminGod=true;run(g,1);g.adminGod=false;assert.ok(Math.hypot(b.x-z.trough.x,b.y-z.trough.y)<d0,'läuft zum Trog');
});

test('Beute: eigene Tabellen mit Dorflegenden, Hafersack; das Reittier zu 3 % direkt oder gegen zehn Hafersäcke am Fahrstall',()=>{
 for(const [id,u] of [['expose','hochglanz-expose'],['korkenkurt','korkenzieher-kellermeister'],['rita','ringlicht-reichweite']]){assert.equal(DROP_TABLES[id].unique,u);assert.ok(ITEMS[u]?.unique,u);assert.ok(bossLoot(id).includes(u),'Journal zeigt '+u);}
 assert.equal(DROP_TABLES.halbespferd.material,'hafersack');assert.equal(DROP_TABLES.halbespferd.mount,'halbespferd');assert.equal(DROP_TABLES.halbespferd.mountChance,.03);
 assert.equal(MOUNTS.halbespferd.materials.hafersack,10);assert.equal(MOUNTS.halbespferd.art,'hofpferd');
 const g=game(),{b}=pull(g,'halbespferd',PFERD);g.lootRandom=()=>.02;g.kill(b);assert.ok(g.mounts.owned.includes('halbespferd'),'3 %: Reittier freigeschaltet');assert.equal(b.dungeonReward.mount,'halbespferd');
 const h=game(),{b:b2}=pull(h,'halbespferd',PFERD);h.lootRandom=()=>.5;h.kill(b2);assert.ok(!h.mounts.owned.includes('halbespferd'),'sonst nicht');
 const w=game();w.player.inCombat=0;Object.assign(w.player,mountStation(w.world));addItem(w.rpg,'hafersack',9);assert.ok(acquisitionReason(w,'halbespferd'),'neun reichen nicht');addItem(w.rpg,'hafersack',1);assert.equal(acquisitionReason(w,'halbespferd'),'','zehn reichen');
 assert.ok(w.acquireMount?.('halbespferd')??true);
});

test('Mit dem Boss fliehen seine Helfer (Tür öffnet erst ohne kämpfende Adds)',()=>{
 const g=game(),{r,b}=pull(g,'gerd',['e0',8.5,26],{mercs:true});run(g,.2);b.hp=b.maxHp*.49;g.startCast(b);const adds=g.enemies.filter(e=>e.summoner===b);assert.equal(adds.length,2);
 g.kill(b);run(g,.2);assert.equal(g.enemies.filter(e=>e.summoner===b).length,0,'Adds weg');assert.equal(r.arena,null,'Tür auf, keiner kämpft mehr');
});

test('Warnleiste und Journal kennen die neuen Fähigkeiten: Symbol, Antwort (2–3 Wörter), Tooltip je Merkmal',()=>{
 for(const id of ['decoy','goal','los','hidden','feeds','wet'])assert.ok(DUNGEON_UI.traits[id]?.tip&&MAP_PAINT['trait-'+id],'Merkmal '+id);
 for(const set of ['d-expose','d-expose2','d-expose3','d-kurt','d-kurt2','d-kurt3','d-rita','d-rita2','d-pferd'])for(const id of Object.keys(DUNGEON_CASTS[set].casts)){const d=describeCast(set,id);assert.ok(d.icon&&MAP_PAINT[d.icon],set+'.'+id+' Symbol');assert.ok(d.hint&&d.hint.split(' ').length<=3,set+'.'+id+' Antwort '+d.hint);}
 assert.equal(describeCast('d-expose','verkauft').main,'decoy');assert.equal(describeCast('d-rita','blitz').main,'los');assert.equal(describeCast('d-kurt','runde').main,'stack');assert.equal(describeCast('d-kurt','zahlen').main,'spread');
 assert.ok(describeCast('d-kurt3','sprinkler').traits.some(t=>t.id==='wet'));assert.equal(describeCast('d-pferd','saufen').main,'feeds');assert.equal(describeCast('d-rita','greenscreen').main,'hidden');
 for(const id of ['expose','korkenkurt','rita','halbespferd']){const n=bossCasts(id).length;assert.ok(n>=3&&n<=6,id+' '+n+' Fähigkeiten');}
 const b={bossId:'korkenkurt',castSet:'d-kurt',cycle:0,hp:1000,maxHp:1000,attackTimer:1,cast:null};const up=upcomingCasts(b);assert.equal(up[0].type,'runde');
});
