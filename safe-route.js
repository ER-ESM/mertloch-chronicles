// Laufwege mit Wegkosten (E-72 Runde 4, 25.09.2026). Kenner-Befund: „Hinlaufen: Baustelle“ führte mitten durch das Keilerrudel und
// brach mit „Angegriffen – Laufweg angehalten“ ab. Bisher nahm jeder Laufweg (Karte, Minikarte, Auftragskasten, Rechtsklick) die
// kürzeste Strecke: gerade Linie, sonst Wegenetz nach reiner Länge.
// Jetzt: Liegt der kürzeste Weg in einem bekannten Gegnerrevier, sucht das Wegenetz eine Alternative, bei der jede Einheit Weg im
// Revier BALANCE.foes.route.penalty Einheiten extra kostet. Die günstigere Strecke gewinnt – gibt es keinen Umweg, bleibt es beim
// kürzesten Weg. Reviere: lebende, angriffslustige Weltgegner, die dich nicht längst verfolgen (Feld, Tiergebiete, Lager), dazu noch
// nicht geladene Tiergebiete. Graue Gegner (foe-rules.js) greifen nicht an und kosten nichts; ein Revier, in dem Start oder Ziel
// liegt, kostet ebenfalls nichts (dorthin willst du ja).
import {BALANCE,ARCHETYPES,ELITES} from './content/index.js';
import {distance} from './world.js';
import {worldFoe,gapAggro} from './foe-rules.js';
import {hotspotLayout} from './hotspots.js';
import {ENCOUNTER_RULES} from './encounters.js';

const R=()=>BALANCE.foes.route;
/** Revier eines Gegners als Kreis {x,y,r}; null, wenn er nicht bedroht. */
export function foeZone(g,e){
 if(!worldFoe(e)||e.behavior!=='aggressive'||e.aggro||e.ai==='returning'||e.dummy||e.tutorial)return null;
 if(!(e.hp>0)&&e.ai!=='waiting'&&e.ai!=='appearing')return null;
 const aggro=(e.aggroRange||0)*gapAggro(g,e);if(!(aggro>0))return null;
 const home=e.home||e;return {x:home.x,y:home.y,r:(e.roamRadius||0)*R().roamShare+aggro+R().margin,id:e.id};
}
/** Alle bekannten Reviere: geladene Gegner, gebaute Feldzellen und Tiergebiete, noch nicht geladene Tiergebiete. */
export function dangerZones(g){
 const out=[],seen=new Set(),add=e=>{if(!e||seen.has(e.id))return;seen.add(e.id);const z=foeZone(g,e);if(z)out.push(z);};
 for(const e of g.enemies||[])add(e);
 for(const list of g.ecology?.cells?.values?.()||[])for(const e of list)add(e);
 const built=g.hotspotDirector?.records;for(const list of built?.values?.()||[])for(const e of list)add(e);
 for(const a of hotspotLayout(g.world).areas||[]){if(built?.has(a.id))continue;
  let reach=0;for(const s of a.spawns){const def=ARCHETYPES[s.kind]||ELITES[s.kind];if(def?.behavior!=='aggressive')continue;
   reach=Math.max(reach,(def.aggroRange||0)*gapAggro(g,{ambient:true,level:def.level||1}));}
  if(reach>0)out.push({x:a.x,y:a.y,r:a.r+reach+R().margin,id:'area:'+a.id});}
 return out;
}
/** Länge der Strecke a→b innerhalb des Kreises z. */
function chord(a,b,z){const dx=b.x-a.x,dy=b.y-a.y,fx=a.x-z.x,fy=a.y-z.y,A=dx*dx+dy*dy;if(A<1e-9)return 0;
 const B=2*(fx*dx+fy*dy),C=fx*fx+fy*fy-z.r*z.r,disc=B*B-4*A*C;if(disc<=0)return 0;const s=Math.sqrt(disc),t1=Math.max(0,(-B-s)/(2*A)),t2=Math.min(1,(-B+s)/(2*A));
 return t2>t1?(t2-t1)*Math.sqrt(A):0;}
/** Weg im Revier auf der Strecke a→b (überlappende Reviere zählen einzeln: mehr Gegner, mehr Gefahr). */
export function exposure(a,b,zones){let n=0;for(const z of zones)n+=chord(a,b,z);return n;}
/** Weg im Revier und Kosten eines ganzen Laufwegs ab start. */
export function routeRisk(start,path,zones){let n=0,prev=start;for(const p of path){n+=exposure(prev,p,zones);prev=p;}return n;}
export function routeCost(start,path,zones,penalty=R().penalty){let n=0,prev=start;for(const p of path){n+=distance(prev,p)+penalty*exposure(prev,p,zones);prev=p;}return n;}
export function routeLength(start,path){let n=0,prev=start;for(const p of path){n+=distance(prev,p);prev=p;}return n;}
/** Kleiner Binärheap für A*. */
class Heap{constructor(){this.a=[];}get length(){return this.a.length;}push(v){const a=this.a;a.push(v);let i=a.length-1;while(i>0){const j=(i-1)>>1;if(a[j].f<=a[i].f)break;[a[i],a[j]]=[a[j],a[i]];i=j;}}
 pop(){const a=this.a,top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<a.length&&a[l].f<a[m].f)m=l;if(r<a.length&&a[r].f<a[m].f)m=r;if(m===i)break;[a[i],a[m]]=[a[m],a[i]];i=m;}}return top;}}
/** Streckenpunkte zusammenfassen wie world.simplify – aber nie per Abkürzung tiefer ins Revier. */
function tidy(w,start,path,zones){const out=[];let from=start,acc=0,prev=start;
 for(let i=0;i<path.length;i++){acc+=exposure(prev,path[i],zones);prev=path[i];const next=path[i+1];
  if(!next){out.push({x:path[i].x,y:path[i].y});break;}
  if(!w.walkClear(from,next,9)||exposure(from,next,zones)>acc+exposure(path[i],next,zones)+.5){out.push({x:path[i].x,y:path[i].y});from=path[i];acc=0;}}
 return out;}
/** Wegenetz-Suche mit Wegkosten (wie world.roadPath, Kante = Länge + penalty × Weg im Revier). */
export function safeRoadPath(w,start,goal,zones,P=R().penalty){
 const a=w.accessNode(start),b=w.accessNode(goal);if(!a||!b)return [];const cost=new Map([[a.id,0]]),prev=new Map(),heap=new Heap(),done=new Set();
 heap.push({id:a.id,f:distance(a,b)});
 while(heap.length){const n=heap.pop();if(done.has(n.id))continue;done.add(n.id);
  if(n.id===b.id){const nodes=[];let at=b.id;while(at!==undefined){nodes.unshift(w.nodes[at]);if(at===a.id)break;at=prev.get(at);}if(nodes[0]!==a)return [];return tidy(w,start,[...nodes,goal],zones);}
  const here=w.nodes[n.id],base=cost.get(n.id);
  for(const id of here.links){if(done.has(id))continue;const there=w.nodes[id],next=base+distance(here,there)+P*exposure(here,there,zones);
   if(next>=(cost.get(id)??Infinity))continue;cost.set(id,next);prev.set(id,n.id);heap.push({id,f:next+distance(there,b)});}}
 return [];
}
/** Feldzellen entlang eines Laufwegs anlegen: Der EncounterDirector baut sonst nur die Zellen rund um den Helden, und ein Umweg lief
 *  in ein Revier, das beim Planen noch niemand kannte. buildCell ist deterministisch und gespeichert; geladen werden die Gegner erst,
 *  wenn der Held in der Nähe ist. */
export function knowRoute(g,start,path){
 const eco=g.ecology,w=g.world;if(!eco?.buildCell||!eco.enabled||!path?.length)return;const C=ENCOUNTER_RULES.cellSize,seen=new Set();let prev=start;
 for(const p of path){const n=Math.max(1,Math.ceil(distance(prev,p)/160));
  for(let i=0;i<=n;i++){const cx=Math.floor((prev.x+(p.x-prev.x)*i/n)/C),cy=Math.floor((prev.y+(p.y-prev.y)*i/n)/C);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=cx+dx,Y=cy+dy,key=X+','+Y;if(seen.has(key)||X<0||Y<0||X*C>=w.width||Y*C>=w.height)continue;seen.add(key);eco.buildCell(X,Y);}}
  prev=p;}
}
/** Laufweg für game.navigate/repath: der kürzeste Weg, außer er führt durch ein Revier und das Wegenetz kennt einen günstigeren.
 *  Der Umweg bleibt begrenzt (route.detour × kürzester Weg + route.slack); ist er länger, sucht das Netz mit halber und viertel Strafe erneut.
 *  Jeder Kandidat macht die Feldzellen an seiner Strecke bekannt; tauchen dabei neue Reviere auf, wird neu geplant (höchstens dreimal). */
export function safeRoute(g,walk,start,point){
 let path=[];try{path=walk.findPath(start,point);}catch{path=[];}
 if(!path.length||walk!==g.world||!walk.nodes?.length||!walk.accessNode)return path;
 const goal=path.at(-1),span=distance(start,goal),known=()=>dangerZones(g).filter(z=>distance(z,start)>z.r&&distance(z,goal)>z.r&&distance(z,start)+distance(z,goal)<span*2.5+z.r*2+600);
 knowRoute(g,start,path);let zones=known();
 if(!zones.length||routeRisk(start,path,zones)<=0)return path;
 const cap=routeLength(start,path)*R().detour+R().slack;
 for(const P of [R().penalty,R().penalty/2,R().penalty/4]){let alt=[];
  for(let pass=0;pass<3;pass++){try{alt=safeRoadPath(walk,start,goal,zones,P);}catch{alt=[];}if(!alt.length)break;const n=zones.length;knowRoute(g,start,alt);zones=known();if(zones.length===n)break;}
  if(alt.length&&routeLength(start,alt)<=cap&&routeRisk(start,alt,zones)<routeRisk(start,path,zones)-1&&routeCost(start,alt,zones,P)<routeCost(start,path,zones,P))return alt;}
 return path;
}
