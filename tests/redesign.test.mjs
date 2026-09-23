import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {buildRedesign,COLUMNS,DIRECTIONS} from '../tools/redesign/build.mjs';
import {redesignArt,redesignPose,redesignFrame,redesignGear,drawRedesignPerson,validRedesignCatalog} from '../redesign-art.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {ITEM_CATALOG} from '../content/items.js';
import {Game} from '../engine.js';
import {legGarmentSegments} from '../live-art.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url)),catalog=JSON.parse(read('assets/redesign/runtime/catalog.json'));
test('complete production matrix has every authored action, direction and modular gear view',()=>{
 assert.equal(catalog.complete,true);assert.equal(Object.keys(catalog.assets).length,15);
 for(const hero of ['dieter','anni','kevin'])for(const state of Object.keys(COLUMNS)){
  const a=catalog.assets[hero+'-'+state];assert.equal(a.frames.length,COLUMNS[state].length*4);
  for(const direction of DIRECTIONS)for(const pose of COLUMNS[state])assert.equal(a.frames.filter(f=>f.direction===direction&&f.pose===pose).length,1);
  assert.equal(createHash('sha256').update(read(a.source)).digest('hex'),a.sourceHash);
  assert.ok(a.sourceScale>0);assert.equal(a.nativeHeight/a.worldHeight,4);
  const im=decodePng(read(a.path));for(let i=3;i<im.data.length;i+=4)assert.ok(im.data[i]===0||im.data[i]===255);
  for(const f of a.frames){assert.ok(f.bounds.x>=2&&f.bounds.y>=2&&f.bounds.x+f.bounds.w<=190&&f.bounds.y+f.bounds.h<=190);assert.ok(f.bounds.count>800);for(const key of ['main','off'])assert.ok(f.sockets[key].x>0&&f.sockets[key].x<192&&f.sockets[key].y>0&&f.sockets[key].y<192);}
 }
 assert.equal(Object.keys(catalog.gear).length,6);for(const views of Object.values(catalog.gear))assert.equal(views.length,4);
});
test('action priority remains correct while moving; walk is distance-driven and wraps',()=>{
 const moving={moving:true,walkDistance:30};assert.equal(redesignPose(moving),'walk-3');
 for(const [p,pose]of [[{dead:true},'dead'],[{hp:0},'dead'],[{dash:.1},'dash'],[{hurt:.1},'hit'],[{parry:.1},'parry'],[{casting:true},'cast'],[{casting:true,usingRanged:true},'ranged-aim'],[{attack:.24},'anticipation'],[{attack:.13},'impact'],[{attack:.02},'recovery'],[{attack:.02,usingRanged:true},'ranged-release']])assert.equal(redesignPose({...moving,...p}),pose);
 assert.equal(redesignPose({resting:true}),'rest');assert.equal(redesignPose({resting:true,moving:true}),'walk-0');assert.equal(redesignPose({moving:true,walkDistance:80}),'walk-0');assert.equal(redesignPose({moving:true,walkDistance:-10}),'walk-7');
});
test('every playable pose has an independent underwear body and alpha-owned clothing masks',()=>{
 const provenance=JSON.parse(read('assets/redesign/sources/underwear/generation.json'));
 assert.ok(catalog.dressing.complete);
 for(const a of Object.values(catalog.assets)){
  assert.ok(provenance.records.some(r=>r.source===a.baseSource&&r.sha256===a.baseSourceHash));
  const im=decodePng(read(a.basePath));
  for(const f of a.frames){
   assert.ok(f.base&&f.base.hash!==f.hash);assert.ok(f.base.bounds.count>500);
   const ownership=new Set();
   for(const slot of ['body','legs','feet'])for(const [y,x,w]of f.base.wearRuns[slot])for(let xx=x;xx<x+w;xx++){
    assert.equal(im.data[((f.y+y)*im.width+f.x+xx)*4+3],255,`${a.hero} ${f.pose}: ${slot} paints outside body`);
    const key=y*192+xx;assert.ok(!ownership.has(key),`${a.hero} ${f.pose}: slots overlap`);ownership.add(key);
   }
  }
 }
 const incomplete=structuredClone(catalog);delete incomplete.assets['anni-walk'].frames[0].base;assert.equal(validRedesignCatalog(incomplete),false);
});
test('painted walk articulates both hips and knees with opposite support phases',()=>{
 for(const hero of ['dieter','anni','kevin'])for(let row=0;row<4;row++){
  const a=catalog.assets[hero+'-walk'];assert.equal(a.animation,'registered-painted-mesh');
  const first=a.frames[row*8],opposite=a.frames[row*8+4];
  assert.ok(first.joints[0].stridePhase*first.joints[1].stridePhase<0);assert.ok(first.joints[0].stridePhase*opposite.joints[0].stridePhase<0);
  assert.ok(Math.abs(first.joints[0].ankle.x-opposite.joints[0].ankle.x)>10);
  assert.ok(a.frames[row*8].joints[0].kneeAngle!==a.frames[row*8].joints[1].kneeAngle);
  assert.equal(new Set(a.frames.slice(row*8,row*8+8).map(f=>f.hash)).size,8);
 }
});
test('aliases select complete heroes; unloaded delivery and unrelated NPCs retain fallback',()=>{
 redesignArt.ready=false;assert.equal(redesignFrame('dieter'),null);assert.equal(drawRedesignPerson({},'dieter',0,0),false);
 redesignArt.catalog=catalog;redesignArt.ready=true;redesignArt.images=new Map(Object.keys(catalog.assets).map(k=>[k,{}]));
 assert.equal(redesignFrame('baerbel',{direction:'nw',casting:true}).key,'anni-poses');assert.equal(redesignFrame('baerbel',{direction:'nw',casting:true}).frame.direction,'nw');assert.equal(redesignFrame('resident'),null);assert.equal(redesignFrame('dieter',{artPose:'unknown'}),null);
 for(const hero of ['dieter','anni','kevin'])for(const direction of DIRECTIONS)for(const pose of Object.values(COLUMNS).flat())assert.equal(redesignFrame(hero,{direction,artPose:pose}).frame.pose,pose);
});
test('theme gear respects inventory families and two-hand restrictions',()=>{
 const items=equipmentAppearance({weapon:'tresenhammer',offhand:'topfdeckel'},ITEM_CATALOG);assert.equal(items.some(i=>i.slot==='offhand'),false);assert.equal(items[0].hands,2);
 assert.equal(redesignGear('dieter',items[0]),'beerhammer');assert.equal(redesignGear('anni',{asset:'shield'}),'citrusshield');assert.equal(redesignGear('kevin',{asset:'slingshot'}),'pfandsling');assert.equal(redesignGear('dieter',{asset:'bottle'}),null);
 for(const hero of ['dieter','anni','kevin']){assert.equal(redesignFrame(hero,{visualEquipment:items,attack:.25}).key,hero+'-heavy');assert.equal(redesignFrame(hero,{visualEquipment:items,moving:true}).key,hero+'-heavywalk');assert.equal(redesignFrame(hero,{visualEquipment:items,usingRanged:true,attack:.25}).key,hero+'-specials');assert.equal(redesignFrame(hero,{visualEquipment:items,usingRanged:true,parry:.3}).key,hero+'-heavy');}
});
test('equipped trousers bend at the knee and keep continuous texture across both bones',()=>{
 const leg={hip:{x:0,y:0},knee:{x:6,y:8},ankle:{x:0,y:16}},parts=legGarmentSegments(leg);
 assert.equal(parts.length,2);assert.ok(parts[0].angle<0&&parts[1].angle>0,'opposite segment angles follow the bent knee');
 const endpoint=(p,sign)=>({x:p.x-sign*Math.sin(p.angle)*(p.h-1)/2,y:p.y+sign*Math.cos(p.angle)*(p.h-1)/2});
 for(const [part,sign]of [[parts[0],1],[parts[1],-1]]){const p=endpoint(part,sign);assert.ok(Math.hypot(p.x-leg.knee.x,p.y-leg.knee.y)<1e-8,'both garment segments meet the actual knee');}
 assert.equal(parts[0].slice[0],0);assert.equal(parts[0].slice[1],parts[1].slice[0]);assert.equal(parts[1].slice[1],1);
 assert.deepEqual(legGarmentSegments({hip:leg.hip,knee:leg.hip,ankle:leg.ankle}),[]);
});
test('painted fingers remain below hand jewelry with fitted clothing enabled',()=>{
 redesignArt.catalog=catalog;redesignArt.ready=true;redesignArt.images=new Map(Object.keys(catalog.assets).map(k=>[k,{id:k}]));
 const events=[],ctx=Object.fromEntries(['save','restore','translate','rotate','scale','beginPath','ellipse','fill','arc','clip'].map(k=>[k,()=>{}]));ctx.drawImage=()=>events.push('pixels');
 const equipment=[{slot:'weapon',asset:'maul',hands:2},{slot:'ring1',asset:'ring'}];
 drawRedesignPerson(ctx,'dieter',0,0,{artPose:'walk-2',direction:'se',visualEquipment:equipment},1,(_c,items,s)=>{
  assert.equal(s.legs,catalog.assets['dieter-heavywalk'].frames[2].base.joints);events.push(items.map(i=>i.slot));
 });
 assert.deepEqual(events.at(-1),['ring1']);const clothing=events.findIndex(e=>Array.isArray(e));
 assert.ok(events.slice(clothing+1,-1).includes('pixels'),'weapon and finger restoration happen between clothing and gloves');
});
test('partial catalogs and a failed native image never activate a mixed delivery',async()=>{
 assert.ok(validRedesignCatalog(catalog));const partial=structuredClone(catalog);delete partial.assets['kevin-heavy'];assert.equal(validRedesignCatalog(partial),false);
 const prior={Image:globalThis.Image,fetch:globalThis.fetch};try{
  globalThis.fetch=async()=>({ok:true,json:async()=>catalog});globalThis.Image=class{set src(v){queueMicrotask(()=>v.includes('anni-specials-base.png')?this.onerror():this.onload());}};
  const failed=await import('../redesign-art.js?failed-native');await failed.loadRedesignArt();assert.equal(failed.redesignArt.ready,false);
  let count=0;globalThis.Image=class{set src(v){count++;queueMicrotask(()=>this.onload());}};
  const good=await import('../redesign-art.js?complete-native');await good.loadRedesignArt();assert.equal(good.redesignArt.ready,true);assert.equal(count,16);assert.equal(good.redesignArt.details.size,0,'detail atlases are not decoded on game startup');
 }finally{globalThis.Image=prior.Image;globalThis.fetch=prior.fetch;}
});
test('real damage and dodge set bounded animation timers and respawn clears them',()=>{
 const world={spawn:{x:0,y:0},npc:{x:0,y:0},camps:[],landmarks:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y})},g=new Game(world);
 g.hitPlayer({damage:1,name:'Test'},20,false);assert.equal(redesignPose(g.player),'hit');g.tick(.05);assert.ok(g.player.hurt>0&&g.player.hurt<.16);
 g.action('dash');assert.equal(redesignPose(g.player),'dash');for(let i=0;i<8;i++)g.tick(.05);assert.equal(g.player.dash,0);assert.equal(g.player.hurt,0);
 g.hitPlayer({damage:1,name:'Test'},10000,false);assert.equal(redesignPose(g.player),'dead');g.respawn();assert.equal(redesignPose(g.player),'idle');
 const caster=new Game(world,{level:6});assert.ok(caster.action('buff'));assert.equal(redesignPose(caster.player),'cast');for(let i=0;i<7;i++)caster.tick(.05);assert.equal(caster.player.castPose,0);
});
test('active sources have exact prompts and provenance; garment runs exclude the head area',()=>{
 const generation=JSON.parse(read('assets/redesign/generation.json'));
 for(const a of Object.values(catalog.assets)){
  const provenance=generation.records.find(r=>r.source===a.source&&r.sha256===a.sourceHash);assert.ok(provenance);assert.equal(provenance.tool,'image_gen.imagegen');assert.ok(provenance.prompt.length>300);assert.ok(read(provenance.promptFile).length>300);
  for(const f of a.frames)for(const [y,x,w]of f.clothRuns){assert.ok(x>=f.bounds.x&&x+w<=f.bounds.x+f.bounds.w);const min=f.pose==='anticipation'?.44:f.pose==='rest'?.46:a.hero==='anni'?.36:.29;assert.ok(y>=f.bounds.y+f.bounds.h*min);assert.ok(y<=f.bounds.y+f.bounds.h*.66);}
 }
});
test('all new runtime files reproduce byte-for-byte from reviewed sources',()=>{
 for(const [p,bytes] of buildRedesign().files)assert.deepEqual(bytes,read(p),p);
});
test('production boot loads redesign and cache includes runtime without sources',()=>{
 assert.match(read('app.js').toString(),/(Promise\.all|boot\.track)\(\[[^\]]*loadRedesignArt\(\)/);assert.match(read('live-art.js').toString(),/drawDetailedHero/);
 const cache=read('scripts/pwa-cache.mjs').toString();assert.ok(cache.includes('assets/redesign/runtime/'));assert.ok(!cache.includes('assets/redesign/sources/'));
});
