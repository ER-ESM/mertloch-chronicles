import test from 'node:test';
import assert from 'node:assert/strict';
import {readHudLayouts,hudContext,placeHudElement,captureHudPosition} from '../hud-layout.js';
test('HUD layouts sanitize persisted data and keep desktop and touch preferences independent',()=>{
 const s=readHudLayouts({active:999,profiles:[{name:'A'.repeat(100),views:{desktop:{player:{x:4,y:-2,scale:100},constructor:{x:1}},portrait:{player:{x:.2,y:.3,scale:.2}},landscape:{player:{x:.7,y:.1,scale:1.2}}}}]});
 assert.equal(s.active,'0');assert.equal(s.profiles[0].name.length,40);assert.deepEqual(s.profiles[0].views.desktop,{player:{x:1,y:0,scale:1.5}});assert.equal(s.profiles[0].views.portrait.player.scale,1);assert.equal(s.profiles[0].views.landscape.player.x,.7);
 assert.deepEqual(readHudLayouts(null).profiles[0].views,{desktop:{},portrait:{},landscape:{}});assert.equal(readHudLayouts({profiles:Array(20).fill({})}).profiles.length,10);
});
test('HUD anchors round-trip and keep scaled frames inside safe areas across viewport sizes',()=>{
 const box={width:244,height:94};
 for(const [width,height] of [[1440,1000],[390,844],[844,390],[320,568]])for(const scale of [.75,1,1.5]){
  const viewport={width,height,left:20,top:47,right:20,bottom:34},saved={x:.8,y:.65,scale},p=placeHudElement(saved,box,viewport);
  assert.ok(p.x>=20&&p.y>=47);assert.ok(p.x+box.width*p.scale<=width-20+.001);assert.ok(p.y+box.height*p.scale<=height-34+.001);
  if(p.scale===scale){const back=captureHudPosition(p.x,p.y,scale,box,viewport);assert.ok(Math.abs(back.x-saved.x)<1e-9&&Math.abs(back.y-saved.y)<1e-9);}
 }
 assert.equal(hudContext(false,400,800),'desktop');assert.equal(hudContext(true,400,800),'portrait');assert.equal(hudContext(true,800,400),'landscape');
});
test('HUD snapping and out-of-bounds dragging cannot lose a frame off-screen',()=>{
 const b={width:100,height:50},v={width:1000,height:600};
 assert.deepEqual(captureHudPosition(-999,9999,1,b,v),{x:0,y:1,scale:1});
 const p=placeHudElement(captureHudPosition(43,67,1,b,v,true),b,v);assert.equal(p.x,40);assert.equal(p.y,64);
});
