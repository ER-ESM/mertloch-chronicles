// Run with the Playwright browser_run_code tool. Uses an isolated save and no service worker.
async(page)=>{
 const out='D:/Dev/MertlochChronicles-art/visual-review/',browser=page.context().browser();
 const ctx=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];
 p.setDefaultTimeout(30000);p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://localhost:4187/?environment-final');await p.waitForFunction(()=>window.game?.world);
  await p.evaluate(async()=>{
   game.tutorial.completed=true;game.memories.seen=['stempel'];const {Renderer}=await import('./renderer.js'),draw=Renderer.prototype.draw;
   Renderer.prototype.draw=function(){window.envRenderer=this;draw.call(this);
    if(!window.collisionOverlay)return;const c=this.ctx,ox=Math.round((this.camera.x-this.viewWidth/2)*2)/2,oy=Math.round((this.camera.y-this.viewHeight/2)*2)/2;
    c.save();c.setTransform(4,0,0,4,-ox*4,-oy*4);c.lineWidth=.75;
    for(const b of this.world.buildings){if(b.maxX<ox||b.minX>ox+this.viewWidth||b.maxY<oy||b.minY>oy+this.viewHeight)continue;
     c.fillStyle='#f27d6833';c.fillRect(b.minX,b.minY,b.w,b.h);c.strokeStyle='#fa9e82';c.strokeRect(b.minX,b.minY,b.w,b.h);
     c.strokeStyle='#a9ff9b';c.beginPath();c.arc(b.door.x,b.door.y,9,0,Math.PI*2);c.stroke();
    }c.restore();
   };
  });await p.waitForFunction(()=>window.envRenderer);await p.waitForTimeout(500);
  await p.locator('[data-window-close]').evaluateAll(ns=>ns.forEach(n=>n.click()));
  const understood=p.getByRole('button',{name:'VERSTANDEN',exact:true});if(await understood.isVisible())await understood.click();
  const scenes=[['plaza',9348,8688],['field-junction',10614,15352],['crops',13747,8598],['bank',3800,9487],['houses',9580,8930],['road-dirt',9426,8399]];
  for(const[name,x,y]of scenes){
   await p.evaluate(([x,y])=>{Object.assign(game.player,{...game.world.findClear(x,y,9),hp:99999,vx:0,vy:0,inCombat:0});game.target=null;game.moveTo=null;game.path=[];Object.assign(envRenderer.camera,game.player);envRenderer.draw();},[x,y]);
   await p.screenshot({path:out+'environment-final-'+name+'.png'});
  }
  const collision=await p.evaluate(()=>{
   const b=game.world.buildings.filter(b=>!b.church).sort((a,b)=>Math.hypot(a.x-game.world.spawn.x,a.y-game.world.spawn.y)-Math.hypot(b.x-game.world.spawn.x,b.y-game.world.spawn.y))[0];
   const start={x:b.door.x,y:b.maxY+18};Object.assign(game.player,start,{vx:0,vy:0,hp:99999});Object.assign(envRenderer.camera,start);window.collisionOverlay=true;return {id:b.id,maxY:b.maxY,start};
  });await p.keyboard.down('w');await p.waitForTimeout(650);await p.keyboard.up('w');
  const stop=await p.evaluate(()=>({x:game.player.x,y:game.player.y,blocked:game.world.blocked(game.player.x,game.player.y,5)}));
  if(stop.blocked||stop.y<collision.maxY+5-.001||stop.y>=collision.start.y)throw Error('Held-key wall collision failed '+JSON.stringify(stop));
  await p.screenshot({path:out+'environment-collision.png'});await p.evaluate(()=>window.collisionOverlay=false);
  const seams=await p.evaluate(async()=>{
   const {createTerrainChunk,createTerrainRegion,DETAIL}=await import('./terrain.js');const result=[];
   for(const [gx,gy]of [[18,16],[26,16],[7,18]]){
    const x=(gx+1)*512,y=(gy+1)*512,size=128,start=performance.now(),reference=createTerrainRegion(game.world,x-64,y-64,size).getContext('2d').getImageData(0,0,size*DETAIL,size*DETAIL).data;
    const assembled=document.createElement('canvas');assembled.width=assembled.height=size*DETAIL;const c=assembled.getContext('2d');
    for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)c.drawImage(createTerrainChunk(game.world,gx+dx,gy+dy),(dx*512-448)*DETAIL,(dy*512-448)*DETAIL);
    const actual=c.getImageData(0,0,assembled.width,assembled.height).data;let delta=0,max=0,large=0;
    for(let i=0;i<actual.length;i+=4){let d=0;for(let k=0;k<3;k++)d+=Math.abs(actual[i+k]-reference[i+k]);delta+=d;max=Math.max(max,d);if(d>30)large++;}
    result.push({gx,gy,meanChannelDelta:delta/(size*DETAIL)**2/3,maxPixelDelta:max,largePixels:large,ms:Math.round(performance.now()-start)});
   }return result;
  });
  if(seams.some(s=>s.meanChannelDelta>.6||s.largePixels>100))throw Error('Terrain seam regression '+JSON.stringify(seams));
  const world=await p.evaluate(()=>({houses:game.world.buildings.length,doorsReachable:game.world.report.doorRoutes.filter(r=>r.reachable).length,details:game.world.details.length,finalRejected:game.world.dressingReport.finalRejected}));
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'block'});
  try{const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));await m.goto('http://localhost:4187/');await m.waitForFunction(()=>window.game?.world);
   await m.evaluate(()=>{game.tutorial.completed=true;game.memories.seen=['stempel'];});await m.waitForTimeout(500);await m.locator('[data-window-close]').evaluateAll(ns=>ns.forEach(n=>n.click()));
   await m.screenshot({path:out+'environment-mobile.png'});if(!await m.evaluate(()=>document.body.classList.contains('touch-mode')))throw Error('Mobile controls missing');
  }finally{await mobile.close();}
  if(errors.length)throw Error(errors.join('\n'));return {world,collision:{...collision,stop},seams,scenes:scenes.map(s=>s[0]),mobile:true,errors};
 }finally{await ctx.close();}
}
