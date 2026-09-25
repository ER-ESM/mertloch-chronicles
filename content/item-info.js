// Erweiterte Beschreibungen der Rolle Gegenstände & Loot (Welle D, Beschreibungs-Standard aus docs/backlog/loot.md).
// info = {effect, numbers:[{label,value,unit,source}], why, links:[ids], terms:[glossar-ids]}
//  effect – was der Gegenstand tut, ohne die Zahlen zu wiederholen, die numbers ohnehin zeigt.
//  numbers – ABGELEITET aus items.js (stats, weapon, heal, energy, proc); Wirkungen je Wert über statYield (E-53).
//            BALANCE wird hier nur gelesen. Keine Doppelpflege: wer eine Zahl ändert, ändert sie in items.js/tuning.js.
//  why – wozu das Ding im Kampffluss dient. links – verwandte IDs (Gegenstand, Proc, Gebäude). terms – content/glossary.js.
// Von Hand steht in ITEM_INFO/PROC_INFO nur effect/why/links/terms.
import {BALANCE,rating,ratingK,powerRate} from './balance.js';
import {ITEM_CATALOG,PROCS} from './items.js';
import {STAT_NAMES} from './equipment.js';

/** Anteil, den ein Wert allein beisteuert (abnehmender Ertrag r/(r+k), Kappe aus BALANCE). Dicke Haut hängt an der Stufe. */
export function ratingShare(key,value,level=1){const r=BALANCE.ratings;
 if(key==='armorRating')return Math.min(r.armor.cap,rating(value,ratingK(r.armor,level)));
 if(key==='crit')return Math.min(r.crit.cap,rating(value*r.crit.finesseWeight,ratingK(r.crit,level)));
 if(key==='haste')return Math.min(r.haste.cap,rating(value*r.haste.finesseWeight,ratingK(r.haste,level)));
 return 0;}
/** E-53: was N Punkte eines Werts für sich allein bewirken – eine Zeile je Wirkung aus STAT_EFFECTS.
 *  value in der angegebenen Einheit; Prozentwerte als Anteil ×100 gerundet. */
export function statYield(key,value,level=1){const W=k=>powerRate(k,level),P=BALANCE.player;if(!value)return [];
 switch(key){
  case 'stamina':return [{label:'Leben',value:value*P.hpPerStamina,unit:'Leben',source:'BALANCE.player.hpPerStamina'}];
  case 'might':return [{label:'Schaden',value:pct(value*W('might')),unit:'%',source:'BALANCE.power.might'}];
  case 'finesse':return [{label:'Glückstreffer-Chance',value:pct(ratingShare('crit',value,level)),unit:'%',source:'BALANCE.ratings.crit'},
   {label:'Tempo',value:pct(ratingShare('haste',value,level)),unit:'%',source:'BALANCE.ratings.haste'}];
  case 'wit':return [{label:'Heilung',value:pct(value*W('healWit')),unit:'%',source:'BALANCE.power.healWit'},
   {label:'Deckung',value:pct(value*W('shieldWit')),unit:'%',source:'BALANCE.power.shieldWit'},
   {label:'Ressourcenpunkte',value:round(value*W('energyRegenWit'),2),unit:'je s',source:'BALANCE.power.energyRegenWit'}];
  case 'armorRating':return [{label:'Schadensminderung',value:pct(ratingShare('armorRating',value,level)),unit:'%',source:'BALANCE.ratings.armor'}];
 }
 return [];}
const round=(n,d=1)=>Math.round(n*10**d)/10**d;
const pct=n=>round(n*100);

// Zahlenfelder der PROCS → Beschriftung, Einheit und Umrechnung. Neue Proc-Zahl ⇒ hier eine Zeile, sonst nichts.
const PROC_NUMBERS={
 energy:{label:'Ressource zurück',unit:'Ressourcenpunkte',scale:1},
 dashCd:{label:'Ausweichen schneller bereit',unit:'%',scale:100},
 reduction:{label:'weniger erlittener Schaden',unit:'%',scale:100},
 bonus:{label:'zusätzlicher Schaden auf markierte Ziele',unit:'%',scale:100},
 regen:{label:'Regeneration außerhalb des Kampfes',unit:'×',scale:1}
};
/** Zahlen eines Procs aus PROCS[id]. */
export function procNumbers(id){const p=PROCS[id];if(!p)return [];
 return Object.entries(PROC_NUMBERS).filter(([k])=>p[k]!==undefined).map(([k,m])=>({label:m.label,value:round(p[k]*m.scale),unit:m.unit,source:'PROCS.'+id+'.'+k}));}

/** Zahlen eines Gegenstands aus stats/weapon/heal/energy/stack/proc. Reihenfolge fest: Waffe, Werte mit ihren Wirkungen, Verpflegung, Proc. */
export function itemNumbers(id){const d=ITEM_CATALOG[id];if(!d)return [];const level=d.level||1,s=d.stats||{},out=[];
 if(d.weapon){const w=d.weapon;out.push({label:'Waffenschaden',value:w.min+'–'+w.max,unit:'je Treffer',source:'weapon.min/max'});
  if(w.speed){out.push({label:'Schlagfolge',value:round(w.speed,2),unit:'s',source:'WEAPON_TYPES.'+w.type+'.speed'});
   out.push({label:'Schaden je Sekunde',value:round((w.min+w.max)/2/w.speed),unit:'Schaden/s',source:'abgeleitet aus weapon'});}
  out.push({label:'Hände',value:w.hands===0?'Fernkampf':w.hands,unit:w.hands===0?'':'Hand',source:'weapon.hands'});}
 if(d.shield)out.push({label:'Schildparade',value:'frei',unit:'',source:'shield'});
 for(const k of Object.keys(STAT_NAMES))if(s[k]){out.push({label:STAT_NAMES[k],value:s[k],unit:'Punkte',source:'stats.'+k});
  for(const y of statYield(k,s[k],level))out.push({...y,label:y.label+' daraus'});}
 if(d.heal)out.push({label:'Leben sofort',value:d.heal,unit:'Leben',source:'heal'});
 // E-71: Beschriftung bleibt „Randale sofort“ (tests/content-loot.test.mjs liest sie); die Menge sind Ressourcenpunkte, je Klasse umgerechnet.
 if(d.energy)out.push({label:'Randale sofort',value:d.energy,unit:'Ressourcenpunkte',source:'energy'});
 if(d.kind==='consumable'){out.push({label:'Gemeinsame Abklingzeit',value:BALANCE.player.consumableCooldown,unit:'s',source:'BALANCE.player.consumableCooldown'});
  if(d.stack)out.push({label:'Stapel',value:d.stack,unit:'Stück',source:'stack'});
  if(d.price)out.push({label:'Kioskpreis',value:d.price,unit:'Pfandmarken',source:'price'});}
 if(d.level>1)out.push({label:'Mindeststufe',value:d.level,unit:'',source:'level'});
 if(d.proc)out.push(...procNumbers(d.proc));
 return out;}

/** Von Hand: effect/why/links/terms. Zahlen NICHT wiederholen – die stehen in numbers. */
export const ITEM_INFO={
 // --- Startausrüstung ---
 topfdeckel:{effect:'Schild in der Nebenhand. Erst mit einem Schild ist die Schildparade überhaupt anwählbar; dazu Dicke Haut gegen jeden Treffer.',
  why:'Angesagte Nahkampfzauber der Gegner tragen die Antwort im Namen („Parade“). Ohne Schild bleibt nur Weglaufen, und das kostet dich die Angriffszeit.',
  links:['dosenklinge','tresenhammer','dachsdeckel'],terms:['parade','deckung','armorRating']},
 pfandschleuder:{effect:'Fernkampfwaffe ohne Munition. Sie belegt den Fernkampfplatz und erfüllt damit die Waffenvoraussetzung aller Kniffe, die „Waffe im Fernkampfplatz“ verlangen – bei Bärbel und Kevin Grundangriff und Salve, bei allen der Wurf.',
  why:'Der Fernkampfplatz ist unabhängig von den Händen: Du kannst zweihändig prügeln und trotzdem werfen.',
  links:['megafon','ruhepfeife'],terms:['waffenschaden','autoangriff']},
 dosenklinge:{effect:'Einhandklinge. In der Haupthand die schnellste Startwaffe, in der Nebenhand steuert sie anteilig Schaden zu Nahkampfkniffen bei und erfüllt zusammen mit einer zweiten Einhandwaffe die Voraussetzung „Zweihandwaffe oder zwei Einhandwaffen“.',
  why:'Zwei Einhandwaffen sind der Weg zu schweren Kniffen, ohne auf die Schlagfolge des Tresenhammers zu warten – du bezahlst mit der Nebenhand und damit mit der Parade.',
  links:['tresenhammer','topfdeckel','flasche'],terms:['waffenschaden','abklingzeit']},
 tresenhammer:{effect:'Zweihandhammer. Höchster Grundschaden der Startausrüstung und allein schon „schwere Waffe“ – belegt dafür beide Hände, die Nebenhand bleibt leer.',
  why:'Der Tausch ist die erste echte Entscheidung: schwerer Schlag gegen Schildparade. Gegen Zauber mit „Parade“ im Namen ist der Hammer die schlechtere Wahl.',
  links:['dosenklinge','topfdeckel','sigizange'],terms:['waffenschaden','parade']},
 flasche:{effect:'Einhandprügel mit einem Punkt Wumms. Langsamster Takt der Einhandwaffen, dafür die engste Schadensspanne – wenig Ausreißer nach unten.',
  why:'Die Startwaffe für alle, die lieber verlässlich als spitz treffen; sie lässt die Nebenhand für Schild oder zweite Klinge frei.',
  links:['dosenklinge','dosenbrecher','topfdeckel'],terms:['waffenschaden','might']},
 kutte:{effect:'Startjacke für die Brust: etwas Standfestigkeit, etwas Dicke Haut.',
  why:'Der Brustplatz ist von der ersten Sekunde an belegt – alles Weitere ist Ersatz, kein Zugewinn aus dem Nichts.',
  links:['regenjacke','bierdeckelweste'],terms:['stamina','armorRating']},
 // --- Verpflegung ---
 brezel:{effect:'Stellt beim Benutzen sofort Leben her, auch mitten im Kampf. Teilt sich die gemeinsame Abklingzeit mit jeder anderen Verpflegung; Oskars Grill steigert die Wirkung und verkürzt die Wartezeit.',
  why:'Die einzige Heilung, die jede Klasse ohne Kniff hat. Sie gehört in die Aktionsleiste, nicht in den Rucksack.',
  links:['currywurst','grill','wasser'],terms:['verpflegung','leben','abklingzeit']},
 wasser:{effect:'Füllt sofort deine Klassenressource nach. Dieselbe gemeinsame Abklingzeit wie jede Verpflegung.',
  why:'Im Kampf schenkt dir keine Klasse etwas; das Konterwasser überbrückt genau das Loch nach einem teuren Kniff.',
  links:['kaltgetraenk','pfandbon','brezel'],terms:['verpflegung','ressource','abklingzeit']},
 currywurst:{effect:'Einziger Gegenstand, der Leben und Klassenressource in einem Zug gibt – dafür kostet er am Kiosk am meisten.',
  why:'Für den Moment, in dem beides knapp ist: Du verlierst nur eine Abklingzeit statt zwei.',
  links:['brezel','kaltgetraenk','grill'],terms:['verpflegung','leben','ressource','abklingzeit']},
 kaltgetraenk:{effect:'Die große Ration für deine Klassenressource. Mehr als das Konterwasser, dafür ab einer höheren Stufe und zum doppelten Preis.',
  why:'Vor einem Bosskampf einpacken: Die gemeinsame Abklingzeit macht zwei kleine Schlucke wertlos, einen großen nicht.',
  links:['wasser','currywurst'],terms:['verpflegung','ressource','abklingzeit']},
 pfandbon:{effect:'Füllt deine Klassenressource und färbt danach 60 s lang die Beute: Der nächste Kill in diesem Fenster zahlt dreifache Pfandmarken.',
  why:'Der einzige Weg, einen Kill gezielt zu Geld zu machen – zünde ihn vor einem Elite oder Boss, nicht zwischen Gänsen.',
  links:['wasser','pfandlager'],terms:['verpflegung','ressource','pfandmarken']},
 // --- Feste Ausrüstungsstücke ---
 dosenbrecher:{effect:'Verstärkter Einhandprügel: mehr Grundschaden als die Mehrwegflasche, dazu Wumms und Taktgefühl im selben Takt.',
  why:'Der erste klare Waffenzuwachs in Akt 1 und der Einstieg in Taktgefühl-Bauweisen – er lässt die Nebenhand frei.',
  links:['flasche','keilerzahn'],terms:['waffenschaden','might','glueckstreffer']},
 regenjacke:{effect:'Brustteil mit viel Dicker Haut und Standfestigkeit, ohne Voraussetzung an die Stufe.',
  why:'Der günstigste Sprung weg von der Clanjacke; Rüstung wirkt gegen jeden Treffer, nicht nur gegen angesagte Zauber.',
  links:['kutte','bierdeckelweste'],terms:['stamina','armorRating','deckung']},
 festivalstiefel:{effect:'Schuhe mit viel Taktgefühl und etwas Dicker Haut.',
  why:'Taktgefühl bringt Tempo: es verkürzt die gemeinsame Sperre zwischen zwei Kniffen – sie macht die ganze Rotation schneller, nicht nur einen Schlag.',
  links:['kabelbinderstiefel','fuchspfote'],terms:['finesse','tempo','armorRating']},
 pfandring:{effect:'Ring mit viel Bastelgrips.',
  why:'Bastelgrips speist Technikschaden, Heilung und den Nachschub der Klassenressource zugleich – der Ring lohnt für jede Klasse, die ihre Ressource ausgibt statt spart.',
  links:['hausordnung','schnorrerbecher'],terms:['wit','ressource']},
 hausordnung:{effect:'Glücksbringer mit Standfestigkeit und dem meisten Bastelgrips unter den festen Stücken vor Stufe 5.',
  why:'Belohnung aus Horsts Kapitel und damit der erste Glücksbringer überhaupt – bis dahin ist der Platz leer.',
  links:['pfandring','horststempel'],terms:['wit','stamina']},
 bierdeckelweste:{effect:'Schweres Brustteil: die meiste Dicke Haut aller nicht einzigartigen Stücke, dazu Standfestigkeit und Wumms.',
  why:'Für Spielarten, die im Nahkampf stehen bleiben statt auszuweichen – Rüstung und Leben greifen gemeinsam.',
  links:['regenjacke','kutte'],terms:['stamina','might','armorRating','deckung']},
 kabelbinderstiefel:{effect:'Schuhe mit viel Taktgefühl, dazu Bastelgrips und Dicke Haut.',
  why:'Der Tempo-Schuh für Akt 1; er drückt die Sperre zwischen zwei Kniffen spürbar, bevor Dorflegenden fallen.',
  links:['festivalstiefel','fuchspfote'],terms:['finesse','wit','tempo','abklingzeit']},
 megafon:{effect:'Fernkampfwaffe mit der höchsten Schadensspanne unter den nicht einzigartigen Stücken, dazu Taktgefühl und Bastelgrips.',
  why:'Ein Fernkampfplatz auf Bosskampf-Niveau: Er versorgt Wurf und Salve gleichermaßen, ohne die Hände zu belegen.',
  links:['pfandschleuder','ruhepfeife'],terms:['waffenschaden','finesse','glueckstreffer','wit']},
 kabeltalisman:{effect:'Erster gebauter Talisman an Kevins Werkbank (Stufe 2). Bewusst schwächer als gewürfelte seltene Ware derselben Stufe – dafür planbar statt erwürfelt.',
  why:'Schließt die Lücke, solange der Talismanplatz leer ist; Material dafür fällt bei Ordnungsamt und Oberpraktikant.',
  links:['blechtalisman','werkstatt','kabelbinder'],terms:['wit','stamina','tempo']},
 blechtalisman:{effect:'Zweiter gebauter Talisman (Werkbank Stufe 3) mit Wumms, Standfestigkeit, Bastelgrips und Taktgefühl.',
  why:'Die planbare Alternative, wenn die Dorflegende einer Familie nach vielen Kills immer noch nicht gefallen ist.',
  links:['kabeltalisman','werkstatt','dosenblech'],terms:['might','stamina','glueckstreffer']},
 // --- Dorflegenden ---
 keilerzahn:{effect:'Dorflegende mit Wumms, Standfestigkeit und Taktgefühl; ihr Proc füllt bei jedem Glückstreffer deine Klassenressource.',
  why:'Kurzschluss zwischen Glückstreffern und Klassenressource: Je mehr Taktgefühl der Bau trägt, desto häufiger kannst du Kniffe zünden.',
  links:['rage','dosenbrecher','kegelkugel'],terms:['dorflegende','proc','glueckstreffer','ressource','might']},
 gansorden:{effect:'Frühe Dorflegende mit viel Taktgefühl; ihr Proc verkürzt die Abklingzeit von Ausweichen.',
  why:'Ausweichen ist die Antwort auf jede angesagte Fläche. Kürzer bereit heißt: Du darfst öfter stehen bleiben und angreifen.',
  links:['fleet','fuchspfote','schaerpe'],terms:['dorflegende','proc','ausweichen','abklingzeit','tempo']},
 dachsdeckel:{effect:'Dorflegende mit der höchsten Dicken Haut ihrer Stufe; ihr Proc senkt den erlittenen Schaden, sobald du unter die Lebensschwelle fällst.',
  why:'Eine Notbremse statt eines Dauerbonus: Sie greift genau dann, wenn der nächste Treffer tödlich wäre.',
  links:['stout','topfdeckel','sigizange'],terms:['dorflegende','proc','stamina','armorRating','deckung']},
 ruhepfeife:{effect:'Einzigartige Fernkampfwaffe mit Bastelgrips und Taktgefühl; ihr Proc füllt beim Unterbrechen zusätzlich deine Klassenressource.',
  why:'Sie macht das Unterbrechen doppelt wertvoll: Der Zauber fällt aus und du bekommst den Nachschub für den Gegenschlag.',
  links:['silence','dienstmuetze','praktikantenausweis'],terms:['dorflegende','proc','unterbrechen','ressource','wit']},
 horststempel:{effect:'Einzigartiger Zweihandhammer mit gleich hohen Werten in Wumms, Taktgefühl und Bastelgrips; sein Proc erhöht den Schaden auf markierte Ziele.',
  why:'Er belohnt Spielarten, die erst markieren und dann zuschlagen – und er passt zu jeder Klasse, weil alle drei Primärwerte gleich hoch liegen.',
  links:['verdict','praktikantenausweis','tresenhammer'],terms:['dorflegende','proc','markierung','might','glueckstreffer']},
 fuchspfote:{effect:'Einzigartige Schuhe mit sehr viel Taktgefühl; ihr Proc verkürzt die Abklingzeit von Ausweichen.',
  why:'Tempo aus Taktgefühl und schnelleres Ausweichen ziehen in dieselbe Richtung: mehr Angriffe je Gefahr.',
  links:['fleet','gansorden','kabelbinderstiefel'],terms:['dorflegende','proc','ausweichen','tempo','finesse']},
 schnorrerbecher:{effect:'Dorflegende mit viel Bastelgrips und Standfestigkeit; ihr Proc füllt bei jedem Kill deine Klassenressource.',
  why:'Für Kämpfe gegen Gruppen: Der erste Kill bezahlt den Kniff für den zweiten. Gegen einzelne Bosse wirkt er nicht.',
  links:['thirst','bierbong','automatenarm'],terms:['dorflegende','proc','ressource','wit']},
 praktikantenausweis:{effect:'Dorflegende mit Bastelgrips und Taktgefühl; ihr Proc erhöht den Schaden auf markierte Ziele.',
  why:'Der Talisman zum Stempel: zweimal derselbe Proc stapelt sich nicht, aber der Ausweis trägt ihn in Bauten ohne Zweihandwaffe.',
  links:['verdict','horststempel','dienstmuetze'],terms:['dorflegende','proc','markierung','wit','glueckstreffer']},
 dienstmuetze:{effect:'Einzige Dorflegende für den Kopf; ihr Proc füllt beim Unterbrechen zusätzlich deine Klassenressource.',
  why:'Der Kopfplatz bleibt sonst den ganzen ersten Akt leer – die Mütze ist dort Rüstung, Leben und Proc in einem.',
  links:['silence','ruhepfeife','kabelbinder'],terms:['dorflegende','proc','unterbrechen','armorRating','stamina']},
 kegelkugel:{effect:'Dorflegende der Kegelbrüder mit Wumms, Standfestigkeit und Taktgefühl; ihr Proc füllt bei Glückstreffern deine Klassenressource.',
  why:'Die Nahkampf-Antwort auf den Keilerzahn: derselbe Kurzschluss, eine Stufe später und mit mehr Standfestigkeit.',
  links:['rage','keilerzahn','koenigskette'],terms:['dorflegende','proc','glueckstreffer','ressource','might']},
 bierbong:{effect:'Dorflegende der Junggesellen mit gleich viel Wumms wie Standfestigkeit, dazu Taktgefühl; ihr Proc füllt bei jedem Kill deine Klassenressource.',
  why:'Sie trägt Gruppenkämpfe: Tempo bringt dich schneller zum nächsten Ziel, der Proc bezahlt den Kniff dafür.',
  links:['thirst','schnorrerbecher','automatenarm'],terms:['dorflegende','proc','ressource','tempo','stamina']},
 sigizange:{effect:'Einzigartiger Zweihandhammer mit dem höchsten Grundschaden vor Stufe 6; ihr Proc senkt den erlittenen Schaden unter der Lebensschwelle.',
  why:'Zweihand ohne Schild heißt Treffer einstecken – die Zange bringt ihre eigene Notbremse mit.',
  links:['stout','dachsdeckel','tresenhammer'],terms:['dorflegende','proc','waffenschaden','might','wit']},
 koenigskette:{effect:'Dorflegende mit dem meisten Taktgefühl ihrer Stufe, dazu Bastelgrips; ihr Proc füllt bei Glückstreffern deine Klassenressource.',
  why:'Der Bau-Abschluss für Glückstreffer: Je höher die Glückstrefferchance, desto gleichmäßiger fließt der Nachschub.',
  links:['rage','kegelkugel','keilerzahn'],terms:['dorflegende','proc','glueckstreffer','ressource']},
 schaerpe:{effect:'Dorflegende mit Standfestigkeit, Wumms und sehr viel Taktgefühl; ihr Proc verkürzt die Abklingzeit von Ausweichen.',
  why:'Der breiteste Wertesatz im Spiel – sie passt in jeden Bau, der die Antwort auf Flächen häufiger braucht.',
  links:['fleet','gansorden','fuchspfote'],terms:['dorflegende','proc','ausweichen','tempo','stamina']},
 giesskanne:{effect:'Einzigartiger Zweihandhammer mit Wumms und Bastelgrips zu gleichen Teilen; ihr Proc verdoppelt die Regeneration außerhalb des Kampfes.',
  why:'Der einzige Proc, der zwischen den Kämpfen wirkt: Er spart Verpflegung und damit Pfandmarken auf langen Wegen.',
  links:['hops','tresen','brezel'],terms:['dorflegende','proc','leben','wit','verpflegung']},
 automatenarm:{effect:'Stärkste Dorflegende des ersten Aktes: Wumms, Taktgefühl und Bastelgrips gleich hoch, dazu Standfestigkeit und das meiste Taktgefühl im Spiel; ihr Proc füllt bei jedem Kill deine Klassenressource.',
  why:'Abschlussbelohnung – der Arm trägt jede Klasse und jeden Bau, weil er keinen Primärwert bevorzugt.',
  links:['thirst','schnorrerbecher','bierbong'],terms:['dorflegende','proc','ressource','glueckstreffer']}
};

/** Von Hand: effect/why/links/terms der Procs. Die Zahlen kommen aus PROCS. */
export const PROC_INFO={
 rage:{effect:'Jeder Glückstreffer füllt deine Klassenressource – unabhängig davon, welcher Kniff oder Autoangriff den Glückstreffer gelandet hat.',
  why:'Verbindet Glückstrefferchance mit deiner Ressource: Ein Bau auf Glückstreffer finanziert damit seine eigene Rotation.',
  links:['keilerzahn','kegelkugel','koenigskette'],terms:['proc','glueckstreffer','ressource']},
 fleet:{effect:'Verkürzt die Abklingzeit von Ausweichen um einen Anteil.',
  why:'Ausweichen ist die Antwort auf angesagte Flächen. Häufiger bereit heißt: Du musst nicht vorsorglich früh wegspringen.',
  links:['gansorden','fuchspfote','schaerpe'],terms:['proc','ausweichen','abklingzeit']},
 stout:{effect:'Senkt den erlittenen Schaden, solange dein Leben unter einem Drittel liegt.',
  why:'Wirkt nur im gefährlichen Bereich – er kauft dir die Sekunde, in der Verpflegung wieder bereit wird.',
  links:['dachsdeckel','sigizange','brezel'],terms:['proc','leben','deckung','verpflegung']},
 silence:{effect:'Ein erfolgreiches Unterbrechen füllt zusätzlich deine Klassenressource.',
  why:'Macht die Pflichtreaktion zur Belohnung: Der unterbrochene Zauber kostet den Gegner seinen Schaden und finanziert deinen nächsten Kniff.',
  links:['ruhepfeife','dienstmuetze'],terms:['proc','unterbrechen','ressource']},
 verdict:{effect:'Markierte Ziele erleiden zusätzlichen Schaden aus allen Quellen.',
  why:'Belohnt die Reihenfolge Markieren → Zuschlagen; ohne Markierung im Bau wirkt der Proc gar nicht.',
  links:['horststempel','praktikantenausweis'],terms:['proc','markierung','spezialkniff']},
 thirst:{effect:'Jeder Kill füllt deine Klassenressource auf.',
  why:'Trägt Kämpfe gegen Gruppen: Der erste Kill bezahlt den Kniff für den zweiten. Gegen einen einzelnen Boss wirkt er nicht.',
  links:['schnorrerbecher','bierbong','automatenarm'],terms:['proc','ressource']},
 hops:{effect:'Verdoppelt die Lebensregeneration außerhalb des Kampfes.',
  why:'Der einzige Proc, der zwischen den Kämpfen zählt – er spart Verpflegung und damit Pfandmarken auf langen Wegen.',
  links:['giesskanne','tresen'],terms:['proc','leben','verpflegung']}
};

/** Vollständiger info-Block eines Gegenstands: Handtext + abgeleitete Zahlen. */
export function describeItem(id){const d=ITEM_CATALOG[id],hand=ITEM_INFO[id];if(!d||!hand)return null;
 return {effect:hand.effect,numbers:itemNumbers(id),why:hand.why,links:hand.links||[],terms:hand.terms||[]};}
/** Vollständiger info-Block eines Procs. */
export function describeProc(id){const hand=PROC_INFO[id];if(!PROCS[id]||!hand)return null;
 return {effect:hand.effect,numbers:procNumbers(id),why:hand.why,links:hand.links||[],terms:hand.terms||[]};}
/** Alle Begriffs-IDs, die Loot aus content/glossary.js braucht (Besitzer: Klassendesign). */
for(const [id,d]of Object.entries(ITEM_CATALOG))if(['kraeutersud','hopfenschorle','feldtee'].includes(id))ITEM_INFO[id]={effect:d.kind==='consumable'?'Selbst gebraute Verpflegung wirkt sofort und nutzt die gemeinsame Abklingzeit.':'Zutat für die Hausbrauerei.',why:'Sammeln und Hausbrauerei: Handwerk aus dem Dorf.',links:[],terms:d.kind==='consumable'?['verpflegung','abklingzeit']:[]};
export const LOOT_TERMS=[...new Set([...Object.values(ITEM_INFO),...Object.values(PROC_INFO)].flatMap(i=>i.terms||[]))].sort();
// Die UI liest info direkt am Gegenstand; der Standard verlangt, dass jedes Element seinen Block trägt.
for(const id of Object.keys(ITEM_INFO))ITEM_CATALOG[id].info=describeItem(id);
for(const id of Object.keys(PROC_INFO))PROCS[id].info=describeProc(id);
