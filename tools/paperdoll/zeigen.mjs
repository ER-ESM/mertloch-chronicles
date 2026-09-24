// Vorschau: setzt Körper + Ausrüstung mit dem gemeinsamen Kern zusammen (wie das Artefakt) und legt Sets × Bilder
// vergrößert auf einen Bogen, mit Bodenschatten.  node zeigen.mjs out scale "fig[@sw]:set|…" "frames" name [grund]
import {readFileSync,writeFileSync} from 'node:fs';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
import {composeCore,sources,useShade} from '../../paperdoll-kern.js';
const dir=process.argv[2]||'out',S=+(process.argv[3]||3);
const meta=JSON.parse(readFileSync(dir+'/puppe.json','utf8')),{W,H,bands,frames}=meta;useShade(meta.shade);
const SFX={se:'',sw:'-sw',nw:'-nw',ne:'-ne'},BASE={sw:'se',ne:'nw'};
const cache={};const load=(id,fig,d)=>cache[id+fig+d]??=decodePng(readFileSync(`${dir}/${id}-${fig}${SFX[d]}.png`));
/** Bogen je Richtung; sw/ne ohne eigenen Bogen = gespiegelte Grundrichtung. */
const sheet=(id,fig,d)=>BASE[d]&&!(meta.own?.[d]||[]).includes(id)?{flip:true,...load(id,fig,BASE[d])}:load(id,fig,d);
function compose(fig,d,set,f){return composeCore(W,H,bands,sources(set,meta.gear),(s,band)=>{const sh=sheet(s,fig,d),row=bands.indexOf(band),t=new Uint8ClampedArray(W*H*4);let any=false;
 for(let y=0;y<H;y++){const si=((row*H+y)*sh.width+f*W)*4;if(sh.flip)for(let x=0;x<W;x++)t.set(sh.data.subarray(si+(W-1-x)*4,si+(W-x)*4),(y*W+x)*4);else t.set(sh.data.subarray(si,si+W*4),y*W*4);}for(let i=3;i<t.length;i+=4)if(t[i]){any=true;break;}return any?t:null;});}
const SETS=(process.argv[4]||'ida:|ida:kutte,jeans,kabelbinderstiefel,dienstmuetze,flasche,koenigskette|ida:regenjacke,jeans,festivalstiefel,praktikantenausweis,topfdeckel|dieter:bierdeckelweste,fuchspfote,sigizange,schaerpe,dachsdeckel|dieter:kutte,jeans,festivalstiefel,giesskanne,bierbong')
 .split('|').map(s=>{const [fd,g]=s.split(':'),[fig,d='se']=fd.split('@');return {fig,d,set:g?g.split(','):[]};});
const FR=(process.argv[5]||'0,4,5,6,7,8').split(',').map(Number);
const BG=(process.argv[7]||'2a252c').match(/../g).map(h=>parseInt(h,16));
const pad=6,out=surface((W*S+pad)*FR.length+pad,(H*S+pad)*SETS.length+pad);
for(let i=0;i<out.data.length;i+=4)out.data.set([...BG,255],i);
SETS.forEach(({fig,d,set},r)=>FR.forEach((f,c)=>{const img=compose(fig,d,set,f),ox=pad+c*(W*S+pad),oy=pad+r*(H*S+pad),bob=frames[f].bob||0,rx=30-bob*1.2,ry=6-bob*.2;
 for(let y=0;y<H*S;y++)for(let x=0;x<W*S;x++){const px=x/S|0,py=y/S|0,s=(py*W+px)*4,dd=((oy+y)*out.width+ox+x)*4;
  if(img[s+3])out.data.set([img[s],img[s+1],img[s+2],255],dd);
  else{const u=(px+.5-W/2)/rx,v=(py+.5-(meta.ground-1))/ry;if(u*u+v*v<=1)out.data.set(BG.map(c=>c*.7|0).concat(255),dd);}}}));
writeFileSync(`${dir}/${process.argv[6]||'vorschau'}.png`,encodePng(out));console.log('vorschau',out.width+'×'+out.height);
