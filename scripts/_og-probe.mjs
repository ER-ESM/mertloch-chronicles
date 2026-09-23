import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({port:9432,serverPort:4232});const read=s=>b.evaluate(s);
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(4000);
 await read(`(()=>{const h=game.world.base.house;Object.assign(game.player,{x:h.stairs.foot.x,y:h.stairs.foot.y,inCombat:0});game.moveTo=null;game.path=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);await wait(7000);
 await b.press('f');await wait(600);
 const pos=`JSON.stringify({fl:game.floor,x:Math.round(game.player.x-game.world.base.house.minX),y:Math.round(game.player.y-game.world.base.house.minY),paused:game.paused,keys:[...game.keys]})`;
 console.log('oben',await read(pos));
 for(const k of ['d','s','d','w','a']){await b.hold(k,800);console.log(k,await read(pos));}
 await b.screenshot(process.env.TEMP+'/og-probe.jpg');
}finally{await b.close?.();}
