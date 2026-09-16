// Use with Playwright browser_run_code_unsafe filename. Local or public URL can be selected below.
async (page) => {
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://localhost:4173/maifeld-prototype.html');await page.waitForFunction(()=>window.maifeldPrototype?.ready);
 await page.locator('#menuButton').click();await page.locator('#inspectButton').click();await page.locator('#inspectActor').selectOption('keiler');
 await page.locator('#inspectSpeed').selectOption('3');await page.locator('#inspectPause').click();await page.locator('#inspectStep').click();
 if(!(await page.locator('#atlasDownload').getAttribute('href')).endsWith('keiler-rig.png'))throw Error('Inspector links obsolete walk atlas');
 const result=await page.evaluate(async()=>{
  const {drawBoar}=await import('./maifeld-boar-rig.js'),a=maifeldPrototype.art.keiler;
  const cv=document.createElement('canvas');cv.id='boarReview';cv.width=1280;cv.height=680;const c=cv.getContext('2d');
  c.fillStyle='#e5dbc1';c.fillRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=false;
  const sample=document.createElement('canvas');sample.width=sample.height=96;const sc=sample.getContext('2d'),rows=[];
  for(const [row,direction] of ['se','sw','ne','nw'].entries()){
   let body=null,maxChanges=0;const feet=new Set();
   for(let i=0;i<32;i++){
    sc.clearRect(0,0,96,96);drawBoar(sc,a.rigImage,a.rig,{direction,distance:i/32*a.rig.stride,moving:true},48,80,37);
    const pixels=sc.getImageData(0,43,96,18).data;let changes=0;if(body){for(let j=0;j<pixels.length;j++)if(pixels[j]!==body[j])changes++;}
    if(!body)body=new Uint8ClampedArray(pixels);maxChanges=Math.max(maxChanges,changes);
    feet.add(Array.from(sc.getImageData(0,73,96,8).data).join(','));
    if(i%4===0){const x=i/4*160+80,y=row*170+130;c.drawImage(sample,x-96,y-160,192,192);c.fillStyle='#394b40';c.font='12px monospace';c.fillText(direction+' '+(i/4+1),i/4*160+18,row*170+155);}
   }
   if(maxChanges!==0)throw Error(direction+' body pixels flicker: '+maxChanges);if(feet.size<16)throw Error(direction+' feet are not animated');
   rows.push({direction,bodyPixelChanges:maxChanges,distinctFootPoses:feet.size});
  }
  cv.style='position:fixed;z-index:1000;inset:0;width:1280px;height:680px';document.body.append(cv);return rows;
 });
 await page.locator('#boarReview').screenshot({path:'D:/Dev/MertlochChronicles/visual-review/boar-rig-phases.png'});
 await page.evaluate(()=>document.getElementById('boarReview').remove());
 await page.locator('#inspectPause').click();
 // Observe real wandering in the live simulation, without changing enemies or timers.
 const roaming=await page.evaluate(async()=>{
  const samples=[];for(let i=0;i<70;i++){const e=maifeldPrototype.trial.enemies[0];samples.push({moving:e.moving,x:e.x,y:e.y,direction:e.direction});await new Promise(r=>setTimeout(r,60));}
  return{travel:Math.hypot(samples.at(-1).x-samples[0].x,samples.at(-1).y-samples[0].y),transitions:samples.slice(1).filter((s,i)=>s.moving!==samples[i].moving).length};
 });
 if(roaming.transitions>8)throw Error('Roaming still chatters: '+JSON.stringify(roaming));
 await page.screenshot({path:'D:/Dev/MertlochChronicles/visual-review/boar-rig-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.maifeldPrototype?.ready);
 await page.locator('#menuButton').click();await page.locator('#inspectButton').click();await page.locator('#inspectActor').selectOption('keiler');
 if(!(await page.locator('body').getAttribute('class')).includes('touch'))throw Error('Mobile controls not selected');
 await page.screenshot({path:'D:/Dev/MertlochChronicles/visual-review/boar-rig-mobile.png'});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 if(errors.length)throw Error(errors.join('\n'));
 return{rows:result,roaming,consoleErrors:errors};
}
