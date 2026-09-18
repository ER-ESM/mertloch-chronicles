async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1560,height:950},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4283/redesign-demo.html');await p.waitForFunction(()=>window.redesignDemo?.ready);
  await p.locator('#armor').check();
  const slots=await p.evaluate(()=>redesignDemo.player().visualEquipment.map(i=>i.slot));
  if(!['legs','hands','wrists'].every(slot=>slots.includes(slot)))throw Error('Armor control did not equip generated items');
  await p.setViewportSize({width:390,height:844});
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  await p.screenshot({path:'D:/Dev/MertlochChronicles-ui3/assets/redesign/review/gear-mobile.png',fullPage:true});await p.setViewportSize({width:1560,height:950});
  const stats=await p.evaluate(async()=>{
   const {drawLivePerson}=await import('./live-art.js'),{redesignArt}=await import('./redesign-art.js');redesignDemo.state.playing=false;
   const cv=document.createElement('canvas');cv.id='gear-audit';cv.width=1536;cv.height=690;cv.style.cssText='position:absolute;top:0;left:0;z-index:9999;max-width:none';document.body.append(cv);
   const c=cv.getContext('2d'),gear=[{slot:'legs',asset:'trouser'},{slot:'feet',asset:'boot'},{slot:'hands',asset:'glove'},{slot:'ring1',asset:'ring'},{slot:'weapon',asset:'maul',hands:2}];
   function draw(){c.fillStyle='#263a31';c.fillRect(0,0,cv.width,cv.height);for(const [h,hero]of ['dieter','anni','kevin'].entries())for(const [d,direction]of ['se','sw','ne','nw'].entries())for(const [n,phase]of [2,6].entries()){const x=(d*2+n)*192;drawLivePerson(c,hero,x+96,h*230+194,0,{artMagnify:4,artPose:'walk-'+phase,direction,visualEquipment:gear});c.fillStyle='#eedbb3';c.font='12px sans-serif';c.fillText(hero+' '+direction+' '+phase,x+16,h*230+217);}}
   draw();redesignArt.changed=draw;
   // Verify actual equipped pieces throughout both walking matrices, including unused inventory slots.
   const check=document.createElement('canvas');check.width=check.height=240;const ctx=check.getContext('2d');let rendered=0;
   for(const a of Object.values(redesignArt.catalog.assets))for(const f of a.frames){
    ctx.clearRect(0,0,240,240);drawLivePerson(ctx,a.hero,120,194,0,{artMagnify:4,artPose:f.pose,direction:f.direction,visualEquipment:gear.map(i=>i.slot==='weapon'?{...i,hands:a.state.startsWith('heavy')?2:1}:i)});
    const pixels=ctx.getImageData(0,0,240,240).data;
    if(!pixels.some((v,i)=>i%4===3&&v))throw Error('Empty '+a.hero+' '+f.pose);
    for(let n=0;n<240;n++)for(const i of [n*4+3,(239*240+n)*4+3,(n*240)*4+3,(n*240+239)*4+3])if(pixels[i])throw Error('Clipped '+a.hero+' '+f.pose);
    rendered++;
   }
   draw();return {rendered};
  });
  await p.waitForFunction(async()=>{const {redesignArt:a}=await import('./redesign-art.js');return ['dieter','anni','kevin'].every(id=>a.details.has(id+'-heavywalk'));});
  await p.locator('#gear-audit').screenshot({path:'D:/Dev/MertlochChronicles-ui3/assets/redesign/review/gear-joints-after.png'});
  if(errors.length)throw Error(errors.join('\n'));return {...stats,errors};
 }finally{await context.close();}
}
