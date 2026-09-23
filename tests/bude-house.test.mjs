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
 // Stammgäste (E-61): Olli am Tresen-Bauplatz, Nyalol im Hinterzimmer, Ron im Hof; die Helden stehen nicht mehr in der Bude.
 assert.equal(roomAt(house,house.spots.olli.x,house.spots.olli.y).id,'schankraum');
 assert.equal(roomAt(house,house.spots.nyalol.x,house.spots.nyalol.y).id,'hinterzimmer');
 assert.equal(roomAt(house,house.spots.ron.x,house.spots.ron.y).id,'hof');
 for(const id of ['dieter','baerbel','kevin'])assert.equal(house.spots[id],undefined,id+' hat keinen Platz mehr in der Bude');
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

test('Einbauten sperren und stehen weder auf Stellplätzen noch auf Bauplätzen', ()=>{
 const hit=(a,b)=>a.minX<b.maxX&&a.maxX>b.minX&&a.minY<b.maxY&&a.maxY>b.minY;
 for(const f of [...house.fixtures,house.stairs]){
  assert.equal(world.blocked((f.minX+f.maxX)/2,(f.minY+f.maxY)/2,5),true,f.id+' sperrt nicht');
  for(const [id,p] of Object.entries(house.spots))assert.ok(!hit(f,{minX:p.x-6,maxX:p.x+6,minY:p.y-6,maxY:p.y+6}),f.id+' steht auf '+id);
  for(const [id,slot] of Object.entries(world.base.stageProps)){const s=slot.stages.at(-1);assert.ok(!hit(f,{minX:s.x-s.w/2,maxX:s.x+s.w/2,minY:s.y-s.h/2,maxY:s.y+s.h/2}),f.id+' überdeckt den Bauplatz '+id);}
 }
 assert.equal(world.blocked(house.stairs.foot.x,house.stairs.foot.y,6),false,'Treppenfuß frei');
});

test('Obergeschoss: eigene Wände, Treppenloch, jeder Raum vom Absatz erreichbar', async()=>{
 const {upperWorld}=await import('../world-house.js');const up=upperWorld(house),f=house.upper,landing=f.stairs.landing;
 assert.equal(up.blocked(landing.x,landing.y,6),false,'Absatz frei');
 assert.equal(up.blocked((f.stairs.minX+f.stairs.maxX)/2,(f.stairs.minY+f.stairs.maxY)/2,5),true,'Treppenloch sperrt');
 assert.equal(up.blocked(house.minX-20,house.minY+50,5),true,'außerhalb des Hauses gibt es oben keinen Boden');
 for(const wall of f.walls)assert.equal(up.blocked((wall.minX+wall.maxX)/2,(wall.minY+wall.maxY)/2,5),true,wall.id+' sperrt nicht');
 for(const room of f.rooms){const q=room.rects[0],goal=up.findClear(q.x+q.w/2,q.y+q.h/2,6),path=up.findPath(landing,goal);let prev=landing;
  assert.ok(path.length&&path.every(p=>{const ok=up.walkClear(prev,p,6);prev=p;return ok;}),room.id+' vom Absatz nicht erreichbar');
  assert.equal(roomAt(house,goal.x,goal.y,1)?.id,room.id);}
});

test('Treppe: hoch und runter per Aktion, oben eigene Kollision, Speichern am Treppenfuß, Wiederbeleben unten', async()=>{
 const {Game}=await import('../engine.js'),g=new Game(world,{version:1,tutorial:{version:1,step:8,completed:true}}),h=house;
 Object.assign(g.player,{x:h.stairs.foot.x,y:h.stairs.foot.y});
 assert.equal(g.stairsInteraction()?.label,'Treppe hoch');
 assert.equal(g.useStairs(),true);assert.equal(g.floor,1);assert.deepEqual({x:g.player.x,y:g.player.y},{x:h.upper.stairs.landing.x,y:h.upper.stairs.landing.y});
 assert.equal(g.walkWorld().upper,true,'oben läuft der Held in der Obergeschoss-Welt');
 // Ins Treppenloch kann man oben nicht laufen: nach Westen gegen das Loch.
 const before=g.player.x;for(let i=0;i<40;i++)g.move(g.player,-2,0);assert.ok(g.player.x>h.upper.stairs.maxX-1,'durchs Treppenloch gefallen: '+g.player.x+' (vorher '+before+')');
 assert.deepEqual(g.save().position,{x:h.stairs.foot.x,y:h.stairs.foot.y,facing:g.player.facing===-1?-1:1},'oben gespeichert, unten am Treppenfuß weiter');
 Object.assign(g.player,{x:h.upper.stairs.landing.x,y:h.upper.stairs.landing.y});
 assert.equal(g.stairsInteraction()?.label,'Treppe runter');assert.equal(g.useStairs(),true);assert.equal(g.floor,0);
 g.floor=1;g.respawn();assert.equal(g.floor,0,'Wiederbeleben im Erdgeschoss');
 Object.assign(g.player,{x:h.stairs.foot.x+60,y:h.stairs.foot.y});assert.equal(g.stairsInteraction(),null,'nur direkt an der Treppe');
});

test('Baukasten: Arten erben die Regeln ihrer Klasse, Überschreibungen gewinnen', async()=>{
 const {resolveSprite,kitIs}=await import('../world-kit.js');
 const t=resolveSprite('stehtisch');assert.equal(t.top,true,'Ablage von ablage');assert.equal(t.walkable,false,'sperrt wie moebel');assert.equal(t.indoor,true);assert.ok(kitIs(t,'moebel'));
 const k=resolveSprite('kloschuessel');assert.deepEqual(k.needs,['nass']);assert.ok(kitIs(k,'nassmoebel'));
 const d=resolveSprite('dartscheibe');assert.equal(d.surface,'wall-face');assert.equal(d.walkable,true);assert.equal(d.mount,9,'eigene Aufhängehöhe überschreibt die Klasse');
 assert.equal(resolveSprite('zaun-latten').cut,12,'Zaun erbt von wand, überschreibt die Höhe');
 assert.throws(()=>resolveSprite('gibt-es-nicht'));
});

test('Baukasten-Prüfer: jede Regel erkennt ihren Verstoß', async()=>{
 const {validateKitFloor,placeKitItems}=await import('../world-kit.js');
 const o=house.origin,with_=extra=>({...house,items:[...house.items,...placeKitItems(extra,o,'test-')]});
 const broke=(extra,rule)=>{const p=validateKitFloor(with_(extra)).filter(x=>x.startsWith(rule+':'));assert.ok(p.length,rule+' nicht erkannt: '+JSON.stringify(extra));};
 assert.deepEqual(validateKitFloor(house),[],'die Bude selbst ist regelkonform');
 assert.deepEqual(validateKitFloor(house.upper),[],'das Obergeschoss ist regelkonform');
 broke([{s:'dartscheibe',x:60,y:130}],'wandschmuck');            // mitten im Raum
 broke([{s:'dartscheibe',x:92,y:40}],'wandschmuck');             // an einer senkrechten Wand
 broke([{s:'kloschuessel',x:60,y:120}],'merkmale');              // Klo im Schankraum
 broke([{s:'stuhl',x:112,y:163}],'tueren');                      // vor dem Eingang
 broke([{s:'bierkrug',x:60,y:120}],'ablage');                     // Krug auf dem Boden
 broke([{s:'bierbank',x:60,y:120}],'draussen');                   // Bierbank unter dem Dach
 broke([{s:'kommode',x:280,y:60}],'draussen');                    // Kommode im Hof
 broke([{s:'stehtisch',x:107,y:128}],'sperrt');                   // auf den vorhandenen Stehtisch
 broke([{s:'kommode',x:92,y:40}],'boden');                        // in der Wand
});
