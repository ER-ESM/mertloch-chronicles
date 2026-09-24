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
// Kachel = W×H-Feld (Werkzeug) oder Zuschnitt {data,x,y,w,h} auf den Inhalt (Laufzeit, paperdoll-art.js): dann laufen die Schleifen nur
// über die deckenden Pixel des Zuschnitts – gleiches Ergebnis, ein Bruchteil der Arbeit.
export function composeCore(W,H,bands,srcs,tile){const out=new Uint8ClampedArray(W*H*4),dark=new Uint8Array(W*H),swap=headSwap(srcs);let bx0=W,by0=H,bx1=-1,by1=-1;
 for(const band of bands)for(const s of srcs){if(swap&&band==='kopf'&&(s==='koerper'||s==='dutt'))continue;const t=tile(s,band);if(!t)continue;
  const crop=!!t.data,td=crop?t.data:t,ox=crop?t.x:0,oy=crop?t.y:0,tw=crop?t.w:W,th=crop?t.h:H;if(ox<bx0)bx0=ox;if(oy<by0)by0=oy;if(ox+tw-1>bx1)bx1=ox+tw-1;if(oy+th-1>by1)by1=oy+th-1;
  // Kontaktschatten: Versätze in SH sind nie negativ, daher genügt die Prüfung gegen rechts/unten im Zuschnitt
  for(let yy=0;yy<th;yy++)for(let xx=0;xx<tw;xx++){if(!td[(yy*tw+xx)*4+3])continue;const x=xx+ox,y=yy+oy;
   for(let q=0;q<SH.length;q++){const dx=SH[q][0],dy=SH[q][1],X=x+dx,Y=y+dy;if(X>=W||Y>=H)continue;const ax=xx+dx,ay=yy+dy;if(ax<tw&&ay<th&&td[(ay*tw+ax)*4+3])continue;const j=Y*W+X;if(!out[j*4+3]||dark[j])continue;
    dark[j]=1;const sc=SHADE&&SHADE[out[j*4]<<16|out[j*4+1]<<8|out[j*4+2]];if(sc){out[j*4]=sc[0];out[j*4+1]=sc[1];out[j*4+2]=sc[2];}else{out[j*4]*=.8;out[j*4+1]*=.75;out[j*4+2]*=.84;}}}
  for(let yy=0;yy<th;yy++)for(let xx=0;xx<tw;xx++){const si=(yy*tw+xx)*4;if(!td[si+3])continue;const i=(yy+oy)*W+xx+ox;out[i*4]=td[si];out[i*4+1]=td[si+1];out[i*4+2]=td[si+2];out[i*4+3]=255;dark[i]=0;}}
 // Kontur nur innerhalb der Hülle aller Kacheln (bei großer Leinwand der größte Teil der Arbeit gespart); Hülle geht als out.box mit.
 if(bx1<0){out.box={x0:0,y0:0,x1:-1,y1:-1};return out;}
 const sil=[],T=[44,32,34];for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(!out[i*4+3])continue;
  const r=x+1>=W||!out[(i+1)*4+3],b=y+1>=H||!out[(i+W)*4+3],l=x<1||!out[(i-1)*4+3],t=y<1||!out[(i-W)*4+3];if(r||b)sil.push([i,.42]);else if(l||t)sil.push([i,.6]);}
 for(const [i,f] of sil)for(let c=0;c<3;c++)out[i*4+c]=out[i*4+c]*f+T[c]*(1-f)*.55;
 out.box={x0:bx0,y0:by0,x1:bx1,y1:by1};return out;}
