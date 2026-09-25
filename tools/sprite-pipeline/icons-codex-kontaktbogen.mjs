// Vorschau-Kontaktbogen für den Codex-Lauf 2026-09-26 (docs/ICONS-CODEX-2026-09-26.md): vorher (git HEAD) gegen nachher
// (Arbeitsstand) je Kachel-Symbol, dazu die Talent-Atlanten von Schorsch und Käthe neben dem Leitbild talents-dieter.
//   node tools/sprite-pipeline/icons-codex-kontaktbogen.mjs [--out=D:/Dev/_review/icons-codex]
// Schreibt kontaktbogen-kniffe.png (je Symbol: vorher ×3 | nachher ×3 | nachher in 48 px ×3), kontaktbogen-talente.png
// (Atlanten ×2) und index.html mit Namen. Nur lesen im Worktree, schreiben nur unter --out.
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface} from './png.mjs';
import {resample} from './precision-resample.mjs';
import {FILES} from './icons-codex-jobs.mjs';

const root=new URL('../../',import.meta.url),P=p=>new URL(p,root),BG=[30,34,40];
const headPng=p=>{const r=spawnSync('git',['show','HEAD:'+p],{cwd:fileURLToPath(root),maxBuffer:64*1024*1024});return r.status===0&&r.stdout?.length?r.stdout:null;};
const workPng=p=>existsSync(P(p))?readFileSync(P(p)):null;
function paste(dst,im,ox,oy,k){if(!im)return;for(let y=0;y<im.height*k;y++)for(let x=0;x<im.width*k;x++){const i=((y/k|0)*im.width+(x/k|0))*4,a=im.data[i+3]/255;if(!a)continue;const j=((oy+y)*dst.width+ox+x)*4;for(let c=0;c<3;c++)dst.data[j+c]=Math.round(im.data[i+c]*a+dst.data[j+c]*(1-a));}}
function canvas(w,h){const o=surface(w,h);for(let i=0;i<o.data.length;i+=4){o.data[i]=BG[0];o.data[i+1]=BG[1];o.data[i+2]=BG[2];o.data[i+3]=255;}return o;}
function at48(im){if(!im)return null;const o=surface(48,48);resample(im,o,{x:0,y:0,w:im.width,h:im.height},{x:0,y:0},48/im.width);return o;}

export function writeContactSheets({out='D:/Dev/_review/icons-codex',dryRun=false,done=[]}={}){
 mkdirSync(out+'/bilder',{recursive:true});const written=[];
 // Kacheln: Spez-Symbole, 28 Kniffe, 4 dichte Kniffe
 const ids=[FILES.spez,FILES.e71,FILES.dicht].flatMap(f=>JSON.parse(readFileSync(P(f),'utf8')).map(j=>({id:j.id,source:j.output,group:f.split('/').pop().replace(/-2026.*|-jobs.json/g,'')})));
 const cols=4,cw=64*3*3+4*8,ch=64*3+8,sheet=canvas(cols*cw,Math.ceil(ids.length/cols)*ch),rows=[];
 ids.forEach((e,n)=>{const rt='assets/precision/runtime/skills/'+e.id+'.png',b=headPng(rt),a=workPng(rt);
  const before=b&&decodePng(b),after=a&&decodePng(a),ox=(n%cols)*cw+4,oy=Math.floor(n/cols)*ch+4;
  paste(sheet,before,ox,oy,3);paste(sheet,after,ox+64*3+8,oy,3);paste(sheet,at48(after),ox+(64*3+8)*2+24,oy+24,3);
  if(b)writeFileSync(`${out}/bilder/${e.id}-vorher.png`,b);if(a)writeFileSync(`${out}/bilder/${e.id}-nachher.png`,a);
  rows.push({...e,before:!!b,after:!!a,changed:!!(a&&(!b||!Buffer.from(a).equals(Buffer.from(b)))),generated:done.includes(e.id),original:existsSync(P(e.source))});});
 writeFileSync(out+'/kontaktbogen-kniffe.png',encodePng(sheet));written.push(out+'/kontaktbogen-kniffe.png');
 // Talente: Leitbild Dieter, dann Schorsch und Käthe, sofern ihr Atlas schon gebaut ist
 const atl=['dieter','schorsch','kaethe'].map(c=>({c,p:'assets/content-art/e32/runtime/talents-'+c+'.png'})).filter(x=>existsSync(P(x.p)));
 const ims=atl.map(x=>decodePng(readFileSync(P(x.p)))),tal=canvas(640*2+16,ims.length*(576*2+16));
 ims.forEach((im,i)=>{paste(tal,im,8,8+i*(576*2+16),2);writeFileSync(`${out}/bilder/talents-${atl[i].c}.png`,readFileSync(P(atl[i].p)));});
 writeFileSync(out+'/kontaktbogen-talente.png',encodePng(tal));written.push(out+'/kontaktbogen-talente.png');
 // index.html mit Namen
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const html=`<!doctype html><meta charset="utf-8"><title>Icons Codex ${dryRun?'Trockenlauf':'Lauf'}</title>
<style>body{background:#1e2228;color:#dde;font:14px system-ui;margin:16px}img{image-rendering:pixelated;background:#2a2f36}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:10px}.c{background:#262b33;padding:8px;border-radius:6px}
.c b{display:block;margin-bottom:4px}.n{color:#9ab}.neu{outline:2px solid #e88830}</style>
<h1>Icons Codex – ${dryRun?'Trockenlauf (Ist-Stand, nichts erzeugt)':'Lauf'} ${esc(new Date().toLocaleString('de-DE',{timeZone:'Europe/Berlin'}))}</h1>
<p>Je Symbol: vorher (git HEAD) · nachher (Arbeitsstand) · nachher in 48 px. Orange umrandet = in diesem Lauf erzeugt. Quellen im Worktree ${esc(fileURLToPath(root))}.</p>
<h2>Kacheln (${ids.length})</h2><div class="g">${rows.map(r=>`<div class="c${r.generated?' neu':''}"><b>${esc(r.id)} <span class="n">${esc(r.group)}${r.original?'':' · Original fehlt noch'}</span></b>
${r.before?`<img src="bilder/${r.id}-vorher.png" width="192" height="192">`:'<span style="display:inline-block;width:192px">kein Vorher</span>'}
${r.after?`<img src="bilder/${r.id}-nachher.png" width="192" height="192"> <img src="bilder/${r.id}-nachher.png" width="48" height="48">`:'kein Nachher'}</div>`).join('\n')}</div>
<h2>Talent-Atlanten</h2>${atl.map(x=>`<p><b>${x.c}</b>${x.c==='dieter'?' (Leitbild)':''}<br><img src="bilder/talents-${x.c}.png" width="1280"></p>`).join('\n')}
${atl.length<3?'<p>Schorsch/Käthe: noch kein Atlas (Bögen fehlen).</p>':''}`;
 writeFileSync(out+'/index.html',html);written.push(out+'/index.html');
 return written;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){const o=process.argv.find(a=>a.startsWith('--out='));console.log(writeContactSheets({out:o?o.slice(6):undefined}).join('\n'));}
