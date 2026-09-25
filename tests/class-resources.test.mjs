// E-72 · Fünf Klassen, fünf Ressourcen (docs/KLASSEN-RESSOURCEN-2026-09-25.md). Jede Prüfung spielt die Regel im echten
// Spiel durch: Treffer, Kniffe, Takte – keine Einzelfunktionen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting} from '../auto-combat.js';
import {RESOURCES,CLASS_SPECS} from '../content/index.js';
import {resourceHud,resourceVariant,handCard,zoneOf,resourceViral} from '../class-resources.js';
import {skillStatus} from '../combat-ui.js';
import {rotate} from '../scripts/balance-rotation.mjs';
import {actionBar} from '../rpg.js';

const world=()=>({id:'res',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=30,spec=CLASS_SPECS[classId]?.[0]){const g=new Game(world(),{classId,level,rpg:{talents:{spec,learned:[]}}});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=30,hp=100000){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp,aggro:true,ai:'combat',attackTimer:100});g.enemies.push(e);g.target=e;return e;}
const cast=(g,id,point)=>{g.gcd=0;const ok=g.action(id,point);if(g.casting)tickCasting(g,g.casting.total);return ok;};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};

test('jede der fünf Klassen hat ihre eigene Ressource und Anzeige',()=>{
 const kinds=Object.fromEntries(['dieter','baerbel','kevin','schorsch','kaethe'].map(id=>[id,resourceHud(hero(id)).kind]));
 assert.deepEqual(kinds,{dieter:'rage',baerbel:'trend',kevin:'ammo',schorsch:'grill',kaethe:'cards'});
 assert.equal(new Set(Object.values(kinds)).size,5);
});

test('Dieter · Wut: startet bei 0, Treffer und Kelle füllen, Kampfeslust zu Beginn, ausgegebene Randale bezahlt die Zeche',()=>{
 const g=hero('dieter'),e=foe(g);assert.equal(g.player.energy,0);
 g.hitPlayer(e,100);assert.ok(g.player.energy>0,'Treffer gibt Randale');assert.ok(g.res.tab>0,'ein Teil ist angeschrieben');
 const hpNow=g.player.hp,tab=g.res.tab;assert.ok(Math.abs(g.player.maxHp-hpNow-(100*.9*(1-RESOURCES.dieter.tab.share)))<3,'nur 70 % kommen sofort an');
 g.player.energy=60;cast(g,'mark');assert.ok(g.res.tab<tab,'Randale ausgeben bezahlt die Zeche');
 const before=g.player.hp;run(g,1);assert.ok(g.player.hp<before,'die Zeche wird abgestottert');
});

test('Dieter · Zeche prellen löscht den Bon und trifft alle ringsum',()=>{
 const g=hero('dieter'),a=foe(g,30),b=foe(g,-40);g.res.tab=200;const ha=a.hp,hb=b.hp;
 assert.ok(cast(g,'zeche'));assert.equal(g.res.tab,0);assert.ok(a.hp<ha&&b.hp<hb);
 assert.ok(g.cooldowns.zeche>0);
});

test('Dieter · Wurf eröffnet den Streit: kostenlos und bringt Randale',()=>{
 const g=hero('dieter'),e=foe(g,120);g.player.energy=0;assert.ok(cast(g,'throw'));assert.ok(g.player.energy>=RESOURCES.dieter.throwGain);void e;
});

test('Anni · Trend: neue Kniffe heben ihn, Wiederholung senkt ihn, Viral macht den nächsten Kniff gratis',()=>{
 const g=hero('baerbel',30,'baerbel-stage'),e=foe(g,120);g.player.inCombat=7;g.player.energy=100;
 cast(g,'strike');assert.equal(g.res.trend,1);g.time+=3;g.lastStrike=-100;g.cooldowns.strike=0;cast(g,'strike');assert.equal(g.res.trend,0,'Wiederholung ohne Takt senkt');
 for(const id of ['mark','strike','throw','interrupt','parry'])cast(g,id);
 assert.ok(g.res.trend>=4,'Abwechslung hebt den Trend: '+g.res.trend);
 cast(g,'dash');if(g.res.trend===RESOURCES.baerbel.trend.max){assert.ok(g.res.viral>0);assert.equal(resourceViral(g,'burst'),true,'Viral-Rahmen (E-72 R4: statt Beschriftung)');const likes=g.player.energy;g.cooldowns.burst=0;cast(g,'burst');assert.ok(g.player.energy>=likes,'gratis');}
 void e;
});

test('Anni · Trend verfällt ohne Kniff, ein schwerer Treffer ist ein Shitstorm',()=>{
 const g=hero('baerbel',30,'baerbel-care'),e=foe(g,120);g.player.inCombat=7;g.res.trend=3;g.res.fight=true;
 for(let t=0;t<RESOURCES.baerbel.trend.decayAfter+.2;t+=.05){g.player.inCombat=7;g.tick(.05);}assert.equal(g.res.trend,2);
 g.hitPlayer(e,g.player.maxHp*.3);assert.equal(g.res.trend,1);
});

test('Kevin · Leergut: Würfe kosten Flaschen, heile Flaschen liegen am Boden und werden aufgesammelt',()=>{
 const g=hero('kevin'),e=foe(g,120);g.random=()=>.1;
 cast(g,'strike');assert.equal(g.res.bottles,11);assert.ok(g.res.pickups.length>=1,'Leergut liegt');
 const b=g.res.pickups[0];g.player.x=b.x;g.player.y=b.y;g.tick(.05);assert.equal(g.res.bottles,12,'drübergelaufen = eingesammelt');void e;
});

test('Kevin · leerer Kasten macht den Pömpel, Pfandautomat mit Bon-Zone füllt voll und gibt einen Bon',()=>{
 const g=hero('kevin'),e=foe(g,30);g.res.bottles=0;g.res.pickups=[];assert.equal(resourceVariant(g,'strike')?.name,RESOURCES.kevin.hud.empty);
 const hp=e.hp;assert.ok(cast(g,'strike'));assert.ok(e.hp<hp,'Pömpel trifft');
 assert.ok(g.action('reload'));const r=g.res.reload;const inZone=(r.zone[0]+r.zone[1])/2*r.total;run(g,inZone);assert.ok(g.action('reload'));
 assert.equal(g.res.bottles,12);assert.equal(g.res.bons,1);
 const hp2=e.hp;g.cooldowns.strike=0;cast(g,'strike');const bonHit=hp2-e.hp;const hp3=e.hp;g.cooldowns.strike=0;cast(g,'strike');assert.ok(bonHit>(hp3-e.hp)*1.3,'der Bon verstärkt den nächsten Wurf');
});

test('Kevin · daneben gedrückt klemmt der Automat, ohne zweiten Druck kommen sechs Flaschen',()=>{
 const g=hero('kevin');g.res.bottles=0;g.action('reload');run(g,.1);g.action('reload');assert.equal(g.res.reload.jam,RESOURCES.kevin.reload.jam);run(g,RESOURCES.kevin.reload.channel+RESOURCES.kevin.reload.jam);assert.equal(g.res.bottles,RESOURCES.kevin.reload.fill);
});

test('Schorsch · Glut: Zange heizt, der goldene Bereich trifft härter, bei 100 kommt die Stichflamme',()=>{
 const g=hero('schorsch'),e=foe(g,30);g.player.inCombat=7;const g0=g.res.glut;cast(g,'strike');assert.ok(g.res.glut>g0);
 assert.equal(zoneOf(g,70).id,'perfekt');assert.equal(zoneOf(g,20).id,'kalt');
 g.res.glut=95;const hp=g.player.hp,ehp=e.hp;g.cooldowns.strike=0;cast(g,'strike');
 assert.equal(g.res.glut,RESOURCES.schorsch.overheat.dropTo,'Stichflamme setzt die Glut zurück');assert.ok(g.player.hp<hp,'Schorsch verbrennt sich');assert.ok(e.hp<ehp);
 assert.ok(g.res.lock>0);g.gcd=0;g.cooldowns.strike=0;assert.equal(g.action('strike'),false,'Grill aus');
});

test('Schorsch · Grillrost: Auflegen, garen, gar servieren wirkt stärker als roh',()=>{
 const serveBraten=wait=>{const g=hero('schorsch',30,'schorsch-flamme'),e=foe(g,30);g.player.inCombat=7;g.res.plan=0;/* Flambierer-Plan beginnt mit Braten */cast(g,'mark');assert.equal(g.res.rost[0].item,'braten');g.res.glut=50;g.res.rost[0].done=wait;const hp=e.hp;assert.ok(cast(g,'burst'));assert.equal(g.res.rost.length,0);return hp-e.hp;};
 assert.ok(serveBraten(.75)>serveBraten(.2)*2,'gar trifft deutlich härter als roh');
 const g=hero('schorsch');foe(g,30);for(let i=0;i<3;i++){g.cooldowns.mark=0;cast(g,'mark');}g.cooldowns.mark=0;g.gcd=0;assert.equal(g.action('mark'),false,'Rost voll');
});

test('Schorsch · Ablöschen kühlt, heilt und hüllt Gegner in Dampf – auch bei vollem Leben',()=>{
 const g=hero('schorsch'),e=foe(g,30);g.res.glut=90;const hp=e.hp;assert.ok(cast(g,'heal'));assert.equal(g.res.glut,50);assert.ok(e.hp<hp);assert.ok(e.controlSlow>0);
});

test('Käthe · Blatt: Karten liegen auf den Plätzen 1–3, jede Karte gibt Augen, Farbe bedienen verstärkt',()=>{
 const g=hero('kaethe'),e=foe(g,120);assert.equal(g.res.hand.length,3);const c=handCard(g,'strike');assert.ok(c);
 assert.ok(skillStatus(g,'strike').variant?.card,'die Karte steht auf dem Knopf');
 g.res.hand=[{suit:'kreuz',rank:'A'},{suit:'kreuz',rank:'7'},{suit:'herz',rank:'K'}];const hp=e.hp;cast(g,'strike');
 assert.equal(g.res.augen,RESOURCES.kaethe.augenPerCard+11);assert.ok(e.hp<hp);assert.equal(g.res.hand.length,3,'sofort nachgezogen');
 g.res.hand[0]={suit:'kreuz',rank:'D'};cast(g,'strike');assert.equal(g.res.chain.n,1,'Farbe bedient');
});

test('Käthe · Stich gegen einen Gegnerzauber bricht ihn ab und bringt Augen, ab 61 wird abgerechnet',()=>{
 const g=hero('kaethe'),e=foe(g,120);g.res.augen=0;e.cast={type:'call',name:'Ruf',interruptible:true,remaining:2,total:2,card:{suit:'kreuz',rank:'9'}};
 g.res.hand=[{suit:'kreuz',rank:'10'},{suit:'herz',rank:'7'},{suit:'pik',rank:'8'}];assert.equal(resourceVariant(g,'strike').name.startsWith('STICH'),true);
 cast(g,'strike');assert.equal(e.cast,null,'Stich bricht ab');assert.ok(g.res.augen>=RESOURCES.kaethe.augenPerCard+10+RESOURCES.kaethe.stich.bonus);
 g.gcd=0;g.cooldowns.throw=0;g.res.augen=40;assert.equal(g.action('throw'),false,'erst ab 61');
 g.res.augen=95;const hp=e.hp;assert.ok(cast(g,'throw'));assert.ok(e.hp<hp);assert.equal(g.res.augen,0,'neues Spiel');
});

test('Käthe · Luschen gehen mit kurzer globaler Abklingzeit, Neu geben bringt einen Buben',()=>{
 const g=hero('kaethe');foe(g,120);g.res.hand=[{suit:'karo',rank:'7'},{suit:'herz',rank:'8'},{suit:'pik',rank:'9'}];cast(g,'strike');assert.ok(g.gcd<=1.0001);
 g.gcd=0;assert.ok(g.action('buff'));assert.ok(g.res.hand.some(c=>c.rank==='B'));
});

test('alle fünf Klassen überstehen einen echten Kampf mit ihrer Rotation',()=>{
 for(const [cls,specs] of Object.entries(CLASS_SPECS))for(const spec of specs){
  const g=hero(cls,12,spec),e=foe(g,40,4000);g.player.inCombat=7;let t=0;
  while(e.hp>0&&!g.dead&&t<90){if(g.gcd<=0&&!g.casting)rotate(g,{ground:{x:e.x,y:e.y}});g.tick(.05);t+=.05;}
  assert.equal(e.hp,0,spec+' erledigt den Gegner ('+Math.round(t)+' s)');assert.equal(g.dead,false,spec);
 }
});

test('Leiste: Käthes Karten liegen nebeneinander (Tasten 2–4), Abrechnen daneben; Schorsch legt Auflegen/Servieren neben die Zange',()=>{
 const k=new Game(world(),{classId:'kaethe'});actionBar(k);k.gainXp(1200);assert.deepEqual(actionBar(k).slice(0,5),['auto','strike','mark','burst','throw']);
 const s=new Game(world(),{classId:'schorsch'});actionBar(s);s.gainXp(1200);assert.deepEqual(actionBar(s).slice(0,5),['auto','strike','mark','burst','throw']);
});
