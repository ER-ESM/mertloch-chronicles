// Sprite-Schmiede · Raycaster in der Spielkamera.
// Kamera „schräg“ (Standard): achsparallel von Süden oben, Neigung `pitch`. Bildschirm-y = y·tan(pitch) − z, also
// Höhen 1:1 (Maßstab ist Gesetz: 26 E Figur = 104 px) und Tiefe verkürzt. Kamera „oben“: senkrecht (Beläge, Bodendeko).
// Licht wie light-convention.js: Hauptlicht links oben, kühles Fülllicht rechts, Schatten fallen nach rechts unten.
// Ergebnis: harte Alphakante, Farben auf PRECISION_PALETTE, Kontur in Schiefertinte – byte-reproduzierbar.
import {clamp,mix} from './sdf.mjs';
import {rampColor,hex} from './materials.mjs';
import {precisionColor} from '../sprite-pipeline/precision-resample.mjs';

export const OUTLINE=hex('#293b44');
export const PX=4,PITCH=35;
const norm=(x,y,z)=>{const l=Math.hypot(x,y,z);return [x/l,y/l,z/l];};
const KEY=norm(-.55,.3,.78),FILL=norm(.65,.55,.25),SPEC_TINT=hex('#fff3d6');

/**
 * scene.solids: [{f(x,y,z)→Abstand, mat, tex?(x,y,z)→[u,v,w], glow?:Zahl|fn(u,v,w), group?, layer?, b?:[cx,cy,cz,r]}]
 * scene.lights: [{p:[x,y,z], r, k, color}] – warme Punktlichter (Ofenglut, Lampen) zusätzlich zum Hauptlicht.
 * Bildausschnitt in Bildschirm-E: x0 (links), y0 (oben); width/height in Pixeln.
 */
// Wählbare Malstufen (Figuren): oversample = in n-facher Auflösung rendern und flächengemittelt verkleinern (feine Details bleiben
// als Mischfarbe erhalten), rim = kühles Kantenlicht von hinten rechts, bands = Helligkeit zu gemalten Stufen ziehen (0 = aus).
// Materialien mit `bump(u,v,w)` (Höhe in E, Stärke `bumpScale`) kippen die Normale: Falten, Strick, Nähte, Poren.
const RIM=norm(.55,-.6,.45),RIM_TINT=hex('#c9d8ee');
export function renderScene(scene,opts={}){
 const {width,height,x0,y0,px=PX,pitch=PITCH,view='oblique',ss=2,outline=true,inner=true,palette=true,zTop=140,shadows=true,oversample=1,rim=0,bands=0}=opts;
 if(oversample>1){const o=oversample,hi=renderScene(scene,{...opts,width:width*o,height:height*o,px:px*o,oversample:1,outline:false,palette:false});
  const N=width*height,rgba=new Uint8Array(N*4),ids=new Int16Array(N).fill(-1),depth=new Float32Array(N).fill(-1e9);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){let r=0,g=0,b=0,n=0,id=-1,dp=-1e9;
   for(let dy=0;dy<o;dy++)for(let dx=0;dx<o;dx++){const j=(y*o+dy)*width*o+x*o+dx;if(!hi.data[j*4+3])continue;r+=hi.data[j*4];g+=hi.data[j*4+1];b+=hi.data[j*4+2];n++;if(hi.depth[j]>dp){dp=hi.depth[j];id=hi.ids[j];}}
   if(n*2<o*o)continue;const i=y*width+x;ids[i]=id;depth[i]=dp;rgba.set([r/n,g/n,b/n,255],i*4);}
  return finish(rgba,ids,depth,width,height,{palette,outline});}
 const S=scene.solids,L=scene.lights||[],T=Math.tan(pitch*Math.PI/180),C=Math.cos(pitch*Math.PI/180),Sn=Math.sin(pitch*Math.PI/180);
 // Ansichten: 'oblique' (Standard), 'top' (senkrecht, Bildschirm-y = y) und 'front' (waagerecht von Süden, Bildschirm-y = −z; Wandfronten).
 const dir=view==='top'?[0,0,-1]:view==='front'?[0,-1,0]:[0,-C,-Sn],V=[-dir[0],-dir[1],-dir[2]],H=norm(KEY[0]+V[0],KEY[1]+V[1],KEY[2]+V[2]);
 let hitId=-1;
 const dist=(x,y,z)=>{let best=1e9,id=-1;for(let i=0;i<S.length;i++){const s=S[i];let d;
   if(s.b){const bd=Math.hypot(x-s.b[0],y-s.b[1],z-s.b[2])-s.b[3];if(bd>=best)continue;d=bd>1.5?bd:s.f(x,y,z);}else d=s.f(x,y,z);
   if(d<best){best=d;id=i;}}hitId=id;return best;};
 const tMax=view==='front'?zTop:(zTop+4)/(view==='top'?1:Sn);
 function cast(sx,sy){let x=sx,y=view==='top'?sy:view==='front'?zTop/2:(sy+zTop)/T,z=view==='front'?-sy:zTop,t=0;
  for(let i=0;i<320&&t<tMax;i++){const d=dist(x,y,z);if(d<.006)return {x,y,z,id:hitId};const st=Math.max(d*.85,.004);x+=dir[0]*st;y+=dir[1]*st;z+=dir[2]*st;t+=st;}
  return null;}
 function softShadow(x,y,z){let res=1,t=.08;for(let i=0;i<48&&t<45;i++){const h=dist(x+KEY[0]*t,y+KEY[1]*t,z+KEY[2]*t);if(h<.003)return 0;res=Math.min(res,9*h/t);t+=clamp(h,.06,2.5);}return clamp(res,0,1);}
 function shade(hit){const s=S[hit.id],m=s.mat,{x,y,z}=hit,e=.015,f=s.f;
  let nx=f(x+e,y,z)-f(x-e,y,z),ny=f(x,y+e,z)-f(x,y-e,z),nz=f(x,y,z+e)-f(x,y,z-e);const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
  const [u,v,w]=s.tex?s.tex(x,y,z):[x,y,z];
  if(m.bump){const hb=(X,Y,Z)=>{const t=s.tex?s.tex(X,Y,Z):[X,Y,Z];return m.bump(t[0],t[1],t[2]);},eb=.04,k=(m.bumpScale??1)/(2*eb);
   let gx=(hb(x+eb,y,z)-hb(x-eb,y,z))*k,gy=(hb(x,y+eb,z)-hb(x,y-eb,z))*k,gz=(hb(x,y,z+eb)-hb(x,y,z-eb))*k;const gn=gx*nx+gy*ny+gz*nz;gx-=gn*nx;gy-=gn*ny;gz-=gn*nz;
   nx-=gx;ny-=gy;nz-=gz;const l2=Math.hypot(nx,ny,nz)||1;nx/=l2;ny/=l2;nz/=l2;}
  if(m.emissive){const g=typeof s.glow==='function'?s.glow(u,v,w):(s.glow??.8);return rampColor(m.ramp,g);}
  let ao=1;for(let i=1;i<=4;i++){const h=.45*i;ao-=(h-dist(x+nx*h,y+ny*h,z+nz*h))*.34/i;}ao=clamp(ao,.35,1);
  const sh=shadows&&!s.noShadow?softShadow(x+nx*.05,y+ny*.05,z+nz*.05):1;
  const tx=m.tex(u,v,w,[nx,ny,nz])||{k:1},ramp=tx.ramp||m.ramp,spec=tx.spec??m.spec;
  const kd=Math.max(0,nx*KEY[0]+ny*KEY[1]+nz*KEY[2]),fd=Math.max(0,nx*FILL[0]+ny*FILL[1]+nz*FILL[2]);
  let val=(kd*.64*sh+fd*.12+.2*ao)*tx.k*(.7+.3*ao);
  if(bands)val=mix(val,Math.round(val*bands)/bands,.5);
  let col=rampColor(ramp,val);
  if(rim){const r=rim*Math.pow(1-Math.max(0,nx*V[0]+ny*V[1]+nz*V[2]),2.2)*Math.max(0,nx*RIM[0]+ny*RIM[1]+nz*RIM[2]);col=col.map((c,k)=>mix(c,RIM_TINT[k],clamp(r,0,.6)));}
  const sp=spec*Math.pow(Math.max(0,nx*H[0]+ny*H[1]+nz*H[2]),m.shine)*sh;
  let glowAdd=[0,0,0];for(const l of L){const lx=l.p[0]-x,ly=l.p[1]-y,lz=l.p[2]-z,d=Math.hypot(lx,ly,lz);if(d>=l.r)continue;
   const a=(1-d/l.r)**2*l.k*Math.max(0,(nx*lx+ny*ly+nz*lz)/d);glowAdd=glowAdd.map((c,k)=>c+l.color[k]*a);}
  if(m.glass){const fr=Math.pow(1-Math.max(0,nx*V[0]+ny*V[1]+nz*V[2]),3);col=col.map((c,k)=>mix(c,SPEC_TINT[k],fr*.35));}
  return col.map((c,k)=>clamp(mix(c,SPEC_TINT[k],clamp(sp,0,1))+glowAdd[k]*255*(.35+.65*c/255),0,255));}

 const N=width*height,rgba=new Uint8Array(N*4),ids=new Int16Array(N).fill(-1),depth=new Float32Array(N).fill(-1e9);
 for(let py=0;py<height;py++)for(let pxl=0;pxl<width;pxl++){let r=0,g=0,b=0,n=0,id=-1,dp=-1e9;
  for(let sy=0;sy<ss;sy++)for(let sx=0;sx<ss;sx++){const X=x0+(pxl+(sx+.5)/ss)/px,Y=y0+(py+(sy+.5)/ss)/px,hit=cast(X,Y);if(!hit)continue;
   const c=shade(hit);r+=c[0];g+=c[1];b+=c[2];n++;const d=hit.x*V[0]+hit.y*V[1]+hit.z*V[2];if(d>dp){dp=d;id=hit.id;}}
  if(n*2<ss*ss)continue;const i=py*width+pxl;ids[i]=id;depth[i]=dp;rgba.set([r/n,g/n,b/n,255],i*4);}
 // Innenlinien: der hintere von zwei Nachbarn mit deutlichem Tiefensprung (andere Gruppe) wird dunkel.
 if(inner){const dark=new Uint8Array(N);
  for(let i=0;i<N;i++){if(ids[i]<0)continue;const x=i%width;for(const j of [x>0?i-1:-1,x<width-1?i+1:-1,i-width,i+width]){if(j<0||j>=N||ids[j]<0)continue;
   const gi=S[ids[i]].group??ids[i],gj=S[ids[j]].group??ids[j];if(gi!==gj&&depth[j]-depth[i]>1.1){dark[i]=1;break;}}}
  for(let i=0;i<N;i++)if(dark[i])for(let k=0;k<3;k++)rgba[i*4+k]=mix(rgba[i*4+k],OUTLINE[k],.62);}
 return finish(rgba,ids,depth,width,height,{palette,outline});
}
/** Palette einrasten und äußere Kontur in Schiefertinte setzen. */
function finish(rgba,ids,depth,width,height,{palette,outline}){const N=width*height;
 if(palette)for(let i=0;i<N;i++)if(rgba[i*4+3])rgba.set(precisionColor([rgba[i*4],rgba[i*4+1],rgba[i*4+2]]),i*4);
 if(outline){const add=[];for(let i=0;i<N;i++){if(rgba[i*4+3])continue;const x=i%width;
   if((x>0&&rgba[(i-1)*4+3]&&ids[i-1]>=0)||(x<width-1&&rgba[(i+1)*4+3]&&ids[i+1]>=0)||(i>=width&&ids[i-width]>=0)||(i<N-width&&ids[i+width]>=0))add.push(i);}
  for(const i of add)rgba.set([...OUTLINE,255],i*4);}
 return {width,height,data:rgba,ids,depth};
}

/** Hüllkugeln für Körper ohne `b` auf einem groben Gitter messen (Figuren: viele Körper, meist weit weg vom Strahl).
 * Körper ohne Treffer im Gitter werden entfernt. Beschleunigt den Raycaster um ein Vielfaches. */
export function autoBounds(scene,{x=[-13,13],y=[-15,15],z=[-1,34]}={},step=1.2){
 const solids=[];for(const s of scene.solids){if(s.b){solids.push(s);continue;}
  let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
  for(let X=x[0];X<=x[1];X+=step)for(let Y=y[0];Y<=y[1];Y+=step)for(let Z=z[0];Z<=z[1];Z+=step)if(s.f(X,Y,Z)<step*.9){x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y);z0=Math.min(z0,Z);z1=Math.max(z1,Z);}
  if(x0===Infinity)continue;
  const c=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2];solids.push({...s,b:[...c,Math.hypot(x1-x0,y1-y0,z1-z0)/2+step*1.5]});}
 return {...scene,solids};}

/** Oberste leere Zeilen abschneiden (Unterkante = Anker bleibt fest). */
export function cropTop(img,keep=0){const {width,height,data}=img;let top=0;
 outer:for(;top<height;top++)for(let x=0;x<width;x++)if(data[(top*width+x)*4+3])break outer;
 top=Math.max(0,top-keep);if(!top)return {...img,cropped:0};
 return {width,height:height-top,data:data.slice(top*width*4),ids:img.ids?.slice(top*width),depth:img.depth?.slice(top*width),cropped:top};}
