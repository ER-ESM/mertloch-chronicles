// Mobile-Prüfung: startet ein eigenes Chrome (headless) mit Touch-Emulation, erzwingt den Touch-Modus und geht die
// Handy-Klickpfade durch: HUD, alle Clanbuch-Reiter und Abschnitte, Gegenstand antippen, Ausrüstungsplatz antippen,
// Talent antippen, Kniff lange drücken, Toast. Je Gerät (Hochkant 390×844, Quer 844×390, klein 360×740):
//  - keine Seitenbreite über dem Viewport, kein Fenster außerhalb des Bildschirms,
//  - kein Fenster über Joystick oder Kniff-Knöpfen,
//  - Safe Areas simuliert (iPhone-Werte): kein Tipp-Ziel in einer Safe Area, keines in einer 24-px-Bildschirmecke (M-07),
//  - Linkshand-Schritt: Joystick rechts, Kniffe links (M-08),
//  - Kampf über die Trainingsarena (Hilfe → Einstellungen → Admin, Stufe 6): Fenster nie über Joystick/Kniffen, Ortszeile und leere
//    Plätze im Kampf ausgeblendet (M-10), Toast nie über dem HUD, Lampe (Proc/Abklingzeit) über dem Knopf statt darunter (M-04),
//  - Tipp-Ziele in Fenstern und Touch-HUD mindestens 44 px (M-01: 32–43 px ist ein Befund, < 32 px ein Fehler),
//  - Abstand zwischen benachbarten Tipp-Zielen mindestens 8 px (M-02, Befund),
//  - keine Desktop-Begriffe (Tab, WASD, Rechtsklick, Maus, Shift, Taste, Esc, Klick, [LEER], [F], [1]…) in sichtbaren Fenstern,
//  - Text: unter 10 px Fehler, Lesetext (p/li/td) unter 12 px Befund; Kontrast Text/Untergrund unter 4,5:1 (3:1 groß) Fehler (M-12).
//  - Sitzung und Gerät (M-15…M-18): Drehen mit offenem Fenster und im Kampf ohne Zustandsverlust und ohne Touch-Versatz des Joysticks,
//    Unterbrechung (blur) ohne Modal-Stapel, Gespräch, Tod (Arena: Boss × 8) mit einem Tipp zurück ins Spiel, Beute über eine
//    Spielstand-Fixture (Beutel neben dem Spieler), Wiederkehr nach Neuladen mit höchstens einem Tipp, Seitenverhältnisse 21:9, 9:21,
//    16:10, 4:3 ohne Letterboxing (Spielfläche füllt den Viewport).
// Zum Schluss Desktop-Gegenprobe 2024×900 ohne Touch-Modus (M-20: Mobile-Schicht ist dort ein Durchlauf).
// Screenshots und Bericht: visual-review/mobile-check/<gerät>-<schritt>.png + REPORT.md
//
// Aufruf:  PORT=4181 node server.mjs   (zweites Fenster)
//          node scripts/mobile-check.mjs [url] [ordner]
// Chrome: CHROME=<pfad> oder Vorgabe C:\Program Files\Google\Chrome\Application\chrome.exe. Kein npm-Paket.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,mkdtempSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {makeProfile,disposeChrome,LEAN_ARGS} from './chrome-profile.mjs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const url=process.argv[2]||'http://localhost:4181/',dir=process.argv[3]||'visual-review/mobile-check';
const chrome=process.env.CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(existsSync);
const port=Number(process.env.CDP_PORT||9344);
mkdirSync(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ALL_DEVICES=[['hoch',390,844],['quer',844,390],['klein',360,740]];
/** Teil-Läufe (jeder Teil unter 10 Minuten): MOBILE_PART=hoch|quer|klein|sitzung|desktop|alle (Vorgabe alle). Teil-Läufe schreiben REPORT-<teil>.md. */
const PART=process.env.MOBILE_PART||'alle';
const DEVICES=ALL_DEVICES.filter(d=>PART==='alle'||PART===d[0]);const SESSION=PART==='alle'||PART==='sitzung';
/** Simulierte Safe Areas (iPhone-Werte): hochkant oben 47 / unten 34, quer links 47 / rechts 47 / unten 21 (M-07). */
const SAFE=(w,h)=>w>h?{top:0,bottom:21,left:47,right:47}:{top:47,bottom:34,left:0,right:0};
const CORNER=24;
const DESKTOP_WORDS=/\[(LEER|Q|F|E|[0-9])\]|\bTab\b(?= wählt| oder| →| \/)|\bWASD\b|Rechtsklick|Linksklick|rechtsklicken|doppelklicken|\bMaus\b|Mausrad|\bShift\b|\bTaste\b|\bTasten\b|Tastendruck|\bEsc\b|\bKlick\b|\bLEER\b/;

// Chrome-Prozessbaum beenden und sein Profil löschen (chrome-profile.mjs); je Chrome ein Profil.
const profiles=new Map(),killTree=proc=>{disposeChrome(proc,profiles.get(proc));profiles.delete(proc);};
async function launch(){
 if(!chrome)throw Error('Kein Chrome gefunden; CHROME=<pfad> setzen.');
 // Nie an einen fremden Chrome hängen: laufen zwei Prüfungen parallel (andere Sitzung), eigenen CDP_PORT setzen.
 try{await fetch('http://127.0.0.1:'+port+'/json/version');throw Error('CDP-Port '+port+' ist belegt (läuft schon eine Prüfung?) – CDP_PORT=<frei> setzen.');}catch(e){if(e.message.startsWith('CDP-Port'))throw e;}
 const profile=makeProfile('mertloch-mobile-');
 const proc=spawn(chrome,['--headless=new',...LEAN_ARGS,'--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--hide-scrollbars','--window-size=900,900','about:blank'],{stdio:'ignore'});profiles.set(proc,profile);
 for(let i=0;i<60;i++){await wait(250);try{const t=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(t.some(x=>x.type==='page'))return proc;}catch{}}
 killTree(proc);throw Error('Chrome antwortet nicht auf Port '+port);
}
async function connect(){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const target=targets.find(t=>t.type==='page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text+' '+(d.params.exceptionDetails.exception?.description||''));if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{const id=++serial;const timer=setTimeout(()=>{pending.delete(id);rej(Error('CDP-Zeitschranke 40 s: '+method));},40000);pending.set(id,{resolve:v=>{clearTimeout(timer);res(v);},reject:e=>{clearTimeout(timer);rej(e);}});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 return {send,evaluate,errors,close:()=>ws.close(),
  async device(width,height,dsf=2){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dsf,mobile:true,screenOrientation:{type:width>height?'landscapePrimary':'portraitPrimary',angle:width>height?90:0}});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});},
  // Seit dem Anmeldebildschirm (start-screen.js) liegt vor dem Spiel die Heldenauswahl: „Ins Dorf“ mit dem zuletzt gespielten
  // Helden (ohne Held legt die Prüfung einen an, wie browser-polish.mjs), danach den Einführungsfilm überspringen.
  async goto(u){await send('Page.navigate',{url:u});for(let i=0;i<200;i++){await wait(100);if(await evaluate('!!window.mertloch').catch(()=>false)){
   for(let j=0;j<50;j++){const open=await evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden)return false;s.querySelector('[data-start=guest]')?.click();const enter=s.querySelector('[data-start=enter]');if(enter){enter.click();return true;}const name=s.querySelector('[name=heroName]');if(name){if(!name.value)name.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return true;})()`).catch(()=>false);if(!open)break;await wait(100);}
   await evaluate(`document.querySelector('.intro-skip')?.click()`).catch(()=>{});return;}}throw Error('Spiel startet nicht');},
  async safe(w,h){await evaluate(`(s=>{for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');})(${JSON.stringify(SAFE(w,h))})`);},
  async rotate(w,h){await this.device(w,h);await this.safe(w,h);await wait(700);},
  /** Joystick-Probe: Berührung in der Mitte muss den Joystick greifen (state().mobile.joystick) und beim Loslassen freigeben. */
  async stickProbe(){const box=await evaluate(`(()=>{const el=document.querySelector('#touchStick');if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!box)return 'Joystick fehlt';await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await wait(120);const held=await evaluate(`!!window.mertloch?.state?.().mobile?.joystick`);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(120);const released=await evaluate(`!!window.mertloch?.state?.().mobile?.joystick`);if(!held)return 'Joystick greift nicht (Touch-Versatz?)';if(released)return 'Joystick bleibt nach Loslassen aktiv';return null;},
  /** Hilfe → Einstellungen → Admin → Stufe 6 → Gegner aufstellen; wartet auf touch-combat. kind: RegExp auf den Optionstext, count: Anzahl. */
  async arena(kind=null,count=1){await evaluate(`document.querySelector('.game-menu-rail [data-panel="map"]').click()`);await wait(300);await evaluate(`document.querySelector('[data-book-tab="guide"]')?.click()`);await wait(300);await evaluate(`[...document.querySelectorAll('.game-popup [role=tab]')].find(t=>/Einstellungen/.test(t.textContent))?.click()`);await wait(300);await evaluate(`document.querySelector('[data-shell="admin"]')?.click()`);await wait(500);await evaluate(`document.querySelector('[data-arena-level="6"]')?.click()`);await wait(200);if(kind)await evaluate(`(()=>{const s=document.querySelector('[data-arena-kind]');const o=[...s.options].find(o=>${kind}.test(o.text));if(o)s.value=o.value;const c=document.querySelector('[data-arena-count]');c.value=String(${count});})()`);await evaluate(`document.querySelector('[data-arena-spawn]')?.click()`);for(let i=0;i<40;i++){await wait(100);if(await evaluate(`document.body.classList.contains('touch-combat')`))return true;}return false;},
  async arenaClear(){await evaluate(`document.querySelector('.game-menu-rail [data-panel="map"]').click()`);await wait(300);await evaluate(`document.querySelector('[data-book-tab="guide"]')?.click()`);await wait(300);await evaluate(`[...document.querySelectorAll('.game-popup [role=tab]')].find(t=>/Einstellungen/.test(t.textContent))?.click()`);await wait(300);await evaluate(`document.querySelector('[data-shell="admin"]')?.click()`);await wait(400);await evaluate(`document.querySelector('[data-arena-clear]')?.click();document.querySelector('[data-arena-heal]')?.click()`);await wait(200);await evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);},
  async shot(name){try{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(dir,name+'.png'),Buffer.from(r.data,'base64'));}catch(e){errors.push('Bildschirmfoto '+name+' fehlgeschlagen: '+e.message);}},
  async tap(selector){const box=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;el.scrollIntoView({block:'center',inline:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!box)return false;await wait(150);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return true;},
  async longPress(selector,ms=800){const box=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;el.scrollIntoView({block:'center',inline:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!box)return false;await wait(150);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]});await wait(ms);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return true;}
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
 const utility=document.querySelector('#touchUtility'),toastEl=document.querySelector('#toast'),toast=toastEl&&vis(toastEl)&&toastEl.textContent.trim()?box(toastEl):null;
 const lamps=[...document.querySelectorAll('#touchActions .touch-slot')].map(w=>{const b=w.querySelector('button'),e=w.querySelector('.touch-lamp');const cd=b.querySelector('.cooldown')?.textContent||'';const expect=b.classList.contains('proc-free')?'✦':b.classList.contains('proc-empower')?'✦✦':b.classList.contains('proc-ready')?'✦':cd;const shown=e&&vis(e)&&!e.hidden;const r=e?box(e):null,bb=box(b);return {skill:b.dataset.touchSkill||'',expect,text:shown?e.textContent.trim():'',aboveButton:!shown||r.y+r.h<=bb.y+Math.min(6,bb.h*.15)};});
 const combat=document.body.classList.contains('touch-combat');
 const topline=document.querySelector('.touch-topline'),toplineShown=!!topline&&vis(topline)&&getComputedStyle(topline).display!=='none';
 const emptyShown=[...document.querySelectorAll('#touchSkills .touch-empty')].filter(e=>vis(e)&&getComputedStyle(e).visibility!=='hidden').length;
 const configureShown=(()=>{const c=document.querySelector('#touchConfigure');return !!c&&vis(c)&&getComputedStyle(c).display!=='none';})();
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
 const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
 const rgba=s=>{const m=s&&s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(',').map(Number);return {c:p.slice(0,3),a:p.length>3?p[3]:1};};
 const blend=(fg,bg,a)=>fg.map((v,i)=>Math.round(v*a+bg[i]*(1-a)));
 const bgOf=el=>{let e=el,acc=null;const push=c=>{if(!c||c.a<=0)return false;if(acc===null){acc={c:c.c,a:c.a};return c.a>=.95;}acc={c:blend(acc.c,c.c,acc.a),a:acc.a+c.a*(1-acc.a)};return acc.a>=.95;};
  while(e&&e!==document.documentElement){const cs=getComputedStyle(e);const img=cs.backgroundImage;if(img&&img!=='none'){if(/gradient\\(/.test(img)){const first=img.match(/rgba?\\([^)]+\\)/);if(first&&push(rgba(first[0])))return acc.c;}else return null;}if(push(rgba(cs.backgroundColor)))return acc.c;e=e.parentElement;}return acc?blend(acc.c,[37,54,43],acc.a):[37,54,43];};
 const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);};
 const READ=new Set(['P','LI','TD','DD','DT','BLOCKQUOTE']);
 // Text außerhalb des Scrollfensters oder unter einem anderen Fenster ist nicht sichtbar.
 const visibleText=e=>{if(!vis(e))return false;const r=e.getBoundingClientRect(),body=e.closest('.popup-body'),c=body?.getBoundingClientRect();const left=Math.max(0,r.left,c?.left??0),top=Math.max(0,r.top,c?.top??0),right=Math.min(innerWidth,r.right,c?.right??innerWidth),bottom=Math.min(innerHeight,r.bottom,c?.bottom??innerHeight);if(right<=left||bottom<=top)return false;if(e.closest('.item-tooltip,.skill-tooltip'))return true;const hit=document.elementFromPoint((left+right)/2,(top+bottom)/2);return !!hit&&(e.contains(hit)||hit===e);};
 const textEls=[...document.querySelectorAll('.game-popup .popup-body *, .game-popup .popup-titlebar *, #itemTooltip *, #skillTooltip *, .target-title, .attack-warning, #combatState, #mobileControls *, #tutorialGuide *, #toast')].filter(e=>visibleText(e)&&!e.closest('[disabled],.locked,.unusable,[aria-disabled=true],canvas,svg')&&[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()));
 const textSmall=[],textTiny=[],contrast=[];
 for(const e of textEls){const cs=getComputedStyle(e);const fs=parseFloat(cs.fontSize),read=READ.has(e.tagName)||(e.tagName==='SPAN'&&READ.has(e.parentElement.tagName));const t=(e.textContent||'').trim().slice(0,24);if(fs<10)textTiny.push(t+' '+fs+'px');else if(read&&fs<12)textSmall.push(t+' '+fs+'px');if(parseFloat(cs.opacity)<.5)continue;const fg=rgba(cs.color);if(!fg)continue;const eb=e.getBoundingClientRect();if(!e.closest('.item-tooltip,.skill-tooltip')&&document.elementsFromPoint(eb.x+eb.width/2,eb.y+eb.height/2).some(u=>(u.tagName==='IMG'||u.tagName==='CANVAS')&&!e.contains(u)))continue;const bg=bgOf(e);if(!bg)continue;const fgc=fg.a<1?blend(fg.c,bg,fg.a):fg.c;const need=fs>=24||(fs>=18.66&&parseInt(cs.fontWeight)>=700)?3:4.5;const r=ratio(fgc,bg);if(r<need)contrast.push(t+' '+r.toFixed(1)+':1 '+cs.color+' auf rgb('+bg.join(',')+')');}
 const hud=[stick,skills,utility].filter(e=>e&&vis(e)).map(box);const world=document.querySelector('#world');const canvas=world?box(world):null;
 return {canvas,dead:!!document.querySelector('.popup-death'),textSmall,textTiny,contrast,textCount:textEls.length,toast,toastOverHud:!!toast&&hud.some(h=>overlap(toast,h)),lamps,combat,toplineShown,emptyShown,configureShown,touch:document.body.classList.contains('touch-mode'),vw:innerWidth,vh:innerHeight,scrollW:document.documentElement.scrollWidth,popups,corners,unsafe,safe:S,hand:document.body.dataset.touchHand,stick:stick&&vis(stick)?box(stick):null,skills:skills&&vis(skills)?box(skills):null,
  overlapStick:popups.filter(p=>overlap(p,stick&&box(stick))).map(p=>p.id),overlapSkills:popups.filter(p=>overlap(p,skills&&box(skills))).map(p=>p.id),
  offscreen:popups.filter(p=>p.x<0||p.y<0||p.x+p.w>innerWidth+1||p.y+p.h>innerHeight+1).map(p=>p.id),targets:targets.length,small,gaps,text};
})()`;

let b0=await launch(),b=await connect();const report=[],audits=[];let failures=0;
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
   ['linkshand',()=>b.evaluate(`document.body.dataset.touchHand='left'`)],
   ['arena',async()=>{await b.evaluate(`document.body.dataset.touchHand='right';document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.arena();}],
   ['kampf-hud',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);}],
   ['kampf-figur',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`)],
   ['kampf-toast',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.evaluate(`document.querySelector('#touchTarget').click()`);}],
   ['kampf-kniff',async()=>{for(const sel of ['#touchSpecials [data-touch-skill="dash"]','#touchSkills .touch-slot:nth-child(2) [data-touch-skill]','#touchSkills .touch-slot:nth-child(3) [data-touch-skill]','#touchSkills .touch-slot:nth-child(4) [data-touch-skill]']){await b.tap(sel);await wait(220);}}],
   ['arena-raeumen',async()=>{await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.arenaClear();}],
   ['drehen',async()=>{const out=[];await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`);await wait(400);await b.rotate(h,w);const r=await b.evaluate(AUDIT);await b.shot(name+'-drehen-gedreht');if(!r.popups.some(p=>p.id==='person'))out.push('Fenster nach Drehen zu (M-17)');if(r.offscreen.length)out.push('Fenster nach Drehen außerhalb: '+r.offscreen.join(','));if(r.overlapStick.length||r.overlapSkills.length)out.push('Fenster nach Drehen über HUD');if(!r.stick||r.stick.x<r.safe.left||r.stick.y+r.stick.h>r.vh-r.safe.bottom)out.push('Joystick nach Drehen nicht im sicheren Bereich');await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);const probe=await b.stickProbe();if(probe)out.push(probe+' (gedreht)');await b.rotate(w,h);await b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`);await wait(300);return out;}],
   ['unterbrechung',async()=>{const out=[];await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);const before=await b.evaluate(`document.querySelectorAll('.game-popup').length`);await b.evaluate(`window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'))`);await wait(300);const after=await b.evaluate(`document.querySelectorAll('.game-popup').length`);if(after>before)out.push('Unterbrechung öffnet Fenster (M-15)');if(await b.evaluate(`!!window.mertloch?.state?.().mobile?.joystick`))out.push('Joystick nach Unterbrechung aktiv');await b.tap('#touchTarget');await wait(300);if(!await b.evaluate(`document.querySelector('#toast')?.classList.contains('visible')`))out.push('Ein Tipp nach Unterbrechung ohne Wirkung (M-15)');return out;}],
   ['gespraech',async()=>{const out=[];await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);if(await b.evaluate(`document.querySelector('#touchInteract').disabled`)){await b.evaluate(`document.querySelector('#touchWaypoint:not([hidden])')?.click()`);for(let i=0;i<50;i++){await wait(200);if(!await b.evaluate(`document.querySelector('#touchInteract').disabled`))break;}if(await b.evaluate(`document.querySelector('#touchInteract').disabled`))return ['Aktion-Knopf gesperrt: kein Gespräch in Reichweite (auch nach Wegmarke)'];}/* Steht Ida außer Reichweite, führt der erste Tipp nur zu ihr (Hofprobe, wie F am Desktop): dann ankommen lassen */const near=()=>b.evaluate(`Math.hypot(game.player.x-game.world.npc.x,game.player.y-game.world.npc.y)<50`);if(!await near()&&await b.evaluate(`document.querySelector('#touchInteract span')?.textContent!=='Beute'`)){await b.tap('#touchInteract');for(let i=0;i<50&&!await near();i++)await wait(200);}/* Liegt Beute in Reichweite, nimmt der erste Tipp sie (Knopf zeigt „Beute“) – wie ein Spieler erst einsammeln */for(let i=0;i<4&&await b.evaluate(`document.querySelector('#touchInteract span')?.textContent==='Beute'`);i++){await b.tap('#touchInteract');await wait(500);await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);}
   await b.tap('#touchInteract');await wait(600);if(!await b.evaluate(`!!document.querySelector('.popup-dialog')`))out.push('Kein Gesprächsfenster nach Aktion – '+await b.evaluate(`JSON.stringify({it:game.interaction?.()?.kind||null,label:document.querySelector('#touchInteract')?.textContent,inCombat:Math.round(game.player.inCombat*10)/10,ida:Math.round(Math.hypot(game.player.x-game.world.npc.x,game.player.y-game.world.npc.y)),windows:[...document.querySelectorAll('[data-window]')].map(e=>e.dataset.window),tut:game.tutorial?.step,scroll:[scrollX,scrollY,document.scrollingElement.scrollTop],under:(()=>{const r=document.querySelector('#touchInteract').getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return (t?.closest('button')?.id||t?.id||t?.className||t?.tagName)+' @'+Math.round(r.x+r.width/2)+','+Math.round(r.y+r.height/2);})(),paused:game.paused,dead:game.dead})`));return out;}],
   ['tod',async()=>{const out=[];await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await b.arena('/Boss/',8);let dead=false;for(let i=0;i<60&&!dead;i++){await wait(500);dead=await b.evaluate(`!!document.querySelector('.popup-death')`);}if(!dead)out.push('Kein Todesfenster nach 30 s Arena-Boss × 8');await b.rotate(h,w);const r=await b.evaluate(AUDIT);await b.shot(name+'-tod-gedreht');if(dead&&!r.dead)out.push('Todesfenster nach Drehen weg (M-17)');await b.rotate(w,h);return out;}],
   ['tod-zurueck',async()=>{const out=[];if(!await b.evaluate(`!!document.querySelector('#respawn')`))return ['Kein Aufsteh-Knopf'];await b.tap('#respawn');let r;for(let i=0;i<10;i++){await wait(250);r=await b.evaluate(`({popups:[...document.querySelectorAll('.game-popup')].map(p=>p.dataset.window+(p.hidden||getComputedStyle(p).display==='none'?'(unsichtbar)':'')),dead:!!document.querySelector('.popup-death')})`);if(!r.popups.length&&!r.dead)break;}if(r.dead||r.popups.length)out.push('Nach einem Tipp nicht zurück im Spiel: '+r.popups.join(',')+' (M-15)');if(!await b.evaluate(`window.mertloch.state().memories.includes('wurst-ins-gesicht')`))out.push('Todes-Erinnerung fehlt im Tagebuch');await b.arenaClear();return out;}]];
  for(const [step,run] of steps){
   const extra=await run();await wait(650);
   const a=await b.evaluate(AUDIT);await b.shot(name+'-'+step);audits.push({device:name,step,...a,text:undefined});
   const notes=(Array.isArray(extra)?extra:[]).filter(x=>x.startsWith('(Hinweis)'));const problems=(Array.isArray(extra)?extra:[]).filter(x=>!x.startsWith('(Hinweis)'));
   if(a.canvas&&(a.canvas.w<a.vw-6||a.canvas.h<a.vh-6))problems.push('Spielfläche füllt den Viewport nicht (M-18): '+a.canvas.w+'×'+a.canvas.h+' in '+a.vw+'×'+a.vh);
   if(!a.touch)problems.push('Touch-Modus nicht aktiv');
   if(a.scrollW>a.vw+1)problems.push('Seite breiter als Viewport: '+a.scrollW+' > '+a.vw);
   if(a.offscreen.length)problems.push('Fenster außerhalb: '+a.offscreen.join(','));
   if(a.overlapStick.length)problems.push('Fenster über Joystick: '+a.overlapStick.join(','));
   if(a.overlapSkills.length)problems.push('Fenster über Kniff-Knöpfen: '+a.overlapSkills.join(','));
   if(a.corners.length)problems.push('Tipp-Ziel in Bildschirmecke (< '+CORNER+' px): '+a.corners.slice(0,4).join(' | '));
   if(a.unsafe.length)problems.push('Tipp-Ziel in Safe Area: '+a.unsafe.slice(0,4).join(' | '));
   if(a.toastOverHud)problems.push('Toast über Joystick/Kniffen/Ziel-Aktion (M-04)');
   if(a.textTiny.length)problems.push('Text unter 10 px (M-12): '+a.textTiny.slice(0,4).join(' | '));
   if(a.contrast.length)problems.push('Kontrast unter 4,5:1 (M-12): '+a.contrast.slice(0,3).join(' | '));
   if(step.startsWith('kampf')){if(!a.combat)problems.push('Kampf nicht aktiv (touch-combat fehlt)');if(a.toplineShown)problems.push('Ortszeile im Kampf sichtbar (M-10)');if(a.emptyShown)problems.push('Leere Kniff-Plätze im Kampf sichtbar (M-10): '+a.emptyShown);}
   if(a.configureShown)problems.push('Konfigurieren-Knopf im HUD (M-10)');
   {const wrong=a.lamps.filter(l=>l.text!==l.expect);if(wrong.length)problems.push('Lampe spiegelt Knopf nicht (M-04): '+wrong.map(l=>l.skill+' „'+l.text+'“≠„'+l.expect+'“').slice(0,3).join(' | '));if(a.lamps.some(l=>!l.aboveButton))problems.push('Lampe liegt im Knopf statt darüber (M-04)');if(step==='kampf-kniff'&&!a.lamps.some(l=>l.text))problems.push('Keine Lampe nach Kniff-Einsatz (M-04): kein Knopf mit Abklingzeit oder Proc');}
   if(step==='linkshand'){if(a.hand!=='left')problems.push('Linkshand nicht gesetzt');else if(!(a.stick&&a.skills&&a.stick.x>a.skills.x))problems.push('Linkshand: Joystick nicht rechts der Kniffe');}
   const tiny=a.small.filter(s=>Math.min(s.w,s.h)<32);if(tiny.length)problems.push('Tipp-Ziele unter 32 px: '+tiny.map(s=>s.text||s.sel).slice(0,6).join(' | '));
   const m=a.text.match(DESKTOP_WORDS);if(m)problems.push('Desktop-Begriff sichtbar: „'+m[0]+'“');
   const warn=a.small.filter(s=>Math.min(s.w,s.h)>=32);
   report.push({device:name,step,problems,textSmall:a.textSmall.length,textSmallList:a.textSmall.slice(0,3).join(' | '),warn:warn.length,warnList:[...warn.map(s=>s.text+' '+s.w+'×'+s.h),...notes].join(' | '),gaps:a.gaps.length,gapList:a.gaps.slice(0,4).map(g=>g.a+'↔'+g.b+' '+g.gap+'px').join(' | '),targets:a.targets,popups:a.popups.map(p=>p.id+' '+p.w+'×'+p.h+'@'+p.x+','+p.y).join(' ')});
   if(problems.length)failures++;
  }
  await b.evaluate(`document.body.dataset.touchHand='right'`);
 }
 if(SESSION){
 // Spielstand-Fixture: Hofprobe abgeschlossen, Auto-Loot aus, ein Beutel neben dem Spieler (M-16: Zustand kommt aus dem Speicher).
 const fixture=await b.evaluate(`(()=>{const key=Object.keys(localStorage).find(k=>/^mertloch-chronicles-v2-/.test(k));if(!key)return 'kein Spielstand';const s=JSON.parse(localStorage.getItem(key));if(!s.position||!Number.isFinite(s.position.x))return 'Spielstand ohne Position';s.tutorial={...(s.tutorial||{}),completed:true};s.settings={...(s.settings||{}),autoLoot:false};s.rpg=s.rpg||{};s.rpg.loot=[{id:'drop-fixture',x:s.position.x+24,y:s.position.y,coins:12,items:[{id:'brezel',count:2}],source:{name:'Prüf-Beutel',kind:'enemy'}}];localStorage.setItem(key,JSON.stringify(s));const orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)return;return orig.call(this,k,v);};return 'ok';})()`);
 for(const [name,w,h] of ALL_DEVICES.slice(0,2)){
  await b.device(w,h);await b.goto(url);await wait(1500);await b.safe(w,h);await wait(300);
  const steps=[['beute',async()=>{const out=[];if(fixture!=='ok')return ['Fixture: '+fixture];await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(300);const label=await b.evaluate(`document.querySelector('#touchInteract span')?.textContent`);if(label!=='Beute')out.push('Aktion-Knopf zeigt „'+label+'“ statt „Beute“');await b.tap('#touchInteract');await wait(600);if(!await b.evaluate(`!!document.querySelector('.popup-loot')`))out.push('Kein Beutefenster nach Aktion');return out;}],
   ['wiederkehr',async()=>{const out=[];await b.goto(url);await wait(1500);const n=await b.evaluate(`document.querySelectorAll('.game-popup').length`);if(n>1)out.push('Nach Neuladen '+n+' Fenster übereinander (M-15)');if(n===1){await b.evaluate(`document.querySelector('.game-popup [data-window-close]')?.click()`);await wait(300);if(await b.evaluate(`document.querySelectorAll('.game-popup').length`))out.push('Nach einem Tipp nicht zurück im Spiel (M-15)');}return out;}]];
  for(const [step,run] of steps){const extra=await run();await wait(500);const a=await b.evaluate(AUDIT);await b.shot(name+'-'+step);audits.push({device:name,step,...a,text:undefined});const problems=extra.slice();if(a.offscreen.length)problems.push('Fenster außerhalb: '+a.offscreen.join(','));if(a.overlapStick.length||a.overlapSkills.length)problems.push('Fenster über HUD');const m=a.text.match(DESKTOP_WORDS);if(m)problems.push('Desktop-Begriff sichtbar: „'+m[0]+'“');if(a.textTiny.length)problems.push('Text unter 10 px: '+a.textTiny.slice(0,3).join(' | '));if(a.contrast.length)problems.push('Kontrast unter 4,5:1: '+a.contrast.slice(0,3).join(' | '));const small=a.small.filter(s=>Math.min(s.w,s.h)<32);if(small.length)problems.push('Tipp-Ziele unter 32 px: '+small.map(s=>s.text).slice(0,4).join(' | '));report.push({device:name,step,problems,textSmall:a.textSmall.length,textSmallList:'',warn:a.small.filter(s=>Math.min(s.w,s.h)>=32).length,warnList:a.small.filter(s=>Math.min(s.w,s.h)>=32).map(s=>s.text+' '+s.w+'×'+s.h).join(' | '),gaps:a.gaps.length,gapList:a.gaps.slice(0,4).map(g=>g.a+'↔'+g.b+' '+g.gap+'px').join(' | '),targets:a.targets,popups:a.popups.map(p=>p.id+' '+p.w+'×'+p.h+'@'+p.x+','+p.y).join(' ')});if(problems.length)failures++;}
 }
 // Seitenverhältnisse (M-18): 21:9, 9:21, 16:10, 4:3 – Spielfläche füllt den Viewport, HUD im Bild.
 for(const [name,w,h] of [['21-9',1000,428],['9-21',428,1000],['16-10',1280,800],['4-3',1024,768]]){
  await b.device(w,h,1);await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());for(const k of ['top','bottom','left','right'])document.body.style.removeProperty('--safe-'+k)`);await wait(800);
  const a=await b.evaluate(AUDIT);await b.shot('format-'+name);audits.push({device:'format',step:name,...a,text:undefined});const problems=[];
  if(!a.touch)problems.push('Touch-Modus nicht aktiv');if(a.canvas&&(a.canvas.w<a.vw-6||a.canvas.h<a.vh-6))problems.push('Spielfläche füllt den Viewport nicht (M-18): '+a.canvas.w+'×'+a.canvas.h+' in '+a.vw+'×'+a.vh);if(a.scrollW>a.vw+1)problems.push('Seite breiter als Viewport');if(a.corners.length)problems.push('Tipp-Ziel in Bildschirmecke: '+a.corners.slice(0,3).join(' | '));if(!a.stick||!a.skills)problems.push('Joystick oder Kniffe fehlen');
  report.push({device:'format',step:name,problems,textSmall:0,textSmallList:'',warn:0,warnList:'',gaps:0,gapList:'',targets:a.targets,popups:''});if(problems.length)failures++;
 }
 }
 // Chrome kann nach vielen Touch-Rotationen beim Wechsel zum Desktop-Compositor hängen.
 // Die Desktop-Gegenprobe bekommt deshalb einen eigenen Browserprozess und einen frischen Spielstand.
 const mobileErrors=b.errors.slice();b.close();const stopped=new Promise(r=>b0.once('exit',r));killTree(b0);await stopped;
 b0=await launch();b=await connect();b.errors.push(...mobileErrors);await b.goto(url);
 await b.send('Emulation.clearDeviceMetricsOverride');await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.send('Emulation.setDeviceMetricsOverride',{width:2024,height:900,deviceScaleFactor:1,mobile:false});
 await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop',size:'normal',layouts:{}}))`);await b.goto(url);await wait(1500);
 const d=await b.evaluate(`({touch:document.body.classList.contains('touch-mode'),controls:getComputedStyle(document.querySelector('#mobileControls')).display,rail:!!document.querySelector('.game-menu-rail')&&getComputedStyle(document.querySelector('.game-menu-rail')).display!=='none'})`);await b.shot('desktop-2024x900');
 const dp=[];if(d.touch)dp.push('Touch-Modus am Desktop aktiv');if(d.controls!=='none')dp.push('Touch-HUD am Desktop sichtbar');if(!d.rail)dp.push('Menüleiste am Desktop fehlt');
 report.push({device:'desktop',step:'2024x900',problems:dp,warn:0,warnList:'',gaps:0,gapList:'',targets:0,popups:''});if(dp.length)failures++;
 // Desktop-Kontrast und Beschreibungen: dieselben realen Fenster und Hover-Tooltips wie im Spiel.
 const hover=async selector=>{await b.evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`);await wait(300);const pos=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Tooltip-Ziel fehlt: '+${JSON.stringify(selector)}+' · Fenster '+(document.querySelector('.game-popup .popup-titlebar strong')?.textContent||'keins')+' · Klasse '+game.member?.id+' · Stufe '+game.rpg?.level+' · vorhanden '+[...document.querySelectorAll('[data-tooltip-skill],[data-tooltip-talent]')].map(x=>x.dataset.tooltipSkill||x.dataset.tooltipTalent).slice(0,8).join(','));const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...pos});await wait(300);assert.equal(await b.evaluate(`document.querySelector('#itemTooltip').classList.contains('hidden')`),false,'Tooltip muss sichtbar sein');};
 // Talente gibt es erst ab Stufe 6 (Freischaltung): wie die Arena-Schritte über Hilfe → Einstellungen → Admin anheben, ohne Kampf.
 const toLevel6=async()=>{for(const js of [`document.querySelector('.game-menu-rail [data-panel="map"]').click()`,`document.querySelector('[data-book-tab="guide"]')?.click()`,`[...document.querySelectorAll('.game-popup [role=tab]')].find(t=>/Einstellungen/.test(t.textContent))?.click()`,`document.querySelector('[data-shell="admin"]')?.click()`,`document.querySelector('[data-arena-level="6"]')?.click()`,`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`]){await b.evaluate(js);await wait(300);}};
 await toLevel6();
 const desktopSteps=[
  ['figur',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="person"]').click()`)],
  // Kniffe und Talente stehen in eigenen Reitern (seit der Werte-Umstellung E-53), nicht mehr im Figur-Reiter.
  ['kelle',async()=>{await b.evaluate(`document.querySelector('[data-book-tab="book"]')?.click()`);await wait(300);await hover('[data-tooltip-skill="strike"]');/* Soll-Wert aus dem Kampfmodell (content/combat.js) statt fest verdrahtet – überlebt jede Balancing-Runde */const model=await b.evaluate(`import('./content/combat.js').then(m=>m.SKILL_DAMAGE.dieter.strike)`),tip=await b.evaluate(`document.querySelector('#itemTooltip').innerText`);assert.match(tip,new RegExp(Math.round(model.weapon*100)+'\\s*% Autoschaden \\+ '+model.flat+' fester Schaden'),'Kelle-Tooltip folgt nicht dem Kampfmodell');}],
  ['talent',async()=>{await b.evaluate(`document.querySelector('[data-book-tab="talents"]')?.click()`);await wait(300);await hover('[data-tooltip-talent="dieter-wall-0"]');assert.match(await b.evaluate(`document.querySelector('#itemTooltip').innerText`),/Betroffene Kniffe:.*Kronkorken-Kelle/s);}],
  ['auftraege',()=>b.evaluate(`document.querySelector('.game-menu-rail [data-panel="quest"]').click()`)],
  ['hilfe',()=>b.evaluate(`document.querySelector('[data-book-tab="guide"]').click()`)]
 ];
 for(const [step,run] of desktopSteps){await b.evaluate(`document.querySelector('#itemTooltip')?.classList.add('hidden')`);await run();await wait(350);const a=await b.evaluate(AUDIT);await b.shot('desktop-'+step);audits.push({device:'desktop',step,...a,text:undefined});const problems=[];if(a.offscreen.length)problems.push('Fenster außerhalb: '+a.offscreen.join(','));if(a.contrast.length)problems.push('Kontrast: '+a.contrast.join(' | '));report.push({device:'desktop',step,problems,warn:0,warnList:'',gaps:0,gapList:'',targets:0,popups:a.popups.map(p=>p.id).join(',')});if(problems.length)failures++;}

}finally{
 const lines=['# Mobile-Prüfung · '+new Date().toISOString().slice(0,10),'',`Adresse ${url} · Geräte ${DEVICES.map(d=>d[0]+' '+d[1]+'×'+d[2]).join(', ')} · ${failures} Schritte mit Fehlern von ${report.length}`,'','| Gerät | Schritt | Fenster | Ziele | Befund 32–43 px | Abstand < 8 px | Lesetext < 12 px | Probleme |','|---|---|---|---|---|---|---|---|',
  ...report.map(r=>`| ${r.device} | ${r.step} | ${r.popups||'–'} | ${r.targets} | ${r.warnList?(r.warn?r.warn+': ':'')+r.warnList:'–'} | ${r.gaps?r.gaps+': '+r.gapList:'–'} | ${r.textSmall?r.textSmall+': '+r.textSmallList:'–'} | ${r.problems.join('; ')||'–'} |`),'',`Befunde gesamt: ${report.reduce((n,r)=>n+r.warn,0)} Tipp-Ziele unter 44 px, ${report.reduce((n,r)=>n+r.gaps,0)} Paare mit Abstand unter 8 px (M-01/M-02), ${report.reduce((n,r)=>n+(r.textSmall||0),0)} Lesetexte unter 12 px (M-12).`,'',b.errors.length?'## Laufzeitfehler\n\n'+b.errors.map(e=>'- '+e.slice(0,200)).join('\n'):'Keine Laufzeitfehler.'];
 writeFileSync(join(dir,PART==='alle'?'REPORT.md':'REPORT-'+PART+'.md'),lines.join('\n'));writeFileSync(join(dir,PART==='alle'?'audit.json':'audit-'+PART+'.json'),JSON.stringify(audits,null,1));
 console.log(lines.join('\n'));
 b.close();killTree(b0);
}
assert.equal(failures,0,failures+' Schritte mit Problemen, siehe '+join(dir,'REPORT.md'));
assert.equal(b.errors.length,0,'Browserfehler, siehe '+join(dir,'REPORT.md'));
