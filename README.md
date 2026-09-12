# Mertloch Chronicles — Poo-Tang-Clan

**[Direkt im Browser spielen](https://er-esm.github.io/mertloch-chronicles/)** · [GitHub-Repository](https://github.com/ER-ESM/mertloch-chronicles)

Auf PC und Handy ohne Installation spielbar. Fortschritt liegt im lokalen Browserspeicher des jeweiligen Geräts. Die Online-Adresse hat einen eigenen Spielstand; der bisherige localhost-Spielstand bleibt erhalten. Es gibt noch keine geräteübergreifende Synchronisierung oder Mehrspieler-Verbindung. Unterwegs auf dem Handy: Joystick links, große Skillbuttons rechts. Über „Menü“ erreichst du Karte, Inventar, Steuerung und App-Installation.

Spielbarer Browser-Prototyp eines 2D-Pixel-Rollenspiels mit regelbasiert gestalteter Geografie und Tab-Target-Kampf. Der Start liegt bei **St. Gangolf in 56753 Mertloch**. Kein Paketdownload erforderlich; Node.js 20 oder neuer genügt.

## Starten

```powershell
cd D:\Dev\MertlochChronicles
npm start
```

Im Browser **http://localhost:4173** öffnen. `Start-Spiel.cmd` startet den Server ebenfalls per Doppelklick. Server beenden: Strg+C. Bei belegtem Port in PowerShell beispielsweise `$env:PORT=4174; npm start` verwenden und den entsprechenden Port öffnen. `index.html` benötigt wegen der lokalen Module und Kartendaten einen HTTP-Server; Doppelklick auf die HTML-Datei genügt nicht.

## Online veröffentlichen

GitHub Actions prüft Änderungen auf `main` mit `npm test`, baut mit `npm run build` die statische Website in `_site/` und veröffentlicht sie auf GitHub Pages. Pull Requests werden geprüft, aber nicht veröffentlicht. Der Pages-Build enthält Anwendung, lokale Grafikdateien und die Mertloch-Karte. Quellcode, Entwicklungsskripte und aktuelle Prüfberichte stehen im Repository; alte große Screenshot-Sammlungen bleiben lokale Arbeitsdateien.

Im Repository unter **Settings → Pages → Source** ist **GitHub Actions** vorgesehen. Der Workflow kann über **Actions → Test and publish game → Run workflow** erneut ausgeführt werden. Ein eigener Server, API-Schlüssel oder kostenpflichtiger Hostingdienst ist für das Spiel nicht nötig. Kartenzuschreibungen bleiben im Kartenmenü sichtbar; Grafikquellen und Herkunft stehen in den jeweiligen `assets/`-Ordnern.

## Inhaltsschicht `content/`

Items, Beute, Gegner, Bosse, Fähigkeiten, Klassen, Talente, Quests, NPCs, Dialoge, Story und alle Balancing-Zahlen liegen seit dem Umbau als reine Daten in [`content/`](content/README.md). Die Engine liest sie über `content/index.js`; ein eigener Inhalts-Agent (`.claude/agents/inhalt-agent.md`) kann dort arbeiten, ohne Oberfläche oder Renderer anzufassen.

- **Neu im Umland (ab 900 Welteinheiten vom Treffpunkt):** Leergut-Rabe, Pfandfuchs, Festzelt-Schnorrer und Ordnungsamt-Praktikant mit eigenen Angriffsmustern und Beute; selten der Elite-Keiler **Borsten-Bruno**. Der Dorfkern behält Dachs, Gans, Keiler und Ruhewart.
- **Neue Gegenstände:** Currywurst und Kaltgetränk als Verpflegung, vier Materialien, drei seltene Ausrüstungsteile, fünf weitere Dorflegenden mit zwei neuen Effekten (Kill gibt Randale, doppelte Erholung).
- **Zwölf Quest-Vorlagen** statt sechs, seedabhängig verteilt, mit eigenen Gesprächszeilen je Fortschritt. Bosse haben Phasen-Sprüche im Kampflog.
- **Vorbereitet:** Story-Kapitel 2 (Gisela Gießkanne) und 3 (Der Pfandautomat 3000) mit Bossen, Zaubern, Dialogen und Belohnungen – warten auf Lager und Kapitelumschalter (siehe `content/BACKLOG.md`).
- Prüfen: `npm run content:check`, Balance-Matrix `npm run content:balance` → [content/BALANCE-REPORT.md](content/BALANCE-REPORT.md), Grafik-Briefing `npm run content:art` → [content/ART-BRIEF.md](content/ART-BRIEF.md).

## Neu in 0.14 · Ausrüstung, Handy & App

- **16 Ausrüstungsplätze:** Haupt-/Nebenhand, Fernkampf, Kopf, Hals, Schultern, Brust, Armschienen, Handschuhe, Gürtel, Beine, Schuhe, zwei Ringe und zwei Glücksbringer.
- **Echte Waffenwahl:** zwei Einhandwaffen, eine Zweihandwaffe oder Einhand + Schild. Waffen haben zufällige Schadensspannen und gegebenenfalls Zusatzwerte; die Spannen verändern passende Skills. Nebenhandwaffen tragen 50 % ihres Schadens bei.
- **Waffenvoraussetzungen:** Schildparaden verlangen einen Schild, Fernkampfangriffe eine Fernkampfwaffe, Tresensprung Zweihand oder zwei Einhandwaffen. Fehlende Ausrüstung wird am Skill und im Tooltip angezeigt.
- **Gezielter Austausch:** Inventar → Gegenstand → Platz wählen, auch für beide Ringe/Glücksbringer. Zweihandwechsel vergleichen beide abgelegten Teile und sind bei vollem Rucksack verlustfrei abgesichert. Die einmalige Clankiste im Charakterfenster gibt am Treffpunkt kostenlose Testwaffen.

[Ausrüstungsregeln, Migration und Prüfergebnisse](EQUIPMENT.md).


- **Automatischer Touch-Modus** für Smartphones und Tablets, manuell umschaltbar unter Menü → Steuerung.
- **Analoger Joystick links**, sechs große Skillbuttons rechts, zwei belegbare Seiten. Ausweichen, Unterbrechen, Zielwechsel und Interaktion haben eigene Knöpfe. Laufen und Skills funktionieren mit zwei Fingern gleichzeitig.
- **Eigene Touchbelegung pro Figur**, unabhängig von der Desktop-Leiste. Platz wählen, Fähigkeit antippen; Größe ändern oder Belegung zurücksetzen. Lange auf einen Skillbutton drücken öffnet die Erklärung.
- **Kompaktes Kontextmenü** statt dauerhaft sichtbarer Menüleisten, Minimap und Questkästen. Fenster lassen Bewegung und Kämpfe weiterlaufen; Hoch-/Querformat und Displayaussparungen werden berücksichtigt.
- **Installierbare Web-App** mit eigenem Symbol und Start ohne Adressleiste. Menü → Als App. Auf iOS erfolgt die Installation über Safari → Teilen → Zum Home-Bildschirm; die Systemleiste kann sichtbar bleiben.
- **Offline-Start nach vollständigem Laden** von Welt und Grafiken. Neue Versionen werden erst über „Update laden“ aktiviert, nachdem der Fortschritt gespeichert wurde.

[Bedienung, Installation, Screenshots und Prüfbericht](MOBILE.md). Für die lokale PWA-Vorschau zuerst `npm run build` ausführen. Der Build erzeugt die Cache-Liste aus dem aktuellen Release. Bei der Entwicklung Service-Worker-Bypass in den Browser-Entwicklerwerkzeugen verwenden, um Änderungen direkt zu sehen.

## Neu in 0.13

- **Alle Werte helfen jeder Klasse.** Wumms, Taktgefühl und Bastelgrips tragen gemeinsam zum Kampf bei; Heilung, Schilde, Tempo und Regeneration setzen unterschiedliche Schwerpunkte. Ausrüstung hat Werteprofile ohne Klassenbindung.
- **Drei eigene Spezialisierungen pro Figur, insgesamt 90 Talente.** Dieter beginnt als Tank, Bärbel als Heilerin, Kevin als Fernkämpfer. Deckung, Rausch, Nachheilung, Schadensheilung, Fallen, Magnetanziehung und neue Talentfähigkeiten verändern die Spielweise.
- **39 unterschiedliche Skill-Icons** aus drei eigens erzeugten Comic-Atlanten. Jede Klasse hat zehn Stufenfähigkeiten und drei Fähigkeiten, die ausschließlich ihr jeweiliger Talentbaum freischaltet.
- **Stufen statt separater Trainingsschwellen:** Die fünfte Kernfähigkeit kommt auf Stufe 6. Die Pacing-Simulation erreicht das in 29–33 Minuten; Laufwege, Ausrüstung, Questwahl und Spielweise verändern die tatsächliche Dauer.
- Talentpunkte ab Stufe 2, einer pro Stufe bis maximal zehn. Eigene Builds und Aktionsleisten bleiben pro Figur gespeichert. Beim Update werden die alten gemeinsamen Talentbäume zurückgesetzt; Stufe, Gegenstände und Quests bleiben erhalten.

[Klassen, Freischaltungen und Prüfergebnisse](CLASS-SYSTEM.md) · [Icon-Herkunft und Prompts](assets/clan-skills-013/PROMPTS.md)

## Historisch: Neu in 0.12

- **Clan-Werte und Ausrüstung:** Standfestigkeit, Wumms, Taktgefühl, Bastelgrips, Dicke Haut, Glückstreffer, Drehzahl und Handschrift. Werte verändern Leben, Schaden, Schutz, kritische Treffer, Abklingzeiten und die Wirkung von Markierung/Eskalation. Gegenstände rollen passend zu Stufe, Slot, Qualität und Spezialisierung; ihre Werte bleiben beim Speichern erhalten.
- **Beute nach Gegnerart:** Keilerzähne, Federn und Dachskrallen bei Tieren, Ausrüstung und Pfand bei Menschen. Jeder Beutebestandteil hat eine eigene Wahrscheinlichkeit; ein besiegter Gegner kann leer ausgehen. Fünf seltene „Dorflegenden“ besitzen besondere Effekte.
- **Drei Spezialisierungen:** Tresenbollwerk, Bassrandale und Pfandtechnik mit je zehn Talenten. Ein Startpunkt, danach je 90 Clan-EP ein weiterer, maximal zehn. Frühe Talente haben zwei Ränge und erlauben Schwerpunkte. Kostenloses Umskillen am Clan-Treff.
- **Quest-Ausstattung:** Am Ende jedes Auftrags genau eines von drei Ausrüstungsteilen wählen, eines pro Spezialisierung. Leanders Rhythmusprüfung und Tilos Kabelgedächtnis ergänzen Sammel- und Kampfaufträge. Die Spielstationen werden von der Begegnungsplatzierung freigehalten.
- **Kampf und Bedienung:** Zehn nummerierte Aktionsplätze, ausschließlich Icons und Tasten. Ausweichen und Unterbrechen liegen separat und funktionieren trotz globaler Abklingzeit. Das Skillbuch zeigt Icons mit Tooltips; gelernte, unbelegte Kniffe erhalten einen Goldrand. Leeren Platz anklicken, danach einen Skill: sofort belegt. Ideale Einsatzfenster leuchten auf. Tab bevorzugt nahe, bereits beteiligte Gegner.
- **Neue Angriffe:** Ein gezielter Flaschenwurf und ein per Maus platzierter, verzögert explodierender Flächenangriff. Escape oder Rechtsklick bricht die Platzierung ab. Alle normalen Kniffe teilen eine durch Drehzahl verkürzte globale Abklingzeit von anfangs 1,15 Sekunden.

[Fünf Entwicklungs- und Spieltestrunden sowie zwei Balancing-Runden](PROGRESSION-ITERATIONS.md). Die frühere Aktionsbelegung wird einmal auf das neue Schema umgestellt; Inventar und Fortschritt bleiben erhalten. Aktuelle Browserprüfungen: `scripts/progression-ui-check.mjs`, `scripts/progression-quests.mjs` und `scripts/progression-combat.mjs`.

## Neu in 0.11

Alle Menüs öffnen sich als unabhängige, verschiebbare Fenster direkt in der Welt. Bewegung, Gegner, Kämpfe und Respawns laufen weiter. Rucksack und Charakter passen standardmäßig an die Bildschirmränder; Beute öffnet sich daneben. Die Aktionsleiste bleibt frei.

- **Einzelne Gegenstandsicons:** Maus darüber für Werte, Seltenheit, Anforderungen und Vergleich mit getragener Ausrüstung. Beute stapelweise, Münzen getrennt oder alles zusammen einpacken. **Shift + F** leert den nächsten Beutel sofort.
- **Direkter Tausch:** Rechtsklick, Doppelklick oder Ziehen auf den Charakter. Der alte Gegenstand kommt automatisch in den Rucksack – auch bei vollem Rucksack und im Kampf. Alternativ Gegenstand auswählen und „Austauschen“ anklicken.
- **Komfort:** Rucksack durchsuchen und Stapel sortieren, aktuelle Lebenspunkte und Verpflegungs-Abklingzeit, Skills direkt auf die Aktionsleiste ziehen. Rechtsklick auf einen Aktionsplatz leert ihn.
- **Fenster:** Am Titel verschieben; Position wird gespeichert. **−** minimiert, derselbe Menü-Hotkey öffnet wieder. **Esc** schließt das oberste, **Shift + Esc** alle Fenster. Suchfelder nehmen Texteingaben an, ohne die Figur zu bewegen.
- **Grafik:** 24 neue Comic-Pixelicons, Holzleisten und moosgrüne Oberflächen, passende Tooltips und Fenstersymbole.

[Fünf Iterationen mit Sichtprüfungen und echten Spieltests](POPUP-ITERATIONS.md). [Icon-Atlas und Generierungsquelle](assets/maifeld-ui-011/PROMPTS.md). Browserprüfungen dieser Vorversion: `scripts/popup-ui-check.mjs`, `scripts/popup-playtest.mjs` und `scripts/popup-edge-check.mjs`. Ältere Browser-Skripte dokumentieren die jeweilige Vorversion und erwarten teilweise noch pausierende Dialoge.

## Neu in 0.10

Bildschirmfüllende Spielwelt ohne Webseitenrahmen, langsamere und weichere Bewegung, Dieter ohne losen Bierkasten und überarbeitete Bodenübergänge. Die Spielmenüs sind in die Welt integriert.

- **K:** Skillbuch mit Ziehen oder Auswahl auf acht belegbare Aktionsplätze; Belegung wird pro Clanfigur gespeichert.
- **I / C:** Rucksack mit 24 Plätzen, Gegenstandsvergleich, Verpflegung, Ausrüstung und Charakterverwaltung.
- **F:** Beute bei besiegten Gegnern öffnen und mitnehmen. Restbeute bleibt bei vollem Rucksack liegen.
- **J:** Questlog mit Filtern, Fortschritt, Belohnungen und Kartenverknüpfung.
- **PTC / Esc:** Spielmenü mit Admin-Reset und Wiederherstellung einschließlich Inventar, Beute und Belegungen.

[Zehn dokumentierte Iterationen und Spieltests](RPG-ITERATIONS.md). Automatische Platzierungsregeln und Prüfberichte: `world-dressing.js` und `site-dressing.js`. Neue Spritebearbeitung: [Dieter ohne Kasten](assets/maifeld-rpg/PROMPTS.md).

## Grafikfamilie 0.9

Bäume, Häuser, Clanmitglieder, Dorfbewohner, Gegner, Tiere und Dorfmöbel verwenden die neue Maifeld-Grafikfamilie: Moosgrün, warme Kalksteine, Stroh, Ziegel und eigenständige Comicfiguren. Die Tannen sind unbewegt. Hausgrafiken behalten ihr Seitenverhältnis und orientieren ihren Eingang am bestehenden Türanker. Das HUD ist kompakter; Treffereffekte lassen das Kampfziel sichtbar.

Fünf Browser- und Sichtprüfungsrunden mit Vorher-/Nachherbildern: [VISUAL-REVIEW.md](VISUAL-REVIEW.md). Die [Grafikwerkstatt](graphics-pack.html) und das [Artbook](artbook.html) verwenden dieselben Motive wie das Spiel. Quellen, Bildreferenzen und Imagegen-Prompts: [Maifeld-Assets](assets/maifeld-09/PROMPTS.md).

## Neu in 0.7

- **Admin · Reset** im Spielmenü: Stufe 1, Dosen-Dieter, keine EP/Questfortschritte, zwei Startfähigkeiten. Der vorherige Fortschritt wird einmal lokal gesichert und kann im selben Dialog wiederhergestellt werden. Jeder neue Reset ersetzt diese Sicherung. Gilt für die aktuell geladene Weltvariante und diesen Browser; der lokale Prototyp hat keine Benutzerrollen oder Server-Adminanmeldung.
- **Weltkarte (M):** nummerierte Treffpunkte und Lager, Filter, Zoom, Standortansicht, Routenwahl zum sicheren Lagerrand. Auf kleinen Displays passen Symbol- und Schriftgrößen zur Kartenfläche. Die Minimap zeigt nahe Gefahren, Standort und Wegmarkierung.
- **Frühere Grafikgrundlage:** Tiny Swords aus der älteren CC0-Ausgabe bleibt für Feuer und die Ausweichdarstellung verfügbar. Die sichtbare Welt nutzt seit 0.9 die oben beschriebene Maifeld-Familie. Herkunft/Lizenz des ursprünglichen Packs: [Asset-Provenienz](assets/tiny-swords/README.md).
- Prüfung: `npm test` sowie `scripts/test-admin-atlas.mjs` mit dem lokalen Chrome-Testprofil auf Port 9222. Browsercheck prüft Reset, Neuladen trotz Altspeicherstand, Wiederherstellung, Filter, Zoom, Laufroute und mobile Darstellung; Testprofil-Speicherstände werden abschließend zurückgespielt.

## Spielen

**Neu in 0.6:** kleinere Figuren, breitere und feinere Straßen, ausgestattete Questtreffpunkte und besetzte Außenlager. Automatische Meldungen bleiben am Rand. Die fünf zusätzlichen Spiel- und Verbesserungsrunden mit Screenshots und Bewertung stehen in [POLISH-ITERATIONS.md](POLISH-ITERATIONS.md).

Du startest mit **[1] Grundangriff** und **[LEER] Ausweichen**. Neue Fähigkeiten erscheinen automatisch auf freien Aktionsplätzen. Ihre Erklärungen bleiben unten links, bis du sie bestätigst; **H** öffnet die Anleitung. Ausschlaggebend ist jetzt die Charakterstufe.

| Stufe | Dieter | Bärbel | Kevin |
|---|---|---|---|
| 1 | Angriff, Ausweichen | Angriff, Ausweichen | Angriff, Ausweichen |
| 2 | Dosenmut | Heilung | Dosen-Drohne |
| 3 | Pfandwurf | Heilsamer Refrain | Isolierband |
| 4 | Parade, Unterbrechen | Unterbrechen | Unterbrechen |
| 5 | Markierung | Markierung | Markierung |
| 6 | Eskalation | Eskalation | Eskalation |
| 7 | — | Parade | Parade |
| 8 | Heilung | Plattenwurf | Heilung |
| 9 | Bodenangriff | Bodenangriff | Bodenangriff |

Ausweichen und Unterbrechen haben feste Sonderplätze. Alle anderen Tasten ergeben sich aus deiner frei belegbaren Leiste. Ein Talentbaum kann ab dem fünften verteilten Punkt eine zusätzliche aktive Fähigkeit lehren.

Die zehnsekündigen Buffs: **Dosenmut** senkt Dieters Schaden um 25 %, **Heilsamer Refrain** heilt Bärbel über Zeit, **Isolierband hält** gibt Kevin einen skalierenden Schild. Deckung, Nachklang, Rausch und geladene Angriffe erscheinen kompakt am Spielerfenster.

Der Poo-Tang-Clan ist in Mertloch geboren und geblieben. Beim Fest „Nie wieder Montag“ hat **Ruhe 22:01 e. V.** Grill, Anlage und die letzte Kiste beschlagnahmt. Kisten-Ida schickt euch gegen Grillplatz-Plünderer, Ruhewärter und **Horst Nüchternmann** im Hausordnungs-Panzer. Zur Belohnung gibt es den goldenen Dosenöffner. Auch die sechs Ortsaufträge handeln jetzt von Antikater-Minze, Bollerboxen und Pfandchaos.

Über **C → Figur wechseln** wählst du am Starttreffpunkt eines von drei Clanmitgliedern. Alle haben eigene Grafiken, zehn Stufenfähigkeiten und drei exklusive Talentfähigkeiten; Erfahrung und Aufträge gehören dem gesamten Clan. Ein Wechsel setzt weder Lebenspunkte noch Abklingzeiten zurück.

| Clanmitglied | Spielweise |
|---|---|
| Dosen-Dieter · Tresenbrecher | Nahkampf, Pfandschuld markieren und Bierzelt-Abriss. Erfolgreiche Paraden heilen zusätzlich. |
| Bass-Bärbel · Anlagenchefin | Distanzangriffe im Takt geben zusätzliche Punkte; „Bass bis zum Bauamt“ trifft auch benachbarte Gegner. Achtung: Das erwischt auch neutrale Tiere. |
| Klo-Kevin · Pfandingenieur | Pfandgeschosse auf Distanz, klebrige Verlangsamung und Restmüll-Rakete. Unterbrechungen erzeugen Druck und verkürzen die Raketen-Abklingzeit. |

| Taste | Aktion |
|---|---|
| WASD / Pfeile | Frei bewegen |
| Rechtsklick | Automatische Wegsuche zum angeklickten Punkt |
| Klick auf Gegner | Ziel auswählen |
| Tab / Shift+Tab | Nächstes / vorheriges Ziel in der Nähe |
| 1 | Basisangriff: Punkte und Randale aufbauen |
| 2 | Klassenbuff |
| 3 | Gezielter Flaschenwurf |
| 4 | Zeitlich begrenzte Parade |
| 5 | Markieren: Schaden über Zeit und Eskalation vorbereiten |
| 6 | Eskalation: Punkte und Markierung für hohen Schaden verbrauchen |
| 7 | Bodenangriff wählen, dann Zielpunkt anklicken |
| 8 | Klasseneigenes Konterfrühstück / Heilung |
| 9 / 0 | Zusätzliche frei belegbare Plätze |
| Leertaste | Ausweichbewegung mit kurzem Schutzfenster |
| Q | Gelbe Zauber unterbrechen; unabhängig vom globalen Cooldown |
| F | Mit Bewohnern sprechen / Gegenstände sammeln / Konterbrunnen benutzen |
| M / H | Weltkarte / Kampfhilfe für das gewählte Clanmitglied |
| C | Charakter und Ausrüstung; dort Clanfigur am Treffpunkt wechseln |
| K | Skillbuch und Aktionsbelegung |
| I | Rucksack, Verpflegung und Gegenstandsvergleich |
| J / N | Questlog / Spezialisierung und Talentbaum |
| R | Aggro-Radius des gewählten aggressiven Gegners anzeigen |
| P / Escape | Spielmenü / oberstes Fenster schließen (ohne offene Fenster: Spielmenü) |
| Shift + Escape | Alle Fenster schließen |
| Shift + F | Nächste Beute sofort einpacken |

Mit der Standardbelegung ist die Grundrotation **1 → 1 → 1 → 5 → 6**. Nach dem Umbelegen gelten die Tasten in deiner Aktionsleiste. Bärbel benötigt bei richtigem Timing nur zwei Basisangriffe für drei Punkte. Die Kampfhilfe beschreibt Reichweiten, Zeitfenster und Besonderheiten deiner Figur. Unterbrechungen erhöhen den Folgeschaden für vier Sekunden. Gute Paraden erzeugen zusätzlich Randale und einen Punkt. Rote Flächen werden an einer festen Position angekündigt; verlasse sie rechtzeitig oder weiche im richtigen Moment aus.

Die Aktionsleiste lässt sich anklicken; auf kleinen Displays gibt es ein Bewegungskreuz und Antippen des Bodens für die Wegsuche. Alle Menüs bleiben während des Spiels bedienbar. Nur ein inaktiver Browser-Tab pausiert die Simulation. Sound wird erst über die Noten-Schaltfläche eingeschaltet.

Clanmitglied, Stufe, Erfahrung, Ortsentdeckungen, Haupt- und Nebenquests sowie Dosenöffner werden pro Weltvariante unter einem Schlüssel mit dem Präfix `mertloch-chronicles-v2-` im lokalen Browserspeicher gesichert. Vorhandene Spielstände bleiben kompatibel. Bei jedem Neuladen beginnt die Figur am sicheren Startpunkt; Gegner und Abklingzeiten starten neu. Inventar, gewürfelte Ausrüstung, Pfandmarken, Bodenbeute, Aktionsbelegung, Talente und angebotene Questbelohnungen werden ebenfalls gespeichert. Zum Zurücksetzen gibt es das Admin-Menü mit Sicherung; ein manueller Eingriff in den Browserspeicher ist nicht nötig.

## Begegnungen und Nachschub · Version 0.5

In Version 0.6 sitzen die sechs Nebenquestgeber paarweise an drei Treffpunkten. Im Journal kannst du direkt zum Clan-Treff, Pfandhof oder zur Wegestube laufen. Kampflager stehen auf freien Flächen außerhalb der Wohnpolygone. Die Routen führen zunächst zu einem geschützten Anlaufpunkt; den eigentlichen Kampfplatz betrittst du selbst. Auch am Treffpunkt können Gegner auf der Anreise noch kurz als Kampfstatus nachwirken, neue Angriffe beginnen dort aber nicht.

Die Umgebung wird beim Erkunden regelbasiert bevölkert: Pfanddachse und Grillgut-Gänse sind gelb markiert und neutral. Pfandkeiler und Ruhewärter sind rot markiert und greifen bei Sichtkontakt innerhalb ihrer Aggro-Reichweite an. Alle streifen durch geprüfte Reviere. Neutrale Tiere wehren sich nach einem Treffer. Nach einer begrenzten Verfolgung laufen Gegner sichtbar nach Hause und regenerieren dort.

Respawns haben je nach Gegner unterschiedliche, zufällige Wartezeiten (24–68 Sekunden für Feldbegegnungen, 90–120 Sekunden für Horst). Nachschub benötigt freie Fläche, Abstand zum Spieler und eine kurze Ankunftsphase. In der Nähe eines besiegten Gegners zu warten verhindert dessen Respawn; Weggehen setzt seinen Timer nicht zurück. Zellwechsel behalten tote Gegner und ihre Fristen innerhalb der Sitzung. Offene Menüs lassen diese Zeiten weiterlaufen; inaktive Browser-Tabs pausieren sie.

Das automatische Regelwerk und seine Grenzen stehen in [ENCOUNTERS.md](ENCOUNTERS.md).

## Maifeld-Märchen – Comic-Pixelstil 0.4

Ein eigener Zeichenstil mit Pflaumentinte, Honiglicht, Korallrot, Flussjade und Schieferblau. Gebäude, Baumkronen, Held, Bewohner, Tiere, Gegner und Möbel wurden neu gezeichnet. Geschwungene Schindeldächer, Rosettenfenster, Brot-/Kräuter-/Handwerksschilder, Apfelbäume und Vogelhäuser geben dem Maifeld eigene Motive. Die Darstellung verwendet Konturen, klar getrennte Schattenfarben und gezielt gesetzte Pixel anstelle flächigen Texturrauschens.

Das **[Artbook](http://localhost:4173/artbook.html)** zeigt die Farbpalette und vergrößerte, animierte Originalgrafiken aus denselben Modulen wie das Spiel. Das Regelwerk des Stils steht in [ART-DIRECTION.md](ART-DIRECTION.md). Die Weltschmiede verwendet den Stil automatisch. Baumkronen werden durchsichtig, wenn sie den Spieler oder sein Ziel verdecken; automatische Hinweismeldungen stehen am Bildrand.

## Lebendige Spielwelt

Straßen, Hauszugänge und Kirchplatz werden als gemeinsame Fläche gepflastert. Kurven sind abgerundet; Steine laufen ohne Abschnittsränder durch Kreuzungen. Die Zeichenauflösung wurde auf beiden Achsen verdoppelt, bei gleichem Figuren- und Gebäudemaßstab. Feine Grasstrukturen, Blätter, Dachziegel, Gauben, Efeu, Blumenkästen, Markisen und Brennholz ergänzen die Gebäude.

24 Dorfbewohner und 16 Hühner beziehungsweise Katzen bewegen sich auf geprüften Wegen. Bewohner halten in deiner Nähe an und grüßen gelegentlich. Schmetterlinge, kreisende Vögel, Kaminrauch und die sprudelnde Heilquelle beleben die Umgebung. Diese Bewohner sind dekorativ; Aufträge erhältst du weiterhin bei den markierten Questgebern. Die Szenenansicht der Weltschmiede zeigt dieselbe animierte Welt.

## Weltgenerierung

Die Welt nutzt einen zur Figur passenden Maßstab: größere Häuser, 35 Pixel hohe Türen für einen etwa 26 Pixel hohen Helden, Fachwerkfassaden, Gärten und freie Straßenräume. Die geografische Vorlage darf vereinfacht und versetzt werden. Jeder dargestellte Hauseingang muss erreichbar sein.

Die **[Weltschmiede](http://localhost:4173/world-forge.html)** erzeugt Varianten mit Seed, Baumdichte und Straßenbreite, vergleicht sie mit der OSM-Vorlage und zeigt Navigation sowie Prüfergebnisse. Das gleiche Werkzeug steht mit `npm run world:build` und `npm run world:validate` für automatisierte Builds bereit.

Zusätzlich zur Hauptquest entstehen sechs Nebenquests pro Welt: Sammeln, Jagen, Rhythmusprüfung und Kabelgedächtnis. Sprich mit den Bewohnern bei den goldenen Ausrufezeichen. Das Journal zeigt Ziele auf der Karte und bietet eine berechnete Laufroute. Gegenstände werden vor Ort mit F gesammelt, Belohnungen beim Auftraggeber abgeholt.

Regelwerk, Bedienung, Build-Ausgabe, Grenzen und Prüfverfahren: **[WORLD-GENERATION.md](WORLD-GENERATION.md)**.

## Technischer Umfang und Grenzen

- Eigenständige JavaScript-Module, Canvas 2D, Node-HTTP-Server, keine npm-Abhängigkeiten.
- Straßenachsen und Landmarken aus OSM; Gebäude, Vegetation und Geschichten werden nach einem eigenen Regelwerk gestaltet.
- Aktuell Einzelspieler ohne MMO-Server, Accounts oder Handel. Keine Gebäudeinnenräume, Wirtschaftssimulation, Höhendaten oder unbegrenzten Live-Quests.
- Der geografische Ausschnitt bleibt rund 2 × 2 km groß. Weltweites Streaming und OSM-Multipolygon-Verarbeitung sind noch nicht umgesetzt.
- Die Oberfläche lädt optionale Google Fonts; ohne Internet greifen Systemschriften. Spiel und Kartendaten laufen lokal.

## Prüfung

`npm test` prüft zusätzlich zu Kampf, Kollisionen, Weltgenerierung und Quests alle drei Clanmechaniken, Aggro mit Sichtkontakt, neutrale Gegenwehr, Verfolgungsabbruch, Respawn-Abstände und Zellwechsel. Ein Test simuliert eine ganze Minute freies Umherlaufen und prüft dabei die Kollisionen aller Gegner. `npm run world:validate` erstellt sechs vollständige Welten samt Prüfberichten.

## Daten und Quellen

- [OpenStreetMap-Datenausschnitt](https://api.openstreetmap.org/api/0.6/map?bbox=7.293,50.262,7.321,50.280): Quelle für Grundrisse und geografische Tags.
- [OpenStreetMap-Lizenz und Namensnennung](https://www.openstreetmap.org/copyright): © OpenStreetMap-Mitwirkende. OSM-Daten und abgeleitete Kartendaten stehen unter ODbL 1.0; Namensnennung ist im Spiel und auf der Karte vorhanden.
- [OSM API 0.6](https://wiki.openstreetmap.org/wiki/API_v0.6): Schnittstelle für den Snapshot-Import.
- [Overpass-Ausgabeformate](https://dev.overpass-api.de/output_formats.html): alternativ geeigneter Geometriedienst. Im vorliegenden Import wird die direkte OSM-API verwendet, da Overpass beim Abruf nicht verfügbar war.

Die Rohdaten liegen in `data/mertloch.osm`, die für das Spiel reduzierte Datenbank in `data/mertloch.json`. Bei Weitergabe die OSM-Lizenz und Attribution beibehalten.
