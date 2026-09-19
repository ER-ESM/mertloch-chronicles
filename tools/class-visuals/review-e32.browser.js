async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const folder='D:/Dev/MertlochChronicles-ui3/assets/content-art/e32/review/';
 try{
  await p.goto('http://127.0.0.1:4283/');await p.waitForFunction(()=>window.__mertloch);
  const result=await p.evaluate(async()=>{
   const {e32Art,paintE32Talent,paintE32Skill}=await import('/e32-art.js'),{styleIcon}=await import('/art-style.js');
   const c=document.createElement('canvas');c.width=c.height=64;let talents=0,skills=0;
   for(const id of Object.keys(e32Art.catalog.talents)){if(!paintE32Talent(c,id))throw Error('Missing '+id);const before=c.toDataURL();styleIcon(c);if(before!==c.toDataURL())throw Error('Precision icon resampled '+id);talents++;}
   for(const key of Object.keys(e32Art.catalog.skills)){const [spec,id]=key.split('/');if(!paintE32Skill(c,spec,id,id==='variant'))throw Error('Missing '+key);skills++;}
   const {game:g}=window.__mertloch;g.tutorial.completed=true;g.paused=false;g.player.level=30;g.trainingXp=100000;g.player.inCombat=0;g.atHub=()=>true;g.enemies=[];g.fx=[];g.fields=[];
   for(const el of document.querySelectorAll('.game-popup'))el.remove();
   const {changeSpec}=await import('/talents.js'),{onGroundMech,burstMultiplier}=await import('/spec-mechanics.js'),{combatStats}=await import('/rpg.js');
   changeSpec(g,'dieter-brew');const cs=combatStats(g),point={x:g.player.x+35,y:g.player.y+10};onGroundMech(g,g.skills.find(s=>s.id==='ground'),point,cs);g.fields[0].sort='bock';g.paused=true;
   window.e32Review={g,changeSpec,onGroundMech,burstMultiplier,combatStats,point};return {talents,skills,fields:g.fields.length};
  });
  await p.waitForTimeout(100);await p.screenshot({path:folder+'production-barrel.png'});
  await p.evaluate(()=>{const {g,burstMultiplier,combatStats}=window.e32Review;burstMultiplier(g,{x:g.player.x+30,y:g.player.y,hp:100},combatStats(g));g.fx.forEach(f=>f.life=f.max*.5);});
  await p.waitForTimeout(60);await p.screenshot({path:folder+'production-tap.png'});
  await p.evaluate(()=>{const r=window.e32Review;r.g.paused=false;r.g.switchMember('kevin');r.changeSpec(r.g,'kevin-iron');r.g.fields=[];r.g.fx=[];r.onGroundMech(r.g,r.g.skills.find(s=>s.id==='ground'),r.point,r.combatStats(r.g));r.g.paused=true;});
  await p.waitForTimeout(100);await p.screenshot({path:folder+'production-robot.png'});
  await p.evaluate(async()=>{const {g}=window.e32Review;g.paused=false;g.switchMember('dieter');window.e32Review.changeSpec(g,'dieter-brew');g.paused=true;const {talentsPanel}=await import('/talent-ui.js'),{paintTalentIcons}=await import('/talent-art.js');const tree=document.createElement('section');tree.id='review-tree';tree.style='position:fixed;z-index:99999;top:20px;left:350px;width:600px;height:950px;overflow:auto;padding:16px;background:#203b2e';tree.innerHTML=talentsPanel(g);document.body.append(tree);paintTalentIcons(tree);});
  await p.locator('#review-tree').screenshot({path:folder+'talent-tree.png'});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{document.body.classList.add('touch-mode');const el=document.getElementById('review-tree');el.style.left='10px';el.style.width='370px';el.style.height='810px';});
  await p.locator('#review-tree').screenshot({path:folder+'talent-mobile.png'});
  result.mobile=await p.locator('.path-tree').evaluate(el=>({scrollable:el.scrollWidth>el.clientWidth,nodeWidth:el.querySelector('.branch-node').getBoundingClientRect().width}));
  await p.evaluate(()=>{document.getElementById('review-tree').remove();const {g,changeSpec}=window.e32Review;g.paused=false;g.atHub=()=>true;g.player.inCombat=0;changeSpec(g,'dieter-brawl');g.classState.m={...g.classState.m,stack:7,stackUntil:g.time+8};});
  const checkHud=()=>{const rect=id=>document.querySelector(id).getBoundingClientRect(),cv=rect('#classMechanicArt'),panel=rect('.player-panel'),top=rect('.touch-topline'),buff=rect('#buffStrip');const separate=(a,b)=>!a.width||!b.width||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;return {contained:cv.bottom<=panel.bottom&&cv.left>=panel.left&&cv.right<=panel.right,toplineClear:separate(top,panel),buffClear:separate(buff,panel)&&separate(buff,top),overflow:document.documentElement.scrollWidth>innerWidth};};
  result.hud={};
  for(const [name,width,height] of [['mobile',390,844],['landscape',844,390]]){await p.setViewportSize({width,height});await p.waitForTimeout(300);const check=await p.evaluate(checkHud);if(!check.contained||!check.toplineClear||!check.buffClear||check.overflow)throw Error('HUD overlap '+name+JSON.stringify(check));result.hud[name]=check;await p.screenshot({path:folder+'production-'+name+'-hud.png'});}
  await p.setViewportSize({width:390,height:844});
  await p.goto('http://127.0.0.1:4283/gait-review.html');await p.waitForFunction(()=>window.gaitReview);
  result.gaits=await p.evaluate(()=>{let count=0;for(const id of window.gaitReview.people)for(let phase=0;phase<8;phase++){window.gaitReview.set(id,phase);count++;}return count;});
  await p.evaluate(()=>window.gaitReview.set('kevin',4));await p.screenshot({path:folder+'gait-mobile.png',fullPage:true});
  result.pageOverflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(errors.length)throw Error(errors.join('\n'));return {...result,errors};
 }finally{await context.close();}
}
