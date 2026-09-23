# Aktionsleisten · 2026-09-23

Nutzerauftrag: Aktionsplätze aus dem Kniffe-Menü weg, Ziehen ohne mitgeschlepptes UI-Element, zwei Leisten ab Start (mehr per Einstellung), Taste am Platz schnell belegen – auch Mausrad-Klick und Seitentasten.

## Was

| Thema | Umsetzung | Dateien |
|---|---|---|
| Kniffe-Menü | Abschnitt „Aktionsplätze" entfernt. Belegen per Ziehen auf die echte Leiste; der Tooltip einer Kniff-Kachel nennt das. Der alte Weg „leeren Platz anklicken → Kniff wählen" bleibt. | `combat-ui.js` (`iconBook`), `popup-controls.js` |
| Ziehen & Ablegen | Eigenes Zeiger-Ziehen statt HTML5-DnD für Kniffe, Rucksack, Ausrüstung und Leistenplätze. Mit wandert nur ein 40-px-Symbol rechts unter dem Zeiger. Während des Ziehens: alle Leisten gestrichelt gold umrandet, leere Plätze sichtbar (gestrichelt, „+"), der Platz unter dem Zeiger gold gefüllt mit Außenrahmen, die Quelle blass. Neben der Leiste losgelassen verlässt ein Leisteneintrag die Leiste (Rahmen und Symbol werden korallrot); Gegenstände bleiben im Rucksack. Esc bricht ab. Touch bleibt beim bisherigen Antippen/Halten. | `popup-controls.js`, `bierdeckel.css` |
| Mehrere Leisten | Zwei Leisten ab Start, bis zu vier über **Hilfe → Einstellungen → Aktionsleisten (− / +)**. Leiste 1 = `#actionBar` (Plätze 0–9), weitere `#actionBar2…4` darüber (Plätze 10–19 …). Im UI-Editor wandern alle Leisten gemeinsam mit dem Element „Aktionsleisten". | `app.js` (`buildActions`, `barElements`), `action-bar-ui.js` (`barSettings`) |
| Tastenbelegung | Leiste 1 = 1…0, Leiste 2 = Umschalt+1…0, Leiste 3/4 ohne Taste. Maus auf einen Platz + **B**, oder Rechtsklick → „Taste belegen"; dann Taste (mit Strg/Alt/Umschalt) oder Maustaste drücken. Mausrad-Klick = „M3", Seitentasten = „M4"/„M5", weitere Maustasten „M6…"; Links-/Rechtsklick nie. Esc bricht ab, Entf/Rücktaste löscht. Gleiche Taste an anderem Platz wird dort gelöst (Einblendung nennt den Platz). Fest vergebene Tasten (WASD/Pfeile, Leertaste, Q, F, Tab, Enter, Menütasten B C H I J K M N P R U V X, Umschalt+B/P/F, Browsertasten) werden abgelehnt, der Belegungsmodus nennt den Grund. Seitentasten lösen kein Browser-Zurück aus (preventDefault auf mousedown/mouseup/pointerup/auxclick). | `bar-keys.js` (rein, getestet), `action-bar-ui.js`, `app.js` (Kontextmenü, Tastendruck) |
| Texte | `ACTION_BAR_TEXT` in `content/hud.js`; Tastentabelle der Hilfe in `content/panel-ui.js` um Leiste 2, Ziehen/Abnehmen und „Maus auf Feld + B" ergänzt. | `content/hud.js`, `content/panel-ui.js` |

## Spielstand

- `rpg.actionBars[klasse]` ist jetzt eine Liste mit `10 × rpg.barCount` Plätzen (Plätze ≥ 10 = weitere Leisten). Alte Stände (10 Plätze, kein `barCount`) werden auf zwei Leisten aufgefüllt; Leiste 1 bleibt unverändert.
- `rpg.barCount` (1–4, Standard 2) und `rpg.barKeys` (`{Platzindex: Belegung}`, nur Abweichungen vom Standard, `''` = bewusst ohne Taste) sind neu. Belegungsformat: `Ctrl+Alt+Shift+<KeyboardEvent.code>` bzw. `Mouse<button>`.
- Verhalten geändert: Ist Leiste 1 voll, rückt beim Lernen eines Kniffs ihr letzter Gegenstand auf eine freie Stelle der weiteren Leisten, statt zu verschwinden (`unlockOnBar`); neue Verpflegung nimmt Leiste 1 von hinten, sonst die nächste Leiste (`placeUsables`). Test `engine-welle-d` entsprechend angepasst.
- Eine Leiste entfernen räumt ihre Plätze (Kniffe bleiben im Clanbuch, Gegenstände im Rucksack).
- Klassen-Buffs (class-buffs.js, je Klasse zwei, Stufe 4 und 8): neu gelernt landen sie auf dem ersten freien Platz ab Leiste 2; sie verdrängen nie etwas. Ohne freien Platz ab Leiste 2 bleiben sie im Kniffe-Menü (`unlockOnBar`; der Filter in `engine.js` gainXp ist dafür entfallen).
- Während des Ziehens liegen die Leisten über offenen Fenstern (`body.bar-drop … .action-area{z-index:1000}`), weil das Kniffe-Buch mit „Eigenarten & Leisten" hoch genug ist, um Leiste 2 zu verdecken.

## Prüfen

- `npm test` – neu `tests/action-bars.test.mjs` (Migration, zweite Leiste, Tausch über Leisten, Anzahl, Tastenkonflikt, gesperrte Tasten, Maustasten, Bereinigung).
- `node scripts/aktionsleisten-check.mjs` – Browser 2024×900, Screenshots `visual-review/aktionsleisten/` (01 zwei Leisten, 02 Kniff ziehen, 02a Kniff-Tooltip, 03 Gegenstand ziehen, 04 Umsortieren, 05 Entfernen, 06 Taste belegen, 07 Konflikt, 08 gesperrte Taste, 09 Maustasten, 10 Rechtsklick, 11 Einstellungen, 12/13 dritte Leiste).
- `scripts/welle-d-check.mjs`, `rpg-layout-check.mjs`, `rpg-playtest.mjs` auf das neue Ziehen bzw. den Belegungsweg ohne Buch-Plätze umgestellt.

## Offen

1. `npm run mobile:check` bricht im Desktop-Teil schon auf dem Ausgangsstand (e9ada8d) ab (Startbildschirm, „Tooltip muss sichtbar sein"); die Touch-Teile zeigen auf Ausgangsstand und Branch identische Befunde. `scripts/welle-d-check.mjs` scheitert ebenfalls schon auf dem Ausgangsstand („Kniffe zeigt zu wenige Kacheln"). Beides gehört in eine eigene Prüfskript-Runde.
2. Touch-Modus: die Leisten sind dort ausgeblendet; mehrere Touch-Seiten gibt es weiter über `mobile-controls.js`. Leiste 2+ ist auf Touch nicht erreichbar – bewusst, bis Mobile eine Seitenlogik für Leiste 2 festlegt.
3. Einzelne Leiste frei verschieben (statt alle Leisten gemeinsam als „Aktionsleisten") kann der UI-Editor noch nicht; dafür bräuchte `HUD_ELEMENTS` je Leiste einen Eintrag mit festem Container.
4. Doppelbelegung eines Kniffs auf zwei Plätzen ist (wie bisher) nicht möglich – Ziehen auf einen zweiten Platz verschiebt bzw. tauscht.
5. Mausrad-Klick-Autoscroll und Seitentasten-Zurück sind nur in Chromium geprüft (headless); Firefox/Safari nicht.
