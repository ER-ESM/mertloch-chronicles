import {writePrecache} from './pwa-cache.mjs';
import {readdir,cp,mkdir,rm,writeFile,lstat} from 'node:fs/promises';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

await writePrecache();
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'_site');
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='_site')throw Error('Invalid site output directory');
const existing=await lstat(output).catch(e=>{if(e.code!=='ENOENT')throw e;return null;});
if(existing?.isSymbolicLink())throw Error('Site output must not be a symbolic link');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const files=(await readdir(root,{withFileTypes:true})).filter(e=>e.isFile()&&/\.(html|css|js|webmanifest)$/.test(e.name));
for(const file of files)await cp(path.join(root,file.name),path.join(output,file.name));
// Inhaltsschicht: nur die Module, keine Berichte.
// Inhaltsschicht samt Unterordnern (content/checks/), nur JavaScript-Module.
await cp(path.join(root,'content'),path.join(output,'content'),{recursive:true,filter:src=>lstat(src).then(st=>st.isDirectory()||src.endsWith('.js'))});
const content=(await readdir(path.join(root,'content'),{recursive:true})).filter(n=>n.endsWith('.js'));
await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true,filter:src=>{
 const relative=path.relative(path.join(root,'assets'),src).replaceAll('\\','/');
 return !/^(ui-kit|redesign|theme-demo|skill-fx|class-visuals|content-art\/e32|content-art\/locomotion)\/(sources|review)(\/|$)/.test(relative)&&!/^(ui-kit|redesign|skill-fx|class-visuals|content-art\/e32)\/generation\.json$/.test(relative);
}});
await mkdir(path.join(output,'data'));
await cp(path.join(root,'data','mertloch.json'),path.join(output,'data','mertloch.json'));
// Renderer-Prototypen C/D (proto-c.js, proto-d.js) laden three.js und das Kasten-Rig aus der Pre-Render-Werkstatt; nicht im Spiel-Cache.
for(const file of ['vendor/three.module.min.js','rig.js','poses.js'])await cp(path.join(root,'tools','prerender',file),path.join(output,'tools','prerender',file));
await writeFile(path.join(output,'.nojekyll'),'');
// Buildnummer (build-info.js): Commit-Zahl des gebauten Stands, Kurz-Hash, Commit-Datum, package-Version. Ohne Git (z. B. Zip) bleibt der Arbeitsstand.
{const git=cmd=>{try{return execSync('git '+cmd,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return '';}};
 const number=Number(git('rev-list --count HEAD'))||Number(process.env.GITHUB_RUN_NUMBER)||0,commit=git('rev-parse --short HEAD')||'dev',date=(git('log -1 --format=%cs')||new Date().toISOString().slice(0,10)),version=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8')).version;
 const src=readFileSync(path.join(root,'build-info.js'),'utf8').replace(/export const BUILD=\{[^}]*\};/,`export const BUILD=${JSON.stringify({number,commit,date,version})};`);
 await writeFile(path.join(output,'build-info.js'),src);console.log(`Build #${number} · ${commit} · ${date} · v${version}`);}
console.log(`GitHub Pages site built in _site: ${files.length} application files, ${content.length} content modules, local graphics and Mertloch map.`);
// Selbstprüfung: Die gebaute Inhaltsschicht muss aus _site heraus ladbar sein (2026-09-17: fehlender Unterordner content/checks/ ließ die Live-Seite im Ladebildschirm hängen).
try{const built=await import(new URL('../_site/content/index.js',import.meta.url));if(built.validateContent().length)throw new Error('Inhaltsprüfung in _site nicht grün');}
catch(err){console.error('Build-Selbstprüfung fehlgeschlagen: '+err.message);process.exit(1);}
