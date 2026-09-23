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

// ---------- Treppen (Ansicht von oben, von der Laufzeit gestreckt) ----------
const stairWood=wood('#a0703a',{axis:'x',seed:4}),frameWood=wood('#7a5230',{axis:'y',seed:7}),railWood=wood('#8a5a2c',{axis:'y',seed:1});

/** Holztreppe: 13 Stufen, steigt nach Norden (−y); links Wange, rechts Wange mit Handlauf und zwei Pfosten. */
function treppeHolz(){
 const N=13,yS=27.6,yN=-24,D=(yS-yN)/N,R=2.4,xl=-7.25,xr=5.75;
 const topAt=y=>R*clamp((yS-y)/D,0,N);                // Stufenhöhe unter y (Rampe für Wangen und Handlauf)
 // Nach oben (Norden) heller; gerundete Stufenkante vorn (Normale nach Süden) als Lichtkante, hintere Rundung dunkler.
 const light=(u,v,w,n)=>(.58+.5*clamp((yS-v)/(yS-yN),0,1))*(n&&n[2]<.93?(n[1]>.2?1.24:n[1]<-.2?.74:1):1);
 const steps=[];
 for(let i=0;i<N;i++){const yc=yS-D*(i+.5),zt=R*(i+1),cx=(xl+xr)/2,hx=(xr-xl)/2+.15;
  steps.push({f:at(cx,yc,0,block(hx,D/2+.03,0,zt,.38)),mat:graded(stairWood,light),tex:(x,y,z)=>[x+i*6.1,y,z],group:'stufe'+(i%2),b:[cx,yc,zt/2,Math.hypot(hx,D/2,zt/2)+.3]});}
 const slope=Math.hypot(1,R/D);
 const stringer=(xc,hw,rise)=>(x,y,z)=>Math.max(Math.abs(x-xc)-hw,(z-topAt(y)-rise)/slope,Math.abs(y-(yS+yN)/2+.1)-(yS-yN)/2-.1,-z);
 const railZ=y=>topAt(y)+12;
 return {solids:[
  ...steps,
  // Austritt oben (Streifen nördlich der Stufen)
  {f:at(-1.5,-25.85,0,block(7.25,1.9,0,R*N+1.2,.35)),mat:graded(stairWood,light),tex:(x,y,z)=>[x+3.3,y,z],group:'austritt'},
  {f:stringer(-8,.75,1.3),mat:graded(railWood,light),group:'wange'},
  {f:stringer(7.25,1.2,1.1),mat:graded(railWood,light),group:'wange'},
  {f:capsule([7.25,23.6,railZ(23.6)],[7.25,-23.4,railZ(-23.4)],.8),mat:graded(railWood,light),group:'handlauf'},
  {f:union(at(7.25,25.6,0,block(1.05,1.05,0,railZ(25.6)+1,.2)),at(7.25,25.6,railZ(25.6)+2,ellipsoid(1.25,1.25,1.25)),
   at(7.25,-25.8,0,block(1.05,1.05,0,railZ(-25.8)+1,.2)),at(7.25,-25.8,railZ(-25.8)+2,ellipsoid(1.25,1.25,1.25))),mat:graded(railWood,light),group:'pfosten'},
 ]};}

/** Treppenloch im Obergeschoss: Rahmen ringsum, Brüstung im Norden, Geländer im Osten (Nordost bleibt als Zugang frei),
 * darunter die obersten Stufen, die nach Süden in die Tiefe führen. Scherung: wahre Höhe z erscheint um SH·z nach Norden. */
function treppenloch(){
 // Der Raycaster sieht von oben nur bis z≈−4: das Obergeschoss liegt deshalb bei z=Z0, gebaut wird relativ dazu.
 const SH=.5,Z0=40,shear=f=>(x,y,z)=>f(x,y+SH*(z-Z0),z-Z0)/1.25,trueTex=(x,y,z)=>[x,y+SH*(z-Z0),z-Z0];
 // Je tiefer, desto dunkler; Setzstufen (Normale nach Süden gekippt) dunkler als Trittflächen; Seiten des Schachts verschattet.
 const deep=(u,v,w,n)=>(w<0?clamp(1+w/24,.25,1):1)*(n&&n[1]>.5?.7:1)*(w<-.5?1-.4*clamp((Math.abs(u)-4.2)/3,0,1):1);
 const hx=7.2,yN=-22,yS=28.3,R=2.4,D=4;
 const steps=[];
 for(let i=0;i<11;i++){const yc=yN+D*(i+.5),zt=-R*(i+1);
  steps.push({f:shear(at(0,yc,0,block(8,D/2+.03,zt-6,zt,.3))),mat:graded(stairWood,(u,v,w,n)=>deep(u-i*6.1,v,w,n)),tex:(x,y,z)=>{const [a,b,c]=trueTex(x,y,z);return [a+i*6.1,b,c];},group:'stufe'+(i%2),noShadow:true});}
 const frame=subtract(at(0,0,-.3,box(8.75,29.75,.9,.2)),at(0,(yN+yS)/2,0,box(hx,(yS-yN)/2,3)));
 const baluster=(x,y)=>union(at(x,y,0,cylZ(.36,.6,10)),at(x,y,4.6,ellipsoid(.62,.62,1.7)),at(x,y,8.4,ellipsoid(.5,.5,.6)));
 return {solids:[
  ...steps,
  {f:shear(at(0,yN-.5,-2,box(8,.5,2.2))),mat:graded(frameWood,deep),tex:trueTex,group:'schacht'},
  {f:shear(frame),mat:frameWood,tex:trueTex,group:'rahmen'},
  // Brüstung im Norden: Pfosten mit Kugel, Docken, Hand- und Fußleiste
  {f:shear(union(at(0,-23,10.2,box(7.7,.55,.45,.2)),at(0,-23,1.05,box(7.7,.45,.4,.15)),...[-5.1,-2.55,0,2.55,5.1].map(x=>baluster(x,-23)))),mat:railWood,tex:trueTex,group:'bruestung'},
  {f:shear(union(at(-7.9,-23,0,block(.75,.75,0,10.6,.15)),at(-7.9,-23,11.3,ellipsoid(.8,.8,.8)),at(7.9,-23,0,block(.75,.75,0,10.6,.15)),at(7.9,-23,11.3,ellipsoid(.8,.8,.8)))),mat:railWood,tex:trueTex,group:'pfosten'},
  // Geländer im Osten (Süden bis Mitte), Nordost frei als Zugang zur obersten Stufe
  {f:shear(union(capsule([7.95,-5.5,10.2],[7.95,28.4,10.2],.55),...[-2.4,1.8,6,10.2,14.4,18.6,22.8].map(y=>at(7.95,y,0,cylZ(.34,.6,10))),at(7.95,28.4,1,box(.5,.5,.4)))),mat:railWood,tex:trueTex,group:'gelaender'},
  {f:shear(union(at(7.95,-6,0,block(.75,.75,0,10.6,.15)),at(7.95,-6,11.3,ellipsoid(.8,.8,.8)),at(7.95,28.6,0,block(.75,.75,0,10.6,.15)),at(7.95,28.6,11.3,ellipsoid(.8,.8,.8)))),mat:railWood,tex:trueTex,group:'pfosten'},
 ]};}

export const MODELS={
 bierbank:{height:10,build:bierbank},
 gartenstuhl:{height:12,build:gartenstuhl},
 regentonne:{height:16,frames:6,fps:6,build:regentonne},
 'kistenstapel-hof':{height:22,build:kistenstapel},
 fahrrad:{height:14,build:fahrrad},
 'treppe-holz':{view:'top',w:18,h:56,build:treppeHolz},
 treppenloch:{view:'top',w:18,h:60,build:treppenloch},
};
