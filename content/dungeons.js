// Dungeons (Planung: docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md). Reine Daten; Laufzeit in dungeon.js, Zeichnen in dungeon-art.js.
// Maße in Metern je Ebene (×8 = Welteinheiten). Jede Ebene liegt weit außerhalb der Dorfkarte (`origin`), damit die
// Welt draußen nie ins Bild ragt. Begehbar ist nur, was in einem Raum-Rechteck oder einer offenen Tür liegt.
// IDs sind Speicherschlüssel (E-04): Dungeon, Räume, Übergänge, Gegner und Bosse nie umbenennen.
// Zahlen sind Entwürfe für Balancing (Abschnitt 8 des Plans); Grafik läuft bis zur Lieferung über vorhandene Zeichnungen (`art`).

export const DUNGEON_SCALE=8;

export const DUNGEONS={
 'schloss-bigb':{
  name:'Schloss Big B',subtitle:'Doppelgarage mit Kellerabgang, Burgstraße',
  level:{enter:8,min:8,max:10},group:{size:5},
  // Eingang draußen: an der ersten gefundenen Straße, seitlich versetzt (Welt sucht eine freie Stelle).
  entrance:{streets:['Burgstraße','Am Bahnhof'],offset:46,range:60},
  resetAfter:1800,
  floors:{
   e0:{name:'Erdgeschoss · Burghof',origin:{x:32000,y:4000},size:[64,48],theme:'garage'},
   k1:{name:'Keller 1 · Rittergeschoss',origin:{x:36000,y:4000},size:[64,48],theme:'partykeller'},
   k2:{name:'Keller 2 · Basaltgewölbe',origin:{x:40000,y:4000},size:[64,48],theme:'basalt'}
  },
  start:{floor:'e0',x:31,y:36},exit:{floor:'e0',x:31,y:36.8},
  rooms:[
   // --- Erdgeschoss ---
   {id:'hof',floor:'e0',rects:[[16,20,30,18]],sign:'Schlosshof',truth:'Doppelgarage mit Pappzinnen',prospect:'Ehrenhof mit Brunnen',checkpoint:{x:31,y:34}},
   {id:'zugbruecke',floor:'e0',rects:[[2,20,13,18]],sign:'Zugbrücke',truth:'Kellertreppe mit Kette',prospect:'Zugbrücke über den Burggraben',arena:'gerd'},
   {id:'verwaltung',floor:'e0',rects:[[48,20,14,18]],sign:'Hofkanzlei',truth:'Büro im Anbau',prospect:'Kanzlei des Freiherrn'},
   {id:'wehrgang',floor:'e0',rects:[[16,6,30,10]],sign:'Wehrgang',truth:'Carport-Dach',prospect:'Nordturm',secret:true},
   // --- Keller 1 ---
   {id:'galerie',floor:'k1',rects:[[8,6,48,4],[8,34,48,4],[8,10,4,24],[52,10,4,24]],sign:'Ahnengalerie',truth:'Ringflur mit zwölf Big-B-Porträts',prospect:'Galerie der Ahnen',checkpoint:{x:12,y:8}},
   {id:'rittersaal',floor:'k1',rects:[[13,11,38,22]],sign:'Rittersaal',truth:'Partykeller mit Styropor-Stuck',prospect:'Rittersaal mit Kamin'},
   {id:'stall',floor:'k1',rects:[[22,0,12,5]],sign:'Stallungen',truth:'Heizungskeller mit Schaukelpferd',prospect:'Marstall'},
   {id:'verlies',floor:'k1',rects:[[0,16,7,12]],sign:'Burgverlies',truth:'Waschküche',prospect:'Rosengarten'},
   {id:'studio',floor:'k1',rects:[[57,12,7,14]],sign:'Presseamt',truth:'Content-Studio mit Greenscreen',prospect:'Spiegelsaal'},
   {id:'musterwohnung',floor:'k1',rects:[[21,39,22,9]],sign:'Musterwohnung · Besichtigung',truth:'Kellerabteil mit Laminat',prospect:'Gästeflügel',arena:'expose'},
   // --- Keller 2 ---
   {id:'weinkeller',floor:'k2',rects:[[4,4,29,14]],sign:'Weinkeller',truth:'echter Basaltkeller',prospect:'Weinkeller',checkpoint:{x:9,y:9}},
   {id:'gewoelbe',floor:'k2',rects:[[34,4,8,40],[4,19,8,25],[12,40,22,4]],sign:'Gewölbegänge',truth:'alte Basaltgänge',prospect:'Katakomben'},
   {id:'kelterhalle',floor:'k2',rects:[[14,20,18,16]],sign:'Kelterhalle',truth:'Gewölbe mit Fassrinnen',prospect:'Kelterhaus',arena:'korkenkurt'},
   {id:'thronsaal',floor:'k2',rects:[[46,4,16,32]],sign:'Thronsaal',truth:'echter Basaltdom, verkleidet mit Pappe',prospect:'Thronsaal',arena:'bigb'},
   {id:'schatz',floor:'k2',rects:[[48,38,12,8]],sign:'Schatzkammer',truth:'Abstellraum',prospect:'Schatzkammer'}
  ],
  // Türen verbinden Räume; `lock` hält sie zu: boss = offen, wenn der Boss liegt; seals = braucht die Siegel;
  // arena = zu, solange der Boss dieses Raums kämpft.
  doors:[
   {id:'hof-zugbruecke',floor:'e0',rect:[14.5,26,2,5],arena:'zugbruecke'},
   {id:'hof-verwaltung',floor:'e0',rect:[45.5,26,3,5]},
   {id:'galerie-saal-nord',floor:'k1',rect:[30,9.5,4,2]},
   {id:'galerie-saal-sued',floor:'k1',rect:[30,32.5,4,2]},
   {id:'galerie-saal-west',floor:'k1',rect:[11.5,20,2,4]},
   {id:'galerie-saal-ost',floor:'k1',rect:[50.5,20,2,4]},
   {id:'galerie-stall',floor:'k1',rect:[26,4.5,4,2]},
   {id:'galerie-verlies',floor:'k1',rect:[6.5,20,2,4]},
   {id:'galerie-studio',floor:'k1',rect:[55.5,17,2,4]},
   {id:'galerie-muster',floor:'k1',rect:[30,37.5,4,2],arena:'musterwohnung'},
   {id:'wein-gang-ost',floor:'k2',rect:[32.5,8,2,4]},
   {id:'wein-gang-west',floor:'k2',rect:[6,17.5,4,2]},
   {id:'gang-kelter-west',floor:'k2',rect:[11.5,26,3,4],arena:'kelterhalle'},
   {id:'gang-kelter-sued',floor:'k2',rect:[21,35.5,4,5],arena:'kelterhalle'},
   {id:'tresor',floor:'k2',rect:[41.5,20,5,8],lock:{seals:['siegel-gerd','siegel-expose','siegel-kurt']},arena:'thronsaal'},
   {id:'thron-schatz',floor:'k2',rect:[52,35.5,4,3],lock:{boss:'bigb'}}
  ],
  // Übergänge zwischen Ebenen (F an der Stelle). oneWay: nur in Pfeilrichtung. secret: erst nach Fund benutzbar.
  // gate.boss: von oben erst offen, wenn der Boss liegt (von unten immer). unlock: erste Benutzung von dieser Seite öffnet beide.
  transitions:[
   {id:'treppe-zugbruecke',kind:'stairs',a:{floor:'e0',x:5,y:23},b:{floor:'k1',x:10.5,y:8},gate:{boss:'gerd',side:'a'}},
   {id:'leiter',kind:'ladder',a:{floor:'e0',x:18.5,y:21.5},b:{floor:'e0',x:18.5,y:14.5}},
   {id:'lichtschacht',kind:'shaft',a:{floor:'e0',x:42,y:10},b:{floor:'k1',x:53.5,y:8},oneWay:'a'},
   {id:'treppe-k2',kind:'stairs',a:{floor:'k1',x:53.5,y:36},b:{floor:'k2',x:38,y:42}},
   {id:'wendeltreppe',kind:'spiral',a:{floor:'k1',x:10,y:36},b:{floor:'k2',x:8,y:42},secret:'pappwand'},
   {id:'aufzug',kind:'lift',a:{floor:'e0',x:44,y:35.5},b:{floor:'k2',x:6.5,y:6.5},unlock:'b'}
  ],
  // Entdeckbares: F an der Stelle deckt auf (Pappwand eindrücken usw.).
  secrets:[{id:'pappwand',floor:'k1',x:10,y:36,range:4}],
  // Durchsagen: gelogen, zeigen richtig gelesen auf etwas Wahres (Plan Abschnitt 4.4).
  announcements:[
   {id:'willkommen',room:'hof'},
   {id:'dach',floor:'e0',x:18.5,y:22,range:5},
   {id:'pappwand',floor:'k1',x:12,y:35,range:6},
   {id:'vermieter',room:'verlies'},
   {id:'sprinkler',room:'weinkeller'},
   {id:'tresor',floor:'k2',x:40,y:24,range:6}
  ],
  // Gegner: kind = DUNGEON_ENEMIES, Position in Metern. patrol = Wegpunkte (Meter), Runde wird abgelaufen.
  packs:[
   {room:'hof',at:[22,25],members:['securityazubi','securityazubi','pappwache']},
   {room:'hof',at:[40,25],members:['securityazubi','securityazubi','pappwache']},
   {room:'verwaltung',at:[53,24],members:['maklerpraktikant','securityazubi']},
   {room:'verwaltung',at:[56,33],members:['maklerpraktikant','securityazubi']},
   {room:'wehrgang',at:[25,10],members:['pappschuetze']},
   {room:'wehrgang',at:[32,9],members:['pappschuetze']},
   {room:'wehrgang',at:[39,11],members:['pappschuetze']},
   {room:'galerie',at:[20,8],members:['pappwache']},
   {room:'galerie',at:[44,36],members:['pappwache']},
   {room:'galerie',at:[30,36],members:['baumarktritter','baumarktritter','maklerpraktikant'],patrol:[[30,36],[54,36],[54,8],[10,8],[10,36]]},
   {room:'rittersaal',at:[20,16],members:['baumarktritter','maklerpraktikant']},
   {room:'rittersaal',at:[43,16],members:['baumarktritter','maklerpraktikant']},
   {room:'rittersaal',at:[31,27],members:['baumarktritter','baumarktritter','maklerpraktikant']},
   {room:'verlies',at:[3.5,22],members:['securityazubi','securityazubi','securityazubi']},
   {room:'weinkeller',at:[13,10],members:['kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte']},
   {room:'weinkeller',at:[25,12],members:['kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte']}
  ],
  // Bosse: gebaut wird, was in DUNGEON_BOSSES steht; die übrigen Plätze sind reserviert (Plan Abschnitt 7).
  bosses:[
   {id:'gerd',room:'zugbruecke',at:[8.5,31],seal:'siegel-gerd'},
   {id:'expose',room:'musterwohnung',at:[32,43],seal:'siegel-expose'},
   {id:'rita',room:'studio',at:[60,19],optional:true},
   {id:'halbespferd',room:'stall',at:[28,2.5],rare:.3},
   {id:'korkenkurt',room:'kelterhalle',at:[23,28],seal:'siegel-kurt'},
   {id:'bigb',room:'thronsaal',at:[54,12]}
  ]
 }
};

// Dungeon-Gegner (nicht in ARCHETYPES: die Präzisions-Prüfung verlangt dort fertige Bögen). `art` = vorhandene Zeichnung
// als Platzhalter, `family` = vorhandene Beutetabelle als Platzhalter, bis Grafik und Loot liefern (Plan Abschnitte 11 und 15).
export const DUNGEON_ENEMIES={
 securityazubi:{name:'Security-Azubi',type:'cultist',skin:'warden',art:'inspector',family:'inspector',level:8,hp:5500,speed:56,aggroRange:96,roamRadius:14,castSet:'d-azubi',auto:'warden',
  look:'Junger Mann in zu großem schwarzem Polo „SECURITY", Funkgerät aus dem Spielzeugladen, Kaugummi'},
 pappwache:{name:'Pappwache',type:'cultist',skin:'warden',art:'kegler',family:'warden',level:8,hp:1,speed:1,aggroRange:0,roamRadius:0,behavior:'neutral',cardboard:true,castSet:'d-azubi',auto:'warden',
  look:'Ritter in voller Rüstung. Aus Pappe. Mit Klebeband am Boden befestigt'},
 pappschuetze:{name:'Pappschütze',type:'cultist',skin:'warden',art:'scrounger',family:'scrounger',level:8,hp:4500,speed:48,aggroRange:140,roamRadius:8,castSet:'d-schuetze',auto:'scrounger',
  look:'Security-Azubi hinter einer Pappzinne, Wasserpistole in Neonfarben'},
 baumarktritter:{name:'Baumarkt-Ritter',type:'cultist',skin:'warden',art:'jga',family:'warden',level:9,hp:16000,elite:true,damage:1.2,speed:50,aggroRange:100,roamRadius:10,castSet:'d-ritter',auto:'oberpraktikant',
  look:'Rüstung aus Regenrinne und Lüftungsrohr, Helm aus einem Eimer, Schild aus einer Mülltonnendeckel'},
 maklerpraktikant:{name:'Makler-Praktikant',type:'cultist',skin:'warden',art:'inspector',family:'inspector',level:9,hp:6000,speed:54,aggroRange:100,roamRadius:10,castSet:'d-makler',auto:'inspector',
  look:'Anzug von der Konfirmation, Tablet, Visitenkarten in beiden Hosentaschen'},
 kellerratte:{name:'Pfandratte',type:'wolf',skin:'badger',family:'badger',level:9,hp:1200,speed:82,aggroRange:90,roamRadius:22,castSet:'d-ratte',auto:'badger',
  look:'Kellerratte mit Kronkorken im Maul, kommt nie allein'}
};

// Bosse des Dungeons. phases: at = Lebensanteil; castSet wechselt den Zyklus, summon ruft Adds (DUNGEON_ENEMIES).
export const DUNGEON_BOSSES={
 gerd:{name:'Gästeliste-Gerd',title:'Sicherheitschef · Big B Protection (Ein-Mann-Betrieb)',type:'boss',skin:'horst',art:'sigi',family:'sigi',
  level:8,hp:90000,speed:46,aggroRange:84,roamRadius:6,leash:220,castSet:'d-gerd',auto:'horst',
  look:'Breiter Mann im zu kleinen schwarzen Anzug, Klemmbrett, Kinder-Headset, Sonnenbrille im Keller',
  phases:[{at:.5,summon:{kind:'securityazubi',count:2}},{at:.25,summon:{kind:'securityazubi',count:2},castSet:'d-gerd2'},{at:.15}],
  fall:{rect:[2,20,5,6],to:{floor:'k1',x:12,y:9}}}
};

// Zaubermuster der Dungeon-Gegner. Neue Merkmale (Plan Abschnitt 9): cone {angle (Grad), range (Einheiten)},
// tankSafe (Anteil für Schutz-Specs und Parade), knockback (Einheiten), callHelp (Nachbargruppe kommt), healAllies,
// frontGuard (Schildwall: Treffer von vorn gedämpft). `hint` (Etappe 2): die Antwort in 2–3 Wörtern für Warnleiste und Journal –
// sie stand früher hinter „ · “ im Namen und wurde im Zielrahmen abgeschnitten. Symbol und Tooltip kommen aus den Merkmalen (describeCast).
export const DUNGEON_CASTS={
 'd-azubi':{cycle:['funk','schubser'],casts:{
  funk:{name:'Funkspruch',hint:'Unterbrechen',total:2.2,damage:120,interruptible:true,callHelp:{range:240}},
  schubser:{name:'Schubser',hint:'Ausweichen',total:1.3,damage:180,radius:30,ground:true}}},
 'd-schuetze':{cycle:['wasser','wasser','spritzer'],casts:{
  wasser:{name:'Wasserpistole',hint:'Ausweichen',total:1.4,damage:160,radius:28,ground:true},
  spritzer:{name:'Dauerspritzer',hint:'Unterbrechen',total:2.4,damage:240,interruptible:true}}},
 'd-ritter':{cycle:['hieb','schild','hieb'],casts:{
  hieb:{name:'Regenrinnen-Hieb',hint:'Nicht davor stehen',total:1.6,damage:420,cone:{angle:80,range:60},tankSafe:.35},
  schild:{name:'Schildwall',hint:'Von hinten treffen',total:1,damage:0,frontGuard:{duration:5,factor:.2}}}},
 'd-makler':{cycle:['provision','expose'],casts:{
  provision:{name:'Provision',hint:'Unterbrechen',total:2.4,damage:0,interruptible:true,healAllies:{share:.12,range:140}},
  expose:{name:'Exposé verteilen',hint:'Fläche verlassen',total:2,damage:220,radius:40,ground:true}}},
 'd-ratte':{cycle:['knabbern'],casts:{
  knabbern:{name:'Knabbern',total:.8,damage:60,radius:26}}},
 'd-gerd':{cycle:['liste','rausschmiss','dresscode','rausschmiss'],casts:{
  liste:{name:'Du stehst nicht auf der Liste',hint:'Unterbrechen',total:2.4,damage:420,interruptible:true},
  rausschmiss:{name:'Rausschmiss',hint:'Seitlich stehen',total:1.8,damage:650,cone:{angle:70,range:88},tankSafe:.25,knockback:64},
  dresscode:{name:'Dresscode-Kontrolle',hint:'Fläche verlassen',total:2.2,damage:380,radius:48,ground:true}}},
 'd-gerd2':{cycle:['rausschmiss','rausschmiss','liste','dresscode'],casts:{
  liste:{name:'Du stehst nicht auf der Liste',hint:'Unterbrechen',total:2.4,damage:420,interruptible:true},
  rausschmiss:{name:'Rausschmiss',hint:'Seitlich stehen',total:1.4,damage:650,cone:{angle:70,range:88},tankSafe:.25,knockback:64},
  dresscode:{name:'Dresscode-Kontrolle',hint:'Fläche verlassen',total:2.2,damage:380,radius:48,ground:true}}}
};

// Texte (Story nimmt ab oder ersetzt; Ton E-20: erst die Behauptung, dann der Nachsatz).
export const DUNGEON_TEXT={
 enter:'Schloss Big B betreten',leave:'Zurück auf die Burgstraße',entranceName:'Schloss Big B',entranceSign:'SCHLOSS BIG B · PRIVATBESITZ · EINTRITT 20 €',
 tooLow:level=>'Big B lässt erst ab Stufe '+level+' rein. Sagt er. Die Tür ist aus Pappe, aber trotzdem.',
 busy:'Nicht jetzt. Erst den Kampf zu Ende bringen.',
 welcome:'Schloss Big B. Die Garage riecht nach Laminat und Größenwahn.',
 outside:'Zurück auf der Burgstraße. Die Burg ist immer noch eine Garage.',
 lootGathered:n=>n+' liegengebliebene Beutebeutel eingesammelt.',
 step:{stairs:'Treppe',ladder:'Leiter',shaft:'Lichtschacht',spiral:'Wendeltreppe',lift:'Getränkeaufzug'},
 floorTo:{e0:'zum Burghof',k1:'ins Rittergeschoss',k2:'ins Basaltgewölbe'},up:'hoch',down:'runter',
 ladder:{a:'hoch aufs Carport-Dach',b:'runter in den Hof'},
 locked:{gate:'Die Kette hängt noch. Gerd hat den Schlüssel. Und das Klemmbrett.',oneWay:'Da kommt man nur runter. Rauf braucht man Flügel oder eine Leiter.',
  lift:'Der Getränkeaufzug ist abgeschlossen. „Nur für Lieferanten." Von unten gibt es einen Hebel.',secret:'Da ist nur eine Wand. Sieht jedenfalls so aus.',
  seals:n=>'Die Tresortür hat drei Siegelfelder. '+n+' von 3 sind belegt.',boss:'Zu. Erst Big B.'},
 unlocked:{lift:'Hebel umgelegt. Der Getränkeaufzug fährt jetzt in beide Richtungen.',pappwand:'Die Wand ist aus Pappe. Dahinter: eine Wendeltreppe. Natürlich.'},
 secretUse:{pappwand:'Pappwand eindrücken'},
 arenaClosed:'Die Tür fällt zu. Klemmbrett sagt: kein Durchgang.',arenaOpen:'Die Tür geht wieder auf.',
 wipe:room=>'Alle am Boden. Zurück zum Kontrollpunkt '+room+'. Der Trash bleibt liegen.',
 fell:'Rausgeschmissen. Du bist die Kellertreppe runtergeflogen und liegst im Rittergeschoss.',
 cardboard:['Das war Pappe.','Pappe. Mit Klebeband.','Die Rüstung war hohl. Ganz hohl.'],
 seal:{'siegel-gerd':'Siegel „Gästelisten-Stempel" erhalten.','siegel-expose':'Siegel „Notarsiegel (Kartoffeldruck)" erhalten.','siegel-kurt':'Siegel „Weinsiegel (Korken mit Kerzenwachs)" erhalten.'},
 announce:{
  willkommen:'Willkommen! Der Keller ist gesperrt. Einsturzgefahr.',
  dach:'Das Dach ist nur Deko. Betreten verboten.',
  pappwand:'Hier gibt es KEINEN Geheimgang.',
  vermieter:'Im Keller wohnt niemand. Schon gar nicht der Vermieter.',
  sprinkler:'Die Sprinkleranlage ist nur Deko.',
  tresor:'Die Tür ist offen.'},
 speaker:'Lautsprecher · Big B',
 bossLines:{
  gerd:{engage:'Name? … Steht nicht drauf. Niemand steht drauf. Die Liste ist leer. Das ist ja das Exklusive.',
   phases:{'0.5':'VERSTÄRKUNG! … Das ist mein Neffe. Und der Kumpel vom Neffen. Der ist eigentlich nur zum Fahren da.',
    '0.25':'Noch mehr Verstärkung! … Das ist der Neffe nochmal. Er hat sich umgezogen.',
    '0.15':'Gut. Ihr steht drauf. Ich hab euch draufgeschrieben. Auf meinen Arm. Mit Edding.'},
   defeat:'Der Stempel … nehmt ihn. Ich stempel sowieso nur Luft.'}},
 map:{title:'Big Bs Schlossplan',prospect:'laut Prospekt',visited:'erkundet',you:'du',seals:'Siegel',checkpoint:'Kontrollpunkt',floors:'Ebenen',
  hint:'Unerkundete Räume zeigt die Karte, wie Big B sie beschreibt. Wer hingeht, sieht die Wahrheit.'}
};
