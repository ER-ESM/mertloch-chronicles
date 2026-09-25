// E-72 · Anzeige und Effekte der Klassenressourcen: Vertrag zwischen class-resources.js (Ereignisse) und der Darstellung.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RESOURCE_FX_KINDS} from '../resource-fx-art.js';
import {RESOURCE_FX_DURATION,SKILL_FX} from '../combat-fx.js';
import {spriteProblems} from '../resource-art.js';
import {RESOURCE_HUD_TEXT,SPEC_MECHANICS,CLASS_SPECS} from '../content/index.js';
import {classHudState} from '../class-hud.js';
import {Game} from '../engine.js';
import {resourceHud} from '../class-resources.js';

const source=readFileSync(new URL('../class-resources.js',import.meta.url),'utf8');
const emitted=[...new Set([...source.matchAll(/emitCombatFx\(g,'([a-z-]+)'/g)].map(m=>m[1]))];

test('jedes Ressourcen-Ereignis aus class-resources.js hat ein Bild und eine Anzeigedauer',()=>{
 const generic=new Set(['hurt','heal','attack']);
 for(const kind of emitted){if(generic.has(kind))continue;assert.ok(RESOURCE_FX_KINDS.has(kind),'Bild fehlt: '+kind);assert.ok(RESOURCE_FX_DURATION[kind]>0,'Dauer fehlt: '+kind);}
 assert.ok(emitted.length>=20,'Ereignisse gefunden: '+emitted.length);
});
test('Kniffe mit eigenem Ressourcen-Effekt tragen kein zweites Grundbild',()=>{
 for(const [cls,id] of [['dieter','zeche'],['kevin','reload'],['schorsch','burst'],['schorsch','ground'],['kaethe','strike'],['kaethe','throw']])assert.equal(SKILL_FX[cls][id],'resource',cls+':'+id);
});
test('Pixelbilder, Farbzeichen und Pixelschrift sind vollständig',()=>{assert.deepEqual(spriteProblems(),[]);});
test('Tooltips der Ressourcen-Anzeige liefern kurze Texte',()=>{
 const T=RESOURCE_HUD_TEXT;for(const s of [T.rage.note(83,80),T.tab.note(40,240),T.trend.note('9.800',16,true),T.algo.note('2,1'),T.crate.note(9,12),T.bons.note(1,3,35),T.pickups.note(1),T.glut.note(64,20),T.locked.note('2,4'),T.rost.note(T.states.gar,72),T.augen.note(47,61,90,120),T.deck.note(18),T.chain.note('Herz',1,25)]){assert.equal(typeof s,'string');assert.ok(s.length>3&&s.length<90,s);}
});
const world={id:'hud',spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b],findClear:(x,y)=>({x,y})};
test('Mechanik-Anzeige der neuen Hauptbäume liest nur und zeigt ihre Kernmechanik',()=>{
 const specs=[...(CLASS_SPECS.schorsch||[]),...(CLASS_SPECS.kaethe||[])].filter(s=>SPEC_MECHANICS[s]);
 for(const spec of specs){const g=new Game(world,{classId:spec.split('-')[0],level:30,rpg:{talents:{spec,learned:[]}}}),before=JSON.stringify([g.res,g.fields]),s=classHudState(g);
  assert.ok(s&&Number.isFinite(s.max)&&s.max>0,spec);assert.ok(s.emblem,spec+' Emblem');assert.equal(JSON.stringify([g.res,g.fields]),before,spec+' unverändert');}
 const g=new Game(world,{classId:'kaethe',level:30,rpg:{talents:{spec:'kaethe-grand',learned:[]}}});g.res.bubes=3;assert.equal(classHudState(g).count,3);assert.equal(classHudState(g).kind,'buben');
});
test('Anzeigezustand aller fünf Modelle trägt die Felder, die die Anzeige zeichnet',()=>{
 const need={rage:['value','max','surgeAt','tab','tabMax'],trend:['value','trend','trendMax','trendName','viewers','idle','decayAfter','viral'],ammo:['value','max','bons','bonMax','pickups'],grill:['value','zones','zone','perfect','locked','slots','rost'],cards:['value','win','schneider','schwarz','deck','chain','hand']};
 for(const cls of ['dieter','baerbel','kevin','schorsch','kaethe']){const g=new Game(world,{classId:cls,level:30,rpg:{talents:{spec:CLASS_SPECS[cls]?.[0],learned:[]}}}),h=resourceHud(g);for(const k of need[h.kind])assert.ok(k in h,cls+': '+k);}
});
