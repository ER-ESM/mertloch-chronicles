# Redesign und produktive Sprite-Pipeline

Aktiver Nutzerauftrag: die bestätigten detaillierten Themenhelden vollständig in allen vier Richtungen und allen Bewegungen umsetzen und produktiv verwenden.

## Lieferung

- Referenzen: `assets/theme-demo/sources/` (Dieter/Braukunst, Anni/Aperol, Kevin/Pfand).
- Neue Quellen: `assets/redesign/sources/`, tatsächliche Prompts daneben.
- Bewegungsmatrix: Stand, acht Laufphasen, Nahkampfvorbereitung/Schlag/Erholung, Treffer, Parade, Zaubern, Sitzen, Fernkampfvorbereitung/Schuss, Ausweichen und Tod. Alle vier Richtungen. Zusätzlich eigene beidhändige Stand-/Schlag-/Erholungsposen und acht beidhändige Laufphasen.
- Gehaltene Ausrüstung von Körpern getrennt; bestehende Item-IDs und Spielregeln bleiben erhalten.
- Kein Aktivieren unvollständiger Bewegungsmatrizen. Byte-reproduzierbare Exporte, feste Größen/Fußpunkte, geprüfte Griffpunkte und Sichtprüfung im Spiel gehören zur Abnahme.

`redesign-art.js` ist der erste Figurenpfad in `live-art.js` und wird beim normalen Spielstart geladen. Dieter, Anni (`baerbel` bleibt der Spielstandschlüssel) und Kevin sowie ihre Mentoren verwenden ihn. Die Abmessungen bleiben 104 native Körperpixel auf 26 Welteinheiten, Zelle 192 × 192, Fußpunkt 96/160. Die vergrößerte Ansicht verwendet bei Bedarf 208 Körperpixel in 384er-Zellen.

Die [interaktive Bewegungsdemo](../redesign-demo.html) bietet vier Ansichten, alle Zustände, neun echte Inventarsets, Themenwaffen, Einzelbildsteuerung, Griffpunktanzeige, Dorfkulisse und PNG-Export. Sie ruft denselben Figurenrenderer wie das Spiel auf. Die ursprüngliche [Themenkollektion](../theme-demo.html) bleibt als Stilreferenz erreichbar.

## Reproduzierbarer Export

```sh
npm run redesign:build
npm run redesign:check
npm test
npm run build
```

- `tools/redesign/jobs.json`: Rasterquellen und Generationsaufträge. Maßgeblich für tatsächlich ausgeführte Generierungen sind die Prompt-Dateien und `assets/redesign/generation.json` mit SHA-256, Referenzen und ursprünglichen Ausgabepfaden.
- `tools/redesign/build.mjs`: Alpha-Silhouetten zuordnen, feste Bogenskalierung, Palette, harte Alpha-Kanten, Ränder, Fußpunkte, Griffpunkte und semantische Stoffmasken exportieren.
- `tools/redesign/registration.json`: explizite Richtungsreparaturen einzelner Quellzellen und beidhändige Griffpositionen. Keine manuelle Änderung generierter Kataloge.
- `tools/redesign/walk-rig.mjs`: acht Laufphasen aus den detailliert gezeichneten Standfiguren. Zwei Gelenke pro Bein, Fußziele auf der projizierten Bodenebene, Kniebeugung durch inverse Kinematik, begrenzte Knochenlängen und gemeinsamer Bodenkontakt. Der Oberkörper bleibt in der bewaffneten Bereitschaftshaltung. Eigene Ausgangszeichnung für Zweihandwaffen.
- 15 Körperatlanten mit zusammen **384 Frames**; sechs neue Gear-Motive mit je vier Ansichten. Quellen, Arbeitsstudien und Prüfbilder werden nicht in den Produktionsbuild oder Offline-Spielcache kopiert. Die Runtime-Dateien werden über den vorhandenen Inhalts-Hash versioniert.

Die automatisch gezeichneten Laufstudien sind als verworfene Quellen dokumentiert: Sie wechselten die führenden Beine nicht zuverlässig. Der produktive Lauf benutzt deshalb das deterministische Gelenkrig. Das sind gerenderte Rasterfiguren mit Gelenkanimation, keine neu gelieferten GLB-Modelle. Der frühere Kasten-Rig-Weg bleibt als technische Vergleichsdemo erhalten.

## Ausrüstung und Spielzustände

- Bestehende Item-IDs, Werte, Slots und Spielstände bleiben gültig. `equipmentAppearance()` liefert weiterhin die tatsächliche Ausrüstung; Zweihandwaffen verdrängen die Nebenhand, Fernkampf holt die ausgerüstete Fernwaffe hervor und verstaut Nahkampfwaffe/Schild.
- Neue thematische Darstellungen: Fasshammer, Hopfenschild, Kupfersprüher, Zitrusschild, Pfandschleuder und Pfandschild. Die übrigen Ausrüstungsfamilien verwenden die vorhandene Präzisionsbibliothek. Es werden keine neuen Loot- oder Balanceeinträge erfunden.
- Waffen sitzen an registrierten Griffen; gezeichnete Finger liegen vor dem Griff. Vorder-/Rückansichten verwenden eigene Gear-Zeichnungen und Verdeckung. Zweihandposen halten beide Fäuste am selben Schaft.
- Stoffvarianten färben nur ausgewählte Stoffflächen und behalten Nähte/Falten. Haut, Gesicht und der zentrale Kupfertank sind ausgeschlossen. Kopfbedeckung, Stiefel, Schmuck und weitere Slots bleiben separate Teile; Stiefel folgen beim Laufen den Fußgelenken.
- Zustandspriorität: Tod → Ausweichen → Treffer → Parade → Wirken → Angriff → Laufen → Rasten → Stand. Laufen taktet über Wegstrecke, nicht über abgelaufene Zeit. Angriff verdrängt die Laufpose auch bei gleichzeitiger Bewegung.
- `hurt`, `dash` und `castPose` sind kurze visuelle Timer; Schaden, Fähigkeitendauer und Bewegung bleiben unverändert. Respawn/Clanwechsel räumen die visuellen Timer auf.
- Ein unvollständiger Katalog oder ein fehlender nativer Atlas aktiviert die Lieferung nicht. Der bisherige Renderer bleibt dann verfügbar. Große Detailatlanten laden nur bei Vergrößerung; im Speicher bleibt höchstens einer pro Held. Stoffmasken laufen als kompakte Pixelstreifen im Katalog, nicht als zusätzlich dekodierte Großbilder. Der Farbvarianten-Cache ist auf 32 Bilder begrenzt.

## Prüfung

`tests/redesign.test.mjs` prüft Matrix, Alpha/Ränder, Richtungen, Quellprovenienz, bytegenauen Neu-Export, Gelenkwechsel, Zustandspriorität, echte Schadens-/Ausweich-/Wirkereignisse, Zweihand-/Fernkampfauswahl sowie vollständigen und fehlgeschlagenen Ladevorgang. Die bestehenden Tests prüfen weiterhin Kampf, Inventar, Welt, alte Grafikpfade und Offline-Paketierung.

`tools/redesign/review.browser.js` prüft die neun Inventarsets über die Bewegungsmatrix, nimmt Vorder-/Rückansichten und Sonderposen auf und startet alle drei Helden im tatsächlichen Spiel. Prüfbilder liegen in `assets/redesign/review/`; technische Prüfergebnisse werden nach dem abschließenden Lauf dort gesichert. Visuelle Abnahme und automatische Strukturtests sind getrennte Nachweise.

Abschlussnachweis: vollständige Testsuite **396 bestanden, 0 Fehler**; Produktionsbuild erfolgreich. Browserprüfung: neun Sets, je 128 Renderaufrufe und 80 unterschiedliche Zustands-/Richtungsbilder, keine abgeschnittenen Bilder oder Browserfehler, kein horizontaler Überlauf bei 390 px. Im gebauten Spiel wurden die vier Laufrichtungen mit echter Tastatureingabe geprüft. Ein vollständiger Neustart des gebauten Spiels bei abgeschaltetem Netzwerk lädt den neuen Renderer aus dem Service-Worker-Cache. Ergebnisse: `assets/redesign/review/browser-result.json` und `validation.json`. Die Veröffentlichung erfolgt nach diesen Prüfungen per Fast-Forward auf `main` über den bestehenden GitHub-Pages-Workflow. Der veröffentlichte Stand wird anschließend im Live-Spiel und in der Demo kontrolliert.
