# Maifeld: eine Iteration für die Laufanimation

Die Hofprobe nutzt für Anni, Dieter und Keiler eigene Laufatlanten: acht Phasen in vier gezeichneten Richtungen, zusammen 96 zusätzliche Frames. Die bisherigen Kampf- und Standposen bleiben erhalten. Spielbar unter [maifeld-prototype.html](https://er-esm.github.io/mertloch-chronicles/maifeld-prototype.html).

## Änderungen

- Ein fester Maßstab pro Figur und Richtungsausrichtung anhand von Kopf beziehungsweise Rumpf verhindern, dass ein bewegter Fuß die ganze Figur seitlich verschiebt. Die Ausrichtung passt zur jeweiligen Standpose. Keine unabhängige Größenkorrektur einzelner Frames.
- Schritte folgen der tatsächlich zurückgelegten Strecke: 36 Welteinheiten pro Zyklus für Menschen, 24 für Keiler. Gegen eine Wand laufen lässt die Animation nicht weitertreten. Kleine seitliche Eingabeschwankungen ändern nicht sofort die Blickrichtung.
- Kurzes, geglättetes Anlaufen und Abbremsen, analoge Joystick-Stärke und normalisierte diagonale Geschwindigkeit. Beim Zaubern stoppt die Figur vollständig; erneute Bewegung bricht den Zauber weiterhin ab.
- Der Inspektor bietet Normaltempo, halbes Tempo, Zeitlupe, Pause, Einzelbild und Phasenanzeige. Der PNG-Download liefert den gerade gezeigten Laufatlas.
- Dieters erster neuer Atlas hatte zu ähnliche Beinstellungen. Die Korrektur ergänzt deutlich schmalere Durchschwungposen in Spalten 3 und 7. Die Quelle bleibt für einen Vergleich erhalten.

## Reproduktion und Herkunft

`npm run sprites:detail` baut Grundposen und Laufatlanten, `npm run sprites:walk` nur die neuen Laufatlanten. Danach `npm run sprites:check`, `npm test`, `npm run build`.

Generierte Originale: `assets/maifeld-prototype/sources/*-walk-*.png`. Aktive Dieter-Version: `dieter-walk-v2.png`. Die gespeicherten Anweisungen inklusive erfolgreicher Wiederholungen und der gezielten Korrektur stehen in `tools/sprite-pipeline/walk-prompts.json`. Der eingebaute Bilddienst hat einen zusätzlichen Korrekturversuch abgewiesen; daraus wurde kein Asset übernommen. Keine externe API oder Ersatzgrafik verwendet. Die technische Aufbereitung übernimmt `tools/sprite-pipeline/build-walk.mjs`; Hashes und Frame-Geometrie stehen in `runtime/walk-catalog.json`.

## Prüfung und ehrliche Bewertung

179 Tests bestanden, darunter bytegleicher Neuaufbau, acht unterschiedliche Frames pro Richtung, stabile Körperausrichtung, freie Atlasränder, Distanz-Takt, diagonale Bewegung, Abbremsen, Kollision und Stillstand beim Zaubern. Unterschiedliche Pixel-Hashes beweisen keine anatomisch korrekte Schrittfolge.

Im Browser alle drei Figuren in vier Ansichten, Zeitlupe und Einzelbilder geprüft; Kontaktbogen und Spielansichten visuell angesehen. Echte Tastaturbewegung mit Richtungswechsel und anschließendem Stillstand geprüft. Handy-Inspektor bei 390 × 844 ohne horizontalen Überlauf und mit bedienbaren neuen Kontrollen. Bestehender Touch-/Querformat-Test bestanden. Vollständige Hofprobe über echte Spielbuttons bestanden: drei Keiler besiegt, Schaden erhalten, zu Oskar zurückgekehrt und die Schürze gewählt (185 maximales Leben).

Diese Iteration liefert mehr Zwischenphasen und ruhigere Übergänge. Die generierten Zyklen sind noch keine vollständig handanimierte Produktionsanimation: Die gegenüberliegenden Fußkontakte sind bei den Menschen nicht überall klar genug getrennt, beim Keiler schwankt die Körperausrichtung etwas. Ausrüstung, Armseiten und sauber getrennte Bein-Layer bleiben weitere Qualitätsarbeit. Keine Behauptung, dass allein acht Frames diese Probleme vollständig lösen. Die Änderung betrifft den gewählten detaillierten Prototyp, nicht sämtliche Figuren des Hauptspiels.
## Nachkorrektur 0.18.5: zitternde Eber

Die ursprünglichen Eber-Frames wechselten Rückenform, Kopfwinkel und Felltextur. Zusätzlich pendelte das bisherige Herumlaufen um eine Distanzschwelle zu einem ständig wandernden Ziel, wodurch Lauf- und Standposen im schnellen Wechsel erschienen. Die neue Umsetzung ersetzt beim Eber den Wechsel ganzer Körperbilder durch vier feste Körperansichten mit jeweils vier separat animierten Bein-Layern. Der Körper bleibt auch beim Anhalten derselbe. Die Beine folgen einer kontinuierlichen Schrittphase mit sanftem Ausblenden beim Stoppen; Vorder-/Hinterbeine sind zeitlich versetzt. Angriffe und Treffer verwenden kurze gezielte Verschiebungen desselben Körpers. Kleine Änderungen der Verfolgungsrichtung lösen keinen ständigen Front-/Rückenwechsel mehr aus.

Herumlaufen nutzt feste Ziele und anschließende Pausen. Alte Atlanten bleiben als Vergleich erhalten, werden für Eber im Prototyp aber nicht mehr gerendert. Der Inspektor zeigt und verlinkt das aktive Rig. Grafikquelle: `assets/maifeld-prototype/sources/keiler-rig-v1.png`; Pack-Ergebnis: `runtime/keiler-rig.png` und `runtime/keiler-rig.json`; Prompt: `tools/sprite-pipeline/boar-rig-prompts.json`. Erzeugung über den eingebauten Bilddienst; technische Segmentierung, Palette und Packing über `build-boar-rig.mjs`, Bewegung über Canvas-Transformationen in `maifeld-boar-rig.js`.

Validierung: 183 Tests bestanden. Zusätzliche Prüfungen für unveränderten Körper, nahtlosen Zyklus einschließlich Bewegungsableitung, mindestens zwei Standbeine, feste Laufziele/Pausen und ruhige Blickrichtung. Browser-Rasterprüfung in allen vier Ansichten: 32 Zeitpunkte, jeweils 0 veränderte Pixel im Kopf-/Rückenbereich und 32 unterschiedliche Fußbilder. Im laufenden Spiel bei der Beobachtung 3 Start-/Stoppwechsel in 4,2 Sekunden statt ständigem Umschalten. Desktop und Handyansicht visuell geprüft; vollständige Hofprobe mit drei besiegten Gegnern und gewählter Belohnung bestanden. Reproduzierbare Browserprüfung: `scripts/playwright-boar-rig.mjs`.

Die Animation ist eine stilisierte Bewegung mit einem starren Rumpf und beweglichen Beinen, noch kein anatomisch ausgearbeitetes Mehrgelenk-Rig mit bodenfesten Hufen. Sie behebt den wechselnden Körper und das hektische Umschalten gezielt. Die vorher beschriebene leichte Körperdrehung des alten Eber-Zyklus ist im aktiven Lauf-Rig entfernt.
