# Backlog · welt

Inbox der Rolle Welt-Design (docs/ROLLEN.md).

## Offen

- [ ] Kapitel-Lager sichtbar machen: Sperrmüllplatz (Schrott, Hänger), Festplatz mit Kegelbahn-Trümmern, Bus im Feld als Kulissen-Objekte; heute nur Gegner und Sammelpunkte (Renderer-Anbindung bei UI anfordern).
- [ ] Bude als Gebäude mit sichtbaren Ausbaustufen (Trümmer → Tresen → Anlage …) nahe St. Gangolf.
- [ ] **Aggressiver Keiler im Wohngebiet (vr-08)** – Befund von Gameplay (2026-09-17): die Ursache liegt in `encounters.buildCell` (Bedarf steht in `docs/backlog/engine.md`), nicht in den Gegnerdaten. `field` wird dort aus der **ersten passenden** Fläche abgeleitet; eine Wiese/ein Rasen im Wohnpolygon schlägt das Wohngebiet, und Punkte ganz ohne Fläche gelten ebenfalls als Feld. Von Welt gebraucht: (a) liegen in den Ortslagen Wiesen-/Rasen-Polygone **innerhalb** von `landuse=residential` (Gärten, Spielplatz, Bolzplatz)? Wenn ja, ist das die Quelle und darf so bleiben – die Engine muss das Wohnpolygon als Veto behandeln. (b) Gibt es Lücken zwischen den Polygonen im Ortskern (Hofflächen ohne `landuse`)? Dann zusätzlich eine `residential`-Hülle oder ein `village`-Tag um den Ortskern. `world-layout.js` hat mit `residential(w,p)` bereits den richtigen Test – er wird in `encounters.js` nur nicht benutzt.
- [ ] Kiosk als Ort im Dorfkern (Gameplay-Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`): Kioskkönig Kalle steht heute nur als Dorfbewohner herum; er soll eine Bude mit Tresenfenster bekommen, an der man stehen bleibt. Erst nach Freigabe des Händler-Konzepts.

## Erledigt
