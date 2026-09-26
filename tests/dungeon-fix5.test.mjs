// Dungeon-Fix 5 (docs/DUNGEON-FIX5-2026-09-26.md, Prüfer-Playtest live Build #728, docs/PLAYTEST-2026-09-26-dungeon-bigb-3.md):
// 1 Reaktionsfenster: jede Lüge von Big B lässt nach dem Nachsatz ≥ 2,2 s (Spielzeit; sichtbar ≥ 2,0 s, gemessen in scripts/dungeon-fix5-check.mjs);
//   „… und links.“ hat einen sicheren Streifen in der Mitte und die Handlung „In die Mitte“ mit Lauftaste
// 2 Todesrückblick: gebündelt, Todesschlag unten, Rest als „+ n weitere“ – die Zeilen ergeben genau Σ; Ursache = größter Brocken
// 3 „Deine Truppe“: kompakte Rahmen, dichter statt Scrollen
// 4 Erinnerung als kompakte Meldung (Text im Tooltip, Klick öffnet Bild und Text)
// 5 Nach der Rede wartet Big B (WoW-Muster): Angriff oder Nahbereich zieht ihn, der Timer nicht; Söldner ziehen nicht
// 6 F-Hinweis stabil mit Hysterese, kein „Beweise vorlegen“ am Saaleingang; Todesfenster oben mittig; Tooltips erst nach echter Mausbewegung
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_UI as DUI,DUNGEON_TEXT,DEATH_UI,MEMORY_FRAGMENTS,describeCast} from '../content/index.js';
import {toWorld,laneRects,bossHeld,bossReady,pullBoss,introState,dungeonInteraction,dungeonAct} from '../dungeon.js';
import {laneAction,heroAnswer} from '../alert-answer.js';
import {deathRecap,deathHtml,deathCause} from '../death-screen.js';
import {memoryCardHtml,noticeMs} from '../memory-card.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'],DAY=Date.UTC(2026,8,26,12),U=8;
const src=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
function game(level=10){const g=new Game(world,{level,tutorial:{version:1,step:8,completed:true}},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
const inside=g=>{assert.ok(g.enterDungeon('schloss-bigb',{force:true}));return g.dungeonRun;};
const at=(g,f,x,y)=>{Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,f,x,y)),9));g.player.inCombat=0;g.moveTo=null;g.path=[];};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb');
const dist=(g,e)=>Math.hypot(e.x-g.player.x,e.y-g.player.y)/U;
function ready(g,{found=['mietvertrag','leihschein','kirmesurkunde'],mercs=MERCS}={}){const r=inside(g);quiet(g);for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);for(const id of found)r.found.add(id);r.version++;
 for(const id of mercs)g.hireCompanion(id,{free:true});at(g,'k2',48,26);for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}return r;}
/** Einleitung am Thron starten und bis „bereit“ laufen lassen. */
function toReady(g,{x=54,y=12+DUNGEON_BOSSES.bigb.intro.reach+2.5}={}){at(g,'k2',x,y);const it=dungeonInteraction(g);assert.equal(it?.act,'address');assert.ok(dungeonAct(g,it).ok);let t=0;while(!introState(g)?.ready&&t<20){run(g,.25);t+=.25;}assert.ok(introState(g)?.ready,'Rede vorbei');return t;}

// ── 5 · Nach der Rede wartet Big B ─────────────────────────────────────────────────────────────────────────────────────────────
test('Nach der Rede wartet Big B auf dem Thron: kein Kampf durch den Timer, Söldner ziehen nicht, er nimmt keinen Schaden ohne Angriff',()=>{
 const g=game(),r=ready(g),b=bigbOf(g);toReady(g);
 assert.ok(bossReady(g,b)&&bossHeld(g,b),'bereit und wartend');run(g,12);
 assert.equal(b.aggro,false,'12 s nach der Rede kein Kampf');assert.equal(r.arena,null,'Tür offen');assert.equal(b.hp,b.maxHp,'kein Schaden');
 for(const c of g.companions)assert.notEqual(c.target,b,c.name+' zieht nicht');
 assert.equal(introState(g).ready,true);assert.equal(introState(g).left,0);assert.equal(dungeonInteraction(g),null,'kein F mehr – angreifen oder herangehen');
});
test('Der Angriff zieht den wartenden Big B: Schaden kommt an, Tür zu, erster Zauber nach der Anlaufzeit; während der Rede zählt ein Angriff nicht',()=>{
 const g=game(),r=ready(g),b=bigbOf(g),I=DUNGEON_BOSSES.bigb.intro;at(g,'k2',54,12+I.reach+2.5);assert.ok(dungeonAct(g,dungeonInteraction(g)).ok);
 g.target=b;run(g,.5);assert.equal(g.damage(b,500,'Autoangriff'),0,'während der Rede kein Schaden');assert.equal(b.aggro,false,'und kein Kampf');
 let t=0;while(!introState(g)?.ready&&t<20){run(g,.25);t+=.25;}
 const dealt=g.damage(b,500,'Autoangriff');assert.ok(dealt>0,'Treffer zählt: '+dealt);assert.ok(b.aggro,'Kampf');assert.equal(introState(g),null,'Einleitung vorbei');
 run(g,.2);assert.equal(r.arena,'thronsaal','Tür zu');assert.ok(b.attackTimer>=I.opener-.5,'erster Zauber nach der Anlaufzeit: '+b.attackTimer);
});
test('Nahbereich: wer ihn nach der Rede neu betritt, zieht Big B; wer schon drin steht, muss angreifen',()=>{
 const I=DUNGEON_BOSSES.bigb.intro;
 {const g=game(),b=(ready(g),bigbOf(g));toReady(g,{y:12+I.reach+3});assert.ok(dist(g,b)>I.reach);at(g,'k2',54,12+I.reach-1.5);run(g,.1);assert.ok(b.aggro,'Nahbereich betreten → Kampf');}
 {const g=game(),b=(ready(g),bigbOf(g));at(g,'k2',54,12+I.reach-1);run(g,.1);assert.ok(introState(g),'Thron erreicht startet die Rede');let t=0;while(!introState(g)?.ready&&t<20){run(g,.25);t+=.25;}
  run(g,6);assert.equal(b.aggro,false,'schon im Nahbereich: kein Kampf ohne Angriff');at(g,'k2',54,12+I.reach+3);run(g,.2);at(g,'k2',54,12+I.reach-1);run(g,.1);assert.ok(b.aggro,'hinaus und wieder hinein → Kampf');}
});
test('Söldner mit Angriffsbefehl ziehen den wartenden Big B nur nach der Rede – vorher machen sie keinen Schaden',()=>{
 const s=src('companions.js');assert.match(s,/if\(e\.dungeonBoss&&!e\.aggro&&bossHeld\(g,e\)&&!pullBoss\(g,e\)\)return 0;/);
 const g=game(),b=(ready(g),bigbOf(g));assert.equal(pullBoss(g,b),false,'vor der Rede nicht ziehbar');toReady(g);assert.equal(pullBoss(g,b),true,'nach der Rede ziehbar');assert.ok(b.aggro);
});
test('Simulation: der Sim-Held spricht an und zieht selbst (pullBoss), die Rede zählt nicht zur Kampfzeit',()=>{
 const s=src('scripts/dungeon-sim.mjs');assert.match(s,/function heroPulls\(g,big\)\{let t=0;if\(addressBoss\(g,big\)\)for\(;t<30&&!bossReady\(g,big\);t\+=\.05\)g\.tick\(\.05\);/);assert.match(s,/if\(!pullBoss\(g,big\)\)engageBoss\(g,big\);return t;\}/);
 assert.ok((s.match(/heroPulls\(g,/g)||[]).length>=3,'Big B allein und im vollen Durchgang');
});
test('Bossrahmen: „Angreifbar in“ als Timer, danach der Zustand „bereit“ mit Tooltip',()=>{
 assert.equal(DUNGEON_TEXT.intro.pull,'Angreifbar in');assert.match(DUNGEON_TEXT.intro.pullNote,/wartet/);assert.equal(DUI.alerts.ready,'bereit');assert.match(DUI.alerts.readyNote,/angreif|Greif/);
 const s=src('boss-alerts.js');assert.match(s,/if\(intro\?\.ready\)chip\('ready'/);assert.match(s,/if\(intro&&!intro\.ready\)\{const key='pull:'/);
});

// ── 6 · F-Hinweis stabil ─────────────────────────────────────────────────────────────────────────────────────────────────────
test('F-Hinweis am Thron: kein „Beweise vorlegen“ am Saaleingang, Hinweis ab talk Kacheln, geht erst jenseits von talk + keep; F im Gehen greift',()=>{
 const g=game(),r=ready(g),b=bigbOf(g),I=DUNGEON_BOSSES.bigb.intro,pr=DEF.evidence.present;assert.ok(I.keep>=2,'Hysterese in den Daten');
 at(g,pr.floor,pr.x,pr.y);assert.equal(dungeonInteraction(g),null,'am Saaleingang ('+dist(g,b).toFixed(1)+' Kacheln) kein F');
 const along=y=>{at(g,'k2',54,y);return dungeonInteraction(g);};
 assert.equal(along(12+I.talk+1.5),null,'außerhalb, noch nie gezeigt');assert.equal(along(12+I.talk-.5)?.act,'address','in Sprechweite');
 assert.equal(along(12+I.talk+I.keep-.5)?.act,'address','zurück, aber innerhalb der Hysterese: bleibt');assert.equal(along(12+I.talk+I.keep+.8),null,'jenseits: weg');
 assert.equal(along(12+I.talk+1.5),null,'von außen kommend wieder erst ab talk');
 assert.match(src('app.js'),/const it=worldInteraction\(\)\|\|\(lastInteract&&performance\.now\(\)-lastInteract\.at<INTERACT_GRACE_MS&&lastInteract\.it\.kind==='dungeonAct'\?lastInteract\.it:null\);it\?\.run\(\);/,'F greift, solange der Hinweis zuletzt sichtbar war');
});
test('F-Hinweis und Klassenanzeige: die Anzeige rückt im selben Takt über den Hinweis',()=>{
 assert.match(src('app.js'),/const ik=next&&!game\.dead\?next\.label:'';if\(ik!==interactKey\)\{interactKey=ik;updateClassHud\(game\);\}/);
});

// ── 1 · Reaktionsfenster und sicherer Platz ──────────────────────────────────────────────────────────────────────────────────────
test('Jede Lüge von Big B lässt nach dem Nachsatz mindestens 2,2 s bis zum Einschlag (Kanonenkugel, Doppelritt, „rechts und links“, Parkett, Pappkulisse)',()=>{
 const rows=[];for(const set of ['d-bigb','d-bigb2','d-bigb3'])for(const [type,c] of Object.entries(DUNGEON_CASTS[set].casts))if(c.lie&&(c.line||c.circles))rows.push({id:set+':'+type,after:c.total-(c.lie.tell??1)});
 assert.ok(rows.length>=5,'alle Varianten: '+rows.map(r=>r.id).join(', '));for(const r of rows)assert.ok(r.after>=2.2-1e-9,r.id+': '+r.after.toFixed(2)+' s');
});
test('„Ich reite nach RECHTS!“ / „… und links.“: sicherer Streifen in der Mitte, Handlung „In die Mitte“ mit Lauftaste von beiden Seiten, in der Mitte „Stehen bleiben [Mitte]“',()=>{
 const g=game(),r=ready(g,{mercs:[]}),b=bigbOf(g);b.aggro=true;b.ai='combat';const c=DUNGEON_CASTS['d-bigb3'].casts.kanone3;
 for(const flip of [false,true]){const lanes=laneRects(r,b,c),m=i=>flip?lanes.length-1-i:i,k={...c,type:'kanone3',lanes,claimLane:m(0),truthLanes:c.line.truth.map(m),told:true,lie:c.lie};
  const x0=Math.min(...lanes.map(l=>l.x)),x1=Math.max(...lanes.map(l=>l.x+l.w)),y=lanes[0].y+lanes[0].h*.5;
  for(const [fx,expect] of [[.1,'in'],[.9,'in'],[.5,'hold']]){Object.assign(g.player,{x:x0+(x1-x0)*fx,y});const a=laneAction(g,k);
   assert.equal(a.arrow,expect,(flip?'gespiegelt ':'')+fx+': '+JSON.stringify(a));if(expect==='in'){assert.equal(a.hint,DUI.answers.middle);assert.ok(a.key,'mit Taste');}else assert.equal(a.sideLabel,DUI.answers.side.middle);}}
 const art=src('dungeon-bigb-art.js');assert.match(art,/function drawSafe\(c,k,t\)/);assert.match(art,/if\(!told\)return;\n drawSafe\(c,k,t\);/,'grüne sichere Streifen nach dem Nachsatz');
});
test('Warnleiste: beim Nachsatz zeichnet sie im selben Bild neu (kein 50-ms-Takt dazwischen)',()=>{
 assert.match(src('boss-alerts.js'),/const lie=lieSig\(\);if\(now-last<50&&lie===lastLie\)return;/);
});

// ── 2 · Todesrückblick ───────────────────────────────────────────────────────────────────────────────────────────────────────
test('Todesrückblick: Treffer gebündelt, Todesschlag unten, Rest als „+ n weitere“ – die Zeilen ergeben genau Σ; Ursache = größter Brocken',()=>{
 const R=DEATH_UI.recap,h=(skill,amount,ago,extra={})=>({by:'Big B',skill,amount,ago,...extra});
 // wie Tod 2 des Prüfers: eine Kugel, dann nur noch Trümmer
 const a=deathRecap([h('Ritt auf der Kanonenkugel',494,4),h('Trümmer',70,4),h('Trümmer',70,3),h('Trümmer',70,2),h('Trümmer',70,1),h('Trümmer',70,0)]);
 assert.equal(a.sum,844);assert.equal(a.rows.reduce((n,x)=>n+x.amount,0)+(a.rest?.amount||0),844,'Zeilen = Σ');assert.deepEqual(a.rows.map(x=>x.skill+'×'+x.count),['Ritt auf der Kanonenkugel×1','Trümmer×5']);
 assert.ok(a.rows.at(-1).fatal,'Todesschlag unten');assert.equal(a.cause.skill,'Ritt auf der Kanonenkugel','Ursache: die Kugel, nicht Trümmer 70');
 const c=deathCause({by:'Big B',skill:'Trümmer',amount:70},[],a);assert.equal(c.skill,'Ritt auf der Kanonenkugel');assert.equal(c.amount,494);
 // viele verschiedene Quellen: höchstens R.rows Zeilen mit Rest-Zeile, Summe stimmt, chronologisch
 const many=[h('Siegelring',260,9),{by:'Follower',skill:'Selfie mit Blitz',amount:140,ago:8},h('',120,7,{auto:true}),h('Ritt auf der Kanonenkugel',988,6),{by:'Follower',skill:'Selfie mit Blitz',amount:140,ago:5},h('Das Parkett ist echt',420,4),h('Trümmer',70,2),h('Trümmer',70,0)];
 const b=deathRecap(many),sum=many.reduce((n,x)=>n+x.amount,0);assert.equal(b.sum,sum);assert.ok(b.rows.length+(b.rest?1:0)<=R.rows,'höchstens '+R.rows+' Zeilen');assert.ok(b.rest&&b.rest.count>=1,'Rest-Zeile');
 assert.equal(b.rows.reduce((n,x)=>n+x.amount,0)+b.rest.amount,sum,'Zeilen = Σ');assert.ok(b.rows.some(x=>x.skill==='Ritt auf der Kanonenkugel'),'größter Brocken gezeigt');assert.equal(b.rows.at(-1).skill,'Trümmer');
 assert.deepEqual(b.rows.map(x=>x.ago),[...b.rows.map(x=>x.ago)].sort((p,q)=>q-p),'chronologisch');assert.equal(b.cause.amount,988);
 const html=deathHtml(deathCause({by:'Big B',skill:'Trümmer',amount:70},[],b),{},{name:'Weinkeller'},b);
 assert.match(html,/ds-recap-rest/);assert.match(html,new RegExp(R.rest(b.rest.count).replace('+','\\+')));assert.match(html,/is-fatal/);assert.match(html,/Kanonenkugel · 988/,'Ursache im Kopf');
 assert.equal(deathRecap([h('Trümmer',70,0)]),null);
});
test('Todesfenster im Dungeon klein und oben mittig unter dem Bossrahmen – die Bildmitte bleibt frei',()=>{
 const s=src('death-screen.js'),css=src('dungeon-fix5.css');assert.match(s,/function placeTop\(\)/);assert.doesNotMatch(s,/placeAboveBar/);
 assert.match(s,/need=Math\.round\(r&&r\.height\?r\.bottom\+34:innerHeight\*\.02\)/);assert.match(s,/topAt=Math\.max\(topAt,need\)/,'springt nicht mit der Zauberleiste hin und her');assert.match(css,/body:not\(\.touch-mode\) \.death-screen\.ds-dungeon\{min-width:0;width:min\(330px,92vw\)/);
});

// ── 3 · Truppe, 4 · Erinnerung, 6 · Tooltips ─────────────────────────────────────────────────────────────────────────────────
test('„Deine Truppe“ am Desktop kompakt (Befehl und Vertrag im Tooltip) und dichter statt Scrollen',()=>{
 const css=src('dungeon-fix5.css'),lay=src('unit-layout.js'),ui=src('companion-ui.js');
 assert.match(css,/body:not\(\.touch-mode\) \.companion-frame\{min-height:0;height:54px;/);assert.match(css,/\.companion-frame \.companion-frame-meta\{display:none\}/);
 assert.match(lay,/if\(!dense&&dock\.scrollHeight>dock\.clientHeight\+1\)\{dock\.classList\.add\('unit-dock-dense'\)/);assert.match(ui,/row\.dataset\.tooltipNote=note/);
 // 4 × 54 px + Abstände + Kopf passen unter den Heldenrahmen mit Buffs (Desktop 900 px hoch, Chat unten)
 assert.ok(4*54+3*4+34<=330);
});
test('Erinnerung als kompakte Meldung: eine Zeile mit Symbol und Titel, der Text im Tooltip, Klick öffnet Bild und Text – auch am Handy',()=>{
 for(const f of MEMORY_FRAGMENTS){const html=memoryCardHtml(f);assert.ok(!html.includes('<img')&&!html.includes('<p>'),f.id+': keine Textwand');assert.match(html,/data-memory-card-art/);assert.match(html,/data-tooltip-note="[^"]{40,}"/,f.id+': Text im Tooltip');}
 assert.ok(noticeMs()>=6000&&noticeMs()<=12000,'kurze Standzeit: '+noticeMs());
 assert.match(src('app.js'),/const card=true\/\* Dungeon-Fix 5/);assert.match(src('dungeon-fix5.css'),/body\.touch-mode \.game-shell \.memory-card-close\{width:44px;height:44px\}/);
});
test('Tooltips über der Maus erst nach echter Bewegung: pointerover an derselben Stelle zählt nicht',()=>{
 const s=src('popup-controls.js');assert.match(s,/if\(lastPt&&e\.clientX===lastPt\.x&&e\.clientY===lastPt\.y\)return;/);assert.match(s,/const moved=!lastPt\|\|e\.clientX!==lastPt\.x\|\|e\.clientY!==lastPt\.y;/);
});
