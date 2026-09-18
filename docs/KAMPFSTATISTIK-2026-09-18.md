# Kampfstatistik · Damage- und Heal-Meter

Nutzerauftrag: ein Meter nach dem Vorbild von Details aus WoW. Eigenständige Umsetzung für das bestehende Einzelspielerspiel; keine übernommenen Addon-Dateien oder erfundenen Gruppenmitglieder. Referenz für die Aufteilung nach Schaden, Heilung und Kampfsegmenten: [Details!](https://github.com/Tercioo/Details-Damage-Meter).

## Bedienung

- Desktop: **V** oder **Kampfstatistik** neben dem Clanbuch. Titelleiste zum Verschieben, × oder Esc zum Einklappen.
- Desktop und Handy: **Figur → Werte → Kampfstatistik**, alternativ **Hilfe → Einstellungen → Kampfstatistik**.
- Schaden/Heilung umschalten. Die Auswahl bietet aktuellen bzw. letzten Kampf, die letzten zehn abgeschlossenen Kämpfe und Gesamtwerte der laufenden Sitzung.
- Figur wählen → sortierte Fähigkeitsbalken. Fähigkeit wählen → wirksamer Wert, Anteil, Trefferzahl, Durchschnitt, größter Treffer, kritische Treffer bei Schaden, Überheilung bzw. Überschaden.
- Zurücksetzen fragt innerhalb des Fensters nach. Es löscht ausschließlich die Statistik; Fortschritt und laufender Kampf bleiben bestehen.

## Messregeln

Die Erfassung erfolgt direkt bei den tatsächlichen Schadens- und Heilberechnungen, nicht durch Auslesen des Bildschirms oder des Textlogs. Es entstehen nur begrenzte Summen je Figur und Fähigkeit, kein unbegrenztes Ereignisarchiv.

- Schaden = tatsächlich abgezogene Gegner-Lebenspunkte; Überschaden eines tödlichen Treffers erscheint gesondert. Kritische Treffer stammen aus derselben ausgewürfelten Entscheidung wie der echte Schaden. Die Statistik zieht keine zusätzlichen Zufallszahlen.
- Heilung = wiederhergestellte Lebenspunkte. Überheilung wird gesondert gezählt, auch bei vollständig verpuffter Heilung. Direkte Heilung, Heilung über Zeit, Heilzonen, Lebensraub, Parade, Kill-Heilung, Talent-Procs und Verpflegung werden erfasst. Die bereits gemeinsam berechnete Heilung aus Markierungen/Infusion bleibt eine gemeinsame Quelle; der bestehende gemeinsame HoT bleibt „Heilung über Zeit“.
- Normale Regeneration beim Rasten, Stufenaufstieg, Wiederbelebung und Schildvergabe zählen nicht als Heilung. Heilung außerhalb des Kampfes startet kein Segment. Die Hofprobe benutzt eine eigene Übungsschadensregel und liefert keine echten Schadensereignisse an das Meter; Arena-Gegner werden dagegen erfasst und als Training gekennzeichnet.
- Kampfzeit folgt der Simulationszeit vom Kampfbeginn bis zum Ende des vorhandenen Kampfstatus, einschließlich seines Auslaufens. Tod schließt sofort ab. Versteckte/pausierte Spiele erhöhen die Zeit nicht. DPS/HPS = wirksamer Wert / Kampfzeit, mit mindestens einer Sekunde je Segment.
- Gesamt-DPS/HPS verwendet die Summe der Segmentzeiten einschließlich des laufenden Segments, ohne Pausen zwischen Kämpfen. Ältere Kämpfe fallen aus der Zehner-Historie, ihre Werte bleiben in der Sitzungssumme. Figurenwechsel bleiben als getrennte Zeilen nachvollziehbar.
- Daten sind absichtlich sitzungsbezogen und landen nicht im Spielstand. Ein Neuladen bzw. Spielneustart startet eine neue Messung. Einklappen stoppt die Erfassung nicht.

## Oberfläche und Mobilgeräte

Die Anzeige aktualisiert höchstens viermal pro Sekunde. Geschlossene Anzeigen erzeugen keine Balkenupdates. Auswahlfelder und Zeilen werden bei Zahlenänderungen weiterverwendet. Touch-Ziele haben mindestens 44 px; Abstände sind 8 px. Hochkant liegt die Anzeige über den Kampfbuttons, quer im freien Bereich dazwischen; Links-/Rechtshandmodus und Safe Areas werden aus der aktuellen Oberfläche ermittelt. Der Inhalt scrollt innerhalb des Fensters, die Schließen-Schaltfläche bleibt erreichbar. Neue Touch-Dialoge und der Todesdialog klappen die Anzeige ein.

## Prüfungen

- `tests/combat-meter.test.mjs`: echte Engine-Schäden/Heilungen, Überschaden, Überheilung, Quellen, Zeitberechnung, Klassenwechsel, begrenzte Historie, Sitzungssumme, Reset, Tod, Wiederbelebung, Pause und unverändertes Speicherformat.
- `npm run meter:check`: eigene Browserinstanz, echte Maus-/Toucheingaben, Schadens-/Heildetails, Reset-Abbruch und Bestätigung, laufender Autoangriff, Bewegung mit offenem Meter, physisch simulierte Joystickeingabe, Bildschirmrotation und kleine Displays. Ergebnisse/Screenshots: `visual-review/meter/`.
- `npm run ui:check`, `npm run mobile:check`, `npm run pwa:check` und `npm test`: bestehende Regressionen und Offline-Paketierung.

Die Meter-Browserprüfung läuft zusätzlich in GitHub Actions. Neue Module, Texte und CSS werden vom vorhandenen Build automatisch in das versionierte Offline-Paket aufgenommen. Echte iOS-/Android-Geräte bleiben wie bisher eine ausstehende Abnahme.

Lokaler Abschluss: **424/424 Modultests**, **46/46 Inhaltstests**, **7/7 Meter-Browsergruppen**, **13/13 UI-Gruppen** und **8/8 Offline-/Updategruppen** bestanden. Die große Geräteprüfung deckte 98 Schritte ab: 92 Mobile-/Sitzungs-/Format-Schritte bestanden, im Desktop-Teil fiel ein bereits vorhandener heller Fähigkeitslink auf Papphintergrund mit 2,7:1 Kontrast auf. Die Textfarbe in `bierdeckel.css` wurde abgedunkelt; die sechs betroffenen Desktop-Schritte bestanden beim gezielten Wiederholungslauf vollständig (`visual-review/mobile-check/REPORT-desktop.md`). Keine Laufzeitfehler.

Der erste allgemeine UI-Lauf teilte versehentlich den lokalen Serverport mit dem gleichzeitig laufenden Meter-Check. Nach Vergabe eines eigenen Meter-Serverports bestand der vollständige UI-Lauf. Das war ein Testaufbaufehler, kein übersprungener Produktbefund.

Nachprüfung: Die Schaden-/Heilungsschalter stehen fest außerhalb des scrollbaren Inhalts, damit sie keine Zahlen überlagern. Der parallel veröffentlichte Kampftext-Commit `152913d` wurde übernommen; **41/41 Kampf-/Meter-Integrationstests**, **7/7 Meter-Browsergruppen** und der Produktionsbuild bestehen auch zusammen mit den neuen Kampftexten. Die vollständige Modulsuite wurde für die Layoutkorrektur erneut mit **424/424** bestanden.
