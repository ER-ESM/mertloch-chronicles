// E-72 Runde 6 · Zündmeister (kevin-fuse): Die Kette hat Grenzen (docs/e72-runde6/kevin.md).
// 1. Jede weitere Lunte, die derselbe Kurzschluss zündet, explodiert um chain.fuseFalloff schwächer.
// 2. „Kurzschluss sofort bereit“ (Kettenreaktion, Funkenüberschlag) höchstens chain.instantRow-mal hintereinander.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting} from '../auto-combat.js';
import {combatStats} from '../rpg.js';
import {SPEC_MECHANICS} from '../content/index.js';
import {PROC_RULES} from '../content/index.js';
import {TALENTS,pathBuild} from '../talents.js';
import {M,onMarkExpire,burstResetBlocked,resetBurst} from '../spec-mechanics.js';
import {fireProcs} from '../procs.js';
import {skillHelp} from '../mechanic-help.js';

const world=()=>({id:'kette',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(spec='kevin-fuse',learned=[],classId=spec.split('-')[0]){const g=new Game(world(),{classId,level:20,rpg:{talents:{spec,learned}}});g.random=()=>.5;g.refreshStats();g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;g.player.inCombat=7;return g;}
function foe(g,x,y=0){const e=makeEnemy({x,y},g.enemies.length+1,{hp:1e6,aggro:true,ai:'combat',attackTimer:100});e.stun=1e9;g.enemies.push(e);return e;}
const cast=(g,id)=>{g.gcd=0;const ok=g.action(id);if(g.casting)tickCasting(g,g.casting.total);return ok;};
/** Drei Gegner dicht beieinander (je < 70 Einheiten): jede Explosion trifft alle drei. */
const clump=g=>[foe(g,120),foe(g,150,20),foe(g,130,40)];
const mark=foes=>{for(const e of foes)e.mark=3;};
const chain=SPEC_MECHANICS['kevin-fuse'].chain;

test('Kette: jede weitere Lunte desselben Kurzschlusses explodiert 20 % schwächer, eine abgebrannte Lunte voll',()=>{
 assert.equal(chain.fuseFalloff,.2);
 const g=hero(),foes=clump(g),hits=[],d0=g.damage.bind(g);g.damage=(e,n,label)=>{if(label==='Lunte')hits.push(n);return d0(e,n,label);};
 mark(foes);g.target=foes[0];assert.ok(cast(g,'burst'));
 const full=SPEC_MECHANICS['kevin-fuse'].fuse.explode.damage+(combatStats(g).fuseDamage||0);
 assert.equal(hits.length,9,'drei Explosionen treffen je alle drei');
 assert.deepEqual([...new Set(hits.map(n=>Math.round(n*100)/100))],[full,full*.8,full*.64].map(n=>Math.round(n*100)/100),'1 · 0,8 · 0,64');
 hits.length=0;const e=foes[1];e.mark=3;onMarkExpire(g,e);
 assert.ok(hits.length>0&&hits.every(n=>n===full),'abgebrannte Lunte: volle Explosion');
});

test('Kettenreaktion macht den Kurzschluss sofort bereit – aber nicht zweimal hintereinander',()=>{
 const g=hero(),foes=clump(g);g.target=foes[0];
 mark(foes);assert.ok(cast(g,'burst'),'Kurzschluss 1');
 assert.ok(M(g).reaction>0,'drei Zündungen → Kettenreaktion');assert.equal(g.cooldowns.burst,0,'sofort bereit');assert.equal(M(g).instantReady,true);
 mark(foes);assert.ok(cast(g,'burst'),'Kurzschluss 2 (sofort bereit)');
 assert.equal(M(g).instantRow,1);const cd=g.cooldowns.burst;assert.ok(cd>0,'klingt ab');
 // Die drei Zündungen von Kurzschluss 2 liegen noch im Fenster – die nächste Lunte startet eine neue Reaktion, die Abklingzeit bleibt.
 const e=foes[2];e.mark=3;onMarkExpire(g,e);
 assert.ok(M(g).reaction>0,'Kettenreaktion beginnt trotzdem (fünf Sprünge beim nächsten Einsatz)');
 assert.equal(g.cooldowns.burst,cd,'aber kein zweites Sofort-Bereit hintereinander');assert.equal(burstResetBlocked(g),true);
 // Regulär abgeklungen: der nächste Kurzschluss darf wieder sofort bereit werden.
 g.cooldowns.burst=0;M(g).heat=[];M(g).reaction=0;mark(foes);assert.ok(cast(g,'burst'),'Kurzschluss 3 (regulär)');
 assert.equal(M(g).instantRow,0);assert.ok(M(g).reaction>0);assert.equal(g.cooldowns.burst,0,'wieder sofort bereit');
});

test('Funkenüberschlag: gesperrt, solange ein sofort bereiter Kurzschluss abklingt – sonst wie bisher',()=>{
 // Pfad Kettenreaktion auf Stufe 5 (vier Punkte): Zündliste, Starkstrom-Bon, Kleber für alle, Funkenüberschlag – der Ausreißer aus dem Balance-Sheet.
 const g=hero('kevin-fuse',pathBuild('kevin-fuse',2,4)),e=foe(g,120);g.random=()=>0;e.mark=3;const cs=combatStats(g);
 assert.equal(PROC_RULES.funkenueberschlag.effect.reset,'burst');assert.ok(cs['proc:funkenueberschlag']>0);
 g.cooldowns.burst=6;M(g).instantRow=1;
 assert.equal(fireProcs(g,'markedHit',cs,{skill:'Markierung',enemy:e,damage:10}),0,'gesperrt: kein Proc');assert.equal(g.cooldowns.burst,6);
 M(g).instantRow=0;
 assert.equal(fireProcs(g,'markedHit',cs,{skill:'Markierung',enemy:e,damage:10}),1,'frei: Proc');assert.equal(g.cooldowns.burst,0);assert.equal(M(g).instantReady,true,'merkt sich das Sofort-Bereit');
});

test('Andere Spezialisierungen: kein Sofort-bereit-Limit (Abriss nach Zeche prellen, Überlast …)',()=>{
 for(const spec of ['dieter-brawl','kevin-iron','kevin-hunt','kaethe-grand']){const g=hero(spec);g.cooldowns.burst=5;M(g).instantRow=9;
  assert.equal(burstResetBlocked(g),false,spec);assert.ok(resetBurst(g));assert.equal(g.cooldowns.burst,0,spec);assert.notEqual(M(g).instantReady,true,spec+': nichts vermerkt');}
});

test('Texte tragen die Zahlen der Kette (Sprungverlust, Explosionsabnahme, Sofort-bereit-Limit)',()=>{
 const m=SPEC_MECHANICS['kevin-fuse'],kit=m.kit.burst.text,pct=v=>Math.round(v*100)+' %';
 assert.ok(kit.includes('je Sprung '+pct(m.chain.falloff)),kit);assert.ok(kit.includes(pct(m.chain.fuseFalloff)+' schwächer'),kit);assert.ok(/höchstens einmal hintereinander/.test(kit));
 assert.ok(/nicht zweimal hintereinander/.test(TALENTS['kevin-fuse'].find(t=>t.name==='Funkenüberschlag').text));
 assert.ok(/nicht zweimal hintereinander/.test(PROC_RULES.funkenueberschlag.text));
 const g=hero(),help=skillHelp(g,'burst');assert.ok(/20 % schwächer/.test(help)&&/höchstens einmal hintereinander/.test(help),help);
});
