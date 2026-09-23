// Prüfungen der Rolle Story (story.js, dialogues.js, memories.js, npcs.js, quests.js, tutorial.js, panel-ui.js).
// Ergänzt die Grundprüfung in schema.js; hier stehen erzählerische Invarianten.
import {STORY_CHAPTERS,ACTS} from '../story.js';
import {MAIN_DIALOGUE,HUB_TALK} from '../dialogues.js';
import {MEMORY_FRAGMENTS,MEMORY_TRIGGERS} from '../memories.js';
import {NPCS} from '../npcs.js';
import {HOTSPOTS,WORLD_NOTICES,HOTSPOT_ITEMS} from '../hotspots.js';
import {ARCHETYPES,ELITES} from '../enemies.js';
import {ITEM_CATALOG} from '../items.js';
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
 checkHotspots(bad);
}

// Startreihe und Aushänge (E-55): eindeutige IDs, bekannte Arten/Geber/Gegenstände, Voraussetzungen lösen auf,
// jede Überleitung führt zum nächsten Geber, jeder Hotspot endet mit genau einer Überleitung.
function checkHotspots(bad){
 const quests=[...HOTSPOTS.flatMap(h=>h.quests.map(q=>({...q,hotspot:h.id}))),...WORLD_NOTICES],ids=new Set(),hotspotIds=new Set(HOTSPOTS.map(h=>h.id));
 for(const q of quests){const w='quest '+q.id;if(ids.has(q.id))bad(w,'ID doppelt');ids.add(q.id);if(!/^[a-z][a-z0-9-]*-?[0-9a-z]+$/.test(q.id))bad(w,'ID nur a-z0-9-');
  const o=q.objective||{};if(!['kill','drop','talk'].includes(o.kind))bad(w,'objective.kind unbekannt');
  if(o.kind!=='talk'&&!(ARCHETYPES[o.species]||ELITES[o.species]))bad(w,'Art unbekannt: '+o.species);
  if(o.kind!=='talk'&&!(o.count>=1))bad(w,'count fehlt');
  if(o.kind==='drop'&&(!HOTSPOT_ITEMS[o.item]||!(o.chance>0&&o.chance<=1)))bad(w,'Drop braucht Questgegenstand und Chance 0–1');
  if(q.reward?.item&&!ITEM_CATALOG[q.reward.item])bad(w,'Belohnung unbekannt: '+q.reward.item);
  if(!(q.reward?.xp>0))bad(w,'reward.xp fehlt');if(!q.title||!q.text)bad(w,'title/text fehlt');
  if(q.hotspot&&!(q.lines?.offer&&q.lines?.progress&&q.lines?.done))bad(w,'lines offer/progress/done fehlen');
  if(q.turnIn&&q.turnIn!=='ida'&&!hotspotIds.has(q.turnIn))bad(w,'turnIn unbekannt: '+q.turnIn);}
 for(const q of quests)for(const r of q.requires||[])if(!ids.has(r))bad('quest '+q.id,'requires unbekannt: '+r);
 HOTSPOTS.forEach((h,i)=>{if(!h.givers?.length||h.givers.some(n=>!NPCS[n]))bad('hotspot '+h.id,'Geber unbekannt');
  for(const q of h.quests)for(const t of [q.title,q.text,...Object.values(q.lines||{})].join(' ').match(/{[a-z]+}/g)||[])if(!['{giver}','{next}'].includes(t))bad('quest '+q.id,'Platzhalter unbekannt: '+t);const leads=h.quests.filter(q=>q.objective.kind==='talk');
  if(leads.length!==1)bad('hotspot '+h.id,'braucht genau eine Überleitung');const next=HOTSPOTS[i+1]?.id||'ida';if(leads[0]&&leads[0].turnIn!==next)bad('hotspot '+h.id,'Überleitung muss zu '+next+' führen');
  for(const s of h.area.spawns)if(!(ARCHETYPES[s.kind]||ELITES[s.kind]))bad('hotspot '+h.id,'Spawnart unbekannt: '+s.kind);
  // Jedes Auftragsziel wird im eigenen Gebiet auch wirklich angelegt.
  for(const q of h.quests)if(q.objective.species&&!h.area.spawns.some(s=>s.kind===q.objective.species))bad('quest '+q.id,'Art spawnt nicht im Hotspot');});
 for(const n of WORLD_NOTICES)if(!n.area.spawns.some(s=>s.kind===n.objective.species))bad('notice '+n.id,'Art spawnt nicht im Aushang-Gebiet');
}
