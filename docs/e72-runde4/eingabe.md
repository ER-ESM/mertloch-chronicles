# E-72 Runde 4 · Eingabe (Kenner-Playtest 25.09. abends, Kampfgefühl)

Branch `e72-eingabe`. Tests: `tests/e72-eingabe.test.mjs`. Browserprüfung: `node scripts/e72-eingabe-check.mjs [--seconds=45]`
(vorher/nachher: alten Stand selbst ausliefern, `… http://localhost:4381/ --label=alt`). Bilder: `docs/e72-runde4/eingabe/`.

## 1 · Tastenvorwahl
- **Ursache:** Der Puffer (0,4 s, Runde 5a) gab es schon. Die Zahl auf dem Knopf und die Fehlerzeile zeigten aber die *eigene*
  Abklingzeit („Puderdose … muss noch verschnaufen · 0,1 s“), während die GCD noch 0,5–1,3 s sperrte. Wer nach der Zahl drückte, lag
  weit außerhalb des Fensters. Schorschs Auflegen (Handgriff ohne GCD) wurde außerdem wie ein GCD-Kniff gesperrt.
- **Jetzt:** Beginnt eine GCD, laufen kürzere Abklingzeiten mit ihr ab (`alignCooldowns`, gleiche Sperre, ehrliche Knopfzahl wie in WoW).
  Fehlerzeile nennt die echte Restzeit. Fenster/Haltezeit in `content/tuning.js` → `COMBAT_FLOW_TUNING`. Letzter Druck gewinnt;
  Esc, Laufen (nur Kniffe mit Zauberzeit), Zielwechsel von Hand verwerfen still; stirbt das Ziel, geht der Kniff aufs neue Ziel.
  Taste gedrückt halten versucht es still weiter (WoW „Gedrückt halten zum Wirken“, nur Kniffe, keine Umschalter/Gegenstände).
  Vorgemerkter Knopf: heller Innenring.
- **Messung (45 s je Klasse, Mensch drückt 0,15–0,25 s vor Ende der Knopfzahl):** vorher 11 Sperr-Fehlerzeilen
  (Dieter 1, Anni 4, Schorsch 6), nachher 0. Übrige Zeilen sind echte Ressourcen-Hinweise („Zu wenig Glut“, „Abrechnen erst ab 61“).

## 2 · Proc-Flut
- **Regelfehler, nicht nur Protokoll:** `lowHealth` zündete bei *jedem* Treffer unter 35 % (4× Deckung = 239 statt 60 im Vorher-Lauf).
  Jetzt einmal beim Unterschreiten, scharf erst wieder über der Schwelle, interne Abklingzeit 15 s (`COMBAT_FLOW_TUNING.lowHealth`,
  Tooltip-Zahl „Höchstens alle 15 s“). Betrifft alle Unter-35-%-Talente aller Klassen.
- Chat: gleiche aufeinanderfolgende Zeilen → eine Zeile mit „×N“.

## 3 · „BEREIT“-Textsalat
- Gleiche Kampftext-Meldung ohne Zahl innerhalb ihrer Laufzeit → eine Zeile „BEREIT ×3“ (neu angestoßen), Proc-Meldungen 22 px statt 28 px.
- VIRAL: keine Beschriftung und kein Einheits-Varianten-Icon mehr auf allen Knöpfen (jedes Icon blieb dasselbe Bild!), sondern
  rosa Innenrahmen an den Likes-Kniffen + Tooltipzeile „Viral: Der nächste Kniff mit Likes-Kosten ist gratis.“

## 4 · Bodenziel
- Anderer Kniff/Gegenstand schließt den Zielmodus und läuft; „Boden wählen“ verschwindet mit dem Modus und steht nicht mehr hinter
  anderen Meldungen an. Einstellung Spiel → Kampf → „Bodenkniffe sofort an der Maus“ (Standard aus; Maus nicht über der Welt → Zielkreis).

## Offen / Risiko
- `app.js` Zeile „has-waypoint“ + neue Zeilen darunter, `toast()`, `triggerSlot()`; `combat-text.js`, `chat-window.js` – mögliche
  Überschneidung beim Zusammenführen mit e72-hud4 (Leiste). `combat-ui.js` nicht angefasst.
- Knopfzahl frischt nur alle 100 ms auf (updateUI) – unverändert.
