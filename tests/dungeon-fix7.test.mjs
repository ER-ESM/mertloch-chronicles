// Dungeon-Fix 7 (Prüferin #770, docs/PLAYTEST-2026-09-26-dungeon-bigb-5.md, Bericht docs/DUNGEON-FIX7-2026-09-26.md): Die passive Gruppe gewann Big B unter
// „Wut ×4“ – zwei Schadens-Söldner legten mit dem Letzten Aufgebot die letzten 4 %.
// 1 Wut ist ein harter Wipe: Wutwelle auf die ganze Gruppe, Ausweichen schützt unter Wut nicht; die Gruppe liegt wenige Sekunden nach dem Ausbruch
// 2 Live-Fall #770 im echten Spiel (Testzugang der Prüferin, Takt wie im Browser): mit den Regeln von #770 gewonnen, jetzt Wipe; aktiv mit Luft gewonnen
// 3 Big B ist bis „bereit“ nicht angreifbar (kein Autoangriff, kein Pull, Rechtsklick läuft)
// 4 Todesfenster: sofort, anstehende Rettung mit Namen und Balken
// 5 Verbrauchsgüter-Tooltip nach WoW-Muster, Laufzeitwerte sichtbar · Einsatz-Zeile · Big B ×1,5 · Kopfzeile der Kniffe einzeilig · Wut-Tooltip
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,EINSATZ_RULES,EINSATZ_TEXT as T,DEATH_UI} from '../content/index.js';
import {ITEMS} from '../rpg.js';
import {toWorld,enrageAfter,addressBoss,bossReady,bossUnready,pullBoss,ghostState} from '../dungeon.js';
import {bossAutoFactor} from '../dungeon-einsatz.js';
import {einsatzChips,enrageTip} from '../dungeon-einsatz-ui.js';
import {startAuto} from '../auto-combat.js';
import {describeCard} from '../describe-ui.js';
import {skillTooltip} from '../combat-ui.js';
import {dungeonScale} from '../dungeon-actors.js';
import {spriteHit} from '../target-ui.js';
import {changeSpec} from '../talents.js';
import {serieRun} from '../scripts/dungeon-serie.mjs';

const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const world=new World(JSON.parse(src('data/mertloch.json')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
function game(spec){const g=new Game(world,{level:10,tutorial:{version:1,step:8,completed:true},...(spec?{classId:spec.split('-')[0]}:{})},{});if(spec)changeSpec(g,spec);g.toast=()=>{};g.random=()=>.5;g.clock=()=>Date.UTC(2026,8,26,12);return g;}
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
function atBoss(g,id){assert.ok(g.enterDungeon('schloss-bigb',{force:true}));for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}for(const m of MERCS)g.hireCompanion(m,{free:true});
 const boss=g.enemies.find(e=>e.bossId===id),room=DEF.rooms.find(r=>r.id===boss.dungeonBoss.room);Object.assign(g.player,g.world.findClear(boss.x+20,boss.y+30,9));
 for(const c of g.companions){const q=g.world.findClear(boss.x-10+Math.random()*20,boss.y+16,9);c.x=q.x;c.y=q.y;}assert.ok(room);return boss;}
/** Rules von #770 für einen Vergleich: Wut ohne Wutwelle, Ausweichen hält auch unter Wut. */
function rules770(fn){const W=EINSATZ_RULES.enrage,keep={pct:W.wave.pct,evade:W.evade};W.wave.pct=0;W.evade=true;try{return fn();}finally{W.wave.pct=keep.pct;W.evade=keep.evade;}}

// ── 1 · Wut ist ein harter Wipe ────────────────────────────────────────────────────────────────────────────────────────────────
test('Wutwelle: Zahlen im Inhalt, Ausweichen schützt unter Wut nicht', ()=>{
 assert.deepEqual(EINSATZ_RULES.enrage.wave,{every:2,pct:.08});assert.equal(EINSATZ_RULES.enrage.evade,false);
 for(const id of ['gerd','expose','korkenkurt','bigb'])assert.ok(T.enrage.wave[id],'Name der Wutwelle: '+id);
 const g=game(),gerd=atBoss(g,'gerd'),rita=g.companions.find(c=>c.id==='merc-radler-rita');rita.evade={until:g.time+8};
 gerd.rageFactor=1;assert.equal(bossAutoFactor(g,gerd,rita),0,'vor der Wut: Ausweichen hält');gerd.rageFactor=2.5;assert.equal(bossAutoFactor(g,gerd,rita),1,'unter Wut: nicht mehr');
 rules770(()=>assert.equal(bossAutoFactor(g,gerd,rita),0,'Regeln #770: Ausweichen hielt auch unter Wut'));
});
for(const id of ['gerd','expose','korkenkurt','bigb'])test('Harter Wipe an '+id+': nach dem Ausbruch liegt die ganze Gruppe spätestens nach 20 s – auch wer ausweicht und nicht Ziel ist', ()=>{
 const g=game(),boss=atBoss(g,id);if(id==='bigb'){g.dungeonRun.killed.add('rita');for(const b of DEF.evidence.ids)g.dungeonRun.evidence.add(b);}
 boss.aggro=true;boss.ai='combat';boss.engaged=true;g.target=null;const after=enrageAfter(g.dungeonRun,id);boss.fightTime=after-.05;
 const rita=g.companions.find(c=>c.id==='merc-radler-rita');rita.evade={until:g.time+30};let t=0,waves=0;g.on?.('dungeonEnrageWave',()=>waves++);
 for(;t<25&&!(g.dead&&g.companions.every(c=>c.state==='down'));t+=.05){g.tick(.05);if(g.dungeonRun?.ghost?.wiped)break;}
 assert.ok(g.dead,id+': Held liegt');assert.ok(g.companions.every(c=>c.state==='down'||c.hp<=0),id+': alle Söldner liegen ('+g.companions.map(c=>c.name+' '+c.state).join(', ')+')');
 assert.ok(t<=20.5,id+': Wipe nach '+t.toFixed(1)+' s');assert.ok(boss.waves>=3,id+': Wutwellen '+boss.waves);
});
test('Wutwelle ist sichtbar und benannt: Einblendung, Todesrückblick nennt sie', ()=>{
 const s=src('dungeon.js');assert.match(s,/function enrageWave\(g,e,en,after,dt\)/);assert.match(s,/emitCombatFx\(g,'burst',e,\{hostile:true/);assert.match(s,/e\.lastCast=\{name,title:name\};if\(!g\.dead\)g\.hitPlayer\(e,0,false,share\)/);
});

// ── 2 · Live-Fall #770 im echten Spiel ─────────────────────────────────────────────────────────────────────────────────────────
test('Live-Fall #770 im echten Spiel (Testzugang, Heilerin, 20 s Autoangriff, dann passiv): Regeln #770 gewonnen unter Wut, jetzt Wipe kurz nach der Wut', ()=>{
 const before=rules770(()=>serieRun({role:'heal',variant:'i',seed:12}));if(process.env.FIX7_VERBOSE)console.log('vorher',JSON.stringify(before));
 assert.equal(before.won,true,'Regeln #770: gewonnen wie live ('+JSON.stringify(before)+')');assert.ok(before.time>before.enrage+15,'erst unter „Wut ×4“: '+before.time+' s');
 const now=serieRun({role:'heal',variant:'i',seed:12});if(process.env.FIX7_VERBOSE)console.log('jetzt',JSON.stringify(now));
 assert.equal(now.won,false,'jetzt verloren');assert.ok(now.time-now.enrage<=20,'Wipe '+(now.time-now.enrage)+' s nach der Wut');assert.equal(now.enrage,215);
});
test('Aktiv im echten Spiel (Heilerin heilt, weicht aus, pariert): Sieg mit Luft vor der Wut und Einsatz-Bonus', ()=>{
 const r=serieRun({role:'heal',variant:'aktiv',seed:3});assert.equal(r.won,true,JSON.stringify(r));assert.ok(r.time<=r.enrage-40,'Sieg nach '+r.time+' s, Wut '+r.enrage);assert.ok(r.bonus>=1,'Einsatz '+r.einsatz);
});

// ── 3 · Big B bis „bereit“ nicht angreifbar ───────────────────────────────────────────────────────────────────────────────────
test('Big B während der Rede: kein Autoangriff, kein Pull; ab „bereit“ zieht der Angriff', ()=>{
 const g=game(),big=atBoss(g,'bigb');assert.equal(bossUnready(g,big),true,'vor der Rede');g.target=big;assert.equal(startAuto(g),false,'kein Autoangriff vor der Rede');
 assert.ok(addressBoss(g,big),'angesprochen');run(g,.5);assert.equal(bossUnready(g,big),true,'Rede läuft');
 g.target=big;assert.equal(startAuto(g),false,'kein Autoangriff in der Rede');g.autoAttack.enabled=true;run(g,.2);assert.equal(g.autoAttack.enabled,false,'ein laufender Autoangriff geht aus');
 for(let t=0;t<40&&!bossReady(g,big);t+=.05)g.tick(.05);assert.ok(bossReady(g,big),'bereit');assert.equal(big.aggro,false,'nichts hat gezogen');
 assert.equal(bossUnready(g,big),false);g.target=big;assert.equal(startAuto(g),true,'ab „bereit“ geht der Angriff');
 const a=src('app.js');assert.match(a,/if\(u\?\.kind==='enemy'&&bossUnready\(game,u\.ref\)\)\{[^}]*game\.navigate\(p\);events\(\);\}/,'Rechtsklick läuft nur');
});

// ── 4 · Todesfenster ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Todesfenster: sofort da, anstehende Rettung mit Namen („Schorle-Susi hilft dir gleich auf“)', ()=>{
 const g=game(),big=atBoss(g,'bigb');addressBoss(g,big);for(let t=0;t<40&&!bossReady(g,big);t+=.05)g.tick(.05);pullBoss(g,big);run(g,1);
 g.hitPlayer(big,0,false,5);run(g,.1);assert.ok(g.dead);const st=ghostState(g);assert.ok(st.fight);
 const susi=g.companions.find(c=>c.id==='merc-schorle-susi');assert.ok(st.reviver?.name==='Schorle-Susi'||st.soon==='Schorle-Susi','Susi hilft gleich bzw. schon auf: '+JSON.stringify(st));
 susi.channel=null;susi.reviveUsed=false;assert.equal(ghostState(g).soon,'Schorle-Susi','Aufhelfen noch frei: angekündigt');assert.equal(DEATH_UI.dungeon.soon('Schorle-Susi'),'Schorle-Susi hilft dir gleich auf');
 susi.reviveUsed=true;assert.equal(ghostState(g).soon,null,'schon benutzt: keine Rettung mehr angekündigt');
 const s=src('death-screen.js');assert.match(s,/if\(place\)el\.classList\.add\('show'\);/,'im Dungeon sofort sichtbar');assert.match(s,/else if\(!open&&g\?\.dead&&dungeonCheckpoint\(g\)\)show\(lastEv\|\|\{\}\)/,'liegt der Held, kommt das Fenster wieder');
 assert.match(src('dungeon-fix7.css'),/\.death-screen\.ds-dungeon\{transition:none\}/);
});

// ── 5 · Tooltips, Einsatz, Big B, Kopfzeile ───────────────────────────────────────────────────────────────────────────────────
test('Verbrauchsgüter: Tooltip nach WoW-Muster (Name, Stapel, Kopfzeile, ein Satz, eine Zahl, ⇧ Details), Laufzeitwerte sichtbar', ()=>{
 assert.doesNotMatch(src('popup-ui.css'),/\.is-live b\{color:var\(--green/,'--green ist der Fenstergrund – die Werte waren unsichtbar');
 const g=game('baerbel-care'),list=Object.entries(ITEMS).filter(([,d])=>d.kind==='consumable');assert.ok(list.length>=8);
 for(const [id,d] of list){g.rpg.inventory=[{id,count:3}];const html=describeCard(g,'item',id);assert.match(html,/describe-consumable/,id);
  const head=html.split('<div class="describe-details"')[0],text=head.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  assert.match(head,/<div class="tip-meta">Verpflegung · 15 s Abklingzeit, geteilt<\/div>/,id+': Kopfzeile');assert.match(head,/<small>Stapel 3<\/small>/,id);
  const nums=head.match(/<p class="tip-numbers">([^<]+)<\/p>/)?.[1]||'';assert.ok(nums&&!/…|undefined|NaN/.test(nums),id+': Zahlenzeile „'+nums+'“');
  if(d.heal)assert.match(nums,new RegExp('Heilt \\d+'),id);if(d.energy)assert.match(nums,/\+\d+ /,id);
  assert.ok(text.length<=215,id+': kurz ('+text.length+'): '+text);assert.match(html,/describe-details" hidden>.*<dl class="describe-numbers">/,id+': alle Zahlen in den Details');}
 const brezel=describeCard(g,'item','brezel');assert.match(brezel,/Heilt 160/);assert.match(brezel,/⇧ Details/);
});
test('Einsatz-Zeile: jedes Feld nennt Name und Wert, der Punkte-Tooltip führt alle Felder (auch Ausweichen), Angefeuert mit dem Megafon', ()=>{
 const x={role:'heal',damage:0,healing:0,hold:0,interrupts:0,dodges:0,warn:20,warnOk:6,deaths:2,rally:11,seconds:250,parts:{share:0,interrupt:0,warn:9,death:-50},score:0,bonus:0,tier:null};
 const html=einsatzChips(x),labels=[...html.matchAll(/data-einsatz-part="(\w+)"[^>]*data-tooltip-label="([^"]*)"/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(labels,[['score','Einsatz 0'],['healing','Heilungsanteil 0 %'],['interrupts','Unterbrechungen 0'],['warn','Warnungen 6/20'],['dodges','Ausweichen 0'],['deaths','Tode 2'],['rally','Angefeuert 11 %'],['bonus','Kein Einsatz-Bonus']]);
 const note=html.match(/data-einsatz-part="score"[^>]*data-tooltip-note="([^"]*)"/)[1];
 for(const w of ['Heilungsanteil 0 %','Unterbrechungen 0','Warnungen 6/20','Ausweichen 0','Tode 2','Angefeuert 11 %','Einsatz-Bonus –','Punkte:'])assert.ok(note.includes(w),'Sammel-Tooltip: '+w+' in „'+note+'“');
 assert.match(html,/data-einsatz-part="rally"[^>]*><canvas width="24" height="24" data-item-art="megaphone">/,'Angefeuert = Megafon wie in Buffleiste und Truppenrahmen');
 const visible=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();assert.ok(visible.length<80,'Symbole und Zahlen, keine Textwand: '+visible);
});
test('Big B deutlich größer als die Helden (×1,5 statt ×1,35), Trefferfläche wächst mit', ()=>{
 const g=game(),big=atBoss(g,'bigb'),gerd=g.enemies.find(e=>e.bossId==='gerd');
 assert.equal(DUNGEON_BOSSES.bigb.drawScale,1.5);assert.equal(dungeonScale(big),1.5);assert.equal(dungeonScale(gerd),1.35,'andere Bosse unverändert');
 /* Schild und Treffertest: renderer.js setzt spriteTop = Schild + 6; bei ×1,5 liegt der Kopf höher und bleibt anklickbar */const top=big.y-(29+4+6)*1.5+6;big.spriteTop=top;
 assert.ok(spriteHit(big,{x:big.x,y:top+4}),'Kopf/Krone trifft Big B');assert.ok(spriteHit(big,{x:big.x+10,y:big.y-20}),'Mantel trifft');assert.ok(!spriteHit(big,{x:big.x,y:top-8}),'darüber nicht');
 assert.match(src('hero-reveal.js'),/Math\.max\(1\.35,dungeonScale\(t\)\)/);
});
test('Kopfzeile der Kniffe: „kostenlos“ entfällt, die Löffelkur passt in eine Zeile', ()=>{
 const g=game('baerbel-care');g.player.level=10;const tip=skillTooltip(g,'heal'),meta=tip.match(/<div class="tip-meta">([^<]*)<\/div>/)?.[1]||'';
 assert.ok(meta,'Kopfzeile da');assert.doesNotMatch(meta,/kostenlos/);assert.match(meta,/Zauberzeit/);assert.ok(meta.length<=56,'kurz: '+meta);
 assert.match(src('dungeon-fix7.css'),/\.tip-meta\{white-space:nowrap/);
});
test('Wut-Tooltip klar: harter Wipe statt „Mit dir im Kampf liegt er vorher“', ()=>{
 const tip=enrageTip(DUNGEON_BOSSES.bigb,{after:215,base:290,cuts:[{id:'rita',s:50},{id:'kirmesurkunde',s:25}]});
 assert.doesNotMatch(tip,/Mit dir im Kampf liegt er vorher/);assert.match(tip,/ganze Gruppe/);assert.match(tip,/überlebt niemand/);assert.match(tip,/Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25/);
});
