// E-72 Runde 5 · welt2: einzelne Weltgegner gegen Helden der Stufen 1–6, Ankündigung beim Bemerken, Einstieg an Kisten-Ida.
// Anlass: Kenner-Nachtest 26.09. nachts – Käthe (Stufe 4) starb an einem Pfanddachs der Stufe 1 und an einem Ruhewart,
// Schorsch (Stufe 6) an einem Ruhewart der Stufe 3 („Unter Stufe 7 ist das Dorf tödlich“). Messwege: scripts/e72-welt2-messung.mjs.
import test from 'node:test';
/* Reproduzierbar: Kämpfe mit knappen Grenzen (−25 %) dürfen nicht an Math.random hängen (Beute, Zufallsrollen) – 1 von 40 Läufen kippte sonst */
{let x=0x9e3779b9;Math.random=()=>{x|=0;x=x+0x6D2B79F5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World,distance} from '../world.js';
import {ENCOUNTER_RULES} from '../encounters.js';
import {BALANCE,SPAWN_TABLES,CAST_SETS} from '../content/index.js';
import {hero,foe,duel,CLASSES} from '../scripts/e72-welt2-messung.mjs';
import {alertShown,alertProgress,nearEntry} from '../foe-rules.js';

const A=BALANCE.foes.alert;
const run=(c,lv,kind,mode,extra={})=>{const g=hero(c,lv);return {g,...duel(g,[foe(g,kind)],{mode,...extra})};};

test('Stufe-4-Käthe schlägt einen Stufe-1-Pfanddachs mit Startausrüstung – auch mit einem Tastendruck alle 2,5 s',()=>{
 for(const c of CLASSES){
  const a=run(c,4,'badger','stand');assert.ok(a.win&&!a.dead,c+': verliert gegen den Dachs');assert.ok(a.lostPct<=25,c+': −'+a.lostPct+' % mit Rotation');
  const b=run(c,4,'badger','langsam');assert.ok(b.win&&!b.dead,c+': verliert langsam gegen den Dachs');assert.ok(b.lostPct<=35,c+': −'+b.lostPct+' % langsam');
 }
});

test('Ruhewart Stufe 3 legt einen Stufe-6-Helden nicht um: mit Kniffen mühelos, langsam sicher, ohne Kniffe erst nach 30 s',()=>{
 for(const c of CLASSES){
  const k=run(c,6,'warden','kniffe');assert.ok(k.win&&k.lostPct<=15,c+' mit Kniffen: −'+k.lostPct+' %');
  const s=run(c,6,'warden','stand');assert.ok(s.win&&s.lostPct<=30,c+' Rotation ohne Antworten: −'+s.lostPct+' %');
  const l=run(c,6,'warden','langsam');assert.ok(l.win&&!l.dead&&l.lostPct<=40,c+' ein Druck je 2,5 s: −'+l.lostPct+' %');
  // Nur Autoangriff (kein einziger Kniff) – der schlechteste Fall aus dem Browser-Playtest: Umkippen frühestens nach 30 s
  const n=run(c,6,'warden','auto');assert.ok(!n.dead||n.time>=30,c+' nur Autoangriff: tot nach '+n.time+' s');
 }
});

test('Gleiche Stufe mit Kniffen: fordernd, aber sicher (Dachs 1, Keiler 2, Ruhewart 3)',()=>{
 for(const c of CLASSES)for(const [lv,kind] of [[1,'badger'],[2,'boar'],[3,'warden']]){
  const r=run(c,lv,kind,'kniffe');assert.ok(r.win&&!r.dead,c+' Stufe '+lv+' verliert gegen '+kind);
  assert.ok(r.lostPct<=45,c+' Stufe '+lv+' gegen '+kind+': −'+r.lostPct+' %');assert.ok(r.time>=4&&r.time<=15,c+' '+kind+': '+r.time+' s');
 }
});

/** Held steht, Ruhewart steht 11 m daneben und bemerkt ihn von sich aus. */
function spotted(c='kaethe',lv=4,kind='warden'){
 const g=hero(c,lv),e=foe(g,kind,{dist:90});e.home={x:e.x,y:e.y};e.spawnGrace=0;g.enemies=[e];
 const hits=[],barks=[];const hit=g.hitPlayer.bind(g),emit=g.emit.bind(g);
 g.hitPlayer=(en,n,...r)=>{hits.push(g.time);hit(en,n,...r);};g.emit=(t,d)=>{if(t==='bark')barks.push(d.text);return emit(t,d);};
 return {g,e,hits,barks};
}
test('Ruhewart kündigt an: „!“, Ruf, Block zücken – erst danach der erste Wurf',()=>{
 const {g,e,hits,barks}=spotted();g.tick(.05);
 assert.ok(e.aggro,'bemerkt den Helden in 11 m');const at=g.time;
 assert.ok(alertShown(g,e),'rotes „!“ über dem Kopf');assert.equal(barks.length,1,'eine Zeile: '+barks.join(' / '));
 for(let i=0;i<Math.round((A.ranged-.1)/.05);i++){g.tick(.05);assert.ok(alertProgress(g,e)!=null||g.time-at>=A.ranged-.06,'Balken läuft');}
 assert.equal(hits.length,0,'kein Wurf während der Ankündigung');
 for(let i=0;i<10;i++)g.tick(.05);assert.ok(hits.length>=1&&hits[0]-at>=A.ranged-.06,'erster Wurf nach '+(hits[0]-at).toFixed(2)+' s');
 for(let i=0;i<120;i++)g.tick(.05);assert.equal(barks.length,1,'keine zweite Zeile beim ersten Spezialangriff');
});
test('Ruhewart: Wer während der Ankündigung Abstand nimmt, wird nicht angegriffen; wer zuschlägt, beendet sie',()=>{
 const a=spotted();a.g.tick(.05);assert.ok(a.e.aggro);
 for(let i=0;i<60;i++){if(i<24)a.g.player.x-=96*.05;a.g.tick(.05);}
 assert.equal(a.hits.length,0,'weggegangen: kein Treffer');assert.equal(a.e.aggro,false,'Ruhewart lässt ab');
 const b=spotted('dieter',4);b.g.tick(.05);b.g.target=b.e;b.g.player.x=b.e.x-30;b.g.player.y=b.e.y;b.g.damage(b.e,20,'Test');b.g.tick(.05);
 assert.equal(alertProgress(b.g,b.e),null,'Treffer beendet die Ankündigung');
 // veraltete Ankündigung (lief ab, während der Gegner nicht kämpfte): ein späterer Angriff aus 26 m lässt ihn nicht „ablassen“
 const c=spotted('kevin',4);c.g.tick(.05);c.e.alertEnd=c.g.time-2;c.g.player.x=c.e.x-200;c.g.player.y=c.e.y;for(let i=0;i<4;i++)c.g.tick(.05);
 assert.ok(c.e.aggro&&c.e.ai==='combat','veraltete Ankündigung beendet keinen Kampf: '+c.e.ai);
});
test('Nahkämpfer zeigen nur das „!“, eigener Angriff und Kettenzug kündigen nichts an',()=>{
 const {g,e}=spotted('kevin',2,'boar');g.tick(.05);assert.ok(e.aggro&&alertShown(g,e),'Keiler zeigt „!“');assert.equal(alertProgress(g,e),null,'Keiler zögert nicht');
 // Dieter schlägt zuerst zu: der Ruhewart kämpft sofort, ohne „!“ und ohne Zögern
 const h=hero('dieter',4),w=foe(h,'warden',{dist:40});w.spawnGrace=0;h.enemies=[w];h.target=w;
 assert.ok(h.action('strike'),'Dieter schlägt zu');assert.ok(w.aggro,'Ruhewart im Kampf');h.tick(.05);
 assert.ok(!alertShown(h,w)&&alertProgress(h,w)==null,'wer selbst angreift, bekommt keine Ankündigung');
 // Kettenzug: der Kumpel eines kämpfenden Ruhewarts kommt nach der Wartezeit („KUMPEL KOMMT“), ohne zweite Ankündigung
 const k=hero('dieter',4),a=foe(k,'warden',{dist:40,id:101}),b=foe(k,'warden',{dist:40+BALANCE.procs.chainJoinRange*.8,id:102});
 for(const x of [a,b]){x.spawnGrace=0;x.home={x:x.x,y:x.y};}k.enemies=[a,b];k.adminGod=true;a.aggro=true;a.ai='combat';k.target=a;
 for(let i=0;i<Math.round((BALANCE.procs.chainJoinDelay+.3)/.05);i++)k.tick(.05);
 assert.ok(b.aggro,'Kumpel kommt');assert.ok(!alertShown(k,b)&&alertProgress(k,b)==null,'Kettenzug ohne Ankündigung');
});

test('Sprung ist angekündigt (Bodenkreis 1,5 s) und mit Ausweichen oder zwei Schritten zu vermeiden',()=>{
 const p=CAST_SETS.wolf.casts.pounce;assert.ok(p.ground&&p.total>=1.2&&/ausweichen/.test(p.name),'Sprung: Bodenzauber mit Namen „ausweichen“');
 for(const how of ['dash','walk']){
  const g=hero('kaethe',4),e=foe(g,'badger',{dist:30});e.aggro=true;e.ai='combat';e.attackTimer=0;e.autoTimer=99;g.enemies=[e];let lost=0;const hit=g.hitPlayer.bind(g);g.hitPlayer=(en,n,...r)=>{const b=g.player.hp;hit(en,n,...r);if(en.lastCast)lost+=b-g.player.hp;};
  g.tick(.05);assert.ok(e.cast?.ground,'Dachs beginnt den Sprung');const c=e.cast;assert.deepEqual([Math.round(c.x),Math.round(c.y)],[Math.round(g.player.x),Math.round(g.player.y)],'Kreis liegt auf dem Helden');
  while(e.cast&&e.cast.remaining>(how==='dash'?.35:.8)){e.autoTimer=99;g.tick(.05);}/* Ausweichen kurz vor dem Einschlag, Laufen mit normaler Reaktion */
  if(how==='dash')assert.ok(g.action('dash'),'Ausweichen bereit');else{g.moveTo={x:g.player.x+c.radius+10,y:g.player.y};g.path=[];}
  for(let i=0;i<20;i++){e.autoTimer=99;g.tick(.05);}
  assert.equal(lost,0,how+': Sprung trifft trotzdem');
 }
});

test('Einstieg an Kisten-Ida: kein angriffslustiges Feldrevier näher als an der Kirche',()=>{
 const w=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'))),g=new Game(w,{classId:'kaethe'});
 const C=ENCOUNTER_RULES.cellSize,ida=w.npc,list=[];
 for(let cy=Math.floor(ida.y/C)-4;cy<=Math.floor(ida.y/C)+4;cy++)for(let cx=Math.floor(ida.x/C)-4;cx<=Math.floor(ida.x/C)+4;cx++)list.push(...g.ecology.buildCell(cx,cy));
 const angry=list.filter(e=>e.behavior==='aggressive');assert.ok(angry.length>10,'Feldgegner ringsum: '+angry.length);
 for(const e of angry)assert.ok(distance(e.home,ida)>=SPAWN_TABLES.aggressiveMinDistance,e.name+' lebt '+Math.round(distance(e.home,ida)/8)+' m neben Ida');
 assert.ok(nearEntry(w,{x:ida.x+300,y:ida.y})&&!nearEntry(w,{x:ida.x+440,y:ida.y}),'Abstand wie an der Kirche (54 m)');
 const neutral=list.find(e=>distance(e.home,{x:10086,y:9156})<2);assert.ok(neutral&&neutral.behavior==='neutral','am alten Ruhewart-Platz lebt ein neutrales Tier: '+neutral?.name);
});
