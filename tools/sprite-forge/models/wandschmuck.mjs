// Sprite-Schmiede · Gruppe „wandschmuck“ (Dartscheibe, Bilder, Geweih, Wimpel, Borde, Spiegel, Plakat, Haken, Tafel).
// Koordinaten: Rückseite an der Wand bei y=−1, Vorderseite bis etwa y=+1 (Geweih, Flaschen, Borde ragen bis y≈+3),
// x ∈ ±w/2, z=0 = Unterkante des Schmucks; die Laufzeit hängt ihn auf `mount` über dem Wandfuß.
// Achtung Bildrand: die Unterkante des Bildes liegt bei Bildschirm-y = 0,7 (= h/2·tan35°). Ein Punkt (y,z) bleibt nur
// sichtbar, wenn y·0,7 − z ≤ 0,7 – weit vorragende Teile deshalb nicht in Bodennähe setzen.
// Bildinhalte (Landschaft, Plakat, Baupläne, Scheibe) sind Farbzonen einer eigenen Textur (`painted`), keine Schrift.
import {box,cylZ,capsule,roundCone,ellipsoid,torusZ,extrudeXZ,polyDist,at,rotZ,union,smoothUnion,subtract,intersect,
 mirrorX,fbm3,noise3,hash3,clamp} from '../sdf.mjs';
import {wood,metal,fabric,ceramic,custom,rampFrom} from '../materials.mjs';

const TAU=Math.PI*2;

// ---------- Hilfen ----------
/** Scheibe mit Achse entlang y (Front zum Betrachter) von y0 bis y1, Mitte (0,·,0), Kante gerundet. */
const cylY=(rad,y0,y1,r=0)=>(x,y,z)=>{const dx=Math.hypot(x,z)-rad+r,dy=Math.abs(y-(y0+y1)/2)-(y1-y0)/2+r;
 return Math.min(Math.max(dx,dy),0)+Math.hypot(Math.max(dx,0),Math.max(dy,0))-r;};
/** Kette aus Kapseln durch die Punkte (Schnüre, Stränge). */
const chain=(pts,r)=>union(...pts.slice(1).map((p,i)=>capsule(pts[i],p,r)));
/** Dreiseitiges Prisma in der y-z-Ebene (Winkelstützen unter Borden), Stärke entlang x. Polygon als [y,z]. */
const extrudeYZ=(poly,hx,r=0)=>rotZ(Math.PI/2,extrudeXZ(poly,hx,r));
/** Lage eines bewegten Teils: erst Drehung in der x-z-Ebene (ay), dann Ausschwingen nach vorn (ax>0 = Spitze Richtung +y).
 *  Liefert Welt → Teilkoordinaten; dieselbe Abbildung dient als Textur-Koordinate, damit das Muster mitwandert. */
const pose=(ox,oy,oz,ay=0,ax=0)=>{const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
 return (x,y,z)=>{const X=x-ox,Y=y-oy,Z=z-oz,x1=cy*X-sy*Z,z1=sy*X+cy*Z;return [x1,cx*Y+sx*z1,-sx*Y+cx*z1];};};
const posed=(P,f)=>(x,y,z)=>{const [a,b,c]=P(x,y,z);return f(a,b,c);};
/** Abstand zu einem Rechteck-Umriss (für gezeichnete Linien). */
const rectEdge=(px,pz,x0,z0,x1,z1)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hz=(z1-z0)/2,qx=Math.abs(px-cx)-hx,qz=Math.abs(pz-cz)-hz;
 return Math.abs(Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0));};
const segDist=(px,pz,ax,az,bx,bz)=>{const ex=bx-ax,ez=bz-az,h=clamp(((px-ax)*ex+(pz-az)*ez)/(ex*ex+ez*ez),0,1);return Math.hypot(px-ax-ex*h,pz-az-ez*h);};

// Rampen je Farbe zwischenspeichern: gemalte Flächen wählen je Punkt eine Farbzone.
const RAMPS=new Map();const R=c=>{let r=RAMPS.get(c);if(!r)RAMPS.set(c,r=rampFrom(c));return r;};
/** Gemalte Fläche: fn(u,v,w,n) → Farbe oder [Farbe, Helligkeitsfaktor]. Leichte Pinsel-/Papierkörnung. */
const painted=(name,fn,{grain=.08,spec=.03,shine=4,freq=.9}={})=>custom(name,'#808080',(u,v,w,n)=>{const z=fn(u,v,w,n),[c,k=1]=Array.isArray(z)?z:[z];
 return {k:k*(1-grain/2+grain*fbm3(u*freq,v*freq,w*freq,2)),ramp:R(c)};},{spec,shine});
/** Glas mit senkrechtem Glanzstreifen auf der Lichtseite (die Spiegelung allein trifft senkrechte Flächen nicht). */
const shinyGlass=base=>custom('glas',base,(u,v,w,n)=>({k:n&&n[0]<-.3&&n[0]>-.78&&n[1]>.25?1.7:1}),{spec:1.1,shine:60,glass:true});

const brass=metal('#9a7430',{shine:30,spec:.7}),nailIron=metal('#6a6468',{shine:24,spec:.6}),tin=metal('#a4a8aa',{shine:30,spec:.7});
/** Nagel mit Aufhängeschnur: zwei Schnurschenkel von den Rahmenecken zum Nagel. */
const hanger=(xa,za,zn,group='haken')=>[
 {f:union(capsule([-xa,-.75,za],[0,-.8,zn],.24),capsule([xa,-.75,za],[0,-.8,zn],.24)),mat:fabric('#8a6a44'),group},
 {f:at(0,-.55,zn+.1,ellipsoid(.5,.4,.5)),mat:nailIron,group}];

// ---------- Dartscheibe ----------
const DART={black:'#26242a',cream:'#e6d6a6',red:'#b2322a',green:'#2f7a3a'};
const dartFace=painted('dartscheibe',(x,y,z)=>{const X=x,Z=z-5,r=Math.hypot(X,Z),a=Math.atan2(X,Z),seg=((Math.floor(a/TAU*20+.5)%2)+2)%2;
 if(y<-.1)return DART.black;// Rand der Scheibe
 if(r<.5)return DART.red;if(r<1.05)return DART.green;
 if(r<2.25||(r>2.85&&r<3.5))return seg?DART.black:DART.cream;
 if(r<2.85||r<4.05)return seg?DART.red:DART.green;
 return DART.black;},{grain:.06});
function dart(tip,dir,col,len=2.8){const l=Math.hypot(...dir),d=dir.map(v=>v/l),p=s=>tip.map((v,k)=>v+d[k]*s);
 return [
  {f:roundCone(p(-.1),p(.45),.12,.2),mat:nailIron,group:'pfeil'},
  {f:capsule(p(.45),p(1.5),.32),mat:tin,group:'pfeil'},
  {f:capsule(p(1.5),p(len-.7),.18),mat:nailIron,group:'pfeil'},
  {f:roundCone(p(len-1.2),p(len),.22,.72),mat:custom('kunststoff',col,()=>({k:1.1}),{spec:.4,shine:20}),group:'pfeil'}];}

// ---------- Landschaftsbild ----------
const LAND={sky0:'#4a70a4',sky1:'#6f97c2',sky2:'#c9a878',sky3:'#eec27a',sun:'#fff0b8',cloud:'#dde4ea',mount:'#5d6c8e',mountHi:'#8190ae',
 hill:'#6c9438',hillDk:'#4f7430',meadow:'#5a7a2a',flower:'#d8c050',river:'#4f88b8',riverHi:'#9cc4dc',crown:'#35562a',crownHi:'#5d8c36',
 trunk:'#5a3a20',roof:'#b0402c',wall:'#e0d0b0',tower:'#8a7a6a'};
const landscape=painted('gemaelde',(x,y,z)=>{const X=x,Z=z-1.4;
 // Baum links vorn
 if(X>-3.95&&X<-3.3&&Z>.6&&Z<2.6)return LAND.trunk;
 const c1=Math.hypot((X+3.6)/1.75,(Z-3.2)/1.45),c2=Math.hypot((X+2.5)/1.05,(Z-2.55)/.95),c3=Math.hypot((X+4.6)/.9,(Z-2.5)/.85);
 if(c1<1||c2<1||c3<1)return (X+3.9)*-.55+(Z-3.3)*.85>.2?LAND.crownHi:LAND.crown;
 // Dorf mit Kirchturm in der Mitte
 if(X>1.75&&X<2.35&&Z>2.0&&Z<3.7)return LAND.tower;
 if(Z>=3.7&&Z<4.5&&Math.abs(X-2.05)<(4.5-Z)*.45)return LAND.roof;
 for(const [hx,hw] of [[.5,.55],[1.2,.45],[3.0,.55],[3.8,.45]]){if(Math.abs(X-hx)<hw&&Z>1.95&&Z<2.45)return LAND.wall;
  if(Z>=2.45&&Z<2.95&&Math.abs(X-hx)<hw+.1-(Z-2.45)*1.1)return LAND.roof;}
 // Fluss: schlängelt sich von vorn in die Tiefe, vorn breiter
 if(Z<2.0){const cx=.9+1.1*Math.sin(Z*2.2+.6),bw=.35+(2-Z)*.55;if(Math.abs(X-cx)<bw)return Math.abs(X-cx+bw*.3)<bw*.25?LAND.riverHi:LAND.river;}
 if(Z<.9)return (hash3(Math.floor(X*2.5),Math.floor(Z*2.5),7)>.86)?LAND.flower:LAND.meadow;
 if(Z<1.9+.45*Math.sin(X*.8+1.2))return LAND.hillDk;
 if(Z<2.55+.5*Math.sin(X*.55-.4))return LAND.hill;
 const m=2.9+1.1*Math.max(0,1-Math.abs(X-.2)/2.8)+.5*Math.max(0,1-Math.abs(X+4.2)/1.6);
 if(Z<m)return Z>m-.35&&X>-1?LAND.mountHi:LAND.mount;
 // Himmel mit Abendsonne
 if(Math.hypot(X-3.7,Z-3.95)<.65)return LAND.sun;
 if(Math.hypot((X+.6)/1.7,(Z-5.3)/.38)<1||Math.hypot((X-2.6)/1.1,(Z-5.7)/.3)<1)return LAND.cloud;
 return Z>5.2?LAND.sky0:Z>4.4?LAND.sky1:Z>3.7?LAND.sky2:LAND.sky3;},{grain:.1,freq:1.4});

// ---------- Plakat (Festzelt, Sonnenstrahlen, Wimpel) ----------
const POST={paper:'#e4d2a2',ray:'#86aec8',red:'#b8362a',cream:'#eee0b8',dark:'#3a2a2a',yellow:'#d4a52a',green:'#4a8a3a',flag:'#b8362a',border:'#8a3024'};
const posterPaint=painted('plakat',(x,y,z)=>{const X=x,Z=z;
 const vig=Math.min(4.6-Math.abs(X),Math.min(Z-.3,11.7-Z));
 // Rahmenlinie
 if(vig>.55&&vig<1.05)return POST.border;
 if(vig<=.55)return [POST.paper,.88];
 // Fahne auf der Zeltspitze
 if(Math.abs(X)<.18&&Z>8.3&&Z<9.9)return POST.dark;
 if(Z>9.2&&Z<9.9&&X>.18&&X<1.6-(Math.abs(Z-9.55))*2)return POST.flag;
 // Zeltdach: Dreieck von der Spitze, Streifen fächerförmig
 if(Z<=8.4&&Z>5.4&&Math.abs(X)<(8.4-Z)*1.2){const s=Math.floor(Math.atan2(X,8.4-Z)*4.2+.5);return (s&1)?POST.cream:POST.red;}
 // Zeltwand mit dunklem Eingang
 if(Z<=5.4&&Z>2.9&&Math.abs(X)<3.3){if(Math.abs(X)<(5.0-Z)*.55&&Z<4.6)return POST.dark;return (Math.floor((X+3.3)/1.1)&1)?POST.cream:POST.red;}
 // Wimpelgirlande unten
 if(Z<2.7&&Z>1.4){const k=Math.floor((X+3.6)/1.8),cx=-3.6+k*1.8+.9;if(k>=0&&k<4&&Math.abs(X-cx)<(Z-1.4)*.7)return [POST.red,POST.yellow,POST.green,POST.red][k];}
 // Sonnenstrahlen hinter dem Zelt
 if(Z>5.2){const a=Math.atan2(X,Z-5.2),s=Math.floor(a*3.8+.5);if(s&1)return POST.ray;}
 return POST.paper;},{grain:.12,freq:1.1});

// ---------- Bauplan-Tafel ----------
const PLAN={paper:'#dccca0',line:'#3e4c60',faint:'#8a8e8a'};
const planSheet=painted('bauplan',(x,y,z)=>{const t=.28;// Linienbreite (Halbmaß)
 if(rectEdge(x,z,-4.4,-2.5,4.0,2.5)<t+.05)return PLAN.line;
 if(Math.abs(x-.8)<t&&z>-2.5&&z<2.5&&!(z>-.7&&z<.4))return PLAN.line;
 if(Math.abs(z-.1)<t&&x>-4.4&&x<.8&&!(x>-2.8&&x<-1.7))return PLAN.line;
 if(rectEdge(x,z,1.9,.7,3.3,1.9)<.2)return PLAN.line;
 if(rectEdge(x,z,-2.6,.9,-1.8,1.7)<.2)return PLAN.line;
 if(Math.abs(z+3.05)<.16&&x>-4.4&&x<4.0)return PLAN.faint;
 if(Math.abs(x+4.95)<.16&&z>-2.5&&z<2.5&&(Math.floor(z*1.4)&1))return PLAN.faint;
 for(const tx of [-4.4,.8,4.0])if(Math.abs(x-tx)<.14&&Math.abs(z+3.05)<.45)return PLAN.faint;
 if(Math.abs(x-2.6)<.14&&z>-2.5&&z<.7&&(Math.floor(z*1.6)&1))return PLAN.faint;
 return PLAN.paper;},{grain:.12,freq:1.2});
const noteHouse=painted('notiz',(x,y,z)=>{
 if(rectEdge(x,z,-1.2,-1.4,1.2,.3)<.2||segDist(x,z,-1.55,.3,0,1.45)<.2||segDist(x,z,1.55,.3,0,1.45)<.2||rectEdge(x,z,-.35,-1.4,.35,-.45)<.16)return PLAN.line;
 return PLAN.paper;},{grain:.12,freq:1.2});
const noteBarrel=painted('notiz',(x,y,z)=>{const e1=Math.hypot((x+.8)/.85,(z+.1)/1.05),e2=Math.hypot((x-.85)/.85,(z-.05)/1.05);
 if(Math.abs(e1-1)<.2||Math.abs(e2-1)<.2)return PLAN.line;
 if((e1<1&&Math.abs(Math.abs(z+.1)-.45)<.12)||(e2<1&&Math.abs(Math.abs(z-.05)-.45)<.12))return PLAN.faint;
 return PLAN.paper;},{grain:.12,freq:1.2});
/** Zettel, leicht in der Wandebene gedreht; Textur in Zettel-Koordinaten. */
function note(cx,cz,hx,hz,ang,y,mat,group){const P=pose(cx,y,cz,ang);
 return {f:posed(P,box(hx,.12,hz,.05)),tex:P,mat,group};}
function pin(x,z,y){return {f:at(x,y,z,ellipsoid(.45,.35,.45)),mat:nailIron,group:'nadel'};}

// ---------- Spiegel ----------
function archPoly(hw,z0,zs,ah,n=14){const p=[[-hw,z0],[hw,z0],[hw,zs]];
 for(let i=1;i<n;i++){const a=i/n*Math.PI,x=hw*Math.cos(a),z=zs+ah*Math.sin(a);p.push([x,z]);}p.push([-hw,zs]);return p;}
const mirrorGlass=painted('spiegel',(x,y,z)=>{const d=x*.75+z*.55,f=d*.2-Math.floor(d*.2),edge=Math.min(2.5-Math.abs(x),z-1.2);
 if(edge<.35)return ['#5f7884',1];
 if((f>.08&&f<.2)||(f>.3&&f<.35))return ['#dfe9ec',1];
 return z<3.4?'#8aa2ae':'#a6bcc6';},{grain:.06,spec:.3,shine:30});

// ---------- Jacken ----------
function coat(cx,y,col,group,buttons=false){
 // Körper: oben schmal (hängt an der Kapuzenschlaufe), abfallende Schultern, unten leicht ausgestellt, Saum ungleich
 const body=at(cx,y,0,extrudeXZ([[-.9,9.7],[.9,9.7],[1.5,8.9],[2.15,7.9],[2.2,4.5],[2.5,1.1],[1.3,.75],[.2,1.0],[-1.1,.7],[-2.5,1.05],[-2.2,4.5],[-2.15,7.9],[-1.5,8.9]],.55,.45));
 const hood=at(cx,y+.1,8.9,ellipsoid(1.3,.8,1.4));
 const mat=(dim)=>custom('stoff',col,(u,v,w)=>{const X=u-cx;let k=dim*(.92+.12*Math.sin(X*2.6+.6*Math.sin(w*.7))+.12*(fbm3(u*.6,v*.6,w*.6,3)-.5));
  if(Math.abs(X-.1)<.14&&w<7.6)k*=.62;// Vorderkante / Verschluss
  if(w>8.2&&w<8.5&&Math.abs(X)<1.1)k*=.75;// Kapuzensaum
  return {k};},{spec:.03,shine:4});
 const out=[{f:smoothUnion(.4,body,hood),mat:mat(1),group},
  // Ärmel als eigene Körper: runde Schattierung, Falte zum Körper, Bündchen unten dunkler
  {f:at(cx,y+.5,0,mirrorX(roundCone([1.85,0,7.7],[2.2,0,2.9],.62,.7))),mat:mat(.9),group}];
 if(buttons)out.push({f:union(...[7.0,5.5,4.0,2.5].map(z=>at(cx+.5,y+.72,z,ellipsoid(.32,.22,.32)))),mat:brass,group:group+'-knopf'});
 return out;}

// ---------- Flaschen, Gläser, Dosen ----------
function bottle(x,y,z0,{r=.9,body=4,neck=2.2,col='#2e5a3a',label='#d8c490',mark='#9a2e24'}){const zs=z0+body,zn=zs+1+neck;
 const glassF=smoothUnion(.3,cylZ(r,z0,zs,.25),roundCone([0,0,zs-.1],[0,0,zs+1.1],r*.95,.38),cylZ(.38,zs+.6,zn));
 const lab=painted('etikett',(u,v,w)=>Math.hypot(u-x,w-(z0+body*.52))<.36?mark:label,{grain:.1});
 return [
  {f:at(x,y,0,glassF),mat:shinyGlass(col),group:'flasche'+x},
  {f:at(x,y,0,cylZ(.46,zn-.15,zn+.55,.12)),mat:wood('#b08a58',{axis:'z'}),group:'flasche'+x},
  {f:at(x,y,0,intersect(cylZ(r+.06,z0+body*.28,z0+body*.76),(X,Y)=>-Y+.1)),mat:lab,group:'flasche'+x}];}
function mug(x,y,z0,h=2.2,r=.95){return [{f:at(x,y,0,union(subtract(cylZ(r,z0,z0+h,.12),cylZ(r-.22,z0+.35,z0+h+1)),
  chain([[r-.1,0,z0+h-.4],[r+.7,0,z0+h-.55],[r+.7,0,z0+.7],[r-.1,0,z0+.55]],.2))),mat:tin,group:'becher'+x}];}
// Efeublatt: spitz nach unten (hängend), flach, nach vorn gekippt, damit die Fläche Licht fängt.
const LEAF=[[0,-.8],[.45,-.2],[.55,.25],[.25,.5],[0,.35],[-.25,.5],[-.55,.25],[-.45,-.2]];
/** Blattwerk aus einzelnen Blättern an festen Stellen [x,y,z,Größe]. Die Textur sucht das getroffene Blatt, dunkelt
 *  seinen Rand ab (Blattumriss bleibt im Laub lesbar) und wechselt hell/dunkel je Blatt (Tiefe). */
function foliage(leaves,group){
 const parts=leaves.map(([lx,ly,lz,s],i)=>{const P=pose(lx,ly,lz,(hash3(i,7,3)-.5)*1.6,.45+.3*hash3(i,1,5)),poly=LEAF.map(([a,b])=>[a*s*1.55,b*s*1.55]),shape=extrudeXZ(poly,.1,.05);
  return {c:[lx,ly,lz],r:s*1.35,P,poly,f:(x,y,z)=>{const [a,b,c]=P(x,y,z);return shape(a,b,c);}};});
 const f=(x,y,z)=>{let d=1e9;for(const p of parts){const b=Math.hypot(x-p.c[0],y-p.c[1],z-p.c[2])-p.r;if(b>=d)continue;const v=b>.5?b:p.f(x,y,z);if(v<d)d=v;}return d;};
 const mat=custom('laub','#4a7a30',(u,v,w)=>{let best=1e9,id=0;for(let i=0;i<parts.length;i++){const d=Math.abs(parts[i].f(u,v,w));if(d<best){best=d;id=i;}}
  const p=parts[id],[a,,c]=p.P(u,v,w),e=-polyDist(p.poly,a,c),vein=Math.abs(a)<.12&&c<.3;
  let k=(hash3(id,3,9)>.5?1.1:.88)*(e<.26?.6:1)*(vein?.78:1);
  return {k,ramp:hash3(id,5,1)>.65?R('#6a9a3a'):R('#44722c')};},{spec:.25,shine:16});
 return {f,mat,group};}

// ---------- Wandbord (Brett + Winkelstützen) ----------
function shelf(hw,bx,col){const board=wood(col,{axis:'x'}),br=wood('#5a3a20',{axis:'z'});
 return [
  {f:at(0,.7,2.0,box(hw,1.7,.42,.12)),mat:board,group:'brett'},
  {f:mirrorX(at(bx,0,0,extrudeYZ([[-1,1.62],[1.7,1.62],[1.7,1.2],[-.3,-.05],[-1,-.05]],.42,.08))),mat:br,group:'stuetze'}];}

export const MODELS={
 dartscheibe:{height:10,build(){
  return {solids:[
   {f:at(0,0,5,cylY(4.75,-1,0,.2)),mat:dartFace,group:'scheibe'},
   {f:at(0,0,5,subtract(cylY(4.8,-.9,.3,.25),cylY(4.1,-3,3))),mat:custom('rand',DART.black,(u,v,w)=>({k:.85+.2*fbm3(u,v,w,2)}),{spec:.2,shine:12}),group:'rand'},
   ...dart([-1.4,0,6.6],[-.7,.8,.9],'#c2342a',2.6),
   ...dart([1.9,0,4.6],[.95,.7,.55],'#3a8a3e',2.4),
   ...dart([-1.3,0,3.0],[-.8,.75,-.25],'#3a64b0',2.5),
  ]};}},

 'bild-landschaft':{height:9,build(){const gold=metal('#a8802e',{shine:34,spec:.75});
  return {solids:[
   {f:subtract(at(0,-.25,4.5,box(6.9,.75,4.3,.3)),at(0,0,4.5,box(5.75,2,3.15,.1))),mat:gold,group:'rahmen'},
   // innere Perlleiste und Eckzier
   {f:subtract(at(0,.2,4.5,box(6.1,.45,3.5,.2)),at(0,0,4.5,box(5.75,2,3.15,.1))),mat:metal('#7a5a22',{shine:20,spec:.5}),group:'rahmen'},
   {f:union(...[[-6.4,.75],[6.4,.75],[-6.4,8.25],[6.4,8.25]].map(([x,z])=>at(x,.35,z,ellipsoid(.95,.5,.95)))),mat:gold,group:'zier'},
   {f:at(0,-.55,4.5,box(5.85,.35,3.25)),mat:landscape,group:'bild'},
   ...hanger(3.2,8.6,9.9),
  ]};}},

 geweih:{height:8,build(){const bone=ceramic('#e6dcc4'),antler=custom('geweih','#b89868',(u,v,w)=>({k:.86+.28*fbm3(u*1.3,v*1.3,w*1.3,3)}),{spec:.15,shine:10});
  const shield=[[-2.5,6.0],[-1.4,6.5],[0,6.6],[1.4,6.5],[2.5,6.0],[2.7,3.3],[1.8,1.2],[0,.15],[-1.8,1.2],[-2.7,3.3]];
  // Stange mit Enden: Hauptstange schwingt nach außen und oben, drei Enden nach oben
  const beam=[[.9,1.1,5.3],[2.3,1.35,5.7],[3.6,1.2,6.3],[4.7,1,7.5],[5.35,.8,8.9],[5.0,.6,10.3]];
  const antlerR=union(
   ...beam.slice(1).map((p,i)=>roundCone(beam[i],p,.58-i*.06,.52-i*.06)),
   roundCone([1.8,1.3,5.6],[1.4,2.4,7.0],.36,.25),// Augsprosse nach vorn
   roundCone([3.1,1.3,6.0],[2.5,1.2,8.2],.36,.26),// Enden leicht nach innen
   roundCone([4.3,1.1,7.0],[3.7,1,9.3],.34,.25),
   roundCone([5.2,.9,8.4],[5.75,.8,9.7],.3,.22));
  return {solids:[
   {f:at(0,-.55,0,extrudeXZ(shield,.45,.25)),mat:wood('#6e4428',{axis:'z'}),group:'schild'},
   {f:at(0,-.05,0,extrudeXZ(shield.map(([x,z])=>[x*.8,1+(z-1)*.84]),.2,.15)),mat:wood('#8a5a32',{axis:'z'}),group:'schild'},
   {f:smoothUnion(.5,at(0,1.1,3.8,ellipsoid(1.25,1.0,1.45)),roundCone([0,1.4,3.5],[0,2.0,1.8],.95,.5)),mat:bone,group:'schaedel'},
   {f:union(mirrorX(at(.6,1.9,3.9,ellipsoid(.4,.3,.36))),mirrorX(at(.22,2.3,1.85,ellipsoid(.2,.2,.24)))),mat:custom('hoehle','#2f2a2e',()=>({k:.7})),group:'augen'},
   {f:mirrorX(antlerR),mat:antler,group:'geweih'},
   // Rosen: Wulst am Ansatz jeder Stange
   {f:mirrorX(at(.95,1.1,5.1,ellipsoid(.7,.6,.6))),mat:antler,group:'geweih'},
  ]};}},

 wimpelkette:{frames:6,fps:6,height:5,build(t){
  const ph=TAU*t,span=19.2,sag=1.35+.12*Math.sin(ph),zTop=4.45;
  const sz=x=>zTop-sag*(1-(x/span)**2),sy=x=>.05+.3*(1-(x/span)**2)*(.5+.5*Math.sin(ph+.6));
  const rope=chain(Array.from({length:17},(_,i)=>{const x=-span+i*span*2/16;return [x,sy(x),sz(x)];}),.3);
  const cols=['#b83a2e','#d4a52a','#3a62a8','#4a8a3a'],solids=[{f:rope,mat:fabric('#a88452',{weave:2.4}),group:'schnur'}];
  const tri=[[-1.75,0],[1.75,0],[0,-2.85]];
  // Wimpelstoff: ruhige Fläche (feines Gewebe flimmert in Spielgröße), dunklerer Saum an den Schrägkanten
  const flag=cols.map(c=>custom('stoff',c,(u,v,w)=>({k:(-polyDist(tri,u,w)<.3&&w<-.3?.8:1)*(.95+.1*fbm3(u*.7,v*.7,w*.7,2))}),{spec:.04,shine:4}));
  for(let i=0;i<8;i++){const x=-16.6+i*4.75,slope=Math.atan(sag*2*x/(span*span));
   const P=pose(x,sy(x)+.05,sz(x)-.12,slope+.12*Math.sin(ph+i*1.1),.28+.2*Math.sin(ph+i*.95+1));
   solids.push({f:posed(P,extrudeXZ(tri,.12,.06)),tex:P,mat:flag[i%4],group:'wimpel'+i});}
  solids.push({f:mirrorX(at(span,-.5,zTop,ellipsoid(.55,.5,.55))),mat:nailIron,group:'nagel'});
  return {solids};}},

 flaschenbord:{height:11,build(){
  const G='#2e5a3a',BR='#6a3a1a';
  const B=[[-15.2,{col:G}],[-12.75,{col:G,body:3.6}],[-10.3,{col:G,r:1.0}],[-7.85,{col:BR,body:2.8,neck:1.4,r:.85}],
   [-5.4,{col:G,body:3.2}],[-2.95,{col:G,body:4.2,mark:'#2a4a8a'}],[-.5,{col:BR,body:4}],[1.95,{col:G,body:3.6}]];
  // Efeu: kleiner Busch im Topf, drei Ranken hängen über die Brettkante (fest verteilte Blätter, kein Zufall)
  const leaves=[[13.6,.5,6.1,1.1],[12.3,.9,5.2,1.0],[14.9,.8,5.4,1.0],[13.5,1.5,4.4,.95],[15.6,1.6,4.0,.9],[11.6,1.6,3.9,.9]];
  for(let s=0;s<3;s++){const x0=11.7+s*1.95;for(let k=0;k<4;k++)
   leaves.push([x0+(k&1?.5:-.4)+hash3(s,k,2)*.3,Math.min(2.5,1.9+k*.3),Math.max(3.3-k*.62,1.75),.85-k*.04]);}
  return {solids:[
   ...shelf(16.8,12.5,'#6d4527'),
   ...B.flatMap(([x,o])=>bottle(x,.6,2.42,o)),
   ...mug(4.9,.6,2.42),...mug(7.5,.6,2.42,2.0,.9),
   {f:at(13.6,.3,0,cylZ(1.3,2.42,4.3,.2)),mat:ceramic('#6a4a34'),group:'topf'},
   ...[0,1,2].map(j=>foliage(leaves.filter((_,i)=>i%3===j),'laub'+j)),
  ]};}},

 spiegel:{height:10,build(){const outer=archPoly(3.3,.3,7.9,1.9),inner=archPoly(2.5,1.2,7.9,1.25);
  return {solids:[
   {f:subtract(at(0,-.45,0,extrudeXZ(outer,.55,.25)),at(0,0,0,extrudeXZ(inner,2))),mat:wood('#6a4226',{axis:'z'}),group:'rahmen'},
   {f:at(0,.15,0,subtract(extrudeXZ(archPoly(2.85,.75,7.9,1.6),.1,.05),extrudeXZ(inner,1))),mat:wood('#8a5a32',{axis:'z'}),group:'rahmen'},
   {f:at(0,-.65,0,extrudeXZ(inner,.2)),mat:mirrorGlass,group:'glas'},
   ...hanger(1.6,9.2,10.3).slice(1),
  ]};}},

 plakat:{height:12,build(){
  // Leicht unregelmäßiger Papierrand (fester Hash, kein Zufall)
  const poly=[];const J=(i,k)=>(hash3(i,k,11)-.5)*.35;
  for(let i=0;i<=8;i++)poly.push([-4.6+i*9.2/8,.3+J(i,1)]);
  for(let i=1;i<=10;i++)poly.push([4.6+J(i,2),.3+i*11.4/10]);
  for(let i=1;i<=8;i++)poly.push([4.6-i*9.2/8,11.7+J(i,3)]);
  for(let i=1;i<10;i++)poly.push([-4.6+J(i,4),11.7-i*11.4/10]);
  const sheet=extrudeXZ(poly,.14,.04);
  return {solids:[
   {f:(x,y,z)=>sheet(x,y+.72-.1*Math.sin(z*.9)*Math.sin(x*.5+1),z),mat:posterPaint,group:'papier'},
   ...[[-4.0,11.1],[4.0,11.1],[-4.0,.9],[4.0,.9]].map(([x,z])=>pin(x,z,-.45)),
  ]};}},

 hakenleiste:{height:12,build(){const hooks=[-5,.2,5.4];
  return {solids:[
   {f:at(0,-.55,10.3,box(7.8,.45,1.1,.25)),mat:wood('#6a4a2a',{axis:'x'}),group:'leiste'},
   {f:union(...hooks.map(x=>chain([[x,-.2,10.3],[x,.9,10.1],[x,1.3,10.9]],.26))),mat:tin,group:'haken'},
   {f:union(...hooks.map(x=>at(x,1.35,11.0,ellipsoid(.36,.36,.36)))),mat:tin,group:'haken'},
   {f:union(...[-7.1,7.1].map(x=>at(x,-.08,10.3,ellipsoid(.36,.2,.36)))),mat:nailIron,group:'schraube'},
   ...coat(-5,.25,'#55602f','jacke1'),
   ...coat(.2,.55,'#8a4424','jacke2',true),
  ]};}},

 'bauplan-tafel':{height:11,build(){const frameW=wood('#6a4428',{axis:'x'});
  return {solids:[
   {f:subtract(at(0,-.4,5.5,box(11.8,.6,5.2,.25)),at(0,0,5.5,box(10.7,2,4.1,.1))),mat:frameW,group:'rahmen'},
   {f:at(0,-.75,5.5,box(10.9,.25,4.3)),mat:custom('tafel','#2f3a36',(u,v,w)=>({k:.88+.2*fbm3(u*.5,v*.5,w*.5,3)}),{spec:.05,shine:6}),group:'tafel'},
   note(-4.3,5.5,5.5,3.5,.02,-.38,planSheet,'plan'),
   note(5.6,7.3,2.6,1.9,-.09,-.36,noteHouse,'zettel1'),
   note(5.2,3.5,2.4,1.85,.07,-.34,noteBarrel,'zettel2'),
   pin(-9.3,8.5,-.2),pin(.7,8.5,-.2),pin(-9.3,2.5,-.2),pin(.7,2.5,-.2),pin(5.6,8.9,-.18),pin(5.2,5.0,-.16),
   ...hanger(4,10.6,11.9),
  ]};}},

 regalbrett:{height:8,build(){const z0=2.42;
  const pickles=custom('gurken','#4f7a2e',(u,v,w,n)=>{const c=noise3(u*1.6,v*1.6,w*.9);let k=c>.55?1.15:c<.35?.72:.95;
   if(w>z0+3.1)return {k:1,ramp:R('#a8b8a0')};if(n&&n[0]<-.3&&n[0]>-.75&&n[1]>.25)k*=1.45;return {k};},{spec:.5,shine:40});
  const berries=custom('beeren','#b8302a',(u,v,w,n)=>{const a=Math.atan2(u+3.9,v-.55)*1.5,cz=w*1.5,fa=a-Math.floor(a),fz=cz-Math.floor(cz),d=Math.hypot(fa-.5,fz-.5);
   let k=1.15-d*1.1;if(w>z0+2.7)return {k:1,ramp:R('#b8b0a8')};if(n&&n[0]<-.3&&n[0]>-.75&&n[1]>.25)k*=1.35;return {k};},{spec:.5,shine:40});
  const cloth=custom('tuch','#dccca0',(u,v,w)=>{const c=(Math.floor(u*2.2)+Math.floor(v*2.2)+Math.floor(w*2.2))&1;return {k:c?1:.92,ramp:c?R('#dccca0'):R('#b04a3a')};});
  return {solids:[
   ...shelf(9.8,7.4,'#7a5a3a'),
   {f:at(-7.2,.55,0,cylZ(1.45,z0,z0+3.5,.4)),mat:pickles,group:'glas1'},
   {f:at(-7.2,.55,0,cylZ(1.5,z0+3.4,z0+3.95,.15)),mat:tin,group:'glas1'},
   {f:at(-3.9,.55,0,cylZ(1.3,z0,z0+3.1,.4)),mat:berries,group:'glas2'},
   {f:at(-3.9,.55,0,cylZ(1.36,z0+3.0,z0+3.5,.15)),mat:brass,group:'glas2'},
   {f:at(-.8,.55,0,cylZ(1.3,z0,z0+2.4,.3)),mat:custom('marmelade','#6a3418',(u,v,w,n)=>({k:n&&n[0]<-.3&&n[0]>-.75&&n[1]>.25?1.35:1}),{spec:.5,shine:40}),group:'glas3'},
   {f:at(-.8,.55,0,smoothUnion(.3,cylZ(1.55,z0+2.2,z0+2.7,.2),subtract(cylZ(1.5,z0+1.5,z0+2.4,.1),cylZ(1.3,z0,z0+3)))),mat:cloth,group:'tuch'},
   {f:at(-.8,.55,z0+2.0,torusZ(1.55,.18)),mat:fabric('#5a3a20'),group:'tuch'},
   {f:at(2.9,.55,0,union(smoothUnion(.6,cylZ(1.55,z0,z0+2.6,.6),roundCone([0,0,z0+2.2],[0,0,z0+4.0],1.3,.55),cylZ(.5,z0+3.6,z0+4.7,.15)),
     chain([[.9,0,z0+3.6],[1.95,0,z0+3.3],[2.0,0,z0+2.2],[1.4,0,z0+1.6]],.28))),
    mat:custom('krug','#d8c49a',(u,v,w)=>({k:.95+.08*fbm3(u,v,w,2),ramp:w>z0+3.5?R('#7a5230'):R('#d8c49a')}),{spec:.45,shine:30}),group:'krug'},
   {f:at(2.9,.55,0,cylZ(.42,z0+4.6,z0+5.1,.1)),mat:wood('#b08a58'),group:'krug'},
   ...[[6.6,z0],[8.6,z0],[7.6,z0+1.85]].map(([x,z],i)=>({f:at(x,.55,0,cylZ(.95,z,z+1.8,.12)),
    mat:custom('dose','#a4a8aa',(u,v,w,n)=>{const f=(w-z)*2.2-Math.floor((w-z)*2.2);let k=.9+.2*fbm3(u*.9,v*.9,w*.9,2);if(f<.18)k*=.75;if(n&&n[0]<-.3&&n[0]>-.8&&n[1]>.2)k*=1.3;return {k};},{spec:.7,shine:30}),group:'dose'+i})),
  ]};}},
};
