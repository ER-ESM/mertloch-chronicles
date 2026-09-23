// Sprite-Schmiede · Figuren: Posen als Gelenkwinkel (E-56).
// Jede Pose bekommt die Grundhaltung b der Figur (Rezept `pose`) und mischt sie ein:
//   b.armL/armR   Armwinkel {swing, spread, elbow, fspread}; mit `hold:true` trägt der Arm etwas (Kasten, Pümpel) und
//                 behält seine Haltung im Laufzyklus und in allen Kampfspalten (kein Pendeln, kein Ausholen).
//   b.legL/legR   Beinwinkel für die Grundhaltung (idle), z. B. breitbeinig.
//   b.weight      Gewichtsverlagerung in idle: 1 = Standbein rechts (linkes Knie locker), −1 = Standbein links.
//   b.lean, b.twist, b.headYaw, b.headPitch   Neigung, Drehung, Blick – wirken in allen Posen (Lauf addiert seine Drehung).
const S=Math.sin,C=Math.cos,T2=Math.PI*2;
/** Arm der Grundhaltung, falls er etwas trägt – sonst die Vorgabe der Pose. */
const held=(b,n,def)=>b[n]?.hold?b[n]:def;
/** Gehzyklus: Phase 0..1, Beine ±swing, Knie im Vorschwung gebeugt, Arme gegengleich (tragende Arme bleiben ruhig). */
export function walkPose(ph,{swing=27,arm=20,base={}}={}){const a=S(T2*ph),fw=x=>Math.max(0,x);
 const knee=p=>6+42*Math.pow(fw(C(T2*p)),1.4);
 const swingArm=(n,sgn)=>{const A=base[n]||{};if(A.hold)return A;return {...A,swing:sgn*arm*a+(A.swing||0),elbow:(A.elbow??14)+10*fw(sgn*a)};};
 return {...base,twist:(base.twist||0)+3*a,legL:{swing:swing*a,knee:knee(ph)},legR:{swing:-swing*a,knee:knee(ph+.5)},armL:swingArm('armL',-1),armR:swingArm('armR',1)};}
/** Standbein und Spielbein. */
function stance(b){const w=b.weight||0,stand={spread:4,knee:2},free={spread:1,knee:14,swing:9};
 return {legL:{...(w>0?free:w<0?stand:{spread:3,knee:3}),...b.legL},legR:{...(w<0?free:w>0?stand:{spread:3,knee:3}),...b.legR}};}
export const POSES={
 idle:(b={})=>({...b,armL:{swing:4,spread:8,elbow:12,...b.armL},armR:{swing:4,spread:8,elbow:12,...b.armR},...stance(b)}),
 'walk-a':b=>walkPose(.25,{base:b}),'walk-pass':b=>walkPose(.5,{base:b}),'walk-b':b=>walkPose(.75,{base:b}),
 anticipation:(b={})=>({...b,lean:(b.lean||0)*.5-6,twist:-14,armR:held(b,'armR',{swing:-55,spread:25,elbow:95}),armL:{swing:20,spread:14,elbow:40,...b.armL},legL:{swing:14,knee:10},legR:{swing:-10,knee:14}}),
 impact:(b={})=>({...b,lean:(b.lean||0)*.5+10,twist:16,armR:held(b,'armR',{swing:82,spread:8,elbow:6}),armL:{swing:-15,spread:14,elbow:30,...b.armL},legL:{swing:22,knee:12},legR:{swing:-18,knee:6}}),
 hit:(b={})=>({...b,lean:-12,headPitch:14,armL:held(b,'armL',{swing:30,spread:38,elbow:40}),armR:held(b,'armR',{swing:30,spread:38,elbow:40}),legL:{swing:-6,knee:12},legR:{swing:10,knee:16}}),
 rest:(b={})=>({...b,free:true,lift:-10.6,lean:-8,legL:{swing:84,knee:40,spread:10},legR:{swing:84,knee:40,spread:10},armL:held(b,'armL',{swing:48,spread:10,elbow:40}),armR:held(b,'armR',{swing:48,spread:10,elbow:40})}),
};
export const POSE_COLUMNS=['idle','walk-a','walk-pass','walk-b','anticipation','impact','hit','rest'];
