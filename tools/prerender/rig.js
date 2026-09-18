// Pre-Render-Rig (E-30): ein Low-Poly-Held aus Kästen an einer echten Knochen-Hierarchie, Ausrüstung als Meshes an Knochen.
// Einheiten sind Welteinheiten (Held 26 hoch, wie docs/MASSSTAB-2026-09-17.md). Läuft im Browser (three.js, tools/prerender/vendor).
// Ersetzbar: Wer später ein Blender-/KI-Modell liefert, tauscht buildHero() gegen einen glTF-Loader mit denselben Knochennamen.
import * as THREE from './vendor/three.module.min.js';

/** Körperbau je Figur (Welteinheiten). */
export const BODIES={
 dieter:{height:26,head:6,neck:1,torso:9,shoulder:9.5,hip:6,legs:10,arm:8.5,forearm:4.5,thick:1.15,belly:1.25,skin:'f4c698',hair:'634b37',shirt:'526d76',pants:'413440',boots:'413440',beard:'634b37'},
 baerbel:{height:25,head:5.6,neck:1.2,torso:8.8,shoulder:7.6,hip:5.4,legs:10.2,arm:8.2,forearm:4.4,thick:.9,belly:.95,skin:'f4c698',hair:'ce5d31',shirt:'ec8b36',pants:'334d59',boots:'634b37',beard:null},
 kevin:{height:27,head:5.8,neck:1.3,torso:9.4,shoulder:8.2,hip:5.2,legs:11.2,arm:9,forearm:4.8,thick:.85,belly:.9,skin:'dda071',hair:'242333',shirt:'849451',pants:'243841',boots:'67463e',beard:null}
};
const col=hex=>new THREE.Color('#'+hex);
const mat=hex=>new THREE.MeshLambertMaterial({color:col(hex)});
/** Kasten mit Drehpunkt oben (Gelenk), hängt nach unten. */
function segment(parent,w,h,d,hex,{x=0,y=0,z=0,name='',down=true}={}){
 const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(hex));m.position.y=down?-h/2:h/2;m.name=name+'-mesh';m.userData.body=true;g.add(m);
 return g;
}
/**
 * Baut den Helden. Rückgabe: {root, bones:{hips,spine,chest,neck,head,shoulderL,shoulderR,armL,armR,forearmL,forearmR,handL,handR,thighL,thighR,shinL,shinR,footL,footR}, body}.
 * root steht mit den Füßen auf y=0, Blick +z.
 */
export function buildHero(classId){
 const b=BODIES[classId]||BODIES.dieter,root=new THREE.Group();root.name='root';
 const legTop=b.legs,hipsY=legTop,torsoTop=hipsY+b.torso,headBase=torsoTop+b.neck;
 const hips=new THREE.Group();hips.name='hips';hips.position.y=hipsY;root.add(hips);
 const pelvis=new THREE.Mesh(new THREE.BoxGeometry(b.hip,2.2,3*b.thick),mat(b.pants));pelvis.position.y=-.6;pelvis.userData.body=true;hips.add(pelvis);
 const spine=new THREE.Group();spine.name='spine';spine.position.y=.4;hips.add(spine);
 const chest=new THREE.Group();chest.name='chest';chest.position.y=b.torso-.4;spine.add(chest);
 const torso=new THREE.Mesh(new THREE.BoxGeometry(b.shoulder*.82,b.torso,3.4*b.belly),mat(b.shirt));torso.position.y=-b.torso/2;torso.userData.body=true;torso.name='torso';chest.add(torso);
 const neck=segment(chest,1.6,b.neck,1.6,b.skin,{y:0,name:'neck',down:false});
 const head=new THREE.Group();head.name='head';head.position.y=b.neck;neck.add(head);
 const skull=new THREE.Mesh(new THREE.BoxGeometry(b.head*.78,b.head,b.head*.8),mat(b.skin));skull.position.y=b.head/2;skull.userData.body=true;head.add(skull);
 const hair=new THREE.Mesh(new THREE.BoxGeometry(b.head*.82,b.head*.42,b.head*.84),mat(b.hair));hair.position.set(0,b.head*.82,-.15);hair.userData.body=true;head.add(hair);
 const nose=new THREE.Mesh(new THREE.BoxGeometry(.9,1,.9),mat(b.skin));nose.position.set(0,b.head*.45,b.head*.45);nose.userData.body=true;head.add(nose);
 for(const s of [-1,1]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.4),mat('242333'));eye.position.set(s*1.1,b.head*.6,b.head*.4);eye.userData.body=true;head.add(eye);}
 if(b.beard){const beard=new THREE.Mesh(new THREE.BoxGeometry(b.head*.6,b.head*.3,1.2),mat(b.beard));beard.position.set(0,b.head*.18,b.head*.35);beard.userData.body=true;head.add(beard);}
 const bones={hips,spine,chest,neck,head};
 for(const [side,s] of [['L',-1],['R',1]]){
  const shoulder=new THREE.Group();shoulder.name='shoulder'+side;shoulder.position.set(s*b.shoulder/2,-.6,0);chest.add(shoulder);
  const arm=segment(shoulder,1.9*b.thick,b.arm,1.9*b.thick,b.shirt,{name:'arm'+side});
  const forearm=segment(arm,1.7*b.thick,b.forearm,1.7*b.thick,b.skin,{y:-b.arm,name:'forearm'+side});
  const hand=new THREE.Group();hand.name='hand'+side;hand.position.y=-b.forearm;forearm.add(hand);
  const fist=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.6,1.6),mat(b.skin));fist.position.y=-.6;fist.userData.body=true;hand.add(fist);
  const thigh=segment(hips,2.3*b.thick,b.legs*.52,2.4*b.thick,b.pants,{x:s*b.hip*.3,y:-1,name:'thigh'+side});
  const shin=segment(thigh,2*b.thick,b.legs*.48,2.1*b.thick,b.pants,{y:-b.legs*.52,name:'shin'+side});
  const foot=new THREE.Group();foot.name='foot'+side;foot.position.y=-b.legs*.48;shin.add(foot);
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(2.2*b.thick,1.4,3.2),mat(b.boots));shoe.position.set(0,-.3,.6);shoe.userData.body=true;foot.add(shoe);
  Object.assign(bones,{['shoulder'+side]:shoulder,['arm'+side]:arm,['forearm'+side]:forearm,['hand'+side]:hand,['thigh'+side]:thigh,['shin'+side]:shin,['foot'+side]:foot});
 }
 return {root,bones,body:b};
}

/** Ausrüstung als Mesh am passenden Knochen. Schlüssel = Asset-Namen aus equipment-appearance.js / precision-Katalog `equipment`. */
export const GEAR={
 helmet:{bone:'head',build:b=>box(b.head*.9,b.head*.55,b.head*.92,'898c83',{y:b.head*.75})},
 cap:{bone:'head',build:b=>group(box(b.head*.86,b.head*.3,b.head*.9,'953d32',{y:b.head*.9}),box(b.head*.5,.5,b.head*.5,'953d32',{y:b.head*.78,z:b.head*.55}))},
 jacket:{bone:'chest',build:b=>box(b.shoulder*.9,b.torso*.98,3.9*b.belly,'364047',{y:-b.torso/2})},
 raincoat:{bone:'chest',build:b=>box(b.shoulder*.92,b.torso*1.15,4*b.belly,'ffd274',{y:-b.torso*.56})},
 vest:{bone:'chest',build:b=>box(b.shoulder*.86,b.torso*.8,3.8*b.belly,'926044',{y:-b.torso*.42})},
 pauldron:{bone:['shoulderL','shoulderR'],build:b=>box(2.8,1.6,2.8,'898c83',{y:.2})},
 shoulderpad:{bone:['shoulderL','shoulderR'],build:b=>box(2.6,1.2,2.6,'786259',{y:.3})},
 glove:{bone:['handL','handR'],build:b=>box(1.9,1.9,1.9,'634b37',{y:-.6})},
 bracer:{bone:['forearmL','forearmR'],build:b=>box(2*b.thick,b.forearm*.7,2*b.thick,'786259',{y:-b.forearm*.4})},
 belt:{bone:'hips',build:b=>group(box(b.hip*1.05,1.1,3.2*b.thick,'634b37',{y:.3}),box(1.4,1.2,.6,'f3b84b',{y:.3,z:1.7*b.thick}))},
 boot:{bone:['footL','footR'],build:b=>box(2.4*b.thick,2.2,3.4,'634b37',{y:.2,z:.6})},
 leatherboot:{bone:['footL','footR'],build:b=>box(2.4*b.thick,2.6,3.4,'926044',{y:.4,z:.6})},
 furboot:{bone:['footL','footR'],build:b=>box(2.6*b.thick,2.6,3.6,'b67b50',{y:.4,z:.6})},
 trouser:{bone:['thighL','thighR'],build:b=>box(2.5*b.thick,b.legs*.5,2.6*b.thick,'526d76',{y:-b.legs*.26})},
 chain:{bone:'chest',build:b=>box(2.4,.5,.4,'f3b84b',{y:-.6,z:1.8*b.belly})},
 pendant:{bone:'chest',build:b=>box(1,1.2,.4,'ec8b36',{y:-1.6,z:1.9*b.belly})},
 medal:{bone:'chest',build:b=>box(1.1,1.1,.4,'f3b84b',{x:1.6,y:-2,z:1.9*b.belly})},
 badge:{bone:'chest',build:b=>box(1.2,.9,.4,'f8f0d5',{x:-1.6,y:-2,z:1.9*b.belly})},
 pouch:{bone:'hips',build:b=>box(1.6,1.8,1.2,'926044',{x:2.2,y:-.2,z:1.4*b.thick})},
 tusk:{bone:'hips',build:b=>box(.7,2.2,.7,'f8f0d5',{x:-2.4,y:-.6,z:1.4*b.thick})},
 badgercharm:{bone:'hips',build:b=>box(1,1,.6,'c8c5af',{x:2.4,y:-.4,z:1.5*b.thick})},
 cup:{bone:'hips',build:b=>box(1.2,1.5,1.2,'898c83',{x:-2.6,y:-.6,z:1.2*b.thick})},
 ring:{bone:'handR',build:b=>box(.5,.5,.5,'f3b84b',{x:.9,y:-.6,z:.6})},
 club:{bone:'handR',build:b=>held(box(1.6,9,1.6,'926044',{y:2.6}),box(2.4,3,2.4,'67463e',{y:6.6}))},
 blade:{bone:'handR',build:b=>held(box(.9,10,.4,'c8c5af',{y:3.4}),box(2.8,.7,.9,'634b37',{y:-.9}))},
 maul:{bone:'handR',build:b=>held(box(1.2,11,1.2,'634b37',{y:3.5}),box(4.5,3,3,'526d76',{y:8}))},
 slingshot:{bone:'handR',build:b=>held(box(.8,4,.8,'926044',{y:1}),box(3,.8,.8,'926044',{y:3.2}))},
 sprayer:{bone:'handR',build:b=>held(box(1.6,4.5,1.6,'ec8b36',{y:1.4}),box(.6,2.5,.6,'898c83',{y:4.6}))},
 bottle:{bone:'handR',build:b=>held(box(1.3,3.6,1.3,'55704a',{y:1}),box(.7,1.2,.7,'849451',{y:3.2}))},
 wateringcan:{bone:'handR',build:b=>held(box(2.6,3,2.6,'849451',{y:.6}),box(.6,2.6,.6,'849451',{y:1.6,x:1.8}))},
 whistle:{bone:'handR',build:b=>held(box(.8,2,.8,'c8c5af',{y:.2}))},
 stamp:{bone:'handR',build:b=>held(box(1.2,2.4,1.2,'953d32',{y:.4}),box(2,.6,2,'634b37',{y:-.9}))},
 robotclaw:{bone:'handR',build:b=>held(box(2.4,2.4,2.4,'898c83',{y:-.6}))},
 potlid:{bone:'handL',build:b=>held(box(5.5,5.5,.6,'898c83',{y:-.5,z:.9}),box(1,1,1,'242333',{y:-.5,z:1.5}))},
 shield:{bone:'handL',build:b=>held(box(5,7,.6,'953d32',{y:-1,z:.9}),box(4,6,.3,'f3b84b',{y:-1,z:1.2}))}
};
function box(w,h,d,hex,{x=0,y=0,z=0}={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(hex));m.position.set(x,y,z);m.userData.gear=true;return m;}
function group(...parts){const g=new THREE.Group();for(const p of parts)g.add(p);g.traverse(o=>{if(o.isMesh)o.userData.gear=true;});return g;}
/** Gehaltene Dinge zeigen mit der Spitze nach vorn-oben (Faust hält den Griff). */
function held(...parts){const g=group(...parts);g.rotation.x=-.55;g.position.y=-.6;return g;}
export function attachGear(hero,asset){
 const spec=GEAR[asset];if(!spec)return [];
 const bones=Array.isArray(spec.bone)?spec.bone:[spec.bone],made=[];
 for(const name of bones){const bone=hero.bones[name];if(!bone)continue;const mesh=spec.build(hero.body);mesh.name='gear-'+asset;if(name.endsWith('L')&&mesh.isMesh===undefined)mesh.scale.x=1;bone.add(mesh);made.push(mesh);}
 return made;
}
export const GEAR_ASSETS=Object.keys(GEAR);
