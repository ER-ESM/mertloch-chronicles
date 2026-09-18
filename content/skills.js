// Fähigkeiten. Stabile IDs (strike, mark, burst, interrupt, parry, dash, heal, buff, throw, ground + Talentfähigkeiten)
// sind Speicherschlüssel und Icon-Schlüssel (skill-art.js SKILL_ICON_ORDER). Neue aktive Fähigkeiten brauchen dort ein Icon.
// BASE = gemeinsames Gerüst je Slot, KITS = klassenspezifische Überschreibungen in derselben Reihenfolge.
export const BASE_SKILLS=[
 {id:'strike',key:'1',cd:.85,cost:0,range:55,damage:65,gain:14,color:'#ecdca3',bg:'#655d35',icon:'bottle'},
 {id:'mark',key:'2',cd:6,cost:20,range:155,dot:12,duration:10,color:'#a7dacf',bg:'#306359',icon:'tag'},
 {id:'burst',key:'3',cd:4,cost:35,range:125,base:55,perPoint:55,multiplier:1.6,color:'#e6c2fa',bg:'#665080',icon:'speaker'},
 {id:'interrupt',key:'4',cd:9,cost:10,range:140,damage:35,color:'#94cadb',bg:'#30546b',icon:'mute'},
 {id:'parry',key:'E',cd:7,cost:0,window:.8,reflect:75,color:'#e8d894',bg:'#74603b',icon:'shield'},
 {id:'dash',key:'LEER',cd:4,cost:0,steps:19,color:'#bbdfb8',bg:'#3b6952',icon:'dash'},
 {id:'heal',key:'Q',cd:22,cost:0,heal:240,color:'#edb0a2',bg:'#764a41',icon:'pretzel'}
];
export const KITS={
 dieter:[
  {name:'Kronkorken-Kelle',cd:1.5,text:"Eine schwere Kelle im Nahkampf: baut Pegel und Randale auf. „Das ist kein Streit. Das ist Leergutklärung.“ Drück sie, sobald sie bereit ist; dazwischen arbeitet dein Autoangriff."},
  {name:'Du schuldest mir Pfand!',text:"Markiert das Ziel und verursacht regelmäßig Schaden. Dein Abriss trifft markierte Gegner härter. Drück sie als Erstes auf jeden neuen Gegner."},
  {name:'Bierzelt-Abriss',text:"Verbraucht deinen Pegel für einen schweren Treffer; gegen markierte Gegner wirkt er stärker. Danach steht kein Tisch mehr gerade. Zünde ihn bei vollem Pegel auf ein markiertes Ziel."},
  {name:'Halt die Fresse!',text:"Unterbricht gelbe Zauber, betäubt und macht das Ziel kurz verwundbar. Drück ihn, sobald ein gelber Zauberbalken auftaucht; er ist unabhängig von der globalen Abklingzeit."},
  {name:'Deckel drauf!',text:"Pariert einen kommenden Treffer, reflektiert Schaden und heilt dich. Eine erfolgreiche Parade gibt Pegel und Randale. Drück ihn kurz vor dem angekündigten schweren Schlag, nicht danach."},
  {name:'Ab durch die Hecke',cd:5,steps:16,text:"Ein beherzter Abgang mit kurzem Schutz vor Treffern. Weicht in Laufrichtung aus, ohne Eingabe vom Ziel weg. Drück ihn raus aus roten Flächen und weg vom Rudel."},
  {name:'Konterfrühstück',text:"Heilt dich mit einer sehr verdächtigen Brezel. Im Spiel erstaunlich wirksam, kulinarisch ein Straftatbestand. Drück es bei fehlendem Leben; Überheilung verfällt ohne passendes Talent."}
 ],
 baerbel:[
  {name:'Pinsel-Piekser',cd:.95,range:155,damage:48,gain:10,icon:'speaker',text:"Ein Fernkampftreffer baut Glanz und Randale auf. Triff erneut im Taktfenster für zusätzlichen Glanz. Drück ihn im Rhythmus statt zu hämmern."},
  {name:'Fleckentest, Schätzchen!',range:190,dot:10,text:"Markiert das Ziel und verursacht regelmäßig Schaden. Verstärkt deinen Turbo-Einschlag. Drück ihn auf jeden neuen Gegner, bevor die Turbostufe kommt."},
  {name:'Thermomix-Turbostufe',range:175,base:40,perPoint:48,splash:95,text:"Verbraucht deinen Glanz für einen starken Einschlag; gegen markierte Gegner wirkt er stärker. Trifft auch Nachbarn, einschließlich neutraler Gegner. Zünde sie bei vollem Glanz auf ein markiertes Ziel mitten in der Gruppe."},
  {name:'Kommentarspalte zu!',range:190,cd:10,text:"Unterbricht gelbe Zauber, betäubt und macht das Ziel kurz verwundbar. „Deine Meinung hat Sendepause.“ Drück sie, sobald ein gelber Zauberbalken läuft."},
  {name:'Hygiene-Handschuh',window:.9,reflect:55,text:"Pariert einen kommenden Treffer und reflektiert Schaden. Gibt bei Erfolg Glanz und Randale. Drück ihn kurz vor dem angekündigten Treffer."},
  {name:'Raus aus meinem Reel',cd:6,steps:24,text:"Ein längerer Ausweichsprung mit kurzem Schutz. „Du stehst im Bild, verdammte Axt!“ Drück ihn aus roten Flächen heraus und um Abstand zu halten."},
  {name:'Landhaus-Löffelkur',cd:8,heal:145,text:'Heilt dich direkt. Bastelgrips, Wumms und Handschrift verstärken die Wirkung. Talente verwandeln die Heilung in Hauspflege, Schutz oder einen offensiven Frischekick. Drück sie früh: die Hauspflege wirkt nur, solange du noch stehst.'}
 ],
 kevin:[
  {name:'Pfandgeschoss',range:210,damage:42,gain:18,icon:'bottle',text:"Ein Fernkampftreffer baut Druck und Randale auf. Eine Flasche mit erstaunlich überzeugender Flugbahn. Drück ihn aus sicherer Entfernung, wenn nichts anderes bereit ist."},
  {name:'Kleb die Scheiße fest',range:210,dot:9,slow:.5,text:"Markiert das Ziel, verursacht regelmäßig Schaden und bremst seinen Anlauf. Drück ihn zuerst, bevor du Druck aufbaust und die Rakete zündest."},
  {name:'Restmüll-Rakete',range:205,base:60,perPoint:44,multiplier:1.8,knockback:28,text:"Verbraucht deinen Druck für einen schweren Treffer; gegen markierte Gegner wirkt er stärker. Stößt das Ziel zurück. Funktioniert laut Bauplan überhaupt nicht. Zünde sie bei vollem Druck auf ein geklebtes Ziel, das dir zu nah kommt."},
  {name:'Sicherung raus!',range:210,text:"Unterbricht gelbe Zauber, betäubt und macht das Ziel kurz verwundbar. Ein Erfolg liefert Druck und verkürzt die Abklingzeit deiner Rakete. Drück sie, sobald ein gelber Zauberbalken auftaucht."},
  {name:'Pömpel-Panzer',window:1.1,reflect:60,text:"Pariert einen kommenden Treffer, reflektiert Schaden und gibt Druck sowie Randale. Der Pömpel dichtet alles ab. Drück ihn kurz vor dem angekündigten Schlag im Nahkampf."},
  {name:'Kabelbrand-Flucht',cd:3,steps:22,text:"Aus dem Gefahrenbereich flitzen, mit kurzem Schutz vor Treffern. „Das hat vorhin noch nicht geraucht.“ Drück sie, wenn jemand in Nahkampfreichweite kommt oder der Boden raucht."},
  {name:'Notfall-Laugengebäck',heal:225,text:"Heilt dich mit Laugengebäck. Die Serviette ist gleichzeitig Garantieschein und Brandschutzkonzept. Drück es bei fehlendem Leben, am besten hinter Deckung."}
 ]
};
/** Klassenbuff (Slot „buff“). */
export const BUFF_SKILLS={
 common:{id:'buff',cd:28,cost:15,duration:10,color:'#aed7aa',bg:'#426c60',icon:'shield'},
 dieter:{name:'Dosenmut',reduction:.25,text:"Verringert für kurze Zeit eingehenden Schaden. Der Türsteher baut zusätzlich Deckung auf. Zünde ihn, bevor du eine Gruppe aufmischst."},
 baerbel:{name:'Aperol-Nachsorge',hot:12,text:"Hauspflege heilt dich regelmäßig. Orange im Glas, Grün im Lebensbalken. Annis fragwürdiges Wellnessprogramm. Zünde sie, bevor es eng wird, nicht wenn du schon fast liegst."},
 kevin:{name:'Isolierband hält',shield:130,text:'Ein Schutzpolster absorbiert Schaden. Bastelgrips und Handschrift verstärken den Schild. Zünde es, bevor du in Nahkampfreichweite gerätst.'}
};
/** Gezielter Wurf und Bodenangriff, je Klasse benannt. */
export const THROW_SKILL={id:'throw',key:'3',cd:6,cost:18,range:235,damage:75,icon:'bottle',color:'#dbc083',bg:'#5b6036',
 names:{dieter:'Pfand auf die Zwölf',baerbel:'Puderdose ins Gesicht',kevin:'Dosen-Drohne'},
 flavor:{dieter:'Eine gezielt geworfene Mehrwegflasche',baerbel:'Eine fliegende Puderdose',kevin:'Eine ferngesteuerte Pfanddose'},
 text:' trifft ein einzelnes Ziel. Ideal, um einen Gegner aus der Gruppe zu ziehen. Wirf ihn aus der Entfernung, bevor der Gegner dich erreicht.'};
export const GROUND_SKILL={id:'ground',key:'7',cd:12,cost:35,ground:true,range:210,radius:70,damage:125,delay:1.1,icon:'burst',color:'#e6b769',bg:'#79633e',
 names:{dieter:'Böller unterm Biertisch',baerbel:'Grundreinigung auf eigene Gefahr',kevin:'Restmüll mit Zündschnur'},
 text:'Mit der Maus einen freien Bodenpunkt wählen. Nach kurzer Verzögerung trifft der Einschlag mehrere Gegner im Umkreis – auch neutrale. Rechtsklick oder Esc bricht das Zielen ab. Wirf ihn dorthin, wo die Gruppe gleich steht, nicht dorthin, wo sie gerade steht.'};
/** Aktive Talentfähigkeiten (Schlüssel = grants in talents.js). */
export const TALENT_SKILLS={
 barricade:{name:'Absperrband',ground:true,range:170,radius:85,duration:8,cd:24,cost:25,text:'Platziere eine Zone, die eingehenden Schaden verringert. Bleib hinter deiner Absperrung, statt blind hinterherzulaufen. Stell sie, bevor die Gruppe bei dir ist.'},
 slam:{name:'Tresensprung',ground:true,range:145,radius:60,damage:95,cd:16,cost:20,text:'Springe zum freien Zielpunkt, triff mehrere Gegner und baue Pegel auf. Hindernisse kannst du nicht überspringen. Spring hin, wenn zwei oder mehr Gegner beieinanderstehen.'},
 keg:{name:'Katerfass',ground:true,range:160,radius:80,duration:10,cd:25,cost:25,text:'Platziere ein Fass, das dich regelmäßig heilt, solange du darin stehst. Gegner in der Pfütze werden langsamer. Stell es auf, bevor die Gruppe dich erreicht.'},
 sanctuary:{name:'Thermomix-Tafel',ground:true,range:190,radius:85,duration:10,cd:24,cost:25,text:'Eine Zone, die dich regelmäßig heilt. Du musst darin stehen bleiben; Bewegung und Heilung sinnvoll abwägen. Stell sie, wenn du länger an einem Fleck kämpfst.'},
 infusion:{name:'Provisionskur',duration:8,cd:24,cost:15,text:'Für kurze Zeit heilt dich ein Anteil deines verursachten Schadens zusätzlich. Dein Schmerz, meine Provision. Schön sauber abrechnen. Zünde sie, bevor du die Gruppe angehst, nicht danach.'},
 encore:{name:'Noch ein Reel, ihr Opfer!',cd:25,cost:10,text:'Setzt die Abklingzeit von Thermomix-Turbostufe zurück und füllt deinen Glanz. Fleckentest vorbereiten, Reel neu starten, Turbostufe zünden.'},
 detonate:{name:'Kettenzündung',radius:210,cd:14,cost:25,text:'Sprengt mehrere markierte Ziele in Sicht und Reichweite. Verbraucht deren Markierungen. Erst verteilen, dann zünden.'},
 magnet:{name:'Magnetpanzer',radius:120,cd:22,cost:25,text:'Gibt Deckung, zieht nahe Gegner an und hält sie kurz fest. Das zieht auch bislang neutrale Ziele in den Kampf. Zünde ihn, wenn Fernkämpfer dich einzeln beharken.'},
 snare:{name:'Pfandseil',ground:true,range:220,radius:48,duration:14,cd:16,cost:20,text:'Legt eine Falle aus. Der erste Eindringling erleidet Schaden und wird kurz festgehalten. Du kannst währenddessen weiterkämpfen. Leg sie auf den Weg, bevor du den nächsten Gegner ziehst.'}
};
/** Stufen, auf denen Kernfähigkeiten gelernt werden. Klassen überschreiben einzelne Einträge. */
// Stufe 1–4 = Grundrotation (Aufbau, Markieren, Finisher, Antwort). Danach Erweiterungen. Siehe docs/GAMEPLAY-KONZEPT-FLUSS.md.
export const LESSONS={auto:1,strike:1,dash:1,mark:2,burst:3,parry:4,interrupt:4,buff:5,throw:6,heal:7,ground:9};
// Kevin bekommt den Wurf auf Stufe 2 statt 6. Er ist der Fernkämpfer, und die Spielart Schrottkoloss macht seinen
// Grundangriff zum Nahkampf (class-mechanics.js). Ohne Wurf hatte er bis Stufe 6 keine Antwort auf Gegner, die aus
// der Distanz auf ihn halten – genau daher kamen die ⚠-Tode gegen Ruhewart, Schnorrer und Ordnungsamt-Praktikant.
export const CLASS_LESSONS={dieter:LESSONS,baerbel:{...LESSONS,heal:2,mark:3,burst:4,interrupt:4,parry:7},kevin:{...LESSONS,mark:2,throw:2,burst:3,interrupt:4,parry:4}};
// Balancing-Korrekturen (content/tuning.js): Klassen definieren Kits, Balancing korrigiert Zahlen je klasse/skill-ID.
import {TUNING,applyTuning} from './tuning.js';
for(const [cls,patch] of Object.entries(TUNING.skills)){const kit=KITS[cls];if(!kit)continue;const byId=Object.fromEntries(kit.map((s,i)=>[BASE_SKILLS[i].id,s]));applyTuning(byId,patch);}

// --- Beschreibungen (Welle D · Beschreibungs-Standard, docs/backlog/klassen.md) ---------------
// info:{effect,why,links,terms}. Nur diese vier Felder von Hand; den numbers-Block baut describe() aus den
// Definitionen oben (content/glossary.js). links = "<kind>:<id>" wie in describableIds(), terms = Glossar-IDs.
const KIT_INFO={
 'dieter/strike':{effect:'Ein einzelner schwerer Nahkampfschlag, der einen Pegel und Randale einbringt; die längste Grundangriffs-Abklingzeit im Clan.',why:'Deine Ressourcenquelle. Zwischen zwei Kellen schlägt der Autoangriff weiter – hämmern bringt nichts, den Takt gibt die Abklingzeit vor.',links:['skill:dieter/burst','passive:dieter','proc:nachschlag'],terms:['grundangriff','pegel','randale','autoangriff','abklingzeit']},
 'dieter/mark':{effect:'Klebt eine Marke auf ein Einzelziel, die jede Sekunde Schaden tickt und den Finisher gegen dieses Ziel verstärkt.',why:'Erste Taste auf jedem neuen Gegner: der Abriss lohnt erst auf einem markierten Ziel, und jeder Tick ist der Auslöser des Zapfmeister-Baums.',links:['skill:dieter/burst','talent:dieter-brew-1','proc:nachfuellen'],terms:['markierung','eskalation','proc']},
 'dieter/burst':{effect:'Verbraucht alle gesammelten Pegel; mit jedem verbrauchten Punkt steigt der Autoschaden-Anteil, gegen ein markiertes Ziel zusätzlich.',why:'Der Auszahlkniff der Rotation: erst markieren, drei Punkte sammeln, dann zünden. Mit weniger Punkten verschenkst du den größten Teil des Schadens.',links:['skill:dieter/mark','skill:dieter/strike','talent:dieter-wall-6'],terms:['eskalation','pegel','markierung','autoschaden']},
 'dieter/interrupt':{effect:'Bricht einen laufenden gelben Zauber ab, betäubt kurz und öffnet ein Verwundbarkeitsfenster; belegt die globale Abklingzeit nicht.',why:'Die einzige Antwort auf angekündigte Gegnerzauber – und zugleich dein bestes Schadensfenster, weil das Ziel danach mehr einsteckt.',links:['skill:dieter/burst'],terms:['unterbrechen','zauberbalken','verwundbar','betaeubung','gcd']},
 'dieter/parry':{effect:'Öffnet ein kurzes Fenster; der erste Treffer darin wird geschluckt, reflektiert und zahlt Pegel, Randale und Heilung aus.',why:'Reaktion, keine Vorsorge: zu früh gedrückt läuft das Fenster leer. Bei Dieter ist die Parade zugleich die zweite Heilquelle.',links:['passive:dieter','proc:deckel-reflex','proc:gut-gekuehlt','talent:dieter-wall-7'],terms:['parade','pegel','randale','deckung']},
 'dieter/dash':{effect:'Ein kurzer Satz in Laufrichtung mit kurzem Trefferschutz; ohne Eingabe geht es vom Ziel weg.',why:'Absichtlich der kürzeste und seltenste Sprung im Clan – er ist für rote Flächen da, nicht für Positionsspiele.',links:['passive:dieter','proc:hinterher'],terms:['ausweichen','flaeche']},
 'dieter/heal':{effect:'Stellt sofort Leben her, ohne Randale zu kosten – dafür die längste Abklingzeit aller Kniffe.',why:'Bei fehlendem Leben drücken: Überschuss verfällt ohne passendes Talent, und die Heilung braucht lange, bis sie wieder bereit ist.',links:['proc:gut-gekuehlt','proc:zapfhahn-auf'],terms:['heilung','ueberheilung','abklingzeit']},
 'baerbel/strike':{effect:'Ein Fernkampfstoß, der im Taktfenster zwei Aufbaupunkte statt einem gibt.',why:'Annis Aufbau steht und fällt mit dem Rhythmus: gehämmert bekommst du die Hälfte des Glanzes.',links:['passive:baerbel','talent:baerbel-stage-0','proc:frisch-gewischt'],terms:['grundangriff','glanz','takt','randale']},
 'baerbel/mark':{effect:'Markiert ein Ziel auf große Entfernung und tickt Schaden, der den nächsten Finisher verstärkt.',why:'Zugleich Annis Heilquelle: die Putzpyramide zahlt Lebensraub nur auf markierte Ziele aus.',links:['skill:baerbel/burst','talent:baerbel-feedback-0','proc:putzprovision'],terms:['markierung','lebensraub','eskalation']},
 'baerbel/burst':{effect:'Verbraucht allen Glanz für einen Einschlag, der zusätzlich alle im Umkreis trifft – auch neutrale Gegner.',why:'Der einzige Flächenschaden der Grundrotation. In der Gruppe zünden, aber nicht neben Unbeteiligten: der Umkreisschaden zieht sie in den Kampf.',links:['skill:baerbel/mark','talentSkill:encore','proc:zugabe-rhythmus'],terms:['eskalation','glanz','markierung','kettenzug','wirkzeit']},
 'baerbel/interrupt':{effect:'Bricht einen gelben Zauber auf voller Reichweite ab und öffnet ein Verwundbarkeitsfenster, ohne die globale Abklingzeit zu belegen.',why:'Annis einziger Weg, angekündigten Schaden ganz zu vermeiden, statt ihn hinterher wegzuheilen.',links:['proc:mehrwegflasche','talent:baerbel-feedback-7'],terms:['unterbrechen','zauberbalken','verwundbar','gcd']},
 'baerbel/parry':{effect:'Längeres Parierfenster als Dieters; gibt Aufbaupunkt und Randale zurück, aber keine Heilung.',why:'Reiner Aufbau: wer den Treffer nicht abfängt, verliert das Fenster ohne jeden Ertrag.',links:['talent:baerbel-care-7','skill:baerbel/heal'],terms:['parade','glanz','randale']},
 'baerbel/dash':{effect:'Der weiteste Ausweichsprung im Clan, mit kurzem Trefferschutz.',why:'Anni kämpft auf Abstand: der Sprung bringt dich aus Flächen und aus dem Nahkampf zurück auf Sprühweite.',links:['talent:baerbel-stage-3','passive:baerbel'],terms:['ausweichen','flaeche','reichweite']},
 'baerbel/heal':{effect:'Heilt dich nach kurzer Wirkzeit; Bastelgrips, Wumms und Handschrift verstärken die Menge.',why:'Anni lernt ihre Heilung früh und drückt diesen Knopf häufig – fast jeder ihrer Talentbäume hängt einen Zusatzeffekt an genau diesen Auslöser.',links:['proc:kurzer-hausbesuch','proc:frisch-gewischt','talent:baerbel-care-0'],terms:['heilung','wit','masteryRating','hauspflege','wirkzeit','proc']},
 'kevin/strike':{effect:'Ein Wurfgeschoss mit der größten Grundangriffs-Reichweite im Clan; gibt Druck und den höchsten Randale-Ertrag.',why:'Kevins Tank ist Randale: durchgehend aus sicherer Entfernung werfen finanziert Rakete, Kleber und Ausweichen.',links:['passive:kevin','skill:kevin/burst'],terms:['grundangriff','druck','randale','reichweite']},
 'kevin/mark':{effect:'Markiert und halbiert zugleich das Bewegungstempo des Ziels, solange die Marke klebt.',why:'Kevins Abstandshalter: ein gebremster Nahkämpfer erreicht dich zwei bis drei Würfe später.',links:['skill:kevin/burst','talentSkill:detonate','proc:zuendfunke'],terms:['markierung','verlangsamung','druck']},
 'kevin/burst':{effect:'Verbraucht allen Druck, schlägt gegen markierte Ziele am härtesten ein und stößt das Ziel weg.',why:'Zwei Aufgaben in einem Knopf: größter Einzelschaden und Notbremse, wenn dir jemand zu nah kommt.',links:['skill:kevin/mark','proc:frisch-verschraubt','proc:dampfdruck'],terms:['eskalation','druck','rueckstoss','markierung','wirkzeit']},
 'kevin/interrupt':{effect:'Bricht den gelben Zauber ab und zahlt zusätzlich einen Aufbaupunkt aus; der Finisher wird früher bereit.',why:'Bei Kevin gehört Unterbrechen zur Schadensrotation, nicht nur zur Verteidigung.',links:['passive:kevin','proc:schritt-voraus','talent:kevin-fuse-3'],terms:['unterbrechen','zauberbalken','verwundbar','druck','abklingzeit']},
 'kevin/parry':{effect:'Das längste Parierfenster im Clan; fängt den Treffer ab und zahlt Druck und Randale.',why:'Als Fernkämpfer stehst du selten im Nahkampf – wenn doch, ist das breite Fenster deine beste Antwort neben Ausweichen.',links:['proc:dampfdruck','talent:kevin-iron-2'],terms:['parade','druck','randale']},
 'kevin/dash':{effect:'Das häufigste Ausweichen im Clan, mit kurzem Trefferschutz.',why:'Kevins Positionsspiel: raus aus Flächen, raus aus dem Nahkampf – und im Pfandjäger-Baum der Auslöser für kostenlose Würfe.',links:['passive:kevin','proc:nachladen-im-rennen','proc:fangschuss'],terms:['ausweichen','flaeche','proc']},
 'kevin/heal':{effect:'Stellt sofort Leben her und kostet keine Randale; dafür ist die Abklingzeit länger als jeder normale Kampf.',why:'Kevin hat keine zweite Heilquelle – halte den Knopf für den Moment zurück, in dem ein weiterer Treffer tödlich wäre.',links:['proc:doppelte-sicherung'],terms:['heilung','abklingzeit','deckung']}
};
for(const [key,info] of Object.entries(KIT_INFO)){const [cls,sid]=key.split('/'),i=BASE_SKILLS.findIndex(s=>s.id===sid);if(KITS[cls]?.[i])KITS[cls][i].info=info;}
BUFF_SKILLS.dieter.info={effect:'Senkt für die Dauer allen eingehenden Schaden; als Türsteher legt es zusätzlich Deckung auf.',why:'Vor dem Anmischen zünden. Die Abklingzeit ist fast dreimal so lang wie die Wirkung – ein geplantes Fenster, keine Notbremse.',links:['passive:dieter','talent:dieter-wall-0'],terms:['staerkung','deckung','abklingzeit']};
BUFF_SKILLS.baerbel.info={effect:'Legt für die Dauer Hauspflege auf: eine Heilung je Sekunde, auch im Laufen.',why:'Vorsorge statt Rettung – der Tick heilt langsam, deshalb früh zünden, solange du noch Puffer hast.',links:['talent:baerbel-care-0','talent:baerbel-care-9'],terms:['staerkung','hauspflege','heilung']};
BUFF_SKILLS.kevin.info={effect:'Legt ein Schadenspolster auf, das Bastelgrips und Handschrift verstärken.',why:'Kevins einziger planbarer Schutz vor dem Nahkampf: zünden, bevor jemand bei dir ist, nicht wenn er schon schlägt.',links:['passive:kevin','proc:nietenpanzer'],terms:['staerkung','deckung','wit','masteryRating']};
THROW_SKILL.info={
 dieter:{effect:'Ein einzelner Wurf auf große Entfernung, der nur das getroffene Ziel weckt.',why:'Dieters Werkzeug, um einen Gegner aus der Gruppe zu ziehen, bevor die Nachbarn nachrücken.',links:['proc:hinterher','skill:dieter/strike'],terms:['wurf','kettenzug','reichweite']},
 baerbel:{effect:'Ein gezielter Einzelwurf mit voller Reichweite, der die Rotation nicht anhält.',why:'Annis Eröffnung aus sicherer Entfernung – im Filter-Furie-Baum der Kniff, den Glückstreffer, Ausweichen und Kills immer wieder gratis nachladen.',links:['proc:buehnenfunke','proc:zugabe-rhythmus','talent:baerbel-stage-9'],terms:['wurf','glueckstreffer','kettenzug']},
 kevin:{effect:'Kevins früher Einzelwurf ergänzt das Pfandgeschoss als zusätzlicher Fernkampfangriff.',why:'Zwischen zwei Aufbaukniffen hält der Wurf den Druck auf entfernte Gegner aufrecht.',links:['passive:kevin','proc:fangschuss','proc:nachladen-im-rennen'],terms:['wurf','reichweite','druck']}
};
GROUND_SKILL.info={
 dieter:{effect:'Ein verzögerter Einschlag auf einen gewählten Bodenpunkt; trifft bis zu fünf Ziele, auch neutrale.',why:'Dieters einziger echter Flächenschaden – dorthin werfen, wo die Gruppe gleich steht, nicht wo sie gerade steht.',links:['skill:dieter/burst'],terms:['bodenangriff','flaeche','kettenzug','wirkzeit']},
 baerbel:{effect:'Verzögerter Flächeneinschlag, für den Anni stehen bleiben muss.',why:'Ergänzt die Turbostufe: zwei Flächen kurz hintereinander räumen eine Gruppe, die gerade nachrückt.',links:['skill:baerbel/burst'],terms:['bodenangriff','wirkzeit','flaeche']},
 kevin:{effect:'Verzögerter Flächeneinschlag, den der Zündmeister-Baum um Nachglut und Sofort-Bereitschaft erweitert.',why:'Im Zündmeister-Baum der am häufigsten zurückgesetzte Kniff – Glückstreffer und Heilung laden ihn nach.',links:['proc:kurzschluss','proc:doppelte-sicherung','talent:kevin-fuse-0'],terms:['bodenangriff','flaeche','proc']}
};
const TALENT_SKILL_META={
 barricade:{icon:'reinforced',info:{effect:'Stellt eine Zone auf, in der du deutlich weniger Schaden nimmst.',why:'Der Türsteher hält einen Ort, statt hinterherzulaufen: Gegner zu dir kommen lassen und in der Zone bleiben.',links:['talent:dieter-wall-4','talent:dieter-wall-8'],terms:['flaeche','talentfaehigkeit','spezialisierung']}},
 slam:{icon:'burst',info:{effect:'Springt zu einem freien Zielpunkt und trifft dort bis zu fünf Gegner; gibt beim Aufkommen einen Aufbaupunkt.',why:'Dieters einziger Ortswechsel mit Schaden – nur sinnvoll, wenn mindestens zwei Gegner beieinanderstehen. Hindernisse überspringt er nicht.',links:['talent:dieter-brawl-4','talent:dieter-brawl-8','talent:dieter-brawl-9'],terms:['pegel','flaeche','talentfaehigkeit']}},
 keg:{icon:'water',info:{effect:'Stellt ein heilendes Fass auf; die Pfütze darunter verlangsamt Gegner.',why:'Macht aus einem Fleck Boden eine Kampfzone: Dieter steht ohnehin, das Fass belohnt genau das.',links:['talent:dieter-brew-4','talent:dieter-brew-8','talent:dieter-brew-9'],terms:['flaeche','heilung','verlangsamung']}},
 sanctuary:{icon:'food',info:{effect:'Legt eine Heilzone aus, die jede Sekunde heilt, solange du darin stehst.',why:'Zwingt Anni zum Stehen – das ist der Preis für die stärkste anhaltende Heilung im Spiel.',links:['talent:baerbel-care-4','talent:baerbel-care-8'],terms:['flaeche','heilung','talentfaehigkeit']}},
 infusion:{icon:'ring',info:{effect:'Wandelt für die Dauer einen Anteil deines gesamten verursachten Schadens zusätzlich in Heilung um.',why:'Die einzige Heilquelle, die keine Markierung braucht – vor der Gruppe zünden, nicht danach.',links:['talent:baerbel-feedback-4','talent:baerbel-feedback-8'],terms:['lebensraub','heilung','markierung']}},
 encore:{icon:'speaker',info:{effect:'Setzt die Abklingzeit des Finishers zurück und füllt die Aufbaupunkte sofort auf drei.',why:'Erlaubt zwei Turbostufen hintereinander – die Marke vorher erneuern, sonst verschenkst du den Markierungsbonus.',links:['talent:baerbel-stage-4','talent:baerbel-stage-8','skill:baerbel/burst'],terms:['eskalation','glanz','abklingzeit']}},
 detonate:{icon:'burst',info:{effect:'Sprengt alle Markierungen in Sicht und Reichweite gleichzeitig und verbraucht sie dabei.',why:'Belohnt das Verteilen der Klebemarke: erst mit dem Marken-Sprung auf Nachbarn lohnt der Knopf – danach sind alle Marken weg.',links:['talent:kevin-fuse-4','talent:kevin-fuse-2','talent:kevin-fuse-8'],terms:['markierung','flaeche','talentfaehigkeit']}},
 magnet:{icon:'metal',info:{effect:'Legt Deckung auf und zieht nahe Gegner an dich heran, wo sie kurz festhängen.',why:'Der Schrottkoloss holt sich die Fernkämpfer in den Nahkampf – er zieht dabei aber auch bislang neutrale Gegner mit hinein.',links:['talent:kevin-iron-4','talent:kevin-iron-8'],terms:['deckung','festhalten','kettenzug']}},
 snare:{icon:'cable',info:{effect:'Legt eine Falle aus; der erste Gegner, der hineinläuft, nimmt Schaden und wird festgehalten.',why:'Sie liegt scharf, während du weiterkämpfst – auf den Anlaufweg legen, bevor du den nächsten Gegner ziehst.',links:['talent:kevin-hunt-4','talent:kevin-hunt-8'],terms:['festhalten','flaeche','talentfaehigkeit']}}
};
for(const [id,m] of Object.entries(TALENT_SKILL_META)){if(!TALENT_SKILLS[id])continue;TALENT_SKILLS[id].icon=m.icon;TALENT_SKILLS[id].info=m.info;}
