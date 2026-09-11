import {rng,distance,inside,segmentDistance} from './world.js';

export const ENCOUNTER_RULES=Object.freeze({cellSize:320,loadRadius:2,unloadDistance:1300,safeTownRadius:245,spawnDistance:235,spawnGrace:1.8,slotsPerCell:2});
const ARCHETYPES={
  badger:{name:'Pfanddachs',type:'wolf',skin:'badger',behavior:'neutral',hp:360,aggroRange:0,roamRadius:90,speed:66,respawn:[24,42]},
  goose:{name:'Grillgut-Gans',type:'wolf',skin:'goose',behavior:'neutral',hp:300,aggroRange:0,roamRadius:95,speed:75,respawn:[25,45]},
  boar:{name:'Pfandkeiler',type:'wolf',skin:'boar',behavior:'aggressive',hp:460,aggroRange:115,roamRadius:100,speed:71,respawn:[38,62]},
  warden:{name:'Ruhewart auf Streife',type:'cultist',skin:'warden',behavior:'aggressive',hp:600,aggroRange:145,roamRadius:110,speed:51,respawn:[42,68]}
};
export function makeEnemy(spot,id,config={}){const type=config.type||'wolf',boss=type==='boss',hp=config.hp||(boss?3000:type==='cultist'?680:520);return {...spot,home:{x:spot.x,y:spot.y},id,type,skin:config.skin||(boss?'horst':type==='cultist'?'warden':'boar'),name:config.name||(boss?'Horst Nüchternmann':type==='cultist'?'Ruhewart mit Hausordnung':'Grillplatz-Plünderer'),hp,maxHp:hp,level:boss?4:type==='cultist'?3:2,behavior:config.behavior||'aggressive',aggroRange:config.aggroRange??(boss?105:100),roamRadius:config.roamRadius??(boss?35:65),speed:config.speed||(boss?46:type==='wolf'?71:48),respawn:config.respawn||(boss?[90,120]:[35,55]),leash:config.leash||380,ai:'roaming',aggro:false,attackTimer:1.8,cast:null,cycle:0,mark:0,dotDamage:12,dotTimer:0,slow:1,vulnerable:0,stun:0,dead:0,respawnAt:0,spawnCount:0,facing:1,moving:false,attack:0,spawnGrace:0,roamWait:1+(id%7)*.37,roamGoal:null,returnPath:[],returnTime:0,chasePath:[],pathTimer:0,...Object.fromEntries(Object.entries(config).filter(([,value])=>value!==undefined))};}
export const walkClear=(w,a,b,r=7)=>w.walkClear?w.walkClear(a,b,r):w.lineClear(a,b);
export function inSanctuary(w,p){return (w.quests||[]).some(q=>q.activity&&q.items.some(item=>distance(item,p)<55))||distance(p,w.spawn)<95||(w.hubs||[]).some(h=>distance(p,h)<105)||(w.camps||[]).some(c=>c.approach&&distance(p,c.approach)<85);}
function nearPeople(w,p,pad){return (w.quests||[]).some(q=>distance(p,q.giver)<pad)||distance(p,w.npc)<pad;}
export function inhabitable(w,p){
  if((w.quests||[]).some(q=>q.activity&&q.items.some(item=>distance(item,p)<130)))return false;
  if((w.hubs||[]).some(h=>distance(p,h)<165)||(w.camps||[]).some(c=>c.approach&&distance(p,c.approach)<170))return false;
  if(p.x<25||p.y<25||p.x>w.width-25||p.y>w.height-25||w.blocked(p.x,p.y,12)||distance(p,w.spawn)<ENCOUNTER_RULES.safeTownRadius||nearPeople(w,p,85)||w.onRoad(p.x,p.y,10))return false;
  if(w.areas.some(a=>a.tags.natural==='water'&&inside(p.x,p.y,a.points)))return false;
  if(w.water.some(r=>r.points.some((b,i)=>i&&segmentDistance(p.x,p.y,r.points[i-1],b)<18)))return false;
  return true;
}
function anchorFor(w,p){const near=w.accessNode(p);if(near)return near;const nodes=w.nodes.filter(n=>w.connected.has(n.id)&&distance(n,p)<1100).sort((a,b)=>distance(a,p)-distance(b,p));return nodes.slice(0,24).find(n=>walkClear(w,n,p,9));}

/** Finite, deterministic habitat cells; inactive records retain health and respawn deadlines. */
export class EncounterDirector{
  constructor(game){this.game=game;this.world=game.world;this.cells=new Map();this.queue=[];this.key='';this.clock=0;this.enabled=!!this.world.nodes?.length;}
  buildCell(cx,cy){const w=this.world,g=this.game,C=ENCOUNTER_RULES.cellSize,key=cx+','+cy;if(this.cells.has(key))return this.cells.get(key);const random=rng(w.seed^Math.imul(cx+101,73856093)^Math.imul(cy+101,19349663)),list=[];
    for(let attempt=0;attempt<24&&list.length<ENCOUNTER_RULES.slotsPerCell;attempt++){
      const p={x:Math.round(cx*C+24+random()*(C-48)),y:Math.round(cy*C+24+random()*(C-48))};if(!inhabitable(w,p)||(w.camps||[]).some(c=>distance(c,p)<120)||list.some(e=>distance(e,p)<105))continue;
      const anchor=anchorFor(w,p);if(!anchor)continue;
      const area=w.areas.find(a=>['farmland','meadow','grass','forest'].includes(a.tags.landuse)&&inside(p.x,p.y,a.points))||w.areaAt(p.x,p.y),field=area?.tags.landuse!=='residential';
      const aggressive=field&&distance(p,w.spawn)>430&&random()>.52,kind=aggressive?(random()>.7?'warden':'boar'):(random()>.45?'badger':'goose'),def=ARCHETYPES[kind];
      const slot=list.length,id=10000+(cy*Math.ceil(w.width/C)+cx)*2+slot,e=makeEnemy(p,id,{...def,campId:'field-'+key,ambient:true,cellKey:key,archetype:kind,anchor:{x:anchor.x,y:anchor.y},roamWait:random()*4});
      e.spawnPoints=[{...p}];for(let i=0;i<8&&e.spawnPoints.length<4;i++){const dest={x:Math.round(p.x+(random()-.5)*155),y:Math.round(p.y+(random()-.5)*155)};if(inhabitable(w,dest)&&walkClear(w,p,dest,9))e.spawnPoints.push(dest);}
      if(distance(p,g.player)<ENCOUNTER_RULES.spawnDistance){e.hp=0;e.respawnAt=g.time;e.dead=0;e.ai='waiting';}else{e.spawnGrace=ENCOUNTER_RULES.spawnGrace;e.ai='appearing';}
      list.push(e);
    }this.cells.set(key,list);return list;
  }
  tick(dt){if(!this.enabled)return;const g=this.game,w=this.world,C=ENCOUNTER_RULES.cellSize,cx=Math.floor(g.player.x/C),cy=Math.floor(g.player.y/C),key=cx+','+cy;this.clock-=dt;
    if(key!==this.key||this.clock<=0){this.key=key;this.clock=.6;const cells=[];for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){if(x<0||y<0||x*C>=w.width||y*C>=w.height)continue;cells.push({x,y,d:Math.hypot(x-cx,y-cy)});}cells.sort((a,b)=>a.d-b.d);const active=new Set(g.enemies.map(e=>e.id));this.queue=cells.filter(c=>!this.cells.has(c.x+','+c.y)||this.cells.get(c.x+','+c.y).some(e=>!active.has(e.id)));
      g.enemies=g.enemies.filter(e=>!e.ambient||e.aggro||e.ai==='returning'||e===g.target||distance(e,g.player)<ENCOUNTER_RULES.unloadDistance);
    }
    // Only one new habitat per frame: population construction never monopolizes movement.
    const cell=this.queue.shift();if(cell){const list=this.buildCell(cell.x,cell.y),active=new Set(g.enemies.map(e=>e.id));for(const e of list)if(!active.has(e.id))g.enemies.push(e);}
  }
  report(){const list=[...this.cells.values()].flat();return {cells:this.cells.size,total:list.length,active:this.game.enemies.filter(e=>e.ambient).length,neutral:list.filter(e=>e.behavior==='neutral').length,aggressive:list.filter(e=>e.behavior==='aggressive').length};}
}

export function beginReturn(g,e){e.aggro=false;e.ai='returning';e.cast=null;e.mark=0;e.slow=1;e.vulnerable=0;e.stun=0;e.returnTime=0;e.returnPath=g.world.findPath(e,e.home);e.roamGoal=null;e.chasePath=[];if(g.target===e)g.toast(e.name+' hat die Schnauze voll und zieht ab.');}
export function moveAlong(g,e,path,speed,dt){const target=path[0];if(!target)return false;const d=distance(e,target);if(d<3){path.shift();return true;}const step=Math.min(d,speed*dt),before={x:e.x,y:e.y};g.move(e,(target.x-e.x)/d*step,(target.y-e.y)/d*step);e.facing=target.x>e.x?1:-1;e.moving=distance(before,e)>.01;return e.moving;}
export function idleEnemy(g,e,dt){const w=g.world;
  if(e.ai==='returning'){e.returnTime+=dt;if(distance(e,e.home)<7){e.hp=e.maxHp;e.ai='roaming';e.spawnGrace=1;e.roamWait=3;e.attackTimer=1.8;e.cycle=0;return;}
    if(!moveAlong(g,e,e.returnPath,125,dt)&&e.returnTime>1){e.returnPath=w.findPath(e,e.home);if(e.returnTime>10&&distance(e,g.player)>ENCOUNTER_RULES.spawnDistance)g.resetEnemy(e);}return;
  }
  if(e.spawnGrace>0){e.ai='appearing';return;}e.ai='roaming';
  if(e.behavior==='neutral'&&distance(e,g.player)<30){e.facing=g.player.x>e.x?1:-1;return;}
  e.roamWait-=dt;if(e.roamWait>0)return;
  if(e.roamGoal){const path=[e.roamGoal];if(!moveAlong(g,e,path,e.type==='boss'?14:e.behavior==='neutral'?22:28,dt)||!path.length){e.roamGoal=null;e.roamWait=1.5+g.random()*3;}return;}
  for(let i=0;i<8;i++){const a=g.random()*Math.PI*2,r=20+g.random()*e.roamRadius,p={x:e.home.x+Math.cos(a)*r,y:e.home.y+Math.sin(a)*r};if(w.blocked(p.x,p.y,9)||inSanctuary(w,p)||(w.nodes?.length&&!inhabitable(w,p))||!walkClear(w,e,p,9))continue;e.roamGoal=p;break;}if(!e.roamGoal)e.roamWait=2;
}
export function tryRespawn(g,e){if(e.respawnAt>g.time)return false;const points=e.spawnPoints||[e.home];const order=points.map((_,i)=>points[(i+e.spawnCount+1)%points.length]);const spot=order.find(p=>distance(p,g.player)>ENCOUNTER_RULES.spawnDistance&&!g.world.blocked(p.x,p.y,9)&&!g.enemies.some(other=>other!==e&&other.hp>0&&distance(other,p)<32));if(!spot)return false;e.home={...spot};g.resetEnemy(e);e.spawnCount++;e.ai='appearing';e.spawnGrace=ENCOUNTER_RULES.spawnGrace;e.dead=0;return true;}
