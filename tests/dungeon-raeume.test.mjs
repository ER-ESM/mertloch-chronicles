// Räume des Dungeons als Orte (docs/DUNGEON-RAEUME-2026-09-25.md): Raster, Wandfronten, Requisiten und Garagenbauplatz – ohne Browser.
// Browserprüfung mit Aufnahmen, Geheimnis-Pixelvergleich und Bildzeit: scripts/dungeon-raeume-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {DUNGEONS,DUNGEON_SCENERY,DUNGEON_SCALE as U,KIT_SPRITES} from '../content/index.js';
import {floorPlan,cellAt,auditScenery,garageLot,crownOver,clearDungeonLot,sceneryLights,FACE,CROWN,CELL} from '../dungeon-scenery.js';
import {entranceFor,rectWorld} from '../dungeon.js';

const def=DUNGEONS['schloss-bigb'],S=DUNGEON_SCENERY['schloss-bigb'];
const floors=Object.keys(def.floors);

test('jeder Raum hat Boden und Wandfront aus dem Baukasten bzw. den Malern, jede Ebene eine Masse',()=>{
 for(const room of def.rooms){const c=S.rooms[room.id];assert.ok(c,'Ausstattung für '+room.id);assert.ok(KIT_SPRITES[c.belag],room.id+': Belag '+c.belag+' im Baukasten');assert.ok(c.wall,room.id+': Wandfront');}
 for(const f of floors)assert.ok(['mauerwerk','erdreich','basalt'].includes(S.floors[f].mass),f+': Masse');
 // Materialwelt je Ebene: Garage, Partykeller/Büro, Basalt
 assert.equal(S.rooms.hof.belag,'estrich');assert.equal(S.rooms.rittersaal.belag,'partykeller-fliesen');assert.equal(S.rooms.musterwohnung.belag,'laminat');
 for(const id of ['weinkeller','kelterhalle','thronsaal'])assert.equal(S.rooms[id].belag,'basalt-quader');
});

test('Wände liegen nur in den Lücken: keine Front und keine Krone auf begehbarem Boden, Fronten höchstens 22 E',()=>{
 for(const f of floors){const p=floorPlan(def,f,[]);let walk=0;
  for(let k=0;k<p.walk.length;k++){if(!p.walk[k])continue;walk++;assert.equal(p.faceH[k],0,f+': Front auf begehbarem Feld');assert.equal(p.crown[k],0,f+': Krone auf begehbarem Feld');}
  assert.ok(walk>1000,f+': Raster trägt die Räume');
  for(const s of p.segments){assert.ok(s.F>=0&&s.F<=FACE,f+': Fronthöhe '+s.F);
   // über Front und Krone liegt kein begehbares Feld (die Front deckt nie einen anderen Raum ab)
   for(let x=s.x0+CELL/2;x<s.x1;x+=CELL)for(let y=s.base-s.F-CROWN+CELL/2;y<s.base;y+=CELL)assert.notEqual(cellAt(p,x,y),'walk',f+': Front von '+s.room+' deckt Boden bei '+x+','+y);}}
 // Nordwand zur Masse: volle Höhe; geschnittene Innenwand in 1-m-Lücken
 const e0=floorPlan(def,'e0',[]),k1=floorPlan(def,'k1',[]);
 assert.ok(e0.segments.some(s=>s.room==='hof'&&s.F===FACE),'Garage mit voller Wandfront');
 assert.ok(k1.segments.some(s=>s.room==='rittersaal'&&s.F===CELL*2),'Rittersaal mit geschnittener Innenwand');
 assert.ok(k1.segments.some(s=>s.room==='galerie'&&s.F===FACE),'Ahnengalerie mit voller Wandfront für die Porträts');
});

test('Figuren an der Nordwand stehen vor der Wand: über der Raumkante liegt Front, nicht Masse',()=>{
 for(const f of floors){const p=floorPlan(def,f,[]);
  for(const s of p.segments.filter(s=>s.F>=FACE))for(let x=s.x0+1;x<s.x1;x+=8)for(const dy of [2,10,20])assert.equal(cellAt(p,x,s.base-dy),'face',f+' '+s.room+': Front '+dy+' E über der Kante');}
});

test('verborgene Räume sind Masse: gleiches Raster wie ohne den Raum, keine Requisiten, keine Front',()=>{
 const hidden=floorPlan(def,'e0',['wehrgang']),without=floorPlan({...def,rooms:def.rooms.filter(r=>r.id!=='wehrgang')},'e0',[]),shown=floorPlan(def,'e0',[]);
 const q=def.rooms.find(r=>r.id==='wehrgang').rects[0],o=def.floors.e0.origin;
 for(let x=o.x+q[0]*U-16;x<o.x+(q[0]+q[2])*U+16;x+=CELL)for(let y=o.y+q[1]*U-16;y<o.y+(q[1]+q[3])*U+16;y+=CELL)assert.equal(cellAt(hidden,x,y),cellAt(without,x,y),'Wehrgang verborgen wie nicht da bei '+x+','+y);
 assert.ok(!hidden.items.standing.some(i=>i.room==='wehrgang'),'keine Requisiten auf dem verborgenen Dach');assert.ok(!hidden.segments.some(s=>s.room==='wehrgang'),'keine Brüstung');
 assert.ok(shown.items.standing.some(i=>i.room==='wehrgang'),'nach der Entdeckung stehen sie da');
});

test('Requisiten: 3–8 Arten je Raum, frei von Laufwegen, Türen, Übergängen, Packs, Bossen, Arenen und Truhenplatz; Wege durch alle Räume',()=>{
 const a=auditScenery(null);
 assert.deepEqual(a.unreachable,[],'alles erreichbar');assert.deepEqual(a.problems,[],'keine Konflikte');
 for(const room of def.rooms){const n=a.summary.kinds[room.id]||0;assert.ok(n>=3&&n<=8,room.id+': '+n+' Arten');}
 // Schatzkammer: Mitte frei für die Endtruhe (Etappe 3)
 const k2=floorPlan(def,'k2',[]),o=def.floors.k2.origin,chest={x:o.x+54*U,y:o.y+41.2*U};
 for(const it of [...k2.items.standing,...k2.items.decals].filter(i=>i.room==='schatz'))assert.ok(Math.hypot(it.x-chest.x,it.y-chest.y)>2.6*U,'Truhenplatz frei ('+it.sprite+')');
});

test('Leuchten geben dem Kellerlicht die Lichtpunkte; jeder Raum hat Licht',()=>{
 for(const f of floors){const p=floorPlan(def,f,[]),L=sceneryLights(def,f,p);
  for(const room of p.rooms)assert.ok(L.some(s=>room.rects.some(q=>{const r=rectWorld(def,f,q);return s.x>=r.x-8&&s.x<=r.x+r.w+8&&s.y>=r.y-24&&s.y<=r.y+r.h+8;})),f+': Licht in '+room.id);}
 const k2=sceneryLights(def,'k2',floorPlan(def,'k2',[]));assert.ok(k2.filter(s=>s.kind==='fackel').length>=5,'Fackeln im Basaltkeller');
});

test('Garage draußen: Tor am Eingang, Bäume davor fallen weg, der Eingangspunkt bleibt derselbe',()=>{
 const w=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
 const door={...entranceFor(w,'schloss-bigb')},lot=garageLot(door);
 assert.ok(lot.minX<door.x&&lot.maxX>door.x,'Eingang liegt vor der Garage');assert.equal(lot.maxY,door.y,'Front auf der Linie des Eingangs');
 const before=w.trees.filter(t=>crownOver(t,lot)).length,trees=w.trees.length,removed=clearDungeonLot(w);
 assert.equal(removed,before,'nur Bäume, deren Krone vor der Garage läge');assert.equal(w.trees.length,trees-removed);
 assert.equal(w.trees.filter(t=>crownOver(t,lot)).length,0,'keine Krone mehr vor der Garage');
 assert.equal(clearDungeonLot(w),0,'nur einmal');
 const again=entranceFor(w,'schloss-bigb');assert.equal(again.x,door.x);assert.equal(again.y,door.y);
 // Kollision der entfernten Bäume ist mit weg: am Stamm des ersten ist frei
 for(const cell of w.grid.values())for(const o of cell)assert.ok(o.id||o.propId||!(Math.abs(o.x-door.x)<160&&Math.abs(o.y-door.y)<160&&o.radius&&o.y>=door.y-2&&o.x+o.radius*11>lot.minX&&o.x-o.radius*11<lot.maxX&&o.y-o.radius*24<lot.maxY),'Baumkollision vor der Garage entfernt');
});
