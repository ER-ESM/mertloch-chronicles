// Laufzeit der Pre-Render-Sprites (E-30): liest assets/prerender/runtime/catalog.json (Format wie der Präzisions-Katalog),
// zeichnet Basisbogen + je angelegtem Ausrüstungsteil eine vorgerenderte Ebene (Verdeckung ist im Render eingebrannt).
// Aktiv nur mit Einstellung `prerender` (Hilfe → Einstellungen); ohne Katalog oder ohne Bogen liefert drawPrerenderPerson false,
// dann zeichnen die bisherigen Wege (live-art.js) weiter. Keine Inhaltstexte, keine Zahlen außer Bildgeometrie.
const CATALOG='./assets/prerender/runtime/catalog.json';
export const prerenderArt={ready:false,catalog:null,images:new Map()};
let pending=null;
const loadImage=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
export function loadPrerenderArt(){return pending||=(async()=>{
 let catalog=null;try{const r=await fetch(CATALOG);if(r.ok)catalog=await r.json();}catch{}
 if(!catalog?.assets)return;
 prerenderArt.catalog=catalog;
 const entries=[...Object.entries(catalog.assets),...Object.entries(catalog.gear||{})];
 await Promise.all(entries.map(async([id,a])=>{const img=await loadImage('./'+a.path);if(img)prerenderArt.images.set(id,img);}));
 prerenderArt.ready=true;
})();}
const DIRECTIONS=['se','sw','ne','nw'];
export const hasPrerenderActor=id=>!!(prerenderArt.ready&&prerenderArt.catalog.assets[id+'-poses']&&prerenderArt.images.get(id+'-poses'));
/** Spalte wie contentFrame in content-art.js: Laufen taktet über die Strecke, sonst Pose aus Zustand. */
function pick(actor,p,walkSheet){
 const cols=actor.columns,at=n=>cols.indexOf(n);
 if(p.moving&&walkSheet){const stride=48;const distance=p.walkDistance||0;return {sheet:'walk',column:Math.floor(distance/stride*8)%8};}
 if(p.hurt>0&&at('hit')>=0)return {sheet:'poses',column:at('hit')};
 if(p.attack>0){const progress=1-Math.min(1,p.attack/.3);return {sheet:'poses',column:at('anticipation')>=0&&progress<.45?at('anticipation'):at('impact')};}
 if(p.resting&&at('rest')>=0)return {sheet:'poses',column:at('rest')};
 return {sheet:'poses',column:0};
}
/**
 * Zeichnet eine Figur (classId) an Weltposition x,y. p: {direction|facing, moving, walkDistance, attack, hurt, visualEquipment:[{slot,asset}]}.
 * scale: Vergrößerung für Porträts; in der Welt gilt worldHeight (26 Einheiten) wie beim Präzisionsbogen.
 */
export function drawPrerenderPerson(c,classId,x,y,p={},magnify=1){
 if(!prerenderArt.ready)return false;
 const cat=prerenderArt.catalog,poses=cat.assets[classId+'-poses'],walk=cat.assets[classId+'-walk'];
 const base=prerenderArt.images.get(classId+'-poses');if(!poses||!base)return false;
 const direction=p.direction||((p.facing||1)>0?'se':'sw'),row=Math.max(0,DIRECTIONS.indexOf(direction));
 const sel=pick(poses,p,!!walk&&prerenderArt.images.has(classId+'-walk'));
 const sheet=sel.sheet==='walk'?walk:poses,image=prerenderArt.images.get(classId+'-'+sel.sheet);
 const size=sheet.frameSize||cat.frameSize,pivot=sheet.pivot||cat.pivot;
 const f=sheet.frames[row*8+sel.column];if(!f)return false;
 const k=(sheet.worldHeight||26)/(poses.nativeHeight||104)*magnify,height=(sheet.worldHeight||26)*magnify;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,height*.20,height*.06,0,0,7);c.fill();
 c.scale(k,k);c.translate(-pivot.x,-pivot.y);
 c.drawImage(image,f.x,f.y,size,size,0,0,size,size);
 for(const item of p.visualEquipment||[]){
  const id=classId+'-gear-'+item.asset+'-'+sel.sheet,layer=cat.gear?.[id],img=prerenderArt.images.get(id);if(!layer||!img)continue;
  if(item.slot==='ranged'&&!p.usingRanged)continue;if((item.slot==='weapon'||item.slot==='offhand')&&p.usingRanged)continue;
  const g=layer.frames[row*8+sel.column];if(!g||!g.bounds?.count)continue;
  c.drawImage(img,g.x,g.y,size,size,0,0,size,size);
 }
 if(p.parry>0){c.strokeStyle='#f3b84b';c.lineWidth=2/k;c.beginPath();c.arc(pivot.x,pivot.y-26*4*.5,25,-1.3,1.1);c.stroke();}
 c.restore();return true;
}
