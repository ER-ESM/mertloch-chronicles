import {loadWorldArt} from './asset-art.js';
import {drawMaifeld,fillMaifeldGround} from './maifeld-art.js';
import {drawBuilding} from './architecture.js';
import {drawClanHero,drawClanEnemy} from './clan-art.js';
await loadWorldArt();
const swatches=[['Waldschatten','#293a25'],['Moos','#52713a'],['Blattlicht','#a2b954'],['Kalkstein','#c8b58b'],['Strohgold','#d4a650'],['Ziegel','#ac623b'],['Clankirsche','#823c49'],['Leinen','#ebd4a7']];
document.querySelector('#swatches').innerHTML=swatches.map(([name,color])=>'<div class="swatch" style="background:'+color+'"><b>'+name+'</b>'+color.toUpperCase()+'</div>').join('');
function context(id){const cv=document.getElementById(id),c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#8ca369';c.fillRect(0,0,cv.width/2,cv.height/2);fillMaifeldGround(c,'groundGrass',0,0,cv.width/2,cv.height/2,.4);return c;}
const house=(id,x,y,w)=>({id,minX:x,maxY:y,w,h:80,wallHeight:74,roofHeight:29,door:{x:x+w*.5},style:'timber'});
function draw(time){let c=context('village');fillMaifeldGround(c,'groundPaving',0,220,600,40);drawBuilding(c,house(0,30,210,156),time);drawBuilding(c,house(1,240,218,158),time);drawMaifeld(c,'oak',488,217,176);drawMaifeld(c,'cart',442,246,38);drawClanHero(c,218,246,time,{classId:'dieter',facing:1},false,1.15);drawMaifeld(c,'mara',402,242,38);drawMaifeld(c,'chicken',548,244,15);
 c=context('characters');for(const[id,x]of[['dieter',62],['baerbel',183],['kevin',298]])drawClanHero(c,x,150,time,{classId:id,facing:1,moving:true},false,3.4);drawMaifeld(c,'horst',417,150,120);
 c=context('nature');for(const[name,x,h]of[['oak',80,128],['spruce',224,136],['apple',360,121]])drawMaifeld(c,name,x,150,h);drawMaifeld(c,'rocks',437,156,32);drawMaifeld(c,'cat',288,155,16);
}
function frame(now){if(!document.hidden)draw(now/1000);requestAnimationFrame(frame);}requestAnimationFrame(frame);
