// Weltbild einer Anziehpuppe verkleinern (reine Pixelrechnung, ohne DOM): Flächenmittel → nächste Palettenfarbe → Kontur.
// Herausgelöst aus paperdoll-art.js (Handy-Messung 2026-09-27): rein und testbar (tests/perf-handy.test.mjs), vorbereitet für einen
// späteren Rechen-Worker – dann läuft derselbe Code dort und liefert dasselbe Ergebnis.

/** Einraster auf eine Palette ([[r,g,b],…]) mit eigenem Zwischenspeicher je Einraster. */
export function makeSnap(pal){const cache=new Map();
 return (r,g,b)=>{const key=(r>>2)<<12|(g>>2)<<6|(b>>2);let c=cache.get(key);if(c)return c;let bd=1e18;
  for(const q of pal){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}cache.set(key,c);return c;};}
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
