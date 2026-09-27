// Handy-Leistung Runde 2 (27.09.2026): Rechen-Worker für Anziehpuppe, Boden und Sprites. Geprüft wird, was ohne Browser geht:
// das genaue Einrasten (Hauptfaden und Worker liefern dasselbe), die gemeinsame Kachel-/Zusammensetz-Fassung, die Weltgeometrie des
// Boden-Workers, der Bestellweg der Bodenstücke und die :has()-Klassen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../world.js';/* vor terrain-prefetch.js laden (Ringimport world-props ↔ content) */
import {inside,segmentDistance,blockedIn,onRoadIn} from '../world-geometry.js';
import {makeSnap} from '../paperdoll-shrink.js';
import {composeFigure,layersOf,sheetsFor,sheetKeyOf,partOf,baseDirOf} from '../paperdoll-tiles.js';
import {composeCore} from '../paperdoll-kern.js';
import {TerrainPrefetch} from '../terrain-prefetch.js';
import {HAS_STATE,syncHasState} from '../has-state.js';
import {readFileSync} from 'node:fs';

const rand=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const brute=pal=>(r,g,b)=>{let bd=1e18,c;for(const q of pal){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}return c;};

test('Einrasten: genau wie der volle Durchlauf, auch bei Gleichstand, und unabhängig von der Reihenfolge',()=>{
 const cat=JSON.parse(readFileSync(new URL('../assets/paperdoll/runtime/catalog.json',import.meta.url)));const R=rand(9);
 for(const pal of [cat.palette.map(k=>[k>>16,k>>8&255,k&255]),[[10,10,10],[10,10,10],[200,40,40],[40,200,40],[40,40,200],[255,255,255]]]){
  const ref=brute(pal),a=makeSnap(pal),b=makeSnap(pal),colors=[];
  for(let i=0;i<20000;i++)colors.push([R()*255,R()*255,R()*255]);for(const q of pal)colors.push([...q],[q[0]+.5,q[1]-.5,q[2]+.25]);
  for(const c of colors)assert.equal(a(...c),ref(...c),'genau: '+c);
  for(const c of [...colors].reverse())assert.equal(b(...c),ref(...c),'andere Reihenfolge: '+c);
 }
});
test('Kachel-/Zusammensetz-Fassung: Schlüssel, Teile, Richtungen und Ebenen wie im Katalog; composeFigure = composeCore mit demselben Rückruf',()=>{
 const cat=JSON.parse(readFileSync(new URL('../assets/paperdoll/runtime/catalog.json',import.meta.url)));
 assert.equal(partOf(cat,0),0);assert.equal(partOf(cat,cat.split),1);assert.equal(partOf(cat,cat.frames.length),2);
 assert.equal(sheetKeyOf(cat,'koerper','dieter','se',0),'koerper-dieter'+cat.dirs.se);assert.ok(sheetKeyOf(cat,'koerper','dieter','se',1).endsWith('-akt'));
 const own=Object.keys(cat.sources).find(s=>!cat.own.sw.includes(s));assert.equal(baseDirOf(cat,own,'sw',0),'se','gespiegelt aus se');
 const layers=layersOf(cat,'dieter',new Set(['koerper','kutte']));assert.equal(layers[0],'koerper');assert.ok(layers.includes('kutte'));
 const sheets=sheetsFor(cat,'dieter','se',0,new Set(['koerper','kutte']));assert.ok(sheets.includes('kutte-dieter'+cat.dirs.se));assert.equal(new Set(sheets).size,sheets.length);
 const calls=[],tile=(c,arch,s,dir,band,f)=>{calls.push(s+'|'+band);return null;};
 const px=composeFigure(cat,tile,'dieter','se',3,new Set(['koerper','kutte']));
 const calls2=[];composeCore(cat.W,cat.H,cat.bands,layers,(s,band)=>{if(s==='dutt'&&band!=='kopf')return null;if(cat.sources[s]&&!cat.sources[s].bands.includes(band))return null;calls2.push(s+'|'+band);return null;});
 assert.deepEqual(calls,calls2);assert.equal(px.length,cat.W*cat.H*4);
});
test('Weltgeometrie des Boden-Workers: gleiche Antworten wie die Welt',()=>{
 const R=rand(4),w={width:3000,height:3000,grid:new Map(),roadGrid:new Map()};
 for(let i=0;i<60;i++){const x=100+R()*2500,y=100+R()*2500;World.prototype.addGrid.call(w,R()<.4?{x,y,radius:4+R()*15,minX:x-20,maxX:x+20,minY:y-20,maxY:y+20}:{minX:x,minY:y,maxX:x+30+R()*90,maxY:y+20+R()*60});}
 const road={width:12,points:[{x:200,y:300},{x:900,y:420},{x:1500,y:1400}]};for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],s={a,b,road};for(let gx=Math.floor(Math.min(a.x,b.x)/200)-1;gx<=Math.floor(Math.max(a.x,b.x)/200)+1;gx++)for(let gy=Math.floor(Math.min(a.y,b.y)/200)-1;gy<=Math.floor(Math.max(a.y,b.y)/200)+1;gy++){const k=gx+','+gy;if(!w.roadGrid.has(k))w.roadGrid.set(k,[]);w.roadGrid.get(k).push(s);}}
 for(let i=0;i<2000;i++){const x=R()*2800,y=R()*2800,r=1+R()*10;assert.equal(blockedIn(w,x,y,r),World.prototype.blocked.call(w,x,y,r));assert.equal(onRoadIn(w.roadGrid,x,y,2),World.prototype.onRoad.call(w,x,y,2));}
 assert.equal(inside(5,5,[{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10}]),true);assert.equal(segmentDistance(0,5,{x:0,y:0},{x:10,y:0}),5);
});
test('Bodenstücke beim Worker: bestellt nur Nahes, höchstens drei gleichzeitig, Ergebnis landet wie ein selbst gebautes Stück',()=>{
 const drawn=[];globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({drawImage:(bmp,x,y)=>drawn.push([bmp.id,x,y]),set filter(v){},get filter(){return '';}})})};
 try{const rules={pieces:8,ring:160,lead:1100,urgentDist:200},p=new TerrainPrefetch({},rules),jobs=[];p.useRemote({send:(job,cb)=>jobs.push({job,cb})});
  const keyOf=(gx,gy)=>gx+','+gy,has=()=>false,done=[];const view={ox:1024,oy:1024,W:608,H:272};
  p.pump({...view,ox:1000},keyOf,has,(k,cv)=>done.push(k),0);p.pump(view,keyOf,has,(k,cv)=>done.push(k),200);
  assert.equal(jobs.length,3,'höchstens drei unterwegs');for(const {job} of jobs){const ex=Math.max(view.ox-(job.x+32),0,job.x+32-view.ox-view.W),ey=Math.max(view.oy-(job.y+32),0,job.y+32-view.oy-view.H);assert.ok(Math.hypot(ex,ey)<=400,'nur Stücke nahe am Sichtrand');}
  jobs[0].cb({id:7,close(){}});assert.equal(p.stats.remote,1);assert.equal(drawn.length,1);assert.equal(p.waiting.size,2);
  p.pump(view,keyOf,has,()=>{},400);assert.equal(jobs.length,4,'frei gewordener Platz wird nachbestellt');
  jobs[1].cb(null);assert.equal(p.stats.remote,1,'ohne Ergebnis (Worker weg) bleibt das Stück offen – der Bodenstreifen baut es dann selbst');
 }finally{delete globalThis.document;}
});
test('Sprite-Worker nimmt nur Leinwand-Bögen (bitgleich gemessen); ohne DOM/Worker bleibt alles im Hauptfaden',async()=>{
 const {spriteJob,spriteJobStats}=await import('../sprite-jobs.js');
 assert.equal(spriteJob('k',{width:4,height:4},4,4,[],'',()=>{}),false,'kein HTMLCanvasElement → false, der Aufrufer rastert selbst');assert.equal(spriteJobStats.sent,0);
});
test('Diagnose ?noworker= schaltet Rechen-Worker einzeln oder alle ab',async()=>{
 const keys=['__paperdollWorker','__terrainWorker','__spriteWorker'];
 try{globalThis.location={search:'?noworker=terrain'};await import('../frame-segments.js?einzeln');assert.deepEqual(keys.map(k=>globalThis[k]),[undefined,false,undefined]);
  delete globalThis.__terrainWorker;globalThis.location={search:'?render=gpu&noworker=all&z=?render=gpu'};await import('../frame-segments.js?alle');assert.deepEqual(keys.map(k=>globalThis[k]),[false,false,false]);}
 finally{delete globalThis.location;for(const k of keys)delete globalThis[k];}
});
test(':has()-Klassen: jede Bedingung als Klasse am body, nur bei Änderung geschrieben',()=>{
 const present=new Set(['.game-popup','#targetPanel:not(.hidden)']),classes=new Set(),writes=[];
 const body={querySelector:sel=>present.has(sel)?{}:null,classList:{contains:c=>classes.has(c),toggle:(c,on)=>{writes.push(c);on?classes.add(c):classes.delete(c);}}};
 const doc={body,documentElement:{classList:{contains:()=>false,toggle:()=>{}}},querySelector:()=>null};
 syncHasState(doc);assert.ok(classes.has('hs-popup')&&classes.has('hs-target'));assert.equal(classes.size,2);const n=writes.length;syncHasState(doc);assert.equal(writes.length,n,'unverändert: keine Schreibvorgänge');
 present.delete('.game-popup');syncHasState(doc);assert.ok(!classes.has('hs-popup'));
 // Jede Klasse wird im CSS benutzt und keine body-verankerte :has()-Regel mit einer dieser Bedingungen ist übrig.
 const css=['fenster-r3.css','fenster-r4c.css','fenster-r5b.css','mobile.css','mobile-polish.css','meter.css','resource-hud.css','shop.css','ui-chrome.css','panel-pages.css','weltkarte.css','atlas.css'].map(f=>readFileSync(new URL('../'+f,import.meta.url),'utf8')).join('\n');
 for(const [cls,sel] of HAS_STATE){assert.ok(css.includes('.'+cls),cls+' fehlt im CSS');assert.ok(!new RegExp('(body|\\.touch-mode)(\\[[^\\]]*\\]|\\.[\\w-]+|:not\\([^)]*\\))*:has\\('+sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\)').test(css),'noch :has('+sel+') am body');}
});
