import {distance,segmentDistance,inside} from './world.js';
export const DRESSING_RULES={version:1,doorClearance:24,roadMargin:5,waterMargin:13,spacing:{flowers:11,rock:30,bench:40,cart:40,lantern:26},radius:{flowers:3,rock:13,bench:18,cart:19,lantern:7}};
const hash=(x,y,seed)=>{let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
export function nearWater(w,p,r=0){if(w.areas.some(a=>(a.tags.natural==='water'||a.tags.water||a.tags.landuse==='reservoir')&&p.x>=a.minX-r&&p.x<=a.maxX+r&&p.y>=a.minY-r&&p.y<=a.maxY+r&&(inside(p.x,p.y,a.points)||a.points.some((q,i)=>i&&segmentDistance(p.x,p.y,a.points[i-1],q)<r))))return true;return w.water.some(line=>line.points.some((q,i)=>i&&segmentDistance(p.x,p.y,line.points[i-1],q)<DRESSING_RULES.waterMargin+r));}
export function placementReason(w,p,kind=p.type,{hub=false,reserved=false,radius=null}={}){const r=radius??DRESSING_RULES.radius[kind]??8;
 if(nearWater(w,p,r))return'water';if(w.blocked(p.x,p.y,r))return'obstacle';
 if(w.buildings.some(b=>distance(b.door,p)<DRESSING_RULES.doorClearance+r))return'door';
 if(!hub&&w.onRoad(p.x,p.y,r+DRESSING_RULES.roadMargin))return'road';
 if(!hub&&!reserved&&w.reserved(p.x,p.y,r))return'quest-space';
 if(kind!=='flowers'&&w.areaAt(p.x,p.y)?.tags.landuse==='farmland')return'cultivated-field';return null;
}
export function refineDressing(w){const rejected={},kept=[],grid=new Map(),reject=r=>rejected[r]=(rejected[r]||0)+1;
 const beforeTrees=w.trees.length;w.trees=w.trees.filter(t=>!nearWater(w,t,10));rejected['wet-trees']=beforeTrees-w.trees.length;
 // Rebuild colliders after rejecting wet tree candidates; navigation sees exactly the final roots.
 w.grid.clear();for(const b of w.buildings)w.addGrid(b);for(const t of w.trees)w.addGrid({x:t.x,y:t.y,radius:4*t.size,minX:t.x-6,maxX:t.x+6,minY:t.y-6,maxY:t.y+6});
 for(const p of w.props){const hub=['bench','cart','lantern'].includes(p.type)&&distance(p,w.plaza)<w.plaza.radius+25;let reason=placementReason(w,p,p.type,{hub});
  const spacing=DRESSING_RULES.spacing[p.type]||18,bx=Math.floor(p.x/48),by=Math.floor(p.y/48);
  if(!reason&&!hub&&p.type==='flowers'&&hash(Math.floor(p.x/135),Math.floor(p.y/135),w.seed)<.4)reason='meadow-density';
  if(!reason)for(let xx=bx-1;xx<=bx+1;xx++)for(let yy=by-1;yy<=by+1;yy++)if((grid.get(xx+','+yy)||[]).some(other=>distance(p,other)<Math.max(spacing,DRESSING_RULES.spacing[other.type]||18)))reason='spacing';
  if(reason){reject(reason);continue;}p.habitat=hub?'hub':w.areaAt(p.x,p.y)?.tags.landuse||'meadow';kept.push(p);const key=bx+','+by;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p);
 }
 const gardenCount=w.gardens.length;w.gardens=w.gardens.filter(p=>!placementReason(w,p,'flowers',{radius:Math.hypot(p.w,p.h)/2}));rejected['garden-footprint']=gardenCount-w.gardens.length;
 const report={rules:DRESSING_RULES,seed:w.seed,candidates:w.props.length,accepted:kept.length,rejected};w.props=kept;w.dressingReport=report;return report;
}
