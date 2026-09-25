# Grafik-Review Dungeon „Schloss Big B" · 24.09.2026

Stand `origin/main` 5756aaa, Worktree `D:\Dev\MertlochChronicles-dungeon-grafik` (nur lesend, nichts committet).
Szenenskript `_review/szenen.mjs` (Desktop 2024×900, Handy quer 844×390 und hoch 390×844, jeweils mit DPR 2), Server 4380, CDP 9581–9587.
Maßstab der Noten wie in r5: 5 = WoW-Niveau.

## Gesamturteil

Der Dungeon funktioniert, aber er sieht aus wie ein Grundriss. Er wirkt nicht wie ein Ort. Die Welt draußen steht bei 4,5. Drinnen gibt es graue, braune und schiefergraue Rechtecke mit 1-px-Raster in schwarzer Leere. Dazu kommen dauerhafte Wörter und Platzhalterfiguren, die den Witz nicht tragen. Die Warnflächen sind der beste Teil. Handy-Bosskampf und Dungeon-Karte sind die schwächsten Stellen.

| Bereich | Note | Kurzbegründung |
|---|---|---|
| Eingang | **1,5** | Flacher grauer Kasten auf dem Pflaster, von Bäumen überschnitten. Der Name steht dauerhaft da, die Wegmarke überlappt ihn. Auf der Weltkarte fehlt das Symbol. Beim Betreten gibt es einen harten Schnitt ohne Übergang. |
| Räume/Ebenen | **2** | Die drei Farbthemen trennen die Ebenen. Es fehlen Wandhöhe, Material, Deko und Licht. Der geheime Wehrgang ist offen sichtbar. Die Siegeltür ist ein rosa Rechteck. |
| Gegner | **1,5** | Azubi und Makler sehen gleich aus. Der Elite-Ritter trägt T-Shirt, die Pappwache ist ein Mensch, die Ratten sind Dachse. Der Boss ist so groß wie der Held. |
| Boss-Telegrafie | **2,5** | Kegel mit Füllfortschritt und blinkender Kante, Bodenkreis mit Ticks: im Kern gut. Der Zaubername ist abgeschnitten, eine zentrale Leiste oder Ansage fehlt, Kegel und Kreis sprechen zwei Stile. Am Handy verdeckt die Oberfläche die Mechanik. |
| Karte | **2** | Reiter, Prospekt gegen Wirklichkeit und Siegelstand sind vorhanden. Die Leinwand füllt nur 24 % des Fensters. Keine Türen, keine Boss-Schädel, kein Tooltip, keine Wegmarke. Handy quer scrollt. |
| Oberfläche im Dungeon | **2** | Beim Betreten liegen vier Textschichten übereinander. Der Todesbildschirm sagt „St. Gangolf“. Die Verfolgung zeigt Weltaufträge. Truppenrahmen decken am Handy die Arena ab. |

## Top 12 Befunde (priorisiert)

**1 · Handy: Ziel- und Truppenrahmen verdecken den Bosskampf.**
- **Ort, Bild:** Zugbrücke, Gerd. `q-42-gerd-kegel.jpg` und `h-42-gerd-kegel.jpg`.
- **Problem:** Quer liegen Zielrahmen (410×320 px mit Titel-Pille) und vier Söldnerrahmen (je ~250×110 px) genau über Gerd und dem Kegel. Hochkant deckt der Block „Deine Truppe“ das halbe Spielfeld ab. Rita und Peter sind abgeschnitten. Der Kegel ist nur als Rand zu ahnen. Die Sprechblase liegt unter dem Menü-Knopf.
- **Vorschlag:**
  - Im Kampf die Truppe als kompakte Raid-Leiste zeigen: 5 × (120×22 px), Name im Balken, oben links unter dem Heldenrahmen.
  - Zielrahmen ohne Titel-Pille.
  - Die Heldenlücke (`hero-frame.js`) auf „Held + Ziel“ erweitern.
- **Ursache:** Rahmen der Söldner-/Truppenanzeige und Zielrahmen im Handy-Layout (`mobile-layout.js`, `companion-ui.css`, `target-ui.js`). Keine Regel für die Instanz.
- **Aufwand:** M

**2 · Textstapel beim Betreten und bei jedem neuen Raum.**
- **Ort, Bild:** Hof, Rittersaal, Kontrollpunkt. `d-04-uebergang-0ms.jpg`, `d-11-k1-rittersaal.jpg`, `d-51-kontrollpunkt.jpg`, `crops/d-05-zonentitel.jpg`.
- **Problem:** Auf ~120 px Höhe liegen übereinander:
  - der Toast „Raum · Wirklichkeit“,
  - der Zonentitel „SCHLOSSHOF / Erdgeschoss · Burghof“,
  - das Weltschild „Schlosshof / Doppelgarage mit Pappzinnen“,
  - die Namensschilder der Gegner.
  - Im Rittersaal liegen zusätzlich die Galerie-Schilder darunter.
  Nichts davon ist lesbar.
- **Vorschlag:**
  - Nur noch der Zonentitel, zweizeilig wie Plan §14: Schild groß in Gold, Wirklichkeit klein darunter, 2,5 s.
  - Kein Toast beim Raumwechsel.
  - Die Ebene steht auf der Karte und im Minikarten-Schild.
- **Ursache:** `dungeon.js` `tickDungeon` (`g.toast(room.sign+' · '+room.truth)`), `app.js` Z. 459 (Zonentitel mit Ebene), `dungeon-art.js` Raumschilder
- **Aufwand:** S

**3 · Räume sind Grundrisse, keine Orte.**
- **Ort, Bild:** alle Ebenen. `d-06-hof-trash-nah.jpg`, `d-11-k1-rittersaal-nah.jpg`, `d-21-k2-weinkeller.jpg`, `crops/d-44-gerd-dresscode-nah.jpg`.
- **Problem:**
  - Die Wand ist nur ein 5-px-Strich, darüber liegt ein Kachelraster alle 2 m (Millimeterpapier).
  - Wer an der Nordwand steht, ragt mit dem Oberkörper in die schwarze Leere.
  - Im Basaltkeller ist die Wand (#1d2023) kaum von der Leere (#0d0f10) zu unterscheiden.
  - Pappzinnen und Porträts sind Beige-Klötzchen. Die Kelterhalle hat drei Striche.
  - Der Ausgang ist ein goldener Balken, kein Rolltor.
- **Vorschlag:** Den Dungeon aus dem Sprite-Baukasten E-54 bauen. Dessen Regeln (22-E-Wandfront Nord, Sockel Süd, Kronen seitlich, Wandschmuck an Fronten) passen genau.
  - Beläge, die es schon gibt: `estrich` für die Garage, `fliesen-weiss`/`dielen-dunkel` für den Partykeller, neu `basalt-quader` für Keller 2.
  - Die Leere als Erd- oder Felsmasse statt Schwarz.
- **Ursache:** `dungeon-art.js` `drawDungeonGround`. Der Baukasten wird nicht benutzt.
- **Aufwand:** L

**4 · Außenlicht und Effektschicht laufen im Keller mit.**
- **Ort, Bild:** alle Ebenen. Staubpunkte im Leerraum: `d-05-hof-ruhe.jpg`, `d-21-k2-weinkeller.jpg`.
- **Problem:** `renderer.js` nimmt nur den Kiosk aus: `light.show(lit&&!kiosk)` und `effects=…&&!kiosk`. Tageszeit, Wolken, Wetter und Partikel der Außenwelt gelten damit auch im Basaltkeller. Es fehlt jede Lichtstimmung je Ebene. Garage, Partykeller und Basalt unterscheiden sich nur in der Bodenfarbe.
- **Vorschlag:**
  - Instanz schaltet das Weltlicht ab.
  - Eigene Umgebung je `theme` in `content/lighting.js`: Garage kaltes Neon mit Streifen, Partykeller warme Lichterkette, Basalt dunkel-kalt mit Fackelkegeln.
  - Lichtquellen kommen aus Baukasten-Lampen (E-58 flackern schon).
  - Effekte nur Tropfen und Staub, die Sprinkler als Streifen.
- **Ursache:** `renderer.js` `drawScene`, `world-light.js`, `world-fx.js`
- **Aufwand:** S (aus) / M (eigenes Licht)
- **Einschränkung:** Die Nachtabdunklung im Bild nicht getrennt gemessen, der Befund ist aus dem Code.

**5 · Gegner nicht unterscheidbar, Rollen nicht lesbar.**
- **Ort, Bild:** `d-06-hof-trash-nah.jpg`, `d-07-hofkanzlei.jpg`, `d-11-k1-rittersaal-nah.jpg`, `d-21-k2-weinkeller.jpg`.
- **Problem:**
  - Security-Azubi und Makler-Praktikant nutzen beide `inspector`: Schaffnermütze, Brille, Warnweste. Der Heiler, den man zuerst schlagen soll, ist nicht zu erkennen.
  - Der Baumarkt-Ritter (Elite) ist der JGA-Typ im Herz-Shirt, das Elite-Zeichen ist nur ein Goldflügel am Schild.
  - Die Pappwache ist ein echter Mensch (`kegler`). Die Pfandratte ist ein Dachs.
  - Im Weinkeller stehen 16 Namen mit Balken, teils in der Leere.
- **Vorschlag:**
  - Sofort, ohne neue Figurengrafik: Rollensymbol am Namensschild (Kreuz = Heiler, Schild = Elite, Schädel = Boss).
  - Maßstab Elite ×1,15, Boss ×1,35.
  - Tönung je Art.
  - Schwärme mit einem Sammelschild „Pfandratten ×8“, Einzelschilder nur bei Ziel oder Angriff.
  - Endgültig: eigene Sprites, siehe Grafikbedarf (freigabepflichtig).
- **Ursache:** `content/dungeons.js` `art:` in `DUNGEON_ENEMIES`/`DUNGEON_BOSSES`, Namensschilder `enemy-ui.js`
- **Aufwand:** S (Zeichen/Maßstab), L (Sprites)

**6 · Kein Bossrahmen, keine zentrale Zauberleiste, Hinweis abgeschnitten.**
- **Ort, Bild:** `d-42-gerd-kegel-frueh.jpg`, `crops/d-41-gerd-zielrahmen.jpg`, `d-45-gerd-phase2.jpg`.
- **Problem:**
  - Die Mechanik steht nur im kleinen Zielrahmen oben links: „Rausschmiss · nicht vor“. Die Antwort „ihm stehen“ ist abgeschnitten.
  - Die Zauberleiste unter dem Namensschild hat keinen Text.
  - Es fehlen Phasenmarken (50 %/25 %) und eine Ansage bei Phasenwechsel. Nur die Sprechblase erscheint, dazu ein Chat-Eintrag.
  - Gerd ist so groß wie jeder andere und nur am Goldrand des Schilds als Boss zu erkennen.
- **Vorschlag:** Bossrahmen oben mittig mit Zauberleiste und Ansage, siehe Zielbild B.
- **Ursache:** Es gibt keinen Bossrahmen (Plan §14 offen). Zielrahmen `target-ui.js` kürzt.
- **Aufwand:** M

**7 · Zwei Warnflächen-Sprachen.**
- **Ort, Bild:** `crops/d-42-gerd-kegel-frueh-nah.jpg` gegen `crops/d-44-gerd-dresscode-nah.jpg`.
- **Problem:**
  - Der Bodenkreis (Engine) hat Randticks, einen hellen Innenring und eine Füllung, die wächst: gut.
  - Der Kegel (`dungeon-art.js`) ist eine eigene Keilform ohne Ticks, mit anderer Rotdeckung und ohne Zeichen für Rückstoß oder Tank-Schutz.
  - Raumschilder und Figurennamen liegen im Kegel und nehmen der Fläche den Kontrast.
- **Vorschlag:**
  - Ein Baustein `hazard(shape)` für Kreis, Kegel und Linie: Randticks alle 12°, Füllung wächst, in den letzten 25 % blinkt die Kante 8 Hz.
  - Rückstoß-Pfeile am Bogenrand, Schild-Symbol an der Spitze für „Tank sicher“.
  - Weltschrift im Kegel ausblenden.
- **Ursache:** `dungeon-art.js` Z. „Warnflächen der Kegel“, Bodenkreise in `renderer.js`/`combat-fx`
- **Aufwand:** S

**8 · Eingang und Übergang.**
- **Ort, Bild:** `d-03-eingang-f.jpg`, `crops/d-01-eingang-hover.jpg`, `d-02-weltkarte.jpg`, `d-04-uebergang-0ms.jpg`.
- **Problem:**
  - Das Rolltor ist 44×40 E, flach und ohne Schatten, kleiner als jedes Nachbarhaus. Es steht auf dem Kopfsteinpflaster, Baumkronen überschneiden es.
  - Die Pappzinnen sind ein 1-px-Streifen. Das Schild `entranceSign` („PRIVATBESITZ · EINTRITT 20 €“) wird nicht gezeichnet.
  - Der Name steht dauerhaft da, gegen E-70 Punkt 4. Die Wegmarke „308 m“ sitzt darauf.
  - Die Weltkarte zeigt kein Dungeon-Symbol (Hits 0). Die Minikarte trägt ein Symbol laut Code, im Bild lag es unter dem Heldenpfeil und ist nicht verifiziert.
  - Nach F kommt ein harter Schnitt: Das 0-ms-Bild zeigt schon den Hof.
- **Vorschlag:**
  - Doppelgarage als Sprite im Welt-Stil, siehe Zielbild C.
  - Eigener Platz neben der Straße mit Einfahrt.
  - Name nur beim Überfahren.
  - Symbol auf der Weltkarte.
  - Ladebild 0,6–1,2 s aus der Bildpipeline (Ladeschirm-Modul vorhanden).
- **Ursache:** `dungeon-art.js` `drawDungeonEntrance`, `dungeon.js` `entranceFor` (offset 46), `atlas-ui.js`/`cartography.js`, `enterDungeon`
- **Aufwand:** M

**9 · Dungeon-Karte weit unter WoW-Niveau.**
- **Ort, Bild:** `d-30-karte.jpg`, `crops/d-31-karte-{e0,k1,k2}.jpg`, `q-30-karte.jpg`, `h-30-karte.jpg`.
- **Problem:**
  - Das Fenster misst 1922×847, die Leinwand 720×540. Das sind 24 % Nutzfläche, der Rest ist grüner Filz.
  - Oben steht ein Erklärsatz, die drei Reiter sind je ~620 px breit.
  - Türen fehlen, die Räume schweben getrennt.
  - Der Boss ist ein 14-px-Kreis (tot: grau mit X, er überdeckt „Kellertreppe mit Kette“).
  - Übergänge sind grüne Quadrate ohne Treppen- oder Aufzugsymbol.
  - Der Held ist ein Punkt ohne Blickrichtung.
  - Ein Tooltip fehlt (gemessen: keiner), eine Wegmarke auch.
  - Der Prospekt ist nur ein gestrichelter Kasten mit „laut Prospekt: …“. Die Pointe (Türme, Burggraben) fehlt.
  - „Siegel 0/3“ steht als nackter Text unten links.
  - Handy quer: Das Fenster scrollt (523/286 px), die Karte ist abgeschnitten. Handy hoch: 330×248 px Karte über viel Leerfläche, „Siegel 0/3“ überlappt „Thronsaal“.
- **Vorschlag:** siehe Zielbild A
- **Ursache:** `app.js` `showDungeonMap` Z. 309–314 (Modal mit `<p>`-Hinweis und Inline-Stil-Reitern), `dungeon-art.js` `drawDungeonMap`
- **Aufwand:** M

**10 · Geheimnisse offen sichtbar, Pappwand ist ein Bodenkasten.**
- **Ort, Bild:** `d-53-beute-fenster.jpg` und `d-05-hof-ruhe.jpg` (Wehrgang oben mit drei Pappschützen samt Namensschild), `crops/d-13-k1-pappwand-nah.jpg`.
- **Problem:**
  - `drawDungeonGround` zeichnet den Boden aller Räume der Ebene, auch `secret:true`. Nur die Beschriftung fehlt.
  - Der „geheime“ Wehrgang liegt vom Hof aus offen im Bild, mit Leiter und Gegnern.
  - Die Pappwand ist ein flacher brauner Kasten auf dem Boden, keine Wand.
- **Vorschlag:**
  - Unentdeckte Räume als Fels oder Dach zeichnen, Gegner dort nicht rendern.
  - Die Pappwand als Wandfront-Sprite mit Knick und Klebeband, eingedrückt nach dem Fund.
- **Ursache:** `dungeon-art.js` Schleife „Böden mit Fugen“, Übergänge `hidden`
- **Aufwand:** S

**11 · Dauerhafte Weltschrift statt Symbol und Tooltip.**
- **Ort, Bild:** `d-05-hof-ruhe.jpg`, `crops/d-08-treppe-kette-nah.jpg`.
- **Problem:**
  - Dauerhaft in der Welt stehen „Treppe“, „Leiter“, „Getränkeaufzug“, „Lichtschacht“, „Zurück auf die Burgstraße“ und je Raum zwei Zeilen Schild und Wirklichkeit.
  - Das widerspricht E-70 Punkt 4 und der Nutzerregel „Icons + Tooltip statt Text“.
  - Die Treppe ist ein grauer Streifenkasten. Die Kette aus dem Plan fehlt, der Held verdeckt die Beschriftung.
- **Vorschlag:**
  - Übergänge als Sprites mit kleinem Richtungspfeil (↑/↓, Gold, 10 px).
  - Name nur beim Überfahren oder in F-Nähe, die Interaktionstaste sagt es ohnehin.
  - Raumschild als kleine Messingplakette an der Tür (Wandschmuck), Text erst im Tooltip.
- **Ursache:** `dungeon-art.js` `text(...)` für Übergänge, Ausgang, Räume
- **Aufwand:** S

**12 · Tod und Kontrollpunkt falsch beschriftet.**
- **Ort, Bild:** `d-50-tod.jpg`, `d-51-kontrollpunkt.jpg`.
- **Problem:**
  - Im Dungeon heißt der Knopf „AUFWACHEN BEI ST. GANGOLF“.
  - Nach dem Aufstehen kommt der Toast „Du wachst schon wieder bei St. Gangolf auf – immer noch ohne Hose“. Der Dungeon-Text `T.wipe` („Zurück zum Kontrollpunkt …“) geht darin unter.
  - Der Held steht dann mitten im laufenden Kampf der Hofgruppe, weil Gerds Adds sie gerufen haben.
  - Eine Kontrollpunkt-Fahne ist in der Welt nicht zu sehen.
- **Vorschlag:**
  - Knopf „Zurück zum Kontrollpunkt · Schlosshof“, Toast nur `T.wipe`.
  - Fahne als Sprite am Kontrollpunkt, dasselbe Symbol wie auf der Karte.
- **Ursache:** `death-screen.js` (`T.wake`), `content/dialogues.js` `respawn*` über `engine.respawn`
- **Aufwand:** S

**Weitere, kleinere Befunde**
- **Siegeltür:** rosa Rechteck mit drei Kreisen, liest sich wie eine Ampel (`crops/d-22-k2-siegeltuer-nah.jpg`). Soll: Stahltür mit drei Siegelfeldern, siehe Grafikbedarf.
- **Minikarte im Dungeon:**
  - Der Raum ist ein 130×55-px-Kästchen in einem 230-px-Ring, der Raumname hat ~5 px, Gegner fehlen (`crops/d-05-minikarte-dungeon.jpg`).
  - Beim Betreten stand im Schild noch „BURGSTRASSE“ (`d-04-uebergang-0ms.jpg`).
  - Zoom auf 2 Räume Umkreis stellen, Gegner als rote Punkte zeigen.
- **Verfolgung:** zeigt im Dungeon den Weltauftrag „Der übliche Verdächtige“. Im Dungeon sollte sie Siegel 0/3 und Beweise 0/3 zeigen (Plan §14 „Kartenleiste“).
- **Beute:** nur eine Chat-Zeile und ein Toast, der den Wehrgang überdeckt. Es gab keinen Beutel am Boden (Autoloot), die Beute ist allgemein („Kabelbinder-Manschetten“). Die Dungeon-Beute ist ohnehin noch nicht gebaut.
- **Prüfskript:** `scripts/dungeon-check.mjs` ist auf `main` rot bei „Laufen im Hof“ (W 600 ms bewegt < 15 E). Ob das ein Test- oder Spielfehler ist, habe ich nicht untersucht.

## Leistung

Gemessen auf dem Server ohne Grafikkarte, headless, Effektschicht „leicht“:
- **`drawDungeonGround`:** 0,28 ms je Bild bei Dichte 2 und echter Sicht 777×345 E, gemessen auf einer eigenen Leinwand über 60 Durchläufe.
- **Bildtempo:** Median 16,7 ms draußen wie im Hof, also 60 FPS. p90 16,7, schlechtestes Bild draußen 83 ms, im Hof 16,8 ms.
- **Zwischenspeicher:** Der Dungeon zeichnet ohne. Boden, Wandstriche und etwa 20 `strokeText` entstehen in jedem Bild neu, `GroundCache` nutzt er nicht. Das ist heute unkritisch, weil es nur Rechtecke sind.
- **Bedingung für die Umsetzung:** Mit Baukasten-Sprites (Befund 3) muss der statische Teil in einen Zwischenspeicher je Ebene. Schlüssel: `floor + run.version`, Türen und Siegel als kleine Überzeichnung. Sonst gerät das Budget aus E-49 in Gefahr.
- **Dungeon-Karte:** zeichnet alle 200 ms neu, das ist in Ordnung.

**Nicht gemessen:** echte Grafikkarte, echtes Handy, Dichte 3–4, Kosten der mitlaufenden Licht- und Effektschicht im Dungeon, das Rastern der Namensschild-Flut (16 Ratten).

## Drei Zielbilder

### A · Dungeon-Karte (Desktop, Kartenfenster wie Weltkarte fast bildschirmfüllend)

```
┌─[⌂] SCHLOSS BIG B · Keller 1 ───────────────[E0][K1][K2]  [👁 Prospekt] [M][×]┐  Titelzeile 40 px, Reiter 44×32 px
│┌──────────────────────────────────────────────────────────────┐┌──────────────┐│
││  Leinwand füllt die Fläche: 1560×760 px (Seitenverh. 4:3 gelöst)││ ◆ ◆ ◇ Siegel ││  Seitenleiste 300 px
││                                                                ││ 🔍🔍🔍 Beweise ││  Siegel/Beweise als 28-px-Felder
││      ┌─ ─ ─ ─┐  gestrichelt = Prospekt „Marstall“ (Sepia-     ││ ─────────────  ││
││      │ ~Turm~ │  Zeichnung, Bildpipeline)                     ││ ☠ Gerd      ✓ ││  Boss-Zeilen: Porträt 32 px,
││  ┌───┴───────┴──────────────────────────┐  ┌─ ─┐               ││ ☠ Exposé      ││  Klick = Zentrieren + Tooltip
││  │ Ahnengalerie  ⚑        ▣▣▣▣▣▣ Porträts│  │   │              ││ ★ Pferd (?)   ││  ★ selten, gestrichelt optional
││  │ ┌──────────────────────────────────┐  │  │ ~ │ Spiegelsaal  ││ ☠ Kurt        ││
││  │ │ Rittersaal         ◈ Dart         │ ═╡  └─ ─┘            ││ ♛ Big B       ││
││  ├═╡              ▲ (Held, Pfeil 14px)│  │                     ││ ─────────────  ││
││  │ └──────────────────────────────────┘  │  ⤓ Treppe K2 (20px)  ││ ⚑ Kontroll-   ││
││  └───────────────╥────────────────────────┘                    ││   punkt       ││
││             ┌────╨────┐  ☠ 24 px Schädel (Boss, WoW)           ││               ││
││             │Musterwhg│                                         ││               ││
│└──────────────────────────────────────────────────────────────┘└──────────────┘│
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Maße:** Fenster wie die Weltkarte (≈1920×850). Leinwand ≥ 75 % der Fensterfläche. Türen 3 px Pappe-Hell als Unterbrechung der Wand, Wände 3 px Tinte.
- **Symbole:** 20–24 px aus `map-symbols.js`: Schädel für den Boss, grau mit Haken wenn besiegt, Krone für Big B, Stern für selten, Fahne, Treppe mit Pfeil, Aufzug, Schloss mit drei Siegelpunkten.
- **Raumbeschriftung:** nur das Schild, 13 px. Die Wirklichkeit steht im Tooltip, dazu „geräumt/Gegner übrig“. Kein Erklärsatz.
- **Prospekt:** Ein Bild je Ebene aus der Bildpipeline (Sepia-Kupferstich) als Unterlage. Erkundete Räume stanzen es aus und zeigen den Pappe-Grundriss. Der Schalter „Prospekt“ blendet das Bild wieder über alles.
- **Handy:** Karte im Vollbild. Reiter und Siegel als Leiste oben (44 px). Die Seitenleiste wird zu einer ausklappbaren Bossliste. Kein Scrollen.

### B · Boss-Telegrafie (Desktop 2024×900; Handy in Klammern)

```
                ┌──────────── GÄSTELISTE-GERD ───────────── ☠ ┐   Bossrahmen oben mittig, 440×30 (Handy 300×24)
                │█████████████████████░░░░│░░░░░│░░░░░ 62 %   │   Phasenmarken 2 px Gold bei 50 % / 25 %
                └──────────────────────────────────────────────┘
                ┌[⚠] RAUSSCHMISS ───────────── 1,2 s ─────────┐   Zauberleiste 440×24 (Handy 300×22), Text 13 px
                │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░│   Symbol = Antwort: Kegel-Glyphe „seitlich“
                └──────────────────────────────────────────────┘   unterbrechbar: Rahmen gold + [Q]-Kappe
          ── SEITLICH STEHEN! ──  (Ansage 22 px Jersey, rot mit Kontur, 1,5 s, nur bei neuen Mechaniken/Phasen)

                               .-""""""-.          Kegel 70°/11 m:
                          .  /  ›   ›   ›  \  .     • Füllung wächst von innen, Deckkraft 25→45 %
                            / ›   ›   ›   › \       • Randticks alle 12°, 2×5 px Creme
                           /      ▲ Gerd     \      • letzte 25 %: Kante blinkt 8 Hz Creme/Rot
                          '------[🛡]--------'      • Pfeile › = Rückstoß-Richtung, 🛡 = Tank sicher
                                                    • Weltschrift im Kegel ausgeblendet
```

- **Eine Formsprache:** Kreis, Kegel und Linie teilen Farben, Ticks und Blinken. Der Kegel übernimmt die Machart des vorhandenen Bodenkreises.
- **Phasen:** Beim Wechsel blinkt die Phasenmarke kurz und die Ansage läuft. Adds bekommen ein rotes „!“-Namensschild (dieselbe Form wie das Auftragszeichen, aber rot).
- **Handy:** Bossrahmen und Zauberleiste oben mittig zwischen Heldenrahmen und Menü. Truppe als Raid-Leiste 5×(120×22) links. Keine Rahmen über der Arena. Die Sprechblase ankert oberhalb des Bosses und weicht HUD-Flächen aus.

### C · Dungeon-Eingang in der Welt (Burgstraße)

```
              ▄█▄   ▄█▄   ▄█▄   ▄█▄   ▄█▄        Pappzinnen: 5 Zacken 10×12 E, Pappe #b69a6c mit
             ███████████████████████████         Klebebandstreifen, eine Zacke abgeknickt
             █ SCHLOSS BIG B · PRIVATBESITZ █     Schild 60×10 E (Sprite, Bildpipeline), Glühbirnen
    ┌────────┴──────────────┬──────────────┴──┐  Doppelgarage 96×56 E (Nachbarhaus ≈ 90–110 E breit),
    │ ═══════════════════ │ ═══════════════════ │  Satteldach flach/Carport rechts, Wandfront 22 E
    │ ═══ Rolltor links ══ │ ══ Rolltor rechts ══ │  (Regel E-54), rechtes Tor halb offen:
    │ ═══════════════════ │ ▓▓▓▓ Kellerlicht ▓▓▓ │  Licht fällt aus (world-light Quelle)
    └─────────────────────┴──────────────────────┘
       ░░░ Einfahrt Estrich 40×24 E, Öl-Fleck, zwei Pappritter-Aufsteller (neutral) ░░░
                    [Symbol ⛫ auf Welt-/Minikarte, Name nur beim Überfahren]
```

- **Standort:** eigener Platz neben der Straße mit Einfahrt, nicht auf dem Pflaster. Bäume im Umkreis von 60 E freihalten, Schlagschatten wie die Häuser.
- **Wirkung:** Man soll die Garage aus 400 px Entfernung erkennen, auch ohne Namen.
- **Nähe:** Die F-Kappe zeigt „Schloss Big B · Stufe 8–10 · 5 Spieler“. Das Tooltip-Kärtchen ersetzt die Karte „Betreten“ aus dem Plan.
- **Übergang:** Rolltor-Animation 3 Bilder (hoch), dann ein Ladebild 0,8 s mit Prospekt-Motiv und dem Zonentitel „SCHLOSSHOF / Doppelgarage mit Pappzinnen“.

## Grafikbedarf

| Bereich | Motiv | Weg | Freigabe |
|---|---|---|---|
| Eingang | Doppelgarage mit Pappzinnen, 2 Rolltore (eins halb offen, 3 Bilder), Schild „PRIVATBESITZ“, Pappritter-Aufsteller | **Sprite-Schmiede** (Distanzfelder: Quader, Rolltor-Lamellen, Zinnen), Schild als imagegen-Tafel | nein (Gebäude, aber Welt-Grafik ⇒ laut r5-Schutzliste Nutzer zeigen) |
| Beläge/Wände | `estrich-oel` (Garage), `partykeller-fliesen`, `basalt-quader`, Wandfronten Beton/Styropor-Stuck/Basaltgewölbe, Leere als Fels | **Schmiede + Baukasten** (neue `belag`/`wand`-Arten, erben Regeln) | nein |
| Raumdeko | vorhanden: `dartscheibe`, `wimpelkette`, `luftschlangen`, `fass`, `kisten-stapel`, `schreibtisch`, `aktenschrank`, `waschbecken`, `sofa`, `truhe`, `eimer`, `treppe-holz`, `treppenloch`. Neu: Big-B-Porträt ×3 Perücken, Garagen-Pfeiler, Kette mit Schloss, Leiter, Getränkeaufzug, Lichtschacht-Gitter, Greenscreen + Ringlicht, Palettensofa, Schaukelpferd, Tetrapak-Kisten, Sprinklerrohr, Fassrinnen, Bierkisten-Thron, Pappkulissen | **Schmiede** (einfache Körper), Porträts als imagegen-Wandschmuck | nein |
| Türen/Tore | Siegeltür (Stahl, 3 Siegelfelder leer/gefüllt), Pappwand heil/eingedrückt, Arena-Tür mit Absperrband | **Schmiede** | nein |
| Symbole | Karte: Schädel, Krone, Stern, Fahne, Treppe ↑↓, Aufzug, Siegel, Lupe, Lautsprecher, gekreuzte Finger, Auge (20–24 px) | `map-symbols.js` als Code-Glyphen, Zauber-/Siegelsymbole über Bildpipeline | nein |
| Prospekt | 3 Bilder je Ebene (Sepia-Hochglanz-Kupferstich: Türme, Burggraben, Ballsaal, Rosengarten) | **Bildpipeline** (imagegen, `sprites:generate`), passend auf `floors.size` 64×48 m | nein |
| Ladebild | „Schloss Big B“ (Garage mit Scheinwerfern, Pappzinnen im Gegenlicht) | Bildpipeline, Ladeschirm-Modul | nein |
| **Gegner** (Vorschlag) | Security-Azubi (schwarzes Polo „SECURITY“, Spielzeug-Funk), Makler-Praktikant (Konfirmationsanzug, Tablet), Baumarkt-Ritter (Regenrinnen-Rüstung, Eimerhelm, Mülltonnendeckel), Pappschütze (hinter Zinne, Neon-Wasserpistole), Pappwache (flache Pappfigur mit Klebeband, fällt um), Pfandratte (Ratte mit Kronkorken), Schlossgespenst (Beamer-Projektion, halbtransparent) | **Anziehpuppe**: Azubi/Makler/Pappschütze als Archetyp + Kleidung (E-68). Ritter mit neuen Gear-Teilen. Pappwache und Ratte über die **Schmiede** (Körper aus Grundformen), Gespenst als Effekt-Sprite | **ja, nur nach Freigabe** |
| **Bosse** (Vorschlag) | Gerd (breit, zu kleiner Anzug, Klemmbrett, Headset, Sonnenbrille, Notenständer-Pult), Exposé, Rita, halbes Pferd, Korken-Kurt, Big B, je 4 Richtungen + Laufen/Angriff/Zauber/Tod, Maßstab ×1,3–1,5 | Anziehpuppe mit Boss-Maßstab + Codex-Porträt für den Bossrahmen (Weg aus E-69) | **ja** |
| Effekte | Kegel-/Linien-/Sammelkreis-Baustein, Rückstoßpfeile, Konfetti „Pappe fällt“, Sprinklerstreifen, Blitzlicht | Code (Canvas/`world-fx`), keine Bilder nötig | nein |

Die Figurenvorschläge bleiben Vorschläge. Der Kasten „Figuren“ im Plan §15 und die Nutzerregel „Figuren und NPC erst nach Freigabe“ gelten. Bis dahin reicht Befund 5 (Rollenzeichen, Maßstab, Tönung) als Zwischenschritt ohne neue Figurengrafik.

## Nicht gemessen oder nicht geprüft

- **Welten im Code, noch nicht im Spiel:** Exposé, Kurt, Big B, Beamer, Gespenst, Beweise, Social-Media-Managerin, Durchsage-Sprechblase mit Lautsprecher. Die Durchsagen erscheinen nur als Toast und Chatzeile.
- **Nicht geprüft:**
  - Treppe mit Kette im geschlossenen Zustand: Gerd war im Bild schon markiert, eine Kette wird ohnehin nicht gezeichnet.
  - Die Wegmarke über zwei Ebenen: nicht gebaut.
  - Online mit mehreren Menschen.
  - Lichtwirkung zu verschiedenen Tageszeiten.
  - Ein echter Gruppentod mit allen fünf: Getestet ist nur der Tod des Helden allein, die Söldner lebten.
- **„Liste“ (unterbrechbar):** Beide Bildversuche zeigen den Zauber schon beendet, weil die Söldner sofort unterbrechen. Die Leiste der Unterbrechung ist daher nicht bewertet.
- **`BOOT_TRIES=3`:** In `browser-polish.mjs` ist das die Zahl der 100-ms-Warteschritte bis zum Spielstart, mit 3 bricht jeder Start ab. Ich habe `BOOT_TRIES=450` gesetzt und stattdessen 3 Browser-Startversuche eingebaut (CDP 9580–9589).

## Screenshot-Pfade

Alle unter `D:\Dev\MertlochChronicles-dungeon-grafik\_review\`:

- **Eingang/Welt:**
  - Vollbilder: `shots/d-01-eingang-welt.jpg`, `shots/d-02-weltkarte.jpg`, `shots/d-03-eingang-f.jpg`
  - Ausschnitte: `crops/d-01-eingang-nah.jpg`, `crops/d-01-eingang-hover.jpg`, `crops/d-01-minikarte-welt.jpg`
- **Übergang:** `shots/d-04-uebergang-0ms.jpg`, `shots/d-04-uebergang-300ms.jpg`, `shots/d-04-uebergang-1200ms.jpg`
- **Erdgeschoss:**
  - Vollbilder: `shots/d-05-hof-ruhe.jpg`, `shots/d-06-hof-trash.jpg`, `shots/d-07-hofkanzlei.jpg`, `shots/d-08-leiter.jpg`, `shots/d-08-treppe-kette.jpg`
  - Ausschnitte: `crops/d-05-minikarte-dungeon.jpg`, `crops/d-05-zonentitel.jpg`, `crops/d-06-hof-trash-nah.jpg`, `crops/d-07-hofkanzlei-nah.jpg`, `crops/d-08-{leiter,treppe-kette,aufzug}-nah.jpg`
- **Keller 1:**
  - Vollbilder: `shots/d-10-k1-galerie.jpg`, `shots/d-11-k1-rittersaal.jpg`, `shots/d-12-k1-streife.jpg`, `shots/d-13-k1-pappwand.jpg`, `shots/d-14-k1-verlies.jpg`, `shots/d-15-k1-musterwohnung.jpg`
  - Ausschnitte: `crops/d-10-k1-galerie-nah.jpg`, `crops/d-11-k1-rittersaal-nah.jpg`, `crops/d-13-k1-pappwand-nah.jpg`
- **Keller 2:**
  - Vollbilder: `shots/d-20-k2-gewoelbe.jpg`, `shots/d-21-k2-weinkeller.jpg`, `shots/d-22-k2-siegeltuer.jpg`, `shots/d-23-k2-kelterhalle.jpg`
  - Ausschnitte: `crops/d-21-k2-ratten-nah.jpg`, `crops/d-22-k2-siegeltuer-nah.jpg`
- **Karte:** `shots/d-30-karte.jpg`, `crops/d-30-karte-fenster.jpg`, `crops/d-31-karte-{e0,k1,k2}.jpg`
- **Gerd:**
  - Vollbilder: `shots/d-40-gerd-kampf.jpg`, `shots/d-41-gerd-liste.jpg`, `shots/d-42-gerd-kegel-frueh.jpg`, `shots/d-43-gerd-kegel-spaet.jpg`, `shots/d-44-gerd-dresscode.jpg`, `shots/d-45-gerd-phase2.jpg`, `shots/d-46-gerd-phase3.jpg`
  - Ausschnitte: `crops/d-41-gerd-zielrahmen.jpg`, `crops/d-4{1..5}-*-nah.jpg`
- **Tod/Kontrollpunkt/Beute:** `shots/d-50-tod.jpg`, `shots/d-51-kontrollpunkt.jpg`, `shots/d-52-beute-boden.jpg`, `shots/d-53-beute-fenster.jpg`, `crops/d-52-beute-nah.jpg`
- **Handy quer (844×390):** `shots/q-01-eingang-welt.jpg`, `shots/q-03-eingang-f.jpg`, `shots/q-05-hof.jpg`, `shots/q-06-hof-trash.jpg`, `shots/q-11-k1-rittersaal.jpg`, `shots/q-21-k2-weinkeller.jpg`, `shots/q-30-karte.jpg`, `shots/q-41-gerd-liste.jpg`, `shots/q-42-gerd-kegel.jpg`
- **Handy hoch (390×844):** `shots/h-*` mit denselben Namen wie quer
- **Messwerte:** `report-desktop.json`, `report-perf.json`, `report-quer.json`, `report-hoch.json`, Skript `szenen.mjs`
