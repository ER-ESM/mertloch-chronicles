async(page)=>{
 const browser=page.context().browser(),results=[],root='D:/Dev/MertlochChronicles-art/visual-review/';
 for(const device of [{name:'desktop',viewport:{width:1440,height:900}},{name:'phone',viewport:{width:390,height:844},isMobile:true,hasTouch:true},{name:'landscape',viewport:{width:844,height:390},isMobile:true,hasTouch:true}]){
  const c=await browser.newContext({...device,serviceWorkers:'block'}),p=await c.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:4187/');await p.waitForFunction(()=>window.mertloch);
  await p.locator('[data-window-close]').first().click();
  // Use the actual input/UI paths; only trigger setup is injected, no progression or saves are shipped.
  await p.keyboard.press('b');
  const locked=await p.locator('.memory-panel img').count();
  if(locked!==0)throw Error('Locked illustrations leaked');
  await p.locator('.popup-base [data-window-close]').click();
  const ids=await p.evaluate(async()=>{const {MEMORY_FRAGMENTS}=await import('./content/memories.js');for(const m of MEMORY_FRAGMENTS)window.game.memoryEvent(m.trigger);return MEMORY_FRAGMENTS.map(m=>m.id);});
  const checked=[];
  for(const id of ids){
   const img=p.locator('.popup-memory img');await img.waitFor();await img.evaluate(el=>el.decode());
   const src=await img.getAttribute('src');if(!src.endsWith('/'+id+'.png'))throw Error('Queue mismatch '+id+' '+src);
   if(['stempel','wurst-ins-gesicht'].includes(id))await p.screenshot({path:root+'memory-'+device.name+'-'+id+'.png'});
   if(id==='stempel'){
    await p.locator('.popup-memory [data-memory-art]').click();await p.locator('.popup-memoryart img').evaluate(el=>el.decode());
    await p.screenshot({path:root+'memory-'+device.name+'-large.png'});
    await p.locator('[data-memory-zoom]').check();
    const zoom=await p.locator('.memory-image-viewport').evaluate(el=>{el.scrollLeft=200;return{natural:el.querySelector('img').naturalWidth,width:el.clientWidth,content:el.scrollWidth,scrolled:el.scrollLeft};});
    if(device.name!=='desktop'&&zoom.scrolled<=0)throw Error('Mobile zoom cannot pan');
    const time=await p.evaluate(()=>window.game.time);await p.waitForTimeout(250);
    if(!await p.evaluate(t=>window.game.time>t&&!window.game.paused,time))throw Error('Image paused gameplay');
    await p.locator('.popup-memoryart [data-window-close]').click();
   }
   await p.locator('[data-memory-next]').click();checked.push(id);
  }
  await p.keyboard.press('b');await p.locator('.memory-panel').waitFor();
  const images=await p.locator('.memory-panel img').count();if(images!==ids.length)throw Error('Missing journal images');
  await p.locator('.memory-panel [data-memory-art="die-kiste"]').click();
  await p.locator('.popup-memoryart img').evaluate(el=>el.decode());
  const layout=await p.evaluate(()=>{const w=document.querySelector('.popup-memoryart'),b=w.querySelector('.popup-body'),r=w.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,viewport:innerWidth,overflow:b.scrollWidth-b.clientWidth,paused:window.game.paused};});
  if(layout.x<0||layout.x+layout.width>layout.viewport+1||layout.overflow>1)throw Error('Horizontal overflow '+JSON.stringify(layout));
  await p.screenshot({path:root+'memory-'+device.name+'-journal-detail.png'});
  results.push({device:device.name,locked,checked,images,layout,errors});
  await c.close();
 }
 return results;
}
