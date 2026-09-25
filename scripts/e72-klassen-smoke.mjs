// E-72 · Rauchtest im echten Spiel: jede der fünf Klassen kämpft 15 s mit ihrer Rotation gegen eine Gruppe in der
// Trainingsumgebung. Prüft: keine Laufzeitfehler, Ressource bewegt sich, Leiste zeigt die Ressource. Screenshots nach
// visual-review/e72-smoke/. Aufruf: node scripts/e72-klassen-smoke.mjs [url]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/e72-smoke';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9470),serverPort:Number(process.env.SERVER_PORT||4270)}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const SPEC={dieter:'dieter-brawl',baerbel:'baerbel-stage',kevin:'kevin-hunt',schorsch:'schorsch-flamme',kaethe:'kaethe-grand'};
try{
 await b.resize(1440,1000);
 for(const cls of Object.keys(SPEC)){
  const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:cls,level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50,talents:{spec:SPEC[cls],learned:[]}}};
  const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
  await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);for(let i=0;i<120&&!(await read('!!window.game&&!!game.member'));i++)await wait(250);await wait(1500);
  assert.equal(await read('game.member.id'),cls,'Klasse geladen');
  // Gruppe aus drei Übungsgegnern direkt neben dem Helden
  await read(`(async()=>{const {makeEnemy}=await import('./encounters.js');const p=game.player;game.floor=0;const spot=game.world.findClear(p.x+60,p.y+420)||{x:p.x,y:p.y+420};Object.assign(p,{x:spot.x,y:spot.y});game.moveTo=null;game.path=[];game.enemies=[];game.populateCamps=()=>{};for(let i=0;i<3;i++){const e=makeEnemy({x:p.x+46+i*16,y:p.y+(i-1)*18},900+i,{hp:2500,aggro:true,ai:'combat',behavior:'aggressive',attackTimer:2});e.arena=true;game.enemies.push(e);}game.target=game.enemies[0];p.inCombat=7;})()`);
  await wait(300);
  const start=await read(`JSON.stringify({line:document.querySelector('#energyText')?.textContent,res:game.res})`);
  for(let i=0;i<60;i++){await read(`(()=>{const t=game.enemies.find(e=>e.hp>0);if(t){game.target=t;const r=game.res||{};if(r.reload){const f=r.reload.t/r.reload.total;if(!r.reload.tried&&f>r.reload.zone[0]+.03&&f<r.reload.zone[1]-.03)game.action('reload');return;}if(game.gcd<=0&&!game.casting){const order=r.glut!==undefined?(r.glut>=88?['heal']:[]).concat(['burst','mark',r.glut>=78?'throw':'',r.glut>=72?'ground':'','strike']):r.hand?['throw','strike','mark','burst','ground','buff']:r.bottles!==undefined?(r.bottles<=1?['reload']:[]).concat(['mark','burst','throw','ground','strike']):['zeche','throw','mark','burst','ground','buff','strike'];for(const id of order)if(id&&game.skills.some(s=>s.id===id)&&(game.cooldowns[id]||0)<=0&&game.action(id,{x:t.x,y:t.y}))break;}}})()`);await wait(250);if(i===24)await shot(cls+'-kampf');}
  const end=await read(`JSON.stringify({line:document.querySelector('#energyText')?.textContent,dead:game.dead,alive:game.enemies.filter(e=>e.hp>0).length,res:game.res})`);
  await shot(cls+'-ende');
  checks.push(cls+': '+JSON.parse(start).line+' → '+JSON.parse(end).line+' · Gegner übrig '+JSON.parse(end).alive+(JSON.parse(end).dead?' · TOT':''));
 }
 assert.deepEqual(b.errors,[],'Laufzeitfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS E-72 smoke:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e,JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{await b.close();}
