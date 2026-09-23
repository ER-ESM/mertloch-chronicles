// Licht und Schatten der Welt (E-39): gerichtete Bodenschatten, Lichtschicht mit Gebietsdunkel, Wolken und Lichtquellen, Randabdunklung.
// Werte: content/lighting.js. Richtung und Schattenfarbe: light-convention.js (gilt auch für vorgerenderte Figuren).
import {LIGHT} from './light-convention.js';
import {LIGHTING as L} from './content/index.js';
import {insideHouse} from './world-house.js';
const canvas=(w,h)=>{const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w));cv.height=Math.max(1,Math.ceil(h));return cv;};
const norm=Math.hypot(LIGHT.dir.x,LIGHT.dir.y),DX=LIGHT.dir.x/norm,DY=LIGHT.dir.y/norm,ANGLE=Math.atan2(DY*LIGHT.shadow.squash,DX);
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),MID=.45;
/** Ersetzt `multiply` durch normales Überdecken (kein Blend-Modus, der Compositor muss den Hintergrund nicht zurücklesen): aus der Multiplizierfarbe T werden Deckfarbe und Deckkraft-Faktor. */
function cover(hex){const t=rgb(hex),low=Math.min(...t),k=1-low;return {k,color:'rgb('+t.map(v=>Math.round(255*MID*(v-low)/(k||1))).join(',')+')',bytes:t.map(v=>Math.round(255*MID*(v-low)/(k||1)))};}
const ACTORS=['player','other','resident','npc','mentor','merchant','questgiver'];
/** Deterministisches Wertrauschen, kachelbar: Wolkenschatten brauchen kein Bild. */
function cloudTile(size=256,tone=[28,42,66]){const cv=canvas(size,size),c=cv.getContext('2d'),img=c.createImageData(size,size),cells=[64,32,16],smooth=t=>t*t*(3-2*t);
 const hash=(x,y,s)=>{let n=Math.imul(x+s*131,374761393)^Math.imul(y+s*17,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){let v=0,amp=.55;
  for(const [i,s] of cells.entries()){const n=size/s,gx=Math.floor(x/s),gy=Math.floor(y/s),fx=smooth(x/s-gx),fy=smooth(y/s-gy),a=hash(gx%n,gy%n,i),b=hash((gx+1)%n,gy%n,i),d=hash(gx%n,(gy+1)%n,i),e=hash((gx+1)%n,(gy+1)%n,i);v+=amp*(a+(b-a)*fx+(d-a)*fy+(a-b-d+e)*fx*fy);amp*=.5;}
  const shade=Math.max(0,Math.min(1,(v-.5)*3.2)),k=(y*size+x)*4;img.data[k]=tone[0];img.data[k+1]=tone[1];img.data[k+2]=tone[2];img.data[k+3]=Math.round(shade*255);}
 c.putImageData(img,0,0);return cv;}
function glowSprite(color){const cv=canvas(128,128),c=cv.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,color);g.addColorStop(.35,color+'a0');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,128,128);return cv;}
export class WorldLight{
 constructor(){this.dark=L.ambient.zones.rest;this.frame=0;this.silhouettes=new Map();this.glows=new Map();this.shadowLayer=canvas(1,1);this.lightLayer=canvas(1,1);this.clouds=null;this.vignette=null;}
 /** Hängt die Lichtebene als EINE normale Überlagerung hinter die Weltfläche. Bewusst ohne `mix-blend-mode` (bis 2026-09-21 multiply + screen):
  *  Blend-Modi zwingen den Compositor, je Bild den Hintergrund zurückzulesen – das kostete mehr als die ganze Welt zu zeichnen. */
 mount(world){if(this.mounted||!world?.parentNode)return;this.mounted=true;const layer=this.lightLayer;layer.className='world-light';layer.setAttribute('aria-hidden','true');Object.assign(layer.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});world.after(layer);}
 show(on){const layer=this.lightLayer,value=on?'block':'none';if(layer.style.display!==value)layer.style.display=value;}
 /** Schattenriss eines stehenden Objekts, einmal gezeichnet und eingefärbt. Liefert `draw` false (Grafik noch nicht geladen), wird später neu versucht. */
 silhouette(key,w,h,draw){const old=this.silhouettes.get(key);if(old&&(old.ok||this.frame-old.at<180))return old.canvas;
  const cv=canvas(w,h),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.save();const ok=draw(c)!==false;c.restore();c.globalCompositeOperation='source-in';c.fillStyle=LIGHT.shadow.color;c.fillRect(0,0,cv.width,cv.height);
  this.silhouettes.delete(key);this.silhouettes.set(key,{canvas:cv,ok,at:this.frame});if(this.silhouettes.size>L.shadow.cacheLimit)this.silhouettes.delete(this.silhouettes.keys().next().value);return cv;}
 /** Projiziert einen Schattenriss vom Fußpunkt (x, y) auf den Boden: gespiegelt, geschert, gestaucht – in Lichtrichtung. */
 cast(c,cv,x,y,ax,ay,length){const h=ay*length;this.touch(x-ax-4,y-4,x-ax+cv.width+DX*h+4,y+DY*h+(cv.height-ay)+4);c.save();c.translate(x,y);c.transform(1,0,-DX*length,-DY*length,0,0);c.drawImage(cv,-ax,-ay);c.restore();}
 blob(c,x,y,r){this.touch(x-r*1.5,y-r,x+r*2.5,y+r*1.5);c.save();c.translate(x+DX*r*.55,y+DY*r*.55);c.rotate(ANGLE);c.fillStyle=LIGHT.shadow.color;c.beginPath();c.ellipse(0,0,r*1.25,r*LIGHT.shadow.squash*1.25,0,0,Math.PI*2);c.fill();c.restore();}
 touch(x0,y0,x1,y1){const b=this.bounds;if(x0<b.x0)b.x0=x0;if(y0<b.y0)b.y0=y0;if(x1>b.x1)b.x1=x1;if(y1>b.y1)b.y1=y1;}
 /** Schattenwurf eines stehenden Objekts (Baum, Gebäude) in die Ebene `c`. Liefert false, solange dessen Grafik noch nicht geladen ist. */
 standing(c,type,e,painters){let key;
  if(type==='tree'){const s=Math.max(.2,Math.round(e.size*20)/20),w=170*s,h=130*s,ax=w/2,ay=h-10*s;key='tree:'+e.type+':'+e.variant+':'+s;this.cast(c,this.silhouette(key,w,h,cc=>painters.tree(cc,{...e,size:s,x:ax,y:ay})),e.x,e.y+3,ax,ay,L.shadow.tree);}
  else{const b=painters.bounds(e),pad=4,w=b.maxX-b.minX+pad*2,h=b.maxY-b.minY+pad*2;if(!(w*h<900000))return true;key='building:'+(e.id??e.minX+','+e.minY);this.cast(c,this.silhouette(key,w,h,cc=>{cc.translate(pad-b.minX,pad-b.minY);return painters.building(cc,e);}),b.minX-pad,e.maxY,0,e.maxY-b.minY+pad,L.shadow.building);}
  return this.silhouettes.get(key)?.ok!==false;}
 /** Schatten stehender Objekte für den Boden-Zwischenspeicher (ground-cache.js): gleiche Ebene-dann-Deckkraft-Regel wie `shadows`, aber nur für `rect` und nur einmal statt je Bild. */
 standingShadows(target,rect,trees,buildings,painters){const w=rect.x1-rect.x0,h=rect.y1-rect.y0,layer=this.standingLayer||=canvas(1,1);if(layer.width!==w||layer.height!==h){layer.width=w;layer.height=h;}
  const c=layer.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.translate(-rect.x0,-rect.y0);this.bounds={x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};let ok=true;
  for(const t of trees)ok=this.standing(c,'tree',t,painters)&&ok;for(const b of buildings)ok=this.standing(c,'building',b,painters)&&ok;
  target.save();target.imageSmoothingEnabled=false;target.globalAlpha=LIGHT.shadow.alpha;target.drawImage(layer,rect.x0,rect.y0,w,h);target.restore();return ok;}
 /** Alle Schatten in EINE Ebene, dann einmal mit der Deckkraft der Konvention: überlappende Schatten werden nicht schwarz. */
 shadows(target,view,items,painters,options={}){this.frame++;this.bounds={x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};
  // Stehende Objekte liegen gebacken im Boden (ground-cache.js): übrig sind kleine Ellipsen unter Figuren, Möbeln und Beute – direkt auf die Welt, ohne bildschirmgroße Zwischenebene.
  // Überlappen zwei Ellipsen, wird es dort etwas dunkler; die Ein-Ebenen-Regel gilt weiter für die großen Schatten im Boden.
  if(options.skipStanding){target.save();target.globalAlpha=LIGHT.shadow.alpha;for(const item of items){const e=item.obj;if(ACTORS.includes(item.type)){const at=item.type==='questgiver'?e.giver:e;if(!painters.baked?.(item))this.blob(target,at.x,at.y,L.shadow.actor);}else if(item.type==='furniture'||item.type==='loot')this.blob(target,e.x,e.y,L.shadow.prop);else if(item.type!=='tree'&&item.type!=='building'&&e&&e.hp>0&&Number.isFinite(e.x))this.blob(target,e.x,e.y,e.type==='boss'?L.shadow.boss:L.shadow.actor);}target.restore();return;}
  const {ox,oy,W,H}=view,layer=this.shadowLayer;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H;}
  const c=layer.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.imageSmoothingEnabled=true;c.translate(-ox,-oy);
  for(const item of items){const e=item.obj;
   if(item.type==='tree'||item.type==='building'){if(!options.skipStanding)this.standing(c,item.type,e,painters);}
   else if(ACTORS.includes(item.type)){const at=item.type==='questgiver'?e.giver:e;if(!painters.baked?.(item))this.blob(c,at.x,at.y,L.shadow.actor);}
   else if(item.type==='furniture'||item.type==='loot')this.blob(c,e.x,e.y,L.shadow.prop);
   else if(e&&e.hp>0&&Number.isFinite(e.x))this.blob(c,e.x,e.y,e.type==='boss'?L.shadow.boss:L.shadow.actor);
  }
  // Nur der belegte Ausschnitt wandert in die Welt; ohne Glättung bleibt der Schatten im Pixelraster der Grafik.
  const b=this.bounds,x0=Math.max(0,Math.floor(b.x0-ox)),y0=Math.max(0,Math.floor(b.y0-oy)),x1=Math.min(W,Math.ceil(b.x1-ox)),y1=Math.min(H,Math.ceil(b.y1-oy));if(!(x1>x0&&y1>y0))return;
  target.save();target.imageSmoothingEnabled=false;target.globalAlpha=LIGHT.shadow.alpha;target.drawImage(layer,x0,y0,x1-x0,y1-y0,ox+x0,oy+y0,x1-x0,y1-y0);target.restore();}
 /** Dunkelanteil des Gebiets, in dem der Held steht. Zieht weich nach, damit Lagergrenzen nicht springen. */
 zoneDark(game,world,elapsed){const p=game.player,Z=L.ambient.zones,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),camp=world.camps.find(k=>d(p,k)<240),rest=(world.hubs||[]).some(h=>d(p,h)<125)||d(p,world.spawn)<100||d(p,world.church)<190;let goal=Z.fields;
  if(rest)goal=Z.rest;else if(camp)goal=!game.enemies.some(e=>e.campId===camp.id&&e.hp>0)?Z.cleared:camp.type==='boss'?Z.boss:Z.camp;
  else{const F=L.ambient.forest;let n=0;for(const t of world.trees)if(Math.abs(t.x-p.x)<F.radius&&Math.abs(t.y-p.y)<F.radius&&++n>=F.trees)break;goal=Z.fields+(Z.forest-Z.fields)*Math.min(1,n/F.trees);}
  this.dark+=(goal-this.dark)*(1-Math.exp(-L.ambient.ease*elapsed));return this.dark;}
 /** Sichtbare Lichtquellen in Weltkoordinaten. */
 sources(game,world,visible,time){if(this.sourceCache?.time===time&&this.sourceCache.frame===this.frame&&this.sourceCache.game===game)return this.sourceCache.out;const out=[],add=(kind,x,y,scale=1)=>{const s=L.sources[kind];if(s&&visible({x,y},s.radius+20))out.push({s,x:x+s.dx,y:y+s.dy,scale,seed:x*.37+y*.11});};
  for(const p of world.props)if(p.type==='lantern')add('streetLantern',p.x,p.y);
  for(const site of [...(world.hubs||[]),...world.camps])for(const p of site.dressing||[])if(p.type==='lantern')add('lantern',p.x,p.y);
  for(const k of world.camps)if(k.type!=='wolf')add('campfire',k.x+19,k.y+19);
  for(const b of world.buildings)if(b.door)add(b===world.church||b.church?'church':'door',b.door.x,b.maxY);
  if(world.shrine)add('shrine',world.shrine.x,world.shrine.y);
  for(const z of game.fields||[])if(z.kind==='burn'&&z.remaining>0)add('burn',z.x,z.y,Math.max(.6,z.radius/60));
  for(const f of game.fx||[])if(['burst','impact','interrupt'].includes(f.type)&&f.max)add('flash',f.x,f.y,.5+f.life/f.max);
  // Innenlicht der Bude: Lampen des Baukastens (`light`), Glut im Ofen, Tageslicht durchs Dachloch – nur solange man drinnen ist.
  const house=world.base?.house;if(house&&this.indoor>.01){const f=game.floor&&house.upper?house.upper:house;
   for(const it of f.items){if(it.outdoor)continue;const d=it.def||{};
    if(d.light)add('lamp',it.x,it.y-(d.surface==='wall-face'?(d.mount||0)+(it.height||8)*.5:(it.lift||0)+(it.height||6))*.55);
    else if(it.sprite==='kanonenofen')add('stove',it.x,it.y);else if(it.sprite==='schutthaufen')add('skylight',it.x,it.y);}}
  add('hero',game.player.x,game.player.y);
  for(const o of out)o.flicker=1+o.s.flicker*(Math.sin(time*9+o.seed)+Math.sin(time*5.3+o.seed*2))*.5;this.sourceCache={time,frame:this.frame,game,out};return out;}
 glow(color){let g=this.glows.get(color);if(!g){g=glowSprite(color);this.glows.set(color,g);}return g;}
 /** Lichtschicht über der fertigen Welt (Bildschirmkoordinaten): multiplizieren, warmen Schein aufhellen, Rand abdunkeln. */
 apply(view,game,world,time,elapsed){const {ox,oy,W,H}=view,dark=this.zoneDark(game,world,elapsed);
  // Nur jedes zweite Bild neu zeichnen: Dunkel, Wolken und Schein ändern sich langsam; ein Bild Nachlauf der weichen Lichtkreise ist nicht zu sehen. Größenwechsel zeichnet sofort.
  this.tick=(this.tick||0)+1;if(this.tick%2&&this.lightLayer.width===Math.ceil(W/2)&&this.lightLayer.height===Math.ceil(H/2))return;
  const visible=(o,pad)=>o.x>ox-pad&&o.x<ox+W+pad&&o.y>oy-pad&&o.y<oy+H+pad,lights=this.sources(game,world,visible,time),lw=Math.ceil(W/2),lh=Math.ceil(H/2),layer=this.lightLayer;
  if(layer.width!==lw||layer.height!==lh){layer.width=lw;layer.height=lh;}
  // Dunkel und Wolken überdecken, Lichtquellen stanzen das Dunkel wieder aus, der Rand dunkelt ab, zuletzt liegt der warme Schein obenauf.
  const l=layer.getContext('2d'),A=this.ambient||=cover(L.ambient.tint);l.setTransform(.5,0,0,.5,0,0);l.globalCompositeOperation='source-over';l.globalAlpha=1;l.clearRect(0,0,W,H);l.globalAlpha=dark*A.k;l.fillStyle=A.color;l.fillRect(0,0,W,H);
  // Drinnen: eigenes Dunkel nur über der Grundfläche des Hauses (samt sichtbarer Nordwandfront), weich beim Betreten.
  const house=world.base?.house,I=L.interior,inside=house&&insideHouse(house,game.player.x,game.player.y)?1:0;this.indoor=(this.indoor??inside)+(inside-(this.indoor??inside))*(1-Math.exp(-I.ease*elapsed));if(Math.abs(this.indoor-inside)<.01)this.indoor=inside;
  // Warmes Kneipendunkel statt Nachtblau; Innenlicht bleibt in der Grundfläche (`clipIn`), sonst leuchtet die Lampe durch die Wand ins Gras.
  const indoorDark=I.dark*this.indoor,room=indoorDark>0&&[house.minX-ox,house.minY-house.heights.cut-oy,house.maxX-house.minX,house.maxY-house.minY+house.heights.cut],T=this.interiorCover||=cover(I.tint);
  if(room){l.globalAlpha=indoorDark*T.k;l.fillStyle=T.color;l.fillRect(...room);}
  const clipIn=(s,draw)=>{if(!(s.s.indoor&&room))return draw();l.save();l.beginPath();l.rect(...room);l.clip();draw();l.restore();};
  const K=this.cloudCover||=cover(L.clouds.tint);this.clouds||=cloudTile(256,K.bytes);const size=L.clouds.size,cx=-((((ox+time*L.clouds.wind.x)%size)+size)%size),cy=-((((oy+time*L.clouds.wind.y)%size)+size)%size);
  l.globalAlpha=L.clouds.alpha*(1-dark*.6)*K.k;l.imageSmoothingEnabled=true;for(let x=cx;x<W;x+=size)for(let y=cy;y<H;y+=size)l.drawImage(this.clouds,x,y,size,size);
  l.globalCompositeOperation='destination-out';for(const s of lights){const r=s.s.radius*s.scale*s.flicker;l.globalAlpha=Math.min(1,(dark+(s.s.indoor?indoorDark:0))*2.6)*(s.s===L.sources.hero?.55:1);clipIn(s,()=>l.drawImage(this.glow(s.s.color),s.x-ox-r,s.y-oy-r,r*2,r*2));}
  if(!this.vignette||this.vignette.width!==lw||this.vignette.height!==lh){this.vignette=canvas(lw,lh);const v=this.vignette.getContext('2d'),g=v.createRadialGradient(lw/2,lh/2,Math.min(lw,lh)*.42,lw/2,lh/2,Math.hypot(lw,lh)*.56);g.addColorStop(0,'#10182000');g.addColorStop(1,'#101820');v.fillStyle=g;v.fillRect(0,0,lw,lh);}
  l.globalCompositeOperation='source-over';l.globalAlpha=Math.min(1,L.grade.vignette+dark*.25);l.drawImage(this.vignette,0,0,W,H);
  // Diagonaler Schimmer (L.sheen), früher je Bild als Vollbildfläche auf der Welt: hier einmal gerechnet und mitgemischt.
  if(!this.sheen||this.sheen.width!==lw||this.sheen.height!==lh){this.sheen=canvas(lw,lh);const v=this.sheen.getContext('2d'),g=v.createLinearGradient(0,0,lw,lh);g.addColorStop(0,L.sheen.from);g.addColorStop(.55,L.sheen.mid);g.addColorStop(1,L.sheen.to);v.fillStyle=g;v.fillRect(0,0,lw,lh);}
  l.globalAlpha=1;l.drawImage(this.sheen,0,0,W,H);
  for(const s of lights){if(s.s===L.sources.hero)continue;const r=s.s.radius*s.scale*s.flicker*.8;l.globalAlpha=Math.min(1,(L.glow.day+L.glow.night*(dark+(s.s.indoor?indoorDark:0)))*s.flicker*L.glow.cover);clipIn(s,()=>l.drawImage(this.glow(s.s.color),s.x-ox-r,s.y-oy-r,r*2,r*2));}
  // Lichtschacht (Dachloch): schräger Kegel von oben auf den Fußpunkt, unten am hellsten, darin treibender Staub.
  for(const s of lights){const B=s.s.beam;if(!B||!(indoorDark>0))continue;const x=s.x-ox,y=s.y-oy,tx=x-DX*B.height*.6,ty=y-B.height,g=l.createLinearGradient(0,ty,0,y);
   g.addColorStop(0,s.s.color+'00');g.addColorStop(.7,s.s.color+'80');g.addColorStop(1,s.s.color+'c0');l.globalAlpha=B.alpha*this.indoor;l.fillStyle=g;
   l.beginPath();l.moveTo(tx-B.top/2,ty);l.lineTo(tx+B.top/2,ty);l.lineTo(x+B.foot/2,y);l.lineTo(x-B.foot/2,y);l.closePath();l.fill();
   l.fillStyle=s.s.color;for(let i=0;i<B.motes;i++){const k=((i*.618+time*.05)%1),m=tx+(x-tx)*k+Math.sin(time*.7+i*2.1)*B.top*.4*(1-k*.3),n=ty+(y-ty)*k;l.globalAlpha=this.indoor*(.35+.35*Math.sin(time*1.3+i));l.fillRect(m,n,2,2);}}
  l.globalAlpha=1;}
}
/** Farbabstimmung der Weltfläche als CSS-Filter: läuft auf der Grafikkarte und kostet den Zeichenweg nichts. */
/** Filtertext der Farbabstimmung – als CSS-Filter (mit Grafikkarte) oder eingebacken in Zwischenbilder (ohne, E-50). */
export const gradeFilter=()=>`contrast(${L.grade.contrast}) saturate(${L.grade.saturate})`;
export function applyGrade(element,on){const dead=element.parentElement?.classList.contains('player-dead'),value=[on?gradeFilter():'',dead?'grayscale(.85) brightness(.72) contrast(1.05)':''].filter(Boolean).join(' ');if(element.style.filter!==value)element.style.filter=value;}
