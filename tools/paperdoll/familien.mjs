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
 const held=draw=>({armVorn(L,p){if(!p.swap)inHand(L,p,draw);},
  armHinten(L,p){if(p.swap)inHand(L,{...p,armN:p.armF,armF:p.armN,swingN:p.swingF,swingF:p.swingN},draw);}});

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
  *  Ohne Tausch liegt die Hand hinten (armHinten, hinter dem Körper), mit Tausch vorn (armVorn). */
 const nebenhand=(name,draw)=>{const sw=p=>({...p,armN:p.armF,armF:p.armN,swingN:p.swingF,swingF:p.swingN});
  return {slot:'offhand',hands:1,name,armHinten(L,p){if(!p.swap)draw(L,sw(p));},armVorn(L,p){if(p.swap)draw(L,sw(p));}};};

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
 /** Die Kugel vom Dorfpokal 2011: schwarze Kegelkugel im Kordelnetz, am Gürtel links (vorn im Rumpf, von hinten angeschnitten). */
 function kegelkugel(L,p){const [cx,cy]=p.C,s=lft(p),r=7.5,x=edge(p,38,s)+s*(r*.55+2.5),y=cy+46,kx=edge(p,31,s)-s*2;
  L.piece(PAL.label,1);for(const dx of [-4.5,0,4.5])line(L,[[kx,cy+31.5],[x+dx,y-r+1.5]],PAL.label[2]);
  const k=L.piece(PAL.black);ell(L,x,y,r,r,PAL.black[2]);light(L,k,{base:2,hi:1,lo:3,dark:2,share:.34});
  ell(L,x-2.8,y-3.2,2.6,1.8,PAL.black[0],k);on(L,k,x-3.5,y-4,[255,255,255]);on(L,k,x-2.5,y-4,PAL.metal[1]);
  for(const [dx,dy] of [[2,-3.5],[4.6,-.8],[1.4,.6]]){ell(L,x+dx,y+dy,1.2,1.1,PAL.black[4],k);on(L,k,x+dx-1,y+dy-1,PAL.black[1]);}
  line(L,[[x-4.5,y+3],[x-1,y+5]],PAL.black[1],k);// eingeritzt „PT 2011“
  for(const d of [-4,3]){line(L,[[x+d-3.5,y-r],[x+d+3.5,y+r]],PAL.label[2],k);line(L,[[x+d+3.5,y-r],[x+d-3.5,y+r]],PAL.label[2],k);}
  const kn=L.piece(PAL.label);ell(L,kx,cy+31.5,1.8,1.6,PAL.label[1]);light(L,kn,{base:1,hi:0,lo:2,dark:1});}
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
  // Rüstung (Grundteile der Zufallsgegenstände)
  festivalhelm:{slot:'head',name:'Festivalhelm',kopf:festivalhelm},
  festtagsjacke,
  boxenschultern:{slot:'shoulders',name:'Boxenträger-Schultern',armHinten(L,p){schulterbox(L,p,p.armF,true);},armVorn(L,p){schulterbox(L,p,p.armN,false);}},
  kronkorkenkette:{slot:'neck',name:'Kronkorkenkette',rumpf:kronkorkenkette},
  kabelmanschetten:{slot:'wrists',name:'Kabelbinder-Manschetten',armHinten(L,p){manschette(L,p,p.armF,true);},armVorn(L,p){manschette(L,p,p.armN,false);}},
  grillhandschuhe:{slot:'hands',name:'Grillhandschuhe',armHinten(L,p){handschuh(L,p,p.armF,true);},armVorn(L,p){handschuh(L,p,p.armN,false);}},
  grillhandschuhe_faust:{slot:'hands',name:'Grillhandschuhe (Schildfaust)',armVorn:handschuhFaust},
  zapfhahnguertel:{slot:'waist',name:'Zapfhahn-Gürtel',rumpf:zapfhahnguertel},
  maifeldtreter:{slot:'feet',name:'Maifeldtreter',beinHinten(L,p){treter(L,p,p.legF,p.toeF,true);},beinVorn(L,p){treter(L,p,p.legN,p.toeN,false);}},
  // Ringe: fester Ring an der Waffenhand (rechts), Siegelring der Zufallsringe an der Nebenhand (links)
  pfandring:{slot:'ring',name:'Ring der ewigen Rückgabe',armVorn(L,p){if(!p.swap)ringAt(L,p.armN,false,PAL.gold,PAL.can);},armHinten(L,p){if(p.swap)ringAt(L,p.armF,true,PAL.gold,PAL.can);}},
  pfandsiegel:{slot:'ring',name:'Pfandsiegel',armVorn(L,p){if(p.swap)ringAt(L,p.armN,false,PAL.metal,PAL.stamp);},armHinten(L,p){if(!p.swap)ringAt(L,p.armF,true,PAL.metal,PAL.stamp);}},
  // Talismane und Glücksbringer
  keilerzahn:{slot:'charm',name:'Hauers letzter Zahn',rumpf:keilerzahn},
  kabeltalisman:{slot:'charm',name:'Kabelbinder-Talisman',rumpf:kabeltalisman},
  blechtalisman:{slot:'charm',name:'Dosenblech-Talisman',rumpf:blechtalisman},
  clanandenken:{slot:'charm',name:'Clan-Andenken',rumpf:clanandenken},
  hausordnung:{slot:'charm',name:'Horsts gelochte Hausordnung',rumpf:hausordnung},
  schnorrerbecher:{slot:'charm',name:'Der nie leere Schnorrerbecher',rumpf:schnorrerbecher},
  kegelkugel:{slot:'charm',name:'Die Kugel vom Dorfpokal 2011',rumpf(L,p){if(!p.back)kegelkugel(L,p);},armHinten(L,p){if(p.back)kegelkugel(L,p);}},
  automatenarm,
 };
 // Familien aus equipment-appearance.js (slots/weapons/special) → Quelle; überschreibt FAMILY_SOURCE in puppe.mjs
 const families={helmet:'festivalhelm',chain:'kronkorkenkette',pauldron:'boxenschultern',jacket:'festtagsjacke',bracer:'kabelmanschetten',glove:'grillhandschuhe',
  belt:'zapfhahnguertel',trouser:'jeans',boot:'maifeldtreter',ring:'pfandsiegel',pendant:'clanandenken',shield:'zeltplatzschild',
  club:'dosenbrecher',blade:'dosenklinge',maul:'tresenhammer',slingshot:'pfandschleuder',sprayer:'megafon',
  whistle:'ruhepfeife',tusk:'keilerzahn',cup:'schnorrerbecher',robotclaw:'automatenarm'};
 const sided=['pfandschleuder','megafon','ruhepfeife','festtagsjacke','grillhandschuhe_faust','pfandring','pfandsiegel','clanandenken','hausordnung','schnorrerbecher','kegelkugel','automatenarm'];
 return {gear,back:{},families,sided};
}
