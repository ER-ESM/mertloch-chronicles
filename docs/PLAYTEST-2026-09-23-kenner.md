# Playtest — Mertloch Chronicles 0.20.0 (E-53 Werte & Rucksack · 2026-09-23)

**Persona:** ☐ Neuling ☑ Kenner ☐ Prüfer · **Agent/Mensch:** kenner-agent (nur Browser) · **Auftrag (Spielersprache):** „Held anlegen, 10–15 Minuten kämpfen und Beute sammeln, Clankiste holen; dann in unter 30 Sekunden entscheiden, ob ein Fundstück besser ist als das Getragene und warum – Rucksack-Filter, Reihenfolge, Suche, Tooltip-Vergleich, Figur → Werte, ein als Verbesserung markiertes Teil anlegen und auf der Figurenseite nachprüfen.“ · **Budget:** 50 Aktionen · **Gerät:** Desktop 2024×900, lokaler Server (Stand vor den Auflagen-Korrekturen)

Bericht der Persona unverändert übernommen:

---

**Freigabe: frei mit Auflagen.** Der Vergleich in der Tasche taugt. Nach Öffnen des Rucksacks war die Entscheidung „besser oder nicht“ in etwa 10 Sekunden klar (Pfeile ▲◆▼, Filter „Besser“, Schaden pro Sekunde im Tooltip). Der Weg dahin hat aber 36 von 50 Aktionen gekostet. Außerdem lässt sich das Versprechen im Tooltip auf der Figurenseite nicht nachprüfen.

### 1. Ergebnis
Ziel erreicht: **TEILWEISE**. Das Ausrüstungsziel habe ich geschafft: Clankiste geholt, ein als Verbesserung markiertes Teil angelegt, den Schaden auf der Figurenseite nachgeprüft. Die Kampfphase ist bei Hofprobe 5/8 (Ausweichen) stecken geblieben, deshalb gab es **0 Kills**.
- Aktionen: 50 von 50 (Budget aus), davon **etwa 13 verschwendet**: 3 Ausweichversuche, 2 Clankiste-Klicks ohne Wirkung, 3 Laufwege ohne oder mit falscher Wirkung, 1 Kniff aus 7 m, Kampfstatistik, Suche nach „Tempo“, 1 Klick auf einen veralteten Reiter.
- Erreichte Stufe: 1 (0/140 EP).
- Spielstand: vorher kein Held vorhanden, neuer Tresenbrecher „Kenner“ als Gast angelegt, Intro übersprungen.

### 2. Fluss-Messung
| Nr | Gegner | Nach dem Kill | Grund |
|---|---|---|---|
| – | Papp-Horst (Übungsfigur, 500 → 259) | kein Kill | Hofprobe 4/8 (2× Kniff, 2× Autoangriff) erledigt, danach hängt 5/8 „roter Kreis“. Weitere Gegner habe ich nicht erreicht. |

### 3. Rotation
- Tastenfolge: `Tab → 1 (Autoangriff an) → 2 (Kronkorken-Kelle)`. Mehr als zwei Fähigkeiten gibt es auf Stufe 1 nicht, eine richtige Rotation ist noch nicht entstanden.
- Gestört hat: Mit 1 oder 2 aus 7 m Abstand kommt nur „Zu weit entfernt · 7 m. Bewege dich näher zum Ziel“, die Figur läuft nicht von selbst hin. Im Genre ist das normalerweise so. Taste 2 hat ein „!“ auf dem Symbol, dessen Bedeutung ich nicht erkannt habe.
- Begriffe, die ich als Profi nicht sofort zuordnen konnte:
  - „Kniffe“ = Fähigkeiten
  - „Randale“ / „Randale-Nachschub“ = Wut und deren Zuwachs
  - „Ab durch die Hecke“ = Ausweichen; die Anleitung sagt „Ausweichknopf“
  - „Konterwasser“ und „Notfallbrezel“ = Heiltrank bzw. Essen
  - „Pfandmarken“ = Währung
  - „Deckung“ gegen „Schutz“ gegen „Schadensminderung“: siehe Hänger 7

### 4. Hänger
| Nr | Wo | Was passierte | Was erwartet | Schweregrad | Screenshot |
|---|---|---|---|---|---|
| 1 | Hofprobe 4/8. Klickpfad: Tab → 1 → 2 | „Zu weit entfernt · 7 m“, die Figur bleibt stehen | Autoangriff oder Kniff läuft zum Ziel | stockt | page-…11-34-36-606Z.jpeg |
| 2 | Welt, Rechtsklick-Laufweg | Rechtsklick (1075,430) neben Papp-Horst: keine Bewegung. Rechtsklick (520,330): Figur landet weit weg hinter der Kirche („St. Gangolf“, 30 m). Rechtsklick (700,765) Richtung Ida: keine Bewegung. WASD klappt zuverlässig. | Rechtsklick läuft genau dorthin | stockt (Werkzeuganteil möglich) | page-…11-37-09-250Z.jpeg |
| 3 | Hofprobe 5/8 „Der rote Kreis ist kein Tanzplatz“ | 3 Versuche: Leertaste nach „JETZT AUSWEICHEN!“, nochmal Leertaste, 1 s S gehalten. Die Stufe bleibt bei 5/8, Hinweis „Nochmal: …“. Der rote Kreis liegt auch 27–30 m von Papp-Horst entfernt noch unter meiner Figur. | Rauslaufen oder Ausweichen zählt; Kreis bleibt am Gegner | **bricht ab** (keine weiteren Kämpfe, Werkzeugverzögerung als Mitursache möglich) | page-…11-35-58-673Z.jpeg, page-…11-39-55-508Z.jpeg |
| 4 | Clankiste. Klickpfad: C → Figur/Ausrüstung → „Clankiste: Waffen zum Ausprobieren“ | 2× geklickt in „Mertlocher Fluren“ bzw. „St. Gangolf · Mertloch · Maifeld“: **keine Meldung, nichts passiert**. Beim 3. Klick in „St. Gangolf · Geschützter Rastplatz“ ging es, aber auch **ohne Meldung**: Der Knopf verschwindet nur, der Rucksack springt von 2/24 auf 4/24. „Am Treffpunkt“ ist in der Welt nicht markiert, der Ortsname wechselt zwischen „Clan-Treff“ und „St. Gangolf“. | Kiste als Objekt in der Welt oder deutlich markiert; bei falschem Ort „Nur am Treffpunkt“, bei Erfolg „Dosenklinge + Tresenhammer erhalten“ | **bricht fast ab** | page-…11-36-30-988Z.jpeg |
| 5 | Rucksack. Klickpfad: I → Besser → Maus über „Entgratete Dosenklinge“ | Tooltip: „Schaden −0,8 %“ (rot) neben „Nahkampf je Sekunde +29,4 %“ und „Nahkampf gesamt 14–20 → 12–22 (+0.0 Ø)“. Das −0,8 % ist das +1 Wumms der Flasche, das verloren geht. Das steht aber nur im Tooltip der **Flasche**, nicht bei der Klinge. „+0.0 Ø“ pro Treffer neben +29 % pro Sekunde liest sich wie ein Widerspruch. | Eine Zeile „−1 Wumms (−0,8 % Schaden)“ und klar „Ø je Treffer“ gegen „je Sekunde“ | wundert sich | page-…11-38-08-776Z.jpeg |
| 6 | C → Werte (nach dem Anlegen) | Nahkampf 12–22 passt zur Klinge. **Schaden pro Sekunde und Tempo stehen dort aber nicht**, die versprochenen +29,4 % je Sekunde lassen sich nicht nachprüfen. „Nahkampf · inkl. 50 % Nebenhand“, obwohl die Nebenhand ein Topfdeckel ist: unklar, was da eingerechnet wird. | Schaden/s und Angriffstempo auf der Werteseite, mit derselben Zahl wie im Tooltip | stockt | – |
| 7 | C → Werte | Doppelt oder überlappend: „Schadensbonus +9 %“ ist dieselbe Zahl wie „Wumms 10 → Schaden +9 %“. „Schutz 4 %“ gegen „Dicke Haut 18 → Schadensminderung 3,6 %“ gegen „Bastelgrips → Deckung +7 %“: drei Abwehrbegriffe, 4 und 3,6 passen nicht zusammen. „Standfestigkeit 13 → Leben +8“ bei 608 Leben: der Bezug ist unklar. Bastelgrips wirkt beim Nahkämpfer auf drei fremde Dinge (Heilung, Deckung, Randale). Positiv: Der Tooltip beim Werte-Namen erklärt den Wert je Punkt („0,8 % Heilung, 0,7 % Deckung, 0,03 Randale/s … Schaden hängt nicht daran“). | Ein Abwehrwert mit einem Namen; Grundwert + Bonus = Anzeige | wundert sich | – |
| 8 | C → Werte → „Kampfstatistik“ | Das Figurenfenster schließt sich, sichtbar öffnet sich nichts | Statistikfenster geht auf | stockt | page-…11-39-55-508Z.jpeg |
| 9 | I → Suche „Tempo“ | Laut Platzhalter „Name, Art, Güte oder Wert …“ sollte das gehen. Ergebnis: „Hier passt gerade nichts zu Suche und Filter.“, obwohl alle Waffen Tempo haben. „Flasche“ wird über den Namen gefunden. | Suche findet auch Werte aus dem Tooltip | wundert sich | – |
| 10 | Anlegen. Klickpfad: I → Teil anklicken → Dialog „Gegenstand“ (Reiter Anlegen/Vergleich) → „Haupthand ↔“ | 3 Aktionen, erwartet war 1 (Rechtsklick oder Doppelklick). Keine Meldung nach dem Anlegen. Danach springt der Hammer korrekt von „Etwa gleich gut ◆“ auf „Verschlechterung ▼“. | Rechtsklick = Anlegen in den passenden Platz | Idee | – |
| 11 | Waffen-Tooltips | Nur die Flasche hat einen Grundwert (+1 Wumms). Klinge und Hammer haben keine Werte wie Wumms, Standfestigkeit usw. Deren Wirkung sieht man deshalb nur auf der Werteseite, nie am Teil. | Mindestens ein Beuteteil mit Grundwerten zum Vergleichen | Idee | – |

Nicht geprüft (Budget aus): Filter Verpflegung und Material, „Reihenfolge“ zusammen mit „Sortieren“ (unklar, warum es beides gibt: Auswahl **und** Knopf), Shift-Details.

Menü-Klickpfade (erwartet war jeweils 1 Taste): Figur/Werte 2 (C → Werte) · Rucksack 1 (I) · Besser-Filter 1 · Anlegen 3 · Clankiste 2, aber ortsgebunden und ohne Meldung.

Belohnung: Ausrüstung von Ida angenommen, danach Portrait mit Weste, aber keine Meldung. Clankiste: nein. Anlegen: nein, nur die Pfeile ändern sich. Kill, Stufe und Talent kamen nicht vor.

### 5. Bewertung (1–5 mit Beleg)
- **Wusste ich, was zu tun ist? 3.** Die Hofprobe-Karte oben rechts ist klar. Die Clankiste steckt aber in der Figurenseite statt in der Welt, und „am Treffpunkt“ ist nicht markiert.
- **Wusste ich, was passiert ist? 2.** Die Clankiste scheitert stumm und gelingt stumm. Beim Anlegen kommt keine Meldung. „Schaden −0,8 %“ ohne Ursache. Beim Ausweichen nur „Nochmal“ ohne Grund.
- **Wollte ich weiterspielen? 3.** Grafik und Vergleichsmarken sind stark. Die Hofprobe-Blockade bei 5/8 hätte mich aber nach 5 Minuten rausgeworfen.
- **Kam ich ohne Pausen von Gegner zu Gegner? 1.** Nicht messbar, kein einziger Kill in 50 Aktionen.

### 6. Ein Satz an die Entwickler
Die Vergleichsanzeige im Rucksack ist genretauglich; zeigt Schaden/s und Tempo auch auf der Werteseite, schreibt den Verlust der alten Waffe (−1 Wumms) in den Tooltip der neuen und lasst Clankiste und Anlegen nie mehr stumm bleiben.

---

## Freigabe
☐ **frei** · ☑ **frei mit Auflagen** (Persona) — offen „bricht ab“: Nr 3 (Hofprobe 5/8), nicht durch E-53 verursacht.

## Entscheidung Produktion (Orchestrator-Sitzung, 2026-09-23)

| Nr | Entscheidung |
|---|---|
| 5 | **Umgesetzt.** Vergleich zeigt die Ursache („Werte: −1 Wumms · +8 Taktgefühl“) vor den Wirkungs-Chips; Waffenzeile „(+3,5 Ø je Treffer)“ mit deutschem Komma. |
| 6 | **Umgesetzt.** Figur → Werte zeigt Waffenschaden je Sekunde (Nahkampf, Fernkampf); „inkl. 50 % Nebenhand“ nur noch bei zweiter Einhandwaffe; Tempo steht bei Taktgefühl. |
| 7 | **Umgesetzt.** „Schadensbonus“ und „Schutz“ entfernt (Doppelungen von Wumms und Dicke Haut); Standfestigkeit zeigt „Leben +8 · gesamt 1058“. Deckung bleibt eigener Begriff (Schadenspolster, nicht Minderung). Bastelgrips für Nahkämpfer: bewusst universell (E-02). |
| 9 | **Umgesetzt.** Suche findet Wirkungen („Tempo“, „Heilung“ …) und Waffenbegriffe. |
| 10 | **Umgesetzt.** Meldung „Angelegt: Name · Platz“; Doppel- und Rechtsklick legen schon heute direkt an. Reihenfolge-Auswahl sortiert jetzt sofort, der Knopf sortiert erneut (nach neuer Beute). |
| 3 | **Offen, Backlog** `docs/backlog/gameplay.md`. Nicht durch E-53 berührt; Unit-Test zur Wiederholung grün, Browserskript für den Schritt ist selbst veraltet. Vor dem nächsten Release nachstellen. |
| 4, 8 | **Offen, Backlog** `docs/backlog/ui.md` (Clankiste stumm, Kampfstatistik-Knopf auf der Werteseite). |
| 1, 2 | **Offen, Backlog** `docs/backlog/gameplay.md`. |
| 11 | Inhaltliche Idee; Startwaffen bleiben vorerst ohne Werte. |

Nachgeprüft nach den Korrekturen: `scripts/bag-check.mjs` (Desktop 2024×900 + Handy 390×844 Touch), `npm run ui:check`, `npm run shop:check`, `scripts/items-20260923-check.mjs` grün; `npm test` 701/701.
