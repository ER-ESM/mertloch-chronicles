# UI-Bewertung: Block A und B · 0.18.1

Umsetzung der Aufgaben aus [VISUELLE-BEWERTUNG-2026-09-13.md](VISUELLE-BEWERTUNG-2026-09-13.md). Ausgangspunkt dieser Sitzung war 0.18.0; die ursprüngliche Bewertung beschreibt 0.17. A1 und A4 waren bereits korrigiert und wurden erneut geprüft.

## Erledigte Punkte und Bildbelege

Die Bilddateien liegen lokal unter `visual-review/`. `round-ab-before` enthält den tatsächlichen Ausgangsstand dieser Sitzung, `round-ab-final` den vollständigen Rundgang. Die abschließende Tabellen-/Kartenprüfung liegt in `round-ab-help-final`. Jeder Pfad in der Tabelle bezeichnet ein Vorher-/Nachher-Paar, sofern nicht ausdrücklich ein bestehender Fix geprüft wurde.

| Punkt | Ergebnis | Vorher → Nachher |
|---|---|---|
| A1 | Acht Attributzeilen, Wertung und Prozent gemeinsam; bestehender Fix bestätigt. | `round-ab-before/desktop-person-tab1.jpg` → `round-ab-final/desktop-person-tab1.jpg` |
| A2 | Skillbuchauswahl darf umbrechen; Charakter ohne abgeschnittenen Füllkopf; Ausweichknopf mit eindeutigem Skillbild und zugänglichem Namen. | `round-ab-before/desktop-book-tab1.jpg`, `phone-person.jpg`, `phone-hud.jpg` → gleiche Namen in `round-ab-final/` |
| A3 | Bewohner werden ausdrücklich deckend gezeichnet. Baumverdeckung begrenzt die Transparenz auf den Kronenbereich; Stamm und folgende Zeichenvorgänge bleiben deckend. | `round-ab-before/desktop-hud.jpg` → `round-ab-final/desktop-hud.jpg`; zusätzlicher Pixelnachweis in `hud-checks.json` |
| A4 | Helle Straßenbeschriftung mit dunkler Kontur; bestehender Fix bestätigt. | `round-ab-before/desktop-hud.jpg` → `round-ab-final/desktop-hud.jpg` (Kirchvorplatz) |
| A5 | Dauerhafter Begrüßungseintrag unten links entfernt. Echte Kampfmeldungen liegen mit Kontrastfläche oberhalb der Lernkarte. | `round-ab-before/desktop-hud.jpg` → `round-ab-final/desktop-hud.jpg` |
| A6 | Hofprobe ist einklappbar, auf Touch zunächst kompakt. Sie dockt unter tatsächlich sichtbaren Spieler-/Zielfenstern an; `?` öffnet Idas Anleitung. | `round-ab-before/phone-tutorial.jpg` → `round-ab-final/phone-tutorial.jpg`, zusätzlich `phone-tutorial-expanded.jpg` und `phone-tutorial-target.jpg` |
| B1 | Bedienhinweise aus Skillbuch, Talent- und Itemtooltips sowie Charakter-/Rucksackfenster entfernt. Kampfhilfe erklärt die Bedienung zentral und gerätespezifisch. | `round-ab-before/desktop-book-tab1.jpg`, `desktop-talents.jpg` → gleiche Namen in `round-ab-final/`; Talentdetails zusätzlich in `round-ab-play/phone-talent-confirm.jpg` |
| B2 | Aufgelistete Fülltexte entfernt. Eine tatsächlich beendete Parade wird beim Ausrüstungswechsel kurz gemeldet. | `round-ab-before/desktop-person.jpg` → `round-ab-final/desktop-person.jpg` |
| B3 | Überblick aus drei Abschnitten mit je drei Stichzeilen. Eigener Reiter mit Bedien-/Tastentabelle; Kniffe mit Klassenrotation aus Inhaltsdaten und individuellen Skillbildern. Lange Skilltexte in kurze Sinnabschnitte aufgeteilt. | `round-ab-before/desktop-guide.jpg` → `round-ab-help-final/desktop-guide.jpg`; Tabelle: `landscape-guide-tab1.jpg` und Folgeseiten |
| B4 | HUD-Symbole verwenden Canvas-Sprites; Journal und Touchkonfiguration nachgezogen. Dialogbelohnung zeigt einen goldenen Dosenöffner statt einer Schachfigur. | `round-ab-before/desktop-hud.jpg` → `round-ab-final/desktop-hud.jpg`; Belohnung in `round-ab-final/dialogues/desktop-quest-ready.jpg` |
| B5 | Leere Aktionsplätze zeigen nur Nummern. Das Plus erscheint bei sichtbarem Skillbuch und verschwindet beim Minimieren/Schließen. | `round-ab-before/desktop-hud.jpg` → `round-ab-final/desktop-hud.jpg`, zusätzlich `desktop-hud-book.jpg` |
| B6 | Doppelte Auftragsbuch-/Charakter-Kicker entfernt; Menü nennt nur noch den Ort zusätzlich zum Fenstertitel. | `round-ab-before/desktop-quest.jpg` → `round-ab-final/desktop-quest.jpg` |
| B7 | Annis Biografie auf zwei Sätze gekürzt; gleiche Kartenhöhe für alle drei Figuren innerhalb eines Bildschirmformats. Persönlichkeit und Spielweise bleiben vollständig im Detailfenster verfügbar. | `round-ab-before/desktop-clan.jpg` und Folgeseiten → `round-ab-help-final/desktop-clan.jpg` und Folgeseiten |

Der ursprüngliche Transparenzfehler aus vr2-07 war im aktuellen Ausgangsstand nicht eindeutig reproduzierbar. Die Bewohneratlanten enthalten deckende Innenpixel. Deshalb wurde die Grenze zwischen Kronentransparenz und Personendarstellung zusätzlich abgesichert, ohne die Figuren neu zu zeichnen. Der Browser-Pixeltest misst Alpha 71/255 in der Krone sowie 255/255 im Stamm und bei einem anschließend gezeichneten Objekt; der Canvas-Zustand wird korrekt zurückgesetzt.

## Browserprüfung

- Desktop **2024 × 900**, Touch-Hochformat **390 × 844**, Touch-Querformat **844 × 390**, mit echter Touch-Emulation in Chrome. Keine Behauptung eines Tests auf physischer Handyhardware.
- Vollständiger Menürundgang: **175 Ansichten**, elf Menüs einschließlich Reitern und Seiten. Kein horizontaler oder vertikaler Überlauf der geprüften Popup-Inhalte; gemessene Touchbuttons mindestens 44 CSS-Pixel. Bericht: `round-ab-final/audit.json`.
- Nachprüfung von Kampfhilfe und Figurenkarten: **52 Ansichten**, einschließlich korrigierter Tabellenpagination mit wiederholten Spaltenüberschriften. Die Sichtprüfung fand zuvor alleinstehende Tabellenzeilen; der Browserprüfer kontrolliert nun zusätzlich die Tabellenstruktur. Bericht: `round-ab-help-final/audit.json`.
- Drei Figurenkarten jeweils gleich hoch: Desktop 208,8 px, Hochformat 191,2 px, Querformat 177,2 px.
- Geführter Start, Gespräche, Belohnungsauswahl, Beuteaufnahme, Schließen des Lootfensters durch Weglaufen und beide Minispiele in allen drei Formaten bestanden. Bericht: `round-ab-final/dialogues/checks.json`.
- Spieltest des gebauten Pakets: Gegenstandssuche, Austausch belegter Ausrüstung, direkte Skillbelegung, Talentfähigkeit, Kartenroute, Ortspeicherung und Kämpfen bei geöffnetem Inventar in beiden Touchformaten. Bericht: `round-ab-play/checks.json`.
- **163 Spieltests bestanden**, Inhaltsprüfung bestanden, Build erfolgreich. Balance-/Grafikberichte erneut erzeugt; keine neue Balance oder neuen Figurenaufträge durch diese UI-Runde.

Reproduzierbarer Gesamtrundgang: `node scripts/visual-round.mjs ab-after http://localhost:4173/`. Die Browserprüfer sichern und restaurieren die Spielstände des isolierten Testbrowsers.

## C1: Entscheidung ausstehend

Die Entscheidung zur Zeichensprache wurde dem Chef vor Änderungen an C1 vorgelegt. Empfehlung: **Annis bestehenden Detailstil beibehalten und Dieter, Kevin sowie die übrigen Figuren daran angleichen.** Alternative: Anni, Gebäude und Tiere zurück auf die gröbere Comic-Pixel-Familie führen. Bis zur Antwort werden keine neuen Figuren-Sprites für diese Richtungsentscheidung erstellt. C2–C5 und D gehören nicht zu dieser A/B-Umsetzung.
