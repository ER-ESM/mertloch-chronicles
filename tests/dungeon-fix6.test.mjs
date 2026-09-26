// Dungeon-Fix 6 (Prüferin #741, docs/PLAYTEST-2026-09-26-dungeon-bigb-4.md, Bericht docs/DUNGEON-FIX6-2026-09-26.md): Eine passive Heilerin gewann
// Big B mit drei Beweisen und liegender Rita 35 s vor der Wut; die Simulation maß nur den schwersten Laufstand (Rita steht, keine Beweise).
// 1 Wut nach Laufstand: 4:50 → 4:00 (Rita liegt) → 3:35 (dazu die Kirmes-Urkunde); Bossrahmen, Journal und Tooltip nennen den Grund
// 2 Live-Fall mit dem echten Testzugang (playtest-save --preset=bigb --class=baerbel --spec=baerbel-care), gleiches Verhalten: mit den Regeln von
//   #741 gewinnt die Gruppe um 4:10 wie live, jetzt verliert sie
// 3 Einsatz-Zeile: „Einsatz“ sichtbar, Warnungen als Anzahl und Punkte, Ausweichen immer
// 4 Truppenrahmen: Angefeuert, eigene HoTs und Schilde, Letztes Aufgebot; Ausrufe auch im Bosskampf mit Text
// 5 Kleinere Punkte: toter Held „Söldner warten“, Rückblick je Tod neu, eingehender Treffer nennt die Fähigkeit, Plakette des Freundes,
//   Säule blendet aus, Todesfenster neben dem Bossrahmen, Eingangskarte schlägt fehlende Rollen vor
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,EINSATZ_TEXT as T,COMPANION_UI} from '../content/index.js';
import {toWorld,enrageInfo,enrageAfter,addressBoss,bossReady,pullBoss,engageBoss} from '../dungeon.js';
import {einsatzChips,einsatzBossChips,enrageTip,enrageClock} from '../dungeon-einsatz-ui.js';
import {rallyActive} from '../dungeon-einsatz.js';
import {frameBuffs} from '../companion-ui.js';
import {missingRoles,entryCard} from '../dungeon-entry.js';
import {kitItemOccludes} from '../kit-art.js';
import {deathRecap} from '../death-screen.js';
import {buildPlaytestSave} from '../scripts/playtest-save.mjs';
import {startAuto} from '../auto-combat.js';
import {changeSpec} from '../talents.js';

const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const world=new World(JSON.parse(src('data/mertloch.json')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
function game(spec){const g=new Game(world,{level:10,tutorial:{version:1,step:8,completed:true},...(spec?{classId:spec.split('-')[0]}:{})},{});if(spec)changeSpec(g,spec);g.toast=()=>{};g.random=()=>.5;g.clock=()=>Date.UTC(2026,8,26,12);return g;}
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
/** Im Dungeon an Gerds Tür, alle vier Söldner dabei, Trash weg (wie tests/dungeon-aktiv.test.mjs). */
function atGerd(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}));for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}for(const id of MERCS)g.hireCompanion(id,{free:true});
 Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,'e0',8.5,26)),9));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}return g.enemies.find(e=>e.bossId==='gerd');}

// ── 1 · Wut nach Laufstand ─────────────────────────────────────────────────────────────────────────────────────────────────────
test('Wut nach Laufstand: 4:50 ohne alles, 4:00 wenn Rita liegt, 3:35 mit der Kirmes-Urkunde; andere Bosse unverändert', ()=>{
 const en=DUNGEON_BOSSES.bigb.enrage,mk=(killed=[],evidence=[])=>({killed:new Set(killed),evidence:new Set(evidence)});
 assert.equal(enrageAfter(mk(),'bigb'),290);assert.equal(enrageAfter(null,'bigb'),290,'ohne Laufstand die Grundzeit');
 assert.equal(enrageAfter(mk(['rita']),'bigb'),240);
 assert.equal(enrageAfter(mk(['rita'],['mietvertrag','leihschein']),'bigb'),240,'Mietvertrag und Leihschein streichen nur Lügen');
 assert.equal(enrageAfter(mk(['rita'],DEF.evidence.ids),'bigb'),215);
 assert.deepEqual(en.sooner,{rita:50,kirmesurkunde:25});
 for(const id of ['gerd','expose','korkenkurt'])assert.equal(enrageAfter(mk(['rita'],DEF.evidence.ids),id),DUNGEON_BOSSES[id].enrage.after,id);
 const info=enrageInfo(mk(['rita'],DEF.evidence.ids),'bigb');assert.equal(enrageClock(DUNGEON_BOSSES.bigb,info),'3:35');assert.equal(enrageClock(DUNGEON_BOSSES.bigb),'4:50');
 const tip=enrageTip(DUNGEON_BOSSES.bigb,info);assert.match(tip,/Nach 3:35 min/);assert.match(tip,/Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25/);
 assert.doesNotMatch(enrageTip(DUNGEON_BOSSES.bigb),/Früher/);
 assert.match(DEF.evidence.effects.kirmesurkunde.note,/0:25 früher/,'die Lupe im Bossrahmen nennt es');
 for(const f of ['boss-alerts.js','dungeon-journal.js'])assert.match(src(f),/enrageInfo\(run,/,f+' nutzt die Wut nach Laufstand');
});
test('Wut nach Laufstand: im Kampf bricht sie mit Rita und allen Beweisen nach 215 s aus', ()=>{
 const g=game();assert.ok(g.enterDungeon('schloss-bigb',{force:true}));for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
 const r=g.dungeonRun;r.killed.add('rita');for(const id of DEF.evidence.ids)r.evidence.add(id);const big=g.enemies.find(e=>e.bossId==='bigb');
 Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,'k2',54,20)),9));engageBoss(g,big);g.adminGod=true;
 big.fightTime=214.8;run(g,.1);assert.equal(big.rageFactor||1,1,'vor 215 s keine Wut');run(g,.3);assert.ok(big.rageFactor>1,'nach 215 s Wut');
});

// ── 2 · Live-Fall mit dem echten Testzugang ────────────────────────────────────────────────────────────────────────────────────
/** Wie die Prüferin: Testzugang bigb, Bärbel Heilung, typische Ausrüstung, vier Söldner, drei Beweise. Im Thronsaal ansprechen (Beweise vorlegen),
 *  nach der Rede einmal angreifen (zieht Big B), Autoangriff aus, dann nichts mehr – kein Laufen, kein Ausweichen. Tot bleibt sie liegen, bis
 *  Schorle-Susi aufhilft. → {won, time, deaths} */
function livePassive({sooner}={}){
 const built=buildPlaytestSave({preset:'bigb',classId:'baerbel',spec:'baerbel-care',gear:'typical'}),g=new Game(world,built.save,{});g.toast=()=>{};g.clock=()=>Date.now();
 const en=DUNGEON_BOSSES.bigb.enrage,keep=en.sooner;if(sooner)en.sooner=sooner;
 try{assert.equal(g.instance?.kind,'dungeon','Laufstand geladen');assert.equal(g.companions.length,4);
  const run2=g.dungeonRun;assert.ok(run2.killed.has('rita'),'Rita liegt');assert.equal(run2.found.size+run2.evidence.size,3,'drei Beweise gefunden');
  for(const e of g.enemies)if(!e.dungeonBoss)e.respawnAt=Infinity;
  Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,'k2',59,17)),9));for(const c of g.companions){const q=g.world.findClear(g.player.x-20,g.player.y+14,9);c.x=q.x;c.y=q.y;}
  const big=g.enemies.find(e=>e.bossId==='bigb');assert.ok(addressBoss(g,big),'angesprochen');for(let t=0;t<40&&!bossReady(g,big);t+=.05)g.tick(.05);
  assert.equal(run2.evidence.size,3,'vorgelegt');g.target=big;startAuto(g);let t=0,deaths=0,rage=1;
  for(;t<420&&big.hp>0;t+=.05){if(big.aggro&&g.autoAttack.enabled)g.stopAuto();g.moveTo=null;g.tick(.05);rage=Math.max(rage,big.rageFactor||1);for(const ev of g.events)if(ev.type==='death')deaths++;g.events.length=0;if(g.dungeonRun?.ghost?.wiped||!big.aggro&&big.fightTime===0&&t>30)break;}
  return {won:!(big.hp>0),time:Math.round(t),deaths,rage};
 }finally{en.sooner=keep;}
}
test('Live-Fall #741 im Spiel nachgestellt: mit den Regeln von #741 gewinnt die passive Heilerin um 4:10, jetzt nicht mehr', ()=>{
 const before=livePassive({sooner:{}});if(process.env.FIX6_VERBOSE)console.log("Live-Fall vorher",JSON.stringify(before));
 assert.equal(before.won,true,'vorher: Sieg ohne Zutun (live: nach ≈ 250 s)');assert.ok(before.time>=225&&before.time<=285,'vorher '+before.time+' s');
 const now=livePassive();if(process.env.FIX6_VERBOSE)console.log("Live-Fall jetzt",JSON.stringify(now));assert.equal(now.won,false,'jetzt: kein Sieg ohne Zutun ('+JSON.stringify(now)+')');assert.ok(now.rage>1,'die Wut hat zugeschlagen');
});

// ── 3 · Einsatz-Zeile ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Einsatz-Zeile: „Einsatz“ steht sichtbar, Warnungen als Anzahl und Punkte, Ausweichen immer', ()=>{
 const x={role:'heal',damage:0,healing:0,hold:0,interrupts:0,dodges:0,warn:21,warnOk:10,deaths:2,rally:6,seconds:250,parts:{share:0,interrupt:0,warn:14,death:-50},score:0,bonus:0,tier:null};
 const html=einsatzChips(x),text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 assert.match(html,/data-einsatz-part="score"[^>]*>.*<small>Einsatz<\/small><b>0<\/b>/,'Wort am Punkte-Chip');
 assert.match(html,/data-einsatz-part="dodges"/,'Ausweichen auch mit 0');assert.match(html,/data-einsatz-part="warn"[^>]*data-tooltip-note="10 von 21[^"]*Das sind 14 von 30 Punkten\."/,'Warnungen: Anzahl und Punkte');
 assert.match(html,/data-tooltip-note="Punkte: Anteil 0 · Unterbrechen 0 · Warnungen 14 \(10\/21\) · Tode -50 = 0 von 100\."/,'Punkte-Tooltip mit Anzahl');
 assert.ok(text.length<80,'kurz: '+text);
 for(const k of ['score','healing','interrupts','warn','dodges','deaths','rally','bonus'])assert.match(html,new RegExp('data-einsatz-part="'+k+'"'),k);
});

// ── 4 · Truppenrahmen und Ausrufe ─────────────────────────────────────────────────────────────────────────────────────────────
test('Truppenrahmen: Angefeuert, deine Heilung über Zeit und dein Schild, Letztes Aufgebot – höchstens drei', ()=>{
 const g=game();assert.ok(g.enterDungeon('schloss-bigb',{force:true}));for(const id of MERCS)g.hireCompanion(id,{free:true});
 const gerd=g.enemies.find(e=>e.bossId==='gerd'),peter=g.companions[0];assert.deepEqual(frameBuffs(g,peter),[]);
 gerd.aggro=true;gerd.ai='combat';g.target=gerd;run(g,.1);g.damage(gerd,50,'Kelle');run(g,.1);assert.ok(rallyActive(g));
 let b=frameBuffs(g,peter);assert.equal(b[0].id,'rally');assert.equal(b[0].item,'megaphone');assert.ok(b[0].remaining>0);
 peter.aidHot={remaining:5,power:10,tick:1};peter.aidBuff={name:'Stärkung',remaining:8,shield:120};peter.lastStand={until:g.time+10};
 b=frameBuffs(g,peter);assert.deepEqual(b.map(x=>x.id),['rally','hot','shield'],'höchstens drei, Angefeuert zuerst');assert.equal(b[2].shield,120);
 peter.state='down';assert.deepEqual(frameBuffs(g,peter),[],'am Boden nichts');
 const ui=src('companion-ui.js');assert.match(ui,/class="cf-buffs"/);assert.match(ui,/buffNote\(buffs\)/,'Namen und Restzeit im Tooltip des Rahmens');
 assert.match(src('icon-steps.css'),/\/\* stufe:unitBuff \*\/\s*\.companion-frame \.cf-buffs canvas\{width:24px!important;height:24px!important/);
 assert.equal(typeof COMPANION_UI.buffs.left,'function');
 const css=src('dungeon-fix6.css');assert.match(css,/grid-template-columns:minmax\(0,1fr\) 76px/,'drei 24er-Plätze neben dem Lebensbalken');
});
test('Ausrufe über den Söldnern sind groß und stehen auch im Bosskampf mit Text', ()=>{
 const g=game(),gerd=atGerd(g);
 const seen=[];g.sct=d=>{seen.push(d);return true;};gerd.aggro=true;gerd.ai='combat';g.target=gerd;run(g,.1);g.damage(gerd,50,'Kelle');run(g,.2);
 const shouts=seen.filter(d=>d.text===T.rally.shout);assert.equal(shouts.length,4,'über jedem Söldner');assert.ok(shouts.every(d=>d.callout&&d.actor&&d.iconKey==='megaphone'));
 assert.match(src('combat-text.js'),/e\.callout\?' sct-callout':''/);assert.match(src('dungeon-fix6.css'),/body\.boss-fight #sct \.sct-companion \.sct-note \.sct-row\.sct-callout>b\{display:inline!important\}/);
});

// ── 5 · Kleinere Punkte ────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Toter Held: der Bossrahmen zeigt „Söldner warten“ mit eigenem Tooltip', ()=>{
 const g=game(),gerd=atGerd(g);gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.damage(gerd,50,'Kelle');run(g,.1);g.die('Test');run(g,.1);
 const c=einsatzBossChips(g,gerd).find(x=>x.id==='rally');assert.ok(c,'Chip da');assert.equal(c.text,T.rally.idle);assert.match(c.note,/Du liegst/);
});
test('Todesrückblick wird je Tod neu gebaut; gleiche Anteils-Treffer ergeben gleiche Zahlen', ()=>{
 const g=game(),e={name:'Big B',x:g.player.x+20,y:g.player.y,damage:1,lastCast:{name:'Ritt auf der Kanonenkugel',title:'Ritt auf der Kanonenkugel'}};
 const deathAt=[];g.on?.('death',ev=>deathAt.push(ev));const first=()=>{g.player.hp=g.player.maxHp;g.hitPlayer(e,0,false,.3);g.hitPlayer(e,0,false,.3);g.hitPlayer(e,0,false,.7);};
 const recs=[];const emit=g.emit.bind(g);g.emit=(t,d)=>{if(t==='death')recs.push(deathRecap(d.recent));return emit(t,d);};
 first();assert.ok(g.dead);g.dead=false;g.player.hp=g.player.maxHp;g.time+=30;first();assert.equal(recs.length,2);
 assert.deepEqual(recs[1].rows.map(r=>r.amount),recs[0].rows.map(r=>r.amount),'Anteil am Höchstleben: gleiche Zahlen, weil der Ablauf gleich war');
 g.dead=false;g.player.hp=g.player.maxHp;g.time+=30;e.lastCast={name:'Pappkulisse fällt',title:'Pappkulisse fällt'};g.hitPlayer(e,0,false,.5);e.lastCast={name:'Ritt auf der Kanonenkugel',title:'Ritt auf der Kanonenkugel'};g.hitPlayer(e,0,false,.7);
 assert.equal(recs.length,3);assert.notDeepEqual(recs[2].rows.map(r=>r.amount),recs[0].rows.map(r=>r.amount),'anderer Ablauf, anderer Rückblick');
});
test('Eingehender Treffer nennt die Fähigkeit statt nur den Boss', ()=>{
 const g=game(),seen=[];g.sct=d=>{seen.push(d);return true;};const e={name:'Big B',x:g.player.x+20,y:g.player.y,damage:1,lastCast:{name:'Ritt auf der Kanonenkugel'}};
 g.hitPlayer(e,0,false,.2);assert.equal(seen.find(d=>d.area==='in'&&d.kind==='damage').text,'Ritt auf der Kanonenkugel');
 seen.length=0;e.lastCast=null;g.hitPlayer(e,30,false);assert.equal(seen.find(d=>d.area==='in'&&d.kind==='damage')?.text,'Big B','Autoangriff nennt den Angreifer');
});
test('Zielrahmen eines Freundes: die Plakette zeigt seine Stufe', ()=>{
 assert.match(src('app.js'),/Truppenrahmen „11“\): die Plakette zeigt data-level[^*]*\*\/const lv=\$\('#targetLevel'\),n=String\(friend\.level\?\?''\);if\(lv\.dataset\.level!==n\)\{lv\.dataset\.level=n;/);
});
test('Requisiten: steht der Held dahinter, blendet das Teil aus – niedrige Teile und davor stehende Figuren nicht', ()=>{
 const pillar={sprite:'__keins__',minX:100,maxX:116,minY:90,maxY:100,w:16,height:40},low={...pillar,height:4};
 assert.equal(kitItemOccludes(pillar,{x:108,y:80}),true,'hinter der Säule');assert.equal(kitItemOccludes(pillar,{x:108,y:104}),false,'davor');
 assert.equal(kitItemOccludes(pillar,{x:140,y:80}),false,'daneben');assert.equal(kitItemOccludes(pillar,{x:108,y:40}),false,'weit dahinter, ganz sichtbar');
 assert.equal(kitItemOccludes(low,{x:108,y:95}),false,'niedrig');
 assert.match(src('renderer.js'),/drawDungeonProp\(c,e,\[p,\.\.\.\(g\.target\?\.hp>0\?\[g\.target\]:\[\]\)\]\)/);assert.match(src('dungeon-scenery-art.js'),/PROP_FADE=\.38/);
});
test('Todesfenster: am Desktop neben dem Bossrahmen, sonst wie bisher darunter', ()=>{
 const s=src('death-screen.js');assert.match(s,/function placeSide\(\)/);assert.match(s,/right:fr\.right\+gap,left:fr\.left-gap-w/);assert.match(s,/if\(placeSide\(\)\)return;/);
 assert.match(s,/BLOCKERS=\['\.player-panel','#minimap','\.quest-tracker','\.boss-alerts','#unitGroupDock','#targetPanel'\]/);
});
test('Eingangskarte: fehlende Rollen vorn und leuchtend, doppelte Heilung neben einer Heilerin gedämpft – die Wahl bleibt', ()=>{
 const g=game('baerbel-care');g.rpg.coins=999;g.player.level=10;
 assert.deepEqual(missingRoles(g),{tank:1,heal:0,damage:3});
 const html=entryCard(g),offers=[...html.matchAll(/class="dg-offer([^"]*)" data-dg-hire="([^"]+)" data-role="(\w+)"/g)].map(m=>({cls:m[1].trim(),id:m[2],role:m[3]}));
 assert.equal(offers.length,6,'alle Söldner bleiben wählbar');assert.ok(offers.slice(0,4).every(o=>o.cls==='dg-suggest'),'vorn die fehlenden Rollen');
 assert.deepEqual(offers.filter(o=>o.cls==='dg-double').map(o=>o.role),['heal','heal'],'doppelte Heilung hinten');
 assert.deepEqual([...html.matchAll(/data-dg-need="(\w+)"/g)].map(m=>m[1]),['tank','damage','damage','damage'],'freie Plätze zeigen die fehlende Rolle');
 for(const id of MERCS)g.hireCompanion(id,{free:true});assert.deepEqual(missingRoles(g),{tank:0,heal:-1,damage:1},'Testzugang-Gruppe: Heilung doppelt');
 const tank=game('dieter-wall');assert.deepEqual(missingRoles(tank),{tank:0,heal:1,damage:3});
});
