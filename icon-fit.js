// Motiv randfüllend einpassen (Feinschliff 2026-09-23): Atlaszellen und UI-Symbole tragen viel leeren Rand, in Rahmen wirkten sie winzig.
/** Die Atlaszellen tragen viel Rand; Umriss des Motivs suchen (Pixel, die weder durchsichtig noch Grundfarbe sind) und auf ~92 % der Fläche vergrößern. */
let scratchCanvas=null;
function scratch(w,h){const cv=scratchCanvas||=document.createElement('canvas');if(cv.width<w)cv.width=w;if(cv.height<h)cv.height=h;cv.ctx||=cv.getContext('2d',{willReadFrequently:true});return cv;}
export function fitMotif(canvas,fill=.92){
 const W=canvas.width,H=canvas.height;if(!W||!H||typeof canvas.getContext!=='function')return;const c=canvas.getContext('2d');/* Lesen über eine gemeinsame Hilfsfläche mit willReadFrequently – die Zielfläche hat ihren Kontext schon ohne (Browser-Warnung) */const R=scratch(W,H);R.ctx.clearRect(0,0,W,H);R.ctx.drawImage(canvas,0,0);let d;try{d=R.ctx.getImageData(0,0,W,H).data;}catch{return;}
 const bg=[0x26,0x3d,0x32],isBg=i=>d[i+3]<40||Math.abs(d[i]-bg[0])+Math.abs(d[i+1]-bg[1])+Math.abs(d[i+2]-bg[2])<18;let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!isBg((y*W+x)*4)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return;const w=x1-x0+1,h=y1-y0+1,k=Math.min(W*fill/w,H*fill/h);if(k<1.12)return;
 const t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(canvas,x0,y0,w,h,0,0,w,h);
 const opaque=d[3]>200;c.clearRect(0,0,W,H);if(opaque){c.fillStyle='#263d32';c.fillRect(0,0,W,H);}c.imageSmoothingEnabled=false;const dw=Math.round(w*k),dh=Math.round(h*k);c.drawImage(t,0,0,w,h,Math.round((W-dw)/2),Math.round((H-dh)/2),dw,dh);
}
