// Dungeon-Fix 4 (docs/DUNGEON-FIX4-2026-09-26.md, Nachprüfung des Prüfers live Build #726, docs/PLAYTEST-2026-09-26-dungeon-bigb-2.md):
// 1 Jede Richtungszeile hat eine erkennbare Handlung: laufen = Pfeil + Lauftaste, bleiben = Halten-Symbol + „Stehen bleiben“ + sichere Seite
//   (alle Bahn-Zauber × Seiten × Standorte des Helden)
// 2 Nach dem Nachsatz ≥ 2,0 s bis zum Treffer; der Kampf mit Big B beginnt erst nach der Einleitung, der erste Zauber nach der Anlaufzeit
// 3 Einleitung: Big B bemerkt niemanden von selbst; F am Thron „Beweise vorlegen (n)“ bzw. „Big B ansprechen“; Thron erreicht oder Angriff
//   spricht ihn an; Ausreden, Begrüßung, dann Kampf; Lupen und Geständnis mit Wirkung im Tooltip
// 4 Endtruhe mit offener Wahl beim Verlassen: chestPending; Liegengebliebenes mit Inhalt für die Meldung
// 5 Todesrückblick: die letzten Treffer mit Quelle und Schaden
// 8 Sterbefenster: im Kampf zweitrangig mit Bestätigung, kein Fokus auf dem Knopf
// 9 Mechanik auf einem Söldner: nur Info (Name, keine Taste)
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game,recentHits} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_UI as DUI,DUNGEON_TEXT,DEATH_UI,describeCast} from '../content/index.js';
import {toWorld,roomAt,laneRects,bossHeld,addressBoss,introState,chestPending,dungeonInteraction,dungeonAct} from '../dungeon.js';
import {takeLoot} from '../rpg.js';
import {heroAnswer,laneAction,otherTarget} from '../alert-answer.js';
import {deathRecap,deathHtml,deathCause} from '../death-screen.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'],DAY=Date.UTC(2026,8,26,12);
function game(level=10){const g=new Game(world,{level,tutorial:{version:1,step:8,completed:true}},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
const inside=g=>{assert.ok(g.enterDungeon('schloss-bigb',{force:true}));return g.dungeonRun;};
const at=(g,f,x,y)=>{Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,f,x,y)),9));g.player.inCombat=0;g.moveTo=null;g.path=[];};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb');
/** Vor Big B wie der Testzugang bigb: Siegel da, Trash weg, drei Beweise gefunden (nicht vorgelegt), vier Söldner im Weinkeller-Gang. */
function ready(g,{found=['mietvertrag','leihschein','kirmesurkunde'],mercs=MERCS}={}){const r=inside(g);quiet(g);for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);for(const id of found)r.found.add(id);r.version++;
 for(const id of mercs)g.hireCompanion(id,{free:true});at(g,'k2',48,26);for(const c of g.companions){const q=g.world.findClear(g.player.x+10,g.player.y+10,9);c.x=q.x;c.y=q.y;}return r;}

// ── 1 · Richtungszeilen ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Jede Richtungszeile hat eine Handlung: laufen mit Pfeil und Lauftaste, bleiben mit Halten-Symbol, „Stehen bleiben“ und sicherer Seite',()=>{
 const g=game(),r=ready(g,{mercs:[]}),b=bigbOf(g);b.aggro=true;b.ai='combat';let n=0;const seen=new Set();
 const lanesCasts=[];for(const [set,s] of Object.entries(DUNGEON_CASTS))for(const [type,c] of Object.entries(s.casts))if(c.line&&c.lie)lanesCasts.push({set,type,c});
 assert.ok(lanesCasts.length>=3,'Bahn-Zauber mit Lüge');
 for(const {set,type,c} of lanesCasts)for(const flip of [false,true]){const lanes=laneRects(r,b,c),m=i=>flip?lanes.length-1-i:i,k={...c,type,lanes,claimLane:m(c.line.claim??0),truthLanes:(c.line.truth||[]).map(m),told:true,lie:c.lie};
  const x0=Math.min(...lanes.map(l=>l.x)),x1=Math.max(...lanes.map(l=>l.x+l.w)),y=lanes[0].y+lanes[0].h*.6,d=describeCast(set,type);
  for(let i=0;i<=40;i++){const x=x0+2+(x1-x0-4)*i/40;Object.assign(g.player,{x,y});g.dead=false;const a=heroAnswer(g,{cast:c,live:k,active:true,d}),where=set+'.'+type+(flip?' gespiegelt':'')+' x='+Math.round(x-x0);n++;seen.add(a.hint);
   assert.ok(a.hint&&!/^[„…]/.test(a.hint),where+': Handlung statt Zitat');
   if(a.hold){assert.equal(a.arrow,'hold',where+': Halten-Symbol');assert.equal(a.hint,DUI.answers.stay,where+': „Stehen bleiben“');assert.ok(Object.values(DUI.answers.side).includes(a.sideLabel),where+': sichere Seite '+a.sideLabel);
    assert.ok(!(k.truthLanes.map(i=>lanes[i]).some(l=>x>=l.x&&x<=l.x+l.w)),where+': „bleiben“ nur außerhalb der echten Bahn');}
   else{assert.ok(['left','right','in'].includes(a.arrow),where+': Pfeil '+a.arrow);assert.ok(/^[A-ZÄÖÜ←→↑↓]{1,5}$/.test(a.key),where+': Lauftaste '+a.key);
    assert.ok([DUI.answers.left,DUI.answers.right,DUI.answers.middle].includes(a.hint),where+': '+a.hint);}}}
 for(const h of [DUI.answers.left,DUI.answers.right,DUI.answers.middle,DUI.answers.stay])assert.ok(seen.has(h),'Fall gesehen: '+h);assert.ok(n>=240,'Fälle: '+n);
 // Der alte Wortlaut ohne Handlung taucht nicht mehr auf
 assert.ok(![...seen].some(h=>[DUI.answers.stayLeft,DUI.answers.stayRight,DUI.answers.stayMiddle].includes(h)),'kein „Links bleiben“/„Mitte halten“ ohne Symbol');
 // Bodenstellen nach dem Nachsatz: „Stehen bleiben“ trägt ebenfalls das Halten-Symbol
 const park=DUNGEON_CASTS['d-bigb2'].casts.parkett,ps=heroAnswer(g,{cast:park,live:{...park,type:'parkett',told:true,spots:[{x:g.player.x+400,y:g.player.y}]},active:true,d:describeCast('d-bigb2','parkett')});
 assert.deepEqual([ps.hint,ps.arrow,ps.hold],[DUI.answers.stay,'hold',true]);
});

// ── 9 · Mechanik auf einem Söldner ─────────────────────────────────────────────────────────────────────────────────────────────
test('Siegelring auf einem Söldner: nur Info mit Namen, keine Taste – auf dem Helden weiter mit Taste',()=>{
 const g=game();ready(g);const ring=DUNGEON_CASTS['d-bigb'].casts.siegelring,d=describeCast('d-bigb','siegelring'),peter=g.companions.find(c=>c.id==='merc-pils-peter');
 const live={...ring,type:'siegelring',focus:peter.id,track:true};let a=heroAnswer(g,{cast:ring,live,active:true,d});
 assert.deepEqual([a.kind,a.hint,a.key,a.hold,a.info],['info',DUI.answers.onUnit(peter.name),'',true,true],'läuft auf Pils-Peter');
 a=heroAnswer(g,{cast:ring,active:false,d,focus:peter.id});assert.equal(a.info,true,'der nächste geht auf den, der Big B hält');
 a=heroAnswer(g,{cast:ring,live:{...live,focus:'player'},active:true,d});assert.equal(a.info,false);assert.ok([DUI.answers.dodge,DUI.answers.parry].includes(a.hint),'auf dem Helden: Parieren bzw. Ausweichen');assert.ok(a.key,'mit Taste');
 a=heroAnswer(g,{cast:ring,active:false,d,focus:null});assert.equal(a.info,false,'ohne Halter: wie bisher');
 assert.equal(otherTarget(g,DUNGEON_CASTS['d-bigb'].casts.kanone,{focus:peter.id},null),'','Bahnen treffen alle – nie nur Info');
 const src=readFileSync(new URL('../boss-alerts.js',import.meta.url),'utf8');assert.match(src,/focus:r\.track&&!r\.active&&!r\.e\?bossRef\?\.focus/,'Warnleiste gibt den Halter weiter');assert.match(src,/ba-info/);
});

// ── 2 · Reaktionszeit ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Nach dem Nachsatz mindestens 2,0 s bis zum Treffer (Kanonenkugel 2,2 s), die Handlung steht im selben Takt wie der Nachsatz',()=>{
 for(const [set,s] of Object.entries(DUNGEON_CASTS))for(const [type,c] of Object.entries(s.casts))if(c.lie&&c.line)assert.ok(c.total-(c.lie.tell??1)>=2.2-1e-9,set+'.'+type+': '+(c.total-(c.lie.tell??1)).toFixed(1)+' s');
 const g=game(),r=ready(g,{mercs:[]}),b=bigbOf(g);g.adminGod=true;b.aggro=true;b.ai='combat';b.engaged=true;b.castSet='d-bigb';b.cycle=0;b.attackTimer=0;at(g,'k2',54,24);g.startCast(b);const k=b.cast;
 let revealedAt=null,left=null;for(let t=0;t<4&&b.cast===k;t+=.05){g.tick(.05);if(k.told&&revealedAt==null){revealedAt=t;left=k.remaining;const a=heroAnswer(g,{cast:DUNGEON_CASTS['d-bigb'].casts.kanone,live:k,active:true,d:describeCast('d-bigb','kanone')});assert.ok(a.arrow,'Handlung im selben Takt: '+a.hint);}}
 assert.ok(revealedAt!=null,'Nachsatz kam');assert.ok(left>=2,'nach dem Nachsatz noch '+left.toFixed(2)+' s');
});

// ── 3 · Einleitung ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Big B bemerkt niemanden von selbst: Betreten und Warten im Thronsaal beginnt keinen Kampf; F am Thron bietet „Beweise vorlegen (3)“',()=>{
 const g=game();ready(g);const b=bigbOf(g),I=DUNGEON_BOSSES.bigb.intro;assert.ok(I&&I.reach<I.talk,'Einleitung in den Daten');
 at(g,'k2',54,12+I.reach+2.5);run(g,6);assert.equal(b.aggro,false,'kein Kampf beim Betreten');assert.ok(bossHeld(g,b));assert.equal(introState(g),null,'noch keine Einleitung');
 const it=dungeonInteraction(g);assert.equal(it?.act,'address','F am Thron');assert.equal(it.name,'Beweise vorlegen (3)');
 g.target=b;assert.equal(g.damage(b,500,'Autoangriff'),0,'wartet: kein Schaden');assert.ok(introState(g),'der Angriff spricht ihn an');assert.equal(b.hp,b.maxHp);
 // ohne gefundene Beweise: „Big B ansprechen“
 const h=game();ready(h,{found:[]});at(h,'k2',54,12+I.reach+2.5);assert.equal(dungeonInteraction(h)?.name,DUNGEON_TEXT.intro.address);
});

test('Einleitung: Beweise liegen, Ausreden im Abstand, Begrüßung, dann fällt die Tür mit der Gruppe drin – erster Zauber nach der Anlaufzeit',()=>{
 const g=game(),r=ready(g),b=bigbOf(g),I=DUNGEON_BOSSES.bigb.intro,gap=DEF.evidence.present.gap;at(g,'k2',54,12+I.reach+2.5);
 const it=dungeonInteraction(g);assert.equal(it?.act,'address');assert.ok(dungeonAct(g,it).ok,'angesprochen');
 assert.equal(r.evidence.size,3,'alle drei vorgelegt');assert.ok(g.toasts.some(t=>/Big B schwitzt/.test(t)),'„Big B schwitzt“');const st=introState(g);assert.ok(st);assert.ok(Math.abs(st.total-(3*gap+I.line))<.11,'Dauer '+st.total);
 const barks=[];const bark=g.bark.bind(g);g.bark=(u,t,k)=>{if(u===b)barks.push(t);return bark(u,t,k);};
 let t=0;while(!b.aggro&&t<20){run(g,.25);t+=.25;}assert.ok(b.aggro,'Kampf nach der Einleitung');assert.ok(t>=3*gap+I.line-.3,'nicht vor dem Ende der Einleitung: '+t+' s');
 assert.equal(barks.length,4,'drei Ausreden und die Begrüßung: '+barks.join(' | '));assert.match(barks.at(-1),/Willkommen/,'zuletzt die Begrüßung');
 run(g,.2);assert.equal(r.arena,'thronsaal','Tür zu');for(const c of g.companions)assert.equal(roomAt(DEF,c.x,c.y)?.id,'thronsaal',c.name+' ist drin');
 assert.ok(b.attackTimer>=I.opener-.5,'erster Zauber erst nach der Anlaufzeit: '+b.attackTimer.toFixed(1)+' s');assert.equal(b.cast??null,null,'keine Bahn beim Betreten');
});

test('Den Thron erreichen spricht Big B an; wer vorher geht, bricht die Einleitung ab – die Beweise bleiben vorgelegt',()=>{
 const g=game(),r=ready(g),b=bigbOf(g),I=DUNGEON_BOSSES.bigb.intro;at(g,'k2',54,12+I.reach-1);run(g,.1);assert.ok(introState(g),'Thron erreicht');assert.equal(r.evidence.size,3);
 at(g,'k2',38,26);run(g,.2);assert.equal(introState(g),null,'Held ging hinaus');assert.equal(b.aggro,false);run(g,3*DEF.evidence.present.gap);/* die Ausreden laufen zu Ende */
 at(g,'k2',54,12+I.reach-1);run(g,.1);const st=introState(g);assert.ok(st,'wieder angesprochen');assert.ok(st.total<=I.line+.1,'ohne neue Ausreden nur die Begrüßung: '+st.total);
});

test('Bossrahmen: Lupen und „Geständnis“ tragen ihre Wirkung im Tooltip; die Chips werden an Ort und Stelle nachgeführt',()=>{
 const src=readFileSync(new URL('../boss-alerts.js',import.meta.url),'utf8');
 assert.match(src,/confessedTip\(/,'Geständnis mit Schwelle und Wirkung');assert.match(src,/evidenceTip\+/,'Lupe nennt den Beweis');assert.match(src,/if\(sig!==chipSig\)/,'nur neu bauen, wenn Chips kommen oder gehen');
 assert.match(DUI.alerts.confessedTip(30,10),/30 %/);assert.match(DUI.alerts.confessedTip(15,0),/15 %/);assert.doesNotMatch(DUI.alerts.confessedTip(15,0),/mehr Schaden/);
 for(const [id,f] of Object.entries(DEF.evidence.effects))assert.ok(f.note&&f.note.length>10,id+': Wirkung');
});

// ── 4 · Endtruhe beim Verlassen ────────────────────────────────────────────────────────────────────────────────────────────────
test('Endtruhe mit offener Wahl: chestPending öffnet sie bzw. liefert denselben Beutel; gewählt → nichts offen; Verlassen nennt, was eingesammelt wurde',()=>{
 const g=game(),r=ready(g,{mercs:[]}),b=bigbOf(g);assert.equal(chestPending(g),null,'vor Big B nichts');b.aggro=true;b.ai='combat';g.kill(b);
 const bag=chestPending(g);assert.equal(bag?.choice,1,'nach Big B: Truhe mit Wahl');assert.ok(r.chest,'geöffnet');assert.equal(chestPending(g)?.id,bag.id,'derselbe Beutel');
 bag.leaveAsk=true;const back=toWorld(DEF,'k2',DEF.backExit.x,DEF.backExit.y);Object.assign(g.player,g.world.findClear(back.x,back.y,9));assert.ok(g.lootReachable(bag),'Rückfrage am Ausgang erreichbar');
 const pick=bag.items[1].id;assert.ok(takeLoot(g,bag.id,pick),'gewählt');assert.equal(chestPending(g),null,'gewählt: nichts mehr offen');assert.ok(g.rpg.inventory.some(e=>e.id===pick));
 // Ohne Wahl gehen: das erste Teil und der Boss-Beutel werden eingesammelt, run.gathered nennt es
 const h=game(),rh=ready(h,{mercs:[]}),bh=bigbOf(h);bh.aggro=true;bh.ai='combat';h.kill(bh);const cb=chestPending(h),first=cb.items[0].id;
 const ex=toWorld(DEF,'k2',DEF.backExit.x,DEF.backExit.y);Object.assign(h.player,h.world.findClear(ex.x,ex.y,9));h.player.inCombat=0;assert.ok(h.leaveDungeon(),'hinaus');
 assert.ok(rh.gathered,'eingesammelt');assert.ok(rh.gathered.items>=1,'Teile gezählt');assert.ok(rh.gathered.chest,'Truhe mit Namen');assert.ok(h.rpg.inventory.some(e=>e.id===first),'erstes Teil eingepackt');
 assert.match(DUNGEON_TEXT.lootGatheredShort(2,26),/2 Teile · 26 Pfandmarken/);assert.match(DUNGEON_TEXT.chest.leaveTaken('Sagenhafte Maifeldtreter'),/Maifeldtreter/);
 const ui=readFileSync(new URL('../dungeon-ui.js',import.meta.url),'utf8');assert.match(ui,/chestPending\(g\)/,'Verlassen fragt vorher');assert.match(ui,/bag\.leaveAsk=true/);
});

// ── 5 · Todesrückblick ────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Todesrückblick: die letzten Treffer mit Quelle und Schaden, die Summe darüber, der letzte Treffer unten',()=>{
 const g=game(),r=ready(g,{mercs:[]}),b=bigbOf(g);b.aggro=true;b.ai='combat';let ev=null;const emit=g.emit.bind(g);g.emit=(t,d)=>{if(t==='death')ev=d;return emit(t,d);};g.adminGod=false;
 const hits=[['Pappkulisse fällt',true,.2],[null,false,.1],['Trümmer',false,.03],[null,false,.1],['Trümmer',false,.03],['Trümmer',false,.03],['Trümmer',false,.03]];
 for(const [name,ground,pct] of hits){b.lastCast=name?{name,title:name,ground}:null;g.player.invulnerable=0;g.player.parry=0;if(name)g.hitPlayer(b,0,true,pct);else g.hitPlayer(b,90);/* Autoangriff: fester Schaden, kein Anteil */run(g,.8);}
 b.lastCast={name:'Trümmer'};g.player.invulnerable=0;g.hitPlayer(b,0,true,5);assert.ok(g.dead);assert.ok(ev?.recent?.length>=5,'Treffer im Ereignis: '+ev?.recent?.length);
 const rc=deathRecap(ev.recent);assert.equal(rc.rows.length,DEATH_UI.recap.rows,'höchstens fünf Zeilen');assert.equal(rc.rows.at(-1).skill,'Trümmer','der letzte Treffer unten');
 assert.ok(rc.rows.some(x=>x.auto&&x.skill),'Autoangriff benannt');assert.ok(rc.sum>=rc.rows.reduce((n,x)=>n+x.amount,0),'Summe über alle');assert.ok(rc.span>=4&&rc.span<=DEATH_UI.recap.window,'Zeitraum '+rc.span);
 const html=deathHtml(deathCause(ev,[]),{},{name:'Weinkeller'},rc);assert.equal((html.match(/ds-recap-row/g)||[]).length,rc.rows.length);assert.match(html,/Σ /);assert.ok(recentHits(g).length>=5);
 assert.equal(deathRecap([{by:'Big B',skill:'Trümmer',amount:70,ago:0}]),null,'ein einzelner Treffer braucht keinen Rückblick');
});

// ── 8 · Sterbefenster ─────────────────────────────────────────────────────────────────────────────────────────────────────────
test('Sterbefenster: im Kampf „Kampf aufgeben“ zweitrangig mit zweitem Klick; der Bildschirm fokussiert sich selbst, nicht den Knopf',()=>{
 const src=readFileSync(new URL('../death-screen.js',import.meta.url),'utf8');
 assert.match(src,/el\.focus\(\{preventScroll:true\}\)/,'Fokus auf dem Bildschirm');assert.doesNotMatch(src,/\[data-ds-wake\]'\)\?\.focus/,'kein Fokus auf dem Knopf (Tooltip ohne Hover)');
 assert.match(src,/st\?\.fight&&!st\.wiped&&performance\.now\(\)>armedUntil/,'erster Klick macht scharf');assert.match(src,/classList\.toggle\('outline-button',giveUp\)/,'zweitrangig im Kampf');
 assert.ok(DEATH_UI.dungeon.armed>=2&&DEATH_UI.dungeon.giveUp&&DEATH_UI.dungeon.giveUpArmed);
});

// ── 7 · F und Beutefenster ────────────────────────────────────────────────────────────────────────────────────────────────────
test('F bedient das nahe Weltobjekt und schließt kein Beutefenster; das Beutefenster steht neben der Verfolgung',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/\['dialog','memory','death'\]\.some\(id=>popups\.isOpen\(id\)\)\)closeModal/,'F schließt nur Gespräch und Erinnerung');
 assert.match(app,/chest&&distance\(game\.player,chest\)<distance\(game\.player,bag\)/,'Truhe vor fernerem Beutel');
 const pw=readFileSync(new URL('../popup-windows.js',import.meta.url),'utf8');assert.match(pw,/this\.dockArea\(\)\.right-\(widths\.loot/,'Beute links neben Minikarte und Verfolgung');
});


test('Nach dem Geständnis bzw. mit dem passenden Beweis zeigt die Vorschau kein „Nachsatz abwarten“ mehr',()=>{
 const g=game();ready(g,{mercs:[]});const c2=DUNGEON_CASTS['d-bigb2'].casts,kan=DUNGEON_CASTS['d-bigb'].casts.kanone;
 let a=heroAnswer(g,{cast:c2.parkett,active:false,d:describeCast('d-bigb2','parkett')});assert.equal(a.hint,DUI.answers.wait,'mit Lüge: abwarten');
 a=heroAnswer(g,{cast:c2.parkett,active:false,d:describeCast('d-bigb2','parkett'),noLie:true});assert.equal(a.hint,DUI.answers.spotOut);assert.ok(a.key,'mit Taste');
 a=heroAnswer(g,{cast:kan,active:false,d:describeCast('d-bigb','kanone'),noLie:true});assert.equal(a.hint,DUI.answers.laneOut);assert.match(a.key,/A · D/);
 const src=readFileSync(new URL('../boss-alerts.js',import.meta.url),'utf8');assert.match(src,/noLie:!r\.e&&!!bossRef&&\(!!bossRef\.confessed\|\|evidenceEffects/,'Warnleiste gibt Geständnis und Beweise weiter');
});

// ── 6 · Aufstieg und Erfolge nacheinander ─────────────────────────────────────────────────────────────────────────────────────
import {mountMilestones} from '../milestone-ui.js';
test('Aufstieg, dann die Erfolge als eine Einblendung – mit voller Zeit, auch wenn Kurzmeldungen warten',ctx=>{
 ctx.mock.timers.enable({apis:['setTimeout','setInterval']});
 let made=null;const el=()=>{const cls=new Set();return made={hidden:false,className:'',innerHTML:'',setAttribute(){},prepend(){},classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c)}};};
 const hadDoc='document' in globalThis,hadRaf='requestAnimationFrame' in globalThis;globalThis.document??={createElement:el};globalThis.requestAnimationFrame??=f=>setTimeout(f,0);
 try{let t=0,blocked=true;const tick=ms=>{t+=ms;ctx.mock.timers.tick(ms);};
  const m=mountMilestones({append(){}},{now:()=>t,blocked:()=>blocked,hurry:()=>true/* Kurzmeldungen warten */}),box=made;
  m.feat({name:'Der Nachsatz zählt',icon:'trait-lie'});m.feat({name:'Beweislast',icon:'lens'});m.feat({name:'Mieterschützer',title:true});m.level({level:11});
  assert.deepEqual(m.state().queued,['level','feat'],'Aufstieg zuerst, die Erfolge gebündelt dahinter');
  blocked=false;tick(450);assert.match(box.innerHTML,/11/,'Aufstieg läuft');
  let at=null,until=null;for(let i=0;i<120;i++){tick(100);const f=/Beweislast/.test(box.innerHTML)&&m.busy&&!box.hidden;if(f&&at==null)at=t;if(!f&&at!=null&&until==null){until=t;break;}}
  assert.ok(at!=null,'Erfolge gezeigt');assert.match(box.innerHTML,/Der Nachsatz zählt[\s\S]*Beweislast[\s\S]*Titel: Mieterschützer/,'alle Namen in einer Einblendung');assert.match(box.innerHTML,/3 Erfolge/);
  assert.ok((until??t)-at>=3200,'volle Zeit trotz wartender Kurzmeldungen: '+((until??t)-at)+' ms');
 }finally{if(!hadDoc)delete globalThis.document;if(!hadRaf)delete globalThis.requestAnimationFrame;}
});
