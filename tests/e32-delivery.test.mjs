import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TALENT_ROWS,TALENT_CELLS,CLASS_SPECS} from '../content/talents.js';
import {buildTalentArt,talentSheetPath} from '../tools/class-visuals/build-talents.mjs';
import {buildLocomotion} from '../tools/class-visuals/build-locomotion.mjs';
import {E32_SKILL_MOTIFS} from '../e32-art.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {Game} from '../engine.js';
import {changeSpec} from '../talents.js';
import {onGroundMech,burstMultiplier,onParryMech} from '../spec-mechanics.js';
import {combatStats} from '../rpg.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url)),json=p=>JSON.parse(read(p));
// E-32: 270 Talente der drei alten Klassen. E-72: Schorsch und Käthe kommen hinzu, sobald ihr Raster gemalt ist (npm run e72:bilder).
test('immutable talent IDs map to their own reproducible authored cells (270 + gemalte neue Klassen)',()=>{
 const {files,catalog}=buildTalentArt();for(const [p,b]of files)assert.deepEqual(b,read(p),p);
 const painted=Object.keys(TALENT_ROWS).filter(s=>existsSync(new URL('../'+talentSheetPath(s),import.meta.url)));
 for(const m of ['dieter','baerbel','kevin'])for(const s of CLASS_SPECS[m])assert.ok(painted.includes(s),'E-32-Raster fehlt: '+s);
 assert.equal(Object.keys(catalog.talents).length,painted.length*30);assert.equal(new Set(Object.values(catalog.talents).map(t=>t.sha256)).size,painted.length*30);
 for(const [spec,list]of Object.entries(TALENT_ROWS).filter(([s])=>painted.includes(s)))for(const [i,t]of list.entries()){const a=catalog.talents[spec+'-'+i];assert.equal(a.name,t.name);assert.equal(a.effect,t.info.effect);assert.equal(a.row,TALENT_CELLS[spec][i].row);assert.equal(a.path,TALENT_CELLS[spec][i].path);}
 for(const m of Object.values(E32_SKILL_MOTIFS))for(const id of Object.values(m))assert.ok(id.startsWith('signature:')||catalog.talents[id],id);assert.equal(Object.keys(catalog.skills).length,45);
});
test('all generated E32 sources retain exact prompts and verified originals',()=>{for(const j of json('assets/content-art/e32/generation.json').jobs){assert.ok(j.original&&j.prompt);assert.equal(createHash('sha256').update(read(j.source)).digest('hex'),j.sha256);}});
test('35 human characters alternate the leading foot and support side in all directions',()=>{
 const heroes=json('assets/redesign/runtime/catalog.json'),people=json('assets/content-art/locomotion/runtime/catalog.json');assert.equal(Object.keys(people.assets).length,32);
 for(const a of [...Object.values(heroes.assets).filter(a=>a.state==='walk'||a.state==='heavywalk'),...Object.values(people.assets)]){
  for(let row=0;row<4;row++){
   const f=a.frames[row*8],opposite=a.frames[row*8+4];assert.notDeepEqual(f.legOrder,opposite.legOrder);
   assert.ok(f.joints.every(j=>j.support),'contact transfers weight with both feet grounded');assert.ok(opposite.joints.every(j=>j.support));
   assert.equal(a.frames[row*8+2].joints[1].support,false);assert.equal(a.frames[row*8+6].joints[0].support,false);
   assert.ok((f.joints[0].groundY-f.joints[1].groundY)*(opposite.joints[0].groundY-opposite.joints[1].groundY)<0);
   for(const frame of a.frames.slice(row*8,row*8+8))for(const j of frame.joints)if(j.support)assert.equal(j.footAngle,0,'support sole stays flat');
  }
 }
});
test('NPC and human enemy walking export rebuilds exactly and does not replace animal rigs',()=>{const {files,catalog}=buildLocomotion();for(const [p,b]of files)assert.deepEqual(b,read(p),p);for(const id of ['goose','boar','fox','cat','badger','gisela','automat'])assert.ok(!catalog.assets[id+'-walk']);});
test('new effect sequences have five distinct hard-alpha frames with clear margins',()=>{const a=json('assets/content-art/e32/runtime/effects.json'),im=decodePng(read(a.path));for(const e of Object.values(a.effects)){assert.equal(e.frames.length,5);assert.equal(new Set(e.frames.map(f=>f.sha256)).size,5);for(const {bounds:b}of e.frames)assert.ok(b.x>=2&&b.y>=2&&b.x+b.w<=126&&b.y+b.h<=126);}for(let i=3;i<im.data.length;i+=4)assert.ok(im.data[i]===0||im.data[i]===255);});
const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:0},camps:[],landmarks:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]});
test('empty and expired fields never claim a successful tap; live fields emit their own spent sprite',()=>{
 const g=new Game(arena(),{classId:'dieter',level:30});changeSpec(g,'dieter-brew');const cs=combatStats(g);
 burstMultiplier(g,{x:10,y:0},cs);assert.ok(!g.fx.some(f=>f.type==='classFx'));
 onGroundMech(g,g.skills.find(s=>s.id==='ground'),{x:20,y:10},cs);const z=g.fields[0];assert.equal(z.visualDuration,z.remaining);
 burstMultiplier(g,{x:10,y:0},cs);const f=g.fx.find(f=>f.kind==='foam-fountain');assert.equal(f.object,'fass');assert.equal(f.sort,z.sort);assert.equal(f.x,z.x);assert.equal(g.fields.length,0);
 g.fx=[];burstMultiplier(g,{x:10,y:0},cs);assert.ok(!g.fx.some(f=>f.type==='classFx'));
});
test('Prost sprite requires the actual parry answer during an enemy cast',()=>{
 const g=new Game(arena(),{classId:'baerbel',level:30});changeSpec(g,'baerbel-stage');const cs=combatStats(g);onParryMech(g,{},cs);assert.ok(!g.fx.some(f=>f.kind==='prost'));onParryMech(g,{cast:{remaining:1}},cs);assert.equal(g.fx.filter(f=>f.kind==='prost').length,1);
});
