import {PALETTE as P,box as r,shape,oval,line,framed,sprig,blossom,spark} from './pixel-style.js';
import {drawMaifeld} from './maifeld-art.js';

const ROOFS=[['#ac5268','#753f5a','#e68b78','#ffd39d'],['#517fa0','#394862','#8cb2c1','#d9dfc2'],['#599787','#3e5965','#92c4a0','#dfdfa1'],['#b27f59','#774e55','#e9b56e','#ffe5a7']];
const PLASTER=['#cdbb8e','#ffdfb2','#eac0a1','#c4d2b1','#ecd7bb'];

function window(c,x,y,style=0,stone=false){
  framed(c,'#bc8765',x-2,y-2,18,23);r(c,P.cream,x-1,y-2,16,1.5);framed(c,'#345669',x+1,y+1,12,16,P.ink,.5);
  r(c,style%3===0?'#f9c96f':'#83c5c2',x+2,y+2,4,6);r(c,style%3===0?'#ffe9a2':'#b5e0cf',x+8,y+2,4,6);r(c,'#598b9b',x+2,y+11,10,5);
  r(c,'#ffedbc',x+6.5,y+1,1.5,16);r(c,'#e9c394',x+1,y+8.5,12,1.5);line(c,'#f4f4d3',[[x+3,y+5],[x+5,y+3]],.5);r(c,P.ink,x-4,y+20,22,3);r(c,P.cream,x-4,y+19,22,1.5);
  if(!stone){const shutter=style%2?'#429b94':'#c36870';for(const sx of [x-8,x+17]){framed(c,shutter,sx,y,5,19);r(c,'#f5d59a',sx+.5,y+1,.5,17);for(let i=0;i<4;i++)r(c,'#293b4455',sx+1,y+3+i*4,3,.5);}framed(c,'#b57558',x-3,y+23,20,5);r(c,P.gold,x-2,y+23,18,1);for(let i=0;i<7;i++){sprig(c,x+i*2.5,y+23,'#4d976b',.4);blossom(c,x+i*2.5,y+21-i%2*2,i%2?'#eb8b8c':'#ffdf8b',.5);}}
}

function door(c,x,y,stone=false){
  // Same 18 x 35 opening as the gameplay grammar, dressed with a drawn arch.
  shape(c,'#b9886d',[[x-13,y],[x-13,y-28],[x-9,y-36],[x-3,y-39],[x+6,y-38],[x+13,y-30],[x+13,y]],P.ink,1.5);
  shape(c,stone?'#72617a':'#694c5d',[[x-9,y],[x-9,y-28],[x-6,y-33],[x+5,y-34],[x+9,y-28],[x+9,y]],P.ink,1);
  r(c,'#ac795d',x-7,y-27,14,26);for(let i=0;i<4;i++){r(c,'#dcab78',x-6+i*3,y-25,1,23);r(c,'#654755',x-5+i*3,y-25,.5,24);}r(c,P.ink,x-8,y-23,16,2);r(c,P.ink,x-8,y-8,16,2);
  oval(c,P.gold,x+4,y-14,2,2);oval(c,P.ink,x+4,y-14,1,1);r(c,P.cream,x+3,y-15,1,.5);r(c,P.ink,x-15,y+1,30,5);r(c,'#c1b7a1',x-15,y,30,3);r(c,P.cream,x-14,y,27,1);r(c,'#877f90',x-18,y+4,36,3);
  line(c,P.cream,[[x-12,y-29],[x-8,y-35],[x-2,y-37]],1.5);for(let i=0;i<3;i++)line(c,'#7b5961',[[x-13,y-8-i*8],[x-10,y-8-i*8]],.75);
}

function sign(c,x,y,variant,time){
  r(c,P.ink,x-3,y-5,4,25);line(c,P.ink,[[x-1,y-3],[x+16,y-3],[x+16,y+3]],2);line(c,'#d7ad78',[[x,y-4],[x+14,y-4]],.75);line(c,P.ink,[[x,y+4],[x+9,y-3]],1);
  const sway=Math.sin(time*.9+variant)*.015;c.save();c.translate(x+15,y+4);c.rotate(sway);framed(c,'#e4b976',-10,0,21,17,P.ink,1.5);r(c,P.cream,-9,1,19,1);r(c,'#b07861',-9,15,19,1);r(c,'#7f5660',-8,3,17,11);
  if(variant%4===0){oval(c,'#edc381',0,9,7,3.5);for(let i=0;i<3;i++)line(c,'#a56656',[[-4+i*3,7],[-3+i*3,9]],.75);}
  if(variant%4===1){sprig(c,0,13,'#a9d685',1);}
  if(variant%4===2){line(c,'#e4ddbb',[[-3,12],[3,5]],2);shape(c,'#81c9c3',[[-2,5],[1,2],[7,7],[4,10]],P.ink,.5);}
  if(variant%4===3){r(c,'#e5c07d',-1,4,1,10);for(let i=0;i<4;i++){shape(c,'#ffe4a3',[[-1,6+i*2],[-5,3+i*2],[-5,6+i*2]]);shape(c,'#ffe4a3',[[0,7+i*2],[4,4+i*2],[4,7+i*2]]);}}
  c.restore();
}

function roof(c,x,y,w,d,h,height,palette,id){
  const top=y-d-h,tip=top-height,front=y-h;
  const outline=[[x-10,front+2],[x-4,front-12],[x+5,tip+2],[x+14,tip-4],[x+w-12,tip-4],[x+w-3,tip+2],[x+w+5,front-12],[x+w+12,front+2],[x+w/2,front+7]];
  shape(c,palette[1],outline,P.ink,2.5);
  const face=[[x+14,tip],[x+w-12,tip],[x+w+6,front-2],[x+w/2,front+3],[x-4,front-2]];shape(c,palette[0],face);
  // Individual overlapping fish-scale tiles, selectively chipped and inked.
  c.save();c.beginPath();face.forEach(([xx,yy],i)=>i?c.lineTo(xx,yy):c.moveTo(xx,yy));c.closePath();c.clip();
  for(let row=0,yy=tip+2;yy<front+5;row++,yy+=7){for(let col=-1,xx=x-7+(row%2)*5;xx<x+w+14;col++,xx+=10){const alt=((col*7+row*11+id)%13+13)%13;shape(c,alt===0?palette[1]:alt<3?palette[2]:palette[0],[[xx,yy],[xx+9,yy],[xx+9,yy+4],[xx+7,yy+6],[xx+2,yy+6],[xx,yy+4]]);line(c,palette[1],[[xx,yy+1],[xx,yy+4],[xx+2,yy+6],[xx+7,yy+6],[xx+9,yy+4]],.75);line(c,palette[2],[[xx+1,yy+1],[xx+7,yy+1]],.75);if(alt===4){r(c,palette[3],xx+2,yy+2,2,.5);r(c,palette[1],xx+6,yy+3,1,1);}if(alt===8){r(c,'#629b7b',xx+1,yy+4,3,1);r(c,'#9cc78a',xx+1,yy+4,1,.5);}}}
  c.restore();
  line(c,P.ink,[[x-9,front+1],[x+w*.5,front+6],[x+w+11,front+1]],3);line(c,palette[3],[[x-8,front],[x+w*.5,front+4],[x+w+10,front]],1);
  for(let xx=x+13;xx<x+w-12;xx+=8){framed(c,palette[2],xx,tip-4,7,3,P.ink,.5);r(c,palette[3],xx+1,tip-4,5,.5);}
  if(id%3!==1){const dx=x+w*(id%2?.36:.61),dy=tip+(d+height)*.64;
    shape(c,'#293b4438',[[dx-18,dy-27],[dx+23,dy-15],[dx+27,dy+9],[dx-14,dy+3]]);
    shape(c,'#efd0a2',[[dx-14,dy+3],[dx-14,dy-20],[dx,dy-35],[dx+14,dy-20],[dx+14,dy+3]],P.ink,1.5);
    shape(c,palette[1],[[dx-19,dy-18],[dx-4,dy-38],[dx,dy-39],[dx+20,dy-18],[dx+13,dy-18],[dx,dy-31],[dx-12,dy-18]],P.ink,1.5);line(c,palette[3],[[dx-18,dy-19],[dx-3,dy-37],[dx+1,dy-37]],1);
    oval(c,P.ink,dx,dy-11,8,9);oval(c,'#4d8d9b',dx,dy-11,6,7);oval(c,'#a8d9cd',dx-1,dy-13,4,4);r(c,P.cream,dx-.5,dy-18,1,14);r(c,P.cream,dx-6,dy-11,12,1);r(c,P.ink,dx-17,dy+2,34,2);r(c,P.gold,dx-15,dy+1,30,1);}
}

function tower(c,x,y,time){c.save();c.translate(x,y);c.scale(1.4,1.4);
  shape(c,'#b7bdbe',[[-20,0],[-20,-138],[20,-138],[24,-2]],P.ink,2);r(c,'#ddd9ba',-18,-136,7,132);r(c,'#7d819c',13,-136,8,135);
  for(let yy=-130;yy<-2;yy+=8)for(let xx=-18+(Math.floor(yy/8)%2)*5;xx<20;xx+=11){r(c,'#748099',xx,yy,8,.5);r(c,'#f6e6ba',xx,yy-6,4,.5);}
  for(const yy of [-96,-47,-3]){framed(c,'#bba884',-23,yy,47,4,P.ink,1);r(c,P.cream,-22,yy,44,1);}
  for(const xx of [-12,3]){shape(c,P.ink,[[xx,-105],[xx,-122],[xx+4,-128],[xx+9,-122],[xx+9,-105]]);r(c,'#58788b',xx+2,-121,5,15);for(let yy=-119;yy<-107;yy+=3)r(c,'#b2c8c4',xx+2,yy,5,1);}
  oval(c,P.ink,1,-71,15,15);oval(c,P.gold,1,-71,13,13);oval(c,'#37455d',1,-71,10.5,10.5);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;r(c,P.cream,1+Math.sin(a)*8.5,-71+Math.cos(a)*8.5,1,1);}line(c,P.cream,[[1,-79],[1,-71],[7,-68]],1);oval(c,P.coral,1,-71,1.5,1.5);
  shape(c,'#436582',[[-28,-139],[-20,-151],[-7,-181],[-1,-207],[4,-206],[13,-171],[27,-141],[20,-137],[-21,-136]],P.ink,2);shape(c,'#76a3b5',[[-26,-141],[-17,-152],[-5,-183],[0,-202],[1,-161],[-5,-142]]);for(let yy=-148;yy>-195;yy-=7)line(c,'#bad2cb',[[-3,yy],[-10+(yy+150)*.14,yy+1]],.5);
  r(c,P.ink,0,-219,2,13);r(c,P.gold,.5,-218,1,11);line(c,P.ink,[[-5,-214],[7,-214]],3);line(c,P.gold,[[-4,-214],[6,-214]],1);oval(c,P.gold,1,-205,2,2);
  door(c,1,0,true);c.restore();
}

export function drawBuilding(c,b,time){
  const x=Math.round(b.minX),y=Math.round(b.maxY),w=Math.round(b.w),d=Math.round(b.h),h=b.wallHeight,stone=b.church||b.style==='chapel',palette=ROOFS[stone?1:b.id%4],base=stone?'#c3c5bd':PLASTER[b.id%5];
  shape(c,'#2e454d43',[[x+7,y-d+10],[x+w+27,y-d+25],[x+w+29,y+16],[x+7,y+7]]);
  framed(c,base,x,y-h,w,h,P.ink,2);r(c,stone?'#969cb0':'#c49386',x+w-13,y-h,13,h);r(c,P.cream,x+1,y-h,3,h-8);r(c,'#a29497',x,y-9,w,9);line(c,P.ink,[[x,y-9],[x+w,y-9]],1);
  for(let i=0;i<Math.floor(w/13);i++){const xx=x+i*13;r(c,'#d9c5a4',xx+1,y-7,10,5);r(c,'#706778',xx+1,y-7,10,.5);r(c,P.cream,xx+2,y-6,6,.5);}
  if(stone){for(let yy=y-h+3;yy<y-9;yy+=8)for(let xx=x+3+(Math.floor(yy/8)%2)*5;xx<x+w-16;xx+=13){r(c,'#9094a099',xx,yy,10,.5);r(c,'#f9e7bb88',xx+1,yy+1,5,.5);if((xx+yy)%3<1)r(c,'#828694',xx+8,yy+1,.5,6);}}
  else{for(let i=0;i<10;i++){const xx=x+5+(b.id+i*23)%(w-23),yy=y-h+8+(i*17)%(h-22);r(c,'#b0847838',xx,yy,3,1);r(c,'#fff2c380',xx,yy+1,2,.5);}for(const xx of [x+4,x+w-19]){r(c,P.ink,xx,y-h,5,h-9);r(c,'#825663',xx+.5,y-h,3,h-10);r(c,'#d09b7b',xx+1,y-h,1,h-10);}if(b.style==='timber'||b.id%3===0){framed(c,'#825663',x+3,y-h+32,w-20,3,P.ink,.5);for(let xx=x+9;xx<x+w-35;xx+=33){line(c,P.ink,[[xx,y-h+4],[xx+23,y-h+29]],4);line(c,'#a87669',[[xx,y-h+4],[xx+23,y-h+29]],2);}}}
  door(c,b.door.x,y,stone);
  for(let xx=x+21;xx<x+w-31;xx+=39){if(h>71&&Math.abs(xx-b.door.x)>28)window(c,xx-7,y-35,b.id,stone);window(c,xx-7,y-h+9,b.id,stone);}
  if(!stone){
    for(const px of [x+10,x+w-8]){framed(c,'#b86e6c',px-4,y-6,7,6,P.ink,.75);r(c,'#efae87',px-5,y-8,9,2);sprig(c,px,y-8,'#5aa777',.9);blossom(c,px-1,y-15,b.id%2?'#ef9c9b':'#ffe29b',.7);}
    if(b.id%3===0)for(let i=0;i<9;i++)sprig(c,x+7+Math.sin(i*1.5)*3,y-8-i*5,i%2?'#529a73':'#8eb96d',.65);
    for(let i=0;i<6;i++){const xx=x+w-32+i%3*5,yy=y-3-Math.floor(i/3)*4;oval(c,P.ink,xx,yy,3,2.5);oval(c,'#c0906b',xx,yy,2,1.5);r(c,'#f0c790',xx-1,yy-.5,1,1);}
  }
  roof(c,x,y,w,d,h,b.roofHeight,palette,b.id);
  if(!stone){const cx=x+w*.77,cy=y-d-h-b.roofHeight+23;framed(c,'#b07b81',cx,cy-25,13,28,P.ink,1.5);r(c,'#e5b193',cx,cy-24,4,25);for(let j=0;j<4;j++){r(c,'#684f66',cx,cy-18+j*6,13,1);r(c,'#f3cd9e',cx+1,cy-17+j*6,3,.5);}framed(c,'#e0b48f',cx-3,cy-27,19,4,P.ink,1);r(c,P.ink,cx+1,cy-28,10,2);
    c.save();const alpha=c.globalAlpha;for(let i=0;i<4;i++){const phase=(time*5+i*10)%43;c.globalAlpha=alpha*(1-phase/55)*.22;oval(c,'#f9e6be',cx+6+Math.sin(time*.8+i)*5+phase*.12,cy-34-phase,4+phase*.11,2+phase*.07);}c.restore();
    if(b.id%2===0)sign(c,x+w-12,y-41,b.id,time);
  }
  if(b.church)tower(c,x+w*.24,y-5,time);
  if(stone){for(const bx of [x+w-33,x+w-16]){framed(c,'#a09383',bx,y-65,6,59,P.ink,1);r(c,'#ded2ae',bx,y-65,2,57);}if(!b.church){oval(c,P.ink,x+w*.5,y-h+22,14,15);oval(c,'#c196ae',x+w*.5,y-h+22,11,12);line(c,P.cream,[[x+w*.5,y-h+11],[x+w*.5,y-h+33]],1);line(c,P.cream,[[x+w*.5-10,y-h+22],[x+w*.5+10,y-h+22]],1);}}
}

export function drawFurniture(c,p,time){const x=p.x,y=p.y;
 if(p.type==='lantern'){line(c,'#594d35',[[x,y],[x,y-38],[x+9,y-38]],2);if(drawMaifeld(c,'lantern',x+9,y-15,24))return;}
 if(p.type==='bench'&&drawMaifeld(c,'bench',x,y+4,25))return;
 if(p.type==='cart'&&drawMaifeld(c,'cart',x,y+4,35))return;
  oval(c,'#30495135',x+3,y+4,p.type==='lantern'?8:23,4);
  if(p.type==='bench'){for(const dx of [-17,15]){framed(c,'#687a83',x+dx,y-3,3,12,P.ink,1);line(c,P.ink,[[x+dx,y-4],[x+dx-2,y-16]],2);}for(const dy of [-20,-13,-4]){framed(c,'#c28e65',x-21,y+dy,42,5,P.ink,1);r(c,P.cream,x-20,y+dy,39,.5);line(c,'#875966',[[x-15,y+dy+3],[x+4,y+dy+2],[x+13,y+dy+3]],.5);for(const dx of [-17,16])r(c,'#e7bc85',x+dx,y+dy+2,1,1);}}
  if(p.type==='cart'){for(const dx of [-16,17]){oval(c,P.ink,x+dx,y+3,5,8);oval(c,'#a5aeb0',x+dx,y+3,3.5,6);oval(c,P.ink,x+dx,y+3,1.5,2);line(c,P.ink,[[x+dx,y-2],[x+dx,y+8]],1);}framed(c,'#b67d65',x-20,y-17,41,19,P.ink,1.5);for(let i=0;i<5;i++){r(c,'#e5b581',x-18+i*8,y-14,5,13);r(c,'#825864',x-18+i*8,y-14,.5,12);}r(c,P.cream,x-21,y-18,44,2);for(let i=0;i<9;i++){const xx=x-15+(i%5)*7,yy=y-23+Math.floor(i/5)*4;oval(c,P.ink,xx,yy,4,3.5);oval(c,i%3===0?'#e58e70':'#90b867',xx,yy,3,2.5);r(c,'#fff0ab',xx-1,yy-1,1,1);}line(c,P.ink,[[x+21,y-4],[x+36,y+1]],4);line(c,'#c99873',[[x+21,y-4],[x+36,y+1]],2);}
  if(p.type==='lantern'){framed(c,'#668290',x-1.5,y-42,3,42,P.ink,1);r(c,'#acc3be',x-1,y-40,.5,37);framed(c,'#8da6ab',x-5,y-3,10,4,P.ink,1);shape(c,'#cf9a69',[[x-8,y-43],[x-6,y-47],[x,y-51],[x+6,y-47],[x+8,y-43]],P.ink,1);framed(c,'#f7c471',x-5,y-43,10,12,P.ink,1);r(c,'#fff3b7',x-3,y-41,5,8);r(c,'#fffade',x-2,y-40,2,6);r(c,P.ink,x,y-43,1,12);framed(c,'#c2916b',x-7,y-31,14,2,P.ink,1);spark(c,x+4,y-37);}
}
