// Zeichnen der Mechaniken aus Etappe 4 Teil A (E-71, Plan 7.2–7.5): Attrappen und Stempel (Frau Dr. Exposé), Interessenten auf dem Weg
// zum Vertragstisch, Sammel- und Verteilkreise und nasse Streifen (Korken-Kurt), Deckung, Greenscreen und Blitzlicht (Reichweiten-Rita),
// Trog (das halbe Pferd). Nur Bodenmarkierungen und schlichte Logik-Requisiten (Tisch, Trog, Deckung) in der Welt, keine Figurengrafik.
// Lesart wie Etappe 1–3: gefährlich = rot mit wachsender Füllung und Blitzen im letzten Viertel; gestrichelt = noch nicht entschieden
// (Attrappe, Behauptung); gold = Antwort der Gruppe (hier zusammenkommen, hier in Deckung). Canvas-2D ohne Blend-Modi (E-46 ff.).
// Zustand aus dungeon.js, gezeichnet nach drawBigBGround (renderer.js) über dem Dungeon-Boden.
import {dungeonRun,floorAt,bossZones,coverRects,partyUnits,hideSpots} from './dungeon.js';
import {DUNGEON_BOSSES} from './content/index.js';

const TAU=Math.PI*2,RED='#e2432f',CREAM='#f3e6cc',INK='#1c1712',GOLD='#ecb95c',WATER='#6fb6d8';
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const prog=k=>Math.max(0,Math.min(1,1-k.remaining/k.total)),blink=(p,t)=>p>.75&&Math.sin(t*TAU*8)>0;
const unitOf=(g,id)=>id==='player'?(g.dead?null:g.player):(g.companions||[]).find(c=>c.id===id&&c.state!=='down')||null;

/** Aus renderer.js direkt nach drawBigBGround aufgerufen. */
export function drawE4AGround(c,g){
 const run=dungeonRun(g);if(!run)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,t=g.time||0;
 // Logik-Requisiten der gebauten Bosse auf dieser Ebene: Vertragstisch, Trog, Greenscreen-Zone, Deckung
 for(const b of def.bosses){const d=DUNGEON_BOSSES[b.id],room=def.rooms.find(r=>r.id===b.room);if(!d||room?.floor!==floor)continue;const e=g.enemies.find(x=>x.bossId===b.id);if(!e)continue;const z=bossZones(run,e);
  if(z.hidden&&e.hp>0)drawGreenscreen(c,z.hidden,e,t);if(z.goal)drawTable(c,z.goal,e,g,t);if(z.trough)drawTrough(c,z.trough,e,t);}
 for(const q of coverRects(run,floor))drawCover(c,q);
 for(const h of run.hazards||[])if(h.rect)drawWet(c,h,t);
 for(const e of g.enemies){if(!(e.hp>0))continue;if(e.goalAt&&!e.signedOff)drawGoalPath(c,e,t);
  const k=e.cast;if(!k)continue;
  if(k.decoy&&k.spots)drawDecoys(c,k,t);
  if(k.stack)drawStack(c,g,k,t);
  if(k.spread)drawSpread(c,g,k,t);
  if(k.los)drawLos(c,g,e,k,t);}
}
/** Attrappen: vor dem Stempel alle Stellen gleich (gestrichelt, „?“); danach die Attrappen blass und durchgestrichen – die echten zeichnet
 *  drawBigBGround rot, jetzt mit Stempel obenauf. */
function drawDecoys(c,k,t){const r=k.radius;
 for(const s of k.spots){c.save();
  if(k.told===false){c.setLineDash([7,5]);c.lineDashOffset=-t*16;c.strokeStyle='rgba(243,230,204,.85)';c.lineWidth=2;c.fillStyle='rgba(243,230,204,.12)';c.beginPath();c.ellipse(s.x,s.y,r,r*.75,0,0,TAU);c.fill();c.stroke();c.setLineDash([]);mark(c,s.x,s.y,'?',CREAM);}
  else if(s.decoy){c.globalAlpha=.55;c.setLineDash([4,6]);c.strokeStyle='rgba(243,230,204,.6)';c.lineWidth=1.5;c.beginPath();c.ellipse(s.x,s.y,r,r*.75,0,0,TAU);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(s.x-r*.6,s.y-r*.4);c.lineTo(s.x+r*.6,s.y+r*.4);c.stroke();}
  else stamp(c,s.x,s.y,t-(k.toldAt??t));
  c.restore();}
}
/** Stempel „VERKAUFT“: roter Rundstempel mit Balken, fällt kurz von oben auf die echte Stelle. */
function stamp(c,x,y,age){const drop=Math.max(0,1-age*6)*14;c.save();c.translate(x,y-drop);c.rotate(-.18);c.strokeStyle='#b8322c';c.lineWidth=2.5;c.beginPath();c.ellipse(0,0,11,8,0,0,TAU);c.stroke();
 box(c,'#b8322c',-9,-2,18,4);box(c,'#fff0e0',-6,-.8,12,1.6);c.restore();}
/** Interessent auf dem Weg: goldene Tupfen zum nächsten Ziel (erst Besichtigung, dann Tisch). */
function drawGoalPath(c,e,t){const to=e.goalVia?.[0]||e.goalAt,d=Math.hypot(to.x-e.x,to.y-e.y);if(d<6)return;c.save();c.fillStyle='rgba(236,185,92,.75)';
 for(let s=10+(t*22)%12;s<d;s+=12){const f=s/d;c.beginPath();c.arc(e.x+(to.x-e.x)*f,e.y+(to.y-e.y)*f,1.6,0,TAU);c.fill();}c.restore();}
/** Vertragstisch: Tisch mit Vertrag und Kugelschreiber an der Kette; leuchtet, solange Interessenten unterwegs sind. */
function drawTable(c,p,boss,g,t){const busy=g.enemies.some(e=>e.goalAt&&e.summoner===boss&&e.hp>0&&!e.signedOff);c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(busy){const a=.25+.2*Math.sin(t*5);c.fillStyle='rgba(236,185,92,'+a.toFixed(3)+')';c.beginPath();c.ellipse(0,2,24,11,0,0,TAU);c.fill();}
 box(c,INK,-15,-9,30,13);box(c,'#8a6340',-14,-8,28,11);box(c,'#6b4a2f',-14,1,28,2);box(c,'#f4efe4',-8,-7,10,7);for(let i=0;i<3;i++)box(c,'#9a8f7c',-7,-5.5+i*2,8,.6);
 c.strokeStyle='#c9b98f';c.lineWidth=.8;c.beginPath();c.moveTo(6,-5);c.lineTo(9,-2);c.lineTo(12,-6);c.stroke();box(c,'#2d3a6b',10,-7,2,5);c.restore();}
/** Trog in der Ecke der Stallungen: Holztrog mit Wasser; säuft das Pferd, kräuselt sich das Wasser. */
function drawTrough(c,p,horse,t){c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(horse?.drinking){c.strokeStyle='rgba(158,209,122,.7)';c.lineWidth=1.5;c.setLineDash([3,3]);c.beginPath();c.ellipse(0,0,p.r,p.r*.75,0,0,TAU);c.stroke();c.setLineDash([]);}
 box(c,INK,-13,-6,26,11);box(c,'#7b5636',-12,-5,24,9);box(c,WATER,-10,-3,20,4);if(horse?.drinking){c.strokeStyle='#dff2fa';c.lineWidth=.8;c.beginPath();c.arc(Math.sin(t*3)*4,-1,2+((t*4)%3),0,TAU);c.stroke();}
 box(c,'#5b3f28',-12,3,24,1.5);c.restore();}
/** Greenscreen-Zone vor der Nordwand: grünes Tuch am Boden, gestrichelt umrandet (dort ist Rita unsichtbar). */
function drawGreenscreen(c,z,rita,t){c.save();c.fillStyle=rita.hidden?'rgba(70,200,100,.3)':'rgba(70,200,100,.16)';c.fillRect(z.x,z.y,z.w,z.h);
 c.setLineDash([6,5]);c.lineDashOffset=-t*8;c.strokeStyle='rgba(120,230,150,.8)';c.lineWidth=1.5;c.strokeRect(z.x+1,z.y+1,z.w-2,z.h-2);c.setLineDash([]);c.restore();}
/** Deckung im Presseamt: Kühlschrank (weiß) bzw. Palettenwand (Holz), mit kleiner Vorderseite. */
function drawCover(c,q){c.save();const fridge=q.id==='kuehlschrank',top=fridge?'#e9ecef':'#b58a55',face=fridge?'#b9c0c7':'#8a6440';
 box(c,'rgba(20,15,10,.35)',q.x+2,q.y+q.h,q.w,4);box(c,INK,q.x-1,q.y-7,q.w+2,q.h+8);box(c,face,q.x,q.y,q.w,q.h);box(c,top,q.x,q.y-6,q.w,6);
 if(fridge){box(c,'#8e979f',q.x+q.w-3,q.y+2,1.5,q.h-4);}else for(let x=q.x+3;x<q.x+q.w-2;x+=6)box(c,'#6d4d31',x,q.y+1,1.2,q.h-2);c.restore();}
/** Blitzlicht: Auge über Rita, Deckung leuchtet auf, Plätze ohne Sichtlinie golden getupft. */
function drawLos(c,g,e,k,t){const p=prog(k);c.save();
 for(const s of hideSpots(g,e,k)){c.fillStyle='rgba(236,185,92,.35)';c.beginPath();c.arc(s.x,s.y,2.2,0,TAU);c.fill();}
 const run=dungeonRun(g);for(const q of coverRects(run,floorAt(run.def,e.x,e.y))){c.strokeStyle='rgba(236,185,92,'+(.4+.4*Math.sin(t*10)).toFixed(3)+')';c.lineWidth=2;c.strokeRect(q.x-2,q.y-8,q.w+4,q.h+10);}
 const y=e.y-78;c.fillStyle=INK;c.beginPath();c.ellipse(e.x,y,13,8,0,0,TAU);c.fill();c.fillStyle=blink(p,t)?'#fff0c8':CREAM;c.beginPath();c.ellipse(e.x,y,11,6,0,0,TAU);c.fill();c.fillStyle=RED;c.beginPath();c.arc(e.x,y,3.2+p*1.5,0,TAU);c.fill();
 c.restore();}
/** Sammeln: goldener Kreis um den Markierten mit Pfeilen nach innen – hier zusammenkommen. */
function drawStack(c,g,k,t){const m=unitOf(g,k.victim);if(!m)return;const r=k.stack.radius,p=prog(k),inside=partyUnits(g).filter(u=>Math.hypot(u.x-m.x,u.y-m.y)<=r).length;c.save();
 c.fillStyle='rgba(236,185,92,.14)';c.beginPath();c.ellipse(m.x,m.y,r,r*.75,0,0,TAU);c.fill();c.fillStyle='rgba(236,185,92,.24)';c.beginPath();c.ellipse(m.x,m.y,r*p,r*.75*p,0,0,TAU);c.fill();
 c.strokeStyle=blink(p,t)?'#fff0c8':GOLD;c.lineWidth=2.5;c.beginPath();c.ellipse(m.x,m.y,r,r*.75,0,0,TAU);c.stroke();
 c.fillStyle=GOLD;for(let i=0;i<4;i++){const a=i*TAU/4+t*.8,x=m.x+Math.cos(a)*(r+6),y=m.y+Math.sin(a)*(r+6)*.75;c.save();c.translate(x,y);c.rotate(a+Math.PI);c.beginPath();c.moveTo(6,0);c.lineTo(-3,-5);c.lineTo(-3,5);c.closePath();c.fill();c.restore();}
 mark(c,m.x,m.y-r*.75-12,inside+'',inside>=3?'#aed4bd':'#ff9a7a');c.restore();}
/** Verteilen: roter Kreis um jeden; wo sich Kreise überlappen, blinkt der Rand. */
function drawSpread(c,g,k,t){const r=k.spread.radius,p=prog(k),units=partyUnits(g);c.save();
 for(const u of units){const over=units.some(o=>o!==u&&Math.hypot(o.x-u.x,o.y-u.y)<r);c.fillStyle=over?'rgba(226,67,47,.22)':'rgba(226,67,47,.1)';c.beginPath();c.ellipse(u.x,u.y,r,r*.75,0,0,TAU);c.fill();
  c.strokeStyle=over&&Math.sin(t*20)>0?'#fff0c8':RED;c.lineWidth=over?2.5:1.5;c.beginPath();c.ellipse(u.x,u.y,r*Math.max(.4,p),r*.75*Math.max(.4,p),0,0,TAU);c.stroke();
  c.beginPath();c.ellipse(u.x,u.y,r,r*.75,0,0,TAU);c.stroke();
  c.fillStyle=RED;for(let i=0;i<4;i++){const a=i*TAU/4+TAU/8,x=u.x+Math.cos(a)*r*.62,y=u.y+Math.sin(a)*r*.62*.75;c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(6,0);c.lineTo(-3,-4);c.lineTo(-3,4);c.closePath();c.fill();c.restore();}}
 c.restore();}
/** Nasse Streifen der Sprinkleranlage: bläulich mit Schrägstrichen und fallenden Tropfen. */
function drawWet(c,h,t){const r=h.rect;c.save();c.fillStyle='rgba(111,182,216,.22)';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='rgba(180,220,240,.35)';c.lineWidth=1;
 c.beginPath();for(let y=r.y-r.w;y<r.y+r.h;y+=10){c.moveTo(r.x,y+r.w);c.lineTo(r.x+r.w,y);}c.stroke();
 c.fillStyle='rgba(223,242,250,.8)';for(let i=0;i<6;i++){const x=r.x+((i*37.3)%r.w),y=r.y+((i*53.1+t*60)%r.h);c.fillRect(x,y,1.2,3);}
 c.strokeStyle='rgba(111,182,216,.8)';c.setLineDash([4,4]);c.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);c.restore();}
function mark(c,x,y,s,color){c.save();c.font='bold 18px Nunito, "Segoe UI", sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle=INK;c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y);c.restore();}
