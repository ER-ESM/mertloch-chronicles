// Erweiterungsmodul der Anziehpuppe (npc-kleidung): Alltagskleidung und Handstücke für NPCs (content/figuren.js).
// K = Zeichenbaukasten aus puppe.mjs (PAL, ell, limb, poly, line, stamp, light, …) – nur innerhalb der Zeichenfunktionen benutzen.
// Rückgabe: {gear:{id:{slot,name,<band>(L,p){…}}}, back:{id:{<band>(L,p){…}}}, families:{familie:id}, sided:[ids mit Seitenbindung]}
// Schichtung (paperdoll-kern.js ORDER): Hosen 'legs', Schuhe 'feet', Oberteile 'body'; Schürze, Warnweste und Latzhose als
// 'charm', damit sie über Hemd/Pulli liegen; Mützen/Kopfhörer 'head' (verdrängen den Dutt); Klemmbrett/Bierkasten 'offhand'.
// Alle Maße hängen an Gelenken (p.armN/armF/legN/legF, p.head) und Rumpfzeilen (K.torso/K.row) – passt an jeden Archetyp.

// Farbtreppen (hell → dunkel) wie puppe.mjs: Wert eine Stufe tiefer, Sättigung leicht rauf.
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
function tone([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
 l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));}
const R=a=>a.map(hex).map(tone);
/** Eigene Treppen; werden in PAL eingetragen (Präfix nk), damit Laufzeit-Palette und Schattentabelle sie kennen. */
const RAMPS={
 nkHemd:R(['#eef6fc','#bcd8f0','#8eb2da','#6282b2','#3e527e']),
 nkAnzug:R(['#9a9ca8','#6c6e7a','#4e505c','#343642','#1e1f2a']),
 nkStrick:R(['#c6cc8e','#9ca460','#747e44','#505a32','#30381e']),
 nkPulli:R(['#caa6e6','#9c74c8','#734fa2','#4e3478','#2e1e4a']),
 nkKittel:R(['#dcf2e8','#a8d6c4','#7aae9e','#548078','#34504e']),
 nkMieder:R(['#92c68c','#62a064','#427648','#2a5034','#18321e']),
 nkRock:R(['#e67c8e','#be4c66','#902e48','#621c32','#3a0e1e']),
 nkVorbinder:R(['#f6faff','#d8e4f6','#b0c2de','#8496ba','#5a688c']),
 nkWarn:R(['#ffd27a','#ff9a36','#e8661e','#aa4418','#6c2610']),
 nkBlau:R(['#86aeee','#527ecc','#3658a2','#243e76','#16264a']),
 nkSchuh:R(['#8e6e5e','#624a40','#46342e','#2e2020','#1a1012']),
 nkTweed:R(['#cebe9e','#a69272','#806c52','#584838','#342a20']),
 nkPappe:R(['#d2a474','#aa7a4e','#825836','#5a3a24','#382214']),
 nkKasten:R(['#f07a5e','#cc4632','#982c24','#661a18','#3c0e0e']),
 nkBraun:R(['#c89a5a','#9a6a34','#6e4822','#4a2e16','#2a1a0c']),
 nkRenn:R(['#ff8c7a','#dc3a32','#a82626','#701a1e','#420e12']),// Rennjacke (rotes Leder)
};

export function npc_kleidung(K){
 Object.assign(K.PAL,RAMPS);// einmal beim Laden: Treppen gehören in die Palette (wie die Reittier-Farben in puppe.mjs)
 const P=K.PAL;
 // ---------- Helfer (nur in Zeichenfunktionen aufgerufen) ----------
 const hs=(x,y)=>((Math.sin(x*12.9898+y*78.233)*43758.5453)%1+1)%1;
 const neck=p=>(p.A.neckR||[6.5,7.5])[1];
 const colAt=(L,x,y)=>L.col[Math.floor(y)*K.W+Math.floor(x)];
 const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
 /** Rumpfteil wie coat() in puppe.mjs; extend verlängert unter den Schritt (Kittel, Rock). Beim Reiten kurz. */
 function coat(L,p,c,pad,y0,y1,flare=0,extend=0){const j=L.piece(c);K.poly(L,K.torso(p,pad,y0,p.ride?Math.min(y1,44):y1,{flare,sway:!p.ride,extend:p.ride?0:extend}),c[1]);K.light(L,j,{base:1,hi:0,lo:2,dark:3});return j;}
 /** Hosenbein wie legwear() in puppe.mjs: Knie-Falten, Außennaht; crease = Bügelfalte statt Naht. */
 function hosenbein(L,p,leg,c,far,{pad=1.3,to=.94,crease=false,cuff=true}={}){const b=far?2:1,A=p.A,l=L.piece(c);
  K.limb(L,K.seg(leg,0,to),K.segR(A.legR,0,to).map(r=>r+pad),c[b]);K.light(L,l,{base:b,hi:b-1,lo:b+1,dark:2});
  const k=leg[1];K.line(L,[[k[0]-5,k[1]-1],[k[0]+3,k[1]+1]],c[3],l);K.line(L,[[k[0]-4,k[1]+3],[k[0]+2,k[1]+4]],c[b+1],l);
  if(crease)K.line(L,K.seg(leg,.08,to-.02).map(([x,y])=>[x+(far?1:0),y]),c[far?1:0],l);
  else K.line(L,K.seg(leg,.04,to-.04).map(([x,y])=>[x+A.legR[1]-1+(far?0:1),y]),c[far?2:0],l);
  if(cuff){const u=L.piece(c);K.limb(L,K.seg(leg,to-.06,to),[A.legR[2]+pad+.9,A.legR[2]+pad+.9],c[b-1]);K.light(L,u,{base:b-1,hi:b-1,lo:b,dark:1});}
  return l;}
 /** Hosenbund mit Gürtel; Taille y0…y1 relativ zur Brust. */
 function bund(L,p,c,pad,y0,y1,belt=P.black){const [cx,cy]=p.C,j=L.piece(c);K.poly(L,K.torso(p,pad,y0,y1),c[1]);K.light(L,j,{base:1,hi:0,lo:2,dark:3});
  const b=L.piece(belt);K.poly(L,K.torso(p,pad+.4,y0+1,y0+4),belt[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});
  if(!p.back){const s=L.piece(P.metal);K.poly(L,[[cx-1,cy+y0+1],[cx+4,cy+y0+1],[cx+4,cy+y0+4],[cx-1,cy+y0+4]],P.metal[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});}
  return j;}
 /** Einzelpixel über den Baukasten (folgt Neigung/Drehung der Ebene, L.T); on = nur auf Pixel des Teils. */
 const on=(L,part,x,y,c)=>K.line(L,[[x,y],[x,y]],c,part),px=(L,x,y,c)=>K.line(L,[[x,y],[x,y]],c);
 const knopf=(L,part,x,y,c)=>{on(L,part,x,y,c[0]);on(L,part,x+1,y+1,c[2]);};
 /** Ärmel mit Rippbündchen (Strick, Pulli): senkrechte Rippen im Bündchen. */
 function rippArm(L,p,arm,c,to,pad,far){const s=K.sleeve(L,p,arm,c,to,pad,far,{roll:false,cuff:c});
  const a=K.seg(arm,to-.06,to);for(let k=-2;k<=2;k++){const q=K.lerp(a[0],a[a.length-1],.5);on(L,s+1,q[0]+k*2,q[1],c[3]);on(L,s+1,q[0]+k*2,q[1]+1,c[3]);}return s;}
 /** Rippenmuster: senkrechte Maschenreihen auf Grundton-Pixeln des Teils. */
 function maschen(L,part,x0,x1,y0,y1,c,step=4){for(let x=x0;x<=x1;x+=step)for(let y=y0;y<=y1;y+=2)if(same(colAt(L,x,y),c[1])&&L.is(part,x,y))L.on(part,x,y,c[2]);}
 /** Bündchen/Saumband über die Rumpfbreite, mit Rippen. */
 function saum(L,p,c,pad,y0,y1,extend=0){const [cx,cy]=p.C,b=L.piece(c);K.poly(L,K.torso(p,pad,y0,y1,{sway:!p.ride,extend}),c[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});
  for(let x=cx-56;x<=cx+56;x+=2)for(let y=cy+y0-4;y<=cy+y1+6;y++)if(L.is(b,x,y)&&!same(colAt(L,x,y),c[3]))L.on(b,x,y,c[3]);return b;}
 /** Schürzen-Umriss: Rock vorn, an Hüfte und Beinen des Archetyps ausgerichtet (Drahtig bekommt Mindestbreite). */
 function schurz(p,y0,y1,inset=3){const A=p.A,[cx,cy]=p.C,t=K.row(A,y0),b=K.row(A,Math.min(46,y1)),sw=p.ride?0:(p.sway||0)*1.6;
  return [[cx+Math.min(t[1]+inset,-13),cy+y0],[cx+Math.max(t[2]-inset,12),cy+y0],[cx+Math.max(b[2]+1,15)+sw,cy+y1],[cx+Math.min(b[1]-1,-16)+sw,cy+y1]];}
 /** Senkrechte Stofffalten in einem Teil (Rauschen an Leinwandstellen: K.hsA, am Rauschursprung verankert). */
 function falten(L,part,x0,x1,y0,y1,c,step=6){for(let x=x0;x<=x1;x+=step){const k=K.hsA(x,y0);K.line(L,[[x,y0+4+k*6],[x+(k>.5?1:-1),y1-2]],c[k>.55?3:2],part);}}

 const gear={
  // ===== Oberteile (body) =====
  hemd:{slot:'body',name:'Hellblaues Hemd',
   armHinten(L,p){K.sleeve(L,p,p.armF,P.nkHemd,.5,1.2,true);},
   armVorn(L,p){K.sleeve(L,p,p.armN,P.nkHemd,.5,1.2,false);},
   rumpf(L,p){const c=P.nkHemd,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,1.3,-14,29,.4);
    K.poly(L,[[cx-2,cy-15],[cx+5,cy-15],[cx+1.5,cy-7]],null,'del');// offener Kragen
    const k=L.piece(c,1);K.poly(L,[[cx-nr-3,cy-16.5],[cx-1.5,cy-15.5],[cx+.5,cy-7],[cx-nr+1,cy-11]],c[0]);K.poly(L,[[cx+nr+4,cy-16.5],[cx+4.5,cy-15.5],[cx+2.5,cy-7],[cx+nr+2,cy-11]],c[1]);K.light(L,k,{base:0,hi:0,lo:1,dark:1});
    K.line(L,[[cx+1,cy-6],[cx+1,cy+28]],c[2],j);for(let y=cy-3;y<cy+28;y+=7)knopf(L,j,cx+2,y,P.white);// Knopfleiste
    const t=K.row(p.A,26);K.line(L,[[cx-13,cy+3],[cx-6,cy+3]],c[2],j);K.line(L,[[cx-13,cy+4],[cx-13,cy+10],[cx-6,cy+10],[cx-6,cy+4]],c[2],j);on(L,j,cx-10,cy+5,c[0]);// Brusttasche
    for(const dx of [t[1]+5,t[2]-6])K.line(L,[[cx+dx,cy+22],[cx+dx+2,cy+28]],c[2],j);}},// Falten über dem Bund
  sakko:{slot:'body',name:'Anthrazit-Sakko mit Krawatte',
   armHinten(L,p){anzugArm(L,p,p.armF,true);},
   armVorn(L,p){const s=anzugArm(L,p,p.armN,false),q=K.lerp(p.armN[1],p.armN[2],.35);K.line(L,[[q[0]-5,q[1]-1],[q[0]+3,q[1]+1]],P.nkAnzug[3],s);},
   rumpf(L,p){const c=P.nkAnzug,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,2.2,-14,40,1);
    const h=L.piece(P.white);K.poly(L,[[cx-nr-1,cy-16],[cx+nr+2,cy-16],[cx+2,cy+13]],P.white[1]);K.light(L,h,{base:1,hi:0,lo:2,dark:1});// Hemd im V
    const t=L.piece(P.red);K.poly(L,[[cx-.5,cy-14],[cx+4,cy-14],[cx+3,cy-10],[cx+.5,cy-10]],P.red[1]);K.poly(L,[[cx+.5,cy-10],[cx+3,cy-10],[cx+4.5,cy+8],[cx+1.8,cy+11],[cx-.8,cy+8]],P.red[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:1});// Krawatte
    L.piece(P.white,1);K.poly(L,[[cx-nr-2,cy-17],[cx,cy-14],[cx-2,cy-9]],P.white[0]);K.poly(L,[[cx+nr+3,cy-17],[cx+3.5,cy-14],[cx+5.5,cy-9]],P.white[1]);// Kragenspitzen
    const rv=L.piece(c);K.poly(L,[[cx-nr-4,cy-16],[cx-nr-1,cy-16],[cx+2,cy+13],[cx-1,cy+17],[cx-8,cy+3],[cx-13,cy-7]],c[0]);K.light(L,rv,{base:0,hi:0,lo:1,dark:1});
    const rf=L.piece(c);K.poly(L,[[cx+nr+5,cy-16],[cx+nr+2,cy-16],[cx+2,cy+13],[cx+5,cy+16],[cx+11,cy+3],[cx+14,cy-7]],c[2]);K.light(L,rf,{base:2,hi:1,lo:3,dark:1});
    K.line(L,[[cx+2,cy+15],[cx+2,cy+40]],c[3],j);knopf(L,j,cx+4,cy+21,c);knopf(L,j,cx+4,cy+29,c);// Verschluss
    for(const [x0,x1] of [[cx-18,cx-7],[cx+8,cx+19]]){K.line(L,[[x0,cy+31],[x1,cy+31]],c[3],j);K.line(L,[[x0,cy+32],[x1,cy+32]],c[0],j);}// Taschenpatten
    K.line(L,[[cx-17,cy+5],[cx-9,cy+5]],c[3],j);L.piece(P.white,1);K.poly(L,[[cx-15.5,cy+4.5],[cx-13,cy+1],[cx-10.5,cy+4.5]],P.white[0]);}},// Einstecktuch
  strickjacke:{slot:'body',name:'Strickjacke',
   armHinten(L,p){rippArm(L,p,p.armF,P.nkStrick,.88,2,true);},armVorn(L,p){rippArm(L,p,p.armN,P.nkStrick,.88,2,false);},
   rumpf(L,p){const c=P.nkStrick,[cx,cy]=p.C,j=coat(L,p,c,2.4,-14,40,1.5);maschen(L,j,cx-56,cx+56,cy-10,cy+38,c);
    saum(L,p,c,2.8,37,42);
    K.poly(L,[[cx-5,cy-15],[cx+7,cy-15],[cx+4,cy+6],[cx+4,cy+45],[cx-2,cy+45],[cx-2,cy+6]],null,'del');// offen
    L.piece(c,1);K.limb(L,[[cx-6,cy-14],[cx-3.5,cy+6],[cx-3.5,cy+41]],[1.3,1.3,1.3],c[0]);L.piece(c,1);K.limb(L,[[cx+8,cy-14],[cx+5.5,cy+6],[cx+5.5,cy+41]],[1.2,1.2,1.2],c[2]);// Knopfleisten
    for(let y=cy+8;y<cy+38;y+=8){const k=L.piece(P.nkBraun);K.ell(L,cx-4,y,1.6,1.6,P.nkBraun[1]);on(L,k,cx-5,y-1,P.nkBraun[0]);}
    for(const [x0,x1] of [[cx-18,cx-8],[cx+9,cx+19]]){K.line(L,[[x0,cy+25],[x1,cy+25]],c[0],j);K.line(L,[[x0,cy+26],[x0,cy+35],[x1,cy+35],[x1,cy+26]],c[3],j);}}},// Taschen
  kapuzenpulli:{slot:'body',name:'Lila Kapuzenpulli',
   haarHinten(L,p){const [cx,cy]=p.C,c=P.nkPulli,h=L.piece(c);K.ell(L,cx+1,cy-15,neck(p)+11,8,c[2]);K.light(L,h,{base:2,hi:1,lo:3});K.line(L,[[cx-8,cy-15],[cx+10,cy-15]],c[3],h);},
   armHinten(L,p){rippArm(L,p,p.armF,P.nkPulli,.9,2.2,true);},armVorn(L,p){rippArm(L,p,p.armN,P.nkPulli,.9,2.2,false);},
   rumpf(L,p){const c=P.nkPulli,[cx,cy]=p.C,nr=neck(p);coat(L,p,c,2.4,-14,37,.8);saum(L,p,c,2.2,35,39);
    const t=L.piece(c);K.poly(L,[[cx-11,cy+17],[cx+13,cy+17],[cx+16,cy+32],[cx-14,cy+32]],c[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:1});// Kängurutasche
    K.line(L,[[cx-11,cy+18],[cx-14,cy+30]],c[3],t);K.line(L,[[cx+13,cy+18],[cx+16,cy+30]],c[3],t);K.line(L,[[cx-10,cy+18],[cx+12,cy+18]],c[0],t);
    const r=L.piece(c);K.limb(L,[[cx-nr-5,cy-16],[cx-3,cy-9],[cx+5,cy-9],[cx+nr+6,cy-16]],[2.6,2.6,2.6,2.6],c[2]);K.light(L,r,{base:2,hi:1,lo:3,dark:1});// Kapuzenrand
    L.piece(P.white,1);K.line(L,[[cx-2,cy-8],[cx-3,cy+3]],P.white[1]);K.line(L,[[cx+5,cy-8],[cx+6,cy+2]],P.white[2]);L.piece(P.metal,1);px(L,cx-3,cy+4,P.metal[1]);px(L,cx+6,cy+3,P.metal[2]);}},// Kordeln
  kittel:{slot:'body',name:'Verkaufskittel',
   armHinten(L,p){K.sleeve(L,p,p.armF,P.nkKittel,.74,1.8,true);},armVorn(L,p){K.sleeve(L,p,p.armN,P.nkKittel,.74,1.8,false);},
   rumpf(L,p){const c=P.nkKittel,[cx,cy]=p.C,nr=neck(p),low=p.ride?42:70,j=coat(L,p,c,2.6,-14,72,2.6,26);
    K.poly(L,[[cx-3,cy-15],[cx+6,cy-15],[cx+1.5,cy-1]],null,'del');// V: Trikot/Unterhemd darunter
    const k=L.piece(c,1);K.poly(L,[[cx-nr-4,cy-16.5],[cx-2.5,cy-15.5],[cx+1,cy-1],[cx-nr,cy-9]],c[0]);K.poly(L,[[cx+nr+5,cy-16.5],[cx+5.5,cy-15.5],[cx+2,cy-1],[cx+nr+3,cy-9]],c[1]);K.light(L,k,{base:0,hi:0,lo:1,dark:1});
    K.line(L,[[cx+3,cy],[cx+3,cy+low+2]],c[3],j);for(let y=cy+4;y<cy+low;y+=10)knopf(L,j,cx+5,y,P.white);
    for(const [x0,x1] of [[cx-19,cx-8],[cx+9,cx+20]]){K.line(L,[[x0,cy+32],[x1,cy+32]],c[3],j);K.line(L,[[x0,cy+33],[x0,cy+42],[x1,cy+42],[x1,cy+33]],c[2],j);}// Seitentaschen
    K.line(L,[[cx-15,cy+3],[cx-8,cy+3]],c[3],j);L.piece(P.blue,1);K.line(L,[[cx-12,cy+3],[cx-12,cy-3]],P.blue[1]);px(L,cx-12,cy-4,P.metal[1]);// Kugelschreiber in der Brusttasche
    falten(L,j,cx-14,cx+16,cy+40,cy+low+4,c,9);}},
  dirndl:{slot:'body',name:'Dirndl',
   armHinten(L,p){puff(L,p,p.armF,true);},armVorn(L,p){puff(L,p,p.armN,false);},
   rumpf(L,p){const [cx,cy]=p.C,nr=neck(p),B=P.white,M=P.nkMieder,Rk=P.nkRock,V=P.nkVorbinder;
    const bl=L.piece(B);K.poly(L,K.torso(p,1,-14,4),B[1]);K.light(L,bl,{base:1,hi:0,lo:2,dark:2});K.ell(L,cx+1,cy-12,nr+5,6,null,'del');// Bluse, runder Ausschnitt
    const r=L.piece(Rk);K.poly(L,K.torso(p,2.4,27,80,{flare:4.2,sway:!p.ride,extend:p.ride?0:34}),Rk[1]);K.light(L,r,{base:1,hi:0,lo:2,dark:3});falten(L,r,cx-30,cx+30,cy+30,cy+(p.ride?44:80),Rk,6);
    const m=L.piece(M);K.poly(L,K.torso(p,1.5,-3,29),M[1]);K.light(L,m,{base:1,hi:0,lo:2,dark:3});// Mieder
    const top=K.row(p.A,-3);K.line(L,[[cx+top[1]-1,cy-3],[cx+top[2]+1,cy-3]],P.gold[1],m);
    for(let k=0;k<5;k++){const y=cy+1+k*5;K.line(L,[[cx-2,y],[cx+4,y+3]],B[0],m);K.line(L,[[cx+4,y],[cx-2,y+3]],B[1],m);on(L,m,cx-3,y,P.gold[0]);on(L,m,cx+5,y,P.gold[1]);}// Schnürung
    if(!p.ride){const s=L.piece(V);K.poly(L,[[cx-9,cy+28],[cx+11,cy+28],[cx+15+(p.sway||0)*1.6,cy+74],[cx-13+(p.sway||0)*1.6,cy+74]],V[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:2});falten(L,s,cx-6,cx+10,cy+30,cy+74,V,7);}// Vorbinder
    const bd=L.piece(V);K.poly(L,K.torso(p,1.9,27,30),V[2]);K.light(L,bd,{base:2,hi:1,lo:3,dark:1});
    const sl=L.piece(V);K.ell(L,cx-14,cy+30,3.2,2.2,V[1]);K.ell(L,cx-8,cy+30,3.2,2.2,V[1]);K.limb(L,[[cx-11,cy+31],[cx-13,cy+40]],[1.3,1],V[2]);K.limb(L,[[cx-10,cy+31],[cx-8,cy+39]],[1.3,1],V[1]);K.light(L,sl,{base:1,hi:0,lo:2,dark:1});}},// Schleife vorn links
  rennjacke:{slot:'body',name:'Rote Rennjacke',
   armHinten(L,p){rennArm(L,p,p.armF,true);},armVorn(L,p){rennArm(L,p,p.armN,false);},
   rumpf(L,p){const c=P.nkRenn,[cx,cy]=p.C,j=rennRumpf(L,p);
    K.poly(L,[[cx-3,cy-15],[cx+6,cy-15],[cx+1.5,cy-6]],null,'del');// oben offen: weißes Shirt im kleinen V
    const r=L.piece(P.black);K.limb(L,[[cx-neck(p)-4,cy-15.5],[cx-2.5,cy-14]],[1.9,1.7],P.black[2]);K.limb(L,[[cx+5.5,cy-14],[cx+neck(p)+5,cy-15.5]],[1.7,1.9],P.black[3]);K.light(L,r,{base:2,hi:1,lo:3,dark:1});// Stehkragen
    L.piece(P.metal,1);K.line(L,[[cx+1.5,cy-6],[cx+1.5,cy+40]],P.metal[2]);for(let y=cy-4;y<cy+40;y+=3)px(L,cx+2.5,y,P.metal[1]);// Reißverschluss über den Streifen
    const b=L.piece(P.gold);K.ell(L,cx-12,cy+19,3.6,3.6,P.gold[1]);K.light(L,b,{base:1,hi:0,lo:2,dark:1});K.ell(L,cx-12,cy+19,1.6,1.6,P.black[2],b);on(L,b,cx-13,cy+17,P.gold[0]);// Sponsor-Aufnäher
    const f=L.piece(P.white);K.poly(L,[[cx+8,cy+16],[cx+16,cy+16],[cx+16,cy+22],[cx+8,cy+22]],P.white[1]);// Zielflagge
    for(let y=0;y<6;y++)for(let x=0;x<8;x++)if(((x>>1)+(y>>1))&1)on(L,f,cx+8+x,cy+16+y,P.black[2]);
    K.line(L,[[cx-18,cy+30],[cx-7,cy+30]],c[3],j);K.line(L,[[cx+9,cy+30],[cx+18,cy+30]],c[3],j);}},// Taschenschlitze
  // ===== Überzieher (charm: über Hemd/Pulli) =====
  schuerze:{slot:'charm',name:'Latzschürze',
   rumpf(L,p){const c=P.white,[cx,cy]=p.C,nr=neck(p),long=p.ride?44:62;
    L.piece(c,1);K.line(L,[[cx-9,cy-6],[cx-nr-2,cy-15]],c[2]);K.line(L,[[cx+11,cy-6],[cx+nr+3,cy-15]],c[2]);// Nackenband
    const a=L.piece(c);K.poly(L,[[cx-9,cy-6],[cx+11,cy-6],[cx+12,cy+28],[cx-10,cy+28]],c[1]);K.poly(L,schurz(p,27,long),c[1]);K.light(L,a,{base:1,hi:0,lo:2,dark:3});
    const w=schurz(p,27,long);K.line(L,[[w[0][0]+1,cy+27],[w[1][0]-1,cy+27]],c[2],a);K.line(L,[[w[0][0]-4,cy+26],[w[0][0]+1,cy+27]],c[2]);K.line(L,[[w[1][0]-1,cy+27],[w[1][0]+4,cy+26]],c[2]);// Bänder
    K.line(L,[[cx-7,cy+36],[cx+9,cy+36]],c[2],a);K.line(L,[[cx-7,cy+37],[cx-7,cy+45],[cx+9,cy+45],[cx+9,cy+37]],c[3],a);K.line(L,[[cx+1,cy+37],[cx+1,cy+45]],c[2],a);// Tasche
    falten(L,a,cx-14,cx+14,cy+44,cy+long,c,8);K.line(L,[[w[3][0]+2,cy+long-3],[w[2][0]-2,cy+long-3]],P.red[1],a);}},// roter Saumstreifen
  warnweste:{slot:'charm',name:'Warnweste',
   rumpf(L,p){const c=P.nkWarn,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,3.4,-13,40,1.2);
    for(const y of [17,30]){const s=L.piece(P.metal);K.poly(L,K.torso(p,3.6,y,y+3.4,{sway:!p.ride}),P.metal[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});}
    K.poly(L,[[cx-nr-1,cy-15],[cx+nr+2,cy-15],[cx+1.5,cy+5]],null,'del');// V-Ausschnitt
    K.line(L,[[cx+1.5,cy+5],[cx+1.5,cy+41]],c[3]);for(let y=cy+7;y<cy+40;y+=6)on(L,j,cx+2.5,y,c[0]);}},// Klettverschluss
  latzhose:{slot:'charm',name:'Latzhose',
   beinHinten(L,p){hosenbein(L,p,p.legF,P.nkBlau,true,{pad:1.8,to:.9,cuff:false});},
   beinVorn(L,p){const l=hosenbein(L,p,p.legN,P.nkBlau,false,{pad:1.8,to:.9,cuff:false}),q=K.lerp(p.legN[0],p.legN[1],.55);// Seitentasche mit Zollstock
    L.piece(P.rain,1);K.poly(L,[[q[0]-7,q[1]-6],[q[0]-4,q[1]-6],[q[0]-4,q[1]+1],[q[0]-7,q[1]+1]],P.rain[1]);for(let k=0;k<3;k++)px(L,q[0]-6,q[1]-5+k*2,P.black[3]);
    K.line(L,[[q[0]-9,q[1]],[q[0]-1,q[1]]],P.nkBlau[3],l);},
   rumpf(L,p){const c=P.nkBlau,[cx,cy]=p.C,j=L.piece(c);K.poly(L,K.torso(p,1.9,26,48),c[1]);K.poly(L,[[cx-10,cy-3],[cx+12,cy-3],[cx+13,cy+27],[cx-11,cy+27]],c[1]);K.light(L,j,{base:1,hi:0,lo:2,dark:3});
    const s=L.piece(c);K.limb(L,[[cx-9,cy-2],[cx-12,cy-10],[cx-14,cy-16]],[2.2,2.2,2.2],c[2]);K.limb(L,[[cx+11,cy-2],[cx+12,cy-10],[cx+13,cy-16]],[2.1,2.1,2.1],c[2]);K.light(L,s,{base:2,hi:1,lo:3,dark:1});// Träger
    for(const x of [cx-9,cx+11]){const b=L.piece(P.metal);K.ell(L,x,cy-1,2.2,1.8,P.metal[1]);K.light(L,b,{base:1,hi:0,lo:2,dark:1});}
    K.line(L,[[cx-5,cy+4],[cx+7,cy+4]],P.stitch,j);K.line(L,[[cx-5,cy+5],[cx-5,cy+14],[cx+7,cy+14],[cx+7,cy+5]],c[3],j);// Brusttasche
    L.piece(P.black,1);K.line(L,[[cx+4,cy+5],[cx+4,cy]],P.black[2]);// Bleistift
    K.line(L,[[cx-9,cy-2],[cx-10,cy+26]],P.stitch,j);K.line(L,[[cx+11,cy-2],[cx+12,cy+26]],P.stitch,j);
    for(const t of [K.row(p.A,30)]){L.piece(P.metal,1);px(L,cx+t[1]-1,cy+30,P.metal[1]);px(L,cx+t[2]+1,cy+30,P.metal[2]);}}},
  // ===== Hose (legs) =====
  stoffhose:{slot:'legs',name:'Stoffhose mit Bügelfalte',
   beinHinten(L,p){hosenbein(L,p,p.legF,P.nkAnzug,true,{crease:true,cuff:false});},beinVorn(L,p){hosenbein(L,p,p.legN,P.nkAnzug,false,{crease:true,cuff:false});},
   rumpf(L,p){const c=P.nkAnzug,[cx,cy]=p.C,j=bund(L,p,c,1.5,28,48);if(!p.back){K.line(L,[[cx+2,cy+33],[cx+2,cy+45]],c[3],j);K.line(L,[[cx-15,cy+34],[cx-10,cy+42]],c[3],j);K.line(L,[[cx+16,cy+34],[cx+12,cy+42]],c[3],j);}
    else{K.line(L,[[cx+1,cy+33],[cx+1,cy+47]],c[3],j);for(const x0 of [cx-14,cx+4])K.line(L,[[x0,cy+38],[x0+9,cy+38]],c[3],j);}}},
  // ===== Schuhe (feet) =====
  schuhe:{slot:'feet',name:'Halbschuhe',beinHinten(L,p){schuh(L,p,p.legF,p.toeF,true);},beinVorn(L,p){schuh(L,p,p.legN,p.toeN,false);}},
  // ===== Kopf (head) =====
  kochmuetze:{slot:'head',name:'Kochmütze',kopf(L,p){const [x,y]=p.head,c=P.white;
   const t=L.piece(c);K.poly(L,[[x-18,y-18],[x+20,y-18],[x+23,y-37],[x-20,y-37]],c[1]);for(const [dx,dy,rx,ry] of [[-11,-39,11,8],[1,-44,13,9],[13,-39,11,8]])K.ell(L,x+dx,y+dy,rx,ry,c[1]);
   K.light(L,t,{base:1,hi:0,lo:2,dark:3,share:.24});for(const dx of [-12,-4,4,12])K.line(L,[[x+dx,y-19],[x+dx*1.12,y-35]],c[2],t);// Falten
   K.line(L,[[x-5,y-39],[x-3,y-44]],c[2],t);K.line(L,[[x+8,y-39],[x+6,y-44]],c[3],t);
   const b=L.piece(c);K.poly(L,[[x-19,y-11],[x+21,y-11],[x+21,y-19],[x-19,y-19]],c[0]);K.light(L,b,{base:0,hi:0,lo:1,dark:2});}},
  schiebermuetze:{slot:'head',name:'Schiebermütze',kopf(L,p){const [x,y]=p.head,c=P.nkTweed;
   const t=L.piece(c);K.poly(L,[[x-20,y-11],[x-19,y-19],[x-12,y-25],[x,y-28],[x+12,y-27],[x+20,y-22],[x+23,y-15],[x+22,y-11]],c[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:3});
   tweed(L,t,x-26,x+30,y-31,y-8,c);K.line(L,[[x-9,y-26],[x+6,y-19],[x+18,y-14]],c[3],t);
   const b=L.piece(c);K.poly(L,[[x+3,y-12],[x+20,y-15],[x+28,y-11],[x+25,y-7],[x+8,y-8],[x+2,y-10]],c[2]);K.light(L,b,{base:2,hi:1,lo:3,dark:1});// Schirm
   const k=L.piece(c);K.ell(L,x-3,y-27,2,1.5,c[2]);on(L,k,x-4,y-28,c[0]);}},
  kopfhoerer:{slot:'head',offen:true,name:'Studio-Kopfhörer',kopf(L,p){const [x,y]=p.head;
   const s=L.piece(P.black);K.limb(L,[[x-18,y-4],[x-16,y-16],[x-8,y-24],[x+4,y-27],[x+14,y-22],[x+19,y-12],[x+20,y-5]],[2,2,2,2,2,2,2],P.black[2]);K.light(L,s,{base:2,hi:1,lo:3,dark:1});
   for(const [q,r] of [[[x-17.5,y-7],1.8],[[x+19.6,y-8],1.6]]){const m=L.piece(P.metal);K.ell(L,q[0],q[1],r,2.6,P.metal[1]);K.light(L,m,{base:1,hi:0,lo:2,dark:1});}
   const f=L.piece(P.black);K.ell(L,x+20,y+1,3.2,6.5,P.black[3]);K.light(L,f,{base:3,hi:2,lo:4,dark:1});
   muschel(L,x-18,y+1.5,false);}},
  // ===== Hände =====
  klemmbrett:{slot:'offhand',name:'Klemmbrett',armVorn(L,p){const [hx,hy]=K.handPos(p.armF);brett(L,hx,hy,true);K.handOver(L,p.armF,true);}},
  bierkasten:{slot:'offhand',name:'Bierkasten',armVorn(L,p){const [hx,hy]=K.handPos(p.armF);kasten(L,hx,hy);K.handOver(L,p.armF,true);}},
 };
 // ---------- Zeichner, die mehrere Teile teilen ----------
 /** Halbschuh: kurzer Schaft über dem Knöchel, Schnürung auf dem Rist, Glanz auf der Kappe. */
 function schuh(L,p,leg,toe,far){const c=P.nkSchuh;K.boot(L,p,leg,toe,c,.9,far,'schuh');const a=leg[2],m=[(a[0]*.4+toe[0]*.6),(a[1]*.4+toe[1]*.6)];
  L.piece(P.white,1);for(let k=0;k<2;k++)K.line(L,[[m[0]-3+k*2,m[1]-2+k],[m[0]-1+k*2,m[1]-3+k]],c[0]);
  L.piece(c,1);K.line(L,[[toe[0]-1,toe[1]],[toe[0]+2,toe[1]]],c[0]);}
 /** Sakkoärmel bis zum Handgelenk (ohne weiße Manschette: die wirkte in Weltgröße wie ein Fleck auf der Hand). */
 function anzugArm(L,p,arm,far){return K.sleeve(L,p,arm,P.nkAnzug,.9,1.8,far,{roll:false});}
 /** Puffärmel der Dirndlbluse: kurz, gebauscht, Gummizug mit Rüschenkante. */
 function puff(L,p,arm,far){const s=K.sleeve(L,p,arm,P.white,.3,3.6,far,{roll:true});const a=K.lerp(arm[0],arm[1],.12);K.line(L,[[a[0]-3,a[1]],[a[0],a[1]+4]],P.white[2],s);}
 /** Linie parallel zu einem Glied (Abstand d quer zur Laufrichtung je Punkt) – Streifen folgen dem gebeugten Arm. */
 const quer=(pts,d)=>pts.map((q,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [q[0]-(b[1]-a[1])/l*d,q[1]+(b[0]-a[0])/l*d];});
 /** Rennjackenärmel: lang, schwarzes Bündchen, zwei weiße Längsstreifen bis kurz vor das Bündchen. */
 function rennArm(L,p,arm,far){const s=K.sleeve(L,p,arm,P.nkRenn,.9,2.2,far,{roll:false,cuff:P.black}),g=K.seg(arm,.1,.8),w=P.white[far?1:0];
  for(const d of [-1.2,1.2])K.line(L,quer(g,d),w,s);return s;}
 /** Rumpf der Rennjacke: rotes Leder bis zur Hüfte, zwei weiße Querstreifen über Brust/Rücken, schwarzes Rippbündchen. */
 function rennRumpf(L,p){const j=coat(L,p,P.nkRenn,2.6,-14,40,1.2);
  for(const y of [3,8]){const w=L.piece(P.white);K.poly(L,K.torso(p,2.9,y,y+2.6,{sway:!p.ride}),P.white[1]);K.light(L,w,{base:1,hi:0,lo:2,dark:1});}
  saum(L,p,P.black,2.9,37,41);return j;}
 /** Tweed: helle und dunkle Flecken im Fischgrat-Raster. */
 function tweed(L,part,x0,x1,y0,y1,c){for(let y=y0;y<=y1;y+=2)for(let x=x0+((y-K.NZ[1])%4?1:0);x<=x1;x+=3){const k=K.hsA(x,y);if(!L.is(part,x,y)||!same(colAt(L,x,y),c[1]))continue;if(k>.72)L.on(part,x,y,c[0]);else if(k<.3)L.on(part,x,y,c[2]);}}
 /** Hörmuschel mit Polster (nahe Seite). */
 function muschel(L,x,y,dunkel){const m=L.piece(P.black);K.ell(L,x,y,5.4,7.6,P.black[dunkel?3:2]);K.light(L,m,{base:dunkel?3:2,hi:1,lo:3,dark:2});
  const r=L.piece(P.red);K.ell(L,x-.5,y,3,4.6,P.red[1]);K.light(L,r,{base:1,hi:0,lo:2,dark:1});on(L,r,x-1,y-1,P.red[0]);}
 /** Klemmbrett senkrecht an der Hand: Pappe, Blatt mit Zeilen und Haken, Metallklemme oben. vorn=false: Rückseite. */
 function brett(L,hx,hy,vorn){const c=P.nkPappe,b=L.piece(c);K.poly(L,[[hx-9,hy-3],[hx+7,hy-4],[hx+9,hy+21],[hx-7,hy+22]],c[1]);K.light(L,b,{base:1,hi:0,lo:2,dark:2});
  if(vorn){const s=L.piece(P.card);K.poly(L,[[hx-7,hy],[hx+5.5,hy-1],[hx+7.2,hy+19.5],[hx-5.5,hy+20.5]],P.card[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});
   for(let k=0;k<5;k++){const y=hy+4+k*3;K.line(L,[[hx-4.5+k*.15,y],[hx+3.5+k*.15,y-.3]],P.card[3],s);}
   K.line(L,[[hx-4,hy+17],[hx-3,hy+18],[hx-1,hy+15]],P.red[1],s);}
  else for(let k=0;k<3;k++)K.line(L,[[hx-6,hy+5+k*6],[hx+6,hy+4+k*6]],c[2],b);
  const m=L.piece(P.metal);K.poly(L,[[hx-4,hy-5],[hx+3,hy-5.5],[hx+3.5,hy-1],[hx-3.5,hy-.5]],P.metal[1]);K.light(L,m,{base:1,hi:0,lo:2,dark:1});}
 /** Bierkasten am Tragegriff: Vorderseite mit Rippen und Etikett, Deckfläche mit Kronkorken, Seitenwand im Schatten. */
 function kasten(L,hx,hy){const c=P.nkKasten,x0=hx-12,x1=hx+11,y0=hy+1,y1=hy+19;
  const sd=L.piece(c);K.poly(L,[[x1,y0],[x1+5,y0-5],[x1+5,y1-5],[x1,y1]],c[2]);K.light(L,sd,{base:2,hi:2,lo:3,dark:1});
  const tp=L.piece(c);K.poly(L,[[x0,y0],[x1,y0],[x1+5,y0-5],[x0+5,y0-5]],c[3]);
  for(let r=0;r<2;r++)for(let k=0;k<5;k++){const bx=x0+3.4+k*4.4+r*2.4,by=y0-1.6-r*2.4,g=L.piece(P.gold);K.ell(L,bx,by,1.5,1,P.gold[r?2:1]);on(L,g,bx-1,by-1,P.gold[0]);}
  const f=L.piece(c);K.poly(L,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],c[1]);K.light(L,f,{base:1,hi:0,lo:2,dark:2});
  for(const y of [y0+7,y1-3])K.line(L,[[x0+1,y],[x1-1,y]],c[2],f);
  K.poly(L,[[hx-5,y0+2],[hx+4,y0+2],[hx+4,y0+5],[hx-5,y0+5]],c[4],f);// Griffloch
  const e=L.piece(P.label);K.poly(L,[[hx-5,y0+9],[hx+4,y0+9],[hx+4,y1-5],[hx-5,y1-5]],P.label[0]);on(L,e,hx-1,y0+11,P.red[1]);on(L,e,hx,y0+11,P.red[1]);}
 const back={
  hemd:{rumpf(L,p){const c=P.nkHemd,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,1.3,-14,29,.4);
   const k=L.piece(c);K.poly(L,[[cx-nr-2,cy-17],[cx+nr+3,cy-17],[cx+nr+2,cy-13],[cx-nr-1,cy-13]],c[1]);K.light(L,k,{base:1,hi:0,lo:2,dark:1});
   K.line(L,[[cx-15,cy-5],[cx-4,cy-3],[cx+6,cy-3],[cx+15,cy-5]],c[2],j);K.line(L,[[cx+1,cy-3],[cx+1,cy+8]],c[2],j);// Passe, Kellerfalte
   for(const dx of [-12,11])K.line(L,[[cx+dx,cy+18],[cx+dx+1,cy+28]],c[2],j);}},
  sakko:{armVorn(L,p){anzugArm(L,p,p.armN,false);},
   rumpf(L,p){const c=P.nkAnzug,[cx,cy]=p.C,nr=neck(p),j=coat(L,p,c,2.2,-14,40,1);
   const k=L.piece(c);K.poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-11],[cx-nr-1,cy-11]],c[2]);K.light(L,k,{base:2,hi:1,lo:3,dark:1});
   K.line(L,[[cx+1,cy-10],[cx+1,cy+40]],c[3],j);K.line(L,[[cx+2,cy+30],[cx+2,cy+40]],c[0],j);}},// Mittelnaht, Schlitz
  strickjacke:{rumpf(L,p){const c=P.nkStrick,[cx,cy]=p.C,j=coat(L,p,c,2.4,-14,40,1.5);maschen(L,j,cx-56,cx+56,cy-12,cy+38,c);saum(L,p,c,2.8,37,42);
   const k=L.piece(c);K.poly(L,[[cx-neck(p)-2,cy-17],[cx+neck(p)+3,cy-17],[cx+neck(p)+2,cy-13],[cx-neck(p)-1,cy-13]],c[2]);K.light(L,k,{base:2,hi:1,lo:3,dark:1});}},
  kapuzenpulli:{haarHinten:null,rumpf(L,p){const c=P.nkPulli,[cx,cy]=p.C;coat(L,p,c,2.4,-14,37,.8);saum(L,p,c,2.2,35,39);
   const h=L.piece(c);K.ell(L,cx,cy-5,14,11,c[1]);K.light(L,h,{base:1,hi:0,lo:2,dark:2});K.ell(L,cx,cy-10,9,5,c[3],h);K.line(L,[[cx,cy-5],[cx,cy+5]],c[2],h);K.line(L,[[cx-12,cy-9],[cx-7,cy-2]],c[0],h);}},// Kapuze liegt auf dem Rücken
  kittel:{rumpf(L,p){const c=P.nkKittel,[cx,cy]=p.C,nr=neck(p),low=p.ride?42:70,j=coat(L,p,c,2.6,-14,72,2.6,26);
   const k=L.piece(c);K.poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+2,cy-12],[cx-nr-1,cy-12]],c[0]);K.light(L,k,{base:0,hi:0,lo:1,dark:1});
   K.line(L,[[cx+1,cy-11],[cx+1,cy+low+2]],c[2],j);const g=L.piece(c);K.poly(L,[[cx-12,cy+26],[cx+13,cy+26],[cx+13,cy+30],[cx-12,cy+30]],c[1]);K.light(L,g,{base:1,hi:0,lo:2,dark:1});
   for(const x of [cx-10,cx+11])knopf(L,g,x,cy+27,P.white);falten(L,j,cx-14,cx+16,cy+34,cy+low+4,c,9);}},// Rückengurt
  dirndl:{rumpf(L,p){const [cx,cy]=p.C,B=P.white,M=P.nkMieder,Rk=P.nkRock,V=P.nkVorbinder;
   const bl=L.piece(B);K.poly(L,K.torso(p,1,-14,4),B[1]);K.light(L,bl,{base:1,hi:0,lo:2,dark:2});
   const r=L.piece(Rk);K.poly(L,K.torso(p,2.4,27,80,{flare:4.2,sway:!p.ride,extend:p.ride?0:34}),Rk[1]);K.light(L,r,{base:1,hi:0,lo:2,dark:3});falten(L,r,cx-30,cx+30,cy+30,cy+(p.ride?44:80),Rk,6);
   const m=L.piece(M);K.poly(L,K.torso(p,1.5,-6,29),M[1]);K.light(L,m,{base:1,hi:0,lo:2,dark:3});for(const dx of [-8,9])K.line(L,[[cx+dx,cy-5],[cx+dx*.7,cy+28]],M[3],m);
   const bd=L.piece(V);K.poly(L,K.torso(p,1.9,27,30),V[2]);K.light(L,bd,{base:2,hi:1,lo:3,dark:1});
   const sl=L.piece(V);K.ell(L,cx-3,cy+29,3.4,2.4,V[1]);K.ell(L,cx+5,cy+29,3.4,2.4,V[1]);K.limb(L,[[cx,cy+30],[cx-2,cy+41]],[1.3,1],V[2]);K.limb(L,[[cx+2,cy+30],[cx+4,cy+40]],[1.3,1],V[1]);K.light(L,sl,{base:1,hi:0,lo:2,dark:1});}},
  schuerze:{rumpf(L,p){const c=P.white,[cx,cy]=p.C,nr=neck(p),t=K.row(p.A,27);
   L.piece(c,1);K.line(L,[[cx+t[1]-1,cy+27],[cx+t[2]+1,cy+27]],c[2]);K.line(L,[[cx-nr,cy-18],[cx+nr+1,cy-18]],c[2]);
   const s=L.piece(c);K.ell(L,cx-3,cy+27,3.2,2.2,c[1]);K.ell(L,cx+4,cy+27,3.2,2.2,c[1]);K.limb(L,[[cx,cy+28],[cx-2,cy+38]],[1.2,1],c[2]);K.limb(L,[[cx+1,cy+28],[cx+3,cy+37]],[1.2,1],c[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});}},
  warnweste:{rumpf(L,p){const c=P.nkWarn,[cx,cy]=p.C;coat(L,p,c,3.4,-13,40,1.2);
   for(const y of [17,30]){const s=L.piece(P.metal);K.poly(L,K.torso(p,3.6,y,y+3.4,{sway:!p.ride}),P.metal[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});}
   const w0=K.row(p.A,0);for(const dx of [w0[1]*.5,w0[2]*.5+1]){const s=L.piece(P.metal);K.poly(L,[[cx+dx-1.6,cy-13],[cx+dx+1.6,cy-13],[cx+dx+1.6,cy+17],[cx+dx-1.6,cy+17]],P.metal[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});}}},
  latzhose:{rumpf(L,p){const c=P.nkBlau,[cx,cy]=p.C,j=L.piece(c);K.poly(L,K.torso(p,1.9,24,48),c[1]);K.light(L,j,{base:1,hi:0,lo:2,dark:3});
   const s=L.piece(c);K.limb(L,[[cx-13,cy-16],[cx+7,cy+25]],[2.2,2.2],c[2]);K.limb(L,[[cx+14,cy-16],[cx-5,cy+25]],[2.2,2.2],c[1]);K.light(L,s,{base:1,hi:0,lo:2,dark:1});// Träger über Kreuz
   K.line(L,[[cx+1,cy+30],[cx+1,cy+47]],c[3],j);const pk=[[cx-14,cy+34],[cx-4,cy+34],[cx-4,cy+42],[cx-14,cy+42]];K.line(L,[...pk,pk[0]],P.stitch,j);}},
  schiebermuetze:{kopf(L,p){const [x,y]=p.head,c=P.nkTweed;
   const t=L.piece(c);K.poly(L,[[x-21,y-10],[x-19,y-19],[x-11,y-25],[x+1,y-27],[x+12,y-25],[x+19,y-19],[x+21,y-10]],c[1]);K.light(L,t,{base:1,hi:0,lo:2,dark:3});tweed(L,t,x-26,x+26,y-30,y-7,c);
   K.line(L,[[x-19,y-12],[x+20,y-12]],c[3],t);}},
  kopfhoerer:{kopf(L,p){const [x,y]=p.head;
   const s=L.piece(P.black);K.limb(L,[[x-19,y-3],[x-17,y-15],[x-8,y-23],[x+2,y-25],[x+12,y-23],[x+19,y-15],[x+20,y-3]],[2,2,2,2,2,2,2],P.black[2]);K.light(L,s,{base:2,hi:1,lo:3,dark:1});
   for(const dx of [-20,21]){const m=L.piece(P.black);K.ell(L,x+dx,y+2,4.4,7.2,P.black[dx<0?2:3]);K.light(L,m,{base:dx<0?2:3,hi:1,lo:3,dark:2});}}},
  klemmbrett:{armVorn(L,p){const [hx,hy]=K.handPos(p.armF);brett(L,hx,hy,false);K.handOver(L,p.armF,true);}},
  rennjacke:{rumpf(L,p){const [cx,cy]=p.C,nr=neck(p);rennRumpf(L,p);
   const k=L.piece(P.black);K.poly(L,[[cx-nr-3,cy-17],[cx+nr+4,cy-17],[cx+nr+3,cy-12.5],[cx-nr-2,cy-12.5]],P.black[2]);K.light(L,k,{base:2,hi:1,lo:3,dark:1});// Stehkragen hinten
   const t=L.piece(P.black);K.poly(L,[[cx-8,cy-9],[cx+10,cy-9],[cx+10,cy],[cx-8,cy]],P.black[2]);K.light(L,t,{base:2,hi:1,lo:3,dark:1});// Namensfeld über den Schulterblättern
   K.text(L,t,cx-5,cy-7,'RON',P.white[0],0);}},
 };
 return {gear,back,families:{},sided:[]};
}
