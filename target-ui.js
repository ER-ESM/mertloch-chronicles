// Zielwahl per Maus: Treffertest für Gegner, NPCs, Dorfbewohner und Mitspieler, Mouse-Over-Zustand und Leuchtrahmen.
// Gegner bleiben in game.target (Kampflogik), freundliche Ziele liegen in game.friend = {kind,ref}.
import {TARGET_RULES as R,TARGET_UI,VILLAGERS} from './content/index.js';
import {tutorialActive} from './tutorial.js';
import {inKiosk} from './kiosk-instance.js';
import {companionAid,selectCompanionAid} from './companions.js';
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
 if(open&&g.hotspots)for(const h of hotspotLayout(w).hotspots)if(h.regular&&onPlayerFloor(g,h.giver))list.push({kind:'regular',ref:h.giver,x:h.giver.x,y:h.giver.y,name:h.giver.name});
 if(open)for(const q of w.quests||[])list.push({kind:'questgiver',ref:q.giver,x:q.giver.x,y:q.giver.y,name:q.giver.name});
 for(const a of g.life?.actors||[])if(a.kind==='villager')list.push({kind:'resident',ref:a,x:a.x,y:a.y,name:VILLAGERS.find(v=>v.variant===a.variant)?.name||TARGET_UI.kinds.resident});
 for(const o of g.others||[]){const p=remotePosition(o,now);list.push({kind:o.party?'party':'player',ref:o,x:p.x,y:p.y,name:o.name,level:o.level,hp:o.hp??100,state:o.state});}
 if(open)for(const c of g.companions||[])list.push({kind:'companion',ref:c,x:c.x,y:c.y,name:c.name,level:c.level,hp:c.hp/c.maxHp*100,state:c.state==='down'?'dead':c.state});
 return list;
}
/** Einheit unter dem Weltpunkt; Gegner gewinnen bei Überlappung (Kampf geht vor). → {kind:'enemy',ref,x,y}|freundliche Einheit|null */
export function unitAt(g,x,y,now){
 const at={x,y:y+R.hitLift};
 if(!inKiosk(g)){const e=g.enemies.filter(e=>selectableEnemy(g,e)&&hyp(at,e)<(e.type==='boss'?R.bossHitRadius:R.hitRadius)).sort((a,b)=>hyp(at,a)-hyp(at,b))[0];if(e)return {kind:'enemy',ref:e,x:e.x,y:e.y,name:e.name};}
 return friendlyUnits(g,now).filter(u=>hyp(at,u)<R.hitRadius).sort((a,b)=>hyp(at,a)-hyp(at,b))[0]||null;
}
/** Aktuelle Daten des gewählten freundlichen Ziels; null, sobald es nicht mehr existiert (Spieler weg, Tutorial, Kiosk). */
export function friendUnit(g,now){const f=g.friend;if(!f)return null;const name=f.ref?.name;return friendlyUnits(g,now).find(u=>u.ref===f.ref||(f.player&&u.ref.name===name&&(u.kind==='player'||u.kind==='party')))||null;}
/** Klick-Zielwahl: setzt Gegner oder freundliches Ziel. → gewählte Einheit oder null */
export function selectUnitAt(g,x,y){
 const u=unitAt(g,x,y);if(!u)return null;
 if(u.kind==='companion'){selectCompanionAid(g,u.ref.id);return u;}
 if(u.kind==='enemy'){g.friend=null;g.target=u.ref;g.emit('target');return u;}
 g.target=null;g.stopAuto?.();g.friend={kind:u.kind,ref:u.ref,player:u.kind==='player'||u.kind==='party'};g.emit('target');return u;
}
export function clearFriend(g){if(g.friend){g.friend=null;return true;}return false;}
/** Je Bild aufrufen: Ein neu gewählter Gegner (Tab, Autoangriff, Angriff auf dich) löst das freundliche Ziel ab; verschwundene Ziele fallen weg. */
export function syncFriend(g){if(!g.friend)return;if(g.friend.kind!=='companion'&&g.target?.hp>0||!friendUnit(g))g.friend=null;}

export function ringColor(g,u){if(u.kind!=='enemy')return R.ring[u.kind==='party'?'party':u.kind==='player'?'player':'friendly'];const e=u.ref;return e.behavior==='neutral'&&!e.aggro?R.ring.neutral:R.ring.enemy;}
function ring(c,x,y,rad,color,glow,alpha,width){c.save();c.globalAlpha=alpha;c.shadowColor=color;c.shadowBlur=glow;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y+1,rad,rad*.4,0,0,Math.PI*2);c.stroke();c.stroke();c.restore();}
/** Bodenrahmen unter den Figuren: gewähltes freundliches Ziel und Mouse-Over. Der Gegner-Zielring bleibt im Renderer. */
export function drawTargetRings(c,g,time){
 const now=performance.now(),f=friendUnit(g,now),aid=!inKiosk(g)&&companionAid(g);
 if(aid&&f?.ref!==aid)ring(c,aid.x,aid.y,18,R.ring.party,R.selectGlow,1,1.5);
 if(f)ring(c,f.x,f.y,18,ringColor(g,f),R.selectGlow,1,1.5);
 const h=g.hover&&!g.aiming?unitAt(g,g.hover.x,g.hover.y,now):null;g.hoverUnit=h;
 if(h&&h.ref!==g.target&&h.ref!==f?.ref)ring(c,h.x,h.y,h.ref.type==='boss'?30:18,ringColor(g,h),R.hoverGlow,R.hoverAlpha+Math.sin(time*R.pulse)*.2,2);
 else if(h)ring(c,h.x,h.y,h.ref.type==='boss'?30:18,ringColor(g,h),R.hoverGlow,.55,2.5);
}
/** Zielrahmen-Daten für das freundliche Ziel. */
export function friendPanel(g,u){const companion=u.kind==='companion',player=companion||u.kind==='player'||u.kind==='party';return {name:u.name,level:(TARGET_UI.kinds[u.kind]||'')+(u.level?' · '+TARGET_UI.level(u.level):''),hp:player?Math.max(0,Math.min(100,u.hp)):100,hpText:companion?Math.ceil(u.ref.hp)+' / '+u.ref.maxHp:player?Math.round(u.hp)+' %':'',effect:player&&u.state==='dead'?TARGET_UI.dead:companion?TARGET_UI.companionAid:player&&u.state==='combat'?TARGET_UI.fight:TARGET_UI.effect[u.kind],disposition:companion?'party':player?u.kind:'friendly'};}
