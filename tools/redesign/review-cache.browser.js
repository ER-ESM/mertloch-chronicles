async(page)=>{
 const browser=page.context().browser(),context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),p=await context.newPage(),errors=[];let legacyRequests=0;
 p.on('pageerror',e=>errors.push(e.message));
 try{
  // Represent obsolete files in an installed game's cache. The detail demo must not request either entry.
  await p.route(/\/(live-art|redesign-demo)\.js$/,route=>{legacyRequests++;return route.fulfill({contentType:'text/javascript',body:'throw Error("Obsolete renderer loaded");'});});
  await p.goto('http://127.0.0.1:4283/redesign-demo.html?hero=anni&outfit=anni-spray&action=ranged&frame=7');await p.waitForFunction(()=>window.redesignDemo?.ready);
  await p.waitForFunction(async()=> (await import('./redesign-art.js')).redesignArt.details.has('anni-specials'));
  await p.locator('.stage').screenshot({path:'D:/Dev/MertlochChronicles-ui3/assets/redesign/review/anni-cache-fixed.png'});
  const selection=await p.evaluate(()=>({hero:redesignDemo.state.hero,pose:redesignDemo.player().artPose,outfit:redesignDemo.state.outfit}));
  if(legacyRequests||errors.length)throw Error(JSON.stringify({legacyRequests,errors}));
  await p.unroute(/\/(live-art|redesign-demo)\.js$/);
  const compared=await p.evaluate(async()=>{
   const {drawDetailedHero}=await import('./detailed-hero-art.js'),{drawLivePerson}=await import('./live-art.js'),{DEMO_PRESETS}=await import('./prerender-demo-presets.js');
   const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=240;a.height=b.height=240;const ca=a.getContext('2d'),cb=b.getContext('2d');let count=0;
   for(const preset of DEMO_PRESETS)for(const direction of ['se','sw','ne','nw'])for(const action of ['walk','attack','ranged','parry','rest','dead']){
    Object.assign(redesignDemo.state,{hero:preset.hero==='baerbel'?'anni':preset.hero,outfit:preset.id,action,phase:7,armor:true});
    const state={...redesignDemo.player(),direction,artMagnify:4},hero=redesignDemo.state.hero;ca.clearRect(0,0,240,240);cb.clearRect(0,0,240,240);
    if(!drawDetailedHero(ca,hero,120,194,state,4)||!drawLivePerson(cb,hero,120,194,0,state))throw Error('Missing '+hero+' '+action);
    if(a.toDataURL()!==b.toDataURL())throw Error('Demo/game mismatch '+hero+' '+action+' '+direction);count++;
   }return count;
  });
  await p.route('**/assets/redesign/runtime/catalog.json',r=>r.fulfill({contentType:'application/json',body:'{"complete":false}'}));
  await p.reload();await p.locator('.stage').filter({hasText:'Die Detailgrafiken konnten nicht geladen werden'}).waitFor();
  if(await p.locator('.stage canvas').count())throw Error('Incomplete delivery still displays actors');
  return {selection,legacyRequests,compared,missingDelivery:'visible error without substitute actors',errors};
 }finally{await context.close();}
}
