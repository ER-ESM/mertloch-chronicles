// Weltbild einer Anziehpuppe verkleinern (reine Pixelrechnung, ohne DOM): Flächenmittel → nächste Palettenfarbe → Kontur.
// Herausgelöst aus paperdoll-art.js (Handy-Messung 2026-09-27): rein und testbar (tests/perf-handy.test.mjs), vorbereitet für einen
// späteren Rechen-Worker – dann läuft derselbe Code dort und liefert dasselbe Ergebnis.

/**
 * Einraster auf eine Palette ([[r,g,b],…]): nächste Palettenfarbe nach dem gewichteten Abstand – genau wie der volle Durchlauf in
 * tools/paperdoll/waffen-vorschau.mjs (bei Gleichstand gewinnt der frühere Paletteneintrag).
 * Runde 2 (27.09.2026): unabhängig von der Reihenfolge. Vorher merkte sich ein Zwischenspeicher je 4er-Farbwürfel die Antwort für die
 * ERSTE Farbe, die hineinfiel – ob ein Randpixel so oder so einrastete, hing davon ab, welche Figur zuerst zusammengesetzt wurde (gemessen
 * ~1 % der Pixel eines Bildes), und Hauptfaden und Rechen-Worker hätten verschiedene Bilder geliefert. Jetzt: Farbraum in 8er-Würfel; je
 * Würfel einmal die Paletteneinträge, die dort überhaupt am nächsten sein können (untere Schranke ≤ kleinste obere Schranke), danach nur
 * diese wenigen prüfen.
 */
export function makeSnap(pal){const n=pal.length,cells=new Map(),S=8;
 const candidates=(ci,cj,ck)=>{const r0=ci*S,r1=r0+S,g0=cj*S,g1=g0+S,b0=ck*S,b1=b0+S,mins=new Float64Array(n);let bestMax=Infinity;
  for(let i=0;i<n;i++){const q=pal[i];
   const drn=q[0]<r0?r0-q[0]:q[0]>r1?q[0]-r1:0,drx=Math.max(Math.abs(r0-q[0]),Math.abs(r1-q[0])),dgn=q[1]<g0?g0-q[1]:q[1]>g1?q[1]-g1:0,dgx=Math.max(Math.abs(g0-q[1]),Math.abs(g1-q[1])),dbn=q[2]<b0?b0-q[2]:q[2]>b1?q[2]-b1:0,dbx=Math.max(Math.abs(b0-q[2]),Math.abs(b1-q[2]));
   const wrn=2+(r0+q[0])/512,wrx=2+(r1+q[0])/512,wbn=2+(255-(r1+q[0])/2)/256,wbx=2+(255-(r0+q[0])/2)/256;
   mins[i]=Math.min(wrn,wrx)*drn*drn+4*dgn*dgn+Math.min(wbn,wbx)*dbn*dbn;const mx=Math.max(wrn,wrx)*drx*drx+4*dgx*dgx+Math.max(wbn,wbx)*dbx*dbx;if(mx<bestMax)bestMax=mx;}
  const lim=bestMax*(1+1e-9)+1e-9,out=[];for(let i=0;i<n;i++)if(mins[i]<=lim)out.push(i);return Int32Array.from(out);};
 const cell=v=>Math.max(0,Math.min(31,Math.floor(v/S)));
 return (r,g,b)=>{const ci=cell(r),cj=cell(g),ck=cell(b),key=ci<<10|cj<<5|ck;let list=cells.get(key);if(!list){list=candidates(ci,cj,ck);cells.set(key,list);}
  let bd=Infinity,best=list[0];for(let t=0;t<list.length;t++){const i=list[t],q=pal[i],dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;best=i;}}
  return pal[best];};}
/** Palette mit umgefärbten Treppen (Haut/Haar): `m` Farbe (0xRRGGBB) → [r,g,b]. */
export const tintPalette=(pal,m)=>pal.map(q=>m.get(q[0]<<16|q[1]<<8|q[2])||q);

/**
 * px: zusammengesetztes Feld W×H (composeCore), box: Inhaltshülle, k: Maßstab (<1), m: Umfärbung, pick: Einraster.
 * Rückgabe {w,h,data} (Uint8ClampedArray w×h×4).
 */
export function shrinkPixels(px,box,W,H,k,m,pick){
 const w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k)),o=new Uint8ClampedArray(w*h*4);
 // nur Ausgabepixel über der Inhaltshülle (box) – bei großer Leinwand bleibt der Rest leer
 const bx=box||{x0:0,y0:0,x1:W-1,y1:H-1},oy0=Math.max(0,Math.floor(bx.y0*k)),oy1=Math.min(h,Math.ceil((bx.y1+1)*k)),ox0=Math.max(0,Math.floor(bx.x0*k)),ox1=Math.min(w,Math.ceil((bx.x1+1)*k));
 for(let y=oy0;y<oy1;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=ox0;x<ox1;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0,n=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4;if(!px[i+3])continue;const al=px[i+3]/255,rc=m.size?m.get(px[i]<<16|px[i+1]<<8|px[i+2]):null;
   if(rc){r+=rc[0]*al;g+=rc[1]*al;b+=rc[2]*al;}else{r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;}a+=al;n++;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=pick(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 // Kontur im selben Durchgang (Prüfung liest nur Deckkraft, Nachdunkeln schreibt nur Farbe) – ohne Zwischenlisten und Hilfsarrays je Pixel.
 const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
 for(let y=oy0;y<oy1;y++)for(let x=ox0;x<ox1;x++){const i=(y*w+x)*4;if(!o[i+3])continue;let f;
  if(open(x+1,y)||open(x,y+1))f=.45;else if(open(x-1,y)||open(x,y-1))f=.62;else continue;
  o[i]=o[i]*f+44*(1-f)*.55;o[i+1]=o[i+1]*f+32*(1-f)*.55;o[i+2]=o[i+2]*f+34*(1-f)*.55;}
 return {w,h,data:o};
}
