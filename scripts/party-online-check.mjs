// Gruppenspiel mit echten Mitspielern (2026-09-24): eigener Spielserver, zwei angemeldete Browser, Einladung über den Chat,
// Gruppenrahmen, Söldner und gemeinsamer Kampf. Aufnahmen nach visual-review/party/. Aufruf: node scripts/party-online-check.mjs [szene]
// Szenen: basis (Standard) – weitere Schritte hängen die Runden an STEPS an.
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createGameServer} from '../server/game/server.mjs';
import {createCharacter,characterKey} from '../characters.js';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/party';mkdirSync(dir,{recursive:true});
const data=mkdtempSync(join(tmpdir(),'mertloch-party-online-')),server=createGameServer({dataDir:data,staticDir:process.cwd()}),addr=await server.listen(0),url='http://127.0.0.1:'+addr.port+'/?online=1',browsers=[];
const run=(b,s)=>b.evaluate(`(async()=>{const g=window.game,M=globalThis.__mertloch,on=M.online;${s}})()`);
const until=async(b,expr,ms=6000,what=expr)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await run(b,'return !!('+expr+');'))return;await wait(150);}throw Error('Zeit abgelaufen: '+what);};
const shot=async(b,name)=>{const c=process.env.CLIP?.split(',').map(Number),r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:88,...(c?{clip:{x:c[0],y:c[1],width:c[2],height:c[3],scale:1}}:{})});writeFileSync(dir+'/'+name+'.jpg',Buffer.from(r.data,'base64'));};
const HEROES=[{name:'Rudi',classId:'dieter',look:'dieter',tint:{skin:'mittel',hair:'braun'}},{name:'Moni',classId:'baerbel',look:'baerbel',tint:{skin:'hell',hair:'blond'}}];
const passed=[];const ok=t=>{passed.push(t);console.log('PASS '+t);};
try{
 for(const [i,h]of HEROES.entries()){
  const res=await fetch(new URL('/api/auth',url),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'register',email:h.name.toLowerCase()+'@example.org',name:h.name,password:'test-party-account-123'})});assert.equal(res.status,200);
  const cookie=res.headers.get('set-cookie').split(';')[0],cut=cookie.indexOf('='),b=await browserSession({url,port:Number(process.env.CDP_PORT||9470)+i});browsers.push(b);
  // TOUCH_B=1: Moni spielt auf dem Handy quer (844×390, Touch-Modus)
  const phone=i===1&&!!process.env.TOUCH_B;await b.resize(phone?844:1600,phone?390:900);if(phone){await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
  await b.send('Network.setCookie',{name:cookie.slice(0,cut),value:cookie.slice(cut+1),url,httpOnly:true});
  const made=createCharacter(null,{name:h.name,classId:h.classId,look:h.look,tint:h.tint}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:h.classId,level:12,rpg:{version:4,coins:900},tutorial:{version:1,step:8,completed:true}};
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-touch-v1','{"mode":"${phone?'touch':'desktop'}"}');localStorage.setItem('mertloch-characters',${JSON.stringify(JSON.stringify(made.roster))});localStorage.setItem(${JSON.stringify(characterKey(save.worldKey,made.character))},${JSON.stringify(JSON.stringify(save))});`});
  await b.goto(url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(700);
  await run(b,`g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x+${i?40:-20},n.y+60,9));g.moveTo=null;g.path=[];g.keys.clear();document.querySelectorAll('[data-window-close]').forEach(x=>x.click());`);
 }
 const [a,b]=browsers;
 await until(a,`on.state.connected&&g.others.some(o=>o.name==='Moni')`,8000,'A sieht B');ok('Beide Browser verbunden und sehen sich');
 await run(a,`on.social.invite('Moni');`);await until(b,`document.querySelector('[data-online=party-accept]')`,5000,'Einladung kommt an');
 await run(b,`document.querySelector('[data-online=party-accept]').click();`);
 await until(a,`on.state.party.members.some(m=>m.n==='Moni')`,5000,'Gruppe gebildet');await until(b,`on.state.party.members.some(m=>m.n==='Rudi')`,5000,'Gruppe bei B');ok('Einladung angenommen, Gruppe steht');
 await wait(1200);await shot(a,'basis-a');await shot(b,'basis-b');
 // Runde 2: Söldner des Mitspielers sind sichtbar (Welt + Kopfzahl), Name/Aussehen aus dem Katalog
 await run(a,`g.hireCompanion('merc-pils-peter',{free:true});`);
 await until(b,`g.others.find(o=>o.name==='Rudi')?.companions?.some(c=>c.name==='Pils-Peter'&&c.party&&c.visualEquipment)`,5000,'B sieht Rudis Söldner');
 await until(b,`document.querySelector('.party-count')?.textContent==='3/5'`,4000,'Kopfzahl bei B zählt Rudis Söldner');ok('Mitspieler sieht fremde Söldner, Kopfzahl 3/5');
 await run(a,`g.dismissCompanion('merc-pils-peter');`);await until(b,`!g.others.find(o=>o.name==='Rudi')?.companions?.length`,5000,'Entlassen kommt an');ok('Entlassen verschwindet beim Mitspieler');
 // Runde 4: höchstens fünf Köpfe – Anheuern zählt fremde Söldner mit, ein Beitritt über fünf lässt Söldner Platz machen
 await run(a,`for(const id of ['merc-pils-peter','merc-schorle-susi','merc-radler-rita'])g.hireCompanion(id,{free:true});`);
 await until(b,`g.others.find(o=>o.name==='Rudi')?.companions?.length===3&&g.partyCompanions===3`,5000,'B kennt drei fremde Söldner');
 assert.equal(await run(b,`g.hireCompanion('merc-tresen-tina',{free:true});return g.companions.length;`),0,'Gruppe voll: B kann nicht anheuern');ok('Volle Gruppe (2 Menschen + 3 Söldner) sperrt weiteres Anheuern');
 await run(b,`on.social.leave();`);await until(b,`!on.state.party.members.length&&g.partyHumans===0&&!g.partyCompanions`,4000,'B verlässt, Zähler zurückgesetzt');await until(a,`!on.state.party.members.length`,4000,'A allein');
 await run(b,`g.hireCompanion('merc-tresen-tina',{free:true});g.hireCompanion('merc-hopfen-horst',{free:true});`);await until(b,`g.companions.length===2`,3000,'Moni heuert zwei an');await wait(600);
 await run(a,`on.social.invite('Moni');`);await until(b,`document.querySelector('[data-online=party-accept]')`,5000,'zweite Einladung');await run(b,`document.querySelector('[data-online=party-accept]').click();`);
 try{await until(a,`g.companions.length===1`,10000,'Rudi (alphabetisch später) gibt zwei Söldner ab');}catch(err){console.log('DEBUG A',await run(a,`return JSON.stringify({mine:g.companions.map(c=>c.id),humans:g.partyHumans,pc:g.partyCompanions,party:on.state.party.members.map(m=>m.n),me:on.social.me(),moni:g.others.find(o=>o.name==='Moni')?.companions?.map(c=>c.companion)})`));console.log('DEBUG B',await run(b,`return JSON.stringify({mine:g.companions.map(c=>c.id),party:on.state.party.members.map(m=>m.n)})`));throw err;}await wait(800);
 assert.equal(await run(b,`return g.companions.length;`),2,'Moni behält ihre Söldner');assert.deepEqual(await run(a,`return g.companions.map(c=>c.id);`),['merc-pils-peter'],'die zuletzt angeheuerten gehen');
 await until(a,`document.querySelector('.party-count')?.textContent==='5/5'`,4000,'Kopfzahl 5/5');ok('Beitritt über fünf: passende Söldner machen Platz, 5/5');
 // Runde 5: Zielmarkierung über das Kontextmenü des Zielrahmens, kommt beim Mitspieler am selben Gegner an
 await run(b,`for(const c of g.companions)c.stance="passive";`);
 const foe=await run(a,`for(const c of g.companions)c.stance="passive";const e=g.enemies.filter(e=>e.netId&&e.hp>0&&!e.questId).sort((x,y)=>Math.hypot(x.x-g.player.x,x.y-g.player.y)-Math.hypot(y.x-g.player.x,y.y-g.player.y))[0];Object.assign(g.player,g.world.findClear(e.x-60,e.y+30,9));g.moveTo=null;g.path=[];g.target=e;return e.netId;`);
 await wait(300);await run(a,`const t=document.querySelector('#targetPanel');const r=t.getBoundingClientRect();t.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+20,clientY:r.y+20}));`);
 await until(a,`[...document.querySelectorAll('.context-menu button')].some(b=>b.textContent.startsWith('Totenkopf'))`,3000,'Menü mit Markierungen');
 await run(a,`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent.startsWith('Totenkopf')).click();`);
 await until(b,`g.netEnemy(${JSON.stringify(foe)})?.groupMark==='skull'`,4000,'Moni sieht den Totenkopf');ok('Zielmarkierung über das Zielrahmen-Menü erreicht den Mitspieler');
 await run(b,`const e=g.netEnemy(${JSON.stringify(foe)});Object.assign(g.player,g.world.findClear(e.x-40,e.y+30,9));`);await run(a,`const e=g.netEnemy(${JSON.stringify(foe)})||g.player;Object.assign(g.player,g.world.findClear(e.x-70,e.y+40,9));g.target=null;`);await wait(900);
 await shot(a,'mark-a');await shot(b,'mark-b');
 // Runde 7: Assist – Moni visiert den Totenkopf an, Rudis Gruppenrahmen zeigt es, Rudi übernimmt ihr Ziel über das Menü am Rahmen
 await run(b,`g.target=g.netEnemy(${JSON.stringify(foe)});`)
 await until(a,`document.querySelector('[data-party-name=Moni] .unit-target')?.textContent.includes(g.netEnemy(${JSON.stringify(foe)}).name)`,5000,'Rahmen zeigt Monis Ziel');
 await run(a,`g.target=null;const t=document.querySelector('[data-party-name=Moni]');const r=t.getBoundingClientRect();t.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+30,clientY:r.y+20}));`);
 await until(a,`[...document.querySelectorAll('.context-menu button')].some(b=>b.textContent.startsWith('Ziel übernehmen'))`,3000,'Menüpunkt Ziel übernehmen');
 await run(a,`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent.startsWith('Ziel übernehmen')).click();`);
 assert.equal(await run(a,`return g.target?.netId;`),foe,'Rudi hat Monis Ziel');ok('Assist: Gruppenrahmen zeigt das Ziel, „Ziel übernehmen“ wählt es');
 await wait(400);await shot(a,'assist-a');if(process.env.CLIP_ASSIST){process.env.CLIP=process.env.CLIP_ASSIST;await shot(a,'assist-frame');delete process.env.CLIP;}
 // Runde 8: Bereitschaftscheck über das Menü am Gruppenkopf; Moni antwortet, Rahmen zeigt ✓, Zusammenfassung im Chat
 await run(a,`const h=document.querySelector('.party-frames header');const r=h.getBoundingClientRect();h.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+20,clientY:r.y+10}));`);
 await until(a,`[...document.querySelectorAll('.context-menu button')].some(b=>b.textContent.startsWith('Bereitschaftscheck'))`,3000,'Menüpunkt Bereitschaftscheck');
 await run(a,`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent.startsWith('Bereitschaftscheck')).click();`);
 await until(b,`document.querySelector('[data-online=ready-yes]')`,4000,'Moni wird gefragt');await until(a,`document.querySelector('[data-party-name=Moni].ready-wait')`,3000,'Rudi sieht „wartet“');
 await wait(500);await shot(b,'ready-b');await run(b,`document.querySelector('[data-online=ready-yes]').click();`);
 await until(a,`document.querySelector('[data-party-name=Moni].ready-yes')`,4000,'Rudi sieht ✓');
 await until(a,`[...document.querySelectorAll('#chatWindow *,.chat-window *')].some(x=>x.textContent==='Alle sind bereit.')`,4000,'Zusammenfassung im Chat');ok('Bereitschaftscheck: Frage, Antwort, ✓ am Rahmen, „Alle sind bereit.“');
 await shot(a,'ready-a');
 // Runde 9: Rudis Heil-Söldnerin heilt die verletzte Moni über den Hilfsweg
 await run(a,`for(const c of [...g.companions])g.dismissCompanion(c.id);g.hireCompanion('merc-schorle-susi',{free:true});g.target=null;for(const e of g.enemies)if(Math.hypot(e.x-g.player.x,e.y-g.player.y)<700){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=1e12;}const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x-20,n.y+60,9));const c=g.companions[0];Object.assign(c,g.world.findClear(n.x,n.y+80,9));`);
 await run(b,`for(const c of [...g.companions])g.dismissCompanion(c.id);g.target=null;const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x+40,n.y+60,9));g.player.hp=Math.round(g.player.maxHp*.4);g.player.inCombat=0;`);
 await wait(1200);const before=await run(b,'return g.player.hp;');
 await run(a,`window.__fight=setInterval(()=>{g.player.inCombat=7;for(const c of g.companions)c.inCombat=6;},100);`);
 await until(b,`g.player.hp>${before}`,8000,'Moni wird von Rudis Söldnerin geheilt');await run(a,'clearInterval(window.__fight);');
 ok('Heil-Söldnerin heilt einen verletzten Mitspieler (Hilfsweg)');await shot(b,'heal-b');
 // Runde 11: Folgen über das Menü am Gruppenrahmen; Moni läuft weg, Rudi schließt auf; eigene Bewegung beendet das Folgen
 await run(b,`const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x+40,n.y+60,9));`);await run(a,`const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x-20,n.y+60,9));`);await wait(800);
 await run(a,`const t=document.querySelector('[data-party-name=Moni]');const r=t.getBoundingClientRect();t.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+30,clientY:r.y+20}));`);
 await until(a,`[...document.querySelectorAll('.context-menu button')].some(b=>b.textContent==='Folgen')`,3000,'Menüpunkt Folgen');
 await run(a,`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent==='Folgen').click();`);
 await run(b,`const p=g.world.findClear(g.player.x+300,g.player.y+40,9);Object.assign(g.player,p);`);
 await until(a,`(()=>{const o=g.others.find(x=>x.name==='Moni');return o&&Math.hypot(o.x-g.player.x,o.y-g.player.y)<110;})()`,12000,'Rudi schließt zu Moni auf');ok('Folgen: Rudi läuft Moni hinterher');
 await a.press('d');await wait(400);assert.equal(await run(a,`return !g.routeGoal&&!g.path?.length;`),true,'eigene Bewegung beendet das Folgen');ok('Eigene Bewegung beendet das Folgen');
 // Runde 13: Sprechblase – Moni sagt etwas im Chat, bei Rudi steht es als Blase über ihrem Kopf
 await run(b,`const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x+40,n.y+60,9));`);await run(a,`const n=g.world.npc;Object.assign(g.player,g.world.findClear(n.x-30,n.y+60,9));`);await wait(900);
 await run(b,`const f=[...document.querySelectorAll('form')].find(f=>f.closest('#chatWindow,.chat-window'));const i=f.querySelector('input');i.value='/s Hallo Rudi, auf geht es!';f.requestSubmit();`);
 await until(a,`M.renderer.bossSpeech.barks.some(b=>b.kind==='player'&&b.id==='Moni'&&b.text.startsWith('Hallo Rudi'))`,4000,'Blase bei Rudi');ok('Chat „sagen“ erscheint als Sprechblase über dem Mitspieler');
 await wait(300);await shot(a,'bubble-a');
 // Runde 14: Anführer übertragen über das Menü am Gruppenrahmen; Krone wandert zu Moni
 await run(a,`const t=document.querySelector('[data-party-name=Moni]');const r=t.getBoundingClientRect();t.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+30,clientY:r.y+20}));`);
 await until(a,`[...document.querySelectorAll('.context-menu button')].some(b=>b.textContent==='Zum Anführer machen')`,3000,'Menüpunkt Anführer');
 await run(a,`[...document.querySelectorAll('.context-menu button')].find(b=>b.textContent==='Zum Anführer machen').click();`);
 await until(b,`on.social.isLeader()&&document.querySelector('.player-panel.is-party-leader')`,4000,'Moni führt, Krone am eigenen Rahmen');
 await until(a,`on.state.party.leader==='Moni'&&!document.querySelector('.player-panel.is-party-leader')&&document.querySelector('[data-party-name=Moni] .party-name').textContent.startsWith('♛')`,4000,'Rudi sieht Moni als Anführerin');ok('Anführer übertragen: Krone wandert, Rechte wechseln');
 // Runde 16: Mitglied außer Reichweite wird im Rahmen blass; zurück in Reichweite wieder voll
 await run(b,`Object.assign(g.player,g.world.findClear(g.player.x+700,g.player.y,9));`);
 await until(a,`document.querySelector('[data-party-name=Moni].out-of-range')`,5000,'Moni blass außer Reichweite');
 await run(b,`const p=g.others.find(o=>o.name==='Rudi');Object.assign(g.player,g.world.findClear(p.x+40,p.y,9));`);
 await until(a,`document.querySelector('[data-party-name=Moni]:not(.out-of-range)')`,5000,'Moni wieder in Reichweite');ok('Rahmen zeigt, wer außer Reichweite ist');
 // Runde 17: große Karte zeigt Gruppenmitglieder auch außerhalb der Sichtweite
 await run(b,`Object.assign(g.player,g.world.findClear(g.player.x+2500,g.player.y+300,9));`);
 await until(a,`!g.others.some(o=>o.name==='Moni')&&g.partyPositions?.some(m=>m.name==='Moni')`,6000,'Moni fern, aber in der Kartenliste');
 await a.press('m');await wait(1200);await shot(a,'map-a');await a.press('m');ok('Karte kennt ferne Gruppenmitglieder');
 await run(b,`const p=g.partyPositions.find(m=>m.name==='Rudi');Object.assign(g.player,g.world.findClear(p.x+40,p.y,9));`);await wait(800);
 const scene=process.argv[2]||'basis';
 if(process.env.EVAL_A)await run(a,process.env.EVAL_A);if(process.env.EVAL_B)await run(b,process.env.EVAL_B);
 if(process.env.EVAL_A||process.env.EVAL_B){await wait(Number(process.env.WAIT||1500));await shot(a,scene+'-a');await shot(b,scene+'-b');}
 if(process.env.PRINT_B)console.log('PRINT_B',await run(b,process.env.PRINT_B));
 for(const [i,x]of browsers.entries())assert.deepEqual(x.errors,[],'Browserfehler bei Spieler '+i);
 writeFileSync(dir+'/report.json',JSON.stringify({passed},null,2));console.log('PASS Gruppenspiel online ('+passed.length+' Prüfungen)');
}catch(e){for(const [i,x]of browsers.entries())try{await shot(x,'fehler-'+i);console.log(JSON.stringify(await run(x,'return {party:on.state.party,others:g.others.map(o=>o.name),errors:[]};')));}catch{}throw e;}
finally{for(const x of browsers)await x.close();await server.close();assert.ok(resolve(data).startsWith(resolve(tmpdir())+sep)&&data.includes('mertloch-party-online-'));rmSync(data,{recursive:true,force:true});}
