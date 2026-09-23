import {distance,inside,rng} from './world.js';
import {STORY,STORY_CHAPTERS,ARCHETYPES,BOSSES,NPCS} from './content/index.js';
/** Wohngebiet = Wohnpolygone aus OSM **oder** tatsächlich bebautes Gebiet. Der Mertloch-Ausschnitt enthält kein einziges
 * `landuse=residential`-Polygon (Befund vr-08, docs/backlog/welt.md), deshalb zählt die Bebauungsdichte: ein Punkt liegt im
 * Wohngebiet, wenn mindestens `minBuildings` Häuser innerhalb von `radius` stehen. Die Maske wird einmal je Welt aufgebaut. */
export const SETTLEMENT_RULES=Object.freeze({cell:40,radius:250,minBuildings:3});
export function settlementMask(w){
 if(w.settlement)return w.settlement;
 const C=SETTLEMENT_RULES.cell,R=SETTLEMENT_RULES.radius,span=Math.ceil(R/C),counts=new Map();
 for(const b of w.buildings){const cx=Math.floor(b.x/C),cy=Math.floor(b.y/C);
  for(let x=cx-span;x<=cx+span;x++)for(let y=cy-span;y<=cy+span;y++){
   if(Math.hypot((x+.5)*C-b.x,(y+.5)*C-b.y)>R)continue;const k=x+','+y;counts.set(k,(counts.get(k)||0)+1);}}
 const cells=new Set();for(const [k,n] of counts)if(n>=SETTLEMENT_RULES.minBuildings)cells.add(k);
 w.settlement={cell:C,radius:R,minBuildings:SETTLEMENT_RULES.minBuildings,cells};return w.settlement;
}
export function inSettlement(w,p){const m=settlementMask(w);return m.cells.has(Math.floor(p.x/m.cell)+','+Math.floor(p.y/m.cell));}
export function residential(w,p){return w.areas.some(a=>a.tags.landuse==='residential'&&inside(p.x,p.y,a.points))||inSettlement(w,p);}
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
/** Platzierungsregeln der Kapitel-Lager (Akt 1, Kapitel 2–4). Entfernungen in Welteinheiten wie in World.generateEncounters;
 * je Kapitel rückt das Lager ein Stück weiter vom Dorfkern weg. seedSalt hält den Zufallsstrom der übrigen Welt unberührt. */
export const CHAPTER_CAMP_RULES=Object.freeze({
 seedSalt:0x5A17,
 mob:{min:760,max:3100,step:240,radius:105},
 boss:{min:2300,max:5000,step:280,radius:130},
 gather:{ring:62,spread:.7,spacing:30,tries:40}
});
const archetypeForFamily=family=>Object.keys(ARCHETYPES).find(id=>ARCHETYPES[id].family===family);
/** Sammelpunkte rund um ein Lager: begehbar und vom Lagermittelpunkt aus erreichbar. */
function gatherSpots(w,camp,item,count,random){
 const R=CHAPTER_CAMP_RULES.gather,out=[];
 for(let i=0;i<count;i++){
  let spot=null;
  for(let tries=0;tries<R.tries&&!spot;tries++){
   const angle=i/count*Math.PI*2+(random()-.5)*R.spread,d=R.ring*(.6+random()*.7),p={x:camp.x+Math.cos(angle)*d,y:camp.y+Math.sin(angle)*d};
   if(w.blocked(p.x,p.y,9)||!w.walkClear(camp,p,9)||out.some(o=>distance(o,p)<R.spacing))continue;
   spot=p;
  }
  if(!spot){const angle=i/count*Math.PI*2;spot={x:camp.x+Math.cos(angle)*R.spacing,y:camp.y+Math.sin(angle)*R.spacing};}
  out.push({id:`${camp.id}-gather-${i}`,x:Math.round(spot.x),y:Math.round(spot.y),item,type:'gather'});
 }
 return out;
}
/** Lager der Akt-1-Kapitel 2–4 aus STORY_CHAPTERS: je Kapitel ein Mob-Lager (Ziel `kill family`) und ein Boss-Lager
 * (Ziel `boss`) mit den Sammelpunkten des `gather`-Ziels. Kapitel 1 behält die Lager aus World.generateEncounters. */
export function chapterCamps(w,used=[]){
 const random=rng((w.seed|0)^CHAPTER_CAMP_RULES.seedSalt),taken=[...used],camps=[];
 const chapters=STORY_CHAPTERS.filter(c=>!c.reserve&&c.act===STORY.act&&c.id>STORY_CHAPTERS[0].id);
 for(const [step,chapter] of chapters.entries()){
  const kill=chapter.objectives.find(o=>o.kind==='kill'),boss=chapter.objectives.find(o=>o.kind==='boss'),gather=chapter.objectives.find(o=>o.kind==='gather');
  if(kill?.family){
   const archetype=archetypeForFamily(kill.family),R=CHAPTER_CAMP_RULES.mob;
   const site=wildernessSite(w,random,R.min+step*R.step,R.max+step*R.step,taken,R.radius);
   const count=kill.count||1,camp={...site,id:`chapter-${chapter.id}-mob`,chapter:chapter.id,type:ARCHETYPES[archetype].type,archetype,count,title:kill.label,
    spawns:Array.from({length:count},(_,i)=>({x:site.x+Math.cos(i/count*Math.PI*2)*82,y:site.y+Math.sin(i/count*Math.PI*2)*82}))};
   camps.push(camp);taken.push(camp);
  }
  if(boss?.boss&&BOSSES[boss.boss]){
   const R=CHAPTER_CAMP_RULES.boss;
   const site=wildernessSite(w,random,R.min+step*R.step,R.max+step*R.step,taken,R.radius);
   const camp={...site,id:`chapter-${chapter.id}-boss`,chapter:chapter.id,type:'boss',boss:boss.boss,count:1,title:boss.label,spawns:[{x:site.x,y:site.y}]};
   if(gather?.item)camp.gathers=gatherSpots(w,camp,gather.item,gather.count||1,random);
   camps.push(camp);taken.push(camp);
  }
 }
 return camps;
}
export function setCampApproaches(w){for(const c of w.camps){const points=w.candidates(200,7000).filter(n=>distance(n,c)>290&&distance(n,c)<410);points.sort((a,b)=>distance(a,w.spawn)-distance(b,w.spawn));const p=points[0]||w.nodes[c.node];c.approach={x:p.x,y:p.y};c.title||=c.questId?'Besetzter Pfandplatz':c.type==='wolf'?'Geplünderter Grillplatz':c.type==='cultist'?'Beschlagnahmte Bollerboxen':'Horsts Ruhezone';}}

/** Mentorenplätze am Treffpunkt. Welt-Seite des Playtest-Befunds P3: Dieter, Anni und Kevin standen so dicht an
 * Wachtmeisterin Ida, dass die Taste F den Falschen erwischte. Regeln (Welteinheiten): mindestens `idaGap` zu Ida —
 * damit liegt jeder Mentor außerhalb ihres F-Radius (50) —, `mentorGap` untereinander, Abstand zur Heilquelle,
 * begehbar, neben der Fahrbahn (Hauptweg bleibt frei) und vom Treffpunkt aus frei erreichbar. Gewünscht (`idaWish`)
 * ist der Abstand, ab dem sich Idas F-Radius (50) und der Mentorenradius (42) gar nicht mehr überschneiden; erst wenn
 * dort kein Platz frei ist, wird bis auf die Mindestwerte gelockert. Rein geometrisch, kein Zufall: gleicher Seed,
 * gleiche Plätze. Figur, Name und Rolle setzt die Engine (clan.js). */
export const MENTOR_RULES=Object.freeze({
 idaGap:60,idaWish:95,mentorGap:40,mentorWish:52,shrineGap:34,clearance:9,roadMargin:6,
 rings:Object.freeze([95,88,80,72,66,62]),spread:.62,sweep:1.15,angleStep:Math.PI/36,baseMargin:14
});
/** Reihenfolge der Mentoren = Reihenfolge der Clanmitglieder in content/npcs.js. IDs sind Speicherschlüssel. */
export const MENTOR_ORDER=Object.freeze(Object.keys(NPCS).filter(id=>NPCS[id].member));
/** Liefert je Mentor `{id,x,y}` in stabiler Reihenfolge. */
export function mentorSpots(w){
 // Mit begehbarer Bude (E-52) stehen die Mentoren in ihren Räumen – Plätze aus content/bude-house.js.
 const home=w.base?.house?.spots;if(home&&MENTOR_ORDER.every(id=>home[id]))return MENTOR_ORDER.map(id=>({id,x:home[id].x,y:home[id].y}));
 const R=MENTOR_RULES,out=[],away=Math.atan2(w.spawn.y-w.npc.y,w.spawn.x-w.npc.x);
 const fits=(p,gapIda,gapMentor,keepRoadFree)=>{
  if(w.blocked(p.x,p.y,R.clearance))return false;
  if(distance(p,w.npc)<gapIda)return false;
  if(w.shrine&&distance(p,w.shrine)<R.shrineGap)return false;
  if(out.some(o=>distance(o,p)<gapMentor))return false;
  if(keepRoadFree&&w.onRoad(p.x,p.y,R.roadMargin))return false;
  const b=w.base,m=R.baseMargin;
  if(b&&p.x>b.minX-m&&p.x<b.maxX+m&&p.y>b.minY-m&&p.y<b.maxY+m)return false;
  return w.walkClear(w.spawn,p,R.clearance);
 };
 const steps=Math.round(R.sweep/R.angleStep);
 for(const [i,id] of MENTOR_ORDER.entries()){
  const heading=away+(i-(MENTOR_ORDER.length-1)/2)*R.spread;let spot=null;
  for(const [gapIda,gapMentor,keepRoadFree] of [[R.idaWish,R.mentorWish,true],[R.idaWish,R.mentorGap,true],[R.idaGap,R.mentorGap,true],[R.idaGap,R.mentorGap,false]]){
   for(const ring of R.rings){
    for(let k=0;k<=steps&&!spot;k++)for(const side of k?[1,-1]:[0]){
     const angle=heading+side*k*R.angleStep;
     const p={x:Math.round(w.spawn.x+Math.cos(angle)*ring),y:Math.round(w.spawn.y+Math.sin(angle)*ring)};
     if(fits(p,gapIda,gapMentor,keepRoadFree)){spot=p;break;}
    }
    if(spot)break;
   }
   if(spot)break;
  }
  if(!spot)throw new Error('Kein freier Mentorenplatz am Treffpunkt für '+id+'.');
  out.push({id,x:spot.x,y:spot.y});
 }
 return out;
}
