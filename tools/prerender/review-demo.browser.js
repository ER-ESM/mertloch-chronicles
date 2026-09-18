// Run through Playwright browser_run_code_unsafe(filename=...). Local server: PORT=4283 node server.mjs.
async(page)=>{
 const out='D:/Dev/MertlochChronicles-ui3/assets/prerender/review/';
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
 const p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 try{
  await p.goto('http://127.0.0.1:4283/prerender-demo.html');await p.waitForFunction(()=>window.prerenderDemo?.ready);
  await p.locator('#pause').click();await p.locator('#action').selectOption('idle');
  const stats=await p.evaluate(()=>prerenderDemo.stats());if(stats.loaded!==stats.expected||stats.loaded!==216)throw Error('Missing sheets');
  const variants=await p.evaluate(async()=>{
   const {DEMO_PRESETS}=await import('./prerender-demo-presets.js'),result=[];
   for(const preset of DEMO_PRESETS){prerenderDemo.choosePreset(preset.id);const hashes=new Set();for(const direction of ['se','sw','ne','nw'])for(const action of ['idle','walk','attack','hit','rest']){
    Object.assign(prerenderDemo.state,{direction,action,distance:18,time:.5});prerenderDemo.draw();const canvas=document.querySelector('#portrait');const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;if(!pixels.some((v,i)=>i%4===3&&v>0))throw Error('Empty '+preset.id);hashes.add(canvas.toDataURL());
    for(const cv of [canvas,...document.querySelectorAll('#directions canvas')]){const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,alpha=(x,y)=>d[(y*w+x)*4+3];if(Array.from({length:w},(_,x)=>alpha(x,0)||alpha(x,h-1)).some(Boolean)||Array.from({length:h},(_,y)=>alpha(0,y)||alpha(w-1,y)).some(Boolean))throw Error('Clipped preview: '+preset.id+' '+direction+' '+action);}
   }if(hashes.size<16)throw Error('Repeated directions/poses '+preset.id);result.push({id:preset.id,unique:hashes.size});}return result;
  });
  await p.evaluate(()=>{prerenderDemo.choosePreset('dieter-start');Object.assign(prerenderDemo.state,{direction:'se',action:'idle'});});
  await p.locator('#direction').selectOption('se');await p.locator('#action').selectOption('idle');
  await p.screenshot({path:out+'demo-desktop.png',fullPage:true});
  for(const [action,direction,name] of [['idle','se','neun-sets-vorne'],['idle','nw','neun-sets-hinten'],['attack','sw','neun-sets-angriff'],['walk','se','neun-sets-laufen']]){
   await p.locator('#action').selectOption(action);await p.locator('#direction').selectOption(direction);
   const downloadPromise=p.waitForEvent('download');await p.locator('#download-grid').click();await (await downloadPromise).saveAs(out+name+'.png');
  }
  // The active weapon mode must visibly change the rendered composite.
  await p.evaluate(()=>prerenderDemo.choosePreset('anni-spray'));await p.locator('#action').selectOption('idle');
  const ranged=await p.locator('#portrait').evaluate(c=>c.toDataURL());await p.locator('[data-mode=melee]').click();
  if(ranged===await p.locator('#portrait').evaluate(c=>c.toDataURL()))throw Error('Weapon mode has no visual effect');
  await p.locator('summary').click();await p.locator('[data-slot=weapon]').selectOption('tresenhammer');
  if(await p.evaluate(()=>!!prerenderDemo.outfits.get('baerbel').equipment.offhand))throw Error('Two-handed weapon retained shield');
  await p.locator('summary').click();await p.locator('#pause').click();
  await p.locator('#scene').focus();const before=await p.evaluate(()=>prerenderDemo.stats().positions.find(([id])=>id==='baerbel')[1].x);
  await p.keyboard.down('d');await p.waitForTimeout(220);await p.keyboard.up('d');
  const after=await p.evaluate(()=>prerenderDemo.stats().positions.find(([id])=>id==='baerbel')[1].x);if(after<=before)throw Error('Keyboard movement failed');
  await p.locator('#pause').click();await p.evaluate(()=>prerenderDemo.choosePreset('dieter-tank'));await p.locator('#direction').selectOption('sw');await p.locator('#action').selectOption('idle');
  await p.locator('#zoom').selectOption('4');await p.locator('#scene').screenshot({path:out+'dorfplatz-detail.png'});
  const downloadPromise=p.waitForEvent('download');await p.locator('#download-scene').click();await (await downloadPromise).saveAs(out+'dorfplatz-export.png');
  await p.setViewportSize({width:390,height:844});await p.locator('#zoom').selectOption('2');
  await p.waitForTimeout(150);
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Mobile horizontal overflow');
  await p.locator('#scene').click({position:{x:210,y:295}});await p.locator('#pause').click();await p.waitForTimeout(200);await p.locator('#pause').click();
  await p.locator('header').scrollIntoViewIfNeeded();await p.screenshot({path:out+'demo-mobile.png'});
  if(errors.length)throw Error(errors.join('\n'));
  return {loaded:stats.loaded,variants,keyboardMovement:after-before,mobileOverflow:overflow,errors};
 }finally{await context.close();}
}
