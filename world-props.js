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
function clearPlot(w,p,margin=10){const r=rectOf(p),before=w.trees.length;
 w.trees=w.trees.filter(t=>t.x<r.minX-margin||t.x>r.maxX+margin||t.y<r.minY-margin||t.y>r.maxY+margin);
 w.grid.clear();for(const b of w.buildings)w.addGrid(b);
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
 for(const [index,id] of BUILDING_IDS.entries()){
  const def=PROP_KINDS['bude-'+id],building=BUILDINGS[id];
  const slot={x:base.x+(index%3-1)*R.slotX,y:base.y+(index<3?-1:1)*R.slotY};
  const max=building.stages.length,rubble=PROP_KINDS['bude-truemmer'];
  const stages=[{stage:0,kind:'bude-truemmer',name:'Trümmer: '+building.name,x:slot.x,y:slot.y,
   w:Math.round(rubble.w*R.rubble),h:Math.round(rubble.h*R.rubble),height:rubble.height,blocking:false}];
  for(const s of building.stages){const f=.6+.4*s.stage/max;
   stages.push({stage:s.stage,kind:'bude-'+id,name:s.name,x:slot.x,y:slot.y,
    w:Math.round(def.w*f),h:Math.round(def.h*f),height:Math.round(def.height*f),blocking:false});}
  out[id]={owner:building.owner,slot,stages};
 }
 return out;
}
/** Die Bude: ehemalige Milchsammelstelle hinter St. Gangolf. Fläche frei von Wegen, Gebäuden und Bäumen,
 * mit begehbarem Anlaufpunkt am Wegenetz. Gezeichnet wird sie von der UI. */
export function placeBase(w){
 const R=PROP_RULES.base,random=rng((w.seed|0)^PROP_RULES.baseSalt),church=w.church,start=-Math.PI/2+(random()-.5)*.6;
 const tally={},no=r=>{tally[r]=(tally[r]||0)+1;};
 // Erst die Rückseite der Kirche (vom Kirchvorplatz abgewandt), dann erst der Rest des Umfelds.
 for(const behind of [true,false])for(let d=R.minDistance;d<=R.maxDistance;d+=R.step)for(let i=0;i<R.angles;i++){
  const angle=start+(i%2?1:-1)*Math.ceil(i/2)*(Math.PI*2/R.angles);
  if(behind!==(Math.cos(angle-start)>0))continue;
  const p={x:Math.round(church.x+Math.cos(angle)*d),y:Math.round(church.y+Math.sin(angle)*d),w:R.w,h:R.h};
  if(!plotFree(w,p,PROP_RULES.roadMargin)){no('belegt');continue;}
  if(distance(p,w.plaza)<w.plaza.radius+halfDiag(p)||distance(p,w.spawn)<halfDiag(p)+40){no('kirchvorplatz');continue;}
  if((w.hubs||[]).some(h=>h.id!=='kirchplatz'&&distance(p,h)<(h.reserve||120)+halfDiag(p))){no('treffpunkt');continue;}
  if(w.camps.some(c=>distance(c,p)<(c.reserve||150)+halfDiag(p))){no('lager');continue;}
  if(w.quests.some(q=>distance(q.giver,p)<60+halfDiag(p)||distance(q.target,p)<80+halfDiag(p))){no('quest');continue;}
  if(!nodeFree(w,p,PROP_RULES.nodeMargin.loose)){no('wegenetz');continue;}
  const approach=[{x:p.x,y:p.y+R.h/2+R.approach},{x:p.x,y:p.y-R.h/2-R.approach},{x:p.x+R.w/2+R.approach,y:p.y},{x:p.x-R.w/2-R.approach,y:p.y}]
   .find(a=>!w.blocked(a.x,a.y,9)&&w.walkClear(a,p,9)&&!!w.accessNode(a));
  if(!approach){no('anlaufpunkt');continue;}
  const base={id:'bude',name:'Die Bude',title:'Die Bude · Poo-Tang-Clan',
   text:'Ehemalige Milchsammelstelle hinter St. Gangolf, seit 2007 Vereinsheim ohne Verein. Seit der Nacht: Baustelle.',
   x:p.x,y:p.y,w:R.w,h:R.h,minX:p.x-R.w/2,maxX:p.x+R.w/2,minY:p.y-R.h/2,maxY:p.y+R.h/2,
   approach:{x:Math.round(approach.x),y:Math.round(approach.y)},distanceToChurch:Math.round(d)};
  base.clearedTrees=clearPlot(w,p);
  base.stageProps=stagePropsFor(base);w.base=base;return base;
 }
 throw new Error('Kein freier, erreichbarer Bauplatz für die Bude hinter St. Gangolf gefunden. Abgelehnt: '+JSON.stringify(tally));
}
