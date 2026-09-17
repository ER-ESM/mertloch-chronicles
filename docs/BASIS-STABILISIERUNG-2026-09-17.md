# Basis-Stabilisierung · 2026-09-17

Nutzerauftrag: Punkte 1–4 vor neuem Content bearbeiten (E-26). Ausgangsstand: `43d6fae`.

## 1. Oberfläche und Touch

- Die Ressourcenreihe bleibt innerhalb des Spielerrahmens. Orts-/Zielanzeige und Buffs berücksichtigen die größere HUD-Höhe.
- Der Desktop-Interaktionshinweis sitzt im Layout oberhalb der Sonderaktionen und überlagert Ausweichen/Unterbrechen nicht mehr.
- Hochformat-Fenster erhalten nutzbare Höhe bis 320×568; im Querformat wird die Breite nicht mehr pauschal um 390 px gekürzt. Der Menübutton überlagert den Schließen-Knopf nicht mehr.
- Touch-Ziele behalten mindestens 44×44 px. Ein langer Druck zeigt die Knifferklärung. Der Abbruchknopf beendet auch einen laufenden Zauber.
- Nach dem Öffnen eines Fensters löst der folgende Browser-Kompatibilitätsklick keine zweite Aktion unter demselben Finger aus. Ein neuer physischer Druck bleibt sofort bedienbar.

## 2. Bewegung und Interaktionen

- Mentoren verwenden dieselben freien, erreichbaren Positionen wie die Weltprüfung. Ida fängt ihre Gespräche nicht mehr wegen zu naher Platzierung ab.
- Ungültige Laufpunkte und Laufbefehle bei Tod/Pause verändern den aktiven Weg nicht. Ein gültiger Laufbefehl bricht einen Zauber sofort ab.
- Joystick-Eingaben löschen auch das bisherige Routenziel. Abbruch und Fokusverlust lösen den Stick; ein endgültig blockierter Weg meldet den Grund.

## 3. Bestehender Kampf

- Mausklick und Zielwechsel überspringen gleichermaßen zurücklaufende oder noch geschützte Gegner.
- Ein auf dem alten Ziel abgeschlossener Zauber startet keinen zuvor ausgeschalteten Autoangriff auf einem inzwischen neu gewählten neutralen Ziel.
- Reichweite, Sichtlinie und gültiges Ziel werden am Zauberende erneut geprüft; ein ungültiger Abschluss verbraucht weder Energie noch die Abklingzeit.
- Schrottkoloss behält das Pfandgeschoss als Fernkampfoption für Druck/Deckung ab Stufe 1. Sein Autoangriff bleibt im Nahkampf. Damit ist der dokumentierte Reichweiten-Blocker behoben; der Balance-Bericht wurde neu erzeugt. Er enthält weiterhin markierte Abweichungen und ist keine vollständige Balance-Freigabe.

## 4. Spielstand und PWA

- Vor einem geänderten Spielstand wird der bisherige lesbare Stand separat gesichert. Beschädigtes JSON bzw. erkannte ungültige Strukturen laden die letzte lesbare Sicherung mit Hinweis.
- Ein unlesbarer Stand ohne Sicherung und Stände einer neueren Save-Version werden nicht automatisch überschrieben. Bestehende Altdaten bleiben migrierbar.
- Ein Update aktiviert den neuen Service Worker erst nach erfolgreichem Speichern. Speicherfehler verhindern das automatische Neuladen; ein erneuter Versuch bleibt möglich.
- Bewusst geleerte Aktionsplätze werden beim Laden nicht unerwartet mit bereits besessener Verpflegung belegt.

## Abnahme

- `npm test`: 363 Tests, alle bestanden; darunter zehn neue Regressionstests in `tests/basis.test.mjs`.
- Inhaltsvalidierung, Balance-Bericht und GitHub-Pages-Build ausgeführt; `save-store.js` ist Teil des Offline-Manifests.
- `node scripts/basis-check.mjs`: HUD und acht Fensteraufrufe bei 2024×900, 1440×900, 390×844, 320×568, 844×390 und 667×375; kein horizontaler Inhaltsüberlauf, erreichbare Schließen-Knöpfe, mindestens 130 px nutzbare Körperhöhe. Bei 390×844 echte CDP-Toucheingaben für Belegung, Langdruck, Stick und Zauber-/Zielabbruch.
- `node scripts/basis-pwa-check.mjs` nach `npm run build`: installierter Cache unter einem Pages-Unterpfad; kalter Offline-Start, erhaltene Touchbelegung und Fortschritt, blockiertes Update bei simuliertem Speicherfehler, erfolgreicher Wiederholungsversuch, Austausch des Release-Caches und Wiederherstellung nach beschädigtem Save.
- Browserbilder und JSON-Prüfergebnisse werden reproduzierbar unter `combat-review/basis/` und `combat-review/basis-pwa/` erzeugt (git-ignoriert). Keine Browser-Ausnahmen in den erfolgreichen Läufen.

Visuelle Prüfung der geänderten Flächen: Ressourcen und Interaktionshinweis innerhalb ihres Layouts; Fenster im Viewport; horizontal kein Überlauf; Schließen und Touchaktionen erreichbar; bestehender Bierdeckel-Stil erhalten (5/5). Die allgemeine CSS-Konsolidierung aus E-24 wird dadurch nicht als abgeschlossen erklärt.

Die Prüfungen decken Chromium-Touchemulation ab. Safari/iOS und echte Handy-Hardware sind noch offen. Performance-Messung, vollständiger Akt-1-Durchlauf und allgemeines Balancing bleiben eigene Arbeitspakete. Es wurde kein neuer Spielinhalt ergänzt.
