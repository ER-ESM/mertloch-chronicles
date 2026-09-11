import {PALETTE as P,box as r,shape,oval,line,framed,spark} from './pixel-style.js';
import {drawMaifeld} from './maifeld-art.js';
export function fountain(c,s,time){if(drawMaifeld(c,'fountain',s.x,s.y+6,43)){for(let i=0;i<4;i++){const t=(time*.8+i*.25)%1;r(c,'#d2e8be',s.x+Math.sin(i*2)*10,s.y-25+t*19,1,2);}return;}c.save();c.translate(s.x,s.y);oval(c,'#30495138',3,5,20,7);
  oval(c,P.ink,0,0,19,10);oval(c,'#929eac',0,0,17.5,8.5);oval(c,P.ink,0,-3,19,8);oval(c,'#e3d1b1',0,-3,17.5,6.5);oval(c,'#41667c',0,-3,14,5);oval(c,'#67b7ba',0,-2,12.5,3.5);
  for(let i=0;i<8;i++){const a=i/7*Math.PI,x=Math.cos(a)*17,y=Math.sin(a)*7;line(c,'#6b657e',[[x,-2+y],[x,y+1]],.75);r(c,'#fff0c9',x-1,-3+y,2,.5);}
  for(let i=0;i<3;i++){const phase=(time*.6+i*.33)%1;c.save();c.globalAlpha*=1-phase;oval(c,'#b7e3ce',0,-3,3+phase*9,1+phase*2);oval(c,'#67b7ba',0,-3,2+phase*9,.5+phase*2);c.restore();}
  framed(c,'#95aaa9',-3,-22,6,20,P.ink,.75);r(c,'#d3d8b8',-2,-21,1.5,18);framed(c,'#e1be89',-5,-24,10,3,P.ink,.75);
  shape(c,'#c6d6c4',[[0,-32],[-4,-28],[-2,-25],[3,-25],[4,-28]],P.ink,.75);spark(c,0,-28);
  for(const direction of [-1,1]){c.strokeStyle='#b9e5df';c.lineWidth=1.25;c.beginPath();c.moveTo(direction*3,-21);c.quadraticCurveTo(direction*11,-21,direction*9,-4);c.stroke();for(let i=0;i<4;i++){const t=(time*.8+i*.25)%1,x=direction*(3+12*t-6*t*t),y=-21+17*t*t;r(c,'#f4ffda',x,y,.5,1.5);}}c.restore();
}
export function wildlife(c,w,time,visible){
  // Butterflies stay close to actual flower beds, never drift with the camera.
  for(let i=0;i<w.props.length;i+=17){const p=w.props[i];if(p.type==='rock'||!visible(p,30))continue;const x=p.x+Math.sin(time*.65+i)*19,y=p.y-14+Math.cos(time*.9+i)*9,wing=Math.abs(Math.sin(time*9+i))*2+.5;r(c,'#4b5941',x,y,.5,2);r(c,i%2?'#f5d79b':'#d6def0',x-wing,y-1,wing,1.5);r(c,i%2?'#e9b879':'#b7cbdc',x+.5,y-1,wing,1.5);}
  // Small flocks circle around the church. Time is game time, so pause is respected.
  for(let i=0;i<5;i++){const a=time*.055+i*.14,x=w.church.x+Math.cos(a)*420+i*17,y=w.church.y+Math.sin(a)*270-40;if(!visible({x,y},20))continue;const flap=Math.sin(time*6+i)*2;c.strokeStyle='#2b4843a0';c.lineWidth=.75;c.beginPath();c.moveTo(x-4,y-2-flap);c.lineTo(x,y);c.lineTo(x+4,y-2-flap);c.stroke();}
}
