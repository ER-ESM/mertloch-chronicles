// E-72 Runde 4 · Weltgegner im echten Spiel (Headless): Stufenabstand, Umland-Stufe, Aufwachen, Laufweg mit Umweg.
// Screenshots nach docs/e72-runde4/welt/. Aufruf: SERVER_PORT=4384 CDP_PORT=9784 node scripts/e72-welt-check.mjs [url]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde4/welt';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9784),serverPort:Number(process.env.SERVER_PORT||4384)}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const worldKey='v2-56753-72-1';
const tidy=()=>read(`(()=>{if(!document.getElementById('welt-check-style'))document.head.insertAdjacentHTML('beforeend','<style id="welt-check-style">.milestone{display:none!important}</style>');document.querySelectorAll('.memory-card-close').forEach(b=>b.click());})()`);
async function load(classId,level){
 const save={version:1,worldKey,classId,level,trainingXp:0,tutorial:{version:1,step:8,completed:true},quest:{chapter:1,accepted:true,chapterClaimed:0},rpg:{version:4,coins:50}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 for(let i=0;i<120&&!(await read('!!window.game&&!!game.member'));i++)await wait(250);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(1500);
 await read(`document.querySelectorAll('[data-window-close],.memory-card [data-close],.popup-close').forEach(b=>b.click());game.floor=0;game.player.hp=game.player.maxHp;`);
 assert.equal(await read('game.member.id+":"+game.player.level'),classId+':'+level,'Held geladen');
 await tidy();
}
const teleport=(x,y)=>read(`(()=>{const s=game.world.findClear(${x},${y},9)||{x:${x},y:${y}};Object.assign(game.player,{x:s.x,y:s.y,moving:false});game.moveTo=null;game.path=[];game.routeGoal=null;return s;})()`);
try{
 await b.resize(1600,900);
 // A · Käthe Stufe 12 an der Grillwiese (Tiergebiet der Stufe 2): grau, kein Angriff; Kampf auf Wunsch mit kleinem Schaden
 await load('kaethe',12);
 const area=await read(`(async()=>{const {hotspotLayout}=await import('./hotspots.js');const a=hotspotLayout(game.world).areas.find(a=>a.id==='grillwiese');return {x:a.x,y:a.y,r:a.r};})()`);
 await teleport(area.x,area.y+area.r+380);await wait(2500);
 await teleport(area.x,area.y);await wait(4000);await tidy();
 const calm=JSON.parse(await read(`JSON.stringify({near:game.enemies.filter(e=>e.hotspot==='grillwiese'&&e.hp>0&&Math.hypot(e.x-game.player.x,e.y-game.player.y)<95).length,aggro:game.enemies.filter(e=>e.aggro&&e.hp>0).length,hp:game.player.hp,max:game.player.maxHp})`));
 assert.ok(calm.near>=2,'Keiler in der Nähe: '+calm.near);assert.equal(calm.aggro,0,'graue Keiler greifen nicht an');
 await read(`(()=>{const p=game.player,e=game.enemies.filter(e=>e.hotspot==='grillwiese'&&e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];game.target=e;})()`);await wait(600);
 await shot('a1-kaethe-12-grillwiese-grau-kein-angriff');
 checks.push(`A · Käthe 12 mitten in der Grillwiese: ${calm.near} Keiler in Aggro-Reichweite (12 m), ${calm.aggro} greifen an, Leben ${Math.round(calm.hp)}/${calm.max}`);
 const hpBefore=await read('game.player.hp');
 for(let i=0;i<48;i++){await read(`(()=>{const t=game.target;if(!t||t.hp<=0){const p=game.player;game.target=game.enemies.filter(e=>e.aggro&&e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;}if(!game.target)return;game.autoAttack.enabled=true;const p=game.player,d=Math.hypot(game.target.x-p.x,game.target.y-p.y);if(d>150){p.x+=(game.target.x-p.x)/d*20;p.y+=(game.target.y-p.y)/d*20;}if(game.gcd<=0&&!game.casting)for(const id of ['slot1','slot2','slot3','burst','strike'])if(game.skills.some(s=>s.id===id)&&game.action(id))break;})()`);await wait(250);if(i===20)await shot('a2-kaethe-12-kampf-gegen-stufe-2');}
 const after=JSON.parse(await read(`JSON.stringify({hp:game.player.hp,max:game.player.maxHp,dead:game.dead,kills:game.stats.kills,taken:${hpBefore}-game.player.hp})`));
 assert.ok(!after.dead&&after.hp>after.max*.7,'Käthe verliert zu viel: '+JSON.stringify(after));
 checks.push(`A · Käthe 12 kämpft 12 s gegen Keiler der Stufe 2: ${after.kills} Kills, Leben ${Math.round(after.hp)}/${after.max}`);
 // B · Dieter Stufe 12 im Umland: der Keiler trägt seine echte Stufe (10) im Zielrahmen
 await load('dieter',12);
 const far=await read(`(async()=>{const {inStartArea}=await import('./foe-rules.js');const w=game.world,s=w.spawn;for(const [dx,dy] of [[1500,-900],[-1500,900],[1600,600],[-1200,-1300],[900,1600]]){const p=w.findClear(s.x+dx,s.y+dy,9);if(!p||inStartArea(w,p))continue;Object.assign(game.player,p);for(let i=0;i<40;i++)game.ecology.tick(.6);const e=game.enemies.filter(e=>e.archetype==='boar'&&e.hp>0&&!e.aggro&&e.level>2).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(e)return {x:e.x,y:e.y,level:e.level,hp:e.maxHp,id:e.id};}return null;})()`);
 assert.ok(far,'Umland-Keiler gefunden');
 await teleport(far.x-150,far.y+60);await wait(1200);await read(`game.target=game.enemies.find(e=>e.id===${far.id});`);await wait(700);
 const frame=await read(`document.querySelector('#targetPanel')?.innerText||''`);
 await shot('b1-dieter-12-umland-keiler-stufe-10');
 assert.ok(frame.includes(String(far.level)),'Zielrahmen zeigt Stufe '+far.level+': '+frame.replace(/\s+/g,' '));
 checks.push(`B · Umland-Keiler bei Stufe 12: Stufe ${far.level}, ${far.hp} Leben (vorher als „Stufe 2“ angezeigt) · Zielrahmen „${frame.replace(/\s+/g,' ').trim().slice(0,40)}“`);
 // C · Kevin Stufe 4: Laufweg, Angriff, Tod, Aufwachen – kein Weiterlaufen, „Kurzer Schutz“
 await load('kevin',4);
 await read(`(async()=>{const {makeEnemy}=await import('./encounters.js');const {ARCHETYPES}=await import('./content/index.js');const h=game.world.hubs.find(h=>h.id==='wegestube');game.navigate(h);window.__welt={goal:h};setTimeout(()=>{const p=game.player,e=makeEnemy(game.world.findClear(p.x+30,p.y,9),880001,{...ARCHETYPES.boar,ambient:true,archetype:'boar',hp:5000});e.aggro=true;e.ai='combat';game.enemies.push(e);game.hitPlayer(e,20);},900);})()`);
 await wait(1600);
 const stopped=await read('!!game.autopilotResume&&!game.routeGoal');assert.ok(stopped,'Laufweg beim Angriff angehalten');
 await read(`game.hitPlayer(game.enemies.find(e=>e.id===880001),99999,false)`);await wait(1200);
 await shot('c1-kevin-4-umgekippt');
 await read(`document.querySelector('[data-ds-wake]')?.click()`);await wait(2500);
 const wake=JSON.parse(await read(`JSON.stringify({dead:game.dead,route:!!game.routeGoal,resume:!!game.autopilotResume,guard:+(game.player.wakeGuard||0).toFixed(1),aura:!!document.querySelector('[data-aura="wakeGuard"]'),d:Math.round(Math.hypot(game.player.x-game.world.spawn.x,game.player.y-game.world.spawn.y))})`));
 assert.ok(!wake.dead&&!wake.route&&!wake.resume,'nach dem Aufwachen kein Weiterlaufen: '+JSON.stringify(wake));assert.ok(wake.guard>0&&wake.aura,'Kurzer Schutz sichtbar: '+JSON.stringify(wake));
 await read(`document.querySelector('[data-aura="wakeGuard"]')?.click()`);await wait(400);
 await shot('c2-kevin-4-aufgewacht-kurzer-schutz');
 checks.push(`C · Aufwachen bei St. Gangolf: steht still (${wake.d/8} m vom Wiederbelebungspunkt), kein Laufweg, Kurzer Schutz ${wake.guard} s mit Symbol`);
 // D · Anni Stufe 2: Keilerrudel auf dem kürzesten Weg zur Wegestube. Vorher (kürzester Weg) gegen nachher („Hinlaufen“ mit Wegkosten).
 // Die Figur läuft im Zeitraffer (game.tick), bis sie angegriffen wird oder am Rudel vorbei ist.
 const walk=async(old)=>{await load('baerbel',2);await tidy();await teleport(await read('game.world.spawn.x'),await read('game.world.spawn.y'));await wait(1200);
  return JSON.parse(await read(`(async()=>{const {makeEnemy}=await import('./encounters.js');const {ARCHETYPES}=await import('./content/index.js');const {routeRisk,routeLength,dangerZones}=await import('./safe-route.js');
   const w=game.world,s={x:game.player.x,y:game.player.y},t=w.hubs.find(h=>h.id==='wegestube'),base=w.findPath(s,t),i=Math.floor(base.length/2),a=base[i-1]||s,m={x:(base[i].x+a.x)/2,y:(base[i].y+a.y)/2};
   const pack=[0,1,2].map(k=>makeEnemy(w.findClear(m.x+(k-1)*30,m.y+(k%2)*20,9),880100+k,{...ARCHETYPES.boar,ambient:true,archetype:'boar',roamRadius:20}));game.enemies.push(...pack);
   game.navigate(t);if(${old}){game.path=w.findPath(s,t);game.moveTo=game.path.shift();}/* vorher: kürzester Weg */
   const route=[game.moveTo,...game.path],zones=dangerZones(game).filter(z=>z.id>=880100),near=()=>Math.min(...pack.map(e=>Math.hypot(e.x-game.player.x,e.y-game.player.y)));
   let best=1e9,stop=false;for(let n=0;n<1200;n++){game.tick(.05);const d=near();best=Math.min(best,d);if(game.autopilotResume||pack.some(e=>e.aggro)){stop=true;break;}if(best<400&&d>best+60)break;if(!game.routeGoal)break;}game.moveTo=null;game.path=[];game.routeGoal=null;game.autopilotResume=null;/* stehen bleiben, bis die Kamera nachgezogen ist */
   return JSON.stringify({len:Math.round(routeLength(s,route)/8),risk:Math.round(routeRisk(s,route,zones)/8),closest:Math.round(best/8),stopped:stop,aggro:pack.filter(e=>e.aggro).length,by:game.enemies.filter(e=>e.aggro&&e.hp>0).map(e=>e.name+(pack.includes(e)?" (Rudel)":"")),hp:Math.round(game.player.hp)});})()`));};
 const vorher=await walk(true);await wait(3500);await shot('d1-anni-2-vorher-kuerzester-weg-ins-rudel');console.log('Kamera',JSON.stringify(await read('(({viewport:{camera:c}},p)=>({c:[Math.round(c.x),Math.round(c.y),c.scale||c.zoom||0],p:[Math.round(p.x),Math.round(p.y)]}))(window.mertloch.state(),game.player)')));
 const nachher=await walk(false);await wait(4500);await shot('d2-anni-2-nachher-umweg-am-rudel-vorbei');console.log('Kamera',JSON.stringify(await read('(({viewport:{camera:c}},p)=>({c:[Math.round(c.x),Math.round(c.y),c.scale||c.zoom||0],p:[Math.round(p.x),Math.round(p.y)]}))(window.mertloch.state(),game.player)')));
 assert.ok(vorher.stopped,'vorher: auf dem kürzesten Weg angegriffen '+JSON.stringify(vorher));
 assert.ok(!nachher.stopped&&nachher.aggro===0&&nachher.risk<vorher.risk,'nachher: Umweg ohne Angriff '+JSON.stringify(nachher));
 checks.push(`D · Laufweg zur Wegestube mit Keilerrudel auf der Strecke: vorher ${vorher.len} m, ${vorher.risk} m im Rudel → angegriffen von ${vorher.by.join(", ")} · nachher ${nachher.len} m, ${nachher.risk} m im Rudel, nächster Keiler ${nachher.closest} m, kein Angriff`);
 assert.deepEqual(b.errors,[],'Laufzeitfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS E-72 Welt:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e,JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{await b.close();}
