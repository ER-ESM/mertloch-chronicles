// Sprite-Schmiede · Figuren: Skelett, Rahmen und nackter Körper (E-58). Maßstab 26 E = 1,80 m = 104 px; Winkel in Grad.
// Figurenkoordinaten: x nach rechts (aus Sicht der Figur), y nach vorn (Blickrichtung), z nach oben; Fußpunkt (0,0,0).
import {clamp,mix,at,union,smoothUnion,ellipsoid,capsule,roundCone} from '../sdf.mjs';
import {headLocal} from './face.mjs';

export const D=Math.PI/180;
export const DIRECTIONS=['se','sw','ne','nw'];
/** Drehung der Figur je Blickrichtung (Blick +y lokal → Welt). */
export const FACING={se:45,sw:-45,ne:135,nw:-135};
export const BODY={height:26,build:.5,belly:0,bust:0,shoulders:1,hips:1,head:1,legs:1};

// ---------- Vektoren ----------
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
export const rotXv=(p,a,o=[0,0,0])=>{const c=Math.cos(a),s=Math.sin(a),y=p[1]-o[1],z=p[2]-o[2];return [p[0],o[1]+c*y-s*z,o[2]+s*y+c*z];};
export const rotZv=(p,a,o=[0,0,0])=>{const c=Math.cos(a),s=Math.sin(a),x=p[0]-o[0],y=p[1]-o[1];return [o[0]+c*x-s*y,o[1]+s*x+c*y,p[2]];};
/** Richtung eines hängenden Glieds: Schwung nach vorn (swing), Abspreizen zur Seite (spread, side = ±1).
 * Arme: der Unterarm spreizt standardmäßig mit 0,6 · spread; `fspread` setzt ihn eigens (negativ = zum Körper, Hand in der Hüfte). */
export const limbDir=(swing,spread,side)=>{const a=swing*D,b=spread*D;return [side*Math.sin(b),Math.sin(a)*Math.cos(b),-Math.cos(a)*Math.cos(b)];};

// ---------- Skelett ----------
/** Gelenke aus Körpermaßen und Pose. Oberkörper neigt sich (lean) und dreht sich (twist) um die Hüfte. */
export function skeleton(body={},pose={}){
 const b={...BODY,...body},s=b.height/26,bw=b.build;
 const hipZ=12.6*s*b.legs,kneeZ=6.8*s*b.legs,ankleZ=1*s,shoulderZ=hipZ+6.9*s;
 const hw=1.55*s*b.hips*(.9+.3*bw),sw=3*s*b.shoulders*(.88+.34*bw);
 const thigh=hipZ-kneeZ,shin=kneeZ-ankleZ,ua=4.2*s,fa=3.9*s;
 const P={...pose},root=[0,0,P.lift||0];
 // Beine
 const leg=(side,L={})=>{const hip=add(root,[side*hw,0,hipZ]),d1=limbDir(L.swing||0,L.spread||0,side),knee=add(hip,mul(d1,thigh));
  const d2=limbDir((L.swing||0)-(L.knee||0),L.spread||0,side),ankle=add(knee,mul(d2,shin)),toe=add(ankle,[side*.15,1.9*s,-.55*s]);return {hip,knee,ankle,toe};};
 const legs={l:leg(-1,P.legL),r:leg(1,P.legR)};
 // Bodenkontakt: der tiefere Fuß steht auf dem Boden (ergibt das Wippen beim Gehen von selbst).
 if(!P.free){const low=Math.min(legs.l.ankle[2],legs.r.ankle[2],legs.l.toe[2]+.2,legs.r.toe[2]+.2),dz=ankleZ-low;
  for(const L of Object.values(legs))for(const k of Object.keys(L))L[k]=add(L[k],[0,0,dz]);root[2]+=dz;}
 const pelvis=add(root,[0,0,hipZ+.5*s]),pivot=add(root,[0,0,hipZ]);
 // Oberkörper im gedrehten Rahmen
 const up=p=>rotZv(rotXv(add(root,p),(P.lean||0)*D,pivot),(P.twist||0)*D,pivot);
 const waist=up([0,0,hipZ+2.4*s]),chest=up([0,0,hipZ+5.1*s]),neck=up([0,0,shoulderZ+.7*s]),head=up([0,.15*s,shoulderZ+3.45*s]);
 const arm=(side,A={})=>{const sh=up([side*sw,0,shoulderZ]),d1=limbDir(A.swing||0,A.spread??6,side),rot=p=>rotZv(rotXv(p,(P.lean||0)*D,[0,0,0]),(P.twist||0)*D,[0,0,0]);
  const e=add(sh,mul(rot(d1),ua)),d2=rot(limbDir((A.swing||0)+(A.elbow||0),A.fspread??(A.spread??6)*.6,side)),w=add(e,mul(d2,fa));return {shoulder:sh,elbow:e,wrist:w,hand:add(w,mul(d2,.7*s)),dir:d2};};
 const arms={l:arm(-1,P.armL),r:arm(1,P.armR)};
 return {b,s,hw,sw,hipZ,shoulderZ,root,pelvis,waist,chest,neck,head,legs,arms,lean:(P.lean||0)*D,twist:(P.twist||0)*D,headYaw:(P.headYaw||0)*D+(P.twist||0)*D,headPitch:(P.headPitch||0)*D+(P.lean||0)*D*.5,pivot};
}

// ---------- Rahmen ----------
/** Punkt in den Oberkörper-Rahmen (ohne Neigung/Drehung) zurückführen – für Rumpf, Kleidung am Rumpf, Beiwerk am Rücken. */
export function upperFrame(k){const c1=Math.cos(-k.twist),s1=Math.sin(-k.twist),c2=Math.cos(-k.lean),s2=Math.sin(-k.lean),[px,py,pz]=k.pivot;
 return f=>(x,y,z)=>{let X=x-px,Y=y-py,Z=z-pz;const x1=c1*X-s1*Y,y1=s1*X+c1*Y;X=x1;Y=c2*y1-s2*Z;Z=s2*y1+c2*Z;return f(X+px,Y+py,Z+pz);};}
/** Kopf-Rahmen: Ursprung Kopfmitte, gedreht um Blick (yaw) und Nicken (pitch). */
export function headFrame(k){const [hx,hy,hz]=k.head,cy=Math.cos(-k.headYaw),sy=Math.sin(-k.headYaw),cp=Math.cos(-k.headPitch),sp=Math.sin(-k.headPitch);
 return f=>(x,y,z)=>{const X=x-hx,Y=y-hy,Z=z-hz,x1=cy*X-sy*Y,y1=sy*X+cy*Y;return f(x1,cp*y1-sp*Z,sp*y1+cp*Z);};}

// ---------- Körperteile ----------
/** Der nackte Körper als benannte Distanzfelder (für Haut und als Grundform für Kleidung). */
export function bodyFields(k){
 const {b,s,hw,sw,hipZ}=k,bw=b.build,U=upperFrame(k),H=headFrame(k),r0=k.root[2];
 const chestD=(1.75+.55*bw+.5*b.bust)*s,bellyD=(1.7+.45*bw+1.7*b.belly)*s;
 const chest=U(at(0,0,r0+hipZ+5.1*s,ellipsoid(sw*.93,chestD,2.85*s)));
 const belly=U(at(0,.25*s+b.belly*.9*s,r0+hipZ+2.5*s,ellipsoid(hw+1.05*s+b.belly*.9*s,bellyD,2.5*s)));
 const pelvis=at(0,0,r0+hipZ+.7*s,ellipsoid(hw+1.1*s,(1.65+.3*bw)*s,1.75*s));
 const torso=smoothUnion(1.3*s,chest,belly,pelvis);
 // Hals und Kopf: schlichte Kopfform aus face.mjs (Schädel, Kiefer, Kinn); face.mjs legt die Charakterform mit Gesicht darüber
 const neck=capsule(k.neck,k.head.map((c,i)=>i===2?c-1.4*s:c),(.88+.22*bw)*s);
 const hs=b.head*s,head=H(headLocal(hs,{lite:true}));
 const limbR=.85+.4*bw;
 const armF=a=>union(roundCone(a.shoulder,a.elbow,1.02*s*limbR,.8*s*limbR),roundCone(a.elbow,a.wrist,.78*s*limbR,.6*s*limbR));
 const handF=a=>at(...a.hand,ellipsoid(.62*s,.62*s,.78*s));
 const legF=L=>union(roundCone(L.hip,L.knee,1.55*s*(.85+.35*bw),1.05*s),roundCone(L.knee,L.ankle,1.02*s,.72*s));
 const footF=L=>capsule(add(L.ankle,[0,-.35*s,-.35*s]),L.toe,.72*s);
 return {torso,neck,head,H,U,armL:armF(k.arms.l),armR:armF(k.arms.r),handL:handF(k.arms.l),handR:handF(k.arms.r),legL:legF(k.legs.l),legR:legF(k.legs.r),footL:footF(k.legs.l),footR:footF(k.legs.r),chestD,bellyD};
}

// ---------- Hilfen für Kleidung ----------
export const above=(f,z)=>(x,y,zz)=>Math.max(f(x,y,zz),z-zz);
export const below=(f,z)=>(x,y,zz)=>Math.max(f(x,y,zz),zz-z);
/** Teilstück eines Glieds zwischen Anteil t0 und t1 (0 = Ansatz, 1 = Ende) als Kegelstumpf, aufgeblasen um `pad`. */
export const segment=(a,b2,t0,t1,r0,r1,pad)=>roundCone(add(a,mul([b2[0]-a[0],b2[1]-a[1],b2[2]-a[2]],t0)),add(a,mul([b2[0]-a[0],b2[1]-a[1],b2[2]-a[2]],t1)),mix(r0,r1,t0)+pad,mix(r0,r1,t1)+pad);
