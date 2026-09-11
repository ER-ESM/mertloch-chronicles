import {paintUiIcon,drawUiSprite} from './ui-art.js';
// Shared, crisp 24 px item vocabulary for bags, equipment and ground loot.
export function drawItem(c,id,x=0,y=0,s=1){if(drawUiSprite(c,id,x,y,24*s))return;c.save();c.translate(x,y);c.scale(s,s);c.imageSmoothingEnabled=false;const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const gold='#d7b467',dark='#28352c',light='#f0d799';
 if(id==='bottle'||id==='water'){rect(9,2,6,4,dark);rect(10,3,4,5,gold);rect(7,9,10,13,dark);rect(8,10,8,11,id==='water'?'#679da5':'#709452');rect(9,13,6,5,light);rect(9,10,2,3,'#b6d293');}
 else if(id==='coat'){rect(6,4,12,17,dark);rect(2,6,5,9,dark);rect(17,6,5,9,dark);rect(7,5,10,15,'#7b7655');rect(3,7,3,7,'#ada073');rect(18,7,3,7,'#ada073');rect(10,4,4,5,gold);rect(11,9,2,11,dark);rect(8,13,2,3,gold);}
 else if(id==='food'){for(const [x,y] of [[4,6],[12,6],[3,12],[14,12],[7,15]]){rect(x,y,7,6,'#694329');rect(x+1,y,5,4,'#d9a653');rect(x+2,y,1,1,light);}rect(8,9,2,4,dark);rect(14,9,2,4,dark);}
 else if(id==='boots'){rect(4,3,6,13,dark);rect(14,3,6,13,dark);rect(3,15,8,6,dark);rect(13,15,8,6,dark);rect(5,4,4,11,'#987957');rect(15,4,4,11,'#987957');rect(4,16,6,3,gold);rect(14,16,6,3,gold);}
 else if(id==='ring'){rect(5,5,14,14,dark);rect(7,6,10,12,gold);rect(9,8,6,8,dark);rect(10,3,5,5,'#a4c8b4');rect(11,4,2,2,'#e1f4cd');}
 else if(id==='paper'){rect(5,3,15,19,dark);rect(6,3,12,17,light);for(let y=7;y<18;y+=4)rect(9,y,7,1,'#8a7650');rect(11,10,3,3,dark);}
 else if(id==='cable'){rect(4,5,16,15,dark);rect(7,8,10,9,'#7b8061');rect(9,10,6,5,dark);rect(4,3,4,5,gold);rect(16,17,4,5,gold);}
 else if(id==='bag'){rect(8,3,8,4,dark);rect(9,4,6,3,gold);rect(5,8,14,13,dark);rect(6,9,12,11,'#aa804a');rect(8,10,3,8,'#d3ad68');rect(7,8,10,2,gold);rect(11,9,2,5,dark);}
 else{rect(5,5,14,14,dark);rect(7,4,10,16,'#ad9864');rect(4,8,16,8,'#ad9864');rect(8,8,8,8,gold);rect(10,10,4,4,'#5d7652');}c.restore();}
export function paintItem(canvas,id){if(paintUiIcon(canvas,id))return;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawItem(c,id,0,0,canvas.width/24);}
