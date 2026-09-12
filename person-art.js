import {PERSON_APPEARANCE} from './content/index.js';
import {drawTinyPerson} from './pixel-people.js';
export function drawWorldPerson(c,id,x,y,time=0,scale=1,pose={}){drawTinyPerson(c,x,y,time,{...pose,classId:PERSON_APPEARANCE[id]||id,facing:pose.facing||1},false,scale);}
export function paintPersonPortrait(canvas,id){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/96,canvas.height/96);c.fillStyle='#31493f';c.fillRect(0,0,96,96);c.fillStyle='#49604c';c.fillRect(5,5,86,86);c.imageSmoothingEnabled=false;
 drawWorldPerson(c,id,48,130,0,4);c.restore();canvas.dataset.personSprite=PERSON_APPEARANCE[id]||id;
}
export function paintPersonPortraits(root){root.querySelectorAll('[data-person-art]').forEach(c=>paintPersonPortrait(c,c.dataset.personArt));}
