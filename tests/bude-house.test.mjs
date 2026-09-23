// Die Bude als begehbares Haus im Echtmaßstab (E-52): Grundriss, Türen, Wände, Räume, Bauplätze.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance} from '../world.js';
import {BUDE_HOUSE} from '../content/index.js';
import {insideHouse,roomAt} from '../world-house.js';
import {professionWorld} from '../profession-world.js';

const data=JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'));
const world=new World(data),house=world.base.house;

test('Maßstab: 14,4 E je Meter, die 26-E-Figur ist 1,80 m, das Haus 16 × 12 m', ()=>{
 assert.equal(Math.round(26*BUDE_HOUSE.metersPerUnit*100)/100,1.81);
 assert.equal(Math.round(BUDE_HOUSE.width*BUDE_HOUSE.metersPerUnit),16);
 assert.equal(Math.round(BUDE_HOUSE.depth*BUDE_HOUSE.metersPerUnit),12);
 assert.ok(BUDE_HOUSE.heights.wall>=3*26,'Traufe liegt auf mindestens dreifacher Figurenhöhe');
});

test('jede Tür ist eine echte Lücke von mindestens 34 E (Wege mit Abstand 9 passen durch)', ()=>{
 for(const door of house.doors){
  assert.equal(world.blocked(door.x,door.y,9),false,door.id+' ist zugemauert');
  const horizontal=house.walls.filter(w=>Math.abs((w.minY+w.maxY)/2-door.y)<1&&w.maxY-w.minY<12);
  const vertical=house.walls.filter(w=>Math.abs((w.minX+w.maxX)/2-door.x)<1&&w.maxX-w.minX<12);
  const along=horizontal.length?horizontal.map(w=>[w.minX,w.maxX]):vertical.map(w=>[w.minY,w.maxY]),c=horizontal.length?door.x:door.y;
  const left=Math.max(...along.filter(([,b])=>b<=c).map(([,b])=>b)),right=Math.min(...along.filter(([a])=>a>=c).map(([a])=>a));
  assert.ok(right-left>=34,door.id+' zu schmal: '+(right-left));
 }
});

test('Wände sperren, Innenräume sind durch die Türen erreichbar', ()=>{
 for(const wall of house.walls)assert.equal(world.blocked((wall.minX+wall.maxX)/2,(wall.minY+wall.maxY)/2,5),true,wall.id+' sperrt nicht');
 for(const [id,spot] of Object.entries(house.spots)){
  assert.equal(world.blocked(spot.x,spot.y,6),false,id+' steht in einer Wand');
  const path=world.findPath(world.base.approach,spot);let prev=world.base.approach;
  assert.ok(path.length&&path.every(p=>{const ok=world.walkClear(prev,p,9);prev=p;return ok;}),id+' nicht erreichbar');
 }
 assert.ok(world.report.routes.some(r=>r.label==='Bude Schankraum'&&r.reachable));
});

test('Räume: Punkt → Raum, Dach nur über dem Haus, Hof liegt draußen', ()=>{
 assert.equal(roomAt(house,house.spots.wake.x,house.spots.wake.y).id,'schankraum');
 assert.equal(roomAt(house,house.spots.kevin.x,house.spots.kevin.y).id,'kueche');
 assert.equal(roomAt(house,house.spots.baerbel.x,house.spots.baerbel.y).id,'hinterzimmer');
 assert.equal(insideHouse(house,house.spots.wake.x,house.spots.wake.y),true);
 assert.equal(insideHouse(house,world.base.approach.x,world.base.approach.y),false);
 const hof=house.rooms.find(r=>r.id==='hof');assert.equal(hof.outdoor,true);
 assert.equal(insideHouse(house,hof.rects[0].x+30,hof.rects[0].y+80),false,'der Hof hat kein Dach');
});

test('Bauplätze stehen in ihrem Raum und nicht in einer Wand', ()=>{
 const want={tresen:'schankraum',anlage:'schankraum',landhausecke:'hinterzimmer',pfandlager:'pfandlager',grill:'hof',werkstatt:'hof'};
 for(const [id,slot] of Object.entries(world.base.stageProps)){
  assert.equal(roomAt(house,slot.slot.x,slot.slot.y)?.id,want[id],id+' im falschen Raum');
  const top=slot.stages.at(-1),box={minX:top.x-top.w/2,maxX:top.x+top.w/2,minY:top.y-top.h/2,maxY:top.y+top.h/2};
  for(const wall of house.walls)assert.ok(!(box.minX<wall.maxX&&box.maxX>wall.minX&&box.minY<wall.maxY&&box.maxY>wall.minY),id+' ragt in '+wall.id);
 }
});

test('keine Berufs-Fundstelle und kein Lager-Sammelpunkt im Haus oder Hof', ()=>{
 const b=world.base,inPlot=p=>p.x>b.minX&&p.x<b.maxX&&p.y>b.minY&&p.y<b.maxY;
 const {stations,nodes}=professionWorld(world);
 for(const p of [...stations,...nodes])assert.equal(inPlot(p),false,p.id+' liegt in der Bude');
 for(const c of world.camps)for(const p of [...(c.gathers||[]),...(c.spawns||[])])assert.equal(inPlot(p),false,c.id+' in der Bude');
});

test('alle Prüf-Seeds bauen die Bude als Haus, Wände überstehen spätere Rodungen (Kiosk)', ()=>{
 for(const seed of [42,1,7,56753,99]){
  const w=new World(data,{seed}),h=w.base.house;
  assert.equal(w.report.valid,true,'Seed '+seed);
  assert.ok(distance(w.base,w.church)<=1400,'Seed '+seed+' zu weit weg');
  for(const wall of h.walls)assert.equal(w.blocked((wall.minX+wall.maxX)/2,(wall.minY+wall.maxY)/2,5),true,'Seed '+seed+' '+wall.id+' fehlt im Raster');
 }
});
