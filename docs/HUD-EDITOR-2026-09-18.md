# UI bearbeiten und Effektleisten · 2026-09-18

Nutzerauftrag: Oberfläche nach dem Bearbeitungsmodus von WoW Retail einrichten können, einschließlich Buff- und Debuffleisten und mobiler Bedienung. Referenz für Verschieben, Skalieren, Raster und Layoutkopien: [Blizzards Beschreibung des überarbeiteten HUD](https://worldofwarcraft.blizzard.com/de-de/news/23841481/world-of-warcraft-dragonflight-hud-and-ui-revamp).

## Bedienung

- **F10** oder **Hilfe → Einstellungen → UI bearbeiten** öffnet den Editor. Mobil: Menü → Hilfe → Einstellungen. Die Welt pausiert; Joystick und gehaltene Bewegung werden freigegeben.
- Blaue Rahmen ziehen oder ein Element in der Liste auswählen. Pfeiltasten verschieben um einen Pixel, Umschalt + Pfeiltaste um acht. Die Pfeilknöpfe und ein optionales 8-Pixel-Raster stehen auch auf Touch bereit.
- Größe auf dem Desktop 75–150 %, mobil 100–150 %, damit Touchflächen nicht verkleinert werden. Der Bildschirm begrenzt übergroße Elemente zusätzlich.
- Bis zu zehn benannte Layouts, Kopieren, Löschen, ausgewähltes Element oder die Anpassungen des aktuellen Bildschirmformats zurücksetzen. Desktop, Hochkant und Querformat haben getrennte Positionen innerhalb desselben Layouts.
- **Speichern** übernimmt den Entwurf. **Abbrechen / Esc / F10** stellt den vorherigen Stand wieder her. Bei einem Speicherfehler bleibt der Entwurf zum erneuten Speichern offen.
- Auf Touch sind die Optionen zunächst eingeklappt. Das Bedienfeld lässt sich an der Überschrift verschieben; die Optionen lassen sich scrollen. Speichern und Abbrechen bleiben erreichbar.
- Leere Effektleisten, Ziel- und Zauberfenster bekommen im Editor einen Platzhalterrahmen. Die Platzhalter erzeugen keine Spielzustände.

Verschiebbar sind Spieler, Ziel, Buffs, Debuffs, Ziel-Debuffs, Zauberleiste, Kampfstatistik, Hofprobe sowie die vorhandenen Desktop- oder Touch-Steuerelemente. Die Seiten des Clanbuchs behalten ihre eigene Fensterlogik. Das Kampfstatistikfenster lässt sich nach einer Layoutänderung weiter an seiner Titelleiste verschieben.

## Effekte und Speicherung

`auras.js` liest den bestehenden Kampfzustand. Grün: eigene Stärkungen, Procs, Deckung und Klassenmechaniken. Rot: eigene negative Effekte, aktuell der Kater. Gold: Markierung und Kontrolleffekte auf dem gewählten lebenden Gegner. Es werden keine zusätzlichen negativen Spielmechaniken eingeführt.

Die Icons zeigen verbleibende Sekunden, Stapel oder verbleibende Schildwerte. Maus, Tastaturfokus und Antippen öffnen die Erklärung. Ablauf, Verbrauch, Zielwechsel und Tod entfernen veraltete Anzeigen. Leisten ohne aktive Effekte sind außerhalb des Editors ausgeblendet. Die Aktualisierung erfolgt fünfmal pro Sekunde anhand der Spielzeit; pausierte Zeit läuft nicht heimlich weiter.

Layoutdaten liegen separat unter `mertloch-hud-layouts-v1` im lokalen Browser. Koordinaten sind relativ zum verfügbaren Platz, mit Bildschirmrändern und Safe Areas. Vorhandene Spielstände und IDs bleiben unverändert. Ohne Anpassungen gelten die bisherigen HUD-Positionen. Beim Wechsel der Joystickseite werden Standardpositionen gespiegelt; ausdrücklich im Editor gesetzte Positionen bleiben bestehen.

## Prüfumfang

- `tests/hud-layout.test.mjs`: beschädigte Einstellungen, Kontexttrennung, Skalengrenzen, Raster und Bildschirmgeometrie.
- `tests/auras.test.mjs`: reale Kampfzustände, Kater-Erzeugung und Ablauf, Procs, Zielwechsel, Tod/Respawn, lesender Zugriff bei allen neun Spezialisierungen.
- `npm run hud:check`: echte Maus- und Touch-Ereignisse für Verschieben, Skalieren, Speichern/Neuladen, Abbrechen, Profile, Speicherfehler, Menüeinstieg, Meter-Anbindung, Rotation, Safe Areas, Effekt-Tooltips und Joystick nach einer Layoutänderung. Screenshots und Ergebnisse unter `visual-review/hud/`; auch Bestandteil der Pages-Pipeline.
- Bestehende Spiel-, UI-, Meter- und Mobile-Prüfungen laufen zusätzlich. Die UI-Prüfung berücksichtigt die inzwischen 30 Talentangebote pro Spezialisierung mit zehn gleichzeitig gelernten Talenten.

Diese automatisierten Browserprüfungen sind kein neuer unabhängiger Persona-Playtest und ersetzen keine Prüfung auf physischen iOS-/Android-Geräten.

Lokaler Abnahmestand: 458 Spieltests grün; nach Übernahme des letzten Engine-Updates zusätzlich 70 betroffene Klassen-/Kampf-/Inhaltstests grün. Browser: 9 HUD-, 13 UI-, 9 Meter- und 8 PWA-Prüfgruppen sowie alle 98 Mobile-Schritte bestanden. Die HUD-Prüfung verwendet echte Maus-, Tastatur- und Touch-Ereignisse einschließlich Pfeiltasten, Scrollen und anschließendem Spielen mit verschobenem Joystick.
