// Dungeon-Fix 3 (docs/DUNGEON-FIX3-2026-09-26.md, Big-B-Abnahme des Prüfers Build #721):
// 1 Nach dem Kampf hilft ein lebender Heil-Söldner auf (ohne Begrenzung), ohne Heiler steht der Held am Ort auf; der Knopf gibt keinen
//   gewonnenen Kampf auf; Aufstieg als Geist füllt kein Leben; der Todesschlag hat immer einen Namen
// 2 Beute nach dem Sieg: Boss-Beutel wartet in der Arena, Endtruhe steht sichtbar mitten im Thronsaal, Hinterausgang mit Schild,
//   Erfolg als Ereignis für die Einblendung oben (keine Kurzmeldung)
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_GHOST,COMPANION_ABILITIES,BALANCE,DUNGEON_UI} from '../content/index.js';
import {toWorld,roomAt,ghostState,standUpHere,endPropAt,chestShown} from '../dungeon.js';
import {deathCause,deathHtml} from '../death-screen.js';
import {endMarks} from '../dungeon-map-art.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'],DAY=Date.UTC(2026,8,26,12);
function game(level=10){const g=new Game(world,{level,tutorial:{version:1,step:8,completed:true}},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
const inside=g=>{assert.ok(g.enterDungeon('schloss-bigb',{force:true}));return g.dungeonRun;};
const at=(g,f,x,y)=>{Object.assign(g.player,toWorld(DEF,f,x,y));g.player.inCombat=0;};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb');
/** Big B zieht im Thronsaal, Held mit Söldnern (ids), wie dungeon-e3.test pullBigB. */
function pull(g,ids=MERCS){const r=inside(g);quiet(g);for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);r.version++;at(g,'k2',52,20);
 for(const id of ids)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}
 const b=bigbOf(g);b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;run(g,.3);return {r,b};}
const killHero=(g,b)=>{g.adminGod=false;g.player.invulnerable=0;g.player.parry=0;g.hitPlayer(b,g.player.maxHp*50,false);assert.ok(g.dead,'Held liegt');};
const susi=g=>g.companions.find(c=>c.id==='merc-schorle-susi');

test('Nach dem Sieg hilft die Heilerin auf – auch wenn ihr Aufhelfen im Kampf schon verbraucht war (zweiter Tod)',()=>{
 const g=game(),{r,b}=pull(g);const s=susi(g);s.reviveUsed=true;/* zweiter Tod: das eine Aufhelfen des Kampfs ist weg */
 killHero(g,b);run(g,1);assert.ok(g.dead,'im Kampf kein zweites Aufhelfen');assert.equal(ghostState(g).fight,true);
 const lvl=g.player.level;g.kill(b);assert.equal(g.player.level,lvl+1,'Big B bringt den Aufstieg');assert.equal(g.player.hp,0,'Aufstieg als Geist füllt kein Leben');assert.ok(g.dead,'Aufstieg weckt nicht');
 const st=ghostState(g);assert.equal(st.fight,false,'Kampf vorbei');assert.equal(st.wiped,false);assert.equal(st.healer,s.name);
 const body={x:g.player.x,y:g.player.y};let t=0;while(g.dead&&t<DUNGEON_GHOST.healerWait){run(g,.25);t+=.25;}
 assert.ok(!g.dead,'aufgeholfen nach '+t+' s');assert.ok(t<=COMPANION_ABILITIES.revive.afterCast+4,'nach dem Kampf schnell: '+t+' s');
 assert.equal(g.player.hp,Math.round(g.player.maxHp*COMPANION_ABILITIES.revive.afterShare),'Leben wie nach dem Kampf');assert.ok(Math.hypot(g.player.x-body.x,g.player.y-body.y)<2,'am Ort, kein Kontrollpunkt');
 assert.equal(bigbOf(g).hp,0,'nichts setzt zurück');assert.ok(r.killed.has('bigb'));assert.equal(g.player.inCombat,0,'nicht im Kampf');
 assert.ok(!g.toasts.some(x=>/aufgeholfen|hilft dir auf/.test(x)),'Söldnerzeilen nur im Chat: '+g.toasts.join(' | '));assert.ok(g.messages.some(m=>/aufgeholfen/.test(m.text)),'im Chat');
});

test('Ohne lebenden Heiler steht der Held nach Kampfende am Ort auf; der Knopf heißt dann „Hier aufstehen“',()=>{
 const g=game(),{b}=pull(g,MERCS.filter(id=>id!=='merc-schorle-susi'));killHero(g,b);run(g,.5);assert.equal(ghostState(g).healer,null);
 g.kill(b);const body={x:g.player.x,y:g.player.y},st=ghostState(g);assert.equal(st.fight,false);assert.equal(st.wiped,false);
 run(g,DUNGEON_GHOST.standUp-.6);assert.ok(g.dead,'noch nicht sofort');run(g,1);assert.ok(!g.dead,'nach '+DUNGEON_GHOST.standUp+' s am Ort aufgestanden');
 assert.ok(g.player.hp>=Math.round(g.player.maxHp*BALANCE.party.reviveHp)&&g.player.hp<g.player.maxHp*(BALANCE.party.reviveHp+.1),'Leben wie beim Aufhelfen (E-44): '+g.player.hp);assert.ok(Math.hypot(g.player.x-body.x,g.player.y-body.y)<2,'am Ort');
 // Knopf von Hand: sofort, ohne zu warten
 const h=game(),p=pull(h,MERCS.filter(id=>id!=='merc-schorle-susi'));killHero(h,p.b);h.kill(p.b);assert.ok(standUpHere(h),'Hier aufstehen');assert.ok(!h.dead);assert.equal(p.b.hp,0,'Boss bleibt liegen');
 const src=readFileSync(new URL('../death-screen.js',import.meta.url),'utf8');assert.match(src,/here\?D\.here:D\.wake/,'Knopf wechselt nach dem Kampf auf „Hier aufstehen“');
});

test('Im Kampf bleibt „Am Kontrollpunkt aufstehen“ die Aufgabe; nach einem Wipe hilft niemand am Ort auf',()=>{
 const g=game(),{b}=pull(g);killHero(g,b);assert.equal(standUpHere(g),false,'im Kampf kein Aufstehen am Ort');
 for(const c of g.companions){c.hp=1;c.state='down';c.downUntil=g.time+1;}run(g,.2);const st=ghostState(g);assert.equal(st.wiped,true,'alle liegen: Wipe');assert.equal(st.fight,false);
 assert.ok(b.hp>=b.maxHp&&!b.aggro,'Big B setzt zurück');run(g,DUNGEON_GHOST.healerWait+2);assert.ok(g.dead,'nach dem Wipe kein Aufstehen am Ort, auch nicht durch die Heilerin');
 assert.equal(standUpHere(g),false);g.respawn();assert.ok(!g.dead);assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id!=='thronsaal',true,'am Kontrollpunkt');
});

test('Todesschlag: immer mit Namen und Schaden – auch der Autoangriff und liegende Trümmer',()=>{
 const g=game(),{b}=pull(g);let ev=null;const emit=g.emit.bind(g);g.emit=(t,d)=>{if(t==='death')ev=d;return emit(t,d);};
 b.lastCast=null;killHero(g,b);assert.equal(ev.by,'Big B');assert.equal(ev.skill,b.autoAttack.name,'Autoangriff benannt');assert.ok(ev.amount>0,'Schaden');
 const html=deathHtml(deathCause(ev,[]),{},{name:'Weinkeller'});assert.match(html,new RegExp(b.autoAttack.name));assert.match(html,new RegExp(ev.amount.toLocaleString('de-DE')));
 const h=game(),p=pull(h);ev=null;const emit2=h.emit.bind(h);h.emit=(k,d)=>{if(k==='death')ev=d;return emit2(k,d);};h.player.hp=1;h.player.invulnerable=0;h.adminGod=false;
 p.r.hazards.push({x:h.player.x,y:h.player.y,radius:20,pct:2,until:h.time+9,boss:p.b,tick:0});run(h,.1);assert.ok(h.dead,'in Trümmern gefallen');assert.equal(ev.skill,DUNGEON_UI.traits.persist.name,'Trümmer benannt');
});

test('Beute nach dem Sieg: Endtruhe erscheint mitten im Thronsaal, Hinterausgang mit Schild – beides anklickbar und auf der Karte',()=>{
 const g=game(),{r,b}=pull(g);const chestPt=toWorld(DEF,DEF.chest.floor,DEF.chest.x,DEF.chest.y);
 assert.equal(roomAt(DEF,chestPt.x,chestPt.y)?.id,'thronsaal','Truhe im Thronsaal (aus der Arena zu sehen)');assert.equal(chestShown(r),false,'vor Big B keine Truhe');
 assert.equal(endPropAt(g,{x:chestPt.x,y:chestPt.y-6}),null,'vor dem Sieg nichts anzuklicken');assert.deepEqual(endMarks(r,'k2'),[]);
 g.kill(b);assert.ok(chestShown(r),'nach Big B steht sie');assert.deepEqual(endMarks(r,'k2').map(m=>m.kind),['chest','exit'],'Karte und Minikarte: Truhe und Ausgang');
 const prop=endPropAt(g,{x:chestPt.x+4,y:chestPt.y-20});assert.equal(prop?.kind,'chest','Klick auf die Truhe');assert.equal(prop.ready,true);
 Object.assign(g.player,g.world.findClear(chestPt.x,chestPt.y+14,9));assert.ok(endPropAt(g,chestPt).near,'nah genug zum Öffnen');assert.equal(g.interaction()?.kind,'dungeonChest','F an der Truhe');
 const bag=g.dungeonChest();assert.equal(bag?.choice,1);assert.equal(g.dungeonChest()?.id,bag.id,'noch nicht gewählt: derselbe Beutel');
 const ex=toWorld(DEF,'k2',DEF.backExit.x,DEF.backExit.y),sign=toWorld(DEF,'k2',DEF.backExit.sign.x,DEF.backExit.sign.y);
 assert.equal(endPropAt(g,{x:ex.x,y:ex.y-30})?.kind,'exit','Klick aufs Schild am Hinterausgang');assert.equal(endPropAt(g,{x:sign.x,y:sign.y-8})?.kind,'exit','Klick aufs Schild über der Schatzkammertür');
 assert.deepEqual(endMarks(r,'k2').map(m=>m.kind),['exit'],'geöffnete Truhe verschwindet von der Karte');
 const src=readFileSync(new URL('../dungeon-ui.js',import.meta.url),'utf8');assert.match(src,/data-dg-track-end/,'Verfolgung nennt Truhe und Ausgang');
});

test('Boss-Beutel wartet in der Arena ohne Frist; die Lichtsäule ist anklickbar; Erfolge kommen als Ereignis, nicht als Kurzmeldung',()=>{
 const g=game(),{b}=pull(g);killHero(g,b);g.kill(b);const bag=g.rpg.loot.find(x=>x.moment);assert.equal(bag?.room,'thronsaal');assert.equal(g.lootReachable(bag),false,'als Geist nicht');
 run(g,6);assert.ok(!g.dead);assert.ok(g.lootReachable(bag),'lebend in der Arena erreichbar');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/t>M\.wait&&!bag\.room/,'Arena-Beutel ohne Frist');assert.match(app,/lootBeamed\(b\)\?H\.beam:H\.up/,'Säule zählt zur Klickfläche');
 assert.ok(g.events.some(e=>e.type==='dungeonFeat'),'Erfolg als Ereignis');assert.ok(!g.toasts.some(t=>/^Erfolg/.test(t)),'keine Kurzmeldung „Erfolg …“: '+g.toasts.join(' | '));
 assert.match(app,/type==='dungeonFeat'\)milestones\?\.feat/,'Einblendung oben');
});
