// Prüfskript „Räume des Dungeons wie echte Orte“ (Schloss Big B, Bericht docs/DUNGEON-RAEUME-2026-09-25.md).
// Teile (ONLY=1,2,…):
//  1 Räume: Aufnahme jedes der 15 Räume (Desktop 2024×900), dazu Held an der Nordwand des Hofs
//  2 Eingang in der Welt: Garage aus der Nähe und aus 400 px, keine Baumkrone über der Garage
//  3 Handy (quer 844×390): je Ebene eine Aufnahme
//  4 Geheimnisse: Wehrgang und Pappwand vor der Entdeckung wie normale Wand/Mauer (Pixelvergleich der Bodenebene)
//  5 Wege und Requisiten: Wegsuche durch alle Räume, Requisiten nicht auf Laufwegen, Arenen, Packs, Übergängen, Truhenplatz
//  6 Bildzeit: Bildabstand und Zeichenzeit je Ebene bei Dichte 2, 3 und 4 (kopfloses Chrome ohne Grafikkarte)
// Aufruf: node scripts/dungeon-raeume-check.mjs   (CDP 9630, Server 4430; CDP_PORT/SERVER_PORT, BOOT_TRIES, TAG=vorher|nachher)
// Bilder: visual-review/dungeon-raeume/<TAG>/*.jpg (lokal, nicht im Repo)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const TAG=process.env.TAG||'nachher',before=TAG==='vorher',dir='visual-review/dungeon-raeume/'+TAG;mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean);const want=n=>!only.length||only.includes(String(n));
const s=await session({port:9630,serverPort:4430});const {b,read,start,settle}=s;
const results=[],shot=name=>b.screenshot(dir+'/'+name+'.jpg');
/** Ausschnitt um die Bildmitte (Held), zweifach vergrößert. */
const crop=async(name,w=760,h=360,dy=-40)=>{const vw=await read('return innerWidth'),vh=await read('return innerHeight');const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:90,clip:{x:Math.round((vw-w)/2),y:Math.round((vh-h)/2+dy),width:w,height:h,scale:2}});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));};
const pass=(n,text)=>{results.push({n,text});console.log('PASS '+n+' · '+text);};
const note=(n,text)=>{results.push({n,note:text});console.log('INFO '+n+' · '+text);};
// Räume in Kartenreihenfolge; Standpunkt in Metern der Ebene (Mitte des Raums, bei Ringen/Gängen ein typischer Punkt).
const ROOMS=[['e0','hof',31,30],['e0','zugbruecke',8.5,27],['e0','verwaltung',55,29],['e0','wehrgang',31,11],
 ['k1','galerie',30,8],['k1','rittersaal',32,22],['k1','stall',28,3],['k1','verlies',3.5,22],['k1','studio',60.5,19],['k1','musterwohnung',32,43.5],
 ['k2','weinkeller',18,11],['k2','gewoelbe',38,30],['k2','kelterhalle',23,28],['k2','thronsaal',54,20],['k2','schatz',54,42]];
/** In den Dungeon, alle Räume erkundet (Aufnahmen zeigen die Wirklichkeit), Gegner friedlich, kein Kampf. */
const inside=({visited=true}={})=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;if(!g.instance)g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');
 const r=g.dungeonRun;${visited?"for(const room of r.def.rooms)r.visited.add(room.id);":''}for(const e of g.enemies){e.aggro=false;e.aggroRange=0;e.ai=e.hp>0?'idle':e.ai;}g.adminGod=true;g.hover=null;return g.instance?.kind`);
const place=(f,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${f}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];g.target=null;g.hover=null;for(const e of g.enemies){e.aggro=false;e.aggroRange=0;}return 1`);
try{
 // ─────────────────────────────────────────────── 1 · Räume
 if(want(1)){
  await start({w:2024,h:900});await inside();
  for(const [i,[f,id,x,y]] of ROOMS.entries()){await place(f,x,y);await wait(700);await settle();await wait(300);
   const r=await read(`return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id||null`);assert.equal(r,id,'Standpunkt liegt in '+id);
   await shot('d-'+String(i+1).padStart(2,'0')+'-'+f+'-'+id);await crop('c-'+String(i+1).padStart(2,'0')+'-'+id);}
  // Held an der Nordwand des Hofs: ragt er in die Leere?
  await place('e0',24,20.7);await wait(700);await settle();await shot('d-20-hof-nordwand');await crop('c-20-hof-nordwand',600,300,-60);
  pass(1,'15 Räume aufgenommen ('+TAG+')');
 }
 // ─────────────────────────────────────────────── 2 · Eingang in der Welt
 if(want(2)){
  await start({w:2024,h:900});
  const toDoor=dy=>read(`const m=await import('/dungeon.js');const d=m.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+${dy}});g.player.inCombat=0;g.moveTo=null;return {x:Math.round(d.x),y:Math.round(d.y)};`);
  const door=await toDoor(70);await wait(900);await settle();await shot('e-01-eingang-nah');await crop('e-03-garage-nah',760,380,-150);
  await toDoor(165);await wait(900);await settle();await shot('e-02-eingang-weit');
  // Baumkronen über der Garage (Bildrechteck der Garage gegen Kronenrechteck der Bäume, wie renderer.js sie zeichnet)
  const over=await read(`const m=await import('/dungeon.js'),d=m.dungeonEntrance(g);let box={l:d.x-24,r:d.x+24,t:d.y-46,b:d.y};try{const a=await import('/dungeon-scenery-art.js');box=a.garageScreenBox?.(d)||box;}catch{}
   return g.world.trees.filter(t=>{const s=t.size||1,l=t.x-44*s,r=t.x+44*s,top=t.y-96*s,bot=t.y+14*s;return t.y>box.t-20&&l<box.r&&r>box.l&&top<box.b&&bot>box.t;}).map(t=>({x:Math.round(t.x),y:Math.round(t.y)}))`);
  if(before)note(2,'Eingang '+JSON.stringify(door)+': '+over.length+' Baumkronen über dem Rolltor');
  else{assert.deepEqual(over,[],'keine Baumkrone über der Garage');pass(2,'Eingang '+JSON.stringify(door)+': Garage frei von Baumkronen');}
 }
 // ─────────────────────────────────────────────── 3 · Handy quer, je Ebene
 if(want(3)){
  await start({touch:true,w:844,h:390,safe:true});await inside();
  for(const [f,id,x,y] of [['e0','hof',31,30],['k1','rittersaal',32,22],['k2','weinkeller',18,11]]){await place(f,x,y);await wait(800);await settle();await shot('h-'+f+'-'+id);}
  await start({touch:true,w:390,h:844,safe:true});await inside();
  for(const [f,id,x,y] of [['k1','galerie',30,8],['k2','thronsaal',54,20]]){await place(f,x,y);await wait(800);await settle();await shot('v-'+f+'-'+id);}
  pass(3,'Handy quer: drei Ebenen, hoch: Galerie und Thronsaal aufgenommen');
 }
 // ─────────────────────────────────────────────── 4 · Geheimnisse
 if(want(4)&&!before){
  await start({w:2024,h:900});await inside({visited:false});
  const res=await read(`const A=await import('/dungeon-scenery-art.js');return await A.secretAudit(g)`);
  assert.equal(res.wehrgang.diff,0,'Wehrgang vor der Entdeckung pixelgleich mit „kein Raum“ ('+res.wehrgang.diff+' Pixel)');
  assert.ok(res.pappwand.faceLike,'Pappwand vor dem Fund wie die Wandfront der Galerie ('+JSON.stringify(res.pappwand)+')');
  await place('k1',12,34.5);await wait(700);await settle();await shot('g-01-pappwand-vorher');
  await read(`D.dungeonSecret?.(g,'pappwand');g.dungeonRun.secrets.add('pappwand');g.dungeonRun.version++;return 1`);await wait(500);await shot('g-02-pappwand-gefunden');
  await place('e0',31,23);await read(`g.dungeonRun.visited.delete('wehrgang');return 1`);await wait(700);await settle();await shot('g-03-hof-wehrgang-verborgen');
  await read(`g.dungeonRun.visited.add('wehrgang');return 1`);await wait(500);await shot('g-04-hof-wehrgang-entdeckt');
  pass(4,'Geheimnisse: Wehrgang pixelgleich mit Mauerwerk, Pappwand wie Wandfront');
 }
 // ─────────────────────────────────────────────── 5 · Wege und Requisiten
 if(want(5)&&!before){
  await start({w:1600,h:900});await inside({visited:false});
  const res=await read(`const S=await import('/dungeon-scenery.js');return S.auditScenery(g)`);
  console.log(JSON.stringify(res.summary));
  assert.deepEqual(res.unreachable,[],'jeder Raum und jeder Übergang über die Wegsuche erreichbar');
  assert.deepEqual(res.problems,[],'Requisiten frei von Laufwegen, Arenen, Packs, Übergängen, Türen und Truhenplatz');
  for(const [room,n] of Object.entries(res.summary.kinds))assert.ok(n>=3&&n<=8,room+': 3–8 Requisiten-Arten ('+n+')');
  pass(5,'Wegsuche: '+res.summary.paths+' Wege frei, '+res.summary.total+' Requisiten ohne Konflikt, je Raum '+Object.entries(res.summary.kinds).map(([k,v])=>k+' '+v).join(', ')+' Arten');
 }
 // ─────────────────────────────────────────────── 6 · Bildzeit
 // AB_URL=http://localhost:<port>/ misst abwechselnd gegen einen zweiten Stand (z. B. origin/main) unter derselben Rechnerlast:
 // je Messung wird die andere Seite eingefroren (Page.setWebLifecycleState), damit sie keine Bilder rechnet.
 if(want(6)){
  const out=[],sB=process.env.AB_URL?await session({port:9636,url:process.env.AB_URL}):null,sides=[['nachher',s],...(sB?[['vorher',sB]]:[])];
  const freeze=(x,on)=>x.b.send('Page.setWebLifecycleState',{state:on?'frozen':'active'}).catch(()=>{});
  const measure=(x,f)=>x.read(`const R=globalThis.__mertloch.renderer,orig=R.draw.bind(R),draws=[],gaps=[];R.draw=(...a)=>{const t=performance.now();const v=orig(...a);draws.push(performance.now()-t);return v;};
     let last=0,stop=false;const loop=t=>{if(last)gaps.push(t-last);last=t;if(!stop)requestAnimationFrame(loop);};requestAnimationFrame(loop);
     const p=g.player,x0=p.x;const t0=performance.now();while(performance.now()-t0<3200){const k=(performance.now()-t0)/3200;p.x=x0+Math.sin(k*Math.PI*2)*${f==='welt'?0:60};await new Promise(r=>setTimeout(r,30));}
     stop=true;R.draw=orig;p.x=x0;const q=(a,f)=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return +s[Math.min(s.length-1,Math.floor(s.length*f))].toFixed(1);};
     let st={};try{st=(await import('/dungeon-scenery-art.js')).sceneryStats;}catch{}return {build:st.lastBuildMs,layerMpx:st.layerPx?+(st.layerPx/1e6).toFixed(1):undefined,density:R.density,frames:gaps.length,gapMedian:q(gaps,.5),gapP90:q(gaps,.9),drawMedian:q(draws,.5),drawP90:q(draws,.9),drawMax:draws.length?+Math.max(...draws).toFixed(1):null}`);
  const go=async(x,f,px,py)=>{if(f==='welt'){await x.read(`const m=await import('/dungeon.js');if(g.instance)g.leaveDungeon({force:true});const d=m.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+${py}});g.player.inCombat=0;return 1`);return 5000;}
   await x.read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;if(!g.instance)g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');const r=g.dungeonRun;for(const room of r.def.rooms)r.visited.add(room.id);for(const e of g.enemies){e.aggro=false;e.aggroRange=0;}g.adminGod=true;Object.assign(g.player,D.toWorld(r.def,'${f}',${px},${py}));g.moveTo=null;g.path=[];g.target=null;return 1`);return 1500;};
  for(const [dens,settings] of [[2,{lowRes:true,fullRes:false}],[3,{lowRes:false,fullRes:false,autoRes:false}],[4,{lowRes:false,fullRes:true}]].filter(([d])=>!process.env.DENS||process.env.DENS.split(',').includes(String(d)))){
   for(const [,x] of sides){await x.start({w:2024,h:900});await x.read(`Object.assign(g.settings,${JSON.stringify(settings)});g.settings.light=true;globalThis.__mertloch.renderer.resize();return 1`);}
   // Vergleich draußen am Eingang (gleiche Dichte), dann die drei Ebenen
   for(const [f,px,py] of [['welt',0,70],['e0',31,30],['k1',30,20],['k2',18,11]]){
    for(const [tag,x] of sides){for(const [,o] of sides)if(o!==x)await freeze(o,true);await freeze(x,false);await wait(await go(x,f,px,py));
     const m=await measure(x,f);out.push({side:tag,floor:f,want:dens,...m});console.log(tag,f,JSON.stringify(m));}
    for(const [,x] of sides)await freeze(x,false);}
  }
  sB?.b.close();
  writeFileSync(dir+'/bildzeit.json',JSON.stringify(out,null,1));
  note(6,'Bildzeit: '+out.map(o=>o.side+' '+o.floor+'@'+o.density+' '+o.gapMedian+'/'+o.gapP90+' ms (Zeichnen '+o.drawMedian+'/'+o.drawP90+')').join(', '));
  if(!before)for(const o of out.filter(o=>o.side==='nachher'&&o.density<=3&&o.floor!=='welt')){const ref=out.find(v=>v.side==='vorher'&&v.floor===o.floor&&v.density===o.density);
   assert.ok(o.gapMedian<=Math.max(17.5,(ref?.gapMedian??0)+1),'Bildabstand '+o.floor+' Dichte '+o.density+' Median '+o.gapMedian+' ms'+(ref?' (vorher '+ref.gapMedian+')':''));}
 }
 // ─────────────────────────────────────────────── 7 · Vergleichsbilder vorher/nachher je Raum (untereinander, halbe Größe)
 if(want(7)&&!before&&only.includes('7')){mkdirSync(dir+'/vergleich',{recursive:true});await start({w:1600,h:900});
  for(const [i,[f,id]] of ROOMS.entries()){const name='d-'+String(i+1).padStart(2,'0')+'-'+f+'-'+id+'.jpg';
   const data=await read(`const load=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src;});const a=await load('/visual-review/dungeon-raeume/vorher/${name}'),b=await load('/${dir}/${name}');
    const cv=document.createElement('canvas');cv.width=a.width/2;cv.height=a.height/2+b.height/2+6;const c=cv.getContext('2d');c.fillStyle='#111';c.fillRect(0,0,cv.width,cv.height);c.drawImage(a,0,0,a.width/2,a.height/2);c.drawImage(b,0,a.height/2+6,b.width/2,b.height/2);
    c.font='bold 18px sans-serif';c.fillStyle='#ffd36a';c.fillText('vorher',12,24);c.fillText('nachher',12,a.height/2+30);return cv.toDataURL('image/jpeg',.88).split(',')[1];`);
   writeFileSync(dir+'/vergleich/'+name,Buffer.from(data,'base64'));}
  pass(7,'Vergleichsbilder vorher/nachher je Raum');}
 console.log(JSON.stringify(results,null,1));writeFileSync(dir+'/result.json',JSON.stringify({results,errors:b.errors},null,2));
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,3000));throw e;}finally{b.close();}
