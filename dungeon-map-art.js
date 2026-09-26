// Dungeon-Karte (Etappe 2 „Lesbar wie WoW“, E-71; Grafik-Review Dungeon Befund 9, Zielbild A; Plan §5):
// Die Leinwand füllt das Fenster. Unerkundetes zeigt Big Bs Prospekt als Zeichnung in Sepia (Burggraben, Mauer mit Zinnen,
// Ecktürme, je Raum ein Ornament nach dem Prospekt-Namen); erkundete Räume stanzen ihn aus und zeigen den Pappe-Grundriss mit
// Türen. Symbole aus map-symbols.js: Schädel (Boss, besiegt grau mit Haken), Krone (Big B), Stern (selten), Fahne (Kontrollpunkt),
// Treppe/Leiter/Aufzug mit goldenem Pfeil, Rolltor, Tresortür mit drei Siegelfeldern. Held als Pfeil mit Blickrichtung,
// Söldner als Punkte, Wegmarke als Nadel mit Route. Treffer (für Tooltip und Klick) liegen danach in canvas.dungeonHits (CSS-Pixel).
// Dazu die Minikarte im Dungeon: Ausschnitt um den Helden, Gegner als rote Punkte (drawDungeonMini).
import {DUNGEON_BOSSES,DUNGEON_SCALE as U,DUNGEON_UI as DU,DUNGEON_TEXT as DT} from './content/index.js';
import {dungeonRun,floorAt,doorOpen,toWorld,concealed,requiredSeals,chestShown} from './dungeon.js';
import {mapIcon} from './map-symbols.js';

const TAU=Math.PI*2,FLOORS=['e0','k1','k2'];
const SEPIA='#c9a46a',SEPIA_INK='#6b4a24',KRAFT='#d9b98a',KRAFT_EDGE='#eed9b5',INK='#2b2118',FELT='#15241c';
const ink=(c,t,x,y,{size=13,color=INK,weight='800',font='Nunito, "Segoe UI", sans-serif',align='center',outline=null,italic=false}={})=>{c.save();c.font=(italic?'italic ':'')+weight+' '+size+'px '+font;c.textAlign=align;c.textBaseline='middle';if(outline){c.lineJoin='round';c.lineWidth=Math.max(2,size/4);c.strokeStyle=outline;c.strokeText(t,x,y);}c.fillStyle=color;c.fillText(t,x,y);c.restore();};
const icon=(c,key,x,y,px)=>{const img=mapIcon(key,px);if(img)c.drawImage(img,Math.round(x-px/2),Math.round(y-px/2),px,px);};
const fits=(c,t,max,size,weight='800',italic=false,font='Nunito, sans-serif')=>{for(let n=size;n>=size*.7;n-=.5){c.font=(italic?'italic ':'')+weight+' '+n+'px '+font;if(c.measureText(t).width<=max)return n;}return 0;};
const floorIndex=f=>FLOORS.indexOf(f);
/** Raum-Ornament nach dem Prospekt-Namen: was Big B verspricht (Brunnen, Turm, Garten, Saal …). */
function ornament(c,name,x,y,r){const n=name.toLowerCase();c.save();c.strokeStyle=SEPIA_INK;c.fillStyle=SEPIA_INK;c.lineWidth=Math.max(1,r*.08);
 if(/turm/.test(n)){c.beginPath();c.arc(x,y,r*.55,0,TAU);c.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;c.fillRect(x+Math.cos(a)*r*.55-r*.08,y+Math.sin(a)*r*.55-r*.08,r*.16,r*.16);}}
 else if(/brunnen|garten|rosen/.test(n)){for(let i=0;i<5;i++){const a=i/5*TAU;c.beginPath();c.arc(x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3,r*.22,0,TAU);c.stroke();}c.beginPath();c.arc(x,y,r*.14,0,TAU);c.fill();}
 else if(/saal|galerie|ahnen|thron/.test(n)){for(let i=-2;i<=2;i++){c.beginPath();c.arc(x+i*r*.35,y,r*.1,0,TAU);c.fill();}c.strokeRect(x-r*.85,y-r*.35,r*1.7,r*.7);if(/thron/.test(n)){c.beginPath();c.moveTo(x-r*.3,y-r*.55);c.lineTo(x-r*.15,y-r*.8);c.lineTo(x,y-r*.6);c.lineTo(x+r*.15,y-r*.8);c.lineTo(x+r*.3,y-r*.55);c.stroke();}}
 else if(/stall/.test(n)){c.beginPath();c.arc(x,y,r*.4,Math.PI*.1,Math.PI*.9,true);c.stroke();}
 else if(/wein|kelter|katakomben|keller/.test(n)){for(const dx of [-.4,0,.4]){c.beginPath();c.ellipse(x+dx*r,y,r*.16,r*.26,0,0,TAU);c.stroke();}}
 else if(/zugbrücke|brücke/.test(n)){for(let i=-2;i<=2;i++)c.fillRect(x-r*.6,y+i*r*.18,r*1.2,r*.06);}
 else if(/schatz/.test(n)){c.strokeRect(x-r*.4,y-r*.25,r*.8,r*.5);c.beginPath();c.moveTo(x-r*.4,y-r*.05);c.lineTo(x+r*.4,y-r*.05);c.stroke();}
 else{c.beginPath();c.moveTo(x-r*.4,y);c.lineTo(x+r*.4,y);c.moveTo(x,y-r*.4);c.lineTo(x,y+r*.4);c.stroke();}
 c.restore();}
/** Prospekt einer Ebene: Burggraben, Mauer mit Zinnen, Ecktürme, schraffierte Räume mit Ornament und Fantasienamen. */
function drawProspect(c,def,f,R,box,k,alpha=1,visited=null){
 c.save();c.globalAlpha=alpha;const pad=10*k,x0=box.x-pad,y0=box.y-pad,x1=box.x+box.w+pad,y1=box.y+box.h+pad;
 // Burggraben: breites Wasserband mit Wellen rund um die Mauer
 const m=16*k;c.fillStyle='#6f9a98aa';c.strokeStyle='#3f5f5ecc';c.lineWidth=1.5*k;c.beginPath();c.roundRect?.(x0-m-6*k,y0-m-6*k,x1-x0+2*(m+6*k),y1-y0+2*(m+6*k),22*k);c.fill();c.stroke();
 c.strokeStyle='#e8f2ecaa';c.lineWidth=k;const wave=(x,y)=>{c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+4*k,y-3*k,x+8*k,y);c.quadraticCurveTo(x+12*k,y+3*k,x+16*k,y);c.stroke();};for(let x=x0;x<x1-16*k;x+=30*k){wave(x,y0-m/2-4*k);wave(x+12*k,y1+m/2+4*k);}for(let y=y0+10*k;y<y1-10*k;y+=34*k){c.save();c.translate(x0-m/2-4*k,y);c.rotate(Math.PI/2);wave(0,0);c.restore();c.save();c.translate(x1+m/2+4*k,y);c.rotate(Math.PI/2);wave(0,0);c.restore();}
 // Zugbrücke (Prospekt): über den Graben auf der Südseite
 c.fillStyle='#b08a5a';c.fillRect((x0+x1)/2-10*k,y1,20*k,m+6*k);c.strokeStyle=SEPIA_INK;c.lineWidth=k;for(let y=y1+3*k;y<y1+m+6*k;y+=4*k){c.beginPath();c.moveTo((x0+x1)/2-10*k,y);c.lineTo((x0+x1)/2+10*k,y);c.stroke();}
 // Mauer mit Zinnen
 c.fillStyle='#e6cf9e';c.fillRect(x0,y0,x1-x0,y1-y0);c.strokeStyle=SEPIA_INK;c.lineWidth=2*k;c.strokeRect(x0,y0,x1-x0,y1-y0);
 c.fillStyle=SEPIA_INK;for(let x=x0;x<x1-4*k;x+=10*k){c.fillRect(x,y0-4*k,5*k,4*k);c.fillRect(x,y1,5*k,4*k);}for(let y=y0;y<y1-4*k;y+=10*k){c.fillRect(x0-4*k,y,4*k,5*k);c.fillRect(x1,y,4*k,5*k);}
 // Ecktürme mit Zinnenkranz und Fähnchen
 const tr=Math.max(12*k,Math.min(22*k,(x1-x0)*.035));for(const [x,y] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){c.fillStyle='#dcc28c';c.strokeStyle=SEPIA_INK;c.lineWidth=2*k;c.beginPath();c.arc(x,y,tr,0,TAU);c.fill();c.stroke();c.fillStyle=SEPIA_INK;for(let i=0;i<12;i++){const a=i/12*TAU;c.save();c.translate(x+Math.cos(a)*tr,y+Math.sin(a)*tr);c.rotate(a);c.fillRect(-1.5*k,-2*k,4*k,4*k);c.restore();}c.beginPath();c.arc(x,y,tr*.55,0,TAU);c.stroke();c.lineWidth=1.2*k;c.beginPath();c.moveTo(x,y-tr*.55);c.lineTo(x,y-tr*1.5);c.stroke();c.fillStyle='#a8483c';c.beginPath();c.moveTo(x,y-tr*1.5);c.lineTo(x+tr*.8,y-tr*1.3);c.lineTo(x,y-tr*1.1);c.closePath();c.fill();}
 // Räume laut Prospekt
 for(const room of def.rooms.filter(r=>r.floor===f)){if(visited&&visited.has(room.id))continue;const big=room.rects.reduce((a,b)=>a[2]*a[3]>=b[2]*b[3]?a:b),rr=R(big);
  for(const q of room.rects){const r=R(q);c.fillStyle='#d9bd8a';c.fillRect(r.x,r.y,r.w,r.h);c.save();c.beginPath();c.rect(r.x,r.y,r.w,r.h);c.clip();c.strokeStyle='#a9824a44';c.lineWidth=k;for(let d=-r.h;d<r.w;d+=7*k){c.beginPath();c.moveTo(r.x+d,r.y+r.h);c.lineTo(r.x+d+r.h,r.y);c.stroke();}c.restore();c.strokeStyle=SEPIA_INK;c.lineWidth=1.4*k;c.strokeRect(r.x,r.y,r.w,r.h);}
  const cx=rr.x+rr.w/2,cy=rr.y+rr.h/2,orn=Math.min(rr.w,rr.h)*.32;ornament(c,room.prospect,cx,cy-(rr.h>44*k?8*k:0),Math.max(6*k,Math.min(orn,22*k)));
  if(rr.h>30*k){const n=fits(c,room.prospect,rr.w-8*k,12*k,'700',true,'Georgia, serif');if(n)ink(c,room.prospect,cx,cy+Math.min(rr.h*.28,18*k),{size:n,weight:'700',color:SEPIA_INK,italic:true,font:'Georgia, serif'});}}
 c.restore();}
/**
 * Volle Dungeon-Karte. opts: floor (Ebene, sonst die des Helden), prospect (Prospekt über alles), hover (Treffer-Schlüssel),
 * waypoint ({floor,x,y} in Weltpunkten), route ([{x,y}] Welt, nur für die Ebene der Wegmarke), heading (Blickrichtung Rad).
 */
export function drawDungeonMapFull(canvas,g,opts={}){
 const run=dungeonRun(g);if(!run||!canvas)return null;const def=run.def,here=floorAt(def,g.player.x,g.player.y),f=opts.floor||here||run.checkpoint.floor,fl=def.floors[f];
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=Math.max(1,W/Math.max(1,canvas.clientWidth||W)),pad=40*k;
 /* Etappe 2: die Leinwand zeigt den Grundriss der Ebene (Räume + Graben), nicht das leere Ebenenraster – so füllt die Karte das Fenster */
 const rooms=def.rooms.filter(r=>r.floor===f),bb=rooms.flatMap(r=>r.rects).reduce((a,q)=>({x0:Math.min(a.x0,q[0]),y0:Math.min(a.y0,q[1]),x1:Math.max(a.x1,q[0]+q[2]),y1:Math.max(a.y1,q[1]+q[3])}),{x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity}),M=4.5;
 const s=Math.min((W-pad*2)/(bb.x1-bb.x0+2*M),(H-pad*2)/(bb.y1-bb.y0+2*M)),ox=(W-(bb.x1-bb.x0)*s)/2-bb.x0*s,oy=(H-(bb.y1-bb.y0)*s)/2-bb.y0*s;
 const R=q=>({x:ox+q[0]*s,y:oy+q[1]*s,w:q[2]*s,h:q[3]*s}),P=(x,y)=>({x:ox+x*s,y:oy+y*s}),fromWorld=pt=>({x:ox+(pt.x-fl.origin.x)/U*s,y:oy+(pt.y-fl.origin.y)/U*s});
 const box=(()=>{let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const r of rooms)for(const q of r.rects){const b=R(q);x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);x1=Math.max(x1,b.x+b.w);y1=Math.max(y1,b.y+b.h);}return{x:x0,y:y0,w:x1-x0,h:y1-y0};})();
 const hits=[],css=v=>v/k;
 c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.fillStyle=FELT;c.fillRect(0,0,W,H);
 {const v=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.hypot(W,H)*.6);v.addColorStop(0,'#1f3328');v.addColorStop(1,'#0d1712');c.fillStyle=v;c.fillRect(0,0,W,H);}
 // 1) Prospekt unter allem (unerkundete Räume), erkundete Räume stanzen ihn aus
 drawProspect(c,def,f,R,box,k,1,run.visited);
 // 2) Erkundete Räume: Pappe mit Tinte, Schild groß; Türen als Lücken
 const seen=r=>run.visited.has(r.id);
 for(const room of rooms){if(!seen(room))continue;for(const q of room.rects){const r=R(q);c.fillStyle=KRAFT;c.fillRect(r.x,r.y,r.w,r.h);c.fillStyle='#c9a46f33';for(let x=r.x+8*k;x<r.x+r.w;x+=16*k)c.fillRect(x,r.y,k,r.h);}
  if(opts.hover==='room:'+room.id){c.save();c.strokeStyle='#f3cf7a';c.lineWidth=3*k;for(const q of room.rects){const r=R(q);c.strokeRect(r.x,r.y,r.w,r.h);}c.restore();}}
 c.save();c.strokeStyle=INK;c.lineWidth=3*k;for(const room of rooms){if(!seen(room))continue;for(const q of room.rects){const r=R(q);c.strokeRect(r.x,r.y,r.w,r.h);}}c.restore();
 for(const room of rooms){if(!seen(room))continue;for(const q of room.rects){const r=R(q);c.fillStyle=KRAFT;c.fillRect(r.x+1.5*k,r.y+1.5*k,r.w-3*k,r.h-3*k);}}
 for(const d of def.doors.filter(d=>d.floor===f)){const r=R(d.rect),open=doorOpen(run,d),known=rooms.some(room=>seen(room)&&room.rects.some(q=>{const b=R(q);return r.x<b.x+b.w+2&&r.x+r.w>b.x-2&&r.y<b.y+b.h+2&&r.y+r.h>b.y-2;}));if(!known)continue;
  if(d.lock?.seals){c.fillStyle='#7d8a96';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle=INK;c.lineWidth=2*k;c.strokeRect(r.x,r.y,r.w,r.h);const need=requiredSeals(run.def,d.lock.seals)/* Etappe 3: nur die verlangten Siegel */,n=need.length,vertical=r.h>r.w;for(let i=0;i<n;i++){const cx=vertical?r.x+r.w/2:r.x+(i+1)*r.w/(n+1),cy=vertical?r.y+(i+1)*r.h/(n+1):r.y+r.h/2;icon(c,run.seals.has(need[i])?'seal':'seal-empty',cx,cy,Math.min(18*k,Math.max(10*k,(vertical?r.w:r.h)*.8)));}
   hits.push({kind:'vault',x:css(r.x+r.w/2),y:css(r.y+r.h/2),r:css(Math.max(r.w,r.h)/2+4*k),label:DU.map.vault,note:DU.map.vaultNote(run.seals.size,n)});continue;}
  if(open){c.fillStyle=KRAFT;c.fillRect(r.x-1,r.y-1,r.w+2,r.h+2);c.strokeStyle=KRAFT_EDGE;c.lineWidth=k;c.beginPath();if(r.h>r.w){c.moveTo(r.x+r.w/2,r.y+2*k);c.lineTo(r.x+r.w/2,r.y+r.h-2*k);}else{c.moveTo(r.x+2*k,r.y+r.h/2);c.lineTo(r.x+r.w-2*k,r.y+r.h/2);}c.stroke();}
  else{c.fillStyle=d.arena?'#8f2f2c':'#4a3a2a';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle=INK;c.lineWidth=1.5*k;c.strokeRect(r.x,r.y,r.w,r.h);hits.push({kind:'door',x:css(r.x+r.w/2),y:css(r.y+r.h/2),r:css(Math.max(r.w,r.h)/2+3*k),label:DU.map.door,note:DU.map.doorLocked});}}
 for(const room of rooms){if(!seen(room))continue;const big=room.rects.reduce((a,b)=>a[2]*a[3]>=b[2]*b[3]?a:b),r=R(big),n=fits(c,room.sign,r.w-8*k,13*k);if(n&&r.h>16*k)ink(c,room.sign,r.x+r.w/2,r.y+Math.min(r.h/2,14*k+n/2),{size:n,color:INK});
  hits.push({kind:'room',id:room.id,rects:room.rects.map(q=>{const b=R(q);return {x:css(b.x),y:css(b.y),w:css(b.w),h:css(b.h)};}),label:room.sign,note:room.truth+' · '+roomState(g,run,room)});}
 for(const room of rooms){if(seen(room)||room.secret)continue;hits.push({kind:'room',id:room.id,unexplored:true,rects:room.rects.map(q=>{const b=R(q);return {x:css(b.x),y:css(b.y),w:css(b.w),h:css(b.h)};}),label:room.prospect,note:DU.map.unexplored});}
 // 3) Übergänge, Kontrollpunkte, Ausgang
 const sym=Math.round(20*k);
 for(const t of def.transitions)for(const side of ['a','b']){const e=t[side];if(e.floor!==f)continue;if(t.secret&&!run.secrets.has(t.secret))continue;const room=rooms.find(r=>r.rects.some(q=>e.x>=q[0]&&e.x<=q[0]+q[2]&&e.y>=q[1]&&e.y<=q[1]+q[3]));if(room&&!seen(room))continue;
  const to=t[side==='a'?'b':'a'],p=P(e.x,e.y),kind=t.kind==='ladder'?'ladder':t.kind==='lift'?'lift':'stairs',up=t.kind==='ladder'?side==='b':floorIndex(to.floor)<floorIndex(f);
  const usable=!(t.oneWay&&t.oneWay!==side);icon(c,kind+(usable?'':':dim'),p.x,p.y,sym);if(usable)icon(c,up?'arrow-up':'arrow-down',p.x+sym*.45,p.y-sym*.45,Math.round(12*k));
  hits.push({kind:'step',id:t.id,x:css(p.x),y:css(p.y),r:css(sym*.6),label:stepName(t,side),note:DU.steps[up?'up':'down']+(to.floor!==f?' · '+def.floors[to.floor].name:''),floor:to.floor!==f?to.floor:null});}
 for(const room of rooms.filter(r=>r.checkpoint&&seen(r))){const p=P(room.checkpoint.x,room.checkpoint.y),active=run.checkpoint.room===room.id;icon(c,'flag',p.x,p.y-4*k,Math.round((active?20:16)*k));hits.push({kind:'checkpoint',x:css(p.x),y:css(p.y-4*k),r:css(10*k),label:DU.map.checkpoint,note:room.sign});}
 if(def.exit.floor===f){const p=P(def.exit.x,def.exit.y);icon(c,'exit',p.x,p.y+6*k,sym);hits.push({kind:'exit',x:css(p.x),y:css(p.y+6*k),r:css(sym*.6),label:DU.map.exit,note:''});}
 /* Dungeon-Fix 3 (Big-B-Abnahme #721: Truhe und Hinterausgang nicht gefunden): nach Big B stehen beide auf der Karte */
 for(const m of endMarks(run,f)){const p=P(m.x,m.y);icon(c,m.icon,p.x,p.y,sym);hits.push({kind:m.kind,x:css(p.x),y:css(p.y),r:css(sym*.6),label:m.label,note:m.note});}
 // 4) Bosse: Schädel (Krone für Big B, Stern für selten), besiegt grau mit Haken; unerkundet blass. Klick öffnet das Journal.
 for(const b of def.bosses){const room=def.rooms.find(r=>r.id===b.room);if(room.floor!==f||!DUNGEON_BOSSES[b.id])continue;const p=P(...b.at),dead=run.killed.has(b.id),known=seen(room),hov=opts.hover==='boss:'+b.id,px=Math.round((hov?28:24)*k);
  if(hov){c.save();c.fillStyle='#f3cf7a55';c.beginPath();c.arc(p.x,p.y,px*.7,0,TAU);c.fill();c.restore();}
  icon(c,(dead?'skull-dead':b.id==='bigb'?'crown':'skull')+(known||dead?'':':dim'),p.x,p.y,px);if(b.rare&&!dead)icon(c,'star',p.x+px*.45,p.y-px*.45,Math.round(12*k));
  hits.push({kind:'boss',id:b.id,x:css(p.x),y:css(p.y),r:css(px*.6),label:DUNGEON_BOSSES[b.id].name,note:(dead?DU.map.bossDead:DU.map.boss)+' · '+DU.map.bossNote});}
 // 5) Wegmarke mit Route
 const wp=opts.waypoint;if(wp&&wp.floor===f){const route=opts.route||[];if(route.length){c.save();c.strokeStyle='#1d252bcc';c.lineWidth=5*k;c.lineCap='round';c.lineJoin='round';c.beginPath();route.forEach((q,i)=>{const a=fromWorld(q);i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y);});c.stroke();c.setLineDash([6*k,5*k]);c.strokeStyle='#f1cd77';c.lineWidth=2.5*k;c.stroke();c.restore();}
  const a=fromWorld(wp);icon(c,'dest',a.x,a.y-10*k,Math.round(24*k));hits.push({kind:'waypoint',x:css(a.x),y:css(a.y-10*k),r:css(12*k),label:DU.map.waypoint,note:DU.map.waypointNote});}
 // 6) Gruppe und Held (Pfeil mit Blickrichtung)
 if(here===f){for(const o of g.companions||[]){if(o.state==='down')continue;const q=fromWorld(o);c.fillStyle='#10201a';c.beginPath();c.arc(q.x,q.y,5*k,0,TAU);c.fill();c.fillStyle='#8fd0ff';c.beginPath();c.arc(q.x,q.y,3.6*k,0,TAU);c.fill();hits.push({kind:'mate',x:css(q.x),y:css(q.y),r:css(6*k),label:o.view?.name||o.name||'',note:''});}
  const p=fromWorld(g.player),h=opts.heading??-Math.PI/2;c.save();c.translate(p.x,p.y);c.rotate(h+Math.PI/2);const arrow=()=>{c.beginPath();c.moveTo(0,-11*k);c.lineTo(-8*k,8*k);c.lineTo(0,4*k);c.lineTo(8*k,8*k);c.closePath();};c.lineJoin='round';arrow();c.strokeStyle='#fff';c.lineWidth=6*k;c.stroke();arrow();c.strokeStyle=INK;c.lineWidth=2*k;c.stroke();arrow();c.fillStyle='#fff3cf';c.fill();c.beginPath();c.moveTo(0,-11*k);c.lineTo(0,4*k);c.lineTo(8*k,8*k);c.closePath();c.fillStyle='#e9b84a';c.fill();c.restore();hits.push({kind:'you',x:css(p.x),y:css(p.y),r:css(10*k),label:DU.map.you,note:''});}
 // 7) Prospekt über allem (Schalter)
 if(opts.prospect)drawProspect(c,def,f,R,box,k,.9,null);
 c.restore();canvas.dungeonHits=hits;canvas.dungeonView={ox,oy,s,k,floor:f,origin:fl.origin};return {floor:f,hits};
}
function stepName(t,side){return ({stairs:'Treppe',ladder:'Leiter',shaft:'Lichtschacht',spiral:'Wendeltreppe',lift:'Getränkeaufzug'})[t.kind]||t.kind;}
/** Zustand eines Raums für den Tooltip: geräumt oder wie viele Gegner übrig. */
/** Dungeon-Fix 3: Endtruhe (bis sie geöffnet ist) und Hinterausgang, sobald Big B liegt – für Karte und Minikarte. Punkte in Rastermaß. */
export function endMarks(run,f){const def=run.def,c=def.chest,b=def.backExit,won=!c||run.killed.has(c.boss),out=[];
 if(c&&c.floor===f&&chestShown(run)&&!run.chest)out.push({kind:'chest',icon:'loot',x:c.x,y:c.y,label:DT.chest.label,note:DT.chest.labelNote});
 if(b&&b.floor===f&&won)out.push({kind:'exit',icon:'exit',x:b.x,y:b.y,label:DT.backExitLabel,note:DT.backExitNote});return out;}
export function roomState(g,run,room){const n=g.enemies.filter(e=>e.hp>0&&!e.cardboard&&e.dungeon&&roomOf(run.def,room,e)).length;return n?DU.map.enemies(n):DU.map.cleared;}
function roomOf(def,room,e){const f=def.floors[room.floor],o=f.origin;return room.rects.some(q=>e.x>=o.x+q[0]*U&&e.x<=o.x+(q[0]+q[2])*U&&e.y>=o.y+q[1]*U&&e.y<=o.y+(q[1]+q[3])*U);}
/** Weltpunkt unter einem Punkt der Leinwand (CSS-Pixel) – für die Wegmarke. */
export function mapToWorld(canvas,x,y){const v=canvas.dungeonView;if(!v)return null;return {floor:v.floor,x:v.origin.x+((x*v.k)-v.ox)/v.s*U,y:v.origin.y+((y*v.k)-v.oy)/v.s*U};}

/**
 * Minikarte im Dungeon: Ausschnitt ≈ 36 m um den Helden auf der eigenen Ebene, Räume als Pappe mit Tinte, unerkundete gedämpft,
 * Gegner als rote Punkte (Boss als Schädel), Söldner blau, Übergänge als Symbol, Held als Pfeil in der Mitte.
 */
const miniHeading=new WeakMap();
export function drawDungeonMini(canvas,g,{span=300}={}){
 const run=dungeonRun(g);if(!run||!canvas)return;const hd=miniHeading.get(g)||{x:g.player.x,y:g.player.y,a:-Math.PI/2},mx=g.player.x-hd.x,my=g.player.y-hd.y;if(mx*mx+my*my>1)hd.a=Math.atan2(my,mx);hd.x=g.player.x;hd.y=g.player.y;miniHeading.set(g,hd);const heading=hd.a;const def=run.def,f=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,fl=def.floors[f];
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=W/span,p=g.player,X=x=>(x-p.x)*k+W/2,Y=y=>(y-p.y)*k+H/2;
 c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#101b15';c.fillRect(0,0,W,H);
 const rooms=def.rooms.filter(r=>r.floor===f&&(!r.secret||run.visited.has(r.id)));
 for(const room of rooms){const seen=run.visited.has(room.id);for(const q of room.rects){const x=X(fl.origin.x+q[0]*U),y=Y(fl.origin.y+q[1]*U),w=q[2]*U*k,h=q[3]*U*k;c.fillStyle=seen?'#cdb084':'#5a5040';c.fillRect(x,y,w,h);c.strokeStyle=seen?'#2b2118':'#3a3326';c.lineWidth=Math.max(1.5,W/160);c.strokeRect(x,y,w,h);}}
 for(const d of def.doors.filter(d=>d.floor===f)){const x=X(fl.origin.x+d.rect[0]*U),y=Y(fl.origin.y+d.rect[1]*U),w=d.rect[2]*U*k,h=d.rect[3]*U*k;c.fillStyle=doorOpen(run,d)?'#cdb084':d.lock?.seals?'#7d8a96':'#4a3a2a';c.fillRect(x,y,w,h);}
 const ik=Math.round(W/9);
 for(const t of def.transitions)for(const side of ['a','b']){const e=t[side];if(e.floor!==f||(t.secret&&!run.secrets.has(t.secret)))continue;const q=toWorld(def,f,e.x,e.y);icon(c,t.kind==='ladder'?'ladder':t.kind==='lift'?'lift':'stairs',X(q.x),Y(q.y),ik);}
 for(const o of g.companions||[]){if(o.state==='down')continue;c.fillStyle='#10201a';c.beginPath();c.arc(X(o.x),Y(o.y),W/55,0,TAU);c.fill();c.fillStyle='#8fd0ff';c.beginPath();c.arc(X(o.x),Y(o.y),W/75,0,TAU);c.fill();}
 for(const e of g.enemies){if(!(e.hp>0)||e.cardboard||concealed(g,e))continue;const x=X(e.x),y=Y(e.y);if(x<-10||y<-10||x>W+10||y>H+10)continue;
  if(e.dungeonBoss){icon(c,'skull',x,y,ik);continue;}c.fillStyle='#10201a';c.beginPath();c.arc(x,y,W/60,0,TAU);c.fill();c.fillStyle=e.aggro?'#ff5a3c':'#ee6a4f';c.beginPath();c.arc(x,y,W/85,0,TAU);c.fill();}
 for(const m of endMarks(run,f)){const q=toWorld(def,f,m.x,m.y);icon(c,m.icon,X(q.x),Y(q.y),ik);}/* Dungeon-Fix 3 */
 const wp=run.waypoint;if(wp&&wp.floor===f)icon(c,'dest',X(wp.x),Y(wp.y)-ik*.4,ik);
 c.translate(W/2,H/2);c.rotate(heading+Math.PI/2);const s=W/22;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.72,s*.78);c.lineTo(0,s*.4);c.lineTo(-s*.72,s*.78);c.closePath();c.lineJoin='round';c.lineWidth=W/70;c.strokeStyle='#1c1712';c.stroke();c.fillStyle='#fff3cf';c.fill();
 c.restore();
}
