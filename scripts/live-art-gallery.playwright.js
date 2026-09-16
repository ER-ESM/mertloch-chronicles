async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:1536,height:1200},serviceWorkers:'block'}),p=await context.newPage();await p.goto('http://localhost:4173');await p.waitForSelector('#loading',{state:'hidden'});
 await p.evaluate(async()=>{
  const m=await import('./live-art.js');await m.loadLiveArt();const {ITEMS}=await import('./rpg.js');
  document.body.innerHTML='<canvas id="liveReview" width="1536" height="1200" style="position:fixed;inset:0"></canvas>';const c=document.querySelector('#liveReview').getContext('2d');c.fillStyle='#354b36';c.fillRect(0,0,1536,1200);c.font='16px monospace';
  const eq=m.equipmentAppearance({weapon:'tresenhammer',ranged:'pfandschleuder',head:null,body:'regenjacke',feet:'festivalstiefel'},ITEMS);
  for(const [row,id] of ['dieter','anni','kevin'].entries())for(const [d,dir] of ['se','ne'].entries()){
   const y=(row*2+d)*190+180;c.fillStyle='#fff2d6';c.fillText(id+' '+dir,12,y-150);
   for(let frame=0;frame<8;frame++)m.drawLivePerson(c,id,100+frame*155,y,0,{direction:dir,moving:true,walkDistance:frame*6,visualEquipment:eq},3.6);
   m.drawLivePerson(c,id,1420,y,0,{direction:dir,attack:.15,visualEquipment:eq},3.6);
  }
 });await p.screenshot({path:'D:/Dev/MertlochChronicles/visual-review/live-walk-gear-contact.png'});await context.close();return 'Saved six walking rows and six attack poses using the actual live renderer.';
}
