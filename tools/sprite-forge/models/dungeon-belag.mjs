// Sprite-Schmiede · Gruppe „dungeon-belag“: Böden, Bodendeko und Tischdeko für den Dungeon „Schloss Big B“
// (Doppelgarage mit Keller eines Hochstaplers, Leitidee „Schild und Wirklichkeit“: an der Tür steht „Rittersaal“, drin ist ein
// Partykeller; ganz unten liegt ein echter Basaltkeller). Maße und Klassen: content/sprite-kit.js, Block „Dungeon Schloss Big B“.
//
// Beläge (Kachel 64×64 E von oben, nahtlos periodisch in x und y) folgen den Regeln aus belag-wand.mjs:
// - Geometrie ist eine periodische Höhenkarte (Periode 64), damit Schatten- und Verdeckungsstrahlen über den Rand dieselbe Welt sehen.
// - Rauschen nur über `tn` (noiseTile3, ganzzahlige Zellzahlen je 64 E); Zufall nur per hash3 über periodische Indizes.
// - Fliesen, Dielen und Raster teilen 64; einzeln gestreute Flecken messen ihren Abstand periodisch (`pd`).
// - Keine großflächigen Verläufe: Böden sind ruhiger Hintergrund, Figuren müssen sich abheben.
import {hash3,noiseTile3,smoothstep,clamp,mix,fbm3,box,block,cylZ,capsule,ellipsoid,at,union,intersect,smoothUnion,rotX,rotY,rotZ,polyDist} from '../sdf.mjs';
import {custom,rampFrom,hex,metal,wood,paper,glow} from '../materials.mjs';

const P=64,TAU=Math.PI*2;
/** Ebenes Flachdach-Tonwert in Draufsicht: k≈.68 trifft die Grundfarbe (siehe belag-wand.mjs). */
const TOP=.68;
const wrap=(v,p=P)=>v-p*Math.floor(v/p);
const frac=v=>v-Math.floor(v);
/** Kachelbares Rauschen 0..1: fx/fy = Gitterzellen je 64 E in x/y (ganzzahlig), s = Kanal (Saat), oct Oktaven. */
function tn(x,y,s,fx,fy,oct=3){let sum=0,a=.5,n=0;
 for(let i=0;i<oct;i++){sum+=a*noiseTile3(x*fx/P+i*31,y*fy/P+i*17,s*7.31+i*5.3,fx,fy);n+=a;fx*=2;fy*=2;a*=.5;}return sum/n;}
/** Zufallszahl 0..1 für periodische Ganzzahl-Indizes. */
const rnd=(i,j,s)=>hash3(i,j,s*977+13);
/** Höhenkarte als Distanzfeld (Beläge, von oben): Oberfläche z=h(x,y). Senkrechte Strahlen treffen sie exakt. */
const heightField=h=>(x,y,z)=>z-h(x,y);
/** Periodischer Abstand (Periode 64) zwischen (x,y) und einem Zentrum – für gestreute Flecken ohne Naht. */
const pd=(x,y,cx,cy)=>Math.hypot(wrap(x-cx+32)-32,wrap(y-cy+32)-32);
/** n Streupunkte je Kachel aus dem Hash: {x,y,r,s}. */
const scatter=(n,seed,r0,r1)=>Array.from({length:n},(_,k)=>({x:rnd(k,0,seed)*P-32,y:rnd(k,1,seed)*P-32,r:r0+(r1-r0)*rnd(k,2,seed),s:seed*3+k}));
/** Periodisches Voronoi (n×n Zellen je 64 E): Abstand zur nächsten Zellgrenze `edge` (E), Zell-Hash `id`, Nachbar-Hash `id2`,
 *  Abstand zum eigenen Zellpunkt `d1`. */
function voronoi(x,y,n,seed,{jit=.64,r=2,soft=0}={}){const c=P/n,X=wrap(x+32),Y=wrap(y+32),ci=Math.floor(X/c),cj=Math.floor(Y/c),pts=[];let b1=1e9,p1=null;
 for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){const i=ci+di,j=cj+dj,ii=wrap(i,n),jj=wrap(j,n),m=(1-jit)/2;
  const p=[(i+m+jit*rnd(ii,jj,seed))*c,(j+m+jit*rnd(ii,jj,seed+1))*c,rnd(ii,jj,seed+2)],d=Math.hypot(X-p[0],Y-p[1]);pts.push(p);if(d<b1){b1=d;p1=p;}}
 let edge=1e9,id2=0,sum=0;for(const p of pts){if(p===p1)continue;const dx=p[0]-p1[0],dy=p[1]-p1[1],l=Math.hypot(dx,dy),e=-((X-(p[0]+p1[0])/2)*dx+(Y-(p[1]+p1[1])/2)*dy)/l;
  if(e<edge){edge=e;id2=p[2];}if(soft)sum+=Math.exp(-e/soft);}
 // soft > 0: weicher Kantenabstand (log-sum-exp über alle Nachbarkanten) – ohne Grat am Mittelpunkt der Zelle
 return {edge,id:p1[2],id2,d1:b1,es:soft?-soft*Math.log(sum):edge};}
/** Rampe direkt aus Palettentönen (dunkel → hell), z. B. für Grün, das die Standardrampe im Schatten ins Oliv zieht. */
const ownRamp=cols=>cols.map(hex);
const floor=(make,extra={})=>({tile:P,height:1,...extra,build:()=>({solids:[make()]})});

// =====================================================================================================================
// Partykeller-Fliesen: 70er-Karo aus orange-braunen und schokobraunen Fliesen (8 E), helle, vergilbte Fugen,
// glasiert (Glanz an den gewölbten Kanten), einzelne Kratzer, Bierglasränder und klebrige Flecken.
// =====================================================================================================================
function partyTiles(){
 const T=8,warm=rampFrom('#8e5634'),choc=rampFrom('#4a3127'),grout=rampFrom('#a8966e'),groutDirt=rampFrom('#86745a'),
  beer=rampFrom('#6e4a26'),sticky=rampFrom('#34261f');
 const loc=(x,y)=>{const X=wrap(x+32),Y=wrap(y+32),i=Math.floor(X/T),j=Math.floor(Y/T),xs=X-i*T,ys=Y-j*T;return {i,j,xs,ys,d:Math.min(xs,T-xs,ys,T-ys)};};
 // Bierglasränder: Ringe (Radius 1,5–2,1 E) quer über Fliesen und Fugen gestreut
 const rings=scatter(5,301,1.5,2.1);
 const ringAt=(x,y)=>{let e=9,inside=false;for(const c of rings){const d=pd(x,y,c.x,c.y),w=Math.abs(d-c.r);if(w<e)e=w;if(d<c.r)inside=true;}return {e,inside};};
 const h=(x,y)=>{const q=loc(x,y);return -.25-.6*(1-smoothstep(.22,.72,q.d));};
 const tex=(x,y)=>{const q=loc(x,y);
  if(q.d<.34){const dirt=tn(x,y,302,12,12,2);return {k:TOP*(.93+.12*(tn(x,y,303,64,64,1)-.5)),ramp:dirt>.6?groutDirt:grout,spec:.05};}
  const dark=((q.i+q.j)&1)===1,id=rnd(q.i,q.j,304);
  let k=TOP*(.97+.07*(id-.5)+.07*(tn(x,y,305,16,16,3)-.5));
  if(tn(x,y,306,64,64,1)>.72)k*=1.05;// Glasursprenkel
  // Kratzer: auf etwa jeder dritten Fliese ein heller, leicht gebogener Strich
  if(rnd(q.i,q.j,307)<.35){const a=rnd(q.i,q.j,308)*Math.PI,c=Math.cos(a),s=Math.sin(a),u=(q.xs-T/2)*c+(q.ys-T/2)*s,
   v=-(q.xs-T/2)*s+(q.ys-T/2)*c+.1*u*u*(rnd(q.i,q.j,309)-.5)+(rnd(q.i,q.j,311)-.5)*3,len=1.4+2*rnd(q.i,q.j,310);
   if(Math.abs(v)<.16&&Math.abs(u)<len)k*=dark?1.28:1.16;}
  const rg=ringAt(x,y);
  if(rg.e<.3)return {k:k*.8,ramp:dark?sticky:beer,spec:.5};
  if(rg.inside)k*=.93;
  // Klebereste: kleine unregelmäßige Flecken, glänzender als die Glasur
  if(tn(x,y,312,24,24,2)>.72&&tn(x,y,313,4,4,2)>.5)return {k:k*.84,ramp:dark?sticky:beer,spec:.6};
  return {k,ramp:dark?choc:warm};};
 return {f:heightField(h),mat:custom('kellerfliesen','#8e5634',tex,{spec:.3,shine:28}),group:'belag'};
}

// =====================================================================================================================
// Laminat Eiche hell: acht Dielen je Kachel (8 E breit) längs x, Dielenlänge 32 E (kürzer wirkt es wie ein Ziegelverband),
// Stöße je Reihe um ≥ 10 E versetzt. Das Holzbild ist ein Foto-Imitat: nur drei Druckbilder, die sich auf den Dielen
// wiederholen (Hochstapler-Holz). Flache Maserung aus angeschnittenen Jahresringen (Kathedralen), feine Porenstriche,
// ganz leichte Fugen.
// =====================================================================================================================
function laminate(){
 const rows=8,bw=P/rows,Ls=P/2,offs=[0,13,24,6,19,29,10,22],seed=401,ramp=rampFrom('#a88c62');
 const prints=[0,1,2].map(p=>({cy:bw*(.5+.8*(rnd(p,0,402)-.5)),d0:(rnd(p,1,402)-.5)*3,s:.07+.05*rnd(p,2,402),x0:Ls*(.3+.4*rnd(p,3,402)),
  sp:1.15+.3*rnd(p,4,402),tone:1+.05*(rnd(p,5,402)-.5),seed:p*37+5}));
 const cell=(x,y)=>{const Y=wrap(y+32),r=Math.min(rows-1,Math.floor(Y/bw)),vy=Y-r*bw,X=wrap(x+32-offs[r]),b=Math.min(1,Math.floor(X/Ls)),xs=X-b*Ls;
  return {r,b,vy,xs,ey:Math.min(vy,bw-vy),ex:Math.min(xs,Ls-xs),p:prints[Math.floor(rnd(r,b,seed)*3)%3]};};
 const h=(x,y)=>{const q=cell(x,y),d=Math.min(q.ey,q.ex);return -.25-.3*(1-smoothstep(.08,.42,d));};
 const tex=(x,y)=>{const q=cell(x,y),p=q.p,u=q.xs,v=q.vy;
  // Jahresringe: Schnittebene nahe am Mark; Abstand zur Ebene wächst langsam entlang der Diele → langgezogene Bögen
  const warp=.6*(fbm3(u*.06+p.seed,v*.3,p.seed,2)-.42),ring=Math.hypot(v-p.cy+warp,p.d0+p.s*(u-p.x0))/p.sp,fr=frac(ring);
  let k=TOP*p.tone*(1-.06*smoothstep(.5,.9,fr));
  if(fr>.88)k*=.92;// Spätholz-Linie
  if(fbm3(u*.3+p.seed,v*3,p.seed+1,2)>.64)k*=.95;// Porenstriche längs
  k*=1+.04*(fbm3(u*.12+p.seed,v*.25,p.seed+2,2)-.42);
  if(q.ey<.24)k*=.8;else if(q.ex<.24)k*=.78;// Fugen
  return {k,ramp};};
 return {f:heightField(h),mat:custom('laminat','#a88c62',tex,{spec:.16,shine:16}),group:'belag'};
}

// =====================================================================================================================
// Nadelfilz-Teppichfliesen (Büro): 16×16 E, grau-blau, jede zweite Fliese um 90° gedreht (Florstrich quer, etwas heller),
// melierte Fasern, kaum sichtbare Stöße, ein paar Kaffeeflecken mit dunklem Trocknungsrand.
// =====================================================================================================================
function officeCarpet(){
 // Die Palette rastet schon ±5 % Helligkeit in einen anderen Farbton ein (Blaugrau → Braungrau). Die gedrehten Fliesen
 // unterscheiden sich deshalb über Strichrichtung und Anteil heller Fasern, nicht über die Grundhelligkeit.
 const S=16,main=rampFrom('#4a5260'),dk=rampFrom('#3e4550'),lt=rampFrom('#56606e'),coffee=rampFrom('#58504e'),rim=rampFrom('#4c423c');
 const loc=(x,y)=>{const X=wrap(x+32),Y=wrap(y+32),i=Math.floor(X/S),j=Math.floor(Y/S),xs=X-i*S,ys=Y-j*S;return {i,j,xs,ys,d:Math.min(xs,S-xs,ys,S-ys),rot:(i+j)&1};};
 // Kaffeeflecken: unregelmäßige, leicht verschmierte Lache (Radius 2,6–3,8 E) mit dunklem Trocknungsrand; Spritzer ohne Rand
 const stains=scatter(3,501,2.3,3.3).map((c,k)=>({...c,a:rnd(k,4,501)*Math.PI,el:1.05+.25*rnd(k,3,501)})),
  splash=stains.flatMap((c,k)=>[0,1,2].map(m=>{const a=rnd(k,m+5,501)*TAU,l=c.r+1.0+1.6*rnd(k,m+8,501);
   return {x:c.x+Math.cos(a)*l,y:c.y+Math.sin(a)*l,r:.45+.35*rnd(k,m+11,501)};}));
 const stainE=(x,y)=>{let e=9;for(const c of stains){const dx=wrap(x-c.x+32)-32,dy=wrap(y-c.y+32)-32,ca=Math.cos(c.a),sa=Math.sin(c.a),
   d=Math.hypot((dx*ca+dy*sa)/c.el,-dx*sa+dy*ca),R=c.r*(1+.7*(tn(x,y,c.s,16,16,2)-.45)+.6*(tn(x,y,c.s+1,6,6,2)-.45));e=Math.min(e,d-R);}return e;};
 const splashE=(x,y)=>{let e=9;for(const c of splash)e=Math.min(e,pd(x,y,c.x,c.y)-c.r);return e;};
 const h=(x,y)=>{const q=loc(x,y);return -.3+.05*tn(x,y,502,32,32,2)-.12*(1-smoothstep(.05,.25,q.d));};
 const tex=(x,y)=>{const q=loc(x,y),k=TOP*(q.d<.22?.86:.98);
  const e=stainE(x,y);
  // Trocknungsrand nur stellenweise (wie echter Kaffee im Filz), innen bräunlich
  if(e<0){if(e>-.45&&tn(x,y,506,12,12,2)>.4)return {k:k*.97,ramp:rim};return {k:k*(1+.08*(tn(x,y,504,16,16,2)-.5)),ramp:coffee};}
  if(splashE(x,y)<0)return {k,ramp:coffee};
  // Melierte Faserpunkte, in Florrichtung leicht gestreckt; gedrehte Fliesen tragen mehr helle Fasern (wirkt heller),
  // dazu seltene feine Striche entlang des Flors
  const along=q.rot?tn(x,y,503,6,96,2):tn(x,y,503,96,6,2),f=q.rot?tn(x,y,505,64,128,1):tn(x,y,505,128,64,1);
  if(along>.8||f>(q.rot?.64:.76))return {k,ramp:lt};
  if(along<.2||f<.24)return {k,ramp:dk};
  return {k,ramp:main};};
 return {f:heightField(h),mat:custom('nadelfilz','#4a5260',tex,{spec:.02,shine:4}),group:'belag'};
}

// =====================================================================================================================
// Basaltplatten: fünf Lagen unterschiedlicher Höhe (10–16 E), Platten 10–22 E breit, Stoßfugen gegen die Nachbarlagen um
// ≥ 3 E versetzt (auch über den Kachelrand), zwei große Platten über je zwei Lagen, leicht unregelmäßig verzogen. Keine
// Diagonalen (im großen Saal wiederholt sich jede Schräge als Muster); stattdessen einzelne kurze Risse als feine dunkle
// Linien, die von einer Kante ausgehen. Dunkles Blaugrau, feine Poren (Gasblasen), winzige helle Körner, glatt gelaufene,
// glänzende Kanten, dunkle Fugen. Jede Platte hat sich ein wenig gesetzt (eigene Neigung).
// =====================================================================================================================
function basaltSlabs(){
 const rowY=[0,11,27,37,51,64],J=.38,
  joints=[[13,25,47,61],[8,30,47,61],[8,30,44,57],[2,21,35,52],[6,18,35,52]],// Stoßfugen je Lage (x in 0..64)
  MERGE=new Set(['0:47','1:8','3:35']);// „Lage:x0“ – diese Platte reicht über die Lage darunter (versetzt, unterbricht die Lagenfugen)
 /** Platte an (X,Y) ∈ [0,64)²: Grenzen x0..x1 (über den Rand gefaltet), y0..y1 und Schlüssel der Platte. */
 function cellAt(X,Y){let r=0;while(r<4&&Y>=rowY[r+1])r++;const js=joints[r];let i=js.length-1;while(i>=0&&X<js[i])i--;
  const x0=i<0?js[js.length-1]-P:js[i],x1=i<0?js[0]:i+1<js.length?js[i+1]:js[0]+P,kx=wrap(x0);let top=r,y0=rowY[r],y1=rowY[r+1];
  if(MERGE.has(r+':'+kx))y1=rowY[r+2];else if(r>0&&MERGE.has((r-1)+':'+kx)){top=r-1;y0=rowY[r-1];}
  // Ton gleichmäßig verteilt (Platz in der Lage + Lage), nicht per Zufall: zufällig gehäufte helle Platten bilden im Saal Bänder
  return {x0,x1,y0,y1,key:top*P+kx,tone:(joints[top].indexOf(kx)+2*top)%3};}
 // Risse: kurzer Zickzack-Zug von einer Kante in die Platte (≈ 6–8 E), dazu ein kleiner Ast; Koordinaten plattenlokal.
 const CRACK=new Map();
 for(const [r,x,s] of [[0,25,1],[1,8,2],[4,18,3]]){const c=cellAt(x+.5,rowY[r]+.5),L=c.x1-c.x0,H=c.y1-c.y0,rr=k=>rnd(s,k,631);
  const side=Math.floor(rr(0)*4),u0=[L*(.3+.4*rr(1)),0,L,L*(.3+.4*rr(1))][side],v0=[0,H*(.3+.4*rr(2)),H*(.3+.4*rr(2)),H][side];
  let ang=[Math.PI/2,0,Math.PI,-Math.PI/2][side]+(rr(3)-.5)*.8,p=[u0,v0];const pts=[p];
  for(let k=0;k<5;k++){ang+=(rr(4+k)-.5)*1.2;const l=1.2+1.1*rr(10+k);p=[clamp(p[0]+Math.cos(ang)*l,1,L-1),clamp(p[1]+Math.sin(ang)*l,1,H-1)];pts.push(p);}
  const m=pts[2],ba=ang+(rr(20)<.5?1:-1)*1.1,br=[m,[m[0]+Math.cos(ba)*1.6,m[1]+Math.sin(ba)*1.6],[m[0]+Math.cos(ba+.4)*3,m[1]+Math.sin(ba+.4)*3]];
  const d1=line2(pts),d2=line2(br);CRACK.set(c.key,(u,v)=>Math.min(d1(u,v),d2(u,v)+.06));}
 // Eigene Blaugrau-Rampen aus Palettentönen: rampFrom('#454b54') rastet ab Stufe 4 braungrau ein (#565859, #56555a).
 const stones=[ownRamp(['#1e212e','#2d323d','#364047','#3a414d','#434c5b','#4a515b','#5f6368']),ownRamp(['#1e212e','#2c2a35','#333641','#434c5b','#4a515b','#5f6368','#67787d']),
  ownRamp(['#171f29','#242333','#2d323d','#364047','#3a414d','#434c5b','#5f6368'])],mortar=rampFrom('#2c2b31'),lime=rampFrom('#3c3d44');
 function slab(x,y){const wx=x+.9*(tn(x,y,601,4,4,2)-.5),wy=y+.9*(tn(x,y,602,4,4,2)-.5),X=wrap(wx+32),Y=wrap(wy+32),c=cellAt(X,Y);
  const u=X-c.x0,vy=Y-c.y0,L=c.x1-c.x0,hh=c.y1-c.y0,cr=CRACK.get(c.key);
  return {e:Math.min(u,L-u,vy,hh-vy),id:rnd(c.key,0,603),tone:c.tone,X:u,vy,L,hh,crack:cr?cr(u,vy):9};}
 function pores(x,y){const n=32,c=2,X=wrap(x+32),Y=wrap(y+32),ci=Math.floor(X/c),cj=Math.floor(Y/c);let best=9;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const i=wrap(ci+di,n),j=wrap(cj+dj,n);if(rnd(i,j,610)>.3)continue;
   const px=(ci+di+.2+.6*rnd(i,j,611))*c,py=(cj+dj+.2+.6*rnd(i,j,612))*c,r=.14+.18*rnd(i,j,613);best=Math.min(best,Math.hypot(X-px,Y-py)-r);}return best;}
 const h=(x,y)=>{const s=slab(x,y);
  return -.35+.12*(s.id-.5)+.02*((s.X-s.L/2)*(hash3(Math.floor(s.id*1e5),1,614)-.5)+(s.vy-s.hh/2)*(hash3(Math.floor(s.id*1e5),2,614)-.5))
   -1.5*(1-smoothstep(J,J+1.6,s.e))**1.5+.05*(tn(x,y,615,16,16,2)-.5)-(s.crack<.32?.14*(1-s.crack/.32):0);};
 const tex=(x,y)=>{const s=slab(x,y);
  if(s.e<J){const l=tn(x,y,616,6,6,2);return {k:TOP*(.85+.2*(tn(x,y,617,32,32,2)-.5)),ramp:l>.64?lime:mortar};}
  const rp=stones[s.tone];
  // Helligkeit bleibt nah an der Grundstufe der Rampe (k≈TOP): zwischen zwei Stufen springt das Rauschen zwischen zwei
  // Palettenfarben und die Platte wirkt fleckig. Die Töne unterscheiden sich über den Grundton der drei Rampen.
  let k=TOP*(1+.03*(s.id-.5)+.03*(tn(x,y,618,16,16,2)-.5));
  if(s.crack<.16)return {k:k*.62,ramp:mortar,spec:.03};// Riss: feine dunkle Linie
  if(s.crack<.34)k*=.86;
  if(pores(x,y)<0)return {k:k*.58,ramp:rp,spec:.04};
  if(tn(x,y,619,128,128,1)>.76)k*=1.1;// helle Körner
  const edge=1-smoothstep(J+.2,J+1.9,s.e);
  return {k,ramp:rp,spec:.12+.5*edge};};
 return {f:heightField(h),mat:custom('basalt','#454b54',tex,{spec:.15,shine:22}),group:'belag'};
}

// =====================================================================================================================
// Basaltpflaster, feucht: Katzenköpfe (Voronoi 9×9 je Kachel, ≈ 7 E), gewölbt und nass glänzend (Glanzpunkt auf der
// Lichtseite jedes Steins, nicht bei allen gleich stark), kleine Pfützen in den Fugen, sparsam Moos und Grünspan.
// =====================================================================================================================
function basaltCobbles(){
 const n=9,WL=-2.0,J=.42,vor=(x,y)=>voronoi(x,y,n,701,{jit:.72,soft:.7});
 // Eigene Blaugrau-Rampen aus Palettentönen: die Standardrampe rastet in den hellen Stufen braungrau ein.
 const stones=[ownRamp(['#1e212e','#2c2a35','#333641','#3a414d','#434c5b','#4a515b','#5f6368']),ownRamp(['#1e212e','#2d323d','#364047','#3a414d','#44575f','#5f6368','#67787d']),
  ownRamp(['#171f29','#242333','#2c2a35','#364047','#3a414d','#434c5b','#5f6368'])],mud=rampFrom('#2a2c32'),water=rampFrom('#34424e'),
  MOSS=ownRamp(['#263530','#2d423c','#354b36','#455e40','#55704a','#6d824e','#849451']),
  VERD=ownRamp(['#243841','#2c434d','#344c48','#3d5856','#4d6a60','#5e776f','#748d7c']);
 // Kuppel über dem weichen Kantenabstand es: dicht gesetzte Köpfe (Voronoi), rund statt facettiert (harter Kantenabstand gibt Grate).
 const stoneH=(x,y,v)=>{const t=v.d1/(v.d1+Math.max(v.es,0)+1e-6);
  return -.3-1.1*t**2.6-.9*(1-smoothstep(J*.4,J+.5,v.es))+.06*(tn(x,y,703,16,16,2)-.5)+.25*(v.id-.5);};
 const pool=(x,y)=>tn(x,y,702,5,5,2),PL=.63;
 const h=(x,y)=>{const v=vor(x,y);let z=stoneH(x,y,v);if(pool(x,y)>PL)z=Math.max(z,WL);return z;};
 const tex=(x,y)=>{const v=vor(x,y),sz=stoneH(x,y,v);
  if(pool(x,y)>PL&&sz<WL+1e-4)return {k:TOP*(.92+.14*(tn(x,y,704,16,16,2)-.5)),ramp:water,spec:.35};
  if(v.es<J){const m=tn(x,y,705,6,6,2);// Fuge: Schlamm, sparsam Moos und Grünspan
   if(m>.68)return {k:TOP*(.85+.3*(tn(x,y,706,32,32,2)-.5)),ramp:MOSS};
   if(m<.22)return {k:TOP*(.85+.2*(tn(x,y,707,32,32,2)-.5)),ramp:VERD};
   return {k:TOP*.9,ramp:mud};}
  const k=TOP*(.97+.12*(v.id-.5)+.06*(tn(x,y,708,16,16,3)-.5));
  // Nassglanz: nur etwa jeder dritte Stein spiegelt deutlich (sonst flirrt der Boden in Spielgröße)
  return {k,ramp:stones[Math.floor(v.id*7)%3],spec:hash3(Math.floor(v.id*1e6),3,716)>.66?.55:.1};};
 return {f:heightField(h),mat:custom('basaltpflaster','#3c4148',tex,{spec:.5,shine:40}),group:'belag'};
}

// ---------- Hilfsformen für Deko ----------
/** Drehkörper aus einem Umriss in (r,z) – der Umriss muss die Achse (r=0) einschließen. */
const revolve=(poly,round=0)=>(x,y,z)=>polyDist(poly,Math.hypot(x,y),z)-round;
/** Flache Scheibe aus einem 2D-Abstand d2(x,y) zwischen z0 und z1, Kanten gerundet (r). */
const slab=(d2,z0,z1,r=0)=>(x,y,z)=>{const a=d2(x,y)+r,b=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+r;
 return Math.min(Math.max(a,b),0)+Math.hypot(Math.max(a,0),Math.max(b,0))-r;};
/** 2D-Ellipse (Näherung). */
const ell2=(cx,cy,a,b)=>(x,y)=>(Math.hypot((x-cx)/a,(y-cy)/b)-1)*Math.min(a,b);
/** 2D-Glatte Vereinigung. */
const smin2=(k,...fs)=>(x,y)=>{let d=fs[0](x,y);for(let i=1;i<fs.length;i++){const b=fs[i](x,y),hh=clamp(.5+.5*(b-d)/k,0,1);d=mix(b,d,hh)-k*hh*(1-hh);}return d;};
/** Abstand zu einem 2D-Polygonzug (offen). */
function line2(pts){return (px,py)=>{let d=1e9;for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i],ex=bx-ax,ey=by-ay,wx=px-ax,wy=py-ay,
 t=clamp((wx*ex+wy*ey)/(ex*ex+ey*ey),0,1);d=Math.min(d,Math.hypot(wx-ex*t,wy-ey*t));}return d;};}
/** Prisma aus einem Umriss in (y,z), entlang x von −hx bis hx, Kanten gerundet. */
const extrudeYZ=(poly,hx,r=0,cx=0)=>(x,y,z)=>{const d2=polyDist(poly,y,z)+r,dx=Math.abs(x-cx)-hx+r;
 return Math.min(Math.max(d2,dx),0)+Math.hypot(Math.max(d2,0),Math.max(dx,0))-r;};
/** Glas mit Glanzstreifen auf der Lichtseite (die Spiegelung allein trifft senkrechte Flächen nicht; Vorbild wandschmuck.mjs). */
const shinyGlass=(base,{k=1}={})=>custom('glas',base,(u,v,w,n)=>({k:n&&n[0]<-.3&&n[0]>-.8&&n[1]>.2?1.7:k}),{spec:1.1,shine:60,glass:true});
/** Kunststoff mit feiner Körnung. */
const plasticMat=(base,{spec=.3,shine=20,grain=.06}={})=>custom('kunststoff',base,(u,v,w)=>({k:1-grain/2+grain*fbm3(u*1.8,v*1.8,w*1.8,2)}),{spec,shine});

// ---------- Bodendeko (von oben) ----------
/** Ölfleck auf Estrich: schwarz-braune Lache aus mehreren Ausläufern und Tropfen, eingezogener brauner Rand,
 *  fleckweise Regenbogenschimmer am Rand (Bänder ≥ 0,5 E, damit sie bei 2–3 px je E lesbar bleiben). */
function oelfleck(){
 const main=smin2(1.4,ell2(-2.2,.2,6.2,3.4),ell2(3.4,-.5,4.4,2.9),ell2(-7.0,1.2,2.3,1.8),ell2(7.2,1.3,1.9,1.4),ell2(.8,2.4,2.5,1.5));
 const drops=[[-9.2,-3.3,.85,.7],[9.1,-3.2,.7,.6],[4.9,4.5,.62,.52],[-4.6,-4.6,.58,.5]];
 const d2=(x,y)=>{let d=main(x,y)+.8*(fbm3(x*.32+4,y*.32,1,3)-.42);for(const [cx,cy,a,b] of drops)d=Math.min(d,ell2(cx,cy,a,b)(x,y));return d;};
 const OIL=rampFrom('#2a2420'),SOAK=rampFrom('#3d3530'),SHEEN=rampFrom('#4a4a52'),IRIS=[rampFrom('#6a5a3a'),rampFrom('#6a4a50'),rampFrom('#3e5a78'),rampFrom('#3e6252')];
 const oil=custom('oel','#2a2420',(u,v)=>{const e=-d2(u,v);
  if(e<.3)return {k:.7,ramp:SOAK};
  // Regenbogenschimmer: nur fleckweise am Rand, Bänder je 0,55 E (dünnster Film außen: Gold → Rosa → Blau → Grün)
  if(e<1.5&&fbm3(u*.22+9,v*.22,2,2)>.42){const band=Math.floor((e-.3)*1.8+.5*fbm3(u*.4,v*.4,7,2));if(band<4)return {k:.58,ramp:IRIS[band]};}
  // Spiegelung der Deckenlampe: ein weicher, grauer Glanzfleck oben links in der Lache (liest sich als Flüssigkeit)
  const gl=Math.hypot((u+3.6)/2.6,(v+.9)/1.1)+.35*fbm3(u*.6,v*.6,5,2);
  if(gl<.75)return {k:gl<.45?.8:.7,ramp:SHEEN};
  return {k:.6+.08*(fbm3(u*.5,v*.5,3,2)-.4),ramp:OIL};},{spec:.45,shine:34});
 return {solids:[{f:slab(d2,0,.12,.05),mat:oil,group:'oel'}]};}

/** Goldlackierte Kronkorken: sechs Stück verstreut, Krone mit zehn Zacken (Rand gewellt, Rippen am Kragen), zwei liegen
 *  verkehrt herum (Einlage sichtbar), einer ist beim Öffnen verbogen. Stark vergrößert (echt 0,4 E), sonst unlesbar. */
function kronkorken(){
 const Z=10,GOLD=rampFrom('#b88a2e'),LINER=rampFrom('#9a978c');
 const R=a=>1.12+.16*Math.abs(frac(a*Z/TAU)-.5)*2;
 const up=(x,y,z)=>{const r=Math.hypot(x,y),a=Math.atan2(y,x),hz=r<.8?.62:.62-(r-.8)*1.05+.07*Math.cos(Z*a);return Math.max(r-R(a),(z-hz)*.7,-z);};
 const down=(x,y,z)=>{const r=Math.hypot(x,y),a=Math.atan2(y,x),hz=r>.92?.6+.06*Math.cos(Z*a):.2;return Math.max(r-R(a),(z-hz)*.7,-z);};
 const lack=custom('lack','#b88a2e',(u,v,w)=>({k:.95+.1*fbm3(u*3,v*3,w*3,2),ramp:GOLD}),{spec:.8,shine:26});
 const inner=custom('lack','#b88a2e',(u,v,w)=>Math.hypot(u,v)<.9?{k:.82+.08*fbm3(u*3,v*3,0,2),ramp:LINER,spec:.1}:{k:.95,ramp:GOLD},{spec:.8,shine:26});
 const caps=[[-4.1,-1.7,.2,up,0],[-1.3,1.8,1.1,up,0],[1.4,-1.6,.6,down,0],[4.2,1.0,2.0,up,.42],[-4.3,2.15,.9,down,0],[1.6,2.3,.3,up,0]];
 return {solids:caps.map(([px,py,a,f,tilt],i)=>{const c=Math.cos(a),s=Math.sin(a);
  const ft=tilt?rotY(tilt,f):f,g=rotZ(a,tilt?(x,y,z)=>ft(x,y,z-.35):f);
  return {f:at(px,py,0,g),mat:f===down?inner:lack,group:'k'+i,tex:(x,y,z)=>{const dx=x-px,dy=y-py;return [c*dx+s*dy,-s*dx+c*dy,z];}};})};}

// ---------- Tischdeko (schräg) ----------
/** Filterkaffeemaschine: schwarzes Gehäuse (Sockel mit Warmhalteplatte, Wassertank hinten, Filterkopf oben),
 *  Glaskanne mit Kaffee (unten dunkel, oben leer), schwarzer Deckelkragen und Griff rechts, rote Betriebslampe, Wasserstandsfenster. */
function kaffeemaschine(){
 const black=plasticMat('#2b2a2e',{spec:.35,shine:22}),cx=-.35,cy=.62;
 const kanne=at(cx,cy,0,revolve([[0,.55],[1.02,.55],[1.24,.95],[1.3,1.7],[1.16,2.7],[.93,3.25],[.93,3.9],[0,3.9]],.05));
 return {solids:[
  {f:block(2.42,1.92,0,.55,.18),mat:black,group:'sockel'},
  {f:at(0,-1.38,0,block(2.42,.54,0,5.3,.25)),mat:black,group:'turm'},
  {f:at(0,-.2,0,block(2.42,1.72,4.85,6.95,.38)),mat:black,group:'kopf'},
  // Zierleiste unten am Filterkopf (Chrom), damit der schwarze Block vorn eine Kante zeigt
  {f:at(0,1.5,5.0,box(2.3,.1,.16,.06)),mat:metal('#9a9c8e',{spec:.8,shine:30}),group:'leiste'},
  {f:at(1.85,-.8,2.9,box(.26,.12,1.45,.08)),mat:shinyGlass('#8aa8b4'),group:'fenster'},
  {f:intersect(kanne,(x,y,z)=>z-2.35),mat:shinyGlass('#3a2012',{k:.9}),group:'kanne'},
  {f:intersect(kanne,(x,y,z)=>2.35-z),mat:shinyGlass('#5e7072'),group:'kanne'},
  {f:at(cx,cy,0,cylZ(1.02,3.15,3.98,.14)),mat:black,group:'deckel'},
  {f:(x,y,z)=>Math.max(Math.hypot(Math.hypot(x-(cx+1.22),z-2.3)-.72,y-cy)-.24,(cx+1.15)-x),mat:black,group:'griff'},
  {f:at(1.7,1.9,.3,ellipsoid(.34,.16,.2)),mat:glow(['#5a1a0c','#a3341a','#c3522b','#e0662a','#f7a64a']),glow:.62,group:'lampe',noShadow:true},
 ]};}

/** Faxgerät: beiges Keilgehäuse, Hörer links in der Mulde, Tastenfeld mit Anzeige rechts, leere Blätter im Einzug hinten,
 *  ein ausgegebenes Blatt hängt vorn über die Kante (ohne Schrift). */
function faxgeraet(){
 const zTop=y=>1.35+(2.2-y)*.27;// Oberseite: vorn 1,35 E, hinten 2,35 E
 const prof=[[2.45,0],[2.45,1.15],[2.2,1.35],[-1.5,2.35],[-2.8,2.35],[-2.8,0]];
 const PANEL=rampFrom('#4e4d4d'),KEY=rampFrom('#b9b8a4'),LCD=rampFrom('#7a785c'),SLOT=rampFrom('#3c3a44');
 const housing=custom('kunststoff','#c9bfa6',(u,v,w)=>{
  const top=w>zTop(v)-.12&&v>-1.5&&v<2.2;
  if(top&&u>1.25&&u<3.1&&v>.2&&v<2.0){const a=frac((u-1.25)/.62),b=frac((v-.2)/.6);return a>.18&&a<.82&&b>.2&&b<.8?{k:.9,ramp:KEY}:{k:.85,ramp:PANEL};}
  if(top&&u>1.25&&u<3.1&&v>-.75&&v<-.05)return u>1.45&&u<2.9&&v>-.6&&v<-.2?{k:.95,ramp:LCD}:{k:.85,ramp:PANEL};
  if(top&&u>-1.7&&u<1.0&&Math.abs(v-.15)<.16)return {k:.7,ramp:SLOT};
  return {k:.93+.06*fbm3(u*1.5,v*1.5,w*1.5,2)};},{spec:.3,shine:20});
 const handset=plasticMat('#8e877a',{spec:.35,shine:22});
 const hz=y=>zTop(y)+.42,hx=-2.45;
 const sheet=paper('#ece6d4');
 // Ausgabeblatt: dünnes Band im (y,z)-Schnitt, liegt auf der Oberseite und fällt vorn über die Kante
 const outLine=line2([[.3,zTop(.3)+.08],[2.15,zTop(2.15)+.08],[2.5,1.2],[2.62,.75],[2.56,.4]]);
 return {solids:[
  {f:extrudeYZ(prof,3.3,.18),mat:housing,group:'gehaeuse'},
  {f:union(capsule([hx,1.45,hz(1.45)],[hx,-.6,hz(-.6)],.36),at(hx,1.75,hz(1.75),ellipsoid(.62,.58,.42)),at(hx,-.95,hz(-.95),ellipsoid(.62,.58,.42))),mat:handset,group:'hoerer'},
  {f:(x,y,z)=>Math.max(outLine(y,z)-.07,Math.abs(x+.3)-1.05),mat:sheet,group:'blatt'},
  {f:at(.4,-2.3,3.05,rotX(-.35,box(2.0,.1,.95,.04))),mat:sheet,group:'einzug'},
  {f:at(.4,-2.62,2.85,rotX(-.35,box(2.35,.12,.75,.06))),mat:plasticMat('#b8ae96'),group:'stuetze'},
 ]};}

/** Duftstäbchen: eckiger Glasflakon mit Duftöl (unten farbig, oben klar), Messingkragen, cremefarbenes Etikett (ohne Schrift),
 *  fünf Rattanstäbchen fächern nach oben auf (Spitzen ≥ 0,7 E auseinander, damit die Lücken in der Schrägsicht bleiben). */
function duftstaebchen(){
 const bottle=smoothUnion(.3,block(.95,.95,0,2.3,.35),cylZ(.42,1.8,2.95,.08));
 const tips=[[-1.25,-.3,5.8],[-.42,.5,6.9],[.45,-.6,6.3],[1.25,.35,7.2]];
 return {solids:[
  {f:intersect(bottle,(x,y,z)=>z-1.85),mat:shinyGlass('#9a5f50',{k:.95}),group:'flakon'},
  {f:intersect(bottle,(x,y,z)=>1.85-z),mat:shinyGlass('#6e8284'),group:'flakon'},
  {f:at(0,.98,.95,box(.55,.05,.36,.03)),mat:paper('#e4dcc3'),group:'etikett'},
  {f:cylZ(.5,2.62,3.05,.1),mat:metal('#b09040',{spec:.7,shine:30}),group:'kragen'},
  ...tips.map((t,i)=>({f:capsule([t[0]*.14,t[1]*.14,2.7],t,.23),mat:wood('#86643c',{axis:'z',seed:i}),group:'stab'+i})),
 ]};}

export const MODELS={
 // Beläge (Kachel 64×64 E, von oben, nahtlos)
 'partykeller-fliesen':floor(partyTiles),
 laminat:floor(laminate),
 'teppich-buero':floor(officeCarpet),
 'basalt-quader':floor(basaltSlabs),
 'basalt-pflaster':floor(basaltCobbles),
 // Bodendeko (von oben)
 oelfleck:{build:oelfleck},
 'kronkorken-gold':{build:kronkorken},
 // Tischdeko (schräg)
 kaffeemaschine:{build:kaffeemaschine},
 faxgeraet:{build:faxgeraet},
 duftstaebchen:{build:duftstaebchen},
};
