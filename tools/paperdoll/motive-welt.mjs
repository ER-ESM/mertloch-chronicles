// Weltgrößen-Kontaktbogen der Motive (k = 0,3 / 0,45 / 0,6, dreifach vergrößert) → visual-review/dungeon-figuren/motiv-welt.png
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';
import {W} from './puppe.mjs';
import {MOTIVE,motivBild} from './motive.mjs';
import {welt,CY0,CW,CH} from './dungeon-vorschau.mjs';
const out=process.argv[2]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/motiv-welt.png',import.meta.url));
const cells=[];for(const id of Object.keys(MOTIVE)){const fr=MOTIVE[id].frames;cells.push([id,'se',0],[id,'nw',0],[id,'sw',fr.findIndex(f=>f.anim==='laufen')>=0?fr.findIndex(f=>f.anim==='laufen')+1:1],[id,'se',fr.length-2]);}
const KS=[.3,.45,.6],Z=3,pad=4,cw=KS.map(k=>Math.round(CW*k*.8)*Z),ch=KS.map(k=>Math.round(CH*k)*Z),oyOf=r=>pad+ch.slice(0,r).reduce((a,b)=>a+b+pad,0);
const o=surface((Math.max(...cw)+pad)*cells.length+pad,oyOf(KS.length));for(let i=0;i<o.data.length;i+=4)o.data.set([0x44,0x40,0x3c,255],i);
KS.forEach((k,r)=>cells.forEach(([id,dir,f],c)=>{const {w,h,data:img}=welt(motivBild(id,dir,f),k),x0=Math.floor((W/2-CW*.4)*k),y0=Math.floor(CY0*k),ox=pad+c*(Math.max(...cw)+pad),oy=oyOf(r);
 for(let y=0;y<ch[r];y++)for(let x=0;x<cw[r];x++){const sx=x0+(x/Z|0),sy=y0+(y/Z|0);if(sx>=w||sy>=h)continue;const q=(sy*w+sx)*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((oy+y)*o.width+ox+x)*4);}}));
writeFileSync(out,encodePng(o));console.log('motiv-welt',cells.length);
