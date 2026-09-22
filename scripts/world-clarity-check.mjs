import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/world-clarity';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:9421,serverPort:4221});
async function clearPopups(){for(let i=0;i<4;i++){await b.evaluate("document.querySelectorAll('[data-window-close]').forEach(b=>b.click());");await wait(150);}}
try{
 await b.resize(1600,1000);
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));`});
 await b.goto(b.url);for(let i=0;i<200;i++){if(await b.evaluate('!!window.game&&!!window.__mertloch'))break;await wait(100);}assert.ok(await b.evaluate('!!window.game&&!!window.__mertloch'),'Game ready after character creation reload');await wait(1600);
 const actors=await b.evaluate(`(async()=>{
 const g=window.game;g.tutorial.completed=true;g.enemies=[];g.companions=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());
 const {professionWorld}=await import('./profession-world.js'),{drawProfession}=await import('./profession-art.js');
 const stations=professionWorld(g.world).stations,brew=stations.find(s=>s.id==='braugarten');g.player.x=brew.x-48;g.player.y=brew.y;g.moveTo=null;
 const result=[];for(const station of stations){const cv=document.createElement('canvas');cv.width=320;cv.height=320;const c=cv.getContext('2d'),calls=[],draw=c.drawImage.bind(c);c.drawImage=(...a)=>{const t=c.getTransform(),height=a.length===9?a[8]:a.length===5?a[4]:a[0].height;const probe=document.createElement('canvas');probe.width=cv.width;probe.height=cv.height;const pc=probe.getContext('2d');pc.setTransform(t);pc.drawImage(...a);const pixels=pc.getImageData(0,0,probe.width,probe.height).data;let top=probe.height,bottom=-1;for(let y=0;y<probe.height;y++)for(let x=0;x<probe.width;x++)if(pixels[(y*probe.width+x)*4+3]>96){top=Math.min(top,y);bottom=Math.max(bottom,y);}calls.push({source:a[0].src||'canvas',height:bottom-top+1,frameHeight:height*Math.hypot(t.c,t.d)});draw(...a);};drawProfession(c,{...station,x:160,y:220},g,0);result.push({id:station.id,actor:calls.at(-1)});}return result;
 })()`);
 for(const station of actors){assert.ok(station.actor.height>20&&station.actor.height<=30,JSON.stringify(station));assert.ok(station.actor.source,'Station actor drawn');}
 await wait(500);await clearPopups();await b.screenshot(dir+'/normal.png');
 const resolutions=[];
 for(const [ratio,zoom] of [[1,1],[1,1.8],[1.5,1],[2,1]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:ratio,mobile:false});
  const result=await b.evaluate(`(()=>{const r=__mertloch.renderer,g=window.game;g.settings.fullRes=false;g.settings.autoRes=true;r.setZoomFactor(${zoom});r.densityCap=1;r.resize();for(let i=0;i<1000;i++)r.pace(35,25);return{density:r.density,zoom:r.zoom,ratio:devicePixelRatio,canvasWidth:r.canvas.width,cssWidth:r.canvas.getBoundingClientRect().width,gradeOff:r.gradeOff};})()`);
  assert.ok(result.density>=result.zoom,JSON.stringify(result));assert.ok(result.canvasWidth>=result.cssWidth,JSON.stringify(result));resolutions.push(result);
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 await b.evaluate('const r=__mertloch.renderer;r.setZoomFactor(1);r.resize();');await wait(500);await clearPopups();await b.screenshot(dir+'/after-load.png');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({actors,resolutions,errors:b.errors},null,2));console.log(JSON.stringify({actors,resolutions}));
}finally{await b.close();}
