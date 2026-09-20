// Prototyp D: Live-3D. Dieselbe Welt und dieselbe Engine, aber alles steht als Körper im Raum: Häuser aus den Grundrissen hochgezogen,
// Bäume als Instanzen, Heldin und Dorfleute als Kasten-Rig aus E-30 (tools/prerender) mit Laufzyklus. Sonne mit Schattenkarte, frei drehbare Kamera.
// Zeigt den Gewinn – und den Preis: Die gesamte Pixelgrafik des Spiels kommt hier nicht mehr vor.
import './renderer.js';                 // Ladereihenfolge wie im Spiel (zirkuläre Importe der Zeichner)
import * as THREE from './tools/prerender/vendor/three.module.min.js';
import {buildHero} from './tools/prerender/rig.js';
import {POSES,walkPose,poseLift} from './tools/prerender/poses.js';
import {createTerrainChunk,TERRAIN_SIZE} from './terrain.js';
import {$,clamp,bootGame,bindKeys,places,jump,lightSources,nearestLights,panel,meter,Shockwaves} from './proto-common.js';

const {world,game}=await bootGame();
const view={yaw:.5,pitch:.62,dist:520};
// Steuerung bezieht sich auf die Kamera; die Engine kennt nur acht Richtungen, also wird auf die nächste gerundet.
bindKeys(game,held=>{const f=(held.has('w')||held.has('arrowup')?1:0)-(held.has('s')||held.has('arrowdown')?1:0),r=(held.has('d')||held.has('arrowright')?1:0)-(held.has('a')||held.has('arrowleft')?1:0);if(!f&&!r)return [];
 const dx=-Math.sin(view.yaw)*f+Math.cos(view.yaw)*r,dy=-Math.cos(view.yaw)*f-Math.sin(view.yaw)*r,l=Math.hypot(dx,dy),out=[];if(dx/l>.38)out.push('d');if(dx/l<-.38)out.push('a');if(dy/l>.38)out.push('s');if(dy/l<-.38)out.push('w');return out;});
$('sub').textContent='Echte Körper, echtes Licht, freie Kamera. Aufwand: 2–4 Monate und eine komplett neue Grafik.';
$('help').textContent='WASD laufen (zur Kamera) · Mausrad = Zoom · rechte Maustaste ziehen = Kamera drehen · Klick = Druckwelle + Laufziel';
const spots=places(world,game),lights=lightSources(world),shock=new Shockwaves(),fps=meter($('meter'));
const ui=panel($('panel'),[
 {type:'head',label:'Licht'},
 {id:'night',type:'range',label:'Nacht',min:0,max:1,value:.15},
 {id:'sun',type:'range',label:'Sonnenstand',min:0,max:6.28,value:2.2,hint:'Schatten wandern mit'},
 {id:'shadows',type:'check',label:'Schattenkarte (Sonne/Mond)',value:true},
 {id:'lights',type:'check',label:'Laternen und Feuer als Punktlichter',value:true},
 {id:'fog',type:'check',label:'Tiefennebel',value:true},
 {id:'embers',type:'check',label:'Funken + Glühwürmchen',value:true},
 {type:'head',label:'Stil'},
 {id:'pixel',type:'check',label:'Pixel-Filter (⅓ Auflösung)',value:false,hint:'Wie Live-3D den Pixel-Look annähern könnte'},
 {type:'note',label:'Figuren = Kasten-Rig aus E-30 (Platzhalter). Häuser, Bäume, Gegner sind hier nur Grundformen – echte Modelle müssten geliefert werden.'},
 {type:'head',label:'Ort'},
 ...spots.map(s=>({id:'go-'+s.id,type:'button',label:s.label}))
],id=>{const s=spots.find(s=>'go-'+s.id===id);if(s)jump(game,s);if(id==='pixel')resize();});

const canvas=$('world'),gl3=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
gl3.shadowMap.enabled=true;gl3.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,8,12000);scene.fog=new THREE.Fog(0x9fb4c8,800,4000);
const hemi=new THREE.HemisphereLight(0xdfeaff,0x6a7a4a,1.1),sun=new THREE.DirectionalLight(0xfff0d0,2.4);scene.add(hemi,sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-750,right:750,top:750,bottom:-750,near:100,far:4000});sun.shadow.bias=-.0006;sun.shadow.normalBias=1.5;
const lamps=Array.from({length:6},()=>{const l=new THREE.PointLight(0xffb060,0,420,1.1);scene.add(l);return l;});

// Boden: dieselben Gelände-Kacheln wie im Spiel, jetzt als beleuchtete Fläche, die Schatten empfängt.
const chunkGeo=new THREE.PlaneGeometry(TERRAIN_SIZE,TERRAIN_SIZE).rotateX(-Math.PI/2),chunks=new Map();
function ensureChunks(cx,cy,radius){const r=Math.ceil(radius/TERRAIN_SIZE),gx0=Math.floor(cx/TERRAIN_SIZE),gy0=Math.floor(cy/TERRAIN_SIZE);
 for(let ring=0;ring<=r;ring++)for(let gx=gx0-ring;gx<=gx0+ring;gx++)for(let gy=gy0-ring;gy<=gy0+ring;gy++){const key=gx+','+gy;if(chunks.has(key))continue;
  const t=new THREE.CanvasTexture(createTerrainChunk(world,gx,gy));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.Mesh(chunkGeo,new THREE.MeshLambertMaterial({map:t}));m.position.set((gx+.5)*TERRAIN_SIZE,0,(gy+.5)*TERRAIN_SIZE);m.receiveShadow=true;scene.add(m);chunks.set(key,m);return 1;}
 if(chunks.size>110)for(const [key,m] of chunks)if(Math.hypot(m.position.x-cx,m.position.z-cy)>radius+TERRAIN_SIZE*4){scene.remove(m);m.material.map.dispose();m.material.dispose();chunks.delete(key);if(chunks.size<=90)break;}
 return 0;}

// Häuser: Wände + Satteldach aus Grundriss, Wand- und Dachhöhe der Weltdaten. Alles in einem Netz, Farbe je Eckpunkt.
const ROOFS=['#c9703a','#b8434c','#4f76a6','#3f8f80'],PLASTER=['#f1d9b5','#f3c9a5','#e9e0cc','#f5d0b0','#e4d3b8'],STONE='#c3c5bd';
function houses(){const pos=[],col=[],glassPos=[],c=new THREE.Color();
 const tri=(arr,a,b,d)=>arr.push(...a,...b,...d),paint=(hex,n)=>{c.set(hex);for(let i=0;i<n;i++)col.push(c.r,c.g,c.b);};
 const quad=(a,b,d,e,hex)=>{tri(pos,a,b,d);tri(pos,a,d,e);paint(hex,6);};
 for(const b of world.buildings){const x0=b.minX,x1=b.maxX,z0=b.minY,z1=b.maxY,H=b.wallHeight||70,R=(b.roofHeight||30)*1.5,stone=b.church||b.style==='chapel',wall=stone?STONE:PLASTER[b.id%5],roof=ROOFS[stone?2:b.id%4],o=7;
  quad([x0,0,z1],[x1,0,z1],[x1,H,z1],[x0,H,z1],wall);quad([x1,0,z0],[x0,0,z0],[x0,H,z0],[x1,H,z0],wall);quad([x1,0,z1],[x1,0,z0],[x1,H,z0],[x1,H,z1],wall);quad([x0,0,z0],[x0,0,z1],[x0,H,z1],[x0,H,z0],wall);
  if(x1-x0>=z1-z0){const zm=(z0+z1)/2;quad([x0-o,H-3,z1+o],[x1+o,H-3,z1+o],[x1+o,H+R,zm],[x0-o,H+R,zm],roof);quad([x1+o,H-3,z0-o],[x0-o,H-3,z0-o],[x0-o,H+R,zm],[x1+o,H+R,zm],roof);tri(pos,[x0,H,z0],[x0,H,z1],[x0,H+R,zm]);tri(pos,[x1,H,z1],[x1,H,z0],[x1,H+R,zm]);paint(wall,6);}
  else{const xm=(x0+x1)/2;quad([x1+o,H-3,z1+o],[x1+o,H-3,z0-o],[xm,H+R,z0-o],[xm,H+R,z1+o],roof);quad([x0-o,H-3,z0-o],[x0-o,H-3,z1+o],[xm,H+R,z1+o],[xm,H+R,z0-o],roof);tri(pos,[x0,H,z1],[x1,H,z1],[xm,H+R,z1]);tri(pos,[x1,H,z0],[x0,H,z0],[xm,H+R,z0]);paint(wall,6);}
  if(b.church){const tx=x0+24,tz=z1-24,s=22,T=H*2.1;for(const [ax,az,bx,bz] of [[-s,s,s,s],[s,s,s,-s],[s,-s,-s,-s],[-s,-s,-s,s]]){quad([tx+ax,0,tz+az],[tx+bx,0,tz+bz],[tx+bx,T,tz+bz],[tx+ax,T,tz+az],STONE);tri(pos,[tx+ax*1.15,T,tz+az*1.15],[tx+bx*1.15,T,tz+bz*1.15],[tx,T+90,tz]);paint('#4f76a6',3);}}
  const dx=clamp(b.door?.x??(x0+x1)/2,x0+10,x1-10);quad([dx-7,0,z1+.6],[dx+7,0,z1+.6],[dx+7,32,z1+.6],[dx-7,32,z1+.6],'#6b4630');
  for(let wx=x0+16;wx<x1-12;wx+=26){if(Math.abs(wx-dx)<16)continue;for(const wy of H>64?[18,46]:[22]){tri(glassPos,[wx-6,wy,z1+.7],[wx+6,wy,z1+.7],[wx+6,wy+15,z1+.7]);tri(glassPos,[wx-6,wy,z1+.7],[wx+6,wy+15,z1+.7],[wx-6,wy+15,z1+.7]);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.castShadow=m.receiveShadow=true;scene.add(m);
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(glassPos,3));const glass=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:0x3a4a5e}));scene.add(glass);return glass;}
const glass=houses();

// Bäume: zwei Instanz-Netze (Stamm, Krone) für alle 3300 Exemplare.
{const CROWN=['#4f9a5c','#3f8f8a','#d9838a','#e0a93f','#7fb85a'],m4=new THREE.Matrix4(),q=new THREE.Quaternion(),c=new THREE.Color(),n=world.trees.length;
 const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(3,4.5,40,6).translate(0,20,0),new THREE.MeshLambertMaterial({color:0x6b4a34}),n);
 const leaf=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({flatShading:true}),n);
 world.trees.forEach((t,i)=>{const s=t.size||1,pine=t.type==='pine';trunk.setMatrixAt(i,m4.compose(new THREE.Vector3(t.x,0,t.y),q,new THREE.Vector3(s,s,s)));
  q.setFromAxisAngle(new THREE.Vector3(0,1,0),t.x*.37);leaf.setMatrixAt(i,m4.compose(new THREE.Vector3(t.x,(pine?62:58)*s,t.y),q,pine?new THREE.Vector3(20*s,52*s,20*s):new THREE.Vector3(34*s,28*s,34*s)));q.identity();
  leaf.setColorAt(i,c.set(pine?'#2f6b55':CROWN[t.variant%5]).offsetHSL(0,0,((t.x*7+t.y*3)%10-5)*.006));});
 for(const m of [trunk,leaf]){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);}}

// Figuren: Kasten-Rig aus E-30, Posen aus derselben Datei, die heute die Sprites vorrendert.
function applyPose(h,name,t){for(const bone of Object.values(h.bones))bone.rotation.set(0,0,0);const pose=typeof t==='number'?walkPose(t):POSES[name]||POSES.idle;for(const [k,v] of Object.entries(pose)){const bone=h.bones[k];if(bone)bone.rotation.set(v.x,v.y,v.z);}h.bones.hips.position.y=h.body.legs+poseLift(name,t);}
class Figure{constructor(ref,body,scale=1){this.ref=ref;this.h=buildHero(body);this.h.root.scale.setScalar(scale);this.h.root.traverse(o=>{if(o.isMesh){o.castShadow=true;}});scene.add(this.h.root);this.px=ref.x;this.py=ref.y;this.yaw=0;this.phase=Math.random();}
 update(dt,visible){const r=this.ref,root=this.h.root;root.visible=visible;if(!visible){this.px=r.x;this.py=r.y;return;}const dx=r.x-this.px,dy=r.y-this.py,v=Math.hypot(dx,dy)/Math.max(dt,1e-3);this.px=r.x;this.py=r.y;
  if(v>4){const want=Math.atan2(dx,dy);let d=want-this.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));this.yaw+=d*Math.min(1,dt*12);this.phase=(this.phase+dt*v/34)%1;applyPose(this.h,'walk',this.phase);}
  else applyPose(this.h,r.attack>0?'impact':'idle');root.position.set(r.x,0,r.y);root.rotation.y=this.yaw;}}
class Beast{constructor(ref){this.ref=ref;const g=this.root=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:0x6e5240}),box=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  box(12,11,24,0,13,0);box(9,9,10,0,15,15);box(3,3,5,0,13,22);this.legs=[[-4,8],[4,8],[-4,-8],[4,-8]].map(([x,z])=>{const p=new THREE.Group();p.position.set(x,9,z);const m=new THREE.Mesh(new THREE.BoxGeometry(3,9,3),mat);m.position.y=-4.5;m.castShadow=true;p.add(m);g.add(p);return p;});scene.add(g);this.px=ref.x;this.py=ref.y;this.yaw=0;this.phase=0;}
 update(dt,visible){const r=this.ref;this.root.visible=visible&&r.hp>0;const dx=r.x-this.px,dy=r.y-this.py,v=Math.hypot(dx,dy)/Math.max(dt,1e-3);this.px=r.x;this.py=r.y;if(v>3){this.yaw=Math.atan2(dx,dy);this.phase+=dt*v/20;}this.legs.forEach((l,i)=>l.rotation.x=Math.sin(this.phase*6.28+(i%3?0:3.14))*(v>3?.6:0));this.root.position.set(r.x,0,r.y);this.root.rotation.y=this.yaw;}}
const figures=[new Figure(game.player,game.player.classId)];
(game.life?.actors||[]).forEach((a,i)=>{if(a.kind==='villager'||!a.kind)figures.push(new Figure(a,i%2?'dieter':'kevin',.95));});
for(const e of game.enemies)figures.push(new Beast(e));

// Druckwelle: ein wachsender Ring am Boden.
const rings=Array.from({length:4},()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.86,1,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.visible=false;scene.add(m);return m;});

const dots=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(2780*3),3)),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 uniforms:{uTime:{value:0},uNight:{value:0},uCam:{value:new THREE.Vector2()},uFire:{value:Array.from({length:8},()=>new THREE.Vector2())},uNF:{value:0},uPx:{value:1}},
 vertexShader:`uniform float uTime,uNight,uPx;uniform vec2 uCam;uniform vec2 uFire[8];uniform int uNF;varying vec4 tint;float h(float n){return fract(sin(n*12.9898)*43758.5453);}
 void main(){float id=float(gl_VertexID),a=h(id),b=h(id+.37),c=h(id+.71);vec3 w;float size;
  if(gl_VertexID<2600){if(uNF==0){gl_Position=vec4(2.,2.,0.,1.);gl_PointSize=0.;tint=vec4(0.);return;}vec2 f=uFire[int(a*float(uNF))];float t=fract(uTime*(.35+b*.4)+c);w=vec3(f.x+(b-.5)*22.+sin(t*7.+a*40.)*9.*t,4.+t*(50.+a*70.),f.y+(c-.5)*16.);tint=vec4(1.,.35+.5*(1.-t),.12,(1.-t)*(1.-t));size=2.6-t;}
  else{vec2 cell=vec2(1600.,1600.);vec2 base=vec2(a,b)*cell+vec2(sin(uTime*.35+c*40.),cos(uTime*.28+a*30.))*46.;vec2 p=uCam+mod(base-uCam,cell)-cell*.5;w=vec3(p.x,8.+10.*sin(uTime*.6+c*20.),p.y);tint=vec4(.72,1.,.42,(.5+.5*sin(uTime*2.2+c*60.))*uNight);size=2.;}
  vec4 mv=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mv;gl_PointSize=size*uPx/-mv.z;}`,
 fragmentShader:`varying vec4 tint;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint.rgb,1.)*tint.a*smoothstep(.5,.05,d);}`}));
dots.frustumCulled=false;scene.add(dots);

function resize(){const r=canvas.getBoundingClientRect();gl3.setPixelRatio(ui.pixel?1/3:1);gl3.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
canvas.addEventListener('wheel',e=>{e.preventDefault();view.dist=clamp(view.dist*(e.deltaY>0?1.12:.89),120,3200);},{passive:false});
let drag=null;canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(e.button===2){drag={x:e.clientX,y:e.clientY,yaw:view.yaw,pitch:view.pitch};canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(drag){view.yaw=drag.yaw-(e.clientX-drag.x)*.006;view.pitch=clamp(drag.pitch+(e.clientY-drag.y)*.004,.18,1.45);}});
canvas.addEventListener('pointerup',()=>{drag=null;});
const ray=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);if(ray.ray.intersectPlane(ground,hit)){const p={x:hit.x,y:hit.z};shock.add(p.x,p.y);game.navigate?.(p);}});

const focus={x:game.player.x,y:game.player.y},day=new THREE.Color(0x9fc4e8),dusk=new THREE.Color(0x0a1224),sky=new THREE.Color();let last=performance.now(),pending=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.tick(dt);if(Array.isArray(game.events))game.events.length=0;shock.tick(dt);
 const p=game.player,k=1-Math.exp(-8*dt);if(Math.hypot(p.x-focus.x,p.y-focus.y)>900){focus.x=p.x;focus.y=p.y;}focus.x+=(p.x-focus.x)*k;focus.y+=(p.y-focus.y)*k;
 fps.begin();
 const cp=Math.cos(view.pitch),sp=Math.sin(view.pitch);camera.position.set(focus.x+Math.sin(view.yaw)*cp*view.dist,sp*view.dist,focus.y+Math.cos(view.yaw)*cp*view.dist);camera.lookAt(focus.x,14,focus.y);
 const reach=Math.max(1100,view.dist*2.4);pending=ensureChunks(focus.x,focus.y,reach);
 const n=ui.night;sky.copy(day).lerp(dusk,n);scene.background=sky;scene.fog.color.copy(sky);scene.fog.near=ui.fog?view.dist*1.2:1e6;scene.fog.far=ui.fog?view.dist*1.2+2600:2e6;
 hemi.intensity=1.1-n*.95;sun.intensity=2.4-n*2.1;sun.color.setRGB(1-n*.45,.94-n*.3,.82+n*.18);sun.castShadow=ui.shadows;
 sun.target.position.set(focus.x,0,focus.y);sun.position.set(focus.x+Math.cos(ui.sun)*900,1100,focus.y+Math.sin(ui.sun)*900);
 glass.material.color.setRGB(.23+n*.77,.29+n*.5,.37-n*.05);
 const near=nearestLights(lights,focus.x,focus.y,lamps.length,p);lamps.forEach((l,i)=>{const s=near[i];l.visible=!!s&&ui.lights&&n>.05;if(!l.visible)return;l.position.set(s.x,s.fire?14:30,s.y+4);l.color.setRGB(...s.color);l.distance=s.r*2.6;l.intensity=n*(s.fire?150+40*Math.sin(game.time*11+s.x):95);});
 for(const f of figures){const r=f.ref;f.update(dt,Math.hypot(r.x-focus.x,r.y-focus.y)<reach);}
 rings.forEach((m,i)=>{const s=shock.list[i];m.visible=!!s;if(s){m.position.set(s.x,1.5,s.y);m.scale.setScalar(10+s.age*150);m.material.opacity=1-s.age;}});
 const fires=near.filter(l=>l.fire).slice(0,8),du=dots.material.uniforms;dots.visible=ui.embers;du.uTime.value=game.time;du.uNight.value=n;du.uNF.value=fires.length;fires.forEach((f,i)=>du.uFire.value[i].set(f.x,f.y));du.uCam.value.set(focus.x,focus.y);du.uPx.value=canvas.height*2.2;
 gl3.render(scene,camera);
 fps.end(`${gl3.info.render.calls} Zeichenaufrufe · ${(gl3.info.render.triangles/1000).toFixed(0)}k Dreiecke${pending?' · lädt Umgebung…':''}`);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.proto={game,ui,scene,camera,gl3,view};
