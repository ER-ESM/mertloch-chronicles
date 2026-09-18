# Spielnahe Pre-Render-Demos · 18.09.2026

Die [interaktive Demo](../prerender-demo.html) zeigt Dosen-Dieter, Aperol-Anni (`baerbel`) und Klo-Kevin mit neun Ausrüstungssets auf einem Dorfplatz. Start: `npm start`, danach `http://localhost:4173/prerender-demo.html`. In dieser Sitzung läuft die Seite zusätzlich auf Port 4283.

## Bedienung

- Held und Set auswählen oder sieben Ausrüstungsplätze selbst kombinieren.
- Stehen, Laufen, Angreifen, Treffer und Ausruhen; vier Blickrichtungen; pausierbare Animation.
- Auf den Platz klicken oder im fokussierten Dorfcanvas WASD/Pfeiltasten verwenden. Leertaste zeigt die Angriffspose. Die Bewegung ist eine Vorschau innerhalb des Platzes, keine vollständige Spielsimulation.
- Nah-/Fernkampf umschalten. Zweihandwaffen verdrängen den Schild über die bestehenden Spielregeln.
- Spielzoom 2× oder Detailzoom 4×. Dorfansicht und Vergleich lassen sich direkt als PNG speichern.

## Die neun Sets

| Held | Set | Sichtbare Hauptmerkmale |
|---|---|---|
| Dieter | Feierabend | Clanjacke, Mehrwegflasche, Topfdeckel |
| Dieter | Dorfverteidiger | Bierdeckelweste, Dosenbrecher, Kopfbedeckung, Gans-Orden |
| Dieter | Tresenabriss | Regenjacke, Zweihandhammer, Fellstiefel |
| Anni | Hygieneeinsatz | Regenjacke, Hochdruckspray, Gans-Orden |
| Anni | Gießkommando | Clanjacke, Gießkanne, Glückspfote |
| Anni | Ruhe im Dorf | Bierdeckelweste, Trillerpfeife, Praktikantenausweis |
| Kevin | Pfandjäger | Pfandschleuder, Bierdeckelweste, Dachsdeckel |
| Kevin | Dosen-Duell | Dosenklinge, Topfdeckel, Clanjacke |
| Kevin | Letzte Mahnung | Horststempel, Regenjacke, Schnorrerbecher |

Alle IDs stammen aus `content/items.js`. Die Sets stehen in `prerender-demo-presets.js`; es entstehen keine neuen Loot-Einträge.

## Übereinstimmung mit dem Spiel

Die Demo verwendet unverändert `loadPrerenderArt()` / `drawPrerenderPerson()` aus `prerender-art.js`, den vollständigen bestehenden Katalog und dieselben 216 PNG-Bögen (6 Körperbögen, 210 Gear-Bögen). `equipmentPlan()` und `equipmentAppearance()` bestimmen Slots, Zweihandverhalten und sichtbare Asset-IDs. In der Welt wird mit `magnify=1` gezeichnet; der Canvas hat dieselbe Dichte von vier Pixeln je Welteinheit und den Desktop-Spielzoom 2×. Porträts und Vergleichsansichten verwenden ausdrücklich die Vergrößerung 4×.

Gebäude, Pflaster und Requisiten kommen über die vorhandenen Welt-Zeichenfunktionen. Die Dorfanordnung ist eigens für den Vergleich gesetzt. Die Demo benutzt keine Spielstände, Kampfberechnung, Quests oder vollständige Weltkollision. Nur der aktive Held wird bewegt; die beiden anderen dienen als Größenvergleich.

Es war kein neuer Pre-Render-Build nötig: Alle drei Helden und alle 35 Gear-Familien lagen bereits vollständig exportiert vor. Es wurden keine Modelle oder Sprite-Bögen verändert. Die Seite ist Teil des normalen Site-Builds, einschließlich ihrer Module und Styles.

## Bilder

- [Desktopübersicht](../assets/prerender/review/demo-desktop.png)
- [Dorfplatz im Detailzoom](../assets/prerender/review/dorfplatz-detail.png)
- [Dorfplatz als PNG-Export](../assets/prerender/review/dorfplatz-export.png)
- [Neun Sets von vorne](../assets/prerender/review/neun-sets-vorne.png)
- [Neun Sets von hinten](../assets/prerender/review/neun-sets-hinten.png)
- [Angriff](../assets/prerender/review/neun-sets-angriff.png)
- [Laufphase](../assets/prerender/review/neun-sets-laufen.png)
- [Mobilansicht](../assets/prerender/review/demo-mobile.png)

## Prüfung und Sichtbefund

`npm test`: 378/378 erfolgreich. `npm run build`: erfolgreich. Die drei neuen Tests prüfen echte Item-/Slot-Zuordnungen, vollständige Sprite-Matrizen der Sets und Zweihandverdrängung.

`tools/prerender/review-demo.browser.js` prüft die Seite mit Playwright auf Port 4283: 216/216 Bilder geladen; neun Sets × vier Richtungen × fünf Zustände ergeben je Set 20 unterschiedliche, nicht leere Ansichten. Porträts und Richtungsansichten haben in diesen Fällen transparente Ränder. Geprüft sind außerdem sichtbarer Wechsel von Nah- zu Fernkampf, Schildentfernung bei Zweihand, Tastaturbewegung, PNG-Downloads und 390 × 844 CSS-Pixel ohne horizontalen Überlauf. Keine JavaScript- oder HTTP-Fehler. Das Skript erzeugt die obigen Bilder erneut.

Bei der Sichtprüfung wurde ein abgeschnittener unterer Rand der Ruhepose in den kleinen Vorschaufenstern korrigiert. Die Vorschau verwendet nun für alle Posen denselben Fußpunkt mit ausreichend Platz darunter; keine individuelle Größenanpassung pro Pose.

**Grenzen der gelieferten Pipeline:** Der aktuelle Kasten-Körper ist als technischer Prototyp deutlich erkennbar. Ausgearbeitete Gesichtszüge, Dieters Bauch und Annis Frisur fehlen. Gehaltene Gegenstände sind in einzelnen Ansichten stark verdeckt; die Zweihandwaffen verwenden noch die allgemeine Arm-Pose ohne zweiten Handkontakt. Die Gear-Layer maskieren gegen den Körper, besitzen untereinander aber keine vollständige gemeinsame Tiefenauflösung. Allgemeine Item-Familien können noch falsche Einzelmotive zeigen (z. B. Dienstmütze als `helmet`); Nebenhandwaffen verwenden im vorhandenen Export weiterhin das rechte Waffen-Rig. Diese Demos machen den tatsächlichen Stand prüfbar und sind keine Freigabe der finalen 3D-Optik oder aller frei kombinierbaren Gegenstände. Grundlage für die Modelllieferung bleibt die [3D-Übergabe](UEBERGABE-3D-ASTRA-2026-09-18.md).
