// Ladeschirm beim Spielstart (loading-screen.js): Szenen aus der Bildpipeline, Schrittnamen, Ladetipps.
// Reine Daten. Die Schritte zählen als Strichliste auf dem Bierdeckel – fünf Schritte, ein Fünferbündel.

export const LOADING_UI={
 kicker:'Poo-Tang-Clan',
 title:'Mertloch',
 titleStrong:'Chronicles',
 ready:'Prost – es geht los.',
 tipLabel:'Tipp',
 /** Reihenfolge = Reihenfolge im Spielstart. `label` erscheint über dem Balken, `count` hängt den Zähler an. */
 phases:[
  {id:'module',label:'Die Spielregeln werden auf Bierdeckel geschrieben'},
  {id:'karte',label:'Das Maifeld wird vermessen'},
  {id:'welt',label:'Mertloch wird aufgebaut'},
  {id:'grafik',label:'Grafiken werden gezapft',count:true},
  {id:'start',label:'Der Clan wird geweckt'}
 ],
 /** Hintergründe (Bildpipeline, tools/sprite-pipeline/ladeschirm-20260923-jobs.json). `first` = Motiv beim allerersten Start. */
 scenes:[
  {id:'lade-bude-morgen',caption:'Die Bude, am Morgen danach',first:true},
  {id:'lade-maifeld-abend',caption:'Das Maifeld zur goldenen Stunde'},
  {id:'lade-dorfplatz-nacht',caption:'Dorfplatz Mertloch, 22:01 Uhr'},
  {id:'lade-sperrmuell',caption:'Sperrmüll-Sigis Reich'},
  {id:'lade-jga-bus',caption:'Irgendwo zwischen Koblenz und Mertloch'}
 ],
 tips:[
  'Mit Tab wählst du das nächste Ziel, mit 1 bis 4 teilst du aus.',
  'F spricht Leute an und sammelt auf. Mit Umschalt+F greifst du gleich die ganze Beute ab.',
  'Leertaste ist dein Ausweichsprung. Q unterbricht, was der Gegner gerade zaubert.',
  'C zeigt deine Figur, N die Talente, P oder K alle Kniffe.',
  'I öffnet den Rucksack, J das Auftragsjournal, M die Weltkarte.',
  'B führt dich in die Bude: Dort baust du wieder auf, was die Party kaputt gemacht hat.',
  'Halte Umschalt über einem Tooltip gedrückt, dann erklärt das Spiel jeden Fachbegriff.',
  'V öffnet die Kampfstatistik. Da siehst du, wer wirklich ausgeteilt hat.',
  'U ruft deine Begleiter. Allein saufen ist traurig, allein kämpfen auch.',
  'Umschalt+B öffnet die Berufe. Handwerk hat goldenen Boden.',
  'Ruhe ist in Mertloch ab 22:01 Uhr. Nicht ab 22:00. Das ist wichtig.',
  'Wer nichts mehr weiß, fragt im Dorf. Irgendwer hat immer etwas gesehen.',
  'Pfand ist Währung, Ehre und Munition zugleich.',
  // E-72: je Klasse ein Satz zur eigenen Ressource
  'Dosen-Dieter will getroffen werden: Randale kommt aus Treffern, und jede ausgegebene Randale bezahlt die Zeche.',
  'Aperol-Anni lebt von Abwechslung. Zweimal derselbe Kniff, und der Trend kippt.',
  'Klo-Kevin wirft mit Leergut. Heile Flaschen bleiben liegen – drüberlaufen, einsammeln, weiterwerfen.',
  'Schwenker-Schorsch hält die Glut im goldenen Bereich. Zu kalt gart nix, zu heiß kommt die Stichflamme.',
  'Kreuz-Käthe: Kreuz trifft, Pik schützt, Herz heilt, Karo bremst. Ab 61 Augen wird abgerechnet.',
  'Ein Strich auf dem Bierdeckel heißt: bezahlt wird später. Das gilt auch für Schulden beim Clan.'
 ],
 fail:{title:'Die Welt konnte nicht starten.',text:'Prüfe deine Internetverbindung und lade die Seite neu.',retry:'Erneut versuchen'}
};
