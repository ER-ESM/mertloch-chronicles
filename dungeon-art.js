// Zeichnen des Dungeons (Plan Abschnitte 5 und 14): Boden, Wände, Türen, Übergänge, Schilder und Warnflächen in der Welt,
// dazu die Dungeon-Karte (Prospekt gegen Wirklichkeit). Grundriss aus content/dungeons.js, Zustand aus dungeon.js.
import {DUNGEON_TEXT as T,DUNGEON_BOSSES,DUNGEON_SCALE as U,DUNGEON_UI as DU} from './content/index.js';
import {dungeonRun,floorAt,rectWorld,toWorld,doorOpen,coneReach,CONE_RAYS,fallActive,speakerPoint} from './dungeon.js';
import {drawConeHazard} from './hazard-art.js';

const THEMES={
 garage:{void:'#15130f',floor:'#8d8778',tile:'#7d776a',wall:'#3b3830',trim:'#c9c2ad'},
 partykeller:{void:'#140f0c',floor:'#a9794f',tile:'#94673f',wall:'#3a2618',trim:'#efe2c8'},
 basalt:{void:'#0d0f10',floor:'#4d5156',tile:'#3e4247',wall:'#1d2023',trim:'#8b9096'}
};
const INK='#2b2118',GOLD='#ecb95c',STAMP='#ad5260',CREAM='#f3e6cc';

/** Prüfzugang (scripts/dungeon-e2-check.mjs): Schriftzüge, die drawDungeonGround im letzten Bild in die Welt geschrieben hat. */
export const dungeonTextStats={ground:0,last:[]};let groundTexts=null;
function text(c,s,x,y,{size=8,color=CREAM,weight='bold',align='center',outline='#1b140e'}={}){
 if(groundTexts)groundTexts.push(s);c.save();c.font=weight+' '+size+'px Nunito, "Segoe UI", sans-serif';c.textAlign=align;c.textBaseline='middle';
 if(outline){c.lineWidth=2.5;c.strokeStyle=outline;c.strokeText(s,x,y);}c.fillStyle=color;c.fillText(s,x,y);c.restore();
}
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};

/** Boden, Wände, Türen und Übergänge der aktuellen Ebene; darüber zeichnet der Renderer Figuren und Effekte.
 *  Etappe 2 Text-Diät (E-70 Punkt 4, Grafik-Review Dungeon Befunde 2, 10, 11): keine Dauerschrift mehr in der Welt. Räume tragen eine
 *  Messingplakette, Schild und Wirklichkeit stehen nur beim Überfahren da (beim Betreten zeigt sie der Zonentitel). Übergänge und das
 *  Rolltor sind Symbole mit goldenem Pfeil, ihr Name steht nur unter der Maus. Geheime Räume sind von außen Dach bzw. Fels; die Pappwand
 *  steht als Wand, die Tresortür ist Stahl mit drei Siegelfeldern nebeneinander. Durchsagen kommen aus Lautsprechern an der Wand. */
export function drawDungeonGround(c,g,view){
 const run=dungeonRun(g);if(!run)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,theme=THEMES[def.floors[floor].theme]||THEMES.basalt;
 groundTexts=[];try{groundBody(c,g,view,run,def,floor,theme);}finally{dungeonTextStats.ground=groundTexts.length;dungeonTextStats.last=groundTexts;groundTexts=null;}
}
function groundBody(c,g,view,run,def,floor,theme){
 box(c,theme.void,view.ox-2,view.oy-2,view.W+4,view.H+4);
 const all=def.rooms.filter(r=>r.floor===floor),hidden=r=>r.secret&&!run.visited.has(r.id),rooms=all.filter(r=>!hidden(r)),doors=def.doors.filter(d=>d.floor===floor),hover=g.hover,time=g.time||0;
 const near=(p,r)=>hover&&Math.hypot(hover.x-p.x,hover.y-p.y)<=r;
 // Verborgen: Carport-Dach bzw. Fels, ohne Schrift und ohne die Gegner darauf (renderer.js blendet sie aus)
 for(const room of all.filter(hidden))for(const q of room.rects){const r=rectWorld(def,floor,q);drawCover(c,r,theme);}
 // Böden mit Fugen
 for(const room of rooms)for(const q of room.rects){const r=rectWorld(def,floor,q);box(c,theme.floor,r.x,r.y,r.w,r.h);c.fillStyle=theme.tile;
  for(let x=r.x+16;x<r.x+r.w;x+=16)c.fillRect(Math.round(x),r.y,1,r.h);for(let y=r.y+16;y<r.y+r.h;y+=16)c.fillRect(r.x,Math.round(y),r.w,1);}
 // Wände als Kante, offene Türen schneiden sie wieder auf
 c.save();c.strokeStyle=theme.wall;c.lineWidth=5;for(const room of rooms)for(const q of room.rects){const r=rectWorld(def,floor,q);c.strokeRect(r.x-2,r.y-2,r.w+4,r.h+4);}c.restore();
 for(const d of doors){const r=rectWorld(def,floor,d.rect),open=doorOpen(run,d);
  if(open){box(c,theme.floor,r.x,r.y,r.w,r.h);continue;}
  if(d.lock?.seals){drawVault(c,r,d.lock.seals.map(s=>run.seals.has(s)));continue;}
  box(c,'#2a1f18',r.x,r.y,r.w,r.h);c.strokeStyle=d.arena?'#e18569':'#8a6a4a';c.lineWidth=2;const vertical=r.h>r.w;c.beginPath();
  for(let i=1;i<4;i++){if(vertical){c.moveTo(r.x,r.y+r.h*i/4);c.lineTo(r.x+r.w,r.y+r.h*i/4);}else{c.moveTo(r.x+r.w*i/4,r.y);c.lineTo(r.x+r.w*i/4,r.y+r.h);}}c.stroke();
  if(d.arena){/* Absperrband quer über die Arena-Tür */c.save();c.strokeStyle='#f3c44e';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();if(vertical){c.moveTo(r.x-2,r.y+2);c.lineTo(r.x+r.w+2,r.y+r.h-2);}else{c.moveTo(r.x+2,r.y-2);c.lineTo(r.x+r.w-2,r.y+r.h+2);}c.stroke();c.restore();}}
 // Ausstattung je Ebene: Pappzinnen im Hof, Porträts in der Galerie, Fassrinnen in der Kelterhalle
 if(floor==='e0'){const r=rectWorld(def,floor,def.rooms.find(x=>x.id==='hof').rects[0]);for(let x=r.x+6;x<r.x+r.w-8;x+=22){box(c,'#b69a6c',x,r.y+2,12,6);box(c,'#8a7250',x,r.y+2,12,1);}}
 if(floor==='k1'){const g0=def.rooms.find(x=>x.id==='galerie'),top=rectWorld(def,floor,g0.rects[0]);for(let i=0;i<12;i++){const x=top.x+24+i*(top.w-48)/11;box(c,'#6b4a2b',x-5,top.y+2,10,8);box(c,'#d8c49c',x-3,top.y+4,6,4);}}
 if(floor==='k2'){const k=def.rooms.find(x=>x.id==='kelterhalle'),r=rectWorld(def,floor,k.rects[0]);c.save();c.strokeStyle='#2c2f33';c.lineWidth=3;for(const f of [.2,.5,.8]){c.beginPath();c.moveTo(r.x+4,r.y+r.h*f);c.lineTo(r.x+r.w-4,r.y+r.h*f);c.stroke();}c.restore();}
 // Messingplaketten an der Nordwand, Schild und Wirklichkeit nur unter der Maus
 for(const room of rooms){const r=rectWorld(def,floor,room.rects[0]);box(c,'#1c1712',r.x+r.w/2-7,r.y+1,14,6);box(c,run.room===room.id?'#e6c46a':'#b8913f',r.x+r.w/2-6,r.y+2,12,4);}
 // Lautsprecher an den Durchsage-Punkten (die Sprechblase hängt an ihnen)
 for(const a of def.announcements){const p=speakerPoint(def,a);if(!p||p.floor!==floor)continue;drawSpeaker(c,p,run.speaking?.id===a.id&&time<run.speaking.until,time);}
 // Übergänge und Geheimnisse: Symbol mit goldenem Pfeil, Name unter der Maus
 for(const t of def.transitions)for(const side of ['a','b']){const s=t[side];if(s.floor!==floor)continue;const p=toWorld(def,floor,s.x,s.y);const room=all.find(r=>r.rects.some(q=>s.x>=q[0]&&s.x<=q[0]+q[2]&&s.y>=q[1]&&s.y<=q[1]+q[3]));if(room&&hidden(room))continue;
  if(t.secret){drawPappwand(c,p,run.secrets.has(t.secret));if(!run.secrets.has(t.secret))continue;}
  if(t.oneWay&&t.oneWay!==side)continue;drawStep(c,t.kind,p);const to=t[side==='a'?'b':'a'],up=t.kind==='ladder'?side==='a':floorIndex(to.floor)<floorIndex(floor);stepArrow(c,p.x+11,p.y-11,up);
  if(near(p,16))text(c,stepLabel(t,side),p.x,p.y+17,{size:6,color:'#e8dcc0'});}
 // Ausgang (Rolltor): Symbol mit Pfeil nach draußen, Name unter der Maus
 if(def.exit.floor===floor){const p=toWorld(def,floor,def.exit.x,def.exit.y);box(c,'#1c1712',p.x-19,p.y+2,38,9);box(c,'#8d8778',p.x-18,p.y+3,36,7);c.fillStyle='#6f695c';for(let i=0;i<3;i++)c.fillRect(p.x-18,p.y+4+i*2,36,1);stepArrow(c,p.x,p.y+18,false);if(near(p,22))text(c,T.leave,p.x,p.y+28,{size:6,color:GOLD});}
 // Raumname nur unter der Maus (Schild groß, Wirklichkeit klein)
 if(hover){const room=rooms.find(r=>r.rects.some(q=>{const b=rectWorld(def,floor,q);return hover.x>=b.x&&hover.x<=b.x+b.w&&hover.y>=b.y&&hover.y<=b.y+b.h;}));if(room){const r=rectWorld(def,floor,room.rects[0]);text(c,room.sign,r.x+r.w/2,r.y+14,{size:8,color:GOLD});text(c,room.truth,r.x+r.w/2,r.y+24,{size:6,weight:'normal',color:'#d8ccb0'});}}
 // Warnflächen der Kegel, Schildwall
 for(const e of g.enemies){if(e.hp<=0)continue;const k=e.cast;
  /* Etappe 2: derselbe Baustein wie der Bodenkreis (Randmarken, wachsende Füllung, Aufblitzen), dazu Rückstoß-Pfeile und Schild */
  if(k?.cone)drawConeHazard(c,e,k,1-k.remaining/k.total,g.time,{reach:coneReach(g.world,e,k),rays:CONE_RAYS});
  if(e.dungeonBoss)drawFallEdge(c,g,run,floor,e);
  if(e.frontGuard>0){const a=e.frontAngle??0;c.save();c.strokeStyle='#e8dcc0';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y-10,22,a-Math.PI/3,a+Math.PI/3);c.stroke();c.restore();}}
}
/** Treppenkante (E-71): erst ab Phase 2 gefährlich – dann liegt eine gestrichelte Warnlinie auf der Kante. */
function drawFallEdge(c,g,run,floor,e){
 {const fall=DUNGEON_BOSSES[e.bossId]?.fall;if(!fall||!(e.hp>0)||!e.aggro||!fallActive(e,fall))return;const room=run.def.rooms.find(r=>r.id===e.dungeonBoss?.room);if(!room||room.floor!==floor)return;
  const r=rectWorld(run.def,floor,fall.rect),pulse=.55+.45*Math.sin(g.time*6);c.save();c.fillStyle='rgba(226,67,47,'+(.12+.1*pulse).toFixed(3)+')';c.fillRect(r.x,r.y,r.w,r.h);
  c.strokeStyle='#ff5a3c';c.lineWidth=2.5;c.setLineDash([7,5]);c.lineDashOffset=-g.time*12;c.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);c.restore();}
}
const floorIndex=f=>['e0','k1','k2'].indexOf(f);
function stepLabel(t,side){const to=t[side==='a'?'b':'a'];return T.step[t.kind]+(t.kind==='ladder'?'':' · '+T.floorTo[to.floor]);}
function drawSpeaker(c,p,active,time){box(c,'#1c1712',p.x-4,p.y-3,8,7);box(c,'#6d737c',p.x-3,p.y-2,6,5);c.fillStyle='#1c1712';c.beginPath();c.moveTo(p.x+3,p.y-3);c.lineTo(p.x+8,p.y-6);c.lineTo(p.x+8,p.y+7);c.lineTo(p.x+3,p.y+4);c.closePath();c.fill();c.fillStyle='#9aa1aa';c.beginPath();c.moveTo(p.x+3,p.y-2);c.lineTo(p.x+7,p.y-4);c.lineTo(p.x+7,p.y+5);c.lineTo(p.x+3,p.y+3);c.closePath();c.fill();
 if(active){c.save();c.strokeStyle='#f3e6cc';c.lineWidth=1;for(let i=0;i<2;i++){const k=(time*2+i*.5)%1;c.globalAlpha=1-k;c.beginPath();c.arc(p.x+8,p.y+.5,3+k*7,-.8,.8);c.stroke();}c.restore();}}
/** Verborgener Raum: von oben Dach (Erdgeschoss, Wellblech) bzw. Fels (Keller). */
function drawCover(c,r,theme){if(theme===THEMES.garage){box(c,'#3a3d40',r.x,r.y,r.w,r.h);c.fillStyle='#4a4e52';for(let x=r.x;x<r.x+r.w;x+=6)c.fillRect(Math.round(x),r.y,2,r.h);box(c,'#26282a',r.x,r.y+r.h-3,r.w,3);}
 else{box(c,shade(theme.void,10),r.x,r.y,r.w,r.h);c.fillStyle=shade(theme.void,18);for(let i=0;i<r.w*r.h/900;i++){const x=r.x+((i*97.3)%r.w),y=r.y+((i*53.9)%r.h);c.fillRect(Math.round(x),Math.round(y),3,2);}}}
const shade=(hex,d)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+d)).toString(16).padStart(2,'0')).join('');
/** Pappwand: steht als Wand im Gang (bemalte Ziegel, Klebeband); gefunden eingedrückt, zwei Pappreste liegen daneben. */
function drawPappwand(c,p,found){const x=p.x-14,y=p.y-22,w=28,h=22;
 if(!found){box(c,'#1c1712',x-1,y-1,w+2,h+2);box(c,'#b69a6c',x,y,w,h);c.fillStyle='#9c8157';for(let row=0;row<4;row++)for(let i=0;i<3;i++){const bx=x+1+i*9+(row%2?4:0);if(bx+8<=x+w)c.fillRect(bx,y+1+row*5,8,4);}box(c,'#8a7250',x,y+h-3,w,3);c.fillStyle='#e8e2c8b0';c.fillRect(x+3,y+4,9,2);c.fillRect(x+w-11,y+h-9,9,2);c.strokeStyle='#7a6444';c.lineWidth=1;c.beginPath();c.moveTo(x+w*.55,y);c.lineTo(x+w*.5,y+h);c.stroke();return;}
 c.save();c.translate(p.x-18,p.y-4);c.rotate(-.25);box(c,'#1c1712',-1,-7,21,8);box(c,'#b69a6c',0,-6,19,6);box(c,'#9c8157',2,-5,6,3);c.restore();c.save();c.translate(p.x+14,p.y-4);c.rotate(.3);box(c,'#1c1712',-1,-6,15,7);box(c,'#a88c5e',0,-5,13,5);c.restore();}
/** Tresortür: Stahl mit Rahmen, Nieten, Rad und drei Siegelfeldern nebeneinander (gefüllt: rotes Wachs mit Goldkreuz). */
function drawVault(c,r,filled){box(c,'#1c1f23',r.x-1,r.y-1,r.w+2,r.h+2);box(c,'#5d6a75',r.x,r.y,r.w,r.h);box(c,'#7d8a96',r.x+2,r.y+2,r.w-4,r.h-4);c.fillStyle='#3b4550';for(const [fx,fy] of [[.15,.1],[.85,.1],[.15,.9],[.85,.9]])c.fillRect(r.x+r.w*fx-1,r.y+r.h*fy-1,2,2);
 const cx=r.x+r.w/2,wy=r.y+r.h*.34,wr=Math.min(r.w,r.h)*.22;c.strokeStyle='#2b3138';c.lineWidth=2;c.beginPath();c.arc(cx,wy,wr,0,Math.PI*2);c.stroke();c.beginPath();for(let i=0;i<3;i++){const a=i*Math.PI/3;c.moveTo(cx-Math.cos(a)*wr,wy-Math.sin(a)*wr);c.lineTo(cx+Math.cos(a)*wr,wy+Math.sin(a)*wr);}c.stroke();
 const n=filled.length,sy=r.y+r.h*.72,step=Math.min(r.w/(n+.4),12),sr=Math.min(step*.42,5.5);for(let i=0;i<n;i++){const sx=cx+(i-(n-1)/2)*step;c.fillStyle='#1c1f23';c.beginPath();c.arc(sx,sy,sr+1,0,Math.PI*2);c.fill();c.fillStyle=filled[i]?'#b8322c':'#2f363d';c.beginPath();c.arc(sx,sy,sr,0,Math.PI*2);c.fill();if(filled[i]){c.fillStyle='#f3c44e';c.fillRect(sx-.7,sy-sr*.55,1.4,sr*1.1);c.fillRect(sx-sr*.55,sy-.7,sr*1.1,1.4);}}}
function stepArrow(c,x,y,up){c.save();c.translate(x,y);if(!up)c.scale(1,-1);c.beginPath();c.moveTo(0,-5);c.lineTo(4.5,0);c.lineTo(1.8,0);c.lineTo(1.8,4.5);c.lineTo(-1.8,4.5);c.lineTo(-1.8,0);c.lineTo(-4.5,0);c.closePath();c.lineJoin='round';c.strokeStyle='#1c1712';c.lineWidth=2;c.stroke();c.fillStyle=GOLD;c.fill();c.restore();}
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

// ── Licht im Keller (Etappe 2, Grafik-Review Dungeon Befund 4) ────────────────────────────────────────────────
// Die Außenwelt-Licht- und Effektschicht läuft im Dungeon nicht mit (renderer.js). Stattdessen je Ebene eine Stimmung:
// Garage kaltes Neon unter der Decke, Partykeller warme Lichterkette an den Wänden, Basalt dunkel-kalt mit Fackeln.
// Eine Alpha-Ebene in halber Auflösung wie world-light.js: Dunkel überdecken, Lichter stanzen aus (destination-out),
// warmer Schein obenauf; keine Blend-Modi (E-46 ff.). Nur jedes zweite Bild neu, sonst kopiert.
const MOOD={
 garage:{tint:'#0e1828',dark:.34,light:'#dff2ff',kind:'neon',radius:74,glow:.16,flicker:.03},
 partykeller:{tint:'#1c0e06',dark:.46,light:'#ffc070',kind:'bulbs',radius:44,glow:.26,flicker:.06},
 basalt:{tint:'#03070c',dark:.62,light:'#ff9a3c',kind:'torch',radius:84,glow:.3,flicker:.16}
};
const glowCache=new Map();
function glowSprite(color){let s=glowCache.get(color);if(s)return s;s=document.createElement('canvas');s.width=s.height=64;const x=s.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,color);g.addColorStop(.45,color+'aa');g.addColorStop(1,color+'00');x.fillStyle=g;x.fillRect(0,0,64,64);glowCache.set(color,s);return s;}
const lightSpots=new Map();
/** Lichtpunkte einer Ebene aus den Räumen (einmal je Ebene): Neonröhren an der Nordwand, Birnen entlang der Wände, Fackeln an den Wänden. */
function floorLights(def,floor,mood){const key=def.name+'|'+floor;let list=lightSpots.get(key);if(list)return list;list=[];
 for(const room of def.rooms.filter(r=>r.floor===floor))for(const q of room.rects){const r=rectWorld(def,floor,q),seed=(r.x*7+r.y*13)%97;
  if(mood.kind==='neon'){for(let x=r.x+48;x<r.x+r.w-24;x+=110)list.push({x,y:r.y+14,wide:2.2,seed:seed+x});}
  else if(mood.kind==='bulbs'){for(let x=r.x+16;x<r.x+r.w-8;x+=46){list.push({x,y:r.y+8,seed:seed+x});list.push({x:x+23,y:r.y+r.h-6,seed:seed+x*3});}}
  else{for(let x=r.x+40;x<r.x+r.w-20;x+=120)list.push({x,y:r.y+8,seed:seed+x});if(r.h>90)for(let y=r.y+60;y<r.y+r.h-30;y+=120){list.push({x:r.x+8,y,seed:seed+y});list.push({x:r.x+r.w-8,y,seed:seed+y*2});}}}
 lightSpots.set(key,list);return list;}
let lightLayer=null,lightFrame=0;
export const dungeonLightStats={theme:'',lights:0,frames:0};
export function drawDungeonLight(c,g,view,time){
 const run=dungeonRun(g);if(!run||typeof document==='undefined')return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,theme=def.floors[floor].theme,mood=MOOD[theme]||MOOD.basalt;
 const {ox,oy,W,H}=view,lw=Math.ceil(W/2),lh=Math.ceil(H/2);lightLayer||=document.createElement('canvas');const fresh=lightLayer.width!==lw||lightLayer.height!==lh;if(fresh){lightLayer.width=lw;lightLayer.height=lh;}
 if(fresh||++lightFrame%2===0||dungeonLightStats.theme!==theme){
  const l=lightLayer.getContext('2d');l.setTransform(.5,0,0,.5,0,0);l.globalCompositeOperation='source-over';l.globalAlpha=1;l.clearRect(0,0,W,H);l.globalAlpha=mood.dark;l.fillStyle=mood.tint;l.fillRect(0,0,W,H);
  const spots=floorLights(def,floor,mood).filter(s=>s.x>ox-120&&s.x<ox+W+120&&s.y>oy-120&&s.y<oy+H+120),sprite=glowSprite(mood.light),white=glowSprite('#ffffff');
  const flick=s=>1+mood.flicker*(Math.sin(time*9+s.seed)+Math.sin(time*5.3+s.seed*2))*.5,hero={x:g.player.x,y:g.player.y-10,seed:0,hero:true};
  l.globalCompositeOperation='destination-out';for(const s of [...spots,hero]){const r=(s.hero?78:mood.radius)*(s.hero?1:flick(s)),w=s.wide||1;l.globalAlpha=Math.min(1,mood.dark*2.4)*(s.hero?.6:1);l.drawImage(white,s.x-ox-r*w,s.y-oy-r,r*2*w,r*2);}
  l.globalCompositeOperation='source-over';for(const s of spots){const r=mood.radius*.7*flick(s),w=s.wide||1;l.globalAlpha=mood.glow*flick(s);l.drawImage(sprite,s.x-ox-r*w,s.y-oy-r,r*2*w,r*2);}
  l.globalAlpha=1;dungeonLightStats.lights=spots.length;}
 c.save();c.imageSmoothingEnabled=true;c.drawImage(lightLayer,0,0,W,H);c.restore();dungeonLightStats.theme=theme;dungeonLightStats.frames++;
}
