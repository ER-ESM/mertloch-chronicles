# Gameplay-Konzept: Händler und Handwerk · 2026-09-17

Zwei offene Enden werden zusammengeknotet: **Pfandmarken haben heute keinen Zweck** (sie fallen, sie zählen, sie liegen herum), und **Material stapelt sich**, sobald der Basisbau seine Stufen hat. Dieses Konzept macht aus beidem einen Kreislauf: kämpfen → Marken und Material → Verpflegung und Talismane → länger draußen bleiben.

Daten werden hier **noch nicht** angelegt. Erst Konzept, dann Freigabe, dann `content/shop.js` (Gameplay) plus Beute- und Item-Bedarf bei Loot, dann Engine und UI. Die Zahlen unten sind Entwurf, kein Export.

## 1 · Zweck der Pfandmarken

| Heute | Morgen |
|---|---|
| `coinsChance` je Beutefamilie, `loot.coinsHuman` 2 ± 6, Boss 25 | gleiche Quelle, aber eine Ausgabe: der Kiosk |
| Zwei Basisbau-Effekte (`coinDrop` an Werkstatt und Pfandlager) erhöhen etwas, das niemand ausgibt | dieselben Effekte erhöhen spürbar, wie oft man sich Verpflegung leisten kann |

**Regel:** Pfandmarken kaufen *Verbrauch*, niemals Ausrüstung. Ausrüstung kommt aus Gegnern und Kapiteln, sonst entwertet der Laden die Beute. Ein Lauf im Umland bringt grob 40–90 Marken; eine Brezel kostet 12. Das ist die Währungsachse: **eine gute Runde = zwei bis vier Verpflegungen.**

Zweite Ausgabe, damit Marken nie zum Zählwert werden: **Pfandflaschen-Rückgabe**. Kalle nimmt Material zum halben `value` in Marken an. Wer fünfzig Kronkorken herumträgt und keinen Bau mehr offen hat, macht sie zu Geld statt zu Ballast.

## 2 · Kioskkönig Kalle · Händler

Kalle steht heute als Dorfbewohner (`VILLAGERS`, variant 6) am Dorfkern und sagt „Pfand geb ich nur gegen Pfand.“ Genau das wird sein Beruf. Er ist **kein Clanmitglied**, deshalb ist sein Laden immer offen, unabhängig vom Kapitel – der erste Ort, an dem der Spieler etwas mit Beute anfangen kann, bevor die Bude überhaupt steht.

**Zwei Reiter, mehr nicht** (SSP-Einfachheit: ein Fenster, links Ware, rechts Marken):

1. **Verpflegung kaufen** – feste Liste, Bestand unbegrenzt, Freischaltung je Spielerstufe.
2. **Material verkaufen** – alles mit `kind:'material'` zum halben `value`, Stapel auf einmal.

### Preisentwurf (Marken)

| Ware | Stufe ab | Preis | Kommt aus | Warum der Preis |
|---|---:|---:|---|---|
| Notfallbrezel (160 Leben) | 1 | 12 | `brezel` | Grundversorgung; ein Umlandlauf zahlt drei |
| Konterwasser (40 Randale) | 1 | 12 | `wasser` | gleich teuer wie die Brezel; die Wahl ist inhaltlich, nicht wirtschaftlich |
| Eiskaltes Kaltgetränk (70 Randale) | 2 | 28 | `kaltgetraenk` | fast das Doppelte für fast das Doppelte |
| Oskars Currywurst (240 Leben, 20 Randale) | 3 | 40 | `currywurst` | die Reisemahlzeit vor einem Boss |
| **Pfandbon-Bündel** (Verbrauch: nächster Kill gibt dreifache Marken, 60 s) | 4 | 35 | neu, Loot | macht Marken zu einer Anlage statt zu einem Vorrat |

Verkauf: Material zum halben `value`, abgerundet, mindestens 1. Kronkorken 0 → 1, Dosenblech 1, Dachsfell 1, Hopfen 2. Das ist bewusst schlecht: Verkaufen ist die Notbremse, Bauen ist der Zweck.

**Kalles Regel gegen Inflation:** kein Ankauf von Ausrüstung, kein Verkauf von Dorflegenden, keine Rückkaufliste. Wer etwas wegwirft, hat es weggeworfen.

## 3 · Kevins Werkstatt · Werkbank

Die Werkstatt (`content/buildings.js` → `werkstatt`, Pate Kevin, ab Kapitel 2) ist schon gebaut, hat schon drei Stufen und gibt heute nur passive Boni. Sie bekommt ihre zweite Hälfte: **die Stufe der Werkstatt ist die Stufe der Werkbank.** Wer nicht baut, kann nicht handwerken – damit zahlt der Basisbau zum zweiten Mal.

| Werkstatt-Stufe | Freigeschaltet | Rezepte |
|---|---|---|
| 1 · Kühlschrank-Werkbank | Kapitel 2 | Verpflegung aus Material |
| 2 · Werkstatt mit Strom | Kapitel 3 | Talisman Stufe 1 (`charm`), Material-Umschmelze |
| 3 · Pfand-Ingenieurbüro | Kapitel 4 | Talisman Stufe 2, Kapitel-Material verarbeiten |

### Rezeptentwurf

| Rezept | Werkbank | Einsatz | Ergebnis |
|---|---:|---|---|
| Notfallbrezel ×2 | 1 | 3 × `feder`, 2 × `kronkorken` | `brezel` ×2 |
| Konterwasser ×2 | 1 | 3 × `dosenblech` | `wasser` ×2 |
| Eiskaltes Kaltgetränk | 2 | 4 × `dosenblech`, 2 × `kabel` | `kaltgetraenk` |
| Oskars Currywurst | 2 | 2 × `hopfen`, 3 × `borste`, 10 Marken | `currywurst` |
| **Kabelbinder-Talisman** (charm, Stufe 4) | 2 | 6 × `kabel`, 4 × `kronkorken` | neuer `charm`, Loot |
| **Dosenblech-Talisman** (charm, Stufe 8) | 3 | 10 × `dosenblech`, 6 × `borste`, 2 × `flugblatt` | neuer `charm`, Loot |
| Umschmelze | 2 | 5 × Material A | 1 × Material B derselben Seltenheit |

**Regel:** Die Werkbank baut nur `consumable` und `charm`. Waffen, Rüstung und Dorflegenden bleiben Beute. Der Talisman-Platz ist heute der schwächste Ausrüstungsplatz (nur Tier-Familien lassen `charm` fallen) – genau dort darf Handwerk stark sein, ohne die Beutewirtschaft zu kippen.

**Gegen Leerlauf:** kein Fortschrittsbalken, keine Wartezeit, keine Handwerksstufe mit eigener Erfahrungskurve. Klick, Material weg, Ware da. Handwerk ist eine Ausgabe, kein zweites Spiel.

## 4 · Der Kreislauf

```
Gegner  →  Material + Pfandmarken
             │                │
             ├─ Basisbau ─────┤  (Stufen, dauerhafte Boni)
             ├─ Werkbank ─────┤  (Verpflegung, Talisman – braucht die Werkstatt-Stufe)
             └─ Kalle ────────┘  (Verpflegung sofort, Material zu Marken)
                    ↓
            länger draußen, tiefer im Umland, bessere Beute
```

Drei Senken, ein Vorrat. Wer alles in den Bau steckt, hat dauerhafte Boni und muss bei Kalle kaufen. Wer nichts baut, kann nicht handwerken und kauft teuer. Beides ist spielbar; die Werkstatt ist der günstigere Weg und belohnt damit den Basisbau.

## 5 · Zahlenprüfung

| Prüfung | Sollwert |
|---|---|
| Umlandlauf (10 Minuten, Stufe 4–6) | 40–90 Marken, 15–30 Material |
| Verpflegung je Lauf bezahlbar | 2–4 Stück, mit voll ausgebauter Werkstatt/Pfandlager 4–6 |
| Handwerk gegen Kauf | Werkbank-Verpflegung kostet grob Material im Gegenwert von 60 % des Markenpreises |
| Talisman aus der Werkbank | nie stärker als eine gewürfelte `rare` desselben Stufenbereichs |
| Marken als Zählwert | nach einer Stunde Spiel darf der Bestand nicht dauerhaft über 300 stehen |

Nachweis: eine Zeile je Rezept im Balance-Bericht wäre falsch (der misst Kämpfe); stattdessen ein eigener kleiner Prüfschritt in `content/checks/gameplay.js` (Preis > 0, Rezept verweist auf vorhandene Items, kein Rezept baut `slot`-Ausrüstung außer `charm`) plus ein Test in `tests/content-gameplay.test.mjs`.

## 6 · Was wer braucht

**Gameplay (später, nach Freigabe):** `content/shop.js` mit `SHOP_STOCK` (Ware, Preis, Mindeststufe), `SELL_RATE`, `RECIPES` (Einsatz, Ergebnis, `bench`-Stufe) und `benchStage(buildings)`; Prüfungen und Tests dazu.

**Loot** (`docs/backlog/loot.md`): zwei neue `charm`-Gegenstände (Kabelbinder-Talisman Stufe 4, Dosenblech-Talisman Stufe 8) und der Verbrauchsgegenstand „Pfandbon-Bündel“; Urteil, ob `value` als Verkaufsgrundlage taugt oder eine eigene Zahl braucht.

**Engine** (`docs/backlog/engine.md`): Laden öffnen an einem NPC, `buy`/`sell`/`craft` gegen `rpg.coins` und Inventar, Werkbank liest die Werkstatt-Stufe aus `buildings`, alles serverlos im Spielstand.

**UI** (`docs/backlog/ui.md`, erst nach Engine): ein Fenster mit zwei Reitern für Kalle, ein Reiter „Werkbank“ im Budenfenster; kein drittes Fenster.

**Story** (`docs/backlog/story.md`): Kalle von `VILLAGERS` nach `NPCS` heben (Rolle „Kiosk · Händler“), Begrüßung, drei Kaufzeilen, eine Zeile für „zu teuer“; Kevin bekommt zwei Werkbank-Zeilen. Kalles Haltung: er hasst den Automaten, er hasst den Bus, er liebt Bargeld.

**Welt** (`docs/backlog/welt.md`): der Kiosk als Ort im Dorfkern, sichtbar und begehbar – heute steht Kalle nur herum.
