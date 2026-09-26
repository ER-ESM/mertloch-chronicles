# Dungeon „Schloss Big B“ · Fix 3 nach der Big-B-Abnahme · 2026-09-26

Grundlage:
- Big-B-Abnahme des Prüfers auf Build #721: `docs/PLAYTEST-2026-09-26-dungeon-bigb.md` (unverändert übernommen). Held Stufe 10,
  Tresenbrecher (`dieter-brawl`), typische Ausrüstung ohne Schild, Testzugang `--preset=bigb`.
- Vorarbeiten: `docs/DUNGEON-FIX2-2026-09-26.md`, `docs/DUNGEON-ETAPPE-1/2/3/4B-2026-09-25.md`, `docs/PLAYTEST-TESTZUGANG.md`.

Zweige `dungeon-fix3` (Punkte 1 und 2, Worktree `D:\Dev\MertlochChronicles-dg-fix3`) und `dungeon-fix3-r2` (Punkte 3–6, Worktree
`D:\Dev\MertlochChronicles-dg-fix3r2`), Basis `main` bd23ee09 (Build #720/#721).

**Live:** Build #725 (332eb38d, 26.09.2026); Punkte 1 und 2 zuerst als #723 (1c44171c). Einzelheiten unter „Veröffentlichung“.

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Figurengrafik (die neuen Schilder und die Lichtsäule der Truhe sind Requisiten).

## Kurzfassung

- **Held bleibt tot (Blocker):** Nach dem Kampf hilft ein lebender Heil-Söldner ohne Begrenzung auf (3 s, 50 % Leben). Lebt keiner, steht
  der Held 3 s nach Kampfende am Ort auf (35 %, wie E-44). Nach dem Kampf heißt der Knopf „Hier aufstehen“ und setzt nichts zurück. Ein
  Aufstieg als Geist füllt kein Leben mehr. Ein Söldner, der wieder aufsteht, schließt den Todesbildschirm nicht mehr. Das Sterbefenster
  sitzt im Dungeon über der Aktionsleiste; der Bossrahmen bleibt frei.
- **Keine Beute (Blocker):** Das Beutefenster öffnete sich und wurde im selben Takt wieder geschlossen – die Bildschleife prüfte fest
  43 E um den Beutel, Big B fällt aber abseits des Helden. Jetzt gilt die Reichweite des Beutels (bei Bossen die ganze Arena).
  - Die Endtruhe erscheint nach Big B **mitten im Thronsaal** mit goldener Lichtsäule; Rechtsklick und F öffnen die Dreierwahl.
  - Der Hinterausgang trägt ein grünes Notausgang-Schild, ein zweites hängt über der Tür zur Schatzkammer. Truhe und Ausgang stehen auf
    Karte, Minikarte und in der Verfolgung (Klick läuft hin).
  - Die Lichtsäule über Beute ist anklickbar. Erfolge und Titel kommen als kurze Einblendung oben.
- **Parieren für alle:** Jede Zeile der Warnleiste nennt die Antwort mit den Mitteln des Helden und seine Taste. Ohne Schild heißt der
  Siegelring „Ausweichen [Leer]“, mit Parade „Parieren [5] / Ausweichen [Leer]“. Ausweichen wirkt: kein Zertifikat, und Leer springt ohne
  Richtungstaste aus jeder Warnfläche heraus (auch aus Bahnen).
- **Handlung nach dem Nachsatz:** „Nach rechts [D]“ bzw. „In die Mitte“ mit Pfeil, das Zitat klein daneben; steht der Held schon sicher,
  „Rechts bleiben“. Namen sind gekürzt statt abgeschnitten. Die Kanonenkugel lässt nach dem Nachsatz 2,0 s statt 1,6 s.
- **Bildmitte frei:** Söldner- und Geistmeldungen nur im Chat; Fehlertexte im Dungeon-Kampf einzeilig unter dem Bossrahmen; die Warnleiste
  sucht sich einen Platz ohne Überlapp mit aktiven Warnflächen (meist rechts neben der Mitte).
- **Nebenbefunde:** Karte und Verfolgung zeigen dieselben Beweise; Chat-Reiter nehmen in Ruhe den Klick selbst an; der Todesschlag nennt
  immer Fähigkeit und Schaden.

## Ursache und Lösung je Punkt

### 1 · Held bleibt nach dem Sieg tot (Blocker) · `companions.js`, `dungeon.js`, `death-screen.js`, `engine.js`, `app.js`

**Ursachen** (drei, zusammen ergaben sie das Bild des Prüfers):
- **Aufhelfen war einmal je Kampf – und kam danach nie wieder.** `tickRevive` setzte `reviveUsed` erst zurück, wenn der Held *lebte* und der
  Söldner nicht mehr kämpfte. Lag der Held nach dem zweiten Tod, blieb `reviveUsed` wahr, auch lange nach dem Sieg. Einen Weg „ohne Heiler am
  Ort aufstehen“ gab es nicht; übrig blieb nur „Am Kontrollpunkt aufstehen“ mit dem Kampf-Tooltip, auch wenn kein Kampf mehr lief.
- **Aufstieg als Geist füllte das Leben:** `gainXp` setzte bei jedem Stufenaufstieg `hp = maxHp`, auch bei `dead`. Big Bs 1.500 EP brachten
  Stufe 11, der Rahmen zeigte 1.410/1.410, der Held lag weiter.
- **Der Todesbildschirm ging zu, sobald ein Söldner wieder stand:** `engine.emit(type,data)` mischt `data.type` ein; der Söldner meldet
  `emit('companion',{type:'revived',id})`, also ein Ereignis `revived` – dasselbe, mit dem `app.js` den Bildschirm des *Helden* schloss.
  Nach einem Wipe lag der Held dann tot ohne Fenster da (im Prüfskript nachgestellt).

**Lösung** (wie in WoW):
- **Nach dem Kampf** (Regel `groupFightOn` aus Fix 2, dieselbe wie für liegende Söldner) hilft ein lebender Heil-Söldner **ohne Begrenzung**
  auf: 3 s Wirkzeit, 50 % Leben (`COMPANION_ABILITIES.revive.afterCast/afterShare`). Im Kampf bleibt es bei einmal je Kampf, 8 s, 35 %.
- **Lebt kein Heiler**, steht der Held 3 s nach Kampfende am Ort auf, mit 35 % Leben wie beim Aufhelfen unter Mitspielern (E-44,
  `DUNGEON_GHOST.standUp`). Kommt ein Heiler nicht binnen 12 s an, ebenso (`healerWait`). Keine eigene Schwäche – der Held regeneriert
  außerhalb des Kampfs wie gewohnt.
- **Knopf nach Kampfstand** (`ghostState`):
  - Kampf läuft: „Am Kontrollpunkt aufstehen“, Tooltip „Gibt den Kampf auf …“ – wie bisher.
  - Kampf vorbei: **„Hier aufstehen“**, Tooltip „Der Kampf ist vorbei. Du stehst hier auf, nichts setzt zurück.“ (`standUpHere`).
  - Wipe (alle lagen, die Gegner sind schon zurückgesetzt): „Am Kontrollpunkt aufstehen“ mit ehrlichem Tooltip. Nach einem Wipe hilft
    niemand am Ort auf – sonst stünde der Held neben dem zurückgesetzten Boss. Fällt der Letzte erst, wenn kein Gegner mehr kämpft, ist das
    kein Wipe.
  - Der Streifen sagt „Söldner kämpfen weiter“, „Schorle-Susi hilft dir auf“ (mit Fortschritt), „Du stehst gleich auf“ oder „Alle am Boden“.
- **Aufstieg als Geist** füllt kein Leben und keine Lichtsäule; die große Einblendung wartet, bis der Held lebt und nicht mehr kämpft.
- **Nur der Held** schließt den Todesbildschirm (`revived` ohne `id` und nur, wenn der Held lebt).
- **Platz:** Im Dungeon sitzt der Todesbildschirm am Desktop über der Aktionsleiste (wie die alte Warnleiste gemessen), nicht mehr oben mittig
  auf dem Bossrahmen. Am Handy bleibt er oben.
- **Todesschlag** (Nebenbefund): immer mit Fähigkeit und Schaden, z. B. „Big B · Ordnerkante · 612“. Autoangriffe tragen ihren Namen
  (`e.autoAttack.name`), Lügen-Zauber ihren echten Namen statt Behauptung bzw. Nachsatz (`k.title`), liegende Trümmer und nasse Streifen
  heißen so.

### 2 · Keine Belohnung nach dem Sieg (Blocker) · `app.js`, `rpg-ui.js`, `dungeon.js`, `dungeon-bigb-art.js`, `dungeon-map-art.js`, `dungeon-ui.js`, `milestone-ui.js`

**Geklärt:**
- **Ging die Beute durch den Tod bzw. „Kampf aufgeben“ verloren?** Nein, der Beutel lag die ganze Zeit (Arena `thronsaal`). Aber das
  Fenster konnte **nie** offen bleiben: Die Bildschleife in `app.js` schloss das Beutefenster in jedem Takt, sobald der Held mehr als
  43 E (`COMBAT_RULES.lootRange`) vom Beutel entfernt stand. Big B fällt dort, wo ihn der Schutz hält – abseits des Helden. Der Beute-Moment
  öffnete also und wurde im selben Takt geschlossen, auch ohne Tod (im Browser nachgestellt, auch auf `main`). Bei Gerd fiel das nicht auf,
  weil der Held dort meist am Beutel stand. Dazu verfiel der Moment nach 90 s; der Prüfer stand nach dem Kontrollpunkt später in der Arena.
- **Erscheint die Endtruhe erst unter einer Bedingung?** Sie stand schon immer, aber in der Schatzkammer südlich des Thronsaals hinter der
  Tür, die Big B freigibt. Aus der Arenamitte liegt die Kammer unter der Aktionsleiste, 20 m entfernt – zu sehen war sie nicht.
- **Wo ist der Hinterausgang?** In der Südostecke der Schatzkammer, als kleine Kellertür ohne Beschriftung (Name nur im F-Knopf).
- **Rechtsklick auf den leuchtenden Gegenstand:** Die Klickfläche lag nur um den Beutel am Boden (24 E hoch); die Lichtsäule ragt 52–90 E auf.

**Lösung:**
- Beutefenster bleibt offen, solange der Beutel erreichbar ist (`game.lootReachable`: Reichweite des Beutels, bei Bossen die ganze Arena);
  Boss-Beutel mit Arena warten ohne Frist auf den lebenden Helden in der Arena. Der Hinweis im Fenster („in Reichweite“) folgt derselben Regel.
- **Endtruhe** erscheint nach Big Bs Tod **mitten im Thronsaal** (`chest.appear`, 54/20) mit goldener Lichtsäule, sichtbar aus dem ganzen
  Saal. Rechtsklick öffnet (nah) bzw. läuft hin; F wie bisher. Nicht gewählt und wieder angeklickt: derselbe Beutel.
- **Hinterausgang:** grünes Notausgang-Schild (Läufer zur Tür, leuchtet nach dem Sieg) über der Tür und ein zweites über der Schatzkammertür
  auf der Thronsaalseite; Rechtsklick auf Tür oder Schild läuft hin bzw. geht hinaus. Kein Text in der Welt (Text-Diät Etappe 2).
- **Finden:** Nach Big B stehen „Endtruhe“ und „Hinterausgang“ als Zeilen in der Verfolgung (Klick setzt die Wegmarke und läuft hin) und als
  Symbole auf Karte und Minikarte.
- **Lichtsäule anklickbar:** `COMBAT_RULES.lootClick.beam` (72 E) für Beutel ab ungewöhnlicher Beute, mit Glossar-Eintrag.
- **Erfolg** und **Titel** als kurze Einblendung oben mittig (`milestone-ui.js` `feat`, Symbol und Name, 3,2 s), nicht mehr als Kurzmeldung;
  im Chat bleibt die Zeile. Einblendungen warten, solange der Held liegt oder gekämpft wird (vorher lag die Kurzmeldung unter dem
  Todesbildschirm).

### 3 · „Parieren“ für jede Klasse machbar · neue Datei `alert-answer.js`, `boss-alerts.js`, `dungeon.js`, `dodge-out.js`, `content/dungeon-ui.js`

**Ursache:**
- Die Warnleiste zeigte den Antworttext aus den Daten (`hint:'Parieren'`) ohne Taste. Eine Taste stand nur bei laufenden unterbrechbaren
  Zaubern.
- Die Parade verlangt bei Dieter (alle drei Spezialisierungen), Schorsch (alle drei) und Kevin als Schrottkoloss einen Schild in der Nebenhand
  (`WEAPON_SKILL_RULES.shared.parry`). Die typische Ausrüstung hat keinen (Schild in 33–35 % der Levelläufe, Fix 2). Bärbel, Kevin
  als Zündmeister oder Pfandjäger und Käthe parieren ohne Schild.
- Ausweichen half gegen den Siegelring nur halb: Der Schaden ging daneben, das Zertifikat stapelte trotzdem.

**Lösung:**
- `alert-answer.js` leitet je Zeile die Antwort aus den Merkmalen des Zaubers und den Mitteln des Helden ab – mit seiner Taste:

  | Art | Antwort (Beispiel) | Taste |
  |---|---|---|
  | unterbrechbar | Unterbrechen / Zweimal unterbrechen | Unterbrecher (Q) |
  | Zertifikat (Siegelring) | mit Parade: „Parieren [5] / Ausweichen [Leer]“, ohne: „Ausweichen [Leer]“ | Parade bzw. Ausweichen |
  | Fläche, Kegel, Linie, Verteilen, Treffer | Fläche verlassen, Seitlich stehen, Ausweichen … | Ausweichen (Leer) |
  | Bahnen mit Lüge | vor dem Nachsatz „Nachsatz abwarten [A · D]“, danach siehe Punkt 4 | Lauftaste |
  | Bodenstellen mit Lüge oder Attrappen | „Nachsatz/Stempel abwarten“, danach „Raus aus der Fläche [Leer]“ oder „Stehen bleiben“ | Ausweichen |
  | Adds, Interessenten | Adds zuerst, Interessenten legen | Nächstes Ziel (Tab) |
  | Sammeln, Deckung, Rücken, Mitte | Zusammen stehen, Hinter Deckung … | Lauftasten (WASD) |
  | Trog | Schaden drauf | Grundangriff |
  | Greenscreen | Weg vom Greenscreen (warten, der Schutz zieht sie) | – |

  „Kann“ heißt: gelernt, Waffenbedingung erfüllt (Schild!) und auf einer Taste (`usable`). Die Tasten folgen der eigenen Belegung.
- **Ausweichen wirkt jetzt überall:** Ein ausgewichener Siegelring (Unverwundbarkeit des Sprungs) gibt kein Zertifikat. Leer ohne
  Richtungstaste springt aus jeder treffenden Warnfläche heraus – Bahnen quer zur nahen Kante, Stellen und Kegel weg von der Mitte, nie in
  eine andere aktive Fläche (`dodge-out.js` kennt `activeWarnAreas`).
- Läuft der Siegelring auf einem Söldner, nennt die Zeile ihn („Siegelring · auf Pils-Peter“).
- Am Handy stehen keine Tastenkappen in der Leiste (die Kampfknöpfe tragen die Kniffe).
- **Unit-Test** (`tests/dungeon-fix3.test.mjs`): alle Boss- und Trash-Zauber aus `DUNGEON_CASTS` × fünf Klassen × jede Spezialisierung ×
  typische und Startausrüstung: Jede Antwort hat eine machbare Handlung und eine echte Taste (außer „warten“); ohne Parade heißt der
  Siegelring „Ausweichen“.

### 4 · Handlung statt Zitat in der Schlussphase · `alert-answer.js`, `boss-alerts.js`, `content/dungeons.js`

**Ursache:** Nach dem Nachsatz zeigte die Zeile den Nachsatz selbst („… sagt man. Links.“) als Antwort; die Handlung musste man ableiten.
Namen liefen per Ellipse aus („Ritt auf der Kano…“, „Am eige…“). Nach dem Nachsatz blieben 1,6 s (2,6 − 1,0).

**Lösung:**
- Nach dem Nachsatz rechnet `laneAction` aus den echten Bahnen und der Position des Helden die Handlung: **„Nach rechts“** bzw. **„Nach
  links“** mit Pfeil und Lauftaste (D bzw. A), bei zwei Bahnen **„In die Mitte“** (Pfeil nach innen). Steht der Held schon sicher: „Rechts
  bleiben“, „Links bleiben“, „Mitte halten“ (ohne Taste, grün). Das Zitat steht klein und kursiv daneben.
- Kurznamen statt Ellipse (`DUNGEON_UI.short`: „Kanonenkugel“, „Anwalt“, „Schopf“ …); passt ein Name trotzdem nicht, entfällt er ganz – die
  Handlung wird nie abgeschnitten.
- **Reaktionszeit:** Die Kanonenkugel dauert 3,0 s statt 2,6 s; nach dem Nachsatz (V-D5: 1,0 s) bleiben 2,0 s (WoW-Richtwert).
  - Parkett (2,8 s) und Pappkulisse (2,6 s) bleiben: Ihre Stellen liegen unter dem, den sie treffen, ein Schritt reicht. Mit 3,0 s auch dort
    fiel in der Simulation eine ganze Gruppe (Dieter, Seed 8, 420 s).
  - Die Simulation spielt „folgt dem Nachsatz“ jetzt wie die Warnleiste es sagt, auch beim Siegelring (Parieren, ohne Schild Ausweichen).

### 5 · Bildmitte frei · `dungeon.js`, `companions.js`, `app.js`, `boss-alerts.js`, `dungeon-e4b.css`

**Ursache:**
- „Schorle-Susi hat dir aufgeholfen.“ und „… hilft dir auf.“ gingen als Kurzmeldung (`g.toast`) statt über `statusNote`, im Bosskampf 152 px
  von oben – mitten über Big B, der oben am Thron steht.
- Ablehnungen wie „Benötigt: Schild …“ kamen als rote Kurzmeldung (zweizeilig); die Fehlerzeile für „zu früh gedrückt“ stand fest bei 150 px.
- Die Warnleiste stand fest über der Aktionsleiste – im Thronsaal auf dem Arenaboden, wo die Bahnen über die ganze Länge laufen.

**Lösung:**
- Söldner- und Geistmeldungen (aufhelfen, aufgeholfen, Söldner kämpfen weiter, Wipe, Erfolg) nur im Chat.
- Fehlertexte im Dungeon-Kampf: der erste Satz, einzeilig, klein, direkt unter dem Bossrahmen (`--bf-bottom`, setzt `boss-alerts.js`).
- **Warnleiste mit Platzwahl:** `activeWarnAreas` (dungeon.js) liefert alle gerade gezeichneten Warnflächen (Behauptung gestrichelt, echte
  Bahnen, Stellen, Kreise, Kegel, Sammel-/Verteilkreise, Trümmer, Streifen). Die Leiste prüft je Takt vier Plätze – rechts neben der Mitte,
  oben unter dem Bossrahmen (unter der Fehlerzeile), links, zuletzt über der Aktionsleiste – und nimmt den ersten ohne Überlapp mit
  Warnflächen und HUD. Sie bleibt, wo sie ist, solange dort nichts liegt. Gemessen: kein Überlapp in 1.908 Messungen über beide Big-B-Läufe (siehe Prüfungen).

### 6 · Nebenbefunde

- **Beweise 0/3 auf der Karte, 3/3 in der Verfolgung:** Die Karte zählte nur vorgelegte Beweise (`run.evidence`), die Verfolgung gefundene
  und vorgelegte. Beide lesen jetzt `e4bState(g).evidence` mit denselben drei Lupen (leer, gefunden, vorgelegt).
- **Chat-Reiter:** In Ruhe fing die Kopfleiste mit `pointer-events:none` nichts; der Klick lief nur über eine Dokument-Abfrage (Fix 2). Mit
  echter Maus ging das, ein Werkzeug wie Playwright meldete aber „die Zeichenfläche fängt den Klick“, weil unter dem Zeiger die Leinwand lag.
  Jetzt nehmen die Reiter selbst den Klick an (`pointer-events:auto` nur für die Reiter); die Leiste dazwischen bleibt durchlässig (E-72 R5).
- **Todesschlag:** siehe Punkt 1.

## Simulation (`node scripts/dungeon-sim.mjs`, alle Teile)

Alle Kriterien grün, vor und nach Punkt 3–5 (typische Ausrüstung, Seeds 7–9):

| Kriterium | Fix 2 (#720) | Fix 3 Teil 1 (#723) | Fix 3 Teil 2 |
|---|---|---|---|
| Big B mit Held und 4 Söldnern 150–200 s | 177–197 s | 177–197 s | 178–195 s |
| „folgt der Behauptung“ stirbt mindestens einmal | grün | 1/2/1/1/2/2/2/2/2 | 2/2/2/2/2/2/2/2/1 |
| „folgt dem Nachsatz“ stirbt höchstens einmal | 0 in allen | 0 in allen | 0 in allen |
| Jeder Flügel 10–15 min (Dieter) | 12,0 · 12,1 · 10,9 | 12,1 · 12,0 · 10,8 | 12,0 · 12,1 · 10,9 |
| Voller Durchgang unter 50 min | 37,5 min | 37,4 min | 37,4 min |
| übrige Kriterien (Gerd, Etappe-4-Bosse, Trash, Ausrüstungsprofile, Farm) | grün | grün | grün |

Änderungen an der Simulation selbst (Messung, nicht Spiel):
- **Siegelring:** „folgt dem Nachsatz“ beantwortet ihn wie die Warnleiste (Parieren, ohne Schild Ausweichen). Vorher tat das Profil nichts;
  mit der längeren Kanonenkugel fiel dann einmal die ganze Gruppe (Dieter, Seed 8: der Held hielt Big B, die Zertifikate stapelten).
- **Jeder Lauf unabhängig:** Die Gegner-Nummern (`dungeon.js serial`) liefen über alle Teile weiter. Gleichstände bei Zielwahl und
  Reihenfolge hingen so davon ab, wie viele Gegner frühere Teile erzeugt hatten.
  - Mit der 3-s-Kanonenkugel kippte dadurch im Gesamtlauf das Rittergeschoss auf 15,1 min (allein gerechnet 12,1 min).
  - Jeder Lauf beginnt jetzt mit denselben Nummern (`resetEnemySerial`, nur die Simulation ruft es auf); Gesamt- und Einzellauf stimmen
    überein.
- **Endtruhe:** Der Weg zur Truhe zählt ab ihrem neuen Platz.

## Prüfungen

Ports CDP 9710–9719, Server 4510–4519, `BOOT_TRIES=450`. Der Rechner war durch parallele Sitzungen belastet.

| Prüfung | Teil 1 (Punkte 1, 2 · #723) | Teil 2 (Punkte 3–6) |
|---|---|---|
| `npm test` | grün (1250, davon 6 neu) | grün (1253, davon 9 in `tests/dungeon-fix3.test.mjs`) |
| `npm run content:check` | grün (57) | grün (57) |
| `npm run build` | grün | grün |
| `npm run ui:check` | grün (14) | grün (14) |
| `dungeon-check` | grün, Desktop und Handy | grün, Desktop und Handy |
| `dungeon-e1-check` … `dungeon-e4b-check` | grün (7 · 17 · 14 · 36 · 11) | grün (7 · 17 · 14 · 36 · 11) |
| `dungeon-hotfix-check` | grün (8) | grün (8) |
| `dungeon-fix2-check` | grün (15) | grün (15) |
| `dungeon-raeume-check` | grün | grün |
| `dungeon-sim` (alle Teile) | alle Kriterien grün | alle Kriterien grün |
| `mobile-check` Teil `dungeon` | grün (10 Schritte, 0 Befunde) | grün (10 Schritte, 0 Befunde) |
| **`dungeon-fix3-check`** (neu) | Teile 1, 2, 5 grün | Teile 1–5 grün (9 Prüfungen) |

Anpassungen an bestehenden Prüfungen (Verhalten gewollt geändert):
- `dungeon-e3-check`: Die Endtruhe steht jetzt mitten im Thronsaal (Platz aus den Daten statt fest 54/39).
- `dungeon-e4b-check` Teil 4: Gerds Beute-Moment wartet jetzt ohne Frist in der Arena, wo auch die kleine Truhe steht, und lag mit F zuerst
  im Weg. Der Teil räumt Gerds Beutel vorher weg.
- `dungeon-fix2-check` Teil 5: Nach dem Sieg heißt der Knopf „Hier aufstehen“; der Held steht am Ort auf, das Fenster öffnet von selbst
  (vorher „Am Kontrollpunkt aufstehen“ → Hof → Arena).
- `tests/dungeon-e3.test.mjs`, `tests/dungeon-e4b.test.mjs` (Truhenplatz, Titel als Ereignis), `tests/e72-klicks.test.mjs` (Fehlerzeile).

Ehrlich zur Reihenfolge:
- Teil 1: `ui:check`, `dungeon-check`, e1, e2, e4a, hotfix, raeume und `mobile-check` liefen vor der letzten kleinen Änderung (der
  Todesbildschirm schließt nur noch beim Helden). Danach liefen `npm test`, e3, e4b, fix2 und fix3 (Teile 2 und 5) erneut.
- Teil 2: Die ganze Reihe lief auf dem Endstand bis auf zwei Kleinigkeiten danach (`resetEnemySerial` für die Simulation, Kurzname
  „Regenrinnen-Hieb“ wieder lang). Danach liefen `npm test`, `content:check`, `dungeon-fix2-check` und die Simulation erneut.

`scripts/dungeon-fix3-check.mjs` (CDP 9712, Server 4512; `ONLY=1,…`) spielt Big B mit dem Testzugang `bigb` zweimal (Tresenbrecher als
Kneipenschläger, typische Ausrüstung ohne Schild, vier Söldner), mit echter Maus und echten Tasten. Ein kleiner Spieler-Bot im Browser weicht
nach dem Nachsatz aus, unterbricht, weicht dem Siegelring aus und schlägt zu:
1. **Ohne Tod** (150–158 s Echtzeit): Beweise per F vorgelegt, Rechtsklick auf Big B.
   - Danach: Beute-Moment, Erfolg oben (66 px von oben), Endtruhe im Bild, Rechtsklick → „1 / 3“, ein Teil per Maus gewählt.
   - Verfolgung „Hinterausgang“ angeklickt, Schild zu sehen, Rechtsklick auf die Tür → Burgstraße.
2. **Mit Tod in der Schlussphase:** erster Tod bei 35 % (die Heilerin hilft im Kampf auf), zweiter bei 8 % (nur mit stehender Heilerin).
   - Todesschlag „Big B · Ordnerkante · …“ (im Prüfskript mit Übermaß ausgelöst).
   - Im Kampf „Am Kontrollpunkt aufstehen“ mit Kampf-Tooltip; nach dem Sieg „Hier aufstehen“ mit „nichts setzt zurück“, Stufe 11 bei 0 Leben.
   - Die Heilerin hilft auf; Beute-Moment, Erfolg, Endtruhe. Das Sterbefenster überdeckt den Bossrahmen in keiner Messung.
3. **Warnleiste** (1.908 Messungen in beiden Läufen): kein Überlapp mit aktiven Warnflächen, jede Zeile mit Taste (außer „bleiben“), nichts
   abgeschnitten, Siegelring „Ausweichen [LEER]“. Nach dem Nachsatz nur Handlungen: Nach rechts, Nach links, In die Mitte, Rechts bleiben,
   Links bleiben, Mitte halten, Raus aus der Fläche, Stehen bleiben, Adds zuerst.
4. **Bildmitte** (dieselben Messungen): keine Kurzmeldung, keine Fehlerzeile, keine Einblendung zwischen 28 % und 72 % der Höhe und 30 % und
   70 % der Breite; alle Fehlertexte einzeilig unter dem Bossrahmen.
5. **Nebenbefunde:** Karte 3/3 = Verfolgung 3/3 vor und nach dem Vorlegen; Chat-Reiter „Ereignisse“ und „Beute“ in Ruhe per Klick, die
   Reiter liegen oben (`elementFromPoint`), die Welt bekommt den Klick nicht.

Bilder `visual-review/dungeon-fix3/*.jpg` (lokal, nicht im Repo), angesehen:

| Bild | zeigt |
|---|---|
| `10-kampf.jpg`, `11-nachsatz-handlung.jpg` | Warnleiste rechts neben der Arena: „Links bleiben“ bzw. „Nach rechts [D]“ mit Pfeil, „Ausweichen [LEER] ↻ Siegelring“, „Unterbrechen [Q] Anwalt“ |
| `15-beute-moment.jpg` | Beutefenster nach dem Sieg, Endtruhe mit Lichtsäule mitten im Saal, Verfolgung mit Endtruhe und Hinterausgang |
| `16-erfolg-oben.jpg` | „Erfolg · Der Nachsatz zählt“ oben |
| `17-endtruhe-sichtbar.jpg`, `18-endtruhe-wahl.jpg` | Truhe im Bild; Dreierwahl, dazu „Neuer Titel · Mieterschützer“ oben |
| `19-hinterausgang-schild.jpg`, `19b-draussen-burgstrasse.jpg` | zwei grüne Notausgang-Schilder, danach draußen |
| `21-tod-1.jpg`, `22-tod-2.jpg` | Sterbefenster über der Aktionsleiste, Bossrahmen frei; „In die Mitte [A] … und rechts.“ |
| `23-nach-dem-sieg-geist.jpg`, `24-aufgeholfen.jpg` | „Hier aufstehen“, „Schorle-Susi hilft dir auf“; danach steht der Held bei Truhe und Beutel |
| `50-chat-reiter.jpg` | Chat-Reiter per Klick |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (`ghostState`, `standUpHere`, Wipe nur mit zurückgesetzten Gegnern, `activeWarnAreas`, `endPropAt`, `chestShown`, Namen für den Todesschlag, Siegelring ausgewichen, Erfolge in den Chat, `resetEnemySerial`), `companions.js` (Aufhelfen nach dem Kampf), `engine.js` (Aufstieg als Geist, Todesschlag), `dodge-out.js` (Warnflächen), neue Datei `alert-answer.js` |
| Oberfläche | `app.js` (Reichweite des Beutefensters, Beute-Moment ohne Frist in der Arena, Lichtsäule anklickbar, Klick auf Truhe und Ausgang, Einblendungen warten, Erfolg-Einblendung, Todesbildschirm nur beim Helden, Fehlerzeile im Kampf, Weltpunkt → Bildschirm für die Warnleiste), `death-screen.js`, `boss-alerts.js`, `milestone-ui.js` (`feat`), `dungeon-bigb-art.js` (Truhe, Schilder), `dungeon-map-art.js`, `dungeon-map-ui.js`, `dungeon-ui.js` (Verfolgung), `rpg-ui.js`, `ui-glyphs.js` (Pfeile), `dungeon-e4b.css`, `bierdeckel.css` (Chat-Reiter) |
| Daten | `content/dungeons.js` (Truhe, Hinterausgang-Schild, `DUNGEON_GHOST`, Kanonenkugel 3,0 s, Texte), `content/companions.js` (`afterCast`, `afterShare`), `content/combat.js` (Texte des Todesbildschirms, `lootClick.beam` mit Glossar), `content/dungeon-ui.js` (`answers`, `short`), `content/unlocks.js` (Erfolg-Einblendung) |
| Prüfungen | `scripts/dungeon-fix3-check.mjs` (neu), `tests/dungeon-fix3.test.mjs` (neu, 9 Tests), `scripts/dungeon-sim.mjs`, `scripts/dungeon-e3-check.mjs`, `scripts/dungeon-e4b-check.mjs`, `scripts/dungeon-fix2-check.mjs`, `tests/dungeon-e3.test.mjs`, `tests/dungeon-e4b.test.mjs`, `tests/e72-klicks.test.mjs` |
| Doku | `docs/DUNGEON-FIX3-2026-09-26.md`, `docs/PLAYTEST-2026-09-26-dungeon-bigb.md` (Prüferbericht, unverändert) |

## Restliste

1. **Parkett und Pappkulisse** lassen nach dem Nachsatz 1,8 bzw. 1,6 s (die Kanonenkugel jetzt 2,0 s).
   - Mit 3,0 s auch dort fiel in der Simulation eine ganze Gruppe.
   - Ihre Stellen liegen unter dem Getroffenen, ein Schritt reicht. Im nächsten Playtest darauf achten.
2. **Boss-Mechaniken unter 2 s** (aus Fix 2): Gerds Rausschmiss 1,8/1,4 s und der Siegelring 1,2 s. Den Siegelring zeigt die Warnleiste
   12 s vorher mit Zeit; Ausweichen hat 0,4 s Unverwundbarkeit.
3. **Greenscreen (Rita)** ist die einzige Antwort ohne eigene Handlung (warten, der Schutz zieht sie weg); die Zeile hat deshalb keine Taste.
4. **Warnleiste rechts neben der Mitte:** gewählt, weil die Big-B-Bahnen über die ganze Arenalänge laufen. Ob der Blick dort gut hinfindet,
   sollte der nächste Prüfer-Playtest sagen; die Platzwahl nimmt sonst oben, links oder unten.
5. **Sterbefenster über der Aktionsleiste** gilt im Dungeon am Desktop immer (auch beim Trash); draußen und am Handy bleibt es oben.
6. **Nach einem Wipe** steht der Held nur am Kontrollpunkt auf, auch wenn später die Heilerin wieder steht – sonst stünde er neben dem
   zurückgesetzten Boss.
7. **Nicht beauftragte Nebenbefunde des Prüfers**, nicht angefasst:
   - Rita und Peter blieben vor dem Kampf kurz im Gang.
   - Tooltip „Autoangriff“ beim Spielstart.
   - Dazu gesehen: Buff-Symbole überdecken zeitweise den ersten Namen im Truppenrahmen (`24-aufgeholfen.jpg`).
8. **Playtest:** Ein Prüfer-Durchgang bis Big B mit dem Testzugang (`--preset=bigb`) auf dem neuen Stand steht aus.

## Veröffentlichung

- **Teil 1** (Punkte 1, 2 und Nebenbefunde): `git push origin dungeon-fix3:main` (bd23ee09..1c44171c, Commits d3db5419 und 1c44171c),
  `node scripts/server-refresh.mjs` → live **#723 · 1c44171c**. Kein Rebase nötig (main unverändert).
- **Teil 2** (Punkte 3–6, Simulation, Bericht): `git fetch && git rebase origin/main` (auf 1c44171c, ohne Konflikt), `npm run build`,
  `git push origin dungeon-fix3-r2:main` (1c44171c..332eb38d, Commits 96e26939 und 332eb38d), `node scripts/server-refresh.mjs` → live
  **#725 · 332eb38d**.
- Gegen die Live-Seite nachgeprüft (`CHECK_URL=https://mertloch.esm-consultant.de/`, `dungeon-fix3-check` Teile 1, 3, 4, 5): 6 Prüfungen
  grün – Big B ohne Tod (153 s), Beute-Moment, Erfolg oben, Endtruhe mit Dreierwahl, Hinterausgang hinaus; Warnleiste in 919 Messungen
  ohne Überlapp, mit Taste und Handlung; Bildmitte frei; Beweise gleich; Chat-Reiter per Klick.
