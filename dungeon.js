// Dungeons als Instanz im Client (Plan: docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md, Abschnitte 9 und 10). Daten: content/dungeons.js.
// Für die Dauer des Besuchs ersetzt eine Dungeon-Welt die Dorfwelt: sie überschreibt nur die Geometrie (blocked, lineClear,
// walkClear, findPath, findClear) und erbt alles andere. Die Gegnerliste wechselt mit. Kampf, Söldner, Zauber und Beute laufen
// damit unverändert; `g.instance` schaltet wie beim Kiosk Reiten, Berufe und die Online-Anwesenheit ab.
import {DUNGEONS,DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_TEXT as T,DUNGEON_SCALE as U,ENEMY_AUTOS,COMBAT_RULES} from './content/index.js';
import {makeEnemy} from './encounters.js';
import {autoLootBag} from './rpg.js';
import {hitCompanion} from './companions.js';
import {TANK_SPECS} from './net-world.js';

const FLOOR_ORDER=['e0','k1','k2']; // Schutz-Specs: TANK_SPECS aus net-world.js (E-71: aus der Rolle „Tank“)
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
let serial=900000;

export const inDungeon=g=>g?.instance?.kind==='dungeon';
export const dungeonRun=g=>inDungeon(g)?g.instance.run:null;
export const toWorld=(def,floor,x,y)=>{const o=def.floors[floor].origin;return {x:o.x+x*U,y:o.y+y*U};};
export const rectWorld=(def,floor,[x,y,w,h])=>{const o=def.floors[floor].origin;return {x:o.x+x*U,y:o.y+y*U,w:w*U,h:h*U};};
const inRect=(r,x,y)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;

/** Ebene an einer Weltposition (oder null, außerhalb jeder Ebene). */
export function floorAt(def,x,y){for(const [id,f] of Object.entries(def.floors)){const o=f.origin;if(x>=o.x-40&&x<=o.x+f.size[0]*U+40&&y>=o.y-40&&y<=o.y+f.size[1]*U+40)return id;}return null;}
export function roomAt(def,x,y){const floor=floorAt(def,x,y);return floor&&def.rooms.find(r=>r.floor===floor&&r.rects.some(q=>inRect(rectWorld(def,floor,q),x,y)))||null;}

/** Tür offen? arena: zu, solange der Boss dieses Raums kämpft; lock.boss: offen nach dem Boss; lock.seals: alle Siegel. */
export function doorOpen(run,door){
 if(door.arena&&run.arena===door.arena)return false;
 const l=door.lock;if(!l)return true;
 if(l.boss)return run.killed.has(l.boss);
 if(l.seals)return l.seals.every(s=>run.seals.has(s));
 return true;
}
export function walkRects(run,floor){
 if(run.walkVersion!==run.version){run.walkCache={};run.walkVersion=run.version;}
 return run.walkCache[floor]||(run.walkCache[floor]=[
  ...run.def.rooms.filter(r=>r.floor===floor).flatMap(r=>r.rects.map(q=>rectWorld(run.def,floor,q))),
  ...run.def.doors.filter(d=>d.floor===floor&&doorOpen(run,d)).map(d=>rectWorld(run.def,floor,d.rect))]);
}

/** Dungeon-Welt: erbt von der Dorfwelt, überschreibt die Geometrie. */
export function dungeonWorld(outside,run){
 const w=Object.create(outside),def=run.def;
 const ok=(rects,x,y)=>{for(const r of rects)if(inRect(r,x,y))return true;return false;};
 w.blocked=(x,y,r=5)=>{const f=floorAt(def,x,y);if(!f||!Number.isFinite(x)||!Number.isFinite(y))return true;const rs=walkRects(run,f);return !(ok(rs,x,y)&&ok(rs,x-r,y)&&ok(rs,x+r,y)&&ok(rs,x,y-r)&&ok(rs,x,y+r));};
 w.walkClear=(a,b,r=7)=>{const f=floorAt(def,a.x,a.y);if(!f||floorAt(def,b.x,b.y)!==f)return false;const n=Math.max(1,Math.ceil(dist(a,b)/5));for(let i=0;i<=n;i++)if(w.blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r))return false;return true;};
 w.lineClear=(a,b)=>w.walkClear(a,b,0);
 w.findClear=(x,y,r=9)=>{if(!w.blocked(x,y,r))return {x,y};for(let d=6;d<=240;d+=6)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:x+Math.cos(a)*d,y:y+Math.sin(a)*d};if(!w.blocked(q.x,q.y,r))return q;}return {x,y};};
 w.findPath=(start,end)=>findPath(w,start,end);
 w.nearestRoad=()=>({road:null,distance:Infinity});
 w.dungeon=run.id;
 return w;
}
function findPath(w,start,end){
 if(w.blocked(end.x,end.y,7))return [];
 const step=12,key=p=>Math.round(p.x/step)+','+Math.round(p.y/step),seed={x:Math.round(start.x/step)*step,y:Math.round(start.y/step)*step};
 const from=w.walkClear(start,seed,5)?seed:start;const queue=[from],prev=new Map([[key(from),null]]),points=new Map([[key(from),from]]);let last=null;
 for(let i=0;i<queue.length&&i<2600;i++){const p=queue[i];if(w.walkClear(p,end,6)){last=p;break;}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx*step,y:p.y+dy*step},k=key(q);if(prev.has(k)||!w.walkClear(p,q,6))continue;prev.set(k,key(p));points.set(k,q);queue.push(q);}}
 if(!last)return [];const path=[{...end}];for(let k=key(last);k;k=prev.get(k))path.unshift(points.get(k));
 let at=start;const out=[];while(path.length){let i=path.length-1;while(i>0&&!w.walkClear(at,path[i],6))i--;at=path[i];out.push(at);path.splice(0,i+1);}return out;
}

// ── Spielstand ────────────────────────────────────────────────────────────────────────────────────────────────
/** Dauerhafte Daten je Dungeon (im Spielstand): Abschlüsse, einmal besiegte Bosse, gefundene Geheimnisse. */
export function normalizeDungeons(raw){
 const out={};for(const id of Object.keys(DUNGEONS)){const r=raw?.[id]||{};const def=DUNGEONS[id];
  out[id]={clears:Math.max(0,r.clears|0),bosses:(Array.isArray(r.bosses)?r.bosses:[]).filter(b=>def.bosses.some(x=>x.id===b)),
   secrets:(Array.isArray(r.secrets)?r.secrets:[]).filter(s=>def.secrets.some(x=>x.id===s)),firstClear:Number(r.firstClear)||0};}
 return out;
}
const record=(g,id)=>(g.dungeons||(g.dungeons=normalizeDungeons(null)))[id];

// ── Eingang draußen ───────────────────────────────────────────────────────────────────────────────────────────
const entranceCache=new WeakMap();
/** Eingang in der Dorfwelt: an der ersten gefundenen Straße aus den Daten, seitlich versetzt auf freiem Grund. */
export function entranceFor(world,id){
 let m=entranceCache.get(world);if(!m)entranceCache.set(world,m={});if(id in m)return m[id];
 const e=DUNGEONS[id].entrance;let point=null;
 for(const name of e.streets){
  const road=(world.roads||[]).filter(r=>r.tags?.name===name&&r.points?.length>1).sort((a,b)=>b.points.length-a.points.length)[0];if(!road)continue;
  const i=Math.floor(road.points.length/2),a=road.points[Math.max(0,i-1)],b=road.points[Math.min(road.points.length-1,i+1)],mid=road.points[i],len=Math.hypot(b.x-a.x,b.y-a.y)||1;
  for(const side of [1,-1]){const q={x:mid.x-(b.y-a.y)/len*e.offset*side,y:mid.y+(b.x-a.x)/len*e.offset*side},c=world.findClear?world.findClear(q.x,q.y,9):q;if(c&&Math.hypot(c.x-q.x,c.y-q.y)<60){point={x:c.x,y:c.y,street:name,id};break;}}
  if(point)break;
 }
 if(!point&&world.spawn)point={x:world.spawn.x+240,y:world.spawn.y+120,street:null,id};
 return m[id]=point;
}
export const dungeonEntrance=(g,id='schloss-bigb')=>entranceFor(inDungeon(g)?g.instance.outside.world:g.world,id);

// ── Durchgang ─────────────────────────────────────────────────────────────────────────────────────────────────
function createEnemy(g,run,kind,def,at){
 const e=makeEnemy(at,++serial,{type:def.type,skin:def.skin,name:def.name,family:def.family,hp:def.hp,level:def.level,behavior:def.behavior||'aggressive',
  aggroRange:def.aggroRange,roamRadius:def.roamRadius,speed:def.speed,respawn:[1e9,1e9],castSet:def.castSet,damage:def.damage||1,elite:!!def.elite,leash:def.leash||280});
 if(def.auto&&ENEMY_AUTOS[def.auto])e.autoAttack=ENEMY_AUTOS[def.auto];
 return Object.assign(e,{variant:def.art,dungeon:run.id,dungeonKind:kind,baseCastSet:def.castSet,title:def.title,cardboard:!!def.cardboard,spawnGrace:0});
}
function spawnEnemies(g,run){
 const def=run.def,list=[],geo=dungeonWorld({},run); // Geometrie zum Freirücken: jede Spawn-Stelle landet auf begehbarem Boden
 for(const pack of def.packs){
  const room=def.rooms.find(r=>r.id===pack.room),n=pack.members.length,center=toWorld(def,room.floor,...pack.at);
  pack.members.forEach((kind,j)=>{const d=DUNGEON_ENEMIES[kind];if(!d)return;const a=j/n*Math.PI*2,rad=n>1?(n>4?2.6:1.7):0;
   const raw=toWorld(def,room.floor,pack.at[0]+Math.cos(a)*rad,pack.at[1]+Math.sin(a)*rad),at=geo.findClear(raw.x,raw.y,7),e=createEnemy(g,run,kind,d,at);
   if(pack.patrol){e.patrol={points:pack.patrol.map(([x,y])=>toWorld(def,room.floor,x,y)),i:1,dx:at.x-center.x,dy:at.y-center.y};e.roamRadius=0;}
   list.push(e);});
 }
 for(const b of def.bosses){const d=DUNGEON_BOSSES[b.id];if(!d)continue;if(b.rare&&g.random()>b.rare)continue;
  const room=def.rooms.find(r=>r.id===b.room),spot=toWorld(def,room.floor,...b.at),e=createEnemy(g,run,b.id,d,geo.findClear(spot.x,spot.y,9));
  Object.assign(e,{type:'boss',bossId:b.id,dungeonBoss:b});list.push(e);}
 return list;
}
function createRun(g,id){
 const def=DUNGEONS[id];
 const run={id,def,version:0,killed:new Set(),seals:new Set(),secrets:new Set(record(g,id).secrets),unlocked:new Set(),heard:new Set(),visited:new Set(),
  room:null,arena:null,checkpoint:{floor:def.start.floor,x:def.start.x,y:def.start.y,room:null},startedAt:g.time};
 run.enemies=spawnEnemies(g,run);return run;
}
function stop(g){g.stopAuto?.();g.keys?.clear();g.touchMove=null;g.moveTo=null;g.path=[];g.routeGoal=null;g.target=null;g.aiming=null;g.aimPoint=null;g.casting=null;
 const p=g.player;p.vx=p.vy=0;p.moving=false;p.attack=p.dash=p.hurt=p.castPose=0;}
function place(g,at){const p=g.player,c=g.world.findClear(at.x,at.y,9);p.x=c.x;p.y=c.y;}

/** Betreten am Rolltor. force: ohne Stufen- und Abstandsprüfung (Admin, Tests). */
export function enterDungeon(g,id='schloss-bigb',{force=false}={}){
 const def=DUNGEONS[id];if(!def||g.instance)return false;
 if(g.dead||g.paused||g.player.inCombat>0||g.casting){g.toast?.(T.busy);return false;}
 if(!force&&g.player.level<def.level.enter){g.toast?.(T.tooLow(def.level.enter));return false;}
 const door=entranceFor(g.world,id);
 if(!force&&(!door||dist(g.player,door)>def.entrance.range))return false;
 g.dismount?.();stop(g);
 const kept=g.dungeonRuns?.[id],run=kept&&g.time-kept.leftAt<def.resetAfter?kept.run:createRun(g,id);if(g.dungeonRuns)delete g.dungeonRuns[id];
 const outside={world:g.world,enemies:g.enemies};
 g.instance={id,kind:'dungeon',run,outside,outsidePosition:{x:(door||g.player).x,y:(door||g.player).y,facing:g.player.facing||1},time:0};
 g.world=dungeonWorld(outside.world,run);g.enemies=run.enemies;g.zones=[];g.fields=[];g.fx=[];g.texts=[];run.room=null;
 const at=run.checkpoint;place(g,toWorld(def,at.floor,at.x,at.y));
 g.emit?.('instanceChanged');g.toast?.(T.welcome);g.log?.(T.welcome);return true;
}
/** Verlassen am Rolltor (force: überall, z. B. Neustart). Liegengebliebene Beute wird eingesammelt. */
export function leaveDungeon(g,{force=false}={}){
 const run=dungeonRun(g);if(!run)return false;
 const exit=toWorld(run.def,run.def.exit.floor,run.def.exit.x,run.def.exit.y);
 if(!force&&(floorAt(run.def,g.player.x,g.player.y)!==run.def.exit.floor||dist(g.player,exit)>4*U))return false;
 const bags=g.rpg.loot.filter(b=>floorAt(run.def,b.x,b.y));for(const b of bags)autoLootBag(g,b);if(bags.length)g.toast?.(T.lootGathered(bags.length));
 stop(g);const o=g.instance.outside,pos=g.instance.outsidePosition;
 g.world=o.world;g.enemies=o.enemies;g.zones=[];g.fields=[];g.fx=[];g.texts=[];
 (g.dungeonRuns||(g.dungeonRuns={}))[run.id]={run,leftAt:g.time};
 g.instance=null;Object.assign(g.player,{x:pos.x,y:pos.y,facing:pos.facing||1});
 g.emit?.('instanceChanged');g.emit?.('save');g.toast?.(T.outside);return true;
}

// ── Interaktion: Ausgang, Übergänge, Geheimnisse; draußen der Eingang ─────────────────────────────────────────
const floorIndex=f=>FLOOR_ORDER.indexOf(f);
export function stepLabel(t,side){
 const from=t[side],to=t[side==='a'?'b':'a'];
 if(t.kind==='ladder')return T.step.ladder+' · '+T.ladder[side];
 return T.step[t.kind]+' · '+(floorIndex(to.floor)<floorIndex(from.floor)?T.up:T.down)+' '+T.floorTo[to.floor];
}
export function dungeonInteraction(g){
 const run=dungeonRun(g);if(!run)return null;const def=run.def,p=g.player,f=floorAt(def,p.x,p.y),near=(pt,r)=>dist(p,pt)<=r*U;
 const exit=toWorld(def,def.exit.floor,def.exit.x,def.exit.y);
 if(f===def.exit.floor&&near(exit,3.5))return {kind:'dungeonLeave',point:exit,name:T.leave,priority:0};
 for(const s of def.secrets){if(s.floor!==f||run.secrets.has(s.id))continue;const pt=toWorld(def,s.floor,s.x,s.y);if(near(pt,s.range))return {kind:'dungeonSecret',id:s.id,point:pt,name:T.secretUse[s.id],priority:0};}
 for(const t of def.transitions)for(const side of ['a','b']){const s=t[side];if(s.floor!==f)continue;const pt=toWorld(def,s.floor,s.x,s.y);if(!near(pt,3))continue;
  if(t.secret&&!run.secrets.has(t.secret))continue;if(t.oneWay&&t.oneWay!==side)continue;
  return {kind:'dungeonStep',id:t.id,side,point:pt,name:stepLabel(t,side),priority:0};}
 return null;
}
export function dungeonDoorInteraction(g){
 if(g.instance)return null;const door=dungeonEntrance(g);if(!door)return null;
 return dist(g.player,door)<=DUNGEONS[door.id].entrance.range?{kind:'dungeonEnter',id:door.id,point:{x:door.x,y:door.y},name:T.entranceName,priority:3}:null;
}
export function dungeonStep(g,id,side){
 const run=dungeonRun(g);if(!run)return false;const t=run.def.transitions.find(x=>x.id===id);if(!t||!t[side])return false;
 const to=t[side==='a'?'b':'a'];
 if(g.player.inCombat>0||g.dead){g.toast?.(T.busy);return false;}
 if(t.oneWay&&t.oneWay!==side){g.toast?.(T.locked.oneWay);return false;}
 if(t.secret&&!run.secrets.has(t.secret)){g.toast?.(T.locked.secret);return false;}
 if(t.gate?.boss&&t.gate.side===side&&!run.killed.has(t.gate.boss)){g.toast?.(T.locked.gate);return false;}
 if(t.unlock&&!run.unlocked.has(t.id)){if(side!==t.unlock){g.toast?.(T.locked.lift);return false;}run.unlocked.add(t.id);g.toast?.(T.unlocked.lift);}
 stop(g);place(g,toWorld(run.def,to.floor,to.x,to.y));g.emit?.('dungeonFloor',{floor:to.floor});return true;
}
export function dungeonSecret(g,id){
 const run=dungeonRun(g),s=run?.def.secrets.find(x=>x.id===id);if(!s||run.secrets.has(id))return false;
 run.secrets.add(id);run.version++;const rec=record(g,run.id);if(!rec.secrets.includes(id))rec.secrets.push(id);
 g.toast?.(T.unlocked[id]||'');g.emit?.('dungeonSecret',{id});g.emit?.('save');return true;
}

// ── Takt ──────────────────────────────────────────────────────────────────────────────────────────────────────
function announce(g,line){if(!line)return;g.toast?.(T.speaker+': „'+line+'"');g.log?.(T.speaker+': „'+line+'"');g.emit?.('dungeonAnnounce',{line});}
function nudgeInto(g,run,roomId){
 const room=run.def.rooms.find(r=>r.id===roomId);if(!room)return;const r=rectWorld(run.def,room.floor,room.rects[0]);
 for(const u of [g.player,...(g.companions||[])]){if(!u||!g.world.blocked(u.x,u.y,5))continue;const x=Math.min(r.x+r.w-12,Math.max(r.x+12,u.x)),y=Math.min(r.y+r.h-12,Math.max(r.y+12,u.y));u.x=x;u.y=y;}
}
function walkPatrol(g,e,dt){
 const pt=e.patrol.points[e.patrol.i],goal={x:pt.x+e.patrol.dx,y:pt.y+e.patrol.dy},d=dist(e,goal);
 if(d<8){e.patrol.i=(e.patrol.i+1)%e.patrol.points.length;return;}
 const step=Math.min(d,e.speed*.45*dt);g.move(e,(goal.x-e.x)/d*step,(goal.y-e.y)/d*step);e.moving=true;e.facing=goal.x<e.x?-1:1;e.home={x:e.x,y:e.y};e.roamGoal=null;
}
export function tickDungeon(g,dt){
 const run=dungeonRun(g);if(!run)return;g.instance.time+=dt;const p=g.player,def=run.def;
 const room=roomAt(def,p.x,p.y);
 if(room&&room.id!==run.room){run.room=room.id;const first=!run.visited.has(room.id);run.visited.add(room.id);
  if(room.checkpoint)run.checkpoint={floor:room.floor,x:room.checkpoint.x,y:room.checkpoint.y,room:room.id};
  g.emit?.('dungeonRoom',{room,first});if(first)g.toast?.(room.sign+' · '+room.truth);}
 const floor=floorAt(def,p.x,p.y);
 for(const a of def.announcements){if(run.heard.has(a.id))continue;const hit=a.room?run.room===a.room:floor===a.floor&&dist(p,toWorld(def,a.floor,a.x,a.y))<a.range*U;if(hit){run.heard.add(a.id);announce(g,T.announce[a.id]);}}
 // Arena: Türen zu, solange ein Boss kämpft
 let arena=null;for(const e of g.enemies)if(e.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat'){arena=e.dungeonBoss.room;break;}
 if(arena!==run.arena){const was=run.arena;run.arena=arena;run.version++;if(arena){nudgeInto(g,run,arena);g.toast?.(T.arenaClosed);}else if(was)g.toast?.(T.arenaOpen);}
 for(const e of g.enemies){
  if(e.frontGuard>0)e.frontGuard=Math.max(0,e.frontGuard-dt);
  if(e.patrol&&e.hp>0&&!e.aggro&&e.ai==='roaming')walkPatrol(g,e,dt);
  // Boss zurückgesetzt (Rückzug oder Gruppentod): Phasen und Zyklus von vorn
  if(e.dungeonBoss&&!e.aggro&&e.hp>=e.maxHp&&(e.saidPhases?.size||e.engaged)){e.saidPhases=null;e.engaged=false;e.castSet=e.baseCastSet;e.cycle=0;}
 }
 // Adds verschwinden, wenn ihr Boss zurückgesetzt wurde
 for(let i=g.enemies.length-1;i>=0;i--){const e=g.enemies[i];if(e.summoner&&e.summoner.hp>0&&!e.summoner.aggro)g.enemies.splice(i,1);}
}
/** Gruppentod im Dungeon: am letzten Kontrollpunkt aufstehen (engine.respawn setzt vorher die Gegner zurück). */
export function dungeonRespawn(g){
 const run=dungeonRun(g);if(!run)return;const c=run.checkpoint;place(g,toWorld(run.def,c.floor,c.x,c.y));
 const room=run.def.rooms.find(r=>r.id===c.room);g.toast?.(T.wipe(room?.sign||run.def.rooms[0].sign));
}

// ── Kampf: Boss-Phasen, Adds, neue Zaubermerkmale ─────────────────────────────────────────────────────────────
function summon(g,boss,{kind,count}){
 const d=DUNGEON_ENEMIES[kind];if(!d)return;const run=dungeonRun(g);if(!run)return;
 for(let i=0;i<count;i++){const a=g.random()*Math.PI*2,q=g.world.findClear(boss.x+Math.cos(a)*70,boss.y+Math.sin(a)*70,9),e=createEnemy(g,run,kind,d,q);
  Object.assign(e,{summoner:boss,aggro:true,ai:'combat',attackTimer:COMBAT_RULES.firstSpecial,spawnGrace:.6});g.enemies.push(e);}
}
/** Vor jedem Zauber eines Dungeon-Bosses: Eröffnungsspruch, Phasen (Spruch, neuer Zyklus, Adds). */
export function dungeonBossCast(g,e){
 const def=DUNGEON_BOSSES[e.bossId];if(!def)return;const lines=T.bossLines[e.bossId]||{};
 if(!e.engaged){e.engaged=true;if(lines.engage)g.bark?.(e,lines.engage,'boss');}
 for(const ph of def.phases||[]){if(e.hp/e.maxHp>ph.at)continue;const said=e.saidPhases||(e.saidPhases=new Set());if(said.has(ph.at))continue;said.add(ph.at);
  const line=lines.phases?.[String(ph.at)];if(line)g.bark?.(e,line,'phase');if(ph.castSet){e.castSet=ph.castSet;e.cycle=0;}if(ph.summon)summon(g,e,ph.summon);}
}
const inCone=(e,c,u)=>{if(!u||dist(e,u)>c.cone.range)return false;return Math.abs(norm(Math.atan2(u.y-e.y,u.x-e.x)-(c.angle??0)))<=c.cone.angle*Math.PI/360;};
export const coneHits=inCone;
function knockback(g,e,amount){
 const p=g.player,d=dist(e,p)||1,steps=8;for(let i=0;i<steps;i++)g.move(p,(p.x-e.x)/d*amount/steps,(p.y-e.y)/d*amount/steps);
 const run=dungeonRun(g),fall=DUNGEON_BOSSES[e.bossId]?.fall;if(!run||!fall)return;
 const room=run.def.rooms.find(r=>r.id===e.dungeonBoss?.room);if(!room)return;
 if(inRect(rectWorld(run.def,room.floor,fall.rect),p.x,p.y)){stop(g);place(g,toWorld(run.def,fall.to.floor,fall.to.x,fall.to.y));g.toast?.(T.fell);}
}
/**
 * Zauberende mit Dungeon-Merkmalen. victim: 'player' (Ziel ist der Spieler) oder der Söldner, der die Bedrohung hält.
 * Gibt true zurück, wenn der Zauber hier vollständig abgehandelt wurde.
 */
export function resolveDungeonCast(g,e,c,victim='player'){
 const p=g.player,target=victim==='player'?p:victim;
 if(c.frontGuard){e.frontGuard=c.frontGuard.duration;e.frontFactor=c.frontGuard.factor;e.frontAngle=Math.atan2(target.y-e.y,target.x-e.x);g.float?.(e.x,e.y-44,'SCHILDWALL','#e8dcc0');return true;}
 if(c.healAllies){for(const o of g.enemies)if(o.hp>0&&dist(o,e)<=c.healAllies.range){const n=Math.round(o.maxHp*c.healAllies.share);o.hp=Math.min(o.maxHp,o.hp+n);g.float?.(o.x,o.y-36,'+'+n,'#9ed17a');}return true;}
 if(c.cone){
  if(!g.dead&&inCone(e,c,p)){const guard=victim==='player'&&(TANK_SPECS.includes(g.rpg?.talents?.spec)||p.parry>0);g.hitPlayer(e,Math.round(c.damage*(guard?c.tankSafe??1:1)));if(c.knockback&&!guard&&!g.dead)knockback(g,e,c.knockback);}
  for(const o of g.companions||[])if(o.state!=='down'&&o.hp>0&&inCone(e,c,o))hitCompanion(g,e,o,Math.round(c.damage*(o===victim?c.tankSafe??1:1)));
  return true;
 }
 if(c.callHelp){
  if(victim==='player'){if(dist(e,p)<230&&g.world.lineClear(e,p))g.hitPlayer(e,c.damage);}else if(dist(e,victim)<230)hitCompanion(g,e,victim,c.damage);
  let called=0;for(const o of g.enemies)if(o!==e&&o.hp>0&&!o.aggro&&!o.cardboard&&o.behavior==='aggressive'&&dist(o,e)<=c.callHelp.range){o.aggro=true;o.ai='combat';o.attackTimer=COMBAT_RULES.firstSpecial;called++;}
  if(called)g.float?.(e.x,e.y-44,'VERSTÄRKUNG','#f0b070');
  return true;
 }
 return false;
}
/** Schadensfaktor gegen Dungeon-Gegner (Schildwall: Treffer von vorn gedämpft). */
export function dungeonDamageFactor(g,e){
 if(!(e.frontGuard>0))return 1;const a=Math.atan2(g.player.y-e.y,g.player.x-e.x);return Math.abs(norm(a-(e.frontAngle??0)))<Math.PI/3?e.frontFactor??1:1;
}
/** Kill eines Dungeon-Gegners: kein Wiederkommen, Pappe fällt, Boss gibt Siegel. */
export function onDungeonKill(g,e){
 e.respawnAt=Infinity;const run=dungeonRun(g);
 if(e.cardboard){g.float?.(e.x,e.y-30,'PAPPE','#e8dcc0');const lines=T.cardboard;g.toast?.(lines[Math.floor(g.random()*lines.length)]);}
 if(!e.dungeonBoss||!run)return;const b=e.dungeonBoss;run.killed.add(b.id);run.version++;
 if(b.seal){run.seals.add(b.seal);g.toast?.(T.seal[b.seal]);}
 const rec=record(g,run.id);if(!rec.bosses.includes(b.id))rec.bosses.push(b.id);
 const line=T.bossLines[b.id]?.defeat;if(line)g.bark?.(e,line,'boss');g.emit?.('dungeonBoss',{id:b.id});g.emit?.('save');
}
