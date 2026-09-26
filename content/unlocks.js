// Schrittweise Freischaltung der Menüs (unlocks.js). Die sieben Fenster der Menüleiste stehen immer da (Runde 1, 2026-09-24):
// Aufträge (J/L) sind ab dem Start offen, die Hofprobe steht dort als Auftrag; Talente zeigen vor Stufe 5 eine ausgegraute Vorschau.
// Alles Weitere kommt als Belohnung für Hofprobe, Stufen und Kapitel dazu.
// Bedingungen werden aus dem Spielstand abgeleitet (nichts wird gespeichert) – alte Spielstände verlieren nichts.
// when: {tutorial:true} Hofprobe bestanden · {level:n} Stufe n · {chapter:n} Kapitel n abgeholt · {memory:n} n Erinnerungen
//       {bude:true} erstes Bude-Gebäude freigeschaltet (Kapitelbelohnung laut content/buildings.js)
export const FEATURE_UNLOCKS=[
 {id:'meter',name:'Kampfstatistik',where:'Knopf oben links · Taste V',when:{tutorial:true},text:'Schaden und Heilung jedes Kampfes zum Nachlesen.'},
 {id:'hudEdit',name:'UI bearbeiten',where:'Spielmenü (Esc)',when:{tutorial:true},text:'Rahmen, Leisten und Fenster nach deinem Geschmack verschieben und skalieren.'},
 {id:'memories',name:'Erinnerungen',where:'Fenster Aufträge',when:{memory:1},text:'Jeder Erinnerungsfetzen der Filmriss-Nacht landet hier – mit Bild und Hinweis.'},
 {id:'professions',name:'Berufe',where:'Lehrer im Werkhof und Braugarten · Shift + B',when:{level:3},text:'Zwei Berufe beim Lehrer lernen, Rezepte ab Fertigkeitsstufe dazukaufen, an Fundstellen sammeln und an der Station herstellen.'},
 {id:'companions',name:'Söldner',where:'Spielmenü · Schwarzes Brett am Clan-Treff',when:{level:4},text:'Heuere Mitstreiter an: Schutz, Heilung oder Schaden für die nächsten Kämpfe.'},
 {id:'talents',name:'Talente',where:'Menüleiste · Taste N',when:{level:5},text:'Wähle deinen Hauptbaum – die seit Stufe 2 gesparten Punkte warten schon.'},
 {id:'mounts',name:'Fahrzeuge & Reittiere',where:'Spielmenü · Fahrstall am Clan-Treff',when:{chapter:1},text:'Mit der Hose zurück kommt auch die Würde: Mofa, Roller, Pferd, Esel, Drahtesel und Aufsitzmäher für die Dorfwege.'},
 {id:'bude',name:'Bude',where:'Fenster Aufträge',when:{bude:true},text:'Der Wiederaufbau beginnt: Aus den Trümmern hinter St. Gangolf wird Stück für Stück wieder die Bude.'},
];
export const UNLOCK_UI={
 banner:'Neu freigeschaltet',
 locked:(name,condition)=>name+' gibt es '+condition+'.',
 condition:{tutorial:'nach der Hofprobe bei Kisten-Ida',level:n=>'ab Stufe '+n,chapter:n=>'nach Kapitel '+n+' der Hauptgeschichte',memory:()=>'mit der ersten Erinnerung',bude:'nach Kapitel 2 der Hauptgeschichte, wenn Ida den Wiederaufbau freigibt'},
 badge:'Neu',
 upcoming:'Kommt noch',
};
/** Texte der großen Einblendungen (milestone-ui.js). */
export const MILESTONE_UI={
 levelEyebrow:'Aufgestiegen',level:n=>'Stufe '+n,
 hp:n=>'+'+n+' Leben',points:n=>n===1?'+1 Talentpunkt':'+'+n+' Talentpunkte',skill:name=>'Neuer Kniff: '+name,
 unlockEyebrow:'Neu freigeschaltet',
 // Dungeon-Fix 3 (Big-B-Abnahme #721: „Termin eingehalten“ stand nur im Chat): Erfolg und Titel als kurze Einblendung oben
 featEyebrow:'Erfolg',titleEyebrow:'Neuer Titel',
};
