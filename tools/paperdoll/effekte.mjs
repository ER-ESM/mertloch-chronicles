// Effekt-Kern für Ausrüstungsstufen (Vorschau in Node und Artefakt im Browser nutzen dieselbe Fassung).
// Zustandslos: alles hängt nur an Zeit t (ms), Bild f und Ankern – Node-Bögen und Browser zeigen dasselbe.
// Arbeitet auf 1×-RGBA-Puffern (W×H), damit jeder Effekt ein echtes Pixel bleibt. Stufe 0 Grabbeltisch, 1 Vereinsheim, 2 Legendär.
export const STUFEN=[
 {name:'Grabbeltisch',macht:14,set:['jeans','festivalstiefel','flasche']},
 {name:'Vereinsheim',macht:62,set:['dienstmuetze','kutte','jeans','kabelbinderstiefel','praktikantenausweis','sigizange']},
 {name:'Legendär',macht:238,set:['dachsdeckel','bierdeckelweste','jeans','fuchspfote','koenigskette','schaerpe','gansorden','tresenhammer']}];
const fr=v=>v-Math.floor(v),hs=(a,b=0,c=0)=>fr(Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453);
/** px: Sprite (W×H RGBA), o: {stufe,t,f,walk,A (Anker aller Bilder dieser Richtung),ground,shiny:Set,body:Set (Haut/Haar – nicht vergilben),gold:[[r,g,b]…]}. Liefert neuen Puffer. */
export function effekte(px,W,H,o){const out=new Uint8ClampedArray(W*H*4),{stufe,t,f,ground,gold,shiny}=o,a=o.A[f],G=gold;
 const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H,solid=i=>px[i*4+3]>0;
 // über transparente (oder halbtransparente) Stelle legen: Deckkraft addieren, Farbe mischen
 const put=(x,y,c,al=1)=>{x=Math.round(x);y=Math.round(y);if(!inb(x,y)||al<=0)return;const i=(y*W+x)*4,A0=out[i+3]/255,A1=Math.min(1,al),Ao=A1+A0*(1-A1);
  for(let k=0;k<3;k++)out[i+k]=(c[k]*A1+out[i+k]*A0*(1-A1))/(Ao||1);out[i+3]=Ao*255;};
 const star=(x,y,c,core,r=1)=>{put(x,y,core);for(let k=1;k<=r;k++){put(x-k,y,c,1-k*.25);put(x+k,y,c,1-k*.25);put(x,y-k,c,1-k*.25);put(x,y+k,c,1-k*.25);}};
 // Hüllrechteck der Figur (für Funken)
 let x0=W,x1=0,y0=H,y1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(solid(y*W+x)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 const cx=W/2,gy=ground-1,pulse=.5+.5*Math.sin(t/260);
 // Funken (Legendär): Zyklus je Teilchen, neue Startstelle je Zyklus; Hälfte hinter, Hälfte vor der Figur
 const embers=front=>{if(stufe<2)return;for(let k=0;k<34;k++){if((k%2===0)!==front)continue;const P=1300+hs(k)*900,off=hs(k,1)*P,cyc=Math.floor((t+off)/P),age=((t+off)%P)/P;
   const sx=x0-4+hs(k,cyc,2)*(x1-x0+8),sy=gy-2-hs(k,cyc,3)*(gy-y0)*.75,x=sx+Math.sin(age*6.3+k)*2.2,y=sy-age*30;
   const c=age<.3?G[0]:age<.65?G[1]:G[2];if(age>.8&&hs(k,cyc,Math.floor(t/60))<.5)continue;
   if(k%5===0&&age<.55)star(x,y,G[1],[255,252,230]);else{put(x,y,c,1-age*.5);if(k%3===0)put(x,y+1,G[2],.5-age*.4);}}};
 // Staub/Funken beim Aufsetzen (nur Laufen): Bild 5 = naher Fuß, Bild 9 = ferner Fuß
 const dust=()=>{if(!o.walk)return;const tw=t%840;for(const [cf,foot] of [[0,0],[4,1]]){const age=((tw-cf*105)%840+840)%840/420;if(age>=1)continue;
   const p=o.A[5+cf].f[foot];for(let k=0;k<6;k++){const s=(hs(k,cf)-.5)*2,x=p[0]+s*4+s*age*9,y=gy-1-hs(k,cf,1)*age*5-age*2;
    if(stufe===2)put(x,y,k%2?G[0]:G[1],1-age);else put(x,y,stufe?[186,160,120]:[150,122,88],(1-age)*.8);}}};
 // Fliege (Grabbeltisch): kreist um den Kopf, vorn oder hinten je nach Umlaufhälfte
 const fly=front=>{if(stufe!==0)return;const u=t/330,x=a.h[0]+14*Math.cos(u),y=a.h[1]-6+6*Math.sin(t/190);if((Math.sin(u)>0)!==front)return;
   const wf=Math.floor(t/40)%2;put(x,y,[20,14,22]);put(x+1,y,[20,14,22]);put(x,y+1,[36,26,34]);put(x+1,y+1,[20,14,22]);put(x,y,[120,140,120]);
   put(x-1+(wf?0:-1),y-1,[226,232,238],.9);put(x+2+(wf?0:1),y-1,[226,232,238],.9);
   for(let k=1;k<=3;k++){const u2=(t-k*70)/330;put(a.h[0]+14*Math.cos(u2),a.h[1]-6+6*Math.sin((t-k*70)/190),[200,200,190],.18-k*.04);}};
 // Glitzern an der Waffe (Vereinsheim selten, Legendär oft) und am Orden/der Kette
 const sparkles=()=>{if(stufe===1){const P=1150,age=(t%P)/P,cyc=Math.floor(t/P);if(age<.22)star(a.w[0]+(hs(cyc)-.5)*16,a.w[1]-6-hs(cyc,1)*18,[240,240,230],[255,255,255],age<.11?2:1);}
  if(stufe===2){for(let k=0;k<3;k++){const P=620+k*170,age=((t+k*230)%P)/P,cyc=Math.floor((t+k*230)/P);if(age>.45)continue;star(a.w[0]+(hs(k,cyc)-.5)*26,a.w[1]-4-hs(k,cyc,1)*26,G[0],[255,255,240],age<.2?2:1);}
   const P=1100,age=(t%P)/P;if(age<.3){const s=Math.floor(t/P)%2,p=s?[a.c[0]+(a.w[0]<cx?11:-11),a.c[1]+15]:[a.c[0],a.c[1]+4];star(p[0],p[1],G[0],[255,255,245],age<.15?2:1);}}};
 // ---- hinten ----
 if(stufe===2){// Runenring am Boden (dreht sich), innen ein matter Kreis
  for(let k=0;k<120;k++){const an=k/120*Math.PI*2;put(cx+25*Math.cos(an),gy+6.2*Math.sin(an),G[2],.35);}
  for(let k=0;k<24;k++){const an=k/24*Math.PI*2+t/1500,x=cx+31*Math.cos(an),y=gy+7.6*Math.sin(an);if(k%4===0)star(x,y,G[1],G[0]);else put(x,y,G[k%2?1:2],.9);}
  // Machtstoß alle 3,2 s: Ring läuft nach außen
  const q=(t%3200)/900;if(q<1){const r=6+q*44;for(let k=0;k<160;k++){const an=k/160*Math.PI*2;put(cx+r*Math.cos(an),gy+r*.26*Math.sin(an),G[0],(1-q)*.9);}}
  // Aura: 1–3 px um die Silhouette, pulsierend, äußerer Saum flimmert
  const d=new Uint8Array(W*H);for(let i=0;i<W*H;i++)if(solid(i))d[i]=0;else d[i]=9;
  for(let it=1;it<=5;it++){const hit=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(d[i]!==9)continue;
   if((x>0&&d[i-1]===it-1)||(x<W-1&&d[i+1]===it-1)||(y>0&&d[i-W]===it-1)||(y<H-1&&d[i+W]===it-1))hit.push(i);}for(const i of hit)d[i]=it;}
  const al=[0,.72,.46,.28,.15,.07].map(v=>v*(.7+.3*pulse));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=d[y*W+x];if(v<1||v>5)continue;if(v>=3&&hs(x,y,Math.floor(t/90))<.3)continue;put(x,y,v===1?[255,248,196]:v===2?G[0]:G[1],al[v]);}
  // Waffenschein: weicher Goldschein um die Waffenhand
  for(let dy=-16;dy<=16;dy++)for(let dx=-16;dx<=16;dx++){const r=Math.hypot(dx,dy);if(r>16)continue;const x=Math.round(a.w[0]+dx),y=Math.round(a.w[1]-4+dy);if(!inb(x,y)||solid(y*W+x))continue;put(x,y,G[1],.34*(1-r/16)*(.55+.45*pulse));}}
 if(stufe===1){// Silberschimmer: 1 px, langsam pulsierend
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(solid(i))continue;if(solid(i-1)||solid(i+1)||solid(i-W)||solid(i+W))put(x,y,[214,226,236],.16+.14*pulse);}}
 fly(false);embers(false);
 // ---- Figur ----
 const flash=stufe===2&&(t%3200)<110,Pg=stufe===2?1700:2600,gp=(t%Pg)/Pg,band=-30+gp*1.7*(W+H*.6+60);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!solid(i))continue;let r=px[i*4],g=px[i*4+1],b=px[i*4+2];
  if(stufe===0){if(o.body&&o.body.has(px[i*4]<<16|px[i*4+1]<<8|px[i*4+2])){out[i*4]=r;out[i*4+1]=g;out[i*4+2]=b;out[i*4+3]=255;continue;}const l=(r*.3+g*.59+b*.11);r=(r*.72+l*.28)*.93;g=(g*.72+l*.28)*.93;b=(b*.72+l*.28)*.93;}// abgetragen: matter, dunkler
  else{const edge=(x>0&&!solid(i-1))||(y>0&&!solid(i-W));if(edge){const k=stufe===2?.32+.12*pulse:.16;r+=(255-r)*k;g+=(240-g)*k;b+=(176-b)*k;}// Randlicht von links oben
   const u=x+y*.6;if(Math.abs(u-band)<2.2&&shiny.has(px[i*4]<<16|px[i*4+1]<<8|px[i*4+2])){r=255;g=252;b=stufe===2?214:236;}}// Glanzlicht wandert über Metall
  if(flash){r+=(255-r)*.2;g+=(240-g)*.2;b+=(170-b)*.2;}
  out[i*4]=r;out[i*4+1]=g;out[i*4+2]=b;out[i*4+3]=255;}
 // ---- vorn ----
 embers(true);sparkles();dust();fly(true);
 if(stufe===2){const bx=Math.round(a.h[0]-6),by=Math.round(y0-12+Math.sin(t/420)*1.5),C={g:G[1],h:G[0],d:G[3],r:[226,58,52],b:[80,140,230],w:[255,255,240]};
  ['h....h....h','hh..hgh..hh','hghhgggghgh','ggggrgbgggg','ggrgggggrgg','ggggggggggg','ddddddddddd'].forEach((row,yy)=>[...row].forEach((ch,xx)=>{if(ch!=='.')put(bx+xx,by+yy,C[ch],.95);}));
  if((t%1400)<160)star(bx+5,by-1,G[0],C.w,2);}
 return out;}
