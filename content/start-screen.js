// Anmeldebildschirm und Figurenwahl vor dem Spiel (start-screen.js). Texte hier, Ablauf im Modul.
export const START_UI={
 options:'Einstellungen',remember:'E-Mail merken',capsOn:'Feststelltaste ist an',showPassword:'Zeigen',hidePassword:'Verbergen',serverUp:'Server erreichbar',serverDown:'Server nicht erreichbar',
 loginTitle:'Willkommen in Mertloch',loginIntro:'Deine Bande. Dein Dorf. Dein nächstes Abenteuer.',
 guest:'Ohne Konto spielen',guestHint:'Der Spielstand bleibt dann nur in diesem Browser. Andere Spieler siehst du erst mit Konto.',
 noServerTitle:'Mertloch Chronicles',noServer:'Hier läuft das Spiel ohne Server: Dein Spielstand liegt in diesem Browser. Mit Konto und anderen Spielern im Dorf spielst du auf mertloch.esm-consultant.de.',
 serverLink:'Zum Online-Server',serverUrl:'https://mertloch.esm-consultant.de/',
 offline:'Der Server antwortet gerade nicht.',retry:'Erneut versuchen',
 checking:'Anmeldung wird geprüft …',
 rosterEyebrow:'Deine Spielweise',rosterTitle:'Wer bist du heute?',
 rosterText:level=>'Ein Held, ein Spielstand: Stufe '+level+', Rucksack, Aufträge und Talente gehören nur ihm.',
 signedIn:name=>'Angemeldet als '+name,guestLine:'Gast · Spielstand nur in diesem Browser',
 logout:'Abmelden',toLogin:'Zur Anmeldung',leaderboard:'Bestenliste',deleteAccount:'Konto löschen',
 lastPlayed:'Zuletzt gespielt',playstyle:'Spielweise:',enter:'Ins Dorf',
 awayNote:'Du stehst gerade nicht am Clan-Treff. Wechselst du die Figur, geht es für sie am Clan-Treff los.',
 combatNote:'Du steckst mitten im Kampf – die Figur lässt sich erst danach wechseln.',
 menuRoster:'Charakterauswahl',menuLogout:'Ausloggen',menuLogoutGuest:'Zum Anmeldebildschirm'
};
/** Klassenwahl in der Heldenerstellung (E-17/E-38/E-72). Klasse = Klamotte vom Kleiderhaufen hinter der Bude; jede Karte
 *  trägt Klassennamen, Rolle und die eigene Ressource als Symbol. `from`/`spend` sind die Kurzfassung im Tooltip und unter
 *  der Figur: woraus die Ressource entsteht, wofür sie draufgeht. Reihenfolge der Karten = characters.js CLASSES. */
export const CLASS_CHOICE={
 from:'Entsteht',spend:'Geht drauf',clothes:'vom Kleiderhaufen',
 classes:{
  dieter:{title:'Tresenbrecher',role:'Nahkampf · Tank, Schaden',clothes:'Dieters Kutte',resource:'Randale & Zeche',
   from:'Treffer – eingesteckt wie ausgeteilt',spend:'Kniffe – jede Randale bezahlt die Zeche'},
  baerbel:{title:'Landhaus-Lady',role:'Fernkampf · Heilung, Schaden',clothes:'Annis Schürze',resource:'Likes & Trend',
   from:'jeder neue Kniff – nie zweimal dasselbe',spend:'Kniffe – Wiederholung kostet Trend'},
  kevin:{title:'Pfandingenieur',role:'Fernkampf · Schaden, Tank',clothes:'Kevins Werkzeuggürtel',resource:'Leergut',
   from:'Kasten, Flaschen vom Boden, Pfandautomat',spend:'eine Flasche je Wurf, drei je Rakete'},
  schorsch:{title:'Grillmeister',role:'Nahkampf · Heilung, Schaden, Tank',clothes:'Schorschs Grillschürze',resource:'Glut & Grillrost',
   from:'Zange, Grilldeckel und Blasebalg heizen',spend:'Glutbrocken, Ablöschen – Grillgut gar servieren'},
  kaethe:{title:'Stammtisch-Zockerin',role:'Fernkampf · Schaden, Heilung, Kontrolle',clothes:'Käthes Strickjacke',resource:'Blatt & Augen',
   from:'jede ausgespielte Karte zählt Augen',spend:'Abrechnen ab 61 Augen – Farbe = Wirkung'}
 }
};
