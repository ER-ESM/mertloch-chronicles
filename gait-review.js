import {loadRedesignArt,redesignArt} from './redesign-art.js';
import {loadContentArt,contentArt,contentActor,contentFrame} from './content-art.js';
import {drawDetailedHero} from './detailed-hero-art.js';
import {drawLivePerson,loadLiveArt} from './live-art.js';
const $=id=>document.getElementById(id),dirs=['se','sw','ne','nw'];let playing=true,phase=0,last=0;
await Promise.all([loadRedesignArt(),loadContentArt(),loadLiveArt()]);
const people=['dieter','anni','kevin',...Object.keys(contentArt.catalog.assets).filter(id=>contentArt.catalog.assets[id].animation==='registered-two-leg-gait').map(id=>id.replace(/-walk$/,''))];
$('actor').innerHTML=people.map(id=>'<option>'+id+'</option>').join('');
function paint(c,id,x,y,row,frame,magnify){const equipment=$('gear').value==='none'?[]:[{slot:'legs',asset:'trouser'},{slot:'feet',asset:'boot'},{slot:'weapon',asset:$('gear').value==='heavy'?'maul':'club',hands:$('gear').value==='heavy'?2:1}];const p={direction:dirs[row],moving:true,walkDistance:frame/8*(contentActor(id)?.stride||20),artPose:'walk-'+frame,visualEquipment:equipment,artMagnify:magnify};
 if(!drawDetailedHero(c,id,x,y,p,magnify))drawLivePerson(c,id,x,y,0,p);
 const f=redesignArt.catalog.assets[id+($('gear').value==='heavy'?'-heavywalk':'-walk')]?.frames[row*8+frame]||contentFrame(contentActor(id),row,p).frame;
 if($('markers').checked){const k=magnify/4;c.save();c.lineWidth=1.5;for(const [i,j]of (f.joints||[]).entries()){c.fillStyle=i?'#ecad70':'#95d9dd';const px=x+(j.ankle.x-96)*k,py=y+(j.ankle.y-160)*k;c.beginPath();c.arc(px,py,3,0,Math.PI*2);c.fill();c.font='bold 11px sans-serif';c.fillText((i?'B':'A')+(j.support?' ●':' ↑'),px-10,py+20);}c.restore();}
}
function draw(){const id=$('actor').value,cv=$('directions'),c=cv.getContext('2d');cv.width=cv.clientWidth;cv.height=250;c.clearRect(0,0,cv.width,cv.height);const f=Math.floor(phase)%8,magnify=innerWidth<600?2:4;for(let row=0;row<4;row++){const x=cv.width*(row+.5)/4;paint(c,id,x,180,row,f,magnify);c.fillStyle='#e8d4ac';c.font='14px sans-serif';c.fillText(dirs[row].toUpperCase(),x-12,225);}const strip=$('phases'),s=strip.getContext('2d');s.clearRect(0,0,1280,220);for(let i=0;i<8;i++){paint(s,id,80+i*160,160,0,i,4);s.fillStyle='#e8d4ac';s.fillText('Phase '+i,54+i*160,210);}$('status').textContent=people.length+' menschliche Figuren · 4 Richtungen · 8 Phasen · aktuell '+id+' / '+f;}
for(const id of ['actor','gear','markers'])$(id).onchange=draw;$('pause').onclick=()=>{playing=!playing;$('pause').textContent=playing?'Pause':'Weiter';};$('step').onclick=()=>{playing=false;phase=(Math.floor(phase)+1)%8;draw();};
window.gaitReview={people,draw,set(id,frame=0){$('actor').value=id;phase=frame;playing=false;draw();}};
requestAnimationFrame(function loop(now){if(playing)phase=(phase+Math.min(.05,(now-(last||now))/1000)*8)%8;last=now;draw();requestAnimationFrame(loop);});
