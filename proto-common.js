// Renderer-Prototypen (Vergleich A–D): gemeinsames Grundgerüst. Alle vier Seiten fahren dieselbe echte Welt und dieselbe echte Engine;
// nur die Darstellung unterscheidet sich. Kein Teil des Spiels – reine Entscheidungsgrundlage (docs/RENDERER-PROTOTYPEN-2026-09-21.md).
import {World} from './world.js';
import {Game} from './engine.js';

export const $=id=>document.getElementById(id);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export async function bootGame(){
 const data=await (await fetch('data/mertloch.json')).json();
 const world=new World(data),game=new Game(world,{classId:'baerbel',version:1});
 return {world,game};
}

/** Tastatur wie im Spiel: WASD/Pfeile landen in game.keys. `remap` erlaubt kamerabezogene Steuerung (Prototyp D). */
export function bindKeys(game,remap=null){
 const held=new Set(),MOVE=['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'];
 const sync=()=>{for(const k of MOVE)game.keys.delete(k);for(const k of (remap?remap(held):held))game.keys.add(k);};
 addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(MOVE.includes(k)){held.add(k);sync();e.preventDefault();}});
 addEventListener('keyup',e=>{held.delete(e.key.toLowerCase());sync();});
 addEventListener('blur',()=>{held.clear();sync();});
 return {held,sync};
}

/** Orte zum Springen, damit man Dorf, Lager und Gegner ohne Fußmarsch vergleichen kann. */
export function places(world,game){
 const camp=world.camps?.[0];
 return [{id:'dorf',label:'Dorfplatz',x:world.spawn.x,y:world.spawn.y},...(camp?[{id:'lager',label:'Grillplatz-Lager',x:(camp.approach||camp).x,y:(camp.approach||camp).y}]:[])];
}
export function jump(game,place){game.player.x=place.x;game.player.y=place.y;game.keys.clear();}

/** Lichtquellen der Welt: Laternen, Haustüren (Fensterlicht), Lagerfeuer, dazu die Handlaterne der Heldin. */
export function lightSources(world){
 const out=[];
 for(const p of world.props)if(p.type==='lantern')out.push({x:p.x,y:p.y-14,r:150,color:[1,.78,.42],fire:false});
 for(const c of world.camps||[])out.push({x:c.x,y:c.y,r:210,color:[1,.55,.2],fire:true});
 for(const b of world.buildings)if(b.door&&Number.isFinite(b.door.x))out.push({x:b.door.x,y:b.door.y-6,r:95,color:[1,.72,.38],fire:false});
 return out;
}
export function nearestLights(lights,cx,cy,max,player){
 const near=lights.map(l=>({l,d:(l.x-cx)**2+(l.y-cy)**2})).sort((a,b)=>a.d-b.d).slice(0,max-1).map(e=>e.l);
 if(player)near.unshift({x:player.x,y:player.y-10,r:120,color:[1,.8,.55],fire:false});
 return near;
}

/** Bedienfeld aus einer Beschreibung. Rückgabe: Zustandsobjekt, das die Seite jedes Bild liest. */
export function panel(host,spec,onChange=()=>{}){
 const state={};
 for(const s of spec){
  if(s.type==='head'){const h=document.createElement('h3');h.textContent=s.label;host.append(h);continue;}
  if(s.type==='note'){const n=document.createElement('p');n.className='note';n.textContent=s.label;host.append(n);continue;}
  const row=document.createElement('label');row.className='row'+(s.disabled?' off':'');state[s.id]=s.value;
  if(s.type==='check'){row.innerHTML=`<input type="checkbox" ${s.value?'checked':''} ${s.disabled?'disabled':''}><span>${s.label}</span>`;row.firstChild.onchange=e=>{state[s.id]=e.target.checked;onChange(s.id);};}
  else if(s.type==='range'){row.innerHTML=`<span>${s.label}</span><input type="range" min="${s.min}" max="${s.max}" step="${s.step||.01}" value="${s.value}">`;row.lastChild.oninput=e=>{state[s.id]=Number(e.target.value);onChange(s.id);};}
  else if(s.type==='button'){row.className='row';row.innerHTML=`<button type="button">${s.label}</button>`;row.firstChild.onclick=()=>onChange(s.id);}
  if(s.hint){const h=document.createElement('small');h.textContent=s.hint;row.append(h);}
  host.append(row);
 }
 return state;
}

/** Bildrate und reine Zeichenzeit (CPU) – der ehrliche Vergleichswert zwischen den Varianten. */
export function meter(el){
 let frames=0,last=performance.now(),cpu=0,fps=0,ms=0;
 return {begin(){this.t=performance.now();},end(extra=''){cpu+=performance.now()-this.t;frames++;const now=performance.now();if(now-last>=500){fps=frames*1000/(now-last);ms=cpu/frames;frames=0;cpu=0;last=now;el.textContent=`${fps.toFixed(0)} Bilder/s · ${ms.toFixed(1)} ms Zeichenzeit${extra?' · '+extra:''}`;}},get fps(){return fps;},get ms(){return ms;}};
}

/** Druckwellen (Klick in die Welt): Weltposition + Alter. Jede Variante stellt sie auf ihre Art dar. */
export class Shockwaves{constructor(){this.list=[];}add(x,y){this.list.push({x,y,age:0});if(this.list.length>4)this.list.shift();}tick(dt){for(const s of this.list)s.age+=dt;this.list=this.list.filter(s=>s.age<1.1);}}
