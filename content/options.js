// Einstellungsfenster nach WoW-Vorbild (2026-09-24): Kategorien links, Zeilen „Beschriftung … Regler“ rechts, unten Standard/Schließen.
// Nur Texte und Werte; die Logik steht in options-ui.js. Schalter-Schlüssel (`setting`) = game.settings, `pref` = kontoweite Einstellung (options-ui.js).
export const OPTIONS_UI={
 title:'Einstellungen',
 categories:[
  {id:'game',name:'Spiel',icon:'reward'},
  {id:'interface',name:'Interface',icon:'bag'},
  {id:'graphics',name:'Grafik',icon:'map'},
  {id:'audio',name:'Ton',icon:'sound'},
  {id:'keys',name:'Tastenbelegung',icon:'book'},
  {id:'system',name:'System',icon:'fullscreen'}
 ],
 sections:{
  game:[
   {title:'Kampf',rows:[
    {setting:'autoLoot',label:'Auto-Loot',hint:'Beute wandert nach dem Kampf von selbst in den Rucksack.'},
    {setting:'sct',label:'Kampftext',hint:'Schadens- und Heilzahlen über Held und Ziel.'}]}
  ],
  interface:[
   {title:'Darstellung',rows:[
    {pref:'uiScale',label:'UI-Skalierung',kind:'range',min:80,max:130,step:5,unit:' %',hint:'Größe von Leisten, Rahmen und Fenstern.'},
    {setting:'fps',label:'FPS-Anzeige',hint:'Bilder pro Sekunde oben links.'}]},
   {title:'Namen',rows:[
    {setting:'namesFriendly',label:'Freundliche Figuren',hint:'Namen von Dorfbewohnern, Händlern und Auftraggebern.'},
    {setting:'namesEnemy',label:'Gegner',hint:'Namen über Gegnern in der Nähe; das Ziel zeigt seinen Namen immer.'},
    {setting:'namesPlayers',label:'Andere Spieler',hint:'Namen und Stufe anderer Helden (online).'}]},
   {title:'Leisten & Anzeigen',rows:[{slot:'bars'},{slot:'meter'},{slot:'hud'}]}
  ],
  graphics:[
   {title:'Qualität',rows:[{slot:'preset'}]},
   {title:'Details',rows:[
    {setting:'light',label:'Licht & Schatten',hint:'Tageslicht, Innenlicht, Lampen und Schattenwurf.'},
    {setting:'fx',label:'Wetter & Effekte',hint:'Regen, Staub, Funken und Zauberglanz.'},
    {setting:'autoRes',label:'Auflösung automatisch anpassen',hint:'Senkt die Auflösung der Welt von selbst, wenn der Rechner die 60 Bilder nicht hält.'},
    {setting:'fullRes',label:'Volle Grafikauflösung',hint:'Vierfache Dichte – schärfer auf hochauflösenden Bildschirmen, kostet deutlich Leistung.'}]},
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
 presets:[{id:'low',name:'Niedrig',values:{light:false,fx:false,autoRes:true,fullRes:false}},{id:'mid',name:'Mittel',values:{light:true,fx:false,autoRes:true,fullRes:false}},{id:'high',name:'Hoch',values:{light:true,fx:true,autoRes:true,fullRes:false}},{id:'ultra',name:'Ultra',values:{light:true,fx:true,autoRes:false,fullRes:true}}],
 presetLabel:'Grafikqualität',presetCustom:'Eigene',presetHint:'Setzt die Details darunter auf einmal.',
 fullscreen:'Vollbild',fullscreenHint:'Spiel ohne Browserleisten (Esc beendet).',
 install:'Als App installieren',installHint:'Startet ohne Browserfenster, auch offline.',
 touch:'Steuerung & Touchbuttons',touchHint:'Knöpfe für Handy und Tablet anordnen.',
 appstate:'App-Status & Update',appstateHint:'Version, Speicher und Aktualisierung.',
 admin:'Admin',adminHint:'Neustart, Sicherung, Trainingsarena.',
 meter:'Kampfstatistik',meterHint:'Schaden, Heilung und Zeit je Kampf (Taste V).',hud:'UI bearbeiten',hudHint:'Rahmen und Leisten verschieben und skalieren.',
 open:'Öffnen',on:'an',off:'aus',
 defaults:'Standard',defaultsDone:name=>'„'+name+'“ steht wieder auf Standard.',close:'Schließen',
 volumeOff:'Klänge ausgeschaltet.'
};
/** Standardwerte der kontoweiten Einstellungen (options-ui.js). */
export const OPTIONS_DEFAULTS={uiScale:100,volume:0};
/** Standard der Spielschalter (game.settings) für „Standard“ je Kategorie. */
export const SETTING_DEFAULTS={namesFriendly:true,namesEnemy:true,namesPlayers:true,autoLoot:true,sct:true,light:true,fx:true,autoRes:true,fullRes:false,fps:false};
