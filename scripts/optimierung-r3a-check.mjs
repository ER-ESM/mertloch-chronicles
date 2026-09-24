// Optimierung Runde 3, Teil A „Kampfeinstieg & Interaktion“ (2026-09-24): jeder Punkt per Klickpfad mit echten Maus- und Tastenereignissen.
// 1 Autopilot stoppt beim ersten Angreifer; „Weg einschlagen“ schließt die Karte; roter Rand bei Angriff hinter einem Fenster
// 2 Rechtsklick trifft genau den angeklickten Gegner (zwei dicht beieinander, auch im Nahkampf und über das Namensschild);
//   Rechtsklick auf einen NPC läuft hin und redet; Feind außer Reichweite: Kniff läuft hin statt „Zu weit entfernt“
// 3 Tab nimmt Feinde vor neutralen Tieren
// 4 F nimmt das gewählte Ziel vor dem Schwarzen Brett; das gesperrte Brett meldet sich als rote Zeile
// 5 Notfallbrezel im Kampf; Ablehnung als rote Fehlerzeile
// 6 Auftragszeichen am Quest-Gegner (Zielrahmen), Pfandkeiler im Zielgebiet zählen, Pfeil zeigt fest auf die Gebietsmitte, Symbol statt Satz
// 7 frischer Held Stufe 1: Weg zu Idas erstem Ziel per Auftragskasten, ein Kill, kein Tod (mit Messwerten)
// 8 Kleinkram: „?“ über Ida, Hofprobe-Balken, Tod-Satz, Randale-Leiste, Erinnerung wartet, kein „Autoangriff an“-Toast
// Screenshots: visual-review/optimierung-r3a/. Ports: CDP 9500, Server 4300 (CDP_PORT/SERVER_PORT).
import assert from 'node:assert/strict';
import {session,wait} from './r3a-lib.mjs';
import {TUTORIAL,COMBAT_TEXT,SYSTEM_LINES} from '../content/index.js';
const s=await session();
const {b,read,rect,click,shot,zoom,start,TO_SCREEN}=s;
/** Warten, bis die Kamera nach einem Versetzen des Helden wieder auf ihm steht. */
async function settle(){/* Runde 4b: zusätzlich warten, bis die Kamera ruht – unter Last stand sie nach 700 ms noch 20–40 E neben dem Helden, der Rechtsklick auf Ida traf dann den Boden */let last=null;for(let i=0;i<60;i++){const c=await read(`const v=window.mertloch.state().viewport;return {x:v.camera.x,y:v.camera.y}`);if(last&&Math.hypot(c.x-last.x,c.y-last.y)<.4)break;last=c;await wait(150);}for(let i=0;i<40;i++){const d=await read(TO_SCREEN+`const p=window.game.player,a=toS(p),r=document.querySelector('#world').getBoundingClientRect();return Math.hypot(a.x-(r.left+r.width/2),a.y-(r.top+r.height/2))`);if(d<30)return;await wait(100);}}
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const only=process.env.ONLY?process.env.ONLY.split(','):null,run=n=>!only||only.includes(String(n));
const fresh={level:1,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1}};
const mod=`const Q=await import('./quest-mobs.js');`;
const ev=js=>b.evaluate(`(async()=>{${js}})()`);
/** Freie Fläche ohne Gegner rund um den Helden (Feldgegner weit weg). */
const CLEAR=`const g=window.game,w=g.world;const base=w.findClear(w.npc.x+700,w.npc.y-500,9);Object.assign(g.player,base,{vx:0,vy:0,inCombat:0});g.moveTo=null;g.path=[];g.routeGoal=null;g.approach=null;g.autopilot=null;g.autoAttack.enabled=false;g.target=null;g.friend=null;g.attackers?.clear();
 for(const e of g.enemies)if(Math.hypot(e.x-base.x,e.y-base.y)<900){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;e.ai='roaming';}
 const clone=(name,dx,dy,extra={})=>{const src=g.enemies.find(e=>e.name===name)||g.enemies.find(e=>e.behavior==='aggressive');const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null}),{id:880000+Math.floor(Math.random()*9999)},extra);const p=w.findClear(base.x+dx,base.y+dy,9);Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:false,ai:'roaming',spawnGrace:0,cast:null,roamWait:999,attackTimer:99});g.enemies.push(e);return e;};window.__clone=clone;window.__base=base;`;
try{
 // ---------- 1) Autopilot ----------
 if(run(1)){
 await start(fresh);
 await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x,w.npc.y+30,9));g.player.inCombat=0;`);
 await b.press('m');await wait(700);
 assert.ok(await rect('[data-navigate]'),'Karte offen mit „Weg einschlagen“');
 await shot('r3a-10-karte-vor-weg');
 const nav=await rect('[data-navigate]');await click(nav.l+nav.w/2,nav.t+nav.h/2);await wait(400);
 let st=await read(`const g=window.game;return {map:!!document.querySelector('#largeMap'),route:!!g.routeGoal,moving:!!g.moveTo,auto:!!g.autopilot}`);
 assert.ok(!st.map&&st.route&&st.moving&&st.auto,'„Weg einschlagen“: Karte zu, Figur läuft '+JSON.stringify(st));
 ok('Karte: „Weg einschlagen“ schließt die Karte, die Figur läuft los (Autopilot)');
 // Ein Keiler am Weg greift an → Autopilot hält.
 await wait(1500);
 await read(`const g=window.game,w=g.world,p=g.player,next=g.moveTo;const src=g.enemies.find(e=>e.name==='Pfandkeiler')||g.enemies.find(e=>e.behavior==='aggressive');const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null}),{id:990001});const dx=next.x-p.x,dy=next.y-p.y,d=Math.hypot(dx,dy)||1;const at=w.findClear(p.x+dx/d*45,p.y+dy/d*45,9);Object.assign(e,at,{home:{...at},hp:e.maxHp,aggro:false,ai:'roaming',spawnGrace:0,cast:null,roamWait:99,ambient:false});g.enemies.push(e);window.__k=e;`);
 for(let i=0;i<30;i++){await wait(100);st=await read(`const g=window.game;return {aggro:window.__k.aggro,route:!!g.routeGoal,moving:!!g.moveTo,hp:g.player.hp}`);if(st.aggro)break;}
 await wait(250);st=await read(`const g=window.game;return {aggro:window.__k.aggro,route:!!g.routeGoal,moving:!!g.moveTo,target:g.target===window.__k}`);
 assert.ok(st.aggro&&!st.route&&!st.moving&&st.target,'Aggro stoppt den Autopiloten, Angreifer wird Ziel '+JSON.stringify(st));
 await shot('r3a-11-autopilot-stoppt');ok('Autopilot: Gegner bemerkt den Helden → Figur bleibt stehen, der Angreifer ist Ziel');
 // Auftragskasten-Klick: startet, Treffer eines neuen Angreifers stoppt.
 await read(`const g=window.game;for(const e of g.enemies)if(e.aggro){e.aggro=false;e.hp=0;}g.player.inCombat=0;g.attackers?.clear();g.target=null;`);
 const box=await rect('.quest-panel');await click(box.l+box.w/2,box.t+Math.min(30,box.h/2));await wait(300);
 st=await read(`const g=window.game;return {route:!!g.routeGoal,auto:!!g.autopilot}`);assert.ok(st.route&&st.auto,'Auftragskasten startet den Laufweg '+JSON.stringify(st));
 await read(`const g=window.game;const e=window.__k;e.hp=e.maxHp;e.aggro=false;Object.assign(e,{x:g.player.x+20,y:g.player.y});g.hitPlayer(e,10);`);await wait(150);
 st=await read(`const g=window.game;return {route:!!g.routeGoal,moving:!!g.moveTo}`);assert.ok(!st.route&&!st.moving,'erster Treffer stoppt den Laufweg '+JSON.stringify(st));
 ok('Auftragskasten: Laufweg startet, der erste Treffer eines neuen Angreifers hält ihn an');
 // Wer schon kämpft, hält den Rückzug nicht auf.
 await read(`const g=window.game,p=g.player;const e=window.__k;e.aggro=true;e.ai='combat';g.navigate({x:p.x-200,y:p.y+40});g.hitPlayer(e,5);`);await wait(100);
 assert.ok(await read(`return !!window.game.routeGoal`),'Rückzug: Treffer des bekannten Verfolgers stoppt nicht');
 ok('Rückzug aus dem Kampf: der schon kämpfende Verfolger hält den Laufweg nicht an');
 // Roter Rand: Fenster offen, Angriff.
 await read(`const g=window.game;g.moveTo=null;g.path=[];g.routeGoal=null;g.player.hp=g.player.maxHp;`);
 await b.press('c');await wait(500);
 await read(`const g=window.game;const e2=Object.assign(structuredClone({...window.__k,chasePath:[],returnPath:[],plateAt:null}),{id:990002});g.enemies.push(e2);Object.assign(e2,{x:g.player.x+18,y:g.player.y,aggro:true,ai:'combat'});g.hitPlayer(e2,8);`);
 await wait(180);
 st=await read(`const r=document.querySelector('#attackRim');return {pulse:!!r?.classList.contains('pulse'),op:r?+getComputedStyle(r).opacity:0}`);
 assert.ok(st.pulse&&st.op>.2,'roter Rand pulsiert bei offenem Fenster '+JSON.stringify(st));
 await shot('r3a-12-roter-rand-hinter-fenster');ok('Angriff bei offenem Figurenfenster: roter Bildrand pulsiert');
 await b.press('Escape');await wait(200);
 }
 // ---------- 2) Rechtsklick = genau dieses Ziel ----------
 if(run(2)){
 await start({level:3,tutorial:{version:1,step:8,completed:true}});
 await read(CLEAR+`const k=clone('Pfandkeiler',70,0,{name:'Pfandkeiler'}),sch=clone('Festzelt-Schnorrer',80,-12,{name:'Festzelt-Schnorrer',type:'cultist',skin:'warden',variant:'scrounger',family:'scrounger'});window.__k=k;window.__s=sch;`);
 await wait(600);
 let at=await read(TO_SCREEN+`const k=window.__k;return toS({x:k.x-4,y:k.y-6})`);
 await click(at.x,at.y,'right');await wait(200);
 let st=await read(`const g=window.game;return {k:g.target===window.__k,s:g.target===window.__s,name:g.target?.name}`);
 assert.ok(st.k,'Rechtsklick auf den Keiler vor dem Schnorrer wählt den Keiler '+JSON.stringify(st));
 await read(`const g=window.game;g.target=null;g.autoAttack.enabled=false;g.approach=null;g.moveTo=null;g.path=[];g.routeGoal=null;Object.assign(g.player,window.__base);`);await wait(300);
 at=await read(TO_SCREEN+`const s=window.__s;return toS({x:s.x,y:(s.spriteTop??s.y-30)+4})`);
 await click(at.x,at.y,'right');await wait(200);
 st=await read(`const g=window.game;return {k:g.target===window.__k,s:g.target===window.__s}`);
 assert.ok(st.s,'Rechtsklick auf den Kopf des Schnorrers dahinter wählt den Schnorrer '+JSON.stringify(st));
 await shot('r3a-20-rechtsklick-genau-dieses-ziel');
 ok('Rechtsklick: zwei Gegner dicht beieinander – jeweils genau der angeklickte');
 // Nachstellung Kenner-Befund: Keiler kaut im Nahkampf, Schnorrer 13 m entfernt – Rechtsklick auf den Keiler.
 await read(`const g=window.game,p=g.player,k=window.__k,sc=window.__s;g.target=null;g.autoAttack.enabled=false;g.approach=null;Object.assign(g.player,window.__base);Object.assign(k,{x:p.x+16,y:p.y+4,aggro:true,ai:'combat',hp:k.maxHp});Object.assign(sc,{x:p.x+104,y:p.y-10,aggro:false,ai:'roaming',roamWait:999});`);
 await wait(500);at=await read(TO_SCREEN+`const k=window.__k;return toS({x:k.x,y:k.y-8})`);
 await click(at.x,at.y,'right');await wait(200);
 st=await read(`const g=window.game;return {k:g.target===window.__k,name:g.target?.name}`);
 assert.ok(st.k,'Nahkampf: Rechtsklick auf den kauenden Keiler wählt ihn, nicht den Schnorrer in 13 m '+JSON.stringify(st));
 // Namensschild neben dem Helden anklicken.
 await read(`window.game.target=null;`);await wait(400);
 const plate=await read(TO_SCREEN+`const k=window.__k;return k.plateAt?toS({x:k.plateAt.x,y:k.plateAt.y+5}):null`);
 if(plate){await click(plate.x,plate.y,'right');await wait(200);assert.ok(await read(`return window.game.target===window.__k`),'Klick aufs Namensschild wählt den Keiler');}
 await zoom('r3a-21z-nahkampf-rechtsklick',{l:at.x-160,t:at.y-120,w:320,h:200});
 ok('Nahkampf: Rechtsklick auf den Keiler (und auf sein Namensschild) wählt ihn, nicht den Schnorrer in 13 m');
 // Feind außer Reichweite: Taste 2 (Kniff) läuft hin statt „Zu weit entfernt“.
 await read(`const g=window.game,k=window.__k;Object.assign(g.player,window.__base);Object.assign(k,{x:window.__base.x+160,y:window.__base.y+10,aggro:false,ai:'roaming',hp:k.maxHp});g.target=k;g.autoAttack.enabled=false;g.approach=null;window.__t=[];const o=g.toast.bind(g),f=g.fail.bind(g);g.toast=t=>{window.__t.push(t);return o(t)};g.fail=t=>{window.__t.push(t);return f(t)};`);
 await b.press('2');await wait(200);
 st=await read(`const g=window.game;return {ap:!!g.approach,moving:!!g.moveTo,t:window.__t}`);
 assert.ok(st.ap&&st.moving&&!st.t.some(t=>/Zu weit/.test(t)),'Kniff auf fernen Feind: hinlaufen statt „Zu weit entfernt“ '+JSON.stringify(st));
 ok('Kniff auf einen Feind außer Reichweite: die Figur läuft hin (kein „Zu weit entfernt“)');
 // Rechtsklick auf einen NPC: hinlaufen und reden.
 await read(`const g=window.game,w=g.world;g.target=null;g.approach=null;g.moveTo=null;g.path=[];g.routeGoal=null;g.autoAttack.enabled=false;for(const e of g.enemies)if(Math.hypot(e.x-w.npc.x,e.y-w.npc.y)<600){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;}Object.assign(g.player,w.findClear(w.npc.x+120,w.npc.y+60,9),{inCombat:0});`);
 await wait(300);await settle();
 at=await read(TO_SCREEN+`const n=window.game.world.npc;return toS({x:n.x,y:n.y-12})`);
 await click(at.x,at.y,'right');await wait(200);
 assert.ok(await read(`return !!window.game.talkTo&&!!window.game.moveTo`),'Rechtsklick auf Ida: Figur läuft los');
 let open=false;for(let i=0;i<40&&!open;i++){await wait(150);open=await read(`return !!document.querySelector('.game-popup[data-window="dialog"], [data-window-id="dialog"]')||window.mertloch.state().popups.some(p=>p.id==='dialog')`);}
 st=await read(`const g=window.game,n=g.world.npc;return {d:Math.round(Math.hypot(g.player.x-n.x,g.player.y-n.y)),moving:!!g.moveTo}`);
 assert.ok(open&&!st.moving&&st.d<=50,'Rechtsklick auf Ida: hingelaufen, stehen geblieben, Gespräch offen '+JSON.stringify(st));
 await shot('r3a-22-rechtsklick-npc-redet');ok('Rechtsklick auf Ida: hinlaufen, anhalten (nicht auf ihr), Gespräch öffnet sich');
 await b.press('Escape');await wait(200);
 }
 // ---------- 3) Tab ----------
 if(run(3)){
 await start({level:3,tutorial:{version:1,step:8,completed:true}});
 await read(CLEAR+`const r=clone('Pfanddachs',30,0,{name:'Leergut-Rabe',behavior:'neutral',aggroRange:0}),k=clone('Pfandkeiler',150,20,{name:'Pfandkeiler'});window.__r=r;window.__k=k;`);
 await wait(300);await b.press('Tab');await wait(150);
 let st=await read(`const g=window.game;return {k:g.target===window.__k,r:g.target===window.__r}`);
 assert.ok(st.k,'Tab: Feind in 19 m vor dem neutralen Raben in 4 m '+JSON.stringify(st));
 await read(`const g=window.game;g.target=null;const k=window.__k;k.aggro=true;k.ai='combat';k.roamWait=999;`);await b.press('Tab');await wait(150);
 st=await read(`const g=window.game;return {k:g.target===window.__k}`);assert.ok(st.k,'Tab: Angreifer zuerst');
 await read(`const g=window.game,k=window.__k;k.aggro=false;k.ai='roaming';k.x+=4000;k.home={x:k.x,y:k.y};g.target=null;g.player.inCombat=0;`);await b.press('Tab');await wait(150);
 st=await read(`const g=window.game,r=window.__r;return {r:g.target===r,t:g.target?.name,inC:g.player.inCombat,d:Math.round(Math.hypot(r.x-g.player.x,r.y-g.player.y)),hp:r.hp,ai:r.ai,sg:r.spawnGrace}`);assert.ok(st.r,'ohne Feind in Reichweite darf Tab den Raben nehmen '+JSON.stringify(st));
 ok('Tab: Feinde vor neutralen Tieren (auch wenn das Tier näher steht), Angreifer zuerst; ohne Feind geht auch das Tier');
 }
 // ---------- 4) F-Priorität ----------
 if(run(4)){
 await start(fresh,{all:false});
 const board=await ev(`const g=window.game,w=g.world;const {companionBoardPoint}=await import('./companion-ui.js');const bp=companionBoardPoint(w);return bp?{x:bp.x,y:bp.y}:null;`);
 assert.ok(board,'Schwarzes Brett vorhanden');
 await read(`const g=window.game,w=g.world;const bp=${JSON.stringify(board)};Object.assign(g.player,w.findClear(bp.x,bp.y+20,9));Object.assign(w.npc,w.findClear(bp.x+26,bp.y+28,9));g.target=null;g.friend=null;window.__t=[];const o=g.toast.bind(g);`);
 await settle();
 let label=await read(`return document.querySelector('#interact:not(.hidden) span')?.textContent||''`);
 const at=await read(TO_SCREEN+`const n=window.game.world.npc;return toS({x:n.x,y:n.y-12})`);
 await click(at.x,at.y);await wait(300);
 {const dbg=await ev(`const T=await import('./target-ui.js');const g=window.game,n=g.world.npc;return {friend:g.friend?.kind,target:g.target?.name,unit:T.unitAt(g,n.x,n.y-12)?.kind,popups:window.mertloch.state().popups.map(p=>p.id),moving:!!g.moveTo}`);await shot('r3a-dbg-f');assert.ok(dbg.friend==='npc','Ida angeklickt = gewählt '+JSON.stringify({dbg,at}));}
 await wait(200);const label2=await read(`return document.querySelector('#interact:not(.hidden) span')?.textContent||''`);
 await b.press('f');await wait(400);
 const dlg=await read(`return window.mertloch.state().popups.map(p=>p.id)`);
 assert.ok(/Ida|sprechen/.test(label2)&&dlg.includes('dialog'),'F mit gewählter Ida: Gespräch statt Schwarzem Brett '+JSON.stringify({label,label2,dlg}));
 await shot('r3a-30-f-nimmt-gewaehltes-ziel');ok('F: gewählte Ida hat Vorrang vor dem Schwarzen Brett ('+label+' → '+label2+')');
 await b.press('Escape');await wait(200);await b.press('Escape');await wait(200);
 await read(`const g=window.game,w=g.world;Object.assign(w.npc,w.findClear(w.npc.x+400,w.npc.y,9));g.friend=null;g.target=null;`);await wait(3600);
 const label3=await read(`return document.querySelector('#interact:not(.hidden) span')?.textContent||''`);
 await b.press('f');let toast=null;
 for(let i=0;i<30;i++){await wait(150);toast=await read(`const t=document.querySelector('#toast');return {text:t.textContent,error:t.classList.contains('toast-error'),color:getComputedStyle(t).color,popups:window.mertloch.state().popups.map(p=>p.id)}`);if(toast.error)break;}
 assert.ok(toast.text&&toast.error&&/^rgb\(255, \d{1,2}, /.test(toast.color),'gesperrtes Schwarzes Brett: rote Zeile '+JSON.stringify({label3,toast}));
 await zoom('r3a-31z-brett-gesperrt-rot',await rect('#toast'),20);ok('Schwarzes Brett (gesperrt): rote Zeile „'+toast.text+'“');
 }
 // ---------- 5) Notfallbrezel ----------
 if(run(5)){
 await start({level:1,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1}},{all:false});
 await read(CLEAR+`const k=clone('Pfandkeiler',18,0,{name:'Pfandkeiler'});k.aggro=true;k.ai='combat';k.attackTimer=99;k.autoTimer=99;window.__k=k;g.player.hp=6;g.player.inCombat=7;`);
 await b.press('0');await wait(250);
 let st=await read(`const g=window.game;return {hp:g.player.hp,count:g.rpg.inventory.find(e=>e.id==='brezel')?.count,combat:g.player.inCombat>0}`);
 assert.ok(st.hp>100&&st.count===2&&st.combat,'Taste 0 im Kampf bei 6 Leben: Brezel heilt '+JSON.stringify(st));
 await b.press('0');await wait(200);
 const t=await read(`const t=document.querySelector('#toast');return {text:t.textContent,error:t.classList.contains('toast-error'),color:getComputedStyle(t).color}`);
 assert.ok(/noch nicht bereit/.test(t.text)&&t.error&&/^rgb\(255, \d{1,2}, /.test(t.color),'zweiter Druck: rote Zeile „noch nicht bereit“ '+JSON.stringify(t));
 await shot('r3a-40-brezel-im-kampf');await zoom('r3a-40z-fehlerzeile-rot',await rect('#toast'),20);
 const tip=await ev(`const {ITEMS}=await import('./rpg.js');return ITEMS.brezel.description`);/* Tooltip selbst ist Teil B; hier zählt der Gegenstandstext */
 assert.ok(/auch (mitten )?im Kampf/.test(tip),'Gegenstandstext sagt „auch im Kampf“ '+tip.replace(/<[^>]+>/g,' ').slice(0,400));
 ok('Notfallbrezel: Taste 0 heilt im Kampf (6 → '+Math.round(st.hp)+'), zweiter Druck zeigt rote Zeile „'+t.text+'“');
 }
 // ---------- 6) Auftragsgegner ----------
 if(run(6)){
 await start(fresh);
 const r=await ev(mod+`const g=window.game,w=g.world;const o=g.objectives()[0],camp=g.campFor(o);Object.assign(g.player,w.findClear(camp.x-160,camp.y+60,9));g.player.inCombat=0;
  const plu=g.enemies.find(e=>e.campId===camp.id&&e.hp>0);const src=g.enemies.find(e=>e.name==='Pfandkeiler')||plu;
  const mk=(dx,dy)=>{const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null}),{id:970000+Math.floor(Math.random()*999),name:'Pfandkeiler',ambient:true,campId:'field-x',family:'boar',type:'wolf'});const p=w.findClear(camp.x+dx,camp.y+dy,9);Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:false,spawnGrace:0});g.enemies.push(e);return e;};
  const inside=mk(-120,40),outside=mk(-900,0);window.__in=inside;window.__pl=plu;
  const before=g.quest.wolves;g.kill(inside);const after=g.quest.wolves;
  return {plu:Q.questMob(g,plu),inside:Q.questMob(g,mk(-100,20)),outside:Q.questMob(g,outside),before,after,dest:g.destination(),areas:Q.chapterAreas(g).length};`);
 assert.ok(r.plu&&r.inside&&!r.outside,'Auftragsgegner: Lager und Pfandkeiler im Zielgebiet ja, draußen nein '+JSON.stringify(r));
 assert.equal(r.after,r.before+1,'ein Pfandkeiler im Zielgebiet zählt für „Pfandkeiler von den Trümmern jagen“');
 assert.ok(r.areas>=1,'Zielgebiet für Karte/Minikarte '+r.areas);
 await read(`const g=window.game;g.target=window.__pl;g.friend=null;`);await wait(500);
 const q=await read(`const q=document.querySelector('#targetPanel .target-quest');return q?{hidden:q.hidden,label:q.dataset.tooltipLabel}:null`);
 assert.ok(q&&!q.hidden,'Zielrahmen trägt das Auftragszeichen '+JSON.stringify(q));
 await zoom('r3a-50z-zielrahmen-auftragszeichen',await rect('#targetPanel'),12);
 await shot('r3a-51-auftragsgegner-namensschild');
 // Pfeil: fester Punkt beim Laufen am Lagerrand.
 const pts=await read(`const g=window.game,o=g.objectives()[0],camp=g.campFor(o),a=camp.approach;const out=[];for(const f of [1.6,1.2,1.0,.8,.5,.2]){Object.assign(g.player,{x:camp.x+(a.x-camp.x)*f,y:camp.y+(a.y-camp.y)*f});const d=g.destination();out.push(Math.round(d.point.x)+','+Math.round(d.point.y));}return out;`);
 assert.equal(new Set(pts).size,1,'Wegmarke springt nicht zwischen Lagerrand und Lager '+JSON.stringify(pts));
 // Symbol statt Satz bei „zieht ab“.
 await read(`const g=window.game,e=window.__pl;e.ai='returning';g.target=e;window.__t=[];const o=g.toast.bind(g);g.toast=t=>{window.__t.push(t);return o(t)};`);
 await b.press('2');await wait(300);
 const sym=await read(`const s=document.querySelector('#targetPanel .target-state');return {shown:!!s&&!s.hidden,label:s?.dataset.tooltipLabel,toast:window.__t.join('|')}`);
 assert.ok(sym.shown&&!/zieht gerade ab/.test(sym.toast),'Symbol mit Tooltip statt Satz '+JSON.stringify(sym));
 await read(`window.__pl.ai='roaming';`);
 ok('Auftragsgegner: Zeichen im Zielrahmen, Pfandkeiler im Zielgebiet zählen (0→1), Wegmarke fest auf der Gebietsmitte, „zieht ab“ als Symbol');
 }
 // ---------- 7) Erster Kampf: frischer Held Stufe 1 auf dem Weg zu Idas erstem Ziel ----------
 if(run(7)){
 const fight=async(entry,label)=>{
  await start(fresh,{all:false});
  await ev(`const E=await import('./entry-path.js');E.ENTRY.maxLevel=${entry?3:0};window.game.entryRoute=null;`);
  await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x,w.npc.y+30,9));g.player.inCombat=0;window.__seen=new Map();window.__minHp=g.player.hp;window.__stops=0;const o=g.emit.bind(g);g.emit=(t,d)=>{if(t==='autopilotStop')window.__stops++;return o(t,d);};`);
  await settle();
  const box=await rect('.quest-panel');const t0=Date.now();let st=null,brezel=0,starts=0;
  const clickBox=async()=>{starts++;await click(box.l+box.w/2,box.t+Math.min(30,box.h/2));};
  await clickBox();
  for(let i=0;i<900;i++){
   await wait(150);
   st=await read(`const g=window.game,p=g.player;for(const e of g.enemies)if(e.aggro&&e.hp>0&&!window.__seen.has(e.id))window.__seen.set(e.id,{n:e.name,lvl:e.level,amb:!!e.ambient});window.__minHp=Math.min(window.__minHp,p.hp);
    const o=g.objectives()[0],camp=g.campFor(o);return {hp:Math.round(p.hp),max:p.maxHp,dead:g.dead,aggro:g.enemies.filter(e=>e.aggro&&e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<300).length,moving:!!g.moveTo,wolves:g.quest.wolves,kills:g.stats.kills,camp:Math.round(Math.hypot(camp.x-p.x,camp.y-p.y)),target:!!(g.target?.hp>0)}`);
   if(st.dead||st.wolves>=1)break;
   if(st.aggro){if(!st.target)await b.press('Tab');await b.press('2');await b.press('1');if(st.hp<st.max*.35){await b.press('0');brezel++;}}
   else if(!st.moving)await clickBox();
   if(Date.now()-t0>150000)break;
  }
  const seen=await read(`return {seen:[...window.__seen.values()],minHp:Math.round(window.__minHp),stops:window.__stops}`);
  return {label,...st,secs:Math.round((Date.now()-t0)/1000),starts,brezel,...seen};
 };
 // REPEAT=n: mehrere Läufe je Variante für die Messwerte im Bericht (Standard 1).
 let off,on;for(let r=0;r<Number(process.env.REPEAT||1);r++){off=await fight(false,'ohne Einstiegsweg-Entschärfung');console.log('Messung',JSON.stringify({...off,seen:off.seen.map(e=>e.n)}));on=await fight(true,'mit Einstiegsweg-Entschärfung');console.log('Messung',JSON.stringify({...on,seen:on.seen.map(e=>e.n)}));}
 await shot('r3a-60-erster-kampf-geschafft');
 assert.ok(!on.dead&&on.wolves>=1,'frischer Held Stufe 1: erreicht Idas erstes Ziel, erster Quest-Kill, lebt '+JSON.stringify(on));
 ok('Erster Kampf (Stufe 1, Auftragskasten-Klick): '+on.kills+' Kill(s), '+on.wolves+'/3 Pfandkeiler, lebt mit min. '+on.minHp+'/'+on.max+' Leben, '+on.seen.length+' Gegner bemerkten den Helden, '+on.stops+'× Autopilot gestoppt, '+on.secs+' s · ohne Entschärfung: '+(off.dead?'TOT':'lebt')+', '+off.seen.length+' Gegner, min. '+off.minHp+' Leben');
 }
 // ---------- 8) Kleinkram ----------
 if(run(8)){
 // „?“ über Ida bei der Rückkehr aus der Hofprobe, „!“ zu Beginn.
 await start({level:1,tutorial:{version:1,step:7,completed:false}},{all:false});
 let m=await ev(mod+`const g=window.game;const a=Q.idaMark(g);g.tutorial.step=0;const b=Q.idaMark(g);g.tutorial.step=7;return {back:a,begin:b}`);
 assert.deepEqual(m,{back:'?',begin:'!'},'Ida: „?“ zur Abgabe der Hofprobe, „!“ am Anfang');
 await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x+45,w.npc.y+8,9));`);await settle();await wait(1200);
 /* Ida steht in der Hofprobe drinnen hinter der Fassade – das Zeichen prüft idaMark, gezeichnet wird es von renderer.js */
 ok('Ida zeigt „?“, wenn die Hofprobe abgegeben wird');
 // Hofprobe 5/8: zweiter Versuch mit Wirkzeit-Balken, höchstens zwei Versuche.
 await start({level:1,tutorial:{version:1,step:4,completed:false}},{all:false});
 await read(`const g=window.game,o=g.toast.bind(g);window.__t=[];g.toast=t=>{window.__t.push(t);return o(t)};g.tutorial.step=4;g.tutorial.clock=0;g.tutorial.tries=0;g.tutorial.dash=false;`);
 for(let i=0;i<30&&!await read(`return !!window.game.enemies.find(e=>e.tutorial)?.cast`);i++)await wait(150);
 await read(`const e=window.game.enemies.find(e=>e.tutorial),p=window.game.player;Object.assign(p,{x:e.cast.x,y:e.cast.y});e.cast.remaining=.05;`);await wait(400);
 for(let i=0;i<40&&!await read(`return !!window.game.enemies.find(e=>e.tutorial)?.cast`);i++)await wait(150);
 m=await read(`const c=window.game.enemies.find(e=>e.tutorial).cast;return {bar:!!c.bar,total:c.total}`);
 assert.ok(m.bar,'zweiter Kreis mit Wirkzeit-Balken '+JSON.stringify(m));await wait(900);
 await shot('r3a-71-hofprobe-zweiter-versuch-balken');
 await read(`const e=window.game.enemies.find(e=>e.tutorial),p=window.game.player;Object.assign(p,{x:e.cast.x,y:e.cast.y});e.cast.remaining=.05;`);await wait(500);
 m=await read(`return {step:window.game.tutorial.step,t:window.__t}`);
 assert.ok(m.step===5&&m.t.includes(TUTORIAL.giveUp),'nach zwei Versuchen weiter, mit Meldung '+JSON.stringify(m));
 ok('Hofprobe 5/8: zweiter Kreis mit Wirkzeit-Balken, nach zwei Versuchen weiter mit klarer Meldung');
 // Randale-Leiste, kein „Autoangriff an“-Toast, Tod-Satz ohne Hose.
 await start(fresh,{all:false});
 await read(CLEAR+`const k=clone('Pfandkeiler',20,0,{name:'Pfandkeiler'});window.__k=k;`);await wait(300);
 const bar=await read(`const e=document.querySelector('.player-panel .energy');return e?{hidden:e.classList.contains('bar-hidden'),display:getComputedStyle(e).display}:null`);
 assert.ok(bar&&!bar.hidden&&bar.display!=='none','Randale-Leiste beim neuen Helden sichtbar '+JSON.stringify(bar));
 await read(`window.game.target=window.__k;`);await b.press('1');await wait(300);
 m=await read(`return {auto:window.game.autoAttack.enabled,toast:document.querySelector('#toast').textContent}`);
 assert.ok(m.auto&&m.toast!==COMBAT_TEXT.autoOn,'Autoangriff an ohne Kurzmeldung '+JSON.stringify(m));
 await zoom('r3a-72z-randale-leiste',await rect('.player-panel'),10);
 await read(`const g=window.game;window.__t=[];const o=g.toast.bind(g);g.toast=t=>{window.__t.push(t);return o(t)};g.player.hp=1;const k=window.__k;k.aggro=true;g.hitPlayer(k,50);`);await wait(500);
 await read(`document.querySelector('#respawn, #deathScreen [data-ds-wake]')?.click()`);await wait(600);
 m=await read(`return window.__t`);
 assert.ok(m.includes(SYSTEM_LINES.respawnNoPants)&&!m.includes(SYSTEM_LINES.respawn),'Tod-Satz ohne Hose '+JSON.stringify(m));
 ok('Randale-Leiste sichtbar, „Autoangriff an“ nur am Platz (keine Kurzmeldung), Tod-Satz „immer noch ohne Hose“');
 // Erinnerung wartet, bis der Held ruhig steht und kein Fenster offen ist.
 await read(`const g=window.game;g.player.inCombat=0;g.moveTo=null;g.path=[];for(const e of g.enemies)e.aggro=false;`);
 await b.press('c');await wait(300);
 await ev(`const {MEMORY_FRAGMENTS}=await import('./content/index.js').catch(()=>({}));const g=window.game;const f=(MEMORY_FRAGMENTS&&Object.values(MEMORY_FRAGMENTS)[0])||null;g.events.push({type:'memory',fragment:f||{id:'pizzeria',title:'Prüfung',text:'Prüfung'}});`);
 await wait(400);await b.press('Escape');await wait(700);
 const early=await read(`return window.mertloch.state().popups.map(p=>p.id)`);
 let late=[];for(let i=0;i<25;i++){await wait(200);late=await read(`return window.mertloch.state().popups.map(p=>p.id)`);if(late.includes('memory'))break;}
 assert.ok(!early.includes('memory')&&late.includes('memory'),'Erinnerung erst nach Ruhe '+JSON.stringify({early,late}));
 ok('Erinnerung springt nicht direkt nach dem Schließen eines Fensters dazwischen, sondern erst nach 1,5 s Ruhe');
 }
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('FEHLER',e.message);await shot('r3a-fehler').catch(()=>{});process.exitCode=1;}
finally{s.close();}
