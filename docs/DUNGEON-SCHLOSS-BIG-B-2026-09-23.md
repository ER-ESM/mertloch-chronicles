# Erster Dungeon „Schloss Big B" · Planung 2026-09-23

Anlass: Auftrag „Plane und bereite den ersten Dungeon vor mit allem was dazu gehört, mit mehreren Bossen, Trash etc. Der
Endboss ist Big B, der Lügenbaron." Grundlage: der Meilenstein „Dungeons" aus [E-45](ENTSCHEIDUNGEN.md) (Söldner als
Gruppenersatz), die offenen Punkte „Dungeon-Merkmale" in [backlog/engine.md](backlog/engine.md) und
[backlog/gameplay.md](backlog/gameplay.md), Stand `main` a595fa4.
**Stand:** Planung, nichts entschieden; Entscheidungen trifft die Produktion ([ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md)).
Alle Zahlen sind Entwürfe für Balancing (`content/tuning.js`, Balance-Sheet E-57). Alle Spielertexte sind Beispiele im Ton
E-20 und werden von Story ersetzt oder abgenommen. Vorschläge heißen V-D1 bis V-D8; die E-Nummer vergibt der Lead.

**Kurzfassung.** Der erste Dungeon heißt „Schloss Big B" und ist in Wahrheit eine gemietete Doppelgarage an der
Burgstraße mit Kellerabgang in einen alten Basaltkeller. Big B, selbsternannter Freiherr und Immobilien-Influencer,
behauptet, ihm gehöre das halbe Maifeld, jetzt auch das Grundstück der Bude. Der ganze Dungeon ist eine Lüge mit Nachsatz:
Pappwachen, Baumarkt-Ritter, ein Schlossgespenst aus dem Beamer, Pfälzer Tetrapak als Jahrgangswein. Fünf Köpfe, Stufe 8
bis 10, 25 bis 35 Minuten, spielbar mit Menschen oder mit Söldnern. Drei Bosse lehren je eine Gruppenmechanik
(Frontalkegel und Unterbrechen, Adds und Attrappen, Sammeln und Verteilen), ein seltener Nebenboss bringt ein Reittier,
und Big B verbindet alles mit seiner Kernmechanik **Behauptung und Nachsatz**: Er sagt jeden großen Angriff falsch an,
und erst der Nachsatz zeigt die Wahrheit. Das ist die Tonregel E-20 als Kampfregel. Technisch braucht der Dungeon einen
allgemeinen Instanz-Baustein (heute gibt es nur den Kiosk), Boss-Phasen mit eigenen Fähigkeiten, Adds und sieben neue
Zaubermerkmale, auf die auch die Söldner reagieren. Vorschlag für die Reihenfolge: zuerst lokal für Solo mit Söldnern
(auch offline), danach die geteilte Instanz für Online-Gruppen.

## 1 · Ausgangslage im Repo

| Baustein | Stand heute | Beleg |
|---|---|---|
| Instanzen | genau eine: Kalles Kiosk als eigener begehbarer Raum (`g.instance`, eigene Kollision, Wegfindung, Ein- und Austritt); die Bude ist begehbar im Echtmaßstab (E-52) | `kiosk-instance.js`, E-52 |
| Zaubermuster | `CAST_SETS`: Zyklus aus Zaubern mit `total`, `damage`, `radius`, `ground` (Fläche unter dem Spieler), `interruptible` | `content/enemies.js`, `engine.js` `startCast` |
| Boss-Phasen | nur Sprüche an Lebensschwellen (`phases:[{at,line}]`), keine neuen Fähigkeiten | `content/enemies.js` `BOSSES` |
| Adds, Kegel, Linien, Sammeln, Verteilen | nicht vorhanden | Engine liest nur `radius`, `ground`, `interruptible`, `damage`, `target` |
| Söldner | Rollen Schutz, Heilung, Schaden; reagieren auf `ground` und `interruptible`; höchstens vier, mit Menschen höchstens fünf Köpfe | E-45, `docs/BEGLEITER-2026-09-21.md` |
| Gruppenspiel online | geteilte Gegner mit Bedrohung am Server, Bedarf/Gier für selten und episch, Gruppen-Buffs, Weltbosse | E-35, E-42, E-44, `server/game/shared-world.mjs` |
| Beute | Gegenstandsstufe = Fundstufe, Güte bestimmt die Punkte, Dorflegenden ×1,25, Zusatz-Generator | E-40, E-56, `content/drops.js` |
| Aufträge | Startreihe mit Hotspots, Sammeln über Drops mit Chance, Karte mit Zielgebieten | E-55 |
| Grafik | Sprite-Baukasten und Sprite-Schmiede aus 3D-Grundkörpern; Bilder direkt aus der Sitzung | E-51, E-54, E-58 |
| Offene Wünsche | „Dungeon-Merkmale: sammeln, verteilen, Tankwechsel" (Engine), „jede Boss-Fähigkeit trägt ein Merkmal" (Gameplay) | `docs/backlog/engine.md`, `docs/backlog/gameplay.md` |

## 2 · Leitidee: Der Dungeon ist eine Lüge mit Nachsatz

E-20 verlangt für jede Zeile: erst die Behauptung, dann der Nachsatz, der sie kaputt macht. Big B ist diese Regel als
Person. Deshalb folgt der ganze Dungeon ihr:

1. **Jeder Raum hat eine Behauptung und eine Wirklichkeit.** Das Schild sagt „Rittersaal", drin steht ein Partykeller mit
   Styropor-Stuck. Die Raumnamen im Spiel zeigen beides.
2. **Jede Mechanik lehrt, auf den Nachsatz zu achten.** Boss 1 lehrt Grundlagen, Boss 2 führt Attrappen ein (nicht jede
   Markierung ist echt), Boss 3 verlangt Absprache (sammeln oder verteilen), Big B lügt bei jeder großen Ansage.
3. **Das einzig Echte ist der Keller.** Der Basaltkeller ganz unten ist wirklich alt und wirklich schön. Ausgerechnet dort
   steht nichts Wertvolles. Das ist der Nachsatz des ganzen Dungeons.
4. **Nur Big B lügt mit Ansage.** Seine Leute sind Mitläufer, keine Lügner. Sie glauben ihm. Das macht sie komisch statt böse.

## 3 · Rahmen

| Punkt | Vorschlag | Begründung |
|---|---|---|
| Name | **Schloss Big B**, Untertitel „Doppelgarage mit Kellerabgang, Burgstraße" | Behauptung und Nachsatz im Namen |
| ID | `schloss-bigb` (Speicherschlüssel, E-04) | kurz, eindeutig |
| Stufe | Eintritt ab 8, Gegner 8 bis 10, Big B Stufe 10 | nach Akt 1 (Timo Stufe 7), vor dem großen Rest bis 30 |
| Gruppe | fünf Köpfe: ein Schutz, eine Heilung, drei Schaden; Menschen oder Söldner gemischt | E-45 Balance-Rahmen, `BALANCE.party` |
| Dauer | 25 bis 35 Minuten für eine eingespielte Gruppe | erster Dungeon, auch mobil in einer Sitzung schaffbar |
| Schwierigkeit | nur „Normal"; ein Heldenmodus später (Abschnitt 17) | erst Grundlagen, dann Härte |
| Zugang | nach Kapitel 4 von Akt 1 und Stufe 8; Eingang in der Welt, kein Gruppenfinder | Akt 1 bleibt die Basis (E-16) |
| Story | eigener Nebenstrang nach Akt 1, ohne Bastian, Hochzeit oder Koblenz | E-22 sperrt Akt 2, nicht einen Nebenstrang |
| Sperre | keine Sperre; Beute über Chance | erster Dungeon, soll wiederholt werden |
| Tod | alle tot: zurück an den Eingang in der Instanz, Boss setzt zurück, erlegter Trash bleibt liegen | weniger Frust, gleiche Regel wie in den Vorbildern |

**E-20-Prüfung für „Big B".** Der Name ist ein Wunsch der Produktion. Big B ist eine erfundene Figur, ein Typus
(Hochstapler, Immobilien-Influencer, „Freiherr" von der Kirmes). Story prüft vor dem Einbau, dass weder Name noch Aussehen
eine reale Person aus der Gegend erkennbar machen. „Lügenbaron" spielt auf Münchhausen an; dessen Geschichten
(Kanonenkugelritt, am eigenen Schopf aus dem Sumpf, das halbe Pferd) sind gemeinfrei.

**Ort.** Die Weltdaten kennen die Burgstraße (OSM, `data/mertloch.json`). Big B: „Die heißt so, weil da meine Burg
steht." Da steht eine Doppelgarage. Ausweichort, falls die Welt dort keinen Platz hat: „Am Bahnhof" (ein altes Lagerhaus).
Kein reales Unternehmen im Text; der Raiffeisen-Markt aus den OSM-Daten bleibt unerwähnt (E-20).

## 4 · Aufbau

```
 Burgstraße                         Eingang (Welt): Rolltor, Schild „SCHLOSS BIG B · PRIVATBESITZ · EINTRITT 20 €"
     │
 [0 Schlosshof]  Garage mit Carport-Zinnen        Trash 2 Gruppen, Pappwachen            Auftrag: Grundbuchauszüge
     │
 [1 Zugbrücke]   Kellertreppe mit Kette           BOSS 1  Gästeliste-Gerd
     │
 [2 Rittersaal]  Partykeller mit Styropor-Stuck    Trash 3 Gruppen, Baumarkt-Ritter
     ├──────── [3 Stallungen] Heizungskeller mit Schaukelpferd    SELTEN  Das halbe Pferd (30 %)
     │
 [4 Musterwohnung] Kellerabteil mit Laminat        BOSS 2  Frau Dr. Exposé
     │
 [5 Weinkeller]  echter Basaltkeller (das einzig Echte)   Trash 3 Gruppen, Kellerratten, Schlossgespenst + Beamer
     │
 [6 Kelterhalle] Gewölbe mit Fassbahn              BOSS 3  Kellermeister Korken-Kurt
     │
 [7 Thronsaal]   Heizöltankraum, Thron aus Bierkisten, Kanone (Attrappe)   ENDBOSS  Big B, der Lügenbaron
     │
 [8 Schatzkammer] Abstellraum mit Truhe             Beute, Ausgang (Portal zum Eingang)
```

| Raum | Behauptung (Schild) | Wirklichkeit | Inhalt | Zweck |
|---|---|---|---|---|
| 0 Schlosshof | „Schlosshof" | Garage mit Pappzinnen auf dem Carport | 2 Gruppen, 4 Pappwachen | Einstieg, erste Lüge zum Lachen |
| 1 Zugbrücke | „Zugbrücke" | Kellertreppe, Kette mit Vorhängeschloss | Boss 1 | Kegel und Unterbrechen |
| 2 Rittersaal | „Rittersaal" | Partykeller, Styropor-Stuck, Dartscheibe | 3 Gruppen | Heiler-Trash zuerst, Schildwall von hinten |
| 3 Stallungen | „Stallungen" | Heizungskeller, Schaukelpferd, Hafersack | seltener Boss (30 %) | Belohnung für Neugier |
| 4 Musterwohnung | „Musterwohnung · Besichtigung" | Kellerabteil mit Laminat und Duftstäbchen | Boss 2 | Adds und Attrappen |
| 5 Weinkeller | „Weinkeller" | echter Basaltkeller, Tetrapaks in Holzkisten | 3 Gruppen, Gespenst mit Beamer | Schwärme, Lüge im Trash |
| 6 Kelterhalle | „Kelterhalle" | Gewölbe mit Rampe, Fässer als Deko | Boss 3 | Sammeln, Verteilen, Linien |
| 7 Thronsaal | „Thronsaal" | Heizöltankraum, Bierkistenthron | Big B | alles zusammen, mit Lügen |
| 8 Schatzkammer | „Schatzkammer" | Abstellraum, Truhe, Kronkorken goldlackiert | Beute | Abschluss, Auftrag |

Türen: Jeder Boss schließt beim Kampfbeginn seine Arena (Tür zu, Kette vor), nach dem Sieg öffnet sich der nächste Raum.
Abkürzung: Nach Boss 2 öffnet sich eine Treppe zurück in den Schlosshof, damit ein Wiederanlauf nach einem Tod bei Boss 3
oder Big B nicht durch leere Räume führt.

## 5 · Trash

Neue Gegner nur für diesen Dungeon (`dungeon:'schloss-bigb'`, nicht in den freien Spawn-Tabellen). Merkmale in
`CAST_SETS`, damit Söldner reagieren (Abschnitt 8).

| ID | Name | Stufe | Rolle | Fähigkeiten (Name im Spiel · Hinweis, Merkmal) | Was er lehrt |
|---|---|---|---|---|---|
| `pappwache` | Pappwache | 8 | Attrappe | keine; ein Treffer, Konfettiregen. Sieht aus wie ein Ritter in voller Rüstung | nicht alles Große ist gefährlich |
| `securityazubi` | Security-Azubi | 8 | Nahkampf | Funkspruch · Q unterbricht (`interruptible`, ruft sonst die Nachbargruppe) | unterbrechen, bevor es mehr werden |
| `baumarktritter` | Baumarkt-Ritter | 9 | zäher Nahkampf (Elite) | Schildwall · von hinten treffen (`front:true`, Treffer von vorn −80 %), Regenrinnen-Hieb · nicht vor ihm stehen (`cone`) | Stellung und Rücken |
| `maklerpraktikant` | Makler-Praktikant | 9 | Heiler | Provision · Q unterbricht (`interruptible`, heilt Verbündete), Exposé verteilen · Fläche verlassen (`ground`) | Heiler zuerst |
| `kellerratte` | Pfandratte | 9 | Schwarm | Knabbern; kommt zu acht | Flächenschaden lohnt sich |
| `schlossgespenst` | Schlossgespenst | 10 | Illusion | Buhuu · Fläche verlassen (`ground`); unverwundbar, solange der Beamer läuft | erst den Beamer, dann ist der Geist weg |
| `beamer` | Beamer auf Bierkiste | 10 | Objekt | keine; zerstörbar | die Wahrheit steht hinten im Raum |

Gruppen je Raum: Schlosshof zwei Gruppen aus je zwei Security-Azubis und einer Pappwache; Rittersaal drei Gruppen aus
Baumarkt-Ritter mit Makler-Praktikant, eine davon mit zwei Rittern; Weinkeller zwei Schwärme aus acht Pfandratten und das
Gespenst mit Beamer. Insgesamt rund 25 Gegner plus Schwärme; jede Gruppe 8 bis 15 Sekunden für fünf Köpfe.

## 6 · Bosse

### 6.1 Boss 1 · Gästeliste-Gerd (`gerd`)

- **Titel:** Sicherheitschef · Big B Protection (Ein-Mann-Betrieb)
- **Aussehen:** Breiter Mann im zu kleinen schwarzen Anzug, Klemmbrett, Kinder-Headset, Sonnenbrille im Keller
- **Stufe 8**, Arena Zugbrücke (Kellertreppe, Kette), Zielzeit 60 bis 75 Sekunden
- **Lehrziel:** Frontalkegel (nur der Schutz steht vorn), Unterbrechen, erste Adds

| Fähigkeit | Merkmal | Wirkung | Antwort |
|---|---|---|---|
| Du stehst nicht auf der Liste · Q unterbricht | `interruptible`, Ziel zufällig außer Schutz | schwerer Einzeltreffer | unterbrechen |
| Rausschmiss · nicht vor ihm stehen | `cone` 70°, Reichweite 11 m; Schutz nimmt wenig (Parade nimmt nichts) | Kegel nach vorn mit Rückstoß | nur der Schutz vorn, Gerd von der Gruppe wegdrehen |
| Dresscode-Kontrolle · Fläche verlassen | `ground`, zwei Ziele | Kreise unter zwei Spielern | raus aus dem Kreis |
| Phase 50 %: Verstärkung | `summon` 2 × Security-Azubi | Adds aus der Garage | Adds umlenken und zuerst legen |

Sprüche (Entwurf): Beginn „Name? … Steht nicht drauf. Niemand steht drauf. Die Liste ist leer. Das ist ja das
Exklusive." · 50 % „VERSTÄRKUNG! … Das ist mein Neffe. Und der Kumpel vom Neffen. Der ist eigentlich nur zum Fahren da." ·
15 % „Gut. Ihr steht drauf. Ich hab euch draufgeschrieben. Auf meinen Arm. Mit Edding."

### 6.2 Boss 2 · Frau Dr. Exposé (`expose`)

- **Titel:** Immobilienberaterin · Dr. (nicht gefragt)
- **Aussehen:** Hosenanzug in Lachsrosa, Tablet, Schlüsselbund mit dreißig Schlüsseln für drei Türen, Duftstäbchen im Dutt
- **Stufe 9**, Arena Musterwohnung, Zielzeit 80 bis 95 Sekunden
- **Lehrziel:** Adds mit Ziel (Zielwechsel), Attrappen erkennen

| Fähigkeit | Merkmal | Wirkung | Antwort |
|---|---|---|---|
| Besichtigungstermin | `summon` 3 × Interessent, `goal:'vertrag'` | Interessenten laufen zum Vertragstisch; wer ankommt, unterschreibt: Frau Dr. Exposé bekommt einen Stapel „Provision" (+15 % Schaden, stapelt) | Interessenten abfangen, bremsen, legen |
| Grundstück verkauft · Fläche verlassen | `ground`, vier Kreise, zwei davon `decoy` | nur Kreise mit rotem Stempel „VERKAUFT" treffen; der Stempel erscheint nach 0,8 s | auf den Stempel warten, nur aus echten Kreisen raus |
| Provisionsforderung · Q unterbricht | `interruptible` | schwerer Treffer auf den Schutz | unterbrechen |
| Phase 50 %: Tag der offenen Tür | Besichtigungstermin alle 20 s statt 30 s | mehr Adds | Zielwechsel sauber halten |

Sprüche: Beginn „Traumlage! Südhang! Also, Südkeller. Mit Tageslicht, wenn man die Tür aufmacht." · 50 % „Besichtigung ist
heute! Die Interessenten sind nicht bestellt. Die sind nur zufällig alle hier." · 15 % „Provision ist trotzdem fällig.
Steht im Kleingedruckten. Das Kleingedruckte hab ich heute Morgen geschrieben."

### 6.3 Seltener Boss · Das halbe Pferd (`halbespferd`)

- Erscheint in 30 % der Läufe in den Stallungen, sonst steht dort nur das Schaukelpferd.
- **Aussehen:** die vordere Hälfte eines Schimmels, frisch gestriegelt, hinten ein sauberer Schnitt mit Pflaster. Es säuft.
- **Stufe 9**, Zielzeit 40 Sekunden
- **Mechanik:** „Säuft am Trog" · Trog zerstören oder das Pferd wegziehen (`heal` am Objekt, 2 % Leben je Sekunde, solange
  es in Reichweite des Trogs steht). „Huftritt · ausweichen" (`ground`, klein). Kein Hinterteil, also kein Hinterhuf.
- **Nachsatz:** „Es säuft und säuft. Es kommt hinten alles wieder raus. Es gibt kein Hinten."
- **Beute:** Reittier „Das halbe Pferd" (3 %, Anschluss an die Reittiere aus `docs/MOUNTS-2026-09-22.md`), Hafersack
  (Material).

### 6.4 Boss 3 · Kellermeister Korken-Kurt (`korkenkurt`)

- **Titel:** Sommelier · Jahrgang: gestern
- **Aussehen:** Weste, Korkenzieher am Gürtel wie ein Colt, Probierlöffel an einer Kette, rote Nase, Tastglas in jeder Hand
- **Stufe 9**, Arena Kelterhalle mit Fassbahn (drei Rinnen quer durch den Raum), Zielzeit 90 bis 110 Sekunden
- **Lehrziel:** Sammeln und Verteilen als Gruppe, Linien

| Fähigkeit | Merkmal | Wirkung | Antwort |
|---|---|---|---|
| Runde auf mich! · zusammenstellen | `stack` um ein markiertes Ziel, Radius 5 m | Schaden wird auf alle im Kreis geteilt | alle zum markierten Spieler |
| Jeder zahlt selbst · auseinander | `spread` auf alle, Radius 4 m | jeder bekommt einen Kreis; wer mit anderen überlappt, bekommt deren Schaden dazu | auseinanderlaufen |
| Fass rollt · Linie verlassen | `line` entlang einer der drei Rinnen, Breite 5 m | Fass rollt durch den Raum | aus der Rinne treten |
| Phase 50 %: Verkostung | `enrage` leicht: +20 % Tempo, Fass rollt in zwei Rinnen zugleich | mehr Druck | Ruhe bewahren, Absprache halten |

Sprüche: Beginn „Das ist ein 1998er. Der Karton ist von 1998. Der Wein ist von Dienstag." · 50 % „Verkostung! Spucken ist
erlaubt. Schlucken ist schneller." · 15 % „Ist Tetrapak. Aus der Pfalz. Ich hab's nur umgefüllt. Mit Liebe."

### 6.5 Endboss · Big B, der Lügenbaron (`bigb`)

- **Titel:** Freiherr von und zu Burgstraße · selbsternannt
- **Aussehen:** Mann um die 45, Pelzmantel aus dem Kostümverleih, Perücke mit Zopf, Goldkette aus goldlackierten
  Kronkorken, Siegelring aus Messing, Handy am Selfie-Stick mit Ringlicht, steht auf einer Kanone aus Abflussrohr
- **Stufe 10**, Arena Thronsaal (Heizöltankraum, Thron aus Bierkisten), Zielzeit 150 bis 180 Sekunden, Wut nach 6 Minuten
- **Lehrziel:** Behauptung und Nachsatz lesen, alles vorher Gelernte gleichzeitig

**Kernmechanik „Behauptung und Nachsatz" (`lie`).** Jede große Fähigkeit hat eine Ansage in der Zauberleiste, die Big B
laut ausspricht. Die Ansage ist gelogen. Nach `tell` Sekunden erscheint der Nachsatz: Big B kreuzt hinter dem Rücken die
Finger, die Leiste wechselt auf den wahren Hinweis, und erst jetzt erscheint die echte Markierung am Boden. Wer auf die
Ansage reagiert, läuft in den Treffer. Wer den Nachsatz abwartet, hat genug Zeit. Söldner lesen nur die Wahrheit, also
reagieren sie immer richtig, aber immer erst nach dem Nachsatz.

| Phase | Fähigkeit | Ansage (Lüge) | Nachsatz (Wahrheit) | Merkmal |
|---|---|---|---|---|
| 1 (100–70 %) Empfang | Ritt auf der Kanonenkugel | „Ich reite nach LINKS!" | „… sagt man. Rechts." | `line` quer durch den Saal, `lie` mit Spiegelung |
| 1 | Siegelring | Treffer auf den Schutz, Stapel „Zertifikat" (+10 % erlittener Schaden) | keine Lüge | `tankDebuff`, drei Stapel; eine geglückte Parade löscht alle |
| 1 | Mein Anwalt ruft gleich an · Q unterbricht | „Das ist nur ein Anruf." | keine Lüge | `interruptible` |
| 2 (70–40 %) Follower | Live-Schalte | „Ich mach nur ein Foto!" | „… mit Follower." | `summon` 3 × Follower mit Ringlicht; jeder lebende Follower gibt Big B +8 % Schaden („Reichweite") |
| 2 | Das Parkett ist echt | „Der Boden ist sicher!" | „… war er." | `ground`, sechs Kreise, keine davon `decoy`; nur die Ansage lügt |
| 2 | Ritt auf der Kanonenkugel | wie Phase 1 | wie Phase 1 | jetzt zweimal hintereinander |
| 3 (40–0 %) Das Schloss bröckelt | Pappkulisse fällt | „Das ist Stuck. Echter Stuck." | „… aus Pappe. Fällt." | `ground` mit `persist`: Trümmer bleiben als kleine Gefahrenfelder liegen |
| 3 | Am eigenen Schopf | „Ich zieh mich hier selbst raus!" | keine Lüge | `interruptible`, `interrupts:2`: nur zwei Unterbrechungen kurz nacheinander stoppen ihn, sonst heilt er 5 % |
| 3 | Ritt auf der Kanonenkugel | „Ich reite nach LINKS!" | „… und rechts." | `line`, zwei Linien zugleich |
| Wut (6 min) | Die ganze Wahrheit | „Ich hab noch nie gelogen." | „Außer eben." | `enrage`: +50 % Schaden alle 30 s |

Sprüche (Entwurf):
- Beginn: „Willkommen auf Schloss Big B! Erbaut 1648 von meinem Opa. Also, der Carport. Das Schloss kommt noch."
- 70 %: „Meine Follower! Zwei Millionen! Die hier sind die, die heute Zeit hatten."
- 40 %: „Ich bin mal auf einer Kanonenkugel nach Mayen geritten. Und zurück. Den Schlüssel hatte ich vergessen."
- 15 % (Geständnis): „Okay. Das Schloss ist eine Garage. Die Garage ist gemietet. Die Kette ist Kronkorken. Und den Titel
  hab ich auf der Kirmes geschossen."
- Tod: „Schnitt. Das nehmen wir nochmal." Das Handy filmt weiter.

Mit dem Clan (E-18, Mitschuld bleibt): Kevin hat die Kanone gebaut („Die war als Deko gedacht. Er hat sie getestet."), Anni
hatte einen Werbedeal mit Big B („Hatte."), Dieter hat 2019 eine Aktie von ihm gekauft, einen Bierdeckel („Der Bierdeckel
ist mehr wert.").

## 7 · Zahlenentwurf

Grundlage Balance-Sheet (E-57), Stufe 10, ungewöhnliche Ausrüstung: Schadens-Bäume um 580 Schaden je Sekunde (Median),
Heilung 46 bis 89 je Sekunde, Schutz 28 bis 44 je Sekunde. Held auf Stufe 10 ohne Ausrüstung: 600 + 9 × 45 = 1.005 Leben,
dazu Ausdauer aus der Ausrüstung. Fünf Köpfe mit drei Schadens-Bäumen: rund 2.000 Schaden je Sekunde, mit vier Söldnern
(Stärke 85 %) rund 1.700.

| Gegner | Stufe | Leben (Entwurf) | Zielzeit | Größter Treffer (Entwurf) |
|---|---|---|---|---|
| Pappwache | 8 | 1 | ein Treffer | keiner |
| Security-Azubi | 8 | 5.500 | Gruppe 8–10 s | 180 |
| Baumarkt-Ritter (Elite) | 9 | 16.000 | 12–15 s | Kegel 420 |
| Makler-Praktikant | 9 | 6.000 | 4–6 s | 220 |
| Pfandratte | 9 | 1.200 | Schwarm 6–8 s | 60 |
| Beamer | 10 | 3.000 | 2 s | keiner |
| Gästeliste-Gerd | 8 | 90.000 | 60–75 s | Kegel 650, Liste 420 |
| Frau Dr. Exposé | 9 | 120.000 (+ Interessenten 4.000) | 80–95 s | Forderung 520 |
| Das halbe Pferd | 9 | 60.000 | 40 s | 300 |
| Korken-Kurt | 9 | 140.000 | 90–110 s | Sammeln 1.500 geteilt, Fass 600 |
| Big B | 10 | 240.000 (+ Follower 5.000) | 150–180 s | Kanonenkugel 700, Wut ab 6 min |

Regeln: Eine vermiedene Mechanik kostet höchstens den Autoangriff-Schaden; eine verpasste kostet 40 bis 70 % eines
Nicht-Schutz-Lebens; zwei verpasste hintereinander sind tödlich. Heilung auf Stufe 10 wirkt im Sheet knapp; Balancing misst
das mit einem Gruppenlauf (Abschnitt 14), bevor Zahlen ins Tuning gehen.

## 8 · Neue Zaubermerkmale

Die Engine liest heute `ground`, `radius`, `interruptible`, `damage` und `target`. Der Dungeon braucht sieben neue
Merkmale, jedes maschinenlesbar und mit einer Reaktion im Söldner-Baustein (`companions.js` `tickOne`).

| Merkmal | Daten | Wirkung | Anzeige | Söldner-Reaktion |
|---|---|---|---|---|
| `cone` | `{angle,range}` | Kegel nach vorn; `tankSafe` = das aktuelle Ziel nimmt wenig | Kegel am Boden | Nicht-Schutz geht hinter oder neben den Boss |
| `line` | `{width,length,from?}` | Linie quer durch den Raum | Band am Boden | seitlich aus der Linie |
| `stack` | `{radius}`, Ziel markiert | Schaden geteilt durch alle im Kreis | Kreis mit Pfeilen nach innen | zum markierten Ziel laufen |
| `spread` | `{radius}` auf alle | eigener Kreis je Ziel, Überlappung addiert | Kreis je Kopf | vom nächsten Verbündeten weg |
| `decoy` | am einzelnen Kreis | Kreis ohne Wirkung; echter Kreis bekommt nach `tell` einen Stempel | gestrichelt, dann Stempel | nur echte Kreise meiden |
| `lie` | `{claim,tell,truth}` | Leiste zeigt erst `claim`, nach `tell` die Wahrheit; Markierung erst nach `tell` | zwei Texte, Wechsel mit Ton | wartet `tell` ab, reagiert dann |
| `summon` | `{kind,count,goal?}` | Adds erscheinen am Rand; `goal` = Laufziel mit Folge | Adds mit Rahmen | Schadens-Söldner wechseln aufs Add, Schutz spottet |

Dazu vier kleinere Bausteine: `tankDebuff` (stapelnde Schwäche auf dem Ziel, Parade löscht), `interrupts:n` (Zauber bricht
erst nach n Unterbrechungen im Fenster; der Söldner-Anspruch „ein Zauber, ein Unterbrecher" wird auf n erweitert),
`persist` (Fläche bleibt nach dem Treffer als Gefahrenfeld liegen) und `enrage` (Zeitgrenze mit Schadensaufschlag).
Boss-Phasen bekommen eigene Zyklen: `phases:[{at,line,castSet?,summon?}]`, damit Phase 2 und 3 andere Fähigkeiten nutzen.

## 9 · Instanz-Technik

**Stufe 1: lokal für Solo mit Söldnern (Vorschlag V-D3).** Der Kiosk zeigt, dass eine Instanz im Client funktioniert. Aus
`kiosk-instance.js` wird ein allgemeiner Baustein `instance.js`, der Räume aus den Daten liest (`content/dungeons.js`):
Rechtecke, Türen, Spawns, Boss-Arenen, Kontrollpunkt, Ausgang. Die Engine hält darin eigene Gegner (`g.instance.enemies`),
die Welt draußen ruht. Söldner kommen mit hinein (E-45: sie leben im Client). Funktioniert offline.

Regeln der Instanz:
- **Eintritt** nur außerhalb des Kampfes, mit Stufe 8, am Rolltor (F). Beim ersten Eintritt eine Karte „Schloss Big B" mit
  Stufe, Gruppengröße, empfohlenen Rollen und dem Hinweis auf Söldner.
- **Arena-Tür** schließt beim Kampfbeginn, öffnet bei Sieg oder Rückzug aller.
- **Tod aller:** zurück an den Kontrollpunkt in der Instanz (Eingang, nach Boss 2 die Abkürzung), der Boss setzt zurück,
  erlegter Trash bleibt liegen. Ein einzelner Tod ohne Gruppentod bleibt ein Tod mit Aufhelfen (E-44).
- **Verlassen** über das Portal in der Schatzkammer oder den Eingang; der Fortschritt bleibt 30 Minuten erhalten, danach
  setzt die Instanz zurück.
- **Spielstand:** neues Feld `dungeons:{'schloss-bigb':{bosses:[],clears,best,firstClear}}`; unbekannte IDs fallen beim
  Laden heraus (Muster E-55). Der laufende Fortschritt einer Instanz wird nicht gespeichert.
- `respawn()` verlässt heute den Kiosk; für Dungeons braucht es einen Kontrollpunkt innerhalb der Instanz.

**Stufe 2: geteilte Instanz für Online-Gruppen.** Der Server legt je Gruppe einen eigenen Raum an (`roomKey`
`<welt>#schloss-bigb#<gruppe>`), die Instanz-Gegner laufen dort über dieselben Regeln wie die geteilte Welt (Bedrohung,
Leben, Kill mit Belohnungsliste, `shared-world.mjs`). Zaubermuster bleiben im Client (E-35); Adds meldet der Client des
Gruppenleiters. Eigene Entscheidung, weil sie den Server berührt.

## 10 · Beute und Belohnungen

Gegenstandsstufe = Fundstufe (E-56): Trash 8 bis 10, Bosse 9 bis 11. Güte: Trash gewöhnlich bis selten, Bosse sicher
selten, mit Chance episch. Online Bedarf und Gier für selten und episch (E-42); offline eine Truhe je Boss für den Spieler.

| Quelle | Beutetabelle | Dorflegende (Entwurf, Loot gestaltet Werte und Wirkung) | Chance |
|---|---|---|---|
| Gästeliste-Gerd | `gerd` | Die Gästeliste (Glücksbringer): „Du stehst auf jeder Liste. Auf keiner steht was." | 15 % |
| Frau Dr. Exposé | `expose` | Hochglanz-Exposé (Nebenhand): „Traumlage. Mit Keller. Nur Keller." | 15 % |
| Das halbe Pferd | `halbespferd` | Reittier „Das halbe Pferd" | 3 % |
| Korken-Kurt | `korkenkurt` | Korkenzieher des Kellermeisters (Einhandwaffe): „Öffnet alles. Außer Tetrapak." | 15 % |
| Big B | `bigb` | Siegelring „Echt Gold" (Ring, Messing): „Echt. Gold. Farbe." | 12 % |
| Big B | `bigb` | Pelzmantel des Barons (Brust): „Echtpelz. Vom Kostümverleih. Echt geliehen." | 12 % |
| Trash | `schlosstrash` | keine | – |

Material und Aufträge: Hafersack (halbes Pferd), Pappzinne (Pappwache, für Berufe), Tetrapak „Jahrgang Dienstag"
(Verpflegung), gefälschter Grundbuchauszug (Auftragsgegenstand, nur solange der Auftrag läuft).

Erstes Abschließen: Titel „der Wahrheit auf der Spur", EP-Bonus, Meilenstein „Schlossführung". Zweiter Meilenstein
„Der Nachsatz zählt": Big B besiegen, ohne ein einziges Mal von einer gelogenen Kanonenkugel getroffen zu werden.

**Set (V-D7, offen seit 17.09.).** „Baronsgarnitur" aus Siegelring, Pelzmantel und Perücke wäre der natürliche erste Set.
Set-Boni sind aber noch unentschieden (ENTSCHEIDUNGEN.md, „Offen"); ohne Entscheidung bleiben es drei Einzelteile.

## 11 · Aufträge und Story

**Einstieg (nach Kapitel 4, Stufe 8).** Ida bekommt Post: „Einschreiben von der Big B Immobilien Holding: Die Bude steht
auf meinem Grund. Räumung bis Montag. Hochachtungsvoll, Freiherr Big B." Nachsatz: Das Einschreiben ist ein Klebezettel,
in einem Umschlag, ohne Briefmarke. Ida: „Wir haben die Bude gerade wieder aufgebaut. Hier räumt keiner. Außer Dieter den
Kühlschrank."

| Auftrag | Geber | Ziel | Belohnung |
|---|---|---|---|
| Einschreiben ohne Briefmarke | Kisten-Ida | zur Burgstraße, Postbotin Petra fragen („Big B kriegt jeden Tag Pakete. Alles Rücksendungen."), Eingang finden | EP, Karte zeigt den Eingang |
| Grundbuch ist Handarbeit | Postbotin Petra | acht gefälschte Grundbuchauszüge im Schloss (Drop, Muster E-55) | EP, Pfandmarken |
| Die Pappe muss weg | Dosen-Dieter | zehn Pappwachen umhauen | EP, Verpflegung |
| Die ganze Wahrheit | Kisten-Ida | Big B besiegen, sein Handy mitbringen | EP, Wahl aus drei seltenen Teilen |
| Ich war nie hier | Polizeiobermeister Pit | Big Bs Handy abgeben | „Ich war nie hier. Das Handy nehm ich aber mit." Titel-Freischaltung |

Mentor-Zeilen (je eine, Story ersetzt): Dieter „Big B hat mir 2019 eine Aktie verkauft. Einen Bierdeckel. Der Bierdeckel ist
mehr wert." · Anni „Big B hat mehr Follower als Mertloch Einwohner. Drei Viertel davon ist er selbst." · Kevin „Die Kanone hab
ich gebaut. Als Deko. Er hat sie getestet."

Kein Bezug zu Bastian, Hochzeit oder Koblenz (E-22). Der Strang endet mit dem Handy bei Pit; Big B selbst bleibt als Figur
für spätere Auftritte offen („Schnitt. Das nehmen wir nochmal.").

## 12 · Datenmodell

Alle IDs sind Speicherschlüssel (E-04). Besitz laut `docs/ROLLEN.md`; `content/dungeons.js` ist neu und braucht einen
Besitzer (Vorschlag Gameplay, Räume in Absprache mit Welt).

```js
// content/dungeons.js (neu, Gameplay; Export-Zeile in content/index.js)
export const DUNGEONS={
 'schloss-bigb':{name:'Schloss Big B',subtitle:'Doppelgarage mit Kellerabgang, Burgstraße',
  level:{enter:8,min:8,max:10},group:{size:5,roles:{tank:1,heal:1,damage:3}},
  unlock:{chapter:4},entrance:{street:'Burgstraße',fallback:'Am Bahnhof',prop:'rolltor'},
  resetAfter:1800,checkpoints:['hof','abkuerzung'],
  rooms:[
   {id:'hof',sign:'Schlosshof',truth:'Garage mit Pappzinnen',packs:['azubi2+papp','azubi2+papp'],props:['pappzinne']},
   {id:'zugbruecke',sign:'Zugbrücke',truth:'Kellertreppe mit Kette',boss:'gerd',arena:true},
   {id:'rittersaal',sign:'Rittersaal',truth:'Partykeller mit Styropor-Stuck',packs:['ritter+praktikant','ritter+praktikant','ritter2+praktikant']},
   {id:'stall',sign:'Stallungen',truth:'Heizungskeller mit Schaukelpferd',rare:{boss:'halbespferd',chance:.3},optional:true},
   {id:'musterwohnung',sign:'Musterwohnung · Besichtigung',truth:'Kellerabteil mit Laminat',boss:'expose',arena:true,shortcut:'hof'},
   {id:'weinkeller',sign:'Weinkeller',truth:'echter Basaltkeller',packs:['ratten8','ratten8','gespenst+beamer']},
   {id:'kelterhalle',sign:'Kelterhalle',truth:'Gewölbe mit Fassbahn',boss:'korkenkurt',arena:true},
   {id:'thronsaal',sign:'Thronsaal',truth:'Heizöltankraum, Thron aus Bierkisten',boss:'bigb',arena:true},
   {id:'schatz',sign:'Schatzkammer',truth:'Abstellraum',chest:true,exit:true}]}
};

// content/enemies.js (Gameplay): Bosse mit Phasen, die eigene Zyklen tragen
bigb:{id:'bigb',dungeon:'schloss-bigb',name:'Big B',title:'Freiherr von und zu Burgstraße · selbsternannt',type:'boss',
 skin:'horst',variant:'bigb',family:'bigb',level:10,hp:240000,castSet:'bigb',enrage:{after:360,every:30,damage:.5},
 look:'Mann um die 45, Pelzmantel aus dem Kostümverleih, Perücke mit Zopf, Kronkorken-Goldkette, Messing-Siegelring, Handy am Selfie-Stick mit Ringlicht, steht auf einer Kanone aus Abflussrohr',
 phases:[{at:1,line:'…'},{at:.7,castSet:'bigb2',summon:{kind:'follower',count:3},line:'…'},{at:.4,castSet:'bigb3',line:'…'},{at:.15,line:'…'}]},

// CAST_SETS (Gameplay): neue Merkmale aus Abschnitt 8
bigb:{cycle:['kanone','siegelring','anwalt','siegelring'],casts:{
 kanone:{name:'Ich reite nach LINKS!',total:2.6,damage:700,line:{width:40,length:420},
  lie:{claim:'Ich reite nach LINKS!',truth:'… sagt man. Rechts · Linie verlassen',tell:.8,mirror:true}},
 siegelring:{name:'Siegelring · Parade',total:1.4,damage:260,tankDebuff:{id:'zertifikat',stack:3,taken:.1,clearOnParry:true}},
 anwalt:{name:'Mein Anwalt ruft gleich an · Q unterbricht',total:2.4,damage:480,interruptible:true}}},
gerd:{cycle:['liste','rausschmiss','dresscode','rausschmiss'],casts:{
 liste:{name:'Du stehst nicht auf der Liste · Q unterbricht',total:2.4,damage:420,interruptible:true,target:'random'},
 rausschmiss:{name:'Rausschmiss · nicht vor ihm stehen',total:1.8,damage:650,cone:{angle:70,range:90},tankSafe:true},
 dresscode:{name:'Dresscode-Kontrolle · Fläche verlassen',total:2.2,damage:380,radius:48,ground:true,targets:2}}},

// content/drops.js (Loot)
bigb:{material:'pappzinne',materialChance:.5,gearChance:1,unique:['siegelring-echtgold','pelzmantel-baron'],uniqueChance:.12,coinsChance:1,slots:[/* wie Bosse */]}
```

Prüfungen: jede Boss-Fähigkeit trägt mindestens ein Merkmal (Wunsch aus `backlog/gameplay.md`); jeder `lie` hat `claim`,
`truth` und `tell` ≥ 0,6 s; jeder `summon` nennt einen vorhandenen Gegner; jeder Raum mit `boss` hat `arena:true`; jede
Dorflegende gehört zu genau einer Beutetabelle; alle Texte ohne Gedankenstrich und mit Behauptung und Nachsatz (Story).

## 13 · Oberfläche

- **Eingang:** Rolltor mit Schild in der Welt, F öffnet eine Karte „Schloss Big B" (Stufe, Gruppe, Rollen, Söldner-Knopf,
  „Betreten"). Auf der Weltkarte ein Dungeon-Symbol an der Burgstraße.
- **Raumname** beim Betreten oben mittig in zwei Zeilen: Schild groß, Wirklichkeit klein darunter („Rittersaal ·
  Partykeller mit Styropor-Stuck").
- **Bossrahmen** mit Phasenmarken bei 70 und 40 % (Big B) beziehungsweise 50 %, Wut-Uhr bei Big B.
- **Zauberleiste bei Lügen:** zuerst die Ansage in Anführungszeichen mit kleinem Symbol „gekreuzte Finger", nach `tell` Wechsel
  auf den Nachsatz in Gold mit kurzem Ton; die Bodenmarkierung erscheint erst dann. Auf dem Handy dieselbe Leiste über den
  Kampfknöpfen, Text mindestens 12 px.
- **Attrappen:** gestrichelte Kreise, echter Stempel rot. Farbe nie allein (Kontrastregel M-12): Stempel hat zusätzlich eine
  Form.
- **Dungeon-Karte** im Reiter Karte: Grundriss aus den Räumen, besiegte Bosse durchgestrichen, Kontrollpunkte.
- **Gruppentod:** Einblendung „Alle am Boden. Zurück zum Schlosshof. Der Trash bleibt liegen, Gerd steht wieder." Kein
  Fenster, nur Einblendung.
- **Truhe:** Beutefenster wie bei Bossen heute; online das Würfelfenster aus E-42.
- **Prüfskript** `scripts/dungeon-check.mjs`: Eintritt, erste Gruppe, Boss 1 mit vier Söldnern, Gruppentod und Rücksetzen,
  Abkürzung, Verlassen; 2024 × 900 und 390 × 844; Scorecard mindestens 4 je Bildschirm (E-08).

## 14 · Grafik

Über die Sprite-Schmiede (E-58) und Bildaufträge direkt aus der Sitzung (E-51). Bis zur Lieferung zeichnen vorhandene Skins
(`horst`, `warden`, `boar`, `badger`) mit Variante.

| Bogen | Motive |
|---|---|
| Räume (Baukasten E-54) | Rolltor, Garage mit Pappzinnen, Kellertreppe mit Kette, Partykeller mit Styropor-Stuck, Heizungskeller, Kellerabteil mit Laminat, Basaltgewölbe, Kelterhalle mit drei Rinnen, Heizöltank, Bierkistenthron, Abstellraum |
| Requisiten | Pappwache, Kanone aus Abflussrohr, Vertragstisch, Trog, Beamer auf Bierkiste, Fässer, Tetrapaks in Holzkisten, Truhe mit goldlackierten Kronkorken |
| Bosse | Gerd, Frau Dr. Exposé, das halbe Pferd, Korken-Kurt, Big B (vier Richtungen, Laufen, Angriff, Zauber, Tod) |
| Trash | Security-Azubi, Baumarkt-Ritter, Makler-Praktikant, Pfandratte, Schlossgespenst (halbtransparent), Interessent, Follower mit Ringlicht |
| Effekte | Kanonenkugel-Linie, Kegel, Sammel- und Verteilkreise, Attrappen-Kreis und Stempel, Konfetti, Pappe fällt |
| Symbole | Zauber (neun), Dorflegenden (sechs), Dungeon-Symbol für die Karte, gekreuzte Finger |
| Reittier | das halbe Pferd mit Reiter (Anschluss an die Reittier-Sprites) |

## 15 · Tests und Playtest

- **Unit-Tests je Merkmal** (`tests/dungeon-mechanics.test.mjs`): Kegel trifft nur vorn, Linie, Sammeln teilt, Verteilen
  addiert bei Überlappung, Attrappe ohne Schaden, Lüge zeigt erst `claim`, Markierung erst nach `tell`, `interrupts:2`,
  `tankDebuff` mit Parade, `persist`, Wut.
- **Instanz-Tests** (`tests/dungeon-instance.test.mjs`): Eintritt nur ab Stufe 8, Arena-Tür, Gruppentod mit Kontrollpunkt,
  Trash bleibt tot, Abkürzung, Rücksetzen nach 30 Minuten, Spielstandfeld und Laden alter Stände.
- **Söldner-Lauf** (`scripts/dungeon-sim.mjs`, Muster `spec-sim.mjs`): ein Held und vier Söldner laufen den Dungeon mit
  naiver Rotation; gemessen werden Zeit je Boss, Tode, Treffer durch Mechaniken. Ziel: Solo mit Söldnern schafft Normal in
  unter 45 Minuten mit höchstens zwei Gruppentoden.
- **Playtests (E-15):** Kenner mit vier Söldnern komplett; Neuling nur bis Boss 1 (versteht er den Kegel?); Prüfer liest
  Ansagen und Nachsätze gegen das tatsächliche Verhalten; später zwei echte Spieler online (Stufe 2).

## 16 · Etappen

| Etappe | Rollen | Inhalt | Abnahme | Playtest |
|---|---|---|---|---|
| 0 · Entscheidungen | Lead, Produktion | V-D1 bis V-D8 | Einträge mit verworfener Alternative | keiner |
| 1 · Inhalt | Gameplay, Story, Loot, Welt, Balancing | `content/dungeons.js`, Trash, Bosse, Zaubermuster mit Merkmalen, Texte, Beute, Eingang an der Burgstraße, Zahlen | `content:check` grün mit den Prüfungen aus Abschnitt 12 | keiner |
| 2 · Engine Stufe 1 | Engine | Instanz-Baustein, Merkmale, Phasen mit Zyklen, Adds, Kontrollpunkt, Spielstandfeld, Söldner-Reaktionen | Tests aus Abschnitt 15 grün, Übergabe an UI | keiner |
| 3 · Oberfläche | UI, Mobile | Abschnitt 13 | `dungeon-check` grün, Scorecard ≥ 4 | Neuling bis Boss 1, Kenner komplett mit Söldnern; kein „bricht ab" |
| 4 · Grafik | Grafik | Abschnitt 14 | Sprites im Katalog, `kit:check` grün | Prüfer: Lesbarkeit von Kegel, Linie, Lüge |
| 5 · Balance | Balancing | `dungeon-sim`, Tuning | Zielzeiten aus Abschnitt 7 erreicht | Kenner zweiter Lauf |
| 6 · Online Stufe 2 | Engine, Server | geteilte Instanz je Gruppe | Zwei-Spieler-Test wie bei E-38 | zwei echte Spieler |

## 17 · Später

- **Heldenmodus:** Stufe 30, Lügen ohne Nachsatz in der Leiste (nur die gekreuzten Finger), zusätzliche Fähigkeit je Boss.
- **Wöchentlicher Wunsch:** „Big B hat heute eine neue Geschichte", eine zufällige Zusatzlüge je Woche.
- **Big B als wiederkehrender Gegner:** nach dem Geständnis taucht er in späteren Strängen als Händler, Zeuge oder
  Weltboss auf.

## 18 · Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Engine-Umfang: Instanz-Baustein, sieben Merkmale, Phasen, Adds | Etappe 2 in drei Schnitten: Instanz + Kontrollpunkt, Merkmale ohne `lie`, dann `lie` und Adds; jeder Schnitt mit Tests |
| Heilung auf Stufe 10 zu schwach für Gruppenschaden | `dungeon-sim` misst vor dem Tuning; notfalls weniger Autoangriff-Schaden statt schwächerer Mechanik |
| Lüge unlesbar auf dem Handy | Leiste über den Kampfknöpfen, Ton beim Wechsel, Markierung erst nach dem Nachsatz; Prüfer-Playtest |
| Söldner scheitern an neuen Merkmalen | jede Reaktion mit Test; Solo-Ziel „unter 45 Minuten, höchstens zwei Gruppentode" |
| Online-Instanz berührt den Server | eigene Stufe 2, eigene Entscheidung; Stufe 1 bleibt spielbar |
| Priorität: Akt 1 soll erst tief werden (E-22) | Dungeon als Nebenstrang, kein Akt-2-Inhalt; Produktion entscheidet V-D1 |
| „Big B" erinnert an eine reale Person | Story-Prüfung vor dem Einbau (E-20) |
| Leistung in vollen Räumen (Schwärme, Effekte) | Schwärme höchstens acht, Effekte über die Effektschicht mit Selbstschutz (E-47, E-48) |

## 19 · Vorschläge zur Entscheidung

| Nr. | Frage | Optionen | Empfehlung | Verworfene Alternative |
|---|---|---|---|---|
| V-D1 | Dungeon als Nebenstrang nach Akt 1 | a) ja, ohne Akt-2-Bezug; b) warten, bis Akt 1 abgenommen ist | a | b (Söldner und Gruppenspiel stehen ohne Ziel da; E-45 nennt Dungeons als nächsten Meilenstein) |
| V-D2 | Rahmen | a) Stufe 8 bis 10, fünf Köpfe, nur Normal; b) mitwachsende Stufe | a | b (Balancing ohne feste Stufe kaum prüfbar) |
| V-D3 | Technik zuerst | a) lokale Instanz für Solo mit Söldnern, Online-Gruppe als Stufe 2; b) sofort geteilte Instanz | a | b (Server-Arbeit blockiert alles andere) |
| V-D4 | Ort | a) Burgstraße, Ausweich „Am Bahnhof"; b) freie Stelle am Ortsrand | a | b (verschenkt den Witz mit der Burg) |
| V-D5 | Kernmechanik Big B | a) Behauptung und Nachsatz (`lie`), Attrappen ab Boss 2; b) klassischer Endboss ohne Lüge | a | b (der Name verspricht Lügen) |
| V-D6 | Sperre und Beute | a) keine Sperre, Truhe offline, Bedarf/Gier online; b) wöchentliche Sperre | a | b (erster Dungeon soll wiederholt werden) |
| V-D7 | Set „Baronsgarnitur" | a) Einzelteile jetzt, Set nach der offenen Set-Entscheidung; b) Set sofort | a | b (Set-Boni sind nicht entschieden) |
| V-D8 | Reittier „Das halbe Pferd" | a) seltene Beute 3 % vom seltenen Boss; b) kein Reittier | a | b (verschenkt den Anschluss an die Reittiere) |

## 20 · Backlog-Schnipsel je Rolle

Die Inboxen tragen seit heute je einen Verweis auf dieses Papier mit dem Vermerk „wartet auf V-D1 bis V-D8". Die
ausführlichen Aufträge:

- **lead:** V-D1 bis V-D8 vorlegen; Besitzer für `content/dungeons.js` festlegen und in `docs/ROLLEN.md` eintragen; Export
  in `content/index.js`; Prüfregeln aus Abschnitt 12 in `content/schema.js`. Abnahme: Einträge und Tabelle.
- **gameplay:** `content/dungeons.js`, Trash und Bosse in `content/enemies.js`, Zaubermuster mit Merkmalen, Prüfung „jede
  Boss-Fähigkeit trägt ein Merkmal". Abnahme: `content:check` grün.
- **story:** alle Sprüche, Schilder, Aufträge, Mentor-Zeilen, Einschreiben, Geständnis; E-20-Prüfung für „Big B". Abnahme:
  Story-Prüfung grün, jede Zeile mit Nachsatz.
- **loot:** Beutetabellen `gerd`, `expose`, `halbespferd`, `korkenkurt`, `bigb`, `schlosstrash`, sechs Dorflegenden,
  Materialien, Auftragsgegenstand, Reittier. Abnahme: Prüfung „jede Legende genau eine Tabelle", `itemPoints` passt.
- **welt:** Eingang an der Burgstraße (Ausweich „Am Bahnhof"), Rolltor als Requisit, Dungeon-Symbol auf der Karte. Abnahme:
  Eingang erreichbar, frei von Kollision, Test in `tests/world-places.test.mjs`.
- **balance:** Zahlen aus Abschnitt 7 ins Tuning, `scripts/dungeon-sim.mjs`, Zielzeiten. Abnahme: Bericht mit Zeiten je
  Boss für fünf Köpfe und für Solo mit Söldnern.
- **engine:** Abschnitte 8 und 9, Tests aus Abschnitt 15. Abnahme: Tests grün, `docs/UEBERGABE-UI-<Datum>.md`.
- **ui:** Abschnitt 13, `scripts/dungeon-check.mjs`. Abnahme: Prüfskript grün auf beiden Größen, Scorecard.
- **grafik:** Abschnitt 14 in `docs/GRAFIK-BEDARF.md`. Abnahme: Katalog und `kit:check`.
