// Kulissen-Objekte der Welt: Kapitel-Lager (Sperrmüllplatz, Festplatz, Bus im Feld) und die Bude als Basisbau-Gelände.
// Reine Weltdaten – gezeichnet wird in der UI (docs/backlog/ui.md), Laufzeitregeln bleiben bei der Engine.
// Alles deterministisch aus dem Weltseed mit eigenen Zufallsströmen (seed ^ salt), damit Quests, Lager und Dressing
// unabhängig bleiben. Requisiten halten Wege, Gebäude, Bäume, Anlaufpunkte, Spawns und Sammelpunkte frei;
// `blocking:true` haben nur die großen Kulissen (Bus, Schrotthaufen), und die werden nach dem Setzen erneut
// auf Erreichbarkeit geprüft (Rückbau, wenn ein Anlaufpunkt oder Spawn dadurch abgeschnitten würde).
import {distance,rng,segmentDistance} from './world.js';
import {placementReason,nearWater,DRESSING_RULES} from './world-dressing.js';
const DOOR_CLEARANCE=DRESSING_RULES.doorClearance;
import {BUILDINGS,BUILDING_IDS} from './content/buildings.js';
import {PROP_KINDS,CHAPTER_PROPS,PROP_RULES} from './world-prop-kinds.js';
import {inSettlement} from './world-layout.js';
import {BUDE_HOUSE} from './content/bude-house.js';
import {budeHouse,budePlotSize,houseLocal,addHouseColliders} from './world-house.js';

export {PROP_KINDS,PROP_KIND_IDS,CHAPTER_PROPS,PROP_RULES} from './world-prop-kinds.js';
const halfDiag=k=>Math.hypot(k.w,k.h)/2;
const rectOf=p=>({minX:p.x-p.w/2,maxX:p.x+p.w/2,minY:p.y-p.h/2,maxY:p.y+p.h/2});
function rectPoints(p,step=9){const out=[],r=rectOf(p);
 for(let x=r.minX;;x=Math.min(x+step,r.maxX)){for(let y=r.minY;;y=Math.min(y+step,r.maxY)){out.push({x,y});if(y>=r.maxY)break;}if(x>=r.maxX)break;}
 return out;}
/** Fläche frei von Gebäuden, Bäumen, Wasser, Türen und Wegen? */
function areaFree(w,p,roadMargin){return rectPoints(p).every(q=>!placementReason(w,q,'flowers',{reserved:true,radius:4})&&!w.onRoad(q.x,q.y,roadMargin));}
/** Bauplatz der Bude: Gebäude, Türen, Wasser und Wege zählen, Bewuchs nicht – der wird beim Bau gerodet. */
function plotFree(w,p,roadMargin){const r=rectOf(p),gap=14;
 if(w.buildings.some(b=>r.minX<b.maxX+gap&&r.maxX>b.minX-gap&&r.minY<b.maxY+gap&&r.maxY>b.minY-gap))return false;
 if(w.buildings.some(b=>distance(b.door,p)<halfDiag(p)+DOOR_CLEARANCE))return false;
 return rectPoints(p).every(q=>!nearWater(w,q,6)&&!w.onRoad(q.x,q.y,roadMargin));}
/** Bewuchs auf dem Bauplatz roden und das Kollisionsraster neu aufbauen (Wege werden dadurch nur freier, nie enger). */
// `south`: Bäume südlich des Platzes ragen mit der Krone in der Draufsicht darüber (bis ~125 E) – bei Bedarf weiter roden.
function clearPlot(w,p,margin=10,south=margin){const r=rectOf(p),before=w.trees.length;
 w.trees=w.trees.filter(t=>t.x<r.minX-margin||t.x>r.maxX+margin||t.y<r.minY-margin||t.y>r.maxY+south);
 w.grid.clear();for(const b of w.buildings)w.addGrid(b);for(const o of w.fixedColliders||[])w.addGrid(o);
 for(const t of w.trees)w.addGrid({x:t.x,y:t.y,radius:4*t.size,minX:t.x-6,maxX:t.x+6,minY:t.y-6,maxY:t.y+6});
 w.props=w.props.filter(q=>q.x<r.minX-4||q.x>r.maxX+4||q.y<r.minY-4||q.y>r.maxY+4);
 w.gardens=w.gardens.filter(q=>q.x<r.minX-4||q.x>r.maxX+4||q.y<r.minY-4||q.y>r.maxY+4);
 return before-w.trees.length;}
/** Kein begehbarer Wegenetz-Knoten unter der Kulisse: Hauptwege und Hauszugänge bleiben frei. */
function nodeFree(w,p,margin){const r=halfDiag(p)+margin,bx=Math.floor(p.x/60),by=Math.floor(p.y/60),cells=Math.ceil(r/60);
 for(let x=bx-cells;x<=bx+cells;x++)for(let y=by-cells;y<=by+cells;y++)for(const n of w.navSpatial?.get(x+','+y)||[])if(distance(n,p)<r)return false;
 return true;}
function addCollider(w,p){const o={x:p.x,y:p.y,propId:p.id,...rectOf(p)};w.addGrid(o);return o;}
function removeCollider(w,o){for(const list of w.grid.values()){const i=list.indexOf(o);if(i>=0)list.splice(i,1);}}
/** Nach dem Setzen großer Kulissen: bleiben Anlaufpunkt, Spawns und Sammelpunkte begehbar und angebunden? */
function campReachable(w,camp){const points=[camp.approach,...(camp.spawns||[]),...(camp.gathers||[])].filter(Boolean);
 return points.every(p=>!w.blocked(p.x,p.y,9)&&!!w.accessNode(p));}

/** Kulissen an den Kapitel-Lagern. Wird nach dem Vegetationsaufbau aufgerufen, damit Bäume bereits im Kollisionsraster stehen. */
export function placeCampProps(w){
 const random=rng((w.seed|0)^PROP_RULES.campSalt),placed=[],report={placed:0,omitted:0,blocking:0,reverted:0};
 const camps=w.camps.filter(c=>c.chapter&&CHAPTER_PROPS[c.chapter]);
 const questPoints=w.quests.flatMap(q=>[q.giver,q.target,...q.items]);
 for(const camp of camps){
  const set=CHAPTER_PROPS[camp.chapter],kinds=camp.type==='boss'?set.boss:set.mob;camp.place=set.place;camp.props=[];
  for(const [index,kind] of kinds.entries()){
   const def=PROP_KINDS[kind],R=PROP_RULES;let chosen=null;
   for(let tries=0;tries<R.ring.tries&&!chosen;tries++){
    const angle=random()*Math.PI*2,d=R.ring.min+random()*(R.ring.max-R.ring.min);
    const p={id:`${camp.id}-prop-${index}`,kind,x:Math.round(camp.x+Math.cos(angle)*d),y:Math.round(camp.y+Math.sin(angle)*d),w:def.w,h:def.h,blocking:def.blocking};
    const reach=halfDiag(p);
    if(!areaFree(w,p,R.roadMargin))continue;
    if(camp.approach&&(distance(p,camp.approach)<R.approachMargin+reach||segmentDistance(p.x,p.y,camp.approach,camp)<R.corridorMargin+reach))continue;
    if((camp.spawns||[]).some(s=>distance(p,s)<R.spawnMargin+reach))continue;
    if((camp.gathers||[]).some(s=>distance(p,s)<R.gatherMargin+reach))continue;
    if(questPoints.some(q=>distance(p,q)<R.questMargin+reach))continue;
    if((w.hubs||[]).some(h=>distance(p,h)<(h.reserve||120)+reach)||distance(p,w.plaza)<w.plaza.radius+reach)continue;
    if(placed.some(o=>distance(p,o)<R.propGap+reach+halfDiag(o)))continue;
    if(!nodeFree(w,p,def.blocking?R.nodeMargin.blocking:R.nodeMargin.loose))continue;
    chosen=p;
   }
   if(!chosen){report.omitted++;continue;}
   if(chosen.blocking){const collider=addCollider(w,chosen);
    if(!campReachable(w,camp)){removeCollider(w,collider);report.reverted++;report.omitted++;continue;}
    report.blocking++;}
   camp.props.push(chosen);placed.push(chosen);report.placed++;
  }
 }
 w.campProps=placed;if(w.dressingReport)w.dressingReport.campProps=report;return report;
}

/** Bauplätze der Bude: je Basisbau-Gebäude ein fester Platz auf dem Gelände, je Stufe eine wachsende Kulisse.
 * Stufe 0 sind die Trümmer aus der Filmriss-Nacht; die Stufennamen kommen aus content/buildings.js (nur gelesen). */
function stagePropsFor(base){
 const out={},R=PROP_RULES.base;
 for(const id of BUILDING_IDS){
  const def=PROP_KINDS['bude-'+id],building=BUILDINGS[id];
  // Jeder Bauplatz steht in seinem Raum des Hauses (content/bude-house.js), der Grill und die Werkstatt im Hof.
  const slot=houseLocal(base.house,BUDE_HOUSE.slots[id]);
  // Eigener Trümmer-Sprite je Gebäude, sobald geliefert (docs/UEBERGABE-GRAFIK-2026-09-23.md), sonst der gemeinsame.
  const rubbleKind=PROP_KINDS['bude-truemmer-'+id]?'bude-truemmer-'+id:'bude-truemmer',max=building.stages.length,rubble=PROP_KINDS[rubbleKind];
  const stages=[{stage:0,kind:rubbleKind,name:'Trümmer: '+building.name,x:slot.x,y:slot.y,
   w:Math.round(rubble.w*R.rubble),h:Math.round(rubble.h*R.rubble),height:rubble.height,blocking:false}];
  for(const s of building.stages){const f=.6+.4*s.stage/max;
   // `art`: gemaltes Möbel genau dieser Stufe (bude-house-art.js), sonst zeichnet die Art ihr gemeinsames Bild.
   stages.push({stage:s.stage,kind:'bude-'+id,art:id+'-'+s.stage,name:s.name,x:slot.x,y:slot.y,
    w:Math.round(def.w*f),h:Math.round(def.h*f),height:Math.round(def.height*f),blocking:false});}
  out[id]={owner:building.owner,slot,stages};
 }
 return out;
}
/** Die Bude: ehemalige Milchsammelstelle hinter St. Gangolf, seit E-52 ein begehbares Haus mit Hof im Echtmaßstab.
 * Fläche frei von Wegen, Gebäuden und Bäumen, Anlaufpunkt vor dem Eingang am Wegenetz. Gezeichnet wird sie von der UI. */
export function placeBase(w){
 const R={...PROP_RULES.base,...budePlotSize()},random=rng((w.seed|0)^PROP_RULES.baseSalt),church=w.church,start=-Math.PI/2+(random()-.5)*.6;
 const tally={},no=r=>{tally[r]=(tally[r]||0)+1;};
 // Erst die Rückseite der Kirche (vom Kirchvorplatz abgewandt), dann erst der Rest des Umfelds.
 // Erst bis maxDistance; nur wenn dort nichts frei ist (breitere Straßen, dichtere Bebauung), bis zum Doppelten weitersuchen.
 for(const [from,to] of [[R.minDistance,R.maxDistance],[R.maxDistance+R.step,R.maxDistance*2]])for(const behind of [true,false])for(let d=from;d<=to;d+=R.step)for(let i=0;i<R.angles;i++){
  const angle=start+(i%2?1:-1)*Math.ceil(i/2)*(Math.PI*2/R.angles);
  if(behind!==(Math.cos(angle-start)>0))continue;
  const p={x:Math.round(church.x+Math.cos(angle)*d),y:Math.round(church.y+Math.sin(angle)*d),w:R.w,h:R.h};
  if(!plotFree(w,p,PROP_RULES.roadMargin)){no('belegt');continue;}
  if(distance(p,w.plaza)<w.plaza.radius+halfDiag(p)||distance(p,w.spawn)<halfDiag(p)+40){no('kirchvorplatz');continue;}
  if((w.hubs||[]).some(h=>h.id!=='kirchplatz'&&distance(p,h)<(h.reserve||120)+halfDiag(p))){no('treffpunkt');continue;}
  if(w.camps.some(c=>distance(c,p)<(c.reserve||150)+halfDiag(p))){no('lager');continue;}
  if(w.quests.some(q=>distance(q.giver,p)<60+halfDiag(p)||distance(q.target,p)<80+halfDiag(p))){no('quest');continue;}
  // Sammel-, Spawn- und Questgegenstandspunkte dürfen nicht im Haus oder Hof landen (sonst Kisten im Schankraum).
  {const r=rectOf(p),inPlot=q=>q&&q.x>r.minX-16&&q.x<r.maxX+16&&q.y>r.minY-16&&q.y<r.maxY+16;
   if(w.camps.some(c=>[...(c.gathers||[]),...(c.spawns||[]),c.approach].some(inPlot))||w.quests.some(q=>(q.items||[]).some(inPlot))){no('sammelpunkt');continue;}}
  if(!nodeFree(w,p,PROP_RULES.nodeMargin.loose)){no('wegenetz');continue;}
  // Angelaufen wird die Eingangstür an der Südseite; durch die 34 E breite Öffnung führt der Weg mit Abstand 9 hinein.
  const house=budeHouse(rectOf(p)),door=house.doors.find(d=>d.id==='eingang'),inside={x:door.x,y:house.maxY-24};
  const approach=[{x:door.x,y:house.maxY+R.approach}].find(a=>!w.blocked(a.x,a.y,9)&&w.walkClear(a,inside,9)&&!!w.accessNode(a));
  if(!approach){no('anlaufpunkt');continue;}
  const base={id:'bude',name:'Die Bude',title:'Die Bude · Poo-Tang-Clan',
   text:'Ehemalige Milchsammelstelle hinter St. Gangolf, seit 2007 Vereinsheim ohne Verein. Seit der Nacht: Baustelle.',
   x:p.x,y:p.y,w:R.w,h:R.h,minX:p.x-R.w/2,maxX:p.x+R.w/2,minY:p.y-R.h/2,maxY:p.y+R.h/2,
   approach:{x:Math.round(approach.x),y:Math.round(approach.y)},distanceToChurch:Math.round(d),house,sign:houseLocal(house,BUDE_HOUSE.sign)};
  base.clearedTrees=clearPlot(w,p,30,140);addHouseColliders(w,house);
  // Start in der Bude (E-52): neue Helden wachen im Schankraum auf, Kisten-Ida steht als Bauleiterin am Eingang.
  w.start={x:house.spots.wake.x,y:house.spots.wake.y};w.npc={...w.npc,x:house.spots.ida.x,y:house.spots.ida.y};
  base.stageProps=stagePropsFor(base);w.base=base;return base;
 }
 throw new Error('Kein freier, erreichbarer Bauplatz für die Bude hinter St. Gangolf gefunden. Abgelehnt: '+JSON.stringify(tally));
}

/** Kreuzungen im Dorf: ein Wegpunkt einer Straße, der auf einer **anderen** Straße liegt. Hauszugänge (`entrance`)
 * zählen nicht mit, schmale Trampelpfade ebenso wenig (`minRoadWidth`). Ergebnis ist rasterdedupliziert und
 * deterministisch sortiert: erst echte Mehrfachkreuzungen, dann Nähe zum Treffpunkt. */
export function roadJunctions(w){
 const K=PROP_RULES.kiosk,segments=[];
 for(const road of w.roads){
  if(road.entrance||road.width<K.minRoadWidth)continue;
  for(let i=1;i<road.points.length;i++)segments.push({road,a:road.points[i-1],b:road.points[i]});
 }
 const near=p=>distance(p,w.spawn)<=K.maxDistance+K.junctionGrid;
 const found=new Map();
 for(const s of segments)for(const p of [s.a,s.b]){
  if(!near(p))continue;
  const others=segments.filter(o=>o.road!==s.road&&segmentDistance(p.x,p.y,o.a,o.b)<K.junctionTolerance);
  if(!others.length)continue;
  const key=Math.round(p.x/K.junctionGrid)+','+Math.round(p.y/K.junctionGrid);
  const entry=found.get(key)||{x:Math.round(p.x),y:Math.round(p.y),roads:new Set()};
  entry.roads.add(s.road.id);for(const o of others)entry.roads.add(o.road.id);
  found.set(key,entry);
 }
 return [...found.values()].map(j=>({x:j.x,y:j.y,roads:j.roads.size}))
  .sort((a,b)=>b.roads-a.roads||distance(a,w.spawn)-distance(b,w.spawn)||a.x-b.x||a.y-b.y);
}
const kioskFacing=(from,to)=>{const dx=to.x-from.x,dy=to.y-from.y;return Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx)||1,y:0}:{x:0,y:Math.sign(dy)||1};};
/** Die drei Kulissen des Vorplatzes: Bude mit Tresenfenster hinten, Stehtisch und Wett-Tafel vorn zur Kreuzung. */
function kioskProps(center,front){
 const P=PROP_RULES.kiosk.props,side={x:-front.y,y:front.x},out=[];
 const at=(kind,along,across)=>{const def=PROP_KINDS[kind];
  out.push({id:'kiosk-prop-'+out.length,kind,name:def.name,x:Math.round(center.x+front.x*along+side.x*across),
   y:Math.round(center.y+front.y*along+side.y*across),w:def.w,h:def.h,height:def.height,blocking:def.blocking});};
 at('kiosk',-P.counter,0);at('stehtisch',P.front,P.side);at('wett-tafel',P.front,-P.side);
 return out;
}
/** Kalles Kiosk als Ort im Dorfkern: Vorplatz an einer Dorfkreuzung, Tresenfenster zur Kreuzung, Stehtisch und
 * Wett-Tafel daneben. Regeln aus content/IDEEN-LANDJUNGS.md §Platzierung: begehbare Anbindung, genug Stellfläche,
 * Abstand zu Türen, Treffpunkten und Bäumen, Hauptwege bleiben frei. Der Kiosk ist ein Ort, kein NPC — Kalle selbst
 * gehört Story und Engine (docs/backlog/story.md, docs/backlog/engine.md). */
export function placeKiosk(w){
 const K=PROP_RULES.kiosk,tally={},no=r=>{tally[r]=(tally[r]||0)+1;},junctions=roadJunctions(w)
  .filter(j=>distance(j,w.spawn)>=K.minDistance&&distance(j,w.spawn)<=K.maxDistance&&inSettlement(w,j)&&distance(j,w.plaza)>w.plaza.radius+K.plazaGap);
 for(const junction of junctions)for(const d of K.distances)for(let i=0;i<K.angles;i++){
  const angle=(i%2?1:-1)*Math.ceil(i/2)*(Math.PI*2/K.angles);
  const p={x:Math.round(junction.x+Math.cos(angle)*d),y:Math.round(junction.y+Math.sin(angle)*d),w:K.w,h:K.h};
  if(!plotFree(w,p,PROP_RULES.roadMargin)){no('belegt');continue;}
  if(distance(p,w.plaza)<w.plaza.radius+halfDiag(p)||distance(p,w.spawn)<K.minDistance*.7){no('kirchvorplatz');continue;}
  if((w.hubs||[]).some(h=>distance(p,h)<(h.reserve||120)+K.hubGap)){no('treffpunkt');continue;}
  if(w.base&&distance(p,w.base)<halfDiag(p)+halfDiag(w.base)+K.baseGap){no('bude');continue;}
  if(w.camps.some(c=>distance(c,p)<(c.reserve||150)+halfDiag(p))){no('lager');continue;}
  if(w.quests.some(q=>distance(q.giver,p)<K.questGap+halfDiag(p)||distance(q.target,p)<K.questGap+halfDiag(p))){no('quest');continue;}
  if(!nodeFree(w,p,PROP_RULES.nodeMargin.loose)){no('wegenetz');continue;}
  const front=kioskFacing(p,junction);
  const approach={x:Math.round(p.x+front.x*(front.x?K.w/2+K.approach:0)),y:Math.round(p.y+front.y*(front.y?K.h/2+K.approach:0))};
  if(w.blocked(approach.x,approach.y,9)||!w.walkClear(approach,junction,9)||!w.accessNode(approach)){no('anlaufpunkt');continue;}
  const props=kioskProps(p,front);
  if(props.some(q=>!plotFree(w,q,PROP_RULES.roadMargin)||distance(q,approach)<PROP_RULES.propGap+halfDiag(q))){no('kulisse');continue;}
  const clearedTrees=clearPlot(w,p);
  const colliders=props.filter(q=>q.blocking).map(q=>addCollider(w,q));
  if(w.blocked(approach.x,approach.y,9)||!w.accessNode(approach)){for(const c of colliders)removeCollider(w,c);no('anlaufpunkt');continue;}
  const place={id:'kiosk',kind:'kiosk',name:'Kalles Kiosk',title:'Kalles Kiosk · „Quote gut, Ende schlecht“',
   text:'Tresenfenster an der Dorfkreuzung, Stehtisch für zwei Meinungen und eine Wett-Tafel mit Kreide. Kalle hält Bargeld für die einzige ehrliche Währung.',
   x:p.x,y:p.y,w:K.w,h:K.h,minX:p.x-K.w/2,maxX:p.x+K.w/2,minY:p.y-K.h/2,maxY:p.y+K.h/2,
   junction:{x:junction.x,y:junction.y,roads:junction.roads},facing:front,
   approach,distanceToSpawn:Math.round(distance(p,w.spawn)),clearedTrees,props};
  const door={x:props[0].x,y:props[0].y+props[0].h/2+14};place.entrance=!w.blocked(door.x,door.y,9)&&w.accessNode(door)?door:approach;
  w.places={...(w.places||{}),kiosk:place};
  if(w.dressingReport)w.dressingReport.kiosk={junctions:junctions.length,rejected:tally,props:props.length};
  return place;
 }
 throw new Error('Kein freier Vorplatz für Kalles Kiosk an einer Dorfkreuzung gefunden ('+junctions.length+' Kreuzungen). Abgelehnt: '+JSON.stringify(tally));
}
