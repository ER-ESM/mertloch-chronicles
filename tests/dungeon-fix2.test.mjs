// Dungeon-Fix 2 (docs/DUNGEON-FIX2-2026-09-26.md, Endabnahme des Prüfers Build #715):
// 1 Raumname nur an der Plakette, nie in der Raummitte, nie im Kampf · 2 Söldner im Dungeon und im Kampf nur im Chat
// 3 Trash: Funkspruch ruft keinen fernen Pack, gleiche Gegner fangen versetzt an; Ausrüstungsprofile aus content/ hergeleitet
// 4 Söldner am Boden: im Kampf steht niemand auf, die Anzeige sagt es · 5 Boss-Beute in der ganzen Arena · 6 Grauschleier ohne CSS-Filter
// 7 Warnzeiten ≥ 2,0 s · 8 Testzugang im normalen Spielstandformat · 9 Beute legt Verpflegung nicht auf die Leiste
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_CASTS,DUNGEON_ENEMIES,DUNGEON_PACK_RULES,COMBAT_RULES,COMPANION_RULES,LIGHTING,TUTORIAL} from '../content/index.js';
import {toWorld,roomAt,packFirstSpecial,resolveDungeonCast,dungeonRun} from '../dungeon.js';
import {plaqueSpots,onPlaque} from '../dungeon-art.js';
import {companionBarkQuiet,partyFighting} from '../dungeon-clarity.js';
import {BossSpeech} from '../enemy-ui.js';
import {groupFightOn,hitCompanion} from '../companions.js';
import {downStatus} from '../companion-ui.js';
import {drawDeathVeil} from '../renderer.js';
import {applyGrade} from '../world-light.js';
import {ITEMS,actionBar,autoLootBag,countItem} from '../rpg.js';
import {gearProfile,typicalGearStudy} from '../scripts/gear-profiles.mjs';
import {buildPlaytestSave,snippet} from '../scripts/playtest-save.mjs';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'],DAY=Date.UTC(2026,8,26,12);
function game(level=10){const g=new Game(world,{level,tutorial:{version:1,step:8,completed:true}},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
const inside=g=>{assert.ok(g.enterDungeon('schloss-bigb',{force:true}));return g.dungeonRun;};
const at=(g,f,x,y)=>{Object.assign(g.player,toWorld(DEF,f,x,y));g.player.inCombat=0;};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const party=g=>{for(const id of MERCS)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}return g;};
const quiet=(g,keep=[])=>{for(const e of g.enemies)if(!e.dungeonBoss&&!keep.includes(e.pack)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};

test('Raumname: Plakette an der Wand, Überfahren nur dort – nie in der Raummitte',()=>{
 const rooms=DEF.rooms.filter(r=>r.floor==='e0'&&!r.secret),spots=plaqueSpots(DEF,'e0',rooms,null);
 assert.equal(spots.length,rooms.length);
 for(const q of spots){const r=q.room.rects[0],top=toWorld(DEF,'e0',r[0],r[1]),mid=toWorld(DEF,'e0',r[0]+r[2]/2,r[1]+r[3]/2);
  assert.ok(q.y<=top.y+1,q.room.id+': Plakette an der Nordkante, nicht im Raum');assert.ok(onPlaque(q,{x:q.x,y:q.y+3}),'Maus auf der Plakette');
  assert.equal(onPlaque(q,mid),false,q.room.id+': Raummitte zeigt keinen Namen');}
 const src=readFileSync(new URL('../dungeon-art.js',import.meta.url),'utf8');
 assert.match(src,/hover&&!dungeonFight\(g\)\?plaques\.find\(q=>onPlaque\(q,hover\)\)/,'im Kampf kein Name, sonst nur auf der Plakette');
 assert.doesNotMatch(src,/text\(c,room\.sign,r\.x\+r\.w\/2,r\.y\+14/,'der alte Name oben mittig im Raum ist weg');
});

test('Zonentitel: wartet im Kampf, entfällt nach langer Wartezeit statt mitten im Plündern aufzutauchen',async()=>{
 const {ZONE_STALE_MS,ZONE_SHOW_MS}=await import('../zone-announce.js');assert.ok(ZONE_STALE_MS>=ZONE_SHOW_MS&&ZONE_STALE_MS<=15000);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/document\.body\.classList\.contains\('dg-fight'\)/,'im Dungeon-Kampf wartet der Titel');
});

test('Söldner sprechen im Dungeon und in jedem Kampf nur im Chat; draußen ohne Kampf als Blase',()=>{
 const g=game();party(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>900);g.player.inCombat=0;
 const sp=new BossSpeech(),m=g.companions[2],say=text=>sp.bark({enemyId:m.id,name:m.name,text,kind:'companion',x:m.x,y:m.y},g);
 assert.equal(companionBarkQuiet(g),false);say('Schönes Wetter.');assert.equal(sp.activeBarks(g).length,1,'draußen ohne Kampf eine Blase');
 g.player.inCombat=4;assert.equal(partyFighting(g),true);assert.deepEqual(sp.activeBarks(g),[],'im Kampf verschwindet sie');say('Auf sie!');g.player.inCombat=0;
 assert.deepEqual(sp.activeBarks(g).map(b=>b.text),['Schönes Wetter.'],'die Kampfzeile entsteht gar nicht als Blase');
 const h=game();party(h);inside(h);const n=new BossSpeech();n.bark({enemyId:h.companions[0].id,name:'x',text:'Ich… leg mich kurz hin.',kind:'companion',x:0,y:0},h);
 assert.deepEqual(n.activeBarks(h),[],'im Dungeon keine Söldner-Blase');
});

test('Funkspruch: ruft nur einen Pack in Hörweite – der erste Pull im Hof holt Hof Ost nicht mehr dazu',()=>{
 const funk=DUNGEON_CASTS['d-azubi'].casts.funk;assert.ok(funk.callHelp.range<=120,'Hörweite '+funk.callHelp.range);assert.ok(funk.total>=2.2,'Zeit zum Unterbrechen '+funk.total+' s');
 const g=game();inside(g);at(g,'e0',22,26);const west=g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard),east=g.enemies.filter(e=>e.pack==='hof-ost');
 for(const e of west){e.aggro=true;e.ai='combat';}const caller=west.find(e=>e.dungeonKind==='securityazubi');
 resolveDungeonCast(g,caller,{...funk,type:'funk'},'player');assert.ok(east.every(e=>!e.aggro),'Hof Ost bleibt stehen');
 const k=game();inside(k);at(k,'e0',55,26);const nord=k.enemies.filter(e=>e.pack==='kanzlei-nord'&&!e.cardboard);for(const e of nord){e.aggro=true;e.ai='combat';}
 resolveDungeonCast(k,nord.find(e=>e.dungeonKind==='securityazubi'),{...funk,type:'funk'},'player');
 assert.ok(k.enemies.some(e=>e.pack&&e.pack!=='kanzlei-nord'&&e.aggro),'in der engen Kanzlei ruft der Funkspruch weiter den Nachbarn');
});

test('Gleiche Gegner eines Packs fangen versetzt an (kein doppelter Regenrinnen-Hieb zugleich)',()=>{
 const g=game();inside(g);const pack=DEF.packs.find(p=>p.members.filter(m=>m==='baumarktritter').length===2),[a,b]=g.enemies.filter(e=>e.pack===pack.id&&e.dungeonKind==='baumarktritter');
 assert.equal(packFirstSpecial(g,a),COMBAT_RULES.firstSpecial);a.aggro=true;a.ai='combat';
 assert.equal(packFirstSpecial(g,b),COMBAT_RULES.firstSpecial+DUNGEON_PACK_RULES.stagger,'der zweite Ritter später');
});

test('Warnzeiten: jede Trash-Mechanik zum Ausweichen hat mindestens 2,0 s',()=>{
 const sets=new Set(Object.values(DUNGEON_ENEMIES).map(e=>e.castSet)),short=[];
 for(const set of sets)for(const [id,c] of Object.entries(DUNGEON_CASTS[set]?.casts||{}))if((c.cone||c.ground)&&c.total<2)short.push(set+'.'+id);
 assert.deepEqual(short,[]);assert.ok(DUNGEON_CASTS['d-ritter'].casts.hieb.total>=2.2,'Regenrinnen-Hieb');assert.ok(DUNGEON_CASTS['d-pferd'].casts.huftritt.total>=2,'Huftritt');
});

test('Söldner am Boden: im Kampf steht niemand auf, die Anzeige sagt „nach dem Kampf“; ohne Kampf zählt die Frist',()=>{
 const g=game();inside(g);quiet(g,['hof-west']);at(g,'e0',24,27);party(g);const rita=g.companions.find(c=>c.name==='Radler-Rita');
 for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';e.focus=g.companions[0].id;}g.adminGod=true;
 rita.hp=1;hitCompanion(g,g.enemies.find(e=>e.pack==='hof-west'&&!e.cardboard),rita,1e6);assert.equal(rita.state,'down');
 rita.downUntil=g.time;run(g,1);assert.equal(rita.state,'down','im Kampf nicht auf');assert.ok(groupFightOn(g,rita));assert.match(downStatus(g,rita),/Steht nach dem Kampf auf/);
 // Held liegt als Geist abseits: der Kampf läuft trotzdem (vorher standen Söldner dann mitten im Kampf auf)
 Object.assign(g.player,toWorld(DEF,'e0',44,37));assert.ok(groupFightOn(g,rita),'Gegner gehen die Gruppe an – Kampf läuft');
 for(const e of g.enemies)if(e.hp>0&&e.aggro)g.kill(e);run(g,.5);assert.notEqual(rita.state,'down','nach dem Kampf steht sie auf');
 rita.hp=1;hitCompanion(g,g.enemies.find(e=>e.bossId==='gerd'),rita,1e6);assert.match(downStatus(g,rita),new RegExp('Steht in '+COMPANION_RULES.downSeconds+' s wieder auf'));
});

test('Boss-Beute: Beutel kennt die Arena und öffnet sich dort überall, außerhalb erst in Reichweite',()=>{
 const g=game();inside(g);quiet(g);party(g);const gerd=g.enemies.find(e=>e.bossId==='gerd');at(g,'e0',8.5,30);g.settings.autoLoot=true;
 const moments=[];g.on?.('lootMoment',e=>moments.push(e));g.kill(gerd);const bag=g.rpg.loot.find(b=>b.moment);
 assert.ok(bag,'Beutel liegt');assert.equal(bag.room,'zugbruecke');assert.equal(bag.noEquip,true);
 at(g,'e0',3,21);const far=Math.hypot(bag.x-g.player.x,bag.y-g.player.y);assert.ok(g.lootReachable(bag),'in der Arena überall ('+Math.round(far)+' E)');
 at(g,'e0',31,37);assert.equal(g.lootReachable(bag),false,'im Hof außer Reichweite nicht');g.dead=true;assert.equal(g.lootReachable(bag),false,'als Geist nicht');g.dead=false;
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/const bag=unitAt\(game,p\.x,p\.y\)\?\.kind==='enemy'\?null:lootAt\(p\)/,'Rechtsklick: Leiche vor Söldner, lebender Gegner vor Leiche');
 assert.match(app,/openLootMoment\(ev\.bagId\)/);assert.match(app,/game\.dead\|\|game\.paused\|\|document\.body\.classList\.contains\('dg-fight'\)\|\|!game\.lootReachable\(bag\)/,'wartet auf Leben, Kampfende und Arena');
});

test('Tod: Grauschleier als Fläche, weich eingeblendet; kein CSS-Filter mehr auf der Weltfläche',()=>{
 const calls=[],c={save(){},restore(){},fillRect(...a){calls.push([this.globalAlpha,this.fillStyle,...a]);},globalAlpha:1,fillStyle:''};
 drawDeathVeil(c,100,50,0);assert.equal(calls.length,0,'im ersten Bild noch nichts');
 drawDeathVeil(c,100,50,LIGHTING.deathVeil.fade/2);const half=calls.splice(0).map(x=>x[0]);drawDeathVeil(c,100,50,5);const full=calls.map(x=>x[0]);
 assert.ok(half.every((a,i)=>a>0&&a<full[i]),'halb eingeblendet');assert.ok(full[1]>=.3,'dunkelt spürbar');
 const el={style:{filter:''},parentElement:{classList:{contains:k=>k==='player-dead'}}};applyGrade(el,false);assert.equal(el.style.filter,'','Tod setzt keinen Filter');
 const css=readFileSync(new URL('../spielfluss-r5a.css',import.meta.url),'utf8');assert.doesNotMatch(css,/body\.hero-dead #world\{filter/);
});

test('Ausrüstungsprofile: Start = Startausrüstung, typisch aus Aufträgen und Beute bis Stufe 10 hergeleitet, voll = alle 16 Plätze',()=>{
 assert.deepEqual(gearProfile('start').starter,TUTORIAL.starterEquipment);assert.equal(gearProfile('full').rolls.length,16);
 const t=gearProfile('typical'),slots=Object.fromEntries(t.rolls.map(r=>[r.target,r]));
 for(const s of ['head','body','ring1','feet','trinket1','shoulders'])assert.ok(slots[s],'typisch trägt '+s+' (Auftrag, Kapitel 1)');
 assert.equal(slots.shoulders.quality,'rare','Kapitel 1 gibt ein seltenes Teil');assert.ok(t.rolls.length>=9&&t.rolls.length<=13,'etwa zwei Drittel der Plätze: '+t.rolls.length);
 assert.ok(t.rolls.every(r=>r.level<=10&&r.level>=2),'Stufen aus dem Leveln');assert.ok(t.rolls.filter(r=>r.level>=8).length<=3,'kaum Teile auf Stufe 8+');
 assert.deepEqual(typicalGearStudy({runs:60}).map(r=>r.slot),typicalGearStudy({runs:60}).map(r=>r.slot),'reproduzierbar');
});

test('Testzugang: Spielstand im normalen Format, drei Voreinstellungen, Schnipsel nutzt nur Heldenliste und Spielstand',()=>{
 const vor=buildPlaytestSave({preset:'vor'}),siegel=buildPlaytestSave({preset:'siegel'});
 assert.equal(vor.save.level,10);assert.equal(vor.save.rpg.coins,600);assert.equal(vor.save.dungeonRun,undefined,'draußen kein Laufstand');assert.equal(vor.hero.mercs.length,0);
 const r=siegel.save.dungeonRun;assert.equal(r.inside,true);assert.deepEqual([...r.seals].sort(),['siegel-expose','siegel-gerd','siegel-kurt']);assert.equal(r.checkpoint.room,'weinkeller');
 assert.equal(siegel.save.companions?.length??siegel.hero.mercs.length,4);assert.equal(siegel.save.rpg.loot.length,0,'keine liegende Beute');
 const g=new Game(world,JSON.parse(JSON.stringify({...siegel.save,dungeonRun:{...r,savedAt:Date.now(),day:undefined}})),{});assert.equal(g.player.level,10);
 const code=snippet(vor,'Test');assert.match(code,/import\('\/characters\.js'\)/);assert.match(code,/C\.createCharacter\(/);assert.match(code,/C\.characterKey\(world,made\.character\)/);
 assert.doesNotMatch(code,/window\.game|mertloch-unlock-all|adminGod/,'keine Hintertür im Spiel');
});

test('Verpflegung aus Beute landet im Rucksack, nicht ungefragt auf der Leiste; ein neuer Held hat seine Startverpflegung auf der Leiste',()=>{
 const fresh=game();assert.ok(actionBar(fresh).some(x=>String(x).startsWith('item:')),'Startverpflegung eines neuen Helden auf der Leiste');
 const g=new Game(world,{level:10,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:10,actionBars:{dieter:['auto','strike',null,null,null,null,null,null,null,null]}}},{});
 g.toast=()=>{};const before=JSON.stringify(actionBar(g));const bag={id:'drop-t',x:g.player.x,y:g.player.y,coins:0,items:[{id:'brezel',count:1}],source:{name:'Security-Azubi',kind:'enemy'}};g.rpg.loot.push(bag);
 autoLootBag(g,bag);assert.equal(JSON.stringify(actionBar(g)),before,'Leiste unverändert');assert.ok(countItem(g.rpg,'brezel')>=1,'Brezel im Rucksack');
});
