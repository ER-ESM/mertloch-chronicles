# Clan-Fortschritt 0.12 – fünf Iterationen und zwei Balancing-Runden

Die fünf Runden verbinden Implementierung, Sichtprüfung und tatsächliche Browserbedienung. Browserprüfungen laufen in einem separaten Chrome-Profil auf Port 9222 gegen `http://localhost:4173`. Vorhandene Testprofil-Spielstände werden gesichert und danach wiederhergestellt. Fortgeschrittene Kämpfe verwenden ausdrücklich vorbereitete Ausrüstung; Anreise, Zielen, Angriffe, Minispiele und Rückwege werden über die echten Spieloberflächen ausgeführt. Die Diagnose-Schnittstelle ist nur lesbar.

## 1. Werte, Beute und Fortschritt

Ein gemeinsames Wertesystem ersetzt die bisherigen pauschalen Ausrüstungsboni. Gewürfelte Gegenstände speichern ihre Identität und ihre Werte. Jede Gegnerfamilie erhält eine eigene Beutetabelle und eine benannte seltene Besonderheit. Tiere lassen passende Materialien und Talismane fallen; Waffen, Kleidung und Pfandmarken gehören zu menschlichen Gegnern. Leere Beutewürfe erzeugen keinen Beutel.

Drei Spezialisierungen mit jeweils zehn funktionalen Talenten, drei Ausrüstungsangebote pro Quest und gemeinsame Abklingzeiten sind eingebaut. Voraussetzungen, Inventargrenzen, doppelte Belohnungsannahme, Speicherstände und Beutewahrscheinlichkeiten werden auf Spielebene geprüft. [Erste Browseransicht](progression-review/iteration-1/first-pass.jpg).

## 2. Icon-Bedienung und Talentansicht

Skillbuch, nummerierte Leiste und getrennte Sonderaktionen im Browser bedient. Geprüft: Tooltips, freie Plätze anklicken und belegen, natives Ziehen vom Buch auf die Leiste, GCD-Sperre, Ausweichen während des GCD, alle drei Talentbäume, Ausrüsten und Neuladen.

Die erste schmale Ansicht hatte eine zu breite Aktionsleiste durch ältere CSS-Regeln. Die Breiten und Abstände sind korrigiert; Fenster und alle zehn Plätze passen bei 320 und 390 Pixeln sowie auf dem Desktop. [Prüfergebnis](progression-review/iteration-2/checks.json), [Skillbuch](progression-review/iteration-2/icon-book.jpg).

## 3. Abwechslungsreiche Aufträge tatsächlich durchspielen

Frische Bärbel: zu Leander laufen, Auftrag annehmen, Anlage erreichen, drei richtige Takttreffer spielen, zurücklaufen und eines von drei Teilen auswählen. Anschließend dasselbe bei Tilo mit dem Kabelgedächtnis: Symbole merken, nach der Anzeige in der richtigen Reihenfolge eingeben. Beide gewählten Gegenstände angezogen und beide Abschlüsse nach dem Neuladen überprüft.

Der erste Versuch deckte Verfolger direkt an den Spielstationen auf. Die Begegnungsregeln halten deren Umgebung nun frei; am Gerät ziehen Verfolger ab. Die Reise selbst bleibt gefährlich: Vor Tilos Prüfung hatte die Figur 394 von 640 Leben. Minispiele brechen bei Kampf, Entfernung oder Zeitablauf ab, ohne Fortschritt zu verschenken.

Zusätzlich frühe Talente mit zwei Rängen versehen: Zehn Punkte reichen für eine breite Verteilung oder konzentrierte Schwerpunkte. Gespeicherte Rangfolgen werden auf echte Voraussetzungen geprüft.

[Spielprotokoll](progression-review/iteration-3/playtest.json), [Rhythmusprüfung](progression-review/iteration-3/rhythm-start.jpg), [Kabelgedächtnis](progression-review/iteration-3/wires-start.jpg), [Belohnungsauswahl](progression-review/iteration-3/wires-reward-choice.jpg).

## 4. Fernkampf, Bodenangriff und laufender Kampf

Bärbel auf Stufe 3 mit vier gewürfelten seltenen Ausrüstungsteilen und gelernten Fähigkeiten über die Karte zu Grillplatz und Ruhewärtern geführt. Flaschenwurf zum Anlocken, Explosion mit tatsächlichem Mausklick platziert, während des GCD ausgewichen, Zauber mit Q unterbrochen und Tab im Kampf benutzt. Rucksack blieb geöffnet und die Welt lief weiter. Beide Abschnitte überlebt, jeweils zwei Gegner besiegt; Tab blieb bei beteiligten Gegnern.

Ein separater Wiederholungsdurchlauf bestätigt sichtbare Leuchteffekte bei idealen Einsatzfenstern. Der erste Prüfselektor suchte irrtümlich nach `proc-ready` statt der tatsächlich verwendeten Klasse `ready`; die korrigierte Sichtprüfung besteht. Die Reichweitenvorschau für Bodenangriffe berücksichtigt jetzt auch Talentboni.

[Kampfprotokoll](progression-review/iteration-4/combat.json), [Leuchteffekt-Prüfung](progression-review/iteration-4/glow-combat.json), [platzierte Explosion](progression-review/iteration-4/main-wolf-placed-aoe.jpg), [ideales Einsatzfenster](progression-review/iteration-4/main-wolf-ideal-window.jpg), [Ruhewärter besiegt](progression-review/iteration-4/main-cultist-won.jpg).

## 5. Abschließende Bedien- und Speicherprüfung

Alle neuen Hauptfenster bei 320, 390 und 1920 Pixel Breite kontrolliert, zusätzlich die Belohnungsauswahl bei 320, 390 und 1440. Eine Belohnung auf dem schmalen Display mit echtem Pointer-Klick angenommen. Werkzeugtipps für Spezialisierungen nennen nun unmittelbar den Hauptwert; Gegenstände zeigen ihre Gegenstandsstufe. Veraltete Tastenhinweise und ein alter pauschaler Schadensbonus im Itemtext sind korrigiert.

Die Kontrolle der Beute-Zufallsfolge fand eine zu niedrige Obergrenze beim Laden des 32-Bit-Zustands. Diese ist behoben und ein hoher gespeicherter Zustand wird ausdrücklich geprüft. Nicht mehr referenzierte gewürfelte Definitionen werden beim Speichern entfernt. Kein Gegenstandstausch und kein Umskillen heilt die Figur kostenlos.

Tooltips zusätzlich auf berechnete Sichtbarkeit, Größe und Bildschirmgrenzen geprüft; Screenshots allein können durch wechselnden Hover-Inhalt abweichen. Die Sichtprüfung zeigt das gerenderte Tooltip im Pixel-Fensterstil. Kein „Nachschub wartet“-Text über besiegten Gegnern.

[Abschlussprüfung](progression-review/iteration-5/checks.json), [Talentbaum](progression-review/iteration-5/talents-bass.jpg), [schmales Skillbuch](progression-review/iteration-5/book-320.jpg), [schmale Belohnungsauswahl](progression-review/iteration-5/reward-320.jpg), [sichtbares Tooltip](progression-review/iteration-5/tooltip-investigation.jpg).

## Balancing 1: Haltbarkeit und erkennbare Ausrüstungswirkung messen

210 deterministische Kämpfe: sieben Konfigurationen mit jeweils 30 Zufallsstarts. Echte Spielsimulation, stehender Nahkämpfer, keine Verpflegung, kein Kiten und kein Ausweichen. Gelernte Fähigkeiten werden in Rotation benutzt. Damit wird das Risiko des unvorbereiteten Gruppen-Pulls gemessen, keine perfekte menschliche Spielweise.

Ein Startgegner lebte im Mittel 7,79 Sekunden. Drei und zehn gleichzeitig gezogene Gegner waren tödlich. Mit gelernten Fähigkeiten dauerte ein Einzelkampf 5,80 Sekunden; bessere Ausrüstung verkürzte ihn zunächst nur auf 5,55 Sekunden. Das verfehlte den gesetzten Mindestunterschied von zehn Prozent. [Messwerte des ersten Durchgangs](progression-review/balance-1/simulations.json).

## Balancing 2: Ausrüstung spürbarer, Fehler früher gefährlich

Drehzahl erhält eine stärkere Wirkung; der erste Sprungangriff der Keiler kommt früher in ihrer Angriffsfolge. Wieder 210 Kämpfe mit identischen Szenarien:

| Ausrüstung und gelernte Fähigkeiten | Gegner gleichzeitig | Siege / 30 | Ø erster besiegter Gegner | Ø verbleibendes Leben |
|---|---:|---:|---:|---:|
| Start | 1 | 30 | 7,79 s | 449 |
| Start | 3 | 0 | 7,79 s | 0 |
| Start | 10 | 0 | keiner | 0 |
| 400 Clan-EP, Startausrüstung | 1 | 30 | 5,80 s | 489 |
| 400 Clan-EP, vier seltene Teile | 1 | 30 | 5,05 s | 723 |
| 400 Clan-EP, vier seltene Teile | 3 | 30 | 5,98 s | 421 |
| 400 Clan-EP, vier seltene Teile | 10 | 0 | 5,05 s | 0 |

Alle Konfigurationen hier haben Stufe 1; der Unterschied kommt von Skills und Ausrüstung. Besseres Gear verkürzt den Einzelkampf gegenüber demselben Skillstand um rund 13 Prozent, gegenüber einem frischen Start zusammen mit den Skills um rund 35 Prozent. Zehn Startgegner töten nach durchschnittlich 5,45 Sekunden. [Zweiter Messdurchgang](progression-review/balance-2/simulations.json). Die tatsächlichen Browserkämpfe aus Runde 4 ergänzen diese Simulationen.

## Regeln für Itemisierung

| Gegnerfamilie | Material / Andenken | Gewürfelte Ausrüstung | Dorflegende | Pfandmarken |
|---|---:|---:|---:|---:|
| Keiler | 42 % | 8 % | 0,8 % · Hauers letzter Zahn | 0 % |
| Gans | 38 % | 4 % | 0,6 % · Orden der unverschämten Gans | 0 % |
| Dachs | 40 % | 6 % | 0,8 % · Dachsdeckel des Unbeugsamen | 0 % |
| Ruhewart | 32 % | 20 % | 1,2 % · Trillerpfeife der Ruhestörung | 70 % |
| Horst | 50 % | 85 % | 12 % · Horsts endgültige Ablehnung | 90 % |

Unabhängige Würfe; mehrere Bestandteile oder gar keiner sind möglich. Gewürfelte Ausrüstung ist zu 22 Prozent selten, sonst ungewöhnlich. Menschen können zusätzlich zu 15 Prozent eine Brezel tragen. Tiere erhalten ausschließlich Talismane als Ausrüstung, keine angezogenen Westen. Horsts reguläres Andenken ist seine gelochte Hausordnung.

Der Wertesatz kombiniert Stufe, Qualität und eine begrenzte Zufallsspanne. Jeder Gegenstand unterstützt einen Hauptwert, dazu Standfestigkeit und einen von drei Nebenwerten; Westen und Schuhe liefern Rüstung. Ausrüstung bietet keine unbeschränkte additive Schadensreduktion: Dicke Haut, Glückstreffer und Drehzahl haben abnehmenden Zusatznutzen und feste Obergrenzen. Basis-GCD 1,15 Sekunden, mindestens 0,75 Sekunden. Ausweichen und Unterbrechen bleiben unabhängig davon.

## Prüfungen wiederholen

```powershell
npm test
node scripts/balance-clan.mjs 2
node scripts/progression-ui-check.mjs 5
node scripts/progression-quests.mjs
node scripts/progression-combat.mjs
node scripts/progression-combat.mjs glow
```

Browser-Skripte nacheinander ausführen; sie teilen dasselbe dedizierte Testfenster. Automatische Tests: 83 bestanden, darunter 20.000 Beutewürfe. Zwei Balancing-Runden: insgesamt 420 Simulationen. Erfolgreiche Browserprotokolle enthalten keine JavaScript-Ausnahmen. Dies ist überprüftes lokales Prototyp-Balancing; langfristige Spielökonomie und alle möglichen Talent-/Gegenstandskombinationen sind damit nicht vollständig vermessen.
