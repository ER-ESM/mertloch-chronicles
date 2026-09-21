// Effektschicht der Welt (E-47): eine WebGL2-Leinwand über der Weltfläche. Der Canvas-2D-Renderer bleibt, wie er ist;
// sein fertiges Bild geht als Textur in einen Shader (Druckwellen, Hitzeflimmern, Bloom), dazu Nebel, Regen, Wetterleuchten und Partikel.
// Licht, Schatten und Farbabstimmung bleiben bei world-light.js (E-39) – die Schicht legt sich darunter, nichts wird doppelt gezeichnet.
// Stufen: 'voll' (mit Weltbild-Textur) · 'leicht' (durchsichtig, nur Wetter und Partikel) · 'aus'. Werte: content/world-fx.js.
// Diagnose: ?fx=debug blendet Stufe und Kosten ein, ?fx=voll|leicht|aus erzwingt eine Stufe (kombinierbar: ?fx=voll,debug); Zustand unter window.mertloch.state().fx.
import {WORLD_FX as F,LIGHTING} from './content/index.js';

const clamp01=v=>Math.max(0,Math.min(1,v)),smooth=(a,b,v)=>{const t=clamp01((v-a)/(b-a));return t*t*(3-2*t);};
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);

/** Wetter aus der Spielzeit: Regenanteil 0–1 und Wetterleuchten 0–1. Deterministisch, damit Tests und Mitspieler dasselbe sehen. */
export function weatherAt(time,W=F.weather){
 const t=time-W.first;if(t<0)return {rain:0,flash:0};
 const phase=t%W.period,rain=phase<W.rain?Math.min(smooth(0,W.fade,phase),1-smooth(W.rain-W.fade,W.rain,phase)):0;
 const slot=Math.floor(time/W.flash.slot),since=time-slot*W.flash.slot,flash=rain>.5&&hash(slot)<W.flash.chance?Math.max(0,1-since/W.flash.decay)*W.flash.power:0;
 return {rain,flash};
}
/** Nebelanteil aus dem Dunkelanteil des Gebiets; Regen legt einen dünnen Schleier dazu. */
export function fogAt(dark,rain=0,G=F.fog){return Math.min(1,smooth(G.from,G.full,dark)*G.alpha+rain*G.rainAlpha);}
/** Druckwellen aus den Darstellungs-Ereignissen des Spiels (game.fx): [x, y, Radius jetzt, Stärke jetzt]. */
export function shocksFrom(fx=[],S=F.shock){
 const out=[];for(const f of fx){const def=(f.type==='combat'?S.kinds[f.kind]:S.types[f.type]);if(!def||!(f.max>0))continue;const age=clamp01(1-f.life/f.max);out.push([f.x,f.y,def.radius*Math.sqrt(age),def.power*(1-age)*(1-age)]);}
 return out.sort((a,b)=>b[3]-a[3]).slice(0,S.max);
}
/** Anzahl sichtbarer Glühwürmchen für einen Dunkelanteil. */
export function firefliesAt(dark,P=F.particles){return Math.round(P.fireflies*smooth(P.fireflyFrom,P.fireflyFull,dark));}

const MAXS=F.shock.max,MAXH=F.heat.max;
const VS=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FS=`#version 300 es
precision highp float;
in vec2 uv;out vec4 o;
uniform sampler2D img;uniform vec2 res,origin,size;uniform float time,full,bloomT,bloomS,shockW,heatR,heatRise,heatP,fog,fogScale,rain,streak,dim,flash;
uniform vec2 fogWind;uniform vec3 fogCol,rainCol;uniform int nShock,nHeat;uniform vec4 shock[${MAXS}];uniform vec2 heat[${MAXH}];
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
void main(){
 vec2 st=vec2(uv.x,1.-uv.y),wp=origin+st*size;
 float fg=fog*smoothstep(.38,.82,fbm(wp*fogScale+fogWind*time));
 float streaks=0.;
 if(rain>0.){vec2 q=st*res/vec2(5.,64.);q.x+=q.y*.9;float a=step(.965,hash(floor(vec2(q.x,q.y+time*9.))))*fract(q.y+time*9.);vec2 r=st*res/vec2(3.,44.);r.x+=r.y*.9;float b=step(.975,hash(floor(vec2(r.x+31.,r.y+time*13.))))*fract(r.y+time*13.);streaks=(a*.6+b*.4)*rain*streak;}
 if(full<.5){ // leichte Stufe: durchsichtige Überlagerung, vormultipliziert
  float a=clamp(fg+rain*dim,0.,1.);vec3 c=fogCol*fg+rainCol*streaks+vec3(.55,.6,.75)*flash;o=vec4(c,a);return;}
 vec2 d=vec2(0.);
 for(int i=0;i<nShock;i++){vec2 r=wp-shock[i].xy;float l=length(r);d-=normalize(r+1e-4)*smoothstep(shockW,0.,abs(l-shock[i].z))*shock[i].w;}
 for(int i=0;i<nHeat;i++){vec2 r=(wp-heat[i]+vec2(0.,heatRise))*vec2(1.,.55);d+=smoothstep(heatR,0.,length(r))*vec2(sin(wp.y*.9+time*9.),cos(wp.x*.7+time*7.))*heatP;}
 vec2 s2=st+d/size;vec3 col=texture(img,s2).rgb;
 if(bloomS>0.){vec3 glow=(textureLod(img,s2,3.).rgb+textureLod(img,s2,4.5).rgb+textureLod(img,s2,6.).rgb)/3.;col+=max(glow-bloomT,0.)*bloomS;}
 col=mix(col,fogCol,fg);
 col=col*(1.-rain*dim)+rainCol*streaks+vec3(.55,.6,.75)*flash;
 o=vec4(col,1.);
}`;
const PVS=`#version 300 es
precision highp float;
uniform vec2 origin,size,cell;uniform float time;uniform int nFire,embers;uniform vec3 fire[${MAXH}];
out vec4 tint;
float h(float n){return fract(sin(n*12.9898)*43758.5453);}
void main(){
 float id=float(gl_VertexID),a=h(id),b=h(id+.37),c=h(id+.71);vec2 wp;float px;
 if(gl_VertexID<embers){if(nFire==0){gl_Position=vec4(2.,2.,0.,1.);gl_PointSize=0.;tint=vec4(0.);return;}
  vec3 f=fire[int(a*float(nFire))%nFire];float t=fract(time*(.35+b*.4)+c);wp=f.xy+vec2((b-.5)*18.*f.z+sin(t*7.+a*40.)*7.*t,-t*(38.+a*46.)*f.z);tint=vec4(1.,.35+.5*(1.-t),.12,(1.-t)*(1.-t)*.8);px=1.7-t*.7;}
 else{vec2 base=vec2(a,b)*cell+vec2(sin(time*.35+c*40.),cos(time*.28+a*30.))*40.;vec2 mid=origin+size*.5;wp=mid+mod(base-mid,cell)-cell*.5;tint=vec4(.72,1.,.42,.5+.5*sin(time*2.2+c*60.));px=1.5;}
 vec2 st=(wp-origin)/size;gl_Position=vec4(st.x*2.-1.,1.-st.y*2.,0.,1.);gl_PointSize=px*3.;
}`;
const PFS=`#version 300 es
precision highp float;in vec4 tint;out vec4 o;void main(){float d=length(gl_PointCoord-.5);float a=tint.a*smoothstep(.5,.05,d);o=vec4(tint.rgb*a,0.);}`;

export class WorldFx{
 constructor(options={}){const q=(typeof location==='undefined'?'':new URLSearchParams(location.search).get('fx')||'').split(',');this.forced=q.find(v=>['voll','leicht','aus'].includes(v))||options.mode||null;this.debug=q.includes('debug')||options.debug===true;this.mode=this.forced||'voll';this.cost=0;this.frames=0;this.upload=0;this.reason='';this.stats={mode:this.mode,ms:0,uploadMs:0,shocks:0,heat:0,rain:0,fog:0,fireflies:0,reason:''};}
 /** Hängt die Leinwand direkt hinter die Weltfläche – unter die Licht-Ebenen aus E-39, unter das HUD. Klicks gehen durch. */
 mount(world){if(this.canvas||this.mode==='aus'||!world?.parentNode)return;const cv=this.canvas=document.createElement('canvas');cv.className='world-fx';cv.setAttribute('aria-hidden','true');Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});world.after(cv);this.world=world;
  const gl=this.gl=cv.getContext('webgl2',{antialias:false,alpha:true,premultipliedAlpha:true,powerPreference:'high-performance'});if(!gl)return this.fail('WebGL2 nicht verfügbar');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail('Grafikkontext verloren');});
  try{this.post=this.program(VS,FS);this.dots=this.program(PVS,PFS);}catch(error){return this.fail('Shader: '+error.message);}
  this.quad=gl.createVertexArray();gl.bindVertexArray(this.quad);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(this.post,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);this.none=gl.createVertexArray();
  this.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(this.debug){const d=this.panel=document.createElement('div');Object.assign(d.style,{position:'absolute',left:'8px',bottom:'8px',zIndex:'99',padding:'3px 8px',background:'#000b',color:'#d8f0c0',font:'600 12px ui-monospace,Consolas,monospace',pointerEvents:'none',borderRadius:'5px'});world.parentNode.append(d);}}
 program(vs,fs){const gl=this.gl,p=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));p.u=new Map();return p;}
 u(p,name){let l=p.u.get(name);if(l===undefined){l=this.gl.getUniformLocation(p,name);p.u.set(name,l);}return l;}
 fail(reason){this.mode='aus';this.reason=reason;this.stats.mode='aus';this.stats.reason=reason;if(this.canvas)this.canvas.style.display='none';if(this.debug)console.warn('[world-fx] aus: '+reason);}
 show(on){if(!this.canvas)return;const value=on&&this.mode!=='aus'?'block':'none';if(this.canvas.style.display!==value)this.canvas.style.display=value;}
 /** Ein Bild der Effektschicht. `view` = sichtbarer Weltausschnitt, `light` = WorldLight (Dunkelanteil und Lichtquellen aus E-39). */
 render(view,game,world,time,light){const gl=this.gl;if(!gl||this.mode==='aus')return;const t0=performance.now(),cv=this.canvas,src=this.world,{ox,oy,W,H}=view,full=this.mode==='voll';
  const rect=src.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
  if(cv.style.filter!==src.style.filter)cv.style.filter=src.style.filter;
  const dark=light?.dark??0,{rain,flash}=weatherAt(time),fog=fogAt(dark,rain),shocks=full?shocksFrom(game.fx):[],visible=(o,pad)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad;
  const fires=(light?.sources(game,world,visible,time)||[]).filter(s=>F.heat.sources.some(k=>LIGHTING.sources[k]===s.s)).slice(0,MAXH),flies=firefliesAt(dark);
  if(full){const u0=performance.now();gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);if(F.bloom.strength>0)gl.generateMipmap(gl.TEXTURE_2D);this.upload+=(performance.now()-u0-this.upload)*.1;}
  gl.viewport(0,0,w,h);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  const p=this.post,f1=(n,v)=>gl.uniform1f(this.u(p,n),v);gl.useProgram(p);gl.bindVertexArray(this.quad);
  gl.uniform2f(this.u(p,'res'),w,h);gl.uniform2f(this.u(p,'origin'),ox,oy);gl.uniform2f(this.u(p,'size'),W,H);f1('time',time);f1('full',full?1:0);f1('bloomT',F.bloom.threshold);f1('bloomS',F.bloom.strength);
  f1('shockW',F.shock.width);f1('heatR',F.heat.radius);f1('heatRise',F.heat.rise);f1('heatP',F.heat.power);f1('fog',fog);f1('fogScale',F.fog.scale);gl.uniform2f(this.u(p,'fogWind'),F.fog.wind.x,F.fog.wind.y);
  const day=rgb(F.fog.day),night=rgb(F.fog.night),k=clamp01(dark*2.5);gl.uniform3f(this.u(p,'fogCol'),...day.map((v,i)=>v+(night[i]-v)*k));gl.uniform3f(this.u(p,'rainCol'),...rgb(F.weather.tint));f1('rain',rain);f1('streak',F.weather.streak);f1('dim',F.weather.dim);f1('flash',flash);
  gl.uniform1i(this.u(p,'nShock'),shocks.length);if(shocks.length)gl.uniform4fv(this.u(p,'shock[0]'),new Float32Array(shocks.flat()));
  gl.uniform1i(this.u(p,'nHeat'),full?fires.length:0);if(full&&fires.length)gl.uniform2fv(this.u(p,'heat[0]'),new Float32Array(fires.flatMap(s=>[s.x,s.y])));
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  const count=F.particles.embers+flies;if(fires.length||flies){const d=this.dots;gl.useProgram(d);gl.bindVertexArray(this.none);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
   gl.uniform2f(this.u(d,'origin'),ox,oy);gl.uniform2f(this.u(d,'size'),W,H);gl.uniform2f(this.u(d,'cell'),F.particles.cell.x,F.particles.cell.y);gl.uniform1f(this.u(d,'time'),time);gl.uniform1i(this.u(d,'embers'),F.particles.embers);
   gl.uniform1i(this.u(d,'nFire'),fires.length);if(fires.length)gl.uniform3fv(this.u(d,'fire[0]'),new Float32Array(fires.flatMap(s=>[s.x,s.y,s.scale||1])));gl.drawArrays(gl.POINTS,0,count);}
  const ms=performance.now()-t0;this.guard(ms);Object.assign(this.stats,{mode:this.mode,ms:+this.cost.toFixed(2),uploadMs:+this.upload.toFixed(2),shocks:shocks.length,heat:fires.length,rain:+rain.toFixed(2),fog:+fog.toFixed(2),fireflies:flies,reason:this.reason});
  if(this.panel)this.panel.textContent=`Effekte ${this.mode} · ${this.stats.ms} ms (Textur ${this.stats.uploadMs} ms) · Wellen ${shocks.length} · Feuer ${fires.length} · Regen ${this.stats.rain} · Nebel ${this.stats.fog}${this.reason?' · '+this.reason:''}`;}
 /** Selbstschutz: gleitendes Mittel der Kosten; zu teuer ⇒ leichte Stufe. Eine erzwungene Stufe (?fx=voll) bleibt. */
 guard(ms){this.cost+=(ms-this.cost)*.05;this.frames++;if(this.forced||this.mode!=='voll'||this.frames<F.guard.window||this.cost<=F.guard.budgetMs)return;this.mode='leicht';this.reason=`zu teuer (${this.cost.toFixed(1)} ms), leichte Stufe`;this.upload=0;this.cost=0;if(this.debug)console.warn('[world-fx] '+this.reason);}
}
