// Browserprüfung „Held aktiv“ (2026-09-26, docs/DUNGEON-AKTIV-2026-09-26.md). Big B über den Testzugang `bigb` (scripts/playtest-save.mjs):
// Held Stufe 10, Tresenbrecher (dieter-brawl), typische Ausrüstung, vier Söldner, drei Beweise gefunden. Echte Maus (CDP Input.dispatchMouseEvent)
// und echte Tasten; ein Spieler-Bot weicht aus (W/A/S/D), unterbricht (Q), antwortet auf den Siegelring (Leer) und greift an (Rechtsklick, Kniffe).
//  1 Kampfbeginn ohne eigene Tat: Bossrahmen zeigt „Söldner warten“, Tooltip per Maus erklärt, warum.
//  2 Der Held greift an: Einblendung „ANGEFEUERT“ über den Söldnern, Chip „Angefeuert“ im Bossrahmen, „Angefeuert“ in der Buffleiste mit Tooltip.
//  3 Big B aktiv gespielt bis zum Sieg: Beute-Moment mit der Zeile „Einsatz“ (Punkte, Anteil, Unterbrechungen, Warnungen, Angefeuert,
//    Bonus-Siegelmarken); Tooltips per Maus; die Siegelmarken auf dem Konto steigen um Boss-Marken plus Einsatz-Bonus.
//  4 Handy-Größe der Einsatz-Chips (Touch-Modus): Tipp-Ziele ≥ 44 px, nichts ragt aus dem Beutefenster.
// Aufruf: CDP_PORT=9741 SERVER_PORT=4541 BOOT_TRIES=450 node scripts/dungeon-aktiv-check.mjs   (ONLY=1,2,3,4 – alle laufen im selben Kampf).
// Bilder: visual-review/dungeon-aktiv/*.jpg (lokal, nicht im Repo).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/dungeon-aktiv';mkdirSync(dir,{recursive:true});
const s=await session({port:9741,serverPort:4541});const {b,read,closeAll}=s;
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
const auraTip=()=>read(`const t=document.querySelector('#auraTooltip');return t&&!t.hidden?t.innerText.replace(/\\s+/g,' ').trim():''`);
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
async function hover(sel,read2=tip,ms=900){const c=await elCenter(sel);if(!c)return '';await mouse(c);await wait(ms);return read2();}
// ── Testheld wie beim Prüfer ────────────────────────────────────────────────────────────────────────────────────────────────
async function loadBigB(){
 const built=buildPlaytestSave({preset:'bigb',classId:'dieter',spec:'dieter-brawl',gear:'typical',coins:600}),code=snippet(built,'Aktiv Pruefer');
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<300&&!await b.evaluate('!!window.game');i++)await wait(150);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.E=await import('/dungeon-einsatz.js');window.BOT=${BOT};BOT.watch(g);return 1`);
 const st=await read(`return {inside:g.instance?.kind,spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.name),level:g.player.level,marks:g.dungeons['schloss-bigb'].marks|0}`);
 assert.equal(st.inside,'dungeon');assert.equal(st.mercs.length,4);return st;}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,9));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+10+Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
// ── Spieler-Bot (im Browser): weicht aktiven Warnflächen aus, meldet Unterbrechen und Siegelring ─────────────────────────────
const BOT=`{
 watch(g){window.AKT={shouts:[],evade:0};const sct=g.sct.bind(g);g.sct=d=>{if(d?.text&&/ANGEFEUERT|ALLES ODER NICHTS|NOTFALL|AUSWEICH/.test(d.text))AKT.shouts.push({text:d.text,actor:d.actor||'',at:g.time});return sct(d);};},
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,interrupt:false,dodge:false,near:false,phase:boss?Math.round(boss.hp/boss.maxHp*100):0,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro,intro:!!g.dungeonRun?.intro};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  const k=boss.cast;out.interrupt=!!(k?.interruptible&&(g.cooldowns.interrupt||0)<=0&&k.total-k.remaining>.3);
  const sc=boss.sideCast;out.dodge=!!(sc&&(sc.focus||'player')==='player'&&sc.remaining<.38);
  out.near=Math.hypot(boss.x-p.x,boss.y-p.y)<70;out.claim=!!(k?.lie&&k.told===false);return out;}
}`;
async function fight({limit=520000,attack=true}={}){
 const t0=Date.now();let k=0,lastRe=0,lastAtk=0,res={};
 while(Date.now()-t0<limit){
  const st=await read(`return BOT.step(g)`);
  if(!st.alive){await hold([]);res.won=true;break;}
  const dead=await read(`return g.dead`);
  if(!dead){if(st.move){const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}
   else{await hold([]);
    if(attack&&st.interrupt)await b.press('q');
    if(st.dodge)await b.press(' ');
    if(attack&&!st.near&&!st.claim&&Date.now()-lastRe>2500){const p=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);if(p){await clickAt({x:p.x,y:p.y-22},'right');lastRe=Date.now();}}
    else if(attack&&st.near&&st.fight&&Date.now()-lastAtk>900){await b.press(['2','6','7'][k++%3]);lastAtk=Date.now();}}}
  else await hold([]);
  await wait(110);}
 await hold([]);res.seconds=Math.round((Date.now()-t0)/1000);return res;}

try{
 const hero=await loadBigB();results.hero=hero;
 // Vor den Thron, F: Einleitung; danach beginnt der Kampf (bzw. der Held zieht Big B selbst, falls er nach der Einleitung wartet)
 await put('k2',54,23);await wait(900);await s.settle();await b.press('f');
 let fightOn=await until(`return !!g.enemies.find(e=>e.bossId==='bigb')?.aggro`,15000,200);
 /* Dungeon-Fix 5: nach der Rede wartet Big B („bereit“), bis der Held angreift – Rechtsklick, bis der Kampf läuft */
 for(let i=0;i<4&&!fightOn;i++){await until(`return !!g.dungeonRun.intro?.ready||!!g.enemies.find(e=>e.bossId==='bigb')?.aggro`,20000,200);const p=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);if(p)await clickAt({x:p.x,y:p.y-22},'right');fightOn=await until(`return !!g.enemies.find(e=>e.bossId==='bigb')?.aggro`,10000,200);}
 assert.ok(fightOn,'Kampf mit Big B beginnt');
 // ─────────────────────────────────────────────── 1 · ohne eigene Tat: „Söldner warten“
 await read(`g.stopAuto?.();g.target=null;g.moveTo=null;return 1`);
 const idle=await until(`const c=document.querySelector('.bf-chip[data-chip="rally"]');return c&&c.classList.contains('bf-warn')&&!E.rallyActive(g)&&{text:c.innerText.trim(),label:c.dataset.tooltipLabel}`,20000,200);
 assert.ok(idle,'Bossrahmen: Chip „Söldner warten“, solange der Held nichts tut');
 const idleTip=await hover('.bf-chip[data-chip="rally"]');await shot('10-soeldner-warten');await mouse({x:1000,y:300});
 assert.match(idleTip,/ohne Rückenwind/,'Tooltip erklärt „Söldner warten“: '+idleTip);
 ok('Ohne eigene Tat: Bossrahmen „'+idle.text+'“, Tooltip „'+idleTip.slice(0,70)+'…“');results.idle={...idle,tip:idleTip};
 // ─────────────────────────────────────────────── 2 · der Held greift an: Angefeuert
 {const p=await screen(`g.enemies.find(e=>e.bossId==='bigb')`);await clickAt({x:p.x,y:p.y-22},'right');}
 const rally=await until(`const c=document.querySelector('.bf-chip[data-chip="rally"]');return E.rallyActive(g)&&c&&c.classList.contains('bf-good')&&{text:c.innerText.trim(),shouts:AKT.shouts.filter(x=>x.text==='ANGEFEUERT').length}`,20000,150);
 assert.ok(rally,'Chip „Angefeuert“, sobald der Held trifft');await wait(300);
 const rallyTip=await hover('.bf-chip[data-chip="rally"]');await shot('11-angefeuert-bossrahmen');
 const auraTipText=await hover('#buffStrip [data-aura="rally"]',auraTip,600);await shot('12-angefeuert-buffleiste');await mouse({x:1000,y:300});
 assert.ok(rally.shouts>=3,'Einblendung „ANGEFEUERT“ über den Söldnern: '+rally.shouts);assert.match(rallyTip,/mehr Schaden/,'Tooltip Angefeuert: '+rallyTip);assert.match(auraTipText,/Angefeuert/,'Buffleiste: '+auraTipText);
 ok('Held greift an: „ANGEFEUERT“ über '+rally.shouts+' Söldnern, Bossrahmen „'+rally.text+'“ (Tooltip „'+rallyTip.slice(0,60)+'…“), Buffleiste mit Tooltip');results.rally={...rally,tip:rallyTip,aura:auraTipText};
 // ─────────────────────────────────────────────── 3 · aktiv bis zum Sieg, Einsatz im Beute-Moment
 const res=await fight();results.fight=res;assert.ok(res.won,'Big B besiegt');
 const row=await until(`const r=document.querySelector('[data-einsatz]');return r&&r.getBoundingClientRect().width>0&&{score:+r.dataset.einsatzScore,bonus:+r.dataset.einsatzBonus,parts:[...r.querySelectorAll('[data-einsatz-part]')].map(c=>({part:c.dataset.einsatzPart,text:c.innerText.trim(),label:c.dataset.tooltipLabel}))}`,40000,300);
 assert.ok(row,'Beute-Moment zeigt die Zeile „Einsatz“');await wait(500);await shot('20-einsatz-beute-moment');
 const reward=await read(`const e=g.enemies.find(x=>x.bossId==='bigb');const r=e?.dungeonReward;return {marks:r?.marks,einsatz:r?.einsatz,now:g.dungeons['schloss-bigb'].marks|0,shouts:AKT.shouts.length,interrupts:g.stats.interrupts}`);
 const scoreTip=await hover('[data-einsatz-part="score"]');await shot('21-einsatz-tooltip');
 const bonusTip=await hover('[data-einsatz-part="bonus"]');await shot('22-bonus-tooltip');await mouse({x:1000,y:300});
 const text=await read(`return document.querySelector('[data-einsatz]').innerText.replace(/\\s+/g,' ').trim()`);
 for(const part of ['score','damage','interrupts','warn','rally','bonus'])assert.ok(row.parts.some(p=>p.part===part),'Teil '+part);
 assert.ok(row.score>=60&&row.bonus>=1,'aktiver Held verdient den Einsatz-Bonus: '+row.score);assert.match(scoreTip,/von 100/,'Tooltip Punkte: '+scoreTip);assert.match(bonusTip,/Siegelmarke/,'Tooltip Bonus: '+bonusTip);
 assert.equal(reward.now-hero.marks,reward.marks+reward.einsatz.bonus,'Siegelmarken: Boss '+reward.marks+' + Einsatz '+reward.einsatz.bonus);
 assert.ok(text.length<80,'keine Textwand in der Zeile: '+text);
 ok('Sieg nach '+res.seconds+' s: Einsatz '+row.score+' ('+row.parts.map(p=>p.part+' '+p.text).join(', ')+'), Bonus +'+row.bonus+' Siegelmarke(n); Konto +'+(reward.now-hero.marks)+' = Boss '+reward.marks+' + Einsatz '+reward.einsatz.bonus+'; Tooltip „'+scoreTip.slice(0,60)+'…“');
 results.einsatz={row,reward,scoreTip,bonusTip,text};
 // ─────────────────────────────────────────────── 4 · Touch-Größe der Chips
 const touch=await read(`document.body.classList.add('touch-mode');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const w=document.querySelector('[data-einsatz]').closest('.game-popup')?.getBoundingClientRect();
  const out=[...document.querySelectorAll('[data-einsatz-part]')].map(c=>{const r=c.getBoundingClientRect();return {part:c.dataset.einsatzPart,w:Math.round(r.width),h:Math.round(r.height),inside:!w||r.left>=w.left-1&&r.right<=w.right+1}});document.body.classList.remove('touch-mode');return out;`);
 assert.ok(touch.every(t=>t.w>=44&&t.h>=44),'Tipp-Ziele ≥ 44 px: '+JSON.stringify(touch));assert.ok(touch.every(t=>t.inside),'nichts ragt aus dem Fenster');
 ok('Touch-Modus: '+touch.length+' Einsatz-Chips je ≥ 44 × 44 px, alle im Beutefenster');results.touch=touch;
}finally{writeFileSync(dir+'/results.json',JSON.stringify(results,null,1));await hold([]).catch(()=>{});await s.close?.();await b.close?.();}
console.log('\n'+checks.length+' Prüfungen grün');
