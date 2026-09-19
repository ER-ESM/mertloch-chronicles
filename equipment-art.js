import {contentAsset,contentArt} from './content-art.js';
export const equipmentArt={catalog:null,image:null};

function gearPart(c,id,x,y,w,h,west=false,angle=0,half=null,slice=[0,1]){
 const precise=contentAsset('equipment-parts'),r=precise?contentArt.catalog.equipment[id]:equipmentArt.catalog?.equipment[id];if(!r)return;
 c.save();c.translate(x,y);c.rotate(angle);if(west)c.scale(-1,1);c.drawImage((precise?.image||equipmentArt.image),r.x+(half===1?r.w/2:0),r.y+r.h*slice[0],half===null?r.w:r.w/2,r.h*(slice[1]-slice[0]),-w/2,-h/2,w,h);c.restore();
}
/** Split the existing trouser leg at the animated knee; retain one continuous texture. */
export function legGarmentSegments({hip,knee,ankle}){
 const upper=Math.hypot(knee.x-hip.x,knee.y-hip.y),lower=Math.hypot(ankle.x-knee.x,ankle.y-knee.y);
 if(upper<.01||lower<.01)return [];
 const fraction=upper/(upper+lower),collar=Math.min(3,lower*.3),end={x:ankle.x+(knee.x-ankle.x)*collar/lower,y:ankle.y+(knee.y-ankle.y)*collar/lower};
 return [[hip,knee,[0,fraction]],[knee,end,[fraction,1]]].map(([a,b,slice])=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2,h:Math.hypot(b.x-a.x,b.y-a.y)+1,angle:-Math.atan2(b.x-a.x,b.y-a.y),slice}));
}
function heldPart(c,id,at,w,h,west,angle=0){
 const precise=contentAsset('equipment-parts'),r=precise?contentArt.catalog.equipment[id]:equipmentArt.catalog?.equipment[id];if(!r)return;c.save();c.translate(at.x,at.y);c.rotate(angle);if(west)c.scale(-1,1);c.drawImage((precise?.image||equipmentArt.image),r.x,r.y,r.w,r.h,-w/2,-h*.78,w,h);c.restore();
}
export function drawEquipment(c,items,s,west,back,behind,p){
 const has=slot=>items.find(i=>i.slot===slot),body=has('body');
 if(behind){const ranged=has('ranged');if(ranged&&!p.usingRanged)gearPart(c,ranged.asset,s.torso.x+(west?13:-13),s.torso.y+3,8,15,west,-.18);if(p.usingRanged){const weapon=has('weapon'),off=has('offhand');if(weapon)gearPart(c,weapon.asset,s.torso.x+(west?-11:11),s.waist.y,5,14,west,.25);if(off)gearPart(c,off.asset,s.torso.x+(west?9:-9),s.torso.y+5,10,12,west);}return;}
 for(const item of items){const a=item.asset,slot=item.slot;
  if(slot==='ranged'||slot==='weapon'||slot==='offhand')continue;
  if(slot==='legs'){
   if(s.legs)for(const i of s.legOrder||[0,1])for(const part of legGarmentSegments(s.legs[i]))gearPart(c,a,part.x,part.y,7,part.h,west,part.angle,i,part.slice);
   else for(const [i,f] of s.feet.entries()){const hip={x:s.waist.x+(i?4:-4),y:s.waist.y};const length=Math.max(8,f.y-hip.y-3);gearPart(c,a,(hip.x+f.x)/2,(hip.y+f.y-3)/2,7,length,west,-Math.atan2(f.x-hip.x,length),i);}
  }
  if(slot==='feet')for(const i of s.legOrder||s.feet.map((_,i)=>i)){const f=s.feet[i];gearPart(c,a,f.x,f.y-2.5,9,8,west,f.angle||0);}
 }
 if(body)gearPart(c,body.asset+(back?'Back':''),s.torso.x,s.torso.y+3,s.torso.w+2,s.torso.h,west);
 for(const item of items){const a=item.asset,slot=item.slot;
  if(slot==='head')gearPart(c,a+(back?'Back':''),s.head.x,s.head.y+3,21,13,west,s.headAngle||0);
  if(slot==='shoulders')for(const at of s.shoulders)gearPart(c,a,at.x,at.y,8,6,west);
  if(slot==='neck')gearPart(c,a,s.torso.x,s.torso.y-4,8,6,west);
  if(slot==='waist')gearPart(c,a,s.waist.x,s.waist.y,18,5,west);
  if(slot==='wrists')for(const at of [s.main,s.off])gearPart(c,a,at.x,at.y-2,5,4,west);
  if(slot==='hands')for(const at of [s.main,s.off])gearPart(c,a,at.x,at.y,5,5,west);
  if(slot==='ring1'||slot==='ring2'){const at=slot==='ring1'?s.main:s.off;gearPart(c,a,at.x,at.y,2,2);}
  if(slot==='trinket1'||slot==='trinket2')gearPart(c,a,s.waist.x+(slot==='trinket1'?-7:7),s.waist.y+4,5,7,west);
 }
 const main=p.usingRanged?has('ranged'):has('weapon'),off=p.usingRanged?null:has('offhand');
 if(main){const heavy=main.hands===2,h=heavy?26:main.asset==='whistle'?7:17,w=['potlid','shield'].includes(main.asset)?14:heavy?14:main.asset==='bottle'?6:10;heldPart(c,main.asset,s.main,w,h,west,(west?-1:1)*(p.attack>0?.7:heavy?.65:.12));}
 if(off)gearPart(c,off.asset,s.off.x,s.off.y,off.hands===1?8:15,off.hands===1?17:16,west);
}
