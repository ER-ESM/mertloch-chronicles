# Fähigkeiten, Procs und Kampfeffekte

Neue, produktiv angebundene Effektgrafiken für Dieter, Anni und Kevin. Einstieg: `combat-fx-demo.html`, außerdem im Spiel unter Einstellungen → Kniffe & Effekte.

## Grafiklieferung

Sieben Materialanimationen mit je sechs gezeichneten Phasen: Bier/Schaum, Zitrus, elektrischer Schrott, Heilung, Schildkontakt, Proc-Stern und feindlicher Feuerstoß. Daraus setzt der Renderer die unterschiedlichen Angriffe, Würfe, Entladungen, Zonen und Statusanzeigen zusammen. Es sind **42 Materialframes**, keine 42 unabhängig gezeichneten vollständigen Fähigkeiten.

Originale, exakte Generierungs- und Korrekturprompts, Referenzen und SHA-256 unter `assets/skill-fx/sources/` und `generation.json`. Imagegen erzeugte zunächst übergroße Spitzen bzw. diffuse Höfe; die zweiten Lieferungen wurden mit geprüften Schnittgrenzen und Alpha-Schwelle exportiert. Eine feste Skalierung pro Quellbogen erhält die Größenentwicklung. Gemeinsame Präzisionspalette, harte Alpha-Kanten, transparente Zellränder. Reproduzierbarer Export: `npm run fx:build`. Originale und Reviewbilder werden weder veröffentlicht noch im Offline-Cache gespeichert.

## Spielvertrag

`combat-fx.js` beschreibt Ereignisse; `combat-fx-art.js` zeichnet sie. Derselbe Renderer wird in `renderer.js` und im Trainingsplatz verwendet. Die Produktion lädt den Atlas beim Start und speichert ihn im atomaren PWA-Release.

| Auslöser | Sichtbares Ergebnis |
| --- | --- |
| Tatsächlicher Schaden | Materialblitz am Ziel; kritische Treffer mit zusätzlichen Splittern |
| Nahkampf / Fernkampf | Richtung aus tatsächlichem Ursprung und Ziel; unmittelbare Spur bei synchron aufgelöstem Fernschaden |
| Drei Punkte + Markierung | Größere Entladung, mehr Materialsplitter und zweite Welle |
| Bodenangriff | Vorbereitung mit Fortschritt und echtem Radius; Explosion erst beim Ablauf der Verzögerung |
| Markierung / Betäubung / Verlangsamung / Verwundbarkeit | Zielklammern / kreisende Sterne / Fußlinien / gebrochene Klammern, abgeleitet aus dem aktiven Zustand |
| Paradebereit / erfolgreicher Block | Ruhiger Schildaufbau; Kontakt und Splitter erst beim tatsächlich abgefangenen Angriff |
| Deckung / Lebensverlust | Getrennte Kontakt- und Schadensereignisse; vollständig absorbierter Schaden erzeugt keinen Lebensverlustblitz |
| Heilung / Überheilung | Blätterspirale nur bei tatsächlichem Lebensgewinn; Überheilungsdeckung erhält ein Schildereignis |
| Proc | Goldener Aktivierungsstern nach erfolgreicher Regelauswertung; kurzer Wirkungstext, keine zweite überlappende Textzeile |
| Kostenlos / verstärkt | 0 / ×2 über dem Helden, nur bis Verbrauch oder Ablauf; Verbrauch hat eigenen kurzen Stern |
| Tempo / Rausch / Klassenbuff | Bewegte Lichtpunkte / Rauschpunkte / Fußring aus dem aktuellen Zustand |
| Talentflächen | Absperrpfosten, Fassspritzer, Heilblätter, Drahtspitzen oder Nachglut am wirklichen Wirkungsradius |
| Magnet / Kettenzündung | Spur zwischen tatsächlicher alter und neuer Gegnerposition / Explosion an jedem tatsächlich gezündeten Ziel |
| Ausweichen | Bewegungsspur; zusätzliche Ausweichreaktion nur bei tatsächlich vermiedenem Treffer |

Die Darstellung verwendet keine Zufallszahlen der Kampfsimulation und verändert keine Schadenswerte, Kosten, Abklingzeiten oder Proc-Chancen. Maximal 256 kurzlebige Ereignisse. Pause hält Animationszeit an. Feindliche Bodenangriffe behalten ihre tatsächliche elliptische Grenze. Numerische passive Boni bleiben in ihren vorhandenen Anzeigen; sie werden nicht als neue aktive Fähigkeiten dargestellt.

## Prüfung und Grenzen

- `npm run fx:check`: Export-Reproduzierbarkeit, Alpha/Ränder, alle Klassenfähigkeiten/Proc-Regeln, Fehlschläge und Zauberabbruch, verzögerter Bodeneinschlag, kritischer/periodischer Schaden, Unterbrechung, Heilung/Überheilung, Absorption, Parade/Ausweichen, Proc-Zähler/Verbrauch/Ablauf, Ereignislimit und unveränderter Zufallsstrom.
- `tools/skill-fx/review.browser.js`: 108 verfügbare Kombinationen aus drei Klassen und neun Spezialisierungen; drei echte Proc-Abfolgen; mobile Ansicht; expliziter Fehlerhinweis bei einem alten Engine-Cache.
- Native Exporte und eingefrorene Spielszenen visuell geprüft. Reviewbilder unter `assets/skill-fx/review/`: drei Themen, Heilung, Parade, Mobilansicht und normaler Produktionsrenderer im Dorf.
- Gegenüber dem ersten Review wurden doppelte Proc-Texte entfernt, Schildaufbau vom Einschlag getrennt, Heilung/Schild transparenter gemacht und CSS-Skalierung auf echte Canvas-Pixel korrigiert. Goldene Proc-Sterne werden nicht für normale Finisher verwendet.

Der Trainingsplatz verwendet die echte `Game`-Simulation, bereitet aber ausdrücklich Stufe 30, gelernte Talente, verletztes Leben, drei Punkte und ein markiertes Übungsziel vor. Er speichert keinen Spielfortschritt. Die Proc-Abfolge wartet reale Abklingzeiten ab (Annis zweite Heilung nach etwa zehn Sekunden). Demoansicht 4× zeigt die Details; 2× entspricht der üblichen Desktop-Spielgröße. Starke Entladungen dürfen das Ziel kurzzeitig überdecken; Lebensbalken und Zahlen werden anschließend darüber gezeichnet.

Abschlusspr?fung: 437 Tests nach Integration von Kampfstatistik und Scrolling Combat Text bestanden; zus?tzlich 108 Browser-Szenarien ohne Laufzeitfehler. Die VFX bleiben unabh?ngig davon aktiv, ob die schwebenden Kampftexte ein- oder ausgeschaltet sind.
