# Übergabe an OpenAI Astra · 3D-Modelle für den Pre-Render-Weg (E-30) · 2026-09-18

**Projekt:** Mertloch Chronicles, Browser-Rollenspiel im Pixel-Stil „Maifeld-Detailpixel" (E-10). GitHub `ER-ESM/mertloch-chronicles`, live https://er-esm.github.io/mertloch-chronicles/.
**Auftrag:** Drei Helden-Figuren und 35 Ausrüstungsteile als 3D-Modelle liefern, die unsere Pre-Render-Pipeline in Pixel-Sprites verwandelt. Die Pipeline existiert und läuft mit einem Platzhalter-Rig aus Kästen (Demo: `visual-review/prerender-2026-09-18/demo-dieter.png`). Geliefert werden nur Modelle; Kamera, Posen, Palette, Kontur und Bogenformat macht die Pipeline.

## 1 · Was die Pipeline macht (damit klar ist, was NICHT geliefert werden muss)

- Lädt je Held ein Rig mit benannten Knochen, hängt Ausrüstungs-Meshes an diese Knochen, stellt acht Posen und einen Laufzyklus **prozedural** ein (`tools/prerender/poses.js`). Eigene Animationen sind willkommen, aber nicht nötig.
- Rendert orthografisch mit 22° Aufsicht, vier Blickrichtungen (se, sw, ne, nw), 4 native Pixel je Welteinheit, festes Licht und gebackener Bodenschatten (siehe §7), ohne Antialiasing.
- Quantisiert auf die 40-Farben-Palette und zieht eine 1-px-Kontur (`171f29`). Texturen werden also auf 40 Farben reduziert: flächige, kontrastreiche Farben liefern, keine Verläufe, keine Fototexturen.
- Rendert jedes Ausrüstungsteil als eigene Ebene mit dem Körper als Tiefenmaske. Verdeckung ist damit eingebrannt; die Laufzeit stapelt Basis + Ebenen.
- Schreibt Bögen 192×192 je Bild (Fußpunkt bei 96/160) im Format `assets/precision/runtime/catalog.json` nach `assets/prerender/runtime/`.

## 2 · Lieferumfang

### 2.1 Drei Helden (glTF 2.0, `.glb`, Y hoch, Blick +Z, Fußsohlen auf y=0)

| ID | Figur | Körperbau | Grundkleidung (ohne Ausrüstung) | Höhe Scheitel |
|---|---|---|---|---|
| `dieter` | Dosen-Dieter, Tank, Mitte 40, Bierbauch, Vollbart, Halbglatze | stämmig, Schultern breit | Unterhemd und Kutte offen, Jeans, Arbeitsstiefel | 26 Einheiten |
| `baerbel` | Aperol-Anni, Heilerin, Ende 30, rotes Haar hochgesteckt | schlank | Schürze über Bluse, Leggings, Sneaker | 25 Einheiten |
| `kevin` | Klo-Kevin, Fernkampf, Mitte 20, Kappe, schlaksig | lang und dünn | Kapuzenpulli, Cargohose, Turnschuhe | 27 Einheiten |

Ton der Figuren: derb, dörflich, liebevoll (E-20). Keine realen Personen. Gesichter lesbar bei 6 Einheiten Kopfhöhe (24 px im Render): große Augen, klare Nase, Bart als Fläche.

**Pflicht-Knochen (exakte Namen, Hierarchie wie angegeben):**

```
root (0,0,0)
└ hips
  ├ spine
  │ └ chest
  │   ├ neck
  │   │ └ head            (Drehpunkt am Halsansatz)
  │   ├ shoulderL → armL → forearmL → handL
  │   └ shoulderR → armR → forearmR → handR
  ├ thighL → shinL → footL
  └ thighR → shinR → footR
```

Rest-Pose: A-Pose (Arme leicht abgespreizt, ~15°), Beine hüftbreit, Handflächen nach innen. `handL`/`handR` sitzen in der Faust (Griffpunkt gehaltener Dinge). Meshes dürfen geskinnt sein (SkinnedMesh) oder starr an Knochen hängen; beides verarbeitet die Pipeline. Polygonbudget je Held ≤ 6 000 Dreiecke.

### 2.2 Ausrüstung (je Teil eine `.glb`, Name = Asset-ID, Ursprung am Knochen-Drehpunkt)

Die Asset-IDs sind Speicherschlüssel und dürfen nicht umbenannt werden. Der Knochen gibt an, wo der Ursprung des Meshes liegt; Teile für beide Seiten (z. B. Stiefel) werden **einmal** geliefert und von der Pipeline gespiegelt.

| Asset-ID | Knochen | Was es ist |
|---|---|---|
| `helmet` | head | Bauhelm/Blechhelm |
| `cap` | head | Schirmmütze |
| `jacket` | chest | Kutte/Jacke, offen |
| `raincoat` | chest | Regenjacke, gelb |
| `vest` | chest | Bierdeckelweste |
| `pauldron` | shoulderL/R | Schulterplatte (Metall) |
| `shoulderpad` | shoulderL/R | Schulterpolster (Leder) |
| `glove` | handL/R | Arbeitshandschuh |
| `bracer` | forearmL/R | Armschiene |
| `belt` | hips | Gürtel mit Schnalle |
| `boot` | footL/R | Arbeitsstiefel |
| `leatherboot` | footL/R | Kabelbinder-Lederstiefel |
| `furboot` | footL/R | Fuchspfoten-Fellstiefel |
| `trouser` | thighL/R | Hose (Ober- und Unterschenkel, ein Mesh je Bein) |
| `chain` | chest | Halskette |
| `pendant` | chest | Anhänger |
| `medal` | chest | Gans-Orden |
| `badge` | chest | Praktikantenausweis/Hausordnung |
| `pouch` | hips | Beutel am Gürtel |
| `tusk` | hips | Keilerzahn am Gürtel |
| `badgercharm` | hips | Dachsdeckel-Talisman |
| `cup` | hips | Schnorrerbecher |
| `ring` | handR | Ring (klein, darf 4 px groß sein) |
| `club` | handR | Dosenbrecher (Knüppel), Länge ~12 |
| `blade` | handR | Dosenklinge, Länge ~11 |
| `maul` | handR | Zweihandhammer, Länge ~14, Kopf breit |
| `slingshot` | handR | Pfandschleuder |
| `sprayer` | handR | Sprühflasche (Annis Waffe) |
| `bottle` | handR | Flasche |
| `wateringcan` | handR | Gießkanne |
| `whistle` | handR | Ruhepfeife |
| `stamp` | handR | Horststempel |
| `robotclaw` | handR | Automatenarm |
| `potlid` | handL | Topfdeckel (Schild), Ø ~6 |
| `shield` | handL | Schild rechteckig, ~5×7 |

Gehaltene Dinge: Griffpunkt im Ursprung, Klinge/Kopf entlang +Y (die Pipeline neigt sie 30° nach vorn). Größen in Welteinheiten (Held 26 hoch).

### 2.3 Stil und Material

- Palette (40 Farben, Hex): `242333 413440 67463e 926044 b67b50 dda071 f4c698 ffe6bb f8f0d5 c8c5af 898c83 526d76 334d59 243841 354b36 55704a 849451 bac475 953d32 ce5d31 ec8b36 f3b84b 95653e 634b37 171f29 364047 786259 9f806d d49779 edb495 fff2d6 d9d7c2 aaab98 719090 456476 768a67 a6ac80 b74724 e57438 ffd274`
- Materialien: Flächenfarben (Vertex Color oder unbeleuchtetes Base-Color-PBR ohne Metallic/Roughness-Maps). Jede Fläche in **einer** Palettenfarbe; Schattierung übernimmt das Licht. Signalfarben sparsam: Gold `f3b84b` nur für Schnallen/Orden, Korallrot `e18569` nie an Ausrüstung.
- Keine Texturen über 256×256, keine Normal Maps, keine Transparenz.
- Referenzbilder des Zielstils: `assets/content-art/aperol-anni/hero.png`, `assets/precision/runtime/heroes/dieter-poses.png`, `ART-DIRECTION.md`.

## 3 · Ablage und Abnahme

- Dateien nach `assets/prerender/models/heroes/<id>.glb` und `assets/prerender/models/gear/<asset>.glb`. Der glTF-Loader wird in `tools/prerender/rig.js` an die Stelle von `buildHero()`/`GEAR` gesetzt; bis dahin gilt das Kasten-Rig.
- Prüfung: `node tools/prerender/build-prerender.mjs --heroes <id> --assets <liste>` rendert die Bögen; `node tools/prerender/demo-sheet.mjs <id> <liste>` erzeugt das Kontrollbild wie die Demo. Abnahme durch die Produktion (E. Ruf) anhand des Kontrollbilds: Figur bei 104 px Höhe lesbar, Gesicht erkennbar, Ausrüstung in allen vier Richtungen sichtbar und richtig verdeckt.
- Kein Teil darf die 192-px-Zelle sprengen (Fußpunkt 96/160, also 40 Einheiten nach oben, 24 nach links/rechts).

## 4 · Kontext für Rückfragen

- Entscheidungen: E-02 (drei Archetypen), E-10 (Stil), E-11 (Maßstab über Türöffnungen, Held 26 Einheiten), E-17 (Klassenwahl = Klamottenwahl, Mentoren bleiben NPCs), E-30 (Pre-Render, in `docs/ENTSCHEIDUNGEN.md`).
- Pipeline-Quellen: `tools/prerender/rig.js` (Rig, Knochen, Gear-Zuordnung), `poses.js`, `render.html` (Kamera, Palette, Kontur), `build-prerender.mjs`, Laufzeit `prerender-art.js`.
- Ansprechpartner: Produktion E. Ruf, technische Anbindung UI-Rolle (Mertloch-Pipeline, `docs/ROLLEN.md`).

## 5 · Konkrete Demos mit dem aktuellen Pipeline-Stand

[Interaktive Dorfplatz-Demo](../prerender-demo.html): drei Helden, neun echte Ausrüstungssets, vier Richtungen, Lauf-/Kampfposen, frei wählbare Gegenstände und PNG-Export. Sie nutzt denselben Pre-Render-Figurenrenderer wie das Spiel. [Dokumentation, Vergleichsbilder und bekannte Grenzen](PRERENDER-DEMOS-2026-09-18.md). Die dargestellten Körper stammen weiterhin aus dem Kasten-Rig; die oben beauftragten 3D-Modelle stehen aus.

Nach der Kritik an der Detailarmut des Kasten-Rigs entstand die [detaillierte Themen-Demo](../theme-demo.html) mit Bier/Braukunst, Aperol/Zitrus und Pfand-Technik. [Originale, Vergleichsbilder und Exportvertrag](THEMEN-DEMO-2026-09-18.md). Diese ausgearbeiteten Rasteransichten sind eine konkrete visuelle Vorgabe für die spätere Modellierung, noch keine austauschbaren 3D-Rigs.

## 6 · Umsetzung des anschließend beauftragten Sprite-Redesigns

Der Auftrag, den bestätigten Detail-Look für alle Richtungen und Bewegungen produktiv zu verwenden, ist im neuen Raster-/Gelenkpfad umgesetzt: [Bewegungsdemo](../redesign-demo.html), [Pipeline, Inventaranbindung und Prüfvertrag](REDESIGN-PIPELINE-2026-09-18.md). Der normale Spielrenderer lädt 384 Körperbilder einschließlich eigener Zweihandhaltungen und 24 neue Gear-Ansichten. Die oben beschriebenen GLB-Modelle werden damit nicht als geliefert ausgewiesen; sie gehören weiterhin zum gesonderten 3D-Modellierungsauftrag.

## 7 · Kamera, Licht, Schatten (verbindlich, E-41)

Die Wirkung vorgerenderter Figuren entsteht daraus, dass ALLE Assets mit derselben Kamera, demselben Licht und demselben Schatten entstehen. Diese drei Dinge gehören deshalb der Pipeline (`tools/prerender/stage.js`, `light-convention.js`) und **nicht** dem Modell.

**Nicht mitliefern:** keine Lichter (`KHR_lights_punctual`), keine Kameras, keine Boden-/Schattenebenen, keine eingebrannte Beleuchtung oder Ambient-Occlusion in den Texturen, keine Emissive-Aufheller, keine Schatten-Decals unter den Füßen. Materialien matt (Grundfarbe, keine Spiegelungen, kein Metall-Glanz), weil das Ergebnis auf 40 Farben quantisiert wird. Mitgelieferte Lichter und Kameras werden nicht verwendet.

| Festlegung | Wert | Begründung |
|---|---|---|
| Kamera | orthografisch, Neigung **22°** nach unten, keine Drehung (gedreht wird das Modell: se −40°, sw +40°, ne −140°, nw +140°), **4 px je Welteinheit**, Bild 192², Fußpunkt (96,160) | Die Welt ist eine Draufsicht mit frontal gezeichneten Objekten (¾-Sicht), kein 45°-Iso. Die Präzisions-Sprites zeigen die Figur fast frontal mit knapp sichtbarer Kopf-/Schulteroberseite, das entspricht 20–25°. sin 22° = 0,375 ≈ Schatten-Stauchung 0,38: ein Kreis am Boden hat im Render dieselbe Verkürzung wie die Schattenellipse der Laufzeit. |
| Schlüssellicht (Sonne) | Richtungslicht, Azimut **−139,43°** (Bodenebene ab +z/zur Kamera, positiv nach +x), Höhe **72°**, Farbe `ffe6bb`, Stärke 1,5, einziges Licht mit Schattenwurf | Der Azimut folgt zwingend aus der Konvention „Schatten fällt im Bild nach rechts unten, Richtung (0,80; 0,35)" und der Kameraneigung (Herleitung in `light-convention.js`). Die Sonne steht damit links hinter der Figur – im Bild links oben. Die Höhe bestimmt nur die Schattenlänge (0,23 × Figurenhöhe): kompakt wie die Laufzeit-Ellipse und bei stehender Figur innerhalb des Rahmens. |
| Fülllicht | Richtungslicht links oben hinter der Kamera (Azimut −37°, Höhe 45°), Farbe `fff2d6`, Stärke 1,5, **ohne** Schattenwurf | Hält die der Kamera zugewandte Seite hell und lesbar (helle Seite links oben, E-10); Lage wie das frühere Einzellicht, damit der Farbcharakter bleibt. |
| Himmel/Boden | Hemisphäre `fff2d6`/`55704a` Stärke 1,9, Umgebung 0,35 | Verhindert, dass Schattenseiten bei der Quantisierung in fremde Farbtöne kippen. |
| Bodenschatten | echter Schattenwurf des Körpers auf eine unsichtbare Ebene in Sohlenhöhe, weichgezeichnet (Gauß σ 2,4 px), Farbe `1c2a22`, Deckkraft höchstens 0,42, in den Basisbogen unter die Figur gebacken; Katalog `shadowBaked:true` | Schatten und Licht stammen aus derselben Richtung. Die Laufzeit zeichnet für solche Figuren keinen eigenen Schatten (`prerenderHasBakedShadow`). |

Für das Modell heißt das: **Fußsohlen exakt auf y=0** (dort liegt die Schattenebene), geschlossene Meshes ohne Löcher an der Unterseite (sonst Löcher im Schatten), keine frei schwebenden Hilfsobjekte. Kontrollbilder: `npm run prerender:shadow-check <held>` → `visual-review/prerender-licht/`.
