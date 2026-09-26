// Zeichnen für Dungeon Etappe 4 Teil B (E-71): kleine Truhen der Flügel, Beweis-Fundstellen (Pelzmantel auf dem Carport-Dach,
// Kirmes-Urkunde im Presseamt), Vermieter Volker (hinter dem Fahrradschloss, nach der Befreiung als Händler im Hof), der Beamer im
// Weinkeller mit Lichtkegel und die Abkürzung „Pappwand“. Nur Requisiten und Bodenzeichen; Volker ist eine vorhandene Katalogfigur
// als Platzhalter (keine neue Figurengrafik – die kommt erst nach Freigabe). Zustand aus dungeon.js; aufgerufen aus dungeon-bigb-art.js
// direkt nach dem Dungeon-Boden.
import {dungeonRun,floorAt,toWorld,e4bState} from './dungeon.js';
import {drawWorldPerson} from './person-art.js';
import {drawDungeonPerson} from './dungeon-figuren-art.js';
import {PERSON_SCALE} from './world-scale.js';
import {mapIcon} from './map-symbols.js';
import {DUNGEON_E4B as U} from './content/index.js';

const INK='#1c1712',GOLD='#ecb95c',CREAM='#f3e6cc';
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function label(c,text,x,y,color,size=7){c.save();c.font=`800 ${size}px Nunito,'Trebuchet MS',sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=2.4;c.strokeStyle=INK;c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore();}
function glow(c,x,y,t,r=18){const a=.28+.2*Math.sin(t*3);c.fillStyle='rgba(236,185,92,'+a.toFixed(3)+')';c.beginPath();c.ellipse(x,y+4,r,r*.4,0,0,Math.PI*2);c.fill();}

export function drawE4BGround(c,g){
 const run=dungeonRun(g);if(!run)return;const s=e4bState(g);if(!s)return;const def=run.def,floor=floorAt(def,g.player.x,g.player.y)||run.checkpoint.floor,t=g.time||0;
 for(const w of s.chests)if(w.floor===floor)drawSmallChest(c,toWorld(def,floor,w.x,w.y),w.opened,w.ready,t);
 for(const f of s.finds)if(f.floor===floor&&!f.taken)drawFind(c,f.kind,toWorld(def,floor,f.x,f.y),f.ready,t);
 for(const ev of s.events)if(ev.floor===floor){const p=toWorld(def,floor,ev.x,ev.y);if(ev.id==='volker'&&!ev.done)drawVolkerLocked(c,p,ev.ready,t);if(ev.id==='beamer')drawBeamer(c,p,!ev.done,t);}
 if(s.vendor&&s.vendor.floor===floor){const p=toWorld(def,floor,s.vendor.x,s.vendor.y);if(!drawDungeonPerson(c,'volker',p.x,p.y,t,{facing:1}))drawWorldPerson(c,U.vendor.look,p.x,p.y,t,PERSON_SCALE,{facing:1});label(c,U.vendor.name,p.x,p.y-65,'#f1d18b',8);const img=mapIcon('trade',11);if(img)c.drawImage(img,Math.round(p.x-5.5),Math.round(p.y-58),11,11);}
}
/** Kleine Truhe am Ende eines Flügels: glimmt, sobald der Siegelträger liegt; offen nach dem Öffnen. */
function drawSmallChest(c,p,opened,ready,t){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));if(ready&&!opened)glow(c,0,0,t,14);
 box(c,INK,-9,-6,18,11);box(c,'#6b4a2f',-8,-5,16,9);box(c,'#8a6340',-8,-5,16,2);box(c,GOLD,-8,0,16,1.5);box(c,GOLD,-1.5,-2,3,4);
 if(opened){box(c,INK,-9,-13,18,7);box(c,'#6b4a2f',-8,-12,16,5);}else{box(c,INK,-9,-9,18,4);box(c,'#7b5636',-8,-8,16,2);}
 c.restore();
}
/** Fundstelle eines Beweises: Pelzmantel (Leihschein in der Tasche) bzw. gerahmte Urkunde auf dem Tisch; glimmt, wenn aufnehmbar. */
function drawFind(c,kind,p,ready,t){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));if(ready)glow(c,0,0,t,13);
 if(kind==='coat'){c.fillStyle=INK;c.beginPath();c.ellipse(0,-2,11,6,0,0,Math.PI*2);c.fill();c.fillStyle='#8a5a36';c.beginPath();c.ellipse(0,-2,10,5,0,0,Math.PI*2);c.fill();c.fillStyle='#d9c3a0';c.beginPath();c.ellipse(-4,-4,5,3,-.3,0,Math.PI*2);c.fill();box(c,CREAM,3,-4,5,3);}
 else{box(c,INK,-10,-9,20,12);box(c,'#6b4a2f',-9,-8,18,10);box(c,CREAM,-7,-6,14,6);box(c,'#b8322c',3,-3,3,3);}
 c.restore();
}
/** Waschküchentür mit Fahrradschloss, dahinter Volker (Platzhalterfigur). ready = Wachen liegen. */
function drawVolkerLocked(c,p,ready,t){
 if(!drawDungeonPerson(c,'volker',p.x,p.y,t,{facing:1}))drawWorldPerson(c,U.vendor.look,p.x,p.y,t,PERSON_SCALE,{facing:1});// Figur erst nach Freigabe (Schalter)
 c.save();c.translate(Math.round(p.x+12),Math.round(p.y-10));if(ready)glow(c,0,6,t,10);c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.arc(0,-3,4,Math.PI,0);c.stroke();c.strokeStyle='#d0d6dc';c.lineWidth=1.6;c.stroke();box(c,INK,-5,-3,10,8);box(c,'#b8322c',-4,-2,8,6);c.restore();
}
/** Beamer auf Bierkiste: läuft er, fällt ein flackernder Lichtkegel nach Osten (dort spukt das Gespenst); ausgesteckt ist er dunkel. */
function drawBeamer(c,p,on,t){
 c.save();c.translate(Math.round(p.x),Math.round(p.y));
 if(on){const a=.16+.06*Math.sin(t*17)+.04*Math.sin(t*5.3);const g=c.createLinearGradient(6,0,70,0);g.addColorStop(0,'rgba(220,235,255,'+(a*2).toFixed(3)+')');g.addColorStop(1,'rgba(220,235,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(6,-12);c.lineTo(70,-26);c.lineTo(70,6);c.closePath();c.fill();}
 box(c,INK,-10,-4,20,10);box(c,'#3f6e2c',-9,-3,18,8);for(const x of [-6,-1,4])box(c,'#2a4a1d',x,-2,3,6);
 box(c,INK,-7,-11,14,8);box(c,'#4a4f58',-6,-10,12,6);c.fillStyle=on?'#dceaff':'#2a2d33';c.beginPath();c.arc(5,-7,2.2,0,Math.PI*2);c.fill();
 c.restore();
}
