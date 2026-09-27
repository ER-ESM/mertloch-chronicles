// Zusammensetz-Kern (Vorschau in Node und Artefakt im Browser nutzen dieselbe Fassung).
// tile(src,band) liefert RGBA-Daten W×H oder null. Jede Ebene wirft einen Kontaktschatten nach rechts unten auf das,
// was schon darunter liegt (Licht von links oben); am Ende wird die Schattenseite der Silhouette nachgedunkelt.
export const ORDER=['legs','feet','body','waist','wrists','shoulders','neck','charm','trinket','head','weapon','ranged','offhand','ring','hands'];
export function sources(set,gear){const items=[...set].sort((a,b)=>ORDER.indexOf(gear[a].slot)-ORDER.indexOf(gear[b].slot));
 return ['koerper',...(items.some(i=>gear[i].slot==='head'&&!gear[i].dutt||i.startsWith('frisur-'))?[]:['dutt']),...items];}
/* Kopfteile mit dutt:true (Katalog, z. B. Annis Sonnenbrille im Haar) lassen den Dutt stehen; alle anderen Kopfteile verdrängen ihn. */
/**
 * Glücksbringer dürfen sich nie überdecken (Katalog cat.gluecksbringer, gebaut von tools/paperdoll/puppe.mjs):
 *  fassungen[id] = [Stammfassung, Ausweichfassungen …] – z. B. `_gegen` (andere Körperseite) oder `_guertel` (am Gürtel statt am Hals);
 *  deckung['a>b'] = gemessene Deckung in Leinwandpixeln, wenn a vor b gezeichnet wird (nur Werte über der Toleranz; fehlt = deckungsfrei).
 * list = getragene Glücksbringer (Stammquellen) in Rangfolge (Glücksbringer I vor II). Gewählt wird die erste deckungsfreie Anordnung:
 * I behält seinen Platz, solange II ausweichen kann, sonst weicht I aus; je Anordnung beide Zeichenfolgen. Ohne deckungsfreie Anordnung
 * gilt die kleinste Deckung. Zweimal dieselbe Fassung deckt sich immer (zwei gleiche Zufalls-Andenken hängen an beiden Hüften).
 * Rückgabe: gewählte Fassungen in Zeichenfolge.
 */
export function gluecksbringerWahl(list,gb){if(!gb?.fassungen||list.length<2)return [...list];
 const opts=list.map(s=>gb.fassungen[s]||[s]),dk=gb.deckung||{};
 const score=arr=>{let m=0;for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const d=arr[i]===arr[j]?Infinity:dk[arr[i]+'>'+arr[j]]||0;if(d>m)m=d;}return m;};
 let best=null,bs=Infinity;const idx=opts.map(()=>0);
 for(;;){const pick=idx.map((k,i)=>opts[i][k]);for(const arr of pick.length===2?[pick,[pick[1],pick[0]]]:[pick]){const s=score(arr);if(!s)return arr;if(!best||s<bs){bs=s;best=arr;}}
  let i=idx.length-1;while(i>=0&&++idx[i]>=opts[i].length){idx[i]=0;i--;}if(i<0)break;}
 return best;}
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
 // Handy-Messung 2026-09-27: Kontur direkt im selben Durchgang – die Prüfung liest nur die Deckkraft, das Nachdunkeln schreibt nur Farbe;
 // vorher sammelte eine Liste je Konturpixel ein eigenes Array (Tausende je Zusammensetzen, Futter für die Speicherbereinigung).
 for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(!out[i*4+3])continue;
  const r=x+1>=W||!out[(i+1)*4+3],b=y+1>=H||!out[(i+W)*4+3];let f=0;if(r||b)f=.42;else if(x<1||!out[(i-1)*4+3]||y<1||!out[(i-W)*4+3])f=.6;else continue;
  const o=i*4;/* gleiche Rechenfolge wie bisher: T*(1-f)*.55 */out[o]=out[o]*f+44*(1-f)*.55;out[o+1]=out[o+1]*f+32*(1-f)*.55;out[o+2]=out[o+2]*f+34*(1-f)*.55;}
 out.box={x0:bx0,y0:by0,x1:bx1,y1:by1};return out;}
