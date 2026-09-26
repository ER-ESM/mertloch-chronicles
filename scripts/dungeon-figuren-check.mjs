// Browserprüfung Dungeon-Figuren (live seit 2026-09-26, standardmäßig an): eigene Figuren statt Platzhalter, Bosse kündigen ihre Mechanik
// mit Sonderposen an; Notschalter (localStorage '0') → alles wie bisher (keine Figurenbögen geladen).
// Aufruf: CDP_PORT=9730 SERVER_PORT=4530 node scripts/dungeon-figuren-check.mjs   (ONLY=1,2,3,4 einzelne Teile)
// Bilder: visual-review/dungeon-figuren/szene-*.jpg (lokal, nicht im Repo); Galerie: D:\Dev\_prototypen\dungeon-figuren-2026-09-26.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir=process.env.OUT||'visual-review/dungeon-figuren';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const FLAG='localStorage.setItem("mertloch-dungeon-figuren","1");',OFF='localStorage.setItem("mertloch-dungeon-figuren","0");';// Standard ist an; OFF = Notschalter
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
const s=await session({port:9730,serverPort:4530});
// Teil 0: ohne jede Angabe im Speicher sind die Figuren an (Standard)
if(want(0)){await s.start({w:2024,h:900});await s.read(`window.DF=await import('/dungeon-figuren-art.js');return 1`);assert.equal(await s.read(`return DF.dungeonFigurenAn()`),true,'Standard: an');console.log('PASS Standard: Figuren an ohne Schalter');}const {b,read,start}=s;
const ok=t=>console.log('PASS '+t);
const setup=()=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;g.player.hp=g.player.maxHp;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/auto-combat.js');window.PD=await import('/paperdoll-art.js');window.DF=await import('/dungeon-figuren-art.js');
 for(const id of ${MERCS})g.hireCompanion(id,{free:true});g.adminGod=true;D.spawnRareBoss(g,'halbespferd');return g.instance?.kind;`);
const place=(floor,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}return 1;`);
const B=id=>`g.enemies.find(e=>e.bossId==='${id}')`;
/** Bildschirmlage eines Weltpunkts (wie r5b-lib hero). */
const screenOf=js=>read(`const u=${js};const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect(),k=r.width/v.width;return {x:(u.x-v.camera.x+v.width/2)*k+r.left,y:(u.y-v.camera.y+v.height/2)/v.height*r.height+r.top,k};`);
/** Ausschnitt um einen Weltpunkt (Breite/Höhe in px am Bildschirm), zweifach vergrößert. */
async function crop(name,js,w=420,h=320,dy=-70){const p=await screenOf(js);const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x:Math.max(0,p.x-w/2),y:Math.max(0,p.y+dy-h/2),width:w,height:h,scale:2}});
 const {writeFileSync}=await import('node:fs');writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));}
const shot=n=>b.screenshot(dir+'/'+n+'.jpg');
const pause=async(on=true)=>{await read(`g.paused=${on};return 1`);if(on)await wait(700);};
/** Kampf vorspulen: Boss in den Kampf, Söldner und Held auf ihn; bis die Bedingung gilt (JS-Ausdruck über b = Boss). */
const fight=(id,seconds,stop)=>read(`const b=${B(id)};if(!b)return -1;b.aggro=true;b.ai='combat';g.target=b;A.startAuto(g);let t=0;for(;t<${seconds};t+=.05){g.player.hp=g.player.maxHp;for(const c of g.companions){c.hp=c.maxHp;if(c.state==='down')c.state='fight';}g.tick(.05);if((()=>{${stop}})())break;}return Math.round(t*10)/10;`);
/** Warten, bis die Figurenbögen der sichtbaren Gegner geladen sind (Puppe bereit, keine offenen Bögen mehr). */
const settleSheets=async()=>{for(let i=0;i<40;i++){const n=await read(`return PD.paperdoll.ready?PD.paperdoll.images.size:-1`);await wait(300);const m=await read(`return PD.paperdoll.images.size`);if(n>0&&n===m&&i>4)return m;}return -1;};
try{
 // ───────────── 1 · Schalter an: Burghof mit Trash (Azubis, Baumarkt-Ritter, Pappwache)
 if(want(1)){await start({w:2024,h:900,extra:FLAG});assert.equal(await setup(),'dungeon');
  assert.equal(await read(`return DF.dungeonFigurenAn()`),true,'Schalter wirkt');
  await place('e0',24,30);await read(`const h=g.enemies.filter(e=>e.dungeonKind&&e.hp>0&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<200);for(const e of h){e.direction='se';}return h.length`);
  await settleSheets();await wait(800);await shot('szene-1-hof');await crop('szene-1-hof-nah',`(()=>{const h=g.enemies.filter(e=>e.dungeonKind&&e.hp>0&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<200);return {x:h.reduce((a,e)=>a+e.x,0)/h.length,y:h.reduce((a,e)=>a+e.y,0)/h.length};})()`,560,300,-30);
  const loaded=await read(`return [...PD.paperdoll.images.keys()].filter(k=>/^(securitypolo|regenrinnenpanzer|eimerhelm|motiv-pappwache)/.test(k))`);assert.ok(loaded.length>=3,'Figurenbögen geladen: '+loaded.join(','));ok('Schalter an: Hof mit eigenen Figuren ('+loaded.length+' Bögen)');
  // Verwaltung (Makler-Praktikant + Azubis) und Wehrgang (Pappschützen)
  await place('e0',55,30);await settleSheets();await wait(600);await crop('szene-2-verwaltung','g.player',620,320,-40);
  await place('e0',29,13);await settleSheets();await wait(600);await crop('szene-3-wehrgang','g.player',620,320,-50);
  await place('k2',19,15);await settleSheets();await wait(600);await crop('szene-4-weinkeller','g.player',620,320,-40);
  const gh=await read(`const e=g.enemies.find(e=>e.dungeonKind==='schlossgespenst'&&e.hp>0);if(!e)return null;g.player.x=e.x;g.player.y=e.y+50;return {x:e.x,y:e.y}`);if(gh){await settleSheets();await wait(600);await crop('szene-5-gespenst','g.player',520,320,-60);}
  ok('Trash-Szenen: Verwaltung, Wehrgang, Weinkeller');}
 // ───────────── 2 · Bosse im Kampf: Ansagen als Sonderposen. Der gewünschte Zauber wird über den echten Zauberweg gestartet (g.startCast mit
 // passender Stelle im Zyklus), die Welt läuft bis zum gewünschten Anteil der Zauberzeit weiter; Söldner stehen abseits (sie würden unterbrechen).
 if(want(2)){if(!want(1)){await start({w:2024,h:900,extra:FLAG});await setup();}
  await read(`window.C=await import('/content/index.js');return 1`);
  const stage=(id,set,type,frac,extra='')=>read(`const b=${B(id)};if(!b)return 'kein Boss';g.paused=false;b.aggro=true;b.ai='combat';b.moving=false;${extra}
   if('${set}')b.castSet='${set}';const cs=C.DUNGEON_CASTS[b.castSet],i=cs.cycle.indexOf('${type}');if(i<0)return 'nicht im Zyklus';b.cycle=i;b.cast=null;g.startCast(b);
   window.__mates=window.__mates||g.companions;g.companions=[];let t=0;const away=()=>{};// Söldner raus (sie würden unterbrechen und den Boss verdecken)
   for(;t<6;t+=.05){away();g.player.hp=g.player.maxHp;g.tick(.05);const k=b.cast;if(${frac}<0?!k:(!k||k.total-k.remaining>=k.total*${frac}))break;}
   b.hurt=0;g.player.hurt=0;g.paused=true;/* Söldner aus dem Bild (sie verdeckten den Boss) */return b.cast?b.cast.type+' '+Math.round((1-b.cast.remaining/b.cast.total)*100)+' %':'nach dem Zauber';`);
  const shotBoss=async(id,name)=>{await wait(500);await settleSheets();await wait(300);await crop('boss-'+id+'-'+name,B(id),440,340,-70);};
  const run=async(id,where,list)=>{await read(`g.paused=false;if(window.__mates){g.companions=window.__mates;window.__mates=null;}return 1`);await place(...where);await read(`const b=${B(id)};g.target=b;return 1`);await settleSheets();
   for(const [name,set,type,frac,extra] of list){const r=await stage(id,set,type,frac,extra);assert.ok(!/kein|nicht/.test(r),id+' '+name+': '+r);await shotBoss(id,name);ok(id+': '+name+' ('+r+')');}};
  await run('gerd',['e0',9,36],[['stand','','liste',-1,'b.hp=b.maxHp;'],['liste','','liste',.5],['rausschmiss','','rausschmiss',.6],['schubser','','rausschmiss',-1],['dresscode','','dresscode',.75]]);
  await run('expose',['k1',32,46.5],[['forderung','','forderung',.5],['verkauft','','verkauft',.4],['notar','d-expose3','notar',.5]]);
  await run('korkenkurt',['k2',23,32],[['runde','','runde',.5],['fass','','fass',.6],['fass-rollt','','fass',-1]]);
  await run('rita',['k1',60,23.5],[['blitz','','blitz',.5],['story','','story',.5]]);
  await run('halbespferd',['k1',26,4.4],[['huftritt','','huftritt',.6],['tritt','','huftritt',-1],['wiehern','','wiehern',.5]]);
  await read(`const b=${B('halbespferd')};b.cast=null;b.drinking=true;g.paused=true;return 1`);await shotBoss('halbespferd','saufen');ok('halbespferd: saufen');await read(`${B('halbespferd')}.drinking=false;return 1`);
  await run('bigb',['k2',54,19],[['behauptung','','kanone',.2],['nachsatz','','kanone',.6],['anwalt','','anwalt',.5],['live','d-bigb2','live',.5],['schopf','d-bigb3','schopf',.5]]);
  await read(`const b=${B('bigb')};b.cast=null;b.hp=b.maxHp*.14;b.confessed=true;g.paused=false;for(let t=0;t<.3;t+=.05)g.tick(.05);g.paused=true;return 1`);await shotBoss('bigb','gestaendnis');ok('bigb: Geständnis');
 }
 // ───────────── 3 · Schalter aus: alles wie bisher
 if(want(3)){await start({w:2024,h:900,extra:OFF});assert.equal(await setup(),'dungeon');assert.equal(await read(`return DF.dungeonFigurenAn()`),false,'Schalter aus');
  await place('e0',24,30);await wait(3000);await shot('szene-0-hof-ohne-schalter');await crop('szene-0-hof-ohne-schalter-nah',`(()=>{const h=g.enemies.filter(e=>e.dungeonKind&&e.hp>0&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<200);return {x:h.reduce((a,e)=>a+e.x,0)/h.length,y:h.reduce((a,e)=>a+e.y,0)/h.length};})()`,560,300,-30);
  const loaded=await read(`return [...PD.paperdoll.images.keys()].filter(k=>/^(securitypolo|securityanzug|regenrinnenpanzer|eimerhelm|motiv-)/.test(k))`);assert.equal(loaded.length,0,'ohne Schalter keine Figurenbögen: '+loaded.join(','));
  ok('Schalter aus: Platzhalter wie bisher, keine Figurenbögen geladen');}
 // ───────────── 4/5 · Vergleich „heute ↔ Entwurf“: dieselbe Aufstellung mit Schalter (4) und ohne (5) – Trash in einer Reihe im Burghof,
 // jeder Boss allein an seinem Platz. Summons (Follower, Interessent, Kommentator) sind Kopien eines Trash-Gegners mit Art und Platzhalter
 // der jeweiligen Gegnerart (nur zum Ansehen, sie kämpfen nicht).
 for(const [part,flag] of [[4,true],[5,false]]){if(!want(part))continue;const tag=flag?'entwurf':'heute';
  await start({w:2024,h:900,extra:flag?FLAG:OFF});assert.equal(await setup(),'dungeon');await read(`window.C=await import('/content/index.js');return 1`);
  const kinds=['securityazubi','maklerpraktikant','baumarktritter','pappwache','pappschuetze','kellerratte','schlossgespenst','follower','interessent','kommentator'];
  await place('e0',31,36);
  await read(`const run=g.dungeonRun,tpl=g.enemies.find(e=>e.dungeonKind==='securityazubi'),mk=(kind,i)=>{const d=C.DUNGEON_ENEMIES[kind];let e=g.enemies.find(o=>o.dungeonKind===kind&&o.hp>0&&!o.lineup);
    if(!e){e=Object.assign(Object.create(Object.getPrototypeOf(tpl)),tpl,{id:990000+i,dungeonKind:kind,name:d.name,type:d.type,skin:d.skin,variant:d.art,elite:!!d.elite,cardboard:!!d.cardboard,pack:null,castSet:d.castSet,baseCastSet:d.castSet});g.enemies.push(e);}
    const q=D.toWorld(run.def,'e0',19.5+i*2.5,29+(i%2)*1.2);Object.assign(e,{x:q.x,y:q.y,lineup:true,aggro:false,ai:'idle',cast:null,moving:false,hurt:0,attack:0,direction:'se',facing:1,hp:e.maxHp,roamRadius:0,roamTarget:null});return e;};
   ${JSON.stringify(kinds)}.forEach(mk);for(const e of g.enemies)if(!e.lineup&&!e.dungeonBoss&&e.hp>0&&D.floorAt(run.def,e.x,e.y)==='e0'){e.hp=0;e.ai='dead';e.respawnAt=Infinity;e.corpseAt=-99;}
   for(const c of g.companions){c.x=g.player.x-500;c.y=g.player.y;}g.paused=true;return 1`);
  await wait(800);if(flag)await settleSheets();await wait(1200);
  await crop('vergleich-'+tag+'-trash',`D.toWorld(g.dungeonRun.def,'e0',31,29.6)`,760,260,-34);ok(tag+': Trash-Reihe');
  for(const [id,where] of [['gerd',['e0',8.5,35]],['expose',['k1',32,47]],['korkenkurt',['k2',23,32]],['rita',['k1',60,24]],['halbespferd',['k1',28,4.6]],['bigb',['k2',54,17]]]){
   await read(`g.paused=false;return 1`);await place(...where);await wait(3400);// Kamera folgt dem Helden nur, solange die Welt läuft; Raumtitel ausblenden lassen
   await read(`const b=${B(id)},run=g.dungeonRun,bd=run.def.bosses.find(x=>x.id==='${id}'),q=D.toWorld(run.def,D.floorAt(run.def,b.x,b.y),...bd.at);Object.assign(b,{x:q.x,y:q.y,aggro:false,ai:'idle',cast:null,moving:false,hurt:0,direction:'se',facing:1,drinking:false,hidden:false});for(const c of g.companions){c.x=g.player.x-500;c.y=g.player.y;}g.paused=true;return 1`);
   await wait(600);if(flag)await settleSheets();await wait(900);await crop('vergleich-'+tag+'-'+id,B(id),300,260,-50);}
  ok(tag+': Bosse einzeln');}
 // ───────────── 6 · Leistung: Bildzeiten im Weinkeller (16 Ratten + Trash) und im Burghof, Schalter an und aus (Server ohne Grafikkarte)
 for(const [part,flag] of [[6,true],[7,false]]){if(!want(part))continue;const tag=flag?'an':'aus';
  await start({w:2024,h:900,extra:flag?FLAG:OFF});assert.equal(await setup(),'dungeon');
  const messe=async(where)=>{await read(`g.paused=false;return 1`);await place(...where);await read(`g.player.inCombat=0;for(const e of g.enemies)if(e.dungeon&&!e.dungeonBoss){e.aggro=false;e.ai='idle';}return 1`);await wait(4000);
   return read(`const d=[];let last=performance.now();const t0=last;await new Promise(r=>{const f=now=>{d.push(now-last);last=now;if(now-t0<5000)requestAnimationFrame(f);else r();};requestAnimationFrame(f);});
    d.sort((a,b)=>a-b);const q=x=>Math.round(d[Math.floor(d.length*x)]*10)/10;return {bilder:d.length,median:q(.5),p90:q(.9),max:Math.round(d[d.length-1]),fps:Math.round(d.length/5),puppe:{...PD.paperdoll.stats}};`);};
  const keller=await messe(['k2',19,15]),hof=await messe(['e0',31,34]);
  console.log('LEISTUNG Schalter '+tag+' Weinkeller '+JSON.stringify(keller));console.log('LEISTUNG Schalter '+tag+' Burghof '+JSON.stringify(hof));ok('Leistung gemessen ('+tag+')');}
}finally{s.b.close();}
