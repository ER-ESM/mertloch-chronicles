// Vergleichsbogen: vorhandene Figuren (content/figuren.js: Ida, Stammgäste) im selben Format wie die Dungeon-Vorschau (nah und Weltgröße).
//   node tools/paperdoll/referenz-bogen.mjs [ids=ida,ron,nyalol,olli] [ordner]
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng} from '../sprite-pipeline/png.mjs';
import {FIGUREN} from '../../content/figuren.js';
import {figurBogen,weltBogen} from './dungeon-vorschau.mjs';
const ids=(process.argv[2]||'ida,ron,nyalol,olli').split(','),out=process.argv[3]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/',import.meta.url));mkdirSync(out,{recursive:true});
const rows=[],cells=[];for(const id of ids){const f={id,...FIGUREN[id]};rows.push({id:f,dir:'se'});cells.push({id:f,dir:'se',name:'stehen:0'},{id:f,dir:'nw',name:'stehen:0'});}
writeFileSync(out+'/referenz-nah.png',encodePng(figurBogen(rows,['stehen:0','laufen:2','hieb:1'],1)));
writeFileSync(out+'/referenz-welt.png',encodePng(weltBogen(cells,[.45],3)));console.log('Referenz',ids.join(','));
