import {drawContentIcon,hasContentAsset} from './content-art.js';
import {tintKey,tintPixels,lookKey} from './hero-tint.js';
import {drawLivePerson} from './live-art.js';
import {PERSON_APPEARANCE} from './content/index.js';
import {drawTinyPerson} from './pixel-people.js';
export function drawWorldPerson(c,id,x,y,time=0,scale=1,pose={}){if(drawLivePerson(c,id,x,y,time,pose,scale))return;drawTinyPerson(c,x,y,time,{...pose,classId:PERSON_APPEARANCE[id]||id,facing:pose.facing||1},false,scale);}
/** Fußpunkt je Körper, damit bei neunfacher Vergrößerung der Kopf im Rahmen sitzt. */
const PORTRAIT_FEET={dieter:284,baerbel:276,anni:276,kevin:282};
export function paintPersonPortrait(canvas,id,pose={}){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/96,canvas.height/96);c.fillStyle='#31493f';c.fillRect(0,0,96,96);c.fillStyle='#49604c';c.fillRect(5,5,86,86);c.imageSmoothingEnabled=false;
 // Eigenes Aussehen (Farben, Bart, Frisur, Brille): statt des festen Porträtbilds die Spielfigur groß auf den Kopf gezoomt
 if(hasContentAsset('portrait-'+id)&&!lookKey(pose.tint)){drawContentIcon(c,'portrait-'+id,0,0,96);if(tintKey(pose.tint)){/* festes Porträtbild: gleiche Farbregeln, der ganze Ausschnitt zählt als Kopfbereich */c.restore();try{const img=c.getImageData(0,0,canvas.width,canvas.height);tintPixels(img.data,canvas.width,canvas.height,{x:canvas.width/2,y:canvas.height*.42,brow:canvas.height*.4,side:canvas.width*.2},canvas.width,pose.tint,/^(anni|baerbel)/.test(id));c.putImageData(img,0,0);}catch{}c.save();}}else if(lookKey(pose.tint))drawWorldPerson(c,id,48,PORTRAIT_FEET[id]||236,0,9,pose);else drawWorldPerson(c,id,48,130,0,4,pose);c.restore();canvas.dataset.personSprite=PERSON_APPEARANCE[id]||id;
}
export function paintPersonPortraits(root){root.querySelectorAll('[data-person-art]').forEach(c=>paintPersonPortrait(c,c.dataset.personArt));}
