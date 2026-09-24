import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const round=process.argv.find(a=>a.startsWith('--round='))?.split('=')[1]||'0';
const dir='visual-review/gui-polish/iteration-'+round;mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9401});
const read=s=>b.evaluate(s);
async function fixture(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'baerbel',level:30,tutorial:{version:1,step:8,completed:true}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 await read(`game.paused=true;document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.player.hp=game.player.maxHp*.64;game.player.energy=68;game.hireCompanion('merc-pils-peter',{free:true});game.hireCompanion('merc-radler-rita',{free:true});game.companions[0].hp=game.companions[0].maxHp*.42;game.companions[1].hp=game.companions[1].maxHp*.87;`);
 await read(`import('./talents.js').then(m=>m.changeSpec(game,'baerbel-care'))`);
 await read(`game.classState.m={supply:3};`);
 await read(`Promise.all([import('./class-mechanic-art.js').then(m=>m.loadMechanicArt()),import('./ui-chrome.js').then(m=>m.loadChromeArt())])`);
 await wait(500);
}
async function shot(name){await wait(250);await b.screenshot(dir+'/'+name+'.png');}
async function close(){await read(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click())`);}
async function panel(id){await close();await read(`document.querySelector('.game-menu-rail [data-panel="${id}"]').click()`);await wait(200);}
try{
 await b.resize(1440,1000);await fixture();await shot('desktop-hud');
 if(round!=='0'){
  await read(`import('./unit-frame.js').then(m=>{const el=document.createElement('aside');el.className='party-frames';el.dataset.reviewParty='true';el.innerHTML='<header>Gruppe</header>'+[{n:'Mara',c:'baerbel',l:30,h:76,w:'review',s:'idle'},{n:'Kronkorken-Kevin',c:'kevin',l:28,h:24,w:'review',s:'combat'}].map(x=>m.partyMemberFrame(x,{world:'review',leader:'Mara'})).join('');document.querySelector('#gameShell').append(el);m.paintUnitPortraits(el);})`);
  await shot('online-party');await read(`document.querySelector('[data-review-party]').remove()`);
 }
 await panel('person');await shot('character');
 await panel('bag');await shot('inventory');
 await read(`document.querySelector('.game-menu-rail [data-panel="talents"]')?.click()`);await shot('talents');await close();
 await b.press('Escape');await shot('menu');await close();
 await b.resize(390,844);await fixture(true);await shot('touch-hud');
 await read(`document.querySelector('[data-companion-manage]').click()`);await shot('touch-companions');await close();
 await b.resize(844,390);await shot('landscape-hud');
 const report={round,errors:b.errors,shots:['desktop-hud',...(round==='0'?[]:['online-party']),'character','inventory','talents','menu','touch-hud','touch-companions','landscape-hud']};
 writeFileSync(dir+'/report.json',JSON.stringify(report,null,2));if(b.errors.length)throw Error(JSON.stringify(b.errors));
 console.log('Saved '+report.shots.length+' screenshots to '+dir);
}finally{await b.close();}
