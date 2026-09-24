import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadyCheck} from '../party-ready.js';

function setup(me,members){let t=0;const sent=[],said=[],asked=[];const rc=createReadyCheck({me:()=>me,members:()=>members,send:m=>sent.push(m),now:()=>t,say:x=>said.push(x),ui:{ask:(f,s)=>asked.push([f,s]),close(){}}});return {rc,sent,said,asked,tick:ms=>{t+=ms;rc.tick();}};}

test('Anführer fragt, alle bereit → „Alle sind bereit.“',()=>{
 const s=setup('Rudi',['Moni','Kai']);s.rc.start();assert.deepEqual(s.sent,[{t:'ready',op:'ask'}]);
 s.rc.receive({t:'ready',op:'ask',from:'Rudi'});assert.equal(s.asked.length,0,'wer fragt, wird nicht gefragt');assert.equal(s.rc.status('Moni'),'wait');
 s.rc.receive({t:'ready',op:'answer',n:'Moni',ok:true});s.rc.receive({t:'ready',op:'answer',n:'Kai',ok:true});
 assert.equal(s.said.at(-1),'Alle sind bereit.');assert.equal(s.rc.status('Kai'),'yes');s.tick(9000);assert.equal(s.rc.status('Kai'),null,'Anzeige verschwindet');
});

test('Mitglied antwortet „nicht bereit“, einer schweigt → Zusammenfassung nach Ablauf',()=>{
 const s=setup('Moni',['Rudi','Kai']);s.rc.receive({t:'ready',op:'ask',from:'Rudi'});assert.deepEqual(s.asked,[['Rudi',20]]);
 s.rc.answer(false);assert.deepEqual(s.sent.at(-1),{t:'ready',op:'answer',ok:false});assert.equal(s.rc.status('Moni'),'no');
 s.tick(21000);assert.equal(s.said.at(-1),'Nicht bereit: Moni. Keine Antwort: Kai.');assert.equal(s.rc.status('Kai'),'no');
 assert.equal(s.rc.receive({t:'chat'}),false);
});
