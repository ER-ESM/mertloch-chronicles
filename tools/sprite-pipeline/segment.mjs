// Detection only: source pixels are preserved. Grid prompts are hints, not crop boxes.
export function segment(image,cols,rows){const {width:w,height:h,data}=image,seen=new Uint8Array(w*h),queue=new Int32Array(w*h),pieces=[];
 for(let start=0;start<w*h;start++){if(seen[start]||data[start*4+3]<128)continue;let head=0,tail=1,minX=w,minY=h,maxX=0,maxY=0,sx=0,sy=0;queue[0]=start;seen[start]=1;
  while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);sx+=x;sy+=y;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const nx=x+ox,ny=y+oy,j=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||seen[j]||data[j*4+3]<128)continue;seen[j]=1;queue[tail++]=j;}}
  if(tail>=12)pieces.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,count:tail,cx:sx/tail,cy:sy/tail});
 }
 const cells=Array.from({length:cols*rows},()=>[]);for(const p of pieces){const col=Math.min(cols-1,Math.max(0,Math.floor(p.cx/w*cols))),row=Math.min(rows-1,Math.max(0,Math.floor(p.cy/h*rows)));cells[row*cols+col].push(p);}
 return cells.map((parts,index)=>{if(!parts.length)throw Error('Missing subject '+index);const main=parts.filter(p=>p.count>500);if(main.length!==1)throw Error('Ambiguous subject '+index+': '+main.length+' major components');const core=main[0],near=parts.filter(p=>Math.hypot(p.cx-core.cx,p.cy-core.cy)<Math.max(core.w,core.h)*.7),x=Math.min(...near.map(p=>p.x)),y=Math.min(...near.map(p=>p.y)),right=Math.max(...near.map(p=>p.x+p.w)),bottom=Math.max(...near.map(p=>p.y+p.h));return{x,y,w:right-x,h:bottom-y,count:near.reduce((n,p)=>n+p.count,0),pieces:near.length};});
}
