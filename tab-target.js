// Tab wie in WoW (Runde 3a, 2026-09-24, Kenner-Befund 2): Tab wählt zuerst, wer dich angreift, dann feindliche (aggressive)
// Gegner, erst ganz zuletzt neutrale Tiere – und die nur, wenn kein Feind in Reichweite ist. Innerhalb einer Stufe gewinnt,
// wer vor dem Helden steht (Blickrichtung), dann der Nähere. Weiteres Tab schaltet innerhalb derselben Stufe weiter.
import {distance} from './world.js';
import {tutorialActive} from './tutorial.js';
import {inKiosk} from './kiosk-instance.js';
import {concealed} from './dungeon.js';

export const TAB_RULES={range:240,aggroRange:260,fightRange:65,window:85,behind:1.6};
const DIRS={se:[1,1],sw:[-1,1],ne:[1,-1],nw:[-1,-1]};
/** Stufe eines Gegners: 0 greift dich an, 1 feindlich, 2 neutral (nur zurück aggressiv). */
export const tabTier=e=>e.aggro&&!e.remoteTarget?0:e.behavior==='aggressive'?1:2;
/** Steht e vor dem Helden (Blickrichtung aus direction bzw. facing)? */
export function inFront(p,e){const d=DIRS[p.direction]||[(p.facing||1)>0?1:-1,0];return (e.x-p.x)*d[0]+(e.y-p.y)*d[1]>=0;}
/** Wertung für die Reihenfolge: Abstand, hinter dem Helden etwas weiter weg gerechnet. */
const score=(p,e)=>distance(e,p)*(inFront(p,e)?1:TAB_RULES.behind);
/** Kandidaten für Tab nach Stufe gefiltert und sortiert (ohne Auswahl zu ändern). */
export function tabChoices(g){
 const p=g.player,fighting=p.inCombat>0,R=TAB_RULES;
 const all=(g.enemies||[]).filter(e=>(!tutorialActive(g)||e.tutorial||e.arena)&&e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0)&&!concealed(g,e)/* Hotfix: verborgene Gegner nicht per Tab */&&g.world.lineClear(p,e));
 const reach=e=>{const t=tabTier(e),d=distance(e,p);return t===0?d<R.aggroRange:fighting?t===1&&d<R.fightRange:d<R.range;};
 const pool=all.filter(reach);if(!pool.length)return [];
 const best=Math.min(...pool.map(tabTier));
 const list=pool.filter(e=>tabTier(e)===best).sort((a,b)=>score(p,a)-score(p,b));
 const first=score(p,list[0]);return list.filter(e=>score(p,e)<=first+R.window);
}
/** Tab / Umschalt+Tab: nächstes Ziel wählen. */
export function tabTarget(g,reverse=false){
 if(inKiosk(g)||g.floor)return false;
 const choices=tabChoices(g);
 if(!choices.length){g.target=null;(g.fail||g.toast).call(g,'Kein passendes Ziel in direkter Nähe.');return;}
 const i=choices.indexOf(g.target);g.friend=null;
 g.target=i<0?choices[0]:choices[(i+(reverse?-1:1)+choices.length)%choices.length];g.emit('target');
}
