// Browserprüfung Dungeon-Fix 3 (2026-09-26, Big-B-Abnahme des Prüfers Build #721, docs/DUNGEON-FIX3-2026-09-26.md). Big B wird zweimal
// gespielt – mit echter Maus (CDP Input.dispatchMouseEvent) und echten Tasten, Held Stufe 10, Tresenbrecher (dieter-brawl), typische
// Ausrüstung OHNE Schild, vier Söldner, Testzugang `bigb` (scripts/playtest-save.mjs) wie beim Prüfer:
//  1 Lauf ohne Tod: Beweise vorlegen (F), Rechtsklick auf Big B, ein Spieler-Bot weicht aus (Nachsatz abwarten), unterbricht, weicht dem
//    Siegelring aus. Nach dem Sieg: Beute-Moment öffnet sich, Erfolg als kurze Einblendung oben, Endtruhe sichtbar mitten im Saal –
//    Rechtsklick öffnet die Dreierwahl, ein Teil gewählt; Verfolgung „Hinterausgang“ angeklickt, Schild zu sehen, Rechtsklick hinaus.
//  2 Lauf mit Tod in der Schlussphase: erster Tod (Heilerin hilft im Kampf auf), zweiter Tod nach dem Aufhelfen. Sterbefenster über der
//    Aktionsleiste (Bossrahmen frei), Todesschlag mit Namen; im Kampf „Am Kontrollpunkt aufstehen“, nach dem Sieg „Hier aufstehen“;
//    Aufstieg als Geist ohne volles Leben; die Heilerin hilft nach dem Kampf auf; Beute-Moment, Endtruhe.
//  3 Warnleiste in beiden Läufen (je ~0,3 s gemessen): jede Zeile mit Taste, nach dem Nachsatz eine Handlung mit Pfeil statt des Zitats,
//    kein abgeschnittener Text, kein Überlapp mit aktiven Warnflächen; Parieren ohne Schild → „Ausweichen [Leer]“.
//  4 Bildmitte frei: keine Kurzmeldung, keine Fehlerzeile, keine Einblendung in der Bildmitte während des Kampfs; Fehlertext einzeilig unter
//    dem Bossrahmen.
//  5 Nebenbefunde: Karte (M) und Verfolgung zeigen dieselben Beweise; Chat-Reiter mit echter Maus; Reaktionszeit nach dem Nachsatz.
// Aufruf: CDP_PORT=9712 SERVER_PORT=4512 BOOT_TRIES=450 node scripts/dungeon-fix3-check.mjs   (ONLY=1,2,… einzelne Teile; Teil 3–4 messen
// in den Läufen 1 und 2 mit). Bilder: visual-review/dungeon-fix3/*.jpg (lokal, nicht im Repo).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/dungeon-fix3';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9712,serverPort:4512});const {b,read,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const results={};
// ── Maus und Tasten ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(50);await mouse(p,'mouseReleased',button);await wait(200);};
const held=new Set();
async function hold(keys){for(const k of [...held])if(!keys.includes(k)){await b.key(k,'keyUp');held.delete(k);}for(const k of keys)if(!held.has(k)){await b.key(k,'keyDown');held.add(k);}}
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top};`);
const elCenter=sel=>read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);
// ── Testheld wie beim Prüfer ────────────────────────────────────────────────────────────────────────────────────────────────
async function loadBigB(tag){
 const built=buildPlaytestSave({preset:'bigb',classId:'dieter',spec:'dieter-brawl',gear:'typical',coins:600}),code=snippet(built,'Fix Drei '+tag);
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<300&&!await b.evaluate('!!window.game');i++)await wait(150);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.BA=globalThis.__bossAlerts;window.BOT=${BOT};return 1`);
 const st=await read(`return {inside:g.instance?.kind,shield:!!g.rpg.equipment.offhand,spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.name),level:g.player.level}`);
 assert.equal(st.inside,'dungeon');assert.equal(st.shield,false,'typische Ausrüstung ohne Schild');assert.equal(st.spec,'dieter-brawl');assert.equal(st.mercs.length,4);return st;}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,9));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+10+Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
// ── Spieler-Bot (im Browser): Gefahr → Laufrichtung, Unterbrechen, Siegelring; Messung der Warnleiste und der Bildmitte ───────────
const BOT=`{
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,interrupt:false,dodge:false,near:false,phase:boss?Math.round(boss.hp/boss.maxHp*100):0,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  const k=boss.cast;out.interrupt=!!(k?.interruptible&&(g.cooldowns.interrupt||0)<=0);
  const sc=boss.sideCast;out.dodge=!!(sc&&(sc.focus||'player')==='player'&&sc.remaining<.38);
  out.near=Math.hypot(boss.x-p.x,boss.y-p.y)<70;out.claim=!!(k?.lie&&k.told===false);out.hp=Math.round(p.hp/p.maxHp*100);return out;},
 /** Warnleiste gegen aktive Warnflächen (Bildschirm), Zeilen mit Taste, Handlung nach dem Nachsatz, abgeschnittene Texte, Bildmitte. */
 measure(g){const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width,W=innerWidth,H=innerHeight;
  const sx=x=>(x-st.camera.x+st.width/2)*k+cv.left,sy=y=>(y-st.camera.y+st.height/2)/st.height*cv.height+cv.top;
  const bar=document.querySelector('.boss-alerts'),br=bar&&bar.children.length?bar.getBoundingClientRect():null,hit=[];
  if(br)for(const a of D.activeWarnAreas(g)){const r={l:sx(a.box.x),t:sy(a.box.y),r:sx(a.box.x+a.box.w),b:sy(a.box.y+a.box.h)};if(r.l<br.right&&br.left<r.r&&r.t<br.bottom&&br.top<r.b)hit.push(a.kind);}
  const rows=[...(bar?.querySelectorAll('.ba-row')||[])].map(el=>{const t=el.querySelector('b'),a=el.querySelector('.ba-act')||t,s=el.querySelector('small');return {hint:t?.textContent||'',name:s?.textContent||'',key:el.querySelector('kbd:not(.ba-side)')?.textContent||'',hold:el.classList.contains('ba-hold'),info:el.classList.contains('ba-info')/* Dungeon-Fix 4: Mechanik auf einem Söldner */,arrow:!!el.querySelector('.ba-arrow'),alt:el.querySelector('.ba-alt')?.textContent||'',cut:!!a&&a.scrollWidth>a.clientWidth+1||!!s&&!s.classList.contains('ba-cut')&&s.scrollWidth>s.clientWidth+1,lie:[...el.classList].find(c=>c.startsWith('ba-lie-'))||'',done:el.classList.contains('ba-done')};});
  const mid=[...document.querySelectorAll('#toast.visible,.error-line.show,.milestone:not([hidden]),.boss-announce:not([hidden])')].filter(el=>{const r=el.getBoundingClientRect();return r.width>2&&getComputedStyle(el).visibility!=='hidden'&&+getComputedStyle(el).opacity>.05&&r.right>W*.3&&r.left<W*.7&&r.bottom>H*.28&&r.top<H*.72;}).map(el=>(el.id||el.className)+': '+el.textContent.trim().slice(0,60));
  const err=document.querySelector('.error-line.show'),er=err?.getBoundingClientRect(),frame=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect();
  const ds=document.querySelector('#deathScreen:not([hidden])')?.getBoundingClientRect();
  return {bar:br?{x:Math.round(br.left),y:Math.round(br.top),w:Math.round(br.width),h:Math.round(br.height)}:null,hit,rows,mid,err:err?{text:err.textContent,h:Math.round(er.height),top:Math.round(er.top),under:frame?er.top>=frame.bottom-1:null}:null,
   deathOverFrame:!!(ds&&frame&&ds.left<frame.right&&frame.left<ds.right&&ds.top<frame.bottom&&frame.top<ds.bottom),toast:document.querySelector('#toast.visible')?.textContent||'',fight:g.enemies.some(e=>e.bossId==='bigb'&&e.hp>0)/* Dungeon-Fix 4: Bildmitte nur, solange Big B steht – fällt er zwischen Schritt und Messung, zählt die Aufstiegs-Einblendung nicht als „im Kampf“ */};}
}`;
// ── Ein Big-B-Kampf mit echten Tasten ─────────────────────────────────────────────────────────────────────────────────────────
const log=[],meas={ring:new Set(),samples:0,hits:[],noKey:new Set(),cut:new Set(),quote:[],actions:new Set(),mid:new Set(),err:[],deathOverFrame:0,truthTimes:[]};
function note(m){meas.samples++;if(m.hit.length)meas.hits.push(m.hit.join('+')+' @'+JSON.stringify(m.bar));for(const r of m.rows){if(r.done)continue;if(!r.key&&!r.hold)meas.noKey.add(r.hint+' · '+r.name);if(r.info)(meas.ringInfo||=new Set()).add(r.hint);else if(/Siegelring/.test(r.name))meas.ring.add(r.hint+(r.key?' ['+r.key+']':'')+(r.alt?' / '+r.alt:''));if(r.cut)meas.cut.add(r.hint+' · '+r.name);
 if(r.lie==='ba-lie-t'){if(/^[„…]/.test(r.hint))meas.quote.push(r.hint);else meas.actions.add(r.hint+(r.arrow?' ↔':''));}}if(m.fight)for(const x of m.mid)meas.mid.add(x);if(m.err)meas.err.push(m.err);if(m.deathOverFrame)meas.deathOverFrame++;}
async function fight({deaths=[],limit=520000}={}){
 const t0=Date.now();let k=0,lastRe=0,lastAtk=0,died=0,revivedAt=null,reviveCheck=null,res={};
 while(Date.now()-t0<limit){
  const st=await read(`return BOT.step(g)`);
  if(!st.alive){await hold([]);res.won=true;break;}
  // Todesfälle in der Schlussphase (Lauf 2): Big B trifft den Helden mit einem Autoangriff (Todesschlag mit Namen)
  if(deaths.length&&died<deaths.length&&st.phase<=deaths[died]&&(await read(`return !g.dead&&g.companions.some(c=>c.id==='merc-schorle-susi'&&c.state!=='down'&&c.hp>0)`))){/* nur mit stehender Heilerin: der Lauf soll das Aufhelfen prüfen, nicht am Zufall eines Söldner-Wipes hängen */await hold([]);
   await read(`const b=g.enemies.find(e=>e.bossId==='bigb');g.adminGod=false;g.player.invulnerable=0;g.player.parry=0;b.lastCast=null;g.hitPlayer(b,g.player.maxHp*30,false);return g.dead`);died++;
   await wait(700);res['death'+died]=await read(`const ds=document.querySelector('#deathScreen');return {shown:!ds.hidden,cause:ds.querySelector('.ds-cause')?.textContent.trim()||'',btn:ds.querySelector('[data-ds-wake]')?.textContent||'',note:ds.querySelector('[data-ds-wake]')?.dataset.tooltipNote||'',phase:${st.phase}}`);
   await shot('2'+died+'-tod-'+died);}
  const dead=await read(`return g.dead`);
  if(!dead){if(st.move){const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}
   else{await hold([]);
    if(st.interrupt)await b.press('q');
    if(st.dodge)await b.press(' ');
    if(!st.near&&!st.claim&&Date.now()-lastRe>2500){const p=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);if(p){await clickAt({x:p.x,y:p.y-22},'right');lastRe=Date.now();}}
    else if(st.near&&Date.now()-lastAtk>900){await b.press(['2','6','7'][k++%3]);lastAtk=Date.now();}}}
  else await hold([]);
  const m=await read(`return BOT.measure(g)`);note(m);
  if(Date.now()-t0>20000&&!res.shotFight){res.shotFight=true;await shot(deaths.length?'20-kampf':'10-kampf');}
  if(m.rows.some(r=>r.lie==='ba-lie-t')&&!res.shotTruth){res.shotTruth=true;await shot((deaths.length?'2':'1')+'1-nachsatz-handlung');}
  log.push(st.phase);await wait(120);}
 await hold([]);res.seconds=Math.round((Date.now()-t0)/1000);return res;}
/** Warten, bis cond (JS) wahr ist. */
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
/** Nach dem Sieg: Beute-Moment, Erfolg oben, Endtruhe per Rechtsklick, Wahl per Maus. tag = '1' bzw. '2' für die Bilder. */
async function afterWin(tag,{exit=false}={}){
 const loot=await until(`const w=document.querySelector('.game-popup[data-window="loot"]');return w&&!w.hidden?w.innerText.slice(0,80):null`,25000);
 await shot(tag+'5-beute-moment');assert.ok(loot,'Beute-Moment öffnet sich nach dem Sieg');
 const take=await elCenter('.game-popup[data-window="loot"] [data-take-loot]');if(take)await clickAt(take);else await closeAll();await wait(500);await closeAll();
 const feat=await until(`const m=document.querySelector('.milestone.milestone-feat.show');return m?{text:m.innerText.replace(/\\s+/g,' ').trim(),top:Math.round(m.getBoundingClientRect().top),h:Math.round(m.getBoundingClientRect().height)}:null`,15000,120);
 if(feat)await shot(tag+'6-erfolg-oben');
 // Endtruhe mitten im Thronsaal: sichtbar, Rechtsklick → hinlaufen → Rechtsklick öffnet die Wahl
 await wait(800);const cp=await screen(`D.toWorld(g.dungeonRun.def,'k2',g.dungeonRun.def.chest.x,g.dungeonRun.def.chest.y)`);
 const vis=await read(`const p=${JSON.stringify(cp)};const el=document.elementFromPoint(p.x,p.y-8);return {inView:p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight,top:el?.id||el?.className||''}`);
 await shot(tag+'7-endtruhe-sichtbar');
 for(let i=0;i<3;i++){/* Dungeon-Fix 5: liegt die Truhe hinter der Klassenanzeige (Held stand am Thron), erst ein paar Schritte auf sie zu (S) */for(let k=0;k<8;k++){const q=await screen(`D.toWorld(g.dungeonRun.def,'k2',g.dungeonRun.def.chest.x,g.dungeonRun.def.chest.y)`);if(await read(`return document.elementFromPoint(${q.x},${q.y-10})?.id==='world'`))break;await b.key('s','keyDown');await wait(200);await b.key('s','keyUp');await wait(300);}
  const p=await screen(`D.toWorld(g.dungeonRun.def,'k2',g.dungeonRun.def.chest.x,g.dungeonRun.def.chest.y)`);await clickAt({x:p.x,y:p.y-10},'right');
  const open=await until(`return !!document.querySelector('.game-popup[data-window="loot"] [data-loot-choice]')`,i?8000:3000);if(open)break;await until(`const c=D.toWorld(g.dungeonRun.def,'k2',g.dungeonRun.def.chest.x,g.dungeonRun.def.chest.y);return Math.hypot(c.x-g.player.x,c.y-g.player.y)<30&&!g.moveTo`,9000);}
 const choice=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return w?{choice:w.querySelector('[data-loot-choice]')?.textContent.trim()||'',items:w.querySelectorAll('[data-loot-item]').length}:null`);
 await shot(tag+'8-endtruhe-wahl');
 const slot=await read(`const el=document.querySelector('.game-popup[data-window="loot"] [data-loot-item]');if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:el.dataset.lootItem}`);
 const bag0=await read(`return g.rpg.inventory.map(e=>e.id)`);if(slot)await clickAt(slot);await wait(600);
 const picked=await read(`return {inBag:g.rpg.inventory.some(e=>e.id===${JSON.stringify(slot?.id||'')}),newItems:g.rpg.inventory.filter(e=>!${JSON.stringify(bag0)}.includes(e.id)).map(e=>e.id),bagLeft:g.rpg.loot.filter(x=>String(x.id).startsWith('chest-')).length}`);
 await closeAll();
 const r={loot,feat,chest:vis,choice,picked};
 if(exit){// Verfolgung: Zeile „Hinterausgang“ anklicken → Held läuft hin; Schild sichtbar; Rechtsklick auf die Tür → hinaus
  const row=await elCenter('[data-dg-track-end="exit"]');r.trackRow=!!row;if(row){await clickAt(row);}
  await until(`const b=g.dungeonRun?.def.backExit;if(!b)return true;const p=D.toWorld(g.dungeonRun.def,'k2',b.x,b.y);return Math.hypot(p.x-g.player.x,p.y-g.player.y)<40`,30000);await wait(900);await s.settle();
  await shot(tag+'9-hinterausgang-schild');const ep=await screen(`(b=>D.toWorld(g.dungeonRun.def,'k2',b.x,b.y))(g.dungeonRun.def.backExit)`);r.exitView=ep.y>0&&ep.y<innerHeightOf();
  await clickAt({x:ep.x,y:ep.y-34},'right');const out=await until(`return !g.instance`,8000);r.outside=!!out;await wait(1500);await shot(tag+'9b-draussen-burgstrasse');}
 return r;}
function innerHeightOf(){return 900;}

try{
 // ─────────────────────────────────────────────── 1 · Big B ohne Tod
 if(want(1)){
  const hero=await loadBigB('eins');
  // Beweise am Thron vorlegen (F; Dungeon-Fix 5: das Vorlegen an der Tresortür entfällt, solange Big B auf seine Einleitung wartet), dann Rechtsklick auf Big B
  await put('k2',54,23);await wait(900);await b.press('f');await wait(2500);const shown=await read(`return [...g.dungeonRun.evidence]`);
  const ev=await read(`const m=document.querySelector('.dm-side');return null`);
  await s.settle();const bp=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);await clickAt({x:bp.x,y:bp.y-22},'right');
  const res=await fight({limit:560000});results.run1={hero,shown,res,phases:log.slice(-3)};
  assert.ok(res.won,'Big B besiegt (Lauf 1)');const dead=await read(`return {dead:g.dead,deaths:g.dungeonRun.deaths|0}`);results.run1.dead=dead;
  assert.equal(dead.dead,false,'Held lebt');
  ok('Lauf 1: Big B besiegt ohne Tod ('+res.seconds+' s Echtzeit), Beweise vorgelegt: '+shown.length);
  const after=await afterWin('1',{exit:true});results.run1.after=after;
  assert.ok(after.feat&&after.feat.top<160,'Erfolg als Einblendung oben: '+JSON.stringify(after.feat));
  assert.ok(after.chest.inView,'Endtruhe im Bild');assert.match(after.choice?.choice||'',/1 \/ 3/,'Dreierwahl');assert.ok(after.picked.inBag,'gewähltes Teil im Rucksack');
  assert.ok(after.trackRow,'Verfolgung nennt den Hinterausgang');assert.ok(after.outside,'Hinterausgang führt hinaus');
  ok('Lauf 1 nach dem Sieg: Beute-Moment („'+after.loot.replace(/\s+/g,' ').slice(0,40)+'…“), Erfolg oben („'+after.feat.text+'“, '+after.feat.top+' px), Endtruhe im Bild, Rechtsklick → '+after.choice.choice+', gewählt per Maus, Verfolgung → Hinterausgang mit Schild, Rechtsklick → Burgstraße');
 }
 // ─────────────────────────────────────────────── 2 · Big B mit Tod in der Schlussphase
 if(want(2)){
  const hero=await loadBigB('zwei');await put('k2',50,22);await wait(700);await s.settle();
  const bp=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);await clickAt({x:bp.x,y:bp.y-22},'right');
  const res=await fight({deaths:[35,8],limit:600000});results.run2={hero,res};
  assert.ok(res.death1?.shown&&res.death2?.shown,'zweimal gefallen');assert.match(res.death1.cause,/Big B/);assert.ok(res.death1.cause.length>6,'Todesschlag mit Fähigkeit: '+res.death1.cause);
  assert.equal(res.death2.btn,'Kampf aufgeben','im Kampf: Aufgabe (Dungeon-Fix 4: zweitrangig, mit Bestätigung)');assert.match(res.death2.note,/Gibt den Kampf auf/);
  assert.ok(res.won,'Big B besiegt (Söldner allein)');
  const post=await read(`const ds=document.querySelector('#deathScreen'),btn=ds.querySelector('[data-ds-wake]');return {dead:g.dead,hp:g.player.hp,level:g.player.level,btn:btn?.textContent||'',note:btn?.dataset.tooltipNote||'',open:!ds.hidden}`);
  await shot('23-nach-dem-sieg-geist');results.run2.post=post;
  if(post.dead){assert.equal(post.btn,'Hier aufstehen','nach dem Sieg: kein „Kampf aufgeben“');assert.match(post.note,/nichts setzt zurück/);assert.equal(post.hp,0,'als Geist kein volles Leben trotz Aufstieg');}
  const up=await until(`return !g.dead&&{hp:g.player.hp,max:g.player.maxHp,level:g.player.level}`,20000);results.run2.up=up;
  assert.ok(up,'nach dem Sieg aufgeholfen');await shot('24-aufgeholfen');
  ok('Lauf 2: zweiter Tod in der Schlussphase ('+res.death2.phase+' %), im Kampf „'+res.death2.btn+'“; nach dem Sieg „'+(post.btn||'–')+'“, Stufe '+up.level+', aufgeholfen mit '+Math.round(up.hp)+'/'+up.max+'; Todesschlag „'+res.death1.cause+'“');
  const after=await afterWin('2');results.run2.after=after;assert.ok(after.loot,'Beute-Moment nach Tod');assert.match(after.choice?.choice||'',/1 \/ 3/);
  ok('Lauf 2 nach dem Sieg: Beute-Moment, Erfolg '+(after.feat?'oben („'+after.feat.text+'“)':'(keiner neu)')+', Endtruhe per Rechtsklick mit '+after.choice.choice);
  assert.equal(meas.deathOverFrame,0,'Sterbefenster verdeckt den Bossrahmen nie');ok('Sterbefenster über der Aktionsleiste, der Bossrahmen bleibt frei ('+meas.samples+' Messungen)');
 }
 // ─────────────────────────────────────────────── 3 · Warnleiste (in den Läufen gemessen)
 if(want(3)&&meas.samples){
  results.warn={ring:[...meas.ring],samples:meas.samples,hits:meas.hits.slice(0,12),noKey:[...meas.noKey],cut:[...meas.cut],quote:meas.quote.slice(0,6),actions:[...meas.actions]};console.log('Warnleiste',JSON.stringify(results.warn));
  assert.deepEqual(meas.hits,[],'Warnleiste überlappt aktive Warnflächen');assert.deepEqual([...meas.noKey],[],'Zeilen ohne Taste');assert.deepEqual([...meas.cut],[],'abgeschnittene Texte');
  assert.deepEqual(meas.quote,[],'nach dem Nachsatz steht eine Handlung, nicht das Zitat');assert.ok((meas.ring.size||meas.ringInfo?.size)&&[...meas.ring].every(x=>/^Ausweichen \[LEER\]$/i.test(x)),'Siegelring ohne Schild: Ausweichen [LEER], auf einem Söldner nur Info (Dungeon-Fix 4) – '+[...meas.ring].join(', ')+' | Info: '+[...(meas.ringInfo||[])].join(', '));assert.ok(meas.actions.size>0,'Handlungen gesehen');
  ok('Warnleiste in '+meas.samples+' Messungen: kein Überlapp mit aktiven Warnflächen, jede Zeile mit Taste, nichts abgeschnitten; Siegelring ohne Schild „'+[...meas.ring].join(' | ')+'“; nach dem Nachsatz: '+[...meas.actions].join(', '));
 }
 // ─────────────────────────────────────────────── 4 · Bildmitte frei
 if(want(4)&&meas.samples){
  results.center={mid:[...meas.mid],err:meas.err.slice(0,4)};assert.deepEqual([...meas.mid],[],'Text in der Bildmitte im Kampf');
  for(const e of meas.err){assert.ok(e.h<=24,'Fehlertext einzeilig: '+e.text+' ('+e.h+' px)');if(e.under!=null)assert.ok(e.under,'Fehlertext unter dem Bossrahmen');}
  ok('Bildmitte frei im Kampf ('+meas.samples+' Messungen); Fehlertexte: '+(meas.err.length?[...new Set(meas.err.map(e=>e.text))].join(' | ')+' – einzeilig unter dem Bossrahmen':'keine'));
 }
 // ─────────────────────────────────────────────── 5 · Nebenbefunde
 if(want(5)){
  await loadBigB('fuenf');await put('k2',49,26.5);await wait(700);
  // Karte (M) und Verfolgung: dieselbe Zahl, vor und nach dem Vorlegen
  const count=async()=>{await b.press('m');await wait(900);const r=await read(`const side=document.querySelector('.dm-side');const map=side?.querySelector('.dm-row:nth-child(2) b')?.textContent||'';const tr=[...document.querySelectorAll('.dg-track-row')].find(x=>x.querySelectorAll('[data-dicon^="lens"]').length)?.querySelector('.qt-count')?.textContent||'';return {map,tr}`);await b.press('m');await wait(400);await closeAll();return r;};
  const before=await count();await b.press('f');await wait(2400);const afterP=await count();results.evidence={before,after:afterP};
  assert.equal(before.map,before.tr,'vor dem Vorlegen gleich');assert.equal(afterP.map,afterP.tr,'nach dem Vorlegen gleich');
  ok('Beweise: Karte '+before.map+' = Verfolgung '+before.tr+' (gefunden), nach dem Vorlegen '+afterP.map+' = '+afterP.tr);
  // Chat-Reiter mit echter Maus: ohne Verweilen direkt klicken, Welt bekommt den Klick nicht
  await mouse({x:1000,y:420});await wait(700);
  const tabs=await read(`const w=document.querySelector('#chatWindow');return {active:w.classList.contains('active'),tabs:[...w.querySelectorAll('[data-chat-tab]')].map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.chatTab,x:r.x+r.width/2,y:r.y+r.height/2,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b||b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})}`);
  const pick=[];for(const id of ['events','loot']){const t=tabs.tabs.find(x=>x.id===id);if(!t)continue;await closeAll();await mouse({x:1000,y:420});await wait(600);await clickAt({x:t.x,y:t.y});await wait(250);
   pick.push(await read(`const w=document.querySelector('#chatWindow');return {id:${JSON.stringify(id)},active:w.classList.contains('active'),tab:w.querySelector('[aria-selected=true]')?.dataset.chatTab,moveTo:!!g.moveTo}`));}
  await shot('50-chat-reiter');results.chat={tabs:tabs.tabs,pick};
  for(const p of pick){assert.ok(p.active,'Chat geht auf ('+p.id+')');assert.equal(p.tab,p.id,'Reiter '+p.id+' gewählt');assert.equal(p.moveTo,false,'Welt bekam keinen Klick');}
  assert.ok(tabs.tabs.filter(t=>['events','loot'].includes(t.id)).every(t=>t.hit),'Reiter sind in Ruhe selbst das oberste Element (kein Abfangen durch die Zeichenfläche)');
  ok('Chat-Reiter „Ereignisse“ und „Beute“ in Ruhe mit echter Maus: öffnen den Reiter, die Welt bekommt den Klick nicht, die Reiter liegen oben (elementFromPoint)');
 }
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('ROT',e.message);try{await shot('zz-fehler');}catch{}process.exitCode=1;}
finally{writeFileSync(dir+'/ergebnis.json',JSON.stringify({checks,results,meas:{...meas,noKey:[...meas.noKey],cut:[...meas.cut],actions:[...meas.actions],mid:[...meas.mid]}},null,1));b.close();}
