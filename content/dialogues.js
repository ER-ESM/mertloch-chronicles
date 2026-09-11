// Gesprächstexte. Quests bringen ihre eigenen Zeilen mit (quests.js). Hier: Hauptgeschichte, Bosse, Sprüche.
// dialogue(npcId, state) liefert die passende Zeile; unbekannte Zustände fallen auf 'greet' zurück.
import {STORY_CHAPTERS} from './story.js';
export const MAIN_DIALOGUE={
 ida:{
  intro:{eyebrow:'KISTEN-IDA · LOGISTIK AUF ZWEI PROMILLE',title:'Die letzte Kiste. Weg. Einfach weg.',
   lines:['„Wir wohnen unser ganzes Leben in Mertloch. Wir haben hier die erste Party gefeiert, die erste Anlage geschrottet und bei jedem Scheißfest die Bänke geschleppt. Und heute will uns <b>Ruhe 22:01 e. V.</b> erklären, wann Feierabend ist.“',
    '„Drei Pfandkeiler haben den Grillplatz zerlegt. Zwei Ruhewärter haben unsere Anlage eingezogen. Und <b>Horst Nüchternmann</b> steht auf dem Feld in einem Panzer aus beschissenen Hausordnungen und hält unsere letzte Kiste als Beweismittel fest.“',
    '„Hol das Zeug zurück. Wir brauchen keinen Auserwählten. Wir brauchen jemanden, der nicht schon im Blumenbeet liegt.“'],
   accept:'Nicht mit unserem Leergut.',decline:'Erst mal die Lage antrinken.'},
  ongoing:{title:'Wie läuft die Schadensbegrenzung?',line:'„Grillplatz, Ruhewärter, Horst. In der Reihenfolge. Die gelben Viecher draußen sind neutral. Wenn du die anpöbelst, ist das dein Problem, du wandelnder Versicherungsfall.“',close:'Alles klar, Chefin.'},
  reward:{eyebrow:'POO-TANG LÄSST SICH NICHT ABSCHALTEN',title:'Die Kiste lebt. Horsts Würde nicht.',
   lines:['„Grill gerettet. Anlage zurück. Horst hat sich selbst wegen Ruhestörung angezeigt. Ich könnte heulen, aber dann wird das Bier salzig.“',
    'Ida drückt dir den goldenen Dosenöffner in die Hand. Auf der Rückseite steht: <b>MERTLOCH BLEIBT WACH.</b> Es ist schief graviert. Kevin war es.'],
   claim:'Poo-Tang. Bis die Boxen kotzen.'},
  claimed:{title:'Mertloch bleibt wach.',line:'„Die Party läuft wieder. Draußen sammeln die nächsten Idioten schon ihre Hausordnungen auf. Geh spazieren, geh prügeln – aber bring deinen Pfand zurück.“',close:'Alles klar, Chefin.'},
  // Kapitel 2 und 3 (Texte fertig, Spiellogik folgt mit den Kapiteln)
  chapter2:{eyebrow:'KISTEN-IDA · ES GIBT EINE VORSITZENDE',title:'Horst war nur der Praktikant.',
   lines:['„Gisela Gießkanne. Erste Vorsitzende. Sie hat den Bürgermeister in der Tasche, das Ordnungsamt im Garten und unser Festzelt auf ihrer Abschussliste.“',
    '„Ihre Praktikanten laufen mit Klemmbrettern durch die Felder. Vertreib sie, hol Hedwigs Hopfen zurück, und dann besuchen wir die Dame in ihrem Beet.“'],
   accept:'Beet ist Beet. Fest ist Fest.',decline:'Ich brauch erst ein Kaltgetränk.'},
  chapter3:{eyebrow:'KISTEN-IDA · DAS DING NIMMT NICHTS AN',title:'Der Automat hat unser Leergut geschluckt.',
   lines:['„Ruhe 22:01 hat einen Pfandautomaten aufgestellt. Prototyp. Nimmt keine Dosen, keine Flaschen, keine Widerrede. Er hat Kevins Drohne gefressen.“',
    '„Wenn wir das Ding nicht abschalten, gibt es in Mertloch nie wieder Pfand. Und ohne Pfand keine Kiste. Und ohne Kiste …“ Sie schaut dich an. „Du weißt schon.“'],
   accept:'Dann bauen wir ihn um.',decline:'Erst die Drohne betrauern.'}
 }
};
/** Sprüche der Bosse: Kampfbeginn, Phasen, Niederlage. Phasen stehen in enemies.js BOSSES.*.phases. */
export const BOSS_LINES={
 horst:{engage:'Sie befinden sich in einer Ruhezone. Ich muss Sie bitten.',defeat:'Ich … lege Widerspruch ein.',playerDeath:'Vermerkt. Abgeheftet. Ruhe.'},
 gisela:{engage:'Auf meinem Rasen? Mit Schuhen?',defeat:'Meine Petunien … sagt Bernd, es tut mir leid.',playerDeath:'Ab auf den Kompost.'},
 automat:{engage:'FLASCHE EINFÜHREN. SIE SIND KEINE FLASCHE.',defeat:'STÖRUNG. BITTE WENDEN SIE SICH AN DAS PERSONAL. ES GIBT KEIN PERSONAL.',playerDeath:'NICHT ANGENOMMEN.'}
};
/** Sprüche menschlicher Feldgegner beim Angriff. */
export const ENEMY_BARKS={
 warden:['Das ist eine Ruhezone!','Ich hab’s dokumentiert.','22:01. Feierabend.'],
 scrounger:['Haste mal ’nen Euro?','Nur ’n Schluck. Ehrlich.','Ich geb’s dir Freitag zurück.'],
 inspector:['Ich bin nur Praktikant!','Das muss ich meinem Chef melden.','Absperrkegel sind Amtsgeräte!']
};
/** Kurze Systemmeldungen, die Inhalt tragen (Engine-Toasts). */
export const SYSTEM_LINES={
 questDone:giver=>`Auftrag erfüllt. Kehre zu ${giver} zurück.`,
 gatherProgress:(n,max,item)=>`${n} / ${max} ${item} gesammelt.`,
 mainReady:'Das Maifeld ist sicher. Kehre zu Ida bei St. Gangolf zurück.',
 welcome:'Mertloch. Gleiche Bande, neuer Totalschaden. Poo-Tang ist wieder da.',
 respawn:'Du erwachst bei St. Gangolf. Dein Fortschritt bleibt erhalten.',
 levelUp:level=>'Stufe '+level+'! Neue Kniffe im Skillbuch, ein weiterer Talentpunkt.'
};
export function dialogue(npcId,state='greet'){const npc=MAIN_DIALOGUE[npcId];if(!npc)return null;return npc[state]||npc.greet||null;}
export const chapterDialogue=chapter=>MAIN_DIALOGUE.ida[STORY_CHAPTERS[chapter-1]?.dialogue]||null;
