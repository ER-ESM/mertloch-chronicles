// Begehbare Häuser auf der Dorfkarte (E-52): Grundriss aus content/ in Weltkoordinaten, Wände als Kollisionsboxen,
// Türöffnungen als Lücken. Gleiche Karte, gleiche Koordinaten – drinnen blendet nur die Zeichnung das Dach aus.
import {BUDE_HOUSE} from './content/index.js';

const at=(o,p)=>({x:o.x+p.x,y:o.y+p.y});

/** Haus aus dem Inhaltsgrundriss an der Nordwest-Ecke `origin` (ganze Welteinheiten, deterministisch). */
export function buildHouse(def,origin){
 const o={x:Math.round(origin.x),y:Math.round(origin.y)};
 const walls=def.walls.map((l,i)=>{const t=def.thickness[l.kind]/2,a=at(o,{x:l.x1,y:l.y1}),b=at(o,{x:l.x2,y:l.y2});
  // Stärke nur quer zur Wand: an den Enden steht nichts über, sonst würden die Türöffnungen schmaler als im Grundriss.
  const flat=a.y===b.y,px=flat?0:t,py=flat?t:0;
  return {id:def.id+'-wall-'+i,kind:l.kind,houseWall:true,minX:Math.min(a.x,b.x)-px,maxX:Math.max(a.x,b.x)+px,minY:Math.min(a.y,b.y)-py,maxY:Math.max(a.y,b.y)+py,x:(a.x+b.x)/2,y:(a.y+b.y)/2};});
 const rooms=def.rooms.map(r=>({id:r.id,name:r.name,floor:r.floor,outdoor:!!r.outdoor,rects:r.rects.map(q=>({x:o.x+q.x,y:o.y+q.y,w:q.w,h:q.h}))}));
 const doors=def.doors.map(d=>({id:d.id,name:d.name,...at(o,d),...(d.outside?{outside:at(o,d.outside)}:{})}));
 const spots=Object.fromEntries(Object.entries(def.spots||{}).map(([k,p])=>[k,at(o,p)]));
 return {id:def.id,origin:o,minX:o.x,minY:o.y,maxX:o.x+def.width,maxY:o.y+def.depth,width:def.width,depth:def.depth,heights:{...def.heights},walls,rooms,doors,spots};
}

/** Die Bude: Haus links, Hof rechts; `plot` ist das ganze Grundstück (Haus + Hof), wie placeBase es sucht. */
export function budeHouse(plot){return buildHouse(BUDE_HOUSE,{x:plot.minX,y:plot.minY});}
export const budePlotSize=()=>({w:BUDE_HOUSE.width+BUDE_HOUSE.yard.width,h:BUDE_HOUSE.depth});
/** Lokaler Punkt des Inhaltsgrundrisses (Bauplatz, Stellplatz) in Weltkoordinaten. */
export const houseLocal=(house,p)=>at(house.origin,p);

/** Steht der Punkt unter dem Dach (Grundfläche des Hauses, ohne Hof)? */
export function insideHouse(house,x,y){return !!house&&x>house.minX&&x<house.maxX&&y>house.minY&&y<house.maxY;}
/** Raum an einem Punkt oder null (drinnen zwischen zwei Räumen, etwa in einer Wand). */
export function roomAt(house,x,y){
 if(!house)return null;
 return house.rooms.find(r=>r.rects.some(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h))||null;
}
/** Wände ins Kollisionsraster; `w.fixedColliders` überlebt ein späteres clearPlot (Kiosk). */
export function addHouseColliders(w,house){
 w.fixedColliders=(w.fixedColliders||[]).filter(o=>!o.houseWall||!o.id.startsWith(house.id+'-'));
 for(const wall of house.walls){w.fixedColliders.push(wall);w.addGrid(wall);}
}
