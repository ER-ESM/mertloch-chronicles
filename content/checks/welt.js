// Prüfungen der Rolle Welt-Design (world*.js, terrain.js, cartography.js, data/, world-layout.js, Orte in npcs.js/buildings.js).
// Inhaltliche Weltdaten liegen heute vor allem in data/ und den Welt-Modulen; hier stehen die inhaltsseitigen Invarianten.
import {NPCS} from '../npcs.js';
import {SIDE_QUESTS} from '../quests.js';
export const HUBS=['St. Gangolf','Clan-Treff','Pfandhof','Wegestube'];
export function check(bad){
 // Jeder Questgeber steht an einem bekannten Treffpunkt.
 for(const q of SIDE_QUESTS){const home=NPCS[q.npc]?.home;if(!home)bad('quest '+q.id,'Questgeber '+q.npc+' ohne home');else if(!HUBS.includes(home))bad('quest '+q.id,'home unbekannt: '+home);}
}
