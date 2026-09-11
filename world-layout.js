import {distance,inside} from './world.js';
export function residential(w,p){return w.areas.some(a=>a.tags.landuse==='residential'&&inside(p.x,p.y,a.points));}
export function wildernessSite(w,random,min,max,used,radius=95){
 const nodes=w.candidates(min,max);
 for(let i=0;i<12000;i++){
  const node=nodes[Math.floor(random()*nodes.length)];if(!node)break;
  const a=random()*Math.PI*2,d=120+random()*110,p={x:node.x+Math.cos(a)*d,y:node.y+Math.sin(a)*d};
  if(residential(w,p)||w.blocked(p.x,p.y,radius)||w.onRoad(p.x,p.y,28)||used.some(u=>distance(u,p)<(u.reserve||170)+radius)||!w.walkClear(node,p,10))continue;
  if(w.areas.some(a=>a.tags.natural==='water'&&inside(p.x,p.y,a.points)))continue;
  return {...p,node:node.id,reserve:radius,wilderness:true};
 }
 throw Error('Kein freies, erreichbares Außenlager gefunden.');
}
export function makeHubs(w,random,used){
 const hubs=[{...w.spawn,x:w.spawn.x-52,y:w.spawn.y+40,id:'kirchplatz',name:'Clan-Treff · St. Gangolf',reserve:120}];
 for(const [id,name,min,max]of [['pfandhof','Pfandhof · Zur krummen Kiste',350,1150],['wegestube','Wegestube · Letzte Brezel',850,1850]]){
  const p=w.chooseSite(random,min,max,[...used,...hubs],65);hubs.push({...p,id,name,reserve:150});
 }
 w.hubs=hubs;return hubs;
}
export function setCampApproaches(w){for(const c of w.camps){const points=w.candidates(200,7000).filter(n=>distance(n,c)>290&&distance(n,c)<410);points.sort((a,b)=>distance(a,w.spawn)-distance(b,w.spawn));const p=points[0]||w.nodes[c.node];c.approach={x:p.x,y:p.y};c.title=c.questId?'Besetzter Pfandplatz':c.type==='wolf'?'Geplünderter Grillplatz':c.type==='cultist'?'Beschlagnahmte Bollerboxen':'Horsts Ruhezone';}}
