import {surface,bounds} from '../sprite-pipeline/png.mjs';

// Contact, down, passing, up; then the opposite supporting leg.
// Continuous mesh strips share vertices at knees and ankles.
export const WALK_RIG={version:4,frames:8,stride:80,hipFraction:.66,kneeFraction:.83,stepReach:10,stepLift:7,groundDepth:3.5};
const mix=(a,b,t)=>a+(b-a)*t;
const point=(a,b,t)=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)});
function convexHull(points){
 const pts=points.sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),low=[],high=[];
 for(const p of pts){while(low.length>1&&cross(low.at(-2),low.at(-1),p)<=0)low.pop();low.push(p);}
 for(const p of [...pts].reverse()){while(high.length>1&&cross(high.at(-2),high.at(-1),p)<=0)high.pop();high.push(p);}return [...low.slice(0,-1),...high.slice(0,-1)];
}
function inside(p,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
function connectedBody(source){
 const visited=new Uint8Array(source.width*source.height),groups=[];
 for(let start=0;start<visited.length;start++){if(visited[start]||!source.data[start*4+3])continue;const queue=[start];visited[start]=1;for(let n=0;n<queue.length;n++){const p=queue[n],x=p%source.width,y=Math.floor(p/source.width);for(let yy=Math.max(0,y-1);yy<=Math.min(source.height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(source.width-1,x+1);xx++){const q=yy*source.width+xx;if(!visited[q]&&source.data[q*4+3]){visited[q]=1;queue.push(q);}}}groups.push(queue);}
 const largest=groups.sort((a,b)=>b.length-a.length)[0],out=surface(source.width,source.height);for(const p of largest||[])out.data.set(source.data.subarray(p*4,p*4+4),p*4);return out;
}
function triangle(source,target,uv,xy){
 const [a,b,c]=xy,den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<.001)return;
 const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(target.width-1,Math.ceil(Math.max(a.x,b.x,c.x))),y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(target.height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/den,v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/den,w=1-u-v;if(u<-.0001||v<-.0001||w<-.0001)continue;
  const sx=Math.round(uv[0].x*u+uv[1].x*v+uv[2].x*w),sy=Math.round(uv[0].y*u+uv[1].y*v+uv[2].y*w);if(sx<0||sy<0||sx>=source.width||sy>=source.height)continue;
  const i=(sy*source.width+sx)*4;if(source.data[i+3])target.data.set(source.data.subarray(i,i+4),(y*target.width+x)*4);
 }
}
function strip(source,target,sourcePoints,targetPoints,x0,x1,footAngle=0){
 for(let n=0;n<sourcePoints.length-1;n++){
  const a=sourcePoints[n],b=sourcePoints[n+1],p=targetPoints[n],q=targetPoints[n+1];
  const uv=[{x:x0,y:a.y},{x:x1,y:a.y},{x:x1,y:b.y},{x:x0,y:b.y}],xy=[{x:p.x+x0-a.x,y:p.y},{x:p.x+x1-a.x,y:p.y},{x:q.x+x1-b.x,y:q.y},{x:q.x+x0-b.x,y:q.y}];
  if(footAngle){const ankle=targetPoints[3],top=sourcePoints[2].y,end=sourcePoints[3].y;for(let i=0;i<4;i++){const angle=footAngle*Math.max(0,Math.min(1,(uv[i].y-top)/(end-top))),dx=xy[i].x-ankle.x,dy=xy[i].y-ankle.y;xy[i]={x:ankle.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:ankle.y+dx*Math.sin(angle)+dy*Math.cos(angle)};}}
  triangle(source,target,[uv[0],uv[1],uv[2]],[xy[0],xy[1],xy[2]]);triangle(source,target,[uv[0],uv[2],uv[3]],[xy[0],xy[2],xy[3]]);
 }
}
/** Select material ownership before deformation, never from moving bounds. */
export function legMaterial(r,g,b,hero){
 if(hero==='anni')return r<115&&g>r*.78&&b<g*1.15;
 if(hero==='dieter')return b>r*.72&&g>r*.78&&r<160;
 if(hero==='kevin')return r<135&&g>r*.78&&b<g*1.3;
 return true;
}
export function rigWalk(source,phase,row,options={}){
 if(options.hero)source=connectedBody(source);
 const rig={...WALK_RIG,...options},b=bounds(source),k=source.width/192,split=Math.round(b.x+b.w*.5),hipY=Math.round(b.y+b.h*rig.hipFraction),kneeY=Math.round(b.y+b.h*rig.kneeFraction),direction=row%2?-1:1;
 const body=surface(source.width,source.height);body.data.set(source.data);const out=surface(source.width,source.height),ownership=surface(source.width,source.height),joints=[],parts=[];
 const bodyOffset=[0,1,0,-1,0,1,0,-1][phase%8],bodySway=Math.sin(phase/8*Math.PI*2)*.6;
 const bodyTransform=p=>{let dx=bodySway,dy=bodyOffset;for(const hand of rig.sockets?[rig.sockets.main,rig.sockets.off]:[]){const weight=Math.exp(-((p.x-hand.x)**2+(p.y-hand.y)**2)/90),swing=rig.heavy?Math.sin(phase/8*Math.PI*2)*.45:(hand.x<split/k?-1:1)*direction*Math.cos(phase/8*Math.PI*2)*2.2;dx+=weight*swing;dy+=weight*swing*.2;}return {x:p.x+dx,y:p.y+dy};};
 for(let side=0;side<2;side++){
  const x0=side?split:b.x,x1=side?b.x+b.w:split,leg=surface(source.width,source.height),labels=surface(source.width,source.height);
  let bottom=hipY;for(let y=hipY;y<b.y+b.h;y++)for(let x=x0;x<x1;x++)if(source.data[(y*source.width+x)*4+3])bottom=Math.max(bottom,y+1);
  const bootY=Math.min(bottom-4*k,Math.max(kneeY+k,bottom-12*k));
  const protectedPixels=new Uint8Array(source.width*source.height),seeds=[];
  if(rig.hero)for(let y=hipY;y<bootY;y++)for(let x=x0;x<x1;x++){
   const i=(y*source.width+x)*4,[r,g,blue,alpha]=source.data.subarray(i,i+4);
   if(x>b.x+b.w*.3&&x<b.x+b.w*.8&&y<b.y+b.h*.8&&alpha&&r>150&&((r>g*1.2&&g>blue*1.13)||(r>180&&g>155&&blue>115)))for(const dx of [-2*k,2*k])for(const dy of [-2*k,2*k])seeds.push({x:x+dx,y:y+dy});
  }
  const apron=convexHull(seeds);if(apron.length>2)for(let y=hipY;y<bootY;y++)for(let x=x0;x<x1;x++)if(inside({x,y},apron))protectedPixels[y*source.width+x]=1;
  // Aprons, hands and ornaments remain in front of the moving thighs.
  for(let y=hipY;y<bottom;y++)for(let x=x0;x<x1;x++){
   const i=(y*source.width+x)*4,[r,g,blue,alpha]=source.data.subarray(i,i+4);if(!alpha)continue;
   if(protectedPixels[y*source.width+x]||(rig.sockets&&[rig.sockets.main,rig.sockets.off].some(h=>Math.hypot(x/k-h.x,y/k-h.y)<6)))continue;
   leg.data.set(source.data.subarray(i,i+4),i);body.data.fill(0,i,i+4);
   labels.data.set(y>=bootY?[0,0,255,255]:[255,0,0,255],i);
  }
  const center=(y,radius,fallback)=>{let sum=0,count=0;for(let yy=Math.max(hipY,Math.round(y-radius));yy<Math.min(bottom,y+radius+1);yy++)for(let x=x0;x<x1;x++)if(leg.data[(yy*source.width+x)*4+3]){sum+=x;count++;}return count?sum/count:fallback;};
  const ankle={x:center(bottom-3*k,2*k,(x0+x1)/2),y:bottom-3*k},knee={x:center(kneeY,2*k,ankle.x),y:kneeY},hip={x:split+(side?1:-1)*b.w*.12,y:hipY};
  const cycle=(phase/8+side*.5)%1,support=cycle<.5,stridePhase=support?1-cycle*4:-Math.cos((cycle-.5)*Math.PI*2),lift=support?0:Math.sin((cycle-.5)*Math.PI*2)*rig.stepLift*k;
  const groundY=b.y+b.h-3*k+(side?1:-1)*1.2*k+stridePhase*rig.groundDepth*k*(row>1?-1:1);
  const nextHip={x:hip.x+bodySway*k,y:hip.y+bodyOffset*k},nextAnkle={x:split+(side?1:-1)*4*k+stridePhase*rig.stepReach*k*direction,y:groundY-lift};
  const nextKnee=point(nextHip,nextAnkle,(knee.y-hip.y)/(ankle.y-hip.y));
  nextKnee.x+=direction*(support?1:4)*k*Math.sin(cycle*Math.PI*2)**2;
  const footTop={x:mix(knee.x,ankle.x,(bootY-knee.y)/(ankle.y-knee.y)),y:bootY},nextFootTop=point(nextKnee,nextAnkle,(bootY-knee.y)/(ankle.y-knee.y));
  const footAngle=support?0:-direction*.12*Math.sin((cycle-.5)*Math.PI*2);
  const sourcePoints=[hip,knee,footTop,ankle,{x:ankle.x,y:bottom}],targetPoints=[nextHip,nextKnee,nextFootTop,nextAnkle,{x:nextAnkle.x,y:nextAnkle.y+3*k}];
  const painted=surface(source.width,source.height),paintedLabels=surface(source.width,source.height);strip(leg,painted,sourcePoints,targetPoints,x0,x1,footAngle);strip(labels,paintedLabels,sourcePoints,targetPoints,x0,x1,footAngle);
  parts.push({side,depth:groundY,image:painted,labels:paintedLabels});
  const normalize=p=>({x:p.x/k,y:p.y/k});
  joints.push({hip:normalize(nextHip),knee:normalize(nextKnee),ankle:normalize(nextAnkle),hipAngle:Math.atan2(nextKnee.x-nextHip.x,nextKnee.y-nextHip.y),kneeAngle:Math.atan2(nextAnkle.x-nextKnee.x,nextAnkle.y-nextKnee.y),footAngle,stridePhase,support,groundY:groundY/k,side});
 }
 const order=parts.sort((a,b)=>a.depth-b.depth);
 for(const part of order)for(let i=0;i<out.data.length;i+=4)if(part.image.data[i+3]){out.data.set(part.image.data.subarray(i,i+4),i);ownership.data.set(part.labels.data.subarray(i,i+4),i);}
 const movedBody=surface(source.width,source.height),step=6*k;
 for(let y=0;y<source.height;y+=step)for(let x=0;x<source.width;x+=step){const uv=[{x,y},{x:Math.min(source.width,x+step),y},{x:Math.min(source.width,x+step),y:Math.min(source.height,y+step)},{x,y:Math.min(source.height,y+step)}],xy=uv.map(p=>{const q=bodyTransform({x:p.x/k,y:p.y/k});return{x:q.x*k,y:q.y*k};});triangle(body,movedBody,[uv[0],uv[1],uv[2]],[xy[0],xy[1],xy[2]]);triangle(body,movedBody,[uv[0],uv[2],uv[3]],[xy[0],xy[2],xy[3]]);}
 for(let i=0;i<out.data.length;i+=4)if(movedBody.data[i+3]){out.data.set(movedBody.data.subarray(i,i+4),i);ownership.data.fill(0,i,i+4);}
 const wearRuns={legs:[],feet:[]};for(const [slot,channel]of [['legs',0],['feet',2]])for(let y=0;y<192;y++){let x=0;const owns=x=>ownership.data[(Math.min(source.height-1,Math.floor((y+.5)*k))*source.width+Math.min(source.width-1,Math.floor((x+.5)*k)))*4+channel];while(x<192){while(x<192&&!owns(x))x++;const start=x;while(x<192&&owns(x))x++;if(x>start)wearRuns[slot].push([y,start,x-start]);}}
 return {image:out,bodyOffset,bodySway,joints,legOrder:order.map(l=>l.side),wearRuns,bodyTransform};
}
