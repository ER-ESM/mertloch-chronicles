// Kulissen der Kapitel-Lager und die Bude als Basisbau-Gelände (world-props.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance,segmentDistance} from '../world.js';
import {PROP_KINDS,PROP_RULES,CHAPTER_PROPS,placeCampProps} from '../world-props.js';
import {BUILDINGS,BUILDING_IDS} from '../content/buildings.js';
import {inSettlement} from '../world-layout.js';

const data=JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'));
const SEEDS=[1,42,56753,73519,2026,987654];
const world=new World(data);
const half=p=>Math.hypot(p.w,p.h)/2;
const corners=p=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>({x:p.x+sx*p.w/2,y:p.y+sy*p.h/2}));
const campProps=w=>w.camps.flatMap(c=>(c.props||[]).map(p=>({...p,camp:c})));

test('jedes Kapitel-Lager trägt seine Kulisse aus der festen Kind-Liste', ()=>{
 const camps=world.camps.filter(c=>c.chapter);
 assert.ok(camps.length>=6,'Kapitel 2–4 haben je ein Mob- und ein Bosslager');
 for(const c of camps){
  const set=CHAPTER_PROPS[c.chapter],erwartet=c.type==='boss'?set.boss:set.mob;
  assert.ok(Array.isArray(c.props)&&c.props.length,c.id+' ohne Kulisse');
  assert.equal(c.place,set.place,c.id+' ohne Ortsnamen');
  for(const p of c.props){
   assert.ok(PROP_KINDS[p.kind],c.id+' unbekannte Art '+p.kind);
   assert.ok(erwartet.includes(p.kind),c.id+' fremde Art '+p.kind);
   assert.equal(p.w,PROP_KINDS[p.kind].w);assert.equal(p.h,PROP_KINDS[p.kind].h);
   assert.equal(p.blocking,PROP_KINDS[p.kind].blocking);
  }
 }
 // Die Signatur-Kulissen der drei Kapitel stehen tatsächlich in der Welt.
 const arten=new Set(campProps(world).map(p=>p.kind));
 for(const kind of ['schrotthaufen','haenger','kuehlschrank','kegelbahn','bierbank','kegelkugel','bus','bierkasten','bierbong'])assert.ok(arten.has(kind),'fehlt: '+kind);
});

test('nur die großen Kulissen blockieren, und zwar als echter Kollisionskörper', ()=>{
 for(const p of campProps(world)){
  assert.equal(p.blocking,['bus','schrotthaufen'].includes(p.kind),p.kind+' blockiert falsch');
  if(p.blocking)assert.equal(world.blocked(p.x,p.y,4),true,p.id+' blockiert nicht wirklich');
 }
 for(const kind of Object.values(PROP_KINDS))if(kind.blocking)assert.ok(kind.w>=50,'nur große Objekte blockieren: '+kind.name);
});

test('Kulissen stehen kollisionsfrei zu Gebäuden, Bäumen, Wasser und Wegen', ()=>{
 for(const p of campProps(world)){
  for(const q of [p,...corners(p)]){
   assert.equal(world.onRoad(q.x,q.y,PROP_RULES.roadMargin),false,p.id+' auf einem Weg');
   for(const b of world.buildings)assert.ok(!(q.x>b.minX&&q.x<b.maxX&&q.y>b.minY&&q.y<b.maxY),p.id+' im Gebäude '+b.id);
  }
  for(const t of world.trees)assert.ok(distance(t,p)>half(p),p.id+' im Baum');
  for(const b of world.buildings)assert.ok(distance(b.door,p)>half(p),p.id+' vor einer Haustür');
 }
});

test('Anlaufpunkte, Spawns, Sammelpunkte und der Weg ins Lager bleiben frei', ()=>{
 for(const c of world.camps.filter(c=>c.props?.length)){
  for(const p of c.props){
   assert.ok(distance(p,c.approach)>PROP_RULES.approachMargin,p.id+' am Anlaufpunkt');
   assert.ok(segmentDistance(p.x,p.y,c.approach,c)>PROP_RULES.corridorMargin,p.id+' im Zuweg');
   for(const s of c.spawns)assert.ok(distance(p,s)>PROP_RULES.spawnMargin,p.id+' auf einem Spawn');
   for(const g of c.gathers||[])assert.ok(distance(p,g)>PROP_RULES.gatherMargin,p.id+' auf einem Sammelpunkt');
   assert.equal(world.blocked(c.approach.x,c.approach.y,9),false,c.id+' Anlaufpunkt versperrt');
  }
 }
 // Kulissen überlagern einander nicht.
 const alle=campProps(world);
 for(let i=0;i<alle.length;i++)for(let j=i+1;j<alle.length;j++)
  assert.ok(distance(alle[i],alle[j])>half(alle[i])+half(alle[j]),alle[i].id+' steckt in '+alle[j].id);
});

test('Hauptwege bleiben frei: kein Wegenetz-Knoten liegt unter einer Kulisse', ()=>{
 for(const p of [...campProps(world),world.base]){
  const r=half(p)+(p.blocking?PROP_RULES.nodeMargin.blocking:PROP_RULES.nodeMargin.loose);
  for(const n of world.nodes)assert.ok(distance(n,p)>=r-.5,(p.id||'bude')+' liegt auf dem Wegenetz');
 }
 assert.ok(world.report.routes.every(r=>r.reachable));
 assert.ok(world.report.doorRoutes.every(r=>r.reachable));
 assert.equal(world.report.valid,true);
});

test('die Bude steht als Gelände nahe St. Gangolf, frei und erreichbar', ()=>{
 const b=world.base;
 assert.equal(b.id,'bude');
 assert.ok(distance(b,world.church)<=PROP_RULES.base.maxDistance,'zu weit von der Kirche');
 assert.ok(distance(b,world.church)>=PROP_RULES.base.minDistance*.9,'zu dicht an der Kirche');
 assert.ok(distance(b,world.plaza)>world.plaza.radius,'versperrt den Kirchvorplatz');
 for(const q of [b,...corners(b)])assert.equal(world.onRoad(q.x,q.y,PROP_RULES.roadMargin),false,'Bude auf einem Weg');
 for(const house of world.buildings)assert.ok(!(house.minX<b.maxX&&house.maxX>b.minX&&house.minY<b.maxY&&house.maxY>b.minY),'Bude im Haus '+house.id);
 assert.equal(world.blocked(b.approach.x,b.approach.y,9),false,'Anlaufpunkt der Bude versperrt');
 assert.ok(world.report.routes.some(r=>r.label==='Bude'&&r.reachable),'Bude wird nicht auf Erreichbarkeit geprüft');
});

test('die Bude trägt für jedes Basisbau-Gebäude die Stufen aus content/buildings.js', ()=>{
 const b=world.base;
 assert.deepEqual(Object.keys(b.stageProps),BUILDING_IDS);
 for(const id of BUILDING_IDS){
  const slot=b.stageProps[id],def=BUILDINGS[id];
  assert.equal(slot.owner,def.owner,id+' ohne Paten');
  assert.deepEqual(slot.stages.map(s=>s.stage),[0,...def.stages.map(s=>s.stage)],id+' Stufenfolge');
  assert.equal(slot.stages[0].kind,'bude-truemmer-'+id,id+' beginnt nicht mit eigenen Trümmern');
  for(const [i,s] of slot.stages.entries()){
   assert.ok(PROP_KINDS[s.kind],id+' unbekannte Art '+s.kind);
   assert.ok(s.name,id+' Stufe ohne Namen');
   if(s.stage)assert.equal(s.name,def.stages[s.stage-1].name,id+' Stufenname weicht ab');
   assert.ok(s.x>=b.minX&&s.x<=b.maxX&&s.y>=b.minY&&s.y<=b.maxY,id+' Bauplatz außerhalb der Bude');
   assert.ok(s.x-s.w/2>=b.minX-1&&s.x+s.w/2<=b.maxX+1,id+' Stufe ragt aus der Bude');
   if(i>1)assert.ok(s.w>=slot.stages[i-1].w,id+' Stufe wird kleiner statt größer');
  }
  assert.equal(slot.stages.at(-1).w,PROP_KINDS['bude-'+id].w,id+' letzte Stufe hat nicht die volle Größe');
 }
 // Die Bauplätze der sechs Gebäude überschneiden sich nicht.
 const letzte=BUILDING_IDS.map(id=>b.stageProps[id].stages.at(-1));
 for(let i=0;i<letzte.length;i++)for(let j=i+1;j<letzte.length;j++)
  assert.ok(Math.abs(letzte[i].x-letzte[j].x)>(letzte[i].w+letzte[j].w)/2||Math.abs(letzte[i].y-letzte[j].y)>(letzte[i].h+letzte[j].h)/2,'Bauplätze überlagern sich');
});

test('welt-gebundene IDs bleiben über Seeds hinweg stabil, die Plätze nicht', ()=>{
 const gleich=new World(data),anders=new World(data,{seed:42});
 assert.deepEqual(campProps(world).map(p=>p.id),campProps(gleich).map(p=>p.id));
 assert.deepEqual(campProps(world).map(p=>[p.x,p.y]),campProps(gleich).map(p=>[p.x,p.y]),'gleicher Seed, gleiche Plätze');
 assert.deepEqual(world.base,gleich.base);
 assert.deepEqual(campProps(world).map(p=>p.id).sort(),campProps(anders).map(p=>p.id).sort(),'IDs sind Speicherschlüssel');
 assert.equal(anders.base.id,'bude');
 assert.notDeepEqual(campProps(world).map(p=>[p.x,p.y]),campProps(anders).map(p=>[p.x,p.y]),'anderer Seed, andere Plätze');
 for(const p of campProps(world))assert.match(p.id,/^chapter-\d+-(mob|boss)-prop-\d+$/);
});

test('alle sechs Prüf-Seeds bauen mit vollständiger Kulisse und Bude', ()=>{
 for(const seed of SEEDS){
  const w=seed===world.seed?world:new World(data,{seed});
  assert.equal(w.report.valid,true,'Seed '+seed);
  assert.equal(w.dressingReport.campProps.omitted,0,'Seed '+seed+' lässt Kulissen aus');
  assert.ok(w.dressingReport.campProps.placed>=15,'Seed '+seed+' zu wenig Kulissen');
  assert.ok(w.base?.stageProps,'Seed '+seed+' ohne Bude');
  assert.ok(w.camps.filter(c=>c.chapter).every(c=>c.props?.length),'Seed '+seed+' Lager ohne Kulisse');
  assert.ok(w.export().base,'Seed '+seed+' exportiert die Bude nicht');
 }
});

test('Befund vr-08: Mertloch hat keine Wohnpolygone, das Wohngebiet kommt aus der Bebauung', ()=>{
 assert.equal(world.areas.filter(a=>a.tags.landuse==='residential').length,0,'die Karte liefert doch Wohnpolygone');
 const drin=world.buildings.filter(b=>inSettlement(world,b)).length;
 assert.ok(drin>world.buildings.length*.6,'die Bebauungsmaske erfasst das Dorf nicht: '+drin+'/'+world.buildings.length);
 for(const c of world.camps)assert.equal(inSettlement(world,c),false,c.id+' liegt im Wohngebiet');
 for(const p of campProps(world))assert.equal(inSettlement(world,p),false,p.id+' steht im Wohngebiet');
 const feld={x:world.spawn.x+3000,y:world.spawn.y+3000};
 assert.equal(inSettlement(world,feld),false,'freies Feld gilt als Wohngebiet');
});

test('placeCampProps ist wiederholbar und meldet seinen Stand', ()=>{
 const report=world.dressingReport.campProps;
 assert.equal(report.placed,campProps(world).length);
 assert.equal(report.reverted,0,'eine blockierende Kulisse musste zurückgebaut werden');
 assert.ok(report.blocking>=1,'keine einzige große Kulisse gesetzt');
 const wieder=placeCampProps(new World(data));
 assert.deepEqual(wieder,report);
});
