import {WORLD_SCALE} from './world-scale.js';
import {drawLiveAnimal,drawLivePerson,hasLiveContent} from './live-art.js';
import {drawTinyPerson} from './pixel-people.js';
import {drawMaifeld,maifeld} from './maifeld-art.js';
import {PALETTE as P,box as r,shape,oval,line,framed,spark} from './pixel-style.js';
import {drawComicEnemy,drawComicResident} from './comic-actors.js';

export function drawClanHero(c,x,y,time,p,npc=false,scale=1){drawTinyPerson(c,x,y,time,p,npc,scale);}

export function drawClanEnemy(c,e,time){
 // Gelieferte Bögen (Gegner, Bosse) bringen ihre Welthöhe selbst mit: artMagnify 1, kein Weltmaßstab darüber.
 const artId=e.variant||e.bossId||e.skin;
 if(hasLiveContent(artId,e.variant)&&drawLivePerson(c,artId,e.x,e.y,time,{...e,phase:e.saidPhases?.size>0,artMagnify:1}))return;
 if(drawLiveAnimal(c,e,time))return;if(drawLivePerson(c,artId,e.x,e.y,time,e,(e.variant==='automat'?WORLD_SCALE.machine:e.type==='boss'?WORLD_SCALE.boss:WORLD_SCALE.npc)/33))return;if(e.skin==='warden'||e.skin==='horst'){drawTinyPerson(c,e.x,e.y,time,{...e,classId:e.skin},false,e.skin==='horst'?2.1:.84);return;}if(maifeld[e.skin]){c.save();c.translate(Math.round(e.x),Math.round(e.y));c.scale(e.facing||1,1);const h=e.skin==='boar'?25:e.skin==='goose'?20:17;c.fillStyle='#27351d40';c.beginPath();c.ellipse(0,1,h*.5,3,0,0,7);c.fill();drawMaifeld(c,e.skin,0,e.moving?Math.round(Math.sin(time*10)*.7):0,h);c.restore();return;}if(!e.skin){drawComicEnemy(c,e,time);return;}c.save();c.translate(Math.round(e.x*2)/2,Math.round(e.y*2)/2);const actorScale=['badger','goose'].includes(e.skin)?.68:e.skin==='boar'?.85:e.skin==='warden'?.84:1;c.scale((e.facing||1)*actorScale,actorScale);const walk=e.moving?Math.sin(time*12)*1.5:0;
  if(e.skin==='goose'){oval(c,'#293b443b',0,2,12,3);for(const [x,step]of [[-4,walk],[3,-walk]])line(c,'#bb8c61',[[x,-1],[x,5+step],[x+4,5+step]],1);shape(c,'#eee2b8',[[-13,-7],[-15,-13],[-9,-10],[-4,-12],[5,-11],[6,-22],[11,-25],[15,-22],[13,-17],[10,-14],[10,-5],[4,0],[-6,-1]],P.ink,1);shape(c,'#b7b8a5',[[-9,-8],[1,-9],[5,-5],[-1,-2],[-7,-3]],null);r(c,'#fff2cd',-5,-10,6,1);r(c,P.ink,12,-21,1.5,1.5);shape(c,'#e5ad6e',[[14,-20],[20,-18],[14,-17]],P.ink,.5);}
  else{const badger=e.skin==='badger';oval(c,'#293b443b',0,3,17,4);for(const [x,step]of [[-10,walk],[5,-walk]]){framed(c,'#4e5251',x,-4+step,5,7,P.ink,.75);r(c,'#d8c4a5',x,2+step,5,1);}shape(c,badger?'#8997a0':'#967459',[[-16,-6],[-16,-15],[-10,-21],[2,-22],[12,-18],[16,-10],[10,-3],[-8,-2]],P.ink,1);shape(c,badger?'#c7cbb8':'#c8a67b',[[-13,-15],[-7,-19],[1,-20],[7,-17],[2,-13],[-9,-12]]);shape(c,badger?'#d9d7be':'#ab8b69',[[8,-15],[10,-23],[13,-25],[16,-22],[18,-15],[23,-12],[22,-7],[14,-7],[10,-10]],P.ink,1);
    if(badger){shape(c,'#3c505c',[[11,-21],[14,-22],[19,-13],[21,-11],[17,-10],[14,-15]]);r(c,P.cream,15,-17,1,1);r(c,P.ink,22,-12,3,3);framed(c,'#739b7d',-2,-10,5,5,P.ink,.5);r(c,'#ead19e',-1,-9,3,2);}else{oval(c,'#c19f83',22,-10,5,3.5);oval(c,P.ink,21,-10,1,1.5);oval(c,P.ink,24,-10,1,1.5);shape(c,P.cream,[[18,-8],[18,-4],[15,-7]],P.ink,.5);r(c,'#eac277',15,-18,2,1);line(c,P.ink,[[-14,-10],[-20,-12],[-19,-16]],1.5);if(!e.ambient){framed(c,'#a67d59',-11,-26,19,7,P.ink,1);for(let i=0;i<4;i++)r(c,'#e4ad75',-9+i*4,-24,2,4);}}
  }
  if(e.skin==='boar'||e.skin==='badger'){const pale=e.skin==='badger'?'#c8c5a7':'#c49e6c',dark=e.skin==='badger'?'#475e64':'#635247';for(let i=0;i<9;i++){const x=-13+i*2.7,y=-15+(i%3)*2;line(c,i%2?pale:dark,[[x,y],[x+2,y-1],[x+3,y+1]],.5);}for(let i=0;i<5;i++)shape(c,dark,[[-10+i*4,-20],[-9+i*4,-23-i%2],[-7+i*4,-20]]);}
  if(e.skin==='goose'){for(let i=0;i<4;i++)line(c,i%2?'#f0dfae':'#929f8f',[[-8+i*3,-8],[-5+i*3,-5],[-7+i*3,-4]],.5);}
  c.restore();}

export function drawClanCamp(c,w,time){const x=w.church.x,y=w.church.maxY-2;c.save();line(c,'#6e5367',[[x-72,y-3],[x,y+6],[x+76,y-3]],1);for(let i=0;i<12;i++){const px=x-69+i*12,py=y+Math.sin(i/11*Math.PI)*8;shape(c,['#d68289','#e7bd7b','#75b6a2'][i%3],[[px,py],[px+9,py+1],[px+4,py+10+Math.sin(time*2+i)]],P.ink,.5);}framed(c,'#2d4145',x-38,y+9,78,14,P.gold,1);c.font='bold 7px Georgia';c.fillStyle='#f4d7a0';c.textAlign='center';c.fillText('POO-TANG · MERTLOCH',x+1,y+19);c.restore();}
