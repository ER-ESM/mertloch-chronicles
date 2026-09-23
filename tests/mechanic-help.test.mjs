import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {talentById,TALENTS,changeSpec,learnTalent} from '../talents.js';
import {talentHelp,mechanicHelp,skillHelp,passiveHelp} from '../mechanic-help.js';
import {describeCard,refCard} from '../describe-ui.js';
import {classHudState} from '../class-hud.js';
import {combatStats} from '../rpg.js';
import {fireProcs} from '../procs.js';
import {SPEC_MECHANICS,CLAN_MEMBERS} from '../content/index.js';
import {selectFriend} from '../help-target.js';
import {tickMech} from '../spec-mechanics.js';
const world=()=>({id:'help',spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[b],findClear:(x,y)=>({x,y})});
const game=(classId='baerbel',spec='baerbel-care')=>new Game(world(),{classId,level:30,rpg:{talents:{spec,learned:[]}}});

test('cross-tree mark procs name the current mark and actually trigger outside Putzpyramide',()=>{
 const g=game(),t=talentById('baerbel-feedback-0');assert.ok(learnTalent(g,t.id));g.random=()=>0;g.player.hp=1;
 const help=talentHelp(g,t);assert.match(help.effect,/Fleckentest/);assert.match(help.context.join(' '),/allen drei Hauptbäumen/);
 const hp=g.player.hp;assert.ok(fireProcs(g,'markedHit',combatStats(g),{damage:100}));assert.ok(g.player.hp>hp);
 changeSpec(g,'baerbel-feedback');assert.match(talentHelp(g,t).effect,/Schimmel/);assert.match(skillHelp(g,'mark'),/Pinsel-Piekser/);assert.match(refCard(g,'term:schimmel'),/Sporenwolke/);
});
test('mixed talents retain both effects; shared ground and mobile modifiers are not labelled main-tree-only',()=>{
 const g=game('dieter','dieter-wall'),t=TALENTS['dieter-brawl'].find(t=>t.effects.stackDecay&&Object.keys(t.effects).some(k=>k.startsWith('proc:'))),h=talentHelp(g,t);
 assert.match(h.effect,/Randale/);assert.match(h.effect,/3 s/);assert.match(h.context.join(' '),/Nur dieser Anteil/);assert.match(h.context.join(' '),/übrigen Effekte wirken auch/);
 const a=game(),field=TALENTS['baerbel-care'].find(t=>t.effects.fieldDuration);assert.match(talentHelp(a,field).context.join(' '),/Landhaus-Lazarett oder Putzpyramide/);
 const mobile=Object.values(TALENTS).flat().find(t=>t.spec.startsWith('baerbel')&&t.effects.mobileStrike);assert.match(talentHelp(a,mobile).context.join(' '),/allen drei Hauptbäumen/);
});
test('resource help distinguishes direct healing, overheal, the start threshold and movement exceptions',()=>{
 const g=game(),help=mechanicHelp(g);assert.match(help.lines.join(' '),/passive Heilprocs füllt keine/);assert.match(help.lines.join(' '),/Überheilung verursacht dabei keinen Schaden/);
 assert.match(skillHelp(g,'ground'),/Giselas Nest/);assert.doesNotMatch(skillHelp(g,'ground'),/füllt 1 Vorratsglas/);
 changeSpec(g,'baerbel-stage');const m=SPEC_MECHANICS['baerbel-stage'];assert.equal(classHudState(g).max,m.state.trigger);const p=mechanicHelp(g).lines.join(' ');assert.match(p,/im Kampf automatisch/);assert.match(p,/Pinsel-Piekser/);assert.match(p,/0 Randale/);
 for(const spec of Object.keys(SPEC_MECHANICS)){const a=game(spec.split('-')[0],spec);assert.ok(a.describe('mechanic',spec).info.effect);assert.doesNotMatch(describeCard(a,'mechanic',spec),/undefined|NaN/);}
});
test('passives use tuned timing and the handbook keeps runtime skill names and ranked effects',()=>{
 const g=game(),p=CLAN_MEMBERS.find(m=>m.id==='baerbel').passives;assert.ok(passiveHelp(g).includes(p.beatWindow[1].toString().replace('.',',')));assert.match(describeCard(g,'passive','baerbel'),/Automatische Angriffe lösen diesen Taktbonus nicht/);
 changeSpec(g,'baerbel-feedback');assert.match(describeCard(g,'skill','mark'),/<strong>Schimmel<\/strong>/);assert.match(describeCard(g,'skill','mark'),/Sporenwolke/);
 assert.ok(learnTalent(g,'baerbel-feedback-0'));assert.ok(learnTalent(g,'baerbel-feedback-0'));assert.match(describeCard(g,'talent','baerbel-feedback-0'),/9 %/);assert.match(describeCard(g,'talent','baerbel-feedback-0'),/>9</);
});

test('Vorrat fills when healing the selected companion at full own health; clean damage comes from healing yourself with an enemy selected',()=>{
 const g=game();g.hireCompanion('merc-hopfen-horst',{free:true});const c=g.companions[0];Object.assign(c,{x:20,y:0,hp:c.maxHp-100});selectFriend(g,'companion',c);
 g.skills.find(s=>s.id==='heal').castTime=0;g.player.hp=g.player.maxHp;tickMech(g,0,combatStats(g));g.classState.m.clean=5;let baseDamage=0;g.damage=(_target,amount)=>{baseDamage=amount;};
 const before=c.hp;assert.equal(g.action('heal'),true);assert.equal(g.classState.m.supply,1);assert.ok(c.hp>before);assert.equal(baseDamage,0,'Freund gewählt: kein Gegner, kein Grundschaden');
 // Ein Ziel (E-65): mit gewähltem Gegner heilt die Löffelkur dich, der Grundschaden trifft den Gegner.
 g.friend=null;g.target={hp:1000};g.player.hp=g.player.maxHp-100;g.cooldowns.heal=0;g.gcd=0;const own=g.player.hp;
 assert.equal(g.action('heal'),true);assert.equal(g.classState.m.supply,2);assert.ok(g.player.hp>own);assert.equal(baseDamage,Math.round((g.player.hp-own)*SPEC_MECHANICS['baerbel-care'].supply.cleanDamage));
 const help=mechanicHelp(g).lines.join(' ');assert.match(help,/als Ziel gewählt/);assert.doesNotMatch(help,/Hilfsziel/);assert.match(skillHelp(g,'heal'),/Heilt dein gewähltes freundliches Ziel/);
});
