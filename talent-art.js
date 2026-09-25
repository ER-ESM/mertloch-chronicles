import {loadAperolArt,paintAperolIcon} from './aperol-art.js';
import {loadE32Art,paintE32Talent} from './e32-art.js';
import {CLASS_SPECS,TALENT_ART,TALENT_ICON_FALLBACK,TALENT_ROWS,CLAN_MEMBERS} from './content/index.js';
import {loadDetailArt} from './detail-art.js';
import {paintItem} from './item-art.js';
import {drawUiSprite} from './ui-art.js';
import {contentAsset,drawContentMotif,drawPixelRect,loadContentArt} from './content-art.js';
const sheets=new Map();let pending;
export function talentIconCell(id){for(const [member,specs] of Object.entries(CLASS_SPECS))for(let s=0;s<specs.length;s++){const prefix=specs[s]+'-';if(id.startsWith(prefix)){const n=Number(id.slice(prefix.length));if(Number.isInteger(n)&&n>=0&&n<30)return {member,index:n<10?s*10+n:null,fallback:n};}}return null;}
export function loadTalentArt(){return pending||=Promise.all([loadE32Art(),loadContentArt(),loadDetailArt(),...Object.keys(CLASS_SPECS).map(member=>member==='baerbel'?loadAperolArt():new Promise(resolve=>{const img=new Image();img.onload=()=>{sheets.set(member,importSheet(img,member));resolve();};img.onerror=()=>resolve();img.src=TALENT_ART.path+member+'.png';}))]);}
function importSheet(image,member){
 const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data,{x,y}=TALENT_ART.edges[member];
 return Array.from({length:30},(_,i)=>{const col=i%5,row=Math.floor(i/5),left=x[col],right=x[col+1],top=y[row],bottom=y[row+1];let x0=right,y0=bottom,x1=left,y1=top;for(let py=top;py<bottom;py++)for(let px=left;px<right;px++)if(d[(py*cv.width+px)*4+3]>64){x0=Math.min(x0,px);y0=Math.min(y0,py);x1=Math.max(x1,px);y1=Math.max(y1,py);}return {image,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};});
}
/** Talentbild in Canvas-Größe malen (Stufe 48/32/24, icon-steps.js). Kein fitMotif mehr (Stilbibel A4): das Motiv steht 1:1 oder per
 *  Flächenmittel verkleinert im Knoten, nie per nächstem Nachbarn gestreckt. */
export function paintTalentIcon(canvas,id){paintTalentMotif(canvas,id);}
function paintTalentMotif(canvas,id){
 if(paintE32Talent(canvas,id))return;
 // Die 18 neuen Proc-Talente liegen als Einzeldateien vor und legen sich über den alten Atlas.
 // Die übrigen 72 Talentbilder bleiben unverändert (die Overlay-Atlanten werden bewusst nicht geladen).
 // Frei auf dem Knoten wie die e32-Talente (Stilbibel B), Motiv auf seinen Umriss beschnitten.
 if(contentAsset(id)){const c=canvas.getContext('2d'),size=Math.min(canvas.width,canvas.height);c.clearRect(0,0,canvas.width,canvas.height);drawContentMotif(c,id,0,0,size,size-2);canvas.dataset.talentCell='content:'+id;canvas.dataset.precision='true';return;}
 const cell=talentIconCell(id);if(!cell)return;if(paintVocabTalent(canvas,id,cell))return;if(cell.index===null){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#263d32';c.fillRect(0,0,canvas.width,canvas.height);drawUiSprite(c,TALENT_ICON_FALLBACK[cell.fallback%10],4,4,Math.min(canvas.width,canvas.height)-8);canvas.dataset.talentCell='fallback:'+cell.fallback;return;}if(cell.member==='baerbel'){paintAperolIcon(canvas,'talents',cell.index);canvas.dataset.talentCell=cell.member+':'+cell.index;return;}const art=sheets.get(cell.member)?.[cell.index],c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#263d32';c.fillRect(0,0,canvas.width,canvas.height);if(!art)return;drawPixelRect(c,art.image,art.x,art.y,art.w,art.h,2,2,Math.min(canvas.width,canvas.height)-4);canvas.dataset.talentCell=cell.member+':'+cell.index;}
export function paintTalentIcons(root){root.querySelectorAll('[data-talent-art]').forEach(c=>paintTalentIcon(c,c.dataset.talentArt));}
/** E-72: Talente der neuen Klassen (Schorsch, Käthe) haben noch kein Atlasbild – sie zeigen ihr `icon` aus dem Gegenstandsvokabular
 *  (TALENT_ROWS[spec][i].icon) auf einem Grund in Klassenfarbe: warmer Kern, dunkler Rand, feiner Innenrahmen. */
const NEW_TALENT_CLASSES=new Set(['schorsch','kaethe']);
function shade(hex,k){const n=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return '#'+n.map(v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k))).toString(16).padStart(2,'0')).join('');}
function paintVocabTalent(canvas,id,cell){
 if(!NEW_TALENT_CLASSES.has(cell.member))return false;const spec=id.slice(0,id.lastIndexOf('-')),icon=TALENT_ROWS[spec]?.[cell.fallback]?.icon;if(!icon)return false;
 const color=CLAN_MEMBERS.find(m=>m.id===cell.member)?.color||'#8a6a4a',W=canvas.width,H=canvas.height,c=canvas.getContext('2d');c.clearRect(0,0,W,H);
 const g=c.createRadialGradient(W/2,H*.42,W*.06,W/2,H/2,W*.72);g.addColorStop(0,shade(color,.18));g.addColorStop(.55,shade(color,-.38));g.addColorStop(1,shade(color,-.72));c.fillStyle=g;c.fillRect(0,0,W,H);
 const b=Math.max(1,Math.round(W/32));c.strokeStyle=shade(color,.35);c.globalAlpha=.55;c.lineWidth=b;c.strokeRect(b*1.5,b*1.5,W-b*3,H-b*3);c.globalAlpha=1;
 const t=document.createElement('canvas');t.width=W;t.height=H;const tc=t.getContext('2d');if(!drawContentMotif(tc,icon,0,0,W,Math.round(W*.86)))paintItem(t,icon);
 c.save();c.shadowColor='#0008';c.shadowOffsetY=Math.max(1,Math.round(H/40));c.shadowBlur=0;c.imageSmoothingEnabled=false;c.drawImage(t,0,0);c.restore();canvas.dataset.talentCell='vocab:'+icon;return true;}
