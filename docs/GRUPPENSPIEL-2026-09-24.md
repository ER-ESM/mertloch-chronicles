# Gruppenspiel mit Mitspielern und Söldnern · 24.09.2026

Auftrag: „In den nächsten 20 Iterationen um das Gruppenspiel mit anderen Live-Spielern und auch mit Söldnern kümmern.“
Grundlage: Gruppen, Bedarf/Gier, Hilfsziel, Aufhelfen, Handel, Weltbosse (E-42/E-44) und Söldner (E-45). Live bis #536.

## Prüfweg

`node scripts/party-online-check.mjs [szene]` startet einen eigenen Spielserver und zwei angemeldete Browser (Rudi, Moni) und
führt 16 Prüfungen über echte Klickwege aus: Einladen, fremde Söldner, Kopfgrenze, Markieren, Assist, Bereitschaftscheck,
Söldner-Heilung, Folgen, Sprechblase, Anführer, Reichweite, Karte. Aufnahmen nach `visual-review/party/`.
Umgebungsvariablen: `EVAL_A`/`EVAL_B` (eigener Schritt am Ende), `WAIT`, `CLIP=x,y,w,h`, `PRINT_B` (Ausdruck bei Moni ausgeben),
`TOUCH_B=1` (Moni spielt am Handy quer), `CDP_PORT`. Testzugriff im Browser: `globalThis.__mertloch.online` (Netzschicht).

## Was neu ist

| Runde | Was | Wo |
|---|---|---|
| 1 | Gruppenkopf wie „Deine Truppe“ (Kopfzahl Menschen + Söldner von 5, Verlassen), Anführer-Krone am eigenen Rahmen | `online.js` `renderParty`, `ui-chrome.css` |
| 2 | Söldner der Mitspieler sichtbar: Besitzer schickt `cp` (Katalog-ID + Zustand), Server säubert (`cleanCompanionWire`), Empfänger baut Name/Aussehen aus dem Katalog | `companions.js` `companionWire`/`remoteCompanionViews`, `server.mjs` |
| 3 | Namensschild fremder Söldner: Name + „Rudis Söldner“ (Genitiv) | `renderer.js`, `content/companion-ui.js` `COMPANION_PLATE` |
| 4 | Höchstens fünf Köpfe inkl. fremder Söldner; ein Beitritt über fünf lässt Söldner Platz machen (alle Clients rechnen gleich: alphabetisch letzter Besitzer, neuester zuerst) | `companions.js` `partyOverflow`, `app.js` |
| 5 | Zielmarkierungen Totenkopf/Kreuz/Stern/Kreis über das Zielrahmen-Menü, in der Gruppe über die Gegner-`netId` geteilt (Feld `groupMark`, `e.mark` ist die Klassenmechanik!) | `target-marks.js`, `server.mjs` `mark` |
| 6 | Söldner greifen Markierte in dieser Reihenfolge an; Markierungen frei belegbar (`markSkull` …) | `companions.js` `chooseTarget`, `content/keybinds.js` |
| 7 | Assist: Rahmen zeigt das Ziel des Mitspielers (⚔), „Ziel übernehmen“ im Menü und als Taste (`assist`); Ziel reist als `tg` | `online.js`, `unit-frame.js`, `shared-world.mjs` |
| 8 | Bereitschaftscheck: Menü am Gruppenkopf oder `/bereit`, Fenster mit Zeitbalken, ✓/✗/… am Rahmen, Zusammenfassung | `party-ready.js`, `content/group.js`, `server.mjs` `ready` |
| 9 | Heil-Söldner heilen verletzte Mitspieler über den Hilfsweg (`aidHeal`), Name des Söldners in der Chatzeile | `companions.js` `partyPatient`/`healMate` |
| 10 | Söldner der Mitspieler als schmale Leisten unter deren Gruppenrahmen | `unit-frame.js` `pets` |
| 11 | Folgen: Menü am Mitspieler/Rahmen; Taste, Klick-Lauf, Tod oder „außer Sicht“ beenden es | `follow.js`, `content/group.js` |
| 12 | Würfelkarte mit Gegenstandsbild, Qualitätsrahmen und Tooltip samt Vergleich (gewürfelte Teile für die Dauer des Wurfs in `ITEMS`) | `net-party.js` |
| 13 | Sprechblasen für „sagen“ und Gruppenchat über dem Kopf (Art `player`) | `enemy-ui.js`, `online.js` |
| 14 | Anführer übertragen: Menü und `/anführer Name` | `shared-world.mjs` `promote` |
| 15 | Kampfpose reist mit (`a`: 1 Schlag, 2 Zauber; `r` Fernkampf) für Helden und Söldner | `online.js` `poseCode`, `companions.js` |
| 16 | Mitglieder außer Hilfsreichweite im Rahmen blass; Handelsanfrage mit eigenem Fenstertitel | `online.js`, `unit-frame.js` |
| 17 | Karte: Gruppe grün mit Namen (auch fern, aus der Gruppenmeldung), andere Spieler blau; Legende | `cartography.js`, `atlas-ui.js` |
| 18 | Handy quer: Gruppenkopf nur so breit wie sein Inhalt | `ui-chrome.css` |
| 19 | Tooltip am Gruppenkopf (Nähe, EP-Bonus, geteilte Ziele/Buffs, Würfeln, Kopfgrenze); Kopf bleibt beim Neuaufbau stehen | `online.js`, `content/group.js` |

## Protokoll (additiv, API_VERSION unverändert)

- `pos` zusätzlich: `cp:[{i,x,y,f,s,h,l,a?,r?}]` (≤ 4, nur `merc-…`), `tg` (Gegner-netId), `a` (Pose), `r` (Fernkampf). `snap` reicht sie weiter.
- Gruppenmeldung `party.members[]` zusätzlich `tg`.
- Neu: `{t:'mark',e,m}` (an die Gruppe), `{t:'ready',op:'ask'|'answer',ok}` (Fragen nur der Anführer), `party` mit `op:'promote'`.

## Offen

- Fremde Söldner lassen sich nicht anklicken/heilen (Hilfsweg adressiert nur Spieler).
- Heil-Chatzeilen bei Dauerheilung häufen sich (zusammenfassen wie der Kampftext).
- Gruppen-Instanz/Dungeon, Gilde, Freundesliste weiterhin offen (siehe `docs/backlog/engine.md`).
