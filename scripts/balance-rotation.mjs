// Gemeinsame Prioritäten-Rotation für Balance-Bericht und Balance-Sheet (E-59): beide messen dasselbe Spielerverhalten.
// Der erste Kniff, der wirklich auslöst, gewinnt – gesperrte oder fehlende Kniffe blockieren nichts.
import {mechanic,mechVariant,M} from '../spec-mechanics.js';
// Nur aufrufen, wenn kein Zauber läuft und die globale Abklingzeit frei ist; Zauber schreitet allein über g.tick voran.
// Finisher halten, wo die Spec es verlangt (E-60): Deckelstriche (Kneipenschläger) bis voll oder kurz vor Ablauf –
// sonst verpufft der Abriss mit ein, zwei Strichen. Andere Specs zünden auf Abklingzeit; eine allgemeine Halteregel
// würde Finisher mit Gruppenbedingung (drei Verschimmelte, Lunten) gegen Einzelziele nie zünden.
export function holdBurst(g){const m=mechanic(g);if(m?.kind!=='stack')return false;const s=M(g);
 return !mechVariant(g,'burst')&&!(s.stack>0&&s.stackUntil-g.time<1.5);}
// Talentfähigkeiten (E-60): zünden, sobald bereit und bezahlbar – nach dem Finisher, vor der Stärkung. Ohne sie zählten
// Talente, die diese Fähigkeiten verbessern (Lange Zündschnur, Sprungbrett …), im Sheet 0 %. „Noch ein Reel“ lohnt nur,
// solange der Finisher noch abklingt; Kettenzündung braucht zwei markierte Gegner (sonst frisst sie die Markierung des Finishers).
const TALENT_SKILLS=['detonate','slam','encore','infusion','magnet','keg','sanctuary','barricade','snare'];
const talentWhen={encore:g=>(g.cooldowns.burst||0)>2,detonate:g=>g.enemies.filter(e=>e.hp>0&&e.mark>0).length>=2};
export function rotate(g,{healer=false,healAt=.6,ground=null}={}){
 const p=g.player,t=g.target,has=id=>g.skills.some(s=>s.id===id),ready=id=>has(id)&&(g.cooldowns[id]||0)<=0,
  order=[
   [ready('heal')&&(healer||p.hp/p.maxHp<healAt),()=>g.action('heal')],
   [ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],
   [ready('ground')&&p.energy>=35,()=>g.action('ground',ground||{x:t.x,y:t.y})],
   [ready('burst')&&p.energy>=35&&!holdBurst(g),()=>g.action('burst')],
   ...TALENT_SKILLS.map(id=>[ready(id)&&p.energy>=(g.skills.find(x=>x.id===id)?.cost||0)&&(talentWhen[id]?.(g)??true),()=>g.action(id,ground||{x:t.x,y:t.y})]),
   [ready('buff')&&p.energy>=30,()=>g.action('buff')],
   [ready('strike'),()=>g.action('strike')],
   [ready('throw')&&p.energy>=20,()=>g.action('throw')]];
 for(const [when,run] of order)if(when&&run())return true;
 return false;}
