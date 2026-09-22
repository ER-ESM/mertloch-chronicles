// Original models for the mount sprites. Same world scale, camera and light as the hero workshop.
import * as T from './vendor/three.module.min.js';
const mat=color=>new T.MeshLambertMaterial({color,flatShading:true});
function mesh(parent,geometry,color,x,y,z){const m=new T.Mesh(geometry,mat(color));m.position.set(x,y,z);parent.add(m);return m;}
const box=(p,c,x,y,z,w,h,d)=>mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z);
const oval=(p,c,x,y,z,w,h,d)=>{const o=mesh(p,new T.SphereGeometry(1,12,8),c,x,y,z);o.scale.set(w,h,d);return o;};
function rod(p,c,a,b,r=.4){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=mesh(p,new T.CylinderGeometry(r,r,v.length(),8),c,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function wheel(p,z,r,phase,width=1.7){const g=new T.Group();g.position.set(0,r,z);p.add(g);g.rotation.z=Math.PI/2;g.rotation.y=phase;
 mesh(g,new T.CylinderGeometry(r,r,width,20),'#252a2e',0,0,0);
 for(const side of [-1,1]){mesh(g,new T.CylinderGeometry(r*.69,r*.69,.12,16),'#b7b9ad',0,side*(width/2+.1),0);for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(g,'#525d63',[0,side*(width/2+.2),0],[Math.cos(a)*r*.65,side*(width/2+.2),Math.sin(a)*r*.65],.12);}}
 return g;
}
export function mountModel(kind,phase=0,moving=false){
 const root=new T.Group(),bob=moving&&kind==='horse'?Math.sin(phase*Math.PI*4)*.45:0;
 let seat,hands,knees,feet;
 if(kind==='horse'){
  const body=new T.Group();body.position.y=bob;root.add(body);
  oval(body,'#976442',0,19,0,5.8,6,12);oval(body,'#aa7950',0,20,-8,5.3,5.4,5.8);
  oval(body,'#a97149',0,20,8,5,6.5,5);const neck=oval(body,'#a06c47',0,28,10,3.7,9,4.2);neck.rotation.x=-.37;
  const head=oval(body,'#a5734f',0,34,15,3.2,4.1,6);head.rotation.x=-.3;
  oval(body,'#685046',0,31,20,3,2.4,3.2);box(body,'#ead8b1',0,34.7,19.2,1.3,4.7,.7);
  for(const s of [-1,1]){const ear=oval(body,'#875738',s*2,39,12.7,1,3,.8);ear.rotation.z=s*-.17;oval(body,'#231f21',s*2.8,35,16, .35,.6,.65);oval(body,'#372b29',s*1.7,31,22,.5,.4,.25);}
  for(let i=0;i<9;i++)box(body,'#302a28',0,35-i*.9,9-i*.6,2.2,2.2,1.7);
  const tail=new T.Group();tail.position.set(0,21,-12);tail.rotation.z=moving?Math.sin(phase*Math.PI*2)*.14:.1;body.add(tail);rod(tail,'#302a28',[0,0,0],[0,-12,-3],1.25);oval(tail,'#302a28',0,-11,-3,1.6,3,1.4);
  for(const s of [-1,1])for(const front of [-1,1]){const g=new T.Group();g.position.set(s*3.6,18+bob,front*8);root.add(g);const swing=moving?Math.sin(phase*Math.PI*2+(s===front?0:Math.PI))*.48:0;g.rotation.x=swing;
   rod(g,'#92613f',[0,0,0],[0,-8,0],1.5);const lower=new T.Group();lower.position.y=-8;lower.rotation.x=Math.max(0,-swing)*1.4;g.add(lower);rod(lower,'#a87851',[0,0,0],[0,-8.3,.6],.95);box(lower,front===1?'#e5d7b6':'#74503c',0,-7.4,.5,1.9,2.5,2);box(lower,'#322e2c',0,-9.2,1,2.6,1.8,3.6);}
  oval(body,'#3d6253',0,24,-1,6.1,1,6);box(body,'#c6aa68',0,24.3,-1,9,.5,9);oval(body,'#4c3930',0,25,-2,3.7,1,4.3);
  for(const s of [-1,1]){rod(body,'#514039',[s*3.8,25,-1],[s*5.7,13,1],.24);box(body,'#999990',s*5.7,12.3,1,1.4,.5,3);rod(body,'#4b3930',[s*3,32,19],[s*3,27,4],.16);}
  rod(body,'#4b3930',[-3,32,20],[3,32,20],.27);
  seat=[0,25+bob,-2];hands=[[-3,27+bob,4],[3,27+bob,4]];knees=[[-5.4,20+bob,0],[5.4,20+bob,0]];feet=[[-5.7,13+bob,1],[5.7,13+bob,1]];
 }else{
  const scooter=kind==='scooter',paint=scooter?'#6d9588':'#b56e43',dark='#343635',steel='#a5aca5';
  wheel(root,-10,scooter?4:5,phase*Math.PI*2);wheel(root,12,scooter?4:5,phase*Math.PI*2);
  rod(root,steel,[0,5,-10],[0,8,6],.7);rod(root,paint,[0,6,-10],[0,12,-3],.8);rod(root,paint,[0,12,-3],[0,7,5],.8);rod(root,steel,[0,7,5],[0,16,10],.7);
  for(const s of [-1,1]){rod(root,steel,[s*.8,5,12],[s*.8,18,9],.45);rod(root,dark,[s*2.7,5,-7],[s*2.7,5,3],.55);rod(root,steel,[s*3,18,8],[s*5,19,9],.35);box(root,dark,s*5,19,9,2,.8,1);}
  oval(root,paint,0,10,-8,scooter?4.3:2.1,4.8,5.3);box(root,dark,0,13.8,-4,5.6,1.7,10);
  box(root,'#d8c9a0',1,14.7,-4,1.2,.15,3); // patched seat
  if(scooter){const shield=oval(root,paint,0,11,8,4.7,7,1.5);shield.rotation.x=-.16;box(root,'#4f625b',0,4.4,2,7,1,12);rod(root,steel,[-4,15,8],[4,15,8],.25);oval(root,paint,0,5.8,12,2.8,1.4,5);}
  else{oval(root,paint,0,11,3,2.7,2.7,5);box(root,'#a5a79b',0,6,-1,3.5,4,4);for(let i=0;i<4;i++)box(root,'#434a49',0,5+i*.65,-1,3.8,.25,4.3);box(root,'#dec995',0,13.5,4,1,.35,1.5);rod(root,steel,[-4,4,-1],[4,4,-1],.4);}
  rod(root,steel,[-5,19,9],[5,19,9],.5);oval(root,'#c3c4b2',0,18,11.4,2.2,2.2,1);oval(root,'#f5dda1',0,18,12.1,1.8,1.8,.35);
  rod(root,steel,[-4,19,9],[-5.5,24,9],.18);oval(root,steel,-5.5,24.5,9,1.4,1,.35);
  box(root,'#eeddb9',0,7.5,-14,3,2,.35);box(root,'#a44332',0,10,-13,2,1,.5);rod(root,steel,[-2,11,-9],[-2,11,-14],.3);rod(root,steel,[2,11,-9],[2,11,-14],.3);rod(root,steel,[-2,11,-14],[2,11,-14],.3);
  seat=[0,14.5,-4];hands=[[-5,19,9],[5,19,9]];knees=[[-3,10,3],[3,10,3]];feet=[[-3,5,scooter?4:-1],[3,5,scooter?4:-1]];
 }
 return {root,seat,hands,knees,feet};
}
