// openByDefault: Die Kampfstatistik ist ein Werkzeug für Kenner und bleibt zu, bis jemand sie mit V öffnet (E-39, ruhiger Bildschirm).
export const METER_RULES={history:10,minSeconds:1,refreshMs:250,openByDefault:false};
export const METER_TEXT={
 title:'Kampfstatistik',open:'Kampfstatistik öffnen',close:'Einklappen',damage:'Schaden',healing:'Heilung',
 shortcut:'Kampfstatistik [V]',options:'Optionen',resize:'Fenstergröße ändern (ziehen oder Pfeiltasten)',drag:'Zum Verschieben ziehen',ranking:'Rangliste',
 prevFight:'Vorheriger Kampf',nextFight:'Nächster Kampf',
 current:'Aktueller / letzter Kampf',overall:'Gesamte Sitzung',fight:'Kampf',training:'Training',active:'Im Kampf',finished:'Abgeschlossen',
 empty:'Noch kein Kampf erfasst.',noDamage:'Noch kein Schaden verursacht.',noHealing:'Noch keine Heilung im Kampf.',
 total:'Gesamt',dps:'DPS',hps:'HPS',seconds:'Kampfzeit',abilities:'Fähigkeiten',actors:'Figuren',back:'Zurück',
 hits:'Treffer',crit:'Kritisch',average:'Ø Treffer',largest:'Größter Treffer',share:'Anteil',overheal:'Überheilung',overkill:'Überschaden',
 effective:'Wirksam',info:'Info',reset:'Zurücksetzen',resetQuestion:'Alle Kampfstatistiken dieser Sitzung löschen?',confirmReset:'Statistik löschen',cancel:'Abbrechen',
 hint:'DPS/HPS = wirksamer Wert ÷ Kampfzeit (mindestens 1 s). Die Zeit endet, wenn der Kampfstatus endet. Ruhe-Regeneration, Schilde und Stufenaufstiege zählen nicht als Heilung. Übungstreffer der Hofprobe zählen nicht als Schaden.',
 session:'Die letzten 10 Kämpfe bleiben bis zum Neuladen erhalten. Gesamt umfasst auch ältere Kämpfe der Sitzung.',
 unknown:'Sonstiger Schaden',healingOther:'Sonstige Heilung',leech:'Lebensraub',feedback:'Heilung durch Markierungen / Infusion',
 hot:'Heilung über Zeit',killHeal:'Heilung beim Besiegen',parryHeal:'Parade-Heilung',proc:'Talentheilung',
 damageSources:{Autoangriff:'auto',Kelle:'strike',Pfandwurf:'throw',Markierung:'mark',RESONANZ:'burst',Entladung:'burst',Ansage:'interrupt',Parade:'parry',Sprung:'slam',Zündung:'detonate',Falle:'snare',Böller:'ground',Nachglut:'ground',Deckelwelle:'burst',
  // E-72: Quellen, die genau ein Kniff der neuen Ressourcen ist (Name kommt vom Kniff der Klasse). Alles andere (Kreuz, Karo, Pik, Stichflamme, Glutbrand,
  // Popcorn, Flambiert, Dampf, Rauch, Pömpel …) steht unter eigenem Namen (combat-meter.js).
  Servieren:'burst',Glutbrocken:'throw',Schwenkgrill:'ground',Spiritus:'spiritus',Abrechnen:'throw','Zeche prellen':'zeche'},
};
