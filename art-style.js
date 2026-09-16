// Shared Maifeld palette and native pixel density; originals remain untouched.
export const DETAIL_PALETTE=["242333","413440","67463e","926044","b67b50","dda071","f4c698","ffe6bb","f8f0d5","c8c5af","898c83","526d76","334d59","243841","354b36","55704a","849451","bac475","953d32","ce5d31","ec8b36","f3b84b","95653e","634b37","171f29","364047","786259","9f806d","d49779","edb495","fff2d6","d9d7c2","aaab98","719090","456476","768a67","a6ac80","b74724","e57438","ffd274"];
const palette=DETAIL_PALETTE.map(h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))),colors=new Map();
const worldPalette=[...palette];for(let i=0;i<palette.length;i++)for(let j=i+1;j<palette.length;j++){const a=palette[i],b=palette[j];if(Math.hypot(...a.map((v,k)=>v-b[k]))<95)worldPalette.push(a.map((v,k)=>Math.round((v+b[k])/2)));}
export function normalizeArt(canvas,world=false){
 const c=canvas.getContext('2d',{willReadFrequently:true}),im=c.getImageData(0,0,canvas.width,canvas.height),d=im.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<64){d[i+3]=0;continue;}const r=d[i]>>3,g=d[i+1]>>3,b=d[i+2]>>3,key=(world?32768:0)+r*1024+g*32+b;let p=colors.get(key);if(!p){let score=Infinity;for(const q of world?worldPalette:palette){const green=g>r*1.06&&g>b*1.1;if(green&&!(q[1]>=q[0]*.98&&q[1]>q[2]*1.1))continue;const s=(r*8-q[0])**2*.8+(g*8-q[1])**2+(b*8-q[2])**2*.7;if(s<score){p=q;score=s;}}colors.set(key,p);}d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255;}
 c.putImageData(im,0,0);return canvas;
}
const cache=new WeakMap();
export function styledSprite(image,x,y,w,h,width,height=width){
 let entries=cache.get(image);if(!entries){entries=new Map();cache.set(image,entries);}width=Math.max(1,Math.round(width));height=Math.max(1,Math.round(height));const key=[x,y,w,h,width,height].join(':');let cv=entries.get(key);if(cv)return cv;
 cv=document.createElement('canvas');cv.width=width;cv.height=height;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,x,y,w,h,0,0,width,height);normalizeArt(cv);entries.set(key,cv);if(entries.size>600)entries.delete(entries.keys().next().value);return cv;
}
export function styleIcon(canvas){const copy=document.createElement('canvas');copy.width=copy.height=32;const cc=copy.getContext('2d');cc.drawImage(canvas,0,0,32,32);normalizeArt(copy);const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;c.drawImage(copy,0,0,canvas.width,canvas.height);}
