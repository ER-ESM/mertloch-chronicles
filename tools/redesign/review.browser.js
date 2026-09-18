async(page)=>{
 const folder='D:/Dev/MertlochChronicles-ui3/assets/redesign/review/',context=await page.context().browser().newContext({viewport:{width:1440,height:1050},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 try{
  await p.goto('http://127.0.0.1:4283/redesign-demo.html');await p.waitForFunction(()=>window.redesignDemo?.ready);await p.locator('#pause').click();
  const stats=await p.evaluate(async()=>{
   const {redesignArt,drawRedesignPerson}=await import('./redesign-art.js'),{drawLivePerson}=await import('./live-art.js'),{DEMO_PRESETS,resolveDemoEquipment}=await import('./prerender-demo-presets.js');
   const cv=document.createElement('canvas');cv.width=cv.height=240;const c=cv.getContext('2d'),checked=[];
   for(const preset of DEMO_PRESETS){const items=resolveDemoEquipment(preset.equipment).visualEquipment,hero=preset.hero==='baerbel'?'anni':preset.hero,hashes=new Set();
    for(const a of Object.values(redesignArt.catalog.assets).filter(a=>a.hero===hero))for(const f of a.frames){c.clearRect(0,0,240,240);drawLivePerson(c,hero,120,190,0,{artMagnify:4,artPose:f.pose,parry:f.pose==='parry'?.3:0,direction:f.direction,usingRanged:!!preset.ranged,visualEquipment:items});const d=c.getImageData(0,0,240,240).data;if(!d.some((v,i)=>i%4===3&&v))throw Error('Empty '+preset.id+' '+f.pose);for(let n=0;n<240;n++)for(const i of [n*4+3,(239*240+n)*4+3,(n*240)*4+3,(n*240+239)*4+3])if(d[i])throw Error('Clipped '+preset.id+' '+f.direction+' '+f.pose);hashes.add(cv.toDataURL());}
    checked.push({preset:preset.id,frames:128,unique:hashes.size});
   }
   return {checked,ready:redesignArt.ready,details:redesignArt.details.size};
  });
  for(const hero of ['dieter','anni','kevin'])for(const action of ['idle','walk','attack','ranged','rest','dead']){
   await p.evaluate(({hero,action})=>{Object.assign(redesignDemo.state,{hero,action,outfit:'theme',phase:action==='walk'?2:0,playing:false});redesignDemo.draw();},{hero,action});
   await p.locator('.stage').screenshot({path:folder+hero+'-'+action+'.png'});
  }
  await p.evaluate(()=>{Object.assign(redesignDemo.state,{hero:'dieter',action:'idle',outfit:'theme'});redesignDemo.draw();});await p.screenshot({path:folder+'desktop.png',fullPage:true});
  await p.locator('#outfit').selectOption('dieter-heavy');await p.locator('#action').selectOption('attack');await p.locator('.stage').screenshot({path:folder+'two-handed.png'});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:folder+'mobile.png',fullPage:true});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  await p.goto('http://127.0.0.1:4283/index.html');await p.waitForFunction(()=>window.game&&window.mertloch);await p.evaluate(()=>{game.tutorial.completed=true;game.events=[];document.querySelectorAll('[data-close]').forEach(e=>e.click());});
  const gameStats=await p.evaluate(async()=>{const a=await import('./redesign-art.js');return{ready:a.redesignArt.ready,pose:a.redesignPose(game.player)};});if(!gameStats.ready)throw Error('Production renderer not ready');
  await p.screenshot({path:folder+'game-mobile.png'});await p.setViewportSize({width:1440,height:1050});
  for(const hero of ['dieter','baerbel','kevin']){
   const switched=await p.evaluate(id=>{game.paused=false;return game.switchMember(id);},hero);if(!switched)throw Error('Cannot switch '+hero);
   await p.keyboard.down('d');await p.waitForTimeout(180);await p.keyboard.up('d');await p.screenshot({path:folder+'game-'+hero+'.png'});
  }
  await p.evaluate(()=>{game.paused=false;game.action('dash');});
  if(errors.length)throw Error(errors.join('\n'));return {stats,gameStats,mobileOverflow:false,errors};
 }finally{await context.close();}
}
