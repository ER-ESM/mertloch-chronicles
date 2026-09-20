// Bildbelege für die Licht-/Schatten-Runde: node scripts/look-shot.mjs <ordner> [fresh]
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/look-dreadmyst/'+(process.argv[2]||'shot'),fresh=process.argv[3]==='fresh';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9491),serverPort:Number(process.env.PORT||4391)});
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:11,trainingXp:11000,tutorial:{version:1,step:8,completed:true}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;${fresh?'':`localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`}localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(1500);
 await b.screenshot(dir+'/00-start.png');
 await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(200);await b.evaluate(`document.querySelectorAll('[data-window-close],[data-meter-close]').forEach(b=>b.click());game.player.maxHp=game.player.hp=1e6;`);
 if(!fresh){
  const spots=await b.evaluate(`(()=>{const g=game,w=g.world||globalThis.__mertloch.renderer.world;const camp=w.camps.find(c=>c.type!=='wolf')||w.camps[0];const tree=w.trees[Math.floor(w.trees.length*.6)];return [['plaza',w.plaza.x,w.plaza.y+40],['camp',camp.x+60,camp.y+70],['wald',tree.x+30,tree.y+40]];})()`);
  for(const [name,x,y] of spots){await b.evaluate(`(()=>{const g=game;g.player.x=${x};g.player.y=${y};const r=globalThis.__mertloch.renderer;r.camera.x=${x};r.camera.y=${y};})()`);await wait(3200);await b.screenshot(dir+'/'+name+'.png');const r=await b.send('Page.captureScreenshot',{format:'png',clip:{x:520,y:250,width:560,height:400,scale:2}});(await import('node:fs')).writeFileSync(dir+'/'+name+'-zoom.png',Buffer.from(r.data,'base64'));}
  await b.evaluate(`document.body.classList.add('look-shot-nohud')`);
 }
 console.log('state',JSON.stringify(await b.evaluate(`({light:game.settings.light,frame:globalThis.__mertloch.renderer.light?.frame,filter:document.querySelector('#world').style.filter})`)));console.log('errors',JSON.stringify(b.errors?.slice?.(0,5)||[]));
}finally{b.close();}
