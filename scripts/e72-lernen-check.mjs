// E-72 Runde 3 · „Lernen über das Bild“ (docs/e72-runde3/lernen.md): Käthe und Schorsch ohne Vorwissen spielbar.
// Prüft im echten Spiel: Wirkungssymbole und Tempo-Abzeichen auf Käthes Handkarten, Augen-Leiste mit Marken 61/90/120 und
// leuchtendem Abrechnen, Stich-Leuchten gegen einen Karten-Zauber samt Kettenrahmen, Hofprobe-Schritt „Karten auf den Tisch“
// mit drei Bild-Schritten, Schorschs Servieren-Leuchten nach Garstufe, markierte Glutzone und „als Nächstes auflegen“;
// dazu ein Blick auf Anni (Trend) und Dieter (Zeche). Eigener Server und Wegwerf-Browser (Ports per SERVER_PORT/CDP_PORT,
// Vorgabe 4281/9681). Screenshots (1600 × 900, JPEG, Nahaufnahmen vergrößert): docs/e72-runde3/lernen/.
// Aufruf: node scripts/e72-lernen-check.mjs [--no-touch]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde3/lernen';mkdirSync(dir,{recursive:true});
const noTouch=process.argv.includes('--no-touch');
const b=await browserSession({port:Number(process.env.CDP_PORT||9681),serverPort:Number(process.env.SERVER_PORT||4281)});
const read=s=>b.evaluate(s),checks=[],shots=[];
/** Ausschnitte in voller Schärfe (scale > 1 = Nahaufnahme); Vollbilder unverkleinert. */
const shot=async(name,clip)=>{const p=dir+'/'+name+'.jpg';if(!clip){const v=await read('({w:innerWidth,h:innerHeight})');clip={x:0,y:0,width:v.w,height:v.h,scale:1};}const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:84,clip:{scale:1,...clip}});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const rect=sel=>read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};})()`);
const clipOf=(r,pad=6,scale=2)=>({x:Math.max(0,Math.round(r.x-pad)),y:Math.max(0,Math.round(r.y-pad)),width:Math.round(r.w+pad*2),height:Math.round(r.h+pad*2),scale});
const zoom=async(name,sel,pad=6,scale=2)=>{const r=await rect(sel);assert.ok(r,'nicht gefunden: '+sel);return shot(name,clipOf(r,pad,scale));};
const panelClip=async(extra=78,scale=1.6)=>{const r=await rect('.player-panel');return {x:Math.max(0,Math.round(r.x-6)),y:Math.max(0,Math.round(r.y-6)),width:Math.round(r.w+12),height:Math.round(r.h+extra),scale};};
/** Die ersten Tasten der Leiste mit Luft nach oben (Abzeichen, Leuchten). */
const barClip=async(ids=['auto','strike','mark','burst','throw'],scale=2.4)=>{const r=await read(`(()=>{const bs=${JSON.stringify(ids)}.map(id=>document.querySelector('.action-area .action-bar [data-skill="'+id+'"]')).filter(Boolean).map(b=>b.getBoundingClientRect());const x=Math.min(...bs.map(r=>r.left)),y=Math.min(...bs.map(r=>r.top)),x2=Math.max(...bs.map(r=>r.right)),y2=Math.max(...bs.map(r=>r.bottom));return {x:Math.round(x-12),y:Math.round(y-14),width:Math.round(x2-x+24),height:Math.round(y2-y+26)};})()`);return {...r,scale};};
const targetClip=async(scale=1.8)=>{const r=await rect('#targetPanel');return {x:Math.max(0,Math.round(r.x-34)),y:Math.max(0,Math.round(r.y-6)),width:Math.round(r.w+44),height:Math.round(r.h+18),scale};};
/** Maus über ein Element (Mitte oder Anteil fx/fy), Tooltip-Text lesen. */
const hover=async(sel,fx=.5,fy=.5)=>{const r=await rect(sel);assert.ok(r,'Hover-Ziel fehlt: '+sel);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+r.w*fx,y:r.y+r.h*fy,pointerType:'mouse'});await wait(500);return read(`(()=>{const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText.replace(/\\s+/g,' '):null;})()`);};
const unhover=()=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:620,pointerType:'mouse'});

async function boot(){
 /* Käthe auf Stufe 1 mitten in der Hofprobe (Schritt „Karten auf den Tisch“); die übrigen Prüfungen heben sie danach auf Stufe 12 */const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:'kaethe',level:1,trainingXp:0,tutorial:{version:1,step:3,completed:false,hits:0,autos:0},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));caches?.keys?.().then(k=>k.forEach(n=>caches.delete(n)));}catch{}delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<800&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ok=false;for(let i=0;i<600&&!ok;i++){await wait(200);ok=await read(`(()=>{try{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game;}catch{return false}})()`).catch(()=>false);}
 assert.ok(ok,'Anmeldebildschirm überwunden');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());document.head.insertAdjacentHTML('beforeend','<style id=e72-notoast>#toast{visibility:hidden!important}.milestone{visibility:hidden!important}</style>');`);await wait(1500);
 await read(`(async()=>{const m={res:await import('./class-resources.js'),arena:await import('./arena.js'),tut:await import('./tutorial.js')};globalThis.__e72={m,freeze(){if(!game.__tick){game.__tick=game.tick;game.tick=()=>{};}},thaw(){if(game.__tick){game.tick=game.__tick;delete game.__tick;}},step(s,dt=1/60){const t=game.__tick||game.tick;for(let k=0;k<s;k+=dt)t.call(game,dt);},
  cast(id,point){game.gcd=0;game.cooldowns[id]=0;return game.action(id,point);}};return true;})()`);
}
/** Klasse wechseln, Stufe und Hauptbaum setzen, auf eine freie Wiese stellen, eine Übungspuppe davor. */
async function hero(cls,spec,level=12){
 const r=await read(`(()=>{const {arena}=__e72.m;__e72.thaw();game.dead=false;game.paused=false;game.classLocked=false;game.enemies=game.enemies.filter(e=>!e.arena&&!e.tutorial);game.target=null;game.resetClassState();game.attackers?.clear();Object.assign(game.player,game.world.spawn,{hp:game.player.maxHp,inCombat:0});const hero=game.hero;game.hero=null;const ok=game.enterAs(${JSON.stringify(cls)});game.hero=hero;
  arena.setArenaLevel(game,${level});game.rpg.talents.spec=${JSON.stringify(spec)};game.refreshStats();game.resetClassState();game.emit('rpgChanged');game.emit('classChanged');
  const s=game.world.spawn,W=game.world;let spot=null;for(let r=260;r<900&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(W.onRoad?.(x,y,70)||W.blocked(x,y,40)||W.nearby?.(x,y,90)?.length)continue;let ok=true;for(let dx=-80;dx<=80&&ok;dx+=20)for(let dy=-60;dy<=60&&ok;dy+=20)if(W.blocked(x+dx,y+dy,6)||W.onRoad?.(x+dx,y+dy,10))ok=false;if(ok)spot={x,y};}spot||={x:s.x-150,y:s.y+230};Object.assign(game.player,{x:spot.x,y:spot.y,hp:game.player.maxHp,vx:0,vy:0,moving:false});game.path=[];game.moveTo=null;
  const list=arena.spawnArena(game,{count:1,dummy:true});list.forEach(e=>Object.assign(e,{x:game.player.x+44,y:game.player.y+2}));game.target=list[0];game.player.direction='e';game.player.facing=1;
  document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return {ok,id:game.member.id,level:game.player.level,spec:game.rpg.talents.spec};})()`);
 assert.equal(r.id,cls,'Klasse gewechselt: '+cls);await wait(900);return r;
}
const hud=()=>read(`JSON.stringify({h:__e72.m.res.resourceHud(game),ui:globalThis.__mertlochResourceHud?.state()})`).then(JSON.parse);
/** Zustand der Leistenknöpfe 1–4: Karte, Variante, Überlagerung (Rahmen/Abzeichen), Leuchten. */
const slots=()=>read(`JSON.stringify(Object.fromEntries([...document.querySelectorAll('.action-area .action-bar [data-skill]')].filter(b=>['strike','mark','burst','throw'].includes(b.dataset.skill)).map(b=>[b.dataset.skill,{card:b.dataset.card||'',tone:b.dataset.variantTone||'',label:b.dataset.rhLabel||'',settle:b.dataset.rhSettle||'',serve:b.dataset.rhServe||'',teach:'rhTeach' in b.dataset,slot:b.querySelector('canvas.rh-slot')?.dataset.sig||'',shadow:getComputedStyle(b).boxShadow,labelShown:getComputedStyle(b,'::before').display!=='none'&&getComputedStyle(b,'::before').content!=='none'&&b.classList.contains('variant')}])))`).then(JSON.parse);

// ---------------------------------------------------------------------------------------------------------------
async function hofprobe(){
 // Käthe auf Stufe 1 in der Hofprobe, Schritt „Karten auf den Tisch“ (Papp-Horst im Visier)
 const r=await read(`(()=>{document.querySelectorAll('[data-window-close],[data-close]').forEach(b=>b.click());const e=game.enemies.find(x=>x.tutorial);game.target=e;Object.assign(game.player,{x:e.x-40,y:e.y+4});game.res.hand=[{suit:'kreuz',rank:'9'}];game.res.augen=0;game.emit('tutorialStep');return {level:game.player.level,step:game.tutorial.step,e:!!e,hand:game.res.hand.length};})()`);
 assert.equal(r.step,3,'Hofprobe Schritt 4 (Karten auf den Tisch)');assert.ok(r.e,'Papp-Horst da');checks.push('hofprobe: Käthe Stufe '+r.level+', Hand '+r.hand+' Karte');
 await wait(900);let s=await slots();assert.ok(s.strike.teach,'Kartentaste pulsiert in der Hofprobe');
 const g0=await read(`JSON.stringify([...document.querySelectorAll('.quest-panel .tut-guide .tg-step')].map(li=>({id:li.dataset.guideStep,cls:li.className,text:li.innerText.replace(/\\s+/g,' ')})))`).then(JSON.parse);
 assert.equal(g0.length,3,'drei Bild-Schritte in der Verfolgung: '+JSON.stringify(g0));assert.match(g0[0].cls,/is-now/);assert.match(g0[2].cls,/is-locked/,'Abrechnen vor Stufe 2 gesperrt');
 await shot('hofprobe-1-schritt1');await zoom('hofprobe-1b-verfolgung','.quest-panel',6,1.8);await shot('hofprobe-1c-kartentaste',await barClip(['auto','strike','mark','burst'],2.4));
 {const tip=await hover('.quest-panel .tg-step[data-guide-step=play]');assert.ok(tip&&/Klinge/.test(tip),'Tooltip Schritt 1: '+tip);checks.push('hofprobe Tooltip „'+tip+'“');await unhover();}
 // eine Karte spielen: Schritt 1 zählt, Augen laufen
 await read(`(()=>{__e72.cast('strike');})()`);await wait(900);
 const g1=await read(`JSON.stringify([...document.querySelectorAll('.quest-panel .tut-guide .tg-step')].map(li=>({id:li.dataset.guideStep,cls:li.className,text:li.innerText.replace(/\\s+/g,' ')})))`).then(JSON.parse);
 s=await slots();assert.ok(!s.strike.teach,'Puls endet nach der ersten Karte');assert.match(g1[1].cls,/is-now/,'Augen sammeln ist dran');assert.ok(/\d/.test(g1[1].text),'Augenstand im Schritt');
 await zoom('hofprobe-2-nach-erster-karte','.quest-panel',6,1.8);checks.push('hofprobe: '+g0.map(x=>x.text).join(' | ')+' → '+g1.map(x=>x.text).join(' | '));
 await read(`(()=>{game.tutorial.completed=true;game.enemies=game.enemies.filter(e=>!e.tutorial);game.emit('tutorialStep');})()`);await wait(300);
}

async function kaethe(){
 await hero('kaethe','kaethe-grand');
 // Hand: Kreuz-Zehn (stark), Pik-Acht (schnell), Karo-König (ohne Abzeichen)
 await read(`(()=>{game.player.inCombat=7;game.res.hand=[{suit:'kreuz',rank:'10'},{suit:'pik',rank:'8'},{suit:'karo',rank:'K'}];game.res.augen=34;game.res.chain={suit:null,n:0};})()`);await wait(800);
 let s=await slots();for(const id of ['strike','mark','burst'])assert.equal(s[id].label,'hide',id+': kein Wortschild');assert.ok(!s.strike.labelShown,'Variante ohne Text');
 await shot('kaethe-0-uebersicht');await shot('kaethe-1-hand-wirkung',await barClip());
 {const tip=await hover('.action-area .action-bar [data-skill=strike]');assert.ok(tip&&/Stark/.test(tip),'Tooltip nennt das Abzeichen: '+tip);checks.push('kaethe Karten-Tooltip „'+tip.slice(0,160)+'…“');await unhover();}
 // Herz-Bube (Trumpf) + Farbkette Herz: Kettenrahmen auf Herz und Bube
 await read(`(()=>{game.res.hand=[{suit:'herz',rank:'B'},{suit:'herz',rank:'7'},{suit:'karo',rank:'A'}];game.res.chain={suit:'herz',n:1};})()`);await wait(700);
 s=await slots();assert.ok(/"follow":true/.test(s.strike.slot)&&/"follow":true/.test(s.mark.slot),'Kettenrahmen auf Herz und Bube');assert.ok(/"follow":false/.test(s.burst.slot),'Karo ohne Kettenrahmen');
 await shot('kaethe-2-kettenrahmen',await barClip());checks.push('kaethe: Kettenrahmen auf Karten, die die Farbe bedienen (Herz, Bube), nicht auf Karo');
 // Augen-Leiste über 61, 90, 120: Abrechnen leuchtet stärker
 const lv=[];for(const [v,name] of [[72,'kaethe-3-augen-61'],[95,'kaethe-3b-augen-90'],[120,'kaethe-3c-augen-120']]){await read(`game.res.augen=${v}`);await wait(700);s=await slots();lv.push(s.throw.settle);await shot(name,await panelClip(70,1.6));await shot(name+'-abrechnen',await barClip(['burst','throw'],3));}
 assert.deepEqual(lv,['1','2','3'],'Abrechnen leuchtet ab 61, stärker ab 90 und 120');
 await read(`game.res.augen=72`);await wait(600);await zoom('kaethe-3d-augenleiste-zoom','.player-panel .bar.energy',4,3);
 {const tips={};for(const [k,fx] of [['win',61/120],['schneider',90/120],['schwarz',.972]]){const t=await hover('.player-panel .bar.energy',fx,.5);tips[k]=t;}assert.ok(/Gewonnen/i.test(tips.win)&&/Schneider/i.test(tips.schneider)&&/Schwarz/i.test(tips.schwarz),'Markennamen im Tooltip: '+JSON.stringify(tips));checks.push('kaethe Marken-Tooltips: '+Object.values(tips).join(' | '));await unhover();}
 // Stich: Gegner wirkt eine Karte; Kreuz-Ass und Bube stechen, Pik nicht; Farbkette Pik → Pik-Karte mit Kettenrahmen
 await read(`(()=>{const e=game.target;e.dummy=false;e.cast={name:'Wildes Grunzen',type:'roar',remaining:4,total:4,interruptible:true};__e72.m.res.resourceEnemyCast(game,e);e.cast.card={suit:'kreuz',rank:'9'};game.res.hand=[{suit:'kreuz',rank:'A'},{suit:'pik',rank:'D'},{suit:'karo',rank:'B'}];game.res.chain={suit:'pik',n:0};game.res.augen=40;__e72.freeze();})()`);await wait(900);
 s=await slots();const h=await hud();assert.ok(h.ui.enemyCard,'Gegnerkarte am Zauberbalken');
 assert.ok(/"stich":true/.test(s.strike.slot)&&/"stich":true/.test(s.burst.slot),'Kreuz-Ass und Bube tragen das Stich-Abzeichen');assert.ok(/"stich":false/.test(s.mark.slot)&&/"follow":true/.test(s.mark.slot),'Pik-Dame: kein Stich, aber Kettenrahmen');
 await shot('kaethe-4-stich-uebersicht');await shot('kaethe-4b-stich-leiste',await barClip());await shot('kaethe-4c-gegnerkarte',await targetClip());
 {const tip=await hover('.action-area .action-bar [data-skill=strike]');assert.ok(tip&&/sticht/.test(tip),'Stich im Tooltip: '+tip);await unhover();}
 await read(`(()=>{__e72.thaw();const e=game.target;e.cast=null;})()`);checks.push('kaethe: Stich-Abzeichen auf Kreuz-Ass und Bube gegen Kreuz-Neun, Gegnerkarte am Zauberbalken');
}

async function schorsch(){
 await hero('schorsch','schorsch-flamme');
 // ein gares Stück (Wurst 72 %) und ein rohes, Glut in der perfekten Zone
 await read(`(()=>{game.player.inCombat=7;game.res.rost=[{item:'wurst',done:.72,smoked:false},{item:'braten',done:.25,smoked:false}];game.res.plan=1;game.res.glut=70;})()`);await wait(900);
 let s=await slots(),h=await hud();assert.equal(s.burst.serve,'gar','Servieren leuchtet gar');assert.equal(s.burst.label,'hide','kein Wortschild „GAR“');assert.ok(/"art":"lay","item":"mais"/.test(s.mark.slot),'Auflegen zeigt Maiskolben als Nächstes: '+s.mark.slot);assert.equal(h.h.nextItem,'mais');
 await shot('schorsch-0-uebersicht');await shot('schorsch-1-servieren-gar',await barClip(['auto','strike','mark','burst','throw']));await shot('schorsch-1b-hud',await panelClip(96,1.6));await zoom('schorsch-1c-glutzone','.player-panel .bar.energy',4,3);
 {const tip=await hover('.action-area .action-bar [data-skill=mark]');assert.ok(tip&&/Als Nächstes: Maiskolben/.test(tip),'Auflegen-Tooltip: '+tip);checks.push('schorsch Auflegen-Tooltip „'+tip.slice(0,140)+'…“');await unhover();}
 {const r=await rect('.player-panel .bar.energy'),x0=Math.min(8,r.h/2)*2,fx=(x0+(r.w-x0)*.72)/r.w;const tip=await hover('.player-panel .bar.energy',fx,.5);assert.ok(tip&&/Perfekte Glut/i.test(tip),'Glutzone im Tooltip: '+tip);checks.push('schorsch Glutzone-Tooltip „'+tip+'“');await unhover();}
 // durch, verkohlt; Glut kalt (Zone leer, aber markiert)
 for(const [done,state,name] of [[1.02,'durch','schorsch-2-servieren-durch'],[1.28,'verkohlt','schorsch-2b-servieren-verkohlt']]){await read(`(()=>{game.res.rost=[{item:'braten',done:${done},smoked:false}];game.res.glut=40;})()`);await wait(700);s=await slots();assert.equal(s.burst.serve,state,'Servieren '+state);await shot(name,await barClip(['mark','burst'],3));}
 await zoom('schorsch-2c-glutzone-kalt','.player-panel .bar.energy',4,3);
 await read(`(()=>{game.res.rost=[];})()`);await wait(600);s=await slots();assert.equal(s.burst.serve,'','leerer Rost: kein Leuchten');await shot('schorsch-2d-rost-leer',await barClip(['mark','burst'],3));
 checks.push('schorsch: Servieren leuchtet gar golden, durch kupfern, verkohlt rauchig, leer gar nicht; Auflegen zeigt das nächste Grillgut; perfekte Glut schraffiert und geklammert');
}

async function anniDieter(){
 await hero('baerbel','baerbel-stage');
 await read(`(()=>{game.player.inCombat=7;game.player.energy=100;for(const id of ['strike','mark'])__e72.cast(id);})()`);await wait(600);
 await shot('anni-1-trend',await panelClip(70,1.6));await shot('anni-1b-leiste',await barClip());
 {const t=await hover('#resourceTray',.12,.5);assert.ok(t&&/Hebt: neuer Kniff/.test(t),'Trend-Tooltip nennt, was ihn hebt und bricht: '+t);checks.push('anni Trend-Tooltip „'+t+'“');}await unhover();
 await hero('dieter','dieter-brawl');
 await read(`(()=>{const e=game.target;game.player.inCombat=7;for(let i=0;i<5;i++)game.hitPlayer(e,game.player.maxHp*.06);game.player.energy=60;})()`);await wait(600);
 await shot('dieter-1-zeche',await panelClip(70,1.6));{const t=await hover('#resourceTray',.1,.5);checks.push('dieter Zechen-Tooltip „'+t+'“');}await unhover();
}

async function touchPass(){
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await wait(1200);
 await hero('kaethe','kaethe-grand');await read(`(()=>{game.player.inCombat=7;game.res.hand=[{suit:'kreuz',rank:'10'},{suit:'herz',rank:'8'},{suit:'herz',rank:'B'}];game.res.chain={suit:'herz',n:1};game.res.augen=92;})()`);await wait(900);
 const t=await read(`JSON.stringify([...document.querySelectorAll('#touchActions .touch-skill[data-skill]')].filter(b=>['strike','mark','burst','throw'].includes(b.dataset.skill)).map(b=>({id:b.dataset.skill,slot:!!b.querySelector('canvas.rh-slot'),settle:b.dataset.rhSettle||''})))`).then(JSON.parse);
 assert.ok(t.some(x=>x.slot),'Handyknöpfe tragen die Überlagerung: '+JSON.stringify(t));await shot('handy-kaethe');checks.push('handy: '+JSON.stringify(t));
 /* Handy-Hofprobe: die kompakte Leiste oben zeigt dieselben Bild-Schritte */
 await read(`(()=>{const {tut}=__e72.m;game.player.inCombat=0;game.enemies=game.enemies.filter(e=>!e.arena);tut.initTutorial(game,{version:1,tutorial:{version:1,step:3,completed:false,hits:0,autos:0}},true);const e=game.enemies.find(x=>x.tutorial);game.target=e;game.res.augen=0;game.emit('tutorialStep');})()`);await wait(1200);
 {const n=await read(`document.querySelectorAll('#tutorialGuide:not([hidden]) .tut-guide .tg-step').length`);assert.equal(n,3,'Handy-Hofprobe zeigt drei Bild-Schritte');await shot('handy-hofprobe');const r=await rect('#tutorialGuide');if(r)await shot('handy-hofprobe-zoom',clipOf(r,4,2));checks.push('handy hofprobe: drei Bild-Schritte in der kompakten Leiste');}
 await read(`(()=>{game.tutorial.completed=true;game.enemies=game.enemies.filter(e=>!e.tutorial);game.emit('tutorialStep');})()`);
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.send('Emulation.clearDeviceMetricsOverride');await b.resize(1600,900);await wait(800);
}

try{
 await b.resize(1600,900);await boot();
 await hofprobe();console.log('ok hofprobe');
 await kaethe();console.log('ok kaethe');
 await schorsch();console.log('ok schorsch');
 await anniDieter();console.log('ok anni/dieter');
 if(!noTouch){await touchPass();console.log('ok handy');}
 assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks,shots,errors:b.errors},null,1));console.log('PASS E-72 Lernen:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);console.error(JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{b.close();}
