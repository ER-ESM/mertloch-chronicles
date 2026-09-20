import test from 'node:test';
import assert from 'node:assert/strict';
import {categoriesOf,describableIds,termAudit,SLOT_FUNCTION,belongsTo} from '../content/index.js';

test('jedes beschreibbare Element hat genau eine Art und mindestens eine Funktion',()=>{
 for(const {kind,id} of describableIds()){const c=categoriesOf(kind,id);assert.ok(c?.kind?.name,kind+' '+id);assert.ok(c.functions.length>=1,kind+' '+id+' ohne Funktion');}
});
test('Leisten-Kniffe zeigen ihre Hauptfunktion zuerst',()=>{
 for(const [slot,fn] of Object.entries(SLOT_FUNCTION)){if(['buff','throw','ground'].includes(slot))continue;
  for(const cls of ['dieter','baerbel','kevin'])assert.equal(categoriesOf('skill',cls+'/'+slot).functions[0].id,fn,cls+'/'+slot);}
 assert.equal(categoriesOf('buff','kevin').functions[0].id,'staerkung');assert.equal(categoriesOf('throw','dieter').functions[0].id,'wurf');
});
test('Zugehörigkeit: Talent → veränderte Kniffe, Auslöser → Talent, Talent-Kniff → Talent und Baum',()=>{
 const t=belongsTo('talent','dieter-wall-0');assert.equal(t.cls,'dieter');assert.equal(t.spec,'dieter-wall');assert.deepEqual(t.modifies,['skill:dieter/strike']);
 const p=belongsTo('proc','deckelwirtschaft');assert.deepEqual(p.source,['dieter-wall-0']);assert.deepEqual(p.modifies,['skill:dieter/strike']);
 const k=belongsTo('talentSkill','keg');assert.equal(k.spec,'dieter-brew');assert.ok(k.source.length>=1);
});
test('Begriffe decken sich mit Kniff-Bezug, Auslöser und Wirkung',()=>{
 for(const {kind,id} of describableIds()){const a=termAudit(kind,id);assert.deepEqual(a,{missing:[],unfounded:[]},kind+' '+id);}
});
