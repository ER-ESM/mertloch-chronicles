// Prüfskript Hotfix Dungeon „Schloss Big B“ (2026-09-25, Prüfer-Playtest Build #562; Bericht docs/DUNGEON-HOTFIX-2026-09-25.md).
// Mit echter Maus (CDP Input.dispatchMouseEvent), Desktop 2024 × 900:
//  1 Arenatür: der Prüfer-Fall (Hopfen-Horst wartet vorn, Held wirft aus dem Hof) zieht Gerd nicht mehr; Rechtsklick auf Gerd aus dem
//    Schlosshof läuft in die Arena, beim Zufallen stehen alle fünf drin; Gerd ist besiegbar. Dazu: ein Söldner zieht nicht allein.
//  2 Neuladen: geräumter Trash bleibt weg (auch mit stehender Pappwache), kein Sofort-Kampf, Schutz nach dem Laden.
//  3 Weltkarte: das Dungeon-Symbol steht einzeln, nie in einem Bündel.
//  4 Eingangskarte → Journal → Schließen bringt die Eingangskarte zurück; Schädelplätze mit Tooltip; zugängliche Namen.
// Aufruf: node scripts/dungeon-hotfix-check.mjs   (CDP 9670, Server 4470; CDP_PORT/SERVER_PORT, BOOT_TRIES, ONLY=1,2,… einzelne Teile)
// Bilder: visual-review/dungeon-hotfix/*.jpg (lokal, nicht im Repo)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-hotfix';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean);const want=n=>!only.length||only.includes(String(n));
const s=await session({port:9670,serverPort:4470});const {b,read,start,closeAll,settle,hover,click}=s;
const results=[],shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const pass=(n,text)=>{results.push({n,text});console.log('PASS '+n+' · '+text);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
const TO_SCREEN=`const toS=pt=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect();return {x:Math.round((pt.x-v.camera.x+v.width/2)/v.width*r.width+r.left),y:Math.round((pt.y-v.camera.y+v.height/2)/v.height*r.height+r.top)}};`;
async function mouseAt(x,y,button='left'){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse'});await wait(120);
 for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x,y,button,clickCount:1,pointerType:'mouse'});await wait(200);}
/** Held Stufe 10 wie in scripts/dungeon-sim.mjs: Kneipenschläger, voller Satz ungewöhnlich. */
const gearUp=()=>read(`const [R,I,T]=await Promise.all([import('/rpg.js'),import('/itemization.js'),import('/talents.js')]);g.player.level=10;T.changeSpec(g,'dieter-brawl');
 const slots=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
 slots.forEach(([slot,target,roll],i)=>{const id=I.registerRoll(g.rpg,R.ITEMS,{slot,spec:['tresen','bass','pfand'][i%3],level:10,quality:'uncommon',roll,family:'boar'});R.addItem(g.rpg,id);R.equipItem(g,id,target);});g.refreshStats();g.player.hp=g.player.maxHp;return g.player.maxHp;`);
/** Durch die Eingangskarte hinein (F, F), vier Söldner, Trash außerhalb des Hofs stumm. */
async function enter(){
 await read(`window.D=await import('/dungeon.js');const d=D.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+8});g.player.inCombat=0;`);await wait(400);
 assert.equal(await read('return g.interaction()?.kind'),'dungeonEnter','Eingang bietet sich an');
 await b.press('f');await wait(600);assert.ok(await read(`return !!document.querySelector('.popup-dungeonEntry')`),'Eingangskarte');await b.press('f');
 for(let i=0;i<30&&await read(`return g.instance?.kind`)!=='dungeon';i++)await wait(200);
 assert.equal(await read('return g.instance?.kind'),'dungeon','über F betreten');await wait(900);
 await read(`for(const id of ${MERCS})g.hireCompanion(id,{free:true});`);await wait(300);
}
const place=(floor,x,y,facing=1)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.facing=${facing};g.player.inCombat=0;g.moveTo=null;g.path=[];g.target=null;g.stopAuto?.();
 g.companions.forEach((c,i)=>{const q=g.world.findClear(g.player.x+12+i*10,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;c.order='follow';});`);
const rooms=()=>read(`const r=u=>D.roomAt(g.dungeonRun.def,u.x,u.y)?.id||'-';return {hero:r(g.player),mercs:Object.fromEntries(g.companions.map(c=>[c.name,r(c)])),arena:g.dungeonRun.arena};`);
/** Wache im Seitenkontext: hält fest, wer beim Zufallen der Tür wo stand (ein Bild, nicht erst beim nächsten Abfragen). */
const watchDoor=()=>read(`window.__door=null;window.__rk={approach:false,msgs:[],x0:g.player.x};for(const k of ['toast','fail']){const o=g[k].bind(g);g[k]=(m,...r)=>{window.__rk.msgs.push(String(m));return o(m,...r);};}const t=g.tick.bind(g);g.tick=dt=>{const was=g.dungeonRun?.arena;if(g.approach)window.__rk.approach=true;t(dt);const r=g.dungeonRun;if(r&&r.arena&&!was&&!window.__door){const room=u=>D.roomAt(r.def,u.x,u.y)?.id||'-';window.__door={arena:r.arena,hero:room(g.player),mercs:Object.fromEntries(g.companions.map(c=>[c.name,room(c)])),time:g.time};}};`);
/** Spielzeit vorspulen wie dungeon-e1-check („weicht aus“, Autoangriff, Rotation). */
const fast=(seconds,stop='false')=>read(`const ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0,A=await import('/auto-combat.js');
 const rotate=()=>{const p=g.player,t=g.target;for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('buff')&&p.energy>=30,()=>g.action('buff')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return;};
 for(let t=0;t<${seconds};t+=.05){if(!g.dead){const foe=[g.enemies.find(e=>e.bossId==='gerd'&&e.hp>0&&e.aggro),...g.enemies.filter(e=>e.hp>0&&e.aggro)].find(Boolean);
  if(foe){if(g.target!==foe){g.target=foe;A.startAuto(g);}const h=g.companions.find(c=>c.id===foe.focus&&c.state!=='down');if(h){const d=Math.hypot(foe.x-h.x,foe.y-h.y)||1,q=g.world.findClear(foe.x+(foe.x-h.x)/d*26,foe.y+(foe.y-h.y)/d*26,7);g.moveTo=Math.hypot(q.x-g.player.x,q.y-g.player.y)>6?q:null;g.path=[];}else{const d=Math.hypot(foe.x-g.player.x,foe.y-g.player.y);g.moveTo=d>30?g.world.findClear(foe.x,foe.y,7):null;g.path=[];}
   if(!g.casting&&g.gcd<=0)rotate();}}g.tick(.05);if(${stop})break;}return Math.round(g.time);`);
try{
 // ─────────────────────────────────────────────── 1 · Arenatür
 if(want(1)){
  await start({w:2024,h:900});await gearUp();await enter();
  await read(`for(const e of g.enemies)if(!e.dungeonBoss&&e.hp>0)g.kill(e);g.player.inCombat=0;`);await wait(400);
  // a) Prüfer-Fall: Held im Hof vor der Tür, Blick nach Westen – der Platz von Hopfen-Horst läge in der Arena
  await place('e0',21,28.5,-1);await wait(2600);await settle();
  let at=await rooms();assert.equal(at.hero,'hof');
  assert.ok(Object.values(at.mercs).every(r=>r!=='zugbruecke'),'Söldner warten am Arenarand, keiner läuft in die offene Arena '+JSON.stringify(at));
  await shot('01-soeldner-warten-am-rand');pass(1,'Söldner warten am Arenarand: keiner steht in der offenen Arena, solange der Held im Hof ist');
  // b) Söldner zieht nicht allein: Horst steht drin und trifft Gerd (Bedrohung auf ihm), der Held bleibt draußen
  await read(`const h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');Object.assign(h,D.toWorld(g.dungeonRun.def,'e0',11,29));h.order='stay';const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';gerd.threat={[h.id]:900};`);
  await wait(900);const alone=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd'),h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');return {arena:g.dungeonRun.arena,aggro:gerd.aggro,full:gerd.hp===gerd.maxHp,horst:D.roomAt(g.dungeonRun.def,h.x,h.y)?.id,target:h.target?.bossId||null};`);
  assert.ok(!alone.arena&&!alone.aggro&&alone.full&&alone.target!=='gerd','Gerd setzt zurück, Tür bleibt offen, Horst greift nicht an '+JSON.stringify(alone));
  await shot('02-soeldner-zieht-nicht-allein');pass(1,'Ein Söldner zieht Gerd nie allein: Horst steht in der Arena, Gerd setzt zurück, die Tür bleibt offen');
  await read(`const h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');h.order='follow';`);await place('e0',21,28.5,-1);await wait(2200);await settle();
  // c) Rechtsklick auf Gerd mit echter Maus, dann Pfandwurf (Fernkniff 235) mit echter Maus – wie im Playtest
  await watchDoor();
  const gerdAt=await read(TO_SCREEN+`const e=g.enemies.find(e=>e.bossId==='gerd');return toS({x:e.x,y:e.y-18});`);
  await mouseAt(gerdAt.x,gerdAt.y,'right');
  await wait(700);const afterClick=await read(`return {target:g.target?.bossId||null,auto:g.autoAttack.enabled,approach:window.__rk.approach,west:Math.round(window.__rk.x0-g.player.x),msgs:window.__rk.msgs}`);
  assert.ok(afterClick.target==='gerd'&&afterClick.auto&&afterClick.approach&&afterClick.west>8&&!afterClick.msgs.some(m=>/Kein Weg/.test(m)),'Rechtsklick wählt Gerd und läuft per Wegsuche los '+JSON.stringify(afterClick));
  const throwBtn=await read(`const r=document.querySelector('[data-skill="throw"]')?.getBoundingClientRect();return r&&r.width?{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}:null`);
  if(throwBtn)await mouseAt(throwBtn.x,throwBtn.y);
  const early=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp===gerd.maxHp,arena:g.dungeonRun.arena,hero:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`);
  if(early.hero==='hof')assert.ok(early.hp&&!early.arena,'kein Treffer aus dem Hof, Tür offen '+JSON.stringify(early));
  for(let i=0;i<60&&!await read('return window.__door');i++)await wait(150);
  const door=await read('return window.__door');await shot('03-tuer-zu-alle-drin');
  assert.ok(door,'Tür fällt zu');assert.equal(door.hero,'zugbruecke','Held ist in der Arena, als die Tür zufällt');
  assert.ok(Object.values(door.mercs).every(r=>r==='zugbruecke'),'alle vier Söldner in der Arena '+JSON.stringify(door));
  pass(1,'Rechtsklick auf Gerd aus dem Schlosshof (dazu Pfandwurf per Maus): Held läuft hinein, beim Zufallen stehen alle fünf in der Arena'+(throwBtn?' · Pfandwurf traf nicht durch die Tür':''));
  // d) Gerd ist besiegbar (Vorspulen wie dungeon-e1-check, Held unsterblich wie dort)
  await read('g.adminGod=true');await fast(360,`g.enemies.find(e=>e.bossId==='gerd').hp<=0`);await read('g.adminGod=false;g.player.inCombat=0');
  const won=await read(`const r=g.dungeonRun,gerd=g.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp,killed:r.killed.has('gerd'),arena:r.arena,mercs:g.companions.filter(c=>c.state!=='down').length};`);
  await wait(1500);await shot('04-gerd-besiegt');
  assert.ok(won.hp===0&&won.killed,'Gerd besiegt '+JSON.stringify(won));
  pass(1,'Gerd besiegt mit Held und vier Söldnern ('+won.mercs+' Söldner stehen), Tür danach '+(won.arena?'zu':'offen'));
 }
 // ─────────────────────────────────────────────── 3 · Weltkarte: Dungeon-Symbol einzeln
 if(want(3)||want(4)||want(2)||want(5)){await start({w:2024,h:900});await read(`g.player.level=10;g.refreshStats?.();`);}
 if(want(3)){
  await b.press('m');await wait(900);
  const probe=()=>read(`const cv=document.querySelector('#largeMap');const h=(cv.atlasHits||[]).find(h=>h.ids.includes('dungeon:schloss-bigb'));if(!h)return null;const r=cv.getBoundingClientRect();return {x:Math.round(r.left+h.x*r.width/cv.width),y:Math.round(r.top+h.y*r.height/cv.height),cluster:h.cluster,ids:h.ids,zoom:Math.round(cv.atlasView.scale*1000)/1000};`);
  const seen=[];
  for(let step=0;step<6;step++){const h=await probe();if(h){seen.push(h);assert.equal(h.cluster,false,'Dungeon-Symbol einzeln (Maßstab '+h.zoom+'): '+JSON.stringify(h.ids));
    if(step===0||step===5){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:h.x,y:h.y,pointerType:'mouse'});await wait(450);
     const tip=await read(`const t=document.querySelector('.wk-tip');return t&&!t.hidden?t.textContent:''`);assert.match(tip,/Schloss Big B/,'Tooltip nennt den Dungeon');assert.doesNotMatch(tip,/Orte hier/,'kein Bündel-Tooltip');await shot('10-weltkarte-dungeon-einzeln-'+step);}}
   const c=await read(`const r=document.querySelector('#largeMap').getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}`);
   await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:c.x,y:c.y,deltaX:0,deltaY:-120,pointerType:'mouse'});await wait(350);}
  assert.ok(seen.length>=3,'Symbol in mehreren Maßstäben geprüft');
  await closeAll();pass(3,'Weltkarte: Dungeon-Symbol in '+seen.length+' Maßstäben einzeln ('+[...new Set(seen.map(h=>h.zoom))].join(' / ')+'), Tooltip „Schloss Big B“, kein „Orte hier“');
 }
 // ─────────────────────────────────────────────── 4 · Eingangskarte und Journal
 if(want(4)||want(2)||want(5)){await read(`window.D=await import('/dungeon.js');const d=D.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+8});g.player.inCombat=0;`);await wait(500);}
 if(want(4)){
  await b.press('f');await wait(700);assert.ok(await read(`return !!document.querySelector('.popup-dungeonEntry')`),'Eingangskarte offen');
  const names=await read(`const p=document.querySelector('.popup-dungeonEntry');return {offers:[...p.querySelectorAll('.dg-offer')].map(b=>b.getAttribute('aria-label')||''),journal:p.querySelector('.dg-journal')?.getAttribute('aria-label')||''}`);
  assert.ok(names.offers.length>0&&names.offers.every(t=>/Anheuern: .+ · /.test(t)),'Söldner-Knöpfe mit zugänglichem Namen '+JSON.stringify(names.offers));assert.match(names.journal,/Journal/,'Journal-Knopf mit zugänglichem Namen');
  await click('.popup-dungeonEntry .dg-journal');await wait(500);
  let st=await read(`return {entry:!!document.querySelector('.popup-dungeonEntry'),journal:!!document.querySelector('.popup-journal')}`);assert.ok(st.journal&&!st.entry,'Journal ersetzt die Karte (ein Fenster) '+JSON.stringify(st));
  const tabs=await read(`return [...document.querySelectorAll('.popup-journal .dj-tab')].map((t,i)=>({i,locked:t.getAttribute('aria-disabled')==='true',star:!!t.querySelector('.dj-star'),label:t.getAttribute('aria-label')||''}))`);
  const locked=tabs.filter(t=>t.locked);assert.ok(locked.length>=1,'gesperrte Plätze vorhanden '+JSON.stringify(tabs));
  const tipOf=async i=>{await hover(`.popup-journal .dj-tab:nth-child(${i+1})`);await wait(350);return read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?[...t.children].map(x=>x.textContent).join(' · '):''`);};
  const plain=locked.find(t=>!t.star),star=locked.find(t=>t.star);
  const tipPlain=await tipOf(plain.i);assert.match(tipPlain,/Noch nicht entdeckt/,'Tooltip auf gesperrtem Schädel: '+tipPlain);await shot('20-journal-tooltip-gesperrt');
  let tipStar='';if(star){tipStar=await tipOf(star.i);assert.match(tipStar,/Selten/,'Tooltip auf dem Stern-Platz: '+tipStar);await shot('21-journal-tooltip-selten');}
  await click('.popup-journal [data-window-close]');await wait(600);
  st=await read(`return {entry:!!document.querySelector('.popup-dungeonEntry'),journal:!!document.querySelector('.popup-journal')}`);assert.ok(st.entry&&!st.journal,'nach dem Schließen ist die Eingangskarte zurück '+JSON.stringify(st));await shot('22-eingangskarte-zurueck');
  await click('.popup-dungeonEntry .dg-journal');await wait(500);await b.press('Escape');await wait(600);
  st=await read(`return {entry:!!document.querySelector('.popup-dungeonEntry'),journal:!!document.querySelector('.popup-journal')}`);assert.ok(st.entry&&!st.journal,'Esc im Journal bringt die Eingangskarte zurück '+JSON.stringify(st));
  await click('.popup-dungeonEntry .dg-journal');await wait(500);await b.press('m');await wait(700);
  st=await read(`return {entry:!!document.querySelector('.popup-dungeonEntry'),map:!!document.querySelector('.popup-map,#largeMap:not([hidden])')}`);assert.ok(!st.entry,'öffnet der Spieler ein anderes Fenster, kommt die Karte nicht dazwischen '+JSON.stringify(st));
  await closeAll();await b.press('Escape');await wait(300);await closeAll();
  pass(4,'Eingangskarte → Journal → Schließen (X und Esc) bringt die Eingangskarte zurück; Schädelplätze mit Tooltip „'+tipPlain.replace(/\s+/g,' ').trim()+'“'+(star?' / „'+tipStar.replace(/\s+/g,' ').trim()+'“':'')+'; Söldner- und Journal-Knopf mit aria-label');
 }
 // ─────────────────────────────────────────────── 2 · Neuladen: geräumter Trash bleibt weg, kein Sofort-Kampf
 if(want(2)||want(5)){
  await read(`g.player.inCombat=0;`);await b.press('f');await wait(700);await b.press('f');
  for(let i=0;i<30&&await read(`return g.instance?.kind`)!=='dungeon';i++)await wait(200);assert.equal(await read('return g.instance?.kind'),'dungeon','betreten');await wait(900);
  await read(`window.D=await import('/dungeon.js');for(const id of ${MERCS})g.hireCompanion(id,{free:true});`);await wait(400);
 }
 if(want(2)){
  // Wie im Playtest: das Paar im Westen fällt im Kampf, die neutrale Pappwache bleibt stehen
  const before=await read(`const west=g.enemies.filter(e=>e.pack==='hof-west');for(const e of west)if(!e.cardboard)g.kill(e);g.player.inCombat=0;return {pappe:west.filter(e=>e.cardboard&&e.hp>0).length,cleared:g.dungeonRun.trash.has('hof-west'),cp:g.dungeonRun.checkpoint}`);
  assert.ok(before.pappe>=1&&before.cleared,'Pappwache steht, Pack gilt als geräumt '+JSON.stringify(before));
  await read(`g.emit('save')`);await wait(900);await b.goto(b.url);for(let i=0;i<200&&!await b.evaluate('!!window.game');i++)await wait(150);
  await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(x=>x.click());window.D=await import('/dungeon.js');`);await wait(600);
  const t0=await read(`return g.time`);
  const after=await read(`const r=g.dungeonRun;return r?{inside:g.instance?.kind,room:D.roomAt(r.def,g.player.x,g.player.y)?.id,west:g.enemies.filter(e=>e.pack==='hof-west'&&e.hp>0).length,trash:[...r.trash],calm:Math.round((r.calmUntil-g.time)*10)/10}:null`);
  assert.ok(after&&after.inside==='dungeon'&&after.room==='hof','nach dem Neuladen im Hof '+JSON.stringify(after));assert.equal(after.west,0,'geräumtes Paar bleibt weg '+JSON.stringify(after));
  await shot('30-neuladen-hof');
  for(let i=0;i<40&&await read(`return g.time`)<t0+7;i++)await wait(250);
  const later=await read(`return {aggro:g.enemies.filter(e=>e.hp>0&&e.aggro).map(e=>e.name),combat:g.player.inCombat,hp:Math.round(g.player.hp/g.player.maxHp*100),time:Math.round(g.time-${'${t0}'})}`.replace('${t0}',String(t0)));
  assert.equal(later.aggro.length,0,'kein Gegner im Kampf '+JSON.stringify(later));assert.equal(later.combat,0,'kein Sofort-Kampf');await shot('31-neuladen-ruhig');
  pass(2,'Neuladen: wieder im Hof am Kontrollpunkt, geräumtes Paar bleibt weg (Pappwache zählt nicht), '+later.time+' s Spielzeit ohne Kampf, Schutz '+after.calm+' s');
 }
 // ─────────────────────────────────────────────── 5 · Verborgene Gegner: kein Hover-Ring, kein Rechtsklick
 if(want(5)){
  await read(`const r=g.dungeonRun;Object.assign(g.player,D.toWorld(r.def,'e0',24,22));g.player.inCombat=0;g.target=null;`);await settle();await wait(500);
  const hid=await read(TO_SCREEN+`const e=g.enemies.find(e=>e.hp>0&&D.concealed(g,e));if(!e)return null;const s=toS({x:e.x,y:e.y-14});return {x:s.x,y:s.y,id:e.id,name:e.name,inView:s.x>0&&s.y>0&&s.x<innerWidth&&s.y<innerHeight}`);
  assert.ok(hid&&hid.inView,'verborgener Gegner im Bildausschnitt '+JSON.stringify(hid));
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:hid.x,y:hid.y,pointerType:'mouse'});await wait(400);
  const hov=await read(`return g.hoverUnit?.ref?.id??null`);assert.notEqual(hov,hid.id,'kein Hover-Ring auf dem verborgenen Gegner');
  await mouseAt(hid.x,hid.y,'right');await wait(300);const tgt=await read(`return g.target?.id??null`);assert.notEqual(tgt,hid.id,'Rechtsklick wählt ihn nicht');
  await b.press('Tab');await wait(250);const tab=await read(`return g.target&&D.concealed(g,g.target)?g.target.name:null`);assert.equal(tab,null,'Tab wählt keinen verborgenen Gegner');
  await shot('40-verborgen-kein-hover');pass(5,'Verborgener Gegner ('+hid.name+' im Wehrgang): kein Hover-Ring, Rechtsklick und Tab wählen ihn nicht');
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');
 writeFileSync(dir+'/result.json',JSON.stringify({results,errors:b.errors},null,2));
 console.log('dungeon-hotfix-check: '+results.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
