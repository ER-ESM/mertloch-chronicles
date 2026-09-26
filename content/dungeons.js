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
  // Etappe 1 (E-71): Grundgerüst für Flügel und Tagesreset. Der Laufstand (Trash, Bosse, Kontrollpunkt) überlebt das Neuladen und
  // verfällt resetAfter Sekunden nach dem Verlassen. Siegel, Abkürzungen und der Tagesbonus hängen am Tag, der um resetHour Uhr
  // (Ortszeit) wechselt – Etappe 4 („Voller Durchgang") baut die Flügel darauf auf.
  resetAt:'daily',resetHour:4,
  // Schwierigkeit (E-71): jetzt nur Normal. Jede Stufe setzt Faktoren auf Leben und Schaden aller Gegner des Durchgangs;
  // Heldenmodus und „Lüge der Woche" (Etappe 5) kommen als weitere Einträge dazu.
  difficulty:{normal:{name:'Normal',hp:1,damage:1}},
  // Flügel (E-71): je ein Siegelträger, 10–15 Minuten mit Söldnern. Der erste Abschluss eines Flügels am Tag gibt den Tagesbonus.
  // Etappe 4 Teil B: chest = kleine Truhe im Raum des Siegelträgers, öffnet sich nach seinem Sieg einmal je Durchgang (DUNGEON_REWARDS.wingChest).
  wings:[
   {id:'burghof',name:'Burghof',boss:'gerd',rooms:['hof','zugbruecke','verwaltung','wehrgang'],chest:{floor:'e0',x:8.5,y:36.5}},
   {id:'rittergeschoss',name:'Rittergeschoss',boss:'expose',rooms:['galerie','rittersaal','stall','verlies','studio','musterwohnung'],chest:{floor:'k1',x:36.5,y:46.5}},
   {id:'basaltgewoelbe',name:'Basaltgewölbe',boss:'korkenkurt',rooms:['weinkeller','gewoelbe','kelterhalle'],chest:{floor:'k2',x:27,y:33}}
  ],
  floors:{
   e0:{name:'Erdgeschoss · Burghof',origin:{x:32000,y:4000},size:[64,48],theme:'garage'},
   k1:{name:'Keller 1 · Rittergeschoss',origin:{x:36000,y:4000},size:[64,48],theme:'partykeller'},
   k2:{name:'Keller 2 · Basaltgewölbe',origin:{x:40000,y:4000},size:[64,48],theme:'basalt'}
  },
  start:{floor:'e0',x:31,y:36},exit:{floor:'e0',x:31,y:36.8},
  rooms:[
   // --- Erdgeschoss ---
   {id:'hof',floor:'e0',rects:[[16,20,30,18]],sign:'Schlosshof',truth:'Doppelgarage mit Pappzinnen',prospect:'Ehrenhof mit Brunnen',checkpoint:{x:31,y:37}},
   {id:'zugbruecke',floor:'e0',rects:[[2,20,13,18]],sign:'Zugbrücke',truth:'Kellertreppe mit Kette',prospect:'Zugbrücke über den Burggraben',arena:'gerd'},
   {id:'verwaltung',floor:'e0',rects:[[48,20,14,18]],sign:'Hofkanzlei',truth:'Büro im Anbau',prospect:'Kanzlei des Freiherrn'},
   {id:'wehrgang',floor:'e0',rects:[[16,6,30,10]],sign:'Wehrgang',truth:'Carport-Dach',prospect:'Nordturm',secret:true},
   // --- Keller 1 ---
   {id:'galerie',floor:'k1',rects:[[8,6,48,4],[8,34,48,4],[8,10,4,24],[52,10,4,24]],sign:'Ahnengalerie',truth:'Ringflur mit zwölf Big-B-Porträts',prospect:'Galerie der Ahnen',checkpoint:{x:12,y:8}},
   {id:'rittersaal',floor:'k1',rects:[[13,11,38,22]],sign:'Rittersaal',truth:'Partykeller mit Styropor-Stuck',prospect:'Rittersaal mit Kamin'},
   {id:'stall',floor:'k1',rects:[[22,0,12,5]],sign:'Stallungen',truth:'Heizungskeller mit Schaukelpferd',prospect:'Marstall',arena:'halbespferd'},
   {id:'verlies',floor:'k1',rects:[[0,16,7,12]],sign:'Burgverlies',truth:'Waschküche',prospect:'Rosengarten'},
   {id:'studio',floor:'k1',rects:[[57,12,7,14]],sign:'Presseamt',truth:'Content-Studio mit Greenscreen',prospect:'Spiegelsaal',arena:'rita'},
   {id:'musterwohnung',floor:'k1',rects:[[21,39,22,9]],sign:'Musterwohnung · Besichtigung',truth:'Kellerabteil mit Laminat',prospect:'Gästeflügel',arena:'expose'},
   // --- Keller 2 ---
   {id:'weinkeller',floor:'k2',rects:[[4,4,29,14]],sign:'Weinkeller',truth:'echter Basaltkeller',prospect:'Weinkeller',checkpoint:{x:10.5,y:20.5}},
   {id:'gewoelbe',floor:'k2',rects:[[34,4,8,40],[4,19,8,25],[12,40,22,4]],sign:'Gewölbegänge',truth:'alte Basaltgänge',prospect:'Katakomben'},
   {id:'kelterhalle',floor:'k2',rects:[[14,20,18,16]],sign:'Kelterhalle',truth:'Gewölbe mit Fassrinnen',prospect:'Kelterhaus',arena:'korkenkurt'},
   {id:'thronsaal',floor:'k2',rects:[[46,4,16,32]],sign:'Thronsaal',truth:'echter Basaltdom, verkleidet mit Pappe',prospect:'Thronsaal',arena:'bigb'},
   {id:'schatz',floor:'k2',rects:[[48,38,12,8]],sign:'Schatzkammer',truth:'Abstellraum',prospect:'Schatzkammer'}
  ],
  // Etappe 3 (E-71): Ende des Dungeons. Die Endtruhe öffnet sich nach Big B einmal je Durchgang (Wahl aus drei seltenen Teilen plus
  // Siegelmarken, DUNGEON_REWARDS.chest); der Hinterausgang in der Schatzkammer führt zurück auf die Burgstraße.
  // Dungeon-Fix 3 (Big-B-Abnahme #721: aus der Arena waren Truhe und Ausgang nicht zu sehen): Die Truhe erscheint nach Big Bs Tod mitten
  // im Thronsaal (appear), von überall im Saal zu sehen; der Hinterausgang trägt ein grünes Notausgang-Schild, ein zweites hängt über
  // der Tür zur Schatzkammer (sign, Welt-Einheiten wie x/y).
  chest:{floor:'k2',x:54,y:20,range:4,boss:'bigb',appear:true},
  backExit:{floor:'k2',x:58,y:44,range:3.5,sign:{x:54,y:35}},
  // Türen verbinden Räume; `lock` hält sie zu: boss = offen, wenn der Boss liegt; seals = braucht die Siegel;
  // arena = zu, solange der Boss dieses Raums kämpft.
  doors:[
   {id:'hof-zugbruecke',floor:'e0',rect:[14.5,26,2,5],arena:'zugbruecke'},
   {id:'hof-verwaltung',floor:'e0',rect:[45.5,26,3,5]},
   {id:'galerie-saal-nord',floor:'k1',rect:[30,9.5,4,2]},
   {id:'galerie-saal-sued',floor:'k1',rect:[30,32.5,4,2]},
   {id:'galerie-saal-west',floor:'k1',rect:[11.5,20,2,4]},
   {id:'galerie-saal-ost',floor:'k1',rect:[50.5,20,2,4]},
   // Etappe 4 Teil A: Stallungen und Presseamt sind Arenen (halbes Pferd, Reichweiten-Rita) – Tür zu, solange ihr Boss kämpft.
   {id:'galerie-stall',floor:'k1',rect:[26,4.5,4,2],arena:'stall'},
   {id:'galerie-verlies',floor:'k1',rect:[6.5,20,2,4]},
   {id:'galerie-studio',floor:'k1',rect:[55.5,17,2,4],arena:'studio'},
   {id:'galerie-muster',floor:'k1',rect:[30,37.5,4,2],arena:'musterwohnung'},
   {id:'wein-gang-ost',floor:'k2',rect:[32.5,8,2,4]},
   {id:'wein-gang-west',floor:'k2',rect:[6,17.5,4,2]},
   {id:'gang-kelter-west',floor:'k2',rect:[11.5,26,3,4],arena:'kelterhalle'},
   {id:'gang-kelter-sued',floor:'k2',rect:[21,35.5,4,5],arena:'kelterhalle'},
   // Tresortür (Plan 4.3): drei Siegel. Etappe 3 (E-71): verlangt nur die Siegel gebauter Bosse (dungeon.js requiredSeals –
   // lock.seals gegen DUNGEON_BOSSES gefiltert). Seit Etappe 4 Teil A sind Exposé und Kurt gebaut: die Tür verlangt alle drei.
   {id:'tresor',floor:'k2',rect:[41.5,20,5,8],lock:{seals:['siegel-gerd','siegel-expose','siegel-kurt']},arena:'thronsaal'},
   {id:'thron-schatz',floor:'k2',rect:[52,35.5,4,3],lock:{boss:'bigb'}}
  ],
  // Übergänge zwischen Ebenen (F an der Stelle). oneWay: nur in Pfeilrichtung. secret: erst nach Fund benutzbar.
  // gate.boss: von oben erst offen, wenn der Boss liegt (von unten immer). unlock: erste Benutzung von dieser Seite öffnet beide.
  // Etappe 4 Teil B: shortcut.boss = Abkürzung zum Hof, die der Siegelträger nach seinem Sieg öffnet (beide Richtungen, bis zum Tagesreset);
  // only = reine Abkürzung, vorher zu. Sperren und Abkürzungen nicht gebauter Bosse greifen nicht (dungeon.js gateShut/shortcutState).
  // label = eigenes Wort im Hinweis (DUNGEON_TEXT.step).
  transitions:[
   {id:'treppe-zugbruecke',kind:'stairs',a:{floor:'e0',x:5,y:23},b:{floor:'k1',x:10.5,y:8},gate:{boss:'gerd',side:'a'},shortcut:{boss:'gerd'}},
   {id:'leiter',kind:'ladder',a:{floor:'e0',x:18.5,y:21.5},b:{floor:'e0',x:18.5,y:14.5}},
   {id:'lichtschacht',kind:'shaft',a:{floor:'e0',x:42,y:10},b:{floor:'k1',x:53.5,y:8},oneWay:'a'},
   {id:'treppe-k2',kind:'stairs',a:{floor:'k1',x:53.5,y:36},b:{floor:'k2',x:38,y:42}},
   {id:'wendeltreppe',kind:'spiral',a:{floor:'k1',x:10,y:36},b:{floor:'k2',x:8,y:42},secret:'pappwand'},
   {id:'aufzug',kind:'lift',a:{floor:'e0',x:44,y:35.5},b:{floor:'k2',x:6.5,y:6.5},unlock:'b',shortcut:{boss:'korkenkurt'}},
   {id:'pappwand-hof',kind:'stairs',label:'pappwand',a:{floor:'e0',x:20,y:36.5},b:{floor:'k1',x:28,y:46.8},gate:{boss:'expose',side:'a'},shortcut:{boss:'expose',only:true}}
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
  // Gegner in festen Gruppen (Packs, E-71): id = Speicherschlüssel (geräumte Packs bleiben im Laufstand liegen), kind = DUNGEON_ENEMIES,
  // Position in Metern. Soziale Aggro gilt nur innerhalb des Packs (dungeon.js dungeonPackAggro) – keine Kette über den Raum.
  // patrol = Wegpunkte (Meter), Runde wird abgelaufen.
  // Hotfix 2026-09-25: Kein Kontrollpunkt liegt in Aggro-Reichweite (aggroRange + roamRadius, bei Streifen der ganze Weg) eines Kämpfers
  // mit Sichtlinie (tests/dungeon-hotfix.test.mjs). Dafür: Hof-Kontrollpunkt am Rolltor, Hof-Packs 1 m nach außen, Weinkeller-Kontrollpunkt im
  // Gang vor der Westtür (außer Sicht der Ratten, frei von den Laufwegen der Requisiten, dungeon-scenery.js auditScenery), die Galerie-Streife läuft nur noch die Ost- und Südseite (vorher lief sie über den Kontrollpunkt an der Treppe).
  // Feinschliff 2026-09-26 (Gerd zog „Hof West“ mit): Arena und Trash getrennt – kein Kämpfer steht oder läuft Streife in einer Arena oder
  // Arenatür (mind. 0,5 m Abstand) und keiner streift hinein (dungeon.js noRoam); Prüfung in tests/dungeon-feinschliff.test.mjs, dazu die Regeln in
  // dungeon.js (heroInArena, trashFighting, sealArena). „Hof West“ steht dafür 1,4 m weiter von der Zugbrücke (21,24 → 22,23), der Rattenschwarm
  // „Gewölbe West“ einen halben Meter tiefer im Gang (42 → 42,5), damit keine Ratte in der Kelterhallentür wohnt.
  packs:[
   // Etappe 4 Teil B (E-71, Flügel à 10–15 min): Packs dichter besetzt und ergänzt – nur Anzahl und Verteilung, Werte je Gegner unverändert.
   // Gemessen mit node scripts/dungeon-sim.mjs --only=wings (Bericht docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
   {id:'hof-west',room:'hof',at:[22,23],members:['securityazubi','securityazubi','baumarktritter','pappwache']},
   {id:'hof-ost',room:'hof',at:[41,24],members:['securityazubi','securityazubi','baumarktritter','pappwache']},
   // Feinschliff 2026-09-26: Ohne den Messfehler der Simulation (keine Wege von Punkten dicht an der Wand, dafür je 60 s) waren die Flügel 2–3 min
   // zu kurz. Neu nur Gruppen ohne Funkspruch (kein Azubi, der Nachbarn ruft) und nie zwei Makler zusammen: „Hof Nordost“, „Kanzlei Ost“, „Wehrgang Nord“,
   // „Galerie West“, „Weinkeller-Wache“, „Weinkeller-Fass“, „Gewölbe Nord“; ein Ritter mehr in Hof West/Ost und Kanzlei Nord, ein Pappschütze mehr im
   // Archiv und im Rittersaal, Makler und Pappschütze im Gewölbe Ost, die Weinkeller-Schwärme 8 → 10 Ratten.
   {id:'hof-nordost',room:'hof',at:[44.5,20.5],members:['baumarktritter','maklerpraktikant']},
   {id:'kanzlei-nord',room:'verwaltung',at:[53,24],members:['maklerpraktikant','securityazubi','securityazubi','baumarktritter']},
   {id:'kanzlei-sued',room:'verwaltung',at:[56,33],members:['maklerpraktikant','securityazubi','securityazubi']},
   {id:'kanzlei-ost',room:'verwaltung',at:[60.5,27],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'kanzlei-archiv',room:'verwaltung',at:[50,36.5],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'wehrgang-nord',room:'wehrgang',at:[25,6.5],members:['baumarktritter','maklerpraktikant']},
   {id:'wehrgang-west',room:'wehrgang',at:[20,10],members:['pappschuetze','pappschuetze','securityazubi']},
   {id:'wehrgang-mitte',room:'wehrgang',at:[31,9],members:['pappschuetze','pappschuetze','securityazubi']},
   {id:'wehrgang-ost',room:'wehrgang',at:[40,13],members:['pappschuetze','pappschuetze','securityazubi']},
   {id:'galerie-nord',room:'galerie',at:[20,8],members:['pappwache']},
   {id:'galerie-sued',room:'galerie',at:[44,36],members:['pappwache']},
   {id:'galerie-streife',room:'galerie',at:[30,36],members:['baumarktritter','baumarktritter','maklerpraktikant'],patrol:[[30,36],[54,36],[54,8],[34,8],[54,8],[54,36]]},
   {id:'galerie-west',room:'galerie',at:[16,34],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'rittersaal-west',room:'rittersaal',at:[20,16],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'rittersaal-ost',room:'rittersaal',at:[43,16],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'rittersaal-sued',room:'rittersaal',at:[31,27],members:['baumarktritter','baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'verlies',room:'verlies',at:[3.5,22],members:['securityazubi','securityazubi','securityazubi']},
   {id:'weinkeller-west',room:'weinkeller',at:[13,10],members:['kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte']},
   {id:'weinkeller-ost',room:'weinkeller',at:[25,12],members:['kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte']},
   {id:'weinkeller-wache',room:'weinkeller',at:[15,17],members:['baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'weinkeller-fass',room:'weinkeller',at:[25,5],members:['baumarktritter','baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'gewoelbe-nord',room:'gewoelbe',at:[39,5],members:['baumarktritter','maklerpraktikant','pappschuetze']},/* Dungeon-Fix 2: vorher zwei Ritter, Makler, Schütze – im engen Gang legte das mit typischer Ausrüstung den Schutz; jetzt wie Rittersaal West/Ost */
   {id:'gewoelbe-west',room:'gewoelbe',at:[19.5,42.5],members:['kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte','kellerratte']},
   {id:'gewoelbe-sued',room:'gewoelbe',at:[30,42],members:['maklerpraktikant','securityazubi','securityazubi','baumarktritter']},
   {id:'gewoelbe-ost',room:'gewoelbe',at:[38,16],members:['baumarktritter','baumarktritter','maklerpraktikant','pappschuetze']},
   {id:'gewoelbe-tresor',room:'gewoelbe',at:[38,31],members:['securityazubi','securityazubi','maklerpraktikant','baumarktritter']},
   {id:'gewoelbe-keller',room:'gewoelbe',at:[9.5,38.5],members:['securityazubi','securityazubi','maklerpraktikant','baumarktritter']},
   // Etappe 4 Teil B: Schlossgespenst läuft die Schleife der Gewölbegänge ab (Plan 4.4, Streife), solange der Beamer läuft, ist es nur ein Bild
   {id:'gewoelbe-gespenst',room:'gewoelbe',at:[36.5,30],members:['schlossgespenst'],patrol:[[36.5,8],[36.5,41],[24,41],[36.5,41]]}
  ],
  // Bosse: gebaut wird, was in DUNGEON_BOSSES steht; die übrigen Plätze sind reserviert (Plan Abschnitt 7).
  bosses:[
   {id:'gerd',room:'zugbruecke',at:[8.5,31],seal:'siegel-gerd'},
   {id:'expose',room:'musterwohnung',at:[32,43],seal:'siegel-expose'},
   {id:'rita',room:'studio',at:[60,19.6],optional:true},
   {id:'halbespferd',room:'stall',at:[28,2.5],rare:.3},
   {id:'korkenkurt',room:'kelterhalle',at:[23,28],seal:'siegel-kurt'},
   {id:'bigb',room:'thronsaal',at:[54,12]}
  ],
  // Beweise (Plan 4.5; V-D11 geändert: jeder Beweis mit sichtbarer Wirkung im Big-B-Kampf). Etappe 3 legt Feld und Wirkung an
  // (Laufstand `evidence`, dungeon.js bigbModifiers); verteilt werden sie erst in Etappe 4 (Vermieter, Wehrgang, Rita).
  // noLie: diese Fähigkeit lügt nicht mehr (Nachsatz sofort) · taken: Big B nimmt mehr Schaden · all: alle drei zusammen.
  // icon = Symbol im Bossrahmen (boss-alerts.js), note = Tooltip.
  evidence:{ids:['mietvertrag','leihschein','kirmesurkunde'],
   effects:{
    mietvertrag:{noLie:'parkett',icon:'lens',note:'Mietvertrag: Das Parkett lügt nicht mehr.'},
    leihschein:{noLie:'kulisse',icon:'lens',note:'Leihschein: Die Pappkulisse lügt nicht mehr.'},
    kirmesurkunde:{taken:.1,icon:'lens',note:'Kirmes-Urkunde: Big B nimmt 10 % mehr Schaden. Seine Wut kommt 0:25 früher.'}},
   all:{confessAt:.3,note:'Alle drei Beweise: Geständnis schon bei 30 %.'},
   // Etappe 4 Teil B: Fundstellen (Plan 4.5). Leihschein in der Pelzmanteltasche auf dem Carport-Dach („Das Dach ist nur Deko.“),
   // Mietvertrag von Vermieter Volker (Ereignis im Burgverlies), Kirmes-Urkunde im Presseamt – erst nach Reichweiten-Rita, sobald sie gebaut ist.
   // Gefunden ist noch nicht vorgelegt: Die Wirkung greift erst, wenn der Held die Beweise im Thronsaal vorlegt (present, vor dem Kampf).
   finds:{leihschein:{room:'wehrgang',floor:'e0',x:45,y:15,range:3.5,kind:'coat'},mietvertrag:{event:'volker'},
    kirmesurkunde:{room:'studio',floor:'k1',x:58.5,y:23,range:3.5,kind:'desk',after:'rita'}},
   present:{floor:'k2',x:49,y:26,range:4.5,gap:2}},
  // Etappe 4 Teil B: Ereignisse unterwegs (Plan 4.4). volker: hinter dem Fahrradschloss der Waschküche, frei, sobald der Pack guards liegt;
  // gibt den Mietvertrag und den Aufzugschlüssel (öffnet den Getränkeaufzug für heute) und steht danach als Händler im Hof.
  // beamer: Beamer auf Bierkiste im Weinkeller; ausgesteckt ist das Schlossgespenst weg (es war nur ein Film).
  events:[
   {id:'volker',room:'verlies',floor:'k1',x:5,y:26.5,range:3.5,guards:'verlies',gives:{evidence:'mietvertrag',unlock:'aufzug'}},
   {id:'beamer',room:'weinkeller',floor:'k2',x:30,y:10.5,range:3.5,ghost:'schlossgespenst'}
  ],
  // Händler Vermieter Volker (nach der Befreiung, dauerhaft): steht im Hof neben dem Rolltor. Ware in content/dungeon-e4b.js.
  vendor:{floor:'e0',x:25,y:35.5,range:3.5,after:'volker'},
  // Reichweiten-Rita (optional, Etappe 4): liegt sie, ruft Big Bs Live-Schalte nur einen Follower, und „Reichweite" wirkt nicht.
  optional:{rita:{bigb:{summon:1,noReach:true}}}
 }
};

// Dungeon-Gegner (nicht in ARCHETYPES: die Präzisions-Prüfung verlangt dort fertige Bögen). `art` = vorhandene Zeichnung als
// Platzhalter, bis die Grafik liefert (Plan Abschnitt 15). `family` = Beutetabelle in content/drops.js (E-71: eigene Tabelle
// `schlosstrash` für den Trash). `xp` = Erfahrung je Kill. `damage` = Faktor auf Autoangriff und feste Zauberschäden.
// Etappe 1 (E-71): Leben und Schaden gegen die gemessene Gruppe mit Instanz-Söldnern gesetzt (scripts/dungeon-sim.mjs): ein Pack
// dauert mit Held und vier Söldnern 20–40 s und kostet den Heiler spürbar Arbeit, ohne die Gruppe umzuwerfen.
export const DUNGEON_ENEMIES={
 securityazubi:{name:'Security-Azubi',type:'cultist',skin:'warden',art:'inspector',family:'schlosstrash',level:8,hp:13000,damage:3,xp:45,speed:56,aggroRange:96,roamRadius:14,castSet:'d-azubi',auto:'warden',
  look:'Junger Mann in zu großem schwarzem Polo „SECURITY", Funkgerät aus dem Spielzeugladen, Kaugummi'},
 pappwache:{name:'Pappwache',type:'cultist',skin:'warden',art:'kegler',family:'schlosstrash',level:8,hp:1,xp:5,speed:1,aggroRange:0,roamRadius:0,behavior:'neutral',cardboard:true,castSet:'d-azubi',auto:'warden',
  look:'Ritter in voller Rüstung. Aus Pappe. Mit Klebeband am Boden befestigt'},
 pappschuetze:{name:'Pappschütze',type:'cultist',skin:'warden',art:'scrounger',family:'schlosstrash',level:8,hp:8500,damage:2.3,xp:45,speed:48,aggroRange:140,roamRadius:8,castSet:'d-schuetze',auto:'scrounger',
  look:'Security-Azubi hinter einer Pappzinne, Wasserpistole in Neonfarben'},
 baumarktritter:{name:'Baumarkt-Ritter',type:'cultist',skin:'warden',art:'jga',family:'schlosstrash',level:9,hp:25000,elite:true,damage:2.2,xp:90,speed:50,aggroRange:100,roamRadius:10,castSet:'d-ritter',auto:'oberpraktikant',
  look:'Rüstung aus Regenrinne und Lüftungsrohr, Helm aus einem Eimer, Schild aus einer Mülltonnendeckel'},
 maklerpraktikant:{name:'Makler-Praktikant',type:'cultist',skin:'warden',art:'inspector',family:'schlosstrash',level:9,hp:12000,damage:2.3,xp:50,speed:54,aggroRange:100,roamRadius:10,castSet:'d-makler',auto:'inspector',
  look:'Anzug von der Konfirmation, Tablet, Visitenkarten in beiden Hosentaschen'},
 kellerratte:{name:'Pfandratte',type:'wolf',skin:'badger',family:'schlosstrash',level:9,hp:2600,damage:2,xp:12,speed:82,aggroRange:90,roamRadius:22,castSet:'d-ratte',auto:'badger',
  look:'Kellerratte mit Kronkorken im Maul, kommt nie allein'},
 // Etappe 3 (E-71): Big Bs Live-Schalte (Plan 7.6, Phase 2). priority = Söldner mit Schadensrolle nehmen sie vor dem Boss („Adds zuerst");
 // reach = jeder lebende Follower gibt Big B „Reichweite" (mehr Schaden, DUNGEON_BOSSES.bigb.reach). noLoot = Helfer lassen keine Beute fallen.
 follower:{name:'Follower',type:'cultist',skin:'warden',art:'scrounger',family:'schlosstrash',level:10,hp:3600,damage:1.2,xp:15,speed:62,aggroRange:0,roamRadius:0,castSet:'d-follower',auto:'scrounger',priority:true,reach:true,noLoot:true,
  look:'Handy im Querformat vor dem Gesicht, Ringlicht am Gürtel, filmt alles außer sich selbst'},
 // Etappe 4 Teil A (E-71, Plan 7.2): Interessenten der Besichtigung. goal = sie kämpfen nicht, sondern schlurfen zum Vertragstisch
 // (DUNGEON_BOSSES.expose.viewing.goal) und unterschreiben dort: Frau Dr. Exposé bekommt Provision (+Schaden, stapelt). Söldner mit
 // Schadensrolle nehmen das Add, das dem Tisch am nächsten ist (priority); der Schutz spottet sie nicht (sie greifen niemanden an).
 interessent:{name:'Interessent',type:'cultist',skin:'warden',art:'villager3',family:'schlosstrash',level:9,hp:1600,damage:0,xp:10,speed:12,aggroRange:0,roamRadius:0,castSet:'d-interessent',auto:'scrounger',priority:true,goal:true,noLoot:true,
  look:'Jacke überm Arm, Zollstock in der Hand, fragt nach dem Keller. Es ist der Keller'},
 // Etappe 4 Teil A (Plan 7.3): Reichweiten-Ritas Kommentatoren (Story posten, nicht unterbrochen). Fernkampf-Sticheleien, fallen schnell.
 kommentator:{name:'Kommentator',type:'cultist',skin:'warden',art:'villager5',family:'schlosstrash',level:9,hp:1400,damage:1.2,xp:10,speed:58,aggroRange:0,roamRadius:0,castSet:'d-kommentator',auto:'scrounger',priority:true,noLoot:true,
  look:'Daumen über dem Handy, schreibt „Erster!“ unter alles, auch unter Beerdigungen'},
 // Etappe 4 Teil B (Plan 6): Schlossgespenst als Streife in den Gewölbegängen. illusion = unverwundbar, solange der Beamer läuft (dungeon.js);
 // ist er ausgesteckt, verschwindet es. Figur: vorhandene Katalogfigur, keine neue Grafik und keine Tönung (die Tönungsebene kostete im Keller
 // ohne Grafikkarte 4 ms je Bild, dungeon-raeume-check).
 schlossgespenst:{name:'Schlossgespenst',type:'cultist',skin:'warden',art:'inspector',family:'schlosstrash',level:10,hp:18000,damage:2,xp:60,speed:44,aggroRange:80,roamRadius:0,castSet:'d-gespenst',auto:'warden',illusion:'beamer',
  look:'Bettlaken mit zwei Löchern, flackert am Rand wie ein schlecht eingestellter Beamer, macht „Buhuu“ mit Nachhall'}
};

// Bosse des Dungeons. phases: at = Lebensanteil; castSet wechselt den Zyklus, summon ruft Adds (DUNGEON_ENEMIES; hp = Anteil am Leben der Art).
// Etappe 1 (E-71): family = eigene Beutetabelle (content/drops.js), xp = Boss-EP nach Zielzeit (Gerd ≈ 60–100 s → 600),
// lootMoment = Beute bleibt als Beutel liegen und öffnet sich als Beute-Moment, statt ungefragt angelegt zu werden.
// fall.below: die Treppenkante wirft erst ab diesem Lebensanteil (Phase 2) hinaus, die Kante zeigt dann eine Warnlinie.
export const DUNGEON_BOSSES={
 gerd:{name:'Gästeliste-Gerd',title:'Sicherheitschef · Big B Protection (Ein-Mann-Betrieb)',type:'boss',skin:'horst',art:'sigi',family:'gerd',
  level:8,hp:65000,damage:3.5,xp:600,lootMoment:true,speed:46,aggroRange:84,roamRadius:6,leash:220,castSet:'d-gerd',auto:'horst',
  enrage:{after:130,every:5,damage:1.5},/* Held aktiv (2026-09-26): Sperrstunde – mit aktivem Held 85–100 s, ohne ihn nicht zu schaffen */
  look:'Breiter Mann im zu kleinen schwarzen Anzug, Klemmbrett, Kinder-Headset, Sonnenbrille im Keller',
  phases:[{at:.5,summon:{kind:'securityazubi',count:2,hp:.35}},{at:.25,summon:{kind:'securityazubi',count:2,hp:.35},castSet:'d-gerd2'},{at:.15}],
  fall:{rect:[2,20,5,6],to:{floor:'k1',x:12,y:9},below:.5}},
 // Etappe 3 „Big B" (E-71, Plan 7.6): Endboss im Thronsaal mit Behauptung und Nachsatz (lie). Zahlen gegen die gemessene Gruppe gesetzt
 // (scripts/dungeon-sim.mjs, Korridor 150–200 s mit Held und vier Söldnern). Grafik: vorhandene Katalogfigur (Kegelkönig Klaus) mit
 // Tönung (tint), keine neue Figur – eigene Bossgrafik erst nach Freigabe. final = Abschluss des Dungeons (Endtruhe, Bestzeit, Erfolg).
 // enrage (Plan: „Die ganze Wahrheit") = Zeitgrenze: nach `after` Sekunden Kampf +damage Schaden, alle `every` Sekunden erneut.
 // reach = +Anteil Schaden je lebendem Follower („Reichweite"). confess = Geständnis: ab `at` (mit allen Beweisen evidence.all.confessAt)
 // lügt er nicht mehr, mit allen drei Beweisen nimmt er dann taken mehr Schaden. Phasen: 70 % Follower, 40 % Das Schloss bröckelt, 15 % Geständnis (nur Anzeige; ausgelöst über confess).
 bigb:{name:'Big B',title:'Freiherr von und zu Burgstraße · selbsternannt',type:'boss',skin:'horst',art:'klaus',family:'bigb',tint:{color:'#5b2d86',alpha:.34},
  level:10,hp:140000,damage:2.2,xp:1500,lootMoment:true,final:true,speed:44,aggroRange:92,roamRadius:4,leash:300,castSet:'d-bigb',auto:'horst',
  look:'Mann um die 45, Pelzmantel aus dem Kostümverleih, Perücke mit Zopf, Goldkette aus goldlackierten Kronkorken, Siegelring aus Messing, Handy am Selfie-Stick mit Ringlicht',
  // Held aktiv (2026-09-26): Wut nach 4:50 statt 6:00 und härter (alle 5 s +150 %) – mit aktivem Held 170–200 s, ein passiver Held kam live
  // nach 3 min mit 3:00 Rest an. docs/DUNGEON-AKTIV-2026-09-26.md.
  // Dungeon-Fix 6 (Prüferin #741, docs/DUNGEON-FIX6-2026-09-26.md): sooner = so viele Sekunden früher, wenn der Kampf leichter ist – Rita liegt
  // (ein Follower, keine Reichweite) bzw. die Kirmes-Urkunde liegt vor (+10 % Schaden). Ohne das gewann eine passive Heldin 35 s vor der Wut
  // (Simulation: passiv 251–270 s mit allen Beweisen, aktiv 141–157 s). Wut 4:50 → 4:00 (Rita) → 3:35 (alle Beweise).
  enrage:{after:290,every:5,damage:1.5,sooner:{rita:50,kirmesurkunde:25}},reach:.08,confess:{at:.15,taken:.1},
  // Dungeon-Fix 4 (Nachprüfung #726: beim Betreten begann sofort der Kampf, keine Gelegenheit für „Beweise vorlegen“): Rollenspiel-Einleitung
  // wie in WoW. Big B bemerkt niemanden von selbst; der Kampf beginnt erst, wenn der Held den Thron erreicht (reach Kacheln um Big B), ihn mit F
  // anspricht (talk Kacheln) oder angreift. Dann legt der Held gefundene Beweise vor (Ausreden im Abstand evidence.present.gap), Big B sagt
  // seinen Begrüßungssatz (line s), erst danach fällt die Tür zu. opener = Anlaufzeit bis zum ersten Zauber, wenn die Gruppe drin ist.
  // Dungeon-Fix 5 (Prüfer #728): keep = Hysterese des F-Hinweises (er geht erst jenseits von talk + keep Kacheln). Nach der Rede wartet Big B
  // (WoW-Muster), bis der Held angreift oder den Nahbereich reach neu betritt; opener zählt ab diesem echten Kampfbeginn.
  intro:{reach:5,talk:13,keep:3,line:3,opener:6},
  phases:[{at:.7,castSet:'d-bigb2'},{at:.4,castSet:'d-bigb3'},{at:.15,confess:true}]},
 // ── Etappe 4 Teil A „Die restlichen Bosse“ (E-71, Plan 7.2–7.5). Zahlen gegen die gemessene Gruppe gesetzt (scripts/dungeon-sim.mjs,
 // Korridor 70–110 s mit Held und vier Söldnern). Figuren: vorhandene Katalogfiguren mit Tönung (tint) in Bossgröße, keine neue
 // Figurengrafik – eigene Bossgrafik erst nach Freigabe. Merkmale in dungeon.js (Block „Etappe 4 Teil A“), Söldner in companions.js.
 // Frau Dr. Exposé (Plan 7.2), Siegel 2 im Rittergeschoss. viewing = Besichtigung: Interessenten kommen aus den Besichtigungseingängen
 // (doors, Meter) und schlurfen zum Vertragstisch (goal); wer ihn erreicht, unterschreibt: +sign.damage Schaden je Unterschrift, höchstens
 // sign.stack – beim letzten Stapel „VERKAUFT!“: alle fliegen aus der Wohnung, der Kampf setzt zurück. via = je Eingang ein Punkt, den sie
 // vorher besichtigen (Laminat bewundern), bevor sie zum Tisch gehen.
 expose:{name:'Frau Dr. Exposé',title:'Immobilienberaterin · Dr. (nicht gefragt)',type:'boss',skin:'horst',art:'gisela',family:'expose',tint:{color:'#f0826c',alpha:.32},
  level:9,hp:63000,damage:2.8,xp:800,lootMoment:true,speed:44,aggroRange:92,roamRadius:4,leash:240,castSet:'d-expose',auto:'tablet',
  enrage:{after:160,every:5,damage:1.5},/* Held aktiv (2026-09-26): Letztes Angebot */
  look:'Hosenanzug in Lachsrosa, Tablet, Schlüsselbund mit dreißig Schlüsseln für drei Türen, Duftstäbchen im Dutt',
  viewing:{goal:[32,47.2],reach:2.2,doors:[[21.9,43.6],[42.1,43.6]],via:[[26,40.3],[38,40.3]],sign:{damage:.15,stack:5},out:{floor:'k1',x:32,y:36}},
  phases:[{at:.5,castSet:'d-expose2'},{at:.2,castSet:'d-expose3'},{at:.15}]},
 // Kellermeister Korken-Kurt (Plan 7.5), Siegel 3 im Basaltgewölbe: Sammeln, Verteilen, Fass in der Rinne; ab 20 % die Sprinkleranlage
 // (Zeitgrenze: vom Rand her werden Streifen nass und rutschig).
 korkenkurt:{name:'Kellermeister Korken-Kurt',title:'Sommelier · Jahrgang: gestern',type:'boss',skin:'horst',art:'horst',family:'korkenkurt',tint:{color:'#8c1f45',alpha:.3},
  level:9,hp:86000,damage:3,xp:900,lootMoment:true,speed:44,aggroRange:92,roamRadius:4,leash:240,castSet:'d-kurt',auto:'korkenzieher',
  enrage:{after:150,every:5,damage:1.5},/* Held aktiv (2026-09-26): Zapfenstreich */
  look:'Weste, Korkenzieher am Gürtel wie ein Colt, Probierlöffel an einer Kette, rote Nase, Tastglas in jeder Hand',
  phases:[{at:.5,castSet:'d-kurt2'},{at:.2,castSet:'d-kurt3'},{at:.15}]},
 // Reichweiten-Rita (Plan 7.3), optional im Presseamt: Blitzlicht mit Sichtlinie (hinter Deckung), Story posten (unterbrechen, sonst
 // Kommentatoren), Greenscreen (vor der grünen Wand unsichtbar, der Schutz zieht sie weg). hidden = Zone vor der Wand (Meter),
 // cover = Deckung im Raum (Meter; sperrt Laufen und Sichtlinie, dungeon.js coverRects). Liegt sie, ruft Big B nur einen Follower.
 rita:{name:'Reichweiten-Rita',title:'Social-Media-Managerin · Reichweite auf Rechnung',type:'boss',skin:'horst',art:'elke',family:'rita',tint:{color:'#35b25a',alpha:.3},
  // Held aktiv (2026-09-26): Schaden 2,6 → 4,0 – ohne Heiler hielt ihr Schutz über 50 s und der Heiler-Tod blieb fast immer folgenlos
  // (15 von 15 gewonnen); mit Heiler ändert sich nichts (Kampfdauer 70–110 s, keine Tode).
  level:9,hp:77000,damage:4,xp:600,lootMoment:true,speed:50,aggroRange:92,roamRadius:4,leash:200,castSet:'d-rita',auto:'ringlicht',
  look:'Frau Mitte zwanzig, Ringlicht auf dem Rücken wie ein Heiligenschein, drei Handys am Gürtel, Greenscreen-Tuch als Umhang, Ansteckmikrofon',
  // Feinschliff 2026-09-26: Leben 68 000 → 77 000 – ohne den Greenscreen-Hänger lag sie im Flügel bei 69–78 s (Ziel 70–110 s, alle fünf Klassen).
  // Feinschliff 2026-09-26: exit = spätestens so viele Sekunden nach dem Greenscreen (bzw. nach dem Spott) ist sie wieder sichtbar, auch wenn
  // sie oder ihr Ziel noch vor der Wand stehen (klarer Ausweg wie in WoW; vorher hing der Kampf, wenn ihr Ziel am Greenscreen stand).
  hidden:{rect:[57.2,12.2,6.6,2.6],exit:2},
  cover:[{id:'kuehlschrank',rect:[59.6,16.6,1.3,1.3]},{id:'palettenwand',rect:[58.4,21.8,2.6,.7]}],
  phases:[{at:.5,castSet:'d-rita2'},{at:.15}]},
 // Das halbe Pferd (Plan 7.4), selten (30 % der Durchgänge) in den Stallungen. feeds = Trog (Meter): in range Metern heilt es heal
 // Anteil Leben je Sekunde; „Säuft am Trog“ läuft es hin (retreat), der Schutz zieht es weg. mountArt = das Reittier „Das halbe Pferd“
 // als Figur (MOUNTS.halbespferd: Bogen des Hofpferds) – nur noch der Rückfall; seit 2026-09-26 zeichnet die Anziehpuppe das Kostüm (dungeon-figuren-art.js). Beute: Hafersack, 3 % Reittier (DROP_TABLES.halbespferd).
 halbespferd:{name:'Das halbe Pferd',title:'Vorderhälfte eines Fuchses · frisch gestriegelt',type:'boss',skin:'boar',mountArt:'halbespferd',family:'halbespferd',
  level:9,hp:74000,damage:3,xp:500,lootMoment:true,speed:58,aggroRange:92,roamRadius:4,leash:160,castSet:'d-pferd',auto:'huf',
  look:'Die vordere Hälfte eines Fuchses, frisch gestriegelt, hinten ein sauberer Schnitt mit Pflaster. Darunter Jeans und Turnschuhe. Es säuft',
  feeds:{at:[23.6,3.8],range:3.5,heal:.02}}
};

// Zaubermuster der Dungeon-Gegner. Neue Merkmale (Plan Abschnitt 9): cone {angle (Grad), range (Einheiten)},
// tankSafe (Anteil für Schutz-Specs und Parade), knockback (Einheiten), callHelp (Nachbargruppe kommt), healAllies,
// frontGuard (Schildwall: Treffer von vorn gedämpft). `hint` (Etappe 2): die Antwort in 2–3 Wörtern für Warnleiste und Journal –
// sie stand früher hinter „ · “ im Namen und wurde im Zielrahmen abgeschnitten. Symbol und Tooltip kommen aus den Merkmalen (describeCast).
// Etappe 1 (E-71): pct = Schaden als Anteil am Höchstleben des Getroffenen (ohne Rüstung, Deckung und Schutz wirken) statt der festen
// Zahl in damage; target:'random' = Fläche bzw. Ziel auf einem zufälligen Nicht-Schutz (Held oder Söldner, nie der Tank).
// Kegel enden an Wänden (dungeon.js coneReach): Warnfläche und Treffer lesen dieselben Strahlen. brand = Mal auf jedem Getroffenen außer
// dem Ziel (Hausverbot): jeder weitere Treffer desselben Zaubers innerhalb von duration Sekunden kostet bonus × Stapel mehr – wer
// stehen bleibt, fliegt beim dritten Mal; wer ausweicht, merkt nichts davon.
export const DUNGEON_CASTS={
 'd-azubi':{cycle:['funk','schubser'],casts:{
  funk:{name:'Funkspruch',hint:'Unterbrechen',total:2.6,damage:120,pct:.15,interruptible:true,callHelp:{range:120}},
  schubser:{name:'Schubser',hint:'Ausweichen',total:2.2,damage:180,pct:.25,radius:30,ground:true}}},
 'd-schuetze':{cycle:['wasser','wasser','spritzer'],casts:{
  wasser:{name:'Wasserpistole',hint:'Ausweichen',total:2.2,damage:160,pct:.2,radius:28,ground:true},
  spritzer:{name:'Dauerspritzer',hint:'Unterbrechen',total:2.4,damage:240,pct:.25,interruptible:true}}},
 'd-ritter':{cycle:['hieb','schild','hieb'],casts:{
  hieb:{name:'Regenrinnen-Hieb',hint:'Nicht davor stehen',total:2.4,damage:420,pct:.3,cone:{angle:80,range:60},tankSafe:.5},
  schild:{name:'Schildwall',hint:'Von hinten treffen',total:1,damage:0,frontGuard:{duration:5,factor:.2}}}},
 'd-makler':{cycle:['provision','expose'],casts:{
  provision:{name:'Provision',hint:'Unterbrechen',total:2.4,damage:0,interruptible:true,healAllies:{share:.12,range:140}},
  expose:{name:'Exposé verteilen',hint:'Fläche verlassen',total:2.2,damage:220,pct:.2,radius:40,ground:true}}},
 'd-ratte':{cycle:['knabbern'],casts:{
  knabbern:{name:'Knabbern',total:.8,damage:60,radius:26}}},
 // Etappe 4 Teil B: Schlossgespenst (Plan 6: „Buhuu · Fläche verlassen“)
 'd-gespenst':{cycle:['buhuu'],casts:{
  buhuu:{name:'Buhuu',hint:'Fläche verlassen',total:2.2,damage:200,pct:.25,radius:34,ground:true,target:'random'}}},
 'd-gerd':{cycle:['liste','rausschmiss','dresscode','rausschmiss'],casts:{
  liste:{name:'Du stehst nicht auf der Liste',hint:'Unterbrechen',total:2.4,damage:420,pct:.3,target:'random',interruptible:true},
  rausschmiss:{name:'Rausschmiss',hint:'Seitlich stehen',total:1.8,damage:650,pct:.6,cone:{angle:70,range:88},tankSafe:.25,knockback:64,brand:{name:'Hausverbot',duration:20,bonus:.6}},
  dresscode:{name:'Dresscode-Kontrolle',hint:'Fläche verlassen',total:2.2,damage:380,pct:.35,target:'random',radius:48,ground:true}}},
 // Phase 2 (Plan 7.1): Rausschmiss zweimal hintereinander, dazwischen 1 s. gaps = Abstand nach dem Zauber an dieser Stelle des Zyklus
 // statt specialInterval; wer nach dem ersten vorn bleibt, trägt dann schon Hausverbot.
 'd-gerd2':{cycle:['rausschmiss','rausschmiss','liste','dresscode'],gaps:{0:1},casts:{
  liste:{name:'Du stehst nicht auf der Liste',hint:'Unterbrechen',total:2.4,damage:420,pct:.3,target:'random',interruptible:true},
  rausschmiss:{name:'Rausschmiss',hint:'Seitlich stehen',total:1.4,damage:650,pct:.6,cone:{angle:70,range:88},tankSafe:.25,knockback:64,brand:{name:'Hausverbot',duration:20,bonus:.6}},
  dresscode:{name:'Dresscode-Kontrolle',hint:'Fläche verlassen',total:2.2,damage:380,pct:.35,target:'random',radius:48,ground:true}}},
 // ── Etappe 3 „Big B" (E-71, Plan 7.6 und Abschnitt 9). Neue Merkmale, alle in dungeon.js ausgewertet:
 // lie {claim,truth,tell,mirror}: Behauptung und Nachsatz. Zauberleiste und Big Bs Sprechblase zeigen erst `claim` (gelogen); nach `tell`
 //   Sekunden (Grundwert 1,0 s; Beweise und Geständnis streichen die Lüge) kommt der Nachsatz mit Ton, erst dann liegt die echte Markierung
 //   am Boden. mirror: Seite zufällig, Wortlaut gespiegelt (mirrorClaim/mirrorTruth). Söldner folgen dem Nachsatz, nicht der Behauptung –
 //   mit Fehlerquote (COMPANION_RULES.lieError).
 // line {lanes,claim,truth}: Bahnen über die ganze Länge der Arena (Anteile der Raumbreite, West → Ost). claim = Bahn, die die Behauptung
 //   nennt; truth = Bahnen, die wirklich getroffen werden. Getroffen wird, wer beim Zauberende darin steht.
 // circles n: Bodenflächen auf n Stellen (je Nicht-Schutz in der Arena eine, der Rest zufällig). persist {duration,radius,pct}: Trümmer
 //   bleiben als kleine Gefahrenfelder liegen (pct = Anteil am Leben je Sekunde darin).
 // tracks [{cast,every,first}]: parallele Timer neben dem Hauptzyklus (Siegelring alle 12 s auf den, der Big B hält).
 // tankDebuff {id,name,stack,taken,duration}: stapelnde Schwäche auf dem Getroffenen (+taken erlittener Schaden je Stapel, höchstens stack);
 //   eine Parade des Helden bzw. „Deckel hoch" des Schutz-Söldners beim Treffer löscht alle Stapel.
 // interrupts n: bricht erst nach n Unterbrechungen · selfHeal: Anteil Leben, wenn der Zauber durchkommt · summon: Adds am Zauberende ·
 // say: Spruch beim Zauberbeginn (keine Lüge).
 // Dungeon-Fix 3 (Big-B-Abnahme #721: „Nachsatz stand nur noch 1,3 s in der Leiste – knapp“): Die Kanonenkugel dauert 3,0 s – nach dem
 // Nachsatz (tell 1,0 s, V-D5) bleiben 2,0 s, um die Hälfte zu wechseln (WoW-Richtwert). Parkett und Pappkulisse bleiben 2,8/2,6 s: Ihre
 // Stellen liegen unter dem, den sie treffen – ein Schritt reicht; mit 3,0 s fiel in der Simulation eine Gruppe (Dieter, Seed 8).
 // Dungeon-Fix 4 (Nachprüfung #726: Richtungszeilen standen bei den Blicken des Prüfers nur 1,4/1,2/0,1 s da): 3,2 s – nach dem Nachsatz
 // bleiben 2,2 s. Die Warnleiste zeigt die Handlung im selben Takt wie der Nachsatz (gemessen, docs/DUNGEON-FIX4-2026-09-26.md); mit der Reserve
 // liegt auch der erste Wert, den die Leiste zeigt, sicher über 2,0 s. 3,4 s kippte in der Simulation Dieter/Seed 8 (vier Söldner am Boden).
 // Dungeon-Fix 5 (Prüfer #728: „nach dem Nachsatz nur noch 0,2 s“): Ziel mindestens 2,0 s ab sichtbarer Handlungszeile in jeder Lügen-Variante.
 // Kanonenkugel (alle Phasen) bleibt 3,2 s (2,2 s nach dem Nachsatz); Parkett und Pappkulisse jetzt auch 3,2 s statt 2,8/2,6 s – ohne die
 // passenden Beweise lügen auch sie, nach dem Nachsatz blieben 1,8/1,6 s. Den Abstand danach zu kürzen (gleicher Takt) nahm in der Simulation dem
 // Profil „folgt der Behauptung“ zweimal jeden Tod – daher nur länger. Gemessen im Spiel: docs/DUNGEON-FIX5-2026-09-26.md.
 'd-bigb':{cycle:['kanone','anwalt'],tracks:[{cast:'siegelring',every:12,first:6}],casts:{
  kanone:{name:'Ritt auf der Kanonenkugel',hint:'Nachsatz abwarten',total:3.2,damage:700,pct:.7,line:{lanes:[[0,.5],[.5,1]],claim:0,truth:[1]},
   lie:{claim:'Ich reite nach LINKS!',truth:'… sagt man. Rechts.',tell:1,mirror:true,mirrorClaim:'Ich reite nach RECHTS!',mirrorTruth:'… sagt man. Links.'}},
  anwalt:{name:'Mein Anwalt ruft gleich an',hint:'Unterbrechen',total:2.4,damage:480,pct:.3,target:'random',interruptible:true,say:'Das ist nur ein Anruf.'},
  siegelring:{name:'Siegelring',hint:'Parieren',total:1.2,damage:260,pct:.1,tankDebuff:{id:'zertifikat',name:'Zertifikat',stack:3,taken:.1,duration:30}}}},
 // Phase 2 „Follower" (70–40 %): Live-Schalte ruft Follower, Kanonenkugel zweimal hintereinander (1 s dazwischen), das Parkett.
 'd-bigb2':{cycle:['live','kanone','kanone','parkett'],gaps:{1:1},tracks:[{cast:'siegelring',every:12,first:4}],casts:{
  live:{name:'Live-Schalte',hint:'Adds zuerst',total:2.2,damage:0,summon:{kind:'follower',count:3},lie:{claim:'Ich mach nur ein Foto!',truth:'… mit Follower.',tell:1}},
  kanone:{name:'Ritt auf der Kanonenkugel',hint:'Nachsatz abwarten',total:3.2,damage:700,pct:.7,line:{lanes:[[0,.5],[.5,1]],claim:0,truth:[1]},
   lie:{claim:'Ich reite nach LINKS!',truth:'… sagt man. Rechts.',tell:1,mirror:true,mirrorClaim:'Ich reite nach RECHTS!',mirrorTruth:'… sagt man. Links.'}},
  parkett:{name:'Das Parkett ist echt',hint:'Fläche verlassen',total:3.2,damage:420,pct:.35,ground:true,radius:28,circles:6,lie:{claim:'Der Boden ist sicher!',truth:'… war er.',tell:1}},
  siegelring:{name:'Siegelring',hint:'Parieren',total:1.2,damage:260,pct:.1,tankDebuff:{id:'zertifikat',name:'Zertifikat',stack:3,taken:.1,duration:30}}}},
 // Phase 3 „Das Schloss bröckelt" (40–0 %): Pappkulisse mit Trümmern, zwei Kanonenkugel-Bahnen zugleich (nur die Mitte ist sicher),
 // Am eigenen Schopf (zweimal unterbrechen, sonst heilt er 5 %). Ab dem Geständnis lügt er nicht mehr.
 'd-bigb3':{cycle:['kulisse','kanone3','schopf'],tracks:[{cast:'siegelring',every:12,first:4}],casts:{
  kulisse:{name:'Pappkulisse fällt',hint:'Fläche verlassen',total:3.2,damage:380,pct:.3,ground:true,radius:34,circles:4,persist:{duration:8,radius:16,pct:.05},lie:{claim:'Das ist Stuck. Echter Stuck.',truth:'… aus Pappe. Fällt.',tell:1}},
  kanone3:{name:'Ritt auf der Kanonenkugel',hint:'In die Mitte',total:3.2,damage:700,pct:.7,line:{lanes:[[0,.36],[.64,1]],claim:0,truth:[0,1]},
   lie:{claim:'Ich reite nach LINKS!',truth:'… und rechts.',tell:1,mirror:true,mirrorClaim:'Ich reite nach RECHTS!',mirrorTruth:'… und links.'}},
  schopf:{name:'Am eigenen Schopf',hint:'Zweimal unterbrechen',total:3.5,damage:0,interruptible:true,interrupts:2,selfHeal:.05,say:'Ich zieh mich hier selbst raus!'},
  siegelring:{name:'Siegelring',hint:'Parieren',total:1.2,damage:260,pct:.1,tankDebuff:{id:'zertifikat',name:'Zertifikat',stack:3,taken:.1,duration:30}}}},
 // Follower (Live-Schalte): Selfie mit Blitz auf einen zufälligen Nicht-Schutz.
 'd-follower':{cycle:['selfie'],casts:{
  selfie:{name:'Selfie mit Blitz',hint:'Fläche verlassen',total:2.2,damage:140,pct:.12,radius:28,ground:true,target:'random'}}},
 // ── Etappe 4 Teil A (E-71, Plan 7.2–7.5 und Abschnitt 9). Neue Merkmale, alle in dungeon.js (Block „Etappe 4 Teil A“) ausgewertet:
 // summon.goal: Adds laufen zum Ziel des Bosses (viewing.goal) statt zu kämpfen; doors = aus wie vielen Besichtigungseingängen.
 // decoy {count,tell}: von den Bodenstellen (circles) sind count Attrappen; erst nach tell Sekunden bekommen die echten ihren Stempel –
 //   vorher sehen alle gleich aus. Nur die echten treffen. Söldner warten den Stempel ab und meiden nur echte Stellen.
 // signAll: kommt der Zauber durch, unterschreiben alle lebenden Interessenten sofort (Notartermin).
 // stack {radius,share}: um den Markierten (target:'random'); share = Anteil Leben, geteilt durch alle im Kreis (allein tödlich).
 // spread {radius}: um jeden ein eigener Kreis; wer in fremden Kreisen steht, nimmt pct je Kreis dazu (Überlappung addiert).
 // line.axis 'y': waagrechte Bahnen (Rinnen quer durch die Kelterhalle, Anteile der Raumhöhe); pick = wie viele Rinnen rollen, aim =
 //   die erste liegt unter einem zufälligen Nicht-Schutz (wer schon in einer Rinne steht, zuerst). persist.edge: Streifen vom Rand her (Sprinkler), bleiben bis Kampfende,
 //   pct je Sekunde und slow (langsamer laufen). los {blind,miss}: trifft nur, wer beim Zauberende Sichtlinie hat; geblendet = halber
 //   Schaden für blind Sekunden; mit brand wie Gerds Hausverbot: wer in duration Sekunden wieder im Blitz steht, nimmt bonus je Stapel mehr. hidden: läuft zur Zone vor der Wand (DUNGEON_BOSSES.rita.hidden) und ist dort unsichtbar. retreat:
 //   läuft zum Trog (feeds) und säuft; Spott des Schutzes beendet beides. center:'self' = Fläche um den Boss selbst.
 'd-interessent':{cycle:['unterschrift'],casts:{
  unterschrift:{name:'Unterschrift',hint:'Vorher legen',total:1,damage:0,goal:true}}},
 'd-expose':{cycle:['verkauft','forderung'],tracks:[{cast:'termin',every:30,first:5}],casts:{
  termin:{name:'Besichtigungstermin',hint:'Interessenten legen',total:1.6,damage:0,summon:{kind:'interessent',count:3,goal:true,doors:1}},
  verkauft:{name:'Grundstück verkauft',hint:'Stempel abwarten',total:2.6,damage:380,pct:.55,ground:true,radius:30,circles:4,decoy:{count:2,tell:.8},brand:{name:'Grundbuchsperre',duration:25,bonus:.8}},
  forderung:{name:'Provisionsforderung',hint:'Unterbrechen',total:2.4,damage:520,pct:.4,interruptible:true}}},
 // Phase 2 „Tag der offenen Tür“ (50–20 %): Besichtigung alle 20 s aus beiden Eingängen.
 'd-expose2':{cycle:['verkauft','forderung','verkauft'],tracks:[{cast:'offen',every:20,first:3}],casts:{
  offen:{name:'Tag der offenen Tür',hint:'Je Eingang einer',total:1.6,damage:0,summon:{kind:'interessent',count:4,goal:true,doors:2}},
  verkauft:{name:'Grundstück verkauft',hint:'Stempel abwarten',total:2.6,damage:380,pct:.55,ground:true,radius:30,circles:4,decoy:{count:2,tell:.8},brand:{name:'Grundbuchsperre',duration:25,bonus:.8}},
  forderung:{name:'Provisionsforderung',hint:'Unterbrechen',total:2.4,damage:520,pct:.4,interruptible:true}}},
 // Phase 3 „Notartermin“ (20–0 %): zweimal unterbrechen, sonst heilt sie 10 % und alle Interessenten unterschreiben.
 'd-expose3':{cycle:['notar','verkauft','forderung'],tracks:[{cast:'offen',every:20,first:9}],casts:{
  notar:{name:'Notartermin',hint:'Zweimal unterbrechen',total:3.5,damage:0,interruptible:true,interrupts:2,selfHeal:.1,signAll:true,say:'Der Notar ist mein Cousin. Er ist Notar für Kleingärten.'},
  offen:{name:'Tag der offenen Tür',hint:'Je Eingang einer',total:1.6,damage:0,summon:{kind:'interessent',count:4,goal:true,doors:2}},
  verkauft:{name:'Grundstück verkauft',hint:'Stempel abwarten',total:2.6,damage:380,pct:.55,ground:true,radius:30,circles:4,decoy:{count:2,tell:.8},brand:{name:'Grundbuchsperre',duration:25,bonus:.8}},
  forderung:{name:'Provisionsforderung',hint:'Unterbrechen',total:2.4,damage:520,pct:.4,interruptible:true}}},
 // Korken-Kurt: Rinnen wie in der Kelterhalle gezeichnet (Anteile .26/.52/.78 der Raumhöhe, je 2,6 m breit).
 'd-kurt':{cycle:['runde','fass','zahlen','fass'],casts:{
  runde:{name:'Runde auf mich!',hint:'Zusammen stehen',total:3.2,damage:1500,target:'random',stack:{radius:40,share:1.2}},
  zahlen:{name:'Jeder zahlt selbst',hint:'Auseinander',total:3,damage:350,pct:.25,spread:{radius:34}},
  fass:{name:'Fass rollt',hint:'Aus der Rinne',total:2.4,damage:600,pct:.8,line:{axis:'y',lanes:[[.18,.34],[.44,.6],[.7,.86]],pick:1,aim:true}}}},
 // Phase 2 „Verkostung“ (50–20 %): 20 % schneller (gaps), zwei Rinnen, Korken knallen.
 'd-kurt2':{cycle:['runde','fass2','korken','zahlen','fass2'],gaps:{0:4.4,1:4.4,2:4.4,3:4.4,4:4.4},casts:{
  runde:{name:'Runde auf mich!',hint:'Zusammen stehen',total:3.2,damage:1500,target:'random',stack:{radius:40,share:1.2}},
  zahlen:{name:'Jeder zahlt selbst',hint:'Auseinander',total:3,damage:350,pct:.25,spread:{radius:34}},
  fass2:{name:'Fass rollt',hint:'Aus der Rinne',total:2.4,damage:600,pct:.8,line:{axis:'y',lanes:[[.18,.34],[.44,.6],[.7,.86]],pick:2,aim:true}},
  korken:{name:'Korken knallen',hint:'Fläche verlassen',total:2,damage:200,pct:.5,ground:true,radius:22,circles:4,brand:{name:'Sektdusche',duration:30,bonus:.8}}}},
 // Phase 3 „Sprinkleranlage“ (20–0 %): alle 10 s ein nasser Streifen mehr vom Rand her (Zeitgrenze), dazu der Rest.
 'd-kurt3':{cycle:['runde','korken','fass2','zahlen','korken'],gaps:{0:4.4,1:4.4,2:4.4,3:4.4,4:4.4},tracks:[{cast:'sprinkler',every:10,first:1}],casts:{
  sprinkler:{name:'Sprinkleranlage',hint:'Mitte halten',total:1,damage:60,persist:{edge:true,width:2,pct:.04,slow:.4}},
  runde:{name:'Runde auf mich!',hint:'Zusammen stehen',total:3.2,damage:1500,target:'random',stack:{radius:40,share:1.2}},
  zahlen:{name:'Jeder zahlt selbst',hint:'Auseinander',total:3,damage:350,pct:.25,spread:{radius:34}},
  fass2:{name:'Fass rollt',hint:'Aus der Rinne',total:2.4,damage:600,pct:.8,line:{axis:'y',lanes:[[.18,.34],[.44,.6],[.7,.86]],pick:2,aim:true}},
  korken:{name:'Korken knallen',hint:'Fläche verlassen',total:2,damage:200,pct:.5,ground:true,radius:22,circles:4,brand:{name:'Sektdusche',duration:30,bonus:.8}}}},
 // Reichweiten-Rita: Blitzlicht (Sichtlinie), Story posten (unterbrechen), Greenscreen als Nebentakt.
 'd-rita':{cycle:['blitz','story'],tracks:[{cast:'greenscreen',every:22,first:12}],casts:{
  blitz:{name:'Blitzlicht',hint:'Hinter Deckung',total:2.5,damage:300,pct:.5,los:{blind:4,miss:.5},brand:{name:'Überbelichtet',duration:30,bonus:.8}},
  story:{name:'Story posten',hint:'Unterbrechen',total:2.2,damage:0,interruptible:true,summon:{kind:'kommentator',count:2}},
  greenscreen:{name:'Greenscreen',hint:'Weg vom Greenscreen',total:1,damage:0,hidden:{duration:6}}}},
 // Phase 2 (50–0 %): Big B feuert sie per Sprachnachricht – Blitzlicht öfter, alles 20 % schneller.
 'd-rita2':{cycle:['blitz','story','blitz'],gaps:{0:4.4,1:4.4,2:4.4},tracks:[{cast:'greenscreen',every:18,first:6}],casts:{
  blitz:{name:'Blitzlicht',hint:'Hinter Deckung',total:2.5,damage:300,pct:.5,los:{blind:4,miss:.5},brand:{name:'Überbelichtet',duration:30,bonus:.8}},
  story:{name:'Story posten',hint:'Unterbrechen',total:2.2,damage:0,interruptible:true,summon:{kind:'kommentator',count:2}},
  greenscreen:{name:'Greenscreen',hint:'Weg vom Greenscreen',total:1,damage:0,hidden:{duration:6}}}},
 'd-kommentator':{cycle:['stichelei'],casts:{
  stichelei:{name:'Hate-Kommentar',hint:'Fläche verlassen',total:2.2,damage:120,pct:.1,radius:26,ground:true,target:'random'}}},
 // Das halbe Pferd: Huftritt nach vorn, Wiehern um sich selbst, Säuft am Trog als Nebentakt.
 'd-pferd':{cycle:['huftritt','wiehern','huftritt'],tracks:[{cast:'saufen',every:15,first:8}],casts:{
  huftritt:{name:'Huftritt',hint:'Nicht davor stehen',total:2,damage:300,pct:.45,cone:{angle:60,range:38},tankSafe:.25},
  wiehern:{name:'Wiehern',hint:'Kurz raus',total:2.2,damage:250,pct:.55,ground:true,radius:28,center:'self',brand:{name:'Ohrensausen',duration:30,bonus:1}},
  saufen:{name:'Säuft am Trog',hint:'Vom Trog wegziehen',total:1,damage:0,retreat:{duration:6},feeds:true}}}
};

// Belohnungen (E-71, Etappe 1): Siegelmarken als Währung gegen Beutepech (Händler Vermieter Volker folgt in Etappe 4), Tagesbonus beim
// ersten Abschluss eines Flügels am Tag (Anteil auf die Boss-EP plus Marken). Boss-EP stehen am Boss (xp). Zählerstand im Spielstand
// unter dungeons[id].marks.
// Etappe 3 (E-71): repeatXp = Anteil der Boss-EP für jeden weiteren Sieg über denselben Boss am selben Tag (wie Instanz-Limits in WoW:
// der erste Sieg des Tages voll, jede Wiederholung ein Drittel; Beute und Siegelmarken bleiben). Schließt die Farm-Lücke aus Etappe 1.
// chest = Endtruhe in der Schatzkammer: Wahl aus `choices` Teilen der Güte `quality` (Stufe = Big Bs Stufe + 1) plus Siegelmarken,
// einmal je Durchgang. Der Abschluss (final) zählt Abschlüsse und Bestzeit im Spielstand (dungeons[id].clears/best).
// Etappe 4 Teil B: wingChest = kleine Truhe je Flügel: ein Teil (Güte ungewöhnlich, mit rareChance selten, Stufe = Boss + 1) und Siegelmarken.
// Feinschliff 2026-09-26 (Entscheidung Orchestrator): trashXp = Anteil der EP für Trash-Gegner aus Packs (nicht Bosse, nicht ihre Helfer, nicht das Feld).
// Mit ehrlich gemessenen Wegen brachte die Wiederholung eines Flügels bis 240 EP/min (Ziel 1–2× Feld, E-71); 0,8 bringt sie ins Band.
// Dungeon-Fix 2 (2026-09-26): Gleiche Gegner eines Packs fangen versetzt an – der zweite Baumarkt-Ritter schlägt stagger s nach dem ersten zu,
// statt dass zwei Regenrinnen-Hiebe zugleich auf die Gruppe fallen (vorher der häufigste Tod eines Söldners bei Doppel-Rittern).
export const DUNGEON_PACK_RULES={stagger:2.5};
// Dungeon-Fix 3 (Big-B-Abnahme #721: der Held blieb nach dem Sieg tot, der einzige Knopf gab den schon gewonnenen Kampf auf): Nach dem Kampf
// hilft ein lebender Heil-Söldner auf (content/companions.js revive.afterCast). Lebt keiner, steht der Held standUp s nach Kampfende am Ort
// auf, mit dem Leben wie beim Aufhelfen unter Mitspielern (E-44, BALANCE.party.reviveHp). Kommt der Heiler nicht binnen healerWait s, steht
// der Held ebenso selbst auf. Nach einem Wipe (alle lagen, die Gegner sind zurückgesetzt) bleibt es beim Kontrollpunkt.
export const DUNGEON_GHOST={standUp:3,healerWait:12};
export const DUNGEON_REWARDS={marksPerBoss:2,daily:{xp:.5,marks:2},repeatXp:1/3,trashXp:.68,wingChest:{marks:1,quality:'uncommon',rareChance:.35},chest:{choices:3,quality:'rare',marks:3,
 slots:['weapon','head','shoulders','body','hands','waist','legs','feet','ring','trinket','neck','wrists']}};

// Erfolge des Dungeons (Etappe 3): stehen im Spielstand unter dungeons[id].feats. check = Bedingung beim Sieg über `boss`
// (dungeon.js grantFeats). Weitere Erfolge aus Plan 11 („Beweislast", „Schlossführung" …) folgen mit Etappe 4.
// Etappe 4 Teil B: weitere Erfolge (Plan 11). check: allEvidence = alle Beweise vorgelegt (und Rita besiegt, sobald gebaut) · fast = Abschluss
// unter seconds Sekunden Durchgangszeit · noDeath = der Held ist im Durchgang nie gefallen. Ohne boss vergibt sie dungeon.js awardFeat:
// seals = alle Siegel an einem Tag, seen = der seltene Boss stand im Durchgang. title = Titel (DUNGEON_TITLES in content/dungeon-e4b.js).
export const DUNGEON_FEATS={
 nachsatz:{name:'Der Nachsatz zählt',boss:'bigb',check:'noLieHits',icon:'trait-lie',
  note:'Big B besiegt, ohne dass dich eine gelogene Kanonenkugel getroffen hat.'},
 beweislast:{name:'Beweislast',boss:'bigb',check:'allEvidence',icon:'lens',title:'mieterschuetzer',
  note:'Big B mit allen drei Beweisen am Thron besiegt. Unterschrieben hat er trotzdem nichts.'},
 stempelkarte:{name:'Stempelkarte voll',check:'seals',icon:'seal',note:'Alle Siegel an einem Tag. Der Stempel ist aus Kartoffel, zählt aber.'},
 termin:{name:'Termin eingehalten',boss:'bigb',check:'fast',seconds:2700,icon:'clock',note:'Schloss Big B in unter 45 Minuten abgeschlossen. Big B kommt sonst zu spät zu seinem eigenen Termin.'},
 kratzer:{name:'Ohne Kratzer',boss:'bigb',check:'noDeath',icon:'role-heal',note:'Schloss Big B abgeschlossen, ohne einmal am Boden zu liegen. Die Söldner zählen nicht, die sind versichert.'},
 halbgesehen:{name:'Halb gesehen',check:'seen',seen:'halbespferd',icon:'star',note:'Das halbe Pferd im Stall gesehen. Die andere Hälfte auch. Glaubt dir nur keiner.'}
};


// Texte (Story nimmt ab oder ersetzt; Ton E-20: erst die Behauptung, dann der Nachsatz).
export const DUNGEON_TEXT={
 enter:'Schloss Big B betreten',leave:'Zurück auf die Burgstraße',entranceName:'Schloss Big B',entranceSign:'SCHLOSS BIG B · PRIVATBESITZ · EINTRITT 20 €',
 tooLow:level=>'Big B lässt erst ab Stufe '+level+' rein. Sagt er. Die Tür ist aus Pappe, aber trotzdem.',
 busy:'Nicht jetzt. Erst den Kampf zu Ende bringen.',
 welcome:'Schloss Big B. Die Garage riecht nach Laminat und Größenwahn.',
 outside:'Zurück auf der Burgstraße. Die Burg ist immer noch eine Garage.',
 lootGathered:n=>n+' liegengebliebene Beutebeutel eingesammelt.',
 // Dungeon-Fix 4 (Nachprüfung #726): die eingesammelte Beute als kurze Meldung nach dem Übergang, mit dem, was drin war
 lootGatheredShort:(items,coins)=>'Eingesammelt: '+[items?items+(items===1?' Teil':' Teile'):'',coins?coins+' Pfandmarken':''].filter(Boolean).join(' · '),
 // Dungeon-Fix 4: Rollenspiel-Einleitung (DUNGEON_BOSSES.bigb.intro) – F am Thron, Zeile „Kampfbeginn“ in der Warnleiste
 // Dungeon-Fix 5 (Prüfer #728): der Timer zeigt das Ende der Rede – danach wartet Big B, bis der Held angreift oder ganz nah herangeht
 intro:{address:'Big B ansprechen',pull:'Angreifbar in',pullNote:'Big B hält noch seine Rede. Danach wartet er auf dem Thron, bis du angreifst oder ganz nah herangehst. Erst dann fällt die Tür zu.'},
 step:{stairs:'Treppe',ladder:'Leiter',shaft:'Lichtschacht',spiral:'Wendeltreppe',lift:'Getränkeaufzug',pappwand:'Pappwand'},
 floorTo:{e0:'zum Burghof',k1:'ins Rittergeschoss',k2:'ins Basaltgewölbe'},up:'hoch',down:'runter',
 ladder:{a:'hoch aufs Carport-Dach',b:'runter in den Hof'},
 locked:{gate:'Die Kette hängt noch. Gerd hat den Schlüssel. Und das Klemmbrett.',oneWay:'Da kommt man nur runter. Rauf braucht man Flügel oder eine Leiter.',
  lift:'Der Getränkeaufzug ist abgeschlossen. „Nur für Lieferanten." Von unten gibt es einen Hebel.',secret:'Da ist nur eine Wand. Sieht jedenfalls so aus.',
  seals:(n,m=3)=>'Die Tresortür hat '+m+' Siegelfelder. '+n+' von '+m+' sind belegt.',boss:'Zu. Erst Big B.'},
 unlocked:{lift:'Hebel umgelegt. Der Getränkeaufzug fährt jetzt in beide Richtungen.',pappwand:'Die Wand ist aus Pappe. Dahinter: eine Wendeltreppe. Natürlich.'},
 secretUse:{pappwand:'Pappwand eindrücken'},
 arenaClosed:'Die Tür fällt zu. Klemmbrett sagt: kein Durchgang.',arenaOpen:'Die Tür geht wieder auf.',
 wipe:room=>'Alle am Boden. Zurück zum Kontrollpunkt '+room+'. Der Trash bleibt liegen.',
 ghost:'Du liegst. Deine Söldner kämpfen weiter.',wipeAll:'Alle am Boden. Die Gegner gehen zurück auf ihre Plätze.',
 revived:n=>n+' hat dir aufgeholfen.',stoodUp:'Du rappelst dich auf. Der Kampf ist vorbei.',resumed:'Der Durchgang läuft weiter. Du stehst am letzten Kontrollpunkt.',
 lootMoment:{title:n=>'Beute · '+n,marks:'Siegelmarken',marksNote:'Währung des Schlosses gegen Beutepech. Vermieter Volker tauscht sie später gegen Beute.',
  xp:'Erfahrung',daily:'Tagesbonus',dailyNote:'Erster Abschluss dieses Flügels heute: mehr Erfahrung und Siegelmarken.',keep:'Nichts wird angelegt: vergleichen und selbst anlegen.'},
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
   defeat:'Der Stempel … nehmt ihn. Ich stempel sowieso nur Luft.'},
  // Etappe 3: Sprüche aus Plan 7.6 (Story nimmt ab). ritaDown = 70 %, wenn Reichweiten-Rita schon liegt (Etappe 4).
  bigb:{engage:'Willkommen auf Schloss Big B! Erbaut 1648 von meinem Opa. Also, der Carport. Das Schloss kommt noch.',
   phases:{'0.7':'Meine Follower! Zwei Millionen! Die hier sind die, die heute Zeit hatten.',
    '0.4':'Ich bin mal auf einer Kanonenkugel nach Mayen geritten. Und zurück. Den Schlüssel hatte ich vergessen.'},
   ritaDown:'Rita? RITA! … Ich mach das Live selbst.',
   confess:'Okay. Das Schloss ist eine Garage. Die Garage ist gemietet. Die Kette ist Kronkorken. Und den Titel hab ich auf der Kirmes geschossen.',
   defeat:'Schnitt. Das nehmen wir nochmal.',
   // Ausreden beim Vorlegen der Beweise am Thron (Etappe 4 baut das Vorlegen)
   excuses:{mietvertrag:'Das ist ein Pachtvertrag. Bis zur Schlossübernahme.',leihschein:'Der Mantel ist geleast. Das ist wie gekauft, nur ehrlicher.',
    kirmesurkunde:'Adelstitel werden heute eben anders verliehen. Mit Luftgewehr.'}},
  // Etappe 4 Teil A: Sprüche aus Plan 7.2–7.5 (Entwurf im Ton E-20, Story nimmt ab). Neu von Teil A: defeat-Zeilen und Pferd/Rita-Kleinkram.
  expose:{engage:'Traumlage! Südhang! Also, Südkeller. Mit Tageslicht, wenn man die Tür aufmacht.',
   phases:{'0.5':'Tag der offenen Tür! Die Interessenten sind nicht bestellt. Die sind nur zufällig alle hier.',
    '0.2':'Notartermin! Der Notar ist mein Cousin. Er ist Notar für Kleingärten.',
    '0.15':'Provision ist trotzdem fällig. Steht im Kleingedruckten. Das Kleingedruckte hab ich heute Morgen geschrieben.'},
   sold:'VERKAUFT! Die Wohnung ist weg. Ihr auch. Raus.',
   defeat:'Das Siegel … nehmt es. Es ist aus Kartoffel. Die Unterschrift gilt trotzdem.'},
  korkenkurt:{engage:'Das ist ein 1998er. Der Karton ist von 1998. Der Wein ist von Dienstag.',
   phases:{'0.5':'Verkostung! Spucken ist erlaubt. Schlucken ist schneller.',
    '0.2':'Die Sprinkler sind nur Deko! … Hat Big B gesagt.',
    '0.15':'Ist Tetrapak. Aus der Pfalz. Ich hab’s nur umgefüllt. Mit Liebe.'},
   defeat:'Das Siegel … aus Korken. Mit Kerzenwachs. Der Aufzug geht jetzt auch von unten.'},
  rita:{engage:'Ihr seid live! … Vor drei Leuten. Zwei davon sind meine Mutter.',
   phases:{'0.5':'Big B sagt, ich bin gefeuert. Per Sprachnachricht. Aus dem Nebenraum.',
    '0.15':'Okay. Hier ist seine Pressemappe. Die Urkunde ist von der Kirmes. Ich hab sie gerahmt.'},
   defeat:'Offline. Endlich. Das erste Wochenende seit 2019.'},
  halbespferd:{engage:'Es säuft und säuft. Es kommt hinten alles wieder raus. Es gibt kein Hinten.',
   defeat:'Das halbe Pferd legt sich hin. Die andere Hälfte hat es nie gegeben.'}},
 // Etappe 4 Teil A: Kampftexte der neuen Merkmale (kurz, Großbuchstaben wie HAUSVERBOT).
 e4a:{signed:n=>'UNTERSCHRIEBEN ×'+n,sold:'VERKAUFT!',stamp:'STEMPEL',blind:'GEBLENDET',hidden:'GREENSCREEN',drink:'SÄUFT',wet:'NASS',
  shared:n=>'GETEILT /'+n,fled:'FLIEHT',soldOut:'Frau Dr. Exposé hat verkauft. Ihr steht wieder in der Ahnengalerie.',mount:n=>'Reittier: '+n+'!'},
 // Etappe 3: Kampftexte der neuen Merkmale (kurz, Großbuchstaben wie HAUSVERBOT) und das Ende des Dungeons.
 bigb:{enrage:'DIE GANZE WAHRHEIT',interrupts:(n,m)=>'UNTERBROCHEN '+n+'/'+m,selfHeal:'SELBST RAUSGEZOGEN',reach:'REICHWEITE',
  confess:'GESTÄNDNIS',lieHit:'GELOGEN'},
 chest:{name:'Endtruhe öffnen',title:'Endtruhe · Thronsaal',label:'Endtruhe',labelNote:'Rechtsklick oder F: drei seltene Teile, eins davon nimmst du mit.',pick:'Wähl ein Teil. Die anderen zwei nimmt Big B mit. Sagt er.',
  pickNote:'Ein Teil nach Wahl, dazu Siegelmarken. Einmal je Durchgang.',empty:'Die Truhe ist leer. Big B hat den Deckel mitgenommen.',
  locked:'Zu. Erst Big B.',
  // Dungeon-Fix 4 (Nachprüfung #726: beim Verlassen ohne Wahl nahm das Spiel still das erste Teil): Rückfrage im Beutefenster der Truhe
  leaveAsk:'Noch nichts gewählt',leaveAskNote:'Wähl ein Teil, dann geht es hinaus. Gehst du trotzdem, packst du das erste ein.',
  leaveTaken:n=>'Endtruhe: '+n+' eingepackt.'},
 backExit:'Hinterausgang · zurück auf die Burgstraße',backExitLabel:'Hinterausgang',backExitNote:'In der Schatzkammer am Südende des Thronsaals, unter dem grünen Schild. Rechtsklick oder F: zurück auf die Burgstraße.',
 feat:n=>'Erfolg: '+n,
 cleared:(t)=>'Schloss Big B abgeschlossen in '+t+'. Das Schloss war eine Garage. Die Garage bleibt.',
 repeatXp:'Heute schon besiegt: ein Drittel der Erfahrung.',
 map:{title:'Big Bs Schlossplan',prospect:'laut Prospekt',visited:'erkundet',you:'du',seals:'Siegel',checkpoint:'Kontrollpunkt',floors:'Ebenen',
  hint:'Unerkundete Räume zeigt die Karte, wie Big B sie beschreibt. Wer hingeht, sieht die Wahrheit.'}
};
