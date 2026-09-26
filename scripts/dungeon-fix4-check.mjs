// Browserprüfung Dungeon-Fix 4 (2026-09-26, Nachprüfung des Prüfers live Build #726, docs/DUNGEON-FIX4-2026-09-26.md). Big B über den
// Testzugang `bigb` (scripts/playtest-save.mjs) wie beim Prüfer: Held Stufe 10, Tresenbrecher (dieter-brawl), typische Ausrüstung ohne Schild,
// vier Söldner, drei Beweise gefunden. Echte Maus (CDP Input.dispatchMouseEvent) und echte Tasten.
//  1 Einleitung: Rechtsklick auf Big B aus dem Weinkeller – beim Betreten des Thronsaals kein Kampf; am Thron „F Beweise vorlegen (3)“; F →
//    Bossrahmen mit Ausreden, drei Lupen (Tooltip mit Wirkung per Maus, bleibt stehen), Pull-Timer „Kampfbeginn“; dann Tür zu, Gruppe drin,
//    erster Zauber erst nach der Anlaufzeit.
//  2 Kampf ohne Tod (Spieler-Bot): Nachsatz → Richtungszeile im selben Takt, gezeigte Zeit ≥ 2,0 s; jede Richtungszeile mit Handlung (Pfeil +
//    Taste bzw. Halten-Symbol + „Stehen bleiben“ + Seite); Siegelring auf Pils-Peter nur als Info ohne Taste; Geständnis mit Tooltip.
//  3 Nach dem Sieg: Aufstieg und Erfolg nacheinander (beide sichtbar); Beutefenster überdeckt die Verfolgung nicht, Klick auf „Endtruhe“ im
//    Tracker kommt an; F an der Truhe öffnet die Truhe (schließt nicht das Big-B-Fenster); Verlassen ohne Wahl → Rückfrage mit drei Teilen,
//    Wahl per Maus → draußen; liegengebliebener Boss-Beutel als kurze Meldung nach dem Übergang.
//  4 Tod im Kampf: Todesrückblick mit mehreren Treffern (Quelle, Schaden), „Kampf aufgeben“ zweitrangig, Tooltip nicht ohne Hover, erster Klick
//    nur scharf, der Kampf läuft weiter.
// Aufruf: CDP_PORT=9721 SERVER_PORT=4521 BOOT_TRIES=450 node scripts/dungeon-fix4-check.mjs   (ONLY=1,2,… einzelne Teile; 2 und 3 laufen im
// selben Kampf wie 1). Bilder: visual-review/dungeon-fix4/*.jpg (lokal, nicht im Repo).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/dungeon-fix4';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9721,serverPort:4521});const {b,read,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const results={};
// ── Maus und Tasten ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(50);await mouse(p,'mouseReleased',button);await wait(200);};
const held=new Set();
async function hold(keys){for(const k of [...held])if(!keys.includes(k)){await b.key(k,'keyUp');held.delete(k);}for(const k of keys)if(!held.has(k)){await b.key(k,'keyDown');held.add(k);}}
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top};`);
const elCenter=sel=>read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);
const tip=()=>read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText.replace(/\\s+/g,' ').trim():''`);
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
// ── Testheld wie beim Prüfer ────────────────────────────────────────────────────────────────────────────────────────────────
async function loadBigB(tag){
 const built=buildPlaytestSave({preset:'bigb',classId:'dieter',spec:'dieter-brawl',gear:'typical',coins:600}),code=snippet(built,'Fix Vier '+tag);
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<300&&!await b.evaluate('!!window.game');i++)await wait(150);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.BA=globalThis.__bossAlerts;window.BOT=${BOT};BOT.watch(g);return 1`);
 const st=await read(`return {inside:g.instance?.kind,shield:!!g.rpg.equipment.offhand,spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.name),level:g.player.level,found:[...g.dungeonRun.found].length}`);
 assert.equal(st.inside,'dungeon');assert.equal(st.shield,false,'typische Ausrüstung ohne Schild');assert.equal(st.mercs.length,4);assert.equal(st.found,3,'drei Beweise gefunden');return st;}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,9));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+10+Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
// ── Spieler-Bot und Messung (im Browser) ────────────────────────────────────────────────────────────────────────────────────
const BOT=`{
 watch(g){window.LIE={reveals:[],rows:[],seen:new Set(),intro:[],milestones:[]};const emit=g.emit.bind(g);
  g.emit=(t,d)=>{if(t==='dungeonLie'&&d?.phase==='truth'){const e=g.enemies.find(x=>x.bossId==='bigb');LIE.reveals.push({at:performance.now(),gt:g.time,left:e?.cast?.remaining??null,type:d.type});}
   if(t==='dungeonIntro')LIE.intro.push({phase:d.phase,at:performance.now(),gt:g.time,attackTimer:g.enemies.find(x=>x.bossId==='bigb')?.attackTimer});return emit(t,d);};
  const poll=()=>{requestAnimationFrame(poll);for(const el of document.querySelectorAll('.boss-alerts .ba-row.ba-lie-t')){const k=el.dataset.ba+'@'+(LIE.reveals.length);if(LIE.seen.has(k))continue;LIE.seen.add(k);
    LIE.rows.push({k,at:performance.now(),time:el.querySelector('.ba-time')?.textContent||'',hint:el.querySelector('.ba-act b')?.textContent||'',arrow:[...(el.querySelector('.ba-arrow')?.classList||[])].find(c=>c.startsWith('ba-arrow-'))||'',key:el.querySelector('kbd:not(.ba-side)')?.textContent||'',side:el.querySelector('.ba-side')?.textContent||'',fresh:el.classList.contains('ba-fresh')});}
   const m=document.querySelector('.milestone');const vis=!!m&&!m.hidden&&m.classList.contains('show');const kind=vis?[...m.classList].find(c=>c.startsWith('milestone-'))||'':'';const last=LIE.milestones.at(-1),text=kind?m.innerText.replace(/\\s+/g,' ').trim().slice(0,60):'',open=last&&!last.until?last:null;
   if(kind+text!==(open?open.kind+open.text:'')){if(open)open.until=performance.now();if(kind)LIE.milestones.push({kind,text,at:performance.now(),until:0});}};requestAnimationFrame(poll);},
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,interrupt:false,dodge:false,near:false,phase:boss?Math.round(boss.hp/boss.maxHp*100):0,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro,intro:!!g.dungeonRun?.intro};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  const k=boss.cast;out.interrupt=!!(k?.interruptible&&(g.cooldowns.interrupt||0)<=0);
  const sc=boss.sideCast;out.dodge=!!(sc&&(sc.focus||'player')==='player'&&sc.remaining<.38);
  out.near=Math.hypot(boss.x-p.x,boss.y-p.y)<70;out.claim=!!(k?.lie&&k.told===false);return out;},
 measure(g){const bar=document.querySelector('.boss-alerts');const rows=[...(bar?.querySelectorAll('.ba-row')||[])].map(el=>({hint:el.querySelector('.ba-act b')?.textContent||'',name:el.querySelector('small')?.textContent||'',key:el.querySelector('kbd:not(.ba-side)')?.textContent||'',side:el.querySelector('.ba-side')?.textContent||'',
   arrow:[...(el.querySelector('.ba-arrow')?.classList||[])].find(c=>c.startsWith('ba-arrow-'))||'',hold:el.classList.contains('ba-hold'),info:el.classList.contains('ba-info'),lie:[...el.classList].find(c=>c.startsWith('ba-lie-'))||'',done:el.classList.contains('ba-done'),pull:el.classList.contains('ba-pull')}));
  const boss=g.enemies.find(e=>e.bossId==='bigb'),holder=boss?.focus&&boss.focus!=='player'?g.companions.find(c=>c.id===boss.focus)?.name||'':'';return {rows,holder,confessed:!!boss?.confessed};}
}`;
// ── Ein Big-B-Kampf mit echten Tasten ─────────────────────────────────────────────────────────────────────────────────────────
const meas={samples:0,noAction:new Set(),stay:new Set(),ringInfo:new Set(),ringHero:new Set(),ringWrong:[],actions:new Set()};
function note(m){meas.samples++;for(const r of m.rows){if(r.done||r.pull)continue;
 if(!r.key&&!(r.hold&&(r.arrow||r.info||!r.lie)))meas.noAction.add(r.hint+' · '+r.name);
 if(r.lie==='ba-lie-t'){meas.actions.add(r.hint+(r.arrow?' '+r.arrow.slice(9):'')+(r.key?' ['+r.key+']':'')+(r.side?' ('+r.side+')':''));if(r.hold)meas.stay.add(r.hint+' · '+r.arrow+' · '+r.side);}
 if(/Siegelring/.test(r.name+r.hint)){if(r.info){meas.ringInfo.add(r.hint);if(r.key)meas.ringWrong.push('Info mit Taste: '+r.hint);}else{meas.ringHero.add(r.hint+(r.key?' ['+r.key+']':''));if(m.holder&&!r.info&&r.name.includes('Siegelring')&&/Ausweichen|Parieren/.test(r.hint)&&r.name.includes(m.holder))meas.ringWrong.push(r.hint+' · '+r.name);}}}}
async function fight({death=null,limit=560000}={}){
 const t0=Date.now();let k=0,lastRe=0,lastAtk=0,res={},confessTip=null;
 while(Date.now()-t0<limit){
  const st=await read(`return BOT.step(g)`);
  if(!st.alive){await hold([]);res.won=true;break;}
  if(death&&!res.death&&st.fight&&st.phase<=death&&(await read(`return !g.dead`))){await hold([]);res.death=await dieInFight();}
  const dead=await read(`return g.dead`);
  if(!dead){if(st.move){const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}
   else{await hold([]);
    if(st.interrupt)await b.press('q');
    if(st.dodge)await b.press(' ');
    if(!st.near&&!st.claim&&Date.now()-lastRe>2500){const p=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);if(p){await clickAt({x:p.x,y:p.y-22},'right');lastRe=Date.now();}}
    else if(st.near&&st.fight&&Date.now()-lastAtk>900){await b.press(['2','6','7'][k++%3]);lastAtk=Date.now();}}}
  else await hold([]);
  const m=await read(`return BOT.measure(g)`);note(m);
  if(m.confessed&&!confessTip){const c=await elCenter('.bf-chip[data-chip="confess"]');if(c){await mouse(c);await wait(1400);confessTip=await tip();await shot('24-gestaendnis-tooltip');await mouse({x:1000,y:300});}}
  if(m.rows.some(r=>r.lie==='ba-lie-t'&&r.hold)&&!res.shotStay){res.shotStay=true;await shot('21-stehen-bleiben');}
  if(m.rows.some(r=>r.lie==='ba-lie-t'&&!r.hold)&&!res.shotGo){res.shotGo=true;await shot('20-nachsatz-handlung');}
  if(m.rows.some(r=>r.info)&&!res.shotInfo){res.shotInfo=true;await shot('22-siegelring-info');}
  await wait(110);}
 await hold([]);res.seconds=Math.round((Date.now()-t0)/1000);res.confessTip=confessTip;return res;}
/** Tod mitten im Kampf: mehrere Treffer in wenigen Sekunden, dann der letzte – Rückblick, Knopf, Tooltip, erster Klick. */
async function dieInFight(){
 await read(`const b=g.enemies.find(e=>e.bossId==='bigb');g.adminGod=false;window.__hits=[['Pappkulisse fällt',.25],[null,0],['Trümmer',.04],[null,0],['Trümmer',.04]];return 1`);
 for(let i=0;i<5;i++){await read(`const b=g.enemies.find(e=>e.bossId==='bigb'),[n,pct]=__hits[${i}];g.player.invulnerable=0;g.player.parry=0;b.lastCast=n?{name:n,title:n}:null;if(n)g.hitPlayer(b,0,true,pct);else g.hitPlayer(b,120);b.lastCast=null;return 1`);await wait(700);}
 await read(`const b=g.enemies.find(e=>e.bossId==='bigb');g.player.invulnerable=0;g.player.parry=0;b.lastCast={name:'Trümmer',title:'Trümmer'};g.player.hp=Math.min(g.player.hp,90);g.hitPlayer(b,0,true,.08);if(!g.dead)g.hitPlayer(b,0,true,.5);b.lastCast=null;return g.dead`);
 await mouse({x:1000,y:200});await wait(900);
 const ds=await read(`const ds=document.querySelector('#deathScreen'),btn=ds.querySelector('[data-ds-wake]');return {shown:!ds.hidden,rows:[...ds.querySelectorAll('.ds-recap-row')].map(r=>r.innerText.replace(/\\s+/g,' ').trim()),sum:ds.querySelector('.ds-recap-sum')?.innerText.trim()||'',btn:btn?.textContent||'',gold:btn?.classList.contains('gold-button'),outline:btn?.classList.contains('outline-button'),focusBtn:document.activeElement===btn,tip:!document.querySelector('#itemTooltip').classList.contains('hidden')}`);
 await shot('30-tod-rueckblick');
 const bp=await elCenter('#deathScreen [data-ds-wake]');await clickAt(bp);await wait(250);
 const armed=await read(`const btn=document.querySelector('#deathScreen [data-ds-wake]');return {dead:g.dead,btn:btn?.textContent||'',armed:btn?.classList.contains('ds-armed'),inDungeonRoom:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`);
 await shot('31-aufgeben-scharf');await mouse({x:1000,y:200});await wait(3400);
 const later=await read(`const btn=document.querySelector('#deathScreen [data-ds-wake]');return {dead:g.dead,btn:btn?.textContent||'',armed:btn?.classList.contains('ds-armed')}`);
 await mouse(bp);await wait(700);const hoverTip=await tip();await mouse({x:1000,y:200});
 return {...ds,armed,later,hoverTip};}

try{
 // ─────────────────────────────────────────────── 1 · Einleitung
 if(want(1)||want(2)||want(3)){
  const hero=await loadBigB('eins');results.hero=hero;
  // Durch die Tresortür hinein und bis vor den Thron laufen (Tasten): kein Kampf beim Betreten, am Thron „F Beweise vorlegen (3)“
  await put('k2',44,26);await wait(800);await s.settle();await hold(['d']);
  const entered=await until(`return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id==='thronsaal'&&{t:performance.now()}`,15000,60);await hold([]);
  await wait(1500);const onEnter=await read(`const b=g.enemies.find(e=>e.bossId==='bigb');return {aggro:b.aggro,intro:!!g.dungeonRun.intro,arena:g.dungeonRun.arena,cast:!!b.cast}`);
  await shot('10-betreten-kein-kampf');
  await read(`g.moveTo=null;g.path=[];return 1`);await put('k2',54,23);await wait(900);
  const label=await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`);await shot('11-f-beweise-vorlegen');
  assert.ok(entered,'Held betritt den Thronsaal');assert.deepEqual([onEnter.aggro,onEnter.intro,onEnter.arena],[false,false,null],'kein Kampf beim Betreten: '+JSON.stringify(onEnter));assert.match(label,/beweise vorlegen \(3\)/i,'F am Thron: '+label);
  await b.press('f');await wait(700);
  const intro=await read(`return {st:BA.state(),say:document.querySelector('.bf-say:not([hidden]) q')?.textContent||'',frame:!document.querySelector('.boss-frame').hidden,chips:[...document.querySelectorAll('.bf-chip')].map(c=>({id:c.dataset.chip,label:c.dataset.tooltipLabel,note:c.dataset.tooltipNote})),toast:document.querySelector('#toast.visible')?.textContent||''}`);
  await shot('12-einleitung-ausrede');
  assert.ok(intro.frame,'Bossrahmen während der Einleitung');assert.ok(intro.st.intro,'Einleitung läuft');assert.ok(intro.st.rows.some(r=>r.pull),'Pull-Timer „Kampfbeginn“');
  // Lupe mit echter Maus: Tooltip mit Wirkung, bleibt stehen
  await wait(2200);const lens=await elCenter('.bf-chip[data-chip^="ev-"]');await mouse(lens);await wait(500);const tip1=await tip();await wait(1600);const tip2=await tip();await shot('13-lupe-tooltip');await mouse({x:1000,y:300});
  assert.match(tip1,/lügt nicht mehr|mehr Schaden/,'Lupe erklärt ihre Wirkung: '+tip1);assert.equal(tip2,tip1,'Tooltip bleibt stehen');
  const says=new Set([intro.say]);for(let i=0;i<24;i++){const x=await read(`return {say:document.querySelector('.bf-say:not([hidden]) q')?.textContent||'',fight:!!g.enemies.find(e=>e.bossId==='bigb')?.aggro}`);if(x.say)says.add(x.say);if(x.fight)break;await wait(400);}
  const fightAt=await until(`const e=LIE.intro.find(x=>x.phase==='fight');return e&&{...e,arena:g.dungeonRun.arena,inside:g.companions.filter(c=>D.roomAt(g.dungeonRun.def,c.x,c.y)?.id==='thronsaal').length,player:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`,20000,150);
  await wait(400);const doorShut=await read(`return {arena:g.dungeonRun.arena,inside:g.companions.filter(c=>D.roomAt(g.dungeonRun.def,c.x,c.y)?.id==='thronsaal').length,timer:+g.enemies.find(e=>e.bossId==='bigb').attackTimer.toFixed(2),rows:BA.state().rows.map(r=>r.hint+' '+r.time)}`);
  await shot('14-kampfbeginn');
  results.intro={onEnter,label,intro:{...intro.st,say:intro.say,chips:intro.chips},tip1,says:[...says],fightAt,doorShut};
  assert.ok(says.size>=3,'Ausreden und Begrüßung im Bossrahmen: '+[...says].join(' | '));assert.ok(fightAt,'Kampf nach der Einleitung');assert.equal(doorShut.arena,'thronsaal','Tür zu');assert.equal(doorShut.inside,4,'Gruppe drin');
  assert.ok(fightAt.attackTimer>=4.5,'Anlaufzeit bis zum ersten Zauber: '+fightAt.attackTimer);
  ok('Einleitung: Betreten ohne Kampf, „'+label+'“, Bossrahmen mit '+says.size+' Zeilen („'+[...says].slice(0,2).join('“, „')+'“), Lupe per Maus „'+tip1.slice(0,60)+'…“ (bleibt stehen), Pull-Timer; Tür zu mit 4 Söldnern drin, erster Zauber nach '+fightAt.attackTimer.toFixed(1)+' s');
  // ─────────────────────────────────────────────── 2 · Kampf
  const res=await fight({limit:560000});results.run1=res;assert.ok(res.won,'Big B besiegt');
  const lie=await read(`return {reveals:LIE.reveals,rows:LIE.rows}`),pairs=[];
  for(let i=0;i<lie.reveals.length;i++){const r=lie.reveals[i],row=lie.rows.find(x=>x.at>=r.at-5&&x.at<(lie.reveals[i+1]?.at??1e12));if(r.type?.startsWith('kanone'))pairs.push({type:r.type,left:+(r.left??0).toFixed(2),delay:row?Math.round(row.at-r.at):null,shown:row?.time||'',hint:row?.hint||'',arrow:row?.arrow||'',key:row?.key||'',side:row?.side||'',fresh:!!row?.fresh});}
  results.lie=pairs;console.log('Nachsatz',JSON.stringify(pairs));
  const num=t=>parseFloat(String(t).replace(',','.'));
  assert.ok(pairs.length>=4,'Kanonenkugeln gemessen: '+pairs.length);for(const p of pairs){assert.ok(p.delay!=null&&p.delay<=150,'Richtungszeile im selben Takt: '+JSON.stringify(p));assert.ok(num(p.shown)>=2.0,'gezeigte Zeit ≥ 2,0 s: '+JSON.stringify(p));
   assert.ok(p.arrow==='ba-arrow-hold'?p.side&&/Stehen bleiben/i.test(p.hint):p.key&&p.arrow,'Handlung: '+JSON.stringify(p));}
  results.warn={samples:meas.samples,noAction:[...meas.noAction],stay:[...meas.stay],ringInfo:[...meas.ringInfo],ringHero:[...meas.ringHero],ringWrong:meas.ringWrong.slice(0,6),actions:[...meas.actions]};console.log('Warnleiste',JSON.stringify(results.warn));
  assert.deepEqual([...meas.noAction],[],'Zeilen ohne Handlung');assert.deepEqual(meas.ringWrong,[],'Siegelring auf dem Söldner fordert den Helden');assert.ok(meas.ringInfo.size>0,'Siegelring auf dem Söldner als Info gesehen');
  assert.ok(res.confessTip&&/Ab 30 %/.test(res.confessTip),'Geständnis mit Tooltip: '+res.confessTip);
  const delays=pairs.map(p=>p.delay),shown=pairs.map(p=>num(p.shown));
  ok('Kampf ('+res.seconds+' s Echtzeit): '+pairs.length+' Kanonenkugeln – Richtungszeile '+Math.min(...delays)+'–'+Math.max(...delays)+' ms nach dem Nachsatz, gezeigt '+Math.min(...shown).toFixed(1)+'–'+Math.max(...shown).toFixed(1)+' s; Handlungen: '+[...meas.actions].slice(0,8).join(', '));
  ok('Warnleiste in '+meas.samples+' Messungen: jede Zeile mit Handlung; „bleiben“ = '+[...meas.stay].join(' | ')+'; Siegelring auf dem Söldner nur Info („'+[...meas.ringInfo].join('“, „')+'“), auf dem Helden „'+[...meas.ringHero].join('“, „')+'“; Geständnis-Tooltip „'+res.confessTip.slice(0,70)+'…“');
  // ─────────────────────────────────────────────── 3 · Nach dem Sieg
  /* Bild der Erfolgs-Einblendung (nach dem Aufstieg) */for(let i=0;i<60;i++){if(await read(`const m=document.querySelector('.milestone.milestone-feat.show');return !!m&&!m.hidden`)){await wait(500);await shot('39-erfolge-nach-aufstieg');break;}await wait(200);}
  await wait(3000);const ms=await read(`return LIE.milestones`);results.milestones=ms;const lv=ms.find(m=>/level/.test(m.kind)),ft=ms.filter(m=>/feat/.test(m.kind));
  assert.ok(lv,'Aufstieg gezeigt: '+JSON.stringify(ms));assert.ok(ft.length,'Erfolg gezeigt: '+JSON.stringify(ms));for(const f of ft)assert.ok(!f.until||f.until-f.at>=2400,'Erfolg steht lange genug: '+JSON.stringify(f));
  ok('Aufstieg und Erfolg nacheinander: '+ms.map(m=>m.kind.replace('milestone-','')+' „'+m.text.slice(0,28)+'“ '+((m.until||performance.now())-m.at>0?Math.round(((m.until||m.at)-m.at)/100)/10+' s':'')).join(' → '));
  const loot=await until(`const w=document.querySelector('.game-popup[data-window="loot"]');return w&&!w.hidden?{title:w.innerText.slice(0,40),r:(r=>({l:r.left,t:r.top,r:r.right,b:r.bottom}))(w.getBoundingClientRect())}:null`,25000);
  const qp=await read(`const r=document.querySelector('.quest-panel').getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}`);await shot('40-beute-neben-verfolgung');
  assert.ok(loot,'Beutefenster nach dem Sieg');const over=Math.max(0,Math.min(loot.r.r,qp.r)-Math.max(loot.r.l,qp.l))*Math.max(0,Math.min(loot.r.b,qp.b)-Math.max(loot.r.t,qp.t));assert.equal(over,0,'Beutefenster überdeckt die Verfolgung nicht: '+JSON.stringify({loot:loot.r,qp}));
  // Klick auf „Endtruhe“ in der Verfolgung (echte Maus) kommt an: Wegmarke, Held läuft hin
  const row=await elCenter('[data-dg-track-end="chest"]');const topEl=await read(`const p=${JSON.stringify(row)};return document.elementFromPoint(p.x,p.y)?.closest('[data-dg-track-end]')?.dataset.dgTrackEnd||''`);
  await clickAt(row);const walking=await read(`return !!g.moveTo||g.path?.length>0`);
  const arrived=await until(`const c=D.toWorld(g.dungeonRun.def,'k2',g.dungeonRun.def.chest.x,g.dungeonRun.def.chest.y);return Math.hypot(c.x-g.player.x,c.y-g.player.y)<34`,20000);
  assert.equal(topEl,'chest','Zeile „Endtruhe“ liegt oben (kein Fenster darüber)');assert.ok(walking&&arrived,'Klick auf „Endtruhe“ im Tracker läuft hin');
  // F an der Truhe: öffnet die Truhe, auch wenn das Big-B-Fenster offen ist
  await read(`const bag=g.rpg.loot.find(x=>x.moment&&x.source?.kind!=='chest');return 1`);await wait(500);
  const fLabel=await read(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')?i.innerText.trim():''`);
  const openBefore=await read(`return !!document.querySelector('.game-popup[data-window="loot"]')`);await b.press('f');await wait(800);
  const afterF=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return w?{choice:w.querySelector('[data-loot-choice]')?.textContent.trim()||'',items:w.querySelectorAll('[data-loot-item]').length,title:w.querySelector('.loot-moment-title')?.textContent||''}:null`);
  await shot('41-f-oeffnet-truhe');results.afterWin={loot,qp,topEl,fLabel,openBefore,afterF};
  assert.match(afterF?.choice||'',/1 \/ 3/,'F öffnet die Truhe (Dreierwahl): '+JSON.stringify(afterF));
  ok('Nach dem Sieg: Beutefenster links neben der Verfolgung (kein Überlapp), Klick auf „Endtruhe“ im Tracker läuft hin, F („'+fLabel+'“) öffnet die Truhe mit '+afterF.choice+(openBefore?' – das Big-B-Fenster war offen':''));
  // Verlassen ohne Wahl: Rückfrage mit den drei Teilen, Wahl per Maus → draußen, liegengebliebene Beute als kurze Meldung
  await b.press('Escape');await wait(400);await closeAll();
  const exitRow=await elCenter('[data-dg-track-end="exit"]');if(exitRow)await clickAt(exitRow);
  await until(`const b=g.dungeonRun?.def.backExit;const p=D.toWorld(g.dungeonRun.def,'k2',b.x,b.y);return Math.hypot(p.x-g.player.x,p.y-g.player.y)<40`,30000);await wait(700);await s.settle();
  const ep=await screen(`(b=>D.toWorld(g.dungeonRun.def,'k2',b.x,b.y))(g.dungeonRun.def.backExit)`);await clickAt({x:ep.x,y:ep.y-34},'right');await wait(900);
  const ask=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return {inside:!!g.instance,win:w?{ask:w.querySelector('[data-loot-leave]')?.innerText.trim()||'',items:w.querySelectorAll('[data-loot-item]').length}:null}`);
  await shot('42-rueckfrage-truhe');assert.ok(ask.inside,'noch drin');assert.equal(ask.win?.items,3,'Rückfrage mit drei Teilen: '+JSON.stringify(ask));assert.match(ask.win.ask,/Noch nichts gewählt/);
  const pick=await read(`const el=document.querySelectorAll('.game-popup[data-window="loot"] [data-loot-item]')[1];const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:el.dataset.lootItem}`);
  await clickAt(pick);const out=await until(`return !g.instance`,10000,100);await wait(900);const toasts=[];for(let i=0;i<80;i++){const t=await read(`return document.querySelector('#toast.visible')?.textContent||''`);if(t&&!toasts.includes(t))toasts.push(t);if(/Eingesammelt/.test(t)){await shot('43-draussen-meldung');break;}await wait(250);}
  await shot('43-draussen-meldung');const inv=await read(`return g.rpg.inventory.some(e=>e.id===${JSON.stringify(pick.id)})`);results.leave={ask,pick:pick.id,out:!!out,toasts,inv};
  assert.ok(out,'nach der Wahl draußen');assert.ok(inv,'gewähltes Teil im Rucksack');assert.ok(toasts.some(t=>/Eingesammelt/.test(t)),'liegengebliebene Beute als kurze Meldung: '+toasts.join(' | '));
  ok('Verlassen mit offener Wahl: Rückfrage „'+ask.win.ask+'“ mit 3 Teilen, Wahl per Maus → Burgstraße, gewähltes Teil im Rucksack; Meldung „'+toasts.find(t=>/Eingesammelt/.test(t))+'“');
 }
 // ─────────────────────────────────────────────── 4 · Tod im Kampf
 if(want(4)){
  // Rechtsklick auf Big B aus dem Gang (wie der Prüfer): der Held läuft hinein – beim Betreten kein Kampf, am Thron beginnt die Einleitung
  await loadBigB('vier');await put('k2',44,26);await wait(800);await s.settle();const bp=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);await clickAt({x:bp.x,y:bp.y-22},'right');
  const entry=await until(`const b=g.enemies.find(e=>e.bossId==='bigb');return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id==='thronsaal'&&{aggro:b.aggro,arena:g.dungeonRun.arena}`,15000,50);
  const introAt=await until(`return g.dungeonRun.intro&&{d:Math.round(Math.hypot(g.player.x-g.enemies.find(e=>e.bossId==='bigb').x,g.player.y-g.enemies.find(e=>e.bossId==='bigb').y)/8*10)/10}`,15000,100);
  const started=await until(`return !!g.enemies.find(e=>e.bossId==='bigb')?.aggro`,20000,200);results.entry={entry,introAt};
  assert.deepEqual([entry?.aggro,entry?.arena],[false,null],'beim Betreten kein Kampf');assert.ok(introAt,'am Thron beginnt die Einleitung');assert.ok(started,'Kampf beginnt');
  ok('Rechtsklick auf Big B aus dem Gang: beim Betreten kein Kampf, Einleitung '+introAt.d+' Kacheln vor Big B, danach Kampf');
  const res=await fight({death:92,limit:40000});results.death=res.death;const d=res.death;
  assert.ok(d?.shown,'Sterbefenster');assert.ok(d.rows.length>=3,'Rückblick mit mehreren Treffern: '+JSON.stringify(d.rows));assert.match(d.sum,/Σ/);assert.ok(d.rows.some(r=>/Big B/.test(r)),'Quelle genannt');
  assert.equal(d.gold,false,'im Kampf kein goldener Hauptknopf');assert.ok(d.outline,'zweitrangig');assert.equal(d.focusBtn,false,'kein Fokus auf dem Knopf');assert.equal(d.tip,false,'kein Tooltip ohne Hover');
  assert.equal(d.armed.dead,true,'erster Klick gibt nicht auf');assert.ok(d.armed.armed,'scharf');assert.match(d.armed.btn,/Nochmal/);assert.equal(d.later.armed,false,'nach 3 s wieder entschärft');assert.match(d.hoverTip,/Gibt den Kampf auf/,'Tooltip beim Hover');
  ok('Tod im Kampf: Rückblick '+d.sum+' mit '+d.rows.length+' Zeilen („'+d.rows.slice(-2).join('“, „')+'“), Knopf „'+d.btn+'“ zweitrangig, kein Tooltip ohne Hover, erster Klick nur „'+d.armed.btn+'“, danach wieder „'+d.later.btn+'“, Hover „'+d.hoverTip.slice(0,40)+'…“');
 }
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('ROT',e.message);try{await shot('zz-fehler');}catch{}process.exitCode=1;}
finally{await hold([]).catch(()=>{});writeFileSync(dir+'/ergebnis.json',JSON.stringify({checks,results,meas:{...meas,noAction:[...meas.noAction],stay:[...meas.stay],ringInfo:[...meas.ringInfo],ringHero:[...meas.ringHero],actions:[...meas.actions]}},null,1));b.close();}
