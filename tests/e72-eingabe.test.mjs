// E-72 Runde 4 · Kenner-Playtest 25.09. abends, Kampfgefühl aller Klassen (Kürzel eingabe): Tastenvorwahl, Proc-Flut, „BEREIT“-Textsalat,
// Bodenziel. Browserprüfung mit Bildern: scripts/e72-eingabe-check.mjs → docs/e72-runde4/eingabe/.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {combatStats,actionBar} from '../rpg.js';
import {tryQueue,tickQueue,clearQueue,blocker,QUEUE_WINDOW,QUEUE_KEEP} from '../spell-queue.js';
import {lowHealthReady,freshProcState} from '../procs.js';
import {resourceVariant,resourceViral} from '../class-resources.js';
import {skillHelp} from '../mechanic-help.js';
import {chatLineKey,chatCountLabel} from '../chat-window.js';
import {settingOn} from '../options-ui.js';
import {COMBAT_FLOW_TUNING,TALENT_ROWS,RESOURCES,OPTIONS_UI,SETTING_DEFAULTS,describe} from '../content/index.js';

const world=()=>({id:'eingabe',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12){const g=new Game(world(),{classId,level});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=30,hp=1e7){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp,aggro:true,ai:'combat',attackTimer:1e9});e.spawnGrace=0;g.enemies.push(e);g.target=e;return e;}
const fails=g=>g.events.filter(e=>e.type==='toast'&&e.error).map(e=>e.text);
const run=(g,s,dt=1/60)=>{for(let t=0;t<s-1e-9;t+=dt)g.tick(dt);};
const BLOCK=/verschnaufen|nicht bereit|bereits einen Zauber/i;

test('Vorwahlfenster steht in content/tuning.js (COMBAT_FLOW_TUNING) und ist ≈ 0,4 s wie in WoW',()=>{
 assert.equal(QUEUE_WINDOW,COMBAT_FLOW_TUNING.queueWindow);assert.equal(QUEUE_KEEP,COMBAT_FLOW_TUNING.queueKeep);
 assert.ok(QUEUE_WINDOW>=.3&&QUEUE_WINDOW<=.5);assert.ok(QUEUE_KEEP>QUEUE_WINDOW);assert.ok(COMBAT_FLOW_TUNING.why&&COMBAT_FLOW_TUNING.since);
});

test('Schorsch: Abklingzeit kürzer als die GCD läuft mit der GCD ab – Knopfzahl und Fehlerzeile nennen die echte Restzeit',()=>{
 const g=hero('schorsch');foe(g);
 assert.equal(g.action('strike'),true);assert.ok(g.gcd>0);
 assert.ok(Math.abs(g.cooldowns.strike-g.gcd)<1e-9,'Grillzange (1,2 s) sperrt nicht kürzer als die GCD ('+g.gcd.toFixed(2)+' s)');
 run(g,g.gcd-.5);g.events.length=0;
 assert.equal(g.action('strike'),false);assert.equal(g.queued??null,null,'0,5 s vorher: noch außerhalb des Fensters');
 const f=fails(g);assert.equal(f.length,1);assert.match(f[0],/verschnaufen · 0,5 s/,'echte Restzeit statt „0,2 s“: '+f[0]);
 run(g,.2);g.events.length=0;assert.equal(g.action('strike'),false);assert.equal(g.queued?.id,'strike','im Fenster vorgemerkt');assert.deepEqual(fails(g),[],'keine Fehlerzeile im Fenster');
 run(g,.4);assert.equal(g.queued,null);assert.ok(g.cooldowns.strike>1,'ausgelöst, sobald die GCD vorbei ist');assert.deepEqual(fails(g),[]);
});

test('Vorwahl: der zuletzt gedrückte Kniff gewinnt; Esc, Laufen (Zauberzeit) und Zielwechsel verwerfen still',()=>{
 const g=hero('baerbel');const e=foe(g);g.player.energy=100;
 assert.equal(g.action('strike'),true);g.gcd=.3;
 assert.equal(g.action('throw'),false);assert.equal(g.queued?.id,'throw');
 assert.equal(g.action('mark'),false);assert.equal(g.queued?.id,'mark','anderer Druck ersetzt die Vormerkung');
 assert.equal(clearQueue(g),true);assert.equal(g.queued,null,'Esc');assert.equal(clearQueue(g),false);
 // Laufen: Kniff mit Zauberzeit verfällt, Sofortkniff bleibt
 const cast=g.skills.find(s=>s.castTime>0&&s.range&&!s.ground&&!s.mobile);assert.ok(cast,'Annis Kniff mit Zauberzeit');g.cooldowns[cast.id]=0;
 g.gcd=.3;assert.equal(g.action(cast.id),false);assert.equal(g.queued?.id,cast.id);g.keys.add('w');tickQueue(g);assert.equal(g.queued,null,'Laufen verwirft den Zauber');
 g.gcd=.3;g.action('mark');assert.equal(g.queued?.id,'mark');tickQueue(g);assert.equal(g.queued?.id,'mark','Sofortkniff bleibt beim Laufen vorgemerkt');g.keys.delete('w');
 // Zielwechsel von Hand: altes Ziel lebt noch → verworfen; Ziel stirbt → geht auf das neue
 const other=foe(g,40);g.target=e;g.gcd=.3;g.action('mark');g.target=other;g.gcd=0;g.events.length=0;
 assert.equal(tickQueue(g),false);assert.equal(g.queued,null);assert.deepEqual(fails(g),[],'still verworfen');
 g.target=e;g.gcd=.3;g.cooldowns.mark=0;g.action('mark');e.hp=0;g.target=other;g.gcd=0;assert.equal(tickQueue(g),true,'Ziel tot: Kniff geht auf das neue Ziel');
 g.gcd=.3;g.cooldowns.strike=0;g.action('strike');other.hp=0;g.target=null;g.gcd=0;g.events.length=0;assert.equal(tickQueue(g),false);assert.equal(g.queued,null);assert.deepEqual(fails(g),[],'kein Ziel mehr: still statt „Kein Ziel“');
});

test('Käthes schnelle Karten (kurze GCD) laufen durch die Vorwahl ohne Fehlerzeile; die Karte bleibt die des gedrückten Platzes',()=>{
 const g=hero('kaethe');foe(g);let played=0;g.events.length=0;
 for(let i=0;i<12;i++){const slot=['strike','mark','burst'][i%3];if(!g.res.hand[['strike','mark','burst'].indexOf(slot)])continue;
  // drücken, sobald die GCD im Fenster ist (so früh wie erlaubt)
  while(g.gcd>QUEUE_WINDOW-.05)g.tick(1/60);const before=g.gcd;g.action(slot);if(before<=0||g.queued)played++;run(g,.5);}
 assert.ok(played>=8,'Karten gespielt: '+played);assert.deepEqual(fails(g).filter(t=>BLOCK.test(t)),[],'keine Sperr-Fehlerzeile');
});

test('Schorschs Auflegen ist ein Handgriff ohne GCD: geht sofort mitten in der GCD, vorgemerkt wartet es nur auf die eigene Abklingzeit',()=>{
 const g=hero('schorsch');foe(g);
 assert.equal(g.action('strike'),true);assert.ok(g.gcd>.5);
 assert.equal(g.action('mark'),true,'Auflegen mitten in der GCD');assert.equal(g.queued??null,null);
 const cd=g.cooldowns.mark;assert.ok(cd>QUEUE_WINDOW);assert.equal(blocker(g,g.skills.find(s=>s.id==='mark')).by,'cd','die GCD sperrt den Handgriff nicht');
 g.cooldowns.mark=.3;g.gcd=1;assert.equal(g.action('mark'),false);assert.equal(g.queued?.id,'mark');
 run(g,.35);assert.equal(g.queued,null,'ausgelöst');assert.ok(g.gcd>0,'obwohl die GCD noch läuft');assert.ok(g.cooldowns.mark>1);
});

test('Menschliche Rotation nach der Knopfzahl (0,15–0,25 s zu früh): keine einzige Sperr-Fehlerzeile, in allen fünf Klassen (vorher: Dieter 1, Anni 2 – Zahl 0,1 bei 1,0 s GCD)',()=>{
 for(const classId of ['dieter','baerbel','kevin','schorsch','kaethe']){
  const g=hero(classId);foe(g);const bar=actionBar(g).filter(id=>{const s=g.skills.find(x=>x.id===id);return s&&!s.auto&&!s.ground&&!['dash','heal','buff','parry','interrupt'].includes(id);}).slice(0,4);
  let t=0,k=0,presses=0,lead=.15;const errors=[];
  while(t<30){g.player.hp=g.player.maxHp;g.player.energy=Math.max(g.player.energy,60);
   const id=bar[k%bar.length],s=g.skills.find(x=>x.id===id),cd=g.cooldowns[id]>.05?g.cooldowns[id]:0,shown=cd>0?cd/* läuft eine Abklingzeit, liest der Spieler nur die Zahl */:Math.max(s.offGcd?0:g.gcd,g.casting&&!s.offGcd?g.casting.remaining:0);
   if(shown<=lead){g.events.length=0;g.action(id);presses++;errors.push(...fails(g).filter(t=>BLOCK.test(t)));k++;lead=lead>=.25?.15:lead+.05;}
   g.tick(1/60);t+=1/60;}
  assert.ok(presses>15,classId+': '+presses+' Drücke');assert.deepEqual(errors,[],classId+': Sperr-Fehlerzeilen');
 }
});

test('Proc-Flut: „unter 35 % Leben“ zündet einmal beim Unterschreiten, nicht bei jedem Treffer; wieder scharf erst über der Schwelle und nach der Abklingzeit',()=>{
 const [spec,idx]=Object.entries(TALENT_ROWS).flatMap(([spec,rows])=>rows.map((t,i)=>[spec,i,t])).find(([,,t])=>t.effects?.['proc:pfand-zurueck']);
 const g=hero('dieter');g.rpg.talents.spec=spec;g.rpg.talents.learned.push(spec+'-'+idx);assert.equal(combatStats(g)['proc:pfand-zurueck'],1);
 const e=foe(g);const procs=()=>g.events.filter(x=>x.type==='proc'&&x.id==='pfand-zurueck').length;
 const T=COMBAT_FLOW_TUNING.lowHealth,p=g.player;
 p.hp=Math.round(p.maxHp*(T.below+.05));g.events.length=0;
 g.hitPlayer(e,p.maxHp*.1,false);assert.ok(p.hp<p.maxHp*T.below);assert.equal(procs(),1,'Unterschreiten → einmal');
 for(let i=0;i<5;i++){p.hp=Math.round(p.maxHp*.3);g.hitPlayer(e,1,false);}assert.equal(procs(),1,'weitere Treffer darunter zünden nicht');
 assert.equal(g.messages.filter(m=>/^Proc · Fällt dein Leben/.test(m.text)).length,1,'eine Protokollzeile');
 p.hp=p.maxHp;g.tick(.05);p.hp=Math.round(p.maxHp*.36);g.hitPlayer(e,p.maxHp*.05,false);assert.equal(procs(),1,'wieder über der Schwelle, aber interne Abklingzeit läuft');
 g.time+=T.icd;p.hp=p.maxHp;g.tick(.05);p.hp=Math.round(p.maxHp*.36);g.hitPlayer(e,p.maxHp*.05,false);assert.equal(procs(),2,'nach '+T.icd+' s und erneutem Unterschreiten');
 // reine Funktion
 const h={player:{hp:30,maxHp:100},time:0,procState:freshProcState()};assert.equal(lowHealthReady(h),true);assert.equal(lowHealthReady(h),false);h.player.hp=80;assert.equal(lowHealthReady(h),false,'über der Schwelle nie');
});

test('Proc-Beschreibung nennt die interne Abklingzeit der Unter-35-%-Regeln',()=>{
 const d=describe('proc','pfand-zurueck');const nums=JSON.stringify(d);assert.match(nums,/Höchstens alle/);assert.ok(nums.includes(String(COMBAT_FLOW_TUNING.lowHealth.icd)));
});

test('Chat: gleiche aufeinanderfolgende Zeilen teilen einen Schlüssel und zeigen „×N“; andere Kanäle, Absender oder Wortlaute nicht',()=>{
 const a=chatLineKey('events',{text:'Proc · Unter 35 % Leben …'});
 assert.equal(chatLineKey('events',{text:'Proc · Unter 35 % Leben …'}),a);
 assert.notEqual(chatLineKey('loot',{text:'Proc · Unter 35 % Leben …'}),a);assert.notEqual(chatLineKey('events',{text:'Proc · anders'}),a);
 assert.notEqual(chatLineKey('chat',{from:'Kalle',text:'hi'}),chatLineKey('chat',{from:'Ida',text:'hi'}));
 assert.notEqual(chatLineKey('loot',{html:'<b>x</b>'}),chatLineKey('loot',{text:'<b>x</b>'}));
 assert.equal(chatCountLabel(1),'');assert.equal(chatCountLabel(5),'×5');
 const src=readFileSync(new URL('../chat-window.js',import.meta.url),'utf8');assert.match(src,/last\.key===key/);assert.match(src,/chat-count/);
});

test('Kampftext: gleiche Meldung ohne Zahl (BEREIT) wird eine Zeile „×N“ statt eines Stapels',()=>{
 const src=readFileSync(new URL('../combat-text.js',import.meta.url),'utf8');assert.match(src,/noteKey\(r\.e\)===noteKey\(e\)/);assert.match(src,/' ×'\+echo\.n/);
});

test('Aperol-Hype: VIRAL steht nicht mehr auf jedem Knopf (kein Varianten-Icon), sondern als Rahmen + Tooltipzeile',()=>{
 const g=hero('baerbel');foe(g);g.res.viral=1;
 const cost=g.skills.filter(s=>s.cost>0).map(s=>s.id);assert.ok(cost.length>=2);
 for(const id of cost){assert.notEqual(resourceVariant(g,id)?.name,'VIRAL',id);assert.equal(resourceViral(g,id),true,id);assert.ok(skillHelp(g,id).includes(RESOURCES.baerbel.hud.viralTip),id);}
 assert.equal(resourceViral(g,'auto'),false);g.res.viral=0;assert.equal(resourceViral(g,cost[0]),false);assert.ok(!skillHelp(g,cost[0]).includes(RESOURCES.baerbel.hud.viralTip));
 assert.equal(resourceViral(hero('dieter'),'burst'),false);
 const css=readFileSync(new URL('../spielfluss-r5a.css',import.meta.url),'utf8');assert.match(css,/\.skill\.viral-free/);
});

test('Bodenziel: ein anderer Kniff schließt den Zielmodus und läuft selbst; die ausgelöste Vormerkung schließt ihn nicht',()=>{
 const g=hero('dieter');foe(g);g.player.energy=100;
 assert.equal(g.action('ground'),false);assert.equal(g.aiming,'ground');
 assert.equal(g.action('strike'),true);assert.equal(g.aiming,null,'Zielmodus zu');assert.ok(g.cooldowns.strike>0,'Kelle ausgeführt');
 g.gcd=.3;g.action('throw');assert.equal(g.queued?.id,'throw');
 assert.equal(g.action('ground'),false);assert.equal(g.aiming,'ground');assert.equal(g.queued,null,'neuer Bodenkniff ersetzt die Vormerkung');
 g.queued={id:'throw',point:null,friend:null,at:g.time,targetId:g.target.id};g.gcd=0;g.cooldowns.throw=0;tickQueue(g);assert.equal(g.aiming,'ground','Vormerkung löst aus, Zielmodus bleibt');
});

test('Bodenkniffe sofort an der Maus (Einstellung, Standard aus): mit Maus über der Welt ohne Zielkreis, sonst Zielkreis',()=>{
 assert.equal(SETTING_DEFAULTS.groundAtCursor,false);assert.equal(settingOn({},'groundAtCursor'),false);assert.equal(settingOn({groundAtCursor:true},'groundAtCursor'),true);
 assert.ok(OPTIONS_UI.sections.game.some(s=>s.rows.some(r=>r.setting==='groundAtCursor')),'Zeile im Einstellungsfenster');
 const off=hero('dieter');foe(off);off.player.energy=100;off.hover={x:60,y:10};assert.equal(off.settings.groundAtCursor,false);off.action('ground');assert.equal(off.aiming,'ground','Standard: Zielkreis');
 const g=new Game(world(),{classId:'dieter',level:12,settings:{groundAtCursor:true}});g.random=()=>.5;g.player.x=g.player.y=0;foe(g);g.player.energy=100;
 assert.equal(g.settings.groundAtCursor,true,'Einstellung wird gespeichert und geladen');
 g.hover={x:60,y:10};const ok=g.action('ground');assert.equal(g.aiming,null);assert.ok(ok||g.casting,'gewirkt');
 if(g.casting)assert.deepEqual(g.casting.point,{x:60,y:10},'an der Mausposition');
 const h=new Game(world(),{classId:'dieter',level:12,settings:{groundAtCursor:true}});h.player.x=h.player.y=0;foe(h);h.player.energy=100;h.hover=null;h.action('ground');assert.equal(h.aiming,'ground','Maus über der Leiste: Zielkreis');
});

test('Taste gedrückt halten (WoW „Gedrückt halten zum Wirken“): Wiederholungen versuchen es still, bis der Kniff im Fenster liegt',()=>{
 const g=hero('dieter');foe(g);g.player.energy=100;
 assert.equal(g.action('strike'),true);g.events.length=0;
 const other=['throw','mark'].find(id=>g.skills.some(s=>s.id===id));g.cooldowns[other]=0;
 let tries=0;while(g.gcd>0&&!g.queued){g.action(other,null,false,undefined,{quiet:true});tries++;g.tick(1/30);}
 assert.ok(tries>5,'viele Wiederholungen');assert.deepEqual(fails(g),[],'keine Fehlerzeile beim Halten');assert.equal(g.queued?.id,other,'im Fenster vorgemerkt');
 const src=readFileSync(new URL('../action-bar-ui.js',import.meta.url),'utf8'),app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(src,/api\.trigger\(i,e\.repeat\?\{hold:true\}:undefined\)/);assert.match(app,/if\(hold\)\{if\(entry!=='auto'&&game\.skills\.some/,'nur Kniffe, keine Umschalter oder Gegenstände');
});
