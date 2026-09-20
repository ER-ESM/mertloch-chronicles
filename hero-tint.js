// Helden-Aussehen ohne neue Zeichnungen (E-38): Hautton und Haarfarbe werden zur Laufzeit je Körperbild umgefärbt und
// zwischengespeichert. Haut erkennt man bei allen drei Körpern am Farbton (19–36°, kräftig gesättigt, mittlere Helligkeit);
// Haare am Kopf-Ankerpunkt des Bildes: dunkle Pixel (Kräftig, Drahtig) bzw. die gedeckten Orange-Töne (Schwungvoll) im Umkreis
// des Kopfes. Helligkeitsverlauf und Konturen bleiben erhalten – es wird nur Farbton/Sättigung ersetzt und die Helligkeit skaliert.
export const SKIN_TONES=[{id:'hell',name:'Hell',h:null},{id:'mittel',name:'Mittel',h:26,s:.5,m:.9},{id:'gebraeunt',name:'Gebräunt',h:23,s:.52,m:.74},{id:'dunkel',name:'Dunkel',h:20,s:.46,m:.5}]; // m = Helligkeitsfaktor gegenüber dem gezeichneten Hautton
export const HAIR_COLORS=[{id:'natur',name:'Natur',h:null},{id:'schwarz',name:'Schwarz',h:230,s:.12,l:.16},{id:'braun',name:'Braun',h:24,s:.45,l:.3},{id:'blond',name:'Blond',h:44,s:.62,l:.62},{id:'rot',name:'Rot',h:14,s:.72,l:.42},{id:'grau',name:'Grau',h:210,s:.06,l:.62},{id:'blau',name:'Blau',h:205,s:.6,l:.45}];
export const DEFAULT_TINT=Object.freeze({skin:'hell',hair:'natur'});
/** Beliebige Eingabe → gültige Auswahl. */
export function normalizeTint(t){return {skin:SKIN_TONES.some(x=>x.id===t?.skin)?t.skin:'hell',hair:HAIR_COLORS.some(x=>x.id===t?.hair)?t.hair:'natur'};}
export const tintKey=t=>{const n=normalizeTint(t);return n.skin==='hell'&&n.hair==='natur'?'':n.skin+'.'+n.hair;};
export const parseTintKey=k=>{const [skin,hair]=String(k||'').split('.');return normalizeTint({skin,hair});};

export function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
export function hslToRgb(h,s,l){h=((h%360)+360)%360/360;if(!s){const v=Math.round(l*255);return [v,v,v];}const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return [Math.round(f(h+1/3)*255),Math.round(f(h)*255),Math.round(f(h-1/3)*255)];}
/** 'skin' | 'hair' | null für ein Pixel. nearHead: liegt es im Kopfbereich? blondBody: Körper „Schwungvoll“ (helles Haar). */
export function classifyPixel(r,g,b,nearHead,blondBody,aboveBrow=false,beside=false){
 const [h,s,l]=rgbToHsl(r,g,b);
 if(nearHead){if(blondBody){if((aboveBrow||beside)&&h>=12&&h<=50&&s>=.3&&l>=.28&&l<.93)return 'hair'; // helle Strähnen und Dutt liegen über der Stirn
  if(h>=12&&h<=42&&s>=.35&&l>=.28&&l<.5)return 'hair';}else if(l>=.1&&l<.37&&s<.62&&(h<60||h>330||s<.2))return 'hair';}
 // Haut: kräftig gesättigt; die beigen Schatten der weißen Unterwäsche (Sättigung ≤ .51 bei Helligkeit ≥ .74) bleiben draußen
 if(h>=14&&h<=38&&l>=.34&&l<=.76&&(s>=.54||(l<.62&&s>=.42)))return 'skin';
 return null;
}
/** Färbt ImageData in place. head: {x,y} in Bildpunkten, radius in Bildpunkten. */
export function tintPixels(data,width,height,head,radius,tint,blondBody){
 const t=normalizeTint(tint),skin=SKIN_TONES.find(x=>x.id===t.skin),hair=HAIR_COLORS.find(x=>x.id===t.hair);if(skin.h==null&&hair.h==null)return 0;
 let changed=0;const r2=radius*radius,kinds=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(data[i+3]<40)continue;
  const dx=x-head.x,dy=y-head.y,near=dx*dx+dy*dy<=r2,kind=classifyPixel(data[i],data[i+1],data[i+2],near,blondBody,y<head.brow,Math.abs(dx)>head.side);if(!kind)continue;kinds[y*width+x]=kind==='skin'?1:2;
  const [,,l]=rgbToHsl(data[i],data[i+1],data[i+2]);let out=null;
  if(kind==='skin'&&skin.h!=null)out=hslToRgb(skin.h,skin.s,Math.max(.05,Math.min(.95,l*skin.m)));
  else if(kind==='hair'&&hair.h!=null){const base=blondBody?.52:.22;out=hslToRgb(hair.h,hair.s,Math.max(.04,Math.min(.92,l*hair.l/base)));}
  if(out){data[i]=out[0];data[i+1]=out[1];data[i+2]=out[2];changed++;}
 }
 // Glanzlichter der Haut: farblich dem cremefarbenen Stoff gleich, aber von Haut umgeben. Ein heller warmer Pixel wird Haut,
 // wenn in seinem 7×7-Umfeld deutlich mehr Hautpixel liegen als helle Nicht-Haut-Pixel (Stoff).
 if(skin.h!=null){const todo=[];for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=y*width+x;if(kinds[p])continue;const i=p*4;if(data[i+3]<40)continue;const [h,s2,l]=rgbToHsl(data[i],data[i+1],data[i+2]);if(!(h>=14&&h<=42&&s2>=.5&&l>.76&&l<=.9))continue;let sk=0,cl=0;for(let yy=Math.max(0,y-3);yy<=Math.min(height-1,y+3);yy++)for(let xx=Math.max(0,x-3);xx<=Math.min(width-1,x+3);xx++){const q=yy*width+xx;if(kinds[q]===1)sk++;else if(!kinds[q]){const j=q*4;if(data[j+3]>=40&&rgbToHsl(data[j],data[j+1],data[j+2])[2]>.76)cl++;}}if(sk>=14&&sk>cl*1.6)todo.push([i,l]);}
  for(const [i,l] of todo){const out=hslToRgb(skin.h,skin.s,Math.max(.05,Math.min(.95,l*skin.m)));data[i]=out[0];data[i+1]=out[1];data[i+2]=out[2];changed++;}}
 return changed;
}
const cache=new Map();
/** Umgefärbtes Körperbild (Canvas, 192·q Kantenlänge) für genau dieses Bild; null = unverändert zeichnen. */
export function tintedFrame(sel,tint,bodyId){
 const key=tintKey(tint);if(!key||typeof document==='undefined')return null;
 const q=sel.resolution||1,f=sel.frame,id=(sel.key||'')+'@'+f.x+':'+f.y+'|'+q+'|'+key+'|'+(sel.image?.src||'');let hit=cache.get(id);if(hit)return hit;
 try{const c=document.createElement('canvas');c.width=c.height=192*q;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(sel.image,f.x*q,f.y*q,192*q,192*q,0,0,192*q,192*q);
  const img=ctx.getImageData(0,0,c.width,c.height),head=f.sockets?.head||{x:96,y:60};tintPixels(img.data,c.width,c.height,{x:head.x*q,y:(head.y+6)*q,brow:(head.y+3)*q,side:12*q},32*q,tint,/^(anni|baerbel)/.test(bodyId||''));ctx.putImageData(img,0,0);
  if(cache.size>400)cache.clear();cache.set(id,c);return c;}catch{return null;}
}
