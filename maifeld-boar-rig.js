// One immutable body per direction. Only the four legs change during locomotion.
// 65% ground contact, 35% swing: at least two hooves remain planted at all times.
export function boarFoot(phase){
 const u=((phase%1)+1)%1,stance=.65,reach=2.4;
 if(u<stance)return{x:reach*(1-2*u/stance),lift:0};
 const t=(u-stance)/(1-stance),t2=t*t,t3=t2*t,m=-2*reach*(1-stance)/stance;
 return{x:(2*t3-3*t2+1)*-reach+(t3-2*t2+t)*m+(-2*t3+3*t2)*reach+(t3-t2)*m,lift:1.8*Math.sin(Math.PI*t)**2};
}

export function boarPose(rig,direction,distance=0,moving=true,action=null){
 const view=rig.directions.find(d=>d.id===direction)||rig.directions[0];
 const east=view.id.endsWith('e')?1:-1,phase=distance/rig.stride;
 // Explicit one-shot lunge/recoil. Walking itself never changes the body image or its angle.
 const pulse=action?Math.sin(Math.PI*Math.max(0,Math.min(1,action.progress))):0;
 const bodyX=action?.kind==='attack'?pulse*2*east:action?.kind==='hit'?-pulse*east:action?.kind==='cast'?pulse*.6*east:0;
 return{body:{...view.parts.body,x:bodyX,y:0},legs:['farRear','farFront','nearRear','nearFront'].map(name=>{
  const p=view.parts[name],foot=moving?boarFoot(phase+p.phase):{x:0,lift:0};
  // Keep roots attached; transform each whole leg towards its continuous hoof position.
  const weight=typeof moving==='number'?moving:1,dx=foot.x*east*weight,dy=p.rect.h-foot.lift*weight;
  return{...p,name,x:bodyX,angle:-Math.atan2(dx,dy),scaleY:Math.hypot(dx,dy)/p.rect.h,foot:{x:p.at.x+dx+bodyX,y:p.at.y+dy,planted:foot.lift===0}};
 })};
}

export function drawBoar(c,image,rig,{direction='se',distance=0,moving=false,action=null},x,y,height){
 const pose=boarPose(rig,direction,distance,moving,action),scale=height/rig.height;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round((x-rig.pivot.x*scale)*2)/2,Math.round((y-rig.pivot.y*scale)*2)/2);c.scale(scale,scale);
 for(const leg of pose.legs){
  const r=leg.rect;c.save();c.translate(leg.at.x+leg.x,leg.at.y);c.rotate(leg.angle);c.scale(1,leg.scaleY);
  c.drawImage(image,r.x,r.y,r.w,r.h,-leg.pivot.x,-leg.pivot.y,r.w,r.h);c.restore();
 }
 const body=pose.body,r=body.rect;c.drawImage(image,r.x,r.y,r.w,r.h,body.at.x+body.x,body.at.y+body.y,r.w,r.h);c.restore();
}
