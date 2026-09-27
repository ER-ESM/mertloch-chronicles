// Reine Weltgeometrie ohne weitere Abhängigkeiten (Handy-Leistung Runde 2, 27.09.2026): der Boden-Worker (terrain-worker.js) braucht
// dieselben Prüfungen wie die Welt, soll aber nicht das ganze Spiel laden. world.js nutzt und exportiert sie weiter.
import {circleIntersectsBox} from './world-collision.js';
export function inside(x,y,points){let c=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
export function nearestOnSegment(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return{x:a.x+t*dx,y:a.y+t*dy};}
export function segmentDistance(x,y,a,b){const p=nearestOnSegment(x,y,a,b);return Math.hypot(x-p.x,y-p.y);}
/** World.blocked: Rand, Kreise (Bäume) und Kästen (Häuser, Requisiten) aus dem 100er-Raster `w.grid`; direkt über die Zellen, ohne Zwischenobjekte. */
export function blockedIn(w,x,y,r=6){if(x<20||y<20||x>w.width-20||y>w.height-20)return true;const x1=Math.floor((x+r)/100),y0=Math.floor((y-r)/100),y1=Math.floor((y+r)/100);
 for(let gx=Math.floor((x-r)/100);gx<=x1;gx++)for(let gy=y0;gy<=y1;gy++){const list=w.grid.get(gx+','+gy);if(!list)continue;for(const b of list){if(b.radius){if(Math.hypot(x-b.x,y-b.y)<r+b.radius)return true;continue;}if(circleIntersectsBox(x,y,r,b))return true;}}return false;}
/** World.onRoad: liegt der Punkt auf einer Straße (Straßenraster 200er-Zellen)? */
export function onRoadIn(roadGrid,x,y,pad=0){return (roadGrid.get(Math.floor(x/200)+','+Math.floor(y/200))||[]).some(s=>segmentDistance(x,y,s.a,s.b)<s.road.width/2+pad);}
