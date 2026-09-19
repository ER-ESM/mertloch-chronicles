import test from 'node:test';import assert from 'node:assert/strict';
import {resetProgress,restoreProgress,readBackup,saveKey,backupKey} from '../admin.js';
import {Game} from '../engine.js';import {available} from '../progression.js';
import {mapPlaces,mapView,visibleCreatures,drawAtlas} from '../cartography.js';
const arena=()=>({id:'v2-test',seed:56753,spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
test('reset survives reload, backs up class and quest progression, and leaves other worlds alone',()=>{const w=arena(),s=memory(),g=new Game(w,{trainingXp:400,classId:'kevin',level:3});g.quest.accepted=true;g.quest.wolves=2;const old=g.save(),fresh=new Game(w);s.setItem(saveKey('another-world'),'untouched');s.setItem('mertloch-chronicles-v1',JSON.stringify(old));resetProgress(s,w.id,old,fresh.save());const loaded=new Game(w,JSON.parse(s.getItem(saveKey(w.id))));assert.equal(loaded.trainingXp,0);assert.equal(loaded.member.id,'dieter');assert.equal(loaded.player.level,1);assert.equal(loaded.quest.accepted,false);assert.deepEqual(loaded.skills.filter(x=>available(loaded,x.id)).map(x=>x.id),['auto','strike','dash']);assert.equal(s.getItem(saveKey('another-world')),'untouched');assert.deepEqual(readBackup(s,w.id).save,old);assert.deepEqual(restoreProgress(s,w.id),old);assert.deepEqual(JSON.parse(s.getItem(saveKey(w.id))),old);});
test('failed backup write never replaces progress; corrupt or mismatched backups cannot restore',()=>{const s=memory(),w='test',old={version:1,trainingXp:500};s.setItem(saveKey(w),JSON.stringify(old));const blocked={...s,setItem:(k,v)=>{if(k===backupKey(w))throw Error('quota');s.setItem(k,v);}};assert.throws(()=>resetProgress(blocked,w,old,{version:1,trainingXp:0}),/quota/);assert.deepEqual(JSON.parse(s.getItem(saveKey(w))),old);s.setItem(backupKey(w),'bad json');assert.equal(readBackup(s,w),null);assert.throws(()=>restoreProgress(s,w));s.setItem(backupKey(w),JSON.stringify({worldId:'wrong',save:old}));assert.equal(readBackup(s,w),null);});
test('atlas groups quests at hubs and uses a safe approach for navigation into an occupied camp',()=>{const g={world:{hubs:[{id:'h',name:'Treffpunkt · Dorf',x:0,y:0}],quests:[{id:'q1',giver:{hubId:'h'}},{id:'q2',giver:{hubId:'h'}}],camps:[{id:'c',title:'Lager',x:200,y:300,approach:{x:150,y:100}}]},sideQuests:{q1:{claimed:false},q2:{claimed:true}},enemies:[{campId:'c',hp:1}]};const points=mapPlaces(g);assert.equal(points.length,2);assert.equal(points[0].quests,1);assert.deepEqual(points[1].point,{x:150,y:100});assert.match(points[1].detail,/Besetztes Lager/);});
test('minimap keeps the player centered on rectangular canvases and hides distant ambient clutter',()=>{const p={x:230,y:900},v=mapView({},p,200,150,false);assert.equal((p.x-v.ox)*v.scale,100);assert.equal((p.y-v.oy)*v.scale,75);const g={player:p,enemies:[{id:1,x:240,y:900,hp:10,behavior:'aggressive'},{id:2,x:245,y:900,hp:10,behavior:'neutral'},{id:3,x:5000,y:900,hp:10,behavior:'aggressive'},{id:4,x:240,y:900,hp:0,behavior:'aggressive'}]};assert.deepEqual(visibleCreatures(g,false).map(e=>e.id),[1]);assert.deepEqual(visibleCreatures(g,true),[]);assert.equal(visibleCreatures(g,true,true).length,3);g.target=g.enemies[1];assert.deepEqual(visibleCreatures(g,false).map(e=>e.id),[1,2]);});


test('shop filters draw a clickable kiosk marker at its entrance on full and mini maps',()=>{
 const kiosk={approach:{x:110,y:80},entrance:{x:150,y:120}},w={spawn:{x:0,y:0},places:{kiosk},hubs:[],camps:[],quests:[],areas:[],water:[],roads:[],buildings:[],trees:[]};
 const g={world:w,player:{x:0,y:0},sideQuests:{},enemies:[],destination:()=>null};
 const ctx=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
 for(const full of [true,false])for(const filter of ['all','shop']){
  const canvas={width:780,height:580,getContext:()=>ctx};drawAtlas({world:w,game:g},canvas,full,null,{filter});
  assert.equal(canvas.atlasHits.length,1,'the kiosk must actually be drawn, not only listed');
  const hit=canvas.atlasHits[0],v=canvas.atlasView;assert.equal(hit.id,'shop:kalle');
  assert.equal(hit.x,(kiosk.entrance.x-v.ox)*v.scale);assert.equal(hit.y,(kiosk.entrance.y-v.oy)*v.scale);
  assert.ok(Number.isFinite(hit.x)&&Number.isFinite(hit.y));
 }
});
