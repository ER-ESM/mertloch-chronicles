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
 await read(`(()=>{const h=game.world.base.house;game.navigate({x:h.minX+196,y:h.minY+44});})()`);await until('!game.moveTo&&!game.routeGoal',20000);await wait(500);/* Küche (früher Kevins Platz) */s=await read(state);assert.equal(s.room,'kueche','Küche: '+JSON.stringify(s));await shot('3-kueche');checks.push('walked through the inner door into the kitchen');
 // 4 Wand hält: im Schankraum unter einer türlosen Wandstelle nach oben laufen.
 const wall=await read(`(()=>{const h=game.world.base.house;/* freie Wandstelle zwischen Flaschenbord und Tresen-Bauplatz */Object.assign(game.player,{x:h.minX+80,y:h.minY+125});game.moveTo=null;game.path=[];return h.minY+72;})()`);
 await b.hold('w',1500);s=await read(state);assert.ok(s.y>wall+3&&s.y<wall+14,'steht nicht direkt vor der Wand: '+JSON.stringify(s));assert.equal(s.room,'schankraum');checks.push('wall without door stops the hero ('+(s.y-wall)+' units in front of it)');
 // 5 Wieder hinaus: Dach blendet ein.
 await read(`Object.assign(game.player,{x:game.world.base.approach.x,y:game.world.base.approach.y+40});game.moveTo=null;game.path=[];`);await wait(1200);s=await read(state);assert.equal(s.fade,0,'Dach wieder da');checks.push('leaving shows the roof again');
 // 5b Treppe: am Treppenfuß per F hinauf, oben ins Baubüro, am Absatz per F wieder hinunter.
 await read(`(()=>{const h=game.world.base.house;Object.assign(game.player,{x:h.stairs.foot.x,y:h.stairs.foot.y});game.moveTo=null;game.path=[];})()`);await wait(1500);
 await b.press('f');await wait(600);let fl=await read(`({floor:game.floor||0,room:(game.world.base.house.upper.rooms.find(r=>r.rects.some(q=>game.player.x>=q.x&&game.player.x<q.x+q.w&&game.player.y>=q.y&&game.player.y<q.y+q.h))||{}).id})`);
 assert.deepEqual(fl,{floor:1,room:'matratzenlager'},'F am Treppenfuß führt ins Obergeschoss');
 await read(`(()=>{const r=game.world.base.house.upper.rooms.find(r=>r.id==='baubuero').rects[0];game.navigate({x:r.x+r.w/2,y:r.y+r.h/2+10});})()`);await until('!game.moveTo&&!game.routeGoal',20000);await wait(400);
 fl=await read(`({floor:game.floor||0,room:(game.world.base.house.upper.rooms.find(r=>r.rects.some(q=>game.player.x>=q.x&&game.player.x<q.x+q.w&&game.player.y>=q.y&&game.player.y<q.y+q.h))||{}).id})`);
 assert.deepEqual(fl,{floor:1,room:'baubuero'},'oben durch die Tür ins Baubüro');await shot('6-obergeschoss');
 await read(`(()=>{const l=game.world.base.house.upper.stairs.landing;Object.assign(game.player,{x:l.x,y:l.y});game.moveTo=null;game.path=[];})()`);await wait(400);
 await b.press('f');await wait(600);assert.equal(await read('game.floor||0'),0,'F am Absatz führt zurück ins Erdgeschoss');await shot('7-treppe-unten');
 checks.push('stairs: F goes up to the dormitory, walk into the site office upstairs, F at the landing goes back down');
 // 5c Treppe begehbar (Nutzerwunsch 2026-09-23): am Antritt einsteigen und hochlaufen – der Held hebt sich Stufe für Stufe, umgeschaltet
 //    wird erst auf der obersten Stufe; gehaltene Taste pendelt nicht; oben durch den Zugang (Westen) hinab und unten hinaus; Klick läuft die Stufen.
 const repeatHold=async(k,ms)=>{const code='Key'+k.toUpperCase(),vk=k.toUpperCase().charCodeAt(0);await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code,windowsVirtualKeyCode:vk});
  for(let t=0;t<ms;t+=33){await wait(33);await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code,windowsVirtualKeyCode:vk,autoRepeat:true});}await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code,windowsVirtualKeyCode:vk});};
 await read(`(()=>{const h=game.world.base.house,s=h.stairs;game.floor=0;Object.assign(game.player,{x:(s.minX+s.maxX)/2,y:s.maxY+7});game.moveTo=null;game.path=[];})()`);await wait(400);
 await read('window.__floorChanges=0;window.__maxLift=0;{const u=game.switchFloor.bind(game);game.switchFloor=(...a)=>{window.__floorChanges++;return u(...a);};}setInterval(()=>{window.__maxLift=Math.max(window.__maxLift,game.stairLift());},20);');
 await repeatHold('w',2600);assert.equal(await read('game.floor||0'),1,'die Treppe hinauflaufen führt ins Obergeschoss');
 assert.equal(await read('window.__floorChanges'),1,'gehaltene Taste pendelt nicht zwischen den Geschossen');assert.ok(await read('window.__maxLift')>10,'der Held stieg sichtbar die Stufen hinauf');
 await wait(400);await read(`(()=>{const u=game.world.base.house.upper.stairs;Object.assign(game.player,{...u.landing});game.moveTo=null;game.path=[];})()`);await wait(400);
 await repeatHold('a',700);assert.equal(await read('game.floor||0'),0,'oben durch den Zugang ins Treppenloch führt hinab');assert.ok(await read('game.stairLift()')>8,'man steht oben auf der Treppe');
 await shot('7b-treppe-oben');await repeatHold('s',2200);assert.ok(await read('game.player.y>game.world.base.house.stairs.maxY&&(game.floor||0)===0'),'unten hinaus');
 await read(`(()=>{const s=game.world.base.house.stairs;Object.assign(game.player,{x:(s.minX+s.maxX)/2,y:s.minY+26});game.moveTo=null;game.path=[];})()`);await wait(500);await shot('7c-treppe-mitte');
 await read(`(()=>{const h=game.world.base.house;Object.assign(game.player,{x:h.minX+150,y:h.minY+150});game.moveTo=null;game.path=[];})()`);await wait(600);
 const at=await read(`(()=>{const s=game.world.base.house.stairs,r=__mertloch.renderer,c=r.canvas.getBoundingClientRect(),wx=(s.minX+s.maxX)/2,wy=(s.minY+s.maxY)/2;return {x:(wx-r.camera.x+r.viewWidth/2)/r.viewWidth*c.width+c.left,y:(wy-r.camera.y+r.viewHeight/2)/r.viewHeight*c.height+c.top};})()`);
 for(const type of ['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:at.x,y:at.y,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});
 await until('(game.floor||0)===1',15000);await shot('8-treppe-klick');
 checks.push('stairs are walkable: run up step by step (hero lifted), switch on the top step, held key does not bounce, down through the access at the top, click walks up');
 // 5d Stammgäste (E-61): keine Helden-Mentoren mehr; Olli, Nyalol und Ron stehen an ihren Plätzen, reden (Taste F) und haben Aufträge.
 const regulars=await read(`(()=>{const h=game.world.base.house,at=p=>(h.rooms.find(r=>r.rects.some(q=>p.x>=q.x&&p.x<q.x+q.w&&p.y>=q.y&&p.y<q.y+q.h))||{}).id||null;
  return {mentors:game.world.mentors.length,list:['olli','nyalol','ron'].map(id=>id+':'+at(h.spots[id]))};})()`);
 assert.deepEqual(regulars,{mentors:0,list:['olli:schankraum','nyalol:hinterzimmer','ron:hof']},JSON.stringify(regulars));
 for(const id of ['olli','nyalol','ron']){
  await read(`(()=>{game.floor=0;document.querySelectorAll('[data-close],[data-window-close]').forEach(b=>b.click());const p=game.world.base.house.spots.${id};Object.assign(game.player,{x:p.x,y:p.y+14});game.moveTo=null;game.path=[];})()`);await wait(700);
  await b.press('f');await wait(700);
  const talk=await read(`(()=>{const m=document.querySelector('.hotspot-chatter')?.closest('.modal,dialog,[role=dialog],.popup')||document.querySelector('.hotspot-chatter')?.parentElement;return {chatter:document.querySelector('.hotspot-chatter')?.textContent||'',accept:document.querySelectorAll('[data-hs-accept]').length,portrait:!!document.querySelector('[data-person-art]')};})()`);
  assert.ok(talk.chatter.length>20,id+' sagt eine Zeile: '+JSON.stringify(talk));assert.ok(talk.portrait,id+' hat ein Porträt');await shot('9-stammgast-'+id);
  checks.push(id+' talks ('+talk.accept+' offer'+(talk.accept===1?'':'s')+')');}
 await read(`document.querySelectorAll('[data-close],[data-window-close]').forEach(b=>b.click())`);
 // 6 Neuer Held (E-52, Runde 1b): wacht im Schankraum auf, Ida und die Hofprobe sind in der Bude.
 const fresh={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:1,tutorial:{version:1,step:1,completed:false}};
 const again=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(fresh))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',again);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(2500);
 const start=await read(`(()=>{const h=game.world.base.house,at=p=>(h.rooms.find(r=>r.rects.some(q=>p.x>=q.x&&p.x<q.x+q.w&&p.y>=q.y&&p.y<q.y+q.h))||{}).id||null;return {hero:at(game.player),ida:at(game.world.npc),course:at(game.tutorial.course),dummy:at(game.tutorial.dummy),mentors:game.world.mentors.length,step:game.tutorial.step};})()`);
 assert.deepEqual({hero:start.hero,ida:start.ida,course:start.course,dummy:start.dummy},{hero:'schankraum',ida:'schankraum',course:'schankraum',dummy:'hof'},JSON.stringify(start));
 assert.equal(start.mentors,0,'keine Helden-Mentoren in der Bude (E-61)');await shot('4-neuer-held');
 await read('game.navigate(game.tutorial.dummy)');await until('!game.moveTo&&!game.routeGoal',20000);s=await read(state);assert.equal(s.room,'hof','Weg zu Papp-Horst durch die Hoftür: '+JSON.stringify(s));await shot('5-hofprobe');
 checks.push('new hero wakes in the taproom; Ida and course marker inside, no hero mentors, Papp-Horst in the yard, reachable through the yard door');
 assert.deepEqual(b.errors,[]);
 writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:[]},null,2));console.log('PASS bude house:',checks.join(' · '));
}catch(e){console.error('FAIL',e);try{await shot('failure');console.log(await read(state));}catch{}process.exitCode=1;}
finally{await b.close();}
