export const PANEL_UI={
 chooseReward:'Dieses Teil nehmen',rewardTouch:'1 von 3 Ausrüstungsteilen',lootTouch:'Beute in Reichweite.',lootHelp:'Einzelne Stapel oder alles nehmen. Bei vollem Rucksack bleibt der Rest liegen.',pages:'Seiten',previous:'Vorherige Seite',next:'Nächste Seite',sections:'Abschnitte durchblättern',previousSection:'Vorheriger Abschnitt',nextSection:'Nächster Abschnitt',
 equipment:'Ausrüstung',stats:'Werte',manage:'Verwalten',skills:'Kniffe',binding:'Belegung',help:'Bedienhilfe',clanDetails:'Persönlichkeit & Spielweise',talentHelp:'Talentbaum erklären und Punkte verwalten',
 questDetails:'Auftrag lesen',equip:'Anlegen',compare:'Vergleich',story:'Geschichte',slots:'Plätze',options:'Optionen',map:'Karte',places:'Orte',destination:'Ziel',legend:'Legende',reset:'Neustart',backup:'Sicherung',
 upperTalents:'Obere Talente',lowerTalents:'Untere Talente',upperTree:'Wurzel & Äste',lowerTree:'Äste & Abschluss',pending:'gewählt',
 inspection:'Gegenstand',detail:'Details',movement:'Steuerung',combat:'Kampf',world:'Dorf',figure:'Figur',
 book:'Clanbuch',bookTabs:'Clanbuch-Reiter',tabFigure:'Figur',tabBag:'Rucksack',tabSkills:'Kniffe',tabQuests:'Aufträge',tabBase:'Bude',tabMemories:'Erinnerungen',tabMap:'Karte',tabHelp:'Hilfe',talents:'Talente',band:'Bande',settings:'Einstellungen',
 memoryHidden:'Noch nichts. Da ist nur Rauschen und ein pelziger Nachgeschmack.',
 settingsIntro:'Steuerung, App, Ton und Vollbild. Ganz unten der Admin-Neustart mit Sicherung.'
};
export const PLAY_HELP={
 desktop:[
  ['Bewegen & Ziel',['WASD läuft, Rechtsklick plant den Weg.','Tab wählt nahe Gegner; Shift + Tab geht zurück.','F spricht, plündert und bedient Auftragsziele.','Klick auf den Auftragskasten läuft zur Wegmarke.']],
  ['Kämpfen',['1–0 nutzt deine Kniffe; Autoangriffe folgen dem Waffentempo.','Zum Zaubern stehen bleiben; normale Kniffe teilen eine Abklingzeit.','LEER weicht aus, Q unterbricht – beide unabhängig von der Leiste.']],
  ['Clanbuch',['Ein Buch, sieben Reiter: Figur, Rucksack, Kniffe, Aufträge, Bude, Karte, Hilfe.','C I K J B M H öffnen den Reiter; dieselbe Taste oder Esc schließt.','Menüs halten den Kampf nicht an.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Pegel, Glanz, Druck: dasselbe Prinzip unter drei Namen – jeder Clan-Stil baut damit Eskalation auf und verballert sie im großen Kniff.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert mit 1–0.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 touch:[
  ['Bewegen & Ziel',['Links mit dem Joystick laufen.','Ziel wählt einen nahen Gegner.','Aktion spricht, plündert und bedient Auftragsziele.','Tipp auf den Auftragskasten läuft zur Wegmarke.']],
  ['Kämpfen',['Rechts liegen deine Kniffe; 1 / 2 wechselt die Seite.','Zum Zaubern stehen bleiben; Autoangriffe treffen auch beim Laufen.','Stiefel weicht aus, Hand unterbricht – eigene Sonderknöpfe.']],
  ['Clanbuch',['Menü öffnet das Clanbuch; oben die sieben Reiter; unter „Bude“ Basisbau und Erinnerungen.','× schließt; der Kampf läuft weiter.','Hilfe → Steuerung: Platz wählen, dann einen gelernten Kniff zuweisen.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Pegel, Glanz, Druck: dasselbe Prinzip unter drei Namen – jeder Clan-Stil baut damit Eskalation auf und verballert sie im großen Kniff.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert über die Knöpfe rechts.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 desktopKeys:[
  ['WASD / Rechtsklick','Laufen / Laufweg'],['Tab / Shift + Tab','Nächstes / voriges nahes Ziel'],['F / Shift + F','Interagieren / Beutel ganz leeren'],
  ['1–0 / LEER / Q','Kniffe / Ausweichen / Unterbrechen'],['C / I / K','Figur / Rucksack / Kniffe'],['J / M / H','Aufträge / Karte / Hilfe'],
  ['N / R','Talente (Reiter Figur) / Aggro-Radius'],['Esc','Buch schließen; ohne Buch: Hilfe öffnen'],
  ['Leeres Feld → Kniff','Direkt auf der Aktionsleiste belegen'],['Kniff ziehen / Rechtsklick auf Feld','Belegen / leeren'],['Item doppelklicken','Passende Ausrüstung austauschen'],
  ['Item anklicken','Details, Platzwahl und Vergleich'],['Talent rechtsklicken','Punkt zurücknehmen, wenn kein Folgetalent abhängt']
 ],
 touchKeys:[
  ['Joystick / Ziel / Aktion','Laufen / Gegner wählen / interagieren'],['Kniff antippen / lange halten','Ausführen / Erklärung'],['Menü → Steuerung','Kampfbuttons belegen, Größe einstellen'],
  ['Gegenstand antippen','Details, Ausrüsten und Vergleich'],['Talent antippen','Erklärung und Lernen / Zurücknehmen'],['×','Clanbuch schließen'],
  ['Karte → Orte → Ziel','Laufroute setzen'],['Hofprobe: Pfeil / ?','Hinweis ausklappen / Idas Anleitung']
 ],
 symbols:[
  'Goldrand im Skillbuch: gelernt, noch nicht auf der Leiste.',
  'Stern: Talentfähigkeit. Leuchten im Kampf: günstiger Einsatzmoment.',
  'Talente: gelernte Vorgänger öffnen Äste; tiefere Knoten benötigen verteilte Punkte.'
 ]
};
