import {loadClassVisuals,drawClassObject,drawClassEffect,drawClassLink} from './class-visual-art.js';
let art,pending;
export const classWorldReady=()=>!!art;
export function loadE32WorldArt(){return pending||=(async()=>{try{art=await loadClassVisuals();const r=await fetch('./assets/content-art/e32/runtime/effects.json');if(!r.ok)return;const extra=await r.json();const image=await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src='./'+extra.path;});if(image){art.images[extra.path]=image;for(const [id,e] of Object.entries(extra.effects))art.catalog.effects[id]={...e,atlas:extra.path};}}catch{}})();}
export function emitClassVisual(g,kind,x,y,extra={}){g.effect?.('classFx',x,y,{kind,life:.8,max:.8,...extra});}
const objectId=z=>z.kind==='fass'?'barrel-'+z.sort:z.kind==='robbi'?'dosen-robbi':z.kind==='nest'?'gisela-nest':null;
export function drawClassField(c,z,time){
 if(!art)return false;const id=objectId(z);
 if(z.kind==='spores'){c.save();c.globalAlpha*=.6;drawClassEffect(c,art,'spore-cloud',z.x,z.y-5,(time*.65)%1,Math.min(80,z.radius*1.4));c.restore();return true;}
 if(!id)return false;
 const state=z.kind==='fass'?(Math.floor(time*4)%2?'active-a':'active-b'):z.kind==='robbi'?(z.visualFireUntil>time?'fire':'idle'):z.honked?'honk':Math.floor(time*2)%2?'idle-a':'idle-b';
 drawClassObject(c,art,id,state,z.x,z.y);
 const fraction=Math.max(0,Math.min(1,z.remaining/(z.visualDuration||z.remaining||1)));
 c.save();c.strokeStyle='#e8c77e';c.lineWidth=.9;c.beginPath();c.arc(z.x,z.y+5,3,-Math.PI/2,-Math.PI/2+fraction*Math.PI*2);c.stroke();
 if(z.kind==='robbi'){c.fillStyle='#172d24';c.fillRect(z.x-10,z.y-31,20,2);c.fillStyle='#a4c38c';c.fillRect(z.x-10,z.y-31,20*Math.max(0,Math.min(1,z.hp/(z.visualMaxHp||300))),2);}c.restore();return true;
}
export function drawClassWorldFx(c,f){
 if(!art)return false;const progress=1-f.life/f.max;
 if(f.type==='chain'){drawClassLink(c,art,f.from,{x:f.x,y:f.y-10},progress);return true;}
 if(f.type!=='classFx')return false;
 if(f.object){const e={kind:f.object,sort:f.sort},id=objectId(e);if(id)drawClassObject(c,art,id,f.object==='robbi'?(progress<.35?'overload':'scrap'):f.object==='nest'?'honk':'spent',f.x,f.y,Math.min(1,(1-progress)*3));}
 if(f.kind==='spore-transfer'){const u=Math.min(1,progress*1.5),from=f.from;for(let i=0;i<4;i++){const t=Math.max(0,u-i*.07);drawClassEffect(c,art,'mold-spread',from.x+(f.x-from.x)*t,from.y+(f.y-from.y)*t-12-Math.sin(t*Math.PI)*8,.3,9+i*2);}return true;}
 if(art.catalog.effects[f.kind])drawClassEffect(c,art,f.kind,f.x,f.y+(f.offsetY??-15),progress,f.size||42);
 return true;
}
