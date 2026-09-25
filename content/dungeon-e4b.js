// Dungeon „Schloss Big B“ · Etappe 4, Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71; docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Reine Daten und Wörter: Kampf-Klarheit, Flügelstand und Abkürzungen, Beweise, Ereignisse, Händler Vermieter Volker, Erfolge und Titel.
// Ausgewertet in dungeon.js (Block „Etappe 4 Teil B“), gezeichnet in dungeon-e4b-art.js, dungeon-vendor-ui.js, dungeon-ui.js, boss-alerts.js.
// Eigene Datei, damit content/dungeons.js (Grundriss, Zahlen, Bosse) und content/dungeon-ui.js (Etappe 2/3) übersichtlich bleiben.
// Ton E-20: erst die Behauptung, dann der Nachsatz. Story nimmt die Texte ab. Kein Fließtext in Fenstern: Sätze stehen in Tooltips.

export const DUNGEON_E4B={
 // ── Kampf-Klarheit (boss-alerts.js): Rückmeldung auf der Warnleiste, sobald ein Zauber unterbrochen ist
 alerts:{interrupted:'Unterbrochen!',again:(n,m)=>'Unterbrochen '+n+'/'+m+' · nochmal!'},
 // ── Kampf-Klarheit (dungeon.js quietFloat): Welt-Worte, die im Bosskampf nicht entstehen, weil Bossrahmen und Warnleiste sie zeigen.
 // heroFloats bleiben am Helden (eigene Schwäche), nur auf Söldnern entfallen sie.
 clarity:{hudFloats:['GESTÄNDNIS','DIE GANZE WAHRHEIT','REICHWEITE','UNTERBROCHEN','SELBST RAUSGEZOGEN','ZERTIFIKAT','HAUSVERBOT',
  /* Etappe 4 Teil A: Provision, Unsichtbar, Säuft und Nass stehen als Chip im Bossrahmen */'UNTERSCHRIEBEN','GREENSCREEN','SÄUFT','NASS','GEBLENDET'],heroFloats:['ZERTIFIKAT','HAUSVERBOT','NASS','GEBLENDET']},
 // ── Verfolgung im Dungeon: je Zeile Name und Bedeutung im Tooltip, je Symbol der einzelne Stand
 tracker:{
  wings:'Flügel heute',wingsNote:'Jeder Flügel endet mit einem Siegelträger. Sein Siegel öffnet die Tresortür, seine Abkürzung führt zum Hof. Beides bleibt bis zum Tagesreset um 4 Uhr.',
  wingDone:'heute erledigt · Siegel im Besitz',wingOpen:'offen',wingMissing:'Siegelträger folgt noch',
  wingTip:(name,boss)=>boss?name+' · '+boss:name,
  proofs:'Beweise gegen Big B',proofsNote:'Beim Erkunden finden, im Thronsaal vorlegen. Jeder vorgelegte Beweis schwächt Big B.',
  proofFound:'gefunden · im Thronsaal vorlegen',proofShown:'vorgelegt',proofMissing:'noch nicht gefunden'
 },
 // ── Abkürzungen zum Hof (je Siegelträger): Kurzmeldung beim Öffnen, Hinweis an der verschlossenen Seite
 shortcuts:{
  opened:{'treppe-zugbruecke':'Abkürzung offen: Die Kette ist ab. Die Kellertreppe bleibt bis morgen offen.',
   aufzug:'Abkürzung offen: Der Getränkeaufzug fährt in beide Richtungen. Bis morgen früh.',
   'pappwand-hof':'Abkürzung offen: Hinter der Musterwohnung war nur Pappe. Die Treppe führt in den Hof, bis morgen.',
   any:'Abkürzung zum Hof offen, bis morgen.'},
  locked:{'pappwand-hof':'Eine Wand. Aus Pappe. Frau Dr. Exposé hat sie mit Tesa verstärkt.',
   aufzug:'Der Hebel klemmt. „Nur für Lieferanten.“ Kellermeister Kurt hat den Schlüssel.'}
 },
 // ── Kleine Truhe je Flügel
 wingChest:{name:'Kleine Truhe öffnen',title:w=>'Truhe · '+w,empty:'Die kleine Truhe ist leer. Der Deckel war das Wertvollste.'},
 // ── Beweise (Plan 4.5): Name, Fund (Kurzmeldung), Tooltip-Hinweis solange er fehlt (die gelogene Durchsage, richtig gelesen)
 evidence:{
  mietvertrag:{name:'Mietvertrag',found:'Beweis gefunden: Mietvertrag. Mieter: Big B. Vermieter: nicht Big B.',hint:'„Im Keller wohnt niemand. Schon gar nicht der Vermieter.“'},
  leihschein:{name:'Leihschein vom Kostümverleih',found:'Beweis gefunden: Leihschein. Pelzmantel, eine Woche, Kaution 20 €. Unbezahlt.',hint:'„Das Dach ist nur Deko. Betreten verboten.“',use:'Pelzmantel durchsuchen'},
  kirmesurkunde:{name:'Kirmes-Urkunde „Freiherr (Schießbude)“',found:'Beweis gefunden: Kirmes-Urkunde. Freiherr, dritter Platz, Luftgewehr.',hint:'Liegt im Presseamt. Die Pressefrau passt darauf auf.',use:'Urkunde einstecken',guarded:'Reichweiten-Rita sitzt drauf. Erst Rita.'},
  present:n=>'Beweise vorlegen ('+n+')',presented:n=>n===1?'Ein Beweis liegt auf dem Thron. Big B schwitzt.':n+' Beweise liegen auf dem Thron. Big B schwitzt.'
 },
 // ── Ereignisse unterwegs (Plan 4.4)
 events:{
  volker:{use:'Fahrradschloss knacken',guarded:'Drei Wachen stehen noch davor.',
   lines:['Seit Dienstag sitz ich hier. Er hat mir einen Tetrapak durchgeschoben. Jahrgang Dienstag.','Hier. Der Mietvertrag. Und der Aufzugschlüssel. Ich bin oben im Hof, falls ihr Siegelmarken habt.'],
   freed:'Vermieter Volker ist frei. Aufzugschlüssel und Mietvertrag bekommen.'},
  beamer:{use:'Beamer ausstecken',done:'Stecker gezogen. Das Gespenst war ein Film. Mit Untertiteln.',ghostGone:'NUR EIN FILM',immune:'PROJEKTION'}
 },
 // ── Händler Vermieter Volker (dungeon-vendor-ui.js). look = vorhandene Katalogfigur als Platzhalter (Figuren erst nach Freigabe).
 vendor:{name:'Vermieter Volker',look:'konrad',open:'Vermieter Volker · tauschen',marks:'Siegelmarken',
  marksNote:'Währung des Schlosses: 2 je Boss, 2 mehr beim ersten Abschluss eines Flügels am Tag, 1 aus jeder kleinen Truhe, 3 aus der Endtruhe.',
  hello:'Vermieter Volker. Nimmt Siegelmarken statt Miete. Big B hat ihm auch keine Miete gezahlt.',
  stock:'Ware',emptyNote:'Noch nichts zu tauschen.',buyNote:n=>'Tauschen gegen '+n+' Siegelmarken.',poorNote:n=>'Es fehlen noch '+n+' Siegelmarken.',
  ownedNote:'Hast du schon. Dorflegenden gibt es nur einmal.',lockedNote:'Kommt später ins Sortiment.',
  bought:(item,n)=>'Getauscht: '+item+' gegen '+n+' Siegelmarken.',poor:'Das reicht nicht. Volker nimmt keine Anzahlung.',full:'Kein Platz im Rucksack.',owned:'Die hast du schon.'},
 // Preise in Siegelmarken je Quelle (Wunschteil nach etwa 4–6 Läufen sicher; Bericht rechnet es vor). Hafersack für das halbe Pferd (Teil A).
 prices:{gerd:24,expose:24,korkenkurt:24,rita:20,halbespferd:24,bigb:32,hafersack:3},
 // ── Erfolge und Titel: Figur-Fenster (Symbol am Namen) und Eingangskarte (Zähler mit Tooltip)
 feats:{title:'Erfolge · Schloss Big B',count:(n,m)=>n+'/'+m,have:'erreicht',missing:'offen',unlocked:n=>'Erfolg: '+n,titleGot:n=>'Neuer Titel: '+n},
 bestNote:t=>'Schnellster Abschluss: '+t+' vom ersten Schritt bis Big B.'
};
// Titel aus Erfolgen (E-71, Plan 11). Stehen als Symbol am Namen im Figur-Fenster, der Name im Tooltip.
export const DUNGEON_TITLES={
 mieterschuetzer:{name:'Mieterschützer',feat:'beweislast',note:'Titel aus Schloss Big B: Big B mit allen drei Beweisen besiegt. Er wohnt zur Miete. Jetzt weiß es jeder.'}
};
