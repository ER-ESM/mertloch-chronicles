# Optimierung Runde 5, Teil A „Spielfluss“ · 24.09.2026

Eingang: Kenner-Endurteil R5 (`docs/PLAYTEST-2026-09-24-r5-kenner.md`, unverändert übernommen) und Grafik-Endabnahme R5 (nur Punkt 10, neutrale Tiere; Teil B übernimmt den Bericht).
Urteil des Kenners: „Fühlt sich wie ein MMO an“. Es fehlt der Fluss von Gegner zu Gegner. Der schwerste Bruch war der Tod über „Hinlaufen“.
Vorbild ist WoW: Symbole und Tooltips statt Fließtext, nirgends scrollen.
Entscheidung des Orchestrators: Neutrale Tiere zeigen ihr Namensschild nur unter der Maus, als Ziel oder nach dem ersten Treffer.
Teil B (Handy, Aufträge-Leerfläche, Tastenbelegung, Kartenseitenleiste, `hero-frame.js`/`hero-reveal.js`, Tooltip-Anker der Kniff-Leiste, Hilfe, Kampfstatistik) ist hier nicht angefasst.

- **Prüfskript:** `node scripts/optimierung-r5a-check.mjs` mit 23 Prüfungen, echter Maus und Tastatur (CDP 9550, Server 4350; `CDP_PORT`/`SERVER_PORT`, `ONLY=1,…`). Bilder liegen in `visual-review/optimierung-r5a/` (lokal).
- **Unit-Tests:** `tests/optimierung-r5a.test.mjs` (10 Tests).
- **Live:** Build #543 (d8b2e82), Nachtrag Handy-Tod und Bericht Build #544 (7c67124).

## Neue Bausteine

| Datei | Aufgabe |
|---|---|
| `death-screen.js` | Todesbildschirm als eigene Ebene über allen Fenstern. Enthält Titel, Ursache als Symbol, Tipps als Tasten mit Tooltip und den Knopf „Aufwachen bei St. Gangolf“. Esc und F schließen ihn nicht. Die Welt wird grau. |
| `unit-tooltip.js` | Gegner-Tooltip wie WoWs GameTooltip, fest unten rechts über der Menüleiste. Er zeigt Name, Stufe, Elite/Neutral und die Auftragszeilen samt Dropchance. |
| `spell-queue.js` | Zauber-Puffer: Wer in den letzten 0,4 s von GCD, eigener Abklingzeit oder Zauber drückt, wird vorgemerkt. Der Kniff löst danach aus. |
| `dodge-out.js` | Ausweichen ohne Richtungstaste springt aus der roten Marke heraus und nimmt dabei einen freien Weg um Hindernisse. |
| `quest-mobs.js` `questLines` | Auftragszeilen je Gegner: Kapitelziel, Nebenauftrag und Treffpunkt-Auftrag, jeweils mit Stand. Gleiche Art außerhalb des Zielgebiets erscheint blass. |
| `spielfluss-r5a.css` | Aussehen der neuen Teile, zuletzt geladen. |

## Punkte

| Nr | Stand | Was und Ursache | Beleg |
|---|---|---|---|
| 1 | erledigt | **„Hinlaufen“ stoppt bei Aggro, auf allen Wegen.** Nachgestellt wurde der Kenner-Weg: Stufe 4, C+J+I+P offen, Karte, ⇧+Klick auf „Verfolgtes Ziel“. Alle Laufwege laufen schon über `game.navigate`: Karte (Stecknadel, Tooltip, Seitenleisten-Stiefel, am Handy der Tooltip-Knopf „Hinlaufen“, alle über `walk()` in `atlas-ui.js`), Minikarte, Auftragskasten, Kontextmenüs und Rechtsklick auf den Boden. Der Autopilot-Stopp aus 3a griff in jeder Nachstellung, beim Aggro wie beim ersten Treffer. Einen Umweg um den Stopp gibt es im Code nicht. **Ursache des Todes** war das Danach: Die Figur blieb stehen, und nichts auf dem Bildschirm sagte das. Der Kenner sah hinter vier Fenstern keinen Stopp, ließ sich zusammenfalten und bekam dann keinen Todesbildschirm (Punkt 2). Jetzt erscheint beim Stopp die rote Zeile „Angegriffen – Laufweg angehalten.“. Die Fenster über dem Helden klappen weg (vorhandene Mechanik); dazu kommen der rote Rand (3a) und der Angreifer als Ziel. | Prüfung 1 a–e: Karte ⇧+Klick, Stiefel, Minikarte ⇧+Klick, Auftragskasten, Rechtsklick; danach kein offenes Fenster über dem Helden. `r5a-10-karte-stopp-fenster.jpg` |
| 2 | erledigt | **Tod unübersehbar.** Einen Todesdialog gab es, aber als gewöhnliches Fenster (`popups 'death'`). Schließen hieß Aufwachen (`popups.onClose`). Esc („schließt alle Fenster“), F/Interagieren und `closeAll` schlossen ihn. Wer mit offenen Fenstern starb und Esc drückte, sah nur die Statuszeile „Du wachst schon wieder bei St. Gangolf auf“. Genau das hat der Kenner beschrieben. Jetzt gibt es einen eigenen **Todesbildschirm** oben mittig über allen Fenstern. Er zeigt einen Schädel, „Du bist umgekippt“ und die Ursache als Symbol: Gegnername mit Fähigkeit (z. B. „Sprung“), rote Fläche und „+n weitere Angreifer“, Erklärung jeweils im Tooltip. Tipps stehen als Tastenkappen mit Tooltip da (Unterbrechen, Ausweichen, Parieren, Brezel), nur wenn verfügbar. Der Knopf heißt „Aufwachen bei St. Gangolf“. Die Welt wird grau, der Zonentitel tritt zurück. Esc und F schließen ihn nicht. | Prüfung 2: Tod mit C+J+I+P, Esc/F/Esc, Aufwachen, Tod durch Fläche. `r5a-20-todesbildschirm.jpg`, `r5a-20z-…`, `r5a-21z-tod-flaeche.jpg` |
| 3 | erledigt | **Auftragszählung sichtbar.** Der Pfandkeiler mit „!“ zählte nicht, weil zwei Regeln zusammenkamen: Er stand **außerhalb des Zielgebiets** (Gebietsregel aus 3a), also zählte er nicht für „…von den Trümmern jagen“. Das „!“ trug er zu Recht für „Absperrband 0/6“, denn dieser Treffpunkt-Auftrag zählt überall. Dort **fiel der 50-%-Wurf** aber aus. Jetzt zeigt der **Gegner-Tooltip** (unten rechts, WoW) jede Auftragszeile mit Stand, etwa „Pfandkeiler von den Trümmern jagen 0/3“. Sammelziele tragen den Würfel „Meter Absperrband ~50 %“. Ein Gegner gleicher Art außerhalb des Zielgebiets steht blass da mit „Zählt hier nicht – erst im Zielgebiet“. Das „!“ am Schild bleibt nur an Gegnern, die jetzt zählen würden. Das galt schon mit der 3a-Regel und ist hier mitgeprüft. Der Tooltip des „!“ im Zielrahmen nennt dieselben Zeilen. | Prüfung 3 innen und außen. `r5a-30-gegner-tooltip.jpg`, `r5a-30z-…` |
| 4 | erledigt | **Fluss nach dem Kill.** (a) Nach dem Kill wird ein Angreifer in Kampfnähe Ziel (Regel aus 2b/3a, geprüft). (b) **Taste 2 ohne Ziel** wählte bisher per Tab selbst ein Ziel und meldete sonst „Kein passendes Ziel in direkter Nähe“. Jetzt gibt es kein Auto-Ziel mehr, sondern die rote Zeile „Kein Ziel.“; wer dich angreift, wird weiter Ziel. (c) **Tab + Kniff außer Reichweite** meldete „Zu weit entfernt · 23 m“, weil Tab ohne Feind in Reichweite ein **neutrales Tier** wählt. Das Hinlaufen aus 3a galt nur für Feinde (`hostile(e)`). Jetzt läuft der Held auch zu Tieren hin: Wer Tab und dann einen Kniff drückt, will genau dieses Ziel. (d) **Rechtsklick auf laufende Gegner**: Der Renderer merkt sich die gezeichneten Lagen der letzten 400 ms (`e.seenAt`). Der Treffertest zählt diese Lagen und einen Vorhalt von 150 ms in Laufrichtung (`trailHit`). Im gedrosselten Fenster (≈ 4 Bilder/s) lag der Klick bisher bis zu 13 E hinter dem Gegner. | Prüfung 4: „Kein Ziel“ rot, Angreifer wird Ziel, Tab auf ein Tier in 25 m + Taste 2 läuft hin, Klick auf die Lage von vor ≈ 200 ms trifft |
| 5 | erledigt | **Zauber-Puffer.** Innerhalb der GCD gedrückte Kniffe verschluckte `action()` bisher stumm (`return false`). Jetzt wird ein Kniff, der in den letzten 0,4 s der GCD, einer eigenen Abklingzeit oder eines Zaubers gedrückt wird, vorgemerkt. Der Knopf leuchtet dann, und der Kniff löst direkt danach aus. Es gibt einen Platz, der letzte Druck gewinnt, nach 1,2 s verfällt die Vormerkung. Früher gedrückt gibt es die rote Zeile „Noch nicht bereit.“. Bodenkniffe dürfen schon während der GCD zielen. | Prüfung 5, Unit-Tests |
| 6 | erledigt | **Ausweichen verständlich.** Die Bodenmarke lag schon fest am Aufschlagort (`startCast` merkt x/y). Das ist geprüft, sie wandert nicht mit. **Ursache des Befunds:** Ohne Richtungstaste sprang Ausweichen „vom Ziel weg“. Stand das Ziel ungünstig oder eine Wand im Weg, landete der Held wieder in der Marke. „Sprung · ausweichen“ ist die Fähigkeit des Keilers, keine Marke am Helden. Jetzt springt Ausweichen aus einer roten Marke **heraus** (weg von der Mitte, in der Mitte weg vom Zaubernden) und probiert andere Richtungen, wenn Hindernisse im Weg sind. Als Rückmeldung erscheint „AUSGEWICHEN!“ oder „GETROFFEN“. | Prüfung 6: Marke unverändert, 64 E heraus. `r5a-60/61-marke-….jpg` |
| 7 | erledigt | **Wegmarke überdeckt keine Plaketten.** Der Pfeil probiert die Kreisbahn mit 36, 54 und 72 E und nimmt die erste, auf der Pfeil und Entfernung kein Gegner-Namensschild berühren. Ist keine frei, wird er blass (30 %). `world-labels.js` `waypointPlace`. | Prüfung 7: Schild auf der engen Bahn, Pfeil auf 72 E. `r5a-70z-pfeil-plakette.jpg` |
| 8 | erledigt | **Abgabe feiern.** „Auftrag abgeschlossen“ erscheint groß mittig wie der Aufstieg (Meilenstein-Warteschlange, Art `quest`), mit Auftragsname, Belohnungskacheln (EP, Pfandmarken, Gegenstand) und kurzem Klang `questDone`. Das gilt für Treffpunkt-Aufträge, Nebenaufträge und Kapitel. | Prüfung 8. `r5a-80-auftrag-abgeschlossen.jpg` |
| 9 | erledigt | **Figur blass/farblos.** Ursache: Der „Umriss“ hinter Verdeckungen war in Wahrheit die ganze Silhouette, hell gefüllt (#f3e2b0), mit 68 % über dem Helden. Das galt unter Fenstern, Dach und Baumkrone. Bei jedem Wechsel von `heroCovered` wurde der Held farblos und dann wieder normal. Beim Trefferschutz (Ausweichen, Aufwachen) war er zusätzlich zu 55 % durchsichtig. Jetzt zeigt der Renderer nur den **Umriss**: Die Silhouette wird in acht Richtungen versetzt, die Figur selbst ausgestanzt. Der Trefferschutz macht den Helden nicht mehr durchsichtig. **Hinter Baumkronen** gilt Umriss statt Durchsichtigkeit: Die Krone bleibt deckend, wenn nur der Held darunter steht, und wird nur für ein Gegner-Ziel durchsichtig. | Prüfung 9. `r5a-90z-held-hinter-baum.jpg` |
| 10 | erledigt | **Neutrale Tiere:** Namensschild und Balken nur unter der Maus (auch außerhalb der 160 E), als Ziel oder nach dem ersten Treffer (Leben < voll bzw. im Kampf). Feindliche Schilder bleiben. | Prüfung 10. `r5a-100-tier-ohne-schild.jpg` |
| 11a | erledigt | **Heldenauswahl:** Der Fokus liegt auf „Ins Dorf“. `querySelector('[data-start=enter],[data-start=create]')` nahm bisher das erste in Dokumentreihenfolge, also „+ Neuer Held“. | Prüfung 11 |
| 11b | erledigt | **Nyalol** begrüßt ab Stufe 3 ohne „Stufe 1, kein Gear“ (`HUB_TALK.nyalol.greetLater`, `hubLine(…, level)`). Idas Einführungsauftrag für einen Stufe-4-Helden ist Kapitel 1 und bleibt. | Unit-Test |
| 11c | teilweise | **„KUMPEL KOMMT“ und „IM THÜRIG“ überlappen:** Der Zonentitel wartet jetzt, solange ein Weltruf steht (`texts[].shout`, ≤ 1,25 s). Umgekehrt dimmt der stehende Titel den Ruf (Titelband aus 4b). Die Szene des Kenners ließ sich nicht exakt nachstellen. Nur im Code geprüft. | – |
| 11d | geprüft, gewollt | **Zielrahmen bleibt auf Hotfix-Olli nach dem Weglaufen:** So ist es in WoW und nach E-65: Ein freundliches Ziel bleibt, bis man es abwählt (Esc, Klick ins Leere, anderes Ziel). Unverändert. | – |
| 11e | erledigt | **„!“ über NPCs** sitzt 3–4 E tiefer, jetzt direkt über Kopf bzw. Namen; Idas Zeichen war schon kopfnah. Die **Trefferfläche** ist Figur plus Zeichen (Rechteck Füße bis über das „!“, vorn gewinnt, Dorfbewohner treten zurück). | Prüfung 11: Rechtsklick knapp unter dem „!“ trifft den Auftraggeber. `r5a-110z-auftraggeber-zeichen.jpg` |

## Überschneidungen

- **Runde 3a:** `autopilot.js` hat jetzt die rote Zeile beim Stopp. `engine.action` hat kein Auto-Ziel mehr bei Taste 2, und das Hinlaufen gilt auch für neutrale Tiere. `optimierung-r3a-check` klickt jetzt den Knopf des Todesbildschirms statt `#respawn`.
- **Runde 4b:** `optimierung-r4b-check` Teil 5 stapelt fünf Pfanddachse. Die haben jetzt ein Leben unter voll, weil neutrale Tiere bei vollem Leben kein Schild mehr zeigen (Punkt 10).
- **`mobile-check`:** Tod und Aufstehen prüfen jetzt `#deathScreen` statt `.popup-death`/`#respawn`. Der Schritt „arena-raeumen“ weckt einen im Übungskampf umgekippten Helden. Vorher geschah das nebenbei über das Schließen aller Fenster, weil das Tod-Fenster eines davon war. Am Handy schließt der Tod alle Fenster (dort ist immer nur eins offen; das alte Tod-Fenster ersetzte es ebenso).
- **`renderer.js`** gehörte in dieser Runde Teil A. Geändert haben sich Umriss, Baumkrone, Tier-Schilder, Wegmarke, NPC-Zeichen und die Lagen-Spur.
- **`app.js`** hat nur kleine Stellen: Todes- und Abgabe-Ereignis, Einbindung von Todesbildschirm und Gegner-Tooltip, Klang `questDone`, Knopf-Leuchten für den Puffer, Wartebedingung des Zonentitels.
- Nicht angefasst: `hero-frame.js`, `hero-reveal.js`, Kartenseitenleiste, Tooltip-Anker der Kniff-Leiste, Hilfe, Handy-HUD, `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`.

## Prüfungen

Eigene Ports 9550–9559 / 4350–4359, `BOOT_TRIES=300…400`.

- **Grün:**
  - `npm test` (929)
  - `npm run content:check`
  - `npm run build`
  - `optimierung-r5a-check` (23)
  - `optimierung-r4b-check` (20)
  - `optimierung-r4a-check` (9)
  - `optimierung-r3a-check` (19)
  - `optimierung-r2b-check` (25)
  - `aktionsleisten-check`
  - `mobile-check` (Kopie mit eigenem Server 4358, .jpg): 1–2 von 98 Schritten mit Befund, nur „unterbrechung (M-15)“, das auf main auf demselben Rechner ebenso wechselt (main: 2 Befunde, beide „unterbrechung“). Ein Zwischenlauf hatte einmal „klein · gespraech“; zwei Wiederholungen von „klein“ waren ohne diesen Befund.
- **Rot, schon auf main:** `optimierung-r1-check` scheitert an „Legende: Häkchen klein null“ (`optimierung-r1-check.mjs:124`). Auf main f81cda6 (eigene Arbeitskopie `MertlochChronicles-r5a-main`) ist es dieselbe Stelle. Die Kartenlegende gibt es seit Runde 4a nicht mehr, das Skript prüft sie noch. Das gehört zur Karte (Teil B); hier nicht geändert.
- **Nicht gelaufen:** `hud:check` (laut 3b/4b auf main rot) und `akt1b-check` (braucht ein von Hand gestartetes Chrome).

## Rest

1. Den Handy-Knopf „Hinlaufen“ im Karten-Tooltip prüft kein Browserlauf. Er ruft dieselbe Funktion `walk()` wie der Stiefel (geprüft).
2. 11c (Weltruf gegen Zonentitel) ist nur im Code umgesetzt, die Szene nicht nachgestellt.
3. Der Gegner-Tooltip gilt nur für Gegner. NPCs und Mitspieler zeigen weiter ihren Rahmen und den Mauszeiger.
4. Den Todesbildschirm am Handy prüft `mobile-check` (Tod, Drehen, ein Tipp zurück); angesehen habe ich ihn nicht.
5. `optimierung-r1-check` passt nicht mehr zur Weltkarte aus 4a (Legende); das Skript sollte Teil B nachziehen.

## Nachtrag 2026-09-25: Rechtsklick auf laufende Gegner (Punkt 4d)

- **Befund:** `optimierung-r5a-check` Teil 4 war rot („Rechtsklick auf die eben gezeichnete Lage trifft den laufenden Gegner“). Das lag nicht an Dungeon-Etappe 2: `382ac5d` scheiterte mit demselben Skript auf demselben Rechner (3 von 3 Läufen rot).
- **Ursache im Spiel:** Die Spur der gezeichneten Lagen (`renderer.js`, seit `d8b2e820`) hielt höchstens **8 Lagen**. Bei 60 Bildern pro Sekunde sind das nur ≈ 130 ms statt der versprochenen 400 ms. Außerdem galt eine Lage ab dem ersten Bild dort: Ein Dachs, der schon länger stand, konnte seine Standlage beim Loslaufen sofort verlieren. Der Klick traf nur bei 20–30 Bildern pro Sekunde, also früher unter Rechnerlast.
- **Lösung:** `noteDrawn()` in `target-ui.js` führt die Spur jetzt nach Zeit (400 ms, höchstens alle 25 ms eine neue Lage, also höchstens 17). Eine Lage gilt bis zum letzten Bild, in dem der Gegner dort stand. Der Renderer ruft nur noch diese Funktion auf.
- **Prüfung:** Das Skript prüft jetzt zwei Fälle: die Lage kurz vor dem Loslaufen und die Lage mitten im Lauf. Es misst den Abstand zwischen gemerkter Lage und Klick sowie die Bildrate. Ein Anlauf, bei dem der Rechner hing, wird wiederholt. Der Unit-Test (`tests/optimierung-r5a.test.mjs`) spielt beide Fälle bei 4, 60 und 144 Bildern pro Sekunde durch. Mit der alten Spur scheitert er bei 60 und 144 Bildern pro Sekunde, im Fall „vor dem Loslaufen“ auch bei 4.
