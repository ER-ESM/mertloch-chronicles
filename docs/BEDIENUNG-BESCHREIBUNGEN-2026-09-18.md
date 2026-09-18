# Bedienung und Beschreibungen · 2026-09-18

Nutzerauftrag: Punkte 1 und 2 des nächsten Basis-Schritts erledigen. Ausgangspunkt ist `52332e3`, einschließlich der inzwischen eingegangenen Mobile- und Menüänderungen. Vor dem Push wurde zusätzlich der parallele Fix-Commit `6bc1d3e` integriert (E-29, unter anderem Touch-Langdruck und frühe Eskalation).

## Änderungen

- **Wiederaufstehen:** Die beim ersten Tod freigeschaltete Erinnerung bleibt gespeichert und unter Aufträge → Erinnerungen zugänglich. Sie öffnet während des Todesablaufs kein weiteres Fenster. Ein Tipp auf Wiederaufstehen führt zurück ins Spiel.
- **Touch-Fenster:** `popup-layout.js` berechnet Breite, Position und maximale Höhe aus Viewport, Safe Areas sowie den tatsächlichen Rechtecken von Joystick, Aktionen und Kniffen. `popup-windows.js` reagiert auf Drehen, Größenänderungen und Handwechsel. Die CSS-Überbrückungen mit festen Seitenabständen und `!important` sind entfernt.
- **Lesbarkeit:** Stempeltext auf dunklem Grund und auf Pappe verwendet passende, getrennte Farben. Desktop-Tooltips, Talentpunkte, Erinnerungen und die Zahlen im Touch-Talentfenster sind eingeschlossen. Zahlenzeilen haben mindestens 12 px große Beschriftungen und Werte.
- **Kniffe:** Feste Kampfzahlen aus den Kurztexten entfernt. Die Zahlenanzeige bleibt aus den vorhandenen Regeln abgeleitet; die Kelle zeigt beispielsweise 200 % Autoschaden. Die Beschreibung erklärt Wirkung und Einsatzmoment. Unzutreffende Hinweise auf Lernstufen und Kevins Reichweite sind korrigiert.
- **Talente:** Alle 90 Talente haben geprüfte Referenzen auf betroffene Kniffe. Tooltips nennen deren Namen und am Desktop die aktuelle Belegung; Touch zeigt keine Tastaturhinweise. Talentbaum und Nachschlagewerk verwenden die abgeleiteten Werte statt historischer Zahlen im Kurztext. Allgemeine passive Talente sind entsprechend gekennzeichnet.
- **Hilfe:** Vier Reiter plus Hilfe, Kniffe/Talente unter Figur und Bude/Erinnerungen unter Aufträge. Tastenkürzel, Touch-Einstellungen, Handwechsel und Verpflegung beschreiben die vorhandene Bedienung.

## Prüfung

- `npm test`: **375/375**, einschließlich fünf neuer Regressionstests für Fenstergeometrie, Handwechsel, dynamische Kampfwerte und Talentbelegungen.
- `npm run content:check`: **46/46** plus Schema- und Verweisprüfung. Neue Prüfregeln erkennen feste Ziffern in `info.effect`/`why` sowie ungültige Talent-Kniff-Referenzen.
- `npm run build`: erfolgreich; `popup-layout.js` ist im Offline-Cache und im statischen Build enthalten.
- `npm run content:balance`: ausgeführt; nach Übernahme von E-29 elf Auffälligkeiten. Die neue frühe Eskalation stammt aus dem parallelen Commit; dieser Auftrag verändert keine Kampfparameter.
- `npm run content:art`: Berichte aus den aktuellen Inhalten neu erzeugt.
- Browserprüfung: **92 Mobile-Schritte ohne Bedienungs-, Layout- oder Kontrastfehler**, dazu **6 Desktop-Schritte ohne Fehler**. Der lange Gesamtlauf erreichte beim anschließenden Desktop-Screenshot einen Chrome-Timeout. Nach Trennung der Browserprozesse wurden Sitzung, Formate und Desktop erneut geprüft: **14/14 Schritte, keine Laufzeitfehler** (`REPORT-sitzung.md`). Insgesamt sind damit alle 98 unterschiedlichen Prüfschritte abgedeckt.

Nach Integration von `6bc1d3e`: erneut **375/375 Tests**, Inhaltsvalidierung und Build erfolgreich; **34/34 Browser-Schritte** für Querformat mit Safe Areas, Handwechsel, Rotation, Tod und Desktop bestanden, keine Laufzeitfehler. Belege: `visual-review/fixes-2026-09-18-rebase/REPORT-quer.md`.

Die Browserprüfung verwendet Headless Chrome mit echten Touch- und Mausereignissen, simulierten Safe Areas und frischen Profilen. Sie prüft jetzt ausdrücklich, dass nach dem Wiederaufstehen kein Dialog verbleibt und die Erinnerung im Tagebuch liegt. Der Test startet die Desktop-Gegenprobe nach den Touch-Rotationen in einem frischen Browserprozess; Aufnahme- und Laufzeitfehler lassen den Test fehlschlagen. Die Desktop-Gegenprobe öffnet Figur, Kniff- und Talent-Tooltips, Aufträge und Hilfe. Kontrastmessungen berücksichtigen Scrollgrenzen und sichtbare, nicht interaktive Tooltips.

Screenshots und Messdaten liegen lokal in `visual-review/fixes-2026-09-18/` (nicht versioniert). Eine Prüfung auf physischen Handys bleibt separat offen. Performance-Messung ist der nächste Basis-Schritt; Händler, Handwerk und neuer Content bleiben zurückgestellt.
