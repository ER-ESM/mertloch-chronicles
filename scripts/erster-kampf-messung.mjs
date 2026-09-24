// Messung für Runde 3a: frischer Held Stufe 1 (nach der Hofprobe) gegen n gleichzeitige Gegner, einfache Rotation 1-2-3.
// Aufruf: node scripts/erster-kampf-messung.mjs <anzahl> [Gegnername]  (CDP 9502, Server 4302)
import {session,wait} from './r3a-lib.mjs';
const s=await session({cdp:9502,server:4302});
const n=Number(process.argv[2]||1),name=process.argv[3]||'Pfandkeiler';
try{
 for(const run of [1,2]){
 await s.start({level:1,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1}});
 const info=await s.read(`const g=window.game,w=g.world,npc=w.npc;const base=w.findClear(npc.x+700,npc.y-500,9);Object.assign(g.player,base);
  for(const e of g.enemies)if(Math.hypot(e.x-base.x,e.y-base.y)<900){e.x+=5000;e.home={x:e.x,y:e.y};}
  const src=g.enemies.find(e=>e.name===${JSON.stringify(name)})||g.enemies.find(e=>e.behavior==='aggressive');window.__f=[];
  for(let i=0;i<${n};i++){const e=i?Object.assign(structuredClone({...src,chasePath:[],returnPath:[],spawnPoints:null}),{id:777000+i}):src;const p=w.findClear(base.x+60+i*14,base.y+i*10,9);Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:true,ai:'combat',spawnGrace:0,cast:null});if(i)g.enemies.push(e);window.__f.push(e);}
  g.target=window.__f[0];return {name:src.name,lvl:src.level,hp:src.maxHp,php:g.player.maxHp,skills:g.skills.filter(s=>s.id).map(s=>s.id)}`);
 const t0=await s.read('return window.game.time');let r;
 for(let i=0;i<400;i++){
  for(const k of ['1','2','3'])await s.b.press(k);
  await wait(150);
  r=await s.read(`const g=window.game;if(!(g.target?.hp>0)){const n=window.__f.find(e=>e.hp>0);if(n)g.target=n;}return {dead:g.dead,hp:g.player.hp,alive:window.__f.filter(e=>e.hp>0).length,t:g.time,kills:g.stats.kills}`);
  if(r.dead||!r.alive)break;
 }
 console.log(JSON.stringify(info),'run',run,'→',JSON.stringify({...r,t:+(r.t-t0).toFixed(1)}));
 }
}finally{s.close();}
