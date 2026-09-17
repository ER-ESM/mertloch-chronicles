# Roadmap — Mertloch Chronicles

Reihenfolge der Runden bis zum fertigen Akt 1. Besitzer: Lead-Architect. Grundlage: `docs/ENTSCHEIDUNGEN.md` (insbesondere E-22 „Akt 1 perfektionieren, bevor Akt 2 beginnt“), `docs/ROLLEN.md` (Dateibesitz), `docs/PIPELINE.md` (Ablauf je Runde).

**Leitsatz:** Akt 1 wird tief statt breit. Kein Inhalt für Akt 2, solange eine Runde offen ist.

**Takt:** Eine Runde = ein Auftrag je Rolle, ein Branch, ein Bericht, ein Fast-Forward nach `main` (E-07). Eine Runde ist erst abgeschlossen, wenn alle ihre Abnahmekriterien belegt sind — Beleg heißt Testzahl, Bericht-Diff oder Screenshot, nicht Zusage.

## Aktueller Nutzerauftrag · 2026-09-17

- Erledigt: Autoangriff mit getrennter Zielwahl und Start/Stopp für Desktop und Touch (E-25).
- Erledigt: Talent-/Proc-Integration einschließlich Klassendaten, Zählern, Heilung, Abklingzeitverkürzung, Takt- und Zonenregeln.
- Erledigt: Baumtransparenz bis zum unteren Stamm.
- Zurückgestellt auf Nutzerwunsch: Händler/Handwerk und ein neuer vollständiger Akt-1-Playtest.

Details und Abnahme: [Kampf-Integration](COMBAT-INTEGRATION-2026-09-17.md). Die folgenden Rundenbeschreibungen dokumentieren den ursprünglichen Ablauf; sie sind keine aktuelle Laufanzeige.

---

## Runde A — Fachrollen parallel + Playtest Akt 1 · läuft (2026-09-17)

**Ziel.** Die sechs Fachrollen arbeiten gleichzeitig auf disjunkten Dateien an ihren offenen Backlog-Punkten, während drei Playtest-Personas den Live-Stand von Akt 1 durchspielen. Am Ende steht ein Bild davon, was Akt 1 heute wirklich taugt.

**Wer läuft parallel** (disjunkter Dateibesitz laut `docs/ROLLEN.md`):

| Rolle | Branch | Schwerpunkt dieser Runde | Backlog |
|---|---|---|---|
| Story | `story` | Dialoglängen, Fetzen-Timing, Fetzen für Trigger `level`, Nebenquest-Vorlagen Kapitel 3/4 | `docs/backlog/story.md` |
| Klassen | `klassen` | Talente auf Auslöser-Regeln prüfen (E-12), Hofprobe-Texte gegen die Lernreihenfolge | `docs/backlog/klassen.md` |
| Gameplay | `gameplay` | Zweite Elite Außenbezirke, Keiler im Wohngebiet (mit Welt), Händler/Handwerk als Konzept | `docs/backlog/gameplay.md` |
| Balance | `balance` | Feldgegner ab Stufe 10, Sigi-Zähigkeit, Materialfluss gegen Basisbau-Kosten messen (E-21) | `docs/backlog/balance.md` |
| Welt | `welt` | Kapitel-Lager als Kulissen-Objekte, Bude mit Ausbaustufen | `docs/backlog/welt.md` |
| Engine | `engine` | Feldgegner-Skalierung, Start ohne Hose, Bau-Ortsregel, Event `bark` | `docs/backlog/engine.md` |
| Playtest | – | Neuling, Kenner, Prüfer auf dem Live-Stand von Akt 1 | `docs/PLAYTEST-<Datum>-<persona>.md` |

**Nicht in dieser Runde.** Loot (wartet auf Gameplay-Konzepte, siehe Runde B), UI (wartet auf Engine und Welt, siehe Runde B), Grafik (Prioritäten stehen, Lieferung läuft nebenher), Akt 2 (E-22).

**Abnahmekriterien Runde A**
1. `npm test` und `npm run content:check` grün auf `main` nach jedem Fast-Forward.
2. Jede beteiligte Rolle hat einen Bericht geliefert (was, warum, Beleg, offene Punkte) und ihre erledigten Backlog-Punkte abgehakt — nicht gelöscht.
3. Drei Playtest-Berichte liegen als `docs/PLAYTEST-<Datum>-<persona>.md` vor, jeweils mit Freigabe-Zeile.
4. Balance hat den Materialfluss je Kapitel gegen die Basisbau-Kosten gemessen und die Zahl im Bericht genannt (Voraussetzung für die spätere Entscheidung zu E-21).
5. Kein Rebase-Konflikt in fremden Dateien; Konflikte in `content/index.js` hat der Lead aufgelöst.
6. Neue Entscheidungen, die in der Runde fielen, stehen als E-nn in `docs/ENTSCHEIDUNGEN.md`.

---

## Runde B — Loot nach Gameplay, UI nach Engine und Welt

**Ziel.** Die abhängigen Rollen setzen auf dem auf, was Runde A geliefert hat. Reihenfolge Inhalt → Engine → UI → Grafik bleibt Pflicht (E-06).

**Reihenfolge innerhalb der Runde**
1. **Loot** (`loot`) — erst wenn Gameplays Händler-/Handwerk-Konzept und die zweite Elite stehen: Set-Boni für Dorflegenden, Verpflegung je Kapitel-Familie, Beutefamilie der neuen Elite. Braucht von Engine die Belohnungsgüte `epic`.
2. **UI** (`ui`) — erst wenn Engine (Event `bark`, Bau-Ortsregel, Start ohne Hose) und Welt (Kulissen-Objekte, Bude mit Ausbaustufen) gepusht sind: Sprechblasen, Elite-Titel im Zielfenster, Sprites je `variant`, Kapitel-Kulissen zeichnen, Porträt Pit anbinden.
3. **Grafik** — bindet die in Runde A und B gelieferten Motive an; Reihenfolge nach der Prioritätenliste in `docs/backlog/lead.md`.

**Abnahmekriterien Runde B**
1. Keine UI-Arbeit auf Inhalten, die nicht in `content/` stehen; keine Inhaltstexte im UI-Code.
2. Klickpfad im Browser durchgespielt (Vollbild 2024×900) **und** mobil (390×844), reproduzierbar als `scripts/*-check.mjs`, Screenshot im Review-Ordner.
3. Anti-Slop-Scorecard je geänderter Bildschirm mindestens 4 von 5 (E-08).
4. Clanbuch bleibt ein Fenster mit Reitern — kein neues Fenster, kein Einklappen (E-13).
5. `npm test`, `npm run content:check`, `npm run content:balance`, `npm run content:art` grün bzw. ausgeführt und eingecheckt.
6. Übergaben geschrieben: Engine → UI in `docs/UEBERGABE-UI-<Datum>.md`, UI → Grafik in `docs/GRAFIK-BEDARF.md`.

---

## Runde C — Playtest-Befunde verteilen und abarbeiten

**Ziel.** Aus den Berichten aus Runde A (und einem zweiten Lauf nach Runde B) werden Aufträge. Der Lead verteilt, die Rollen arbeiten ab, die Personas prüfen nach.

**Ablauf**
1. Lead liest die drei Playtest-Berichte und schreibt je Befund einen Auftrag in `docs/backlog/<rolle>.md`: Ziel, Grund (Zitat aus dem Bericht), Abnahmekriterium, betroffene Dateien.
2. Jeder Befund „bricht ab“ sperrt den nächsten Merge und wird zuerst behoben.
3. „stockt“ und „wundert sich“ entscheidet die Produktion: entweder Auftrag an eine Rolle oder Eintrag als Entscheidung (E-nn), wenn es Absicht ist.
4. Entscheidung zu E-21 (Basisbau-Kosten) fällt hier, auf Basis der gemessenen Sammelzeit.
5. Zweiter Playtest-Lauf mit denselben Personas auf frischem Spielstand.

**Abnahmekriterien Runde C**
1. Jeder Befund aus jedem Bericht ist entweder abgearbeitet oder als bewusste Entscheidung in `docs/ENTSCHEIDUNGEN.md` begründet. Kein Befund bleibt unkommentiert.
2. Kein offener Hänger der Stufe „bricht ab“.
3. Zweiter Lauf: Neuling erreicht ohne fremde Hilfe das Ende von Kapitel 1; Kenner findet seine Rotation ab Stufe 4; Prüfer bestätigt die Versprechen aus `docs/PITCH.md` und `docs/GAMEPLAY-KONZEPT-FLUSS.md` §2.
4. Basisbau: gemessene Sammelzeit für Stufe 1 aller verfügbaren Gebäude liegt im Bericht; E-21 ist bestätigt oder abgelöst.
5. `npm test` grün, Pages-Deploy nach dem Push geprüft.

---

## Danach — Akt 2 „Die Hochzeit“ (noch nicht beauftragt)

Erst wenn Runde C abgenommen ist (E-22). Haken liegen bereits: Bastian, die Kiste als Hochzeitsgeschenk, die Hochzeit am Samstag in Koblenz, die offene Frage, wo der Held vor dem Bus war (Fetzen 7/8). Gisela und der Pfandautomat bleiben Reserve (E-23) und sind auch in Akt 2 nicht gesetzt.

Vor dem ersten Akt-2-Auftrag: Pitch-Absatz in `docs/PITCH.md`, Entscheidung über Umfang in `docs/ENTSCHEIDUNGEN.md`, dann Story zuerst — nie Engine oder UI zuerst.

---

## Stand der Runden

| Runde | Status | Seit |
|---|---|---|
| A — Fachrollen parallel + Playtest Akt 1 | läuft | 2026-09-17 |
| B — Loot nach Gameplay, UI nach Engine/Welt | wartet auf A | – |
| C — Playtest-Befunde verteilen | wartet auf A und B | – |
| Akt 2 | nicht beauftragt (E-22) | – |
