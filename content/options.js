// Einstellungsfenster nach WoW-Vorbild (2026-09-24): Kategorien links, Zeilen „Beschriftung … Regler“ rechts, unten Standard/Schließen.
// Nur Texte und Werte; die Logik steht in options-ui.js. Schalter-Schlüssel (`setting`) = game.settings, `pref` = kontoweite Einstellung (options-ui.js).
export const OPTIONS_UI={
 title:'Einstellungen',
 // Runde 4c: eigene Kategoriesymbole (glyph, Strich-Symbole aus ui-glyphs.js) statt wiederverwendeter Fenstersymbole (Rucksack, Karte …).
 categories:[
  {id:'game',name:'Spiel',icon:'reward',glyph:'gear'},
  {id:'interface',name:'Interface',icon:'bag',glyph:'frame'},
  {id:'graphics',name:'Grafik',icon:'map',glyph:'brush'},
  {id:'audio',name:'Ton',icon:'sound',glyph:'speaker'},
  {id:'keys',name:'Tastenbelegung',icon:'book',glyph:'keycap'},
  {id:'system',name:'System',icon:'fullscreen',glyph:'monitor'}
 ],
 sections:{
  game:[
   {title:'Kampf',rows:[
    {setting:'autoLoot',label:'Auto-Loot',hint:'Beute wandert nach dem Kampf von selbst in den Rucksack.'},
    {setting:'sct',label:'Kampftext',hint:'Schadens- und Heilzahlen über Held und Ziel.'},
    {setting:'sctIn',parent:'sct',label:'Eingehend',hint:'Schaden, Heilung und Ausweichen am eigenen Helden (links).'},
    {setting:'sctNotes',parent:'sct',label:'Meldungen',hint:'Procs, Schwung, Unterbrechen und Erfahrung über dem Helden.'},
    {setting:'sctCompanions',parent:'sct',label:'Söldner',hint:'Zahlen an deinen Söldnern.'},
    {setting:'groundAtCursor',label:'Bodenkniffe sofort an der Maus',hint:'Kniffe mit Bodenziel wirken ohne Zielkreis direkt an der Mausposition – wie Schnellzauber in WoW.'}]}
  ],
  interface:[
   {title:'Darstellung',rows:[
    {pref:'uiScale',label:'UI-Skalierung',kind:'range',min:80,max:130,step:5,unit:' %',hint:'Größe von Leisten, Rahmen und Fenstern.'},
    {pref:'statusText',kind:'choice',label:'Statustext',hint:'Lebenspunkte an Heldenrahmen und Ziel: als Zahl, in Prozent, beides oder ausgeblendet. Auf dem Handy immer Prozent.',choices:[{id:'number',name:'Zahl'},{id:'percent',name:'Prozent'},{id:'both',name:'Beides'},{id:'none',name:'Aus'}]},
    {setting:'fps',label:'FPS-Anzeige',hint:'Bilder pro Sekunde oben links.'}]},
   {title:'Namen',rows:[
    {setting:'namesFriendly',label:'Freundliche Figuren',hint:'Namen von Dorfbewohnern, Händlern und Auftraggebern.'},
    {setting:'namesEnemy',label:'Gegner',hint:'Namen über Gegnern in der Nähe; das Ziel zeigt seinen Namen immer.'},
    {setting:'namesPlayers',label:'Andere Spieler',hint:'Namen und Stufe anderer Helden (online).'}]},
   {title:'Bildschirm',rows:[
    {pref:'showTracker',kind:'switch',label:'Auftragsverfolgung',hint:'Aktuelle Aufträge rechts unter der Minikarte.'},
    {pref:'showMinimap',kind:'switch',label:'Minikarte',hint:'Runde Umgebungskarte oben rechts (Karte bleibt auf M).'},
    {pref:'showXp',kind:'switch',label:'EP-Leiste',hint:'Erfahrung am unteren Bildschirmrand.'}]},
   {title:'Leisten & Anzeigen',rows:[{slot:'bars'},{slot:'meter'},{slot:'hud'}]}
  ],
  graphics:[
   {title:'Qualität',rows:[{slot:'preset'}]},
   {title:'Details',rows:[
    {setting:'light',label:'Licht & Schatten',hint:'Tageslicht, Innenlicht, Lampen und Schattenwurf.'},
    {setting:'fx',label:'Wetter & Effekte',hint:'Regen, Staub, Funken und Zauberglanz.'},
    {setting:'lowRes',label:'Niedrige Auflösung',hint:'Welt im groben Pixelraster (2 Bildpunkte je Welteinheit) – etwa doppelt so schnell, vor allem auf Handys und hochauflösenden Bildschirmen.'},
    {setting:'autoRes',label:'Auflösung automatisch anpassen',hint:'Senkt die Auflösung der Welt von selbst, wenn der Rechner die 60 Bilder nicht hält.'},
    {setting:'fullRes',label:'Volle Grafikauflösung',hint:'Vierfache Dichte – schärfer auf hochauflösenden Bildschirmen, kostet deutlich Leistung.'}]},
   {title:'Kamera',rows:[{slot:'zoom'}]},
   {title:'Anzeige',rows:[{slot:'fullscreen'}]}
  ],
  audio:[
   {title:'Lautstärke',rows:[
    {pref:'volume',label:'Gesamtlautstärke',kind:'range',min:0,max:100,step:5,unit:' %',hint:'0 % schaltet alle Klänge aus.'}]}
  ],
  keys:[],
  system:[
   {title:'App',rows:[{slot:'install'},{slot:'touch'},{slot:'appstate'}]},
   {title:'Entwicklung',rows:[{slot:'admin'}]}
  ]
 },
 presets:[{id:'low',name:'Niedrig',values:{light:false,fx:false,lowRes:true,autoRes:true,fullRes:false}},{id:'mid',name:'Mittel',values:{light:true,fx:false,lowRes:false,autoRes:true,fullRes:false}},{id:'high',name:'Hoch',values:{light:true,fx:true,lowRes:false,autoRes:true,fullRes:false}},{id:'ultra',name:'Ultra',values:{light:true,fx:true,lowRes:false,autoRes:false,fullRes:true}}],
 presetLabel:'Grafikqualität',presetCustom:'Eigene',presetHint:'Setzt die Details darunter auf einmal.',
 zoom:'Kameraabstand',zoomHint:'Wie nah die Kamera am Helden ist (auch per Mausrad).',zoomNear:'nah',zoomFar:'weit',
 fullscreen:'Vollbild',fullscreenHint:'Spiel ohne Browserleisten (Esc beendet).',
 install:'Als App installieren',installHint:'Startet ohne Browserfenster, auch offline.',
 touch:'Steuerung & Touchbuttons',touchHint:'Knöpfe für Handy und Tablet anordnen.',
 appstate:'App-Status & Update',appstateHint:'Version, Speicher und Aktualisierung.',
 admin:'Admin',adminHint:'Neustart, Sicherung, Trainingsarena.',
 meter:'Kampfstatistik',meterHint:'Schaden, Heilung und Zeit je Kampf (Taste V).',hud:'UI bearbeiten',hudHint:'Rahmen und Leisten verschieben und skalieren.',
 open:'Öffnen',on:'an',off:'aus',
 defaults:'Standard',defaultsDone:name=>'„'+name+'“ steht wieder auf Standard.',close:'Schließen',
 /* Runde 5b (Handy): Erklärung hinter ⓘ, Seiten statt Scrollen, Kategorie im Fenstertitel */
 info:'Erklärung',page:'Seite',prevPage:'Vorherige Seite',nextPage:'Nächste Seite',titleWith:name=>'Einstellungen · '+name,
 volumeOff:'Klänge ausgeschaltet.'
};
/** Standardwerte der kontoweiten Einstellungen (options-ui.js). */
export const OPTIONS_DEFAULTS={uiScale:100,statusText:'number',volume:0,showTracker:true,showMinimap:true,showXp:true};
/** Standard der Spielschalter (game.settings) für „Standard“ je Kategorie. */
export const SETTING_DEFAULTS={namesFriendly:true,namesEnemy:true,namesPlayers:true,autoLoot:true,sct:true,light:true,fx:true,autoRes:true,fullRes:false,lowRes:false,fps:false,sctIn:true,sctNotes:true,sctCompanions:true,groundAtCursor:false};
