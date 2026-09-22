// Bodenkacheln vorausladen (E-50): Eine Kachel (512 × 512 Welteinheiten) zu erzeugen kostet ~100 ms – bisher auf einen Schlag, sobald sie
// ins Bild kam: ein spürbarer Hänger beim Laufen und Reiten. Hier entsteht sie in Stücken (`pieces` × `pieces`, je ~1–8 ms):
//   - vorausschauend in der freien Zeit jedes Bildes, Stück für Stück nach Nähe zum Sichtrand, zuerst in Laufrichtung;
//   - wird eine Stelle gebraucht, bevor ihre Kachel fertig ist, entstehen nur die Stücke unter dieser Stelle (nicht die ganze Kachel).
// Stückweise erzeugt ist pixelgleich zur ganzen Kachel (createTerrainRegion arbeitet in Weltkoordinaten). Werte: content/performance.js.
import {createTerrainRegion,TERRAIN_SIZE as S,DETAIL} from './terrain.js';
import {withGrade,bakedGrade} from './art-quality.js';
export class TerrainPrefetch{
 constructor(world,rules){this.world=world;this.rules=rules;this.builds=new Map();this.lastView=null;this.stats={pieces:0,chunks:0,forced:0};}
 build(key,gx,gy){let b=this.builds.get(key);if(b&&b.filter!==bakedGrade.filter){this.builds.delete(key);b=null;}
  if(!b){const cv=document.createElement('canvas');cv.width=cv.height=S*DETAIL;b={key,gx,gy,cv,c:cv.getContext('2d',{alpha:false}),done:new Uint8Array(this.rules.pieces**2),count:0,filter:bakedGrade.filter};this.builds.set(key,b);}
  return b;}
 piece(b,i,j,done){const n=this.rules.pieces,k=j*n+i;if(b.done[k])return;const s=S/n,r=createTerrainRegion(this.world,b.gx*S+i*s,b.gy*S+j*s,s);withGrade(b.c,()=>b.c.drawImage(r,i*s*DETAIL,j*s*DETAIL));b.done[k]=1;b.count++;this.stats.pieces++;
  if(b.count===b.done.length){this.builds.delete(b.key);this.stats.chunks++;done(b.key,b.cv);}}
 /** Kachel für den Bereich `rect` (Welteinheiten) nutzbar machen: nur die Stücke darunter bauen. Liefert die (evtl. noch unfertige) Leinwand. */
 ensure(key,gx,gy,rect,done){const b=this.build(key,gx,gy),n=this.rules.pieces,s=S/n,ox=gx*S,oy=gy*S;
  const i0=Math.max(0,Math.floor((rect.x0-ox)/s)),i1=Math.min(n-1,Math.floor((rect.x1-1-ox)/s)),j0=Math.max(0,Math.floor((rect.y0-oy)/s)),j1=Math.min(n-1,Math.floor((rect.y1-1-oy)/s));
  let built=0;for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(!b.done[j*n+i]){this.piece(b,i,j,done);built++;}if(built)this.stats.forced+=built;return b.cv;}
 /** Je Bild mit der übrigen Zeit aufrufen. `has(key)`: Kachel liegt fertig im Speicher. `done(key,cv)`: Kachel ist fertig geworden. */
 step(view,budgetMs,keyOf,has,done,maxDist=Infinity){const {ox,oy,W,H}=view,cx=ox+W/2,cy=oy+H/2;
  // Laufrichtung einmal je Bild aus der Sichtverschiebung (der dringende Zweitaufruf im selben Bild nutzt sie mit).
  if(maxDist===Infinity){const last=this.lastView,vx=last?cx-last.cx:0,vy=last?cy-last.cy:0,speed=Math.hypot(vx,vy);this.lastView={cx,cy};this.motion={dx:speed?vx/speed:0,dy:speed?vy/speed:0,moving:speed>.5};}
  if(budgetMs<=0)return;const t0=performance.now(),R=this.rules,{dx,dy,moving}=this.motion||{dx:0,dy:0,moving:false};if(maxDist!==Infinity&&!moving)return;
  const x0=ox-R.ring-(moving&&dx<0?-dx*R.lead:0),x1=ox+W+R.ring+(moving&&dx>0?dx*R.lead:0),y0=oy-R.ring-(moving&&dy<0?-dy*R.lead:0),y1=oy+H+R.ring+(moving&&dy>0?dy*R.lead:0);
  const n=R.pieces,s=S/n,cand=[];
  // Speicher begrenzen: angefangene Kacheln weit außerhalb des Vorlaufbereichs verwerfen (je Kachel 4 MB).
  if(maxDist===Infinity)for(const [k,b] of this.builds){const bx=b.gx*S,by=b.gy*S;if(bx+S<x0-S||bx>x1+S||by+S<y0-S||by>y1+S)this.builds.delete(k);}
  for(let gx=Math.floor(x0/S);gx<=Math.floor(x1/S);gx++)for(let gy=Math.floor(y0/S);gy<=Math.floor(y1/S);gy++){const key=keyOf(gx,gy);if(has(key))continue;const b=this.builds.get(key);
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(b&&b.filter===bakedGrade.filter&&b.done[j*n+i])continue;const px=gx*S+(i+.5)*s,py=gy*S+(j+.5)*s;if(px<x0-s||px>x1+s||py<y0-s||py>y1+s)continue;
    // Rangfolge: Abstand zum Sichtrechteck (0 = sichtbar); in Laufrichtung zählt er halb, dahinter anderthalbfach.
    const ex=Math.max(ox-px,0,px-ox-W),ey=Math.max(oy-py,0,py-oy-H),dist=Math.hypot(ex,ey),rx=px-cx,ry=py-cy,cos=moving?(rx*dx+ry*dy)/(Math.hypot(rx,ry)||1):0;cand.push({key,gx,gy,i,j,dist,score:dist*(1-.5*cos)});}}
  cand.sort((a,b)=>a.score-b.score);if(maxDist!==Infinity&&!(cand[0]?.dist<=maxDist))return;
  for(const c of cand){const b=this.build(c.key,c.gx,c.gy);this.piece(b,c.i,c.j,done);if(performance.now()-t0>=budgetMs)return;}
 }
 /** Mindestens ein dringendes Stück je Bild beim Laufen, auch ohne freie Zeit: sonst baut der nächste Bodenstreifen viele Stücke auf einmal. */
 urgent(view,keyOf,has,done){const R=this.rules;this.step(view,.001,keyOf,has,done,R.urgentDist);
 }
}
