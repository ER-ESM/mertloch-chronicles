import {styledSprite} from './art-style.js';
import {fitMotif} from './icon-fit.js';
import {drawDetailedHero} from './detailed-hero-art.js';
import {drawEquipmentIcon} from './live-art.js';
import {loadAperolArt,drawAperolIcon} from './aperol-art.js';
import {loadDetailArt,drawDetailIcon} from './detail-art.js';
import {drawContentIcon,contentAsset,loadContentArt,contentActor,contentFrame} from './content-art.js';
// Bildschirmsymbole der Lieferung 2026-09-17: Reiter des Clanbuchs und HUD.
// Beschriftungen, Titel und Tastenhinweise bleiben unberührt; fehlt ein Bild, malt der alte Weg.
const CONTENT_ICONS={base:'ui-tab-bude',person:'ui-tab-figur',talents:'ui-tab-talente',bag:'ui-tab-rucksack',book:'ui-tab-kniffe',quest:'ui-tab-auftraege',map:'ui-tab-karte',guide:'ui-tab-hilfe',menu:'ui-menu',sound:'ui-sound',fullscreen:'ui-fullscreen',reward:'ui-reward',elite:'ui-elite-badge',lock:'ui-chapter-lock'};
const contentIcon=id=>CONTENT_ICONS[id]||(contentAsset(id)?id:null);
// Ohne Lieferung fällt der neue Reiter „Hilfe“ auf das alte Buchsymbol zurück.
const FALLBACK_ICONS={guide:'book',lock:'quest',elite:'mark'};
const names=['bottle','coat','boots','ring','food','water','scrap','cable','paper','reinforced','coins','bag','book','map','quest','person','menu','sound','speaker','dash','shield','mark','burst','interrupt'];
const sprites=new Map();let pending;
export function loadUiArt(){return pending||=Promise.all([loadContentArt(),loadDetailArt(),loadAperolArt(),new Promise(resolve=>{const image=new Image();image.onload=()=>{const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,cv.width,cv.height),d=pixels.data;
 // The original PNG is preserved. Neutral export-preview squares are excluded at import,
 // including enclosed holes in the cable, ring and music note.
 for(let i=0;i<d.length;i+=4)if(Math.min(d[i],d[i+1],d[i+2])>185&&Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])<19)d[i+3]=0;c.putImageData(pixels,0,0);
 const cw=cv.width/6,ch=cv.height/4;names.forEach((name,index)=>{const left=Math.floor(index%6*cw)+4,top=Math.floor(index/6)*ch+4,right=left+cw-8,bottom=top+ch-8;let x0=right,y0=bottom,x1=left,y1=top;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(d[(y*cv.width+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}sprites.set(name,{image:cv,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1});});resolve();};image.onerror=()=>resolve();image.src='./assets/maifeld-ui-011/icons.png';})]);}
export function drawUiSprite(c,id,x,y,size){const content=contentIcon(id);if(content&&drawContentIcon(c,content,x,y,size))return true;if(drawEquipmentIcon(c,id,x,y,size))return true;if(id==='anni-spray')return drawAperolIcon(c,'talents',10,x,y,size);if(drawDetailIcon(c,id,x,y,size))return true;const a=sprites.get(id)||sprites.get(FALLBACK_ICONS[id]);if(!a)return false;const s=size/Math.max(a.w,a.h),w=a.w*s,h=a.h*s;c.save();c.imageSmoothingEnabled=false;c.drawImage(styledSprite(a.image,a.x,a.y,a.w,a.h,Math.round(w),Math.round(h)),Math.round(x+(size-w)/2),Math.round(y+(size-h)/2),Math.round(w),Math.round(h));c.restore();return true;}
/** UI-Symbol malen; in Clanbuch-Reitern und Menüleiste randfüllend eingepasst (icon-fit.js). */
export function paintUiIcon(canvas,id){const r=paintUiIconRaw(canvas,id);if(canvas.closest?.('.book-tabs,.game-menu-rail'))fitMotif(canvas,.96);return r;}
function paintUiIconRaw(canvas,id){const content=contentIcon(id);if(content&&contentAsset(content)){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);if(drawContentIcon(c,content,0,0,Math.min(canvas.width,canvas.height)))return true;}if(drawEquipmentIcon(canvas.getContext('2d'),id,0,0,canvas.width))return true;if(id==='reward'){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/24,canvas.height/24);c.fillStyle='#23392e';c.fillRect(8,2,10,10);c.fillRect(10,10,6,12);c.fillStyle='#bb8d38';c.fillRect(9,3,8,8);c.fillRect(11,10,4,11);c.fillStyle='#f3d37c';c.fillRect(10,3,6,2);c.fillRect(11,11,2,9);c.fillStyle='#23392e';c.fillRect(11,6,4,3);c.fillStyle='#fff0b0';c.fillRect(9,4,2,2);c.fillRect(10,19,2,2);c.restore();return true;}if(id==='anni-spray'){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);return drawUiSprite(c,id,0,0,canvas.width);}if(drawDetailIcon(canvas.getContext('2d'),id,0,0,canvas.width))return true;if(id==='fullscreen'){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/48,canvas.height/48);for(const [x,y,sx,sy] of [[8,8,1,1],[40,8,-1,1],[8,40,1,-1],[40,40,-1,-1]]){c.save();c.translate(x,y);c.scale(sx,sy);c.fillStyle='#182d22';c.fillRect(-2,-2,17,8);c.fillRect(-2,-2,8,17);c.fillStyle='#c9a762';c.fillRect(0,0,12,3);c.fillRect(0,0,3,12);c.restore();}c.restore();return true;}if(!sprites.has(id)&&!sprites.has(FALLBACK_ICONS[id]))return false;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);return drawUiSprite(c,id,2,2,Math.min(canvas.width,canvas.height)-4);}
export function paintUiControls(root=document){root.querySelectorAll('[data-ui-icon]').forEach(c=>paintUiIcon(c,c.dataset.uiIcon));}
export const uiIconCount=()=>sprites.size;

// Kartenbild der Klamottenwahl: Einzelbild "idle" nach Südosten aus dem gelieferten Bogen,
// ganzzahlig auf das Doppelte vergrößert (96 → 192 px). Fehlt der Bogen (Anni), malt der alte Weg.
export const HERO_PORTRAIT=192;
export function paintHeroPortrait(canvas,id,visualEquipment=[]){
 const detail=canvas.getContext('2d');detail.clearRect(0,0,canvas.width,canvas.height);
 if(drawDetailedHero(detail,id,canvas.width/2,canvas.height*.88,{facing:1,visualEquipment},6))return true;
 const actor=contentActor('hero-'+id)||contentActor(id);if(!actor)return false;
 const {image,frame,size}=contentFrame(actor,0,{});if(!image||!frame)return false;
 const c=canvas.getContext('2d'),scale=Math.max(1,Math.floor(canvas.width/size));
 c.clearRect(0,0,canvas.width,canvas.height);c.save();c.imageSmoothingEnabled=false;
 c.drawImage(image,frame.x,frame.y,size,size,0,0,size*scale,size*scale);c.restore();return true;
}
