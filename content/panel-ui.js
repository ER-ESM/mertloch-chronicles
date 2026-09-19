export const PANEL_UI={barReset:'Leiste auf Standardbelegung gesetzt.',barResetButton:'Leiste: Standardbelegung',specBlocked:'Die Spezialisierung wechselst du nur am Clan-Treff und außerhalb des Kampfes. Der Knopf bringt dich hin und wechselt direkt.',specGoHome:'Zum Clan-Treff und wechseln',
 starterHint:'Tab wählt nur ein Ziel, [1] schaltet den Autoangriff ein/aus (auch per Touchbutton), [2] nutzt den ersten Kniff. Mit [LEER] weichst du aus. Sprich zuerst mit Ida [F]. Weitere Kniffe kommen nach und nach.',
 gearBody:'Körperausrüstung',gearAccessories:'Schmuck & Glücksbringer',gearWeapons:'Waffen',turnFigure:'Ansicht drehen',changeFigure:'Figur wechseln',equippedFigure:'Figur mit angelegter Ausrüstung',
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
  ['Kämpfen',['1–0 nutzt deine Kniffe; Autoangriffe folgen dem Waffentempo.','Der Angriffsbutton schaltet ein/aus; Rechtsklick auf einen Gegner startet, Linksklick und Tab wählen nur aus. Esc beendet den Angriff nach offenen Fenstern.','Zum Zaubern stehen bleiben; normale Kniffe teilen eine Abklingzeit.','LEER weicht aus, Q unterbricht – beide unabhängig von der Leiste.']],
  ['Rucksack & Beute',['Shift über einem Tooltip zeigt die Details: warum das Ding taugt und was die Fachwörter heißen.','Verpflegung ziehst du aus dem Rucksack auf einen freien Platz der Aktionsleiste.','Auto-Loot: Beute landet beim Kill direkt im Rucksack, das Beutelog zeigt sie an.','Ist der Rucksack voll, wartet der Rest unter „Ausrüstung zurückholen“ im Rucksack.']],
  ['Clanbuch',['Vier Reiter: Figur, Rucksack, Aufträge und Karte; daneben das Hilfe-Symbol.','C, I, J und M öffnen die vier Reiter; H öffnet Hilfe. K und N springen in der Figur zu Kniffen und Talenten, B in den Aufträgen zur Bude. Esc schließt.','Menüs halten den Kampf nicht an.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Pegel, Glanz, Druck: dasselbe Prinzip unter drei Namen – jeder Clan-Stil baut damit Eskalation auf und verballert sie im großen Kniff.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert mit 1–0.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 touch:[
  ['Bewegen & Ziel',['Mit dem Joystick laufen; die Seite lässt sich unter Einstellungen umstellen.','Ziel wählt einen nahen Gegner.','Aktion spricht, plündert und bedient Auftragsziele.','Tipp auf den Auftragskasten läuft zur Wegmarke.']],
  ['Kämpfen',['Die Kniffbuttons liegen gegenüber vom Joystick; die Seitenanzeige wechselt bei Bedarf zur zweiten Belegung.','Gegner antippen wählt nur das Ziel. Autoangriff antippen schaltet ein, erneut antippen schaltet aus; offensive Kniffe starten ihn ebenfalls.','Zum Zaubern stehen bleiben; Autoangriffe treffen auch beim Laufen.','Stiefel weicht aus, Hand unterbricht – eigene Sonderknöpfe.']],
  ['Rucksack & Beute',['„Mehr dazu“ im Tooltip zeigt die Details: warum das Ding taugt und was die Fachwörter heißen.','Verpflegung benutzt du im Rucksack über die Gegenstandsdetails.','Auto-Loot: Beute landet beim Kill direkt im Rucksack, das Beutelog zeigt sie an.','Ist der Rucksack voll, wartet der Rest unter „Ausrüstung zurückholen“ im Rucksack.']],
  ['Clanbuch',['Menü → Clanbuch öffnet die Reiter: Figur, Rucksack, Aufträge und Karte plus Hilfe. Kniffe und Talente stehen unter Figur; Bude und Erinnerungen unter Aufträge.','× schließt; der Kampf läuft weiter.','Hilfe → Einstellungen → Steuerung & Touchbuttons: Platz wählen, dann einen gelernten Kniff zuweisen.']],
  ['Wörter im Dorf',['Randale: dein Kraftstoff – Kniffe kosten sie, Kills und Kaltgetränke füllen sie nach.','Pegel, Glanz, Druck: dasselbe Prinzip unter drei Namen – jeder Clan-Stil baut damit Eskalation auf und verballert sie im großen Kniff.','Kniffe: deine Fähigkeiten, gelernt im Skillbuch, gelegt auf die Leiste, abgefeuert über deine Kniffbuttons.','Klamotten: die Ersatzsachen deines Mentors – sie entscheiden, wie du kämpfst, nicht wie du riechst.','Pfandmarken: das Geld von Mertloch – Leergut, Beute und Kalle rechnen alle in derselben Währung.']]
 ],
 desktopKeys:[
  ['WASD / Rechtsklick','Laufen / Laufweg'],['Tab / Shift + Tab','Nächstes / voriges nahes Ziel'],['F / Shift + F','Interagieren / Beutel ganz leeren'],
  ['1–0 / LEER / Q','Kniffe / Ausweichen / Unterbrechen'],['C / I / K','Figur / Rucksack / Kniffe'],['J / M / H','Aufträge / Karte / Hilfe'],
  ['K / N / B','Kniffe / Talente / Bude – zum Abschnitt springen'],['V','Kampfstatistik'],['R','Aggro-Radius'],['1 / Esc','Autoangriff ein/aus / Autoangriff beenden'],['Esc / P','Spielmenü öffnen; Esc schließt zuerst Fenster oder bricht Zielen/Zaubern ab'],
  ['Leeres Feld → Kniff','Direkt auf der Aktionsleiste belegen'],['Kniff ziehen / Rechtsklick auf Feld','Belegen / leeren'],['Item doppelklicken','Passende Ausrüstung austauschen'],
  ['Verpflegung ziehen','Rucksack → freier Platz der Aktionsleiste'],['Shift über einem Tooltip','Details, Zusammenhänge und Fachwörter'],
  ['Item anklicken','Details, Platzwahl und Vergleich'],['Talent rechtsklicken','Punkt zurücknehmen, wenn kein Folgetalent abhängt']
 ],
 touchKeys:[
  ['Joystick / Ziel / Aktion','Laufen / Gegner wählen / interagieren'],['Kniff antippen / lange halten','Ausführen / Erklärung'],['Hilfe → Einstellungen → Steuerung & Touchbuttons','Kampfbuttons belegen, Größe einstellen'],
  ['Gegenstand antippen','Details, Ausrüsten und Vergleich'],['Tooltip → Mehr dazu','Zusammenhänge und Fachwörter'],['Verpflegung benutzen','Rucksack → Gegenstand → Benutzen'],['Talent antippen','Erklärung und Lernen / Zurücknehmen'],['×','Clanbuch schließen'],
  ['Karte → Orte → Ziel','Laufroute setzen'],['Hofprobe: Pfeil / ?','Hinweis ausklappen / Idas Anleitung']
 ],
 symbols:[
  'Goldrand im Skillbuch: gelernt, noch nicht auf der Leiste.',
  'Stern: Talentfähigkeit. Leuchten im Kampf: günstiger Einsatzmoment.',
  'Talente: gelernte Vorgänger öffnen Äste; tiefere Knoten benötigen verteilte Punkte.'
 ]
};

export const GAME_MENU_UI={title:'Spielmenü',open:'Spielmenü öffnen',resume:'Zurück zum Spiel',book:'Clanbuch',help:'Hilfe',settings:'Einstellungen'};
