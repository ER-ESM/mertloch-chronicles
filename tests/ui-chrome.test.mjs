import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {partyMemberFrame,unitPortrait} from '../unit-frame.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('all six generated UI materials retain original checksums and transparent frame apertures',()=>{
 const g=JSON.parse(read('assets/ui-chrome/generation.json'));assert.equal(g.jobs.length,6);
 for(const j of g.jobs){const bytes=read(j.path),im=decodePng(bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),j.sha256);assert.ok(j.prompt&&j.original);
  if(j.id.startsWith('frame-')||j.id==='portrait-medallion')assert.equal(im.data[(Math.floor(im.height/2)*im.width+Math.floor(im.width/2))*4+3],0,j.id+' center remains transparent');
 }
});
test('party frames escape remote names, clamp health and preserve selection / revival semantics',()=>{
 const hostile=partyMemberFrame({n:'<img onerror="x">',c:'" onload="x',l:30,h:140,w:'here',s:'idle'},{world:'here'});
 assert.doesNotMatch(hostile,/<img onerror/);assert.match(hostile,/&lt;img/);assert.match(hostile,/width:100%/);assert.match(hostile,/data-unit-portrait="dieter"/);
 const selected=partyMemberFrame({n:'Anni',c:'baerbel',l:20,h:24,w:'here',s:'combat'},{world:'here',selected:'Anni'});
 assert.match(selected,/is-low-health/);assert.match(selected,/aria-pressed="true"/);assert.match(selected,/aria-valuenow="24"/);
 const dead={n:'Kevin',c:'kevin',l:10,h:0,w:'there',s:'dead'};
 assert.doesNotMatch(partyMemberFrame(dead,{world:'here'}),/data-party-revive/);
 assert.match(partyMemberFrame(dead,{world:'there'}),/data-party-revive/);
});
test('unit portraits expose stable authored identity without allowing URL injection',()=>{
 assert.match(unitPortrait('kevin',30),/data-unit-portrait="kevin"/);
 assert.doesNotMatch(unitPortrait('https://untrusted.invalid/x',30),/untrusted/);
 assert.match(unitPortrait('baerbel','<bad>'),/&lt;bad&gt;/);
});
