// Zeichnung des begehbaren Hauses (E-52). Platzhalter aus Formen, bis die gemalten Ebenen (Außen mit Dach,
// Innen mit geschnittenen Wänden) geliefert sind – das Spiel darf ohne Bild nicht kaputtgehen.
// Schräge Draufsicht wie überall: Boden 1:1, Höhen nach oben (y - Höhe).
const INK='#293b44';
const FLOOR={
 dielen:{base:'#8a5a34',line:'#6d4527',step:7,dir:'h'},
 teppich:{base:'#6f302d',line:'#a8793f',border:true},
 estrich:{base:'#8d8a84',line:'#7a7771',step:14,dir:'grid'},
 fliesen:{base:'#cfd3cf',line:'#a9aea9',step:9,dir:'grid'},
 hof:{base:'#9c8a6a',line:'#877655',step:11,dir:'dots'}
};
const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};

function paintFloor(c,kind,q){
 const f=FLOOR[kind]||FLOOR.estrich;fill(c,f.base,q.x,q.y,q.w,q.h);
 c.fillStyle=f.line;
 if(f.dir==='h')for(let y=q.y+f.step;y<q.y+q.h;y+=f.step){c.fillRect(q.x,y,q.w,1);for(let x=q.x+((y/f.step|0)%2?11:27);x<q.x+q.w;x+=34)c.fillRect(x,y-f.step+1,1,f.step-1);}
 else if(f.dir==='grid'){for(let y=q.y+f.step;y<q.y+q.h;y+=f.step)c.fillRect(q.x,y,q.w,1);for(let x=q.x+f.step;x<q.x+q.w;x+=f.step)c.fillRect(x,q.y,1,q.h);}
 else if(f.dir==='dots')for(let y=q.y+4;y<q.y+q.h;y+=f.step)for(let x=q.x+((y/f.step|0)%2?3:8);x<q.x+q.w;x+=f.step)c.fillRect(x,y,2,1);
 if(f.border){c.strokeStyle=f.line;c.lineWidth=2;c.strokeRect(q.x+10,q.y+10,q.w-20,q.h-20);}
}

/** Böden aller Innenräume; `alpha` folgt dem Ausblenden des Dachs. Der Hof liegt draußen und wird immer gezeichnet. */
export function drawHouseFloor(c,house,alpha){
 for(const room of house.rooms){
  const a=room.outdoor?1:alpha;if(a<=0)continue;
  c.globalAlpha=a;for(const q of room.rects)paintFloor(c,room.floor,q);
 }
 c.globalAlpha=1;
}

/** Eine auf Hüfthöhe geschnittene Wand (Oberseite hell, Vorderseite dunkler), tiefensortiert an ihrer Südkante. */
export function drawHouseWall(c,wall,house,alpha){
 if(alpha<=0)return;const h=house.heights.cut,w=wall.maxX-wall.minX,d=wall.maxY-wall.minY;
 c.globalAlpha=alpha;
 fill(c,INK,wall.minX-1,wall.minY-h-1,w+2,d+h+2);
 fill(c,wall.kind==='outer'?'#b9a27a':'#cdbb92',wall.minX,wall.maxY-h,w,h);
 fill(c,wall.kind==='outer'?'#e4d6b2':'#efe3c4',wall.minX,wall.minY-h,w,d);
 fill(c,'#8f7a57',wall.minX,wall.maxY-2,w,2);
 c.globalAlpha=1;
}

/** Außenansicht: Fassade mit zwei Geschossen und Satteldach, halb abgedeckt (Plane, freie Sparren). */
export function drawHouseExterior(c,house,alpha,door){
 if(alpha<=0)return;
 const {minX:x0,maxX:x1,minY:y0,maxY:y1}=house,W=x1-x0,H=house.heights.wall,R=house.heights.roof;
 const eaveF=y1-H,eaveB=y0-H,ridge=(y0+y1)/2-H-R;
 c.globalAlpha=alpha;
 // Dach: hintere Fläche, vordere Fläche
 c.fillStyle=INK;c.beginPath();c.moveTo(x0-8,eaveB-2);c.lineTo(x1+8,eaveB-2);c.lineTo(x1+8,eaveF+4);c.lineTo(x0-8,eaveF+4);c.closePath();c.fill();
 fill(c,'#3e4953',x0-6,eaveB,W+12,ridge-eaveB);
 fill(c,'#566571',x0-6,ridge,W+12,eaveF-ridge+2);
 c.fillStyle='#48545f';for(let y=ridge+6;y<eaveF;y+=7)c.fillRect(x0-6,y,W+12,1);
 for(let y=ridge+6,row=0;y<eaveF;y+=7,row++)for(let x=x0-6+(row%2?5:0);x<x1+6;x+=11)c.fillRect(x,y-6,1,6);
 fill(c,'#2f3942',x0-6,ridge-2,W+12,4);
 // abgedeckter Teil: Sparren und Plane
 const hx=x0+W*.46,hw=W*.3;fill(c,'#3a2a1d',hx,ridge+3,hw,(eaveF-ridge)*.62);
 c.fillStyle='#8b6440';for(let x=hx+4;x<hx+hw;x+=12)c.fillRect(x,ridge+3,3,(eaveF-ridge)*.62);for(let y=ridge+14;y<ridge+(eaveF-ridge)*.62;y+=16)c.fillRect(hx,y,hw,2);
 c.fillStyle='#3f6fb0';c.beginPath();c.moveTo(hx+hw*.45,ridge+2);c.lineTo(hx+hw+18,ridge+4);c.lineTo(hx+hw+10,eaveF-20);c.lineTo(hx+hw*.55,eaveF-34);c.closePath();c.fill();
 c.fillStyle='#5c8fd0';c.fillRect(hx+hw*.6,ridge+10,hw*.4,2);
 fill(c,'#8b8577',x1-44,eaveB-20,14,ridge-eaveB+20);fill(c,'#6f6a5f',x1-44,eaveB-20,14,3);
 // Fassade: Putz, Fachwerk, Sockel
 fill(c,INK,x0-1,eaveF-1,W+2,H+2);fill(c,'#e8d3a0',x0,eaveF,W,H);
 c.fillStyle='#5a3b26';c.fillRect(x0,eaveF,W,3);c.fillRect(x0,y1-H/2-1,W,3);for(let x=x0;x<=x1;x+=W/8)c.fillRect(Math.min(x,x1-3),eaveF,3,H);
 fill(c,'#8b8577',x0,y1-9,W,9);c.fillStyle='#6f6a5f';for(let x=x0+6;x<x1;x+=12)c.fillRect(x,y1-9,1,9);
 // Fenster in zwei Reihen, Tür am Eingang
 const win=(x,y)=>{fill(c,INK,x-1,y-1,15,17);fill(c,'#2f5f63',x,y,13,15);fill(c,'#7fb4ad',x+1,y+1,5,6);fill(c,'#e8d3a0',x+6,y,1,15);fill(c,'#e8d3a0',x,y+7,13,1);fill(c,'#6f3c2c',x-4,y+14,21,3);};
 for(let i=0;i<7;i++){const x=x0+14+i*W/7;if(door&&Math.abs(x+6-door.x)<24)continue;win(x,y1-H+10);win(x,y1-H/2+8);}
 if(door){fill(c,INK,door.x-14,y1-31,28,31);fill(c,'#6b4a2f',door.x-12,y1-29,24,29);fill(c,'#4e3522',door.x-1,y1-29,2,29);fill(c,'#e0b45c',door.x+6,y1-15,2,2);fill(c,'#8b8577',door.x-16,y1-2,32,2);}
 c.globalAlpha=1;
}
