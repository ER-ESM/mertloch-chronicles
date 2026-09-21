// Dedicated transparent resource art, independent of talent icon atlases.
export const mechanicArt={catalog:null,images:new Map()};
let pending;
export function loadMechanicArt(){return pending||=(async()=>{
 try{
  const r=await fetch('./assets/class-mechanics/runtime/catalog.json');if(!r.ok)return;
  const catalog=await r.json();
  const images=await Promise.all(Object.keys(catalog.atlases).map(path=>new Promise(resolve=>{
   const im=new Image();im.onload=()=>resolve([path,im]);im.onerror=()=>resolve([path,null]);im.src='./'+path;
  })));
  mechanicArt.catalog=catalog;mechanicArt.images=new Map(images.filter(([,im])=>im));
 }catch{/* The readable HUD and existing talent emblem remain available offline. */}
})();}
export function paintMechanicSprite(c,spec,variant,x,y,w,h){
 const a=mechanicArt.catalog?.sprites[spec+'/'+variant],im=a&&mechanicArt.images.get(a.atlas);if(!im)return false;
 const scale=Math.min(w/a.w,h/a.h),dw=Math.round(a.w*scale),dh=Math.round(a.h*scale);
 c.drawImage(im,a.x,a.y,a.w,a.h,Math.round(x+(w-dw)/2),Math.round(y+(h-dh)/2),dw,dh);return true;
}
