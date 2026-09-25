// E-72 Runde 3 · Schadensmeter im echten Spiel: Schorsch und Käthe kämpfen gegen drei Übungspuppen, danach zeigt die
// Kampfstatistik jede Quelle in eigener Zeile (Servieren, Stichflamme, Popcorn, Glutbrand … / Kreuz, Karo, Abrechnen …) statt eines
// Sammeltopfs. Eigener Server und Wegwerf-Browser (SERVER_PORT/CDP_PORT, Vorgabe 4376/9776). Screenshots: docs/e72-runde3/balance2/*.jpg
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde3/balance2';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9776),serverPort:Number(process.env.SERVER_PORT||4376)});
const read=s=>b.evaluate(s);
const shot=async(name,sel)=>{const r=await read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const q=e.getBoundingClientRect();return {x:Math.max(0,q.left-6),y:Math.max(0,q.top-6),width:q.width+12,height:q.height+12};})()`);
 const out=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,clip:{...r,scale:1.5}});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(out.data,'base64'));console.log('Bild',dir+'/'+name+'.jpg');};
async function play(classId,spec,order){
 const save={version:1,worldKey:'v2-56753-72-1',classId,level:20,trainingXp:0,tutorial:{version:1,step:8,completed:true}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(300);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
 const r=await read(`(async()=>{const {spawnArena}=await import('./arena.js');game.rpg.talents.spec=${JSON.stringify(spec)};game.refreshStats();game.resetClassState();
  const foes=spawnArena(game,{count:3,dummy:true});game.target=foes[0];game.random=(()=>{let s=7;return ()=>((s=(s*16807)%2147483647)/2147483647);})();
  const order=${JSON.stringify(order)};
  for(let t=0;t<24;t+=1/20){game.player.inCombat=7;game.player.hp=Math.max(game.player.hp,game.player.maxHp*.6);if(!(game.target?.hp>0))game.target=foes.find(e=>e.hp>0);
   if(!game.casting&&game.gcd<=0){for(const id of order){if(id==='throw'&&game.res?.augen!==undefined&&game.res.augen<61)continue;if(id==='heal'&&!(game.res?.glut>=86))continue;if(game.action(id,{x:game.target.x,y:game.target.y}))break;}}
   game.tick(1/20);}
  return {id:game.member.id,spec:game.rpg.talents.spec};})()`);
 assert.equal(r.id,classId);assert.equal(r.spec,spec);
 /* Die Erinnerungs-Randkarte (memory-card.js) legt sich bei 1600×900 über die später geöffnete Statistik – für das Bild ausblenden */
 await read(`document.querySelectorAll('.memory-card').forEach(e=>e.hidden=true)`);
 await b.press('v');await wait(400);assert.equal(await read(`document.querySelector('#combatMeter').hidden`),false,'Kampfstatistik offen');
 await read(`document.querySelector('[data-meter-mode="damage"]')?.click()`);await wait(300);
 await read(`document.querySelector('[data-meter-actor]').click()`);await wait(400);
 return read(`[...document.querySelectorAll('[data-meter-ability] .meter-row-name')].map(e=>e.textContent.replace(/^\\d+\\.\\s*/,''))`);
}
try{
 await b.resize(1600,900);
 const s=await play('schorsch','schorsch-flamme',['heal','burst','mark','ground','throw','strike']);console.log('Schorsch:',s.join(' · '));
 for(const n of ['Servieren','Grillzange'])assert.ok(s.includes(n),'Schorsch-Zeile '+n);assert.ok(s.some(n=>['Stichflamme','Popcorn','Glutbrand','Flambiert','Dampf'].includes(n)),'eigene Zeile für eine Grill-Quelle');
 assert.equal(new Set(s).size,s.length,'keine doppelten Zeilennamen');await shot('meter-schorsch-flambierer','#combatMeter');
 // Kenner-Befund Runde 4: Ablöschen aus „zu heiß“ landet am Anfang der perfekten Glut (vorher 95 → kalt); der Tooltip sagt es vorher an.
 await read(`document.querySelector('#combatMeter [data-meter-close], #combatMeter .meter-close')?.click()`);await b.press('v');await wait(200);
 const v=await read(`(async()=>{const {skillHelp}=await import('./mechanic-help.js');game.paused=true;game.cooldowns.heal=0;game.gcd=0;game.res.glut=95;game.res.lock=0;game.casting=null;game.player.inCombat=7;const tip=skillHelp(game,'heal');const n=game.events.length;game.paused=false;const ok=game.action('heal');game.paused=true;return {tip,ok,glut:game.res.glut,why:game.events.slice(n).map(e=>e.text||e.type).join(' | ')};})()`);
 console.log('Ablöschen:',JSON.stringify(v));assert.ok(v.ok);assert.equal(v.glut,60,'95 → Anfang der perfekten Glut');assert.match(v.tip,/Danach: Glut 60 · Perfekte Glut/);
 await wait(500);await shot('abloeschen-95-auf-60','.player-panel');
 const k=await play('kaethe','kaethe-grand',['throw','ground','strike','mark','burst']);console.log('Käthe:',k.join(' · '));
 assert.ok(k.includes('Kreuz')&&k.includes('Karo'),'Karten je Farbe in eigener Zeile');assert.ok(k.includes('Abrechnen'),'Abrechnen eigene Zeile');
 assert.equal(new Set(k).size,k.length,'keine doppelten Zeilennamen');await shot('meter-kaethe-grand','#combatMeter');
 console.log('PASS Schadensmeter-Labels');
}finally{b.close();}
