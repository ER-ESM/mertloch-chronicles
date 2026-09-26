// Zeichnen der Big-B-Mechaniken (Dungeon Etappe 3 „Big B“, E-71; Plan 7.6): Behauptung und Nachsatz auf dem Boden, Kanonenkugel-
// Bahnen, Bodenstellen, Trümmer, Endtruhe und Hinterausgang in der Schatzkammer. Nur Bodenmarkierungen und Requisiten in der Welt,
// keine Figurengrafik (Figuren erst nach Freigabe). Zustand aus dungeon.js, gezeichnet über dem Boden von dungeon-art.js.
// Lesart (wie die Warnflächen aus Etappe 1/2): Die Behauptung ist nur ein gestrichelter, blasser Umriss mit Fragezeichen – sie lügt.
// Erst der Nachsatz legt die echte, rote Fläche mit wachsender Füllung; im letzten Viertel blitzt der Rand. Die widerlegte Behauptung
// bleibt durchgestrichen stehen, damit man sieht, dass sie gelogen war.
import {dungeonRun,floorAt,toWorld,chestShown} from './dungeon.js';
import {drawE4BGround} from './dungeon-e4b-art.js';

const RED='#e2432f',RED_FILL='rgba(226,67,47,.22)',CREAM='#f3e6cc',INK='#1c1712',GOLD='#ecb95c';
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};

/** Aus renderer.js direkt nach dem Dungeon-Boden aufgerufen. */
export function drawBigBGround(c,g){
 const run=dungeonRun(g);if(!run)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,t=g.time||0;
 /* Dungeon-Fix 3: Die Endtruhe erscheint erst nach Big B (appear) mitten im Thronsaal; der Hinterausgang trägt ein Notausgang-Schild, ein
    zweites hängt nach dem Sieg über der Tür zur Schatzkammer. */
 const won=!def.chest||run.killed.has(def.chest.boss);
 if(def.chest?.floor===floor&&chestShown(run))drawChest(c,toWorld(def,floor,def.chest.x,def.chest.y),run.chest,run.killed.has(def.chest.boss),t);
 if(def.backExit?.floor===floor){drawBackExit(c,toWorld(def,floor,def.backExit.x,def.backExit.y),won,t);const sg=def.backExit.sign;if(sg&&won)exitSign(c,toWorld(def,floor,sg.x,sg.y),t,true);}
 for(const h of run.hazards||[])if(!h.rect)drawDebris(c,h,t);/* Etappe 4 Teil A: nasse Streifen zeichnet dungeon-e4a-art.js */
 for(const e of g.enemies){if(!(e.hp>0))continue;const k=e.cast;
  if(k?.lanes)drawLanes(c,k,t);
  if(k?.spots&&k.told!==false)drawSpots(c,k,t);
  if(e.lastLine&&t-e.lastLine.at<.4)for(const r of e.lastLine.lanes)impact(c,r,1-(t-e.lastLine.at)/.4);}
 drawE4BGround(c,g);/* Etappe 4 Teil B: kleine Truhen, Fundstellen, Volker, Beamer */
}
/** Bahnen: Behauptung gestrichelt mit „?“, nach dem Nachsatz die echten Bahnen rot mit Füllung von Norden (Big Bs Ritt). */
function drawLanes(c,k,t){
 const claim=k.lie?k.lanes[k.claimLane]:null/* Etappe 4 Teil A: Rinnen ohne Behauptung */,told=k.told!==false,progress=Math.max(0,Math.min(1,1-k.remaining/k.total));
 if(claim){c.save();c.setLineDash([8,6]);c.lineDashOffset=-t*18;c.strokeStyle=told?'rgba(243,230,204,.35)':'rgba(243,230,204,.85)';c.lineWidth=2;c.strokeRect(claim.x+2,claim.y+2,claim.w-4,claim.h-4);c.setLineDash([]);
  if(!told){c.fillStyle='rgba(243,230,204,.13)';c.fillRect(claim.x,claim.y,claim.w,claim.h);mark(c,claim.x+claim.w/2,claim.y+claim.h*.5,'?',CREAM);}
  else{c.strokeStyle='rgba(243,230,204,.45)';c.lineWidth=2;c.beginPath();c.moveTo(claim.x+6,claim.y+6);c.lineTo(claim.x+claim.w-6,claim.y+claim.h-6);c.stroke();}
  c.restore();}
 if(!told)return;
 drawSafe(c,k,t);
 const since=Math.max(0,Math.min(1,(t-(k.toldAt??t))/Math.max(.1,k.remaining+(t-(k.toldAt??t))))),blink=progress>.75&&Math.sin(t*28)>0;
 for(const i of k.truthLanes||[]){const r=k.lanes[i];if(!r)continue;c.save();c.fillStyle=RED_FILL;c.fillRect(r.x,r.y,r.w,r.h);
  c.fillStyle='rgba(226,67,47,.34)';c.fillRect(r.x,r.y,r.w,r.h*since);
  c.strokeStyle=blink?'#fff0c8':RED;c.lineWidth=2.5;c.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);
  if(r.axis==='y'){/* Etappe 4 Teil A: Kurts Rinnen – das Fass rollt von West nach Ost */c.fillStyle='rgba(255,240,200,.75)';for(let x=r.x+26;x<r.x+r.w-10;x+=46){const y=r.y+r.h/2;c.beginPath();c.moveTo(x-6,y-7);c.lineTo(x-6,y+7);c.lineTo(x+4,y);c.closePath();c.fill();}
   const bx=r.x+r.w*since,y=r.y+r.h/2;c.fillStyle=INK;c.beginPath();c.ellipse(bx,y,9,7,0,0,Math.PI*2);c.fill();c.fillStyle='#8a5a34';c.beginPath();c.ellipse(bx,y,7.5,5.5,0,0,Math.PI*2);c.fill();c.fillStyle='#5b3a22';c.fillRect(bx-7,y-1,14,2);c.restore();continue;}
  // Pfeile in Reitrichtung (Nord → Süd)
  c.fillStyle='rgba(255,240,200,.75)';for(let y=r.y+26;y<r.y+r.h-10;y+=46){const x=r.x+r.w/2;c.beginPath();c.moveTo(x-7,y-6);c.lineTo(x+7,y-6);c.lineTo(x,y+4);c.closePath();c.fill();}
  // die Kugel rollt an
  const by=r.y+r.h*since;c.fillStyle=INK;c.beginPath();c.arc(r.x+r.w/2,by,7,0,Math.PI*2);c.fill();c.fillStyle='#6d737c';c.beginPath();c.arc(r.x+r.w/2-2,by-2,4,0,Math.PI*2);c.fill();
  c.restore();}
}
/** Dungeon-Fix 5 (Prüfer #728: bei „… und links.“ war kein sicherer Platz zu erkennen): Nach dem Nachsatz liegt jeder sichere Streifen quer zu den
 *  echten Bahnen grün gestrichelt am Boden, mit Haken in Laufrichtung der Kugel – bei „rechts und links“ die Mitte, sonst die andere Hälfte.
 *  Dieselbe Rechnung wie die Warnleiste (alert-answer.js laneAction). */
function drawSafe(c,k,t){const lanes=k.lanes||[],bad=(k.truthLanes||[]).map(i=>lanes[i]).filter(Boolean);if(!lanes.length||!bad.length||lanes[0].axis==='y')return;
 const x0=Math.min(...lanes.map(r=>r.x)),x1=Math.max(...lanes.map(r=>r.x+r.w)),y0=Math.min(...lanes.map(r=>r.y)),y1=Math.max(...lanes.map(r=>r.y+r.h));
 let safe=[[x0,x1]];for(const r of bad)safe=safe.flatMap(([a,b])=>[[a,Math.min(b,r.x)],[Math.max(a,r.x+r.w),b]]).filter(([a,b])=>b-a>1);
 const pulse=.55+.25*Math.sin(t*6);
 for(const [a,b] of safe){c.save();c.fillStyle='rgba(126,206,104,'+(.14+.06*pulse).toFixed(3)+')';c.fillRect(a,y0,b-a,y1-y0);
  c.setLineDash([7,5]);c.lineDashOffset=t*14;c.strokeStyle='rgba(170,232,140,'+pulse.toFixed(3)+')';c.lineWidth=2.5;c.strokeRect(a+3,y0+3,b-a-6,y1-y0-6);c.setLineDash([]);
  const x=(a+b)/2;c.lineCap='round';c.lineJoin='round';for(let y=y0+34;y<y1-14;y+=58){c.strokeStyle=INK;c.lineWidth=6;c.beginPath();c.moveTo(x-8,y);c.lineTo(x-2,y+6);c.lineTo(x+9,y-7);c.stroke();c.strokeStyle='#bff0a0';c.lineWidth=3;c.stroke();}
  c.restore();}}
/** Einschlag: kurzer heller Streifen über die getroffene Bahn. */
function impact(c,r,a){c.save();c.globalAlpha=Math.max(0,a);c.fillStyle='rgba(255,236,190,.55)';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='#fff0c8';c.lineWidth=3;c.strokeRect(r.x,r.y,r.w,r.h);c.restore();}
/** Bodenstellen (Parkett, Pappkulisse): wie die Bodenkreise, je Stelle eine Ellipse mit wachsender Füllung. */
function drawSpots(c,k,t){
 const progress=Math.max(0,Math.min(1,1-k.remaining/k.total)),blink=progress>.75&&Math.sin(t*28)>0,r=k.radius;
 for(const s of k.spots){if(s.decoy)continue;/* Etappe 4 Teil A: Attrappen zeichnet dungeon-e4a-art.js */c.save();c.fillStyle=RED_FILL;c.beginPath();c.ellipse(s.x,s.y,r,r*.75,0,0,Math.PI*2);c.fill();
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
/** Endtruhe: zu (nach Big B golden umrandet, mit goldener Lichtsäule wie Beute), offen mit hochgeklapptem Deckel; vor Big B mit Kette. */
function drawChest(c,p,opened,ready,t){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(ready&&!opened){const a=.35+.25*Math.sin(t*3);c.fillStyle='rgba(236,185,92,'+a.toFixed(3)+')';c.beginPath();c.ellipse(0,4,24,9,0,0,Math.PI*2);c.fill();
  /* Dungeon-Fix 3: Lichtsäule, damit man die Truhe aus dem ganzen Saal sieht (Farbe selten) */const g=c.createLinearGradient(0,-86,0,0);g.addColorStop(0,'rgba(236,185,92,0)');g.addColorStop(1,'rgba(236,185,92,'+(.28+.12*Math.sin(t*2.4)).toFixed(3)+')');c.fillStyle=g;c.fillRect(-9,-86,18,86);}
 box(c,INK,-13,-9,26,15);box(c,'#6b4a2f',-12,-8,24,13);box(c,'#8a6340',-12,-8,24,3);box(c,GOLD,-12,-1,24,2);box(c,GOLD,-2,-4,4,5);
 if(opened){box(c,INK,-13,-19,26,10);box(c,'#6b4a2f',-12,-18,24,8);box(c,'#2a1f18',-11,-10,22,2);}
 else{box(c,INK,-13,-13,26,5);box(c,'#7b5636',-12,-12,24,3);}
 if(!ready){c.strokeStyle='#8a8272';c.lineWidth=1.5;c.beginPath();c.moveTo(-13,-6);c.lineTo(13,2);c.moveTo(-13,2);c.lineTo(13,-6);c.stroke();}
 c.restore();
}
/** Hinterausgang: Kellertür mit goldenem Pfeil nach oben und grünem Notausgang-Schild darüber (Dungeon-Fix 3; Name im Tooltip bzw. im
 *  Interaktionsknopf). won = Big B liegt: das Schild leuchtet. */
function drawBackExit(c,p,won=true,t=0){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));box(c,INK,-9,-14,18,20);box(c,'#4a3a2c',-8,-13,16,18);box(c,GOLD,4,-5,2,2);
 c.fillStyle=GOLD;c.beginPath();c.moveTo(0,-24);c.lineTo(6,-17);c.lineTo(2,-17);c.lineTo(2,-15);c.lineTo(-2,-15);c.lineTo(-2,-17);c.lineTo(-6,-17);c.closePath();c.fill();c.restore();
 exitSign(c,{x:p.x,y:p.y-34},t,won);
}
/** Grünes Notausgang-Schild (Läufer zur Tür, Pfeil nach unten), leuchtet nach dem Sieg. Kein Text in der Welt (Etappe 2 Text-Diät). */
function exitSign(c,p,t,lit){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(lit){const a=.18+.12*Math.sin(t*3.2);c.fillStyle='rgba(70,220,120,'+a.toFixed(3)+')';c.beginPath();c.ellipse(0,0,24,15,0,0,Math.PI*2);c.fill();}
 const W='#f2fff2',G=lit?'#1f9a4f':'#2c5a3c';box(c,INK,-14,-9,28,16);box(c,G,-13,-8,26,14);
 box(c,W,5,-6,6,10);box(c,G,6,-5,4,9);/* Tür */box(c,W,-5,-7,2,2);/* Kopf */
 c.strokeStyle=W;c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(-4,-4);c.lineTo(-6,0);c.moveTo(-6,0);c.lineTo(-9,3);c.moveTo(-6,0);c.lineTo(-3,3);c.moveTo(-4,-3);c.lineTo(-1,-2);c.moveTo(-4,-3);c.lineTo(-8,-3);c.stroke();
 c.fillStyle=lit?'#8ff0b0':'#5f8f6f';c.beginPath();c.moveTo(-4,10);c.lineTo(4,10);c.lineTo(0,15);c.closePath();c.fill();
 c.restore();
}
function mark(c,x,y,s,color){c.save();c.font='bold 22px Nunito, "Segoe UI", sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle=INK;c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y);c.restore();}
