import {DETAIL_ICONS} from './content/index.js';
let sheet,pending;
export function loadDetailArt(){return pending||=new Promise(resolve=>{const image=new Image();image.onload=()=>{sheet=image;resolve();};image.onerror=()=>resolve();image.src='./assets/content-art/items/semantic-atlas.png';});}
export function drawDetailIcon(c,id,x,y,size){const i=DETAIL_ICONS.indexOf(id);if(i<0)return false;if(!sheet){c.save();c.fillStyle='#273c28';c.fillRect(x,y,size,size);c.fillStyle='#e8ca8a';c.font=Math.max(9,size/4)+'px monospace';c.fillText(id.slice(0,3),x+2,y+size*.6);c.restore();return true;}const w=sheet.width/5,h=sheet.height/5;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(sheet,i%5*w+3,Math.floor(i/5)*h+3,w-6,h-6,x,y,size,size);c.restore();return true;}
