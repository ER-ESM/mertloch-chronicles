# Sichtbare Startkleidung

Neue geführte Spielstarts beginnen ohne angelegte Gegenstände. Alle drei Helden haben eigene Grundbilder in Unterwäsche; fest gemalte Hosen, Stiefel, Rucksäcke und Oberteile sind aus dem aktiven Grundkörper entfernt. Ida übergibt Kutte, Flasche, Topfdeckel und Pfandschleuder beim Bestätigen der Hofprobe. Belegte Slots werden dabei nicht ersetzt, Zweihandregeln gelten weiter. Gespeicherte Ausrüstung bleibt erhalten.

Der Begrüßungstext unterscheidet zwischen unbekleideten und bereits ausgerüsteten Figuren. Weitere Questüberschriften sprechen vom Finden der Hose, ohne zu behaupten, dass sie bereits angelegt ist.

## Darstellung

- 192 authored poses across three heroes, four directions and three action atlases; the shared continuous walk rig supplies another 192 walking poses.
- Grundkörper: `assets/redesign/runtime/*-base.png`, Detailauflösung: `*-base-detail.png`.
- Kleidung folgt den sichtbaren Materialmasken der aktiven Pose. Kutte, Hose und Schuhe erscheinen unabhängig voneinander und verschwinden beim Ablegen. Vorhandene Vorder-/Rückentexturen werden wiederverwendet.
- Die Geometrie bleibt die des Grundkörpers; lange Mäntel und zusätzliche Ärmel brauchen weiterhin eigene Geometrie. Bei eng angezogenen Knien können Teile des Oberkörpers verdeckt sein.
- Quellen, genaue Prompts, Referenzen, Herkunftspfade und SHA-256 stehen in `assets/redesign/sources/underwear/generation.json`. Erzeugt mit dem eingebauten `image_gen.imagegen`; nur der Export ist deterministisch.

## Prüfung und Vorschau

`redesign-demo.html?hero=dieter&action=idle&outfit=bare&frame=0` zeigt den Start. Die Auswahl enthält außerdem Erste Kutte, Kutte und Hose sowie Kutte, Hose und Schuhe.

`tools/redesign/review-dressing.browser.js` prüft 384 Posen mit jeweils drei getrennten Kleidungsslots und bytegleicher Wiederherstellung nach dem Ablegen. Kontaktbögen und der echte Spieleinstieg liegen in `assets/redesign/review/dressing/`. Die Testfälle in `tests/starting-clothes.test.mjs` sichern Übergabe, Klassenwechsel, Wiederladen und vorhandene Ausrüstung ab; `tests/redesign.test.mjs` prüft Maskenbesitz, vollständige Lieferung, Herkunft und reproduzierbaren Export.

Quellen und Sichtprüfungen sind vom ausgelieferten Spiel und dessen Offline-Cache ausgeschlossen.
