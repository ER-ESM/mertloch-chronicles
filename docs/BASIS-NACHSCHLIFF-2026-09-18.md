# Basis-Nachschliff · 18. September 2026

Auftrag: Punkte **1, 2, 5 und 6** ersetzen vorerst den begonnenen Grafikauftrag. Keine neuen Inhalte. Die körpergerechte Ausrüstung/3D-Pipeline (3) und physische Mobilgeräte-Abnahme (4) bleiben ausdrücklich offen. Die zwischenzeitlichen Commits `30ec4bc` (Tooltip-Übergang, Aggro und Leine) und `3524186` (detaillierte Helden / neue Sprite-Pipeline) sind integriert. Die neue aktive Grafik bleibt erhalten; der eigene zurückgestellte Passform-Auftrag wird dadurch nicht als abgenommen erklärt.

Abnahme des integrierten Stands auf Basis 3524186: `npm test` **409/409**, `npm run content:check` **46/46**, Produktionsbuild erfolgreich; PWA-Browserprüfung mit acht erfolgreichen Prüfgruppen; kompletter UI-Browserlauf mit 13 erfolgreichen Prüfgruppen. Die zusätzliche Layout-Prüfung bestätigt freie Bewegungs-/Aktionsknöpfe in allen fünf Größen/Handbelegungen. Screenshots der fünf UI-Größen wurden zusätzlich visuell kontrolliert.

Nachtrag: 511dbc5 (animierte Knie und Handschuhe) wurde vor dem Push ebenfalls übernommen; die gezielte Prüfung von Grafik, Demos, Vorschau-Laden und Update-Code besteht mit 33/33 Tests. Die Messwerte unten dokumentieren den vorangehenden Vergleich mit 3524186.

## 1 · Start und Performance

Die ausgeschaltete 3D-Vorschau verursacht beim Start keine Bild- oder Katalog-Anfrage mehr. Einschalten lädt nur zwei Körperbögen der gewählten Figur und die Posen-/Laufbögen ihrer angelegten Gegenstände. Klassen- und Ausrüstungswechsel verwerfen nicht mehr benötigte Bildreferenzen; Abschalten gibt alle Vorschau-Bildreferenzen frei. Überholte asynchrone Ergebnisse können die Auswahl nicht zurücksetzen. Fehlende Dateien lassen die bisherige Darstellung aktiv.

Der Service Worker lädt diese Dateien ebenfalls nicht vor. Erst tatsächlich verwendete Vorschau-Dateien landen im Release-Cache, mit SHA-256-Prüfung gegen die aktive Version. So werden bei einem späteren Deploy keine neuen Vorschau-Dateien mit einem alten Katalog vermischt. Speicherplatzmangel verhindert nur das optionale Caching, nicht die Online-Anzeige. Der Browser-Test benötigt für Dieters Startausrüstung **11 optionale Dateien** einschließlich Katalog statt 217 und lädt diese danach erfolgreich offline.

Messung: Windows, lokales Chrome im Headless-Modus, 1280×800, frisches Profil, HTTP-Cache und Service Worker aus. Je Szene fünf Sekunden: Dorf, Kampf gegen drei Arena-Keiler, offenes Charakterfenster während desselben Kampfes. Die beiden Startmodule werden für „vorher“ aus `3524186` geliefert; der übrige Stand ist in beiden Läufen gleich und enthält dessen neue aktive Grafik. Das isoliert die Änderung des Ladevorgangs. „Bereit“ wird beim Erscheinen der Spiel-API gemessen, Genauigkeit ungefähr 10 ms.

| Kaltstart | Vorher | Nachher |
|---|---:|---:|
| Spiel bereit | 5.669 ms | 5.301 ms |
| Ressourcen-Anfragen | 768 | 551 |
| davon Vorschau | 217 | 0 |
| übertragene Bytes | 54.809.142 | 52.374.359 |

| Szene | FPS vorher → nachher | Frame-Abstand p95 vorher → nachher | JS-Heap MiB vorher → nachher |
|---|---:|---:|---:|
| Dorf | 118,0 → 120,0 | 8,7 → 8,7 ms | 17,23 → 21,39 |
| Kampf | 103,6 → 114,6 | 16,7 → 8,9 ms | 27,60 → 27,53 |
| Charakterfenster | 119,4 → 119,2 | 8,7 → 8,7 ms | 18,29 → 17,19 |

In beiden Läufen keine Frame-Abstände über 50 ms. Der verlässliche Gewinn ist die eingesparte Arbeit beim Laden: 217 Anfragen / 2.434.783 Bytes. Ein einzelner lokaler Lauf belegt keinen allgemeinen FPS-Gewinn; der JS-Heap schwankt mit der Speicherbereinigung und enthält weder dekodierte Bilder noch GPU-Speicher. Keine Messung eines echten Handys oder eines langsamen Mobilfunknetzes.

Rohwerte: [vorher](performance/2026-09-18-before.json), [nachher](performance/2026-09-18-after.json). Reproduktion: `npm run performance:check -- before`, danach `npm run performance:check -- after`. Beide Aufrufe starten einen eigenen Server und Browser; alternativ eine lokale URL übergeben. `PERF_BASE_REF` setzt den Vergleichscommit.

## 2 · Updates und Offline

Die Update-Tests prüfen erfolgreiche Speicherung, fehlgeschlagene und werfende Speicherung, Bestätigung/Abbruch, erneuten Versuch, geschützte neuere/unlesbare Saves und den Ersatz-Neustart nach 2,5 Sekunden. Ein Controller-Wechsel und ein verspäteter Timer können zusammen nur einmal neu laden. Verschwindet der wartende Worker vor dem Aktivieren, bleibt ein erneuter Versuch möglich.

Der Browser-Test verwendet echte Service-Worker-Releases unter einem Pages-Unterpfad und echte native Bestätigungsdialoge. Abbruch erhält die laufende Sitzung; ein erfolgreicher Retry erhält den neuen Stand. Bewusste Zustimmung trotz Speicherfehler lädt den zuletzt gespeicherten Stand. Neuere und unlesbare Saves bleiben bytegenau erhalten, eine defekte Speicherung mit lesbarer Sicherung wird wiederhergestellt. Touch-Belegung, Offline-Kaltstart, optionaler Grafikcache und Bereinigung alter Release-Caches werden mitgeprüft.

Dateien: `tests/pwa-updates.test.mjs`, `tests/pwa-optional-cache.test.mjs`, `tests/prerender-loading.test.mjs`, `scripts/basis-pwa-check.mjs`. Aufruf: `npm run pwa:check`.

## 5 · UI und aktuelle Prüfungen

- Hofprobe-Hilfe und Einklappen verwenden `outline-button`; beide Ziele sind 44×44 px groß und liegen eingeklappt 8 px auseinander.
- Tutorial-Geometrie liegt gemeinsam in `tutorial-ui.css`. Safe Areas und Spieler-/Zielfenster bestimmen die Position. Im Querformat liegt der Kasten zwischen den seitlichen Bedienelementen, damit er bei beiden Handbelegungen weder Ziel-/Aktionsknöpfe noch Joystick überdeckt.
- Die Clan-Karten im Charakterfenster beschränken ihre Porträts auf die Kartenbreite. Der neu gefundene horizontale Überlauf bei schmalem Desktop-Buch ist behoben.
- Der aktuelle Autoangriff-Starthinweis stammt aus `PANEL_UI.starterHint`.
- Acht veraltete Prüfeinstiege verwenden gemeinsame Suiten für das aktuelle Clanbuch mit vier Reitern plus Hilfe. Keine Prüfung hängt mehr an einem persönlichen Browserprofil oder verlangt mehrere unabhängige Hauptfenster.

| Bestehender Einstieg | Aktuelle Suite |
|---|---|
| `popup-ui-check.mjs` | Navigation + Inventar |
| `rpg-ui-check.mjs` | Inventar |
| `combat-icons-check.mjs` | Kampf |
| `ui-polish-check.mjs` | Layout |
| `popup-edge-check.mjs` | Inventar + Navigation |
| `progression-ui-check.mjs` | Klassen/Talente + Inventar |
| `class-ui-check.mjs` | Klassen/Talente |
| `visual-hud-check.mjs` | Layout + Kampf |

Gesamtlauf: `npm run ui:check`. Physische CDP-Maus-/Touch-Eingaben prüfen Navigation, laufende Welt, Detail-Rückkehr, An-/Ablegen, Verpflegung, Suchfeld-Tastentrennung, volles Inventar/Teilbeute, alle drei Klassen und neun Talentbäume mit 90 Talenten, Talent-Freischaltungen, echtes Ziehen eines Kniffs in die Leiste und Speicherung. Kampf prüft getrennte Zielwahl, Autoangriff, erneutes Ausschalten und Esc. Layout: 1440×1000, 390×844, 320×740 sowie 844×390 mit beiden Handbelegungen und Safe Areas; pro Größe alle fünf Clanbuch-Reiter, Tutorial-Tipps und Abstand zum Zielrahmen.

Historische Mehrfenster-/Minimieren-Erwartungen wurden entfernt, weil sie E-13/E-27 widersprechen. Weitergehende Kampf-, Beute-, Quest- und Touch-Regeln bleiben in den vorhandenen Modulprüfungen sowie `basis-check.mjs`, `character-sheet-check.mjs` und `mobile-check.mjs`. Die neuen Suiten behaupten keinen erneuten vollständigen Akt-1-Playtest.

CI führt jetzt neben den Modultests und dem Build auch Clanbuch-/Layout-Prüfungen und den PWA-Browser-Test vor dem Pages-Deploy aus. Performance bleibt eine getrennte Messung ohne maschinenabhängige FPS-Abbruchgrenze. Browser-Artefakte liegen lokal in `visual-review/ui-regression/` und `combat-review/basis-pwa/`.

## 6 · Nachgeführter Plan

`ROADMAP.md` trägt die aktuelle Priorisierung; alte Runden stehen nicht mehr fälschlich als laufend dort. UI-, Engine- und Lead-Backlog markieren belegte Erledigungen einschließlich Mentorenplätzen, Elite-Titeln, Pit, Kulissen, Proc-Zählern, Verpflegung und Autoangriff. Gemischte Einträge bleiben teilweise offen, zum Beispiel Editor-Drag und Talent-Tooltip-Stabilität. Historischer Bedarf bleibt lesbar. Händler/Handwerk, Gesamt-Playtest und Punkte 3/4 sind ausdrücklich zurückgestellt.
