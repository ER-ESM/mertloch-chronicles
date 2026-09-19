import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WALK_SPEED,COMBAT_SPEED,stepPlayer} from '../movement.js';
import {redesignArt,redesignPose} from '../redesign-art.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/redesign/runtime/catalog.json',import.meta.url)));
test('production movement traverses the walk cycle at a readable cadence, not six cycles per second',()=>{
 redesignArt.catalog=catalog;
 for(const speed of [WALK_SPEED,COMBAT_SPEED])assert.ok(speed/catalog.stride>=1&&speed/catalog.stride<2);
 const p={x:0,y:0,inCombat:0},g={player:p,move(entity,x,y){entity.x+=x;entity.y+=y;}};let changes=0,last='';
 for(let i=0;i<120;i++){stepPlayer(g,1,0,1/60);const pose=redesignPose(p);if(last&&pose!==last)changes++;last=pose;}
 assert.ok(changes>=16&&changes<=26,'actual movement and rendering agree about frame cadence');
 const distance=p.walkDistance;for(let i=0;i<180;i++)stepPlayer(g,0,0,1/60);const stopped=p.walkDistance;assert.ok(stopped>=distance);assert.equal(p.moving,false);assert.equal(redesignPose(p),'idle');
});
test('every hero pose exports fitted masks and walk hands follow the moving upper body',()=>{
 for(const a of Object.values(catalog.assets))for(const f of a.frames)for(const slot of ['legs','feet','hands','wrists']){
  assert.ok(Array.isArray(f.wearRuns[slot]),a.hero+' '+f.pose+' '+slot);
  for(const [y,x,w]of f.wearRuns[slot])assert.ok(y>=0&&y<192&&x>=0&&w>0&&x+w<=192);
 }
 for(const hero of ['dieter','anni','kevin'])for(let row=0;row<4;row++){
  const f=catalog.assets[hero+'-walk'].frames.slice(row*8,row*8+8);
  assert.ok(Math.abs(f[0].sockets.main.x-f[4].sockets.main.x)>2,'visible hand swing has a matching gear socket');
  assert.ok(f[1].sockets.head.y>f[3].sockets.head.y,'down and up carry weight through the body');
 }
});

test('restarting from a stopped swing begins with grounded feet at every supported framerate',()=>{
 redesignArt.catalog=catalog;
 for(const hz of [30,60,144])for(const stoppedDistance of [20,30,60,70]){
  const p={x:0,y:0,walkDistance:stoppedDistance,moving:false},g={player:p,move(entity,x,y){entity.x+=x;entity.y+=y;}};
  stepPlayer(g,1,0,1/hz);
  assert.equal(redesignPose(p),'walk-0',hz+' Hz: no airborne restart at distance '+stoppedDistance);
  assert.ok(p.walkDistance>stoppedDistance,'distance remains cumulative');
  assert.equal(redesignPose({...p,casting:true}),'cast','action pose still wins immediately');
  for(let i=0;i<hz;i++)stepPlayer(g,0,0,1/hz);
  assert.equal(redesignPose(p),'idle');
  const distance=p.walkDistance;for(let i=0;i<hz;i++)stepPlayer(g,0,0,1/hz);
  assert.equal(p.walkDistance,distance,'no movement or animation drift at rest');
 }
});

test('walks transfer weight twice, keep stance flat and clear the ground during swing',()=>{
 for(const asset of Object.values(catalog.assets).filter(a=>a.state==='walk'||a.state==='heavywalk'))for(let row=0;row<4;row++){
  const frames=asset.frames.slice(row*8,row*8+8);
  assert.equal(frames.filter(f=>f.joints.every(j=>j.support)).length,2);
  for(const f of frames)for(const j of f.joints){
   if(j.support){assert.equal(j.ankle.y,j.groundY);assert.equal(j.footAngle,0);}
   else assert.ok(j.ankle.y<=j.groundY,'swing never penetrates the ground');
  }
  for(const [phase,side]of [[2,1],[6,0]])assert.ok(frames[phase].joints[side].groundY-frames[phase].joints[side].ankle.y>3,'passing foot visibly clears the ground');
 }
});
