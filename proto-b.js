// Prototyp B: WebGL-Effektschicht. Der echte Canvas-2D-Renderer zeichnet unverändert in eine unsichtbare Leinwand;
// ihr Bild geht einmal je Bild als Textur in einen Vollbild-Shader (Licht, Bloom, Flimmern, Wetter, Druckwellen), darüber GPU-Partikel.
// Rohes WebGL2, keine Bibliothek – die Regel „ohne Abhängigkeiten" bleibt unangetastet.
import {Renderer} from './renderer.js';
import {$,bootGame,bindKeys,places,jump,lightSources,nearestLights,panel,meter,Shockwaves} from './proto-common.js';

const {world,game}=await bootGame();
const source=$('world');source.classList.add('hidden-source');
const view=document.createElement('canvas');view.id='fx';$('stage').append(view);
const renderer=new Renderer(source,world,game);
bindKeys(game);
$('sub').textContent='Spielbild wie heute, danach ein Shader über das ganze Bild und Partikel auf der Grafikkarte. Aufwand: 3–5 Tage.';
$('help').textContent='WASD laufen · Klick = Druckwelle + Laufziel';
const spots=places(world,game),lights=lightSources(world),shock=new Shockwaves(),fps=meter($('meter'));
const ui=panel($('panel'),[
 {type:'head',label:'Stimmung'},
 {id:'night',type:'range',label:'Nacht',min:0,max:1,value:.75},
 {id:'lights',type:'check',label:'Lichtquellen (24, flackernd)',value:true},
 {id:'fog',type:'check',label:'Bodennebel (Rauschen im Shader)',value:true},
 {id:'clouds',type:'check',label:'Wolkenschatten',value:true},
 {id:'rain',type:'check',label:'Regen + Wetterleuchten',value:false},
 {id:'embers',type:'check',label:'Funken + Glühwürmchen',value:true,hint:'2600 Funken + 180 Glühwürmchen, auf der Grafikkarte gerechnet'},
 {type:'head',label:'Nur mit Shader'},
 {id:'bloom',type:'check',label:'Bloom',value:true},
 {id:'grade',type:'check',label:'Farbstimmung',value:true,hint:'Kontrast 1,19 / Sättigung 1,09 – kostet nichts'},
 {id:'heat',type:'check',label:'Hitzeflimmern am Feuer',value:true},
 {id:'warp',type:'check',label:'Druckwelle verzerrt das Bild',value:true},
 {id:'vignette',type:'check',label:'Randabdunklung',value:true},
 {type:'head',label:'Vergleich'},
 {id:'off',type:'check',label:'Effektschicht aus (Rohbild)',value:false},
 {type:'head',label:'Ort'},
 ...spots.map(s=>({id:'go-'+s.id,type:'button',label:s.label}))
],id=>{const s=spots.find(s=>'go-'+s.id===id);if(s){jump(game,s);renderer.camera={...game.player};}});

const gl=view.getContext('webgl2',{antialias:false,alpha:false,preserveDrawingBuffer:true});
if(!gl){$('fail').style.display='grid';$('fail').textContent='WebGL2 steht in diesem Browser nicht zur Verfügung.';throw Error('no webgl2');}
const MAXL=24;
const VS=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FS=`#version 300 es
precision highp float;
in vec2 uv;out vec4 o;
uniform sampler2D img;uniform vec2 res,view,cam;uniform float time,night,flash;
uniform int nLights,nShock;uniform vec4 lightPos[${MAXL}];uniform vec3 lightCol[${MAXL}];uniform vec3 shock[4];
uniform float fBloom,fGrade,fHeat,fWarp,fVig,fFog,fRain,fClouds,fLights,fOff;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
void main(){
 vec2 st=vec2(uv.x,1.-uv.y);                 // Bildkoordinate, y nach unten wie im Spiel
 vec2 wp=cam+(st-.5)*view;                   // Weltkoordinate dieses Bildpunkts
 if(fOff>.5){o=texture(img,st);return;}
 vec2 d=vec2(0.);
 for(int i=0;i<nShock;i++){vec2 r=wp-shock[i].xy;float l=length(r),ring=shock[i].z*150.,w=smoothstep(26.,0.,abs(l-ring))*(1.-shock[i].z);d-=fWarp*normalize(r+1e-4)*w*14.;}
 for(int i=0;i<nLights;i++){if(lightPos[i].w<.5)continue;vec2 r=wp-lightPos[i].xy-vec2(0.,-22.);float f=smoothstep(46.,0.,length(r*vec2(1.,.55)));d+=fHeat*f*vec2(sin(wp.y*.9+time*9.),cos(wp.x*.7+time*7.))*1.6;}
 vec2 s2=st+d/view;
 vec3 col=texture(img,s2).rgb;
 vec3 glow=(textureLod(img,s2,3.).rgb+textureLod(img,s2,4.5).rgb+textureLod(img,s2,6.).rgb)/3.;
 // Wolkenschatten wandern in der Welt, nicht auf dem Schirm
 float cl=smoothstep(.48,.72,fbm(wp*.0016+vec2(time*.012,time*.005)));col*=1.-fClouds*cl*.32*(1.-night*.6);
 // Licht: Nacht als Multiplikation, Lichtquellen heben sie wieder auf
 vec3 amb=mix(vec3(1.),vec3(.13,.19,.38),night);vec3 lit=amb;
 for(int i=0;i<nLights;i++){vec2 r=(wp-lightPos[i].xy)*vec2(1.,1.25);float fl=lightPos[i].w>.5?.86+.14*sin(time*11.+lightPos[i].x)*sin(time*7.3+lightPos[i].y):1.;float a=1.-clamp(length(r)/(lightPos[i].z*fl),0.,1.);lit+=fLights*night*lightCol[i]*a*a*1.25;}
 col*=min(lit,vec3(1.35));
 col+=fBloom*max(glow*min(lit,vec3(1.35))-.42,0.)*1.1;
 // Bodennebel
 float fg=fbm(wp*.006+vec2(time*.05,time*.018));col=mix(col,mix(vec3(.62,.68,.74),vec3(.20,.26,.40),night),fFog*smoothstep(.42,.85,fg)*(.32+.2*night));
 // Regen: zwei Schichten Streifen, dazu Wetterleuchten
 if(fRain>.5){vec2 q=st*res/vec2(7.,90.);q.x+=q.y*.9;float r1=step(.965,hash(floor(vec2(q.x,q.y+time*9.))))*fract(q.y+time*9.);vec2 q2=st*res/vec2(4.,60.);q2.x+=q2.y*.9;float r2=step(.975,hash(floor(vec2(q2.x+31.,q2.y+time*13.))))*fract(q2.y+time*13.);col=col*vec3(.78,.84,.95)+vec3(.55,.62,.75)*(r1*.5+r2*.3);col+=flash*vec3(.55,.6,.75);}
 if(fGrade>.5){col=(col-.5)*1.19+.5;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.09);}
 col*=1.-fVig*smoothstep(.45,1.05,length((uv-.5)*vec2(1.15,1.)))*.55;
 o=vec4(col,1.);
}`;
// Partikel: Lage vollständig im Vertex-Shader aus Nummer + Zeit – die CPU tut nichts.
const PVS=`#version 300 es
precision highp float;
uniform vec2 view,cam;uniform float time,night;uniform int nFire;uniform vec2 fire[8];
out vec4 tint;
float h(float n){return fract(sin(n*12.9898)*43758.5453);}
void main(){
 float id=float(gl_VertexID),a=h(id),b=h(id+.37),c=h(id+.71);vec2 wp;float size;
 if(gl_VertexID<2600&&nFire==0){gl_Position=vec4(2.,2.,0.,1.);gl_PointSize=0.;tint=vec4(0.);return;}
 if(gl_VertexID<2600){vec2 f=fire[int(a*float(nFire))%nFire];float t=fract(time*(.35+b*.4)+c);wp=f+vec2((b-.5)*26.+sin(t*7.+a*40.)*9.*t,-t*(60.+a*70.));tint=vec4(1.,.35+.5*(1.-t),.12,(1.-t)*(1.-t));size=2.4-t;}
 else{vec2 cell=vec2(1400.,900.);vec2 base=vec2(a,b)*cell+vec2(sin(time*.35+c*40.),cos(time*.28+a*30.))*46.;wp=cam+mod(base-cam,cell)-cell*.5;tint=vec4(.72,1.,.42,(.5+.5*sin(time*2.2+c*60.))*night);size=1.6;}
 vec2 st=(wp-cam)/view+.5;gl_Position=vec4(st.x*2.-1.,1.-st.y*2.,0.,1.);gl_PointSize=size*3.;
}`;
const PFS=`#version 300 es
precision highp float;in vec4 tint;out vec4 o;void main(){float d=length(gl_PointCoord-.5);o=vec4(tint.rgb,1.)*tint.a*smoothstep(.5,.05,d);}`;
function program(vs,fs){const p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
const post=program(VS,FS),dots=program(PVS,PFS),U=(p,n)=>gl.getUniformLocation(p,n);
const quad=gl.createVertexArray();gl.bindVertexArray(quad);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.bindAttribLocation(post,0,'p');gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const none=gl.createVertexArray();
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

function resize(){renderer.resize();const r=view.getBoundingClientRect();view.width=Math.round(r.width);view.height=Math.round(r.height);}
addEventListener('resize',resize);resize();
view.addEventListener('click',e=>{const p=renderer.screenToWorld(e.clientX,e.clientY);shock.add(p.x,p.y);game.navigate?.(p);});

let flash=0,upload=0;
function present(time){
 const cam=renderer.camera,near=nearestLights(lights,cam.x,cam.y,MAXL,game.player),fires=near.filter(l=>l.fire).slice(0,8);
 const t0=performance.now();
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);if(ui.bloom&&!ui.off)gl.generateMipmap(gl.TEXTURE_2D);
 upload=upload*.9+(performance.now()-t0)*.1;
 if(ui.rain&&Math.random()<.004)flash=1;flash*=.86;
 gl.viewport(0,0,view.width,view.height);gl.disable(gl.BLEND);gl.useProgram(post);gl.bindVertexArray(quad);
 gl.uniform2f(U(post,'res'),view.width,view.height);gl.uniform2f(U(post,'view'),renderer.viewWidth,renderer.viewHeight);gl.uniform2f(U(post,'cam'),cam.x,cam.y);
 gl.uniform1f(U(post,'time'),time);gl.uniform1f(U(post,'night'),ui.night);gl.uniform1f(U(post,'flash'),flash);
 gl.uniform1i(U(post,'nLights'),near.length);gl.uniform4fv(U(post,'lightPos'),new Float32Array(MAXL*4).map((_,i)=>{const l=near[i>>2];return l?[l.x,l.y,l.r,l.fire?1:0][i&3]:0;}));
 gl.uniform3fv(U(post,'lightCol'),new Float32Array(MAXL*3).map((_,i)=>near[Math.floor(i/3)]?.color[i%3]??0));
 gl.uniform1i(U(post,'nShock'),shock.list.length);gl.uniform3fv(U(post,'shock'),new Float32Array(12).map((_,i)=>{const s=shock.list[Math.floor(i/3)];return s?[s.x,s.y,s.age][i%3]:0;}));
 for(const [k,v] of Object.entries({fBloom:ui.bloom,fGrade:ui.grade,fHeat:ui.heat,fWarp:ui.warp,fVig:ui.vignette,fFog:ui.fog,fRain:ui.rain,fClouds:ui.clouds,fLights:ui.lights,fOff:ui.off}))gl.uniform1f(U(post,k),v?1:0);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 if(ui.embers&&!ui.off){gl.useProgram(dots);gl.bindVertexArray(none);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  gl.uniform2f(U(dots,'view'),renderer.viewWidth,renderer.viewHeight);gl.uniform2f(U(dots,'cam'),cam.x,cam.y);gl.uniform1f(U(dots,'time'),time);gl.uniform1f(U(dots,'night'),ui.night);
  gl.uniform1i(U(dots,'nFire'),fires.length);if(fires.length)gl.uniform2fv(U(dots,'fire'),new Float32Array(16).map((_,i)=>{const f=fires[i>>1];return f?(i&1?f.y-8:f.x):0;}));
  gl.drawArrays(gl.POINTS,0,2780);}
}

let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.tick(dt);if(Array.isArray(game.events))game.events.length=0;shock.tick(dt);
 fps.begin();renderer.draw();present(game.time);fps.end(`Textur-Upload ${upload.toFixed(1)} ms`);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.proto={game,renderer,ui,gl};
