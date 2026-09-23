// Admin-Konsole (admin-commands.js): Texte der Testbefehle. Nur lokal (localhost), mit ?admin=1 oder
// localStorage 'mertloch-admin'='1' – und nie mit angemeldetem Online-Konto (geteilte Welt, Bestenliste).
export const ADMIN_UI={
 title:'Admin-Konsole',
 hint:'Befehl eingeben, Enter ausführen · help listet alles · ^ schließt',
 blockedOnline:'Admin-Befehle sind mit angemeldetem Online-Konto gesperrt (geteilte Welt).',
 unknown:cmd=>'Unbekannter Befehl: '+cmd+' – help zeigt alle.',
 help:[
  ['level <n>','Stufe setzen (1–30), Talentpunkte und Werte wie beim echten Aufstieg'],
  ['levelup','Genau eine Stufe aufsteigen – echter Stufenaufstieg mit Einblendung'],
  ['xp <n>','Erfahrung geben'],
  ['coins <n>','Pfandmarken geben'],
  ['item <id> [n]','Gegenstand in den Rucksack'],
  ['heal','Leben und Randale voll'],
  ['god [an|aus]','Unverwundbar schalten'],
  ['kill','Aktuelles Ziel besiegen (mit Beute und EP)'],
  ['die','Den Helden fallen lassen (Tod-Bildschirm prüfen)'],
  ['tp <ort>','Teleport: treff, ida, bude, kiosk, stall, brett, werkhof, lager <n>'],
  ['tutorial skip','Hofprobe abschließen'],
  ['chapter <n>','Kapitel n starten (alle vorigen als abgeholt)'],
  ['quest ready','Ziele des laufenden Kapitels erfüllen'],
  ['unlock <all|reset|list>','Menü-Freischaltungen: alles, zurück auf Spielstand, Liste'],
  ['memory <all|id>','Erinnerungen freischalten'],
  ['intro','Einführungsfilm erneut abspielen'],
 ],
};
