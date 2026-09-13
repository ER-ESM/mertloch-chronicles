import {loadAperolArt,aperolArt} from './aperol-art.js';
// Sprite import and anchoring contract. Original source PNGs remain untouched.
// Some atlas exporters bake their transparency preview into RGB. The importer
// treats edge-connected neutral preview pixels as a colour key, never scenery.
export const maifeld={};
const definitions={nature:{cols:3,rows:2,names:['oak','spruce','apple','rocks','supplies','tent']},buildings:{cols:3,rows:2,names:['cottage','tavern','thatch','church','barn','shop']},people:{cols:6,rows:2,names:['dieter','baerbel','kevin','ida','warden','horst','dieterWalk','baerbelWalk','kevinWalk','idaWalk','wardenWalk','horstWalk']},life:{cols:4,rows:3,names:['boar','badger','goose','chicken','cat','bench','cart','fountain','board','mara','lauti','elder']}};
let pending;
definitions.ground={cols:2,rows:2,raw:true,names:['groundGrass','groundPaving','groundDirt','groundMeadow']};
export function loadMaifeldArt(){return pending||=Promise.all(Object.entries(definitions).map(([name,def])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{importSheet(img,def);resolve();};img.onerror=()=>resolve();img.src=(name==='people'?'./assets/maifeld-rpg/':'./assets/maifeld-09/')+name+'.png';}))).then(async()=>{await loadAperolArt();maifeld.baerbel=aperolArt.hero[0];maifeld.baerbelWalk=aperolArt.hero[1];});}
function importSheet(img,def){
 if(def.raw){def.names.forEach((name,i)=>{maifeld[name]={image:img,x:i%def.cols*img.width/def.cols,y:Math.floor(i/def.cols)*img.height/def.rows,w:img.width/def.cols,h:img.height/def.rows};});return;}
 const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);
 const im=c.getImageData(0,0,cv.width,cv.height),d=im.data,W=cv.width,H=cv.height;
 const neutral=i=>{const r=d[i*4],g=d[i*4+1],b=d[i*4+2];return d[i*4+3]<32||(Math.max(r,g,b)-Math.min(r,g,b)<24&&Math.min(r,g,b)>170);};
 const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let head=0,tail=0;
 const add=i=>{if(!seen[i]&&neutral(i)){seen[i]=1;queue[tail++]=i;}};
 for(let x=0;x<W;x++){add(x);add((H-1)*W+x);}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1);}
 while(head<tail){const i=queue[head++],x=i%W,y=Math.floor(i/W);d[i*4+3]=0;if(x)add(i-1);if(x<W-1)add(i+1);if(y)add(i-W);if(y<H-1)add(i+W);}
 // Tree crown holes also use the exporter's preview key, but are enclosed by branches.
 if(def.names[0]==='oak')for(let i=0;i<W*Math.min(595,H);i++)if(neutral(i))d[i*4+3]=0;
 // Pure white holes between bench slats and ironwork belong to the white export key.
 if(def.names[0]==='boar')for(let i=0;i<W*H;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];if(Math.min(r,g,b)>244&&Math.max(r,g,b)-Math.min(r,g,b)<8)d[i*4+3]=0;}
 c.putImageData(im,0,0);
 if(def.names[0]==='cottage')maifeld.lantern={image:cv,x:38,y:268,w:44,h:84};
 for(let index=0;index<def.names.length;index++){
  const col=index%def.cols,row=Math.floor(index/def.cols);
  const xEdges=def.names[0]==='oak'?[0,570,1000,W]:def.names[0]==='dieter'?[0,276,550,764,1024,1262,W]:Array.from({length:def.cols+1},(_,i)=>Math.round(i*W/def.cols));
  const yEdges=def.names[0]==='oak'?[0,595,H]:def.names[0]==='cottage'?[0,476,H]:def.names[0]==='dieter'?[0,524,H]:def.names[0]==='boar'?[0,341,622,H]:Array.from({length:def.rows+1},(_,i)=>Math.round(i*H/def.rows));
  const name=def.names[index],left=name==='baerbelWalk'?266:xEdges[col],right=name==='dieterWalk'?266:xEdges[col+1],top=name==='elder'?638:yEdges[row],bottom=yEdges[row+1];let x0=right,y0=bottom,x1=left,y1=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(d[(y*W+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x1<x0)continue;maifeld[def.names[index]]={image:cv,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
 }
}
const mipmaps=new Map();
const groundTiles=new Map();
export function fillMaifeldGround(c,name,x,y,w,h,alpha=1){const a=maifeld[name];if(!a)return false;let tile=groundTiles.get(name);if(!tile){const size=128;tile=document.createElement('canvas');tile.width=tile.height=size*2;const tc=tile.getContext('2d');tc.imageSmoothingEnabled=true;tc.imageSmoothingQuality='high';for(let row=0;row<2;row++)for(let col=0;col<2;col++){tc.save();tc.translate(col?size*2:0,row?size*2:0);tc.scale(col?-1:1,row?-1:1);tc.drawImage(a.image,a.x,a.y,a.w,a.h,0,0,size,size);tc.restore();}groundTiles.set(name,tile);}c.save();c.globalAlpha*=alpha;c.fillStyle=c.createPattern(tile,'repeat');c.fillRect(x,y,w,h);c.restore();return true;}
export function drawMaifeld(c,name,x,y,height,width=null,anchor=.5){const a=maifeld[name];if(!a)return false;const h=Math.max(1,Math.round(height)),w=Math.max(1,Math.round(width??h*a.w/a.h)),key=name+':'+w+':'+h;let mip=mipmaps.get(key);if(!mip){mip=document.createElement('canvas');mip.width=w*2;mip.height=h*2;const mc=mip.getContext('2d');mc.imageSmoothingEnabled=true;mc.imageSmoothingQuality='high';mc.drawImage(a.image,a.x,a.y,a.w,a.h,0,0,mip.width,mip.height);mipmaps.set(key,mip);if(mipmaps.size>900)mipmaps.delete(mipmaps.keys().next().value);}c.drawImage(mip,Math.round(x-w*anchor),Math.round(y-h),w,h);return true;}
