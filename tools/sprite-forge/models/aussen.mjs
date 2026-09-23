// Sprite-Schmiede · Gruppe „aussen“: Hof-Möbel (schräge Ansicht) und die beiden Treppen-Arten (von oben, gestreckt).
// Koordinaten: Standfläche mittig um (0,0), x Ost, y Süd (Vorderkante bei +h/2), z ab Boden. Maße aus content/sprite-kit.js.
// Treppen: Die Laufzeit streckt sie per drawKitFill in ein festes Rechteck (treppe-holz 18×56, treppenloch 18×60 E),
// deshalb Ansicht `top` mit eigenen Maßen. Beim Treppenloch wird die Tiefe per Scherung (Höhe → Norden) sichtbar gemacht,
// damit man wie in der Schrägsicht des Spiels die Stufen hinab und das Geländer aufrecht sieht.
import {block,box,cylZ,capsule,roundCone,at,union,subtract,intersect,mirrorX,ellipsoid,torusZ,rotX,clamp,fbm3} from '../sdf.mjs';
import {wood,metal,glass,custom,rampFrom} from '../materials.mjs';

const TAU=Math.PI*2;
/** Material mit zusätzlicher Helligkeit je Ort (Textur-Koordinaten u,v,w): für Steigung und Tiefe der Treppen. */
const graded=(mat,fn)=>({...mat,tex:(u,v,w,n)=>{const r=mat.tex(u,v,w,n)||{k:1};return {...r,k:r.k*fn(u,v,w,n)};}});
/** Speichen als polare Wiederholung in der x-z-Ebene (Rad steht quer zur Kamera): n Speichen von r0 bis r1, Stärke rad. */
const spokes=(n,r0,r1,rad)=>(x,y,z)=>{const st=TAU/n,k=Math.round(Math.atan2(z,x)/st)*st,c=Math.cos(k),s=Math.sin(k);
 const px=x*c+z*s,pz=-x*s+z*c,qx=clamp(px,r0,r1);return Math.hypot(px-qx,pz,y)-rad;};
/** Ring, der in der x-z-Ebene steht (Achse entlang y): Reifen, Felgen, Schutzbleche. */
const ringY=(R,r)=>rotX(Math.PI/2,torusZ(R,r));
/** Scheibe/Zylinder mit Achse entlang y (Nabe, Kettenblatt). */
const discY=(rad,hy,r=0)=>rotX(Math.PI/2,cylZ(rad,-hy,hy,r));

// ---------- Materialien ----------
const benchWood=wood('#8a5a30',{axis:'x',seed:2}),castIron=metal('#2c3531',{rust:.2,shine:18,spec:.35});
const mossRamp=rampFrom('#6f7a3a'),dirtRamp=rampFrom('#8a8468');
/** Verwitterter weißer Gartenkunststoff mit Moos- und Schmutzflecken. */
const gardenPlastic=custom('kunststoff','#e8e5d8',(u,v,w)=>{const m=fbm3(u*.32+3,v*.32,w*.32,4);
 if(m>.7)return {k:.95,ramp:mossRamp,spec:.04};if(m>.65)return {k:.97,ramp:dirtRamp,spec:.08};return {k:.94+.08*fbm3(u*.8,v*.8,w*.8,2)};},{spec:.3,shine:18});
/** Blauer Tonnenkunststoff: leicht fleckig, unten verschmutzt. */
const barrelPlastic=custom('kunststoff','#2f5c96',(u,v,w)=>{let k=.9+.16*fbm3(u*.45,v*.45,w*.3,3);if(w<2.2)k*=.84+.07*w;return {k};},{spec:.35,shine:22});
const brass=metal('#a0702e',{shine:30,spec:.7,rust:.15});
// Wasser: dunkel (k klein), Glanz nur auf den Wellenflanken.
const water={...glass('#24485a'),spec:1.6,shine:11,tex:()=>({k:.78})};
/** Rotbrauner Kastenkunststoff mit Kratzern. */
const cratePlastic=custom('kunststoff','#8e4424',(u,v,w)=>({k:.88+.2*fbm3(u*.5,v*.5,w*.5,3)-(fbm3(u*2.2,v*2.2,w*2.2,2)>.74?.1:0)}),{spec:.25,shine:16});
const crateInside=custom('kunststoff','#4a2216',()=>({k:.45}),{spec:0,shine:4});
const bottleBrown=glass('#5b3417'),bottleGreen=glass('#2e5a3a'),capMetal=metal('#b8a878',{shine:30,spec:.6});
const bikeFrame=metal('#6c3620',{rust:.6,shine:20,spec:.4}),chrome=metal('#8f8b84',{shine:40,spec:.8,rust:.2});
const rubber=custom('gummi','#2b2729',(u,v,w)=>({k:.9+.15*fbm3(u*.8,v*.8,w*.8,2)}),{spec:.2,shine:12}),saddleLeather=custom('leder','#2e2a2c',(u,v,w)=>({k:.88+.2*fbm3(u*.7,v*.7,w*.7,3)}),{spec:.35,shine:18});

// ---------- Hof-Möbel (schräge Ansicht) ----------
function bierbank(){
 const sx=12.3,slat=(y,z,hy,hz)=>at(0,y,z,box(13.6,hy,hz,.2));
 return {solids:[
  // Sitz aus drei Latten, Lehne aus zwei Latten (obere weiter zurückgelehnt)
  {f:union(slat(2.65,5.5,.72,.32),slat(.8,5.5,.72,.32),slat(-1.05,5.5,.72,.32)),mat:benchWood,group:'sitz'},
  {f:union(slat(-2.85,7.5,.3,.82),slat(-3.25,9.4,.3,.82)),mat:benchWood,group:'lehne'},
  // Gusseiserne Seitenteile: Vorderbein, Hinterbein mit Lehnenholm, Sitzträger, Füße
  {f:mirrorX(union(
   capsule([sx,3.2,.35],[sx,2.9,5.1],.45),
   capsule([sx,-2.3,.35],[sx,-2.75,5.1],.42),capsule([sx,-2.75,5.1],[sx,-3.35,10.1],.4),
   capsule([sx,3.35,5.05],[sx,-2.8,5.05],.38),
   at(sx,3.2,.3,ellipsoid(.75,.7,.35)),at(sx,-2.3,.3,ellipsoid(.75,.7,.35)))),mat:castIron,group:'eisen'},
  // Schraubenköpfe auf Sitz- und Lehnenlatten
  {f:mirrorX(union(...[2.65,.8,-1.05].map(y=>at(sx,y,5.84,ellipsoid(.34,.34,.16))),at(sx,-2.52,7.5,ellipsoid(.32,.18,.32)),at(sx,-2.92,9.4,ellipsoid(.32,.18,.32)))),mat:castIron,group:'schrauben'},
 ]};}

function gartenstuhl(){
 // Lehne: gewölbt (Mitte vorn), nach hinten geneigt, oben gerundet; fünf senkrechte Schlitze.
 const backY=(x,z)=>-2.85-.03*x*x-.05*Math.max(0,z-5.6);
 const back=(x,y,z)=>{const d=(Math.abs(y-backY(x,z))-.36)*.85,top=z-(12-.12*x*x),bot=5.4-z,side=Math.abs(x)-3.45;return Math.max(d,top,bot,side);};
 const slots=union(...[-2.2,-1.1,0,1.1,2.2].map(x=>at(x,-3.2,9.1,box(.26,1.2,1.9-.1*Math.abs(x),.22))));
 return {solids:[
  {f:union(at(0,.15,5.45,box(3.4,3.15,.34,.3)),capsule([-3.1,3.2,5.35],[3.1,3.2,5.35],.46)),mat:gardenPlastic,group:'sitz'},
  {f:subtract(back,slots),mat:gardenPlastic,group:'lehne'},
  {f:mirrorX(union(roundCone([3.3,3.3,0],[3.05,2.85,5.2],.45,.62),roundCone([3.3,-3.35,0],[3.05,-2.8,5.2],.45,.62))),mat:gardenPlastic,group:'beine'},
  {f:mirrorX(union(capsule([3.42,3.05,5.5],[3.42,2.65,7.7],.42),capsule([3.42,2.65,7.7],[3.42,-2.95,8.3],.42))),mat:gardenPlastic,group:'armlehne'},
 ]};}

/** Regentonne ohne Deckel: blaue Tonne mit zwei Rippen, Messinghahn, Wasser mit Ringwellen (nahtlose Schleife über t). */
function regentonne(t){
 const top=15.4,rad=z=>3.95+.42*Math.sin(Math.PI*clamp(z/top,0,1));
 const shellOut=(x,y,z)=>{const d=(Math.hypot(x,y)-rad(z))*.9,dz=Math.abs(z-top/2)-top/2;return Math.min(Math.max(d,dz),0)+Math.hypot(Math.max(d,0),Math.max(dz,0));};
 const wz=14.3,ph=TAU*t;
 // Ringwellen von einem Tropfenpunkt aus, dazu ein schwacher Querschwapp – beide ganzzahlig in t, also nahtlos.
 const wave=(x,y)=>{const r=Math.hypot(x+.9,y+.6);const r2=Math.hypot(x-1.4,y-.9);return .12*Math.sin(3.4*r-ph)*Math.exp(-r*.3)+.06*Math.sin(4.2*r2-2*ph)*Math.exp(-r2*.45)+.03*Math.sin(1.6*x+1.1*y+ph);};
 const surf=(x,y,z)=>(z-wz-wave(x,y))*.7;
 return {solids:[
  {f:subtract(union(shellOut,at(0,0,top,torusZ(rad(top)-.15,.42))),cylZ(3.62,1.2,20)),mat:barrelPlastic,group:'tonne'},
  {f:union(at(0,0,4.8,torusZ(rad(4.8)+.02,.3)),at(0,0,10.6,torusZ(rad(10.6)+.02,.3))),mat:barrelPlastic,group:'rippen'},
  {f:intersect(cylZ(3.75,12,15.2),surf),mat:water,tex:(x,y,z)=>[x,y,z-wz],group:'wasser'},
  // Hahn vorn unten
  {f:union(capsule([0,3.9,2.8],[0,4.75,2.8],.36),capsule([0,4.75,2.8],[0,4.75,1.85],.3),at(0,4.55,3.35,box(.7,.18,.22,.1))),mat:brass,group:'hahn'},
 ]};}

/** Ein Getränkekasten mit Griffschlitz; offen oben, optional mit Fächern. */
function crate(cx,cy,z0,open){const H=6.6,hx=7.1,hy=5.1;
 let f=union(at(cx,cy,z0+H/2,box(hx,hy,H/2,.35)),at(cx,cy,z0+H-.5,box(hx+.14,hy+.14,.5,.25)),at(cx,cy,z0+.45,box(hx+.08,hy+.08,.45,.25)));
 f=subtract(f,at(cx,cy,z0+H/2+.7,box(hx-.55,hy-.55,H/2,.15)),
  at(cx,cy+hy,z0+H-1.75,box(2.1,1,.6,.55)),                      // Griffschlitz vorn
  at(cx-3.5,cy+hy,z0+2.5,box(1.5,.7,.65,.45)),at(cx+3.5,cy+hy,z0+2.5,box(1.5,.7,.65,.45))); // Durchbrüche unten
 if(open){const dv=union(...[-3.1,0,3.1].map(x=>at(cx+x,cy,z0+H/2,box(.22,hy-.4,H/2-.9))),...[-1.55,1.55].map(y=>at(cx,cy+y,z0+H/2,box(hx-.4,.22,H/2-.9))));f=union(f,dv);}
 return f;}
function kistenstapel(){
 const c=[[0,.25,0],[.5,-.2,6.6],[-.45,.15,13.2]],[tx,ty,tz]=c[2];
 const bottle=(x,y,col)=>({f:at(tx+x,ty+y,0,union(cylZ(1.05,tz+.7,tz+6,.45),roundCone([0,0,tz+5.6],[0,0,tz+8.3],1,.44))),mat:col,group:'flasche'});
 const bottles=[[-4.65,-1.55],[-1.55,-1.55],[4.65,-1.55],[1.55,0],[-4.65,1.55],[1.55,1.55]].map(([x,y],i)=>bottle(x,y*1.8,i===3?bottleGreen:bottleBrown));
 return {solids:[
  ...c.map(([x,y,z],i)=>({f:crate(x,y,z,i===2),mat:cratePlastic,group:'kasten'+i})),
  // Dunkles Inneres der unteren Kästen (durch Griffschlitz und Durchbrüche sichtbar)
  {f:union(...c.slice(0,2).map(([x,y,z])=>at(x,y,z+3.5,box(6.3,4.3,2.6)))),mat:crateInside,group:'innen'},
  ...bottles,
  {f:union(...[[-4.65,-2.79],[-1.55,-2.79],[4.65,-2.79],[1.55,0],[-4.65,2.79],[1.55,2.79]].map(([x,y])=>at(tx+x,ty+y,tz+8.75,cylZ(.52,-.3,.3,.12)))),mat:capMetal,group:'kronkorken'},
 ]};}

/** Altes Damenrad, quer zur Kamera (Seitenansicht über die schräge Kamera). */
function fahrrad(){
 const RW=[-6.4,0,4.5],FW=[6.4,0,4.5],B=[-.8,0,3.5],S=[-2.9,0,9.4],H1=[4.3,0,10.1],H2=[4.95,0,8.1],tr=.42;
 const wheel=([x,,z])=>at(x,0,z,ringY(4,.5)),rim=([x,,z])=>at(x,0,z,union(ringY(3.5,.2),discY(.5,.55,.15))),spk=([x,,z])=>at(x,0,z,spokes(12,.5,3.4,.13));
 // Schutzblech: Bogen über dem Rad, nur der obere Teil
 const fender=([x,,z])=>intersect(at(x,0,z,rotX(Math.PI/2,(p,q,r)=>Math.max(Math.abs(Math.hypot(p,q)-4.75)-.22,Math.abs(r)-.5))),(px,py,pz)=>z+2.3-pz);
 return {solids:[
  {f:union(wheel(RW),wheel(FW)),mat:rubber,group:'reifen'},
  {f:union(rim(RW),rim(FW)),mat:chrome,group:'felge'},
  {f:union(spk(RW),spk(FW)),mat:chrome,group:'speichen'},
  {f:union(fender(RW),fender(FW)),mat:bikeFrame,group:'blech'},
  // Rahmen: tiefer Einstieg (zwei Rohre), Sitzrohr, Streben, Gabel, Steuerrohr
  {f:union(capsule(H2,[1.4,0,4.6],tr),capsule([1.4,0,4.6],B,tr),capsule([4.5,0,9.3],[-2.6,0,7.4],tr*.9),capsule(B,S,tr),
   capsule(B,RW,tr*.8),capsule(S,RW,tr*.8),capsule(H1,H2,tr*1.25),capsule(H2,FW,tr*.85)),mat:bikeFrame,group:'rahmen'},
  // Gepäckträger mit Streben
  {f:union(...[-.8,0,.8].map(y=>capsule([-3.6,y,9.6],[-8.9,y,9.6],.17)),capsule([-8.9,-.8,9.5],[-8.9,.8,9.5],.2),capsule([-8.8,.9,9.4],[-6.4,.9,4.5],.2),capsule([-8.8,-.9,9.4],[-6.4,-.9,4.5],.2)),mat:bikeFrame,group:'traeger'},
  // Kettenschutz, Kettenblatt, Kurbeln, Pedale, Ständer
  {f:intersect(capsule([-.4,1,3.5],[-5.6,1,4.35],.8),(x,y,z)=>Math.abs(y-1)-.18),mat:bikeFrame,group:'kette'},
  {f:union(capsule([-.8,1.5,3.5],[.4,1.5,1.4],.28),at(.55,2.1,1.35,box(.85,.5,.25,.1)),capsule([-.8,-1.5,3.5],[-2,-1.5,5.6],.28),at(-2.15,-2.1,5.7,box(.85,.5,.25,.1))),mat:castIron,group:'kurbel'},
  {f:capsule([-2.4,.6,4.1],[-3.3,2.3,.25],.22),mat:chrome,group:'staender'},
  // Sattel, Sattelstütze, Lenker, Lampe
  {f:union(at(-3.15,0,10.95,ellipsoid(1.9,1.05,.55)),at(-3.9,0,10.75,ellipsoid(1.1,1.35,.5))),mat:saddleLeather,group:'sattel'},
  {f:union(capsule(S,[-3.05,0,10.5],.25),capsule(H1,[4,0,11.5],.3),capsule([4,0,11.5],[3.3,2.3,11.8],.25),capsule([4,0,11.5],[3.3,-2.3,11.8],.25)),mat:chrome,group:'lenker'},
  {f:union(capsule([3.3,2.3,11.8],[2.5,2.55,11.8],.34),capsule([3.3,-2.3,11.8],[2.5,-2.55,11.8],.34)),mat:rubber,group:'griffe'},
  {f:union(capsule([5.15,0,9.75],[5.9,0,9.75],.55),at(5.95,0,9.75,ellipsoid(.25,.5,.5))),mat:chrome,group:'lampe'},
 ]};}

// ---------- Treppen (Ansicht von oben mit Scherung, von der Laufzeit gestreckt) ----------
// Beide Sprites zeigen DIESELBE Treppe in Hauskoordinaten (x Ost, y Süd, z ab Erdgeschossboden; content/bude-house.js:
// stairs x 4–22, y 104–156). 13 Steigungen à 2,4 E (31,2 E), Auftritt 4 E, Antritt unten bei y≈155, oben der Austritt
// bündig mit dem Obergeschoss. Die Höhe wird wie in der Schrägsicht per Scherung sichtbar: wahre Höhe z über dem eigenen
// Geschossboden erscheint um SH·z nach Norden. SH = 15/31,2 passt zur Hub-Mechanik der Laufzeit (Held auf der Treppe um
// 15·(156−y)/52 E angehoben): die Trittfläche unter dem Fuß erscheint dort, wo der angehobene Held steht.
const STAIR={SH:15/31.2,N:13,D:4,R:2.4,y0:154.9,xl:5.2,xr:19.9,xe:20.7,xc:12.55,run:3.3,floor:31.2};
const stepY=i=>STAIR.y0-STAIR.D*i,stepZ=i=>STAIR.R*(i+1);            // Vorderkante der Setzstufe i, Höhe ihrer Trittfläche
const stepAt=y=>clamp(Math.floor((STAIR.y0+.7-y)/STAIR.D),0,STAIR.N-1); // Stufe unter der Stelle y
const lineZ=y=>STAIR.R+STAIR.R/STAIR.D*(STAIR.y0-y);                  // Linie über die Stufenkanten (Wangen, Handlauf)
const railZ=y=>lineZ(y)+12.5;
/** Trittfläche lesbar machen: Stufenkante (Stirnseite) hell, nach hinten zur Kehle dunkler. y wahr, n Normale im Bild. */
const treadShade=(y,n)=>{if(n&&n[1]>.45&&n[2]<.85)return 1.14;const i=stepAt(y),t=clamp((stepY(i)+NOSE-y)/STAIR.D,0,1);return 1.12-.4*t*t;};
const stairWood=wood('#b27a40',{axis:'x',seed:4}),riserWood=wood('#6a3f22',{axis:'x',seed:9}),frameWood=wood('#7a4a28',{axis:'y',seed:7}),
 railWood=wood('#5e321a',{axis:'y',seed:1}),postWood=wood('#7c4824',{axis:'z',seed:3}),darkWood=wood('#4a3020',{axis:'x',seed:5});
const goldRamp=rampFrom('#c8a052'),brassEdge=metal('#b08a3a',{shine:34,spec:.9,rust:.05});
/** Läufer: dunkelroter Wollstoff mit goldener Borte an beiden Rändern; senkrechte Teile (über die Stufenkante) dunkler. */
const runnerCloth=custom('stoff','#8a2a22',(u,v,w,n)=>{const e=Math.abs(u-STAIR.xc);
 const k=(.93+.1*fbm3(u*.6,v*.6,w*.6,3))*(n&&n[2]<.9?.8:1);return e>2.45&&e<2.95?{k:k*1.05,ramp:goldRamp}:{k};},{spec:.03,shine:4});
/** Abgerundetes Rechteck in x/y (Eckradius rc), in z von z0 bis z1 extrudiert. */
const roundRect=(x0,x1,y0,y1,rc,z0,z1)=>(x,y,z)=>{const cx=(x0+x1)/2,cy=(y0+y1)/2,qx=Math.abs(x-cx)-(x1-x0)/2+rc,qy=Math.abs(y-cy)-(y1-y0)/2+rc;
 const d2=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rc,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2;
 return Math.min(Math.max(d2,dz),0)+Math.hypot(Math.max(d2,0),Math.max(dz,0));};
/** Achsparalleler Quader von Ecke zu Ecke (Hauskoordinaten), Kanten mit Radius r gerundet. */
const cuboid=(x0,x1,y0,y1,z0,z1,r=0)=>at((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,box((x1-x0)/2,(y1-y0)/2,(z1-z0)/2,r));
/** Teil je Stufe; ausgewertet nur für die Stufen um y (sie liegen 4 E auseinander, Nachbarn genügen). */
const perStep=part=>{const parts=Array.from({length:STAIR.N},(_,i)=>part(i));
 return (x,y,z)=>{const k=stepAt(y);let d=Infinity;for(let i=Math.max(0,k-1);i<=Math.min(STAIR.N-1,k+1);i++){const v=parts[i](x,y,z);if(v<d)d=v;}return d;};};

// Trittstufen: knapper Überstand nach Süden, damit die Setzstufe darunter als dunkles Band sichtbar bleibt, hinten unter die nächste Setzstufe geschoben.
// Stufe 0 ist die Antrittsstufe: breiter, im Südosten um den Antrittspfosten gerundet. Stufe 12 ist der Austritt (Geschossboden).
const NOSE=.15,THICK=.6;
const tread=i=>i===0?roundRect(STAIR.xl-.4,21.85,stepY(0)-STAIR.D-.3,stepY(0)+NOSE,2.1,stepZ(0)-THICK,stepZ(0))
 :i===STAIR.N-1?cuboid(STAIR.xl-.4,STAIR.xr+.4,102.9,stepY(i)+NOSE,stepZ(i)-2.4,stepZ(i),.25)
 :cuboid(STAIR.xl-.4,STAIR.xr+.4,stepY(i)-STAIR.D-.3,stepY(i)+NOSE,stepZ(i)-THICK,stepZ(i),.25);
const riser=i=>i===0?roundRect(STAIR.xl-.4,21.2,stepY(0)-STAIR.D+.4,stepY(0),1.6,0,stepZ(0)-THICK+.05)
 :cuboid(STAIR.xl-.4,STAIR.xr+.4,stepY(i)-.7,stepY(i),stepZ(i)-STAIR.R-.1,stepZ(i)-THICK+.05);
// Läufer: liegt auf der Trittfläche und fällt über die Stufenkante senkrecht bis auf die Stufe darunter.
const runner=i=>{const a=STAIR.xc-STAIR.run,b=STAIR.xc+STAIR.run,yf=stepY(i)+NOSE;
 return union(cuboid(a,b,i===STAIR.N-1?stepY(i)-2.6:stepY(i)-STAIR.D,yf+.3,stepZ(i),stepZ(i)+.3,.12),cuboid(a,b,yf,yf+.32,i?stepZ(i)-STAIR.R:0,stepZ(i)+.3,.12));};
/** Wange entlang der Treppe (Mitte xc, halbe Stärke hw), Oberkante `over` über der Kantenlinie, von y0 bis y1. */
const stringer=(xc,hw,over,y0,y1)=>{const s=Math.hypot(1,STAIR.R/STAIR.D);
 return (x,y,z)=>Math.max(Math.abs(x-xc)-hw,(z-lineZ(y)-over)/s,Math.abs(y-(y0+y1)/2)-(y1-y0)/2,-z,z-STAIR.floor-.2);};
/** Pfosten mit Deckplatte, Hals und Kugelkopf (halbe Seite hw, Schaft h über z0). */
const newel=(x,y,z0,h,hw)=>union(at(x,y,0,block(hw,hw,z0-.1,z0+h,.25)),at(x,y,z0+h+.35,box(hw+.25,hw+.25,.35,.15)),
 at(x,y,z0+h+.7,cylZ(hw*.55,0,.7)),at(x,y,z0+h+1.3+hw,ellipsoid(hw*1.05,hw*1.05,hw*1.05)));
/** Gedrechselte Docke von z0 bis z1. */
const baluster=(x,y,z0,z1)=>{const m=(z0+z1)/2;return union(at(x,y,0,cylZ(.36,z0,z1)),at(x,y,m-.6,ellipsoid(.8,.8,1.6)),at(x,y,z1-1.4,ellipsoid(.5,.5,.5)),at(x,y,z0+1,ellipsoid(.5,.5,.45)));};

/** Bild → Hauskoordinaten: Bildmitte liegt bei (13, cy), der eigene Geschossboden bei Bild-z zd (der Raycaster sieht von oben
 * nur bis z≈−4), `base` = Höhe dieses Bodens über dem Erdgeschoss. `shear` scheert einen Körper, `tex` liefert wahre Koordinaten. */
function stairView(cy,zd,base){const SH=STAIR.SH,L=Math.hypot(1,SH)+.02,w=(X,Y,Z)=>[X+13,Y+cy+SH*(Z-zd),Z-zd+base];
 return {shear:f=>(X,Y,Z)=>{const [x,y,z]=w(X,Y,Z);return f(x,y,z)/L;},tex:t=>(X,Y,Z)=>{const p=w(X,Y,Z);return t?t(...p):p;}};}

/** Holztreppe im Erdgeschoss: steigt nach Norden, Wange an der Westwand, Ostseite mit Docken, Handlauf, Antritts- und Austrittspfosten,
 * roter Läufer mit Messingstangen, Antrittsstufe breiter und gerundet. Bild 18 × 76 E: Unterkante = Antritt (y 156), oben y 80. */
function treppeHolz(){
 const v=stairView(118,0,0),S=v.shear,top=STAIR.N-1,yNewel=stepY(0)-1.9,yTop=104.6;
 const lit=(u,vv,w)=>.9+.14*clamp(w/STAIR.floor,0,1);                  // oben etwas heller (Licht aus dem Obergeschoss)
 const litT=(u,vv,w,n)=>lit(u,vv,w)*treadShade(vv,n);
 return {solids:[
  {f:S(perStep(tread)),mat:graded(stairWood,litT),tex:v.tex(),group:'tritt'},
  {f:S(perStep(riser)),mat:graded(riserWood,(u,vv,w)=>lit(u,vv,w)*.8),tex:v.tex(),group:'setz'},
  {f:S(perStep(runner)),mat:runnerCloth,tex:v.tex(),group:'laeufer'},
  // Messingkante an der Antrittsstufe: markiert den Einstieg
  {f:S(capsule([STAIR.xl,stepY(0)+NOSE-.12,stepZ(0)-.2],[19.6,stepY(0)+NOSE-.12,stepZ(0)-.2],.32)),mat:brassEdge,tex:v.tex(),group:'kante'},
  // Wechsel: Kante der Obergeschossdecke über dem Austritt
  {f:S(cuboid(4,22,101.2,102.95,27.4,31.6,.2)),mat:darkWood,tex:v.tex(),group:'wechsel'},
  {f:S(stringer(4.6,.6,2.4,103,stepY(0)+.2)),mat:graded(frameWood,lit),tex:v.tex(),group:'wange-w'},
  {f:S(stringer(STAIR.xe,.8,1.2,103,stepY(0)-2)),mat:graded(frameWood,lit),tex:v.tex(),group:'wange-o'},
  {f:S(union(...Array.from({length:11},(_,k)=>{const y=stepY(k+1)-STAIR.D/2;return baluster(STAIR.xe,y,lineZ(y)+1.1,railZ(y)-.5);}))),mat:railWood,tex:v.tex(),group:'docken'},
  {f:S(capsule([STAIR.xe,yNewel-1,railZ(yNewel-1)],[STAIR.xe,yTop+1,railZ(yTop+1)],.75)),mat:railWood,tex:v.tex(),group:'handlauf'},
  {f:S(union(newel(STAIR.xe,yNewel,0,railZ(yNewel)+1.2,1.15),newel(STAIR.xe,yTop,stepZ(top),railZ(yTop)-stepZ(top)+.8,1))),mat:postWood,tex:v.tex(),group:'pfosten'},
 ]};}

/** Treppenloch im Obergeschoss: dieselbe Treppe von oben, nach Süden in die Tiefe; Einfassung ringsum, Brüstung im Norden,
 * Geländer im Osten erst südlich von y 126 (oben im Nordosten ist der Zugang frei) und im Süden. Bild 18 × 62 E (y 94–156). */
function treppenloch(){
 const F=STAIR.floor,v=stairView(125,40,F),S=v.shear;
 // Je tiefer, desto dunkler; zu den Schachtseiten hin zusätzlich verschattet.
 const deep=(u,vv,w)=>{const d=w-F;return d<-.1?clamp(1+d/21,.2,1)*(1-.3*clamp((Math.abs(u-STAIR.xc)-5.5)/2.5,0,1)):1;};
 const zr=F+12,frame=subtract(cuboid(4,22,94,156,F-1.2,F+.25,.15),cuboid(4.8,20.2,102.9,155,F-3,F+2));
 return {solids:[
  {f:S(perStep(tread)),mat:graded(stairWood,(u,vv,w,n)=>deep(u,vv,w)*treadShade(vv,n)),tex:v.tex(),group:'tritt',noShadow:true},
  {f:S(perStep(riser)),mat:graded(riserWood,(u,vv,w)=>deep(u,vv,w)*.8),tex:v.tex(),group:'setz',noShadow:true},
  {f:S(perStep(runner)),mat:graded(runnerCloth,deep),tex:v.tex(),group:'laeufer',noShadow:true},
  {f:S(union(stringer(4.6,.6,2.4,103,stepY(0)+.2),stringer(STAIR.xe,.8,1.2,103,stepY(0)-2))),mat:graded(frameWood,deep),tex:v.tex(),group:'wange',noShadow:true},
  // Boden des Erdgeschosses unter dem Loch (fast schwarz in der Tiefe)
  {f:S(cuboid(4,22,150,200,-1,0)),mat:graded(darkWood,deep),tex:v.tex(),group:'grund',noShadow:true},
  {f:S(frame),mat:frameWood,tex:v.tex(),group:'rahmen'},
  // Brüstung im Norden: Hand- und Fußleiste, Docken
  {f:S(union(cuboid(5,21.2,101.9,103.1,zr-.9,zr,.2),cuboid(5,21.2,102.05,102.95,F+.2,F+1,.15),...[7.7,10.4,13.1,15.8,18.5].map(x=>baluster(x,102.5,F+1,zr-.9)))),mat:railWood,tex:v.tex(),group:'bruestung'},
  // Geländer im Osten (y 126–155) und im Süden
  {f:S(union(cuboid(20.55,21.65,126,155.2,zr-.9,zr,.2),cuboid(5,21.2,154.5,155.6,zr-.9,zr,.2),
   ...[130.3,134.6,138.9,143.2,147.5,151.6].map(y=>baluster(21.1,y,F+.2,zr-.9)),...[8.2,11.4,14.6,17.8].map(x=>baluster(x,155.05,F+.2,zr-.9)))),mat:railWood,tex:v.tex(),group:'gelaender'},
  {f:S(union(newel(5.05,102.5,F,11.4,.8),newel(20.95,102.5,F,11.4,.8),newel(21.1,126,F,11.4,.85),newel(21.1,155.1,F,11.4,.85),newel(5.05,155.1,F,11.4,.8))),mat:postWood,tex:v.tex(),group:'pfosten'},
 ]};}

export const MODELS={
 bierbank:{height:10,build:bierbank},
 gartenstuhl:{height:12,build:gartenstuhl},
 regentonne:{height:16,frames:6,fps:6,build:regentonne},
 'kistenstapel-hof':{height:22,build:kistenstapel},
 fahrrad:{height:14,build:fahrrad},
 // Bildhöhen passend zu paintStairs (bude-house-art.js): Erdgeschoss 52 + 24 E Überstand nach Norden, Obergeschoss 52 + 10 E.
 'treppe-holz':{view:'top',w:18,h:76,build:treppeHolz},
 treppenloch:{view:'top',w:18,h:62,build:treppenloch},
};
