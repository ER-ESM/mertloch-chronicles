// Fitted cloth uses the active pose's native visible-material mask. It cannot
// move the silhouette or paint over a foreground apron or an empty gap.
import {PRECISION_PALETTE} from './art-quality.js';
import {contentAsset,contentArt} from './content-art.js';
import {legGarmentSegments} from './equipment-art.js';
const cache=new Map(),colours=new Map();
function nearest(rgb){const key=rgb.join(',');if(!colours.has(key)){let best=PRECISION_PALETTE[0],distance=Infinity;for(const p of PRECISION_PALETTE){const d=p.reduce((n,v,i)=>n+(v-rgb[i])**2,0);if(d<distance){distance=d;best=p;}}colours.set(key,best);}return colours.get(key);}
const ramps={trouser:['#283b46','#456071','#7b91a0'],boot:['#342b26','#674536','#a27c51'],leatherboot:['#352c2a','#775438','#b69d73'],furboot:['#51483c','#8c8065','#c9bea0'],glove:['#342b25','#715333','#b99a60'],bracer:['#26353a','#607273','#b4bcb0']};
function textureFor(sel,item,q){
 const sheet=contentAsset('equipment-parts'),r=contentArt.catalog?.equipment[item.asset];if(!sheet||!r)return null;
 const cv=document.createElement('canvas');cv.width=cv.height=192*q;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.scale(q,q);const s=sel.frame.sockets;
 const part=(x,y,w,h,angle=0,half=null,slice=[0,1])=>{c.save();c.translate(x,y);c.rotate(angle);if(s.west)c.scale(-1,1);c.drawImage(sheet.image,r.x+(half===1?r.w/2:0),r.y+r.h*slice[0],half===null?r.w:r.w/2,r.h*(slice[1]-slice[0]),-w/2,-h/2,w,h);c.restore();};
 if(item.slot==='legs'){
  const joints=sel.frame.joints||s.feet.map((f,i)=>({hip:{x:s.waist.x+(i?5:-5),y:s.waist.y-3},knee:{x:(s.waist.x+f.x)/2,y:(s.waist.y+f.y)/2},ankle:f}));
  for(const i of sel.frame.legOrder||[0,1])for(const p of legGarmentSegments(joints[i]))part(p.x,p.y,16,p.h,p.angle,i,p.slice);
 }else if(item.slot==='feet')for(const f of s.feet)part(f.x,f.y-4,18,18,f.angle||0);
 else for(const h of [s.main,s.off])part(h.x,h.y-(item.slot==='wrists'?5:0),10,item.slot==='wrists'?11:10);
 return c.getImageData(0,0,cv.width,cv.height).data;
}
export function drawFittedEquipment(c,sel,items,slots){
 const supported=items.filter(i=>slots.includes(i.slot)&&sel.frame.wearRuns?.[i.slot]);if(!supported.length)return;
 for(const item of supported){const f=sel.frame,q=sel.resolution||1,key=[sel.key,f.x,f.y,item.slot,item.asset,q].join(':');let cv=cache.get(key);
  if(!cv){cv=document.createElement('canvas');cv.width=cv.height=192*q;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.beginPath();for(const [y,x,w]of f.wearRuns[item.slot])ctx.rect(x*q,y*q,w*q,q);ctx.clip();ctx.drawImage(sel.image,f.x*q,f.y*q,192*q,192*q,0,0,192*q,192*q);
   // Preserve the artist's folds, seams and highlights; recolour only owned cloth.
   const data=ctx.getImageData(0,0,cv.width,cv.height),texture=textureFor(sel,item,q),ramp=(ramps[item.asset]||ramps[item.slot==='hands'?'glove':'bracer']).map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
   for(let i=0;i<data.data.length;i+=4){if(!data.data[i+3])continue;const light=Math.min(1,(data.data[i]*.25+data.data[i+1]*.6+data.data[i+2]*.15)/210),at=light<.45?0:1,t=at?Math.min(1,(light-.45)/.55):light/.45,rgb=nearest(ramp[at].map((v,j)=>Math.round(texture?.[i+3]?texture[i+j]*(.65+light*.6):v+(ramp[at+1][j]-v)*t)));for(let j=0;j<3;j++)data.data[i+j]=rgb[j];}
   ctx.putImageData(data,0,0);cache.set(key,cv);if(cache.size>128)cache.delete(cache.keys().next().value);
  }c.drawImage(cv,0,0,192,192);
 }
}
