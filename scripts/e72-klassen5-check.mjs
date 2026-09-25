// E-72 Runde 5 (klassen5) · Browser-Abnahme der Kenner-Befunde 26.09. nachts (Klassen-Feinschliff):
//  kevin     Band: Pfandbons im eigenen Halter, Leergut-Zahl als Abzeichen auf eigenem Grasfleck (vorher „×7“ direkt neben den Bons)
//  automat   Pfandautomat als Bildfolge: Treffer (BON!, Goldbalken, Münzen, am Helden BON! + Goldblitz) und Fehlgriff (KLEMMT!)
//  schorsch  Glut nach dem Kampf über 15 s (nie unter die Ruheglut), erstes Grillgut liegt bei Kampfbeginn auf dem Rost
//  kaethe    Farbkette ohne Hover (×N, Bonus)   eck   Eckzeichen heilt/schützt auf den Leisten (Anni, Käthe, Schorsch, Dieter)
//  boden     Bodenziel-Hinweis nennt die ersten drei Male die Einstellung „Bodenkniffe sofort an der Maus“
// Eigener Server + Wegwerf-Browser (Ports per SERVER_PORT/CDP_PORT, Vorgabe 4473/9873). Bilder: docs/e72-runde5/klassen5/*.jpg.
// Aufruf: node scripts/e72-klassen5-check.mjs [teil,teil …]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde5/klassen5';mkdirSync(dir,{recursive:true});
const only=process.argv.slice(2).find(a=>!a.startsWith('-'))?.split(',')||null,want=p=>!only||only.includes(p);
const b=await browserSession({port:Number(process.env.CDP_PORT||9873),serverPort:Number(process.env.SERVER_PORT||4473)});
const read=s=>b.evaluate(s),checks=[],shots=[];
const shot=async(name,clip)=>{const p=dir+'/'+name+'.jpg';if(!clip){const v=await read('({w:innerWidth,h:innerHeight})');clip={x:0,y:0,width:v.w,height:v.h,scale:.6};}const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:clip.scale<1?72:86,clip:{scale:1,...clip}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const rect=sel=>read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width?{x:r.left,y:r.top,w:r.width,h:r.height}:null;})()`);
const clipOf=(r,pad=8,scale=1)=>({x:Math.max(0,Math.round(r.x-pad)),y:Math.max(0,Math.round(r.y-pad)),width:Math.round(r.w+pad*2),height:Math.round(r.h+pad*2),scale});
const move=async(x,y)=>{await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:Math.round(x),y:Math.round(y),pointerType:'mouse'});await wait(200);};
const away=()=>move(1180,420);
/** Spielerfenster mit Band (ohne Tooltip). */
const panel=async(name,extraH=80,extraW=120,scale=1)=>{const p=await rect('.player-panel');return shot(name,{x:0,y:Math.max(0,Math.round(p.y-8)),width:Math.round(p.x+p.w+extraW),height:Math.round(p.h+extraH),scale});};
/** Held auf dem Bildschirm (Kamera des Renderers). */
const heroAt=()=>read(`(()=>{const R=globalThis.__mertloch.renderer,c=R.canvas.getBoundingClientRect(),o=R.viewOrigin||{x:R.camera.x-R.viewWidth/2,y:R.camera.y-R.viewHeight/2},p=game.player;return {x:c.left+(p.x-o.x)*c.width/R.viewWidth,y:c.top+(p.y-o.y)*c.height/R.viewHeight};})()`);
/** Hinweis im Bild (Prüfanzeige, nur für die Aufnahme). */
const proof=(text,x=340,y=70)=>read(`(()=>{document.querySelector('#k5-proof')?.remove();const d=document.createElement('div');d.id='k5-proof';d.style.cssText='position:absolute;left:${x}px;top:${y}px;z-index:99999;padding:8px 12px;background:#101812ee;border:2px solid #d7b571;color:#fff0c9;font:600 13px/1.5 Nunito,sans-serif;border-radius:8px;white-space:pre';d.textContent=${JSON.stringify(text)};document.body.append(d);})()`);
const unproof=()=>read(`document.querySelector('#k5-proof')?.remove()`);

async function boot(){
 const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:'kevin',level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));}catch{}delete Navigator.prototype.serviceWorker;if(location.protocol.startsWith('http'))try{localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});}catch{}`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<800&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ok=false;for(let i=0;i<600&&!ok;i++){await wait(200);ok=await read(`(()=>{try{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game;}catch{return false}})()`).catch(()=>false);}
 assert.ok(ok,'Anmeldebildschirm überwunden');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());document.body.dataset.heroFrame='off';document.head.insertAdjacentHTML('beforeend','<style id=k5-quiet>.milestone{visibility:hidden!important}</style>');`);await wait(1500);
 await read(`(async()=>{const m={res:await import('./class-resources.js'),arena:await import('./arena.js'),bar:await import('./action-bar-ui.js')};globalThis.__k5={m,freeze(){if(!game.__tick){game.__tick=game.tick;game.tick=()=>{};}},thaw(){if(game.__tick){game.tick=game.__tick;delete game.__tick;}},
  cast(id,point){game.gcd=0;game.cooldowns[id]=0;return game.action(id,point);}};return true;})()`);
}
/** Klasse, Stufe und Hauptbaum setzen, auf eine freie Wiese stellen, eine Übungspuppe davor (hud4-Muster). */
async function hero(cls,spec,level=12){
 const r=await read(`(()=>{const {arena}=__k5.m;__k5.thaw();game.dead=false;game.paused=false;game.classLocked=false;game.enemies=game.enemies.filter(e=>!e.arena);game.target=null;game.resetClassState();game.attackers?.clear();Object.assign(game.player,game.world.spawn,{hp:game.player.maxHp,inCombat:0});const hero=game.hero;game.hero=null;game.enterAs(${JSON.stringify(cls)});game.hero=hero;
  arena.setArenaLevel(game,${level});game.rpg.talents.spec=${JSON.stringify(spec)};game.refreshStats();game.resetClassState();game.emit('rpgChanged');game.emit('classChanged');
  const s=game.world.spawn,W=game.world;let spot=null;for(let r=260;r<900&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(W.onRoad?.(x,y,70)||W.blocked(x,y,40)||W.nearby?.(x,y,90)?.length)continue;let ok=true;for(let dx=-80;dx<=80&&ok;dx+=20)for(let dy=-60;dy<=60&&ok;dy+=20)if(W.blocked(x+dx,y+dy,6)||W.onRoad?.(x+dx,y+dy,10))ok=false;if(ok)spot={x,y};}spot||={x:s.x-150,y:s.y+230};
  Object.assign(game.player,{x:spot.x,y:spot.y,hp:game.player.maxHp,vx:0,vy:0,moving:false});game.path=[];game.moveTo=null;
  const list=arena.spawnArena(game,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:game.player.x+70,y:game.player.y+4}));game.target=list[0];game.player.direction='e';game.player.facing=1;const R=globalThis.__mertloch?.renderer;if(R){R.cameraFocus=null;R.camera={...R.camera,x:game.player.x,y:game.player.y};}
  document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return {id:game.member.id,spec:game.rpg.talents.spec,level:game.player.level};})()`);
 assert.equal(r.id,cls,'Klasse gewechselt: '+cls);await wait(900);return r;
}

const PARTS={
 async kevin(){await hero('kevin','kevin-fuse');await read(`(()=>{game.player.inCombat=7;game.res.bons=1;const p=game.player;game.res.pickups=[];for(let i=0;i<7;i++)game.res.pickups.push({id:900+i,x:p.x-40-i*12,y:p.y+(i%2?12:-10),life:13,max:14});})()`);await wait(600);await away();
  const t=await read(`(()=>{const hs=[...document.querySelectorAll('#resourceTray .rh-hit')].map(h=>({k:h.dataset.rhKey,r:h.getBoundingClientRect()}));const bons=hs.find(h=>h.k==='bons')?.r,pick=hs.find(h=>h.k==='pickups')?.r;return {bons:bons&&{l:bons.left,r:bons.right},pick:pick&&{l:pick.left,r:pick.right},note:[...document.querySelectorAll('#resourceTray .rh-hit')].find(h=>h.dataset.rhKey==='pickups')?.dataset.tooltipNote};})()`);
  assert.ok(t.bons&&t.pick,'Bon- und Leergut-Fläche');assert.ok(t.pick.l-t.bons.r>=6,'Abstand Bons → Leergut '+Math.round(t.pick.l-t.bons.r)+' px');assert.match(t.note,/^7 Flaschen liegen/);
  await panel('01-kevin-band-bons-und-leergut',70,40);await panel('01b-kevin-band-zoom',70,-60,2);
  checks.push('Kevin-Band: Bons bis '+Math.round(t.bons.r)+' px, Leergut ab '+Math.round(t.pick.l)+' px (Abstand '+Math.round(t.pick.l-t.bons.r)+' px), Tooltip „'+t.note+'“');
  await read(`game.res.pickups=[];game.res.bons=0`);},
 async automat(){await hero('kevin','kevin-fuse');await read(`game.player.inCombat=7;game.res.pickups=[];game.res.bons=0;`);await away();
  const w=await heroAt(),area=await rect('.action-area');const top=Math.max(0,Math.round(w.y-190)),clip={x:Math.round(w.x-330),y:top,width:660,height:Math.round(area.y+area.h-top+6),scale:.9};
  /* Bildfolge: Nachladen starten, bei `at` (Anteil des Balkens) zweiter Druck, nach `ms` hält die Seite Spiel und Animationen an */
  const frame=async(name,at,ms,press=true)=>{await read(`(()=>{__k5.thaw();document.getAnimations().forEach(a=>a.play());game.fx=game.fx.filter(f=>!String(f.kind).startsWith('reload'));game.res.reload=null;game.res.bottles=3;game.res.bons=0;window.__k5held=false;__k5.cast('reload');
    const hold=()=>{document.getAnimations().forEach(a=>a.pause());__k5.freeze();window.__k5held=true;};const step=()=>{const r=game.res.reload;if(r&&!r.tried&&r.t/r.total>=${at}){${press?`game.action('reload');setTimeout(hold,${ms});`:'hold();'}return;}requestAnimationFrame(step);};step();})()`);
   for(let i=0;i<200&&!(await read('window.__k5held'));i++)await wait(25);await shot(name,clip);const st=await read(`(()=>{const s=document.querySelector('.rh-reload-stamp');return {stamp:s&&!s.hidden?s.textContent:'',coins:document.querySelectorAll('.rh-reload-coin').length,bons:game.res.bons,jam:game.res.reload?.jam||0,bar:!document.querySelector('.rh-reload')?.hidden};})()`);
   await read(`(()=>{document.getAnimations().forEach(a=>a.play());__k5.thaw();})()`);await wait(1500);return st;};
  const z=await read(`(async()=>{const {RESOURCES}=await import('./content/index.js');return RESOURCES.kevin.reload.zone;})()`),inZone=(z[0]+z[1])/2;
  const before=await frame('02-automat-0-im-goldenen-feld',inZone,0,false);assert.ok(before.bar,'Balken steht');
  const hits=[];for(const ms of [60,220,450,800])hits.push([ms,await frame('02-automat-treffer-'+ms+'ms',inZone,ms)]);
  for(const [ms,s] of hits){assert.equal(s.stamp,'BON!','Treffer '+ms+' ms: Stempel '+s.stamp);assert.equal(s.bons,1,'Bon gutgeschrieben');}
  assert.ok(hits[0][1].coins>0,'Münzen springen');checks.push('Pfandautomat Treffer: Stempel „BON!“ bei '+hits.map(([ms,s])=>ms+' ms ('+s.coins+' Münzen)').join(', ')+'; Bon gutgeschrieben');
  const jams=[];for(const ms of [60,300,700])jams.push([ms,await frame('03-automat-klemmt-'+ms+'ms',.15,ms)]);
  for(const [ms,s] of jams){assert.equal(s.stamp,'KLEMMT!','Fehlgriff '+ms+' ms: '+s.stamp);assert.ok(s.jam>0,'klemmt');}
  checks.push('Pfandautomat Fehlgriff: Stempel „KLEMMT!“ bei '+jams.map(([ms])=>ms+' ms').join(', ')+', Automat hakt +1 s');
  await read(`game.res.reload=null`);},
 async schorsch(){await hero('schorsch','schorsch-chef');
  /* Kampf: Übungspuppe ist Gegner, Glut 40 – dann fällt der Gegner, p.inCombat läuft noch 7 s nach (vorher: Glut fiel 5/s weiter) */
  await read(`(()=>{const e=game.target;e.hp=e.maxHp-100;/* Übungspuppe kämpft erst, wenn sie getroffen ist (arena.js) */e.aggro=true;e.ai='combat';game.player.inCombat=7;game.res.glut=40;game.res.rost=[];})()`);await wait(300);
  await read(`(()=>{game.res.glut=40;game.enemies=game.enemies.filter(e=>!e.arena);game.target=null;window.__k5glut=[];const t0=performance.now();const log=()=>{window.__k5glut.push({t:(performance.now()-t0)/1000,glut:game.res.glut,inCombat:game.player.inCombat});if(performance.now()-t0<15600)setTimeout(log,250);};log();})()`);
  const marks=[];for(const s of [0,5,10,15]){await wait(s===0?100:5000-(s===5?100:0));marks.push(s);await panel('04-schorsch-glut-nach-kampf-'+String(s).padStart(2,'0')+'s',90,40);}
  await wait(700);const log=await read('window.__k5glut');const min=Math.min(...log.map(x=>x.glut)),end=log.at(-1).glut,rest=await read(`(async()=>(await import('./content/index.js')).RESOURCES.schorsch.rest)()`);
  const tail=log.filter(x=>x.inCombat>0).length;assert.ok(tail>5,'Nachlauf von inCombat erfasst ('+tail+' Messungen)');assert.ok(min>=rest-.01,'Glut nie unter der Ruheglut: min '+min.toFixed(1));assert.ok(Math.abs(end-rest)<.5,'endet bei der Ruheglut: '+end.toFixed(1));
  const row=[0,2,4,6,8,10,12,15].map(s=>{const x=log.reduce((a,b)=>Math.abs(b.t-s)<Math.abs(a.t-s)?b:a);return s+' s: '+Math.round(x.glut)+(x.inCombat>0?' (Nachlauf)':'');});
  await proof('Glut nach dem Kampf (Kenner vorher: 40 → 9 in 10 s)\n'+row.join('\n'),340,64);await panel('04b-schorsch-glut-verlauf',210,340);await unproof();
  checks.push('Schorsch Glut nach dem Kampf: '+row.join(' · ')+' – nie unter '+rest);
  /* Kampfbeginn: Rost leer, Gegner greift an → erstes Grillgut liegt, Auflegen klingt ab */
  await read(`(()=>{const {arena}=__k5.m;const list=arena.spawnArena(game,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:game.player.x+70,y:game.player.y+4}));game.target=list[0];game.res.rost=[];game.cooldowns.mark=0;game.player.inCombat=0;})()`);await wait(400);
  const pre=await read(`game.res.rost.length`);await read(`(()=>{const e=game.target;e.hp=e.maxHp-100;/* Übungspuppe kämpft erst, wenn sie getroffen ist (arena.js) */e.aggro=true;e.ai='combat';game.player.inCombat=7;})()`);await wait(500);
  const st=await read(`({rost:game.res.rost.map(i=>i.item),cd:game.cooldowns.mark,glut:game.res.glut,fight:game.res.fight,engaged:__k5.m.res.grillEngaged(game),inCombat:game.player.inCombat,foes:game.enemies.filter(e=>e.aggro&&e.hp>0).map(e=>e.ai+'/'+e.hp)})`);assert.equal(pre,0);assert.deepEqual(st.rost,['wurst'],'Wurst liegt bei Kampfbeginn');
  await panel('05-schorsch-kampfbeginn-wurst-liegt',90,40);const bar=await rect('.action-area');await shot('05b-schorsch-auflegen-klingt-ab',clipOf(bar,10,1));
  checks.push('Schorsch Kampfbeginn: Rost '+JSON.stringify(st.rost)+', Auflegen klingt noch '+st.cd.toFixed(1)+' s ab, Glut '+Math.round(st.glut));},
 async kaethe(){await hero('kaethe','kaethe-grand');await away();
  await read(`(()=>{game.player.inCombat=7;game.res.hand=[{suit:'herz',rank:'D'},{suit:'herz',rank:'K'},{suit:'herz',rank:'9'}];game.res.deck.unshift({suit:'herz',rank:'A'},{suit:'herz',rank:'10'},{suit:'pik',rank:'8'});game.res.chain={suit:null,n:0};})()`);
  const chips=[];for(const [i,id] of ['strike','mark','burst'].entries()){await read(`__k5.cast(${JSON.stringify(id)})`);await wait(500);const c=await read(`JSON.stringify(game.res.chain)`);chips.push(c);await panel('06-kaethe-kette-'+(i+1)+'-karten',80,60);if(i===2)await panel('06b-kaethe-kette-zoom',80,-40,2);}
  const last=JSON.parse(chips.at(-1));assert.equal(last.suit,'herz');assert.equal(last.n,2,'drei Herz in Folge');
  const tip=await read(`(()=>{const h=[...document.querySelectorAll('#resourceTray .rh-hit')].find(s=>s.dataset.rhKey==='chain');return h?h.dataset.tooltipNote:null;})()`);assert.ok(tip&&/×3/.test(tip),'Tooltip der Kette: '+tip);
  checks.push('Käthe Farbkette ohne Hover: '+chips.join(' → ')+' · Tooltip „'+tip+'“');},
 async eck(){const rows=[];
  for(const [cls,spec,setup] of [['baerbel','baerbel-care',''],['kaethe','kaethe-herz',`game.res.hand=[{suit:'herz',rank:'A'},{suit:'pik',rank:'D'},{suit:'kreuz',rank:'10'}];`],['schorsch','schorsch-chef',`game.res.rost=[{item:'wurst',done:.7,smoked:false}];`],['dieter','dieter-wall','']]){await hero(cls,spec,20);await read(`(()=>{game.player.inCombat=7;${setup}})()`);await wait(500);await away();
   const roles=await read(`[...document.querySelectorAll('.action-area .skill[data-skill]')].filter(b=>b.dataset.skillRole).map(b=>b.dataset.skill+':'+b.dataset.skillRole+(b.querySelector(':scope>.skill-role')&&getComputedStyle(b.querySelector(':scope>.skill-role')).display!=='none'?'':'(verdeckt)'))`);
   const area=await rect('.action-area');await shot('07-eckzeichen-'+cls,clipOf(area,10,1.6));rows.push(cls+': '+roles.join(' '));
   assert.ok(roles.some(r=>r.startsWith('heal:heal')),cls+': Heiltaste mit Plus');assert.ok(roles.some(r=>r.startsWith('parry:guard')),cls+': Parade mit Schild');assert.ok(!roles.some(r=>r.startsWith('strike:')&&cls!=='kaethe'),cls+': Aufbaukniff ohne Zeichen');
   if(cls==='kaethe')assert.ok(roles.includes('strike:heal')&&roles.includes('mark:guard')&&!roles.some(r=>r.startsWith('burst:')),'Käthe: Herz heilt, Pik schützt, Kreuz ohne');
   if(cls==='schorsch')assert.ok(roles.some(r=>r.startsWith('burst:heal')),'Schorsch: Servieren mit Wurst heilt');}
  checks.push('Eckzeichen: '+rows.join(' | '));},
 async boden(){await hero('dieter','dieter-wall',12);await read(`(()=>{game.settings.groundTips=0;game.settings.groundAtCursor=false;game.player.inCombat=7;game.player.energy=100;})()`);await away();
  const toast=()=>read(`globalThis.__mertlochMessages.toasts.state()`);
  /* Die Meldung wartet hinter Begrüßung und großer Einblendung (toast-queue.js hold) – je Druck warten, bis sie steht */const texts=[];
  for(let i=0;i<4;i++){await read(`(()=>{game.aiming=null;game.cooldowns.ground=0;game.gcd=0;game.player.energy=100;game.action('ground');})()`);let st=null;for(let k=0;k<60;k++){st=await toast();if(/Boden wählen/.test(st.current))break;await wait(200);}
   texts.push(st.current);assert.equal(await read('game.aiming'),'ground','Zielmodus '+(i+1));
   if(i===0||i===3){await wait(250);const r=await rect('#toast');assert.ok(r,'Hinweis sichtbar');await shot(i?'08c-bodenziel-hinweis-ab-dem-vierten-mal':'08-bodenziel-hinweis-mit-einstellung',clipOf({x:r.x-60,y:r.y-10,w:r.w+120,h:r.h+20},10,1));if(!i){const v=await read('({w:innerWidth,h:innerHeight})');await shot('08b-bodenziel-hinweis-gesamt',{x:0,y:0,width:v.w,height:v.h,scale:.6});}}
   await read(`(()=>{game.aiming=null;game.aimPoint=null;})()`);for(let k=0;k<20;k++){if(!/Boden wählen/.test((await toast()).current))break;await wait(100);}}
  for(let i=0;i<3;i++)assert.match(texts[i],/Bodenkniffe sofort an der Maus/,'Hinweis '+(i+1)+': '+texts[i]);assert.ok(/^Boden wählen/.test(texts[3])&&!/Bodenkniffe/.test(texts[3]),'ab dem vierten Mal ohne Tipp: '+texts[3]);
  const gone=(await toast()).current;assert.ok(!/Boden wählen/.test(gone),'Hinweis verschwindet mit dem Zielmodus: '+gone);assert.equal(await read('game.settings.groundTips'),3);
  checks.push('Bodenziel: 1.–3. „'+texts[0]+'“ · 4. „'+texts[3]+'“ · Zielmodus zu → Hinweis weg; Standard der Einstellung bleibt aus');}
};

try{
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await b.resize(1600,900);await boot();
 for(const part of ['kevin','automat','schorsch','kaethe','eck','boden'])if(want(part)){await PARTS[part]();console.log('ok',part);}
 assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks,shots,errors:b.errors},null,1));console.log('PASS E-72 klassen5:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);console.error(JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{b.close();}
