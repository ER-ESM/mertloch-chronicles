# Begleiter: Söldner heute, Pets morgen (E-45) · Übergabe 2026-09-21

Ein Engine-Baustein für alles, was an der Seite des Spielers selbstständig kämpft. Erste Anwendung: **anheuerbare
Söldner**, damit Gruppenspiel und der Meilenstein „Dungeons" auch ohne vier Mitspieler funktionieren. Zweite Anwendung
(vorbereitet, nicht gebaut): **dauerhafte Klassen-Pets** – derselbe Baustein, nur ohne Vertrag.

Stand: Inhalt + Engine + Tests fertig, Minimalbedienung über Chat-Befehle. Fenster, Gruppenrahmen und Grafik fehlen (UI).

## Warum im Client und nicht als Server-Bot

Der Kampf rechnet im Browser (E-35): Gegner-KI, Zauber und Flächen kennt nur der Client. Ein Bot am Server sieht nicht,
wohin der Boss zielt, und Instanzen sind für ihn unsichtbar. Begleiter leben deshalb **im Client des Besitzers**:
keine Netzverzögerung, funktioniert in Instanzen und offline. Ihr Schaden zieht Gegnern Leben ab – `net-world.js` meldet
jede Lebensdifferenz als Treffer des Besitzers. **Der Server brauchte für diese Stufe keine Änderung.**

## Wie es funktioniert

| Teil | Wo | Kurz |
|---|---|---|
| Daten | `content/companions.js` | `COMPANIONS` (wer), `COMPANION_ROLES` (Werte je Stufe), `COMPANION_ABILITIES` (Fähigkeiten über `kind`), `COMPANION_RULES` (alle Zahlen), `COMPANION_TEXT` |
| Logik | `companions.js` | Bedrohung + Zielwahl, Gegner-KI gegen Begleiter, Begleiter-KI, Vertrag, Speichern, Chat-Befehle |
| Einhängepunkte | `engine.js` | Import, `initCompanions`, `tickCompanions` je Takt, Weiche in der Gegnerschleife, `addThreat` in `damage()`, `resetCompanions` in `respawn()`, `companions` in `save()`, fünf Methoden |
| Anzeige (vorläufig) | `renderer.js` | eine Zeile: Begleiter werden über den Pfad `type:'other'` wie Gruppenmitglieder gezeichnet (`c.view`) |
| Bedienung (vorläufig) | `online.js` | `/söldner`, `/söldner Name`, `/entlassen [Name]`, `/befehl folgen|warten|angriff`, `/haltung unterstützen|verteidigen|passiv` |
| Tests | `tests/companions.test.mjs` | 16 Tests, je Mechanik einer |

**Bedrohung.** Jeder kämpfende Gegner führt lokal `e.threat = {player: n, <begleiter-id>: n}` und `e.focus`. Zielwechsel
erst bei 10 % mehr Bedrohung (wie `shared-world.mjs`). Hält ein Begleiter das Ziel, läuft der Gegner über
`tickEnemyOnCompanion` (Verfolgen, Autoangriff, Zauber aus `CAST_SETS` auf den Begleiter); sonst unverändert der
Spieler-Zweig. Schutz-Specs des Spielers zählen wie am Server dreifach (`TANK_SPECS`).

**Rollen.** `tank` sammelt zuerst Gegner ein, die jemand anderen angreifen, und spottet; `heal` heilt den Verbündeten
mit dem geringsten Lebensanteil unter der Schwelle (erzeugt verteilte Bedrohung); `damage` unterstützt das Ziel des Spielers.

**Ansagen – der Kern für Dungeons.** Begleiter reagieren nicht auf einzelne Bosse, sondern auf die Merkmale der
Zauberdaten: `ground` → nach `reaction` Sekunden die Fläche verlassen; `interruptible` → wer eine `interrupt`-Fähigkeit
frei hat, unterbricht (ein Zauber wird nur von einem Begleiter beansprucht). Neue Bosse funktionieren damit automatisch,
**solange ihre Zauber diese Merkmale sauber tragen.** Weitere Merkmale (sammeln, verteilen, Tankwechsel) sind die
Erweiterungsstelle für Dungeons: Merkmal in `CAST_SETS`, Reaktion in `tickOne()`.

**Balance-Absicht.** Stufe = Stufe des Spielers, Stärke `gearShare` 85 %. Mit Söldnern machbar, aber langsamer als mit
guten Menschen. Kein EP-Abzug, Begleiter würfeln nie um Beute. Höchstens vier, zusammen mit echten Gruppenmitgliedern
nie mehr als fünf Köpfe (`g.partyHumans`).

## Schnittstelle für die UI

```
game.companionOffers()            → [{def,cost,hired,affordable,free}]      Schwarzes Brett
game.hireCompanion(id)            → {ok,message?,companion?,cost?}          zieht Münzen ab, Toast + Zuruf
game.dismissCompanion(id)         → {ok}
game.orderCompanions(order,id?)   order: 'follow'|'stay'|'attack'           'attack' = aktuelles Ziel, auch wenn es noch ruht
game.setCompanionStance(s,id?)    s: 'assist'|'defend'|'passive'
game.companions[]                 {id,name,def,level,hp,maxHp,state:'follow'|'stay'|'combat'|'down',order,stance,contract(s),target,guard,cooldowns,view}
game.partyHumans                  Zahl echter Gruppenmitglieder außer mir – MUSS die Netzschicht setzen (net-party.js), sonst 0
Ereignis game.emit('companion',{type:'hired'|'dismissed'|'expired'|'down'|'revived'|'order'|'stance'|'error',id,…})
window.mertloch.companions        offers/hire/dismiss/order/stance/list – für scripts/*-check.mjs
```

`c.view` hat die Form der `others`-Einträge (`name,x,y,facing,classId,look,level,state,hp(0–100),party:true`) plus
`companion` (ID), `role`, `down`. Texte: `COMPANION_TEXT`, Rollen-Namen: `COMPANION_ROLES[role].name`.

## Pets später – was dafür schon da ist

Ein Eintrag in `COMPANIONS` mit `kind:'pet'` hat keinen Vertrag und keine Kosten (`contract:null`). Offen ist nur der
Auslöser: statt `hireCompanion` ruft die Klassenmechanik beim Betreten der Welt/Spec-Wechsel den Begleiter herbei
(`hireCompanion(g,id,{free:true})` genügt technisch). Pet-Fähigkeiten sind neue Einträge in `COMPANION_ABILITIES`;
braucht ein Pet etwas Neues, ist es ein neues `kind` in `use()`.

## Bekannte Grenzen (bewusst, mit Auftrag im Backlog)

1. **Mitspieler sehen fremde Begleiter nicht.** Für gemischte Gruppen braucht es eine Weitergabe: Client des Besitzers
   meldet `c.view` (neue Nachricht, z. B. `{t:'comp',list}` im `pos`-Takt), Server reicht sie im `snap` mit. Bis dahin
   sieht der Mitspieler nur den Schaden am gemeinsamen Gegner.
2. **Geteilte Gegner mit fremdem Ziel** (`e.remoteTarget`, Ziel ist ein anderer Spieler) greifen Begleiter nicht an –
   dort entscheidet weiter der Server über die Bedrohung der Spieler; Begleiter-Schaden zählt als Schaden des Besitzers.
3. **Bodenzauber aus dem Spieler-Zweig** treffen Begleiter nicht (sie weichen ohnehin aus); Bodenzauber aus dem
   Begleiter-Zweig treffen auch den Spieler, wenn er in der Fläche steht.
4. **Kampfstatistik** zählt Begleiter-Schaden nicht mit (eigene Zeilen wären UI-/Meter-Arbeit).
5. **Am Boden** wird der Begleiter noch stehend gezeichnet (`view.down`/`state:'dead'` liegt an).
6. **Tutorial, Kiosk-Innenraum:** Begleiter pausieren.

## Prüfen

`node --test tests/companions.test.mjs` · im Browser: `/söldner`, `/söldner peter`, Lager angreifen, `/befehl angriff`.
Sichtprüfung 2026-09-21 (Entwicklungsserver, Stufe 1 gegen drei Keiler): Namensschilder, Lebensbalken, Schadenszahlen,
Zuruf beim Fallen – in Ordnung; drei Keiler auf Stufe 1 sind für drei Söldner knapp (Balancing prüfen).
