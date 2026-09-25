// E-72 Runde 5 · welt2 im echten Spiel (Headless): Ruhewart kündigt an, Sprung-Telegraph, Käthe 4 gegen Dachs 1, Schorsch 6 gegen
// Ruhewart 3, Einstieg an Kisten-Ida. Screenshots nach docs/e72-runde5/welt2/.
// Aufruf: SERVER_PORT=4472 CDP_PORT=9872 node scripts/e72-welt2-check.mjs [url]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='docs/e72-runde5/welt2';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9872),serverPort:Number(process.env.SERVER_PORT||4472)}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const worldKey='v2-56753-72-1';
const tidy=()=>read(`(()=>{if(!document.getElementById('welt2-check-style'))document.head.insertAdjacentHTML('beforeend','<style id="welt2-check-style">.milestone{display:none!important}</style>');document.querySelectorAll('.memory-card-close').forEach(b=>b.click());})()`);
async function load(classId,level){
 const save={version:1,worldKey,classId,level,trainingXp:0,tutorial:{version:1,step:8,completed:true},quest:{chapter:1,accepted:true,chapterClaimed:0},rpg:{version:4,coins:50}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-${worldKey}',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 for(let i=0;i<120&&!(await read('!!window.game&&!!game.member'));i++)await wait(250);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(1500);
 await read(`document.querySelectorAll('[data-window-close],.memory-card [data-close],.popup-close').forEach(b=>b.click());game.floor=0;game.player.hp=game.player.maxHp;`);
 assert.equal(await read('game.member.id+":"+game.player.level'),classId+':'+level,'Held geladen');
 await tidy();
}
const teleport=(x,y)=>read(`(()=>{const s=game.world.findClear(${x},${y},9)||{x:${x},y:${y}};Object.assign(game.player,{x:s.x,y:s.y,moving:false});game.moveTo=null;game.path=[];game.routeGoal=null;return s;})()`);
/** Einen Gegner der Startreihe neben den Helden stellen (Feldgegner, echte Stufe), noch ohne Kampf. */
const plant=(kind,dx,dy,id)=>read(`(async()=>{const {makeEnemy}=await import('./encounters.js');const {ARCHETYPES}=await import('./content/index.js');const p=game.player,s=game.world.findClear(p.x+${dx},p.y+${dy},9);
 const e=makeEnemy(s,${id},{...ARCHETYPES.${kind},ambient:true,archetype:'${kind}',roamRadius:8});e.spawnGrace=0;e.roamWait=99;game.enemies.push(e);return {x:Math.round(e.x),y:Math.round(e.y)};})()`);
/** Spieltreiber wie ein aufmerksamer Spieler (die Balance-Rotation liegt als .mjs vor, der Server liefert sie nicht als Modul):
 *  Unterbrechen, aus dem Bodenkreis ausweichen, Heilung unter 50 %, sonst Kniffe in fester Reihenfolge. */
const DRIVE=`(()=>{const g=game,p=g.player;if(g.dead)return 'tot';const act=g.enemies.filter(e=>e.aggro&&e.hp>0&&e.ai==='combat');if(!act.length)return 'frei';if(!g.target||g.target.hp<=0)g.target=act[0];g.autoAttack.enabled=true;
 for(const e of act){const c=e.cast;if(!c)continue;if(c.interruptible&&c.total-c.remaining>.5){const t=g.target;g.target=e;if(g.action('interrupt',null,false,undefined,{quiet:true}))return 'Q';g.target=t;}if(c.ground&&c.remaining<.45&&Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1&&g.action('dash',null,false,undefined,{quiet:true}))return 'dash';}
 if(g.casting||g.gcd>0)return 'gcd';if(p.hp/p.maxHp<.5&&g.action('heal',null,false,undefined,{quiet:true}))return 'heal';
 const aug=g.res?.augen||0;if(aug>=61&&g.action('throw',null,false,undefined,{quiet:true}))return 'throw';
 for(const id of ['burst','mark','strike','throw'])if(g.action(id,null,false,undefined,{quiet:true}))return id;return 'nichts';})()`;
const RESULT=id=>`JSON.stringify({dead:game.dead,hp:Math.round(game.player.hp),max:game.player.maxHp,foe:Math.round(game.enemies.find(e=>e.id===${id})?.hp??0),left:game.enemies.filter(e=>e.aggro&&e.hp>0).map(e=>e.name+' '+Math.round(e.hp)+'/'+e.maxHp)})`;
async function fight(id,seconds,{shotAt=null,name=''}={}){for(let i=0;i<seconds*5;i++){const last=await read(DRIVE);if(last==='tot'||last==='frei'&&i>5)break;if(shotAt!=null&&i===shotAt*5)await shot(name);await wait(200);}return JSON.parse(await read(RESULT(id)));}
try{
 await b.resize(1600,900);
 // A · Käthe Stufe 4 bei Kisten-Ida: Ruhewart bemerkt sie aus 11 m (44 m östlich von Ida, Kenner-Todesort) – „!“, Ruf, roter Balken, erst dann der Wurf
 await load('kaethe',4);const ida=JSON.parse(await read('JSON.stringify(game.world.npc)'));
 await teleport(10040,9200);await wait(5500);
 await plant('warden',0,-90,880201);
 await read(`window.__hits=[];{const h=game.hitPlayer.bind(game);game.hitPlayer=(e,n,...r)=>{window.__hits.push({t:game.time,n:Math.round(n),by:e.name});return h(e,n,...r);};}window.__t0=null;`);
 for(let i=0;i<40&&!(await read('game.enemies.find(e=>e.id===880201)?.aggro'));i++)await wait(50);
 await read('window.__t0=game.time');await wait(650);await tidy();
 const a1=JSON.parse(await read(`(async()=>{const {alertShown,alertProgress}=await import('./foe-rules.js');const e=game.enemies.find(e=>e.id===880201);return JSON.stringify({aggro:e.aggro,mark:alertShown(game,e),bar:alertProgress(game,e),hits:window.__hits.length});})()`));
 await shot('a1-kaethe-4-ruhewart-kuendigt-an');
 assert.ok(a1.aggro&&a1.mark&&a1.bar>0&&a1.bar<1,'Ankündigung sichtbar: '+JSON.stringify(a1));assert.equal(a1.hits,0,'kein Wurf während der Ankündigung');
 await wait(1400);const firstHit=JSON.parse(await read('JSON.stringify(window.__hits[0]?{dt:+(window.__hits[0].t-window.__t0).toFixed(2),n:window.__hits[0].n}:null)'));
 assert.ok(firstHit&&firstHit.dt>=1.3,'erster Wurf nach der Ankündigung: '+JSON.stringify(firstHit));
 checks.push(`A · Ruhewart bemerkt Käthe 4 aus 11 m (44 m östlich von Ida, Kenner-Todesort): „!“ + roter Balken (${Math.round(a1.bar*100)} % nach 0,65 s), Ruf; erster Wurf nach ${firstHit.dt} s`);
 // A2 · wer während der Ankündigung weggeht, wird nicht beworfen
 await load('kaethe',4);await teleport(10040,9200);await wait(5000);await plant('warden',0,-90,880202);
 await read(`window.__hits=[];{const h=game.hitPlayer.bind(game);game.hitPlayer=(e,n,...r)=>{if(e.id===880202)window.__hits.push(n);return h(e,n,...r);};}`);
 for(let i=0;i<40&&!(await read('game.enemies.find(e=>e.id===880202)?.aggro'));i++)await wait(50);
 await read(`(()=>{const p=game.player;game.moveTo=game.world.findClear(p.x-240,p.y+20,9);/* nach Westen Richtung Ida, im Süden steht ein Keiler */game.path=[];})()`);await wait(1900);await tidy();
 const a2=JSON.parse(await read(`JSON.stringify({hits:window.__hits.length,ai:game.enemies.find(e=>e.id===880202)?.ai,aggro:game.enemies.find(e=>e.id===880202)?.aggro,hp:game.player.hp,max:game.player.maxHp})`));
 await shot('a2-kaethe-4-weggegangen-ruhewart-laesst-ab');
 assert.equal(a2.hits,0,'weggegangen: kein Treffer '+JSON.stringify(a2));assert.ok(!a2.aggro,'Ruhewart lässt ab '+JSON.stringify(a2));
 checks.push(`A2 · Käthe geht während der Ankündigung weg: kein Treffer, Ruhewart „${a2.ai}“`);
 // B · Pfanddachs „Sprung“: Bodenkreis + Zauberbalken, Ausweichen kurz vor dem Einschlag
 await load('kaethe',4);await teleport(10040,9200);await wait(5000);await plant('badger',30,0,880203);
 await read(`(()=>{const e=game.enemies.find(e=>e.id===880203);e.aggro=true;e.ai='combat';e.autoTimer=99;e.attackTimer=0;game.target=e;window.__lost=0;const h=game.hitPlayer.bind(game);game.hitPlayer=(en,n,...r)=>{const b=game.player.hp;h(en,n,...r);if(en.lastCast)window.__lost+=b-game.player.hp;};})()`);
 for(let i=0;i<30&&!(await read('!!game.enemies.find(e=>e.id===880203)?.cast'));i++)await wait(50);
 await wait(700);await tidy();const b1=JSON.parse(await read(`(()=>{const c=game.enemies.find(e=>e.id===880203).cast;return JSON.stringify({name:c?.name,ground:c?.ground,left:c&&+c.remaining.toFixed(2),frame:(document.querySelector('#targetPanel')?.innerText||'').replace(/\\s+/g,' ')});})()`));
 await shot('b1-dachs-sprung-bodenkreis');
 assert.ok(b1.ground&&/Sprung/.test(b1.name),'Sprung sichtbar '+JSON.stringify(b1));
 for(let i=0;i<40;i++){const left=await read('game.enemies.find(e=>e.id===880203)?.cast?.remaining??-1');if(left<.45){await read(`game.action('dash')`);break;}await wait(30);}
 await wait(250);await shot('b2-dachs-sprung-ausgewichen');const lost=await read('window.__lost');
 assert.equal(lost,0,'Sprung trotz Ausweichen getroffen');
 checks.push(`B · Pfanddachs „${b1.name}“: roter Bodenkreis 1,5 s, Zielrahmen „${b1.frame.slice(0,60)}“; Ausweichen kurz vor dem Einschlag → 0 Schaden`);
 // C · Käthe Stufe 4 mit Startausrüstung gegen Pfanddachs Stufe 1 (Kenner: gestorben)
 await load('kaethe',4);await teleport(10040,9200);await wait(5000);await plant('badger',40,0,880204);
 await read(`(()=>{const e=game.enemies.find(e=>e.id===880204);game.target=e;e.aggro=true;e.ai='combat';})()`);
 const c=await fight(880204,40,{shotAt:3,name:'c1-kaethe-4-gegen-dachs-1-kampf'});await wait(400);await shot('c2-kaethe-4-gegen-dachs-1-gewonnen');
 assert.ok(!c.dead&&c.foe<=0,'Käthe 4 schlägt den Dachs: '+JSON.stringify(c));
 checks.push(`C · Käthe 4 gegen Pfanddachs 1: gewonnen, Leben ${c.hp}/${c.max}`);
 // D · Schorsch Stufe 6 gegen Ruhewart Stufe 3 (Kenner: direkt gestorben) – der Ruhewart bemerkt ihn, kündigt an, Schorsch kämpft
 await load('schorsch',6);await teleport(10040,9200);await wait(5000);await plant('warden',0,-70,880205);/* Stufe 6 gegen 3: Bemerk-Reichweite 85 % (Stufenabstand) */
 for(let i=0;i<40&&!(await read('game.enemies.find(e=>e.id===880205)?.aggro'));i++)await wait(50);
 await read(`game.target=game.enemies.find(e=>e.id===880205)`);
 assert.ok(await read('game.enemies.find(e=>e.id===880205)?.aggro'),'Ruhewart bemerkt Schorsch');const d=await fight(880205,45,{shotAt:4,name:'d1-schorsch-6-gegen-ruhewart-3-kampf'});await wait(400);await shot('d2-schorsch-6-gegen-ruhewart-3-gewonnen');
 assert.ok(!d.dead&&d.foe<=0,'Schorsch 6 schlägt den Ruhewart: '+JSON.stringify(d));assert.ok(d.hp>d.max*.6,'Schorsch verliert zu viel: '+JSON.stringify(d));
 checks.push(`D · Schorsch 6 gegen Ruhewart 3: gewonnen, Leben ${d.hp}/${d.max}`);
 // E · Einstieg: am alten Ruhewart-Platz 47 m neben Ida lebt ein neutrales Tier
 await load('kaethe',1);await teleport(ida.x+(10086-ida.x)*.7,ida.y+(9156-ida.y)*.7);await wait(2500);await tidy();
 const e1=JSON.parse(await read(`JSON.stringify({near:game.enemies.filter(e=>e.hp>0&&Math.hypot(e.home.x-10086,e.home.y-9156)<3).map(e=>e.name+' ('+e.behavior+')'),angry:game.enemies.filter(e=>e.hp>0&&e.behavior==='aggressive'&&Math.hypot(e.home.x-game.world.npc.x,e.home.y-game.world.npc.y)<430).length,aggro:game.enemies.filter(e=>e.aggro).length})`));
 await shot('e1-einstieg-ida-ohne-ruhewart');
 assert.equal(e1.angry,0,'angriffslustig neben Ida: '+JSON.stringify(e1));
 checks.push(`E · 33 m östlich von Kisten-Ida (Kenner-Todesort): am alten Ruhewart-Platz ${e1.near.join(', ')||'(noch nicht erschienen)'}, kein angriffslustiger Gegner in 54 m um Ida, ${e1.aggro} im Kampf`);
 assert.deepEqual(b.errors,[],'Laufzeitfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS E-72 welt2:\n - '+checks.join('\n - '));
}catch(e){console.error('FAIL',e,JSON.stringify(b.errors).slice(0,2000));try{await shot('failure');}catch{}process.exitCode=1;}
finally{await b.close();}
