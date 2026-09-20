import {contentAsset,contentArt} from './content-art.js';
import {tintedFrame} from './hero-tint.js';
import {drawFittedEquipment} from './fitted-equipment-art.js';

export const redesignArt={ready:false,catalog:null,images:new Map(),details:new Map(),gear:null,changed:null};
let pending;
const image=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='./'+src;});
export function validRedesignCatalog(catalog){
 if(!catalog?.complete||!catalog.dressing?.complete||!catalog.gearPath)return false;
 for(const hero of ['dieter','anni','kevin'])for(const [state,columns]of Object.entries({poses:8,walk:8,specials:4,heavy:4,heavywalk:8})){
  const a=catalog.assets?.[hero+'-'+state];if(!a?.basePath||!a.baseDetailPath||a.frames?.some(f=>!f.base?.wearRuns)||a.columns?.length!==columns||a.frames?.length!==columns*4||a.frames.some(f=>!f.sockets||!Array.isArray(f.clothRuns)))return false;
 }return true;
}
export function loadRedesignArt(){return pending||=(async()=>{
 try{
  const r=await fetch('./assets/redesign/runtime/catalog.json');if(!r.ok)return;
  const catalog=await r.json();if(!validRedesignCatalog(catalog))return;
  const loaded=await Promise.all(Object.entries(catalog.assets).map(async([id,a])=>[id,await image(a.basePath)]));
  const gear=await image(catalog.gearPath);
  if(!gear||loaded.some(([,im])=>!im))return;
  redesignArt.catalog=catalog;redesignArt.images=new Map(loaded);redesignArt.gear=gear;redesignArt.ready=true;
 }catch{ /* The established renderer remains available if a delivery is incomplete. */ }
})();}
const detailPending=new Set(),detailWanted=new Map(),detailFailed=new Set();
function requestDetail(sel){
 detailWanted.set(sel.id,sel.key);if(redesignArt.details.has(sel.key)||detailPending.has(sel.key)||detailFailed.has(sel.key))return;
 detailPending.add(sel.key);image(sel.meta.baseDetailPath).then(im=>{
  detailPending.delete(sel.key);if(!im){detailFailed.add(sel.key);return;}if(detailWanted.get(sel.id)!==sel.key)return;
  for(const key of redesignArt.details.keys())if(key.startsWith(sel.id+'-'))redesignArt.details.delete(key);
  redesignArt.details.set(sel.key,im);redesignArt.changed?.();
 });
}

export function redesignPose(p={}){
 if(p.dead||p.hp===0)return 'dead';
 if(p.dash>0)return 'dash';
 if(p.hurt>0)return 'hit';
 if(p.parry>0)return 'parry';
 if(p.casting)return p.usingRanged?'ranged-aim':'cast';
 if(p.castPose>0)return 'cast';
 if(p.attack>0){if(p.usingRanged)return p.attack>.12?'ranged-aim':'ranged-release';return p.attack>.18?'anticipation':p.attack>.07?'impact':'recovery';}
 if(p.moving)return 'walk-'+(((Math.floor(((p.walkDistance||0)-(p.walkStartDistance||0))/(redesignArt.catalog?.stride||80)*8)%8)+8)%8);
 if(p.resting)return 'rest';
 return 'idle';
}
export function redesignFrame(id,p={}){
 if(!redesignArt.ready)return null;id=redesignArt.catalog.aliases[id]||id;
 const pose=p.artPose||redesignPose(p),heavy=(!p.usingRanged||p.parry>0)&&p.visualEquipment?.some(i=>i.slot==='weapon'&&i.hands===2),state=pose.startsWith('walk-')?(heavy?'heavywalk':'walk'):['ranged-aim','ranged-release','dash','dead'].includes(pose)?'specials':heavy&&['idle','anticipation','impact','recovery','parry'].includes(pose)?'heavy':'poses';
 const key=id+'-'+state,a=redesignArt.catalog.assets[key];if(!a)return null;
 const row=Math.max(0,redesignArt.catalog.directions.indexOf(p.direction||((p.facing||1)>0?'se':'sw'))),column=a.columns.indexOf(state==='heavy'&&pose==='parry'?'idle':pose);if(column<0)return null;
 return {id,key,meta:a,image:redesignArt.images.get(key),frame:{...a.frames[row*a.columns.length+column],...a.frames[row*a.columns.length+column].base},row,pose};
}

/** Cosmetic variants preserve the equipped weapon family and handedness. */
export function redesignGear(id,item){
 if(['shield','potlid'].includes(item.asset))return id==='anni'?'citrusshield':id==='kevin'?'pfandshield':'barrelshield';
 if(['club','maul'].includes(item.asset))return 'beerhammer';
 if(item.asset==='sprayer')return 'coppersprayer';
 if(item.asset==='slingshot')return 'pfandsling';
 return null;
}
function held(c,sel,item,at,angle,off=false,scale=1){
 const theme=redesignGear(sel.id,item),view=theme&&redesignArt.catalog.gear[theme]?.[sel.row];
 c.save();c.translate(at.x,at.y);c.rotate(angle);c.scale(scale,scale);
 if(view){const h=off?40:item.hands===2?53:42,k=h/Math.max(view.bounds.w,view.bounds.h);c.drawImage(redesignArt.gear,view.x,view.y,128,128,-view.grip.x*k,-view.grip.y*k,128*k,128*k);}
 else{const sheet=contentAsset('equipment-parts'),r=contentArt.catalog?.equipment[item.asset];if(sheet&&r){const h=off?34:item.hands===2?52:34,w=h*r.w/r.h;if(sel.frame.sockets.west)c.scale(-1,1);c.drawImage(sheet.image,r.x,r.y,r.w,r.h,-w/2,-h*(off?.5:.78),w,h);}}
 c.restore();
}
function glove(c,sel,at){
 // Restore the painted gripping fingers over the handle, with a tiny circular mask.
 const r=3.2;c.save();c.beginPath();c.arc(at.x,at.y,r,0,Math.PI*2);c.clip();const f=sel.frame,q=sel.resolution||1;if(sel.tinted)c.drawImage(sel.tinted,0,0,192*q,192*q,0,0,192,192);else c.drawImage(sel.image,f.x*q,f.y*q,192*q,192*q,0,0,192,192);c.restore();
}
export function drawRedesignPerson(c,id,x,y,p={},magnify=1,drawClothing){
 if(p.parry>0&&p.usingRanged)p={...p,usingRanged:false};
 const sel=redesignFrame(id,p);if(!sel)return false;
 if(magnify>=4){requestDetail(sel);if(redesignArt.details.has(sel.key)){sel.image=redesignArt.details.get(sel.key);sel.resolution=2;}}
 const {frame:f,meta:a}=sel,s=f.sockets,items=p.visualEquipment||[],find=slot=>items.find(i=>i.slot===slot),main=p.usingRanged?find('ranged'):find('weapon'),off=p.usingRanged||main?.hands===2?null:find('offhand');
 const k=a.worldHeight/a.nativeHeight*magnify;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x*2)/2,Math.round(y*2)/2);c.fillStyle='#24384144';c.beginPath();c.ellipse(0,1,5.2*magnify,1.56*magnify,0,0,7);c.fill();c.scale(k,k);c.translate(-96,-160);
 // Far arm equipment is occluded by the body in back views, near arm stays readable.
 const drawMain=()=>{if(main)held(c,sel,main,s.main,s.mainAngle);},drawOff=()=>{if(off)held(c,sel,off,s.off,s.offAngle,true);};
 const down=sel.pose==='dead';
 if(down){if(main)held(c,sel,main,{x:96,y:169},s.west?-1.4:1.4,false,.85);if(off)held(c,sel,off,{x:f.bounds.x+f.bounds.w*(s.west?.85:.15),y:150},.3,true,.7);}
 const stowed=p.usingRanged?[find('weapon'),find('offhand')]:[find('ranged')];
 const drawStowed=()=>stowed.filter(Boolean).forEach((item,i)=>held(c,sel,item,{x:s.torso.x+(s.west?1:-1)*(i?17:12),y:s.waist.y-5},(s.west?-1:1)*.65,item.slot==='offhand',.65));
 if(!s.back)drawStowed();
 if(s.back&&!down)drawOff();
 const q=sel.resolution||1,tinted=p.tint?tintedFrame(sel,p.tint,id):null;sel.tinted=tinted;if(tinted)c.drawImage(tinted,0,0,192*q,192*q,0,0,192,192);else c.drawImage(sel.image,f.x*q,f.y*q,192*q,192*q,0,0,192,192);
 drawFittedEquipment(c,sel,items,['body']);
 drawFittedEquipment(c,sel,items,['legs','feet']);
 if(s.back)drawStowed();
 const clothingSockets={...s,legs:f.joints,legOrder:f.legOrder},handSlots=['hands','wrists','ring1','ring2'];
 if(drawClothing)drawClothing(c,items.filter(i=>!['body','weapon','offhand','ranged',...handSlots,...(f.wearRuns?['legs','feet']:[])].includes(i.slot)),clothingSockets,p);
 if(!down){drawMain();if(!s.back)drawOff();if(main)glove(c,sel,s.main);if(off&&!s.back||main?.hands===2&&!p.usingRanged)glove(c,sel,s.off);}
 // Equipped gloves and rings must remain above the restored painted fingers.
 drawFittedEquipment(c,sel,items,['wrists','hands']);
 if(drawClothing)drawClothing(c,items.filter(i=>handSlots.includes(i.slot)&&!(f.wearRuns&&['hands','wrists'].includes(i.slot))),clothingSockets,p);
 if(p.parry>0&&!down){c.strokeStyle='#f3b84b';c.lineWidth=1.2/k;c.lineCap='round';c.beginPath();c.arc(96,110,50,s.west?2: -1.3,s.west?4.5:1.1);c.stroke();}
 c.restore();return true;
}
