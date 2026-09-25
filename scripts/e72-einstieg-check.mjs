// E-72 Runde 4 · Einstieg im echten Spiel (Kenner-Playtest 25.09. abends, Befunde 1–6): frischer Browser (kein SW, kein Cache, leerer
// localStorage) → Gast → Held erstellen → Neuladen mit Ladeschirm → Einführungsfilm (Leertaste/Enter blättern, Esc überspringt – als
// „rawKeyDown“ wie Playwright) → Hofprobe → Weltkarte „Hinlaufen“ in der Hofprobe (Meldung auf der Karte) → Hofprobe-Ende als Bildfolge
// (Kurzmeldung → Freischalt-Einblendung → Erinnerungskarte, nie gleichzeitig; Kampfstatistik öffnet sich nicht selbst) → Karte tritt bei
// Kampf und Tod zurück, kommt danach wieder, überdeckt die Kampfstatistik nicht → kein Fetzen doppelt. Konsolenfehler müssen 0 sein.
// Eigener Server und Wegwerf-Browser (Ports 9783/4383, per CDP_PORT/SERVER_PORT änderbar). Bilder: docs/e72-runde4/einstieg/*.jpg.
// Aufruf: node scripts/e72-einstieg-check.mjs [klasse]   (Standard kaethe)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readdirSync,rmSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde4/einstieg';mkdirSync(dir,{recursive:true});for(const f of readdirSync(dir))if(f.endsWith('.jpg'))rmSync(dir+'/'+f);
const cls=process.argv.slice(2).find(a=>!a.startsWith('-'))||'kaethe';
const b=await browserSession({port:Number(process.env.CDP_PORT||9783),serverPort:Number(process.env.SERVER_PORT||4383)});
const read=s=>b.evaluate(s),checks=[],shots=[],problems=[];
const W=1600,H=900;
/** Ausschnitt eines Elements in voller Schärfe (scale 1–2). */
const zoom=async(name,sel,pad=8,scale=1)=>{const r=await read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,Math.round(b.left-${pad})),y:Math.max(0,Math.round(b.top-${pad})),width:Math.round(b.width+${pad*2}),height:Math.round(b.height+${pad*2})};})()`);if(!r)return null;const p=dir+'/'+name+'.jpg';const d=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,clip:{...r,scale}});writeFileSync(p,Buffer.from(d.data,'base64'));shots.push(p);return p;};
const shot=async(name,scale=.6)=>{const p=dir+'/'+name+'.jpg';const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:scale<1?72:82,clip:{x:0,y:0,width:W,height:H,scale}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const ok=(cond,msg)=>{assert.ok(cond,msg);checks.push(msg);};
// Tasten wie Playwright (Sondertasten als rawKeyDown, Zeichen als keyDown mit text).
const KEYS={Escape:{code:'Escape',vk:27},' ':{code:'Space',vk:32,text:' '},Enter:{code:'Enter',vk:13,text:'\r'},f:{code:'KeyF',vk:70,text:'f'},m:{code:'KeyM',vk:77,text:'m'},v:{code:'KeyV',vk:86,text:'v'}};
const press=async key=>{const k=KEYS[key];await b.send('Input.dispatchKeyEvent',{type:k.text?'keyDown':'rawKeyDown',key,code:k.code,windowsVirtualKeyCode:k.vk,nativeVirtualKeyCode:k.vk,...(k.text?{text:k.text,unmodifiedText:k.text}:{})});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code:k.code,windowsVirtualKeyCode:k.vk,nativeVirtualKeyCode:k.vk});};
// Konsolenfehler: console.error, Ausnahmen und Ladefehler (404 usw.).
const consoleErrors=[];
b.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push('console.error: '+p.args.map(a=>a.value??a.description).join(' ').slice(0,300));});
b.on('Log.entryAdded',p=>{if(p.entry.level==='error')consoleErrors.push('log: '+p.entry.text+' '+(p.entry.url||''));});
const state=()=>read(`JSON.stringify({ms:(()=>{const m=document.querySelector('.milestone:not([hidden])');return m?[...m.children].map(c=>c.textContent.trim()).filter(Boolean).join(': ').slice(0,90):'';})(),
 card:(()=>{const c=document.querySelector('.memory-card:not([hidden])');return c?c.querySelector('strong')?.textContent||'?':'';})(),
 meter:(()=>{const m=document.querySelector('#combatMeter');return !!m&&!m.hidden&&getComputedStyle(m).display!=='none';})(),
 toast:document.querySelector('#toast.visible')?.textContent||'',dead:!!game.dead,combat:game.player.inCombat>0})`).then(JSON.parse);
const rects=()=>read(`JSON.stringify(['.memory-card','#combatMeter','.milestone'].map(s=>{const e=document.querySelector(s);if(!e||e.hidden||getComputedStyle(e).display==='none')return null;const r=e.getBoundingClientRect();return r.width?{l:r.left,r:r.right,t:r.top,b:r.bottom}:null;}))`).then(JSON.parse);
const overlap=(a,c)=>!!a&&!!c&&a.l<c.r&&a.r>c.l&&a.t<c.b&&a.b>c.t;
try{
 await b.send('Log.enable');await b.resize(W,H);
 // Frischer Browser: Wegwerf-Profil (browser-session.mjs) – trotzdem sicherstellen, dass nichts vorliegt.
 await b.send('Page.navigate',{url:b.url});
 for(let i=0;i<300&&!(await read('!!window.mertloch').catch(()=>false));i++)await wait(150);
 const fresh=JSON.parse(await read(`JSON.stringify({heroes:(()=>{try{return JSON.parse(localStorage.getItem('mertloch-characters')||'{}').list?.length||0;}catch{return -1;}})(),keys:Object.keys(localStorage).length,sw:!!navigator.serviceWorker?.controller})`));
 ok(fresh.heroes===0&&!fresh.sw,'frischer Browser: kein Held, keine Service-Worker-Kontrolle ('+JSON.stringify(fresh)+')');
 await wait(1500);
 ok(consoleErrors.length===0,'Seitenstart ohne Konsolenfehler ('+consoleErrors.length+')');
 await shot('00-anmeldung');
 // Die Statistik stand bei einem früheren Helden offen (Kenner spielte mehrere Helden in einem Browser).
 await read(`localStorage.setItem('mertloch-meter-ui-v1',JSON.stringify({desktop:true}))`);
 // Zeitmarken im Browser selbst (unabhängig vom Abfragetakt): Ladeschirm blendet ab / ist weg, Film sichtbar.
 const rec=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`addEventListener('DOMContentLoaded',()=>{const log=window.__einstieg=[],l=document.getElementById('loading'),t=()=>Math.round(performance.now());let film=false;new MutationObserver(()=>{const c=l.className,f=!!document.querySelector('.intro-film:not([hidden])');if(/boot-out/.test(c)&&!log.some(x=>x[0]==='boot-out'))log.push(['boot-out',t()]);if(/hidden/.test(c)&&!log.some(x=>x[0]==='hidden'))log.push(['hidden',t()]);if(f&&!film){film=true;log.push(['film',t()]);}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']});});`});
 // Gast → Klasse → Aussehen → Name → Erstellen (lädt neu)
 let picked=false;
 for(let i=0;i<120;i++){const st=await read(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden)return 'closed';const g=s.querySelector('[data-start=guest]');if(g){g.click();return 'guest';}
  const k=s.querySelector('[data-draft-class="${cls}"]');if(k&&!${picked}){k.click();return 'class';}
  const n=s.querySelector('[name=heroName]');if(n){n.value='Einstieg';s.querySelector('[data-start=draft-next]')?.click();return 'name';}
  const d=s.querySelector('[data-start=draft-next]');if(d){d.click();return 'next';}const c=s.querySelector('[data-start=create]');if(c){c.click();return 'create';}return 'wait';})()`).catch(()=>'nav');
  if(st==='class')picked=true;if(st==='nav'||st==='closed')break;await wait(250);}
 // Neuladen: Ladeschirm → Film. Der Film darf erst beginnen, wenn der Ladeschirm abblendet, und muss sofort decken.
 const t0=Date.now(),line=[];let prev='',loadShot=false,firstIntro=null;
 for(let i=0;i<400;i++){const s=await read(`JSON.stringify({load:document.querySelector('#loading')?.className||'',intro:!!document.querySelector('.intro-film:not([hidden])'),bg:(()=>{const e=document.querySelector('.intro-film:not([hidden])');return e?getComputedStyle(e).backgroundColor:'';})()})`).catch(()=>null);
  if(!s){await wait(60);continue;}const v=JSON.parse(s);if(s!==prev){line.push((Date.now()-t0)+' ms '+s);prev=s;}
  if(!loadShot&&/art-ready/.test(v.load)&&!/boot-out|hidden/.test(v.load)){loadShot=true;await shot('01-ladeschirm');}
  if(v.intro&&!firstIntro){firstIntro=v;await shot('02-film-erstes-bild');break;}await wait(50);}
 ok(!!firstIntro,'Film startet nach dem Neuladen');
 ok(/boot-out|hidden/.test(firstIntro.load),'Film beginnt erst, wenn der Ladeschirm abblendet ('+firstIntro.load+')');
 await b.send('Page.removeScriptToEvaluateOnNewDocument',rec);
 const marks=Object.fromEntries(JSON.parse(await read('JSON.stringify(window.__einstieg||[])')));line.push('Zeitmarken im Browser (ms): '+JSON.stringify(marks));
 ok(marks.film>=marks['boot-out'],'Zeitmarken: Ladeschirm blendet ab ('+marks['boot-out']+') → Film ('+marks.film+') → Ladeschirm weg ('+marks.hidden+')');
 ok(firstIntro.bg&&firstIntro.bg!=='rgba(0, 0, 0, 0)','erste Szene deckt sofort (Grund '+firstIntro.bg+') – kein Ladeschirmtext darunter');
 await wait(1400);await shot('03-film');
 const scene=()=>read(`[...document.querySelectorAll('.intro-progress i')].findIndex(i=>i.classList.contains('on'))`);
 const s0=await scene();await press(' ');await wait(350);const s1=await scene();await press('Enter');await wait(350);const s2=await scene();
 ok(s1===s0+1&&s2===s0+2,'Leertaste und Enter blättern weiter ('+s0+' → '+s1+' → '+s2+')');
 await shot('04-film-szene-3');
 await press('Escape');await wait(500);
 ok(await read(`!document.querySelector('.intro-film:not([hidden])')&&!document.body.classList.contains('intro-open')`),'Esc überspringt den Film');
 ok(await read(`game.member.id`)===cls,'Held der Klasse '+cls);
 await shot('05-nach-esc-ida');
 // Hofprobe beginnen (Idas Gespräch öffnet sich nach dem Film)
 for(let i=0;i<20&&!(await read(`!!document.querySelector('[data-tutorial-next]')`));i++)await wait(200);
 await read(`document.querySelector('[data-tutorial-next]')?.click()`);await wait(600);
 ok(await read('game.tutorial.step')===1,'Hofprobe läuft (Schritt 2/8)');
 // Weltkarte: „Hinlaufen“ zum Grillplatz ist in der Hofprobe gesperrt – die Karte sagt warum.
 await press('m');await wait(1200);
 const walk=await read(`(()=>{const b=[...document.querySelectorAll('[data-navigate]')].find(b=>/Grill/i.test(b.getAttribute('aria-label')||''));if(!b)return null;b.click();const n=document.querySelector('.wk-notice');return JSON.stringify({text:n&&!n.hidden?n.textContent:'',moving:!!game.moveTo,map:!!document.querySelector('.popup-map')});})()`);
 ok(!!walk,'Weltkarte mit „Hinlaufen: Grillplatz“');const w=JSON.parse(walk);
 ok(w.map&&!w.moving&&/Hofprobe/.test(w.text),'Hinlaufen in der Hofprobe: Karte bleibt offen und sagt „'+w.text+'“');
 await wait(250);await shot('06-karte-hofprobe-meldung');await zoom('06b-karte-meldung-nah','.wk-notice',40);
 await press('Escape');await wait(400);
 // Hofprobe bis zur Rückkehr zu Ida vorspulen (die Schritte 2–7 prüfen andere Skripte), dann das echte Ende über F und Idas Knopf.
 await read(`(()=>{const t=game.tutorial;t.step=7;t.gate=0;game.enemies=game.enemies.filter(e=>!e.tutorial);game.rpg.loot=[];const n=game.world.npc;Object.assign(game.player,{x:n.x+14,y:n.y+10,inCombat:0});game.moveTo=null;game.path=[];game.emit('tutorialStep');})()`);await wait(700);
 await press('f');await wait(700);
 ok(await read(`!!document.querySelector('[data-tutorial-next]')`),'Ida: Abschlussgespräch');
 await read(`document.querySelector('[data-tutorial-next]').click()`);
 // Bildfolge des Hofprobe-Endes
 const seq=[];let last='',n=0,both=false,cover=false,memToast=false,meterSeen=false;const t1=Date.now();
 for(let i=0;i<200;i++){const s=await state();const key=JSON.stringify({ms:!!s.ms,card:s.card,toast:s.toast,meter:s.meter});
  if(s.ms&&s.card)both=true;if(/Erinnerungsfetzen/.test(s.toast))memToast=true;if(s.meter)meterSeen=true;
  if(key!==last){last=key;seq.push(((Date.now()-t1)/1000).toFixed(1)+' s · '+([s.toast&&'Kurzmeldung „'+s.toast+'“',s.ms&&'Einblendung „'+s.ms+'“',s.card&&'Karte „'+s.card+'“',s.meter&&'Statistik offen'].filter(Boolean).join(' + ')||'ruhig'));
   if(n<8)await shot('1'+(n++)+'-hofprobe-ende');}
  if(s.card&&!s.ms&&Date.now()-t1>1500&&seq.length>2)break;await wait(150);}
 console.log('Hofprobe-Ende:\n  '+seq.join('\n  '));
 ok(await read('game.tutorial.completed'),'Hofprobe bestanden');
 ok(!both,'Einblendung und Erinnerungskarte nie gleichzeitig');
 ok(!memToast,'keine zusätzliche Kurzmeldung „Erinnerungsfetzen“ am Desktop (die Karte sagt es selbst)');
 ok(!meterSeen,'Kampfstatistik öffnet sich beim Freischalten nicht selbst (trotz gemerkter Einstellung)');
 ok(seq.some(l=>/Einblendung „Neu freigeschaltet/.test(l)),'Freischalt-Einblendung erschienen');
 ok(!seq.some(l=>/Erst die Hofprobe/.test(l)),'Kartenmeldung kommt nach dem Schließen nicht noch einmal als Kurzmeldung');
 const order=seq.findIndex(l=>/Einblendung/.test(l)),cardAt=seq.findIndex(l=>/Karte „Der Stempel“/.test(l));
 ok(cardAt>order&&order>=0,'Reihenfolge: erst Einblendung, dann Karte „Der Stempel“');
 ok(await read(`(document.body.dataset.novel||'').split(' ').includes('meter')&&getComputedStyle(document.querySelector('#meterToggle'),'::before').content.includes('Neu')`),'Knopf der Kampfstatistik trägt „Neu“');
 await shot('20-karte-und-neu-am-knopf');await zoom('20b-neu-am-statistikknopf','#meterToggle',22,2);
 // Kampfstatistik öffnen (Taste V): „Neu“ verschwindet, Karte weicht aus.
 await press('v');await wait(700);
 const r1=await rects();ok(!!r1[1],'Statistik offen');ok(!overlap(r1[0],r1[1]),'Karte überdeckt die Kampfstatistik nicht (Standardplatz)');
 ok(await read(`!(document.body.dataset.novel||'').split(' ').includes('meter')`),'„Neu“ am Knopf weg nach dem Öffnen');
 // Statistik hoch und in die rechte Spalte gezogen (Befund aus der Balance-Prüfung): Karte weicht trotzdem aus.
 await read(`(()=>{const m=document.querySelector('#combatMeter');m.querySelector('[data-meter-options]')?.click();})()`);await wait(500);
 const r2=await rects();ok(!overlap(r2[0],r2[1]),'Karte überdeckt die hohe Kampfstatistik nicht');
 await shot('21-karte-neben-statistik');
 await read(`document.querySelector('#combatMeter [data-meter-options]')?.click()`);await wait(300);
 // Kampf: Karte tritt zurück und kommt nach dem Kampf wieder.
 await read(`game.player.inCombat=8`);await wait(600);let s=await state();ok(!s.card,'Karte tritt im Kampf zurück');
 await shot('22-kampf-karte-weg');
 await read(`game.player.inCombat=0;game.attackers?.clear?.();for(const e of game.enemies){if(e.aggro){e.aggro=false;e.ai='roaming';}}`);
 let back=false;for(let i=0;i<30&&!back;i++){await wait(200);await read(`game.player.inCombat=0`);s=await state();back=s.card==='Der Stempel';}
 ok(back,'Karte kommt nach dem Kampf wieder');
 // Karte schließen; derselbe Fetzen kommt nie ein zweites Mal.
 await read(`document.querySelector('.memory-card [data-memory-next]').click()`);await wait(300);
 await read(`(async()=>{const {memoryFor}=await import('./content/memories.js');game.events.push({type:'memory',fragment:memoryFor('stempel')});})()`);await wait(3000);
 s=await state();ok(!s.card,'„Der Stempel“ kommt kein zweites Mal');
 // Tod: eine Erinnerung, die im Tod fällig wird (Naturtalent bei Stufe 5), erscheint erst nach dem Aufwachen – nicht neben dem Todesschirm.
 await read(`(()=>{const p=game.player;game.adminGod=false;p.invulnerable=0;p.parry=0;game.hitPlayer({x:p.x+10,y:p.y,damage:1,name:'Pfandkeiler',type:'normal'},p.maxHp*50,false);})()`);await wait(500);
 ok(await read('game.dead'),'Held umgekippt');
 await read(`game.memoryEvent({kind:'level',level:5})`);await wait(2600);
 s=await state();ok(s.dead&&!s.card,'keine Erinnerung neben dem Todesschirm');
 await shot('23-tod-ohne-karte');
 await read(`(document.querySelector('#deathScreen [data-ds-wake]')||{click(){game.respawn();}}).click()`);
 // Der erste Tod bringt selbst einen Fetzen („Wurst Case“) – er kommt zuerst, „Naturtalent“ wartet in der Schlange dahinter.
 let after=false;for(let i=0;i<40&&!after;i++){await wait(200);s=await state();after=!s.dead&&!!s.card;}
 const mem=JSON.parse(await read('JSON.stringify(window.mertloch.memory())'));
 if(!after)console.error('Erinnerung:',JSON.stringify(mem),JSON.stringify(s));
 ok(after&&s.card==='Wurst Case'&&mem.queue.includes('naturtalent'),'nach dem Aufwachen: erst „Wurst Case“ (erster Tod), „Naturtalent“ wartet dahinter');
 await wait(400);await shot('24-nach-tod-wurst-case');
 await read(`document.querySelector('.memory-card [data-memory-next]').click()`);
 let next=false;for(let i=0;i<30&&!next;i++){await wait(200);s=await state();next=s.card==='Naturtalent';}
 ok(next,'danach „Naturtalent“ – einzeln, nicht gestapelt');
 await wait(400);await shot('25-danach-naturtalent');
 const rt=await read('JSON.stringify(window.mertloch?.state?.().memories||[])');
 assert.deepEqual(b.errors,[],'Laufzeitfehler');
 ok(consoleErrors.length===0,'Konsolenfehler im ganzen Lauf: '+consoleErrors.length);
 writeFileSync(dir+'/report.json',JSON.stringify({klasse:cls,checks,ladezeitleiste:line,hofprobeEnde:seq,erinnerungen:JSON.parse(rt),shots},null,2));
 console.log('PASS E-72 Einstieg ('+cls+'):\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e.message||e);console.error('Konsole:',consoleErrors.slice(0,10));console.error('Ausnahmen:',JSON.stringify(b.errors).slice(0,1500));try{await shot('fehler');}catch{}process.exitCode=1;}
finally{b.close();}
