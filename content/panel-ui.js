export const PANEL_UI={slotEmptyNote:'Noch nichts angelegt. Zieh ein passendes Teil aus dem Rucksack hierher oder klick es dort doppelt an.',slotReservedNote:'Die Zweihandwaffe braucht beide Hände.',barReset:'Leiste auf Standardbelegung gesetzt.',barResetButton:'Leiste: Standardbelegung',specBlocked:'Die Spezialisierung wechselst du nur am Clan-Treff und außerhalb des Kampfes. Der Knopf bringt dich hin und wechselt direkt.',specGoHome:'Zum Clan-Treff und wechseln',
 gearBody:'Körperausrüstung',gearAccessories:'Schmuck & Glücksbringer',gearWeapons:'Waffen',turnFigure:'Ansicht drehen',changeFigure:'Figur wechseln',equippedFigure:'Figur mit angelegter Ausrüstung',
 chooseReward:'Dieses Teil nehmen',rewardTouch:'1 von 3 Ausrüstungsteilen',lootTouch:'Beute in Reichweite.',lootHelp:'Einzelne Stapel oder alles nehmen. Bei vollem Rucksack bleibt der Rest liegen.',pages:'Seiten',previous:'Vorherige Seite',next:'Nächste Seite',sections:'Abschnitte durchblättern',previousSection:'Vorheriger Abschnitt',nextSection:'Nächster Abschnitt',
 equipment:'Ausrüstung',stats:'Werte',manage:'Verwalten',skills:'Kniffe',binding:'Belegung',help:'Bedienhilfe',clanDetails:'Persönlichkeit & Spielweise',talentHelp:'Talentbaum erklären und Punkte verwalten',
 questDetails:'Auftrag lesen',equip:'Anlegen',compare:'Vergleich',story:'Geschichte',slots:'Plätze',options:'Optionen',map:'Karte',places:'Orte',destination:'Ziel',legend:'Legende',reset:'Neustart',backup:'Sicherung',
 upperTalents:'Obere Talente',lowerTalents:'Untere Talente',upperTree:'Wurzel & Äste',lowerTree:'Äste & Abschluss',pending:'gewählt',
 inspection:'Gegenstand',detail:'Details',movement:'Steuerung',combat:'Kampf',world:'Dorf',figure:'Figur',
 book:'Fenster',bookTabs:'Abschnitte',tabFigure:'Figur',tabBag:'Rucksack',tabSkills:'Kniffe',tabQuests:'Aufträge',tabBase:'Bude',tabMemories:'Erinnerungen',tabMap:'Karte',tabHelp:'Hilfe',talents:'Talente',band:'Bande',settings:'Einstellungen',
 memoryHidden:'Noch nichts. Da ist nur Rauschen und ein pelziger Nachgeschmack.',
 settingsIntro:'Steuerung, App, Ton und Vollbild. Ganz unten der Admin-Neustart mit Sicherung.'
};
export const PLAY_HELP={
 desktop:[
  ['Bewegen & Ziel',['WASD läuft, Rechtsklick plant den Weg.','Tab wählt nahe Gegner; Shift + Tab geht zurück.','F spricht, plündert und bedient Auftragsziele.','Klick auf den Auftragskasten läuft zur Wegmarke.']],
  ['Kämpfen',['1–0 nutzt deine Kniffe; Autoangriffe folgen dem Waffentempo.','Der Angriffsbutton schaltet ein/aus; Rechtsklick auf einen Gegner startet, Linksklick und Tab wählen nur aus. Esc beendet den Angriff nach offenen Fenstern.','Zum Zaubern stehen bleiben; normale Kniffe teilen eine Abklingzeit.','LEER weicht aus, Q unterbricht – beide unabhängig von der Leiste.']],
  ['Rucksack & Beute',['Shift über einem Tooltip zeigt die Details: warum das Ding taugt und was die Fachwörter heißen.','Verpflegung ziehst du aus dem Rucksack auf einen freien Platz der Aktionsleiste.','Auto-Loot: Beute landet beim Kill direkt im Rucksack, das Beutelog zeigt sie an.','Ist der Rucksack voll, wartet der Rest unter „Ausrüstung zurückholen“ im Rucksack.']],
  ['Fenster',['Jede Seite ist ein eigenes Fenster: links Figur und Aufträge, rechts Rucksack und Kniffe, mittig Talente, die Karte fast bildschirmgroß.','C, J, I, P, N, M und H öffnen und schließen ihr Fenster; B springt in den Aufträgen zur Bude. Esc schließt das oberste.','Menüs halten den Kampf nicht an.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert mit 1–0.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 touch:[
  ['Bewegen & Ziel',['Mit dem Joystick laufen; die Seite lässt sich unter Einstellungen umstellen.','Ziel wählt einen nahen Gegner.','Aktion spricht, plündert und bedient Auftragsziele.','Tipp auf den Auftragskasten läuft zur Wegmarke.']],
  ['Kämpfen',['Die Kniffbuttons liegen gegenüber vom Joystick; die Seitenanzeige wechselt bei Bedarf zur zweiten Belegung.','Gegner antippen wählt nur das Ziel. Autoangriff antippen schaltet ein, erneut antippen schaltet aus; offensive Kniffe starten ihn ebenfalls.','Zum Zaubern stehen bleiben; Autoangriffe treffen auch beim Laufen.','Stiefel weicht aus, Hand unterbricht – eigene Sonderknöpfe.']],
  ['Rucksack & Beute',['„Mehr dazu“ im Tooltip zeigt die Details: warum das Ding taugt und was die Fachwörter heißen.','Verpflegung benutzt du im Rucksack über die Gegenstandsdetails.','Auto-Loot: Beute landet beim Kill direkt im Rucksack, das Beutelog zeigt sie an.','Ist der Rucksack voll, wartet der Rest unter „Ausrüstung zurückholen“ im Rucksack.']],
  ['Fenster',['Menü → Fenster: Figur, Aufträge, Talente, Karte, Kniffe, Rucksack und Hilfe öffnen je ein eigenes Fenster. Bude und Erinnerungen stehen unter Aufträge.','× schließt; der Kampf läuft weiter.','Hilfe → Einstellungen → Steuerung & Touchbuttons: Platz wählen, dann einen gelernten Kniff zuweisen.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert über deine Kniffbuttons.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 desktopKeys:[
  ['WASD / Rechtsklick','Laufen / Laufweg'],['Tab / Shift + Tab','Nächstes / voriges nahes Ziel'],['F / Shift + F','Interagieren / Beutel ganz leeren'],
  ['1–0 / Umschalt + 1–0 / LEER / Q','Leiste 1 / Leiste 2 / Ausweichen / Unterbrechen'],['C / P / N','Figur / Kniffe / Talente – jedes ein eigenes Fenster'],['I / J / M / H','Rucksack / Aufträge / Karte / Hilfe'],
  ['X / Shift + P','Auf-/Absitzen / Mount-Sammlung'],['B','Bude (Abschnitt der Aufträge)'],['V','Kampfstatistik'],['R','Aggro-Radius'],['1 / Esc','Autoangriff ein/aus / Autoangriff beenden'],['Esc','Spielmenü öffnen; schließt zuerst Fenster oder bricht Zielen/Zaubern ab'],
  ['Leeres Feld → Kniff','Direkt auf der Aktionsleiste belegen'],['Kniff ziehen / neben die Leiste ziehen','Belegen oder verschieben / abnehmen'],['Maus auf Feld + B / Rechtsklick auf Feld','Taste belegen (auch Mausrad und Seitentasten) / Feldmenü'],['Item doppelklicken','Passende Ausrüstung austauschen'],
  ['Verpflegung ziehen','Rucksack → freier Platz der Aktionsleiste'],['Shift über einem Tooltip','Details, Zusammenhänge und Fachwörter'],
  ['Item anklicken','Details, Platzwahl und Vergleich'],['Talent rechtsklicken','Punkt zurücknehmen, wenn kein Folgetalent abhängt']
 ],
 touchKeys:[
  ['Joystick / Ziel / Aktion','Laufen / Gegner wählen / interagieren'],['Kniff antippen / lange halten','Ausführen / Erklärung'],['Hilfe → Einstellungen → Steuerung & Touchbuttons','Kampfbuttons belegen, Größe einstellen'],
  ['Gegenstand antippen','Details, Ausrüsten und Vergleich'],['Tooltip → Mehr dazu','Zusammenhänge und Fachwörter'],['Verpflegung benutzen','Rucksack → Gegenstand → Benutzen'],['Talent antippen','Erklärung und Lernen / Zurücknehmen'],['×','Fenster schließen'],
  ['Karte → Orte → Ziel','Laufroute setzen'],['Hofprobe: Pfeil / ?','Hinweis ausklappen / Idas Anleitung']
 ],
 symbols:[
  'Goldrand im Skillbuch: gelernt, noch nicht auf der Leiste.',
  'Stern: Talentfähigkeit. Leuchten im Kampf: günstiger Einsatzmoment.',
  'Talente: gelernte Vorgänger öffnen Äste; tiefere Knoten benötigen verteilte Punkte.'
 ]
};

export const GAME_MENU_UI={professions:'Berufe',professionsKey:'Shift + B',title:'Spielmenü',open:'Spielmenü öffnen',resume:'Zurück zum Spiel',book:'Fenster',chat:'Chat',help:'Hilfe',settings:'Einstellungen'};

/** Rucksack (E-53): Filter, Sortierung, Suche und Vergleich. Filter- und Sortierwahl merkt sich der Browser. */
export const BAG_UI={
 slots:'Plätze',coins:'Pfandmarken',
 search:'Suchen',searchPlaceholder:'Name, Art, Güte oder Wert …',searchLabel:'Rucksack durchsuchen',
 noMatch:'Hier passt gerade nichts zu Suche und Filter.',
 filterLabel:'Rucksack filtern',
 filters:[['all','Alles'],['gear','Ausrüstung'],['better','Besser'],['food','Verpflegung'],['material','Material']],
 filterHints:{all:'Alles zeigen',gear:'Nur Ausrüstung',better:'Nur Teile, die einen freien Platz füllen oder besser sind als das Angelegte',food:'Nur Verpflegung',material:'Nur Material und Auftragsgegenstände'},
 sortLabel:'Reihenfolge',sortButton:'Sortieren',sortHint:'Stapel zusammenlegen und den Rucksack in dieser Reihenfolge ordnen',
 sortModes:[['kind','Art'],['rarity','Güte'],['level','Stufe'],['name','Name'],['better','Verbesserung zuerst']],
 sorted:'Rucksack sortiert: ',
 kindNames:{consumable:'Verpflegung',material:'Material'},
 compare:'Vergleich',compareFree:'Platz frei',compareNone:'Keine spürbare Änderung.',compareLevel:'Werte wirken erst ab Stufe ',
 statEffects:'wirkt auf',
 compareStats:'Werte',perHit:'Ø je Treffer',perSecond:'Schaden/s',lifeTotal:'gesamt',
 weaponWords:'Waffe Waffenschaden Tempo Schaden',
 equipped:(name,slot)=>'Angelegt: '+name+' · '+slot
};
/** Kniffe-Buch, Abschnitt „Eigenarten & Leisten“ (passive-book.js): nur Kachelbeschriftungen – Erklärungen stehen im Tooltip. */
export const PASSIVE_BOOK_UI={title:'Eigenarten & Leisten',classTitle:()=>'Eigenart',classScope:'Klasse · immer',active:()=>'Hauptbaum · aktiv',withMain:name=>'mit '+name};
/** Quest-Tracker unter dem Auftragsfeld (quest-tracker.js, Nutzerwunsch 2026-09-23). */
export const QUEST_TRACKER_UI={track:'Klick: verfolgen (Wegmarke)',run:'Klick: zur Wegmarke laufen',talkTo:name=>'Sprich mit '+name,turnIn:name=>'Abgabe bei '+name,actDone:'Akt abgeschlossen',reward:'Belohnung',moreTitle:'Weitere Aufträge (Auftragsbuch J)'};
/** Einzelfenster (2026-09-23, löst das Clanbuch mit Reitern ab): [id, Name, Symbol, Taste, Andockseite].
 *  Reihenfolge = Menüleiste unten rechts und Touch-Menü. left/right docken am Rand an, center mittig, full fast Vollbild. */
export const WINDOW_UI={
 windows:[['person','Figur','person','C','left'],['quest','Aufträge','quest','J','left'],['talents','Talente','talents','N','center'],['map','Karte','map','M','full'],['book','Kniffe','book','P','right'],['bag','Rucksack','bag','I','right'],['guide','Hilfe','guide','H','center']],
 notes:{person:'Ausrüstung und Werte deiner Figur.',quest:'Aufträge, Bude und Erinnerungen.',talents:'Talentbäume und Hauptbaum.',map:'Revierplan mit Orten und Laufweg.',book:'Skillbuch und Aktionsleiste.',bag:'Rucksack, Filter und Suche.',guide:'Tasten, Kniffe erklärt, Einstellungen.'},
 rail:'Fenster',close:'Schließen [Esc]',keyHint:key=>'Taste '+key+' öffnet und schließt',
 open:name=>name+' öffnen',
 /** Symbole statt Beschriftungen in den Fenstern; Namen erscheinen als Tooltip. */
 compact:{
  statIcons:{stamina:'ui-stat-stamina',might:'ui-stat-might',finesse:'ui-stat-finesse',wit:'ui-stat-wit',armorRating:'ui-stat-armor'},
  sectionIcons:{'Aufträge':'quest','Bude':'base','Erinnerungen':'ui-sec-erinnerungen'},
  questFilters:{active:'ui-quest-aktiv',open:'ui-quest-dorf',done:'ui-quest-erledigt'},
  bagFilters:{all:'bag',gear:'ui-filter-ausruestung',better:'ui-filter-besser',food:'ui-filter-verpflegung',material:'ui-filter-material'},
  mapFilters:{all:'map',quest:'ui-quest-aktiv',hub:'ui-map-treffpunkt',camp:'ui-map-lager',shop:'ui-map-laden'},
  baseRuined:'Bude in Trümmern',memoryUnknown:'Noch keine Erinnerung'
 }
};
