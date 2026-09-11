import {readFile,writeFile} from 'node:fs/promises';
const bbox = {west:7.293,south:50.262,east:7.321,north:50.280};
const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
const root = new URL('../data/',import.meta.url);
if (process.argv.includes('--download')) {
  const r = await fetch(url,{headers:{'User-Agent':'MertlochChronicles/0.1 (local game prototype)'},signal:AbortSignal.timeout(60000)});
  if(!r.ok) throw new Error(`OSM: ${r.status}; vorhandener Snapshot bleibt erhalten.`);
  const xml = await r.text();
  if(!xml.includes('<osm ')) throw new Error('Ungültige OSM-Antwort.');
  await writeFile(new URL('mertloch.osm',root),xml);
}
const xml = await readFile(new URL('mertloch.osm',root),'utf8');
const decode = s => s.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attrs = s => Object.fromEntries([...s.matchAll(/([\w:]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const tags = s => Object.fromEntries([...s.matchAll(/<tag\s+([^>]+)\/>/g)].map(m=>{const a=attrs(m[1]);return [a.k,a.v]}));
const keep = ['name','highway','building','landuse','natural','waterway','leisure','amenity','barrier','bridge','tunnel','width','height','building:levels'];
const clean = t => Object.fromEntries(Object.entries(t).filter(([k])=>keep.includes(k)));
const nodes = new Map();
const elements = [];
for (const m of xml.matchAll(/<node\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/node>)/g)) {
  const a=attrs(m[1]); const n={lat:Number(a.lat),lon:Number(a.lon)};nodes.set(a.id,n);
  const t=clean(tags(m[2]||''));
  if(Object.keys(t).length)elements.push({type:'node',id:Number(a.id),...n,tags:t});
}
for (const m of xml.matchAll(/<way\s+([^>]+)>([\s\S]*?)<\/way>/g)) {
  const a=attrs(m[1]),t=clean(tags(m[2]));
  if(!Object.keys(t).some(k=>k!=='name'))continue;
  const geometry=[...m[2].matchAll(/<nd\s+ref="(\d+)"\s*\/>/g)].map(n=>nodes.get(n[1])).filter(Boolean);
  if(geometry.length>1)elements.push({type:'way',id:Number(a.id),tags:t,geometry});
}
if(!elements.some(e=>e.tags.name==='St. Gangolf'))throw new Error('Falscher Kartenausschnitt: St. Gangolf fehlt.');
const data={source:'OpenStreetMap',license:'ODbL-1.0',attribution:'© OpenStreetMap-Mitwirkende',url,bbox,importedAt:new Date().toISOString(),elements};
await writeFile(new URL('mertloch.json',root),JSON.stringify(data));
console.log(JSON.stringify({features:elements.length,buildings:elements.filter(e=>e.tags.building).length,roads:elements.filter(e=>e.tags.highway&&e.type==='way').length,landuse:elements.filter(e=>e.tags.landuse).length,landmarks:elements.filter(e=>e.tags.building&&e.tags.name).map(e=>e.tags.name)},null,2));
