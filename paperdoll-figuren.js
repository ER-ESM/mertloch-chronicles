// Anziehpuppe für NPCs (E-58): Figuren aus content/figuren.js (Archetyp + Aussehen + Kleidung) melden sich als Akteure der
// Anziehpuppe an und werden über drawFigure gezeichnet. Kennung im Namensraum 'npc:<id>', damit Heldenkennungen
// (dieter/baerbel/kevin) und Bosse (sigi, horst, …) ihre eigenen Wege behalten. Clan-Mitglieder (NPCS member:true) zusätzlich als
// 'mentor-<id>': der Mentorenweg (drawLivePerson) findet die Puppe dann von selbst.
// Ist die Puppe nicht bereit (Katalog lädt noch / fehlt), liefert drawFigure false und der Aufrufer zeichnet wie bisher.
import {paperdoll,registerPaperdollActor,drawPaperdoll} from './paperdoll-art.js';
import {PERSON_SCALE} from './world-scale.js';
import {FIGUREN,FIGUR_HANDSTUECKE,NPCS} from './content/index.js';

export const FIGURE_PREFIX='npc:';
/** Figur samt Verweis („wie“) auflösen; null, wenn es für die Kennung keine gibt. */
export function figureDef(id){let f=FIGUREN[id];for(let i=0;f?.wie&&i<4;i++)f=FIGUREN[f.wie];return f?.arch?f:null;}
export const hasFigure=id=>!!figureDef(id);
/** Sichtbare Ausrüstung im Format von equipment-appearance.js. Platz und Hände aus dem Katalog der Puppe (Kopfteil verdeckt
 *  Brille/Frisur, Fernkampf blendet Handstücke aus, Zweihänder die Nebenhand); ohne Katalog aus FIGUR_HANDSTUECKE. */
export function figureEquipment(id,cat=paperdoll.catalog){const f=figureDef(id);if(!f)return [];
 return f.gear.map(src=>{const s=cat?.sources?.[src],h=FIGUR_HANDSTUECKE[src];return {slot:s?.slot||h?.slot||'figur',id:src,asset:h?.asset||src,rarity:'common',hands:(s?s.hands:h?.hands)||null};});}
let withCatalog=false;
/** Alle Figuren anmelden: gleich beim Laden des Moduls und noch einmal, sobald der Katalog da ist (genaue Plätze). */
export function registerFigures(){let n=0;withCatalog=!!paperdoll.catalog;
 for(const id of Object.keys(FIGUREN)){const f=figureDef(id);if(!f)continue;const def={arch:f.arch,tint:f.tint,equipment:figureEquipment(id)};
  registerPaperdollActor(FIGURE_PREFIX+id,def);n++;if(NPCS[id]?.member)registerPaperdollActor('mentor-'+id,def);}
 return n;}
registerFigures();
const seedOf=id=>[...id].reduce((a,ch)=>a+ch.charCodeAt(0),0);
/**
 * Figur als Anziehpuppe zeichnen. Vertrag wie drawWorldPerson: Fußpunkt x/y, scale = Weltmaß (PERSON_SCALE = 26 E),
 * pose {facing|direction, moving, walkDistance, parry, artMagnify}. Eigene Ausrüstung/Tönung des Aufrufers zählt nicht –
 * die Figur trägt, was in content/figuren.js steht.
 */
export function drawFigure(c,id,x,y,scale=PERSON_SCALE,pose={}){
 if(paperdoll.failed||!figureDef(id))return false;if(paperdoll.ready&&!withCatalog)registerFigures();
 const p={direction:pose.direction,facing:pose.facing||1,moving:!!pose.moving,walkDistance:pose.walkDistance||0,walkStartDistance:pose.walkStartDistance||0,parry:pose.parry||0,seed:seedOf(id)};
 return drawPaperdoll(c,FIGURE_PREFIX+id,x,y,p,pose.artMagnify??scale/PERSON_SCALE);
}
