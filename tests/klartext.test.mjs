// Klartext in Talenten und Kniffe-Buch (Nutzerwünsche 2026-09-23): Sammelbegriffe nennen den konkreten Kniff, Hauptbaum-Kniffe
// wie „Anstich“ sagen, woher sie kommen, und Passives wie „Rausch“ stehen im Kniffe-Buch.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {TALENTS} from '../talents.js';
import {talentHelp,nameSkills,kitSwaps,skillName,namingSpec} from '../mechanic-help.js';
import {passiveBook,specTerms} from '../passive-book.js';
import {skillbookPanel} from '../rpg-ui.js';
import {CLASS_SPECS} from '../content/index.js';

const arena=()=>({id:'klartext',seed:1,spawn:{x:0,y:0},npc:{x:10,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 blocked:()=>false,walkClear:()=>true,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b],onRoad:()=>false,width:4000,height:4000});
const hero=(classId,spec)=>{const g=new Game(arena(),{version:1,level:10,classId});g.rpg.talents.spec=spec;return g;};
const byName=(spec,name)=>TALENTS[spec].find(t=>t.name===name);

test('Sammelbegriffe bekommen den Namen des gemeinten Kniffs',()=>{
 const g=hero('dieter','dieter-wall');
 assert.equal(nameSkills(g,'Dein Bodenkniff wird verstärkt.','dieter-wall'),'Dein Bodenkniff („Böller unterm Biertisch“) wird verstärkt.');
 assert.equal(nameSkills(g,'Dein Bodenkniff wird verstärkt.','dieter-brew'),'Dein Bodenkniff („Anstich“) wird verstärkt.');
 assert.equal(nameSkills(g,'Die Wurf-Abklingzeit sinkt.'),'Die Wurf-Abklingzeit sinkt.','zusammengesetzte Wörter bleiben unberührt');
 assert.equal((nameSkills(g,'Ausweichen gibt Randale, Ausweichen macht frei.').match(/„/g)||[]).length,1,'nur einmal je Text');
});

test('jeder Talenttext mit Bodenkniff/Bodenangriff/Spezialkniff nennt den konkreten Kniff',()=>{
 for(const [cls,specs] of Object.entries(CLASS_SPECS))for(const main of specs){const g=hero(cls,main);
  for(const spec of specs)for(const t of TALENTS[spec]){const {effect}=talentHelp(g,t);
   for(const [re,id] of [[/(?<![\wäöüß-])(Bodenkniff|Bodenangriff)(?![\wäöüß-])/,'ground'],[/(?<![\wäöüß-])Spezialkniff(?![\wäöüß-])/,'burst']])
    if(re.test(effect))assert.ok(effect.includes(skillName(g,id,namingSpec(g,t))),t.id+' nennt den Kniff nicht: '+effect);}}
});

test('„Anstich“ im Talent sagt, woher er kommt – mit und ohne Hauptbaum Zapfmeister',()=>{
 const t=byName('dieter-brew','Pils zuerst');
 let h=talentHelp(hero('dieter','dieter-wall'),t);
 assert.ok(h.origin.some(l=>l.includes('„Anstich“ ist der Bodenkniff des Hauptbaums Zapfmeister')&&l.includes('„Böller unterm Biertisch“')),h.origin.join(' | '));
 h=talentHelp(hero('dieter','dieter-brew'),t);assert.ok(h.origin.some(l=>l.startsWith('„Anstich“ ist dein Bodenkniff')));
 assert.deepEqual(kitSwaps(hero('dieter',null),'dieter-brew').map(k=>k.name),['Anstich','Fassanstich']);
});

test('Kniffe-Buch zeigt Eigenart und Leisten als Kacheln (kein Fließtext); Rausch steht beim Kneipenschläger, Details im Tooltip',()=>{
 const g=hero('dieter','dieter-brawl'),html=passiveBook(g);
 assert.doesNotMatch(html,/<p[ >]/,'keine Absätze – Erklärungen gehören in den Tooltip');
 assert.match(html,/data-describe="passive:dieter"/);
 for(const spec of CLASS_SPECS.dieter)assert.match(html,new RegExp('data-describe="mechanic:'+spec+'"'));
 assert.match(html,/passive-tile is-on" data-describe="mechanic:dieter-brawl"/,'Hauptbaum hervorgehoben');
 assert.match(html,/passive-tile locked" data-describe="mechanic:dieter-brew"/,'andere Bäume gedimmt');
 assert.ok(specTerms('dieter-brawl').some(t=>t.name==='Rausch'));assert.match(html,/data-describe="glossary:rausch"/);
 assert.match(html,/draggable="false"/);
 const brew=g.describe('mechanic','dieter-brew');assert.ok(brew.info.context.some(l=>l.includes('„Böller unterm Biertisch“ → „Anstich“')),'Kniff-Ersetzung im Tooltip');
 assert.match(skillbookPanel(g,null,null),/book-passives/,'Teil des Reiters Kniffe');
});
