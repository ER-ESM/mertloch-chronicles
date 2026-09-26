// Erweiterungsmodul der Anziehpuppe (dungeon-kleidung, Entwurf 2026-09-26): Kostüme und Handstücke der Figuren aus „Schloss Big B“.
// Nur Kleidungsteile – jeder Archetyp kann sie tragen (drei Schichten, E-58/E-68); die Figuren stehen als Daten in content/dungeon-figuren.js.
// K = Zeichenbaukasten aus puppe.mjs (PAL, ell, limb, poly, line, stamp, light, …) – nur innerhalb der Zeichenfunktionen benutzen.
// Rückgabe: {gear:{id:{slot,name,<band>(L,p){…}}}, back:{id:{<band>(L,p){…}}}, families:{}, sided:[ids mit Seitenbindung]}
// Schichtung (paperdoll-kern.js ORDER): legs < feet < body < waist < shoulders < neck < charm < head < weapon < offhand < ring.
// Figurengrafik erst nach Freigabe live: die Quellen stehen im Katalog, gezeichnet werden sie nur hinter dem Schalter (dungeon-figuren-art.js).

const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
function tone([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));}
const R=a=>a.map(hex).map(tone);
/** Farbtreppen (Präfix dg), in PAL eingetragen: Laufzeit-Palette und Schattentabelle kennen sie so. */
const RAMPS={
 dgSchwarz:R(['#767486','#51505e','#393846','#262530','#14131a']),// Security-Anzug, Polo: Schwarz mit Formlicht
 dgGelb:R(['#fff8b0','#ffdc44','#e8ac2a','#aa7a1e','#5e4012']),// SECURITY-Druck, Spielzeugfunk
 dgRosa:R(['#ffd4ec','#ff96cc','#e862a8','#a83c78','#62204a']),// Kinder-Headset
 dgTuerkis:R(['#b8fff4','#5ae4d4','#2eaaa0','#1c6e6c','#0e3a3c']),// Hörmuschel, Tablet-Bildschirm
 dgKonfi:R(['#eee6d2','#cdc1a4','#a4967c','#76695a','#4a4038']),// Konfirmationsanzug: helles Sandgrau (Tonwert klar über dem schwarzen Azubi)
 dgZink:R(['#eef2f2','#c2cace','#96a2a8','#687680','#3e4852']),// Regenrinne, Eimerrand, Mülltonnendeckel
 dgAlu:R(['#fbfaf2','#d8d8d2','#acaeac','#7c8084','#50545c']),// Lüftungsrohr (Alu-Flexrohr)
 dgEimer:R(['#fdfdf8','#e4e4dc','#bcbcb4','#8c8c86','#5a5a58']),// Farbeimer
 dgFarbe:R(['#ffb46e','#ff7a2e','#d8521c','#983414','#561c0a']),// Etikett, Preisschild
 dgAbsperr:R(['#ff8a7a','#e03a2e','#a8241e','#6a1414']),// Absperrband rot
 dgGruen:R(['#86b094','#57866a','#3c644e','#284636','#162a20']),// Kellerschürze (Flaschengrün)
 dgChroma:R(['#b8ecac','#72c67e','#46a05e','#2c7444','#18462a']),// Greenscreen (Chromagrün, gedämpft)
 dgNeon:R(['#ffc8ee','#ff82cc','#e44ea2','#a62c74','#641646']),// Bomberjacke
 dgFuchs:R(['#f8c088','#e08c4c','#b0602e','#7a3c1a','#44200c']),// Pferdekostüm: brauner Fuchs (hebt sich vom grauen Stein ab)
 dgMaehne:R(['#7a5a48','#523a2e','#36241c','#221612','#120a08']),// Mähne und Maul dunkelbraun
 dgHuf:R(['#8a8c9a','#5c5e6c','#40424e','#2a2c36','#16171e']),// Hufe
 dgPuder:R(['#ffffff','#f2f0ea','#d6d0c4','#a69e92','#6c6458']),// Perücke (gepudert)
 dgPappe:R(['#e6c08a','#c49058','#9a6a3a','#6c4626','#402814']),// Pappe (Krone)
 dgLeder:R(['#d2a06a','#a8723e','#7e5028','#56341c','#301c0e']),// Stulpen der Reitstiefel
 dgAnzugRosa:R(['#a8e6ec','#5cb4c2','#34879a','#226072','#123a48']),// Hosenanzug der Maklerin: Petrol (hebt sich vom Holzboden und von Ritas Pink ab)
 dgPelz:R(['#f0c690','#c0844e','#8a5630','#5a341c','#2e1a0c']),// Boss-Pelz: warmes Nerzbraun mit hellen Spitzen (liest sich als Fell, nicht als Kork)
 dgHermelin:R(['#ffffff','#f4eee2','#d8ccb8','#a4967e','#62584a']),// Hermelinkragen und -stulpen
 dgKurtSchurz:R(['#a8d4b0','#62986e','#3e7050','#264a34','#10281a']),// Kellerschürze mit mehr Tonumfang
 dgThermo:R(['#e0ffb4','#96f250','#58c82e','#347e1e','#1c4610']),// Neon-Thermoskanne (Heiler)
 dgMessing:R(['#fff2b4','#ecc660','#c89a34','#8e6a20','#584214']),// Absperrpfosten
 dgSamt:R(['#f07a86','#c83a4c','#962636','#621622','#380c14']),// Samtseil
 dgHut:R(['#fff4c8','#f6d888','#d8ac54','#a07838','#5e4420']),// Fischerhut
};

export function dungeon_kleidung(K){
 Object.assign(K.PAL,RAMPS);
 const P=K.PAL,{ell,limb,poly,line,light,lerp,seg,segR,handPos,handOver,sleeve,boot,torso,row}=K;
 // ---------- Helfer (nur in Zeichenfunktionen) ----------
 const neck=p=>(p.A.neckR||[6.5,7.5])[1];
 /** Einzelpixel über L.T (Schwung der Waffe, Rumpfneigung): L.on/L.px arbeiten ungedreht. */
 const tq=(L,x,y)=>L.T?L.T([x,y]):[x,y];
 const on=(L,part,x,y,c)=>{const q=tq(L,x,y);L.on(part,q[0],q[1],c);};
 const px=(L,x,y,c)=>line(L,[[x,y],[x,y]],c);
 const knopf=(L,part,x,y,c)=>{on(L,part,x,y,c[0]);on(L,part,x+1,y+1,c[2]);};
 /** Rumpfteil wie coat() in npc-kleidung.mjs; extend verlängert unter den Schritt. */
 function coat(L,p,c,pad,y0,y1,flare=0,extend=0){const j=L.piece(c);poly(L,torso(p,pad,y0,p.ride?Math.min(y1,44):y1,{flare,sway:!p.ride,extend:p.ride?0:extend}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});return j;}
 /** Hosenbein mit Kniefalten; crease = Bügelfalte, bunch = Stoff staucht sich über dem Schuh. */
 function hosenbein(L,p,leg,c,far,{pad=1.3,to=.94,crease=false,bunch=false}={}){const b=far?2:1,A=p.A,l=L.piece(c);
  limb(L,seg(leg,0,to),segR(A.legR,0,to).map(r=>r+pad),c[b]);light(L,l,{base:b,hi:b-1,lo:b+1,dark:2});
  const k=leg[1];line(L,[[k[0]-5,k[1]-1],[k[0]+3,k[1]+1]],c[3],l);line(L,[[k[0]-4,k[1]+3],[k[0]+2,k[1]+4]],c[b+1],l);
  if(crease)line(L,seg(leg,.08,to-.02).map(([x,y])=>[x+(far?1:0),y]),c[far?1:0],l);
  if(bunch)for(const t of [to-.1,to-.05]){const q=seg(leg,t,t+.01)[0],r=segR(A.legR,t,t+.01)[0]+pad;line(L,[[q[0]-r+1,q[1]-1],[q[0]+r-1,q[1]+1]],c[3],l);}
  const u=L.piece(c);limb(L,seg(leg,to-.05,to),[A.legR[2]+pad+.9,A.legR[2]+pad+.9],c[b]);light(L,u,{base:b,hi:b-1,lo:b+1,dark:1});return l;}
 /** Hosenbund und Schritt einer Anzughose (unter dem Sakko, deckt die Unterwäsche). */
 function hosenbund(L,p,c){const [cx,cy]=p.C,j=L.piece(c);poly(L,torso(p,1.7,28,48),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});line(L,[[cx+1.5,cy+36],[cx+1.5,cy+47]],c[3],j);return j;}
 /** Linie parallel zu einem Glied (Abstand d quer zur Laufrichtung). */
 /** Strich quer über ein Glied an Anteil t (Breite r beidseits). */
 const quer1=(pts,t,r)=>{const a=seg(pts,Math.max(0,t-.02),Math.min(1,t+.02)),q=a[0],b=a[a.length-1],l=Math.hypot(b[0]-q[0],b[1]-q[1])||1,n=[-(b[1]-q[1])/l,(b[0]-q[0])/l],m=[(q[0]+b[0])/2,(q[1]+b[1])/2];return [[m[0]-n[0]*r,m[1]-n[1]*r],[m[0]+n[0]*r,m[1]+n[1]*r]];};
 const quer=(pts,d)=>pts.map((q,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [q[0]-(b[1]-a[1])/l*d,q[1]+(b[0]-a[0])/l*d];});
 /** Rippen quer über ein Glied (Flexrohr): alle step px ein dunkler und ein heller Strich, auf den Teil beschnitten. */
 function rippen(L,part,pts,rs,c,step=3.2){const tot=pts.slice(1).reduce((s,q,i)=>s+Math.hypot(q[0]-pts[i][0],q[1]-pts[i][1]),0);
  for(let d=step*.5;d<tot;d+=step){let acc=0,i=0;while(i<pts.length-2&&acc+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1])<d){acc+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);i++;}
   const a=pts[i],b=pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,t=Math.min(1,(d-acc)/l),q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],n=[-(b[1]-a[1])/l,(b[0]-a[0])/l],r=(rs[i]+(rs[i+1]-rs[i])*t)+1;
   line(L,[[q[0]-n[0]*r,q[1]-n[1]*r],[q[0]+n[0]*r,q[1]+n[1]*r]],c[3],part);line(L,[[q[0]-n[0]*r+(b[0]-a[0])/l,q[1]-n[1]*r+(b[1]-a[1])/l],[q[0]+n[0]*r+(b[0]-a[0])/l,q[1]+n[1]*r+(b[1]-a[1])/l]],c[0],part);}}
 /** Senkrechte Stofffalten (Rauschen am Rauschursprung). */
 function falten(L,part,x0,x1,y0,y1,c,step=6){for(let x=x0;x<=x1;x+=step){const k=K.hsA(x,y0);line(L,[[x,y0+4+k*6],[x+(k>.5?1:-1),y1-2]],c[k>.55?3:2],part);}}
 /** Rückenaufdruck: ganze Zeile, wenn sie auf den Rumpf passt, sonst in zwei Zeilen. */
 function aufdruck(L,part,p,y,s,c){const [cx,cy]=p.C,r=row(p.A,y),w=r[2]-r[1],fw=[...s].reduce((a,ch)=>a+(ch==='I'?2:ch==='M'||ch==='W'?6:4),-1);
  if(fw<=w+4){K.text(L,part,cx+(r[1]+r[2])/2-fw/2+.5,cy+y,s,c,0);return;}
  const h=Math.ceil(s.length/2);for(const [k,t] of [[0,s.slice(0,h)],[1,s.slice(h)]]){const tw=[...t].reduce((a,ch)=>a+(ch==='I'?2:ch==='M'||ch==='W'?6:4),-1);K.text(L,part,cx+(r[1]+r[2])/2-tw/2+.5,cy+y+k*7,t,c,0);}}
 /** Schurz-Umriss vorn, an Hüfte und Beinen des Archetyps ausgerichtet. */
 function schurz(p,y0,y1,inset=3){const A=p.A,[cx,cy]=p.C,t=row(A,y0),b=row(A,Math.min(46,y1)),sw=p.ride?0:(p.sway||0)*1.6;
  return [[cx+Math.min(t[1]+inset,-13),cy+y0],[cx+Math.max(t[2]-inset,12),cy+y0],[cx+Math.max(b[2]+2,16)+sw,cy+y1],[cx+Math.min(b[1]-2,-17)+sw,cy+y1]];}
 /** Handgelenk w, Unterarmrichtung u, Normale n. */
 const handGeo=arm=>{const w=arm[2],d=[arm[2][0]-arm[1][0],arm[2][1]-arm[1][1]],l=Math.hypot(...d)||1,u=[d[0]/l,d[1]/l];return {w,u,n:[-u[1],u[0]]};};
 /** Gedrehtes Rechteck um Mitte c (Winkel a): Eckpunkte. */
 const rect=(c,w,h,a=0)=>{const co=Math.cos(a),si=Math.sin(a);return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[c[0]+x*co-y*si,c[1]+x*si+y*co]);};

 // ---------- Zeichner ----------
 /** Security-Anzug (zu klein): schwarzes Sakko, Ärmel zu kurz mit weißer Manschette, Knopf spannt (Zugfalten), Namensschild. */
 function secArm(L,p,arm,far){const c=P.dgSchwarz,s=sleeve(L,p,arm,c,.86,1.2,far,{roll:false,cuff:c}),rr=segR(p.A.armR,.85,.86)[0]+1.2*(p.A.armR[0]>9?.55:1)+.4;line(L,quer1(arm,.86,rr),P.white[far?1:0]);// schmale Manschette
  const q=lerp(arm[1],arm[2],.2);line(L,[[q[0]-4,q[1]-1],[q[0]+3,q[1]+1]],c[3],s);
  const e=lerp(arm[0],arm[1],.06),sh=L.piece(c);ell(L,e[0]+(far?2:-2),e[1]-1,p.A.armR[0]+4.5,p.A.armR[0]+2,c[far?2:1]);light(L,sh,{base:far?2:1,hi:far?1:0,lo:3,dark:1});return s;}// breite Türsteherschultern
 function secRumpf(L,p){const c=P.dgSchwarz,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,1.3,-14,35,.4);
  const h=L.piece(P.white);poly(L,[[cx-nr-1,cy-16],[cx+nr+2,cy-16],[cx+2,cy+12]],P.white[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});
  const t=L.piece(P.black);poly(L,[[cx-.5,cy-14],[cx+4,cy-14],[cx+3,cy-10],[cx+.5,cy-10]],P.black[3]);poly(L,[[cx+.5,cy-10],[cx+3,cy-10],[cx+4,cy+7],[cx+1.8,cy+10],[cx-.6,cy+7]],P.black[3]);light(L,t,{base:3,hi:2,lo:4,dark:1});
  const rv=L.piece(c);poly(L,[[cx-nr-4,cy-16],[cx-nr-1,cy-16],[cx+2,cy+12],[cx-1,cy+15],[cx-7,cy+2],[cx-12,cy-7]],c[0]);light(L,rv,{base:0,hi:0,lo:1,dark:1});
  const rf=L.piece(c);poly(L,[[cx+nr+5,cy-16],[cx+nr+2,cy-16],[cx+2,cy+12],[cx+5,cy+15],[cx+10,cy+2],[cx+13,cy-7]],c[2]);light(L,rf,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+2,cy+14],[cx+2,cy+35]],c[4],j);knopf(L,j,cx+3,cy+20,P.metal);
  for(const [a,b] of [[[cx+3,cy+20],[cx-9,cy+13]],[[cx+3,cy+20],[cx+13,cy+12]],[[cx+3,cy+20],[cx-8,cy+28]],[[cx+3,cy+20],[cx+12,cy+29]]])line(L,[a,b],c[3],j);// Zugfalten am Knopf
  const n=L.piece(P.gold);poly(L,[[cx-15,cy-3],[cx-8,cy-3],[cx-8,cy+1],[cx-15,cy+1]],P.gold[1]);light(L,n,{base:1,hi:0,lo:2,dark:1});line(L,[[cx-14,cy-1],[cx-9,cy-1]],P.gold[3],n);// Namensschild
  for(const [x0,x1] of [[cx-17,cx-8],[cx+8,cx+17]])line(L,[[x0,cy+29],[x1,cy+29]],c[3],j);}
 function secRumpfBack(L,p){const c=P.dgSchwarz,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,1.3,-14,35,.4);
  const k=L.piece(c);poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-12],[cx-nr-1,cy-12]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+1,cy-11],[cx+1,cy+35]],c[3],j);for(const dy of [16,22])line(L,[[cx-12,cy+dy],[cx+14,cy+dy+1]],c[3],j);// Mittelnaht, spannender Rücken
  aufdruck(L,j,p,-8,'SECURITY',P.white[0]);}
 /** Security-Polo (zu groß): schwarz bis über den Schritt, weite kurze Ärmel mit gelbem Rand, Kragen, gelbes Brustlogo, Rücken SECURITY. */
 function poloArm(L,p,arm,far){const s=sleeve(L,p,arm,P.dgSchwarz,.46,3.6,far,{roll:false,cuff:P.dgSchwarz});const rr=segR(p.A.armR,.43,.44)[0]+3.6*(p.A.armR[0]>9?.55:1)+.6;line(L,quer1(arm,.43,rr),P.dgGelb[far?2:1],s);return s;}
 function poloRumpf(L,p,back){const c=P.dgSchwarz,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,3.4,-14,52,2.6,8);
  falten(L,j,cx-18,cx+18,cy+30,cy+54,c,7);
  if(back){const k=L.piece(c);poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-12],[cx-nr-1,cy-12]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});line(L,[[cx-nr-2,cy-12],[cx+nr+2,cy-12]],P.dgGelb[2],k);
   aufdruck(L,j,p,-6,'SECURITY',P.dgGelb[1]);return;}
  poly(L,[[cx-2,cy-15],[cx+5,cy-15],[cx+1.5,cy-5]],null,'del');
  const k=L.piece(c,1);poly(L,[[cx-nr-3,cy-17],[cx-1.5,cy-15.5],[cx+.5,cy-8],[cx-nr,cy-11]],c[1]);poly(L,[[cx+nr+4,cy-17],[cx+4.5,cy-15.5],[cx+2.5,cy-8],[cx+nr+2,cy-11]],c[2]);light(L,k,{base:1,hi:0,lo:2,dark:1});
  line(L,[[cx-nr-3,cy-17],[cx+.5,cy-8]],P.dgGelb[2],k);line(L,[[cx+nr+4,cy-17],[cx+2.5,cy-8]],P.dgGelb[3],k);
  line(L,[[cx+1.5,cy-5],[cx+1.5,cy+4]],c[3],j);knopf(L,j,cx+2,cy-3,c);knopf(L,j,cx+2,cy+2,c);
  const lg=L.piece(P.dgGelb);poly(L,[[cx-15,cy+1],[cx-7,cy+1],[cx-7,cy+6],[cx-11,cy+9],[cx-15,cy+6]],P.dgGelb[1]);light(L,lg,{base:1,hi:0,lo:2,dark:1});line(L,[[cx-13,cy+3],[cx-9,cy+3]],P.dgSchwarz[3],lg);line(L,[[cx-13,cy+5],[cx-10,cy+5]],P.dgSchwarz[3],lg);}
 /** Konfirmationsanzug: blaugrau, eine Nummer zu groß (hängende Schultern, lange Ärmel, Hose staucht sich), bunte Krawatte, Visitenkarten. */
 function konfiArm(L,p,arm,far){const s=sleeve(L,p,arm,P.dgKonfi,.99,2.8,far,{roll:false});{const {w,u,n}=handGeo(arm),r=p.A.armR[2]+3.4,e=[w[0]+u[0]*5,w[1]+u[1]*5],x=L.piece(P.dgKonfi);poly(L,[[w[0]-n[0]*r,w[1]-n[1]*r],[w[0]+n[0]*r,w[1]+n[1]*r],[e[0]+n[0]*(r+.8),e[1]+n[1]*(r+.8)],[e[0]-n[0]*(r+.8),e[1]-n[1]*(r+.8)]],P.dgKonfi[far?2:1]);light(L,x,{base:far?2:1,hi:far?1:0,lo:3,dark:1});}// Ärmel bis über die Fingerconst q=lerp(arm[1],arm[2],.55);line(L,[[q[0]-5,q[1]-1],[q[0]+4,q[1]+1]],P.dgKonfi[3],s);
  const e=lerp(arm[0],arm[1],.1),sh=L.piece(P.dgKonfi),R0=p.A.armR[0];poly(L,[[e[0]-R0-7,e[1]-4],[e[0]+R0+7,e[1]-5],[e[0]+R0+6,e[1]+9],[e[0]-R0-6,e[1]+10]],P.dgKonfi[far?2:1]);light(L,sh,{base:far?2:1,hi:far?1:0,lo:3,dark:2});return s;}// kastige Schulterpolster (80er)
 function konfiRumpf(L,p){const c=P.dgKonfi,[cx,cy]=p.C,nr=neck(p);hosenbund(L,p,c);const j=coat(L,p,c,3,-14,47,2);
  const h=L.piece(P.nkHemd);poly(L,[[cx-nr-1,cy-16],[cx+nr+2,cy-16],[cx+2,cy+15]],P.nkHemd[0]);light(L,h,{base:0,hi:0,lo:1,dark:1});
  const t=L.piece(P.dgThermo);poly(L,[[cx-.5,cy-14],[cx+4.5,cy-14],[cx+3.5,cy-10],[cx+.5,cy-10]],P.dgThermo[1]);poly(L,[[cx+.5,cy-10],[cx+3.5,cy-10],[cx+7,cy+14],[cx+3,cy+18],[cx-1.5,cy+13]],P.dgThermo[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});
  on(L,t,cx+2,cy-6,P.dgThermo[3]);on(L,t,cx+3,cy+2,P.dgThermo[3]);// breite neongrüne Krawatte, schief gebunden (Heilerfarbe wie die Thermoskanne)
  const rv=L.piece(c);poly(L,[[cx-nr-5,cy-16],[cx-nr-1,cy-16],[cx+2,cy+15],[cx-2,cy+19],[cx-9,cy+3],[cx-15,cy-7]],c[0]);light(L,rv,{base:0,hi:0,lo:1,dark:1});
  const rf=L.piece(c);poly(L,[[cx+nr+6,cy-16],[cx+nr+2,cy-16],[cx+2,cy+15],[cx+6,cy+18],[cx+12,cy+3],[cx+15,cy-7]],c[2]);light(L,rf,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+2,cy+17],[cx+2,cy+47]],c[3],j);for(const y of [cy+22,cy+30])for(const x of [cx-4,cx+7]){const b=L.piece(P.black);ell(L,x,y,1.6,1.6,P.black[2]);on(L,b,x-.5,y-.5,P.black[0]);}// zweireihig
  for(const [x0,x1] of [[cx-19,cx-8],[cx+9,cx+20]]){line(L,[[x0,cy+37],[x1,cy+37]],c[3],j);line(L,[[x0,cy+38],[x1,cy+38]],c[0],j);}
  const vk=L.piece(P.card);poly(L,[[cx-15,cy+33],[cx-11,cy+33],[cx-11,cy+37],[cx-15,cy+37]],P.card[0]);light(L,vk,{base:0,hi:0,lo:1,dark:1});// Visitenkarten aus der Tasche
  const kr=L.piece(P.white);poly(L,[[cx-nr-2,cy-17],[cx,cy-14],[cx-7,cy-3],[cx-12,cy-8]],P.white[0]);poly(L,[[cx+nr+3,cy-17],[cx+3.5,cy-14],[cx+10,cy-3],[cx+14,cy-8]],P.white[1]);light(L,kr,{base:0,hi:0,lo:1,dark:1});// breiter 80er-Kragen über dem Revers
  const et=L.piece(P.dgThermo);poly(L,[[cx-17,cy+3],[cx-13,cy+1],[cx-10,cy+4],[cx-11,cy+6],[cx-17,cy+6]],P.dgThermo[0]);light(L,et,{base:0,hi:0,lo:1,dark:1});// Einstecktuch
  for(const x of [cx-20,cx+19])line(L,[[x,cy+10],[x+(x<cx?2:-2),cy+44]],c[3],j);}// Stoff wirft Falten (zu weit)
 function konfiRumpfBack(L,p){const c=P.dgKonfi,[cx,cy]=p.C,nr=neck(p);hosenbund(L,p,c);const j=coat(L,p,c,3,-14,47,2);
  const k=L.piece(c);poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-11],[cx-nr-1,cy-11]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+1,cy-10],[cx+1,cy+47]],c[3],j);line(L,[[cx+2,cy+36],[cx+2,cy+47]],c[0],j);for(const x of [cx-20,cx+19])line(L,[[x,cy+4],[x+(x<cx?2:-2),cy+44]],c[3],j);}
 /** Hosenanzug in Lachs: Blazer mit Schulterpolstern, weiße Bluse, goldene Knöpfe und Brosche, weite Hose mit Bügelfalte. */
 function lachsArm(L,p,arm,far){const c=P.dgAnzugRosa,s=sleeve(L,p,arm,c,.9,1.8,far,{roll:false,cuff:c});line(L,quer1(arm,.9,segR(p.A.armR,.89,.9)[0]+1.4),P.white[far?1:0]);
  const e=lerp(arm[0],arm[1],.08),sh=L.piece(c);ell(L,e[0]+(far?1.5:-1.5),e[1]-1,p.A.armR[0]+3.6,p.A.armR[0]+1.4,c[far?2:1]);light(L,sh,{base:far?2:1,hi:far?1:0,lo:3,dark:1});return s;}
 function lachsRumpf(L,p){const c=P.dgAnzugRosa,[cx,cy]=p.C,nr=neck(p);hosenbund(L,p,c);const j=coat(L,p,c,2.2,-14,40,1.6);
  for(const s of [-1,1]){const r=row(p.A,26);line(L,[[cx+(s<0?r[1]:r[2])-s*1,cy+20],[cx+(s<0?r[1]:r[2])-s*3,cy+30]],c[3],j);}// Taille
  const h=L.piece(P.white);poly(L,[[cx-nr-1,cy-16],[cx+nr+2,cy-16],[cx+1.5,cy+9]],P.white[0]);light(L,h,{base:0,hi:0,lo:1,dark:1});
  const rv=L.piece(c);poly(L,[[cx-nr-4,cy-16],[cx-nr-1,cy-16],[cx+1.5,cy+9],[cx-2,cy+12],[cx-9,cy+1],[cx-13,cy-8]],c[0]);light(L,rv,{base:0,hi:0,lo:1,dark:1});
  const rf=L.piece(c);poly(L,[[cx+nr+5,cy-16],[cx+nr+2,cy-16],[cx+1.5,cy+9],[cx+5,cy+12],[cx+11,cy+1],[cx+14,cy-8]],c[2]);light(L,rf,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+2,cy+11],[cx+2,cy+40]],c[3],j);for(const y of [cy+17,cy+27]){const b=L.piece(P.gold);ell(L,cx+4,y,1.7,1.7,P.gold[1]);light(L,b,{base:1,hi:0,lo:2,dark:1});}
  const br=L.piece(P.gold);ell(L,cx-10,cy-3,2.6,2.4,P.gold[1]);light(L,br,{base:1,hi:0,lo:2,dark:1});on(L,br,cx-10,cy-3,P.red[1]);// Brosche
  for(const [x0,x1] of [[cx-17,cx-8],[cx+9,cx+18]])line(L,[[x0,cy+33],[x1,cy+33]],c[3],j);}
 function lachsRumpfBack(L,p){const c=P.dgAnzugRosa,[cx,cy]=p.C,nr=neck(p);hosenbund(L,p,c);const j=coat(L,p,c,2.2,-14,40,1.6);
  const k=L.piece(c);poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-11],[cx-nr-1,cy-11]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+1,cy-10],[cx+1,cy+40]],c[3],j);for(const s of [-1,1])line(L,[[cx+s*9,cy+4],[cx+s*8,cy+34]],c[3],j);}
 /** Weste in Bordeaux (über dem Hemd): tiefer V-Ausschnitt, Goldknöpfe, Spitzen am Saum, Probierlöffel an der Kette. */
 function westeRumpf(L,p){const c=P.faWein,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,2.4,-13,36,.6);
  poly(L,[[cx-nr-2,cy-16],[cx+nr+3,cy-16],[cx+1.5,cy+15]],null,'del');
  const r=row(p.A,36);poly(L,[[cx+r[1]-2,cy+34],[cx-3,cy+34],[cx-1,cy+40],[cx+2,cy+34],[cx+6,cy+34],[cx+r[2]+2,cy+34],[cx+r[2]+2,cy+37],[cx+r[1]-2,cy+37]],null,'del');
  const sp=L.piece(c);poly(L,[[cx-7,cy+34],[cx+1.5,cy+34],[cx-2,cy+40]],c[2]);poly(L,[[cx+1.5,cy+34],[cx+9,cy+34],[cx+5,cy+40]],c[3]);light(L,sp,{base:2,hi:1,lo:3,dark:1});// Westenspitzen
  line(L,[[cx+1.5,cy+15],[cx+1.5,cy+36]],c[4],j);for(let k=0;k<4;k++){const b=L.piece(P.gold);ell(L,cx+3,cy+18+k*5,1.4,1.4,P.gold[1]);on(L,b,cx+2.5,cy+17.5+k*5,P.gold[0]);}
  for(const [x0,x1] of [[cx-15,cx-8],[cx+9,cx+16]])line(L,[[x0,cy+24],[x1,cy+24]],c[3],j);
  L.piece(P.metal,1);line(L,[[cx-nr-1,cy-13],[cx-9,cy-2],[cx-10,cy+6]],P.metal[1]);// Kette des Probierlöffels
  const tv=L.piece(P.metal);ell(L,cx-10,cy+9,4,2.8,P.metal[1]);light(L,tv,{base:1,hi:0,lo:2,dark:1});ell(L,cx-10,cy+8.5,2.4,1.4,P.metal[3],tv);on(L,tv,cx-12,cy+8,P.metal[0]);}
 function westeRumpfBack(L,p){const c=P.faWein,[cx,cy]=p.C,j=coat(L,p,c,2.4,-13,36,.6);
  line(L,[[cx+1,cy-12],[cx+1,cy+36]],c[3],j);const b=L.piece(P.black);poly(L,[[cx-8,cy+24],[cx+10,cy+24],[cx+10,cy+27],[cx-8,cy+27]],P.black[2]);const s=L.piece(P.metal);poly(L,[[cx-1,cy+23.5],[cx+3,cy+23.5],[cx+3,cy+27.5],[cx-1,cy+27.5]],P.metal[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});}
 /** Kellerschürze (Bistroschürze): flaschengrün vom Bund bis übers Schienbein, Band mit Schleife, Geschirrtuch am Bund. */
 function schuerzeRumpf(L,p){const c=P.dgKurtSchurz,[cx,cy]=p.C,long=p.ride?44:74,sw=p.ride?0:(p.sway||0)*3,t=row(p.A,32),x0=cx+t[1]+2,x1=cx+t[2]-2,b0=cx+Math.min(t[1]-8,-24)+sw,b1=cx+Math.max(t[2]+8,22)+sw;
  // Faltenwurf: n Bahnen, jede mit Lichtgrat und Schattental; der Saum folgt den Falten (Spitzen an den Graten)
  const n=5,hem=[];for(let k=0;k<=n*2;k++){const u=k/(n*2);hem.push([b1+(b0-b1)*u,cy+long+(k%2?-3:2)]);}
  const a=L.piece(c);poly(L,[[x0,cy+31],[x1,cy+31],...hem],c[2]);light(L,a,{base:2,hi:1,lo:3,dark:2,share:.2});
  for(let k=0;k<n;k++){const u=(k+.5)/n,top=[x0+(x1-x0)*u,cy+34],bot=[b0+(b1-b0)*(1-((k*2+1)/(n*2))),cy+long-2];
   line(L,[top,[(top[0]+bot[0])/2,(top[1]+bot[1])/2],bot],c[0],a);line(L,[[top[0]+1,top[1]],[bot[0]+2,bot[1]]],c[1],a);line(L,[[top[0]+3,top[1]+4],[bot[0]+5,bot[1]-1]],c[3],a);line(L,[[top[0]+4,top[1]+6],[bot[0]+6,bot[1]-1]],c[4],a);}
  const bd=L.piece(c);poly(L,torso(p,2.8,29,32),c[3]);light(L,bd,{base:3,hi:2,lo:4,dark:1});
  const s=L.piece(c);const bx=cx+t[1]-1;ell(L,bx-2,cy+31,3,2.2,c[2]);limb(L,[[bx-2,cy+33],[bx-5+sw*.5,cy+46]],[1.4,1],c[2]);limb(L,[[bx-1,cy+33],[bx+1+sw*.5,cy+44]],[1.4,1],c[1]);light(L,s,{base:2,hi:1,lo:3,dark:1});// Band mit Schleife
  const tu=L.piece(P.white);poly(L,[[cx+11,cy+31],[cx+17,cy+31],[cx+18+sw*.3,cy+47],[cx+12+sw*.3,cy+48]],P.white[1]);light(L,tu,{base:1,hi:0,lo:2,dark:1});line(L,[[cx+12,cy+38],[cx+17,cy+38]],P.red[1],tu);line(L,[[cx+12,cy+40],[cx+17,cy+40]],P.red[1],tu);}// Geschirrtuch
 function schuerzeRumpfBack(L,p){const c=P.dgGruen,[cx,cy]=p.C,t=row(p.A,31);L.piece(c,1);line(L,[[cx+t[1]-1,cy+31],[cx+t[2]+1,cy+31]],c[2]);
  const s=L.piece(c);ell(L,cx-3,cy+31,3.4,2.4,c[1]);ell(L,cx+4,cy+31,3.4,2.4,c[1]);limb(L,[[cx,cy+32],[cx-2,cy+44]],[1.3,1],c[2]);limb(L,[[cx+1,cy+32],[cx+3,cy+43]],[1.3,1],c[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});
  for(const sd of [-1,1]){const r=row(p.A,44),x=cx+(sd<0?r[1]-3:r[2]+3),a=L.piece(c);poly(L,[[x,cy+34],[x+sd*2,cy+34],[x+sd*4,cy+74],[x,cy+74]],c[2]);light(L,a,{base:2,hi:1,lo:3,dark:1});}}// Schürzenkanten an den Seiten
 /** Bomberjacke in Neonpink: gepolsterte Steppbögen, schwarze Rippbündchen, Reißverschluss; hinten LIVE. */
 function bomberArm(L,p,arm,far){const c=P.dgNeon,s=sleeve(L,p,arm,c,.9,3,far,{roll:false,cuff:P.black});for(const t of [.3,.6]){const rr=segR(p.A.armR,t,t+.01)[0]+3*(p.A.armR[0]>9?.55:1);line(L,quer1(arm,t,rr),c[3],s);}return s;}
 function bomberRumpf(L,p,back){const c=P.dgNeon,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,3.2,-14,36,1.8);
  for(const y of [-2,8,18,28]){const r=row(p.A,y);line(L,[[cx+r[1]-4,cy+y],[cx+(r[1]+r[2])/2,cy+y+2],[cx+r[2]+4,cy+y]],c[2],j);}
  for(let y=-4;y<=30;y+=10){const r=row(p.A,y);for(const x of [cx+r[1]-2,cx+r[2]+2])on(L,j,x,cy+y,c[3]);}
  const s=L.piece(P.black);poly(L,torso(p,3.6,34,38,{sway:!p.ride}),P.black[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});
  const k=L.piece(P.black);K.limb(L,[[cx-nr-3,cy-15],[cx,cy-12],[cx+nr+4,cy-15]],[2.2,2.4,2.2],P.black[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
  if(back){aufdruck(L,j,p,4,'LIVE',P.white[0]);return;}
  L.piece(P.metal,1);line(L,[[cx+1.5,cy-11],[cx+1.5,cy+36]],P.metal[2]);for(let y=cy-9;y<cy+36;y+=3)px(L,cx+2.5,y,P.metal[1]);
  const pt=L.piece(P.gold);ell(L,cx-11,cy+5,3,3,P.gold[1]);light(L,pt,{base:1,hi:0,lo:2,dark:1});on(L,pt,cx-11,cy+5,P.white[0]);}// Stern-Aufnäher
 /** Fan-Shirt „BIG B“: weißes T-Shirt mit lila Aufdruck und Pappkrone, kurze Ärmel; hinten FAN. Die Follower tragen es alle. */
 function fanArm(L,p,arm,far){return sleeve(L,p,arm,P.white,.42,1.8,far,{roll:false,cuff:P.nkPulli});}
 function fanRumpf(L,p,back){const c=P.white,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,1.6,-14,34,.6);
  if(back){aufdruck(L,j,p,0,'FAN',P.nkPulli[2]);return;}K.ell(L,cx+1,cy-12,nr+2.5,4,null,'del');
  const k=L.piece(P.gold);poly(L,[[cx-7,cy+3],[cx-7,cy-2],[cx-4,cy+1],[cx+1,cy-4],[cx+5,cy+1],[cx+8,cy-2],[cx+8,cy+3]],P.gold[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});
  K.text(L,j,cx-8,cy+6,'BIG',P.nkPulli[2],0);K.text(L,j,cx-2,cy+13,'B',P.nkPulli[2],0);}
 /** Fischerhut (Bucket Hat) in Pastellgelb. */
 function fischerhut(L,p){const [x,y]=p.head,c=P.dgHut,t=L.piece(c);poly(L,[[x-15,y-12],[x-13,y-25],[x-4,y-30],[x+8,y-30],[x+15,y-25],[x+17,y-12]],c[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});
  const k=L.piece(c);poly(L,[[x-24,y-10],[x+26,y-11],[x+22,y-15],[x-20,y-14]],c[2]);ell(L,x+1,y-11,25,4,c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});line(L,[[x-15,y-16],[x+17,y-17]],c[3],t);}
 /** Regenrinnen-Panzer: Brustplatte aus Rinnenstücken (Lamellen mit Nieten), Schultern aus Endkappen, Absperrband als Schärpe. */
 function panzerArm(L,p,arm,far){const c=P.dgAlu,b=far?2:1,pts=seg(arm,0,.9),rs=segR(p.A.armR,0,.9).map(r=>r+2.6),s=L.piece(c);limb(L,pts,rs,c[b]);light(L,s,{base:b,hi:b-1,lo:b+1,dark:2});rippen(L,s,pts,rs,c);
  const e=arm[0],z=P.dgZink,sh=L.piece(z);ell(L,e[0]+(far?1:-1),e[1]+5,p.A.armR[0]+5.5,p.A.armR[0]+3.5,z[far?2:1]);light(L,sh,{base:far?2:1,hi:far?1:0,lo:3,dark:2});
  line(L,[[e[0]-p.A.armR[0]-4,e[1]+6],[e[0]+p.A.armR[0]+4,e[1]+6]],z[3],sh);on(L,sh,e[0],e[1]+2,z[0]);on(L,sh,e[0]+(far?3:-3),e[1]+4,z[4]);return s;}
 function panzerRumpf(L,p,back){const c=P.dgZink,[cx,cy]=p.C,j=coat(L,p,c,3.2,-13,40,1.2);
  for(const y of [-6,5,16,27]){const r=row(p.A,y),x0=cx+r[1]-3,x1=cx+r[2]+3;line(L,[[x0,cy+y],[x1,cy+y+.6]],c[0],j);line(L,[[x0,cy+y+1],[x1,cy+y+1.6]],c[0],j);line(L,[[x0,cy+y+9],[x1,cy+y+9.6]],c[3],j);
   for(const x of [x0+3,x1-3]){on(L,j,x,cy+y+4,c[4]);on(L,j,x-1,cy+y+3,c[0]);}}
  const t=L.piece(P.dgAlu);poly(L,torso(p,3.6,33,38,{sway:!p.ride}),P.dgAlu[2]);light(L,t,{base:2,hi:1,lo:3,dark:1});for(let x=cx-30;x<cx+30;x+=5)on(L,t,x,cy+38,P.dgAlu[3]);// Gürtel aus Klebeband
  if(back){const s=L.piece(P.dgAbsperr);limb(L,[[cx+row(p.A,-10)[1]+4,cy-12],[cx+row(p.A,34)[2]-2,cy+34]],[3.4,3.4],P.dgAbsperr[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});return;}
  const a=[cx+row(p.A,-10)[2]-4,cy-12],b=[cx+row(p.A,34)[1]+2,cy+34],s=L.piece(P.dgAbsperr);limb(L,[a,b],[3.6,3.6],P.dgAbsperr[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});
  for(let k=0;k<7;k++){const q=lerp(a,b,.08+k*.13);poly(L,[[q[0]-4,q[1]-1],[q[0]+1,q[1]-4],[q[0]+4,q[1]],[q[0]-1,q[1]+3]],P.white[1],s);}// rot-weißes Absperrband
  const pr=L.piece(P.dgFarbe);poly(L,[[cx+6,cy+20],[cx+14,cy+20],[cx+14,cy+25],[cx+6,cy+25]],P.dgFarbe[1]);light(L,pr,{base:1,hi:0,lo:2,dark:1});line(L,[[cx+8,cy+22],[cx+12,cy+22]],P.white[0],pr);}// Preisschild
 /** Lüftungsrohr-Beine (Alu-Flexrohr) mit Rinnen-Knieschonern, Klebeband-Bund. */
 function rohrBein(L,p,leg,far){const c=P.dgAlu,b=far?2:1,pts=seg(leg,0,.9),rs=segR(p.A.legR,0,.9).map(r=>r+2.2),l=L.piece(c);limb(L,pts,rs,c[b]);light(L,l,{base:b,hi:b-1,lo:b+1,dark:2});rippen(L,l,pts,rs,c,3.6);
  const k=leg[1],z=P.dgZink,kn=L.piece(z);ell(L,k[0]+1,k[1],p.A.legR[1]+3,5,z[b]);light(L,kn,{base:b,hi:b-1,lo:b+1,dark:1});on(L,kn,k[0]+1,k[1],z[4]);}
 /** Greenscreen-Umhang: hinter dem Körper von den Schultern bis zu den Knien, Falten, Klammern am Kragen. */
 function capeForm(p){const [cx,cy]=p.C,A=p.A,low=p.ride?44:74,sw=p.ride?0:(p.sway||0)*2,wl=Math.min(A.sh[0]-14,-30),wr=Math.max(A.sh[1]+14,28);
  const hem=[];for(let k=0;k<=6;k++){const t=k/6;hem.push([cx+wr+(wl-wr)*t+sw,cy+low+(k%2?5:0)-Math.sin(t*Math.PI)*-3]);}
  return [[cx+A.sh[0]+2,cy-15],[cx+A.sh[1]-2,cy-15],[cx+A.sh[1]+8,cy+8],...hem,[cx+A.sh[0]-8,cy+8]];}
 function cape(L,p,back){const c=P.dgChroma,[cx,cy]=p.C,j=L.piece(c);poly(L,capeForm(p),c[back?1:2]);light(L,j,{base:back?1:2,hi:back?0:1,lo:3,dark:2});
  falten(L,j,cx-34,cx+34,cy+2,cy+(p.ride?44:78),c,5);for(let x=cx-32;x<=cx+32;x+=10)line(L,[[x+1,cy+14],[x+2,cy+(p.ride?42:74)]],c[back?0:1],j);// Faltenwurf mit Lichtkante
  if(back){const t=L.piece(P.white);poly(L,[[cx+8,cy+50],[cx+14,cy+50],[cx+14,cy+54],[cx+8,cy+54]],P.white[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});
   for(const [x,y] of [[-14,20],[12,34],[-6,48]]){const m=L.piece(P.black);K.stamp(L,j,cx+x,cy+y,['k.k','.k.','k.k'],{k:c[4]});}}}// Tracking-Kreuze
 /** Ringlicht als Heiligenschein: großer LED-Ring (kühles Weiß, nicht Gold – Gold hieße „Heiler“) hinter dem Kopf an einer Stange vom Rücken;
  *  von hinten derselbe Ring, die LEDs zeigen nach vorn. */
 function halo(L,p,vorn){const [x,y]=p.head,cx=x+1,cy=y-8,T=P.tube,r=L.piece(T);ell(L,cx,cy,33,32,T[vorn?1:2]);ell(L,cx,cy,25,24,null,'del');light(L,r,{base:vorn?1:2,hi:vorn?0:1,lo:vorn?2:3,dark:1,share:.16});
  for(let k=0;k<24;k++){const t=k/24*Math.PI*2;on(L,r,cx+Math.cos(t)*29,cy+Math.sin(t)*28,vorn?P.white[0]:T[3]);if(vorn&&k%2)on(L,r,cx+Math.cos(t)*29+1,cy+Math.sin(t)*28,P.white[0]);}
  const st=L.piece(P.black);limb(L,[[cx,cy+25],[cx,y+26]],[2,2],P.black[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});}
 /** Pferdekostüm (vordere Hälfte eines Schimmels): Maske mit langem Kopf über dem Kopf des Trägers, Hals mit Mähne, Rumpf bis zur Hüfte,
  *  hinten ein glatter Schnitt mit Pflaster; die Ärmel enden in Hufen, darunter bleiben die Menschenbeine. */
 function pferdKopf(L,p){const [x,y]=p.head,c=P.dgFuchs,m=P.dgMaehne,back=!!p.back,s=1;
  const nk=L.piece(c);limb(L,[[x+1,y+16],[x,y-8],[x+2,y-22]],[17,16,14],c[1]);light(L,nk,{base:1,hi:0,lo:2,dark:3});
  if(back){const mn=L.piece(m);limb(L,[[x+1,y-30],[x,y-8],[x+1,y+18]],[6,7,6],m[1]);light(L,mn,{base:1,hi:0,lo:2,dark:2});for(let k=0;k<9;k++)line(L,[[x-5+k*1.3,y-26+k*5],[x-3+k*1.3,y-20+k*5]],m[3],mn);
   for(const sd of [-1,1]){const e=L.piece(c);poly(L,[[x+sd*6,y-26],[x+sd*12,y-42],[x+sd*15,y-24]],c[sd<0?1:2]);light(L,e,{base:sd<0?1:2,hi:1,lo:3,dark:1});}return;}
  // Kopf: vom Genick (über dem Trägerkopf) schräg nach vorn-unten zur Maulpartie
  const poll=[x+2,y-26],mz=[x+33*s,y+2],hd=L.piece(c);limb(L,[poll,lerp(poll,mz,.55),mz],[14,12.5,9.5],c[1]);ell(L,x+6,y-20,15,12,c[1]);light(L,hd,{base:1,hi:0,lo:2,dark:3});
  const mu=L.piece(P.dgMaehne);ell(L,mz[0]+1,mz[1]+1,9,8,P.dgMaehne[2]);light(L,mu,{base:2,hi:1,lo:3,dark:2});// Maul (grau)
  on(L,mu,mz[0]+4,mz[1]-2,P.black[4]);on(L,mu,mz[0]+5,mz[1]-2,P.black[4]);on(L,mu,mz[0]+4,mz[1]-1,P.black[3]);// Nüster
  line(L,[[mz[0]-4,mz[1]+6],[mz[0]+6,mz[1]+5]],P.black[3],mu);// Maulspalte
  const ey=L.piece(P.white);ell(L,x+12,y-18,4.6,5.2,P.white[0]);light(L,ey,{base:0,hi:0,lo:1,dark:1});ell(L,x+13.5,y-17,2.4,3.2,P.black[4],ey);on(L,ey,x+12.5,y-18.5,[255,255,255]);// Glubschauge
  line(L,[[x+7,y-24],[x+11,y-25],[x+16,y-23]],P.black[3],hd);// Wimpernbogen
  const bl=L.piece(P.white);limb(L,[[x+4,y-27],lerp(poll,mz,.5).map((v,i)=>v+(i?-2:0)),[mz[0]-5,mz[1]-4]],[2.8,2.4,1.6],P.white[1]);light(L,bl,{base:1,hi:0,lo:2,dark:1});// Blesse
  for(const [ex,f] of [[x-6,1],[x+6,0]]){const e=L.piece(c);poly(L,[[ex-4,y-30],[ex-1+(f?-2:1),y-46],[ex+4,y-31]],c[f?2:1]);light(L,e,{base:f?2:1,hi:1,lo:3,dark:1});line(L,[[ex,y-32],[ex-.5+(f?-1:.5),y-42]],P.dgRosa[2],e);}
  const mn=L.piece(m);limb(L,[[x-4,y-36],[x-12,y-18],[x-15,y+2],[x-14,y+16]],[5,6.5,6,4.5],m[1]);light(L,mn,{base:1,hi:0,lo:2,dark:2});// Mähne am Hals
  for(let k=0;k<8;k++)line(L,[[x-8-k*.9,y-30+k*6],[x-14-k*.5,y-26+k*6]],m[3],mn);
  const fl=L.piece(m);limb(L,[[x+2,y-32],[x+8,y-26],[x+11,y-22]],[3,3.2,2.2],m[0]);light(L,fl,{base:0,hi:0,lo:1,dark:1});// Schopf
  L.piece(P.dgRosa,1);line(L,[[x+19,y-4],[x+24,y-3]],P.dgRosa[1]);// rosa Kostümnaht am Maul
  const sc=L.piece(P.black);poly(L,[[x+2,y+2],[x+9,y+2],[x+8,y+5],[x+3,y+5]],P.black[3]);on(L,sc,x+4,y+3,P.skin[2]);on(L,sc,x+6,y+3,P.skin[2]);}// Sichtgitter (der Träger guckt aus dem Hals)
 /** Kostümrumpf: Hals-Teil über dem Oberkörper, darunter der waagrechte Pferdeleib um die Hüfte, der hinten glatt abgeschnitten endet. */
 function pferdRumpf(L,p){const c=P.dgFuchs,[cx,cy]=p.C,A=p.A,back=!!p.back,fwd=back?[-.78,-.32]:[.78,.32],P0=[p.P[0],p.P[1]-4],rr=Math.max(19,(row(A,30)[2]-row(A,30)[1])/2+9);
  const at=(f,u=0)=>[P0[0]+fwd[0]*f,P0[1]+fwd[1]*f-u],rear=at(-40,4),front=at(16,8);
  // Oberkörper im Halsstück (Mähne liegt hinten auf)
  const j=L.piece(c);poly(L,torso(p,5,-16,24,{flare:1,sway:!p.ride}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});
  // Leib: Kapsel entlang der Blickrichtung, Brust vorn gewölbt
  const b=L.piece(c);limb(L,[at(-48,4),at(-12,6),front],[rr,rr+2,rr-1],c[1]);ell(L,...at(10,4),rr-2,rr+2,c[1]);
  {const bb=L.bb[b];for(let y=bb[1];y<=bb[3];y++)for(let x=bb[0];x<=bb[2];x++)if(L.is(b,x,y)&&(x+.5-rear[0])*fwd[0]+(y+.5-rear[1])*fwd[1]<0)L.del(x,y);}// hinten glatt abgeschnitten
  light(L,b,{base:1,hi:0,lo:2,dark:3});
  line(L,[at(-30,-rr+3),at(12,-rr+5)],c[3],b);// Bauchnaht des Kostüms
  if(back){// Schnittfläche zeigt zur Kamera: Futter, Schaumstoff, großes Pflaster
   const cut=L.piece(P.dgPuder);ell(L,rear[0],rear[1],rr*.82,rr+1,P.dgPuder[1]);light(L,cut,{base:1,hi:0,lo:2,dark:2});ell(L,rear[0],rear[1],rr*.82-3,rr-2,P.dgRosa[0],cut);
   for(const [dx,dy] of [[-6,-8],[5,-3],[-3,6],[7,9],[-9,3]])ell(L,rear[0]+dx,rear[1]+dy,2.4,1.8,P.dgPuder[2],cut);
   const pf=L.piece(P.skin);poly(L,rect(rear,rr*1.9,10,-.5),P.skin[1]);light(L,pf,{base:1,hi:0,lo:2,dark:1});poly(L,rect(rear,11,8,-.5),P.skin[0],pf);
   for(const [dx,dy] of [[-12,7],[-9,4],[10,-5],[13,-8]])on(L,pf,rear[0]+dx,rear[1]+dy,P.skin[3]);return;}
  // von vorn: schmale Schnittfläche (rosa Schaumstoff) hinten, Pflaster über die Kante
  {const cf=L.piece(P.dgRosa);ell(L,rear[0]+2,rear[1],5.6,rr-1,P.dgRosa[1]);ell(L,rear[0]+2.5,rear[1],3.4,rr-4,P.dgRosa[0],cf);light(L,cf,{base:1,hi:0,lo:2,dark:1});}
  {const e=L.piece(c,1),n=[-fwd[1],fwd[0]];for(let t=-rr-1;t<=rr+1;t+=.5)for(const d of [0,1])L.on(b,rear[0]+fwd[0]*d+n[0]*t,rear[1]+fwd[1]*d+n[1]*t,c[d?3:4]);}
  const pf=L.piece(P.skin);poly(L,rect([rear[0]+2,rear[1]],7,rr*1.3,.15),P.skin[1]);light(L,pf,{base:1,hi:0,lo:2,dark:1});poly(L,rect([rear[0]+2,rear[1]],5,7,.15),P.skin[0],pf);}
 function pferdArm(L,p,arm,far){const c=P.dgFuchs,s=sleeve(L,p,arm,c,1,3.4,far,{roll:false,cuff:c});const q=lerp(arm[1],arm[2],.4);ell(L,q[0],q[1],2.4,1.6,c[3],s);
  const {w,u,n}=handGeo(arm),h=P.dgHuf,b=far?2:1,cen=[w[0]+u[0]*5,w[1]+u[1]*5],hf=L.piece(h);poly(L,[[cen[0]-n[0]*5-u[0]*4,cen[1]-n[1]*5-u[1]*4],[cen[0]+n[0]*5-u[0]*4,cen[1]+n[1]*5-u[1]*4],[cen[0]+n[0]*6.5+u[0]*5,cen[1]+n[1]*6.5+u[1]*5],[cen[0]-n[0]*6.5+u[0]*5,cen[1]-n[1]*6.5+u[1]*5]],h[b]);light(L,hf,{base:b,hi:b-1,lo:b+1,dark:1});
  line(L,[[cen[0]-n[0]*6+u[0]*3,cen[1]-n[1]*6+u[1]*3],[cen[0]+n[0]*6+u[0]*3,cen[1]+n[1]*6+u[1]*3]],P.metal[1],hf);// Hufeisen
  const fe=L.piece(P.white);limb(L,[[cen[0]-u[0]*6-n[0]*5,cen[1]-u[1]*6-n[1]*5],[cen[0]-u[0]*6+n[0]*5,cen[1]-u[1]*6+n[1]*5]],[2.4,2.4],P.white[far?2:1]);light(L,fe,{base:far?2:1,hi:far?1:0,lo:3,dark:1});return s;}// weiße Fesseln
 /** Perücke mit Zopf: gepuderte Haube, zwei Lockenrollen je Seite, hinten Zopf mit schwarzer Schleife. */
 function perueckeKopf(L,p){const [x,y]=p.head,c=P.dgPuder,back=!!p.back,h=L.piece(c);
  if(back)poly(L,[[x-21,y+10],[x-21,y-12],[x-14,y-23],[x-2,y-28],[x+10,y-27],[x+20,y-19],[x+22,y-6],[x+22,y+10],[x+15,y+16],[x-13,y+16]],c[1]);
  else poly(L,[[x-21,y+5],[x-21,y-12],[x-14,y-23],[x-2,y-28],[x+10,y-27],[x+20,y-19],[x+22,y-6],[x+22,y+5],[x+17,y-2],[x+12,y-9],[x+2,y-11],[x-8,y-9],[x-15,y-3]],c[1]);
  light(L,h,{base:1,hi:0,lo:2,dark:3});
  for(const [pts,k] of [[[[x-12,y-20],[x-3,y-24],[x+8,y-23]],2],[[[x-16,y-12],[x-8,y-17],[x+2,y-19],[x+12,y-17]],2],[[[x+10,y-22],[x+18,y-15]],3]])line(L,pts,c[k],h);
  if(back)for(const yy of [-4,4,11])line(L,[[x-15,y+yy],[x+1,y+yy+2],[x+16,y+yy]],c[2],h);
  for(const [sx,f] of [[-1,0],[1,1]])for(const dy of [-2,7]){const r=L.piece(c);ell(L,x+sx*22,y+dy,7,4.8,c[f?2:1]);light(L,r,{base:f?2:1,hi:f?1:0,lo:3,dark:1});for(let a=0;a<6.2;a+=.35){const rr=3.6-a*.45;if(rr<.5)break;on(L,r,x+sx*22+Math.cos(a)*rr*1.3,y+dy+Math.sin(a)*rr*.9,c[3]);}}
  if(back){const z=L.piece(c);limb(L,[[x+1,y+12],[x+1.5,y+24],[x+1,y+36]],[4.2,3.6,2.8],c[1]);light(L,z,{base:1,hi:0,lo:2,dark:2});for(let k=0;k<5;k++)line(L,[[x-2,y+16+k*4],[x+4,y+18+k*4]],c[3],z);
   const sl=L.piece(P.black);poly(L,[[x+1,y+16],[x-9,y+10],[x-9,y+22]],P.black[2]);poly(L,[[x+1,y+16],[x+11,y+10],[x+11,y+22]],P.black[2]);ell(L,x+1,y+16,2.4,2.4,P.black[3]);light(L,sl,{base:2,hi:1,lo:3,dark:1});}}
 /** Pappkrone: goldlackierte Pappe mit fünf Zacken, brauner Pappkante, Klebestreifen und aufgemalten Steinen. */
 function krone(L,p){const [x,y]=p.head,g=P.gold,pp=P.dgPappe,b0=y-24,top=y-43,back=!!p.back;
  const e=L.piece(pp);const pts=[[x-17,b0+1],[x-17,top+6]];for(let k=0;k<5;k++){const xx=x-17+k*8.6;pts.push([xx+4.3,top+(k%2?3:0)],[xx+8.6,top+9]);}pts.push([x+26,b0-1]);
  poly(L,pts.map(([a,b])=>[a+1,b-1]),pp[2]);light(L,e,{base:2,hi:1,lo:3,dark:1});// Pappkante oben
  const k=L.piece(g);poly(L,pts,g[1]);light(L,k,{base:1,hi:0,lo:2,dark:2});line(L,[[x-17,b0-5],[x+26,b0-6]],g[3],k);
  if(!back){for(const [dx,col] of [[-9,P.red],[4,P.blue],[17,P.can]]){const s=L.piece(col);ell(L,x+dx,b0-2.5,2.2,2,col[1]);on(L,s,x+dx-1,b0-3.5,col[0]);}
   const t=L.piece(P.tube);poly(L,[[x+7,b0-12],[x+11,b0-12],[x+12,b0+1],[x+8,b0+1]],P.tube[0]);}// Klebestreifen
  else{const t=L.piece(P.tube);poly(L,[[x-1,b0-14],[x+4,b0-14],[x+4,b0+1],[x-1,b0+1]],P.tube[0]);line(L,[[x+1.5,b0-14],[x+1.5,b0]],pp[3],t);}}// Stoß mit Klebeband
 /** Eimerhelm: umgedrehter Farbeimer mit Sehschlitz, Farbnasen, Etikett und Henkel als Kamm. */
 function eimer(L,p){const [x,y]=p.head,c=P.dgEimer,back=!!p.back,top=y-34,bot=y+14;
  const hk=L.piece(P.dgZink);limb(L,[[x-17,top+10],[x-12,top-4],[x+1,top-10],[x+15,top-4],[x+20,top+10]],[1.2,1.2,1.2,1.2,1.2],P.dgZink[2]);const gr=L.piece(P.black);ell(L,x+1,top-10,4.5,2.4,P.black[2]);light(L,gr,{base:2,hi:1,lo:3,dark:1});// Henkel als Kamm
  const b=L.piece(c);poly(L,[[x-17,top],[x+19,top],[x+23,bot],[x-21,bot]],c[1]);light(L,b,{base:1,hi:0,lo:2,dark:3});ell(L,x+1,top,18,3.4,c[2],b);
  for(const yy of [top+4,bot-5])line(L,[[x-19+(yy-top)*.09,yy],[x+21-(bot-yy)*.1,yy]],c[3],b);line(L,[[x-21,bot-2],[x+23,bot-2]],c[3],b);
  const et=L.piece(P.dgFarbe);poly(L,[[x-19.6,y+1],[x+21.4,y+1],[x+22,y+8],[x-20.3,y+8]],P.dgFarbe[1]);light(L,et,{base:1,hi:0,lo:2,dark:1});
  if(!back){K.text(L,et,x-7,y+2,'FARBE',P.white[0],0);const sl=L.piece(P.black);poly(L,[[x-12,y-7],[x+15,y-8],[x+15,y-3],[x+2,y-2],[x-12,y-3]],P.black[4]);on(L,sl,x-4,y-5,P.white[0]);on(L,sl,x+8,y-5,P.white[0]);}// Sehschlitz mit Augen
  for(const [dx,col,l] of [[-11,P.blue,9],[6,P.red,6],[15,P.can,11]]){const d=L.piece(col);limb(L,[[x+dx,top+1],[x+dx+.3,top+l]],[1.4,1.1],col[1]);ell(L,x+dx+.3,top+l,1.6,1.6,col[1]);}}// Farbnasen
 /** Umgedrehte Basecap: Kappe, Schirm nach hinten. */
 function cap(L,p){const [x,y]=p.head,c=P.dgSchwarz,back=!!p.back,t=L.piece(c);poly(L,[[x-19,y-11],[x-18,y-22],[x-8,y-30],[x+8,y-30],[x+18,y-23],[x+21,y-11]],c[1]);light(L,t,{base:1,hi:0,lo:2,dark:3});
  line(L,[[x+1,y-30],[x+1,y-12]],c[3],t);const kn=L.piece(c);ell(L,x+1,y-29,2.2,1.4,c[2]);
  const bd=L.piece(c);poly(L,[[x-19,y-14],[x+21,y-14],[x+21,y-10],[x-19,y-10]],c[2]);light(L,bd,{base:2,hi:1,lo:3,dark:1});
  if(back){const s=L.piece(c);poly(L,[[x-12,y-12],[x+14,y-12],[x+17,y-4],[x-15,y-4]],c[2]);light(L,s,{base:2,hi:1,lo:3,dark:2});line(L,[[x-13,y-6],[x+15,y-6]],P.dgGelb[2],s);return;}
  const s=L.piece(c);poly(L,[[x-17,y-16],[x-31,y-15],[x-32,y-11],[x-18,y-10]],c[3]);light(L,s,{base:3,hi:2,lo:4,dark:1});
  const og=L.piece(c);poly(L,[[x-3,y-14],[x+5,y-14],[x+4,y-19],[x-2,y-19]],null,'del');}// Verschlussöffnung vorn (Stirnhaar schaut durch)
 /** Kinder-Headset mit Katzenohren: dicker rosa Bügel, Katzenohren obenauf, türkise Muschel mit Stern, Mikrofonarm zum Mund. */
 function headset(L,p){const [x,y]=p.head,back=!!p.back,r=P.dgRosa,s=L.piece(r);limb(L,[[x-19,y-3],[x-17,y-15],[x-9,y-24],[x+3,y-27],[x+14,y-22],[x+20,y-12],[x+21,y-4]],[2.4,2.4,2.4,2.4,2.4,2.4,2.4],r[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});
  for(const [ex,ey,f] of [[x-9,y-25,0],[x+11,y-25,1]]){const o=L.piece(r);poly(L,[[ex-6,ey+2],[ex-3,ey-9],[ex+5,ey+1]],r[f?2:1]);poly(L,[[ex-3,ey+1],[ex-2,ey-5],[ex+2,ey+1]],r[0],o);light(L,o,{base:f?2:1,hi:0,lo:3,dark:1});}
  for(const [mx,f] of (back?[[x-20,0],[x+21,1]]:[[x-19,0]])){const m=L.piece(P.dgTuerkis);ell(L,mx,y+1,5,6.2,P.dgTuerkis[f?2:1]);light(L,m,{base:f?2:1,hi:f?1:0,lo:3,dark:1});on(L,m,mx-1,y,P.dgGelb[0]);on(L,m,mx,y-1,P.dgGelb[0]);on(L,m,mx,y+1,P.dgGelb[1]);}
  if(!back){const mc=L.piece(r);limb(L,[[x-17,y+4],[x-11,y+12],[x-2,y+13]],[1.3,1.3,1.3],r[2]);const k=L.piece(P.black);ell(L,x-1,y+13,2.6,2.2,P.black[2]);}}
 /** Absperrpfosten mit Samtseil (Türsteher): Messingpfosten mit Kugel, rote Kordel in der Schlaufe, Fuß als Scheibe. Nach außen geneigt. */
 function pfosten(L,p){const [hx,hy]=handPos(p.armN),o=p.swap?1:-1,m=P.dgMessing,top=[hx+o*8,hy-26],bot=[hx-o*4,hy+34];
  const sa=L.piece(P.dgSamt);limb(L,[[top[0]+o*3,top[1]+2],[top[0]+o*12,top[1]+16],[top[0]+o*16,top[1]+32],[top[0]+o*14,top[1]+44],[top[0]+o*10,top[1]+48]],[2.8,3,3.2,3,2.4],P.dgSamt[1]);light(L,sa,{base:1,hi:0,lo:2,dark:1});
  for(let k=0;k<5;k++){const q=[top[0]+o*(5+k*2.6),top[1]+6+k*8.5];on(L,sa,q[0],q[1],P.dgSamt[0]);}// Samtglanz
  const hk=L.piece(m);ell(L,top[0]+o*10,top[1]+49,2.4,2.4,m[1]);light(L,hk,{base:1,hi:0,lo:2,dark:1});
  const st=L.piece(m);limb(L,[top,bot],[3,3.3],m[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});line(L,[[top[0]-1.4,top[1]+4],[bot[0]-1.6,bot[1]-4]],m[0],st);
  const kg=L.piece(m);ell(L,top[0],top[1]-3,5.6,5.4,m[1]);light(L,kg,{base:1,hi:0,lo:2,dark:1});on(L,kg,top[0]-2,top[1]-5,m[0]);on(L,kg,top[0]-1,top[1]-5,[255,255,255]);
  const fu=L.piece(m);ell(L,bot[0],bot[1]+1,10,4,m[2]);ell(L,bot[0],bot[1]-1,6,2.6,m[1]);light(L,fu,{base:2,hi:1,lo:3,dark:2});handOver(L,p.armN);}
 /** Spielzeugfunk: gelbes Walkie-Talkie mit roter Taste und Antenne mit Kugel. */
 function funk(L,p){const [hx,hy]=handPos(p.armN),g=P.dgGelb;// am Kopfende gehalten, hängt unter der Faust (bleibt in der fernen Hand sichtbar)
  const an=L.piece(P.black);limb(L,[[hx+4,hy-2],[hx+4,hy-13]],[1.2,1],P.black[2]);const kg=L.piece(P.red);ell(L,hx+4,hy-14,2.2,2.2,P.red[1]);on(L,kg,hx+3,hy-15,P.red[0]);
  const b=L.piece(g);poly(L,[[hx-6,hy-3],[hx+6,hy-3],[hx+6,hy+18],[hx-6,hy+18]],g[1]);light(L,b,{base:1,hi:0,lo:2,dark:2});
  for(let k=0;k<3;k++)line(L,[[hx-4,hy+8+k*2],[hx+4,hy+8+k*2]],g[3],b);const t=L.piece(P.red);ell(L,hx,hy+4,2,1.6,P.red[1]);on(L,t,hx-1,hy+3,P.red[0]);
  handOver(L,p.armN);}
 /** Handy hochkant unter der Faust (in der fernen Hand noch sichtbar), Bildschirm hell. */
 function handy(L,p){const [hx,hy]=handPos(p.armN),b=L.piece(P.black);poly(L,[[hx-6,hy+1],[hx+6,hy+1],[hx+6,hy+21],[hx-6,hy+21]],P.black[3]);light(L,b,{base:3,hi:2,lo:4,dark:1});
  const s=L.piece(P.dgTuerkis);poly(L,[[hx-4.5,hy+3],[hx+4.5,hy+3],[hx+4.5,hy+18.5],[hx-4.5,hy+18.5]],P.dgTuerkis[0]);light(L,s,{base:0,hi:0,lo:1,dark:1});on(L,s,hx+2,hy+5,[255,255,255]);
  const cm=L.piece(P.red);ell(L,hx-4,hy+2,1.2,1.2,P.red[1]);handOver(L,p.armN);}
 /** Selfie-Stick wie ein Zepter: kräftige Teleskopstange schräg nach außen, oben Klemme mit Handy (Rückseite dunkel) und kühlem LED-Ring. */
 function selfiestick(L,p){const [hx,hy]=handPos(p.armN),m=P.metal;
  const o=p.swap?1:-1,q=t=>[hx+o*t*.38,hy-t*.92],st=L.piece(m);limb(L,[q(-5),q(14)],[2.8,2.6],P.black[2]);limb(L,[q(14),q(34)],[2.1,1.9],m[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});// nach außen geneigt (Seitenregel wie die Waffe)
  for(const t of [14,24])line(L,[[q(t)[0]-2,q(t)[1]],[q(t)[0]+2,q(t)[1]]],m[0],st);
  const c0=q(42),r=L.piece(P.tube);ell(L,c0[0],c0[1],9,8.6,P.tube[1]);ell(L,c0[0],c0[1],5.8,5.4,null,'del');light(L,r,{base:1,hi:0,lo:2,dark:1});for(let k=0;k<10;k++){const a=k/10*Math.PI*2;on(L,r,c0[0]+Math.cos(a)*7.4,c0[1]+Math.sin(a)*7,P.white[0]);}
  const ph=L.piece(P.black);poly(L,[[c0[0]-5,c0[1]-3.5],[c0[0]+5,c0[1]-3.5],[c0[0]+5,c0[1]+3.5],[c0[0]-5,c0[1]+3.5]],P.black[3]);light(L,ph,{base:3,hi:2,lo:4,dark:1});on(L,ph,c0[0]+3,c0[1]-2,P.red[1]);
  handOver(L,p.armN);}
 /** Gelber Zollstock, halb aufgeklappt. */
 function zollstock(L,p){const [hx,hy]=handPos(p.armN),c=P.rain,a=[hx,hy-4],b=[hx+1,hy+22],d=[hx+10,hy+30],s=L.piece(c);limb(L,[a,b],[2,2],c[1]);limb(L,[b,d],[2,2],c[2]);light(L,s,{base:1,hi:0,lo:2,dark:1});
  for(let k=1;k<8;k++){const q=lerp(a,b,k/8);on(L,s,q[0]-1,q[1],P.black[3]);}for(let k=1;k<4;k++){const q=lerp(b,d,k/4);on(L,s,q[0],q[1]-1,P.black[3]);}on(L,s,b[0],b[1],P.metal[1]);handOver(L,p.armN);}
 /** Neongrüne Thermoskanne mit silbernem Becher-Deckel, Dampf steigt auf: das Erkennungszeichen des Heilers („Provision“). Hängt unter der Faust. */
 function thermo(L,p){const [hx,hy]=handPos(p.armN),g=P.dgThermo,b=L.piece(g);poly(L,[[hx-6,hy+1],[hx+6,hy+1],[hx+6.5,hy+25],[hx-6.5,hy+25]],g[1]);light(L,b,{base:1,hi:0,lo:2,dark:2});
  line(L,[[hx-6,hy+9],[hx+6,hy+9]],g[3],b);line(L,[[hx-4,hy+3],[hx-4,hy+23]],g[0],b);
  const d=L.piece(P.metal);poly(L,[[hx-5,hy-4],[hx+5,hy-4],[hx+5.5,hy+2],[hx-5.5,hy+2]],P.metal[1]);light(L,d,{base:1,hi:0,lo:2,dark:1});
  const dm=L.piece(P.white,1);for(const [dx,dy] of [[-2,-8],[1,-11],[-1,-14],[2,-17]])ell(L,hx+dx,hy+dy,1.8,1.5,P.white[dy<-12?2:1]);handOver(L,p.armN);}
 /** Jacke überm Arm: beige Übergangsjacke über dem Unterarm der Nebenhand. */
 function jacke(L,p){const {w,u,n}=handGeo(p.armF),c=P.nkTweed,q=[w[0]-u[0]*9,w[1]-u[1]*9],j=L.piece(c);
  poly(L,[[q[0]-9,q[1]-3],[q[0]+9,q[1]-4],[q[0]+11,q[1]+18],[q[0]+5,q[1]+26],[q[0]-2,q[1]+22],[q[0]-8,q[1]+28],[q[0]-11,q[1]+14]],c[1]);light(L,j,{base:1,hi:0,lo:2,dark:2});
  for(const dx of [-5,1,6])line(L,[[q[0]+dx,q[1]],[q[0]+dx+(dx>0?1:-1),q[1]+20]],c[3],j);const k=L.piece(c);ell(L,q[0]-7,q[1]+27,2.6,2,c[3]);handOver(L,p.armF,true);}
 /** Tablet (Makler): dunkler Rahmen, heller Bildschirm mit Haus; von hinten silbern mit Aufkleber. */
 function tablet(L,p){const [hx,hy]=handPos(p.armF),back=!!p.back,cx=hx+(back?1:-8),cy=hy-8,a=back?.05:-.1,fr=L.piece(back?P.metal:P.black);
  poly(L,rect([cx,cy],17,22,a),(back?P.metal:P.black)[back?1:3]);light(L,fr,{base:back?1:3,hi:back?0:2,lo:back?2:4,dark:1});
  if(back){const s=L.piece(P.lgLachs);poly(L,rect([cx+2,cy+4],6,5,a),P.lgLachs[1]);handOver(L,p.armF);return;}
  const s=L.piece(P.dgTuerkis);poly(L,rect([cx,cy],14,19,a),P.dgTuerkis[0]);light(L,s,{base:0,hi:0,lo:1,dark:1});
  const hs=L.piece(P.lgLachs);poly(L,[[cx-4,cy+5],[cx+4,cy+4],[cx+4,cy-1],[cx,cy-5],[cx-4,cy-1]],P.lgLachs[1]);on(L,hs,cx-1,cy+2,P.black[3]);on(L,hs,cx-1,cy+3,P.black[3]);// Haus im Exposé
  line(L,[[cx-5,cy+8],[cx+5,cy+7]],P.dgTuerkis[2],s);handOver(L,p.armF);}
 /** Weinglas mit Rotwein am Stiel. */
 function weinglas(L,p){const [hx,hy]=handPos(p.armF),g=P.tube,w=P.faWein;
  const st=L.piece(g);limb(L,[[hx,hy+3],[hx,hy-8]],[.9,.9],g[2]);ell(L,hx,hy+4,3.6,1.2,g[1]);
  const b=L.piece(g);ell(L,hx,hy-14,5.4,6.4,g[0]);light(L,b,{base:0,hi:0,lo:1,dark:1});ell(L,hx,hy-11.5,4.6,3.6,w[2],b);ell(L,hx,hy-13.2,4.4,.8,w[1],b);on(L,b,hx-3,hy-17,[255,255,255]);on(L,b,hx-3,hy-16,[255,255,255]);
  handOver(L,p.armF);}
 /** Mülltonnendeckel als Schild: runder Zinkdeckel mit Rillenringen, Griffbügel vorn. */
 function tonnendeckel(L,p){const [hx,hy]=handPos(p.armF),z=P.dgZink,back=!!p.back,cx=hx+(back?1:-14),cy=hy-(back?2:9),d=L.piece(z);
  ell(L,cx,cy,22,19.5,z[back?2:1],null,-.15);light(L,d,{base:back?2:1,hi:back?1:0,lo:back?3:2,dark:3,share:.34});
  for(const k of [16.5,11,5.5]){for(let a=0;a<Math.PI*2;a+=.03){const X=cx+Math.cos(a)*k*1.12,Y=cy+Math.sin(a)*k;on(L,d,X,Y,Math.sin(a+.8)<-.2?z[0]:z[3]);}}
  if(!back){const gb=L.piece(z);limb(L,[[cx-7,cy+1],[cx-4,cy-4],[cx+4,cy-4],[cx+7,cy+1]],[1.8,1.8,1.8,1.8],P.black[2]);line(L,[[cx+6,cy+8],[cx+12,cy+4]],z[3],d);line(L,[[cx+7,cy+9],[cx+12,cy+6]],z[0],d);}// Griffbügel, Delle
  handOver(L,p.armF);}
 /** Regenrinne als Schwert: halbrunde Zinkrinne, Rinnenhaken als Parierstange, Griff aus Klebeband. */
 function rinne(L,p){const [hx,hy]=handPos(p.armN),z=P.dgZink;
  const bl=L.piece(z);limb(L,[[hx,hy+6],[hx,hy+42]],[4.6,3.8],z[1]);light(L,bl,{base:1,hi:0,lo:2,dark:2});line(L,[[hx+1,hy+8],[hx+1,hy+40]],z[3],bl);line(L,[[hx-2,hy+8],[hx-2,hy+39]],z[0],bl);line(L,[[hx+2,hy+9],[hx+2,hy+39]],z[4],bl);
  const hk=L.piece(z);limb(L,[[hx-11,hy+3],[hx,hy+6],[hx+11,hy+2],[hx+12,hy-2]],[1.8,1.8,1.8,1.4],z[2]);light(L,hk,{base:2,hi:1,lo:3,dark:1});
  const gr=L.piece(P.dgAlu);limb(L,[[hx,hy-7],[hx,hy+4]],[2.2,2.2],P.dgAlu[2]);light(L,gr,{base:2,hi:1,lo:3,dark:1});const kn=L.piece(z);ell(L,hx,hy-8,3,2.6,z[1]);light(L,kn,{base:1,hi:0,lo:2,dark:1});
  handOver(L,p.armN);}
 /** VERKAUFT-Schild an einem kurzen Holzstiel: rot-weißes Brett, nach außen gehalten (Seitenregel wie die Waffe). */
 function schild(L,p){const [hx,hy]=handPos(p.armN),o=p.swap?1:-1,w=P.wood,st=L.piece(w),top=[hx+o*8,hy-20];limb(L,[[hx-o*2,hy+14],top],[2.4,2.2],w[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});
  const c=[top[0]+o*10,top[1]-15],b=L.piece(P.white);poly(L,[[c[0]-24,c[1]-15],[c[0]+24,c[1]-15],[c[0]+24,c[1]+15],[c[0]-24,c[1]+15]],P.white[1]);light(L,b,{base:1,hi:0,lo:2,dark:2,share:.2});
  const rb=L.piece(P.red);poly(L,[[c[0]-24,c[1]-15],[c[0]+24,c[1]-15],[c[0]+24,c[1]-4],[c[0]-24,c[1]-4]],P.red[1]);light(L,rb,{base:1,hi:0,lo:2,dark:1});
  const ec=L.piece(P.red);poly(L,[[c[0]-24,c[1]+15],[c[0]-24,c[1]+2],[c[0]-11,c[1]+15]],P.red[2]);// rote Schrägecke wie beim Maklerschild
  K.text(L,b,c[0]-15,c[1]+1,'VERKAUFT',P.red[2],0);K.text(L,b,c[0]-14,c[1]+2,'VERKAUFT',P.red[2],0);K.text(L,rb,c[0]-7,c[1]-12,'DR. X',P.white[0],0);handOver(L,p.armN);}
 /** Sonnenbrille hoch ins Haar geschoben (vorn über dem Haaransatz). */
 function haarbrille(L,p){if(p.back)return;const [x,y]=p.head,b=L.piece(P.black);for(const dx of [-8,8]){ell(L,x+dx,y-17,5,3.2,P.black[3]);}line(L,[[x-3,y-17],[x+3,y-18]],P.black[2],b);light(L,b,{base:3,hi:2,lo:4,dark:1});on(L,b,x-10,y-18,P.white[1]);on(L,b,x+6,y-19,P.white[1]);}
 /** Schlüsselbund am Gürtel: großer Ring mit vielen Schlüsseln (Vermieter), an der nahen Hüfte. */
 function schluessel(L,p){const [cx,cy]=p.C,x=cx+row(p.A,34)[1]+1,y=cy+34,m=P.metal,rg=L.piece(m);for(let a=0;a<Math.PI*2;a+=.1)K.line(L,[[x+Math.cos(a)*5,y+6+Math.sin(a)*4],[x+Math.cos(a)*5,y+6+Math.sin(a)*4]],m[1]);
  L.piece(P.black,1);line(L,[[x,y-2],[x,y+2]],P.black[2]);
  for(const [a,col] of [[.6,P.gold],[1.2,m],[1.8,P.gold],[2.4,m],[3,m],[.1,P.gold]]){const b=[x+Math.cos(a)*5,y+6+Math.sin(a)*4],e=[b[0]+Math.cos(a+.3)*3,b[1]+8],k=L.piece(col);limb(L,[b,e],[1.4,1],col[1]);ell(L,b[0],b[1],1.8,1.6,col[2]);}}
 /** Fellbüschel: unregelmäßige Strähnen (2–4 px, schräg nach unten) in drei Tönen, Lage und Länge aus dem Rauschen am Anker a (wandert mit
  *  dem Mantel), ein Teil ausgelassen; an der Außenkante stehen Zotteln ab. Liest sich in Weltgröße als unruhiges Fell statt als Muster. */
 function buschel(L,j,c,a){const b=L.bb[j];if(!b||b[2]<0)return;const ax=Math.round(a[0]),ay=Math.round(a[1]),set=[];
  for(let y=b[1];y<=b[3];y+=3)for(let x=b[0];x<=b[2];x+=3){const k=K.hsA(x-ax,y-ay),k2=K.hsA(y-ay+17,x-ax+5);if(k<.22)continue;
   const X=x+Math.round((k2-.5)*3),Y=y+Math.round((k-.5)*2);if(!L.is(j,X,Y)||!L.is(j,X,Y+3))continue;set.push([X,Y,k,k2]);}
  for(const [x,y,k,k2] of set){const len=2+Math.floor(k2*3),dx=k>.6?1:k<.4?-1:0;
   L.on(j,x,y,k>.75?c[0]:c[1]);for(let i=1;i<=len;i++)L.on(j,x+Math.round(dx*i/2),y+i,i===len?c[3]:c[2]);}
  for(let y=b[1];y<=b[3];y+=2){let xl=-1,xr=-1;for(let x=b[0];x<=b[2];x++)if(L.is(j,x,y)){if(xl<0)xl=x;xr=x;}if(xl<0)continue;const k=K.hsA(ax+y,ay-y);
   if(k>.45){L.px(xl-1,y,c[2]);if(k>.7)L.px(xl-2,y+1,c[3]);}if(k<.55){L.px(xr+1,y,c[3]);if(k<.3)L.px(xr+2,y+1,c[3]);}}}
 /** Big Bs Boss-Pelz (nicht die Dorflegende der Helden): viel zu groß – Glocke bis auf den Boden (staucht sich dort), Ärmel über die Hände,
  *  riesiger Hermelinkragen, violettes Futter, Leihzettel. Sitzt auf jedem Archetyp, wirkt auf dem drahtigen am lächerlichsten. */
 function pelzBossArm(L,p,arm,far){const c=P.dgPelz,h=P.dgHermelin,s=sleeve(L,p,arm,c,1,4,far,{roll:false,cuff:c});buschel(L,s,c,arm[0]);
  const {w,u,n}=handGeo(arm),r=p.A.armR[2]+4.5,e=[w[0]+u[0]*8,w[1]+u[1]*8],st=L.piece(h);poly(L,[[w[0]-n[0]*(r-1),w[1]-n[1]*(r-1)],[w[0]+n[0]*(r-1),w[1]+n[1]*(r-1)],[e[0]+n[0]*(r+2),e[1]+n[1]*(r+2)],[e[0]-n[0]*(r+2),e[1]-n[1]*(r+2)]],h[far?2:1]);light(L,st,{base:far?2:1,hi:far?1:0,lo:3,dark:1});// Stulpe über der Hand
  for(const t of [-.6,0,.6])on(L,st,e[0]+n[0]*r*t,e[1]+n[1]*r*t,P.black[3]);
  return s;}
 function pelzBossRumpf(L,p){const c=P.dgPelz,h=P.dgHermelin,v=P.lgViolett,[cx,cy]=p.C,A=p.A,floor=K.GROUND-1-cy,hem=p.ride?44:Math.min(floor,122),ext=p.ride?0:Math.max(0,hem-46);
  const pts=torso(p,10,-16,hem,{flare:p.ride?2:5.2,sway:!p.ride,extend:ext}).map(([x,y])=>[x,Math.min(y,K.GROUND-1)]);// Glocke, staucht sich am Boden
  const j=L.piece(c);poly(L,pts,c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3,share:.26});buschel(L,j,c,p.C);
  for(const [arm,sd] of [[p.armF,1],[p.armN,-1]]){const sh=arm[0],pd=L.piece(c);ell(L,sh[0]+sd*3,sh[1]+3,A.armR[0]+12,A.armR[0]+8,c[sd>0?2:1]);light(L,pd,{base:sd>0?2:1,hi:sd>0?1:0,lo:3,dark:2});buschel(L,pd,c,sh);}// ausladende Schultern (im Rumpfband: die Ärmel bleiben am Arm)
  const lo=Math.min(cy+hem,K.GROUND-1);if(!p.ride&&cy+hem>=K.GROUND-3){const pf=L.piece(c);ell(L,cx+(p.sway||0)*2,K.GROUND-2,(pts[pts.length-1][0]-pts[0][0])/2+5,3.2,c[2]);light(L,pf,{base:2,hi:1,lo:3,dark:1});}// Saum liegt auf
  const sl=cx+A.sh[0]-10,sr=cx+A.sh[1]+10,mx=(sl+sr)/2,rx=(sr-sl)/2+6,nr=neck(p)+2;
  if(p.back){line(L,[[cx+1,cy-6],[cx+1+(p.sway||0),lo-2]],c[3],j);const k=L.piece(h);ell(L,mx,cy-9,rx+2,11,h[1]);for(const t of [-.8,-.4,0,.4,.8])ell(L,mx+t*rx,cy+2-Math.abs(t)*3,3.6,3,h[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});
   for(const [t,dy] of [[-.55,-9],[.1,-5],[.6,-10],[-.2,-1]])on(L,k,mx+t*rx,cy+dy,P.black[3]);return;}
  const f=L.piece(v);poly(L,[[cx-2,cy+1],[cx+5,cy+1],[cx+9+(p.sway||0)*2,lo-2],[cx-6+(p.sway||0)*2,lo-2]],v[2]);light(L,f,{base:2,hi:1,lo:3,dark:1});// Futter im offenen Mantel
  L.piece(c,1);line(L,[[cx-3,cy+2],[cx-7+(p.sway||0)*2,lo-2]],c[0]);line(L,[[cx+6,cy+2],[cx+10+(p.sway||0)*2,lo-2]],c[3]);
  const k=L.piece(h);ell(L,mx,cy-6,rx+2,14,h[1]);for(const t of [-.9,-.6,-.3,.3,.6,.9])ell(L,mx+t*rx,cy+7-Math.abs(t)*5,3.8,3.2,h[1]);// riesiger Schalkragen
  poly(L,[[cx-nr+2.5,cy-21],[cx+nr+.5,cy-21],[cx+2.2,cy+2],[cx+.4,cy+2]],null,'del');light(L,k,{base:1,hi:0,lo:2,dark:1});
  for(const [t,dy] of [[-.7,-6],[-.4,4],[.65,-7],[.45,5],[0,8]])on(L,k,mx+t*rx,cy+dy,P.black[3]);
  L.piece(P.label,1);line(L,[[cx+12,cy+30],[cx+14,cy+38]],P.label[2]);const z=L.piece(P.label);poly(L,[[cx+10,cy+38],[cx+27,cy+38],[cx+27,cy+45],[cx+10,cy+45]],P.label[0]);light(L,z,{base:0,hi:0,lo:1,dark:1});K.text(L,z,cx+12,cy+39,'LEIH',P.red[2],0);}// Leihzettel
 /** Kellnermesser des Bosses: Messinggriff quer in der Faust, lange helle Spirale mit dunklen Gängen, ein Korken steckt auf der Spitze. */
 function korkenBoss(L,p){const [hx,hy]=handPos(p.armN),m=P.dgMessing,o=p.swap?1:-1;
  const g=L.piece(m);limb(L,[[hx-o*9,hy-1],[hx+o*9,hy-1]],[2.8,2.8],m[1]);light(L,g,{base:1,hi:0,lo:2,dark:2});for(const d of [-9,9]){const kn=L.piece(m);ell(L,hx+o*d,hy-1,3.4,3.2,m[2]);light(L,kn,{base:2,hi:1,lo:3,dark:1});}
  const sh=L.piece(P.metal);limb(L,[[hx,hy+2],[hx,hy+8]],[2,2],P.metal[1]);light(L,sh,{base:1,hi:0,lo:2,dark:1});
  const sp=L.piece(P.metal);for(let t=0;t<=24;t+=.5){const y=hy+8+t,x=hx+Math.sin(t*.9)*3.4;L.px(x,y,Math.cos(t*.9)>0?P.metal[0]:P.black[3]);L.px(x+(Math.cos(t*.9)>0?1:-1),y,Math.cos(t*.9)>0?P.metal[1]:P.black[4]);}
  const kk=L.piece(P.dgPappe);poly(L,[[hx-5,hy+30],[hx+5,hy+30],[hx+4.5,hy+42],[hx-4.5,hy+42]],P.dgPappe[0]);light(L,kk,{base:0,hi:0,lo:1,dark:2});line(L,[[hx-4,hy+33],[hx+4,hy+33]],P.red[2],kk);line(L,[[hx-4,hy+34],[hx+4,hy+34]],P.red[2],kk);on(L,kk,hx-2,hy+38,P.dgPappe[3]);on(L,kk,hx+2,hy+36,P.dgPappe[3]);// Korken mit Weinrand
  handOver(L,p.armN);}
 /** Pumps: schwarz lackiert, Absatz, Spann frei. */
 function pumps(L,p,leg,toe,far){const c=P.black;boot(L,p,leg,toe,c,.97,far,'pumps');const a=leg[2],h=L.piece(c);limb(L,[[a[0]-4,a[1]+4],[a[0]-5,a[1]+9]],[1.4,1],c[2]);
  L.piece(c,1);line(L,[[toe[0]-3,toe[1]+1],[toe[0]+1,toe[1]]],c[0]);const sp=L.piece(P.skin);ell(L,(a[0]+toe[0])/2,(a[1]+toe[1])/2+.5,3.4,1.6,P.skin[far?2:1]);}
 /** Turnschuhe: weiß mit dicker Sohle und blauem Streifen. */
 function sneaker(L,p,leg,toe,far){const c=P.white;boot(L,p,leg,toe,c,.9,far,'schuh');const a=leg[2],so=L.piece(c);poly(L,[[a[0]-8,a[1]+5],[toe[0]+6,toe[1]+2],[toe[0]+5,toe[1]+6],[a[0]-8,a[1]+8]],c[far?2:1]);light(L,so,{base:far?2:1,hi:far?1:0,lo:3,dark:1});
  const s=L.piece(P.blue,1);line(L,[[a[0]-3,a[1]+3],[a[0]+3,a[1]+1],[toe[0]-1,toe[1]+2]],P.blue[1]);}
 /** Reitstiefel: schwarz bis unters Knie, Stulpe aus hellem Leder, Sporn. */
 function reitstiefel(L,p,leg,toe,far){const c=P.black,b=far?2:1;boot(L,p,leg,toe,c,.42,far,'reit');const t=seg(leg,.42,.44)[0],r=segR(p.A.legR,.42,.44)[0]+2.4,s=L.piece(P.dgLeder);
  poly(L,[[t[0]-r-1,t[1]-2],[t[0]+r+1,t[1]-2],[t[0]+r,t[1]+6],[t[0]-r,t[1]+6]],P.dgLeder[b]);light(L,s,{base:b,hi:b-1,lo:b+1,dark:1});
  const a=leg[2],sp=L.piece(P.gold);line(L,[[a[0]-7,a[1]+2],[a[0]-11,a[1]+1]],P.gold[1]);ell(L,a[0]-11.5,a[1]+1,1.2,1.2,P.gold[2]);}

 const gear={
  securityanzug:{slot:'body',name:'Security-Anzug (zu klein)',armHinten(L,p){secArm(L,p,p.armF,true);},armVorn(L,p){secArm(L,p,p.armN,false);},rumpf:secRumpf},
  securitypolo:{slot:'body',name:'Security-Polo (zu groß)',armHinten(L,p){poloArm(L,p,p.armF,true);},armVorn(L,p){poloArm(L,p,p.armN,false);},rumpf(L,p){poloRumpf(L,p,false);}},
  konfirmationsanzug:{slot:'body',name:'Konfirmationsanzug',armHinten(L,p){konfiArm(L,p,p.armF,true);},armVorn(L,p){konfiArm(L,p,p.armN,false);},rumpf:konfiRumpf,
   beinHinten(L,p){hosenbein(L,p,p.legF,P.dgKonfi,true,{pad:2.2,to:.97,bunch:true});},beinVorn(L,p){hosenbein(L,p,p.legN,P.dgKonfi,false,{pad:2.2,to:.97,bunch:true});}},
  hosenanzug:{slot:'body',name:'Hosenanzug in Petrol',armHinten(L,p){lachsArm(L,p,p.armF,true);},armVorn(L,p){lachsArm(L,p,p.armN,false);},rumpf:lachsRumpf,
   beinHinten(L,p){hosenbein(L,p,p.legF,P.dgAnzugRosa,true,{pad:2.4,to:.95,crease:true});},beinVorn(L,p){hosenbein(L,p,p.legN,P.dgAnzugRosa,false,{pad:2.4,to:.95,crease:true});}},
  bomberjacke:{slot:'body',name:'Bomberjacke in Neonpink',armHinten(L,p){bomberArm(L,p,p.armF,true);},armVorn(L,p){bomberArm(L,p,p.armN,false);},rumpf(L,p){bomberRumpf(L,p,false);}},
  regenrinnenpanzer:{slot:'body',name:'Regenrinnen-Panzer',armHinten(L,p){panzerArm(L,p,p.armF,true);},armVorn(L,p){panzerArm(L,p,p.armN,false);},rumpf(L,p){panzerRumpf(L,p,false);}},
  pferdekostuem:{slot:'body',name:'Das halbe Pferd (Kostüm, Fuchs)',armHinten(L,p){pferdArm(L,p,p.armF,true);},armVorn(L,p){pferdArm(L,p,p.armN,false);},rumpf:pferdRumpf,kopf:pferdKopf},
  lueftungsbeine:{slot:'legs',name:'Lüftungsrohr-Beine',beinHinten(L,p){rohrBein(L,p,p.legF,true);},beinVorn(L,p){rohrBein(L,p,p.legN,false);},
   rumpf(L,p){const c=P.dgAlu,j=L.piece(c);poly(L,torso(p,1.8,28,48),c[2]);light(L,j,{base:2,hi:1,lo:3,dark:2});for(let y=p.C[1]+31;y<p.C[1]+48;y+=4)line(L,[[p.C[0]-26,y],[p.C[0]+26,y+1]],c[3],j);}},
  weste:{slot:'waist',name:'Sommelierweste',rumpf:westeRumpf},
  kellerschuerze:{slot:'charm',name:'Kellerschürze',rumpf:schuerzeRumpf},
  greenscreen:{slot:'shoulders',name:'Greenscreen-Umhang',haarHinten(L,p){cape(L,p,false);},
   rumpf(L,p){const [cx,cy]=p.C,A=p.A,c=P.dgChroma;for(const [x,f] of [[cx+A.sh[0]+3,0],[cx+A.sh[1]-2,1]]){const s=L.piece(c);limb(L,[[x,cy-16],[x+(f?2:-2),cy-8]],[2.2,2],c[f?2:1]);}
    for(const x of [cx-8,cx+10]){const k=L.piece(P.black);poly(L,[[x-2,cy-13],[x+2,cy-13],[x+2,cy-9],[x-2,cy-9]],P.black[2]);on(L,k,x,cy-12,P.metal[0]);}}},
  'ringlicht-halo':{slot:'neck',name:'Ringlicht als Heiligenschein',haarHinten(L,p){halo(L,p,true);}},
  peruecke:{slot:'head',name:'Perücke mit Zopf',kopf:perueckeKopf},
  pappkrone:{slot:'head',name:'Pappkrone',kopf:krone},
  eimerhelm:{slot:'head',name:'Eimerhelm',kopf:eimer},
  basecap:{slot:'head',name:'Basecap (verkehrt herum)',kopf:cap},
  kinderheadset:{slot:'head',offen:true,name:'Kinder-Headset',kopf:headset},
  absperrpfosten:{slot:'weapon',hands:1,name:'Absperrpfosten mit Samtseil',armVorn:pfosten},
  thermoskanne:{slot:'weapon',hands:1,name:'Neon-Thermoskanne',armVorn:thermo},
  verkaufsschild:{slot:'weapon',hands:1,name:'VERKAUFT-Schild',armVorn:schild},
  haarbrille:{slot:'charm',name:'Sonnenbrille im Haar',kopf:haarbrille},
  fanshirt:{slot:'body',name:'Fan-Shirt BIG B',armHinten(L,p){fanArm(L,p,p.armF,true);},armVorn(L,p){fanArm(L,p,p.armN,false);},rumpf(L,p){fanRumpf(L,p,false);}},
  fischerhut:{slot:'head',name:'Fischerhut',kopf:fischerhut},
  spielzeugfunk:{slot:'weapon',hands:1,name:'Spielzeugfunk',armVorn:funk},
  handy:{slot:'weapon',hands:1,name:'Handy',armVorn:handy},
  selfiestick:{slot:'weapon',hands:1,name:'Selfie-Stick mit Ringlicht',armVorn:selfiestick},
  zollstock:{slot:'weapon',hands:1,name:'Zollstock',armVorn:zollstock},
  regenrinne:{slot:'weapon',hands:1,name:'Regenrinnen-Schwert',armVorn:rinne},
  tablet:{slot:'offhand',name:'Tablet',armVorn:tablet},
  weinglas:{slot:'offhand',name:'Probierglas',armVorn:weinglas},
  jackeueberarm:{slot:'offhand',name:'Jacke überm Arm',armVorn:jacke},
  muelltonnendeckel:{slot:'offhand',name:'Mülltonnendeckel',armVorn:tonnendeckel},
  schluesselbund:{slot:'waist',name:'Schlüsselbund des Vermieters',rumpf(L,p){if(!p.back)schluessel(L,p);}},
  'pelzmantel-baron-boss':{slot:'body',name:'Pelzmantel des Barons (Boss, viel zu groß)',armHinten(L,p){pelzBossArm(L,p,p.armF,true);},armVorn(L,p){pelzBossArm(L,p,p.armN,false);},rumpf:pelzBossRumpf},
  'korkenzieher-boss':{slot:'weapon',hands:1,name:'Kellnermesser mit Korken (Boss)',armVorn:korkenBoss},
  pumps:{slot:'feet',name:'Pumps',beinHinten(L,p){pumps(L,p,p.legF,p.toeF,true);},beinVorn(L,p){pumps(L,p,p.legN,p.toeN,false);}},
  turnschuhe:{slot:'feet',name:'Turnschuhe',beinHinten(L,p){sneaker(L,p,p.legF,p.toeF,true);},beinVorn(L,p){sneaker(L,p,p.legN,p.toeN,false);}},
  reitstiefel:{slot:'feet',name:'Reitstiefel mit Stulpe',beinHinten(L,p){reitstiefel(L,p,p.legF,p.toeF,true);},beinVorn(L,p){reitstiefel(L,p,p.legN,p.toeN,false);}},
 };
 const back={
  securityanzug:{rumpf:secRumpfBack},
  securitypolo:{rumpf(L,p){poloRumpf(L,p,true);}},
  konfirmationsanzug:{rumpf:konfiRumpfBack},
  hosenanzug:{rumpf:lachsRumpfBack},
  bomberjacke:{rumpf(L,p){bomberRumpf(L,p,true);}},
  fanshirt:{rumpf(L,p){fanRumpf(L,p,true);}},
  regenrinnenpanzer:{rumpf(L,p){panzerRumpf(L,p,true);}},
  weste:{rumpf:westeRumpfBack},
  kellerschuerze:{rumpf:schuerzeRumpfBack},
  greenscreen:{haarHinten:null,rumpf(L,p){cape(L,p,true);}},
  'ringlicht-halo':{haarHinten:null,kopf(L,p){halo(L,p,false);}},
 };
 // Aufdrucke (SECURITY, LIVE, FARBE) und seitliche Zeichen: eigene sw/ne-Bögen statt Spiegelung
 const sided=['pelzmantel-baron-boss','korkenzieher-boss','absperrpfosten','verkaufsschild','fanshirt','selfiestick','securityanzug','securitypolo','bomberjacke','regenrinnenpanzer','eimerhelm','pferdekostuem','basecap','kinderheadset','kellerschuerze','weste','hosenanzug'];
 return {gear,back,families:{},sided};
}
