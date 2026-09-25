import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {SPEC_MECHANICS} from '../content/index.js';
import {Game} from '../engine.js';
import {classHudState} from '../class-hud.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const cat=JSON.parse(read('assets/class-mechanics/runtime/catalog.json'));
test('every specialization has a transparent emblem and two distinct resource states within its atlas',()=>{
 const images=Object.fromEntries(Object.entries(cat.atlases).map(([path,size])=>{
  const im=decodePng(read(path));assert.equal(im.width,size.width);assert.equal(im.height,size.height);
  let transparent=0;for(let i=3;i<im.data.length;i+=4)if(im.data[i]===0)transparent++;
  assert.ok(transparent>im.width*im.height*.3,path+' genuine transparent background');return[path,im];
 }));
 for(const spec of Object.keys(SPEC_MECHANICS).filter(s=>['dieter','baerbel','kevin'].includes(s.split('-')[0]))){/* E-71: Embleme der neuen Klassen folgen mit der Grafiklieferung */
  for(const variant of ['emblem','empty','full']){
   const a=cat.sprites[spec+'/'+variant];assert.ok(a,spec+'/'+variant);const im=images[a.atlas];
   assert.ok(a.x>=0&&a.y>=0&&a.w>0&&a.h>0&&a.x+a.w<=im.width&&a.y+a.h<=im.height);
  }
  assert.notDeepEqual(cat.sprites[spec+'/empty'],cat.sprites[spec+'/full']);
 }
});
const world={id:'hud',spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b],findClear:(x,y)=>({x,y})};
const game=spec=>new Game(world,{classId:spec.split('-')[0],level:30,rpg:{talents:{spec,learned:[]}}});
test('HUD reads all nine resources without advancing gameplay or inventing a robot capacity',()=>{
 for(const spec of Object.keys(SPEC_MECHANICS)){
  const g=game(spec),before=JSON.stringify([g.classState,g.fields,g.player.energy]),s=classHudState(g);
  assert.equal(s.spec,spec);assert.ok(Number.isFinite(s.max)&&s.max>0,spec);
  assert.equal(JSON.stringify([g.classState,g.fields,g.player.energy]),before);
 }
 assert.equal(classHudState(game('kevin-iron')).max,1);
});
test('Schimmel counts only living marked enemies and field sprites exclude expired objects',()=>{
 const g=game('baerbel-feedback');g.enemies=[{hp:1,mark:5},{hp:0,mark:5},{hp:1,mark:0}];assert.equal(classHudState(g).count,1);
 const k=game('kevin-iron');k.fields=[{kind:'robbi',remaining:4},{kind:'robbi',remaining:0},{kind:'fass',remaining:6}];assert.equal(classHudState(k).fields.length,1);
});
