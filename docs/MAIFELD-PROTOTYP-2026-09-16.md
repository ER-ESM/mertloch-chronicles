# Maifeld-Detailpixel: ausgearbeiteter Prototyp

Der Nutzer hat Maifeld-Detailpixel gewählt. Dieser Stand konkretisiert den Charakterstil in einer spielbaren, eigenständigen Hofprobe.

[Öffentlicher Prototyp](https://er-esm.github.io/mertloch-chronicles/maifeld-prototype.html) · lokal `/maifeld-prototype.html` nach `npm start`.

## Geliefert

- Aperol-Anni, Dosen-Dieter und Keiler: je **vier gezeichnete Blickrichtungen × acht Posen**, insgesamt 96 neue Sprite-Frames. Echte Vorder- und Rückenansichten, keine zur Rückansicht umdeklarierte Spiegelung.
- Stand, ursprünglich drei Laufphasen (jetzt durch acht eigene Laufphasen ersetzt, siehe [Laufiteration](MAIFELD-LAUFANIMATION-2026-09-16.md)), Ausholen, Angriff, Spezialpose und Treffer. 52 px Körperhöhe für Menschen, 37 px für Keiler; in der Welt 26 bzw. 19 Einheiten hoch. Lauftakt folgt zurückgelegter Strecke. Feste 40-Farben-Palette und Fußpunkte.
- Sprite-Inspektor: alle vier Ansichten gleichzeitig, Animation umschaltbar, Pause und PNG-Download. Umschaltbare Nahansicht im Weltmenü.
- Spielbare Mertloch-Karte mit vorhandenen Gebäuden, Gelände, Kollision und Verdeckung. Neue Spawn-Regel: freie, erreichbare Flächen außerhalb von Straßen, Dachüberhängen und Baumkronen, Abstand zwischen Gegnergruppen.
- Anni: Fernkampfzauber, Hygiene-Flächenangriff und Schutz-Buff. Dieter: Nahkampfschlag, Beben und Schutz-Buff. Separates Ausweichen, Autoangriff, GCD, Zauberabbruch durch Bewegung, Gegner-Aggro, neutrale Tiere, Nahkampftreffer während Bewegung und Respawns außerhalb unmittelbarer Spielernähe.
- Oskars Hofprobe: NPC-Gespräch, drei Keiler vertreiben, zurückkehren und **eine von drei** wirksamen Belohnungen wählen. NPC-Porträt stammt direkt aus derselben Sprite-Grafik wie die Weltfigur.
- HUD ohne äußeren Spielrahmen, Menüs als nicht pausierende Popups, Touch-Joystick und rechte Aktionsbuttons. Neustart betrifft nur den Prototyp.

## Grafikquellen und Pipeline

Neue Originalbilder liegen in `assets/maifeld-prototype/sources/`. Generiert mit dem eingebauten Imagegen-Werkzeug anhand des gewählten Maifeld-Referenzatlas. Prompts: `tools/sprite-pipeline/detail-prompts.json`; gezielte Korrekturen: `detail-corrections.json`. Die ersten Dieter-/Keiler-Versionen sind zur Nachvollziehbarkeit erhalten, der Builder verwendet ihre `-v2`-Quellen. Korrigiert wurden verschwundene Kellen in Laufposen und ein falsch ausgerichteter Keiler-Treffer.

```sh
npm run sprites:detail
npm run sprites:check
npm test
npm run build
```

Der Builder segmentiert echte Silhouetten, benutzt einen festen Maßstab je Figur für alle Richtungen, normalisiert Fußpunkte, Palette und Alpha und schreibt PNGs plus Quell-/Output-Hashes nach `assets/maifeld-prototype/runtime/`. Er lehnt angeschnittene Quellen und zu knappe Rahmen ab. Zwei Builds derselben Quellen müssen bytegleich sein. Kreative Grafiken wurden generiert; der Code übernimmt die technische Verarbeitung.

Die Subagent-Definition `sprite_director` kennt jetzt die getroffene Stilwahl. Die modularen Standbild-Bauteile der ersten Werkstatt bleiben verfügbar. Vollständig animierte Kleidungs-Layer sind weiterhin ein eigener Ausbauschritt.

## Ausgeführte Prüfungen

- Headless: deterministischer Build aller 96 Frames, Padding und binäres Alpha; Richtungswahl; Gegner-Autoangriffe während Bewegung; Schutz/Ausweichen; GCD; Zauberabbrüche; Fernkampf/AOE; Sichtlinien; neutrale Tiere; verzögerter Respawn; exklusive Belohnung und Reset; Klassenwechsel und Zielwahl.
- Browser: 1440 × 1000, 390 × 844 und 844 × 390; echte Bewegung, Rückenansichten, NPC-Dialog, Sprite-Inspektor, Kampfeingaben und Touch-Joystick; Screenshots visuell angesehen.
- Vollständige Hofprobe mit Playwright über echte Buttons: drei Gegner besiegt, eingehender Schaden beobachtet, zu Oskar zurückgelaufen, drei Belohnungen angezeigt, Schürze gewählt, maximales Leben 185. Keine Veränderung von HP/Gegnern/Queststatus durch Test-Hintertüren.
- Der lokale CDP-Treiber verlor bei zwei längeren Kampfversuchen die WebSocket-Verbindung. Der vollständige Durchlauf wurde deshalb mit Playwright ausgeführt. Reproduzierbarer Ablauf: `scripts/playwright-maifeld-combat.mjs` als Datei an `browser_run_code` übergeben. Kurzer Browser-/Touch-Test: `node scripts/browser-maifeld-prototype.mjs` mit Chrome-CDP-Port 9222.

## Bewusste Grenzen

Dies ist ein detaillierter Stil- und Gameplay-Prototyp, keine vollständige Umstellung des Hauptspiels. Oskar nutzt den bisherigen Maifeld-Atlas. Gebäude und Natur bleiben die vorhandenen Weltgrafiken. Das Hauptspiel und seine Spielstände werden nicht verändert; die Hofprobe speichert keinen eigenen Fortschritt über Neuladen hinweg.

Die acht Posen je Richtung sind kurze Animationszyklen, nicht die geplante vollständige 104-/76-Frame-Matrix. Tod/Interaktion, zusätzliche Zwischenphasen, getrennte animierte Waffen- und Kleidungslayer sowie Kevin und weitere NPCs fehlen noch. Die folgende Laufiteration ersetzt den bisherigen Laufclip durch einen eigenen Atlas; die alten Posen bleiben als Quelldaten erhalten. Anatomische Handseiten und Verdeckung brauchen vor Produktion nochmals eine Animationsprüfung. Keine Behauptung, dass neue KI-Generierungen identisch oder automatisch fehlerfrei wären.
