import {readdir,cp,mkdir,rm,writeFile,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'_site');
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='_site')throw Error('Invalid site output directory');
const existing=await lstat(output).catch(e=>{if(e.code!=='ENOENT')throw e;return null;});
if(existing?.isSymbolicLink())throw Error('Site output must not be a symbolic link');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const files=(await readdir(root,{withFileTypes:true})).filter(e=>e.isFile()&&/\.(html|css|js)$/.test(e.name));
for(const file of files)await cp(path.join(root,file.name),path.join(output,file.name));
// Inhaltsschicht: nur die Module, keine Berichte.
await mkdir(path.join(output,'content'));
const content=(await readdir(path.join(root,'content'),{withFileTypes:true})).filter(e=>e.isFile()&&e.name.endsWith('.js'));
for(const file of content)await cp(path.join(root,'content',file.name),path.join(output,'content',file.name));
await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
await mkdir(path.join(output,'data'));
await cp(path.join(root,'data','mertloch.json'),path.join(output,'data','mertloch.json'));
await writeFile(path.join(output,'.nojekyll'),'');
console.log(`GitHub Pages site built in _site: ${files.length} application files, ${content.length} content modules, local graphics and Mertloch map.`);
