// Begehbare Treppe der Bude (Nutzerwunsch 2026-09-23): hochlaufen Stufe für Stufe mit Hub, Umschalten erst auf der obersten Stufe,
// seitlich hält das Geländer, oben durch den Zugang im Nordosten hinab, Klick läuft die Stufen wirklich.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const h=world.base.house,g0=h.stairs,up=h.upper.stairs,cx=(g0.minX+g0.maxX)/2;
const hero=()=>{const g=new Game(world,{version:1,level:5});g.enemies=[];g.floor=0;return g;};
const run=(g,keys,seconds,probe)=>{g.keys.clear();for(const k of keys)g.keys.add(k);for(let t=0;t<seconds;t+=1/30){g.tick(1/30);probe?.(g);}g.keys.clear();};

test('hochlaufen: Hub wächst Stufe für Stufe, umgeschaltet wird erst auf der obersten Stufe',()=>{
 const g=hero();Object.assign(g.player,{x:cx,y:g0.maxY+8});let lastLift=-1,rising=true,switchedAt=null;
 run(g,['w'],3,g=>{if(g.floor===0){const l=g.stairLift();if(l<lastLift-.01)rising=false;lastLift=l;if(g.player.y<g0.minY+(g0.topStep||8))assert.fail('nicht umgeschaltet auf der obersten Stufe');}else if(switchedAt===null)switchedAt=lastLift;});
 assert.equal(g.floor,1,'oben angekommen');assert.ok(rising,'Hub steigt beim Hochlaufen');
 assert.ok(switchedAt>=(g0.rise||15)*.75,'umgeschaltet erst nahe der obersten Stufe (Hub '+switchedAt+')');
 assert.ok(g.player.x>up.maxX,'oben steht man östlich des Treppenlochs auf dem Absatz');
});

test('seitlich kommt man nicht auf die Treppe, am Antritt schon – auch leicht versetzt',()=>{
 const g=hero();Object.assign(g.player,{x:g0.maxX+7,y:(g0.minY+g0.maxY)/2});run(g,['a'],1);
 assert.equal(g.floor,0);assert.ok(g.player.x>=g0.maxX+4,'Geländer hält');assert.equal(g.stairLift(),0);
 Object.assign(g.player,{x:g0.maxX-3,y:g0.maxY+8});run(g,['w'],3);assert.equal(g.floor,1,'Trichter führt vom Rand auf die Spur');
});

test('hinunter: oben durch den Zugang nach Westen, dann Stufe für Stufe hinab und unten hinaus',()=>{
 const g=hero();g.floor=1;Object.assign(g.player,{...up.landing});g.stairsHeld=false;
 run(g,['a'],1);assert.equal(g.floor,0,'Zugang im Nordosten führt hinab');const top=g.stairLift();assert.ok(top>8,'man steht oben auf der Treppe (Hub '+top+')');
 run(g,['s'],3);assert.equal(g.floor,0);assert.ok(g.player.y>g0.maxY,'unten hinaus');assert.equal(g.stairLift(),0);
 g.floor=1;Object.assign(g.player,{x:up.maxX+6,y:up.maxY-5});g.stairsHeld=false;run(g,['a'],1);assert.equal(g.floor,1,'südlich des Zugangs hält das Geländer');
});

test('gehaltene Taste pendelt nicht; Klick läuft die Stufen hinauf und hinab',()=>{
 const g=hero();Object.assign(g.player,{x:cx,y:g0.maxY+8});let changes=0,floor=0;run(g,['w'],5,g=>{if(g.floor!==floor){changes++;floor=g.floor;}});
 assert.equal(changes,1,'genau ein Wechsel bei durchgehaltenem W');
 const c=hero();Object.assign(c.player,{x:h.minX+120,y:h.minY+140});assert.ok(c.climbStairs());let lifted=0;
 for(let t=0;t<12&&c.floor===0;t+=1/30){c.tick(1/30);lifted=Math.max(lifted,c.stairLift());}
 assert.equal(c.floor,1,'Klickweg endet oben');assert.ok(lifted>10,'und lief dabei die Stufen hinauf');
 c.stairsHeld=false;assert.ok(c.climbStairs());for(let t=0;t<12&&!(c.floor===0&&c.player.y>g0.maxY+4);t+=1/30)c.tick(1/30);
 assert.equal(c.floor,0);assert.ok(c.player.y>g0.maxY,'Klick oben führt hinab und unten hinaus');
});
