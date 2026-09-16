import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildBoarRig} from '../tools/sprite-pipeline/build-boar-rig.mjs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {boarFoot,boarPose} from '../maifeld-boar-rig.js';
import {FieldTrial} from '../maifeld-combat.js';
const rig=JSON.parse(readFileSync(new URL('../assets/maifeld-prototype/runtime/keiler-rig.json',import.meta.url)));

test('rig assets rebuild byte-identically with hard alpha and intact part bounds',()=>{
 const a=buildBoarRig(),b=buildBoarRig();for(const [name,data] of a){assert.deepEqual(data,b.get(name));assert.deepEqual(data,readFileSync(new URL('../assets/maifeld-prototype/runtime/'+name,import.meta.url)));}
 const im=decodePng(a.get('keiler-rig.png'));for(let i=3;i<im.data.length;i+=4)assert.ok(im.data[i]===0||im.data[i]===255);
 for(const d of rig.directions){assert.equal(Object.keys(d.parts).length,5);for(const p of Object.values(d.parts)){assert.ok(p.rect.w>5&&p.rect.h>5);assert.ok(p.rect.x+p.rect.w<=im.width&&p.rect.y+p.rect.h<=im.height);}}
});
test('every walking sample keeps one identical body; four feet remain bounded, supported and continuous at the loop seam',()=>{
 for(const d of rig.directions){const body=boarPose(rig,d.id,0).body;let prior;
  for(let i=0;i<=240;i++){const p=boarPose(rig,d.id,i/240*rig.stride);assert.deepEqual(p.body,body);assert.ok(p.legs.filter(l=>l.foot.planted).length>=2);
   for(const [j,leg] of p.legs.entries()){assert.ok(Math.abs(leg.angle)<.25);assert.ok(leg.foot.y<=80);if(prior)assert.ok(Math.hypot(leg.foot.x-prior.legs[j].foot.x,leg.foot.y-prior.legs[j].foot.y)<.3);}
   prior=p;
  }
  const first=boarPose(rig,d.id,0),last=boarPose(rig,d.id,rig.stride);assert.deepEqual(first,last);
  const idle=boarPose(rig,d.id,12,false),settled=boarPose(rig,d.id,12,0);assert.deepEqual(idle,settled);assert.deepEqual(idle.body,body);
 }
 // Position and velocity must agree on both sides of contact and loop boundaries.
 for(const at of [0,.65,1]){const eps=1e-5,a=boarFoot(at-eps),b=boarFoot(at),c=boarFoot(at+eps);assert.ok(Math.abs(a.x-c.x)<.001);assert.ok(Math.abs((b.x-a.x)/eps-(c.x-b.x)/eps)<.01);}
});
test('roaming follows fixed waypoints with real pauses rather than alternating idle/walk every tick',()=>{
 const g=new FieldTrial({blocked:()=>false,lineClear:()=>true},{x:0,y:0},[{x:150,y:0}]);const e=g.enemies[0],runs=[];let last=e.moving,count=0,moves=0;
 for(let i=0;i<1800;i++){const to=e.roamTarget&&{...e.roamTarget};g.tick(1/60);if(to&&e.roamTarget)assert.deepEqual(e.roamTarget,to);if(e.moving)moves++;if(e.moving!==last){runs.push(count);count=0;last=e.moving;}count++;assert.ok(e.gaitWeight>=0&&e.gaitWeight<=1);}
 assert.ok(moves>200);assert.ok(runs.length>8&&runs.length<35);assert.ok(runs.slice(1).every(n=>n>=20),JSON.stringify(runs));
 g.world.blocked=()=>true;for(let i=0;i<60;i++)g.tick(1/60);assert.equal(e.gaitWeight,0);assert.equal(e.moving,false);
});
test('small target movements do not flicker a pursuing boar between front and rear',()=>{
 const g=new FieldTrial({blocked:()=>false,lineClear:()=>true},{x:60,y:0},[{x:0,y:0}]),e=g.enemies[0];e.aggro=true;e.direction='se';
 for(let i=0;i<20;i++){g.player.y=i%2?.02:-.02;g.tick(1/60);assert.equal(e.direction,'se');}
});
