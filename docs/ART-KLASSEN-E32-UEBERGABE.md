# E32 – vorbereitete Klassenbilder und Effekte

Stand: 18.09.2026. Arbeitszweig: `e32-class-visuals`, Ausgangspunkt `bda4430`.
Grundlage: Architect-Brainstorming und `docs/UEBERGABE-VISUALS-KLASSEN-ASTRA-2026-09-18.md` aus `origin/main` bei `728cc36`.

Diese Lieferung bereitet die Darstellung der neuen Spielweisen vor. Sie verändert keine Kampfregel, Talentdaten, Abklingzeit, Cast-Bedingung oder Pet-KI. Die Vorschau verwendet ausdrücklich Beispielereignisse. Das Zusammenführen mit der Architect-Session ist der nächste Integrationsschritt.

## Ansehen und reproduzieren

- Lokale Vorschau: http://127.0.0.1:4283/tools/class-visuals/preview.html
- Bei einem anderen Server-Port: `/tools/class-visuals/preview.html` öffnen. Vom Projektstamm mit `node server.mjs` starten.
- Export: `node tools/class-visuals/build.mjs`
- Asset-/Adapterprüfung: `node --test tests/class-visuals.test.mjs`
- Browserprüfung: `tools/class-visuals/review.browser.js` über das Playwright-Werkzeug ausführen; erwartet den lokalen Server auf Port 4283.
- Visuelle Belege: `assets/class-visuals/review/`.

Die zehn interaktiven Szenen zeigen Pegel, Fasssorten, Sporenübertragung, Kettenblitz, Robbi, Gisela, Procs, Trinkspiel, Zielgeometrie und Wirken in Bewegung. Pause, Einzelbild, manuelles Auslösen und 2×/4×-Darstellung erlauben den Vergleich einzelner Phasen. Die Figuren nutzen die vorhandenen Helden und deren vorhandene Ausrüstung/Posen.

## Konkrete Folgen des Brainstormings

| Mechanik | Sichtbares Signal | Benötigtes verbindliches Ereignis |
|---|---|---|
| Dieter: Deckung/Hausverbot | Schild-/Rausschmissmotiv, Linie und verstärkte Aktionsanzeige | Deckung, Variantendauer und reale Zielgeometrie |
| Dieter: Pegel/Abriss | Stapel plus Ablaufuhr; Schaumabschluss oder getrenntes Katerbild | Aufbau, Auffrischung, Verbrauch und Ablauf getrennt |
| Dieter: Braumeister | Pils mit Hopfen/grünem Hahn, Weizen mit Ähre/Messing, Bock mit Widder/rotem Hahn; eigener Zustand und Radius | Platzierung, Typ, Lebensdauer, Aura-Tick, Auslösen, Ablauf |
| Anni: Vorsorge/Gisela | Vorratsanzeige, Nest mit Ruhe/Schnattern, bestätigter Heilimpuls | Vorrat, tatsächliche Heilung/Schild, Unterstützungsaktion |
| Anni: Schimmel | Pilzstatus am Ausgangsziel, gerichtete Sporenspur, Ankunft am neuen Ziel | Quelle, Ziel und Zeitpunkt der Übertragung |
| Anni: Putzwut | Variantenfenster, Kegel, Vorbereitung an bewegter Figur | Sofortiger Cast-Beginn, Abbruch, Ende und bestätigter Treffer |
| Kevin: Lunte/Kurzschluss | Glühende Lunte, registrierte Blitzendpunkte, eigener Zündimpuls | Geordnete Trefferkette inklusive tatsächlicher Zündung |
| Kevin: Dosen-Robbi | Bereit, Feuern, Überlast, Schrott; Lebensbalken getrennt von Einsatzzeit | Objektzustand, Schuss, Überlast, Zerstörung |
| Kevin: Zufallsprocs | Neues Symbol und Aktionsname, hervorgehobene Bereitschaft, Restfenster | Proc-Ergebnis, Cooldown-Reset, verstärkte Variante, Verbrauch |
| Trinkspiel – noch unzugeordnet | Ansage, goldenes Antwortfenster, Erfolg oder Kater | Beginn/Ende des Fensters und bestätigtes Ergebnis |

Grundregel: Vorbereitung, Bereitschaft und Wirkung sind verschiedene Bilder. Ein Proc darf nicht bereits einen Treffer behaupten. Eine abgelaufene Ressource darf nicht wie ein erfolgreicher Finisher aussehen. Ein fehlgeschlagener oder abgebrochener Cast erzeugt keinen Einschlag. Farbe wird durch Form, Symbol, Text oder Zeitverlauf ergänzt.

## Gelieferte Rasterassets

Insgesamt **56 exportierte Zustände, Effektframes und Motive**:

| Atlas | Inhalt | Format |
|---|---|---|
| `runtime/objects.png` | Drei Fasssorten × vier Zustände; Robbi × vier; Gisela × vier = 20 | 192-px-Zellen, Fußanker 96/160, 0,25 Welteinheiten pro Pixel |
| `runtime/effects.png` | Sporen, Lunte, Schaum, Metallüberlast, Kater, Blitzverbindung × vier = 24 | 128-px-Zellen, feste Skalierung, Blitzanker pro Frame |
| `runtime/icons.png` | Rausschmiss, Abriss, Fassanstich, Vorsorge, Schimmel, Auswringen, Kurzschluss, Überlast, Jackpot, Gisela, Trinkspiel, Lunte = 12 | 64-px-Zellen |

Alle Pfade liegen unter `assets/class-visuals/`. `runtime/catalog.json` enthält IDs, Zustände, Bildausschnitte, Anker, Exportmaßstäbe, Quellen und SHA-256. Die Originale wurden mit dem eingebauten **`image_gen.imagegen`** erzeugt. Tatsächliche Prompts, Referenzen, Originalpfade und Prüfsummen stehen in `generation.json`; die Prompts zusätzlich unter `sources/*-v1.prompt.txt`. Alle vier Originalbögen bleiben erhalten.

Der deterministische Export nutzt die bestehende Präzisionspalette, harte Alpha-Kanten und transparente Ränder. Schnittgrenzen sind explizit geprüft; besonders der Effektbogen hat ungleich hohe Quellenzeilen. Einzelbilder werden nicht anhand wechselnder Bounding-Boxen auf dieselbe Größe gestreckt.

## Übergabevertrag für die Engine

`tools/class-visuals/contract.mjs` enthält vorgeschlagene Bindungen für alle neun Spezialisierungen sowie den unzugeordneten Trinkspielentwurf. Annis bestehende internen IDs bleiben `baerbel-*`. Die Signalnamen sind ein Vorschlag für das Zusammenführen, keine bereits eingebauten Engine-Events.

`tools/class-visuals/art.js` lädt die drei Atlanten und zeichnet Objekte, Motive, zeitlich begrenzte Effekte, Blitzverbindungen und Zielgeometrien. Der Adapter importiert keine Engine, wählt keine Gegner und verändert keinen Zufallszustand.

Beispiel für eine verbindliche Kette:

```js
{
  castId: 'cast-42',
  hops: [
    { sourceId: 'kevin', targetId: 'enemy-7',
      from: { x: 20, y: 30 }, to: { x: 70, y: 35 },
      hitAt: 12.1, hit: true, damage: 24, detonatedFuse: false }
  ]
}
```

Die Engine liefert Auswahl, Reihenfolge, Endpunkte und Trefferzeiten. Der Renderer darf keine weitere Kette aus Entfernungen erraten. Dasselbe gilt für DoT-Übertragungen. Simulationstime steuert Animationen, Pausen und Restfenster. Bei bewegten Objekten werden aktuelle Positionen beziehungsweise verbindliche Einschlagpositionen benötigt.

Für normale/procverstärkte Aktionen zeigt die Vorschau die gewünschten 1,5/1,0 Sekunden als Beispiel. Tatsächlicher GCD, Cast-Zeit und Cooldown-Reset bleiben separate Engine-Werte. Der verzögerte Cast-Beginn beim Anhalten wird durch dieses Art-Paket nicht behoben: die Engine muss Beginnen/Ablehnen sofort melden, damit das Windup ohne Verzögerung sichtbar wird.

## Talentdarstellung und Grenzen

Die Vorschau enthält drei beispielhafte Dieter-Pfade mit sichtbarer Wahl und gegenseitigem Ausschluss. Symbole, Verbindungen, Regeltext und Status müssen gemeinsam zeigen, welche Spielweise entsteht. Gesperrt, wählbar, gelernt und ausgeschlossen sind getrennte Zustände. Die sechs Beispielknoten sind keine finalen Talente.

Die vom Architect vorgesehenen 270 Talente benötigen zuerst verbindliche IDs, Elternbeziehungen, Wahlgruppen und Regelwirkungen. Diese Lieferung enthält zwölf wiederverwendbare Leitmotive, **keine 270 fertigen Talenticons und keinen produktiven Talentbaum**.

Robbi und Gisela sind hier stationäre Objekte mit fester Südostansicht. Es gibt keine neuen Vier-Richtungs-Laufzyklen. Bewegliche Pets benötigen später eigene passende Lauf-/Aktionsbögen. Die Laufzauber-Szene kombiniert vorhandene Gehposen mit einer folgenden Vorbereitung; neue unabhängige Oberkörper-Castanimationen sind noch nicht geliefert.

Die Fassszene zeigt alle drei Sorten zum Bildvergleich. Daraus folgt kein erlaubtes Maximum von drei aktiven Fässern; die Architect-Vorgabe von maximal zwei bleibt davon unberührt. Auch Robbis verkürzte Demoabfolge, Trefferprozente und Procfolge sind Vorschauwerte.

## Zusammenführen

1. Diesen separaten Art-Zweig übernehmen beziehungsweise die neuen Verzeichnisse und den zugehörigen Test übertragen. Bestehende Kampfdateien wurden hier nicht verändert.
2. Verbindliche Skill-/Talent-/Objekt-IDs und Events aus der Architect-Session gegen `contract.mjs` abgleichen. Neue Renderer-Aufrufe zuerst an bestätigte Ereignisse hängen.
3. Runtime-Atlanten und Katalog in den Spiel-Lader und Offline-Cache aufnehmen. Quellen, Prompts und Reviewbilder beim Produktionsbuild ausschließen; der vorhandene Asset-Kopierer würde sie sonst mitnehmen. Die Vorschau unter `tools/` ist aktuell nur lokal erreichbar.
4. Abbruch, Ablauf ohne Finisher, Procverbrauch, nicht getroffene Sprünge, Objektzerstörung, Pause und Zonenwechsel mit echter Simulation prüfen.
5. Abschließend im echten Kampf mit mehreren Gegnern und Effekten beurteilen: Lesbarkeit, Überdeckung, Objekttiefe, Geometrie und Leistung. Die isolierte Art-Vorschau ersetzt diese Integrationsprüfung nicht.

## Prüfung dieser Lieferung

Native Atlanten und Szenen wurden visuell betrachtet: Materialidentität, Alpha-Ränder, Objektmaßstab, Fußanker, gerichtete Verbindung und mobile Lesbarkeit. Desktop nutzt 4×, die 390-px-Ansicht 2×; die Seite hat dort keinen unbeabsichtigten horizontalen Überlauf. Gisela bleibt im Heilimpuls kurz teilweise verdeckt, wird danach wieder frei sichtbar.

Automatische Prüfungen sichern reproduzierbare Exporte, Provenienz, Palette, Alpha, Randabstand, vorhandene Bindungen, Blitzendpunkte und zeitliche Effektgrenzen. Die Browserprüfung prüft zehn Abläufe sowie manuelle Erfolge/Fehlschläge, Pause, Einzelbild, Talentwahl und mobile Abmessungen. Diese technischen Ergebnisse sind getrennt von der visuellen Beurteilung zu verstehen.

Ergebnis: 21 Tests bestanden (`class-visuals`, `art-precision`, `art-refinement`, `art-handoff`), 29 Browserprüfungen bestanden, keine fehlgeschlagenen Requests oder Browserfehler. Bei der Sichtprüfung wurden der Kontrast der Zielmarkierungen erhöht und unpassende Metallsplitter bei Fass-/Blitzeinschlägen durch Zündfunken ersetzt.
