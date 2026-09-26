// Dungeon Etappe 3 „Big B“ (E-71, docs/DUNGEON-ETAPPE-3-2026-09-25.md): Behauptung und Nachsatz (lie), Bahnen (line), parallele Timer
// (tracks), Wut (enrage), Geständnis und Beweise, Tresortür mit gefilterten Siegeln, Endtruhe mit Wahl, Erfolg „Der Nachsatz zählt“,
// Farm-Faktor für Wiederholungen am selben Tag, Söldner-Aufstellung nach Rolle und Söldner, die dem Nachsatz folgen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_TEXT,DUNGEON_REWARDS,DUNGEON_FEATS,DUNGEON_UI,COMPANION_RULES,COMPANION_ROLES,DROP_TABLES,describeCast} from '../content/index.js';
import {toWorld,roomAt,floorAt,requiredSeals,doorOpen,resolveDungeonCast,inLane,coneHits,normalizeDungeons,dungeonDamageFactor,evidenceEffects} from '../dungeon.js';
import {takeLoot,ITEMS} from '../rpg.js';
import {upcomingCasts,trackCasts} from '../boss-alerts.js';
import {bossCasts} from '../dungeon-journal.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
const DAY=Date.UTC(2026,8,25,12);
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb'),gerdOf=g=>g.enemies.find(e=>e.bossId==='gerd');
function party(g){for(const id of MERCS)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}return g;}
/** Thronsaal mit offener Tresortür, Big B zieht. */
function pullBigB(g,{mercs=true}={}){const r=inside(g);quiet(g);for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);r.version++;at(g,'k2',52,20);if(mercs)party(g);const b=bigbOf(g);b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;return {r,b};}
/** Zauber `type` aus dem Zaubermuster setId an Big B starten (wie engine.startCast). */
function castNow(g,b,setId,type){b.engaged=true;b.saidPhases=new Set((DUNGEON_BOSSES[b.bossId].phases||[]).filter(p=>b.hp/b.maxHp<=p.at).map(p=>p.at));b.castSet=setId;const set=DUNGEON_CASTS[setId];b.cycle=set.cycle.indexOf(type);b.attackTimer=0;g.startCast(b);assert.equal(b.cast.type,type);return b.cast;}

test('Tresortür verlangt nur die Siegel gebauter Bosse; seit Etappe 4 Teil A alle drei',()=>{
 const door=DEF.doors.find(d=>d.lock?.seals);assert.deepEqual(door.lock.seals,['siegel-gerd','siegel-expose','siegel-kurt'],'Daten bleiben vollständig');
 assert.deepEqual(requiredSeals(DEF,door.lock.seals),['siegel-gerd','siegel-expose','siegel-kurt'],'Gerd, Exposé und Kurt sind gebaut');
 const g=game(),r=inside(g);assert.equal(doorOpen(r,door),false,'ohne Siegel zu');r.seals.add('siegel-gerd');r.version++;assert.equal(doorOpen(r,door),false,'Gerds Siegel allein reicht nicht mehr');
 r.seals.add('siegel-expose');r.seals.add('siegel-kurt');r.version++;assert.equal(doorOpen(r,door),true,'mit allen drei Siegeln offen');
 // Die Filterung bleibt: fehlt ein Siegelträger in DUNGEON_BOSSES, verlangt die Tür sein Siegel nicht.
 const kurt=DUNGEON_BOSSES.korkenkurt;delete DUNGEON_BOSSES.korkenkurt;try{assert.deepEqual(requiredSeals(DEF,door.lock.seals),['siegel-gerd','siegel-expose']);}finally{DUNGEON_BOSSES.korkenkurt=kurt;}
 const pt=toWorld(DEF,'k2',44,24);assert.equal(g.world.blocked(pt.x,pt.y,3),false,'Held kommt durch die Tür');
});

test('Behauptung und Nachsatz (lie): erst die Behauptung, nach tell der Nachsatz; Söldner-Wahrheit erst danach',()=>{
 const g=game(),{b}=pullBigB(g);g.events.length=0;const k=castNow(g,b,'d-bigb','kanone');
 assert.equal(k.told,false);assert.equal(k.tell,1,'Grundwert tell 1,0 s');assert.equal(k.name,k.claimText);assert.match(k.claimText,/LINKS|RECHTS/);
 assert.ok(g.events.some(e=>e.type==='bark'&&e.text===k.claimText),'Big B sagt die Behauptung');
 assert.equal(k.truthLanes.length,1);assert.notEqual(k.truthLanes[0],k.claimLane,'die Wahrheit ist die andere Bahn');
 run(g,.9);assert.equal(b.cast.told,false,'nach 0,9 s noch die Behauptung');
 run(g,.2);assert.equal(b.cast.told,true,'nach 1,0 s der Nachsatz');assert.equal(b.cast.name,k.truthText);
 assert.ok(g.events.some(e=>e.type==='bark'&&e.text===k.truthText),'Big B sagt den Nachsatz');assert.ok(g.events.some(e=>e.type==='sound'&&e.id==='nachsatz'),'mit Ton');
 // Spiegelung: g.random < .5 dreht die Seite und den Wortlaut
 g.random=()=>.1;const m=castNow(g,b,'d-bigb','kanone');assert.equal(m.claimText,DUNGEON_CASTS['d-bigb'].casts.kanone.lie.mirrorClaim);assert.equal(m.claimLane,1);assert.deepEqual(m.truthLanes,[0]);
 // Bodenstellen der Lüge liegen erst mit dem Nachsatz
 g.random=()=>.5;const p=castNow(g,b,'d-bigb2','parkett');assert.equal(p.spots,undefined,'vor dem Nachsatz keine echte Markierung');assert.equal(p.ground,false,'kein Einzelkreis des Renderers');
 run(g,1.15);assert.equal(b.cast.spots?.length,DUNGEON_CASTS['d-bigb2'].casts.parkett.circles,'nach dem Nachsatz sechs Stellen');
});

test('Bahnen (line): Treffer nur in der echten Bahn; wer der Behauptung folgt, läuft hinein',()=>{
 const g=game(),{b}=pullBigB(g,{mercs:false});const base=DUNGEON_CASTS['d-bigb'].casts.kanone;b.lieHits=0;
 const k=castNow(g,b,'d-bigb','kanone'),truth=k.lanes[k.truthLanes[0]],claim=k.lanes[k.claimLane];
 g.player.x=claim.x+claim.w/2;g.player.y=claim.y+claim.h/2;let hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');assert.equal(g.player.hp,hp,'in der behaupteten Bahn sicher');
 g.player.x=truth.x+truth.w/2;hp=g.player.hp;resolveDungeonCast(g,b,{...k},'player');const hit=hp-g.player.hp;
 assert.ok(hit>=g.player.maxHp*base.pct*.8,'in der echten Bahn getroffen ('+hit+')');assert.equal(b.lieHits,1,'Treffer durch eine gelogene Kanonenkugel zählt');
 // Phase 3: zwei Bahnen zugleich, nur die Mitte ist sicher
 const k3=castNow(g,b,'d-bigb3','kanone3');assert.equal(k3.truthLanes.length,2);const mid={x:(k3.lanes[0].x+k3.lanes[0].w+k3.lanes[1].x)/2,y:k3.lanes[0].y+40};
 assert.ok(!k3.truthLanes.some(i=>inLane(k3.lanes[i],mid)),'Mitte frei');assert.ok(inLane(k3.lanes[k3.claimLane],{x:k3.lanes[k3.claimLane].x+5,y:mid.y}),'die behauptete Bahn ist auch echt');
});

test('Parallele Timer (tracks): Siegelring alle 12 s neben dem Hauptzyklus; Zertifikat stapelt, Parade löscht',()=>{
 const g=game(),{b}=pullBigB(g);const tank=g.companions.find(c=>c.def.role==='tank');b.threat={[tank.id]:1e6,player:1};b.focus=tank.id;
 const set=DUNGEON_CASTS['d-bigb'],track=set.tracks[0];assert.equal(track.cast,'siegelring');assert.equal(track.every,12);assert.ok(!set.cycle.includes('siegelring'),'nicht im Hauptzyklus');
 let rings=0,main=0;const seen=new WeakSet();tank.guard=0;for(const c of g.companions)c.hp=c.maxHp;
 for(let t=0;t<30;t+=.05){g.tick(.05);if(b.sideCast&&!seen.has(b.sideCast)){seen.add(b.sideCast);rings++;}if(b.cast&&!seen.has(b.cast)){seen.add(b.cast);main++;}tank.hp=tank.maxHp;tank.guard=0;tank.cooldowns.lid=99;for(const c of g.companions)c.hp=c.maxHp;g.player.hp=g.player.maxHp;}
 assert.ok(rings>=2&&rings<=3,'Siegelring nach 6 s und dann alle 12 s ('+rings+')');assert.ok(main>=3,'Hauptzyklus läuft weiter ('+main+')');
 assert.ok(tank.cert?.stacks>=2,'Zertifikat stapelt auf dem, der Big B hält');
 const before=tank.cert.stacks,hurt=(()=>{const h0=tank.hp;return h0;})();tank.hp=tank.maxHp;
 // mehr erlittener Schaden je Stapel
 const probe=n=>{tank.cert={...tank.cert,stacks:n,until:g.time+30};const h=tank.hp;resolveDungeonCast(g,b,{...set.casts.anwalt,victim:tank.id,target:null},tank);return h-tank.hp;};
 tank.hp=tank.maxHp;const d0=probe(0);tank.hp=tank.maxHp;const d3=probe(3);assert.ok(d3>d0*1.2,'drei Stapel: deutlich mehr Schaden ('+d3+' gegen '+d0+')');
 // Parade (Deckel hoch) löscht
 tank.guard=3;resolveDungeonCast(g,b,{...set.casts.siegelring},tank);assert.equal(tank.cert,null,'Deckel hoch beim Siegelring löscht das Zertifikat');assert.ok(before>=2&&hurt>0);
 // Warnleiste kennt den Nebentakt
 const rows=trackCasts(b);assert.ok(rows.some(r=>r.type==='siegelring'&&r.track),'Warnleiste zeigt den Siegelring mit eigenem Timer');
});

test('Wut (enrage): nach 6 Minuten +50 %, alle 30 s mehr; Rückzug setzt zurück',()=>{
 const g=game(),{b}=pullBigB(g,{mercs:false}),en=DUNGEON_BOSSES.bigb.enrage;g.adminGod=true;const base=b.baseDamage;
 b.fightTime=en.after-.1;run(g,.05);assert.equal(b.mechBoost,1,'vor der Zeitgrenze normal');
 run(g,.2);assert.equal(b.rageFactor,1+en.damage);assert.ok(Math.abs(b.damage-base*(1+en.damage))<1e-9,'Autoangriff +50 %');
 b.fightTime=en.after+en.every+.01;run(g,.05);assert.equal(b.rageFactor,1+2*en.damage,'30 s später noch einmal');
 b.aggro=false;b.ai='roaming';b.hp=b.maxHp;run(g,.05);assert.ok((b.fightTime||0)<1,'Rückzug: Kampfzeit von vorn');assert.equal(b.rageFactor||1,1);assert.equal(b.damage,base,'Rückzug: Wut weg');
});

test('Geständnis: ab 15 % keine Lüge mehr; mit allen drei Beweisen schon ab 30 % und mehr Schaden auf Big B',()=>{
 const g=game(),{b,r}=pullBigB(g,{mercs:false});g.adminGod=true;b.hp=b.maxHp*.16;run(g,.1);assert.ok(!b.confessed);
 b.hp=b.maxHp*.14;run(g,.1);assert.equal(b.confessed,true,'Geständnis bei 15 %');const k=castNow(g,b,'d-bigb3','kanone3');assert.equal(k.told,true,'keine Lüge mehr');assert.equal(k.name,k.truthText);
 assert.equal(dungeonDamageFactor(g,b),1,'ohne Beweise kein Mehrschaden');
 const h=game(),x=pullBigB(h,{mercs:false});h.adminGod=true;for(const id of DEF.evidence.ids)x.r.evidence.add(id);
 const ev=evidenceEffects(x.r);assert.equal(ev.confessAt,.3);assert.ok(ev.noLie.has('parkett')&&ev.noLie.has('kulisse'));
 x.b.hp=x.b.maxHp*.29;run(h,.1);assert.equal(x.b.confessed,true,'mit drei Beweisen bei 30 %');assert.ok(Math.abs(dungeonDamageFactor(h,x.b)-1.1*1.1)<1e-9,'Kirmes-Urkunde +10 %, Geständnis mit Beweisen +10 %');
});

test('Beweise: jede Wirkung sichtbar – Mietvertrag streicht die Lüge des Parketts, Kirmes-Urkunde +10 % Schaden',()=>{
 const g=game(),{b,r}=pullBigB(g,{mercs:false});r.evidence.add('mietvertrag');const p=castNow(g,b,'d-bigb2','parkett');assert.equal(p.told,true,'Parkett ohne Lüge');assert.ok(p.spots?.length,'Stellen sofort');
 const k=castNow(g,b,'d-bigb','kanone');assert.equal(k.told,false,'die Kanonenkugel lügt weiter');
 r.evidence.add('kirmesurkunde');run(g,.05);assert.ok(Math.abs(dungeonDamageFactor(g,b)-1.1)<1e-9);
 for(const id of DEF.evidence.ids){const f=DEF.evidence.effects[id];assert.ok(f.icon&&f.note,id+' hat Symbol und Tooltip');assert.ok(f.noLie||f.taken,id+' hat eine Wirkung');}
 const saved=JSON.parse(JSON.stringify(g.save())).dungeonRun;assert.deepEqual(saved.evidence.sort(),['kirmesurkunde','mietvertrag'],'Beweise im Laufstand');
});

test('Am eigenen Schopf: bricht erst nach zwei Unterbrechungen, sonst heilt Big B 5 %',()=>{
 const g=game(),{b}=pullBigB(g);const k=castNow(g,b,'d-bigb3','schopf');assert.equal(k.interrupts,2);
 const rita=g.companions.find(c=>c.def.id==='merc-radler-rita'),peter=g.companions.find(c=>c.def.id==='merc-pils-peter');for(const c of [rita,peter]){c.x=b.x+30;c.y=b.y;c.cooldowns={};c.gcd=0;}
 for(let t=0;t<3&&b.cast?.type==='schopf';t+=.05){g.tick(.05);g.player.hp=g.player.maxHp;}
 assert.notEqual(b.cast?.type,'schopf','zwei Söldner haben ihn zu zweit unterbrochen');assert.ok((k.broken||0)>=1,'die erste Unterbrechung hat nur gezählt');
 b.hp=b.maxHp*.5;const heal=DUNGEON_CASTS['d-bigb3'].casts.schopf;resolveDungeonCast(g,b,{...heal},'player');assert.ok(Math.abs(b.hp-b.maxHp*.55)<2,'durchgekommen: +5 %');
});

test('Farm-Lücke: Boss-EP beim ersten Sieg des Tages voll, jede Wiederholung am selben Tag ein Drittel; Beute und Marken bleiben',()=>{
 const g=game(),r=inside(g);quiet(g);let gerd=gerdOf(g);const xp0=g.trainingXp;g.kill(gerd);const first=g.trainingXp-xp0;
 assert.equal(gerd.dungeonReward.repeat,false);assert.ok(first>=DUNGEON_BOSSES.gerd.xp,'erster Sieg voll ('+first+')');const marks=g.dungeons['schloss-bigb'].marks;
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;g.player.inCombat=0;assert.ok(g.enterDungeon('schloss-bigb',{force:true}));quiet(g);gerd=gerdOf(g);assert.ok(gerd.hp>0);
 const xp1=g.trainingXp;g.kill(gerd);assert.equal(gerd.dungeonReward.repeat,true);assert.equal(gerd.xp,Math.round(DUNGEON_BOSSES.gerd.xp*DUNGEON_REWARDS.repeatXp),'Wiederholung: ein Drittel');
 assert.equal(g.trainingXp-xp1,gerd.xp,'nur ein Drittel gutgeschrieben');assert.equal(g.dungeons['schloss-bigb'].marks,marks+DUNGEON_REWARDS.marksPerBoss,'Siegelmarken bleiben');assert.ok(g.rpg.loot.some(b=>b.moment&&b.reward?.repeat),'Beute bleibt');
 // Helfer zählen wie ihr Boss – entschieden beim Rufen: Adds des ersten Siegs bleiben voll, auch wenn sie nach dem Boss fallen
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;g.player.inCombat=0;g.enterDungeon('schloss-bigb',{force:true});quiet(g);gerd=gerdOf(g);gerd.aggro=true;gerd.ai='combat';gerd.hp=gerd.maxHp*.49;g.startCast(gerd);
 const adds=g.enemies.filter(e=>e.summoner===gerd);assert.ok(adds.length&&adds.every(a=>a.repeatAdd),'Wiederholung: Helfer mit einem Drittel');const ax=g.trainingXp;g.kill(adds[0]);assert.ok(g.trainingXp-ax<=Math.round(45/3)+1,'Helfer-EP ein Drittel ('+(g.trainingXp-ax)+')');
 const h=game(),r2=inside(h);quiet(h);const gh=gerdOf(h);gh.aggro=true;gh.ai='combat';gh.hp=gh.maxHp*.49;h.startCast(gh);const early=h.enemies.filter(e=>e.summoner===gh);h.kill(gh);const hx=h.trainingXp;h.kill(early[0]);
 assert.ok(early.every(a=>!a.repeatAdd)&&h.trainingXp-hx>=40,'erster Sieg: Helfer voll, auch nach dem Boss gelegt ('+(h.trainingXp-hx)+')');
 // nächster Tag: wieder voll
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;g.clock=()=>DAY+864e5;g.player.inCombat=0;g.enterDungeon('schloss-bigb',{force:true});quiet(g);gerd=gerdOf(g);g.kill(gerd);assert.equal(gerd.dungeonReward.repeat,false,'neuer Tag, volle EP');
 assert.deepEqual(normalizeDungeons(JSON.parse(JSON.stringify(g.dungeons)))['schloss-bigb'].daily.kills,{gerd:1},'Siege je Tag im Spielstand');
});

test('Endtruhe: nach Big B einmal je Durchgang, Wahl aus drei seltenen Teilen plus Siegelmarken, nichts wird angelegt',()=>{
 const g=game(),{b,r}=pullBigB(g,{mercs:false});at(g,'k2',DEF.chest.x,DEF.chest.y);assert.notEqual(g.interaction()?.kind,'dungeonChest','vor Big B keine Truhe');
 const marks0=g.dungeons['schloss-bigb'].marks;g.kill(b);assert.ok(r.killed.has('bigb'));run(g,.1);at(g,'k2',DEF.chest.x,DEF.chest.y-.5);/* Dungeon-Fix 3: die Truhe steht nach Big B mitten im Thronsaal */
 const it=g.interaction();assert.equal(it?.kind,'dungeonChest','Truhe bietet sich an');assert.equal(it.name,DUNGEON_TEXT.chest.name);
 const bag=g.dungeonChest();assert.ok(bag&&bag.choice===1,'Beutel mit Wahl');assert.equal(bag.items.length,DUNGEON_REWARDS.chest.choices);
 for(const e of bag.items)assert.equal(ITEMS[e.id].rarity,'rare','seltene Teile');assert.equal(new Set(bag.items.map(e=>ITEMS[e.id].slot)).size,3,'drei verschiedene Plätze');
 assert.ok(g.dungeons['schloss-bigb'].marks>=marks0+DUNGEON_REWARDS.chest.marks,'Siegelmarken');
 const equipped=JSON.stringify(g.rpg.equipment);assert.equal(takeLoot(g,bag.id),false,'alles nehmen geht nicht');
 assert.ok(takeLoot(g,bag.id,bag.items[1].id),'eins wählen');assert.ok(!g.rpg.loot.some(x=>x.id===bag.id),'der Rest verfällt');assert.equal(JSON.stringify(g.rpg.equipment),equipped,'nichts angelegt');
 assert.equal(g.dungeonChest(),null,'einmal je Durchgang');assert.notEqual(g.interaction()?.kind,'dungeonChest');
 // Hinterausgang in der Schatzkammer
 at(g,'k2',DEF.backExit.x,DEF.backExit.y);assert.equal(g.interaction()?.kind,'dungeonLeave');assert.ok(g.leaveDungeon(),'raus über den Hinterausgang');assert.ok(!g.instance);
});

test('Erfolg „Der Nachsatz zählt“: Big B ohne Treffer durch eine gelogene Kanonenkugel; Abschluss mit Bestzeit im Spielstand',()=>{
 assert.equal(DUNGEON_FEATS.nachsatz.boss,'bigb');
 const g=game(),{b,r}=pullBigB(g,{mercs:false});g.adminGod=true;run(g,3);b.lieHits=1;g.kill(b);assert.deepEqual(g.dungeons['schloss-bigb'].feats,[],'mit Treffer kein Erfolg');
 const h=game(),x=pullBigB(h,{mercs:false});h.adminGod=true;run(h,3);h.events.length=0;h.kill(x.b);const rec=h.dungeons['schloss-bigb'];
 assert.deepEqual(rec.feats,['nachsatz']);assert.ok(h.events.some(e=>e.type==='dungeonFeat'&&e.name==='Der Nachsatz zählt'));assert.deepEqual(x.b.dungeonReward.feats,['nachsatz'],'im Beute-Moment');
 assert.equal(rec.clears,1);assert.ok(rec.best>=3&&rec.best<10,'Bestzeit in Spielsekunden ('+rec.best+')');assert.ok(x.b.dungeonReward.final&&x.b.dungeonReward.daily,'erster Abschluss des Tages mit Tagesbonus');
 const back=normalizeDungeons(JSON.parse(JSON.stringify(h.dungeons)))['schloss-bigb'];assert.deepEqual(back.feats,['nachsatz']);assert.equal(back.best,rec.best);
 assert.deepEqual(normalizeDungeons({'schloss-bigb':{feats:['nachsatz','erfunden']}})['schloss-bigb'].feats,['nachsatz'],'unbekannte Erfolge fallen heraus');
});

test('Söldner-Aufstellung: Schutz dreht Gerd von der Gruppe weg, Nahkampf dahinter, Fernkampf im Fächer; kaum jemand im Kegel',()=>{
 for(const role of Object.values(COMPANION_ROLES))assert.ok(['tank','behind','spread'].includes(role.position));
 const g=game(),r=inside(g);quiet(g);at(g,'e0',8.5,30);party(g);const gerd=gerdOf(g),tank=g.companions.find(c=>c.def.role==='tank');g.adminGod=true;
 gerd.aggro=true;gerd.ai='combat';gerd.threat={[tank.id]:1e6,player:1};gerd.focus=tank.id;let casts=0,inCone=0;const seen=new WeakSet();
 for(let t=0;t<25;t+=.05){g.tick(.05);for(const c of g.companions)c.hp=c.maxHp;gerd.hp=gerd.maxHp;gerd.threat[tank.id]=1e6;
  const k=gerd.cast;if(k?.cone&&!seen.has(k)){seen.add(k);casts++;for(const c of g.companions)if(c!==tank&&coneHits(gerd,k,c,g))inCone++;}}
 assert.ok(casts>=1,'Rausschmiss kam');assert.ok(inCone/casts<=1,'im Mittel höchstens ein Nicht-Tank im Kegel ('+inCone+'/'+casts+')');
 const a=Math.atan2(tank.y-gerd.y,tank.x-gerd.x),behind=g.companions.filter(c=>c!==tank).filter(c=>Math.abs(((Math.atan2(c.y-gerd.y,c.x-gerd.x)-a+Math.PI*3)%(Math.PI*2))-Math.PI)>Math.PI/2);
 assert.ok(behind.length>=2,'die meisten stehen auf der anderen Seite als der Schutz ('+behind.map(c=>c.name)+')');
});

test('Söldner folgen dem Nachsatz, nicht der Behauptung – mit Fehlerquote',()=>{
 assert.ok(COMPANION_RULES.lieError>0&&COMPANION_RULES.lieError<.2,'etwas Fehlerquote');
 const g=game(),{b}=pullBigB(g);const horst=g.companions.find(c=>c.def.id==='merc-hopfen-horst');g.adminGod=true;
 g.random=()=>.5;const k=castNow(g,b,'d-bigb','kanone'),truth=k.lanes[k.truthLanes[0]];horst.x=truth.x+truth.w/2;horst.y=truth.y+truth.h*.6;const x0=horst.x;
 for(let t=0;t<.8;t+=.05){g.tick(.05);horst.hp=horst.maxHp;}assert.ok(Math.abs(horst.x-x0)<20,'während der Behauptung wartet er');
 for(let t=0;t<1.2&&b.cast;t+=.05){g.tick(.05);horst.hp=horst.maxHp;}assert.ok(!inLane(truth,horst,4),'nach dem Nachsatz raus aus der echten Bahn');
 // hereingefallen (Zufall unter lieError): läuft nach der Behauptung in die Gegenbahn
 g.random=()=>0;const f=castNow(g,b,'d-bigb','kanone'),claim=f.lanes[f.claimLane];horst.x=claim.x+claim.w/2;horst.y=claim.y+claim.h*.6;
 for(let t=0;t<.9;t+=.05){g.tick(.05);horst.hp=horst.maxHp;}assert.ok(!inLane(claim,horst,-4),'glaubt der Behauptung und verlässt die genannte Bahn');
});

test('Warnleiste, Journal und Symbole kennen die neuen Merkmale',()=>{
 const d=describeCast('d-bigb','kanone');assert.equal(d.main,'lie');assert.ok(d.traits.some(t=>t.id==='line'));assert.equal(d.hint,'Nachsatz abwarten');
 assert.equal(describeCast('d-bigb','siegelring').main,'tankDebuff');assert.ok(describeCast('d-bigb3','kulisse').traits.some(t=>t.id==='persist'));assert.ok(describeCast('d-bigb3','schopf').traits.some(t=>t.id==='interrupts'));
 for(const id of ['lie','line','tankDebuff','track','persist','interrupts','enrage','reach'])assert.ok(DUNGEON_UI.traits[id]?.name&&DUNGEON_UI.traits[id]?.tip,'Merkmal '+id);
 const casts=bossCasts('bigb').map(c=>c.type);assert.ok(casts.includes('siegelring'),'Journal zeigt den Nebentakt');assert.ok(!casts.includes('kanone3'),'gleiche Fähigkeit nur einmal');
 assert.ok(DROP_TABLES.bigb&&DUNGEON_BOSSES.bigb.family==='bigb','eigene Beutetabelle');for(const id of DROP_TABLES.bigb.items)assert.ok(ITEMS[id],id);
 const g=game(),{b}=pullBigB(g);castNow(g,b,'d-bigb','kanone');const up=upcomingCasts(b,{count:2});assert.equal(up[0].live,b.cast,'laufender Zauber mit Behauptung/Nachsatz');
});
