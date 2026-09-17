// Run with Playwright browser_run_code_unsafe(filename=...). Uses an isolated context.
async (page, {baseURL='http://localhost:4187/', outputDir='D:/Dev/MertlochChronicles-art/visual-review'}={}) => {
 const context=await page.context().browser().newContext({viewport:{width:1500,height:1100},serviceWorkers:'block'});
 const p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await p.goto(baseURL.replace(/\/$/,'')+'/art-handoff.html');
 await p.waitForFunction(()=>window.handoff);
 const stats=await p.evaluate(()=>({assets:window.handoff.previews,missing:window.handoff.catalog.missing,frames:Object.values(window.handoff.catalog.assets).reduce((n,a)=>n+(a.frames?.length||0),0)}));
 if(stats.missing.length)throw Error('Missing assets: '+stats.missing.join(', '));
 await p.locator('#animate').uncheck();
 for(const kind of ['ui','heroes','npcs','enemies','bosses','items','talents','props']){
  await p.locator('#kind').selectOption(kind);
  await p.locator('#direction').selectOption('0');await p.locator('#motion').selectOption('idle');
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.screenshot({path:outputDir+'/'+kind+'-front.png',fullPage:true});
 }
 for(const kind of ['heroes','npcs','enemies','bosses']){
  await p.locator('#kind').selectOption(kind);
  for(const row of ['0','1','2','3'])for(const mode of ['walk','attack','phase']){
   await p.locator('#direction').selectOption(row);await p.locator('#motion').selectOption(mode);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   if(row==='2'&&mode==='attack'||row==='0'&&mode==='phase')await p.screenshot({path:outputDir+'/'+kind+'-'+row+'-'+mode+'.png',fullPage:true});
  }
 }
 await p.locator('#kind').selectOption('heroes');await p.locator('#motion').selectOption('walk');await p.locator('#animate').check();
 const before=await p.locator('article[data-id="dieter-walk"] canvas').evaluate(c=>c.toDataURL());
 await p.waitForTimeout(230);
 const after=await p.locator('article[data-id="dieter-walk"] canvas').evaluate(c=>c.toDataURL());
 if(before===after)throw Error('Walking preview did not advance');
 await p.setViewportSize({width:390,height:844});await p.locator('#kind').selectOption('ui');
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile horizontal overflow');
 await p.screenshot({path:outputDir+'/mobile-ui.png'});
 if(errors.length)throw Error(errors.join('\n'));
 await context.close();return {...stats,desktop:true,mobile:true,animationAdvances:true,errors};
}
