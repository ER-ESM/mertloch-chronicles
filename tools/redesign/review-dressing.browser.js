async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1600,height:1000},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 const folder='D:/Dev/MertlochChronicles-ui3/assets/redesign/review/dressing/';
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4283/redesign-demo.html');await p.waitForFunction(()=>window.redesignDemo?.ready);
  const result=await p.evaluate(async()=>{
   const {redesignArt:a,drawRedesignPerson:draw}=await import('/redesign-art.js');
   await Promise.all(Object.entries(a.catalog.assets).map(async([id,m])=>{const im=new Image();im.src='/'+m.baseDetailPath;await im.decode();a.details.set(id,im);}));
   const cv=document.createElement('canvas');cv.width=1600;cv.height=1000;cv.id='dressing';cv.style='position:absolute;inset:0;z-index:9999;max-width:none';document.body.append(cv);const c=cv.getContext('2d');
   const items=[{slot:'body',asset:'jacket'},{slot:'legs',asset:'trouser'},{slot:'feet',asset:'boot'}],dirs=['se','sw','ne','nw'];
   const b=document.createElement('canvas');b.width=b.height=384;const g=b.getContext('2d'),render=(hero,pose,extra=[])=>{g.clearRect(0,0,384,384);draw(g,hero,192,320,{...pose,visualEquipment:[...(pose.visualEquipment||[]),...extra]},8);return g.getImageData(0,0,384,384).data;};
   let checked=0;
   for(const asset of Object.values(a.catalog.assets))for(const f of asset.frames){
    const pose={direction:f.direction,artPose:f.pose,visualEquipment:asset.state.startsWith('heavy')?[{slot:'weapon',asset:'maul',hands:2}]:[]},base=render(asset.hero,pose);
    for(const item of items){const worn=render(asset.hero,pose,[item]);let n=0;for(let i=0;i<base.length;i++)if(base[i]!==worn[i])n++;if(n<10&&f.base.wearRuns[item.slot].length)throw Error('Invisible '+item.slot+' '+asset.hero+' '+f.direction+' '+f.pose);}
    const restored=render(asset.hero,pose);if(base.some((v,i)=>v!==restored[i]))throw Error('Unequip leaks '+asset.hero+' '+f.pose);checked++;
   }
   window.dressingReview={draw(hero,mode){c.fillStyle='#22382e';c.fillRect(0,0,1600,1000);for(let row=0;row<4;row++)for(let col=0;col<8;col++){
    const stage=mode==='stages'?col%4:(col%2?3:0),pose=mode==='stages'?'idle':mode==='walk'?'walk-'+col:mode==='poses'?a.catalog.assets[hero+'-poses'].columns[col]:['anticipation','impact','cast','dead'][Math.floor(col/2)],direction=dirs[row];
    draw(c,hero,100+col*200,210+row*250,{direction,artPose:pose,visualEquipment:items.slice(0,stage)},6.8);
    c.fillStyle='#ead8b0';c.font='13px sans-serif';c.fillText(direction+' '+(mode==='stages'?['Start','Kutte','+ Hose','+ Schuhe'][stage]:pose+' '+(stage?'angelegt':'abgelegt')),10+col*200,238+row*250);
   }}};return {checked,slotComparisons:checked*3};
  });
  for(const hero of ['dieter','anni','kevin'])for(const mode of ['stages','walk','actions','poses']){await p.evaluate(({hero,mode})=>dressingReview.draw(hero,mode),{hero,mode});await p.locator('#dressing').screenshot({path:folder+hero+'-'+mode+'.png'});}
  if(errors.length)throw Error(errors.join('\n'));return {...result,errors};
 }finally{await context.close();}
}
