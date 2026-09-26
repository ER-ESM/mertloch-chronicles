// Browserprüfung Dungeon-Fix 7 (Prüferin #770, docs/DUNGEON-FIX7-2026-09-26.md). Echte Maus (CDP Input.dispatchMouseEvent) und echte Tasten.
// Testzugang wie bei der Prüferin (scripts/playtest-save.mjs --preset=bigb): Bärbel Heilung (baerbel-care), typische Ausrüstung, vier Söldner, drei Beweise,
// Rita liegt (Wut nach 3:35).
//  1 Rede: Rechtsklick auf den Boden bei Big B und auf Big B selbst, solange „Angreifbar in …“ läuft → kein Autoangriff, kein Pull, der Held läuft;
//    nach „bereit“ zieht nichts von selbst, erst der Rechtsklick. Big B ×1,5: gemessen gegen die Söldner (Anziehpuppe, Offscreen), Kopf anklickbar.
//  2 Todesfenster beim ersten Tod: sofort sichtbar, neben dem Bossrahmen, „Schorle-Susi hilft dir (gleich) auf“ mit Balken, Rückblick lesbar.
//  3 Tooltips: Notfallbrezel (Taste 0) nach WoW-Muster mit Werten, mit Umschalttaste alle Zahlen sichtbar (Farbe ≠ Fenstergrund); Löffelkur-Kopfzeile einzeilig.
//  4 Passiv wie die Prüferin: nach der Rede 20 s Autoangriff, Esc, dann nur Ausweichen (W/A/S/D) → Wipe unter der Wut, spätestens 20 s nach dem Ausbruch.
//  5 Aktiv als Heilerin (Spieler-Bot wie dungeon-fix6-check): Sieg mit Einsatz-Bonus; Einsatz-Zeile per Maus: jedes Feld Name und Wert, Sammel-Tooltip mit
//    Ausweichen; Big B bleibt im Thronsaal, der Schutz erreicht ihn (Wegsuche).
// Aufruf: CDP_PORT=9741 SERVER_PORT=4541 BOOT_TRIES=450 node scripts/dungeon-fix7-check.mjs   (ONLY=1,2,3,4,5)
// Bilder: visual-review/dungeon-fix7/*.jpg (lokal, nicht im Repo), Ergebnis results.json.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/dungeon-fix7';mkdirSync(dir,{recursive:true});
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!ONLY.length||ONLY.includes(String(n));
const s=await session({port:9741,serverPort:4541});const {b,read,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const results={};
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(50);await mouse(p,'mouseReleased',button);await wait(160);};
const held=new Set();
async function hold(keys){for(const k of [...held])if(!keys.includes(k)){await b.key(k,'keyUp');held.delete(k);}for(const k of keys)if(!held.has(k)){await b.key(k,'keyDown');held.add(k);}}
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top,k};`);
const elCenter=sel=>read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);
const tip=()=>read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText.replace(/\\s+/g,' ').trim():''`);
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
async function hover(sel,ms=900){const c=await elCenter(sel);if(!c)return '';await mouse({x:c.x+1,y:c.y+1});await wait(80);await mouse(c);await wait(ms);return tip();}
const clip=async(name,cx,cy,w=320,h=240,scale=2)=>{const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,clip:{x:Math.max(0,cx-w/2),y:Math.max(0,cy-h/2),width:w,height:h,scale}});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));};
const bigB=`g.enemies.find(e=>e.bossId==='bigb')`;
async function load(preset,name){
 const built=buildPlaytestSave({preset,classId:'baerbel',spec:'baerbel-care',gear:'typical',coins:600}),code=snippet(built,name);
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<300&&!await b.evaluate('!!window.game');i++)await wait(150);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.E=await import('/dungeon-einsatz.js');window.FX7={waves:[],deaths:[]};g.on?.('death',()=>FX7.deaths.push(g.time));const emit=g.emit.bind(g);g.emit=(t,d)=>{if(t==='dungeonEnrageWave')FX7.waves.push({t:g.time,...d});return emit(t,d);};return 1`);
 const st=await read(`return {inside:g.instance?.kind||null,spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.name),level:g.player.level}`);
 assert.equal(st.spec,'baerbel-care');assert.equal(st.inside,'dungeon');assert.equal(st.mercs.length,4);return st;}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,6));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x-30-Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
/** F am Thron: Beweise vorlegen, Rede. Während „Angreifbar in …“: Rechtsklick auf den Boden bei Big B und auf Big B selbst – nichts beginnt. */
async function speechClicks(){await b.press('f');const started=await until(`return !!g.dungeonRun.intro&&!g.dungeonRun.intro.ready`,8000,100);assert.ok(started,'Rede läuft');
 const p=await screen(bigB),from=await read(`return {x:g.player.x,y:g.player.y}`);
 await clickAt({x:p.x+46,y:p.y+26},'right');await wait(250);const a=await read(`const bb=${bigB};return {auto:g.autoAttack.enabled,aggro:!!bb.aggro,moving:!!g.moveTo,unready:D.bossUnready(g,bb)}`);
 await clickAt({x:p.x,y:p.y-30},'right');await wait(250);const c=await read(`const bb=${bigB};return {auto:g.autoAttack.enabled,aggro:!!bb.aggro,target:g.target===bb,unready:D.bossUnready(g,bb),left:g.dungeonRun.intro?.ready?0:1}`);
 await shot('10-rede-rechtsklick');return {a,c,from};}
async function pullNow(){let on=false;for(let i=0;i<4&&!on;i++){const p=await screen(bigB);if(p)await clickAt({x:p.x,y:p.y-26},'right');on=!!await until(`return !!${bigB}?.aggro`,6000,150);}assert.ok(on,'Kampf mit Big B beginnt');}
const BOT=`{
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,interrupt:false,dodge:false,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro,dead:g.dead,ft:Math.round(boss?.fightTime||0),pct:boss?Math.round(boss.hp/boss.maxHp*100):0,rage:boss?.rageFactor||1,wiped:!!g.dungeonRun?.ghost?.wiped};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  const k=boss.cast;out.interrupt=!!(k?.interruptible&&(g.cooldowns.interrupt||0)<=0&&k.total-k.remaining>.3);
  const sc=boss.sideCast;out.dodge=!!(sc&&(sc.focus||'player')==='player'&&sc.remaining<.38);out.claim=!!(k?.lie&&k.told===false);
  const hurt=g.companions.filter(c=>c.state!=='down'&&c.hp>0&&c.hp/c.maxHp<.8&&Math.hypot(c.x-p.x,c.y-p.y)<400).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  out.hurt=hurt?.id||null;out.heal=(g.cooldowns.heal||0)<=0;out.buff=(g.cooldowns.buff||0)<=0;out.enemy=g.target===boss;out.gcd=g.gcd>0||!!g.casting;
  const bossRoom=D.roomAt(run.def,boss.x,boss.y)?.id,tank=g.companions.find(c=>c.def.role==='tank');out.bossRoom=bossRoom;out.tankNear=!!tank&&tank.state!=='down'&&Math.hypot(tank.x-boss.x,tank.y-boss.y)<40;return out;}
}`;
const frameOf=id=>`[data-companion-select="${id}"]`;
async function move(st){if(!st.move){await hold([]);return;}const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}
try{
 // ─────────────────────────────────────────────── 1 · Rede: Laufklick startet nichts · Big B ×1,5
 if(want(1)){const hero=await load('bigb','Fix Sieben Rede');results.speech={hero};await put('k2',54,23);await wait(900);await s.settle();
  const {a,c}=await speechClicks();results.speech.clicks={a,c};
  assert.equal(a.auto,false,'Boden bei Big B: kein Autoangriff');assert.equal(a.aggro,false,'kein Pull');assert.ok(a.moving,'der Held läuft');
  assert.equal(c.auto,false,'Rechtsklick auf Big B in der Rede: kein Autoangriff');assert.equal(c.aggro,false,'kein Pull');assert.equal(c.left,1,'Rede läuft noch');
  const ready=await until(`return !!g.dungeonRun.intro?.ready`,30000,150);assert.ok(ready,'bereit');await wait(1500);
  const still=await read(`const bb=${bigB};return {aggro:!!bb.aggro,auto:g.autoAttack.enabled}`);assert.equal(still.aggro,false,'bei „bereit“ zieht nichts von selbst');assert.equal(still.auto,false);
  ok('Rede: Rechtsklick auf den Boden bei Big B und auf Big B – kein Autoangriff, kein Pull, der Held läuft; bei „bereit“ zieht nichts von selbst');
  // Big B ×1,5: gemessen wie im Spiel gezeichnet (Anziehpuppe, Offscreen), gegen die Söldner
  const size=await read(`const P=await import('/paperdoll-art.js'),F=await import('/dungeon-figuren-art.js'),A=await import('/dungeon-actors.js');
   const box=draw=>{const cv=document.createElement('canvas');cv.width=600;cv.height=600;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.setTransform(4,0,0,4,0,0);draw(x);const d=x.getImageData(0,0,600,600).data;let t=1e9,bt=-1,l=1e9,r=-1;for(let y=0;y<600;y++)for(let X=0;X<600;X++)if(d[(y*600+X)*4+3]>40){t=Math.min(t,y);bt=Math.max(bt,y);l=Math.min(l,X);r=Math.max(r,X);}return {h:+((bt-t+1)/4).toFixed(1),w:+((r-l+1)/4).toFixed(1)};};
   const bb=${bigB},clone={...bb,x:75,y:140,cast:null,moving:false,attack:0,hurt:0,direction:'se'},sc=A.dungeonScale(bb),big=box(x=>{x.translate(75,140);x.scale(sc,sc);x.translate(-75,-140);F.drawDungeonFigure(x,clone,0);});
   const mercs=g.companions.map(c=>box(x=>P.drawPaperdoll(x,'npc:'+c.id,75,140,{direction:'se',seed:0},1)));return {scale:sc,big,mercs,ratio:+(big.h/Math.max(...mercs.map(m=>m.h))).toFixed(2)};`);
  results.speech.size=size;assert.equal(size.scale,1.5);assert.ok(size.ratio>=1.6,'Big B deutlich größer als die Söldner: '+JSON.stringify(size));
  const pb=await screen(bigB);await clip('11-bigb-groesse',pb.x+20,pb.y-40,360,260,2);
  // Kopf anklickbar: Rechtsklick auf die Krone zieht ihn (jetzt „bereit“)
  const head=await screen(`(()=>{const bb=${bigB};return {x:bb.x,y:bb.spriteTop+5};})()`);await clickAt(head,'right');
  const pulled=await until(`return !!${bigB}.aggro`,6000,150);assert.ok(pulled,'Rechtsklick auf den Kopf zieht Big B');
  ok('Big B ×'+size.scale+': '+size.big.h+' Welteinheiten hoch (mit Krone) gegen '+size.mercs.map(m=>m.h).join('/')+' der Söldner = '+size.ratio+'×; Rechtsklick auf den Kopf trifft ihn');
  // ─────────────────────────────────────────────── 2 · Todesfenster beim ersten Tod (gleicher Kampf)
  if(want(2)){await wait(2500);await read(`const bb=${bigB};g.hitPlayer(bb,0,false,.45);g.hitPlayer(bb,0,false,.4);g.hitPlayer(bb,0,false,5);return 1`);const t0=Date.now();
   const first=await until(`const w=document.querySelector('#deathScreen');if(!g.dead||!w||w.hidden||!w.classList.contains('show'))return null;const r=w.getBoundingClientRect(),fr=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect();
    return {ms:0,rect:{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},side:w.dataset.dsSide||'',opacity:getComputedStyle(w).opacity,ghost:w.querySelector('[data-ds-ghost-text]')?.textContent||'',bar:!!w.querySelector('.ds-ghost.reviving .ds-revive-bar'),recap:[...w.querySelectorAll('.ds-recap-row')].length,overFrame:!!fr&&r.left<fr.right&&fr.left<r.right&&r.top<fr.bottom&&fr.top<r.bottom}`,3000,50);
   const ms=Date.now()-t0;await shot('20-erster-tod');assert.ok(first,'Todesfenster beim ersten Tod');results.death={...first,ms};
   assert.equal(first.opacity,'1','sofort voll sichtbar');assert.ok(first.side,'neben dem Bossrahmen');assert.ok(!first.overFrame,'nicht über dem Bossrahmen');
   assert.match(first.ghost,/Schorle-Susi hilft dir (gleich )?auf/,'Rettung angekündigt: '+first.ghost);assert.ok(first.bar,'mit Balken');
   const fill=await until(`const f=document.querySelector('[data-ds-revive-fill]');return f&&parseFloat(f.style.width)>20&&document.querySelector('[data-ds-ghost-text]').textContent`,15000,200);
   ok('Erster Tod: Todesfenster nach '+ms+' ms ('+first.side+' neben dem Bossrahmen, '+first.rect.w+'×'+first.rect.h+'), „'+first.ghost+'“ mit Balken'+(fill?', dann „'+fill+'“ mit laufendem Balken':'')+', Rückblick '+first.recap+' Zeilen');
   await shot('21-tod-rettung');await read(`g.adminGod=true;return 1`);}
 }
 // ─────────────────────────────────────────────── 3 · Tooltips: Notfallbrezel, Löffelkur
 if(want(3)){if(!await read(`return !!window.D`))await load('bigb','Fix Sieben Tooltip');await closeAll();
  await read(`const {addItem}=await import('/rpg.js');addItem(g.rpg,'brezel',3);g.emit('rpgChanged');return 1`);await wait(800);
  const t=await hover('[data-bar-item="brezel"]',1100);await shot('30-brezel-tooltip');
  const box=await read(`const t=document.querySelector('#itemTooltip'),r=t.getBoundingClientRect(),m=t.querySelector('.tip-meta'),n=t.querySelector('.tip-numbers');return {h:Math.round(r.height),w:Math.round(r.width),meta:m?.textContent||'',metaH:m?Math.round(m.getBoundingClientRect().height):0,nums:n?.textContent||'',details:!!t.querySelector('.describe-details[hidden]')}`);
  assert.match(t,/Notfallbrezel/i);assert.match(box.nums,/^Heilt \d+$/,'Zahlenzeile: '+box.nums);assert.match(box.meta,/15 s Abklingzeit/);assert.ok(box.details,'Zahlen-Tabelle nur in den Details');assert.ok(box.h<=210,'kurz: '+box.h+' px');
  assert.ok(!/…|undefined/.test(t),'keine leeren Werte: '+t);
  await b.key('Shift','keyDown');await wait(500);const shift=await read(`const t=document.querySelector('#itemTooltip'),bs=[...t.querySelectorAll('.describe-numbers .is-live b')];const bg=getComputedStyle(t).backgroundColor;return {rows:bs.map(x=>x.textContent+'|'+getComputedStyle(x).color),bg,visible:bs.every(x=>x.textContent.trim()&&getComputedStyle(x).color!=='rgb(34, 58, 47)')}`);
  await shot('31-brezel-details');await b.key('Shift','keyUp');results.tooltip={text:t,box,shift};
  assert.ok(shift.rows.length,'Details mit Laufzeitwerten');assert.ok(shift.visible,'Werte sichtbar (nicht in Fenstergrund-Farbe): '+JSON.stringify(shift));
  ok('Notfallbrezel: „'+t.slice(0,120)+'“ ('+box.w+'×'+box.h+' px); mit Umschalttaste Werte '+shift.rows.map(r=>r.split('|')[0]).join(', ')+' sichtbar');
  const lk=await hover('[data-skill="heal"][data-action-slot]',1100);const lm=await read(`const m=document.querySelector('#itemTooltip .tip-meta');if(!m)return null;const cs=getComputedStyle(m);return {text:m.textContent,h:Math.round(m.getBoundingClientRect().height),lh:parseFloat(cs.lineHeight)||15,sw:m.scrollWidth,cw:m.clientWidth}`);
  await shot('32-loeffelkur-tooltip');results.tooltip.loeffelkur={lk,lm};assert.ok(lm,'Löffelkur-Tooltip mit Kopfzeile: '+lk);assert.doesNotMatch(lm.text,/kostenlos/);assert.ok(lm.h<=lm.lh+8&&lm.sw<=lm.cw+1/* 5 px Innenabstand und Trennlinie oben */,'eine Zeile, nicht abgeschnitten: '+JSON.stringify(lm));
  ok('Löffelkur-Kopfzeile einzeilig: „'+lm.text+'“ ('+lm.h+' px)');await mouse({x:1000,y:300});}
 // ─────────────────────────────────────────────── 4 · passiv wie die Prüferin: Wipe unter der Wut
 if(want(4)){const hero=await load('bigb','Fix Sieben Passiv');results.passive={hero};await put('k2',54,23);await wait(900);await s.settle();await read(`window.BOT=${BOT};return 1`);
  await speechClicks();await until(`return !!g.dungeonRun.intro?.ready`,30000,150);await pullNow();
  const t0=Date.now();/* etwa 20 s Autoangriff wie die Prüferin, dann Esc und nur noch ausweichen */
  while(Date.now()-t0<20000){const st=await read(`return BOT.step(g)`);if(!st.alive)break;if(st.dead){await hold([]);await wait(300);continue;}await move(st);await wait(120);}
  await hold([]);await b.press('Escape');const auto=await read(`return g.autoAttack.enabled`);assert.equal(auto,false,'Autoangriff aus');
  let end=null,lastShot=0,enrageAt=null,minPct=100;const t1=Date.now();
  while(Date.now()-t1<330000){const st=await read(`return BOT.step(g)`);
   if(st.fight)minPct=Math.min(minPct,st.pct);if(st.rage>1&&enrageAt==null){enrageAt=st.ft;await shot('40-wut');}
   if(!st.alive){end={won:true,...st};break;}if(st.wiped){end={won:false,...st};break;}
   if(!st.dead)await move(st);else await hold([]);if(enrageAt!=null&&Date.now()-lastShot>5000){lastShot=Date.now();await shot('41-unter-wut-'+Math.round((Date.now()-t1)/1000));}await wait(130);}
  await hold([]);const w=await read(`return {waves:FX7.waves.length,first:FX7.waves[0]||null,last:FX7.waves.at(-1)||null,deaths:FX7.deaths.length,after:D.enrageAfter(g.dungeonRun,'bigb')}`);results.passive={...results.passive,end,waves:w,enrageAt,minPct};await shot('42-passiv-ende');
  assert.ok(end,'Kampf endet');assert.equal(end.won,false,'passiv verliert');assert.ok(w.waves>=3,'Wutwellen: '+w.waves);
  const wipeAfter=w.last?+(w.last.t-w.first.t).toFixed(1):null;assert.ok(wipeAfter!=null&&wipeAfter<=20,'Wipe spätestens 20 s nach dem Ausbruch: '+wipeAfter);
  ok('Passiv wie die Prüferin (20 s Autoangriff, Esc, ausweichen): verloren, Wut nach '+w.after+' s, '+w.waves+' Wutwellen, Wipe '+wipeAfter+' s nach dem Ausbruch, Big B zuletzt bei '+minPct+' %');}
 // ─────────────────────────────────────────────── 5 · aktiv als Heilerin: Sieg mit Einsatz-Bonus
 if(want(5)){const hero=await load('bigb','Fix Sieben Aktiv');results.active={hero};await read(`window.BOT=${BOT};return 1`);
  await put('k2',54,23);await wait(900);await s.settle();await b.press('f');await until(`return !!g.dungeonRun.intro?.ready`,30000,150);await pullNow();
  const t0=Date.now();let lastRe=0,lastAtk=0,lastHeal=0,k=0,rooms=new Set(),tankNear=false;
  while(Date.now()-t0<420000){const st=await read(`return BOT.step(g)`);if(!st.alive){await hold([]);results.active.won=true;results.active.ft=st.ft;break;}
   if(st.bossRoom)rooms.add(st.bossRoom);tankNear||=st.tankNear;
   if(!st.dead){if(st.move)await move(st);
    else{await hold([]);
     if(st.dodge)await b.press(' ');
     else if(st.interrupt){if(!st.enemy){const p=await screen(bigB);if(p)await clickAt({x:p.x,y:p.y-26},'right');}await b.press('q');}
     else if(st.hurt&&!st.gcd&&(st.heal||st.buff)&&Date.now()-lastHeal>900){const c=await elCenter(frameOf(st.hurt));if(c){await clickAt(c);await b.press(st.heal?'9':'3');lastHeal=Date.now();}}
     else if(!st.enemy&&!st.claim&&Date.now()-lastRe>1200){const p=await screen(bigB);if(p){await clickAt({x:p.x,y:p.y-26},'right');lastRe=Date.now();}}
     else if(st.enemy&&!st.gcd&&Date.now()-lastAtk>900){await b.press(['2','6','7'][k++%3]);lastAtk=Date.now();}}}
   else await hold([]);
   await wait(110);}
  await hold([]);results.active.seconds=Math.round((Date.now()-t0)/1000);results.active.rooms=[...rooms];results.active.tankNear=tankNear;
  assert.ok(results.active.won,'aktive Heilerin gewinnt');assert.equal(rooms.size,1,'Big B bleibt in seinem Raum: '+[...rooms]);assert.ok(tankNear,'der Schutz erreicht Big B');
  const row=await until(`const r=document.querySelector('[data-einsatz]');return r&&r.getBoundingClientRect().width>0&&{score:+r.dataset.einsatzScore,bonus:+r.dataset.einsatzBonus,text:r.innerText.replace(/\\s+/g,' ').trim(),parts:[...r.querySelectorAll('[data-einsatz-part]')].map(c=>({part:c.dataset.einsatzPart,label:c.dataset.tooltipLabel,value:c.querySelector('b')?.textContent||''}))}`,15000,200);
  assert.ok(row,'Beute-Moment mit Einsatz-Zeile');await wait(400);await shot('50-einsatz-zeile');
  const tips={};for(const p of row.parts){tips[p.part]=await hover(`[data-einsatz-part="${p.part}"]`,700);}await shot('51-einsatz-tooltip');await mouse({x:1000,y:300});
  results.active.einsatz={row,tips};assert.ok(row.bonus>=1,'Einsatz-Bonus: '+row.score);
  for(const p of row.parts)if(p.value!=='–')assert.ok(tips[p.part].includes(p.value)&&tips[p.part].length>p.value.length+3,'Feld '+p.part+' nennt Namen und Wert: '+tips[p.part]);
  assert.match(tips.score,/Ausweichen \d+/,'Sammel-Tooltip mit Ausweichen: '+tips.score);assert.ok(row.text.length<80,'kurz: '+row.text);
  ok('Aktive Heilerin gewinnt nach '+results.active.seconds+' s (Kampf '+results.active.ft+' s): „'+row.text+'“, Bonus +'+row.bonus+'; Tooltips '+row.parts.map(p=>'„'+tips[p.part].split(/[.:]/)[0].slice(0,28)+'“').join(' ')+'; Big B blieb im '+[...rooms][0]+', der Schutz stand bei ihm');}
}finally{writeFileSync(dir+'/results.json',JSON.stringify(results,null,1));await hold([]).catch(()=>{});await s.close?.();await b.close?.();}
console.log('\n'+checks.length+' Prüfungen grün');
