// Browserprüfung Dungeon Etappe 4 Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71, docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Teile (ONLY=1,2,…):
//  1 Kampf-Klarheit im Bosskampf (Desktop): kein Raumtitel, keine Söldner-Blase in der Welt, Ansage unter dem Bossrahmen, Procs nur als
//    Symbol am Helden, kein zweiter Zielrahmen; gezählt: Textelemente im Kreis (250 px) um Big B außer Namen und Schadenszahlen ≤ 1.
//    Dazu „Unterbrochen!“ auf der Warnleiste nach Q.
//  2 Kampf-Klarheit beim Trash: Raumtitel wartet im Kampf und kommt danach; Kampfrufe seitlich am Helden.
// Aufruf: CDP_PORT=9661 SERVER_PORT=4461 BOOT_TRIES=450 node scripts/dungeon-e4b-check.mjs
// Bilder: visual-review/dungeon-e4b/*.jpg (lokal, nicht im Repo). Zum Ansehen wird die Welt an den Schlüsselstellen angehalten (g.paused).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-e4b';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9661,serverPort:4461});const {b,read,start,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
/** In den Dungeon, Söldner anheuern, Trash stumm (quiet), Rotation wie dungeon-e3-check. */
const setup=(quiet=true)=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;g.player.hp=g.player.maxHp;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/auto-combat.js');
 for(const id of ${MERCS})g.hireCompanion(id,{free:true});${quiet?`for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}`:''}
 window.B={rotate(g){const p=g.player,t=g.target,ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0;for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return true;return false;}};
 return g.instance?.kind;`);
const place=(floor,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}return 1;`);
/** Spielzeit vorspulen (wie dungeon-e3-check): Der Held folgt dem Nachsatz und geht aus echten Bahnen, Stellen, Trümmern und Flächen,
 *  sonst steht er hinter dem Boss (vom Söldner aus, der ihn hält). stop: Abbruchbedingung. */
const fast=(seconds,stop='false',foeJs=`g.enemies.find(e=>e.bossId==='bigb')`)=>read(`const b=${foeJs};let t=0;for(;t<${seconds};t+=.05){if(!g.dead){const foe=[...g.enemies.filter(e=>e.hp>0&&e.aggro&&e.priority),b].find(e=>e&&e.hp>0);
  if(foe){if(g.target!==foe){g.target=foe;A.startAuto(g);}const p=g.player,k=b.cast;let goal=null;
   if(k?.lanes&&k.told){const bad=k.truthLanes.map(i=>k.lanes[i]);if(bad.some(r=>D.inLane(r,p,8))){const lo=Math.min(...k.lanes.map(r=>r.x))+10,hi=Math.max(...k.lanes.map(r=>r.x+r.w))-10,xs=bad.flatMap(r=>[r.x-16,r.x+r.w+16]).filter(x=>x>=lo&&x<=hi&&!bad.some(r=>D.inLane(r,{x,y:p.y},8))).sort((a,c)=>Math.abs(a-p.x)-Math.abs(c-p.x));if(xs.length)goal={x:xs[0],y:p.y};}}
   if(!goal&&k?.spots&&k.told)for(const s of k.spots)if(Math.hypot((p.x-s.x)/k.radius,(p.y-s.y)/(k.radius*.75))<1.1){const a=Math.atan2(p.y-s.y,p.x-s.x);goal={x:s.x+Math.cos(a)*(k.radius+16),y:s.y+Math.sin(a)*(k.radius+16)*.75};}
   if(!goal)for(const h of g.dungeonRun.hazards||[])if(Math.hypot(p.x-h.x,p.y-h.y)<h.radius+4){const a=Math.atan2(p.y-h.y,p.x-h.x);goal={x:h.x+Math.cos(a)*(h.radius+14),y:h.y+Math.sin(a)*(h.radius+14)};}
   if(!goal)for(const e of g.enemies){const c=e.cast;if(c?.ground&&e.hp>0&&Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1){const a=Math.atan2(p.y-c.y,p.x-c.x);goal={x:c.x+Math.cos(a)*(c.radius+14),y:c.y+Math.sin(a)*(c.radius+14)*.75};}}
   if(!goal&&!(k?.lanes&&k.told)){const h=g.companions.find(c=>c.id===b.focus&&c.state!=='down');if(h&&foe===b){const d=Math.hypot(b.x-h.x,b.y-h.y)||1;goal={x:b.x+(b.x-h.x)/d*26,y:b.y+(b.y-h.y)/d*26};}else if(Math.hypot(foe.x-p.x,foe.y-p.y)>40)goal={x:foe.x,y:foe.y};}
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){g.moveTo=g.world.findClear(goal.x,goal.y,7);g.path=[];}else g.moveTo=null;
   if(!g.casting&&g.gcd<=0)B.rotate(g);}}
  g.tick(.05);if(${stop})break;}return Math.round(t*10)/10;`);
const bigb=`g.enemies.find(e=>e.bossId==='bigb')`;
const pause=async(on=true)=>{await read(`g.paused=${on};return 1`);if(on)await wait(450);};
/** Textelemente im Kreis um einen Gegner (Bildschirm, radius px): DOM-Einblendungen (Zonentitel, Ansage, Kampfrufe, Kurzmeldung,
 *  Meilenstein) und Welttexte (Sprechblasen, schwebende Worte). Ausgenommen: Namen (Namensschilder) und Schadenszahlen. */
const textsNear=(foeJs,radius=250)=>read(`const e=${foeJs},st=window.mertloch.state(),v=st.viewport,r=document.querySelector('#world').getBoundingClientRect(),k=r.width/v.width;
 const scr=(x,y)=>({x:(x-v.camera.x+v.width/2)*k+r.left,y:(y-v.camera.y+v.height/2)/v.height*r.height+r.top}),c=scr(e.x,e.y-26);
 const near=(q)=>{const dx=Math.max(q.left-c.x,0,c.x-q.right),dy=Math.max(q.top-c.y,0,c.y-q.bottom);return Math.hypot(dx,dy)<=${radius};};
 const vis=el=>{let n=el;while(n&&n!==document.body){const cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05||n.hidden)return false;n=n.parentElement;}const q=el.getBoundingClientRect();return q.width>1&&q.height>1;};
 const num=t=>/^[−+\\-]?[0-9][0-9.,]*!?( ?(EP|%))?$/.test(t.trim());const out=[],hud=[];
 // Welt: Zonentitel und Meilenstein (liegen über der Spielfläche), Kampfrufe (eine Zeile je Ruf; Zahl mit Quelle = Schadenszahl), Blasen, Worte
 for(const el of document.querySelectorAll('.region-label #zoneName,.milestone.show')){const t=el.textContent.trim();if(t&&vis(el)&&near(el.getBoundingClientRect()))out.push({kind:'titel',sel:el.id||el.className,text:t.slice(0,40)});}
 for(const row of document.querySelectorAll('#sct .sct-row')){const bb=row.querySelector('b'),t=bb?.textContent.trim()||'';if(!t||num(t)||!vis(bb))continue;if(near(bb.getBoundingClientRect()))out.push({kind:'kampfruf',sel:row.className,text:t.slice(0,40)});}
 const sy=r.height/v.height;for(const bu of st.speech||[]){const q={left:bu.x*k+r.left,top:bu.y*sy+r.top,right:(bu.x+bu.w)*k+r.left,bottom:(bu.y+bu.h)*sy+r.top};if(near(q))out.push({kind:'blase',sel:String(bu.enemyId),text:'',y:Math.round(q.top)});}
 for(const t of g.texts||[]){if(!(t.life>0)||num(String(t.text)))continue;const a=scr(t.x,t.y-20);if(near({left:a.x-30,right:a.x+30,top:a.y-8,bottom:a.y+8}))out.push({kind:'welt',sel:'float',text:String(t.text)});}
 // HUD-Bänder oben mittig (Ansage unter dem Bossrahmen, Kurzmeldung): gehören zum HUD, werden aber mit Abstand zum Boss mitgemeldet
 for(const el of document.querySelectorAll('.boss-announce b,#toast')){const t=el.textContent.trim();if(!t||!vis(el))continue;const q=el.getBoundingClientRect();hud.push({sel:el.id||'Ansage',text:t.slice(0,40),dist:Math.round(Math.hypot(Math.max(q.left-c.x,0,c.x-q.right),Math.max(q.top-c.y,0,c.y-q.bottom)))});}
 return {center:{x:Math.round(c.x),y:Math.round(c.y)},items:out,hud};`);
try{
 // ───────────────────────────────── 1 · Kampf-Klarheit im Bosskampf (Desktop)
 if(want(1)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon','im Dungeon');
  for(let i=0;i<60&&await read(`return !!document.querySelector('#toast.visible')`);i++)await wait(250);/* Anheuer-Meldungen abwarten (im Spiel heuert man vor dem Betreten an) */
  // Wie im Befund: Held betritt den Thronsaal und zieht Big B sofort (Raumtitel wäre fällig), Söldner frisch angeheuert (Blase)
  await read(`const r=g.dungeonRun;r.seals.add('siegel-gerd');r.version++;return 1`);await place('k2',52,24);
  await read(`const b=${bigb};b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;A.startAuto(g);g.adminGod=true;return 1`);await wait(900);
  await fast(30,`(()=>{const k=${bigb}.cast;return k?.type==='kanone'&&k.told===false&&k.total-k.remaining>.25;})()`);
  // Die Quellen aus dem Befund dazulegen: Söldner-Spruch, eigener Proc „IN FAHRT“, Schwung
  await read(`const c=g.companions[3];g.bark(c,'Endlich Bewegung.','companion');g.sct({area:'note',kind:'proc',text:'IN FAHRT',color:'#ffd37a'});g.sct({area:'note',kind:'momentum',text:'SCHWUNG ▲▲',iconKey:'boots'});return 1`);
  await wait(250);await pause();
  const clar=await read(`const lbl=document.querySelector('.region-label'),tp=document.querySelector('#targetPanel'),bf=document.querySelector('.boss-frame').getBoundingClientRect(),an=document.querySelector('.boss-announce'),ar=an.getBoundingClientRect();
   return {fight:document.body.classList.contains('dg-fight'),boss:document.body.classList.contains('boss-fight'),target:document.body.classList.contains('boss-target'),zoneShown:lbl.classList.contains('zone-show'),zoneVisible:getComputedStyle(lbl).visibility!=='hidden'&&+getComputedStyle(lbl).opacity>.05,
    targetPanel:getComputedStyle(tp).display,announce:an.hidden?null:{top:Math.round(ar.top),frameBottom:Math.round(bf.bottom),text:an.textContent.trim()},mercBubble:(window.mertloch.state().speech||[]).some(x=>String(x.enemyId).startsWith('merc')),
    proc:[...document.querySelectorAll('#sct .sct-note .sct-row')].map(r=>({text:r.textContent.trim(),textShown:getComputedStyle(r.querySelector('b')).display!=='none'}))}`);
  assert.ok(clar.fight&&clar.boss&&clar.target,'Bosskampf erkannt '+JSON.stringify(clar));
  assert.equal(clar.zoneVisible,false,'kein Raumtitel im Bosskampf '+JSON.stringify(clar));
  assert.equal(clar.targetPanel,'none','Zielrahmen weg, wenn der Boss das Ziel ist');
  assert.equal(clar.mercBubble,false,'keine Söldner-Sprechblase in der Welt');
  assert.ok(clar.proc.length>=1&&clar.proc.every(p=>!p.textShown),'Kampfrufe im Bosskampf nur als Symbol '+JSON.stringify(clar.proc));
  const near=await textsNear(bigb);await shot('01-bosskampf-behauptung');
  assert.ok(near.items.length<=1,'höchstens ein Textelement um Big B '+JSON.stringify(near));
  const fb=await read(`return Math.round(document.querySelector('.boss-frame').getBoundingClientRect().bottom)`);for(const i of near.items.filter(i=>i.kind==='blase'))assert.ok(i.y>=fb,'Blase nicht unter dem Bossrahmen '+JSON.stringify({i,fb}));
  ok('Bosskampf (Behauptung): kein Raumtitel, kein Zielrahmen, keine Söldner-Blase, Kampfrufe nur als Symbol; um Big B (250 px) '+near.items.length+' Textelement ('+near.items.map(i=>i.kind+':'+i.sel).join(', ')+'), HUD-Bänder: '+(near.hud.map(h=>h.sel+' „'+h.text+'“ '+h.dist+' px').join(', ')||'keine'));
  // Ansage unter dem Bossrahmen: beim ersten Auftreten einer Mechanik (die Kanonenkugel ist schon angesagt) – eine neue anstoßen
  await pause(false);await fast(4,`!${bigb}.cast`);
  await read(`const b=${bigb};b.castSet='d-bigb';b.cycle=1;b.cast=null;b.attackTimer=0;b.stun=0;return 1`);await fast(1,`${bigb}.cast?.type==='anwalt'`);await wait(200);await pause();
  const ann=await read(`const an=document.querySelector('.boss-announce'),ar=an.getBoundingClientRect(),bf=document.querySelector('.boss-frame').getBoundingClientRect();return {hidden:an.hidden,top:Math.round(ar.top),bottom:Math.round(ar.bottom),frameBottom:Math.round(bf.bottom),text:an.textContent.trim()}`);
  const near2=await textsNear(bigb);await shot('02-bosskampf-ansage');
  if(!ann.hidden)assert.ok(ann.top>=ann.frameBottom&&ann.bottom<=ann.frameBottom+60,'Ansage direkt unter dem Bossrahmen '+JSON.stringify(ann));
  assert.ok(near2.items.length<=1,'höchstens ein Textelement um Big B bei der Ansage '+JSON.stringify(near2));
  ok('Ansage '+(ann.hidden?'(schon abgelaufen)':'„'+ann.text+'“ bei y='+ann.top+' direkt unter dem Bossrahmen (Unterkante '+ann.frameBottom+', '+(near2.hud.find(h=>h.sel==='Ansage')?.dist??'–')+' px vom Boss)')+'; um Big B '+near2.items.length+' Textelement in der Welt');
  // Unterbrechen: Q bei „Mein Anwalt ruft gleich an“ → „Unterbrochen!“ auf der Leiste, dann erlischt es
  await pause(false);await read(`const b=${bigb};Object.assign(g.player,g.world.findClear(b.x+30,b.y+10,9));g.target=b;g.cooldowns.interrupt=0;g.gcd=0;g.casting=null;return 1`);
  const cast=await read(`return ${bigb}.cast?.type||''`);if(cast!=='anwalt'){await read(`const b=${bigb};b.cast=null;b.castSet='d-bigb';b.cycle=1;b.attackTimer=0;b.stun=0;return 1`);await fast(1,`${bigb}.cast?.type==='anwalt'`);}
  await wait(300);/* wie ein Spieler: die Leiste steht, dann Q */
  const hit=await read(`g.cooldowns.interrupt=0;g.gcd=0;g.player.energy=100;if(g.classState)g.classState.rage=Math.max(g.classState.rage||0,50);const ok=g.action('interrupt');return {ok,cast:${bigb}.cast?.type||null}`);
  let flash=null;for(let i=0;i<10&&!flash?.length;i++){await wait(80);flash=await read(`return window.__bossAlerts.state().interrupted||[]`);}
  await pause();const row=await read(`const r=document.querySelector('.boss-alerts .ba-row.ba-done');const c=document.querySelector('.bf-cast');return {row:r?.textContent.trim()||'',cast:c&&!c.hidden?c.textContent.trim():'',castDone:!!c?.classList.contains('bf-done')}`);
  await shot('03-unterbrochen');assert.ok(hit.ok&&hit.cast===null,'Q unterbricht '+JSON.stringify(hit));assert.ok(/Unterbrochen!/.test(row.row),'„Unterbrochen!“ auf der Warnleiste '+JSON.stringify(row));assert.ok(row.castDone,'und in der Zauberleiste des Bossrahmens');
  await pause(false);await wait(1700);const gone=await read(`return !document.querySelector('.boss-alerts .ba-row.ba-done')`);assert.ok(gone,'„Unterbrochen!“ erlischt');
  ok('Unterbrechen: nach Q steht „Unterbrochen!“ grün auf der Warnleiste und im Bossrahmen („'+row.row+'“), nach 1,3 s erlischt es');
  await read(`g.adminGod=false;return 1`);
 }
 // ───────────────────────────────── 2 · Trash: Raumtitel wartet im Kampf, Kampfrufe seitlich
 if(want(2)){
  await start({w:1600,h:900});assert.equal(await setup(false),'dungeon');
  await read(`for(const e of g.enemies)if(e.pack&&!['hof-west'].includes(e.pack)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}return 1`);/* nur ein Pack kämpft */
  await place('e0',31,34);await wait(4500);/* Titel „Schlosshof“ ist durch */
  await read(`for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}g.adminGod=true;return 1`);await wait(400);
  await place('e0',50,26);/* Hofkanzlei: neuer Raum, während im Hof gekämpft wird */await read(`for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){const q=g.world.findClear(g.player.x-20,g.player.y+6,9);e.x=q.x;e.y=q.y;e.aggro=true;e.ai='combat';}return 1`);
  await wait(1200);await read(`g.sct({area:'note',kind:'proc',text:'IN FAHRT',color:'#ffd37a'});g.sct({area:'note',kind:'momentum',text:'SCHWUNG ▲',iconKey:'boots'});return 1`);await wait(300);
  const during=await read(`const l=document.querySelector('.region-label'),n=document.querySelector('#sct .sct-note'),hr=n.getBoundingClientRect(),lr=l.getBoundingClientRect();return {fight:document.body.classList.contains('dg-fight'),zone:document.querySelector('#zoneName').textContent,shown:getComputedStyle(l).visibility!=='hidden'&&+getComputedStyle(l).opacity>.05&&l.classList.contains('zone-show'),note:{left:Math.round(hr.left),top:Math.round(hr.top)},label:{bottom:Math.round(lr.bottom)},hero:(()=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect(),k=r.width/v.width;return Math.round((g.player.x-v.camera.x+v.width/2)*k+r.left);})()}`);
  await pause();await shot('04-trash-kampf-ohne-titel');await pause(false);
  assert.ok(during.fight,'Kampf im Dungeon erkannt');assert.equal(during.zone,'Hofkanzlei');assert.equal(during.shown,false,'Raumtitel wartet im Kampf '+JSON.stringify(during));
  assert.ok(during.note.left>during.hero,'Kampfrufe rechts neben dem Helden, nicht über ihm '+JSON.stringify(during));
  await read(`for(const e of g.enemies)if(e.pack==='hof-west'&&e.hp>0)g.kill(e);g.adminGod=false;return 1`);let after=false;for(let i=0;i<24&&!after;i++){await wait(250);after=await read(`const l=document.querySelector('.region-label');return l.classList.contains('zone-show')&&document.body.dataset.zoneAnnounced==='Hofkanzlei'`);}
  await shot('05-trash-titel-danach');assert.ok(after,'Raumtitel kommt nach dem Kampf');
  ok('Trash: Raumtitel „Hofkanzlei“ wartet, solange gekämpft wird, und kommt nach dem Kampf; Kampfrufe rechts neben dem Helden');
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
 console.log('dungeon-e4b-check: '+checks.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
