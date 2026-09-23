// Figurengrößen-Prüfung: Sind Söldner, NPCs und Dorfbewohner so groß wie der Held?
// Misst die tatsächlich gezeichnete Figur (Kopf bis Fuß, Deckkraft ab 50 %, ohne Namensschild, Schatten und Plakette)
// über dieselben Zeichenwege und dasselbe Maß wie renderer.js (PERSON_SCALE aus world-scale.js), mit den im Spiel
// geladenen Bögen (Heldenbögen, Präzisionsbögen, Sprite-Schmiede). Ausgabe in Welteinheiten und in Bildschirmpixeln
// bei der Kamera im Dorf und in der Bude. Grenze: ±5 % zur Heldenhöhe; Bosse dürfen bewusst größer sein.
// Aufnahmen (nicht eingecheckt) unter visual-review/figure-size/: Held neben Söldnern, Held neben NPCs im Dorf, Bude.
// Aufruf: node scripts/figure-size-check.mjs [http://…]   ·   --no-shots: nur messen
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const TOLERANCE=.05,dir='visual-review/figure-size',shots=!process.argv.includes('--no-shots');mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9447,serverPort:4247});
const read=s=>b.evaluate(s);
const shot=async name=>{const r=await b.send('Page.captureScreenshot',{format:'png',clip:{x:1012-450,y:450-260,width:900,height:460,scale:1}});(await import('node:fs')).writeFileSync(dir+'/'+name+'.png',Buffer.from(r.data,'base64'));};
try{
 await b.resize(2024,900);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:3,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:50}};
 const inj=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',inj);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);
 for(let i=0;i<80&&!(await read(`import('./content-art.js').then(m=>m.contentArt.ready&&!!m.contentAsset('olli'))`));i++)await wait(250);
 await wait(1500);
 // ---- Messung: Zeichenwege wie renderer.js, 8 Messpixel je Welteinheit.
 const m=await read(`(async()=>{
  const {drawClanHero}=await import('./clan-art.js'),{drawWorldPerson}=await import('./person-art.js'),{drawComicResident}=await import('./comic-actors.js');
  const {drawLivePerson,liveActorHeight}=await import('./live-art.js'),{PERSON_SCALE,WORLD_SCALE}=await import('./world-scale.js');
  const {hotspotLayout}=await import('./hotspots.js'),{SHOP_UI,SIDE_QUESTS,COMPANIONS}=await import('./content/index.js');
  const S=8,N=720,FY=560;
  const measure=draw=>{const cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d',{willReadFrequently:true});c.setTransform(S,0,0,S,N/2,FY);draw(c);
   const d=c.getImageData(0,0,N,N).data;let top=-1,bottom=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(d[(y*N+x)*4+3]>=128){if(top<0)top=y;bottom=y;break;}
   return top<0?null:{h:+((bottom+1-top)/S).toFixed(2),overFoot:+((FY-top)/S).toFixed(2)};};
  const w=game.world,rows=[],add=(kind,id,draw)=>rows.push({kind,id,...measure(draw)});
  for(const id of ['dieter','baerbel','kevin'])add('held',id,c=>drawClanHero(c,0,0,0,{classId:id,facing:1,direction:'se',visualEquipment:[]},false,PERSON_SCALE));
  // Söldner und andere Spieler: renderer.js Zweig 'other' (companions.js reicht c.view mit look = Klassen-ID)
  for(const id of [...new Set(COMPANIONS.filter(d=>d.kind==='merc').map(d=>d.look))])add('soeldner',id,c=>drawClanHero(c,0,0,0,{facing:1,classId:id,direction:'se'},false,PERSON_SCALE));
  add('npc','ida',c=>drawClanHero(c,0,0,0,{facing:1},true,PERSON_SCALE));
  // alle Nebenauftrags-Geber aus content/quests.js (nicht nur die dieser Welt) und die Hotspot-Geber samt Stammgästen (E-61)
  const givers=new Set([...SIDE_QUESTS.map(q=>q.npc),...(w.quests||[]).map(q=>q.giver.npc),...hotspotLayout(w).hotspots.map(h=>h.giver.npc)]);
  for(const id of givers)if(id!=='ida')add('questgeber',id,c=>drawWorldPerson(c,id,0,0,0,PERSON_SCALE,{facing:-1}));
  add('haendler',SHOP_UI.npc,c=>drawWorldPerson(c,SHOP_UI.npc,0,0,0,PERSON_SCALE,{facing:1}));
  for(let v=0;v<8;v++)add('dorf','villager'+v,c=>{c.scale(PERSON_SCALE,PERSON_SCALE);drawComicResident(c,{kind:'villager',variant:v,x:0,y:0,id:v},0);});
  for(const id of ['gisela','sigi'])add('lehrer',id,c=>drawWorldPerson(c,id,0,0,0,PERSON_SCALE,{facing:-1,artMagnify:WORLD_SCALE.npc/(liveActorHeight(id)||WORLD_SCALE.npc)}));
  for(const id of ['dieter','baerbel','kevin'])add('mentor (ruht, E-61)','mentor-'+id,c=>drawLivePerson(c,'mentor-'+id,0,0,0,{facing:-1},PERSON_SCALE));
  return rows;})()`);
 // ---- Kamera: Bildschirmpixel je Welteinheit im Dorf und in der Bude (gleiche Zeichenwege, Kamera kann abweichen).
 const place=(x,y,floor=0)=>read(`(()=>{game.floor=${floor};Object.assign(game.player,{x:${x},y:${y},inCombat:0,moving:false});game.moveTo=null;game.path=[];game.enemies=[];document.querySelectorAll('[data-window-close]').forEach(b=>b.click());})()`);
 const village=await read(`(()=>{const h=game.world.church;return{x:(h.minX+h.maxX)/2,y:h.maxY+60};})()`);
 const bude=await read(`(()=>{const h=game.world.base.house,s=h.spots.ida;return{x:s.x+24,y:s.y+6,minX:h.minX,minY:h.minY};})()`);
 await place(village.x,village.y);await wait(600);const zoomVillage=await read('__mertloch.renderer.zoom');
 await place(bude.x,bude.y);await wait(600);const zoomBude=await read('__mertloch.renderer.zoom');
 const hero=m.find(r=>r.kind==='held'&&r.id===(save.classId)).h,bad=[];
 const table=m.map(r=>{const boss=r.id==='timo',dev=r.h/hero-1,ok=boss?dev>=-TOLERANCE&&dev<=.25:Math.abs(dev)<=TOLERANCE;if(!ok)bad.push(r.kind+' '+r.id+' '+r.h+' E ('+(dev*100).toFixed(1)+' %)');
  return{art:r.kind+(boss?' (Boss-Figur)':''),figur:r.id,'Höhe E':r.h,'über Fuß E':r.overFoot,'Dorf px':+(r.h*zoomVillage).toFixed(1),'Bude px':+(r.h*zoomBude).toFixed(1),'Abw. %':+(dev*100).toFixed(1),ok:ok?'ja':'NEIN'};});
 console.table(table);
 console.log('Kamera: Dorf '+zoomVillage+' px/E, Bude '+zoomBude+' px/E · Held '+hero+' E · Grenze ±'+TOLERANCE*100+' %');
 if(shots){
  // Held mit zwei Söldnern (Schild und Fernkampf) im Dorf
  await place(village.x,village.y);await read(`document.querySelector('#announcement')?.classList.add('faded');document.querySelectorAll('.milestone').forEach(e=>e.hidden=true)`);
  await read(`(async()=>{const C=await import('./companions.js');for(const id of ['merc-pils-peter','merc-radler-rita'])C.hireCompanion(game,id,{free:true});game.companions.forEach((c,i)=>Object.assign(c,{order:'stay',state:'follow',x:game.player.x+(i?-22:22),y:game.player.y,moving:false,path:[]}));})()`);
  await read(`__mertloch.renderer.setZoomFactor(1.8)`);await wait(900);await read(`document.querySelectorAll('.milestone').forEach(e=>e.hidden=true)`);await shot('1-dorf-held-soeldner');
  // Held neben Questgebern und Dorfbewohnern: zwei Geber und ein Bewohner neben den Helden gestellt
  await read(`(async()=>{const {hotspotLayout}=await import('./hotspots.js');game.companions.forEach(c=>{c.x=game.player.x-400;c.y=game.player.y;});const p=game.player,g=[...(game.world.quests||[]).map(q=>q.giver)].slice(0,2),v=game.life.actors.find(a=>a.kind==='villager');
   g.forEach((n,i)=>Object.assign(n,{x:p.x+(i?-22:22),y:p.y}));if(v)Object.assign(v,{x:p.x+44,y:p.y+2,moving:false,target:null,wait:99});})()`);await wait(900);await shot('2-dorf-held-npcs');
  // Bude: Held zwischen Ida und Hotfix-Olli, Söldner daneben
  await read(`(async()=>{const {hotspotLayout}=await import('./hotspots.js');const w=game.world,h=w.base.house,i=w.npc,o=hotspotLayout(w).hotspots.find(x=>x.giver.npc==='olli')?.giver;game.floor=0;Object.assign(game.player,{x:i.x+22,y:i.y,inCombat:0});if(o)Object.assign(o,{x:i.x+44,y:i.y});game.companions.forEach((c,k)=>Object.assign(c,{x:i.x+66+k*22,y:i.y}));game.moveTo=null;game.path=[];})()`);await wait(900);await shot('3-bude-held-ida-olli-soeldner');
  console.log('Aufnahmen: '+dir);
 }
 const errors=await read(`(window.__errors||[]).length`);assert.ok(!errors,'keine Skriptfehler');
 assert.deepEqual(bad,[],'Figuren außerhalb ±'+TOLERANCE*100+' % zur Heldenhöhe');
 console.log('✔ figure-size-check: '+m.length+' Figuren im Rahmen');
}finally{b.close();}
