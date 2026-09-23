// Einführungsfilm für neue Helden (intro-ui.js): Kamerafahrt durch die echte Spielwelt mit Untertiteln und
// Tasten-Einblendungen, jederzeit überspringbar. focus: 'bude' | 'ida' | 'hero' | 'camp' | 'treff'.
// seconds = Mindestdauer der Szene; längere Texte bekommen automatisch mehr Zeit (INTRO_UI.readingSpeed Zeichen/s).
export const INTRO_SCENES=[
 {focus:'bude',image:'intro-filmriss',eyebrow:'Mertloch · Sonntag, 6:47 Uhr',title:'Filmriss.',text:'Kopf dröhnt, Hemd weg, Hose weg. Du wachst in den Trümmern einer Clan-Bude auf – und niemand im Dorf weiß, wer du bist.',seconds:6},
 {focus:'ida',eyebrow:'Der Poo-Tang-Clan',title:'Kisten-Ida',text:'Ida hält zusammen, was vom Clan übrig ist. Sie glaubt dir kein Wort – aber sie gibt dir eine Chance: die Hofprobe.',seconds:6},
 {focus:'hero',eyebrow:'So bewegst du dich',title:'Laufen und zielen',text:'Mit WASD läufst du, ein Rechtsklick schickt dich hin oder greift an. Tab wählt den nächsten Gegner.',keys:[['W A S D','Laufen'],['Rechtsklick','Hin / Angreifen'],['Tab','Ziel wählen']],seconds:7},
 {focus:'hero',eyebrow:'So kämpfst du',title:'Zuhauen, ausweichen, reden',text:'Die 1 schaltet den Autoangriff, 2 bis 5 sind deine Kniffe. Mit der Leertaste springst du aus roten Kreisen, F spricht, plündert und bedient.',keys:[['1','Autoangriff'],['2 – 5','Kniffe'],['Leer','Ausweichen'],['F','Sprechen · Plündern']],seconds:8},
 {focus:'camp',image:'intro-maifeld',eyebrow:'Das Maifeld',title:'Irgendwo da draußen',text:'Pfandkeiler fressen die Reste deiner Nacht, und Horst Nüchternmann bewacht eine verdächtige Kiste. Dazwischen liegt die Wahrheit – und deine Hose.',seconds:7},
 {focus:'hero',eyebrow:'Stück für Stück',title:'Dein Weg beginnt',text:'Neue Menüs, Kniffe und Talente schaltest du nach und nach frei – mit jeder Stufe und jedem Kapitel. Sprich jetzt mit Kisten-Ida.',seconds:6,final:true},
];
export const INTRO_UI={skip:'Überspringen',skipKey:'Esc',next:'Weiter',start:'Los geht’s',label:'Einführungsfilm',readingSpeed:16,helpButton:'Einführungsfilm ansehen'};
