# Kampf, Talente und Sichtbarkeit · 2026-09-17

Umgesetzt nach bestätigtem Nutzerauftrag (E-25), auf Basis von `413df1a`.

## Bedienung

- Linksklick, Tab, Zielbutton und Antippen wählen ein Ziel, ohne einen ausgeschalteten Autoangriff zu starten.
- Rechtsklick auf einen Gegner startet den Autoangriff und lässt ihn bei weiteren Rechtsklicks eingeschaltet. Rechtsklick auf den Boden bleibt ein Laufbefehl.
- Taste 1 und der belegbare Angriffsbutton schalten an/aus. Der Touchbutton zeigt seinen Zustand auch über `aria-pressed`.
- Offensiver Kniff startet den Angriff. Bei offensiven Bodenfähigkeiten geschieht das erst nach gültiger Platzierung, sofern ein lebendes Ziel ausgewählt ist. Heilende Zonen starten keinen Angriff.
- Esc beendet nach den bestehenden Prioritäten (Zauber, Zielen, Fenster). Zielverlust und Tod beenden den Angriff. Reichweite, Sichtlinie, Bewegung beim Fernkampf und Waffen-Timer bleiben erhalten; Umschalten beschleunigt die Waffe nicht.

## Vollständige Proc-Anbindung

- Deckelwirtschaft zählt erfolgreiche Grundangriffe und löst bei jedem dritten aus; Frisch gewischt bei jeder zweiten direkten Heilung. Benannte HUD-Zähler zeigen den Fortschritt.
- Rücklaufleitung und Provision vom Schmerz heilen über `markedHit` anhand des tatsächlich verursachten Schadens, einschließlich tödlicher Treffer und ohne Heilung für überschüssigen Schaden.
- Hinterher, Gut gekühlt, Kurzer Hausbesuch, Doppelte Sicherung und Nachladen im Rennen verkürzen die jeweilige Abklingzeit um 3 Sekunden; Schritt voraus verkürzt Ausweichen um 2 Sekunden. Eine nur verkürzte Abklingzeit meldet nicht fälschlich „bereit“.
- `dash` unterscheidet den eingesetzten Ausweichschritt vom tatsächlich vermiedenen Treffer (`dodge`); letzterer löst weiterhin Fangschuss aus.
- Perfekter Upload nutzt `beat`; Letzter Ausschank nutzt `inZone` mit erfolgreichem Grundangriff innerhalb einer aktiven eigenen Fasszone.
- Klassendaten steuern jetzt Startwerte, Schadensminderung, Parade-Heilung, Taktfenster und Unterbrechungsboni. Klassenwechsel und Respawn löschen alte Proc-Fenster und Zähler.
- Schema, Inhaltsbeschreibungen und abgeleitete Tooltip-Zahlen unterstützen die neuen Regeln. Bestehende Talent-IDs bleiben erhalten.

## Grafik

Der gesamte Baum einschließlich unterer Äste und Stamm wird auf 28 % Deckkraft gesetzt, wenn Spieler oder ausgewähltes Ziel dahinter stehen. Vor dem Baum bleibt er deckend. Der Canvas-Zustand wird nach dem Zeichnen wiederhergestellt. Die Rahmenbreite des Clan-Schilds wird aus der gemessenen Schriftbreite plus Innenabstand berechnet, damit „POO-TANG · MERTLOCH“ hineinpasst. Die Schildfläche bleibt für andere Namensbeschriftungen gesperrt.

## Abnahme

- `npm test`: 353 Tests bestanden.
- `npm run content:check`: Inhaltsvalidierung und 46 Tests bestanden.
- `npm run build`: GitHub-Pages-Build erfolgreich; Offline-Manifest aktualisiert.
- `node scripts/combat-integration-check.mjs`: tatsächliche Maus-/Touch-Eingaben bei 1440×900, 390×844 und 844×390; passive Zielwahl, Ein/Aus, Rechtsklick und Esc; keine Browser-Ausnahmen.
- Canvas-Pixelprüfung mit echtem Baum-Asset: Deckkraftverhältnis für Krone und unteren Stamm jeweils rund 0,278. Screenshots aller drei Ansichten geprüft. Reproduzierbare lokale Bilder und Prüfergebnisse liegen nach dem Browserlauf unter `combat-review/integration/` (git-ignoriert).

Händler/Handwerk sowie ein neuer vollständiger Akt-1-Playtest bleiben auf Nutzerwunsch zurückgestellt. Der Browserlauf ersetzt keinen Test auf physischer Handy-Hardware.
