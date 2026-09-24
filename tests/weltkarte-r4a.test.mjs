// Runde 4a (2026-09-24): Weltkarte – Bündeln, Filter, Symbole, Zielgebiete.
import test from 'node:test';import assert from 'node:assert/strict';
import {clusterMarkers,mapPlaces,mapShow,levelTone,worldAreas,drawAtlas} from '../cartography.js';
import {MAP_PAINT,mapIcon} from '../map-symbols.js';
import {WORLD_MAP_UI} from '../content/index.js';

const minGap=groups=>{let m=Infinity;for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)m=Math.min(m,Math.hypot(groups[i].x-groups[j].x,groups[i].y-groups[j].y));return m;};

test('Marker näher als 24 px werden ein Bündel, weiter entfernte bleiben einzeln an ihrer Stelle',()=>{
 const g=clusterMarkers([{x:100,y:100,id:'a'},{x:110,y:104,id:'b'},{x:200,y:100,id:'c'}],24);
 assert.equal(g.length,2);const bundle=g.find(x=>x.members.length===2),single=g.find(x=>x.members.length===1);
 assert.deepEqual(bundle.members.map(m=>m.id).sort(),['a','b']);assert.deepEqual([single.x,single.y],[200,100],'Einzelmarker bleibt genau an seinem Punkt');
 assert.deepEqual([bundle.x,bundle.y],[105,102],'Bündel steht in der Mitte seiner Orte');
});
test('nach dem Bündeln liegen alle Gruppen mindestens 24 px auseinander (auch bei Ketten und Zufallswolken)',()=>{
 // Kette: jeder Nachbar 20 px entfernt – die Mitten dürfen nicht wieder zu eng werden.
 const chain=Array.from({length:8},(_,i)=>({x:i*20,y:0}));assert.ok(minGap(clusterMarkers(chain,24))>=24);
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let run=0;run<40;run++){const pts=Array.from({length:30},()=>({x:rnd()*300,y:rnd()*200}));const g=clusterMarkers(pts,24);
  assert.ok(minGap(g)>=24,'Lauf '+run);assert.equal(g.reduce((s,x)=>s+x.members.length,0),30,'kein Marker geht verloren');}
});
test('das wichtigste Symbol führt das Bündel (Auftrag vor Treffpunkt vor Lager)',()=>{
 const g=clusterMarkers([{x:0,y:0,prio:1,id:'camp'},{x:5,y:5,prio:3,id:'hub'},{x:8,y:0,prio:4,id:'quest'}],24);
 assert.equal(g.length,1);assert.equal(g[0].members[0].id,'quest');
});
test('Filter: kombinierbare Gruppen; alter Einzelfilter zeigt nur seine Gruppe',()=>{
 const all=mapShow({});assert.equal(all.quest,true);assert.equal(all.camp,true);assert.equal(all.creatures,false,'Lebewesen nur auf Wunsch');assert.equal(all.spawn,false,'Tiergebiete nur auf Wunsch');
 assert.deepEqual(Object.keys(all).sort(),WORLD_MAP_UI.groups.map(x=>x.id).sort());
 const shop=mapShow({filter:'shop'});assert.equal(shop.shop,true);assert.equal(shop.trainer,true);assert.equal(shop.quest,false);
 const own={quest:true,camp:false};assert.equal(mapShow({show:own,filter:'camp'}),own,'die Filterliste gewinnt');
});
test('Orte tragen Gruppe und Symbol, Lager und Treffpunkte keine Ziffern mehr',()=>{
 const g={world:{hubs:[{id:'h',name:'Clan-Treff · Dorf',x:0,y:0}],quests:[],camps:[{id:'c',title:'Lager',x:200,y:300,approach:{x:150,y:100}}],places:{kiosk:{approach:{x:5,y:5}}}},sideQuests:{},enemies:[{campId:'c',hp:1,level:4},{campId:'c',hp:1,level:6}],player:{level:12}};
 const p=mapPlaces(g);for(const h of p){assert.ok(h.group&&h.icon,'Gruppe und Symbol: '+h.id);assert.ok(MAP_PAINT[h.icon],'Symbol gemalt: '+h.icon);assert.equal(h.number,undefined,'keine Ziffer/kein Buchstabe: '+h.id);}
 const camp=p.find(h=>h.kind==='camp');assert.deepEqual(camp.level,{min:4,max:6});assert.equal(camp.icon,'camp');
 assert.equal(p.find(h=>h.id==='shop:kalle').icon,'trade');
});
test('Schwierigkeitsfarbe nach Stufenabstand wie in WoW',()=>{
 assert.equal(levelTone(-6),levelTone(-5));assert.notEqual(levelTone(-5),levelTone(-4));assert.equal(levelTone(-3),levelTone(-4));
 assert.equal(levelTone(0),levelTone(2));assert.notEqual(levelTone(2),levelTone(3));assert.equal(levelTone(5),levelTone(9));
});
test('Zielgebiet des verfolgten Ziels ist hervorgehoben, Fortschritt steht bereit',()=>{
 const g={quest:{accepted:true,chapter:1,chapterClaimed:0},objectives:()=>[{kind:'kill',label:'Keiler jagen',count:4},{kind:'kill',label:'Dachse',count:2}],objectiveProgress:i=>({done:i,need:[4,2][i],complete:false}),campFor:o=>o.label==='Dachse'?{x:900,y:0}:{x:0,y:0}};
 const a=worldAreas(g,{x:10,y:0});assert.equal(a.length,2);assert.equal(a[0].tracked,true);assert.equal(a[1].tracked,undefined);assert.equal(a[0].need,4);assert.equal(a[1].done,1);
});
test('Symbole brauchen ohne DOM kein Canvas; die Weltkarte zeichnet ohne DOM ohne Ziffern',()=>{
 assert.equal(mapIcon('quest'),null);
 const w={spawn:{x:0,y:0},places:{},hubs:[{id:'h',name:'Clan-Treff · Dorf',x:0,y:0}],camps:[{id:'c',title:'Lager',x:40,y:0}],quests:[],areas:[],water:[],roads:[],buildings:[],trees:[]};
 const g={world:w,player:{x:600,y:600,level:3},sideQuests:{},enemies:[],destination:()=>null};const texts=[];
 const ctx=new Proxy({measureText:s=>({width:s.length*6}),fillText:t=>texts.push(String(t))},{get:(o,k)=>o[k]||(()=>{})});
 const canvas={width:780,height:580,getContext:()=>ctx};drawAtlas({world:w,game:g},canvas,true,null,{});
 assert.ok(!texts.some(t=>/^\d+$/.test(t)&&!canvas.atlasHits.some(h=>h.cluster&&String(h.ids.length)===t)),'nur Bündelzahlen als Ziffern: '+texts);
 assert.ok(canvas.atlasPlayer,'Standort hat eine Trefferfläche');
});
