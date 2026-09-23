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
| E-02 | Drei Clan-Archetypen, universelle Werte, drei Spezialisierungen | 2026-09-11 | gilt, Werteliste fortgeschrieben durch E-53 |
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
**Datum:** 2026-09-11 · **Stand:** gilt; die Werteliste schreibt E-53 fort (fünf Werte, universell bleibt)

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

**Nachtrag 21.09.2026.** Eigene Helden behalten ihre Klasse (`game.classLocked`); nur der übernommene Altstand darf am Clan-Treff noch die Klamotten tauschen. Überschriften und Menüs zeigen den Heldennamen (`game.heroName`); die Dialoge sprechen den Spieler durchgehend mit „du" an, Dieter, Anni und Kevin bleiben Clan-Figuren der Geschichte. Im Netz gilt der vom Server bestätigte Name (`welcome`/`you`). Beim ersten Abgleich eines Helden auf einem Gerät gewinnt der Cloud-Stand, wenn er mehr Fortschritt hat – ein frisch erzeugter leerer Stand hatte ihn sonst überschrieben (Befund des Zwei-Spieler-Tests). **Hautton und Haarfarbe sind gebaut (`hero-tint.js`):** vier Hauttöne und sieben Haarfarben je Körper, zur Laufzeit je Körperbild umgefärbt und zwischengespeichert – ohne neue Zeichnungen. Haut wird am Farbton erkannt, Haare am Kopf-Ankerpunkt des Bildes (beim Körper „Schwungvoll" zusätzlich über Stirnlinie und Seiten); die cremefarbene Unterwäsche bleibt unberührt. Die Auswahl steht in der Erstellung, in der Heldenhalle, an der Spielfigur und bei anderen Spielern (`kt` in der Anwesenheit). Glanzlichter der Haut werden in einem zweiten Durchgang über ihre Nachbarschaft erkannt (von Haut umgeben = Haut, von hellem Stoff umgeben = Stoff); das Porträt im Heldenrahmen wird mit denselben Regeln eingefärbt. Der Klassenwechsel innerhalb eines Spielstands ist für jeden Helden abgeschaltet, auch für den übernommenen Altstand. Ida spricht den Helden ab dem Abschluss von Kapitel 1 mit Namen an (`{held}` in den Texten, ersetzt beim Öffnen des Fensters) – vorher kennt sie ihn laut Geschichte nicht. Kopf-Accessoires (Brille, Sonnenbrille, Stirnband) werden prozedural am Kopf-Ankerpunkt gezeichnet, je Körper mit eigener Augen- und Stirnhöhe, von hinten ohne Brille; ein Helm verdeckt sie. Bärte (Stoppeln, Kinnbart, Vollbart) und der Irokese sind als geformte Pixel-Ebenen gebaut: der Bart folgt dem Kiefer, liegt im Bild-Zwischenspeicher und bleibt per `source-atop` auf der Figur, von hinten gibt es keinen; Farbe = gewählte Haarfarbe. Verworfen wurde vorher der Versuch, vorhandene Pixel umzudeuten (Kurz, Glatze, Rasiert – ausgefranst, fleckig). Der Irokese sitzt beim Körper „Schwungvoll" auf dem Scheitel vor dem Dutt (`crown` je Körper). Das Porträt im Heldenrahmen zoomt bei eigenem Aussehen neunfach auf den Kopf der Spielfigur – dort sind Bart, Brille und Frisur jederzeit groß zu sehen, auch wenn die Figur in der Welt klein ist. Ein zweiter Versuch, Haar zu ERSETZEN (Glatze mit schattierter Schädelkuppel, Rasur mit Kieferschatten), wurde am Bild wieder verworfen: Haarscherben, verformte Rückansicht, Maskengesicht. Solche Frisuren brauchen weiter Zeichnungen: `docs/UEBERGABE-HELDEN-AUSSEHEN-2026-09-21.md`.

**Zwei-Spieler-Test (21.09.2026, zwei echte Browser-Sitzungen gegen den Spielserver).** Konto anlegen, Held erstellen, sich gegenseitig mit Heldennamen sehen, Gruppe per `/einladen`, geteilte Lebenspunkte, Gegner folgt dem Spieler mit der Bedrohung und greift den anderen nicht an, gemeinsamer Kill mit EP und eigener Beute für beide, Anmeldung auf einem zweiten Gerät mit Heldenliste und Spielstand aus der Cloud.

## E-39 · Eine Lichtrichtung: Bodenschatten, Lichtschicht, Farbabstimmung, ruhiger Bildschirm

**Anlass.** Nutzerauftrag 20.09.2026 nach der Analyse des eingestellten Iso-MMO Dreadmyst („sieht immer noch besser aus als unser Spiel"). Befund: Der Vorsprung kommt nicht aus besseren Einzelgrafiken, sondern aus Einheitlichkeit – jedes Objekt wirft einen weichen Schatten in dieselbe Richtung, Lichtquellen leuchten wirklich (`sprite_light`), jedes Gebiet hat einen eigenen Nachtanteil (`night_pct`), Wolkenschatten ziehen über die Karte, ein kurzer Shader hebt Kontrast und Sättigung, und die Oberfläche lässt der Welt den Vortritt. Bei uns standen Kirche, Bäume und Figuren ohne Schatten wie Aufkleber auf dem Boden.

**Entscheidung.**
1. **Eine Lichtkonvention** in `light-convention.js`: Sonne links hinter den Figuren (im Bild links oben), Schatten fallen nach rechts unten (Richtung 0,8 / 0,35), Farbe `#1c2a22`, Deckkraft 0,42. Sie gilt für den Laufzeit-Renderer UND für vorgerenderte Figuren (E-41).
2. **Bodenschatten** (`world-light.js`): Bäume und Gebäude werfen ihren echten Umriss – einmal als Schattenriss gezeichnet, zwischengespeichert, gespiegelt und geschert auf den Boden gelegt. Figuren, Gegner, Möbel und Beute bekommen eine gerichtete Ellipse. Alle Schatten landen in EINER Ebene und werden einmal mit der Deckkraft der Konvention aufgetragen: überlappende Schatten im Wald werden nicht schwarz.
3. **Lichtschicht:** halb aufgelöste Ebene, multipliziert über die fertige Welt. Dunkelanteil je Gebiet (Rastplatz 0,04 · Fluren 0,10 · Wald bis 0,26 · besetztes Lager 0,30 · Bosslager 0,40 · freigeräumt 0,12), weich nachgezogen. Lichtquellen (Laternen, Lagerfeuer, Türen, Kirche, Konterbrunnen, Brandflächen, Treffer-Blitze) hellen die Dunkelheit auf und legen einen warmen Schein darüber, der mit der Dunkelheit wächst. Wolkenschatten aus kachelbarem Rauschen, ohne Bilddatei.
4. **Farbabstimmung:** Kontrast 1,10 und Sättigung 1,08 als CSS-Filter auf der Weltfläche (Grafikkarte, kein Zeichenaufwand), dazu eine Randabdunklung. Bewusst unter dem Vorbild (1,19 / 1,09): Pixelgrafik kippt früher.
5. **Ruhiger Bildschirm:** Die Kampfstatistik bleibt zu, bis jemand sie mit V öffnet (`METER_RULES.openByDefault`); eine gespeicherte Vorliebe gilt weiter. Solange die Hofprobe führt, schweigt die Clan-Schule – ein Lehrer zur Zeit; die Frist der Lektion läuft erst danach.
6. **Abschaltbar:** Hilfe → Einstellungen → „Licht & Schatten" (`settings.light`, Standard an) schaltet Schatten, Lichtschicht und Farbabstimmung gemeinsam ab – für schwache Geräte.

Alle Zahlen stehen in `content/lighting.js`. Bildbelege vorher/nachher: `visual-review/look-dreadmyst/` (`node scripts/look-shot.mjs <ordner>`).

**Bewusst offen.** Kein Tag-Nacht-Lauf – der Dunkelanteil hängt am Gebiet, nicht an der Uhr. Fenster leuchten nicht einzeln (nur die Tür), weil die Gebäudegrafik keine Fensterpositionen kennt. Der Kiosk-Innenraum bekommt nur die Farbabstimmung. Beschriftungen liegen unter der Lichtschicht und dunkeln im Bosslager leicht mit ab. Nicht übernommen: Iso-Perspektive und fremde Grafiken (Evermotion, Flare, Kaufpakete).
## E-41 · Pre-Render: eine Kamera, ein Licht, gebackener Bodenschatten

**Anlass.** Analyse des eingestellten Iso-MMO Dreadmyst (20.09.2026): Dessen Figuren wirken hochwertig, weil sie mit EINER festen Kamera, EINER festen Lichtrichtung und einem dazu passenden weichen Bodenschatten vorgerendert sind. Unser Pre-Render-Weg (E-30) hatte Kamera und Licht als lose Zahlen in `render.html` und gar keinen gerenderten Schatten; die Laufzeit malte eine neutrale Ellipse darunter. Parallel führt die Laufzeit einen einheitlichen Bodenschatten ein – beides muss aus derselben Quelle kommen.

**Entscheidung.**
1. **Eine Lichtkonvention, eine Datei:** `light-convention.js` exportiert `LIGHT` (eingefroren). `dir` (0,80; 0,35): Schatten fallen im Bild nach rechts unten; `shadow`: Farbe `#1c2a22`, Deckkraft höchstens 0,42, Stauchung 0,38; `sun`: dasselbe Licht als 3D-Richtung für die Pre-Render-Kamera (Azimut −139,43°, Höhe 72°, gültig für Neigung 22°). Laufzeit und Pre-Render lesen nur diese Datei.
2. **Feste Kamera** (`tools/prerender/stage.js`, `CAMERA`): orthografisch, 22° Neigung, keine Drehung, 4 px je Welteinheit. 22° statt bisher 20°, weil sin 22° = 0,375 der Schatten-Stauchung 0,38 entspricht und weiter zur ¾-Sicht der Präzisions-Sprites passt. Kein 45°-Iso.
3. **Fester Lichtaufbau** (`LIGHTS`): Sonne als einziges schattenwerfendes Schlüssellicht, Fülllicht links oben hinter der Kamera ohne Schatten, Hemisphäre + Umgebung. Keine Lichter je Asset; gelieferte Modelle bringen keine mit (Übergabe §7).
4. **Schatten ins Bild gebacken:** echter Schattenwurf (three.js ShadowMaterial, PCFSoft, Karte 2048²) auf eine unsichtbare Ebene in Sohlenhöhe, danach eigener Gauß-Weichzeichner, eingefärbt und gedeckelt nach `LIGHT.shadow`, unter die Figur in den Basisbogen gelegt. Der Schatten bleibt unter Alpha 128 und verändert deshalb weder `bounds` noch `nativeHeight`; Rahmen 192² und Fußpunkt (96,160) bleiben. Katalog: `shadowBaked:true` je Heldenbogen, `stage` mit Kamera und Licht. Laufzeit: `prerenderHasBakedShadow(id)`; `drawPrerenderPerson` lässt die eigene Ellipse dann weg. `--no-shadow` baut Bögen ohne Schatten.

**Ehrlich benannt.** „Sonne links oben hinter der Kamera" und „Schatten fällt im Bild nach unten" schließen sich physikalisch aus: Ein Schlagschatten fällt nur dann nach unten, wenn die Sonne HINTER der Figur steht. Verbindlich ist die Schattenrichtung; die Sonne steht deshalb links hinten (im Bild ebenfalls links oben), und die helle Vorderseite liefert das Fülllicht. So arbeiten auch klassische vorgerenderte Spiele.

**Verworfen.** (a) Projizierte Ellipse statt echtem Schattenwurf – stabil, aber sie folgt weder Ausfallschritt noch erhobenem Arm; der echte Schattenwurf lief im headless-Build (SwiftShader) stabil und ohne Banding. (b) Sonnenhöhe 60°/66° – längerer Schatten, lief aber unten aus dem Rahmen (nur 32 px unter dem Fußpunkt). (c) Rahmen vergrößern – hätte alle 210 Ausrüstungsebenen und den Bildspeicher der Laufzeit vergrößert. (d) Eigener Schattenbogen – doppelter Bildspeicher; das Katalog-Flag genügt zur Trennung.

**Bewusst offen.** Ausrüstung (z. B. Hammer, Schild) wirft noch keinen eigenen Schatten, weil getrennte Ebenen sich beim Stapeln doppelt abdunkeln würden. In weiten Posen (Ausfallschritt, Treffer; 3–5 von 64 Bildern je Held) reichen die Füße fast bis zum Rahmenrand; der Schatten wird dort über 6 px weich ausgeblendet, der Build meldet die Bilder. Die 40-Farben-Quantisierung kippt dunkles Blaugrün weiterhin stellenweise nach Grün (bestand schon vor E-41).

## E-40 · Zusatz-Generator für gewürfelte Beute (Vorsilben und Beinamen)
**Datum:** 2026-09-20 · **Stand:** gilt

**Anlass.** Gewürfelte Beute bestand aus Grundteil + einem von drei Spec-Nachsätzen („des Tresens“, „der Zugabe“, „des Kurzschlusses“) – rund 60 Namen, eintönig. Vorbild Dreadmyst (`affix_template`): wenige Grundteile × viele Zusätze mit Stufenband und 1–2 Wertbeiträgen ergeben tausende unterscheidbare Fundstücke.

**Entscheidung.**
1. **Zwei Pools in `content/affixes.js`:** Vorsilben (vor dem Grundteil) und Beinamen (hinter dem Spec-Nachsatz) – „Klebriger Pfandprügel des Tresens ohne TÜV“. Je Zusatz: `id`, Namensform, Stufenband, Slotgruppen (`waffe`, `ruestung`, `schmuck`, `alle`), erlaubte Güten, 1–2 Werte als **Anteil** am Zusatzbudget (Summe 1).
2. **Genus sauber statt geraten:** Grundteile tragen ihr Genus (`ROLLED_BASES[slot][2]`, `WEAPON_BASE_GENUS`, `FAMILY_TROPHIES[family][2]`; m/f/n/p). Vorsilben sind entweder ein Adjektivstamm (`stem`, Endung aus `ADJECTIVE_ENDINGS`) oder ein unveränderliches Bestimmungswort mit Bindestrich (`fixed`, „Kirmes-“). Der Inhalts-Check verlangt das Genus für jedes Grundteil.
3. **Kein neues Feld im Spielstand.** Die Zusätze werden deterministisch aus den sechs gespeicherten Rohdaten (`slot, spec, level, quality, roll, family`) abgeleitet (FNV-1a + Mischschritt, `rolledAffixes` in `itemization.js`). Roll-IDs, ID-Regex und `restoreRolls` bleiben unverändert.
4. **Güte steuert die Anzahl:** ungewöhnlich 0–1 (Chance `AFFIX_TUNING.uncommonChance`), selten genau 1, episch Vorsilbe + Beiname.
5. **Budget: obendrauf, klein, gedeckelt.** Jeder Zusatz gibt `AFFIX_TUNING.share` (10 %) des Grundbudgets zusätzlich, verteilt nach den Anteilen und umgerechnet mit `AFFIX_TUNING.rate`; der Grundwurf bleibt unangetastet. Deckel `maxGain` 20 % (Check). Verkaufswert bleibt am Grundbudget. Zahlen stehen in `content/tuning.js` (`AFFIX_TUNING`, eigener Export, weil `TUNING` nur Korrekturen je ID trägt).
6. **Anzeige:** Der Tooltip zeigt je Zusatz eine Zeile („Klebrig“: +3 Standfestigkeit), die Beschreibung und `describe()` (`info.numbers`, `live.affixes`) nennen dieselben Zahlen – alle aus dem gewürfelten Gegenstand abgeleitet, kein Handtext (E-25).

**Folgen für vorhandene Spielstände.** Bereits gefundene Teile bekommen beim Laden ggf. einen neuen Namen und 0–2 Zusätze. Kein Wert sinkt; der Zuwachs liegt im Rahmen von `maxGain`. Wer die Pools später ändert (Zusatz ergänzen, Stufenband verschieben), verschiebt die Auswahl per Modulo: Namen und Zusatzwerte vorhandener Teile können wechseln, das Grundbudget nie. IDs von Zusätzen stehen nicht im Spielstand.

**Bewusst offen.** Zusätze mit Effekt (Procs) statt nur Werten; eigene Grundteil-Varianten je Slot (mehr als ein Name pro Platz); Zusatz-Gewichte (seltene Zusätze) – heute sind alle passenden Zusätze gleich wahrscheinlich.

## E-42 · Gruppenspiel: Bedarf/Gier, geteilter Fortschritt, Gruppen-Buffs (21.09.2026)

**Auftrag des Nutzers:** „Zusammen ist besser" – gemeinsame Gegner, geteilte Quests in direkter Nähe, Beute für den, der sie findet, seltene Beute wird nach Bedarf oder Gier ausgewürfelt, gemeinsame Buffs.

1. **Beute:** Jeder Beteiligte behält seinen eigenen Beutel (gewöhnlich/ungewöhnlich, Marken, Material). Teile ab „Selten" (`BALANCE.party.rollRarities`) gehen in den Wurf, sobald ein Gruppenmitglied in Reichweite (1600) steht: Bedarf schlägt Gier, 1–100, 30 s Bedenkzeit, Schweigen = Passen, alle passen → Finder behält. Der Server würfelt (`server/game/party-play.mjs`); gewürfelte Teile reisen als Bauplan (`raw`) und werden beim Gewinner neu registriert. Reißt die Verbindung, fällt ein offenes Angebot an den Finder zurück.
2. **Quests:** Kill-Ziele zählen schon über `credit` (E-35) für die Gruppe in Reichweite. Neu: Sammelziele zählen für Gruppenmitglieder in Reichweite mit (`qshare` → `game.sharedGather`), ohne dass der Gegenstand kopiert wird.
3. **Buffs:** Der Klassenbuff wirkt zu 50 % (`BALANCE.party.buffShare`) auch auf Gruppenmitglieder in Reichweite – Schadensminderung, Schild, Heilung über Zeit; eigener Platz `game.partyBuff`, sichtbar in der Buffleiste mit Namen des Spenders.
4. **EP:** +5 % je Gruppenmitglied in Reichweite (`BALANCE.party.xpPerMember`, höchstens +20 %). Gruppe darf nie schlechter sein als allein.
5. **Bewusst nicht:** kein gemeinsamer Beutel/Plündermeister, kein Handel, kein serverseitiger Kampf (bleibt E-35). Der Server vertraut der Beute-Angabe des Finders wie beim Schaden; er säubert nur Form und Grenzen.

Offen für die nächsten Runden (Reihenfolge = Wert fürs Gruppengefühl): Heilung und Schutz auf Mitspieler zielen, Wiederbeleben, Handel, Gilde/Clan, Gruppen-Instanz (Kiosk zu fünft), Weltbosse mit Ansage im Weltchat.
**Bewusst offen.** Der Klassenwechsel innerhalb eines Spielstands (`switchMember`, Clan-Treff) existiert noch und widerspricht dem Slot-Gedanken; er sollte mit der Story-Überarbeitung entfallen. Feinere Gestaltung (Haare, Farben) braucht neue Grafik – Übergabe an die Grafik-Sitzung. Dialoge sprechen den Helden noch nicht überall mit Namen an.

## E-43 · Figur, Kniffe und Talente sind eigene Seiten mit eigener Taste (ändert E-27)

**Entschieden am 2026-09-21 vom Nutzer.** Die Figur-Seite trug Ausrüstung, Kniffe, Talente, Werte und Bande untereinander und war dadurch ein langer Scrollweg.

- Drei eigene Clanbuch-Seiten: **Figur [C]** (Ausrüstung, Werte), **Kniffe [P]** (wie das Zauberbuch im Vorbild; K bleibt als alter Griff), **Talente [N]**. Jede baut nur ihren eigenen Inhalt.
- Das Spielmenü liegt nur noch auf **Esc**; P gehört den Kniffen.
- Die **Bande** (Figurenwechsel im Spiel) entfällt: Helden wählt man am Anmeldebildschirm (E-38). Das Spielmenü führt dorthin.
- Spielmenü ohne „Clanbuch" am Desktop (Tasten und Dock reichen); auf Touch bleibt der Knopf, weil es dort keine Tasten gibt. Entwickler-Schaufenster (Effekt-Demo, Helden-Demo, Weltschmiede) liegen im Admin-Fenster statt in den Einstellungen.
- E-27 gilt weiter für: EIN Fenster, keine Seiten zum Blättern, Bude als Abschnitt der Aufträge.

## E-44 · Miteinander: Hilfsziel, Aufhelfen, Handel, Weltbosse (21.09.2026)

**Auftrag des Nutzers:** aus der Liste in E-42 die Punkte 1, 2, 3 und 6 bauen. Alles folgt dem Muster von E-35/E-42: der Server rechnet keinen Kampf, er prüft Nähe und Zustand, reicht weiter und sagt an (`server/game/social-play.mjs`, Client `net-social.js`).

1. **Heilung und Schutz auf Mitspieler:** Ein Gruppenmitglied wird per Klick auf seinen Gruppenrahmen (oder Rechtsklick → „Als Hilfsziel wählen") zum Hilfsziel. Die eigene Heilung wirkt dann zusätzlich in voller Höhe dort, der Klassenbuff in voller statt halber Stärke (Reichweite 420). Die eigene Wirkung bleibt unverändert – Helfen kostet nichts, „Zusammen ist besser".
2. **Aufhelfen:** Jeder Spieler darf jedem helfen, der am Boden liegt (Reichweite 140, Knopf im Gruppenrahmen oder Rechtsklick auf den Spieler). Der Gefallene steht an Ort und Stelle mit 35 % Leben (`BALANCE.party.reviveHp`) und 3 s Schonfrist wieder, ohne Heimweg.
3. **Handel:** Rechtsklick → „Handeln" (Reichweite 260), Anfrage annehmen, bis zu sechs Posten aus dem Rucksack plus Marken. Jede Änderung nimmt beide Zusagen zurück; erst zwei Zusagen schließen ab. Der Client prüft Platz und Bestand; fehlt beim Abschluss etwas, platzt der Handel auf dieser Seite ganz. Gewürfelte Teile reisen als Bauplan. Angelegte Ausrüstung ist nicht handelbar.
4. **Weltbosse:** Alle 30 min (erstmals 5 min nach Serverstart) erscheint je bewohnter Welt ein Boss aus `SOCIAL_RULES.boss.ids` an einem Lager, das alle Clients gleich bestimmen; Lebenspunkte = Boss × 4 × (1 + 0,75 je weiterem Spieler), Stufe +2. Ansage im Chat mit Himmelsrichtung, Sieg-Ansage mit den Namen der Beteiligten, Abzug nach 20 min. Die Lebenspunkte führt die geteilte Welt; jeder Beteiligte findet sicher ein seltenes Teil (in der Gruppe wird es nach E-42 ausgewürfelt). Weltbosse zählen nicht für Hauptquest und Erinnerungen.
5. **Bewusst nicht:** Der Server vertraut den Angaben der Clients (Heilmenge, Handelsgut) und kappt nur Form und Grenzen. Wer manipuliert, kann sich Gegenstände erschaffen – das gilt seit E-35 für Schaden und Beute genauso und ist erst mit serverseitigem Inventar lösbar.

Offen: Gilde/Clan, Gruppen-Instanz (Kiosk zu fünft), Freundesliste, Post/Auktionshaus, serverseitiges Inventar.

---

## E-45 · Begleiter: Söldner im Client des Besitzers, ein Baustein auch für Pets (21.09.2026)

**Auftrag (E. Ruf).** „Baue ein richtiges Söldner-System – das können wir auch für Pet-Logiken nutzen, wenn wir mal Klassen aufbauen, die einen dauerhaften Begleiter haben." Anlass: Gruppenspiel soll auch ohne vier Mitspieler funktionieren, besonders im nächsten Meilenstein „Dungeons".

**Entscheidung.**
1. **Begleiter leben im Client des Besitzers**, nicht als Bots am Server. Der Kampf rechnet im Browser (E-35); nur dort sind Gegner-KI, Zauber und Flächen bekannt, nur dort gibt es Instanzen. Begleiter-Schaden zieht Gegnern Leben ab und wird von `net-world.js` als Schaden des Besitzers gemeldet – der Server bleibt unverändert.
2. **Ein Baustein für Söldner und Pets** (`companions.js`, Daten in `content/companions.js`): Bedrohung je Gegner (`e.threat`, Zielwechsel bei +10 % wie am Server), Gegner-KI gegen Begleiter, Rollen-KI (Schutz, Heilung, Schaden), Befehle (folgen, warten, angreifen) und Haltungen (unterstützen, verteidigen, passiv). Fähigkeiten laufen allein über `kind`; neue Begleiter sind Daten.
3. **Zuverlässigkeit über Merkmale, nicht über Bosse:** Begleiter reagieren auf `ground` (Fläche verlassen) und `interruptible` (unterbrechen) in den Zauberdaten, mit fester Reaktionszeit. Neue Dungeon-Mechaniken bekommen ein Merkmal in `CAST_SETS` und eine Reaktion im Baustein.
4. **Balance-Rahmen:** Stufe des Spielers, 85 % der Stärke eines gleichstufigen Spielers, höchstens vier Begleiter und mit echten Mitspielern nie mehr als fünf Köpfe, kein EP-Abzug, Begleiter würfeln nie um Beute (E-42), keine Wertung in Ranglisten/Arena. Vertrag gegen Münzen, zwei Spielstunden.
5. **Bedienung zunächst über Chat-Befehle** (`/söldner`, `/entlassen`, `/befehl`, `/haltung`); das Schwarze Brett als Fenster, Gruppenrahmen und eigene Grafik sind UI-Aufträge.

**Verworfen.** *Bots am Server als Söldner* – sehen weder Zauber noch Instanzen, hängen an der Verbindung; bleiben als Dorfbewohner fürs Ambiente (Dienst `MertlochBots`, außerhalb des Repos). *Serverseitiger Kampf für Instanzen* – widerspricht E-35, zu groß für den Nutzen. *Boss-spezifische Skripte für Begleiter* – jeder neue Boss bräuchte Begleiter-Code.

**Konsequenzen.** `docs/BEGLEITER-2026-09-21.md` (Aufbau, Schnittstelle, Grenzen). Offen: Sichtbarkeit fremder Begleiter für Mitspieler (Weitergabe über den Server), `g.partyHumans` aus `net-party.js`, Fenster/Gruppenrahmen/Grafik, Balancing-Erstlauf, Merkmale für Dungeon-Mechaniken, Pets als Klassenmechanik. Aufträge in `docs/backlog/ui.md`, `engine.md`, `balance.md`, `gameplay.md`, `klassen.md`. IDs `merc-*` stehen in Spielständen.

## E-46 · Leistung: Weltdichte folgt dem Bildschirm, Licht als eine normale Überlagerung (21.09.2026)

**Anlass.** Nutzer: „läuft nicht mehr flüssig, gerade im Kampf“. Messung (2024×900, Rechner ohne Grafikkarte, Kampf gegen 6 Keiler, Licht an): 12 FPS, schlechtestes Bild 94 ms. Spiellogik 0,3 ms – der Engpass war allein das Bild.

**Entschieden.**
1. **Weltdichte = Zoom × Gerätepixel, mindestens 2, höchstens 4** (`worldDensity` in `art-quality.js`). Vorher fest 4: 4040×1792 Canvas-Pixel für 2020×896 Bildschirmpixel. Zeichenzeit 23 → 10 ms. Die Grafik bleibt in Dichte 4; Einstellung „Volle Grafikauflösung“ (`settings.fullRes`, Standard aus) erzwingt sie.
2. **Lichtschicht ohne `mix-blend-mode`** (ändert die Technik von E-39, nicht das Bild): statt zwei Ebenen (multiply + screen) EINE normale Alpha-Ebene – Dunkel und Wolken überdecken, Lichtquellen stanzen aus (`destination-out`), Schein liegt obenauf. Blend-Modi zwangen den Compositor, je Bild den Hintergrund zurückzulesen. Umrechnung Multiplizierfarbe → Deckfarbe in `cover()` (`world-light.js`); neue Werte `clouds.tint`, `glow.cover` in `content/lighting.js`.
3. **FPS-Anzeige** (`fps-meter.js`, `settings.fps`) als Messwerkzeug für Spieler und Sitzungen.

**Ergebnis.** Gleiche Szene: 32 FPS (Obergrenze des Messrechners, 30 % Leerlauf), schlechtestes Bild 31 ms. Vergleichsbilder `visual-review/performance/licht-vorher-*.png` / `licht-nachher-*.png`. Nachmessen: `scripts/perf-profile.playwright.js` (CPU-Profil Kampfszene).

**Verworfen.** *Farbabstimmung in die Grafik backen* – der CSS-Filter kostet nach (1)+(2) nichts Messbares mehr. *Schatten statischer Objekte zwischenspeichern* – 2,3 ms, lohnt den Aufwand erst, wenn echte Geräte es zeigen.

**Falle.** `restore()` in `drawContentPerson` führt jedes CPU-Profil an (≈25 %): dort rastert der Browser das aufgezeichnete Bild, die Figuren selbst kosten ≈3 ms. Nicht die Figuren optimieren, sondern die Pixelmenge.

## E-47 · Effektschicht auf der Grafikkarte: Wetter, Druckwellen, Flimmern, Bloom, Partikel (21.09.2026)

**Anlass.** Nutzerfrage „Umstieg auf three.js für mehr Effekte, Interaktivität und Immersion?". Vier lauffähige Prototypen (`proto-renderer.html`, `docs/RENDERER-PROTOTYPEN-2026-09-21.md`): A Canvas 2D ausbauen, B WebGL-Schicht über dem fertigen Bild, C three.js mit Sprites als Tafeln, D Live-3D. **Der Nutzer hat B gewählt** („Baue auf B auf"). Mobile ist für diese Entscheidung vorerst nicht maßgeblich.

**Entscheidung.**
1. **Der Canvas-2D-Renderer bleibt.** Eine zweite Leinwand (`world-fx.js`, WebGL2, keine Bibliothek) liegt direkt über der Weltfläche, unter den Licht-Ebenen aus E-39 und unter dem HUD; Klicks gehen durch. `renderer.draw()` ruft sie als Letztes auf, weil sie das fertige Weltbild als Textur nimmt.
2. **Was die Schicht zeichnet:** Druckwellen, die das Bild ringförmig verzerren (aus `game.fx`: Treffer, Ausbruch, Unterbrechung, Tod sowie die Kniffe `slam`, `detonate`, `keg`); Hitzeflimmern über Lagerfeuern und Brandflächen; Bloom; Bodennebel, der mit dem Dunkelanteil des Gebiets wächst; Regenschauer mit Wetterleuchten nach der Spielzeit; Funken und Glühwürmchen als Partikel, die vollständig im Vertex-Shader laufen.
3. **Nichts doppelt:** Schatten, Lichtschicht, Randabdunklung und Farbabstimmung bleiben bei `world-light.js` (E-39). Die Schicht liest dessen Dunkelanteil (`light.dark`) und Lichtquellen (`light.sources`) und übernimmt den CSS-Filter der Weltfläche.
4. **Reine Darstellung:** Die Schicht liest Spielzustand, würfelt nichts, ändert nichts am Kampf. Wetter ist eine feste Funktion der Spielzeit (`weatherAt`) – gleich für alle, prüfbar ohne Browser.
5. **Drei Stufen:** `voll` (mit Weltbild-Textur) · `leicht` (durchsichtige Überlagerung: nur Nebel, Regen, Partikel) · `aus`. Kostet die Schicht im Mittel mehr als `guard.budgetMs` je Bild, fällt sie nach `guard.window` Bildern von selbst auf `leicht`. Ohne WebGL2, bei Shader-Fehler oder verlorenem Grafikkontext: `aus`, das Spiel läuft unverändert weiter.
6. **Abschaltbar:** Hilfe → Einstellungen → „Wetter & Effekte" (`settings.fx`, Standard an), unabhängig von „Licht & Schatten".
7. **Diagnose zuschaltbar:** `?fx=debug` blendet Stufe und Kosten ein, `?fx=voll|leicht|aus` erzwingt eine Stufe (kombinierbar), `window.mertloch.state().fx` liefert denselben Stand. `proto-b.html` ist die Demo der echten Schicht und löst Druckwelle, Feuer, Dunkelheit und Schauer gezielt aus.

Alle Zahlen stehen in `content/world-fx.js`. Tests: `tests/world-fx.test.mjs`.

**Verworfen.** C (three.js-Renderer, 2–3 Wochen, alle Rollen warten, Grafik nur aus einer Blickrichtung brauchbar) und D (Live-3D, Monate, gesamte Pixelgrafik entfällt; widerspricht E-10 und E-30). three.js bleibt Werkzeug der Pre-Render-Werkstatt.

**Bewusst offen.** Die Kosten der Weltbild-Textur sind nur mit Software-Grafik gemessen (dort ~40–50 ms, deshalb der Selbstschutz); seit E-46 folgt die Weltleinwand der Bildschirmauflösung (Dichte 2–4), die Textur ist damit höchstens bildschirmgroß – nur „Volle Grafikauflösung“ (`settings.fullRes`) macht sie wieder groß. Auf echter Hardware mit `?fx=debug` nachmessen. Druckwellen verzerren auch die Beschriftungen, die auf der Weltfläche liegen. Wetter hat keine Spielwirkung und keinen Ton. Der Kiosk-Innenraum bekommt keine Effekte.

## E-48 · Leistung II: Selbstschutz der Effektschicht misst das Bildtempo, Raster-Index für ruhende Weltobjekte (21.09.2026)

**Anlass.** Nutzer nach E-46/E-47: „Im Kampf und mit Animationen sinkt die FPS schon mal.“ Profil der Kampfszene: eigenes JavaScript ≈ 5 ms je Bild und breit verteilt (kein Einzelposten > 0,6 ms); Layout/Style ≈ 1,5 ms. Auffällig war die neue Effektschicht (E-47): Stufe `voll` lädt je Bild das Weltbild als Textur und baut Mipmaps (hier 19–24 ms), der Selbstschutz griff bei niedrigem Tempo erst nach > 20 s – und er sah nur CPU-Zeit, keine Grafikkarten-Last.

**Entschieden.**
1. **Selbstschutz ergänzt E-47 (Nr. 5):** zusätzlich zum CPU-Budget zählt das echte Bildtempo – liegt der mittlere Bildabstand in Stufe `voll` über `guard.slowMs` (22 ms ≈ unter 45 FPS), fällt die Schicht auf `leicht`. Budget 7 → 4 ms, Fenster 120 → 60 Bilder. Pausen (> 250 ms) zählen nicht, `?fx=voll` bleibt erzwungen.
2. **Raster-Index** (`spatial-index.js`): Bäume, Props, Gebäude, Anwesen kommen je Bild aus den berührten 512er-Zellen (≈ 35 statt 3.324 Bäume) statt aus der ganzen Karte; Listenreihenfolge und genaue Sichtprüfung bleiben. Neuaufbau bei anderer Liste/Länge oder nach 2 s.
3. **Lichtquellen je Bild nur einmal** bestimmen (Lichtschicht und Effektschicht teilen das Ergebnis).
4. **FPS-Anzeige nennt die Effektstufe** („Effekte voll/leicht/aus“), damit sichtbar ist, wann der Selbstschutz gegriffen hat.

**Offen.** Messrechner hat keine Grafikkarte und war bei der Messung zu 94 % ausgelastet – absolute Zahlen fehlen. Entscheidend ist die Rückmeldung vom echten Gerät: FPS/ms/Stufe im Kampf, jeweils mit „Wetter & Effekte“ an und aus.

## E-49 · Leistung III: 60 Bilder auch ohne Grafikkarte – Boden-Zwischenspeicher, Sprites in Zieldichte, Leistungsautomatik (21.09.2026)

**Anlass.** Nutzer: „auch ohne gute Grafikkarte und ohne Effekte stabil bei 60 FPS“. Prüfstand ist der Entwicklungsrechner (keine Grafikkarte, Software-Rendering), Kampf gegen 6 Keiler, 2024×900, Effektschicht aus. Ausgang nach E-46/E-48: Zeichnen 25 ms, Hauptfaden 49 ms je Bild, ~21–30 FPS.

**Befund.** Ohne Grafikkarte zählt, wie viele Pixel je Bild skaliert oder gemischt werden – nicht der eigene Code (< 1 ms Logik). Teuer waren: Bodenkacheln und Sprite-Zwischenbilder, die fest in Dichte 4 lagen und je Bild mit Pixelauslassung verkleinert wurden; ~30 geschert gezeichnete Schattenrisse plus bildschirmgroße Schattenebene je Bild; der CSS-Farbfilter über die ganze Weltfläche (im Software-Compositor teurer als das gesamte Zeichnen: 31 → 50 FPS ohne ihn).

**Entschieden.**
1. **Boden-Zwischenspeicher** (`ground-cache.js`): Boden, Steine und die Schatten stehender Objekte (Bäume, Gebäude) liegen in einer Ebene in Zieldichte, etwas größer als der Ausschnitt. Je Bild eine Kopie; läuft die Kamera aus dem Rand, wird verschoben und nur der neue Streifen gezeichnet (kein Vollaufbau, kein Ruckler). Neuaufbau bei Licht-Schalter, Dichtewechsel, anderer Objektzahl, nach 20 s oder 1 s nach fehlender Grafik.
2. **Figuren-, Möbel- und Beuteschatten direkt auf die Welt** statt über eine bildschirmgroße Zwischenebene. Ändert E-39 im Detail: Überlappen zwei dieser kleinen Ellipsen, wird es dort etwas dunkler; die Ein-Ebenen-Regel gilt weiter für die großen Schatten (jetzt im Boden-Zwischenspeicher). Blumen wiegen weiter je Bild und liegen dadurch über statt unter dem Schatten.
3. **Sprites in Zieldichte** (`scaledFrame`/`contextScale` in `art-quality.js`, `drawMaifeld`, `drawContentPerson`): einmal hochwertig auf die Zielgröße verkleinert, danach 1:1 kopiert. Schneller und feiner als die Pixelauslassung seit E-46.
4. **Lichtebene nur jedes zweite Bild** neu (Dunkel, Wolken, Schein ändern sich langsam).
5. **Leistungsautomatik** (`quality-governor.js`, Werte `content/performance.js`, Einstellung „Auflösung automatisch anpassen“, `settings.autoRes`, Standard an): hält der Rechner im Mittel keine ~52 FPS, fällt zuerst der Farbfilter weg, dann sinkt die Dichte der Weltfläche stufenweise bis 1 (scharf vergrößert, `image-rendering: pixelated`). Aufwärts nur nach 30 s gutem Tempo mit wenig eigener Rechenzeit; nach zwei gescheiterten Versuchen bleibt die Stufe. „Volle Grafikauflösung“ schaltet die Automatik ab. Die FPS-Anzeige nennt die Stufe („ohne Farbfilter · Auflösung 1/2“).

**Ergebnis (gleiche Szene, gleicher Rechner).** Bei unveränderter Dichte 2: Zeichnen 25 → 7 ms, Hauptfaden 49 → 21,5 ms. Mit Automatik: nach ~4 s **stabil 60 FPS bei 4–5 ms Rechenzeit** (ohne Farbfilter, Dichte 1). Rechner mit Grafikkarte bleiben bei voller Darstellung. Bild vor/nach: `visual-review/performance/` (`licht-e49-04.png`, `e49-auto.png`, `e49-dichte2-sprites.png`).

**Bekannte Abstriche der untersten Stufe.** Kleine Ortsbeschriftungen in der Welt werden bei Dichte 1 schlecht lesbar; Farben etwas flacher ohne Filter.

**Verworfen.** *Farbabstimmung in die Grafik backen* – träfe nur Teile des Bildes (Boden, Sprites), Gebäude und Effekte blieben ungefiltert. *Zwischenstufe Dichte 1,5* – krumme Vergrößerung verwäscht Pixelgrafik.

**Messen.** `scripts/perf-ab.playwright.js` (A/B je Kostenposten, Hauptfaden-Zeit über CDP – FPS allein täuscht wegen Bildwiederholrate) und `scripts/perf-profile.playwright.js`. Falle: Das Browser-Profil schreibt das Rastern des ganzen Bildes dem `restore()` in `drawContentPerson` zu.

## E-50 · Leistung IV: Bildrate ohne Grafikkarte auch bei voller Auflösung, Reiten ohne Hänger (22.09.2026)

**Anlass.** Nutzerauftrag „Performance-Check und weiter optimieren“. Prüfstand wie E-49: Rechner ohne Grafikkarte (SwiftShader), 2024×900, Kampf gegen 6 Keiler. Neu gemessen wird mit Chrome-Trace je Thread (`scripts/perf-trace.playwright.js`), weil FPS und eigene Rechenzeit allein täuschen: Die Remote-Sitzung wechselt zwischen 30 und 60 Hz (Referenz: leere Seite), und Rastern/Zusammensetzen läuft außerhalb des eigenen Codes.

**Befund.** (1) Zwei bildschirmgroße Flächen je Bild: eine Hintergrundfüllung unter dem Boden-Zwischenspeicher (überflüssig) und ein diagonaler Verlauf mit 3–7 % Deckkraft (seit 0.1) – zusammen ~7 ms Rastern auf dem Hauptfaden. (2) CSS-Farbfilter: ~10 ms je Bild im Compositor, ohne ihn keine 60 Bilder. (3) Die leichte Stufe der Effektschicht (E-47) zeichnete jedes Bild eine leere WebGL-Vollfläche – in Software ~25 FPS. (4) Beim Laufen/Reiten: eine neue Bodenkachel kostet ~100 ms auf einen Schlag (seit jeher), alter Stand beim Reiten 13 FPS im Median. (5) Die Automatik aus E-49 hielt einen 30-Hz-Bildschirm für „zu langsam“ und senkte bei einzelnen Hängern (Aufbau der ersten Sicht) die Auflösung. (6) Die „ms“ der FPS-Anzeige und der Automatik zählten die Wartezeit vor dem Bildaufruf mit.

**Entschieden.**
1. Hintergrundfüllung entfällt; der Schimmer-Verlauf (`LIGHTING.sheen`) liegt bei Licht in der Lichtebene (einmal gerechnet, vom Compositor gemischt).
2. **Ohne Grafikkarte** (`gpu-info.js`, erkannt am WebGL-Renderer; `?render=soft|gpu` erzwingt): Farbabstimmung wird in Bodenkacheln, Sprites und Kleinbilder **eingebacken** (`bakedGrade` in `art-quality.js`) statt als CSS-Filter; Effektschicht startet leicht, rechnet in halber Auflösung (`WORLD_FX.softScale`). Mit Grafikkarte bleibt alles wie bisher. Abweichung eingebacken ↔ CSS-Filter: 0,45 % der Pixel deutlich (Schatten minimal heller), Bilder `visual-review/performance/farbe-css-gegen-eingebacken-*.png`.
3. Effektschicht verbirgt sich, solange sie nichts zu zeigen hat (kein Nebel, Regen, Blitz, keine Funken/Glühwürmchen) – gilt auch mit Grafikkarte.
4. **Bodenkacheln vorausladen** (`terrain-prefetch.js`): in 8×8 Stücken (pixelgleich zur ganzen Kachel), im Leerlauf des Browsers (`requestIdleCallback`), nach Nähe zum Sichtrand in Laufrichtung; wird eine Stelle vorher gebraucht, entstehen nur die Stücke darunter. Fehlt Leerlauf drei Bilder lang, baut jedes Bild ein dringendes Stück.
5. **Automatik**: regelt auf den geschätzten Bildschirmtakt (10-%-Quantil der Bildabstände), höchstens 60 Hz – außer die eigene Rechenzeit füllt schon die Hälfte davon (dann Überlast, `busyShare`); Tempo als Mittel ohne die langsamsten 10 % (einzelne Hänger zählen nicht); Hochschalten schon bei Rechenzeit unter halbem Takt. Rechenzeit ab Beginn des Aufrufs.
6. Blumen und Sammelkräuter als Kleinbilder (`drawVectorSprite`): statt ~1.200 Formen je Bild ein Kopierbefehl je Pflanze, pixelgleich auf dem Halbpixel-Raster; fünf statt stufenloser Wiegestellungen.

**Ergebnis (ohne Grafikkarte, 60-Hz-Bildschirm, Standardeinstellungen).** Kampf bei Tag: **stabil 60 FPS bei voller Auflösung** (vorher 48, ohne Filter 54), eigene Rechenzeit 5–7 ms. Kampf bei Nacht mit Nebel/Glühwürmchen: 46–52 FPS bei Dichte 2 (die Effektschicht bleibt der Engpass; die Automatik geht seit der Weltgrafik-Korrektur vom 22.09. nicht mehr unter Dichte 2, „Wetter & Effekte“ aus = 60). Reiten (244 Einheiten/s, frische Gegend): geradeaus 57 FPS, kein Bild über 50 ms; schräg 56 FPS, kein Bild über 100 ms (alter Stand: 13–14 FPS, Median 67 ms, Hänger bis 450 ms).

**Verworfen.** *`desynchronized`-Leinwand* – spart die Übergabe, verschiebt die Arbeit aber nur (Hauptfaden 54 → 73 %). *CPU-Leinwand (`willReadFrequently`)* – kein Unterschied. *Statische Objekte in den Boden-Zwischenspeicher* – nur ~2 ms, Verdeckung mit Figuren wäre aufwendig. *Bodenkacheln im Web Worker* – `terrain.js` hängt an Texturen und Weltgeometrie; lohnt erst, wenn Vorausladen nicht reicht.

**Offen.** Nachts ohne Grafikkarte hält die Effektschicht (Nebel, Glühwürmchen) keine 60 Bilder; Messungen zur Effekt-Auflösung (`softScale`) waren wegen wechselnder Bildschirmrate der Remote-Sitzung nicht belastbar; ohne `requestIdleCallback` (Safari) läuft nur der dringende Weg. Messskripte: `scripts/perf-trace.playwright.js`, `perf-ab.playwright.js`, `perf-compare.playwright.js`.

## E-51 · Grafik wird direkt aus der bauenden Sitzung angefordert (23.09.2026)

**Anlass.** Nutzerfrage: „Für die Grafikpipeline nutzen wir aktuell imagegen von Codex. Die Grafikübergaben machen wir dateibasiert als Anweisungen. Kriegen wir es direkt eingebunden?“ Bisher: Bestellung in `docs/UEBERGABE-GRAFIK-<Datum>.md`, Bilder in einer zweiten Sitzung (Codex) erzeugt, PNGs zurückgelegt, danach Export und Anbindung. Jede Prompt-Korrektur kostete einen Sitzungswechsel.

**Befund.** Die Codex-CLI liegt lokal (0.155.0-alpha.16.3), angemeldet über das ChatGPT-Abo (`auth_mode: chatgpt`, kein API-Schlüssel), Feature `image_generation` stabil und an. `codex exec` erreicht den Bildskill auch nicht-interaktiv. Zwei Stolpersteine: die Kopie unter `~/.codex/.sandbox-bin` bringt `codex-code-mode-host.exe` nicht mit (Werkzeugaufruf bricht ab), und `--image` ist variadisch (schluckt ohne Gleichheitsform den Prompt).

**Entschieden.**
1. `tools/sprite-pipeline/imagegen.mjs` (`npm run sprites:generate -- <jobs.json>`) fordert je Auftrag genau ein Bild an und legt das **unveränderte Original** unter `job.output` ab. Auftragsblatt bleibt das bestehende Format (`grafik-20260923-jobs.json`).
2. Der Agent läuft in Sandbox `read-only` und darf nur erzeugen: kein Kopieren, kein Skalieren, kein Nachbearbeiten. Das Werkzeug holt die Datei selbst aus `~/.codex/generated_images/` und kopiert sie. Grund: sonst bearbeitet die Sitzung das Bild eigenmächtig nach, und das Original ist nicht mehr das Original.
3. Zuschnitt, Palette, Alpha und Laufzeitkatalog bleiben unverändert bei `npm run sprites:precision`; die Byte-Reproduzierbarkeit aus `tests/art-precision.test.mjs` gilt weiter.
4. Herkunft wird automatisch nach `assets/precision/generation.json` geschrieben (Prompt, Referenzen, `tool: "built-in imagegen"`, `via: "codex exec <Version>"`, Original-Dateiname, SHA-256). Vorhandene Ausgaben werden ohne `--force` übersprungen.
5. `docs/UEBERGABE-GRAFIK-<Datum>.md` bleibt die Bestellung (was fehlt, warum, wie angebunden) und `docs/GRAFIK-LIEFERUNG-<Datum>.md` die Abnahme. Entfallen ist nur die zweite Sitzung dazwischen.

**Konsequenz.** Die Grafikrolle in `docs/PIPELINE.md` ist keine externe Handübergabe mehr: Prompt schreiben, Bild anfordern, Bild ansehen, Prompt schärfen läuft in einer Runde. Anleitung und Fallen: `docs/BILDPIPELINE-DIREKT-2026-09-23.md`.

**Verworfen.** *OpenAI-Images-API mit eigenem Schlüssel* – wäre planbarer und deterministischer, kostet aber getrennt von dem Abo, das ohnehin bezahlt ist. *Bilder weiter in einer Codex-Sitzung erzeugen lassen und nur den Aufruf automatisieren* – hätte die Nachbearbeitung durch den Agenten und damit die unklare Herkunft beibehalten.

**Offen.** Der Weg hängt daran, dass eine vollständige Codex-Installation lokal erreichbar ist (heute die VS-Code-Erweiterung `openai.chatgpt-*`; sonst `CODEX_BIN` setzen) – auf GitHub Actions läuft er nicht und soll es auch nicht. Das Bildmodell nennt sich nicht; gleicher Prompt liefert nicht dasselbe Bild.

## E-52 · Die Bude als erstes begehbares Haus im Echtmaßstab (23.09.2026)

**Anlass.** Nutzerauftrag: „Aktuell sind alle Charaktere fast so groß wie die Gebäude … anpassen, damit man in Gebäude reingehen kann, dort verschiedene Räume erkennen kann“, die Bude soll zur Startkneipe werden, „dass man dort startet und sich am Anfang zurechtfindet und NPCs findet“. Nach dem Konzept-Mockup (`docs/konzept-bude-2026-09-23/`): „Erst die Bude“, Innenraum „nahtlos“, Grafik „gemaltes Haus in Ebenen“; „wenn wir mit unseren Sprites an die Optik und Detailgrad rankommen würden, wäre das hervorragend“.

**Befund.** Die Karte rechnet mit 8 Welteinheiten pro Meter, der Held ist 26 E hoch (3,25 m), Türen 35 E (1,35-fache Heldenhöhe), Wände 62 E (ein Geschoss). Die Bude ist kein Haus, sondern ein Grundstück 156 × 110 E mit Trümmer-Requisiten von 20–45 E. Das Intro sagt „Du wachst in den Trümmern einer Clan-Bude auf“, der Held erscheint aber auf dem Kirchvorplatz.

**Entschieden.**
1. **Pilot statt Weltumbau.** Nur die Bude wird im Echtmaßstab gebaut: 14,4 E je Meter, also 1,80 m für die 26-E-Figur. Grundriss 16 × 12 m = 230 × 173 E, sechs Räume (Schankraum, Hinterzimmer, Pfandlager, Küche, Klo, Hof hinter der Hintertür). Das übrige Dorf bleibt vorerst in seinem Maßstab (Variante C im Konzept); der Weltumbau (Variante A, 14,4 E/m überall) wird nach dem Pilot entschieden.
2. **Nahtlos auf der Dorfkarte.** Gleiche Karte, gleiche Koordinaten: Wände und Türöffnungen sind Kollision, das Dach blendet aus, sobald die eigene Figur drinnen steht. Online sieht man die anderen drinnen. **Revidiert E-34 für die Bude** (dort: begehbares Dachmodell auf der Dorfkarte verworfen); der Kiosk bleibt eine eigene Instanz.
3. **Gemaltes Haus in Ebenen.** Die Bude wird als großes Bild in der Spielkamera erzeugt (E-51) und in Ebenen gelegt: Außenansicht mit Dach, Innenansicht mit auf Hüfthöhe geschnittenen Wänden. Räume, Wände, Türen, Möbelkollision und NPC-Plätze stehen als Daten in `content/`, nicht im Bild. Figuren bleiben die bestehenden 104-px-Präzisionssprites.
4. **Start in der Bude.** Neue Helden wachen im Schankraum auf; Ida und die Mentoren stehen in den Räumen der Bude.

**Reihenfolge.** Runde 1: Grundriss als Daten, Kollision, Dach-Ausblenden, NPC-Plätze, Start (mit schlichter Platzhalterzeichnung). Runde 2: gemalte Ebenen anbinden. Runde 3: Tutorialweg durch die Räume, Basisbau-Stufen in den Räumen.

**Verworfen.** *Figuren schrumpfen (Variante B)* – gleiches Bild wie A, aber die ganze Kampf- und Laufabstimmung müsste neu gerechnet werden. *Eigene Instanz wie der Kiosk* – einfacher, aber drinnen allein und ein harter Schnitt beim Eintreten. *Baukasten aus Wand-, Boden- und Möbelteilen* – flexibler für spätere Häuser, erreicht aber schwerer die Geschlossenheit (Licht, Schmutz, Übergänge) der Mockups.

**Offen.** Laufwege und Leistung bei Variante A; wie Figuren hinter hohen gemalten Möbeln verdeckt werden (Runde 2: hohe Möbel als eigene Sprites mit Tiefensortierung); Basisbau-Stufen (heute Requisiten auf dem Grundstück) als Möbel in den Räumen.

**Stand 23.09.2026.** Runde 1a (Haus, Kollision, Dach-Ausblenden), 1b (Start im Schankraum, Ida und Mentoren in ihren Räumen, Hofprobe in Schankraum und Hof, Bude zählt als Clan-Treffpunkt) und 2 (gemalte Ebenen, `docs/GRAFIK-LIEFERUNG-2026-09-23-bude.md`) sind umgesetzt. Wer stirbt, steht weiterhin am Kirchvorplatz auf; der Kirchvorplatz bleibt Treffpunkt und Dorfmitte.

## E-53 · Fünf Werte mit klarer Wirkung, Vergleich über Wirkungen, Rucksack mit Filtern (23.09.2026)

**Anlass.** Nutzerauftrag: „Inventarsystem weiter aufbauen, Polishing, Filtereinstellungen, den Vergleich optimieren – und die Stats reduzieren, dass sie eindeutiger beschreiben, was sie machen: jeder Stat beeinflusst ein, zwei, maximal drei Sachen.“

**Befund.** Acht Werte, stark verflochten: Wumms und Bastelgrips wirkten auf je fünf Dinge (Schaden, körperlicher bzw. technischer Zusatzschaden, Heilung, Deckung, Rüstung bzw. Randale), Handschrift auf vier unzusammenhängende (Markierungen, Spezialkniff, Heilung, Deckung), Taktgefühl zählte zusätzlich als Glückstreffer- und Drehzahl-Wertung. Schaden hing an drei Werten, Heilung und Deckung an je drei. Die Physisch/Technisch-Aufteilung im Schaden war zwischen Engine und Beschreibung uneinheitlich. Vier Stellen beschrieben Handschrift unterschiedlich. Der Vergleich summierte rohe Werte 1:1 (Dicke Haut dominierte), ignorierte das Waffentempo, verglich Ringe/Schmuck immer mit Platz 1 und wurde im Tooltip beim Überfahren entfernt.

**Entschieden.**
1. **Fünf Werte, jede Mechanik an genau einem:** Standfestigkeit → Leben · Wumms → Schaden aller Angriffe und Kniffe · Taktgefühl → Glückstreffer-Chance und Tempo · Bastelgrips → Heilung, Deckung, Randale-Nachschub · Dicke Haut → erlittener Schaden. Textquelle `STAT_EFFECTS` (`content/equipment.js`), Zahlen `BALANCE.ratings`/`BALANCE.power`, Glossar daraus berechnet. E-02 bleibt: jeder Wert hilft jeder Klasse.
2. **Umrechnung ohne Spielstand-Migration:** Werte-Schlüssel stehen nicht im Spielstand (gewürfelte Teile werden aus sechs Rohdaten abgeleitet, E-40). Handgebaute Teile: Wertungspunkte ÷ 1,3 als Taktgefühl (Glückstreffer, Drehzahl) bzw. Bastelgrips (Handschrift); zwei Teile auf das Schema-Budget gekürzt (hausordnung, horststempel). Zusätze: Anteile gleich umgeschlüsselt. Gewürfelte Teile tragen statt der Wertung einen zweiten Hauptwert (`secondaryShare` 0,6).
3. **Vergleich über Wirkungen:** `gearComparison`/`upgradeVerdict` (`rpg.js`) rechnen Leben, Schaden, Glückstreffer, Tempo, Waffe je Sekunde, Heilung, Deckung, Randale und Schadensminderung vorher/nachher; Gewichte je Klasse in `GEAR_COMPARE` (Tank: Leben und Schutz voll, Heilerin: Heilung voll). Bei zwei Plätzen zählt ein freier, sonst der lohnendste; ein zweites Exemplar eines getragenen Rings bekommt eine Einschätzung; eine Einhandwaffe verdrängt keinen Schild (Parade hat keine Wirkungszahl).
4. **Anzeige:** Tooltip nennt jeden Wert mit Wirkung („+8 Wumms · Schaden +7,2 %“) und den Vergleich wieder beim Überfahren: Ursache („Werte: −1 Wumms · +8 Taktgefühl“) plus Wirkungs-Chips statt einer einheitenlosen „Wertung“. Figur → Werte zeigt je Wert, was er gerade bewirkt, dazu Waffenschaden je Sekunde; „Schadensbonus“ und „Schutz“ als Doppelungen entfernt.
5. **Rucksack:** Filter Alles · Ausrüstung · Besser · Verpflegung · Material; Reihenfolge Art · Güte · Stufe · Name · Verbesserung zuerst (Auswahl sortiert sofort); Suche findet Art, Güte, Wertnamen und Wirkungen auf Deutsch; Filter und Reihenfolge merkt sich der Browser (`mertloch-bag-view`); „N/24 Plätze“; Meldung nach dem Anlegen. Texte in `BAG_UI` (`content/panel-ui.js`).

**Folgen.** Vorhandene Teile zeigen beim nächsten Laden die neuen Werte; die E-40-Zusage „kein Wert sinkt“ gilt hier nicht wörtlich, weil drei Werte entfallen – die Umrechnung hält das Budget. Balance-Bericht: Auffälligkeiten 127 → 82 (zäh 10 → 4, zu schnell 26 → 24, trivial 87 → 51, manchmal Tod 3 → 2); Feldkämpfe im Median Dieter ±0 %, Bärbel +13 %, Kevin +9 % länger; Bosse auf eigener Stufe bleiben im Korridor.

**Verworfen.** *Sechs Werte (Glückstreffer und Tempo getrennt, Taktgefühl gestrichen)* – bricht die Spec-Profile „Tempo & Präzision“ und die drei E-02-Namen, ohne klarer zu werden. *Wertungen behalten, nur besser beschriften* – löst die Verflechtung nicht. *Vergleich weiter über rohe Werte mit festen Gewichten je Wert* – bleibt blind für Waffentempo, Kappen und Klasse.

**Offen.** Playtest Kenner (`docs/PLAYTEST-2026-09-23-kenner.md`): frei mit Auflagen; Hofprobe 5/8 und stumme Clankiste siehe `docs/backlog/gameplay.md`/`ui.md`.

## E-54 · Sprite-Baukasten mit vererbten Regeln statt gemalter Hausbilder; Obergeschoss (23.09.2026)

**Anlass.** Nutzerauftrag: „Baue auf einzelne Sprites um, die du selbstständig platzieren kannst, um eigene Welten und Gebäude und Innenleben aufzubauen. Definiere Regeln, welche Spritearten wo anzubringen sind, z. B. Wände, wo auch nur Wandaccessoires platziert werden. Mit solchen Regeln kommt auch dazu, wo man drübergehen kann und wo nicht … gezielt perfekte Welten gestalten, mit hohem Detailgrad und automatisch vererbten Eigenschaften der einzelnen Sprites.“ Außerdem: Die Bude ist außen zweigeschossig, innen war nur ein Stockwerk abgebildet.

**Entschieden.**
1. **Baukasten statt gemalter Innenbilder.** Innenräume, Hof und Einrichtung setzen sich aus Einzel-Sprites zusammen. Jede Art erbt über `is` die Regeln ihrer Klasse (`content/sprite-kit.js`). Damit ist E-52 Punkt 3 revidiert, und die dort verworfene Alternative „Baukasten“ gilt jetzt.
2. **Regeln sind Daten, der Prüfer ist Code** (`world-kit.js`). Er prüft Belag je Raum, Wandschmuck nur an sichtbaren Wandfronten in deren Höhe, Möbel auf freiem Boden und nicht vor Türen, Sperrflächen ohne Überlappung, Tischdeko nur auf Ablagen, draußen/drinnen und Raum-Merkmale. `npm run kit:check` und Tests halten jede Szene regelkonform.
3. **Kollision, Wege und Zeichenebenen folgen aus den Arten.** Was nicht begehbar ist, sperrt mit seiner Standfläche. Es gibt keine zweite, handgepflegte Kollisionsliste.
4. **Wandfronten:** Waagerechte Innenwände zeigen 22 E (1,5 m) Front, auf ihr hängt der Wandschmuck. Die südliche Außenwand zeigt nur einen Sockel (8 E), damit man in die Räume sieht. Senkrechte Wände zeigen nur ihre Krone.
5. **Obergeschoss:**
   - Die Treppe an der Westwand des Schankraums bedient man mit F (hoch/runter).
   - Oben gibt es eine eigene Stockwerk-Welt für Kollision und Wege.
   - Online wird das Stockwerk mitgeschickt (`fl`). Sichtbar ist nur, wer auf dem eigenen Geschoss steht.
   - Oben gibt es keine Zielwahl und keine Gespräche mit Leuten unten. Gespeichert wird der Treppenfuß.
6. **Gemalt bleiben** die Außenansicht mit Dach und die Möbel der Basisbau-Stufen. Beides sind Einzel-Sprites im selben Stil. Die gemalten Innenebenen bleiben nur als Herkunft und Stilreferenz unter `sources/`.

**Verworfen.** *Gemaltes Haus in Ebenen weiterführen* – sieht geschlossen aus, lässt sich aber nicht gezielt umbauen oder auf weitere Häuser übertragen. Kollision und Bild müssen außerdem von Hand gleich gehalten werden. *Raster-Kacheln (feste Tile-Größe)* – einfacher zu prüfen, zwingt aber jedes Möbel auf ein Raster und passt nicht zu den Weltmaßen der Figuren.

**Offen.** Türen als eigene Sprites (heute offene Lücke). Außenansicht aus Fassaden- und Dachteilen. Weitere Häuser und Dorfteile aus dem Baukasten. Hohe Möbel, die Figuren dahinter verdecken, sind schon abgedeckt: Stehende Teile werden nach Tiefe sortiert.

## E-55 · Startreihe mit geführten Hotspots, Aushänge in der Welt, Aufträge auf der Karte (23.09.2026)

**Anlass.** Nutzerauftrag: „Baue weitere Quests und Questreihen für den Start auf. Ideal sind geführte kleinere Hotspots. Wenn die Quests an einem Hotspot erledigt sind, gibt es eine Quest, die zum nächsten Hotspot führt. Es kann noch sonstige zufällige Quests geben, die auf der Welt liegen. Quests auf der Weltkarte markieren, ähnlich World of Warcraft, wo man hin muss und in welchen Bereichen was spawnt. Statt nur Töten-Quests auch sammel X Teile von Monsterdrops mit Dropchancen.“

**Befund.** Neben der linearen Hauptkette gab es nur sechs Einzel-Nebenaufträge je Welt, ohne Reihen, Voraussetzungen oder Stufen; das erste Ziel lag 225 m vom Start. Neun Arten (Dachs, Gans, Rabe, Fuchs, Praktikant, freie Keiler und Ruhewarte, beide Elites) hatten keinen Auftrag. Die Karte zeigte Questgeber nur als Punkt am Treffpunkt, keine Zielgebiete. Die Weltgenerierung teilt einen Zufallsstrom: neue Einträge in `world.quests` hätten Bäume, Lager und Nebenaufträge verschoben.

**Entschieden.**
1. **Eigene Schicht statt Umbau:** `content/hotspots.js` (Inhalt) + `hotspots.js` (Lage, Tiergebiete, Fortschritt). Die Lage entsteht aus der fertigen Welt mit eigenem Zufall; `world.js`, Nebenaufträge und Kapitel-Lager bleiben unverändert (Test).
2. **Startreihe mit vier Hotspots:** Kirchhofwiese (Stufe 1: Dachse, Gänsefedern) → Grillwiese (2: Keiler, Borsten) → Leergutplatz am Kiosk (3: Rabenkronkorken, Ruhewarte) → Hopfengarten an der Wegestube (4: Füchse, Schnorrer-Bons) → zurück zu Kisten-Ida. Je Hotspot ein Kill- und ein Drop-Auftrag, danach eine Überleitung, die beim nächsten Geber abgegeben wird. Gebiete liegen 30–65 m vom Geber, die ersten beiden 65 und 113 m vom Start, mit ≥ 40 m Abstand zu Kapitel-Lagern.
3. **Eigene Tiergebiete:** Jeder Hotspot legt seine Tiere selbst an (`HotspotDirector`, wie das Feld-Ökosystem: Datensätze behalten Leben und Wiederkehr). Sie zählen wie Feldtiere nicht für Kapitel-Aufträge.
4. **Sammeln über Drops:** Questgegenstände (`quest:true`, unverkäuflich) fallen mit ihrer Chance nur, solange der Auftrag läuft, nach Erfüllung nicht mehr, und werden bei der Abgabe eingezogen. Der Dialog nennt die Chance.
5. **Aushänge:** drei Zettel in der Welt (Steckbrief Borsten-Bruno, Olafs Strafzettel, Formular 27b). F liest sie, der Auftrag läuft sofort, der letzte Treffer schließt ihn mit Belohnung ab; jeder hat ein eigenes Gebiet mit seiner Art.
6. **Karte wie im Vorbild:** Questgeber als goldene Marke mit „!“ (annehmen), „?“ (abgeben), „…“ (läuft), blass bei zu niedriger Stufe; Zielgebiete laufender Aufträge gefüllt, Tiergebiete freigeschalteter Hotspots gestrichelt mit Artnamen; Filter „Aufträge“, Legende, Ortsliste, Klick → Wegmarke. Die Minikarte zeigt Geber und Zielgebiete. In der Welt stehen die Geber mit „!“/„?“ über dem Kopf, Aushänge als Pfosten mit Zettel.
7. **Tracker, Wegmarke, Questbuch:** verfolgter Auftrag oben rechts mit Fortschritt und Belohnung; Wegmarke zum Zielgebiet bzw. zum Abgabe-Geber; Questbuch führt Startreihe und Aushänge unter Aktiv/Im Dorf/Erledigt.
8. **Hofprobe 5/8 hält niemanden fest:** Zwei Playtests (Kenner, Neuling) hingen am Ausweichen. Nachgestellt in der Engine: Ausweichen während des Kreises zählt immer, in der Pause zwischen zwei Kreisen nie – träge Reaktion oder Eingabeverzögerung reicht zum Hängenbleiben. Nach `TUTORIAL.maxDodgeTries` (4) verpassten Kreisen geht es mit einem Spruch weiter; die Startreihe liegt direkt dahinter.
9. **Keine doppelten Leute, F trifft den Geber:** Fast alle Dorf-NPCs vergeben auch Nebenaufträge. Jeder Hotspot nennt deshalb mehrere passende Geber (`givers`); je Welt steht der erste, der dort keine Nebenaufträge vergibt und kein Mentor ist (Seed 56753: Mara, Oskar, Jonna, Tilo). Texte nennen Namen über `{giver}`/`{next}`. Hotspot-Geber haben bei F Vorrang vor Stall, Laden, Brett und Nebenaufträgen. Playtests: `docs/PLAYTEST-2026-09-23-neuling.md`.

**Spielstand.** Neues Feld `hotspots:{quests:{[id]:{accepted,count,claimed}},found:[],tracked}`, weltunabhängig; unbekannte IDs fallen beim Laden heraus. IDs nach E-04 nie umbenennen.

**Folgen.** Die Startreihe bringt rund 1 420 EP, die Aushänge 740 – zusammen mit Kapitel 1 und den Nebenaufträgen steigt man schneller auf als bisher. Bewusst so gelassen, bis ein Playtest zeigt, ob Kapitel 2 dadurch zu leicht wird.

**Verworfen.** *Mehr Einträge in `world.quests`* – verschiebt über den gemeinsamen Zufallsstrom die halbe Welt und bricht die Festlegung „zwei Aufträge je Treffpunkt“. *Kill-Credit nur im Gebiet* – WoW zählt Arten, nicht Orte; das Gebiet ist Hilfe, keine Pflicht. *Drop-Materialien aus den Beutetabellen wiederverwenden* – dann zählten alte Vorräte und Verkäufe würden Aufträge leeren. *Spawn-Übersicht für alle Feldtiere* – deren Zellen entstehen erst in Spielernähe; die Karte zeigt die Gebiete, die das Spiel wirklich garantiert.
