// Startreihe und Aushänge (E-55): Lage, Tiergebiete, Fortschritt, Drops und Abgabe.
// Die Lage entsteht aus der fertigen Welt mit eigenem Zufall – world.js und sein gemeinsamer Zufallsstrom bleiben
// unberührt, Bäume, Lager und Nebenaufträge liegen deshalb wie bisher. Inhalte (Arten, Zahlen, Texte): content/hotspots.js.
import {rng,distance} from './world.js';
import {inhabitable,makeEnemy,walkClear,ENCOUNTER_RULES} from './encounters.js';
import {HOTSPOTS,WORLD_NOTICES,HOTSPOT_RULES,HOTSPOT_UI,ARCHETYPES,ELITES,NPCS,ITEM_CATALOG} from './content/index.js';
import {addItem,countItem,consumeMaterials} from './rpg.js';
import {tutorialActive} from './tutorial.js';

const R=HOTSPOT_RULES,layouts=new WeakMap();
const speciesDef=kind=>ARCHETYPES[kind]||ELITES[kind];
export const speciesOf=e=>e.archetype||e.family;
export const speciesName=kind=>speciesDef(kind)?.name||kind;
const QUESTS=new Map([...HOTSPOTS.flatMap(h=>h.quests.map(q=>[q.id,{...q,hotspot:h.id}])),...WORLD_NOTICES.map(n=>[n.id,{...n,notice:true}])]);
export const hotspotQuest=id=>QUESTS.get(id);
export const hotspotQuests=()=>[...QUESTS.values()];

// ---------------------------------------------------------------- Lage
function anchorPoint(w,anchor){
 if(anchor==='kiosk'){const k=w.places?.kiosk;return k?.entrance||k?.approach||k||null;}
 if(anchor?.startsWith('hub:'))return w.hubs?.find(h=>h.id===anchor.slice(4))||null;
 if(anchor==='ida')return w.npc||null;
 return null;
}
const reachable=(w,a,b)=>{const path=w.findPath?.(a,b);return !w.findPath||Array.isArray(path)&&path.length>0;};
/** Mittelpunkt eines Gebiets: frei, bewohnbar, erreichbar, mit Abstand zu Kapitel-Lagern und anderen Gebieten. */
function placeArea(w,from,range,random,taken){const [dMin,dMax]=range,start=random()*Math.PI*2;
 for(const strict of [true,false])for(let i=0;i<60;i++){const a=start+i*2.39996,d=dMin+(dMax-dMin)*((i*7)%11)/10,p={x:Math.round(from.x+Math.cos(a)*d),y:Math.round(from.y+Math.sin(a)*d)};
  if(!inhabitable(w,p))continue;if(strict&&((w.camps||[]).some(c=>distance(c,p)<R.campDistance)||taken.some(t=>distance(t,p)<R.areaSpacing)))continue;
  if(!reachable(w,from,p))continue;return p;}
 return null;
}
function spawnSpots(w,center,radius,spawns,random){const spots=[],total=spawns.reduce((n,s)=>n+s.count,0);
 for(let i=0;i<total*10&&spots.length<total;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*radius,p={x:Math.round(center.x+Math.cos(a)*r),y:Math.round(center.y+Math.sin(a)*r)};
  if(!inhabitable(w,p)||!walkClear(w,center,p,9)||spots.some(s=>distance(s,p)<26))continue;spots.push(p);}
 while(spots.length&&spots.length<total)spots.push({...spots[spots.length%Math.max(1,spots.length)]});
 let k=0;return spawns.flatMap(s=>Array.from({length:s.count},()=>({kind:s.kind,...(spots[k++]||center)})));
}
function giverSpot(w,anchor,toward){const d=distance(anchor,toward)||1,ux=(toward.x-anchor.x)/d,uy=(toward.y-anchor.y)/d;
 for(const off of [R.giverOffset,R.giverOffset*.7,R.giverOffset*1.3,R.giverOffset*.4]){const p=w.findClear?w.findClear(Math.round(anchor.x+ux*off),Math.round(anchor.y+uy*off),9):{x:anchor.x+ux*off,y:anchor.y+uy*off};
  if(p&&!(w.quests||[]).some(q=>distance(q.giver,p)<34)&&reachable(w,anchor,p))return {x:Math.round(p.x),y:Math.round(p.y)};}
 return {x:Math.round(anchor.x),y:Math.round(anchor.y)};
}
/** Lage aller Hotspots und Aushänge einer Welt – deterministisch aus dem Seed, einmal je Welt berechnet. */
export function hotspotLayout(w){
 if(layouts.has(w))return layouts.get(w);
 // Nur echte Welten mit Wegenetz tragen Hotspots; Testattrappen und leere Welten bekommen eine leere Lage.
 if(!w?.nodes?.length||!w.onRoad||!w.findPath){const empty={hotspots:[],notices:[],areas:[]};if(w&&typeof w==='object')layouts.set(w,empty);return empty;}
 const random=rng((w.seed^0x51ed270b)>>>0),taken=[],areas=[],hotspots=[],notices=[];
 // Geber: der erste passende, der in dieser Welt nicht schon Nebenaufträge vergibt und kein Mentor ist – keine doppelten Leute.
 const busy=new Set([...(w.quests||[]).map(q=>q.giver?.npc).filter(Boolean),'ida','dieter','baerbel','kevin']);
 for(const h of HOTSPOTS){const anchor=anchorPoint(w,h.anchor)||w.spawn,center=placeArea(w,anchor,h.area.distance,random,taken);if(!center)continue;taken.push(center);
  const area={id:h.id,x:center.x,y:center.y,r:h.area.radius,spawns:spawnSpots(w,center,h.area.radius,h.area.spawns,random),species:[...new Set(h.area.spawns.map(s=>s.kind))]};areas.push(area);
  const npc=h.givers.find(id=>!busy.has(id))||h.givers[0];busy.add(npc);hotspots.push({id:h.id,name:h.name,def:h,anchor,area,giver:{...giverSpot(w,anchor,center),npc,name:NPCS[npc]?.name||npc}});}
 for(const n of WORLD_NOTICES){const [lo,hi]=n.ring;let spot=null;
  for(let i=0;i<80&&!spot;i++){const a=random()*Math.PI*2,d=lo+random()*(hi-lo),p={x:Math.round(w.spawn.x+Math.cos(a)*d),y:Math.round(w.spawn.y+Math.sin(a)*d)};
   if(inhabitable(w,p)&&!taken.some(t=>distance(t,p)<R.areaSpacing)&&reachable(w,w.spawn,p))spot=p;}
  if(!spot)continue;const center=placeArea(w,spot,n.area.distance,random,taken);if(!center)continue;taken.push(center);
  const area={id:n.id,x:center.x,y:center.y,r:n.area.radius,spawns:spawnSpots(w,center,n.area.radius,n.area.spawns,random),species:[...new Set(n.area.spawns.map(s=>s.kind))],notice:true};areas.push(area);
  notices.push({id:n.id,def:n,x:spot.x,y:spot.y,area});}
 const layout={hotspots,notices,areas};layouts.set(w,layout);return layout;
}
/** Text mit Namen: {giver} = Geber des Hotspots, {next} = wo die Überleitung endet bzw. der nächste Geber. */
export function fillText(g,q,text){if(!text||!q||q.notice)return text||'';const i=HOTSPOTS.findIndex(h=>h.id===q.hotspot),next=q.turnIn&&q.turnIn!==q.hotspot?q.turnIn:HOTSPOTS[i+1]?.id||'ida';
 return text.replaceAll('{giver}',giverPoint(g,q.hotspot)?.name||'').replaceAll('{next}',giverPoint(g,next)?.name||'');}
export const questTitle=(g,q)=>fillText(g,q,q.title);
/** Standort eines Gebers oder Abgabeorts ('ida' = Kisten-Ida in der Bude). */
export function giverPoint(g,id){if(id==='ida')return g.world.npc?{x:g.world.npc.x,y:g.world.npc.y,npc:'ida',name:g.world.npc.name||NPCS.ida?.name}:null;return hotspotLayout(g.world).hotspots.find(h=>h.id===id)?.giver||null;}

// ---------------------------------------------------------------- Zustand
/** Spielstand: {quests:{[id]:{accepted,count,claimed}}, found:[Aushang-IDs], tracked}. Fremde IDs fallen heraus. */
export function restoreHotspots(saved){const quests={};for(const [id,s] of Object.entries(saved?.quests||{}))if(QUESTS.has(id)&&s&&typeof s==='object')quests[id]={accepted:!!s.accepted,count:Math.max(0,Math.floor(Number(s.count)||0)),claimed:!!s.claimed};
 return {quests,found:Array.isArray(saved?.found)?saved.found.filter(id=>QUESTS.get(id)?.notice):[],tracked:QUESTS.has(saved?.tracked)?saved.tracked:null};}
const entry=(g,id)=>g.hotspots.quests[id]||(g.hotspots.quests[id]={accepted:false,count:0,claimed:false});
export function questProgress(g,id){const q=QUESTS.get(id),s=g.hotspots.quests[id];if(!q||!s)return 0;const o=q.objective;return o.kind==='drop'?Math.min(o.count,countItem(g.rpg,o.item)):o.kind==='kill'?Math.min(o.count,s.count):0;}
const need=q=>q.objective.kind==='talk'?0:q.objective.count;
/** locked | low (Stufe fehlt) | available | accepted | ready | claimed */
export function questStatus(g,id){const q=QUESTS.get(id);if(!q)return 'locked';const s=g.hotspots.quests[id];
 if(s?.claimed)return 'claimed';if(s?.accepted)return questProgress(g,id)>=need(q)?'ready':'accepted';
 if(tutorialActive(g))return 'locked';if(q.notice&&!g.hotspots.found.includes(id))return 'locked';
 if((q.requires||[]).some(r=>!g.hotspots.quests[r]?.claimed))return 'locked';
 return g.player.level<(q.minLevel||1)?'low':'available';}
/** Wo der Auftrag abgegeben wird: Überleitungen beim nächsten Geber, sonst beim eigenen. Aushänge schließen selbst ab. */
export const turnInOf=q=>q.notice?null:q.turnIn||q.hotspot;

function reward(g,q){const r=q.reward||{};if(r.item&&addItem(g.rpg,r.item,1)>0){g.toast(HOTSPOT_UI.bagFull);return false;}
 g.rpg.coins+=r.coins||0;g.gainXp(r.xp||0);return true;}
export function acceptHotspotQuest(g,id){if(questStatus(g,id)!=='available')return false;const q=QUESTS.get(id),s=entry(g,id);s.accepted=true;s.count=0;g.hotspots.tracked=id;g.trackedQuest=null;g.toast(HOTSPOT_UI.accepted(questTitle(g,q)));g.log(HOTSPOT_UI.accepted(questTitle(g,q)));g.emit('rpgChanged');return true;}
export function claimHotspotQuest(g,id){if(questStatus(g,id)!=='ready')return false;const q=QUESTS.get(id),o=q.objective;
 if(o.kind==='drop'&&!consumeMaterials(g.rpg,{[o.item]:o.count}))return false;
 if(!reward(g,q)){if(o.kind==='drop')addItem(g.rpg,o.item,o.count);return false;}
 const s=entry(g,id);s.claimed=true;if(g.hotspots.tracked===id)g.hotspots.tracked=nextTracked(g);
 g.toast(q.notice?HOTSPOT_UI.noticeReady(q.title):HOTSPOT_UI.claimed(questTitle(g,q)));g.log(HOTSPOT_UI.claimed(questTitle(g,q))+' · +'+(q.reward?.xp||0)+' EP');g.emit('rpgChanged');return true;}
const nextTracked=g=>hotspotQuests().find(q=>['accepted','ready'].includes(questStatus(g,q.id)))?.id||null;
export function trackHotspotQuest(g,id){if(!['accepted','ready'].includes(questStatus(g,id)))return false;g.hotspots.tracked=id;g.trackedQuest=null;return true;}
/** Aushang aufheben: startet den Auftrag sofort. */
export function readNotice(g,id){const n=QUESTS.get(id);if(!n?.notice||g.hotspots.found.includes(id)||tutorialActive(g))return false;g.hotspots.found.push(id);g.toast(HOTSPOT_UI.found(n.title));
 if(g.player.level>=(n.minLevel||1)){const s=entry(g,id);s.accepted=true;g.hotspots.tracked=id;g.trackedQuest=null;}g.emit('rpgChanged');return true;}

/** Treffer auf ein Tier: Kills zählen, Questgegenstände würfeln (nur solange der Auftrag läuft). */
export function onHotspotKill(g,e){if(!g.hotspots||e.arena||e.tutorial)return;const kind=speciesOf(e);
 for(const [id,s] of Object.entries(g.hotspots.quests)){if(!s.accepted||s.claimed)continue;const q=QUESTS.get(id),o=q?.objective;if(!o||o.species!==kind)continue;
  const before=questProgress(g,id);if(before>=o.count)continue;
  if(o.kind==='kill')s.count=Math.min(o.count,s.count+1);
  else if(o.kind==='drop'&&g.lootRandom()<o.chance){if(addItem(g.rpg,o.item,1)>0){g.toast(HOTSPOT_UI.bagFull);continue;}g.float(e.x,e.y-54,HOTSPOT_UI.dropped(ITEM_CATALOG[o.item].name),'#e8d49a');}
  if(questProgress(g,id)>=o.count&&before<o.count){if(q.notice)claimHotspotQuest(g,id);else{const at=giverPoint(g,turnInOf(q));g.toast(HOTSPOT_UI.ready(questTitle(g,q),at?.name||''));}}
  g.emit('rpgChanged');}
}

// ---------------------------------------------------------------- Welt: Interaktion, Ziel, Karte
/** Was der Geber an dieser Stelle anbietet: abgeben geht vor annehmen. */
export function giverOffers(g,giverId){const list=[];for(const q of QUESTS.values()){if(q.notice)continue;const st=questStatus(g,q.id);
  if(st==='ready'&&turnInOf(q)===giverId)list.push({q,action:'claim'});else if(['available','low'].includes(st)&&q.hotspot===giverId)list.push({q,action:st==='low'?'low':'accept'});else if(st==='accepted'&&(q.hotspot===giverId||turnInOf(q)===giverId))list.push({q,action:'progress'});}
 const rank={claim:0,accept:1,progress:2,low:3};return list.sort((a,b)=>rank[a.action]-rank[b.action]);}
/** Markierung über dem Geber und auf der Karte: '?' abgeben, '!' annehmen, '…' läuft, 'low' zu früh, null nichts. */
export function giverGlyph(g,giverId){const o=giverOffers(g,giverId)[0];return !o?null:o.action==='claim'?'?':o.action==='accept'?'!':o.action==='low'?'low':'…';}
export function hotspotInteraction(g){if(tutorialActive(g))return null;const p=g.player,L=hotspotLayout(g.world);
 for(const h of L.hotspots)if(distance(p,h.giver)<R.talkRange&&giverOffers(g,h.id).length)return {kind:'hotspot',giver:h.id,point:{x:h.giver.x,y:h.giver.y},name:h.giver.name,priority:4};
 const ida=giverPoint(g,'ida');if(ida&&distance(p,ida)<R.talkRange&&giverOffers(g,'ida').some(o=>o.action==='claim'))return {kind:'hotspot',giver:'ida',point:{x:ida.x,y:ida.y},name:ida.name,priority:4};
 for(const n of L.notices)if(!g.hotspots.found.includes(n.id)&&distance(p,n)<R.talkRange)return {kind:'notice',id:n.id,point:{x:n.x,y:n.y},name:n.def.title,priority:4};
 return null;}
/** Wegmarke für den verfolgten Auftrag: fertig → Abgabe, sonst Mitte des Zielgebiets. */
export function hotspotDestination(g){const id=g.hotspots?.tracked,q=id&&QUESTS.get(id);if(!q)return null;const st=questStatus(g,id);
 if(st==='ready'&&!q.notice){const at=giverPoint(g,turnInOf(q));return at&&{point:{x:at.x,y:at.y},label:at.name};}
 if(st!=='accepted')return null;if(q.objective.kind==='talk'){const at=giverPoint(g,turnInOf(q));return at&&{point:{x:at.x,y:at.y},label:at.name};}
 const area=hotspotLayout(g.world).areas.find(a=>a.id===(q.hotspot||q.id));return area&&{point:{x:area.x,y:area.y},label:questTitle(g,q)};}
/** Aufgabenzeile für Tracker, Questbuch und Karte. */
export function objectiveText(g,q){const o=q.objective,n=questProgress(g,q.id);
 if(o.kind==='talk'){const at=giverPoint(g,turnInOf(q));return HOTSPOT_UI.talk(at?.name||'');}
 const label=o.kind==='kill'?HOTSPOT_UI.kill(o.count,speciesName(o.species)):HOTSPOT_UI.drop(o.count,ITEM_CATALOG[o.item].name,speciesName(o.species));return label+' · '+n+'/'+o.count;}
/** Alles, was Karte und Minikarte zeigen: Geber mit Zeichen, Gebiete mit Arten, Zielgebiete laufender Aufträge. */
export function hotspotMapMarks(g){const L=hotspotLayout(g.world),givers=[],areas=[];
 for(const h of L.hotspots){const glyph=giverGlyph(g,h.id);if(glyph)givers.push({id:'hotspot:'+h.id,x:h.giver.x,y:h.giver.y,glyph,name:h.giver.name,title:h.name});}
 if(giverGlyph(g,'ida')==='?'){const ida=giverPoint(g,'ida');givers.push({id:'hotspot:ida',x:ida.x,y:ida.y,glyph:'?',name:ida.name,title:ida.name});}
 const active=new Set(hotspotQuests().filter(q=>questStatus(g,q.id)==='accepted'&&q.objective.species).map(q=>q.hotspot||q.id));
 for(const a of L.areas){const h=L.hotspots.find(x=>x.id===a.id),n=L.notices.find(x=>x.id===a.id);
  // Tiergebiete der Startreihe sind sichtbar, sobald der Hotspot freigeschaltet ist; Aushang-Gebiete erst nach dem Fund.
  const open=h?h.def.quests.some(q=>questStatus(g,q.id)!=='locked'):g.hotspots.found.includes(a.id);if(!open)continue;
  areas.push({id:a.id,x:a.x,y:a.y,r:a.r,active:active.has(a.id),label:a.species.map(speciesName).join(' · '),title:h?.name||n?.def.title});}
 return {givers,areas};}

// ---------------------------------------------------------------- Tiergebiete
/** Legt die Tiere der Gebiete in Spielernähe an (wie EncounterDirector: Datensätze behalten Leben und Wiederkehr). */
export class HotspotDirector{
 constructor(game){this.game=game;this.records=new Map();this.clock=0;}
 build(area,index){const g=this.game,w=g.world,random=rng((w.seed^Math.imul(index+7,2654435761))>>>0);
  const list=area.spawns.map((s,k)=>{const def=speciesDef(s.kind),e=makeEnemy({x:s.x,y:s.y},60000+index*40+k,{...def,campId:'hotspot-'+area.id,ambient:true,hotspot:area.id,archetype:s.kind,anchor:{x:area.x,y:area.y},roamRadius:Math.min(def.roamRadius||60,Math.round(area.r*.7)),roamWait:random()*4});
   e.spawnPoints=[{x:s.x,y:s.y},...area.spawns.filter((_,j)=>j!==k).slice(0,3).map(p=>({x:p.x,y:p.y}))];
   if(distance(e,g.player)<ENCOUNTER_RULES.spawnDistance){e.hp=0;e.respawnAt=g.time;e.dead=0;e.ai='waiting';}else{e.spawnGrace=ENCOUNTER_RULES.spawnGrace;e.ai='appearing';}return e;});
  this.records.set(area.id,list);return list;}
 tick(dt){const g=this.game;this.clock-=dt;if(this.clock>0||!g.world.nodes?.length||!g.hotspots)return;this.clock=.7;
  const areas=hotspotLayout(g.world).areas,active=new Set(g.enemies.map(e=>e.id));
  areas.forEach((a,i)=>{if(distance(a,g.player)>R.spawnRange)return;const list=this.records.get(a.id)||this.build(a,i);for(const e of list)if(!active.has(e.id))g.enemies.push(e);});}
}
