// Dungeons als Instanz im Client (Plan: docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md, Abschnitte 9 und 10). Daten: content/dungeons.js.
// Für die Dauer des Besuchs ersetzt eine Dungeon-Welt die Dorfwelt: sie überschreibt nur die Geometrie (blocked, lineClear,
// walkClear, findPath, findClear) und erbt alles andere. Die Gegnerliste wechselt mit. Kampf, Söldner, Zauber und Beute laufen
// damit unverändert; `g.instance` schaltet wie beim Kiosk Reiten, Berufe und die Online-Anwesenheit ab.
// Etappe 1 „Gerd richtig" (E-71, 2026-09-25): Schaden als Anteil am Leben, Flächen auf Nicht-Tanks, Kegel enden an Wänden, Kante erst
// ab Phase 2, soziale Aggro nur im eigenen Pack, Tod des Helden als Geist mit Aufhelfen, Laufstand im Spielstand, Tagesstand,
// Schwierigkeitsfaktoren, Siegelmarken und Tagesbonus. Bericht: docs/DUNGEON-ETAPPE-1-2026-09-25.md.
import {DUNGEONS,DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_TEXT as T,DUNGEON_SCALE as U,DUNGEON_REWARDS as REWARDS,DUNGEON_FEATS as FEATS,ENEMY_AUTOS,COMBAT_RULES,COMPANION_RULES,BALANCE,DODGE_UI} from './content/index.js';
import {makeEnemy} from './encounters.js';
import {autoLootBag,ITEMS} from './rpg.js';
import {registerRoll} from './itemization.js';
import {hitCompanion,clearThreat} from './companions.js';
import {emitCombatFx} from './combat-fx.js';
import {TANK_SPECS} from './net-world.js';

const FLOOR_ORDER=['e0','k1','k2']; // Schutz-Specs: TANK_SPECS aus net-world.js (E-72: aus der Rolle „Tank“)
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

/** Siegel, die eine Tür wirklich verlangt (Etappe 3, E-71): nur die gebauter Bosse (lock.seals gegen DUNGEON_BOSSES gefiltert). Heute
 *  nur Gerds Siegel; sobald Exposé und Kurt in DUNGEON_BOSSES stehen (Etappe 4), greifen alle drei ohne Datenänderung. */
export const requiredSeals=(def,seals=[])=>seals.filter(s=>def.bosses.some(b=>b.seal===s&&DUNGEON_BOSSES[b.id]));
/** Tür offen? arena: zu, solange der Boss dieses Raums kämpft; lock.boss: offen nach dem Boss; lock.seals: alle verlangten Siegel. */
export function doorOpen(run,door){
 if(door.arena&&run.arena===door.arena)return false;
 const l=door.lock;if(!l)return true;
 if(l.boss)return run.killed.has(l.boss);
 if(l.seals)return requiredSeals(run.def,l.seals).every(s=>run.seals.has(s));
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
 // Ziel dicht an der Wand (Held vom Rausschmiss an die Wand gedrückt): nächster freier Punkt statt keinem Weg – sonst blieb Gerd stehen
 // und zauberte nie wieder (Befund Etappe 2, 2026-09-25).
 if(w.blocked(end.x,end.y,7)){const c=w.findClear(end.x,end.y,7);if(w.blocked(c.x,c.y,7))return [];end=c;}
 const step=12,key=p=>Math.round(p.x/step)+','+Math.round(p.y/step),seed={x:Math.round(start.x/step)*step,y:Math.round(start.y/step)*step};
 const from=w.walkClear(start,seed,5)?seed:start;const queue=[from],prev=new Map([[key(from),null]]),points=new Map([[key(from),from]]);let last=null;
 for(let i=0;i<queue.length&&i<2600;i++){const p=queue[i];if(w.walkClear(p,end,6)){last=p;break;}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx*step,y:p.y+dy*step},k=key(q);if(prev.has(k)||!w.walkClear(p,q,6))continue;prev.set(k,key(p));points.set(k,q);queue.push(q);}}
 if(!last)return [];const path=[{...end}];for(let k=key(last);k;k=prev.get(k))path.unshift(points.get(k));
 let at=start;const out=[];while(path.length){let i=path.length-1;while(i>0&&!w.walkClear(at,path[i],6))i--;at=path[i];out.push(at);path.splice(0,i+1);}return out;
}

// ── Spielstand ────────────────────────────────────────────────────────────────────────────────────────────────
/** Dauerhafte Daten je Dungeon (im Spielstand): Abschlüsse, einmal besiegte Bosse, gefundene Geheimnisse, Siegelmarken (E-71) und
 *  der Tagesstand `daily` (Flügel mit Tagesbonus, Siegel und Abkürzungen des Tages – Grundgerüst für die Flügel aus Etappe 4). */
export function normalizeDungeons(raw){
 const out={};for(const id of Object.keys(DUNGEONS)){const r=raw?.[id]||{};const def=DUNGEONS[id],arr=v=>Array.isArray(v)?v:[],d=r.daily||{};
  out[id]={clears:Math.max(0,r.clears|0),bosses:arr(r.bosses).filter(b=>def.bosses.some(x=>x.id===b)),
   secrets:arr(r.secrets).filter(s=>def.secrets.some(x=>x.id===s)),firstClear:Number(r.firstClear)||0,marks:Math.max(0,r.marks|0),
   /* Etappe 3: Bestzeit in Sekunden (Abschluss mit Big B) und Erfolge */best:Math.max(0,Math.round(Number(r.best)||0)),feats:arr(r.feats).filter(f=>FEATS[f]),
   daily:{day:typeof d.day==='string'?d.day:'',wings:arr(d.wings).filter(w=>(def.wings||[]).some(x=>x.id===w)),seals:arr(d.seals).filter(s=>def.bosses.some(b=>b.seal===s)),
    shortcuts:arr(d.shortcuts).filter(t=>def.transitions.some(x=>x.id===t)),
    /* Etappe 3: Siege je Boss am Tag (Farm-Lücke: Wiederholungen geben weniger EP) und erster Abschluss des Tages */
    kills:Object.fromEntries(Object.entries(d.kills&&typeof d.kills==='object'?d.kills:{}).filter(([b,n])=>def.bosses.some(x=>x.id===b)&&n>0).map(([b,n])=>[b,Math.min(99,n|0)])),final:!!d.final}};}
 return out;
}
const record=(g,id)=>(g.dungeons||(g.dungeons=normalizeDungeons(null)))[id];
/** Wanduhr in Millisekunden; Tests setzen g.clock. */
const clock=g=>typeof g.clock==='function'?g.clock():Date.now();
/** Spieltag des Dungeons (Ortszeit; wechselt um resetHour Uhr, E-71 resetAt:'daily'). */
export function dungeonDay(g,id='schloss-bigb'){const d=new Date(clock(g)-(DUNGEONS[id].resetHour||0)*3600e3),two=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate());}
/** Tagesstand eines Dungeons; an einem neuen Tag ist er leer (Siegel, Abkürzungen und Tagesbonus beginnen von vorn). */
export function dungeonToday(g,id='schloss-bigb'){const rec=record(g,id),day=dungeonDay(g,id);if(rec.daily.day!==day)rec.daily={day,wings:[],seals:[],shortcuts:[],kills:{},final:false};rec.daily.kills||={};return rec.daily;}

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
/** Faktoren der Schwierigkeitsstufe des Durchgangs (E-71: jetzt nur Normal). */
export const difficultyOf=run=>run?.def?.difficulty?.[run.difficulty]||{hp:1,damage:1};
function createEnemy(g,run,kind,def,at){
 const diff=difficultyOf(run);
 const e=makeEnemy(at,++serial,{type:def.type,skin:def.skin,name:def.name,family:def.family,hp:Math.max(1,Math.round(def.hp*diff.hp)),level:def.level,behavior:def.behavior||'aggressive',
  aggroRange:def.aggroRange,roamRadius:def.roamRadius,speed:def.speed,respawn:[1e9,1e9],castSet:def.castSet,damage:(def.damage||1)*diff.damage,elite:!!def.elite,leash:def.leash||280});
 if(def.auto&&ENEMY_AUTOS[def.auto])e.autoAttack=ENEMY_AUTOS[def.auto];
 return Object.assign(e,{variant:def.art,dungeon:run.id,dungeonKind:kind,baseCastSet:def.castSet,title:def.title,cardboard:!!def.cardboard,spawnGrace:0,
  ...(def.xp!=null?{xp:def.xp}:{}),lootMoment:!!def.lootMoment,pctFactor:diff.damage,
  /* Etappe 3: Grundschaden (Wut und Reichweite rechnen darauf), Vorrang für Söldner („Adds zuerst“), Tönung der geliehenen Figur */baseDamage:e.damage,priority:!!def.priority,noLoot:!!def.noLoot,...(def.tint?{tint:def.tint}:{})});
}
/** Im Laufstand schon gelegt (Neuladen, E-71): liegt von Anfang an, ohne Leiche und ohne Beute. */
const laid=e=>Object.assign(e,{hp:0,aggro:false,ai:'dead',respawnAt:Infinity,dead:Infinity});
function spawnEnemies(g,run){
 const def=run.def,list=[],geo=dungeonWorld({},run); // Geometrie zum Freirücken: jede Spawn-Stelle landet auf begehbarem Boden
 for(const pack of def.packs){
  const room=def.rooms.find(r=>r.id===pack.room),n=pack.members.length,center=toWorld(def,room.floor,...pack.at),cleared=run.trash.has(pack.id);
  pack.members.forEach((kind,j)=>{const d=DUNGEON_ENEMIES[kind];if(!d)return;const a=j/n*Math.PI*2,rad=n>1?(n>4?2.6:1.7):0;
   const raw=toWorld(def,room.floor,pack.at[0]+Math.cos(a)*rad,pack.at[1]+Math.sin(a)*rad),at=geo.findClear(raw.x,raw.y,7),e=createEnemy(g,run,kind,d,at);e.pack=pack.id;
   if(pack.patrol){e.patrol={points:pack.patrol.map(([x,y])=>toWorld(def,room.floor,x,y)),i:1,dx:at.x-center.x,dy:at.y-center.y};e.roamRadius=0;}
   if(cleared)laid(e);list.push(e);});
 }
 for(const b of def.bosses){const d=DUNGEON_BOSSES[b.id];if(!d)continue;if(b.rare&&!run.killed.has(b.id)&&g.random()>b.rare)continue;
  const room=def.rooms.find(r=>r.id===b.room),spot=toWorld(def,room.floor,...b.at),e=createEnemy(g,run,b.id,d,geo.findClear(spot.x,spot.y,9));
  Object.assign(e,{type:'boss',bossId:b.id,dungeonBoss:b});if(run.killed.has(b.id))laid(e);list.push(e);}
 return list;
}
const validCheckpoint=(def,c)=>c&&def.floors[c.floor]&&Number.isFinite(c.x)&&Number.isFinite(c.y)?{floor:c.floor,x:c.x,y:c.y,room:def.rooms.some(r=>r.id===c.room)?c.room:null}:null;
/** Neuer Durchgang; saved = Laufstand aus dem Spielstand (Neuladen). Siegel und Abkürzungen des Tages kommen immer mit (E-71). */
function createRun(g,id,saved=null){
 const def=DUNGEONS[id],today=dungeonToday(g,id),list=(k,ok)=>(Array.isArray(saved?.[k])?saved[k]:[]).filter(ok);
 const run={id,def,version:0,difficulty:def.difficulty?.[saved?.difficulty]?saved.difficulty:'normal',day:today.day,
  killed:new Set(list('killed',b=>def.bosses.some(x=>x.id===b))),seals:new Set([...list('seals',s=>def.bosses.some(b=>b.seal===s)),...today.seals]),
  secrets:new Set(record(g,id).secrets),unlocked:new Set([...list('unlocked',t=>def.transitions.some(x=>x.id===t)),...today.shortcuts]),
  trash:new Set(list('trash',p=>def.packs.some(x=>x.id===p))),heard:new Set(list('heard',a=>def.announcements.some(x=>x.id===a))),visited:new Set(list('visited',r=>def.rooms.some(x=>x.id===r))),
  room:null,arena:null,checkpoint:validCheckpoint(def,saved?.checkpoint)||{floor:def.start.floor,x:def.start.x,y:def.start.y,room:null},startedAt:Number(saved?.startedAt)||clock(g),ghost:null,
  /* Etappe 3: Beweise (Wirkung bei Big B, verteilt ab Etappe 4), Endtruhe geöffnet, liegende Trümmerfelder */evidence:new Set(list('evidence',x=>def.evidence?.ids?.includes(x))),chest:!!saved?.chest,hazards:[],elapsed:Math.max(0,Number(saved?.elapsed)||0)/* Spielzeit im Durchgang (Bestzeit) */};
 run.enemies=spawnEnemies(g,run);return run;
}
function stop(g){g.stopAuto?.();g.keys?.clear();g.touchMove=null;g.moveTo=null;g.path=[];g.routeGoal=null;g.target=null;g.aiming=null;g.aimPoint=null;g.casting=null;
 const p=g.player;p.vx=p.vy=0;p.moving=false;p.attack=p.dash=p.hurt=p.castPose=0;}
function place(g,at){const p=g.player,c=g.world.findClear(at.x,at.y,9);p.x=c.x;p.y=c.y;}

/** Betreten am Rolltor. force: ohne Stufen- und Abstandsprüfung (Admin, Tests, Neuladen). resume: Laufstand aus dem Spielstand. */
export function enterDungeon(g,id='schloss-bigb',{force=false,resume=false}={}){
 const def=DUNGEONS[id];if(!def||g.instance)return false;
 if(g.dead||g.paused||g.player.inCombat>0||g.casting){g.toast?.(T.busy);return false;}
 if(!force&&g.player.level<def.level.enter){g.toast?.(T.tooLow(def.level.enter));return false;}
 const door=entranceFor(g.world,id);
 if(!force&&(!door||dist(g.player,door)>def.entrance.range))return false;
 g.dismount?.();stop(g);
 const kept=g.dungeonRuns?.[id],run=kept&&g.time-kept.leftAt<def.resetAfter&&kept.run.day===dungeonDay(g,id)?kept.run:createRun(g,id);if(g.dungeonRuns)delete g.dungeonRuns[id];
 const outside={world:g.world,enemies:g.enemies};
 g.instance={id,kind:'dungeon',run,outside,outsidePosition:{x:(door||g.player).x,y:(door||g.player).y,facing:g.player.facing||1},time:0};
 g.world=dungeonWorld(outside.world,run);g.enemies=run.enemies;g.zones=[];g.fields=[];g.fx=[];g.texts=[];run.room=null;
 const at=run.checkpoint;place(g,toWorld(def,at.floor,at.x,at.y));
 /* Etappe 2 Text-Diät: der Willkommenssatz steht im Übergang (dungeon-entry.js) und im Chat, nicht als Kurzmeldung über dem Zonentitel.
    Etappe 1: nach dem Neuladen sagt eine Kurzmeldung, dass der Durchgang am Kontrollpunkt weiterläuft. */
 const resumed=resume&&run===kept?.run;g.emit?.('instanceChanged');if(resumed)g.toast?.(T.resumed);g.log?.(resumed?T.resumed:T.welcome);return true;
}
/** Verlassen am Rolltor (force: überall, z. B. Neustart). Liegengebliebene Beute wird eingesammelt (Boss-Beute ohne Anlegen). */
export function leaveDungeon(g,{force=false}={}){
 const run=dungeonRun(g);if(!run)return false;
 const exit=toWorld(run.def,run.def.exit.floor,run.def.exit.x,run.def.exit.y),back=run.def.backExit,backAt=back&&toWorld(run.def,back.floor,back.x,back.y);
 const atBack=!!back&&floorAt(run.def,g.player.x,g.player.y)===back.floor&&dist(g.player,backAt)<=back.range*U+8/* Etappe 3: Hinterausgang in der Schatzkammer */;
 if(!force&&!atBack&&(floorAt(run.def,g.player.x,g.player.y)!==run.def.exit.floor||dist(g.player,exit)>4*U))return false;
 const bags=g.rpg.loot.filter(b=>floorAt(run.def,b.x,b.y));for(const b of bags)autoLootBag(g,b);if(bags.length)g.toast?.(T.lootGathered(bags.length));
 stop(g);const o=g.instance.outside,pos=g.instance.outsidePosition;run.ghost=null;
 g.world=o.world;g.enemies=o.enemies;g.zones=[];g.fields=[];g.fx=[];g.texts=[];
 (g.dungeonRuns||(g.dungeonRuns={}))[run.id]={run,leftAt:g.time};
 g.instance=null;Object.assign(g.player,{x:pos.x,y:pos.y,facing:pos.facing||1});
 g.emit?.('instanceChanged');g.emit?.('save');g.log?.(T.outside);return true;
}
/** Laufstand für den Spielstand (E-71, Muster savedKiosk): der laufende Durchgang oder einer, der nach dem Verlassen noch nicht
 *  verfallen ist. Gespeichert werden Listen und Kontrollpunkt; die Gegner entstehen beim Laden neu, Gelegtes bleibt liegen. */
export function savedDungeonRun(g){
 const inside=dungeonRun(g),kept=inside?null:Object.values(g.dungeonRuns||{}).sort((a,b)=>b.leftAt-a.leftAt)[0],run=inside||kept?.run;if(!run)return null;
 return {id:run.id,inside:!!inside,difficulty:run.difficulty,day:run.day,startedAt:run.startedAt,savedAt:clock(g),leftAgo:inside?0:Math.max(0,Math.round(g.time-kept.leftAt)),
  killed:[...run.killed],seals:[...run.seals],secrets:[...run.secrets],visited:[...run.visited],unlocked:[...run.unlocked],trash:[...run.trash],heard:[...run.heard],checkpoint:{...run.checkpoint},
  evidence:[...(run.evidence||[])],chest:!!run.chest,elapsed:Math.round(run.elapsed||0)};
}
/** Laufstand beim Laden: verfallen (resetAfter nach dem Verlassen bzw. Speichern, Tageswechsel) → nichts; lief er beim Speichern,
 *  steht der Held wieder am letzten Kontrollpunkt im Dungeon (enterDungeon setzt fort). */
export function restoreDungeonRun(g,saved){
 const id=saved?.id,def=DUNGEONS[id];if(!def)return false;
 const now=clock(g),away=Math.max(0,Number(saved.leftAgo)||0)+Math.max(0,(now-(Number(saved.savedAt)||now))/1000);
 if(away>=def.resetAfter||saved.day!==dungeonDay(g,id))return false;
 const run=createRun(g,id,saved);(g.dungeonRuns||(g.dungeonRuns={}))[id]={run,leftAt:g.time-away};
 if(saved.inside)return enterDungeon(g,id,{force:true,resume:true});
 return true;
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
 /* Etappe 3: Endtruhe (nach Big B, einmal je Durchgang) und Hinterausgang in der Schatzkammer */
 const chest=def.chest;if(chest&&f===chest.floor&&run.killed.has(chest.boss)&&!run.chest){const pt=toWorld(def,chest.floor,chest.x,chest.y);if(near(pt,chest.range))return {kind:'dungeonChest',point:pt,name:T.chest.name,priority:0};}
 const back=def.backExit;if(back&&f===back.floor){const pt=toWorld(def,back.floor,back.x,back.y);if(near(pt,back.range))return {kind:'dungeonLeave',point:pt,name:T.backExit,priority:0};}
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
/** Held selbst im Kampf? Nur Gegner, die ihn angehen, zählen – kämpfende Söldner halten ihn nicht an der Treppe fest (E-71: nach dem
 *  Sturz über die Kante führt die Kellertreppe von unten zurück in die Arena). */
const heroBusy=g=>g.dead||!!g.casting||(g.enemies||[]).some(e=>e.hp>0&&e.aggro&&e.ai==='combat'&&(e.focus||'player')==='player'&&dist(e,g.player)<400);
export function dungeonStep(g,id,side){
 const run=dungeonRun(g);if(!run)return false;const t=run.def.transitions.find(x=>x.id===id);if(!t||!t[side])return false;
 const to=t[side==='a'?'b':'a'];
 if(heroBusy(g)){g.toast?.(T.busy);return false;}
 if(t.oneWay&&t.oneWay!==side){g.toast?.(T.locked.oneWay);return false;}
 if(t.secret&&!run.secrets.has(t.secret)){g.toast?.(T.locked.secret);return false;}
 if(t.gate?.boss&&t.gate.side===side&&!run.killed.has(t.gate.boss)){g.toast?.(T.locked.gate);return false;}
 if(t.unlock&&!run.unlocked.has(t.id)){if(side!==t.unlock){g.toast?.(T.locked.lift);return false;}run.unlocked.add(t.id);const today=dungeonToday(g,run.id);if(!today.shortcuts.includes(t.id))today.shortcuts.push(t.id);g.toast?.(T.unlocked.lift);g.emit?.('save');}
 stop(g);place(g,toWorld(run.def,to.floor,to.x,to.y));g.emit?.('dungeonFloor',{floor:to.floor});return true;
}
export function dungeonSecret(g,id){
 const run=dungeonRun(g),s=run?.def.secrets.find(x=>x.id===id);if(!s||run.secrets.has(id))return false;
 run.secrets.add(id);run.version++;const rec=record(g,run.id);if(!rec.secrets.includes(id))rec.secrets.push(id);
 g.toast?.(T.unlocked[id]||'');g.emit?.('dungeonSecret',{id});g.emit?.('save');return true;
}

// ── Takt ──────────────────────────────────────────────────────────────────────────────────────────────────────
/** Durchsage-Punkt: Lautsprecher an der Nordwand des Raums (rechts vom Schild) oder der Punkt aus den Daten. */
export function speakerPoint(def,a){if(a.room){const room=def.rooms.find(r=>r.id===a.room);if(!room)return null;const r=rectWorld(def,room.floor,room.rects[0]);return {floor:room.floor,x:r.x+r.w/2+30,y:r.y+4};}if(a.floor==null)return null;const p=toWorld(def,a.floor,a.x,a.y);return {floor:a.floor,x:p.x,y:p.y};}
/** Etappe 2 Text-Diät: Durchsage als Sprechblase am Lautsprecher (Chatzeile kommt mit der Blase), keine Kurzmeldung. */
function announce(g,a,line){if(!line)return;const run=dungeonRun(g),p=run&&speakerPoint(run.def,a);if(run)run.speaking={id:a.id,until:g.time+4};
 if(p&&g.bark)g.bark({id:'speaker-'+a.id,name:T.speaker,x:p.x,y:p.y},line,'speaker');else g.log?.(T.speaker+': „'+line+'"');g.emit?.('dungeonAnnounce',{line});}
/** Etappe 2: Geheimnisse sind von außen nicht zu sehen – ein Raum mit `secret`, den noch keiner betreten hat, und wer darin steht. */
export const concealedRoom=(run,room)=>!!room?.secret&&!run.visited.has(room.id);
export function concealed(g,e){const run=dungeonRun(g);return !!run&&concealedRoom(run,roomAt(run.def,e.x,e.y));}
// ── Arenatür (Hotfix 2026-09-25, Prüfer-Befund 8, WoW-Vorbild) ──────────────────────────────────────────────────
// Eine Arena schließt nur, wenn der HELD in ihr steht. Wer beim Schließen draußen steht, kommt an den Eingang innen (wie Beschwören
// an den Boss) – niemand bleibt allein drin oder draußen. Kein Treffer von außen, kein Söldner zieht einen Boss allein.
// Datengetrieben über `room.arena` (Boss) und `door.arena` (Raum): gilt für Gerd, Big B und jede Arena, die Etappe 4 dazubaut.
/** Türregel je Boss im Kampf → 'close' (Tür fällt zu, Gruppe herein), 'hold' (bleibt zu) oder 'reset' (Boss setzt zurück).
 *  closed: Tür schon zu · hero: Held lebt und steht in der Arena · party: jemand der Gruppe steht noch darin (Geist, Sturz, E-71). */
export function arenaRule({closed,hero,party}){if(closed)return party?'hold':'reset';return hero?'close':'reset';}
const heroIn=(g,def,room)=>!g.dead&&roomAt(def,g.player.x,g.player.y)?.id===room;
/** Boss hinter offener Arenatür, der Held steht nicht drin: nicht angreifbar (Autoangriff, Kniffe, Söldner). Der Rechtsklick läuft
 *  per Wegsuche bis in die Arena, dann beginnt der Kampf. Ist die Tür zu, gilt die normale Sicht (die Tür verdeckt). */
export function bossOutOfReach(g,e){const room=e?.dungeonBoss?.room;if(!room||!(e.hp>0))return false;const run=dungeonRun(g);if(!run||run.arena===room)return false;return !heroIn(g,run.def,room);}
/** Söldner warten am Arenarand: liegt `pt` in der Arena eines lebenden Bosses, deren Tür offen ist und in der der Held nicht steht? */
export function arenaAhead(g,pt){
 const run=dungeonRun(g);if(!run||!pt)return false;const room=roomAt(run.def,pt.x,pt.y);if(!room?.arena||run.arena===room.id||heroIn(g,run.def,room.id))return false;
 return (g.enemies||[]).some(e=>e.dungeonBoss?.room===room.id&&e.hp>0);
}
/** Eingang innen: Mitte der Arenatür (der nächsten zu `from`), 2 m in den Raum hinein. */
export function arenaEntrance(run,roomId,from){
 const room=run.def.rooms.find(r=>r.id===roomId);if(!room)return null;let best=null;
 for(const d of run.def.doors){if(d.arena!==roomId||d.floor!==room.floor)continue;const [x,y,w,h]=d.rect;
  for(const [dx,dy] of [[w/2+2,0],[-w/2-2,0],[0,h/2+2],[0,-h/2-2]]){const q=toWorld(run.def,d.floor,x+w/2+dx,y+h/2+dy);if(roomAt(run.def,q.x,q.y)?.id!==roomId)continue;const k=from?dist(from,q):0;if(!best||k<best.k)best={x:q.x,y:q.y,k};break;}}
 return best&&{x:best.x,y:best.y};
}
/** Tür fällt zu: alle Söldner außerhalb der Arena an den Eingang innen (leicht gefächert); der Held, falls er nicht drin steht, ebenso. */
export function pullIntoArena(g,run,roomId){
 const inside=u=>roomAt(run.def,u.x,u.y)?.id===roomId,p=g.player;let n=0;
 const into=(u,i)=>{const q=arenaEntrance(run,roomId,u);if(!q)return false;const a=i/4*Math.PI*2;let at=g.world.findClear(q.x+Math.cos(a)*14,q.y+Math.sin(a)*14,9);
  if(roomAt(run.def,at.x,at.y)?.id!==roomId)at=g.world.findClear(q.x,q.y,9);u.x=at.x;u.y=at.y;return true;};
 if(!g.dead&&!inside(p)&&into(p,0)){g.moveTo=null;g.path=[];}
 (g.companions||[]).forEach((c,i)=>{if(inside(c)||!into(c,i+1))return;c.path=[];c.pathTimer=0;n++;});
 if(n)g.emit?.('arenaPulled',{room:roomId,count:n});return n;
}
function walkPatrol(g,e,dt){
 const pt=e.patrol.points[e.patrol.i],goal={x:pt.x+e.patrol.dx,y:pt.y+e.patrol.dy},d=dist(e,goal);
 if(d<8){e.patrol.i=(e.patrol.i+1)%e.patrol.points.length;return;}
 const step=Math.min(d,e.speed*.45*dt);g.move(e,(goal.x-e.x)/d*step,(goal.y-e.y)/d*step);e.moving=true;e.facing=goal.x<e.x?-1:1;e.home={x:e.x,y:e.y};e.roamGoal=null;
}
const standing=g=>(g.companions||[]).some(c=>c.state!=='down'&&c.hp>0);
const partyIn=(g,def,room)=>[...(g.dead?[]:[g.player]),...(g.companions||[]).filter(c=>c.state!=='down'&&c.hp>0)].some(u=>roomAt(def,u.x,u.y)?.id===room);
/** Bemerkt dieser Gegner den Helden? Bosse nur, wenn er in ihrem Raum steht – kein Anlocken durch die Tür (E-71). */
export const dungeonNotices=(g,e)=>{if(!e.dungeonBoss)return true;const run=dungeonRun(g);return !run||roomAt(run.def,g.player.x,g.player.y)?.id===e.dungeonBoss.room;};
/** Held gefallen (E-71): Geist statt Wipe. Die Bedrohung auf den Helden fällt weg, die Söldner halten die Gegner. */
function enterGhost(g,run){run.ghost={at:g.time,wiped:false};for(const e of g.enemies)clearThreat(e,'player');g.target=null;g.moveTo=null;g.path=[];g.routeGoal=null;
 if(standing(g))g.toast?.(T.ghost);g.emit?.('dungeonGhost',{});}
/** Alle liegen (E-71): Die Gegner setzen zurück, der Held steht erst auf, wenn er „Am Kontrollpunkt aufstehen" wählt. */
function wipe(g,run){run.ghost.wiped=true;for(const e of g.enemies)if(e.hp>0&&(e.aggro||e.ai==='combat')){clearThreat(e);g.resetEnemy?.(e);}g.toast?.(T.wipeAll);g.emit?.('dungeonWipe',{});}
export function tickDungeon(g,dt){
 const run=dungeonRun(g);if(!run)return;g.instance.time+=dt;const p=g.player,def=run.def;
 if(g.dead){if(!run.ghost)enterGhost(g,run);if(!run.ghost.wiped&&!standing(g))wipe(g,run);}else if(run.ghost)run.ghost=null;
 const room=g.dead?null:roomAt(def,p.x,p.y);
 if(room&&room.id!==run.room){run.room=room.id;const first=!run.visited.has(room.id);run.visited.add(room.id);
  if(room.checkpoint)run.checkpoint={floor:room.floor,x:room.checkpoint.x,y:room.checkpoint.y,room:room.id};
  /* Etappe 2 Text-Diät: der Raum nennt sich nur im Zonentitel (Schild groß, Wirklichkeit klein), keine Kurzmeldung */g.emit?.('dungeonRoom',{room,first});if(first)g.log?.(room.sign+' · '+room.truth);}
 const floor=floorAt(def,p.x,p.y);
 if(!g.dead)for(const a of def.announcements){if(run.heard.has(a.id))continue;const hit=a.room?run.room===a.room:floor===a.floor&&dist(p,toWorld(def,a.floor,a.x,a.y))<a.range*U;if(hit){run.heard.add(a.id);announce(g,a,T.announce[a.id]);}}
 // Arena: Türen zu, solange ein Boss kämpft – aber nur, wenn der Held beim Zufallen drin steht (Hotfix 2026-09-25, arenaRule).
 // Ein Boss, den ein vorgelaufener Söldner oder ein Treffer von außen angestoßen hat, setzt sofort zurück. Ist die Tür schon zu, hält
 // sie, solange jemand der Gruppe drin ist (Held als Geist oder über die Kante gestürzt: die Söldner kämpfen weiter, E-71).
 let arena=null;for(const e of g.enemies)if(e.dungeonBoss&&e.hp>0&&e.aggro&&e.ai==='combat'){const room=e.dungeonBoss.room;
  if(arenaRule({closed:run.arena===room,hero:heroIn(g,def,room),party:partyIn(g,def,room)})==='reset'){clearThreat(e);g.resetEnemy?.(e);continue;}arena=room;break;}
 /* Etappe 2 Text-Diät: Tür zu/auf nur im Chat, die Tür selbst zeigt es */if(arena!==run.arena){const was=run.arena;run.arena=arena;run.version++;if(arena){pullIntoArena(g,run,arena);g.log?.(T.arenaClosed);}else if(was)g.log?.(T.arenaOpen);}
 for(const e of g.enemies){
  if(e.frontGuard>0)e.frontGuard=Math.max(0,e.frontGuard-dt);
  if(e.patrol&&e.hp>0&&!e.aggro&&e.ai==='roaming')walkPatrol(g,e,dt);
  // Boss zurückgesetzt (Rückzug oder Gruppentod): Phasen und Zyklus von vorn
  if(e.dungeonBoss&&!e.aggro&&e.hp>=e.maxHp&&(e.saidPhases?.size||e.engaged)){e.saidPhases=null;e.engaged=false;e.castSet=e.baseCastSet;e.cycle=0;}
 }
 // Adds verschwinden, wenn ihr Boss zurückgesetzt wurde
 for(let i=g.enemies.length-1;i>=0;i--){const e=g.enemies[i];if(e.summoner&&e.summoner.hp>0&&!e.summoner.aggro)g.enemies.splice(i,1);}
 tickBossMechanics(g,run,dt);/* Etappe 3: Nachsatz, Geständnis, Wut, Reichweite, parallele Timer, Trümmer */
}
/** Aufstehen am Kontrollpunkt (Freilassen oder Gruppentod; engine.respawn setzt vorher die Gegner zurück). */
export function dungeonRespawn(g){
 const run=dungeonRun(g);if(!run)return;run.ghost=null;const c=run.checkpoint;place(g,toWorld(run.def,c.floor,c.x,c.y));
 g.toast?.(T.wipe(checkpointName(run)));
}
/** Name des Kontrollpunkts, an dem der Held aufsteht (Todesbildschirm, E-71). */
const checkpointName=run=>run.def.rooms.find(r=>r.id===run.checkpoint.room)?.sign||run.def.rooms[0].sign;
export const dungeonCheckpoint=g=>{const run=dungeonRun(g);return run?{name:checkpointName(run),...run.checkpoint}:null;};
/** Ein Söldner hat den Helden aufgehoben (E-71, wie reviveHere aus E-44): 35 % Leben, kurzer Schutz, der Kampf läuft weiter. */
export function reviveHero(g,from,share=BALANCE.party.reviveHp){
 if(!g.dead)return false;const p=g.player,run=dungeonRun(g);
 Object.assign(p,{hp:Math.max(1,Math.round(p.maxHp*share)),energy:Math.max(p.energy,30),hurt:0,invulnerable:3,vx:0,vy:0,moving:false,inCombat:7});
 g.dead=false;if(run)run.ghost=null;g.attackers?.clear();g.effect?.('heal',p.x,p.y,{life:1.5,max:1.5});
 g.toast?.(T.revived(from?.name||''));g.emit?.('revived',{from:from?.name||''});return true;
}

// ── Kampf: Boss-Phasen, Adds, neue Zaubermerkmale ─────────────────────────────────────────────────────────────
function summon(g,boss,{kind,count,hp=1}){
 const d=DUNGEON_ENEMIES[kind];if(!d)return;const run=dungeonRun(g);if(!run)return;
 const arena=boss.dungeonBoss?.room;
 for(let i=0;i<count;i++){let q=null;/* Adds erscheinen in der Arena, in Sichtweite des Bosses – nie hinter der Wand im Hof (E-71) */
  for(let k=0;k<12&&!q;k++){const a=g.random()*Math.PI*2,c=g.world.findClear(boss.x+Math.cos(a)*70,boss.y+Math.sin(a)*70,9);if((!arena||roomAt(run.def,c.x,c.y)?.id===arena)&&g.world.lineClear(boss,c))q=c;}
  q||=g.world.findClear(boss.x,boss.y,9);const e=createEnemy(g,run,kind,d,q);if(hp!==1)e.hp=e.maxHp=Math.max(1,Math.round(e.maxHp*hp));
  Object.assign(e,{summoner:boss,repeatAdd:(dungeonToday(g,run.id).kills?.[boss.bossId]||0)>0/* Etappe 3: Wiederholung am selben Tag */,calledIn:true/* Adds rufen keine Packs aus dem Hof (E-71) */,aggro:true,ai:'combat',attackTimer:COMBAT_RULES.firstSpecial,spawnGrace:.6});g.enemies.push(e);}
}
/** Vor jedem Zauber eines Dungeon-Bosses: Eröffnungsspruch, Phasen (Spruch, neuer Zyklus, Adds). */
export function dungeonBossCast(g,e){
 const def=DUNGEON_BOSSES[e.bossId];if(!def)return;const lines=T.bossLines[e.bossId]||{};
 if(!e.engaged){e.engaged=true;if(lines.engage)g.bark?.(e,lines.engage,'boss');}
 for(const ph of def.phases||[]){if(e.hp/e.maxHp>ph.at)continue;const said=e.saidPhases||(e.saidPhases=new Set());if(said.has(ph.at))continue;said.add(ph.at);
  const line=lines.phases?.[String(ph.at)];if(line)g.bark?.(e,line,'phase');if(ph.castSet){e.castSet=ph.castSet;e.cycle=0;}if(ph.summon)summon(g,e,ph.summon);}
}
/** Soziale Aggro im Dungeon (E-71, Kenner-Befund 7): Kämpft ein Mitglied, kommt der Rest des eigenen Packs sofort mit – nie ein
 *  Nachbarpack. Ersetzt im Dungeon die Kette „Kumpel kommt" der offenen Welt (engine.js). true = e ist jetzt im Kampf. */
export function dungeonPackAggro(g,e){
 if(!e.pack||e.aggro||!(e.hp>0)||e.cardboard)return false;
 if(!g.enemies.some(o=>o!==e&&o.pack===e.pack&&o.hp>0&&o.aggro&&o.ai==='combat'))return false;
 e.aggro=true;e.ai='combat';e.attackTimer=COMBAT_RULES.firstSpecial;return true;
}
/** Zauberort beim Zauberbeginn (E-71): target:'random' legt Fläche bzw. Ziel auf einen zufälligen Nicht-Schutz in Sichtweite –
 *  den Helden (außer als Schutz-Spec oder wenn er den Gegner hält) oder einen Söldner ohne Schutz-Rolle. */
export function dungeonCastSpot(g,e,k,victim='player'){
 // Abstand zum nächsten Zauber je Stelle im Zyklus (gaps, E-71: Gerds doppelter Rausschmiss in Phase 2)
 const set=DUNGEON_CASTS[e.castSet],gap=set?.gaps?.[((e.cycle||1)-1)%set.cycle.length];if(k&&gap!=null)k.next=gap;
 if(k)prepareCast(g,e,k);/* Etappe 3: Behauptung, Bahnen, Bodenstellen */
 if(!k||k.target!=='random')return;
 const holder=victim==='player'?g.player:victim,tankHero=TANK_SPECS.includes(g.rpg?.talents?.spec),seen=u=>dist(u,e)<600&&g.world.lineClear(e,u);
 const pool=[...(!g.dead&&!tankHero&&holder!==g.player&&seen(g.player)?[g.player]:[]),...(g.companions||[]).filter(c=>c!==holder&&c.state!=='down'&&c.hp>0&&c.def?.role!=='tank'&&seen(c))];
 const pick=pool.length?pool[Math.floor(g.random()*pool.length)]:holder;if(!pick)return;
 k.victim=pick===g.player?'player':pick.id;if(k.ground){k.x=pick.x;k.y=pick.y;}
}
/** Kegel an Wänden abgeschnitten (E-71): freie Länge je Strahl. Warnfläche (dungeon-art.js) und Treffer lesen dieselben Strahlen,
 *  damit nichts durch eine Wand trifft und die Fläche nicht in den Nachbarraum ragt. */
export const CONE_RAYS=14;
export function coneReach(world,e,k){
 if(k.reach&&k.reachFrom?.x===e.x&&k.reachFrom?.y===e.y)return k.reach;
 const half=k.cone.angle*Math.PI/360,a0=k.angle??0,out=[];
 for(let i=0;i<=CONE_RAYS;i++){const a=a0-half+2*half*i/CONE_RAYS,cx=Math.cos(a),cy=Math.sin(a);let r=k.cone.range;
  for(let d=4;d<=k.cone.range;d+=4)if(world.blocked(e.x+cx*d,e.y+cy*d,0)){r=Math.max(0,d-4);break;}out.push(r);}
 k.reach=out;k.reachFrom={x:e.x,y:e.y};return out;
}
function inCone(e,c,u,g){
 if(!u)return false;const d=dist(e,u);if(d>c.cone.range)return false;
 const half=c.cone.angle*Math.PI/360,diff=norm(Math.atan2(u.y-e.y,u.x-e.x)-(c.angle??0));if(Math.abs(diff)>half)return false;
 if(!g?.world?.blocked)return true;
 const reach=coneReach(g.world,e,c),t=(diff+half)/(2*half)*CONE_RAYS,i=Math.min(CONE_RAYS-1,Math.floor(t)),r=reach[i]+(reach[i+1]-reach[i])*(t-i);
 return d<=r+2;
}
export const coneHits=inCone;
/** Die Treppenkante wirft erst ab Phase 2 hinaus (E-71, fall.below); vorher kostet der Rückstoß nur Position. */
export const fallActive=(e,fall=DUNGEON_BOSSES[e?.bossId]?.fall)=>!!fall&&e.hp/e.maxHp<=(fall.below??1);
function knockback(g,e,amount){
 const p=g.player,d=dist(e,p)||1,steps=8;for(let i=0;i<steps;i++)g.move(p,(p.x-e.x)/d*amount/steps,(p.y-e.y)/d*amount/steps);
 const run=dungeonRun(g),fall=DUNGEON_BOSSES[e.bossId]?.fall;if(!run||!fall||!fallActive(e,fall))return;
 const room=run.def.rooms.find(r=>r.id===e.dungeonBoss?.room);if(!room)return;
 if(inRect(rectWorld(run.def,room.floor,fall.rect),p.x,p.y)){stop(g);place(g,toWorld(run.def,fall.to.floor,fall.to.x,fall.to.y));g.toast?.(T.fell);
  /* Der Gestürzte ist aus dem Kampf; die Söldner halten den Boss weiter (E-71), die Kellertreppe führt von unten zurück */for(const o of g.enemies)if(o.aggro)clearThreat(o,'player');}
}
const unitOf=(g,id)=>id==='player'?g.player:(g.companions||[]).find(c=>c.id===id)||null;
/** Schaden eines Dungeon-Zaubers an einer Einheit (E-71): pct = Anteil am Höchstleben ohne Rüstung, sonst die feste Zahl.
 *  factor = z. B. tankSafe. Deckung, Schutzschilde und Schadensminderung wirken wie gewohnt. */
function strike(g,e,c,u,factor=1){
 if(!u)return;const boost=e.mechBoost||1;/* Etappe 3: Wut und Reichweite gelten auch für Anteils-Schaden (feste Zahlen laufen über e.damage) */
 if(u===g.player){if(g.dead)return;if(c.pct)g.hitPlayer(e,0,true,c.pct*factor*boost*(e.pctFactor||1));else g.hitPlayer(e,Math.round(c.damage*factor));return;}
 if(u.state==='down'||!(u.hp>0))return;
 hitCompanion(g,e,u,c.pct?Math.max(1,Math.round(c.pct*factor*boost*(e.pctFactor||1)*u.maxHp/(e.damage||1))):Math.round(c.damage*factor));
}
/** Mal eines Zaubers (brand, E-71: „Hausverbot“ bei Gerds Rausschmiss): Wer getroffen wird und nicht das Ziel ist, trägt das Mal
 *  duration Sekunden; jeder weitere Treffer in der Zeit kostet bonus je Stapel mehr. → Schadensfaktor für diesen Treffer. */
function branded(g,c,u,target){if(!c.brand||target)return 1;const b=u.brand?.until>g.time?u.brand:null,stacks=b?.stacks||0;
 u.brand={name:c.brand.name,until:g.time+c.brand.duration,stacks:stacks+1};if(stacks)g.float?.(u.x,u.y-56,c.brand.name.toUpperCase()+' ×'+(stacks+1),'#ff9a6e');return 1+stacks*c.brand.bonus;}
/** Rückmeldung wie im Spieler-Zweig der Engine: Fläche verlassen → „Ausgewichen", getroffen → „Getroffen". */
function groundFeedback(g,hit){const p=g.player;if(hit){g.float?.(p.x,p.y-44,DODGE_UI.hit.toUpperCase(),'#ff7a5c');return;}
 g.stats&&g.stats.dodges++;const t=DODGE_UI.dodged.toUpperCase();if(!g.sct?.({area:'in',kind:'avoid',text:t,skill:'dash'}))g.float?.(p.x,p.y-24,t,'#aed4bd');}
/**
 * Zauberende mit Dungeon-Merkmalen. victim: 'player' (Ziel ist der Spieler) oder der Söldner, der die Bedrohung hält.
 * Gibt true zurück, wenn der Zauber hier vollständig abgehandelt wurde.
 */
export function resolveDungeonCast(g,e,c,victim='player'){
 const p=g.player,target=victim==='player'?p:victim;
 if(c.frontGuard){e.frontGuard=c.frontGuard.duration;e.frontFactor=c.frontGuard.factor;e.frontAngle=Math.atan2(target.y-e.y,target.x-e.x);g.float?.(e.x,e.y-44,'SCHILDWALL','#e8dcc0');return true;}
 if(c.healAllies){for(const o of g.enemies)if(o.hp>0&&dist(o,e)<=c.healAllies.range){const n=Math.round(o.maxHp*c.healAllies.share);o.hp=Math.min(o.maxHp,o.hp+n);g.float?.(o.x,o.y-36,'+'+n,'#9ed17a');}return true;}
 e.lastCast=c;try{
  if(resolveBigBCast(g,e,c,victim))return true;/* Etappe 3: line, circles, summon, tankDebuff, selfHeal */
  if(c.cone){
   const guard=victim==='player'&&(TANK_SPECS.includes(g.rpg?.talents?.spec)||p.parry>0);
   if(!g.dead&&inCone(e,c,p,g)){strike(g,e,c,p,guard?c.tankSafe??1:branded(g,c,p,victim==='player'));if(c.knockback&&!guard&&!g.dead)knockback(g,e,c.knockback);}
   for(const o of g.companions||[])if(o.state!=='down'&&o.hp>0&&inCone(e,c,o,g))strike(g,e,c,o,o===victim?c.tankSafe??1:branded(g,c,o,false));
   return true;
  }
  // Flächen treffen alle darin – Held und Söldner –, auch wenn sie auf einem Söldner liegen (E-71).
  if(c.ground){
   const inside=u=>Math.hypot((u.x-c.x)/c.radius,(u.y-c.y)/(c.radius*.75))<1,aimed=(c.victim||(victim==='player'?'player':null))==='player';
   emitCombatFx(g,'impact',c,{radius:c.radius,hostile:true});
   if(!g.dead){const hit=inside(p);if(hit)strike(g,e,c,p);if(aimed||hit)groundFeedback(g,hit);}
   for(const o of g.companions||[])if(o.state!=='down'&&o.hp>0&&inside(o))strike(g,e,c,o);
   return true;
  }
  // Gezielter Zauber auf einen zufälligen Nicht-Schutz (target:'random'): trifft das gewählte Ziel, wenn es ihn noch sieht.
  if(c.interruptible&&(c.victim||c.pct)&&!c.callHelp){const u=unitOf(g,c.victim)||target;if(u&&dist(e,u)<COMPANION_RULES.castSight&&g.world.lineClear(e,u))strike(g,e,c,u);return true;}
  if(c.callHelp){
   if(victim==='player'){if(!g.dead&&dist(e,p)<COMPANION_RULES.castSight&&g.world.lineClear(e,p))strike(g,e,c,p);}else if(dist(e,victim)<COMPANION_RULES.castSight)strike(g,e,c,victim);
   // Funkspruch (E-71): der eigene Pack und höchstens der nächste fremde Pack im selben Raum kommen. Wer gerufen wurde, ruft nicht
   // weiter – so entsteht keine Kette über den Raum.
   let called=0;const wake=o=>{o.aggro=true;o.ai='combat';o.attackTimer=COMBAT_RULES.firstSpecial;o.calledIn=true;called++;};
   const free=o=>o!==e&&o.hp>0&&!o.aggro&&!o.cardboard&&o.behavior==='aggressive';
   for(const o of g.enemies)if(free(o)&&e.pack&&o.pack===e.pack)wake(o);
   if(!e.calledIn){const run=dungeonRun(g),room=run&&roomAt(run.def,e.x,e.y),near=new Map();
    for(const o of g.enemies)if(free(o)&&o.pack&&o.pack!==e.pack&&dist(o,e)<=c.callHelp.range&&(!run||roomAt(run.def,o.x,o.y)===room)){const d=dist(o,e);if(!near.has(o.pack)||near.get(o.pack)>d)near.set(o.pack,d);}
    const next=[...near].sort((a,b)=>a[1]-b[1])[0]?.[0];if(next)for(const o of g.enemies)if(free(o)&&o.pack===next)wake(o);}
   if(called)g.float?.(e.x,e.y-44,'VERSTÄRKUNG','#f0b070');
   return true;
  }
 }finally{e.lastCast=null;}
 return false;
}
// ── Etappe 3 „Big B" (E-71, Plan 7.6 und Abschnitt 9): Behauptung und Nachsatz, Bahnen, Bodenstellen, parallele Timer, Wut, Trümmer,
// Geständnis, Beweise, Endtruhe und Erfolg. Daten: content/dungeons.js (DUNGEON_CASTS 'd-bigb…', DUNGEON_BOSSES.bigb). ─────────────
/** Wirkung der gefundenen Beweise (V-D11 geändert: jeder sichtbar): Lügen, die wegfallen, Mehrschaden auf Big B, früheres Geständnis. */
export function evidenceEffects(run){
 const ev=run?.def?.evidence,have=[...(run?.evidence||[])].filter(id=>ev?.effects?.[id]),out={ids:have,noLie:new Set(),taken:0,confessAt:null};
 for(const id of have){const f=ev.effects[id];if(f.noLie)out.noLie.add(f.noLie);if(f.taken)out.taken+=f.taken;}
 if(ev?.all&&have.length&&ev.ids.every(id=>have.includes(id)))out.confessAt=ev.all.confessAt;return out;
}
/** Arena des Bosses als Weltrechteck (erstes Rechteck seines Raums). */
function arenaRect(run,e){const room=run.def.rooms.find(r=>r.id===e.dungeonBoss?.room);return room?rectWorld(run.def,room.floor,room.rects[0]):null;}
/** Bahnen eines line-Zaubers als Weltrechtecke: Anteile der Raumbreite (West → Ost), über die ganze Länge der Arena. */
export function laneRects(run,e,k){const r=arenaRect(run,e);if(!r||!k.line)return [];return k.line.lanes.map(([a,b])=>({x:r.x+a*r.w,y:r.y,w:(b-a)*r.w,h:r.h}));}
/** Steht u in der Bahn? margin = halbe Körperbreite. */
export const inLane=(r,u,margin=4)=>!!r&&!!u&&u.x>=r.x-margin&&u.x<=r.x+r.w+margin&&u.y>=r.y-margin&&u.y<=r.y+r.h+margin;
/** Vorlauf der Lüge: Grundwert tell (1,0 s); 0 nach dem Geständnis oder wenn ein Beweis diese Lüge streicht (noLie). */
function lieTell(run,e,k){if(!k.lie||e.confessed)return 0;if(evidenceEffects(run).noLie.has(k.type))return 0;return k.lie.tell??1;}
/** Nicht-Schutz in der Arena (Held außer als Schutz-Spec, Söldner ohne Schutz-Rolle): Ziele der Bodenstellen. */
function arenaTargets(g,run,e){const room=e.dungeonBoss?.room,here=u=>roomAt(run.def,u.x,u.y)?.id===room,tankHero=TANK_SPECS.includes(g.rpg?.talents?.spec);
 return [...(!g.dead&&!tankHero&&here(g.player)?[g.player]:[]),...(g.companions||[]).filter(c=>c.state!=='down'&&c.hp>0&&c.def?.role!=='tank'&&here(c))];}
/** Bodenstellen (circles): eine unter jedem Nicht-Schutz in der Arena, der Rest zufällig in der Arena, abseits von Boss und Schutz. */
function placeSpots(g,run,e,k){
 const r=arenaRect(run,e),spots=[];if(!r){k.spots=[];return;}
 for(const u of arenaTargets(g,run,e).slice(0,k.circles))spots.push({x:u.x,y:u.y});
 for(let i=0;spots.length<k.circles&&i<40;i++){/* Zufall plus Goldener-Schnitt-Versatz: streut auch bei gleichförmigem Zufall */const q=g.world.findClear(r.x+20+((g.random()+i*.618034)%1)*(r.w-40),r.y+20+((g.random()+i*.381966)%1)*(r.h-40),7);if(roomAt(run.def,q.x,q.y)?.id===e.dungeonBoss?.room&&spots.every(s=>Math.hypot(s.x-q.x,s.y-q.y)>k.radius)&&Math.hypot(q.x-e.x,q.y-e.y)>k.radius+48/* nicht auf Boss und Schutz */)spots.push({x:q.x,y:q.y});}
 k.spots=spots;
}
/** Nachsatz: Leiste und Sprechblase wechseln auf die Wahrheit, erst jetzt liegen die echten Markierungen (Stellen) am Boden. */
function reveal(g,e,k,quiet=false){
 k.told=true;k.toldAt=g.time;if(k.truthText)k.name=k.truthText;const run=dungeonRun(g);if(k.circles&&!k.spots&&run)placeSpots(g,run,e,k);
 if(quiet)return;g.bark?.(e,k.truthText,'boss');g.emit?.('sound',{id:'nachsatz'});g.emit?.('dungeonLie',{phase:'truth',boss:e.bossId,type:k.type,text:k.truthText});
}
/** Zauberbeginn (aus dungeonCastSpot, Spieler- und Söldner-Zweig): Spruch, Bahnen mit Seite, Behauptung. Stellen ohne Lüge sofort. */
function prepareCast(g,e,k){
 const run=dungeonRun(g);if(!run||k.prepared)return;k.prepared=true;k.startedAt=g.time;
 if(k.say)g.bark?.(e,k.say,'boss');
 if(k.circles)k.ground=false;/* die Stellen zeichnet dungeon-bigb-art.js; der Einzelkreis des Renderers bleibt aus */
 if(k.line){k.lanes=laneRects(run,e,k);const flip=!!k.lie?.mirror&&g.random()<.5,n=k.lanes.length,m=i=>flip?n-1-i:i;k.flip=flip;k.claimLane=m(k.line.claim??0);k.truthLanes=(k.line.truth||[]).map(m);}
 if(k.lie){k.claimText=k.flip&&k.lie.mirrorClaim||k.lie.claim;k.truthText=k.flip&&k.lie.mirrorTruth||k.lie.truth;k.tell=lieTell(run,e,k);
  if(k.tell>0){k.told=false;k.name=k.claimText;g.bark?.(e,k.claimText,'boss');g.emit?.('dungeonLie',{phase:'claim',boss:e.bossId,type:k.type,text:k.claimText});}
  else reveal(g,e,k);/* ohne Lüge (Geständnis, Beweis): gleich die Wahrheit */}
 else if(k.circles)placeSpots(g,run,e,k);
}
/** Zauberende der neuen Merkmale. true = abgehandelt. */
function resolveBigBCast(g,e,c,victim){
 const run=dungeonRun(g),p=g.player,alive=o=>o.state!=='down'&&o.hp>0;if(!run)return false;
 if(c.tankDebuff){
  const u=victim==='player'?p:victim;if(!u||u===p&&g.dead)return true;const d=c.tankDebuff,parried=u===p?p.parry>0:u.guard>0;
  strike(g,e,c,u);
  if(parried){u.cert=null;g.float?.(u.x,u.y-58,d.name.toUpperCase()+' ×0','#f2da92');}
  else{const cur=u.cert?.until>g.time?u.cert.stacks:0;u.cert={id:d.id,name:d.name,stacks:Math.min(d.stack,cur+1),taken:d.taken,until:g.time+d.duration};g.float?.(u.x,u.y-58,d.name.toUpperCase()+' ×'+u.cert.stacks,'#e8c46a');}
  return true;
 }
 if(c.line&&c.lanes){
  const bad=(c.truthLanes||[]).map(i=>c.lanes[i]).filter(Boolean),hit=u=>bad.some(r=>inLane(r,u));e.lastLine={lanes:bad,at:g.time};
  if(!g.dead&&hit(p)){strike(g,e,c,p);if(c.lie){e.lieHits=(e.lieHits||0)+1;g.float?.(p.x,p.y-62,T.bigb.lieHit,'#ff7a5c');}}
  for(const o of g.companions||[])if(alive(o)&&hit(o))strike(g,e,c,o);
  return true;
 }
 if(c.circles){
  if(!c.spots)placeSpots(g,run,e,c);const inside=(u,s)=>Math.hypot((u.x-s.x)/c.radius,(u.y-s.y)/(c.radius*.75))<1;
  for(const s of c.spots)emitCombatFx(g,'impact',s,{radius:c.radius,hostile:true});
  if(!g.dead){const n=c.spots.filter(s=>inside(p,s)).length;if(n)strike(g,e,c,p,1+.5*(n-1));groundFeedback(g,n>0);}
  for(const o of g.companions||[]){if(!alive(o))continue;const n=c.spots.filter(s=>inside(o,s)).length;if(n)strike(g,e,c,o,1+.5*(n-1));}
  if(c.persist)for(const s of c.spots)run.hazards.push({x:s.x,y:s.y,radius:c.persist.radius,pct:c.persist.pct,until:g.time+c.persist.duration,boss:e,tick:.5});
  return true;
 }
 if(c.summon){const rita=run.killed.has('rita'),opt=run.def.optional?.rita?.[e.bossId];summon(g,e,{...c.summon,count:rita&&opt?.summon||c.summon.count});
  if(rita&&T.bossLines[e.bossId]?.ritaDown)g.bark?.(e,T.bossLines[e.bossId].ritaDown,'boss');return true;}
 if(c.selfHeal){const n=Math.round(e.maxHp*c.selfHeal);e.hp=Math.min(e.maxHp,e.hp+n);g.float?.(e.x,e.y-54,'+'+n+' · '+T.bigb.selfHeal,'#9ed17a');return true;}
 return false;
}
/** Mehrfach unterbrechen (interrupts n, „Am eigenen Schopf"): true = gezählt, der Zauber läuft weiter, bis n Unterbrechungen erreicht
 *  sind. Aufgerufen von der Unterbrechung des Helden (engine.js) und der Söldner (companions.js). */
export function interruptHolds(g,e){
 const k=e?.cast;if(!k?.interrupts||k.interrupts<2)return false;k.broken=(k.broken||0)+1;if(k.broken>=k.interrupts)return false;
 g.float?.(e.x,e.y-42,T.bigb.interrupts(k.broken,k.interrupts),'#f2da92');return true;
}
/** Zustand eines Bosses nach Rückzug oder Wipe zurück: Wut, Reichweite, Timer, Geständnis, Lügen-Treffer (Erfolg), Trümmer. */
function resetBossState(g,run,e){e.fightTime=0;e.rageFactor=1;e.mechBoost=1;if(e.baseDamage!=null)e.damage=e.baseDamage;e.trackTimers=null;e.sideCast=null;e.confessed=false;e.lieHits=0;e.takenFactor=1;e.lastLine=null;
 run.hazards=(run.hazards||[]).filter(h=>h.boss!==e);}
/** Parallele Timer (tracks): eigener Zauber neben dem Hauptzyklus, z. B. der Siegelring alle 12 s auf den, der Big B hält. */
function tickTracks(g,e,dt){
 if(e.sideCast){const k=e.sideCast;k.remaining-=dt;if(k.remaining>0)return;e.sideCast=null;const holder=k.focus&&k.focus!=='player'?(g.companions||[]).find(c=>c.id===k.focus&&c.state!=='down'&&c.hp>0):null;
  if(holder||!g.dead)resolveDungeonCast(g,e,k,holder||'player');return;}
 const set=DUNGEON_CASTS[e.castSet];if(!set?.tracks?.length||e.stun>0)return;const timers=e.trackTimers||(e.trackTimers={});
 for(const t of set.tracks){if(timers[t.cast]==null)timers[t.cast]=t.first??t.every;timers[t.cast]-=dt;if(timers[t.cast]>0)continue;timers[t.cast]=t.every;
  const c=set.casts[t.cast];if(!c)continue;const focus=e.focus||'player',u=focus==='player'?g.player:(g.companions||[]).find(o=>o.id===focus)||g.player;
  e.sideCast={...c,type:t.cast,remaining:c.total,track:true,focus,angle:Math.atan2(u.y-e.y,u.x-e.x),x:e.x,y:e.y};break;}
}
/** Trümmerfelder (persist): Schaden je Sekunde als Anteil am Leben, solange jemand drinsteht; verschwinden mit dem Kampf. */
function tickHazards(g,run,dt){
 if(!run.hazards?.length)return;run.hazards=run.hazards.filter(h=>h.until>g.time&&h.boss?.hp>0&&h.boss.aggro);
 for(const h of run.hazards){h.tick-=dt;if(h.tick>0)continue;h.tick=1;const inside=u=>dist(u,h)<h.radius,c={pct:h.pct,damage:0};
  if(!g.dead&&inside(g.player))strike(g,h.boss,c,g.player);
  for(const o of g.companions||[])if(o.state!=='down'&&o.hp>0&&inside(o))strike(g,h.boss,c,o);}
}
/** Geständnis (Plan 7.6): ab confess.at (mit allen Beweisen evidence.all.confessAt) lügt er nicht mehr; eine laufende Lüge kippt sofort. */
function confessCheck(g,run,e,def){
 if(!def.confess||e.confessed)return;const ev=evidenceEffects(run),at=ev.confessAt??def.confess.at;if(e.hp/e.maxHp>at)return;
 e.confessed=true;const line=T.bossLines[e.bossId]?.confess;if(line)g.bark?.(e,line,'phase');g.float?.(e.x,e.y-66,T.bigb.confess,'#f3e6cc');g.emit?.('dungeonConfess',{boss:e.bossId});
 if(e.cast?.lie&&!e.cast.told)reveal(g,e,e.cast);
}
/** Je Takt (aus tickDungeon): Nachsatz nach tell, Geständnis, Wut, Reichweite, parallele Timer, Trümmer. */
function tickBossMechanics(g,run,dt){
 run.elapsed=(run.elapsed||0)+dt;
 for(const e of g.enemies){
  if(!e.dungeonBoss||!(e.hp>0))continue;const def=DUNGEON_BOSSES[e.bossId];if(!def)continue;
  if(!(e.aggro&&e.ai==='combat')){if(e.fightTime||e.sideCast||e.confessed)resetBossState(g,run,e);continue;}
  e.fightTime=(e.fightTime||0)+dt;
  const k=e.cast;if(k?.lie&&!k.told&&k.total-k.remaining>=k.tell)reveal(g,e,k);
  confessCheck(g,run,e,def);
  const ev=evidenceEffects(run);e.takenFactor=(1+ev.taken)*(e.confessed&&ev.confessAt!=null?1+(def.confess?.taken||0):1);
  const noReach=run.killed.has('rita')&&run.def.optional?.rita?.[e.bossId]?.noReach,followers=def.reach&&!noReach?g.enemies.filter(o=>o.summoner===e&&o.hp>0&&DUNGEON_ENEMIES[o.dungeonKind]?.reach).length:0;
  const en=def.enrage,rage=en&&e.fightTime>=en.after?1+en.damage*(1+Math.floor((e.fightTime-en.after)/en.every)):1;
  if(rage>(e.rageFactor||1)){g.float?.(e.x,e.y-70,T.bigb.enrage,'#ff6a4a');g.emit?.('dungeonEnrage',{boss:e.bossId,factor:rage});}
  if(followers>(e.reachShown||0))g.float?.(e.x,e.y-60,T.bigb.reach+' +'+Math.round(followers*def.reach*100)+' %','#e9a0ff');e.reachShown=followers;
  e.rageFactor=rage;e.mechBoost=(1+followers*(def.reach||0))*rage;if(e.baseDamage!=null)e.damage=e.baseDamage*e.mechBoost;
  tickTracks(g,e,dt);
 }
 tickHazards(g,run,dt);
}
/** Endtruhe (Etappe 3, Plan 11 / Analyse Verbesserung 7): nach Big B einmal je Durchgang eine Wahl aus drei seltenen Teilen plus
 *  Siegelmarken. Liegt als Beute-Moment mit Wahl (choice) in der Schatzkammer; nichts wird ungefragt angelegt. → Beutel oder null. */
export function openDungeonChest(g){
 const run=dungeonRun(g),c=run?.def.chest;if(!c)return null;
 if(!run.killed.has(c.boss)){g.toast?.(T.chest.locked);return null;}
 if(run.chest){g.toast?.(T.chest.empty);return null;}
 const R=REWARDS.chest,level=Math.max(1,Math.min(g.player.level+1,(DUNGEON_BOSSES[c.boss]?.level||10)+1)),rnd=()=>g.lootRandom?g.lootRandom():g.random(),specs=['tresen','bass','pfand'],slots=[...R.slots],items=[];
 for(let i=0;i<R.choices&&slots.length;i++){const slot=slots.splice(Math.floor(rnd()*slots.length),1)[0];items.push({id:registerRoll(g.rpg,ITEMS,{slot,spec:specs[i%specs.length],level,quality:R.quality,family:DUNGEON_BOSSES[c.boss]?.family||'bigb',roll:Math.floor(rnd()*1000)}),count:1});}
 run.chest=true;const rec=record(g,run.id);rec.marks+=R.marks;const pt=toWorld(run.def,c.floor,c.x,c.y);
 const bag={id:'chest-'+(++g.rpg.sequence),x:pt.x,y:pt.y,coins:0,items,source:{name:T.chest.title,kind:'chest'},moment:true,choice:1,noEquip:true,reach:c.range*U+40,reward:{boss:c.boss,marks:R.marks,xp:0,chest:true}};
 g.rpg.loot.push(bag);g.emit?.('rpgChanged');g.emit?.('dungeonChest',{bagId:bag.id});g.emit?.('save');return bag;
}
/** Erfolge beim Sieg über einen Boss (DUNGEON_FEATS): „Der Nachsatz zählt" = Big B ohne einen Treffer durch eine gelogene Kanonenkugel. */
function grantFeats(g,run,e,bossId){
 const rec=record(g,run.id),out=[];rec.feats||=[];
 for(const [id,f] of Object.entries(FEATS)){if(f.boss!==bossId||rec.feats.includes(id))continue;if(f.check==='noLieHits'&&(e.lieHits||0)>0)continue;
  rec.feats.push(id);out.push(id);g.toast?.(T.feat(f.name));g.emit?.('dungeonFeat',{id,name:f.name});}
 return out;
}
/** Schadensfaktor gegen Dungeon-Gegner (Schildwall: Treffer von vorn gedämpft). */
export function dungeonDamageFactor(g,e){
 if(!(e.frontGuard>0))return e.takenFactor||1;/* Etappe 3: Beweise und Geständnis (takenFactor) */const a=Math.atan2(g.player.y-e.y,g.player.x-e.x);return Math.abs(norm(a-(e.frontAngle??0)))<Math.PI/3?e.frontFactor??1:1;
}
/** Kill eines Dungeon-Gegners: kein Wiederkommen, Pappe fällt, geräumte Packs bleiben im Laufstand liegen, Boss gibt Siegel,
 *  Siegelmarken und beim ersten Abschluss des Flügels am Tag den Tagesbonus (E-71). Die Boss-EP selbst kommen über killXp (xp). */
export function onDungeonKill(g,e){
 e.respawnAt=Infinity;const run=dungeonRun(g);
 if(e.cardboard){g.float?.(e.x,e.y-30,'PAPPE','#e8dcc0');const lines=T.cardboard;g.toast?.(lines[Math.floor(g.random()*lines.length)]);}
 if(run&&e.pack&&!g.enemies.some(o=>o!==e&&o.pack===e.pack&&o.hp>0))run.trash.add(e.pack);
 /* Farm-Lücke (Etappe 3): Helfer eines Bosses, der heute schon lag (Stand beim Rufen), geben wie er nur repeatXp */if(e.repeatAdd&&e.xp)e.xp=Math.round(e.xp*REWARDS.repeatXp);
 if(!e.dungeonBoss||!run)return;const b=e.dungeonBoss;run.killed.add(b.id);run.version++;
 const rec=record(g,run.id),today=dungeonToday(g,run.id);
 if(b.seal){run.seals.add(b.seal);if(!today.seals.includes(b.seal))today.seals.push(b.seal);g.toast?.(T.seal[b.seal]);}
 if(!rec.bosses.includes(b.id))rec.bosses.push(b.id);
 // Farm-Lücke (Etappe 3, E-71): der erste Sieg über diesen Boss am Tag gibt die vollen Boss-EP, jede Wiederholung am selben Tag nur
 // repeatXp (ein Drittel) – wie Instanz-Limits in WoW. Beute und Siegelmarken bleiben. killXp liest e.xp direkt danach (engine.kill).
 const kills=today.kills||(today.kills={}),repeat=(kills[b.id]||0)>0;kills[b.id]=(kills[b.id]||0)+1;if(repeat&&e.xp)e.xp=Math.round(e.xp*REWARDS.repeatXp);
 // Abschluss (final, Big B): Abschlüsse, Bestzeit und erster Abschluss des Tages mit Tagesbonus
 const final=!!DUNGEON_BOSSES[b.id]?.final,firstFinal=final&&!today.final;let secs=0;if(final){today.final=true;rec.clears++;secs=Math.max(1,Math.round(run.elapsed||0));if(!rec.best||secs<rec.best)rec.best=secs;if(!rec.firstClear)rec.firstClear=clock(g);}
 const wing=(run.def.wings||[]).find(w=>w.boss===b.id),first=!!wing&&!today.wings.includes(wing.id)||firstFinal;if(wing&&first)today.wings.push(wing.id);
 const marks=REWARDS.marksPerBoss+(first?REWARDS.daily.marks:0),bonus=first?Math.round((e.xp||0)*REWARDS.daily.xp):0;rec.marks+=marks;
 const feats=grantFeats(g,run,e,b.id);
 e.dungeonReward={boss:b.id,marks,xp:(e.xp||0)+bonus,daily:first,wing:wing?.id||null,repeat,final,feats};if(bonus)g.gainXp?.(bonus);
 const line=T.bossLines[b.id]?.defeat;if(line)g.bark?.(e,line,'boss');g.emit?.('dungeonBoss',{id:b.id});g.emit?.('dungeonReward',{...e.dungeonReward});g.emit?.('save');
 if(final){run.hazards=[];g.log?.(T.cleared(clockText(secs)));}
}
const clockText=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' min';

// ── Wegmarke auf der Dungeon-Karte (Etappe 2, Plan §5.3) ──────────────────────────────────────────────────────
/** Ist ein Übergang von dieser Seite aus gerade benutzbar? (dieselben Regeln wie dungeonStep, ohne Kampf) */
function stepUsable(run,t,side){if(t.oneWay&&t.oneWay!==side)return false;if(t.secret&&!run.secrets.has(t.secret))return false;if(t.gate?.boss&&t.gate.side===side&&!run.killed.has(t.gate.boss))return false;if(t.unlock&&!run.unlocked.has(t.id)&&side!==t.unlock)return false;return true;}
/** Erster Übergang auf dem Weg von Ebene `from` nach `to` (Breitensuche über die Übergänge) → {t,side} oder null. */
export function floorRoute(run,from,to){if(from===to)return null;const seen=new Set([from]),queue=[{floor:from,first:null}];
 while(queue.length){const cur=queue.shift();for(const t of run.def.transitions)for(const side of ['a','b']){const s=t[side],o=t[side==='a'?'b':'a'];if(s.floor!==cur.floor||o.floor===cur.floor||seen.has(o.floor)||!stepUsable(run,t,side))continue;const first=cur.first||{t,side};if(o.floor===to)return first;seen.add(o.floor);queue.push({floor:o.floor,first});}}
 return null;}
/** Wegmarke setzen ({floor,x,y} in Weltpunkten); nur auf begehbarem Boden. false = kein Platz dort. */
export function setDungeonWaypoint(g,pt){const run=dungeonRun(g);if(!run||!pt)return false;const f=floorAt(run.def,pt.x,pt.y);if(!f||f!==pt.floor)return false;const c=g.world.findClear(pt.x,pt.y,7);if(!c||Math.hypot(c.x-pt.x,c.y-pt.y)>40)return false;run.waypoint={floor:f,x:c.x,y:c.y};return true;}
/** Ziel für den Pfeil am Helden: die Wegmarke auf dieser Ebene, sonst der nächste Übergang dorthin. Erreicht → Marke fällt weg. */
export function dungeonDestination(g){const run=dungeonRun(g),wp=run?.waypoint;if(!wp)return null;const p=g.player,here=floorAt(run.def,p.x,p.y);
 if(here===wp.floor){if(dist(p,wp)<24){run.waypoint=null;return null;}return {point:{x:wp.x,y:wp.y},label:T.map?.waypoint||'Wegmarke'};}
 const step=floorRoute(run,here,wp.floor);if(!step)return {point:{x:wp.x,y:wp.y},label:'',unreachable:true};const s=step.t[step.side];return {point:toWorld(run.def,s.floor,s.x,s.y),label:stepLabel(step.t,step.side),step:step.t.id};}
