// Regel-Engine des Sprite-Baukastens (E-54): Vererbung der Sprite-Arten, Platzierung in Weltkoordinaten, Prüfung
// aller Regeln aus content/sprite-kit.js. Rein logisch – gezeichnet wird in kit-art.js, Kollision baut world-house.js.
import {KIT_CLASSES,KIT_SPRITES} from './content/index.js';

const resolved=new Map();
/** Vollständige Eigenschaften einer Sprite-Art oder Klasse: Kette über `is` bis `sprite`, spätere Felder gewinnen. */
export function resolveSprite(id){
 if(resolved.has(id))return resolved.get(id);
 const own=KIT_SPRITES[id]||KIT_CLASSES[id];if(!own)throw Error('Unbekannte Sprite-Art: '+id);
 const chain=[];for(let k=id,guard=0;k&&guard<12;guard++){const d=KIT_SPRITES[k]||KIT_CLASSES[k];if(!d)throw Error('Unbekannte Klasse '+k+' in der Kette von '+id);chain.unshift(d);k=d.is;}
 const classes=[];for(let k=own.is;k;k=(KIT_CLASSES[k]||{}).is)classes.push(k);
 const out=Object.assign({},...chain,{id,classes,is:own.is});delete out.is;out.is=own.is;
 resolved.set(id,Object.freeze(out));return out;
}
/** Gehört die Art (direkt oder über Vorfahren) zur Klasse? */
export const kitIs=(def,cls)=>def.id===cls||def.classes.includes(cls);

/** Platzierte Teile eines Geschosses in Weltkoordinaten: Standfläche als Box, Ebene, Sperrwirkung aus der Art. */
export function placeKitItems(items,origin,prefix){
 return (items||[]).map((it,i)=>{const d=resolveSprite(it.s),w=it.w??d.w,h=it.h??d.h,x=origin.x+it.x,y=origin.y+it.y;
  return {id:prefix+it.s+'-'+i,sprite:it.s,def:d,name:d.name,x,y,w,h,height:it.height??d.height,layer:d.layer,walkable:d.walkable,
   minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,...(it.flip?{flip:true}:{})};});
}

const overlaps=(a,b,pad=0)=>a.minX<b.maxX+pad&&a.maxX>b.minX-pad&&a.minY<b.maxY+pad&&a.maxY>b.minY-pad;
const inside=(a,q)=>a.minX>=q.x-.01&&a.maxX<=q.x+q.w+.01&&a.minY>=q.y-.01&&a.maxY<=q.y+q.h+.01;
const roomOfBox=(rooms,b)=>rooms.find(r=>r.rects.some(q=>b.x>=q.x&&b.x<q.x+q.w&&b.y>=q.y&&b.y<q.y+q.h))||null;

/** Alle Regeln für ein Geschoss prüfen. `floor`: {walls, rooms, doors, items} in Weltkoordinaten (world-house.js).
 *  Liefert Verstöße als Klartext (leer = regelkonform). */
export function validateKitFloor(floor){
 const problems=[],say=(rule,it,text)=>problems.push(rule+': '+(it?.name||it?.id||'')+' – '+text);
 const walls=floor.walls,rooms=floor.rooms,doors=floor.doors||[];
 // Belag je Raum
 for(const room of rooms){const d=room.belag&&resolveSprite(room.belag);
  if(!d||!kitIs(d,'belag')){say('belag',room,'Raum ohne gültigen Bodenbelag');continue;}
  if(!!d.outdoor!==!!room.outdoor)say('belag',room,room.outdoor?'drinnen-Belag im Außenraum':'Außen-Belag unter dem Dach');}
 // Türzonen: vor und hinter jeder Tür bleibt ein Durchgang frei.
 const doorZones=doors.map(dr=>{const flat=walls.some(w=>Math.abs((w.minY+w.maxY)/2-dr.y)<1&&w.maxY-w.minY<12),c=20;
  return flat?{minX:dr.x-17,maxX:dr.x+17,minY:dr.y-c,maxY:dr.y+c,door:dr}:{minX:dr.x-c,maxX:dr.x+c,minY:dr.y-17,maxY:dr.y+17,door:dr};});
 const placed=floor.items||[],blocking=[];
 for(const it of placed){const d=it.def;
  if(d.surface==='wall-face'){
   // Sichtbare Front: waagerechte Wand, deren Südkante am Aufhängepunkt liegt, und der Raum darunter.
   const wall=walls.find(w=>w.maxX-w.minX>w.maxY-w.minY&&Math.abs(w.maxY-it.y)<=2&&it.minX>=w.minX-.01&&it.maxX<=w.maxX+.01);
   if(!wall)say('wandschmuck',it,'hängt nicht an einer sichtbaren Wandfront (waagerechte Wand, Raum südlich davon)');
   const face=wall?.face??floor.cut??22;if((d.mount||0)+(it.height||0)>face)say('wandschmuck',it,'ragt über die Wandfront ('+((d.mount||0)+(it.height||0))+' > '+face+' E)');
   const room=roomOfBox(rooms,{x:it.x,y:it.y+8});if(!room)say('wandschmuck',it,'keine Wandfront zu einem Raum');
   else{if(d.outdoor&&!room.outdoor)say('draussen',it,'Außenteil drinnen');}
   for(const o of placed)if(o!==it&&o.def.surface==='wall-face'&&overlaps(o,it)&&placed.indexOf(o)<placed.indexOf(it))say('wandschmuck',it,'überlappt '+o.name);
   continue;}
  if(d.surface==='top'){const host=placed.find(o=>o!==it&&o.def.top&&inside(it,{x:o.minX,y:o.minY,w:o.w,h:o.h}));
   if(!host)say('ablage',it,'steht nicht auf einem Möbel mit Ablage');continue;}
  if(d.surface==='floor'){
   const room=roomOfBox(rooms,it);
   if(!room){say('boden',it,'steht außerhalb jedes Raums');continue;}
   if(!room.rects.some(q=>inside(it,q))&&!rooms.some(r=>r.rects.some(q=>inside(it,q))))say('boden',it,'ragt aus dem Raum '+room.name);
   if(walls.some(w=>overlaps(it,w)))say('boden',it,'steht in einer Wand');
   if(d.outdoor&&!room.outdoor)say('draussen',it,'Außenteil unter dem Dach ('+room.name+')');
   if(d.indoor&&room.outdoor)say('draussen',it,'Innenmöbel im Außenraum');
   for(const n of d.needs||[])if(!(room.tags||[]).includes(n))say('merkmale',it,'braucht einen Raum mit „'+n+'“, steht in '+room.name);
   if(!d.walkable){
    if(d.keepDoors)for(const z of doorZones)if(overlaps(it,z))say('tueren',it,'versperrt den Durchgang an '+(z.door.name||z.door.id));
    for(const o of blocking)if(overlaps(it,o))say('sperrt',it,'überlappt '+o.name);
    blocking.push(it);}
  }
 }
 return problems;
}
