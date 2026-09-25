// E-72 · Ressourcen-Anzeige und Effekte im echten Spiel (docs/KLASSEN-RESSOURCEN-2026-09-25.md §6): je Klasse Leiste, Band,
// Leistenkarten, Gegnerkarte, Talentbilder und die Welt-Effekte der Ressourcen-Ereignisse. Eigener Server und Wegwerf-Browser
// (Ports 9480/4280, per CDP_PORT/SERVER_PORT änderbar). Screenshots: docs/e72-abnahme/hud-fx/ (JPEG), Bericht: report.json.
// Aufruf: node scripts/e72-hud-fx-check.mjs [klasse,klasse …] [--touch-only] [--no-touch]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-abnahme/hud-fx';mkdirSync(dir,{recursive:true});
const args=process.argv.slice(2),only=args.find(a=>!a.startsWith('-'))?.split(',')||null,touchOnly=args.includes('--touch-only'),noTouch=args.includes('--no-touch');
const b=await browserSession({port:Number(process.env.CDP_PORT||9480),serverPort:Number(process.env.SERVER_PORT||4280)});
const read=s=>b.evaluate(s),checks=[],shots=[];
/** Ausschnitte in voller Schärfe; Vollbilder verkleinert (Abnahmeordner klein halten). */
const shot=async(name,clip)=>{const p=dir+'/'+name+'.jpg';if(!clip){const v=await read('({w:innerWidth,h:innerHeight})');clip={x:0,y:0,width:v.w,height:v.h,scale:v.w>1000?.6:1};}const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:clip.scale<1?70:80,clip:{scale:1,...clip}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
/** Welt-Ausschnitt um den Helden (Bildschirmmitte der Weltfläche). */
const around=async(w=560,h=380,dy=-30,dx=40)=>{const r=await read(`(()=>{const R=globalThis.__mertloch.renderer,c=R.canvas.getBoundingClientRect(),z=R.zoom||1,p=game.player,cam=R.camera;return {x:c.left+c.width/2+(p.x-cam.x)*z,y:c.top+c.height/2+(p.y-cam.y)*z,W:innerWidth,H:innerHeight};})()`);return {x:Math.max(0,Math.min(r.W-w,Math.round(r.x+dx-w/2))),y:Math.max(0,Math.min(r.H-h,Math.round(r.y-h/2+dy))),width:w,height:h};};
const panelClip=async(extra=58)=>{const r=await read(`(()=>{const b=document.querySelector('.player-panel').getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};})()`);return {x:Math.max(0,Math.round(r.x-6)),y:Math.max(0,Math.round(r.y-6)),width:Math.round(r.w+12),height:Math.round(r.h+extra)};};
const barClip=async()=>{const r=await read(`(()=>{const b=document.querySelector('.action-area').getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};})()`);return {x:Math.max(0,Math.round(r.x-4)),y:Math.max(0,Math.round(r.y-70)),width:Math.round(Math.min(r.w+8,900)),height:Math.round(r.h+74)};};

async function boot(){
 const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:'dieter',level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));caches?.keys?.().then(k=>k.forEach(n=>caches.delete(n)));}catch{}delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<Number(process.env.BOOT_TRIES||400)*2&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ok=false;for(let i=0;i<600&&!ok;i++){await wait(200);ok=await read(`(()=>{try{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game;}catch{return false}})()`).catch(()=>false);}
 assert.ok(ok,'Anmeldebildschirm überwunden');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());document.head.insertAdjacentHTML('beforeend','<style id=e72-notoast>#toast{visibility:hidden!important}</style>');`);await wait(1500);
 // Prüfhilfen im Browser: Spiel einfrieren/weiterlaufen lassen, Zeit gezielt vorspulen, Module laden.
 await read(`(async()=>{const m={res:await import('./class-resources.js'),fx:await import('./combat-fx.js'),arena:await import('./arena.js')};globalThis.__e72={m,freeze(){if(!game.__tick){game.__tick=game.tick;game.tick=()=>{};}},thaw(){if(game.__tick){game.tick=game.__tick;delete game.__tick;}},step(s,dt=1/60){const t=game.__tick||game.tick;for(let k=0;k<s;k+=dt)t.call(game,dt);},
  until(fn,max=3){const t=game.__tick||game.tick;for(let k=0;k<max;k+=1/60){if(fn())return k;t.call(game,1/60);}return -1;},
  cast(id,point){game.gcd=0;game.cooldowns[id]=0;const n=game.fxSerial||0,ok=game.action(id,point);const kinds=game.fx.filter(f=>f.id>n&&f.type==='combat').map(f=>f.kind);const msg=game.events.filter(e=>e.type==='toast').map(e=>e.text).slice(-1)[0]||'';(globalThis.__e72log||=[]).push({id,ok,kinds,msg});return ok;}};return true;})()`);
}
/** Klasse wechseln, Stufe und Hauptbaum setzen, auf eine freie Wiese stellen, drei Übungspuppen davor. */
async function hero(cls,spec,level=12){
 const r=await read(`(()=>{const {arena}=__e72.m;__e72.thaw();game.dead=false;game.paused=false;game.classLocked=false;game.enemies=game.enemies.filter(e=>!e.arena);game.target=null;game.resetClassState();game.attackers?.clear();Object.assign(game.player,game.world.spawn,{hp:game.player.maxHp,inCombat:0});const why={dead:game.dead,paused:game.paused,inCombat:game.player.inCombat,hub:game.atHub()};/* Prüfheld ist klassengebunden (game.hero): für den Wechsel kurz lösen */const hero=game.hero;game.hero=null;const ok=game.enterAs(${JSON.stringify(cls)});game.hero=hero;
  arena.setArenaLevel(game,${level});game.rpg.talents.spec=${JSON.stringify(spec)};game.refreshStats();game.resetClassState();game.emit('rpgChanged');game.emit('classChanged');
  const s=game.world.spawn,W=game.world;let spot=null;/* freie Wiese: keine Straße/Platz, nichts im Weg, kein Gebäude oder Dorfbewohner in der Nähe */for(let r=260;r<900&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(W.onRoad?.(x,y,70)||W.blocked(x,y,40)||W.nearby?.(x,y,90)?.length)continue;let ok=true;for(let dx=-80;dx<=80&&ok;dx+=20)for(let dy=-60;dy<=60&&ok;dy+=20)if(W.blocked(x+dx,y+dy,6)||W.onRoad?.(x+dx,y+dy,10))ok=false;if(ok)spot={x,y};}spot||={x:s.x-150,y:s.y+230};Object.assign(game.player,{x:spot.x,y:spot.y,hp:game.player.maxHp,vx:0,vy:0,moving:false});game.path=[];game.moveTo=null;
  const list=arena.spawnArena(game,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:game.player.x+44,y:game.player.y+2}));game.target=list[0];game.player.direction='e';game.player.facing=1;
  document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return {ok,why,id:game.member.id,level:game.player.level,spec:game.rpg.talents.spec};})()`);if(r.id!==cls)console.error('enterAs',JSON.stringify(r));
 assert.equal(r.id,cls,'Klasse gewechselt: '+cls);await wait(900);return r;
}
const hud=()=>read(`(async()=>JSON.stringify({h:__e72.m.res.resourceHud(game),ui:globalThis.__mertlochResourceHud?.state()}))()`).then(JSON.parse);
/** Bodenkniff werfen und bis zum Einschlag (Effektart kinds) vorspulen, dann `after` Sekunden weiter. */
const groundAt=async(point,kinds,after)=>{await read(`(()=>{__e72.freeze();__e72.cast('ground',${point});const n=game.fxSerial||0;__e72.until(()=>game.fx.some(f=>f.id>n&&${JSON.stringify(kinds)}.includes(f.kind)));__e72.step(${after});})()`);await wait(260);};
const freezeAt=async(expr,seconds)=>{await read(`(()=>{__e72.freeze();${expr};__e72.step(${seconds});})()`);await wait(260);const log=await read('JSON.stringify((globalThis.__e72log||[]).splice(0))');if(process.env.E72_DEBUG)console.log(expr.slice(0,40),log,await read(`JSON.stringify(game.fx.filter(f=>f.type==='combat').map(f=>f.kind+':'+(f.classId||'')+':'+(1-f.life/f.max).toFixed(2)))`));};

/** Talentfenster: Talente ohne Atlasbild zeigen ihr Vokabel-Symbol auf Klassenfarbe. */
async function talentWindow(cls){await read(`(async()=>{const {learnTalent}=await import('./talents.js'),spec=game.rpg.talents.spec;game.player.inCombat=0;game.enemies.forEach(e=>{e.aggro=false;e.ai='roaming';});Object.assign(game.player,game.world.spawn);const got=[0,1,3,4].map(n=>learnTalent(game,spec+'-'+n));return got;})()`);await read(`document.querySelector('.game-menu-rail [data-panel="talents"],.game-menu-windows [data-shell="talents"]')?.click()`);await wait(1400);
 const r=await read(`(()=>{const cv=[...document.querySelectorAll('[data-talent-art]')];/* Klassenfarbgrund statt grünem Ersatzgrund: Randpixel warm/violett (r > g); unabhängig vom Bild-Zwischenspeicher */const vocab=cv.filter(c=>{try{const d=c.getContext('2d').getImageData(1,1,1,1).data;return d[3]>0&&d[0]>d[1];}catch{return false;}}).length;const pop=document.querySelector('.game-popup:not([hidden])')?.getBoundingClientRect();return {n:cv.length,vocab,pop:pop?{x:Math.max(0,Math.round(pop.left)),y:Math.max(0,Math.round(pop.top)),width:Math.round(Math.min(pop.width,innerWidth-pop.left)),height:Math.round(Math.min(pop.height,innerHeight-pop.top))}:null};})()`);
 await read(`document.querySelectorAll('.milestone').forEach(m=>m.style.visibility='hidden')`);await wait(200);await shot(cls+'-9-talente',r.pop||undefined);if(!r.vocab)console.error('talente',cls,await read(`JSON.stringify([...document.querySelectorAll('[data-talent-art]')].slice(0,4).map(c=>({id:c.dataset.talentArt,cell:c.dataset.talentCell,px:[...c.getContext('2d').getImageData(3,3,1,1).data]})))`));assert.ok(r.n>0,'Talentfenster offen ('+cls+')');assert.ok(r.vocab>0,'Vokabel-Talentbilder ('+cls+'): '+r.vocab+'/'+r.n);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(500);return r;}
const CLASSES={
 async dieter(){await hero('dieter','dieter-brawl');
  // Zeche anschreiben (echte Treffer), dann Randale ausgeben (bezahlt) – Leiste in Fahrt
  await read(`(()=>{const e=game.target;game.player.inCombat=7;for(let i=0;i<5;i++)game.hitPlayer(e,game.player.maxHp*.06);game.player.energy=88;})()`);await wait(400);
  let s=await hud();assert.equal(s.h.kind,'rage');assert.ok(s.h.tab>0,'Zeche angeschrieben');assert.ok(s.ui.tray&&s.ui.meter,'Band und Leiste da');
  await shot('dieter-1-hud-zeche',await panelClip());
  await freezeAt(`__e72.cast('mark')`,.12);await shot('dieter-2-bezahlt',await panelClip());s=await hud();assert.ok(s.ui.anims.includes('tab-pay'),'Bezahlen angezeigt');
  await read(`__e72.thaw()`);await read(`(()=>{const e=game.target;for(let i=0;i<6;i++)game.hitPlayer(e,game.player.maxHp*.08);game.player.hp=game.player.maxHp;})()`);await wait(300);
  await freezeAt(`__e72.cast('zeche')`,.28);await shot('dieter-3-prellen-welt',await around());await shot('dieter-3b-prellen-hud',await panelClip());
  await read(`__e72.thaw()`);await freezeAt(`game.hitPlayer(game.target,game.player.maxHp*.05);__e72.cast('mark')`,.3);await shot('dieter-4-muenzen-welt',await around(380,300));
  await read(`__e72.thaw()`);await shot('dieter-0-uebersicht');checks.push('dieter: Kassenbon wächst mit der Zeche, Bezahlen streicht durch, Prellen als Druckwelle mit Bonfetzen und Münzen');},
 async baerbel(){await hero('baerbel','baerbel-stage');
  await read(`(()=>{game.player.inCombat=7;game.player.energy=100;for(const id of ['strike','mark'])__e72.cast(id);})()`);await wait(350);
  let s=await hud();assert.equal(s.h.kind,'trend');assert.ok(s.h.trend>=2,'Trend steigt: '+s.h.trend);await shot('anni-1-hud-trend',await panelClip());await shot('anni-1b-leiste-wiederholung',await barClip());
  const rep=await read(`(()=>{const b=document.querySelector('.action-area .rh-repeat');if(!b)return null;const r=b.getBoundingClientRect();return {x:Math.round(r.left-60),y:Math.round(r.top-14),width:Math.round(r.width+120),height:Math.round(r.height+24)};})()`);assert.ok(rep,'Wiederholungs-Taste markiert');{const p=dir+'/anni-1c-wiederholung-zoom.jpg';const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:85,clip:{...rep,scale:2}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);}
  await freezeAt(`__e72.cast('throw')`,.12);await shot('anni-2-kamerablitz',await around(360,300));
  await read(`__e72.thaw();__e72.cast('interrupt');`);await freezeAt(`__e72.cast('parry')`,.35);s=await hud();assert.ok(s.h.viral>0,'Viral');await shot('anni-3-viral',await around(420,340));await shot('anni-3b-viral-hud',await panelClip());
  await read(`__e72.thaw();game.player.parry=0;game.player.invulnerable=0;game.player.dash=0;`);await freezeAt(`game.player.parry=0;game.hitPlayer(game.target,game.player.maxHp*.25)`,.5);await shot('anni-4-shitstorm',await around(360,300));
  await read(`__e72.thaw()`);await freezeAt(`__e72.cast('mark')`,.4);await shot('anni-5-likes',await around(300,260));
  await read(`__e72.thaw()`);await shot('anni-0-uebersicht');checks.push('anni: Likes im Aperol-Verlauf, Trend-Herzen, Verfallsring, Wiederholung gedämpft, Kamerablitz, Konfetti, Shitstorm');},
 async kevin(){await hero('kevin','kevin-hunt');
  await read(`(()=>{game.player.inCombat=7;game.random=(r=>()=>.1)();for(let i=0;i<4;i++)__e72.cast('strike');})()`);await wait(300);
  let s=await hud();assert.equal(s.h.kind,'ammo');assert.ok(s.h.value<12,'Flaschen verbraucht');assert.ok(s.h.pickups>0,'Leergut liegt');
  await read(`(()=>{const p=game.player;game.res.pickups.forEach((b,i)=>Object.assign(b,{x:p.x-26-i*9,y:p.y+(i%2?8:-6),life:Math.min(b.life,b.max-1)}));})()`);await wait(400);await shot('kevin-1-leergut-boden',await around(420,300,-10));await shot('kevin-1b-hud',await panelClip());
  const home=await read(`({x:game.player.x,y:game.player.y})`),bottle=await read(`(()=>{const b=game.res.pickups[0];return {x:b.x,y:b.y};})()`);await freezeAt(`Object.assign(game.player,{x:${bottle.x}+12,y:${bottle.y}})`,.22);await shot('kevin-2-aufsammeln',await around(360,280,-30,-10));await read(`(()=>{__e72.thaw();Object.assign(game.player,${JSON.stringify(home)});})()`);
  await read(`__e72.thaw();game.res.bottles=3;`);await read(`__e72.cast('reload')`);await wait(80);
  await read(`(()=>{__e72.freeze();const r=game.res.reload;__e72.step(r.total*(r.zone[0]+r.zone[1])/2);})()`);await wait(300);s=await hud();assert.ok(s.ui.reload,'Pfandautomat-Balken sichtbar');
  await shot('kevin-3-pfandautomat-jetzt',await barClip());await read(`(()=>{__e72.thaw();__e72.cast('reload');})()`);await wait(120);await shot('kevin-4-bon',await around(320,280));s=await hud();assert.ok(s.h.bons>=1,'Pfandbon');
  await read(`(()=>{game.res.bottles=2;__e72.cast('reload');})()`);await wait(50);await read(`(()=>{__e72.freeze();__e72.step(.2);__e72.thaw();__e72.cast('reload');__e72.freeze();__e72.step(.12);})()`);await wait(200);await shot('kevin-5-klemmt',await barClip());
  await read(`__e72.thaw()`);await shot('kevin-0-uebersicht');checks.push('kevin: Bierkasten, Pfandbons, Leergut glitzert, Aufsammelbogen, Pfandautomat mit Bon-Zone, BON und Klemmer');},
 async schorsch(){await hero('schorsch','schorsch-flamme');
  await read(`(()=>{game.player.inCombat=7;for(const id of ['mark','mark','mark'])__e72.cast(id);game.res.rost.forEach((it,i)=>it.done=[.2,.72,1.15][i]);game.res.glut=70;})()`);await wait(400);
  let s=await hud();assert.equal(s.h.kind,'grill');assert.equal(s.h.rost.length,3);await shot('schorsch-1-hud-rost',await panelClip());
  /* Tooltip statt Text: Maus auf den zweiten Rostplatz */{const r=await read(`(()=>{const h=[...document.querySelectorAll('#resourceTray .rh-hit')].filter(x=>!x.hidden)[1].getBoundingClientRect();return {x:h.left+h.width/2,y:h.top+h.height/2};})()`);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y,pointerType:'mouse'});await wait(450);
   const tip=await read(`(()=>{const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:null;})()`);assert.ok(tip&&/Gar|Roh|Durch|Verkohlt/.test(tip),'Rost-Tooltip: '+tip);await shot('schorsch-1c-tooltip',await panelClip(120));await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:900,y:600,pointerType:'mouse'});checks.push('schorsch: Tooltip am Rostplatz „'+tip.replace(/\s+/g,' ')+'“');}await shot('schorsch-1b-glut-fuesse',await around(260,220,10));
  await freezeAt(`__e72.cast('burst')`,.2);await shot('schorsch-2-servieren-flug',await around(380,300));
  await read(`__e72.thaw();game.res.glut=60;`);await freezeAt(`__e72.cast('throw')`,.45);await shot('schorsch-3-glutbrocken-brand',await around(380,300));
  await read(`__e72.thaw();game.res.glut=96;`);await freezeAt(`__e72.cast('strike')`,.3);await shot('schorsch-4-stichflamme',await around(480,380));s=await hud();assert.ok(s.h.locked>0,'Grill aus');await shot('schorsch-4b-grill-aus',await panelClip());
  await read(`__e72.thaw();game.res.lock=0;game.res.glut=70;`);await freezeAt(`__e72.cast('heal')`,.5);await shot('schorsch-5-dampf',await around(420,320));
  await read(`__e72.thaw();game.res.glut=70;`);await groundAt('{x:game.player.x+26,y:game.player.y+14}',['swing'],.14);await shot('schorsch-6-schwenkgrill-flug',await around(460,340));await read('__e72.step(.4)');await wait(250);await shot('schorsch-6b-schwenkgrill',await around(460,340));
  await read(`__e72.thaw();game.res.rost=[{item:'mais',done:.7,smoked:false}];game.res.glut=60;`);await freezeAt(`__e72.cast('burst')`,.45);await shot('schorsch-7-popcorn',await around(420,340));
  await read(`__e72.thaw();game.res.glut=88;`);await wait(500);await shot('schorsch-8-hitze',await around(260,220,10));
  await read(`__e72.thaw()`);/* Hauptbäume: Grillbuffet (Chef) und Räucherofen + geräuchertes Grillgut (Räuchermeister), Mechanik-Anzeige */
  await hero('schorsch','schorsch-chef');await read(`game.player.inCombat=7;game.res.glut=60;`);await groundAt('{x:game.player.x+30,y:game.player.y}',['buffet'],.45);await shot('schorsch-10-grillbuffet',await around(420,320));await read(`__e72.thaw()`);await wait(300);await shot('schorsch-10b-mechanik-buffet',await barClip());
  await hero('schorsch','schorsch-rauch');await read(`(()=>{game.player.inCombat=7;game.res.glut=30;__e72.cast('mark');__e72.cast('mark');game.res.rost.forEach((it,i)=>{it.done=[.5,.95][i];it.smoked=true;});})()`);await wait(500);await shot('schorsch-11-raeucherware-hud',await panelClip());
  await read(`game.res.glut=40;`);await groundAt('{x:game.player.x+22,y:game.player.y+16}',['oven'],1.2);await shot('schorsch-11b-raeucherofen',await around(420,320));await read(`__e72.thaw()`);
  await shot('schorsch-0-uebersicht');const tw=await talentWindow('schorsch');checks.push('schorsch: '+tw.vocab+' Talentbilder aus dem Symbolvokabular');checks.push('schorsch: Thermometer mit goldenem Bereich, Grillrost mit Garringen, Grillgut-Flug, Glutbrand, Stichflamme, Dampf, Schwenkgrill, Popcorn');},
 async kaethe(){await hero('kaethe','kaethe-herz');
  await read(`(()=>{game.player.inCombat=7;game.res.hand=[{suit:'herz',rank:'D'},{suit:'kreuz',rank:'10'},{suit:'karo',rank:'B'}];game.res.augen=48;game.res.chain={suit:'herz',n:1};})()`);await wait(450);
  let s=await hud();assert.equal(s.h.kind,'cards');await shot('kaethe-1-hud',await panelClip());await shot('kaethe-1b-hand',await barClip());
  const cards=await read(`[...document.querySelectorAll('.action-area [data-skill][data-card]')].map(b=>b.dataset.card)`);assert.ok(cards.length>=3,'Handkarten auf der Leiste: '+cards);{const r=await read(`(()=>{const bs=[...document.querySelectorAll('.action-area [data-skill][data-card]')].map(b=>b.getBoundingClientRect());const x=Math.min(...bs.map(r=>r.left)),y=Math.min(...bs.map(r=>r.top)),x2=Math.max(...bs.map(r=>r.right)),y2=Math.max(...bs.map(r=>r.bottom));return {x:Math.round(x-6),y:Math.round(y-6),width:Math.round(Math.min(x2-x+12,420)),height:Math.round(y2-y+12)};})()`);await shot('kaethe-1c-hand-zoom',{...r,scale:2});}
  await freezeAt(`__e72.cast('burst')`,.1);await shot('kaethe-2-wurf',await around(360,280));await read(`__e72.thaw()`);await freezeAt(`__e72.cast('burst')`,.3);await shot('kaethe-2b-farbausbruch',await around(360,280));
  // Stich: Gegner zaubert, Käthe hält dieselbe Farbe höher
  await read(`(()=>{__e72.thaw();const e=game.target;e.dummy=false;e.cast={name:'Wildes Grunzen',type:'roar',remaining:3,total:3,interruptible:true};__e72.m.res.resourceEnemyCast(game,e);const c=e.cast.card;game.res.hand=[{suit:c.suit,rank:'A'},{suit:'pik',rank:'7'},{suit:'herz',rank:'K'}];})()`);await wait(450);
  s=await hud();assert.ok(s.ui.enemyCard,'Gegnerkarte am Zauberbalken');const tc=await read(`(()=>{const b=document.querySelector('#targetPanel').getBoundingClientRect();return {x:Math.round(b.left-4),y:Math.round(b.top-4),width:Math.round(b.width+24),height:Math.round(b.height+12)};})()`);await shot('kaethe-3-gegnerkarte',tc);await shot('kaethe-3b-stich-leiste',await barClip());await shot('kaethe-3c-karte-welt',await around(320,260));
  await freezeAt(`__e72.cast('strike')`,.34);await shot('kaethe-4-stich',await around(320,280));
  await read(`(()=>{__e72.thaw();const e=game.target;e.cast=null;game.res.augen=95;game.res.discard.push(...Array.from({length:8},(_,i)=>({suit:['kreuz','pik','herz','karo'][i%4],rank:'8'})));})()`);await freezeAt(`__e72.cast('throw')`,.45);await shot('kaethe-5-abrechnen-strudel',await around(360,300));await read(`__e72.step(.55)`);await wait(200);await shot('kaethe-5b-abrechnen-explosion',await around(420,340));
  await read(`__e72.thaw();game.res.hand=[{suit:'herz',rank:'A'},{suit:'pik',rank:'D'},{suit:'karo',rank:'9'}];`);await groundAt('{x:game.target.x,y:game.target.y}',['card-burst'],.45);await shot('kaethe-6-legekreis',await around(460,340));
  await read(`__e72.thaw()`);await freezeAt(`__e72.cast('buff')`,.4);await shot('kaethe-7-mischen',await around(300,260));
  await read(`__e72.thaw()`);/* Grand-Spielerin: Buben-Anzeige, Abrechnen als Grand in Gold */
  await hero('kaethe','kaethe-grand');await read(`(()=>{game.player.inCombat=7;game.res.bubes=3;game.res.augen=66;})()`);await wait(500);await shot('kaethe-8-grand-mechanik',await barClip());
  await read(`game.res.bubes=4;`);await freezeAt(`__e72.cast('throw')`,.95);await shot('kaethe-8b-grand-abrechnen',await around(420,340));await read(`__e72.thaw()`);
  await shot('kaethe-0-uebersicht');const tw=await talentWindow('kaethe');checks.push('kaethe: '+tw.vocab+' Talentbilder aus dem Symbolvokabular');checks.push('kaethe: Skatblock mit Marken, Stapel, Farbkette, nächste Karte, Handkarten auf der Leiste, Gegnerkarte, Wurf, Stich, Abrechnen, Legekreis, Mischen');}
};

/** Volle Effektstufe (mit Grafikkarte): weiche Leuchthöfe und mehr Teilchen – im Prüfbrowser erzwungen. */
async function richPass(){if(only&&!only.includes('schorsch'))return;await read(`(async()=>{(await import('./resource-fx-art.js')).fxQuality.force=true;})()`);await hero('schorsch','schorsch-flamme');
 await read(`game.player.inCombat=7;game.res.glut=96;`);await freezeAt(`__e72.cast('strike')`,.3);await shot('voll-schorsch-stichflamme',await around(480,380));await read(`__e72.thaw();game.res.lock=0;game.res.glut=88;`);await wait(600);await shot('voll-schorsch-hitze',await around(260,220,10));
 await read(`game.res.glut=70;`);await freezeAt(`__e72.cast('heal')`,.45);await shot('voll-schorsch-dampf',await around(420,320));await read(`__e72.thaw()`);
 await read(`(async()=>{(await import('./resource-fx-art.js')).fxQuality.force=undefined;})()`);checks.push('volle Effektstufe: Stichflamme, Hitze, Dampf mit Leuchthöfen');}
const TOUCH={dieter:['dieter-wall',`game.player.inCombat=7;for(let i=0;i<5;i++)game.hitPlayer(game.target,game.player.maxHp*.06);game.player.energy=84;`],baerbel:['baerbel-care',`game.player.inCombat=7;game.player.energy=90;for(const id of ['strike','mark','throw'])__e72.cast(id);`],
 kevin:['kevin-iron',`game.player.inCombat=7;game.random=()=>.1;for(let i=0;i<5;i++)__e72.cast('strike');game.res.bons=2;__e72.cast('reload');__e72.freeze();__e72.step(1.2);`],schorsch:['schorsch-rauch',`game.player.inCombat=7;for(const id of ['mark','mark'])__e72.cast(id);game.res.rost.forEach((it,i)=>it.done=[.7,.3][i]);game.res.glut=40;`],kaethe:['kaethe-falsch',`game.player.inCombat=7;game.res.augen=72;game.res.sleeve={suit:'pik',rank:'A'};game.res.chain={suit:'kreuz',n:2};`]};
async function touchPass(){await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await wait(1200);
 for(const [cls,[spec,setup]] of Object.entries(TOUCH)){if(only&&!only.includes(cls))continue;await hero(cls,spec);await read(`(()=>{${setup}})()`);await wait(700);
  const r=await read(`(()=>{const t=document.querySelector('#resourceTray')?.getBoundingClientRect(),p=document.querySelector('.player-panel')?.getBoundingClientRect();return {touch:document.body.classList.contains('touch-mode'),tray:t?{x:t.left,y:t.top,w:t.width,h:t.height}:null,panel:p?{x:p.left,y:p.top,w:p.width,h:p.height}:null,W:innerWidth,H:innerHeight,scroll:document.documentElement.scrollWidth>innerWidth+1};})()`);
  assert.ok(r.touch,'Touch-Modus aktiv');assert.ok(r.tray&&r.tray.w>0,'Band sichtbar ('+cls+')');assert.ok(r.tray.x+r.tray.w<=r.W+1&&r.tray.y+r.tray.h<=r.H,'Band im Bild ('+cls+')');assert.ok(!r.scroll,'kein Querscrollen');
  await read(`document.querySelector('#toast')?.classList.remove('visible');document.querySelector('#toast')&&(document.querySelector('#toast').style.visibility='hidden')`);await wait(150);await shot('handy-'+cls);await read('__e72.thaw()');await shot('handy-'+cls+'-hud',{x:0,y:0,width:Math.min(r.W,Math.round(r.panel.w+40)),height:Math.round(r.tray.y+r.tray.h+10)});checks.push('handy quer '+cls+': Band '+Math.round(r.tray.w)+'×'+Math.round(r.tray.h)+' unter dem Spielerfenster');}
 /* Handy hochkant: Band darf Zielfenster und Buffs nicht verdecken */if(!only||only.includes('schorsch')){await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(1200);await hero('schorsch','schorsch-chef');await read(`(()=>{game.player.inCombat=7;__e72.cast('mark');__e72.cast('mark');})()`);await wait(700);
  const o=await read(`(()=>{const r=s=>{const e=document.querySelector(s);if(!e||e.classList.contains('hidden')||e.hidden)return null;const b=e.getBoundingClientRect();return b.width?b:null;};const t=r('#resourceTray'),g=r('#targetPanel');return {tray:!!t,overlap:!!(t&&g&&t.bottom>g.top&&t.top<g.bottom&&t.right>g.left&&t.left<g.right)};})()`);assert.ok(o.tray,'Band hochkant sichtbar');assert.ok(!o.overlap,'Band überdeckt das Zielfenster nicht (hochkant)');await shot('handy-hochkant-schorsch');checks.push('handy hochkant: Band unter dem Spielerfenster, Zielfenster rückt darunter');}
 await read(`document.querySelector('#toast')&&(document.querySelector('#toast').style.visibility='')`);await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});}

try{
 await b.resize(1440,1000);await boot();
 if(!touchOnly)for(const cls of Object.keys(CLASSES)){if(only&&!only.includes(cls))continue;await CLASSES[cls]();console.log('ok',cls);}
 await richPass();
 if(!noTouch)await touchPass();
 assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks,shots,errors:b.errors},null,1));console.log('PASS E-72 HUD/Effekte:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);console.error(JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{b.close();}
