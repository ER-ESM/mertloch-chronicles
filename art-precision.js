const read=async p=>(await fetch(p)).json();
const [old,now]=await Promise.all([read('./assets/content-art/handoff-catalog.json'),read('./assets/precision/runtime/catalog.json')]);
const image=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error(src));i.src=src;});
const previews=[];
for(const[id,a]of Object.entries(now.assets)){
 const before=old.assets[id],images=await Promise.all([before?image(before.path):null,image(a.path)]),el=document.createElement('article');el.dataset.kind=a.kind;el.dataset.id=id;el.innerHTML='<strong></strong><canvas width="400" height="280"></canvas><p></p>';el.querySelector('strong').textContent=id;el.querySelector('p').textContent=(before?before.width+'×'+before.height+' → ':'')+a.width+'×'+a.height+' · '+(a.nativeHeight?a.nativeHeight+' Körperpixel':'Präzisionsexport');document.querySelector('#gallery').append(el);previews.push({id,a,before,images,cv:el.querySelector('canvas'),el});
}
const filter=()=>{for(const p of previews)p.el.hidden=p.a.kind!==document.querySelector('#kind').value;};document.querySelector('#kind').onchange=filter;filter();
function render(t){const row=+document.querySelector('#direction').value,z=+document.querySelector('#zoom').value,animate=document.querySelector('#animate').checked;
 for(const p of previews){if(p.el.hidden)continue;const c=p.cv.getContext('2d');c.clearRect(0,0,400,280);c.imageSmoothingEnabled=false;for(let side=0;side<2;side++){
  const a=side?p.a:p.before,im=p.images[side];if(!a||!im)continue;
  if(a.frames){const n=a.columns.length,col=animate?Math.floor(t/130)%n:0,f=a.frames[row*n+col],k=a.worldHeight/a.nativeHeight*2*z;c.drawImage(im,f.x,f.y,a.frameSize,a.frameSize,side*200+100-a.pivot.x*k,250-a.pivot.y*k,a.frameSize*k,a.frameSize*k);}
  else{const size=Math.min(160,48*z),k=size/Math.max(a.width,a.height);c.drawImage(im,side*200+100-a.width*k/2,140-a.height*k/2,a.width*k,a.height*k);}
 }c.fillStyle='#f8f0d5';c.font='12px sans-serif';c.fillText('Bisher',12,20);c.fillText('Präzise',212,20);}
 requestAnimationFrame(render);
}requestAnimationFrame(render);window.precisionReview={assets:previews.length,catalog:now};
