// Gemeinsame Prioritäten-Rotation für Balance-Bericht und Balance-Sheet (E-59): beide messen dasselbe Spielerverhalten.
// Der erste Kniff, der wirklich auslöst, gewinnt – gesperrte oder fehlende Kniffe blockieren nichts.
// E-72: Jede Klasse spielt ihre Ressource so, wie ein geübter Spieler es täte: Dieter prellt die Zeche, Anni wechselt die
// Kniffe, Kevin lädt in der Bon-Zone nach, Schorsch hält die Glut im goldenen Bereich und serviert gar, Käthe sticht,
// bedient die Farbe und rechnet ab. Ob ein Kniff bezahlbar ist, entscheidet die Engine (action() liefert false).
import {mechanic,mechVariant,M} from '../spec-mechanics.js';
import {resourceKind,resourceHud,handCard,resourceVariant} from '../class-resources.js';
import {RESOURCES} from '../content/index.js';
import {healerKit,kitEntry,unitOf} from '../healer-kit.js';
import {helpTarget} from '../help-target.js';
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
  const save=kitEntry(g,'heal')?.role==='save',chefWurst=kitEntry(g,'burst')&&rost.some(it=>it.item==='wurst')&&p.hp/p.maxHp>.95;/* Heiler-WoW: Löschbier ist der Notfallknopf, Würste warten auf Verletzte */
  if(glut>=88&&!save&&ready('heal')&&g.action('heal'))return true;
  if(gar&&!chefWurst&&ready('burst')&&g.action('burst'))return true;
  if(rost.length<h.slots&&ready('mark')&&g.action('mark'))return true;
  // E-72 Runde 3: Talentfähigkeiten des Grills. Vorher griff die allgemeine Liste erst über 84 Glut – Spiritus-Schwall
  // (nur unter 60 sinnvoll) fiel nie, Senf drauf! und Deckel zu! fast nie. Senf, sobald etwas auf dem Rost liegt;
  // Deckel zu!, sobald ein Gegner im Umkreis steht (bindet und schwächt 25 %); Spiritus aus der guten Glut in den goldenen Bereich.
  if(rost.length&&ready('senf')&&g.action('senf'))return true;
  if(ready('deckelzu')&&g.enemies.some(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<=90)&&g.action('deckelzu'))return true;
  // Grillhütten-Chef: das Grillbuffet ist seine Gruppenheilung – auf Abklingzeit, sobald die 30 Glut dafür da sind (vorher erst ab 72 wie der Schadensschwung).
  if(mechanic(g)?.chef&&glut>=30&&ready('ground')&&g.action('ground',ground||{x:p.x,y:p.y}))return true;
  if(glut>=72&&ready('ground')&&g.action('ground',ground||{x:t.x,y:t.y}))return true;
  if(glut>=78&&!kitEntry(g,'throw')&&ready('throw')&&g.action('throw'))return true;
  if(glut<=55&&ready('spiritus')&&g.action('spiritus'))return true;
  if(glut<35&&ready('buff')&&g.action('buff'))return true;
  if(glut<84&&ready('strike')&&g.action('strike'))return true;
  if(p.hp/p.maxHp<(save?.3:.5)&&ready('heal')&&g.action('heal'))return true;
  return false;
 }
 if(kind==='cards'){
  const cards=['strike','mark','burst'].map(id=>({id,c:handCard(g,id),v:resourceVariant(g,id)})).filter(x=>x.c&&ready(x.id));
  const stich=cards.find(x=>x.v?.name?.startsWith('STICH'));if(stich&&g.action(stich.id))return true;
  const bilanz=!!kitEntry(g,'throw');/* Heiler-WoW: die Kartenlegerin rechnet als Heilung ab (healerFirst) */
  if(!bilanz&&h.value>=RESOURCES.kaethe.schneider&&ready('throw')&&g.action('throw'))return true;
  if(!bilanz&&h.value>=h.win&&(t?.hp||0)<(t?.maxHp||1)*.25&&ready('throw')&&g.action('throw'))return true;
  const hurt=p.hp/p.maxHp;
  // E-72 Runde 3: Drei Handplätze ohne Abklingzeit – vorher gewann immer eine Karte, Eierlikörchen, Kartenregen/Legekreis,
  // Handlesen, Reizen und Gezinkte Karten fielen im Sheet nie. Jetzt wie ein geübter Spieler: heilen wie die allgemeine
  // Liste (Heilerin zuerst, sonst unter 60 %), Kartenregen/Legekreis und Handlesen auf Abklingzeit, Reizen kurz vor 61/90,
  // Gezinkte Karten, wenn die erste Karte die gewünschte Farbe hat (Heilerin Herz, sonst Kreuz oder Karo).
  if(ready('heal')&&(healer||hurt<(kitEntry(g,'heal')?.role==='save'?.3:.6))&&hurt<1&&g.action('heal'))return true;
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
/** Heiler-WoW (2026-09-26): Heil-Rotation der Heiler-Kits wie ein geübter WoW-Heiler. Ziel = gewählter Verbündeter (g.friend, der Aufrufer
 *  wählt den schwächsten), sonst du. Reihenfolge: Notfall unter 30 % · Gruppenheilung, wenn drei (bzw. zwei unter 60 %) Leben verlieren ·
 *  Heilung über Zeit, wenn das Ziel keine hat · großer Heilzauber unter 55 % · Dauer-Heilzauber unter 90 %. Nichts zu heilen → false
 *  (die Schadensrotation läuft weiter; Schorsch legt vorher auf und hält die Glut, Anni holt Likes mit dem Piekser). */
export function healerFirst(g,ready){
 const kit=healerKit(g);if(!kit)return false;const p=g.player,spec=g.rpg.talents.spec,t=helpTarget(g),u=unitOf(g,t)||p,share=u.hp/u.maxHp;
 const units=[p,...(g.companions||[]).filter(c=>c.state!=='down'&&c.hp>0&&Math.hypot(c.x-p.x,c.y-p.y)<260)],hurt=x=>units.filter(v=>v.hp/v.maxHp<x);
 const act=id=>ready(id)&&g.action(id);
 if(spec==='schorsch-chef'){const st=g.res;if(st&&ready('mark')&&st.rost.length<3&&g.action('mark'))return true;/* Auflegen ohne GCD */}
 const saveId=Object.keys(kit).find(k=>kit[k].role==='save'),bigId=Object.keys(kit).find(k=>kit[k].role==='big');
 if(saveId&&share<.3&&act(saveId))return true;
 if(ready('ground')&&(hurt(.75).length>=3||hurt(.6).length>=2)){const list=hurt(.75),c=list.reduce((a,v)=>({x:a.x+v.x/list.length,y:a.y+v.y/list.length}),{x:0,y:0}),at=g.world.findClear(c.x,c.y,7);if(g.action('ground',at))return true;}
 if(share>=.9)return false;
 const hasHot=u===p?(g.classState.hots||[]).length>0:u.aidHot?.remaining>1.5;
 if(kitEntry(g,'buff')?.role==='hot'&&!hasHot&&act('buff'))return true;
 if(bigId&&share<.55&&act(bigId))return true;
 if(spec==='kaethe-herz'){const st=g.res;if(!st?.hand?.length)return false;const cards=['strike','mark','burst'].map((id,i)=>({id,c:st.hand[i]})).filter(x=>x.c&&ready(x.id));
  const rank=RESOURCES.kaethe.ranks,pick=suit=>cards.filter(x=>x.c.suit===suit).sort((a,b)=>rank[b.c.rank].power-rank[a.c.rank].power)[0];
  const want=pick('herz')||(hurt(.8).length>=2?pick('karo'):null)||(!hasHot?pick('kreuz'):null)||(share<.6?pick('pik'):null)||pick('karo')||pick('kreuz')||pick('pik');
  if(want&&g.action(want.id))return true;return false;}
 const filler=Object.keys(kit).find(k=>kit[k].role==='filler');if(filler&&act(filler))return true;
 return false;
}
export function rotate(g,{healer=false,healAt=.6,ground=null}={}){
 const p=g.player,t=g.target,has=id=>g.skills.some(s=>s.id===id),ready=id=>has(id)&&(g.cooldowns[id]||0)<=0;
 if(healer&&healerFirst(g,ready))return true;
 if(classFirst(g,ready,t,ground,healer&&!healerKit(g)))return true;
 const kind=resourceKind(g),pool=kind==='rage'||kind==='trend';/* Randale/Likes: Schwellen wie bisher; andere Ressourcen prüft die Engine */
 const enough=n=>!pool||p.energy>=n;
 const order=[
   [ready('heal')&&(healer&&!healerKit(g)||p.hp/p.maxHp<healAt)&&kind!=='grill'&&!(kitEntry(g,'heal')?.role==='save'&&p.hp/p.maxHp>.3),()=>g.action('heal')],
   [kind!=='grill'&&kind!=='cards'&&ready('mark')&&t&&!(t.mark>0)&&enough(20)&&!kitEntry(g,'mark'),()=>g.action('mark')],
   [ready('ground')&&kind!=='grill'&&enough(35)&&!(kitEntry(g,'ground')&&!healer),()=>g.action('ground',ground||{x:t.x,y:t.y})],
   [kind!=='grill'&&kind!=='cards'&&ready('burst')&&enough(35)&&!holdBurst(g),()=>g.action('burst')],
   ...TALENT_SKILLS.map(id=>[ready(id)&&enough(g.skills.find(x=>x.id===id)?.cost||0)&&(talentWhen[id]?.(g)??true),()=>g.action(id,ground||{x:t.x,y:t.y})]),
   [ready('buff')&&kind!=='grill'&&kind!=='cards'&&enough(30)&&!kitEntry(g,'buff'),()=>g.action('buff')],
   [kind!=='cards'&&ready('strike'),()=>g.action('strike')],
   [kind!=='rage'&&kind!=='cards'&&ready('throw')&&enough(20)&&!kitEntry(g,'throw'),()=>g.action('throw')]];
 for(const [when,run] of order)if(when&&run())return true;
 return false;}
