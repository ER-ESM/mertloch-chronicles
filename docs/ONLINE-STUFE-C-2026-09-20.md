# Online Stufe C · geteilte Welt, Gruppen, Chatfenster (2026-09-20)

Baut auf Stufe B auf (`docs/ONLINE-STUFE-B-2026-09-19.md`). Entscheidung: E-35.

## Wer macht was

| Teil | Datei | Aufgabe |
|---|---|---|
| Serverregeln | `server/game/shared-world.mjs` | Lebenspunkte, Bedrohung, Ziel, Tod mit Belohnungsliste, Wiederkehr, Gruppen, Spielerliste – ohne Netz testbar |
| Leitung | `server/game/server.mjs` | WebSocket, Mengenbremse je Nachrichtenart, Gruppen-/Flüsterchat |
| Client-Abgleich | `net-world.js` | meldet eigenen Schaden, Ablassen, Tod; wendet Servermeldungen auf die Engine an |
| Engine-Haken | `engine.js` | `netId`, `netEnemy`, `applyRemoteHp`, `setRemoteTarget` (+ `followRemote`), `remoteKill`, `remoteReset` |
| Oberfläche | `online.js`, `chat-window.js` | Gruppenrahmen, Einladung, Spielerliste, Kanäle und Befehle im Chatfenster |

## Nachrichten (zusätzlich zu Stufe B)

Client → Server: `hit {e,d,max,th,r}` · `evade {e?}` · `dead` · `party {op:invite|accept|decline|leave|kick,name?}` · `who` · `chat {ch:party|whisper,to?}`; `pos` trägt `h` (Leben in %).
Server → Client: `mob {e,hp,max,tg,by?}` · `mobs {list}` (beim Betreten) · `kill {e,by,credit[],r}` · `reset {e}` · `up {e}` · `party {leader,members[]}` (1×/s) · `invite {from}` · `who {list}`; `snap` trägt `h` und `p` (Gruppenmitglied).

## Regeln in Kürze

- Ziel = höchste Bedrohung; ein Wechsel braucht 10 % mehr als das aktuelle Ziel. Bedrohung = Schaden, Schutz-Specs ×3, Körperpull = 1.
- Kein Treffer seit 30 s, Ziel tot, Ziel weg oder getrennt → Gegner setzt zurück. Wiederkehr = Untergrenze des Gegners × 1,0–1,4, vom Server ausgewürfelt und an alle gemeldet.
- Lokale Lebenspunkte sind nie höher als der Serverwert plus eigene, noch nicht bestätigte Treffer; fremder Schaden erscheint blau.
- Chat-Befehle: `/s` `/w` `/g` `/f Name Text` `/r` `/einladen` `/entfernen` `/verlassen` `/wer` `/hilfe`.

## Prüfen

`npm test` (u. a. `tests/shared-world.test.mjs`, `tests/game-server.test.mjs`, `tests/chat-window.test.mjs`). Von Hand: zwei Browser (einer privat), beide anmelden, im Chatfenster „Spieler" → Einladen, gemeinsam einen Lagergegner angreifen.
Lokal: `PORT=4195 STATIC_DIR=. node server/game/server.mjs`, dann `http://127.0.0.1:4195/?online=1` (Service Worker vorher abmelden).

## Nachtrag 21.09.2026 · Gruppenspiel (E-42)

Dateien: `server/game/party-play.mjs` (Würfeln, Weiterreichen), `net-party.js` (Client + Würfelfenster), Engine-Haken `game.netParty {near,loot,buff,gather}`, `sharedGather`, `applyPartyBuff`, `rpg.js grantLoot`.
Client → Server: `offer {item}` · `choice {id,c:need|greed|pass}` · `qshare {item}` · `buff {b}`. Server → Client: `roll {id,item,from,secs}` · `rollpick {id,n,c}` · `rolled {id,item,winner,rolls[]}` · `qshare {from,item}` · `buff {from,b}`. API_VERSION 5.
Prüfen: `tests/party-play.test.mjs`.

## Nachtrag 21.09.2026 · Miteinander (E-44)

Dateien: `server/game/social-play.mjs`, `net-social.js` (Client + Handelsfenster), Engine `receiveAid`, `reviveHere`, `spawnWorldBoss`, `removeWorldBoss`, `rpg.js tradeGood/tradeAway/grantLoot(count)`.
Client → Server: `aid {to,heal?,b?,name}` · `revive {to}` · `trade {op:ask|accept|decline|offer|confirm|cancel,…}` · `wbseen {e,name,where}`. Server → Client: `aid` · `revived {from}` · `tradeask {from}` · `trade {with,mine,theirs}` · `tradeend` · `tradedone {with,give,get}` · `wboss {e,boss,spot,hpx,left}` · `wbossgone {e}`. API_VERSION 6.
Weltboss lokal früher auslösen: `BOSS_FIRST_MS=30000`. Prüfen: `tests/social-play.test.mjs`. Frische Helden im Tutorial können keinen Schaden machen – im Browsertest `game.tutorial.completed=true` setzen.
