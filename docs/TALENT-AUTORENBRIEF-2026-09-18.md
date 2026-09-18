# Autorenbrief · Talentbäume mit Pfaden (E-32) · 2026-09-18

Für die Rolle Klassendesign (Inhalt). Ziel: **30 Talente je Spezialisierung** in **10 Reihen × 3 Pfaden**, je Reihe wählt
der Spieler genau ein Talent. Jedes Talent ändert eine Regel, keins ist nur eine Zahl. Entscheidung: [E-32](ENTSCHEIDUNGEN.md),
Hintergrund: [KLASSEN-BRAINSTORM-2026-09-18.md](KLASSEN-BRAINSTORM-2026-09-18.md).

## Dateien, die du anfasst (nur diese)

- `content/talents/<klasse>.js` – `TALENTS_<KLASSE>` mit drei Spezialisierungen, je Array von 30 Talenten; `GLOSSARY_<KLASSE>` für neue Begriffe.
- `content/procs/<klasse>.js` – `PROC_RULES_<KLASSE>` für neue Auslöser-Regeln.

Alles andere (Engine, Schema, andere Klassen, Tests) bleibt unangetastet. Prüfen mit `npm test` im Repo-Ordner.

## Struktur eines Talents

```js
{name:'Deckelwirtschaft',text:'Jede dritte Kelle gibt 25 Deckung und 10 Randale.',
 effects:{'proc:deckelwirtschaft':1},grants:null,skills:['strike'],
 info:{effect:'Jeder dritte erfolgreiche Grundangriff legt Deckung an und gibt Randale.',
       why:'Die Kellen zählen sichtbar mit; ein verfehlter Einsatz zählt nicht.',
       links:['proc:deckelwirtschaft','skill:dieter/strike'],terms:['grundangriff','deckung','randale','proc']},
 row:0,path:0}
```

- **Index = Speicherschlüssel.** Die vorhandenen Talente 0–9 bleiben an ihrem Index und behalten `row = Index` (0–9).
  Du wählst für jedes nur den `path` (0, 1, 2), so dass es thematisch zu einem der drei Pfade passt. Neue Talente hängst du
  hinten an (Index 10–29) und füllst damit die freien Zellen: am Ende hat jede Zelle (row 0–9 × path 0–2) genau ein Talent.
- **Pfade** je Spezialisierung stehen in `content/mechanics.js` (`paths[0..2].name`, dazu `bonus4`/`bonus7` = Pfadbonus bei
  4 bzw. 7 Talenten desselben Pfades). Die drei Pfade sind drei Spielrichtungen (z. B. Sicherheit / Tempo / Fläche). Talente
  eines Pfades bauen aufeinander auf und verstärken die Kernmechanik der Spezialisierung (siehe `SPEC_MECHANICS[spec]`).
- **Reihe 9 = Schlussstein:** die drei Talente der letzten Reihe ändern den Finisher (Eskalation) spürbar.
- **`grants`** (aktive Talentfähigkeit aus `content/skills.js TALENT_SKILLS`): das bestehende Aktiv-Talent bleibt; du darfst
  keine neuen aktiven Fähigkeiten erfinden (Icons fehlen). Talente, die die Talentfähigkeit verbessern, verweisen in
  `skills` auf sie.
- **`skills`:** jede ID muss ein Kniff der Klasse sein (`auto`, `strike`, `mark`, `burst`, `interrupt`, `parry`, `dash`,
  `heal`, `buff`, `throw`, `ground` oder eine `grants`-Fähigkeit der Klasse). Leeres Array = allgemeine passive Wirkung.
- **`text`:** ein Satz mit Zahl(en), sagt was passiert; Kniff-Texte enthalten ein Einsatz-Wort (drück, zünde, stell, wirf,
  sobald, bevor, wenn) – für Talente reicht die Regel.
- **`info` (Beschreibungsstandard Welle D):** `effect` ohne Zahlen (Zahlen werden aus `effects` abgeleitet), wiederholt
  nicht den Namen, ist im Baum einzigartig; `why` erklärt den Spielgrund; `links` zeigen auf echte IDs
  (`skill:<klasse>/<kniff>`, `talent:<spec>-<index>`, `proc:<id>`, `talentSkill:<id>`, `buff:<klasse>`, `throw:<klasse>`,
  `ground:<klasse>`); `terms` sind Glossar-IDs (vorhandene siehe `content/glossary.js GLOSSARY`, neue in `GLOSSARY_<KLASSE>`
  mit `name`, `short` (ein Satz), `long` (≥ 60 Zeichen, erklärt die Mechanik)).
- **Mindestens vier Proc-Talente je Spezialisierung** (Auslöser-Regeln), je Reihe keine zwei gleichen Effekte.

## Erlaubte Effektschlüssel (`effects`)

Nur Schlüssel aus `KNOWN_EFFECTS` (`content/talents.js`) oder `proc:<id>` mit einer Regel in deiner Proc-Datei. Werte sind
Zahlen; gleiche Schlüssel mehrerer Talente addieren sich. Bedeutung der Mechanik-Schlüssel (Zahlen = Aufschlag auf den
Grundwert in `content/mechanics.js`):

| Schlüssel | Wirkung | Spec |
|---|---|---|
| `stackDecay` (s) | Pegel-Uhr läuft länger | Kneipenschläger |
| `stackBonus` (Anteil, z. B. .04) | mehr Abriss-Schaden je Pegelstrich | Kneipenschläger |
| `stackBurstAt` (Striche) | Abriss-Variante gilt schon ab n Strichen | Kneipenschläger |
| `hangoverShort` (1) | Kater halb so lang | Kneipenschläger |
| `stackWave` (1) | Abriss trifft Nachbarn je Pegelstrich | Kneipenschläger |
| `fassPils`, `fassWeizen`, `fassBock` (1) | Sorte des nächsten Fasses (Bock vor Pils vor Weizen) | Zapfmeister |
| `fieldCount` (n) | zusätzliche Fässer | Zapfmeister |
| `fieldDuration` (s), `fieldRadius` (Einheiten) | platziertes Objekt hält länger / größerer Kreis | Zapfmeister, Lazarett, Schrottkoloss, Putzpyramide |
| `supplyMax` (n) | mehr Vorratsgläser | Lazarett |
| `cleanDuration` (s), `cleanDamage` (Anteil) | Großreinemachen länger / härter | Lazarett |
| `nestHonk` (1) | Gisela betäubt doppelt so lange | Lazarett |
| `dotSpread` (n) | Schimmel springt auf zusätzliche Nachbarn | Putzpyramide |
| `dotRadius` (Einheiten) | Schimmel springt weiter | Putzpyramide |
| `dotHeal` (1) | Durchputzen heilt je platzendem Schimmel | Putzpyramide |
| `dotExplodeTicks` (n) | Durchputzen mit mehr Ticks | Putzpyramide |
| `stateDuration` (s), `stateDrain` (je s, negativ = weniger), `stateDamage` (Anteil), `stateTrigger` (Randale, negativ = früher) | Putzwut | Filter-Furie |
| `mobileHeal`, `mobileStrike`, `mobileThrow`, `mobileBurst` (1) | Kniff im Laufen wirkbar | alle |
| `stateMobileAll` (1) | in der Putzwut alles im Laufen | Filter-Furie |
| `fuseDamage` (n), `fuseSpread` (1) | Lunte härter / springt beim Zünden weiter | Zündmeister |
| `chainJumps` (n), `chainFalloff` (Anteil, negativ = weniger Verlust) | Kurzschluss | Zündmeister |
| `reactionWindow` (s), `reactionDuration` (s) | Kettenreaktion | Zündmeister |
| `robbiDamage` (n), `robbiGuard` (1), `overloadDamage` (n), `overloadStun` (s) | Robbi und Überlast | Schrottkoloss |
| `gambleOver` (Anteil), `gamblePity` (negativ = früher), `gambleMisfireMult` (Anteil), `jackpotDuration` (s), `jackpotStreak` (negativ = früher) | Bastler-Glück | Pfandjäger |
| `hausverbotDuration` (s), `waveRadius` (Einheiten) | Hausverbot / Rausschmiss | Türsteher |
| `mobileMark`, `mobileGround` (1) | Markierung / Bodenkniff im Laufen | alle |
| `overloadRadius`, `chainRadius` (Einheiten), `overSplashShare` (Anteil), `tapDamage` (n), `fieldHeal` (n) | Überlast-Kreis, Blitzweite, Überzündungs-Splash, Bock-Explosion, Nest-Heilung | Kevin, Zapfmeister, Lazarett |
| `aoe`, `critDamage`, `reflect`, `parryWindow`, `lastStand`, `execute`, `markBonus`, `burstBonus`, `energyRegen` | allgemeine Regeln (Flächenschaden, Glückstreffer-Schaden, Parade-Rückwurf, Paradefenster, Schadensminderung unter 35 %, Schaden gegen Ziele unter 30 %, Markierungs-/Eskalationsschaden, Randale je s) – nur zusammen mit einer Bedingung im Text oder einem Auslöser | alle |

Dazu alle bisherigen Schlüssel (`guardOnStrike`, `doubleParry`, `spreadMark`, `healCombo`, … siehe `KNOWN_EFFECTS`).
Reine Wertschlüssel (`stamina`, `might`, `finesse`, `wit`, `*Rating`, `range`, `shieldBonus`, `healBonus`) dürfen nie
allein stehen.

## Proc-Regeln (`content/procs/<klasse>.js`)

```js
'tresenkante':{trigger:'crit',chance:.35,window:W,effect:{shield:40,reset:'parry'},glow:'parry',
  text:'Ein kritischer Treffer gibt 40 Deckung und macht Deckel drauf sofort bereit.',
  name:'Tresenkante',icon:'reinforced',look:'Massive Tresenkante aus Eichenholz',
  info:{effect:'…',why:'…',links:['talent:dieter-wall-5','skill:dieter/parry'],terms:['glueckstreffer','deckung','parade']}}
```

Auslöser: `crit`, `kill`, `parry`, `interrupt`, `dodge`, `dash`, `markTick`, `autoHit`, `heal`, `burst3`, `lowHealth`,
`skillHit` (+`skill`), `markedHit`, `beat`, `inZone` (+`zone`, `skill`; Zonen: keg, sanctuary, barricade, snare, burn, fass, robbi, nest, spores), `overcharge`, `misfire`, `jackpotStart`, `reactionStart`, optional `every:n`. Wirkungen: `free`, `reset`,
`empower` (Kniff-ID), `energy`, `points`, `shield`, `heal` (Zahl oder `{damage:Anteil}`), `haste` (Anteil),
`cdReduce:{skill,seconds}`, `supply:n` (Vorratsgläser), `clean:s` (Großreinemachen starten). `icon` aus `content/items.js ICONS`. Jede Regel muss von genau einem Talent genannt werden.

## Qualitätsregeln

1. Jede Reihe ist eine echte Entscheidung: drei verschiedene Spielrichtungen, keine drei Varianten derselben Zahl.
2. Jeder Pfad erzählt von unten nach oben eine Linie (Reihe 0 Einstieg → Reihe 9 Schlussstein).
3. Texte im Ton des Spiels (Kneipe, Landfrauen, Bastler), kurz, mit Zahlen.
4. `npm test` muss grün sein – die Prüfungen sagen dir genau, was fehlt (Zellen, Begriffe, Links, Zahlenblock).
