// Zielwahl per Maus: Treffertest für Gegner, NPCs, Dorfbewohner und Mitspieler, Mouse-Over-Zustand und Leuchtrahmen.
// Ein Ziel (E-65): Gegner liegen in game.target (Kampflogik), freundliche Ziele in game.friend = {kind,ref,player};
// höchstens eines von beiden ist gesetzt (help-target.js).
import {TARGET_RULES as R,TARGET_UI,VILLAGERS} from './content/index.js';
import {tutorialActive} from './tutorial.js';
import {inKiosk} from './kiosk-instance.js';
import {selectFriend,selectEnemy} from './help-target.js';
import {hotspotLayout,onPlayerFloor} from './hotspots.js';

const hyp=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Mitspieler werden zwischen zwei Schnappschüssen interpoliert – Treffertest und Rahmen brauchen dieselbe Position wie der Renderer. */
export function remotePosition(o,now=performance.now()){const k=Math.min(1,(now-(o.at||0))/(o.lerp||2000));return {x:(o.fromX??o.x)+(o.x-(o.fromX??o.x))*k,y:(o.fromY??o.y)+(o.y-(o.fromY??o.y))*k};}
const selectableEnemy=(g,e)=>(!tutorialActive(g)||e.tutorial||e.arena)&&e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0);

/** Alle freundlichen Einheiten der offenen Welt als {kind,ref,x,y,name,level?,hp?}. */
export function friendlyUnits(g,now){
 if(inKiosk(g))return [];
 const w=g.world,open=!tutorialActive(g),list=[];
 if(w.npc)list.push({kind:'npc',ref:w.npc,x:w.npc.x,y:w.npc.y,name:w.npc.name});
 if(open)for(const m of w.mentors||[])list.push({kind:'mentor',ref:m,x:m.x,y:m.y,name:m.name});
 // Stammgäste der Bude (E-61): ansprechbar wie Mentoren, nur auf dem Geschoss des Helden.
 // Runde 3a: auch die Auftraggeber der Treffpunkte (z. B. Hedwig am Clan-Treff) – Rechtsklick läuft hin und redet.
 if(open&&g.hotspots)for(const h of hotspotLayout(w).hotspots)if(onPlayerFloor(g,h.giver))list.push({kind:'regular',ref:h.giver,x:h.giver.x,y:h.giver.y,name:h.giver.name});
 if(open)for(const q of w.quests||[])list.push({kind:'questgiver',ref:q.giver,x:q.giver.x,y:q.giver.y,name:q.giver.name});
 for(const a of g.life?.actors||[])if(a.kind==='villager')list.push({kind:'resident',ref:a,x:a.x,y:a.y,name:VILLAGERS.find(v=>v.variant===a.variant)?.name||TARGET_UI.kinds.resident});
 for(const o of g.others||[]){const p=remotePosition(o,now);list.push({kind:o.party?'party':'player',ref:o,x:p.x,y:p.y,name:o.name,level:o.level,hp:o.hp??100,state:o.state});}
 if(open)for(const c of g.companions||[])list.push({kind:'companion',ref:c,x:c.x,y:c.y,name:c.name,level:c.level,hp:c.hp/c.maxHp*100,state:c.state==='down'?'dead':c.state});
 return list;
}
// Genau der angeklickte Gegner (Runde 3a, 2026-09-24, Kenner-Befund 2): Zuerst zählt die gezeichnete Figur – liegt der Punkt in
// ihrem Bild (Füße bis Oberkante e.spriteTop aus dem Renderer), gewinnt die vorderste (zuletzt gezeichnete, größtes y). Dann das
// Namensschild samt Lebensbalken (e.plateAt, im Nahkampf seitlich neben dem Helden). Erst danach der alte Kreis um die Körpermitte.
const spriteTopOf=e=>e.spriteTop??e.y-(e.type==='boss'?35:e.type==='cultist'?30:23);
export function spriteHit(e,pt){const top=spriteTopOf(e),h=Math.max(10,e.y+4-top),half=Math.max(8,Math.min(22,h*(e.type==='wolf'?.62:.36)));return pt.x>=e.x-half&&pt.x<=e.x+half&&pt.y>=top&&pt.y<=e.y+4;}
/** Runde 5a (Kenner: Rechtsklick auf einen laufenden Dachs traf daneben): Bei gedrosselter Darstellung liegt zwischen gezeichnetem
 *  Bild und Klick bis zu ein Bild (250 ms bei 4 Bildern/s). Der Treffer zählt deshalb auch auf den Lagen der letzten TRAIL ms
 *  (e.seenAt aus dem Renderer) und mit Vorhalt 150 ms in Laufrichtung. */
export const TRAIL={ms:350,lead:.15};
export function trailHit(e,pt,now=performance.now()){const tr=e.seenAt;if(!tr?.length)return false;const top=spriteTopOf(e)-e.y;
 const recent=tr.filter(s=>now-s.t<=TRAIL.ms);for(const s of recent)if(spriteHit({...e,x:s.x,y:s.y,spriteTop:s.y+top},pt))return true;
 const old=recent[0];if(old&&now-old.t>30){const k=TRAIL.lead*1000/(now-old.t),lx=e.x+(e.x-old.x)*k,ly=e.y+(e.y-old.y)*k;if(spriteHit({...e,x:lx,y:ly,spriteTop:ly+top},pt))return true;}
 return false;}
export function plateHit(e,pt,now=performance.now()){const q=e.plateAt;return !!q&&now-q.t<400&&pt.x>=q.x-24&&pt.x<=q.x+24&&pt.y>=q.y-11&&pt.y<=q.y+9;}
/** Gegner unter dem Weltpunkt (x,y = Mauspunkt ohne Anhebung). */
export function enemyAt(g,x,y,now=performance.now()){
 const pt={x,y},at={x,y:y+R.hitLift},list=g.enemies.filter(e=>selectableEnemy(g,e));
 const drawn=list.filter(e=>spriteHit(e,pt)).sort((a,b)=>b.y-a.y)[0];if(drawn)return drawn;
 const plate=list.filter(e=>plateHit(e,pt,now)).sort((a,b)=>b.y-a.y)[0];if(plate)return plate;
 const moving=list.filter(e=>trailHit(e,pt,now)).sort((a,b)=>b.y-a.y)[0];if(moving)return moving;
 return list.filter(e=>hyp(at,e)<(e.type==='boss'?R.bossHitRadius:R.hitRadius)).sort((a,b)=>hyp(at,a)-hyp(at,b))[0]||null;
}
/** Rechteck von den Füßen bis über das Auftragszeichen (Auftraggeber) bzw. den Kopf (übrige). */
export const FRIEND_BOX={half:11,foot:4,head:34,badge:58};
const BADGED=['npc','mentor','regular','questgiver'];
export function friendBoxHit(u,pt){const top=u.y-(BADGED.includes(u.kind)?FRIEND_BOX.badge:FRIEND_BOX.head);return pt.x>=u.x-FRIEND_BOX.half&&pt.x<=u.x+FRIEND_BOX.half&&pt.y>=top&&pt.y<=u.y+FRIEND_BOX.foot;}
/** Einheit unter dem Weltpunkt; Gegner gewinnen bei Überlappung (Kampf geht vor). → {kind:'enemy',ref,x,y}|freundliche Einheit|null */
export function unitAt(g,x,y,now){
 const at={x,y:y+R.hitLift};
 if(!inKiosk(g)){const e=enemyAt(g,x,y);if(e)return {kind:'enemy',ref:e,x:e.x,y:e.y,name:e.name};}
 // Dorfbewohner laufen oft über Ida und die Auftraggeber: bei Überlappung gewinnt, wer etwas zu sagen hat (Runde 3a).
 const list=friendlyUnits(g,now),pt={x,y};
 /* Runde 5a (Kenner: Rechtsklick unter dem „!“ traf den falschen NPC): Trefferfläche = Figur + Auftragszeichen darüber; vorn gewinnt */
 const boxed=list.filter(u=>friendBoxHit(u,pt)).sort((a,b)=>(a.kind==='resident')-(b.kind==='resident')||b.y-a.y)[0];if(boxed)return boxed;
 return list.filter(u=>hyp(at,u)<R.hitRadius).sort((a,b)=>(a.kind==='resident')-(b.kind==='resident')||hyp(at,a)-hyp(at,b))[0]||null;
}
/** Aktuelle Daten des gewählten freundlichen Ziels; null, sobald es nicht mehr existiert (Spieler weg, Tutorial, Kiosk). */
export function friendUnit(g,now){const f=g.friend;if(!f)return null;const name=f.ref?.name;return friendlyUnits(g,now).find(u=>u.ref===f.ref||(f.player&&u.ref.name===name&&(u.kind==='player'||u.kind==='party')))||null;}
/** Klick-Zielwahl: setzt Gegner ODER freundliches Ziel (das jeweils andere fällt weg). → gewählte Einheit oder null */
export function selectUnitAt(g,x,y){
 const u=unitAt(g,x,y);if(!u)return null;
 if(u.kind==='enemy')selectEnemy(g,u.ref);else selectFriend(g,u.kind,u.ref);
 return u;
}
/** Je Bild aufrufen: Ein neu gewählter Gegner (Tab, Autoangriff, Kniff) löst das freundliche Ziel ab; verschwundene Ziele fallen weg. */
export function syncFriend(g){if(!g.friend)return;if(g.target?.hp>0||!friendUnit(g))g.friend=null;}

export function ringColor(g,u){if(u.kind!=='enemy')return R.ring[u.kind==='party'?'party':u.kind==='player'?'player':'friendly'];const e=u.ref;return e.behavior==='neutral'&&!e.aggro?R.ring.neutral:R.ring.enemy;}
export function ring(c,x,y,rad,color,glow,alpha,width){c.save();c.globalAlpha=alpha;c.shadowColor=color;c.shadowBlur=glow;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y+1,rad,rad*.4,0,0,Math.PI*2);c.stroke();c.stroke();c.restore();}
/** Bodenrahmen unter den Figuren: gewähltes freundliches Ziel und Mouse-Over. Der Gegner-Zielring bleibt im Renderer. */
export function drawTargetRings(c,g,time){
 const now=performance.now(),f=friendUnit(g,now);
 if(f)ring(c,f.x,f.y,18,ringColor(g,f),R.selectGlow,1,1.5);
 const h=g.hover&&!g.aiming?unitAt(g,g.hover.x,g.hover.y,now):null;g.hoverUnit=h;
 if(h&&h.ref!==g.target&&h.ref!==f?.ref)ring(c,h.x,h.y,h.ref.type==='boss'?30:18,ringColor(g,h),R.hoverGlow,R.hoverAlpha+Math.sin(time*R.pulse)*.2,2);
 else if(h)ring(c,h.x,h.y,h.ref.type==='boss'?30:18,ringColor(g,h),R.hoverGlow,.55,2.5);
}
/** Zielrahmen-Daten für das freundliche Ziel. */
export function friendPanel(g,u){const companion=u.kind==='companion',player=companion||u.kind==='player'||u.kind==='party';return {name:u.name,level:(TARGET_UI.kinds[u.kind]||'')+(u.level?' · '+TARGET_UI.level(u.level):''),hp:player?Math.max(0,Math.min(100,u.hp)):100,hpText:companion?Math.ceil(u.ref.hp)+' / '+u.ref.maxHp:player?Math.round(u.hp)+' %':'',effect:player&&u.state==='dead'?TARGET_UI.dead:player&&u.state==='combat'?TARGET_UI.fight:TARGET_UI.effect[u.kind],disposition:companion?'party':player?u.kind:'friendly'};}
