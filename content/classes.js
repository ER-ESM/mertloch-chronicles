// Spielbare Figuren des Poo-Tang-Clans. IDs sind Speicherschlüssel und Grafikschlüssel (assets/clan-skills-013/<id>.png).
// `passive` ist der Kurztext auf der Klamottenkarte (clan-ui.js) und muss sagen, was sich schon auf Stufe 1 anders anfühlt.
// `passives` ist die gemeinsame Quelle für Klassenbeschreibung und Laufzeitwerte.
// E-71: jede Klasse hat ihre eigene Ressource (content/resources.js). Schorsch und Käthe sind wählbar, sobald ihre drei
// Talentbäume im Inhalt stehen (content/talents/<klasse>.js) – vorher würde die Klasse ohne Talente erscheinen.
import {TALENTS_SCHORSCH} from './talents/schorsch.js';
import {TALENTS_KAETHE} from './talents/kaethe.js';
const CORE_MEMBERS=[
 {id:'dieter',name:'Dosen-Dieter',role:'Tank · Tresenbrecher',age:38,color:'#e6ac6b',
  bio:'Seit 38 Jahren Mertloch. Seit 2007 mit demselben Pfandbon unterwegs. Hält einen Bierdeckel für eine gültige Baugenehmigung.',
  passive:'Wut und Zeche: Randale startet bei 0 und kommt aus Treffern – eingesteckten wie ausgeteilten. 30 % jedes Treffers lässt du anschreiben; jede ausgegebene Randale bezahlt die Zeche. Deine Kelle kommt nur alle 1,5 s, haut dafür am härtesten, und du steckst 10 % weniger ein. Eine geglückte Parade heilt 35 Leben.',
  rotation:'Treffer einstecken, Kelle → Pfandschuld markieren → Bierzelt-Abriss. Die Zeche abbezahlen – oder wachsen lassen und prellen.',
  passives:{strikeCd:1.5,strikeGain:11,dashCd:5,parryHeal:35,damageTaken:.9},
  look:'Breiter Kerl mit Schnauzer, Clankutte, Bierkasten-Tattoo am Unterarm, Kronkorken-Kelle'},
 {id:'baerbel',name:'Aperol-Anni',role:'Heilerin · Landhaus-Lady',age:34,color:'#edaa67',
  bio:'Landhausküche auf Pump, Aperol im Glas, Thermomix im Dauerlauf. Rettet den Clan mit Schminke und Hygiene – und wirbt dich dabei für ihre Putzpyramide an.',
  passive:'Content statt Dauerfeuer: Kniffe kosten Likes, neue Likes gibt es für Abwechslung. Zweimal dasselbe senkt deinen Trend, jeder neue Kniff hebt ihn – bis +30 % Wirkung. Im Takt (1–1,9 s nach dem letzten Piekser) gibt es 10 Likes extra. Dafür heilst du dich schon ab Stufe 2 selbst.',
  rotation:'Nie zweimal dasselbe: Piekser, Fleckentest, Piekser, Turbostufe, Puderdose – der Trend steigt. Bei Viral ist der nächste Kniff gratis.',
  passives:{strikeCd:.95,strikeGain:19,dashCd:6,beatWindow:[1,1.9],beatEnergy:10},
  look:'Blonde Frau mit Dutt, Sonnenbrille im Haar, orangefarbener Blumenbluse, karierter Landhausschürze, goldenen Creolen, Lippenstift und Schminkpinsel; Putzspray am Gürtel'},
 {id:'kevin',name:'Klo-Kevin',role:'Fernkämpfer · Pfandingenieur',age:31,color:'#86c6b4',
  bio:'Baut aus Pfand, Kabelbindern und einem Pömpel Dinge, die laut TÜV nicht existieren dürften. „Hält schon“ waren seine ersten Worte.',
  passive:'Leergut: 12 Flaschen im Kasten, jeder Wurf kostet eine. Heile Flaschen bleiben neben dem Ziel liegen – drüberlaufen sammelt sie ein. 26 m Wurfweite, ein Ausweichen alle 3 s. Eine erfolgreiche Unterbrechung verkürzt Restmüll-Rakete um 2 s.',
  rotation:'Werfen → Leergut einsammeln → Pfandautomat im goldenen Moment → Kleber → Rakete.',
  passives:{strikeRange:210,strikeGain:9,dashCd:3,interruptBurstCd:2},
  look:'Dünner Typ mit Werkzeuggürtel, Schutzbrille auf der Stirn, Pömpel am Rücken, Dosen-Drohne'}
];
const NEW_MEMBERS=[
 {id:'schorsch',name:'Schwenker-Schorsch',role:'Grillmeister · Glutwächter',age:52,color:'#e0843a',
  bio:'Seit 1989 Grillwart der Mertlocher Grillhütte. Hat den Schwenkgrill vom Opa geerbt und die Kette nie geölt – das Quietschen gehört zum Aroma.',
  passive:'Glut statt Randale: Deine Grillzange heizt um 12 Glut, alle 1,2 s. Zwischen 60 und 85 Glut triffst du 20 % härter, bei 100 kommt die Stichflamme. Ab Stufe 2 legst du Grillgut auf den Rost und servierst es gar.',
  rotation:'Zange heizt → Auflegen → Glut im goldenen Bereich halten → gar servieren. Ablöschen, bevor die Stichflamme kommt.',
  passives:{strikeCd:1.2,strikeRange:50,strikeGain:12,dashCd:4},
  look:'Stämmiger Mann mit Schiebermütze, Schnauzer und Grillschürze, Grillzange in der Hand, Schwenkgrill-Kette über der Schulter'},
 {id:'kaethe',name:'Kreuz-Käthe',role:'Stammtisch-Zockerin · Kartenlegerin',age:71,color:'#b89ad0',
  bio:'Gewinnt seit 1974 jeden Freitag am Stammtisch. Keiner weiß, wie. Alle wissen, dass man ihr nicht in die Karten schaut.',
  passive:'Blatt statt Randale: Du spielst Karten aus der Hand – Kreuz trifft, Pik schützt, Herz heilt, Karo bremst. Jede Karte gibt 5 Augen plus ihren Wert; ab 61 Augen rechnest du ab. Sieben bis Neun gehen nach 1 s raus.',
  rotation:'Karten spielen, Farbe bedienen, Gegnerzauber stechen → ab 61 Augen abrechnen oder auf Schneider (90) zocken.',
  passives:{strikeCd:0,strikeGain:5,dashCd:4.5},
  look:'Rüstige Rentnerin mit grauer Dauerwelle, Lesebrille an der Kette, lila Strickjacke, Kartenblatt in der Hand'}
];
const ready=t=>Object.keys(t||{}).length===3;
export const CLAN_MEMBERS=[...CORE_MEMBERS,...NEW_MEMBERS.filter(m=>ready({schorsch:TALENTS_SCHORSCH,kaethe:TALENTS_KAETHE}[m.id]))];
/** Alle Klassen einschließlich derer, deren Talentbäume noch fehlen (für Vorschau und Prüfungen der Inhaltsschicht). */
export const ALL_MEMBERS=[...CORE_MEMBERS,...NEW_MEMBERS];
export const CLASS_IDS=CLAN_MEMBERS.map(m=>m.id);

// --- Beschreibungen (Welle D · Beschreibungs-Standard, docs/backlog/klassen.md) ---------------
// passiveInfo:{effect,why,links,terms} zum Kurztext `passive`. Den numbers-Block baut describe('passive',id)
// aus `passives` (content/glossary.js) – deshalb steht hier keine einzige Zahl.
export const PASSIVE_INFO={
 dieter:{effect:'Wut und Zeche: Randale kommt aus Treffern statt aus einem Vorrat, ein Teil jedes Treffers wird angeschrieben, und jede ausgegebene Randale bezahlt davon ab. Dazu der langsamste, aber härteste Grundangriff im Clan, weniger eingehender Schaden und Heilung auf jede geglückte Parade.',why:'Legt die Spielart fest, bevor du ein einziges Talent lernst: Dieter will getroffen werden – wer steht und einsteckt, hat Randale; wer sie ausgibt, zahlt seine Zeche.',links:['skill:dieter/strike','skill:dieter/parry','skill:dieter/dash'],terms:['grundangriff','randale','zeche','parade','heilung','klamotten']},
 baerbel:{effect:'Abwechslung als Ressource: neue Kniffe heben den Trend und bringen Likes, Wiederholungen senken ihn; im Rhythmusfenster getroffen gibt der Grundangriff zusätzliche Likes. Dafür lernt Anni ihre Heilung besonders früh.',why:'Anni lebt von Reichweite: Wer seine ganze Leiste benutzt, heilt und trifft stärker als jemand, der eine Taste hämmert.',links:['skill:baerbel/strike','skill:baerbel/heal'],terms:['likes','trend','takt','grundangriff','heilung','klamotten']},
 kevin:{effect:'Leergut statt Vorrat: jeder Wurf kostet eine Flasche aus dem Kasten, heile Flaschen liegen danach zum Aufsammeln herum. Dazu die größte Grundangriffs-Reichweite, das häufigste Ausweichen und kürzere Abklingzeit der Rakete auf jede geglückte Unterbrechung.',why:'Kevin gewinnt über Entfernung und Nachschub: Wer seine Flaschen wieder einsammelt und im richtigen Moment nachlädt, wirft nie ins Leere.',links:['skill:kevin/strike','skill:kevin/dash','skill:kevin/interrupt'],terms:['reichweite','leergut','ausweichen','unterbrechen','klamotten']},
 schorsch:{effect:'Temperatur statt Vorrat: die Grillzange heizt die Glut, im goldenen Bereich trifft alles härter, zu heiß kommt die Stichflamme. Ab der zweiten Stufe gart Grillgut auf dem Rost und wird serviert.',why:'Schorsch spielt gegen die Uhr und das Thermometer: heizen, halten, ablöschen – und drei Garzeiten im Blick behalten.',links:['skill:schorsch/strike','skill:schorsch/mark','skill:schorsch/burst'],terms:['glut','grillrost','stichflamme','grundangriff','klamotten']},
 kaethe:{effect:'Karten statt Vorrat: die Hand liegt auf den ersten Leistenplätzen, jede Farbe wirkt anders, jede Karte zählt Augen für das Abrechnen. Luschen sind schwach, aber schnell.',why:'Käthe entscheidet bei jedem Druck neu: welche Karte jetzt, ob sie die Farbe bedient, ob sie einen Gegnerzauber sticht – und wann sie abrechnet.',links:['skill:kaethe/strike','throw:kaethe','skill:kaethe/interrupt'],terms:['blatt','augen','stich','abrechnen','grundangriff','klamotten']}
};
for(const m of ALL_MEMBERS)m.passiveInfo=PASSIVE_INFO[m.id];
