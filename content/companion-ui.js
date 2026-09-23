// Beschriftungen der Söldner-Oberfläche; Vertragswerte kommen aus COMPANION_RULES.
export const COMPANION_UI={
 offers:'Anheuern',team:'Deine Truppe',all:'Alle Söldner',orders:'Befehle',stances:'Haltung',scope:'Befehl gilt für',
 intro:'Stell dir deine Truppe zusammen. Schutz hält Gegner fern, Heilung hält euch am Leben, Schaden räumt auf.',
 terms:h=>h+' Stunden Spielzeit pro Vertrag · pausiert offline · volle EP und eigene Beute',
 empty:'Noch niemand an deiner Seite. Am Schwarzen Brett findest du Verstärkung.',
 slots:(used,max)=>used+' / '+max+' Gruppenplätze belegt',coins:n=>n+' Pfandmarken',level:n=>'Stufe '+n,
 hired:'In deiner Truppe',contract:'Vertrag',permanent:'Dauerhaft',down:'Am Boden',combat:'Im Kampf',
 recovery:n=>'Steht in '+n+' s wieder auf',remaining:t=>'Noch '+t,needTarget:'Wähle zuerst einen lebenden Gegner.',
 dead:'Erst wieder auf die Beine kommen.',dismissHint:'Beendet den Vertrag ohne Rückerstattung.',
 orderHints:{follow:'Kommt mit dir und folgt deiner Bewegung.',stay:'Bleibt an der aktuellen Position.',attack:'Greift deinen ausgewählten Gegner an. Eine passive Haltung bleibt passiv.'},
 stanceHints:{assist:'Unterstützt die Gruppe im Kampf.',defend:'Verteidigt die Gruppe; Schutz-Söldner binden freie Gegner.',passive:'Greift nicht an. Ein Angriffsbefehl ändert diese Haltung nicht.'},
 open:'Söldner verwalten',shortcut:'Söldner [U]',
 select:'Als Hilfsziel auswählen · Heilung und Schutz wirken auch auf diesen Söldner',selected:'Hilfsziel',self:'Selbst',selfHint:'Hilfsziel aufheben',
 aidHint:'Söldner oder Gruppenrahmen anklicken, dann deine Heilung benutzen. Das Hilfsziel bleibt beim Gegnerwechsel bestehen. Nochmals auf den Gruppenrahmen klicken oder „Selbst“ wählen hebt es auf.',
};
