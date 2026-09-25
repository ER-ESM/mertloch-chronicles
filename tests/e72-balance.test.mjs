// E-72 Runde 3 · Balance der neuen Klassen (docs/e72-runde3/balance.md): die Werte, die das Balance-Sheet trägt,
// wirken im echten Spiel, und die gemeinsame Balance-Rotation spielt die Kernkniffe der neuen Klassen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting} from '../auto-combat.js';
import {RESOURCES,SPEC_MECHANICS,TUNING} from '../content/index.js';
import {pathBuild} from '../talents.js';
import {rotate} from '../scripts/balance-rotation.mjs';

const world=()=>({id:'bal',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,spec,level=30,path=null){const learned=path==null?[]:pathBuild(spec,path,16);const g=new Game(world(),{classId,level,rpg:{talents:{spec,learned}}});g.random=()=>.5;g.refreshStats();g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=30,y=0,hp=100000){const e=makeEnemy({x,y},g.enemies.length+1,{hp,aggro:true,ai:'combat',attackTimer:100});e.stun=1e9;g.enemies.push(e);return e;}
const cast=(g,id,point)=>{g.gcd=0;const ok=g.action(id,point);if(g.casting)tickCasting(g,g.casting.total);return ok;};
/** Kampf mit der Balance-Rotation; zählt ausgelöste Kniffe und die Glut je Takt. */
function fight(g,e,{seconds=30,healer=false,hurt=0}={}){const used={},gluts=[],served=[];const a0=g.action.bind(g);g.action=(id,pt,c,f)=>{const top=id==='burst'&&g.res?.rost?[...g.res.rost].sort((a,b)=>b.done-a.done)[0]:null;const ok=a0(id,pt,c,...(f!==undefined?[f]:[]));if(ok)used[id]=(used[id]||0)+1;if(ok&&top)served.push(!!top.smoked);return ok;};
 g.target=e;g.player.inCombat=7;for(let t=0;t<seconds;t+=.05){g.player.inCombat=7;if(hurt&&Math.round(t*20)%20===0)g.player.hp=Math.max(1,g.player.hp-g.player.maxHp*hurt);if(g.gcd<=0&&!g.casting)rotate(g,{healer,ground:{x:e.x,y:e.y}});g.tick(.05);g.dead=false;if(g.res?.glut!==undefined)gluts.push(g.res.glut);}
 return {used,served,glut:gluts.length?gluts.reduce((a,b)=>a+b,0)/gluts.length:null};}

test('Spanferkel-Wurf: Nachbarn bekommen genau den Anteil aus RESOURCES.schorsch.cleave',()=>{
 const g=hero('schorsch','schorsch-flamme',30,1),e=foe(g,30),n=foe(g,30,40);g.target=e;g.player.inCombat=7;
 assert.ok(g.rpg.talents.learned.includes('schorsch-flamme-19'),'Spanferkel-Wurf gelernt');
 g.res.plan=0;cast(g,'mark');assert.equal(g.res.rost[0].item,'braten');g.res.rost[0].done=.75;g.res.glut=50;
 const he=e.hp,hn=n.hp;assert.ok(cast(g,'burst'));const main=he-e.hp,side=hn-n.hp;
 assert.ok(main>0&&side>0,'Ziel und Nachbar getroffen');
 assert.ok(Math.abs(side/main-RESOURCES.schorsch.cleave.share)<.03,'Nachbar bekommt '+RESOURCES.schorsch.cleave.share+' der Wucht, war '+(side/main).toFixed(2));
});

test('Handlesen heilt je Sekunde den Anteil aus RESOURCES.kaethe.handlesen',()=>{
 const g=hero('kaethe','kaethe-herz',30,0);foe(g,120);g.player.inCombat=7;
 assert.ok(g.rpg.talents.learned.includes('kaethe-herz-12'),'Handlesen gelernt');
 g.player.hp=Math.round(g.player.maxHp/2);assert.ok(cast(g,'handlesen'));const hp=g.player.hp;
 for(let t=0;t<1.05;t+=.05){g.player.inCombat=7;g.tick(.05);}
 const per=g.player.maxHp*RESOURCES.kaethe.handlesen.perSecond,got=g.player.hp-hp;
 assert.ok(got>=per*.9&&got<=per*3,'eine Sekunde Handlesen heilt ~'+Math.round(per)+' (mit Bastelgrips), war '+got);
});

test('Tuning-Werte der neuen Klassen verlieren beim Überlagern keine Felder (applyTuning mischt nur eine Ebene)',()=>{
 const smoke=SPEC_MECHANICS['schorsch-rauch'].rauch.smoke,splash=SPEC_MECHANICS['schorsch-flamme'].flamme.splash,buffet=SPEC_MECHANICS['schorsch-chef'].chef.buffet;
 for(const [name,obj,keys] of [['Rauch',smoke,['radius','duration','weaken']],['Feuerspritzer',splash,['radius','share']],['Grillbuffet',buffet,['duration','radius','heal']],['Abrechnen',RESOURCES.kaethe.abrechnen,['perAuge','perAugeWeapon','schneider','schwarz','radius']],['Kartenwirkung',RESOURCES.kaethe.effects,['damage','shield','heal','control']]])
  for(const k of keys)assert.ok(obj[k]!==undefined&&obj[k]!==null,name+'.'+k+' fehlt');
 assert.ok(TUNING.resources.schorsch.why&&TUNING.resources.kaethe.why,'Ressourcen-Tuning mit Begründung');
});

test('Balance-Rotation: Käthe wirft Kartenregen und trinkt Eierlikörchen, wenn sie verletzt ist',()=>{
 const g=hero('kaethe','kaethe-grand',12),e=foe(g,120);const {used}=fight(g,e,{hurt:.03});
 assert.ok(used.ground>0,'Kartenregen fällt');assert.ok(used.heal>0,'Eierlikörchen fällt');assert.ok((used.strike||0)+(used.mark||0)+(used.burst||0)>5,'Karten werden gespielt');
});

test('Balance-Rotation: der Grillhütten-Chef stellt das Grillbuffet auf Abklingzeit',()=>{
 const g=hero('schorsch','schorsch-chef',12),e=foe(g,30);const {used}=fight(g,e,{healer:true});
 assert.ok(used.ground>=2,'Buffet mindestens zweimal in 30 s, war '+(used.ground||0));
});

test('Balance-Rotation: der Räuchermeister räuchert (Glut niedrig), der Flambierer spielt heiß',()=>{
 const r=hero('schorsch','schorsch-rauch',12),er=foe(r,30),rauch=fight(r,er);
 const f=hero('schorsch','schorsch-flamme',12),ef=foe(f,30),flamme=fight(f,ef);
 const below=SPEC_MECHANICS['schorsch-rauch'].rauch.below;
 const smoked=rauch.served.filter(Boolean).length;assert.ok(rauch.served.length>=4&&smoked>=rauch.served.length*.75,'Räuchermeister serviert geräuchert: '+smoked+' von '+rauch.served.length);
 assert.ok(rauch.glut<below+10,'Räuchermeister hält die Glut nahe der Räuchergrenze '+below+', Mittel '+Math.round(rauch.glut));assert.equal(flamme.served.filter(Boolean).length,0,'der Flambierer räuchert nicht');
 assert.ok(flamme.glut>rauch.glut,'Flambierer spielt heißer ('+Math.round(flamme.glut)+' gegen '+Math.round(rauch.glut)+')');
});
