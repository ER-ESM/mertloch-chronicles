import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {Game} from '../engine.js';
import {professionPlan,restoreProfessions,resourcePhase,actionSite,trainState} from '../profession-rules.js';
import {professionWorld} from '../profession-world.js';
import {mountProfessions,tickProfession,nodeStatus} from '../professions.js';
import {PROFESSION_RULES as R,PROFESSION_UI as T,PROFESSION_TRAINER as TR,PROFESSION_RECIPES as REC,PROFESSIONS as P,STORY_CHAPTERS} from '../content/index.js';
import {BAG_SIZE,ITEMS,countItem} from '../rpg.js';
import {createProfessionService} from '../server/game/professions.mjs';
import {decideSync} from '../online.js';
const world=()=>({id:'test-world',spawn:{x:0,y:0},npc:{x:1000,y:1000},landmarks:[],camps:[],quests:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b]});
const game=()=>new Game(world(),{level:3,tutorial:{completed:true},rpg:{inventory:[],coins:100}});
const save=(learned={})=>({...game().save(),professions:{learned},savedAt:1000});
const action=(kind,target)=>({kind,target});
test('professions: two per hero, level/tutorial gates, fee, forget, safe migration and gray recipes',()=>{
 let s=save();for(const id of ['scrap','smith']){const r=professionPlan(s,action('learn',id));assert.ok(!r.error);s={...s,...r};}assert.equal(s.rpg.coins,80);assert.equal(professionPlan(s,action('learn','brew')).error,T.slots);assert.equal(professionPlan({...s,level:2},action('forget','scrap')).error,T.level);assert.equal(professionPlan({...s,tutorial:{completed:false}},action('forget','scrap')).error,T.level);
 s={...s,...professionPlan(s,action('forget','scrap'))};assert.equal(s.professions.learned.scrap,undefined);assert.equal(professionPlan(s,action('learn','herbs')).professions.learned.herbs,1);assert.deepEqual(restoreProfessions(null).learned,{});assert.equal(restoreProfessions({revision:Infinity}).revision,0);
 s=save({smith:20});s.rpg.inventory=[{id:'dosenblech',count:4},{id:'kabel',count:1}];const r=professionPlan(s,action('craft','blechklinge'));assert.equal(r.professions.learned.smith,20);assert.equal(countItem(r.rpg,'dosenklinge'),1);assert.equal(s.rpg.inventory.length,2);
});
test('crafting is atomic, unlocked by skill and protects quest reserves; all recipes reach their outputs',()=>{
 for(const [id,r]of Object.entries(REC)){const s=save({[r.profession]:r.required});s.rpg.inventory=Object.entries(r.materials).map(([id,count])=>({id,count}));const next=professionPlan(s,action('craft',id));assert.ok(!next.error,id);assert.equal(countItem(next.rpg,r.output),r.count);assert.equal(next.professions.learned[r.profession],r.required+1);assert.equal(next.rpg.coins,98);assert.ok(professionPlan({...s,professions:{learned:{[r.profession]:r.required-1}}},action('craft',id)).error||r.required===1);}
 const s=save({smith:1});s.rpg.inventory=[{id:'dosenblech',count:99},{id:'kabel',count:99},...Array.from({length:BAG_SIZE-2},()=>({id:'flasche',count:1}))];const before=structuredClone(s);assert.equal(professionPlan(s,action('craft','blechklinge')).error,T.full);assert.deepEqual(s,before);
 const chapter=STORY_CHAPTERS.find(c=>c.objectives.some(o=>o.kind==='gather'&&o.item==='dosenblech'));if(chapter){s.rpg.inventory=[{id:'dosenblech',count:4},{id:'kabel',count:1}];s.quest={chapter:chapter.id,chapterClaimed:chapter.id-1,accepted:true};assert.equal(professionPlan(s,action('craft','blechklinge')).error,T.missing);}
});
test('gathering cannot partially fill a full bag; deterministic nodes do not share personal receipts',async()=>{
 const s=save({scrap:1});s.rpg.inventory=[{id:'dosenblech',count:98},...Array.from({length:BAG_SIZE-1},()=>({id:'flasche',count:1}))];const before=structuredClone(s);assert.equal(professionPlan(s,action('gather','scrap')).error,T.full);assert.deepEqual(s,before);
 const a=game(),b=game();assert.deepEqual(professionWorld(a.world),professionWorld(b.world));assert.equal(professionWorld(a.world).nodes.length,16);
 a.professions.learned.scrap=1;const node=professionWorld(a.world).nodes.find(n=>n.kind==='scrap');Object.assign(a.player,node);let written;const ui=mountProfessions({game:()=>a,online:()=>null,write:s=>written=s,lock(){}});assert.ok(await ui.start({kind:'gather',node:node.id}));a.keys.add('w');tickProfession(a,1);assert.equal(a.professionCast,null);assert.equal(written,undefined);a.keys.clear();assert.ok(await ui.start({kind:'gather',node:node.id}));tickProfession(a,2);assert.equal(countItem(a.rpg,'dosenblech'),2);assert.equal(nodeStatus(a,node).spent,true);assert.equal(nodeStatus(b,node).spent,false);const restored=new Game(a.world,written);assert.equal(nodeStatus(restored,node).spent,true);
});
function serviceFixture(t){const dir=mkdtempSync(join(tmpdir(),'mertloch-prof-test-')),saves=new Map(),clients=new Map(),layout={stations:[{id:'werkhof',x:0,y:0},{id:'braugarten',x:0,y:0}],nodes:[{id:'node',kind:'scrap',x:0,y:0}],teachers:['scrap','smith','herbs','brew'].map(id=>({id,x:0,y:0,type:'professionTeacher'})),lineClear:()=>true};let time=100000;
 const store={readSave:(id,w)=>structuredClone(saves.get(id+'|'+w)),writeSave:(id,w,s,savedAt)=>{saves.set(id+'|'+w,{save:structuredClone(s),savedAt});return {savedAt};}};
 for(const id of ['a','b']){store.writeSave(id,'@helden',{roster:{list:[{id:'hero-'+id,name:'Held '+id,classId:'dieter'}]}},time);store.writeSave(id,'test-world#hero-'+id,save({scrap:1,smith:1}),time);clients.set(id,{id,hero:'hero-'+id,name:'Held '+id,world:'test-world',placed:true,x:0,y:0,s:'idle',h:100});}
 let service;const restart=()=>service=createProfessionService({store,dataDir:dir,clients:()=>clients,now:()=>time,layoutFor:()=>layout});restart();t.after(()=>{assert.ok(resolve(dir).startsWith(resolve(tmpdir())+sep)&&dir.includes('mertloch-prof-test-'));rmSync(dir,{recursive:true,force:true});});
 return {dir,store,clients,restart,get service(){return service;},advance:n=>time+=n,body:(id,extra={})=>({hero:'hero-'+id,room:'test-world',id:'operation-'+id+'-first',save:store.readSave(id,'test-world#hero-'+id).save,...extra}),call:(id,b)=>service.request(id,b)};
}
test('online shared window gives each hero one harvest, duplicate finish is idempotent, restart recovers reward and rejects stale future saves',t=>{
 const f=serviceFixture(t),b=f.body('a',{op:'begin',action:{kind:'gather',node:'node'}}),begin=f.call('a',b);assert.ok(begin.token);assert.equal(f.call('a',{...b,op:'finish',token:begin.token}).error,T.early);f.advance(2100);const finish={...b,op:'finish',token:begin.token},one=f.call('a',finish);assert.equal(countItem(one.save.rpg,'dosenblech'),2);assert.equal(f.call('a',finish).replayed,true);
 const bb=f.body('b',{op:'begin',action:{kind:'gather',node:'node'}}),b2=f.call('b',bb);f.advance(2100);assert.equal(countItem(f.call('b',{...bb,op:'finish',token:b2.token}).save.rpg,'dosenblech'),2);
 assert.equal(f.call('a',f.body('a',{op:'begin',id:'operation-a-second',action:b.action})).error,T.harvested);
 // Simulate crash after the durable journal rename but before writing the cloud afterimage.
 f.store.writeSave('a','test-world#hero-a',{...b.save,savedAt:9e12},9e12);f.restart();const recovered=f.service.canonical('a','test-world#hero-a');assert.equal(countItem(recovered.save.rpg,'dosenblech'),2);assert.equal(f.service.guard('a','test-world#hero-a',{...b.save,savedAt:1e13}).stale,true);assert.equal(decideSync({...b.save,savedAt:1e13},recovered),'pull');assert.equal(f.call('a',finish).replayed,true);
 f.advance(R.windowMs+R.regrowMs);assert.ok(f.call('a',f.body('a',{op:'begin',id:'operation-a-third',action:b.action})).token);
});
test('server enforces hero ownership, range, movement, combat and full-bag cancellation without spending harvest',t=>{
 const f=serviceFixture(t),base={op:'begin',action:{kind:'gather',node:'node'}};assert.equal(f.call('a',f.body('a',{...base,hero:'hero-b'})).error,T.identity);f.clients.get('a').x=100;assert.equal(f.call('a',f.body('a',base)).error,T.range);f.clients.get('a').x=0;
 let b=f.body('a',base),r=f.call('a',b);f.clients.get('a').s='walk';f.service.observe(f.clients.get('a'));f.clients.get('a').s='idle';f.advance(2100);assert.equal(f.call('a',{...b,op:'finish',token:r.token}).error,T.expired);
 b=f.body('a',{...base,id:'operation-full-test'});r=f.call('a',b);f.advance(2100);b.save.rpg.inventory=Array.from({length:BAG_SIZE},()=>({id:'flasche',count:1}));assert.equal(f.call('a',{...b,op:'finish',token:r.token}).error,T.full);assert.equal(f.call('a',f.body('a',{op:'state'})).nodes.node.spent,false);
});
test('resource cycles close and regrow, gray gathering stops at its threshold',()=>{const now=100000;assert.equal(resourcePhase({},now).phase,'ready');assert.equal(resourcePhase({cycle:1,opened:now},now+R.windowMs).phase,'empty');assert.equal(resourcePhase({cycle:1,opened:now},now+R.windowMs+R.regrowMs).cycle,2);assert.equal(professionPlan(save({scrap:35}),action('gather','scrap')).professions.learned.scrap,35);});

test('online ambiguous finish and browser storage failure keep UI locked; retry uses the same transaction and applies once',async()=>{
 const g=game(),site=professionWorld(g.world).stations.find(s=>s.id==='werkhof');Object.assign(g.player,site);let response,failNetwork=true,failStorage=true,finishes=[],locks=[];
 const online={account:{id:'a'},state:{connected:true},profession:async b=>{if(b.op==='begin')return {token:'token'};finishes.push(b);if(!response){const plan=professionPlan(b.save,{kind:'learn',target:'scrap'});response={save:{...b.save,...plan}};}if(failNetwork){failNetwork=false;throw Error('lost response');}return response;}};
 const ui=mountProfessions({game:()=>g,online:()=>online,write:()=>{if(failStorage)throw Error('quota');},lock:(on,text,retry)=>locks.push({on,text,retry})});await ui.start({kind:'learn',target:'scrap'});await new Promise(r=>setImmediate(r));assert.equal(g.professionCommit,true);assert.equal(g.professions.learned.scrap,undefined);await ui.retry();assert.equal(g.professionCommit,true);failStorage=false;await ui.retry();assert.equal(g.professionCommit,false);assert.equal(g.professions.learned.scrap,1);assert.equal(g.rpg.coins,90);assert.equal(new Set(finishes.map(b=>b.id)).size,1);assert.equal(locks.at(-1).on,false);
});
test('online-linked heroes cannot gather while disconnected or logged out; combat, mount and private room gates cancel work',async()=>{
 for(const account of [null,{id:'a'}]){const g=game(),n=professionWorld(g.world).nodes[0];Object.assign(g.player,n);g.professions.online=true;g.professions.learned.scrap=1;const before=g.save();const ui=mountProfessions({game:()=>g,online:()=>({account,state:{connected:false}}),write(){throw Error('unexpected write');},lock(){}});assert.equal(await ui.start({kind:'gather',node:n.id}),false);assert.deepEqual(g.save(),before);}
 for(const mutate of [g=>g.player.inCombat=1,g=>g.dead=true,g=>g.instance={},g=>g.casting={}]){const g=game(),n=professionWorld(g.world).nodes[0];Object.assign(g.player,n);g.professions.learned.scrap=1;const ui=mountProfessions({game:()=>g,online:()=>null,write(){throw Error('unexpected write');},lock(){}});await ui.start({kind:'gather',node:n.id});mutate(g);tickProfession(g,2);assert.equal(g.professionCast,null);assert.equal(countItem(g.rpg,'dosenblech'),0);}
});

test('default world and explicit default options have identical rules for shared profession positions',async()=>{const {resolveRules}=await import('../world-rules.js');assert.deepEqual(resolveRules({seed:56753,roadWidth:72,density:1}),resolveRules());});

// Lehrer und gelernte Rezepte (Nutzerauftrag 2026-09-23): Rezepte gibt es nur beim Lehrer, ab ihrer Fertigkeitsstufe.
test('teachers: learning a profession brings its starter recipe; further recipes are bought at the teacher once the skill suffices',()=>{
 let s=save();s={...s,...professionPlan(s,action('learn','smith'))};assert.deepEqual(s.professions.recipes,['blechklinge']);assert.equal(s.rpg.coins,100-R.learnCost);
 assert.equal(professionPlan(s,action('craft','blechbrecher')).error,T.required);assert.equal(professionPlan(s,action('train','blechbrecher')).error,TR.errSkill);assert.equal(professionPlan(s,action('train','blechklinge')).error,TR.errKnown);assert.equal(professionPlan(s,action('train','kraeutersud')).error,TR.errProfession);
 s.professions.learned.smith=15;const r=professionPlan(s,action('train','blechbrecher'));assert.ok(!r.error,r.error);assert.equal(r.rpg.coins,s.rpg.coins-REC.blechbrecher.cost);assert.ok(r.professions.recipes.includes('blechbrecher'));assert.equal(r.professions.revision,s.professions.revision+1);
 assert.equal(professionPlan({...s,rpg:{...s.rpg,coins:REC.blechbrecher.cost-1}},action('train','blechbrecher')).error,T.money);
 const next={...s,...r};next.rpg.inventory=[{id:'dosenblech',count:8},{id:'kabel',count:3}];assert.ok(!professionPlan(next,action('craft','blechbrecher')).error);
 const forgot={...next,...professionPlan(next,action('forget','smith'))};assert.deepEqual(forgot.professions.recipes,[]);const again=professionPlan(forgot,action('learn','smith'));assert.deepEqual(again.professions.recipes,['blechklinge']);assert.equal(again.professions.learned.smith,1);
});
test('teachers: old saves keep every recipe their skill already allowed; unknown or foreign recipes are dropped',()=>{
 const old=restoreProfessions({learned:{smith:20,brew:1}});assert.deepEqual(old.recipes.sort(),['blechbrecher','blechklinge','kraeutersud']);assert.equal(old.version,2);
 const fresh=restoreProfessions({learned:{smith:40},recipes:['blechklinge','panzerweste','kraeutersud','gibtsnicht','blechklinge']});assert.deepEqual(fresh.recipes,['blechklinge','panzerweste']);
 assert.equal(trainState(restoreProfessions({learned:{smith:40},recipes:['blechklinge']}),'panzerweste'),'');
});
test('teachers: each profession has its own teacher at its station; learning happens at the teacher, crafting at the station, forgetting anywhere',async()=>{
 const g=game(),l=professionWorld(g.world);assert.equal(l.teachers.length,Object.keys(P).length);for(const t of l.teachers){const s=l.stations.find(s=>s.id===P[t.id].station);assert.ok(s,t.id);assert.equal(t.x,s.x+P[t.id].spot.x);}
 assert.equal(actionSite(l,action('learn','herbs')),l.teachers.find(t=>t.id==='herbs'));assert.equal(actionSite(l,action('train','feldtee')),l.teachers.find(t=>t.id==='brew'));assert.equal(actionSite(l,action('craft','feldtee')).id,'braugarten');assert.deepEqual(actionSite(l,action('forget','brew')),{anywhere:true});
 const {professionReason,professionTarget}=await import('../professions.js');const t=l.teachers.find(t=>t.id==='smith');g.player.x=t.x;g.player.y=t.y;assert.equal(professionTarget(g).id,'smith');assert.equal(professionTarget(g).type,'professionTeacher');g.player.x=t.x+500;assert.equal(professionReason(g,{anywhere:true}),'');assert.equal(professionReason(g,t),T.range);
});
test('teachers: the server teaches recipes only near the teacher and lets heroes forget a profession anywhere, even mounted',t=>{
 const f=serviceFixture(t),a=f.clients.get('a');a.x=100;assert.equal(f.call('a',f.body('a',{op:'begin',action:{kind:'train',target:'blechklinge'}})).error,T.range);a.x=0;
 assert.equal(f.call('a',f.body('a',{op:'begin',action:{kind:'train',target:'blechklinge'}})).error,TR.errKnown);
 a.x=500;a.mt='hofpferd';const b=f.body('a',{op:'begin',id:'operation-forget-1',action:{kind:'forget',target:'scrap'}}),r=f.call('a',b);assert.ok(r.token,r.error);const done=f.call('a',{...b,op:'finish',token:r.token});assert.ok(!done.error,done.error);assert.equal(done.save.professions.learned.scrap,undefined);assert.ok(done.save.professions.learned.smith);
});
