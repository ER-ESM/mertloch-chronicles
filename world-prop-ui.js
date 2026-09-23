// Kulissen der Kapitel-Lager und das Gelände der Bude zeichnen.
// Die Objekte liefert die Welt (`world.camps[].props`, `world.base.stageProps`), die Stammdaten `world-prop-kinds.js`.
// Kein Text und keine Zahl entsteht hier: Namen kommen aus der Welt, Farbe/Höhe aus PROP_KINDS, Bilder aus content-art.
import {PROP_KINDS} from './world-prop-kinds.js';
import {contentAsset} from './content-art.js';

/** Bild-ID einer Kulissenart im Grafikkatalog. Liegt kein Bild vor, zeichnet der Fallback. */
export const propAssetId=kind=>'prop-'+kind;
/** Stammdaten einer Art mit sicherem Rückfall, damit unbekannte Arten nichts umwerfen. */
export const propKind=kind=>PROP_KINDS[kind]||{name:kind,w:16,h:12,height:14,color:'#7d7a72',blocking:false};

/** Sortierhöhe: die Bildschwelle liegt am vorderen Rand der Grundfläche (y + h/2). */
export const propBaseline=p=>p.y+(p.h??propKind(p.kind).h)/2;

/** Runtime sprites include the visible ground depth; anchor their bottom at the footprint edge. */
export function propDrawRect(p){
 const d=propKind(p.kind),w=p.w??d.w,scale=w/d.w,height=(d.height+d.h/2)*scale;
 return{x:p.x-w/2,y:propBaseline(p)-height,w,h:height,depth:propBaseline(p)};
}

const shade=(color,f)=>{
 const n=parseInt(color.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 const mix=v=>Math.max(0,Math.min(255,Math.round(v*f)));
 return '#'+[mix(r),mix(g),mix(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
};

/** Eine Kulisse zeichnen. Mit Bild aus dem Katalog, sonst als Körper in der Fallback-Farbe der Art. */
export function drawProp(c,prop){
 const kind=propKind(prop.kind),w=prop.w??kind.w,d=prop.h??kind.h,height=prop.height??kind.height;
 const x=prop.x,base=prop.y+d/2;
 c.save();c.imageSmoothingEnabled=false;
 // Bodenschatten liegt immer auf der Grundfläche – auch unter einem gelieferten Bild.
 // Weich auslaufender Kontaktschatten statt harter Ellipse (die Trümmer der Bude sahen sonst wie Löcher im Boden aus).
 if(typeof c.createRadialGradient==='function'&&w>0&&d>0){c.save();c.translate(x,prop.y);c.scale(1,d/w);const g=c.createRadialGradient(0,0,0,0,0,w/2);g.addColorStop(0,'#24382966');g.addColorStop(.55,'#24382938');g.addColorStop(1,'#24382900');c.fillStyle=g;c.fillRect(-w/2,-w/2,w,w);c.restore();}
 else{c.fillStyle='#2438294d';c.beginPath();c.ellipse(x,prop.y,w/2,d/2,0,0,Math.PI*2);c.fill();}
 const art=contentAsset(propAssetId(prop.kind));
 if(art?.meta.worldProp){
  const m=art.meta,pad=m.padding??4,r=propDrawRect(prop);
  c.drawImage(art.image,pad,pad,m.width-pad*2,m.height-pad*2,Math.round(r.x*2)/2,Math.round(r.y*2)/2,r.w,r.h);
  c.restore();return;
 }
 if(art){
  const m=art.meta,k=height/(m.worldHeight||m.nativeHeight||m.height||height);
  c.translate(Math.round(x*2)/2,Math.round(base*2)/2);c.scale(k,k);
  c.translate(-(m.pivot?.x??m.width/2),-(m.pivot?.y??m.height));
  c.drawImage(art.image,0,0,m.width,m.height,0,0,m.width,m.height);c.restore();return;
 }
 // Ersatzkörper: Haufen-Silhouette (unten breit, oben schmaler) mit Deckfläche und Kante.
 const top=base-height,color=kind.color,half=w/2,cap=w*.36;
 const body=[[x-half,base],[x-cap,top],[x+cap,top],[x+half,base]];
 c.beginPath();body.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();
 c.fillStyle=shade(color,.68);c.fill();
 c.save();c.clip();
 c.fillStyle=color;c.fillRect(x-half,top,half,height);           // Lichtseite links
 c.fillStyle=shade(color,.5);c.fillRect(x+half*.35,top,half,height); // Schattenseite rechts
 for(let i=1;i<4;i++){c.fillStyle=shade(color,.42);c.fillRect(x-half,top+height*i/4,w,1);}
 c.restore();
 c.fillStyle=shade(color,1.18);c.beginPath();c.ellipse(x,top,cap,Math.max(2,d*.26),0,0,Math.PI*2);c.fill();
 c.strokeStyle=shade(color,.34);c.lineWidth=1;
 c.beginPath();body.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.stroke();
 c.restore();
}

/** Alle Kulissen der Kapitel-Lager und der benannten Orte (Kalles Kiosk), die der Renderer einsortieren soll. */
export function campProps(world){
 const out=[];
 for(const camp of world.camps||[])for(const prop of camp.props||[])out.push(prop);
 for(const place of Object.values(world.places||{}))for(const prop of place.props||[])out.push(prop);
 return out;
}

/** Die Bude: je Bauplatz genau die erreichte Stufe (0 = Trümmer) aus `game.buildings`. */
export function baseProps(world,buildings={}){
 const stageProps=world.base?.stageProps;if(!stageProps)return [];
 const out=[];
 for(const [id,slot] of Object.entries(stageProps)){
  const level=buildings[id]||0;
  const prop=slot.stages.find(s=>s.stage===level)||slot.stages[0];
  if(prop)out.push(prop);
 }
 // A physical sign at the plot's southern edge, away from the six building slots.
 if(world.base.sign)out.push({kind:'bude-schild',x:world.base.sign.x,y:world.base.sign.y});
 else if(Number.isFinite(world.base.x)&&Number.isFinite(world.base.maxY))out.push({kind:'bude-schild',x:world.base.x,y:world.base.maxY+12});
 return out;
}
