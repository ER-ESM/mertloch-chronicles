import {surface,bounds} from '../sprite-pipeline/png.mjs';

// A two-joint cutout rig, authored in native sprite coordinates. The original
// painted upper body is retained; each leg has its own hip and knee rotation.
// This is an armed walk: hands remain in their ready pose for registered gear.
export const WALK_RIG={version:3,frames:8,stride:20,hipFraction:.67,kneeFraction:.84,stepReach:14,stepLift:6,groundDepth:5};

function layer(source,target,rect,pivot,angle,translation){
 const cosine=Math.cos(angle),sine=Math.sin(angle);
 // Inverse sampling leaves no holes when a painted limb rotates.
 for(let y=Math.max(0,rect.y-36);y<Math.min(target.height,rect.y+rect.h+36);y++)for(let x=Math.max(0,rect.x-36);x<Math.min(target.width,rect.x+rect.w+36);x++){
  const dx=x-translation.x-pivot.x,dy=y-translation.y-pivot.y,sx=Math.round(pivot.x+dx*cosine+dy*sine),sy=Math.round(pivot.y-dx*sine+dy*cosine);
  if(sx<rect.x||sx>=rect.x+rect.w||sy<rect.y||sy>=rect.y+rect.h)continue;
  const i=(sy*source.width+sx)*4;if(source.data[i+3])target.data.set(source.data.subarray(i,i+4),(y*target.width+x)*4);
 }
}
export function rigWalk(source,phase,row,options={}){
 const rig={...WALK_RIG,...options},b=bounds(source),k=source.width/192,split=Math.round(b.x+b.w*.5),hipY=Math.round(b.y+b.h*rig.hipFraction),kneeY=Math.round(b.y+b.h*rig.kneeFraction),direction=row%2?-1:1;
 const target=surface(source.width,source.height),joints=[],layers=[];
 // The body follows a modest two-beat weight shift, never the lowest painted pixel.
 const bodyOffset=Math.round(Math.cos(phase/8*Math.PI*4)*.7*k)/k;
 for(let side=0;side<2;side++){
  const x=side?split:b.x,w=side?b.x+b.w-split:split-b.x,footPixels=[];
  for(let yy=b.y+b.h-10*k;yy<b.y+b.h;yy++)for(let xx=x;xx<x+w;xx++)if(source.data[(Math.floor(yy)*source.width+xx)*4+3])footPixels.push(xx);
  const footX=footPixels.length?footPixels.reduce((a,v)=>a+v,0)/footPixels.length:x+w/2;
  let bottom=b.y+b.h;for(let yy=b.y+b.h-1;yy>kneeY;yy--){let present=false;for(let xx=x;xx<x+w;xx++)if(source.data[(yy*source.width+xx)*4+3])present=true;if(present){bottom=yy+1;break;}}
  const hip={x:split+(side?1:-1)*b.w*.135,y:hipY},knee={x:footX,y:kneeY},ankle={x:footX,y:bottom-2*k};
  const cycle=(phase/8+side*.5)%1,support=cycle<.5;
  const stridePhase=support?1-cycle*4:-Math.cos((cycle-.5)*Math.PI*2);
  const lift=support?0:Math.sin((cycle-.5)*Math.PI*2)*rig.stepLift*k;
  const groundY=b.y+b.h-3*k+(side?1:-1)*k+stridePhase*rig.groundDepth*k*(row>1?-1:1);
  const desired={x:split+(side?1:-1)*4*k+stridePhase*rig.stepReach*k*direction,y:groundY-lift-bodyOffset*k};
  // Solve a two-bone chain toward alternating feet on the projected ground plane.
  // Narrow the authored combat stance before stepping; never stretch a limb.
  const upper=Math.hypot(knee.x-hip.x,knee.y-hip.y),lower=Math.hypot(ankle.x-knee.x,ankle.y-knee.y),distance=Math.hypot(desired.x-hip.x,desired.y-hip.y),d=Math.min(upper+lower-.2*k,Math.max(Math.abs(upper-lower)+.2*k,distance)),ux=(desired.x-hip.x)/distance,uy=(desired.y-hip.y)/distance;
  const along=(upper*upper-lower*lower+d*d)/(2*d),bend=Math.sqrt(Math.max(0,upper*upper-along*along)),nextKnee={x:hip.x+ux*along+uy*bend*direction,y:hip.y+uy*along-ux*bend*direction},nextAnkle={x:hip.x+ux*d,y:hip.y+uy*d};
  const a=Math.atan2(nextKnee.y-hip.y,nextKnee.x-hip.x)-Math.atan2(knee.y-hip.y,knee.x-hip.x),lowerAngle=Math.atan2(nextAnkle.y-nextKnee.y,nextAnkle.x-nextKnee.x)-Math.atan2(ankle.y-knee.y,ankle.x-knee.x),offset={x:nextKnee.x-knee.x,y:nextKnee.y-knee.y};
  const footAngle=support?0:Math.sin((cycle-.5)*Math.PI*2)*direction*.16,footY=bottom-9*k;
  layers.push({side,depth:groundY,paint(){
   layer(source,target,{x,y:hipY-3*k,w,h:kneeY-hipY+5*k},hip,a,{x:0,y:0});
   layer(source,target,{x,y:kneeY-2*k,w,h:Math.max(1,footY-kneeY+4*k)},knee,lowerAngle,offset);
   layer(source,target,{x,y:footY,w,h:bottom-footY},ankle,footAngle,{x:nextAnkle.x-ankle.x,y:nextAnkle.y-ankle.y});
  }});
  joints.push({hip,knee:nextKnee,ankle:nextAnkle,hipAngle:a,kneeAngle:lowerAngle-a,footAngle,stridePhase,support,groundY:groundY/k,side});
 }
 // Draw the farther foot first. Anatomical leg identity remains stable for equipped trousers/boots.
 const order=layers.sort((a,b)=>a.depth-b.depth);for(const l of order)l.paint();
 const groundShift=bodyOffset*k,out=surface(source.width,source.height);
 layer(target,out,{x:0,y:0,w:source.width,h:source.height},{x:0,y:0},0,{x:0,y:groundShift});
 layer(source,out,{x:b.x,y:b.y,w:b.w,h:hipY-b.y+2*k},{x:0,y:0},0,{x:0,y:groundShift});
 const nativeJoints=joints.map(j=>({hip:{x:j.hip.x/k,y:(j.hip.y+groundShift)/k},knee:{x:j.knee.x/k,y:(j.knee.y+groundShift)/k},ankle:{x:j.ankle.x/k,y:(j.ankle.y+groundShift)/k},hipAngle:j.hipAngle,kneeAngle:j.kneeAngle,footAngle:j.footAngle,stridePhase:j.stridePhase,support:j.support,groundY:j.groundY,side:j.side}));
 return {image:out,bodyOffset,joints:nativeJoints,legOrder:order.map(l=>l.side)};
}
