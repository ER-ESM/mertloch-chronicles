// Prüfungen der Rolle Welt-Design (world*.js, terrain.js, cartography.js, data/, world-layout.js, Orte in npcs.js/buildings.js).
// Inhaltliche Weltdaten liegen heute vor allem in data/ und den Welt-Modulen; hier stehen die inhaltsseitigen Invarianten.
import {NPCS} from '../npcs.js';
import {SIDE_QUESTS} from '../quests.js';
import {BUILDING_IDS} from '../buildings.js';
import {STORY_CHAPTERS,STORY} from '../story.js';
import {PROP_KINDS,CHAPTER_PROPS} from '../../world-prop-kinds.js';
export const HUBS=['St. Gangolf','Clan-Treff','Pfandhof','Wegestube'];
export function check(bad){
 // Jeder Questgeber steht an einem bekannten Treffpunkt.
 for(const q of SIDE_QUESTS){const home=NPCS[q.npc]?.home;if(!home)bad('quest '+q.id,'Questgeber '+q.npc+' ohne home');else if(!HUBS.includes(home))bad('quest '+q.id,'home unbekannt: '+home);}
 // Kulissen: jede Art hat Name, Größe und Fallback-Farbe; nur große Objekte blockieren.
 for(const [id,k] of Object.entries(PROP_KINDS)){
  if(!k.name)bad('prop '+id,'ohne Namen');
  if(!(k.w>0&&k.h>0&&k.height>0))bad('prop '+id,'ohne Größe');
  if(!/^#[0-9a-f]{6}$/i.test(k.color||''))bad('prop '+id,'ohne Fallback-Farbe');
  if(k.blocking&&k.w<50)bad('prop '+id,'blockiert, ist aber kein großes Objekt');
 }
 // Jedes bespielte Akt-Kapitel außer dem ersten hat eine Kulisse, und zwar aus bekannten Arten.
 for(const c of STORY_CHAPTERS.filter(c=>!c.reserve&&c.act===STORY.act&&c.id>1)){
  const set=CHAPTER_PROPS[c.id];
  if(!set){bad('chapter '+c.id,'ohne Kapitel-Kulisse (CHAPTER_PROPS)');continue;}
  if(!set.place)bad('chapter '+c.id,'Kulisse ohne Ortsnamen');
  for(const kind of [...set.boss,...set.mob])if(!PROP_KINDS[kind])bad('chapter '+c.id,'unbekannte Kulissen-Art '+kind);
  if(!set.boss.some(kind=>PROP_KINDS[kind].w>=50))bad('chapter '+c.id,'Bosslager ohne große Signatur-Kulisse');
 }
 // Kalles Kiosk als Ort im Dorfkern: Bude mit Tresenfenster, Stehtisch und Wett-Tafel.
 for(const kind of ['kiosk','stehtisch','wett-tafel'])if(!PROP_KINDS[kind])bad('kiosk','ohne Kulisse '+kind);
 if(PROP_KINDS.kiosk&&!PROP_KINDS.kiosk.blocking)bad('kiosk','die Kiosk-Bude ist kein Kollisionskörper');
 // Die Bude zeigt jedes Basisbau-Gebäude: je Gebäude eine eigene Kulissen-Art.
 for(const id of BUILDING_IDS)if(!PROP_KINDS['bude-'+id])bad('base '+id,'ohne Kulisse bude-'+id);
 if(!PROP_KINDS['bude-truemmer'])bad('base','ohne Trümmer-Kulisse für Stufe 0');
}
