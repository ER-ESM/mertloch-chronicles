// Sprite-Schmiede · Figuren: Kleidung als Hüllen um die Körperteile (E-56, Detailstufe E-58).
// Jede Funktion bekommt (k = Skelett, F = bodyFields, opt) und liefert Körper {f, mat, tex, layer, group}.
//
// Aufbau eines Kleidungsstücks:
//  · Geometrie: Hülle um Rumpf/Glied plus Faltenwurf als Verschiebung des Distanzfelds (Knickfalten an Ellbogen/Knie je nach
//    Gelenkwinkel, Stauchung am Saum, Bausch an der Taille, Durchhängen nach unten). Verschiebungen nur nahe der Oberfläche
//    rechnen (früher Abbruch) und das Feld mit 0,85 dämpfen, damit der Raymarcher nicht durch die Falten schießt.
//  · Oberflächenkoordinaten (tex) laufen mit dem Körperteil: Rumpf [Bogen quer (0 = vorn Mitte), Höhe über der Hüfte, Abstand
//    zur Achse], Glieder [Bogen (0 = außen, + vorn, ±π innen), Abstand ab Ansatz, Abstand zur Achse], Fuß [längs, quer, hoch].
//  · Stoff = eigenes Material (`tuch`): Webart (Leinen, Köper, Jeans, Canvas, Strick, Wolle, Leder) + Muster (Karo) + Deko:
//    Nähte, Säume, Knopfleisten, Taschen mit Klappe, Nieten, Flicken, Flecken, Abrieb – als Helligkeit, eigene Farbrampe und Relief (bump).
// Maße in Deko-Funktionen sind Körpermaße (durch k.s geteilt), damit sie bei jeder Größe gleich sitzen.
import {clamp,mix,smoothstep,at,union,intersect,ellipsoid,capsule,roundCone,box,inflate,fbm3,noise3,rotZ} from '../sdf.mjs';
import {fabric,leather,metal,custom,rampFrom,hex} from '../materials.mjs';
import {add,mul,above,below,segment,skeleton,bodyFields} from './skeleton.mjs';

// ---------- kleine Mathematik ----------
const TAU=Math.PI*2,PI=Math.PI,fract=x=>x-Math.floor(x),sat=x=>clamp(x,0,1);
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len3=a=>Math.hypot(a[0],a[1],a[2]);
const nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const mixHex=(a,b,t)=>'#'+hex(a).map((c,i)=>Math.round(mix(c,hex(b)[i],t)).toString(16).padStart(2,'0')).join('');
/** Linie: 1 auf der Mittellinie, 0 ab Abstand w. */
const band=(d,w)=>sat(1-Math.abs(d)/w);
/** Linie mit flachem Kern: volle Stärke bis w/2, weich bis w – in Spielgröße ≈ 1 Bildpunkt bei w = 0,12. */
const linie=(d,w)=>sat((w-Math.abs(d))/(w*.5));
/** Ein-Eintrag-Zwischenspeicher: der Raymarcher fragt alle Körper am selben Punkt ab – Rumpf, Rahmen und Gliedkoordinaten nur einmal rechnen. */
const memo3=f=>{let lx=NaN,ly=NaN,lz=NaN,lv;return (x,y,z)=>{if(x===lx&&y===ly&&z===lz)return lv;lx=x;ly=y;lz=z;return lv=f(x,y,z);};};
const MEMO=new WeakMap(),memoOf=(key,name,make)=>{let m=MEMO.get(key);if(!m)MEMO.set(key,m={});return m[name]||(m[name]=make());};
/** Rumpf-Distanzfeld, je Figur zwischengespeichert. */
const torsoM=F=>memoOf(F,'torso',()=>memo3(F.torso));
/** Gestrichelte Steppnaht: Linie im Abstand d, Stiche entlang s. */
const stich=(d,s,w=.09,step=.36)=>linie(d,w)*(fract(s/step)<.62?1:0);
/** Rechteck-Abstand (innen negativ). */
const rect=(x,y,x0,x1,y0,y1)=>Math.max(x0-x,x-x1,y0-y,y-y1);
/** Winkelabstand zweier Winkel (−π … π). */
const dAng=(a,b)=>{let d=a-b;d-=TAU*Math.round(d/TAU);return d;};

// ---------- Farbrampen für Beiwerk am Stoff ----------
const RAMPS=new Map(),R=c=>{let r=RAMPS.get(c);if(!r)RAMPS.set(c,r=rampFrom(c));return r;};
const MESSING='#c9a24e',KUPFER='#b8733a',STAHL='#9aa0a4',HORN='#e8dcc0',GARN_JEANS='#d49a42';

// ---------- Stoffe ----------
/** Webarten: Helligkeit k und Relief h (E) über den Oberflächenkoordinaten u (quer), v (längs). */
const WEBART={
 leinen:(u,v)=>{const x=Math.sin(u*11)*Math.sin(v*11);return {k:1+.03*x,h:.004*x};},
 drill:(u,v)=>{const t=Math.sin((u*.7+v)*TAU/.36);return {k:1+.035*t,h:.006*t};},
 jeans:(u,v)=>{const t=Math.sin((u*.8+v)*TAU/.3);return {k:1+.05*t,h:.006*t};},
 canvas:(u,v)=>{const x=Math.sin(u*TAU/.34),y=Math.sin(v*TAU/.34);return {k:1+.035*x*y+.02*(x+y),h:.006*(x+y)};},
 // Strick: Rippen längs (Rechts-links-Muster), darin versetzte Maschen-V.
 strick:(u,v)=>{const p=fract(u/.62),r=Math.cos(p*TAU),m=Math.cos((v+Math.abs(p-.5)*.55)*TAU/.44);return {k:1+.11*r+.04*m,h:.055*(.5+.5*r)+.012*m};},
 wolle:(u,v,w)=>{const n=noise3(u*2.4,v*2.4,w*2.4)-.5;return {k:1+.1*n,h:.01*n};},
 leder:(u,v,w)=>{const n=noise3(u*1.1,v*1.1,w*1.1);return {k:.88+.24*n,h:.015*n};},
};
/** Karo-Muster (Schotten-Art): Streifen in Zweitfarbe mit heller Mittellinie, Kreuzungen dunkler. */
export function karo(c2,{periode=1.6,breite=.36,linie='#f2d6a2'}={}){
 return (u,v)=>{const fu=fract(u/periode),fv=fract(v/periode),a=fu<breite,b=fv<breite;
  if(Math.abs(fu-breite/2)<.05||Math.abs(fv-breite/2)<.05)return {k:a&&b?.9:1,ramp:R(linie)};
  if(a&&b)return {k:.72,ramp:R(c2)};if(a||b)return {k:.92,ramp:R(c2)};return null;};}
/**
 * Stoff-Material: base = Grundfarbe, art = Webart, muster(u,v,w) → {k,ramp}, deko(u,v,w) → Akkumulator-Werte {k,h,ramp,spec}.
 * Relief (bump) aus Webart + Deko; die Deko läuft daher mehrmals je Bildpunkt – billig halten, früh abbrechen.
 */
export function tuch(base,{art='leinen',muster=null,deko=null,fuzz=.1,relief=1,spec,shine}={}){
 const W=WEBART[art]||WEBART.leinen,isLeder=art==='leder';
 const look=(u,v,w,nurRelief=false)=>{const a=W(u,v,w),o={k:a.k,h:a.h,ramp:null,spec:null,r:nurRelief};
  if(muster&&!nurRelief){const m=muster(u,v,w);if(m){o.k*=m.k??1;if(m.ramp)o.ramp=m.ramp;}}
  if(deko)deko(o,u,v,w);return o;};
 return custom(isLeder?'leder':'stoff-'+art,base,(u,v,w)=>{const o=look(u,v,w),n=fuzz*(fbm3(u*.55,v*.55,w*.55+3,2)-.5);
   return {k:o.k*(1+n),...(o.ramp?{ramp:o.ramp}:{}),...(o.spec!=null?{spec:o.spec}:{})};},
  {spec:spec??(isLeder?.22:.03),shine:shine??(isLeder?16:4),bump:(u,v,w)=>look(u,v,w,true).h*relief,bumpScale:1});}

// ---------- Deko-Bausteine (arbeiten auf dem Akkumulator o = {k,h,ramp,spec}) ----------
const naht=(o,d,w=.08,st=.28)=>{o.k*=1-Math.min(.62,st*1.55)*linie(d,Math.max(w,.1));};
/** Knopf/Niete/Öse: runder Punkt mit eigener Farbe und kleiner Wölbung. */
function knopf(o,dx,dy,r,farbe=HORN,glanz=null){const d=Math.hypot(dx,dy);if(d>r+.06)return false;
 if(d>r){o.k*=.75;return false;}o.ramp=R(farbe);o.h+=.05*Math.sqrt(1-(d/r)**2);o.k*=d<r*.45?1.12:.95;if(glanz!=null)o.spec=glanz;return true;}
/** Aufgesetzte Tasche im Rechteck x0..x1 × y0..y1: Kante, Steppnaht innen, leicht erhaben; Klappe oben mit Knopf; Nieten an den Ecken. */
function tasche(o,x,y,x0,x1,y0,y1,{klappe=0,knopfFarbe=null,garn=null,nieten=null,stoff=null}={}){const d=rect(x,y,x0,x1,y0,y1);if(d>.2)return;
 o.k*=1-.42*band(d,.08);if(d>=0)return;o.h+=.045;if(stoff){o.ramp=R(stoff);}
 const sn=stich(d+.2,x+y,.055,.3);if(garn&&sn>.5)o.ramp=R(garn);else o.k*=1-.28*sn;
 if(klappe){const yk=y1-klappe,dk=Math.max(x0-x,x-x1,yk-y,y-y1);o.k*=1-.5*band(y-yk,.075);if(y>yk)o.h+=.035;
  // Klappe mit abgerundeter Spitze: Schatten unter der Kante
  if(y<yk&&y>yk-.14)o.k*=.8;if(knopfFarbe)knopf(o,x-(x0+x1)/2,y-(yk+.2),.15,knopfFarbe);void dk;}
 if(nieten)for(const [nx,ny] of [[x0+.14,y1-.14],[x1-.14,y1-.14]])knopf(o,x-nx,y-ny,.11,nieten,.7);}
/** Flecken (dunkler) und Abrieb (heller, fleckig) über Rauschen. */
function gebrauch(o,u,v,w,{flecken=0,abrieb=0,seed=0}={}){if(o.r)return;
 if(flecken){const n=fbm3(u*.42+seed,v*.42,w*.35+seed,3);o.k*=1-.2*smoothstep(1-.2*flecken,1-.2*flecken+.04,n+.12);}
 if(abrieb){const n=fbm3(u*.8+seed+7,v*.8,w*.5,2);o.k*=1+.12*abrieb*smoothstep(.45,.75,n);}}
/** Flicken: aufgenähter Stoff in anderer Farbe mit grober Stichnaht. */
function flicken(o,x,y,x0,x1,y0,y1,farbe){const d=rect(x,y,x0,x1,y0,y1);if(d>.12)return;o.k*=1-.4*band(d,.07);if(d>=0)return;
 o.ramp=R(farbe);o.h+=.03;o.k*=1-.35*stich(d+.14,x-y,.06,.26);o.k*=1+.05*Math.sin((x+y)*18);}

// ---------- Rahmen und Oberflächenkoordinaten ----------
/** Punkt → Oberkörper-Rahmen (Rumpf ohne Neigung/Drehung), Höhe relativ zur Hüfte. */
const rumpfP=(k,F)=>memoOf(k,'P',()=>{const P=F.U((x,y,z)=>[x,y,z]),z0=k.root[2]+k.hipZ;return memo3((x,y,z)=>{const p=P(x,y,z);p[2]-=z0;return p;});});
/** Oberflächenkoordinaten am Rumpf: [Bogen (0 = vorn Mitte, + rechts), Höhe über der Hüfte, Abstand zur Achse]. */
function rumpfTex(k,F){const P=rumpfP(k,F);return (x,y,z)=>{const [X,Y,Z]=P(x,y,z),r=Math.hypot(X,Y);return [Math.atan2(X,Y)*r,Z,r];};}
/** Wie rumpfTex, aber im Becken-Rahmen (Hose, Rock – ohne Neigung des Oberkörpers). */
function hueftTex(k){const z0=k.root[2]+k.hipZ;return (x,y,z)=>{const r=Math.hypot(x,y);return [Math.atan2(x,y)*r,z-z0,r];};}
/** Gliedkoordinaten entlang einer Gelenkkette: [Bogen (0 = außen, + vorn, ±π innen), Abstand ab Ansatz, Abstand zur Achse, Neigung der Normalen (z)]. */
function gliedMap(pts,side){return memoOf(pts[0],'map'+side+pts.length+pts[pts.length-1].join(','),()=>memo3(gliedMapRaw(pts,side)));}
function gliedMapRaw(pts,side){const segs=[];let acc=0;
 for(let i=0;i<pts.length-1;i++){const a=pts[i],d=sub3(pts[i+1],a),L=len3(d)||1e-6,ax=[d[0]/L,d[1]/L,d[2]/L],out=[side,0,0];
  let o=sub3(out,mul(ax,dot3(ax,out)));if(len3(o)<.2)o=sub3([0,0,1],mul(ax,ax[2]));o=nrm3(o);segs.push({a,ax,L,o,f:mul(cross3(ax,o),-side),acc});acc+=L;}
 return (x,y,z)=>{let S=segs[0],bt=0,bq=null,bd=1e9;
  for(const G of segs){const px=x-G.a[0],py=y-G.a[1],pz=z-G.a[2],t=clamp(px*G.ax[0]+py*G.ax[1]+pz*G.ax[2],0,G.L),qx=px-G.ax[0]*t,qy=py-G.ax[1]*t,qz=pz-G.ax[2]*t,d=qx*qx+qy*qy+qz*qz;
   if(d<bd){bd=d;S=G;bt=t;bq=[qx,qy,qz];}}
  const r=Math.sqrt(bd)||1e-6,ang=Math.atan2(dot3(bq,S.f),dot3(bq,S.o));return [ang*r,S.acc+bt,r,bq[2]/r];};}

/** Rumpffläche in Ruhehaltung (Oberkörper-Rahmen): y der Vorder- (dir 1) bzw. Rückseite auf Höhe zh über der Hüfte, bei x. */
const REST=new WeakMap();
function rumpfFlaeche(k,zh,x=0,dir=1){let Q=REST.get(k);if(!Q){const k0=skeleton(k.b,{});Q={F:bodyFields(k0),z:k0.root[2]+k0.hipZ,c:new Map()};REST.set(k,Q);}
 const key=zh.toFixed(3)+'|'+x.toFixed(3)+'|'+dir;let y=Q.c.get(key);if(y!=null)return y;
 let lo=0,hi=9*dir;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(Q.F.torso(x,m,Q.z+zh)<0)lo=m;else hi=m;}Q.c.set(key,y=(lo+hi)/2);return y;}

// ---------- Hüllen mit Faltenwurf ----------
/** Rumpfhülle ab Höhe zBot (über der Hüfte): lockerer Fall, Achselzüge, Bausch an der Taille (eingesteckt), eigene Aufdopplungen `relief`. */
function rumpfHuelle(k,F,pad,zBot,{bausch=0,falten=1,relief=null,reliefMax=0}={}){const {s}=k,P=rumpfP(k,F),base=above(inflate(pad*s,torsoM(F)),k.root[2]+k.hipZ+zBot*s);
 const HM=(.12*falten+.18*bausch+reliefMax)*s+.02;
 return (x,y,z)=>{const d=base(x,y,z);if(d>.7)return d-HM;if(d<-1)return d;
  const [X,Y,Z]=P(x,y,z),a=Math.atan2(X,Y),u=a*Math.hypot(X,Y),Zs=Z/s;
  let h=falten*s*.045*(.45+.55*Math.sin(u*TAU/(1.7*s)+Zs*1.1));
  if(bausch){const e=sat(1-Math.abs(Zs-.9)/1.3);if(e>0)h+=bausch*s*e*(.08+.06*Math.sin(u*TAU/(.95*s)+Math.sin(Zs*1.7)));}
  const ea=sat(1-Math.abs(Math.abs(a)-1.3)/.55)*sat(1-Math.abs(Zs-5.5)/1.3);if(ea>0)h+=falten*s*.065*ea*Math.sin((Math.abs(u)*.8+Z)*TAU/(1.1*s));
  if(relief)h+=relief(X,Y,Z,a);
  return (d-h)*.85;};}
/**
 * Ärmel/Hosenbein über der Gelenkkette g = [Ansatz, Gelenk, Ende] mit Radien rr = [Ansatz, Gelenk, Ende], bis Anteil tEnd des Unterteils.
 * innen = Winkel der Knickseite (Arm: +π/2 vorn, Bein: −π/2 hinten). stau = Stauchung am Saum, bausch = Puffärmel, rolle = Krempel-/Umschlagwulst.
 */
function glied(k,g,side,rr,pad,{tEnd=1,innen=PI/2,falten=1,stau=0,bausch=0,rolle=0,rolleH=.9}={}){const {s}=k;
 const L1=len3(sub3(g[1],g[0])),L2=len3(sub3(g[2],g[1])),map=gliedMap(g,side),end=L1+tEnd*L2;
 const d1=nrm3(sub3(g[1],g[0])),d2=nrm3(sub3(g[2],g[1])),bend=Math.acos(clamp(dot3(d1,d2),-1,1));
 let base=union(segment(g[0],g[1],0,1,rr[0],rr[1],pad*s),segment(g[1],g[2],0,tEnd,rr[1],rr[2],pad*s));
 if(rolle){const t0=Math.max(0,tEnd-rolleH*s/L2);base=union(base,segment(g[1],g[2],t0+.04,tEnd,rr[1],rr[2],(pad+rolle)*s));}
 const kb=Math.min(1.25,.25+bend*1.5),HM=(.16*falten*kb+.05+.21*stau+bausch+.08)*s;
 const f=(x,y,z)=>{const d=base(x,y,z);if(d>.7)return d-HM;if(d<-1)return d;
  const [u,t,r,qz]=map(x,y,z),a=u/r;let h=falten*s*.055*(.4+.6*Math.sin(t*TAU/(2.4*s)+a*1.2));
  const dj=t-L1,ej=1-Math.abs(dj)/(1.7*s);
  if(ej>0){const inn=.5+.5*Math.cos(a-innen);h+=falten*s*.17*kb*ej*ej*(.25+.75*inn)*(.35+.65*Math.sin(dj*TAU/(.9*s)+a*.8));}
  if(stau){const de=end-t;if(de>-.5*s&&de<2.4*s){const e=sat(1-de/(2.4*s));h+=stau*s*e*(.06+.15*(.5+.5*Math.sin(de*TAU/(.78*s)+a*1.3)));}}
  if(bausch&&t<L1)h+=bausch*s*Math.sin(PI*t/L1)*(.7+.3*Math.max(0,qz));
  if(t<L1)h+=falten*s*.05*Math.max(0,-qz)*Math.sin(PI*t/L1);   // Schwerkraft: Stoff hängt an der Unterseite durch
  return (d-h)*.85;};
 return {f,tex:map,L1,L2,end,bend};}

/** Gliedradien wie in bodyFields (Ansatz, Gelenk, Ende). */
const armR=k=>{const l=.85+.4*k.b.build;return [1.02*k.s*l,.8*k.s*l,.6*k.s*l];},beinR=k=>[1.55*k.s*(.85+.35*k.b.build),1.05*k.s,.72*k.s];

// ---------- Kragen ----------
/** Stehkragen um den Hals mit Öffnung vorn und aufliegenden Kragenspitzen. */
function kragen(k,F,{pad,hoch=.95,offen=.35,spitzen=true}){const {s}=k,P=rumpfP(k,F),zN=k.shoulderZ-k.hipZ+.55*s;
 const ring=(x,y,z)=>{const dn=F.neck(x,y,z);if(dn>1.6*s)return dn-.6*s;const [X,Y,Z]=P(x,y,z),zz=Z-zN;
  let d=Math.max(Math.abs(dn-.32*s)-.11*s,-zz-.2*s,zz-(hoch-.05*Math.max(0,-Y))*s);
  if(Y>0)d=Math.max(d,-(Math.abs(X)-(offen+.35*Math.max(0,zz/s))*s));return d;};
 if(!spitzen)return ring;
 const yf=rumpfFlaeche(k,(zN/s-.55)*s,.6*s);
 const tip=(x,y,z)=>{const [X,Y,Z]=P(x,y,z),ax=Math.abs(X)/s,zz=(Z-zN)/s;
  const tri=Math.max(offen-.05-ax+(zz+.1)*.35, ax-(offen+1.1+zz*.6), -zz-1.35+ax*.35, zz-.45,(yf-1.2*s-Y)/s)*s;if(tri>.8)return tri;
  return Math.max(Math.abs(torsoM(F)(x,y,z)-(pad+.16)*s)-.08*s,tri);};
 return union(ring,tip);}

export const WARDROBE={
 /**
  * Hemd/Bluse: Rumpf ab Hüfte, Ärmel short|long|rolled (hochgekrempelt)|three4|none.
  * art: leinen|drill|jeans|canvas|strick|wolle; muster: 'karo' (+ karoFarbe) oder Funktion; kragen: true|false; knoepfe, tasche (Brusttasche links),
  * eingesteckt (Bausch + Zugfalten an der Taille), bausch (Puffärmel 0..1), flecken, abrieb.
  */
 hemd(k,F,{color='#e8e0cc',sleeves='short',weave=1.6,layer='hemd',pad=.28,material,art='leinen',muster=null,karoFarbe=null,kragen:kr=true,knoepfe=true,knopfFarbe=null,
  tasche:bt=false,eingesteckt=true,bausch=0,falten=1,flecken=0,abrieb=0}={}){const {s,hipZ}=k;void weave;
  const kf=knopfFarbe||mixHex(color,'#f4ecd8',.6),mu=muster==='karo'?karo(karoFarbe||mixHex(color,'#8a2a14',.45)):typeof muster==='function'?muster:null;
  const bodyDeko=(o,u,v,w)=>{const a=u/w,U=u/s,Z=v/s,aa=Math.abs(a);
   naht(o,(aa-PI/2)*w/s,.07,.26);                                             // Seiten- und Schulternaht
   if(Z>(k.shoulderZ-hipZ)/s+.3)naht(o,Z-(k.shoulderZ-hipZ)/s-1.35,.1,.3);    // Kragenkante
   if(aa>2.2)naht(o,Z-6.1,.07,.25);                                           // Rückenpasse
   if(aa<.7&&Z>.3&&Z<7.9){const e=Math.abs(U);naht(o,e-.3,.07,.34);if(e<.3)o.h+=.015;  // Knopfleiste
    if(knoepfe){const zc=1.1+Math.round((Z-1.1)/1.2)*1.2;if(zc>=1.1&&zc<=6.1)knopf(o,U,Z-zc,.17,kf);}}
   if(bt)tasche(o,U,Z,-2.1,-.85,4.5,5.8,{klappe:.4,knopfFarbe:kf});
   if(eingesteckt&&Z<2.4)o.h+=.03*Math.sin(U*TAU/.75)*sat(1-Math.abs(Z-.9)/1.4);  // Zugfalten am Bund
   gebrauch(o,u,v,w,{flecken,abrieb,seed:1});};
  const m=material||tuch(color,{art,muster:mu,deko:bodyDeko});
  const body0=rumpfHuelle(k,F,pad,.2,{bausch:eingesteckt?.9:0,falten}),body=kr?union(body0,kragen(k,F,{pad})):body0;
  const out=[{f:body,mat:m,tex:rumpfTex(k,F),layer,group:'rumpf'}];
  if(sleeves==='none')return out;
  for(const [n,side] of [['l',-1],['r',1]]){const A=k.arms[n==='l'?'l':'r'],g=[A.shoulder,A.elbow,A.wrist],rr=armR(k);
   const cfg=sleeves==='long'?{tEnd:.92,stau:.35}:sleeves==='rolled'?{tEnd:.34,rolle:.3,rolleH:1}:sleeves==='three4'?{tEnd:.62,stau:.8}:{tEnd:0,rolle:.12,rolleH:.6};
   let G;if(sleeves==='short'){const L1=len3(sub3(A.elbow,A.shoulder));G=glied(k,[A.shoulder,A.elbow,A.wrist],side,rr,pad,{tEnd:0,falten,bausch});
    const f0=G.f,cut=L1*.62;G={...G,f:(x,y,z)=>Math.max(f0(x,y,z),G.tex(x,y,z)[1]-cut),end:cut};}
   else G=glied(k,g,side,rr,pad,{...cfg,falten,bausch});
   const end=G.end,L1=G.L1;
   const sDeko=(o,u,v,w)=>{const a=u/w,T=v/s,E=end/s,di=(PI-Math.abs(a))*w/s;
    naht(o,T-.55,.07,.25);naht(o,di,.07,.2);                                  // Armloch- und Unterarmnaht
    if(sleeves==='long'){naht(o,T-(E-.85),.07,.36);if(T>E-.85)o.h+=.02;knopf(o,(a+.9)*w/s,T-(E-.42),.13,kf);}
    else if(sleeves==='rolled'){const tr=E-1;if(T>tr){naht(o,T-tr,.08,.4);naht(o,T-(tr+.5),.07,.3);o.k*=1.04;}}
    else if(sleeves==='short'){naht(o,T-(E-.35),.06,.3);}
    if(bausch&&T<L1/s)o.h+=.03*Math.sin(a*6)*Math.sin(PI*T/(L1/s));
    gebrauch(o,u,v,w,{flecken,abrieb,seed:3});};
   out.push({f:G.f,mat:material||tuch(color,{art,muster:mu,deko:sDeko}),tex:G.tex,layer,group:'arm'+n});}
  return out;},

 /**
  * Jacke/Weste über dem Hemd. open: true (vorn offen) | 'v' (V-Ausschnitt, unten geknöpft) | false; sleeves: none|long|three4.
  * art: wolle|strick|canvas|drill|leder; kragen: 'revers'|'leiste' (Strickblende)|null; knoepfe (Anzahl); taschen: 'klappe'|'paspel'|'aufgesetzt'|null;
  * buendchen (Rippbündchen an Saum und Ärmel), kapuze, flicken (Farbe der Schulteraufnäher), riegel (Rückenriegel mit Schnalle), laenge (Saum über Hüfte).
  */
 jacke(k,F,{color='#3d4a32',sleeves='none',open=true,layer='jacke',material,pad=.5,art='wolle',kragen:kr,knoepfe,knopfFarbe,taschen,buendchen,kapuze=false,
  flicken:fl=null,flecken=0,abrieb=0,riegel=false,laenge=-.2,falten=1,weite=1}={}){const {s,hipZ}=k,strick=art==='strick';
  kr=kr===undefined?(strick?'leiste':open===true&&sleeves!=='none'?'revers':null):kr;
  taschen=taschen===undefined?(art==='canvas'?'klappe':strick?'aufgesetzt':sleeves==='none'?'paspel':'klappe'):taschen;
  buendchen=buendchen??strick;knoepfe=knoepfe??(open==='v'?5:strick?5:open===false?5:0);
  const kf=knopfFarbe||(strick?mixHex(color,'#3a2418',.55):art==='canvas'?STAHL:mixHex(color,'#1e1a18',.5));
  // Öffnung vorn: halbe Breite über der Hüfte (Körpermaß)
  const oh=Z=>open===true?(.55+.12*Z)*weite:open==='v'?(Z>4?.15+.42*(Z-4):-9):-9;
  const lw=Z=>kr==='revers'&&Z>3.1&&Z<7.4?.95*sat((Z-3.1)/3.2)*(Z>6.6?sat((7.4-Z)/.5):1):0;
  const relief=kr==='revers'?(X,Y,Z)=>{if(Y<0)return 0;const Zs=Z/s,w=lw(Zs);if(!w)return 0;const e=Math.abs(X)/s-oh(Zs);return e>0&&e<w?.1*s*sat((w-e)/.15):0;}:null;
  let body=rumpfHuelle(k,F,pad,laenge,{falten,relief,reliefMax:kr==='revers'?.1:0});
  if(open!==false){const P=rumpfP(k,F),b0=body;body=(x,y,z)=>{const d=b0(x,y,z);if(d>.4)return d;const [X,Y,Z]=P(x,y,z),w=oh(Z/s);if(w<0)return d;
   return Math.max(d,-Math.max(Math.abs(X)-w*s,-Y+.2*s,Z-7.6*s));};}
  const bodyDeko=(o,u,v,w)=>{const a=u/w,aa=Math.abs(a),U=u/s,Z=v/s,X=Math.abs(w*Math.sin(a))/s,front=aa<PI/2,L=laenge;
   naht(o,(aa-PI/2)*w/s,.07,.28);                                             // Seiten-/Schulternaht
   if(!front){naht(o,(PI-aa)*w/s,.07,.3);if(aa>2.3)naht(o,Z-6.2,.07,.25);}      // Rückennaht, Passe
   naht(o,Z-(L+.12),.07,.35);                                                 // Saumkante
   if(buendchen&&Z<L+1.1){o.h+=.03*Math.cos(U*TAU/.45);o.k*=1-.08*Math.cos(U*TAU/.45);naht(o,Z-(L+1.1),.07,.3);}
   if(front){const w0=oh(Z);
    if(w0>-1){const e=X-w0;if(e<.14)o.k*=.72;                                 // Innenkante der Öffnung
     if(kr==='revers'){const lwz=lw(Z);if(lwz&&e<lwz+.1){naht(o,e-lwz,.08,.45);if(e<lwz)o.k*=1.05;}if(Math.abs(Z-6.6)<.12&&e<lwz)o.k*=.6;}
     if(kr==='leiste'&&e<.55){o.h+=.03*Math.cos(Z*TAU/.4);naht(o,e-.55,.07,.3);
      if(knoepfe&&a>0){const zc=.9+Math.round((Z-.9)/1.15)*1.15;if(zc>=.9&&zc<=.9+1.15*(knoepfe-1))knopf(o,e-.27,Z-zc,.18,kf);}}}
    if(open==='v'&&knoepfe&&Z<4.2){naht(o,U,.06,.3);const zc=.8+Math.round((Z-.8)/.9)*.9;if(zc>=.8&&zc<=.8+.9*(knoepfe-1)&&zc<4.2)knopf(o,U-.35,Z-zc,.16,kf);}
    const sx=Math.sign(a);
    if(taschen==='klappe'){tasche(o,X,Z,1.05,2.35,.3,2,{klappe:.55,knopfFarbe:kf});tasche(o,X,Z,1.3,2.3,4.4,5.6,{klappe:.45,knopfFarbe:kf});}
    else if(taschen==='aufgesetzt')tasche(o,X,Z,1.05,2.3,.2,1.9,{});
    else if(taschen==='paspel'){const zz=Z-(1.5+.18*(X-1.5));if(X>1&&X<2.1){naht(o,zz,.06,.5);if(zz>0&&zz<.22)o.h+=.02;}
     if(sx<0&&X>1.2&&X<2){naht(o,Z-5.3,.06,.45);}}}
   else if(riegel&&Math.abs(Z-2.4)<.35&&(PI-aa)*w/s<1.6){o.k*=.9;naht(o,Math.abs(Z-2.4)-.33,.05,.4);}
   gebrauch(o,u,v,w,{flecken,abrieb,seed:5});};
  const m=material||tuch(color,{art,deko:bodyDeko,relief:strick?1.1:1});
  const out=[{f:body,mat:m,tex:rumpfTex(k,F),layer,group:'rumpf'}];
  if(kr==='leiste'||kr==='stehkragen')out.push({f:kragen(k,F,{pad:pad+.05,hoch:.6,offen:.62,spitzen:false}),mat:m,tex:rumpfTex(k,F),layer,group:'rumpf'});
  if(kapuze){// Kapuze im Nacken zusammengefallen, Kordeln vorn
   const zc=k.root[2]+k.shoulderZ+.55*s,yb=rumpfFlaeche(k,k.shoulderZ-k.hipZ,0,-1);
   const hood=F.U((x,y,z)=>Math.max(ellipsoid(2.05*s,1.25*s,1.05*s)(x,y-(yb-.1*s),z-zc),-F.neck(x,y,z)+.35*s));
   out.push({f:hood,mat:tuch(color,{art,deko:(o,u,v,w)=>{naht(o,(PI-Math.abs(u/w))*w/s,.08,.35);o.k*=1-.25*sat((v/s-(k.shoulderZ-hipZ)/s-1)*.8);}}),tex:rumpfTex(k,F),layer,group:'kapuze'});
   const zt=k.root[2]+k.shoulderZ+.3*s,yf=rumpfFlaeche(k,k.shoulderZ-k.hipZ-.3*s,.55*s)+(pad+.1)*s;
   const cords=F.U(union(capsule([-.55*s,yf,zt],[-.62*s,yf+.35*s,zt-2.3*s],.13*s),capsule([.55*s,yf,zt],[.66*s,yf+.3*s,zt-2*s],.13*s)));
   out.push({f:cords,mat:tuch('#e6e0cc',{art:'leinen'}),layer,group:'kordel'});}
  if(sleeves==='long'||sleeves==='three4'){for(const [n,side] of [['l',-1],['r',1]]){const A=k.arms[n];
   const G=glied(k,[A.shoulder,A.elbow,A.wrist],side,armR(k),pad-.06,{tEnd:sleeves==='long'?.86:.6,stau:sleeves==='three4'?1.1:.5,falten:falten*1.15});
   const sDeko=(o,u,v,w)=>{const a=u/w,T=v/s,E=G.end/s;naht(o,T-.6,.07,.3);naht(o,(PI-Math.abs(a))*w/s,.07,.22);
    if(buendchen&&T>E-1){o.h+=.03*Math.cos(u/s*TAU/.45);naht(o,T-(E-1),.07,.3);}else if(!buendchen){naht(o,T-(E-.7),.07,.3);if(T>E-.7)o.h+=.015;}
    if(fl){flicken(o,u/s,T,-.75,.75,.6,2.1,fl);}
    if(fl&&n==='l')flicken(o,(a-PI/2)*w/s,T-G.L1/s,-.6,.6,-.7,.7,mixHex(color,'#2a2a22',.3));
    gebrauch(o,u,v,w,{flecken,abrieb,seed:6+side});};
   out.push({f:G.f,mat:material||tuch(color,{art,deko:sDeko,relief:strick?1.1:1}),tex:G.tex,layer,group:'arm'+n});}}
  return out;},

 /** Weste: ärmellose Jacke mit V-Ausschnitt, Knopfleiste, Paspeltaschen und Rückenriegel. */
 weste(k,F,opt={}){return WARDROBE.jacke(k,F,{color:'#34472f',sleeves:'none',open:'v',riegel:true,pad:.46,laenge:.3,...opt});},

 /** Gürtel: Band um die Taille mit Steppkanten, Löchern, Schnalle (Rahmen + Dorn) und Schlaufe; schlaufen = Farbe der Hosenschlaufen. */
 guertel(k,F,{color='#3a2a22',height=1.2,z=2.2,layer='guertel',buckle='#b8913e',schlaufen=null}={}){const {s,hipZ}=k,r0=k.root[2],zc=r0+hipZ+z*s,P=rumpfP(k,F);
  const band0=intersect(inflate(.45*s,torsoM(F)),(x,y,zz)=>Math.abs(zz-zc)-height*s/2);
  const keeper=(x,y,zz)=>{const d=inflate(.56*s,torsoM(F))(x,y,zz);if(d>1)return d;const [X,Y]=P(x,y,zz),a=Math.atan2(X,Y);if(Y<0)return Math.max(d,-Y);
   return Math.max(d,Math.abs(zz-zc)-height*s/2-.1*s,Math.abs(a*Math.hypot(X,Y)+1.25*s)-.22*s);};
  const out=[{f:buckle?union(band0,keeper):band0,mat:tuch(color,{art:'leder',deko:(o,u,v,w)=>{const Z=v/s-z,U=u/s,hh=height/2;
    naht(o,Math.abs(Z)-(hh-.2),.05,.35);o.k*=1-.25*sat((Math.abs(Z)-hh+.12)/.12);                 // Steppkanten, Kanten dunkler
    if(U<-1.5&&U>-4&&Math.abs(u/w)<1.4){const c=-1.75-Math.round((-U-1.75)/.42)*.42;if(Math.hypot(U-c,Z)<.11)o.k*=.35;}}}),tex:rumpfTex(k,F),layer,group:'guertel'}];
  if(buckle){const yf=rumpfFlaeche(k,z*s)+.5*s,bw=Math.min(.62,height*.52)*s,bh=Math.min(.55,height*.48)*s;
   const frame=F.U(at(0,yf+.1*s,zc,(x,y,zz)=>Math.max(box(bw,.12*s,bh,.08*s)(x,y,zz),-box(bw-.17*s,.3*s,bh-.17*s)(x,y,zz))));
   const dorn=F.U(capsule([-.05*s,yf+.2*s,zc],[bw-.1*s,yf+.2*s,zc],.07*s));
   out.push({f:union(frame,dorn),mat:metal(buckle,{shine:30,spec:.8}),layer,group:'guertel'});}
  if(schlaufen){const loops=(x,y,zz)=>{const d=inflate(.52*s,torsoM(F))(x,y,zz);if(d>1)return d;const [X,Y]=P(x,y,zz),r=Math.hypot(X,Y),a=Math.atan2(X,Y);
    const aL=[.85,1.75,2.75].reduce((m,c)=>Math.min(m,Math.abs(Math.abs(a)-c)),9);return Math.max(d,Math.abs(zz-zc)-height*s/2-.15*s,aL*r-.2*s);};
   out.push({f:loops,mat:tuch(schlaufen,{art:'drill'}),tex:rumpfTex(k,F),layer,group:'guertel'});}
  return out;},

 /**
  * Mieder: geschnürtes Leibchen von `from` bis `to` über der Hüfte – Herzausschnitt oben, Spitze unten, Schnürung vorn mit Ösen,
  * Stäbchennähte, Paspelkanten.
  */
 mieder(k,F,{color='#2e2422',from=.4,to=4.6,layer='mieder',pad=.4,schnur='#e8dcc0',oesen=MESSING,rueckenSchnur=true}={}){const {s}=k,P=rumpfP(k,F);
  const base=inflate(pad*s,torsoM(F));
  const f=(x,y,z)=>{const d=base(x,y,z);if(d>.8)return d-.1;const [X,Y,Z]=P(x,y,z),a=Math.atan2(X,Y),Zs=Z/s;
   const top=to-.55*Math.exp(-a*a/.12)+.25*Math.exp(-((Math.abs(a)-.55)**2)/.08),bot=from-.6*Math.exp(-a*a/.25);
   return Math.max(d,(Zs-top)*s,(bot-Zs)*s);};
  const deko=(o,u,v,w)=>{const a=u/w,U=u/s,Z=v/s,aa=Math.abs(a);
   for(const c of [.55,1.2,2.1])naht(o,(aa-c)*w/s,.06,.3);                    // Stäbchen
   const top=to-.55*Math.exp(-a*a/.12)+.25*Math.exp(-((aa-.55)**2)/.08),bot=from-.6*Math.exp(-a*a/.25);
   if(Z>top-.2||Z<bot+.2){o.k*=.82;naht(o,Math.min(top-Z,Z-bot)-.2,.05,.3);}
   const lace=(x)=>{const e=Math.abs(x);if(e>.55)return;const ph=fract((Z-bot)/.55),cx=.36*(2*ph-1);
    if(linie(x-cx,.13)>.3||linie(x+cx,.13)>.3){o.ramp=R(schnur);o.h+=.03;o.k*=1.08;}
    else if(e<.34)o.k*=.6;                                                     // Spalt: Hemd dunkel darunter
    for(const sx of [-.4,.4]){const zc=bot+.2+Math.round((Z-bot-.2)/.55)*.55;if(zc>bot&&zc<top-.1)knopf(o,x-sx,Z-zc,.1,oesen,.8);}};
   if(aa<.6)lace(U);else if(rueckenSchnur&&aa>2.6)lace((PI-aa)*w/s);};
  return [{f,mat:tuch(color,{art:'drill',deko,spec:.12,shine:12}),tex:rumpfTex(k,F),layer,group:'mieder'}];},

 /**
  * Hose bis zum Knöchel (length 1) oder kurz (length .5). art: drill|jeans|canvas; taschen: 'einfach'|'jeans'|'cargo';
  * gesaess (Gesäßtaschen), umschlag (hochgekrempelter Saum), stau (Stauchung am Schuh), abrieb (Knie/Oberschenkel heller),
  * flicken (Farbe des Knieflickens), schlaufen (Gürtelschlaufen am Bund), flecken, fransen (ausgefranster Saum 0..1).
  */
 hose(k,F,{color='#4b4a3a',length=1,layer='hose',material,pad=.3,art='drill',taschen='einfach',gesaess=true,umschlag=false,stau=1,abrieb=.35,flicken:fl=null,
  schlaufen=true,flecken=0,falten=1,fransen=0}={}){const {s}=k,r0=k.root[2],jeans=art==='jeans',garn=jeans?GARN_JEANS:null,niet=jeans?KUPFER:null;
  const seatF=below(inflate(pad*s,(x,y,z)=>ellipsoid(k.hw+1.1*s,(1.65+.3*k.b.build)*s,1.75*s)(x-k.pelvis[0],y-k.pelvis[1],z-(r0+k.hipZ+.7*s))),r0+k.hipZ+2*s);
  const seatDeko=(o,u,v,w)=>{const a=u/w,aa=Math.abs(a),U=u/s,Z=v/s,X=Math.abs(U);
   // Bund mit Schlaufen
   if(Z>1.45){o.k*=1.03;naht(o,Z-1.47,.06,.4);if(schlaufen){const aL=[.9,1.85,2.8,PI].reduce((m,c)=>Math.min(m,Math.abs(aa-c)),9)*w/s;if(aL<.14&&Z>1.25){o.h+=.05;o.k*=1.06;}naht(o,aL-.14,.05,.35);}}
   else if(aa<PI/2){// vorn: Hosenschlitz (J-Naht), Eingriffstaschen, Nieten
    const dj=Z>.3?U-.5:Math.hypot(Math.max(U,0),Z-.3)-.5;if(U>-.1&&Z<1.45&&Z>-.3){const t=stich(dj,Z+U,.06,.3);if(garn&&t>.5)o.ramp=R(garn);else o.k*=1-.3*band(dj,.07);}
    naht(o,U,.05,.3);
    if(X>1&&X<2.5&&Z>.3){const dp=Math.hypot(X-2.5,Z-1.6)-1.3;naht(o,dp,.07,.45);if(garn&&band(dp+.14,.05)>.5)o.ramp=R(garn);if(niet){knopf(o,X-2.35,Z-.38,.1,niet,.7);knopf(o,X-1.25,Z-1.36,.1,niet,.7);}}}
   else{// hinten: Passe (V), Mittelnaht, Gesäßtaschen
    const bx=(PI-aa)*w/s;naht(o,bx,.06,.3);
    if(jeans){const yy=.95+.35*sat(bx/2.2);const t=band(Z-yy,.06)+band(Z-yy-.16,.05);if(t>.5)o.ramp=R(garn);else o.k*=1-.25*band(Z-yy,.08);}
    if(gesaess){const px=bx-1.35,d=Math.max(Math.abs(px)-.8,Z-(jeans?.8:1.1),(-.55+.3*Math.abs(px)/.8)-Z);
     if(d<.15){o.k*=1-.42*band(d,.07);if(d<0){o.h+=.04;const sn=stich(d+.16,px+Z,.05,.28);if(garn&&sn>.5)o.ramp=R(garn);else o.k*=1-.25*sn;
      if(jeans&&band(Z-(.05+.28*Math.cos(px*2.6)),.05)>.4)o.ramp=R(garn);if(!jeans&&Math.abs(Z-.75)<.07)o.k*=.6;}}}}
   gebrauch(o,u,v,w,{flecken,abrieb:abrieb*.5,seed:11});};
  const out=[{f:seatF,mat:material||tuch(color,{art,deko:seatDeko}),tex:hueftTex(k),layer,group:'huefte'}];
  for(const [n,side] of [['l',-1],['r',1]]){const L=k.legs[n],tEnd=length>=1?.86:.1;
   const G=glied(k,[L.hip,L.knee,L.ankle],side,beinR(k),pad,{tEnd,innen:-PI/2,stau:length>=1?stau:0,falten:falten*1.1,rolle:umschlag?.2:0,rolleH:umschlag===true?1:umschlag||1});
   const th=G.L1/s,E=G.end/s,uh=umschlag===true?1:umschlag||0;
   const deko=(o,u,v,w)=>{const a=u/w,T=v/s,U=u/s,fr=(a-PI/2)*w/s;
    naht(o,U,.06,.3);if(garn){if(band(Math.abs(U)-.15,.045)>.5)o.ramp=R(garn);}         // Außennaht (Jeans: Kappnaht mit Kontrastgarn)
    naht(o,(PI-Math.abs(a))*w/s,.06,.25);
    if(uh&&T>E-uh){naht(o,T-(E-uh),.09,.45);o.k*=1.06;o.h+=.02*Math.sin(T*9);}
    else if(length>=1)naht(o,T-(E-.25),.06,.3);
    if(fransen&&T>E-.3){const n=noise3(u*5.5,3,w*.2);if(n>1-.45*fransen)o.k*=n>1-.2*fransen?1.18:.7;}              // ausgefranster Saum: helle Fäden, dunkle Kerben
    if(taschen==='cargo'&&T>th*.35&&T<th*.9){tasche(o,U-.25*w/s,T,-1.1,1.1,th*.38,th*.88,{klappe:.62,knopfFarbe:mixHex(color,'#1a1814',.5),stoff:mixHex(color,'#d8d0b0',.14)});
     if(Math.abs(U-.25*w/s)<1.1&&T>th*.38&&T<th*.88)naht(o,U-.25*w/s,.05,.2);}
    if(abrieb){const e=sat(1-Math.hypot(fr/1.3,(T-th)/1.5));if(e>0)o.k*=1+.16*abrieb*e*(.6+.8*noise3(u*1.5,v*1.5,3));
     if(jeans){const e2=sat(1-Math.hypot(fr/1.5,(T-th*.5)/(th*.4)));o.k*=1+.12*e2;
      if(T>th-.6&&T<th+.3&&Math.abs(fr)<1.2)o.k*=1-.2*band(fract(T*2.2+fr*.25)-.5,.12);}}                   // Knitterlinien in der Kniekehle
    if(fl&&n==='l')flicken(o,fr,T-th,-.85,.8,-.75,.9,fl);
    gebrauch(o,u,v,w,{flecken,seed:12+side});};
   out.push({f:G.f,mat:material||tuch(color,{art,deko}),tex:G.tex,layer,group:'bein'+n});}
  return out;},

 /** Rock: Kegel von der Taille mit Falten, weicht den Beinen aus; saum = Farbe einer Borte, spitze = Bogenkante. */
 rock(k,F,{color='#e6d6b8',length=5,flare=1.2,layer='rock',falten=1,saum=null,spitze=false}={}){const {s,hipZ,hw}=k,r0=k.root[2],top=r0+hipZ+2.2*s,bot=top-length*s;
  const legs=union(F.legL,F.legR),cone=(x,y,z)=>{const t=clamp((top-z)/(top-bot),0,1),a=Math.atan2(x,y),pl=falten*t*.22*s*(.5+.5*Math.cos(a*9+Math.sin(a*3)));
   const rx=hw+1.35*s+flare*t*s+pl,ry=(1.9+.3*k.b.build+.6*k.b.belly)*s+flare*.6*t*s+pl*.6,d=(Math.hypot(x/rx,y/ry)-1)*Math.min(rx,ry);
   const lb=legs(x,y,z)-.55*s;const dm=Math.min(d,lb+.3*s*t);const sb=spitze?.18*s*Math.abs(Math.sin(a*11)):0;return Math.max(dm*.9,z-top,bot+sb-z)-.1;};
  const deko=(o,u,v,w)=>{const Z=v/s,b=(bot-r0-hipZ)/s;naht(o,Z-(top-r0-hipZ)/s+.35,.07,.35);naht(o,Z-(b+.35),.07,.3);
   if(saum&&Z>b+.45&&Z<b+.9)o.ramp=R(saum);if(spitze&&Z<b+.35&&band(fract(u/s*2.2)-.5,.15)>.3)o.k*=.8;
   o.h+=.02*Math.sin(u/s*TAU*1.4);};
  return [{f:cone,mat:tuch(color,{art:'leinen',deko}),tex:hueftTex(k),layer,group:'rock'}];},

 /**
  * Schürze vorn: gekrümmte Platte von `from` (Höhe über Hüfte) bis `to` (Höhe über dem Boden); Brustlatz mit Nackenband, wenn from > 3.
  * stoff: stoff|leder; tasche (Bauchtasche), naht (Steppnaht an den Kanten), baender (Bindebänder mit Schleife hinten), saum (Farbe einer Borte),
  * emblem (Farbe) + motiv ('hopfen' = Dolde mit Blättern | 'kreis'), emblemZ (Höhe über Hüfte), emblemGroesse, flecken.
  */
 schuerze(k,F,{color='#e8dcc0',from=5.8,to=5,width=1,layer='schuerze',material,stoff='stoff',emblem=null,motiv='hopfen',emblemZ=1,emblemGroesse=1,
  tasche:ta=true,naht:stepp=true,baender=true,saum=null,nieten:nt,flecken=0,falten=1}={}){const {s,hipZ,hw}=k,r0=k.root[2],leder=stoff==='leder';nt=nt??leder;
  const zTop=r0+hipZ+from*s,zBot=r0+to*s,halfW=(hw+1.25*s)*width,waist=r0+hipZ+2.6*s;
  // Die Schürze ist eine Hülle um Rumpf, einen hängenden Stoffzylinder und die Oberschenkel – vorn, zwischen zBot und zTop.
  const ry=(1.85+.35*k.b.build+.9*k.b.belly)*s,rx=hw+1.35*s,hang=(x,y,z)=>Math.max((Math.hypot(x/rx,y/ry)-1)*Math.min(rx,ry),z-(r0+hipZ+1.5*s));
  const core=union(torsoM(F),hang,F.legL,F.legR);
  // Faltenwurf: Stoff fällt unterhalb der Taille in senkrechte Röhrenfalten, Leder bleibt steif mit flachen Wellen
  const fold=(x,z)=>leder?.035*s*(.5+.5*Math.sin(x*TAU/(1.6*s)+z*.3)):.15*falten*s*(.5+.5*Math.sin(x*TAU/(1.15*s)+.4*Math.sin(z*.7)))*sat((waist-z)/(2.5*s)+.25);
  const sheet=(inf,th)=>(x,y,z)=>Math.abs(core(x,y,z)-inf*s-fold(x,z))-th*s;
  const wOf=z=>halfW*(z>waist?.64:1);
  const clip=f=>(x,y,z)=>Math.max(f(x,y,z),Math.abs(x)-wOf(z),.15*s-y,z-zTop,zBot-z);
  const hopfenOn=emblem&&motiv==='hopfen',eZ=hipZ/s+emblemZ;
  const deko=(o,x,z,y)=>{const X=x/s,Z=(z-r0)/s,edge=Math.min((wOf(z)-Math.abs(x))/s,(zTop-z)/s,(z-zBot)/s);
   if(leder){o.k*=.78+.22*sat(edge/.35);o.k*=1-.12*band(fbm3(x*.6,z*.6,2,2)-.5,.02);}          // Kanten gedunkelt, Kratzer
   else o.k*=1-.3*sat(1-edge/.12);
   if(stepp){const t=stich(edge-.3,X+Z,.06,.3);o.k*=1-(leder?.5:.35)*t;if(leder&&t>.5)o.ramp=R(mixHex(color,'#f0d8a8',.45));}
   if(saum&&!leder){const zs=(zBot-r0)/s;if(Z>zs+.45&&Z<zs+.8||Z>zs+1&&Z<zs+1.15)o.ramp=R(saum);}
   if(ta){const zt=hipZ/s-.3;tasche(o,X,Z,-1.7*width,1.7*width,zt-2,zt,{nieten:nt?MESSING:null,garn:leder?mixHex(color,'#f0d8a8',.45):null});
    if(Math.abs(X)<.07&&Z<zt&&Z>zt-2)o.k*=.6;}
   if(nt&&from>3){for(const sx of [-1,1])knopf(o,X-sx*(wOf(zTop)/s-.3),Z-(zTop-r0)/s+.3,.12,MESSING,.7);}
   if(hopfenOn)hopfen(o,X/emblemGroesse,(Z-eZ)/emblemGroesse,emblem);
   else if(emblem){const d=Math.hypot(X,(Z-eZ)*.9)-1.15;if(d<0){o.ramp=R(emblem);o.h+=.03;}o.k*=1-.3*band(d,.06);}
   gebrauch(o,x,z,y,{flecken,seed:21});};
  const tex=(x,y,z)=>[x,z,y];
  const out=[{f:clip(sheet(.42,.16)),mat:material||tuch(color,{art:leder?'leder':'drill',deko}),tex,layer,group:'schuerze'}];
  if(emblem&&!hopfenOn)out.push({f:(x,y,z)=>Math.max(sheet(.5,.14)(x,y,z),Math.hypot(x,(z-(r0+hipZ+emblemZ*s))*.9)-1.15*s,.15*s-y),mat:fabric(emblem,{weave:1}),layer,group:'schuerze'});
  if(baender){// Bindebänder um die Taille, Schleife hinten; Nackenband beim Latz
   const bm=leder?tuch(mixHex(color,'#3a2418',.35),{art:'leder'}):tuch(color,{art:'leinen',deko:(o,u,v)=>{o.h+=.015*Math.sin(v*9);}});
   const P=rumpfP(k,F),zw=hipZ+2.6*s,yb=rumpfFlaeche(k,2.6*s,0,-1)-.52*s,zr=k.root[2];
   const tie=(x,y,z)=>{const d=inflate(.55*s,torsoM(F))(x,y,z);if(d>1)return d;const [,Y,Z]=P(x,y,z);return Math.max(d,Math.abs(Z-2.6*s)-.24*s,Y);};
   const bow=F.U(at(0,yb,zr+zw,union(rotZ(.25,at(.72*s,0,.12*s,ellipsoid(.78*s,.24*s,.44*s))),rotZ(-.25,at(-.72*s,0,.12*s,ellipsoid(.78*s,.24*s,.44*s))),ellipsoid(.3*s,.3*s,.34*s),
    capsule([.1*s,-.05*s,-.1*s],[.55*s,-.2*s,-2.3*s],.16*s),capsule([-.1*s,-.05*s,-.1*s],[-.4*s,-.15*s,-2.6*s],.16*s))));
   out.push({f:tie,mat:bm,tex:rumpfTex(k,F),layer,group:'schleife'},{f:bow,mat:bm,tex:rumpfTex(k,F),layer,group:'schleife'});
   if(from>3){const zt=from*s,xt=wOf(zTop)-.35*s,yt=rumpfFlaeche(k,zt,xt)+.5*s,zs=k.shoulderZ-hipZ,yn=rumpfFlaeche(k,zs+.5*s,1.25*s,-1);
    const strap=F.U(at(0,0,zr+hipZ,union(capsule([-xt,yt,zt],[-1.3*s,.35*s,zs+.95*s],.17*s),capsule([xt,yt,zt],[1.3*s,.35*s,zs+.95*s],.17*s),
     capsule([-1.3*s,.35*s,zs+.95*s],[-1.1*s,yn+.1*s,zs+.8*s],.17*s),capsule([1.3*s,.35*s,zs+.95*s],[1.1*s,yn+.1*s,zs+.8*s],.17*s),capsule([-1.1*s,yn+.1*s,zs+.8*s],[1.1*s,yn+.1*s,zs+.8*s],.17*s))));
    out.push({f:strap,mat:bm,tex:rumpfTex(k,F),layer,group:'schleife'});}}
  return out;},

 /**
  * Schuhe/Stiefel: Oberleder bis `height` über dem Knöchel, Sohle als eigene Gruppe (Innenlinie), Schnürung mit Ösen, Kappe, Rahmennaht.
  * art: 'stiefel'|'schuh'|'sneaker'; sohle (Farbe), senkel (Farbe), stulpe (umgeschlagener Schaft), absatz (dickere Ferse), streifen (Seitenstreifen, Sneaker).
  */
 schuhe(k,F,{color='#4a3222',height=1.2,layer='schuhe',material,pad=.3,art,sohle,senkel,stulpe=false,absatz=0,streifen=null,flecken=.4}={}){const {s}=k;
  art=art||(height>=1.5?'stiefel':'schuh');const snk=art==='sneaker';sohle=sohle||(snk?'#c4b89c':'#2e2622');senkel=senkel||(snk?'#f0ece0':mixHex(color,'#d8c8a0',.55));
  const out=[];
  for(const [n,L] of [['l',k.legs.l],['r',k.legs.r]]){
   const heel=add(L.ankle,[0,-.4*s,-.35*s]),toe=add(L.toe,[0,.1*s,0]),Rf=(.72+pad)*s,ax=nrm3(sub3(toe,heel)),up=nrm3(sub3([0,0,1],mul(ax,ax[2]))),lat=cross3(ax,up),Lf=len3(sub3(toe,heel));
   // Oberleder: zur Spitze flacher werdender Leisten + Schaft; unten auf der Sohle abgeschnitten. Sohle: flache Platte mit Umriss des
   // Leistens, etwas breiter – so zeigt sie in der Schrägsicht eine eigene Seitenwand (eigene Gruppe → Innenlinie).
   const hTop=height/5.8,toeR=snk?.84:.8,last=roundCone(heel,toe,Rf,Rf*toeR),shaft=segment(L.ankle,L.knee,-.05,hTop,.75*s,1*s,pad*s);
   const loc=(x,y,z)=>{const p=[x-heel[0],y-heel[1],z-heel[2]];return [dot3(p,ax),dot3(p,lat),dot3(p,up)];};
   const solH=(snk?.66:.44)*s,solTop=al=>-Rf+solH+absatz*s*sat(1-al/(Lf*.3+Rf*.3));
   let up0=union(last,shaft);if(stulpe)up0=union(up0,segment(L.ankle,L.knee,hTop-.8*s/len3(sub3(L.knee,L.ankle)),hTop+.02,.75*s,1*s,(pad+.2)*s));
   const upper=(x,y,z)=>{const d=up0(x,y,z);if(d>.8)return d;const [al,,hu]=loc(x,y,z);return Math.max(d,solTop(al)-.04*s-hu);};
   const sole=(x,y,z)=>{const [al,la,hu]=loc(x,y,z),ac=clamp(al,0,Lf),r=Math.hypot(al-ac,la)-mix(Rf,Rf*toeR,ac/Lf)*(snk?1.1:1.07);
    return Math.max(r,-Rf-.06*s-hu,hu-solTop(al))*.9;};
   // Schnürlinie: vom Rist den Schaft hinauf (in Fußkoordinaten längs/hoch)
   const A=[Lf*.62,Rf*.72],B=[Lf*.12+Rf*.35,Rf*.4+hTop*len3(sub3(L.knee,L.ankle))*.95];
   const deko=(o,al,la,hu)=>{const AL=al/s,LA=la/s,HU=hu/s;
    naht(o,(hu-(-Rf+solH+.12*s))/s,.05,.35);                                           // Rahmennaht über der Sohle
    const cx=Math.max(0,al-Lf*.78)/s;if(cx>0)naht(o,al/s-Lf*.78/s-.18*(LA*LA),.06,.35);     // Kappe
    if(stulpe){const zr=hu/s,tt=(hTop*len3(sub3(L.knee,L.ankle))-.8*s)/s+Rf/s*.4;naht(o,zr-tt,.07,.45);}
    // Schnürung
    const ex=B[0]-A[0],ey=B[1]-A[1],t=clamp(((al-A[0])*ex+(hu-A[1])*ey)/(ex*ex+ey*ey),0,1),dl=Math.hypot(al-A[0]-ex*t,hu-A[1]-ey*t)/s;
    if(dl<.7&&Math.abs(LA)<.6&&hu>0){const along=t*Math.hypot(ex,ey)/s,ph=fract(along/.55),cxl=.36*(2*ph-1);
     if(Math.abs(LA)<.3)o.k*=.62;                                                     // Zunge im Schlitz
     if(band(LA-cxl,.09)>.35||band(LA+cxl,.09)>.35){o.ramp=R(senkel);o.h+=.03;o.k=Math.max(o.k,1);}
     for(const sx of [-.4,.4])if(Math.abs(fract(along/.55+.5)-.5)<.12)knopf(o,LA-sx,(fract(along/.55+.5)-.5)*.55,.09,snk?'#d8d2c4':STAHL,.6);}
    if(snk&&streifen&&Math.abs(LA)>.45&&al>Lf*.28&&al<Lf*.72&&hu>-Rf+solH){const q=fract((AL*.9+HU*.7)/.72);if(q<.42&&AL<Lf/s*.72-.1)o.ramp=R(streifen);else if(q<.5)o.k*=.8;}
    if(snk&&al>Lf*.8)o.k*=1+.04*Math.sin(AL*20)*Math.sin(LA*20);                       // Lochung an der Kappe
    if(!snk){o.h+=.02*Math.sin(HU*TAU/.5)*sat(1-Math.abs(HU-Rf/s*.9)/.7)*(al>Lf*.25?1:0);   // Gehfalten am Rist
     gebrauch(o,al,la,hu,{flecken,abrieb:.6,seed:31});}};
   const sDeko=(o,al,la,hu)=>{const top=-Rf+solH;if(snk){if(Math.abs(hu-(top-solH*.55))<.1*s)o.ramp=R(streifen||'#3e6a3a');naht(o,(hu-top)/s,.08,.45);o.k*=.9;}
    else{naht(o,(hu-(top-.05*s))/s,.05,.3);if(absatz&&al<Lf*.35)o.k*=.9;}};
   out.push({f:upper,mat:material||tuch(color,{art:snk?'canvas':'leder',deko,spec:snk?.08:.3,shine:snk?6:20}),tex:loc,layer,group:'fuss'+n});
   out.push({f:sole,mat:tuch(sohle,{art:snk?'leinen':'leder',deko:sDeko,spec:.1,shine:8}),tex:loc,layer,group:'sohle'+n});}
  return out;},

 /** Handschuhe mit Stulpe, Riegel und Knöchelnähten. */
 handschuhe(k,F,{color='#2c2a28',layer='handschuhe',stulpe=true}={}){const {s}=k,out=[];
  for(const [n,side] of [['l',-1],['r',1]]){const A=k.arms[n],map=gliedMap([A.elbow,A.wrist,A.hand],side),L2=len3(sub3(A.wrist,A.elbow));
   let f=inflate(.18*s,n==='l'?F.handL:F.handR);if(stulpe)f=union(f,segment(A.elbow,A.wrist,.78,1.02,.78*s,.6*s,.24*s));
   const deko=(o,u,v,w)=>{const T=(v-L2)/s,a=u/w;naht(o,T+.95,.07,.4);naht(o,T-.05,.06,.3);
    if(T>-.9&&T<-.35&&Math.abs(dAng(a,-.4))<.5){o.k*=.85;if(Math.abs(dAng(a,-.4))<.14)o.ramp=R(STAHL);}
    if(T>.45)naht(o,T-.62,.05,.28);gebrauch(o,u,v,w,{abrieb:.8,seed:41});};
   out.push({f,mat:tuch(color,{art:'leder',deko}),tex:map,layer,group:'hand'+n});}
  return out;},

 /** Fischerhut (Steppringe auf der Krempe, Bahnen, Hutband, Lüftungsösen, leicht verbeult) / Schiebermütze. */
 hut(k,F,{color='#56603c',kind='fischer',layer='hut',beule=1,hutband=null,aufkleber='#3a66b0'}={}){const hs=k.b.head*k.s,bandC=hutband||mixHex(color,'#2a2a22',.35);
  if(kind==='bauhelm')return bauhelm(k,F,{color,layer,aufkleber});
  if(kind==='fischer'){
   const crown=(x,y,z)=>{const zz=z-1.25*hs,r=Math.hypot(x,y),Rr=2.35*hs-.2*hs*sat(zz/(1.5*hs)),dent=beule*.3*hs*Math.exp(-x*x/(.45*hs*hs))*sat((r/hs-.2)/1)*(y>0?1:.6),H=1.5*hs-dent,rr=.45*hs;
    const dx=r-Rr+rr,dz=Math.abs(zz-H/2)-H/2+rr;return Math.min(Math.max(dx,dz),0)+Math.hypot(Math.max(dx,0),Math.max(dz,0))-rr;};
   const brim=(x,y,z)=>{const r=Math.hypot(x,y),ph=Math.atan2(x,y),droop=beule*(.13*hs*(1+Math.cos(2*ph))*sat((r-2.4*hs)/(.7*hs))+.06*hs*Math.sin(3*ph+1)*sat((r-2.4*hs)/(.7*hs)));
    return Math.max(r-3.1*hs-.08*hs*Math.sin(5*ph),2*hs-r,Math.abs(z-(1.15*hs-.22*(r-2.2*hs)-droop))-.2*hs);};
   const deko=(o,x,y,z)=>{const r=Math.hypot(x,y)/hs,ph=Math.atan2(x,y),Z=z/hs;
    if(r>2.42&&Z<1.4){for(const rr of [2.62,2.82,3.0])o.k*=1-.4*stich(r-rr,ph*r*hs,.045,.26);if(r>3.02)o.k*=.85;o.h+=.012*Math.sin(r*TAU/.2);}
    else if(Z<1.62){o.ramp=R(bandC);naht(o,Z-1.6,.04,.4);}
    else{const pa=Math.abs(dAng(ph*3,0))/3;naht(o,pa*r,.06,.35);if(Z>2.5)naht(o,r-1.3,.05,.3);
     for(const sx of [-1,1])knopf(o,dAng(ph,sx*PI/2)*r,Z-2.05,.13,STAHL,.7);}
    o.k*=1+.06*(noise3(x*1.3,y*1.3,z*1.3)-.5);};
   return [{f:F.H(union(crown,brim)),mat:tuch(color,{art:'canvas',deko}),tex:F.H((x,y,z)=>[x,y,z]),layer,group:'hut'}];}
  const deko=(o,x,y,z)=>{const ph=Math.atan2(x,y);if(z<1*hs&&y>1.2*hs)naht(o,(z-.95*hs)/hs,.05,.3);else naht(o,(Math.abs(dAng(ph*4,0))/4)*Math.hypot(x,y)/hs,.05,.3);
   if(Math.hypot(x,y+.1*hs)<.25*hs&&z>2.2*hs)o.k*=.8;};
  const f=union(at(0,-.1*hs,1.3*hs,ellipsoid(2.35*hs,2.45*hs,1.1*hs)),at(0,1.9*hs,.95*hs,ellipsoid(1.7*hs,1.2*hs,.25*hs)));
  return [{f:F.H(f),mat:tuch(color,{art:'wolle',muster:null,deko}),tex:F.H((x,y,z)=>[x,y,z]),layer,group:'hut'}];},

 /** Halstuch: Dreieckstuch mit Knoten vorn (Farbe, Muster wie hemd). */
 tuch(k,F,{color='#a8402a',layer='tuch',muster=null,karoFarbe=null}={}){const {s,hipZ}=k,P=rumpfP(k,F),zN=k.shoulderZ-hipZ+.45*s;
  const mu=muster==='karo'?karo(karoFarbe||mixHex(color,'#1e1a18',.5),{periode:.9}):null,yf=rumpfFlaeche(k,zN-.7*s)+.2*s;
  const ring=(x,y,z)=>{const dn=F.neck(x,y,z);if(dn>1.6*s)return dn-.6*s;const [,,Z]=P(x,y,z);return Math.max(Math.abs(dn-.3*s)-.2*s,Math.abs(Z-zN)-.45*s);};
  const knot=F.U(at(0,yf,k.root[2]+hipZ+zN-.6*s,union(ellipsoid(.45*s,.3*s,.38*s),capsule([.1*s,.05*s,-.2*s],[.35*s,.35*s,-1.4*s],.2*s),capsule([-.1*s,.05*s,-.2*s],[-.2*s,.3*s,-1.2*s],.2*s))));
  return [{f:union(ring,knot),mat:tuch(color,{art:'leinen',muster:mu,deko:(o,u,v)=>{o.h+=.03*Math.sin(v/s*TAU/.5+u);}}),tex:rumpfTex(k,F),layer,group:'tuch'}];},

 // ---------- Stammgäste (E-61) ----------
 /** Rennstreifen: heller Lederstreifen außen über beide Jackenärmel (Schulter bis Bündchen), sitzt auf den Ärmeln von `jacke`
  *  (gleiche Faltenlage: pad, tEnd, stau wie dort). breite = halbe Streifenbreite in Körpermaß. */
 rennstreifen(k,F,{color='#efe8d6',pad=.5,breite=.34,tEnd=.86,falten=1,layer='jacke'}={}){const {s}=k,out=[];
  for(const [n,side] of [['l',-1],['r',1]]){const A=k.arms[n];
   const G=glied(k,[A.shoulder,A.elbow,A.wrist],side,armR(k),pad-.06+.06,{tEnd,stau:.5,falten:falten*1.15});
   const f=(x,y,z)=>{const d=G.f(x,y,z);if(d>.6)return d;const [u,t]=G.tex(x,y,z);return Math.max(d,Math.abs(u)-breite*s,.15*s-t,t-(G.end-.75*s));};
   const deko=(o,u,v)=>{naht(o,(Math.abs(u)/s-breite)+.1,.05,.35);};
   out.push({f,mat:tuch(color,{art:'leder',deko}),tex:G.tex,layer,group:'arm'+n});}
  return out;},

 /** Warnweste: Weste mit V-Ausschnitt ohne Knöpfe, zwei silberne Reflexstreifen rundum (Höhe über der Hüfte in `streifen`). */
 warnweste(k,F,{color='#e8792a',reflex='#d8dcdc',streifen=[1.25,2.85],pad=.46,laenge=.3,layer='weste',...opt}={}){const {s}=k,P=rumpfP(k,F);
  const out=WARDROBE.weste(k,F,{color,pad,laenge,knoepfe:0,taschen:null,riegel:false,layer,...opt});
  const shell=inflate((pad+.15)*s,torsoM(F));
  const f=(x,y,z)=>{const d=shell(x,y,z);if(d>1)return d;const Zs=P(x,y,z)[2]/s;let e=9;for(const c of streifen)e=Math.min(e,Math.abs(Zs-c)-.3);return Math.max(d,e*s);};
  const mat=custom('reflex',reflex,(u,v,w,n)=>({k:(n&&n[0]<-.2&&n[1]>.1?1.3:1)*(.96+.06*Math.sin(u*TAU/.5))}),{spec:.9,shine:30});
  out.push({f,mat,tex:rumpfTex(k,F),layer,group:'reflex'});
  return out;},

 /** Badelatschen mit Tennissocken: weiße Rippsocke bis über den Knöchel, flache dunkle Sohle, breiter Riemen über dem Rist mit drei hellen Streifen. */
 latschen(k,F,{color='#1f2a48',sohle='#26262c',socke='#f0ede2',streifen='#eeeae0',ringel='#9aa4b8',sockH=.36,layer='schuhe'}={}){const {s}=k,out=[];
  for(const [n,L] of [['l',k.legs.l],['r',k.legs.r]]){
   const heel=add(L.ankle,[0,-.4*s,-.35*s]),toe=add(L.toe,[0,.1*s,0]),Rf=(.72+.13)*s,ax=nrm3(sub3(toe,heel)),up=nrm3(sub3([0,0,1],mul(ax,ax[2]))),lat=cross3(ax,up),Lf=len3(sub3(toe,heel));
   const loc=(x,y,z)=>{const p=[x-heel[0],y-heel[1],z-heel[2]];return [dot3(p,ax),dot3(p,lat),dot3(p,up)];};
   const foot=roundCone(heel,toe,Rf,Rf*.84),shaft=segment(L.ankle,L.knee,-.05,sockH,.75*s,1*s,.16*s);
   const sock=union(foot,shaft);
   const sockDeko=(o,al,la,hu)=>{const top=sockH*len3(sub3(L.knee,L.ankle))+Rf*.4;if(hu>top-.6*s){o.k*=1+.06*Math.cos(la/s*TAU/.3);if(Math.abs(hu-(top-.35*s))<.12*s)o.ramp=R(ringel);}};
   const sole=(x,y,z)=>{const [al,la,hu]=loc(x,y,z),ac=clamp(al,-.1*s,Lf+.2*s),r=Math.hypot(al-ac,la)-mix(Rf,Rf*.84,clamp(al/Lf,0,1))*1.12;
    return Math.max(r,-Rf-.08*s-hu,hu-(-Rf+.34*s))*.9;};
   const strap=(x,y,z)=>{const d=foot(x,y,z)-.14*s;if(d>.6)return d;const [al,,hu]=loc(x,y,z);return Math.max(d,Math.abs(al-Lf*.6)-Lf*.2,-Rf+.2*s-hu);};
   const sDeko=(o,al,la,hu)=>{const q=(al-Lf*.4)/(Lf*.4);if(q>0&&q<1&&Math.abs(la)>.25*s){const f=fract(q*3);if(f>.3&&f<.72)o.ramp=R(streifen);}naht(o,(Math.abs(al-Lf*.6)-Lf*.2)/s,.06,.4);};
   out.push({f:sock,mat:tuch(socke,{art:'strick',deko:sockDeko,relief:.6}),tex:loc,layer,group:'socke'+n});
   out.push({f:strap,mat:tuch(color,{art:'leder',deko:sDeko,spec:.3,shine:18}),tex:loc,layer,group:'riemen'+n});
   out.push({f:sole,mat:tuch(sohle,{art:'leder',deko:(o,al,la,hu)=>{naht(o,(hu-(-Rf+.26*s))/s,.05,.3);},spec:.15,shine:8}),tex:loc,layer,group:'sohle'+n});}
  return out;},
};

/** Bauhelm (Kopf-Rahmen): glatte Kunststoffschale mit Mittelgrat, Randwulst und kleinem Schirm vorn, Aufkleber an der linken Seite. */
function bauhelm(k,F,{color='#eeece4',layer='hut',aufkleber='#3a66b0'}={}){const hs=k.b.head*k.s,zc=1.02*hs,yc=-.12*hs,Rx=2.6*hs,Ry=2.84*hs,Rz=2.1*hs;
 const shell=ellipsoid(Rx,Ry,Rz),dome=(x,y,z)=>Math.max(shell(x,y-yc,z-zc),zc+.02*hs-z);
 const ridge=(x,y,z)=>Math.max(ellipsoid(Rx+.22*hs,Ry+.24*hs,Rz+.26*hs)(x,y-yc,z-zc),Math.abs(x)-.36*hs,zc+.75*hs-z);
 const lip=(x,y,z)=>{const e=(Math.hypot(x/(Rx+.16*hs),(y-yc)/(Ry+.16*hs))-1)*Rx;return Math.max(e,-(e+.45*hs),Math.abs(z-zc-.14*hs)-.15*hs);};
 // Schirm kurz halten: die Augen liegen im Kopf-Rahmen bei z ≈ 0,5 h (Gesicht ist zur Kamera geneigt) und sollen darunter sichtbar bleiben
 const peak=(x,y,z)=>{const Y=y-yc,e=(Math.hypot(x/(1.95*hs),(Y-1.45*hs)/(1.75*hs))-1)*1.8*hs,zp=zc+.14*hs-.2*Math.max(0,Y-Ry*.75);
  return Math.max(e,Math.abs(z-zp)-.12*hs,Ry*.5-Y);};
 const deko=(o,x,y,z)=>{const X=x/hs,Y=(y-yc)/hs,Z=(z-zc)/hs;
  if(Math.abs(X)<.42&&Z>.7)naht(o,Math.abs(X)-.38,.05,.45);                          // Kanten des Mittelgrats
  if(Z<.32)o.k*=.93;                                                                 // Randwulst etwas dunkler
  if(X<-1.4&&Math.abs(Y+.15)<.62&&Math.abs(Z-1.05)<.42){o.ramp=R(aufkleber);if(Math.hypot(Y+.15,Z-1.05)<.22)o.ramp=R('#f2efe6');}
  o.k*=1+.03*(noise3(x*1.1,y*1.1,z*1.1)-.5);};
 const mat=custom('kunststoff',color,(x,y,z,n)=>{const o={k:1,h:0,ramp:null,spec:null,r:false};deko(o,x,y,z);const g=n&&n[0]<-.25&&n[0]>-.9&&n[1]>.1?1.12:1;
  return {k:o.k*g,...(o.ramp?{ramp:o.ramp}:{})};},{spec:.6,shine:30});
 return [{f:F.H(union(dome,ridge,lip,peak)),mat,tex:F.H((x,y,z)=>[x,y,z]),layer,group:'hut'}];}

/** Hopfendolde als Stickerei/Druck: Dolde aus Reihen spitzer, überlappender Deckblätter (hängt nach unten), zwei gelappte Blätter mit
 * Adern, Stiel mit Ranke. x quer, y hoch (Einheit ≈ E bei Größe 1). */
export function hopfen(o,x,y,farbe){if(Math.abs(x)>2.2||y<-1.7||y>2.1)return;
 const hell=mixHex(farbe,'#c8dc78',.5),dunkel=mixHex(farbe,'#1a2610',.5);
 // Blätter: dreilappig (Grundellipse + zwei Seitenlappen), gezähnt, Mittel- und Seitenadern
 for(const sx of [-1,1]){const cx=sx*.98,cy=1.12,ang=sx*.5,dx=x-cx,dy=y-cy,lx=(dx*Math.cos(ang)+dy*Math.sin(ang))*sx,ly=-dx*Math.sin(ang)*sx+dy*Math.cos(ang);
  const th=Math.atan2(ly,lx),rr=Math.hypot(lx/.6,ly/.38),lobe=1+.28*Math.cos(3*(th-.1))-.1*Math.abs(Math.sin(th*9)),e=rr-lobe;
  if(e<0){o.ramp=R(farbe);o.h+=.035;const vein=Math.min(Math.abs(ly),Math.abs(ly-.55*lx),Math.abs(ly+.55*lx));o.k*=vein<.045&&lx>-.2?.62:1+.1*lx;return;}
  if(e<.1){o.ramp=R(dunkel);o.k*=.8;return;}}
 const stem=Math.abs(x-.14*Math.sin(y*3.2))-.075;if(y>.75&&y<2&&stem<0){o.ramp=R(dunkel);return;}
 // Dolde: Tropfen mit Spitze unten, t = 0 (Spitze) … 1 (Ansatz)
 const t=(y+1.45)/2.25;if(t<0||t>1)return;const W=.9*Math.pow(Math.sin(PI*Math.min(t*.9+.06,1)),.6)*(.7+.3*t),d=Math.abs(x)-W;
 if(d>.1)return;if(d>0){o.ramp=R(dunkel);o.k*=.8;return;}
 const rows=3.6,row=Math.floor(t*rows),fy=fract(t*rows),fx=fract(x/.62+(row%2)*.5)-.5,edge=fy-.42*Math.pow(Math.abs(fx)*2,1.3);
 if(edge<0&&edge>-.13){o.ramp=R(dunkel);o.k*=.85;return;}
 const g=edge<0?1-(-edge):fy;o.ramp=R(g<.35?hell:farbe);o.h+=.03+.04*(1-g);o.k*=1.08-.22*g-.12*Math.abs(fx);}

