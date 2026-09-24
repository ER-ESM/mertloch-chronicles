// Folgen (2026-09-24, WoW): hinter einem Mitspieler herlaufen. Wegsuche über game.navigate; neu geplant wird nur, wenn der Abstand
// wächst. Eigene Bewegung (Tasten, Stick), Tod oder ein Mitspieler außer Sicht beenden das Folgen. Zahlen/Texte: content/group.js.
import {FOLLOW_RULES as R,FOLLOW_UI as T} from './content/index.js';
export function createFollow({game,toast=()=>{}}){
 let name=null,next=0,goal=null;
 const stop=(text)=>{if(!name)return;const n=name;name=null;const g=game();if(g){g.moveTo=null;g.path=[];g.routeGoal=null;}toast((text||T.stop)(n));};
 return {
  get target(){return name;},
  start(n){const g=game();if(!g?.others?.some(o=>o.name===n))return false;name=n;next=0;goal=null;toast(T.start(n));return true;},
  stop,
  /** Jeden Takt: now in ms. */
  tick(now){if(!name)return;const g=game();if(!g)return;const p=g.player,o=(g.others||[]).find(x=>x.name===name);
   if(g.keys?.size||g.touchMove?.x||g.touchMove?.y){stop();return;}
   if(g.dead){stop();return;}
   if(!o||Math.hypot(o.x-p.x,o.y-p.y)>R.maxRange||(o.floor??0)!==(g.floor??0)){stop(T.lost);return;}
   // Eigener Klick-Lauf woandershin (anderes Wegziel als unseres) beendet das Folgen.
   if(goal&&g.routeGoal&&(g.routeGoal.x!==goal.x||g.routeGoal.y!==goal.y)){stop();return;}
   const d=Math.hypot(o.x-p.x,o.y-p.y);
   if(d<=R.stop){if(g.moveTo||g.path?.length){g.moveTo=null;g.path=[];g.routeGoal=null;}return;}
   if(d>R.start&&now>=next){next=now+R.repathMs;goal={x:o.x,y:o.y};g.navigate(goal);goal=g.routeGoal?{x:g.routeGoal.x,y:g.routeGoal.y}:null;}}
 };
}
