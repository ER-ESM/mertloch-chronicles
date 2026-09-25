// E-72 Runde 4 · Eingabe (Kenner-Befund Kampfgefühl, 25.09. abends) im echten Spiel mit echten Tastendrücken (CDP):
//  1. Rotation je Klasse: ein „Mensch“ liest die Zahl auf dem Knopf (sonst GCD/Zauberbalken) und drückt die feste Tastenfolge
//     0,15–0,25 s vor dem Ende – gezählt werden rote Sperr-Fehlerzeilen („muss noch verschnaufen“, „Noch nicht bereit“, „bereits einen Zauber“).
//  2. Proc-Serie: fünf Treffer unter 35 % Leben (Dieters „Pfand zurück“) → Chat; dazu fünf gleiche Zeilen → eine Zeile „×5“.
//  3. Aperol-Hype: Anni mit Viral-Ladung zwischen fünf Keilern, drei BEREIT-Procs kurz hintereinander.
//  4. Bodenziel: Zielkreis offen, anderer Kniff schließt ihn; Einstellung „Bodenkniffe sofort an der Maus“.
// Eigener Server + Wegwerf-Browser (SERVER_PORT 4381 / CDP_PORT 9781). Bilder (1600×900, JPEG): docs/e72-runde4/eingabe/.
// Vorher/Nachher: alten Stand selbst ausliefern und mit URL + --label=alt aufrufen (dann keine Abnahme-Prüfungen, nur Zahlen/Bilder).
// Aufruf: node scripts/e72-eingabe-check.mjs [http://localhost:4381/ --label=alt] [--seconds=20]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const args=process.argv.slice(2),url=args.find(a=>a.startsWith('http')),label=(args.find(a=>a.startsWith('--label='))||'--label=neu').slice(8),legacy=label!=='neu';
const seconds=Number((args.find(a=>a.startsWith('--seconds='))||'--seconds=20').slice(10));
const dir='docs/e72-runde4/eingabe';mkdirSync(dir,{recursive:true});
const b=await browserSession({url,port:Number(process.env.CDP_PORT||9781),serverPort:Number(process.env.SERVER_PORT||4381)});
const read=s=>b.evaluate(s),checks=[],shots=[],report={label,rotation:{},chat:{},aperol:{},ground:{}};
const W=1600,H=900;
const shot=async(name,clip)=>{const p=dir+'/'+label+'-'+name+'.jpg';const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:82,...(clip?{clip:{scale:1,...clip}}:{})});writeFileSync(p,Buffer.from(r.data,'base64'));shots.push(p);return p;};
const clipOf=async(sel,pad=8,up=0)=>read(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,Math.round(b.left-${pad})),y:Math.max(0,Math.round(b.top-${pad}-${up})),width:Math.round(b.width+${pad*2}),height:Math.round(b.height+${pad*2}+${up})};})()`);
const mouse=(x,y,type='mouseMoved',button='none')=>b.send('Input.dispatchMouseEvent',{type,x,y,button,clickCount:type==='mouseMoved'?0:1});

async function boot(){
 const worldKey='v2-56753-72-1',save={version:1,worldKey,classId:'dieter',level:12,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`try{navigator.serviceWorker?.getRegistrations?.().then(r=>r.forEach(x=>x.unregister()));caches?.keys?.().then(k=>k.forEach(n=>caches.delete(n)));}catch{}delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.send('Page.navigate',{url:b.url});let up=false;for(let i=0;i<800&&!up;i++){await wait(200);up=await read('!!window.mertloch').catch(()=>false);}
 await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);assert.ok(up,'Spiel startet');
 let ok=false;for(let i=0;i<600&&!ok;i++){await wait(200);ok=await read(`(()=>{try{const s=document.querySelector('#startScreen');if(s&&!s.hidden){s.querySelector('[data-start=guest]')?.click();const e=s.querySelector('[data-start=enter]');if(e){e.click();return false;}const n=s.querySelector('[name=heroName]');if(n){if(!n.value)n.value='Pruefheld';s.querySelector('[data-start=draft-next]')?.click();}else if(s.querySelector('[data-start=draft-next]'))s.querySelector('[data-start=draft-next]').click();else s.querySelector('[data-start=create]')?.click();return false;}return typeof game!=='undefined'&&!!game;}catch{return false}})()`).catch(()=>false);}
 assert.ok(ok,'Anmeldebildschirm überwunden');
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(1500);
 await read(`(async()=>{const m={arena:await import('./arena.js'),rpg:await import('./rpg.js'),procs:await import('./procs.js'),content:await import('./content/index.js')};globalThis.__ein={m,
  freeze(){if(!game.__tick){game.__tick=game.tick;game.tick=()=>{};}},thaw(){if(game.__tick){game.tick=game.__tick;delete game.__tick;}}};
  if(!game.__failWrap){const f=game.fail.bind(game);game.fail=t=>{(game.__fails||=[]).push(t);f(t);};game.__failWrap=true;}return true;})()`);
}
/** Klasse wechseln, Stufe 12, Hauptbaum, freie Wiese, Übungspuppen (unverwüstlich) vor dem Helden. */
async function hero(cls,spec,count=1){
 const r=await read(`(()=>{const {arena}=__ein.m;__ein.thaw();game.dead=false;game.paused=false;game.classLocked=false;game.enemies=game.enemies.filter(e=>!e.arena);game.target=null;game.resetClassState();game.attackers?.clear();game.aiming=null;game.queued=null;Object.assign(game.player,game.world.spawn,{hp:game.player.maxHp,inCombat:0});const hero=game.hero;game.hero=null;game.enterAs(${JSON.stringify(cls)});game.hero=hero;
  arena.setArenaLevel(game,12);game.rpg.talents.spec=${JSON.stringify(spec)};game.refreshStats();game.resetClassState();game.emit('rpgChanged');game.emit('classChanged');
  const s=game.world.spawn,W=game.world;let spot=null;for(let r=260;r<900&&!spot;r+=40)for(let k=0;k<24&&!spot;k++){const a=k/24*Math.PI*2,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(W.onRoad?.(x,y,70)||W.blocked(x,y,40)||W.nearby?.(x,y,90)?.length)continue;let ok=true;for(let dx=-80;dx<=80&&ok;dx+=20)for(let dy=-60;dy<=60&&ok;dy+=20)if(W.blocked(x+dx,y+dy,6)||W.onRoad?.(x+dx,y+dy,10))ok=false;if(ok)spot={x,y};}spot||={x:s.x-150,y:s.y+230};
  Object.assign(game.player,{x:spot.x,y:spot.y,hp:game.player.maxHp,vx:0,vy:0,moving:false});game.path=[];game.moveTo=null;
  const list=arena.spawnArena(game,{count:${count},dummy:true});list.forEach((e,i)=>{const a=${count}>1?i/${count}*Math.PI*2-Math.PI/2:0,r=${count}>1?46:44;Object.assign(e,{x:game.player.x+Math.cos(a)*r,y:game.player.y+Math.sin(a)*r*.8+(${count}>1?0:2),hp:1e7,maxHp:1e7});});game.target=list[0];game.player.direction='e';game.player.facing=1;
  document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.__fails=[];return {id:game.member.id,level:game.player.level};})()`);
 assert.equal(r.id,cls,'Klasse gewechselt: '+cls);await wait(900);return r;
}
const keyOf=i=>String((i+1)%10);
async function plan(){return read(`(()=>{const bar=__ein.m.rpg.actionBar(game);const out=[];bar.forEach((id,i)=>{const s=game.skills.find(x=>x.id===id);if(i<10&&s&&!s.auto&&!s.ground&&!['dash','heal','buff','parry','interrupt'].includes(id)&&out.length<4)out.push({id,key:String((i+1)%10)});});return out;})()`);}
const BLOCK=/verschnaufen|nicht bereit|bereits einen Zauber/i;

async function rotation(cls,spec){
 await hero(cls,spec);const keys=await plan();assert.ok(keys.length>=3,cls+': Rotationstasten');
 await read(`(()=>{game.player.inCombat=7;game.__fails=[];return 1})()`);
 let k=0,lead=.15,presses=0,queuedShot=false,pending=false;const t0=Date.now();
 while(Date.now()-t0<seconds*1000){
  const {id,key}=keys[k%keys.length];
  const v=await read(`(()=>{const p=game.player;p.hp=p.maxHp;p.energy=Math.max(p.energy,60);if(game.res&&game.res.bottles!==undefined)game.res.bottles=Math.max(game.res.bottles,6);if(game.queued)return 9;/* vorgemerkter Druck noch offen: der Mensch sieht die GCD erst neu anlaufen */const b=document.querySelector('.action-area [data-skill="${id}"] .cooldown'),n=b?.textContent||'',num=n?parseFloat(n.replace(',','.')):0,s=game.skills.find(x=>x.id==='${id}');return num>0?num:Math.max(s.offGcd?0:game.gcd,game.casting&&!s.offGcd?game.casting.remaining:0);})()`);
  if(v===9){pending=true;await wait(12);continue;}if(pending){pending=false;await wait(200);/* vorgemerkter Druck ist gerade ausgelöst: Knopfzahl frischt erst mit der nächsten UI-Runde (100 ms) auf, dazu Reaktionszeit */continue;}
  if(v<=lead){await b.press(key);presses++;k++;lead=lead>=.25?.15:lead+.05;await wait(180);/* Reaktionszeit: der Mensch liest den nächsten Knopf erst nach dem Druck */
   if(!queuedShot&&cls==='schorsch'&&!legacy){const q=await read(`(()=>{if(!game.queued)return null;__ein.freeze();return game.queued.id;})()`);if(q){queuedShot=true;await wait(120);const c=await clipOf('.action-area',10,40);await shot('vormerkung-schorsch',c);await read('__ein.thaw()');report.rotation.queuedShot=q;}}}
  else await wait(12);
 }
 const f=await read('game.__fails||[]'),blocked=f.filter(t=>BLOCK.test(t)),count={};for(const t of f)count[t]=(count[t]||0)+1;
 report.rotation[cls]={keys:keys.map(x=>x.key+':'+x.id).join(' '),presses,blocked:blocked.length,errors:f.length,texts:count};
 checks.push(`${cls}: ${presses} Drücke (${keys.map(x=>x.key).join('-')}), Sperr-Fehler ${blocked.length}, alle Fehlerzeilen ${f.length}`);
 if(!legacy)assert.equal(blocked.length,0,cls+': keine Sperr-Fehlerzeile bei Druck 0,15–0,25 s vor Ende der Knopfzahl: '+JSON.stringify(count));
}

async function procSeries(){
 await hero('dieter','dieter-wall');
 const r=await read(`(()=>{const {content}=__ein.m;const [spec,i]=Object.entries(content.TALENT_ROWS).flatMap(([s,rows])=>rows.map((t,i)=>[s,i,t])).find(([,,t])=>t.effects?.['proc:pfand-zurueck']);game.rpg.talents.spec=spec;game.rpg.talents.learned.push(spec+'-'+i);game.refreshStats();
  const e=game.target,p=game.player;const before=game.events.filter(x=>x.type==='proc').length;p.hp=Math.round(p.maxHp*.4);for(let n=0;n<5;n++){game.hitPlayer(e,Math.round(p.maxHp*.06),false);if(p.hp<p.maxHp*.15)p.hp=Math.round(p.maxHp*.3);}
  return {procs:game.events.filter(x=>x.type==='proc'&&x.id==='pfand-zurueck').length,guard:Math.round(game.classState.guard||0)};})()`);
 await wait(500);
 const lines=await read(`[...document.querySelectorAll('#chatWindow .chat-line:not([hidden])')].map(l=>l.textContent.trim()).filter(t=>/^Proc · Fällt dein Leben/.test(t)).length`);
 report.chat.series={...r,chatLines:lines};checks.push(`Proc-Serie (5 Treffer unter 35 %): ${r.procs}× gezündet, ${lines} Chatzeile(n), Deckung ${r.guard}`);
 if(!legacy){assert.equal(r.procs,1,'einmal beim Unterschreiten');assert.equal(lines,1,'eine Chatzeile');}
 // Gleiche Zeilen hintereinander (z. B. derselbe Proc aus einem Zählauslöser): eine Zeile „×5“
 await read(`(()=>{for(let n=0;n<5;n++)game.log('Proc · Deckelwirtschaft: Jede dritte Kelle ist gratis.');return 1})()`);await wait(400);
 const merged=await read(`(()=>{const l=[...document.querySelectorAll('#chatWindow .chat-line:not([hidden])')].filter(l=>/Deckelwirtschaft/.test(l.textContent));return {lines:l.length,count:l.at(-1)?.querySelector('.chat-count')?.textContent||''};})()`);
 report.chat.merge=merged;checks.push(`Chat: 5 gleiche Zeilen → ${merged.lines} Zeile(n) ${merged.count}`);
 if(!legacy){assert.equal(merged.lines,1);assert.equal(merged.count,'×5');}
 await mouse(40,H-160);await wait(300);/* Chatfenster aktiv (Maus darüber) */const c=await clipOf('#chatWindow',10);await shot('chat-procserie',c);await mouse(W/2,H/2);await wait(200);await shot('chat-procserie-voll');
}

async function aperol(){
 await hero('baerbel','baerbel-stage',5);
 const r=await read(`(()=>{const {procs,rpg}=__ein.m;const st=game.res;st.trend=5;st.fight=true;st.viral=1;game.player.inCombat=7;game.player.energy=80;
  const cs={...rpg.combatStats(game),'proc:notration':1};let n=0;for(let i=0;i<3;i++)n+=procs.fireProcs(game,'lowHealth',cs);return {fired:n,viral:st.viral};})()`);
 await wait(350);
 const labels=await read(`[...document.querySelectorAll('.action-area .skill.variant')].map(b=>b.dataset.variant).filter(Boolean)`);
 const rows=await read(`[...document.querySelectorAll('#sct .sct-note .sct-row')].map(r=>r.textContent.trim())`);
 const frames=await read(`document.querySelectorAll('.action-area .skill.viral-free').length`);
 report.aperol={...r,variantLabels:labels,sctRows:rows,viralFrames:frames};
 checks.push(`Aperol-Hype: Knopf-Beschriftungen [${labels.join(', ')}] · Viral-Rahmen ${frames} · Kampftext [${rows.join(' | ')}]`);
 await shot('aperol-hype');const c=await clipOf('.action-area',10,60);await shot('aperol-leiste',c);
 if(!legacy){assert.ok(!labels.includes('VIRAL'),'kein VIRAL auf den Knöpfen');assert.ok(frames>=3,'Viral-Rahmen an den Likes-Kniffen');assert.equal(rows.filter(t=>/BEREIT/.test(t)).length,1,'BEREIT nur einmal: '+rows.join(' | '));assert.match(rows.find(t=>/BEREIT/.test(t))||'',/×3/);}
 // Tooltip am Knopf nennt Viral
 const tipBox=await clipOf('.action-area .skill.viral-free',0);if(tipBox){await mouse(tipBox.x+tipBox.width/2,tipBox.y+tipBox.height/2);await wait(700);const tip=await read(`(()=>{const t=[...document.querySelectorAll('#itemTooltip,.tooltip,[role=tooltip]')].find(t=>t.offsetParent&&t.textContent.trim());return t?t.innerText:''})()`);report.aperol.tooltip=/Viral/.test(tip);checks.push('Tooltip am Viral-Knopf nennt Viral: '+(/Viral/.test(tip)?'ja':'nein'));if(!legacy)assert.match(tip,/Viral/);await shot('aperol-tooltip');await mouse(W/2,H/2);}
}

async function ground(){
 await hero('dieter','dieter-brawl');
 const keys=await read(`(()=>{const bar=__ein.m.rpg.actionBar(game);const k=id=>{const i=bar.indexOf(id);return i>=0&&i<10?String((i+1)%10):null;};game.player.energy=100;return {ground:k('ground'),strike:k('strike')};})()`);
 assert.ok(keys.ground&&keys.strike,'Bodenkniff und Kelle auf der Leiste');
 await b.press(keys.ground);await wait(300);const open=await read('game.aiming');if(!legacy)await shot('bodenziel-offen');
 await b.press(keys.strike);await wait(300);const after=await read('({aiming:game.aiming,strikeCd:game.cooldowns.strike||0})');await shot('bodenziel-anderer-kniff');
 report.ground={open,after};checks.push(`Bodenziel: offen=${open} → anderer Kniff: aiming=${after.aiming}, Kelle ausgeführt=${after.strikeCd>0}`);
 if(!legacy){assert.equal(open,'ground');assert.equal(after.aiming,null,'Zielmodus zu');assert.ok(after.strikeCd>0,'Kelle ausgeführt');}
 if(legacy)return;
 // Einstellungsfenster: Spiel → Kampf → „Bodenkniffe sofort an der Maus“
 await read(`(()=>{game.gcd=0;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());return 1})()`);await wait(200);await b.press('o');/* Taste O: Einstellungen */await wait(600);await read(`document.querySelector('[data-opt-cat=game]')?.click()`);await wait(400);
 const row=await read(`(()=>{const t=document.querySelector('[data-setting-toggle="groundAtCursor"]');if(!t)return null;t.scrollIntoView({block:'center'});return {pressed:t.getAttribute('aria-pressed')||t.getAttribute('aria-checked')||String(t.checked??''),text:t.closest('.opt-row')?.textContent.trim()||''};})()`);
 assert.ok(row,'Zeile im Einstellungsfenster');await wait(200);await shot('einstellung-bodenkniffe');
 await read(`document.querySelector('[data-setting-toggle="groundAtCursor"]').click()`);await wait(300);const on=await read('game.settings.groundAtCursor');assert.equal(on,true,'Schalter wirkt');
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await b.press('Escape');await wait(200);await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(300);
 // Maus über die Welt neben den Helden, Bodenkniff drücken → kein Zielkreis, Zauber an der Mausposition
 const at=await read(`(()=>{const R=globalThis.__mertloch.renderer,c=R.canvas.getBoundingClientRect(),z=R.zoom||1,p=game.player,cam=R.camera;game.cooldowns.ground=0;game.gcd=0;game.player.energy=100;return {x:Math.round(c.left+c.width/2+(p.x+40-cam.x)*z),y:Math.round(c.top+c.height/2+(p.y+30-cam.y)*z)};})()`);
 await mouse(at.x,at.y);await wait(200);await b.press(keys.ground);await wait(150);
 const quick=await read(`({aiming:game.aiming,casting:game.casting?.id||null,point:game.casting?.point||null,hover:game.hover})`);await shot('bodenkniff-an-der-maus');
 report.ground.quick=quick;checks.push(`Schnellzauber an der Maus: aiming=${quick.aiming}, wirkt=${quick.casting}`);
 assert.equal(quick.aiming,null,'kein Zielkreis');assert.equal(quick.casting,'ground','wirkt an der Mausposition');
 await read(`game.setSetting('groundAtCursor',false)`);
}

try{
 await b.resize(W,H);await boot();
 for(const [cls,spec] of [['dieter','dieter-brawl'],['baerbel','baerbel-stage'],['kevin','kevin-hunt'],['schorsch','schorsch-flamme'],['kaethe','kaethe-grand']]){await rotation(cls,spec);console.log('ok',cls);}
 await procSeries();await aperol();await ground();
 if(!legacy)assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report-'+label+'.json',JSON.stringify({...report,checks,shots,errors:b.errors},null,1));console.log('PASS E-72 Eingabe ('+label+'):\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e);console.error(JSON.stringify(b.errors).slice(0,2000));try{await shot('fehler');}catch{}writeFileSync(dir+'/report-'+label+'.json',JSON.stringify({...report,checks,shots,errors:b.errors,fail:String(e)},null,1));process.exitCode=1;}
finally{b.close();}
