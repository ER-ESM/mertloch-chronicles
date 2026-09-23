import {PROFESSION_STATIONS,PROFESSIONS} from './content/index.js';
import {mountStation} from './mounts.js';
const cache=new WeakMap();
// Nicht im Haus oder Hof der Bude (E-52): drinnen ist der Boden frei und erreichbar, eine Fundstelle gehört trotzdem nicht in den Schankraum.
const inBude=(b,p,size)=>!!b&&p.x>b.minX-size-20&&p.x<b.maxX+size+20&&p.y>b.minY-size-20&&p.y<b.maxY+size+80;/* südlich: Vorplatz vor dem Eingang frei */

export function professionWorld(world){
 if(cache.has(world))return cache.get(world);const used=[world.spawn,world.npc,mountStation(world),...(world.mentors||[])].filter(Boolean),stations=[],nodes=[];
 function place(dx,dy,size){const base={x:world.spawn.x+dx,y:world.spawn.y+dy};for(let r=0;r<=400;r+=25)for(let i=0;i<(r?16:1);i++){const p={x:base.x+Math.cos(i*Math.PI/8)*r,y:base.y+Math.sin(i*Math.PI/8)*r};if(world.blocked(p.x,p.y,size)||inBude(world.base,p,size)||used.some(a=>Math.hypot(a.x-p.x,a.y-p.y)<size+55)||(world.trees||[]).some(t=>Math.abs(t.x-p.x)<size+90*(t.size||1)&&t.y>p.y-45&&t.y<p.y+140*(t.size||1))||!world.findPath(world.spawn,p).length)continue;used.push(p);return p;}return null;}
 for(const [id,s]of Object.entries(PROFESSION_STATIONS)){const p=place(s.offset.x,s.offset.y,34);if(p)stations.push({id,...p,type:'professionStation'});}
 for(let i=0;i<16;i++){const angle=i*Math.PI*2/16,r=270+(i%3)*105,p=place(Math.cos(angle)*r,Math.sin(angle)*r,10);if(p)nodes.push({id:'profession-node-'+i,kind:['scrap','herbs','machinery','hops'][i%4],...p,type:'professionNode'});}
 // Lehrer stehen an ihrer Station (je Beruf eine Figur); Standplatz aus content/professions.js.
 const teachers=Object.entries(PROFESSIONS).flatMap(([id,p])=>{const s=stations.find(s=>s.id===p.station);return s?[{id,station:s.id,x:s.x+p.spot.x,y:s.y+p.spot.y,type:'professionTeacher'}]:[];});
 const value={stations,nodes,teachers};cache.set(world,value);return value;
}
