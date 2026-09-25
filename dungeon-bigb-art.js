// Zeichnen der Big-B-Mechaniken (Dungeon Etappe 3 „Big B“, E-71; Plan 7.6): Behauptung und Nachsatz auf dem Boden, Kanonenkugel-
// Bahnen, Bodenstellen, Trümmer, Endtruhe und Hinterausgang in der Schatzkammer. Nur Bodenmarkierungen und Requisiten in der Welt,
// keine Figurengrafik (Figuren erst nach Freigabe). Zustand aus dungeon.js, gezeichnet über dem Boden von dungeon-art.js.
// Lesart (wie die Warnflächen aus Etappe 1/2): Die Behauptung ist nur ein gestrichelter, blasser Umriss mit Fragezeichen – sie lügt.
// Erst der Nachsatz legt die echte, rote Fläche mit wachsender Füllung; im letzten Viertel blitzt der Rand. Die widerlegte Behauptung
// bleibt durchgestrichen stehen, damit man sieht, dass sie gelogen war.
import {dungeonRun,floorAt,toWorld} from './dungeon.js';

const RED='#e2432f',RED_FILL='rgba(226,67,47,.22)',CREAM='#f3e6cc',INK='#1c1712',GOLD='#ecb95c';
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};

/** Aus renderer.js direkt nach dem Dungeon-Boden aufgerufen. */
export function drawBigBGround(c,g){
 const run=dungeonRun(g);if(!run)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,t=g.time||0;
 if(def.chest?.floor===floor)drawChest(c,toWorld(def,floor,def.chest.x,def.chest.y),run.chest,run.killed.has(def.chest.boss),t);
 if(def.backExit?.floor===floor)drawBackExit(c,toWorld(def,floor,def.backExit.x,def.backExit.y));
 for(const h of run.hazards||[])drawDebris(c,h,t);
 for(const e of g.enemies){if(!(e.hp>0))continue;const k=e.cast;
  if(k?.lanes)drawLanes(c,k,t);
  if(k?.spots&&k.told!==false)drawSpots(c,k,t);
  if(e.lastLine&&t-e.lastLine.at<.4)for(const r of e.lastLine.lanes)impact(c,r,1-(t-e.lastLine.at)/.4);}
}
/** Bahnen: Behauptung gestrichelt mit „?“, nach dem Nachsatz die echten Bahnen rot mit Füllung von Norden (Big Bs Ritt). */
function drawLanes(c,k,t){
 const claim=k.lanes[k.claimLane],told=k.told!==false,progress=Math.max(0,Math.min(1,1-k.remaining/k.total));
 if(claim){c.save();c.setLineDash([8,6]);c.lineDashOffset=-t*18;c.strokeStyle=told?'rgba(243,230,204,.35)':'rgba(243,230,204,.85)';c.lineWidth=2;c.strokeRect(claim.x+2,claim.y+2,claim.w-4,claim.h-4);c.setLineDash([]);
  if(!told){c.fillStyle='rgba(243,230,204,.13)';c.fillRect(claim.x,claim.y,claim.w,claim.h);mark(c,claim.x+claim.w/2,claim.y+claim.h*.5,'?',CREAM);}
  else{c.strokeStyle='rgba(243,230,204,.45)';c.lineWidth=2;c.beginPath();c.moveTo(claim.x+6,claim.y+6);c.lineTo(claim.x+claim.w-6,claim.y+claim.h-6);c.stroke();}
  c.restore();}
 if(!told)return;
 const since=Math.max(0,Math.min(1,(t-(k.toldAt??t))/Math.max(.1,k.remaining+(t-(k.toldAt??t))))),blink=progress>.75&&Math.sin(t*28)>0;
 for(const i of k.truthLanes||[]){const r=k.lanes[i];if(!r)continue;c.save();c.fillStyle=RED_FILL;c.fillRect(r.x,r.y,r.w,r.h);
  c.fillStyle='rgba(226,67,47,.34)';c.fillRect(r.x,r.y,r.w,r.h*since);
  c.strokeStyle=blink?'#fff0c8':RED;c.lineWidth=2.5;c.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);
  // Pfeile in Reitrichtung (Nord → Süd)
  c.fillStyle='rgba(255,240,200,.75)';for(let y=r.y+26;y<r.y+r.h-10;y+=46){const x=r.x+r.w/2;c.beginPath();c.moveTo(x-7,y-6);c.lineTo(x+7,y-6);c.lineTo(x,y+4);c.closePath();c.fill();}
  // die Kugel rollt an
  const by=r.y+r.h*since;c.fillStyle=INK;c.beginPath();c.arc(r.x+r.w/2,by,7,0,Math.PI*2);c.fill();c.fillStyle='#6d737c';c.beginPath();c.arc(r.x+r.w/2-2,by-2,4,0,Math.PI*2);c.fill();
  c.restore();}
}
/** Einschlag: kurzer heller Streifen über die getroffene Bahn. */
function impact(c,r,a){c.save();c.globalAlpha=Math.max(0,a);c.fillStyle='rgba(255,236,190,.55)';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='#fff0c8';c.lineWidth=3;c.strokeRect(r.x,r.y,r.w,r.h);c.restore();}
/** Bodenstellen (Parkett, Pappkulisse): wie die Bodenkreise, je Stelle eine Ellipse mit wachsender Füllung. */
function drawSpots(c,k,t){
 const progress=Math.max(0,Math.min(1,1-k.remaining/k.total)),blink=progress>.75&&Math.sin(t*28)>0,r=k.radius;
 for(const s of k.spots){c.save();c.fillStyle=RED_FILL;c.beginPath();c.ellipse(s.x,s.y,r,r*.75,0,0,Math.PI*2);c.fill();
  c.fillStyle='rgba(226,67,47,.34)';c.beginPath();c.ellipse(s.x,s.y,r*progress,r*.75*progress,0,0,Math.PI*2);c.fill();
  c.strokeStyle=blink?'#fff0c8':RED;c.lineWidth=2;c.beginPath();c.ellipse(s.x,s.y,r,r*.75,0,0,Math.PI*2);c.stroke();
  if(k.persist){c.strokeStyle='rgba(182,154,108,.9)';c.lineWidth=1.5;for(let i=0;i<3;i++){const a=i*2.1+.4;c.strokeRect(s.x+Math.cos(a)*r*.4-4,s.y+Math.sin(a)*r*.3-3,8,6);}}
  c.restore();}
}
/** Trümmer der Pappkulisse: Pappstücke mit roter gepunkteter Kante, solange sie liegen. */
function drawDebris(c,h,t){
 c.save();c.fillStyle='rgba(140,60,40,.2)';c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.fill();
 c.setLineDash([3,4]);c.strokeStyle='rgba(226,67,47,.8)';c.lineWidth=1.5;c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.stroke();c.setLineDash([]);
 for(let i=0;i<5;i++){const a=i*1.37+h.x*.01,d=h.radius*(.2+.12*i);c.save();c.translate(h.x+Math.cos(a)*d,h.y+Math.sin(a)*d*.8);c.rotate(a);box(c,INK,-5,-3,10,6);box(c,'#b69a6c',-4.5,-2.5,9,5);c.restore();}
 c.restore();
}
/** Endtruhe: zu (nach Big B golden umrandet), offen mit hochgeklapptem Deckel; vor Big B mit Kette. */
function drawChest(c,p,opened,ready,t){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(ready&&!opened){const a=.35+.25*Math.sin(t*3);c.fillStyle='rgba(236,185,92,'+a.toFixed(3)+')';c.beginPath();c.ellipse(0,4,20,8,0,0,Math.PI*2);c.fill();}
 box(c,INK,-13,-9,26,15);box(c,'#6b4a2f',-12,-8,24,13);box(c,'#8a6340',-12,-8,24,3);box(c,GOLD,-12,-1,24,2);box(c,GOLD,-2,-4,4,5);
 if(opened){box(c,INK,-13,-19,26,10);box(c,'#6b4a2f',-12,-18,24,8);box(c,'#2a1f18',-11,-10,22,2);}
 else{box(c,INK,-13,-13,26,5);box(c,'#7b5636',-12,-12,24,3);}
 if(!ready){c.strokeStyle='#8a8272';c.lineWidth=1.5;c.beginPath();c.moveTo(-13,-6);c.lineTo(13,2);c.moveTo(-13,2);c.lineTo(13,-6);c.stroke();}
 c.restore();
}
/** Hinterausgang: Kellertür mit goldenem Pfeil nach oben (Name nur im Interaktionsknopf). */
function drawBackExit(c,p){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));box(c,INK,-9,-14,18,20);box(c,'#4a3a2c',-8,-13,16,18);box(c,GOLD,4,-5,2,2);
 c.fillStyle=GOLD;c.beginPath();c.moveTo(0,-24);c.lineTo(6,-17);c.lineTo(2,-17);c.lineTo(2,-15);c.lineTo(-2,-15);c.lineTo(-2,-17);c.lineTo(-6,-17);c.closePath();c.fill();c.restore();
}
function mark(c,x,y,s,color){c.save();c.font='bold 22px Nunito, "Segoe UI", sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle=INK;c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y);c.restore();}
