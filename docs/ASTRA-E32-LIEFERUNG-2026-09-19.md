# Astra – E32-Grafiklieferung und korrigierte Laufzyklen

**Nachprüfung nach Nutzerfeedback:** Die Lauf- und Gearfreigabe dieses ersten Lieferstands war zu großzügig. [Lauf-/Gear-Korrektur](LAUF-GEAR-KORREKTUR-2026-09-19.md) dokumentiert die anschließend gefundenen Schnitt-, Tempo- und Registrierungsfehler sowie die abschließende Version 5 des Exports mit kürzeren Schritten, Gewichtsübergabe und korrigiertem Wiederanlaufen. Insbesondere ist die unten genannte 20er-Animationsstrecke überholt.

Umsetzung der [Visuals-Übergabe](UEBERGABE-VISUALS-KLASSEN-ASTRA-2026-09-18.md), Stand 19.09.2026. Grundlage ist `origin/main` bei `0983272`, zusammengeführt mit dem vorbereiteten Art-Zweig. Diese Lieferung ist in den Spielcode dieses Arbeitszweigs integriert.

## Fertige Zuordnung

- **270 Talenticons**, 90 je Klasse. Drei PNG-Atlanten mit jeweils zehn Spalten und neun Pfadzeilen. Jeder bestehende Speicherschlüssel `<spec>-<index>` ist mit Name, Effekt, Pfad, Reihe und eigenem Motiv registriert. Keine Talentdaten oder Speicher-IDs wurden geändert.
- **45 Skill-/Variantenfelder** in einem 48-px-Atlas: Markierung, Eskalation, Bodenkniff, Stärkung und verstärkte Variante für alle neun Spezialisierungen. Unveränderte Skills verwenden bewusst ihren Bestand. Neue Mechaniken verwenden passende Signatur- oder Talentmotive. Nicht jedes dieser Felder ist eine neue Illustration.
- **20 Objektzustände** aus der vorbereiteten Lieferung: drei Fasssorten, Robbi und Gisela. Sie erscheinen jetzt in der Welttiefe zwischen den Figuren. Restzeit, Robbi-Leben und sein tatsächlicher Schusszustand werden separat dargestellt.
- Neue Fünf-Frame-Folgen für Schaumfontäne, Metallüberlast, „Prost!“ und Sporenwolke. Ergänzend bleiben die vorbereiteten Lunten-, Übertragungs-, Kater- und Blitzframes aktiv.
- HUD-Anzeige für Pegel/Ablauf, Vorratsgläser, Variantenrestzeit, Glücksergebnis, Fässer und Robbi. Liest den tatsächlichen Spielzustand; zählt selbst keine Treffer und erzeugt keine Procs.
- Talentbaum mit Untersetzern, verbundenen Pfadbahnen, Wahl-/Sperr-/Ausschlussdarstellung und Pfadtreue. Mobil sind die Bahnen horizontal wischbar; die Knoten bleiben 72 px groß. Bestehende Tooltip-/Langdruckbedienung bleibt erhalten.

`styleIcon()` lässt als Präzisionsgrafik markierte Canvases unverändert. Damit werden die neuen 64-px-Talente nach dem Zeichnen nicht erneut auf 32 px reduziert.

## Laufkorrektur

Der bisherige Zweibein-Export bewegte Gelenke gegenläufig, zeichnete aber stets dieselbe Seite zuletzt. Außerdem wurde der gesamte Körper an der wechselnden niedrigsten Silhouettenkante ausgerichtet. Das ergab keine glaubwürdige wechselnde Belastung.

Der neue Zyklus trennt Stand- und Schwungphase, hält die Standsohle flach und hebt den schwingenden Fuß. Die Reihenfolge der Beine wechselt anhand ihrer projizierten Bodentiefe. Der Körper bekommt nur eine kleine, regelmäßige Gewichtsverlagerung. Hose und Stiefel folgen derselben Beinstellung und Zeichenreihenfolge. Die Animationsstrecke beträgt jetzt 20 statt 48 Welteinheiten je Zyklus; die Bewegungsgeschwindigkeit der Spielfigur wurde nicht verändert.

Abdeckung: **35 menschliche Figuren in vier Richtungen mit acht Phasen**. Die drei Helden haben zusätzlich vollständige Zweihandzyklen: zusammen 1.216 exportierte Gehframes. NPCs und menschliche Gegner/Bosse laden ihre separaten Laufbögen statt der bisherigen kurzen Posenfolge. Tier- und Automatenrigs wurden nicht durch Menschenrigs ersetzt.

Die Sichtprüfung fand weitere Fehler, die reine Gelenkprüfungen nicht erkennen: Gehstock, Mistgabel und Kurts Besen lagen in den Beinausschnitten. Für diese Requisiten sind feste Masken registriert; lange Mäntel haben eigene Beinansätze. Diese Teile werden nicht mehr mit dem Knie verbogen. Die Hände bewaffneter Helden bleiben in Bereitschaft; dies ist kein neuer vollständiger Oberkörper-Castzyklus während des Laufens.

Direkt vergleichen: **http://127.0.0.1:4283/gait-review.html**. Die Seite nutzt denselben Renderer und dieselben Bögen wie das Spiel. Vier Ansichten, acht Einzelphasen, Fußmarkierungen und Ein-/Zweihand-Gear sind umschaltbar.

## Laufzeit und Export

| Bereich | Katalog / Einstieg |
|---|---|
| Talente und Skills | `assets/content-art/e32/runtime/catalog.json`, `e32-art.js` |
| Neue Effektfolgen | `assets/content-art/e32/runtime/effects.json` |
| Objektzustände und ergänzende Effekte | `assets/class-visuals/runtime/catalog.json`, `class-visual-art.js` |
| Bestätigte Welt-/Effektanzeige | `e32-world-art.js`, Hooks in `spec-mechanics.js` |
| Menschenlaufbögen | `assets/content-art/locomotion/runtime/catalog.json` |
| Heldenlaufbögen | `assets/redesign/runtime/catalog.json` |
| HUD | `class-hud.js` |

Reproduzieren:

```sh
node tools/class-visuals/build-talents.mjs
node tools/class-visuals/build-effects.mjs
node tools/class-visuals/build-locomotion.mjs
node tools/redesign/build.mjs
npm test
npm run build
```

Die neuen Quellen wurden mit dem eingebauten `image_gen.imagegen` erzeugt. Zehn Originalbögen, exakte Prompts, Referenzen, Originalpfade und SHA-256 stehen unter `assets/content-art/e32/generation.json` und `sources/`. Wiederverwendete Talente/Signaturen sind im Laufzeitkatalog nachvollziehbar. Source- und Reviewdateien sind vom Produktionsbuild und Offline-Cache ausgeschlossen.

## Prüfung und Integrationsgrenzen

Native Atlanten, alle 35 menschlichen Figuren, beide Fußkontaktphasen in vier Ansichten, volle Heldenzyklen mit Gear, Requisitenkorrekturen und Spielansichten wurden visuell betrachtet. Belege liegen in `assets/content-art/e32/review/`; die ersten Vergleichsbilder zeigen teilweise noch die ausdrücklich dokumentierten Fehler vor der Korrektur (`people-*`, `walk-first`, `prop-sources`). `*-fixed` und die Gait-Seite zeigen den korrigierten Stand.

Browserprüfung: `tools/class-visuals/review-e32.browser.js`. Sie prüft 270 Talent-IDs ohne erneute Verkleinerung, 45 Skillfelder, 280 Laufzustände mit vier Ansichten, mobiles Scrollen und die tatsächliche Weltintegration. Keine Browserfehler oder fehlgeschlagenen Requests im geprüften Lauf. Die Kampfregeln bestimmen weiterhin Treffer, Übertragungen, Ablauf und Proc-Ergebnisse; die Grafik simuliert keine zusätzlichen Ziele oder Schäden.

Wichtig für Folgearbeit: Neue NPC-Illustrationen benötigen passende Requisiten-/Mantelregistrierung. Ein gültiger Frame-Hash ist keine visuelle Freigabe. Die technische Bereitschaft dieses Zweigs ist außerdem keine Aussage über eine bereits veröffentlichte Website-Version.
