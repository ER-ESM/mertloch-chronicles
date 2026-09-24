// Rechtsklick auf einen Gegner läuft hin und greift an (Runde 2b, 2026-09-24, Neuling-Befunde 2 und 3, wie die Hilfe verspricht):
// Steht der Gegner außer Reichweite oder hinter einer Wand, sucht die Figur einen Weg (Wegsuche, sonst path-near.js so nah wie
// möglich) und läuft, bis der Autoangriff trifft: in Reichweite UND freie Sicht. Der Weg wird alle REPATH s neu gerechnet, weil
// der Gegner sich bewegt. Abbruch: eigene Bewegung (Tasten, Stick), ein anderer Laufbefehl, Zielwechsel, Autoangriff aus.
import {autoWeapons} from './auto-combat.js';
import {pathNear} from './path-near.js';
import {distance} from './world.js';

export const REPATH=.35;
const NO_PATH='Kein Weg dorthin.';
const keyMoving=g=>!!(g.touchMove?.x||g.touchMove?.y)||['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>g.keys.has(k));
/** Reichweite des Autoangriffs (ohne Waffe Faustkampf). */
export function autoReach(g){const unarmed=!autoWeapons(g)[0].type;return unarmed?35:(g.skills.find(s=>s.id==='auto')?.range||35);}
/** Trifft der Autoangriff das Ziel von hier? */
export const inStrike=(g,e)=>distance(g.player,e)<=autoReach(g)-4&&g.world.lineClear(g.player,e);

function stopHere(g){if(g.routeGoal===g.approach?.goal){g.moveTo=null;g.path=[];g.routeGoal=null;}g.approach=null;}
function route(g,a,first){
 const e=a.e,walk=g.walkWorld();let path=[];
 try{path=walk.findPath(g.player,e)||[];}catch{path=[];}
 if(!path.length)path=pathNear(walk,g.player,e);
 if(!path.length){if(first)g.toast?.(NO_PATH);stopHere(g);return false;}
 a.goal={...path.at(-1)};g.path=path;g.routeGoal=a.goal;g.routeStuck=0;g.routeRetried=false;g.moveTo=g.path.shift()||null;return true;
}
/** Nach Rechtsklick/Angreifen: zum Ziel laufen, falls es von hier nicht erreichbar ist. → true, wenn die Figur losläuft. */
export function approachTarget(g,e=g.target){
 g.approach=null;if(!e||!(e.hp>0)||g.dead||g.paused||inStrike(g,e))return false;
 const a={e,goal:null,next:REPATH,stuck:0};g.approach=a;g.casting=null;return route(g,a,true);
}
/** Je Bild (engine.tick): Weg nachführen, in Reichweite anhalten, bei eigener Bewegung aufgeben. */
export function tickApproach(g,dt){
 const a=g.approach;if(!a)return;
 if(g.target!==a.e||!(a.e.hp>0)||!g.autoAttack?.enabled||g.dead||a.e.ai==='returning'){stopHere(g);return;}
 if(keyMoving(g)||g.routeGoal&&g.routeGoal!==a.goal){g.approach=null;return;}
 if(inStrike(g,a.e)){stopHere(g);return;}
 if(g.casting)return;
 a.next-=dt;if(a.next>0&&(g.moveTo||a.next>REPATH-.12))return;/* Wegende erreicht, Ziel noch nicht getroffen: gleich weiter */
 if(!g.moveTo&&++a.stuck>3){g.toast?.(NO_PATH);stopHere(g);return;}if(g.moveTo)a.stuck=0;a.next=REPATH;route(g,a,false);
}
