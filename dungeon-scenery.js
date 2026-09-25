// Räume des Dungeons als Orte (Darstellung, docs/DUNGEON-RAEUME-2026-09-25.md): Raster der Ebene mit Boden, Wandfronten und
// Mauerkronen, Requisiten aus dem Sprite-Baukasten, Lichtpunkte der Leuchten und der Garagen-Bauplatz draußen.
// Reine Logik ohne DOM – gezeichnet wird in dungeon-scenery-art.js. Kollision und Wege bleiben unverändert bei dungeon.js:
// Wände liegen nur in den Lücken zwischen den Räumen, Requisiten sperren nichts.
//
// Wandregel (wie der Baukasten E-54, angepasst an die Lücken der Dungeon-Karte):
//  - Nordkante eines Raums: Wandfront nach oben in die Lücke, höchstens 22 E; ist die Lücke zum nächsten Raum schmaler, nur so
//    hoch, dass die Mauerkrone (4 E) noch darüber passt – so deckt keine Front begehbaren Boden ab (geschnittene Innenwand).
//  - Seiten- und Südkanten zeigen nur die Mauerkrone; alles Übrige ist die Masse der Ebene (Mauerwerk, Erdreich, Basalt).
//  - Verborgene Räume (secret, noch nicht betreten) gehören zur Masse: gleiche Pixel wie gar kein Raum.
import {DUNGEONS,DUNGEON_SCENERY,DUNGEON_SCENERY_RULES as RULES,DUNGEON_SCALE as U} from './content/index.js';
import {resolveSprite} from './world-kit.js';
import {rectWorld,toWorld,dungeonRun,dungeonWorld,entranceFor,speakerPoint,floorAt} from './dungeon.js';

/** Rasterweite (E), Wandfront und Krone (E, aus den Inhaltsdaten), Rand der Ebenen-Leinwand um die Ebene (E). */
export const CELL=2,FACE=RULES.face,CROWN=RULES.crown,MARGIN=112;
const idOf=new WeakMap();
/** Ausstattung eines Dungeons (content/dungeon-scenery.js) zur Definition. */
export function sceneryOf(def){let id=idOf.get(def);if(id===undefined){id=Object.keys(DUNGEONS).find(k=>DUNGEONS[k]===def)||Object.keys(DUNGEONS).find(k=>DUNGEONS[k].name===def.name)||null;idOf.set(def,id);}return id&&DUNGEON_SCENERY[id]||null;}
/** Verborgene Räume einer Ebene (Schlüssel für Zwischenspeicher). */
export const hiddenRooms=(run,floor)=>run.def.rooms.filter(r=>r.floor===floor&&r.secret&&!run.visited.has(r.id)).map(r=>r.id);

// ── Raster ─────────────────────────────────────────────────────────────────────────────────────────────────────
const plans=new Map();
/** Raster einer Ebene: begehbar (Räume + Türen), Wandfronten, Mauerkronen, Kanten. `hidden` = Ids verborgener Räume. */
export function floorPlan(def,floor,hidden=[]){
 const key=floor+'|'+[...hidden].sort().join(','),cache=plans.get(def)||new Map();plans.set(def,cache);if(cache.has(key))return cache.get(key);
 const sc=sceneryOf(def)||{rooms:{}},o=def.floors[floor].origin,hid=new Set(hidden);
 // Ausdehnung: die Ebene (size) plus Rand – unabhängig davon, welche Räume gerade sichtbar sind
 const size=def.floors[floor].size,bx0=o.x-MARGIN,by0=o.y-MARGIN,bx1=o.x+size[0]*U+MARGIN,by1=o.y+size[1]*U+MARGIN;
 const cols=Math.round((bx1-bx0)/CELL),rows=Math.round((by1-by0)/CELL),n=cols*rows;
 const rooms=def.rooms.filter(r=>r.floor===floor&&!hid.has(r.id)),doors=def.doors.filter(d=>d.floor===floor);
 const walk=new Uint8Array(n),roomOf=new Int16Array(n).fill(-1),faceH=new Uint8Array(n),crown=new Uint8Array(n);
 const cells=r=>({i0:Math.max(0,Math.round((r.x-bx0)/CELL)),i1:Math.min(cols,Math.round((r.x+r.w-bx0)/CELL)),j0:Math.max(0,Math.round((r.y-by0)/CELL)),j1:Math.min(rows,Math.round((r.y+r.h-by0)/CELL))});
 const rects=[];
 rooms.forEach((room,k)=>{for(const q of room.rects){const r=rectWorld(def,floor,q);rects.push({room:room.id,...r});const c=cells(r);for(let j=c.j0;j<c.j1;j++)for(let i=c.i0;i<c.i1;i++){walk[j*cols+i]=1;roomOf[j*cols+i]=k;}}});
 const doorRects=doors.map(d=>{const r=rectWorld(def,floor,d.rect),c=cells(r);
  // Belag der Türfläche: Raum mit der größten Überdeckung (bei Gleichstand der südliche)
  let best=-1,area=-1;rooms.forEach((room,k)=>{for(const q of room.rects){const b=rectWorld(def,floor,q),ov=Math.max(0,Math.min(r.x+r.w,b.x+b.w)-Math.max(r.x,b.x))*Math.max(0,Math.min(r.y+r.h,b.y+b.h)-Math.max(r.y,b.y));if(ov>area||ov===area&&b.y>rectWorld(def,floor,rooms[best]?.rects[0]||q).y){area=ov;best=k;}}});
  for(let j=c.j0;j<c.j1;j++)for(let i=c.i0;i<c.i1;i++){const x=j*cols+i;walk[x]=1;if(roomOf[x]<0)roomOf[x]=best;}
  return {id:d.id,door:d,room:best>=0?rooms[best].id:null,...r};});
 // Nordkanten: Wandfront nach oben, begrenzt durch die Lücke zum nächsten begehbaren Feld darüber
 const edges=[];
 for(let i=0;i<cols;i++)for(let j=1;j<rows;j++){const x=j*cols+i;if(!walk[x]||walk[x-cols])continue;
  let k=j-1;while(k>=0&&!walk[k*cols+i])k--;const R=k<0?Infinity:(j-1-k)*CELL,room=rooms[roomOf[x]],max=sc.rooms[room?.id]?.face??FACE;
  const F=Math.max(0,Math.min(max,Math.floor((R-CROWN)/CELL)*CELL));for(let c=1;c<=F/CELL;c++)faceH[(j-c)*cols+i]=F;
  edges.push({i,j,F,room:room?.id||null});}
 // Front-Abschnitte: zusammenhängende Spalten mit gleicher Kante, Höhe und Raum
 edges.sort((a,b)=>a.j-b.j||a.i-b.i);const segments=[];
 for(const e of edges){const last=segments.at(-1);if(last&&last.j===e.j&&last.i1===e.i&&last.F===e.F&&last.room===e.room){last.i1++;last.x1+=CELL;continue;}
  segments.push({j:e.j,i0:e.i,i1:e.i+1,F:e.F,room:e.room,x0:bx0+e.i*CELL,x1:bx0+(e.i+1)*CELL,base:by0+e.j*CELL});}
 // Mauerkrone: Ring von CROWN um alles Begehbare und alle Fronten
 const D=CROWN/CELL,solid=x=>walk[x]||faceH[x];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=j*cols+i;if(solid(x))continue;let near=false;
  for(let dj=-D;dj<=D&&!near;dj++)for(let di=-D;di<=D;di++){const jj=j+dj,ii=i+di;if(jj<0||ii<0||jj>=rows||ii>=cols)continue;if(solid(jj*cols+ii)){near=true;break;}}if(near)crown[x]=1;}
 // Kanten für Schatten am Wandfuß: Süd, West, Ost (Nord = Front-Abschnitte)
 const runs=(test,vertical)=>{const out=[];if(!vertical){for(let j=0;j<rows;j++){let s=-1;for(let i=0;i<=cols;i++){const on=i<cols&&test(i,j);if(on&&s<0)s=i;if(!on&&s>=0){out.push({x0:bx0+s*CELL,x1:bx0+i*CELL,y:by0+j*CELL});s=-1;}}}}
  else for(let i=0;i<cols;i++){let s=-1;for(let j=0;j<=rows;j++){const on=j<rows&&test(i,j);if(on&&s<0)s=j;if(!on&&s>=0){out.push({y0:by0+s*CELL,y1:by0+j*CELL,x:bx0+i*CELL});s=-1;}}}return out;};
 const W=(i,j)=>i>=0&&j>=0&&i<cols&&j<rows&&walk[j*cols+i];
 const south=runs((i,j)=>W(i,j)&&!W(i,j+1),false).map(r=>({...r,y:r.y+CELL})),west=runs((i,j)=>W(i,j)&&!W(i-1,j),true),east=runs((i,j)=>W(i,j)&&!W(i+1,j),true).map(r=>({...r,x:r.x+CELL}));
 const plan={def,floor,key,bx0,by0,bx1,by1,cols,rows,walk,roomOf,faceH,crown,rooms,rects,doors:doorRects,segments,edges:{south,west,east},hidden:[...hid]};
 plan.items=placeItems(def,floor,plan,sc);
 cache.set(key,plan);return plan;
}
/** Zellart an einer Weltstelle: walk · face · crown · mass (Prüfskript, Tests). */
export function cellAt(plan,x,y){const i=Math.floor((x-plan.bx0)/CELL),j=Math.floor((y-plan.by0)/CELL);if(i<0||j<0||i>=plan.cols||j>=plan.rows)return 'mass';const k=j*plan.cols+i;return plan.walk[k]?'walk':plan.faceH[k]?'face':plan.crown[k]?'crown':'mass';}

// ── Requisiten ─────────────────────────────────────────────────────────────────────────────────────────────────
/** Requisiten einer Ebene in Weltkoordinaten: stehend (tiefensortiert), Bodendeko, Tischdeko (auf ihrer Ablage), Wandschmuck (an der Front). */
function placeItems(def,floor,plan,sc){
 const out={standing:[],decals:[],decor:[],tops:[],problems:[]},o=def.floors[floor].origin;
 for(const room of plan.rooms){const cfg=sc.rooms[room.id];if(!cfg)continue;
  (cfg.props||[]).forEach(([s,mx,my],k)=>{const d=resolveSprite(s),p=toWorld(def,floor,mx,my),w=d.w,h=d.h;
   const it={id:room.id+'-'+s+'-'+k,sprite:s,def:d,name:d.name,room:room.id,x:p.x,y:p.y,w,h,height:d.height,layer:d.layer,minX:p.x-w/2,maxX:p.x+w/2,minY:p.y-h/2,maxY:p.y+h/2,m:[mx,my]};
   if(d.layer==='decal')out.decals.push(it);else if(d.surface==='top')out.tops.push(it);else out.standing.push(it);});
  (cfg.decor||[]).forEach(([s,mx],k)=>{const d=resolveSprite(s),x=o.x+mx*U,w=d.w;
   const seg=plan.segments.filter(g=>g.room===room.id&&g.x0<=x-w/2+.01&&g.x1>=x+w/2-.01).sort((a,b)=>a.base-b.base)[0];
   if(!seg){out.problems.push(room.id+': '+s+' bei x '+mx+' hängt an keiner Nordwand');return;}
   if((d.mount||0)+d.height>seg.F){out.problems.push(room.id+': '+s+' bei x '+mx+' passt nicht auf die Front ('+((d.mount||0)+d.height)+' > '+seg.F+' E)');return;}
   const z0=seg.base-(d.mount||0)-d.height,z1=seg.base-(d.mount||0),clash=out.decor.find(o=>o.wall.maxY===seg.base&&o.minX<x+w/2&&o.maxX>x-w/2&&o.z0<z1&&o.z1>z0);
   if(clash){out.problems.push(room.id+': '+s+' bei x '+mx+' überlappt '+clash.sprite);return;}
   out.decor.push({z0,z1,id:room.id+'-'+s+'-w'+k,sprite:s,def:d,name:d.name,room:room.id,x,y:seg.base,w,h:2,height:d.height,minX:x-w/2,maxX:x+w/2,minY:seg.base-1,maxY:seg.base+1,wall:{maxY:seg.base,face:seg.F},m:[mx]});});}
 // Tischdeko folgt ihrer Ablage in der Tiefensortierung und steht auf ihrer Höhe.
 for(const it of out.tops){const host=out.standing.find(q=>q.def.top&&it.x>=q.minX&&it.x<=q.maxX&&it.y>=q.minY&&it.y<=q.maxY);
  if(!host){out.problems.push(it.room+': '+it.sprite+' steht auf keiner Ablage');continue;}it.lift=host.height;it.sortY=host.maxY+.01;it.host=host.id;}
 return out;
}

// ── Licht ──────────────────────────────────────────────────────────────────────────────────────────────────────
/** Lichtpunkte der Leuchten (Neonröhren, Fackeln, Ringlicht, Musikbox) und der Lichterketten einer Ebene – für das Kellerlicht
 *  (dungeon-art.js drawDungeonLight). Räume ohne eigene Leuchte bekommen ein schwaches Grundlicht in der Mitte. */
export function sceneryLights(def,floor,plan){
 if(plan.lights)return plan.lights;const out=[],sc=sceneryOf(def)||{rooms:{}},o=def.floors[floor].origin;
 for(const it of plan.items.decor)if(it.def.light)out.push({x:it.x,y:it.y+(it.sprite==='neonroehre'?10:8),wide:it.sprite==='neonroehre'?2:1,kind:it.sprite,seed:it.x*.37});
 for(const it of [...plan.items.standing,...plan.items.tops])if(it.def.light)out.push({x:it.x,y:it.y-2,wide:1,kind:it.sprite,seed:it.x*.53,small:true});
 for(const room of plan.rooms){for(const [x1,y1,x2,y2] of sc.rooms[room.id]?.garlands||[]){const a={x:o.x+x1*U,y:o.y+y1*U},b={x:o.x+x2*U,y:o.y+y2*U},n=Math.max(2,Math.round(Math.hypot(b.x-a.x,b.y-a.y)/46));
   for(let i=0;i<=n;i++)out.push({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n,kind:'bulb',seed:i*7.1+a.y});}
  // Grundlicht: Räume ohne eigene Leuchte und große Hallen (über 300 m²) bekommen ein schwaches, weites Licht in der Mitte
  const lit=out.some(s=>room.rects.some(q=>{const r=rectWorld(def,floor,q);return s.x>=r.x-8&&s.x<=r.x+r.w+8&&s.y>=r.y-24&&s.y<=r.y+r.h+8;}));
  for(const q of room.rects)if(!lit||q[2]*q[3]>300){const r=rectWorld(def,floor,q);out.push({x:r.x+r.w/2,y:r.y+r.h/2,kind:'fill',seed:r.x});}}
 plan.lights=out;return out;
}

// ── Garage draußen (Eingang, Zielbild C) ───────────────────────────────────────────────────────────────────────
/** Standfläche der Doppelgarage zum Eingangspunkt: das rechte, halb offene Tor liegt am Eingang, die Front auf seiner Linie. */
export function garageLot(door,id='schloss-bigb'){if(!door)return null;const G=DUNGEON_SCENERY[id]?.garage;if(!G)return null;const d=resolveSprite(G.sprite),x=door.x+G.dx,maxY=door.y;
 return {sprite:G.sprite,def:d,x,y:maxY-d.h/2,w:d.w,h:d.h,height:d.height,minX:x-d.w/2,maxX:x+d.w/2,minY:maxY-d.h,maxY,top:maxY-d.h*.7-d.height-8};}
const cleared=new WeakSet();
/** Bäume, deren Krone vor der Garage läge, fallen weg (Welt einmal nach dem Bau, wie der Bauplatz der Bude); ihre Kollision mit.
 *  Wege werden dadurch nur freier. Liefert die Zahl der entfernten Bäume. */
export function clearDungeonLot(world,id='schloss-bigb'){
 if(!world||cleared.has(world)||!DUNGEON_SCENERY[id]?.garage?.clearTrees)return 0;cleared.add(world);
 const lot=garageLot(entranceFor(world,id),id);if(!lot||!world.trees)return 0;
 const hits=world.trees.filter(t=>crownOver(t,lot));if(!hits.length)return 0;
 world.trees=world.trees.filter(t=>!hits.includes(t));
 for(const list of world.grid?.values?.()||[])for(let i=list.length-1;i>=0;i--){const o=list[i];if(!o.id&&!o.propId&&hits.some(t=>o.x===t.x&&o.y===t.y&&o.radius===4*t.size))list.splice(i,1);}
 return hits.length;
}
/** Liegt die Krone des Baums (wie renderer.js sie zeichnet) vor der Garage? Bäume dahinter verdeckt die Garage selbst. */
export function crownOver(t,lot){const s=t.size||1;return t.y>=lot.maxY-2&&t.x+44*s>lot.minX&&t.x-44*s<lot.maxX&&t.y-96*s<lot.maxY&&t.y+14*s>lot.top;}

// ── Prüfung (scripts/dungeon-raeume-check.mjs, tests/dungeon-raeume.test.mjs) ─────────────────────────────────────
const segDist=(p,a,b)=>{const ex=b.x-a.x,ey=b.y-a.y,l=ex*ex+ey*ey||1,t=Math.max(0,Math.min(1,((p.x-a.x)*ex+(p.y-a.y)*ey)/l));return Math.hypot(p.x-a.x-ex*t,p.y-a.y-ey*t);};
const boxDist=(b,p)=>Math.hypot(Math.max(b.minX-p.x,0,p.x-b.maxX),Math.max(b.minY-p.y,0,p.y-b.maxY));
const boxSeg=(b,a,c)=>{if(boxDist(b,a)===0||boxDist(b,c)===0)return 0;const n=Math.max(2,Math.ceil(Math.hypot(c.x-a.x,c.y-a.y)/2));let m=Infinity;for(let i=0;i<=n;i++)m=Math.min(m,boxDist(b,{x:a.x+(c.x-a.x)*i/n,y:a.y+(c.y-a.y)*i/n}));return m;};
/** Alle Räume, Türen und Übergänge per Wegsuche erreichbar (alle Türen offen gedacht); Requisiten frei von Laufwegen, Türen, Übergängen,
 *  Kontrollpunkten, Packs, Bossen, Arenenmitte, Streifen und Freiräumen. `g` optional (sonst eigener Durchgang ohne Spielstand). */
export function auditScenery(g,id='schloss-bigb'){
 const def=DUNGEONS[id],sc=DUNGEON_SCENERY[id],run={id,def,version:0,seals:new Set(def.doors.flatMap(d=>d.lock?.seals||[])),killed:new Set(def.bosses.map(b=>b.id)),arena:null,walkCache:{}};
 const world=dungeonWorld(g?.instance?.outside?.world||{},run),unreachable=[],problems=[],paths=[],summary={props:{},kinds:{},total:0,paths:0};
 for(const floor of Object.keys(def.floors)){const plan=floorPlan(def,floor,[]),W=(x,y)=>toWorld(def,floor,x,y);
  problems.push(...plan.items.problems);
  // Wege: vom Kontrollpunkt bzw. ersten Übergang der Ebene zu jedem Raum, jeder Tür und jedem Übergang
  // Einstiege der Ebene: Kontrollpunkt und alle Übergänge (der Wehrgang etwa hängt nur an der Leiter)
  const hubs=[...def.rooms.filter(r=>r.floor===floor&&r.checkpoint).map(r=>W(r.checkpoint.x,r.checkpoint.y)),...def.transitions.flatMap(t=>[t.a,t.b]).filter(s=>s.floor===floor).map(s=>{const p=W(s.x,s.y);return world.findClear(p.x,p.y,7);})];
  const targets=[...plan.rooms.map(r=>{const q=r.rects.reduce((a,b)=>a[2]*a[3]>=b[2]*b[3]?a:b);return {name:r.id,p:W(q[0]+q[2]/2,q[1]+q[3]/2)};}),
   ...def.doors.filter(d=>d.floor===floor).map(d=>({name:'tür '+d.id,p:W(d.rect[0]+d.rect[2]/2,d.rect[1]+d.rect[3]/2)})),
   ...def.transitions.flatMap(t=>['a','b'].filter(s=>t[s].floor===floor).map(s=>({name:'übergang '+t.id+'.'+s,p:W(t[s].x,t[s].y)})))];
  for(const tg of targets){const to=world.findClear(tg.p.x,tg.p.y,7);let found=null;for(const hub of hubs){const path=world.findPath(hub,to);if(path.length){found=[hub,...path];break;}}
   if(!found){unreachable.push(floor+': '+tg.name);continue;}paths.push({floor,pts:found});summary.paths++;}
  // Freihalten
  const pts=[...def.transitions.flatMap(t=>['a','b'].filter(s=>t[s].floor===floor).map(s=>({what:'Übergang '+t.id,p:W(t[s].x,t[s].y),r:20})))
   ,...def.rooms.filter(r=>r.floor===floor&&r.checkpoint).map(r=>({what:'Kontrollpunkt',p:W(r.checkpoint.x,r.checkpoint.y),r:18}))
   ,...(def.start.floor===floor?[{what:'Start',p:W(def.start.x,def.start.y),r:18},{what:'Ausgang',p:W(def.exit.x,def.exit.y),r:22}]:[])
   ,...def.secrets.filter(s=>s.floor===floor).map(s=>({what:'Geheimnis '+s.id,p:W(s.x,s.y),r:22}))
   ,...def.packs.filter(p=>def.rooms.find(r=>r.id===p.room).floor===floor).map(p=>({what:'Pack '+p.id,p:W(...p.at),r:p.members.length>4?40:24}))
   ,...def.bosses.filter(b=>def.rooms.find(r=>r.id===b.room).floor===floor).map(b=>({what:'Boss '+b.id,p:W(...b.at),r:28}))
   ,...(sc.keepFree||[]).filter(k=>k.floor===floor).map(k=>({what:'Freiraum',p:W(k.x,k.y),r:k.r*U,decals:true}))];
  const patrols=def.packs.filter(p=>p.patrol&&def.rooms.find(r=>r.id===p.room).floor===floor).flatMap(p=>p.patrol.map((q,i)=>[W(...q),W(...p.patrol[(i+1)%p.patrol.length])]));
  for(const it of [...plan.items.standing,...plan.items.decals]){const standing=it.layer!=='decal',room=plan.rooms.find(r=>r.id===it.room),say=t=>problems.push(floor+' '+it.id+': '+t);
   summary.props[it.room]=(summary.props[it.room]||0)+1;(summary.kinds[it.room]||=new Set()).add(it.sprite);summary.total++;
   if(!room.rects.some(q=>{const r=rectWorld(def,floor,q);return it.minX>=r.x-.01&&it.maxX<=r.x+r.w+.01&&it.minY>=r.y-.01&&it.maxY<=r.y+r.h+.01;}))say('ragt aus dem Raum '+it.room);
   for(const p of pts){if(!standing&&!p.decals)continue;const d=boxDist(it,p.p);if(d<p.r)say(p.what+' zu nah ('+Math.round(d)+' < '+p.r+' E)');}
   if(!standing)continue;
   for(const d of plan.doors){const b={minX:d.x-12,maxX:d.x+d.w+12,minY:d.y-12,maxY:d.y+d.h+12};if(it.minX<b.maxX&&it.maxX>b.minX&&it.minY<b.maxY&&it.maxY>b.minY)say('versperrt die Tür '+d.id);}
   for(const [a,b] of patrols)if(boxSeg(it,a,b)<16)say('auf dem Weg der Streife');
   if(room.arena){const r=room.rects.map(q=>rectWorld(def,floor,q)).find(r=>it.x>=r.x&&it.x<=r.x+r.w&&it.y>=r.y&&it.y<=r.y+r.h),edge=r&&Math.min(it.minX-r.x,r.x+r.w-it.maxX,it.minY-r.y,r.y+r.h-it.maxY);if(!(edge<=14))say('steht in der Arena '+room.arena+' ('+Math.round(edge)+' E von der Wand)');}
   for(const path of paths.filter(p=>p.floor===floor))for(let i=1;i<path.pts.length;i++)if(boxSeg(it,path.pts[i-1],path.pts[i])<5){say('liegt auf einem Laufweg');break;}}
  for(const it of plan.items.decor){summary.props[it.room]=(summary.props[it.room]||0)+1;(summary.kinds[it.room]||=new Set()).add(it.sprite);summary.total++;}
  for(const it of plan.items.tops){summary.props[it.room]=(summary.props[it.room]||0)+1;(summary.kinds[it.room]||=new Set()).add(it.sprite);summary.total++;}}
 summary.kinds=Object.fromEntries(Object.entries(summary.kinds).map(([k,v])=>[k,v.size]));
 return {unreachable,problems:[...new Set(problems)],summary};
}
/** Aktuelle Ebene des Helden im Dungeon (oder null). */
export function heroFloor(g){const run=dungeonRun(g);return run?floorAt(run.def,g.player.x,g.player.y)||run.checkpoint.floor:null;}
export {speakerPoint};
