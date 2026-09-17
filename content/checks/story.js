// Prüfungen der Rolle Story (story.js, dialogues.js, memories.js, npcs.js, quests.js, tutorial.js, panel-ui.js).
// Ergänzt die Grundprüfung in schema.js; hier stehen erzählerische Invarianten.
import {STORY_CHAPTERS,ACTS} from '../story.js';
import {MAIN_DIALOGUE,HUB_TALK} from '../dialogues.js';
import {MEMORY_FRAGMENTS,MEMORY_TRIGGERS} from '../memories.js';
import {NPCS} from '../npcs.js';
export function check(bad){
 // Jeder Akt hat Titel und Bogen; ein nicht-reservierter Akt braucht ein Ende.
 for(const a of ACTS){if(!a.arc)bad('act '+a.id,'arc fehlt');if(!a.reserve&&!a.ending)bad('act '+a.id,'ending fehlt');}
 // Erinnerungsfetzen: order lückenlos, jeder Fetzen wird von genau einem Kapitel oder einem Ereignis erreicht.
 const orders=MEMORY_FRAGMENTS.map(m=>m.order).sort((a,b)=>a-b);orders.forEach((o,i)=>{if(o!==i)bad('memory order','Reihenfolge lückenhaft bei '+o);});
 const claimed=new Map();for(const c of STORY_CHAPTERS)for(const m of c.memories||[]){if(claimed.has(m))bad('memory '+m,'in zwei Kapiteln genannt ('+claimed.get(m)+', '+c.id+')');claimed.set(m,c.id);}
 // Ein Fetzen, den Ida beim Abholen auslöst, gehört in die memories genau seines Kapitels. Ein Fetzen, der in keinem
 // Kapitel steht, ist ein reiner Ereignis-Fetzen (Stufe, Tod, Verpflegung, Bau) – er darf nicht am Kapitelende hängen.
 for(const m of MEMORY_FRAGMENTS){const t=m.trigger||{},w='memory '+m.id;
  if(t.kind==='chapterClaimed'){if(claimed.get(m.id)!==t.chapter)bad(w,'gehört in die memories von Kapitel '+t.chapter);}
  else if(!claimed.has(m.id)&&!MEMORY_TRIGGERS[t.kind])bad(w,'reiner Ereignis-Fetzen braucht einen bekannten Trigger');
  if(t.kind==='level'&&!(t.level>=1))bad(w,'level-Trigger braucht eine Stufe');}
 // Anrede „Ihnen“ gibt es im Dorf nicht (Sie-Form); Bosse der Gegenseite dürfen siezen, das ist ihr Witz.
 const scan=(where,text)=>{if(typeof text==='string'&&/Ihnen/.test(text))bad(where,'Sie-Form: '+text.slice(0,50));};
 for(const [k,v] of Object.entries(HUB_TALK))for(const [state,lines] of Object.entries(v))(Array.isArray(lines)?lines:[lines]).forEach(l=>scan('hub '+k+'/'+state,l));
 for(const [k,v] of Object.entries(MAIN_DIALOGUE.ida))for(const l of v.lines||[])scan('ida '+k,l);
 // Jede sprechende Figur hat eine Rolle, jede Figur mit Bild einen Bildhinweis.
 for(const [id,n] of Object.entries(NPCS))if(!n.look)bad('npc '+id,'look fehlt');
}
