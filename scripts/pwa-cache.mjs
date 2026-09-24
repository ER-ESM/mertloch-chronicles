import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
export async function writePrecache(){const files=(await readdir(root)).filter(n=>/\.(js|css|html|webmanifest)$/.test(n)&&!['sw.js','precache-manifest.js'].includes(n));files.push('data/mertloch.json');for(const file of await readdir(new URL('content/',root),{recursive:true}))if(file.endsWith('.js'))files.push('content/'+file.replaceAll('\\','/'));// Nur die tatsächlich verwendeten Exporte der Grafiklieferung: sources/, review/, generation-*.json
// und PROMPTS.md sind Herkunftsdaten und gehören nicht in den Spiel-Cache.
files.push('assets/content-art/handoff-catalog.json');
// Runde 5b: Katalog der gezeichneten Heldenebenen (hero-layers.js) – leer ausgeliefert, damit der Start ohne 404 läuft; die Sprite-Pipeline füllt ihn.
try{await readFile(new URL('assets/heroes/catalog.json',root));files.push('assets/heroes/catalog.json');}catch{}
for(const folder of ['mounts','ui-kit','ui-chrome','class-visuals','class-mechanics','content-art/e32','content-art/locomotion'])for(const file of await readdir(new URL('assets/'+folder+'/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/'+folder+'/runtime/'+file);
// Lokal vendorte Schriften (OFL): Jersey 15 und Nunito, damit die Oberfläche offline im Stil bleibt.
for(const file of await readdir(new URL('assets/fonts/',root)))if(file.endsWith('.woff2'))files.push('assets/fonts/'+file);
// Preview graphics are cached on first use. Integrity pins them to the active release.
const optional={};
try{for(const file of (await readdir(new URL('assets/prerender/runtime/',root),{recursive:true})).sort())if(/\.(png|json)$/.test(file)){const path='assets/prerender/runtime/'+file.replaceAll('\\','/');optional[path]='sha256-'+createHash('sha256').update(await readFile(new URL(path,root))).digest('base64');}}catch(error){if(error.code!=='ENOENT')throw error;}
// Ladeschirm: Deckel und Tresenleiste gehören zum Start; die großen Hintergründe kommen beim ersten Zeigen in den Cache.
for(const file of (await readdir(new URL('assets/loading/',root)).catch(()=>[])).sort()){const path='assets/loading/'+file;if(file.endsWith('.png'))files.push(path);else if(file.endsWith('.webp'))optional[path]='sha256-'+createHash('sha256').update(await readFile(new URL(path,root))).digest('base64');}
for(const file of await readdir(new URL('assets/theme-demo/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/theme-demo/runtime/'+file);
for(const file of await readdir(new URL('assets/skill-fx/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/skill-fx/runtime/'+file);
for(const file of await readdir(new URL('assets/redesign/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/redesign/runtime/'+file);
for(const file of await readdir(new URL('assets/precision/runtime/',root),{recursive:true}))if(/\.(png|json)$/.test(file))files.push('assets/precision/runtime/'+file.replaceAll('\\','/'));
// Anziehpuppe (Hybrid 2026-09-24): Ebenenbögen je Quelle × Archetyp × Richtung, zur Laufzeit zusammengesetzt. Pflicht sind nur Katalog und die
// Grundbögen, die paperdoll-art.js vorab lädt (Körper, Dutt, Aussehen); Ausrüstung, NPC-Kleidung und Aktionsbilder (-akt) kommen beim ersten Gebrauch.
try{const cat=JSON.parse(await readFile(new URL('assets/paperdoll/runtime/catalog.json',root),'utf8'));files.push('assets/paperdoll/runtime/catalog.json');
 const first=new Set(Object.keys(cat.sources).filter(s=>s==='koerper'||s==='dutt'||cat.sources[s].slot==='look'));
 for(const file of (await readdir(new URL('assets/paperdoll/runtime/',root))).sort()){if(!file.endsWith('.png'))continue;const path='assets/paperdoll/runtime/'+file,src=file.replace(/-(?:dieter|baerbel|kevin)(?:-(?:sw|nw|ne))?(?:-akt)?\.png$/,'');
  if(first.has(src)&&!file.endsWith('-akt.png'))files.push(path);else optional[path]='sha256-'+createHash('sha256').update(await readFile(new URL(path,root))).digest('base64');}}catch(error){if(error.code!=='ENOENT')throw error;}
// Reiten mit der Anziehpuppe (paperdoll-mount.js): Bögen je Reittier × Archetyp, erst beim Aufsitzen geladen – optional, nicht im Pflicht-Cache.
for(const file of (await readdir(new URL('assets/paperdoll/reiten/',root)).catch(()=>[])).sort())if(/\.(png|json)$/.test(file)){const path='assets/paperdoll/reiten/'+file;optional[path]='sha256-'+createHash('sha256').update(await readFile(new URL(path,root))).digest('base64');}
// Sprite-Schmiede (E-58): selbst gerenderte Sprites, nur Laufzeitdateien.
for(const file of await readdir(new URL('assets/forge/runtime/',root),{recursive:true}).catch(()=>[]))if(/\.(png|json)$/.test(file))files.push('assets/forge/runtime/'+file.replaceAll('\\','/'));
for(const folder of ['maifeld-09','maifeld-rpg','maifeld-ui-011','clan-skills-013','app','content-art/memories','content-art/npcs','content-art/items','content-art/talents','content-art/talents/procs','content-art/aperol-anni','content-art/ui','content-art/heroes','content-art/enemies','content-art/bosses','content-art/props','content-art/portraits'])for(const file of await readdir(new URL('assets/'+folder+'/',root)))if(/\.(png|svg)$/.test(file)&&!(file==='baerbel.png'&&['clan-skills-013','content-art/talents'].includes(folder))&&!(folder==='content-art/talents/procs'&&file.startsWith('proc-')))files.push('assets/'+folder+'/'+file);
for(const file of await readdir(new URL('assets/sprite-lab/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/sprite-lab/runtime/'+file);
for(const file of await readdir(new URL('assets/maifeld-live/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/maifeld-live/runtime/'+file);
for(const file of await readdir(new URL('assets/maifeld-prototype/runtime/',root)))if(/\.(png|json)$/.test(file))files.push('assets/maifeld-prototype/runtime/'+file);
const tiny=['Resources/Trees/Tree.png','Deco/06.png','Deco/05.png','Deco/08.png','Deco/09.png','Deco/03.png','Factions/Knights/Buildings/House/House_Blue.png','Terrain/Ground/Tilemap_Flat.png','Effects/Explosion/Explosions.png','Effects/Fire/Fire.png'];files.push(...tiny.map(p=>'assets/tiny-swords/'+p));files.sort();const hash=createHash('sha256');for(const file of [...files,'sw.js'])hash.update(await readFile(new URL(file,root)));hash.update(JSON.stringify(optional));const version=hash.digest('hex').slice(0,16);await writeFile(new URL('precache-manifest.js',root),'// Generated by scripts/pwa-cache.mjs; release content hash.\nself.PRECACHE='+JSON.stringify({version,urls:files,optional},null,2)+';\n');return{version,files:files.length};}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await writePrecache());
