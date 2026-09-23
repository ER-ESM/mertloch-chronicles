// Orte und Figurenplätze im Dorfkern: Mentorenabstand am Treffpunkt (Playtest P3) und Kalles Kiosk an der Kreuzung.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance} from '../world.js';
import {mentorSpots,MENTOR_RULES,MENTOR_ORDER,inSettlement} from '../world-layout.js';
import {PROP_KINDS,PROP_RULES,roadJunctions} from '../world-props.js';

const data=JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'));
const SEEDS=[1,42,56753,73519,2026,987654];
const world=new World(data);
const IDA_F_RADIUS=50;   // engine.js: F spricht mit Ida, solange der Spieler näher als 50 Einheiten steht
const half=p=>Math.hypot(p.w,p.h)/2;
const corners=p=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>({x:p.x+sx*p.w/2,y:p.y+sy*p.h/2}));

test('Mentoren stehen für jeden Clan-Mentor bereit, in stabiler Reihenfolge', ()=>{
 const spots=mentorSpots(world);
 assert.deepEqual(spots.map(s=>s.id),MENTOR_ORDER);
 assert.ok(spots.length>=3,'weniger als drei Mentoren am Treffpunkt');
 for(const s of spots){assert.equal(Number.isInteger(s.x)&&Number.isInteger(s.y),true,s.id+' ohne ganzzahligen Platz');}
});

test('P3: Abstand zu Ida ≥ 60 und außerhalb ihres F-Radius, untereinander ≥ 40', ()=>{
 for(const seed of SEEDS){
  const w=seed===world.seed?world:new World(data,{seed});
  const spots=mentorSpots(w);
  for(const s of spots){
   const d=distance(s,w.npc);
   assert.ok(d>=MENTOR_RULES.idaGap,`Seed ${seed}: ${s.id} steht ${Math.round(d)} von Ida entfernt`);
   assert.ok(d>IDA_F_RADIUS,`Seed ${seed}: ${s.id} steht in Idas F-Radius`);
   assert.ok(distance(s,w.shrine)>=MENTOR_RULES.shrineGap,`Seed ${seed}: ${s.id} klebt an der Heilquelle`);
  }
  for(let i=0;i<spots.length;i++)for(let j=i+1;j<spots.length;j++)
   assert.ok(distance(spots[i],spots[j])>=MENTOR_RULES.mentorGap,`Seed ${seed}: ${spots[i].id} und ${spots[j].id} stehen zu dicht`);
 }
});

test('Mentorenplätze sind begehbar, erreichbar und lassen den Hauptweg frei', ()=>{
 for(const s of mentorSpots(world)){
  assert.equal(world.blocked(s.x,s.y,MENTOR_RULES.clearance),false,s.id+' steht im Hindernis');
  assert.equal(world.onRoad(s.x,s.y,MENTOR_RULES.roadMargin),false,s.id+' steht auf dem Hauptweg');
  // Seit E-52 stehen die Mentoren in den Räumen der Bude: erreichbar über einen echten Weg (durch die Türen), vom Startpunkt und vom Kirchvorplatz.
  for(const from of [world.start||world.spawn,world.spawn]){const path=world.findPath(from,s);let prev=from;
   assert.ok(path.length&&path.every(p=>{const ok=world.walkClear(prev,p,MENTOR_RULES.clearance);prev=p;return ok;}),s.id+' ist nicht erreichbar');}
 }
});

test('Mentorenplätze sind deterministisch und rein geometrisch', ()=>{
 assert.deepEqual(mentorSpots(world),mentorSpots(world),'zwei Aufrufe, zwei Ergebnisse');
 assert.deepEqual(mentorSpots(new World(data)),mentorSpots(world),'gleicher Seed, andere Plätze');
});

test('Kalles Kiosk steht als Ort an einer Dorfkreuzung im Dorfkern', ()=>{
 for(const seed of SEEDS){
  const w=seed===world.seed?world:new World(data,{seed});
  const k=w.places.kiosk;
  assert.ok(k,'Seed '+seed+' ohne Kiosk');
  assert.equal(k.id,'kiosk');
  assert.ok(k.name&&k.title&&k.text,'Seed '+seed+': Kiosk ohne Beschriftung');
  assert.ok(k.junction.roads>=2,'Seed '+seed+': Kiosk steht an keiner Kreuzung');
  assert.ok(inSettlement(w,k),'Seed '+seed+': Kiosk liegt außerhalb des Dorfkerns');
  const d=distance(k,w.spawn);
  assert.ok(d>=PROP_RULES.kiosk.minDistance&&d<=PROP_RULES.kiosk.maxDistance,'Seed '+seed+': Kiosk außerhalb des Dorfkern-Bandes ('+Math.round(d)+')');
  assert.ok(distance(k,k.junction)<=PROP_RULES.kiosk.distances.at(-1)+1,'Seed '+seed+': Vorplatz zu weit von der Kreuzung');
  assert.equal(w.report.valid,true,'Seed '+seed+' baut nicht');
  assert.ok(w.report.routes.some(r=>r.label===k.name&&r.reachable),'Seed '+seed+': Kiosk wird nicht auf Erreichbarkeit geprüft');
  assert.ok(w.export().places.kiosk,'Seed '+seed+': Kiosk fehlt im Export');
 }
});

test('der Vorplatz ist frei, der Anlaufpunkt begehbar und ans Wegenetz angebunden', ()=>{
 const k=world.places.kiosk;
 for(const q of [k,...corners(k)]){
  assert.equal(world.onRoad(q.x,q.y,PROP_RULES.roadMargin),false,'Vorplatz auf einem Weg');
  for(const b of world.buildings)assert.ok(!(q.x>b.minX&&q.x<b.maxX&&q.y>b.minY&&q.y<b.maxY),'Vorplatz im Gebäude '+b.id);
 }
 for(const b of world.buildings)assert.ok(distance(b.door,k)>half(k),'Vorplatz vor einer Haustür');
 assert.equal(world.blocked(k.approach.x,k.approach.y,9),false,'Anlaufpunkt versperrt');
 assert.ok(world.accessNode(k.approach),'Anlaufpunkt hängt nicht am Wegenetz');
 assert.ok(world.walkClear(k.approach,k.junction,9),'Weg vom Anlaufpunkt zur Kreuzung versperrt');
 // Hauptwege bleiben frei: kein begehbarer Wegenetz-Knoten liegt unter dem Vorplatz.
 for(const n of world.nodes)assert.ok(distance(n,k)>=half(k)+PROP_RULES.nodeMargin.loose-.5,'Kiosk liegt auf dem Wegenetz');
});

test('die drei Kiosk-Kulissen stehen auf dem Vorplatz und nur die Bude blockiert', ()=>{
 const k=world.places.kiosk;
 assert.deepEqual(k.props.map(p=>p.kind),['kiosk','stehtisch','wett-tafel']);
 for(const p of k.props){
  const def=PROP_KINDS[p.kind];
  assert.ok(def,'unbekannte Art '+p.kind);
  assert.equal(p.w,def.w);assert.equal(p.h,def.h);assert.equal(p.blocking,def.blocking);
  assert.equal(p.name,def.name,p.kind+' ohne Namen');
  assert.ok(p.x-p.w/2>=k.minX-1&&p.x+p.w/2<=k.maxX+1&&p.y-p.h/2>=k.minY-1&&p.y+p.h/2<=k.maxY+1,p.kind+' ragt über den Vorplatz');
  for(const q of [p,...corners(p)])assert.equal(world.onRoad(q.x,q.y,PROP_RULES.roadMargin),false,p.kind+' auf einem Weg');
  assert.ok(distance(p,k.approach)>=PROP_RULES.propGap,p.kind+' steht im Anlaufpunkt');
 }
 assert.equal(k.props.filter(p=>p.blocking).length,1,'genau die Kiosk-Bude ist ein Kollisionskörper');
 const bude=k.props[0];
 assert.equal(world.blocked(bude.x,bude.y,4),true,'die Kiosk-Bude blockiert nicht wirklich');
 for(let i=0;i<k.props.length;i++)for(let j=i+1;j<k.props.length;j++)
  assert.ok(Math.abs(k.props[i].x-k.props[j].x)>(k.props[i].w+k.props[j].w)/2||Math.abs(k.props[i].y-k.props[j].y)>(k.props[i].h+k.props[j].h)/2,'Kiosk-Kulissen überlagern sich');
});

test('Kreuzungen werden deterministisch gefunden und sortiert', ()=>{
 const a=roadJunctions(world),b=roadJunctions(new World(data));
 assert.deepEqual(a,b,'zwei Läufe, zwei Kreuzungslisten');
 assert.ok(a.length>=3,'keine Kreuzungen im Kartenausschnitt gefunden');
 for(const j of a)assert.ok(j.roads>=2,'Kreuzung mit nur einer Straße');
 for(let i=1;i<a.length;i++)assert.ok(a[i-1].roads>=a[i].roads||distance(a[i-1],world.spawn)<=distance(a[i],world.spawn),'Sortierung nicht stabil');
});
