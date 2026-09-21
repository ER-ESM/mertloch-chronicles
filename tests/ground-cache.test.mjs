// Boden-Zwischenspeicher (E-49): zeichnet beim ersten Mal alles, danach nichts, beim Verlassen des Rands nur Streifen – und die decken genau die neue Fläche.
import test from 'node:test';
import assert from 'node:assert/strict';
import {GroundCache} from '../ground-cache.js';
const ctx=()=>({save(){},restore(){},setTransform(){},beginPath(){},rect(){},clip(){},drawImage(){},set imageSmoothingEnabled(v){}});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx()})};
const area=r=>(r.x1-r.x0)*(r.y1-r.y0);

test('erster Aufruf baut voll, ruhige Kamera trifft nur noch den Speicher, kleiner Schritt im Rand ebenso',()=>{
 const g=new GroundCache({margin:96}),painted=[],paint=(c,r)=>{painted.push(r);};
 g.draw(ctx(),{ox:1000,oy:500,W:1010,H:448},2,'k',paint,0);assert.equal(painted.length,1);assert.equal(area(painted[0]),(1010+192)*(448+192));
 g.draw(ctx(),{ox:1000,oy:500,W:1010,H:448},2,'k',paint,16);g.draw(ctx(),{ox:1060.5,oy:470,W:1010,H:448},2,'k',paint,32);assert.equal(painted.length,1);assert.deepEqual(g.stats,{full:1,strips:0,hits:2});
});
test('über den Rand hinaus: nur Streifen, zusammen genau die neu sichtbare Fläche, ohne Überlappung',()=>{
 const g=new GroundCache({margin:96}),painted=[],paint=(c,r)=>{painted.push(r);},w=1010+192,h=448+192;
 g.draw(ctx(),{ox:1000,oy:500,W:1010,H:448},2,'k',paint,0);painted.length=0;
 g.draw(ctx(),{ox:1120,oy:440,W:1010,H:448},2,'k',paint,16);/* 120 nach rechts, 60 nach oben */
 assert.equal(g.stats.strips,1);assert.equal(painted.length,2);assert.equal(painted.reduce((s,r)=>s+area(r),0),w*h-(w-120)*(h-60));
 const [a,b]=painted;assert.ok(a.x1<=b.x0||b.x1<=a.x0||a.y1<=b.y0||b.y1<=a.y0,'Streifen überlappen nicht');
});
test('anderer Schlüssel, andere Dichte, Alter oder fehlende Grafik bauen neu auf',()=>{
 const g=new GroundCache({margin:96,maxAge:1000}),v={ox:0,oy:0,W:100,H:100};let ok=true;const paint=()=>ok;
 g.draw(ctx(),v,2,'a',paint,0);g.draw(ctx(),v,2,'b',paint,1);g.draw(ctx(),v,1,'b',paint,2);assert.equal(g.stats.full,3);
 g.draw(ctx(),v,1,'b',paint,1500);assert.equal(g.stats.full,4,'zu alt');
 ok=false;g.invalidate();g.draw(ctx(),v,1,'b',paint,1600);ok=true;g.draw(ctx(),v,1,'b',paint,1700);assert.equal(g.stats.full,5,'vor Ablauf der Wartezeit kein neuer Versuch');g.draw(ctx(),v,1,'b',paint,2700);assert.equal(g.stats.full,6,'Grafik fehlte: nach 1 s neu');
});
