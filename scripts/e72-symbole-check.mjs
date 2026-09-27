// E-72 · Rucksack-Symbole der Klassenkleidung im echten Spiel: Grillschürze, Schiebermütze, Strickjacke und Lesebrille zeigen ihr eigenes
// Malerbild (nicht mehr gear-jacket/gear-helmet/gear-chain), daneben Clanjacke, Regenjacke, Bierdeckelweste und Dienstmütze zum Stilvergleich.
// Eigener Server und Wegwerf-Browser (Ports 9895/4495, per CDP_PORT/SERVER_PORT änderbar), Service Worker gesperrt.
// Screenshots (JPEG): docs/e72-runde6/symbole/. Aufruf: node scripts/e72-symbole-check.mjs
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde6/symbole';mkdirSync(dir,{recursive:true});
const NEU=['grillschuerze','schorschmuetze','kaethestrickjacke','kaethebrille'],VERGLEICH=['kutte','regenjacke','bierdeckelweste','dienstmuetze'];
const b=await browserSession({port:Number(process.env.CDP_PORT||9895),serverPort:Number(process.env.SERVER_PORT||4495)});
const read=s=>b.evaluate(s),checks=[],shots=[];
const shot=async(name,clip)=>{const p=dir+'/'+name+'.jpg';const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,clip:{scale:1,...clip}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const box=async(sel,pad=6)=>{const r=await read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,Math.round(b.left-${pad})),y:Math.max(0,Math.round(b.top-${pad})),width:Math.round(b.width+${pad*2}),height:Math.round(b.height+${pad*2})};})()`);assert.ok(r,'nicht gefunden: '+sel);return r;};
async function until(expression,n=80){for(let i=0;i<n;i++){if(await read(expression).catch(()=>false))return;await wait(100);}throw Error('Timeout: '+expression);}
async function boot(){
 const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:'schorsch',level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));caches?.keys?.().then(k=>k.forEach(n=>caches.delete(n)));}catch{}delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<800&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ok=false;for(let i=0;i<600&&!ok;i++){await wait(200);ok=await read(`(()=>{try{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game;}catch{return false}})()`).catch(()=>false);}
 assert.ok(ok,'Anmeldebildschirm überwunden');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());document.head.insertAdjacentHTML('beforeend','<style id=e72-notoast>#toast{visibility:hidden!important}</style>');game.enemies=[];game.player.inCombat=0;`);await wait(1500);
}
try{
 await b.resize(1600,900);await boot();
 // Rucksack: Vergleich links, neue Klassenkleidung rechts daneben (eine Reihe)
 const inv=[...VERGLEICH.slice(0,3),...NEU.slice(0,2),'dienstmuetze',...NEU.slice(2)];
 await read(`(()=>{game.rpg.inventory=${JSON.stringify(inv)}.map(id=>({id,count:1}));game.emit('rpgChanged');document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);await wait(300);
 await b.press('i');await until(`!!document.querySelector('.popup-bag [data-item="grillschuerze"]')`);await wait(1200);
 // Wirksam: jedes neue Stück lädt seine eigene Datei und zeichnet ein eigenes Bild
 const art=await read(`(async()=>{const {itemArt}=await import('./rpg-ui.js');const {contentAsset}=await import('./content-art.js');const out={};for(const id of ${JSON.stringify([...NEU,...VERGLEICH])}){const a=contentAsset(itemArt(id));
  const cv=document.querySelector('.popup-bag [data-item="'+id+'"] canvas');let sig=null;if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]){n++;h=(h*31+d[i]*7+d[i+1]*13+d[i+2])>>>0;}}sig=n+':'+h;}
  out[id]={path:a?.meta.path||null,canvas:cv?cv.width+'x'+cv.height:null,sig,geladen:!!a&&a.image.complete&&a.image.naturalWidth===64&&a.image.src.endsWith('/items/'+id+'.png')};}return out;})()`);
 for(const id of NEU){const r=art[id];assert.equal(r.path,'assets/precision/runtime/items/'+id+'.png',id+': Rucksackbild');assert.ok(!/gear-/.test(r.path),id);assert.ok(r.canvas&&r.sig&&!r.sig.startsWith('0:'),id+': gezeichnet');assert.ok(r.geladen,id+': Bilddatei geladen (64 px, eigene Datei)');}
 assert.equal(new Set(NEU.map(id=>art[id].sig)).size,NEU.length,'vier verschiedene Bilder im Rucksack');
 checks.push('Rucksack: '+NEU.map(id=>id+' → '+art[id].path.split('/').pop()+' ('+art[id].canvas+')').join(', '));
 const grid=await box('.popup-bag .bag-grid',4);await shot('rucksack-1600',{...grid,height:Math.min(grid.height,190)});
 await shot('rucksack-2x',{...grid,height:Math.min(grid.height,120),scale:2});
 await shot('rucksack-fenster',await box('.popup-bag',4));
 // Tooltip über der Grillschürze
 const p=await read(`(()=>{const r=document.querySelector('.popup-bag [data-item="grillschuerze"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await until(`!document.querySelector('#itemTooltip')?.classList.contains('hidden')`,40).catch(()=>{});await wait(400);
 const t=await read(`(()=>{const t=document.querySelector('#itemTooltip');if(!t||t.classList.contains('hidden'))return null;const r=t.getBoundingClientRect();return {x:Math.round(Math.max(0,Math.min(r.left,${p.x}-40))),y:Math.round(Math.max(0,Math.min(r.top,${p.y}-40))),w:Math.round(Math.max(r.right,${p.x}+40)),h:Math.round(Math.max(r.bottom,${p.y}+40)),name:t.querySelector('strong,.tooltip-title,h3')?.textContent||t.textContent.slice(0,40)};})()`);
 if(t){await shot('tooltip-grillschuerze',{x:t.x,y:t.y,width:t.w-t.x,height:t.h-t.y});checks.push('Tooltip über der Grillschürze: „'+t.name.trim()+'“');}
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});await wait(300);
 // Figurenfenster: angelegte Klassenkleidung (Schorsch) zeigt dieselben Bilder in den Plätzen
 await read(`(()=>{Object.assign(game.rpg.equipment,{body:'grillschuerze',head:'schorschmuetze'});game.rpg.inventory=game.rpg.inventory.filter(e=>!['grillschuerze','schorschmuetze'].includes(e.id));game.refreshStats?.();game.emit('rpgChanged');})()`);
 await b.press('c');await until(`!!document.querySelector('.popup-person')`,60).catch(()=>{});await wait(900);
 const person=await read(`!!document.querySelector('.popup-person')`);if(person){await shot('figur-schorsch',await box('.popup-person',4));checks.push('Figurenfenster mit angelegter Grillschürze und Schiebermütze');}
 console.log(JSON.stringify({ok:true,checks,shots,errors:b.errors?.slice?.(0,5)||[]},null,1));
}catch(e){console.error('FEHLER',e.message);process.exitCode=1;try{await shot('fehler',{x:0,y:0,width:1600,height:900,scale:.6});}catch{}}
finally{b.close();}
