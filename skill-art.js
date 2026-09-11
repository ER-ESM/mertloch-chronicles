import {paintUiIcon} from './ui-art.js';
// Hand-painted 32 px icons share the environment's wood, jade and honey ramps.
export function paintSkillIcon(canvas,id,member='dieter'){
 const image=id==='strike'?(member==='baerbel'?'speaker':member==='kevin'?'reinforced':'bottle'):id==='buff'?(member==='baerbel'?'speaker':member==='kevin'?'shield':'bottle'):({throw:'bottle',ground:'burst',heal:'food',parry:'shield',dash:'dash',mark:'mark',burst:'burst',interrupt:'interrupt'})[id];if(paintUiIcon(canvas,image))return;
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,32,32);
 const r=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},ink='#233b43',light='#ecd399',wood='#a78056',jade='#609f86';
 const framed=(col,x,y,w,h)=>{r(ink,x-1,y-1,w+2,h+2);r(col,x,y,w,h);r(light,x,y,w,1);};
 if(id==='strike'&&member==='baerbel'){framed('#665374',6,3,21,26);for(const y of [11,23]){r(ink,10,y-4,13,9);r('#aa8ea2',12,y-3,9,7);r(ink,14,y-2,5,5);}return;}
 if(id==='strike'&&member==='kevin'){framed(wood,15,10,3,19);framed('#b86754',10,6,13,7);r('#d99568',12,3,9,4);r(light,13,4,3,2);return;}
 if(id==='strike'||id==='buff'||id==='heal'){framed('#9fb58b',13,3,6,6);framed(jade,10,10,12,18);r('#375c60',19,11,2,16);r('#a2c695',11,11,2,15);framed('#d8c391',10,16,12,8);if(id==='heal'){r('#a96254',15,17,3,6);r('#a96254',13,19,7,2);}else{r('#a57a51',14,18,4,4);}if(id==='buff'){r(light,4,9,1,5);r(light,2,11,5,1);r(light,26,3,1,5);r(light,24,5,5,1);}return;}
 if(id==='dash'){for(let i=0;i<3;i++)r('#9db39a',2+i,9+i*6,8-i*2,1);framed('#80684f',13,5,8,16);framed('#b39161',10,19,16,6);r(ink,8,25,20,3);r(light,10,20,5,2);for(let y=9;y<20;y+=3)r('#dab683',15,y,4,1);return;}
 if(id==='parry'){r(ink,6,4,22,17);r(wood,7,5,20,15);r('#c5a370',9,7,16,11);r('#657875',8,10,18,2);r('#657875',8,16,18,2);r('#46616a',9,20,16,4);r(ink,12,24,10,3);r(light,6,3,8,2);r('#d6be83',17,9,2,13);return;}
 if(id==='mark'){framed('#d0c395',8,5,17,23);r('#b19777',20,6,4,21);for(let y=9;y<23;y+=4)r('#7f8777',11,y,9,1);r('#a55d52',14,14,7,7);r('#dd9467',15,15,3,3);return;}
 if(id==='interrupt'){framed('#727c77',7,6,20,19);r(ink,10,10,14,9);r('#c4c092',11,11,12,7);r('#a66051',5,24,3,3);for(let i=0;i<6;i++){r(ink,7+i*3,22-i*3,5,4);r('#d58c65',8+i*3,22-i*3,3,2);}return;}
 if(id==='burst'){for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.round(16+Math.cos(a)*11),y=Math.round(16+Math.sin(a)*11);r('#a67365',x,y,3,3);r(light,x,y,1,1);}framed('#b77865',10,10,13,13);r('#e7bb7c',12,12,9,9);r('#f5df9c',15,14,4,5);r('#a76557',10,21,5,3);}
}
