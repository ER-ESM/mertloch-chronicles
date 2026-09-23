// Browserprüfung Welle D: ein Tooltip-Baustein mit Shift-Details, Nachschlagewerk „Kniffe“ mit Sprungzielen,
// Verpflegung auf der Aktionsleiste, Beute-Log und Auto-Loot-Schalter. Desktop 2024×900 und mobil 400 px.
//
// Aufruf:  node scripts/welle-d-check.mjs
// Das Skript startet den Server (PORT=4194) und einen eigenen Chrome mit Fernsteuerung selbst, meldet den
// Service Worker ab (damit nie eine alte Fassung geprüft wird) und legt die Bilder in welle-d-review/ ab.
// Vorhandener Server/Browser wird wiederverwendet: node scripts/welle-d-check.mjs http://localhost:4194/ 9334
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const url=process.argv[2]||'http://localhost:4194/';
const port=Number(process.argv[3]||process.env.CDP_PORT||9334);
const dir='welle-d-review';
mkdirSync(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const children=[];
const CHROMES=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
 '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);

async function reachable(target,tries=40){
 for(let i=0;i<tries;i++){try{const r=await fetch(target);if(r.ok||r.status===200)return true;}catch{}await wait(250);}
 return false;
}
/** Server und Browser selbst hochfahren, falls sie nicht schon laufen. */
async function boot(){
 if(!await reachable(url,2)){
  const port4194=new URL(url).port||'4194';
  children.push(spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port4194},stdio:'ignore'}));
  assert.ok(await reachable(url),'Server antwortet nicht auf '+url);
 }
 try{await fetch('http://127.0.0.1:'+port+'/json/version');return;}catch{}
 const exe=CHROMES.find(p=>existsSync(p));
 assert.ok(exe,'Kein Chrome/Edge gefunden. CHROME=<pfad> setzen.');
 const profile=join(tmpdir(),'welle-d-'+Date.now());
 children.push(spawn(exe,['--remote-debugging-port='+port,'--user-data-dir='+profile,'--headless=new',
  '--no-first-run','--no-default-browser-check','--disable-gpu','--window-size=2024,900','about:blank'],{stdio:'ignore'}));
 children.at(-1).profile=profile;
 assert.ok(await reachable('http://127.0.0.1:'+port+'/json/version'),'Chrome-Fernsteuerung antwortet nicht auf Port '+port);
}
/** Kleiner CDP-Treiber (wie scripts/akt1b-check.mjs), ohne npm-Paket. */
async function browser(){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
 const target=targets.find(t=>t.type==='page');assert.ok(target,'Keine Browserseite auf Port '+port);
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onclose=ev=>{for(const cb of pending.values())cb.reject(Error('CDP-Verbindung zu: '+ev.code));pending.clear();};
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);
  if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text||d.params.exceptionDetails.exception?.description);
  if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(a=>a.value).join(' '));
  if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{if(ws.readyState!==1){rej(Error('CDP-Verbindung geschlossen'));return;}
  const id=++serial;pending.set(id,{resolve:res,reject:rej});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 return {send,evaluate,errors,close:()=>ws.close(),
  async resize(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<800});},
  async open(target){await send('Page.navigate',{url:target});await wait(300);},
  async shot(name){const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(dir,name),Buffer.from(r.data,'base64'));}};
}

let code=0;
const b=await (async()=>{await boot();return browser();})();
try{
 await b.resize(2024,900);
 await b.open(url);
 // Nie gegen eine gecachte Fassung prüfen.
 await b.evaluate(`(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);localStorage.clear();})()`);
 await b.open(url);
 await b.evaluate(`new Promise(r=>{const t=setInterval(()=>{if(window.game){clearInterval(t);r(1);}},120);setTimeout(()=>{clearInterval(t);r(0);},20000);})`);
 assert.ok(await b.evaluate('!!window.game'),'Das Spiel ist nicht gestartet.');

 // --- 1. Tooltip auf einem Kniff: Zahlen ohne Shift, why/links/Begriffe mit Shift -----------------
 await b.evaluate(`(()=>{const g=window.game;g.player.level=9;g.refreshStats&&g.refreshStats();document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',bubbles:true}));})()`);
 await wait(500);
 const kacheln=await b.evaluate(`document.querySelectorAll('.kniff-tile').length`);
 assert.ok(kacheln>40,'Der Reiter „Kniffe“ zeigt zu wenige Kacheln: '+kacheln);
 const abschnitte=await b.evaluate(`JSON.stringify([...document.querySelectorAll('.kniff-section h3')].map(h=>h.textContent))`);
 for(const teil of ['Kniffe','Talente','Regeln'])assert.ok(abschnitte.includes(teil),'Abschnitt fehlt: '+teil+' · '+abschnitte);

 const hover=id=>`(async()=>{const el=document.getElementById(${JSON.stringify(id)});el.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,450));const r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',clientX:r.x+5,clientY:r.y+5}));await new Promise(r=>setTimeout(r,250));return 1;})()`;
 const shift=on=>`(async()=>{window.dispatchEvent(new KeyboardEvent('key${on?'down':'up'}',{key:'Shift',bubbles:true}));await new Promise(r=>setTimeout(r,250));return 1;})()`;
 await b.evaluate(shift(false));
 await b.evaluate(hover('kniff-skill-dieter-burst'));
 const ohne=JSON.parse(await b.evaluate(`(()=>{const t=document.querySelector('#itemTooltip');return JSON.stringify({offen:!t.classList.contains('hidden'),zahlen:t.querySelectorAll('.describe-numbers>div').length,detailsVersteckt:t.querySelector('.describe-details')?.hidden!==false,hinweis:(t.querySelector('.describe-hint')?.textContent||'')});})()`));
 assert.ok(ohne.offen,'Der Tooltip öffnet nicht.');
 assert.ok(ohne.zahlen>=5,'Zu wenige Zahlenzeilen im Tooltip: '+ohne.zahlen);
 assert.ok(ohne.detailsVersteckt,'Die Details stehen schon ohne Shift offen.');
 assert.ok(ohne.hinweis.includes('Shift'),'Die Hinweiszeile „Shift: Details“ fehlt.');
 await b.evaluate(shift(true));
 const mit=JSON.parse(await b.evaluate(`(()=>{const t=document.querySelector('#itemTooltip');return JSON.stringify({details:t.querySelector('.describe-details')?.hidden===false,why:(t.querySelector('.describe-why')?.textContent||'').length,links:[...t.querySelectorAll('.describe-link')].map(l=>l.dataset.describeJump),begriffe:t.querySelectorAll('.describe-terms dt').length});})()`));
 assert.ok(mit.details,'Shift blendet die Details nicht ein.');
 assert.ok(mit.why>10,'Der why-Text fehlt im Shift-Block.');
 assert.ok(mit.begriffe>0,'Die Glossarerklärungen fehlen im Shift-Block.');
 assert.ok(mit.links.length>0,'Die Verweise fehlen im Shift-Block.');
 await b.shot('wd-01-tooltip-shift.png');

 // --- 2. Verweis springt zum Element im Reiter „Kniffe“ -------------------------------------------
 const ziel=mit.links[0];
 await b.evaluate(`(async()=>{document.querySelector('#itemTooltip .describe-link').click();await new Promise(r=>setTimeout(r,700));return 1;})()`);
 const gesprungen=JSON.parse(await b.evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(ziel)});return JSON.stringify({da:!!el,markiert:!!el&&el.classList.contains('kniff-jumped'),oben:el?Math.round(el.getBoundingClientRect().top):-1});})()`));
 assert.ok(gesprungen.da,'Das Sprungziel '+ziel+' gibt es nicht.');
 assert.ok(gesprungen.oben>0&&gesprungen.oben<900,'Das Sprungziel liegt nicht im Bild: '+gesprungen.oben);
 await b.evaluate(shift(false));
 await b.shot('wd-02-sprungziel.png');

 // --- 3. Verpflegung per Drag auf Platz 8, Taste 8 benutzt sie ------------------------------------
 const gezogen=JSON.parse(await b.evaluate(`(async()=>{const g=window.game;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  g.rpg.inventory.some(e=>e.id==='kaltgetraenk')||g.rpg.inventory.push({id:'kaltgetraenk',count:3});
  g.emit('rpgChanged');await new Promise(r=>setTimeout(r,250));
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'i',bubbles:true}));await new Promise(r=>setTimeout(r,450));
  const src=document.querySelector('[data-item="kaltgetraenk"]'),slot=document.querySelector('#actionBar [data-action-slot="7"]');
  if(!src||!slot)return JSON.stringify({fehler:'Rucksackplatz oder Leistenplatz fehlt',src:!!src,slot:!!slot});
  /* Zeiger-Ziehen (2026-09-23, popup-controls.js): drücken, bewegen, über dem Platz loslassen */
  const at=el=>{const r=el.getBoundingClientRect();return {clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,pointerType:'mouse',button:0};};
  src.dispatchEvent(new PointerEvent('pointerdown',{...at(src),buttons:1}));
  document.dispatchEvent(new PointerEvent('pointermove',{...at(slot),buttons:1}));
  slot.dispatchEvent(new PointerEvent('pointerup',{...at(slot),buttons:0}));
  await new Promise(r=>setTimeout(r,450));
  const s=g.bar()[7];
  return JSON.stringify({art:s.kind,id:s.id,stapel:s.count,dom:document.querySelector('#actionBar [data-action-slot="7"]')?.dataset.barItem||null});})()`));
 assert.equal(gezogen.fehler,undefined,gezogen.fehler+'');
 assert.equal(gezogen.art,'item','Platz 8 hält keinen Gegenstand: '+JSON.stringify(gezogen));
 assert.equal(gezogen.id,'kaltgetraenk','Auf Platz 8 liegt der falsche Gegenstand: '+gezogen.id);
 assert.equal(gezogen.dom,'kaltgetraenk','Die Leiste zeichnet den Gegenstand nicht.');
 await b.shot('wd-03-leiste-verpflegung.png');
 const benutzt=JSON.parse(await b.evaluate(`(async()=>{const g=window.game;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  g.player.energy=5;g.rpg.consumableReady=0;const vorher=g.bar()[7].count;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'8',bubbles:true}));
  await new Promise(r=>setTimeout(r,600));const s=g.bar()[7];
  return JSON.stringify({vorher,nachher:s.count,abklingzeit:s.cooldown,dom:document.querySelector('#actionBar [data-action-slot="7"] .stack')?.textContent});})()`));
 assert.equal(benutzt.nachher,benutzt.vorher-1,'Taste 8 hat den Stapel nicht verringert: '+JSON.stringify(benutzt));
 assert.ok(benutzt.abklingzeit>0,'Nach dem Benutzen läuft keine Abklingzeit.');
 assert.equal(benutzt.dom,String(benutzt.nachher),'Die Stapelzahl am Platz stimmt nicht.');

 // --- 4. Kill → Beutezeile im Log → Hover zeigt den Gegenstands-Tooltip ---------------------------
 const beute=JSON.parse(await b.evaluate(`(async()=>{const g=window.game;g.settings.autoLoot=true;
  let n=0;for(const e of g.enemies){if(e.hp>0&&!e.ambient&&!e.arena&&n<14){g.kill(e);n++;}}
  await new Promise(r=>setTimeout(r,700));const log=[...document.querySelectorAll('#chatWindow .loot-line')];
  return JSON.stringify({kills:n,zeilen:log.length,beutelLiegen:g.rpg.loot.length,
   erste:log[0]?.dataset.tooltipItem||null,farbe:log[0]?.querySelector('b')?.className||null});})()`));
 assert.ok(beute.zeilen>0,'Auto-Loot schreibt keine Beutezeile ins Log: '+JSON.stringify(beute));
 assert.equal(beute.beutelLiegen,0,'Bei Auto-Loot bleibt ein Beutel liegen.');
 assert.ok(/^rarity-/.test(beute.farbe||''),'Die Beutezeile trägt keine Seltenheitsfarbe.');
 const beuteTip=JSON.parse(await b.evaluate(`(async()=>{const line=document.querySelector('#chatWindow .loot-line');const r=line.getBoundingClientRect();
  line.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',clientX:r.x+5,clientY:r.y+5}));
  await new Promise(r=>setTimeout(r,300));const t=document.querySelector('#itemTooltip');
  return JSON.stringify({offen:!t.classList.contains('hidden'),name:t.querySelector('strong')?.textContent||''});})()`));
 assert.ok(beuteTip.offen,'Der Hover über die Beutezeile zeigt keinen Tooltip.');
 assert.ok(beuteTip.name.length>0,'Der Beute-Tooltip hat keine Überschrift.');
 await b.shot('wd-04-beutelog.png');

 // --- 5. Auto-Loot aus → Beutefenster ------------------------------------------------------------
 const ausgeschaltet=JSON.parse(await b.evaluate(`(async()=>{const g=window.game;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'h',bubbles:true}));await new Promise(r=>setTimeout(r,450));
  const knopf=document.querySelector('[data-setting-toggle="autoLoot"]');if(!knopf)return JSON.stringify({fehler:'Der Auto-Loot-Schalter fehlt im Einstellungsreiter.'});
  knopf.click();await new Promise(r=>setTimeout(r,350));
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await new Promise(r=>setTimeout(r,200));
  for(const e of g.enemies)if(e.hp<=0){e.hp=e.maxHp;e.ai='idle';e.dead=0;e.respawnAt=0;e.aggro=false;}
  let n=0;for(const e of g.enemies){if(e.hp>0&&!e.ambient&&!e.arena&&n<25){g.kill(e);n++;}}
  await new Promise(r=>setTimeout(r,500));
  const bag=g.rpg.loot[0];if(!bag)return JSON.stringify({fehler:'Ohne Auto-Loot liegt kein Beutel'});
  g.moveTo=null;g.path=null;g.keys.clear();g.player.x=bag.x;g.player.y=bag.y;g.player.vx=0;g.player.vy=0;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true}));
  return JSON.stringify({autoLoot:g.settings.autoLoot,fenster:!!document.querySelector('.loot-icon-grid')});})()`));
 assert.equal(ausgeschaltet.fehler,undefined,ausgeschaltet.fehler+'');
 assert.equal(ausgeschaltet.autoLoot,false,'Der Schalter hat Auto-Loot nicht ausgeschaltet.');
 assert.ok(ausgeschaltet.fenster,'Ohne Auto-Loot öffnet das Beutefenster nicht.');
 await b.shot('wd-05-beutefenster.png');

 // --- 6. Mobil 400 px ----------------------------------------------------------------------------
 await b.resize(400,860);
 await wait(500);
 await b.evaluate(`(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',bubbles:true}));await new Promise(r=>setTimeout(r,500));return 1;})()`);
 const mobil=JSON.parse(await b.evaluate(`(()=>{const buch=document.querySelector('.kniff-book');const r=buch?.getBoundingClientRect();
  return JSON.stringify({buch:!!buch,breite:r?Math.round(r.width):0,ueberlauf:document.documentElement.scrollWidth>document.documentElement.clientWidth+1});})()`));
 assert.ok(mobil.buch,'Mobil fehlt das Nachschlagewerk im Reiter „Kniffe“.');
 assert.ok(mobil.breite<=400,'Mobil ist das Nachschlagewerk breiter als der Bildschirm: '+mobil.breite);
 assert.ok(!mobil.ueberlauf,'Mobil läuft die Seite waagerecht über.');
 await b.shot('wd-06-mobil-kniffe.png');

 const fehler=b.errors.filter(t=>t&&!/favicon|ResizeObserver/i.test(t));
 assert.deepEqual(fehler,[],'Konsolenfehler: '+fehler.join(' | '));
 console.log('Welle D: alle Prüfpunkte grün · Bilder in '+dir+'/');
}catch(error){
 console.error('Welle D: '+(error?.message||error));
 code=1;
}finally{
 b.close();
 for(const child of children){try{child.kill();}catch{}if(child.profile)try{rmSync(child.profile,{recursive:true,force:true});}catch{}}
 await wait(200);
 process.exit(code);
}
