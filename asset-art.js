// Pixel Frog, Tiny Swords Update 010: the author's separately offered CC0 edition.
// Foot positions and visual sizes stay independent of the geographic colliders.
import {loadMaifeldArt,drawMaifeld,maifeld} from './maifeld-art.js';
import {contentAsset} from './content-art.js';
export const artImages={};const images=artImages;
const files={tree:'Resources/Trees/Tree.png',rock:'Deco/06.png',pebble:'Deco/05.png',bush:'Deco/08.png',foliage:'Deco/09.png',mushroom:'Deco/03.png',house:'Factions/Knights/Buildings/House/House_Blue.png',ground:'Terrain/Ground/Tilemap_Flat.png',explosion:'Effects/Explosion/Explosions.png',fire:'Effects/Fire/Fire.png'};
let loading;
export function loadWorldArt(){return loading||=Promise.all([loadMaifeldArt(),...Object.entries(files).map(([key,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[key]=img;resolve();};img.onerror=()=>resolve();img.src='./assets/tiny-swords/'+path;}))]);}
// Always use the first, upright pose. World time must never move the canopy.
export function drawAssetTree(c,e,time){if(drawMaifeld(c,e.type==='pine'?'spruce':e.variant===0?'apple':'oak',e.x,e.y+5,105*e.size))return true;if(!images.tree||e.type!=='pine')return false;const scale=e.size*.67;c.drawImage(images.tree,0,0,192,192,Math.round(e.x-96*scale),Math.round(e.y-172*scale),Math.round(192*scale),Math.round(192*scale));return true;}
export function drawAssetProp(c,p){if(p.type==='rock')return drawMaifeld(c,'rocks',p.x,p.y+3,18+(p.variant%3)*3);return false;}
// Open rings and sparks in the new world leave the target visible.
export function drawAssetEffect(c,f){if(maifeld.oak||!images.explosion||!['burst','impact','interrupt','death'].includes(f.type))return false;const progress=Math.max(0,Math.min(.999,1-f.life/f.max)),frame=Math.floor(progress*9),size=f.type==='burst'?105:f.type==='death'?60:52;c.drawImage(images.explosion,frame*192,0,192,192,Math.round(f.x-size/2),Math.round(f.y-size/2-9),size,size);return true;}
export function drawAssetFire(c,x,y,time){const precise=contentAsset('campfire');if(precise){const m=precise.meta,f=m.frames[Math.floor(time*10)%m.frames.length];c.drawImage(precise.image,f.x,f.y,m.frameSize,m.frameSize,x-m.pivot.x/4,y-m.pivot.y/4,m.frameSize/4,m.frameSize/4);return true;}if(!images.fire)return false;const frame=Math.floor(time*10)%7;c.drawImage(images.fire,frame*128,0,128,128,Math.round(x-24),Math.round(y-42),48,48);return true;}
