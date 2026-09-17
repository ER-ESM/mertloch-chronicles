async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const p=await context.newPage(),errors=[],out='D:/Dev/MertlochChronicles-art/visual-review/';
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await p.goto('http://localhost:4187/');await p.waitForFunction(()=>window.game?.world);
 await p.evaluate(async()=>{await (await import('./content-art.js')).loadContentArt();game.player.hp=999999;game.tutorial.completed=true;game.player.x=game.world.spawn.x;game.player.y=game.world.spawn.y;game.switchMember('baerbel');const {Renderer}=await import('./renderer.js'),draw=Renderer.prototype.draw;Renderer.prototype.draw=function(){window.reviewRenderer=this;return draw.call(this);};});
 await p.waitForFunction(()=>window.reviewRenderer);
 await p.locator('[data-window-close]').evaluateAll(ns=>ns.forEach(n=>n.click()));
 const places=['base-0','base-max','kiosk','chapter-2-boss','chapter-3-boss','chapter-4-boss'];
 for(const id of places){
  await p.evaluate(id=>{const w=game.world,place=id.startsWith('base')?w.base:id==='kiosk'?w.places.kiosk:w.camps.find(c=>c.id===id);
   if(id==='base-max')for(const[k,s]of Object.entries(w.base.stageProps))game.buildings[k]=s.stages.at(-1).stage;
   game.player.x=place.x;game.player.y=place.y+55;game.player.invulnerable=0;game.player.hp=999999;game.target=null;Object.assign(reviewRenderer.camera,{x:game.player.x,y:game.player.y});reviewRenderer.draw();
  },id);
  await p.waitForTimeout(750);const arrived=await p.evaluate(id=>{const w=game.world,t=id.startsWith('base')?w.base:id==='kiosk'?w.places.kiosk:w.camps.find(c=>c.id===id);return Math.hypot(game.player.x-t.x,game.player.y-t.y-55)<15;},id);if(!arrived)throw Error('Did not arrive at '+id);await p.screenshot({path:out+'gap-world-'+id+'.png'});
 }
 const before=await p.evaluate(()=>({x:game.player.x,y:game.player.y}));
 await p.keyboard.down('d');await p.waitForTimeout(600);await p.keyboard.up('d');
 const after=await p.evaluate(()=>({x:game.player.x,y:game.player.y,classId:game.player.classId}));
 if(Math.hypot(after.x-before.x,after.y-before.y)<1)throw Error('Hero did not move');
 await p.evaluate(async()=>{
  const {contentActor,contentFrame,contentAsset}=await import('./content-art.js');
  const host=document.createElement('div');host.id='gap-review';host.style='position:fixed;inset:0;z-index:999999;background:#344936;overflow:auto;padding:20px;color:#ffe6af;font:16px sans-serif';
  for(const id of ['anni','warden','badger','goose','boar']){
   const title=document.createElement('p');title.textContent=id+' · 4 Richtungen / 8 Laufphasen';host.append(title);
   const a=contentActor(id),cv=document.createElement('canvas');cv.dataset.walk=id;cv.width=8*144;cv.height=4*144;cv.style='image-rendering:pixelated;display:block';const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
   for(let row=0;row<4;row++)for(let step=0;step<8;step++){const f=contentFrame(a,row,{moving:true,walkDistance:(step+.1)*a.stride/8});c.drawImage(f.image,f.frame.x,f.frame.y,96,96,step*144,row*144,144,144);}host.append(cv);
  }
  for(const id of ['portrait-pit','ui-tab-bude']){const a=contentAsset(id),im=document.createElement('img');im.src=a.image.src;im.width=a.meta.width*4;im.height=a.meta.height*4;im.style='image-rendering:pixelated;margin:16px';host.append(im);}
  document.body.append(host);
 });
 await p.locator('#gap-review').evaluate(e=>{e.style.position='relative';e.style.inset='auto';document.body.style.overflow='auto';});
 for(const id of ['anni','warden','badger','goose','boar'])await p.locator('[data-walk='+id+']').screenshot({path:out+'gap-walk-'+id+'.png'});
 await p.locator('#gap-review').screenshot({path:out+'gap-walk-contact.png'});
 if(errors.length)throw Error(errors.join('\n'));
 await context.close();return{places,hero:after.classId,moved:true,errors};
}
