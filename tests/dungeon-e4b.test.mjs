// Dungeon Etappe 4 Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71, docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Browserprüfung: scripts/dungeon-e4b-check.mjs. Zeiten je Flügel: node scripts/dungeon-sim.mjs --only=wings.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_E4B} from '../content/index.js';
import {toWorld,quietFloat} from '../dungeon.js';
import {dungeonFight,dungeonBossFight,BOSS_FIGHT_BARKS} from '../dungeon-clarity.js';
import {BossSpeech} from '../enemy-ui.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],DAY=Date.UTC(2026,8,25,12);
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb');

test('Kampf-Klarheit: Kampf im Dungeon und Bosskampf werden erkannt',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);assert.equal(dungeonFight(g),false);assert.equal(dungeonBossFight(g),false);
 const b=bigbOf(g);b.aggro=true;b.ai='combat';assert.equal(dungeonFight(g),true);assert.equal(dungeonBossFight(g),true);
 at(g,'e0',31,34);assert.equal(dungeonFight(g),false,'weit weg zählt nicht als eigener Kampf');assert.equal(dungeonBossFight(g),true);
});

test('Kampf-Klarheit: im Bosskampf sprechen in der Welt nur Boss und Mitspieler; Söldner, Trash, Lautsprecher stehen im Chat',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);for(const id of ['merc-pils-peter','merc-radler-rita'])g.hireCompanion(id,{free:true});
 const b=bigbOf(g),sp=new BossSpeech(),merc=g.companions[0];sp.update(g);
 sp.bark({enemyId:merc.id,name:merc.name,text:'Endlich Bewegung.',kind:'companion',x:merc.x,y:merc.y},g);
 sp.bark({enemyId:b.id,name:b.name,text:'Ich reite nach LINKS!',kind:'boss',x:b.x,y:b.y},g);
 assert.equal(sp.activeBarks(g).length,2,'ohne Kampf beide');
 b.aggro=true;b.ai='combat';const shown=sp.activeBarks(g);assert.deepEqual(shown.map(x=>x.kind),['boss'],'im Bosskampf nur der Boss');
 assert.ok(BOSS_FIGHT_BARKS.has('player')&&!BOSS_FIGHT_BARKS.has('companion'));
});

test('Kampf-Klarheit: Welt-Worte, die der Bossrahmen zeigt, entstehen im Bosskampf nicht; eigene Schwäche am Helden bleibt',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);g.hireCompanion('merc-pils-peter',{free:true});const b=bigbOf(g),merc=g.companions[0];Object.assign(merc,{x:b.x+30,y:b.y+10});
 g.texts.length=0;g.float(b.x,b.y-60,'GESTÄNDNIS');assert.equal(g.texts.length,1,'ohne Kampf erlaubt');
 b.aggro=true;b.ai='combat';g.texts.length=0;
 for(const w of ['GESTÄNDNIS','DIE GANZE WAHRHEIT','REICHWEITE +8 %','UNTERBROCHEN 1/2','+7300 · SELBST RAUSGEZOGEN'])g.float(b.x,b.y-60,w);
 g.float(merc.x,merc.y-58,'ZERTIFIKAT ×2');assert.equal(g.texts.length,0,'Doppelungen und Söldner-Schwäche fallen weg '+JSON.stringify(g.texts.map(t=>t.text)));
 g.float(g.player.x,g.player.y-58,'ZERTIFIKAT ×1');g.float(g.player.x,g.player.y-62,'GELOGEN');g.float(b.x,b.y-40,'1234');
 assert.deepEqual(g.texts.map(t=>t.text),['ZERTIFIKAT ×1','GELOGEN','1234'],'am Helden bleibt die eigene Schwäche, Treffer-Rückmeldung und Zahlen');
 assert.equal(quietFloat(g,'REICHWEITE +8 %',b.x,b.y),true);assert.ok(DUNGEON_E4B.clarity.hudFloats.length>=5);
});
