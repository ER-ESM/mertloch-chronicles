// Held aktiv (docs/DUNGEON-AKTIV-2026-09-26.md, Nutzerentscheidung zu Dungeon-Fix 4): Rollen-Balance ohne den Helden, Rückenwind für einen
// Helden, der mitkämpft, und die Wertung „Einsatz“ nach dem Boss.
// 1 Angefeuert: Söldner machen im Dungeon mehr Schaden, solange der Held trifft, heilt, unterbricht oder pariert – nicht, wenn er liegt oder
//   nichts tut; allein sind sie so stark wie bisher ohne Faktor-Erhöhung, angefeuert wie vorher (4,8)
// 2 Rolle zählt: Den Kegel mildert nur ein Schutz; ein Söldner ohne Schutz-Rolle, der den Boss hält, trifft ihn voll
// 3 Letztes Aufgebot: ohne Schutz und Heilung „Alles oder nichts“, Ausweichen und Notfall-Schorle – je einmal, sichtbar
// 4 Wut: alle Hauptbosse haben eine, Tooltip mit den Zahlen des Bosses
// 5 Einsatz: Anteil in der Rolle, Unterbrechungen, Warnungen, Tode → Punkte; ab 60/85 Bonus-Siegelmarken; der Beute-Moment zeigt die Zeile
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,COMPANION_RULES,EINSATZ_RULES as R,EINSATZ_SCORE as S,EINSATZ_TEXT as T} from '../content/index.js';
import {toWorld,resolveDungeonCast,engageBoss} from '../dungeon.js';
import {hitCompanion} from '../companions.js';
import {rallyActive,mercDamageFactor,bossAutoFactor,tickLastStand,finishEinsatz,heroRole,rallyAura,untankedHolder,noteWarning} from '../dungeon-einsatz.js';
import {einsatzChips,einsatzBossChips,enrageTip,enrageClock} from '../dungeon-einsatz-ui.js';
import {collectAuras} from '../auras.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
function game(){const g=new Game(world,{level:10,tutorial:{version:1,step:8,completed:true}},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>Date.UTC(2026,8,26,12);return g;}
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
/** Im Dungeon an Gerds Tür, alle vier Söldner dabei, Trash weg. */
function atGerd(g,mercs=MERCS){assert.ok(g.enterDungeon('schloss-bigb',{force:true}));quiet(g);for(const id of mercs)g.hireCompanion(id,{free:true});
 Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,'e0',8.5,26)),9));for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}
 return g.enemies.find(e=>e.bossId==='gerd');}
const merc=(g,id)=>g.companions.find(c=>c.id===id);

// ── 1 · Angefeuert ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Angefeuert: angefeuert so stark wie vorher, allein wie ein Held', ()=>{
 const f=COMPANION_RULES.instanceFactor.damage;assert.ok(f<4.8,'Grundstärke gesenkt');
 assert.ok(Math.abs(f*(1+R.rally.bonus)-4.8)<.1,'angefeuert ≈ bisheriger Faktor 4,8: '+f*(1+R.rally.bonus));
});
test('Angefeuert: nur solange der Held selbst mitkämpft und steht', ()=>{
 const g=game(),gerd=atGerd(g),horst=merc(g,'merc-hopfen-horst');g.target=gerd;
 assert.equal(rallyActive(g),false,'vor dem ersten Treffer nicht');assert.equal(mercDamageFactor(g,horst,gerd),1);
 run(g,.1);gerd.aggro=true;gerd.ai='combat';g.damage(gerd,200,'Kelle');run(g,.1);
 assert.equal(rallyActive(g),true,'nach dem eigenen Treffer');assert.ok(Math.abs(mercDamageFactor(g,horst,gerd)-(1+R.rally.bonus))<1e-9);
 const aura=collectAuras(g).buffs.find(a=>a.id==='rally');assert.ok(aura,'Buffleiste zeigt Angefeuert');assert.equal(aura.name,T.rally.name);assert.ok(aura.remaining>0&&aura.remaining<=R.rally.hold);
 assert.equal(rallyAura(g).itemIcon,'megaphone');
 const chips=einsatzBossChips(g,gerd);assert.equal(chips.find(c=>c.id==='rally').cls,'bf-good');
 g.adminGod=true;run(g,R.rally.hold+.5);/* nichts getan */
 assert.equal(rallyActive(g),false,'nach hold Sekunden ohne eigene Tat vorbei');assert.equal(mercDamageFactor(g,horst,gerd),1);
 assert.equal(einsatzBossChips(g,gerd).find(c=>c.id==='rally').text,T.rally.idle,'Bossrahmen: Söldner warten');
 g.damage(gerd,200,'Kelle');run(g,.1);assert.equal(rallyActive(g),true);
 g.adminGod=false;g.die('Test');run(g,.1);assert.equal(rallyActive(g),false,'wer liegt, feuert niemanden an');
});
test('Angefeuert: gilt nur im Dungeon und gegen Dungeon-Gegner', ()=>{
 const g=game();g.hireCompanion('merc-hopfen-horst',{free:true});const c=g.companions[0];
 assert.equal(mercDamageFactor(g,c,{hp:100,maxHp:100}),1);assert.equal(rallyActive(g),false);
});

// ── 2 · Rolle zählt ────────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Rolle zählt: den Rausschmiss mildert nur der Schutz – hält ein Schadens-Söldner Gerd, trifft er ihn voll', ()=>{
 const k={...DUNGEON_CASTS['d-gerd'].casts.rausschmiss,type:'rausschmiss'};
 for(const [id,share] of [['merc-pils-peter',k.pct*k.tankSafe],['merc-hopfen-horst',k.pct]]){
  const g=game(),gerd=atGerd(g),c=merc(g,id);for(const o of g.companions)if(o!==c){o.x=gerd.x-200;o.y=gerd.y;}
  c.x=gerd.x+30;c.y=gerd.y;g.player.x=gerd.x-200;g.player.y=gerd.y+80;const before=c.hp;
  resolveDungeonCast(g,gerd,{...k,angle:0,remaining:0,focus:c.id},c);
  const lost=(before-c.hp)/c.maxHp;assert.ok(Math.abs(lost-Math.min(1,share))<.03,id+': '+lost.toFixed(2)+' statt '+share);}
});
test('Rolle zählt: „Ungeschützt“ im Bossrahmen, wenn ein Söldner ohne Schutz-Rolle den Boss hält', ()=>{
 const g=game(),gerd=atGerd(g);gerd.aggro=true;gerd.ai='combat';gerd.focus='merc-hopfen-horst';
 assert.equal(untankedHolder(g,gerd)?.id,'merc-hopfen-horst');const c=einsatzBossChips(g,gerd).find(x=>x.id==='untanked');assert.ok(c&&c.note.includes('Hopfen-Horst'));
 gerd.focus='merc-pils-peter';assert.equal(untankedHolder(g,gerd),null);
});

// ── 3 · Letztes Aufgebot ───────────────────────────────────────────────────────────────────────────────────────────────────────
test('Letztes Aufgebot: ohne Schutz und Heilung – Alles oder nichts, Ausweichen, Notfall-Schorle, je einmal', ()=>{
 const g=game(),gerd=atGerd(g);gerd.aggro=true;gerd.ai='combat';const horst=merc(g,'merc-hopfen-horst'),peter=merc(g,'merc-pils-peter'),susi=merc(g,'merc-schorle-susi');
 g.sct=()=>false;const floats=[];g.float=(x,y,t)=>floats.push(t);const barks=[];g.bark=(u,t)=>barks.push(t);
 tickLastStand(g,horst);assert.equal(horst.lastStandUsed,undefined,'Schutz und Heilung stehen: nichts');
 hitCompanion(g,gerd,peter,1e7);hitCompanion(g,gerd,susi,1e7);g.dead=true;/* Held liegt, Schutz und Heilung am Boden */
 tickLastStand(g,horst);assert.equal(horst.lastStandUsed,true);assert.ok(horst.lastStand.until>g.time);assert.ok(barks.length&&floats.includes(T.lastStand.shout));
 assert.ok(mercDamageFactor(g,horst,gerd)>=1+R.lastStand.burst.damage-1e-9,'Alles oder nichts: mehr Schaden');
 gerd.focus=horst.id;horst.hp=horst.maxHp*(R.lastStand.evade.below-.05);tickLastStand(g,horst);assert.ok(horst.evade?.until>g.time,'Ausweichen');
 assert.equal(bossAutoFactor(g,gerd,horst),0,'weicht dem Autoangriff aus');assert.ok(floats.includes(T.lastStand.evaded));
 horst.hp=Math.round(horst.maxHp*.2);tickLastStand(g,horst);assert.ok(horst.hp>horst.maxHp*.6,'Notfall-Schorle: +'+R.lastStand.potion.heal*100+' %');
 const hp=horst.hp=Math.round(horst.maxHp*.2);tickLastStand(g,horst);assert.equal(horst.hp,hp,'nur einmal je Kampf');
});
test('Letztes Aufgebot: der Held als Heiler zählt, solange er steht', ()=>{
 const g=game();g.changeSpec?.('baerbel-care');assert.ok(g.enterDungeon('schloss-bigb',{force:true}));quiet(g);g.rpg.talents.spec='baerbel-care';
 for(const id of ['merc-radler-rita','merc-hopfen-horst'])g.hireCompanion(id,{free:true});const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';
 assert.equal(heroRole(g),'heal');const horst=merc(g,'merc-hopfen-horst');horst.hp=horst.maxHp*.2;tickLastStand(g,horst);
 assert.ok(!horst.potionUsed,'Heiler steht: keine Schorle');assert.ok(!horst.lastStandUsed);
});

// ── 4 · Wut ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Wut: jeder Hauptboss hat eine Zeitgrenze, Tooltip mit seinen Zahlen', ()=>{
 for(const id of ['gerd','expose','korkenkurt','bigb']){const e=DUNGEON_BOSSES[id].enrage;assert.ok(e?.after>0&&e.every>0&&e.damage>0,id);
  assert.ok(enrageTip(DUNGEON_BOSSES[id]).includes(enrageClock(DUNGEON_BOSSES[id])),id);}
 assert.equal(enrageClock(DUNGEON_BOSSES.gerd),'2:10');assert.equal(enrageClock(DUNGEON_BOSSES.bigb),'4:50');
 assert.ok(DUNGEON_BOSSES.bigb.enrage.after<360,'Big B: Wut vor den 6 Minuten, die der passive Held live noch schaffte');
});
test('Wut: Gerd bricht nach der Zeitgrenze aus und schlägt härter', ()=>{
 const g=game(),gerd=atGerd(g);const floats=[];g.float=(x,y,t)=>floats.push(t);engageBoss(g,gerd);g.adminGod=true;
 gerd.fightTime=DUNGEON_BOSSES.gerd.enrage.after-.1;run(g,.3);assert.ok(gerd.rageFactor>1,'Wut');assert.ok(floats.includes(T.enrage.gerd));
});

// ── 5 · Einsatz ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Einsatz: Anteil, Unterbrechungen, Warnungen, Tode → Punkte und Bonus-Siegelmarken', ()=>{
 const g=game(),gerd=atGerd(g);engageBoss(g,gerd);g.adminGod=true;run(g,.1);
 g.target=gerd;g.damage(gerd,4000,'Kelle');for(const c of g.companions)g.meter.overall.actors[c.id]={damage:6000,healing:0};/* Held ≈ 14 % */
 run(g,1);const r=gerd.einsatz;assert.ok(r,'Bosskampf wird mitgeschrieben');
 g.stats.interrupts+=2;r.warn=4;r.warnOk=3;const x=finishEinsatz(g,gerd);
 assert.equal(x.role,'damage');assert.ok(x.damage>=12&&x.damage<=16,'Schadensanteil '+x.damage);assert.equal(x.interrupts,2);assert.equal(x.warnOk,3);assert.equal(x.warn,4);
 assert.equal(x.parts.interrupt,2*S.interrupt.points);assert.equal(x.parts.warn,Math.round(.75*S.warn.points));
 assert.equal(x.score,x.parts.share+x.parts.interrupt+x.parts.warn);assert.ok(x.score>=60,'aktiver Held: Bonus '+x.score);assert.equal(x.bonus,x.score>=85?2:1);assert.equal(x.tier,x.score>=85?'gold':'silver');
 assert.equal(gerd.einsatz,null,'einmal ausgewertet');
});
test('Einsatz: passiver Held und Tode bekommen keinen Bonus', ()=>{
 const g=game(),gerd=atGerd(g);engageBoss(g,gerd);g.adminGod=true;run(g,1);for(const c of g.companions)g.meter.overall.actors[c.id]={damage:8000,healing:0};
 gerd.einsatz.deaths=1;const x=finishEinsatz(g,gerd);assert.equal(x.damage,0);assert.equal(x.parts.death,S.death.points);assert.equal(x.bonus,0);assert.ok(x.score<60);
});
test('Einsatz: Warnungen zählen nur, wenn sie dem Helden galten, und nur ohne Treffer als beantwortet', ()=>{
 const g=game(),gerd=atGerd(g);engageBoss(g,gerd);run(g,.1);const r=gerd.einsatz,ground={ground:true,radius:30,pct:.3};
 noteWarning(g,gerd,ground,'player',0,true);noteWarning(g,gerd,ground,'player',1,true);noteWarning(g,gerd,ground,'player',0,false)/* nicht im Raum */;
 noteWarning(g,gerd,{interruptible:true,pct:.3},'player',0,true)/* unterbrechbar: keine Warnung */;
 noteWarning(g,gerd,{tankDebuff:{id:'x'}},'merc-pils-peter',0,true)/* Siegelring auf dem Schutz: nicht dem Helden */;
 noteWarning(g,gerd,{spread:{radius:30}},'player',1,true);noteWarning(g,gerd,{spread:{radius:30}},'player',2,true)/* überlappt */;
 assert.equal(r.warn,4);assert.equal(r.warnOk,2);
});
test('Einsatz: Sieg über den Boss bringt die Wertung in den Beute-Moment und die Bonus-Siegelmarken aufs Konto', ()=>{
 const g=game(),gerd=atGerd(g);engageBoss(g,gerd);g.adminGod=true;g.target=gerd;
 for(let i=0;i<40&&gerd.hp>0;i++){g.damage(gerd,gerd.maxHp/60,'Kelle');run(g,.2);}for(const c of g.companions)g.meter.overall.actors[c.id]={damage:0,healing:0};
 const marks0=g.dungeons['schloss-bigb'].marks;gerd.hp=1;g.damage(gerd,50,'Kelle');run(g,.1);
 const rw=gerd.dungeonReward;assert.ok(rw?.einsatz,'Wertung am Sieg');assert.ok(rw.einsatz.bonus>=1,'Einsatz '+rw.einsatz.score);
 assert.equal(g.dungeons['schloss-bigb'].marks-marks0,rw.marks+rw.einsatz.bonus,'Bonus-Siegelmarken aufs Konto');
 const bag=g.rpg.loot.find(b=>b.reward?.boss==='gerd');assert.ok(bag?.reward?.einsatz,'Beutel trägt die Wertung');
});
test('Einsatz-Zeile: Symbole und Zahlen, Erklärung nur im Tooltip, Bonus sichtbar', ()=>{
 const x={role:'damage',damage:17,healing:0,hold:3,interrupts:2,dodges:4,warn:8,warnOk:7,deaths:0,rally:96,seconds:88,parts:{share:50,interrupt:16,warn:26,death:0},score:92,bonus:2,tier:'gold'};
 const html=einsatzChips(x);assert.ok(html.includes('data-einsatz-score="92"')&&html.includes('data-einsatz-bonus="2"'));
 for(const part of ['score','damage','interrupts','warn','dodges','rally','bonus'])assert.ok(html.includes(`data-einsatz-part="${part}"`),part);
 assert.ok(!html.includes('data-einsatz-part="healing"')&&!html.includes('data-einsatz-part="hold"'),'leere Anteile entfallen');
 assert.ok(!html.includes('data-einsatz-part="deaths"'),'ohne Tod kein Schädel');
 const chips=[...html.matchAll(/<span class="loot-chip[^>]*>/g)].map(m=>m[0]);assert.ok(chips.every(c=>c.includes('data-tooltip-label=')&&c.includes('data-tooltip-note=')),'jeder Chip mit Tooltip');
 const text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();assert.ok(text.length<60,'keine Textwand: '+text);
 assert.equal(einsatzChips(null),'');assert.ok(einsatzChips({...x,bonus:0,tier:null,score:30}).includes('einsatz-none'));
});
