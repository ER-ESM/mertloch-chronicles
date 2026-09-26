// Prüfbogen der Sonderposen (SONDER): drei Archetypen × vier Richtungen, alle Sonderbilder nebeneinander (nah, S-fach).
//   node tools/paperdoll/posen-bogen.mjs [figuren=gerd,rita,securityazubi] [ordner] [S=1] [posen=alle]
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng} from '../sprite-pipeline/png.mjs';
import {SONDER} from './puppe.mjs';
import {figurBogen} from './dungeon-vorschau.mjs';
const figs=(process.argv[2]||'gerd,rita,securityazubi').split(','),out=process.argv[3]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/',import.meta.url)),S=+(process.argv[4]||1);
const cols=['stehen:0',...(process.argv[5]?process.argv[5].split(','):SONDER.map(s=>s.anim))];mkdirSync(out,{recursive:true});
for(const id of figs)writeFileSync(out+'/posen-'+id+'.png',encodePng(figurBogen(['se','sw','nw','ne'].map(dir=>({id,dir})),cols,S)));
console.log('Posen',figs.join(','),cols.join(' '));
