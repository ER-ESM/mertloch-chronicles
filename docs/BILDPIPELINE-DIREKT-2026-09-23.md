# Bildbeschaffung ohne Dateiübergabe · 23.09.2026

Die Grafikrolle war bisher eine Handübergabe: Anforderung in `docs/UEBERGABE-GRAFIK-<Datum>.md` schreiben, in einer zweiten Sitzung (Codex) die Bilder erzeugen lassen, PNGs zurücklegen, danach weiterbauen. Ab jetzt fordert die bauende Sitzung die Motive selbst an — gleiches Bildwerkzeug, gleiches Abo, gleiche Herkunftsprotokolle, nur ohne den Umweg über Dateien und Anweisungen.

## Was es ist

`tools/sprite-pipeline/imagegen.mjs` ruft die Codex-CLI einmal je Motiv nicht-interaktiv auf (`codex exec`) und lässt dort den eingebauten Bildskill „imagegen" arbeiten. Das unveränderte Original landet unter `job.output`, die Herkunft (Prompt, Referenzen, Werkzeug, Codex-Version, Original-Dateiname, SHA-256) in `assets/precision/generation.json`.

Zuschnitt, Palette, Alpha und Laufzeitexport bleiben, wo sie waren: `npm run sprites:precision`. Das Werkzeug beschafft nur die Quelle — der Export bleibt byte-reproduzierbar und weiterhin durch `tests/art-precision.test.mjs` geprüft.

## Ablauf

```
1 Auftragsblatt   tools/sprite-pipeline/<runde>-jobs.json   (id, output, width, height, kind, prompt, references)
2 Erzeugen        npm run sprites:generate -- tools/sprite-pipeline/<runde>-jobs.json
3 Ansehen         Originale unter assets/precision/sources/<Datum>/ prüfen, Prompt schärfen, --force nachziehen
4 Export          npm run sprites:precision && node scripts/pwa-cache.mjs
5 Abnahme         npm test, Browsertest, Lieferbericht docs/GRAFIK-LIEFERUNG-<Datum>.md
```

Aufrufe:

```
npm run sprites:generate -- <jobs.json>                       # alles, was noch fehlt
npm run sprites:generate -- <jobs.json> --only=id-a,id-b      # gezielt nachziehen
npm run sprites:generate -- <jobs.json> --only=id-a --force   # vorhandenes Motiv ersetzen
npm run sprites:generate -- <jobs.json> --dry-run             # nur zeigen, was anstünde
```

Vorhandene Ausgabedateien werden ohne `--force` übersprungen — ein abgebrochener Lauf lässt sich damit fortsetzen, ohne fertige Motive neu zu bezahlen.

## Voraussetzungen und Fallen

- **Anmeldung:** Codex-CLI mit ChatGPT-Abo (`~/.codex/auth.json`, `auth_mode: chatgpt`). Kein OpenAI-API-Schlüssel nötig, es läuft über dasselbe Abo wie die Codex-Sitzungen. Das Feature heißt `image_generation` (`codex features list`, stabil und an).
- **Die Kopie in `~/.codex/.sandbox-bin` reicht nicht.** Der Bildskill läuft über `codex-code-mode-host.exe`; liegt der nicht neben `codex.exe`, bricht der Werkzeugaufruf mit „failed to spawn code-mode host" ab und die Sitzung meldet nur, sie könne kein Bild erzeugen. `resolveCodex()` sucht deshalb gezielt einen Ordner, in dem beide Dateien liegen (heute die VS-Code-Erweiterung `openai.chatgpt-*`), sonst `CODEX_BIN` setzen.
- **`--image` ist variadisch.** Referenzbilder nur in der Gleichheitsform (`--image=<Pfad>`) übergeben; sonst schluckt die Option den Prompt und die CLI wartet auf stdin.
- **Sandbox `read-only` ist Absicht.** Der Agent soll das Bild erzeugen und sonst nichts: kein Kopieren, kein Skalieren, kein Nachbearbeiten. Das Bildwerkzeug schreibt trotzdem nach `~/.codex/generated_images/<Sitzung>/exec-*.png`; das Werkzeug nimmt von dort die neueste Datei und kopiert sie selbst. Ohne diese Grenze skaliert die Sitzung die Bilder eigenmächtig (beobachtet: Nachbau über `System.Drawing` mit Nearest-Neighbor) — dann wäre das Original nicht mehr das Original.
- **Größenangabe ist ein Hinweis, keine Zusage.** Das Bildwerkzeug liefert große Originale (rund 1 MB, ~1400 px Kante); die Zielgröße stellt erst der Präzisionsexport her. Das ist gewollt und entspricht der bisherigen Lieferung.
- **Nachtrag 25.09.: Zuordnung je Sitzung.** `imagegen.mjs` nimmt zuerst das Bild aus `generated_images/<Sitzungs-ID>/` der eigenen `codex exec`-Sitzung (ID aus der Ausgabe) und erst ohne ID das neueste. Damit darf eine zweite Codex-Sitzung (z. B. die Porträt-Aufgabe) parallel laufen. Kommt kein Bild und meldet Codex das Nutzungslimit, trägt der Fehler `code: 'USAGE_LIMIT'` (und `retryAt`), damit Stapelläufe aufhören.
- **Nachtrag 25.09.: Kontingent kostenlos lesen.** `node tools/sprite-pipeline/codex-kontingent.mjs` fragt `codex app-server` nach `account/rateLimits/read` (Wochenfenster: verbraucht in Prozent, Rücksetzzeit, gesperrt ja/nein). Dabei wird kein Modell aufgerufen. Rücksetz-Gutschriften meldet das Werkzeug nur, es löst sie nicht ein. Gemessen am 24.09.: etwa 0,16 % Wochenkontingent je Einzelbild (88 → 100 % über 77 Bilder).
- **Kein fester Modellname.** Das eingebaute Werkzeug nennt sein Bildmodell nicht; die Herkunft trägt weiterhin `tool: "built-in imagegen"`, `model: "Not exposed by built-in tool"` und zusätzlich `via: "codex exec <Version>"`.

## Was das ändert

Der Rückkopplungsweg gehört jetzt zur bauenden Sitzung: Prompt schreiben, Bild anfordern, Bild ansehen, Prompt schärfen, neu anfordern — ohne Sitzungswechsel und ohne Übergabedatei dazwischen. `docs/UEBERGABE-GRAFIK-<Datum>.md` bleibt trotzdem die Bestellung (was fehlt, warum, wie angebunden); neu ist nur, dass niemand mehr eine zweite Sitzung dafür braucht.

Unverändert bleiben: Stilvorgabe `ART-DIRECTION.md` und `docs/PRAEZISIONSPIXEL-2026-09-17.md`, Dateiname = ID, Fallback im Spiel bis zur Anbindung, Lieferbericht mit Abnahme.

## Prüfung

`tests/imagegen.test.mjs` prüft Auswahl, Trockenlauf, Überspringen und Auftragsformat offline — ohne Bildanforderung und ohne installierten Codex (Codex wird erst gesucht, wenn wirklich ein Bild ansteht, damit GitHub Actions grün bleibt).

Durchstich am 23.09.2026: zwei Probemotive erzeugt (eines frei, eines mit Referenzbild aus `assets/precision/sources/2026-09-23/`), beide in Stil und Transparenz brauchbar, Herkunft vollständig geschrieben.
