// Execute this function with Playwright browser_run_code_unsafe, from the project workspace.
async (page) => {
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
 const p=await context.newPage(),errors=[],checks=[];
 const root='D:/Dev/MertlochChronicles-ui3/assets/class-visuals/review/';
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const check=(value,label)=>{if(!value)throw Error(label);checks.push(label);};
 const scene=(id,time)=>p.evaluate(([id,time])=>window.classVisualPreview.setScene(id,time),[id,time]);
 const signal=()=>p.locator('#signal').textContent();
 try {
  await p.goto('http://127.0.0.1:4283/tools/class-visuals/preview.html');
  await p.waitForFunction(()=>window.classVisualPreview);
  for(const [id,t] of [['stacks',11],['barrels',2.5],['spores',1.7],['chain',1.34],['robot',7.4],['goose',2.2],['proc',5],['toast',1],['placement',1],['mobilecast',.7]]){
   await scene(id,t);await p.locator('#stage').screenshot({path:root+id+'.png'});
   check((await signal()).length>10,id+' renders');
  }
  await scene('stacks',11);await p.locator('#trigger').click();check((await signal()).includes('Stapel verbraucht'),'manual finisher consumes stacks');
  await scene('stacks',12.2);check((await signal()).includes('Kater statt Finisher'),'expiry differs from finisher');
  await p.locator('#stage').screenshot({path:root+'expiry.png'});
  await scene('barrels',20.1);check((await signal()).includes('kein Finisher'),'barrel expiry does not trigger burst');
  await scene('barrels',5);await p.locator('#trigger').click();check((await signal()).includes('jeder Typ'),'barrels can be triggered');
  await p.evaluate(()=>window.classVisualPreview.advance(.25));await p.locator('#stage').screenshot({path:root+'barrel-trigger.png'});
  await scene('spores',1.99);check((await signal()).includes('1 Ziel'),'transfer does not apply early');
  await scene('spores',2);check((await signal()).includes('2 Ziele'),'transfer applies on arrival');
  await scene('robot',8);check((await signal()).includes('scrap'),'overload resolves into scrap');
  await scene('proc',5);check(await p.locator('.ability.ready').count()===1,'proc highlights skill');
  await p.locator('#trigger').click();check((await signal()).includes('Proc verbraucht')&&await p.locator('.ability.ready').count()===0,'proc consumption ends readiness');
  await scene('proc',12.1);check((await signal()).includes('abgelaufen'),'proc expires without hit');
  await scene('toast',1);await p.locator('#trigger').click();check((await signal()).includes('im Fenster'),'timed answer succeeds');
  await scene('toast',.3);await p.locator('#trigger').click();check((await signal()).includes('Außerhalb'),'early answer fails');
  await scene('placement',1);await p.locator('#stage').click({position:{x:420,y:250}});await p.evaluate(()=>window.classVisualPreview.advance(.15));
  const before=await p.locator('#shape').inputValue();await p.locator('#trigger').click();check(await p.locator('#shape').inputValue()!==before,'target geometry changes');
  await scene('chain',1.3);await p.waitForTimeout(150);check(await p.evaluate(()=>window.classVisualPreview.time)===1.3,'pause freezes time');
  await p.locator('#step').click();check(Math.abs(await p.evaluate(()=>window.classVisualPreview.time)-(1.3+1/30))<1e-8,'single frame advances exactly');
  await p.locator('[data-path="1"] button').click();check(await p.locator('.path.chosen').count()===1&&await p.locator('.path.blocked').count()===2,'talent choice excludes alternatives');
  await p.setViewportSize({width:390,height:844});await p.reload();await p.waitForFunction(()=>window.classVisualPreview);
  await scene('barrels',2.5);await p.screenshot({path:root+'mobile.png',fullPage:true});
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile has no page overflow');
  check(await p.evaluate(()=>{const c=document.querySelector('#stage');return c.width===c.clientWidth&&document.querySelector('#scale').value==='2';}),'mobile uses integer 2x rendering');
  await scene('placement',1);await p.locator('#stage').dispatchEvent('pointerdown',{clientX:180,clientY:480,pointerId:1,pointerType:'touch',buttons:1});
  // All source/method checks are separate from a human inspection of these screenshots.
  check(errors.length===0,'no browser errors or failed requests');
  return {passed:checks.length,checks,errors};
 } finally {await context.close();}
}
