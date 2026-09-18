// Posen des Pre-Render-Rigs: Spalten wie im Präzisions-Katalog (idle, walk-a, walk-pass, walk-b, anticipation, impact, hit, rest)
// und ein Laufzyklus mit 8 Bildern. Werte sind Euler-Winkel in Radiant je Knochen; nicht genannte Knochen stehen auf 0.
const D=Math.PI/180;
const r=(x=0,y=0,z=0)=>({x:x*D,y:y*D,z:z*D});
/** Laufphase t∈[0,1): Beine und Arme gegenläufig, leichter Hüftschwung. */
export function walkPose(t){
 const s=Math.sin(t*Math.PI*2),c=Math.cos(t*Math.PI*2),lift=Math.max(0,-c);
 return {
  hips:r(4,0,s*3),spine:r(4,0,-s*2),chest:r(0,s*6,0),head:r(-4,-s*5,0),
  thighL:r(s*38,0,0),thighR:r(-s*38,0,0),
  shinL:r(Math.max(0,-s)*40+lift*10,0,0),shinR:r(Math.max(0,s)*40+Math.max(0,c)*10,0,0),
  armL:r(-s*30,0,4),armR:r(s*30,0,-4),forearmL:r(-18-Math.max(0,-s)*15,0,0),forearmR:r(-18-Math.max(0,s)*15,0,0)
 };
}
export const POSES={
 idle:{hips:r(0,0,0),chest:r(2,0,0),head:r(-2,0,0),armL:r(4,0,7),armR:r(4,0,-7),forearmL:r(-10,0,0),forearmR:r(-14,0,0),thighL:r(-2,0,3),thighR:r(-2,0,-3)},
 'walk-a':walkPose(.0),'walk-pass':walkPose(.25),'walk-b':walkPose(.5),
 anticipation:{hips:r(0,-25,0),spine:r(-6,-10,0),chest:r(-8,-12,0),head:r(4,18,0),armR:r(-120,0,-30),forearmR:r(-50,0,0),armL:r(30,0,10),forearmL:r(-40,0,0),thighL:r(-14,0,4),thighR:r(18,0,-4),shinR:r(20,0,0)},
 impact:{hips:r(4,20,0),spine:r(10,12,0),chest:r(12,14,0),head:r(-6,-10,0),armR:r(-70,0,-10),forearmR:r(-5,0,0),armL:r(20,0,14),forearmL:r(-30,0,0),thighL:r(16,0,4),thighR:r(-24,0,-4),shinL:r(24,0,0),shinR:r(6,0,0)},
 hit:{hips:r(-6,0,0),spine:r(-12,0,0),chest:r(-14,0,4),head:r(-18,0,-8),armL:r(-40,0,30),armR:r(-40,0,-30),forearmL:r(-60,0,0),forearmR:r(-60,0,0),thighL:r(-8,0,6),thighR:r(6,0,-6),shinR:r(12,0,0)},
 rest:{hips:r(10,0,0),spine:r(8,0,0),chest:r(10,0,0),head:r(-12,0,0),armL:r(-10,0,10),armR:r(-10,0,-10),forearmL:r(-90,0,0),forearmR:r(-90,0,0),thighL:r(-70,0,6),thighR:r(-70,0,-6),shinL:r(95,0,0),shinR:r(95,0,0)}
};
/** Vertikaler Versatz des Rumpfs je Pose (Welteinheiten), damit „rest" sitzt und der Lauf leicht federt. */
export function poseLift(name,t){if(name==='rest')return -5.2;if(name.startsWith('walk')||typeof t==='number')return Math.abs(Math.sin((t??0)*Math.PI*2))*.35;return 0;}
export const COLUMNS=['idle','walk-a','walk-pass','walk-b','anticipation','impact','hit','rest'];
export const WALK_FRAMES=8;
