// Zeichnen des Dungeons (Plan Abschnitte 5 und 14): Boden, Wände, Türen, Übergänge, Schilder und Warnflächen in der Welt,
// dazu die Dungeon-Karte (Prospekt gegen Wirklichkeit). Grundriss aus content/dungeons.js, Zustand aus dungeon.js.
import {DUNGEON_TEXT as T,DUNGEON_BOSSES,DUNGEON_SCALE as U,DUNGEON_UI as DU} from './content/index.js';
import {dungeonRun,floorAt,rectWorld,toWorld,doorOpen,coneReach,CONE_RAYS,fallActive} from './dungeon.js';

const THEMES={
 garage:{void:'#15130f',floor:'#8d8778',tile:'#7d776a',wall:'#3b3830',trim:'#c9c2ad'},
 partykeller:{void:'#140f0c',floor:'#a9794f',tile:'#94673f',wall:'#3a2618',trim:'#efe2c8'},
 basalt:{void:'#0d0f10',floor:'#4d5156',tile:'#3e4247',wall:'#1d2023',trim:'#8b9096'}
};
const INK='#2b2118',GOLD='#ecb95c',STAMP='#ad5260',CREAM='#f3e6cc';

function text(c,s,x,y,{size=8,color=CREAM,weight='bold',align='center',outline='#1b140e'}={}){
 c.save();c.font=weight+' '+size+'px Nunito, "Segoe UI", sans-serif';c.textAlign=align;c.textBaseline='middle';
 if(outline){c.lineWidth=2.5;c.strokeStyle=outline;c.strokeText(s,x,y);}c.fillStyle=color;c.fillText(s,x,y);c.restore();
}
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};

/** Boden, Wände, Türen und Übergänge der aktuellen Ebene; darüber zeichnet der Renderer Figuren und Effekte. */
export function drawDungeonGround(c,g,view){
 const run=dungeonRun(g);if(!run)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,theme=THEMES[def.floors[floor].theme]||THEMES.basalt;
 box(c,theme.void,view.ox-2,view.oy-2,view.W+4,view.H+4);
 const rooms=def.rooms.filter(r=>r.floor===floor),doors=def.doors.filter(d=>d.floor===floor);
 // Böden mit Fugen
 for(const room of rooms)for(const q of room.rects){const r=rectWorld(def,floor,q);box(c,theme.floor,r.x,r.y,r.w,r.h);c.fillStyle=theme.tile;
  for(let x=r.x+16;x<r.x+r.w;x+=16)c.fillRect(Math.round(x),r.y,1,r.h);for(let y=r.y+16;y<r.y+r.h;y+=16)c.fillRect(r.x,Math.round(y),r.w,1);}
 // Wände als Kante, offene Türen schneiden sie wieder auf
 c.save();c.strokeStyle=theme.wall;c.lineWidth=5;for(const room of rooms)for(const q of room.rects){const r=rectWorld(def,floor,q);c.strokeRect(r.x-2,r.y-2,r.w+4,r.h+4);}c.restore();
 for(const d of doors){const r=rectWorld(def,floor,d.rect),open=doorOpen(run,d);
  if(open){box(c,theme.floor,r.x,r.y,r.w,r.h);continue;}
  if(d.lock?.seals){box(c,STAMP,r.x,r.y,r.w,r.h);const n=d.lock.seals.length;for(let i=0;i<n;i++){const cx=r.x+r.w/2,cy=r.y+(i+1)*r.h/(n+1);c.fillStyle=run.seals.has(d.lock.seals[i])?GOLD:'#5a2a31';c.beginPath();c.arc(cx,cy,5,0,Math.PI*2);c.fill();c.strokeStyle=CREAM;c.lineWidth=1;c.stroke();}continue;}
  box(c,'#2a1f18',r.x,r.y,r.w,r.h);c.strokeStyle=d.arena?'#e18569':'#8a6a4a';c.lineWidth=2;const vertical=r.h>r.w;c.beginPath();
  for(let i=1;i<4;i++){if(vertical){c.moveTo(r.x,r.y+r.h*i/4);c.lineTo(r.x+r.w,r.y+r.h*i/4);}else{c.moveTo(r.x+r.w*i/4,r.y);c.lineTo(r.x+r.w*i/4,r.y+r.h);}}c.stroke();}
 // Ausstattung je Ebene: Pappzinnen im Hof, Porträts in der Galerie, Fassrinnen in der Kelterhalle
 if(floor==='e0'){const r=rectWorld(def,floor,def.rooms.find(x=>x.id==='hof').rects[0]);for(let x=r.x+6;x<r.x+r.w-8;x+=22){box(c,'#b69a6c',x,r.y+2,12,6);box(c,'#8a7250',x,r.y+2,12,1);}}
 if(floor==='k1'){const g0=def.rooms.find(x=>x.id==='galerie'),top=rectWorld(def,floor,g0.rects[0]);for(let i=0;i<12;i++){const x=top.x+24+i*(top.w-48)/11;box(c,'#6b4a2b',x-5,top.y+2,10,8);box(c,'#d8c49c',x-3,top.y+4,6,4);}}
 if(floor==='k2'){const k=def.rooms.find(x=>x.id==='kelterhalle'),r=rectWorld(def,floor,k.rects[0]);c.save();c.strokeStyle='#2c2f33';c.lineWidth=3;for(const f of [.2,.5,.8]){c.beginPath();c.moveTo(r.x+4,r.y+r.h*f);c.lineTo(r.x+r.w-4,r.y+r.h*f);c.stroke();}c.restore();}
 // Übergänge und Geheimnisse
 for(const t of def.transitions)for(const side of ['a','b']){const s=t[side];if(s.floor!==floor)continue;const hidden=t.secret&&!run.secrets.has(t.secret);const p=toWorld(def,floor,s.x,s.y);
  if(hidden){box(c,'#8a6f4c',p.x-12,p.y-6,24,12);c.strokeStyle='#5c4630';c.lineWidth=1;c.strokeRect(p.x-12,p.y-6,24,12);continue;}
  if(t.oneWay&&t.oneWay!==side)continue;drawStep(c,t.kind,p);text(c,T.step[t.kind],p.x,p.y+14,{size:6,color:'#e8dcc0'});}
 // Ausgang (Rolltor)
 if(def.exit.floor===floor){const p=toWorld(def,floor,def.exit.x,def.exit.y);box(c,GOLD,p.x-24,p.y+4,48,6);box(c,INK,p.x-24,p.y+4,48,1);text(c,T.leave,p.x,p.y+18,{size:6,color:GOLD});}
 // Raumschilder: Schild groß, Wirklichkeit klein, oben im Raum
 for(const room of rooms){if(room.secret&&!run.visited.has(room.id))continue;const r=rectWorld(def,floor,room.rects[0]);text(c,room.sign,r.x+r.w/2,r.y+11,{size:8,color:run.room===room.id?GOLD:CREAM});text(c,room.truth,r.x+r.w/2,r.y+21,{size:6,weight:'normal',color:'#d8ccb0'});}
 // Warnflächen der Kegel, Schildwall
 for(const e of g.enemies){if(e.hp<=0)continue;const k=e.cast;
  if(k?.cone)drawConeWarning(c,g,e,k);
  if(e.dungeonBoss)drawFallEdge(c,g,run,floor,e);
  if(e.frontGuard>0){const a=e.frontAngle??0;c.save();c.strokeStyle='#e8dcc0';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y-10,22,a-Math.PI/3,a+Math.PI/3);c.stroke();c.restore();}}
}
/** Kegel-Warnfläche (E-71): dieselben Strahlen wie der Treffer (dungeon.js coneReach) – endet an Wänden, ragt nicht in den Nachbarraum.
 *  Grundfläche, wachsende Füllung, Rand blitzt im letzten Viertel. */
function drawConeWarning(c,g,e,k){
 const progress=1-k.remaining/k.total,half=k.cone.angle*Math.PI/360,a0=k.angle??0,reach=coneReach(g.world,e,k);
 const poly=limit=>{c.beginPath();c.moveTo(e.x,e.y);for(let i=0;i<=CONE_RAYS;i++){const a=a0-half+2*half*i/CONE_RAYS,r=Math.min(reach[i],limit);c.lineTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r);}c.closePath();};
 c.save();c.fillStyle='#c4302640';poly(Infinity);c.fill();c.fillStyle='#e2432f70';poly(k.cone.range*progress);c.fill();
 c.strokeStyle=progress>.75&&Math.sin(g.time*28)>0?'#fff0c8':'#ff5a3c';c.lineWidth=2;poly(Infinity);c.stroke();c.restore();
}
/** Treppenkante (E-71): erst ab Phase 2 gefährlich – dann liegt eine gestrichelte Warnlinie auf der Kante. */
function drawFallEdge(c,g,run,floor,e){
 {const fall=DUNGEON_BOSSES[e.bossId]?.fall;if(!fall||!(e.hp>0)||!e.aggro||!fallActive(e,fall))return;const room=run.def.rooms.find(r=>r.id===e.dungeonBoss?.room);if(!room||room.floor!==floor)return;
  const r=rectWorld(run.def,floor,fall.rect),pulse=.55+.45*Math.sin(g.time*6);c.save();c.fillStyle='rgba(226,67,47,'+(.12+.1*pulse).toFixed(3)+')';c.fillRect(r.x,r.y,r.w,r.h);
  c.strokeStyle='#ff5a3c';c.lineWidth=2.5;c.setLineDash([7,5]);c.lineDashOffset=-g.time*12;c.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);c.restore();}
}
function drawStep(c,kind,p){
 c.save();c.translate(p.x,p.y);
 if(kind==='stairs'||kind==='spiral'){box(c,'#2a2520',-10,-8,20,16);for(let i=0;i<4;i++)box(c,'#a39984',-9,-7+i*4,18,2);}
 else if(kind==='ladder'){box(c,'#6b4a2b',-6,-10,2,20);box(c,'#6b4a2b',4,-10,2,20);for(let i=0;i<4;i++)box(c,'#8a6a45',-5,-8+i*5,10,2);}
 else if(kind==='shaft'){box(c,'#090807',-9,-9,18,18);c.strokeStyle='#8a8272';c.lineWidth=1;c.strokeRect(-9,-9,18,18);}
 else if(kind==='lift'){box(c,'#3b4a55',-10,-10,20,20);box(c,'#9fb2bd',-7,-7,14,14);c.fillStyle='#3b4a55';c.beginPath();c.moveTo(0,-5);c.lineTo(4,0);c.lineTo(-4,0);c.fill();c.beginPath();c.moveTo(0,5);c.lineTo(4,1);c.lineTo(-4,1);c.fill();}
 c.restore();
}

/** Rolltor draußen an der Burgstraße. Etappe 2 (E-70 Punkt 4, Zielbild C): der Name steht nur beim Überfahren da, das Schild
 *  „PRIVATBESITZ“ hängt neben dem Tor, und unter dem Tor flimmert ein Portal (Canvas ohne Blend-Modi; Licht und Hitzeflimmern
 *  kommen aus world-light.js/world-fx.js, Quelle „portal“). Die Garage selbst bleibt, wie sie ist (Welt-Grafik nur nach Freigabe). */
export function drawDungeonEntrance(c,door,g=null,time=0){
 if(!door)return;const x=door.x,y=door.y;box(c,'#3b3830',x-22,y-34,44,34);box(c,'#8d8778',x-19,y-31,38,31);c.fillStyle='#6f695c';for(let i=0;i<6;i++)c.fillRect(x-19,y-29+i*5,38,1);
 box(c,'#b69a6c',x-24,y-40,48,6);for(let i=0;i<5;i++)box(c,'#b69a6c',x-24+i*11,y-45,6,5);
 // Portal: Lichtspalt unter dem halb offenen Tor, darüber wirbelnde Funken (deterministisch aus der Zeit)
 c.save();const pulse=.55+.25*Math.sin(time*2.6);c.globalAlpha=pulse;box(c,'#6b3fa0',x-19,y-9,38,9);c.globalAlpha=pulse*.8;box(c,'#b58cf0',x-17,y-6,34,4);c.globalAlpha=pulse*.6;box(c,'#f0e2ff',x-14,y-4,28,1.5);
 for(let i=0;i<12;i++){const k=(time*.45+i/12)%1,a=i*2.4+time*1.3,px=x+Math.sin(a)*(9+i%4*3)*(1-k*.4),py=y-3-k*30;c.globalAlpha=(1-k)*.85;c.fillStyle=i%3?'#d9c2ff':'#fff3c4';c.fillRect(Math.round(px),Math.round(py),i%4?1.5:2,i%4?1.5:2);}
 c.restore();
 // Schild „PRIVATBESITZ“ rechts neben dem Tor auf einem Pfosten
 box(c,'#4a3a2a',x+31,y-18,2,18);box(c,'#1c1712',x+17,y-27,30,10);box(c,'#f3efe4',x+18,y-26,28,8);box(c,'#b8322c',x+18,y-26,28,1.3);box(c,'#b8322c',x+18,y-19.3,28,1.3);text(c,DU.plate,x+32,y-22,{size:3.6,color:'#1c1712',outline:null});
 // Name nur unter der Maus (oder in F-Nähe steht er ohnehin im Aktionsknopf)
 const h=g?.hover;if(h&&h.x>x-28&&h.x<x+40&&h.y>y-52&&h.y<y+6)text(c,T.entranceName,x,y-52,{size:7,color:GOLD});
}

// ── Dungeon-Karte ────────────────────────────────────────────────────────────────────────────────────────────
/** Eine Ebene auf eine Leinwand: Erkundetes als Grundriss mit Schild und Wirklichkeit, Unerkundetes als Prospekt. */
// Passt eine Beschriftung in die Raumbreite: erst kleiner, dann weglassen. Liefert die Schriftgröße oder 0.
function fitSize(c,s,maxW,size,weight='bold'){for(let n=size;n>=size*.7;n-=.5){c.font=weight+' '+n+'px Nunito, "Segoe UI", sans-serif';if(c.measureText(s).width<=maxW)return n;}return 0;}
export function drawDungeonMap(canvas,g,{floor=null,full=false}={}){
 const run=dungeonRun(g);if(!run||!canvas)return;const def=run.def,here=floorAt(def,g.player.x,g.player.y),f=floor||here||run.checkpoint.floor,fl=def.floors[f];
 // k = Bildpunkte je CSS-Pixel: Schrift und Marken bleiben auf dem Handy so groß wie am Rechner.
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=full?Math.max(1,W/Math.max(1,canvas.clientWidth||W)):1,pad=(full?16:4)*k,s=Math.min((W-pad*2)/fl.size[0],(H-pad*2-(full?18*k:0))/fl.size[1]),ox=(W-fl.size[0]*s)/2,oy=(full?18*k:0)+(H-(full?18*k:0)-fl.size[1]*s)/2;
 const R=q=>({x:ox+q[0]*s,y:oy+q[1]*s,w:q[2]*s,h:q[3]*s}),P=(x,y)=>({x:ox+x*s,y:oy+y*s}),fromWorld=pt=>({x:ox+(pt.x-fl.origin.x)/U*s,y:oy+(pt.y-fl.origin.y)/U*s});
 c.save();c.clearRect(0,0,W,H);box(c,'#1b2f25',0,0,W,H);
 const size=(full?13:7)*k,small=(full?11:6)*k;
 for(const room of def.rooms.filter(r=>r.floor===f)){
  const seen=run.visited.has(room.id);if(room.secret&&!seen)continue;
  for(const q of room.rects){const r=R(q);if(seen){box(c,'#d9b98a',r.x,r.y,r.w,r.h);c.strokeStyle='#eed9b5';c.lineWidth=1.5*k;c.setLineDash([]);c.strokeRect(r.x,r.y,r.w,r.h);}
   else{c.fillStyle='#8a735533';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='#c9a86a';c.lineWidth=k;c.setLineDash([4*k,3*k]);c.strokeRect(r.x,r.y,r.w,r.h);c.setLineDash([]);}}
  if(full||seen){const r=R(room.rects.reduce((a,b)=>a[2]*a[3]>=b[2]*b[3]?a:b)),cx=r.x+r.w/2,cy=r.y+r.h/2,room2=r.h>size*2.6,maxW=Math.max(r.w-4*k,40*k);
   if(seen){const n=fitSize(c,room.sign,maxW,size);if(n)text(c,room.sign,cx,cy-(full&&room2?n*.55:0),{size:n,color:INK,outline:null});
    if(full&&room2){const m=fitSize(c,room.truth,maxW,small,'normal');if(m)text(c,room.truth,cx,cy+m*.75,{size:m,weight:'normal',color:'#5b4a35',outline:null});}}
   else if(full){const label=T.map.prospect+': '+room.prospect,m=fitSize(c,label,maxW,small,'normal')||fitSize(c,room.prospect,maxW,small,'normal');if(m)text(c,c.measureText(label).width<=maxW?label:room.prospect,cx,cy,{size:m,weight:'normal',color:'#e0c48e',outline:'#1b2f25'});}}
 }
 for(const d of def.doors.filter(d=>d.floor===f&&d.lock?.seals)){const r=R(d.rect);box(c,STAMP,r.x,r.y,r.w,r.h);if(full)text(c,T.map.seals+' '+run.seals.size+'/'+d.lock.seals.length,r.x+r.w/2,r.y-9*k,{size:small,color:CREAM});}
 const m4=4*k;
 for(const t of def.transitions)for(const side of ['a','b']){const e=t[side];if(e.floor!==f)continue;if(t.secret&&!run.secrets.has(t.secret))continue;const room=def.rooms.find(r=>r.floor===f&&r.rects.some(q=>e.x>=q[0]&&e.x<=q[0]+q[2]&&e.y>=q[1]&&e.y<=q[1]+q[3]));if(room&&!run.visited.has(room.id))continue;const p=P(e.x,e.y);box(c,'#78a865',p.x-m4,p.y-m4,m4*2,m4*2);c.strokeStyle=INK;c.lineWidth=k;c.strokeRect(p.x-m4,p.y-m4,m4*2,m4*2);}
 for(const room of def.rooms.filter(r=>r.floor===f&&r.checkpoint&&run.visited.has(r.id))){const p=P(room.checkpoint.x,room.checkpoint.y);c.fillStyle='#78a865';c.beginPath();c.moveTo(p.x-2*k,p.y+6*k);c.lineTo(p.x-2*k,p.y-6*k);c.lineTo(p.x+6*k,p.y-3*k);c.lineTo(p.x-2*k,p.y);c.fill();}
 for(const b of def.bosses){const room=def.rooms.find(r=>r.id===b.room);if(room.floor!==f||!run.visited.has(room.id)||!DUNGEON_BOSSES[b.id])continue;const p=P(...b.at),dead=run.killed.has(b.id),rr=(full?7:4)*k;c.fillStyle=dead?'#8f8a80':GOLD;c.beginPath();c.arc(p.x,p.y,rr,0,Math.PI*2);c.fill();c.strokeStyle=INK;c.lineWidth=1.5*k;c.stroke();if(dead){const x=rr*.7;c.beginPath();c.moveTo(p.x-x,p.y-x);c.lineTo(p.x+x,p.y+x);c.moveTo(p.x+x,p.y-x);c.lineTo(p.x-x,p.y+x);c.stroke();}}
 if(here===f){const p=fromWorld(g.player);c.fillStyle='#fff7d1';c.strokeStyle=INK;c.lineWidth=1.5*k;c.beginPath();c.arc(p.x,p.y,(full?5:3)*k,0,Math.PI*2);c.fill();c.stroke();
  for(const o of g.companions||[]){if(o.state==='down')continue;const q=fromWorld(o);c.fillStyle='#9ed17a';c.beginPath();c.arc(q.x,q.y,(full?3.5:2)*k,0,Math.PI*2);c.fill();}}
 if(full)text(c,fl.name,pad,10*k,{size:14*k,color:CREAM,align:'left'});
 c.restore();
}
