# Heiler wie in WoW · Kniff-Tooltips · Ressourcenleiste · 2026-09-26

Auftrag: Heilerspiel nach WoW-Vorbild (Befund Prüfer-Playtest 4 an Big B, Build #741: „nur die Löffelkur heilt ein Ziel, 7,2 s
Abklingzeit, die Söldner-Heilerin trägt den Kampf“), dazu drei ältere E-72-Befunde, Kniff-Tooltips ohne Textwand und die
Ressourcenleiste an der Aktionsleiste. Nutzerentscheidung vom 26.09. (E-71 Nachtrag, Nr. 7): „Das Heiler-Kit aller Heiler-Specs folgt WoW“.

## Kurzfassung

- **Jede Heiler-Spezialisierung hat jetzt alle fünf WoW-Bausteine**, und alle wirken auf Verbündete: Dauer-Heilzauber ohne
  Abklingzeit, großer langsamer Heilzauber, Heilung über Zeit bzw. Schild auf ein Ziel, Gruppenheilung, Notfallknopf (45 s, ohne
  globale Abklingzeit). Die Ressourcenmodelle aus E-72 bleiben: Anni zahlt Likes und lebt vom Trend, Schorsch heilt mit Grillgut
  (Glut gart), Käthe mit Karten und Augen. Alles liegt auf Taste 1–9.
- **Zielwahl wie WoW:** gewählter Verbündeter → er; Gegner oder nichts gewählt → du (E-65 bleibt); **Maus über einem
  Truppenrahmen → dieser Verbündete**, ohne dass sich die Auswahl ändert (Mouseover-Heilung). Klick auf den Rahmen + Taste geht
  flüssig (echte Maus/Tasten geprüft).
- **Hilfe ist ein normaler Buff auf dem Ziel:** Heilung über Zeit (`aidHot`), Schild (`aidBuff`), Notfall (`aidSave`) – die
  Truppenrahmen aus Dungeon-Fix 6 zeigen sie; beim Helden stehen sie in der Buffleiste.
- **Zwei alte Fehler behoben:** Giselas Nest heilte **nie** (die allgemeine Feldschleife setzte seine Uhr zurück, bevor der
  Nest-Zweig sie sah) – jetzt heilt es alle im Kreis. Käthes Pik-Karte schützte nur dich, obwohl E-72 „dich oder den gewählten Freund“
  vorsah.
- **Balance:** Ohne Söldner-Heiler schafft der aktive Heiler-Held jeden Hauptboss (48/48), passiv verliert er (0/48); in der
  Standardgruppe trägt er im Median 86 % der Heilung. Alle Dungeon-Kriterien grün, auch die neuen aus Fix 6.
- **Kniff-Tooltips** nach WoW-Muster für alle Klassen: längster Tooltip 7 statt 25 Zeilen; Details mit Umschalttaste.
- **Ressourcenleiste** („Vorrat“, „Deckelstriche“ …) dockt direkt auf der Aktionsleiste an, mittig, F-Hinweis darüber.
- **Teil 1:** Hilfe scrollt bei 1280 × 720 nicht mehr; zwei Prüfungen an das gewollte Verhalten angepasst (Spiel war richtig).

## Heiler-Spezialisierungen × Bausteine

Heiler-Specs laut Rolle „Heilung“: `baerbel-care` (Landhaus-Lazarett), `schorsch-chef` (Grillhütten-Chef), `kaethe-herz`
(Kartenlegerin). Geprüft, ob es weitere gibt: `dieter-brew` (Zapfmeister, „Schutz & Heilung“) und `baerbel-feedback` (Putzpyramide,
„Schadensheilung“) sind Tank- bzw. Schadens-Hybride mit Selbstheilung (Weizenfass, Lebensraub nur an dir); die Simulation führt sie
nicht als Heiler. Sie bleiben unverändert (siehe Restliste: Fass-Uhr).

✓ = vorhanden und wirkt auf Verbündete · ~ = teilweise · ✗ = fehlt

| Spec | Baustein | vorher | nachher (Taste) |
|---|---|---|---|
| Anni · Landhaus-Lazarett | Dauer-Heilzauber | ✗ Löffelkur 1,25 s, 8 s Abklingzeit | ✓ **Feuchttuch** (4, Wurf): 1,5 s, keine Abklingzeit, 10 Likes, ≈ 163 |
| | großer Heilzauber | ✗ | ✓ **Landhaus-Löffelkur** (9): 2,5 s, 6 s Abklingzeit, kostenlos, ≈ 435 |
| | HoT/Schild | ~ Aperol-Nachsorge (28 s Abklingzeit, Text „heilt dich“) | ✓ **Aperol-Nachsorge** (3): 12 s HoT, 6 s Abklingzeit, 12 Likes, ≈ 27/s |
| | Gruppenheilung | ✗ Nest heilte niemanden (Fehler) | ✓ **Nest** (8): 12 s, ≈ 24/s für alle im Kreis |
| | Notfallknopf | ✗ | ✓ **Riechsalz** (6, Markierung): 45 s, ohne GCD, 30 % Grundleben + 6 s −40 % Schaden |
| Schorsch · Grillhütten-Chef | Dauer-Heilzauber | ~ Servieren nur mit garer Wurst | ✓ **Servieren** (4): garste Wurst ≈ 181 + Nachheilung, ohne Wurst Brötchen ≈ 95 |
| | großer Heilzauber | ✗ | ✓ **Grillplatte** (5, Wurf): 2,5 s, 6 s Abklingzeit, ganzer Rost, ≈ 238 + 171 je Stück |
| | HoT/Schild | ~ Nachheilung der garen Wurst nur an dir | ✓ jede Wurst heilt 6 s am **Ziel** nach (Buff „Nachheilung“) |
| | Gruppenheilung | ✓ Grillbuffet | ✓ **Grillbuffet** (8) unverändert |
| | Notfallknopf | ✗ Ablöschen 14 s, heilt nur dich | ✓ **Löschbier** (6, Ablöschen): 45 s, ohne GCD, 30 % Grundleben + 6 s −40 %; kühlt weiter die Glut |
| Käthe · Kartenlegerin | Dauer-Heilzauber | ~ nur Herz-Karten (Zufall) | ✓ **jede Karte** (2–4) stützt den Verbündeten: Herz heilt, Pik schützt, Kreuz heilt nach, Karo heilt alle um ihn |
| | großer Heilzauber | ✗ (Abrechnen = Schaden) | ✓ **Lebensbilanz** (5, Abrechnen): 2 s, heilt je Auge (≈ 6), Schneider ×1,5, Schwarz ×2 + Gruppe |
| | HoT/Schild | ~ Pik schützte nur dich | ✓ Kreuz = HoT „Kreuz-Segen“, Pik = Schild **am Ziel** |
| | Gruppenheilung | ✓ Legekreis | ✓ **Legekreis** (7) unverändert, dazu Karo |
| | Notfallknopf | ~ Eierlikörchen 20 s, 200 | ✓ **Eierlikörchen** (8): 45 s, ohne GCD, 30 % Grundleben + 6 s −40 % |

Zahlen: Stufe 10, typische Ausrüstung, gemessen im Browser (`scripts/heiler-wow-check.mjs`) bzw. im Tooltip.

Ressourcenmodelle (E-72) bleiben:
- **Anni:** Heilungen kosten Likes (Löffelkur bleibt kostenlos wie die Heiltaste), jede Heilung zählt als Kniff für den Trend. Wer
  Feuchttuch hämmert, senkt den Trend und läuft leer; wer Tuch, Nachsorge, Löffelkur und Piekser abwechselt, hält ihn oben.
  Feuchttuch und Löffelkur füllen Vorratsgläser (Großreinemachen).
- **Schorsch:** Grillgut ist die Heilressource: Servieren nimmt eine Wurst, die Grillplatte den ganzen Rost; die Glut bestimmt, wie
  schnell nachgegart wird. Das Löschbier kühlt die Glut wie Ablöschen.
- **Käthe:** jede Karte gibt weiter Augen, auch als Stütze; die Lebensbilanz verbraucht sie (ab 61 Augen).

Umgewidmet wurden nur Plätze, die die Spezialisierung ohnehin umdeutet (E-32: Markierung, Wurf, Spezialkniff, Boden). Kniff-IDs
bleiben Speicherschlüssel. Nicht-Heiler-Specs sind unverändert (Test „Nicht-Heiler bleiben unverändert“).

Code: `content/healer-kits.js` (Daten, Texte), `healer-kit.js` (Umdeutung, Ziel, Hilfe als Buff, Annis Heilungen, Notfall),
`class-resources.js` (Chef-Servieren, Grillplatte, Kartenstütze, Lebensbilanz), `companions.js` (`aidSave` senkt Schaden),
`spec-mechanics.js` (Nest), `engine.js` (Ziel je Druck, Heiler-Kit vor dem Ressourcenmodell).

## Zielwahl-Muster

1. **Verbündeter gewählt** (Klick auf den Truppenrahmen) → alle Heil-, Schutz- und Buff-Kniffe gehen auf ihn.
2. **Gegner oder nichts gewählt** → sie gehen auf **dich** (WoW-Selbstzauber; so stand es schon in E-65). Verworfen: „der zuletzt
   gewählte Verbündete“ – unsichtbarer Zustand, der Heilung an jemanden schickt, den man nicht sieht.
3. **Mouseover:** Steht die Maus auf einem Truppenrahmen, geht die Hilfe an diesen Verbündeten, die Auswahl bleibt (Gegner bleibt
   Ziel). So heilt ein Heiler, ohne das Gegnerziel zu verlieren.
4. Zauber mit Wirkzeit behalten ihr Ziel bis zum Ende; außer Reichweite/Sicht meldet der Kniff es vorher und kostet nichts.

Flüssigkeit geprüft: Rahmen anklicken, sofort Taste drücken – der Fokus liegt auf dem Rahmen-Knopf, die Zifferntaste wirkt trotzdem
(heiler-wow-check, alle drei Specs).

## Kniff-Tooltips nach WoW-Muster

Ein Baustein für alle Klassen (`combat-ui.js skillTooltip`, Texte `content/panel-ui.js SKILL_TIP`):
Name + Taste · **eine Kopfzeile** Kosten · Zauberzeit · Abklingzeit · Reichweite · **1–2 Sätze Wirkung** · **eine Zahlenzeile**
(Schaden, Heilung, Heilung je s, Schild; beim Heiler-Kit live mit Bastelgrips und Trend) · **höchstens eine Zeile** Wechselwirkung
(Glut/Rost/Pfandautomat, Trend-Wiederholung) · Zustand nur, wenn er zählt (Waffe fehlt, nicht gelernt, nicht auf der Leiste).
Alles Weitere – ausführliche Regel, Einsatz, Warum, Formel, Waffenbasis, Herkunft, Kategorien – mit gedrückter Umschalttaste,
am Handy hinter „Details“. Der Glossar-Anhang entfällt im Kniff-Tooltip (Begriffe bleiben verlinkt). Breite 340 px.

**Vorher** (Landhaus-Löffelkur, 25 Zeilen, 561 px):
> Landhaus-Löffelkur · Erlernt auf Stufe 2 · 9 · KNIFF · HEILUNG · HAUSPFLEGE · Kostenlos · 1,3 s Zauberzeit · 7,2 s Abklingzeit ·
> Heilt dein gewähltes freundliches Ziel (Söldner oder Online-Mitspieler); ist ein Gegner oder nichts gewählt, heilt sie dich. Jede
> Heilung füllt ein Vorratsglas … (Absatz Vorrat, Absatz Großreinemachen, Warum, Einsatz, vier Glossar-Einträge)

**Nachher** (7 Zeilen, 203 px; mit Umschalttaste 358 px):
> **Landhaus-Löffelkur** · Taste 9
> kostenlos · 2,5 s Zauberzeit · im Laufen · 5,4 s Abklingzeit · 53 m
> Große Heilung für dein Ziel, sonst für dich. Füllt ein Vorratsglas.
> **Heilt 435**
> ⇧ Details

| Klasse (5 × 8–9 Kniffe) | längster Tooltip vorher | nachher | mit Umschalttaste |
|---|---|---|---|
| Anni (Heilung) | Löffelkur 25 Z. / Großreinemachen 24 Z. | 7 Z., 203 px | 358 px |
| Schorsch (Chef) | Grillzange 16 Z. | 7 Z., 206 px | 471 px |
| Käthe (Herz) | Lebensbilanz/Legekreis 11–12 Z. | 6 Z., 185 px | 310 px |
| Dieter (Kneipenschläger) | Abriss 17 Z. | 7 Z., 213 px | 367 px |
| Kevin (Pfandjäger) | Restmüll-Rakete 18 Z. | 6 Z., 188 px | 483 px |

## Leistenplatz der Ressourcenleiste

Die Klassenanzeige (`#classMechanicArt`: Vorrat, Deckelstriche, Pegel, Fässer …) saß im Hinweisfeld über den (unsichtbaren)
Zusatzleisten, 53 px über der Leiste mitten im Spielfeld (x 893–1105, y 668–718). Jetzt (`class-hud.js dockClassHud`):
- dockt sie wie eine WoW-Haltungsleiste **direkt auf der Aktionsleiste** an (Lücke 0 px), **mittig über der Hauptleiste**, für alle
  Klassen gleich; gemessen 737–793 px bei 2024 × 900, Hauptleiste ab 793 px;
- liegen belegte Plätze einer Zusatzleiste unter ihr, rückt sie über diese; beim Belegen (Kniffe-Buch offen) über alle Plätze;
- rückt der **F-Hinweis über die Anzeige** (688–725 px), im selben Takt wie Fix 5 – nie überdeckt;
- bleibt am Handy im Heldenrahmen (unverändert).

## Balance

**Simulation** (`node scripts/dungeon-sim.mjs`, voll): alle Kriterien grün, darunter die neuen aus Fix 6 und die Heiler-Kriterien.

| Fall (je Spec 4 Seeds, Hauptbosse Gerd, Exposé, Korken-Kurt, Big B) | vorher* | nachher |
|---|---|---|
| (H2) ohne Söldner-Heiler, Held heilt aktiv | 44/48 (Anni an Korken-Kurt 0/4) | **48/48**, Big B 218–255 s (Wut 290 s) |
| (H2) Big B S3 (Rita liegt, 3 Beweise, Wut 3:35) | – | **12/12**, 173–189 s |
| (H3) ohne Söldner-Heiler, Held passiv | 0/48 | **0/48** – der Heiler wird gebraucht |
| (H1) Standardgruppe, Heilanteil des Helden (Median) | 69 % | **86 %** (Anni 78 %, Schorsch 86 %, Käthe 88 %) |
| Fix 6: Big B aktiv mit Testzugang-Gruppe, Heiler-Held | – | S0 198–213 s (Wut 290), S3 155–167 s (Wut 215) – ≥ 40 s vor der Wut |
| Fix 6: Held passiv, jede Rolle | – | 2 % (Heiler 0 %) |
| (b) Held Heiler fällt bei 50 % | – | 15 % (≤ 25 %) |

*vorher = alter Kit mit derselben Heiler-Auswahl in der Simulation (Stand 60680d56).

Die Simulation spielt Heiler jetzt mit `healerFirst` (`scripts/balance-rotation.mjs`): Notfall unter 30 % · Gruppenheilung, wenn drei
(bzw. zwei unter 60 %) Leben verlieren · HoT, wenn das Ziel keinen hat · großer Heilzauber unter 55 % · Dauer-Heilzauber unter 90 %;
sonst Schaden. Ziel ist der Schwächste der Gruppe, auch der Held selbst.

**Balance-Sheet** (`npm run balance:sheet`, Solo gegen Übungspuppen): Schadens- und Tank-Specs unverändert (alle Zellen ±0 %).
Heiler: Der Sheet-Heiler heilt jetzt, sobald Leben fehlt (vorher heilte er auf Abklingzeit, auch bei vollem Leben). Die Kennzahl
„Heilung/s“ zählt Überheilung mit und fällt deshalb bei Anni (−22 %) und Käthe (−24 %), Schorsch −5 %; die tatsächlich geheilte
Menge („eff.“) bleibt gleich oder steigt (Schorsch 12 → 20). ⚑ 220 → 255, alle zusätzlichen in diesen drei Heiler-Zeilen.
`tests/class-resources.test.mjs`, `tests/balance-sheet.test.mjs` grün.

## Teil 1 · ältere E-72-Befunde

1. `e72-hofprobe-check`: „Der Stempel“ erscheint je Browser nur einmal als Karte (E-72 R5, `MEMORY_POPUP_KEY`) – die Prüfung
   erwartete sie bei jedem Helden. Das Spiel handelt richtig. Jetzt: erster Held je Größe mit frischem Browserstand → Karte;
   zweiter Held im selben Browser → still freigeschaltet (gesehen, gemerkt, keine Karte). 67/67.
2. Hilfe bei 1280 × 720 scrollte (314 px Inhalt, 303 px Fenster): Spalten ausgeglichen (9 · 9 · 7 statt 10 · 7 · 8), 720 × 342 ohne Scrollen.
3. `e72-klicks-check` (Chat): Seit Dungeon-Fix 3 nehmen die unsichtbaren Reiter in Ruhe einen Klick an (öffnen den Reiter, WoW-artig).
   Der Messpunkt bei 40 % der Leistenbreite traf den Reiter „Ereignisse“. Die Prüfung misst jetzt die größte Lücke ohne Reiter. 104/104.

Live: Build #755 (0418ab40).

## Prüfungen

| Prüfung | Teil 1 | Teil 2 + 3 |
|---|---|---|
| `npm test` | 1309 grün | 1315 grün (neu `tests/heiler-wow.test.mjs`, 6 Tests) |
| `npm run content:check` | grün | grün |
| `npm run build` | grün | grün |
| `npm run ui:check` | 14 grün | 14 grün |
| `npm run balance:sheet` | – (keine Engine-Änderung) | läuft, Tests grün, ⚑ siehe oben |
| `node scripts/dungeon-sim.mjs` voll | – | alle Kriterien grün |
| `e72-hofprobe-check` | 67/67 | 67/67 |
| `e72-klicks-check` | 104/104 | 104/104 |
| `e72-klassen-smoke` | grün | grün |
| `dungeon-check` · `dungeon-aktiv-check` (paarweise) | grün · 4 grün | grün · 4 grün |
| `mobile-check` (eigener Server) | Schritt „Beute“ rot – **auch auf main ohne diese Änderung** (Restliste) | nur derselbe Schritt „Beute“ rot; Teile hoch, Sitzung, Desktop einzeln nachgeprüft (im Volllauf unter Last einmal „Unterbrechung“ und der Talent-Tooltip wackelig, einzeln grün). Die Desktop-Prüfung der Kelle liest die Formel jetzt aus den Details (textContent) |
| `scripts/heiler-wow-check.mjs` (neu) | – | 35 grün (heilen 24, Tooltip 5, Leiste 5) |

## Restliste

- **Fass- und Sporen-Uhr:** Derselbe Fehler wie beim Nest trifft das Weizen-/Bock-/Pilsfass des Zapfmeisters (`dieter-brew`: Weizen
  heilt nie, Bock trifft nie) und die Sporenwolke der Putzpyramide (markiert nie). Nachgewiesen im Node-Lauf (Weizenfass: 500 → 500 Leben
  in 5 s). Nicht mitgefixt, weil es Tank- und Schadenswerte verschiebt – eigene Runde mit Balance-Sheet und Simulation.
- **Rechtsklick auf einen unsichtbaren Chat-Reiter** läuft nicht (der Reiter nimmt den Klick seit Fix 3 an). Selten; Linksklick ist
  gewollt so.
- **mobile-check, Schritt „Beute“** (hoch und quer): „Aktion-Knopf zeigt ‚Reden‘ statt ‚Beute‘“ – derselbe Befund auf main ohne
  diese Arbeit (Basis 60680d56 gemessen), gehört nicht zu diesem Auftrag.
- **Balance-Sheet-Kennzahl der Heiler** misst Solo-Überheilung; eine Heiler-Messung mit Söldnergruppe wäre aussagekräftiger.
- Online-Mitspieler bekommen Heilung, HoT und Schild über die vorhandenen Netzwege (`aidHeal`, `buffFriend`); Mouseover gibt es nur
  auf Söldnerrahmen, nicht auf Gruppenrahmen anderer Spieler.
- Riechsalz, Löschbier und Eierlikörchen nutzen die vorhandenen Kniff-Bilder ihres Platzes; eigene Symbole folgen mit dem Codex-Lauf.
- Playtest der neuen Heilerkits durch die Prüferin (Bärbel Heilung an Big B, aktiv) steht aus.
