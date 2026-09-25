import test from 'node:test';import assert from 'node:assert/strict';
import {mechanic} from '../spec-mechanics.js';import {Game} from '../engine.js';import {TUTORIAL,PERSON_APPEARANCE,CLASS_SPECS} from '../content/index.js';
import {tutorialActive,tutorialConfirm,tutorialSignal,tickTutorial} from '../tutorial.js';
import {TALENTS,TIER_POINTS,talentById,learnTalent,unlearnTalent,talentState,pathBuild,changeSpec,resetTalents,talentPoints,pointsInTree,talentPrerequisites,mainTreeOnly} from '../talents.js';import {talentIconCell} from '../talent-art.js';import {takeLoot} from '../rpg.js';import {conversationHeader} from '../dialogue-ui.js';
const world=()=>({id:'hof',spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}],findClear:(x,y)=>({x,y})});
const nextTick=g=>tickTutorial(g,.05);
// P8: Der Tick, in dem ein Schritt beginnt, ist gesperrt – erst der folgende darf ihn abschließen.
const settle=g=>{tickTutorial(g,.05);tickTutorial(g,.05);};
test('Fresh guided start is linear, bounds movement and refuses quests until the hofprobe is finished',()=>{
 const g=new Game(world(),{},{guidedStart:true});assert.ok(tutorialActive(g));assert.equal(g.acceptQuest(),false);assert.equal(tutorialConfirm(g),true);assert.equal(g.tutorial.step,1);
 g.navigate({x:2000,y:2000});assert.equal(g.moveTo,null);Object.assign(g.player,{x:2000,y:2000});nextTick(g);assert.equal(g.player.x,500);
 Object.assign(g.player,g.tutorial.course);settle(g);assert.equal(g.tutorial.step,2);const e=g.enemies.find(e=>e.tutorial);g.target=e;settle(g);assert.equal(g.tutorial.step,3);
 assert.equal(g.tutorial.hits,0);assert.equal(g.tutorial.autos,0);
 for(let i=0;i<2;i++){g.damage(e,99999,'Kelle');g.damage(e,99999,'Autoangriff');}assert.ok(e.hp>0);settle(g);assert.equal(g.tutorial.step,4);assert.equal(g.stats.kills,0);
 g.tutorial.clock=0;nextTick(g);nextTick(g);assert.ok(e.cast);tutorialSignal(g,'dash');g.player.x=e.cast.x+100;e.cast.remaining=.01;nextTick(g);assert.equal(g.tutorial.step,5);assert.ok(g.rpg.loot.some(b=>b.id===TUTORIAL.loot.id));
 Object.assign(g.player,g.tutorial.dummy);assert.ok(takeLoot(g,TUTORIAL.loot.id));settle(g);assert.equal(g.tutorial.step,6);assert.equal(tutorialConfirm(g),false);tutorialSignal(g,'inventory');assert.equal(g.tutorial.step,7);Object.assign(g.player,g.world.npc);assert.ok(tutorialConfirm(g));assert.equal(tutorialActive(g),false);assert.equal(g.quest.accepted,false);assert.equal(g.acceptQuest(),true);assert.equal(g.quest.accepted,true);assert.equal(g.player.xp,TUTORIAL.rewardXp);assert.equal(tutorialConfirm(g),false);
});
test('Tutorial refuses out-of-order actions and lets failed dodges be retried without damage',()=>{
 const g=new Game(world(),{},{guidedStart:true});tutorialSignal(g,'inventory');assert.equal(g.tutorial.step,0);g.tutorial.step=4;const saved=g.save(),loaded=new Game(world(),saved),e=loaded.enemies.find(e=>e.tutorial);loaded.tutorial.clock=0;const hp=loaded.player.hp;nextTick(loaded);e.cast.remaining=.01;nextTick(loaded);assert.equal(loaded.tutorial.step,4);assert.equal(loaded.player.hp,hp);
});
test('Legacy saves bypass tutorial, fresh progress resumes and claimed tutorial loot cannot duplicate',()=>{
 assert.equal(tutorialActive(new Game(world(),{version:1,worldKey:'hof'},{guidedStart:true})),false);
 const g=new Game(world(),{},{guidedStart:true});tutorialConfirm(g);const next=new Game(world(),JSON.parse(JSON.stringify(g.save())));assert.equal(next.tutorial.step,1);assert.ok(tutorialActive(next));
 g.tutorial.step=5;g.tutorial.bagSpawned=true;const claimed=new Game(world(),g.save());assert.equal(claimed.rpg.loot.length,0);nextTick(claimed);assert.equal(claimed.tutorial.step,6);
});
test('Talent graphs: stable art IDs, five sparse tiers, open rows and saved builds',()=>{
 for(const [spec,tree] of Object.entries(TALENTS)){assert.equal(tree.length,30,spec);const cells=new Set(tree.map(t=>t.row+'/'+t.path));assert.equal(cells.size,30,spec+': jede Zelle genau einmal');for(const t of tree){assert.ok(t.row>=0&&t.row<10&&t.path>=0&&t.path<3,t.id);assert.equal(t.spent,t.tier*TIER_POINTS);assert.ok(talentIconCell(t.id),t.id+' Icon-Zelle');}}
 assert.ok(Object.keys(CLASS_SPECS).length>=3);/* E-71: fünf Klassen, sobald Schorsch und Käthe ihre Bäume haben */
 const g=new Game(world(),{level:11,rpg:{talents:{spec:'dieter-wall',learned:[]}}}),tree=TALENTS['dieter-wall'],at=(tier,path)=>tree.find(t=>t.tier===tier&&t.path===path).id;
 assert.ok(learnTalent(g,at(0,0)));assert.equal(learnTalent(g,at(1,0)),false,'Reihe 2 verlangt zwei Punkte in DIESEM Baum');
 assert.ok(learnTalent(g,'dieter-brew-0'),'Nachbarbaum ist offen');assert.equal(learnTalent(g,at(1,0)),false,'Punkte im Nachbarbaum öffnen dieses Stufen-Tor nicht');
 assert.ok(learnTalent(g,at(0,1)),'mehrere Talente je Reihe sind erlaubt');assert.ok(learnTalent(g,at(1,1)));assert.equal(unlearnTalent(g,at(0,0)),false,'Punkt, auf dem ein Stufen-Tor ruht, bleibt');assert.ok(unlearnTalent(g,at(1,1)));assert.ok(unlearnTalent(g,'dieter-brew-0'));
 for(const spec of Object.keys(TALENTS))for(const p of [0,1,2]){const build=pathBuild(spec,p,10);assert.equal(build.length,10,spec+' Pfadbau');assert.equal(build.filter(id=>talentById(id).path===p).length,10,spec+' reiner Pfad');assert.equal(talentState({spec,learned:build.toReversed()},spec.split('-')[0]).learned.length,10,spec+' Speicherprüfung');}
 // quer geskillt: 6 + 3 + 1 über drei Bäume, Pfadboni zählen je Baum; ein Altstand (ein Talent je Reihe) bleibt gültig
 const cross=[...pathBuild('dieter-wall',0,6),...pathBuild('dieter-brawl',1,3),...pathBuild('dieter-brew',2,1)],st=talentState({spec:'dieter-brawl',learned:cross},'dieter');assert.equal(st.learned.length,10);assert.equal(st.spec,'dieter-brawl');
 assert.equal(talentState({spec:'dieter-wall',learned:['kevin-fuse-0','dieter-wall-0']},'dieter').learned.length,1,'fremde Klasse fliegt raus');
});
test('Conversation portraits use the shared world identity map for every known NPC',()=>{for(const id of Object.keys(PERSON_APPEARANCE).filter(id=>!['dieter','baerbel','kevin'].includes(id))){const html=conversationHeader(id,id);assert.ok(html.includes('data-person-art="'+id+'"'));assert.ok(!html.includes('dialogue-atlas.png'));}});
test('Tutorial practice chooses accessible plaza space clear of tree canopies and NPCs',async()=>{
 const {World}=await import('../world.js'),{readFileSync}=await import('node:fs');const data=JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url)));
 for(const seed of [1,56753]){const w=new World(data,{seed}),g=new Game(w,{},{guidedStart:true});for(const p of [g.tutorial.course,g.tutorial.dummy]){/* seit E-52 findet die Hofprobe in der Bude statt (Schankraum und Hof), sonst auf dem Kirchvorplatz */const b=w.base,inBude=!!b&&p.x>b.minX&&p.x<b.maxX&&p.y>b.minY&&p.y<b.maxY;assert.ok(w.findPath(w.start||w.spawn,p).length);assert.ok(inBude||Math.hypot(p.x-w.plaza.x,p.y-w.plaza.y)<w.plaza.radius);assert.ok(!w.trees.some(t=>Math.abs(p.x-t.x)<60*t.size&&p.y<t.y+15&&p.y>t.y-125*t.size));assert.ok(Math.hypot(p.x-w.npc.x,p.y-w.npc.y)>=38);}assert.ok(Math.hypot(g.tutorial.course.x-g.tutorial.dummy.x,g.tutorial.course.y-g.tutorial.dummy.y)>30);}
});

test('Offene Bäume (E-37): neuer Held ohne Hauptbaum, gesparte Punkte, erste Wahl überall, Wechsel lässt Punkte stehen, Pfeile gelten',()=>{
 const g=new Game(world());assert.equal(g.rpg.talents.spec,null);assert.equal(mechanic(g),null,'Stufe 1 bis 4: nur der Klassenkern');
 g.gainXp(400);assert.ok(talentPoints(g)>=1&&g.player.level<5);assert.equal(learnTalent(g,'dieter-wall-0'),false,'vor Stufe 5 wird gespart');assert.equal(changeSpec(g,'dieter-wall'),false);
 g.gainXp(20000);g.player.x=g.world.spawn.x+5000;g.player.inCombat=0;assert.ok(changeSpec(g,'dieter-brawl'),'erste Wahl fern vom Treff');assert.ok(mechanic(g));
 assert.ok(learnTalent(g,'dieter-wall-0'));assert.ok(learnTalent(g,'dieter-brawl-0'));assert.equal(changeSpec(g,'dieter-wall'),false,'Wechsel nur am Clan-Treff');
 g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;assert.ok(changeSpec(g,'dieter-wall'));assert.equal(g.rpg.talents.learned.length,2,'Punkte bleiben');
 const loaded=new Game(world(),g.save());assert.deepEqual(loaded.rpg.talents,g.rpg.talents);
 assert.equal(pointsInTree(g.rpg.talents.learned,'dieter-brawl'),1);assert.ok(resetTalents(g));assert.equal(g.rpg.talents.learned.length,0);
 // Pfeil: ein Talent mit parents verlangt seinen Vorgänger, auch wenn das Stufen-Tor offen ist
 const tree=TALENTS['dieter-wall'],child=tree.find(t=>t.row===1),parent=tree.find(t=>t.row===0&&t.id!==child.id),old=child.parents;child.parents=[parent.id];
 try{const other=tree.find(t=>t.row===0&&t.id!==parent.id);assert.equal(talentPrerequisites(child,[other.id]),false);assert.equal(talentPrerequisites(child,[parent.id]),true);}finally{child.parents=old;}
 assert.ok(Object.values(TALENTS).flat().filter(mainTreeOnly).length<=90,'höchstens ein Drittel hängt am Hauptbaum');
});
