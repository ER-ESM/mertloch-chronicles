// Mobile-Prüfung: startet ein eigenes Chrome (headless) mit Touch-Emulation, erzwingt den Touch-Modus und geht die
// Handy-Klickpfade durch: HUD, alle sieben Clanbuch-Reiter, Gegenstand antippen, Ausrüstungsplatz antippen,
// Talent antippen, Kniff lange drücken, Toast. Je Gerät (Hochkant 390×844, Quer 844×390, klein 360×740):
//  - keine Seitenbreite über dem Viewport, kein Fenster außerhalb des Bildschirms,
//  - kein Fenster über Joystick oder Kniff-Knöpfen,
//  - Tipp-Ziele in Fenstern und Touch-HUD mindestens 40 px (Verstoß < 32 px ist ein Fehler),
//  - keine Desktop-Begriffe (Tab, WASD, Rechtsklick, Maus, [LEER], [F], [1]…) in sichtbaren Fenstern.
// Screenshots und Bericht: visual-review/mobile-check/<gerät>-<schritt>.png + REPORT.md
//
// Aufruf:  PORT=4181 node server.mjs   (zweites Fenster)
//          node scripts/mobile-check.mjs [url] [ordner]
// Chrome: CHROME=<pfad> oder Vorgabe C:\Program Files\Google\Chrome\Application\chrome.exe. Kein npm-Paket.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,mkdtempSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const url=process.argv[2]||'http://localhost:4181/',dir=process.argv[3]||'visual-review/mobile-check';
const chrome=process.env.CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(existsSync);
const port=Number(process.env.CDP_PORT||9344);
mkdirSync(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const DEVICES=[['hoch',390,844],['quer',844,390],['klein',360,740]];
const DESKTOP_WORDS=/\[(LEER|Q|F|E|[0-9])\]|\bTab\b(?= wählt| oder)|\bWASD\b|Rechtsklick|\bMaus\b|Mausrad/;

async function launch(){
 if(!chrome)throw Error('Kein Chrome gefunden; CHROME=<pfad> setzen.');
 const profile=mkdtempSync(join(tmpdir(),'mertloch-mobile-'));
 const proc=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--hide-scrollbars','--window-size=900,900','about:blank'],{stdio:'ignore'});
 for(let i=0;i<60;i++){await wait(250);try{const t=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(t.some(x=>x.type==='page'))return proc;}catch{}}
 proc.kill();throw Error('Chrome antwortet nicht auf Port '+port);
}
async function connect(){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const target=targets.find(t=>t.type==='page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text+' '+(d.params.exceptionDetails.exception?.description||''));if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{const id=++serial;pending.set(id,{resolve:res,reject:rej});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 return {send,evaluate,errors,close:()=>ws.close(),
  async device(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:true,screenOrientation:{type:width>height?'landscapePrimary':'portraitPrimary',angle:width>height?90:0}});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});},
  async goto(u){await send('Page.navigate',{url:u});for(let i=0;i<200;i++){await wait(100);if(await evaluate('!!window.mertloch').catch(()=>false))return;}throw Error('Spiel startet nicht');},
  async shot(name){const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(dir,name+'.png'),Buffer.from(r.data,'base64'));},
  async tap(selector){const box=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!box)return false;await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return true;},
  async longPress(selector,ms=800){const box=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!box)return false;await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await wait(ms);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return true;}
 };
}

/** Sichtbarkeits- und Layoutmessung im Browser; Ergebnis wird als JSON zurückgegeben. */
const AUDIT=`(()=>{
 const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&!el.closest('[hidden]');};
 const box=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
 const overlap=(a,b)=>a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 const stick=document.querySelector('#touchStick'),skills=document.querySelector('#touchSkills');
 const popups=[...document.querySelectorAll('.game-popup')].filter(vis).map(e=>({id:e.dataset.window,...box(e)}));
 const small=[...document.querySelectorAll('.game-popup button, #mobileControls button, .game-popup .item-slot, .branch-node')].filter(vis).map(e=>({sel:(e.className||e.tagName).toString().slice(0,40)+(e.dataset.window?'#'+e.dataset.window:''),text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30),...box(e)})).filter(b=>Math.min(b.w,b.h)<40);
 const text=[...document.querySelectorAll('.game-popup .popup-body, #touchContext, #toast, .touch-topline')].filter(vis).map(e=>e.innerText).join('\\n');
 return {touch:document.body.classList.contains('touch-mode'),vw:innerWidth,vh:innerHeight,scrollW:document.documentElement.scrollWidth,popups,stick:stick&&vis(stick)?box(stick):null,skills:skills&&vis(skills)?box(skills):null,
  overlapStick:popups.filter(p=>overlap(p,stick&&box(stick))).map(p=>p.id),overlapSkills:popups.filter(p=>overlap(p,skills&&box(skills))).map(p=>p.id),
  offscreen:popups.filter(p=>p.x<0||p.y<0||p.x+p.w>innerWidth+1||p.y+p.h>innerHeight+1).map(p=>p.id),small,text};
})()`;

const b0=await launch();const b=await connect();const report=[];let failures=0;
try{
 await b.device(390,844);await b.goto(url);
 await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'normal',layouts:{}}));(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);})()`);
 await b.goto(url);await wait(1500);
 for(const [name,w,h] of DEVICES){
  await b.device(w,h);await wait(700);
  await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(300);
  const steps=[['hud',async()=>{}],
   ['figur',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`)],
   ['figur-platz',()=>b.tap('.gear-cell [data-equipped]')],
   ['rucksack',async()=>{await b.evaluate(`document.querySelectorAll('.popup-inspection [data-window-close],.popup-detail [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="bag"]').click()`);}],
   ['rucksack-item',()=>b.tap('.bag-grid [data-item]')],
   ['kniffe',async()=>{await b.evaluate(`document.querySelectorAll('.popup-inspection [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="book"]').click()`);}],
   ['kniff-tipp',()=>b.tap('.book-skill:not(.locked)')],
   ['talente',async()=>{await b.evaluate(`document.querySelectorAll('.popup-touchhelp [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`);await wait(300);await b.evaluate(`document.querySelector('[data-section="Talente"]')?.scrollIntoView()`);}],
   ['talent-tipp',()=>b.tap('.branch-node.available,.branch-node.learned')],
   ['auftraege',async()=>{await b.evaluate(`document.querySelectorAll('.popup-touchhelp [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="quest"]').click()`);}],
   ['bude',()=>b.evaluate(`document.querySelector('[data-book-tab="base"]').click()`)],
   ['karte',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="map"]').click()`)],
   ['hilfe',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="guide"]').click()`)],
   ['hilfe-bedienung',()=>b.evaluate(`[...document.querySelectorAll('.game-popup [role=tab]')].find(t=>/Bedienung/.test(t.textContent))?.click()`)],
   ['kniff-lang',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.longPress('#touchSkills .touch-skill');}],
   ['toast',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('#touchTarget').click()`);}]];
  for(const [step,run] of steps){
   await run();await wait(650);
   const a=await b.evaluate(AUDIT);await b.shot(name+'-'+step);
   const problems=[];
   if(!a.touch)problems.push('Touch-Modus nicht aktiv');
   if(a.scrollW>a.vw+1)problems.push('Seite breiter als Viewport: '+a.scrollW+' > '+a.vw);
   if(a.offscreen.length)problems.push('Fenster außerhalb: '+a.offscreen.join(','));
   if(a.overlapStick.length)problems.push('Fenster über Joystick: '+a.overlapStick.join(','));
   if(a.overlapSkills.length)problems.push('Fenster über Kniff-Knöpfen: '+a.overlapSkills.join(','));
   const tiny=a.small.filter(s=>Math.min(s.w,s.h)<32);if(tiny.length)problems.push('Tipp-Ziele unter 32 px: '+tiny.map(s=>s.text||s.sel).slice(0,6).join(' | '));
   const m=a.text.match(DESKTOP_WORDS);if(m)problems.push('Desktop-Begriff sichtbar: „'+m[0]+'“');
   const warn=a.small.filter(s=>Math.min(s.w,s.h)>=32).length;
   report.push({device:name,step,problems,warn,popups:a.popups.map(p=>p.id+' '+p.w+'×'+p.h+'@'+p.x+','+p.y).join(' ')});
   if(problems.length)failures++;
  }
 }
}finally{
 const lines=['# Mobile-Prüfung · '+new Date().toISOString().slice(0,10),'',`Adresse ${url} · Geräte ${DEVICES.map(d=>d[0]+' '+d[1]+'×'+d[2]).join(', ')} · ${failures} Schritte mit Fehlern von ${report.length}`,'','| Gerät | Schritt | Fenster | Tipp-Ziele 32–39 px | Probleme |','|---|---|---|---|---|',
  ...report.map(r=>`| ${r.device} | ${r.step} | ${r.popups||'–'} | ${r.warn} | ${r.problems.join('; ')||'–'} |`),'',b.errors.length?'## Laufzeitfehler\n\n'+b.errors.map(e=>'- '+e.slice(0,200)).join('\n'):'Keine Laufzeitfehler.'];
 writeFileSync(join(dir,'REPORT.md'),lines.join('\n'));
 console.log(lines.join('\n'));
 b.close();b0.kill();
}
assert.equal(failures,0,failures+' Schritte mit Problemen, siehe '+join(dir,'REPORT.md'));
