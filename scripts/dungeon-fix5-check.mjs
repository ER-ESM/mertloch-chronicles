// Browserprüfung Dungeon-Fix 5 (2026-09-26, Prüfer-Playtest live Build #728, docs/PLAYTEST-2026-09-26-dungeon-bigb-3.md, Bericht
// docs/DUNGEON-FIX5-2026-09-26.md). Big B über den Testzugang `bigb` (scripts/playtest-save.mjs) wie beim Prüfer: Held Stufe 10, Tresenbrecher
// (dieter-brawl), typische Ausrüstung, vier Söldner, drei Beweise gefunden. Echte Maus (CDP Input.dispatchMouseEvent) und echte Tasten; Bilder .jpg.
//  1 Start und Einleitung: „Ins Dorf“ per Maus – ohne Mausbewegung kein Tooltip; F-Hinweis erst am Thron (Hysterese), nie über der Klassenanzeige;
//    F im Gehen; Rede mit „Angreifbar in“; danach wartet Big B („bereit“ mit Tooltip), ohne Angriff kein Kampf, Söldner ziehen nicht; wer den
//    Nahbereich betritt, zieht ihn; erster Zauber erst nach der Anlaufzeit; „Deine Truppe“ scrollt nicht (mit Buff).
//  2 Reaktionsfenster: je Lügen-Variante Zeit von der sichtbaren Handlungszeile nach dem Nachsatz bis zum Einschlag (Kanonenkugel Phase 1, Doppelritt
//    Phase 2, „rechts und links“ Phase 3, Parkett, Pappkulisse) – mit drei Beweisen (Lauf A) und ohne (Lauf B); die Zeile blinkt vor dem Einschlag;
//    „… und links.“ zeigt „In die Mitte“ mit Taste und den grünen Streifen. Phasen per Bossleben gesteuert, der Held ist unverwundbar (gemessen
//    wird die Anzeige, nicht das Ausweichen).
//  3 Nach dem Sieg (Lauf A): Aufstieg, danach die Erfolge gebündelt; F an der Endtruhe öffnet sie; Verlassen ohne Wahl → Rückfrage, Esc, erneut →
//    draußen „Eingesammelt …“.
//  4 Tod (Lauf B): Rückblick – Zeilen ergeben Σ, Ursache = größter Brocken (Kanonenkugel statt Trümmer); Fenster klein und oben mittig, Mitte frei;
//    „Kampf aufgeben“ erst mit dem zweiten Klick binnen 3 s; danach die Erinnerung „Wurst Case“ nur als kompakte Meldung.
// Aufruf: CDP_PORT=9751 SERVER_PORT=4551 BOOT_TRIES=450 node scripts/dungeon-fix5-check.mjs   (ONLY=1,2,3,4 – 1–3 laufen im selben Kampf,
// 4 in einem zweiten; MEASURE_ONLY=1 misst nur die Reaktionsfenster, z. B. gegen den alten Stand). Bilder: visual-review/dungeon-fix5/*.jpg.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const LIB=process.env.FIX5_LIB||'./';
const {session,wait}=await import(LIB+'r5b-lib.mjs');
const {buildPlaytestSave,snippet}=await import(LIB+'playtest-save.mjs');
const dir=process.env.FIX5_DIR||'visual-review/dungeon-fix5';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n)),MEASURE_ONLY=!!process.env.MEASURE_ONLY;
const s=await session({port:9751,serverPort:4551});const {b,read,closeAll}=s;
const checks=[],results={},shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
// ── Maus und Tasten ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(50);await mouse(p,'mouseReleased',button);await wait(200);};
const held=new Set();
async function hold(keys){for(const k of [...held])if(!keys.includes(k)){await b.key(k,'keyUp');held.delete(k);}for(const k of keys)if(!held.has(k)){await b.key(k,'keyDown');held.add(k);}}
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top};`);
const elCenter=sel=>read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);
const tip=()=>read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText.replace(/\\s+/g,' ').trim():''`);
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
const num=t=>parseFloat(String(t).replace(',','.'));
// ── Testheld wie beim Prüfer; Start mit echter Maus auf „Ins Dorf“ ───────────────────────────────────────────────────────────────
async function loadBigB(tag,{evidence=true}={}){
 const built=buildPlaytestSave({preset:'bigb',classId:'dieter',spec:'dieter-brawl',gear:'typical',coins:600}),code=snippet(built,'Fix Fuenf '+tag);
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);/* Der Prüfrechner (Windows Server) meldet „Bewegung reduzieren“ – dann blinkt nichts (Absicht). Geprüft wird die Grundeinstellung. */await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await b.send('Page.navigate',{url:b.url});
 for(let i=0;i<Number(process.env.BOOT_TRIES||450)&&!await b.evaluate('!!window.game');i++)await wait(100);
 await wait(1200);let startBtn=null;
 for(let j=0;j<40;j++){const p=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return null;const e=s.querySelector('[data-start=enter]');if(!e)return null;const r=e.getBoundingClientRect();return r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null;})()`);if(!p)break;startBtn=p;await clickAt(p);await wait(700);}
 const tips=[];for(let i=0;i<10;i++){tips.push(await tip());await wait(250);}/* Maus ruht über der Aktionsleiste */
 await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.BA=globalThis.__bossAlerts;window.BOT=${BOT};BOT.watch(g);return 1`);
 if(!evidence)await read(`g.dungeonRun.found.clear();g.dungeonRun.evidence.clear();g.dungeonRun.version++;return 1`);
 const st=await read(`return {inside:g.instance?.kind,mercs:g.companions.map(c=>c.name),level:g.player.level,found:[...g.dungeonRun.found].length}`);
 assert.equal(st.inside,'dungeon');assert.equal(st.mercs.length,4);assert.equal(st.found,evidence?3:0);return {...st,startBtn,tips};}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,9));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+10+Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
const bossDist=()=>read(`const e=g.enemies.find(x=>x.bossId==='bigb');return +(Math.hypot(e.x-g.player.x,e.y-g.player.y)/8).toFixed(2)`);
// ── Messung im Browser (je Bild) ───────────────────────────────────────────────────────────────────────────────────────────
const BOT=`{
 watch(g){window.RW={casts:[],cur:null};window.MS=[];window.FO={samples:0,over:0,shown:[],maxOver:0};const rect=el=>{const r=el?.getBoundingClientRect();return r&&r.width>1&&r.height>1&&!el.hidden&&getComputedStyle(el).display!=='none'?r:null;};
  const poll=()=>{requestAnimationFrame(poll);const now=performance.now(),b=g.enemies.find(e=>e.bossId==='bigb'),k=b?.cast,c=RW.cur;
   if(c&&c.k!==k){c.end=now;c.endGt=g.time;const {k:_,...rest}=c;RW.casts.push(rest);RW.cur=null;}
   if(k&&k.lie&&!RW.cur&&!k.__fix5){k.__fix5=1;RW.cur={k,type:k.type,set:b.castSet,start:now,startGt:g.time,total:k.total,tell:k.tell,noLie:k.told!==false,samples:[]};}
   const cc=RW.cur;if(cc){if(k.told!==false&&!cc.toldAt){cc.toldAt=now;cc.toldLeft=+k.remaining.toFixed(3);}
    const row=document.querySelector('.boss-alerts .ba-row.ba-now.ba-lie-t');
    if(row&&!cc.rowAt){cc.rowAt=now;cc.rowTime=row.querySelector('.ba-time')?.textContent||'';cc.hint=row.querySelector('.ba-act b')?.textContent||'';cc.arrow=[...(row.querySelector('.ba-arrow')?.classList||[])].find(x=>x.startsWith('ba-arrow-'))||'';cc.key=row.querySelector('kbd:not(.ba-side)')?.textContent||'';cc.side=row.querySelector('.ba-side')?.textContent||'';cc.name=row.querySelector('small')?.textContent||'';}
    if(row&&cc.samples.length<600)cc.samples.push([Math.round(now-cc.start),row.classList.contains('ba-soon')?1:0,getComputedStyle(row).borderTopColor]);}
   /* F-Hinweis gegen Klassenanzeige */const it=document.querySelector('#interact'),ir=it&&!it.classList.contains('hidden')?rect(it):null,cr=rect(document.querySelector('#classMechanicArt'));
   if(ir){FO.samples++;const e=g.enemies.find(x=>x.bossId==='bigb');FO.shown.push(+(Math.hypot(e.x-g.player.x,e.y-g.player.y)/8).toFixed(1));if(FO.shown.length>400)FO.shown.shift();if(cr){const o=Math.max(0,Math.min(ir.right,cr.right)-Math.max(ir.left,cr.left))*Math.max(0,Math.min(ir.bottom,cr.bottom)-Math.max(ir.top,cr.top));if(o>0){FO.over++;FO.maxOver=Math.max(FO.maxOver,o);}}}
   const m=document.querySelector('.milestone');const vis=!!m&&!m.hidden&&m.classList.contains('show');const kind=vis?[...m.classList].find(x=>x.startsWith('milestone-'))||'':'';const last=MS.at(-1),text=kind?m.innerText.replace(/\\s+/g,' ').trim().slice(0,80):'',open=last&&!last.until?last:null;
   if(kind+text!==(open?open.kind+open.text:'')){if(open)open.until=now;if(kind)MS.push({kind,text,at:now,until:0});}};requestAnimationFrame(poll);},
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro,hp:boss?boss.hp/boss.maxHp:0,set:boss?.castSet||''};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  return out;},
 dock(){const d=document.querySelector('#unitGroupDock'),r=d?.getBoundingClientRect(),frames=[...document.querySelectorAll('#unitGroupDock .companion-frame')].map(f=>{const q=f.getBoundingClientRect();return {t:Math.round(q.top),b:Math.round(q.bottom),h:Math.round(q.height)};});
  return d?{sh:d.scrollHeight,ch:d.clientHeight,top:Math.round(r.top),bottom:Math.round(r.bottom),dense:d.classList.contains('unit-dock-dense'),frames,cut:frames.filter(f=>f.b>r.bottom+1||f.t<r.top-1).length,scrollbar:d.scrollHeight>d.clientHeight+1&&getComputedStyle(d).overflowY!=='hidden',buffs:document.querySelectorAll('#buffStrip [data-aura]').length}:null;}
}`;
// ── Kampf mit Tasten: ausweichen, Phasen über das Bossleben steuern, bis jede Lügen-Variante gemessen ist ─────────────────────────
const need=ev=>ev?{'d-bigb:kanone':3,'d-bigb2:kanone':2,'d-bigb2:parkett':1,'d-bigb3:kanone3':2,'d-bigb3:kulisse':1}:{'d-bigb:kanone':2,'d-bigb2:kanone':2,'d-bigb2:parkett':2,'d-bigb2:live':1,'d-bigb3:kanone3':2,'d-bigb3:kulisse':2};
async function measureFight(tag,{evidence,limit=900000,shots=true}={}){
 await read(`g.adminGod=true;return 1`);const want=need(evidence),t0=Date.now();let stage=1,shotMid=false,shotHalf=false;
 const count=async()=>{const c=await read(`return RW.casts.map(x=>x.set+':'+x.type)`);const n={};for(const k of c)n[k]=(n[k]||0)+1;return n;};
 while(Date.now()-t0<limit){
  const st=await read(`return BOT.step(g)`);if(!st.alive)break;
  if(st.move){const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}else await hold([]);
  const n=await count(),done=k=>(n[k]||0)>=want[k];
  if(stage===1&&done('d-bigb:kanone')){stage=2;await read(`const b=g.enemies.find(e=>e.bossId==='bigb');b.hp=b.maxHp*.69;return 1`);}
  if(stage===2&&['d-bigb2:kanone','d-bigb2:parkett','d-bigb2:live'].filter(k=>want[k]).every(done)){stage=3;await read(`const b=g.enemies.find(e=>e.bossId==='bigb');b.hp=b.maxHp*.39;return 1`);}
  if(stage===3&&['d-bigb3:kanone3','d-bigb3:kulisse'].every(done)){stage=4;break;}
  /* im Band der Phase halten (Söldner machen Schaden): Phase 1 ≥ 72 %, Phase 2 ≥ 42 %, Phase 3 über dem Geständnis */
  const floor=stage===1?.72:stage===2?.42:evidence?.32:.17,ceil=stage===1?1:stage===2?.69:.39;await read(`const b=g.enemies.find(e=>e.bossId==='bigb');if(b.hp<b.maxHp*${floor})b.hp=b.maxHp*${(floor+ceil)/2};return 1`);
  if(shots){const k=await read(`const r=document.querySelector('.boss-alerts .ba-row.ba-now.ba-lie-t');return r?(g.enemies.find(e=>e.bossId==='bigb').cast?.type||'')+'|'+(r.querySelector('.ba-act b')?.textContent||''):''`);
   if(!shotMid&&/^kanone3\|/.test(k)){shotMid=true;await shot(tag+'-20-mitte-sicher');}
   if(!shotHalf&&/^kanone\|/.test(k)){shotHalf=true;await shot(tag+'-21-haelfte-sicher');}}
  await wait(90);}
 await hold([]);const casts=await read(`return RW.casts`);return {stage,seconds:Math.round((Date.now()-t0)/1000),casts};}
function windows(casts){return casts.filter(c=>c.rowAt&&c.end).map(c=>{const late=c.samples.filter(x=>x[0]>=Math.round(c.end-c.start)-1200),colors=new Set(late.map(x=>x[2]));
 return {variant:c.set+':'+c.type,lie:!c.noLie,window:Math.round(c.end-c.rowAt),delay:c.toldAt?Math.round(c.rowAt-c.toldAt):null,shown:c.rowTime,hint:c.hint,arrow:c.arrow.replace('ba-arrow-',''),key:c.key,side:c.side,blink:late.some(x=>x[1])&&colors.size>=2,colors:colors.size};});}
function summary(ws){const by={};for(const w of ws){const k=w.variant+(w.lie?'':' (ohne Lüge)');(by[k]||=[]).push(w.window);}return Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{n:v.length,min:Math.min(...v),max:Math.max(...v)}]));}
const DODGE=w=>!/:live$/.test(w.variant);/* Live-Schalte ruft Adds – nichts auszuweichen */

try{
 // ─────────────────────────────────────────────── 1 · Start, F-Hinweis, Einleitung, Warten, Nahbereich
 if(want(1)||want(2)||want(3)){
  const hero=await loadBigB('eins');results.hero=hero;
  if(!MEASURE_ONLY){assert.ok(hero.startBtn,'„Ins Dorf“ per Maus');assert.ok(hero.tips.every(t=>!t),'kein Tooltip ohne Mausbewegung: '+hero.tips.filter(Boolean)[0]);
   await shot('00-nach-start');const slot=await elCenter('.action-bar [data-skill]')||await elCenter('[data-skill]');await mouse({x:slot.x+1,y:slot.y+1});await wait(700);const moved=await tip();await mouse({x:1000,y:160});await wait(300);
   ok('Start per Maus auf „Ins Dorf“ ('+Math.round(hero.startBtn.x)+'|'+Math.round(hero.startBtn.y)+'): 2,5 s ohne Tooltip; erst echte Bewegung auf einen Knopf zeigt „'+(moved||'–').slice(0,40)+'“');results.startTip={moved};assert.ok(moved,'nach echter Bewegung wieder Tooltips');}
  // Saaleingang (alter Vorlege-Punkt), dann auf den Thron zu, zurück und wieder hin (Tasten): Hinweis mit Hysterese, nie über der Klassenanzeige, F im Gehen
  const pr=await read(`return g.dungeonRun.def.evidence.present`);await put('k2',pr.x+1,pr.y);await wait(900);await s.settle();
  const entrance={d:await bossDist(),f:await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`)};
  const walkUntil=async(keys,test,ms=8000)=>{await hold(keys);const t0=Date.now();while(Date.now()-t0<ms){const v=await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`);if(test(v))return {d:await bossDist(),label:v};await wait(30);}return null;};
  const firstAt=await walkUntil(['w'],v=>/Beweise vorlegen/i.test(v));await wait(120);/* Lauftempo 15 Kacheln/s: nicht bis in den Nahbereich (5 Kacheln) */
  const goneAt=await walkUntil(['s'],v=>!v);/* weg vom Thron: geht erst jenseits von talk + keep */
  const againAt=await walkUntil(['w'],v=>/Beweise vorlegen/i.test(v));
  let introF=null;if(againAt){/* F im Gehen */await b.press('f');introF=await until(`return !!g.dungeonRun.intro`,1500,50);}
  await hold([]);await wait(300);await shot('11-f-hinweis-thron');
  results.approach={entrance,firstAt,goneAt,againAt,introF:!!introF,overlap:await read(`return {samples:FO.samples,over:FO.over,maxOver:FO.maxOver}`)};
  if(!MEASURE_ONLY){assert.ok(!/Beweise/.test(entrance.f),'am Saaleingang kein F-Hinweis: '+entrance.f);assert.ok(firstAt&&firstAt.d<=13.3,'Hinweis erst in Sprechweite: '+JSON.stringify(firstAt));assert.ok(goneAt&&goneAt.d>=14.5,'Hysterese: geht erst weiter draußen: '+JSON.stringify(goneAt));assert.ok(introF,'F im Gehen greift');}
  // Rede, dann Warten
  const introRows=await read(`return BA.state().rows.map(r=>r.hint+' '+r.time)`);await shot('12-rede-angreifbar-in');
  const ready=await until(`return BA.state().intro?.ready&&{at:performance.now()}`,30000,150);
  const legacy=!ready&&await read(`return !!g.enemies.find(e=>e.bossId==='bigb').aggro`);/* alter Stand: Timer startet den Kampf */
  if(!legacy){
   await wait(500);await shot('13-bereit');const chip=await elCenter('.bf-chip[data-chip="ready"]');let readyTip='';if(chip){await mouse(chip);await wait(700);readyTip=await tip();await shot('14-bereit-tooltip');await mouse({x:1000,y:160});}
   await wait(6000);const idle=await read(`const e=g.enemies.find(x=>x.bossId==='bigb');return {aggro:e.aggro,arena:g.dungeonRun.arena,mercTargets:g.companions.filter(c=>c.target===e).length,hp:e.hp/e.maxHp,d:+(Math.hypot(e.x-g.player.x,e.y-g.player.y)/8).toFixed(1)}`);
   results.intro={introRows,readyTip,idle};
   if(!MEASURE_ONLY){assert.ok(introRows.some(r=>/Angreifbar in/.test(r)),'Timer „Angreifbar in“: '+introRows.join(' | '));assert.match(readyTip,/wartet auf dem Thron/,'„bereit“ mit Tooltip');
   assert.deepEqual([idle.aggro,idle.arena,idle.mercTargets],[false,null,0],'6 s nach der Rede kein Kampf, Söldner ziehen nicht: '+JSON.stringify(idle));}
   // In den Nahbereich gehen (Rechtsklick auf den Boden vor dem Thron) zieht ihn
   let pulled=null;for(let i=0;i<150&&!pulled;i++){const v=await read(`const e=g.enemies.find(x=>x.bossId==='bigb');return e.aggro?{d:+(Math.hypot(e.x-g.player.x,e.y-g.player.y)/8).toFixed(1),timer:+e.attackTimer.toFixed(2),arena:g.dungeonRun.arena}:{dx:e.x-g.player.x,dy:e.y-g.player.y}`);if(v.timer!=null){pulled=v;break;}const k=[];if(v.dx>6)k.push('d');if(v.dx<-6)k.push('a');if(v.dy>6)k.push('s');if(v.dy<-6)k.push('w');await hold(k);await wait(30);}await hold([]);const pulledOld=await until(`const e=g.enemies.find(x=>x.bossId==='bigb');return e.aggro&&{d:+(Math.hypot(e.x-g.player.x,e.y-g.player.y)/8).toFixed(1),timer:+e.attackTimer.toFixed(2),arena:g.dungeonRun.arena}`,15000,50);await hold([]);
   await wait(400);const door=await read(`return {arena:g.dungeonRun.arena,inside:g.companions.filter(c=>D.roomAt(g.dungeonRun.def,c.x,c.y)?.id==='thronsaal').length}`);await shot('15-nahbereich-kampf');
   results.intro.pulled={...pulled,...door};assert.ok(pulled&&pulled.d<=5.3,'Nahbereich zieht Big B: '+JSON.stringify(pulled));assert.ok(pulled.timer>=4.5,'erster Zauber nach der Anlaufzeit: '+pulled.timer);assert.equal(door.inside,4,'Gruppe drin');
   ok('Einleitung: kein F am Saaleingang ('+entrance.d+' Kacheln), Hinweis ab '+firstAt.d+' Kacheln, weg erst bei '+goneAt.d+', F im Gehen startet die Rede; Leiste „'+introRows[0]+'“; danach „bereit“ (Tooltip „'+readyTip.slice(0,50)+'…“), 6 s ohne Kampf und ohne ziehende Söldner; Nahbereich ('+pulled.d+' Kacheln) zieht ihn, Tür zu, 4 Söldner drin, erster Zauber nach '+pulled.timer.toFixed(1)+' s');
  }else{results.intro={introRows,legacy:true};await until(`return !!g.enemies.find(e=>e.bossId==='bigb').aggro`,20000,150);}
  const fo=await read(`return {samples:FO.samples,over:FO.over,maxOver:FO.maxOver,shown:[Math.min(...FO.shown),Math.max(...FO.shown)]}`);results.fOverlap=fo;
  if(!MEASURE_ONLY){assert.ok(fo.samples>5,'F-Hinweis gemessen');assert.equal(fo.over,0,'F-Hinweis nie über der Klassenanzeige: '+JSON.stringify(fo));
   ok('F-Hinweis in '+fo.samples+' Bildern nie über „Deckelstriche“ (sichtbar zwischen '+fo.shown[0]+' und '+fo.shown[1]+' Kacheln vor dem Thron)');}
  // Truppenfenster mit Buff: kein Scrollen, alle vier ganz
  if(!MEASURE_ONLY){await read(`const cb=await import('/class-buffs.js'),C=(await import('/content/index.js')).CLASS_BUFFS;for(const id of Object.keys(C).slice(0,4))cb.receiveClassBuff(g,{id,power:1,duration:900},'Pruefer');return 1`);await wait(1500);const dock=await read(`return BOT.dock()`);await shot('16-truppe');results.dock=dock;
   assert.ok(dock&&dock.frames.length===4,'vier Söldner');assert.ok(dock.buffs>0,'mit Buff-Symbolen: '+dock.buffs);assert.equal(dock.scrollbar,false,'kein Scrollbalken: '+JSON.stringify(dock));assert.equal(dock.cut,0,'kein Söldner abgeschnitten');
   ok('„Deine Truppe“ im Kampf mit '+dock.buffs+' Buff-Symbolen: 4 Rahmen je '+dock.frames[0].h+' px, '+dock.sh+'/'+dock.ch+' px, kein Scrollbalken, keiner abgeschnitten'+(dock.dense?' (dicht)':''));}
  // ─────────────────────────────────────────────── 2 · Reaktionsfenster (Lauf A, drei Beweise)
  const A=await measureFight('A',{evidence:true});const wa=windows(A.casts);results.runA={stage:A.stage,seconds:A.seconds,windows:wa,summary:summary(wa)};console.log('Lauf A',JSON.stringify(results.runA.summary));
  if(!MEASURE_ONLY){assert.equal(A.stage,4,'alle Varianten gemessen (A)');for(const w of wa.filter(DODGE))assert.ok(w.window>=2000,'Reaktionsfenster ≥ 2,0 s: '+JSON.stringify(w));
   for(const w of wa.filter(w=>w.lie&&DODGE(w)))assert.ok(w.blink,'Zeile blinkt vor dem Einschlag: '+JSON.stringify(w));
   const mid=wa.filter(w=>/kanone3/.test(w.variant)&&w.lie);assert.ok(mid.length&&mid.every(w=>w.arrow==='in'&&w.key||w.arrow==='hold'&&/Mitte/.test(w.side)),'„… und links.“: In die Mitte mit Taste bzw. Stehen bleiben [Mitte]: '+JSON.stringify(mid));
   ok('Reaktionsfenster A (drei Beweise): '+Object.entries(results.runA.summary).map(([k,v])=>k+' '+v.n+'× '+(v.min/1000).toFixed(2)+'–'+(v.max/1000).toFixed(2)+' s').join(' · ')+'; Blinken vor dem Einschlag in '+wa.filter(w=>w.lie&&DODGE(w)&&w.blink).length+'/'+wa.filter(w=>w.lie&&DODGE(w)).length+' Lügen');}
  // ─────────────────────────────────────────────── 3 · Nach dem Sieg
  if(!MEASURE_ONLY&&want(3)){
   await read(`g.adminGod=false;const b=g.enemies.find(e=>e.bossId==='bigb');b.hp=Math.min(b.hp,b.maxHp*.02);return 1`);await until(`return !(g.enemies.find(e=>e.bossId==='bigb')?.hp>0)`,90000,300);
   for(let i=0;i<60;i++){if(await read(`const m=document.querySelector('.milestone.milestone-feat.show');return !!m&&!m.hidden`)){await wait(400);await shot('30-erfolge-nach-aufstieg');break;}await wait(200);}
   await wait(3500);const ms=await read(`return MS`);results.milestones=ms;const lv=ms.findIndex(m=>/level/.test(m.kind)),ft=ms.map((m,i)=>/feat/.test(m.kind)?i:-1).filter(i=>i>=0);
   assert.ok(lv>=0,'Aufstieg gezeigt: '+JSON.stringify(ms));assert.equal(ft.length,1,'Erfolge als eine Einblendung: '+JSON.stringify(ms));assert.ok(ft[0]>lv,'Erfolge nach dem Aufstieg');
   ok('Einblendungen: '+ms.map(m=>m.kind.replace('milestone-','')+' „'+m.text.slice(0,36)+'“').join(' → '));
   // F an der Endtruhe öffnet sie
   await b.press('Escape');await wait(300);await closeAll();const chestP=await read(`const c=g.dungeonRun.def.chest;return c`);await put(chestP.floor,chestP.x,chestP.y+1.5);await wait(900);
   const fLabel=await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`);await b.press('f');await wait(900);
   const chestWin=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return w?{choice:w.querySelector('[data-loot-choice]')?.textContent.trim()||'',items:w.querySelectorAll('[data-loot-item]').length}:null`);await shot('31-f-endtruhe');
   assert.match(chestWin?.choice||'',/1 \/ 3/,'F an der Endtruhe öffnet die Dreierwahl: '+JSON.stringify({fLabel,chestWin}));ok('F an der Endtruhe („'+fLabel+'“) öffnet die Dreierwahl '+chestWin.choice);
   // Verlassen ohne Wahl: Rückfrage, Esc, erneut → draußen „Eingesammelt …“
   await b.press('Escape');await wait(400);await closeAll();const back=await read(`return g.dungeonRun.def.backExit`);await put(back.floor,back.x,back.y+1);await wait(900);
   await b.press('f');await wait(900);const ask=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return {inside:!!g.instance,ask:w?.querySelector('[data-loot-leave]')?.innerText.trim()||'',items:w?.querySelectorAll('[data-loot-item]').length||0}`);await shot('32-rueckfrage');
   await b.press('Escape');await wait(500);await b.press('f');const out=await until(`return !g.instance`,12000,100);
   const toasts=[];for(let i=0;i<60;i++){const t=await read(`return document.querySelector('#toast.visible')?.textContent||''`);if(t&&!toasts.includes(t))toasts.push(t);if(toasts.some(x=>/Eingesammelt/.test(x))){await shot('33-draussen-eingesammelt');break;}await wait(200);}
   results.leave={ask,out:!!out,toasts};assert.ok(ask.inside&&ask.items===3&&/Noch nichts gewählt/.test(ask.ask),'Rückfrage: '+JSON.stringify(ask));assert.ok(out,'draußen');assert.ok(toasts.some(t=>/Eingesammelt/.test(t)),'Kurzmeldung „Eingesammelt …“: '+toasts.join(' | '));
   ok('Verlassen ohne Wahl: Rückfrage „'+ask.ask+'“, Esc, F erneut → Burgstraße, „'+toasts.find(t=>/Eingesammelt/.test(t))+'“');
  }
 }
 // ─────────────────────────────────────────────── 4 · Lauf B ohne Beweise: Reaktionsfenster, Tod, Rückblick, Aufgeben, Erinnerung
 if(want(4)||MEASURE_ONLY){
  await loadBigB('vier',{evidence:false});await put('k2',54,22);await wait(900);await s.settle();
  const f=await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`);await b.press('f');
  const rd=await until(`return BA.state().intro?.ready||!!g.enemies.find(e=>e.bossId==='bigb').aggro`,30000,150);
  if(!await read(`return !!g.enemies.find(e=>e.bossId==='bigb').aggro`)){/* Angriff per Rechtsklick zieht ihn */const bp=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);await clickAt({x:bp.x,y:bp.y-22},'right');}
  const pulled=await until(`const e=g.enemies.find(x=>x.bossId==='bigb');return e.aggro&&{timer:+e.attackTimer.toFixed(2),hp:+(e.hp/e.maxHp).toFixed(4)}`,20000,100);results.pullB={f,rd:!!rd,pulled};
  if(!MEASURE_ONLY){assert.match(f,/Big B ansprechen/i,'ohne Beweise: '+f);assert.ok(pulled&&pulled.hp<1,'Rechtsklick-Angriff zieht ihn (erster Treffer macht Schaden): '+JSON.stringify(pulled));ok('Ohne Beweise: „'+f+'“, Rede, Rechtsklick-Angriff zieht Big B (Leben '+(pulled.hp*100).toFixed(1)+' %, erster Zauber nach '+pulled.timer.toFixed(1)+' s)');}
  const B=await measureFight('B',{evidence:false});const wb=windows(B.casts);results.runB={stage:B.stage,seconds:B.seconds,windows:wb,summary:summary(wb)};console.log('Lauf B',JSON.stringify(results.runB.summary));
  if(!MEASURE_ONLY){assert.equal(B.stage,4,'alle Varianten gemessen (B)');for(const w of wb.filter(DODGE))assert.ok(w.window>=2000,'Reaktionsfenster ≥ 2,0 s: '+JSON.stringify(w));
   for(const w of wb.filter(w=>w.lie&&DODGE(w)))assert.ok(w.blink,'Zeile blinkt vor dem Einschlag: '+JSON.stringify(w));
   ok('Reaktionsfenster B (ohne Beweise, alle lügen): '+Object.entries(results.runB.summary).map(([k,v])=>k+' '+v.n+'× '+(v.min/1000).toFixed(2)+'–'+(v.max/1000).toFixed(2)+' s').join(' · ')+'; Blinken vor dem Einschlag in '+wb.filter(w=>w.lie&&DODGE(w)&&w.blink).length+'/'+wb.filter(w=>w.lie&&DODGE(w)).length+' Lügen');
   // Tod: Kanonenkugel, dann viele kleine Trümmer – Heiler liegt, damit niemand aufhilft
   await read(`const s=g.companions.find(c=>c.def.role==='heal');if(s){s.hp=0;s.state='down';s.downUntil=g.time+999;}const b=g.enemies.find(e=>e.bossId==='bigb');b.hp=b.maxHp*.35;g.adminGod=false;g.player.invulnerable=0;g.player.parry=0;
    b.lastCast={name:'Ritt auf der Kanonenkugel',title:'Ritt auf der Kanonenkugel'};g.hitPlayer(b,0,true,.62);b.lastCast={name:'Trümmer',title:'Trümmer'};for(let i=0;i<5&&!g.dead;i++){g.player.invulnerable=0;g.hitPlayer(b,0,true,.05);}
    if(!g.dead){g.player.hp=Math.min(g.player.hp,60);g.player.invulnerable=0;g.hitPlayer(b,0,true,.05);}b.lastCast=null;return g.dead`);
   await mouse({x:1000,y:120});await wait(1000);
   const ds=await read(`const d=document.querySelector('#deathScreen'),r=d.getBoundingClientRect(),f=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect(),v=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/v.width,hy=(g.player.y-v.camera.y+v.height/2)/v.height*cv.height+cv.top;
    const rows=[...d.querySelectorAll('.ds-recap-row')].map(x=>({text:x.innerText.replace(/\\s+/g,' ').trim(),amount:+(x.querySelector('em')?.textContent||'0').replace(/\\./g,''),fatal:x.classList.contains('is-fatal'),rest:x.classList.contains('ds-recap-rest')}));
    return {shown:!d.hidden,rect:{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom)},frameBottom:f?Math.round(f.bottom):null,heroTop:Math.round(hy-40*k),W:innerWidth,H:innerHeight,
     sum:d.querySelector('.ds-recap-sum')?.innerText.trim()||'',cause:d.querySelector('.ds-foe')?.innerText.replace(/\\s+/g,' ').trim()||'',rows}`);
   await shot('40-tod-oben');results.death=ds;
   const sum=+(ds.sum.match(/Σ ([\d.]+)/)?.[1]||'0').replace(/\./g,''),rowsSum=ds.rows.reduce((n,r)=>n+r.amount,0);
   assert.ok(ds.shown,'Todesfenster');assert.equal(rowsSum,sum,'Zeilen ergeben Σ: '+JSON.stringify(ds.rows)+' '+ds.sum);assert.match(ds.cause,/Kanonenkugel/,'Ursache = größter Brocken: '+ds.cause);assert.ok(ds.rows.at(-1)?.fatal&&/Trümmer/.test(ds.rows.at(-1).text),'Todesschlag unten: '+JSON.stringify(ds.rows.at(-1)));
   assert.ok(ds.rect.w<=340,'klein: '+ds.rect.w);assert.ok(Math.abs(ds.rect.l+ds.rect.w/2-ds.W/2)<4,'mittig');assert.ok(ds.frameBottom==null||ds.rect.t>=ds.frameBottom,'unter dem Bossrahmen');assert.ok(ds.rect.b<ds.heroTop,'Bildmitte frei (über dem Helden): '+JSON.stringify(ds.rect)+' Held '+ds.heroTop);
   ok('Tod: Rückblick '+ds.sum+' = '+ds.rows.map(r=>r.text.replace(/ −.*$/,'')).join(' + ')+'; Ursache „'+ds.cause+'“; Fenster '+ds.rect.w+'×'+ds.rect.h+' oben mittig ab y '+ds.rect.t+' (Bossrahmen bis '+ds.frameBottom+', Held ab '+ds.heroTop+')');
   // Kampf aufgeben: erster Klick scharf, nach 3 s wieder entschärft; zweiter Klick binnen 3 s gibt auf
   const bp=await elCenter('#deathScreen [data-ds-wake]');await clickAt(bp);await wait(250);const a1=await read(`const b=document.querySelector('#deathScreen [data-ds-wake]');return {dead:g.dead,btn:b.textContent,armed:b.classList.contains('ds-armed')}`);await shot('41-aufgeben-scharf');
   await mouse({x:1000,y:120});await wait(3400);const a2=await read(`const b=document.querySelector('#deathScreen [data-ds-wake]');return {dead:g.dead,btn:b.textContent,armed:b.classList.contains('ds-armed')}`);
   const bp2=await elCenter('#deathScreen [data-ds-wake]');await clickAt(bp2);await wait(250);const a3=await read(`return {dead:g.dead,armed:document.querySelector('#deathScreen [data-ds-wake]').classList.contains('ds-armed')}`);await wait(900);await clickAt(await elCenter('#deathScreen [data-ds-wake]'));
   const up=await until(`return !g.dead&&{room:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id||'',boss:g.enemies.find(e=>e.bossId==='bigb')?.aggro}`,6000,100);results.giveUp={a1,a2,a3,up};
   assert.deepEqual([a1.dead,a1.armed],[true,true],'erster Klick nur scharf');assert.deepEqual([a2.dead,a2.armed],[true,false],'nach 3 s wieder entschärft');assert.deepEqual([a3.dead,a3.armed],[true,true],'wieder nur scharf');assert.ok(up,'zweiter Klick binnen 3 s gibt auf');
   ok('Kampf aufgeben: 1. Klick „'+a1.btn+'“, nach 3,4 s wieder „'+a2.btn+'“, erneut scharf, 2. Klick nach 0,9 s → aufgestanden ('+(up.room||'Kontrollpunkt')+')');
   // Erinnerung „Wurst Case“ (erster Tod) nur als kompakte Meldung
   const card=await until(`const c=document.querySelector('.memory-card:not([hidden])');if(!c)return null;const r=c.getBoundingClientRect();return r.height>0&&{h:Math.round(r.height),w:Math.round(r.width),text:c.innerText.replace(/\\s+/g,' ').trim(),img:!!c.querySelector('img'),p:!!c.querySelector('p'),x:r.x+r.width/2,y:r.y+r.height/2}`,25000,250);
   if(card){await shot('42-erinnerung-kompakt');await mouse({x:card.x-40,y:card.y});await wait(800);card.tip=await tip();await shot('43-erinnerung-tooltip');await mouse({x:1000,y:120});}
   results.memory=card;assert.ok(card,'Erinnerung erscheint');assert.ok(card.h<=60&&!card.img&&!card.p,'kompakt, ohne Bild und Prosa: '+JSON.stringify(card));assert.ok(card.tip&&card.tip.length>60,'Text im Tooltip: '+card.tip);
   ok('Erinnerung „'+card.text+'“ als Zeile '+card.w+'×'+card.h+' px ohne Bild und Prosa; Tooltip „'+card.tip.slice(0,60)+'…“');}
 }
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('ROT',e.message);try{await shot('zz-fehler');}catch{}process.exitCode=1;}
finally{await hold([]).catch(()=>{});writeFileSync(dir+'/ergebnis.json',JSON.stringify({checks,results},null,1));b.close();}
