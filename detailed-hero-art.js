import {drawRedesignPerson} from './redesign-art.js';
import {drawEquipment} from './equipment-art.js';
import {drawPaperdoll} from './paperdoll-art.js';

/** Shared detailed renderer. A missing pose returns false; it never substitutes a legacy actor. */
export function drawDetailedHero(c,id,x,y,p={},magnify=1){
 // Anziehpuppe zuerst (Archetyp + Aussehen + Ausrüstung); legacyArt = Aufrufer braucht die Redesign-Gelenke (Reiter-Zerschnitt in mount-art.js).
 if(!p.legacyArt&&drawPaperdoll(c,id,x,y,p,magnify))return true;
 return drawRedesignPerson(c,id,x,y,p,magnify,(ctx,items,s,state)=>{
  const half=at=>({...at,x:at.x/2,y:at.y/2}),ss={...s,main:half(s.main),off:half(s.off),head:half(s.head),torso:{...half(s.torso),w:s.torso.w/2,h:s.torso.h/2},waist:half(s.waist),shoulders:s.shoulders.map(half),feet:s.feet.map(half),legs:s.legs?.map(j=>({hip:half(j.hip),knee:half(j.knee),ankle:half(j.ankle)}))};
  ctx.save();ctx.scale(2,2);drawEquipment(ctx,items,ss,s.west,s.back,false,state);ctx.restore();
 });
}
