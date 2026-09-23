import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9433,serverPort:4233});const read=s=>b.evaluate(s);
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(5000);
 const pos=`JSON.stringify({fl:game.floor,x:Math.round(game.player.x-game.world.base.house.minX),y:Math.round(game.player.y-game.world.base.house.minY),st:game.stairsInteraction?.()?.label||null,hint:document.querySelector('.interact-hint,#interactHint')?.textContent||null})`;
 await read(`(()=>{const h=game.world.base.house;Object.assign(game.player,{x:h.spots.wake.x,y:h.spots.wake.y,inCombat:0});game.moveTo=null;game.path=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);await wait(6000);
 console.log('wake',await read(pos));
 await read(`game.navigate(game.world.base.house.stairs.foot)`);await wait(5000);console.log('nav foot',await read(pos));
 await b.press('f');await wait(800);console.log('F',await read(pos));
 await b.screenshot(process.env.TEMP+'/og-probe2.jpg');
 for(const k of ['d','s','d','w']){await b.hold(k,800);console.log(k,await read(pos));}
 await b.screenshot(process.env.TEMP+'/og-probe3.jpg');
}finally{b.close();}
