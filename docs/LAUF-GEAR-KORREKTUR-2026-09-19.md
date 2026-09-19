# Laufbewegung und Fundstücke – Korrektur der E32-Lieferung

Die vorherige visuelle Freigabe war zu großzügig. Gegenläufige Gelenke und verschiedene Frame-Hashes reichten nicht aus: Der Export zerschnitt Schürzen und Stiefel, die Vorschau lief deutlich langsamer als das Spiel, und der Detailrenderer verwendete für Fundstücke noch pauschal skalierte Einzelteile.

## Referenzen und Befund

- [Animation Mentor: Basic Human Walk Cycle](https://www.animationmentor.com/blog/tutorial-animating-human-walk-cycle/): Kontakt, Absenken, Passing, Anheben, Hüftbewegung und gegenläufige Arme. Standbeinbewegung muss gleichmäßig sein; ein guter Zyklus auf der Stelle ist noch keine Freigabe für die Bewegung durch die Welt.
- [Adobe: Walk Cycle](https://www.adobe.com/creativecloud/animation/discover/animation-walk-cycle.html): wechselnde Beinstellung, Gewichtsverlagerung und Bewegung des Oberkörpers.

Der produktive Detailrenderer läuft vor dem optionalen 3D-Pre-Render-Renderer. Die Knochen-/Tiefenmasken der 3D-Platzhalter werden deshalb nicht auf die gezeichneten Helden angewendet. Diese Korrektur bindet die vorhandenen Detailbilder und Ausrüstungsmaterialien an denselben 2D-Posenexport; sie behauptet keine Lieferung neuer 3D-Modelle.

## Änderung

`walk-rig.mjs` Version 4 verwendet zusammenhängende Meshstreifen mit gemeinsamen Knie- und Knöchelkanten. Schürzen bleiben vor den Beinen. Kleine isolierte Bildreste werden bei den Helden vor der Vermessung entfernt; sie dürfen weder Fußhöhe noch Beinachse bestimmen. Absenken/Anheben, dezente Gewichtsverlagerung und Armschwung sind getrennt. Die Handanker folgen derselben Verformung wie die gemalten Hände; Zweihandhaltung erhält nur eine kleine gemeinsame Bewegung.

Die Heldenanimation benötigt 80 statt 20 Welteinheiten pro Zyklus: bei 122 Welteinheiten/s sind das 1,525 statt 6,1 Zyklen/s. Demo und Laufprüfseite benutzen dieses Tempo ebenfalls. Die Spielgeschwindigkeit bleibt unverändert. Das ist weiterhin eine stilisierte Bewegung: Bei dieser hohen Fortbewegungsgeschwindigkeit gibt es keine physikalisch exakte Fixierung des Standfußes am Weltboden. Eine solche Abstimmung braucht zusätzlich einen eigenen schnellen Laufzyklus oder eine andere Fortbewegungsgeschwindigkeit.

Hose, Stiefel, Handschuhe und Armschienen werden im Detailrenderer über `wearRuns` der aktiven Pose gezeichnet. Die vorhandenen Materialtexturen behalten Falten und Nähte; gemeinsame Präzisionspalette, Silhouette und Verdeckung durch Schürze/Körper bleiben erhalten. Die alten frei darübergelegten Rechtecke dieser Slots entfallen. Andere Schmuck-, Helm- und Waffenregistrierungen bleiben separate Teile. Die Stoffmasken ersetzen keine neuen Silhouetten für künftig anders geschnittene Kleidung.

32 menschliche NPCs/Gegner erhalten ebenfalls die zusammenhängenden Beinstreifen. Registrierte Requisiten bleiben am Oberkörper. Lange Mäntel, Röcke und Schürzen besitzen eigene Beinansätze und kleinere Ausschläge. Tieranimationen sind unverändert.

## Prüfung

- `tools/redesign/review-fit.browser.js`: 384 Heldenposen mit/ohne die vier betroffenen Slots. Jede Kombination verändert sichtbare Materialpixel; keine verändert die Alpha-Silhouette. Vier Richtungen, Normal- und Zweihandhaltung; keine Browserfehler im geprüften Lauf.
- Die Kontaktfolgen aller 35 menschlichen Figuren und die vollständigen Heldenfolgen wurden als Bilder geprüft. Die Prüfung fand zusätzlich die isolierten Bildreste bei Annis Zweihandhaltung und die Mantelansätze.
- Sichtbelege: `assets/redesign/review/walk-fit-v4/`. Die NPC-Übersichten `npc-*` zeigen den Zwischenstand, `coats-final.png` die anschließende Korrektur der langen Säume. Die abschließend regenerierten Heldenübersichten zeigen den neuen Stand.
- `tests/gait-fit.test.mjs` prüft die tatsächliche Bewegungsschleife, die Animationsfrequenz, alle Maskenregistrierungen und die mitbewegten Handanker. Bestehende Exportprüfungen prüfen weiterhin Reproduzierbarkeit.

Validierung: Gesamtsuite 476/476 bestanden. Nach den letzten Anpassungen an Schuhen und Mantelsäumen nochmals alle 21 betroffenen Export-/Renderer-/E32-Tests bestanden. Produktionsbuild erfolgreich; abschließende Browserprüfung 384/384 sichtbare Ausrüstungsänderungen bei unveränderter Silhouette, keine Browserfehler und kein horizontaler Seitenüberlauf auf 390 px.

Vergleich im Browser: `gait-review.html` mit Spieltempo, Zeitlupe und Einzelbildern; `redesign-demo.html?hero=anni&action=walk&armor=1` mit echten Fundstück-Slots. Beide benutzen den Spielrenderer.

Rebuild: `node tools/redesign/build.mjs`, `node tools/class-visuals/build-locomotion.mjs`. Danach `npm test`, `npm run build` und die Browserprüfung ausführen. Reviewbilder werden nicht in den Produktionsbuild kopiert.
