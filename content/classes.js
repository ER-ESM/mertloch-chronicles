// Spielbare Figuren des Poo-Tang-Clans. IDs sind Speicherschlüssel und Grafikschlüssel (assets/clan-skills-013/<id>.png).
// `passive` ist der Kurztext auf der Klamottenkarte (clan-ui.js) und muss sagen, was sich schon auf Stufe 1 anders anfühlt.
// `passives` ist die gemeinsame Quelle für Klassenbeschreibung und Laufzeitwerte.
export const CLAN_MEMBERS=[
 {id:'dieter',name:'Dosen-Dieter',role:'Tank · Tresenbrecher',age:38,color:'#e6ac6b',
  bio:'Seit 38 Jahren Mertloch. Seit 2007 mit demselben Pfandbon unterwegs. Hält einen Bierdeckel für eine gültige Baugenehmigung.',
  passive:'Schwere Hand: Deine Kelle kommt nur alle 1,5 s, haut dafür am härtesten im Clan, und du steckst 10 % weniger ein. Ausweichen ist kurz und selten – Dieter steht, wo andere rennen. Deckel drauf: Eine erfolgreiche Parade heilt zusätzlich 35 Leben.',
  rotation:'Pfandschuld markieren → Bierzelt-Abriss. Zwischen zwei Kellen schlägt dein Autoangriff. Angekündigte Treffer parieren.',
  passives:{strikeCd:1.5,strikeGain:11,dashCd:5,parryHeal:35,damageTaken:.9},
  look:'Breiter Kerl mit Schnauzer, Clankutte, Bierkasten-Tattoo am Unterarm, Kronkorken-Kelle'},
 {id:'baerbel',name:'Aperol-Anni',role:'Heilerin · Landhaus-Lady',age:34,color:'#edaa67',
  bio:'Landhausküche auf Pump, Aperol im Glas, Thermomix im Dauerlauf. Rettet den Clan mit Schminke und Hygiene – und wirbt dich dabei für ihre Putzpyramide an.',
  passive:'Takt statt Tempo: Triffst du 1–1,9 s nach dem letzten Pinsel-Piekser, erhältst du 10 zusätzliche Randale. Dafür heilst du dich schon ab Stufe 2 selbst. Erst eincremen, dann auf die Fresse.',
  rotation:'Hauspflege erhalten → Fleckentest → Thermomix-Turbostufe. Spezialisiere dich auf Landhaus-Heilung, Putzprovision durch Schaden oder Filter-Furie.',
  passives:{strikeCd:.95,strikeGain:19,dashCd:6,beatWindow:[1,1.9],beatEnergy:10},
  look:'Blonde Frau mit Dutt, Sonnenbrille im Haar, orangefarbener Blumenbluse, karierter Landhausschürze, goldenen Creolen, Lippenstift und Schminkpinsel; Putzspray am Gürtel'},
 {id:'kevin',name:'Klo-Kevin',role:'Fernkämpfer · Pfandingenieur',age:31,color:'#86c6b4',
  bio:'Baut aus Pfand, Kabelbindern und einem Pömpel Dinge, die laut TÜV nicht existieren dürften. „Hält schon“ waren seine ersten Worte.',
  passive:'Abstand halten: 26 m Wurfweite – die größte im Clan –, 9 Randale je Geschoss und ein Ausweichen alle 3 s statt alle 4 oder 5. Restdruck: Eine erfolgreiche Unterbrechung verkürzt Restmüll-Rakete um 2 s.',
  rotation:'Auf Distanz Pfand werfen → Gegner festkleben → Rakete. Ab Stufe 2 fliegt die Dosen-Drohne: deine Antwort, wenn jemand aus der Ferne auf dich hält. Unterbrechen verkürzt die Abklingzeit der Rakete.',
  passives:{strikeRange:210,strikeGain:9,dashCd:3,interruptBurstCd:2},
  look:'Dünner Typ mit Werkzeuggürtel, Schutzbrille auf der Stirn, Pömpel am Rücken, Dosen-Drohne'}
];
export const CLASS_IDS=CLAN_MEMBERS.map(m=>m.id);

// --- Beschreibungen (Welle D · Beschreibungs-Standard, docs/backlog/klassen.md) ---------------
// passiveInfo:{effect,why,links,terms} zum Kurztext `passive`. Den numbers-Block baut describe('passive',id)
// aus `passives` (content/glossary.js) – deshalb steht hier keine einzige Zahl.
export const PASSIVE_INFO={
 dieter:{effect:'Schwere Hand: der langsamste, aber härteste Grundangriff im Clan, dauerhaft weniger eingehender Schaden, ein kurzes seltenes Ausweichen und zusätzliche Heilung auf jede geglückte Parade.',why:'Legt die Spielart fest, bevor du ein einziges Talent lernst: Dieter hält seinen Platz, statt auszuweichen, und heilt sich, indem er richtig pariert.',links:['skill:dieter/strike','skill:dieter/parry','skill:dieter/dash'],terms:['grundangriff','parade','ausweichen','heilung','klamotten']},
 baerbel:{effect:'Takt statt Tempo: im Rhythmusfenster getroffen gibt der Grundangriff zusätzliche Randale; dafür lernt Anni ihre Heilung besonders früh.',why:'Gutes Timing versorgt Anni mit zusätzlicher Randale für ihre Kniffe.',links:['skill:baerbel/strike','skill:baerbel/heal'],terms:['takt','randale','grundangriff','heilung','klamotten']},
 kevin:{effect:'Abstand halten: die größte Grundangriffs-Reichweite und der höchste Randale-Ertrag im Clan, das häufigste Ausweichen – und kürzere Abklingzeit der Rakete auf jede geglückte Unterbrechung.',why:'Kevin gewinnt über Entfernung und Reaktion: jeder Meter Abstand ist ein Wurf mehr, jede Unterbrechung bringt die nächste Rakete näher.',links:['skill:kevin/strike','skill:kevin/dash','skill:kevin/interrupt'],terms:['reichweite','randale','ausweichen','unterbrechen','randale','klamotten']}
};
for(const m of CLAN_MEMBERS)m.passiveInfo=PASSIVE_INFO[m.id];
