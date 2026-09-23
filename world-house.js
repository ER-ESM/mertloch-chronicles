// Begehbare Häuser auf der Dorfkarte (E-52): Grundriss aus content/ in Weltkoordinaten, Wände als Kollisionsboxen,
// Türöffnungen als Lücken. Gleiche Karte, gleiche Koordinaten – drinnen blendet nur die Zeichnung das Dach aus.
// Das Obergeschoss liegt über derselben Grundfläche; wer oben steht, bewegt sich in `upperWorld(house)`.
import {BUDE_HOUSE} from './content/index.js';
import {circleIntersectsBox} from './world-collision.js';
import {placeKitItems,resolveSprite} from './world-kit.js';

const at=(o,p)=>({x:o.x+p.x,y:o.y+p.y});
const box=(o,id,q,extra={})=>({id,minX:o.x+q.x,minY:o.y+q.y,maxX:o.x+q.x+q.w,maxY:o.y+q.y+q.h,x:o.x+q.x+q.w/2,y:o.y+q.y+q.h/2,...extra});

function buildFloor(def,f,o,prefix){
 const walls=f.walls.map((l,i)=>{const t=def.thickness[l.kind]/2,a=at(o,{x:l.x1,y:l.y1}),b=at(o,{x:l.x2,y:l.y2});
  // Stärke nur quer zur Wand: an den Enden steht nichts über, sonst würden die Türöffnungen schmaler als im Grundriss.
  const flat=a.y===b.y,px=flat?0:t,py=flat?t:0;
  // Sichtbare Front: waagerechte Innen- und Nordwände zeigen die volle Wandhöhe der Art, die südliche Außenwand nur den Sockel.
  const south=flat&&l.kind==='outer'&&l.y1===def.depth,style=def.wallStyle?.[l.kind],face=south?def.heights.front:flat?(style?resolveSprite(style).cut:def.heights.cut):0;
  return {id:prefix+'wall-'+i,kind:l.kind,style,face,outdoor:l.kind==='zaun',houseWall:true,minX:Math.min(a.x,b.x)-px,maxX:Math.max(a.x,b.x)+px,minY:Math.min(a.y,b.y)-py,maxY:Math.max(a.y,b.y)+py,x:(a.x+b.x)/2,y:(a.y+b.y)/2};});
 const rooms=f.rooms.map(r=>({id:r.id,name:r.name,belag:r.belag,tags:r.tags||[],outdoor:!!r.outdoor,rects:r.rects.map(q=>({x:o.x+q.x,y:o.y+q.y,w:q.w,h:q.h}))}));
 const doors=(f.doors||[]).map(d=>({id:d.id,name:d.name,s:d.s,...at(o,d),...(d.outside?{outside:at(o,d.outside)}:{})}));
 // Einrichtung aus dem Sprite-Baukasten; was nicht begehbar ist und steht, sperrt mit seiner Standfläche (Kollision).
 const items=placeKitItems(f.items,o,prefix);
 const fixtures=items.filter(it=>!it.walkable&&it.layer==='standing').map(it=>({id:it.id,name:it.name,height:it.height,minX:it.minX,maxX:it.maxX,minY:it.minY,maxY:it.maxY,x:it.x,y:it.y,houseWall:true,fixture:true}));
 const s=f.stairs,stairs=s?{...box(o,prefix+'stairs',s,{houseWall:true,stairs:true}),range:s.range,rise:s.rise,topStep:s.topStep,access:s.access,...(s.foot?{foot:at(o,s.foot)}:{}),...(s.arrive?{arrive:at(o,s.arrive)}:{}),...(s.landing?{landing:at(o,s.landing)}:{})}:null;
 // Wandschmuck hängt an seiner Wand (gezeichnet mit ihr), Tischdeko folgt ihrem Möbel in der Tiefensortierung.
 for(const it of items){if(it.def.surface==='wall-face'){const wall=walls.find(w=>w.maxX-w.minX>w.maxY-w.minY&&Math.abs(w.maxY-it.y)<=2&&it.minX>=w.minX-.01&&it.maxX<=w.maxX+.01);if(wall){(wall.decor||=[]).push(it);it.wall=wall.id;}}
  else if(it.def.surface==='top'){const host=items.find(o=>o!==it&&o.def.top&&it.x>=o.minX&&it.x<=o.maxX&&it.y>=o.minY&&it.y<=o.maxY);it.sortY=(host?host.maxY:it.maxY)+.01;it.lift=host?.height||0;}
  it.outdoor=!!rooms.find(r=>r.outdoor&&r.rects.some(q=>it.x>=q.x&&it.x<q.x+q.w&&it.y>=q.y&&it.y<q.y+q.h));}
 return {walls,rooms,doors,items,fixtures,stairs,cut:def.heights.cut};
}

/** Haus aus dem Inhaltsgrundriss an der Nordwest-Ecke `origin` (ganze Welteinheiten, deterministisch). */
export function buildHouse(def,origin){
 const o={x:Math.round(origin.x),y:Math.round(origin.y)},ground=buildFloor(def,def,o,def.id+'-');
 const spots=Object.fromEntries(Object.entries(def.spots||{}).map(([k,p])=>[k,at(o,p)]));
 return {id:def.id,origin:o,minX:o.x,minY:o.y,maxX:o.x+def.width,maxY:o.y+def.depth,width:def.width,depth:def.depth,heights:{...def.heights},
  ...ground,spots,...(def.upper?{upper:buildFloor(def,def.upper,o,def.id+'-og-')}:{})};
}

/** Die Bude: Haus links, Hof rechts; `plot` ist das ganze Grundstück (Haus + Hof), wie placeBase es sucht. */
export function budeHouse(plot){return buildHouse(BUDE_HOUSE,{x:plot.minX,y:plot.minY});}
export const budePlotSize=()=>({w:BUDE_HOUSE.width+BUDE_HOUSE.yard.width,h:BUDE_HOUSE.depth});
/** Lokaler Punkt des Inhaltsgrundrisses (Bauplatz, Stellplatz) in Weltkoordinaten. */
export const houseLocal=(house,p)=>at(house.origin,p);

/** Steht der Punkt unter dem Dach (Grundfläche des Hauses, ohne Hof)? */
export function insideHouse(house,x,y){return !!house&&x>house.minX&&x<house.maxX&&y>house.minY&&y<house.maxY;}
/** Raum an einem Punkt oder null; `floor` 1 fragt das Obergeschoss. */
export function roomAt(house,x,y,floor=0){
 const f=floor&&house?.upper?house.upper:house;if(!f)return null;
 return f.rooms.find(r=>r.rects.some(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h))||null;
}
/** Wände, Einbauten und Treppe des Erdgeschosses ins Kollisionsraster; `w.fixedColliders` überlebt ein späteres clearPlot. */
export function addHouseColliders(w,house){
 w.fixedColliders=(w.fixedColliders||[]).filter(o=>!o.houseWall||!o.id.startsWith(house.id+'-'));
 for(const o of [...house.walls,...house.fixtures,...(house.stairs?[house.stairs]:[])]){w.fixedColliders.push(o);w.addGrid(o);}
}

/** Das Obergeschoss als eigene kleine Welt: nur die Grundfläche des Hauses, eigene Wände, Einbauten, Treppenloch.
 *  Gleiche Schnittstelle wie die Dorfwelt für Bewegung und Wege (blocked, walkClear, lineClear, findPath, findClear). */
const upperCache=new WeakMap();
export function upperWorld(house){
 if(!house?.upper)return null;if(upperCache.has(house))return upperCache.get(house);
 const f=house.upper,solid=[...f.walls,...f.fixtures,...(f.stairs?[f.stairs]:[])],edge=4;
 const blocked=(x,y,r=6)=>x<house.minX+edge+r||x>house.maxX-edge-r||y<house.minY+edge+r||y>house.maxY-edge-r||solid.some(b=>circleIntersectsBox(x,y,r,b));
 const walkClear=(a,b,r=6)=>{const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/4));for(let i=0;i<=n;i++){const t=i/n;if(blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,r))return false;}return true;};
 const lineClear=(a,b)=>walkClear(a,b,1);
 const findClear=(x,y,r=6)=>{if(!blocked(x,y,r))return {x,y};for(let d=4;d<=60;d+=4)for(let k=0;k<16;k++){const a=k*Math.PI/8,p={x:x+Math.cos(a)*d,y:y+Math.sin(a)*d};if(!blocked(p.x,p.y,r))return p;}return {x,y};};
 // Breitensuche auf einem 6-E-Raster innerhalb der Grundfläche, danach Wegpunkte vereinfachen.
 const findPath=(from,to)=>{const step=6,goal=findClear(to.x,to.y,6);if(walkClear(from,goal,6))return [goal];
  const key=p=>Math.round((p.x-house.minX)/step)+','+Math.round((p.y-house.minY)/step),cell=k=>{const [i,j]=k.split(',').map(Number);return {x:house.minX+i*step,y:house.minY+j*step};};
  const start=key(from),target=key(goal),prev=new Map([[start,null]]),queue=[start];
  while(queue.length){const k=queue.shift();if(k===target)break;const c=cell(k);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const n={x:c.x+dx*step,y:c.y+dy*step},nk=key(n);if(prev.has(nk)||blocked(n.x,n.y,6)||!walkClear(c,n,5))continue;prev.set(nk,k);queue.push(nk);}}
  if(!prev.has(target))return [];const out=[];for(let k=target;k&&k!==start;k=prev.get(k))out.unshift(cell(k));out.push(goal);
  const simple=[];let anchor=from;for(let i=0;i<out.length;i++){if(i===out.length-1||!walkClear(anchor,out[i+1],6)){simple.push(out[i]);anchor=out[i];}}return simple;};
 const w={upper:true,house,blocked,walkClear,lineClear,findClear,findPath,width:house.maxX,height:house.maxY};upperCache.set(house,w);return w;
}
