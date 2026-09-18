// Mobile-Prüfung: startet ein eigenes Chrome (headless) mit Touch-Emulation, erzwingt den Touch-Modus und geht die
// Handy-Klickpfade durch: HUD, alle Clanbuch-Reiter und Abschnitte, Gegenstand antippen, Ausrüstungsplatz antippen,
// Talent antippen, Kniff lange drücken, Toast. Je Gerät (Hochkant 390×844, Quer 844×390, klein 360×740):
//  - keine Seitenbreite über dem Viewport, kein Fenster außerhalb des Bildschirms,
//  - kein Fenster über Joystick oder Kniff-Knöpfen,
//  - Safe Areas simuliert (iPhone-Werte): kein Tipp-Ziel in einer Safe Area, keines in einer 24-px-Bildschirmecke (M-07),
//  - Linkshand-Schritt: Joystick rechts, Kniffe links (M-08),
//  - Tipp-Ziele in Fenstern und Touch-HUD mindestens 44 px (M-01: 32–43 px ist ein Befund, < 32 px ein Fehler),
//  - Abstand zwischen benachbarten Tipp-Zielen mindestens 8 px (M-02, Befund),
//  - keine Desktop-Begriffe (Tab, WASD, Rechtsklick, Maus, [LEER], [F], [1]…) in sichtbaren Fenstern.
// Zum Schluss Desktop-Gegenprobe 2024×900 ohne Touch-Modus (M-20: Mobile-Schicht ist dort ein Durchlauf).
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
/** Simulierte Safe Areas (iPhone-Werte): hochkant oben 47 / unten 34, quer links 47 / rechts 47 / unten 21 (M-07). */
const SAFE=(w,h)=>w>h?{top:0,bottom:21,left:47,right:47}:{top:47,bottom:34,left:0,right:0};
const CORNER=24;
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
/** Tipp-Ziele: alles, was in Fenstern und im Touch-HUD angetippt werden kann (M-01/M-02). */
const TARGETS='.game-popup button, .game-popup [role=tab], .game-popup select, .game-popup a[href], .game-popup .item-slot, .game-popup .branch-node, .game-popup input:not([type=hidden]), #mobileControls button, #touchStick, #tutorialGuide button';
const AUDIT=`(()=>{
 const TARGETS=${JSON.stringify(TARGETS)};const CORNER=${CORNER};
 const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&!el.closest('[hidden]');};
 const box=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
 const overlap=(a,b)=>a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 const stick=document.querySelector('#touchStick'),skills=document.querySelector('#touchSkills');
 const popups=[...document.querySelectorAll('.game-popup')].filter(vis).map(e=>({id:e.dataset.window,...box(e)}));
 const stickies=[...document.querySelectorAll('.game-popup .popup-body *')].filter(e=>vis(e)&&getComputedStyle(e).position==='sticky').map(e=>({el:e,r:e.getBoundingClientRect()}));
 const popupEls=[...document.querySelectorAll('.game-popup')].filter(vis);
 const clip=t=>{const c=t.el.closest('.popup-body');if(!c)return t;const own=t.el.closest('.game-popup');const above=popupEls.slice(popupEls.indexOf(own)+1).some(p=>{const r=p.getBoundingClientRect();return r.left<t.x+t.w&&r.right>t.x&&r.top<t.y+t.h&&r.bottom>t.y;});if(above)return {...t,clipped:true};const b=c.getBoundingClientRect();let x=Math.max(t.x,b.left),y=Math.max(t.y,b.top),w=Math.min(t.x+t.w,b.right)-x,h=Math.min(t.y+t.h,b.bottom)-y;for(const st of stickies)if(!st.el.contains(t.el)&&st.r.bottom>y&&st.r.top<=y&&st.r.left<x+w&&st.r.right>x){h-=st.r.bottom-y;y=st.r.bottom;}return {...t,ow:t.w,oh:t.h,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),clipped:w<t.w-1||h<t.h-1};};
 const onTop=t=>{const hit=document.elementFromPoint(t.x+t.w/2,t.y+t.h/2);return !!hit&&(t.el===hit||t.el.contains(hit));};
 const label=e=>((e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30)||(e.id?'#'+e.id:'')||e.className.toString().slice(0,30));
 const targets=[...document.querySelectorAll(TARGETS)].filter(e=>vis(e)&&!e.disabled&&!e.closest('[hidden]')).map(e=>({el:e,text:label(e),...box(e)})).map(clip).filter(t=>t.w>0&&t.h>0&&t.x+t.w>0&&t.y+t.h>0&&t.x<innerWidth&&t.y<innerHeight&&onTop(t));
 const small=targets.filter(t=>!t.clipped&&Math.min(t.ow??t.w,t.oh??t.h)<44).map(({el,...t})=>({...t,w:t.ow??t.w,h:t.oh??t.h}));
 const gaps=[];for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const a=targets[i],b=targets[j];if(a.clipped||b.clipped||a.el.contains(b.el)||b.el.contains(a.el))continue;const dx=Math.max(0,b.x-(a.x+a.w),a.x-(b.x+b.w)),dy=Math.max(0,b.y-(a.y+a.h),a.y-(b.y+b.h));const gap=Math.max(dx,dy);if(gap<8)gaps.push({a:a.text,b:b.text,gap:Math.round(gap*10)/10});}
 const text=[...document.querySelectorAll('.game-popup .popup-body, #touchContext, #toast, .touch-topline')].filter(vis).map(e=>e.innerText).join('\\n');
 const safe=['top','bottom','left','right'].map(k=>[k,parseFloat(getComputedStyle(document.body).getPropertyValue('--safe-'+k))||0]);const S=Object.fromEntries(safe);
 const inCorner=(t,l,tp,r,bt)=>(t.x<l+CORNER||t.x+t.w>r-CORNER)&&(t.y<tp+CORNER||t.y+t.h>bt-CORNER);
 const corners=targets.filter(t=>!t.clipped&&(inCorner(t,0,0,innerWidth,innerHeight)||inCorner(t,S.left,S.top,innerWidth-S.right,innerHeight-S.bottom))).map(t=>t.text);
 const unsafe=targets.filter(t=>!t.clipped&&(t.y<S.top||t.y+t.h>innerHeight-S.bottom||t.x<S.left||t.x+t.w>innerWidth-S.right)).map(t=>t.text+' '+t.x+','+t.y+' '+t.w+'×'+t.h);
 return {touch:document.body.classList.contains('touch-mode'),vw:innerWidth,vh:innerHeight,scrollW:document.documentElement.scrollWidth,popups,corners,unsafe,safe:S,hand:document.body.dataset.touchHand,stick:stick&&vis(stick)?box(stick):null,skills:skills&&vis(skills)?box(skills):null,
  overlapStick:popups.filter(p=>overlap(p,stick&&box(stick))).map(p=>p.id),overlapSkills:popups.filter(p=>overlap(p,skills&&box(skills))).map(p=>p.id),
  offscreen:popups.filter(p=>p.x<0||p.y<0||p.x+p.w>innerWidth+1||p.y+p.h>innerHeight+1).map(p=>p.id),targets:targets.length,small,gaps,text};
})()`;

const b0=await launch();const b=await connect();const report=[],audits=[];let failures=0;
try{
 await b.device(390,844);await b.goto(url);
 await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'normal',layouts:{}}));(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);})()`);
 await b.goto(url);await wait(1500);
 for(const [name,w,h] of DEVICES){
  await b.device(w,h);await b.evaluate(`(s=>{for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');})(${JSON.stringify(SAFE(w,h))})`);await wait(700);
  await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(300);
  const steps=[['hud',async()=>{}],
   ['figur',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`)],
   ['figur-platz',()=>b.tap('.gear-cell [data-equipped]')],
   ['rucksack',async()=>{await b.evaluate(`document.querySelectorAll('.popup-inspection [data-window-close],.popup-detail [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="bag"]').click()`);}],
   ['rucksack-item',()=>b.tap('.bag-grid [data-item]')],
   ['kniffe',async()=>{await b.evaluate(`document.querySelectorAll('.popup-inspection [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`);await wait(300);await b.evaluate(`document.querySelector('[data-section="Kniffe"]')?.scrollIntoView()`);}],
   ['kniff-tipp',()=>b.tap('.book-skill:not(.locked)')],
   ['talente',async()=>{await b.evaluate(`document.querySelectorAll('.popup-touchhelp [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`if(!document.querySelector('.popup-person'))document.querySelector('.game-menu-rail [data-panel="person"]').click()`);await wait(300);await b.evaluate(`document.querySelector('[data-section="Talente"]')?.scrollIntoView()`);}],
   ['talent-tipp',()=>b.tap('.branch-node.available,.branch-node.learned')],
   ['auftraege',async()=>{await b.evaluate(`document.querySelectorAll('.popup-touchhelp [data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="quest"]').click()`);}],
   ['bude',()=>b.evaluate(`document.querySelector('[data-section="Bude"]')?.scrollIntoView()`)],
   ['karte',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="map"]').click()`)],
   ['hilfe',()=>b.evaluate(`document.querySelector('[data-book-tab="guide"]').click()`)],
   ['hilfe-bedienung',()=>b.evaluate(`[...document.querySelectorAll('.game-popup [role=tab]')].find(t=>/Bedienung/.test(t.textContent))?.click()`)],
   ['kniff-lang',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.longPress('#touchSkills .touch-skill');}],
   ['toast',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('#touchTarget').click()`);}],
   ['linkshand',()=>b.evaluate(`document.body.dataset.touchHand='left'`)]];
  for(const [step,run] of steps){
   await run();await wait(650);
   const a=await b.evaluate(AUDIT);await b.shot(name+'-'+step);audits.push({device:name,step,...a,text:undefined});
   const problems=[];
   if(!a.touch)problems.push('Touch-Modus nicht aktiv');
   if(a.scrollW>a.vw+1)problems.push('Seite breiter als Viewport: '+a.scrollW+' > '+a.vw);
   if(a.offscreen.length)problems.push('Fenster außerhalb: '+a.offscreen.join(','));
   if(a.overlapStick.length)problems.push('Fenster über Joystick: '+a.overlapStick.join(','));
   if(a.overlapSkills.length)problems.push('Fenster über Kniff-Knöpfen: '+a.overlapSkills.join(','));
   if(a.corners.length)problems.push('Tipp-Ziel in Bildschirmecke (< '+CORNER+' px): '+a.corners.slice(0,4).join(' | '));
   if(a.unsafe.length)problems.push('Tipp-Ziel in Safe Area: '+a.unsafe.slice(0,4).join(' | '));
   if(step==='linkshand'){if(a.hand!=='left')problems.push('Linkshand nicht gesetzt');else if(!(a.stick&&a.skills&&a.stick.x>a.skills.x))problems.push('Linkshand: Joystick nicht rechts der Kniffe');}
   const tiny=a.small.filter(s=>Math.min(s.w,s.h)<32);if(tiny.length)problems.push('Tipp-Ziele unter 32 px: '+tiny.map(s=>s.text||s.sel).slice(0,6).join(' | '));
   const m=a.text.match(DESKTOP_WORDS);if(m)problems.push('Desktop-Begriff sichtbar: „'+m[0]+'“');
   const warn=a.small.filter(s=>Math.min(s.w,s.h)>=32);
   report.push({device:name,step,problems,warn:warn.length,warnList:warn.map(s=>s.text+' '+s.w+'×'+s.h).join(' | '),gaps:a.gaps.length,gapList:a.gaps.slice(0,4).map(g=>g.a+'↔'+g.b+' '+g.gap+'px').join(' | '),targets:a.targets,popups:a.popups.map(p=>p.id+' '+p.w+'×'+p.h+'@'+p.x+','+p.y).join(' ')});
   if(problems.length)failures++;
  }
  await b.evaluate(`document.body.dataset.touchHand='right'`);
 }
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.send('Emulation.setDeviceMetricsOverride',{width:2024,height:900,deviceScaleFactor:1,mobile:false});
 await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop',size:'normal',layouts:{}}))`);await b.goto(url);await wait(1500);
 const d=await b.evaluate(`({touch:document.body.classList.contains('touch-mode'),controls:getComputedStyle(document.querySelector('#mobileControls')).display,rail:!!document.querySelector('.game-menu-rail')&&getComputedStyle(document.querySelector('.game-menu-rail')).display!=='none'})`);await b.shot('desktop-2024x900');
 const dp=[];if(d.touch)dp.push('Touch-Modus am Desktop aktiv');if(d.controls!=='none')dp.push('Touch-HUD am Desktop sichtbar');if(!d.rail)dp.push('Menüleiste am Desktop fehlt');
 report.push({device:'desktop',step:'2024x900',problems:dp,warn:0,warnList:'',gaps:0,gapList:'',targets:0,popups:''});if(dp.length)failures++;
}finally{
 const lines=['# Mobile-Prüfung · '+new Date().toISOString().slice(0,10),'',`Adresse ${url} · Geräte ${DEVICES.map(d=>d[0]+' '+d[1]+'×'+d[2]).join(', ')} · ${failures} Schritte mit Fehlern von ${report.length}`,'','| Gerät | Schritt | Fenster | Ziele | Befund 32–43 px | Abstand < 8 px | Probleme |','|---|---|---|---|---|---|---|',
  ...report.map(r=>`| ${r.device} | ${r.step} | ${r.popups||'–'} | ${r.targets} | ${r.warn?r.warn+': '+r.warnList:'–'} | ${r.gaps?r.gaps+': '+r.gapList:'–'} | ${r.problems.join('; ')||'–'} |`),'',`Befunde gesamt: ${report.reduce((n,r)=>n+r.warn,0)} Tipp-Ziele unter 44 px, ${report.reduce((n,r)=>n+r.gaps,0)} Paare mit Abstand unter 8 px (M-01/M-02).`,'',b.errors.length?'## Laufzeitfehler\n\n'+b.errors.map(e=>'- '+e.slice(0,200)).join('\n'):'Keine Laufzeitfehler.'];
 writeFileSync(join(dir,'REPORT.md'),lines.join('\n'));writeFileSync(join(dir,'audit.json'),JSON.stringify(audits,null,1));
 console.log(lines.join('\n'));
 b.close();b0.kill();
}
assert.equal(failures,0,failures+' Schritte mit Problemen, siehe '+join(dir,'REPORT.md'));
