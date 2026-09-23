// Sprite-Schmiede · Gruppe „deko“: Tischdeko (schräge Ansicht, steht auf Tischen) und Bodendeko (Ansicht von oben, flach).
// Koordinaten wie referenz.mjs: Standfläche mittig um (0,0), x Ost, y Süd, z ab Boden. Maße aus content/sprite-kit.js.
// Tischdeko ist nur 2–4 E breit (8–16 px): wenige kräftige Formen, 2–3 Farbtöne, Glanz bei Glas.
// Bodendeko liegt flach (Höhe ≤ 1 E); die Kontur zeichnet der Renderer selbst, deshalb ≥ 0,25 E Rand zur Standfläche lassen.
import {box,block,cylZ,capsule,at,union,subtract,intersect,smoothUnion,rotZ,rotX,rotY,roundCone,ellipsoid,polyDist,clamp,mix,fbm3,noise3} from '../sdf.mjs';
import {wood,metal,glow,ceramic,glass,paper,fabric,stone,plastic,custom,rampFrom,hex} from '../materials.mjs';
import {flicker} from './referenz.mjs';

const TAU=Math.PI*2;
const frac=v=>v-Math.floor(v);

// ---------- Hilfsformen ----------
/** Drehkörper aus einem Umriss in (r,z) – der Umriss muss die Achse (r=0) einschließen. `round` rundet die Kanten. */
const revolve=(poly,round=0)=>(x,y,z)=>polyDist(poly,Math.hypot(x,y),z)-round;
/** Flache Scheibe aus einem 2D-Abstand d2(x,y) zwischen z0 und z1, Kanten gerundet (r). */
const slab=(d2,z0,z1,r=0)=>(x,y,z)=>{const a=d2(x,y)+r,b=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+r;
 return Math.min(Math.max(a,b),0)+Math.hypot(Math.max(a,0),Math.max(b,0))-r;};
/** 2D-Ellipse (Näherung, reicht für Pfützen und Umrisse). */
const ell2=(cx,cy,a,b)=>(x,y)=>(Math.hypot((x-cx)/a,(y-cy)/b)-1)*Math.min(a,b);
/** 2D-Glatte Vereinigung. */
const smin2=(k,...fs)=>(x,y)=>{let d=fs[0](x,y);for(let i=1;i<fs.length;i++){const b=fs[i](x,y),h=clamp(.5+.5*(b-d)/k,0,1);d=mix(b,d,h)-k*h*(1-h);}return d;};
/** Röhre entlang eines Polygonzugs (Liste von [x,y,z]) mit Radius r – als Kette von Kapseln, mit Hüllkugel für Tempo. */
function tube(pts,r){const segs=[];for(let i=1;i<pts.length;i++)segs.push(capsule(pts[i-1],pts[i],r));
 return (x,y,z)=>{let d=Infinity;for(const s of segs){const v=s(x,y,z);if(v<d)d=v;}return d;};}
/** Hüllkugel [cx,cy,cz,r] eines Punktfelds (für s.b im Renderer). */
function bound(pts,pad){let c=[0,0,0];for(const p of pts)for(let k=0;k<3;k++)c[k]+=p[k]/pts.length;
 let r=0;for(const p of pts)r=Math.max(r,Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2]));return [...c,r+pad];}

// ---------- Gemeinsame Materialien ----------
const brass=metal('#8a6a36',{shine:30,spec:.7});
const pale=glass('#9fb4b0');                    // klares Glas (Krugboden, Henkel)
const DARK=rampFrom('#3a2430'),GOLD=rampFrom('#c8962e'),RED=rampFrom('#8a3a2c'),GREY=rampFrom('#7c7a80'),INK=rampFrom('#2e3e5a');
const smokeGlow=glow(['#3c3c4a','#5c5e6c','#8a8c96','#b4b6bc','#d8d8d6']);
const ember=glow();

// ---------- Tischdeko ----------
/** Bierkrug: bernsteinfarbenes Bier im Glas, Schaumkrone mit Nase über den Rand, Henkel rechts. */
function bierkrug(){
 const cx=-.42; // Krug nach links, damit der Henkel in die 4 E passt
 const beer=glass('#d8961e'),foam=custom('schaum','#efe4c4',(u,v,w)=>({k:.88+.2*fbm3(u*1.6,v*1.6,w*1.6,2)}),{spec:.1,shine:6});
 const body=at(cx,0,0,revolve([[0,0],[1.18,0],[1.22,.12],[1.22,4.7],[0,4.7]],.04));
 return {solids:[
  {f:at(cx,0,0,revolve([[0,0],[1.26,0],[1.3,.15],[1.3,.7],[0,.7]],.04)),mat:pale,group:'krug'},
  {f:subtract(body,at(cx,0,0,cylZ(2,0,.7))),mat:beer,group:'krug'},
  // Schaumkrone: gewölbt, etwas breiter als der Rand, eine Nase läuft vorn rechts herab
  {f:smoothUnion(.35,at(cx,0,4.8,ellipsoid(1.34,1.34,.72)),at(cx+.5,1.0,4.3,ellipsoid(.4,.4,.62))),mat:foam,group:'schaum'},
  // Henkel: halber Ring in der x-z-Ebene
  {f:(x,y,z)=>Math.max(Math.hypot(Math.hypot(x-.78,z-2.7)-.66,y)-.3,.7-x),mat:glass('#7f9894'),group:'henkel'},
 ]};}

/** Leere Flasche: grünes Glas, Etikett mit rotem Schrägstreifen. */
function flasche(){
 const label=custom('etikett','#e6dcc0',(u,v,w)=>{const s=w-2.3+u*.9;return Math.abs(s)<.32?{k:1,ramp:RED}:{k:.9+.12*fbm3(u,v,w,2)};},{spec:.02,shine:4});
 return {solids:[
  {f:revolve([[0,0],[.56,0],[.6,.15],[.6,3.9],[.5,4.5],[.3,5.1],[.27,6.3],[.33,6.4],[.33,6.85],[0,6.85]],.02),mat:glass('#2e6a3a'),group:'flasche'},
  {f:revolve([[0,1.5],[.64,1.5],[.64,3.1],[0,3.1]]),mat:label,group:'flasche'},
 ]};}

/** Aschenbecher: flache Glasschale mit drei Kerben, Kippen in der Asche, Zigarette mit Glut und aufsteigendem Rauchfaden. */
function aschenbecher(t){
 const bowl=subtract(revolve([[0,0],[1.45,0],[1.6,.18],[1.6,.78],[1.5,.92],[1.18,.92],[1.08,.42],[0,.42]],.03),
  ...[TAU/4,TAU/4+TAU/3,TAU/4+2*TAU/3].map(a=>at(Math.cos(a)*1.45,-Math.sin(a)*1.45,.95,rotZ(-a,box(.35,.24,.3)))));
 const ash=stone('#4e4a4c');
 // Zigarette: Filter liegt in der Kerbe vorn links, die Glut zeigt zur Mitte
 const dirx=Math.cos(TAU/4+TAU/3),diry=-Math.sin(TAU/4+TAU/3); // Richtung zur Kerbe
 const tip=[.05,.1,.62],filt=[dirx*1.5,diry*1.5,.98];
 const mid=[mix(tip[0],filt[0],.72),mix(tip[1],filt[1],.72),mix(tip[2],filt[2],.72)];
 const pulse=.62+.28*flicker(t,7,1.3);
 // Rauch: Röhre, deren Mitte sich als Welle nach oben schlängelt (Welle läuft mit der Phase aufwärts → nahtlos)
 // Unten ein zusammenhängender Faden (≥ 1 E breit wegen harter Alphakante), oben reißt er in Fetzen, die mit der Phase aufsteigen.
 const z0=.75,z1=6.7;
 const cxz=z=>tip[0]+Math.min(.95,.06+.17*(z-z0))*Math.sin(1.35*(z-z0)-TAU*t);
 const cyz=z=>tip[1]+.2*Math.min(1,.2*(z-z0))*Math.sin(.9*(z-z0)-TAU*t+1.3);
 const rz=z=>.5+.03*(z-z0);
 const smoke=(x,y,z)=>{const zc=clamp(z,z0,z1);let d=Math.hypot(x-cxz(zc),y-cyz(zc))-rz(zc);
  const q=frac((zc-z0)/2.4-t),gap=zc>4.1?.55-Math.abs(q-.5)*2.4:-9;
  return Math.max(d*.62,gap,Math.abs(z-(z0+z1)/2)-(z1-z0)/2);};
 return {solids:[
  {f:bowl,mat:glass('#7c8a90'),group:'schale'},
  {f:cylZ(1.12,.3,.5),mat:ash,group:'asche'},
  // Kippen: weißes Papier, orangefarbener Filter
  {f:capsule([-.45,-.35,.62],[.25,-.6,.62],.22),mat:paper('#e8e2d2'),group:'kippen'},
  {f:capsule([.25,-.6,.62],[.55,-.7,.62],.23),mat:paper('#c8843a'),group:'kippen'},
  {f:capsule([.35,.25,.6],[.8,-.15,.6],.21),mat:paper('#e8e2d2'),group:'kippen'},
  {f:capsule([tip[0]+(mid[0]-tip[0])*.12,tip[1]+(mid[1]-tip[1])*.12,tip[2]+(mid[2]-tip[2])*.12],mid,.24),mat:paper('#f0ece0'),group:'zigarette'},
  {f:capsule(mid,filt,.25),mat:paper('#c8843a'),group:'zigarette'},
  {f:at(tip[0],tip[1],tip[2],ellipsoid(.3,.3,.28)),mat:ember,glow:pulse,group:'glut',noShadow:true},
  {f:smoke,mat:smokeGlow,glow:(u,v,w)=>clamp(.78-.085*(w-z0)+.1*(noise3(u*1.3,v*1.3,w*.8-2.5*Math.cos(TAU*t))-.5),.18,.9),group:'rauch',noShadow:true,b:[tip[0],tip[1],(z0+z1)/2,(z1-z0)/2+1.6]},
 ],lights:[{p:[tip[0],tip[1]+.4,tip[2]+.3],r:2.2,k:.6*pulse,color:[1,.5,.2]}]};}

/** Tischlampe: Messingfuß, Stiel, leuchtender Stoffschirm mit Rippen; flackert leicht. */
function tischlampe(t){
 const f=.8+.3*flicker(t,11,1.4);
 // Schirm: oben dunkler, zum offenen Rand hin hell; Rippen als dunklere Streifen; das Flackern hebt vor allem den unteren Rand
 const shadeGlow=(u,v,w)=>{const a=Math.atan2(v,u),rib=Math.cos(a*8)>.86?.14:0,low=clamp((8.2-w)/3.4,0,1);return clamp(.3+.5*low*f-rib,0,.97);};
 return {solids:[
  {f:revolve([[0,0],[1.4,0],[1.45,.15],[1.4,.4],[.9,.6],[.45,.8],[0,.8]],.03),mat:brass,group:'fuss'},
  {f:cylZ(.24,.7,8.3,.05),mat:brass,group:'stiel'},
  {f:at(0,0,2.4,ellipsoid(.42,.42,.4)),mat:brass,group:'stiel'},
  {f:revolve([[1.72,4.8],[1.58,4.8],[.84,8.2],[.98,8.2]],.06),mat:glow(['#5a3410','#9a6220','#d8983a','#f4c46a','#ffe6a8']),glow:shadeGlow,group:'schirm'},
  {f:at(0,0,8.45,ellipsoid(.32,.32,.4)),mat:brass,group:'knauf'},
 ],lights:[{p:[0,.6,4.2],r:6,k:.6*f,color:[1,.8,.4]}]};}

/** Baupläne: flach liegender Bogen mit Grundriss, links und rechts eingerollt. */
function bauplaene(){
 const plan=custom('plan','#e6dcc0',(u,v)=>{
  // Grundriss mit vier Räumen und Türlücken. Linien quer zur Blickrichtung (v fest) sind dicker, weil die Tiefe um tan 35° verkürzt wird.
  const X=(a,c)=>Math.abs(u-a)<.18&&c,Y=(b,c)=>Math.abs(v-b)<.27&&c,ax=Math.abs(u),ay=Math.abs(v);
  const line=(Math.abs(ax-3.5)<.18&&ay<2.75)||(Math.abs(ay-2.5)<.27&&ax<3.68)||X(-.9,v<.55)||Y(.55,u<1.6&&!(u>-2.7&&u<-1.8))
   ||X(1.6,!(v>-.5&&v<.4))||Y(-.8,u>1.6);
  const stain=fbm3(u*.5+3,v*.5,0,3)>.64?.84:1;
  return line?{k:.75,ramp:INK}:{k:(.9+.1*fbm3(u*.8,v*.8,0,2))*stain};},{spec:.02,shine:4});
 const roll=paper('#dcd0b0');
 return {solids:[
  {f:block(4.35,3.35,0,.16,.05),mat:plan,group:'bogen'},
  {f:(x,y,z)=>{const d=Math.hypot(x+4.85,z-.5)-.5;return Math.max(d,Math.abs(y)-3.45);},mat:roll,group:'rolle-l'},
  {f:(x,y,z)=>{const d=Math.hypot(x-4.85,z-.5)-.5;return Math.max(d,Math.abs(y)-3.45);},mat:roll,group:'rolle-r'},
 ]};}

// ---------- Bodendeko (von oben) ----------
/** Läufer: roter Webteppich mit dunkler Bordüre, goldenem Rahmen, drei Rauten-Medaillons und Fransen an den Schmalseiten. */
function laeufer(){
 const rug=custom('teppich','#8a3a2c',(u,v)=>{const ax=Math.abs(u),ay=Math.abs(v),b=Math.min(6.1-ax,18.3-ay);
  let k=.74+.05*Math.sin(u*8)*Math.sin(v*8)+.12*(fbm3(u*.5,v*.5,0,3)-.5);
  if(b<.6)return {k,ramp:DARK};
  if(b<1.2)return {k:k*(frac((u+v)*.7)<.5?1.05:.9),ramp:GOLD};
  if(b<1.75)return {k,ramp:DARK};
  // Rauten-Medaillons in der Mitte
  for(const c of [-10.5,0,10.5]){const d=ax/3.5+Math.abs(v-c)/4.6;
   if(d<.16)return {k,ramp:GOLD};if(d<.4)return {k:k*.95,ramp:RED};if(d<.56)return {k,ramp:DARK};if(d<.7)return {k:k*1.05,ramp:GOLD};if(d<.84)return {k,ramp:RED};if(d<1)return {k,ramp:DARK};}
  // kleine goldene Punkte zwischen den Medaillons
  for(const c of [-15.8,-5.25,5.25,15.8])if(Math.hypot(u,v-c)<.55)return {k,ramp:GOLD};
  return {k};},{spec:.03,shine:4});
 const fringe=fabric('#dcc690');
 const tassel=(x,y,z)=>{const i=clamp(Math.round(x/1.05+5),0,10),tx=x-(i-5)*1.05;return capsule([0,18.4,.18],[0,19.5,.12],.27)(tx,Math.abs(y),z);};
 return {solids:[
  {f:at(0,0,.18,box(6.2,18.45,.18,.12)),mat:rug,group:'teppich'},
  {f:tassel,mat:fringe,group:'fransen'},
 ]};}

/** Matratze mit Schlafsack: helle Matratze mit Drellstreifen und Randkeder, grüner gesteppter Schlafsack, kariertes Kissen. */
function matratze(){
 const tick=custom('drell','#b8aa8a',(u,v)=>{const edge=Math.abs(u)>6.05||Math.abs(v)>13.0;
  const k=(frac(u/1.3)<.22?.9:1)*(.84+.06*(fbm3(u*.4,v*.4,0,3)-.5));return edge?{k:k*.78}:{k};},{spec:.03,shine:4});
 // Steppnähte quer zum Sack als dunkle Linien, dazwischen gewölbte Kammern
 const seam=v=>frac((v+8)/2.55);
 // Eigene Grünrampe aus Palettentönen: die Standardrampe kippt im Schatten ins Oliv-Braun und bandet in Streifen
 const GREEN=['#263530','#2d423c','#354b36','#455e40','#55704a','#6d824e','#849451'].map(hex);
 const bagMat=custom('schlafsack','#455e40',(u,v)=>{const s=seam(v);return {k:(s<.1||s>.95?.62:.8),ramp:GREEN};},{spec:.14,shine:10});
 const plaid=custom('karo','#8a3a30',(u,v)=>{const a=frac(u/1.7),b=frac(v/1.7),da=a<.28,db=b<.28,la=Math.abs(a-.64)<.07,lb=Math.abs(b-.64)<.07;
  if(da&&db)return {k:.62,ramp:DARK};if(da||db)return {k:.72};if(la||lb)return {k:.8,ramp:GOLD};return {k:.8};},{spec:.03,shine:4});
 // Mumienform: oben breit, zum Fußende schmaler
 const halfW=y=>mix(5.3,4.1,clamp((y+8)/20.5,0,1));
 const bag2=(x,y)=>{const hw=halfW(y),dx=Math.abs(x)-hw+1.2,dy=Math.abs(y-2.3)-10.3+1.2;return Math.min(Math.max(dx,dy),0)+Math.hypot(Math.max(dx,0),Math.max(dy,0))-1.2;};
 const hf=(x,y)=>{const hw=halfW(y),q=clamp(1-(x/hw)**2,0,1);return .55+.42*Math.sqrt(q)*(.8+.2*Math.sin(Math.PI*seam(y)));};
 const bag=(x,y,z)=>Math.max(bag2(x,y),(z-hf(x,y))*.55,.4-z);
 return {solids:[
  {f:at(0,0,.28,box(6.6,13.55,.28,.25)),mat:tick,group:'matratze'},
  {f:bag,mat:bagMat,group:'sack',noShadow:true},
  // umgeschlagene Kante des Schlafsacks (helleres Futter)
  {f:slab((x,y)=>Math.max(Math.abs(x)-5.1,Math.abs(y+8.1)-.75),.5,.98,.25),mat:fabric('#8c8a52'),group:'sack'},
  {f:slab((x,y)=>Math.max(Math.abs(x)-4.7,Math.abs(y+10.9)-1.8),.5,1.0,.4),mat:plaid,group:'kissen'},
 ]};}

/** Plastikbecher, zerdrückt und umgekippt. Die Öffnung ist schräg angeschnitten, damit man von oben in den dunklen Becher sieht. */
function becher(){
 const cup=custom('becher','#dedcd2',(u,v,w)=>cone(u,v,w,.1)<.02&&u<.9?{k:.5,ramp:GREY}:{k:(.86+.08*Math.sin(u*7+w*5))*(fbm3(u*1.2,v*1.2,w,2)>.68?.88:1)},{spec:.45,shine:22});
 // Lokal: Achse entlang x, Öffnung bei x=-1.05 (breit), Boden bei x=1.0 (schmal); flach gequetscht, liegt auf z=0
 const cone=(x,y,z,inset)=>{const s=clamp((x+1.05)/2.05,0,1),ry=mix(.95,.55,s)-inset,rz=mix(.5,.34,s)-inset*.7;
  return (Math.hypot(y/ry,(z-rz-inset*.7)/rz)-1)*Math.min(ry,rz)*.9;};
 const local=(x,y,z)=>{const outer=Math.max(cone(x,y,z,0),x-1.0),inner=Math.max(cone(x,y,z,.12),x-.85);
  // Anschnitt der Öffnung: Ebene schräg nach oben-links
  const cut=-(x+1.05-.95*z)*.7;return Math.max(outer,-inner,cut);};
 const a=.55,c=Math.cos(a),sn=Math.sin(a);
 return {solids:[{f:rotZ(a,local),tex:(x,y,z)=>[c*x+sn*y,-sn*x+c*y,z],mat:cup,group:'becher'}]};}

/** Luftschlangen: drei gewellte Papierbänder (rot, gelb, blau), die sich kreuzen, dazu ein paar Konfetti. */
function luftschlangen(){
 const cols=['#c8402c','#e0b43a','#3a64b4'];
 // Band als Welle entlang einer Strecke (für echte Schlaufen ist die Fläche zu klein: die Löcher liefen in der Kontur zu).
 // z hebt und senkt sich mit, damit Licht und Schatten die Kringel zeigen; jedes Band hat seine eigene Bahn und kreuzt die Nachbarn nur leicht.
 const streamer=(ax,ay,bx,by,waves,amp,ph)=>{const pts=[],n=Math.round(waves*14),lx=bx-ax,ly=by-ay,l=Math.hypot(lx,ly),nx=-ly/l,ny=lx/l;
  for(let i=0;i<=n;i++){const s=i/n,a=s*waves*TAU+ph,o=amp*Math.sin(a);pts.push([mix(ax,bx,s)+nx*o,mix(ay,by,s)+ny*o,.3+.14*Math.cos(a)]);}return pts;};
 const paths=[streamer(-3.1,-.8,1.3,-.95,3,.36,0),streamer(-2.2,.15,3.1,-.1,3.4,.4,1.6),streamer(-2.8,.95,2.0,.85,3,.36,3.4)];
 const mats=cols.map(c=>custom('papier',c,(u,v,w)=>({k:.8+.06*fbm3(u*2,v*2,w,2)}),{spec:.2,shine:10}));
 const confetti=[[2.3,-1.1,2],[3.1,-.85,1],[2.9,1.05,0],[-3.25,.25,1]];
 return {solids:[
  ...paths.map((p,i)=>({f:tube(p,.23),mat:mats[i],group:'band'+i,b:bound(p,.6)})),
  ...confetti.map(([x,y,c])=>({f:at(x,y,.12,rotZ(x*1.7,box(.32,.3,.1,.05))),mat:mats[c],group:'konfetti'})),
 ]};}

/** Socke: weiß mit grauer Ferse und Spitze, gerippter Bund; flach hingeworfen. */
function socke(){
 const cuff=[1.25,-.85],heel=[.35,.5],toe=[-1.25,.45];
 const sockMat=custom('socke','#e4e2da',(u,v)=>{
  const dh=Math.hypot(u-heel[0]-.25,v-heel[1]-.25),dt=Math.hypot(u-toe[0]+.1,v-toe[1]);
  if(dh<.5||dt<.5)return {k:.8,ramp:GREY};
  const dc=Math.hypot(u-cuff[0],v-cuff[1]);if(dc<.7)return {k:Math.sin((u*.83+v*.55)*TAU*1.6)>.2?.86:.72};
  return {k:.84*(fbm3(u*1.4,v*1.4,0,3)>.66?.9:1)};},{spec:.03,shine:4});
 const flat=f=>(x,y,z)=>f(x,y,(z-.3)*1.9)*.52;
 return {solids:[{f:flat(smoothUnion(.25,roundCone([cuff[0],cuff[1],0],[heel[0],heel[1],0],.52,.5),roundCone([heel[0],heel[1],0],[toe[0],toe[1],0],.5,.44))),mat:sockMat,group:'socke'}]};}

/** Pfütze: unregelmäßige Wasserfläche mit Tröpfchen; ein Tropfenring breitet sich aus (zwei Ringe um eine halbe Phase versetzt → nahtlos). */
const puddle2=smin2(.9,ell2(-1.3,.2,3.9,2.3),ell2(2.2,-.4,3.1,2.1),ell2(-4.4,.9,1.7,1.35),ell2(4.5,1.0,1.5,1.15));
function pfuetze(t){
 // Wasser: dunklerer nasser Rand, ein heller Himmelsspiegel oben links, feine Schlieren
 const water=custom('wasser','#3a5a6c',(u,v)=>{const s=frac((u*.35-v*.6)*.45+.15*fbm3(u*.3,v*.3,0,2)),e=puddle2(u,v);
  let k=.74+(s<.12?.06:0)+.05*(fbm3(u*.7,v*.7,3,2)-.5);if(e>-.45)k*=.84;else if(Math.hypot((u+2.6)/2.2,(v+.7)/.8)<1)k+=.1;return {k};},{spec:1.1,shine:50,glass:true});
 const drops=[[-5.9,-2.6,.35],[6.1,-1.8,.3],[-3.2,-2.8,.3],[5.6,2.7,.3]];
 const ringGlow=glow(['#2e4a5c','#44687c','#5e889c','#86aebe','#b4d2dc']);
 // Ring wird größer, dünner und blasser; am Ende der Phase ist er ganz verschwunden, der nächste beginnt als kleiner Ring.
 // Zwei Einschläge an verschiedenen Stellen, um eine halbe Phase versetzt – so sind alle 8 Bilder verschieden.
 const rings=[[0,1.2,-.2,2.7],[.5,-2.4,.45,2.0]].map(([o,cx,cy,grow])=>{const p=frac(t+o),R=.7+grow*p,rr=.25*Math.sqrt(1-p)+.01;
  return {f:(x,y,z)=>Math.max(Math.hypot(Math.hypot(x-cx,y-cy)-R,(z-.14)*1.4)-rr,puddle2(x,y)+.35),mat:ringGlow,glow:clamp(.85-.6*p,0,1),group:'ring',noShadow:true};});
 return {solids:[
  {f:slab(puddle2,0,.14,.06),mat:water,group:'wasser'},
  ...drops.map(([x,y,r])=>({f:slab(ell2(x,y,r,r*.85),0,.12,.05),mat:water,group:'wasser'})),
  ...rings,
 ]};}

/** Scherben: grünes Flaschenglas – ein großes Bauchstück mit Etikettrest, dazu spitze Splitter, verkippt für Glanzkanten. */
function scherben(){
 const g=glass('#1c4a28');
 const shard=(poly,x,y,a,tx,ty,th=.17)=>{const d2=(px,py)=>polyDist(poly,px,py);
  return at(x,y,.3,rotZ(a,rotX(tx,rotY(ty,slab(d2,-th,th,.15)))));};
 // Bauchstück mit gezacktem Bruchrand und einer Spitze
 const big=[[-1.4,-.9],[.1,-1.2],[.35,-.55],[1.45,-.75],[.95,.35],[1.25,.95],[-.4,.95],[-.9,.45],[-1.45,.55]];
 const labelMat=custom('etikett','#e6dcc0',(u,v)=>Math.abs(u-1.7+(v+.5)*.8)<.22?{k:.9,ramp:RED}:{k:.9},{spec:.02,shine:4});
 return {solids:[
  {f:shard(big,-1.7,-.5,.3,.2,-.28),mat:g,group:'s1'},
  {f:intersect(at(-1.4,-.35,.5,box(.5,.4,.08,.04)),shard(big,-1.7,-.5,.3,.2,-.28,.3)),mat:labelMat,group:'s1'},
  {f:shard([[-.7,-.5],[.9,-.3],[-.2,.7]],1.6,-1.2,-.4,-.3,.3),mat:g,group:'s2'},
  {f:shard([[-.9,.2],[.6,-.6],[.5,.5]],1.5,1.1,.8,.25,.3),mat:g,group:'s3'},
  {f:shard([[-.5,-.35],[.55,-.1],[-.1,.45]],-1.0,1.8,-.6,-.3,-.25),mat:g,group:'s4'},
  {f:shard([[-.4,-.3],[.45,-.2],[.05,.4]],3.0,.1,.4,.3,-.3),mat:g,group:'s5'},
  {f:shard([[-.3,-.3],[.35,-.15],[0,.35]],.4,.2,1.1,-.25,.3),mat:g,group:'s6'},
  {f:shard([[-.3,-.25],[.3,-.25],[0,.3]],-3.15,1.5,.2,.3,.3),mat:g,group:'s7'},
 ]};}

export const MODELS={
 // Tischdeko (schräg)
 bierkrug:{height:6,build:bierkrug},
 flasche:{height:7,build:flasche},
 aschenbecher:{frames:6,fps:6,height:6,extraTop:1,build:aschenbecher},
 tischlampe:{frames:4,fps:6,height:10,extraTop:2,build:tischlampe},
 bauplaene:{height:1,build:bauplaene},
 // Bodendeko (von oben)
 laeufer:{build:laeufer},
 matratze:{build:matratze},
 becher:{build:becher},
 luftschlangen:{build:luftschlangen},
 socke:{build:socke},
 pfuetze:{frames:8,fps:8,build:pfuetze},
 scherben:{build:scherben},
};
