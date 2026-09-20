// Prototyp C: Renderer-Tausch auf three.js, die Grafik bleibt 2D. Der Boden ist eine Fläche aus den vorhandenen Gelände-Kacheln,
// Bäume, Häuser und Figuren stehen als Tafeln (Billboards) darauf – gezeichnet von den bestehenden Canvas-Zeichnern, einmalig zu Texturen gebacken.
// Neu gegenüber B: neigbare Kamera mit Tiefe, stufenloser Zoom, geworfene Schatten, Wind, Licht je Objekt, Tiefennebel, alle 3300 Bäume in einem Zug.
import './renderer.js';                 // Ladereihenfolge wie im Spiel (zirkuläre Importe der Zeichner)
import * as THREE from './tools/prerender/vendor/three.module.min.js';
import {createTerrainChunk,TERRAIN_SIZE} from './terrain.js';
import {drawBuilding} from './architecture.js';
import {drawAssetTree} from './asset-art.js';
import {createComicTree} from './comic-nature.js';
import {drawClanHero,drawClanEnemy} from './clan-art.js';
import {drawComicResident} from './comic-actors.js';
import {WORLD_SCALE} from './world-scale.js';
import {$,clamp,bootGame,bindKeys,places,jump,lightSources,nearestLights,panel,meter,Shockwaves} from './proto-common.js';

const {world,game}=await bootGame();
bindKeys(game);
$('sub').textContent='three.js zeichnet, die Pixelgrafik bleibt. Aufwand: 2–3 Wochen, alle Rollen müssen warten.';
$('help').textContent='WASD laufen · Mausrad = Zoom · rechte Maustaste ziehen = Neigung · Klick = Druckwelle + Laufziel';
const spots=places(world,game),lights=lightSources(world),shock=new Shockwaves(),fps=meter($('meter'));
const ui=panel($('panel'),[
 {type:'head',label:'Kamera'},
 {id:'tilt',type:'range',label:'Neigung',min:32,max:86,step:1,value:52,hint:'86° = Draufsicht wie heute'},
 {id:'zoom',type:'range',label:'Entfernung',min:140,max:2600,step:10,value:520},
 {type:'head',label:'Stimmung'},
 {id:'night',type:'range',label:'Nacht',min:0,max:1,value:.7},
 {id:'lights',type:'check',label:'Lichtquellen (Boden + je Objekt)',value:true},
 {id:'shadows',type:'check',label:'Geworfene Schatten',value:true,hint:'Silhouette der Grafik, auf den Boden gelegt'},
 {id:'wind',type:'check',label:'Wind in den Bäumen',value:true},
 {id:'fog',type:'check',label:'Tiefennebel',value:true},
 {id:'embers',type:'check',label:'Funken + Glühwürmchen (räumlich)',value:true},
 {type:'head',label:'Ort'},
 ...spots.map(s=>({id:'go-'+s.id,type:'button',label:s.label}))
],id=>{const s=spots.find(s=>'go-'+s.id===id);if(s)jump(game,s);});

const canvas=$('world'),gl3=new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true});
gl3.outputColorSpace=THREE.LinearSRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(28,1,10,9000);
const MAXL=24;
const shared={uAmb:{value:new THREE.Color(1,1,1)},uN:{value:0},uLP:{value:Array.from({length:MAXL},()=>new THREE.Vector4())},uLC:{value:Array.from({length:MAXL},()=>new THREE.Vector3())},uTime:{value:0},uNight:{value:0},
 uFog:{value:new THREE.Color()},uFogOn:{value:1},uFogFar:{value:3000},uShock:{value:Array.from({length:4},()=>new THREE.Vector3(0,0,9))},uWind:{value:1}};
const LIGHT_GLSL=`
uniform vec3 uAmb;uniform int uN;uniform vec4 uLP[${MAXL}];uniform vec3 uLC[${MAXL}];uniform float uTime,uNight;uniform vec3 uShock[4];
vec3 lightAt(vec2 wp){vec3 lit=uAmb;for(int i=0;i<uN;i++){float fl=uLP[i].w>.5?.86+.14*sin(uTime*11.+uLP[i].x)*sin(uTime*7.3+uLP[i].y):1.;float a=1.-clamp(length(wp-uLP[i].xy)/(uLP[i].z*fl),0.,1.);lit+=uNight*uLC[i]*a*a*1.25;}
 for(int i=0;i<4;i++){float ring=uShock[i].z*150.;lit+=vec3(1.,.9,.7)*smoothstep(16.,0.,abs(length(wp-uShock[i].xy)-ring))*(1.-min(uShock[i].z,1.));}
 return min(lit,vec3(1.5));}`;
const FOG_GLSL=`uniform vec3 uFog;uniform float uFogOn,uFogFar;vec3 fogged(vec3 c,float depth){return mix(c,uFog,uFogOn*smoothstep(uFogFar*.35,uFogFar,depth)*.9);}`;
const tex=(cv,mips=true)=>{const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=mips?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.generateMipmaps=mips;t.colorSpace=THREE.NoColorSpace;t.anisotropy=4;return t;};

// Boden: Gelände-Kacheln des Spiels als Texturen, Licht im Shader.
const groundMat=map=>new THREE.ShaderMaterial({uniforms:{...shared,map:{value:map}},
 vertexShader:`varying vec2 vUv;varying vec2 vW;varying float vD;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying vec2 vW;varying float vD;${LIGHT_GLSL}${FOG_GLSL}void main(){vec3 c=texture2D(map,vUv).rgb*lightAt(vW);gl_FragColor=vec4(fogged(c,vD),1.);}`});
const chunkGeo=new THREE.PlaneGeometry(TERRAIN_SIZE,TERRAIN_SIZE).rotateX(-Math.PI/2),chunks=new Map();
function ensureChunks(cx,cy,radius){let made=0;const r=Math.ceil(radius/TERRAIN_SIZE),gx0=Math.floor(cx/TERRAIN_SIZE),gy0=Math.floor(cy/TERRAIN_SIZE);
 for(let ring=0;ring<=r&&!made;ring++)for(let gx=gx0-ring;gx<=gx0+ring&&!made;gx++)for(let gy=gy0-ring;gy<=gy0+ring&&!made;gy++){const key=gx+','+gy;if(chunks.has(key))continue;
  const m=new THREE.Mesh(chunkGeo,groundMat(tex(createTerrainChunk(world,gx,gy))));m.position.set((gx+.5)*TERRAIN_SIZE,0,(gy+.5)*TERRAIN_SIZE);m.renderOrder=0;scene.add(m);chunks.set(key,m);made++;}
 if(chunks.size>90)for(const [key,m] of chunks){const d=Math.hypot(m.position.x-cx,m.position.z-cy);if(d>radius+TERRAIN_SIZE*3){scene.remove(m);m.material.uniforms.map.value.dispose();m.material.dispose();chunks.delete(key);if(chunks.size<=70)break;}}
 return made;}

// Tafeln: eine Geometrie, Ursprung = Fußpunkt. `shadow` legt dieselbe Silhouette flach auf den Boden.
const quad=new THREE.PlaneGeometry(1,1).translate(0,.5,0);
function boardGeometry(items){const g=new THREE.InstancedBufferGeometry();g.index=quad.index;g.setAttribute('position',quad.getAttribute('position'));g.setAttribute('uv',quad.getAttribute('uv'));
 const o=new Float32Array(items.length*3),s=new Float32Array(items.length*3);items.forEach((it,i)=>{o.set([it.x,0,it.y],i*3);s.set([it.w,it.h,it.anchor||0],i*3);});
 g.setAttribute('aOrigin',new THREE.InstancedBufferAttribute(o,3));g.setAttribute('aSize',new THREE.InstancedBufferAttribute(s,3));g.instanceCount=items.length;return g;}
const boardVS=shadow=>`attribute vec3 aOrigin;attribute vec3 aSize;uniform float uSway,uWind;varying vec2 vUv;varying vec3 vLit;varying float vD;${LIGHT_GLSL}
void main(){vUv=uv;float h=position.y-aSize.z;float sway=uSway*uWind*sin(uTime*1.3+aOrigin.x*.013+aOrigin.z*.017)*max(h,0.)*max(h,0.)*aSize.y*.045;
 ${shadow?`vec3 w=aOrigin+vec3(position.x*aSize.x+sway,0.,0.)+vec3(.62,0.,.30)*h*aSize.y;w.y=.4;vec4 mv=viewMatrix*vec4(w,1.);`
 :`vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);vec3 w=aOrigin+right*(position.x*aSize.x+sway)+up*h*aSize.y;vec4 mv=viewMatrix*vec4(w,1.);mv.z+=aSize.z*aSize.y+6.;`}
 vLit=lightAt(aOrigin.xz);vD=-mv.z;gl_Position=projectionMatrix*mv;}`;
const boardMat=(map,{shadow=false,sway=0}={})=>new THREE.ShaderMaterial({uniforms:{...shared,map:{value:map},uSway:{value:sway}},transparent:shadow,depthWrite:!shadow,side:shadow?THREE.DoubleSide:THREE.FrontSide,polygonOffset:shadow,polygonOffsetFactor:-2,polygonOffsetUnits:-2,vertexShader:boardVS(shadow),
 fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying vec3 vLit;varying float vD;${FOG_GLSL}uniform float uNight;
 void main(){vec4 t=texture2D(map,vUv);${shadow?`gl_FragColor=vec4(.04,.07,.14,smoothstep(.3,.7,t.a)*.34*(1.-uNight*.55));`:`if(t.a<.5)discard;gl_FragColor=vec4(fogged(t.rgb*vLit,vD),1.);`}}`});
const shadowMeshes=[];
function board(map,items,{sway=0,shadow=true}={}){const geo=boardGeometry(items),m=new THREE.Mesh(geo,boardMat(map,{sway}));m.frustumCulled=false;m.renderOrder=2;scene.add(m);
 if(shadow){const s=new THREE.Mesh(geo,boardMat(map,{shadow:true,sway}));s.frustumCulled=false;s.renderOrder=1;scene.add(s);shadowMeshes.push(s);m.userData.shadow=s;}return m;}

await new Promise(r=>setTimeout(r,1500));            // Grafikdateien der Zeichner laden asynchron nach
// Bäume: zehn Varianten, jede ein einziger Zeichenaufruf für alle Exemplare der Welt.
const treeKinds=new Map();for(const t of world.trees){const key=(t.type==='pine'?'pine':'tree')+t.variant;if(!treeKinds.has(key))treeKinds.set(key,[]);treeKinds.get(key).push(t);}
for(const [key,list] of treeKinds){const cv=document.createElement('canvas');cv.width=88*4;cv.height=110*4;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.scale(4,4);const sample={...list[0],x:44,y:96,size:1};
 if(!drawAssetTree(c,sample,0)){c.setTransform(1,0,0,1,0,0);c.drawImage(createComicTree(sample.variant,sample.type==='pine'),0,0,cv.width,cv.height);}
 board(tex(cv),list.map(t=>({x:t.x,y:t.y,w:88*t.size,h:110*t.size,anchor:14/110})),{sway:1});}

// Häuser: bei Annäherung einmal mit dem bestehenden Zeichner gebacken.
const houses=new Map(),PX=3;
function bakeHouse(b){const top=(b.wallHeight||60)+(b.roofHeight||50)+60,left=30,right=50,bottom=26,w=b.maxX-b.minX+left+right,h=b.maxY-b.minY+top+bottom,cv=document.createElement('canvas');cv.width=Math.ceil(w*PX);cv.height=Math.ceil(h*PX);
 const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.scale(PX,PX);c.translate(-(b.minX-left),-(b.minY-top));drawBuilding(c,b,0);
 return board(tex(cv),[{x:(b.minX-left)+w/2,y:b.maxY,w,h,anchor:bottom/h}],{shadow:false});}
function ensureHouses(cx,cy,radius){let made=0;for(const b of world.buildings){if(houses.has(b.id))continue;if(Math.hypot(b.x-cx,b.y-cy)>radius)continue;houses.set(b.id,bakeHouse(b));if(++made>=2)break;}
 if(houses.size>260)for(const [id,m] of houses){if(Math.hypot(m.geometry.getAttribute('aOrigin').getX(0)-cx,m.geometry.getAttribute('aOrigin').getZ(0)-cy)>radius*1.6){scene.remove(m);m.material.uniforms.map.value.dispose();houses.delete(id);}}
 return made;}

// Figuren: der bestehende Zeichner malt jedes Bild in eine kleine Leinwand, die als Textur auf der Tafel liegt.
class Actor{constructor(ref,draw,size=72){this.ref=ref;this.draw=draw;this.size=size;this.cv=document.createElement('canvas');this.cv.width=this.cv.height=size*4;this.c=this.cv.getContext('2d');this.map=tex(this.cv,false);this.mesh=board(this.map,[{x:0,y:0,w:size,h:size,anchor:.25}]);this.origin=this.mesh.geometry.getAttribute('aOrigin');}
 update(time,visible,shadows){this.mesh.visible=visible;this.mesh.userData.shadow.visible=visible&&shadows;if(!visible)return;const c=this.c,s=this.size;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,s*4,s*4);c.imageSmoothingEnabled=false;c.setTransform(4,0,0,4,s*2,s*3);this.draw(c,this.ref,time);this.map.needsUpdate=true;this.origin.setXYZ(0,this.ref.x,0,this.ref.y);this.origin.needsUpdate=true;}}
const actors=[new Actor(game.player,(c,p,t)=>drawClanHero(c,0,0,t,{...p,classId:p.look||p.classId}))];
for(const e of game.enemies)actors.push(new Actor(e,(c,en,t)=>{c.translate(-en.x,-en.y);drawClanEnemy(c,en,t);},96));
for(const a of game.life?.actors||[])actors.push(new Actor(a,(c,r,t)=>{const s=r.kind==='villager'?WORLD_SCALE.npc/33:1;c.scale(s,s);drawComicResident(c,{...r,x:0,y:0},t);}));

// Partikel im Raum: Funken steigen wirklich nach oben, Glühwürmchen schweben in Kniehöhe.
const dots=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(2780*3),3)),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 uniforms:{uTime:shared.uTime,uNight:shared.uNight,uCam:{value:new THREE.Vector2()},uFire:{value:Array.from({length:8},()=>new THREE.Vector2())},uNF:{value:0},uPx:{value:1}},
 vertexShader:`uniform float uTime,uNight,uPx;uniform vec2 uCam;uniform vec2 uFire[8];uniform int uNF;varying vec4 tint;float h(float n){return fract(sin(n*12.9898)*43758.5453);}
 void main(){float id=float(gl_VertexID),a=h(id),b=h(id+.37),c=h(id+.71);vec3 w;float size;
  if(gl_VertexID<2600){if(uNF==0){gl_Position=vec4(2.,2.,0.,1.);gl_PointSize=0.;tint=vec4(0.);return;}vec2 f=uFire[int(a*float(uNF))];float t=fract(uTime*(.35+b*.4)+c);w=vec3(f.x+(b-.5)*22.+sin(t*7.+a*40.)*9.*t,4.+t*(50.+a*70.),f.y+(c-.5)*16.);tint=vec4(1.,.35+.5*(1.-t),.12,(1.-t)*(1.-t));size=2.6-t;}
  else{vec2 cell=vec2(1600.,1600.);vec2 base=vec2(a,b)*cell+vec2(sin(uTime*.35+c*40.),cos(uTime*.28+a*30.))*46.;vec2 p=uCam+mod(base-uCam,cell)-cell*.5;w=vec3(p.x,8.+10.*sin(uTime*.6+c*20.),p.y);tint=vec4(.72,1.,.42,(.5+.5*sin(uTime*2.2+c*60.))*uNight);size=2.;}
  vec4 mv=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mv;gl_PointSize=size*uPx/-mv.z;}`,
 fragmentShader:`varying vec4 tint;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint.rgb,1.)*tint.a*smoothstep(.5,.05,d);}`}));
dots.frustumCulled=false;dots.renderOrder=3;scene.add(dots);

function resize(){const r=canvas.getBoundingClientRect();gl3.setPixelRatio(1);gl3.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
const tiltInput=()=>document.querySelectorAll('#panel input[type=range]')[0],zoomInput=()=>document.querySelectorAll('#panel input[type=range]')[1];
canvas.addEventListener('wheel',e=>{e.preventDefault();ui.zoom=clamp(ui.zoom*(e.deltaY>0?1.12:.89),140,2600);zoomInput().value=ui.zoom;},{passive:false});
let drag=null;canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(e.button===2){drag={y:e.clientY,tilt:ui.tilt};canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(drag){ui.tilt=clamp(drag.tilt+(e.clientY-drag.y)*.2,32,86);tiltInput().value=ui.tilt;}});
canvas.addEventListener('pointerup',e=>{drag=null;});
const ray=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);if(ray.ray.intersectPlane(ground,hit)){const p={x:hit.x,y:hit.z};shock.add(p.x,p.y);game.navigate?.(p);}});

const focus={x:game.player.x,y:game.player.y};let last=performance.now(),pending=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.tick(dt);if(Array.isArray(game.events))game.events.length=0;shock.tick(dt);
 const p=game.player,k=1-Math.exp(-8*dt);if(Math.hypot(p.x-focus.x,p.y-focus.y)>900){focus.x=p.x;focus.y=p.y;}focus.x+=(p.x-focus.x)*k;focus.y+=(p.y-focus.y)*k;
 fps.begin();
 const th=ui.tilt*Math.PI/180,dist=ui.zoom/Math.tan(camera.fov*Math.PI/360)/2;camera.position.set(focus.x,Math.sin(th)*dist,focus.y+Math.cos(th)*dist);camera.lookAt(focus.x,12,focus.y);
 const reach=Math.max(900,ui.zoom*camera.aspect*.75+ui.zoom/Math.tan(th)*.9);pending=ensureChunks(focus.x,focus.y-reach*.25,reach)+ensureHouses(focus.x,focus.y-reach*.2,Math.min(reach,1700));
 const n=ui.night,near=ui.lights?nearestLights(lights,focus.x,focus.y,MAXL,p):[];shared.uAmb.value.setRGB(1-n*.87,1-n*.81,1-n*.62);shared.uNight.value=n;shared.uTime.value=game.time;shared.uN.value=near.length;shared.uWind.value=ui.wind?1:0;
 near.forEach((l,i)=>{shared.uLP.value[i].set(l.x,l.y,l.r,l.fire?1:0);shared.uLC.value[i].set(...l.color);});
 for(let i=0;i<4;i++){const s=shock.list[i];shared.uShock.value[i].set(s?s.x:0,s?s.y:0,s?s.age:9);}
 const fogCol=new THREE.Color().setRGB(.62+(.05-.62)*n,.70+(.08-.70)*n,.78+(.17-.78)*n);shared.uFog.value.copy(fogCol);shared.uFogOn.value=ui.fog?1:0;shared.uFogFar.value=dist*2.6;scene.background=fogCol;
 for(const s of shadowMeshes)s.visible=ui.shadows;
 for(const a of actors){const r=a.ref,alive=r.hp===undefined||r.hp>0;a.update(game.time,alive&&Math.hypot(r.x-focus.x,r.y-focus.y)<reach+200,ui.shadows);}
 const fires=near.filter(l=>l.fire).slice(0,8);dots.visible=ui.embers;dots.material.uniforms.uNF.value=fires.length;fires.forEach((f,i)=>dots.material.uniforms.uFire.value[i].set(f.x,f.y));dots.material.uniforms.uCam.value.set(focus.x,focus.y);dots.material.uniforms.uPx.value=canvas.height*2.2;
 gl3.render(scene,camera);
 fps.end(`${gl3.info.render.calls} Zeichenaufrufe · ${world.trees.length} Bäume${pending?' · lädt Umgebung…':''}`);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.proto={game,ui,scene,camera,gl3};
