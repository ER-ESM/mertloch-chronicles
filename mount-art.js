import {drawDetailedHero} from './detailed-hero-art.js';
import {redesignFrame,redesignArt} from './redesign-art.js';
import {MOUNT_RULES} from './content/index.js';
export const mountArt={ready:false,catalog:null,images:new Map()};
let loading;const riders=new Map(),sources=new Map();
const canvas=(w=256,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
export function loadMountArt(){return loading||=(async()=>{try{const r=await fetch('./assets/mounts/runtime/catalog.json');if(!r.ok)throw Error('Mount catalog unavailable');const cat=await r.json();await Promise.all(Object.entries(cat.assets).map(async([id,a])=>{const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='./'+a.path;});mountArt.images.set(id,img);}));mountArt.catalog=cat;mountArt.ready=true;return true;}catch{return false;}})();}
function triangle(c,img,uv,xy){const [a,b,d]=uv,[p,q,r]=xy,det=a.x*(b.y-d.y)+b.x*(d.y-a.y)+d.x*(a.y-b.y);if(Math.abs(det)<.01)return;
 const coeff=(u,v,w)=>[(u*(b.y-d.y)+v*(d.y-a.y)+w*(a.y-b.y))/det,(u*(d.x-b.x)+v*(a.x-d.x)+w*(b.x-a.x))/det,(u*(b.x*d.y-d.x*b.y)+v*(d.x*a.y-a.x*d.y)+w*(a.x*b.y-b.x*a.y))/det];
 const x=coeff(p.x,q.x,r.x),y=coeff(p.y,q.y,r.y);c.save();c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineTo(r.x,r.y);c.closePath();c.clip();c.transform(x[0],y[0],x[1],y[1],x[2],y[2]);c.drawImage(img,0,0);c.restore();
}
function limb(c,img,src,dst,x0,x1){for(let i=0;i<src.length-1;i++){const a=src[i],b=src[i+1],p=dst[i],q=dst[i+1],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,n={x:dy/len,y:-dx/len};
 const uv=[{x:x0,y:a.y},{x:x1,y:a.y},{x:x1,y:b.y},{x:x0,y:b.y}],xy=[{x:p.x+n.x*(x0-a.x),y:p.y+n.y*(x0-a.x)},{x:p.x+n.x*(x1-a.x),y:p.y+n.y*(x1-a.x)},{x:q.x+n.x*(x1-b.x),y:q.y+n.y*(x1-b.x)},{x:q.x+n.x*(x0-b.x),y:q.y+n.y*(x0-b.x)}];
 triangle(c,img,[uv[0],uv[1],uv[2]],[xy[0],xy[1],xy[2]]);triangle(c,img,[uv[0],uv[2],uv[3]],[xy[0],xy[2],xy[3]]);
}}
function riderSource(p,direction){const equipment=(p.visualEquipment||[]).filter(i=>!['weapon','offhand','ranged'].includes(i.slot)),body=p.look||p.classId||'dieter',key=JSON.stringify([body,direction,p.tint,equipment,redesignArt.details.has((redesignArt.catalog?.aliases?.[body]||body)+'-poses')]);if(sources.has(key))return sources.get(key);
 const pose={...p,mount:null,dead:false,attack:0,hurt:0,parry:0,castPose:0,casting:false,moving:false,resting:false,artPose:'idle',direction,visualEquipment:equipment};const sel=redesignFrame(body,pose);if(!sel)return null;
 const cv=canvas(192),ctx=cv.getContext('2d');if(!drawDetailedHero(ctx,body,96,160,{...pose,legacyArt:true},4))return null;
 const s={...sel.frame.sockets,shoulders:[...sel.frame.sockets.shoulders].sort((a,b)=>a.x-b.x)},hipY=s.waist.y+7,split=s.waist.x,parts=Array.from({length:5},()=>canvas(192)),data=ctx.getImageData(0,0,192,192),outs=parts.map(v=>v.getContext('2d').createImageData(192,192));
 // Cut only the already composed character: clothing and gloves deform with their actual limb.
 for(let y=0;y<167;y++)for(let x=0;x<192;x++){const i=(y*192+x)*4;if(!data.data[i+3])continue;let part=0;const side=x<split?0:1,shoulder=s.shoulders[side],hand=[s.main,s.off].sort((a,b)=>a.x-b.x)[side];
  if(y>=shoulder.y-3&&y<=hand.y+6&&(side?x>shoulder.x-2:x<shoulder.x+2))part=3+side;else if(y>=hipY)part=1+side;
  outs[part].data.set(data.data.subarray(i,i+4),i);if(part>=3&&y<shoulder.y+7)outs[0].data.set(data.data.subarray(i,i+4),i);
 }parts.forEach((v,i)=>v.getContext('2d').putImageData(outs[i],0,0));const value={key,parts,s,hipY};sources.set(key,value);if(sources.size>24)sources.delete(sources.keys().next().value);return value;
}
function riderLayers(p,f){const source=riderSource(p,f.direction);if(!source)return null;const key=source.key+'|'+p.mount+'|'+f.column;if(riders.has(key))return riders.get(key);const {s,parts,hipY}=source,offset={x:f.seat.x-s.waist.x,y:f.seat.y-s.waist.y},out=Array.from({length:5},()=>canvas()),sorted=[0,1].sort((a,b)=>f.feet[a].x-f.feet[b].x),hands=[s.main,s.off].sort((a,b)=>a.x-b.x);
 out[0].getContext('2d').drawImage(parts[0],offset.x,offset.y);
 for(let side=0;side<2;side++){const model=sorted[side],foot=s.feet[side],hip={x:s.waist.x+(side?8:-8),y:hipY},knee={x:(hip.x+foot.x)/2,y:(hipY+foot.y)/2},end={x:foot.x,y:foot.y+5};
  limb(out[1+side].getContext('2d'),parts[1+side],[hip,knee,foot,end],[{x:f.hips[model].x,y:f.hips[model].y+5},f.knees[model],f.feet[model],{x:f.feet[model].x,y:f.feet[model].y+5}],side?s.waist.x:0,side?192:s.waist.x);
  const shoulder={x:s.shoulders[side].x,y:s.shoulders[side].y-3},hand=hands[side],elbow={x:(shoulder.x+hand.x)/2,y:(shoulder.y+hand.y)/2},start={x:shoulder.x+offset.x,y:shoulder.y+offset.y},grip=f.hands[model],bend={x:start.x*.45+grip.x*.55+(side?4:-4),y:(start.y+grip.y)/2+5};
  limb(out[3+side].getContext('2d'),parts[3+side],[shoulder,elbow,hand,{x:hand.x,y:hand.y+7}],[start,bend,grip,{x:grip.x,y:grip.y+6}],side?s.waist.x:0,side?192:s.waist.x);
 }const near=f.feet[sorted[0]].y>f.feet[sorted[1]].y?0:1,value=canvas(),ctx=value.getContext('2d'),meta=mountArt.catalog.assets[p.mount],row=meta.directions.indexOf(f.direction);ctx.drawImage(out[1+(1-near)],0,0);ctx.drawImage(mountArt.images.get(p.mount),f.column*256,row*256,256,256,0,0,256,256);for(const i of [3+(1-near),0,1+near,3+near])ctx.drawImage(out[i],0,0);riders.set(key,value);if(riders.size>96)riders.delete(riders.keys().next().value);return value;
}
export function drawMount(c,x,y,p={},time=0,magnify=1,rider=true){const id=p.mount,meta=mountArt.catalog?.assets[id],img=mountArt.images.get(id);if(!meta||!img)return false;
 const direction=p.direction||((p.facing||1)>0?'se':'sw'),row=Math.max(0,meta.directions.indexOf(direction)),col=p.moving?1+(Math.floor((p.walkDistance??time*70)/MOUNT_RULES.stride*8)%8+8)%8:0,f=meta.frames[row*9+col],layers=rider?riderLayers(p,f):null;
 if(rider&&!layers)return false;
 c.save();c.imageSmoothingEnabled=false;c.translate(x,y);c.fillStyle='#182b2948';c.beginPath();c.ellipse(0,2*magnify,13*magnify,4*magnify,0,0,Math.PI*2);c.fill();c.scale(magnify/4,magnify/4);c.translate(-meta.pivot.x,-meta.pivot.y);
 if(layers)c.drawImage(layers,0,0);else c.drawImage(img,col*meta.size,row*meta.size,meta.size,meta.size,0,0,meta.size,meta.size);
 c.restore();return true;
}
export function paintMountIcon(cv,id){const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);return drawMount(c,cv.width/2,cv.height*.86,{mount:id,direction:'se'},0,cv.width/45,false);}
