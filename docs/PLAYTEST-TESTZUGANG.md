# Testzugang für Playtests · `scripts/playtest-save.mjs`

Stand 2026-09-26 (Dungeon-Fix 2). Anlass: Bei der Endabnahme reichte das Budget des Prüfers nur für Flügel 1, Big B wurde nicht erreicht
(`docs/PLAYTEST-2026-09-26-dungeon-endabnahme.md`).

Der Testzugang legt einen **fertigen Helden** in den Browser: Stufe 10, typische Ausrüstung, Pfandmarken und auf Wunsch ein Dungeon-Stand.

- Es gibt **keinen Schalter im Spiel** und keine Hintertür.
- Der Spielstand entsteht in Node mit der echten Spiellogik: `Game`, Dungeon, Söldner und Siege über `g.kill`. Geschrieben wird er mit `game.save()`.
- Der Schnipsel tut im Browser nur, was das Spiel beim Speichern selbst tut: Er trägt einen Helden in die Heldenliste ein (`characters.js`:
  `createCharacter`, `storeRoster`) und legt den Spielstand unter `characterKey(Welt, Held)` in den `localStorage`.

## Voreinstellungen

| `--preset` | Stand beim Laden | Söldner |
|---|---|---|
| `vor` (Vorgabe) | draußen an der Doppelgarage auf der Burgstraße; Eingangskarte, Anheuern und Journal gehören zum Test | keine |
| `siegel` | im Dungeon, Laufstand und Tagesstand mit allen drei Siegeln (Gerd, Exposé, Kurt liegen), Weinkeller und Gewölbegänge geräumt; die Tresortür ist offen | vier (Pils-Peter, Schorle-Susi, Radler-Rita, Hopfen-Horst) |
| `bigb` | direkt vor Big B: alle übrigen Bosse liegen (auch Rita und das halbe Pferd), aller Trash ist geräumt, Volker ist befreit, alle drei Beweise sind **gefunden, aber nicht vorgelegt** | vier |

Im Dungeon steht der Held nach dem Laden wie jeder Spieler am **letzten Kontrollpunkt**, dem Weinkeller. Das ist der Gang direkt an seiner Tür.
- Zur Tresortür sind es rund 30 m durch die geräumten Gewölbegänge.
- An der Tresortür bietet F „Beweise vorlegen“ an (nur bei `bigb`).
- Dahinter wartet Big B im Thronsaal.

Weitere Schalter:
- `--class=dieter|baerbel|kevin|schorsch|kaethe`, `--spec=…` (Vorgabe wie die Simulation, z. B. `dieter-brawl`)
- `--gear=typical|start|full` (Vorgabe `typical`, Herleitung in `docs/DUNGEON-FIX2-2026-09-26.md`)
- `--name=…` (Vorgabe „Playtest vor/siegel/bigb“, bei Namensgleichheit „… 2“), `--coins=600`, `--mercs=0|1`, `--out=datei.js`

Die Talente sind wie in der Simulation verteilt (Pfad 0 der Spezialisierung, zehn Punkte). Die Beute der Siege wird verworfen; die Ausrüstung
bleibt genau das Profil.

## Nutzung

1. Schnipsel erzeugen (im Repo):
   ```
   node scripts/playtest-save.mjs --preset=bigb --out=playtest-bigb.js
   ```
   Ohne `--out` steht der Schnipsel auf der Standardausgabe. Die Zusammenfassung (Stufe, Leben, Siegel, Beweise) steht auf `stderr`.
2. Im Browser eine Seite **derselben Herkunft ohne laufendes Spiel** öffnen, zum Beispiel
   `https://mertloch.esm-consultant.de/precache-manifest.js` (lokal `http://localhost:4173/precache-manifest.js`).
   - Nicht die Spielseite selbst: Ein laufendes Spiel speichert beim Schließen und kann den frischen Stand überschreiben.
3. Den Schnipsel dort ausführen, von Hand in der Konsole oder als Agent:
   - Playwright-MCP: `browser_evaluate` mit dem Inhalt als Funktion. Der Schnipsel ist ein `async`-Ausdruck; er liefert den Heldennamen.
   - Eigenes CDP-Skript: `Runtime.evaluate` mit `awaitPromise` (so macht es `scripts/dungeon-fix2-check.mjs`, Teil 8).
4. `/` öffnen. Der neue Held ist in der Heldenhalle schon gewählt: **„Ins Dorf“ bzw. „Weiter“**.
   - `vor`: Der Held steht an der Garage; mit F öffnet sich die Eingangskarte.
   - `siegel` und `bigb`: Der Held steht im Dungeon am Kontrollpunkt Weinkeller.

## Fallen

- **Zeit:** Ein Dungeon-Laufstand verfällt 30 min nach dem Speichern und beim Tageswechsel um 4 Uhr.
  - Der Schnipsel setzt Speicherzeit und Spieltag beim **Ausführen** auf „jetzt“; erzeugen darf man ihn also vorher.
  - Zwischen Ausführen und dem ersten Laden sollten aber keine 30 min liegen, und nicht über 4 Uhr hinweg.
- **Angemeldet spielen:** Der Stand liegt nur im Browser. Wer mit einem Konto angemeldet ist, kann beim Laden einen Wolkenstand bekommen. Für
  Playtests als Gast spielen.
- **Handy:** Der Schnipsel läuft auf jeder Seite der Herkunft. Am Handy vorher im Desktop-Browser ausführen oder das Handy per Fernsteuerung
  (CDP) bedienen.
- **Aufräumen:** Testhelden bleiben in der Heldenhalle, bis man sie dort löscht. Höchstens acht Helden passen hinein.
- **Andere Welt:** Der Schnipsel nimmt die Standardwelt aus `world-rules.js` (`v2-56753-72-1`). Mit URL-Parametern `seed`, `density` oder
  `roadWidth` sieht das Spiel einen anderen Welt-Schlüssel und findet den Stand nicht.

## Geprüft

`scripts/dungeon-fix2-check.mjs` Teil 8 führt alle drei Voreinstellungen auf `/precache-manifest.js` aus, lädt das Spiel und prüft:
- Stufe 10 mit 0 EP, 600 Pfandmarken, typische Ausrüstung
- bei `siegel`/`bigb`: im Dungeon am Kontrollpunkt, drei Siegel, Tresortür offen, vier Söldner
- bei `bigb`: fünf Bosse liegen, drei Beweise gefunden, Big B steht

Teil 3 nutzt `vor` für den ersten Pull wie beim Prüfer: Eingangskarte, Söldner per Klick, Rechtsklick auf den Azubi.
