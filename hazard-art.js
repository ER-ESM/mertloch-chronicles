// Eine Formsprache für Warnflächen (Etappe 2 „Lesbar wie WoW“, E-71; Grafik-Review Dungeon Befund 7, Zielbild B):
// Bodenkreis und Frontalkegel teilen Farben, Randmarken (alle 12°), die von innen wachsende Füllung und das Aufblitzen der
// Kante in den letzten 25 % (8 Hz). Der Kegel trägt Rückstoß-Pfeile am Bogenrand und ein Schild an der Spitze, wenn der Schutz
// nur einen Teil nimmt. Keine Weltschrift im Kegel: Namensschilder darin treten zurück (renderer.js flushLabels).
// Nur Canvas-2D ohne Blend-Modi (E-46 ff.); ein paar Verläufe je Warnfläche und Bild.
import {mapIcon} from './map-symbols.js';

const TAU=Math.PI*2,TICK=12*Math.PI/180;
const blink=(progress,time)=>progress>.75&&Math.sin(time*TAU*8)>0;
/** Bodenkreis (Engine-Flächen): gequetscht auf 0,75 wie die Trefferprüfung. a: {x,y,radius,bar?}. */
export function drawGroundHazard(c,a,progress,time){
 c.save();c.translate(a.x,a.y);c.scale(1,.75);
 const gr=c.createRadialGradient(0,0,0,0,0,a.radius);gr.addColorStop(0,'#c4302612');gr.addColorStop(.7,'#c4302633');gr.addColorStop(1,'#d8402c66');c.fillStyle=gr;c.beginPath();c.arc(0,0,a.radius,0,TAU);c.fill();
 const r2=Math.max(1,a.radius*progress),g2=c.createRadialGradient(0,0,0,0,0,r2);g2.addColorStop(0,'#e2432f30');g2.addColorStop(.8,'#e2432f66');g2.addColorStop(1,'#ff6a4a99');c.fillStyle=g2;c.beginPath();c.arc(0,0,r2,0,TAU);c.fill();
 c.fillStyle='#ffc0a0';const n=Math.round(TAU/TICK);for(let i=0;i<n;i++){c.save();c.rotate(i*TICK+time*.6);c.fillRect(a.radius-5,-1,3,2);c.restore();}
 c.restore();
 c.strokeStyle='#ffb08a';c.lineWidth=1;c.beginPath();c.ellipse(a.x,a.y,a.radius*progress,a.radius*.75*progress,0,0,TAU);c.stroke();
 c.strokeStyle=blink(progress,time)?'#fff0c8':'#ff5a3c';c.lineWidth=2;c.beginPath();c.ellipse(a.x,a.y,a.radius,a.radius*.75,0,0,TAU);c.stroke();
 if(a.bar){const bw=Math.max(34,a.radius*1.4),by=a.y+a.radius*.75+5;c.fillStyle='#150d0b';c.fillRect(a.x-bw/2-1,by-1,bw+2,6);c.fillStyle='#3a2521';c.fillRect(a.x-bw/2,by,bw,4);c.fillStyle=progress>.75?'#fff0c8':'#e2432f';c.fillRect(a.x-bw/2,by,bw*progress,4);}
}
/** Frontalkegel eines Gegners e mit Zauber k ({cone:{angle,range},angle,knockback?,tankSafe?}). Trefferform: Kreissektor, an Wänden
 *  abgeschnitten, wenn `reach` (freie Länge je Strahl, dungeon.js coneReach, Etappe 1) mitkommt – Warnfläche und Treffer sind dieselben Strahlen. */
export function drawConeHazard(c,e,k,progress,time,{reach=null,rays=0}={}){
 const half=k.cone.angle*Math.PI/360,a=k.angle??0,R=k.cone.range,at=t=>{if(!reach)return R;const i=Math.max(0,Math.min(rays,Math.round((t-(a-half))/(2*half)*rays)));return Math.min(R,reach[i]);};
 const sector=(r)=>{c.beginPath();c.moveTo(e.x,e.y);if(reach){for(let i=0;i<=rays;i++){const t=a-half+2*half*i/rays;const d=Math.min(r,reach[i]);c.lineTo(e.x+Math.cos(t)*d,e.y+Math.sin(t)*d);}}else c.arc(e.x,e.y,r,a-half,a+half);c.closePath();};
 c.save();
 const gr=c.createRadialGradient(e.x,e.y,0,e.x,e.y,R);gr.addColorStop(0,'#c4302612');gr.addColorStop(.7,'#c4302633');gr.addColorStop(1,'#d8402c66');c.fillStyle=gr;sector(R);c.fill();
 const r2=Math.max(1,R*progress),g2=c.createRadialGradient(e.x,e.y,0,e.x,e.y,r2);g2.addColorStop(0,'#e2432f30');g2.addColorStop(.8,'#e2432f66');g2.addColorStop(1,'#ff6a4a99');c.fillStyle=g2;sector(r2);c.fill();
 // Randmarken am Bogen alle 12°, dazu an beiden Kanten
 c.fillStyle='#ffc0a0';for(let t=a-half;t<=a+half+1e-6;t+=TICK){const d=at(t);if(d<R-1)continue;c.save();c.translate(e.x,e.y);c.rotate(t);c.fillRect(d-5,-1,3,2);c.restore();}
 for(const s of [-1,1]){const t=a+s*half,L=at(t);for(let d=R*.25;d<L;d+=R*.25){c.fillRect(e.x+Math.cos(t)*d-1,e.y+Math.sin(t)*d-1,2,2);}}
 // wachsende Innenkante
 c.strokeStyle='#ffb08a';c.lineWidth=1;sector(r2);c.stroke();
 c.strokeStyle=blink(progress,time)?'#fff0c8':'#ff5a3c';c.lineWidth=2;sector(R);c.stroke();
 // Rückstoß: Pfeile am Bogenrand nach außen
 if(k.knockback){c.strokeStyle='#fff0e0';c.lineWidth=1.6;c.lineCap='round';c.lineJoin='round';for(const f of [-.55,0,.55]){const t=a+f*half,L=at(t);if(L<24)continue;const x=e.x+Math.cos(t)*(L-12),y=e.y+Math.sin(t)*(L-12);c.save();c.translate(x,y);c.rotate(t);for(const o of [0,5]){c.beginPath();c.moveTo(o-3,-4);c.lineTo(o+1,0);c.lineTo(o-3,4);c.stroke();}c.restore();}}
 // Tank sicher: Schild an der Spitze
 if(k.tankSafe!=null&&k.tankSafe<1){const img=mapIcon('trait-tank',12);if(img){const x=e.x+Math.cos(a)*16,y=e.y+Math.sin(a)*16;c.drawImage(img,Math.round(x-6),Math.round(y-6),12,12);}}
 c.restore();
}
/** Laufende Kegel (für das Zurücktreten der Weltschrift): [{x,y,a,half,r}]. */
export function activeCones(g){const out=[];for(const e of g.enemies||[]){const k=e.cast;if(!k?.cone||!(e.hp>0))continue;out.push({x:e.x,y:e.y,a:k.angle??0,half:k.cone.angle*Math.PI/360,r:k.cone.range});}return out;}
/** Liegt der Punkt in einem der Kegel? */
export function inCones(cones,x,y){for(const k of cones){const d=Math.hypot(x-k.x,y-k.y);if(d>k.r)continue;let t=Math.atan2(y-k.y,x-k.x)-k.a;while(t>Math.PI)t-=TAU;while(t<-Math.PI)t+=TAU;if(Math.abs(t)<=k.half)return true;}return false;}
