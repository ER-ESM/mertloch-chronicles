// Hauptgeschichte in Kapiteln. Kapitel 1 läuft im Spiel (engine.js quest.wolves/cultists/boss).
// Kapitel 2 und 3 sind vollständig beschrieben; sie brauchen noch Lager in world-layout.js und einen Kapitel-Umschalter in engine.js.
import {BALANCE} from './balance.js';
export const STORY={title:'Die letzte Kiste',giver:'Kisten-Ida',reward:'Goldener Dosenöffner',boss:'Horst Nüchternmann',faction:'Ruhe 22:01 e. V.'};
export const LORE={
 setting:'Mertloch im Maifeld, 56753. Ein Dorf mit Kirche, Grillplatz, Pfandhof und mehr Vereinen als Einwohnern.',
 clan:'Der Poo-Tang-Clan: Dieter, Bärbel, Kevin und Anhang. Geboren, geblieben, nie leise gewesen.',
 antagonist:'Ruhe 22:01 e. V. – gegründet nach dem Fest „Nie wieder Montag“, als um 22:01 Uhr zum ersten Mal jemand die Polizei rief. Ziel: absolute Nachtruhe. Mittel: Hausordnungen, Petitionen, Praktikanten, ein Pfandautomat.',
 macguffin:'Die letzte Kiste. Nicht irgendeine Kiste: die Kiste vom ersten Fest 2007, seitdem jedes Jahr neu befüllt. Wer sie hat, hat die Party.'
};
export const STORY_CHAPTERS=[
 {id:1,title:'Die letzte Kiste',boss:'horst',dialogue:'intro',implemented:true,
  summary:'Ruhe 22:01 hat Grill, Anlage und die letzte Kiste beschlagnahmt. Horst Nüchternmann hält sie im Hausordnungs-Panzer fest.',
  objectives:[{kind:'kill',type:'wolf',count:3,label:'Grillplatz-Plünderer stoppen'},{kind:'kill',type:'cultist',count:2,label:'Ruhewärter abfertigen'},{kind:'boss',boss:'horst',label:'Horst Nüchternmann umlegen'}],
  reward:{xp:BALANCE.xp.quest.main,coins:25,relic:'Goldener Dosenöffner',relicEffect:'+12 % Eskalationsschaden',gear:'rare'}},
 {id:2,title:'Der grüne Daumen der Macht',boss:'gisela',dialogue:'chapter2',implemented:false,requires:1,
  summary:'Hinter Horst steht Gisela Gießkanne, Erste Vorsitzende. Ihre Praktikanten kartieren das Dorf, ihr Garten ist eine Festung aus Petunien.',
  objectives:[{kind:'kill',family:'inspector',count:4,label:'Ordnungsamt-Praktikanten vertreiben'},{kind:'gather',item:'hopfen',count:5,label:'Wilden Eifelhopfen für Hedwig sichern'},{kind:'boss',boss:'gisela',label:'Gisela im Beet stellen'}],
  reward:{xp:900,coins:40,relic:'Hedwigs Trotzsud',relicEffect:'+10 % Heilung und Schilde',gear:'rare'},
  unlocks:['Außenbezirke: Füchse, Schnorrer, Praktikanten, Raben','Elite Borsten-Bruno']},
 {id:3,title:'Nicht angenommen',boss:'automat',dialogue:'chapter3',implemented:false,requires:2,
  summary:'Ruhe 22:01 stellt den Pfandautomaten 3000 auf. Er nimmt nichts an, frisst Drohnen und druckt Bußgelder statt Bons.',
  objectives:[{kind:'gather',item:'dosenblech',count:6,label:'Dosenblech vom Automaten sammeln'},{kind:'kill',family:'scrounger',count:5,label:'Festzelt-Schnorrer vom Automaten fernhalten'},{kind:'boss',boss:'automat',label:'Den Pfandautomaten 3000 abschalten'}],
  reward:{xp:1400,coins:60,relic:'Kevins Chip',relicEffect:'Verpflegung 5 s schneller bereit',gear:'epic'},
  unlocks:['Stufenlimit-Inhalte bis 12','Pfandautomat als Händler (geplant)']}
];
export const chapterFor=id=>STORY_CHAPTERS.find(c=>c.id===id)||STORY_CHAPTERS[0];
