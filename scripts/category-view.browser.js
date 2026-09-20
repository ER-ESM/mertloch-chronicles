// Sichtprüfung der Kategorien (Playwright-MCP, browser_run_code_unsafe mit filename): Kniff-Tooltip, Talent-Tooltip und Nachschlagewerk.
// Server: `PORT=4190 node server.mjs`. Bilder landen als cat-*.png im Projektordner (nicht einchecken).
async (page) => {
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 const errs=[];page.on('pageerror',e=>errs.push(e.message.slice(0,200)));
 await page.addInitScript(()=>{try{Object.defineProperty(navigator.serviceWorker,'register',{value:()=>new Promise(()=>{})});}catch{}});
 await page.setViewportSize({width:2024,height:900});
 await page.goto('http://localhost:4190/');
 await page.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);});await page.reload();
 await page.waitForSelector('#startScreen[data-step=roster] [data-start=enter]',{timeout:60000});await page.click('[data-start=enter]');await page.waitForTimeout(800);
 await page.evaluate(()=>{if(game.tutorial)game.tutorial.completed=true;game.player.level=20;});
 await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.keyboard.press('Escape');await page.waitForTimeout(300);
 const out={errs};
 const shot=(name,clip)=>page.screenshot({path:'D:/Dev/MertlochChronicles-target/cat-'+name+'.png',clip});
 const tipText=()=>page.evaluate(()=>{const t=document.querySelector('.skill-tooltip:not([hidden]),.item-tooltip:not([hidden])');return t?{chips:[...t.querySelectorAll('.cat')].map(c=>c.textContent),belongs:t.querySelector('.cat-belongs')?.innerText||'',text:t.innerText.slice(0,700)}:null;});
 // 1 Kniff-Tooltip in der Aktionsleiste
 const slot=await page.$('#actions [data-tooltip-skill], .action-bar [data-tooltip-skill], [data-tooltip-skill]');
 if(slot){await slot.hover();await page.waitForTimeout(500);out.skill=await tipText();await shot('skill',{x:500,y:250,width:1000,height:650});}
 // 2 Talent-Tooltip
 await page.keyboard.press('n');await page.waitForTimeout(600);
 const talent=await page.$('[data-talent]');if(talent){await talent.hover();await page.waitForTimeout(500);out.talent=await tipText();await shot('talent',{x:0,y:0,width:1100,height:900});}
 // 3 Nachschlagewerk
 await page.keyboard.press('h');await page.waitForTimeout(500);
 await page.evaluate(()=>[...document.querySelectorAll('.panel-tabs button,[role=tab]')].find(b=>/Kniffe/i.test(b.textContent))?.click());await page.waitForTimeout(600);
 out.book=await page.evaluate(()=>({cards:document.querySelectorAll('.guide-kniffe .cat-block').length,filter:!!document.querySelector('[data-cat-filter]')}));
 await shot('book',{x:0,y:0,width:900,height:900});
 return out;
}
