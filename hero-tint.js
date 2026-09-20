// Helden-Aussehen ohne neue Zeichnungen (E-38): Hautton und Haarfarbe werden zur Laufzeit je Körperbild umgefärbt und
// zwischengespeichert. Haut erkennt man bei allen drei Körpern am Farbton (19–36°, kräftig gesättigt, mittlere Helligkeit);
// Haare am Kopf-Ankerpunkt des Bildes: dunkle Pixel (Kräftig, Drahtig) bzw. die gedeckten Orange-Töne (Schwungvoll) im Umkreis
// des Kopfes. Helligkeitsverlauf und Konturen bleiben erhalten – es wird nur Farbton/Sättigung ersetzt und die Helligkeit skaliert.
export const SKIN_TONES=[{id:'hell',name:'Hell',h:null},{id:'mittel',name:'Mittel',h:26,s:.5,m:.9},{id:'gebraeunt',name:'Gebräunt',h:23,s:.52,m:.74},{id:'dunkel',name:'Dunkel',h:20,s:.46,m:.5}]; // m = Helligkeitsfaktor gegenüber dem gezeichneten Hautton
export const HAIR_COLORS=[{id:'natur',name:'Natur',h:null},{id:'schwarz',name:'Schwarz',h:230,s:.12,l:.16},{id:'braun',name:'Braun',h:24,s:.45,l:.3},{id:'blond',name:'Blond',h:44,s:.62,l:.62},{id:'rot',name:'Rot',h:14,s:.72,l:.42},{id:'grau',name:'Grau',h:210,s:.06,l:.62},{id:'blau',name:'Blau',h:205,s:.6,l:.45}];
/** Kopf-Accessoires: prozedural am Kopf-Ankerpunkt gezeichnet (keine Bilddateien). eye/brow = Abstand von der Kopf-Oberkante je Körper. */
export const FACE_ITEMS=[{id:'ohne',name:'Ohne'},{id:'brille',name:'Brille'},{id:'sonnenbrille',name:'Sonnenbrille'},{id:'stirnband',name:'Stirnband'}];
const FACE_GEOMETRY={dieter:{eye:13,brow:8,half:9,crown:1},anni:{eye:21,brow:15,half:8,crown:9},baerbel:{eye:21,brow:15,half:8,crown:9},kevin:{eye:16,brow:10,half:8,crown:2}}; // crown = Scheitel unter der Bild-Oberkante (beim Dutt deutlich tiefer)
/** Gezeichnete Ebenen (geformte Pixel, keine umgedeuteten): Bart folgt dem Kiefer und bleibt auf der Figur; der Irokese sitzt auf dem Scheitel. */
/** bodies: nur für diese Körper angeboten (dort überzeugt das Ergebnis am Bild); ohne Angabe für alle. */
export const BEARDS=[{id:'natur',name:'Wie gezeichnet'},{id:'stoppeln',name:'Stoppeln'},{id:'kinnbart',name:'Kinnbart'},{id:'vollbart',name:'Vollbart'}];
export const HAIR_STYLES=[{id:'natur',name:'Wie gezeichnet'},{id:'irokese',name:'Irokese'}];
export const offeredFor=(list,body)=>list.filter(o=>!o.bodies||o.bodies.includes(body));
const NATURAL_HAIR={dieter:[62,44,38],anni:[196,120,56],baerbel:[196,120,56],kevin:[58,42,34]};
export const DEFAULT_TINT=Object.freeze({skin:'hell',hair:'natur',face:'ohne',style:'natur',beard:'natur'});
/** Beliebige Eingabe → gültige Auswahl. */
export function normalizeTint(t){return {skin:SKIN_TONES.some(x=>x.id===t?.skin)?t.skin:'hell',hair:HAIR_COLORS.some(x=>x.id===t?.hair)?t.hair:'natur',face:FACE_ITEMS.some(x=>x.id===t?.face)?t.face:'ohne',style:HAIR_STYLES.some(x=>x.id===t?.style)?t.style:'natur',beard:BEARDS.some(x=>x.id===t?.beard)?t.beard:'natur'};}
/** Schlüssel nur für die Farben (Bild-Zwischenspeicher). */
export const tintKey=t=>{const n=normalizeTint(t);return n.skin==='hell'&&n.hair==='natur'&&n.beard==='natur'?'':n.skin+'.'+n.hair+'.'+n.beard;};
/** Schlüssel fürs Netz und für data-Attribute: Farben plus Accessoire. */
export const lookKey=t=>{const n=normalizeTint(t);return Object.keys(DEFAULT_TINT).every(k=>n[k]===DEFAULT_TINT[k])?'':[n.skin,n.hair,n.face,n.style,n.beard].join('.');};
export const parseTintKey=k=>{const [skin,hair,face,style,beard]=String(k||'').split('.');return normalizeTint({skin,hair,face,style,beard});};
/** Haarfarbe als RGB: gewählte Farbe oder die gezeichnete des Körpers. */
export function hairRgb(tint,bodyId){const h=HAIR_COLORS.find(x=>x.id===normalizeTint(tint).hair);return h?.h!=null?hslToRgb(h.h,h.s,h.l):NATURAL_HAIR[String(bodyId||'').replace(/-.*/,'')]||NATURAL_HAIR.kevin;}
const tone=(rgb,k)=>'rgb('+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v*k)))).join(',')+')';
/** Bart als geformte Ebene; ctx ist der Bild-Zwischenspeicher (nur dort, source-atop hält ihn auf der Figur). */
export function drawBeard(c,frame,bodyId,tint,q=1){
 const kind=normalizeTint(tint).beard;if(kind==='natur')return false;const dir=frame.direction||'se';if(dir[0]==='n')return false;
 const g=FACE_GEOMETRY[String(bodyId||'').replace(/-.*/,'')]||FACE_GEOMETRY.kevin,head=frame.sockets?.head;if(!head)return false;const side=dir[1]==='w'?-1:1,cx=Math.round(head.x)+side*2,ey=Math.round(head.y)+g.eye,rgb=hairRgb(tint,bodyId);
 c.save();c.scale(q,q);c.globalCompositeOperation='source-atop';
 const row=(y,from,to,k)=>{c.fillStyle=tone(rgb,k);c.fillRect(cx+from,ey+y,to-from+1,1);};
 if(kind==='stoppeln'){c.globalAlpha=.42;for(let y=5;y<=10;y++)for(let x=-g.half+2;x<=g.half-2;x++)if((x+y)%2===0&&!(y<=7&&Math.abs(x)<=1)){c.fillStyle=tone(rgb,.9);c.fillRect(cx+x,ey+y,1,1);}}
 else if(kind==='kinnbart'){row(7,-2,2,1.05);row(8,-3,3,1);row(9,-3,3,.9);row(10,-2,2,.8);row(11,-1,1,.7);c.clearRect?0:0;c.fillStyle=tone(rgb,1.1);c.fillRect(cx-3,ey+5,2,1);c.fillRect(cx+2,ey+5,2,1);}
 else{const w=g.half-2;row(4,-w-1,-w+1,1.1);row(4,w-1,w+1,1.1);row(5,-w-1,-2,1.1);row(5,2,w+1,1.1);row(6,-w-1,w+1,1.05);row(7,-w,-2,1);row(7,2,w,1);row(8,-w,w,.95);row(9,-w+1,w-1,.88);row(10,-w+2,w-2,.8);row(11,-w+3,w-3,.72);row(12,-2,2,.64);}
 c.restore();return true;
}
/** Irokese: Kamm auf dem Scheitel, in jeder Blickrichtung sichtbar (wird über der Figur gezeichnet). */
export function drawHairStyle(c,frame,bodyId,tint){
 if(normalizeTint(tint).style!=='irokese')return false;const head=frame.sockets?.head;if(!head)return false;const dir=frame.direction||'se',side=dir[1]==='w'?-1:1,g=FACE_GEOMETRY[String(bodyId||'').replace(/-.*/,'')]||FACE_GEOMETRY.kevin,x=Math.round(head.x)+(dir[0]==='n'?-side:side)*(g.crown>4?3:1),y=Math.round(head.y)+g.crown,rgb=hairRgb(tint,bodyId);
 const heights=[3,5,7,8,7,6,4];c.save();heights.forEach((h,i)=>{const px=x-3+i;c.fillStyle=tone(rgb,.7);c.fillRect(px,y-h+2,1,h+3);c.fillStyle=tone(rgb,i%2?1.15:.95);c.fillRect(px,y-h+3,1,h);});c.fillStyle='#14100e';heights.forEach((h,i)=>c.fillRect(x-3+i,y-h+1,1,1));c.restore();return true;
}
/** Zeichnet das Kopf-Accessoire im 192er-Bildraum. frame: Katalogbild (sockets.head, direction), bodyId: Körper. */
export function drawFaceItem(c,frame,bodyId,tint){
 const item=normalizeTint(tint).face;if(item==='ohne')return false;const g=FACE_GEOMETRY[String(bodyId).replace(/-.*/,'')]||FACE_GEOMETRY.kevin,head=frame.sockets?.head;if(!head)return false;
 const dir=frame.direction||'se',back=dir[0]==='n',side=dir[1]==='w'?-1:1,x=Math.round(head.x),y=Math.round(head.y);
 c.save();
 if(item==='stirnband'){const by=y+g.brow-3;c.fillStyle='#b8322a';c.fillRect(x-g.half,by,g.half*2,3);c.fillStyle='#7d1f1a';c.fillRect(x-g.half,by+2,g.half*2,1);if(back){c.fillStyle='#7d1f1a';c.fillRect(x-1,by,3,3);c.fillStyle='#b8322a';c.fillRect(x-2,by+3,2,5);c.fillRect(x+1,by+3,2,4);}}
 else if(!back){const ey=y+g.eye,cx=x+side*2,dark=item==='sonnenbrille';for(const dx of [-4,3]){const lx=cx+dx-1;c.fillStyle='#1b1f24';c.fillRect(lx-1,ey-2,6,5);c.fillStyle=dark?'#2d3a4a':'#cfe6f0';c.fillRect(lx,ey-1,4,3);if(dark){c.fillStyle='#6f8aa5';c.fillRect(lx,ey-1,2,1);}}c.fillStyle='#1b1f24';c.fillRect(cx-1,ey-1,2,1);c.fillRect(cx+(side>0?-8:6),ey-1,3,1);}
 c.restore();return true;
}

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
// Verworfen (zweimal am vergrößerten Bild geprüft, 21.09.2026): gezeichnetes Haar ERSETZEN – Glatze, Kurzhaar, Rasur. Ohne gezeichneten
// haarlosen Kopf bleiben Haarscherben, verformte Rückansichten und Maskengesichter. Das bleibt Auftrag an die Grafik.
const cache=new Map();
/** Umgefärbtes Körperbild (Canvas, 192·q Kantenlänge) für genau dieses Bild; null = unverändert zeichnen. */
export function tintedFrame(sel,tint,bodyId){
 const key=tintKey(tint);if(!key||typeof document==='undefined')return null;
 const q=sel.resolution||1,f=sel.frame,id=(sel.key||'')+'@'+f.x+':'+f.y+'|'+q+'|'+key+'|'+(sel.image?.src||'');let hit=cache.get(id);if(hit)return hit;
 try{const c=document.createElement('canvas');c.width=c.height=192*q;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(sel.image,f.x*q,f.y*q,192*q,192*q,0,0,192*q,192*q);
  const img=ctx.getImageData(0,0,c.width,c.height),head=f.sockets?.head||{x:96,y:60};tintPixels(img.data,c.width,c.height,{x:head.x*q,y:(head.y+6)*q,brow:(head.y+3)*q,side:12*q},32*q,tint,/^(anni|baerbel)/.test(bodyId||''));ctx.putImageData(img,0,0);drawBeard(ctx,f,bodyId,tint,q);
  if(cache.size>400)cache.clear();cache.set(id,c);return c;}catch{return null;}
}
