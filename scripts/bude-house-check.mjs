// Die Bude als begehbares Haus (E-52): von der Straße durch die Tür hinein, Dach blendet aus, Räume, Wände halten.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/bude-house';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9431,serverPort:4231}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
async function until(expression,ms=12000){for(let i=0;i<ms/100;i++){if(await read(expression))return;await wait(100);}throw Error('Timeout: '+expression+' · '+JSON.stringify(await read(state)));}
const state=`(()=>{const h=game.world.base.house,p=game.player;return {x:Math.round(p.x),y:Math.round(p.y),fade:__mertloch.renderer.houseFade,room:(h.rooms.find(r=>r.rects.some(q=>p.x>=q.x&&p.x<q.x+q.w&&p.y>=q.y&&p.y<q.y+q.h))||{}).id||null,moveTo:!!game.moveTo};})()`;
const walkTo=async spot=>{await read(`game.navigate(game.world.base.house.spots.${spot})`);await until('!game.moveTo&&!game.routeGoal',20000);await wait(500);};
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(4000);
 // 1 Draußen vor dem Eingang: Dach zu, kein Raum.
 await read(`game.enemies=[];Object.assign(game.player,{x:game.world.base.approach.x,y:game.world.base.approach.y+30,inCombat:0});game.moveTo=null;game.path=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(7000);/* Freischalt-Banner abwarten */
 let s=await read(state);assert.equal(s.fade,0,'draußen ist das Dach sichtbar');assert.equal(s.room,null);await shot('1-aussen');checks.push('outside: roof shown, no room');
 // 2 Echter Weg durch die Eingangstür in den Schankraum.
 await walkTo('wake');s=await read(state);assert.equal(s.room,'schankraum','Held steht im Schankraum: '+JSON.stringify(s));assert.equal(s.fade,1,'Dach ausgeblendet');await shot('2-schankraum');checks.push('walked through the front door into the taproom, roof faded');
 // 3 Weiter durch die Innentür in die Küche.
 await walkTo('kevin');s=await read(state);assert.equal(s.room,'kueche','Küche: '+JSON.stringify(s));await shot('3-kueche');checks.push('walked through the inner door into the kitchen');
 // 4 Wand hält: im Schankraum unter einer türlosen Wandstelle nach oben laufen.
 const wall=await read(`(()=>{const h=game.world.base.house;Object.assign(game.player,{x:h.minX+15,y:h.minY+110});game.moveTo=null;game.path=[];return h.minY+72;})()`);
 await b.hold('w',1500);s=await read(state);assert.ok(s.y>wall+3,'durch die Wand gelaufen: '+JSON.stringify(s));assert.equal(s.room,'schankraum');checks.push('wall without door stops the hero ('+(s.y-wall)+' units in front of it)');
 // 5 Wieder hinaus: Dach blendet ein.
 await read(`Object.assign(game.player,{x:game.world.base.approach.x,y:game.world.base.approach.y+40});game.moveTo=null;game.path=[];`);await wait(1200);s=await read(state);assert.equal(s.fade,0,'Dach wieder da');checks.push('leaving shows the roof again');
 // 6 Neuer Held (E-52, Runde 1b): wacht im Schankraum auf, Ida und die Hofprobe sind in der Bude.
 const fresh={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:1,tutorial:{version:1,step:1,completed:false}};
 const again=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(fresh))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',again);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(2500);
 const start=await read(`(()=>{const h=game.world.base.house,at=p=>(h.rooms.find(r=>r.rects.some(q=>p.x>=q.x&&p.x<q.x+q.w&&p.y>=q.y&&p.y<q.y+q.h))||{}).id||null;return {hero:at(game.player),ida:at(game.world.npc),course:at(game.tutorial.course),dummy:at(game.tutorial.dummy),mentors:game.world.mentors.map(m=>m.id+':'+at(m)),step:game.tutorial.step};})()`);
 assert.deepEqual({hero:start.hero,ida:start.ida,course:start.course,dummy:start.dummy},{hero:'schankraum',ida:'schankraum',course:'schankraum',dummy:'hof'},JSON.stringify(start));
 assert.deepEqual(start.mentors,['dieter:schankraum','baerbel:hinterzimmer','kevin:kueche']);await shot('4-neuer-held');
 await read('game.navigate(game.tutorial.dummy)');await until('!game.moveTo&&!game.routeGoal',20000);s=await read(state);assert.equal(s.room,'hof','Weg zu Papp-Horst durch die Hoftür: '+JSON.stringify(s));await shot('5-hofprobe');
 checks.push('new hero wakes in the taproom; Ida, course marker and mentors inside, Papp-Horst in the yard, reachable through the yard door');
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:[]},null,2));console.log('PASS bude house:',checks.join(' · '));
}catch(e){console.error('FAIL',e);try{await shot('failure');console.log(await read(state));}catch{}process.exitCode=1;}
finally{await b.close();}
