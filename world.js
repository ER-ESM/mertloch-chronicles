import {spaceQuestGivers} from './world-presence.js';
import {dressSites,placeQuestObjects} from './site-dressing.js';
import {refineDressing,placementReason} from './world-dressing.js';
import {prepareDetails} from './world-details.js';
import {WORLD_RULES,resolveRules} from './world-rules.js';
import {wildernessSite,makeHubs,setCampApproaches} from './world-layout.js';
import {dressStory} from './clan.js';
export const SCALE=WORLD_RULES.pixelsPerMeter;
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function inside(x,y,points){let c=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
export function nearestOnSegment(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return{x:a.x+t*dx,y:a.y+t*dy};}
export function segmentDistance(x,y,a,b){return distance({x,y},nearestOnSegment(x,y,a,b));}
function bounds(p){return {minX:Math.min(...p.map(a=>a.x)),maxX:Math.max(...p.map(a=>a.x)),minY:Math.min(...p.map(a=>a.y)),maxY:Math.max(...p.map(a=>a.y))};}
function rectangle(x,y,w,h){return [{x:x-w/2,y:y-h/2},{x:x+w/2,y:y-h/2},{x:x+w/2,y:y+h/2},{x:x-w/2,y:y+h/2},{x:x-w/2,y:y-h/2}];}
class Heap{constructor(){this.a=[];}push(v){const a=this.a;a.push(v);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}pop(){const a=this.a,first=a[0],v=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let n=i*2+1;if(n+1<a.length&&a[n+1].f<a[n].f)n++;if(a[n].f>=v.f)break;a[i]=a[n];i=n;}a[i]=v;}return first;}get length(){return this.a.length;}}

export class World {
  constructor(data,options={}) {
    this.data=data;this.rules=resolveRules(options);this.seed=this.rules.seed;this.id=`v2-${this.seed}-${this.rules.roads.street}-${this.rules.vegetation.density}`;this.bbox=data.bbox;
    this.width=(this.bbox.east-this.bbox.west)*111320*Math.cos(50.27*Math.PI/180)*SCALE;this.height=(this.bbox.north-this.bbox.south)*111320*SCALE;
    this.roads=[];this.buildings=[];this.areas=[];this.water=[];this.barriers=[];this.landmarks=[];this.trees=[];this.props=[];this.gardens=[];this.quests=[];this.camps=[];this.grid=new Map();this.roadGrid=new Map();this.nodes=[];
    const raw=[];
    for(const f of data.elements){if(!f.geometry)continue;const points=f.geometry.map(p=>this.project(p.lat,p.lon)),b=bounds(points),t=f.tags;
      if(b.maxX<0||b.minX>this.width||b.maxY<0||b.minY>this.height)continue;
      const o={id:f.id,tags:t,points,...b,x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2};
      if(t.building)raw.push(o);
      else if(t.highway){o.width=['footway','path','track','cycleway','steps'].includes(t.highway)?this.rules.roads.path:['secondary','tertiary'].includes(t.highway)?this.rules.roads.main:this.rules.roads.street;this.roads.push(o);}
      else if(t.waterway&&t.tunnel!=='culvert')this.water.push(o);
      else if(t.landuse||t.natural||t.leisure)this.areas.push(o);
    }
    this.sourceBuildings=raw.length;this.indexRoads();
    const churchSource=raw.find(b=>b.tags.building==='church');if(!churchSource)throw new Error('Im Kartenausschnitt fehlt die Start-Landmarke St. Gangolf.');
    const church=this.makeBuilding(churchSource,churchSource.x,churchSource.y,172,116,'church');this.church=church;this.buildings.push(church);this.landmarks.push(church);this.addGrid(church);
    this.spawn={x:church.x+15,y:church.maxY+94};this.plaza={x:church.x,y:church.maxY+86,radius:this.rules.settlement.plazaRadius};
    this.npc={x:this.spawn.x-34,y:this.spawn.y-16,name:'Wachtmeisterin Ida',type:'npc'};
    this.shrine={x:this.spawn.x+53,y:this.spawn.y+17,type:'shrine'};
    const random=rng(this.seed);let omitted=0,relocated=0;
    // Roads and a protected forecourt win over literal footprint fidelity.
    const order=raw.filter(b=>b!==churchSource).sort((a,b)=>Number(!!b.tags.name)-Number(!!a.tags.name)||a.id-b.id);
    for(const b of order){const ow=b.maxX-b.minX,oh=b.maxY-b.minY;
      if(this.rules.settlement.removeSmallOutbuildings&&!b.tags.name&&(ow<28||oh<24||['garage','garages','shed','carport'].includes(b.tags.building))){omitted++;continue;}
      const style=b.tags.building==='chapel'?'chapel':ow*oh>23000?'barn':random()>.54?'timber':'cottage';
      const w=Math.max(this.rules.house.minWidth,Math.min(this.rules.house.maxWidth,ow*.88)),h=Math.max(this.rules.house.minDepth,Math.min(this.rules.house.maxDepth,oh*.82));
      let placed=null;const near=this.closestRoad(b.x,b.y);const away={x:b.x-near.point.x,y:b.y-near.point.y};const d=Math.hypot(away.x,away.y)||1;
      for(const shift of [0,24,48,72,104]){const x=b.x+away.x/d*shift,y=b.y+away.y/d*shift;if(this.lotFits(x,y,w,h)){placed=this.makeBuilding(b,x,y,w,h,style);if(shift)relocated++;break;}}
      if(!placed){omitted++;continue;}this.buildings.push(placed);this.addGrid(placed);if(b.tags.name)this.landmarks.push(placed);
    }
    // Reserve actual footpaths between each front door and the public street.
    for(const b of this.buildings){const door=b.door;const near=this.closestRoad(door.x,door.y);const variants=[[door,near.point],[door,{x:door.x,y:door.y+28},{x:near.point.x,y:door.y+28},near.point]];
      for(const x of [b.minX-22,b.maxX+22])for(const y of [b.maxY+22,b.minY-22]){const corner={x,y},road=this.closestRoad(x,y);variants.push([door,{x,y:door.y},corner,road.point]);}
      const path=variants.find(points=>points.every((p,i)=>!i||this.walkClear(points[i-1],p,9)));
      if(path){this.roads.push({id:'entry-'+b.id,tags:{highway:'footway'},points:path,width:this.rules.roads.entrance,entrance:true,...bounds(path),x:door.x,y:door.y});b.accessible=true;}
    }
    // Unserviceable dense lots become gardens instead of decorative dead ends.
    this.buildings=this.buildings.filter(b=>b.church||b.accessible);this.landmarks=this.landmarks.filter(b=>this.buildings.includes(b));this.grid.clear();this.buildings.forEach(b=>this.addGrid(b));
    const access=this.closestRoad(this.spawn.x,this.spawn.y);this.roads.push({id:'church-square',tags:{highway:'footway',name:'Kirchvorplatz'},points:[this.spawn,access.point],width:38,entrance:true,...bounds([this.spawn,access.point]),x:this.spawn.x,y:this.spawn.y});
    this.indexRoads();this.buildNavigation();this.generateEncounters(random);this.generateQuests(random);placeQuestObjects(this);setCampApproaches(this);this.dressWorld(random);refineDressing(this);spaceQuestGivers(this);
    this.report={version:2,dressing:this.dressingReport,seed:this.seed,sourceBuildings:raw.length,buildings:this.buildings.length,omittedBuildings:raw.length-this.buildings.length,relocatedBuildings:this.buildings.filter(b=>distance(b,b.sourceCenter)>1).length,accessibleDoors:this.buildings.filter(b=>b.accessible).length,roadNodes:this.nodes.length,connectedRoadNodes:this.connected.size,trees:this.trees.length,quests:this.quests.length,failures:[],rules:this.rules};
    dressSites(this);this.validate();dressStory(this);this.details=prepareDetails(this).filter(p=>!placementReason(this,p,p.kind===2?'bench':'rock'));
  }
  makeBuilding(source,x,y,w,h,style){const points=rectangle(x,y,w,h),church=style==='church';return {id:source.id,tags:source.tags,sourceCenter:{x:source.x,y:source.y},points,...bounds(points),x,y,w,h,church,style,wallHeight:church?92:style==='barn'?72:this.rules.house.wallHeight+(source.id%3)*8,roofHeight:church?44:this.rules.house.roofHeight,door:{x:x+w*.14,y:y+h/2+12},accessible:false};}
  lotFits(x,y,w,h){const b={minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2};if(b.minX<35||b.minY<35||b.maxX>this.width-35||b.maxY>this.height-35)return false;
    if(Math.abs(x-this.plaza.x)<w/2+this.plaza.radius+15&&Math.abs(y-this.plaza.y)<h/2+this.plaza.radius+15)return false;
    const gap=this.rules.house.gap;for(const o of this.nearby(x,y,Math.max(w,h)/2+gap))if(b.minX<o.maxX+gap&&b.maxX>o.minX-gap&&b.minY<o.maxY+gap&&b.maxY>o.minY-gap)return false;
    for(let px=b.minX;px<=b.maxX;px+=12)for(let py=b.minY;py<=b.maxY;py+=12)if(this.onRoad(px,py,this.rules.roads.clearance))return false;
    return !this.onRoad(x,y,this.rules.roads.clearance);
  }
  project(lat,lon){return {x:(lon-this.bbox.west)*111320*Math.cos(50.27*Math.PI/180)*SCALE,y:(this.bbox.north-lat)*111320*SCALE};}
  unproject(x,y){return {lat:this.bbox.north-y/(111320*SCALE),lon:this.bbox.west+x/(111320*Math.cos(50.27*Math.PI/180)*SCALE)};}
  addGrid(o){for(let x=Math.floor(o.minX/100);x<=Math.floor(o.maxX/100);x++)for(let y=Math.floor(o.minY/100);y<=Math.floor(o.maxY/100);y++){const k=x+','+y;if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(o);}}
  nearby(x,y,r=8){const found=new Set();for(let gx=Math.floor((x-r)/100);gx<=Math.floor((x+r)/100);gx++)for(let gy=Math.floor((y-r)/100);gy<=Math.floor((y+r)/100);gy++)for(const b of this.grid.get(gx+','+gy)||[])found.add(b);return [...found];}
  blocked(x,y,r=6){if(x<20||y<20||x>this.width-20||y>this.height-20)return true;for(const b of this.nearby(x,y,r)){if(b.radius){if(Math.hypot(x-b.x,y-b.y)<r+b.radius)return true;continue;}if(x>b.minX-r&&x<b.maxX+r&&y>b.minY-r&&y<b.maxY+r)return true;}return false;}
  indexRoads(){this.roadGrid.clear();this.segments=[];for(const road of this.roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];if(distance(a,b)<.1)continue;const s={a,b,road,...bounds([a,b])};this.segments.push(s);const pad=road.width/2+50;for(let x=Math.floor((s.minX-pad)/200);x<=Math.floor((s.maxX+pad)/200);x++)for(let y=Math.floor((s.minY-pad)/200);y<=Math.floor((s.maxY+pad)/200);y++){const key=x+','+y;if(!this.roadGrid.has(key))this.roadGrid.set(key,[]);this.roadGrid.get(key).push(s);}}}
  onRoad(x,y,pad=0){return (this.roadGrid.get(Math.floor(x/200)+','+Math.floor(y/200))||[]).some(s=>segmentDistance(x,y,s.a,s.b)<s.road.width/2+pad);}
  closestRoad(x,y,named=false){let best=null,point={x,y},d=Infinity;const local=this.roadGrid.get(Math.floor(x/200)+','+Math.floor(y/200));const pool=named?(local?.some(s=>s.road.tags.name)?local:this.segments):local?.length?local:this.segments;for(const s of pool){if(named&&!s.road.tags.name)continue;const p=nearestOnSegment(x,y,s.a,s.b),n=distance({x,y},p);if(n<d){best=s.road;point=p;d=n;}}return {road:best,point,distance:d};}
  nearestRoad(x,y){return this.closestRoad(x,y,true);}
  findClear(x,y,r=7){if(!this.blocked(x,y,r))return{x,y};for(let d=10;d<500;d+=10)for(let a=0;a<Math.PI*2;a+=.3){const p={x:x+Math.cos(a)*d,y:y+Math.sin(a)*d};if(!this.blocked(p.x,p.y,r))return p;}throw new Error('Kein freier Platz in der Umgebung gefunden.');}
  areaAt(x,y){return this.areas.find(a=>x>=a.minX&&x<=a.maxX&&y>=a.minY&&y<=a.maxY&&inside(x,y,a.points));}
  walkClear(a,b,r=8){const n=Math.ceil(distance(a,b)/5);for(let i=0;i<=n;i++)if(this.blocked(a.x+(b.x-a.x)*i/(n||1),a.y+(b.y-a.y)*i/(n||1),r))return false;return true;}
  lineClear(a,b){return this.walkClear(a,b,1);}
  buildNavigation(){
    const nodes=this.nodes,map=new Map();const add=p=>{const k=Math.round(p.x)+','+Math.round(p.y);if(map.has(k))return map.get(k);if(this.blocked(p.x,p.y,9))return null;const n={id:nodes.length,x:p.x,y:p.y,links:[]};nodes.push(n);map.set(k,n);return n;};
    const link=(a,b)=>{if(a&&b&&a!==b&&this.walkClear(a,b,9)){if(!a.links.includes(b.id))a.links.push(b.id);if(!b.links.includes(a.id))b.links.push(a.id);}};
    for(const s of this.segments){const n=Math.ceil(distance(s.a,s.b)/this.rules.navigation.sampleStep);let prev=null;for(let i=0;i<=n;i++){const p={x:s.a.x+(s.b.x-s.a.x)*i/n,y:s.a.y+(s.b.y-s.a.y)*i/n};const node=add(p);link(prev,node);prev=node;}}
    const spatial=new Map();for(const n of nodes){const k=Math.floor(n.x/60)+','+Math.floor(n.y/60);if(!spatial.has(k))spatial.set(k,[]);spatial.get(k).push(n);}
    for(const n of nodes)for(let x=Math.floor(n.x/60)-1;x<=Math.floor(n.x/60)+1;x++)for(let y=Math.floor(n.y/60)-1;y<=Math.floor(n.y/60)+1;y++)for(const other of spatial.get(x+','+y)||[])if(other.id>n.id&&distance(n,other)<43)link(n,other);
    const root=nodes.filter(n=>distance(n,this.spawn)<260&&this.walkClear(this.spawn,n,9)).sort((a,b)=>distance(a,this.spawn)-distance(b,this.spawn))[0];
    if(!root)throw new Error('Der Kirchvorplatz hat keinen sicheren Anschluss an das Wegenetz.');this.navRoot=root.id;this.connected=new Set([root.id]);const queue=[root.id];for(let i=0;i<queue.length;i++)for(const id of nodes[queue[i]].links)if(!this.connected.has(id)){this.connected.add(id);queue.push(id);}this.navSpatial=spatial;
  }
  candidates(min,max){return this.nodes.filter(n=>this.connected.has(n.id)&&distance(n,this.spawn)>min&&distance(n,this.spawn)<max);}
  chooseSite(random,min,max,used=[],radius=60){const candidates=this.candidates(min,max);for(let tries=0;tries<1200;tries++){const node=candidates[Math.floor(random()*candidates.length)];if(!node)break;const a=random()*Math.PI*2,d=35+random()*75,p={x:node.x+Math.cos(a)*d,y:node.y+Math.sin(a)*d};if(this.blocked(p.x,p.y,radius)||!this.walkClear(node,p,10)||used.some(u=>distance(u,p)<(u.reserve||170)+radius))continue;return {...p,node:node.id,reserve:radius};}throw new Error(`Kein erreichbarer Begegnungsplatz (${min}–${max}) gefunden.`);}
  generateEncounters(random){const used=[{...this.spawn,reserve:210}];for(const [type,min,max,count] of [['wolf',700,3000,3],['cultist',1400,3900,2],['boss',2200,5000,1]]){const c=wildernessSite(this,random,min,max,used,type==='boss'?130:105);c.id='main-'+type;c.type=type;c.count=count;c.spawns=Array.from({length:count},(_,i)=>({x:c.x+(count===3?Math.cos(i*Math.PI*2/3)*82:(i-(count-1)/2)*105),y:c.y+(count===3?Math.sin(i*Math.PI*2/3)*82:0)}));this.camps.push(c);used.push(c);}}
  generateQuests(random){const names=['Kräuterkundige Mara','Bote Leander','Feldhüter Oskar','Sammlerin Fenja','Wanderer Tilo','Jägerin Jonna'];const used=[{...this.spawn,reserve:65},...this.camps];const hubs=makeHubs(this,random,used);
    for(let i=0;i<this.rules.quests.count;i++){const type=['gather','scout','hunt'][i%3];const hub=hubs[Math.floor(i/2)],giver={x:hub.x+(i%2?34:-26),y:hub.y,reserve:35,hubId:hub.id};
      used.push({...giver,reserve:90});const target=type==='hunt'?wildernessSite(this,random,700,3800,[...used,...hubs],100):this.chooseSite(random,320,this.rules.quests.maxDistance,[...used,...hubs],42);used.push(target);const near=this.nearestRoad(target.x,target.y),location=near.road?.tags.name||'den Mertlocher Fluren';
      const q={id:`${this.seed}-quest-${i}`,type,giver:{...giver,name:names[i]},target,location,title:type==='gather'?'Heilkraut für das Dorf':type==='scout'?'Das Echo der Wegsteine':'Unruhe am Wegesrand',description:type==='gather'?`Sammle drei Büschel Silberkraut bei ${location} und bringe sie zurück.`:type==='scout'?`Untersuche den alten Wegstein bei ${location}. Kehre anschließend zurück und berichte.`:`Vertreibe zwei Wölfe bei ${location} und melde dich anschließend zurück.`,required:type==='gather'?3:type==='hunt'?2:1,reward:type==='hunt'?100:70,items:[]};
      if(type!=='hunt')for(let j=0;j<q.required;j++)q.items.push({id:q.id+'-item-'+j,x:target.x+(j-1)*20,y:target.y+(j%2)*15,type:type==='gather'?'herb':'waystone'});
      else this.camps.push({...target,id:q.id,type:'wolf',count:2,questId:q.id,spawns:[{x:target.x-20,y:target.y},{x:target.x+20,y:target.y+12}]});this.quests.push(q);
    }
  }
  reserved(x,y,pad=0){const p={x,y};return (this.hubs||[]).some(h=>distance(p,h)<110+pad)||distance(p,this.plaza)<this.plaza.radius+pad||this.camps.some(c=>distance(c,p)<(c.type==='boss'?165:135)+pad)||this.quests.some(q=>distance(q.giver,p)<50+pad||distance(q.target,p)<75+pad||q.items.some(item=>distance(item,p)<25+pad));}
  dressWorld(random){const density=this.rules.vegetation.density,treeGrid=new Set();const addTree=(x,y)=>{x=Math.round(x);y=Math.round(y);const key=Math.floor(x/30)+','+Math.floor(y/30);if(treeGrid.has(key)||this.blocked(x,y,26)||this.onRoad(x,y,this.rules.vegetation.roadBuffer)||this.reserved(x,y,15))return;const t={x:Math.round(x),y:Math.round(y),type:random()>.17?'tree':'pine',variant:Math.floor(random()*5),size:.85+random()*.5,seed:this.trees.length};this.trees.push(t);treeGrid.add(key);};
    for(let i=0;i<18000*density;i++){const x=random()*this.width,y=random()*this.height,area=this.areaAt(x,y);const forest=area&&(area.tags.landuse==='forest'||area.tags.natural==='wood'),farm=area?.tags.landuse==='farmland';if(random()>(forest?.95:farm?.025:.22))continue;addTree(x,y);}
    for(const b of this.buildings){for(let i=0;i<5*density;i++){const x=b.x+(random()-.5)*(b.w+170),y=b.y+(random()-.5)*(b.h+180);addTree(x,y);}if(!b.church){const g={x:b.minX+14,y:b.maxY+24,w:34,h:18,type:'garden',variant:b.id%4};if(!this.onRoad(g.x,g.y,18)&&!this.blocked(g.x,g.y,19)&&!this.reserved(g.x,g.y))this.gardens.push(g);}}
    for(const t of this.trees)this.addGrid({x:t.x,y:t.y,radius:4*t.size,minX:t.x-6,maxX:t.x+6,minY:t.y-6,maxY:t.y+6});
    for(let i=0;i<4500;i++){const a=random()*Math.PI*2,d=random()*3600,x=this.spawn.x+Math.cos(a)*d,y=this.spawn.y+Math.sin(a)*d;if(this.blocked(x,y,9)||this.onRoad(x,y,2)||distance({x,y},this.plaza)<this.plaza.radius+6)continue;this.props.push({x,y,type:random()>.88?'rock':'flowers',variant:Math.floor(random()*6),seed:i});}
    for(const [x,y,type] of [[this.plaza.x-66,this.plaza.y-56,'bench'],[this.plaza.x+66,this.plaza.y-58,'cart'],[this.plaza.x-84,this.plaza.y+2,'lantern'],[this.plaza.x+78,this.plaza.y+54,'lantern']])this.props.push({x,y,type,variant:0});
  }
  accessNode(p){const list=[],bx=Math.floor(p.x/60),by=Math.floor(p.y/60);for(let x=bx-5;x<=bx+5;x++)for(let y=by-5;y<=by+5;y++)for(const n of this.navSpatial.get(x+','+y)||[])if(this.connected.has(n.id))list.push(n);list.sort((a,b)=>distance(a,p)-distance(b,p));return list.find(n=>this.walkClear(p,n,9));}
  roadPath(start,end){const a=this.accessNode(start),b=this.accessNode(end);if(!a||!b)return [];const heap=new Heap(),cost=new Map([[a.id,0]]),prev=new Map();heap.push({id:a.id,f:0});while(heap.length){const n=heap.pop();if(n.id===b.id){const path=[end];let at=b.id;while(at!==a.id){path.unshift(this.nodes[at]);at=prev.get(at);if(at===undefined)return [];}path.unshift(a);return this.simplify(start,path);}for(const id of this.nodes[n.id].links){const next=(cost.get(n.id)||0)+distance(this.nodes[n.id],this.nodes[id]);if(next>=(cost.get(id)??Infinity))continue;cost.set(id,next);prev.set(id,n.id);heap.push({id,f:next+distance(this.nodes[id],b)});}}return [];}
  simplify(start,path){const out=[];let from=start;for(let i=0;i<path.length;i++)if(i===path.length-1||!this.walkClear(from,path[i+1],9)){out.push({x:path[i].x,y:path[i].y});from=path[i];}return out;}
  findPath(start,end,maxNodes=this.rules.navigation.maxLocalNodes){if(this.blocked(start.x,start.y,9)&&!this.blocked(start.x,start.y,4)){const safe=this.findClear(start.x,start.y,10);if(distance(start,safe)<35&&this.walkClear(start,safe,4)){const rest=this.findPath(safe,end,maxNodes);return rest.length?[safe,...rest]:[];}}const goal=this.findClear(end.x,end.y,9);if(this.walkClear(start,goal,9))return [goal];const viaRoad=this.roadPath(start,goal);if(viaRoad.length)return viaRoad;
    const step=12,heap=new Heap(),best=new Map(),key=(x,y)=>x+','+y;heap.push({x:0,y:0,g:0,f:distance(start,goal),parent:null});best.set('0,0',0);let count=0;
    while(heap.length&&count++<maxNodes){let current=heap.pop();if(current.g>best.get(key(current.x,current.y)))continue;const p={x:start.x+current.x*step,y:start.y+current.y*step};if(distance(p,goal)<step*1.5&&this.walkClear(p,goal,9)){const path=[goal];while(current.parent){path.unshift({x:start.x+current.x*step,y:start.y+current.y*step});current=current.parent;}return this.simplify(start,path);}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=current.x+dx,y=current.y+dy,n={x:start.x+x*step,y:start.y+y*step},g=current.g+Math.hypot(dx,dy)*step,k=key(x,y);if(g>=(best.get(k)??Infinity)||!this.walkClear(p,n,9))continue;best.set(k,g);heap.push({x,y,g,f:g+distance(n,goal),parent:current});}}
    return [];
  }
  validate(){const targets=[...(this.hubs||[]).map(h=>({...h,label:h.id+' hub'})),...this.camps.filter(c=>c.approach).map(c=>({...c.approach,label:c.id+' approach'})),{label:'Ida',...this.npc},{label:'Heilquelle',...this.shrine},...this.camps.flatMap(c=>c.spawns.map(p=>({...p,label:c.id}))),...this.quests.flatMap(q=>[{...q.giver,label:q.id+' giver'},...q.items.map(p=>({...p,label:p.id})),{...q.target,label:q.id+' target'}])];this.report.routes=[];
    for(const t of targets){const path=this.findPath(this.spawn,t);let prev=this.spawn,length=0;const valid=path.length>0&&path.every(p=>{const ok=this.walkClear(prev,p,9);length+=distance(prev,p);prev=p;return ok;});if(!valid||this.blocked(t.x,t.y,9))this.report.failures.push('Nicht erreichbar: '+t.label);this.report.routes.push({label:t.label,reachable:valid,length:Math.round(length),waypoints:path.length});}
    this.report.doorRoutes=[];for(const b of this.buildings){const path=this.findPath(this.spawn,b.door);let prev=this.spawn;const valid=path.length>0&&path.every(p=>{const ok=this.walkClear(prev,p,9);prev=p;return ok;});this.report.doorRoutes.push({id:b.id,reachable:valid});if(!valid||this.blocked(b.door.x,b.door.y,9))this.report.failures.push('Hauseingang nicht erreichbar: '+b.id);}
    this.report.accessibleDoors=this.report.doorRoutes.filter(r=>r.reachable).length;this.report.valid=this.report.failures.length===0;if(!this.report.valid)throw new Error(this.report.failures.join('\n'));return this.report;
  }
  export(){return {format:'mertloch-world-v2',seed:this.seed,rules:this.rules,bbox:this.bbox,source:{url:this.data.url,license:this.data.license,attribution:this.data.attribution},width:this.width,height:this.height,spawn:this.spawn,plaza:this.plaza,hubs:this.hubs,details:this.details,npc:this.npc,shrine:this.shrine,buildings:this.buildings,roads:this.roads,areas:this.areas,water:this.water,trees:this.trees,props:this.props,gardens:this.gardens,camps:this.camps,quests:this.quests,report:this.report};}
}
