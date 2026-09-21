import {drawBoar} from './maifeld-boar-rig.js';
import {contentActor,contentFrame,hasContentActor,contentActorHeight,contentAsset,contentArt} from './content-art.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {contextScale,scaledFrame} from './art-quality.js';
import {prerenderArt,drawPrerenderPerson} from './prerender-art.js';
import {drawDetailedHero} from './detailed-hero-art.js';
import {drawEquipment as gear,equipmentArt} from './equipment-art.js';
export {legGarmentSegments} from './equipment-art.js';
export {equipmentAppearance};
export const liveArt={ready:false,catalog:null,images:{},animals:{}};
const base='./assets/maifeld-live/runtime/';
const read=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Grafik fehlt: '+path);return r.json();};
const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Grafik fehlt: '+src));i.src=src;});
let pending;
export function loadLiveArt(){return pending||=(async()=>{
 const catalog=await read(base+'catalog.json');liveArt.catalog=catalog;
 const files=new Set(['equipment.png']);for(const h of Object.values(catalog.heroes))for(const s of Object.values(h.sheets))files.add(s.atlas);for(const n of Object.values(catalog.people))files.add(n.atlas);
 await Promise.all([...files].map(async f=>{liveArt.images[f]=await image(base+f);}));
 const boar=await read('./assets/maifeld-prototype/runtime/keiler-rig.json');liveArt.animals.boar={rig:boar,image:await image('./assets/maifeld-prototype/runtime/'+boar.atlas)};
 for(const [id,file] of Object.entries(catalog.animals||{})){const rig=await read(base+file);liveArt.animals[id]={rig,image:await image(base+rig.atlas)};}
 equipmentArt.catalog=catalog;equipmentArt.image=liveArt.images['equipment.png'];liveArt.ready=true;
})();}
const aliases={baerbel:'anni',lauti:'leander',elder:'villager0'};
export const livePersonId=(id,variant=0)=>id==='resident'?'villager'+variant%8:aliases[id]||id;
const DIRECTIONS=['se','sw','ne','nw'];
/** Welthöhe des gelieferten Bogens dieser Figur; 0, wenn für sie nichts geliefert wurde. */
export const liveActorHeight=(id,variant)=>contentActorHeight(livePersonId(id,variant));
export const hasLiveContent=(id,variant)=>hasContentActor(livePersonId(id,variant));
const directionOf=p=>p.direction||((p.facing||1)>0?'se':'sw');

/**
 * Präzisionsbogen aus assets/precision/runtime: 4 native Pixel = 1 Welteinheit, Fußpunkt am Asset.
 * `magnify` vergrößert nur für UI-Porträts; in der Welt gilt die Welthöhe des Assets.
 */
function drawContentPerson(c,id,x,y,p,magnify){
 const actor=contentActor(id);if(!actor)return false;
 const direction=directionOf(p),west=direction.endsWith('w'),back=direction.startsWith('n');
 const row=Math.max(0,DIRECTIONS.indexOf(direction));
 const sel=contentFrame(actor,row,p),f=sel.frame,size=sel.size;
 const k=actor.worldHeight/actor.nativeHeight*magnify,height=actor.worldHeight*magnify;
 // Zielgröße des Bogenfelds in Gerätepixeln: kleiner als das Original ⇒ vorverkleinertes Zwischenbild (art-quality.js), sonst Original (Porträts).
 const px=Math.max(1,Math.round(size*k*contextScale(c)));
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,height*.20,height*.06,0,0,7);c.fill();
 c.scale(k,k);c.translate(-actor.pivot.x,-actor.pivot.y);
 const items=f.sockets?p.visualEquipment||[]:[];
 if(items.length){c.save();c.scale(actor.gearScale,actor.gearScale);gear(c,items,f.sockets,west,back,true,p);c.restore();}
 if(px<size){const mip=scaledFrame(sel.image,f.x,f.y,size,size,px,px);c.drawImage(mip,0,0,px,px,0,0,size,size);}else c.drawImage(sel.image,f.x,f.y,size,size,0,0,size,size);
 if(items.length){c.save();c.scale(actor.gearScale,actor.gearScale);gear(c,items,f.sockets,west,back,false,p);c.restore();}
 if(p.parry>0){c.strokeStyle='#f3b84b';c.lineWidth=2/k;c.beginPath();c.arc(actor.pivot.x,actor.pivot.y-26*actor.gearScale,25*actor.gearScale,-1.3,1.1);c.stroke();}
 c.restore();return true;
}

export function drawLivePerson(c,id,x,y,time=0,p={},scale=1){
 id=livePersonId(id,p.variant);
 if(drawDetailedHero(c,id,x,y,p,p.artMagnify??scale/(26/33)))return true;
 if(prerenderArt.enabled&&drawPrerenderPerson(c,id,x,y,p,p.artMagnify??scale/(26/33)))return true;
 if(drawContentPerson(c,id,x,y,p,p.artMagnify??scale/(26/33)))return true;
 if(!liveArt.ready)return false;const cat=liveArt.catalog,h=cat.heroes[id],n=cat.people[id];if(!h&&!n)return false;
 const direction=directionOf(p),west=direction.endsWith('w'),back=direction.startsWith('n'),height=33*scale,k=height/52;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);
 c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,height*.20,height*.06,0,0,7);c.fill();c.scale(k,k);c.translate(-48,-80);
 if(h){
  const row=cat.directions.indexOf(direction),state=p.moving?'walk':'poses',sheet=h.sheets[state],frame=p.moving?Math.floor((p.walkDistance||0)/h.stride*8)%8:p.attack>0?5:0;
  const f=sheet.frames[row*8+frame],items=p.visualEquipment||[];
  gear(c,items,f.sockets,west,back,true,p);c.drawImage(liveArt.images[sheet.atlas],frame*96,row*96,96,96,0,0,96,96);gear(c,items,f.sockets,west,back,false,p);
 }else{
  const f=n.frames[back?1:0],img=liveArt.images[n.atlas];if(west){c.translate(96,0);c.scale(-1,1);}
  if(p.moving&&id!=='automat'){const step=Math.sin((p.walkDistance??time*25)/30*Math.PI*2)*1.3,split=73;
   c.drawImage(img,f.x,f.y,96,split,0,0,96,split);
   c.drawImage(img,f.x,f.y+split,48,96-split,0,split-step,48,96-split);c.drawImage(img,f.x+48,f.y+split,48,96-split,48,split+step,48,96-split);
  }else c.drawImage(img,f.x,f.y,96,96,0,0,96,96);
 }
 if(p.parry>0){c.strokeStyle='#f3b84b';c.lineWidth=2;c.beginPath();c.arc(48,54,25,-1.3,1.1);c.stroke();}
 c.restore();return true;
}

export function drawLiveAnimal(c,e,time,height){
 const key=e.variant||e.family||e.skin||e.kind;if(contentActor(key)&&drawContentPerson(c,key,e.x,e.y,e,1))return true;
 if(!liveArt.ready)return false;const id=e.variant&&liveArt.animals[e.variant]?e.variant:e.family&&liveArt.animals[e.family]?e.family:e.skin||e.kind;
 const a=liveArt.animals[id];if(!a)return false;
 const h=height??({boar:e.elite?27:20,badger:17,fox:18,cat:12,chicken:10,goose:17,raven:12}[id]||19);
 c.save();c.fillStyle='#24384144';c.beginPath();c.ellipse(e.x,e.y,h*.38,2,0,0,7);c.fill();
 drawBoar(c,a.image,a.rig,{direction:directionOf(e),distance:e.walkDistance||0,moving:e.gaitWeight??(e.moving?1:0),action:e.hurt>0?{kind:'hit',progress:1-Math.min(1,e.hurt/.15)}:e.attack>0?{kind:'attack',progress:1-Math.min(1,e.attack/.3)}:null},e.x,e.y,h);c.restore();return true;
}
export function drawEquipmentIcon(c,id,x,y,size){
 const aliases={coat:'jacket',boots:'boot',necklace:'chain',shoulders:'pauldron',bracers:'bracer',gloves:'glove',trousers:'trouser',reinforced:'club','anni-spray':'sprayer',speaker:'sprayer',trinket:'pendant'};
 const asset=aliases[id]||id,precise=contentAsset('equipment-parts'),r=precise?contentArt.catalog.equipment[asset]:liveArt.catalog?.equipment[asset];if(!liveArt.ready||!r)return false;
 const scale=(size-4)/Math.max(r.w,r.h),w=Math.round(r.w*scale),h=Math.round(r.h*scale);c.save();c.imageSmoothingEnabled=false;c.drawImage((precise?.image||liveArt.images['equipment.png']),r.x,r.y,r.w,r.h,Math.round(x+(size-w)/2),Math.round(y+(size-h)/2),w,h);c.restore();return true;
}
