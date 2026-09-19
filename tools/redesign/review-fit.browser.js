async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1600,height:1100},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const folder='D:/Dev/MertlochChronicles-ui3/assets/redesign/review/walk-fit-v4/';
 try{
  await p.goto('http://127.0.0.1:4283/redesign-demo.html?hero=anni&action=walk&frame=0&armor=1');await p.waitForFunction(()=>window.redesignDemo?.ready);
  await p.evaluate(async()=>{const {redesignArt:a}=await import('/redesign-art.js');await Promise.all(Object.entries(a.catalog.assets).map(async([id,meta])=>{const im=new Image();im.src='/'+meta.detailPath;await im.decode();a.details.set(id,im);}));});
  const result=await p.evaluate(async()=>{
   const {drawRedesignPerson,redesignArt:a}=await import('/redesign-art.js');
   const base=document.createElement('canvas'),worn=document.createElement('canvas');base.width=base.height=worn.width=worn.height=384;const b=base.getContext('2d'),w=worn.getContext('2d');
   const items=[{slot:'legs',asset:'trouser'},{slot:'feet',asset:'boot'},{slot:'hands',asset:'glove'},{slot:'wrists',asset:'bracer'}];let checked=0,changed=0;
   for(const asset of Object.values(a.catalog.assets))for(const f of asset.frames){
    b.clearRect(0,0,384,384);w.clearRect(0,0,384,384);const heavy=asset.state.startsWith('heavy')?[{slot:'weapon',asset:'maul',hands:2}]:[],pose={direction:f.direction,artPose:f.pose,visualEquipment:heavy};
    drawRedesignPerson(b,asset.hero,192,320,pose,8);drawRedesignPerson(w,asset.hero,192,320,{...pose,visualEquipment:[...heavy,...items]},8);
    const before=b.getImageData(0,0,384,384).data,after=w.getImageData(0,0,384,384).data;let differences=0;
    for(let i=0;i<before.length;i+=4){if(before[i+3]!==after[i+3])throw Error('Equipment changes silhouette '+asset.hero+' '+f.direction+' '+f.pose+' at '+i/4);if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])differences++;}
    if(differences>0)changed++;checked++;
   }
   if(changed!==checked)throw Error('Invisible fitted equipment: '+changed+'/'+checked);
   const cv=document.createElement('canvas');cv.id='fit-sheet';cv.width=1920;cv.height=1280;cv.style='position:absolute;inset:0;z-index:9999;max-width:none';document.body.append(cv);const c=cv.getContext('2d');
   window.fitReview={draw(hero,heavy=false){c.fillStyle='#22382e';c.fillRect(0,0,cv.width,cv.height);for(let row=0;row<4;row++)for(let phase=0;phase<8;phase++){drawRedesignPerson(c,hero,120+phase*240,260+row*320,{direction:['se','sw','ne','nw'][row],artPose:'walk-'+phase,visualEquipment:[...items,{slot:'weapon',asset:heavy?'maul':'club',hands:heavy?2:1}]},8);c.fillStyle='#ead8b0';c.font='15px sans-serif';c.fillText(['SE','SW','NE','NW'][row]+' / '+['Kontakt','Tief','Pass','Hoch'][phase%4]+' '+(phase<4?'A':'B'),30+phase*240,300+row*320);}}};
   return {checked,changed,cyclesPerSecond:122/a.catalog.stride};
  });
  for(const hero of ['dieter','anni','kevin'])for(const heavy of [false,true]){await p.evaluate(({hero,heavy})=>window.fitReview.draw(hero,heavy),{hero,heavy});await p.locator('#fit-sheet').screenshot({path:folder+hero+(heavy?'-heavy':'')+'.png'});}
  await p.evaluate(()=>document.getElementById('fit-sheet').remove());await p.locator('#turnaround').screenshot({path:folder+'equipped-demo.png'});
  await p.goto('http://127.0.0.1:4283/gait-review.html');await p.waitForFunction(()=>window.gaitReview);await p.evaluate(()=>{gaitReview.set('anni',2);document.getElementById('gear').value='normal';gaitReview.draw();});await p.screenshot({path:folder+'review-page.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  if(errors.length)throw Error(errors.join('\n'));return {...result,errors};
 }finally{await context.close();}
}
