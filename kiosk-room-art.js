import {KIOSK_ROOM as R,KIOSK_TEXT as T} from './content/index.js';
import {WORLD_ART_DENSITY} from './art-quality.js';
import {WORLD_SCALE} from './world-scale.js';
import {drawWorldPerson} from './person-art.js';
import {drawClanHero} from './clan-art.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {ITEMS} from './rpg.js';
import {drawBuilding} from './architecture.js';
import {drawProp} from './world-prop-ui.js';
import {fillMaifeldGround,drawMaifeld} from './maifeld-art.js';
const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function text(c,s,x,y,size=9){c.font=`${size}px 'Jersey 15',sans-serif`;c.textAlign='center';c.fillStyle='#f1d18b';c.fillText(s,x,y);}
// All furnishings use the existing precision catalog and its world-prop drawing contract.
function furniture(c,b){drawProp(c,{kind:b.art,x:b.x+b.w/2,y:b.y+b.h/2,w:b.w,h:b.h});}
function beam(c,x,y,w,h){
 box(c,'#3e352e',x,y,w,h);box(c,'#785639',x+1,y+1,w-2,h-2);
 box(c,'#af8350',x+1,y+1,w>h?w-2:1,w>h?1:h-2);
 for(let n=4;n<(w>h?w:h)-3;n+=9)box(c,'#59402e',x+(w>h?n:3),y+(w>h?3:n),w>h?5:1,w>h?1:5);
}
function roomShell(c){
 // Reuse the village's limestone texture, subdued so actors remain readable.
 box(c,'#0d1513',-8,-46,R.width+20,R.height+62);
 box(c,'#88775b',0,20,R.width,R.height-20);
 fillMaifeldGround(c,'groundPaving',16,20,R.width-32,R.height-36);
 box(c,'#a18c6680',16,20,R.width-32,R.height-36);
 // Plastered timber walls, stone plinth and the same imported lanterns as the village.
 box(c,'#b9a47a',0,-40,R.width,62);
 for(let y=-38;y<20;y+=3)for(let x=2;x<R.width-2;x+=5){const n=(x*13+y*7)&31;if(n<4)box(c,n<1?'#978666':'#c8b58a',x,y,2,1);}
 beam(c,0,-43,R.width,7);beam(c,0,17,R.width,7);
 for(const x of [0,82,274,R.width-8])beam(c,x,-38,8,58);
 for(const x of [0,R.width-16]){box(c,'#4b4133',x,20,16,R.height-20);fillMaifeldGround(c,'groundPaving',x,20,16,R.height-20,.45);beam(c,x,20,5,R.height-20);}
 // Dark skirting and narrow contact shadows give the floor a visible edge.
 box(c,'#1e241d45',16,24,R.width-32,12);box(c,'#1e241d30',16,24,8,R.height-40);box(c,'#1e241d40',R.width-24,24,8,R.height-40);
 box(c,'#44392b',123,-29,115,28);beam(c,120,-31,121,3);beam(c,120,-3,121,3);text(c,T.sign,180,-11,13);
 for(const x of [39,313])drawMaifeld(c,'lantern',x,7,29);
 // A runner leads from the doorway to the counter, clear of every furniture footprint.
 box(c,'#273c32',151,157,68,100);box(c,'#947249',154,160,62,94);box(c,'#3b5140',156,162,58,90);
 for(let y=165;y<252;y+=5){box(c,'#8a8058',158,y,1,2);box(c,'#8a8058',211,y,1,2);}
 for(let x=153;x<220;x+=3)box(c,'#9c875a',x,257,1,3);
 text(c,T.exit,185,249,9);
}
export function drawKioskRoom(renderer){
 const c=renderer.ctx,g=renderer.game,p=g.player,W=renderer.viewWidth,H=renderer.viewHeight;
 renderer.camera={x:p.x,y:p.y-22};const ox=renderer.camera.x-W/2,oy=renderer.camera.y-H/2;renderer.viewOrigin={x:ox,y:oy};renderer.speechLayout=[];
 const d=renderer.density??WORLD_ART_DENSITY;c.setTransform(d,0,0,d,0,0);box(c,'#15241e',0,0,W,H);c.save();c.translate(-ox,-oy);
 roomShell(c);
 const objects=R.furniture.map(b=>({y:b.y+b.h,draw:()=>furniture(c,b)}));
 objects.push({y:R.keeper.y,draw:()=>{drawWorldPerson(c,'kalle',R.keeper.x,R.keeper.y,g.instance.time,WORLD_SCALE.npc/33,{facing:1});}});
 objects.push({y:p.y,draw:()=>drawClanHero(c,p.x,p.y,g.instance.time,{...p,visualEquipment:equipmentAppearance(g.rpg.equipment,ITEMS)},false,g.world.rules.heroHeight/33)});
 objects.sort((a,b)=>a.y-b.y);for(const o of objects)o.draw();
 // Southern wall leaves a visible doorway. The door is the instance transition.
 beam(c,0,R.height-16,R.exit.x-22,16);beam(c,R.exit.x+22,R.height-16,R.width-R.exit.x-22,16);beam(c,R.exit.x-25,R.height-31,5,31);beam(c,R.exit.x+20,R.height-31,5,31);box(c,'#bfa778',R.exit.x-20,R.height-16,40,3);
 c.restore();
}
export function drawKioskMap(renderer,canvas){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/R.width,canvas.height/R.height);box(c,'#3e4d3a',0,0,R.width,R.height);box(c,'#bba379',16,20,R.width-32,R.height-36);for(const b of R.furniture)box(c,'#574331',b.x,b.y,b.w,b.h);box(c,'#dcba5d',R.service.x-5,R.service.y-5,10,10);box(c,'#92c88b',R.exit.x-10,R.exit.y-4,20,8);const p=renderer.game.player;box(c,'#fff7d1',p.x-5,p.y-5,10,10);c.restore();}
export function drawKioskHouse(c,p){
 const b={...p,id:1984,minX:p.x-p.w/2,maxX:p.x+p.w/2,minY:p.y-p.h/2,maxY:p.y+p.h/2,wallHeight:52,roofHeight:24,door:{x:p.x,y:p.y+p.h/2},style:'house'};
 drawBuilding(c,b,0);box(c,'#223a2f',p.x-24,p.y-24,48,11);text(c,T.sign,p.x,p.y-16,8);
}
