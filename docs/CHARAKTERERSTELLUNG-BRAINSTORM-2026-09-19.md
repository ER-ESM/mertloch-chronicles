# Charaktererstellung und Klassen mit Spezialisierungen · Brainstorm 2026-09-19

**Zurückgestellt auf Nutzerwunsch (19.09.2026).** Zuerst Händler umsetzen. Dieser Brainstorm bleibt als spätere Grundlage erhalten; keine Charaktererstellung beauftragt.

Anlass: Auftrag „check mal alles und plane mal eine Charaktererstellung und verschiedene Klassen mit Specs". Aufgesetzt auf
[E-17](ENTSCHEIDUNGEN.md) (der Held ist ein Fremder, die Klassenwahl ist die Klamottenwahl) und [E-32](ENTSCHEIDUNGEN.md)
(neun Kernmechaniken, 30 Talente je Spezialisierung in drei Pfaden), Stand `main` ffa884d.
**Stand:** Brainstorm, nichts entschieden; Entscheidungen trifft die Produktion ([ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md)).
Zahlen sind Entwürfe für `content/balance.js` und `content/tuning.js`, keine Festlegung. Spielertexte sind Beispiele im Ton
E-20 und werden von Story ersetzt.

Das Papier entstand aus vier getrennt geschriebenen Entwürfen (Blickwinkel „Fiktion zuerst", „MMO-Kenner", „Mobile-first
und minimal", „Systemdesign"), die anschließend zusammengeführt wurden; Herkunft der einzelnen Ideen in Anhang B.

**Kurzfassung.** Es gibt keine Charaktererstellung als Formular und keinen Bildschirm vor dem Spiel: Der Held liegt in
Unterhose in den Trümmern, Ida schickt ihn an den Kleiderhaufen, die Klamotte ist die Klasse. Das ist heute schon so und
bleibt so. Was fehlt, ist die Ebene darüber: Die Spezialisierung wirkt heute ab Stufe 1 still im Hintergrund (die erste Spec
der Klasse ist automatisch aktiv), E-32 verlangt sie ab Stufe 5. Der Vorschlag macht aus Stufe 5 einen echten Moment:
Punkte der Stufen 2 bis 4 werden aufgespart, auf Stufe 5 stehen drei Identitätskarten zur Wahl, vier Punkte gehen auf
einmal in den Pfadbaum, der Pfadbonus bei vier ist sofort erreichbar. Jede Ebene stellt genau eine Frage: die Klamotte fragt
nach Tempo, Reichweite und Takt, die Spezialisierung nach der Regel für Eskalation und Boden, der Pfad nach sicher, schnell
oder breit. Dazu kommen ein Dorfname aus Idas Mund statt des Mentorennamens im HUD, eine Bestätigung im Buch statt eines
Ein-Tipp-Wechsels, und einheitliche Identitätskarten für Klamotte, Spec und Pfad, deren Zahlen aus `describe()` kommen.
Aussehen, Spec-Probe und eine vierte Klasse bleiben ausdrücklich offen und stehen mit Empfehlung in Abschnitt 13. Kein
neues Fenster, keine neue ID, keine Änderung an E-32; sieben Entscheidungen (E-34 bis E-40) und ein Etappenplan.
Erster Schritt: Lead legt E-34 bis E-40 der Produktion vor, Klassendesign räumt die vier Widersprüche aus Abschnitt 1 auf.

## 1 · Ist-Stand (main ffa884d)

| Punkt | Stand heute | Beleg |
|---|---|---|
| Erststart | Ladebildschirm, Welt, Ida. Ihr erster Satz nennt Unterhose, Socke, Stempel und den Haufen mit Dieters Kutte, Annis Schürze, Kevins Gürtel | `content/tutorial.js` `welcome` |
| Klamottenwahl | Knopf „Klamotten aussuchen" öffnet das Clanbuch, Reiter Figur, Abschnitt Bande: drei Karten (Porträt, Rolle, Name, Bio, Passiv-Kurztext, Spielweise), ein Tipp zieht an, das Buch schließt, der Spieler steht ohne Rückweg zu Ida da (F oder „?") | `clan-ui.js` `clanMenu`, `app.js` Handler `memberWear` |
| HUD-Name | zeigt den Mentorennamen (`game.member.name`); Neuling-Playtest Hänger 3: „Ich weiß nicht, welche Figur ich bin" | `app.js:169`, `PLAYTEST-2026-09-17-neuling.md` |
| Unterschied auf Stufe 1 | messbar seit Runde B (P13): Kelle 1,5 s gegen 0,95 s, Taktfenster, Reichweite 210, Ausweichen 3/5/6 s; Prüfung verlangt 3 von 5 abweichende Startwerte | `content/classes.js` `passives`, `content/checks/klassen.js` |
| Spezialisierungen | neun Kernmechaniken umgesetzt und balanciert: Hausrecht, Deckel-Uhr, Fässer, Vorrat, Schimmel, Putzwut mit „Prost!", Lunte und Kurzschluss, Dosen-Robbi, Bastler-Glück; laufende Begleiter als Pfadkrone (Robbi, Gisela) | `content/mechanics.js`, `spec-mechanics.js`, `content/tuning.js` `mechanics` |
| Talente | 30 je Spec in 10 Reihen × 3 Pfaden, je Reihe eines, Pfadbonus bei 4 und Krone bei 7, Schlussstein in Reihe 10; Pfadbaum-Fenster mit Bahnen, Zählern und Rotationszeile im Tooltip | `content/talents/<klasse>.js`, `talent-ui.js`, `docs/TALENT-AUTORENBRIEF-2026-09-18.md` |
| Spec-Wahl | `changeSpec` nur am Treffpunkt (150 Einheiten um den Spawn), außerhalb des Kampfes, löscht alle Punkte; ohne Wahl gilt die erste Spec der Klasse ab Stufe 1, `mechanic(g)` prüft keine Stufe; Punkte fallen ab Stufe 2 in diesen Baum | `talents.js` `talentState`, `changeSpec`; `spec-mechanics.js:10` |
| Umskillen | kostenlos; Rückfrage über natives `confirm()`; Spec-Wechsel ohne Rückfrage | `app.js`, `talents.js` |
| Probe | Trainingsarena ist Admin-Werkzeug mit Spec-Knöpfen (seit 19.09.), keine Spielerfunktion | `arena.js`, `PLAYTEST-2026-09-18-kenner-e32.md` |
| Name, Aussehen | kein Spielername, kein Aussehen; der Held wird mit dem Atlas des Mentors gezeichnet, dessen Klamotte er trägt | `renderer.js` `drawHero`, `redesign-art.js` |
| Beschreibungen | `describe()` kennt skill, buff, throw, ground, talentSkill, talent, passive, proc; keine Art für Spec, Mechanik oder Pfad | `content/glossary.js` `DESCRIBE_KINDS` |

**Widersprüche, die vor jeder Karte aufzuräumen sind** (alle Klassendesign, außer wo genannt):

1. Kneipenschläger führt zwei Stapel parallel: den alten Rausch (`classState.rage`, Talente mit `rageGain`) und die neue
   Deckel-Uhr. `class-mechanics.js:31` und `:42` füllen den Rausch weiter. Eine Karte kann nur eine Wahrheit zeigen.
2. Annis Passiv-Kurztext nennt das Taktfenster 0,85 bis 1,5 s, `passives.beatWindow` ist seit E-32 [1; 1,9]
   (`content/classes.js`).
3. Die Rollenwörter in `SPECS.role` („Schadensheilung", „Fallen & Bewegung", „Schutz & Heilung") passen nicht mehr zu den
   Kernmechaniken; ein Kenner ordnet sie nicht ein.
4. `content/mechanics.js`, `spec-mechanics.js` und `content/glossary.js` haben in `docs/ROLLEN.md` keinen Besitzer (Lead).

## 2 · Leitidee

**Drei Klamotten, neun Charaktere, ein Fremder. Kein Formular.**

1. **Jede Ebene stellt genau eine Frage.** Klamotte: Wie nah, wie schnell, in welchem Takt? Spezialisierung: Welche Regel
   gilt für Eskalation und Boden? Pfad: Sicher, schnell oder breit? Mehr fragt die Erstellung nicht.
2. **Jede Entscheidung ist eine Handlung in der Welt, keine Einstellung.** Klasse heißt Klamotte anziehen, Name heißt
   Dorfname von Ida, Spezialisierung heißt Lehre annehmen, Umskillen heißt am Treffpunkt umziehen.
3. **Vorher sehen, was man wählt.** Klamotte, Spec und Pfad zeigen vor der Wahl dieselbe Identitätskarte: Rolle,
   Ressource, Kernregel, Schwierigkeit, Für wen, Beispielrotation. Jede Zahl kommt aus `describe()`, nie aus Handtext.
4. **Kein neues Fenster, kein Bildschirm vor dem Spiel** (E-13, E-27). Alles sind Abschnitte im Reiter Figur oder Zeilen
   in Idas Gespräch. Ein Vorschaltbildschirm würde den Witz zerstören, dass der Held in Unterhose in den Trümmern liegt.
5. **Stufe 5 ist der Bildungsmoment.** Bis dahin spielen alle die Grundschleife (E-32 Nr. 1); mit der Lehre kommen vier
   aufgesparte Punkte, und der erste Pfadbonus ist am selben Tag erreichbar.

## 3 · Spielerpfad vom Erststart bis Stufe 11

| Schritt | Wo | Der Spieler entscheidet | Er sieht | Textbeispiel (Entwurf, Story ersetzt) |
|---|---|---|---|---|
| Aufwachen | Welt, Spawn St. Gangolf | nichts | Held ohne Hose, Ida, Kleiderhaufen als Blickfang | Ida: „Unterhose, eine Socke, unser Stempel auf dem Arm." (Bestand) |
| Klamotte | Reiter Figur, Abschnitt Bande | Kutte, Schürze oder Gürtel | drei Karten mit Vergleichsleiste (Rolle, Schwierigkeit, Ressource, Takt, Reichweite, Ausweichen), Spec-Vorschau als drei Chips; erster Tipp zeigt die Puppe in der Klamotte, zweiter Tipp zieht an | Dieter: „Meine Kutte. Zieh sie an, aber nicht dehnen. Die dehnt sich selbst." |
| Zurück zu Ida | Idas Gespräch | nichts | Ida kommentiert die Wahl, Hinweis: Wechseln geht später am Treffpunkt | Ida: „Kevins Gürtel. Gut. Der hält mehr als Kevin." |
| Hofprobe | Hof | Bewegung, Ziel, Kelle, Parade | wie heute | Bestand |
| Dorfname | Idas Gespräch nach der Hofprobe | einer von drei Bierdeckeln oder „später" | HUD zeigt den Dorfnamen statt des Mentorennamens | Ida: „Du brauchst einen Namen. Nicht deinen. Einen, der passt." Deckel: Socke · Achtcent · Sperrmüll |
| Stufe 2 bis 4 | Feld | nichts | Abzeichen „Punkte gespart: 3", Talentabschnitt gesperrt mit Text „Ab Stufe 5" | Toast: „Ein Punkt. Behalt ihn. Dieter sagt dir auf Stufe 5, wohin damit." |
| Stufe 5 | überall außerhalb des Kampfes, Reiter Figur, Abschnitt Talente | eine von drei Spezialisierungen | drei Identitätskarten (Rolle, zweite Ressource, Kernregel, drei Pfade, Schwierigkeit, Für wen, Beispielrotation), Knopf „Nehmen"; Erinnerungsfetzen „Naturtalent" | Dieter: „Drei Lehren. Türsteher, Kneipenschläger, Zapfmeister. Nimm eine. Nimm nicht die falsche. Alle drei sind die falsche." |
| Erste Punkte | Abschnitt Talente | vier Talente, Reihen 1 bis 4 | Pfadbaum mit drei Bahnen; wer alle vier in eine Bahn setzt, sieht den Pfadbonus sofort | Bahnkopf: „Dauerpegel 4/4 · Pfadbonus" |
| Stufe 6 bis 11 | Abschnitt Talente | ein Talent je Stufe | Reihen 5 bis 10, Pfadkrone bei 7, Schlussstein in Reihe 10 | Bestand (Tooltip mit Rotationszeile) |
| Umskillen, Spec-Wechsel | Treffpunkt | Talent zurück, Reihe tauschen, Lehre wechseln | Bestätigung im Buch mit dem, was verloren geht | Mentor: „Nochmal von vorn. Kostet nichts. Außer meine Geduld. Die war eh weg." |

## 4 · Charaktererstellung im Detail

### 4.1 Klamottenwahl bleibt Abschnitt Bande, mit vier Reparaturen

Kein neuer Bildschirm, kein Weltrequisit, kein Namensfeld. Der vorhandene Weg (Ida, „Klamotten aussuchen", Abschnitt
Bande, `switchMember`) bleibt, mit vier Änderungen:

1. **Rückweg schließen.** Nach dem Anziehen im Hofproben-Schritt 0 öffnet sich Idas Gespräch wieder (Bedingung wie beim
   Erststart-Hinweis in `app.js`). Ein Tipp hin, ein Tipp zurück (Mobile-Regel M-15). Heute schließt das Buch ins Leere.
2. **Zwei Tipps statt einem** (M-06: seltene, zerstörerische Aktion braucht Bestätigung). Erster Tipp auf eine Karte
   markiert sie und lässt die drehbare Puppe (`data-character-art`) die Klamotte tragen; zweiter Tipp auf den Goldknopf
   zieht an. Beim Erststart ist der zweite Tipp die einzige Bestätigung, später am Treffpunkt ebenso; kein natives
   `confirm()`.
3. **Vergleichsleiste über den Karten.** Drei Spalten, fünf Zeilen: Rolle, Schwierigkeit (ein bis drei Kronkorken),
   Ressource, Grundangriff-Takt und Reichweite, Ausweichen. Werte aus `describe('passive', id).numbers`, damit die Leiste
   nie vom Kit abweicht (Antwort auf P13 „alle drei identisch").
4. **Spec-Vorschau auf der Karte.** Drei Chips „Ab Stufe 5: Türsteher · Kneipenschläger · Zapfmeister" mit Rolle; ein
   Chip öffnet die Spec-Identitätskarte (Abschnitt 5.2) im Detailfenster, ohne zu wählen.

Dazu zwei Textzeilen von Story: Idas Reaktion je Klamotte und ein Satz in Schritt 0, dass Klamotten später am Treffpunkt
wechselbar sind (Neuling Hänger 11: „unklar, ob das später noch geht").

### 4.2 Dorfname statt Mentorenname (E-35)

Der Held bleibt namenlos („Nicht mal der eigene Name", `content/story.js`). Das Dorf gibt ihm einen Spitznamen: Nach der
Hofprobe bietet Ida drei Bierdeckel an, die Wörter stammen aus bestehenden Texten (Socke, Achtcent, Sperrmüll; Story wählt).
„Später" lässt einen neutralen Platzhalter stehen. Der Dorfname ersetzt im HUD den Mentorennamen (`#playerName`), die
`classId` bleibt unberührt. Kein Freitextfeld: Ton nach E-20 wäre nicht prüfbar, das Handy bräuchte eine Tastatur, kein
Dialog könnte darauf reagieren. Speicherfeld `hero.alias` (Anzeigewert, kein Speicherschlüssel im Sinne von E-04).

Bis zur Entscheidung: HUD zeigt eine Beschriftung aus `content/panel-ui.js` wie „Der Neue · Dieters Kutte" statt
„Dosen-Dieter".

### 4.3 Aussehen (E-36)

Keine Aussehenswahl in dieser Runde. Regel: **Aussehen ist Klamotte plus Ausrüstung.** Körper und Kostüm sind heute je
Klasse eine Bitmap; ein eigener Fremden-Körper wäre ein kompletter Satz Atlanten je Ausrüstungsebene, Hautton bräuchte eine
Maske, die die Pipeline nicht kennt. Der Widerspruch „Held trägt Dieters Gesicht" bleibt sichtbar und wird von Story als
Witz getragen (Mentor: „Steht dir. Steht mir besser."). Sobald die 3D-Lieferung nach E-30 einen neutralen Körper mit
Klamotten als Ebenen erlaubt, wird E-36 neu gestellt.

### 4.4 Fehlerfälle, Abbruch, Wechsel, Mobil

- **Ohne Wahl weg** („Ab ins Dorf"): Dieter bleibt vorbelegt, der Stempel auf der Karte sagt „ungefragt", Idas Kasten
  bleibt bei „Klamotten aussuchen". Die Hofprobe startet trotzdem (kein hartes Tor; der Neuling überspringt sonst).
- **Im Kampf oder tot:** `switchMember` verweigert wie heute mit Toast; beim Erststart unmöglich.
- **Fern vom Treffpunkt:** Hinweis statt Knöpfe wie heute; Text zieht von `clan-ui.js` nach `content/panel-ui.js`.
- **Alter Spielstand ohne `hero`:** nie in die Erstellung springen; Alias leer, HUD zeigt die Beschriftung aus 4.2.
- **Späterer Wechsel:** derselbe Abschnitt am Treffpunkt, Zwei-Tipp-Regel, Talentbuild je Klasse bleibt getrennt (wie
  heute in `rpg.talentBuilds`), der Alias bleibt.
- **Mobil (390 × 844):** eine Karte je Breite, Karte auf Porträt, Rolle, Name, einen Satz Passiv und den Knopf gekürzt
  (Bio und Spielweise hinter „Persönlichkeit & Spielweise" wie heute), Vergleichsleiste horizontal scrollbar mit fester
  erster Spalte, Chips und Knöpfe mindestens 44 px, Fenster nie über Joystick und Kniffen. Prüfung `npm run mobile:check`.

### 4.5 Ausbaustufe, nicht jetzt: der Haufen als Weltrequisit

Der Blickwinkel „Fiktion zuerst" schlägt vor, den Kleiderhaufen als Requisit neben die Bude zu legen: erstes F ist Anprobe
mit Mentorzeile und Chips, zweites F zieht an. Das erfüllt E-17 wörtlich („vom Haufen") und M-06 elegant, kostet aber ein
neues Requisit (`world-prop-kinds.js` kennt nur `schrotthaufen`), einen Tutorial-Schritt, Grafik und einen zweiten Weg
neben dem Abschnitt Bande. Empfehlung: erst nach dem Kenner-Playtest der Abschnitte aus 4.1 entscheiden, ob die Szene den
Aufwand wert ist. Bis dahin bleibt der Haufen Text in Idas Satz.

## 5 · Klassen und Spezialisierungen

### 5.1 Identitätskarten der Klamotten

Rolle und Ressource aus `content/classes.js`; Schwierigkeit und „Für wen" sind neue Felder (Entwurf).

| Klamotte | Rolle | Ressource | Was die Klamotte allein ändert | Schwierigkeit | Für wen |
|---|---|---|---|---|---|
| Dieters Kutte | Front, Nahkampf | Pegel (drei Rauten) und Deckung | schwerste, langsamste Kelle; steckt weniger ein; Parade heilt; Ausweichen selten | 1 Korken | Wer stehen bleibt und pariert, statt zu rennen |
| Annis Schürze | Heilung mit Schadensanteil | Glanz im Takt | Treffer im Taktfenster geben doppelt Glanz; Heilung ab Stufe 2 | 2 Korken | Wer den Rhythmus hört, bevor er ihn sieht |
| Kevins Gürtel | Fernkampf | Druck | größte Reichweite, meiste Randale je Wurf, häufigstes Ausweichen, Unterbrechen gibt Druck; Drohne ab Stufe 2 | 2 Korken | Wer Abstand hält und Ziele wechselt |

### 5.2 Identitätskarten der neun Spezialisierungen

Kernmechanik und Pfadnamen aus `content/mechanics.js` (Stand ffa884d, Kneipenschläger-Stapel heißt Deckelstriche). Rollenwort,
Schwierigkeit und „Für wen" sind Vorschläge für Klassendesign.

| Spec | Rolle | Zweite Ressource | Kernregel ab Stufe 5 | Drei Pfade (Fantasie) | Schwierigkeit | Für wen |
|---|---|---|---|---|---|---|
| Türsteher (`dieter-wall`) | Tank | Deckung als Waffe | Rausschmiss wirft die gesammelte Deckung als Welle; fast volle Deckung gibt Hausverbot mit Doppelparade | Türsteher-Kodex (Deckung aus jeder Kelle und Parade: der Stehende), Rausschmeißer (Paraden bremsen und doppeln: der Konterer), Hausrecht (Zone und Welle: der Platzhirsch) | 1 | Einsteiger, wer der Grund sein will, warum die Gruppe lebt |
| Kneipenschläger (`dieter-brawl`) | Nahkampf-Schaden | Deckelstriche auf der Deckel-Uhr | Kellen und kassierte Treffer setzen Striche, der Abriss verbraucht sie; läuft die Uhr ab, kommt der Kater | Dauerpegel (Sicherheit: Uhr läuft langsamer, Kater kürzer), Blitzabriss (Tempo: Abriss früher, mehr je Strich), Rundenkämpfer (Fläche: Striche gehen als „Angetrunken" auf Gegner über) | 2 bis 3 | Wer die Uhr im Nacken will und den Kater verdient |
| Zapfmeister (`dieter-brew`) | Zone, Schutz und Heilung | Fässer (bis zwei, drei Sorten) | Anstich stellt Fässer, die Sorte wirkt im Umkreis; Fassanstich sticht alle an: Bock explodiert, Weizen heilt, Pils gibt Laufzauber | Pils (Tempo), Weizen (Heilung), Bock (Schaden) | 2 | Wer den Kampfplatz vorbereitet, statt hinterherzulaufen |
| Landhaus-Lazarett (`baerbel-care`) | Heilung | Vorrat (fünf Gläser) | jede Heilung füllt ein Glas; bei fünf beginnt das Großreinemachen, in dem Heilung auch Schaden ist; Gisela heilt vom Nest, mit Krone läuft sie mit | Vorrat (mehr Gläser, längeres Reinemachen), Gisela (Nest, Schnattern, Begleiterin), Reinemachen (Schaden aus Heilung, Überheilung als Deckung) | 1 bis 2 | Wer heilt und trotzdem Kills sehen will |
| Putzpyramide (`baerbel-feedback`) | Schaden über Zeit, Fläche | Schimmel auf Gegnern | Schimmel springt bei Pieksern auf Nachbarn und bei Kills auf zwei; Durchputzen lässt alles platzen; Sporenwolke verschimmelt Gruppen | Sporen (weiter springen), Provision (Heilung aus Schimmel), Downline (mehr Ziele, größere Explosion) | 2 bis 3 | Wer Gegner zählt, nicht Treffer |
| Filter-Furie (`baerbel-stage`) | Fernkampf-Schaden, Zustand | Randale als Zustand | bei 100 Randale beginnt die Putzwut: kostenlos, härter, im Laufen; Auswringen beendet sie mit Bonus; Parade in eine Ansage hinein ist „Prost!" | Dauerglanz (länger), Putzwut (härter, früher), Wischer (alles im Laufen) | 3 | Wer zehn Sekunden Bühne will und den Rest zahlt |
| Zündmeister (`kevin-fuse`) | Fernkampf-Schaden, Kette | Zündungen | Lunte klebt und explodiert; Kurzschluss springt über Nachbarn und zündet; drei Zündungen lösen die Kettenreaktion aus | Lunte (Explosion), Kurzschluss (Sprünge), Kettenreaktion (Fenster und Dauer) | 2 bis 3 | Wer zuerst markiert und zuletzt lacht |
| Schrottkoloss (`kevin-iron`) | Tank auf Distanz | Robbi (Leben, Ablauf) | Aufstellen stellt Dosen-Robbi als Front, der zieht Aggro, feuert und bremst; Überlast sprengt ihn; mit Krone läuft er mit | Robbi (länger, härter, Begleiter), Nieten (Deckung für dich und Robbi), Überlast (Explosion, Betäubung) | 2 | Wer einen Blechkumpel zwischen sich und den Ärger stellt |
| Pfandjäger (`kevin-hunt`) | Fernkampf-Schaden, Zufall mit Netz | Strähne (Fehl- und Überzündungen) | jeder Wurf zündet fehl, normal oder über; drei Fehlzündungen garantieren die Überzündung, drei Überzündungen den Jackpot | Glückssträhne (bessere Quoten), Fangschuss (Ausweichen lädt einen Gratiswurf), Jackpot (länger, früher) | 1 zu spielen, 3 zu beherrschen | Wer Würfel mag und nicht heult |

Prüfbare Abgrenzungsregel (E-32 Nr. 1, „kein Paar teilt die Grundlogik"): die neun `kind`-Werte in `SPEC_MECHANICS`
(guard, stack, fields, supply, dot, state, chain, turret, gamble) müssen verschieden bleiben; als Prüfung in
`content/checks/klassen.js` vorschlagen.

### 5.3 Spec-Wahl auf Stufe 5 (E-34)

**Tor.** Bis zur Wahl gibt es keine Spec: `talents.spec` ist `null`, `mechanic(g)` liefert nichts, `applySpecKit` überschreibt
nichts, `combatStats` verliert den Rückfall auf `dieter-wall`. Damit gilt E-32 Nr. 1 („Stufe 1 bis 4 für alle gleich") auch
im Code. Konstante `BALANCE.player.specLevel: 5`. Bei Erreichen sendet `gainXp` ein Ereignis `specUnlocked`; der
Erinnerungsfetzen „Naturtalent" liegt ohnehin auf Stufe 5 und liefert den Story-Anker.

**Gebankte Punkte.** Punkte gibt es weiter ab Stufe 2 (E-32 Nr. 2), sie werden bis zur Wahl aufgespart; der Abschnitt
Talente zeigt „Punkte gespart: 3" und „Ab Stufe 5". Auf Stufe 5 gehen vier Punkte auf einmal in Reihe 1 bis 4: Wer alle vier
in eine Bahn setzt, sieht den Pfadbonus sofort und lernt Pfadtreue am ersten Tag. Verworfen: Punkte erst ab Stufe 5 (nur
sieben auf Stufe 11), klassenweiter Vorbaum (zweiter Baum, den der Spec-Baum später doppelt).

**Erstwahl ortsfrei.** Stufe 5 fällt im Feld. Die erste Wahl ist überall außerhalb des Kampfes erlaubt; jeder spätere
Wechsel bleibt am Treffpunkt (`changeSpec` wie heute). Verworfen: Erstwahl nur am Treffpunkt (Rückweg mit vier toten
Punkten).

**Ablauf im Buch.** Reiter Figur, Abschnitt Talente: vor der Wahl drei Identitätskarten (5.2) statt der Spec-Reiter,
je Karte Beispielrotation in drei Zeilen (Aufbau, Auslöser, Finisher; die Rotationszeile des Talent-Tooltips liefert das
Muster), Knopf „Nehmen" mit Bestätigung im Buch. Nach der Wahl der Pfadbaum wie heute, Reihe 1 bis 4 sofort belegbar.
Der Mentor der getragenen Klamotte bekommt ein Abzeichen und drei Sätze (einer je Lehre).

**Probestunde (E-38, optional).** Knopf „Probieren" auf der Karte: die Spec gilt 60 s vorübergehend, zwei Arena-Gegner
oder Papp-Horst am Hof, Leiste und Chips zeigen das Spec-Kit, danach Rückbau (Spec, Punkte, Felder wie vorher, kein
Speichern währenddessen). Nur am Treffpunkt. Bausteine liegen vor (`spawnArena`, `clearArena`, `setArenaLevel`,
`outfitForLevel`). Verworfen: keine Probe („der kostenlose Wechsel ist die Probe"): billiger, aber der Kenner glaubt
keine Rotation, die er nicht gedrückt hat. Empfehlung: erst bauen, wenn der Kenner-Playtest zeigt, dass Karten allein
nicht reichen.

**Umskillen (E-37).** Kostenlos wie heute („teure Resets erzeugen Einheitsbuilds", MMO-VORBILDER). Drei Stufen: einzelnes
Talent zurücknehmen; Reihe tauschen (Pfadzähler ändert sich, Warnung, wenn ein Pfadbonus fällt); Lehre wechseln (alle Punkte
frei). Jede Stufe mit Bestätigung im Buch, die nennt, was verloren geht („7 Punkte, Pfadkrone Dauerpegel"), statt nativem
`confirm()`. Pfadbonus und Krone werden gezählt, nie gekauft; deshalb braucht Umskillen keinen Sonderfall.

### 5.4 Rollenwörter

Ein Wortschatz für alle Karten: Tank, Nahkampf-Schaden, Fernkampf-Schaden, Heilung, Zone, Kette, Zustand, Zufall,
Begleiter. Zusammensetzungen wie „Schadensheilung" oder „Fallen & Bewegung" entfallen als Anzeige; die IDs bleiben.

## 6 · Weitere Klassen (E-39)

**Bewertung.** E-02 setzt drei Archetypen, E-32 Nr. 8 lehnt nur die Trinkspiel-Klasse ab; eine vierte Klasse ist nicht
verboten, aber unentschieden. Systemisch decken die neun Specs Tank (zweimal), Heilung (zweimal) und Schaden (fünfmal) ab;
die Lücke ist Kontrolle (Wegdrücken, Festhalten, Bremsen als Kern) und der laufende Begleiter als Klassenidentität. Kosten
einer vierten Klamotte: ein kompletter Heldenatlas mit Ausrüstungsebenen, drei Kernmechaniken, 90 Talente, 90 Icons, ein
Mentor mit Sprechzeilen je Kapitel, ein siebter Kit-Platzsatz; dazu passen vier Karten nicht mit einer Wischbewegung auf
390 × 844. Kein Playtest hat bisher eine Spezialisierung länger als eine Arena-Runde gespielt.

| Kandidat (erfunden) | Dorf-Fantasie | Rolle | Ressource | Abgrenzung |
|---|---|---|---|---|
| Schlauch-Sabine, Feuerwehr-Ersatzkommandantin | „Löscht alles. Auch Grillfeste. Besonders Grillfeste." | Kontrolle, Fläche | Wasserdruck (baut sich außerhalb des Kampfes auf) | einzige Klasse mit Rückstoß als Grundangriff, Ausweichen als Sprung über Gegner; keine Kollision mit den neun Specs |
| Der Viehhalter | Hof am Dorfrand: Hund, Gans, Sau; die Tiere kämpfen, er treibt | Begleiter | Futter | erst sinnvoll, wenn laufende Begleiter über die Pfadkrone hinaus tragen; Gisela und Robbi sind der Prototyp |
| Maras Bandana (Kräuterhexe am Treff) | Tränke und Kräuter: „Was nicht heilt, betäubt. Was nicht betäubt, schmeckt." | Kontrolle, Schwächung | Gebräu | steht schon am Treff, braucht aber ein Mischsystem (Engine groß) |
| Ortsvorsteher, Vereinsmeier, Schützen-Schorsch | Verwaltung, Satzung, Präzision | Unterstützung, Fernkampf | | im Einzelspiel nur Debuffer, oder Kollision mit Kevin und Zündmeister: nicht empfohlen |

**Empfehlung.** Keine vierte Klasse, bevor (a) ein Kenner-Playtest die neun Specs auf Desktop und Handy bestanden hat,
(b) Akt 1 nach E-22 tief ist, (c) die Grafik einen vollständigen vierten Körper liefern kann und (d) die Produktion eine
Rollenlücke belegt, die kein Pfad deckt. Vorher die Kontroll-Fantasie als Pfad testen: Rausschmeißer (Türsteher) und
Nieten (Schrottkoloss) tragen sie schon halb. Erster Kandidat dann Schlauch-Sabine. Technische Vorarbeit, die nichts kostet:
`talentBuilds` in `rpg.js` über `CLASS_IDS` statt einer festen Liste aufbauen.

## 7 · Datenmodell

Alle IDs bleiben (E-04); alles Neue ist additiv. Besitz laut `docs/ROLLEN.md`.

```js
// content/classes.js (Klassendesign): neu outfit, difficulty, forWhom; die Zahlen kommen weiter aus passives über describe()
{id:'dieter',name:'Dosen-Dieter',role:'Tank · Tresenbrecher', /* wie heute */
 outfit:{name:'Dieters Kutte',stamp:'Trägst du gerade',unasked:'Dieters Kutte, ungefragt'},
 difficulty:1,forWhom:'Wer stehen bleibt, wenn andere rennen, und lieber pariert als ausweicht.'}

// content/talents.js SPECS (Klassendesign): neu resource, difficulty, forWhom, playstyle; text bleibt als Feld
'dieter-brawl':{name:'Kneipenschläger',classId:'dieter',role:'Nahkampf-Schaden',icon:'burst',
 resource:'Deckelstriche',difficulty:2,
 playstyle:{build:'Kellen, bis die Deckel-Uhr voll ist',trigger:'Uhr fast abgelaufen oder alle Striche',finish:'Abriss'},
 forWhom:'Wer eine Uhr im Blick behalten kann, während ihm einer aufs Maul haut.',
 text:'…'}

// content/mechanics.js paths (Klassendesign): neu text je Pfad, zahlenfrei, für Karten und Bahnköpfe
paths:[{name:'Dauerpegel',text:'Die Uhr läuft langsamer, der Kater ist kürzer.',bonus4:{stackDecay:3},bonus7:{hangoverShort:1}}, /* … */]

// content/balance.js (Balancing)
player:{ /* … */ specLevel:5},
talents:{bankBeforeSpec:true},
probe:{duration:60,enemies:2}          // nur wenn E-38 so entschieden wird

// content/story.js (Story)
HERO:{aliases:[{id:'socke',name:'Socke'},{id:'achtcent',name:'Achtcent'},{id:'sperrmuell',name:'Sperrmüll'}],unnamed:'Der Neue'}

// Spielstand (engine.js save()), defensiv gelesen wie settings; Altstand ohne hero: created=true, alias=null
hero:{alias:null,created:true}
// rpg.talents: spec darf null sein, bis gewählt wurde
```

**Prüfungen** (`content/checks/klassen.js`, `tests/content-klassen.test.mjs`; Schema beim Lead):

- jede Klasse hat `outfit`, `difficulty` 1 bis 3 und `forWhom` ohne Ziffer; jede Spec hat `resource`, `difficulty`,
  `forWhom`, `playstyle` mit drei Zeilen, alle ohne Ziffer (Welle-D-Regel: Zahlen aus den Regeln ableiten);
- jeder Pfad hat `text` ohne Ziffer; neun verschiedene `kind`-Werte in `SPEC_MECHANICS`;
- Rollenwörter aus einer festen Liste (5.4);
- `describe()` bekommt die Arten `spec`, `mechanic` und `path`, damit Karten und Tooltips dieselbe Quelle haben;
- Anni-Kurztext gegen `beatWindow`, kein Talent mit `rageGain`/`rageBurst` mehr, solange die Deckel-Uhr die Mechanik ist
  (Schlüssel bleiben in `KNOWN_EFFECTS`).

## 8 · Engine-Bedarf

Für `docs/backlog/engine.md` (Ziel, Grund, Abnahme, Dateien), Reihenfolge wie hier:

1. **Spec-Tor und Nullzustand.** `talentState` erlaubt `spec:null`; `mechanic(g)` liefert ohne Spec `null`; `applySpecKit`
   greift nur mit Spec; `combatStats` ohne Rückfall auf `dieter-wall`; `changeSpec` prüft `level >= specLevel`, Erstwahl
   ohne Treffpunkt, Folgewechsel mit; `gainXp` sendet `specUnlocked`. Abnahme: Test „Stufe 4: Türsteher-Kit nicht aktiv;
   Stufe 5 fern vom Spawn: Erstwahl möglich; zweite Wahl fern vom Spawn abgelehnt". Dateien: `talents.js`,
   `spec-mechanics.js`, `class-mechanics.js`, `rpg.js`, `engine.js`.
2. **Gebankte Punkte.** `talentPoints` bleibt; `learnTalent` verweigert ohne Spec. Abnahme: Stufe 5 ohne Talente hat vier
   freie Punkte, `talentState` eines Altstands mit Punkten im Standard-Baum lädt die Spec als gewählt (kein Kenner steht
   plötzlich ohne Spec da).
3. **Held-Zustand.** `this.hero={alias,created}` aus `saved.hero`, `save()`-Feld, `setHero(patch)` mit Ereignis
   `heroChanged`. Abnahme: Roundtrip über `save()` behält `hero`; Altstand ohne `hero` ergibt `created:true`.
4. **Alte Spec-Regeln ausmustern.** Rausch (`classState.rage`, `modifyHit`), Hauspflege-Sonderfälle und Kevin-Iron-Faktoren
   in `class-mechanics.js` und `engine.js` nur noch über Effektschlüssel, die ein Talent tatsächlich setzt. Abnahme:
   Kneipenschläger ohne Talent zeigt genau einen Stapel im HUD.
5. **Probestunde** (nur nach E-38): `probeSpec(g,spec)` mit Schnappschuss, temporärer Spec, Arena, Timer, Rückbau. Abnahme:
   nach Ablauf `spec`, `learned` und `fields` wie vorher; kein `save` während der Probe.
6. **Ereignisse:** `specUnlocked`, `heroChanged`, optional `probeStarted`, `probeEnded`. Übergabe an UI in
   `docs/UEBERGABE-UI-<Datum>.md`.

## 9 · UI-Bedarf

Für `docs/backlog/ui.md`; Texte ausschließlich aus `content/`.

- **Abschnitt Bande:** Vergleichsleiste, Spec-Chips, Zwei-Tipp-Regel mit Puppe, Rücksprung in Idas Gespräch, Stempel
  „ungefragt", Detailfenster für die Spec-Karte. Bausteine: `clanMenu`, `.clan-card`, `data-character-art`,
  `describeCard`, `touchDetail`.
- **Abschnitt Talente:** Zustände „gesperrt bis Stufe 5" mit Punktezähler, „wählbar" mit drei Identitätskarten und
  Bestätigung, „gewählt" mit dem Pfadbaum wie heute; Bestätigungen für Reihe tauschen, Reset und Lehre wechseln als
  Abschnittsknopf (`touchhelp`-Muster) statt `confirm()`.
- **HUD:** Alias statt Mentorname; Abzeichen „Spec wählen" ab Stufe 5 am Figur-Reiter (Muster freie Punkte).
- **Hilfe:** Abschnitte für Kernmechanik und Pfad über `describe('mechanic')`, `describe('path')`.
- **Mobil:** Karten je Breite, Leiste scrollbar, 44-px-Flächen, Langdruck-Tooltip, `npm run mobile:check`.
- **Prüfskript** `scripts/charakter-check.mjs` (Muster `character-sheet-check.mjs`): Erststart, Ida, Bande, Vorschau,
  Anziehen, Rücksprung; Stufe 5 per Arena, Karten, Nehmen, vier Punkte in eine Bahn, Pfadbonus-Abzeichen; Reset über
  Abschnittsknopf; beides bei 2024 × 900 und 390 × 844, Konsole leer, Screenshots; Scorecard mindestens 4 von 5 (E-08).

## 10 · Story- und Grafik-Bedarf

**Story** (`docs/backlog/story.md`), alle Texte im Ton E-20:

1. Idas Reaktion je Klamotte (drei Zeilen) und ein Satz in Schritt 0 zum späteren Wechsel am Treffpunkt.
2. Aliasliste (drei bis sechs Dorfnamen aus bestehenden Texten), Idas Angebot, Platzhalter für den namenlosen Zustand.
3. Mentoren-Zeilen zur Lehre auf Stufe 5: je Klasse drei Sätze (einer je Spec), Anschluss an „Naturtalent"; Annahme,
   Wechsel, optional Probestunde.
4. Zeilen für Pfadbonus und Pfadkrone (je ein Satz, erst Behauptung, dann der Nachsatz).
5. Beschriftungen: `changeFigure` „Figur wechseln" wird „Klamotten wechseln"; Stempel „ungefragt"; Bestätigungsknöpfe;
   HUD-Beschriftung für den namenlosen Zustand; Umzug der Hardcodes aus `clan-ui.js` nach `content/panel-ui.js`.
6. Tonprüfung der 27 Pfadnamen, der Pfadtexte und der Rollenwörter.

**Grafik** (`docs/GRAFIK-BEDARF.md`), nichts Neues zwingend: Korken-Skala 1 bis 3 (ein Motiv), Klamotten-Icons Kutte,
Schürze, Gürtel (32 × 32) für Chips und Stempel, sonst Bestand: Spec-Icons vorhanden, Talent-Icons und Pfad-Untersetzer
sind in der Astra-Übergabe bestellt, Platzhalter laufen. Kein Fremden-Körper bestellen, bis E-36 entschieden ist.

## 11 · Etappen

Reihenfolge Inhalt vor Engine vor UI vor Grafik (E-06); jede Etappe endet mit Beleg und Fast-Forward (E-07).

| Etappe | Rollen | Inhalt | Abnahme | Playtest-Gate |
|---|---|---|---|---|
| 0 · Entscheidungen | Lead, Produktion | E-34 bis E-40 aus Abschnitt 13; Besitzer für `mechanics.js`, `spec-mechanics.js`, `glossary.js` in ROLLEN.md | Einträge in ENTSCHEIDUNGEN.md mit verworfener Alternative | keins |
| 1 · Inhalt | Klassendesign, Story, Balancing | Widersprüche aus Abschnitt 1, neue Felder (Abschnitt 7), Pfadtexte, Rollenwörter, `describe`-Arten, Prüfungen; Textliste (10); `specLevel`, `bankBeforeSpec` | `npm run content:check` und `npm test` grün, Beleg: neun Specs mit `playstyle`, 27 Pfadtexte, 0 Talente mit `rageGain` | keins (nur Daten) |
| 2 · Engine | Engine | Punkte 1 bis 4 und 6 aus Abschnitt 8 mit Tests; Übergabe an UI | Testzahl im Bericht, Altstand lädt mit Spec und Punkten | keins |
| 3 · UI und Mobile | UI, Mobile | Abschnitt 9 komplett, Prüfskript, Screenshots beider Größen, UI-ABNAHME-Tabelle | `charakter-check` grün, `mobile:check` grün, Scorecard ≥ 4 | Neuling (erste Viertelstunde mit Klamotte und Dorfname, 40 Aktionen), Kenner (Stufe 5 über Arena: Karten, Nehmen, vier Punkte in eine Bahn, Umskillen, 50 Aktionen); kein „bricht ab" |
| 4 · Nachzug | Balancing, Grafik, Engine | Balance-Lauf mit `spec-sim` je Spec nach dem Playtest; Astra-Motive einbinden; Probestunde und Haufen-Requisit nur nach E-38 und Playtest-Befund | BALANCE-REPORT mit neun Spec-Zeilen, Scorecard erneut | Prüfer: Versprechen der Karten gegen Verhalten |

## 12 · Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Roadmap sagt Basis vor Content (E-26). Das Papier ist Content und hängt an E-32 als der einzigen Ausnahme | Produktion priorisiert in Etappe 0; Etappe 1 ist ohne Spielverhalten und kann jederzeit laufen |
| Alte und neue Mechaniken parallel (Rausch neben Deckel-Uhr) landen auf einer Karte | Etappe 1 räumt auf, bevor eine Karte entsteht; Prüfung „kein Talent mit rageGain" |
| Spec-Tor nimmt Kennern die frühe Mechanik (heute ab Stufe 1 aktiv) | Altstände mit Punkten behalten ihre Spec; nur neue Stände starten ohne; Kenner-Playtest misst, ob Stufe 1 bis 4 ohne Spec zu flach ist |
| Bildungsmoment auf Stufe 5 überfrachtet (drei Karten, vier Punkte, Pfade) | erst Karten, dann Baum; Probestunde optional; Playtest misst Aktionen bis zum ersten Talent |
| Dorfnamen treffen den Ton nicht oder wirken beliebig | Story wählt aus bestehenden Texten; „später" bleibt erlaubt; Alias ist Anzeige, kein Schlüssel |
| Grafik kann den Fremden nicht vom Mentor trennen | E-36 verschiebt Aussehen; Story trägt den Widerspruch als Witz |
| Prüfskripte und Zähler auf altem Stand | Etappe 3 hebt Zahlen an, Scorecard je Bildschirm |

## 13 · Offene Entscheidungen (Vorschläge E-34 bis E-40)

| Nr. | Frage | Optionen | Empfehlung | Verworfene Alternative |
|---|---|---|---|---|
| E-34 | Spec-Tor ab Stufe 5, gebankte Punkte, Erstwahl ortsfrei | a) Tor + Bank + Erstwahl überall, Wechsel am Treffpunkt; b) wie heute (erste Spec ab Stufe 1 still aktiv); c) Punkte erst ab Stufe 5 | a | b (E-32 Nr. 1 steht nur auf dem Papier); c (nur sieben Punkte auf Stufe 11, gegen E-32 Nr. 2) |
| E-35 | Dorfname des Helden im HUD | a) drei Bierdeckel von Ida nach der Hofprobe, „später" erlaubt; b) feste Beschriftung ohne Wahl; c) Freitext | a, bis dahin b | c (Ton E-20 nicht prüfbar, Handy-Tastatur, kein Dialog kann reagieren) |
| E-36 | Aussehen des Fremden | a) Aussehen = Klamotte + Ausrüstung, keine Optionen; b) Hautton über Maske; c) eigener Fremden-Körper | a jetzt, neu stellen nach der 3D-Lieferung | c jetzt (kompletter Atlas-Satz je Ebene, Grafik groß) |
| E-37 | Bestätigungen für Klamotte, Lehre, Umskillen | a) Zwei-Tipp bzw. Bestätigung im Buch, kostenlos; b) Ein-Tipp wie heute; c) Kosten in Pfandmarken | a | b (verletzt M-06); c (zweite Währungsanzeige, Fehlerfall „zu arm", Einheitsbuilds) |
| E-38 | Probestunde vor der Lehre | a) 60 s temporäre Spec am Treffpunkt mit Arena-Gegnern; b) keine Probe, kostenloser Wechsel ist die Probe; c) nur Textvorschau | b zuerst, a nach Playtest-Befund | c allein (Kernmechaniken sind ohne Gedrücktes schwer zu glauben) |
| E-39 | Vierte Klasse | a) vertagen bis zu den Bedingungen in Abschnitt 6, Kandidatin Schlauch-Sabine vormerken; b) jetzt planen | a | b (Basis vor Content, keine Playtest-Daten zu Specs, vierter Körper fehlt) |
| E-40 | Besitz von `content/mechanics.js`, `spec-mechanics.js`, `content/glossary.js` | a) Klassendesign (mechanics.js), Engine (spec-mechanics.js), Lead (glossary.js, weil Begriffe aller Rollen); b) alles Klassendesign | a | geteilter Besitz (gegen E-19) |

Ausdrücklich nicht Teil dieses Papiers: Händler und Handwerk, laufende Begleiter über die Pfadkrone hinaus, Akt 2 (E-22).

## 14 · Backlog-Schnipsel je Rolle

Erst nach Etappe 0 in die Inboxen übernehmen.

**docs/backlog/lead.md**

- [ ] **Entscheidungen E-34 bis E-40** (Brainstorm Charaktererstellung, 2026-09-19): Ziel: sieben Fragen aus
  `docs/CHARAKTERERSTELLUNG-BRAINSTORM-2026-09-19.md` Abschnitt 13 der Produktion vorlegen. Grund: ohne E-34 bleibt E-32
  Nr. 1 unerfüllt. Abnahme: Einträge in ENTSCHEIDUNGEN.md mit verworfener Alternative. Dateien: `docs/ENTSCHEIDUNGEN.md`.
- [ ] **Dateibesitz nachziehen**: `content/mechanics.js`, `spec-mechanics.js`, `content/glossary.js` in `docs/ROLLEN.md`
  eintragen (E-40). Abnahme: Tabelle nennt drei Besitzer.

**docs/backlog/klassen.md**

- [ ] **Vier Widersprüche vor den Karten** (Abschnitt 1): Rausch-Talente auf Deckel-Uhr umschreiben (IDs bleiben),
  Anni-Kurztext auf das Taktfenster aus `passives`, Rollenwörter aus der festen Liste, Prüfungen dazu. Abnahme:
  `content:check` grün, kein Talent mit `rageGain`/`rageBurst`, Kurztext nennt dieselbe Zahl wie `describe()`.
- [ ] **Identitätskarten-Felder** (Abschnitt 7): `outfit`, `difficulty`, `forWhom` je Klasse; `resource`, `difficulty`,
  `forWhom`, `playstyle` je Spec; `text` je Pfad; `describe`-Arten `spec`, `mechanic`, `path`. Abnahme: Prüfungen aus
  Abschnitt 7 grün, Beleg „9 Specs, 27 Pfadtexte".

**docs/backlog/story.md**

- [ ] **Textliste Charaktererstellung** (Abschnitt 10, Punkte 1 bis 6). Abnahme: `content:check` Story grün, jede Zeile
  mit Behauptung und Nachsatz, keine reale Person.

**docs/backlog/balance.md**

- [x] (teilweise, E-37 am 2026-09-20: `player.specLevel` steht) **Konstanten**: `player.specLevel`, `talents.bankBeforeSpec`, optional `probe` in `content/balance.js`; nach dem
  Kenner-Playtest ein `spec-sim`-Lauf je Spec mit Stufe-5-Build (vier Punkte in einem Pfad). Abnahme: BALANCE-REPORT mit
  neun Zeilen.

**docs/backlog/engine.md**

- [x] (Punkte 1 und 2 durch E-37 erledigt: Hauptbaum ab Stufe 5, gesparte Punkte, erste Wahl überall; offen bleiben Held-Zustand und Ausmusterung) **Spec-Tor, gebankte Punkte, Held-Zustand, Ausmusterung alter Spec-Regeln** (Abschnitt 8, Punkte 1 bis 4 und 6).
  Abnahme: genannte Tests grün, Altstand lädt mit Spec und Punkten, Übergabe an UI geschrieben.

**docs/backlog/ui.md**

- [ ] **Bande und Talente** (Abschnitt 9): Vergleichsleiste, Zwei-Tipp, Rücksprung zu Ida, Spec-Karten mit Bestätigung,
  Bestätigungen statt `confirm()`, HUD-Alias, Prüfskript `charakter-check.mjs`, `mobile:check`. Abnahme: Skripte grün auf
  beiden Größen, Scorecard ≥ 4, UI-ABNAHME-Tabelle, Playtest Neuling und Kenner ohne „bricht ab".

**docs/GRAFIK-BEDARF.md**

- [ ] Korken-Skala (16 × 16), Klamotten-Icons Kutte, Schürze, Gürtel (32 × 32); Platzhalter: Text-Chips.

## Anhang A · Befund der Repo-Prüfung

Drei Finder (Inhalt, Engine, Oberfläche und Dokumente) und je Befund zwei Prüfer liefen am 18.09. auf Stand 6182421
(vor E-32 Etappe 2); die Liste ist gegen ffa884d nachgeprüft. Erledigt seit dem 19.09. sind unter anderem: Glossar-Einträge
für die neuen Mechanikbegriffe, `tuning.mechanics`, Pfadboni in der Laufzeit, Robbi-Leben und Aggro, „Pegel" doppelt
belegt (jetzt Deckelstriche), Spec-Wechsel-Fehlgrund als Dialog, `SPECS.text` auf E-32.

**Noch offen (Rolle in Klammern):**

1. Rausch und Deckel-Uhr laufen parallel; `class-mechanics.js` füllt `classState.rage` weiter, zwei Talente nutzen
   `rageGain` (Klassendesign, Engine).
2. E-32 Nr. 1 „ab Stufe 5" ist nicht umgesetzt: Standard-Spec ab Stufe 1, `mechanic(g)` prüft keine Stufe, Punkte fallen
   ab Stufe 2 in den Standard-Baum (Engine, Entscheidung E-34).
3. Annis Passiv-Kurztext nennt 0,85 bis 1,5 s, `beatWindow` ist [1; 1,9] (Klassendesign).
4. Rollenwörter in `SPECS.role` passen nicht zu den Kernmechaniken (Klassendesign).
5. `content/mechanics.js`, `spec-mechanics.js`, `content/glossary.js` ohne Besitzer in `docs/ROLLEN.md` (Lead).
6. Kit-Texte in `SPEC_MECHANICS` enthalten feste Zahlen; die Welle-D-Prüfung deckt `kit.text` nicht ab (Klassendesign,
   Lead für die Prüfung).
7. `describe()` kennt keine Art für Spec, Mechanik oder Pfad; Karten und Tooltips haben dafür keine gemeinsame Quelle
   (Klassendesign).
8. Klamottenwahl ist Ein-Tipp und ohne Rückweg zu Ida; HUD zeigt den Mentorennamen (UI, Story; Playtest Neuling Hänger
   3 und 11).
9. Spec-Wechsel und Reset laufen über natives `confirm()` beziehungsweise ohne Rückfrage (UI).
10. Kein Playtest hat eine Spezialisierung außerhalb der Arena gespielt; die beiden Kenner-Läufe vom 18./19.09. liefen in
    der Trainingsarena (Lead: Playtest-Auftrag nach Etappe 3).

Nicht abschließend geprüft (Prüfer fehlten): Versionsnummer 0.20.0 gegen Commit-Texte, `content/README.md` gegen die
heutigen Registries, Klassen-Backlog gegen erledigte Punkte, Cache-Version im Site-Build.

## Anhang B · Herkunft

| Idee im Papier | Aus Blickwinkel |
|---|---|
| Jede Ebene stellt genau eine Frage; Identitätskarten der neun Specs; Kandidatin Schlauch-Sabine; Abgrenzungsregel über `kind` | Systemdesign |
| Kein neuer Bildschirm, Abschnitt Bande bleibt, Rückweg zu Ida, Spec-Wahl als Abschnitt Talente, YAGNI bei Name und Aussehen | Mobile-first und minimal |
| Vergleichsleiste aus `describe()`, Spec-Chips auf der Karte, Bestätigung nennt den Verlust, Rotationszeile je Karte | MMO-Kenner |
| Dorfname aus Idas Mund als Handlung, Lehre beim Mentor, Mentoren-Sätze, Haufen als Weltrequisit (Ausbaustufe) | Fiktion zuerst |

Alle vier Entwürfe stimmten überein: kein Bildschirm vor dem Spiel, Klamottenwahl bleibt die Klassenwahl, Punkte vor Stufe 5
aufsparen, Umskillen kostenlos, vierte Klasse vertagen. Uneins waren sie bei Dorfname, Aussehen und Probestunde; das Papier
nimmt jeweils die Variante mit dem kleinsten Aufwand und stellt die andere als Option in Abschnitt 13.
