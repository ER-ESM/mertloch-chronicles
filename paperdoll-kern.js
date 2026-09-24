// Zusammensetz-Kern (Vorschau in Node und Artefakt im Browser nutzen dieselbe Fassung).
// tile(src,band) liefert RGBA-Daten W×H oder null. Jede Ebene wirft einen Kontaktschatten nach rechts unten auf das,
// was schon darunter liegt (Licht von links oben); am Ende wird die Schattenseite der Silhouette nachgedunkelt.
export const ORDER=['legs','feet','body','waist','wrists','shoulders','neck','charm','trinket','head','weapon','ranged','offhand','ring','hands'];
export function sources(set,gear){const items=[...set].sort((a,b)=>ORDER.indexOf(gear[a].slot)-ORDER.indexOf(gear[b].slot));
 return ['koerper',...(items.some(i=>gear[i].slot==='head'||i.startsWith('frisur-'))?[]:['dutt']),...items];}
/** Frisur-Quellen (frisur-*, tools/paperdoll/aussehen.mjs) bringen den ganzen umgebauten Kopf mit: Kopf des Körpers und Dutt entfallen. */
const headSwap=srcs=>srcs.some(s=>s.startsWith('frisur-'));
const SH=[[0,1],[1,1],[1,0],[0,2],[1,2]];
// Schattentabelle Farbe→nächstdunklere Rampenstufe (aus puppe.json); ohne Tabelle wird multipliziert
var SHADE=null;
export function useShade(m){SHADE=m||null;}
export function composeCore(W,H,bands,srcs,tile){const out=new Uint8ClampedArray(W*H*4),dark=new Uint8Array(W*H),swap=headSwap(srcs);
 for(const band of bands)for(const s of srcs){if(swap&&band==='kopf'&&(s==='koerper'||s==='dutt'))continue;const t=tile(s,band);if(!t)continue;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!t[i*4+3])continue;
   for(const [dx,dy] of SH){const X=x+dx,Y=y+dy;if(X>=W||Y>=H)continue;const j=Y*W+X;if(t[j*4+3]||!out[j*4+3]||dark[j])continue;
    dark[j]=1;const sc=SHADE&&SHADE[out[j*4]<<16|out[j*4+1]<<8|out[j*4+2]];if(sc){out[j*4]=sc[0];out[j*4+1]=sc[1];out[j*4+2]=sc[2];}else{out[j*4]*=.8;out[j*4+1]*=.75;out[j*4+2]*=.84;}}}
  for(let i=0;i<W*H;i++)if(t[i*4+3]){out[i*4]=t[i*4];out[i*4+1]=t[i*4+1];out[i*4+2]=t[i*4+2];out[i*4+3]=255;dark[i]=0;}}
 const sil=[],T=[44,32,34];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!out[i*4+3])continue;
  const r=x+1>=W||!out[(i+1)*4+3],b=y+1>=H||!out[(i+W)*4+3],l=x<1||!out[(i-1)*4+3],t=y<1||!out[(i-W)*4+3];if(r||b)sil.push([i,.42]);else if(l||t)sil.push([i,.6]);}
 for(const [i,f] of sil)for(let c=0;c<3;c++)out[i*4+c]=out[i*4+c]*f+T[c]*(1-f)*.55;
 return out;}
