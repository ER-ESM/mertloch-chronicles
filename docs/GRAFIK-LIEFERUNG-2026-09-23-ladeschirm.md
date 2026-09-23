# Ladeschirm beim Spielstart · 23.09.2026

Bisher stand beim Start ein grüner Kasten mit „Das Maifeld erwacht.“, ohne Fortschritt. Jetzt kommt ein bildschirmfüllender Ladeschirm mit Motiv aus der Bildpipeline, einem Bierbalken, der echten Ladefortschritt zeigt, und einem Bierdeckel mit Strichliste.

## Was man sieht

- **Hintergrund:** eins von fünf Motiven, beim allerersten Start immer „Die Bude, am Morgen danach“, danach zufällig und nie zweimal hintereinander dasselbe. Leichter Kamerazug (30 s), abgeschaltet bei `prefers-reduced-motion`.
- **Marke:** Stempel „Poo-Tang-Clan“, Titel in Jersey 15, darunter der Name des Motivs.
- **Balken:** Tresenleiste aus Eiche mit Messingkappen (Bildpipeline, 9-Slice über `border-image`), darin Bier mit Schaumkrone und aufsteigenden Bläschen (CSS, harte Kanten, keine Unschärfe).
- **Bierdeckel:** jeder fertige Schritt ein Bleistiftstrich, der fünfte kreuzt das Bündel. Fünf Schritte, ein Fünferbündel.
- **Text über dem Balken:** Name des Schritts, bei den Grafiken mit Zähler „(3/10)“, rechts die Prozentzahl.
- **Tipp:** wechselt alle 7 s (14 Tipps: Tasten und Dorfweisheiten).
- **Fehlerfall:** Balken wird korallenrot, Meldung und Knopf „Erneut versuchen“, das Motiv bleibt stehen.

## Echter Fortschritt, nicht geschätzt

| Schritt | Gewicht | Gemessen an |
|---|---|---|
| Spielregeln (Module) | 40 | geladene `.js`-Dateien (PerformanceObserver) gegen die Zahl vom letzten Start (`mertloch-boot-modules`); beim ersten Start eine weiche Kurve |
| Maifeld vermessen | 10 | Bytes von `data/mertloch.json` aus dem Datenstrom |
| Mertloch aufbauen | 10 | Welt und Spielstand anlegen |
| Grafiken zapfen | 30 | die zehn Grafik-Lader, jeder fertige zählt |
| Clan wecken | 10 | Renderer und Oberfläche |

Kein Schritt meldet sich selbst voll (Deckel bei 97 %), erst der nächste Schritt schließt ihn ab. Der Balken läuft nie rückwärts. Mindestens 0,7 s sichtbar, damit schnelle Starts nicht flackern; dann 0,45 s Ausblenden in den Startschirm.

## Dateien

| Datei | Zweck |
|---|---|
| `loading-screen.js` | eigenes Modul, läuft **vor** `app.js` (so zählt es schon beim Modul-Laden); Schnittstelle `boot.phase/track/json/finish/fail` |
| `loading-screen.css` | erstes Stylesheet, Bierdeckel-Regeln |
| `content/loading-screen.js` | Texte, Schritte, Motive, Tipps (`LOADING_UI`) |
| `index.html` | statisches Markup `#loading` direkt unter `<body>`, steht vor jedem Skript |
| `app.js` | meldet die Schritte; Fehler → `boot.fail(err)` |
| `tools/sprite-pipeline/ladeschirm-20260923-jobs.json` | Bildaufträge (7 Motive) |
| `assets/precision/sources/2026-09-23/ladeschirm/` | Originale, Herkunft in `assets/precision/generation.json` |
| `tools/loading-screens/build.mjs` | Export: Motive → WebP 1536×1024 (q 0,74, 190–410 kB), Deckel 256², Leiste 1200×94 PNG |
| `assets/loading/` | Laufzeitdateien; Deckel und Leiste im Precache, Motive als optionaler Cache beim ersten Zeigen |
| `tests/loading-screen.test.mjs` | Gewichte, Monotonie, Motivwahl, Verdrahtung, Laufzeitdateien |
| `scripts/loading-screen-check.mjs` | Browserprüfung mit gedrosseltem Netz, Aufnahmen je Schritt, Fehlerfall |

## Neu erzeugen

```
npm run sprites:generate -- tools/sprite-pipeline/ladeschirm-20260923-jobs.json [--only=id --force]
npm run loading:build            # CDP_PORT=95xx, wenn 9370 belegt ist
node scripts/pwa-cache.mjs
CDP_PORT=95xx npm run loading:check -- http://localhost:<port>/ <ordner> 1440x900
```

Neues Motiv: Auftrag ins Jobs-Blatt, Eintrag in `LOADING_UI.scenes` (id = Dateiname), dann die drei Befehle oben. Im Bildauftrag das untere Viertel ruhig und dunkel lassen, dort liegt der Balken.

## Fallen

- Die Tresenleiste kam mit weißem Hintergrund. `build.mjs` stanzt dann per Flutfüllung vom Rand aus. Die Schnittkanten in `loading-screen.css` (`33 60 30 56`) gehören zu genau dieser Leiste; bei einer neuen Leiste neu ausmessen.
- Prüfskripte dürfen `navigator.serviceWorker` nicht entfernen, sonst bricht `pwa.js` den Start ab. Nur `register` stilllegen.
- `#loading` bekommt am Ende weiterhin `.hidden`. Ältere Prüfskripte warten darauf.

## Abnahme

`npm test` grün, `loading:check` grün bei 390×844, 1440×900 und 1920×1080 (fünf Striche, 100 %, Spiel startet, Fehlerfall mit Knopf).
