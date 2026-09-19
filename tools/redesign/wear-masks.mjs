import {legMaterial} from './walk-rig.mjs';

const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
function runs(mask){const out=[];for(let y=0;y<192;y++){let x=0;while(x<192){while(x<192&&!mask[y*192+x])x++;const a=x;while(x<192&&mask[y*192+x])x++;if(x>a)out.push([y,a,x-a]);}}return out;}
/** Body-space material masks; every selected texel is owned by the active pose. */
export function wearMasks(frame,sockets,hero,joints){
 const masks=Object.fromEntries(['legs','feet','hands','wrists'].map(k=>[k,new Uint8Array(192*192)]));
 const hands=[sockets.main,sockets.off],wrists=hands.map(hand=>{const shoulder=sockets.shoulders.reduce((a,b)=>Math.hypot(a.x-hand.x,a.y-hand.y)<Math.hypot(b.x-hand.x,b.y-hand.y)?a:b),len=Math.hypot(shoulder.x-hand.x,shoulder.y-hand.y)||1;return [{x:hand.x+(shoulder.x-hand.x)*4/len,y:hand.y+(shoulder.y-hand.y)*4/len},{x:hand.x+(shoulder.x-hand.x)*8/len,y:hand.y+(shoulder.y-hand.y)*8/len}];});
 for(let y=0;y<192;y++)for(let x=0;x<192;x++){
  const i=(y*192+x)*4,[r,g,b,a]=frame.data.subarray(i,i+4);if(!a)continue;const p={x,y},skin=r>105&&r>g*1.16&&g>b*1.08;
  if(hands.some(h=>Math.hypot(x-h.x,y-h.y)<4.8)&&skin)masks.hands[y*192+x]=1;
  if(wrists.some(([a,b])=>distance(p,a,b)<2.8))masks.wrists[y*192+x]=1;
  const boot=sockets.feet.some(f=>Math.abs(x-f.x)<9&&y>f.y-11&&y<=f.y+4);
  if(boot)masks.feet[y*192+x]=1;
  const withinLeg=joints?joints.some(j=>distance(p,j.hip,j.knee)<9||distance(p,j.knee,j.ankle)<8):y>=sockets.waist.y-4;
  if(withinLeg&&!boot&&y>sockets.waist.y-8&&legMaterial(r,g,b,hero))masks.legs[y*192+x]=1;
 }
 return Object.fromEntries(Object.entries(masks).map(([key,mask])=>[key,runs(mask)]));
}
