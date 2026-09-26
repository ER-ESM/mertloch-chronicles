// Browserprüfung Dungeon Etappe 4 Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71, docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Teile (ONLY=1,2,…):
//  1 Kampf-Klarheit im Bosskampf (Desktop): kein Raumtitel, keine Söldner-Blase in der Welt, Ansage unter dem Bossrahmen, Procs nur als
//    Symbol am Helden, kein zweiter Zielrahmen; gezählt: Textelemente im Kreis (250 px) um Big B außer Namen und Schadenszahlen ≤ 1.
//    Dazu „Unterbrochen!“ auf der Warnleiste nach Q.
//  2 Kampf-Klarheit beim Trash: Raumtitel wartet im Kampf und kommt danach; Kampfrufe seitlich am Helden.
//  3 Verfolgung: Flügel/Siegel und Beweise mit Wort, Zähler und Tooltip je Symbol.
//  4 Flügel: Gerd öffnet die Kette als Abkürzung bis zum Tagesreset, kleine Truhe, Flügelstand in Verfolgung und Eingangskarte.
//  5 Beweis finden (Pelzmantel auf dem Carport-Dach) und im Thronsaal vorlegen – Lupe im Bossrahmen.
//  6 Ereignisse unterwegs: Vermieter Volker befreien; Beamer ausstecken, das Gespenst verschwindet.
//  7 Händler Vermieter Volker: Einzelfenster ohne Scrollen, Tausch Siegelmarken → Dorflegende.
//  8 Erfolge und Titel: Medaille mit Tooltip im Figur-Fenster; Bestzeit auf der Eingangskarte.
//  9 Handy hoch: Bosskampf ohne Zielrahmen, Händlerfenster ohne Scrollen.
// Aufruf: CDP_PORT=9661 SERVER_PORT=4461 BOOT_TRIES=450 node scripts/dungeon-e4b-check.mjs
// Bilder: visual-review/dungeon-e4b/*.jpg (lokal, nicht im Repo). Zum Ansehen wird die Welt an den Schlüsselstellen angehalten (g.paused).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {DUNGEON_E4B} from '../content/index.js';
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
/** Textelemente im Kreis um einen Gegner (Bildschirm, radius px): DOM-Einblendungen (Zonentitel, Meilenstein, Kampfrufe, Kurzmeldungen,
 *  Fenster und Erinnerungen) und Welttexte (Sprechblasen, schwebende Worte). Ausgenommen: Namen (Namensschilder) und Schadenszahlen.
 *  Die Ansage unter dem Bossrahmen wird mit ihrem Abstand gemeldet (HUD-Band). */
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
 // Kurzmeldungen, Fenster und Erinnerungen, die in den Kreis ragen (Befund Orchestrator: „Schorle-Susi ist jetzt bei dir.“, „Erinnerung – Der Stempel“)
 for(const el of document.querySelectorAll('#toast,.game-popup,.memory-card')){const t=el.textContent.trim();if(!t||!vis(el)||el.classList.contains('memory-card')&&!el.classList.contains('show'))continue;if(near(el.getBoundingClientRect()))out.push({kind:el.id==='toast'?'meldung':el.classList.contains('memory-card')?'erinnerung':'fenster',sel:el.id||el.dataset.window||el.className,text:t.slice(0,40)});}
 // HUD-Band oben mittig (Ansage unter dem Bossrahmen): gehört zum HUD, wird mit Abstand zum Boss gemeldet
 for(const el of document.querySelectorAll('.boss-announce b')){const t=el.textContent.trim();if(!t||!vis(el))continue;const q=el.getBoundingClientRect();hud.push({sel:el.id||'Ansage',text:t.slice(0,40),dist:Math.round(Math.hypot(Math.max(q.left-c.x,0,c.x-q.right),Math.max(q.top-c.y,0,c.y-q.bottom)))});}
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
  await read(`const M=await import('/content/index.js');const c=g.companions[3];g.dismissCompanion(c.id);g.hireCompanion(c.id,{free:true});g.emit('memory',{fragment:M.MEMORY_FRAGMENTS.find(f=>!g.memories.seen.includes(f.id))||M.MEMORY_FRAGMENTS[0]});const c2=g.companions.at(-1);g.bark(c2,'Endlich Bewegung.','companion');g.sct({area:'note',kind:'proc',text:'IN FAHRT',color:'#ffd37a'});g.sct({area:'note',kind:'momentum',text:'SCHWUNG ▲▲',iconKey:'boots'});return 1`);
  await wait(250);await pause();
  const clar=await read(`const lbl=document.querySelector('.region-label'),tp=document.querySelector('#targetPanel'),bf=document.querySelector('.boss-frame').getBoundingClientRect(),an=document.querySelector('.boss-announce'),ar=an.getBoundingClientRect();
   return {fight:document.body.classList.contains('dg-fight'),boss:document.body.classList.contains('boss-fight'),target:document.body.classList.contains('boss-target'),zoneShown:lbl.classList.contains('zone-show'),zoneVisible:getComputedStyle(lbl).visibility!=='hidden'&&+getComputedStyle(lbl).opacity>.05,
    targetPanel:getComputedStyle(tp).display,announce:an.hidden?null:{top:Math.round(ar.top),frameBottom:Math.round(bf.bottom),text:an.textContent.trim()},mercBubble:(window.mertloch.state().speech||[]).some(x=>String(x.enemyId).startsWith('merc')),bubbles:(window.mertloch.state().speech||[]).length,memory:[...document.querySelectorAll('.memory-card.show,.game-popup[data-window="memory"]')].some(m=>getComputedStyle(m).visibility!=='hidden'&&getComputedStyle(m).display!=='none'),toast:document.querySelector('#toast')?.textContent||'',say:document.querySelector('.bf-say:not([hidden]) q')?.textContent||'',
    proc:[...document.querySelectorAll('#sct .sct-note .sct-row')].map(r=>({text:r.textContent.trim(),textShown:getComputedStyle(r.querySelector('b')).display!=='none'}))}`);
  assert.ok(clar.fight&&clar.boss&&clar.target,'Bosskampf erkannt '+JSON.stringify(clar));
  assert.equal(clar.zoneVisible,false,'kein Raumtitel im Bosskampf '+JSON.stringify(clar));
  assert.equal(clar.targetPanel,'none','Zielrahmen weg, wenn der Boss das Ziel ist');
  assert.equal(clar.mercBubble,false,'keine Söldner-Sprechblase in der Welt');assert.equal(clar.bubbles,0,'keine Blase in der Welt, der Boss spricht im Bossrahmen');
  assert.equal(clar.memory,false,'keine Erinnerung im Bosskampf');assert.ok(!/bei dir/.test(clar.toast),'Söldner-Meldung im Chat, nicht als Kurzmeldung '+clar.toast);
  assert.ok(clar.proc.length>=1&&clar.proc.every(p=>!p.textShown),'Kampfrufe im Bosskampf nur als Symbol '+JSON.stringify(clar.proc));
  const near=await textsNear(bigb);await shot('01-bosskampf-behauptung');
  assert.ok(near.items.length<=1,'höchstens ein Textelement um Big B '+JSON.stringify(near));
  const fb=await read(`return Math.round(document.querySelector('.boss-frame').getBoundingClientRect().bottom)`);for(const i of near.items.filter(i=>i.kind==='blase'))assert.ok(i.y>=fb,'Blase nicht unter dem Bossrahmen '+JSON.stringify({i,fb}));
  ok('Bosskampf (Behauptung): kein Raumtitel, kein Zielrahmen, keine Blase in der Welt (Boss im Rahmen'+(clar.say?': „'+clar.say.slice(0,30)+'…“':'')+'), keine Erinnerung, Söldner-Meldung im Chat, Kampfrufe nur als Symbol; um Big B (250 px) '+near.items.length+' Textelement ('+near.items.map(i=>i.kind+':'+i.sel).join(', ')+'), HUD-Bänder: '+(near.hud.map(h=>h.sel+' „'+h.text+'“ '+h.dist+' px').join(', ')||'keine'));
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
 // ───────────────────────────────── Hilfen für die Teile 3–9
 const interaction=()=>read(`const it=g.interaction();return it?{kind:it.kind,act:it.act||'',name:it.name||'',id:it.id||''}:null`);
 const tipAt=async sel=>{const pts=await read(`return [...document.querySelectorAll(${JSON.stringify(sel)})].map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})`);const out=[];
  for(const p of pts){await s.hover(p);await wait(200);out.push(await read(`const t=document.querySelector('#itemTooltip');const v=t&&!t.hidden&&getComputedStyle(t).display!=='none'&&t.textContent.trim();return v||''`));}await s.hover({x:5,y:5});return out;};
 const lootWindow=async()=>{for(let i=0;i<16&&!(await read(`return !!document.querySelector('.game-popup[data-window="loot"]')`));i++)await wait(250);return read(`const w=document.querySelector('.game-popup[data-window="loot"]');return w?{head:w.querySelector('.loot-moment-title')?.textContent||w.textContent.slice(0,60),items:w.querySelectorAll('[data-loot-item]').length}:null`);};
 const takeLoot=async()=>{await read(`document.querySelector('.game-popup[data-window="loot"] [data-take-loot]')?.click();return 1`);await wait(300);await closeAll();};
 const kill=js=>read(`for(const e of g.enemies.filter(e=>${js}))if(e.hp>0)g.kill(e);return 1`);
 const tracker=()=>read(`const b=document.querySelector('.quest-panel .dg-track');return b?[...b.querySelectorAll('.dg-track-row')].map(r=>({word:r.querySelector('.dg-track-word')?.textContent||'',count:r.querySelector('.qt-count')?.textContent||'',icons:[...r.querySelectorAll('canvas[data-dicon]')].map(c=>c.dataset.dicon),tips:[...r.querySelectorAll('.dg-track-ico')].map(i=>i.dataset.tooltipLabel)})):null`);
 // ───────────────────────────────── 3 · Verfolgung: Flügel, Siegel, Beweise mit Tooltip (Name und Bedeutung)
 if(want(3)){
  await start({w:1600,h:900});await setup();await wait(800);
  const t=await tracker();assert.ok(t&&t.length>=2,'Verfolgung im Dungeon '+JSON.stringify(t));assert.equal(t[0].word,'Siegel');assert.equal(t[1].word,'Beweise');assert.ok(t[0].tips.every(Boolean)&&t[1].tips.length===3,'jedes Symbol mit Tooltip '+JSON.stringify(t));
  const tips=await tipAt('.quest-panel .dg-track-ico');assert.ok(tips.length>=4&&tips.every(x=>x.length>5),'Tooltips erscheinen beim Überfahren '+JSON.stringify(tips));
  await s.hover(await read(`const r=document.querySelectorAll('.quest-panel .dg-track-ico')[1].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}`));await wait(250);await shot('10-verfolgung-tooltip');await s.hover({x:5,y:5});
  ok('Verfolgung: Zeilen „'+t[0].word+' '+t[0].count+'“ und „'+t[1].word+' '+t[1].count+'“, jedes Symbol mit Tooltip ('+tips.map(x=>x.split(/\n/)[0].slice(0,26)).join(' | ')+')');
 }
 // ───────────────────────────────── 4 · Flügel: Siegelträger öffnet die Abkürzung, kleine Truhe, Flügelstand, Tagesreset
 if(want(4)){
  await start({w:1600,h:900});await setup();await kill(`e.bossId==='gerd'`);await wait(900);/* Dungeon-Fix 3: Gerds Beute-Moment wartet jetzt ohne Frist auf den Helden in der Arena (dort steht die kleine Truhe) und läge mit F
   zuerst im Weg – er ist nicht Teil dieses Teils */await read(`g.rpg.loot=g.rpg.loot.filter(b=>!(b.moment&&b.room));return 1`);
  const sc=await read(`const r=g.dungeonRun;return {unlocked:[...r.unlocked],daily:g.dungeons['schloss-bigb'].daily.shortcuts,wings:g.dungeons['schloss-bigb'].daily.wings}`);assert.ok(sc.unlocked.includes('treppe-zugbruecke')&&sc.daily.includes('treppe-zugbruecke'),'Kette ist Abkürzung für heute '+JSON.stringify(sc));assert.deepEqual(sc.wings,['burghof']);
  await closeAll();const w=await read(`const w=g.dungeonRun.def.wings[0].chest;return w`);await place('e0',w.x,w.y+1.2);await wait(900);const it=await interaction();assert.equal(it?.act,'wingChest','kleine Truhe bietet sich an '+JSON.stringify(it));await shot('11-kleine-truhe');
  await b.press('f');const lw=await lootWindow();assert.ok(lw&&lw.items===1&&/Truhe/.test(lw.head),'Beute-Moment der kleinen Truhe '+JSON.stringify(lw));await shot('12-kleine-truhe-beute');await takeLoot();
  const t=await tracker();assert.ok(t[0].count.startsWith('1/'),'Flügelstand in der Verfolgung '+t[0].count);assert.equal(t[0].icons[0],'seal');
  // Neuer Durchgang am selben Tag: Gerd steht wieder, die Kette bleibt offen
  await read(`g.leaveDungeon({force:true});g.time+=1900;return 1`);await wait(300);await read(`g.enterDungeon('schloss-bigb',{force:true});return 1`);await wait(600);
  const again=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');return {gerd:gerd.hp>0,step:(Object.assign(g.player,D.toWorld(g.dungeonRun.def,'e0',5,23)),g.player.inCombat=0,g.dungeonStep('treppe-zugbruecke','a')),floor:D.floorAt(g.dungeonRun.def,g.player.x,g.player.y)}`);
  assert.ok(again.gerd&&again.step&&again.floor==='k1','neuer Durchgang: Gerd steht, Kette offen '+JSON.stringify(again));
  await read(`g.leaveDungeon({force:true});return 1`);await wait(500);await read(`const d=D.dungeonEntrance(g);Object.assign(g.player,{x:d.x,y:d.y});return 1`);await wait(400);await b.press('f');await wait(900);
  const card=await read(`const c=document.querySelector('[data-dg-entry]');return c?{wings:c.querySelector('[data-dg-wings]')?.textContent||'',feats:c.querySelector('[data-dg-feats]')?.textContent||''}:null`);assert.ok(card&&card.wings.includes('1/'),'Eingangskarte zeigt den Flügelstand '+JSON.stringify(card));
  const au=await s.audit('dungeonEntry');assert.equal(au.over,'','Eingangskarte scrollt nicht '+JSON.stringify(au));await shot('13-eingangskarte-fluegel');await closeAll();
  ok('Flügel Burghof: Gerd öffnet die Kette als Abkürzung bis zum Tagesreset (im neuen Durchgang steht Gerd, die Kette ist offen), kleine Truhe mit einem Teil, Flügelstand in Verfolgung und Eingangskarte');
 }
 // ───────────────────────────────── 5 · Beweis finden und im Thronsaal vorlegen – Symbol im Bossrahmen
 if(want(5)){
  await start({w:1600,h:900});await setup();const f=await read(`return g.dungeonRun.def.evidence.finds.leihschein`);await place(f.floor,f.x,f.y+1);await wait(900);
  let it=await interaction();assert.equal(it?.act,'find','Fundstelle Pelzmantel '+JSON.stringify(it));await shot('14-pelzmantel');await b.press('f');await wait(500);
  const found=await read(`return {found:[...g.dungeonRun.found],toast:document.querySelector('#toast')?.textContent||''}`);assert.deepEqual(found.found,['leihschein']);
  const t=await tracker();assert.ok(t[1].icons.includes('lens-found'),'Verfolgung: gefunden, noch nicht vorgelegt '+JSON.stringify(t[1]));
  await read(`const r=g.dungeonRun;r.seals.add('siegel-gerd');r.version++;return 1`);/* Dungeon-Fix 5: solange Big B auf seine Einleitung wartet, legt das Ansprechen am Thron die Beweise vor (kein Vorlegen mehr an der Tresortür) */await place('k2',54,19.5);await wait(900);
  it=await interaction();assert.match(it?.name||'',/Beweise vorlegen/,'Vorlegen im Thronsaal '+JSON.stringify(it));await b.press('f');await wait(1400);
  const shown=await read(`return {ev:[...g.dungeonRun.evidence],bubble:(window.mertloch.state().speech||[]).length}`);assert.deepEqual(shown.ev,['leihschein']);await shot('15-beweis-vorgelegt');
  await read(`const b=${bigb};b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;A.startAuto(g);g.adminGod=true;return 1`);await wait(1200);
  const chips=await read(`return [...document.querySelectorAll('.bf-status .bf-chip')].map(c=>c.dataset.tooltipNote)`);assert.ok(chips.some(n=>/Leihschein/.test(n)),'Symbol im Bossrahmen '+JSON.stringify(chips));await pause();await shot('16-bossrahmen-beweis');await pause(false);
  await read(`g.adminGod=false;return 1`);ok('Beweis: Leihschein im Pelzmantel auf dem Carport-Dach gefunden (Verfolgung: Lupe „gefunden“), im Thronsaal vorgelegt, Big B redet sich raus, Bossrahmen zeigt die Lupe mit Wirkung');
 }
 // ───────────────────────────────── 6 · Ereignisse: Vermieter Volker befreien, Beamer ausstecken
 if(want(6)){
  await start({w:1600,h:900});await setup(false);await read(`for(const e of g.enemies)if(!e.dungeonBoss&&e.pack!=='verlies'&&e.dungeonKind!=='schlossgespenst'){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}return 1`);
  const ev=await read(`return g.dungeonRun.def.events.find(e=>e.id==='volker')`);await place(ev.floor,ev.x+.5,ev.y);await wait(700);let it=await interaction();assert.equal(it?.act,'guarded','erst die Wachen '+JSON.stringify(it));
  await kill(`e.pack==='verlies'`);await read(`g.player.inCombat=0;return 1`);await wait(900);it=await interaction();assert.equal(it?.act,'event');await b.press('f');await wait(2000);
  const v=await read(`const r=g.dungeonRun;return {freed:r.freed,found:[...r.found],lift:r.unlocked.has('aufzug')}`);assert.ok(v.freed&&v.found.includes('mietvertrag')&&v.lift,'Volker frei '+JSON.stringify(v));await shot('17-volker-befreit');
  const bm=await read(`return g.dungeonRun.def.events.find(e=>e.id==='beamer')`);await read(`const gh=g.enemies.find(e=>e.dungeonKind==='schlossgespenst');Object.assign(g.player,g.world.findClear(gh.x,gh.y+30,9));gh.aggro=true;gh.ai='combat';g.target=gh;g.player.inCombat=7;A.startAuto(g);g.adminGod=true;return 1`);
  await fast(4,'false',`g.enemies.find(e=>e.dungeonKind==='schlossgespenst')`);const imm=await read(`const gh=g.enemies.find(e=>e.dungeonKind==='schlossgespenst');return {hp:gh.hp,max:gh.maxHp}`);assert.equal(imm.hp,imm.max,'Gespenst unverwundbar, solange der Beamer läuft');
  await place(bm.floor,bm.x,bm.y+1.2);await wait(300);await pause();await shot('18-beamer');await pause(false);it=await interaction();assert.equal(it?.act,'event','Beamer ausstecken '+JSON.stringify(it));await b.press('f');await wait(600);
  const gone=await read(`const gh=g.enemies.find(e=>e.dungeonKind==='schlossgespenst');return {hp:gh.hp,beamer:g.dungeonRun.beamer}`);assert.ok(gone.beamer&&!(gone.hp>0),'Gespenst weg '+JSON.stringify(gone));await shot('19-beamer-aus');await read(`g.adminGod=false;return 1`);
  ok('Ereignisse: Volker hinter dem Fahrradschloss erst nach den Wachen frei (Mietvertrag, Aufzug offen), Gespenst unverwundbar bis der Beamer ausgesteckt ist – dann „nur ein Film“');
 }
 // ───────────────────────────────── 7 · Händler Vermieter Volker: Fenster ohne Scrollen, Tausch
 if(want(7)){
  await start({w:1600,h:900});await setup();await read(`g.dungeons['schloss-bigb'].volker=true;g.dungeons['schloss-bigb'].marks=160;return 1`);const v=await read(`return g.dungeonRun.def.vendor`);await place(v.floor,v.x+1.2,v.y);await wait(900);
  const it=await interaction();assert.equal(it?.act,'vendor','Händler im Hof '+JSON.stringify(it));await b.press('f');await wait(900);
  const win=await read(`const w=document.querySelector('.game-popup[data-window="volker"]');return w?{offers:[...w.querySelectorAll('[data-dv-offer]')].map(o=>o.dataset.dvOffer),marks:w.querySelector('.dv-marks b')?.textContent}:null`);assert.ok(win&&win.offers.includes('gaesteliste'),'Fenster mit Ware '+JSON.stringify(win));
  const au=await s.audit('volker');assert.equal(au.over,'','Händlerfenster scrollt nicht '+JSON.stringify(au));assert.deepEqual(au.scrollers,[]);
  await s.hover('.game-popup[data-window="volker"] [data-dv-offer="gaesteliste"] .dv-item');await wait(300);const tipText=await read(`return document.querySelector('#itemTooltip')?.textContent||''`);await shot('20-haendler');await s.hover({x:5,y:5});
  await s.click('.game-popup[data-window="volker"] [data-dv-buy="gaesteliste"]');await wait(600);
  const after=await read(`return {marks:g.dungeons['schloss-bigb'].marks,inv:g.rpg.inventory.some(x=>x.id==='gaesteliste'),owned:document.querySelector('.game-popup[data-window="volker"] [data-dv-offer="gaesteliste"]')?.className||''}`);
  assert.ok(after.inv&&after.marks===160-DUNGEON_E4B.prices.gerd&&/owned/.test(after.owned),'Tausch '+JSON.stringify(after));await shot('21-haendler-getauscht');await closeAll();
  ok('Händler Vermieter Volker im Hof: Fenster ohne Scrollen, '+win.offers.length+' Waren ('+win.offers.join(', ')+'), Gegenstands-Tooltip „'+tipText.slice(0,30)+'…“, Tausch Gästeliste gegen '+DUNGEON_E4B.prices.gerd+' Siegelmarken');
 }
 // ───────────────────────────────── 8 · Erfolge und Titel: Figur-Fenster, Bestzeit auf der Eingangskarte
 if(want(8)){
  await start({w:1600,h:900});await setup();await kill(`e.dungeonBoss&&(e.dungeonBoss.seal||e.bossId==='rita')`);await read(`const r=g.dungeonRun;for(const id of r.def.evidence.ids)r.evidence.add(id);const b=${bigb};b.aggro=true;b.ai='combat';g.adminGod=true;return 1`);
  await fast(2);await kill(`e.bossId==='bigb'`);await wait(600);const rec=await read(`const r=g.dungeons['schloss-bigb'];return {feats:r.feats,best:r.best}`);assert.ok(rec.feats.includes('beweislast'),'Beweislast '+JSON.stringify(rec));
  await read(`g.adminGod=false;g.player.inCombat=0;return 1`);await closeAll();await b.press('c');await wait(900);
  const badge=await read(`const b=document.querySelector('.game-popup[data-window="person"] .dg-title-badge');return b?{label:b.dataset.tooltipLabel,note:b.dataset.tooltipNote}:null`);assert.ok(badge&&badge.label==='Mieterschützer','Titel im Figur-Fenster '+JSON.stringify(badge));
  const au=await s.audit('person');assert.equal(au.over,'','Figur-Fenster scrollt nicht '+JSON.stringify(au));
  await s.hover('.game-popup[data-window="person"] .dg-title-badge');await wait(300);const tip=await read(`return document.querySelector('#itemTooltip')?.textContent||''`);assert.match(tip,/Mieterschützer/);await shot('22-titel-figur');await s.hover({x:5,y:5});await closeAll();
  await read(`g.leaveDungeon({force:true});return 1`);await wait(500);await read(`const d=D.dungeonEntrance(g);Object.assign(g.player,{x:d.x,y:d.y});return 1`);await wait(400);await b.press('f');await wait(900);
  const card=await read(`const c=document.querySelector('[data-dg-entry]');return c?{best:[...c.querySelectorAll('.dg-chip')].map(x=>x.textContent)[2]||'',feats:c.querySelector('[data-dg-feats]')?.textContent||''}:null`);assert.ok(card&&/\d+:\d\d/.test(card.best),'Bestzeit statt „–“ '+JSON.stringify(card));await shot('23-eingangskarte-bestzeit');
  ok('Erfolge: '+rec.feats.join(', ')+'; Titel „Mieterschützer“ als Medaille am Namen im Figur-Fenster (Tooltip), Eingangskarte mit Bestzeit '+card.best+' und Erfolgen '+card.feats);
 }
 // ───────────────────────────────── 9 · Handy hoch: Bosskampf ohne Raumtitel und Zielrahmen, Händlerfenster ohne Scrollen
 if(want(9)){
  await start({touch:true,w:390,h:844,safe:true});await setup();await read(`const r=g.dungeonRun;r.seals.add('siegel-gerd');r.version++;return 1`);await place('k2',52,24);
  await read(`const b=${bigb};b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;A.startAuto(g);g.adminGod=true;return 1`);await wait(900);await fast(30,`(()=>{const k=${bigb}.cast;return k?.type==='kanone'&&k.told===false;})()`);await pause();
  const m=await read(`const tp=document.querySelector('#targetPanel');return {target:getComputedStyle(tp).display,fight:document.body.classList.contains('dg-fight')}`);assert.equal(m.target,'none');assert.ok(m.fight);await shot('24-handy-bosskampf');await pause(false);await read(`g.adminGod=false;g.enemies.forEach(e=>{if(e.bossId==='bigb'){e.aggro=false;e.ai='returning';}});return 1`);
  await read(`g.dungeons['schloss-bigb'].volker=true;g.dungeons['schloss-bigb'].marks=40;return 1`);await wait(1500);const v=await read(`return g.dungeonRun.def.vendor`);await place(v.floor,v.x+1.2,v.y);await wait(900);
  const it=await interaction();assert.equal(it?.act,'vendor');await b.press('f');await wait(900);
  const au=await s.audit('volker');assert.equal(au.over,'','Händler am Handy ohne Scrollen '+JSON.stringify(au));assert.equal(au.offscreen,false);await shot('25-handy-haendler');
  ok('Handy hoch: Bosskampf ohne Zielrahmen (Bossrahmen reicht), Händlerfenster im Bild ohne Scrollen');
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
 console.log('dungeon-e4b-check: '+checks.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
