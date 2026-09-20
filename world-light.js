// Licht und Schatten der Welt (E-39): gerichtete Bodenschatten, Lichtschicht mit Gebietsdunkel, Wolken und Lichtquellen, Randabdunklung.
// Werte: content/lighting.js. Richtung und Schattenfarbe: light-convention.js (gilt auch für vorgerenderte Figuren).
import {LIGHT} from './light-convention.js';
import {LIGHTING as L} from './content/index.js';
const canvas=(w,h)=>{const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w));cv.height=Math.max(1,Math.ceil(h));return cv;};
const norm=Math.hypot(LIGHT.dir.x,LIGHT.dir.y),DX=LIGHT.dir.x/norm,DY=LIGHT.dir.y/norm,ANGLE=Math.atan2(DY*LIGHT.shadow.squash,DX);
const ACTORS=['player','other','resident','npc','mentor','merchant','questgiver'];
/** Deterministisches Wertrauschen, kachelbar: Wolkenschatten brauchen kein Bild. */
function cloudTile(size=256){const cv=canvas(size,size),c=cv.getContext('2d'),img=c.createImageData(size,size),cells=[64,32,16],smooth=t=>t*t*(3-2*t);
 const hash=(x,y,s)=>{let n=Math.imul(x+s*131,374761393)^Math.imul(y+s*17,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){let v=0,amp=.55;
  for(const [i,s] of cells.entries()){const n=size/s,gx=Math.floor(x/s),gy=Math.floor(y/s),fx=smooth(x/s-gx),fy=smooth(y/s-gy),a=hash(gx%n,gy%n,i),b=hash((gx+1)%n,gy%n,i),d=hash(gx%n,(gy+1)%n,i),e=hash((gx+1)%n,(gy+1)%n,i);v+=amp*(a+(b-a)*fx+(d-a)*fy+(a-b-d+e)*fx*fy);amp*=.5;}
  const shade=Math.max(0,Math.min(1,(v-.5)*3.2)),k=(y*size+x)*4;img.data[k]=28;img.data[k+1]=42;img.data[k+2]=66;img.data[k+3]=Math.round(shade*255);}
 c.putImageData(img,0,0);return cv;}
function glowSprite(color){const cv=canvas(128,128),c=cv.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,color);g.addColorStop(.35,color+'a0');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,128,128);return cv;}
export class WorldLight{
 constructor(){this.dark=L.ambient.zones.rest;this.frame=0;this.silhouettes=new Map();this.glows=new Map();this.shadowLayer=canvas(1,1);this.lightLayer=canvas(1,1);this.clouds=null;this.vignette=null;}
 /** Schattenriss eines stehenden Objekts, einmal gezeichnet und eingefärbt. Liefert `draw` false (Grafik noch nicht geladen), wird später neu versucht. */
 silhouette(key,w,h,draw){const old=this.silhouettes.get(key);if(old&&(old.ok||this.frame-old.at<180))return old.canvas;
  const cv=canvas(w,h),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.save();const ok=draw(c)!==false;c.restore();c.globalCompositeOperation='source-in';c.fillStyle=LIGHT.shadow.color;c.fillRect(0,0,cv.width,cv.height);
  this.silhouettes.delete(key);this.silhouettes.set(key,{canvas:cv,ok,at:this.frame});if(this.silhouettes.size>L.shadow.cacheLimit)this.silhouettes.delete(this.silhouettes.keys().next().value);return cv;}
 /** Projiziert einen Schattenriss vom Fußpunkt (x, y) auf den Boden: gespiegelt, geschert, gestaucht – in Lichtrichtung. */
 cast(c,cv,x,y,ax,ay,length){c.save();c.translate(x,y);c.transform(1,0,-DX*length,-DY*length,0,0);c.drawImage(cv,-ax,-ay);c.restore();}
 blob(c,x,y,r){c.save();c.translate(x+DX*r*.55,y+DY*r*.55);c.rotate(ANGLE);c.fillStyle=LIGHT.shadow.color;c.beginPath();c.ellipse(0,0,r*1.25,r*LIGHT.shadow.squash*1.25,0,0,Math.PI*2);c.fill();c.restore();}
 /** Alle Schatten in EINE Ebene, dann einmal mit der Deckkraft der Konvention: überlappende Schatten werden nicht schwarz. */
 shadows(target,view,items,painters){this.frame++;const {ox,oy,W,H}=view,layer=this.shadowLayer;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H;}
  const c=layer.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.imageSmoothingEnabled=true;c.translate(-ox,-oy);
  for(const item of items){const e=item.obj;
   if(item.type==='tree'){const s=Math.max(.2,Math.round(e.size*20)/20),w=170*s,h=130*s,ax=w/2,ay=h-10*s;this.cast(c,this.silhouette('tree:'+e.type+':'+e.variant+':'+s,w,h,cc=>painters.tree(cc,{...e,size:s,x:ax,y:ay})),e.x,e.y+3,ax,ay,L.shadow.tree);}
   else if(item.type==='building'){const b=painters.bounds(e),pad=4,w=b.maxX-b.minX+pad*2,h=b.maxY-b.minY+pad*2;if(!(w*h<900000))continue;this.cast(c,this.silhouette('building:'+(e.id??e.minX+','+e.minY),w,h,cc=>{cc.translate(pad-b.minX,pad-b.minY);return painters.building(cc,e);}),b.minX-pad,e.maxY,0,e.maxY-b.minY+pad,L.shadow.building);}
   else if(ACTORS.includes(item.type)){const at=item.type==='questgiver'?e.giver:e;if(!painters.baked?.(item))this.blob(c,at.x,at.y,L.shadow.actor);}
   else if(item.type==='furniture'||item.type==='loot')this.blob(c,e.x,e.y,L.shadow.prop);
   else if(e&&e.hp>0&&Number.isFinite(e.x))this.blob(c,e.x,e.y,e.type==='boss'?L.shadow.boss:L.shadow.actor);
  }
  target.save();target.imageSmoothingEnabled=true;target.globalAlpha=LIGHT.shadow.alpha;target.drawImage(layer,ox,oy,W,H);target.restore();target.imageSmoothingEnabled=false;}
 /** Dunkelanteil des Gebiets, in dem der Held steht. Zieht weich nach, damit Lagergrenzen nicht springen. */
 zoneDark(game,world,elapsed){const p=game.player,Z=L.ambient.zones,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),camp=world.camps.find(k=>d(p,k)<240),rest=(world.hubs||[]).some(h=>d(p,h)<125)||d(p,world.spawn)<100||d(p,world.church)<190;let goal=Z.fields;
  if(rest)goal=Z.rest;else if(camp)goal=!game.enemies.some(e=>e.campId===camp.id&&e.hp>0)?Z.cleared:camp.type==='boss'?Z.boss:Z.camp;
  else{const F=L.ambient.forest;let n=0;for(const t of world.trees)if(Math.abs(t.x-p.x)<F.radius&&Math.abs(t.y-p.y)<F.radius&&++n>=F.trees)break;goal=Z.fields+(Z.forest-Z.fields)*Math.min(1,n/F.trees);}
  this.dark+=(goal-this.dark)*(1-Math.exp(-L.ambient.ease*elapsed));return this.dark;}
 /** Sichtbare Lichtquellen in Weltkoordinaten. */
 sources(game,world,visible,time){const out=[],add=(kind,x,y,scale=1)=>{const s=L.sources[kind];if(s&&visible({x,y},s.radius+20))out.push({s,x:x+s.dx,y:y+s.dy,scale,seed:x*.37+y*.11});};
  for(const p of world.props)if(p.type==='lantern')add('streetLantern',p.x,p.y);
  for(const site of [...(world.hubs||[]),...world.camps])for(const p of site.dressing||[])if(p.type==='lantern')add('lantern',p.x,p.y);
  for(const k of world.camps)if(k.type!=='wolf')add('campfire',k.x+19,k.y+19);
  for(const b of world.buildings)if(b.door)add(b===world.church||b.church?'church':'door',b.door.x,b.maxY);
  if(world.shrine)add('shrine',world.shrine.x,world.shrine.y);
  for(const z of game.fields||[])if(z.kind==='burn'&&z.remaining>0)add('burn',z.x,z.y,Math.max(.6,z.radius/60));
  for(const f of game.fx||[])if(['burst','impact','interrupt'].includes(f.type)&&f.max)add('flash',f.x,f.y,.5+f.life/f.max);
  add('hero',game.player.x,game.player.y);
  for(const o of out)o.flicker=1+o.s.flicker*(Math.sin(time*9+o.seed)+Math.sin(time*5.3+o.seed*2))*.5;return out;}
 glow(color){let g=this.glows.get(color);if(!g){g=glowSprite(color);this.glows.set(color,g);}return g;}
 /** Lichtschicht über der fertigen Welt (Bildschirmkoordinaten): multiplizieren, warmen Schein aufhellen, Rand abdunkeln. */
 apply(c,view,game,world,time,elapsed){const {ox,oy,W,H}=view,dark=this.zoneDark(game,world,elapsed),visible=(o,pad)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad,lights=this.sources(game,world,visible,time),lw=Math.ceil(W/2),lh=Math.ceil(H/2),layer=this.lightLayer;
  if(layer.width!==lw||layer.height!==lh){layer.width=lw;layer.height=lh;}
  const l=layer.getContext('2d');l.setTransform(.5,0,0,.5,0,0);l.globalCompositeOperation='source-over';l.globalAlpha=1;l.fillStyle='#ffffff';l.fillRect(0,0,W,H);l.globalAlpha=dark;l.fillStyle=L.ambient.tint;l.fillRect(0,0,W,H);
  this.clouds||=cloudTile();const size=L.clouds.size,cx=-((((ox+time*L.clouds.wind.x)%size)+size)%size),cy=-((((oy+time*L.clouds.wind.y)%size)+size)%size);
  l.globalAlpha=L.clouds.alpha*(1-dark*.6);l.imageSmoothingEnabled=true;for(let x=cx;x<W;x+=size)for(let y=cy;y<H;y+=size)l.drawImage(this.clouds,x,y,size,size);
  l.globalCompositeOperation='lighter';for(const s of lights){const r=s.s.radius*s.scale*s.flicker;l.globalAlpha=Math.min(1,dark*2.6)*(s.s===L.sources.hero?.55:1);l.drawImage(this.glow(s.s.color),s.x-ox-r,s.y-oy-r,r*2,r*2);}
  c.save();c.imageSmoothingEnabled=true;c.globalCompositeOperation='multiply';c.drawImage(layer,0,0,W,H);
  c.globalCompositeOperation='screen';for(const s of lights){if(s.s===L.sources.hero)continue;const r=s.s.radius*s.scale*s.flicker*.8;c.globalAlpha=Math.min(1,L.glow.day+L.glow.night*dark)*s.flicker;c.drawImage(this.glow(s.s.color),s.x-ox-r,s.y-oy-r,r*2,r*2);}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
  if(!this.vignette||this.vignette.width!==lw||this.vignette.height!==lh){this.vignette=canvas(lw,lh);const v=this.vignette.getContext('2d'),g=v.createRadialGradient(lw/2,lh/2,Math.min(lw,lh)*.42,lw/2,lh/2,Math.hypot(lw,lh)*.56);g.addColorStop(0,'#10182000');g.addColorStop(1,'#101820');v.fillStyle=g;v.fillRect(0,0,lw,lh);}
  c.globalAlpha=Math.min(1,L.grade.vignette+dark*.25);c.drawImage(this.vignette,0,0,W,H);c.restore();c.imageSmoothingEnabled=false;}
}
/** Farbabstimmung der Weltfläche als CSS-Filter: läuft auf der Grafikkarte und kostet den Zeichenweg nichts. */
export function applyGrade(element,on){const value=on?`contrast(${L.grade.contrast}) saturate(${L.grade.saturate})`:'';if(element.style.filter!==value)element.style.filter=value;}
