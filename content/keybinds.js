// Freie Tastenbelegung (2026-09-24, WoW-Vorbild „Tastaturbelegung“): alle Spielaktionen mit Standardtasten.
// Belegungen im Format von bar-keys.js: Modifikatoren (Ctrl, Alt, Shift) + physischer Tastencode (KeyboardEvent.code) oder Mouse<n>.
// Je Aktion zwei Plätze (Taste 1, Taste 2). `fixed` = nicht änderbar (Esc bleibt immer Menü/Abbrechen).
// Die Aktionsleisten-Plätze stehen nicht hier – sie gehören zum Helden (rpg.barKeys, bar-keys.js) und erscheinen im selben Menü.
export const KEYBIND_GROUPS=[
 {id:'move',name:'Bewegung'},
 {id:'combat',name:'Kampf & Ziele'},
 {id:'windows',name:'Fenster'},
 {id:'interface',name:'Interface'}
];
export const KEYBIND_ACTIONS=[
 {id:'moveUp',group:'move',name:'Nach oben laufen',keys:['KeyW','ArrowUp'],move:'w'},
 {id:'moveDown',group:'move',name:'Nach unten laufen',keys:['KeyS','ArrowDown'],move:'s'},
 {id:'moveLeft',group:'move',name:'Nach links laufen',keys:['KeyA','ArrowLeft'],move:'a'},
 {id:'moveRight',group:'move',name:'Nach rechts laufen',keys:['KeyD','ArrowRight'],move:'d'},
 {id:'dash',group:'move',name:'Ausweichen',keys:['Space','']},
 {id:'mount',group:'move',name:'Aufsitzen / Absitzen',keys:['KeyX','']},
 {id:'targetNext',group:'combat',name:'Nächstes Ziel',keys:['Tab','']},
 {id:'targetPrev',group:'combat',name:'Vorheriges Ziel',keys:['Shift+Tab','']},
 {id:'interact',group:'combat',name:'Sprechen / Benutzen',keys:['KeyF','']},
 {id:'loot',group:'combat',name:'Beute aufheben',keys:['Shift+KeyF','']},
 {id:'interrupt',group:'combat',name:'Unterbrechen',keys:['KeyQ','']},
 {id:'aggro',group:'combat',name:'Aggro-Radius zeigen',keys:['KeyR','']},
 // Zielmarkierungen (target-marks.js): ohne Standardtaste, frei belegbar; dieselbe Taste noch einmal nimmt die Markierung weg.
 {id:'assist',group:'combat',name:'Ziel übernehmen (Gruppe)',keys:['','']},
 {id:'markSkull',group:'combat',name:'Ziel: Totenkopf',keys:['','']},
 {id:'markCross',group:'combat',name:'Ziel: Kreuz',keys:['','']},
 {id:'markStar',group:'combat',name:'Ziel: Stern',keys:['','']},
 {id:'markCircle',group:'combat',name:'Ziel: Kreis',keys:['','']},
 {id:'person',group:'windows',name:'Figur',keys:['KeyC','']},
 {id:'bag',group:'windows',name:'Rucksack',keys:['KeyI','']},
 {id:'book',group:'windows',name:'Kniffe',keys:['KeyP','KeyK']},
 {id:'talents',group:'windows',name:'Talente',keys:['KeyN','']},
 {id:'quest',group:'windows',name:'Aufträge',keys:['KeyL','KeyJ']},
 {id:'map',group:'windows',name:'Karte',keys:['KeyM','']},
 {id:'base',group:'windows',name:'Bude',keys:['KeyB','']},
 {id:'professions',group:'windows',name:'Berufe',keys:['Shift+KeyB','']},
 {id:'mounts',group:'windows',name:'Fahrzeuge & Reittiere',keys:['Shift+KeyP','']},
 {id:'companions',group:'windows',name:'Söldner',keys:['KeyU','']},
 {id:'guide',group:'windows',name:'Hilfe',keys:['KeyH','']},
 {id:'meter',group:'interface',name:'Kampfstatistik',keys:['KeyV','']},
 {id:'options',group:'interface',name:'Einstellungen',keys:['KeyO','']},
 {id:'menu',group:'interface',name:'Spielmenü / Abbrechen',keys:['Escape',''],fixed:true}
];
export const KEYBIND_UI={
 title:'Tastenbelegung',
 intro:'Klicke auf eine Taste und drücke die neue. Esc bricht ab, Entf löscht. Belegungen gelten für alle Helden; die Aktionsleisten merkt sich jeder Held selbst.',
 key1:'Taste 1',key2:'Taste 2',action:'Aktion',
 bars:'Aktionsleisten',barSlot:(bar,slot)=>'Leiste '+bar+' · Platz '+slot,
 footHint:'Klick: neu belegen · Rechtsklick: löschen · Esc bricht ab',
 capture:'Neue Taste drücken …',captureHelp:'Esc bricht ab · Entf löscht',
 none:'—',fixed:'fest',
 bound:(key,name)=>key+' löst jetzt „'+name+'“ aus.',
 released:(key,name)=>key+' lag vorher auf „'+name+'“ – dort gelöst.',
 cleared:name=>'„'+name+'“ hat jetzt keine Taste.',
 blocked:key=>key+' ist im Browser fest vergeben. Nimm eine andere Taste.',
 fixedNote:'Esc bleibt immer Spielmenü und Abbrechen.',
 reset:'Standard wiederherstellen',resetDone:'Alle Tasten stehen wieder auf Standard.',
 search:'Aktion suchen …'
};
