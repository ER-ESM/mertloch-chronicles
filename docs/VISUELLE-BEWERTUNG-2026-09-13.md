# Visuelle Bewertung · 2026-09-13

Zwei Rundgänge im Browser (Vollbild 2024×900, mobil 390×844), Screenshots lokal in `visual-review/round-content-1/` (Stand 0.13, Commit fc2fcee) und `visual-review/round-content-2/` (Stand 0.17, Commit 81fcf13, mit Aperol-Anni, Hofprobe, Porträts, Talentgraph, 16 Ausrüstungsplätzen). Bewertet wird der **aktuelle Stand 0.17**; die erste Runde dient als Vorher-Bild. Keine Konsolenfehler in beiden Runden.

Frage: Wirkt das Spiel wie ein gestaltetes Werk oder wie zusammengewürfelte KI-Ausgabe („AI-Slop“)?

## Guideline gegen AI-Slop

Slop erkennt man daran, dass etwas *generiert* statt *entschieden* aussieht. Zehn Regeln, jede prüfbar:

1. **Eine Zeichensprache.** Figuren, Tiere, Gebäude, Bäume und Icons müssen aus derselben Hand wirken: gleiche Konturstärke, gleiche Pixeldichte, gleiche Schattenrichtung, gleiche Palette (`ART-DIRECTION.md`). Zwei Stile nebeneinander sind Slop, egal wie schön jeder für sich ist.
2. **Maßstab ist Gesetz.** Held ≈ 26 px, Tür ≈ 35 px, ein Meter = 8 Welteinheiten. Was das bricht, fliegt raus.
3. **Icons bedeuten etwas.** Ein Icon zeigt den benannten Gegenstand oder die Wirkung. Fundus-Platzhalter (Zahnrad, Ring, Note) für benannte Talente sind Slop. Alle Icons einer Fläche haben dieselbe Farbigkeit: entweder alle farbig oder alle als Stempel.
4. **Kein Text erklärt die Bedienung der Bedienung.** „Überfahren: Erklärung · Goldrand: nicht auf der Leiste“ ist ein Tooltip, der Tooltips erklärt. Bedienhinweise gehören an genau eine Stelle (Kampfhilfe), nicht in jedes Fenster.
5. **Kurz und dörflich.** Keine Textwände. Ein Absatz pro Gedanke; Tastenlisten als Tabelle. Ton aus `content/` (derb, konkret), nicht Handbuch.
6. **Nichts wird abgeschnitten.** Namen, Fußzeilen, Werte vollständig lesbar oder bewusst gekürzt („…“ mit Tooltip).
7. **Jeder Wert genau einmal.** Ein Attribut steht an einer Stelle mit einer Zahl. Wertung und Prozent gehören in eine Zeile („Glückstreffer 0 · 5 %“), nicht in zwei Listen.
8. **Touch ist nicht Maus.** Auf dem Handy keine „Überfahren“-, „Rechtsklick“- oder „Ziehen“-Hinweise; ein Fenster gleichzeitig; nichts überlagert Steuerkreuz oder Aktionsleiste.
9. **Dekoration hat einen Grund.** Wimpel, Blumenkästen, Fässer nur dort, wo sie erzählen. Gleichmäßig verteilter Schmuck ist Tapete. Füllsätze („Dein Kram. Dein Kampfstil.“) sind Text-Tapete.
10. **Kontrast vor Stimmung.** Ortsnamen auf der Karte lesbar vor jedem Boden (Kontur oder Plakette).

## Bewertung je Bildschirm (Stand 0.17)

Skala 1–5 (5 = gestaltet, 1 = generiert). Belege sind Screenshots der Runde 2, Vergleichswert aus Runde 1 in Klammern.

| Bildschirm | Note (0.13 → 0.17) | Beleg | Was gut ist | Was Slop ist |
|---|---:|---|---|---|
| Spielwelt Dorfkern | 3 (3) | vr2-01, vr2-07 | Straßen, Kirche, Brunnen, Aushang: stimmige Szene; Ortsplakette „Clan-Treff“; Ida mit Zielring | **Zwei Zeichensprachen bleiben:** Gebäude, Tiere und Anni im weichen Detailstil, Dieter, Kevin und Bewohner flach. Kirche und Fachwerkhäuser wirken wie aus einem anderen Spiel (Regel 1). Ein Bewohner am Brunnen halb durchsichtig (vr2-07). „Kirchvorplatz“ unlesbar auf Pflaster. Kleiner verdeckter Text unten links. |
| HUD | 4 (4) | vr2-01 | Kompakt, konsistente Rahmen, Hofprobe-Kasten rechts mit klarer nächster Aktion | Aktionsleiste: zehn leere Plätze mit „+“ wirken wie ein Formular. Icon-Leiste unten rechts (K C J M N) ohne Beschriftung. HUD-Knöpfe ♫ ⚙ ⛶ als Schriftzeichen. |
| Gespräch (Ida, Hofprobe) | 5 (4) | vr2-03 | Porträt, Name, Rolle, Kicker „Hofprobe · 1/8“, zwei Knöpfe mit Charakter. Vorbild. | Nichts Wesentliches. |
| Die Bande (Figurenwahl) | 4 (–) | vr2-06 | Drei Karten, Sprite, Rolle, Bio, Passiv, Spielweise; klare Wahl | Annis Bio ist doppelt so lang wie die der anderen; Karten ungleich hoch. Sprites in drei Detailgraden (Dieter flach, Anni weich, Kevin mittel) – Regel 1 im Kleinen. |
| Charakter | 3 (2) | vr2-05, vr2-09 | 16 Plätze mit Beschriftung, Schadensspannen, Clankiste erklärt sich | **Werte doppelt:** Glückstreffer/Drehzahl/Handschrift je als Wertung und als Prozent in zwei Listen (Regel 7). Füllsatz „Dein Kram. Dein Kampfstil.“ (Regel 9), mobil abgeschnitten (Regel 6). Meta-Text „Icon wählen: Werte und Ablegen. Gegenstände … ziehen“ (Regel 4/8). Leere Slot-Silhouetten grau-in-grau, Icons der belegten Plätze in zwei Stilen (Flasche farbig, Topfdeckel Foto-Look). |
| Skillbuch | 3 (3) | vr2-04 | Icons erkennbar, Stufen an gesperrten Skills, Leisten-Editor klar | Meta-Text „Überfahren: Erklärung · Goldrand …“ unverändert (Regel 4). Fußzeile „Ausgewählt: Kronkorken-Kelle“ abgeschnitten. |
| Clan-Talente | 4 (2) | vr2-02, vr2-07 | Echter Graph mit Verbindungen, Schwellen „3 verteilte Punkte“, eigene Motive je Talent, Tooltip mit Voraussetzungen. Großer Sprung. | Alle Motive als grün-graue Stempel, während Spezialisierungs-Kacheln farbig sind – zwei Icon-Sprachen in einem Fenster (Regel 3). Meta-Text „Wähle deinen Weg nach unten …“ und Tooltip-Fuß „Rechtsklick oder auf Touch …“ (Regel 4/8). |
| Kampfhilfe | 1 (1) | vr2-04 | Skill-Karten unten brauchbar | **Textwand** ist mit Autoangriff noch länger geworden: ein Absatz, 16 Sätze, jede Taste, jede Regel (Regel 5). |
| Rucksack | 3 (3) | Runde 1 vr-04/-10 | Aufgeräumt, Suche, Sortieren | Drei Zeilen Bedienhinweise; mobil „Über ein Icon fahren“, „Rechtsklick“ (Regel 8). |
| Auftragsbuch | 4 (4) | Runde 1 vr-04 | Klarer Leerzustand mit Handlungsknopf | Kicker „Auftragsbuch · J“ doppelt zum Fenstertitel. |
| Revierkarte | 5 (5) | Runde 1 vr-06 | Legende, nummerierte Ziele, Distanzen, Filter, OSM-Hinweis. Vorbild für alle Fenster. | – |
| Mobil | 4 (2) | vr2-08, vr2-09 | Joystick, große Aktionsknöpfe, Seitenanzeige „1/2“, Menü-Knopf, Fenster mit Scrollbereich statt Vollbild. Großer Sprung. | Runder Knopf „Ausweiche…“ abgeschnitten (Regel 6). Hofprobe-Kasten liegt über dem Kirchenbanner. Charakter: Füllsatz abgeschnitten, Maus-Hinweise. |

**Gesamt: 3,6 von 5 (0.13: 3,0).** Gespräche, Karte, Talentgraph und Mobil zeigen eine eigene Sprache. Was das Bild noch nach unten zieht, sind drei Dinge: der Stilbruch in der Welt, Meta-Texte in jedem Fenster und die Kampfhilfe als Handbuchseite.

## To-do für die UI-Sitzung

Reihenfolge nach Wirkung pro Aufwand. Jede Zeile hat eine Prüfregel; erledigt ist, was im Screenshot belegt ist.

### A · Fehler (heute sichtbar falsch)

- [ ] **A1 Werte einmal** (`rpg-ui.js` Charakter): acht Zeilen, Wertung und Prozent zusammen („Glückstreffer 0 · 5 %“). Prüfung: kein Attributname zweimal.
- [ ] **A2 Abgeschnittene Texte:** Skillbuch-Fußzeile, Charakter-Kopf mobil, Knopf „Ausweichen“ mobil (Symbol statt Wort). Prüfung: bei 900 px Höhe und 390 px Breite nichts beschnitten.
- [ ] **A3 Halbtransparenter Bewohner** am Brunnen (vr2-07): Kronen-Transparenz greift auf Personen. Prüfung: Bewohner deckend, nur Kronen durchsichtig.
- [ ] **A4 Kartenbeschriftung** „Kirchvorplatz“ mit Kontur oder Plakette wie „Clan-Treff“. Prüfung: lesbar auf Pflaster und Gras.
- [ ] **A5 Verdeckter Text unten links** (vr2-01): entfernen oder über die Grafik legen.
- [ ] **A6 Hofprobe-Kasten mobil** über dem Kirchenbanner: unter das Spielerfenster andocken oder einklappbar.

### B · Slop entfernen (Texte und Platzhalter)

- [ ] **B1 Meta-Hinweise raus:** Skillbuch-Kopf („Überfahren …“), Talente („Wähle deinen Weg …“, Tooltip-Fuß „Rechtsklick oder auf Touch …“), Charakter („Icon wählen …“), Rucksack-Fußzeilen. Ein Ort für Bedienung: die Kampfhilfe. Prüfung: kein Fenster erklärt Maus oder Finger.
- [ ] **B2 Füllsätze raus:** „Dein Kram. Dein Kampfstil.“, „16 Plätze · zwei Ringe · zwei Glücksbringer“, „Du kannst weiterlaufen und kämpfen“, „Waffenwechsel beendet eine laufende Parade“ (letzteres als Toast beim Wechsel, nicht als Dauertext).
- [ ] **B3 Kampfhilfe neu schneiden:** drei Abschnitte mit je drei Stichzeilen (Bewegen & Ziel · Kämpfen · Fenster), Tastenliste als Tabelle, darunter die Skill-Karten. Quelle Rotation: `CLAN_MEMBERS[].rotation`. Prüfung: kein Absatz über vier Zeilen.
- [ ] **B4 Unicode-Platzhalter:** ♫ ⚙ ⛶ unten rechts, ☷ Journal, ♜ Belohnung durch Sprites aus `ui-art.js` ersetzen (Auftrag steht in `docs/GRAFIK-BEDARF.md`).
- [ ] **B5 Aktionsleiste Stufe 1:** leere Plätze nur mit Nummer; „+“ erst bei offenem Skillbuch.
- [ ] **B6 Doppelte Kicker:** „Auftragsbuch · J“, „Poo-Tang-Clan“ über dem Namen streichen, wo der Fenstertitel es schon sagt.
- [ ] **B7 Bande-Karten angleichen:** Annis Bio auf die Länge der anderen kürzen (Inhalt liefert in `content/classes.js`); Karten gleich hoch.

### C · Stilbruch Welt (mit Grafik-Rolle)

- [ ] **C1 Entscheidung Zeichensprache:** Anni ist bereits im Detailstil, Dieter und Kevin nicht. Entweder Dieter, Kevin, Bewohner und Feldgegner nachziehen (Bild-KI, Briefing in `content/ART-BRIEF.md`, Höhe 26 px, Schatten unten rechts) oder Gebäude/Tiere/Anni zurück auf die Comic-Pixel-Familie. Eine Entscheidung, dann alles. Prüfung: Screenshot Dorfkern zeigt eine Hand.
- [ ] **C2 Icon-Sprache je Fenster:** Talentmotive farbig wie die Spezialisierungs-Kacheln, oder Kacheln als Stempel. Ausrüstungs-Icons in einem Stil (Flasche und Topfdeckel heute verschieden).
- [ ] **C3 Maßstab:** Türen der Detailgebäude gegen Held prüfen (Tür 35 px). Prüfung: Held reicht bis zur Klinke.
- [ ] **C4 Schattenrichtung:** Tannen und Laubbäume werfen unterschiedlich; eine Lichtquelle.
- [ ] **C5 Aggressiver Keiler im Wohngebiet** (Runde 1, vr-08): Engine-Punkt, steht in `content/BACKLOG.md`.

### D · Mobil (Rest)

- [ ] **D1 Touch-Texte:** alle Hinweise mit Maus-Bezug bei Touch ausblenden (Regel 8).
- [ ] **D2 Ein Fenster gleichzeitig:** neues Fenster ersetzt das alte; Steuerkreuz und Aktionsknöpfe bleiben immer frei.

### Prüfweg

1. Rundgang als Skript: `scripts/visual-round.mjs` um die elf Bildschirme (Desktop + Mobil) erweitern, Ausgabe nach `visual-review/round-<n>/`.
2. Je To-do ein Vorher/Nachher-Paar, Note je Bildschirm neu vergeben, Ergebnis in `VISUAL-REVIEW.md`.
3. Ziel nächste Runde: Charakter ≥ 4, Skillbuch ≥ 4, Kampfhilfe ≥ 4, Gesamt ≥ 4. Welt bleibt bei 3, bis C1 entschieden ist.

## Was aus Inhaltssicht folgt

- `content/classes.js`: Annis Bio auf zwei Sätze kürzen (B7). Nächste Inhaltsrunde.
- `content/BACKLOG.md`: C5 (Keiler im Wohngebiet) als Engine-Punkt aufgenommen.
- `docs/GRAFIK-BEDARF.md`: HUD-Symbole (Menü, Ton, Vollbild, Belohnung) ergänzt.
- Der Stilbruch C1 ist keine UI-Aufgabe allein: Inhalt liefert `look`-Felder, Grafik liefert Sprites, UI bindet an. Bis zur Entscheidung keine weiteren Detail-Sprites für einzelne Figuren, sonst wächst der Bruch.
