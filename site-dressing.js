import {placementReason} from './world-dressing.js';
import {distance} from './world.js';
// Templates describe a place's role, not geographic coordinates. Search nearby clear
// alternatives for each footprint; omit a prop when there is no suitable position.
export function dressSites(w){let accepted=0,omitted=0;const units=[w.npc,...w.quests.map(q=>q.giver)],occupied=[];
 for(const site of [...w.hubs,...w.camps]){const hub=w.hubs.includes(site),church=site.id==='kirchplatz',templates=church?[['board',-72,4,40,12]]:hub?[['tent',0,-20,69,34],['supplies',-64,3,29,19],['board',80,4,40,12],['lantern',-87,-6,32,8]]:[['tent',-70,-68,62,31],['supplies',73,-30,32,20],['lantern',-112,12,32,8],['board',101,18,40,12]];site.dressing=[];
  for(const [type,dx,dy,height,radius]of templates){let chosen=null;for(const [sx,sy]of [[0,0],[-20,0],[20,0],[0,-24],[0,24],[-32,-18],[32,-18],[-32,18],[32,18]]){const p={type,x:site.x+dx+sx,y:site.y+dy+sy,height,radius};if(placementReason(w,p,'flowers',{hub:church,reserved:true,radius}))continue;if(units.some(u=>distance(p,u)<radius+14)||occupied.some(o=>distance(p,o)<radius+o.radius+6)||(site.spawns||[]).some(u=>distance(p,u)<radius+13))continue;chosen=p;break;}if(chosen){site.dressing.push(chosen);occupied.push(chosen);accepted++;}else omitted++;}
 }w.dressingReport.sites={accepted,omitted};
}
export function placeQuestObjects(w){for(const q of w.quests)for(const [index,item]of q.items.entries()){
 const candidates=[{x:item.x,y:item.y}];for(const r of [24,40,60,84,110])for(let i=0;i<16;i++){const a=(i+(w.seed%7)/7)*Math.PI/8;candidates.push({x:item.x+Math.cos(a)*r,y:item.y+Math.sin(a)*r});}
 const spot=candidates.find(p=>!placementReason(w,p,'flowers',{reserved:true,radius:item.type==='herb'?7:15})&&w.walkClear(q.target,p,9)&&q.items.slice(0,index).every(o=>distance(o,p)>20));
 if(!spot)throw Error('Kein geeigneter Platz neben dem Weg für '+item.id);Object.assign(item,spot);
}}
