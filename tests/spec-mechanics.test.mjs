import {CLASS_SPECS} from '../content/index.js';
import {RESOURCES} from '../content/index.js';
// E-32: jede Spezialisierung hat ab Stufe 5 eine eigene Kernmechanik (spec-mechanics.js, content/mechanics.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {changeSpec} from '../talents.js';
import {combatStats} from '../rpg.js';
import {tickCasting} from '../auto-combat.js';
import {M,mechVariant,mechChips} from '../spec-mechanics.js';
import {SPEC_MECHANICS} from '../content/index.js';
import * as CONTENT from '../content/index.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
function game(classId,spec){const g=new Game(arena(),{classId,level:11});assert.ok(changeSpec(g,spec),spec);g.random=()=>.5;g.player.x=1000;g.player.y=1000;return g;}
function enemy(g,x=40,y=0,hp=10000){const e=makeEnemy({x:1000+x,y:1000+y},g.enemies.length+1,{hp,roamWait:100,attackTimer:100,stun:100});e.aggro=true;e.ai='combat';g.enemies.push(e);g.target=e;return e;}
function cast(g,id,point){g.cooldowns[id]=0;g.gcd=0;g.player.energy=100;const ok=g.action(id,point);assert.ok(ok,id);if(g.casting)tickCasting(g,g.casting.total);return ok;}
const step=(g,s)=>{for(let i=0;i<Math.round(s/.05);i++)g.tick(.05);};

test('alle neun Spezialisierungen haben eine Kernmechanik mit Kit-Texten, die sagen, wann man drückt',()=>{
 assert.equal(Object.keys(SPEC_MECHANICS).length,Object.values(CLASS_SPECS).flat().length);/* E-72: drei je Klasse */
 for(const [spec,m] of Object.entries(SPEC_MECHANICS)){assert.ok(m.kind&&m.name,spec);assert.equal(m.paths.length,3,spec+' drei Pfade');
  for(const [id,k] of Object.entries(m.kit))assert.ok(/drück|Drück|zünde|Zünde|stell|Stell|wirf|Wirf|sobald|bevor|wenn/i.test(k.use||k.text),spec+'/'+id+' Einsatzmoment');}
});

test('Kneipenschläger: Kellen bauen Pegelstriche, der Abriss verbraucht sie mit Bonus, Ablauf bringt Kater',()=>{
 const g=game('dieter','dieter-brawl'),e=enemy(g);
 for(let i=0;i<4;i++)cast(g,'strike');assert.equal(M(g).stack,4);
 const hp=e.hp;cast(g,'burst');assert.equal(M(g).stack,0);assert.ok(hp-e.hp>0);
 cast(g,'strike');assert.equal(M(g).stack,1);g.time+=9;step(g,.1);assert.equal(M(g).stack,0);assert.ok(M(g).hangover>0,'Kater');
 assert.ok(mechChips(g).some(c=>c.startsWith('Kater')));
 assert.equal(mechVariant(g,'burst'),null);M(g).stack=10;assert.equal(mechVariant(g,'burst').name,'ABRISS ×10');
});

test('Zapfmeister: Anstich stellt höchstens zwei Fässer, Fassanstich sticht sie an und räumt sie ab',()=>{
 const g=game('dieter','dieter-brew');enemy(g);
 for(let i=0;i<3;i++)cast(g,'ground',{x:1000+20*i,y:1010});
 assert.equal(g.fields.filter(z=>z.kind==='fass').length,2);assert.equal(g.fields[0].sort,'weizen');
 g.player.hp=200;cast(g,'burst');assert.equal(g.fields.filter(z=>z.kind==='fass').length,0);assert.ok(g.player.hp>200,'Weizen heilt beim Anstich');
});

test('Putzpyramide: Schimmel springt bei einem Piekser auf den Nachbarn und platzt beim Durchputzen',()=>{
 const g=game('baerbel','baerbel-feedback'),a=enemy(g,60,0),b=enemy(g,90,20);g.target=a;
 cast(g,'mark');assert.ok(a.mark>0);assert.equal(b.mark>0,false);
 cast(g,'strike');assert.ok(b.mark>0,'Schimmel springt');
 const hb=b.hp;cast(g,'burst');assert.equal(a.mark,0);assert.equal(b.mark,0);assert.ok(hb-b.hp>0,'Nachbar nimmt Durchputz-Schaden');
});

test('Filter-Furie: 100 Randale im Kampf zünden Putzwut, Kniffe sind darin kostenlos und im Laufen wirkbar',()=>{
 const g=game('baerbel','baerbel-stage');enemy(g);g.player.inCombat=5;g.player.energy=100;step(g,.1);
 assert.ok(M(g).state>0,'Putzwut');g.keys.add('d');cast(g,'strike');g.keys.delete('d');
 assert.equal(mechVariant(g,'strike')?.name,'PUTZWUT');
 g.player.energy=50;cast(g,'burst');assert.equal(M(g).state,0);/* E-72: Auswringen leert die Likes, der Kniff selbst bringt neue */assert.ok(g.player.energy<=RESOURCES.baerbel.trend.likes.at(-1));
});

test('Zündmeister: Kurzschluss springt nur auf kämpfende Nachbarn, Lunten zünden, drei Zündungen lösen die Kettenreaktion',()=>{
 const g=game('kevin','kevin-fuse'),a=enemy(g,60,0),b=enemy(g,110,0),c=enemy(g,160,0);const n=makeEnemy({x:1200,y:1000},9,{hp:5000,behavior:'neutral',aggroRange:0});g.enemies.push(n);g.target=a;
 for(const t of [a,b,c]){g.target=t;cast(g,'mark');}g.target=a;const hb=b.hp;cast(g,'burst');
 assert.ok(hb-b.hp>0,'Kette trifft b');assert.equal(n.hp,5000,'Unbeteiligte bleiben außen vor');assert.equal(a.mark,0,'Lunte gezündet');
 assert.ok(M(g).reaction>0,'Kettenreaktion nach drei Zündungen');assert.equal(g.cooldowns.burst,0);
});

test('Schrottkoloss: Robbi feuert jede Sekunde und explodiert bei Überlast',()=>{
 const g=game('kevin','kevin-iron'),e=enemy(g,60,0);cast(g,'ground',{x:1030,y:1000});
 assert.equal(g.fields.filter(z=>z.kind==='robbi').length,1);const hp=e.hp;step(g,1.1);assert.ok(hp-e.hp>0,'Robbi trifft');
 cast(g,'burst');assert.equal(g.fields.filter(z=>z.kind==='robbi').length,0);
});

test('Pfandjäger: Fehlzündung schwächt, Pity garantiert Überzündung, drei Überzündungen zünden den Jackpot',()=>{
 const g=game('kevin','kevin-hunt'),e=enemy(g,100,0);
 g.random=()=>.01;cast(g,'strike');assert.equal(M(g).last,'miss');cast(g,'strike');cast(g,'strike');assert.equal(M(g).miss,3);
 cast(g,'strike');assert.equal(M(g).last,'over','Pity nach drei Fehlzündungen');
 g.random=()=>.99;cast(g,'strike');cast(g,'strike');assert.ok(M(g).jackpot>0,'Jackpot');assert.equal(mechVariant(g,'throw')?.name,'JACKPOT');
});

test('Landhaus-Lazarett: Heilungen füllen den Vorrat, bei fünf beginnt das Großreinemachen und Heilung trifft das Ziel',()=>{
 const g=game('baerbel','baerbel-care'),e=enemy(g,60,0);
 for(let i=0;i<5;i++){g.player.hp-=50;cast(g,'heal');}assert.equal(M(g).supply,5);assert.equal(mechVariant(g,'burst')?.name,'GROSSREINEMACHEN');
 cast(g,'burst');assert.ok(M(g).clean>0);const hp=e.hp;g.player.hp-=50;cast(g,'heal');assert.ok(hp-e.hp>0,'Heilung als Schaden');
});

test('Türsteher: Rausschmiss wirft Deckung auf die Nachbarn, fast volle Deckung gibt Hausverbot mit doppelter Parade',()=>{
 const g=game('dieter','dieter-wall'),a=enemy(g,40,0),b=enemy(g,60,10);g.target=a;g.classState.guard=100;const hb=b.hp;cast(g,'burst');
 assert.ok(hb-b.hp>0,'Nachbar kassiert die Deckung');assert.ok(g.classState.guard<100);
 g.classState.guard=g.player.maxHp*.38;step(g,.1);assert.ok(M(g).hausverbot>0,'Hausverbot');assert.equal(mechVariant(g,'burst')?.name,'HAUSVERBOT');
});

test('GCD: Basis 1,5 s, Varianten und Procs lösen nur den kurzen GCD aus; Bodenkniff kommt auf Stufe 3',()=>{
 const g=game('dieter','dieter-brawl');enemy(g);const cs=combatStats(g);assert.ok(cs.gcd>=1&&cs.gcd<=1.5);
 g.classState.freeStrike=true;cast(g,'strike');assert.ok(g.gcd<=1.0001,'kurzer GCD bei Gratis-Kelle');
 const fresh=new Game(arena(),{classId:'kevin',level:3});assert.ok(fresh.skills.find(s=>s.id==='ground'));
});

test('Filter-Furie: eine Parade während eines angesagten Zaubers ist ein Prost und gibt Randale',()=>{
 const g=game('baerbel','baerbel-stage'),e=enemy(g,40,0);e.cast={total:2,remaining:1,interruptible:true};g.player.energy=10;
 cast(g,'parry');g.player.energy=10;g.hitPlayer(e,50);assert.equal(g.player.energy,60,'20 Parade + 30 Prost');
});

test('Schrottkoloss: Robbi zieht die Schläge auf sich, bis sein Leben aufgebraucht ist',()=>{
 const g=game('kevin','kevin-iron'),e=enemy(g,40,0);cast(g,'ground',{x:1020,y:1000});const hp=g.player.hp;
 g.hitPlayer(e,100,false);assert.equal(g.player.hp,hp,'Robbi fängt den Treffer');const z=g.fields.find(z=>z.kind==='robbi');assert.ok(z.hp<300);
 g.hitPlayer(e,10000,false);assert.equal(g.fields.filter(z=>z.kind==='robbi').length,0,'Robbi kaputt');
});

test('nach einem Kill wechselt das Ziel auf den nächsten kämpfenden Gegner',()=>{
 const g=game('dieter','dieter-brawl'),a=enemy(g,40,0,50),b=enemy(g,60,10);g.target=a;g.player.inCombat=5;g.damage(a,10000,'Kelle');
 assert.equal(g.target,b,'nächster Angreifer ist Ziel');
});

test('Schlusssteine (Reihe 9) ändern in jedem Baum den Finisher',()=>{
 const finisher=new Set(['guardBurst','waveRadius','stackWave','tapDamage','burstHot','cleanDuration','burstSpread','dotExplodeTicks','stateDamage','chainJumps','overloadStun','hunterFinish','gambleOver']);
 for(const [spec,m] of Object.entries(SPEC_MECHANICS)){void m;}
 for(const spec of Object.keys(SPEC_MECHANICS)){const {TALENT_ROWS,TALENT_CELLS}=CONTENT;const rows=TALENT_ROWS[spec];for(let i=0;i<rows.length;i++){if(TALENT_CELLS[spec][i].row!==9)continue;/* E-72: Käthes Finisher ist Abrechnen (Wurfplatz) */const fin=spec.startsWith('kaethe-')?'throw':'burst';assert.ok(rows[i].skills.includes(fin)||Object.keys(rows[i].effects).some(k=>finisher.has(k)),spec+'-'+i+' '+rows[i].name);}}
});

test('laufende Begleiter: mit Pfadkrone folgt Robbi dem Helden',()=>{
 const g=game('kevin','kevin-iron');enemy(g,60,0);cast(g,'ground',{x:1030,y:1000});const z=g.fields.find(z=>z.kind==='robbi');
 g.player.x=1300;step(g,1);assert.ok(Math.abs(z.x-1030)<1,'ohne Pfadkrone bleibt Robbi stehen');
 g.rpg.talents.learned=[];const t=CONTENT.TALENT_CELLS['kevin-iron'].map((c,i)=>({...c,i})).filter(c=>c.path===0).slice(0,7).map(c=>'kevin-iron-'+c.i);g.rpg.talents.learned=t;g.refreshStats();
 assert.ok(combatStats(g).robbiFollows,'Pfadkrone Robbi');step(g,1);assert.ok(z.x>1080,'Robbi läuft mit');
});
