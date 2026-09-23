# Charaktererstellung und Klassen mit Spezialisierungen · Brainstorm 2026-09-19, Abgleich 2026-09-23

Anlass: Auftrag „check mal alles und plane mal eine Charaktererstellung und verschiedene Klassen mit Specs". Die erste
Fassung (19.09., Commit a97f355) setzte auf [E-17](ENTSCHEIDUNGEN.md) und [E-32](ENTSCHEIDUNGEN.md) auf und wurde am
selben Tag zugunsten des Händlers zurückgestellt (E-34). Seitdem hat die Produktion drei Entscheidungen getroffen, die den
Kern berühren: **E-37** (offene Talentbäume nach WoW Classic), **E-38** (Heldenslots mit eigener Erstellung) und **E-43**
(Bande entfällt). Diese Fassung gleicht das Papier gegen `main` 0be33e8 ab: was gebaut ist, was anders entschieden wurde,
was noch trägt.
**Stand:** Brainstorm, nichts entschieden; Entscheidungen trifft die Produktion ([ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md)).

**Nummern.** Die Vorschläge E-34 bis E-40 der ersten Fassung sind überholt; diese Nummern sind inzwischen für andere
Entscheidungen vergeben. Vorschläge heißen hier **V-1 bis V-6**, die E-Nummer vergibt der Lead beim Eintrag.

**Kurzfassung.** Die Charaktererstellung gibt es: Heldenhalle vor dem Spiel, drei Schritte Klasse, Aussehen, Name,
mehrere Helden je Konto (E-38). Das Spec-Tor aus der ersten Fassung ist als Hauptbaum ab Stufe 5 umgesetzt, mit gesparten
Punkten und ortsfreier Erstwahl (E-37). Anders entschieden wurden Bühne, Name und Aussehen: statt „kein Bildschirm vor dem
Spiel, Dorfname, kein Aussehen" gibt es einen Startbildschirm, einen freien Namen und umfangreiche Aussehensoptionen.
Offen bleiben vor allem zwei Momente, die heute zu wenig erklären: der **Klassenschritt**, obwohl die Klasse jetzt je Held
endgültig ist, und die **Hauptbaum-Wahl auf Stufe 5**, die heute nur eine Logzeile ist. Dazu kommen neun offene Befunde,
darunter der alte Rausch neben der Deckel-Uhr und E-17, das in der Tabelle noch „gilt", obwohl E-38 den Klamottentausch
abgeschaltet hat. Aufwand: klein bis mittel, fast nur Inhalt und UI.

## 1 · Abgleich: was aus der ersten Fassung geworden ist

| Vorschlag 19.09. | Heute (main 0be33e8) | Beleg | Status |
|---|---|---|---|
| Kein Bildschirm vor dem Spiel, Klamottenwahl bleibt Abschnitt Bande | Heldenhalle mit Erstellung vor dem Spiel; die Bande entfällt | E-38, E-43, `start-screen.js` | anders entschieden |
| Klasse = Klamotte, Wechsel am Treffpunkt | Klasse fest je Held (`game.classLocked`); andere Klasse heißt neuer Held | E-38 Nachtrag, `engine.js` `switchMember` | anders entschieden |
| Dorfname aus drei Bierdeckeln statt Freitext | freier Name, 3 bis 20 Zeichen, je Liste eindeutig, mit Konto serverweit reserviert | E-38 Nr. 2, `characters.js` `validHeroName` | anders entschieden |
| Kein Aussehen, erst nach der 3D-Lieferung | drei Körper frei zur Klasse, Hautton, Haarfarbe, Frisur, Bart, Brille oder Stirnband | E-38 Nachtrag, `hero-tint.js` | anders entschieden |
| HUD zeigt Heldennamen statt Mentorname | erledigt (`game.heroName`), auch online | E-38 Nachtrag | übernommen |
| Spec-Tor ab Stufe 5, gesparte Punkte, Erstwahl überall, Wechsel am Treffpunkt | umgesetzt als Hauptbaum (`specUnlocked`, `changeSpec`, Ereignis `specUnlocked`) | E-37 Nr. 4, `talents.js`, `engine.js` | übernommen |
| Umskillen kostenlos | „Alle Punkte zurück" am Clan-Treff; Hauptbaum-Wechsel lässt Punkte stehen | E-37 Nr. 4 und 6 | übernommen, Bestätigung noch `confirm()` |
| Je Reihe genau ein Talent, Pfad als Spielrichtung | offene Bäume, ein Punktetopf (16 auf Stufe 30), Pfadboni je Baum, Kennzeichen `mainTreeOnly` | E-37 | anders entschieden |
| Zwei-Tipp-Regel und Rückweg zu Ida beim Anziehen | entfällt mit der Bande | E-43 | entfallen |
| Probestunde vor der Spec-Wahl | nicht gebaut; Arena-Spec-Knöpfe sind Admin-Werkzeug | `arena.js` | offen (V-4) |
| Identitätskarten für Klasse und Spec | Klassenkarte zeigt Name und einen Satz; Talentfenster zeigt Rollen je Baum | `start-screen.js` `HERO_UI.classes`, Commit 5d16407 | offen (V-2, V-3) |
| Vierte Klasse vertagen | keine Entscheidung; Söldner-Baustein ausdrücklich auch für künftige Pet-Klassen | E-45 | offen, Lage geändert (V-5) |
| Besitz von `mechanics.js`, `spec-mechanics.js`, `glossary.js` | `docs/ROLLEN.md` unverändert | `docs/ROLLEN.md` | offen (V-6) |

## 2 · Ist-Stand der Charaktererstellung

- **Heldenhalle** (Startbildschirm, `start-screen.js`): „Wer zieht heute los?", Karte je Held mit Spielbild samt
  Ausrüstung, Klasse und Stufe, höchstens acht Helden (`CHARACTER_LIMIT`), Löschen mit Rückfrage. Ein Held ist ein
  eigener Spielstand mit eigener Geschichte und eigenem Rucksack; der Altstand wurde ohne Kopieren zum ersten Helden.
- **Erstellung in drei Schritten:**
  1. *Klasse:* drei Karten mit Figur, Name und einem Satz: Tresenbrecher („Nahkampf · hält aus und teilt aus"),
     Landhaus-Lady („Fernkampf und Heilung · im Takt am stärksten"), Pfandingenieur („Fernkampf · Basteln, Zünden, Glück").
  2. *Aussehen:* Körper Kräftig, Schwungvoll oder Drahtig (frei zur Klasse, ohne Einfluss auf Werte), vier Hauttöne,
     sieben Haarfarben, Frisur (wie gezeichnet, Irokese), Bart (wie gezeichnet, Stoppeln, Kinnbart, Vollbart), am Kopf
     (ohne, Brille, Sonnenbrille, Stirnband). Umfärben zur Laufzeit, ohne neue Zeichnungen.
  3. *Name:* 3 bis 20 Zeichen, Buchstaben, Ziffern, Leerzeichen, Bindestrich.
- **Im Spiel:** Start in Unterwäsche bei Ida, Hofprobe, danach die Startreihe mit vier Hotspots (E-55). Stufe 1 bis 4
  spielen den Klassenkern ohne Hauptbaum, Talentpunkte werden gespart. Auf Stufe 5 sendet die Engine `specUnlocked` und
  schreibt ins Log: „Wähle im Clanbuch unter Talente deinen Hauptbaum, deine gesparten Punkte warten."
- **Talente:** eigene Clanbuch-Seite [N] (E-43), drei Baumreiter mit Rolle, Suche, Pfadboni bei 4 und 7 je Baum,
  Kennzeichen für Talente, die nur im Hauptbaum wirken.
- **Online:** Der Held tritt unter seinem Namen auf (Dorf, Chat, Gruppen); die Heldenliste wird zwischen Geräten
  vereinigt.

## 3 · Was aus dem Brainstorm noch trägt

### 3.1 Klassenschritt als Entscheidungshilfe (V-2)

Seit E-38 ist die Klasse je Held endgültig. Damit wiegt die Wahl im ersten Schritt schwerer als vorher, als man am
Treffpunkt einfach die Klamotten tauschen konnte. Die Karte zeigt heute Name und einen Satz. Vorschlag: dieselbe Karte,
ergänzt um

- **Rolle, Ressource, Schwierigkeit** (ein bis drei Kronkorken) und **Für wen** (ein Satz);
- **drei Bäume als Chips** („Ab Stufe 5: Türsteher · Kneipenschläger · Zapfmeister"), Antippen oder Überfahren zeigt die
  Identitätskarte aus 3.3;
- **Vergleichsleiste** unter den Karten: Grundangriff-Takt und Reichweite, Ausweichen, Stärke auf Stufe 1, Werte aus
  `describe('passive', id)`, damit die Leiste nie vom Kit abweicht.

Hinweis im Schritt: „Die Klasse bleibt. Für eine andere Klasse legst du einen weiteren Helden an." Das steht heute erst
als Toast im Spiel, wenn man den Klamottentausch versucht. Mobil: eine Karte je Breite, Chips mindestens 44 px.

### 3.2 Hauptbaum-Wahl auf Stufe 5 als Moment (V-3)

Heute kommt auf Stufe 5 eine Logzeile; der Spieler muss selbst die Talente-Seite öffnen und verstehen, dass der Hauptbaum
das Kit und die Kernmechanik umdeutet, während Punkte in allen drei Bäumen wirken. Vorschlag:

- Abzeichen am Talente-Knopf im Dock, solange kein Hauptbaum gewählt ist;
- die Talente-Seite öffnet in diesem Zustand mit **drei Identitätskarten** (3.3) statt direkt mit dem Baum, Knopf
  „Als Hauptbaum wählen" mit Bestätigung im Fenster;
- jede Karte trennt sichtbar **„Nur als Hauptbaum"** (Kit-Namen, Kernmechanik, die mit `mainTreeOnly` gekennzeichneten
  Talente) von **„Wirkt in jedem Baum"** (die übrigen Talente); das ist die eigentliche Lernfrage von E-37;
- nach der Wahl springt die Seite in den gewählten Baum, die gesparten Punkte leuchten;
- optional eine Zeile des passenden Mentors (Story), Anschluss an den Erinnerungsfetzen „Naturtalent" auf Stufe 5.

### 3.3 Identitätskarten der neun Bäume

Kernmechanik und Pfade aus `content/mechanics.js`, Stand 0be33e8. Rollenwörter nach 3.4, Schwierigkeit und „Für wen"
sind Vorschläge für Klassendesign.

| Baum | Rolle | Ressource als Hauptbaum | Kernregel als Hauptbaum | Pfade | Schwierigkeit | Für wen |
|---|---|---|---|---|---|---|
| Türsteher (`dieter-wall`) | Tank | Deckung als Waffe | Rausschmiss wirft die Deckung als Welle; fast volle Deckung gibt Hausverbot | Türsteher-Kodex, Rausschmeißer, Hausrecht | 1 | wer der Grund sein will, warum die Gruppe lebt |
| Kneipenschläger (`dieter-brawl`) | Nahkampf-Schaden | Deckelstriche auf der Deckel-Uhr | Abriss verbraucht die Striche; läuft die Uhr ab, kommt der Kater | Dauerpegel, Blitzabriss, Rundenkämpfer | 2 bis 3 | wer die Uhr im Nacken will |
| Zapfmeister (`dieter-brew`) | Zone | Fässer | Fässer wirken im Umkreis, Fassanstich sticht alle an | Pils, Weizen, Bock | 2 | wer den Kampfplatz vorbereitet |
| Landhaus-Lazarett (`baerbel-care`) | Heilung | Vorrat | fünf Gläser, dann Großreinemachen: Heilung trifft auch als Schaden; Gisela auf dem Nest | Vorrat, Gisela, Reinemachen | 1 bis 2 | wer heilt und trotzdem Kills sehen will |
| Putzpyramide (`baerbel-feedback`) | Schaden über Zeit | Schimmel | Schimmel springt auf Nachbarn, Durchputzen lässt alles platzen | Sporen, Provision, Downline | 2 bis 3 | wer Gegner zählt, nicht Treffer |
| Filter-Furie (`baerbel-stage`) | Fernkampf-Schaden | Randale als Zustand | Putzwut bei 100 Randale; Auswringen beendet sie; Parade in eine Ansage ist „Prost!" | Dauerglanz, Putzwut, Wischer | 3 | wer zehn Sekunden Bühne will |
| Zündmeister (`kevin-fuse`) | Fernkampf-Schaden | Zündungen | Lunte klebt, Kurzschluss springt und zündet, drei Zündungen geben Kettenreaktion | Lunte, Kurzschluss, Kettenreaktion | 2 bis 3 | wer zuerst markiert und zuletzt lacht |
| Schrottkoloss (`kevin-iron`) | Tank | Dosen-Robbi | Robbi zieht Aggro, feuert und bremst; Überlast sprengt ihn | Robbi, Nieten, Überlast | 2 | wer einen Blechkumpel vorschickt |
| Pfandjäger (`kevin-hunt`) | Fernkampf-Schaden | Strähne | Fehl-, Normal- oder Überzündung; Pity nach drei Fehlzündungen; Jackpot | Glückssträhne, Fangschuss, Jackpot | 1 zu spielen, 3 zu beherrschen | wer Würfel mag und nicht heult |

Prüfbare Regel (E-32 Nr. 1): die neun `kind`-Werte in `SPEC_MECHANICS` bleiben verschieden.

### 3.4 Rollenwörter

Ein Wortschatz für Klassenkarte, Baumreiter und Identitätskarte: Tank, Nahkampf-Schaden, Fernkampf-Schaden, Heilung,
Zone, Schaden über Zeit, Zufall, Begleiter. Heute stehen noch „Schutz & Heilung" (Zapfmeister) und „Schadensheilung"
(Putzpyramide) in `SPECS.role`; die IDs bleiben.

### 3.5 Eine Quelle für Karten und Tooltips

`describe()` kennt heute skill, buff, throw, ground, talentSkill, talent, passive und proc. Für die Karten aus 3.1 bis 3.3
fehlen die Arten **spec**, **mechanic** und **path**, sonst werden Zahlen auf den Karten ein zweites Mal von Hand gepflegt.
Neue Felder, alle ohne Ziffer im Text (Welle-D-Regel):

```js
// content/classes.js (Klassendesign)
{id:'dieter', /* wie heute */ difficulty:1,forWhom:'Wer stehen bleibt, wenn andere rennen, und lieber pariert als ausweicht.'}
// content/talents.js SPECS (Klassendesign)
'dieter-brawl':{ /* wie heute */ resource:'Deckelstriche',difficulty:2,
 playstyle:{build:'Kellen, bis die Deckel-Uhr voll ist',trigger:'Uhr fast abgelaufen',finish:'Abriss'},
 forWhom:'Wer eine Uhr im Blick behalten kann, während ihm einer aufs Maul haut.'}
// content/mechanics.js paths (Klassendesign)
paths:[{name:'Dauerpegel',text:'Die Uhr läuft langsamer, der Kater ist kürzer.',bonus4:{/* wie heute */},bonus7:{/* wie heute */}}]
```

### 3.6 Bestätigung im Fenster statt `confirm()`

„Alle Punkte zurück" fragt heute über das native `confirm()` (`app.js`, Handler `resetTalents`). Vorschlag: dieselbe
Bestätigung im Fenster wie beim Spec-Wechsel (`touchhelp`-Muster), mit dem, was verloren geht („12 Punkte, Pfadkrone
Dauerpegel"). Auf Touch ist das native Fenster ein Stilbruch und auf manchen Geräten klein.

### 3.7 Fiktion nach E-38 (V-1)

E-17 steht in der Tabelle noch auf „gilt": „Die Klassenwahl ist die Klamottenwahl … Wechsel am Treffpunkt heißt Klamotten
tauschen." Seit E-38 fällt die Klasse in der Heldenhalle, und der Tausch ist für jeden Helden abgeschaltet. Idas Begrüßung
erwähnt den Haufen nicht mehr. Vorschlag: E-17 als „geändert durch E-38" führen und die Fiktion so fassen: **Die Klasse aus
der Erstellung bestimmt, wessen Ersatzklamotten Ida dem Fremden gibt.** Der Held bleibt ein Fremder, Dieter, Anni und Kevin
bleiben Mentoren. Story prüft die Texte, die noch vom Tausch am Treffpunkt sprechen (unter anderem der Kopfkommentar in
`content/dialogues.js` zu den Mentoren) und die Hilfe.

Kleine Idee, nur wenn Story will: Ida verpasst dem Helden zusätzlich zum gewählten Namen einen **Beinamen** („Socke",
„Achtcent"), der im Charakterfenster unter dem Namen steht. Reine Würze, keine Priorität.

### 3.8 Probestunde (V-4)

Mit E-37 kostet ein Hauptbaum-Wechsel am Clan-Treff nichts, und die Punkte bleiben stehen. Damit ist der Wechsel selbst die
Probe; eine eigene Probestunde mit temporärem Zustand lohnt den Aufwand kaum. Anders beim Klassenschritt: Die Klasse ist
endgültig, eine Probe wäre dort wertvoll, bräuchte aber ein laufendes Spiel vor der Erstellung. Empfehlung: keine
Probestunde bauen; stattdessen 3.1 (bessere Karte) und ein kurzer Clip je Klasse aus dem Pre-Render (E-30, E-41) in der
Karte, sobald die Pipeline das liefert.

### 3.9 Weitere Klassen (V-5)

Die Lage hat sich geändert: E-45 baut Begleiter als Engine-Baustein „auch für spätere Klassen-Pets", E-38 hält die Klassen
als feste Liste (`CLASSES` in `characters.js`), E-37 gibt 16 Punkte auf Stufe 30 über drei Bäume. Eine vierte Klasse kostet
weiterhin einen kompletten Körper mit Ausrüstungsebenen, drei Kernmechaniken, 90 Talente mit Icons und einen Mentor.

| Kandidat (erfunden) | Fantasie | Rolle | Stand |
|---|---|---|---|
| Der Viehhalter | Hof am Dorfrand: Hund, Gans, Sau; die Tiere kämpfen, er treibt | Begleiter | jetzt der naheliegendste Kandidat, weil E-45 den Baustein liefert und Gisela und Robbi als Pfadkrone schon mitlaufen |
| Schlauch-Sabine, Feuerwehr-Ersatzkommandantin | „Löscht alles. Auch Grillfeste. Besonders Grillfeste." | Kontrolle, Fläche | bleibt Kandidatin für Kontrolle; vorher als Pfad testen (Rausschmeißer, Nieten) |

Empfehlung: vertagen, bis ein Kenner-Playtest die neun Bäume als Hauptbaum im normalen Spiel gespielt hat und Akt 1 nach
E-22 tief ist; dann den Viehhalter zuerst bewerten.

## 4 · Offene Befunde (Stand 0be33e8)

| Nr. | Befund | Beleg | Rolle | Status |
|---|---|---|---|---|
| 1 | Alter Rausch läuft neben der Deckel-Uhr: `classState.rage` wird bei Kelle und kassiertem Treffer weiter gefüllt, zwei Talente („Noch einen auf die Zwölf", „Volle Kante") nutzen `rageGain`/`rageBurst` | `class-mechanics.js` (Kelle, `modifyHit`), `content/talents/dieter.js` | Klassendesign, Engine | offen |
| 2 | Rollenwörter uneinheitlich: „Schutz & Heilung", „Schadensheilung" | `content/talents.js` `SPECS` | Klassendesign | teilweise erledigt |
| 3 | `content/mechanics.js`, `spec-mechanics.js`, `content/glossary.js` ohne Besitzer | `docs/ROLLEN.md` | Lead | offen |
| 4 | 10 von 19 Kit-Texten in `SPEC_MECHANICS` enthalten Ziffern; die Welle-D-Prüfung deckt `kit.text` nicht ab | `content/mechanics.js`, `content/checks/klassen.js` | Klassendesign, Lead | offen |
| 5 | `describe()` ohne Arten für Baum, Mechanik und Pfad | `content/glossary.js` `DESCRIBE_KINDS` | Klassendesign | offen |
| 6 | „Alle Punkte zurück" über natives `confirm()` | `app.js` Handler `resetTalents` | UI | offen |
| 7 | E-17 „gilt" in der Tabelle, obwohl E-38 den Klamottentausch abgeschaltet hat | `docs/ENTSCHEIDUNGEN.md` | Lead, Story | neu |
| 8 | Klassenkarte der Erstellung zeigt nur Name und einen Satz, obwohl die Klasse endgültig ist | `start-screen.js` `HERO_UI.classes` | UI, Klassendesign | neu |
| 9 | Kein Playtest-Bericht deckt die Hauptbaum-Wahl auf Stufe 5 im normalen Spiel ab; die Kenner-Läufe zu E-32 liefen in der Trainingsarena, die Läufe vom 23.09. enden vor Stufe 5 | `docs/PLAYTEST-*.md` | Lead | offen |

Erledigt oder entfallen seit dem 19.09.: Annis Taktfenster-Text stimmt mit `beatWindow` überein; HUD zeigt den
Heldennamen; Ein-Tipp-Klamottenwahl und fehlender Rückweg zu Ida sind mit der Bande entfallen (E-43); das Spec-Tor aus
E-32 Nr. 1 ist umgesetzt (E-37); `player.specLevel` steht in `content/balance.js`.

## 5 · Vorschläge zur Entscheidung

| Nr. | Frage | Optionen | Empfehlung | Verworfene Alternative |
|---|---|---|---|---|
| V-1 | Fiktion nach E-38 | a) E-17 „geändert durch E-38": Klasse aus der Erstellung bestimmt, wessen Klamotten Ida ausgibt; b) E-17 unverändert lassen | a | b (Tabelle und Spiel widersprechen sich) |
| V-2 | Klassenschritt als Entscheidungshilfe | a) Karte mit Rolle, Ressource, Schwierigkeit, Für wen, Baum-Chips und Vergleichsleiste; b) wie heute | a | b (endgültige Wahl mit einem Satz Information) |
| V-3 | Hauptbaum-Wahl auf Stufe 5 | a) Talente-Seite öffnet mit drei Identitätskarten und Bestätigung, Abzeichen am Dock; b) nur Logzeile wie heute | a | b (der Spieler findet die Wahl nicht oder versteht „Hauptbaum" nicht) |
| V-4 | Probestunde | a) keine, der kostenlose Hauptbaum-Wechsel ist die Probe, später Clip je Klasse; b) Probestunde mit temporärem Zustand | a | b (Aufwand und Rückbau-Risiko ohne Gewinn seit E-37) |
| V-5 | Vierte Klasse | a) vertagen, Viehhalter auf E-45 zuerst bewerten; b) jetzt planen | a | b (keine Playtest-Daten zu Hauptbäumen, Akt 1 nicht tief) |
| V-6 | Besitz der drei unbesetzten Dateien | a) `mechanics.js` Klassendesign, `spec-mechanics.js` Engine, `glossary.js` Lead; b) alles Klassendesign | a | geteilter Besitz (gegen E-19) |

## 6 · Etappen

| Etappe | Rollen | Inhalt | Abnahme | Playtest |
|---|---|---|---|---|
| 0 · Entscheidungen | Lead, Produktion | V-1 bis V-6 | Einträge in ENTSCHEIDUNGEN.md mit verworfener Alternative; E-17 als geändert markiert | keiner |
| 1 · Inhalt | Klassendesign, Story, Engine | Rausch ausmustern (IDs bleiben), Rollenwörter, Kit-Texte ohne Ziffern, Felder aus 3.5, `describe`-Arten, Fiktionstexte nach V-1, Karten- und Mentorzeilen | `npm run content:check` und `npm test` grün; 0 Talente mit `rageGain`/`rageBurst`; Prüfung „Kit-Text ohne Ziffer" | keiner |
| 2 · UI | UI, Mobile | Klassenkarte mit Chips und Vergleichsleiste, Hauptbaum-Ansicht mit Identitätskarten und Abzeichen, Bestätigung statt `confirm()` | Prüfskripte der Heldenhalle und der Talente-Seite grün bei 2024 × 900 und 390 × 844, Scorecard ≥ 4 | Neuling: Erstellung bis Ida in unter drei Minuten ohne Hilfe; Kenner: normaler Aufstieg bis Stufe 5, Hauptbaum wählen, Punkte quer verteilen; kein „bricht ab" |

## 7 · Backlog-Schnipsel je Rolle

Erst nach Etappe 0 übernehmen.

- **docs/backlog/lead.md:** V-1 bis V-6 der Produktion vorlegen; E-17 in der Tabelle als „geändert durch E-38" führen;
  Besitz der drei Dateien in `docs/ROLLEN.md` eintragen; Playtest-Auftrag Kenner „Hauptbaum auf Stufe 5 im normalen
  Spiel". Abnahme: Einträge und Bericht.
- **docs/backlog/klassen.md:** Rausch-Talente auf die Deckel-Uhr umschreiben, Rollenwörter aus 3.4, Kit-Texte ohne Ziffern
  mit Prüfung, Felder `difficulty`, `forWhom`, `resource`, `playstyle`, Pfadtexte, `describe`-Arten spec, mechanic, path.
  Abnahme: `content:check` grün, Beleg „9 Bäume mit playstyle, 27 Pfadtexte, 0 Kit-Texte mit Ziffer".
- **docs/backlog/engine.md:** `classState.rage` und die Rausch-Zweige in `class-mechanics.js` entfernen, sobald kein Talent
  sie mehr setzt. Abnahme: Kneipenschläger zeigt genau einen Stapel, Tests grün.
- **docs/backlog/ui.md:** Klassenkarte nach 3.1, Hauptbaum-Ansicht nach 3.2, Bestätigung nach 3.6. Abnahme: siehe
  Etappe 2.
- **docs/backlog/story.md:** Fiktionstexte nach V-1, Hinweis „Die Klasse bleibt" im Klassenschritt, Mentorzeile zur
  Hauptbaum-Wahl je Klasse, optional Beiname. Abnahme: Story-Prüfung grün, Ton E-20.

## Anhang · Verlauf

- **19.09.2026, erste Fassung** (a97f355): aus vier getrennt geschriebenen Entwürfen (Fiktion zuerst, MMO-Kenner,
  Mobile-first, Systemdesign) zusammengeführt, aufgesetzt auf E-17 und E-32, Vorschläge E-34 bis E-40. Am selben Tag
  zurückgestellt: zuerst der Händler (E-34).
- **20.09.2026:** Charaktererstellung doch beauftragt und gebaut (E-38), Talentbäume geöffnet (E-37); dabei die
  Backlog-Schnipsel der ersten Fassung für Spec-Tor, gesparte Punkte und `specLevel` als erledigt markiert.
- **23.09.2026, Abgleich** gegen main 0be33e8 nach E-37, E-38, E-43, E-45 und E-55: Abschnitte zu Bande, Dorfname,
  Aussehen, Pfadbaum mit „je Reihe ein Talent" und Spielstandfeldern entfernt, weil entschieden und gebaut; offene Ideen
  auf die neue Lage umgeschrieben; Befunde nachgeprüft; Vorschläge neu als V-1 bis V-6. Die erste Fassung steht in der
  Historie unter a97f355.
