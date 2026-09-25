# Dungeon „Schloss Big B“ · Hotfix nach dem Prüfer-Playtest · 2026-09-25

Grundlage ist der Prüfer-Playtest auf Build #562 (`docs/PLAYTEST-2026-09-25-dungeon-pruefer.md`, unverändert übernommen). Dazu kommt der
Befund „verborgene Gegner wählbar“ vom Rechtsklick-Fix (15650507).
- Zweig `dungeon-hotfix`, Worktree `D:\Dev\MertlochChronicles-dg-hotfix`.
- Vergleichsstand ohne Hotfix im Worktree `D:\Dev\MertlochChronicles-dg-hotfix-vorher`.

Live:
- Punkt 1 (Arenatür): Build #608, b78e84c.
- Punkte 2–5: Build #622, 1341ccc.

## Kurzfassung

- **Arenatür (Priorität 1):**
  - Die Tür schließt nur, wenn der Held in der Arena steht.
  - Beim Zufallen stehen alle Söldner am Eingang innen.
  - Ein Söldner zieht keinen Boss allein, und von außen trifft niemand den Boss.
  - Rechtsklick aus dem Hof läuft per Wegsuche in die Arena, dann beginnt der Kampf.
  - Die Regel ist datengetrieben (`room.arena`, `door.arena`) und gilt für Gerd, Big B und alle Arenen aus Etappe 4.
- **Neuladen:**
  - Geräumter Trash bleibt liegen, auch wenn die Pappwache noch steht.
  - Kein Kontrollpunkt liegt in Aggro-Reichweite von Trash.
  - Nach dem Laden bemerkt 5 s lang niemand den Helden.
- **Weltkarte:** Das Dungeon-Symbol steht nie in einem Bündel. Ein Lager daneben weicht aus.
- **Journal:**
  - Schließt man das Journal, das man von der Eingangskarte aus geöffnet hat, kommt die Eingangskarte zurück.
  - Gesperrte Schädelplätze haben einen Tooltip.
  - Söldner-, Journal- und Talentknopf haben ein `aria-label`.
- **Verborgene Gegner** (Geheimraum noch nicht betreten) lassen sich weder per Hover noch per Rechtsklick oder Tab wählen.

## Ursache und Behebung je Punkt

### 1 · Die Arenatür sperrt die Gruppe aus

**Ursache:** Drei Fehler kamen zusammen. Der Ablauf ist im Code nachgestellt (vorher/nachher):
1. **Söldner liefen voraus.** Die Formationsplätze liegen in Blickrichtung des Helden, bis 82 Einheiten neben und vor ihm. Stand der Held
   im Hof vor der Zugbrücke und blickte nach Westen, lag Hopfen-Horsts Platz schon in der Arena. Horst wartete also drin.
2. **Treffer von außen:** Der Pfandwurf hat 235 Reichweite und trifft durch die offene Tür. Der Held traf Gerd aus dem Hof, und Gerd
   ging in den Kampf.
3. **Falsche Türregel:** Die Tür schloss, sobald irgendwer der Gruppe in der Arena stand (`partyIn`). Horst stand drin, also fiel die Tür
   zu, mit Horst (und Schorle-Susi) drinnen und dem Helden draußen.

Auch ohne Fernkniff war die Tür vorher falsch. Lief der Held per Rechtsklick hinein, fiel die Tür zu, sobald Gerd ihn bemerkte, und alle
vier Söldner blieben im Hof (Nachstellung: „Pils:hof Schorle:hof Radler:hof Hopfen:hof“).

**Behebung** (`dungeon.js`, kleine Haken in `companions.js`, `attack-approach.js`, `auto-combat.js`, `engine.js`):
- `arenaRule({closed,hero,party})`:
  - Eine offene Arena schließt nur, wenn der Held lebt und in ihr steht (`close`).
  - Eine geschlossene Arena hält, solange jemand der Gruppe drin ist (`hold`). Das deckt Geist und Sturz über die Kante aus Etappe 1 ab.
  - Sonst setzt der Boss sofort zurück (`reset`).
- `pullIntoArena`: Beim Zufallen kommen alle Söldner außerhalb an den Eingang innen, leicht gefächert. Der Eingang ist die nächste Tür mit
  `arena`, 2 m in den Raum hinein (`arenaEntrance`). Das Ereignis heißt `arenaPulled`.
- `bossOutOfReach`:
  - Ein Boss hinter offener Arenatür ist nicht angreifbar, solange der Held nicht drin steht. Das gilt für Autoangriff, Kniffe und
    Söldnerziele (auch mit Befehl „Angreifen“).
  - `inStrike` gilt erst in der Arena. Deshalb läuft der Rechtsklick per Wegsuche hinein, und auch ein Kniff startet das Hinlaufen statt
    zu treffen.
- `arenaAhead`: Läge der Platz eines Söldners in einer offenen Boss-Arena ohne den Helden, wartet er am Rand beim Helden.
- Datengetrieben: Die Arenen der Musterwohnung (Exposé) und der Kelterhalle (Kurt) haben schon jetzt einen Eingang innen (Unit-Test).
  Etappe 4A braucht nur `arena` an Raum und Tür.

**Neue Exporte für Etappe 4A:** `arenaRule`, `bossOutOfReach`, `arenaAhead`, `arenaEntrance`, `pullIntoArena`.

### 2 · Neuladen bringt geräumten Trash zurück, Held sofort im Kampf

**Ursache:**
1. **Die Pappwache hielt den Pack offen.**
   - `hof-west` und `hof-ost` bestehen aus zwei Security-Azubis und einer Pappwache (1 Leben, neutral).
   - Ein Pack galt erst als geräumt, wenn *jedes* Mitglied lag (`onDungeonKill`). Die Pappwache greift nie an, wird also meist nicht
     umgehauen.
   - Deshalb stand `hof-west` nie in `run.trash` und wurde beim Laden neu erzeugt.
   - Die Unit-Tests von Etappe 1 hatten mit `g.kill` auch die Pappe gelegt und den Fehler deshalb nicht gesehen.
2. **Der Kontrollpunkt lag in Aggro-Reichweite.**
   - Der Hof-Kontrollpunkt (31,34) lag 89–112 Einheiten von den Azubis entfernt, ihre Aggro-Reichweite ist 96.
   - Im Rittergeschoss lief die Galerie-Streife genau über den Kontrollpunkt an der Treppe (Abstand 0).
   - Der Weinkeller-Kontrollpunkt (9,9) lag mitten zwischen acht Ratten (14–53 Einheiten).

**Behebung:**
- **Geräumt:** Ein Pack gilt als geräumt, wenn kein Kämpfer mehr steht (Pappe zählt nicht). Beim Laden liegt dann der ganze Pack.
- **Schutz nach dem Laden:** `RESUME_CALM` = 5 s Spielzeit. Nach dem Laden und nach „Am Kontrollpunkt aufstehen“ bemerkt niemand den
  Helden. Während des Startschirms steht die Zeit. Greift der Held selbst an, kämpft der Gegner wie immer.
- **Kontrollpunkte:** Die Regel ist als Unit-Test festgeschrieben. Kein Kämpfer mit Sicht steht näher als `aggroRange + roamRadius`, auch
  von keinem Punkt seines Streifkreises. Eine Streife kommt auf ihrem ganzen Weg nie näher als ihre Aggro-Reichweite.
- **Datenänderungen** (`content/dungeons.js`):

  | Stelle | vorher | nachher |
  |---|---|---|
  | Hof-Kontrollpunkt | (31,34) | (31,37), am Rolltor |
  | `hof-west` | (22,25) | (21,24) |
  | `hof-ost` | (40,25) | (41,24) |
  | Weinkeller-Kontrollpunkt | (9,9) | (10,5 / 20,5), im Gang vor der Westtür |
  | Galerie-Streife | ganzer Ring | nur Ost- und Südseite: (30,36) → (54,36) → (54,8) → (34,8) und zurück |

  - Das Rolltor liegt da, wo man ohnehin hereinkommt.
  - Der Weinkeller-Punkt ist außer Sicht der Ratten und hält die Laufwege der Requisiten aus „Dungeon-Räume“ frei (`auditScenery`). Der
    zuerst gewählte Gangpunkt (38,16) legte einen Laufweg über ein Weinfass.

**Pappwache** (Nebenbefund des Prüfers, „tauchte ohne erkennbaren Grund auf“):
- Sie ist **gewollt**, eine Attrappe: „Ritter in voller Rüstung. Aus Pappe. Mit Klebeband am Boden befestigt“. Wer sie schlägt, bekommt
  „PAPPE“ und einen Spruch.
- Sie stand von Anfang an im Pack. Auffällig wurde sie, als das Azubi-Paar lag und sie allein mit Namen stehen blieb.
- Falsch war nur, dass sie den Pack offen hielt. Das ist behoben. Die Figur selbst ist nicht geändert.

### 3 · Dungeon-Symbol im Bündel mit einem Lager

**Ursache:**
- Etappe 2 hatte das Dungeon-Symbol zum *Anführer* des Bündels gemacht („nie darin versteckt“). Gebündelt wurde es aber weiter.
- Bei Maßstab 1 und 1,5 teilte es sich den Punkt mit `camp:chapter-3-mob`. Der Tooltip zeigte „2 Orte hier“.

**Behebung** (`cartography.js`):
- `clusterMarkers` kennt `solo`. Solche Marker bündelt es nie, sie stehen an ihrem Ort und werden zuletzt, also obenauf, gezeichnet.
- Bündel in ihrer Nähe weichen auf einen Ring im Abstand des Bündelradius aus.
- Die Weltkarte setzt `solo` für Dungeons.
- Beleg: Unit-Test mit der echten Welt in fünf Maßstäben, dazu das Prüfskript mit Tooltip.

### 4 · Journal und Eingangskarte

**Ursache:**
- Das Einzelfenster-System (E-67) schließt beim Öffnen eines Overlays die anderen. Das Journal ersetzte also die Eingangskarte.
- Gesperrte Reiter waren `disabled`. Auf deaktivierten Knöpfen löst der Browser keine Zeigerereignisse aus, deshalb gab es keinen Tooltip.

**Behebung:**
- **Rückkehr** statt „daneben“ (`dungeon-ui.js`): Wird das Journal von der Eingangskarte aus geöffnet, merkt es sich das. Schließt der
  Spieler es (X oder Esc), kommt die Eingangskarte zurück.
  - Das gilt nicht, wenn inzwischen ein anderes Fenster aufgegangen ist (z. B. die Karte mit M) oder der Dungeon begonnen hat.
  - Reiterwechsel im Journal behalten die Rückkehr.
- **Reiter** (`dungeon-journal.js`, `content/dungeon-ui.js`):
  - Gesperrte Plätze sind per `aria-disabled` gesperrt statt per `disabled`.
  - Der Tooltip zeigt „Noch nicht entdeckt · Boss“, auf dem Stern-Platz „Noch nicht entdeckt · Selten · Erscheint nicht in jedem
    Durchgang.“
  - Jeder Reiter hat ein `aria-label`.
  - Die Bosse selbst sind nicht angefasst. Sobald Etappe 4A sie in `DUNGEON_BOSSES` einträgt, werden die Plätze automatisch frei.
- **Zugängliche Namen** (`dungeon-entry.js`):
  - Söldner-Knöpfe: „Anheuern: <Name> · <Rolle> · <Preis> Pfandmarken“ (bei zu wenig Geld mit Zusatz).
  - Journal-Knopf: „Journal · Bosse, Fähigkeiten und Beute“.
  - Der Talentknopf hat ebenfalls ein `aria-label`.

### 5 · Verborgene Gegner wählbar (Befund vom Rechtsklick-Fix)

**Ursache:** Der Renderer zeichnet Gegner in noch nicht betretenen Geheimräumen nicht (`concealed`). Der Treffertest in `target-ui.js`
(Hover und Rechtsklick) und die Tab-Auswahl prüften das nicht.

**Behebung:** `concealed` wird jetzt in `selectableEnemy` (target-ui.js), `tabChoices` (tab-target.js) und `engine.selectAt` geprüft.

## Prüfungen vor dem Push

### Punkt 1 (Build #608)

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1013 von 1013 grün, nach dem Rebase auf 15650507 |
| `npm run content:check` | 57 grün |
| `npm run build` | grün |
| `dungeon-check` | grün, Desktop und Handy |
| `dungeon-e1-check` | 7 von 7 grün |
| `dungeon-e2-check` | alle Teile grün |
| `dungeon-e3-check` | 14 von 14 grün |
| `dungeon-hotfix-check` Teil 1 | 4 von 4 grün |
| `dungeon-sim` | **2 Kriterien rot, schon vorher** (siehe unten) |

### Punkte 2–5 (Build #622)

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1040 von 1040 grün, vor dem letzten Rebase auf die Garage-Grafik (a4f3bf27); danach die Dungeon-Tests 79 von 79 |
| `npm run content:check` | 57 grün |
| `npm run build` | grün |
| `dungeon-check` | grün, Desktop und Handy |
| `dungeon-e1-check` | 7 von 7 grün |
| `dungeon-e2-check` | alle Teile grün |
| `dungeon-e3-check` | 14 von 14 grün |
| `dungeon-hotfix-check` | 8 von 8 grün (Teile 1–5) |
| `dungeon-sim` | dieselben 2 roten Kriterien wie auf `main` ohne Hotfix |

Die Rebases dazwischen brachten nur Grafik, Doku und ein Prüfskript (Dungeon-Räume, Garage, `ui:check`). Nach dem Rebase auf
Dungeon-Räume war der Requisiten-Test rot: Der neue Weinkeller-Kontrollpunkt legte einen Laufweg über ein Weinfass. Behoben mit 7643665.

### `dungeon-sim`

- Vorbestehend rot nach E-72, Etappe 4A übernimmt das Nachjustieren.
- Auf `origin/main` ed1d182c ohne Hotfix zeigt die Simulation dieselben Zahlen wie mit Hotfix:
  - „Gerd 60–100 s“ ist rot: Bärbel wipet bei Seed 7/8, alle vier Söldner am Boden.
  - „folgt der Behauptung stirbt mindestens einmal“ ist rot: ein Lauf mit 0 Toden.
- Die Simulation zieht Bosse mit dem Helden in der Arena, deshalb berührt die Türregel sie nicht.
- Die verschobenen Hof-Packs verschieben die Zufallsfolge. Die Einzelwerte ändern sich (Flügel Kevin einmal 107 statt 348 EP/min), die
  Kriterien nicht.
- Ein Lauf nur mit `--only=wing` ergibt 373–398 EP/min.

### Wackler unter Last

Beide Fehlschläge liefen allein grün:
- `dungeon-e3-check` war einmal rot bei „Nachsatz“, weil die Welt zwischen zwei Vorspul-Aufrufen weiterlief.
- `tests/game-server.test.mjs` war zweimal rot bei den Echtzeit-Tests.

### `scripts/dungeon-hotfix-check.mjs`

Mit echter Maus, 2024 × 900; CDP 9670, Server 4470; `ONLY=1,…,5`.
1. Söldner warten am Arenarand. Horst allein in der Arena zieht Gerd nicht: Gerd setzt zurück, die Tür bleibt offen.
2. Rechtsklick auf Gerd aus dem Hof, dazu ein Klick auf den Pfandwurf:
   - Der Held läuft per Wegsuche los, und der Wurf trifft nicht durch die Tür.
   - Beim Zufallen stehen alle fünf in der Zugbrücke.
   - Gerd wird besiegt (Vorspulen wie in `dungeon-e1-check`, Held unsterblich).
3. Weltkarte: Das Dungeon-Symbol ist in vier Maßstäben einzeln. Der Tooltip zeigt „Schloss Big B“, nie „Orte hier“.
4. Eingangskarte → Journal → X bzw. Esc bringt die Eingangskarte zurück; M (anderes Fenster) nicht. Dazu die Tooltips der Schädelplätze
   und die `aria-label`.
5. Neuladen:
   - Die Azubis von `hof-west` liegen, die Pappwache stand vor dem Speichern noch.
   - Der Held ist im Hof am Kontrollpunkt.
   - 7 s Spielzeit ohne Kampf; der Schutz lief noch 4,1 s.
6. Verborgener Pappschütze im Wehrgang: kein Hover-Ring, Rechtsklick und Tab wählen ihn nicht.

### Unit-Tests `tests/dungeon-hotfix.test.mjs` (14)

- Türregel als Tabelle
- Eingang innen für jede Arena
- Horst zieht nicht allein (auch mit Befehl „Angreifen“)
- Warten am Rand
- Tür zu mit allen vier drin
- kein Autoangriff durch die Tür
- Rechtsklick aus dem Hof mit allen fünf in der Arena
- Big B am Thronsaal
- geräumter Pack mit stehender Pappwache übersteht das Neuladen
- Kontrollpunkt-Regel für alle Kontrollpunkte und den Eingang
- Schutz nach dem Laden
- `clusterMarkers` mit `solo`
- echte Weltkarte in fünf Maßstäben
- verborgene Gegner

## Screenshots (`visual-review/dungeon-hotfix/`, nicht im Repo, selbst angesehen)

| Datei | Zeigt |
|---|---|
| `01-soeldner-warten-am-rand.jpg` | Held im Hof vor der Zugbrücke, alle vier Söldner draußen am Rand, Gerd allein in der Arena |
| `02-soeldner-zieht-nicht-allein.jpg` | Horst steht in der Arena, Gerd bleibt ruhig, Tür offen |
| `03-tuer-zu-alle-drin.jpg` | Tür zu (Riegel), alle fünf in der Zugbrücke, Chat „Die Tür fällt zu …“, Warnleiste läuft |
| `04-gerd-besiegt.jpg` | Beute-Moment „Beute · Gästeliste-Gerd“ mit +4 Marken, Tür wieder offen |
| `10-weltkarte-dungeon-einzeln-*.jpg` | Dungeon-Symbol einzeln mit Tooltip „Schloss Big B · Dungeon · Stufe 8–10 · 5 Köpfe“ |
| `20-journal-tooltip-gesperrt.jpg`, `21-journal-tooltip-selten.jpg` | Tooltips „Noch nicht entdeckt · Boss“ bzw. „… · Selten“ |
| `22-eingangskarte-zurueck.jpg` | nach dem Schließen des Journals wieder die Eingangskarte |
| `30-neuladen-hof.jpg`, `31-neuladen-ruhig.jpg` | nach dem Neuladen am Rolltor, `hof-west` weg, niemand im Kampf |
| `40-verborgen-kein-hover.jpg` | Maus über dem verborgenen Pappschützen: kein Ring, kein Ziel |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (Türregel, Einziehen, Reichweite, Pack geräumt, Schutz nach dem Laden), `companions.js` (Zielwahl, Warten am Rand), `attack-approach.js` (`inStrike`), `auto-combat.js` (`tickAuto`), `engine.js` (Kniff-Reichweite, `selectAt`), `target-ui.js`, `tab-target.js`, `cartography.js` |
| Oberfläche | `dungeon-ui.js` (Rückkehr zur Eingangskarte), `dungeon-journal.js` (Reiter), `dungeon-entry.js` (`aria-label`), `dungeon-ui.css` (eine Zeile Hover) |
| Daten | `content/dungeons.js` (Kontrollpunkte Hof und Weinkeller, Hof-Packs, Galerie-Streife), `content/dungeon-ui.js` (Texte „Noch nicht entdeckt“, „Selten“) |
| Prüfungen | `tests/dungeon-hotfix.test.mjs` (neu), `scripts/dungeon-hotfix-check.mjs` (neu), `docs/PLAYTEST-2026-09-25-dungeon-pruefer.md` (übernommen) |

## Restliste

1. **Adds überleben Gerd.** Stirbt Gerd, während seine Adds (Security-Azubis) noch kämpfen, geht die Tür auf, und die Adds kämpfen
   weiter. Das ist Verhalten aus Etappe 1: Die Arena hängt nur am Boss. Im Prüfskript lagen nach Gerd 0–3 Söldner, weil der Held im
   Vorspulen die Adds nicht angeht. Das gehört zum Balancing von Etappe 4A.
2. **`dungeon-sim` rot seit E-72:** Das übernimmt Etappe 4A.
3. **Laufstände von vor dem Hotfix:** Ein vor dem Hotfix gespeicherter Durchgang, bei dem die Pappwache `hof-west` offen hielt, bringt
   das Paar beim nächsten Laden noch einmal. Der Spielstand weiß nicht, dass es schon lag.
4. **Kontrollpunkt am Rolltor:** Am Hof-Kontrollpunkt steht der Hinweis „F · Zurück auf die Burgstraße“, wie beim ersten Betreten. Das
   ist wie der Instanzeingang in WoW.
5. **Galerie-Streife:** Sie läuft nur noch Ost- und Südseite. Soll sie in Etappe 4B wieder den ganzen Ring laufen, braucht die Galerie
   einen anderen Kontrollpunkt. Der Unit-Test meldet das.
6. **Offen aus dem Prüferbericht, nicht Teil dieses Auftrags:**
   - Nr. 9, zwei Titelzeilen je Raum mitten im Kampf, gestapelt mit Namen und Zahlen (Text-Diät).
   - Verfolgung „0/1“ und „0/3“ ohne Beschriftung.
   - Q bei „Unterbrechen“ ohne erkennbare Wirkung.
   - Die Kampf-Klarheit liegt bei Etappe 4B.
7. **Nicht geprüft:** Handy (Eingangskarte und Journal mit Touch). Die Rückkehr zur Karte läuft über dieselben Fensterereignisse.

## Commits und Live-Stand

| Commit | Inhalt | Live |
|---|---|---|
| 386ed62 | Arenatür: Türregel, Einziehen, keine Treffer von außen, Söldner warten am Rand; Prüferbericht übernommen | #608 |
| f39cd39 | Precache neu | #608 |
| b78e84c | Prüfskript: Rechtsklick-Prüfung zeitfest | #608 |
| 303e880 | Teil 2: Neuladen, Kontrollpunkte, Weltkarte, Journal und Eingangskarte, verborgene Gegner | #622 |
| 7643665 | Weinkeller-Kontrollpunkt an die Westtür, Kontrollpunkt-Test mit Streifkreis | #622 |
| 1341ccc | Precache neu | #622 |
