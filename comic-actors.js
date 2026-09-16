import {drawLiveAnimal} from './live-art.js';
import {drawTinyPerson} from './pixel-people.js';
import {drawMaifeld,maifeld} from './maifeld-art.js';
import {PALETTE as P,box as r,shape,oval,line,framed,spark} from './pixel-style.js';

function face(c,variant=0,helmet=false){
  shape(c,'#bb7c75',[[-5,-28],[-3,-31],[4,-31],[6,-28],[6,-22],[3,-19],[-3,-20],[-5,-23]],P.ink,1);
  shape(c,'#f1be92',[[-4,-28],[-2,-30],[4,-29],[5,-26],[4,-22],[0,-21],[-3,-22]]);r(c,'#ffe1af',-3,-27,3,3);r(c,'#df8a7d',-4,-23,2,1);
  r(c,P.ink,0,-26,1.5,2);r(c,P.ink,4,-25.5,1,1.5);r(c,'#fff6d4',.5,-26,.5,.5);r(c,'#f9d2a3',5,-24,1.5,1.5);line(c,'#8c555e',[[1,-22],[3,-22]],.5);
  if(helmet){shape(c,'#6d9fae',[[-6,-27],[-5,-31],[-2,-33],[4,-32],[7,-29],[7,-27],[1,-28],[-2,-27],[-3,-23],[-6,-24]],P.ink,1);line(c,'#d4e6d3',[[-4,-30],[-1,-32],[3,-31]],1);r(c,'#e5b26b',-3,-29,9,1);r(c,P.ink,-5,-25,2,3);r(c,'#a9c9c2',-5,-25,1,2);}
  else{const hair=['#735164','#c0875e','#6f4d5c','#a26867'][variant%4];shape(c,hair,[[-5,-24],[-6,-29],[-3,-32],[3,-32],[6,-29],[3,-28],[0,-29],[-2,-26],[-2,-23]],P.ink,.75);line(c,'#e0ad7c',[[-4,-29],[-2,-30],[1,-30]],.5);if(variant%3===0){shape(c,'#ddac6a',[[-7,-28],[-4,-33],[3,-34],[6,-29],[9,-28],[8,-26],[-8,-26]],P.ink,1);r(c,'#fff0b6',-4,-32,6,1);r(c,'#8f5764',-5,-29,10,1.5);}}
}

export function drawComicHero(c,x,y,time,p,npc=false,scale=1){
  c.save();c.translate(Math.round(x*2)/2,Math.round(y*2)/2);c.scale(scale*(p.facing||1),scale);const walk=p.moving?Math.sin(time*12):0,bob=Math.abs(walk)*.7;c.translate(0,-Math.round(bob*2)/2);oval(c,'#2b40494a',1,2,10,3);
  const cape=npc?'#b57483':'#c56570',sway=Math.sin(time*3)*1.5;
  shape(c,cape,[[-5,-22],[-8,-16],[-9+sway,-3],[-4+sway,-5],[0,-2],[4,-8],[4,-21]],P.ink,1);shape(c,npc?'#dfad92':'#ed9b7b',[[-5,-20],[-6,-7],[-4,-9],[-2,-18]]);
  for(const [xx,phase] of [[-5,walk],[2,-walk]]){framed(c,'#50657c',xx,-6+phase,4,7,P.ink,.75);shape(c,'#865b61',[[xx-1,phase],[xx+4,phase],[xx+5,phase+3],[xx-2,phase+3]],P.ink,.75);r(c,'#ddb183',xx-1,phase+1,3,.5);}
  shape(c,npc?'#b59766':'#4f8f9e',[[-5,-21],[4,-22],[7,-16],[5,-7],[-5,-7],[-7,-16]],P.ink,1);shape(c,npc?'#e4bd7a':'#95c9c6',[[-4,-20],[3,-20],[4,-16],[-3,-15],[-5,-17]]);line(c,P.cream,[[-4,-20],[2,-20],[4,-18]],.75);
  framed(c,'#d3a36c',-5,-9,11,2,P.ink,.5);framed(c,P.cream,0,-9.5,2,3,P.ink,.5);for(let i=0;i<4;i++){line(c,'#b7d4c4',[[-3,-14+i],[0,-13+i],[3,-14+i]],.5);}
  for(const xx of [-8,6]){shape(c,npc?'#c5a876':'#7eb3ba',[[xx,-21],[xx+4,-21],[xx+5,-17],[xx+1,-16],[xx-1,-18]],P.ink,.75);r(c,P.cream,xx,-20,3,.5);framed(c,'#e7b68c',xx+1,-15,2,5,P.ink,.5);}
  face(c,0,true);
  // The signature coral scarf makes the player readable against jade foliage.
  shape(c,npc?'#efd090':'#ec8c70',[[-4,-22],[3,-21],[5,-23],[6,-20],[1,-18],[-4,-20]],P.ink,.5);r(c,'#ffe0a0',-2,-21,3,.5);
  if(!npc){shape(c,'#3c7685',[[-12,-16],[-6,-16],[-5,-7],[-9,-4],[-13,-8]],P.ink,1);line(c,P.gold,[[-12,-15],[-7,-15],[-6,-8],[-9,-6],[-12,-9],[-12,-15]],1);shape(c,P.cream,[[-9,-13],[-7.5,-10],[-9,-8],[-10.5,-10]]);
    c.save();c.translate(9,-11);c.rotate(p.attack>0?-.9:-.12);shape(c,'#9dd1d1',[[0,3],[-1,-12],[1,-18],[3,-12],[3,3]],P.ink,.75);line(c,'#eff6d5',[[1,-15],[1,2]],1);framed(c,'#e9b870',-3,1,9,2,P.ink,.5);framed(c,'#825665',0,4,2,3,P.ink,.5);r(c,'#ffedb4',-2,1,2,.5);c.restore();
  }else{framed(c,'#9c7161',10,-27,2,30,P.ink,.5);shape(c,P.gold,[[8,-29],[11,-33],[14,-29],[11,-25]],P.ink,.75);r(c,P.cream,10,-30,1,3);}
  if(p.parry>0){line(c,P.cream,[[13,-29],[18,-23],[20,-12],[15,-3]],2);spark(c,18,-27);}
  c.restore();
}

export function drawComicResident(c,a,time){if(a.kind!=='villager'&&drawLiveAnimal(c,a,time))return;
 if(a.kind!=='villager'&&maifeld[a.kind]){c.save();c.translate(Math.round(a.x),Math.round(a.y));c.scale(a.facing||1,1);drawMaifeld(c,a.kind,0,a.moving?Math.round(Math.sin(time*10+a.id)*.5):0,a.kind==='cat'?13:11);c.restore();return;}
  c.save();c.translate(Math.round(a.x*2)/2,Math.round(a.y*2)/2);c.scale(a.kind==='villager'&&a.direction?(a.direction.endsWith('w')?-1:1):a.facing||1,1);const walk=a.moving?Math.sin(time*9+a.id):0;
  oval(c,'#352b4538',0,2,a.kind==='villager'?8:6,2.5);
  if(a.kind==='villager'){drawTinyPerson(c,0,0,time,{classId:'resident',variant:a.variant,facing:1,direction:(a.direction||'se').replace('w','e'),moving:a.moving,walkDistance:a.walkDistance},false,1);
  }else if(a.kind==='chicken'){
    for(const x of [-2,2]){const step=x<0?walk:-walk;line(c,'#956b66',[[x,-1],[x,3+step],[x+2,3+step]],.75);}
    shape(c,a.variant===1?'#cd986f':'#ffe6b1',[[-6,-3],[-7,-9],[-4,-8],[-1,-9],[4,-8],[5,-11],[8,-12],[10,-10],[9,-5],[7,-1],[0,1]],P.ink,.75);
    shape(c,a.variant===1?'#ae7868':'#d6b690',[[-4,-6],[2,-6],[3,-3],[0,-1],[-3,-2]],null);line(c,'#fff3cb',[[-4,-7],[0,-7],[2,-6]],.75);
    r(c,'#d57578',6,-13,2,2);r(c,'#d57578',8,-12,1,2);r(c,P.ink,8,-9,1,1);shape(c,P.gold,[[9,-8],[12,-7],[9,-6]]);r(c,'#d57578',8,-5,1,2);
  }else{
    const tail=Math.sin(time*2)*2;line(c,P.ink,[[-5,-3],[-10,-5],[-12,-10],[-10,-13+tail]],3);line(c,'#9197ac',[[-5,-3],[-10,-5],[-12,-10],[-10,-13+tail]],1.5);
    shape(c,'#8f99af',[[-7,-4],[-5,-7],[3,-7],[5,-12],[7,-10],[10,-12],[11,-5],[8,-2],[5,-1],[-4,-1]],P.ink,.75);r(c,'#cdd3cd',-4,-6,6,1);r(c,'#515571',-2,-6,1,3);r(c,'#515571',1,-6,1,3);
    for(const [x,phase] of [[-4,walk],[4,-walk]])framed(c,'#b5b9c3',x,-1+phase,2,3,P.ink,.5);r(c,'#f5d586',8,-7,1,1);r(c,'#e6a3a1',10,-5,1,1);line(c,P.cream,[[9,-4],[13,-4]],.5);
  }
  c.restore();if(a.bubble>0){const words=['Poo-Tang, Alter!','Wer hat meinen Pfand?!','Horst kann mich mal.','Mertloch bleibt wach.'];c.font='7px Georgia';c.textAlign='center';const text=words[a.variant%4],w=c.measureText(text).width+12;framed(c,'#fff0c9',a.x-w/2,a.y-48,w,13,P.ink,1);shape(c,'#fff0c9',[[a.x-3,a.y-35],[a.x,a.y-31],[a.x+3,a.y-35]],P.ink,.5);c.fillStyle=P.ink;c.fillText(text,a.x,a.y-39);}
}

export function drawComicEnemy(c,e,time){c.save();c.translate(Math.round(e.x*2)/2,Math.round(e.y*2)/2);c.scale(e.facing||1,1);const walk=e.moving?Math.sin(time*12)*1.5:0;
  if(e.type==='wolf'){
    oval(c,'#352b4540',0,3,18,4);line(c,P.ink,[[-11,-9],[-22,-13],[-25,-18]],6);line(c,'#8194ad',[[-11,-9],[-22,-13],[-25,-18]],3.5);
    for(const [x,phase] of [[-10,walk],[5,-walk]]){shape(c,'#626b89',[[x,-7],[x+4,-6],[x+4,3+phase],[x+1,4+phase],[x-2,3+phase]],P.ink,1);r(c,'#d5d3bf',x,2+phase,4,1);}
    shape(c,'#929fb7',[[-15,-7],[-17,-15],[-10,-20],[-4,-18],[4,-20],[11,-16],[13,-7],[6,-3],[-7,-4]],P.ink,1);shape(c,'#c4cabb',[[-13,-15],[-8,-18],[-3,-16],[3,-18],[8,-14],[1,-10],[-8,-11]]);
    shape(c,'#6e829e',[[6,-15],[6,-23],[9,-28],[12,-24],[16,-26],[19,-21],[19,-15],[25,-12],[24,-8],[15,-7],[10,-10]],P.ink,1);shape(c,'#b9c6c4',[[11,-21],[16,-22],[17,-15],[22,-12],[22,-10],[16,-11],[12,-15]]);r(c,'#eba694',9,-25,1,3);r(c,P.ink,24,-12,2,3);r(c,'#f8cb75',16,-19,2,2);r(c,P.ink,17,-19,1,1);r(c,'#ffe8b6',18,-9,1,2);line(c,P.ink,[[14,-13],[17,-12]],.75);
  }else if(e.type==='cultist'){
    oval(c,'#352b4540',0,2,12,3);shape(c,'#745477',[[-5,-23],[5,-23],[8,-12],[12,1],[6,-1],[2,2],[-3,-1],[-10,1],[-7,-13]],P.ink,1.5);shape(c,'#ab79a2',[[-5,-20],[-1,-21],[-2,-5],[-6,-1]]);line(c,'#deb1bd',[[-4,-17],[-5,-4]],1);framed(c,P.gold,-7,-10,14,2,P.ink,.5);
    shape(c,'#a1759f',[[-8,-22],[-6,-29],[0,-34],[7,-29],[9,-21],[4,-17],[-4,-17]],P.ink,1);shape(c,'#363448',[[-5,-23],[-3,-28],[3,-28],[6,-23],[3,-19],[-2,-19]]);r(c,'#f4c776',-2,-24,2,1);r(c,'#f4c776',3,-24,2,1);line(c,'#deacc0',[[-6,-27],[0,-32],[5,-29]],1);
    framed(c,'#b88c79',12,-28,2,31,P.ink,.5);shape(c,P.ink,[[9,-29],[8,-34],[13,-38],[17,-34],[16,-29]]);shape(c,'#c8a4dd',[[10,-32],[13,-36],[15,-32],[13,-29]]);spark(c,13,-33+Math.sin(time*2),'#fff0d2');
  }else{
    oval(c,'#352b454a',1,4,27,6);c.translate(0,Math.round(Math.sin(time*2)*1)/2);for(const x of [-17,7]){shape(c,'#758d8d',[[x,-22],[x+11,-22],[x+13,-4],[x+16,3],[x-3,4],[x-4,0]],P.ink,2);shape(c,'#bbc3a0',[[x,-20],[x+4,-20],[x+4,-4],[x-1,-2]]);line(c,'#48516c',[[x+7,-16],[x+5,-9],[x+8,-4]],1);r(c,'#d2d4b3',x+1,-18,2,.5);r(c,'#444962',x+7,-5,3,1);}
    shape(c,'#647f88',[[-18,-47],[-7,-53],[10,-50],[22,-40],[20,-20],[8,-11],[-13,-14],[-23,-29]],P.ink,2);shape(c,'#a1b6a0',[[-17,-44],[-7,-49],[-3,-42],[-6,-20],[-15,-24]]);shape(c,'#42536e',[[-3,-40],[7,-43],[12,-31],[5,-19],[-4,-24]],P.ink,1);shape(c,'#e4b972',[[1,-37],[6,-34],[7,-28],[3,-23],[-1,-29]],P.ink,.75);shape(c,'#fff1b4',[[2,-34],[4,-32],[4,-27],[2,-29]]);
    for(const [x,flip] of [[-27,-1],[23,1]]){shape(c,'#829890',[[x-7,-41],[x+4,-46],[x+11,-37],[x+6,-29],[x-5,-29]],P.ink,1.5);shape(c,'#baca9e',[[x-5,-40],[x+3,-43],[x+7,-38],[x,-36]]);shape(c,'#6c7e85',[[x-3,-28],[x+6,-29],[x+9,-11],[x+4,-6],[x-4,-9]],P.ink,1.5);line(c,'#acc19e',[[x-1,-26],[x,-14]],2);}
    shape(c,'#95a399',[[-11,-62],[-5,-69],[8,-67],[13,-59],[10,-44],[-6,-44],[-13,-52]],P.ink,2);shape(c,'#c7c9a4',[[-9,-61],[-4,-66],[6,-64],[6,-60],[-2,-58]]);framed(c,'#37435d',-8,-58,18,6,P.ink,.75);r(c,'#f1c678',-6,-56,4,2);r(c,'#f1c678',4,-56,4,2);r(c,'#fff3bd',-5,-56,2,.5);r(c,'#657b80',-3,-50,8,3);
    for(const direction of [-1,1]){line(c,P.ink,[[direction*7,-64],[direction*18,-73],[direction*20,-87]],5);line(c,'#b89a7d',[[direction*7,-64],[direction*18,-73],[direction*20,-87]],2.5);line(c,P.ink,[[direction*17,-72],[direction*29,-77],[direction*30,-82]],3);line(c,'#d1b286',[[direction*17,-72],[direction*29,-77],[direction*30,-82]],1);shape(c,'#89b776',[[direction*19,-82],[direction*27,-87],[direction*24,-79]],P.ink,.5);}
    for(const [x,y]of [[-22,-41],[22,-39],[-11,-25]]){shape(c,'#70a47d',[[x-5,y],[x-2,y-4],[x+2,y-2],[x+5,y],[x+1,y+3]],P.ink,.5);r(c,'#b7d18c',x-2,y-2,2,1);}
    for(const [x,y]of [[-13,-35],[14,-27],[-26,-17],[28,-16]]){line(c,'#42506b',[[x,y-4],[x+2,y-1],[x,y+2],[x+3,y+3]],.75);r(c,'#d7d6b1',x-2,y-3,1.5,.5);r(c,'#b4c7ac',x+3,y+1,1,.5);}line(c,'#edca88',[[-20,-39],[-23,-35],[-19,-32],[-16,-35],[-20,-39]],.75);r(c,'#d69499',23,-42,2,2);r(c,'#ffe2b0',23.5,-41.5,1,1);
  }c.restore();
}
