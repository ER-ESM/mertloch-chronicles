// Boden-Zwischenspeicher (E-49): Boden, Steine und die Schatten stehender Objekte ändern sich nicht von Bild zu Bild. Sie liegen in einer
// Ebene, die etwas größer ist als der Bildausschnitt (Rand `margin`), schon in der Dichte der Weltfläche. Je Bild kostet das EINE Kopie.
// Läuft die Kamera aus dem Rand, wird der Inhalt verschoben und nur der neu sichtbare Streifen gezeichnet – kein Ruckler durch Vollaufbau.
// Ohne Grafikkarte war genau das der teure Teil: Bodenkacheln je Bild skalieren und ~30 Schattenrisse geschert zeichnen.
const make=()=>{const cv=document.createElement('canvas');return {cv,c:cv.getContext('2d',{alpha:false})};};
export class GroundCache{
 constructor({margin=96,maxAge=20000}={}){this.margin=margin;this.maxAge=maxAge;this.a=null;this.b=null;this.key='';this.x=0;this.y=0;this.w=0;this.h=0;this.at=0;this.retryAt=0;this.stats={full:0,strips:0,hits:0};}
 invalidate(){this.key='';}
 /** `paint(c,rect)` zeichnet Weltinhalt für `rect` ({x0,y0,x1,y1} in Welteinheiten); `c` ist schon skaliert, verschoben und auf `rect` beschnitten. Liefert false, wenn Grafik noch fehlte. */
 region(layer,density,rect,paint){const c=layer.c;c.save();c.setTransform(density,0,0,density,-this.x*density,-this.y*density);c.beginPath();c.rect(rect.x0,rect.y0,rect.x1-rect.x0,rect.y1-rect.y0);c.clip();c.imageSmoothingEnabled=false;const ok=paint(c,rect)!==false;c.restore();return ok;}
 /** Legt den Boden für den Ausschnitt `view` auf `target` (in Welteinheiten skaliert und um -ox/-oy verschoben). `key` wechselt, wenn sich der Inhalt grundsätzlich ändert. */
 draw(target,view,density,key,paint,now=performance.now()){
  const {ox,oy,W,H}=view,M=this.margin,w=W+2*M,h=H+2*M;key=key+'|'+density+'|'+w+'|'+h;this.a||=make();this.b||=make();
  const inside=ox>=this.x&&oy>=this.y&&ox+W<=this.x+this.w&&oy+H<=this.y+this.h,fresh=key===this.key&&now-this.at<this.maxAge&&!(this.retryAt&&now>this.retryAt);
  if(!fresh||!inside){
   const nx=Math.round(ox-M),ny=Math.round(oy-M),dx=this.x-nx,dy=this.y-ny,rects=[];let ok=true;
   if(fresh&&Math.abs(dx)<w&&Math.abs(dy)<h){
    // Verschieben: alter Inhalt wandert in die zweite Ebene, neu gezeichnet werden nur die frei gewordenen Streifen.
    const next=this.b;if(next.cv.width!==w*density||next.cv.height!==h*density){next.cv.width=w*density;next.cv.height=h*density;}
    next.c.setTransform(1,0,0,1,0,0);next.c.drawImage(this.a.cv,dx*density,dy*density);this.b=this.a;this.a=next;this.x=nx;this.y=ny;
    if(dx<0)rects.push({x0:nx+w+dx,y0:ny,x1:nx+w,y1:ny+h});else if(dx>0)rects.push({x0:nx,y0:ny,x1:nx+dx,y1:ny+h});
    const fx0=dx>0?nx+dx:nx,fx1=dx<0?nx+w+dx:nx+w;if(dy<0)rects.push({x0:fx0,y0:ny+h+dy,x1:fx1,y1:ny+h});else if(dy>0)rects.push({x0:fx0,y0:ny,x1:fx1,y1:ny+dy});this.stats.strips++;
   }else{
    const a=this.a;if(a.cv.width!==w*density||a.cv.height!==h*density){a.cv.width=w*density;a.cv.height=h*density;}this.x=nx;this.y=ny;this.w=w;this.h=h;this.key=key;this.at=now;this.retryAt=0;rects.push({x0:nx,y0:ny,x1:nx+w,y1:ny+h});this.stats.full++;
   }
   for(const r of rects)ok=this.region(this.a,density,r,paint)&&ok;if(!ok)this.retryAt=now+1000;
  }else this.stats.hits++;
  target.drawImage(this.a.cv,(ox-this.x)*density,(oy-this.y)*density,W*density,H*density,ox,oy,W,H);
 }
}
