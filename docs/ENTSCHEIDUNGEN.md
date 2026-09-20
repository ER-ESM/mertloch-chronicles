# Entscheidungen — Mertloch Chronicles

Protokoll der Produktion. Jede Festlegung, die Design, Inhalt, Schema, Rollen oder Ablauf betrifft, steht hier mit Nummer, Titel, Datum, Kontext, Entscheidung und Konsequenzen. **Was hier nicht steht, ist nicht entschieden.**

Regeln für dieses Dokument:

- Nummern sind stabil und werden nie neu vergeben. Eine überholte Entscheidung wird nicht gelöscht, sondern bekommt `Stand: abgelöst durch E-nn`.
- Neue Einträge hängen unten an (nächste freie Nummer), damit Verweise aus Backlogs und Commits gültig bleiben.
- Besitzer: Lead-Architect. Andere Rollen tragen Entscheidungsbedarf in `docs/backlog/lead.md` ein.

## Übersicht

| Nr | Titel | Datum | Stand |
|---|---|---|---|
| E-01 | Veröffentlichung über GitHub Pages, Spielstand im Browser | 2026-09-11 | gilt |
| E-02 | Drei Clan-Archetypen, universelle Werte, drei Spezialisierungen | 2026-09-11 | gilt |
| E-03 | Inhaltsschicht `content/` mit Schema und `content:check` | 2026-09-11 | gilt |
| E-04 | IDs sind Speicherschlüssel | 2026-09-11 | gilt |
| E-05 | Kampf- und Ausrüstungsmodell, Handy gleichberechtigt | 2026-09-12 | gilt |
| E-06 | Rollen-Pipeline mit Branch und Worktree je Rolle | 2026-09-12 | erweitert durch E-19 |
| E-07 | Merge nach `main` nur per Fast-Forward | 2026-09-12 | gilt |
| E-08 | Anti-Slop-Guideline mit Scorecard je Bildschirm | 2026-09-13 | gilt |
| E-09 | Heilerin heißt Aperol-Anni | 2026-09-13 | gilt |
| E-10 | Grafikstil: Maifeld-Detailpixel | 2026-09-16 | gilt |
| E-11 | Weltmaßstab über registrierte Türöffnungen | 2026-09-17 | gilt |
| E-12 | Kampffluss nach `GAMEPLAY-KONZEPT-FLUSS.md` | 2026-09-17 | gilt |
| E-13 | Clanbuch: ein Fenster mit Reitern, kein Einklappen | 2026-09-17 | gilt |
| E-14 | Gemeinsame Engine-Bausteine mit TicketTower erst später | 2026-09-17 | gilt |
| E-15 | Mertloch folgt der studio-weiten Pipeline | 2026-09-17 | gilt |
| E-16 | Akt 1 „Filmriss“ ist die Story-Basis | 2026-09-17 | gilt |
| E-17 | Held = Fremder mit geliehenen Klamotten | 2026-09-17 | gilt |
| E-18 | Mitschuld des Clans bleibt | 2026-09-17 | gilt |
| E-19 | Rollenmodell mit Dateibesitz und Tuning-Schicht | 2026-09-17 | gilt |
| E-20 | Ton: derb, dörflich, kein Sie, keine echten Personen | 2026-09-17 | gilt |
| E-21 | Basisbau-Kosten bleiben bis zum Playtest | 2026-09-17 | gilt |
| E-22 | Akt 1 perfektionieren, bevor Akt 2 beginnt | 2026-09-17 | gilt |
| E-23 | Gisela und Pfandautomat bleiben Reserve | 2026-09-17 | gilt |
| E-24 | UI-Stil „Bierdeckel" für die gesamte Oberfläche | 2026-09-17 | gilt, Kanten geändert durch E-28 |
| E-25 | Autoangriff auf Desktop und Touch | 2026-09-17 | gilt |
| E-26 | Erst die technische Basis stabilisieren | 2026-09-17 | gilt |
| E-27 | Clanbuch auf vier Reiter plus Hilfe, Abschnitte mit Sprungleiste | 2026-09-17 | gilt, verfeinert E-13 |
| E-28 | Runde, einfache Linien statt Radius 0 | 2026-09-18 | gilt, ändert E-24 |
| E-29 | Jeder Kniff hat zu jeder Zeit einen Nutzen (frühe Eskalation) | 2026-09-18 | gilt |
| E-30 | Sichtbare Ausrüstung über Pre-Render aus 3D | 2026-09-18 | gilt |
| E-31 | Kampfstatistik für Schaden und Heilung | 2026-09-18 | gilt |
| E-32 | Klassen-Kernmechaniken und Talentpfade | 2026-09-18 | gilt |
| E-33 | Bearbeitbares HUD mit Buff- und Debuffleisten | 2026-09-18 | gilt |
| E-34 | Kalles Kiosk als Dorfladen; Charaktererstellung zurückgestellt | 2026-09-19 | gilt |

---

## E-01 · Veröffentlichung über GitHub Pages, Spielstand im Browser
**Datum:** 2026-09-11 · **Stand:** gilt

**Kontext.** Das Spiel soll ohne Installation und ohne laufende Betriebskosten erreichbar sein.

**Entscheidung.** Auslieferung über GitHub Pages per Actions auf `main`. Spielstand im Browserspeicher. Kein Server, kein Konto, kein Mehrspieler. Verworfen: eigener Server mit Konten.

**Konsequenzen.** Jeder Push nach `main` ist eine Veröffentlichung — der Playtest gehört vor den Merge, nicht danach. Ein geräteübergreifender Spielstand ist nur als Export/Import-Datei denkbar (siehe „Offen“).

## E-02 · Drei Clan-Archetypen, universelle Werte, drei Spezialisierungen
**Datum:** 2026-09-11 · **Stand:** gilt

**Kontext.** Klassengebundene Werte erzeugen tote Stats, die für die halbe Spielerschaft Müll sind.

**Entscheidung.** Drei Archetypen (Tank, Heilerin, Fernkampf). Die Werte Wumms, Taktgefühl und Bastelgrips helfen jeder Klasse. Je Figur drei Spezialisierungen. Verworfen: klassengebundene Werte.

**Konsequenzen.** Jeder Ausrüstungsgegenstand ist für jede Klasse lesbar; Loot muss nicht dreifach gewürfelt werden. Besitzer: Klassendesign (`content/classes.js`, `skills.js`, `talents.js`).

## E-03 · Inhaltsschicht `content/` mit Schema und `content:check`
**Datum:** 2026-09-11 · **Stand:** gilt

**Kontext.** Inhalt soll im Hintergrund wachsen, während UI und Grafik parallel laufen.

**Entscheidung.** Alle Inhalte liegen in `content/`; die Engine liest ausschließlich über `content/index.js`. Jede Registry hat eine Grundprüfung in `content/schema.js`, rollenspezifische Invarianten in `content/checks/<rolle>.js`. Verworfen: Inhalte in den Engine-Modulen belassen.

**Konsequenzen.** Keine Strings und keine Magic Numbers in Engine oder UI. Neue Registries brauchen einen Export im Index und eine Prüfung — dafür ist der Lead-Architect zuständig.

## E-04 · IDs sind Speicherschlüssel
**Datum:** 2026-09-11 · **Stand:** gilt

**Kontext.** Spielstände liegen im Browser des Spielers und lassen sich nicht nachträglich migrieren, wenn eine ID verschwindet.

**Entscheidung.** IDs in `content/` werden nie umbenannt und nie gelöscht. Was aus dem Spiel fliegt, bekommt `retired:true` und bleibt in den Daten.

**Konsequenzen.** Umbenennungen laufen immer über ein neues Feld (`name`, `title`), nie über die ID. Jede Rolle prüft das in ihrer `content/checks/<rolle>.js`. Ein ID-Wechsel ist ein Bruch und braucht eine eigene Entscheidung hier.

## E-05 · Kampf- und Ausrüstungsmodell, Handy gleichberechtigt
**Datum:** 2026-09-12 · **Stand:** gilt

**Kontext.** Ausrüstung soll die Spielweise ändern, nicht nur Zahlen; das Handy ist keine Zweitplattform.

**Entscheidung.** Autoangriff im Waffentempo, Zauber mit Stehenbleiben, 16 Ausrüstungsplätze mit echter Waffenwahl (Einhand/Zweihand/Nebenhand), Touch-Modus mit Joystick und sechs Skillbuttons, installierbare Web-App. Verworfen: Desktop-only; Ausrüstung als reine Werteliste.

**Konsequenzen.** Jede UI-Runde wird auch mobil (390×844) geprüft. Waffenarten sind Loot-Pflichtfeld.

## E-06 · Rollen-Pipeline mit Branch und Worktree je Rolle
**Datum:** 2026-09-12 · **Stand:** erweitert durch E-19

**Kontext.** Mehrere Sitzungen und eine Bild-KI arbeiten parallel im selben Repo.

**Entscheidung.** Feste Rollen (damals Inhalt, Engine, UI, Grafik, Welt), je Rolle ein Branch und ein Worktree, Übergabe ausschließlich über Dateien. Reihenfolge Inhalt vor Engine vor UI vor Grafik. Verworfen: Zuruf-Absprachen; Merge-Commits.

**Konsequenzen.** Was nicht in einer Übergabedatei steht, existiert nicht. Die Rollenaufteilung ist mit E-19 verfeinert worden; die Reihenfolge Inhalt → Engine → UI → Grafik gilt unverändert.

## E-07 · Merge nach `main` nur per Fast-Forward
**Datum:** 2026-09-12 · **Stand:** gilt

**Kontext.** Merge-Commits aus parallelen Rollenbranches machen die Historie unlesbar und verdecken, wer welche Datei geändert hat.

**Entscheidung.** Vor jeder Runde `git fetch && git rebase origin/main`. Nach `main` wird nur per Fast-Forward gepusht (`git push origin <branch>:main`), und nur nach grünem `npm test`. Wer beim Rebase in eine fremde Datei gerät, bricht ab und meldet es dem Lead. Kein `git stash` (geteilter Stack über alle Worktrees).

**Konsequenzen.** Eine Runde = ein Auftrag, ein Branch, ein Bericht, ein Fast-Forward. Wer nicht Fast-Forward pushen kann, rebased erneut statt zu mergen.

## E-08 · Anti-Slop-Guideline mit Scorecard je Bildschirm
**Datum:** 2026-09-13 · **Stand:** gilt

**Kontext.** Bildschirme sahen generiert statt entschieden aus (Gesamtwertung 3,0 in Version 0.13).

**Entscheidung.** Zehn prüfbare Regeln und eine Scorecard je Bildschirm (`docs/VISUELLE-BEWERTUNG-2026-09-13.md`), Ziel mindestens 4 von 5 je Bildschirm. Verworfen: Optik nach Gefühl.

**Konsequenzen.** UI- und Grafikrunden belegen ihre Wertung im Bericht.

## E-09 · Heilerin heißt Aperol-Anni
**Datum:** 2026-09-13 · **Stand:** gilt

**Kontext.** „Bass-Bärbel“ war unscharf und kollidierte mit Leanders Anlage.

**Entscheidung.** Die Heilerin heißt Aperol-Anni — Sprechname mit Getränkebezug wie Dosen-Dieter. Verworfen: Bass-Bärbel.

**Konsequenzen.** Die ID bleibt nach E-04 unverändert; geändert wurde nur der Anzeigename.

## E-10 · Grafikstil: Maifeld-Detailpixel
**Datum:** 2026-09-16 · **Stand:** gilt

**Kontext.** Drei Prototypen standen zur Wahl: Dorfcomic, Maifeld-Detailpixel, Krawall-Karikatur.

**Entscheidung.** Verbindlich ist Maifeld-Detailpixel: warme 40-Farben-Ankerpalette, dunkle Schieferkonturen, Licht links oben, vier Blickrichtungen, sichtbare Ausrüstung. Verworfen: Dorfcomic; Krawall-Karikatur.

**Konsequenzen.** Alle neuen Assets laufen über `tools/sprite-pipeline/build-live.mjs`; bis zur Lieferung zeichnet das Spiel den Fallback aus `content/ART-BRIEF.md`.

## E-11 · Weltmaßstab über registrierte Türöffnungen
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Figuren und Häuser passten nicht zueinander.

**Entscheidung.** Der Maßstab wird über registrierte, menschengroße Türöffnungen definiert (`docs/MASSSTAB-2026-09-17.md`). Verworfen: Maßstab je Asset von Hand.

**Konsequenzen.** Held 52 native Pixel / 26 Welteinheiten. Neue Gebäude nennen ihre Türöffnung.

## E-12 · Kampffluss nach `GAMEPLAY-KONZEPT-FLUSS.md`
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Gemessene Pausen von 3 bis 8 Sekunden nach jedem Kill, 16 bis 24 Sekunden Laufweg, 60 von 90 Talenten waren reine Zahlen.

**Entscheidung.** Kill gibt Schwung; vier Tasten ab Stufe 4 (1·1·2·1·3 plus Antwort); Procs mit 6-Sekunden-Fenster; Talente sind Regeln statt Prozente; Gegner in Gruppen; keine Warteressource. Trainingsarena bleibt Admin-Werkzeug. Verworfen: Rotation erst ab Stufe 6; Talente als Prozentwerte.

**Konsequenzen.** Offener Umbau: 72 Talente stehen noch als Zahlen da (Backlogs `klassen`, `gameplay`).

## E-13 · Clanbuch: ein Fenster mit Reitern, kein Einklappen
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** 19 Fenstertypen und drei Navigationsebenen übereinander; der Spieler verlor den Überblick (`docs/MENUE-BEWERTUNG-2026-09-17.md`).

**Entscheidung.** Genau ein Fenster „Clanbuch“ mit Reitern (Figur, Rucksack, Kniffe, Aufträge, Karte, Hilfe, Bude). Keine Seiten, kein Minimieren, kein Einklappen, nichts überlappt. Verworfen: Fenster behalten und nur aufräumen; einklappbare Fenster.

**Konsequenzen.** Neue Inhaltsbereiche werden Reiter, nie neue Fenster. Jeder Wunsch nach einem zusätzlichen Fenster braucht eine Entscheidung hier.

## E-14 · Gemeinsame Engine-Bausteine mit TicketTower erst später
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Der Wunsch nach einem gemeinsamen Framework kam auf, bevor ein zweites Spiel es tatsächlich braucht.

**Entscheidung.** Gemeinsame Bausteine (Inhaltsloader mit Schema-Prüfung, Spielstand-Migration, Ereignis-Bus, Debug-Leiste) erst, wenn TicketTower sie braucht **und** sie hier laufen. Kampf, Talente und Weltkarte werden nie geteilt. Verworfen: Framework-Repo jetzt anlegen.

**Konsequenzen.** Kein Vorrats-Abstrahieren in `engine.js`.

## E-15 · Mertloch folgt der studio-weiten Pipeline
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** `eresm-github-migration/docs/spielentwicklung/PIPELINE.md` definiert Rollen nur mit Artefakt und Gate, Playtest durch Personas ohne Spielwissen, ein Entscheidungsprotokoll.

**Entscheidung.** Mertloch ist eine Ausprägung dieser Pipeline; `docs/PIPELINE.md` bleibt die lokale Ausprägung, dieses Dokument das Protokoll. Verworfen: eigenes Studio-Organigramm; generisches Framework auf Vorrat.

**Konsequenzen.** Vor jedem Release läuft ein Playtest durch Personas, die das Spiel nicht gebaut haben. Ein Playtest durch den, der gebaut hat, zählt nicht.

## E-16 · Akt 1 „Filmriss“ ist die Story-Basis
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Die Story bestand aus lose gesammelten Kapiteln („Die letzte Kiste“) ohne durchgehenden Bogen; Inhalte, Gegner und Basisbau hingen nicht zusammen.

**Entscheidung.** Verbindliche Grundlage ist `docs/AKT-1-FILMRISS.md`: Prämisse (Filmriss nach „Nie wieder Montag“, die Kiste ist weg), drei tragende Stränge (Wiederaufbau, Die Unbekannten, Der Filmriss), Prolog plus vier Kapitel, neun Erinnerungsfetzen, sechs Basisbau-Gebäude, fünf neue Gegner/Bosse. Verworfen: lose Kapitelsammlung ohne Bogen; sofortiger Einstieg in Akt 2.

**Konsequenzen.** Alle Rollen leiten ihre Arbeit aus diesem Dokument ab. Story besitzt es; Änderungen am Bogen laufen über `docs/backlog/story.md` und werden hier vermerkt. Hardcodierte Reste von „Die letzte Kiste“ gehören aus UI und Engine entfernt.

## E-17 · Held = Fremder mit geliehenen Klamotten
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Offen war, ob der Held ein Clanmitglied mit Gedächtnisverlust ist oder ein Fremder.

**Entscheidung.** Der Held ist ein Fremder, den niemand im Dorf kennt. Die Klassenwahl ist die Klamottenwahl: Dieters Kutte, Annis Schürze oder Kevins Gürtel vom Haufen. Die drei bleiben als Mentoren an der Bude stehen; Wechsel am Treffpunkt heißt Klamotten tauschen. Verworfen: Held als verschollenes Clanmitglied; freie Klassenwahl ohne Fiktion.

**Konsequenzen.** Klassenwechsel braucht keine Erklärung mehr außer dem Kleiderhaufen. Mentoren brauchen Sprechzeilen je Kapitel (`HUB_TALK`) und eigene Sprites (siehe Grafik-Prioritäten in `docs/backlog/lead.md`). Der Held startet ohne Hose — der Beinschutz-Slot bleibt leer, bis Kapitel 1 abgeholt ist.

## E-18 · Mitschuld des Clans bleibt
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Es stand zur Debatte, den Clan zu entlasten und die Zerstörung allein den Auswärtigen zuzuschieben.

**Entscheidung.** Die Mitschuld bleibt Teil der Pointe: Dieter hat den Tresen selbst umgetreten („war eh morsch“), Kevin hat die Anlage in Sigis Hänger „in Sicherheit gebracht“, Anni hat gefilmt statt geholfen — und der Held hat die Kiste freiwillig weggegeben. Verworfen: unschuldiger Clan mit äußerem Feindbild.

**Konsequenzen.** Der Aktschluss ist keine Rache, sondern ein Geständnis. Kein Dialog darf den Clan reinwaschen; jede Belohnungszeile hält den Nachsatz, der die Behauptung kaputt macht.

## E-19 · Rollenmodell mit Dateibesitz und Tuning-Schicht
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Die eine Inhaltsrolle war der Flaschenhals: Story, Klassen, Gameplay, Balancing, Loot und Welt kollidierten in denselben Dateien.

**Entscheidung.** Sieben Fachrollen (Lead, Story, Klassen, Gameplay, Balancing, Loot, Welt) plus Engine, UI, Grafik und die Playtest-Personas. Eine Datei hat genau einen Besitzer (Tabelle in `docs/ROLLEN.md`). Zahlen gehören Balancing und laufen über `content/tuning.js` (Korrektur je ID mit `why`/`since`); Strukturen gehören der Fachrolle. Wer eine fremde Datei braucht, schreibt in `docs/backlog/<rolle>.md` des Besitzers. Brauchen zwei Rollen dieselbe Datei, spaltet der Lead sie. Verworfen: eine Inhaltsrolle für alles; Doppelbesitz mit Absprache.

**Konsequenzen.** Jede Rolle hat Branch, Worktree, Prüfdatei und Backlog. Der Branch `content-backend` ist damit Altbestand und wird nicht weitergeführt. Rollen dürfen `content/index.js` nur um eine Export-Zeile ergänzen und nennen es im Commit.

## E-20 · Ton: derb, dörflich, kein Sie, keine echten Personen
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Ohne festgeschriebenen Ton driften Texte zwischen Kindergeburtstag und Beleidigung; das Spiel karikiert reale Dorfmilieus.

**Entscheidung.** Derb, dörflich, schnell. Aufs Korn genommen werden Rollen und Institutionen (Vereinsmeier, Ordnungsamt, Influencer-Landhaus, Kegelclubs, Schrottplatz, Dorfpolizei), nie reale Personen. Kein „Sie“, durchgehend Du. Saufen und Prügeln sind Alltag, nicht Pointe — die Pointe ist immer ein konkretes Dorfproblem. Regel für jede Zeile: erst die Behauptung, dann der Nachsatz, der sie kaputt macht. Verworfen: entschärfter Familienton; Gags auf Kosten erkennbarer realer Personen.

**Konsequenzen.** Story prüft jede neue Zeile gegen diese Regel; Namen bleiben Sprechnamen (Kisten-Ida, Dosen-Dieter). Ein Text, der eine reale Person oder ein reales Unternehmen erkennbar macht, wird abgelehnt.

## E-21 · Basisbau-Kosten bleiben bis zum Playtest
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Die Gesamtkosten des Basisbaus in Akt 1 liegen absichtlich über dem, was der Kapitelfluss an Material liefert. Das wirkt auf dem Papier zu teuer.

**Entscheidung.** Die Kosten bleiben unverändert, bis ein Playtest sie widerlegt. Der Materialdruck ist der Anreiz, zwischen den Kapiteln ins Umland zu gehen. Verworfen: Kosten vorsorglich senken; Material in die Kapitelbelohnung legen.

**Konsequenzen.** Balancing rührt `content/buildings.js` nicht an, sondern wartet den Playtest ab und korrigiert danach über `content/tuning.js` (`docs/backlog/balance.md`). Der Playtest muss ausdrücklich messen, wie lange der Spieler für Stufe 1 aller Gebäude sammelt.

## E-22 · Akt 1 perfektionieren, bevor Akt 2 beginnt
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Akt 1 läuft inhaltlich vollständig, hat aber offene Enden bei Fluss, Menü, Grafik und Balance. Akt 2 (Bastian, Hochzeit in Koblenz) ist verlockend und würde die Baustellen verdoppeln.

**Entscheidung.** Akt 1 wird fertig gemacht — Fluss, Clanbuch, Grafik, Balance, Playtest ohne offenen „bricht ab“ — bevor irgendein Inhalt für Akt 2 entsteht. Verworfen: Akt 2 parallel anschreiben; Breite vor Tiefe.

**Konsequenzen.** Story schreibt keine Akt-2-Inhalte ohne ausdrücklichen Auftrag; die Haken bleiben Idas Schlussdialog und die Fetzen 7/8. Die Roadmap (`docs/ROADMAP.md`) stellt Akt 2 hinter die Runden A bis C.

## E-23 · Gisela und Pfandautomat bleiben Reserve
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** Die Bosse Gisela Gießkanne und Pfandautomat 3000 stammen aus dem Altbestand (Kapitel 5/6) und gehören nicht zum Bogen von Akt 1.

**Entscheidung.** Beide bleiben mit `reserve:true` in den Daten, sind aber nicht Teil von Akt 1 und tauchen im Spielfluss nicht auf. Löschen kommt wegen E-04 nicht in Frage. Verworfen: Bosse entfernen; Bosse in Akt 1 einbauen.

**Konsequenzen.** Grafik-Aufträge für Gisela und Automat stehen hinter allen Akt-1-Motiven. Prüfungen und Balance-Berichte behandeln `reserve:true` als „nicht im Fluss“ und melden es nicht als Lücke.

## E-24 · UI-Stil „Bierdeckel" für die gesamte Oberfläche
**Datum:** 2026-09-17 · **Stand:** gilt

**Kontext.** „Figur aussuchen" war kaputt (Karten ungleich, Text abgeschnitten, Seitenscroll, drei Knopfbreiten), Ursache: `.clan-card` in fünf CSS-Dateien mit eigenen Farben und Rastern. Die Oberfläche wirkte insgesamt „gestochen scharf" wie eine Website, nicht wie die Pixelwelt. Drei Mockups in `docs/ui-stile-2026-09-17/index.html`: A Kneipentafel, B Fachwerk & Honigpapier, C Bierdeckel. Empfehlung der Produktion war B.

**Entscheidung (E. Ruf).** **Stil C „Bierdeckel"** wird die durchgehende UI-Definition: Zeltstoff-Grund `#223A2F`/`#2E4A3B`, Karten aus Pappe `#D9B98A` mit Punktraster und hellem Innenrand `#EED9B5`, Stempel in Ziegelrose `#AD5260`, Gold `#ECB95C` nur für Primäraktion und Auswahl, Korallrot `#E18569` nur für Gefahr, Apfelgrün `#78A865` für Leben/OK. Display-Schrift Jersey 15 (Versalien für Titel, Namen, Reiter, Knöpfe), Lese-Schrift Nunito. Radius 0, Rahmen 2 px, harter Schatten 3 px, keine Verläufe, keine weichen Schatten. Verworfen: A (zu wenig Identität), B (heller Papierwechsel über der dunklen Welt).

**Konsequenzen.** Eine Stildatei `bierdeckel.css` ist die einzige Quelle für Tokens und Bausteine; Themen-Überschreibungen (`hearth.css`, `maifeld.css`, `comic-theme.css`, Bausteinregeln in `clan.css`/`panel-pages.css`/`popup-ui.css`) werden abgebaut. Prüfung nach `docs/UI-ABNAHME.md` vor jedem Merge. Reihenfolge des Umbaus: Klamottenwahl → Clanbuch → HUD/Aktionsleiste → Gespräch/Beute → Einblendungen/Tutorial. Grafikbedarf, den CSS nicht sauber abbildet, geht mit Fallback als Übergabe an die Grafik-Rolle (`docs/UEBERGABE-UI-AN-GRAFIK-<Datum>.md`). Schriften werden lokal vendort (OFL), weil das Spiel offline läuft.

---

## E-25 · Autoangriff auf Desktop und Touch
**Datum:** 2026-09-17 · **Stand:** vom Nutzer bestätigt

Zielwahl per Linksklick, Tab oder Touch allein startet keinen Angriff. Rechtsklick auf einen Gegner oder ein offensiver Kniff startet den Autoangriff; wiederholter Rechtsklick lässt ihn an. Taste 1 beziehungsweise der belegbare Angriffsbutton schaltet ihn an oder aus. Esc beendet ihn nach den bestehenden Prioritäten für Zauberabbruch und offene Fenster. Reichweite, Sichtlinie und Waffentempo bleiben maßgeblich; Zielverlust oder Tod beendet den Angriff. Mobile Geräte verwenden Ziel-Antippen und einen sichtbaren, zustandsmarkierten Angriffsbutton.

Diese Entscheidung ersetzt den früheren P2-Wunsch „Taste 1 darf nie ausschalten“. Händler/Handwerk und der vollständige Akt-1-Playtest sind vorerst zurückgestellt.

---

## E-26 · Erst die technische Basis stabilisieren
**Datum:** 2026-09-17 · **Stand:** vom Nutzer beauftragt

Vor weiterem Content werden vier Bereiche bearbeitet: Oberfläche und Touch-Bedienung, Bewegung und Interaktionen, bestehende Kampfregeln sowie Spielstand/Neuladen/Offline/Updates. Neue Inhalte und Händler/Handwerk bleiben zurückgestellt. Desktop und mobile Hoch-/Querformate gehören zur Prüfung; Browser-Touchemulation ersetzt keine physische Handyprüfung.

Die Runde behebt konkrete Fehler und ergänzt Regressionstests. Sie ist keine vollständige Balance- oder Performance-Abnahme. Ergebnisse und verbleibende Grenzen stehen in `docs/BASIS-STABILISIERUNG-2026-09-17.md`.


## E-27 · Clanbuch auf vier Reiter plus Hilfe, Abschnitte mit Sprungleiste
**Datum:** 2026-09-17 · **Stand:** gilt, verfeinert E-13

**Kontext.** Auftrag der Produktion: „Die Menüs sind viel zu viel." Inventur (`docs/MENUE-REDUKTION-2026-09-17.md`): sieben Reiter, sechs Leistenknöpfe, drei Weltknöpfe, ein Journal-Symbol, 14 Unterreiter und Chips, 14 Einträge im Touch-Kontextraster — 50 Navigationsziele, viele davon Doppelwege zum selben Inhalt.

**Entscheidung.** Vier Reiter (Figur, Rucksack, Aufträge, Karte) plus Hilfe als Symbol-Reiter. Kniffe und Talente sind Abschnitte der Figur, Bude und Erinnerungen Abschnitte der Aufträge. Reiter mit drei und mehr Abschnitten bekommen eine klebende Sprungleiste, die hinführt und beim Scrollen mitläuft. K, N und B springen zum Abschnitt statt ein Fenster zu öffnen. Menüleiste im HUD nur noch die vier Reiter; Ton/Pause/Vollbild und Journal-Symbol nur über Hilfe → Einstellungen bzw. den Reiter. Unterreiter reduziert: Hilfe 3 statt 4, Karte 3 statt 4, Aufträge-Chips 3 statt 4, Kniffe ohne Unterreiter (Raster und Leiste in einer Ansicht). Verworfen: sieben Reiter behalten und nur Beschriftungen kürzen; ein Hamburger-Menü mit Liste.

**Konsequenzen.** E-13 bleibt (ein Fenster, keine Seiten, kein Einklappen); die Reiterzahl ist jetzt vier plus Hilfe. Neue Inhalte werden Abschnitte eines bestehenden Reiters, nie neue Reiter. Hilfetexte, die „sieben Reiter" nennen, sind anzupassen (Story-Backlog).


## E-28 · Runde, einfache Linien statt Radius 0
**Datum:** 2026-09-18 · **Stand:** gilt, ändert E-24

**Kontext.** Auftrag der Produktion: „Der Stil soll nicht so eckig sein, einfache runde Linien, die zum Spielstil passen." E-24 hatte Radius 0, Rahmen 2 px und harten Schatten 3 px festgelegt; im Spiel wirkte das gegen die weichen Pixelformen der Welt (Baumkronen, Hügel, Figuren) wie ein Formular.

**Entscheidung.** Bierdeckel-Palette und Schriften bleiben (E-24), die Kanten nicht: Fenster und HUD-Kästen 12 px Radius, Knöpfe/Plätze/Kacheln 8 px, Chips/Balken/Stempel als Pille, Talent-Knoten rund (aktiv) bzw. 10 px (passiv), Touch-Knöpfe rund. Schatten weiter hart, aber nur nach unten (0 3 px). Keine Verläufe, keine weichen Schatten. Verworfen: Radius 0 behalten; Verläufe/Glanz.

**Konsequenzen.** Eine Regelgruppe am Ende von `bierdeckel.css` („Rundung E-28") ersetzt die Zeile `*{border-radius:0}`; neue Elemente nehmen `--r`, `--r-s`, `--r-pill`. Die Abnahmeliste `docs/UI-ABNAHME.md` gilt mit dieser Änderung.

## E-29 · Jeder Kniff hat zu jeder Zeit einen Nutzen
**Datum:** 2026-09-18 · **Stand:** gilt

**Kontext.** Auftrag der Produktion: „Jeder Skill soll zu jeder Zeit einen Nutzen haben, keine leeren Skills, die etwas erzeugen, das man nie oder noch nicht benutzen kann." Auf Stufe 1–2 baut die Kelle Pegel auf, der Finisher kommt erst Stufe 3: drei volle Rauten ohne Verbraucher (Playtest-Auswertung Nr. 3).

**Entscheidung.** Solange der Finisher nicht gelernt ist, entlädt die Kelle bei drei Pegeln von selbst („Frühe Eskalation", `COMBAT_RULES.earlyEscalation`, +60 % Kellenschaden, Pegel auf null, Schwebetext ESKALATION). Der Randale-Balken erscheint erst, wenn ein gelernter Kniff Randale kostet; der Pegel-Hinweis nennt die Regel. Verworfen: Finisher auf Stufe 1 vorziehen (Lernkurve E-12); Pegel erst ab Stufe 3 anzeigen (verschleiert den Aufbau).

**Konsequenzen.** Regel liegt bei Gameplay (`content/combat.js`, mit `COMBAT_RULE_INFO`-Erklärung), Zahl bei Balancing. Neue Kniffe, die etwas erzeugen, brauchen ab dem Tag ihres Erlernens einen Verbraucher oder eine Automatik.

---

## E-30 · Sichtbare Ausrüstung über Pre-Render aus 3D
**Datum:** 2026-09-18 · **Stand:** gilt

**Kontext.** Sichtbare Ausrüstung kostet als Sprite-Overlay 2 bis 20 Stunden je Look (bewegte Teile in vier Richtungen und zehn Bildern); der Schwellenwert von etwa dreißig Looks wird nach Aussage der Produktion schnell überschritten.

**Entscheidung.** Helden und Ausrüstung entstehen als 3D-Modelle (Rig mit festen Knochennamen, Ausrüstung als Mesh je Knochen) und werden offline zu Pixel-Sprites gerendert (`tools/prerender`: vier Richtungen, acht Posen, Laufzyklus, 40-Farben-Palette, Kontur), Ausgabe im Präzisions-Katalogformat, Ausrüstung als eigene Ebenen mit eingebrannter Verdeckung. Das Spiel bleibt 2D-Canvas; kein Live-3D. Bis zur Abnahme echter Modelle läuft die Pipeline mit einem Kasten-Rig hinter dem Schalter „3D-Vorrender (Vorschau)". Verworfen: Live-3D im Spiel (Stilbruch E-10, Welt und Gegner müssten mit); Overlay-Weg für alle Slots.

**Konsequenzen.** Modelle werden extern geliefert (`docs/UEBERGABE-3D-ASTRA-2026-09-18.md`). Asset-IDs der Ausrüstung bleiben Speicherschlüssel (E-04). Grafik besitzt `assets/prerender/models`, UI besitzt `tools/prerender` und `prerender-art.js`.

---

## E-31 · Kampfstatistik für Schaden und Heilung
**Datum:** 2026-09-18 · **Stand:** umgesetzt auf Nutzerauftrag

**Auftrag.** „Bau und implementiere ein damage und heal meter a la details (wow).“ Die Statistik zeigt tatsächliche Spielerwerte, DPS/HPS und Fähigkeitsanteile für laufende/vergangene Kämpfe und die Sitzung. Im Einzelspielermodus gibt es keine erfundenen Gruppenmitglieder; gewechselte Clanfiguren behalten getrennte Summen.

**Umsetzung.** Ein einklappbares Messfenster ergänzt das Clanbuch und bleibt während Bewegung und Kampf nutzbar. Nach Nutzerrückmeldung zur Details-Bedienung ist es am Desktop standardmäßig als kompakte Rangliste sichtbar; V schaltet es um. Position, Größe, Modus und Sichtbarkeit werden gemerkt. Mobil gibt es einen direkten HUD-Knopf; Figur → Werte bzw. Hilfe → Einstellungen bleiben als Einstieg. Auf Touch bleibt der Bereich der Kampfsteuerung frei. Zehn abgeschlossene Kämpfe und unbegrenzte Sitzungssummen aus begrenzten Aggregaten; keine Erweiterung des Spielstandformats. Keine zusätzliche Zufallsziehung, Balanceänderung oder Heilung durch den Zähler. Überheilung/Überschaden getrennt, Schilde und Ruhe-Regeneration ausgeschlossen. Die Veröffentlichung auf Main wird trotz weiterer Pushes abgeschlossen, damit die Live-Seite nicht dauerhaft hinter dem implementierten Stand bleibt. Details: [Messregeln und Prüfung](KAMPFSTATISTIK-2026-09-18.md).

## E-32 · Klassen-Kernmechaniken, Talentbäume mit Pfaden (Faktor 3)
**Datum:** 2026-09-18 · **Stand:** entschieden auf Nutzerauftrag, Umsetzung in Etappen

**Auftrag.** „Aktuell sind alle gleich: 3 von irgendwas generieren, dann finishen." Brainstorm und Bewertung: [KLASSEN-BRAINSTORM-2026-09-18.md](KLASSEN-BRAINSTORM-2026-09-18.md). Visuals laufen parallel: [UEBERGABE-VISUALS-KLASSEN-ASTRA-2026-09-18.md](UEBERGABE-VISUALS-KLASSEN-ASTRA-2026-09-18.md).

**Entschieden.**
1. Die Grundschleife (Schwung → Eskalation) bleibt auf Stufe 1–4 für alle gleich. Ab der Spezialisierung (Stufe 5) hat jede der neun Specs eine **Kernmechanik**, die die Leistenplätze Markierung, Eskalation, Bodenkniff und Stärkung umdeutet (Namen/Texte je Spec in `content/mechanics.js`, Regeln in `class-mechanics.js`). Kein Paar teilt nach Stufe 5 die Grundlogik: Pegel-Uhr, Fässer, Schimmel-Ausbreitung, Randale-Zustand, Lunte+Kettenblitz, Aufbau-Automat, Bastler-Zufall mit Pity, Deckung als Waffe, Heilung wird Schaden.
2. **Talentbäume:** 30 Talente je Spec = 10 Reihen × 3 Pfade. Je Reihe genau ein Talent (die anderen beiden sind ausgeschlossen). Punkte bleiben 1 je Stufe ab Stufe 2 (10 auf Stufe 11). **Pfadtreue:** 4 Talente desselben Pfades geben den Pfadbonus, 7 die Pfadkrone (passive Regeln je Pfad in `content/mechanics.js`). Reihe 10 ist der Schlussstein und ändert den Finisher. Regel für jedes Talent: ändert eine Regel, nie nur eine Zahl (Prüfung `content/checks/klassen.js`).
3. Speicherschlüssel bleiben `<spec>-<index>`, jetzt 0–29 (Reihe = ⌊index/3⌋, Pfad = index mod 3). Alte Builds werden beim Laden zurückgesetzt, die Punkte sind frei.
4. **GCD:** Basis 1,5 s, Untergrenze 1,0 s (Balancing, `content/balance.js`). Kniffe in einer Variante (Gratis, Verstärkt, Bereit, Eskalation, RESONANZ) und proc-ausgelöste Kniffe lösen nur einen kurzen GCD von 1,0 s aus.
5. **Bodenkniff auf Stufe 3** für alle Klassen; ab Stufe 5 spec-spezifisch (Fass, Robbi, Nest, Sporenwolke, …).
6. **Casts im Laufen** nur per Spec-Kit oder Talent (`mobile`-Flag am Kniff), nicht allgemein.
7. **Pets in zwei Stufen:** zuerst stationäre Begleiter (Fass, Robbi, Gisela) auf einem gemeinsamen Baustein „platziertes Objekt mit Aura/Leben/Ablauf" (`g.fields`), laufende Begleiter mit Folge-KI später.
8. Trinkspiel als Ansage/Antwort-Timing (Parade-Fenster mit Bonus) in der Filter-Furie, keine vierte Klasse.

**Reihenfolge.** Engine-Bausteine + Talentgraph → Inhalte (30 je Spec, Beschreibungsstandard Welle D) → Talentbaum-UI + HUD → Playtest Kenner → Visuals einbinden, sobald Astra liefert. **Stand 2026-09-19:** alle Etappen umgesetzt (laufende Begleiter als Pfadkrone für Robbi und Gisela), Balancing-Erstlauf in `tuning.js`; die Astra-Grafiklieferung ist seit 2026-09-19 eingebunden (docs/ASTRA-E32-LIEFERUNG-2026-09-19.md).

---

## Offen (noch nicht entschieden)

| Frage | Optionen | Empfehlung | Seit |
|---|---|---|---|
| Handwerk (Händler umgesetzt nach E-34) | ja; nein; später | später; Händler unabhängig davon nutzbar | 2026-09-19 |
| Geräteübergreifender Spielstand | nie; Export/Import-Datei; Konto | Export/Import-Datei, kein Konto (E-01) | 2026-09-12 |
| Online-Betrieb (Konto, gemeinsames Dorf, Koop) | E-01 belassen; nur Konto (Stufe A); bis Koop (Stufe C); MMO | bis Koop, Reihenfolge A → Engine-Refactor → B → C, siehe [ONLINE-MMORPG-VORBEREITUNG-2026-09-19.md](ONLINE-MMORPG-VORBEREITUNG-2026-09-19.md) | 2026-09-19 |
| Feldgegner ab Stufe 10 trivial | Skalierung in der Engine; Anhebung über `tuning.js`; bewusst lassen | Skalierung in der Engine, Dorfkern fest (`docs/backlog/engine.md`) | 2026-09-17 |
| Set-Boni für Dorflegenden | ja; nein | nach dem Playtest entscheiden, Konzept Loot + Gameplay | 2026-09-17 |

## E-33 · Bearbeitbares HUD mit Buff- und Debuffleisten

**Anlass.** Nutzerauftrag vom 18.09.2026: Oberfläche wie im Bearbeitungsmodus von WoW Retail anpassen, Buff- und Debuffleiste ergänzen; mobile Variante mitdenken.

**Entscheidung.** Ein eigener, pausierender Bearbeitungsmodus verschiebt und skaliert vorhandene HUD-Elemente. Benannte Layouts enthalten getrennte Ansichten für Desktop, Hochkant und Querformat. Speichern ist ausdrücklich, Abbrechen stellt den Ausgangsstand wieder her. Eigene Buffs, eigene Debuffs und Ziel-Debuffs haben unabhängige Leisten mit tatsächlichen Laufzeiten und Stapeln. Verworfen: nur fest positionierte Effektchips; ein gemeinsames Pixel-Layout für PC und Handy.

**Konsequenzen.** Keine Änderung an Kampfregeln oder Spielständen. Layoutpräferenzen liegen separat im Browser. Touchflächen werden im Editor nicht unter ihre Standardgröße skaliert; leere Leisten bleiben dort als Rahmen auffindbar. Umsetzung, Grenzen und Prüfungen: [HUD-Editor](HUD-EDITOR-2026-09-18.md).

**Nachtrag 19.09.2026.** Auf Nutzerwunsch ersetzt ein eigenes Spielmenü den Browserkonflikt mit F10: Esc öffnet aus der Welt die Buttons UI bearbeiten, Hilfe, Einstellungen, Clanbuch und Zurück zum Spiel. Offene Fenster, laufendes Zielen oder Zaubern werden mit Esc zunächst geschlossen beziehungsweise abgebrochen. Das Menü beendet den Autoangriff; nur der UI-Editor pausiert die Welt. P, der Desktop-Menüknopf und der mobile Menüknopf öffnen dasselbe Menü. F10 bleibt unbelegt. Tastaturfokus bleibt im Menü, Touchflächen sind mindestens 44 Pixel groß; im mobilen Querformat stehen die Aktionen zweispaltig.


## E-34 · Kalles Kiosk als Dorfladen

**Anlass.** Nutzerauftrag vom 19.09.2026: Charaktererstellung zurückstellen, stattdessen passende Händler für Gegenstände planen beziehungsweise bauen (Beispiel Tante-Emma-Laden).

**Entscheidung.** Der vorhandene Kiosk mit Kioskkönig Kalle wird zum Händler. Folgeauftrag: ein Haus mit separater begehbarer Innenraum-Instanz; Ein-/Austritt über die Tür, Handel an der Theke. Der verworfene Ansatz eines begehbaren Dachmodells auf der Dorfkarte wird nicht umgesetzt. Vier tatsächlich wirksame Verpflegungen werden zu den bestehenden Katalogpreisen und Mindeststufen verkauft. Kalle kauft Material, Verpflegung und abgelegte Ausrüstung zum halben Wert (mindestens eine Pfandmarke). Nutzerkorrektur: Händler und Rucksack stehen nebeneinander. Rechtsklick beziehungsweise mobil Antippen verkauft einen Stapel direkt, ohne Sicherheitsabfrage; der Rückkauf dient als Rückweg. Die letzten zwölf Verkäufe bleiben zum gleichen Preis rückkaufbar, auch nach Neuladen. Material für den angenommenen, noch nicht abgegebenen Hauptauftrag wird reserviert. Ausrüstung gibt es weiterhin als Beute; Handwerk bleibt separat.

**Konsequenzen.** Ersetzt die Händler-Zurückstellung aus E-25/E-26 sowie die Einschränkung des alten Händlerentwurfs „kein Ausrüstungsankauf, keine Rückkaufliste“. Rückkaufdaten und referenzierte gewürfelte Gegenstände werden im bestehenden Spielstand mitgespeichert; alte Spielstände erhalten eine leere Liste. Transaktionen prüfen Reichweite, Sichtlinie, Leben, Kampf, Tutorial, Menge, Marken und Kapazität. Kaufen ist vollständig oder wirkungslos. Karte und Rucksack führen zum begehbaren Vorplatz; ein gemeinsames Popup zeigt Kaufen/Rückkauf links und den Rucksack rechts, auf Desktop und Touch. Die Charaktererstellung bleibt ein zurückgestellter Entwurf. Umsetzung und Grenzen: [Händler](HAENDLER-2026-09-19.md).

Einzigartige Dorflegenden, Questgegenstände und Gegenstände ohne hinterlegten Verkaufswert werden nicht angekauft. Damit entsteht aus fehlenden Preisangaben kein Verkauf wertvoller Unikate zum Mindestpreis.


## E-35 · Online als MMORPG: eigener Server, geteilte Welt, lokaler Kampf

**Anlass.** Nutzeraufträge vom 19./20.09.2026: Subdomain mertloch.esm-consultant.de, „auf MMORPG umstellen", eigener Ionos-Windows-Server, „Multiplayer als MMORPG finalisieren". Revidiert E-01 (reines Solo-Browserspiel).

**Entscheidung.**
1. **Betrieb:** eigener Server (Caddy + Node, `server/game/`), keine Fremdpakete, Auslieferung per Push auf `main`. GitHub Pages bleibt als Solo-Fassung ohne Online-Funktionen bestehen.
2. **Konto und Spielstand:** E-Mail + Passwort (scrypt), Sitzungs-Cookie, Cloud-Spielstand je Welt mit Sicherung des Vorgängers; der Browserspeicher bleibt erste Wahrheit, der neuere Stand gewinnt.
3. **Geteilte Welt, lokaler Kampf:** Jeder Browser rechnet seinen Kampf weiter selbst (neun Spec-Mechaniken, Procs, Talente bleiben unangetastet). Der Server führt je Lagergegner die gemeinsamen Lebenspunkte, die Bedrohung je Spieler, das Ziel (höchste Bedrohung, 10 % Trägheit; Schutz-Specs Dosenwall und Schrottkoloss zählen dreifach) und die Wiederkehr. Clients melden nur eigenen Schaden. Wer nicht das Ziel ist, sieht den Gegner dem Ziel nachlaufen und wird nicht angegriffen.
4. **Belohnung:** Beim Tod bekommt jeder Beteiligte und jedes Gruppenmitglied in 200 m die volle lokale Belohnung (EP, eigene Beute, Auftragsfortschritt). Persönliche Beute – kein Streit, kein Würfeln.
5. **Soziales:** Gruppen bis 5 (einladen, annehmen, verlassen, entfernen, Leitung wandert), Gruppenrahmen, Kanäle Umkreis/Welt/Gruppe/Flüstern, Spielerliste, Bestenlisten.
6. **Nicht geteilt:** Tutorial, Trainingsarena, Kiosk-Innenraum, Umgebungstiere (Ecology), Aufträge, Clanbau. Wer in einer Instanz ist, ist für andere unsichtbar.

**Verworfen.** Voll serverseitiger Kampf: hätte Engine, Mechaniken und Procs doppelt gebraucht und jede Eingabe um die Laufzeit verzögert – für ein Koop-Spiel ohne PvP und ohne Handel zwischen Spielern kein Gewinn. Grenze, die daraus folgt: Schadenswerte kommen vom Client (Server kappt auf Gegner-Maximum und 40 Meldungen/s). Deshalb hängen an Bestenlisten keine Belohnungen, und es gibt weder PvP noch Handel/Post zwischen Spielern; beides bräuchte Server-Autorität über Inventar und Kampf.

**Konsequenzen.** `docs/ONLINE-STUFE-B-2026-09-19.md` (Betrieb, Schnittstellen), `docs/ONLINE-STUFE-C-2026-09-20.md` (geteilte Welt, Gruppen). Lagergegner tragen `netId` (`<lager>:<index>`); neue Gegnerquellen, die geteilt sein sollen, brauchen ebenfalls einen stabilen Schlüssel.


## E-36 · Randale ist knapp und hat eine Schwelle; zwei Begriffe am Start

**Anlass.** Nutzerbefund 20.09.2026: Randale-Leiste unlesbar (13-px-Schrift in 9 px Höhe), Randale läuft in der normalen Rotation nie leer und ist damit wirkungslos, am Start drei Wörter (Randale, Pegel, Striche). Messung vorher (`scripts/spec-sim.mjs`): Randale im Schnitt 79–87, unter 35 in 0–2 % der Zeit.

**Entscheidung.**
1. **Knapp:** Randale fließt im Kampf mit 3 je Sekunde nach (vorher 10), außerhalb weiter mit 5 – Verschnaufen füllt auf. Der Grundangriff gibt je Klasse 11 (Dieter), 19 (Anni, eskaliert doppelt so oft) und 9 (Kevin). Ziel und Messung nachher: Dauerfeuer auf Abklingzeit hält im Schnitt 40–55 Randale und steht 20–50 % der Zeit unter 35. Wer alles drückt, läuft leer.
2. **Schwelle „in Fahrt":** Ab 80 Randale (gemessen vor dem Abzug der Kosten) schlägt die Eskalation 20 % härter. Damit gibt es eine Entscheidung: Randale für Markierung, Wurf und Bodenkniff ausgeben oder für die Eskalation hochhalten. Anzeige: Marke bei 80 auf der Leiste, Leiste leuchtet, Text „· In Fahrt", Eskalations-Knopf zeigt die Variante „In Fahrt".
3. **Begriffe:** Am Start gibt es Randale (Leiste, erscheint erst mit dem ersten Kniff, der etwas kostet) und die Aufbaupunkte der Klasse (Pegel, Glanz, Druck; Zeile „Pegel 2/3 → Eskalation"). Beide erklären sich beim Überfahren (`data-describe="glossary:…"`). „Deckelstriche" gehört allein dem Kneipenschläger; der Glossareintrag der Aufbaupunkte hieß versehentlich so und heißt wieder „Pegel".

**Konsequenzen.** Zahlen in `content/balance.js` (`momentum.combatEnergyRegen`, `surgeAt`, `surgeBonus`) und `content/classes.js` (`strikeGain`). `scripts/spec-sim.mjs` gibt Randale-Schnitt und Knappheit aus. Der UI-Regressionscheck (Suite layout) schlägt fehl, wenn die Ziffernhöhe eines Balkentexts nicht in den Balken passt. Offen und Sache der Charaktererstellungs-Sitzung: Die Spec-Mechanik (z. B. Deckelstriche) ist ab Stufe 1 aktiv; das dort geplante Spec-Tor würde sie später einführen.


## E-37 · Offene Talentbäume nach dem Vorbild WoW Classic

**Anlass.** Nutzerauftrag 20.09.2026: „Man kann beliebig zwischen den Spezialisierungen skillen, es gibt innerhalb Abhängigkeiten, die Sinn ergeben, jeder Spec kann auch für einen anderen interessant sein – Cross-Spec soll sich lohnen. Alles möglich und offen. So gestalten wir die künftigen Talentbäume." Ersetzt aus E-32 die Regeln „je Reihe genau ein Talent" und „Spec-Wechsel setzt Punkte zurück" sowie das geplante Spec-Tor mit Pflichtwahl.

**Entscheidung.**
1. **Drei Bäume je Klasse, ein Punktetopf.** Punkte (ein Punkt je Stufe bis Stufe 11, danach einer alle drei Stufen: 16 auf Stufe 30) gehen frei in alle drei Bäume der eigenen Klasse. Mehrere Talente je Reihe sind erlaubt.
2. **Stufen-Tor je Baum.** Reihe n öffnet sich mit n Punkten in DIESEM Baum (`TIER_POINTS = 1`). Punkte im Nachbarbaum öffnen nichts. Der Schlussstein kostet damit 10 Punkte im Baum; bei 16 Punkten bleibt neben einem Schlussstein Platz für sechs Punkte quer – das Verhältnis 10 zu 16 entspricht WoW Classic (31 zu 51). Verworfen: 2 Punkte je Reihe – macht jeden Altstand und jeden reinen Pfad ungültig.
3. **Pfeile.** Abhängigkeiten setzt der Inhalt bewusst mit `requires:<Index im Baum>` (nur nach oben). Automatisch abgeleitete Pfeile wurden verworfen, weil sie bestehende Builds brechen. Die heutigen Bäume haben noch keine Pfeile; neue und überarbeitete Bäume bekommen sie dort, wo ein Talent ein anderes verändert.
4. **Hauptbaum.** `talents.spec` ist der Hauptbaum: Er bestimmt Kit (Kniff-Namen) und Kernmechanik. Wählbar ab Stufe 5 (`BALANCE.player.specLevel`), die erste Wahl überall außerhalb des Kampfes, jeder Wechsel am Clan-Treff. Ein Wechsel lässt die Punkte stehen. Neue Helden haben bis zur Wahl keinen Hauptbaum (Stufe 1 bis 4 spielen den Klassenkern), die Punkte bis dahin werden gespart. Altstände behalten Hauptbaum und Talente.
5. **Pfadboni bleiben** (4 und 7 Talente eines Pfades) und zählen je Baum – sie belohnen Treue, ohne Offenheit zu verbieten.
6. **Alle Punkte zurück** nur am Clan-Treff (`resetTalents`).

**Cross-Spec heute.** Je Baum wirken 18 bis 26 von 30 Talenten unabhängig vom Hauptbaum (Werte, Procs, Kniffe). 71 von 270 drehen an der Kernmechanik ihres Baums und wirken nur, wenn er Hauptbaum ist; das Fenster kennzeichnet sie (`mainTreeOnly`).

**Muster für künftige Bäume** (`docs/TALENT-AUTORENBRIEF-2026-09-18.md`, Abschnitt „Offene Bäume"): Reihe 0 bis 3 allgemein nützlich (auch für die Nachbarbäume), ab Reihe 4 Mechanik-Talente, Pfeile nur, wo ein Talent ein anderes voraussetzt, mindestens ein „Brücken-Talent" je Baum, das ausdrücklich mit einem Nachbarbaum zusammenspielt.

**Balance (Messlauf 20.09.2026, `node scripts/spec-sim.mjs 60 0 30 <punkte>`, Stufe 30, 60 s).** Ohne Talente 120–244 DPS je Baum; mit 10 Punkten (alter Stand) +0 bis +50 %; mit 29 Punkten bis +113 % (Zapfmeister, Rampensau) – verworfen; mit 16 Punkten +15 bis +45 %. Deshalb 16. Ränge (`maxRank`) bleiben als Werkzeug für künftige Bäume vorbereitet.


## E-38 · Helden-Slots: eigene Charaktere mit Klasse, Aussehen und Namen

**Anlass.** Nutzerauftrag 20.09.2026: „Charaktere sind eigene Slots mit eigener Storyline. Zum Start wählt man nur eine Klasse (Tresenbrecher, Landhaus-Lady, Pfandingenieur), gestaltet sein Aussehen in einer der bisherigen Richtungen und vergibt einen Namen. Das ist ein einzigartiger Charakter meines Accounts, ich kann mehrere haben. Im Auswahlbildschirm sehe ich alle Helden mit Level und vollem Gear, so wie sie ingame aussehen." Ersetzt „Eine Bande, ein Spielstand" des Anmeldebildschirms.

**Entscheidung.**
1. **Ein Held = ein Spielstand.** `characters.js` hält die Liste (höchstens 8): `{id,name,classId,look,summary}`. Speicherschlüssel je Held `mertloch-chronicles-<welt>-<id>`, Cloud-Schlüssel `<welt>#<id>`. Der vorhandene Altstand wird ohne Kopieren zum ersten Helden (`legacy`, alter Schlüssel) – niemand verliert Fortschritt.
2. **Erstellung in drei Schritten:** Klasse → Aussehen → Name. Aussehen = einer der drei gezeichneten Körper (Kräftig, Schwungvoll, Drahtig), frei zur Klasse wählbar, ohne Einfluss auf Werte. Name 3–20 Zeichen, je Liste eindeutig und – mit Konto – serverweit reserviert (`/api/characters`).
3. **Heldenhalle** (Startbildschirm): Karte je Held mit dem Spielbild samt angelegter Ausrüstung, Klasse und Stufe; die Kurzfassung (`summary`) wird bei jedem Speichern mitgeschrieben, damit die Halle keine Spielstände öffnen muss. Löschen mit Rückfrage.
4. **Wechsel = Neuladen** mit gemerktem Ziel (`sessionStorage`), danach direkt ins Dorf. Das hält jeden Modulzustand sauber; Kosten: zwei bis drei Sekunden.
5. **Online:** Im Dorf, im Chat, in Gruppen und in der Spielerliste tritt man unter dem Heldennamen auf (`hello`), der Server prüft den Besitz. Die Heldenliste wird über den Cloud-Schlüssel `@helden` zwischen Geräten vereinigt; Gelöschtes bleibt gelöscht. Alle Helden teilen sich dieselbe Welt (`roomKey`).

**Nachtrag 21.09.2026.** Eigene Helden behalten ihre Klasse (`game.classLocked`); nur der übernommene Altstand darf am Clan-Treff noch die Klamotten tauschen. Überschriften und Menüs zeigen den Heldennamen (`game.heroName`); die Dialoge sprechen den Spieler durchgehend mit „du" an, Dieter, Anni und Kevin bleiben Clan-Figuren der Geschichte. Im Netz gilt der vom Server bestätigte Name (`welcome`/`you`). Beim ersten Abgleich eines Helden auf einem Gerät gewinnt der Cloud-Stand, wenn er mehr Fortschritt hat – ein frisch erzeugter leerer Stand hatte ihn sonst überschrieben (Befund des Zwei-Spieler-Tests). Feineres Aussehen (Haare, Hautton, Gesicht) ist als Auftrag an die Grafik-Sitzung beschrieben: `docs/UEBERGABE-HELDEN-AUSSEHEN-2026-09-21.md`.

**Zwei-Spieler-Test (21.09.2026, zwei echte Browser-Sitzungen gegen den Spielserver).** Konto anlegen, Held erstellen, sich gegenseitig mit Heldennamen sehen, Gruppe per `/einladen`, geteilte Lebenspunkte, Gegner folgt dem Spieler mit der Bedrohung und greift den anderen nicht an, gemeinsamer Kill mit EP und eigener Beute für beide, Anmeldung auf einem zweiten Gerät mit Heldenliste und Spielstand aus der Cloud.
