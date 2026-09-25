// Gemeinsame Prioritäten-Rotation für Balance-Bericht und Balance-Sheet (E-59): beide messen dasselbe Spielerverhalten.
// Der erste Kniff, der wirklich auslöst, gewinnt – gesperrte oder fehlende Kniffe blockieren nichts.
// E-72: Jede Klasse spielt ihre Ressource so, wie ein geübter Spieler es täte: Dieter prellt die Zeche, Anni wechselt die
// Kniffe, Kevin lädt in der Bon-Zone nach, Schorsch hält die Glut im goldenen Bereich und serviert gar, Käthe sticht,
// bedient die Farbe und rechnet ab. Ob ein Kniff bezahlbar ist, entscheidet die Engine (action() liefert false).
import {mechanic,mechVariant,M} from '../spec-mechanics.js';
import {resourceKind,resourceHud,handCard,resourceVariant} from '../class-resources.js';
import {RESOURCES} from '../content/index.js';
// Nur aufrufen, wenn kein Zauber läuft und die globale Abklingzeit frei ist; Zauber schreitet allein über g.tick voran.
// Finisher halten, wo die Spec es verlangt (E-60): Deckelstriche (Kneipenschläger) bis voll oder kurz vor Ablauf –
// sonst verpufft der Abriss mit ein, zwei Strichen. Andere Specs zünden auf Abklingzeit; eine allgemeine Halteregel
// würde Finisher mit Gruppenbedingung (drei Verschimmelte, Lunten) gegen Einzelziele nie zünden.
export function holdBurst(g){const m=mechanic(g);if(m?.kind!=='stack')return false;const s=M(g);
 return !mechVariant(g,'burst')&&!(s.stack>0&&s.stackUntil-g.time<1.5);}
// Talentfähigkeiten (E-60): zünden, sobald bereit und bezahlbar – nach dem Finisher, vor der Stärkung. Ohne sie zählten
// Talente, die diese Fähigkeiten verbessern (Lange Zündschnur, Sprungbrett …), im Sheet 0 %. „Noch ein Reel“ lohnt nur,
// solange der Finisher noch abklingt; Kettenzündung braucht zwei markierte Gegner (sonst frisst sie die Markierung des Finishers).
const TALENT_SKILLS=['detonate','slam','encore','infusion','magnet','keg','sanctuary','barricade','snare','senf','spiritus','deckelzu','reizen','handlesen','gezinkt'];
const talentWhen={encore:g=>(g.cooldowns.burst||0)>2,detonate:g=>g.enemies.filter(e=>e.hp>0&&e.mark>0).length>=2,spiritus:g=>(g.res?.glut||0)<60,reizen:g=>{const a=g.res?.augen||0,win=RESOURCES.kaethe.win;return a>=win-25&&a<win||a>=RESOURCES.kaethe.schneider-25&&a<RESOURCES.kaethe.schneider;},gezinkt:g=>(g.res?.hand?.length||0)>=3};
/** Klassen-Prioritäten vor der allgemeinen Liste. Rückgabe true = ein Kniff hat ausgelöst. */
function classFirst(g,ready,t,ground,healer=false){
 const kind=resourceKind(g),h=resourceHud(g),p=g.player;
 if(kind==='rage'){const tab=g.res?.tab||0;if(ready('zeche')&&tab>p.maxHp*.15&&g.action('zeche'))return true;if(ready('throw')&&g.action('throw'))return true;return false;}
 if(kind==='ammo'){
  const rl=g.res.reload;if(rl){const f=rl.t/rl.total;if(!rl.tried&&f>=rl.zone[0]+.02&&f<=rl.zone[1]-.02)g.action('reload');return true;/* während des Nachladens nichts anderes */}
  if(h.value<=1&&g.skills.some(s=>s.id==='reload')&&g.action('reload'))return true;return false;}
 if(kind==='grill'){
  const glut=h.value,rost=h.rost,gar=rost.some(it=>it.state==='gar'||it.state==='durch'||it.state==='verkohlt');
  // E-72 Runde 3: Der Räuchermeister räuchert nur unter `rauch.below` Glut (Kernmechanik). Vorher spielte die Rotation ihn wie den
  // Flambierer (Zange bis 84, Blasebalg unter 35) – geräuchert wurde fast nur zufällig. Ein geübter Tank hält den Grill kühl:
  // Zange nur mit Luft bis zur Räuchergrenze, kein Blasebalg, Glutbrocken und Ablöschen kühlen, Räucherofen und Deckel zu! auf Abklingzeit.
  const smokeBelow=mechanic(g)?.rauch?.below;
  if(smokeBelow){
   if((glut>=smokeBelow+22||p.hp/p.maxHp<.5)&&ready('heal')&&g.action('heal'))return true;
   if(gar&&ready('burst')&&g.action('burst'))return true;
   if(rost.length<h.slots&&ready('mark')&&g.action('mark'))return true;
   if(ready('deckelzu')&&g.enemies.some(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<=90)&&g.action('deckelzu'))return true;
   if(glut>=50&&ready('ground')&&g.action('ground',ground||{x:t.x,y:t.y}))return true;
   if(glut>=15&&glut<50&&ready('ground')&&ready('buff')&&g.action('buff'))return true;/* Blasebalg vor dem Räucherofen: der Ofen kostet 30 Glut */
   if(glut>=smokeBelow+5&&ready('throw')&&g.action('throw'))return true;
   if(glut<smokeBelow-2&&ready('strike')&&g.action('strike'))return true;
   return true;/* bewusst warten, bis die Glut fällt – die allgemeine Liste würde sonst die Zange nachschieben */
  }
  if(glut>=88&&ready('heal')&&g.action('heal'))return true;
  if(gar&&ready('burst')&&g.action('burst'))return true;
  if(rost.length<h.slots&&ready('mark')&&g.action('mark'))return true;
  // E-72 Runde 3: Talentfähigkeiten des Grills. Vorher griff die allgemeine Liste erst über 84 Glut – Spiritus-Schwall
  // (nur unter 60 sinnvoll) fiel nie, Senf drauf! und Deckel zu! fast nie. Senf, sobald etwas auf dem Rost liegt;
  // Deckel zu!, sobald ein Gegner im Umkreis steht (bindet und schwächt 25 %); Spiritus aus der guten Glut in den goldenen Bereich.
  if(rost.length&&ready('senf')&&g.action('senf'))return true;
  if(ready('deckelzu')&&g.enemies.some(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<=90)&&g.action('deckelzu'))return true;
  // Grillhütten-Chef: das Grillbuffet ist seine Gruppenheilung – auf Abklingzeit, sobald die 30 Glut dafür da sind (vorher erst ab 72 wie der Schadensschwung).
  if(mechanic(g)?.chef&&glut>=30&&ready('ground')&&g.action('ground',ground||{x:p.x,y:p.y}))return true;
  if(glut>=72&&ready('ground')&&g.action('ground',ground||{x:t.x,y:t.y}))return true;
  if(glut>=78&&ready('throw')&&g.action('throw'))return true;
  if(glut<=55&&ready('spiritus')&&g.action('spiritus'))return true;
  if(glut<35&&ready('buff')&&g.action('buff'))return true;
  if(glut<84&&ready('strike')&&g.action('strike'))return true;
  if(p.hp/p.maxHp<.5&&ready('heal')&&g.action('heal'))return true;
  return false;
 }
 if(kind==='cards'){
  const cards=['strike','mark','burst'].map(id=>({id,c:handCard(g,id),v:resourceVariant(g,id)})).filter(x=>x.c&&ready(x.id));
  const stich=cards.find(x=>x.v?.name?.startsWith('STICH'));if(stich&&g.action(stich.id))return true;
  if(h.value>=RESOURCES.kaethe.schneider&&ready('throw')&&g.action('throw'))return true;
  if(h.value>=h.win&&(t?.hp||0)<(t?.maxHp||1)*.25&&ready('throw')&&g.action('throw'))return true;
  const hurt=p.hp/p.maxHp;
  // E-72 Runde 3: Drei Handplätze ohne Abklingzeit – vorher gewann immer eine Karte, Eierlikörchen, Kartenregen/Legekreis,
  // Handlesen, Reizen und Gezinkte Karten fielen im Sheet nie. Jetzt wie ein geübter Spieler: heilen wie die allgemeine
  // Liste (Heilerin zuerst, sonst unter 60 %), Kartenregen/Legekreis und Handlesen auf Abklingzeit, Reizen kurz vor 61/90,
  // Gezinkte Karten, wenn die erste Karte die gewünschte Farbe hat (Heilerin Herz, sonst Kreuz oder Karo).
  if(ready('heal')&&(healer||hurt<.6)&&hurt<1&&g.action('heal'))return true;
  if(ready('handlesen')&&(healer||hurt<.85)&&g.action('handlesen'))return true;
  if(ready('ground')&&t&&g.action('ground',ground||{x:t.x,y:t.y}))return true;
  if(ready('reizen')&&talentWhen.reizen(g)&&g.action('reizen'))return true;
  const first=g.res.hand?.[0];if(first&&ready('gezinkt')&&(g.res.hand.length>=3)&&(healer?first.suit==='herz':['kreuz','karo'].includes(first.suit))&&g.action('gezinkt'))return true;
  const pick=suit=>cards.filter(x=>x.c.suit===suit).sort((a,b)=>RESOURCES.kaethe.ranks[b.c.rank].power-RESOURCES.kaethe.ranks[a.c.rank].power)[0];
  // Heilerin (Kartenlegerin) spielt Herz zuerst, wie der Grillhütten-Chef jede gare Wurst serviert – in der Gruppe ist immer jemand verletzt.
  const want=healer?pick('herz')||(hurt<.85?pick('pik'):null):hurt<.6?pick('herz'):hurt<.85?pick('pik'):null;if(want&&g.action(want.id))return true;
  const chain=g.res.chain?.suit;const follow=cards.find(x=>['kreuz','karo'].includes(x.c.suit)&&(x.c.suit===chain||RESOURCES.kaethe.ranks[x.c.rank].trump));if(follow&&g.action(follow.id))return true;
  const best=cards.filter(x=>['kreuz','karo'].includes(x.c.suit)).sort((a,b)=>RESOURCES.kaethe.ranks[b.c.rank].power-RESOURCES.kaethe.ranks[a.c.rank].power)[0];if(best&&g.action(best.id))return true;
  if(cards.every(x=>RESOURCES.kaethe.ranks[x.c.rank].quick)&&ready('buff')&&g.action('buff'))return true;
  const any=cards[0];if(any&&g.action(any.id))return true;
  return false;
 }
 return false;
}
export function rotate(g,{healer=false,healAt=.6,ground=null}={}){
 const p=g.player,t=g.target,has=id=>g.skills.some(s=>s.id===id),ready=id=>has(id)&&(g.cooldowns[id]||0)<=0;
 if(classFirst(g,ready,t,ground,healer))return true;
 const kind=resourceKind(g),pool=kind==='rage'||kind==='trend';/* Randale/Likes: Schwellen wie bisher; andere Ressourcen prüft die Engine */
 const enough=n=>!pool||p.energy>=n;
 const order=[
   [ready('heal')&&(healer||p.hp/p.maxHp<healAt)&&kind!=='grill',()=>g.action('heal')],
   [kind!=='grill'&&kind!=='cards'&&ready('mark')&&t&&!(t.mark>0)&&enough(20),()=>g.action('mark')],
   [ready('ground')&&kind!=='grill'&&enough(35),()=>g.action('ground',ground||{x:t.x,y:t.y})],
   [kind!=='grill'&&kind!=='cards'&&ready('burst')&&enough(35)&&!holdBurst(g),()=>g.action('burst')],
   ...TALENT_SKILLS.map(id=>[ready(id)&&enough(g.skills.find(x=>x.id===id)?.cost||0)&&(talentWhen[id]?.(g)??true),()=>g.action(id,ground||{x:t.x,y:t.y})]),
   [ready('buff')&&kind!=='grill'&&kind!=='cards'&&enough(30),()=>g.action('buff')],
   [kind!=='cards'&&ready('strike'),()=>g.action('strike')],
   [kind!=='rage'&&kind!=='cards'&&ready('throw')&&enough(20),()=>g.action('throw')]];
 for(const [when,run] of order)if(when&&run())return true;
 return false;}
