# Klassen, Spezialisierungen, Talentbäume · Brainstorm 2026-09-18

Anlass: „Aktuell sind alle gleich: 3 von irgendwas generieren, dann finishen. Zu eintönig, nicht kreativ, nicht interaktiv."
Dieses Papier bewertet die eingebrachten Ideen, schlägt je Spezialisierung eine eigene Kernmechanik vor und skizziert
das Talentbaum-Redesign (Faktor 3). Nichts davon ist entschieden; offene Fragen stehen am Ende. Zahlen sind Entwürfe für
`content/tuning.js` (Balancing), keine Festlegung.

## 1 · Ist-Stand (Repo, Build #118)

| Punkt | Stand |
|---|---|
| Klassen | 3 (Dosen-Dieter, Bärbel, Kevin), je 3 Spezialisierungen = 9 |
| Talente | 10 je Spezialisierung = 90, ein Pfad, keine Verzweigung |
| Grundschleife | überall gleich: Schwung 1–3 aufbauen (Kelle/Autoangriff) → Entladung; Markierung + 3 Schwung = RESONANZ |
| GCD | 1,15 s Basis, min. 0,75 s bei Tempo (`content/balance.js gcdBase/gcdMin`) |
| Ressourcen | Schwung (0–3), Randale (0–100), Spec-Zustände: Rausch (Kneipenschläger), Deckung (Türsteher) |
| Procs | Rahmen vorhanden (`content/procs.js`): Zündung, Fenster, Gratis/Verstärkt/Reset, Leuchten + Varianten in der Leiste (seit heute) |
| Bodenziel | ein `ground`-Kniff je Klasse (Deckelwelle, Eimer, Sprengsatz) – relativ spät, gleiche Rolle |
| Pets | keine. Begleiter-Rahmen fehlt komplett (Engine: `life.actors` kennt nur Dorfbewohner) |
| Platzierte Objekte | keine (Fässer, Totems, Fallen) |
| DoT / Ketten | keine Übertragung, keine Kettenziele |
| Casts im Laufen | nein; Kanalisierung bricht bei Eingabe ab |

**Befund Cast-Verzug (heute behoben, Build folgt):** `movingToCast` zählte Restgeschwindigkeit als Laufen. Nach dem
Loslassen bremst der Held mit `exp(-24·dt)` aus, von 100 px/s auf < 1 px/s dauert das ~0,2 s – erst dann startete der
Zauber, und in den 0,2 s brach `tickCasting` ihn sogar ab. Jetzt zählen nur echte Eingaben (Tasten, Klickziel, Touch-
Stick); Restgeschwindigkeit wird beim Zauberstart auf null gesetzt. Der Held „stoppt für den Zauber" statt der Zauber
„wartet auf den Stopp".

## 2 · Bewertung der Ideen · schwächster Punkt zuerst

Kurzform je Idee: **Stärke** · **Risiko** · **Engine-Aufwand** (S/M/L) · **Vorschlag**.

1. **Rein zufällige Proc-Klasse.** Stärke: Slot-Machine-Reiz, jeder Kampf anders. Risiko: Frust ohne Steuerung, schwer zu
   balancen, auf Mobil unlesbar. Aufwand M. Vorschlag: keine ganze Klasse, sondern *eine* Spezialisierung (Kevin
   „Bastler", siehe §3) mit Pity-Timer (nach 4 Fehlzündungen garantiert Überzündung) – Zufall mit Sicherheitsnetz.
2. **Trinkspiel-Spezialisierung.** Stärke: einzigartig, passt zum Ton. Risiko: Minispiel im Kampf kann Fluss brechen,
   auf Touch heikel. Aufwand M. Vorschlag: „Stammtisch"-Bärbel – Ansage/Antwort-Rhythmus: der Gegner „prostet" (Cast-
   Balken), Antwort im richtigen Moment = Konter mit Bonus, daneben = Kater. Das ist Parade-Timing mit Charme, kein
   Quicktime-Event.
3. **Pets.** Stärke: sichtbare Klassenidentität, Ziel für Talente. Risiko: größter Aufwand im ganzen Papier – KI,
   Wegfindung, Aggro-Regeln, Grafik je Pet, Touch-Befehle. Aufwand L. Vorschlag: eine Etappe später (§5), zuerst
   *stationäre* Begleiter (Fass, Automat, Gans auf Nest), die keine Wegfindung brauchen.
4. **Casts im Laufen.** Stärke: Fluss. Risiko: Kanalisierung verliert Bedeutung, wenn alle laufen dürfen. Aufwand S.
   Vorschlag: je Klasse genau eine Spezialisierung, die ihre Signaturzauber im Laufen wirkt (Filter-Furie, Pfandjäger),
   als Talententscheidung Reihe 2 („Laufend zapfen" vs. „Stehend härter").
5. **GCD 1,5 s, Proc-Kniffe 1 s.** Stärke: klarere Taktung, Procs fühlen sich schneller an. Risiko: 1,5 s ist auf Mobil
   mit Autoangriff zäh; unser Tempo-Wert drückt heute schon auf 0,75. Aufwand S (nur Tuning). Vorschlag: Basis 1,5 s,
   min. 1,0 s; proc-ausgelöste Kniffe und Varianten (Eskalation, RESONANZ) mit eigenem GCD 1,0 s. Vorher im Kenner-
   Playtest gegenprüfen.
6. **Stackender Buff mit Ablauf, Finisher vor Ablauf.** Stärke: echte Timing-Entscheidung, sichtbare Spannung. Risiko:
   ohne klare Anzeige (Balken über der Leiste) nur Frust. Aufwand M. Vorschlag: Kernmechanik Kneipenschläger („Pegel",
   §3).
7. **DoT mit Übertragung → AoE.** Stärke: eigenes Spielgefühl (Streuen statt Klopfen), gute Talentachse. Aufwand M
   (Status je Gegner, Sprungregel, Render). Vorschlag: Putzpyramide („Schimmel") und Zündmeister („Lunte").
8. **Frühe Zielfertigkeit zum Platzieren.** Stärke: interaktiv, unterscheidet Klassen sofort. Aufwand S – `ground`
   existiert. Vorschlag: auf Stufe 3 vorziehen, je Klasse andere Form (Linie/Kreis/verzögerte Fläche).
9. **Kettenblitze.** Stärke: befriedigend, Kevin-typisch. Aufwand M (Kettenlogik + Blitzlinie). Vorschlag: Zündmeister-
   Signatur „Kurzschluss", 3 Sprünge, −30 % je Sprung, Talente ändern Sprungregel.
10. **Procs verstärken einen Kniff, setzen CD zurück, heben in Leiste hervor.** Vorhanden (`procs.js`, seit heute mit
    Varianten). Ausbau: je Spezialisierung *ein* Signatur-Proc, der die Rotation umbaut statt nur +x %.
11. **Ressource sammeln → Zustand mit verstärkten Kniffen (zeitbasiert).** Stärke: nutzt das neue Varianten-System
    direkt. Aufwand S–M. Vorschlag: „Zustände" je Spec (§3): 100 Randale → Zustand 10 s, alle Kniffe wechseln Namen/Icon.
12. **Längerfristig platzierte Fässer mit Biersorten.** Stärke: einzigartig, Stellungsspiel, gute Grafik-Motive.
    Aufwand M (stationäres Objekt mit Radius-Aura – gleichzeitig der Vorläufer für Pets). Vorschlag: Kernmechanik
    Zapfmeister.
13. **Talentbäume ×3 mit Pfaden, visuelles Redesign.** Stärke: die eigentliche Antwort auf „alle gleich". Risiko: 270
    Talente, die nur Zahlen drehen, sind schlimmer als 90. Aufwand L (Inhalt) + M (UI). Regel: **jedes Talent ändert
    eine Regel, keins nur eine Zahl** (§4).

## 3 · Vorschlag: eine Kernmechanik je Spezialisierung

Grundsatz: Die Grundschleife (Schwung → Entladung) bleibt als gemeinsames Fundament für Stufe 1–4, damit der Einstieg
gleich bleibt. Ab der Spezialisierung (Stufe 5) **ersetzt** jede Spec einen Teil der Schleife durch ihre Mechanik – nicht
nur ergänzt.

| Spezialisierung | Kernmechanik | Ressource / Anzeige | Signatur-Kniff (Stufe 5) | Zustand / Finisher |
|---|---|---|---|---|
| Dieter · Türsteher | **Deckung als Waffe**: Parade lädt Deckung, Deckung entlädt sich als Schadensspiegel | Deckung 0–100 (Schild-Balken) | „Rausschmiss" – Stoß in Linie, Schaden = verbrauchte Deckung | bei 100 Deckung 8 s „Hausverbot": Paraden reflektieren 100 % |
| Dieter · Kneipenschläger | **Pegel** (Idee 6): jede Kelle +1 Pegel (max 10), Ablauf 8 s, Kelle frischt auf | Pegel-Stapel mit Ablaufring über der Leiste | „Abriss" – verbraucht Pegel, Schaden ×Pegel, Cooldown 0 bei Pegel ≥ 8 | Ablauf ohne Abriss = „Kater" 3 s (−20 % Tempo) → Timing-Entscheidung |
| Dieter · Zapfmeister | **Fässer stellen** (Idee 12): max 2 Fässer, 20 s, Radius 6 m | Fass-Symbole mit Restzeit | „Anstich" – Fass platzieren; Sorte wählbar per Talent: Pils (Tempo), Weizen (Heilung), Bock (Schaden) | „Fassanstich"-Finisher zündet alle Fässer: Bock explodiert, Weizen heilt voll, Pils gibt 5 s Laufzauber |
| Bärbel · Landhaus-Lazarett | **Vorsorge**: Heilung überschüssig → Schild; Schild bricht → Gegner-Debuff | Schild + „Vorrat" 0–5 | „Hausmittel" – 3 Ladungen, im Laufen wirkbar | bei 5 Vorrat „Großreinemachen": 10 s alle Heilungen treffen zusätzlich als Schaden |
| Bärbel · Putzpyramide | **Schimmel-DoT mit Übertragung** (Idee 7): DoT springt bei Tod oder bei Kelle-Treffer auf nächsten Gegner (Radius 4 m) | Schimmel-Zähler am Ziel | „Sporenwolke" – Bodenziel (Kreis), verteilt Schimmel auf alle darin | „Durchputzen": alle Schimmel-Stapel explodieren (AoE-Finisher) |
| Bärbel · Filter-Furie | **Randale-Zustand** (Idee 11): bei 100 Randale 10 s „Putzwut" – alle Kniffe wechseln zu Varianten (Icon+Name) | Randale + Zustandsring | „Wischer" – Kegel, im Laufen wirkbar (Idee 4) | Zustand endet mit „Auswringen" (Finisher, Schaden = übrige Randale) |
| Kevin · Zündmeister | **Lunte + Kettenblitz** (Ideen 7, 9): DoT „Lunte" explodiert bei Ablauf; „Kurzschluss" springt 3× | Lunten-Zähler, Blitzlinie | „Kurzschluss" – Kette, −30 % je Sprung, Lunten am Ziel zünden sofort | 3 gezündete Lunten = „Kettenreaktion" (Kurzschluss-CD 0, 5 Sprünge) |
| Kevin · Schrottkoloss | **Aufbau-Automat** (stationärer Begleiter, Vorstufe zu Pets, Idee 3): „Dosen-Robbi" steht 15 s, zieht Aggro, feuert | Robbi-Leben als Mini-Balken | „Aufstellen" – Bodenziel; Talente bauen Robbi um (Schild, Magnet, Kanone) | „Überlast": Robbi explodiert (AoE) – Finisher opfert den Begleiter |
| Kevin · Pfandjäger | **Bastler-Zufall** (Idee 1, mit Netz): jeder Wurf ist Fehlzündung/Normal/Überzündung; Pity-Timer | Glücksrad-Anzeige (3 Felder) | „Pfandkanone" – im Laufen wirkbar | „Jackpot": 3 Überzündungen in Folge → 8 s alle Würfe Überzündung |

Was das für die Rotation bedeutet: Kneipenschläger spielt gegen die Uhr, Zapfmeister spielt Stellung, Putzpyramide streut,
Zündmeister kettet, Schrottkoloss baut, Pfandjäger zockt, Filter-Furie lädt und entlädt, Türsteher kontert, Lazarett
wandelt Heilung in Schaden. Kein Paar teilt sich die Grundlogik nach Stufe 5.

**Pets (Idee 3) in zwei Stufen:** erst stationär (Robbi, Fässer, Gans „Gisela" auf dem Nest = Lazarett-Talent, heilt im
Radius), dann laufende Begleiter mit einfacher Folge-KI (Etappe 4, §5). Damit kommt die Wegfindung erst, wenn der Rest
steht.

## 4 · Talentbäume · Faktor 3 mit Pfaden

Ziel: 30 Talente je Spezialisierung, drei benannte **Pfade** (Spielrichtungen) je Spec, Wahlpunkte statt Liste.

- **Aufbau je Spec:** 6 Reihen. Reihe 1, 3, 5 = *Wahl 1 aus 3* (je Pfad ein Talent, nur eins nehmbar). Reihe 2, 4 =
  *Pfadknoten* (verstärkt den gewählten Pfad, sichtbar am Pfad hängend). Reihe 6 = *Schlussstein* je Pfad (1 aus 3, ändert
  den Finisher). Das sind 3+3+3+3+3+3 Wahlkarten = 18 sichtbare Entscheidungen + 12 Pfadknoten = 30.
- **Regel für jedes Talent:** ändert eine Regel (Zusatzsprung, anderer Auslöser, neue Variante, anderes Ziel, Laufzauber),
  nie nur „+x %". Wo ein Zahlenbonus nötig ist, hängt er an einer Bedingung („nur gegen Markierte", „nur unter Pegel 5").
- **Beispiel Kneipenschläger, drei Pfade:** *Dauerpegel* (Pegel fällt langsamer, Kater schwächer, Abriss nur bei 10 →
  Sicherheit), *Blitzabriss* (Abriss ab Pegel 5, kürzere Uhr, Kater härter → Tempo), *Rundenkämpfer* (Pegel geht auf
  Gegner über: „Angetrunken"-Debuff, Abriss trifft alle Angetrunkenen → AoE).
- **Visuelles Redesign:** Bierdeckel-Netz statt Liste – die Pfade laufen als drei Bahnen von unten nach oben, Wahlkarten
  als runde Untersetzer (Stil C, runde Linien, E-28), Pfadknoten als kleine Kronkorken auf der Bahn, gewählter Pfad
  leuchtet Kraftpapier-gold. Mobil: eine Bahn je Bildschirmbreite, wischen zwischen Pfaden, langes Drücken = Tooltip
  (bestehende Touch-Regel). Vergleich-Tooltip zeigt die Rotation *vor/nach* dem Talent (drei Zeilen: Aufbau, Auslöser,
  Finisher).
- **Umskillen:** wie heute am Clan-Tisch, Pfadwechsel setzt nur die betroffene Bahn zurück.

## 5 · Etappen (Vorschlag)

1. **Fundament (klein, sofort):** GCD-Umstellung testen (Balancing), Bodenziel je Klasse auf Stufe 3 (Inhalt), Zustände
   über das Varianten-System (Filter-Furie als Pilot), Cast-Verzug ist erledigt.
2. **Drei Piloten, je Klasse einer:** Kneipenschläger-Pegel, Putzpyramide-Schimmel, Zündmeister-Kette. Damit sind Buff-
   Uhr, DoT-Übertragung und Kettenziel als Engine-Bausteine da. Kenner-Playtest danach.
3. **Stationäre Objekte:** Fässer (Zapfmeister), Robbi (Schrottkoloss), Gisela (Lazarett). Ein Engine-Baustein
   „platziertes Objekt mit Aura/Leben/Ablauf" für alle drei.
4. **Restliche Specs + Pfad-Talentbäume** mit dem Redesign; Talente entstehen je Spec entlang der drei Pfade.
5. **Laufende Pets** auf dem Objekt-Baustein (Folge-KI, Aggro, Touch-Befehl „Sitz/Fass").

Rollen: Engine (Bausteine 2/3/5), Inhalt (Talente, Namen, Texte), Balancing (alle Zahlen in `tuning.js`), UI (Pegel-
Uhr, Zustandsring, Blitzlinie, Talentbaum-Redesign), Art (Fässer, Robbi, Gisela, Blitz, Pfad-Grafik).

## 6 · Offene Entscheidungen

1. GCD 1,5 s als Basis – ja, aber mit Kenner-Playtest davor? (Betrifft alle Klassen sofort.)
2. Pets: Zwei-Stufen-Weg (stationär → laufend) akzeptiert, oder sofort laufende Begleiter?
3. Trinkspiel als Bärbel-Mechanik (Ansage/Antwort) oder als vierte Klasse „Stammtisch"?
4. Zufalls-Spec: Pfandjäger als Bastler mit Pity-Timer – reicht das an Zufall, oder soll die Spec komplett würfeln?
5. Talentbaum-Redesign vor oder nach den drei Piloten? (Vorschlag: nach, damit die Pfade echte Mechaniken tragen.)
