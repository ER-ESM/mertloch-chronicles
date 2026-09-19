# Playtest Kenner · 2026-09-18 · Spezialisierungen nach E-32 (Live-Build #125)

Persona Kenner (Browser-Agent, Desktop 1400×900, Trainingsarena, Stufe 15). Auftrag: unterscheiden sich die Specs
spürbar? Bericht gekürzt; Einordnung durch Entwicklung in *kursiv*.

## Befunde

**Bricht ab**
1. Arena-Gegner töten die Stufe-15-Figur in 8 s (3 × Pfanddachs „St. 1": 150 DPS rein, 42 DPS raus; Figur hatte Nahkampf 14–20, Schutz 4 %). *Prüfen: setzt „Stufe für Tests" die Werte (maxHp, Ausrüstung) mit, oder nur die Stufenzahl? Und skalieren Arena-Gegner mit der Spielerstufe?*
2. Zifferntasten treffen nicht die beschrifteten Knöpfe: Taste 3 feuert bei Anni/Kevin „Seite 2 · Knopf 1", Taste 4 bei Kevin nicht den Finisher, Taste 6 bei Dieter Dosenmut. *Vermutung: der Agent lief im Touch-Modus (Playwright meldet Touch), dort ist die Leiste zweiseitig und die Tastenbelegung folgt der Touch-Seite. Am Desktop ohne Touch prüfen; wenn reproduzierbar, ist es ein Sperrer.*
3. Nach dem Kill kein neues Ziel; unsichtbare Gegner schlagen weiter, Stillstand → Tod.

**Stört**
- Kein Hover-Tooltip an Leistenknöpfen, Talente nur per Dialog + Bestätigung. *Touch-Modus-Artefakt; am Desktop gibt es Hover-Tooltips.*
- Spec-Wechsel im Kampf/außerhalb des Clan-Treffs scheitert still (Bande leer, Hinweis nur in der Statuszeile). *Vermutlich hat der Tester deshalb bei Zapfmeister/Filter-Furie/Zündmeister/Pfandjäger nie die Spec gewechselt: die beschriebenen Kniffnamen (Anstich, Fassanstich, Lunte, Kurzschluss, Pfandkanone) erscheinen nur mit aktiver Spec. Der Spec-Wechsel braucht eine sichtbare Fehlmeldung im Dialog und einen Weg aus der Arena zum Clan-Treff.*
- Klickpfade: Arena 5 Aktionen, Spec-Wechsel 4+ Aktionen.
- „Pegel" (HUD) vs. „Rausch" (Talente) – zwei Namen.
- Katerfass-Bodenziel ohne Vorschau/Bestätigung/Chip.
- Stufenknöpfe 4/6/10/15, kein 11.

**Gefällt**
- Kneipenschläger: „Bierzelt-Abriss gratis · 4 s" + „Gratis ✦" am Knopf; Rausch als Zweitleiste; Talent-Tooltips mit Zahlen; Arena-Messwerte; Statuszeile.

**Rangfolge Spielspaß:** Kneipenschläger › Pfandjäger › Zapfmeister › Zündmeister › Filter-Furie (die letzten vier ohne aktive Spec gespielt, s. o.).

**Bewertung:** Wusste ich, was zu tun ist? 3 · Wusste ich, was passiert ist? 2 · Weiterspielen? 2 · Ohne Pausen von Gegner zu Gegner? 1.

## Ableitungen (Backlog)

- [x] Spec-Wechsel: Fehlgrund als Dialog mit Knopf „Zum Clan-Treff und wechseln"; Arena-Panel hat Spezialisierungs-Knöpfe und „Zum Clan-Treff" (2026-09-19).
- [x] Geprüft (2026-09-19): „Stufe für Tests" levelt über gainXp (Werte ziehen mit); Arena-Gegner behalten Stufe-1-Werte, der Tod kam durch fehlende Ausrüstung auf Stufe 15. Arena-Hinweis ergänzt: Ausrüstung bleibt Sache des Spielers.
- [x] Auto-Retarget nach Kill auf den nächsten kämpfenden Gegner, Autoangriff läuft weiter (engine.js kill, 2026-09-19).
- [x] Ziffern treffen im Touch-Modus die sichtbaren Touch-Slots der aktuellen Seite (mobile.slotForKey, 2026-09-19).
- [x] Wiederholung am Desktop (2026-09-19, Build #130): Specs spürbar verschieden (Rangfolge Schrottkoloss › Filter-Furie › Zapfmeister › Kneipenschläger › Zündmeister), Bewertung 4/3/3/2. Abbrecher und Ableitungen:
  - [x] Steuerungsmodus ging nach „Neu laden" (PWA-Update-Banner) verloren → Auswahl speichert jetzt sofort beim Ändern (mobile-controls).
  - [x] Stufe 15 ohne Ausrüstung starb an Stufe-1-Dachsen → „Stufe für Tests" legt Testausrüstung an (arena.js outfitForLevel).
  - [x] Ziel nach Kill traf nicht → im Test nicht reproduzierbar (Retarget und Autoangriff greifen, Tests decken es ab); beobachten.
  - [x] Spec-Knopf in der Arena springt sofort um und meldet „Arena geräumt · … aktiv".
  - [x] Leere Desktop-Leiste → Knopf „Leiste: Standardbelegung" im Figur-Fenster.
  - [x] „Pegel" doppelt belegt → Kneipenschläger-Stapel heißt jetzt Deckelstriche / Deckel-Uhr.
  - [x] Anstich-Tooltip ohne Böller-Zahlen; Talent-Tooltip nennt den Sperrgrund im Kampf; Baum-Intro erklärt Pfadmischen und Pfadbonus (Bahnkopf-Titel).
  - [x] Arena merkt sich Gegner, Anzahl und Puppe; nach der ersten Nutzung öffnet das Admin-Fenster direkt den Reiter Trainingsarena (2026-09-20).
