# Backlog · balance

Inbox der Rolle Balancing (docs/ROLLEN.md).

## Offen

- [ ] **Dungeon „Schloss Big B"** (wartet auf V-D1 bis V-D11): Zahlenentwurf ins Tuning, Gruppenlauf `scripts/dungeon-sim.mjs` für kürzesten Weg und vollen Durchgang, Zielzeiten je Boss für fünf Köpfe und für Solo mit Söldnern, Beweis-Abzug für die Lügen-Frist; Heilung auf Stufe 10 zuerst messen. Entwurf: [DUNGEON-SCHLOSS-BIG-B-2026-09-23.md](../DUNGEON-SCHLOSS-BIG-B-2026-09-23.md) Abschnitte 8 und 16.
- [ ] **Frühe Eskalation (E-29)**: COMBAT_RULES.earlyEscalation.factor=1.6 ist ein Startwert der UI-Runde. In der Arena Stufe 1–2 prüfen, ob die Kelle mit Automatik den Korridor 4–7 s je Feldgegner hält; Korrektur über tuning.js.

- [ ] **Restposten aus Runde B: acht ⚡ bei Dieter, davon fünf nicht über Kit oder Schadensmodell erreichbar** (Klassendesign, 2026-09-17). Dieters Kelle liegt jetzt auf 1,5 s statt 0,85 s, das hat 20 Auffälligkeiten auf 8 gedrückt und alle ⚠ bei Kevin beseitigt. Offen bleiben Pfanddachs 2,6 s, Leergut-Rabe 2,6 s, Grillgut-Gans 3,0 s, Pfandfuchs 3,3 s, Pfandkeiler 3,6 s (Korridor 4–12 s) sowie Borsten-Bruno 4,2 s und Oberpraktikant Olaf 4,6 s (Korridor 8–24 s) und der Pfandautomat mit 9,4 s (Korridor 10–25 s). Drei davon (Keiler, Automat, teils die Eliten) fallen weg, sobald Gameplay das Schadensmodell angleicht (`docs/backlog/gameplay.md`).
  Was dann noch steht, ist **kein Klassenproblem mehr, sondern die Untergrenze der Stufe-1-Tiere**: selbst mit angeglichenem Modell liegt Dieter beim Pfanddachs bei 3,2 s, Bärbel bei 4,1 s, Kevin bei 4,3 s – Bärbel ist also selbst nur 0,1 s über dem Korridor. Mit 360 Leben ist der Dachs für *alle drei* zu dünn; dasselbe gilt für Rabe (380) und Fuchs (400). Vorschlag zum Nachrechnen: Dachs 360 → 430, Rabe 380 → 450, Fuchs 400 → 470 (rund +20 %), dann noch einmal den Bericht ziehen. Die Engine setzt im Umland auf diese Grundwerte auf (`encounters.scaledStats`), also bitte wie bei Gans und Rabe mit beiden Tabellen gegenprüfen.
  Der zweite Teil ist Ausrüstung, nicht Gegner: Dieters Zweihandwaffe würfelt 25–36, die Fernkampfwaffe der anderen deutlich weniger, und sein Autoangriff trägt bei langen Kämpfen spürbar. Falls Gegner-Leben nicht reichen soll, ist der Waffenhaushalt (`content/items.js`, `WEAPON_TYPES`) der nächste Hebel → Loot.
- [ ] **Ein Befund erklärt fast alle Auffälligkeiten: Dieter ist zu schnell.** Auf der eigenen Stufe fällt er bei jedem Feldgegner (2,1–3,7 s statt 4–12 s), bei beiden Eliten (4,1 s statt 8–24 s) und bei drei Bossen (Horst 8,8 s, Gisela 9,5 s, Automat 7,8 s statt 10–25 s) unter den Korridor. Bärbel und Kevin liegen bei denselben Gegnern im Korridor. Gegnerwerte können das nicht heilen (Rechnung in `content/tuning.js` beim Kegelbruder) → liegt bei Klassendesign (`docs/backlog/klassen.md`). Danach den Bericht neu ziehen: `klaus` und `timo` im Tuning sind dann womöglich überflüssig.
- [ ] **Kevin stirbt an Feldgegnern seiner eigenen Stufe** (je 1 von 3 Läufen gegen Ruhewart und Praktikant auf Stufe 3, gegen den Schnorrer auf Stufe 2 und 3; dazu 18–28 s Kampfzeit). Das verletzt den Korridor härter als jede Trivialität. Ursache liegt in Kevins Kit auf Stufe 2–3, nicht am Gegner → `docs/backlog/klassen.md`.
- [ ] **Horst (8,8 s) nicht über `tuning.js` korrigierbar**: `BOSSES.horst` ist eine Kopie von `CAMP_ENEMIES.boss`; eine Tuning-Zeile würde nur eine der beiden Definitionen treffen, und im Spiel steht die Lagerdefinition. Bitte an Gameplay, beide zusammenzuführen (`content/enemies.js`), dann korrigiert Balancing.
- [ ] **`BALANCE.items.quality.common` bewusst nicht angelegt** (Bitte der Engine aus Runde A). Eine neue Güte in `BALANCE.items.quality` wandert sofort über `QUALITIES=Object.keys(...)` in jeden Wurf – und `itemization.restoreRolls` filtert Spielstände hart über `/^roll-…-(uncommon|rare|epic)-…$/`. Gerollte „common“-Teile wären nach dem Neuladen weg. Erst wenn die Engine diesen Filter aus `QUALITIES` ableitet, legt Balancing den Faktor an (Vorschlag: `common:.7`, Gegenstandsstufe `itemLevel.common:0`).
- [ ] Kapitelgegner (`kegler`, `jga`) bleiben ab Stufe 15 trivial – sie stehen in Kapitel-Lagern und werden absichtlich nicht mit der Spielerstufe skaliert. Nach dem Kapitelumschalter prüfen, ob ein Spieler sie überhaupt so spät noch trifft.
- [ ] Sigi zwei Stufen unter der Heilerin 40 s, gewollt zäh; auf eigener Stufe 5 jetzt gemessen: 10,1 / 18,8 / 18,2 s – im Korridor. Nach Playtest bestätigen lassen.
- [ ] Basisbau-Kosten nach erstem Playtest gegen den Materialfluss je Kapitel prüfen (docs/AKT-1-FILMRISS.md §6).

## Erledigt

- [x] **Umland-Tiere ab Stufe 10 nicht mehr trivial** (2026-09-17). Erst über `tuning.js` gehoben (Dachs/Gans/Rabe/Fuchs), nach dem Rebase auf die Engine-Runde-A wieder zurückgenommen: `encounters.scaledStats` skaliert Feldgegner jetzt selbst mit der Spielerstufe, flaches Leben hätte sich damit gestapelt. Geblieben sind zwei Grundwerte, die an *beiden* Enden zu dünn waren: `goose` 300→390, `raven` 260→380. Ergebnis im Umland: kein `·` mehr bei irgendeiner Art auf Stufe 10 oder 15.
- [x] **Der Bericht misst jetzt das, was der Spieler trifft** (2026-09-17, `scripts/balance-report.mjs`): zweite Tabelle „Umland“ mit `scaledStats`, jeder Gegner zusätzlich auf seiner eigenen Stufe (Sigi 5 und Timo 7 fehlten vorher ganz), Korridor-Flaggen ⏳/⚡ je Gegnerart, Notiz bei jedem Tod an einem Feldgegner, `*` und Fußnote „Tuning-Korrekturen“ je korrigierter ID.
- [x] **Kapitel-Bosse und Feldgegner gegen den Korridor** (2026-09-17): `klaus` 4200→4800 (Dieter 9,0→10,2 s), `timo` 4800→5300 (9,4→10,5 s), `jga` 720→840 (Bärbel 3,9→4,6 s). `kegler` bewusst unverändert, Rechnung in `content/tuning.js`.
- [x] **Zwei der drei Zahlen aus der Engine-Runde nachgezogen** (2026-09-17, `content/balance.js`): `enemies.playerLead:2` (bestätigt den bisherigen Rückfallwert, keine Verhaltensänderung) und `weapons.quality.epic:1.4` (bisher fiel die Waffe auf den `rare`-Faktor 1,25 zurück; 1,4 setzt den Schritt uncommon→rare→epic gleichmäßig fort und hält den Unique-Deckel von 3,2 ein).
- [x] **Eigene Invarianten** (2026-09-17, `content/checks/balance.js`): EP-Kurve streng steigend (je Stufe und gesamt), Kill-EP steigen von Tier über Mensch und Elite zum Boss, Kapitelbelohnungen (EP und Münzen) wachsen je Akt mit dem Kapitel, Elite-Schadensfaktor zwischen 1,1 und 1,6.

## Begleiter / Söldner (E-45) · 2026-09-21

Herkunft und Schnittstelle: [Begleiter-Übergabe](../BEGLEITER-2026-09-21.md).

- [ ] Erstlauf Begleiter: COMPANION_ROLES/COMPANION_RULES gegen die TTK-Matrix prüfen (Stufe 1 gegen drei Keiler fällt der Schutz-Söldner – gewollt knapp oder zu schwach?). Ziel: mit vier Söldnern machbar, aber langsamer als mit Menschen. Kosten costBase/costPerLevel gegen Münzeinkommen je Stufe.
- [ ] balance-report.mjs um eine Begleiter-Zeile erweitern (Schaden/Heilung je Sekunde je Rolle und Stufe).

- [x] **E-56 (23.09.), erledigt mit E-59:** Ursache war die einfachere Rotation des Berichts, nicht Kevin; mit der gemeinsamen Rotation (`scripts/balance-rotation.mjs`) 17–21 s. Ursprünglich: Kevin gegen Bosse auf eigener Stufe 37–44 s (Korridor 10–25 s, vorher 28–30 s) und stirbt gegen Sperrmüll-Sigi auf Stufe 5 manchmal. Dieter 13–16 s, Bärbel 21–26 s. Hebel: Kevin-Kniffe oder Boss-Leben in `content/tuning.js`, nicht die allgemeinen Wertkurse in `BALANCE.power/ratings`.

- [x] **Balance-Sheet (E-57), erster Lauf 23.09., erste Runde E-59:** Spec-Mittel jetzt auf Ziel (Schaden 0,99–1,02, Tanks 0,82, Heiler 0,75), ⚑ 280 → 209. Ursprünglich: 280/540 Messungen > 15 % neben dem Median ihrer Rolle. Zuerst: Kevin „Jagd“ Pfad 1 ab Stufe 15 ~45 Schaden/s (Talent bricht Rotation?), Dieter „Brauerei“ Stufe 5 ohne Heilung, Bärbel Schaden-Specs Stufe 5 ~+90 %. Arbeitsweise: `npm run balance:sheet`, Zerlegung lesen (Talent/Kniff/Wert), Zahlen in content/ anpassen, Sheet erneut.

## Balancing-Runde 1 (E-59) · erledigt mit E-60 · 2026-09-23

- [x] **Stufen-Drift der Specs:** Hauptursache waren Wumms und Bastelgrips ohne Stufenkurs; seit `powerRate` bleibt das Spec-Mittel über die Stufen stabil (Rest siehe unten).
- [x] **Pfade innerhalb einer Spec** (Abstand zum Mittel der Spec): Zündmeister Pfad 2 +20 → +2 % (Kettenreaktion-Fehler), Pfandjäger Pfad 0 +10 → +5 % (Alles auf Rot 30/30 → 10/15 %), Kneipenschläger Pfad 1 +23 → +15 % (Blitzabriss 8 → 2 %); Rest siehe unten.
- [x] **Sheet misst Kill- und Ausweich-Talente:** Gegner sterben und werden ersetzt, Zufall mit Startwerten, Talentfähigkeiten in der Rotation.
- [x] **Spec-Faktoren eingepflegt:** `SPEC_MECHANICS[spec].output` (`content/mechanics.js`), `TUNING.specs` gestrichen.
- [x] **⚡ Feldgegner zu schnell:** Ursache waren Finisher in Größe eines Feldgegners plus Ausrüstungsbonus ohne Stufenkurs. Von 15 Hinweisen bleiben 2.
- [x] `scripts/class-pacing.mjs` nutzt die gemeinsame Rotation (und läuft wieder).

## Balancing-Runde 2 (E-60) · offen · 2026-09-23

- [ ] **Pfade mit Restabstand** (Sheet, selten, Stufe 10–30, Abstand zum Mittel der Spec): Filter-Furie Pfad 1 +14 %, Pfad 2 −15 % (Treiber „Noch ein Take“ – `encoreUpgrade` ist ein Schalter mit fest verdrahteten 35 Randale in `class-mechanics.js`; erst als Zahl ins Talent holen, dann senken); Kneipenschläger Pfad 1 +15 %, Pfad 0 −14 % (Überlebenspfad – der Übungskampf bewertet Überleben nicht).
- [ ] **Heilpfade:** Zapfmeister Pfad 1 heilt 1,58× den Heil-Median (Pfade 0/2: 0,83/0,73), Landhaus-Lazarett Pfad 0 0,78. Die Heilkennzahl zählt Überheilung mit, bei nur 3 % Grundleben Schaden je Sekunde – vor weiteren Eingriffen eine Messung mit Gruppenschaden (E-42) bauen.
- [ ] **Boss gegen Feld je Spec:** Kneipenschläger Boss 1,35 / Feld 0,84, Pfandjäger 1,26 / 0,96, Zündmeister 0,76 / 1,33. Gewollte Identität, solange das Mittel stimmt; nach Playtest bestätigen.
- [ ] **Umland für Kevin knapp unter 4 s** (Median 3,8 s, 28 von 35 Zeilen): Markierung und Rakete legen einen Feldgegner fast immer in derselben Zeit. Hebel: Raketen-Multiplikator 1,8 (höher als 1,6 bei Dieter und Bärbel).
- [ ] **Stufe 1:** Dieter legt den Pfanddachs in 3,7 s (Korridor ≥ 4 s). Erster Treffer ist deutlich stärker als die folgenden; prüfen, woher.
- [ ] **Sheet-Boss mit 10× Feldleben** stirbt ab Stufe 30 an wenigen Abrissen (Überschuss verpufft); für Einzelziel-Talente auf hohen Stufen den Boss-Faktor anheben oder mit echten Bossen messen.
