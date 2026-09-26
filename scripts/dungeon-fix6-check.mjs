// Browserprüfung Dungeon-Fix 6 (Prüferin #741, docs/DUNGEON-FIX6-2026-09-26.md). Echte Maus (CDP Input.dispatchMouseEvent) und echte Tasten.
// Testzugang wie bei der Prüferin (scripts/playtest-save.mjs): Bärbel Heilung (baerbel-care), typische Ausrüstung, Stufe 10.
//  1 Eingangskarte (--preset=vor): freie Plätze zeigen die fehlende Rolle, Schutz- und Schadens-Söldner stehen vorn und leuchten, eine zweite Heilung
//    hinten gedämpft; Tooltip per Maus; Anheuern per Klick, danach fehlt der Schutz nicht mehr.
//  2 Passiv wie die Prüferin (--preset=bigb, vier Söldner, drei Beweise): im Thronsaal hinter der rechten Säule (die Säule blendet aus), F, nach der
//    Rede ein Rechtsklick auf Big B, Esc, danach nichts mehr. Bossrahmen „Söldner warten“ (auch tot), Countdown der Warnleiste läuft, Todesfenster
//    neben dem Bossrahmen (Big B, Tank und Bildmitte frei), Rückblick je Tod. Muss verlieren (Wut 3:35).
//  3 Aktiv als Heilerin mit derselben Gruppe: ein Spieler-Bot weicht aus (W/A/S/D), unterbricht (Q), pariert (Leer), wählt verletzte Söldner über
//    die Truppenrahmen (Linksklick) und heilt (9, 3), sonst Rechtsklick auf Big B und Kniffe. Truppenrahmen zeigen „Angefeuert“ und eigene HoTs/Schilde
//    ohne Scrollen, „ANGEFEUERT“ steht als Ausruf mit Text über den Söldnern. Sieg, Einsatz-Zeile mit „Einsatz“ und Bonus, Plakette des Freundes.
//  4 Touch-Modus: die Rahmen-Buffs bleiben im Rahmen.
// Aufruf: CDP_PORT=9741 SERVER_PORT=4541 BOOT_TRIES=450 node scripts/dungeon-fix6-check.mjs   (ONLY=1,2,3,4; FIX6_OLD=1: Teil 2 mit den Regeln von #741)
// Bilder: visual-review/dungeon-fix6/*.jpg (lokal, nicht im Repo), Ergebnis results.json.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
const dir='visual-review/dungeon-fix6';mkdirSync(dir,{recursive:true});
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!ONLY.length||ONLY.includes(String(n)),OLD=!!process.env.FIX6_OLD;
const s=await session({port:9741,serverPort:4541});const {b,read,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const results={};
// ── Maus und Tasten ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(50);await mouse(p,'mouseReleased',button);await wait(160);};
const held=new Set();
async function hold(keys){for(const k of [...held])if(!keys.includes(k)){await b.key(k,'keyUp');held.delete(k);}for(const k of keys)if(!held.has(k)){await b.key(k,'keyDown');held.add(k);}}
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top};`);
const elCenter=sel=>read(`const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null`);
const tip=()=>read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText.replace(/\\s+/g,' ').trim():''`);
async function until(js,ms=20000,step=200){const t0=Date.now();while(Date.now()-t0<ms){const v=await read(js);if(v)return v;await wait(step);}return null;}
async function hover(sel,ms=900){const c=await elCenter(sel);if(!c)return '';await mouse({x:c.x+1,y:c.y+1});await wait(80);await mouse(c);await wait(ms);return tip();}
const bigB=`g.enemies.find(e=>e.bossId==='bigb')`;
// ── Testheld wie bei der Prüferin ────────────────────────────────────────────────────────────────────────────────────────────
async function load(preset,name){
 const built=buildPlaytestSave({preset,classId:'baerbel',spec:'baerbel-care',gear:'typical',coins:600}),code=snippet(built,name);
 await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
 await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);
 for(let i=0;i<300&&!await b.evaluate('!!window.game');i++)await wait(150);
 for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
 await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
 await read(`window.D=await import('/dungeon.js');window.E=await import('/dungeon-einsatz.js');window.K=await import('/kit-art.js');window.SC=await import('/dungeon-scenery-art.js');window.CU=await import('/companion-ui.js');
  window.FX6={deaths:[],callouts:[],shouts:[]};g.on?.('death',ev=>FX6.deaths.push({t:g.time}));
  const sct=g.sct.bind(g);g.sct=d=>{if(d?.callout)FX6.shouts.push({text:d.text,actor:d.actor||'',t:g.time});return sct(d);};
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.classList?.contains('sct-callout')){const bb=n.querySelector('b');FX6.callouts.push({text:bb?.textContent||'',shown:!!bb&&getComputedStyle(bb).display!=='none',boss:document.body.classList.contains('boss-fight'),size:parseFloat(getComputedStyle(n).fontSize)});}}).observe(document.querySelector('#sct'),{childList:true,subtree:true});return 1`);
 const st=await read(`return {inside:g.instance?.kind||null,spec:g.rpg.talents.spec,mercs:g.companions.map(c=>c.name),level:g.player.level,marks:g.dungeons?.['schloss-bigb']?.marks|0}`);
 assert.equal(st.spec,'baerbel-care');return st;}
const put=(f,x,y)=>read(`const p=D.toWorld(g.dungeonRun.def,'${f}',${x},${y});Object.assign(g.player,g.world.findClear(p.x,p.y,6));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x-30-Math.random()*16,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;}return 1`);
/** F am Thron (Beweise vorlegen, Rede), dann ein Rechtsklick auf Big B, sobald er „bereit“ ist. */
async function pull(){await b.press('f');await until(`return !!g.dungeonRun.intro?.ready||!!${bigB}?.aggro`,30000,200);
 let on=false;for(let i=0;i<4&&!on;i++){const p=await screen(bigB);if(p)await clickAt({x:p.x,y:p.y-22},'right');on=!!await until(`return !!${bigB}?.aggro`,6000,150);}
 assert.ok(on,'Kampf mit Big B beginnt');}
/** Spieler-Bot (im Browser): Warnflächen, Unterbrechen, Siegelring – wie scripts/dungeon-aktiv-check.mjs. */
const BOT=`{
 danger(g){return D.activeWarnAreas(g).filter(a=>a.danger);},
 safe(g,q,areas){return !areas.some(a=>a.contains(q)||a.contains({x:q.x+8,y:q.y})||a.contains({x:q.x-8,y:q.y})||a.contains({x:q.x,y:q.y+6})||a.contains({x:q.x,y:q.y-6}));},
 step(g){const p=g.player,boss=g.enemies.find(e=>e.bossId==='bigb'),out={move:null,interrupt:false,dodge:false,alive:!!boss&&boss.hp>0,fight:!!boss&&boss.aggro,dead:g.dead};
  if(g.dead||!boss)return out;const areas=this.danger(g),run=g.dungeonRun,room=D.roomAt(run.def,p.x,p.y)?.id;
  if(!this.safe(g,p,areas)){let best=null;for(let r=14;r<=150&&!best;r+=10)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(g.world.blocked(q.x,q.y,7)||D.roomAt(run.def,q.x,q.y)?.id!==room)continue;if(this.safe(g,q,areas)){best=q;break;}}
   if(best)out.move={dx:best.x-p.x,dy:best.y-p.y};}
  const k=boss.cast;out.interrupt=!!(k?.interruptible&&(g.cooldowns.interrupt||0)<=0&&k.total-k.remaining>.3);
  const sc=boss.sideCast;out.dodge=!!(sc&&(sc.focus||'player')==='player'&&sc.remaining<.38);out.claim=!!(k?.lie&&k.told===false);
  const hurt=g.companions.filter(c=>c.state!=='down'&&c.hp>0&&c.hp/c.maxHp<.8&&Math.hypot(c.x-p.x,c.y-p.y)<400).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  out.hurt=hurt?.id||null;out.heal=(g.cooldowns.heal||0)<=0;out.buff=(g.cooldowns.buff||0)<=0;out.enemy=g.target===boss;out.gcd=g.gcd>0||!!g.casting;return out;}
}`;
const frameOf=id=>`[data-companion-select="${id}"]`;
try{
 // ─────────────────────────────────────────────── 1 · Eingangskarte schlägt die fehlenden Rollen vor
 if(want(1)){const st=await load('vor','Fix Sechs Karte');results.card={hero:st};
  await read(`const d=D.dungeonEntrance(g);Object.assign(g.player,g.world.findClear(d.x,d.y+10,9));g.player.inCombat=0;return 1`);await wait(600);await b.press('f');
  const card=await until(`const c=document.querySelector('[data-dg-entry]');return c&&c.getBoundingClientRect().width>0&&{need:[...c.querySelectorAll('[data-dg-need]')].map(x=>x.dataset.dgNeed),offers:[...c.querySelectorAll('[data-dg-hire]')].map(x=>({id:x.dataset.dgHire,role:x.dataset.role,cls:x.className.replace('dg-offer','').trim()}))}`,15000,200);
  assert.ok(card,'Eingangskarte offen');await shot('10-eingangskarte-vorschlag');
  assert.deepEqual(card.need,['tank','damage','damage','damage'],'freie Plätze: Schutz, dann Schaden');
  assert.ok(card.offers.slice(0,4).every(o=>o.cls==='dg-suggest'&&o.role!=='heal'),'vorn die fehlenden Rollen: '+JSON.stringify(card.offers));
  assert.deepEqual(card.offers.filter(o=>o.cls==='dg-double').map(o=>o.role),['heal','heal'],'zweite Heilung hinten, gedämpft');
  const tipNeed=await hover('[data-dg-need="tank"]'),tipOffer=await hover('[data-dg-hire="merc-pils-peter"]'),tipDouble=await hover('[data-dg-hire="merc-schorle-susi"]');await shot('11-eingangskarte-tooltip');
  assert.match(tipNeed,/Fehlt noch: Schutz/);assert.match(tipOffer,/fehlt in deiner Gruppe/);assert.match(tipDouble,/doppelt ist ein Sonderfall/);
  const c=await elCenter('[data-dg-hire="merc-pils-peter"]');await clickAt(c);
  const after=await until(`const c=document.querySelector('[data-dg-entry]');return g.companions.some(x=>x.id==='merc-pils-peter')&&c&&{need:[...c.querySelectorAll('[data-dg-need]')].map(x=>x.dataset.dgNeed)}`,8000,200);
  assert.ok(after,'Pils-Peter per Klick angeheuert');assert.deepEqual(after.need,['damage','damage','damage'],'Schutz fehlt nicht mehr');
  const susi=await elCenter('[data-dg-hire="merc-schorle-susi"]');await clickAt(susi);const both=await until(`return g.companions.some(x=>x.id==='merc-schorle-susi')&&g.companions.length`,8000,200);
  assert.equal(both,2,'die Wahl bleibt: eine zweite Heilung lässt sich trotzdem anheuern');await shot('12-eingangskarte-angeheuert');
  ok('Eingangskarte: freie Plätze '+card.need.join('/')+', vorn '+card.offers.slice(0,4).map(o=>o.id.replace('merc-','')).join(', ')+', hinten gedämpft '+card.offers.filter(o=>o.cls==='dg-double').map(o=>o.id.replace('merc-','')).join(', ')+'; Tooltips „'+tipOffer.slice(0,50)+'…“; Anheuern per Klick, Heilung trotzdem wählbar');
  results.card={...results.card,card,after,tips:{tipNeed,tipOffer,tipDouble}};await closeAll();}

 // ─────────────────────────────────────────────── 2 · passiv wie die Prüferin: muss verlieren
 if(want(2)){const hero=await load('bigb','Fix Sechs Passiv');results.passive={hero};assert.equal(hero.inside,'dungeon');assert.equal(hero.mercs.length,4);
  if(OLD)await read(`(await import('/content/index.js')).DUNGEON_BOSSES.bigb.enrage.sooner={};return 1`);
  // Hinter die rechte Säule (Beleg 12-40-48 der Prüferin): die Säule blendet aus
  const pillar=await read(`const plan=SC.currentPlan(g),o=D.toWorld(g.dungeonRun.def,'k2',61.25,16),it=plan.items.standing.filter(i=>/saeule/.test(i.sprite)).sort((a,b)=>Math.hypot(a.x-o.x,a.maxY-o.y)-Math.hypot(b.x-o.x,b.maxY-o.y))[0];
   window.PIL=it;const spot={x:it.x,y:it.maxY-7};Object.assign(g.player,spot);g.moveTo=null;for(const c of g.companions){const q=g.world.findClear(g.player.x-60-Math.random()*20,g.player.y+20,9);c.x=q.x;c.y=q.y;}return {sprite:it.sprite,x:Math.round(it.x),maxY:Math.round(it.maxY),hero:{x:Math.round(g.player.x),y:Math.round(g.player.y)}}`);
  await wait(900);await s.settle();
  const faded=await until(`return K.kitItemOccludes(PIL,g.player)&&PIL.faded===true&&{sprite:PIL.sprite}`,5000,150);await shot('20-saeule-blendet-aus');
  assert.ok(faded,'Säule vor dem Helden blendet aus: '+JSON.stringify(pillar));ok('Held hinter der rechten Säule ('+pillar.sprite+'): die Säule blendet aus (Alpha .38)');results.passive.pillar=pillar;
  await pull();const pulledAt=Date.now();await wait(400);await b.press('Escape');/* Autoangriff aus, wie die Prüferin */await mouse({x:1700,y:600});
  const rage=await read(`return D.enrageInfo(g.dungeonRun,'bigb')`);results.passive.enrage=rage;if(!OLD)assert.equal(rage.after,215,'Wut 3:35 mit Rita und drei Beweisen');
  const chipTip=await until(`const c=document.querySelector('.bf-chip[data-chip="enrage"]');return c&&c.dataset.tooltipNote`,8000,200);if(!OLD)assert.match(chipTip,/Rita liegt −0:50 · Kirmes-Urkunde −0:25/,'Wut-Tooltip nennt den Grund: '+chipTip);
  const idle=await until(`const c=document.querySelector('.bf-chip[data-chip="rally"]');return c&&c.classList.contains('bf-warn')&&c.innerText.trim()`,20000,200);assert.ok(idle,'„Söldner warten“ nach 6 s ohne Tat');
  // Countdown der Warnleiste: die kommende Kanonenkugel zählt herunter (Prüferin: 8,4 s und 16 s später 8,1 s – zwei verschiedene Zauber)
  const cd=[];for(let i=0;i<14;i++){cd.push(await read(`const r=[...document.querySelectorAll('.boss-alerts .ba-row:not(.ba-now)')].map(x=>({k:x.dataset.ba,name:x.querySelector('small')?.textContent||'',t:parseFloat((x.querySelector('.ba-time')?.textContent||'').replace(',','.'))})).filter(x=>Number.isFinite(x.t));return {at:performance.now(),g:g.time,rows:r}`));await wait(250);}
  const series=new Map();for(const s1 of cd)for(const r of s1.rows){if(!series.has(r.k))series.set(r.k,[]);series.get(r.k).push({t:r.t,g:s1.g});}
  const runs=[...series.values()].filter(x=>x.length>=4);assert.ok(runs.length,'Vorschauzeilen gesehen');
  const frozen=runs.filter(x=>x.every(y=>y.t===x[0].t)&&x.at(-1).g-x[0].g>1);assert.ok(!frozen.length,'kein Countdown steht: '+JSON.stringify(runs.slice(0,2)));
  const falling=runs.every(x=>x.every((y,i)=>i===0||y.t<=x[i-1].t+.05));assert.ok(falling,'Countdown fällt: '+JSON.stringify(runs.slice(0,2)));
  ok('Passiv: Bossrahmen „'+idle+'“, Wut-Tooltip „…'+String(chipTip).slice(-48)+'“, Countdown der Warnleiste fällt ('+runs.length+' Zeilen, z. B. '+runs[0].map(y=>y.t).join('→')+' s)');
  // Nichts tun bis zum Ende; jeden Tod festhalten
  let deaths=0,dead=false,deathShots=[],maxRage=1;const t0=Date.now();
  while(Date.now()-t0<460000){const st=await read(`const bb=${bigB};return {dead:g.dead,alive:!!bb&&bb.hp>0,aggro:!!bb?.aggro,pct:bb?Math.round(bb.hp/bb.maxHp*100):0,rage:bb?.rageFactor||1,wiped:!!g.dungeonRun?.ghost?.wiped,ft:Math.round(bb?.fightTime||0)}`);
   maxRage=Math.max(maxRage,st.rage);if(!st.alive){results.passive.end={won:true,...st};break;}
   if(st.wiped||(!st.aggro&&Date.now()-pulledAt>60000)){results.passive.end={won:false,...st};break;}
   if(st.dead&&!dead){deaths++;await wait(900);
    const info=await read(`const w=document.querySelector('#deathScreen');const r=w.getBoundingClientRect(),fr=document.querySelector('.boss-frame:not([hidden])')?.getBoundingClientRect(),v=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/v.width;
     const at=o=>o&&{x:(o.x-v.camera.x+v.width/2)*k+cv.left,y:(o.y-v.camera.y+v.height/2)/v.height*cv.height+cv.top},bb=at(${bigB}),tank=at(g.companions.find(c=>c.def.role==='tank')),inside=(p,pad=0)=>!!p&&p.x>r.left-pad&&p.x<r.right+pad&&p.y>r.top-40-pad&&p.y<r.bottom+pad;
     const chip=document.querySelector('.bf-chip[data-chip="rally"]');
     return {rect:{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},side:w.dataset.dsSide||'',overFrame:!!fr&&r.left<fr.right&&fr.left<r.right&&r.top<fr.bottom&&fr.top<r.bottom,coversBoss:inside(bb),coversTank:inside(tank),coversCenter:r.left<innerWidth/2&&r.right>innerWidth/2&&r.top<innerHeight/2&&r.bottom>innerHeight/2,
      chip:chip?.innerText.trim()||'',chipNote:chip?.dataset.tooltipNote||'',recap:[...w.querySelectorAll('.ds-recap-row')].map(x=>x.innerText.replace(/\\s+/g,' ').trim()).join(' | ')}`);
    await shot('2'+(deaths+1)+'-tod-'+deaths);deathShots.push(info);
    assert.ok(info.side,'Todesfenster neben dem Bossrahmen: '+JSON.stringify(info.rect));assert.ok(!info.overFrame&&!info.coversBoss&&!info.coversTank&&!info.coversCenter,'Big B, Tank und Bildmitte frei: '+JSON.stringify(info));
    assert.equal(info.chip,'Söldner warten','auch tot: „Söldner warten“');assert.match(info.chipNote,/Du liegst/);}
   dead=st.dead;await wait(400);}
  results.passive.deaths=deathShots;results.passive.maxRage=maxRage;results.passive.seconds=Math.round((Date.now()-t0)/1000);
  assert.ok(results.passive.end,'Kampf endet ('+JSON.stringify(results.passive.end)+')');
  if(OLD){ok('Regeln #741: passiv '+(results.passive.end.won?'gewonnen':'verloren')+' nach '+results.passive.end.ft+' s Kampf, '+deaths+' Tode');}
  else{assert.equal(results.passive.end.won,false,'passiv verliert');assert.ok(maxRage>1,'die Wut hat zugeschlagen');
   ok('Passiv wie die Prüferin: verloren (Wipe nach der Wut, Big B zuletzt bei '+results.passive.end.pct+' %), '+deaths+' Tode; Todesfenster '+deathShots.map(d=>d.side+' '+d.rect.l+','+d.rect.t+' '+d.rect.w+'×'+d.rect.h).join(' / ')+', Big B, Tank und Mitte frei, Bossrahmen tot „Söldner warten“');
   if(deathShots.length>1)results.passive.recapSame=deathShots[0].recap===deathShots[1].recap;}}

 // ─────────────────────────────────────────────── 3 · aktiv als Heilerin: gewinnt, Buffs auf den Rahmen, Ausruf, Einsatz mit Bonus
 if(want(3)){const hero=await load('bigb','Fix Sechs Aktiv');results.active={hero};await read(`window.BOT=${BOT};return 1`);
  await put('k2',54,23);await wait(900);await s.settle();await pull();
  const t0=Date.now();let lastRe=0,lastAtk=0,lastHeal=0,k=0,frames=null,hotSeen=null,calloutSeen=null;
  while(Date.now()-t0<420000){
   const st=await read(`return BOT.step(g)`);if(!st.alive){await hold([]);results.active.won=true;break;}
   if(!st.dead){if(st.move){const n=Math.hypot(st.move.dx,st.move.dy)||1,dx=st.move.dx/n,dy=st.move.dy/n,keys=[];if(dx>.38)keys.push('d');if(dx<-.38)keys.push('a');if(dy>.38)keys.push('s');if(dy<-.38)keys.push('w');await hold(keys);}
    else{await hold([]);
     if(st.dodge)await b.press(' ');
     else if(st.interrupt){if(!st.enemy){const p=await screen(bigB);if(p)await clickAt({x:p.x,y:p.y-22},'right');}await b.press('q');}
     else if(st.hurt&&!st.gcd&&(st.heal||st.buff)&&Date.now()-lastHeal>900){const c=await elCenter(frameOf(st.hurt));if(c){await clickAt(c);await b.press(st.heal?'9':'3');lastHeal=Date.now();}}
     else if(!st.enemy&&!st.claim&&Date.now()-lastRe>1200){const p=await screen(bigB);if(p){await clickAt({x:p.x,y:p.y-22},'right');lastRe=Date.now();}}
     else if(st.enemy&&!st.gcd&&Date.now()-lastAtk>900){await b.press(['2','6','7'][k++%3]);lastAtk=Date.now();}}}
   else await hold([]);
   if(!frames){frames=await read(`if(!E.rallyActive(g))return null;const dock=document.querySelector('#unitGroupDock .companion-frames')||document.querySelector('.companion-frames');const out=[...document.querySelectorAll('.companion-frame')].map(f=>{const r=f.getBoundingClientRect(),cv=[...f.querySelectorAll('.cf-buffs canvas')];return {id:f.dataset.companionSelect,h:Math.round(r.height),buffs:cv.map(c=>c.dataset.frameBuff),inside:cv.every(c=>{const q=c.getBoundingClientRect();return q.width===24&&q.left>=r.left-1&&q.right<=r.right+1&&q.top>=r.top-1&&q.bottom<=r.bottom+1;})};});
    return out.length===4&&out.every(f=>f.buffs.includes('rally'))&&{frames:out,scroll:dock?dock.scrollHeight-dock.clientHeight:0,note:document.querySelector('.companion-frame').dataset.tooltipNote}`);if(frames)await shot('30-truppe-angefeuert');}
   if(!hotSeen){hotSeen=await read(`const f=[...document.querySelectorAll('.companion-frame')].find(f=>f.querySelector('.cf-buffs canvas[data-frame-buff="hot"],.cf-buffs canvas[data-frame-buff="shield"]'));return f&&{id:f.dataset.companionSelect,buffs:[...f.querySelectorAll('.cf-buffs canvas')].map(c=>c.dataset.frameBuff),note:f.dataset.tooltipNote}`);if(hotSeen)await shot('31-truppe-hot');}
   if(!calloutSeen){calloutSeen=await read(`return FX6.callouts.find(c=>c.boss&&c.shown&&c.text==='ANGEFEUERT')||null`);if(calloutSeen)await shot('32-ausruf-angefeuert');}
   await wait(110);}
  await hold([]);results.active.seconds=Math.round((Date.now()-t0)/1000);results.active.frames=frames;results.active.hot=hotSeen;results.active.callout=calloutSeen;
  assert.ok(results.active.won,'aktive Heilerin gewinnt');
  assert.ok(frames,'alle vier Truppenrahmen zeigen „Angefeuert“');assert.ok(frames.frames.every(f=>f.inside&&f.h<=54),'Symbole im Rahmen, Rahmen ≤ 54 px: '+JSON.stringify(frames.frames));assert.ok(frames.scroll<=0,'nichts scrollt');assert.match(frames.note,/Angefeuert \d+ s/);
  assert.ok(hotSeen,'eigene Heilung über Zeit oder Schild auf einem Söldnerrahmen');assert.ok(calloutSeen,'„ANGEFEUERT“ als Ausruf mit Text im Bosskampf: '+JSON.stringify(await read(`return FX6.callouts.slice(0,4)`)));
  ok('Truppenrahmen: Angefeuert auf 4/4 Rahmen (je '+frames.frames.map(f=>f.h).join('/')+' px, nichts scrollt), '+hotSeen.buffs.join('+')+' auf '+hotSeen.id.replace('merc-','')+' („'+hotSeen.note.slice(0,60)+'…“), Ausruf „ANGEFEUERT“ '+calloutSeen.size+' px mit Text');
  const row=await until(`const r=document.querySelector('[data-einsatz]');return r&&r.getBoundingClientRect().width>0&&{score:+r.dataset.einsatzScore,bonus:+r.dataset.einsatzBonus,text:r.innerText.replace(/\\s+/g,' ').trim(),parts:[...r.querySelectorAll('[data-einsatz-part]')].map(c=>c.dataset.einsatzPart),caption:r.querySelector('[data-einsatz-part="score"] small')?.textContent||''}`,40000,300);
  assert.ok(row,'Beute-Moment mit Einsatz-Zeile');await wait(400);await shot('33-einsatz-zeile');
  const warnTip=await hover('[data-einsatz-part="warn"]'),scoreTip=await hover('[data-einsatz-part="score"]');await shot('34-einsatz-tooltip');await mouse({x:1000,y:300});
  assert.equal(row.caption,'Einsatz','das Wort steht an der Zeile');assert.ok(row.parts.includes('dodges'),'Ausweichen');assert.ok(row.bonus>=1,'aktive Heilerin verdient den Bonus: '+row.score);
  assert.match(warnTip,/Das sind \d+ von 30 Punkten/,'Warnungen: Anzahl und Punkte: '+warnTip);assert.match(scoreTip,/Warnungen \d+ \(\d+\/\d+\)/,'Punkte mit Anzahl: '+scoreTip);assert.ok(row.text.length<80,'kurz: '+row.text);
  ok('Aktive Heilerin gewinnt nach '+results.active.seconds+' s: „'+row.text+'“, Bonus +'+row.bonus+'; Tooltip „'+scoreTip.slice(0,70)+'“');results.active.einsatz={row,warnTip,scoreTip};
  // Plakette: Pils-Peter über den Truppenrahmen wählen – Zielrahmen und Truppenrahmen zeigen dieselbe Stufe
  await closeAll();const pc=await elCenter(frameOf('merc-pils-peter'));await clickAt(pc);
  const lv=await until(`const t=document.querySelector('#targetLevel'),f=document.querySelector('${frameOf('merc-pils-peter')} .unit-level');return g.friend&&t&&f&&{target:t.dataset.level,frame:f.textContent.trim(),hero:g.player.level}`,5000,200);await shot('35-plakette');
  assert.ok(lv,'Freund gewählt');assert.equal(lv.target,lv.frame,'Zielrahmen und Truppenrahmen: '+JSON.stringify(lv));ok('Plakette: Zielrahmen '+lv.target+' = Truppenrahmen '+lv.frame+' (Held Stufe '+lv.hero+')');results.active.level=lv;}

 // ─────────────────────────────────────────────── 4 · Touch: Rahmen-Buffs bleiben im Rahmen
 if(want(4)){if(!await read(`return !!window.D&&g.companions.length===4`)){const h=await load('bigb','Fix Sechs Touch');results.touch={hero:h};}
  const t=await read(`const c=g.companions[0];c.aidHot={remaining:6,power:5,tick:1};c.aidBuff={name:'Test',remaining:8,shield:50};document.body.classList.add('touch-mode');await new Promise(r=>setTimeout(r,400));
   const out=[...document.querySelectorAll('.companion-frame')].map(f=>{const r=f.getBoundingClientRect();return {id:f.dataset.companionSelect,buffs:[...f.querySelectorAll('.cf-buffs canvas')].filter(c=>getComputedStyle(c).display!=='none').map(c=>{const q=c.getBoundingClientRect();return {b:c.dataset.frameBuff,inside:q.left>=r.left-1&&q.right<=r.right+1&&q.top>=r.top-1&&q.bottom<=r.bottom+1};})};});document.body.classList.remove('touch-mode');return out;`);
  const withBuffs=t.filter(f=>f.buffs.length);assert.ok(withBuffs.length,'Rahmen mit Buffs im Touch-Modus');assert.ok(t.every(f=>f.buffs.length<=2&&f.buffs.every(x=>x.inside)),'höchstens zwei, im Rahmen: '+JSON.stringify(t));
  ok('Touch-Modus: '+withBuffs.map(f=>f.id.replace('merc-','')+' '+f.buffs.map(x=>x.b).join('+')).join(', ')+' im Rahmen');results.touchFrames=t;}
}finally{writeFileSync(dir+'/results'+(OLD?'-alt':'')+'.json',JSON.stringify(results,null,1));await hold([]).catch(()=>{});await s.close?.();await b.close?.();}
console.log('\n'+checks.length+' Prüfungen grün');
