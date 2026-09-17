---
name: maifeld-sprites
description: Maifeld-Detailpixel-Sprites für Mertloch Chronicles prüfen, importieren und aus der bestehenden Teilebibliothek zusammensetzen. Für Grafikdateien und Sprite-Pipeline; Spielmechanik und Storyinhalte bleiben bei ihren Fachrollen.
---

# Maifeld-Sprites

Arbeite aus dem Projekt-Root. Lies bei neuen Grafikaufträgen `docs/GRAFIK-REVIEW-5-RUNDEN-2026-09-17.md` für Befunde und Dateiverträge sowie den konkreten Auftrag. Die Icons-/Figurenlieferung steht in `assets/content-art/handoff-catalog.json`; die neue modulare Bibliothek in `assets/content-art/refinement/runtime/catalog.json`.

## Zuerst wiederverwenden

Für allgemeine Bewohner zuerst ein bestehendes Rezept oder `recipeFromSeed(seed,index)` aus `refinement-library.js` prüfen. Node-Export: `tools/sprite-pipeline/export-character.mjs`. Neue Köpfe und Hüte benötigen vier Ansichten, neue Körper/animierte Kleidung dieselbe vollständige Posenmatrix. Benannte Figuren nicht zufällig verändern. Menschen- und Tierrigs nicht mischen.

Version 1 unterstützt 432 Kombinationen, vier Richtungen und acht Posen. Ihre kurze Gehfolge, Faustangriffe und fehlenden Waffenebenen erlauben keine pauschale Freigabe als neuer Heldenrenderer. Ein Zusatzteil braucht klare Kompatibilität und Registrierung; keine stillen Fallbacks auf eine falsche Pose.

## Beim Generieren und Importieren

Neue kreative Rastergrafik mit dem verfügbaren Imagegen-Skill erzeugen. Original, tatsächlichen Prompt, Referenz und Herkunft sichern. Gleiche Prompts garantieren keine gleichen Bilder; nur Export und Rezepte sind deterministisch.

52 native Pixel Körperhöhe entsprechen 26 Welteinheiten. Gemeinsame 40-Farben-Palette aus `tools/sprite-pipeline/config.mjs`, Licht links oben. Referenz ist Anni. Maßstab pro Bogen festlegen, nicht jeden Frame auf seine Bounding-Box strecken.

Rasterprompts sind keine zuverlässigen Schnittgrenzen: zuerst Alpha-Silhouetten zuordnen. Für voneinander getrennte Effekte explizite geprüfte Zellgrenzen hinterlegen. Harte Alpha-Kanten, transparente Ränder, keine Nachbarfragmente. Semantische Kleidungsmasken verwenden; eine globale Farbersetzung würde Haut/Haar beschädigen.

24-px-Icons brauchen eine große erkennbare Form und wenige Materialflächen. Details im 1024-px-Original sagen nichts über ihre Lesbarkeit aus. Nur das native Exportbild abnehmen.

## Prüfen, bevor weiterverwendet wird

`art-workshop.html` zeigt alte/neue Icons, drei Hintergründe, Bauteile, Seed-Rezepte und tatsächliche Exporte. CSS- und Canvas-Abmessungen prüfen: `image-rendering: pixelated` allein verhindert keine krummen Skalierungsfaktoren.

Bei Bewegung auf wechselnde Beine, stabilen Rumpf, Fußpunkt und Requisiten achten. Unterschiedliche Hashes beweisen keinen guten Lauf. Kopf-/Hutansatz auch in Rückansichten und beim Angriff ansehen. Automatische Tests und visuelles Urteil getrennt berichten.

Ausführen: `node --test tests/art-refinement.test.mjs tests/art-handoff.test.mjs`, passende Browserprüfung unter `tools/sprite-pipeline/review-*.browser.js`, danach erforderliche Repository-Checks. Exportkataloge nicht von Hand reparieren.

Befunde und Grenzen in der Grafik-Übergabe festhalten; Renderer-Anbindung nach aktueller Rollenvereinbarung. Keine neue Freigaberunde erfinden, wenn der Nutzer die Arbeit bereits autorisiert hat. Zukünftige Motive dürfen als Art-Prototypen entstehen, wenn beauftragt; daraus folgen nicht automatisch neue Story-/Loot-Einträge.
