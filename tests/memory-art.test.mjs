import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {MEMORY_FRAGMENTS} from '../content/memories.js';
import {MEMORY_ART,memoryArtFor} from '../memory-art.js';
import {memoriesPanel,memoryOverlay,memoryArtPanel} from '../chapter-ui.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
const catalog=JSON.parse(readFileSync(new URL('../assets/content-art/memories/catalog.json',import.meta.url)));
test('every story memory has a distinct finished landscape scene and matching source',()=>{
 assert.deepEqual(Object.keys(MEMORY_ART).sort(),MEMORY_FRAGMENTS.map(m=>m.id).sort());
 assert.deepEqual(catalog.entries.map(e=>e.id).sort(),Object.keys(MEMORY_ART).sort());
 const hashes=new Set();let total=0;
 for(const entry of catalog.entries){
  const art=memoryArtFor(entry.id),bytes=readFileSync(new URL('../'+art.src,import.meta.url)),im=decodePng(bytes);
  assert.equal(im.width,768);assert.equal(im.height,512);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  const source=readFileSync(new URL('../assets/content-art/memories/'+entry.source,import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'),entry.sourceSha256);
  hashes.add(entry.sha256);total+=bytes.length;assert.ok(art.alt.length>40);
 }
 assert.equal(hashes.size,MEMORY_FRAGMENTS.length);assert.ok(total<2_000_000,'offline image budget');
 assert.equal(memoryArtFor('../../private'),null);
});
test('locked memories reveal neither picture URLs, alternate descriptions nor enlarge controls',()=>{
 const empty=memoriesPanel({memories:{seen:[]}});
 assert.ok(!empty.includes('<img'));assert.ok(!empty.includes('data-memory-art'));
 const revealed=memoriesPanel({memories:{seen:['stempel']}});
 assert.equal((revealed.match(/data-memory-art=/g)||[]).length,1);
 assert.ok(revealed.includes(memoryArtFor('stempel').src));
 for(const m of MEMORY_FRAGMENTS.filter(m=>m.id!=='stempel')){
  assert.ok(!revealed.includes(memoryArtFor(m.id).src));assert.ok(!revealed.includes(MEMORY_ART[m.id]));
 }
});
test('all unlocks and revisitable detail views use their own image and preserve the story',()=>{
 for(const fragment of MEMORY_FRAGMENTS){
  for(const html of [memoryOverlay(fragment),memoryArtPanel(fragment)]){
   assert.ok(html.includes(memoryArtFor(fragment.id).src));
   assert.ok(html.includes(fragment.title));assert.ok(html.includes('width="768" height="512"'));
  }
 }
 assert.equal(catalog.entries.filter(e=>e.panels===2).length,1);
});
test('offline release contains all memory art and recursively imported content modules',()=>{
 const self={};runInNewContext(readFileSync(new URL('../precache-manifest.js',import.meta.url),'utf8'),{self});
 const urls=new Set(self.PRECACHE.urls);
 for(const file of readdirSync(new URL('../content/',import.meta.url),{recursive:true}).filter(f=>f.endsWith('.js')))assert.ok(urls.has('content/'+file.replaceAll('\\','/')),file);
 for(const memory of MEMORY_FRAGMENTS)assert.ok(urls.has(memoryArtFor(memory.id).src.slice(2)),memory.id);
 assert.ok(![...urls].some(f=>f.includes('memories/sources/')||f.includes('memories/review/')));
});
