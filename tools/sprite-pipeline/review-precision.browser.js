async(page)=>{
 const out='D:/Dev/MertlochChronicles-art/visual-review/',ctx=await page.context().browser().newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),p=await ctx.newPage(),errors=[],members=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await p.goto('http://localhost:4187/');await p.waitForFunction(()=>window.game?.world);
 await p.evaluate(async()=>{game.tutorial.completed=true;const {Renderer}=await import('./renderer.js'),draw=Renderer.prototype.draw;Renderer.prototype.draw=function(){window.reviewRenderer=this;return draw.call(this);};});await p.waitForFunction(()=>window.reviewRenderer);
 await p.locator('[data-window-close]').evaluateAll(ns=>ns.forEach(n=>n.click()));
 for(const id of ['dieter','baerbel','kevin']){
  await p.evaluate(id=>{game.target=null;game.player.hp=999999;game.player.inCombat=0;game.player.x=game.world.spawn.x;game.player.y=game.world.spawn.y;game.switchMember(id);Object.assign(reviewRenderer.camera,{x:game.player.x,y:game.player.y});reviewRenderer.draw();},id);
  const before=await p.evaluate(()=>game.player.walkDistance||0);await p.keyboard.down('d');await p.waitForTimeout(500);await p.screenshot({path:out+'precision-world-'+id+'.png'});await p.keyboard.up('d');
  const result=await p.evaluate(async()=>{const a=await import('./content-art.js');return{member:game.player.classId,d:game.player.walkDistance,loaded:a.contentArt.images.size,declared:Object.keys(a.contentArt.catalog.assets).length};});if(result.member!==id||result.d<=before||result.loaded!==result.declared)throw Error(JSON.stringify(result));members.push(result);
 }
 await p.evaluate(async()=>{
  const {drawLivePerson}=await import('./live-art.js'),{equipmentAppearance}=await import('./equipment-appearance.js'),{ITEMS}=await import('./rpg.js');
  const cv=document.createElement('canvas');cv.id='gear-review';cv.width=4*192;cv.height=3*192;cv.style='position:fixed;inset:20px;z-index:99999;image-rendering:pixelated;width:768px;height:576px';const c=cv.getContext('2d');c.fillStyle='#354b36';c.fillRect(0,0,cv.width,cv.height);
  const items=equipmentAppearance({weapon:'flasche',offhand:'topfdeckel',ranged:'pfandschleuder',body:'kutte'},ITEMS);if(items.length!==4)throw Error('Gear preview did not resolve four equipped items');
  for(const[row,id]of ['dieter','baerbel','kevin'].entries())for(const[col,direction]of ['se','sw','ne','nw'].entries()){drawLivePerson(c,id,col*192+96,row*192+160,0,{direction,artMagnify:4,visualEquipment:items,moving:true,walkDistance:18},1);c.fillStyle='#fff2d6';c.font='12px sans-serif';c.fillText(id+' '+direction,col*192+12,row*192+182);}document.body.append(cv);
 });await p.locator('#gear-review').screenshot({path:out+'precision-gear.png'});
 await ctx.close();
 const mobile=await page.context().browser().newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'block'}),m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));await m.goto('http://localhost:4187/');await m.waitForFunction(()=>window.game?.world);await m.locator('[data-window-close]').evaluateAll(ns=>ns.forEach(n=>n.click()));await m.screenshot({path:out+'precision-mobile.png'});const touch=await m.evaluate(()=>document.body.classList.contains('touch-mode'));if(!touch)throw Error('Mobile controls missing');await mobile.close();if(errors.length)throw Error(errors.join('\n'));return{members,touch,errors};
}
