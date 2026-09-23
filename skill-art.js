import {paintE32Skill} from './e32-art.js';
import {drawContentIcon,contentAsset,loadContentArt} from './content-art.js';
import {styleIcon} from './art-style.js';
import {loadAperolArt,paintAperolIcon} from './aperol-art.js';
import {loadDetailArt,drawDetailIcon} from './detail-art.js';
import {CLASS_SPECS} from './talents.js';
import {CLASS_BUFFS} from './content/index.js';
import {paintItem} from './item-art.js';
export const SKILL_ICON_ORDER={dieter:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','barricade','slam','keg'],baerbel:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','sanctuary','infusion','encore'],kevin:['strike','buff','throw','parry','mark','burst','ground','heal','interrupt','dash','detonate','magnet','snare']};
const sheets=new Map();let pending;
export function skillIconKey(member,id){if(id==='auto')return member+':auto';if(CLASS_BUFFS[id])return 'classBuff:'+id;const index=SKILL_ICON_ORDER[member]?.indexOf(id);return index>=0?member+':'+index:null;}
export function loadSkillArt(){loadDetailArt();loadContentArt();return pending||=Promise.all(Object.keys(SKILL_ICON_ORDER).map(id=>id==='baerbel'?loadAperolArt():new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{sheets.set(id,img);resolve();};img.onerror=()=>reject(Error('Skill-Grafik fehlt: '+id));img.src='./assets/clan-skills-013/'+id+'.png';})));}
function paintCell(canvas,member,index){if(member==='baerbel'){paintAperolIcon(canvas,'skills',index);return;}const c=canvas.getContext('2d'),image=sheets.get(member);c.clearRect(0,0,canvas.width,canvas.height);if(!image){c.fillStyle='#263d2b';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#e5c98c';c.font='bold 12px monospace';c.fillText(member[0].toUpperCase()+index,4,20);return;}const size=image.width/4;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,(index%4)*size+3,Math.floor(index/4)*size+3,size-6,size-6,0,0,canvas.width,canvas.height);}
function paintSkillRaw(canvas,id,member='dieter'){if(id==='auto'){if(member==='baerbel'){paintAperolIcon(canvas,'skills',16);return;}drawDetailIcon(canvas.getContext('2d'),'auto-'+member,0,0,canvas.width);return;}const index=SKILL_ICON_ORDER[member]?.indexOf(id);if(index>=0)paintCell(canvas,member,index);}
export function paintSpecIcon(canvas,id){const direct=Object.keys(SKILL_ICON_ORDER).find(m=>contentAsset('skill-'+m+'-'+id));if(direct){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawContentIcon(c,'skill-'+direct+'-'+id,0,0,canvas.width);return;}const member=Object.keys(CLASS_SPECS).find(c=>CLASS_SPECS[c].includes(id));if(member)paintCell(canvas,member,13+CLASS_SPECS[member].indexOf(id));}
export function paintSpecIcons(root){root.querySelectorAll('[data-spec-art]').forEach(c=>paintSpecIcon(c,c.dataset.specArt));}
export function paintSkillIcon(canvas,id,member='dieter',context={}){if(paintE32Skill(canvas,context.spec,id,context.variant))return;const key='skill-'+member+'-'+id;if(contentAsset(key)){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawContentIcon(c,key,0,0,canvas.width);return;}if(paintClassBuffIcon(canvas,id))return;paintSkillRaw(canvas,id,member);styleIcon(canvas);}
/** Klassen-Buffs (content/class-buffs.js) haben noch keine eigene Kniff-Grafik: sie zeigen ihr Gegenstands-Icon (Dose, Kutte, Glas …), klassenunabhängig – auch auf fremden Helden. */
function paintClassBuffIcon(canvas,id){const b=CLASS_BUFFS[id];if(!b)return false;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);if(!drawDetailIcon(c,b.icon,0,0,canvas.width))paintItem(canvas,b.icon);canvas.dataset.classBuff=id;styleIcon(canvas);return true;}
