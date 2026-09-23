// Sprite-Schmiede · Distanzfelder und Rauschen (Einheit: Welteinheit E, 14,4 E = 1 m).
// Achsen: x nach Osten (rechts), y nach Süden (zum Betrachter), z nach oben. Alle Funktionen sind rein und
// deterministisch (kein Math.random), damit jeder Export byte-gleich reproduzierbar bleibt.
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const mix=(a,b,t)=>a+(b-a)*t;
export const smoothstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

// ---------- Rauschen ----------
export function hash3(x,y,z){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,1440662683);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
export function noise3(x,y,z){
 const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const l=(a,b,t)=>a+(b-a)*t,h=(dx,dy,dz)=>hash3(xi+dx,yi+dy,zi+dz);
 return l(l(l(h(0,0,0),h(1,0,0),u),l(h(0,1,0),h(1,1,0),u),v),l(l(h(0,0,1),h(1,0,1),u),l(h(0,1,1),h(1,1,1),u),v),w);
}
/** Fraktales Rauschen 0..1, Oktaven gegeneinander gedreht (kein Rastermuster). */
export function fbm3(x,y,z,oct=4){let s=0,a=.5,n=0;for(let i=0;i<oct;i++){s+=a*noise3(x+i*17.3,y-i*9.1,z+i*3.7);n+=a;const nx=(x*.8-y*.6)*2.03,ny=(x*.6+y*.8)*2.03;x=nx;y=ny;z*=2.03;a*=.5;}return s/n;}

/** Kachelbares Rauschen: wiederholt sich in x alle `px`, in y alle `py` Gittereinheiten (ganzzahlig). */
export function noiseTile3(x,y,z,px,py){
 const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const m=(a,p)=>((a%p)+p)%p,l=(a,b,t)=>a+(b-a)*t,h=(dx,dy,dz)=>hash3(m(xi+dx,px),m(yi+dy,py),zi+dz);
 return l(l(l(h(0,0,0),h(1,0,0),u),l(h(0,1,0),h(1,1,0),u),v),l(l(h(0,0,1),h(1,0,1),u),l(h(0,1,1),h(1,1,1),u),v),w);
}
/** Kachelbares fbm für Beläge und Wandstreifen: Periode `period` E in x und y, Grundfrequenz `cells` Gitterzellen je Periode. */
export function fbmTile3(x,y,z,period,cells=8,oct=4){let s=0,a=.5,n=0,c=cells;
 for(let i=0;i<oct;i++){const k=c/period;s+=a*noiseTile3(x*k+i*31,y*k-i*17,z*k,c,c);n+=a;c*=2;a*=.5;}return s/n;}

// ---------- Primitive: f(x,y,z) → Abstand ----------
export const sphere=r=>(x,y,z)=>Math.hypot(x,y,z)-r;
/** Quader mit Halbmaßen und optional gerundeten Kanten (r). */
export const box=(hx,hy,hz,r=0)=>(x,y,z)=>{const qx=Math.abs(x)-hx+r,qy=Math.abs(y)-hy+r,qz=Math.abs(z)-hz+r;
 return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r;};
/** Quader von z0 bis z1, Mitte bei (0,0) – bequemer für Möbel, die auf dem Boden stehen. */
export const block=(hx,hy,z0,z1,r=0)=>at(0,0,(z0+z1)/2,box(hx,hy,(z1-z0)/2,r));
/** Senkrechter Zylinder von z0 bis z1 mit optional gerundeter Kante. */
export const cylZ=(rad,z0,z1,r=0)=>(x,y,z)=>{const dx=Math.hypot(x,y)-rad+r,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+r;
 return Math.min(Math.max(dx,dz),0)+Math.hypot(Math.max(dx,0),Math.max(dz,0))-r;};
export const capsule=(a,b,r)=>(x,y,z)=>{const pax=x-a[0],pay=y-a[1],paz=z-a[2],bax=b[0]-a[0],bay=b[1]-a[1],baz=b[2]-a[2];
 const h=clamp((pax*bax+pay*bay+paz*baz)/(bax*bax+bay*bay+baz*baz||1),0,1);return Math.hypot(pax-bax*h,pay-bay*h,paz-baz*h)-r;};
/** Kegelstumpf mit runden Enden (Gliedmaßen): Radius ra bei a, rb bei b. */
export const roundCone=(a,b,ra,rb)=>(x,y,z)=>{const bax=b[0]-a[0],bay=b[1]-a[1],baz=b[2]-a[2],l2=bax*bax+bay*bay+baz*baz,pax=x-a[0],pay=y-a[1],paz=z-a[2];
 const h=clamp((pax*bax+pay*bay+paz*baz)/(l2||1),0,1);return Math.hypot(pax-bax*h,pay-bay*h,paz-baz*h)-mix(ra,rb,h);};
/** Ellipsoid (Näherung nach Quilez, gut genug für Köpfe, Kissen, Bäuche). */
export const ellipsoid=(rx,ry,rz)=>(x,y,z)=>{const k0=Math.hypot(x/rx,y/ry,z/rz),k1=Math.hypot(x/(rx*rx),y/(ry*ry),z/(rz*rz));return k0<1e-9?-Math.min(rx,ry,rz):k0*(k0-1)/k1;};
/** Liegender Ring um die z-Achse (Radius R, Materialstärke r). */
export const torusZ=(R,r)=>(x,y,z)=>Math.hypot(Math.hypot(x,y)-R,z)-r;
/** Ebenes Prisma aus einem 2D-Umriss (Polygon in x/z, Tiefe in y) – für Schilder, Rahmen, Zaunlatten. */
export function extrudeXZ(poly,hy,r=0){return (x,y,z)=>{const d2=polyDist(poly,x,z),dy=Math.abs(y)-hy+r;return Math.min(Math.max(d2+r,dy),0)+Math.hypot(Math.max(d2+r,0),Math.max(dy,0))-r;};}
export function polyDist(poly,px,py){let d=Infinity,s=1;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[j],[bx,by]=poly[i],ex=bx-ax,ey=by-ay,wx=px-ax,wy=py-ay,h=clamp((wx*ex+wy*ey)/(ex*ex+ey*ey),0,1);
 d=Math.min(d,Math.hypot(wx-ex*h,wy-ey*h));if((ay>py)!==(by>py)&&px<(bx-ax)*(py-ay)/(by-ay)+ax)s=-s;}return s*d;}

// ---------- Transformationen (wirken auf den Abfragepunkt, also invers) ----------
export const at=(ox,oy,oz,f)=>(x,y,z)=>f(x-ox,y-oy,z-oz);
export const rotZ=(a,f)=>{const c=Math.cos(a),s=Math.sin(a);return (x,y,z)=>f(c*x+s*y,-s*x+c*y,z);};
export const rotX=(a,f)=>{const c=Math.cos(a),s=Math.sin(a);return (x,y,z)=>f(x,c*y+s*z,-s*y+c*z);};
export const rotY=(a,f)=>{const c=Math.cos(a),s=Math.sin(a);return (x,y,z)=>f(c*x-s*z,y,s*x+c*z);};
export const scale=(k,f)=>(x,y,z)=>f(x/k,y/k,z/k)*k;
export const mirrorX=f=>(x,y,z)=>f(Math.abs(x),y,z);
export const mirrorY=f=>(x,y,z)=>f(x,Math.abs(y),z);

// ---------- Verknüpfungen ----------
export const union=(...fs)=>(x,y,z)=>{let d=Infinity;for(const f of fs){const v=f(x,y,z);if(v<d)d=v;}return d;};
export const smoothUnion=(k,...fs)=>(x,y,z)=>{let d=fs[0](x,y,z);for(let i=1;i<fs.length;i++){const b=fs[i](x,y,z),h=clamp(.5+.5*(b-d)/k,0,1);d=mix(b,d,h)-k*h*(1-h);}return d;};
export const subtract=(a,...bs)=>(x,y,z)=>{let d=a(x,y,z);for(const b of bs)d=Math.max(d,-b(x,y,z));return d;};
export const intersect=(...fs)=>(x,y,z)=>{let d=-Infinity;for(const f of fs){const v=f(x,y,z);if(v>d)d=v;}return d;};
export const shell=(t,f)=>(x,y,z)=>Math.abs(f(x,y,z))-t;
export const inflate=(r,f)=>(x,y,z)=>f(x,y,z)-r;
/** Wiederholung entlang x (Latten, Dielen, Sprossen) – n Kopien im Abstand step, mittig. */
export const repeatX=(step,n,f)=>(x,y,z)=>{const i=clamp(Math.round(x/step+(n-1)/2),0,n-1);return f(x-(i-(n-1)/2)*step,y,z);};
export const repeatY=(step,n,f)=>(x,y,z)=>{const i=clamp(Math.round(y/step+(n-1)/2),0,n-1);return f(x,y-(i-(n-1)/2)*step,z);};
