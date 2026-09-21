// Raster-Index (E-48): liefert dieselben sichtbaren Objekte wie die Prüfung der ganzen Liste – in Listenreihenfolge.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SpatialIndex} from '../spatial-index.js';
const rnd=(seed=>()=>(seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296)(7);

test('Punkte: Kandidaten enthalten jeden Treffer der Vollprüfung, Reihenfolge bleibt die der Liste',()=>{
 const list=Array.from({length:4000},(_,i)=>({i,x:rnd()*16000-500,y:rnd()*16000-500})),index=new SpatialIndex();
 for(let n=0;n<40;n++){const ox=rnd()*15000,oy=rnd()*15000,W=1010,H=448,pad=100,vis=o=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad;
  const got=index.query('p',list,ox-100,oy-100,ox+W+100,oy+H+100);assert.deepEqual(got.filter(vis).map(o=>o.i),list.filter(vis).map(o=>o.i));assert.ok(got.length<list.length/10,'deutlich weniger Kandidaten');}
});
test('ausgedehnte Objekte über mehrere Zellen erscheinen genau einmal',()=>{
 const big={minX:100,minY:100,maxX:1900,maxY:1300},index=new SpatialIndex();
 assert.deepEqual(index.query('b',[big],0,0,2000,2000,b=>b),[big]);assert.deepEqual(index.query('b',[big],5000,5000,6000,6000,b=>b),[]);
});
test('andere Länge, andere Liste oder Alter bauen den Index neu auf',()=>{
 const list=[{x:10,y:10}],index=new SpatialIndex({maxAge:1000});assert.equal(index.query('p',list,0,0,100,100,undefined,0).length,1);
 list.push({x:20,y:20});assert.equal(index.query('p',list,0,0,100,100,undefined,1).length,2,'Länge geändert');
 list[0].x=3000;assert.equal(index.query('p',list,0,0,100,100,undefined,500).length,2,'verschoben, Index noch jung: Kandidat bleibt (Aufrufer prüft genau)');
 assert.equal(index.query('p',list,0,0,100,100,undefined,2000).length,1,'nach maxAge neu aufgebaut');
});
