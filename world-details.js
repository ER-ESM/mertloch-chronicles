import {WORLD_SCALE} from './world-scale.js';
import {box as r,shape,oval,line,framed,PALETTE as P} from './pixel-style.js';
import {drawMaifeld,maifeld,fillMaifeldGround} from './maifeld-art.js';
function crate(c,x,y){framed(c,'#a07858',x,y,15,13,P.ink,.8);for(let i=0;i<3;i++)r(c,'#d2a26c',x+2+i*4,y+1,2,10);line(c,'#e8c18c',[[x+1,y+11],[x+13,y+2]],1);}
function barrel(c,x,y){oval(c,P.ink,x,y,8,4);framed(c,'#9a7362',x-8,y-12,16,13,P.ink,.7);oval(c,'#d3aa7c',x,y-12,8,3);for(const dy of [-8,-2])r(c,'#685b69',x-8,y+dy,16,2);r(c,'#ebc99a',x-5,y-10,1,8);}
function lantern(c,x,y,t){line(c,'#594d35',[[x,y],[x,y-32],[x+9,y-32]],2);if(drawMaifeld(c,'lantern',x+9,y-18,WORLD_SCALE.lantern))return;framed(c,'#dac293',x+4,y-25,8,12,P.ink,.8);r(c,'#ffe6a1',x+6,y-23,4,8);}
function board(c,x,y,text){if(drawMaifeld(c,'board',x,y+3,WORLD_SCALE.board))return;framed(c,'#8a665a',x-2,y-7,3,15,P.ink,.5);framed(c,'#554655',x-22,y-28,44,22,'#d0ad77',1);c.font='bold 5px Georgia';c.textAlign='center';c.fillStyle='#f2d7a1';c.fillText(text,x,y-19);for(const xx of [-14,-3,8]){r(c,'#e8d6ad',x+xx,y-15,8,7);r(c,'#ac8b91',x+xx+2,y-13,4,.5);r(c,'#a08e87',x+xx+2,y-11,3,.5);}}
function drawSiteProps(c,site,time){if(!site.dressing||!maifeld.tent)return false;for(const p of site.dressing){if(p.type==='board')board(c,p.x,p.y,'AUFTRÄGE');else if(p.type==='lantern')lantern(c,p.x,p.y,time);else drawMaifeld(c,p.type,p.x,p.y,WORLD_SCALE[p.type]??p.height);}return true;}
export function drawHub(c,hub,time){if(drawSiteProps(c,hub,time))return;if(hub.id==='kirchplatz'){board(c,hub.x-72,hub.y+4,'CLAN-BRETT');return;}const x=hub.x,y=hub.y;c.save();
 if(maifeld.tent){drawMaifeld(c,'tent',x,y-20,WORLD_SCALE.tent);drawMaifeld(c,'supplies',x-64,y+3,WORLD_SCALE.supplies);board(c,x+80,y+4,'AUFTRÄGE');lantern(c,x-87,y-6,time);c.restore();return;}
 oval(c,'#293b4425',x,y-5,65,17);for(const xx of [-55,55]){framed(c,'#8d6d60',x+xx,y-40,3,42,P.ink,.6);r(c,'#ddb98a',x+xx,y-38,1,36);}
 shape(c,'#558d82',[[x-63,y-40],[x-50,y-60],[x+50,y-60],[x+63,y-40]],P.ink,1);
 for(let i=0;i<8;i++){const xx=x-62+i*16;shape(c,i%2?'#ead2a2':'#85b8a1',[[xx,y-40],[xx+16,y-40],[xx+13,y-31],[xx+4,y-31]],P.ink,.5);}
 framed(c,'#8e705c',x-48,y-23,96,8,P.ink,1);r(c,'#dfb882',x-47,y-23,94,2);crate(c,x-51,y-14);barrel(c,x+65,y+1);board(c,x+84,y-15,'AUFTRÄGE');lantern(c,x-76,y-6,time);
 for(let i=0;i<7;i++){r(c,'#638a79',x-40+i*10,y-29,4,6);r(c,'#eedba2',x-40+i*10,y-32,4,3);r(c,'#d09b7c',x-39+i*10,y-27,2,2);}c.restore();}
export function drawOccupiedCamp(c,camp,time,clear){if(drawSiteProps(c,camp,time))return;const x=camp.x,y=camp.y;c.save();
 if(maifeld.tent){drawMaifeld(c,'tent',x-70,y-68,WORLD_SCALE.tent);drawMaifeld(c,'supplies',x+73,y-30,WORLD_SCALE.supplies);lantern(c,x-112,y+12,time);board(c,x+101,y+18,clear?'FREIGERÄUMT':camp.type==='boss'?'RUHE 22:01':'BESETZT');c.restore();return;}
 const roof=clear?'#809b88':camp.type==='boss'?'#946580':camp.type==='cultist'?'#898ba0':'#d28b77';
 // Silhouette sits behind the combat clearing. Decorations never create hidden colliders.
 const tx=x-70,ty=y-74;oval(c,'#293b442b',tx+10,ty+7,41,12);shape(c,roof,[[tx-35,ty],[tx,ty-44],[tx+37,ty],[tx+29,ty+6],[tx-28,ty+6]],P.ink,1);shape(c,'#473b50',[[tx-13,ty+4],[tx,ty-31],[tx+13,ty+4]],P.ink,.5);line(c,'#ecc79e',[[tx-29,ty-1],[tx,ty-39],[tx+31,ty]],1);line(c,'#76676b',[[tx-32,ty],[tx-46,ty+10]],.7);line(c,'#76676b',[[tx+32,ty],[tx+45,ty+10]],.7);
 // Painted cloth folds, worn hems and peg highlights, using the roof's warm ramps.
 shape(c,'#edd3a340',[[tx-30,ty-1],[tx-2,ty-39],[tx-12,ty-10],[tx-17,ty+3]]);shape(c,'#29424a38',[[tx+3,ty-37],[tx+34,ty],[tx+24,ty+3],[tx+13,ty-16]]);
 for(let i=0;i<11;i++){const t=i/11,xx=tx-29+t*27,yy=ty-2-t*36;line(c,'#e1c699',[[xx,yy],[xx+1,yy+2]],.5);line(c,'#765e52',[[tx+29-t*25,ty-1-t*33],[tx+26-t*23,ty-1-t*33]],.5);}
 for(const [dx,dy]of [[-23,-5],[-17,-13],[-12,-22],[17,-9],[10,-23],[23,-2]]){r(c,'#f0d7a535',tx+dx,ty+dy,3,.5);r(c,'#30444b30',tx+dx+1,ty+dy+2,2,.5);}for(const dx of [-46,45]){r(c,'#31464b',tx+dx,ty+8,2,5);r(c,'#bfa070',tx+dx,ty+8,1,2);}
 barrel(c,x+75,y-55);crate(c,x+60,y-37);crate(c,x+79,y-26);lantern(c,x-112,y+12,time);board(c,x+101,y+18,clear?'FREIGERÄUMT':camp.type==='boss'?'RUHE 22:01':'BESETZT');
 if(camp.type==='wolf'){framed(c,'#655367',x+35,y-72,27,12,P.ink,1);for(let i=0;i<5;i++)r(c,'#c4b3a2',x+37+i*5,y-71,1,10);for(const dx of [3,19])r(c,P.ink,x+35+dx,y-60,2,10);r(c,'#d9a081',x+40,y-68,13,2);}
 else{framed(c,'#756881',x+40,y-103,24,37,P.ink,1);for(const dy of [-94,-77]){oval(c,P.ink,x+52,y+dy,7,7);oval(c,'#b495b5',x+52,y+dy,4,4);}r(c,'#e6b986',x+44,y-101,16,2);}
 for(let i=0;i<9;i++){const dx=Math.sin(i*3.1)*105,dy=Math.cos(i*2.3)*72;if(Math.hypot(dx,dy)<65)continue;r(c,i%2?'#e0d2b0':'#8fa383',x+dx,y+dy,3,2);r(c,'#756774',x+dx,y+dy+2,3,.5);}
 c.restore();}
export function groundDetails(c,w,ox,oy,S){
 for(const camp of w.camps){if(camp.x<ox-160||camp.x>ox+S+160||camp.y<oy-140||camp.y>oy+S+140)continue;for(let i=0;i<55;i++){const a=i*2.399,radius=19+Math.sqrt(i/55)*103,x=camp.x+Math.cos(a)*radius,y=camp.y+Math.sin(a)*radius*.7;c.save();c.beginPath();c.ellipse(x,y,9+i%8,5+i%5,0,0,Math.PI*2);c.clip();fillMaifeldGround(c,'groundDirt',x-18,y-12,36,24,.18);c.restore();}}}

export function prepareDetails(w){const details=[];for(const b of w.buildings){if(b.church)continue;for(const [i,x]of [b.minX-17,b.maxX+17].entries()){const y=b.maxY+11;if(w.blocked(x,y,11)||w.onRoad(x,y,14)||w.reserved(x,y,12))continue;details.push({x,y,kind:(b.id+i)%4,seed:b.id});}}return details;}
export function drawEstateDetail(c,p,time){const x=p.x,y=p.y;
 if((p.kind===0||p.kind===3)&&drawMaifeld(c,'supplies',x,y+3,WORLD_SCALE.supplies))return;
 if(p.kind===1&&drawMaifeld(c,'bench',x,y+3,WORLD_SCALE.bench))return;
 if(p.kind===0){barrel(c,x,y);for(let i=0;i<5;i++){const xx=x-7+i*3;line(c,'#4c826d',[[x,y-15],[xx,y-25-i%2*4]],1);oval(c,['#e3b17d','#c58498','#e4d5ac'][i%3],xx,y-25-i%2*4,2,1.5);}}
 else if(p.kind===1){for(let j=0;j<3;j++)for(let i=0;i<3-j;i++){const xx=x-9+i*8+j*4,yy=y-j*5;oval(c,P.ink,xx,yy,4.5,3);oval(c,'#bd9975',xx,yy,3.5,2);oval(c,'#7c685b',xx,yy,1.5,1);r(c,'#e9c9a0',xx-2,yy-1,1,1);}shape(c,'#748a87',[[x-15,y-11],[x-7,y-16],[x+12,y-7],[x+12,y-4],[x-11,y-11]],P.ink,.5);}
 else if(p.kind===2){for(let i=0;i<4;i++){const xx=x-12+i*8;framed(c,'#c2a77b',xx,y-14,3,18,P.ink,.5);shape(c,'#e3ca98',[[xx-1,y-14],[xx+1.5,y-18],[xx+4,y-14]],P.ink,.5);}r(c,'#886e5d',x-13,y-7,30,2);r(c,'#e3c997',x-13,y-7,30,.5);for(let i=0;i<5;i++){r(c,'#6b946f',x-13+i*7,y+3,3,1);r(c,'#d6c984',x-12+i*7,y,1,3);}}
 else{crate(c,x-8,y-12);for(let i=0;i<5;i++){oval(c,i%2?'#d3a365':'#a9bd82',x-5+i*2,y-14-i%2*3,2.5,2);r(c,'#526e64',x-4+i*2,y-17-i%2*3,1,2);}const s=Math.sin(time+p.seed)*.3;r(c,'#eddaa8',x+8,y-3+s,5,2);r(c,'#8b7275',x+9,y-3+s,3,.5);}}
