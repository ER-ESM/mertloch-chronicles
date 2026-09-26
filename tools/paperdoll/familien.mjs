// Erweiterungsmodul der Anziehpuppe (familien): alle sichtbaren Ausrüstungsfamilien des Spiels (equipment-appearance.js).
// Feste Spielgegenstände (Kennung = Item-ID aus content/items.js) und schlichte Grundteile für Zufallsgegenstände.
// K = Zeichenbaukasten aus puppe.mjs; K.HW (Handgröße) erst beim Zeichnen lesen.
// Seitenregel: p.swap = Rückansicht XOR gespiegelt. Linke Seite des Trägers liegt bei p.swap links im Bild, sonst rechts.
// Rückgabe: {gear, back, families, sided}
export function familien(K){
 const {PAL,ell,limb,poly,line,stamp,light,text,lerp,seg,segR,handPos,handOver,sleeve,boot,torso,row}=K;
 // ---------- Farbtreppen (wie puppe.mjs: Wert eine Stufe tiefer, Sättigung leicht rauf) ----------
 const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
 const tone=([r,g,b])=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  l=l*.86;sat=Math.min(1,sat*1.08);const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  return sat?[f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255)):[l,l,l].map(v=>Math.round(v*255));};
 const R=a=>a.map(hex).map(tone);
 Object.assign(PAL,{
  faHelm:R(['#fff0a0','#ffc640','#e8922a','#a85e22','#623416']),// Festivalhelm (Bauhelm, Signalgelb)
  faWein:R(['#e88a92','#b64e5c','#86344a','#5a2238','#321424']),// Festtagsjacke (Bordeaux-Cord)
  faNubuk:R(['#f6cc80','#d89c4c','#aa7030','#76481e','#42260e']),// Maifeldtreter (Nubukleder)
  faMitt:R(['#ff9670','#e8583c','#b8362a','#7c1e1e','#461014']),// Grillhandschuhe
  faZahn:R(['#fffef6','#f6f0dc','#e0d0a0','#a8905a','#5c4424']),// Keilerhauer (Elfenbein, Wurzel vergilbt)
  faSchild:R(['#78aee8','#3c78c4','#285496','#1a3464','#10203c']),// Zeltplatz-Schild
  faBier:R(['#fff2a0','#f8c83c','#d8962a','#9a6420']),// Bier im Becher
  // Waffenkammer 2026-09-25 (Präfix wf)
  wfZange:R(['#eef4ea','#b8c8b6','#8a9e90','#5e7068','#3a4644']),// Rohrzange: grüngrauer Stahlkopf
  wfKugel:R(['#b4bebc','#86928f','#626e6c','#434c4c','#272e30']),// dunkler Stahl (Stachelkugel, Fassreifen)
  wfHaut:R(['#fff0dc','#f6caa6','#dca07e','#aa6a58','#6a3a3c']),// Gartenzwerg-Gesicht (eigene Treppe: färbt nicht mit der Heldenhaut um)
  wfWurst:R(['#f6c49a','#d88c5a','#aa5e3a','#723a26','#44221a']),// Bratwurst
  wfRosa:R(['#ffd6e2','#f89ab2','#dc6a88','#a2405e','#62243a']),// Wasserpistole
  wfOrange:R(['#ffcf96','#f89440','#d0661e','#904014','#52220a']),// Akkuschrauber
  wfSchiefer:R(['#94a4bc','#66788f','#4c5a72','#343f54','#1f2636']),// Akkuschrauber-Griff
  // Dorflegenden 2026-09-26 (Präfix lg)
  lgNerz:R(['#d8aa80','#ac7852','#80543a','#58382c','#36221e']),// Pelzmantel: Kunstpelz Nerzbraun
  lgHermelin:R(['#fffcf4','#f2eadc','#d6cab6','#a29682','#645a4e']),// Hermelinkragen und -manschetten
  lgViolett:R(['#c8a2ec','#9e6ad0','#7648aa','#4e2e7c','#2e1a4c']),// Mantelfutter, Weinstein
  lgLachs:R(['#ffd8c4','#f8ae90','#e0846a','#aa584c','#6c3232']),// Hochglanz-Exposé
  lgHimmel:R(['#dcf0ff','#a8d0f4','#78a8dc','#4e78ac']),// Himmel im Burgfoto
  lgReb:R(['#eaa878','#c27a4c','#945434','#663624','#3e2016']),// Rebholzgriff
  lgLed:R(['#fffbe8','#f6e8c0','#dccb98','#a89468','#6a5a40']),// Ringlicht, warmweiß
  lgKegel:R(['#b4d6fa','#6e9ee0','#4474bc','#2a4a86','#162850']),// Kegelkugel, blau marmoriert
 });
 const hs=(x,y)=>((Math.sin(x*12.9898+y*78.233)*43758.5453)%1+1)%1;
 /** Einzelpixel über L.T (Schwung der Waffe, Rumpfneigung der Aktionsposen) setzen/prüfen – L.on/L.is arbeiten ungedreht. */
 const tq=(L,x,y)=>L.T?L.T([x,y]):[x,y];
 const on=(L,part,x,y,c)=>{const q=tq(L,x,y);L.on(part,q[0],q[1],c);};
 const is=(L,part,x,y)=>{const q=tq(L,x,y);return L.is(part,q[0],q[1]);};
 const unit=(a,b)=>{const d=[b[0]-a[0],b[1]-a[1]],l=Math.hypot(...d)||1;return [d[0]/l,d[1]/l];};
 /** Handgelenk w, Unterarmrichtung u, Normale n (wie hand() in puppe.mjs). */
 const handGeo=arm=>{const w=arm[2],u=unit(arm[1],arm[2]);return {w,u,n:[-u[1],u[0]]};};
 /** Bildseite der linken Körperseite des Trägers (+1 rechts, −1 links). */
 const lft=p=>p.swap?-1:1;
 /** Rumpfkante auf Höhe y an der Bildseite s. */
 const edge=(p,y,s)=>p.C[0]+(s<0?row(p.A,y)[1]:row(p.A,y)[2]);
 const coat=(L,p,c,pad,y0,y1,flare=0)=>{const j=L.piece(c);poly(L,torso(p,pad,y0,y1,{flare,sway:true}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});return j;};
 /** Kronkorken: Scheibe mit gezacktem Rand und Glanzpunkt. */
 function cap(L,x,y,col,r=2.4){const c=L.piece(col);ell(L,x,y,r,r*.9,col[1]);for(let a=0;a<6.28;a+=.8)on(L,c,x+Math.cos(a)*(r-.4),y+Math.sin(a)*(r*.9-.4),col[2]);on(L,c,x-1,y-1,col[0]);return c;}
 /** Kabelbinder quer über ein Teil: helle Oberkante, dunkle Unterkante, Kopf seitlich. */
 function tie(L,clip,q,n,w,col,head=1){line(L,[[q[0]-n[0]*w,q[1]-n[1]*w],[q[0]+n[0]*w,q[1]+n[1]*w]],col[0],clip);line(L,[[q[0]-n[0]*w,q[1]-n[1]*w+1],[q[0]+n[0]*w,q[1]+n[1]*w+1]],col[1],clip);
  if(head){const h=[q[0]+n[0]*(w+.6)*head,q[1]+n[1]*(w+.6)*head];L.piece(col);ell(L,h[0],h[1]+.5,1.4,1.2,col[1]);}}
 /** Halsschnur zum Anhänger (vorn V, hinten Bogen im Nacken). */
 function cord(L,p,to,c){const [cx,cy]=p.C,nr=(p.A.neckR||[6.5,7.5])[1];const k=L.piece(c,1);
  if(p.back){line(L,[[cx-nr-1,cy-15],[cx+1,cy-13.5],[cx+nr+2,cy-15]],c[2]);return k;}
  line(L,[[cx-nr-1,cy-14],[to[0]-1,to[1]]],c[1]);line(L,[[cx+nr+2,cy-14],[to[0]+1,to[1]]],c[2]);return k;}
 // ---------- In der Hand gehaltene Fernwaffen: Seitenregel und Schwung wie die Nahkampfwaffen (puppe.mjs makeSrcs) ----------
 function inHand(L,p,draw){const [ox,oy]=handPos(p.armN),a=p.swingN||0;
  if(a){const co=Math.cos(a),si=Math.sin(a);L.T=([x,y])=>[ox+(x-ox)*co-(y-oy)*si,oy+(x-ox)*si+(y-oy)*co];L.rot=a;}
  try{draw(L,p);}finally{L.T=null;L.rot=0;}}
 // ferne Hand im Band K.HAND_F (vor dem fernen Bein, hinter Rumpf und nahem Bein) – wie die Nahkampfwaffen
 const held=draw=>({armVorn(L,p){if(!p.swap)inHand(L,p,draw);},
  [K.HAND_F](L,p){if(p.swap)inHand(L,{...p,armN:p.armF,armF:p.armN,swingN:p.swingF,swingF:p.swingN},draw);}});
 /** Handstück an der fernen Hand (Ring, Handschuh): zu Fuß im Band K.HAND_F über der Waffenfaust, beim Reiten in armHinten wie der Arm. */
 const fern=draw=>({armHinten(L,p){if(p.ride)draw(L,p);},[K.HAND_F](L,p){if(!p.ride)draw(L,p);}});

 // ---------- Waffen ----------
 /** Entgratete Dosenklinge: Dosenlasche als Knauf, Ledergriff, Blechklinge mit grünem Dosendruck. */
 function dosenklinge(L,p){const [hx,hy]=handPos(p.armN),t=PAL.tin;
  const k=L.piece(t);ell(L,hx,hy-9,3,2.4,t[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});ell(L,hx+.3,hy-9.3,1.2,.9,null,'del');
  const g=L.piece(PAL.leather);limb(L,[[hx,hy-7],[hx,hy+6]],[2.2,2.3],PAL.leather[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});
  for(let y=hy-6;y<hy+6;y+=2)line(L,[[hx-2,y],[hx+2,y+1]],PAL.leather[3],g);
  const q=L.piece(PAL.metal);poly(L,[[hx-5.5,hy+5.5],[hx+5.5,hy+5.5],[hx+5,hy+8.5],[hx-5,hy+8.5]],PAL.metal[1]);light(L,q,{base:1,hi:0,lo:2,dark:1});
  const b=L.piece(t);poly(L,[[hx-3.2,hy+8.5],[hx+3.6,hy+8.5],[hx+3.4,hy+26],[hx+.4,hy+34],[hx-2.8,hy+26]],t[1]);light(L,b,{base:1,hi:0,lo:2,dark:1,share:.4});
  poly(L,[[hx-3.2,hy+13],[hx+3.6,hy+13],[hx+3.6,hy+18],[hx-3.2,hy+18]],PAL.can[1],b);line(L,[[hx-3,hy+13],[hx+3,hy+13]],PAL.can[0],b);on(L,b,hx+1,hy+15,PAL.rain[1]);on(L,b,hx+2,hy+15,PAL.rain[1]);
  line(L,[[hx-2.2,hy+9],[hx-2,hy+12]],t[0],b);line(L,[[hx-2,hy+19],[hx-1.6,hy+27],[hx,hy+32]],t[0],b);// Schneide hell
  handOver(L,p.armN);}
 /** Dosenbrecher (Pfandprügel): Holzknüppel, Kopf mit Dosenblech umwickelt, zwei Rohrschellen, Kronkorken genagelt. */
 function dosenbrecher(L,p){const [hx,hy]=handPos(p.armN),w=PAL.wood;
  const s=L.piece(w);limb(L,[[hx,hy-8],[hx,hy+10],[hx+.5,hy+33]],[2.3,3,5.4],w[1]);light(L,s,{base:1,hi:0,lo:2,dark:2});
  for(let k=0;k<3;k++)line(L,[[hx-2.4,hy-7+k*2.5],[hx+2.4,hy-6+k*2.5]],PAL.black[2],s);// Griffband
  const d=L.piece(PAL.can);limb(L,[[hx+.2,hy+16],[hx+.4,hy+26]],[4.6,5.3],PAL.can[1]);light(L,d,{base:1,hi:0,lo:2,dark:1});
  for(const [dx,dy] of [[-2,19],[1,21],[-1,24],[2,18]])on(L,d,hx+dx,hy+dy,PAL.can[3]);on(L,d,hx-3,hy+20,PAL.can[0]);on(L,d,hx-3,hy+21,PAL.can[0]);
  for(const yy of [15.5,26.5]){const rr=4.2+(yy-15)/12,m=L.piece(PAL.metal);poly(L,[[hx-rr-.4,hy+yy-1],[hx+rr+.8,hy+yy-1],[hx+rr+.8,hy+yy+1.2],[hx-rr-.4,hy+yy+1.2]],PAL.metal[1]);light(L,m,{base:1,hi:0,lo:2,dark:1});on(L,m,hx+rr+.3,hy+yy,PAL.metal[3]);}
  for(const [dx,dy,col] of [[-2,30,PAL.gold],[2.4,31.5,PAL.red],[-.5,35,PAL.gold]])cap(L,hx+dx,hy+dy,col,1.9);
  handOver(L,p.armN);}
 /** Kabelbinder-Pfandschleuder: Astgabel (Gabel nach unten), weiße Kabelbinder, rote Gummischlinge, Lederschlaufe. */
 function pfandschleuder(L,p){const [hx,hy]=handPos(p.armN),w=PAL.wood;
  const g=L.piece(w);limb(L,[[hx,hy-5],[hx,hy+9]],[2.2,2.5],w[1]);limb(L,[[hx,hy+8],[hx-3.5,hy+14],[hx-6.5,hy+21]],[2.4,2,1.8],w[1]);limb(L,[[hx,hy+8],[hx+3.5,hy+14],[hx+6.5,hy+21]],[2.4,2,1.8],w[2]);
  light(L,g,{base:1,hi:0,lo:2,dark:2});line(L,[[hx-1,hy+10],[hx-5,hy+17]],w[0],g);
  const r=L.piece(PAL.red,1);line(L,[[hx-6.5,hy+21],[hx-3.5,hy+25],[hx-1,hy+27]],PAL.red[1]);line(L,[[hx+6.5,hy+21],[hx+3.5,hy+25],[hx+1,hy+27]],PAL.red[2]);
  const pch=L.piece(PAL.leather);ell(L,hx,hy+27.5,3,2.2,PAL.leather[1]);light(L,pch,{base:1,hi:0,lo:2,dark:1});
  for(const [x,y] of [[hx,hy+8.5],[hx-6.3,hy+20],[hx+6.3,hy+20]]){const t=L.piece(PAL.white);limb(L,[[x-2.6,y],[x+2.6,y+.6]],[.9,.9],PAL.white[0]);light(L,t,{base:0,hi:0,lo:1,dark:1});}
  handOver(L,p.armN);}
 /** Annis Hygiene-Hochdruckspray als Sprühpistole: Griff in der Faust, Sprühkopf mit rotem Abzug, Messinglanze entlang der
  *  Waffenachse (hängend nach unten, beim Zielen nach vorn), grüne Pumpflasche parallel davor (beim Zielen obenauf), goldene Provisionskrone. */
 function hochdruckspray(L,p){const [hx,hy]=handPos(p.armN),c=PAL.can,f=p.back?-1:1,tx=hx+5.8*f;
  const g=L.piece(PAL.black);limb(L,[[hx,hy-4],[hx,hy+3]],[2,2.2],PAL.black[2]);light(L,g,{base:2,hi:1,lo:3,dark:1});
  const k=L.piece(PAL.black);poly(L,[[hx-3*f,hy+3.5],[hx+3*f,hy+3.5],[hx+4*f,hy+9],[hx-2.5*f,hy+9]],PAL.black[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});
  const tr=L.piece(PAL.red);poly(L,[[hx-2*f,hy+4],[hx-4.5*f,hy+5],[hx-4*f,hy+7],[hx-2*f,hy+6.5]],PAL.red[1]);light(L,tr,{base:1,hi:0,lo:2,dark:1});
  const ln=L.piece(PAL.metal);limb(L,[[hx,hy+9],[hx,hy+25]],[1.2,1.2],PAL.metal[2]);light(L,ln,{base:2,hi:1,lo:3,dark:1});
  const n=L.piece(PAL.gold);limb(L,[[hx,hy+24],[hx,hy+28.5]],[1.7,1.3],PAL.gold[1]);light(L,n,{base:1,hi:0,lo:2,dark:1});
  const nk=L.piece(c);limb(L,[[hx+2.5*f,hy+7],[tx,hy+10]],[1.6,1.8],c[2]);light(L,nk,{base:2,hi:1,lo:3,dark:1});
  const t=L.piece(c);limb(L,[[tx,hy+12],[tx,hy+22]],[4.4,4.4],c[1]);ell(L,tx,hy+11,3.6,2.4,c[1]);light(L,t,{base:1,hi:0,lo:2,dark:2});
  line(L,[[tx-2.8,hy+11],[tx-2.8,hy+22]],c[0],t);
  const e=L.piece(PAL.white);poly(L,[[tx-3.4,hy+14],[tx+3.4,hy+14],[tx+3.4,hy+20],[tx-3.4,hy+20]],PAL.white[1]);light(L,e,{base:1,hi:0,lo:2,dark:1});
  poly(L,[[tx-.8,hy+14.8],[tx+1.2,hy+14.8],[tx+1.2,hy+19.2],[tx-.8,hy+19.2]],PAL.red[1],e);poly(L,[[tx-2.2,hy+16.2],[tx+2.6,hy+16.2],[tx+2.6,hy+17.8],[tx-2.2,hy+17.8]],PAL.red[1],e);
  L.piece(PAL.gold,1);line(L,[[hx-2*f,hy+8],[hx-4.5*f,hy+13]],PAL.gold[3]);
  const kr=L.piece(PAL.gold);stamp(L,null,hx-4.5*f-2.5,hy+13,['g.g.g','ggggg','ggggg','.ggg.'],{g:PAL.gold[1]});light(L,kr,{base:1,hi:0,lo:2,dark:1});
  handOver(L,p.armN);}
 /** Trillerpfeife der Ruhestörung: rote Kordel aus der Faust, verchromte Pfeife mit Kammer, Mundstück und Luftschlitz. */
 function trillerpfeife(L,p){const [hx,hy]=handPos(p.armN),m=PAL.metal,f=p.back?-1:1;
  L.piece(PAL.red,1);line(L,[[hx-1,hy+3],[hx-.5,hy+8],[hx,hy+12]],PAL.red[1]);line(L,[[hx,hy+3],[hx+.5,hy+8],[hx+1,hy+12]],PAL.red[2]);
  const o=L.piece(m);ell(L,hx+.5,hy+13.5,2.2,2,m[2]);ell(L,hx+.5,hy+13.5,.9,.8,null,'del');
  const w=L.piece(m);poly(L,[[hx,hy+15],[hx+10*f,hy+15],[hx+10*f,hy+19.5],[hx,hy+19.5]],m[1]);ell(L,hx+1-2.5*f,hy+20.5,6,5.4,m[1]);light(L,w,{base:1,hi:0,lo:2,dark:2});
  for(const k of [3,4,5])on(L,w,hx+k*f,hy+15,PAL.black[3]);// Luftschlitz
  on(L,w,hx-2-2.5*f,hy+18,[255,255,255]);on(L,w,hx-1-2.5*f,hy+18,m[0]);line(L,[[hx-3*f,hy+22.5],[hx+1*f,hy+22.5]],m[3],w);// Glanz, Gravur „22:01“
  handOver(L,p.armN);}

 /** Mehrwegflasche (Zeichnung wie GEAR.flasche in puppe.mjs) – nur für die Nebenhand-Fassung. */
 function flasche(L,p){const [hx,hy]=handPos(p.armN),g=PAL.glass;
  const b=L.piece(g);limb(L,[[hx,hy-6],[hx,hy+5],[hx,hy+9],[hx,hy+25]],[1.9,2.1,4.6,4.8],g[2]);light(L,b,{base:2,hi:1,lo:3,dark:2});line(L,[[hx-3,hy+10],[hx-3,hy+23]],g[0],b);
  const l=L.piece(PAL.label);poly(L,[[hx-4,hy+13],[hx+5,hy+13],[hx+5,hy+20],[hx-4,hy+20]],PAL.label[0]);light(L,l,{base:0,hi:0,lo:1,dark:1});poly(L,[[hx-1,hy+15],[hx+3,hy+15],[hx+3,hy+18],[hx-1,hy+18]],PAL.red[1],l);
  L.piece(PAL.gold);poly(L,[[hx-2.5,hy-9],[hx+2.5,hy-9],[hx+2.5,hy-6],[hx-2.5,hy-6]],PAL.gold[2]);handOver(L,p.armN);}
 /** Einhandwaffe in der Nebenhand (Beidhändig, Kennung_nh): linke Hand des Trägers. puppe.mjs tauscht bei slot 'offhand'
  *  und p.swap die Arme bereits (Drehpunkt = Nebenhand); hier zurücktauschen, damit der Waffenzeichner armN nutzt.
  *  Ohne Tausch liegt die Hand hinten (Band K.HAND_F: vor dem fernen Bein, hinter dem Rumpf), mit Tausch vorn (armVorn). */
 const nebenhand=(name,draw)=>{const sw=p=>({...p,armN:p.armF,armF:p.armN,swingN:p.swingF,swingF:p.swingN});
  return {slot:'offhand',hands:1,name,[K.HAND_F](L,p){if(!p.swap)draw(L,sw(p));},armVorn(L,p){if(p.swap)draw(L,sw(p));}};};

 // ---------- Nebenhand ----------
 /** Zeltplatz-Schild als Schild: blaues Verkehrsschild mit Zelt-Piktogramm, Schrauben; Rückseite verzinkt mit Rohrschellen. */
 function zeltplatzschild(L,p){const [hx,hy]=handPos(p.armF);
  if(p.back){const cx=hx+1,cy=hy-3,t=PAL.tin,s=L.piece(t);poly(L,[[cx-12,cy-10],[cx+12,cy-10],[cx+12,cy+10],[cx-12,cy+10]],t[2]);light(L,s,{base:2,hi:1,lo:3,dark:2});
   for(const dy of [-5,5]){const b=L.piece(PAL.metal);poly(L,[[cx-3,cy+dy-2],[cx+3,cy+dy-2],[cx+3,cy+dy+2],[cx-3,cy+dy+2]],PAL.metal[2]);light(L,b,{base:2,hi:1,lo:3,dark:1});on(L,b,cx-2,cy+dy,PAL.metal[0]);on(L,b,cx+2,cy+dy,PAL.metal[0]);}
   line(L,[[cx-9,cy+8],[cx-4,cy+6]],t[3],s);handOver(L,p.armF);return;}
  const cx=hx-10,cy=hy-8,a=-.1,P=(dx,dy)=>[cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)],c=PAL.faSchild;
  const s=L.piece(c);poly(L,[P(-13,-11),P(13,-11),P(13,11),P(-13,11)],c[1]);light(L,s,{base:1,hi:0,lo:2,dark:2,share:.24});
  line(L,[P(-10.5,-8.5),P(10.5,-8.5),P(10.5,8.5),P(-10.5,8.5),P(-10.5,-8.5)],PAL.white[1],s);
  poly(L,[P(0,-6),P(7.5,5.5),P(-7.5,5.5)],PAL.white[0],s);poly(L,[P(0,-.5),P(2.6,5.5),P(-2.6,5.5)],c[3],s);line(L,[P(0,-6),P(0,-8)],PAL.white[0],s);
  for(const [dx,dy] of [[-12,-10],[12,-10],[-12,10],[12,10]]){const q=P(dx*.9,dy*.8);on(L,s,q[0],q[1],PAL.metal[1]);}
  line(L,[P(4,9),P(9,6.5)],c[3],s);line(L,[P(-9,-6),P(-7,-7)],c[0],s);// Delle, Glanz
  handOver(L,p.armF);}

 // ---------- Kopf ----------
 /** Festivalhelm: Bauhelm mit Mittelrippe, umlaufender Krempe mit Schirm nach vorn, Clan-Aufkleber; hinten Reflexstreifen. */
 function festivalhelm(L,p){const [x,y]=p.head,c=PAL.faHelm,f=p.back?-1:1;
  const pts=[];for(let k=0;k<=24;k++){const a=Math.PI*(1+k/24);pts.push([x+1.5+Math.cos(a)*21,y-11.5+Math.sin(a)*22]);}
  const d=L.piece(c);poly(L,pts,c[1]);light(L,d,{base:1,hi:0,lo:2,dark:3,share:.26});
  const rb=L.piece(c,1);limb(L,[[x+1.5+2*f,y-33],[x+1.5+2.6*f,y-24],[x+1.5+3*f,y-13]],[2,2.2,2.2],c[0]);light(L,rb,{base:0,hi:0,lo:1,dark:1});
  const br=L.piece(c);poly(L,p.back?[[x-21,y-13],[x+24,y-13],[x+25,y-9],[x+18,y-7],[x-15,y-7],[x-22,y-9]]:[[x-22,y-13.5],[x+24,y-13.5],[x+29,y-9],[x+23,y-6],[x-16,y-7.5],[x-23,y-10]],c[2]);
  light(L,br,{base:2,hi:1,lo:3,dark:1});line(L,[[x-20,y-12],[x+24,y-12]],c[1],br);
  if(p.back){const s=L.piece(PAL.white);poly(L,[[x-17,y-20],[x+20,y-20],[x+20.5,y-17],[x-17.5,y-17]],PAL.white[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});return;}
  const a=L.piece(PAL.patch);ell(L,x-10,y-22,3.6,3.8,PAL.patch[1]);light(L,a,{base:1,hi:0,lo:2,dark:1});on(L,a,x-11,y-23,PAL.white[0]);on(L,a,x-10,y-23,PAL.white[0]);on(L,a,x-11,y-22,PAL.white[0]);}

 // ---------- Rumpf ----------
 /** Festtagsjacke: Bordeaux-Cordsakko mit Revers, Messingknöpfen, Pattentaschen und Einstecktuch (links am Träger). */
 const jackeRumpf=(L,p)=>{const c=PAL.faWein,[cx,cy]=p.C,A=p.A,j=coat(L,p,c,2.6,-14,46,1.6);
  for(let k=0;k<26;k++){const xx=cx-20+hs(k,11)*40,yy=cy-6+hs(11,k)*48;if(is(L,j,xx,yy)&&is(L,j,xx,yy+2))line(L,[[xx,yy],[xx,yy+2]],c[2],j);}// Cordrippen angedeutet
  {const r=row(A,43),t=K.tiltAt(p,43);line(L,[[cx+r[1]-1,cy+43+t[0]],[cx+r[2]+1,cy+43+t[1]]],c[3],j);}// Saumnaht
  if(p.back){const k=L.piece(c);poly(L,[[cx-12,cy-16],[cx+11,cy-16],[cx+9,cy-10],[cx-10,cy-10]],c[2]);light(L,k,{base:2,hi:1,lo:3,dark:1});
   line(L,[[cx,cy-9],[cx,cy+46]],c[3],j);line(L,[[cx+1,cy+34],[cx+1,cy+46]],c[4],j);return;}
  poly(L,[[cx-7.5,cy-16],[cx+9,cy-16],[cx+1.5,cy+11]],null,'del');
  const ln=L.piece(c);poly(L,[[cx-15,cy-15],[cx-7.5,cy-16],[cx+1.5,cy+11],[cx-2.5,cy+14],[cx-10,cy+2],[cx-14,cy-2],[cx-12,cy-7]],c[0]);light(L,ln,{base:0,hi:0,lo:1,dark:1});
  line(L,[[cx-14,cy-2],[cx-10,cy+2]],c[2],ln);// Kerbe im Revers
  const rf=L.piece(c);poly(L,[[cx+17,cy-15],[cx+9,cy-16],[cx+1.5,cy+11],[cx+5.5,cy+14],[cx+11,cy+2],[cx+14,cy-2],[cx+13,cy-7]],c[2]);light(L,rf,{base:2,hi:1,lo:3,dark:1});
  line(L,[[cx+2,cy+12],[cx+2,cy+46]],c[3],j);
  for(const yy of [18,28,38]){const b=L.piece(PAL.gold);ell(L,cx+4,cy+yy,1.6,1.6,PAL.gold[1]);on(L,b,cx+3.5,cy+yy-1,PAL.gold[0]);}
  for(const s of [-1,1]){const x0=s<0?cx+row(A,30)[1]+4:cx+7,x1=s<0?cx-4:cx+row(A,30)[2]-3;line(L,[[x0,cy+30],[x1,cy+30]],c[3],j);line(L,[[x0,cy+31],[x1,cy+31]],c[0],j);}
  const s=lft(p),px=s>0?cx+row(A,4)[2]*.55:cx+row(A,4)[1]*.55;line(L,[[px-4,cy+6],[px+4,cy+6]],c[3],j);
  const t=L.piece(PAL.white);stamp(L,null,px-3,cy+3,['.w.w.','wwwww','wwwww'],{w:PAL.white[0]});light(L,t,{base:0,hi:0,lo:1,dark:1});};
 const festtagsjacke={slot:'body',name:'Festtagsjacke',
  armHinten(L,p){sleeve(L,p,p.armF,PAL.faWein,.9,2.2,true,{roll:false});},
  armVorn(L,p){sleeve(L,p,p.armN,PAL.faWein,.9,2.2,false,{roll:false});},rumpf:jackeRumpf};
 /** Boxenträger-Schultern: schwarze Lautsprecherboxen als Polster, Membran nach außen, Schrauben. */
 function schulterbox(L,p,arm,far){const A=p.A,s=arm[0],R0=A.armR[0],c=PAL.black,b=far?2:1,dx=far?1:-1,cx=s[0]+dx*1.2,cy=s[1]+1,rx=R0+4.4,ry=R0+3.2;
  const m=L.piece(c);ell(L,cx,cy,rx,ry,c[b],null,dx*.2);light(L,m,{base:b,hi:b-1,lo:b+1,dark:2,share:.34});
  const mx=cx+dx*1.5,my=cy+1;ell(L,mx,my,rx*.62,ry*.64,PAL.metal[3],m,dx*.2);ell(L,mx,my,rx*.48,ry*.5,c[3],m,dx*.2);ell(L,mx-.5,my-.5,rx*.2,ry*.22,PAL.metal[2],m);on(L,m,mx-1.5,my-1.5,PAL.metal[0]);
  for(const [ax,ay] of [[-.78,-.62],[.78,-.62],[-.78,.62],[.78,.62]])on(L,m,cx+ax*rx*.86,cy+ay*ry*.86,PAL.metal[1]);
  line(L,[[cx-rx*.7,cy-ry*.72],[cx+rx*.2,cy-ry*.95]],c[0],m);}
 /** Kronkorkenkette: Schnur mit bunten Kronkorken, großer roter Korken als Anhänger; hinten kurzer Bogen im Nacken. */
 function kronkorkenkette(L,p){const [cx,cy]=[p.C[0]+1,p.C[1]-10],cols=[PAL.gold,PAL.red,PAL.metal,PAL.blue];
  if(p.back){for(let k=0;k<6;k++){const x=cx-8+k*3.2,y=cy-5+Math.abs(k-2.5)*.5;cap(L,x,y,cols[k%4],1.7);}return;}
  const k=L.piece(PAL.black,1);const pts=[];for(let i=0;i<=16;i++){const a=Math.PI*(.08+.84*i/16);pts.push([cx-Math.cos(a)*13.5,cy+Math.sin(a)*15]);}line(L,pts,PAL.black[2]);
  for(let i=1;i<16;i+=2){const a=Math.PI*(.08+.84*i/16);cap(L,cx-Math.cos(a)*13.5,cy+Math.sin(a)*15,cols[(i>>1)%4],2.2);}
  cap(L,cx,cy+19,PAL.red,3.3);}
 /** Zapfhahn-Gürtel: Ledergürtel, Chromschnalle mit Zapfhahn (roter Hebel, Auslauf); hinten Schlaufen. */
 function zapfhahnguertel(L,p){const [cx,cy]=p.C,c=PAL.leather,b=L.piece(c);poly(L,torso(p,2.9,29,34),c[3]);light(L,b,{base:3,hi:2,lo:4,dark:1});
  if(p.back){for(const dx of [-14,-2,10]){L.piece(c);poly(L,[[cx+dx,cy+28],[cx+dx+2,cy+28],[cx+dx+2,cy+35],[cx+dx,cy+35]],c[2]);}return;}
  for(const dx of [-16,-12,-8])on(L,b,cx+dx,cy+31.5,c[4]);
  const t=L.piece(c);poly(L,[[cx-9,cy+30],[cx-2,cy+30],[cx-2,cy+33],[cx-8,cy+33]],c[2]);light(L,t,{base:2,hi:1,lo:3,dark:1});
  const m=L.piece(PAL.metal);poly(L,[[cx-2,cy+28.5],[cx+6,cy+28.5],[cx+6,cy+35],[cx-2,cy+35]],PAL.metal[1]);light(L,m,{base:1,hi:0,lo:2,dark:1});
  const sp=L.piece(PAL.metal);limb(L,[[cx+2,cy+34],[cx+2,cy+38.5]],[1.4,1.1],PAL.metal[2]);light(L,sp,{base:2,hi:1,lo:3,dark:1});
  const h=L.piece(PAL.black);limb(L,[[cx+2,cy+29],[cx+2.5,cy+22.5]],[1.2,1.8],PAL.black[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});
  const k=L.piece(PAL.red);ell(L,cx+2.6,cy+21.5,2.2,2,PAL.red[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});}
 /** Kabelbinder-Manschetten: schwarzes Band am Unterarm, drei bunte Kabelbinder. */
 function manschette(L,p,arm,far){const A=p.A,b=far?3:2,t0=.7,t1=.95,pts=seg(arm,t0,t1),rs=segR(A.armR,t0,t1).map(r=>r+1.7);
  const m=L.piece(PAL.black);limb(L,pts,rs,PAL.black[b]);light(L,m,{base:b,hi:b-1,lo:b+1,dark:1});
  const a=pts[0],z=pts[pts.length-1],u=unit(a,z),n=[-u[1],u[0]];
  [PAL.tieR,PAL.tieY,PAL.tieB].forEach((tc,k)=>{const t=.2+k*.3,q=lerp(a,z,t),w=rs[0]+(rs[rs.length-1]-rs[0])*t+.2;tie(L,m,q,n,w,tc,k===1?(far?1:-1):0);});}
 /** Grillhandschuhe: Fäustling mit Steppnähten und Daumen, ausgestellte schwarze Stulpe. */
 function handschuh(L,p,arm,far){const c=PAL.faMitt,b=far?2:1,A=p.A,r=K.HW,{w,u,n}=handGeo(arm),side=far?-1:1;
  const cf=L.piece(PAL.black);limb(L,[seg(arm,.84,.84)[0],[w[0]+u[0]*1.2,w[1]+u[1]*1.2]],[A.armR[2]+1.4,A.armR[2]+3.2],PAL.black[b+1]);light(L,cf,{base:b+1,hi:b,lo:b+2,dark:1});
  const c0=[w[0]+u[0]*(r+.4),w[1]+u[1]*(r+.4)],ang=Math.atan2(u[1],u[0])-Math.PI/2,at=(a,k)=>[c0[0]+u[0]*a+n[0]*k,c0[1]+u[1]*a+n[1]*k];
  const h=L.piece(c);ell(L,c0[0],c0[1],r*1.1+.7,r*1.08+.9,c[b],null,ang);const fq=at(r*.85,side*.5);ell(L,fq[0],fq[1],r+.6,r*.92+.5,c[b],null,ang);light(L,h,{base:b,hi:b-1,lo:b+1,dark:2});
  for(const k of [-r*.4,r*.35])line(L,[at(r*.2,k),at(r*1.5,k)],c[b+1],h);
  const t=L.piece(c);const th=at(r*.1,-side*(r*.95+.6));ell(L,th[0],th[1],2.4,r*.62+1.4,c[Math.max(0,b-1)],null,ang+side*.3);light(L,t,{base:Math.max(0,b-1),hi:Math.max(0,b-1),lo:b,dark:1});
  const rim=L.piece(PAL.white);limb(L,[at(-r*1.1,-(A.armR[2]+3)),at(-r*1.1,A.armR[2]+3)],[1,1],PAL.white[far?2:1]);light(L,rim,{base:far?2:1,hi:far?1:0,lo:far?3:2,dark:1});}
 /** Handschuh-Faust über der Schildfaust: von vorn (ohne Seitentausch) hält die ferne Hand den Schild im vorderen Band,
  *  handOver malt dort Haut. Die Laufzeit (paperdollSources) legt diese Quelle nur zu Handschuh + Schild dazu. */
 function handschuhFaust(L,p){if(p.swap)return;const [cx,cy]=handPos(p.armF),c=PAL.faMitt,r=K.HW,h=L.piece(c);
  ell(L,cx,cy,r+.9,r*.9+.9,c[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});line(L,[[cx-r*.6,cy-.5],[cx+r*.6,cy-.5]],c[3],h);line(L,[[cx-r*.5,cy+1.5],[cx+r*.5,cy+1.5]],c[2],h);}
 /** Maifeldtreter: knöchelhoher Nubuk-Arbeitsstiefel mit Polsterkragen, Schnürung, Zehenkappe. */
 function treter(L,p,leg,toe,far){const c=PAL.faNubuk,b=far?2:1,to=.8,s=L.ramps.length;boot(L,p,leg,toe,c,to,far,'treter');
  const sh=seg(leg,to,1),top=sh[0],a=leg[2],u=unit(top,a),ang=Math.atan2(u[1],u[0])-Math.PI/2,rr=segR(p.A.legR,to,to+.02)[0]+1.4;
  const k=L.piece(PAL.leather);ell(L,top[0],top[1]+1,rr+.7,2.6,PAL.leather[b],null,ang);light(L,k,{base:b,hi:b-1,lo:b+1,dark:1});
  const fx=p.back?-1:1;
  if(!p.back)for(let i=0;i<3;i++){const q=lerp(top,a,.25+i*.24);line(L,[[q[0]+fx*1-2,q[1]-1],[q[0]+fx*1+2,q[1]+1]],PAL.label[0],s);line(L,[[q[0]+fx*1-2,q[1]+1],[q[0]+fx*1+2,q[1]-1]],PAL.label[1],s);}
  else{const q=lerp(top,a,.3);line(L,[[q[0]-1,q[1]-2],[q[0]-1,q[1]+3]],c[3],s);}
  line(L,[[toe[0]-3*fx,toe[1]-1],[toe[0]-1*fx,toe[1]+3]],c[3],s);}

 // ---------- Ringe (Glanzpunkt an der Hand) ----------
 /** Ring: breites Band quer über den Fingern (auch über der Faust), heller Glanz, Stein; dunkle Kante kommt aus edges(). */
 function ringAt(L,arm,far,ramp,stone){const [x,y]=handPos(arm),{u,n}=handGeo(arm),side=far?-1:1,q=[x+u[0]*1.8+n[0]*side*1.2,y+u[1]*1.8+n[1]*side*1.2];
  const r=L.piece(ramp);ell(L,q[0],q[1],3.4,1.9,ramp[1],null,Math.atan2(n[1],n[0]));light(L,r,{base:1,hi:0,lo:2,dark:1});on(L,r,q[0]-2,q[1]-1,[255,255,244]);on(L,r,q[0]-1,q[1]-1,ramp[0]);
  if(stone){const s=L.piece(stone);ell(L,q[0]+1,q[1]-.6,1.7,1.5,stone[1]);on(L,s,q[0]+.5,q[1]-1.2,stone[0]);}}

 // ---------- Talismane und Glücksbringer ----------
 function keilerzahn(L,p){const [cx,cy]=p.C,to=[cx+1,cy+1];cord(L,p,to,PAL.leather);if(p.back)return;
  // Hauer: dicke Wurzel oben (bräunlich), weiter Bogen nach außen, spitze Spitze mit Kerbe
  const z=L.piece(PAL.faZahn);limb(L,[[cx,cy+2],[cx-4.5,cy+7],[cx-5,cy+13],[cx-1.5,cy+18],[cx+4,cy+19.5]],[3.3,3.1,2.5,1.6,.5],PAL.faZahn[1]);light(L,z,{base:1,hi:0,lo:2,dark:1});
  line(L,[[cx-3.5,cy+6],[cx-4,cy+12],[cx-2,cy+15]],PAL.faZahn[0],z);on(L,z,cx+2.5,cy+19,PAL.faZahn[3]);on(L,z,cx+2.5,cy+18,PAL.faZahn[3]);// Glanz, Kerbe
  ell(L,cx-.5,cy+3,2.6,2,PAL.faZahn[3],z);
  const w=L.piece(PAL.leather);limb(L,[[cx-3,cy+2],[cx+2.5,cy+2.5]],[1.5,1.5],PAL.leather[2]);light(L,w,{base:2,hi:1,lo:3,dark:1});line(L,[[cx-2.5,cy+4.5],[cx+1.5,cy+5]],PAL.leather[3],z);}
 function kabeltalisman(L,p){const [cx,cy]=p.C,m=[cx+1,cy+9];cord(L,p,[m[0],m[1]-6],PAL.black);if(p.back)return;
  const cols=[PAL.tieR,PAL.tieY,PAL.tieB,PAL.tieW,PAL.tieR,PAL.tieY];
  cols.forEach((tc,i)=>{const a=i/6*Math.PI*2+.3,e=[m[0]+Math.cos(a)*9,m[1]+Math.sin(a)*8.5];const t=L.piece(tc);limb(L,[m,e],[1.5,1.1],tc[0]);
   line(L,[[m[0]+Math.cos(a)*3,m[1]+Math.sin(a)*3+1],[e[0],e[1]+1]],tc[1],t);});
  for(const i of [1,3,5]){const a=i/6*Math.PI*2+.3;cap(L,m[0]+Math.cos(a)*9,m[1]+Math.sin(a)*8.5,i===3?PAL.red:PAL.metal,1.8);}
  const c=cap(L,m[0],m[1],PAL.gold,3.6);ell(L,m[0]+.3,m[1]+.3,1.4,1.2,PAL.red[1],c);}
 function blechtalisman(L,p){const [cx,cy]=p.C,m=[cx+1,cy+12],t=PAL.tin;cord(L,p,[m[0],m[1]-6.5],PAL.leather);if(p.back)return;
  const br=L.piece(PAL.hairBlack,1);for(let i=0;i<11;i++){const a=Math.PI*(.05+.9*i/10),e=[m[0]+Math.cos(a)*10,m[1]+Math.sin(a)*9.5];line(L,[[m[0]+Math.cos(a)*6,m[1]+Math.sin(a)*6],e],PAL.hairBlack[i%2?3:2]);}
  const d=L.piece(t);ell(L,m[0],m[1],6.6,6.4,t[1]);light(L,d,{base:1,hi:0,lo:2,dark:2});
  for(let i=0;i<9;i++){const xx=m[0]-5+hs(i,4)*10,yy=m[1]-5+hs(4,i)*10;if(is(L,d,xx,yy)){on(L,d,xx,yy,t[i%3?2:0]);}}
  const z=L.piece(PAL.white);poly(L,[[m[0]-2,m[1]-2],[m[0]+3,m[1]-3],[m[0]+3.5,m[1]+1.5],[m[0]-1.5,m[1]+2.5]],PAL.white[1]);light(L,z,{base:1,hi:0,lo:2,dark:1});on(L,z,m[0],m[1]-1,PAL.ink[1]);on(L,z,m[0]+1,m[1]-1,PAL.ink[1]);line(L,[[m[0]-1,m[1]+1],[m[0]+2,m[1]]],PAL.black[2],z);}
 /** Clan-Andenken (Glücksbringer der Zufallsgegenstände): Lederband am Gürtel, orangene Clan-Scheibe mit Faust, Flaschenöffner. */
 function clanandenken(L,p){if(p.back)return;const [cx,cy]=p.C,s=lft(p),x=cx+(s>0?row(p.A,31)[2]:row(p.A,31)[1])*.5;
  const o=L.piece(PAL.metal);ell(L,x,cy+31.5,2,1.8,PAL.metal[1]);ell(L,x,cy+31.5,.8,.7,null,'del');
  const st=L.piece(PAL.leather);limb(L,[[x,cy+33],[x+s*.5,cy+38]],[1.1,1.1],PAL.leather[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});
  const op=L.piece(PAL.metal);limb(L,[[x-s*2,cy+33],[x-s*3.5,cy+40]],[1.2,1.5],PAL.metal[2]);light(L,op,{base:2,hi:1,lo:3,dark:1});ell(L,x-s*3.6,cy+40,.7,.9,null,'del');
  const d=L.piece(PAL.patch);ell(L,x+s*.5,cy+42,4.4,4.6,PAL.patch[1]);light(L,d,{base:1,hi:0,lo:2,dark:1});
  stamp(L,d,x+s*.5-2,cy+40,['.ww.','wwww','wwwk','.ww.'],{w:PAL.white[0],k:PAL.white[2]});}
 /** Horsts gelochte Hausordnung: mit Sicherheitsnadeln wie eine Startnummer auf die linke Bauchseite gesteckt. */
 function hausordnung(L,p){if(p.back)return;const [cx,cy]=p.C,A=p.A,s=lft(p),r=row(A,19),mx=cx+(s>0?Math.max(3,r[2]*.6):Math.min(-3,r[1]*.6)),my=cy+19,a=.12*s,
  P=(dx,dy)=>[mx+dx*Math.cos(a)-dy*Math.sin(a),my+dx*Math.sin(a)+dy*Math.cos(a)],w=A.belly?7:6,h=8;
  const z=L.piece(PAL.white);poly(L,[P(-w,-h),P(w,-h),P(w,h),P(-w,h)],PAL.white[1]);light(L,z,{base:1,hi:0,lo:2,dark:1,share:.2});
  for(const dy of [-4,4]){const q=P(-w+1.6,dy);on(L,z,q[0],q[1],PAL.black[3]);}
  const t=P(-w+3.5,-h+2.5),t2=P(w-1.5,-h+2.5);line(L,[t,t2],PAL.black[3],z);
  for(let i=0;i<4;i++)line(L,[P(-w+3.5,-h+5+i*2.2),P(w-1.5-(i%2)*2,-h+5+i*2.2)],PAL.white[3],z);
  const k=P(w-3,h-2.5);ell(L,k[0],k[1],2.2,2,PAL.ink[1],z);ell(L,k[0],k[1],1,1,PAL.white[1],z);
  for(const dx of [-w+1,w-1]){const q=P(dx,-h-.5);L.piece(PAL.metal,1);line(L,[[q[0]-1,q[1]],[q[0]+1.5,q[1]]],PAL.metal[1]);}}
 /** Der nie leere Schnorrerbecher: klarer Mehrwegbecher voll Bier mit Schaumkrone, Pfandaufkleber, Karabiner am Gürtel (rechts am Träger). */
 function schnorrerbecher(L,p){if(p.back)return;const [cx,cy]=p.C,s=-lft(p),x=cx+(s>0?row(p.A,31)[2]:row(p.A,31)[1])*.55,y=cy+34;
  const kb=L.piece(PAL.metal);ell(L,x,y-2.5,1.8,2.4,PAL.metal[1]);ell(L,x,y-2.5,.7,1.2,null,'del');
  const c=L.piece(PAL.tube);poly(L,[[x-5.5,y],[x+5.5,y],[x+4,y+13],[x-4,y+13]],PAL.tube[1]);light(L,c,{base:1,hi:0,lo:2,dark:1});
  poly(L,[[x-4.6,y+3.5],[x+4.6,y+3.5],[x+3.6,y+12],[x-3.6,y+12]],PAL.faBier[1],c);line(L,[[x-3.8,y+4],[x-3,y+11]],PAL.faBier[0],c);line(L,[[x+3.5,y+5],[x+2.8,y+11]],PAL.faBier[2],c);
  poly(L,[[x-4.8,y+1],[x+4.8,y+1],[x+4.7,y+3.5],[x-4.7,y+3.5]],PAL.white[0],c);on(L,c,x+2,y+3,PAL.white[2]);
  const st=L.piece(PAL.can);ell(L,x+.5,y+8,1.8,1.8,PAL.can[1]);on(L,st,x,y+7,PAL.white[0]);on(L,st,x+1,y+9,PAL.white[0]);
  line(L,[[x-2,y+10],[x,y+12]],PAL.tube[0],c);}
 /** Greifarm des Pfandautomaten: verchromter Roboterarm quer auf dem Rücken (rechte Schulter), Riemen vorn quer über die Brust. */
 function greifarm(L,p,x0,y0,x1,y1){const m=PAL.metal,u=unit([x0,y0],[x1,y1]),n=[-u[1],u[0]],j=lerp([x0,y0],[x1,y1],.52);
  const bs=L.piece(PAL.black);ell(L,x0,y0,4,3.4,PAL.black[2]);light(L,bs,{base:2,hi:1,lo:3,dark:1});
  const a=L.piece(m);limb(L,[[x0,y0],j,[x1,y1]],[2.6,2.3,2],m[2]);light(L,a,{base:2,hi:1,lo:3,dark:1});
  const g=L.piece(m);ell(L,j[0],j[1],3,3,m[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});const led=L.piece(PAL.red);ell(L,j[0]+.5,j[1]+.5,1.1,1.1,PAL.red[0]);on(L,led,j[0],j[1],[255,230,220]);
  // Greifer wie im Greifautomaten: zwei gebogene Außenzinken, gerade Mittelzinke, dunkle Spitzen; Nabe mit Glanz
  const at=(a,k)=>[x1+u[0]*a+n[0]*k,y1+u[1]*a+n[1]*k];
  const c=L.piece(m);for(const k of [-1,1])limb(L,[at(1,k*2.5),at(4.5,k*6.5),at(9,k*6.2),at(12.5,k*2.2)],[1.7,1.6,1.3,.8],m[k<0?1:2]);light(L,c,{base:2,hi:1,lo:3,dark:1});
  const mz=L.piece(m);limb(L,[at(1,0),at(11.5,0)],[1.5,.9],m[1]);light(L,mz,{base:1,hi:0,lo:2,dark:1});
  for(const k of [-1,1]){const t=at(12.5,k*2.2);on(L,c,t[0],t[1],PAL.black[3]);}{const t=at(11.5,0);on(L,mz,t[0],t[1],PAL.black[3]);}
  const h=L.piece(m);ell(L,x1,y1,4.4,3.4,m[1],null,Math.atan2(n[1],n[0]));light(L,h,{base:1,hi:0,lo:2,dark:1});on(L,h,x1-1,y1-1,[255,255,255]);}
 const automatenarm={slot:'charm',name:'Greifarm des Pfandautomaten',
  haarHinten(L,p){if(p.back)return;const [cx,cy]=p.C,s=-lft(p),sx=cx+(s<0?p.A.sh[0]:p.A.sh[1]);greifarm(L,p,sx-s*2,cy-2,sx+s*3,cy-26);},
  rumpf(L,p){const [cx,cy]=p.C,A=p.A,s=-lft(p);
   if(p.back)return;
   const a=[s<0?cx+A.sh[0]+5:cx+A.sh[1]-4,cy-13],b=[s<0?cx+row(A,38)[2]:cx+row(A,38)[1],cy+40];
   const st=L.piece(PAL.black);limb(L,[a,b],[1.5,1.5],PAL.black[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});
   const q=lerp(a,b,.3),bk=L.piece(PAL.metal);poly(L,[[q[0]-2,q[1]-2],[q[0]+2,q[1]-2],[q[0]+2,q[1]+2],[q[0]-2,q[1]+2]],PAL.metal[1]);light(L,bk,{base:1,hi:0,lo:2,dark:1});},
  // von hinten im vordersten Band (liegt auf Rücken und Kopfseite); Rumpfneigung der Aktionsposen selbst anwenden (leanT gilt dort nicht)
  armVorn(L,p){if(!p.back)return;const [cx,cy]=p.C,A=p.A,s=-lft(p),a=[s<0?cx+row(A,38)[2]-3:cx+row(A,38)[1]+3,cy+36],sx=s<0?cx+A.sh[0]+4:cx+A.sh[1]-2;
   if(p.lean){const k=p.lean,Py=p.P[1];L.T=([x,y])=>[x+k*(Py-y),y];}
   try{const st=L.piece(PAL.black);limb(L,[[sx,cy-12],a],[1.6,1.6],PAL.black[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});
    greifarm(L,p,a[0],a[1],sx+s*3,cy-24);}finally{L.T=null;}}};

 // ---------- Waffenkammer 2026-09-25 (Vorlage: 64-px-Symbole in _prototypen/waffen-2026-09-25/ids) ----------
 // Zeichenrahmen wie alle Waffen: Griffpunkt = handPos, Waffenachse +y (hängend nach unten, im Hieb geschwungen), Kopf am Achsenende.
 // Koordinaten relativ zum Griffpunkt über P(dx,dy). Kräftige Köpfe, damit die Waffe in Weltgröße (0,3–0,6) erkennbar bleibt; hängend
 // höchstens ~45 px unter der Hand (Boden). Seitliche Merkmale (Maul, Zapfhahn) liegen auf der Außenseite der Hand (o: nahe Hand links im
 // Bild, ferne Hand rechts; die Nebenhand-Fassung nh hält die Waffe in der anderen Hand). Fernwaffen: Oberseite f über oben(p).
 const outer=(p,nh)=>p.swap!==!!nh?1:-1;
 const rel=(hx,hy,sx=1,k=1)=>(dx,dy)=>[hx+dx*sx*k,hy+dy*k];
 /** Fernwaffen: Seite der Oberseite. Aktionsbilder oben beim Zielen (+x von vorn, −x von hinten); Stand/Laufen nach außen, sonst läge das Gehäuse
  *  in nw/sw hinter Bein und Rumpf (Sichtbarkeitsprüfung der fernen Hand). */
 const oben=p=>p.sided?(p.back?-1:1):outer(p,false);
 /** Klempner-Rohrzange: roter Gummi-Tauchgriff in der Faust, Stahl-Doppel-T-Griff, Messing-Rändelmutter, Hakenbacke mit Zähnen, Maul nach außen. */
 function rohrzange(L,p,nh){const [hx,hy]=handPos(p.armN),z=PAL.wfZange,m=PAL.metal,r=PAL.faMitt,P=rel(hx,hy,outer(p,nh));
  const g=L.piece(r);limb(L,[P(0,-11),P(0,6)],[3.3,3.5],r[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});on(L,g,...P(0,-10),r[3]);// Aufhängeloch
  const s=L.piece(m);limb(L,[P(0,6),P(0,17)],[2.6,2.9],m[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});line(L,[P(0,7),P(0,16)],m[0],s);// Doppel-T: heller Steg
  const sh=L.piece(z);limb(L,[P(-3.8,13),P(-3.8,31)],[2.3,2.3],z[2]);light(L,sh,{base:2,hi:1,lo:3,dark:1});// Schaft der Hakenbacke
  const n=L.piece(PAL.gold);poly(L,[P(-6.2,15.5),P(5.6,15.5),P(5.6,21.5),P(-6.2,21.5)],PAL.gold[1]);light(L,n,{base:1,hi:0,lo:2,dark:1});
  for(const dx of [-3,.5,3.5])line(L,[P(dx,16.2),P(dx,20.8)],PAL.gold[3],n);// Rändelung
  const lo=L.piece(z);poly(L,[P(-6,21.5),P(10,21.5),P(10.6,26),P(-6,26)],z[1]);light(L,lo,{base:1,hi:0,lo:2,dark:1});
  const up=L.piece(z);poly(L,[P(-7.8,30),P(11.6,30),P(12.6,35),P(10,41),P(-4,41),P(-8.2,37)],z[1]);light(L,up,{base:1,hi:0,lo:2,dark:2,share:.3});
  for(let i=0;i<4;i++){const dx=9.4-i*2.6;on(L,lo,...P(dx,25.4),PAL.white[1]);on(L,up,...P(dx,30.6),PAL.white[1]);}// Zähne an beiden Backen
  handOver(L,p.armN);}
 /** Fasskeule: Holzstiel mit Griffband und Knauf, Kopf = kleines Bierfass (Dauben, zwei Eisenreifen, Boden) mit Messing-Zapfhahn und Porzellangriff. */
 function fasskeule(L,p,nh){const [hx,hy]=handPos(p.armN),w=PAL.wood,k=PAL.wfKugel,P=rel(hx,hy,outer(p,nh));
  const s=L.piece(w);limb(L,[P(0,-9),P(0,13)],[2.7,3],w[2]);light(L,s,{base:2,hi:1,lo:3,dark:1});
  const kn=L.piece(w);ell(L,...P(0,-10.5),3.9,3.2,w[2]);light(L,kn,{base:2,hi:1,lo:3,dark:1});// Knauf
  for(const yy of [-7.5,6])line(L,[P(-2.9,yy),P(2.9,yy+1)],PAL.black[2],s);// Griffband
  const b=L.piece(w);poly(L,[P(-8,11),P(-10,16.5),P(-10.6,24),P(-10,31.5),P(-8,37),P(8,37),P(10,31.5),P(10.6,24),P(10,16.5),P(8,11)],w[1]);
  light(L,b,{base:1,hi:0,lo:2,dark:2,share:.3});for(const dx of [-4.5,0,4.5])line(L,[P(dx*.8,12),P(dx,24),P(dx*.8,36)],w[3],b);// Daubenfugen
  for(const yy of [15.5,32.5]){const h=L.piece(k);poly(L,[P(-10.2,yy-1.4),P(10.2,yy-1.4),P(10.2,yy+1.4),P(-10.2,yy+1.4)],k[2]);light(L,h,{base:2,hi:1,lo:3,dark:1});}
  const d=L.piece(PAL.leather);ell(L,...P(0,37.3),8.2,2.8,PAL.leather[2]);light(L,d,{base:2,hi:1,lo:3,dark:1});ell(L,...P(.4,37.6),5,1.3,PAL.leather[1],d);// Boden
  const t=L.piece(PAL.gold);poly(L,[P(9.5,21.5),P(15.5,21.5),P(15.5,26),P(9.5,26)],PAL.gold[1]);limb(L,[P(14.2,25.5),P(14.2,30.5)],[1.6,1.3],PAL.gold[1]);light(L,t,{base:1,hi:0,lo:2,dark:1});
  const pz=L.piece(PAL.white);limb(L,[P(12.8,21),P(12.8,14.5)],[1.5,2],PAL.white[0]);light(L,pz,{base:0,hi:0,lo:1,dark:1});// Porzellangriff
  handOver(L,p.armN);}
 /** Kronkorkenstern: Flaschenöffner als Griff, kurze Kette, Stachelkugel mit roten, goldenen und grünen Kronkorken. Die Kette hängt je nach
  *  Bild mehr oder weniger mit der Schwerkraft (Stand/Laufen/Rasten), im Treffer fliegt die Kugel entlang der Schlagachse. */
 const SCHWERE={stehen:.85,blinzeln:.85,laufen:.8,hieb:[.35,0,.2],hieb2:[.35,0,.2],getroffen:.6,parade:.5,parade2:.5,zaubern:.6,rasten:.9,sprint:.45,zielen:.8,schuss:.8};
 function kronkorkenstern(L,p){const [hx,hy]=handPos(p.armN),m=PAL.metal,k=PAL.wfKugel,P=rel(hx,hy);
  const fr=K.FRAMES[(p.fi??0)%500]||{anim:'stehen',i:0},sw=SCHWERE[fr.anim],kk=Array.isArray(sw)?sw[fr.i]:sw??.8;
  const a=Math.atan2(Math.sin(L.rot||0),Math.cos(L.rot||0)),th=Math.max(-1.9,Math.min(1.9,kk*a)),d=[Math.sin(th),Math.cos(th)];// Schwerkraft im Waffenrahmen = (sin a, cos a)
  const g=L.piece(m);poly(L,[P(-3.4,-11),P(3.4,-11),P(3.6,6),P(-3.6,6)],m[1]);ell(L,...P(0,9),4.8,4.2,m[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});
  ell(L,...P(0,-8.2),1.5,1.5,null,'del');ell(L,...P(0,8.8),2.4,1.6,null,'del');// Loch am Ende, Öffnermaul
  const c0=P(0,13.5),R0=8.3,cc=[c0[0]+d[0]*(10+R0),c0[1]+d[1]*(10+R0)];
  const ch=L.piece(m);for(let i=0;i<3;i++){const t=1+i*3.4;ell(L,c0[0]+d[0]*t,c0[1]+d[1]*t,i%2?1.3:2.3,2.9,m[i%2?2:1],null,-th);}light(L,ch,{base:1,hi:0,lo:2,dark:1});
  const sp=L.piece(m);for(let i=0;i<8;i++){const b=i*Math.PI/4+.2,u=[Math.cos(b),Math.sin(b)],v=[-u[1],u[0]],A=(r,q)=>[cc[0]+u[0]*r+v[0]*q,cc[1]+u[1]*r+v[1]*q];poly(L,[A(6.2,2.6),A(13.4,0),A(6.2,-2.6)],m[2]);}
  light(L,sp,{base:2,hi:1,lo:3,dark:1});
  const bl=L.piece(k);ell(L,cc[0],cc[1],R0,R0,k[2]);light(L,bl,{base:2,hi:1,lo:3,dark:2,share:.34});
  for(const [dx,dy,col] of [[-3.3,-2.3,PAL.red],[3.5,-1.3,PAL.gold],[.1,3.6,PAL.can]]){const x=cc[0]+dx,y=cc[1]+dy,c=L.piece(col);ell(L,x,y,2.9,2.7,col[1]);
   for(let t=0;t<6.28;t+=.7)on(L,c,x+Math.cos(t)*2.4,y+Math.sin(t)*2.2,col[2]);on(L,c,x-1,y-1,col[0]);on(L,c,x,y-1,col[0]);}// Kronkorken mit Zackenrand
  handOver(L,p.armN);}
 /** Gartenzwerg am Besenstiel (Zweihand) als gedrungener Keulenkopf, breiter als hoch: kurze rote Zipfelmütze mit seitlich geknickter Spitze,
  *  breites Gesicht als hellste Fläche (dicke runde Nase, rosa Backen, zwei Augenpunkte), breiter weißer Dreiecksbart, kurzer blauer
  *  Kittelbauch mit brauner Stiefelkante; von hinten Mütze, Bartränder links und rechts und Kittelrücken.
  *  In der Ruhe (Stand/Laufen) aufrecht wie ein Wanderstab, leicht nach außen gekippt, Zwerg oben; im Kampf die übliche Waffenachse.
  *  Zielen/Schuss (Nahkampfwaffen zeigt das Spiel dort nie) ebenfalls aufrecht – der lange Stab bliebe sonst weit vor der Figur (Hülle). */
 function gartenzwerg(L,p){const [hx,hy]=handPos(p.armN),w=PAL.wood,T0=L.T,r0=L.rot||0,gk=1.7,back=!!p.back;
  const an=(K.FRAMES[(p.fi??0)%500]||{}).anim;
  if(!p.sided||an==='zielen'||an==='schuss'){const ex=Math.PI+outer(p,false)*.32,co=Math.cos(ex),si=Math.sin(ex),Rt=([x,y])=>[hx+(x-hx)*co-(y-hy)*si,hy+(x-hx)*si+(y-hy)*co];L.T=T0?q=>T0(Rt(q)):Rt;L.rot=r0+ex;}
  // G(s,u): s quer (rechts im aufrecht gehaltenen Zwerg), u entlang des Zwergs (Stiefelsohle 0 → Mützenspitze 25,8), Maßstab gk; Stiel kurz (Kopf größer)
  try{const G=(s,u)=>[hx-s*gk,hy+22+u*gk],GP=pts=>pts.map(([s,u])=>G(s,u)),E=(s,u,rx,ry,c,clip=null)=>ell(L,...G(s,u),rx*gk,ry*gk,c,clip),c=PAL.faMitt,sk=PAL.wfHaut;
   const st=L.piece(w);limb(L,[[hx,hy-9],[hx,hy+24]],[2.3,2.5],w[2]);light(L,st,{base:2,hi:1,lo:3,dark:1});
   const bo=L.piece(PAL.boot);for(const s of [-3.9,3.9])E(s,1.3,3.7,2,PAL.boot[2]);light(L,bo,{base:2,hi:1,lo:3,dark:1});// Stiefelkante
   const bart=[[-8.4,12.4],[8.4,12.4],[7,8.6],[0,4.2],[-7,8.6]];// breiter Dreiecksbart
   if(back){const bt=L.piece(PAL.white);poly(L,GP([[-9.2,13.4],[9.2,13.4],[8.6,8.8],[0,6],[-8.6,8.8]]),PAL.white[1]);light(L,bt,{base:1,hi:0,lo:2,dark:1});}// von hinten: Bartränder neben Kittel und Mütze
   const kt=L.piece(PAL.blue);E(0,5.6,8.4,4.8,PAL.blue[1]);for(const s of [-8.2,8.2])E(s,6.6,2.4,2.9,PAL.blue[1]);light(L,kt,{base:1,hi:0,lo:2,dark:2});// Kittelbauch, Arme
   line(L,GP([[-8,2.9],[8,2.9]]),PAL.black[2],kt);if(!back){on(L,kt,...G(0,2.9),PAL.gold[1]);on(L,kt,...G(-.6,2.9),PAL.gold[1]);}// Gürtel, Schnalle
   if(back)line(L,GP([[0,3.4],[0,10.2]]),PAL.blue[2],kt);// Rückennaht
   else{const fa=L.piece(sk);E(0,14.8,7.4,3.9,sk[1]);light(L,fa,{base:1,hi:0,lo:2,dark:1,share:.22});// breites Gesicht: hellste Fläche
    for(const s of [-4.9,4.9])E(s,13.8,1.6,1.2,PAL.wfRosa[1],fa);// rosa Backen
    for(const s of [-2.8,2.8])E(s,16.1,.8,.9,PAL.lash,fa);// Augenpunkte
    const bt=L.piece(PAL.white);poly(L,GP(bart),PAL.white[1]);light(L,bt,{base:1,hi:0,lo:2,dark:1});
    const ns=L.piece(PAL.satin);E(0,13,2.6,2.3,PAL.satin[1]);light(L,ns,{base:1,hi:0,lo:2,dark:1});}// dicke runde Nase über dem Bart
   const top=[[7.2,20.6],[7.8,22.8],[10.6,24.4],[8.2,25.8],[3.4,24],[-3.8,21]],cap=back?[[-7.4,13.8],[7.4,13.8],...top]:[[-8.6,17.8],[8.6,17.8],...top];// kurze Zipfelmütze, Spitze zur Seite geknickt
   const mt=L.piece(c);poly(L,GP(cap),c[back?2:1]);light(L,mt,{base:back?2:1,hi:back?1:0,lo:back?3:2,dark:1});if(!back)line(L,GP([[-8.3,18.3],[8.3,18.3]]),c[2],mt);
  }finally{L.T=T0;L.rot=r0;}
  handOver(L,p.armN);}
 /** Edelstahl-Grillzange: Federöse, zwei Holzgriffe in der Faust, zwei Zangenarme, Bratwurst mit Grillstreifen zwischen den Greifschalen. */
 function grillzange(L,p){const [hx,hy]=handPos(p.armN),m=PAL.metal,w=PAL.wood,s=PAL.wfWurst,P=rel(hx,hy);
  const lp=L.piece(m);ell(L,...P(0,-11),3.2,2.5,m[2]);light(L,lp,{base:2,hi:1,lo:3,dark:1});ell(L,...P(0,-11),1.2,1,null,'del');// Federöse
  const g=L.piece(w);for(const dx of [-2.3,2.3])limb(L,[P(dx*.7,-9.5),P(dx,6)],[2,2.1],w[dx<0?1:2]);light(L,g,{base:1,hi:0,lo:2,dark:1});line(L,[P(0,-9),P(0,6)],w[3],g);
  const a=L.piece(m);limb(L,[P(2,6),P(6.6,33)],[1.6,1.6],m[1]);limb(L,[P(-2,6),P(-6.8,33)],[1.6,1.6],m[1]);light(L,a,{base:1,hi:0,lo:2,dark:1});
  const b=L.piece(s);limb(L,[P(-.5,17),P(.3,26.5),P(0,37)],[3.7,4.1,3.7],s[1]);light(L,b,{base:1,hi:0,lo:2,dark:1,share:.34});
  for(const yy of [21,25.5,30,34])line(L,[P(-3,yy),P(2.8,yy-2)],s[3],b);// Grillstreifen
  const tp=L.piece(m);for(const dx of [-6.5,6.3])ell(L,...P(dx,32.5),2.2,3.4,m[1]);light(L,tp,{base:1,hi:0,lo:2,dark:1});// Greifschalen
  handOver(L,p.armN);}
 /** Maßkrug-Schild: gläserner Maßkrug am Henkel gehalten, Front zum Betrachter – helle Glaswände, goldenes Bier mit Noppen, Schaumkrone;
  *  von hinten dunkler durchs Glas, der Henkel mit der Faust auf der Betrachterseite. */
 function masskrugschild(L,p){const [hx,hy]=handPos(p.armF),t=PAL.tube,b=PAL.faBier,wh=PAL.white,back=!!p.back,k=1.25,sh=back?1:0;
  const P=back?(dx,dy)=>[hx+1+dx*k,hy-2+dy*k]:(dx,dy)=>[hx+(dx-14.5)*k,hy+dy*k],E=(dx,dy,rx,ry,c,clip=null)=>ell(L,...P(dx,dy),rx*k,ry*k,c,clip);
  if(!back){const h=L.piece(t);limb(L,[P(8,-7),P(13.5,-6),P(14.5,0),P(13.5,6),P(8,7)],[2.3,2.3,2.4,2.3,2.3].map(r=>r*k),t[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});}// Henkel zur Faust
  const g=L.piece(t);poly(L,[P(-9.5,-11),P(9.5,-11),P(9.8,12),P(-9.8,12)],t[1+sh]);light(L,g,{base:1+sh,hi:sh,lo:2+sh,dark:1,share:.2});
  const be=L.piece(b);poly(L,[P(-7.6,-8.5),P(7.6,-8.5),P(7.8,8.8),P(-7.8,8.8)],b[1+sh]);light(L,be,{base:1+sh,hi:sh,lo:2,dark:1,share:.24});
  for(let r=0;r<5;r++)for(let q=0;q<4;q++){const x=-5.2+q*3.6+(r%2?1.8:0),y=-6+r*3.4;if(x<6.5){on(L,be,...P(x,y),b[sh]);on(L,be,...P(x+.8,y),b[sh]);}}// Noppen
  line(L,[P(-8.7,-9),P(-8.7,10.5)],t[sh],g);line(L,[P(8.7,-9),P(8.7,10.5)],t[2+sh],g);// Glanzkante links, Schatten rechts
  const f=L.piece(wh);for(const [dx,dy,r] of [[-7.4,-11.6,3.4],[-2.8,-13,3.8],[2.2,-12.8,3.6],[6.6,-11.6,3.4],[9.4,-10,2.2]])E(dx,dy,r,r*.85,wh[sh]);
  poly(L,[P(-9.6,-11.5),P(9.6,-11.5),P(9.6,-8.5),P(-9.6,-8.5)],wh[sh]);light(L,f,{base:sh,hi:0,lo:1+sh,dark:1,share:.24});
  if(back){const h=L.piece(t);limb(L,[P(0,-8),P(-.6,-4),P(-.6,4),P(0,8)],[2.2,2.4,2.4,2.2].map(r=>r*k),t[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});}
  handOver(L,p.armF);}
 /** Schorlenspritze: rosa Wasserpistole, grüne Weinflasche als Tank schräg oben drauf (Hals nach vorn oben, rote Kapsel), blaue Düse. */
 function schorlenspritze(L,p){const [hx,hy]=handPos(p.armN),f=oben(p),r=PAL.wfRosa,gl=PAL.glass,k=1.45,P=rel(hx,hy,f,k),E=(dx,dy,rx,ry,c,clip=null)=>ell(L,...P(dx,dy),rx*k,ry*k,c,clip),Lm=(pts,rs,c)=>limb(L,pts.map(q=>P(...q)),rs.map(v=>v*k),c);
  const bt=L.piece(gl);Lm([[11.5,-5],[14.8,3.5]],[3.3,3.3],gl[2]);Lm([[14.8,3.5],[17.6,9.5]],[1.7,1.3],gl[2]);light(L,bt,{base:2,hi:1,lo:3,dark:1});line(L,[P(10,-4),P(12.8,3)],gl[0],bt);
  const lb=L.piece(PAL.label);E(13.2,-.4,2.4,2.2,PAL.label[0]);light(L,lb,{base:0,hi:0,lo:1,dark:1});on(L,lb,...P(13.2,-.4),PAL.band[1]);on(L,lb,...P(14,.4),PAL.band[1]);// Etikett mit Trauben
  const kp=L.piece(PAL.red);E(17.9,10.3,1.6,1.5,PAL.red[1]);light(L,kp,{base:1,hi:0,lo:2,dark:1});
  const bd=L.piece(r);poly(L,[P(3,-7),P(9.4,-7),P(9.4,15),P(3.8,15)],r[1]);light(L,bd,{base:1,hi:0,lo:2,dark:1,share:.28});
  const gr=L.piece(r);Lm([[-3.5,-3.5],[4,-1]],[2.6,2.9],r[2]);light(L,gr,{base:2,hi:1,lo:3,dark:1});
  L.piece(r,1);line(L,[P(3,2.5),P(.2,4.5),P(.4,7.5),P(3,8.5)],r[3]);// Abzugsbügel
  const nz=L.piece(PAL.blue);Lm([[6.4,15],[6.4,21]],[1.7,1.2],PAL.blue[1]);E(10.3,11,1.4,1.3,PAL.blue[0]);light(L,nz,{base:1,hi:0,lo:2,dark:1});
  handOver(L,p.armN);}
 /** Blitzschrauber: orangefarbener Akkuschrauber (Lüftungsschlitze), dunkler Griff in der Faust, grüner Akku unten, Bohrfutter und Bohrer vorn. */
 function blitzschrauber(L,p){const [hx,hy]=handPos(p.armN),f=oben(p),o=PAL.wfOrange,sl=PAL.wfSchiefer,k=1.45,P=rel(hx,hy,f,k),E=(dx,dy,rx,ry,c,clip=null)=>ell(L,...P(dx,dy),rx*k,ry*k,c,clip),Lm=(pts,rs,c)=>limb(L,pts.map(q=>P(...q)),rs.map(v=>v*k),c);
  const ak=L.piece(PAL.rubber);poly(L,[P(-4.5,-5.5),P(-9.5,-5.5),P(-9.5,6),P(-4.5,6)],PAL.rubber[1]);light(L,ak,{base:1,hi:0,lo:2,dark:1});
  for(const yy of [-2.5,.5,3.5])line(L,[P(-5.5,yy),P(-8.5,yy)],PAL.rubber[3],ak);// Rillen
  const gr=L.piece(sl);Lm([[-4.5,-.5],[4,.8]],[2.8,3],sl[1]);light(L,gr,{base:1,hi:0,lo:2,dark:1});
  const bd=L.piece(o);poly(L,[P(4.5,-5),P(6.2,-7.5),P(10,-7.5),P(11.6,-5),P(11.6,9.5),P(3.6,9.5),P(3.6,-3)],o[1]);light(L,bd,{base:1,hi:0,lo:2,dark:1,share:.28});
  for(const yy of [-4.5,-2.5,-.5])line(L,[P(7.2,yy),P(10.2,yy)],o[4],bd);// Lüftungsschlitze
  const ab=L.piece(PAL.black);E(3,4.2,1.3,1.3,PAL.black[2]);light(L,ab,{base:2,hi:1,lo:3,dark:1});// Abzug
  const ch=L.piece(PAL.metal);Lm([[7.6,9.5],[7.6,14.5]],[3.2,1.9],PAL.metal[2]);light(L,ch,{base:2,hi:1,lo:3,dark:1});
  const bi=L.piece(PAL.metal,1);Lm([[7.6,14],[7.6,22.5]],[.7,.55],PAL.metal[1]);for(let yy=15;yy<22;yy+=2)on(L,bi,...P(7.6,yy),PAL.metal[3]);// Bohrer mit Wendel
  handOver(L,p.armN);}

 // ---------- Dorflegenden (Schloss Big B, 2026-09-26; Vorlage: Symbole assets/precision/runtime/items/<id>.png) ----------
 /** Kunstpelz: unregelmäßige kurze Fellstriche (dunkle Striche nach unten, einzelne helle Spitzen), Rauschen am Anker a (Rumpf: Brust,
  *  Ärmel: Schulter) – das Fell wandert mit dem Mantel statt mit der Leinwand. */
 function zottel(L,j,c,a){const b=L.bb[j];if(!b||b[2]<0)return;const ax=Math.round(a[0]),ay=Math.round(a[1]),set=[];
  for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(!L.is(j,x,y))continue;const k=hs(x-ax,y-ay);if(k>.945)set.push([x,y,3,c[3]]);else if(k<.03)set.push([x,y,2,c[0]]);}
  for(const [x,y,n,col] of set)for(let d=0;d<n;d++)L.on(j,x,y+d,col);}
 /** Pelzmantel des Barons, Ärmel: Kunstpelz bis kurz vor die Hand, breite Hermelinmanschette; über der nahen Schulter fällt der Kragen auf den Oberarm. */
 function pelzArm(L,p,arm,far){const c=PAL.lgNerz,h=PAL.lgHermelin,s=sleeve(L,p,arm,c,.86,3,far,{roll:false,cuff:h});zottel(L,s,c,arm[0]);
  if(far)return;// Kragen über der nahen Schulter: dieselbe Kragenform wie im Rumpf, auf den Oberarm beschnitten (Rumpfneigung mitgeführt)
  const A=p.A,[cx,cy]=p.C,sl=cx+A.sh[0]-1,sr=cx+A.sh[1]+1,mx=(sl+sr)/2,rx=(sr-sl)/2+3,[sx,sy]=arm[0],dx=p.lean?p.lean*(p.P[1]-(cy-6.5)):0,R=A.armR[0]+3.5,k=L.piece(h);
  ell(L,mx+dx,cy-6.5,rx+1,12.5,h[1]);const b=L.bb[k];for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++)if(L.is(k,x,y)&&Math.hypot(x+.5-sx,y+.5-sy-1)>R)L.del(x,y);
  if(L.bb[k][2]>=0)light(L,k,{base:1,hi:0,lo:2,dark:1});}
 /** Pelzmantel des Barons, Rumpf: knielanger Kunstpelz in Nerzbraun (Fellstriche), vorn offen mit violettem Futter, breiter Hermelinkragen über
  *  Schultern und Brust mit zipfeligem Rand und wenigen schwarzen Schwanzspitzen, Goldkette zwischen zwei Schließen, baumelnder Leihzettel;
  *  hinten Kragen über den Schultern und Mittelnaht. */
 function pelzRumpf(L,p){const c=PAL.lgNerz,h=PAL.lgHermelin,v=PAL.lgViolett,[cx,cy]=p.C,A=p.A,hem=p.ride?44:68;
  const j=L.piece(c);poly(L,torso(p,3.2,-14,hem,{flare:p.ride?2:5,sway:!p.ride,extend:p.ride?0:22}),c[1]);light(L,j,{base:1,hi:0,lo:2,dark:3});zottel(L,j,c,p.C);
  const sl=cx+A.sh[0]-1,sr=cx+A.sh[1]+1,mx=(sl+sr)/2,rx=(sr-sl)/2+3,nr=(A.neckR||[6.5,7.5])[1]+1.5;
  const tuft=(k,x,y)=>{on(L,k,x,y,PAL.black[3]);on(L,k,x,y+1,PAL.black[3]);};// Hermelin: schwarze Schwanzspitze
  if(p.back){line(L,[[cx+1,cy-6],[cx+1,cy+hem-2]],c[3],j);
   const k=L.piece(h);ell(L,mx,cy-9,rx+1,10,h[1]);for(const t of [-.8,-.45,0,.45,.8])ell(L,mx+t*rx,cy+.5-Math.abs(t)*3.5,3.2,2.6,h[1]);light(L,k,{base:1,hi:0,lo:2,dark:1});
   for(const [t,dy] of [[-.55,-9],[.1,-5],[.6,-10]])tuft(k,mx+t*rx,cy+dy);return;}
  const f=L.piece(v);poly(L,[[cx-1.5,cy+1],[cx+4,cy+1],[cx+7,cy+hem-1],[cx-4.5,cy+hem-1]],v[2]);light(L,f,{base:2,hi:1,lo:3,dark:1});// Futter im offenen Mantel
  L.piece(c,1);line(L,[[cx-2,cy+2],[cx-5,cy+hem-1]],c[0]);line(L,[[cx+5,cy+2],[cx+8,cy+hem-1]],c[3]);// Kanten der Mantelhälften
  const k=L.piece(h);ell(L,mx,cy-6.5,rx+1,12.5,h[1]);for(const t of [-.85,-.55,-.25,.25,.55,.85])ell(L,mx+t*rx,cy+5.5-Math.abs(t)*4.5,3.4,2.8,h[1]);// Schalkragen mit zipfeligem Rand
  poly(L,[[cx-nr+2.5,cy-21],[cx+nr+.5,cy-21],[cx+2.2,cy+1],[cx+.4,cy+1]],null,'del');light(L,k,{base:1,hi:0,lo:2,dark:1});// Halsausschnitt
  for(const [t,dy] of [[-.65,-6],[-.35,3],[.6,-7],[.4,4]])tuft(k,mx+t*rx,cy+dy);
  const ch=L.piece(PAL.gold,1);line(L,[[cx-6,cy+4],[cx+1,cy+7],[cx+8,cy+4]],PAL.gold[1]);line(L,[[cx-6,cy+5],[cx+1,cy+8],[cx+8,cy+5]],PAL.gold[3]);// Goldkette
  for(const x of [cx-6,cx+8]){const s=L.piece(PAL.gold);ell(L,x,cy+4.5,2.1,1.9,PAL.gold[1]);light(L,s,{base:1,hi:0,lo:2,dark:1});}
  L.piece(PAL.label,1);line(L,[[cx+1,cy+8],[cx+2,cy+16]],PAL.label[2]);const z=L.piece(PAL.label);poly(L,[[cx-1,cy+16],[cx+5,cy+16],[cx+5,cy+23],[cx-1,cy+23]],PAL.label[0]);light(L,z,{base:0,hi:0,lo:1,dark:1});
  for(const yy of [18.5,20.5])line(L,[[cx,cy+yy],[cx+4,cy+yy]],PAL.label[2],z);}// Leihzettel vom Kostümverleih
 /** Hochglanz-Exposé als Schild: lachsrosa Hochglanzmappe mit blauem Reiter, Burgfoto (Himmel, graue Burg, rote Turmspitzen), diagonaler
  *  Glanzstreif, Kugelschreiber an der Kette; von hinten die Mappenrückseite mit Aufkleber, die Faust vorn. */
 function expose(L,p){const [hx,hy]=handPos(p.armF),c=PAL.lgLachs,back=!!p.back,cx=back?hx+1:hx-10,cy=back?hy-3:hy-9,a=back?.06:-.08,
  P=(dx,dy)=>[cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)];
  if(back){const m=L.piece(c);poly(L,[P(-11.5,-14.5),P(11.5,-14.5),P(11.5,14.5),P(-11.5,14.5)],c[2]);light(L,m,{base:2,hi:1,lo:3,dark:2,share:.24});
   line(L,[P(-10.5,-13.5),P(-10.5,13.5)],c[3],m);poly(L,[P(3,6),P(9,6),P(9,11),P(3,11)],PAL.white[1],m);line(L,[P(4,8),P(8,8)],PAL.white[3],m);
   handOver(L,p.armF);return;}
  const tb=L.piece(PAL.blue);poly(L,[P(-11.5,-17.5),P(-2.5,-17.5),P(-1.5,-14),P(-11.5,-14)],PAL.blue[0]);light(L,tb,{base:0,hi:0,lo:1,dark:1});// Reiter
  const m=L.piece(c);poly(L,[P(-12,-15),P(12,-15),P(12,15),P(-12,15)],c[1]);light(L,m,{base:1,hi:0,lo:2,dark:2,share:.24});
  poly(L,[P(-9,-12),P(9,-12),P(9,2),P(-9,2)],PAL.white[1],m);poly(L,[P(-7.8,-10.8),P(7.8,-10.8),P(7.8,.8),P(-7.8,.8)],PAL.lgHimmel[1],m);// Foto mit weißem Rand
  line(L,[P(-7.6,-10.6),P(7.6,-10.6)],PAL.lgHimmel[0],m);
  poly(L,[P(-5.8,.8),P(5.8,.8),P(5.8,-3.8),P(-5.8,-3.8)],PAL.tin[1],m);// Burg
  for(const [x0,x1,y0] of [[-5.8,-3.2,-6.2],[-1.4,1.4,-7.6],[3.2,5.8,-6.2]]){poly(L,[P(x0,-3.6),P(x1,-3.6),P(x1,y0),P(x0,y0)],PAL.tin[1],m);poly(L,[P(x0-.4,y0),P(x1+.4,y0),P((x0+x1)/2,y0-3.4)],PAL.red[1],m);}
  line(L,[P(-.8,.6),P(-.8,-1.6),P(.8,-1.6),P(.8,.6)],PAL.tin[3],m);// Tor
  poly(L,[P(-12,9.5),P(-12,13.5),P(12,3.5),P(12,-.5)],c[0],m);line(L,[P(-12,11.5),P(12,1.5)],PAL.white[0],m);// diagonaler Glanzstreif
  L.piece(PAL.gold,1);for(let k=0;k<7;k++){const q=P(12.6+(k%2)*.6,-12+k*2.3);L.px(...q.map(Math.floor),PAL.gold[k%2?3:1]);}// Kette
  const pen=L.piece(PAL.gold);limb(L,[P(13.4,3.5),P(13.9,14)],[1.2,1],PAL.gold[1]);light(L,pen,{base:1,hi:0,lo:2,dark:1});on(L,pen,...P(13.9,14.5),PAL.black[3]);// Kugelschreiber
  handOver(L,p.armF);}
 /** Korkenzieher des Kellermeisters: aufgeklapptes Kellnermesser – Rebholzgriff mit Knoten und Nieten, Metallkappe am Knauf, Spindel seitlich
  *  aus der Griffmitte, kleine Klinge im V an der Spitze (mit Weinstein); beides zur Außenseite der Hand. Die Faust hält das Griffende,
  *  damit das Rebholz sichtbar bleibt. */
 function korkenzieher(L,p,nh){const [hx,hy]=handPos(p.armN),m=PAL.metal,w=PAL.lgReb,k=1.35,P=rel(hx,hy,outer(p,nh),k),E=(dx,dy,rx,ry,c,clip=null)=>ell(L,...P(dx,dy),rx*k,ry*k,c,clip),Lm=(pts,rs,c)=>limb(L,pts,rs.map(v=>v*k),c);
  const ec=L.piece(m);poly(L,[P(-3.6,-6.5),P(3.6,-6.5),P(3.8,-2.5),P(-3.8,-2.5)],m[2]);light(L,ec,{base:2,hi:1,lo:3,dark:1});// Endkappe
  const g=L.piece(w);Lm([P(0,-3),P(.5,7),P(0,17)],[3.2,3.5,3.2],w[1]);light(L,g,{base:1,hi:0,lo:2,dark:1});
  for(const [dx,dy] of [[-1.3,4],[1.4,12.5]])E(dx,dy,1.2,1.5,w[3],g);for(const dy of [1,15])on(L,g,...P(0,dy),m[1]);// Knoten, Nieten
  const sp=L.piece(m);Lm([P(2.6,10),P(5.6,10)],[1.5,1.5],m[2]);const zz=[];for(let i=0;i<=7;i++)zz.push(P(5.6+i*2,10+(i%2?2.8:-2.8)));Lm(zz,zz.map(()=>1.35),m[1]);light(L,sp,{base:1,hi:0,lo:2,dark:1});// Spindel
  const bl=L.piece(m);poly(L,[P(-1.6,16.8),P(2.4,16.8),P(11.6,27.4),P(9,29.4)],m[1]);light(L,bl,{base:1,hi:0,lo:2,dark:1});line(L,[P(2,17.6),P(11,27.2)],m[0],bl);// Klinge mit heller Schneide
  on(L,bl,...P(5.2,22),PAL.lgViolett[2]);on(L,bl,...P(6.4,23.3),PAL.lgViolett[3]);// Weinstein
  const hg=L.piece(m);E(.4,17.2,2.2,2,m[2]);light(L,hg,{base:2,hi:1,lo:3,dark:1});// Gelenk
  handOver(L,p.armN);}
 /** Ringlicht der Reichweite: kleines Ringlicht mit Handyklemme am Gürtel (rechts am Träger), warmweiße LEDs, Handy mit blauem Bildschirm,
  *  loses Kabel mit Stecker; von hinten angeschnitten im Band hinter dem Körper (wie die Kegelkugel). */
 function ringlicht(L,p){const [cx,cy]=p.C,s=-lft(p),x=cx+(s>0?row(p.A,31)[2]:row(p.A,31)[1])*.62,y=cy+33,Y=y+13.4,e=PAL.lgLed;
  const cl=L.piece(PAL.metal);ell(L,x,y,1.8,2.2,PAL.metal[1]);light(L,cl,{base:1,hi:0,lo:2,dark:1});ell(L,x,y,.7,1,null,'del');
  L.piece(PAL.black,1);line(L,[[x,y+2],[x,y+5]],PAL.black[2]);
  const r=L.piece(e);ell(L,x,Y,8.3,8.1,e[1]);light(L,r,{base:1,hi:0,lo:2,dark:1,share:.22});for(let k=0;k<12;k++){const t=k/12*Math.PI*2;if(k%3!==1)on(L,r,x+Math.cos(t)*6.6,Y+Math.sin(t)*6.4,e[0]);}// LEDs
  const d=L.piece(PAL.black);ell(L,x,Y,4.7,4.5,PAL.black[3]);line(L,[[x-4.4,Y],[x+4.4,Y]],PAL.black[1],d);// Innenraum, Klemmbügel
  const ph=L.piece(PAL.blue);poly(L,[[x-1.8,Y-3.2],[x+1.8,Y-3.2],[x+1.8,Y+3.2],[x-1.8,Y+3.2]],PAL.blue[1]);light(L,ph,{base:1,hi:0,lo:2,dark:1});on(L,ph,x-.5,Y-1.5,PAL.blue[0]);on(L,ph,x+.5,Y-.5,PAL.blue[0]);// Handy
  L.piece(PAL.black,1);line(L,[[x+1,Y+8],[x+2.5,Y+11],[x+1.5,Y+13.5],[x+3,Y+16]],PAL.black[2]);const pl=L.piece(PAL.metal);ell(L,x+3.2,Y+17,1.2,1.5,PAL.metal[2]);}// Kabel, Stecker
 /** Das vordere Hufeisen: blank geputztes Stahl-Hufeisen (Öffnung oben) an roter Kordel mit Goldperle, am Gürtel links am Träger. */
 function hufeisen(L,p){const [cx,cy]=p.C,s=lft(p),x=cx+(s>0?row(p.A,31)[2]:row(p.A,31)[1])*.64,y=cy+32;
  const lp=L.piece(PAL.red);ell(L,x,y,1.7,1.7,PAL.red[1]);ell(L,x,y,.7,.7,null,'del');
  L.piece(PAL.red,1);line(L,[[x,y+3],[x-5.6,y+11]],PAL.red[1]);line(L,[[x,y+3],[x+5.6,y+11]],PAL.red[2]);// Kordel im V
  const pb=L.piece(PAL.gold);ell(L,x,y+3,1.7,1.6,PAL.gold[1]);light(L,pb,{base:1,hi:0,lo:2,dark:1});// Goldperle
  const h=L.piece(PAL.metal);limb(L,[[x-6,y+11],[x-6.6,y+16],[x-3.8,y+20.6],[x,y+21.8],[x+3.8,y+20.6],[x+6.6,y+16],[x+6,y+11]],[2.2,2.3,2.3,2.3,2.3,2.3,2.2],PAL.metal[1]);light(L,h,{base:1,hi:0,lo:2,dark:1});
  for(const dx of [-6,6]){const t=L.piece(PAL.metal);poly(L,[[x+dx-2.2,y+9.4],[x+dx+2.2,y+9.4],[x+dx+2.2,y+11.6],[x+dx-2.2,y+11.6]],PAL.metal[2]);}// Stollen
  for(const [dx,dy] of [[-6.4,15],[6.4,15],[-3.6,19.6],[3.6,19.6]])on(L,h,x+dx,y+dy,PAL.metal[3]);on(L,h,x-5.8,y+13.5,PAL.metal[0]);on(L,h,x-5.8,y+14.5,PAL.metal[0]);}// Nagellöcher, Glanz
 /** Die Kugel vom Dorfpokal 2011: blau marmorierte Kegelkugel mit drei Grifflöchern und hellem Glanz im goldenen Kordelnetz, am Gürtel links
  *  (vorn im Rumpf, von hinten angeschnitten). */
 function kegelkugel(L,p){const [cx,cy]=p.C,s=lft(p),r=7.5,x=edge(p,38,s)+s*(r*.55+2.5),y=cy+46,kx=edge(p,31,s)-s*2,b=PAL.lgKegel,g=PAL.gold;
  L.piece(g,1);for(const dx of [-4.5,0,4.5])line(L,[[kx,cy+31.5],[x+dx,y-r+1.5]],g[2]);
  const k=L.piece(b);ell(L,x,y,r,r,b[2]);light(L,k,{base:2,hi:1,lo:3,dark:2,share:.34});
  line(L,[[x-5.5,y+1],[x-3,y-1],[x,y+.5],[x+3,y-1.5],[x+5.5,y]],b[1],k);line(L,[[x-4.5,y+4],[x-1,y+3],[x+2,y+4.5],[x+4.5,y+3]],b[3],k);line(L,[[x-5,y-3],[x-3,y-4.5]],b[1],k);// Marmorierung
  ell(L,x-2.8,y-3.2,2.6,1.8,b[0],k);on(L,k,x-3.5,y-4,[255,255,255]);on(L,k,x-2.5,y-4,b[0]);// heller Glanz
  for(const [dx,dy] of [[2,-3.5],[4.6,-.8],[1.4,.6]]){ell(L,x+dx,y+dy,1.3,1.2,b[4],k);on(L,k,x+dx-1,y+dy-1,b[3]);}// drei Grifflöcher
  line(L,[[x-4.5,y+3],[x-1,y+5]],b[3],k);// eingeritzt „PT 2011“
  for(const d of [-4,3]){line(L,[[x+d-3.5,y-r],[x+d+3.5,y+r]],g[2],k);line(L,[[x+d+3.5,y-r],[x+d-3.5,y+r]],g[2],k);}
  const kn=L.piece(g);ell(L,kx,cy+31.5,1.8,1.6,g[1]);light(L,kn,{base:1,hi:0,lo:2,dark:1});}

 // ---------- Quellen ----------
 const gear={
  // Waffen und Nebenhand (Seitenregel und Schwung übernimmt puppe.mjs für weapon/offhand)
  dosenklinge:{slot:'weapon',hands:1,name:'Entgratete Dosenklinge',armVorn:dosenklinge},
  dosenbrecher:{slot:'weapon',hands:1,name:'Dosenbrecher',armVorn:dosenbrecher},
  zeltplatzschild:{slot:'offhand',name:'Zeltplatz-Schild',armVorn:zeltplatzschild},
  // Nebenhand-Fassungen der Einhandwaffen (paperdollSources: Waffe im Platz 'offhand' → Kennung_nh)
  dosenklinge_nh:nebenhand('Entgratete Dosenklinge (Nebenhand)',dosenklinge),
  dosenbrecher_nh:nebenhand('Dosenbrecher (Nebenhand)',dosenbrecher),
  flasche_nh:nebenhand('Bewährte Mehrwegflasche (Nebenhand)',flasche),
  // Fernkampf (eigene Seitenregel über held)
  pfandschleuder:{slot:'ranged',hands:0,name:'Kabelbinder-Pfandschleuder',...held(pfandschleuder)},
  megafon:{slot:'ranged',hands:0,name:'Annis Hygiene-Hochdruckspray',...held(hochdruckspray)},
  ruhepfeife:{slot:'ranged',hands:0,name:'Trillerpfeife der Ruhestörung',...held(trillerpfeife)},
  // Waffenkammer 2026-09-25 (Kennungen = Item-IDs aus content/items.js)
  rohrzange:{slot:'weapon',hands:1,name:'Klempner-Rohrzange',armVorn:(L,p)=>rohrzange(L,p,false)},
  fasskeule:{slot:'weapon',hands:1,name:'Fasskeule',armVorn:(L,p)=>fasskeule(L,p,false)},
  kronkorkenstern:{slot:'weapon',hands:1,name:'Kronkorkenstern',armVorn:kronkorkenstern},
  gartenzwerg:{slot:'weapon',hands:2,name:'Gartenzwerg am Besenstiel',armVorn:gartenzwerg},
  grillzange:{slot:'weapon',hands:1,name:'Grillzange mit Bratwurst',armVorn:grillzange},
  masskrugschild:{slot:'offhand',name:'Maßkrug-Schild',armVorn:masskrugschild},
  rohrzange_nh:nebenhand('Klempner-Rohrzange (Nebenhand)',(L,p)=>rohrzange(L,p,true)),
  fasskeule_nh:nebenhand('Fasskeule (Nebenhand)',(L,p)=>fasskeule(L,p,true)),
  kronkorkenstern_nh:nebenhand('Kronkorkenstern (Nebenhand)',kronkorkenstern),
  grillzange_nh:nebenhand('Grillzange mit Bratwurst (Nebenhand)',grillzange),
  schorlenspritze:{slot:'ranged',hands:0,name:'Schorlenspritze',...held(schorlenspritze)},
  blitzschrauber:{slot:'ranged',hands:0,name:'Blitzschrauber',...held(blitzschrauber)},
  // Rüstung (Grundteile der Zufallsgegenstände)
  festivalhelm:{slot:'head',name:'Festivalhelm',kopf:festivalhelm},
  festtagsjacke,
  boxenschultern:{slot:'shoulders',name:'Boxenträger-Schultern',armHinten(L,p){schulterbox(L,p,p.armF,true);},armVorn(L,p){schulterbox(L,p,p.armN,false);}},
  kronkorkenkette:{slot:'neck',name:'Kronkorkenkette',rumpf:kronkorkenkette},
  kabelmanschetten:{slot:'wrists',name:'Kabelbinder-Manschetten',armHinten(L,p){manschette(L,p,p.armF,true);},armVorn(L,p){manschette(L,p,p.armN,false);}},
  grillhandschuhe:{slot:'hands',name:'Grillhandschuhe',...fern((L,p)=>handschuh(L,p,p.armF,true)),armVorn(L,p){handschuh(L,p,p.armN,false);}},
  grillhandschuhe_faust:{slot:'hands',name:'Grillhandschuhe (Schildfaust)',armVorn:handschuhFaust},
  zapfhahnguertel:{slot:'waist',name:'Zapfhahn-Gürtel',rumpf:zapfhahnguertel},
  maifeldtreter:{slot:'feet',name:'Maifeldtreter',beinHinten(L,p){treter(L,p,p.legF,p.toeF,true);},beinVorn(L,p){treter(L,p,p.legN,p.toeN,false);}},
  // Ringe: fester Ring an der Waffenhand (rechts), Siegelring der Zufallsringe an der Nebenhand (links)
  pfandring:{slot:'ring',name:'Ring der ewigen Rückgabe',armVorn(L,p){if(!p.swap)ringAt(L,p.armN,false,PAL.gold,PAL.can);},...fern((L,p)=>{if(p.swap)ringAt(L,p.armF,true,PAL.gold,PAL.can);})},
  pfandsiegel:{slot:'ring',name:'Pfandsiegel',armVorn(L,p){if(p.swap)ringAt(L,p.armN,false,PAL.metal,PAL.stamp);},...fern((L,p)=>{if(!p.swap)ringAt(L,p.armF,true,PAL.metal,PAL.stamp);})},
  // Talismane und Glücksbringer
  keilerzahn:{slot:'charm',name:'Hauers letzter Zahn',rumpf:keilerzahn},
  kabeltalisman:{slot:'charm',name:'Kabelbinder-Talisman',rumpf:kabeltalisman},
  blechtalisman:{slot:'charm',name:'Dosenblech-Talisman',rumpf:blechtalisman},
  clanandenken:{slot:'charm',name:'Clan-Andenken',rumpf:clanandenken},
  hausordnung:{slot:'charm',name:'Horsts gelochte Hausordnung',rumpf:hausordnung},
  schnorrerbecher:{slot:'charm',name:'Der nie leere Schnorrerbecher',rumpf:schnorrerbecher},
  kegelkugel:{slot:'charm',name:'Die Kugel vom Dorfpokal 2011',rumpf(L,p){if(!p.back)kegelkugel(L,p);},armHinten(L,p){if(p.back)kegelkugel(L,p);}},
  // Dorflegenden aus Schloss Big B (Kennungen = Item-IDs)
  'pelzmantel-baron':{slot:'body',name:'Pelzmantel des Barons',armHinten(L,p){pelzArm(L,p,p.armF,true);},armVorn(L,p){pelzArm(L,p,p.armN,false);},rumpf:pelzRumpf},
  'hochglanz-expose':{slot:'offhand',name:'Hochglanz-Exposé',armVorn:expose},
  'korkenzieher-kellermeister':{slot:'weapon',hands:1,name:'Korkenzieher des Kellermeisters',armVorn:(L,p)=>korkenzieher(L,p,false)},
  'korkenzieher-kellermeister_nh':nebenhand('Korkenzieher des Kellermeisters (Nebenhand)',(L,p)=>korkenzieher(L,p,true)),
  'ringlicht-reichweite':{slot:'charm',name:'Ringlicht der Reichweite',rumpf(L,p){if(!p.back)ringlicht(L,p);},armHinten(L,p){if(p.back)ringlicht(L,p);}},
  'halbes-hufeisen':{slot:'charm',name:'Das vordere Hufeisen',rumpf(L,p){if(!p.back)hufeisen(L,p);},armHinten(L,p){if(p.back)hufeisen(L,p);}},
  automatenarm,
 };
 // Familien aus equipment-appearance.js (slots/weapons/special) → Quelle; überschreibt FAMILY_SOURCE in puppe.mjs
 const families={helmet:'festivalhelm',chain:'kronkorkenkette',pauldron:'boxenschultern',jacket:'festtagsjacke',bracer:'kabelmanschetten',glove:'grillhandschuhe',
  belt:'zapfhahnguertel',trouser:'jeans',boot:'maifeldtreter',ring:'pfandsiegel',pendant:'clanandenken',shield:'zeltplatzschild',
  club:'dosenbrecher',blade:'dosenklinge',maul:'tresenhammer',slingshot:'pfandschleuder',sprayer:'megafon',
  whistle:'ruhepfeife',tusk:'keilerzahn',cup:'schnorrerbecher',robotclaw:'automatenarm'};
 const sided=['pfandschleuder','megafon','ruhepfeife','schorlenspritze','blitzschrauber','festtagsjacke','grillhandschuhe_faust','pfandring','pfandsiegel','clanandenken','hausordnung','schnorrerbecher','kegelkugel','automatenarm','ringlicht-reichweite','halbes-hufeisen'];
 return {gear,back:{},families,sided};
}
