// Sprite-Schmiede · Figuren: Kopfform und Gesicht im Kopf-Rahmen (E-56).
// Kopf-Rahmen (skeleton.mjs headFrame): Ursprung Kopfmitte, x nach rechts (aus Sicht der Figur), y nach vorn, z nach oben.
// Alle Maße hier in Kopfeinheiten h = body.head · s (≈ 1 E). Der Kopf ist leicht stilisiert groß (≈ 5,2 h ≈ 1/5 der Figur).
//
// Aufbau: headLocal() liefert die Kopfform (Schädel, Kiefer, Kinn, Wangenknochen, Brauenbogen, Nase, Ohren). skeleton.mjs
// nimmt die neutrale Form als F.head; face() legt eine hauchdünn größere Gesichtshaut mit eigenem Material darüber
// (Charakterform ∪ neutrale Form), auf die Augen, Brauen, Mund, Rouge, Falten und Bartschatten gemalt werden – in
// Kopfkoordinaten, damit alles bei jeder Blickrichtung und Kopfdrehung sitzt. Features sind mindestens 0,22 h breit,
// sonst verschwinden sie in Spielgröße (4 px je E).
//
// recipe.face (alle Angaben optional, Standardwerte in FACE_DEFAULTS):
//   iris     Irisfarbe ('#4f6f86'); Fallback recipe.eyes
//   brows    'gerade' | 'buschig' | 'geschwungen' | 'zerzaust'   browColor (Standard: Haarfarbe, abgedunkelt)
//   mouth    'neutral' | 'resolut' | 'grinsen' | 'kokett' | 'schief'   lips (Lippenfarbe, z. B. Lippenstift)
//   nose     'gerade' | 'stups' | 'knolle' | 'spitz'
//   jaw 0..1 (Kieferbreite) · chin 0..1 (Kinn) · cheeks 0..1 (Wangenknochen/Pausbacken)
//   age 0..1 (Krähenfüße, Nasolabialfalte, Tränensäcke) · rouge 0..1 · freckles 0..1 · stubble 0..1 (Bartschatten)
//   lashes 0..1 (Wimpernschwung) · lids 0..1 (Oberlid gesenkt) · look [x,z] (Blickrichtung in h) · earrings Farbe|null (Creolen)
import {clamp,mix,smoothstep,at,union,smoothUnion,ellipsoid,capsule,sphere,torusZ,rotY,rotX,fbm3,noise3,hash3,inflate} from '../sdf.mjs';
import {custom,rampFrom,hex,metal} from '../materials.mjs';
import {hairSolids} from './hair.mjs';

export const FACE_DEFAULTS={stamp:null,breite:1,iris:'#4f6f86',brows:'gerade',browColor:null,mouth:'neutral',lips:null,nose:'gerade',jaw:.3,chin:.4,cheeks:.4,
 age:0,rouge:.4,freckles:0,stubble:0,lashes:.3,lids:0,look:[0,0],earrings:null};
/** Rezeptwerte mit Standardwerten auffüllen (recipe.eyes bleibt als Irisfarbe gültig). */
export function faceOptions(recipe={}){const f={...FACE_DEFAULTS,...(recipe.face||{})};
 if(!recipe.face?.iris&&recipe.eyes)f.iris=recipe.eyes;
 if(recipe.beard?.style==='stoppel')f.stubble=Math.max(f.stubble,.75);
 return f;}

// ---------- kleine Hilfen ----------
const smin=(a,b,k)=>{const h=clamp(.5+.5*(b-a)/k,0,1);return mix(b,a,h)-k*h*(1-h);};
const smaxSub=(a,b,k)=>{const h=clamp(.5-.5*(a+b)/k,0,1);return mix(a,-b,h)+k*h*(1-h);};// a ohne b, weich
const toRgb=c=>typeof c==='string'?hex(c):c;
const mixRgb=(a,b,t)=>{a=toRgb(a);b=toRgb(b);return a.map((v,i)=>Math.round(mix(v,b[i],t)));};
/** Übergang zwischen zwei Farbrampen in 12 Stufen (gecacht, damit die Schattierung billig bleibt). */
function blender(a,b){const c=[];return t=>{const i=Math.round(clamp(t,0,1)*12);return c[i]||(c[i]=a.map((col,j)=>col.map((v,k)=>mix(v,b[j][k],i/12))));};}
const flat=c=>Array(7).fill(toRgb(c));
/** Hautrampe: Schatten warm rotbraun statt kühl-violett (Haut soll auch im Schatten lebendig bleiben), Lichter pfirsichhell. */
export function skinRamp(c,{deep=.62,hi=.42,sat=1.25}={}){let b=toRgb(c);const m=(b[0]+b[1]+b[2])/3;b=b.map(v=>clamp(Math.round(m+(v-m)*sat),0,255));
 return [deep,deep*.64,deep*.3].map(t=>mixRgb(b,'#6a2a26',t)).concat([b],[hi*.3,hi*.62,hi].map(t=>mixRgb(b,'#ffe4c2',t)));}

// ---------- Kopfneigung ----------
// Stilmittel: das Gesicht ist um TILT zur (schräg von oben blickenden) Kamera gehoben – mehr Gesicht, weniger Schädeldecke,
// wie in den gemalten Vorbildern. Alle Formen und Malereien entstehen im geneigten Entwurfsrahmen.
// Mit der flachen Figurenkamera (15°, figures.mjs) nur noch leicht gekippt; 16° ließen die Augen halb geschlossen wirken.
export const TILT=5*Math.PI/180,TC=Math.cos(TILT),TS=Math.sin(TILT);
/** Gesichtszüge (Brauen, Augen, Nase, Mund, Wangen) sitzen FZ unter der Kopfmitte: Augen etwa auf halber Kopfhöhe und
 *  im Kopf-Rahmen bei z ≈ 0,38 h – unter Mützenschirm und Hutkrempe aus wardrobe.mjs. */
export const FZ=-.26;
/** Kopf-Rahmen → Entwurfsrahmen (Blick +y um TILT nach oben gedreht) und leicht angehoben (Kinn frei über dem Kragen). */
export const tilt=(x,y,z)=>{z-=.06;return [x,TC*y+TS*z,-TS*y+TC*z];};

// ---------- Kopfform ----------
/** Kopf als Distanzfeld im Kopf-Rahmen. opt: {jaw, chin, cheeks, nose, smile}. Ohne opt die neutrale (schmalste) Form. */
/** width < 1 = schmaleres Gesicht (Editor: face.breite); Kopfform und aufgemalte Züge werden gemeinsam gestaucht. */
export function headLocal(h,opt={}){const d=headDesign(opt),w=opt.width??1;return (X,Y,Z)=>{const [x,y,z]=tilt(X/h,Y/h,Z/h);return d(x/w,y,z)*h*Math.min(1,w);};}
/** Kopfform im Entwurfsrahmen (geneigt, Einheiten h) – für Bart und Frisur, die selbst schon im Entwurfsrahmen rechnen. */
export function headDesign(opt={}){const jaw=opt.jaw??0,chin=opt.chin??0,cheeks=opt.cheeks??0,smile=opt.smile??0,nose=opt.nose||'klein';
 const cran=at(0,-.12,0,ellipsoid(2.28,2.4,2.3));// Scheitel bleibt unter z ≈ 2,4 h (Hüte aus wardrobe.mjs passen)
 const mass=at(0,.5,-.95,ellipsoid(1.6+.2*jaw,1.7,1.72));
 const jawL=at(-(.92+.3*jaw),.85,-1.72,ellipsoid(.66,.95,.6)),jawR=at(.92+.3*jaw,.85,-1.72,ellipsoid(.66,.95,.6));
 const chinF=at(0,1.42+.08*chin,-2.12-.08*chin,ellipsoid(.78+.16*chin,.72,.62+.06*chin));
 const cz=-.45+.14*smile,cr=.4+.18*cheeks;
 const cheekL=at(-1.06,1.62,cz,ellipsoid(cr*1.15,cr,cr*.9)),cheekR=at(1.06,1.62,cz,ellipsoid(cr*1.15,cr,cr*.9));
 const brow=at(0,1.8,.66,ellipsoid(1.3,.4,.26));
 const noseF=noseField(nose);
 const earF=(x,y,z)=>{const ax=Math.abs(x)-2.12,e=ellipsoid(.22,.44,.72)(ax,y+.12,z+.12),cup=ellipsoid(.13,.26,.46)(ax-.17,y+.08,z+.08);
  return Math.max(e,-cup);};
 return (x,y,z)=>{
  // grobe Hülle: weit weg → Abstand zur Hülle (untere Schranke, spart die Einzelteile)
  const hull=Math.hypot(x/2.9,(y-.1)/3.2,(z+.2)/3.3)-1;if(hull>.25)return hull*2.9;
  let d=smin(cran(x,y,z),mass(x,y,z),.55);
  d=smin(d,Math.min(jawL(x,y,z),jawR(x,y,z)),.45);d=smin(d,chinF(x,y,z),.4);
  if(opt.lite)return d;// schlichte Grundform (F.head): liegt ganz in der Gesichtshaut
  const zf=z-FZ;
  d=smin(d,Math.min(cheekL(x,y,zf),cheekR(x,y,zf)),.3);d=smin(d,brow(x,y,zf),.3);
  // flache Augenhöhlen unter dem Brauenbogen (fangen etwas Schatten, ohne die Augen zu verschlucken)
  d=smaxSub(d,Math.min(ellipsoid(.46,.24,.2)(x-.8,y-2.36,zf-.1),ellipsoid(.46,.24,.2)(x+.8,y-2.36,zf-.1)),.1);
  if(nose!=='ohne')d=smin(d,noseF(x,y,zf),.14);
  if(!opt.noEars)d=smin(d,earF(x,y,z),.12);
  return d;};}

function noseField(kind){
 if(kind==='knolle'){const b=capsule([0,2.12,.35],[0,2.48,-.45],.22),tip=at(0,2.5,-.62,sphere(.42)),w=(x,y,z)=>sphere(.27)(Math.abs(x)-.36,y-2.2,z+.74);
  return (x,y,z)=>Math.min(b(x,y,z),tip(x,y,z),w(x,y,z));}
 if(kind==='stups'){const b=capsule([0,2.1,.3],[0,2.42,-.42],.19),tip=at(0,2.47,-.5,sphere(.26)),w=(x,y,z)=>sphere(.18)(Math.abs(x)-.25,y-2.24,z+.64);
  return (x,y,z)=>Math.min(b(x,y,z),tip(x,y,z),w(x,y,z));}
 if(kind==='spitz'){const b=capsule([0,2.12,.35],[0,2.62,-.55],.2),tip=at(0,2.58,-.62,sphere(.24)),w=(x,y,z)=>sphere(.19)(Math.abs(x)-.26,y-2.26,z+.74);
  return (x,y,z)=>Math.min(b(x,y,z),tip(x,y,z),w(x,y,z));}
 if(kind==='gerade'){const b=capsule([0,2.12,.35],[0,2.52,-.5],.21),tip=at(0,2.52,-.6,sphere(.29)),w=(x,y,z)=>sphere(.2)(Math.abs(x)-.28,y-2.24,z+.72);
  return (x,y,z)=>Math.min(b(x,y,z),tip(x,y,z),w(x,y,z));}
 // 'klein': neutrale Form, in allen anderen enthalten
 const b=capsule([0,2.1,.3],[0,2.4,-.42],.18),tip=at(0,2.44,-.52,sphere(.22));return (x,y,z)=>Math.min(b(x,y,z),tip(x,y,z));}

// ---------- gemalte Gesichtszüge (Kopfkoordinaten in h) ----------
const EX=.8,EZ=.06,MZ=-1.32;
/** Augenform: Rückgabe {in, lash, lower, iris…} für den Punkt (x,z) relativ zum Auge der Seite `side`. */
function eyeAt(o,x,z,side){const dx=(x-side*EX)*side,dz=z-EZ,w=.5,t=dx/w;if(Math.abs(t)>1.5||dz>.5||dz<-.35)return null;
 // Stilisiert große Augen wie in den gemalten Bögen (in Spielgröße 2–3 px hoch statt knapp 2).
 const q=Math.max(0,1-t*t),lid=1-.4*o.lids,up=.3*lid*Math.pow(q,.55)+.03,lo=-.21*Math.pow(q,.75)-.01*t;
 const lashT=(.17+.09*o.lashes)*(.65+.35*clamp((t+1)/2,0,1)),wing=o.lashes>.4&&t>.6?(t-.6)*.4*o.lashes:0;
 if(Math.abs(t)<=1&&dz<up&&dz>lo)return {eye:1,t,dx,dz};
 // Wimpernlinie: dunkles Band über dem Oberlid, außen kräftiger und mit Schwung
 if(t>-1.05&&t<1+.45*o.lashes&&dz>=up-.01&&dz<up+lashT+wing&&(t<=1||dz>up+wing*.5))return {lash:1};
 if(Math.abs(t)<.85&&dz<=lo&&dz>lo-.06)return {lower:1};
 if((o.age>.2||o.lids>.2)&&Math.abs(t)<.8&&dz>up+lashT+.07&&dz<up+lashT+.13)return {crease:1};
 return null;}
function browAt(o,x,z,side,seed){const kind=o.brows,dx=(x-side*.78)*side,t=dx/(kind==='buschig'?.62:.56);if(Math.abs(t)>1.12)return false;
 let zc=.66,th=.23,arch=.05,slope=.05;
 if(kind==='buschig'){th=.33;arch=.07;slope=.02;zc=.68;}
 else if(kind==='geschwungen'){th=.17*(1-.45*clamp((t+1)/2,0,1))+.04;arch=.2;slope=.02;zc=.74+(side>0?.07:0);}
 else if(kind==='zerzaust'){th=.27;arch=.06;slope=.08;zc=.7+(side<0?.08:0);}
 else {th=.24;arch=.03;slope=.06;zc=.65;}// gerade/resolut: innen tiefer gezogen
 const c=zc+arch*(1-t*t)+slope*t,n=kind==='buschig'||kind==='zerzaust'?(fbm3(x*6+seed,z*6,side*3,2)-.5)*.16:0;
 return Math.abs(z-c)<th/2+n&&Math.abs(t)<1+n;}
/** Mundlinie z(t), t = −1 … 1 von Mundwinkel zu Mundwinkel (Seite +1 = rechts der Figur). */
function mouthCurve(kind,t){const a=Math.abs(t);
 if(kind==='grinsen')return .2*t*t-.02;
 if(kind==='laecheln')return .16*t*t-.01;// geschlossenes Lächeln, Mundwinkel hoch
 if(kind==='kokett')return .1*t*t+.03*t;
 if(kind==='schief')return t>0?.2*t*t:-.04*t*t;
 if(kind==='resolut')return t>0?.05*t*t:-.03*t*t;
 return -.02*a*a;}
function mouthAt(o,x,z){const kind=o.mouth,w=kind==='laecheln'?.64:kind==='grinsen'?.7:kind==='kokett'?.42:kind==='schief'?.54:.5,cx=kind==='schief'?.08:0,t=(x-cx)/w;
 if(Math.abs(t)>1.2)return null;const zc=MZ+mouthCurve(kind,t),q=Math.max(0,1-t*t),dz=z-zc;
 const full=o.lips?1:0,open=kind==='grinsen'?.15*Math.pow(q,.8):0,L=full?.05:.065,upper=(.05+.03*full)*Math.pow(q,.6),lower=(kind==='resolut'?.07:.1+.04*full)*Math.pow(q,.5);
 if(Math.abs(t)<=1){if(open&&dz<=0&&dz>-open)return {teeth:1};
  if(dz>0&&dz<=L)return {line:1};
  if(dz>-open-L&&dz<=-open)return {line:1};
  if(dz>L&&dz<L+upper)return {upper:1};
  if(dz<=-open-L&&dz>-open-L-lower)return {lower:1};}
 // Mundwinkel-Grübchen (Lächeln) als kurze dunkle Kerbe
 if((kind==='grinsen'||kind==='kokett'||kind==='schief'&&t>0)&&Math.abs(t)>1&&Math.abs(t)<1.16&&Math.abs(dz-.05*Math.sign(t)*0-.04)<.07)return {line:.6};
 return null;}
function segDist(px,pz,ax,az,bx,bz){const ex=bx-ax,ez=bz-az,h=clamp(((px-ax)*ex+(pz-az)*ez)/(ex*ex+ez*ez),0,1);return Math.hypot(px-ax-ex*h,pz-az-ez*h);}

/** Hautmaterial mit gemaltem Gesicht (u,v,w = Kopfkoordinaten in E). */
export function faceSkin(h,o,{skin='#e2ab86',hairCol='#5a3b24',beardCol=null,seed=0,noFeatures=false}={}){
 const base=skinRamp(skin,{deep:.5}),warm=skinRamp(mixRgb(skin,'#f08a78',.42),{deep:.5,hi:.38});
 const lipC=o.lips?toRgb(o.lips):mixRgb(skin,'#b8574a',.38),lipR=rampFrom(lipC,{deep:.72,hi:.42}),lipD=rampFrom(mixRgb(lipC,'#3a1c20',.35),{deep:.75,hi:.3});
 const browC=o.browColor?toRgb(o.browColor):mixRgb(hairCol,'#241a1a',.35),browR=rampFrom(browC,{deep:.7,hi:.35});
 const lashR=rampFrom('#1e1519',{deep:.4,hi:.12}),whiteR=rampFrom('#e6d6c2',{deep:.5,hi:.45}),irisR=rampFrom(o.iris,{deep:.62,hi:.4}),pupilR=flat('#1a1620'),glintR=flat('#fffaf0');
 const teethR=rampFrom('#f2ead8',{deep:.5,hi:.4}),lineR=rampFrom('#5a2a2c',{deep:.6,hi:.2});
 const stubC=beardCol?toRgb(beardCol):mixRgb(hairCol,'#3a3038',.2),stub=blender(base,skinRamp(mixRgb(skin,stubC,.55),{deep:.55,hi:.4}));
 const rouge=blender(base,warm),look=o.look||[0,0];
 const tex=(u,v,w)=>{const x=u/h,y=v/h,z=w/h-FZ,ax=Math.abs(x),side=x<0?-1:1;
  const pore=(.97+.05*noise3(u*7,v*7,w*7))*(1+.14*smoothstep(.6,1.8,y));
  // Gesicht vorn (bei Pixel-Stempeln setzt der Pixelmaler Augen, Brauen und Mund – hier nur Haut)
  if(!noFeatures&&y>1.1&&z>-2.9&&z<1.3){
   const e=eyeAt(o,x,z,side);
   if(e){if(e.eye){const ix=side*EX+look[0]+.02*side,iz=EZ+.05+look[1],r=Math.hypot(x-ix,z-iz);
     if(Math.hypot(x-ix+.07,z-iz-.05)<.06)return {k:1,ramp:glintR,spec:0};
     if(r<.13)return {k:1,ramp:pupilR,spec:.6};if(r<.3)return {k:r>.24?.78:1,ramp:irisR,spec:.5};
     return {k:1-.12*Math.max(0,1-(e.dz-.02)/.12),ramp:whiteR,spec:.3};}
    if(e.lash)return {k:1,ramp:lashR,spec:.2};
    if(e.lower)return {k:.86,ramp:rouge(.35)};
    if(e.crease)return {k:.9+.06*(1-o.age),ramp:base};}
   if(browAt(o,x,z,side,seed))return {k:.95+.1*noise3(x*9,z*9,side),ramp:browR,spec:.1};
   const m=mouthAt(o,x,z);
   if(m){if(m.teeth)return {k:1.05,ramp:teethR,spec:.4};if(m.line)return {k:m.line===1?1:.9,ramp:lineR};if(m.upper)return {k:o.lips?1:.9,ramp:o.lips?lipR:lipD,spec:.3};if(m.lower)return {k:o.lips?1.12:1.04,ramp:lipR,spec:.5};}
   // Falten (Alter): Nasolabialfalte, Krähenfüße, Tränensack
   if(o.age>0){const nl=segDist(ax,z,.42,-.72,.7,-1.42);if(nl<.05+.03*o.age)return {k:1-.2*o.age,ramp:rouge(.25)};
    if(ax>1.2&&ax<1.55){const rz=z-EZ;for(const s of [-.14,.02,.16])if(Math.abs(rz-s*(ax-1.2)/.35-s*.3)<.04*o.age+.012&&ax>1.24)return {k:1-.18*o.age,ramp:base};}
    if(ax>.5&&ax<1.1&&Math.abs(z-(EZ-.38+.05*Math.pow((ax-.8)/.3,2)))<.035*o.age+.01)return {k:1-.15*o.age,ramp:base};}
   // Sommersprossen
   if(o.freckles>0&&z>-.9&&z<.1&&ax<1.5&&hash3(Math.floor(x*9)+40,Math.floor(z*9)+40,7)>1-.14*o.freckles&&noise3(x*9,z*9,3)>.45)return {k:.9,ramp:rouge(.9)};
  }
  // Wangenrouge, Nasenspitze, Ohren
  let t=0;if(y>.8){t=o.rouge*Math.max(0,1-Math.hypot((ax-1.12)/.55,(z+.5)/.42));t=Math.max(t,o.rouge*1.2*Math.max(0,1-Math.hypot(x/.36,(z+.55)/.3,(y-2.6)/.4)));}
  if(ax>1.95&&y>-.8&&y<.7&&z>-1&&z<.8)t=Math.max(t,.25+.3*o.rouge);
  // Bartschatten: Oberlippe, Kinn, Kiefer bis zu den Koteletten, Hals vorn
  if(o.stubble>0&&y>-.3){const cheekLine=-.62-.25*Math.max(0,1-ax/1.2)+.9*smoothstep(1.3,2.05,ax),mouthGap=Math.hypot(x/.62,(z-MZ+.02)/.2)<1;
   const nose=Math.hypot(x/.45,(z+.62)/.28)<1;
   if(z<cheekLine&&!mouthGap&&!nose&&z>-4.6){const n=fbm3(u*5.5,v*5.5,w*5.5,2),s=o.stubble*(.45+.5*n)*smoothstep(0,.22,cheekLine-z);return {k:pore*(1-.1*s),ramp:stub(Math.max(s,t*.4))};}}
  return {k:pore,ramp:t>0?rouge(t):base};};
 const bump=(u,v,w)=>.012*noise3(u*9,v*9,w*9);
 return custom('haut',skin,tex,{spec:.16,shine:12,ramp:base,bump,bumpScale:.8});}

// ---------- Gesicht zusammensetzen ----------
/** Gesichtszüge, Ohrschmuck und Frisur/Bart als Körper. */
export function face(k,F,recipe){const h=k.b.head*k.s,o=faceOptions(recipe),hairCol=recipe.hair?.color||'#5a3b24',solids=[];
 const smile=o.mouth==='grinsen'?1:o.mouth==='kokett'||o.mouth==='schief'||o.mouth==='laecheln'?.6:0;
 const wf=o.breite,shape={jaw:o.jaw,chin:o.chin,cheeks:o.cheeks,nose:o.nose,smile,width:wf},charHead=headLocal(h,shape);// enthält die neutrale Form (F.head)
 const tex=F.H((x,y,z)=>{const t=tilt(x/h,y/h,z/h);return [t[0]/wf*h,t[1]*h,t[2]*h];}),mat=faceSkin(h,o,{skin:recipe.skin||'#e2ab86',hairCol,beardCol:recipe.beard?.color,seed:(recipe.skin||'').length,noFeatures:!!o.stamp});
 // Gesichtshaut: hauchdünn über F.head (neutral), damit das Material mit Gesicht sichtbar ist; Lippen als kleines Relief
 const lips=(x,y,z)=>{let [X,Y,Z]=tilt(x/h,y/h,z/h);X/=wf;if(Math.abs(X)>.8||Z>-.9+FZ||Z<-1.8+FZ||Y<1.3)return 1e3;return ellipsoid(.5,.24,.2)(X,Y-2.02,Z-FZ-MZ+.12)*h;};
 // noShadow: keine Schlagschatten von Haar, Krempe oder Schirm im Gesicht – die Züge bleiben in Spielgröße lesbar (Form über Licht + AO)
 // Pixel-Stempel (figure/stamps.mjs): Lage der Merkmale in Kopfkoordinaten und ihre Farben für den Pixelmaler
 let stamp=null;if(o.stamp){const sk=recipe.skin||'#e2ab86',sr=skinRamp(sk),lip=o.lips?toRgb(o.lips):mixRgb(sk,'#b8574a',.45),brow=o.browColor?toRgb(o.browColor):mixRgb(hairCol,'#241a1a',.45);
  stamp={kind:o.stamp,h,EX,EZ,MZ,FZ,colors:{D:toRgb('#1e1a24'),P:toRgb('#161a26'),I:toRgb(o.iris),W:toRgb('#e6d8c6'),G:toRgb('#f2ead8'),l:sr[2],b:brow,u:mixRgb(lip,'#3a1418',.35),m:lip,n:sr[2],r:mixRgb(sk,'#d8583e',.35)}};}
 solids.push({f:F.H((x,y,z)=>Math.min(charHead(x,y,z),lips(x,y,z)+.04*h)-.02*h),mat,tex,layer:'haut',group:'kopf',noShadow:true,stamp});
 solids.push({f:(x,y,z)=>F.neck(x,y,z)-.02*h,mat,tex,layer:'haut',group:'hals'});
 if(o.earrings){const ring=side=>at(side*2.22,-.02,-.98,rotY(Math.PI/2,torusZ(.26,.07)));
  solids.push({f:F.H((x,y,z)=>{const [X,Y,Z]=tilt(x/h,y/h,z/h);return Math.min(ring(1)(X,Y,Z),ring(-1)(X,Y,Z))*h;}),mat:metal(o.earrings,{shine:40,spec:.9}),layer:'haut',group:'schmuck'});}
 // Bart/Frisur liegen um den Kopf ohne Nase und Ohren (sonst wächst der Bart um die Nase herum)
 solids.push(...hairSolids(k,F,recipe,{head:headDesign({...shape,nose:'ohne',noEars:true}),h}));
 return solids;}
