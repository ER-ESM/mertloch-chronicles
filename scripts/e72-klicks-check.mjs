// E-72 Runde 5 · klicks · Browser-Abnahme der Kenner-Befunde 26.09. nachts (Bedienfehler, alle Klassen) mit ECHTEN Maus- und
// Tastenereignissen (CDP Input.dispatchMouseEvent / Input.dispatchKeyEvent – keine element.click() an den geprüften Stellen):
//  leiste  – Linksklick ins Spielfeld neben der Aktionsleiste trifft keinen unsichtbaren Platz der Zusatzleisten (2–4, alle fünf Klassen);
//            leere Plätze fangen erst bei offenem Kniffe-Buch (dann schwach sichtbar) bzw. beim Ziehen Klicks
//  karte   – Rechtsklick läuft, solange eine Erinnerungskarte offen ist (auch AUF der Karte), direkt nach dem Schließen und nach
//            Tod/Aufwachen; Karte und Bild-Tooltip stapeln sich nicht (Tooltip geht mit der Karte)
//  intro   – Esc nach „Held erstellen“ (Knopf / Enter im Namensfeld): sofort, auf dem Ladeschirm, während der Film wartet, im Film
//  stempel – „Der Stempel“/„Naturtalent“ nur beim ersten Helden als Karte, beim zweiten still (Aufträge → Erinnerungen)
//  meldung – „… muss noch verschnaufen“ höchstens einmal je Kniff alle 2 s, leise Zeile, keine Kurzmeldung, nicht im Chat
// Eigener Server + Wegwerf-Browser (SERVER_PORT/CDP_PORT, Vorgabe 4471/9871). Bilder: docs/e72-runde5/klicks/*.jpg, Bericht report*.json.
// Aufruf: node scripts/e72-klicks-check.mjs [teil,teil …] [--width=1600|2024]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde5/klicks';mkdirSync(dir,{recursive:true});
const args=process.argv.slice(2),only=args.find(a=>!a.startsWith('-'))?.split(',')||null,want=p=>!only||only.includes(p);
const W=Number(args.find(a=>a.startsWith('--width='))?.slice(8)||1600),H=900,tag=W===1600?'':'-'+W;
const b=await browserSession({port:Number(process.env.CDP_PORT||9871),serverPort:Number(process.env.SERVER_PORT||4471)});
const read=s=>b.evaluate(s),checks=[],shots=[],notes={};
/* --soft: Vorher-Messung am alten Stand – Fehlschläge zählen und weiterlaufen statt abbrechen */const soft=args.includes('--soft'),failed=[];
const ok=(cond,msg)=>{if(!cond&&soft){failed.push(msg);console.log(' ✗ '+msg);return;}assert.ok(cond,msg);checks.push(msg);console.log(' ✓ '+msg);};
const shot=async(name,clip)=>{const p=dir+'/'+name+tag+'.jpg';clip||={x:0,y:0,width:W,height:H,scale:.6};const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:clip.scale<1?74:86,clip:{scale:1,...clip}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const rect=sel=>read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width?{x:r.left,y:r.top,w:r.width,h:r.height}:null;})()`);
const clipOf=(r,pad=8,scale=1)=>({x:Math.max(0,Math.round(r.x-pad)),y:Math.max(0,Math.round(r.y-pad)),width:Math.round(r.w+pad*2),height:Math.round(r.h+pad*2),scale});
// Echte Maus
const mouse=(type,x,y,button='none')=>b.send('Input.dispatchMouseEvent',{type,x:Math.round(x),y:Math.round(y),button,buttons:type==='mousePressed'?(button==='left'?1:button==='right'?2:0):0,clickCount:type==='mouseMoved'?0:1,pointerType:'mouse'});
const move=async(x,y)=>{await mouse('mouseMoved',x,y);await wait(140);};
const click=async(x,y,button='left')=>{await mouse('mouseMoved',x,y);await wait(40);await mouse('mousePressed',x,y,button);await wait(50);await mouse('mouseReleased',x,y,button);await wait(60);};
const clickEl=async(sel,button='left')=>{const r=await rect(sel);assert.ok(r,'Element fehlt: '+sel);await click(r.x+r.w/2,r.y+r.h/2,button);return r;};
// Echte Tasten: keyDown/keyUp mit key, code, windowsVirtualKeyCode (Sondertasten ohne text, wie im Auftrag)
const KEYS={Escape:{code:'Escape',vk:27},Enter:{code:'Enter',vk:13,text:'\r'}};
const key=async(k,type='keyDown')=>{const d=KEYS[k]||(/^\d$/.test(k)?{code:'Digit'+k,vk:48+Number(k),text:k}:{code:'Key'+k.toUpperCase(),vk:k.toUpperCase().charCodeAt(0),text:k});await b.send('Input.dispatchKeyEvent',{type,key:k,code:d.code,windowsVirtualKeyCode:d.vk,nativeVirtualKeyCode:d.vk,...(type==='keyDown'&&d.text?{text:d.text,unmodifiedText:d.text}:{})});};
const press=async k=>{await key(k);await key(k,'keyUp');};
/** Taste wie ein Mensch drücken (gehalten, ~90 ms). Über einen Seitenwechsel hinweg wichtig: Chrome verwirft Eingaben, solange die alte Seite weg und die
 *  neue noch nicht gezeichnet ist (gemessen: bei 0 ms Haltezeit gingen Drücken UND Loslassen dort verloren) – das Loslassen kommt dann auf der neuen Seite an. */
const tap=async(k,ms=90)=>{await key(k);await wait(ms);await key(k,'keyUp');};
const typeText=async t=>{for(const ch of t)await press(ch);};
const consoleErrors=[];
b.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push('console.error: '+p.args.map(a=>a.value??a.description).join(' ').slice(0,300));});
b.on('Log.entryAdded',p=>{if(p.entry.level==='error')consoleErrors.push('log: '+p.entry.text+' '+(p.entry.url||''));});
const until=async(expr,ms=8000,step=100)=>{const t=Date.now();while(Date.now()-t<ms){if(await read(expr).catch(()=>false))return true;await wait(step);}return false;};

/** Spielstand einspielen (Hofprobe fertig), Anmeldebildschirm per Gast/„Ins Dorf“ überwinden, Film weg, freie Wiese. */
async function boot({cls='schorsch',level=6,seen=['stempel'],popups=null}={}){
 const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:cls,level,trainingXp:0,tutorial:{version:1,step:8,completed:true},memories:{seen},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));}catch{}delete Navigator.prototype.serviceWorker;if(location.protocol.startsWith('http'))try{localStorage.clear();sessionStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});${popups?`localStorage.setItem('mertloch-memory-popups',${JSON.stringify(JSON.stringify(popups))});`:''}}catch{}`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<800&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ready=false;for(let i=0;i<600&&!ready;i++){await wait(200);ready=await read(`(()=>{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game.player&&document.getElementById('loading')?.classList.contains('hidden');})()`).catch(()=>false);}
 assert.ok(ready,'im Dorf');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(600);
 await read(`(async()=>{globalThis.__k={arena:await import('./arena.js'),rpg:await import('./rpg.js'),tui:await import('./target-ui.js'),prog:await import('./progression.js'),mem:await import('./content/memories.js')};})()`);
 await meadow();
}
/** Held auf eine freie Wiese (keine Figuren, kein Weg), Kamera hart auf ihn. */
const meadow=()=>read(`(()=>{const W=game.world,s=W.spawn;let spot=null;for(let r=260;r<900&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(W.onRoad?.(x,y,70)||W.blocked(x,y,40)||W.nearby?.(x,y,90)?.length)continue;let ok=true;for(let dx=-120;dx<=120&&ok;dx+=20)for(let dy=-90;dy<=90&&ok;dy+=20)if(W.blocked(x+dx,y+dy,6))ok=false;if(ok)spot={x,y};}spot||={x:s.x-150,y:s.y+230};
 const p=game.player;Object.assign(p,{x:spot.x,y:spot.y,vx:0,vy:0,moving:false,inCombat:0,hp:p.maxHp});game.moveTo=null;game.path=[];game.routeGoal=null;game.target=null;const R=globalThis.__mertloch?.renderer;if(R){R.cameraFocus=null;R.camera={...R.camera,x:p.x,y:p.y};}return spot;})()`).then(async s=>{await wait(500);return s;});
/* bedient = Laufen (navigate) ODER die Figur unter dem Punkt gewählt (Rechtsklick auf Gegner = hinlaufen und angreifen, auf Freund = ansprechen) */
const walkState=()=>read(`JSON.stringify({to:game.moveTo?{x:Math.round(game.moveTo.x),y:Math.round(game.moveTo.y)}:null,path:game.path?.length||0,nav:game.__nav||0,sel:game.target?'greift an: '+game.target.name:game.friend?'spricht an: '+(game.friend.ref?.name||game.friend.kind):''})`).then(s=>{const v=JSON.parse(s);v.ok=v.nav>0||!!v.sel;return v;});
const stopWalk=()=>read(`(()=>{game.moveTo=null;game.path=[];game.routeGoal=null;game.target=null;game.friend=null;game.stopAuto?.();Object.assign(game.player,{vx:0,vy:0,moving:false});if(!game.__navWrap){const o=game.navigate.bind(game);game.navigate=(...a)=>{game.__nav=(game.__nav||0)+1;return o(...a);};game.__navWrap=true;}game.__nav=0;})()`);
const at=(x,y)=>read(`(()=>{const e=document.elementFromPoint(${x},${y});if(!e)return '';const s=e.closest('[data-action-slot]');return (e.id?'#'+e.id:e.tagName)+'.'+String(e.className?.baseVal??e.className??'').split(' ').filter(Boolean).slice(0,3).join('.')+(s?'[slot '+s.dataset.actionSlot+(s.classList.contains('empty-slot')?' leer':'')+']':'');})()`);
/** Bildschirmpunkt ohne Figur darunter (Rechtsklick = Laufen, nicht Ansprechen). */
/** Zeigerprotokoll im Spiel (Capture auf window): letzte Ereignisse mit Ziel – zur Diagnose nicht bedienter Rechtsklicks. */
const armLog=()=>read(`(()=>{if(window.__pl)return;window.__pl=[];const d=t=>t?(t.id?'#'+t.id:t.tagName)+'.'+String(t.className?.baseVal??t.className??'').split(' ').filter(Boolean).slice(0,2).join('.'):'-';for(const ty of ['pointerdown','contextmenu'])addEventListener(ty,e=>{__pl.push([Math.round(performance.now()),ty,e.button,Math.round(e.clientX),Math.round(e.clientY),d(e.target),e.isTrusted?'echt':'weitergereicht']);if(__pl.length>12)__pl.shift();},true);})()`);
/** Warum lief ein Rechtsklick nicht? Zustand, Ziel unter dem Punkt, letzte Zeigerereignisse. */
const why=(x,y)=>read(`(async()=>{const R=globalThis.__mertloch.renderer,p=R.screenToWorld(${Math.round(x)},${Math.round(y)}),P=await import('./professions.js'),u=__k.tui.unitAt(game,p.x,p.y),pn=P.professionTarget(game,p);const e=document.elementFromPoint(${Math.round(x)},${Math.round(y)});return JSON.stringify({at:e?(e.id||e.className):'',paused:game.paused,dead:game.dead,aiming:game.aiming||null,unit:u?u.kind+':'+(u.name||''):'',beruf:pn?pn.id+' '+Math.round(Math.hypot(pn.x-game.player.x,pn.y-game.player.y))+'m':'',tip:!document.querySelector('#itemTooltip').classList.contains('hidden'),log:(window.__pl||[]).slice(-6)});})()`);
const freeAt=(x,y)=>read(`(()=>{const R=globalThis.__mertloch.renderer,p=R.screenToWorld(${x},${y});return !__k.tui.unitAt(game,p.x,p.y)&&document.elementFromPoint(${x},${y})?.id==='world';})()`);

const PARTS={
 async leiste(){
  const results=[];
  for(const [cls,level] of [['schorsch',6],['dieter',12],['baerbel',12],['kevin',12],['kaethe',12]]){
   await boot({cls,level});await armLog();
   for(const bars of [2,3,4]){
    // Wie beim Kenner: in jeder Zusatzleiste nur der erste Platz belegt (⇧1), der Rest leer; Leiste 4 bleibt ganz leer.
    await read(`(()=>{const {rpg}=__k;rpg.setBarCount(game,${bars});const known=game.skills.filter(s=>__k.prog.available(game,s.id)&&!(s.id in rpg.SPECIAL_KEYS)).map(s=>s.id);const bar=rpg.actionBar(game);for(let i=10;i<bar.length;i++)if(bar[i])rpg.bindSkill(game,null,i);for(let r=1;r<${bars};r++)if(r<3)rpg.bindSkill(game,known[r%known.length],r*10);game.emit('barChanged');game.emit('save');})()`);await wait(500);
    const area=await rect('.action-area'),main=await rect('#actionBar');
    // Band über der Hauptleiste: von links neben der Leistenzone bis weit rechts daneben, Zeilen der Zusatzleisten.
    const rows=JSON.parse(await read(`JSON.stringify([...document.querySelectorAll('.action-area .extra-bar')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,y:r.top+r.height/2,top:r.top,h:r.height};}))`));
    let bad=[],samples=0;
    for(const row of rows)for(let x=Math.max(4,area.x-120);x<Math.min(W-4,area.x+area.w+160);x+=6){samples++;const hit=await read(`(()=>{const e=document.elementFromPoint(${x},${Math.round(row.y)});if(!e||e.id==='world')return null;const s=e.closest('[data-action-slot]');let op=1;for(let n=s||e;n&&n!==document.body;n=n.parentElement)op*=Number(getComputedStyle(n).opacity);const cls=String(e.className||'');return {tag:(e.id?'#'+e.id:e.tagName)+'.'+cls.split(' ').slice(0,3).join('.'),slot:s?.dataset.actionSlot??null,empty:!!s?.classList.contains('empty-slot'),op:Math.round(op*100)/100,container:/(^| )(action-area|extra-bar)( |$)/.test(cls)};})()`);
     if(hit&&(hit.container||hit.empty||hit.op<.2))bad.push({x,row:row.id,...hit});}
    // Die Kenner-Stelle: rechts neben dem letzten belegten Platz der Zusatzleiste, Mitte des unsichtbaren Platzes ⇧0 (Index 19).
    const p0=await rect('.action-area [data-action-slot="19"]');
    // Linksklick an die Stelle – das Zeigerprotokoll zeigt, wer ihn bekam (vorher: der leere Platz ⇧0)
    await click(p0.x+p0.w/2,p0.y+p0.h/2,'left');await wait(300);
    const got=await read(`(()=>{const l=(window.__pl||[]).filter(x=>x[1]==='pointerdown').at(-1);return l?l[5]:'';})()`);
    const after=JSON.parse(await read(`JSON.stringify({book:!!document.querySelector('.game-popup.popup-book, .game-popup[data-window-id=book]')||(window.mertloch.state().popups||[]).some(p=>p.id==='book'),text:document.querySelector('.book-instruction')?.textContent||'',target:!!game.target,hit:(()=>{const e=document.elementFromPoint(${Math.round(p0.x+p0.w/2)},${Math.round(p0.y+p0.h/2)});return e?.id||e?.className||'';})()})`));
    results.push({cls,bars,samples,bad:bad.length,after,got});
    if(bad.length)console.error(cls,bars,'Fänger:',JSON.stringify(bad.slice(0,6)));
    ok(!bad.length,`${cls}, ${bars} Leisten: ${samples} Punkte im Band der Zusatzleisten – nichts Unsichtbares fängt (nur sichtbare Knöpfe oder Welt)`);
    ok(!after.book&&!/gewählt/.test(after.text),`${cls}, ${bars} Leisten: Linksklick auf den unsichtbaren Platz ⇧0 öffnet kein Kniffe-Buch (Treffer: ${after.hit})`);
    ok(after.hit==='world'&&got==='#world.',`${cls}, ${bars} Leisten: der Klick geht in die Welt (Empfänger ${got})`);
    if(cls==='schorsch'&&bars===2){await read(`document.head.insertAdjacentHTML('beforeend','<style id=kl-mark>#kl-mark-dot{position:fixed;z-index:99999;width:18px;height:18px;margin:-9px 0 0 -9px;border:3px solid #ff3b30;border-radius:50%;pointer-events:none}</style>');const d=document.createElement('div');d.id='kl-mark-dot';d.style.left='${Math.round(p0.x+p0.w/2)}px';d.style.top='${Math.round(p0.y+p0.h/2)}px';document.body.append(d);`);
     await shot('01-leiste-klick-ins-feld-geht-in-die-welt',clipOf({x:area.x-160,y:area.y-120,w:area.w+320,h:H-area.y+120},0,1));await read(`document.getElementById('kl-mark-dot')?.remove()`);}
   }
   // Belegte Plätze der Zusatzleiste bleiben klickbar (Kniff löst aus) …
   if(cls==='schorsch'||cls==='kaethe'){
    const s1=await rect('.action-area [data-action-slot="10"]');ok(!!s1&&(await at(s1.x+s1.w/2,s1.y+s1.h/2)).includes('slot 10'),cls+': belegter Platz ⇧1 der Zusatzleiste bleibt anklickbar');
    // … und bei offenem Kniffe-Buch (Leisten bearbeiten) werden leere Plätze schwach sichtbar und belegbar.
    await press('k');await until(`(window.mertloch.state().popups||[]).some(p=>p.id==='book')`,3000);await wait(300);
    const p9=await rect('.action-area [data-action-slot="19"]');const vis=await read(`Number(getComputedStyle(document.querySelector('.action-area [data-action-slot="19"]')).opacity)`);
    ok(vis>.3,cls+': Kniffe-Buch offen → leere Plätze der Zusatzleiste sichtbar (Deckkraft '+vis+')');
    await click(p9.x+p9.w/2,p9.y+p9.h/2);await wait(400);
    const txt=await read(`document.querySelector('.book-instruction')?.textContent||''`);ok(/gewählt/.test(txt),cls+': im Bearbeiten-Modus lässt sich der leere Platz ⇧0 wählen („'+txt+'“)');
    if(cls==='schorsch')await shot('02-leiste-bearbeiten-kniffe-buch');
    await press('Escape');await wait(300);await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(300);
    ok(await read(`!document.body.classList.contains('bar-edit')`),cls+': Buch zu → leere Plätze wieder unsichtbar und durchlässig');
   }
  }
  notes.leiste=results;
 },
 async karte(){
  await boot({cls:'schorsch',level:6,seen:['stempel']});await armLog();notes.karteNicht=[];
  const miss=async(tag,x,y)=>{const d=await why(x,y);notes.karteNicht.push(tag+' '+d);console.log('  NICHT BEDIENT '+tag+': '+d);};
  const show=async id=>{await read(`game.events.push({type:'memory',fragment:__k.mem.memoryFor(${JSON.stringify(id)})})`);return until(`!!document.querySelector('.memory-card:not([hidden]).show')`,8000);};
  ok(await show('pizzeria'),'Erinnerungskarte „22:01“ offen');await wait(500);
  const card=await rect('.memory-card'),pic=await rect('.memory-card [data-memory-card-art]');
  // Rechtsklick in die Welt (freie Stellen) läuft, solange die Karte offen ist
  let n=0,walked=0;for(const [x,y] of [[W*.2,H*.35],[W*.3,H*.6],[W*.55,H*.3],[card.x-60,card.y+80],[card.x+card.w/2,card.y-30]]){if(!(await freeAt(x,y)))continue;n++;await stopWalk();await click(x,y,'right');await wait(200);const s=await walkState();if(s.ok)walked++;else await miss('Karte offen',x,y);}
  ok(n>=3&&walked===n,`Karte offen: ${walked}/${n} Rechtsklicks in die Welt bedient (laufen bzw. Figur angreifen)`);
  // Rechtsklick AUF die Karte (Bild, Text) läuft wie in die Welt – die Karte schluckt ihn nicht mehr
  let onCard=0;for(const [x,y] of [[pic.x+pic.w/2,pic.y+pic.h/2],[card.x+card.w/2,card.y+card.h-40]]){await stopWalk();await click(x,y,'right');await wait(200);const s=await walkState();if(s.ok)onCard++;else await miss('auf Karte',x,y);}
  ok(onCard===2,'Rechtsklick auf die Karte (Bild und Text) wirkt wie ein Rechtsklick in die Welt ('+onCard+'/2)');
  ok(await read(`!!document.querySelector('.memory-card:not([hidden])')&&!document.querySelector('.context-menu')`),'Karte bleibt dabei offen, kein Kontextmenü');
  // Bild-Tooltip erscheint beim Darüberfahren …
  await move(pic.x+pic.w/2,pic.y+pic.h/2);await wait(250);
  const tipOn=await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`);ok(tipOn,'Bild-Tooltip beim Darüberfahren');
  await shot('10-karte-tooltip-beim-darueberfahren');
  // … und geht, wenn die Karte zurücktritt (Kampf) – ohne Mausbewegung
  await read(`game.player.inCombat=8`);await wait(450);
  const held=JSON.parse(await read(`JSON.stringify({card:!!document.querySelector('.memory-card:not([hidden])'),tip:!document.querySelector('#itemTooltip').classList.contains('hidden')})`));
  ok(!held.card&&!held.tip,'Karte tritt im Kampf zurück – ihr Bild-Tooltip geht mit (vorher blieb er stehen)');
  await move(W*.25,H*.4);await read(`game.player.inCombat=0;game.attackers?.clear?.();`);
  let back=false;for(let i=0;i<40&&!back;i++){await wait(150);await read(`game.player.inCombat=0`);back=await read(`!!document.querySelector('.memory-card:not([hidden])')`);}
  ok(back&&await read(`document.querySelector('#itemTooltip').classList.contains('hidden')`),'Karte kommt wieder – ohne gestapelten Bild-Tooltip');
  // Tooltip über der Karte, dann schließen per Kreuz (echter Klick): Tooltip weg, Rechtsklick an derselben Stelle läuft sofort
  await move(pic.x+pic.w/2,pic.y+pic.h/2);await wait(200);
  await read(`game.events.push({type:'memory',fragment:__k.mem.memoryFor('kastenturm')})`);await wait(200);
  /* Zeitmarken im Spiel: Karte zu → nächste Karte sichtbar (der Prüftakt spielt keine Rolle) */await read(`(()=>{const c=document.querySelector('.memory-card'),m=window.__gap={closed:0,shown:0};new MutationObserver(()=>{const t=performance.now();if(c.hidden&&!m.closed)m.closed=t;else if(!c.hidden&&m.closed&&!m.shown)m.shown=t;}).observe(c,{attributes:true,attributeFilter:['hidden']});})()`);
  const x=await rect('.memory-card [data-memory-next]');await click(x.x+x.w/2,x.y+x.h/2);await wait(120);
  const closed=JSON.parse(await read(`JSON.stringify({card:!!document.querySelector('.memory-card:not([hidden])'),tip:!document.querySelector('#itemTooltip').classList.contains('hidden')})`));
  ok(!closed.card&&!closed.tip,'Kreuz schließt die Karte, kein Tooltip bleibt stehen');
  let right=0,spots=[[pic.x+pic.w/2,pic.y+pic.h/2],[card.x+40,card.y+60],[W*.3,H*.5]];for(const [px,py] of spots){await stopWalk();await click(px,py,'right');await wait(150);const s=await walkState();if(s.ok)right++;else await miss('nach Schließen',px,py);}
  ok(right===3,'direkt nach dem Schließen: Rechtsklicks an der Kartenstelle und daneben bedient ('+right+'/3)');
  ok(await until(`document.querySelector('.memory-card:not([hidden]) strong')?.textContent==='Statik'`,10000),'„Statik“ kommt nach der Ruhezeit');
  const gap=await read(`Math.round(window.__gap.shown-window.__gap.closed)`);ok(gap>=1400,'die nächste Karte springt nicht sofort unter die Maus (Abstand '+gap+' ms)');
  await read(`document.querySelector('.memory-card [data-memory-next]')?.click()`);await wait(300);
  // Maus ruht dort, wo gleich die Karte erscheint (wie nach dem Aufwachen): Karte kommt OHNE Bild-Tooltip; erst echte Bewegung zeigt ihn.
  // Die Karte wird festgehalten (Kampf), bis die Maus liegt – sonst hinge das Ergebnis am Prüftakt.
  await read(`game.player.inCombat=8;game.events.push({type:'memory',fragment:__k.mem.memoryFor('shirt-zu-klein')})`);await move(pic.x+pic.w/2,pic.y+pic.h/2);await wait(300);await read(`game.player.inCombat=0;game.attackers?.clear?.()`);
  ok(await until(`(game.player.inCombat=0,document.querySelector('.memory-card:not([hidden]) strong')?.textContent==='Größe S')`,10000),'„Größe S“ erscheint unter der ruhenden Maus');
  await wait(700);ok(await read(`document.querySelector('#itemTooltip').classList.contains('hidden')`),'Karte erscheint unter der ruhenden Maus – kein Bild-Tooltip dazu (nichts stapelt sich)');
  await shot('11-karte-naechste-nach-ruhezeit');
  await move(pic.x+pic.w/2+8,pic.y+pic.h/2+4);await wait(200);ok(await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`),'erst eine echte Mausbewegung über dem Bild zeigt „Bild vergrößern“');
  await move(W*.3,H*.5);
  await read(`document.querySelector('.memory-card [data-memory-next]')?.click()`);await wait(300);
  // Tod → Aufwachen (echter Klick auf den Knopf) → Karte kommt; Rechtsklicks laufen die ganze Zeit
  
  await move(pic.x+pic.w/2,pic.y+pic.h/2);
  await read(`(()=>{const p=game.player;game.adminGod=false;p.invulnerable=0;p.parry=0;game.die('Prüfung');game.memoryEvent({kind:'firstDeath'});})()`);await wait(1200);
  const wake=await rect('#deathScreen [data-ds-wake]');ok(!!wake,'Todesschirm mit „Aufwachen“');await click(wake.x+wake.w/2,wake.y+wake.h/2);await wait(400);
  ok(await read('!game.dead'),'aufgewacht (echter Klick)');
  await meadow();
  const log=[];let stacked=false,cardSeen=false;const t0=Date.now();
  for(let k=0;k<16;k++){const cr=await rect('.memory-card:not([hidden])');const [px,py]=cr&&k%2?[cr.x+cr.w/2,cr.y+cr.h/2]:[W*(.18+(k%4)*.07),H*(.3+(k%3)*.12)];
   await stopWalk();if(!cr&&!(await freeAt(px,py))){await wait(250);continue;}
   await click(px,py,'right');await wait(150);const s=await walkState();
   /* Liegt unter dem Punkt eine Figur, ist Angreifen/Ansprechen die richtige Antwort (kein Laufen) – das zählt als bedient, nicht als verschluckt */
   if(!s.ok)await miss('nach Tod k='+k+(cr&&k%2?' Karte':' Welt'),px,py);
   const st=JSON.parse(await read(`JSON.stringify({card:document.querySelector('.memory-card:not([hidden]) strong')?.textContent||'',tip:(()=>{const t=document.querySelector('#itemTooltip');return t.classList.contains('hidden')?'':t.textContent.slice(0,30);})()})`));
   if(st.card)cardSeen=true;if(st.card&&st.tip&&!(await read(`!!document.querySelector('.memory-card:hover')`)))stacked=true;
   log.push(((Date.now()-t0)/1000).toFixed(1)+' s '+(cr&&k%2?'auf Karte':'Welt')+' → '+(s.nav>0?'läuft':s.sel?s.sel:'NICHT')+(st.card?' · Karte '+st.card:'')+(st.tip?' · Tooltip '+st.tip:''));
   if(k===7)await shot('12-nach-aufwachen-karte-rechtsklick-laeuft');await wait(250);}
  notes.nachTod=log;console.log('  '+log.join('\n  '));
  ok(cardSeen,'nach dem Aufwachen erscheint die Karte „Wurst Case“');
  ok(log.length>=12&&!log.some(l=>/NICHT/.test(l)),'nach Tod/Aufwachen: jeder Rechtsklick (Welt und Karte) wird bedient – '+log.filter(l=>/läuft/.test(l)).length+'/'+log.length+' laufen, '+log.filter(l=>/greift an|spricht an/.test(l)).length+' treffen eine Figur (angreifen/ansprechen)');
  ok(!stacked,'kein Bild-Tooltip neben der Karte, solange die Maus nicht auf ihr ist');
  // Belastung (Befund aus dem Orchestratorlauf: Welt-Rechtsklick direkt nach Rechtsklick auf die Karte mit offenem Bild-Tooltip): 20× im Wechsel
  // Karte ↔ freie Welt, ohne Gegner im Umkreis (die wählten sich sonst per Rechtsklick selbst) – jeder einzelne muss LAUFEN.
  await read(`(()=>{game.__foes=game.enemies;game.enemies=[];})()`);
  let alt=0,altN=0;const altLog=[];
  for(let k=0;k<20;k++){const cr=await rect('.memory-card:not([hidden])');if(!cr){await read(`game.events.push({type:'memory',fragment:__k.mem.memoryFor(['pizzeria','kastenturm','shirt-zu-klein','der-bus'][k%4])})`);await until(`!!document.querySelector('.memory-card:not([hidden])')`,6000);continue;}
   const onCardNow=k%2===0,[px,py]=onCardNow?[cr.x+cr.w/2,cr.y+Math.min(cr.h-30,cr.h/2)]:[W*(.2+(k%3)*.08),H*(.35+(k%2)*.1)];
   await stopWalk();if(!onCardNow&&!(await freeAt(px,py)))continue;altN++;await click(px,py,'right');await wait(120);const s=await walkState();
   if(s.nav>0)alt++;else{await miss('Wechsel k='+k+(onCardNow?' Karte':' Welt'),px,py);}altLog.push((onCardNow?'Karte':'Welt')+(s.nav>0?' läuft':' NICHT')+(await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`)?' (Tooltip offen)':''));}
  await read(`(()=>{game.enemies=game.__foes||game.enemies;delete game.__foes;})()`);
  notes.wechsel=altLog;ok(altN>=12&&alt===altN,`Wechsel Karte ↔ Welt ohne Gegner: ${alt}/${altN} Rechtsklicks laufen (${altLog.filter(l=>/Tooltip/.test(l)).length}× mit offenem Bild-Tooltip)`);
 },
 async intro(){
  const runs=[];
  /** Frischer Gast → Held anlegen (echte Maus/Tasten), submit 'button' (Klick) oder 'enter' (Enter im Namensfeld). */
  async function create(cls,submit){
   await b.send('Page.navigate',{url:b.url});await until('!!window.mertloch',60000,150);
   await read(`localStorage.clear();sessionStorage.clear();`);await b.send('Page.navigate',{url:b.url});await until('!!window.mertloch',60000,150);
   /* nach Zeit (45 s), nicht nach Zählern: unter Last dauerte der Weg zum Namensfeld länger als 80 × 250 ms */for(const t0=Date.now();Date.now()-t0<45000;){const st=await read(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden)return 'closed';const g=s.querySelector('[data-start=guest]');if(g){g.click();return 'guest';}const k=s.querySelector('[data-draft-class="${cls}"]');if(k&&!k.classList.contains('is-selected')&&!k.getAttribute('aria-pressed')?.includes('true')&&!window.__picked){window.__picked=1;k.click();return 'class';}const n=s.querySelector('[name=heroName]');if(n)return 'name';const d=s.querySelector('[data-start=draft-next]');if(d){d.click();return 'next';}const c=s.querySelector('[data-start=create]');if(c){c.click();return 'create';}return 'wait';})()`).catch(()=>'nav');if(st==='name')break;await wait(250);}
   await clickEl('[name=heroName]');await typeText('Esc'+cls.slice(0,4));
   const rec=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__carry=sessionStorage.getItem('mertloch-boot-esc');window.__keys=[];addEventListener('keydown',e=>window.__keys.push([e.key,Math.round(performance.now())]),true);addEventListener('DOMContentLoaded',()=>{const log=window.__film=[];new MutationObserver(()=>{const f=!!document.querySelector('.intro-film:not([hidden])');if(f!==(log.at(-1)?.[0]==='on'))log.push([f?'on':'off',Math.round(performance.now())]);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden','class']});});`});
   await read(`(()=>{const t0=performance.now();addEventListener('keydown',e=>{sessionStorage.setItem('dbg-old',(sessionStorage.getItem('dbg-old')||'')+'|'+e.key+'@'+Math.round(performance.now()-t0)+':'+sessionStorage.getItem('mertloch-boot-esc'));},false);addEventListener('pagehide',()=>sessionStorage.setItem('dbg-hide',String(Math.round(performance.now()-t0))));})()`);
   if(submit==='enter')await press('Enter');else await clickEl('[data-start=draft-next]');
   return rec;
  }
  const settle=async rec=>{const done=await until(`!!document.querySelector('[data-tutorial-next]')&&!document.querySelector('.intro-film:not([hidden])')`,45000,150);await b.send('Page.removeScriptToEvaluateOnNewDocument',rec);return done;};
  const filmLog=()=>read('JSON.stringify(window.__film||[])').then(JSON.parse).catch(()=>[]);
  const seenFlag=()=>read(`(()=>{const id=JSON.parse(localStorage.getItem('mertloch-characters')||'{}').active;return localStorage.getItem('mertloch-intro-'+id)==='1';})()`);
  // a) Esc direkt nach dem Klick auf „Erstellen“ (noch alte Seite, Fokus auf dem Knopf)
  {const rec=await create('dieter','button');await wait(40);await tap('Escape');const done=await settle(rec);const film=await filmLog();
   runs.push({fall:'a Esc 40 ms nach Klick (alte Seite)',film,done});const diagA=JSON.stringify({old:await read("sessionStorage.getItem('dbg-old')"),hide:await read("sessionStorage.getItem('dbg-hide')"),carry:await read('window.__carry'),keys:await read('JSON.stringify(window.__keys)'),film,done,seen:await seenFlag(),url:await read('location.href').catch(()=>'?'),start:await read("!!document.querySelector('#startScreen:not([hidden])')").catch(()=>'?'),tut:await read("!!document.querySelector('[data-tutorial-next]')").catch(()=>'?')});const okA=done&&!film.some(f=>f[0]==='on')&&await seenFlag();ok(okA,'a) Esc direkt nach „Erstellen“ (Knopf): Film erscheint gar nicht, Ida wartet'+(okA?'':' '+diagA));await shot('20-intro-esc-sofort-ida');}
  // b) Enter im Namensfeld, Esc 1,5 s später (Ladeschirm)
  {const rec=await create('baerbel','enter');await wait(1500);const lo=await read(`document.getElementById('loading')?.className||''`).catch(()=>'?');await tap('Escape');const done=await settle(rec);const film=await filmLog();
   runs.push({fall:'b Enter im Namensfeld, Esc nach 1,5 s ('+lo+')',film,done});ok(done&&!film.some(f=>f[0]==='on'),'b) Enter im Namensfeld, Esc auf dem Ladeschirm ('+(lo||'-')+'): Film erscheint gar nicht'+(done&&!film.length?'':' '+JSON.stringify({done,film})));}
  // c) Esc, wenn das Spiel steht, der Film aber noch auf das Abblenden des Ladeschirms wartet
  {const rec=await create('anni','button');await until(`!!window.mertloch`,60000,40);const lo=await read(`document.getElementById('loading')?.className||''`);await tap('Escape');const done=await settle(rec);const film=await filmLog();
   runs.push({fall:'c Esc beim Spielstart ('+lo+')',film,done});ok(done&&!film.some(f=>f[0]==='on'),'c) Esc beim Spielstart (Film wartet, Ladeschirm „'+lo+'“): Film erscheint gar nicht'+(done&&!film.length?'':' '+JSON.stringify({done,film})));}
  // d/e) kein Esc vorher: im Film wirkt der ERSTE Esc (100 ms bzw. 1,5 s nach dem ersten Bild)
  for(const [fall,cls,delay] of [['d','kevin',100],['e','kaethe',1500]]){const rec=await create(cls,'button');const shown=await until(`!!document.querySelector('.intro-film:not([hidden])')`,60000,40);await wait(delay);if(fall==='e')await shot('21-intro-film-laeuft');await tap('Escape');await wait(400);
   const gone=await read(`!document.querySelector('.intro-film:not([hidden])')`);const done=await settle(rec);runs.push({fall:fall+' Esc '+delay+' ms im Film',film:await filmLog(),done});
   ok(shown&&gone&&done,`${fall}) Film läuft, der ERSTE Esc (${delay} ms nach dem ersten Bild) überspringt ihn`);}
  notes.intro=runs;
 },
 async stempel(){
  // Frischer Browser, erster Held: Hofprobe-Ende → Karte „Der Stempel“, Stufe 5 → Karte „Naturtalent“
  async function newHero(first){
   if(first){await b.send('Page.navigate',{url:b.url});await until('!!window.mertloch',60000,150);await read(`localStorage.clear();sessionStorage.clear();`);await b.send('Page.navigate',{url:b.url});await until('!!window.mertloch',60000,150);}
   for(let i=0;i<80;i++){const st=await read(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden)return 'closed';const g=s.querySelector('[data-start=guest]');if(g){g.click();return 'guest';}const n=s.querySelector('[name=heroName]');if(n){n.value='Held${first?'Eins':'Zwei'}';s.querySelector('[data-start=draft-next]').click();return 'name';}const d=s.querySelector('[data-start=draft-next]');if(d){d.click();return 'next';}const c=s.querySelector('[data-start=create]');if(c){c.click();return 'create';}return 'wait';})()`).catch(()=>'nav');if(st==='nav'||st==='name')break;await wait(250);}
   await wait(800);await until('!!window.mertloch',60000,150);await press('Escape');
   ok(await until(`!!document.querySelector('[data-tutorial-next]')`,20000,150),(first?'Held 1':'Held 2')+': angelegt, Film per Esc übersprungen, Ida wartet');
   await read(`(async()=>{globalThis.__k={mem:await import('./content/memories.js')};document.querySelector('[data-tutorial-next]')?.click();})()`);await wait(600);
   await read(`(()=>{const t=game.tutorial;t.step=7;t.gate=0;game.enemies=game.enemies.filter(e=>!e.tutorial);game.rpg.loot=[];const n=game.world.npc;Object.assign(game.player,{x:n.x+14,y:n.y+10,inCombat:0});game.moveTo=null;game.path=[];game.emit('tutorialStep');})()`);await wait(700);
   await press('f');await until(`!!document.querySelector('[data-tutorial-next]')`,5000);await read(`document.querySelector('[data-tutorial-next]').click()`);
   const cards=new Set(),toasts=new Set();const t=Date.now();
   while(Date.now()-t<20000){const s=JSON.parse(await read(`JSON.stringify({c:document.querySelector('.memory-card:not([hidden]) strong')?.textContent||'',t:document.querySelector('#toast.visible')?.textContent||''})`));if(s.c)cards.add(s.c);if(s.t)toasts.add(s.t);if(first&&s.c==='Der Stempel')break;await wait(200);}
   ok(await read('game.tutorial.completed&&game.memories.seen.includes("stempel")'),(first?'Held 1':'Held 2')+': Hofprobe bestanden, „Der Stempel“ freigeschaltet');
   if(first){ok(cards.has('Der Stempel'),'Held 1: „Der Stempel“ erscheint als Karte');await shot('30-held1-stempel-karte');await read(`document.querySelector('.memory-card [data-memory-next]')?.click()`);}
   else{ok(!cards.has('Der Stempel')&&![...toasts].some(x=>/Erinnerung/.test(x)),'Held 2: „Der Stempel“ still freigeschaltet – keine Karte, keine Kurzmeldung (gesehen: '+([...cards].join(', ')||'nichts')+')');}
   await read(`game.memoryEvent({kind:'level',level:5})`);
   const nat=await until(`document.querySelector('.memory-card:not([hidden]) strong')?.textContent==='Naturtalent'`,first?10000:5000);
   ok(first?nat:!nat,(first?'Held 1: „Naturtalent“ erscheint als Karte':'Held 2: „Naturtalent“ still freigeschaltet (keine Karte)'));
   ok(await read('game.memories.seen.includes("naturtalent")'),(first?'Held 1':'Held 2')+': „Naturtalent“ in den gesehenen Fetzen');
   if(first){await read(`document.querySelector('.memory-card [data-memory-next]')?.click()`);ok(await read(`JSON.parse(localStorage.getItem('mertloch-memory-popups')||'[]').join()`)==='stempel,naturtalent','Browser merkt sich: „Der Stempel“ und „Naturtalent“ gezeigt');}
  }
  await newHero(true);
  // Zweiter Held im selben Browser: Menü → Heldenauswahl → neuer Held
  await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(300);await press('Escape');await until(`!!document.querySelector('[data-start-screen="roster"]')`,3000);
  await read(`document.querySelector('[data-start-screen="roster"]').click()`);await until(`!!document.querySelector('#startScreen:not([hidden]) [data-start=create]')`,8000);
  await read(`document.querySelector('#startScreen [data-start=create]').click()`);await wait(400);
  await newHero(false);
  // Nachlesbar unter Aufträge → Erinnerungen
  await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);await wait(300);
  await press('j');await until(`!!document.querySelector('.quest-memories')`,4000);
  const list=await read(`[...document.querySelectorAll('.quest-memories .memory-entry.known h3')].map(h=>h.textContent).join(', ')`);
  ok(/Der Stempel/.test(list)&&/Naturtalent/.test(list),'Held 2: beide Fetzen nachlesbar unter Aufträge → Erinnerungen ('+list+')');
  await read(`(()=>{const t=[...document.querySelectorAll('.game-popup [role=tab],.game-popup [data-tab]')].find(b=>/Erinnerung/.test(b.textContent));t?.click();})()`);await wait(500);
  await shot('31-held2-erinnerungen-nachlesbar');
 },
 async chat(){
  // Nebenbefund: die in Ruhe unsichtbare Kopfleiste des Chatfensters (opacity 0) fing Klicks links unten.
  await boot({cls:'dieter',level:6});await move(W*.5,H*.3);
  await read(`game.log('Prüfzeile für das Chatfenster')`);await wait(400);
  const tabs=await rect('#chatWindow .chat-tabs');ok(!!tabs,'Kopfleiste des Chatfensters vorhanden');
  /* Heiler-WoW (2026-09-26): Seit Dungeon-Fix 3 nehmen die Reiter selbst in Ruhe einen Klick an (öffnen den Reiter, WoW-artig; geprüft in
     dungeon-fix3-check). Durchlässig bleibt die Leiste daneben und dazwischen – dort misst diese Prüfung. Vorher lag der Punkt bei 40 % der
     Leistenbreite und traf je nach Schrift den unsichtbaren Reiter „Ereignisse“. Punkt = größte Lücke der Leiste ohne Reiter (mind. 12 px). */
  const free=JSON.parse(await read(`(()=>{const s=document.querySelector('#chatWindow .chat-tabs').getBoundingClientRect(),xs=[...document.querySelectorAll('#chatWindow .chat-tabs [data-chat-tab]')].map(b=>b.getBoundingClientRect()).filter(r=>r.width).sort((a,b)=>a.left-b.left);let at=s.left,best={w:0,x:0};for(const r of xs){if(r.left-at>best.w)best={w:r.left-at,x:(at+r.left)/2};at=Math.max(at,r.right);}if(s.right-at>best.w)best={w:s.right-at,x:(at+s.right)/2};return JSON.stringify({...best,tabs:xs.length});})()`));
  ok(free.w>=12,'Kopfleiste hat neben den '+free.tabs+' Reitern eine freie Stelle ('+Math.round(free.w)+' px breit)');
  const cx=free.x,cy=tabs.y+tabs.h/2;
  const state=()=>read(`JSON.stringify({active:document.querySelector('#chatWindow').classList.contains('active'),op:getComputedStyle(document.querySelector('#chatWindow .chat-tabs')).opacity,at:(document.elementFromPoint(${Math.round(cx)},${Math.round(cy)})?.id||document.elementFromPoint(${Math.round(cx)},${Math.round(cy)})?.className||'')})`).then(JSON.parse);
  let st=await state();ok(!st.active&&st.op==='0'&&st.at==='world','in Ruhe: Kopfleiste unsichtbar und durchlässig (unter dem Punkt liegt die Welt)');
  await shot('50-chat-ruhe',clipOf({x:0,y:tabs.y-120,w:tabs.w+120,h:tabs.h+260},0,1));
  // Linksklick direkt auf die Stelle (Maus kommt gerade erst an): geht in die Welt, Fenster bleibt zu
  await read(`(()=>{const e=game.enemies.find(e=>e.hp>0);if(e)game.target=e;})()`);const had=await read('!!game.target');
  await click(cx,cy);await wait(600);st=await state();
  ok(!st.active&&(!had||await read('!game.target')),'Linksklick auf die unsichtbare Leiste geht in die Welt'+(had?' (Zielwahl aufgehoben)':'')+', Fenster bleibt zu');
  await stopWalk();await click(cx+Math.min(6,free.w/4),cy,'right');await wait(200);const w=await walkState();ok(w.ok,'Rechtsklick an derselben Stelle läuft ('+(w.nav>0?'läuft':w.sel)+')');
  /* Uhrfehler-Runde (Heiler-WoW-Restliste): Rechtsklick AUF einen unsichtbaren Reiter läuft wie in der Lücke (WoW) – vorher blieb er am Reiter
     hängen und öffnete das Kontextmenü „Chatfenster“. Linksklick auf den Reiter öffnet ihn weiter (dungeon-fix3-check). */
  {await move(W*.5,H*.3);await wait(300);const tab=JSON.parse(await read(`(()=>{const r=[...document.querySelectorAll('#chatWindow .chat-tabs [data-chat-tab]')].map(b=>b.getBoundingClientRect()).find(r=>r.width>0);return JSON.stringify(r?{x:r.left+r.width/2,y:r.top+r.height/2}:null);})()`));
   ok(!!tab,'unsichtbarer Reiter vorhanden');const before=await state();ok(!before.active,'Chatfenster in Ruhe vor dem Rechtsklick auf den Reiter');
   await armLog();await stopWalk();await click(tab.x,tab.y,'right');await wait(300);const w2=await walkState(),menu=await read(`!!document.querySelector('.context-menu')`),after=await state();
   ok(w2.ok,'Rechtsklick auf den unsichtbaren Reiter läuft in die Welt ('+(w2.nav>0?'läuft':w2.sel||'nichts – '+await why(tab.x,tab.y)+' · darunter '+await read(`(()=>{const el=document.querySelector('#chatWindow');el.classList.add('chat-pass');const u=document.elementFromPoint(${Math.round(tab.x)},${Math.round(tab.y)});el.classList.remove('chat-pass');return (u?(u.id||u.tagName+'.'+u.className):'-')+' · aktiv '+el.classList.contains('active')+' · pe '+getComputedStyle(el.querySelector('[data-chat-tab]')).pointerEvents;})()`))+')');ok(!menu,'kein Kontextmenü „Chatfenster“ an der unsichtbaren Stelle');ok(!after.active,'Chatfenster bleibt in Ruhe');
   await read(`document.querySelector('.context-menu')?.remove()`);}
  // Maus weg und wieder drauf, verweilen: Fenster geht auf (wie WoW die Chatreiter einblendet), Maus weg: wieder Ruhe
  await move(W*.5,H*.3);await move(cx,cy);await move(cx+6,cy+1);await wait(700);st=await state();
  ok(st.active&&Number(st.op)>.9,'Maus verweilt über der Leiste → Chatfenster mit Reitern geht auf');
  await shot('51-chat-aktiv-nach-verweilen',clipOf({x:0,y:tabs.y-120,w:tabs.w+120,h:tabs.h+260},0,1));
  await move(W*.55,H*.35);await move(W*.56,H*.36);await wait(400);st=await state();ok(!st.active,'Maus weg → Chatfenster wieder in Ruhe');
 },
 async meldung(){
  await boot({cls:'dieter',level:12});
  await read(`(()=>{const {arena}=__k;arena.setArenaLevel(game,12);game.refreshStats?.();const list=arena.spawnArena(game,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:game.player.x+60,y:game.player.y+4}));game.target=list[0];game.player.direction='e';game.player.facing=1;})()`);await wait(600);
  // Kniff mit echter Abklingzeit auf der Hauptleiste und seine Taste
  const pick=JSON.parse(await read(`(()=>{const {rpg,prog}=__k,bar=rpg.actionBar(game),c=[];for(let i=0;i<10;i++){const id=bar[i],s=game.skills.find(s=>s.id===id);if(!s||!prog.available(game,id)||s.ground||s.classBuff||!(s.cd>=4))continue;const k=rpg.keyFor(game,id);if(/^\\d$/.test(k))c.push({id,name:s.name,key:k,cd:s.cd});}c.sort((a,b)=>a.cd-b.cd);return JSON.stringify(c[0]||null);})()`));
  assert.ok(pick,'Kniff mit Abklingzeit auf der Leiste');
  await read(`(()=>{window.__el=[];window.__toastBad=[];const el=document.querySelector('.error-line');if(el)new MutationObserver(()=>{if(el.classList.contains('show'))window.__el.push([Math.round(performance.now()),el.textContent]);}).observe(el,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});const t=document.querySelector('#toast');new MutationObserver(()=>{if(/verschnaufen|nicht bereit|bereits einen/.test(t.textContent)&&t.classList.contains('visible'))window.__toastBad.push(t.textContent);}).observe(t,{attributes:true,childList:true,characterData:true,subtree:true});})()`);
  await press(pick.key);await wait(250);
  ok(await read(`(game.cooldowns[${JSON.stringify(pick.id)}]||0)>1.5`),`${pick.name} [${pick.key}] gewirkt (Abklingzeit ${pick.cd} s)`);
  // 3 s lang alle 150 ms die Taste hämmern (echte Tastenereignisse)
  const t0=await read('performance.now()');for(let i=0;i<20;i++){await press(pick.key);await wait(150);}const t1=await read('performance.now()');
  await wait(100);await shot('40-meldung-leise-zeile');
  const lines=JSON.parse(await read('JSON.stringify(window.__el)')).filter(l=>l[0]>=t0);
  const shows=lines.filter((l,i)=>!i||l[0]-lines[i-1][0]>50);
  console.log('  Fehlerzeile:',JSON.stringify(shows));
  /* Höchstzahl aus der echten Dauer (unter Last dauern 20 Drücke länger als 3 s) */const most=Math.floor((t1-t0)/2000)+1;
  ok(shows.length>=1&&shows.length<=most&&shows.every((l,i)=>!i||l[0]-shows[i-1][0]>=1950),`20 Drücke in ${((t1-t0)/1000).toFixed(1)} s → ${shows.length}× „${shows[0]?.[1]}“ (höchstens einmal je 2 s, also ≤ ${most})`);
  const bad=JSON.parse(await read('JSON.stringify(window.__toastBad)'));if(bad.length)console.log('  Kurzmeldungen:',JSON.stringify([...new Set(bad)]));
  ok(!bad.length,'keine große rote Kurzmeldung „verschnaufen“');
  ok(await read(`![...document.querySelectorAll('.chat-line')].some(l=>/verschnaufen/.test(l.textContent))`),'nicht im Chat');
  const st=JSON.parse(await read(`(()=>{const e=document.querySelector('.error-line'),c=getComputedStyle(e),t=getComputedStyle(document.querySelector('#toast'));return JSON.stringify({size:parseFloat(c.fontSize),color:c.color,bg:c.backgroundColor,toastSize:parseFloat(t.fontSize)});})()`));
  ok(st.size<=16&&st.size<st.toastSize,`leise Zeile: ${st.size} px (Kurzmeldung ${st.toastSize} px), Farbe ${st.color}, kein Kasten`);
  await until(`(game.cooldowns[${JSON.stringify(pick.id)}]||0)<=.05&&game.gcd<=0`,12000,50);await press(pick.key);await wait(400);await press(pick.key);await wait(150);const r=await rect('.error-line');if(r)await shot('41-meldung-zeile-nah',clipOf({x:r.x-160,y:r.y-60,w:r.w+320,h:r.h+120},0,1.5));
  // Anderer Kniff während der GCD: eigene Zeile sofort (je Kniff, nicht global)
  await wait(2200);
  notes.meldung={pick,shows,style:st};
 },
};
try{
 await b.send('Log.enable');await b.resize(W,H);
 for(const [name,fn] of Object.entries(PARTS)){if(!want(name))continue;console.log('== '+name);await fn();}
 notes.consoleErrors=consoleErrors.filter(e=>!/favicon/.test(e));
 ok(b.errors.length===0,'keine Laufzeitfehler ('+b.errors.length+')');
 ok(notes.consoleErrors.length===0,'keine Konsolenfehler ('+notes.consoleErrors.length+')');
 writeFileSync(dir+'/report'+tag+(only?'-'+only.join('-'):'')+(soft?'-soft':'')+'.json',JSON.stringify({width:W,checks,failed,notes,shots},null,2));
 console.log((failed.length?'SOFT '+failed.length+' Fehlschläge, ':'PASS ')+'E-72 klicks ('+W+'×'+H+'): '+checks.length+' Prüfungen');
}catch(e){console.error('FAIL',e.message||e);console.error('Konsole:',consoleErrors.slice(0,10));console.error('Ausnahmen:',JSON.stringify(b.errors).slice(0,1500));try{await shot('fehler');}catch{}process.exitCode=1;}
finally{b.close();}
