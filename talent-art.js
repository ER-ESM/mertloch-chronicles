import {loadAperolArt,paintAperolIcon} from './aperol-art.js';
import {loadE32Art,paintE32Talent} from './e32-art.js';
import {CLASS_SPECS,TALENT_ART,TALENT_ICON_FALLBACK} from './content/index.js';
import {drawUiSprite} from './ui-art.js';
import {contentAsset,drawContentIcon,loadContentArt} from './content-art.js';
const sheets=new Map();let pending;
export function talentIconCell(id){for(const [member,specs] of Object.entries(CLASS_SPECS))for(let s=0;s<specs.length;s++){const prefix=specs[s]+'-';if(id.startsWith(prefix)){const n=Number(id.slice(prefix.length));if(Number.isInteger(n)&&n>=0&&n<30)return {member,index:n<10?s*10+n:null,fallback:n};}}return null;}
export function loadTalentArt(){return pending||=Promise.all([loadE32Art(),loadContentArt(),...Object.keys(CLASS_SPECS).map(member=>member==='baerbel'?loadAperolArt():new Promise(resolve=>{const img=new Image();img.onload=()=>{sheets.set(member,importSheet(img,member));resolve();};img.onerror=()=>resolve();img.src=TALENT_ART.path+member+'.png';}))]);}
function importSheet(image,member){
 const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data,{x,y}=TALENT_ART.edges[member];
 return Array.from({length:30},(_,i)=>{const col=i%5,row=Math.floor(i/5),left=x[col],right=x[col+1],top=y[row],bottom=y[row+1];let x0=right,y0=bottom,x1=left,y1=top;for(let py=top;py<bottom;py++)for(let px=left;px<right;px++)if(d[(py*cv.width+px)*4+3]>64){x0=Math.min(x0,px);y0=Math.min(y0,py);x1=Math.max(x1,px);y1=Math.max(y1,py);}return {image,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};});
}
/** Talentbild malen und das Motiv randfüllend einpassen (WoW-Maßstab: das Symbol füllt den Rahmen). */
export function paintTalentIcon(canvas,id){paintTalentMotif(canvas,id);fitMotif(canvas);}
/** Die Atlaszellen tragen viel Rand; Umriss des Motivs suchen (Pixel, die weder durchsichtig noch Grundfarbe sind) und auf ~92 % der Fläche vergrößern. */
function fitMotif(canvas,fill=.92){
 const W=canvas.width,H=canvas.height;if(!W||!H||typeof canvas.getContext!=='function')return;const c=canvas.getContext('2d',{willReadFrequently:true});let d;try{d=c.getImageData(0,0,W,H).data;}catch{return;}
 const bg=[0x26,0x3d,0x32],isBg=i=>d[i+3]<40||Math.abs(d[i]-bg[0])+Math.abs(d[i+1]-bg[1])+Math.abs(d[i+2]-bg[2])<18;let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!isBg((y*W+x)*4)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return;const w=x1-x0+1,h=y1-y0+1,k=Math.min(W*fill/w,H*fill/h);if(k<1.12)return;
 const t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(canvas,x0,y0,w,h,0,0,w,h);
 const opaque=d[3]>200;c.clearRect(0,0,W,H);if(opaque){c.fillStyle='#263d32';c.fillRect(0,0,W,H);}c.imageSmoothingEnabled=false;const dw=Math.round(w*k),dh=Math.round(h*k);c.drawImage(t,0,0,w,h,Math.round((W-dw)/2),Math.round((H-dh)/2),dw,dh);
}
function paintTalentMotif(canvas,id){
 if(paintE32Talent(canvas,id))return;
 // Die 18 neuen Proc-Talente liegen als Einzeldateien vor und legen sich über den alten Atlas.
 // Die übrigen 72 Talentbilder bleiben unverändert (die Overlay-Atlanten werden bewusst nicht geladen).
 if(contentAsset(id)){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#263d32';c.fillRect(0,0,canvas.width,canvas.height);drawContentIcon(c,id,0,0,Math.min(canvas.width,canvas.height));canvas.dataset.talentCell='content:'+id;return;}
 const cell=talentIconCell(id);if(!cell)return;if(cell.index===null){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#263d32';c.fillRect(0,0,canvas.width,canvas.height);drawUiSprite(c,TALENT_ICON_FALLBACK[cell.fallback%10],4,4,Math.min(canvas.width,canvas.height)-8);canvas.dataset.talentCell='fallback:'+cell.fallback;return;}if(cell.member==='baerbel'){paintAperolIcon(canvas,'talents',cell.index);canvas.dataset.talentCell=cell.member+':'+cell.index;return;}const art=sheets.get(cell.member)?.[cell.index],c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#263d32';c.fillRect(0,0,canvas.width,canvas.height);if(!art)return;const scale=Math.min((canvas.width-4)/art.w,(canvas.height-4)/art.h),w=Math.round(art.w*scale),h=Math.round(art.h*scale);c.imageSmoothingEnabled=false;c.drawImage(art.image,art.x,art.y,art.w,art.h,Math.round((canvas.width-w)/2),Math.round((canvas.height-h)/2),w,h);canvas.dataset.talentCell=cell.member+':'+cell.index;}
export function paintTalentIcons(root){root.querySelectorAll('[data-talent-art]').forEach(c=>paintTalentIcon(c,c.dataset.talentArt));}
