# Visuelle Bewertung · 2026-09-13

Rundgang durch den Stand von `main` (fc2fcee) im Browser: Vollbild 2024×900 und mobil 390×844. Elf Screenshots in `visual-review/round-content-1/` (lokal, nicht versioniert). Keine Konsolenfehler. Bewertet wurde, ob das Spiel wie ein gestaltetes Werk wirkt oder wie zusammengewürfelte KI-Ausgabe („AI-Slop“).

## Guideline gegen AI-Slop

Slop erkennt man daran, dass etwas *generiert* statt *entschieden* aussieht. Zehn Regeln, jede prüfbar:

1. **Eine Zeichensprache.** Figuren, Tiere, Gebäude, Bäume und Icons müssen aus derselben Hand wirken: gleiche Konturstärke, gleiche Pixeldichte, gleiche Schattenrichtung, gleiche Farbpalette (`ART-DIRECTION.md`). Zwei Stile nebeneinander sind Slop, egal wie schön jeder für sich ist.
2. **Maßstab ist Gesetz.** Held ≈ 26 px, Tür ≈ 35 px, ein Meter = 8 Welteinheiten. Was diesen Maßstab bricht (Riesenhaus, Miniaturmensch, Hund so groß wie ein Keiler) fliegt raus.
3. **Icons bedeuten etwas.** Ein Icon zeigt den benannten Gegenstand oder die Wirkung. Platzhalter aus dem Fundus (Zahnrad, Ring, Note, Brezel) für „Doppelte Türkontrolle“ sind Slop.
4. **Kein Text erklärt die Bedienung der Bedienung.** „Überfahren: Erklärung · Goldrand: nicht auf der Leiste“ ist ein Tooltip, der Tooltips erklärt. Bedienhinweise gehören in die Kampfhilfe, nicht in jedes Fenster.
5. **Kurz und dörflich.** Keine Textwände. Ein Absatz pro Gedanke, ein Satz pro Zeile in Listen. Ton aus `content/` (derb, konkret), nicht aus dem Handbuch.
6. **Nichts wird abgeschnitten.** Namen, Fußzeilen und Werte müssen vollständig lesbar sein oder bewusst gekürzt („…“ mit Tooltip). Abgeschnittener Text ist immer ein Fehler.
7. **Jeder Wert genau einmal.** Ein Attribut steht an einer Stelle mit einer Zahl. Doppelte Zeilen oder leere Wertefelder sind Layoutfehler.
8. **Touch ist nicht Maus.** Auf dem Handy keine „Überfahren“-, „Rechtsklick“- oder „Doppelklick“-Hinweise; Fenster füllen nicht den ganzen Bildschirm, HUD-Elemente überlagern sich nicht.
9. **Dekoration hat einen Grund.** Wimpel, Blumenkästen, Fässer, Laternen nur dort, wo sie erzählen (Festplatz, Kneipe, Hof). Gleichmäßig verteilter Schmuck ist Tapete.
10. **Kontrast und Lesbarkeit vor Stimmung.** Ortsnamen und Beschriftungen auf der Karte müssen vor jedem Boden lesbar sein (Schrift mit Kontur oder Plakette).

## Bewertung je Bildschirm

Skala 1–5 (5 = wirkt gestaltet, 1 = wirkt generiert). Beleg = Screenshot.

| Bildschirm | Note | Beleg | Was gut ist | Was Slop ist |
|---|---:|---|---|---|
| Spielwelt Dorfkern | 3 | vr-01, vr-11 | Straßen, Kirche, Brunnen, Bänke: stimmige Szene; Ortsplakette „Clan-Treff“ klar | **Zwei Zeichensprachen:** Gebäude/Tiere hochdetailliert mit weichen Schatten, Figuren flach und klein. Kirche wirkt wie aus einem anderen Spiel (Regel 1). Villager-Figuren teils halbtransparent (vr-11, Frau am Brunnen). Ortsname „Kirchvorplatz“ unlesbar auf Pflaster (Regel 10). Kleiner Text unten links „…Poo-Tang“ verdeckt von einer Grafik. |
| Spielwelt Wohngebiet | 3 | vr-08 | Straßennetz, Häuserzeilen, Bäume glaubwürdig; Gegnername + Lebensbalken lesbar | Pfandkeiler und Dachs im Detailstil neben Flachfigur-Held (Regel 1). Aggressiver Keiler zwischen Wohnhäusern 82 m vom Treffpunkt – widerspricht der Regel „Wohnflächen = neutrale Tiere“ (ENCOUNTERS.md). Zwei Baumstile (runde Laubkronen, spitze Tannen) mit unterschiedlicher Schattenrichtung. |
| HUD (Spielerfenster, Quest, Minimap, Aktionsleiste) | 4 | vr-01 | Kompakt, konsistente Rahmen, Minimap klar | Aktionsleiste: zehn leere Plätze mit „+“ auf Stufe 1 wirken wie ein Formular; Rechte Icon-Leiste (K C J M N) ohne Beschriftung, Buchstaben kaum lesbar. |
| Gespräch mit Ida | 4 | vr-02 | Guter Text, klare Handlung, zwei Knöpfe mit Charakter | Belohnungskasten mit Schach-Turm-Symbol ♜ (Regel 3, Unicode-Platzhalter). |
| Charakter | 2 | vr-03 | Porträt, Slots, Werte vorhanden | **Namen abgeschnitten** („Bewährte Mehrwegfla“, Regel 6). **Werte doppelt und leer:** Glückstreffer und Drehzahl je zweimal, rechte Spalte ohne Zahlen (Regel 7). Slots „Hierhin ziehen“ als Maus-Hinweis. |
| Skillbuch | 3 | vr-03 | Icons erkennbar, Stufen an gesperrten Skills, Leisten-Editor verständlich | Meta-Text „Überfahren: Erklärung · Goldrand …“ (Regel 4). Fußzeile „Ausgewählt: Kronkorken-Kelle“ abgeschnitten. |
| Rucksack | 3 | vr-04, vr-10 | Aufgeräumt, Suche, Sortieren | Drei Zeilen Bedienhinweise im Fenster; auf dem Handy „Über ein Icon fahren“ und „Rechtsklick / Doppelklick“ (Regel 8). |
| Auftragsbuch (leer) | 4 | vr-04 | Klarer Leerzustand mit Handlungsknopf | Kopf „Auftragsbuch · J“ doppelt zum Fenstertitel. |
| Clan-Talente | 2 | vr-07 | Baumstruktur, Ränge, Spezialisierungs-Kacheln lesbar | **Platzhalter-Icons** ohne Bezug: Ring für „Dienstjacke“, Note für „Letzter Mann am Tresen“, Brezel für „Tür bleibt zu“ (Regel 3). Fußzeile abgeschnitten („Ab Stufe 2 gibt jede“). Spezialisierungs-Icons (Tür, Fäuste, Zapfhahn) sind gut. |
| Kampfhilfe | 1 | vr-05 | Skill-Karten unten sind brauchbar | **Textwand:** ein Absatz mit 14 Sätzen erklärt jede Taste und jede Regel (Regel 5). Das ist Handbuch, nicht Hilfe. |
| Revierkarte | 5 | vr-06 | Beste Fläche im Spiel: klare Legende, nummerierte Ziele, Distanzen, Filter, OSM-Hinweis | Nichts Wesentliches. Vorbild für alle anderen Fenster. |
| Mobil (390×844) | 2 | vr-09, vr-10 | Steuerkreuz, Aktionsleiste und Icon-Leiste erreichbar | Talentfenster füllt zwei Drittel des Bildschirms, HUD-Icons (Ton/Menü/Vollbild) liegen über der Icon-Leiste und über dem Haus; Fenster stapeln sich mit versetztem Rand; Maus-Hinweise. |

**Gesamt: 3 von 5.** Karte, Ida-Dialog und HUD-Rahmen zeigen, dass die Oberfläche eine eigene Sprache hat. Die Welt verliert sie durch den Stilbruch zwischen Gebäuden/Tieren und Figuren; die Fenster verlieren sie durch Platzhalter-Icons, abgeschnittene Texte und Bedienhinweise, die niemand braucht.

## To-do für die UI-Sitzung

Reihenfolge nach Wirkung pro Aufwand. Jede Zeile hat eine Prüfregel; erledigt ist, was im Screenshot belegt ist.

### A · Fehler (heute sichtbar falsch)

- [ ] **A1 Charakterfenster:** Werteliste auf acht eindeutige Zeilen mit Zahl bringen (Standfestigkeit, Wumms, Taktgefühl, Bastelgrips, Dicke Haut, Glückstreffer %, Drehzahl %, Handschrift %). Quelle: `combatStats(game)` und `STAT_NAMES`. Prüfung: keine Zeile doppelt, keine leer. (`rpg-ui.js` Charakterpanel)
- [ ] **A2 Abgeschnittene Texte:** Gegenstandsnamen in Slots (Umbruch oder „…“ mit Tooltip), Fußzeilen in Skillbuch und Talente (`overflow` prüfen, Fenster minimal höher oder Fußzeile kürzer). Prüfung: alle Fenster bei 900 px Höhe ohne Beschnitt.
- [ ] **A3 Halbtransparente Bewohner:** Villager am Brunnen (vr-11) wird mit Alpha gezeichnet; Ursache in `comic-actors.js`/`renderer.js` (Baumkronen-Transparenz greift auf Personen?). Prüfung: alle Bewohner deckend, nur Kronen werden durchsichtig.
- [ ] **A4 Kartenbeschriftung:** Ortsnamen im Spiel („Kirchvorplatz“) mit Kontur oder Plakette wie „Clan-Treff“. Prüfung: lesbar auf Pflaster und Gras.
- [ ] **A5 Verdeckter Text unten links** (vr-01): entweder entfernen oder über die Grafik legen. Prüfung: kein Text unter einem Sprite.

### B · Slop entfernen (Texte und Platzhalter)

- [ ] **B1 Talent-Icons:** die zehn Fallback-Icons (`TALENT_ICON_FALLBACK` in `content/talents.js`) durch je Talent passende Bilder ersetzen. Bis die Bild-KI liefert: neutrale Rang-Plakette (Zahl, Reihe) statt Zufalls-Icon. Grafikauftrag: 90 Talent-Icons 32×32 → `docs/GRAFIK-BEDARF.md`.
- [ ] **B2 Meta-Hinweise raus:** Skillbuch-Kopf, Rucksack-Fußzeilen, „Hierhin ziehen“, „Du kannst weiterlaufen und kämpfen“. Ein einziger Ort für Bedienung: die Kampfhilfe. Prüfung: kein Fenster erklärt Maus oder Tastatur.
- [ ] **B3 Kampfhilfe neu schneiden:** drei Abschnitte mit je drei Stichzeilen (Bewegen & Ziel · Kämpfen · Fenster), darunter die Skill-Karten. Tastenliste als Tabelle, nicht als Fließtext. Quelle für Rotation: `CLAN_MEMBERS[].rotation`.
- [ ] **B4 Unicode-Platzhalter:** ♜ im Belohnungskasten, ☷ als Menü-Symbol, ⛶ Vollbild, ♫ Ton durch UI-Icons aus `ui-art.js` ersetzen. Prüfung: kein Symbolzeichen aus der Schrift im HUD.
- [ ] **B5 Aktionsleiste Stufe 1:** leere Plätze ohne „+“, nur die Nummer; „+“ erst, wenn das Skillbuch offen ist. Prüfung: Leiste wirkt nicht wie ein Formular.
- [ ] **B6 Fensterkopf doppelt:** Kicker-Zeile („Auftragsbuch · J“, „Poo-Tang-Clan“) streichen, wo sie den Titel wiederholt.

### C · Stilbruch Welt (mit Grafik-Rolle)

- [ ] **C1 Entscheidung Zeichensprache:** Entweder Figuren an den Detailstil der Gebäude angleichen (Bild-KI: Sprites nach `content/ART-BRIEF.md`, Höhe 26 px, gleiche Schattenrichtung unten rechts) oder Gebäude/Tiere zurück auf die Comic-Pixel-Familie 0.9. Eine Entscheidung, dann alles. Prüfung: Screenshot Dorfkern zeigt eine Hand.
- [ ] **C2 Maßstab:** Kirche und Fachwerkhaus gegen Held prüfen (Tür 35 px). Türen der Detailgebäude sind teils 50 px. Prüfung: Held reicht bis zur Türklinke.
- [ ] **C3 Schattenrichtung:** Tannen und Laubbäume werfen unterschiedlich; eine Lichtquelle festlegen. Prüfung: alle Schatten unten rechts.
- [ ] **C4 Aggressiver Keiler im Wohngebiet** (vr-08): prüfen, ob `inhabitable`/`field` in `encounters.js` die Fläche als Feld zählt. Das ist Engine → Eintrag in `content/BACKLOG.md`.

### D · Mobil

- [ ] **D1 Fenster mobil:** maximal 60 % Höhe, ein Fenster gleichzeitig, neue Fenster ersetzen das alte. Prüfung: Steuerkreuz und Aktionsleiste bleiben frei.
- [ ] **D2 HUD-Kollision:** Ton/Menü/Vollbild nicht über der Icon-Leiste; Icon-Leiste in eine Zeile mit Beschriftung.
- [ ] **D3 Touch-Texte:** alle Hinweise mit Maus-Bezug bei Touch ausblenden (Regel 8); Aktionen per Tipp + Halten.

### Prüfweg

1. `scripts/visual-round.mjs` erweitern: dieselben elf Bildschirme automatisch aufnehmen (Desktop + Mobil) nach `visual-review/round-<n>/`.
2. Vor/Nach-Vergleich je To-do-Punkt im Bericht `VISUAL-REVIEW.md` ergänzen, Note je Bildschirm neu vergeben.
3. Ziel für die nächste Runde: Charakter ≥ 4, Talente ≥ 4, Kampfhilfe ≥ 4, Mobil ≥ 3, Gesamt ≥ 4. Welt bleibt bei 3, bis C1 entschieden ist.

## Was aus Inhaltssicht folgt

- `content/talents.js`: `TALENT_ICON_FALLBACK` bleibt bis B1; die Talente bekommen ein `look`-Feld für die Bild-KI (nächste Inhaltsrunde).
- `content/BACKLOG.md`: C4 (Keiler im Wohngebiet) als Engine-Punkt aufgenommen.
- `docs/GRAFIK-BEDARF.md`: Talent-Icons, HUD-Symbole (Menü, Ton, Vollbild, Belohnung) ergänzt.
