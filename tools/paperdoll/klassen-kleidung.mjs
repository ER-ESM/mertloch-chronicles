// Erweiterungsmodul der Anziehpuppe (klassen-kleidung, E-72 Entwurf): Klassenkleidung der neuen Klassen vom Kleiderhaufen.
// Schorsch: Grillschürze (Kohle-Canvas, Lederriemen, angesengt, Glutzeichen, Geschirrtuch am Band) + Schiebermütze (Fischgrat-Tweed).
// Käthe: grobe lila Strickjacke (Zopfmuster, Schalkragen aus Naturwolle, Kreuz-Ass in der Brusttasche) + Lesebrille an der Kette.
// Wie alle Gegenstände: kein Sonderkörper – jede Quelle hängt an Gelenken und Rumpfzeilen und passt an jeden Archetyp.
// Weltgröße zuerst (Lehre der Waffenkammer): prägende Flächen groß und kontrastreich (Schürze dunkel auf hellem Unterhemd,
// Tuch rot-weiß, Strickjacke lila mit hellem Kragen, Karte weiß); Feinheiten (Zopf, Nähte, Brandflecken) nur für die Nahansicht.
// Seitenregel (puppe.mjs): p.swap = Rücken XOR gespiegelt; die rechte Körperseite des Trägers liegt bei p.swap rechts im Bild (+x), sonst links.
// Schichtung: Schürze und Strickjacke 'body' (über dem Unterhemd des Körpers), Mütze 'head' (verdrängt den Dutt), Lesebrille 'neck'
// (Kette um den Hals, Gläser im Kopfband über einer Editor-Brille; der Dutt bleibt).
// K = Zeichenbaukasten aus puppe.mjs (nur in Zeichenfunktionen benutzen). Rückgabe: {gear, back, families, sided}.

const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
function tone([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));}
const R=a=>a.map(hex).map(tone);
/** Eigene Treppen (Präfix kk) – in PAL, damit Laufzeit-Palette und Schattentabelle sie kennen. */
const RAMPS={
 kkKohle:R(['#8e8a86','#625e5c','#46423f','#2e2b2a','#1a1817']),// Grillschürze: Kohle-Canvas
 kkCognac:R(['#f0b474','#c8813f','#96592a','#62361a','#3a1e10']),// Lederriemen
 kkBrand:R(['#ffe08a','#ff9a3a','#c8501e','#6e2a14','#2a1410']),// Glut, Brandränder, Flammenzeichen
 kkTweed:R(['#d2cabc','#a49c90','#7a746c','#534e4a','#322e2c']),// Schiebermütze: grauer Fischgrat
 kkLila:R(['#dcc2e6','#ae8cc6','#8466a2','#5c4678','#38284e']),// Käthes Strickjacke
 kkWolle:R(['#fff6ea','#eadcca','#c8b6a2','#98826e','#5e4a3c']),// Schalkragen, Taschenränder (Naturwolle)
};
/** Augen und Ohr der Codex-Köpfe (se), relativ zum Kopfanker – Werte wie GEO in aussehen.mjs (Brille des Editors). */
const AUGE={schwungvoll:{eye:[-5,-1],l:[-10,-2],r:[7,12],ear:[-15,1],fr:13},kraeftig:{eye:[-6,-2],l:[-10,-4],r:[6,10],ear:[-15,0],fr:13},drahtig:{eye:[-5,-1],l:[-11,-4],r:[7,11],ear:[-16,1],fr:13}};

export function klassen_kleidung(K){
 Object.assign(K.PAL,RAMPS);
 const P=K.PAL;
 // ---------- Helfer ----------
 const neck=p=>(p.A.neckR||[6.5,7.5])[1];
 /** Einzelpixel über den Baukasten (folgt Rumpfneigung L.T); part = nur auf Pixel dieses Teils. */
 const on=(L,part,x,y,c)=>K.line(L,[[x,y],[x,y]],c,part),px=(L,x,y,c)=>K.line(L,[[x,y],[x,y]],c);
 const tq=(L,x,y)=>L.T?L.T([x,y]):[x,y],is=(L,part,x,y)=>{const q=tq(L,x,y);return L.is(part,q[0],q[1]);};
 const colAt=(L,x,y)=>{const q=tq(L,x,y);return L.col[Math.floor(q[1])*K.W+Math.floor(q[0])];};
 const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
 /** Kopf starr verschoben (leanT im Kopfband): Anker einmal umrechnen, dann ohne Transform in Bildpunkten zeichnen (wie aussehen.mjs). */
 const raw=(L,p,fn)=>{const T=L.T;if(!T)return fn(p);L.T=null;try{return fn({...p,head:T(p.head)});}finally{L.T=T;}};
 /** Rumpfstoff wie coat() in npc-kleidung (extend = unter den Schritt verlängert, beim Reiten kurz). */
 function stoff(L,p,c,pad,y0,y1,flare=0,extend=0){const j=L.piece(c);K.poly(L,K.torso(p,pad,y0,p.ride?Math.min(y1,44):y1,{flare,sway:!p.ride,extend:p.ride?0:extend}),c[1]);K.light(L,j,{base:1,hi:0,lo:2,dark:3});return j;}
 /** Rechte Körperseite des Trägers als Vorzeichen in x (Seitenregel). */
 const rechts=p=>p.swap?1:-1;
 /** Niete (Messing). */
 const niete=(L,x,y)=>{const n=L.piece(P.gold);K.ell(L,x,y,1.6,1.6,P.gold[2]);on(L,n,x-1,y-1,P.gold[0]);return n;};
 /** Zeilenweise Ränder eines Teils (Rasterzeilen, nach der Neigung): Map y → [links, rechts]. */
 function raender(L,part){const b=L.bb[part],out=new Map();if(!b||b[2]<0)return out;for(let y=b[1];y<=b[3];y++){let a=-1,z=-1;for(let x=b[0];x<=b[2];x++)if(L.part[y*K.W+x]===part){if(a<0)a=x;z=x;}if(a>=0)out.set(y,[a,z]);}return out;}
 /** Steppnaht entlang der Seitenränder eines Teils (innen d px, jede dritte Zeile). */
 function stepp(L,part,y0,y1,c,d=2){for(const [y,[a,z]] of raender(L,part)){if(y<y0||y>y1||y%3)continue;for(const x of [a+d,z-d])if(L.part[y*K.W+x]===part)L.on(part,x,y,c);}}

 // ===================== Schorsch: Grillschürze =====================
 const SCH={long:70};// Saum knapp über dem Knie
 /** Brandfleck: unregelmäßig verkohlt mit glühendem Rand (nur auf dem Stoff part). */
 function brand(L,part,x,y,r){
  for(let yy=-r-2;yy<=r+2;yy++)for(let xx=-r-2;xx<=r+2;xx++){const w=K.hsA(x+xx,y+yy),q=Math.hypot(xx*.9,yy*1.15)/(r*(.78+w*.42));if(q>1.25||!is(L,part,x+xx,y+yy))continue;
   const c=q<.55?P.kkKohle[4]:q<.9?P.kkBrand[4]:q<1.08?P.kkBrand[3]:P.kkKohle[3];on(L,part,x+xx,y+yy,c);}
  if(r>=2.5){on(L,part,x-1,y,P.kkBrand[1]);on(L,part,x+1,y+1,P.kkBrand[2]);}}
 /** Flammenzeichen auf dem Latz (Glut: gelber Kern, orange, rotbrauner Rand). */
 function flamme(L,x,y,s){const f=L.piece(P.kkBrand);
  K.poly(L,[[x,y-7*s],[x+2.4*s,y-3.4*s],[x+4.6*s,y-5.2*s],[x+4.8*s,y+.8*s],[x+3*s,y+4*s],[x,y+4.8*s],[x-3.2*s,y+3.8*s],[x-4.8*s,y+.4*s],[x-3.6*s,y-3*s],[x-1.6*s,y-1.6*s]],P.kkBrand[2]);
  K.poly(L,[[x+.4*s,y-3.8*s],[x+2.8*s,y-.6*s],[x+2.6*s,y+2.6*s],[x,y+3.6*s],[x-2.6*s,y+2.4*s],[x-2.6*s,y],[x-.8*s,y+.6*s]],P.kkBrand[1],f);
  K.poly(L,[[x+.2*s,y-.4*s],[x+1.4*s,y+1.4*s],[x+.8*s,y+2.8*s],[x-.8*s,y+2.8*s],[x-1.4*s,y+1.6*s]],P.kkBrand[0],f);return f;}
 /** Geschirrtuch, ins Schürzenband gesteckt: umgeschlagene Kante oben, rot-weiß kariert, pendelt im Lauf. side = Vorzeichen in x. */
 function tuch(L,p,side){const [cx,cy]=p.C,A=p.A,wb=Math.max(7,Math.min(11,(K.row(A,26)[2]-K.row(A,26)[1])*.2)),y0=cy+21,
  x0=side<0?cx+K.row(A,24)[1]+(p.back?-wb*.3:1):cx+K.row(A,24)[2]-wb-(p.back?-wb*.3:1),sw=p.ride?0:(p.sway||0)*1.2,h=p.ride?10:17;
  const t=L.piece(P.white);K.poly(L,[[x0,y0+2],[x0+wb,y0+2],[x0+wb+1+sw,y0+h],[x0+1+sw,y0+h+1]],P.white[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:1});
  for(let yy=0;yy<=h+1;yy++)for(let xx=-1;xx<=wb+2;xx++){const X=x0+xx+sw*yy/h,Y=y0+2+yy,a=(Math.floor(xx/2)+Math.floor(yy/2))%2===0;if(!is(L,t,X,Y))continue;
   if(Math.floor(yy/2)%2===0||Math.floor((xx+(sw*yy/h|0))/2)%2===0)on(L,t,X,Y,a?P.red[1]:P.red[2]);}
  const k=L.piece(P.white);K.poly(L,[[x0-1,y0-1],[x0+wb+1,y0-1],[x0+wb+1,y0+3],[x0-1,y0+3]],P.white[0]);K.light(L,k,{base:0,hi:0,lo:1,dark:1});
  for(let xx=0;xx<=wb;xx+=4)on(L,k,x0+xx,y0+1,P.red[1]);return t;}
 /** Schürzenband um den Bauch (seitlich sichtbar): Leder bis zur Rumpfkante. */
 function band(L,p,y){const [cx,cy]=p.C,r=K.row(p.A,y),b=L.piece(P.kkCognac);
  for(const [a,z] of [[r[1]-1.2,r[1]+5],[r[2]-5,r[2]+1.2]])K.poly(L,[[cx+a,cy+y-1.2],[cx+z,cy+y-1.2],[cx+z,cy+y+1.6],[cx+a,cy+y+1.6]],P.kkCognac[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});return b;}
 function schuerzeVorn(L,p){const c=P.kkKohle,[cx,cy]=p.C,A=p.A,nr=neck(p),long=p.ride?44:SCH.long;
  const j=stoff(L,p,c,1.6,-9,long,4.2,long-46);
  // Armausschnitt: Latz oben schmal, zur Taille auf volle Breite
  const rT=K.row(A,-6),bl=Math.min(rT[1]*.62,-7.5)+1,br=Math.max(rT[2]*.62,7.5)+1,rS=K.row(A,19);
  const cut=(s,b)=>{const pts=[[cx+s*70,cy-30],[cx+b,cy-30],[cx+b,cy-9]];for(let k=1;k<=6;k++){const y=-9+k*28/6,t=(k/6)**1.6,e=s<0?rS[1]:rS[2];pts.push([cx+b+(e-b)*t-s*.5,cy+y]);}pts.push([cx+s*70,cy+19]);K.poly(L,pts,null,'del');};
  cut(-1,bl);cut(1,br);
  K.line(L,[[cx+bl+1,cy-8],[cx+br-1,cy-8]],c[0],j);// umgeschlagene Oberkante
  stepp(L,j,cy-7,cy+long-3,P.kkCognac[2]);
  // Stoffkorn und Falten im Rock
  for(let k=0;k<70;k++){const xx=cx-34+K.hsA(k,5)*68,yy=cy-6+K.hsA(5,k)*(long+4);if(K.hsA(xx,yy)>.55)on(L,j,xx,yy,c[k%3?0:2]);}
  // Seitentasche auf der linken Hüfte des Trägers mit Grillthermometer (eine quer laufende Tasche las sich in Weltgröße als Gürtel)
  if(!p.ride){const lk=-rechts(p),rP=K.row(A,34),py0=cy+30,py1=py0+11,wP=Math.max(8,(rP[2]-rP[1])*.3),pa=lk>0?cx+Math.max(rP[2]*.72,6)-wP:cx+Math.min(rP[1]*.72,-6),pl=pa,pr=pa+wP;
   const th=L.piece(P.metal);K.line(L,[[pr-3,py0+2],[pr-2,py0-5]],P.metal[2]);const d=L.piece(P.white);K.ell(L,pr-2,py0-6.5,2.3,2.3,P.white[1]);K.light(L,d,{base:1,hi:0,lo:2,dark:1});on(L,d,pr-2,py0-7,P.red[1]);on(L,d,pr-1,py0-8,P.red[1]);
   const tsh=L.piece(c);K.poly(L,[[pl,py0],[pr,py0],[pr+.5,py1],[pl-.5,py1]],c[1]);K.light(L,tsh,{base:1,hi:1,lo:2,dark:1});
   for(let x=Math.ceil(pl)+1;x<pr;x+=2)on(L,tsh,x,py0+1,P.kkCognac[2]);
   // weiche Falten im Rock: Lichtgrat neben Schattental, nach unten leicht gespreizt (gemalter Stoff statt flacher Fläche)
   const rr=K.row(A,44);for(const [dx,k] of [[rr[1]*.78,0],[rr[1]*.3,1],[rr[2]*.3,2],[rr[2]*.78,3]]){const y0=py1+2+K.hsA(k,9)*3,x0=cx+dx,x1=cx+dx*1.14;
    if(k===1)continue;K.line(L,[[x0,y0],[x1,cy+long-2]],c[2],j);K.line(L,[[x0+1,y0+3],[x1+1,cy+long-2]],c[3],j);for(let t=0;t<1;t+=.1){const q=K.lerp([x0-1,y0+2],[x1-1,cy+long-3],t);if(Math.round(q[1])%2)on(L,j,q[0],q[1],c[0]);}}}
  // Glutzeichen, Nackenriemen, Nieten, Band
  const s=Math.max(.9,Math.min(1.5,(br-bl)/20));flamme(L,cx+(bl+br)/2,cy+5,s);
  const st=L.piece(P.kkCognac);K.limb(L,[[cx+bl+2,cy-8],[cx-nr-.5,cy-15],[cx-nr+1,cy-18]],[1.5,1.5,1.4],P.kkCognac[2]);K.limb(L,[[cx+br-2,cy-8],[cx+nr+2.5,cy-15],[cx+nr+1.5,cy-18]],[1.4,1.4,1.3],P.kkCognac[3]);K.light(L,st,{base:2,hi:1,lo:3,dark:1});
  niete(L,cx+bl+2,cy-6);niete(L,cx+br-2,cy-6);band(L,p,21);niete(L,cx+rS[1]+2.5,cy+20);niete(L,cx+rS[2]-2.5,cy+20);
  // angesengt: Saum, Seite, ein Fleck unten am Latz
  const hem=p.ride?44:long;for(const [fx,fy,r] of [[-.62,hem-3,3.6],[.35,hem-2,2.8],[.72,hem-10,2.2],[-.12,hem-5,1.6],[-.45,16,2]]){const rr=K.row(A,Math.min(44,fy));brand(L,j,cx+(fx<0?rr[1]:rr[2])*Math.abs(fx),cy+fy,r);}
  return j;}
 function schuerzeHinten(L,p){const [cx,cy]=p.C,nr=neck(p),y=21,r=K.row(p.A,y);
  // Nackenriemen im Nacken, Bänder um den Bauch mit Knoten und Enden
  const st=L.piece(P.kkCognac);K.limb(L,[[cx-nr-2,cy-17],[cx,cy-14.5],[cx+nr+2,cy-17]],[1.5,1.6,1.5],P.kkCognac[2]);K.light(L,st,{base:2,hi:1,lo:3,dark:1});
  const b=L.piece(P.kkCognac);K.poly(L,[[cx+r[1]-1.4,cy+y-1.3],[cx+r[2]+1.4,cy+y-1.3],[cx+r[2]+1.4,cy+y+1.6],[cx+r[1]-1.4,cy+y+1.6]],P.kkCognac[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});
  const k=L.piece(P.kkCognac);K.ell(L,cx-3,cy+y,3.2,2.4,P.kkCognac[1]);K.ell(L,cx+4,cy+y,3.2,2.4,P.kkCognac[1]);K.ell(L,cx+.5,cy+y+.3,1.8,2,P.kkCognac[2]);
  const sw=p.ride?0:(p.sway||0)*1.4;K.limb(L,[[cx-1,cy+y+1],[cx-3+sw,cy+y+12]],[1.3,1.1],P.kkCognac[2]);K.limb(L,[[cx+2,cy+y+1],[cx+4+sw,cy+y+11]],[1.3,1.1],P.kkCognac[1]);K.light(L,k,{base:1,hi:0,lo:2,dark:1});}
 /** Rückansicht: die Schürze umfasst die Hüften – ihre Kanten ragen seitlich hinter Rumpf und Beinen hervor (Band haarHinten = ganz hinten). */
 function rockHinten(L,p){const c=P.kkKohle,long=p.ride?44:SCH.long,j=L.piece(c);K.poly(L,K.torso(p,3,20,long,{flare:4.6,sway:!p.ride,extend:p.ride?0:long-46}),c[2]);K.light(L,j,{base:2,hi:1,lo:3,dark:2});const [cx,cy]=p.C;
  for(const [fx,r] of [[-.72,2.6],[.72,3]]){const rr=K.row(p.A,44);brand(L,j,cx+(fx<0?rr[1]:rr[2])*Math.abs(fx)*1.3,cy+long-3,r);}return j;}

 // ===================== Schorsch: Schiebermütze =====================
 /** Fischgrat auf allen Tonstufen: Spalten zu 4 px mit wechselnder Schräge, Strich eine Stufe dunkler, Gegenstrich eine heller. */
 function fischgrat(L,part,c){const b=L.bb[part];if(!b||b[2]<0)return;for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(L.part[y*K.W+x]!==part)continue;
  const u=x-K.NZ[0],v=y-K.NZ[1],d=((u%4)+4)%4,s=Math.floor(u/4)%2?d:3-d,ph=((v+s)%4+4)%4,cur=L.col[y*K.W+x],i=c.findIndex(q=>same(q,cur));if(i<0||i>=c.length-1)continue;
  if(ph===0)L.on(part,x,y,c[Math.min(c.length-2,i+1)]);else if(ph===2&&i>0&&K.hsA(x,y)>.5)L.on(part,x,y,c[i-1]);}}
 function muetzeVorn(L,p){const [x,y]=p.head,c=P.kkTweed;
  // Kappe: hinten rund, oben flach, vorn über den Schirm gezogen (Schiebe-Form)
  const t=L.piece(c);K.poly(L,[[x-21,y-10],[x-22,y-17],[x-18,y-24],[x-9,y-28],[x+3,y-29],[x+14,y-27],[x+23,y-22],[x+28,y-16],[x+26,y-12],[x+6,y-11]],c[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:3});
  fischgrat(L,t,c);
  K.line(L,[[x+7,y-13],[x+17,y-15],[x+27,y-15]],c[3],t);// Kante, wo die Kappe auf den Schirm geknöpft ist
  K.line(L,[[x-15,y-24],[x-4,y-27],[x+9,y-27]],c[0],t);// Licht auf der Kuppe
  const bd=L.piece(c);K.poly(L,[[x-22,y-14],[x+4,y-13],[x+4,y-10],[x-21,y-10]],c[3]);K.light(L,bd,{base:3,hi:2,lo:3,dark:1});// Kopfband
  const b=L.piece(c);K.poly(L,[[x+4,y-12],[x+24,y-15],[x+32,y-12],[x+30,y-8],[x+14,y-7],[x+4,y-9]],c[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});K.line(L,[[x+8,y-8],[x+29,y-9]],c[4],b);// Schirm, Schattenkante
  const k=L.piece(c);K.ell(L,x+14,y-14,1.6,1.4,c[3]);on(L,k,x+13,y-15,c[0]);// Druckknopf
  return t;}
 function muetzeHinten(L,p){const [x,y]=p.head,c=P.kkTweed;
  const t=L.piece(c);K.poly(L,[[x-21,y-9],[x-21,y-18],[x-14,y-25],[x-2,y-28],[x+11,y-27],[x+19,y-21],[x+22,y-14],[x+21,y-9]],c[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:3});fischgrat(L,t,c);
  const bd=L.piece(c);K.poly(L,[[x-21,y-13],[x+21,y-13],[x+21,y-9],[x-21,y-9]],c[3]);K.light(L,bd,{base:3,hi:2,lo:3,dark:1});
  K.line(L,[[x-15,y-22],[x-2,y-26],[x+12,y-23]],c[3],t);K.line(L,[[x-14,y-23],[x-2,y-27]],c[0],t);return t;}

 // ===================== Käthe: grobe Strickjacke =====================
 const KJ={long:62};
 /** Zopf: zwei Stränge kreuzen je 8 px (oben liegender Strang hell, darunter dunkel), links/rechts linke Maschen als dunkle Rinne. */
 function zopf(L,part,x,y0,y1,c,w=2.4){for(let y=y0;y<y1;y+=8){K.line(L,[[x-w,y],[x+w,y+4]],c[2],part);K.line(L,[[x+w,y],[x+w*.2,y+2]],c[3],part);
   K.line(L,[[x-w+1,y],[x+w+1,y+4]],c[0],part);K.line(L,[[x-w,y+4],[x+w,y+8]],c[0],part);K.line(L,[[x+w+1,y+4],[x-w*.1,y+6.5]],c[3],part);}
  for(const dx of [-w-2,w+3])for(let y=y0;y<y1;y+=2)on(L,part,x+dx,y,c[3]);}
 /** Grobe Rippe (Bündchen, Kragen): senkrechte Maschenrippen alle 2 px. */
 function rippe(L,part,x0,x1,y0,y1,c,lo=3){for(let x=Math.floor(x0);x<=x1;x+=2)for(let y=Math.floor(y0);y<=y1;y++)if(is(L,part,x,y))on(L,part,x,y,c[lo]);}
 /** Glatt rechts: senkrechte Maschenreihen auf Grundton-Pixeln (Strick statt Filz), am Rauschursprung verankert. */
 function maschen(L,part,c){const b=L.bb[part];if(!b||b[2]<0)return;for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(L.part[y*K.W+x]!==part)continue;const u=x-K.NZ[0],v=y-K.NZ[1];
  if(((u%4)+4)%4===0&&((v%2)+2)%2===0&&same(L.col[y*K.W+x],c[1]))L.on(part,x,y,c[2]);else if(((u%4)+4)%4===2&&((v%3)+3)%3===0&&same(L.col[y*K.W+x],c[1]))L.on(part,x,y,c[0]);}}
 /** Strickärmel bis ans Handgelenk, dick; gerafftes Rippbündchen (schmaler als der Ärmel), Ellbogenfalte. */
 function aermel(L,p,arm,far){const c=P.kkLila,b=far?2:1,A=p.A,pad=(A.armR[0]>9?.55:1)*2.4,to=.8,s=L.piece(c);
  K.limb(L,K.seg(arm,0,to),K.segR(A.armR,0,to).map(r=>r+pad),c[b]);K.ell(L,arm[0][0]+(far?1:-1),arm[0][1]+(far?7.5:6.5),A.armR[0]+(far?-1.4:0)+pad*.7,A.armR[0]+(far?-.4:.6)+pad*.7,c[b]);K.light(L,s,{base:b,hi:b-1,lo:b+1,dark:2});
  if(!far)maschen(L,s,c);
  const q=K.lerp(arm[1],arm[2],.1);K.line(L,[[q[0]-5,q[1]-1],[q[0]+3,q[1]+1]],c[3],s);const q2=K.lerp(arm[0],arm[1],.6);K.line(L,[[q2[0]-4,q2[1]],[q2[0]+2,q2[1]+1]],c[far?3:2],s);
  const e=K.seg(arm,to-.02,.9),w=L.piece(c);K.limb(L,e,e.map(()=>A.armR[2]+(A.armR[0]>9?1.2:1.6)),c[b+1]);K.light(L,w,{base:b+1,hi:b,lo:b+2,dark:1});
  const m=K.lerp(e[0],e[e.length-1],.5);for(let k=-4;k<=4;k++){on(L,w,m[0]+k,m[1]-2,k%2?c[b+2]:c[b]);on(L,w,m[0]+k,m[1],k%2?c[b+2]:c[b]);on(L,w,m[0]+k,m[1]+2,k%2?c[b+2]:c[b]);}
  return s;}
 function jackeVorn(L,p){const c=P.kkLila,W0=P.kkWolle,[cx,cy]=p.C,A=p.A,nr=neck(p),long=p.ride?44:KJ.long,sw=p.ride?0:(p.sway||0)*1.6,thin=A.torso[3][2]<10;
  const j=stoff(L,p,c,2.6,-15,long,2.8,long-46);maschen(L,j,c);
  // Ausschnitt: tiefes V bis zum ersten Knopf, unten ein kleiner Schlitz über dem Saum
  K.poly(L,[[cx-nr-3,cy-16],[cx+nr+4,cy-16],[cx+2,cy+11]],null,'del');
  // Zöpfe auf beiden Vorderteilen
  const rZ=K.row(A,20);zopf(L,j,cx+rZ[1]*.55,cy-4,cy+long-6,c,thin?1.4:2.4);zopf(L,j,cx+rZ[2]*.52+1,cy-2,cy+long-6,c,thin?1.2:2);
  // Knopfleiste bis zum Saum, drei große Holzknöpfe
  K.line(L,[[cx+2,cy+12],[cx+2,cy+long-14]],c[3],j);K.line(L,[[cx+1,cy+12],[cx+1,cy+long-14]],c[0],j);
  const H=P.nkBraun||P.wood;for(const y of [cy+16,cy+26,cy+36]){const b=L.piece(H);K.ell(L,cx+2.5,y,2.4,2.2,H[1]);K.light(L,b,{base:1,hi:0,lo:2,dark:1});on(L,b,cx+1.5,y-1,H[0]);on(L,b,cx+2,y,H[3]);on(L,b,cx+3,y,H[3]);}
  // Taschen auf den Hüften (aufgesetzt, lila Rippe – ein heller Rand las sich in Weltgröße als Gürtel)
  if(!p.ride)for(const s of [-1,1]){const r=K.row(A,40),x0=s<0?cx+Math.min(r[1]*.8,-12):cx+6,x1=s<0?cx-3:cx+Math.max(r[2]*.8,12),y0=cy+38,y1=cy+48,t=L.piece(c);
   K.poly(L,[[x0,y0],[x1,y0],[x1+sw*.5,y1],[x0+sw*.5,y1]],c[2]);K.light(L,t,{base:2,hi:1,lo:3,dark:1});const e=L.piece(c);K.poly(L,[[x0-.5,y0-1],[x1+.5,y0-1],[x1+.5,y0+2],[x0-.5,y0+2]],c[1]);K.light(L,e,{base:1,hi:0,lo:2,dark:1});rippe(L,e,x0,x1,y0-1,y0+2,c,3);}
  // Schalkragen (Naturwolle, gerippt) entlang des V und um den Nacken
  const kr=L.piece(W0);K.limb(L,[[cx-nr-4,cy-17],[cx-4,cy-2],[cx+1,cy+12]],[3.6,3.4,2.2],W0[1]);K.limb(L,[[cx+nr+5,cy-17],[cx+7,cy-2],[cx+3,cy+12]],[3.2,3,2],W0[2]);K.light(L,kr,{base:1,hi:0,lo:2,dark:1});
  rippe(L,kr,cx-nr-9,cx+nr+9,cy-20,cy+14,W0,2);K.line(L,[[cx+nr+9,cy-14],[cx+11,cy-2],[cx+6,cy+12]],c[3],j);K.line(L,[[cx+nr+10,cy-13],[cx+12,cy-2]],c[2],j);// Schatten des Kragens
  // Brusttasche auf der rechten Brust des Trägers (vorn die nahe Seite) mit Kreuz-Ass – groß genug für die Welt
  const sd=rechts(p),rB=K.row(A,4),bw=thin?8:Math.max(9,Math.min(12,(rB[2]-rB[1])*.26)),bx=sd<0?cx+rB[1]*.52-bw/2+1:cx+rB[2]*.62-bw/2,y0=cy+4;
  const kt=L.piece(P.card);K.poly(L,[[bx+1.2,y0-9],[bx+bw-.4,y0-8.2],[bx+bw-1.2,y0+3],[bx+.6,y0+3]],P.card[0]);K.light(L,kt,{base:0,hi:0,lo:1,dark:1});
  const mx=Math.round(bx+bw/2);K.stamp(L,kt,mx-2,y0-6,['.K.','KKK','KKK','.K.'],{K:P.black[3]});on(L,kt,mx-1,y0-2,P.black[3]);on(L,kt,bx+2,y0-8,P.black[3]);
  const bt=L.piece(c);K.poly(L,[[bx,y0-1],[bx+bw,y0-1],[bx+bw,y0+8],[bx,y0+8]],c[2]);K.light(L,bt,{base:2,hi:1,lo:3,dark:1});const be=L.piece(W0);K.poly(L,[[bx-.5,y0-2],[bx+bw+.5,y0-2],[bx+bw+.5,y0+1],[bx-.5,y0+1]],W0[2]);rippe(L,be,bx,bx+bw,y0-2,y0+1,W0,3);
  // Saumbündchen (lila Rippe) und Schlitz
  const sb=L.piece(c);K.poly(L,K.torso(p,3.1,long-4,long,{flare:2.8,sway:!p.ride,extend:p.ride?0:long-46}),c[2]);K.light(L,sb,{base:2,hi:1,lo:3,dark:1});rippe(L,sb,cx-60,cx+60,cy+long-8,cy+long+4,c,3);
  if(!p.ride)K.poly(L,[[cx+1.5+sw,cy+long-13],[cx+6+sw*1.2,cy+long+2],[cx-3+sw*1.2,cy+long+2]],null,'del');
  return j;}
 function jackeHinten(L,p){const c=P.kkLila,W0=P.kkWolle,[cx,cy]=p.C,A=p.A,nr=neck(p),long=p.ride?44:KJ.long,thin=A.torso[3][2]<10;
  const j=stoff(L,p,c,2.6,-15,long,2.8,long-46);maschen(L,j,c);const rZ=K.row(A,20),w=thin?1.3:2.2;
  for(const x of thin?[cx+1]:[cx+rZ[1]*.55,cx+1,cx+rZ[2]*.55+1])zopf(L,j,x,cy-8,cy+long-6,c,w);
  const kr=L.piece(W0);K.poly(L,[[cx-nr-6,cy-19],[cx+nr+7,cy-19],[cx+nr+6,cy-11],[cx-nr-5,cy-11]],W0[1]);K.light(L,kr,{base:1,hi:0,lo:2,dark:1});rippe(L,kr,cx-nr-8,cx+nr+9,cy-20,cy-10,W0,2);
  const sb=L.piece(c);K.poly(L,K.torso(p,3.1,long-4,long,{flare:2.8,sway:!p.ride,extend:p.ride?0:long-46}),c[2]);K.light(L,sb,{base:2,hi:1,lo:3,dark:1});rippe(L,sb,cx-60,cx+60,cy+long-8,cy+long+4,c,3);
  return j;}

 // ===================== Käthe: Lesebrille an der Kette =====================
 /** Kette: Perlen abwechselnd hell/dunkel, 2 px breit (in Weltgröße ein Goldschimmer statt eines verschwindenden Strichs). */
 function kette(L,pts){const k=L.piece(P.gold,1);let n=0;for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
   for(let t=0;t<l;t+=1.5){const q=K.lerp(a,b,t/l);K.ell(L,q[0],q[1],.95,.95,n++%3===0?P.gold[0]:P.gold[2]);}}return k;}
 /** Goldene Lesebrille auf den Augen (deckt die Rahmen einer Editor-Brille ab): Halbmond-Gläser, Rand oben flach, Glanzpunkt. */
 function brilleVorn(L,p){raw(L,p,q=>{const g=AUGE[p.look.arch]||AUGE.schwungvoll,hx=Math.round(q.head[0]),hy=Math.round(q.head[1]),G=P.gold;
  const y0=g.eye[0]-1,y1=g.eye[1]+1,f=L.piece(G);L.ramps[f].keep=true;
  const lens=(x0,x1,near)=>{for(let y=y0;y<=y1+1;y++)for(let x=x0;x<=x1;x++){const top=y<=y0+1,bot=y>=y1,side=x===x0||x===x1;
    if(y===y1+1&&(x<=x0+1||x>=x1-1))continue;if(bot&&side&&y===y1+1)continue;
    if(top||side||y===y1+1||(y===y1&&(x===x0+1||x===x1-1)))L.px(hx+x,hy+y,y===y0?G[1]:y===y0+1&&!side?P.lash:y===y0+1?G[2]:G[3]);/* zweite Randzeile innen dunkel: bleibt die Wimpernlinie (sonst wirken die Augen geschlossen) */}
   L.px(hx+x0+1,hy+y0+2,P.white[0]);L.px(hx+x0+(near?2:1),hy+y0,G[0]);};
  const nl=[g.l[0]-1,g.l[1]+1],fl=[g.r[0]-1,Math.min(g.r[1]+1,g.fr)];lens(nl[0],nl[1],true);lens(fl[0],fl[1],false);
  for(let x=nl[1]+1;x<fl[0];x++)L.px(hx+x,hy+y0+1,G[3]);// Steg
  for(let x=nl[0]-1;x>=g.ear[0]+2;x--)L.px(hx+x,hy+y0+1+(x<nl[0]-2?1:0),G[3]);// naher Bügel
  L.px(hx+fl[1]+1,hy+y0+1,G[3]);
  // Kette: vom nahen Bügel am Ohr vorbei den Hals hinunter, vom fernen Bügel hinter der Wange hinab – hinten um den Nacken
  kette(L,[[hx+g.ear[0]+1,hy+y0+2],[hx+g.ear[0]-2,hy+6],[hx+g.ear[0]-1,hy+13],[hx+g.ear[0]+4,hy+19]]);
  kette(L,[[hx+fl[1]+2,hy+y0+2],[hx+fl[1]+4,hy+6],[hx+fl[1]+3,hy+13],[hx+fl[1]-1,hy+19]]);});}
 function brilleHinten(L,p){raw(L,p,q=>{const hx=Math.round(q.head[0]),hy=Math.round(q.head[1]),G=P.gold;
  const f=L.piece(G);for(const s of [-1,1])for(let d=0;d<5;d++)L.px(hx+s*(17-d)+(s>0?1:0),hy-4+(d>3?1:0),d===0?G[1]:G[2]);// Bügel über den Ohren
  kette(L,[[hx-16,hy-3],[hx-18,hy+5],[hx-13,hy+14],[hx-5,hy+19],[hx+1,hy+20],[hx+7,hy+19],[hx+14,hy+14],[hx+19,hy+5],[hx+17,hy-3]]);});}

 const gear={
  grillschuerze:{slot:'body',name:'Schorschs Grillschürze',
   haarHinten(L,p){if(p.back)rockHinten(L,p);},
   rumpf(L,p){if(p.back)schuerzeHinten(L,p);else schuerzeVorn(L,p);tuch(L,p,rechts(p));}},
  schorschmuetze:{slot:'head',name:'Schorschs Schiebermütze',kopf(L,p){(p.back?muetzeHinten:muetzeVorn)(L,p);}},
  kaethestrickjacke:{slot:'body',name:'Käthes Strickjacke',
   armHinten(L,p){aermel(L,p,p.armF,true);},armVorn(L,p){aermel(L,p,p.armN,false);},
   rumpf(L,p){(p.back?jackeHinten:jackeVorn)(L,p);}},
  kaethebrille:{slot:'neck',name:'Käthes Lesebrille an der Kette',kopf(L,p){(p.back?brilleHinten:brilleVorn)(L,p);}},
 };
 return {gear,back:{},families:{},sided:['grillschuerze','kaethestrickjacke']};
}
