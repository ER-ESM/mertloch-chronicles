import {loadRedesignArt,redesignArt,drawRedesignPerson,redesignFrame,redesignPose} from './redesign-art.js';
import {loadContentArt} from './content-art.js';
import {drawDetailedHero} from './detailed-hero-art.js';
import {DEMO_PRESETS,resolveDemoEquipment,demoArmor} from './prerender-demo-presets.js';
import {loadWorldArt} from './asset-art.js';
import {drawMaifeld,fillMaifeldGround} from './maifeld-art.js';
import {drawBuilding} from './architecture.js';
const $=s=>document.querySelector(s),directions=['se','sw','ne','nw'],titles=['SÜDOST','SÜDWEST','NORDOST','NORDWEST'];
export const state={hero:'dieter',action:'walk',outfit:'theme',phase:0,playing:true,sockets:false,armor:false};
const armor=Object.fromEntries(['dieter','anni','kevin'].map(hero=>[hero,demoArmor(hero)]));
for(const p of DEMO_PRESETS)$('#outfit').add(new Option(p.name,p.id));
const params=new URLSearchParams(location.search);
for(const key of ['hero','action','outfit'])if([...$('#'+key).options].some(o=>o.value===params.get(key)))state[key]=params.get(key);
if(params.has('frame')){const phase=Number(params.get('frame'));if(Number.isInteger(phase)&&phase>=0&&phase<8){state.phase=phase;state.playing=false;}}
state.armor=params.get('armor')==='1';
const canvases=directions.map((d,i)=>{const f=document.createElement('figure');f.innerHTML=`<canvas width="320" height="360" aria-label="${titles[i]}"></canvas><figcaption>${titles[i]}</figcaption>`;$('#turnaround').append(f);return f.querySelector('canvas');});
const themes={dieter:{weapon:'dosenbrecher',offhand:'topfdeckel',ranged:'pfandschleuder'},anni:{weapon:'dosenbrecher',offhand:'topfdeckel',ranged:'megafon'},kevin:{weapon:'dosenklinge',offhand:'topfdeckel',ranged:'pfandschleuder'}};
let villageGround;
function ground(){
 const cv=document.createElement('canvas');cv.width=1200;cv.height=380;const c=cv.getContext('2d');c.scale(4,4);c.imageSmoothingEnabled=false;
 fillMaifeldGround(c,'groundGrass',0,0,300,95,.9);fillMaifeldGround(c,'groundPaving',0,43,300,52);
 for(const [id,x,w]of [[0,0,78],[1,112,120]])drawBuilding(c,{id,minX:x,maxX:x+w,minY:15,maxY:45,w,h:30,wallHeight:45,roofHeight:20,door:{x:x+w*.5},style:'timber'},0);
 drawMaifeld(c,'board',96,48,32);drawMaifeld(c,'supplies',270,47,24);drawMaifeld(c,'bench',20,94,18);drawMaifeld(c,'cart',285,94,26);return cv;
}
function player(hero=state.hero){
 const action=state.action,phase=Math.floor(state.phase)%8,pose=action==='walk'?'walk-'+phase:action==='attack'?['anticipation','anticipation','impact','impact','recovery','recovery','idle','idle'][phase]:action==='ranged'?(phase<4?'ranged-aim':'ranged-release'):action;
 const preset=DEMO_PRESETS.find(p=>p.id===state.outfit),equipment=state.outfit==='bare'?{}:preset?.equipment||themes[hero];
 return {artPose:pose,direction:'se',parry:action==='parry'?.3:0,usingRanged:action==='ranged'||(state.outfit==='theme'&&hero!=='dieter'&&action!=='attack')||!!preset?.ranged,visualEquipment:[...resolveDemoEquipment(equipment).visualEquipment,...(state.armor?armor[hero]:[])]};
}
function actor(c,hero,x,y,p,magnify){if(!drawDetailedHero(c,hero,x,y,p,magnify))throw Error('Die Detailgrafik für '+hero+' / '+p.artPose+' fehlt.');}
export function draw(){
 if(!redesignArt.ready)return;const p=player();
 for(const key of ['hero','action','outfit'])$('#'+key).value=state[key];$('#pause').textContent=state.playing?'Pause':'Abspielen';
 $('#armor').checked=state.armor;
 canvases.forEach((cv,i)=>{const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);const q={...p,direction:directions[i]};actor(c,state.hero,160,302,q,9);
  if(state.sockets){const f=redesignFrame(state.hero,q).frame;c.fillStyle='#f5cf67';for(const at of [f.sockets.main,f.sockets.off]){c.beginPath();c.arc(160+(at.x-96)*2.25,302+(at.y-160)*2.25,4,0,7);c.fill();}}
 });
 const nc=$('#native').getContext('2d');nc.clearRect(0,0,768,192);directions.forEach((direction,i)=>actor(nc,state.hero,i*192+96,160,{...p,direction},4));
 const c=$('#lineup').getContext('2d');c.clearRect(0,0,1200,380);if(villageGround)c.drawImage(villageGround,0,0);
 ['dieter','anni','kevin'].forEach((hero,i)=>{actor(c,hero,260+i*340,312,player(hero),4);c.fillStyle='#f0e4c7';c.strokeStyle='#17271c';c.lineWidth=4;c.textAlign='center';c.font='18px Georgia';const name=['Dosen-Dieter','Aperol-Anni','Klo-Kevin'][i];c.strokeText(name,260+i*340,351);c.fillText(name,260+i*340,351);});
 $('#theme-name').textContent={dieter:'BRAUHAUS',anni:'APEROLGARTEN',kevin:'PFANDREVIER'}[state.hero];$('#frame-name').textContent=$('#action').selectedOptions[0].text+' · '+(Math.floor(state.phase)%8+1)+'/8';$('#frame').value=Math.floor(state.phase)%8;
}
for(const key of ['hero','action','outfit'])$('#'+key).addEventListener('change',e=>{state[key]=e.target.value;const preset=DEMO_PRESETS.find(p=>p.id===state.outfit);if(key==='outfit'&&preset){state.hero=preset.hero==='baerbel'?'anni':preset.hero;$('#hero').value=state.hero;}draw();});
$('#pause').onclick=()=>{state.playing=!state.playing;$('#pause').textContent=state.playing?'Pause':'Abspielen';};
$('#step').onclick=()=>{state.playing=false;state.phase=(Math.floor(state.phase)+1)%8;$('#pause').textContent='Abspielen';draw();};
$('#frame').oninput=e=>{state.playing=false;state.phase=+e.target.value;$('#pause').textContent='Abspielen';draw();};
$('#sockets').onchange=e=>{state.sockets=e.target.checked;draw();};
$('#armor').onchange=e=>{state.armor=e.target.checked;draw();};
$('#export').onclick=()=>{const cv=document.createElement('canvas');cv.width=1280;cv.height=360;const c=cv.getContext('2d');canvases.forEach((v,i)=>c.drawImage(v,i*320,0));const a=document.createElement('a');a.href=cv.toDataURL();a.download=state.hero+'-'+state.action+'.png';a.click();};
await Promise.all([loadRedesignArt(),loadContentArt(),loadWorldArt()]);
if(!redesignArt.ready)throw Error('Die Detailgrafiken konnten nicht vollständig geladen werden.');
villageGround=ground();
const labels=['Fasshammer','Hopfenschild','Aperol-Sprüher','Zitrusschild','Pfandschleuder','Dorfblech'];
Object.keys(redesignArt.catalog.gear).forEach((id,i)=>{const f=document.createElement('figure');f.innerHTML=`<canvas width="192" height="192"></canvas><figcaption>${labels[i]}</figcaption>`;$('#gear-gallery').append(f);const c=f.querySelector('canvas').getContext('2d'),a=redesignArt.catalog.gear[id][0];c.imageSmoothingEnabled=false;c.drawImage(redesignArt.gear,a.x,a.y,128,128,0,0,192,192);});
$('#status').textContent=Object.values(redesignArt.catalog.assets).reduce((n,a)=>n+a.frames.length,0)+' Körperbilder · 24 Ausrüstungsansichten · vier Richtungen';
window.redesignDemo={ready:true,state,draw,player};redesignArt.changed=draw;draw();let last=0;function tick(t){if(state.playing){state.phase=(state.phase+Math.min(.1,(t-last)/1000)*8)%8;draw();}last=t;requestAnimationFrame(tick);}requestAnimationFrame(tick);
