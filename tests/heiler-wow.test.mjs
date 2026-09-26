// Heiler-WoW (2026-09-26, docs/HEILER-WOW-2026-09-26.md): jede Heiler-Spezialisierung hat die fünf WoW-Bausteine, sie wirken auf Verbündete,
// die Zielwahl folgt einem Muster (gewählter Verbündeter → er, Gegner/nichts → du, Mouseover über dem Truppenrahmen → dieser), und Hilfe liegt
// als normaler Buff auf dem Ziel (aidHot/aidBuff/aidSave – die Truppenrahmen zeigen jedes aid…-Feld).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {changeSpec} from '../talents.js';
import {selectFriend,selectEnemy,clearSelection} from '../help-target.js';
import {actionBar} from '../rpg.js';
import {HEALER_KITS,HEALER_ROLES} from '../content/index.js';
import {setMouseoverFriend,kitEntry} from '../healer-kit.js';
import {activeBuffs} from '../describe.js';
import {hitCompanion} from '../companions.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const HEALERS=[['baerbel','baerbel-care'],['schorsch','schorsch-chef'],['kaethe','kaethe-herz']];
/** Held Stufe 10 auf freier Wiese, zwei Söldner daneben, im Kampf. */
function setup(classId,spec){
 const g=new Game(world,{classId,level:10,tutorial:{version:1,step:8,completed:true}},{});g.toast=m=>{g.lastMsg=m;};g.fail=m=>{g.lastMsg=m;};
 changeSpec(g,spec);g.refreshStats();g.player.hp=g.player.maxHp;
 g.hireCompanion('merc-pils-peter',{free:true});g.hireCompanion('merc-radler-rita',{free:true});
 const W=g.world;let spot=null;for(let r=200;r<1400&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=W.spawn.x+Math.cos(a)*r,y=W.spawn.y+Math.sin(a)*r;let ok=true;for(let dx=-90;dx<=90&&ok;dx+=15)for(let dy=-70;dy<=70&&ok;dy+=15)if(W.blocked(x+dx,y+dy,6))ok=false;if(ok)spot={x,y};}
 Object.assign(g.player,spot);g.companions.forEach((c,i)=>{c.x=spot.x+26+i*12;c.y=spot.y+8;c.inCombat=6;});g.player.inCombat=7;
 return g;
}
const run=(g,sec)=>{for(let t=0;t<sec;t+=.05)g.tick(.05);};
/** Druck wie ein Spieler; Zauber mit Wirkzeit laufen aus. */
function press(g,id,point=null){g.gcd=0;const ok=g.action(id,point);for(let i=0;i<120&&g.casting;i++)g.tick(.05);return ok;}
const hurt=(u,share)=>{u.hp=Math.round(u.maxHp*share);};
const roleSlot=(spec,role)=>Object.keys(HEALER_KITS[spec]).find(k=>HEALER_KITS[spec][k].role===role);
const prime=g=>{if(g.player.energy!==undefined)g.player.energy=100;if(g.res&&'augen' in g.res)g.res.augen=70;for(const id of Object.keys(g.cooldowns))g.cooldowns[id]=0;};

test('jede Heiler-Spezialisierung hat alle fünf Bausteine auf Taste 1–9',()=>{
 for(const [cls,spec] of HEALERS){const g=setup(cls,spec),kit=HEALER_KITS[spec],roles=new Set(Object.values(kit).map(k=>k.role));
  for(const role of HEALER_ROLES){const ok=role==='filler'?roles.has('filler')||roles.has('card'):role==='hot'?roles.has('hot')||roles.has('card')||roles.has('filler'):roles.has(role);assert.ok(ok,spec+': Baustein '+role);}
  const bar=actionBar(g).slice(0,9);for(const id of Object.keys(kit).filter(k=>k!=='card'))assert.ok(bar.includes(id),spec+': '+id+' liegt auf Taste 1–9 ('+bar.join(',')+')');
  const filler=g.skills.find(s=>kitEntry(g,s.id)?.role==='filler'||kitEntry(g,s.id)?.role==='card');assert.ok(filler&&(filler.cd||0)<=1,spec+': Dauer-Heilzauber ohne echte Abklingzeit');
  const save=g.skills.find(s=>s.heals==='save');assert.ok(save.cd>=40&&save.offGcd,spec+': Notfallknopf mit langer Abklingzeit, ohne globale Abklingzeit');
  const big=g.skills.find(s=>s.heals==='big');assert.ok(big.castTime>=2,spec+': großer Heilzauber mit langer Wirkzeit');}
});

test('Anni: der Dauer-Heilzauber kostet Likes, der Trend bleibt das Modell',()=>{
 const g=setup('baerbel','baerbel-care'),tank=g.companions[0];selectFriend(g,'companion',tank);prime(g);hurt(tank,.4);const likes=g.player.energy;
 assert.ok(press(g,'throw'));assert.ok(g.player.energy<likes+15,'Feuchttuch kostet Likes ('+likes+' → '+g.player.energy+')');assert.ok(tank.hp>tank.maxHp*.4,'heilt den Schutz');
});

test('Zielwahl: gewählter Verbündeter → er, Gegner gewählt → du, Mouseover → der Rahmen unter der Maus',()=>{
 for(const [cls,spec] of HEALERS){const g=setup(cls,spec),[tank,dps]=g.companions,big=roleSlot(spec,'big');
  // Verbündeter gewählt
  selectFriend(g,'companion',tank);prime(g);hurt(tank,.3);hurt(dps,.5);hurt(g.player,.6);let before=[tank.hp,dps.hp,g.player.hp];
  assert.ok(press(g,big),spec+': großer Heilzauber auf den Verbündeten ('+g.lastMsg+')');assert.ok(tank.hp>before[0]+100,spec+': der Schutz bekommt die Heilung');assert.equal(g.player.hp,before[2],spec+': du nicht');
  // Gegner gewählt → du
  const foe={id:'probe',name:'Puppe',hp:500,maxHp:500,x:g.player.x+40,y:g.player.y,ai:'combat'};clearSelection(g);g.target=foe;prime(g);hurt(g.player,.5);before=[tank.hp,dps.hp,g.player.hp];
  assert.ok(press(g,big),spec+': mit Gegner als Ziel ('+g.lastMsg+')');assert.ok(g.player.hp>before[2]+100,spec+': heilt dich');assert.ok(tank.hp-before[0]<60,spec+': nicht den Verbündeten (nur eine laufende Nachheilung)');
  // Mouseover über dem Truppenrahmen, Gegner bleibt gewählt
  prime(g);hurt(dps,.3);before=[tank.hp,dps.hp,g.player.hp];setMouseoverFriend(g,dps);
  assert.ok(press(g,big),spec+': Mouseover ('+g.lastMsg+')');setMouseoverFriend(g,null);assert.ok(dps.hp>before[1]+100,spec+': heilt den Söldner unter der Maus');assert.equal(g.target,foe,spec+': die Auswahl bleibt der Gegner');}
});

test('Heilung über Zeit, Schild und Notfall liegen als Buff auf dem Ziel',()=>{
 // Anni: Aperol-Nachsorge auf dem Söldner und auf dir
 let g=setup('baerbel','baerbel-care'),tank=g.companions[0];selectFriend(g,'companion',tank);prime(g);hurt(tank,.5);
 assert.ok(press(g,'buff'));assert.ok(tank.aidHot?.remaining>10&&tank.aidHot.power>0&&tank.aidHot.name==='Aperol-Nachsorge','HoT als aidHot auf dem Söldner');
 const hp=tank.hp;run(g,3);assert.ok(tank.hp>hp,'die Nachsorge heilt jede Sekunde');
 clearSelection(g);prime(g);hurt(g.player,.5);assert.ok(press(g,'buff'));assert.ok(activeBuffs(g).some(b=>b.name==='Aperol-Nachsorge'),'auf dir in der Buffleiste');
 // Notfall: aidSave senkt den Schaden
 selectFriend(g,'companion',tank);prime(g);hurt(tank,.2);assert.ok(press(g,'mark'));assert.ok(tank.aidSave?.remaining>0&&tank.aidSave.reduction>=.4,'Riechsalz als aidSave');
 const foe={x:tank.x,y:tank.y,damage:1,name:'x'},full=tank.hp;hitCompanion(g,foe,tank,100);assert.ok(full-tank.hp<=62,'40 % weniger Schaden ('+(full-tank.hp)+')');
 // Käthe: Kreuz = HoT, Pik = Schild, Karo = Gruppe
 g=setup('kaethe','kaethe-herz');const [t2,d2]=g.companions;selectFriend(g,'companion',t2);
 for(const [suit,check] of [['kreuz',()=>t2.aidHot?.power>0],['pik',()=>t2.aidBuff?.shield>0],['karo',()=>d2.hp>d2.maxHp*.5&&t2.hp>t2.maxHp*.5]]){prime(g);hurt(t2,.5);hurt(d2,.5);t2.aidHot=null;t2.aidBuff=null;g.res.hand[0]={suit,rank:'D'};assert.ok(press(g,'strike'),suit+' ('+g.lastMsg+')');assert.ok(check(),'Kartenlegerin: '+suit+' stützt den Freund');}
 // Schorsch: Wurst heilt nach
 g=setup('schorsch','schorsch-chef');const t3=g.companions[0];selectFriend(g,'companion',t3);prime(g);hurt(t3,.4);g.res.rost=[{item:'wurst',done:.7,smoked:false}];
 assert.ok(press(g,'burst'));assert.ok(t3.aidHot?.remaining>0,'Bratwurst: Nachheilung als Buff auf dem Söldner');
 g.res.rost=[];prime(g);const b=t3.hp;hurt(t3,.4);assert.ok(press(g,'burst'),'leerer Rost: Brötchen');assert.ok(t3.hp>t3.maxHp*.4,'Brötchen heilt');
});

test('Gruppenheilung trifft mehrere Verbündete',()=>{
 for(const [cls,spec] of HEALERS){const g=setup(cls,spec),[tank,dps]=g.companions;prime(g);if(g.res&&'glut' in g.res)g.res.glut=70;hurt(tank,.4);hurt(dps,.4);hurt(g.player,.6);
  const before=[tank.hp,dps.hp];assert.ok(press(g,'ground',{x:g.player.x,y:g.player.y}),spec+' ('+g.lastMsg+')');run(g,3.2);
  assert.ok(tank.hp>before[0]&&dps.hp>before[1],spec+': beide Söldner geheilt ('+(tank.hp-before[0])+', '+(dps.hp-before[1])+')');}
});

test('Nicht-Heiler bleiben unverändert',()=>{
 for(const [cls,spec] of [['baerbel','baerbel-feedback'],['schorsch','schorsch-flamme'],['kaethe','kaethe-grand'],['dieter','dieter-brew']]){const g=setup(cls,spec);
  assert.ok(!g.skills.some(s=>s.heals),spec+': keine Heiler-Kniffe');}
 const g=setup('schorsch','schorsch-flamme');assert.equal(g.skills.find(s=>s.id==='throw').name,'Glutbrocken');
});
