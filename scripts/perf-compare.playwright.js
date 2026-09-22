// Bildvergleich zweier Stände (Playwright-Schnipsel, über browser_run_code): gleicher Spielstand, gleicher Ort, eingefrorene Zeit.
// BASE = alter Stand (z. B. Worktree von origin/main auf eigenem Port), NEW = Arbeitsstand. Meldet den Anteil abweichender Pixel und
// speichert beide Bilder plus Differenzbild nach visual-review/performance/. Zeigt Unterschiede, bevor sie ein Spieler sieht.
async (page) => {
 const BASE=globalThis.__cmpBase||'http://localhost:4396/',NEW=globalThis.__cmpNew||'http://localhost:4395/',OUT='MertlochChronicles-perf/visual-review/performance/',NAME=globalThis.__cmpName||'vergleich';
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.bringToFront();await page.setViewportSize({width:2024,height:900});
 await page.goto(NEW);const store=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
 const shot=async url=>{await page.goto(url.split('?')[0]);await page.evaluate(s=>{localStorage.clear();for(const [k,v] of Object.entries(JSON.parse(s)))localStorage.setItem(k,v);},store);await page.goto(url+(url.includes('?')?'&':'?')+'fx=aus');await page.waitForFunction(()=>!!globalThis.__mertloch,null,{timeout:30000});await page.waitForTimeout(1500);
  await page.evaluate(()=>{[...document.querySelectorAll('.start-screen button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});await page.waitForTimeout(1500);
  // Einfrieren: gleiche Spielzeit, keine Bewegung, keine Zufallswackler, Automatiken aus, Fenster zu.
  await page.evaluate(()=>{const {game,renderer}=__mertloch;if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.settings.autoRes=false;game.tick=()=>{};game.time=100;renderer.shake=0;renderer.light.zoneDark=()=>{renderer.light.dark=.1;return .1;};renderer.camera={x:game.player.x,y:game.player.y};Math.random=()=>.5;for(const a of game.life?.actors||[])a.x=Math.round(a.x);});
  await page.waitForTimeout(900);return page.screenshot({clip:{x:260,y:150,width:1500,height:640},path:OUT+NAME+(url===BASE?'-alt.png':'-neu.png')});};
 const a=await shot(BASE),b=await shot(NEW);await page.evaluate(()=>__mertloch.game.setSetting('autoRes',true));
 // Pixelvergleich im Browser (PNG dekodieren), Differenz rot markieren.
 await page.goto('about:blank');
 const r=await page.evaluate(async([a,b])=>{const load=async s=>{const im=new Image();im.src='data:image/png;base64,'+s;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0);return {c,d:c.getImageData(0,0,cv.width,cv.height)};};
  const A=await load(a),B=await load(b),n=A.d.data.length/4;let diff=0,big=0;const out=A.c.createImageData(A.d.width,A.d.height);
  for(let i=0;i<A.d.data.length;i+=4){const d=Math.abs(A.d.data[i]-B.d.data[i])+Math.abs(A.d.data[i+1]-B.d.data[i+1])+Math.abs(A.d.data[i+2]-B.d.data[i+2]);if(d>6)diff++;if(d>60)big++;const g=(A.d.data[i]+A.d.data[i+1]+A.d.data[i+2])/9;out.data[i]=d>6?255:g;out.data[i+1]=d>6?40:g;out.data[i+2]=d>6?40:g;out.data[i+3]=255;}
  A.c.putImageData(out,0,0);return {abweichend:+(diff/n*100).toFixed(2)+' %',deutlich:+(big/n*100).toFixed(2)+' %',png:A.c.canvas.toDataURL('image/png').split(',')[1]};},[a.toString('base64'),b.toString('base64')]);
 // Das Sandbox-Werkzeug hat kein Dateisystem: Differenzbild über eine Seite und einen Screenshot sichern.
 await page.setContent('<body style="margin:0"><img id=d src="data:image/png;base64,'+r.png+'"></body>');await page.locator('#d').screenshot({path:OUT+NAME+'-diff.png'});
 return {abweichend:r.abweichend,deutlich:r.deutlich,bilder:[NAME+'-alt.png',NAME+'-neu.png',NAME+'-diff.png']};
}
