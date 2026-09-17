# Gameplay-Konzept: Fluss, Rotationen, Procs · 2026-09-17

Ziel des Chefs: Kämpfe sollen dynamisch und flüssig wirken, von Gegner zu Gegner ohne große Pausen. Spaß an der Rotation. Die ersten vier Stufen legen Grundkniffe und Hauptrotation fest; Talente ergänzen und erweitern die Rotation, gern proc-basiert. Volle Interaktivität. Dazu eine Trainingsarena als Admin-Werkzeug.

Stand der Mechanik (0.19): Aufbau-Verbrauch-Rhythmus (Kelle → Punkte → Abriss), Randale als Energie, Markierung als Verstärker, Autoangriff im Waffentempo, Zauber mit Stehenbleiben, drei Spezialisierungen je Figur mit zehn Talenten im Graphen.

## 1 · Woher die Pausen kommen

Gemessen mit dem Balance-Bericht und in der Arena, beobachtet im Spiel:

| Pause | Ursache | Wirkung |
|---|---|---|
| Nach jedem Kill 3–8 s Stillstand | Außerhalb des Kampfes regeneriert Leben 16/s; man wartet, bis der Balken voll ist | Der Rhythmus bricht bei jedem Gegner |
| Leere Randale nach zwei Gegnern | 5 Randale/s Regeneration, Markierung 20, Abriss 35, Wurf 18 | Man drückt nur noch Kelle und wartet |
| Punkte verfallen mit dem Gegner | Runes werden beim Abriss auf null gesetzt; ein neuer Gegner startet bei null | Die ersten drei Sekunden jedes Kampfes sind gleich |
| Laufwege 16–24 s zwischen Gegnern | Reviere mit zwei Plätzen je Zelle, 105 Einheiten Abstand | Mehr Laufen als Kämpfen |
| Zaubern bremst | Fernkampf-Kniffe brauchen Stehenbleiben (0,65–1,25 s) | Bewegung und Angriff schließen sich aus |
| Talente ändern kein Verhalten | 60 von 90 Talenten sind +Wert oder +Sekunden | Man liest sie einmal und vergisst sie |
| Finisher erst auf Stufe 6 | Markierung Stufe 5, Abriss Stufe 6 | 30 Minuten ohne vollständige Rotation |

## 2 · Grundsätze

1. **Der Kill ist die Belohnung, nicht das Ende.** Jeder Kill gibt Schwung: Randale, einen Punkt, kürzere Abklingzeiten, und der nächste Gegner steht schon da.
2. **Vier Tasten, ein Rhythmus, ab Stufe 4.** Aufbau (1), Markieren (2), Verbrauchen (3), Antwort (4: Parade oder Unterbrechen). Alles danach verändert diesen Rhythmus, ersetzt ihn nicht.
3. **Procs sind Entscheidungen mit Zeitfenster.** Ein Proc leuchtet 6 Sekunden auf der Leiste. Wer ihn nutzt, gewinnt Tempo oder Schaden. Wer ihn ignoriert, verliert nichts außer der Chance.
4. **Ein Talent ist eine Regel, kein Prozent.** „+5 Wumms“ fliegt raus. Jedes Talent nennt einen Auslöser und eine Folge, die man im Kampf sieht.
5. **Keine Warteressource.** Randale regeneriert im Kampf doppelt so schnell wie außerhalb; der Aufbaukniff ist immer drückbar.
6. **Gegner kommen in Gruppen.** Zwei bis drei nahe Gegner je Revier, damit man von einem zum nächsten zieht statt zu laufen.

## 3 · Grundrotation Stufe 1–4 je Figur

Neue Lernreihenfolge (`content/skills.js` LESSONS). Der Finisher rückt von Stufe 6 auf Stufe 3; Parade und Unterbrechen bilden Stufe 4. Buff, Wurf, Heilung und Boden kommen danach als Erweiterungen.

| Stufe | Dosen-Dieter (Tank) | Aperol-Anni (Heilerin) | Klo-Kevin (Fernkampf) |
|---|---|---|---|
| 1 | Kelle (Aufbau) · Ausweichen · Autoangriff | Pinsel (Aufbau) · Ausweichen · Autoangriff | Pfandgeschoss (Aufbau) · Ausweichen · Autoangriff |
| 2 | Pfandschuld (Markieren) | Hauspflege (Heilung über Zeit) | Kleber (Markieren + Verlangsamen) |
| 3 | Bierzelt-Abriss (Finisher) | Fleckentest (Markieren) | Restmüll-Rakete (Finisher) |
| 4 | Deckel drauf (Parade) + Halt die Fresse (Unterbrechen) | Thermomix-Turbostufe (Finisher) + Unterbrechen | Sicherung raus (Unterbrechen) + Pömpel-Panzer (Parade) |
| 5 | Dosenmut (Buff) | Buff | Buff |
| 6 | Wurf | Wurf | Dosen-Drohne (zweiter Wurf) |
| 7 | Konterfrühstück (Heilung) | Parade | Heilung |
| 9 | Bodenangriff | Bodenangriff | Bodenangriff |

Hauptrotation ab Stufe 4, jede Figur: **1 · 1 · 2 · 1 · 3**, dazwischen 4 als Antwort auf gelbe Balken und angekündigte Treffer. Das lernt man in zwei Minuten und behält es bis Stufe 30.

## 4 · Schwung (Momentum) · Engine

Neuer Zustand `g.momentum` (0–3 Stapel, 8 s Dauer, Kill erneuert):

- **Kill:** +25 Randale, +1 Punkt, Abklingzeit der Markierung auf 0, Stapel +1.
- **Je Stapel:** +8 % Drehzahl (Tempo), Laufgeschwindigkeit +6 % außerhalb der Reichweite.
- **Kein Verfall der Punkte beim Gegnerwechsel:** Punkte bleiben 8 s nach dem Kill erhalten.
- **Regeneration:** im Kampf 10 Randale/s statt 5; außerhalb 60 Leben/s für 4 s nach dem letzten Kill („Verschnaufen“), danach normal. Wer weiterzieht, verliert nichts.
- HUD: drei Bierdeckel-Pfeile neben dem Spielerfenster, die mit dem Stapel aufleuchten.

## 5 · Proc-Rahmen · Inhalt + Engine

Procs werden Daten in `content/procs.js`, nicht Sonderfälle in `class-mechanics.js`:

```
{id:'kellenwut', trigger:'crit', chance:.35, window:6, effect:{free:'burst'}, glow:'burst',
 text:'Ein kritischer Treffer macht den nächsten Abriss kostenlos.'}
```

Auslöser: `crit`, `kill`, `parry`, `interrupt`, `dodge`, `markTick`, `autoHit`, `heal`, `lowHealth`, `burst3` (Abriss mit drei Punkten). Effekte: `free` (Kniff kostenlos), `reset` (Abklingzeit 0), `empower` (nächster Kniff ×2), `energy`, `points`, `haste`, `shield`, `chain` (Kniff springt auf Nachbarn). Jeder Proc hat ein Zeitfenster und ein leuchtendes Icon; die Engine wertet Auslöser an einer Stelle aus (`procs.js` neben `class-mechanics.js`). Die Dorflegenden (`PROCS` in `content/items.js`) ziehen auf denselben Rahmen um.

## 6 · Talente als Rotationserweiterung

Jede Reihe des Graphen hat eine Aufgabe. Beispiele für drei Bäume; die anderen sechs folgen demselben Muster.

| Reihe | Aufgabe | Türsteher (Dieter) | Landhaus-Lazarett (Anni) | Zündmeister (Kevin) |
|---|---|---|---|---|
| 1 | Erster Proc | **Deckelwirtschaft:** Jede dritte Kelle gibt Deckung und macht die nächste Markierung kostenlos | **Frisch gewischt:** Hauspflege-Tick hat 20 %, den Pinsel zu verdoppeln | **Zündfunke:** Kleber-Tick hat 25 %, einen Punkt zu geben |
| 2 | Rhythmus ändern | **Doppelte Türkontrolle:** Parade fängt zwei Treffer, jeder gibt einen Punkt | **Einatmen, Ausatmen:** Heilung gibt einen Punkt; drei Heilungen = Fleckentest kostenlos | **Kleber für alle:** Markierung springt auf zwei Nachbarn, Abriss trifft alle Markierten |
| 3 | Aktivfähigkeit | Absperrband (Zone) | Sanitäts-Pogo (Heilzone) | Kettenzündung |
| 4 | Kill-Kette | **Tür bleibt zu:** Kill unter Deckung gibt 40 Deckung und setzt die Parade zurück | **Nachsorgepflicht:** Kill erneuert Hauspflege und heilt 10 % | **Rücklaufdruck:** Kill an markiertem Ziel: Kettenzündung 4 s früher, +2 Punkte |
| 5 | Capstone (ändert die Rota) | **Letzter Mann am Tresen:** Abriss verbraucht Deckung als vierten Punkt | **Zugabe fürs Herz:** Fleckentest an vollem Leben lädt zwei Doppelpinsel | **Kettenreaktion:** Abriss mit drei Punkten zündet alle Markierungen im Umkreis |

Regel für den Inhalts-Agenten: Kein Talent ohne Auslöser. Jeder Effektschlüssel in `KNOWN_EFFECTS` bekommt einen Proc-Eintrag oder wird gestrichen.

## 7 · Gegnerfluss · Engine + Inhalt

- **Gruppen statt Einzelplätze:** `SPAWN_TABLES.groupSize` 2–3 für Feldgegner im Umland; Lager mit 3–5.
- **Kettenzug:** Ein Gegner in 90 Einheiten Nähe eines kämpfenden Gegners greift nach 2 s mit ein („Kumpel kommt“). Kein Leash-Rücklauf, solange der Spieler innerhalb von 300 Einheiten bleibt.
- **Tab bevorzugt den nächsten nahen Gegner**, nicht den zuletzt gewählten.
- **Zeit bis zum Kill:** Feldgegner 4–7 s auf gleicher Stufe (Balance-Bericht ist heute bei 4–9 s, passt), Elite 15 s, Boss 45–60 s mit Phasen.
- **Zaubern in Bewegung:** Markierung und Wurf ohne Stehenbleiben; nur Finisher und Boden brauchen den Stand.

## 8 · Trainingsarena · umgesetzt

Clanbuch → Hilfe → Einstellungen → **Admin · Neustart, Sicherung, Trainingsarena** → Reiter „Trainingsarena“.

- **Gegner wählen** (alle Feldarten, Elite, Bosse), **Anzahl 1–8**, Häkchen **Übungspuppe** (greift nicht an, stirbt nicht, heilt außerhalb des Kampfes).
- **Aufstellen** setzt sie vor den Spieler; **Arena räumen** entfernt sie und zeigt die Bilanz.
- **Stufe für Tests** 4 / 6 / 10 / 15 (nur aufwärts; zurück über Admin-Neustart), **Voll heilen** setzt Leben, Randale und Abklingzeiten.
- **Messung** live: Schaden, Sekunden, DPS, Treffer, Kills, eingesteckter Schaden. Arenagegner geben keine EP, keine Beute, zählen für keinen Auftrag und laufen nie nach Hause. Die Arena funktioniert auch während der Hofprobe.

Testprotokoll je Änderung an Rotation oder Talenten:

1. Stufe 4, Puppe, 30 s Hauptrotation → DPS notieren (Korridor je Figur ±15 %).
2. Stufe 4, 3 × Pfandkeiler → Zeit bis alle tot, eingesteckter Schaden, keine Pause länger als 2 s zwischen den Kills.
3. Stufe 10 mit Talenten, 5 × Ruhewart → Procs müssen mindestens dreimal ausgelöst haben.
4. Boss auf seiner Stufe → 45–60 s, mindestens zwei Phasen erlebt.

## 9 · Umsetzung in Reihenfolge

| Schritt | Rolle | Datei | Prüfung |
|---|---|---|---|
| 1 Lernreihenfolge Stufe 1–4 | Inhalt | `content/skills.js` LESSONS/CLASS_LESSONS, README-Tabelle, Hofprobe-Texte | `npm run content:check`, Pacing-Skript |
| 2 Schwung | Engine | `engine.js` (kill, tick), HUD-Feld `momentum` | Test: Kill gibt Randale/Punkt, Stapel verfällt nach 8 s |
| 3 Proc-Rahmen | Inhalt + Engine | `content/procs.js`, `procs.js`, Leuchten in `combat-ui.js` | Test je Auslöser; Arena Stufe 10 |
| 4 Talente umschreiben | Inhalt | `content/talents.js` (IDs bleiben, Texte und Effekte neu) | Schema: jeder Effekt hat Proc oder Regel |
| 5 Gegnergruppen und Kettenzug | Engine + Inhalt | `encounters.js`, `SPAWN_TABLES.groupSize` | Ökologietests, Balance-Bericht |
| 6 Zaubern in Bewegung für Markierung/Wurf | Inhalt | `CAST_TIMES` in `content/combat.js` | Arena: Anni und Kevin laufen und markieren |
| 7 HUD Schwung + Proc-Leuchten | UI | `app.js`, `combat-ui.js`, `progression-ui.css` | Browsertest Desktop + mobil |

Schritte 1, 4 und 6 sind reine Inhaltsarbeit und können sofort beginnen; 2, 3, 5 brauchen die Engine; 7 die UI. Alles wird in der Arena gemessen, bevor es auf `main` geht.
