// Run with Playwright browser_run_code_unsafe(filename=...) while the project server runs on 4283.
async(page)=>{
 const folder='D:/Dev/MertlochChronicles-ui3/assets/theme-demo/review/';
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 try{
  await p.goto('http://127.0.0.1:4283/theme-demo.html');await p.waitForFunction(()=>window.themeDemo?.ready);
  const stats=await p.evaluate(()=>themeDemo.stats());if(stats.loadedImages!==18)throw Error('Missing images');
  const checked=[];
  for(const id of ['dieter-braumeister','anni-aperol','kevin-pfand']){
   await p.locator('[data-theme="'+id+'"]').click();
   for(let i=0;i<4;i++){
    await p.locator('#direction').selectOption(String(i));await p.locator('#lineup img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode()));});
    const state=await p.evaluate(()=>themeDemo.stats());if(state.selected!==id||state.direction!==i)throw Error('Selection mismatch');
    const broken=await p.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length);if(broken)throw Error('Broken view');checked.push(id+':'+i);
   }
   await p.locator('#direction').selectOption('0');await p.locator('#handwerk').screenshot({path:folder+'details-'+id+'.png'});
  }
  await p.locator('[data-theme="dieter-braumeister"]').click();await p.locator('#direction').selectOption('0');
  await p.screenshot({path:folder+'desktop.png',fullPage:true});
  for(const [direction,name] of [['0','kollektion'],['2','kollektion-ruecken']]){
   await p.locator('#direction').selectOption(direction);const download=p.waitForEvent('download');await p.locator('#export-lineup').click();await(await download).saveAs(folder+name+'.png');
  }
  await p.locator('#direction').selectOption('0');await p.locator('#world-zoom').selectOption('4');await p.locator('#world').screenshot({path:folder+'dorf-detail.png'});
  await p.locator('#world-zoom').selectOption('2');await p.locator('#world').screenshot({path:folder+'dorf-spielmassstab.png'});await p.locator('#vergleich').screenshot({path:folder+'pixelvergleich.png'});
  const worldDownload=p.waitForEvent('download');await p.locator('#export-world').click();await(await worldDownload).saveAs(folder+'dorf-export.png');
  await p.setViewportSize({width:390,height:844});await p.locator('header').scrollIntoViewIfNeeded();await p.waitForTimeout(150);
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  await p.screenshot({path:folder+'mobile.png'});await p.locator('[data-theme="anni-aperol"]').click();await p.locator('#direction').selectOption('3');
  if(await p.evaluate(()=>themeDemo.state.selected!=='anni-aperol'||themeDemo.state.direction!==3))throw Error('Mobile controls failed');
  if((await p.locator('body').innerText()).includes('Ã'))throw Error('Encoding regression');
  if(errors.length)throw Error(errors.join('\n'));
  return {stats,checked,mobileOverflow:false,errors};
 }finally{await context.close();}
}
