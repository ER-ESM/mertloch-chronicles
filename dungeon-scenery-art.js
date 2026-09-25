// Zeichnung der Dungeon-Räume als Orte (docs/DUNGEON-RAEUME-2026-09-25.md): Masse um den Grundriss (Mauerwerk, Erdreich, Basalt),
// Beläge aus dem Sprite-Baukasten, Wandfronten mit Wandschmuck, Mauerkronen, Bodendeko – je Ebene EINMAL in eine eigene Leinwand
// gebacken (nur bei Ebenenwechsel, neu entdecktem Raum oder anderer Dichte neu). Je Bild kostet der Boden danach eine Kopie des
// Ausschnitts (E-46 bis E-50: kein Neuzeichnen je Bild, keine Blend-Modi). Stehende Requisiten laufen tiefensortiert mit den Figuren
// (renderer.js „dungeonProp“), Lichterketten hängen über allem (drawDungeonCeiling). Draußen: die Doppelgarage als Gebäude-Sprite.
import {DUNGEON_SCALE as U} from './content/index.js';
import {dungeonRun} from './dungeon.js';
import {floorPlan,hiddenRooms,heroFloor,sceneryOf,garageLot,CELL,FACE,CROWN} from './dungeon-scenery.js';
import {drawBelag,drawDecal,drawWallDecor,drawKitItem,kitReady,kitFrames} from './kit-art.js';
import {bakedGrade,withGrade} from './art-quality.js';
import {LIGHT} from './light-convention.js';
import {LIGHTING} from './content/index.js';

const INK='#1b1612';
// ── Kleinwerkzeug ──────────────────────────────────────────────────────────────────────────────────────────────
const hash=(x,y,s=0)=>{let h=Math.imul((x|0)+0x9e37,374761393)^Math.imul((y|0)+0x85eb,668265263)^Math.imul((s|0)+7,2147483629);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const rgb=([r,g,b])=>'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
const tone=(c,k)=>rgb(hex(c).map(v=>Math.max(0,Math.min(255,v*k))));
const mixc=(a,b,t)=>{const A=hex(a),B=hex(b);return rgb(A.map((v,i)=>v+(B[i]-v)*t));};
const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
/** Periodisches Wertrauschen 0..1 (Periode p Zellen). */
function vnoise(x,y,p,s){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,m=v=>((v%p)+p)%p,sm=t=>t*t*(3-2*t);
 const a=hash(m(xi),m(yi),s),b=hash(m(xi+1),m(yi),s),c=hash(m(xi),m(yi+1),s),d=hash(m(xi+1),m(yi+1),s),u=sm(fx),v=sm(fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}

// ── Masse um den Grundriss: Kachel 64 E, nahtlos, je Ebene und Dichte einmal ─────────────────────────────────────
const T=64,massTiles=new Map();
const MASS={
 // Mauerwerk (Erdgeschoss): Kalksandstein-Blöcke von oben, dunkel, Fugen, Körnung
 mauerwerk:(wx,wy)=>{const row=Math.floor(wy/12),off=row%2?12:0,bx=Math.floor((wx+off)/24),lx=(wx+off)-bx*24,ly=wy-row*12,j=lx<.8||ly<.8;
  if(j)return [30,29,27];const k=.9+.14*hash(bx&7,row&7,3)+.1*(vnoise(wx/4,wy/4,16,5)-.5),stain=vnoise(wx/8,wy/8,8,6)>.68?.86:1,edge=(lx<1.6||ly<1.6)?1.06:(lx>22.6||ly>10.6)?.9:1;return [54*k*edge*stain,52*k*edge*stain,48*k*edge*stain];},
 // Erdreich (Keller 1): Lehm mit Steinen und Wurzeln
 erdreich:(wx,wy)=>{const n=vnoise(wx/8,wy/8,8,11)*.6+vnoise(wx/2,wy/2,32,12)*.4,base=[64,47,34].map(v=>v*(.8+.4*n));
  const cx=Math.floor(wx/8),cy=Math.floor(wy/8),px=(cx+.25+.5*hash(cx&7,cy&7,21))*8,py=(cy+.25+.5*hash(cx&7,cy&7,22))*8,r=1.1+1.8*hash(cx&7,cy&7,23),d=Math.hypot(wx-px,(wy-py)*1.3);
  if(hash(cx&7,cy&7,24)>.55&&d<r)return d<r*.45&&wy<py?[128,114,96]:[94,83,70];
  const root=Math.abs(Math.sin(wx*Math.PI/16+vnoise(wx/8,wy/8,8,31)*6)*10-((wy%32)-16));if(root<.8&&vnoise(wx/16,wy/16,4,33)>.55)return [36,25,17];
  return base;},
 // Basalt (Keller 2): Säulenköpfe als unregelmäßige Vielecke, dunkle Fugen, Lichtkante oben links
 basalt:(wx,wy)=>{const n=7,c=T/n,ci=Math.floor(wx/c),cj=Math.floor(wy/c);let b1=1e9,b2=1e9,id=0,p1=null;
  for(let di=-2;di<=2;di++)for(let dj=-2;dj<=2;dj++){const i=ci+di,j=cj+dj,ii=((i%n)+n)%n,jj=((j%n)+n)%n,px=(i+.2+.6*hash(ii,jj,41))*c,py=(j+.2+.6*hash(ii,jj,42))*c,d=Math.hypot(wx-px,wy-py);
   if(d<b1){b2=b1;b1=d;id=hash(ii,jj,43);p1=[px,py];}else if(d<b2)b2=d;}
  const edge=(b2-b1)/2;if(edge<.55)return [18,20,23];const k=.78+.3*id+.06*(vnoise(wx,wy,64,44)-.5),lit=(wx-p1[0])+(wy-p1[1])<-c*.25&&edge<1.6?1.18:edge<1.2?.86:1;
  return [44*k*lit,49*k*lit,56*k*lit];}
};
function massTile(kind,d){const key=kind+'@'+d;let t=massTiles.get(key);if(t)return t;const N=Math.round(T*d),cv=document.createElement('canvas');cv.width=cv.height=N;
 const x=cv.getContext('2d'),img=x.createImageData(N,N),f=MASS[kind]||MASS.mauerwerk;
 for(let v=0;v<N;v++)for(let u=0;u<N;u++){const [r,g,b]=f((u+.5)/d,(v+.5)/d),i=(v*N+u)*4;img.data[i]=r;img.data[i+1]=g;img.data[i+2]=b;img.data[i+3]=255;}
 x.putImageData(img,0,0);massTiles.set(key,cv);return cv;}
const massPatterns=new Map();
function massPattern(c,kind,d,origin){const key=kind+'@'+d;let p=massPatterns.get(key);if(!p){p=c.createPattern(massTile(kind,d),'repeat');massPatterns.set(key,p);}if(p?.setTransform&&typeof DOMMatrix!=='undefined')p.setTransform(new DOMMatrix([1/d,0,0,1/d,origin.x,origin.y]));return p;}

// ── Wandfronten: Maler je Stil, in Weltkoordinaten (Muster laufen über Abschnittsgrenzen durch) ─────────────────
/** Mauerwerk-Verband: Steine bw×bh, Fuge j, Farbe je Stein leicht gestreut. */
function bond(c,x0,x1,y0,y1,{bw=12,bh=6,j=.7,base,mortar,vary=.12,seed=0,ox=0,irregular=false}){
 fill(c,mortar,x0,y0,x1-x0,y1-y0);
 for(let y=y1,row=0;y>y0-bh;y-=bh,row++){const off=row%2?bw/2:0;for(let x=Math.floor((x0-ox-off)/bw)*bw+ox+off;x<x1;x+=bw){const w=irregular?bw*(.7+.5*hash(Math.round(x),row,seed+9)):bw;
   const k=1-vary/2+vary*hash(Math.round(x),Math.round(y),seed);fill(c,tone(base,k),x+j/2,y-bh+j/2,w-j,bh-j);fill(c,tone(base,k*1.12),x+j/2,y-bh+j/2,w-j,.6);}}}
const stripes=(c,x0,x1,y0,y1,w,a,b,ox=0)=>{for(let x=Math.floor((x0-ox)/w)*w+ox;x<x1;x+=w)fill(c,Math.floor((x-ox)/w)%2?a:b,x,y0,w,y1-y0);};
const FACES={
 garage:(c,x0,x1,top,base,o)=>{bond(c,x0,x1,top,base,{bw:12,bh:6,base:'#b2ada1',mortar:'#8a857a',seed:1,ox:o.x});fill(c,'#6d6960',x0,base-3.5,x1-x0,3.5);fill(c,'#8a867c',x0,base-3.5,x1-x0,.6);},
 treppenhaus:(c,x0,x1,top,base,o)=>{fill(c,'#cdbf9c',x0,top,x1-x0,base-top);for(let x=Math.floor((x0-o.x)/3)*3+o.x;x<x1;x+=3)if(hash(Math.round(x),1,2)>.6)fill(c,'#c2b38f',x,top,1,base-top);
  const y=base-10;for(let x=Math.floor((x0-o.x)/4)*4+o.x;x<x1;x+=4)for(let yy=y;yy<base;yy+=4)fill(c,hash(Math.round(x),Math.round(yy),3)>.5?'#8f5a34':'#7c4b2a',x+.3,yy+.3,3.4,3.4);fill(c,'#5c3a22',x0,y-1,x1-x0,1);},
 buero:(c,x0,x1,top,base,o)=>{fill(c,'#d8d2c2',x0,top,x1-x0,base-top);for(let x=Math.floor(x0);x<x1;x+=1.5)for(let y=top;y<base;y+=1.5)if(hash(Math.round(x*2),Math.round(y*2),4)>.82)fill(c,'#c9c2b0',x,y,.8,.8);fill(c,'#7d7c78',x0,base-2,x1-x0,2);},
 bruestung:(c,x0,x1,top,base,o)=>{fill(c,'#9b968b',x0,top,x1-x0,base-top);for(let x=Math.floor((x0-o.x)/24)*24+o.x;x<x1;x+=24)fill(c,'#7f7b71',x,top,.7,base-top);fill(c,'#bfbab0',x0,base-12,x1-x0,1);},
 damast:(c,x0,x1,top,base,o)=>{fill(c,'#5a2629',x0,top,x1-x0,base-top);c.fillStyle='#7a3a36';for(let y=top+2,row=0;y<base-9;y+=5,row++)for(let x=Math.floor((x0-o.x)/6)*6+o.x+(row%2?3:0);x<x1;x+=6){c.fillRect(x+1,y,1,1);c.fillRect(x,y+1,3,1);c.fillRect(x+1,y+2,1,1);}
  fill(c,'#c8a040',x0,top+3,x1-x0,.8);const p=base-8;fill(c,'#4a2e1c',x0,p,x1-x0,8);for(let x=Math.floor((x0-o.x)/7)*7+o.x;x<x1;x+=7){fill(c,'#5b3a24',x+1,p+1.5,5,5);fill(c,'#3a2416',x+6,p+1,1,6);}fill(c,'#6d4a2e',x0,p-1,x1-x0,1);},
 party:(c,x0,x1,top,base,o)=>{stripes(c,x0,x1,top,base,4,'#d8b36a','#c99a52',o.x);fill(c,'#f1ece0',x0,top,x1-x0,3);fill(c,'#d8d0bc',x0,top+3,x1-x0,1);const p=base-7;fill(c,'#6b4a2f',x0,p,x1-x0,7);for(let x=Math.floor((x0-o.x)/5)*5+o.x;x<x1;x+=5)fill(c,'#4e3522',x,p,.7,7);fill(c,'#8a6443',x0,p,x1-x0,.8);},
 ziegel:(c,x0,x1,top,base,o)=>bond(c,x0,x1,top,base,{bw:8,bh:4,j:.6,base:'#8e4c34',mortar:'#b8a88c',vary:.22,seed:5,ox:o.x}),
 waschkueche:(c,x0,x1,top,base,o)=>{fill(c,'#a9ada7',x0,top,x1-x0,base-top);const y=base-12;fill(c,'#dfe2dc',x0,y,x1-x0,12);c.fillStyle='#b9bdb6';for(let yy=y;yy<base;yy+=4)c.fillRect(x0,yy,x1-x0,.5);for(let x=Math.floor((x0-o.x)/4)*4+o.x;x<x1;x+=4)c.fillRect(x,y,.5,12);fill(c,'#6e8a86',x0,y-.8,x1-x0,.8);},
 studio:(c,x0,x1,top,base)=>{fill(c,'#e6e3db',x0,top,x1-x0,base-top);fill(c,'#26242a',x0,base-2,x1-x0,2);},
 muster:(c,x0,x1,top,base,o)=>{stripes(c,x0,x1,top,base,5,'#d9c9b2','#ccb9a0',o.x);fill(c,'#f2eee6',x0,base-2.5,x1-x0,2.5);},
 basalt:(c,x0,x1,top,base,o)=>bond(c,x0,x1,top,base,{bw:11,bh:5.5,j:.8,base:'#434950',mortar:'#1e2226',vary:.3,seed:7,ox:o.x,irregular:true}),
 'basalt-feucht':(c,x0,x1,top,base,o)=>{FACES.basalt(c,x0,x1,top,base,o);for(let x=Math.floor(x0);x<x1;x+=2){const h=hash(Math.round(x),9,8);if(h>.8)fill(c,'#23292d',x,top+2+h*6,1,6+h*9);if(h<.25)fill(c,'#4d6a3f',x,base-2-h*6,1.4,1.4);}},
 pappe:(c,x0,x1,top,base,o)=>{FACES.basalt(c,x0,x1,top,base,o);
  // Pappverkleidung: bemalte Bahnen („Burgmauer“), Klebeband, eine Ecke abgerissen – darunter der echte Basalt
  for(let x=Math.floor((x0-o.x)/20)*20+o.x;x<x1;x+=20){const h=hash(Math.round(x),3,9),y0=top+2+h*3,y1=base-3-h*2,gap=h>.72;if(gap)continue;
   fill(c,'#b39668',x+.5,y0,19,y1-y0);c.fillStyle='#9a7d55';for(let y=y1,row=0;y>y0+2;y-=4,row++){c.fillRect(x+.5,y-.5,19,.5);for(let xx=x+.5+(row%2?5:0);xx<x+19;xx+=10)c.fillRect(xx,y-4,.5,4);}
   fill(c,'#e8e0c4',x+2,y0+1,5,1.2);fill(c,'#e8e0c4',x+13,y1-3,5,1.2);if(h<.3){c.fillStyle='#434950';c.beginPath();c.moveTo(x+19.5,y0);c.lineTo(x+13,y0);c.lineTo(x+19.5,y0+6);c.fill();}}},
 beton:(c,x0,x1,top,base,o)=>{fill(c,'#8f8b82',x0,top,x1-x0,base-top);for(let x=Math.floor((x0-o.x)/16)*16+o.x;x<x1;x+=16)fill(c,'#7e7a72',x,top,.6,base-top);for(let y=base-6;y>top;y-=6)fill(c,'#848078',x0,y,x1-x0,.5);}
};
/** Wandfront eines Abschnitts: Stil als volle 22-E-Wand gemalt, auf die sichtbare Höhe F beschnitten (geschnittene Innenwand zeigt
 *  nur ihren Fuß), darüber Schatten unter der Krone, unten die Fußleiste. */
function paintFace(c,style,x0,x1,base,F,o){if(F<=0)return;c.save();c.beginPath();c.rect(x0,base-F,x1-x0,F);c.clip();
 (FACES[style]||FACES.beton)(c,x0,x1,base-FACE,base,o);
 if(typeof c.createLinearGradient==='function'){const g=c.createLinearGradient(0,base-F,0,base-F+Math.min(8,F));g.addColorStop(0,'rgba(12,8,6,.55)');g.addColorStop(1,'rgba(12,8,6,0)');c.fillStyle=g;c.fillRect(x0,base-F,x1-x0,Math.min(8,F));}
 fill(c,'rgba(12,8,6,.35)',x0,base-1,x1-x0,1);c.restore();}

// ── Leinwand je Ebene ──────────────────────────────────────────────────────────────────────────────────────────
const layers=new Map();export const sceneryStats={builds:0,lastBuildMs:0,blits:0,layerPx:0,key:''};
function plantIds(plan){return [...new Set([...plan.rooms.map(r=>sceneryOf(plan.def)?.rooms[r.id]?.belag).filter(Boolean),...plan.items.decals.map(i=>i.sprite),...plan.items.decor.map(i=>i.sprite),...plan.items.standing.map(i=>i.sprite),...plan.items.tops.map(i=>i.sprite)])];}
/** Ebene backen: Masse, Böden, Türflächen, Schatten am Wandfuß, eingebaute Zeichnung, Bodendeko, Wandfronten mit Wandschmuck, Kronen. */
export function buildLayer(plan,d){
 const t0=performance.now(),sc=sceneryOf(plan.def),fl=sc.floors[plan.floor]||{},o=plan.def.floors[plan.floor].origin,W=plan.bx1-plan.bx0,H=plan.by1-plan.by0;
 const cv=document.createElement('canvas');cv.width=Math.ceil(W*d);cv.height=Math.ceil(H*d);const c=cv.getContext('2d',{alpha:false});
 c.setTransform(d,0,0,d,-plan.bx0*d,-plan.by0*d);c.imageSmoothingEnabled=false;
 const complete=kitReady(plantIds(plan));
 c.fillStyle=massPattern(c,fl.mass,d,o)||'#2a2622';c.fillRect(plan.bx0,plan.by0,W,H);
 // Böden: erst die Türflächen (Belag des Nachbarraums), dann die Räume darüber
 const roomCfg=id=>sc.rooms[id]||{};
 for(const dr of plan.doors){const b=roomCfg(dr.room).belag;if(b)drawBelag(c,{belag:b,rects:[{x:dr.x,y:dr.y,w:dr.w,h:dr.h}]},o);}
 for(const room of plan.rooms){const b=roomCfg(room.id).belag||'estrich';drawBelag(c,{belag:b,rects:plan.rects.filter(r=>r.room===room.id)},o);}
 floorShade(c,plan);
 for(const room of plan.rooms)for(const kind of roomCfg(room.id).lines||[])LINES[kind]?.(c,plan,room,o);
 for(const it of plan.items.decals)drawDecal(c,it);
 // Wandfronten, darauf der Wandschmuck (Bildfolgen zeichnet drawSceneryGround je Bild)
 for(const s of plan.segments)paintFace(c,roomCfg(s.room).wall||'beton',s.x0,s.x1,s.base,s.F,o);
 faceCorners(c,plan);
 for(const room of plan.rooms)for(const kind of roomCfg(room.id).lines||[])LINES_FACE[kind]?.(c,plan,room,o);
 for(const it of plan.items.decor)if(kitFrames(it.sprite)<=1)drawWallDecor(c,it,it.wall);
 paintCrowns(c,plan,fl.crown||'#8e897d');
 if(plan.floor==='e0')pappzinnen(c,plan);
 sceneryStats.builds++;sceneryStats.lastBuildMs=+(performance.now()-t0).toFixed(1);sceneryStats.layerPx=cv.width*cv.height;
 return {canvas:cv,d,bx0:plan.bx0,by0:plan.by0,W,H,complete,mass:fl.mass,origin:o};
}
/** Schatten am Wandfuß: Nordkanten tief (unter der Front), Seiten schmal, Südkanten nur ein Hauch – der Boden bekommt Tiefe. */
function floorShade(c,plan){if(typeof c.createLinearGradient!=='function')return;const ink='22,15,10';
 const band=(x,y,w,h,gx0,gy0,gx1,gy1,a)=>{const g=c.createLinearGradient(gx0,gy0,gx1,gy1);g.addColorStop(0,`rgba(${ink},${a})`);g.addColorStop(.5,`rgba(${ink},${a*.35})`);g.addColorStop(1,`rgba(${ink},0)`);c.fillStyle=g;c.fillRect(x,y,w,h);};
 for(const s of plan.segments)band(s.x0,s.base,s.x1-s.x0,14,0,s.base,0,s.base+14,.42);
 for(const e of plan.edges.west)band(e.x,e.y0,7,e.y1-e.y0,e.x,0,e.x+7,0,.34);
 for(const e of plan.edges.east)band(e.x-7,e.y0,7,e.y1-e.y0,e.x,0,e.x-7,0,.34);
 for(const e of plan.edges.south)band(e.x0,e.y-4,e.x1-e.x0,4,0,e.y,0,e.y-4,.22);}
/** Senkrechte Kanten der Fronten (Ecken, Türlaibungen): dunkle Linie, damit die Front als Körper steht. */
function faceCorners(c,plan){const {cols,faceH,bx0,by0}=plan;
 for(const s of plan.segments){if(s.F<=0)continue;const y=s.base-s.F,jl=s.i0-1,jr=s.i1,row=s.j-1,edge=i=>i<0||i>=cols||!faceH[row*cols+i];
  if(edge(jl))fill(c,'rgba(20,14,10,.55)',s.x0,y,.8,s.F);if(edge(jr))fill(c,'rgba(20,14,10,.4)',s.x1-.8,y,.8,s.F);}}
/** Mauerkronen: Deckfläche mit Körnung, Lichtkante zum Raum hin, Tintenkante zur Masse. */
function paintCrowns(c,plan,color){const {cols,rows,crown,walk,faceH,bx0,by0}=plan,K=CELL;
 for(let j=0;j<rows;j++){let s=-1;for(let i=0;i<=cols;i++){const on=i<cols&&crown[j*cols+i];if(on&&s<0)s=i;if(!on&&s>=0){fill(c,color,bx0+s*K,by0+j*K,(i-s)*K,K);s=-1;}}}
 const lite=tone(color,1.22),dark=tone(color,.8);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*cols+i;if(!crown[k])continue;const x=bx0+i*K,y=by0+j*K,h=hash(i,j,61);
  if(h>.7)fill(c,h>.88?lite:dark,x+h*1.2,y+(1-h)*1.2,.8,.6);
  const at=(di,dj)=>{const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=cols||jj>=rows)return 'mass';const q=jj*cols+ii;return walk[q]?'walk':faceH[q]?'face':crown[q]?'crown':'mass';};
  const n=at(0,-1),s=at(0,1),w=at(-1,0),e=at(1,0);
  if(n==='mass')fill(c,INK,x,y,K,.8);if(w==='mass')fill(c,INK,x,y,.8,K);if(e==='mass')fill(c,INK,x+K-.8,y,.8,K);if(s==='mass')fill(c,INK,x,y+K-.8,K,.8);
  if(s==='face'||s==='walk')fill(c,lite,x,y+K-.7,K,.7);if(n==='walk')fill(c,lite,x,y,K,.7);if(w==='walk')fill(c,lite,x,y,.7,K);if(e==='walk')fill(c,dark,x+K-.7,y,.7,K);}}
/** Pappzinnen auf der Garagenwand über dem Schlosshof (Wellpappe, Klebeband, eine Zacke abgeknickt). */
function pappzinnen(c,plan){const seg=plan.segments.filter(s=>s.room==='hof'&&s.F>=FACE).sort((a,b)=>(b.x1-b.x0)-(a.x1-a.x0))[0];if(!seg)return;
 const y1=seg.base-seg.F-CROWN+1.5;let k=0;for(let x=seg.x0+5;x+10<=seg.x1-3;x+=22,k++){const bent=k===3;c.save();c.translate(x+5,y1);if(bent)c.rotate(-.35);
  fill(c,INK,-5.6,-12.6,11.2,12.6);fill(c,'#b69a6c',-5,-12,10,12);fill(c,'#8a7250',-5,-2.2,10,2.2);fill(c,'#c9ae80',-5,-12,10,1);
  c.fillStyle='#9c8157';for(let yy=-10;yy<-2;yy+=2)c.fillRect(-5,yy,10,.4);fill(c,'#e6e0c8',-4,-8,3.2,1.2);if(k%2)fill(c,'#e6e0c8',1.5,-5,3,1.2);c.restore();}}
// Eingebaute Zeichnung am Boden (vor der Bodendeko) und an der Front
const LINES={
 // Stellplätze der Doppelgarage: gelbe, abgetretene Linien
 stellplatz:(c,plan,room,o)=>{const r=plan.rects.find(q=>q.room===room.id);if(!r)return;const mid=r.x+r.w/2,y0=r.y+6*U,y1=r.y+r.h-1.2*U;
  for(const x of [mid,r.x+1.5*U,r.x+r.w-1.5*U]){for(let y=y0;y<y1;y+=3)if(hash(Math.round(x),Math.round(y),71)>.12)fill(c,'rgba(216,180,64,.78)',x-.7,y,1.4,3);}
  for(let x=r.x+1.5*U;x<r.x+r.w-1.5*U;x+=3)if(hash(Math.round(x),5,72)>.2)fill(c,'rgba(216,180,64,.7)',x,y0-.7,3,1.4);},
 // Kelterhalle: drei Steinrinnen für Fässer quer durch das Gewölbe
 rinnen:(c,plan,room)=>{const r=plan.rects.find(q=>q.room===room.id);if(!r)return;for(const f of [.26,.52,.78]){const y=r.y+r.h*f;fill(c,'#23272b',r.x+5,y-2.5,r.w-10,5);fill(c,'#5d646c',r.x+5,y-3.2,r.w-10,.8);fill(c,'#171a1d',r.x+5,y-1.7,r.w-10,1);fill(c,'rgba(120,30,40,.45)',r.x+8,y-.7,r.w-16,1.4);}}
};
const LINES_FACE={
 // Weinkeller: Sprinklerrohr unter der Decke, alle 40 E ein Sprinklerkopf
 sprinkler:(c,plan,room)=>{for(const s of plan.segments.filter(s=>s.room===room.id&&s.F>=FACE)){const y=s.base-19;fill(c,'#6e1d1a',s.x0,y,s.x1-s.x0,1.6);fill(c,'#b8392f',s.x0,y,s.x1-s.x0,.7);for(let x=s.x0+14;x<s.x1-4;x+=40){fill(c,'#6e1d1a',x-.5,y+1.6,1,1.6);fill(c,'#c9b98f',x-1.3,y+3,2.6,.9);}}}
};

// ── Je Bild ────────────────────────────────────────────────────────────────────────────────────────────────────
const densityOf=c=>{const t=c.getTransform();return Math.max(1,Math.round(Math.hypot(t.a,t.b)));};
/** Ebene des Helden: Plan (Raster, Requisiten) für den aktuellen Entdeckungsstand. */
export function currentPlan(g){const run=dungeonRun(g);if(!run)return null;const floor=heroFloor(g);return floorPlan(run.def,floor,hiddenRooms(run,floor));}
function layerFor(plan,d){const key=plan.def.name+'|'+plan.key+'@'+d;let L=layers.get(key);
 if(L&&!L.complete&&kitReady(plantIds(plan))){layers.delete(key);L=null;}
 if(!L){for(const k of layers.keys())if(k.startsWith(plan.def.name+'|'))layers.delete(k);L=buildLayer(plan,d);layers.set(key,L);sceneryStats.key=key;}
 return L;}
/** Boden der Ebene: eine Kopie des Ausschnitts aus der gebackenen Leinwand; was außerhalb liegt, füllt das Massemuster. */
export function drawSceneryGround(c,g,view){
 const plan=currentPlan(g);if(!plan||typeof document==='undefined')return null;const d=densityOf(c),L=layerFor(plan,d),{ox,oy,W,H}=view;
 const x0=Math.max(ox,L.bx0),y0=Math.max(oy,L.by0),x1=Math.min(ox+W,L.bx0+L.W),y1=Math.min(oy+H,L.by0+L.H);
 // Nur die Streifen außerhalb der Leinwand mit dem Muster füllen (keine zweite Vollbildfläche, E-50)
 if(x0>ox||y0>oy||x1<ox+W||y1<oy+H){c.fillStyle=massPattern(c,L.mass,d,L.origin)||'#2a2622';const X0=ox-2,Y0=oy-2,X1=ox+W+2,Y1=oy+H+2;
  if(y0>Y0)c.fillRect(X0,Y0,X1-X0,y0-Y0);if(y1<Y1)c.fillRect(X0,y1,X1-X0,Y1-y1);const ya=Math.max(Y0,y0),yb=Math.min(Y1,y1);if(yb>ya){if(x0>X0)c.fillRect(X0,ya,x0-X0,yb-ya);if(x1<X1)c.fillRect(x1,ya,X1-x1,yb-ya);}}
 if(x1>x0&&y1>y0){const s=L.d;c.drawImage(L.canvas,(x0-L.bx0)*s,(y0-L.by0)*s,(x1-x0)*s,(y1-y0)*s,x0,y0,x1-x0,y1-y0);}
 sceneryStats.blits++;
 // Bildfolgen am Wandschmuck (Neonröhre, Fackel) je Bild obenauf
 for(const it of plan.items.decor)if(kitFrames(it.sprite)>1&&it.maxX>ox-20&&it.minX<ox+W+20&&it.y>oy-30&&it.y-30<oy+H)drawWallDecor(c,it,it.wall);
 return plan;
}
/** Stehende Requisiten und Tischdeko der Ebene für die Tiefensortierung (renderer.js). */
export function dungeonSortables(g,visible){const plan=currentPlan(g);if(!plan)return [];const out=[];
 for(const it of plan.items.standing)if(visible(it,60))out.push({type:'dungeonProp',obj:it,y:it.maxY});
 for(const it of plan.items.tops)if(it.host&&visible(it,60))out.push({type:'dungeonProp',obj:it,y:it.sortY});
 return out;}
export function drawDungeonProp(c,it){drawKitItem(c,it);}
/** Lichterketten über dem Partykeller: hängen über allen Figuren (wie im Hof der Bude), Birnen funkeln sacht. */
const BULBS=['#ffd36a','#ff8f6a','#8fd6ff','#b8f08a','#ffb0e0'];
export function drawDungeonCeiling(c,g,view,time){const plan=currentPlan(g);if(!plan)return;const sc=sceneryOf(plan.def),o=plan.def.floors[plan.floor].origin;
 for(const room of plan.rooms)for(const [x1,y1,x2,y2] of sc.rooms[room.id]?.garlands||[]){const a={x:o.x+x1*U,y:o.y+y1*U},b={x:o.x+x2*U,y:o.y+y2*U},lift=30,sag=8;
  if(Math.max(a.x,b.x)<view.ox||Math.min(a.x,b.x)>view.ox+view.W||a.y-lift>view.oy+view.H||a.y<view.oy-10)continue;c.save();c.strokeStyle='#2a2018';c.lineWidth=.8;c.beginPath();
  for(let i=0;i<=32;i++){const t=i/32,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t-(lift-sag*4*t*(1-t));i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  const n=Math.max(3,Math.floor(Math.hypot(b.x-a.x,b.y-a.y)/11));for(let i=1;i<n;i++){const t=i/n,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t-(lift-sag*4*t*(1-t))+2,col=BULBS[i%BULBS.length],tw=.75+.25*Math.sin(time*2.2+i*1.7);
   c.globalAlpha=.35*tw;c.fillStyle=col;c.beginPath();c.arc(x,y+1,3.2,0,Math.PI*2);c.fill();c.globalAlpha=tw;c.beginPath();c.ellipse(x,y+1,1.5,2,0,0,Math.PI*2);c.fill();c.globalAlpha=1;fill(c,'#ffffffcc',x-.6,y,.8,.8);}
  c.restore();}}

// ── Garage draußen ─────────────────────────────────────────────────────────────────────────────────────────────
/** Bildrechteck der Garage (Prüfskript: Baumkronen). */
export function garageScreenBox(door){const lot=garageLot(door);return lot?{l:lot.minX,r:lot.maxX,t:lot.top,b:lot.maxY}:null;}
/** Die Garage als tiefensortiertes Gebäude (renderer.js „dungeonGarage“), mit Schlagschatten; Portal und Schild zeichnet dungeon-art.js. */
export function drawGarage(c,door){const lot=garageLot(door);if(!lot)return false;if(layers.size)layers.clear();/* draußen: die Ebenen-Leinwand des Dungeons freigeben */
 garageShadow(c,lot);
 const img=gradedGarage(lot);if(img)c.drawImage(img,lot.minX-2,lot.maxY-GARAGE_TOP,lot.w+4,GARAGE_TOP+2);else drawKitItem(c,{...lot,def:{...lot.def,shadow:false}});return true;}
/** Schlagschatten wie die Häuser ringsum: Lichtrichtung aus light-convention.js, Länge nach Wandhöhe, eine Lage mit weichem Auslauf. */
function garageShadow(c,lot){const n=Math.hypot(LIGHT.dir.x,LIGHT.dir.y),k=(LIGHTING.shadow?.building??.5)*(lot.height+6),ox=LIGHT.dir.x/n*k,oy=LIGHT.dir.y/n*k,y0=lot.minY+6;
 c.save();const g=typeof c.createLinearGradient==='function'?c.createLinearGradient(lot.maxX,lot.maxY,lot.maxX+ox,lot.maxY+oy):null;
 if(g){g.addColorStop(0,LIGHT.shadow.color+'80');g.addColorStop(.6,LIGHT.shadow.color+'40');g.addColorStop(1,LIGHT.shadow.color+'00');c.fillStyle=g;}else{c.globalAlpha=.3;c.fillStyle=LIGHT.shadow.color;}
 c.beginPath();c.moveTo(lot.maxX,y0);c.lineTo(lot.maxX+ox,y0+oy);c.lineTo(lot.maxX+ox,lot.maxY+oy);c.lineTo(lot.minX+ox,lot.maxY+oy);c.lineTo(lot.minX,lot.maxY);c.lineTo(lot.maxX,lot.maxY);c.closePath();c.fill();c.restore();}
/** Garage einmal in ein Zwischenbild (4 px je E) – ohne Grafikkarte mit eingebackener Farbabstimmung wie die Häuser ringsum (E-50). */
const GARAGE_TOP=96,garageCache={key:'',cv:null};
function gradedGarage(lot){if(typeof document==='undefined'||!kitReady([lot.sprite]))return null;const key=lot.sprite+'|'+bakedGrade.filter;if(garageCache.key===key)return garageCache.cv;
 const k=4,raw=document.createElement('canvas');raw.width=(lot.w+4)*k;raw.height=(GARAGE_TOP+2)*k;const rc=raw.getContext('2d');rc.imageSmoothingEnabled=false;rc.setTransform(k,0,0,k,-(lot.minX-2)*k,-(lot.maxY-GARAGE_TOP)*k);drawKitItem(rc,{...lot,def:{...lot.def,shadow:false}});
 let cv=raw;if(bakedGrade.filter){cv=document.createElement('canvas');cv.width=raw.width;cv.height=raw.height;const g=cv.getContext('2d');withGrade(g,()=>g.drawImage(raw,0,0));}
 garageCache.key=key;garageCache.cv=cv;return cv;}

// ── Prüfzugang (scripts/dungeon-raeume-check.mjs Teil 4) ───────────────────────────────────────────────────────
/** Geheimnisse vor der Entdeckung: Die Ebene mit verborgenem Wehrgang muss im Bereich des Wehrgangs pixelgleich mit einer Ebene sein,
 *  in der es den Wehrgang gar nicht gibt. Die Pappwand muss die Farben der Galerie-Wandfront tragen, nicht Pappe. */
export async function secretAudit(g){const run=dungeonRun(g),def=run.def;
 const without={...def,rooms:def.rooms.filter(r=>r.id!=='wehrgang')},A=floorPlan(def,'e0',['wehrgang']),B=floorPlan(without,'e0',[]);
 const la=buildLayer(A,1),lb=buildLayer(B,1),room=def.rooms.find(r=>r.id==='wehrgang'),q=room.rects[0],o=def.floors.e0.origin,x=o.x+q[0]*U-24,y=o.y+q[1]*U-24,w=q[2]*U+48,h=q[3]*U+48;
 const px=(L)=>L.canvas.getContext('2d').getImageData(Math.round(x-L.bx0),Math.round(y-L.by0),w,h).data,a=px(la),b=px(lb);let diff=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>6)diff++;
 const {drawPappwandFace}=await import('./dungeon-art.js'),probe=document.createElement('canvas');probe.width=probe.height=64;const pc=probe.getContext('2d');pc.translate(32,40);drawPappwandFace?.(pc,{x:0,y:0},'damast');
 const face=document.createElement('canvas');face.width=face.height=64;const fc=face.getContext('2d');fc.translate(32,40);paintFace(fc,'damast',-14,14,0,FACE,{x:0,y:0});
 const mean=cv=>{const d=cv.getContext('2d').getImageData(18,18,28,22).data;let r=0,g2=0,b2=0,n=0;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;r+=d[i];g2+=d[i+1];b2+=d[i+2];n++;}return n?[r/n,g2/n,b2/n]:[0,0,0];};
 const m1=mean(probe),m2=mean(face),dist=Math.hypot(m1[0]-m2[0],m1[1]-m2[1],m1[2]-m2[2]);
 return {wehrgang:{diff,area:w*h},pappwand:{faceLike:dist<18,dist:+dist.toFixed(1),pappwand:m1.map(Math.round),face:m2.map(Math.round)}};}
export {paintFace,FACES};
