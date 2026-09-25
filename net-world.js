// Geteilte Welt, Client-Seite (E-35): gleicht die Lagergegner des lokalen Spiels mit dem Server ab.
// Der Kampf rechnet lokal; gemeldet wird nur, was ICH einem Gegner abgezogen habe. Der Server führt den gemeinsamen
// Wert, bestimmt das Ziel (höchste Bedrohung) und meldet Tod, Rücksetzen und Wiederkehr (server/game/shared-world.mjs).
// Ohne Browser-APIs: game(), me(), send(), others() kommen von außen (Tests mit Attrappen).

import {SPECS} from './content/index.js';
/** Schutz-Specs (Türsteher, Schrottkoloss, E-71 Räuchermeister) ziehen dreifache Bedrohung: sie sollen das Ziel halten können. */
export const TANK_SPECS=Object.keys(SPECS).filter(s=>SPECS[s].role==='Tank');

/** options: {game:()=>Game, me:()=>Spielername, send:(msg)=>void, others:()=>[{name,x,y}]} */
export function createNetWorld({game,me,send,others}){
 const known=new Map();let wasDead=false,world=null;
 const entry=e=>{let k=known.get(e.netId);if(!k){k={hp:e.hp,engaged:false,target:null};known.set(e.netId,k);}return k;};
 const threatFactor=g=>TANK_SPECS.includes(g.rpg?.talents?.spec)?3:1;
 function reset(){known.clear();wasDead=false;}

 /** 10×/s: eigenen Schaden melden, Ablassen melden, Gegner fremder Ziele hinter ihrem Ziel herführen */
 function tick(worldKey){
  const g=game();if(!g?.player)return;
  if(worldKey!==world){world=worldKey;reset();}
  if(g.instance||!worldKey)return;
  if(g.dead&&!wasDead){send({t:'dead'});for(const k of known.values())k.engaged=false;}wasDead=!!g.dead;
  const list=others()||[];
  for(const e of g.enemies){
   if(!e.netId)continue;const k=entry(e);
   if(e.hp<k.hp){const d=Math.round(k.hp-Math.max(0,e.hp));k.hp=e.hp;k.engaged=e.hp>0;send({t:'hit',e:e.netId,d,max:e.maxHp,th:d*threatFactor(g),r:e.respawn?.[0]||35});}
   else if(e.hp>k.hp){k.hp=e.hp;if(k.engaged){k.engaged=false;send({t:'evade',e:e.netId});}}
   else if(e.hp>0&&e.aggro&&!k.engaged&&!k.target){k.engaged=true;send({t:'hit',e:e.netId,d:0,max:e.maxHp,th:1,r:e.respawn?.[0]||35});}
   else if(k.engaged&&e.hp>0&&!e.aggro&&!k.target){k.engaged=false;send({t:'evade',e:e.netId});}
   if(k.target&&e.hp>0){const o=list.find(x=>x.name===k.target);if(o)g.setRemoteTarget(e,{x:o.x,y:o.y});}
  }
 }
 function target(g,e,k,name){k.target=name&&name!==me()?name:null;if(!k.target)g.setRemoteTarget(e,null);}
 /** Servernachricht verarbeiten; true, wenn sie zur geteilten Welt gehörte */
 function receive(m){
  const g=game();if(!g||!['mob','mobs','kill','reset','up'].includes(m.t))return false;
  if(m.t==='mobs'){for(const row of m.list||[])receive(row.dead?{t:'kill',e:row.e,credit:[],r:row.dead,quiet:true}:{t:'mob',...row});return true;}
  const e=g.netEnemy(m.e);if(!e)return true;const k=entry(e);
  if(m.t==='mob'){if(g.applyRemoteHp(e,m.hp,m.by&&m.by!==me()))k.hp=e.hp;target(g,e,k,m.tg);}
  else if(m.t==='kill'){const credit=(m.credit||[]).includes(me());g.remoteKill(e,{credit,respawnIn:m.r||45});k.hp=0;k.engaged=false;k.target=null;}
  else if(m.t==='reset'){k.engaged=false;k.target=null;g.remoteReset(e);}
  else if(m.t==='up'){if(e.hp<=0)e.respawnAt=Math.min(e.respawnAt,g.time);k.target=null;}
  return true;
 }
 return {tick,receive,reset,known};
}
