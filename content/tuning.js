// Tuning-Schicht der Rolle Balancing. Zahlenkorrekturen je ID, die über die Definitionen von Gameplay (enemies.js),
// Klassen (skills.js) und Loot (items.js) gelegt werden – damit Balancing Werte ändert, ohne fremde Dateien anzufassen.
// Nur Zahlenfelder, keine Namen, Texte, IDs oder Strukturen. Jede Zeile trägt eine Begründung (why) und das Datum.
// Angewendet in enemies.js (Ende), items.js (Ende), skills.js (Ende) über applyTuning().
export const TUNING={
 // Gegner: hp, level, speed, aggroRange, roamRadius, damage (Elite/Boss-Faktor), respawn:[min,max]
 enemies:{
  // --- Aggro-Reichweite und Leine (Nutzerbefund 2026-09-18: „manche zu früh in Aggro, manche hauen direkt wieder ab") ---
  // Held: Nahkampf 7 m, Fernkampf 24–26 m, Lauftempo 12 m/s. Aggro bei 18–19 m hieß: Menschen greifen an, bevor Kevin zielen kann.
  boar:{aggroRange:95,why:'14 m → 12 m: Keiler soll umgehbar sein, greift erst an, wenn man wirklich nah vorbeiläuft',since:'2026-09-18'},
  fox:{aggroRange:85,hp:480,why:'12 m → 11 m, schnellster Feldgegner (10 m/s) braucht keinen Vorsprung. Leben 400 → 480: E-60: Stufe 1–2 kämpft nur mit Aufbaukniff und Autoangriff; der Aufbaukniff trägt seit dem Finisher-Umbau mehr (Waffe ×2,6 statt ×2) – Dieter fiel auf 2,3–2,8 s',since:'2026-09-23'},
  warden:{aggroRange:100,why:'18 m → 12,5 m: Ruhewart lief los, sobald er am Bildrand auftauchte',since:'2026-09-18'},
  scrounger:{aggroRange:95,why:'16 m → 12 m',since:'2026-09-18'},
  inspector:{aggroRange:105,why:'19 m → 13 m',since:'2026-09-18'},
  kegler:{aggroRange:100,why:'16 m → 12,5 m',since:'2026-09-18'},
  alphaBoar:{aggroRange:110,leash:640,why:'Elite darf etwas weiter sehen (14 m) und verfolgt 80 m weit: Kiten muss möglich sein, ohne dass er abdreht',since:'2026-09-18'},
  oberpraktikant:{aggroRange:115,leash:640,why:'wie Borsten-Bruno: 19 m → 14 m Aggro, Leine 80 m',since:'2026-09-18'},
  // Umland-Tiere (badger, goose, raven, fox) bewusst OHNE Tuning: die Engine skaliert Feldgegner seit Runde A
  // mit der Spielerstufe (encounters.scaledStats, BALANCE.enemies.playerLead). Flaches Leben würde sich damit stapeln.
  badger:{hp:450,why:'360 → 450: E-60: Stufe 1–2 kämpft nur mit Aufbaukniff und Autoangriff; der Aufbaukniff trägt seit dem Finisher-Umbau mehr (Waffe ×2,6 statt ×2) – Dieter fiel auf 2,3–2,8 s',since:'2026-09-23'},
  goose:{hp:480,why:'390 → 480 (E-60: Stufe 1–2 kämpft nur mit Aufbaukniff und Autoangriff; der Aufbaukniff trägt seit dem Finisher-Umbau mehr (Waffe ×2,6 statt ×2) – Dieter fiel auf 2,3–2,8 s). Vorher: zu dünn an beiden Enden: auf eigener Stufe 1 nur 1,4/3,3/3,7 s (Korridor 4–12 s), im Umland auf Stufe 10 für Dieter 2,4 s (trivial). +30 % Grundleben wirkt an beiden Stellen, weil die Engine im Umland darauf aufsetzt',since:'2026-09-17'},
  raven:{hp:470,why:'380 → 470 (E-60: Stufe 1–2 kämpft nur mit Aufbaukniff und Autoangriff; der Aufbaukniff trägt seit dem Finisher-Umbau mehr (Waffe ×2,6 statt ×2) – Dieter fiel auf 2,3–2,8 s). Vorher: wie die Gans: Stufe 1 nur 1,4/2,5/3,0 s, im Umland auf Stufe 10 für Dieter 2,3 s. +31 % Grundleben',since:'2026-09-17'},
  // --- Korridor auf eigener Stufe (content/README.md) ---
  jga:{aggroRange:105,hp:840,why:'Aggro: 17,5 m → 13 m (2026-09-18). Feldgegner-Korridor 4–12 s auf eigener Stufe: Junggeselle fiel für Bärbel auf Stufe 4 in 3,9 s; +17 % Leben ergibt 4,6 s, Kevin 5,6 s',since:'2026-09-17'},
  // --- Bosse nach dem Finisher-Umbau (E-60): Leben so, dass die langsamste Klasse wieder unter 25 s liegt ---
  sigi:{hp:2950,why:'Boss-Korridor 10–25 s (E-60): Finisher halbiert (Nutzerbefund „Bierzelt-Abriss oneshottet auf Stufe 3“), damit brauchte Bärbel auf eigener Stufe 29,1 s; 3600 → dieses Leben',since:'2026-09-23'},
  klaus:{hp:3700,why:'Boss-Korridor 10–25 s (E-60): Finisher halbiert (Nutzerbefund „Bierzelt-Abriss oneshottet auf Stufe 3“), damit brauchte Bärbel auf eigener Stufe 26,9 s; 4200 → dieses Leben',since:'2026-09-23'},
  timo:{hp:3950,why:'Boss-Korridor 10–25 s (E-60): Finisher halbiert (Nutzerbefund „Bierzelt-Abriss oneshottet auf Stufe 3“), damit brauchte Bärbel auf eigener Stufe 29,1 s (Kevin 25,8 s); 4800 → dieses Leben',since:'2026-09-23'},
  gisela:{hp:3300,why:'Boss-Korridor 10–25 s (E-60): Finisher halbiert (Nutzerbefund „Bierzelt-Abriss oneshottet auf Stufe 3“), damit brauchte Bärbel auf eigener Stufe 30,3 s; 4200 → dieses Leben',since:'2026-09-23'},
  automat:{hp:3900,why:'Boss-Korridor 10–25 s (E-60): Finisher halbiert (Nutzerbefund „Bierzelt-Abriss oneshottet auf Stufe 3“), damit brauchte Bärbel auf eigener Stufe 34,2 s (Kevin 33,2 s, Dieter 27,1 s); 6000 → dieses Leben; nach den neuen Spec-Faktoren Kevin noch 26,7 s, daher 4200 → 3900',since:'2026-09-23'},
  // Kegelbruder aus Kalt (kegler) bewusst unverändert: auf eigener Stufe 3 liegen Bärbel (6,7 s) und Kevin (5,3 s)
  // im Korridor, nur Dieter fällt mit 3,7 s darunter. Erst ab 1300 Leben (+103 %) erreicht Dieter 4,1 s – dann steht
  // Bärbel bei 12,5 s über dem Korridor. Gegner-Leben kann keinen Klassenabstand schließen → docs/backlog/klassen.md.
 },
 // Zaubermuster: castSet/cast → total, damage, radius
 casts:{},
 // Gegenstände: stats {…}, weapon {min,max}, heal, energy, value, level
 items:{},
 // Klassen-Kits: klasse/skill → cd, cost, damage, heal, window, duration …
 skills:{},
 // Kernmechaniken (E-32, content/mechanics.js): spec → verschachtelte Zahlen, z. B. 'dieter-brawl':{stack:{decay:9},why,since}
 mechanics:{
  // Messlauf scripts/spec-sim.mjs (45 s, drei Puppen, naive Rotation, Stufe 11, ohne Talente): Median 142 DPS. Ziel: Schadens-Specs ±15 %, Tank/Heilung darunter.
  'kevin-fuse':{chain:{falloff:.45},fuse:{explode:{damage:20,radius:70}},output:{damage:0.74},why:'E-72 R3 (Runde 2): fuse.explode trug keinen radius mehr (applyTuning mischt nur eine Ebene) – die Lunten-Explosion traf nie. Mit Radius 70 wie entworfen lag Pfad Kettenreaktion bis +64 %: Explosion 70 → 20, Faktor 0,8 → 0,74. Davor: E-72: Pfandbon +8 % – Faktor 0,85 → 0,8. Kurzschluss + Lunten lagen bei +44 % (mit Lunten-Pfad +151 %): drei Sprünge mit 30 % Verlust plus 90er-Explosionen stapeln sich gegen Gruppen; Verlust 45 %, Explosion 70',since:'2026-09-19'},
  'baerbel-stage':{state:{damage:1.2,drain:12},output:{damage:0.72},why:'E-72: Trend und häufigere Putzwut hoben die Filter-Furie um 30 % – Faktor 0,89 → 0,72. Putzwut lag bei +29 %: 25 % Bonus bei 10 s Dauer war zu viel; 20 % und schnellerer Randale-Verbrauch (12/s) verkürzen den Zustand',since:'2026-09-19'},
  'kevin-hunt':{gamble:{misfire:.15,overMult:2},output:{damage:1.16},why:'Pfandjäger lag bei −25 % trotz Schadensrolle: Fehlzündung 15 % statt 20 %, Überzündung ×2 statt ×1,8. E-72: Pfandbon und volle Nachladungen hoben Kevin um 8 % – Faktor 1,25 → 1,16',since:'2026-09-25'},
  // E-72 (Messlauf Stufe 12, 60 s, Puppe, scripts/balance-rotation.mjs): Vorher-Werte aus dem Stand vor E-72, Ziel: alte Klassen ±5 %, neue Klassen im Korridor (Schaden ≈ 100, Tank ≈ 82, Heilung ≈ 80).
  'baerbel-care':{output:{damage:1.0,healing:1.15},why:'E-72: Annis Trend (+4 % je Stufe) hob den Schaden um 19 % – Faktor 1,18 → 1,0',since:'2026-09-25'},
  'baerbel-feedback':{output:{damage:1.0},why:'E-72: Trend +21 % – Faktor 1,18 → 1,0',since:'2026-09-25'},
  'kevin-iron':{output:{damage:1.0},why:'E-72: Pfandbon +8 % – Faktor 1,08 → 1,0',since:'2026-09-25'},
  'schorsch-chef':{output:{damage:1.2,healing:1},chef:{wurstBonus:.15,buffet:{duration:10,radius:85,heal:14}},why:'E-72: der Grillplan des Chefs bringt zwei Würste je Braten – Schaden ×1,2 für den Heiler-Korridor. E-72 R3: das Buffet steht jetzt auf Abklingzeit (Rotation), die Wurst heilt mit dem Maximalleben und wuchs mit der Ausrüstung (Wurst gar ×4,4 von Start- zu epischer Ausrüstung) – Wurst-Bonus 25 → 15 %, Heilfaktor 0,8 → 1. Runde 2 (E-53): Wurst, Käse, Ablöschen, Senf bemessen sich am Grundleben der Stufe statt am Maximalleben, Buffet und Nachheilung werden nur noch einmal mit der Stufe skaliert (vorher Stufenfaktor im Quadrat) – Buffet wieder 14 je Sekunde',since:'2026-09-25'},
  'schorsch-flamme':{output:{damage:.74},flamme:{bonus:.3,splash:{radius:70,share:.25},overheatFactor:1.2},why:'E-72 Balance-Sheet: Flambierer +60 bis +125 % in Gruppen (Feuerspritzer, Stichflamme ×2, Popcorn) – Flambieren +50 → +30 %, Spritzer 40 → 25 %, Stichflamme ×2 → ×1,4, Faktor 0,85. E-72 R3: splash wieder mit Radius (applyTuning mischt nur eine Ebene – ohne radius trafen die Spritzer nie); Stichflamme ×1,3 → ×1,2 und Faktor 0,78 → 0,74, weil Pfad Stichflamme ab Stufe 10 bei +30 % lag',since:'2026-09-25'},
  'schorsch-rauch':{output:{damage:1.05},rauch:{smoke:{radius:80,duration:6,weaken:.3},oven:{duration:12,radius:90,damage:10}},why:'E-72 Erstwert: Käse statt Braten – Faktor 1,25 hebt den Räuchermeister auf den Tank-Korridor (≈ 82). E-72 R3: smoke wieder vollständig (ohne radius/duration fiel der Rauch beim Servieren nie – applyTuning mischt nur eine Ebene); die Rotation hält jetzt die Glut unter 45 (Räuchern). Schwächung 15 → 30 %, Räucherofen 10 → 12 s: Mit Ausrüstung schluckt der Käse-Schild jeden Treffer, Schutz/s zählt das doppelt (verhindert + Deckung) – mehr Rauch senkt diesen Deckel, ohne Ausrüstung hebt er den Schutz',since:'2026-09-25'},
  'kaethe-grand':{output:{damage:1},why:'E-72: nach dem Kartenschaden-Abgleich (Kreuz/Karo +50 %) Faktor 1',since:'2026-09-25'},
  'kaethe-herz':{output:{healing:1},herz:{bonus:.2},why:'E-72 Balance-Sheet: Kartenlegerin heilte 25–56 % unter dem Median – Herz-Bonus 40 → 60 %, Heilfaktor 1,2. E-72 R3: die Rotation spielt jetzt Herz zuerst, Eierlikörchen, Legekreis und Handlesen – Pfad 0 lag danach bei +60 bis +90 %: Herz-Bonus 60 → 20 %, Heilfaktor 1,3 → 1',since:'2026-09-25'},
  'kaethe-falsch':{output:{damage:1.1},why:'E-72 Balance-Sheet: Falschspielerin lag 25–50 % unter dem Median – Faktor 0,95 nach dem Kartenschaden-Abgleich',since:'2026-09-25'}
  // dieter-brew (−38 %) und dieter-wall (−18 %) bewusst belassen: Schutz-/Heilrollen, Weizenfass heilt statt zu schaden.
 },
 // Klassen-Buffs (content/class-buffs.js, docs/KLASSEN-BUFFS-2026-09-23.md): Wirkung je Buff und Wert. Jeder Buff hebt einen anderen Wert,
 // damit Buffs verschiedener Klassen in der Gruppe zusammen wirken. Größenordnung 5–10 %: spürbar, aber kein Muss für den Korridor.
 classBuffs:{
  dosenpfand:{effects:{health:.08},why:'Startwert: +8 % maximales Leben ≈ ein Stufenaufstieg Leben auf Stufe 10; spürbar für Tank und Söldner, ohne den Boss-Korridor zu verschieben (kein Schaden)',since:'2026-09-23'},
  kutteDrueber:{effects:{armor:.05},why:'Startwert: 5 Prozentpunkte Schadensminderung – knapp ein Fünftel dessen, was ein voller Satz Dicke Haut bringt (E-56: 25–30 %)',since:'2026-09-23'},
  aperolSpritz:{effects:{energyRegen:.3,healTaken:.08},why:'Startwert: +0,3 Randale/s = 10 % der Kampf-Regeneration (3/s) und +8 % erhaltene Heilung; zwei kleine Hebel statt eines großen, weil beide allein kaum spürbar wären',since:'2026-09-23'},
  vorherNachher:{effects:{haste:.05},why:'Startwert: +5 % Tempo ≈ +5 % Schaden und kürzere globale Abklingzeit; das stärkste Schadenspaket der sechs, deshalb am unteren Rand',since:'2026-09-23'},
  kabelbinderSohlen:{effects:{speed:.1},why:'Startwert: +10 % Laufgeschwindigkeit zu Fuß; kein Kampfwert, deshalb am oberen Rand. Reittiere haben ihr eigenes Tempo',since:'2026-09-23'},
  pfandradar:{effects:{crit:.04},why:'Startwert: +4 Prozentpunkte Glückstreffer-Chance ≈ +2,5 % Schaden (Faktor 1,6); ergänzt Tempo statt es zu verdoppeln',since:'2026-09-23'},
  grillteller:{effects:{damage:.04},why:'E-72 Startwert: +4 % Schaden – etwas unter dem Tempo-Filter (+5 % Tempo), weil er ohne Umweg über die Abklingzeiten wirkt',since:'2026-09-25'},
  wurstbroetchen:{effects:{healPower:.06},why:'E-72 Startwert: +6 % verursachte Heilung – spiegelt den Aperol-Spritz (erhaltene Heilung) auf der Geberseite',since:'2026-09-25'},
  glueckspfennig:{effects:{critDamage:.1},why:'E-72 Startwert: +10 % Glückstreffer-Schaden ≈ +1 % Schaden bei 15 % Chance; ergänzt das Pfandradar (Chance), statt es zu verdoppeln',since:'2026-09-25'},
  strickschal:{effects:{shieldPower:.1},why:'E-72 Startwert: +10 % stärkere Deckung und Schilde – nur wer Deckung bekommt, profitiert; darum höher als die Schadensbuffs',since:'2026-09-25'}
 },
 // E-72: Zahlen der Klassenressourcen (content/resources.js). Leer = Startwerte aus dem Design.
 resources:{
  // E-72 Runde 3 (Balance-Sheet): verschachtelte Werte (Grillgut, Glutbereiche) stehen direkt in content/resources.js, weil applyTuning nur eine Ebene mischt.
  schorsch:{gain:{strike:14,parry:15,buff:35},cleave:{radius:70,targets:2,share:.2},why:'E-72 R3: Grillzange +12 → +14 Glut – ohne Ausrüstung und ohne Blasebalg (bis Stufe 5) kam der Grillhütten-Chef nie in den goldenen Bereich und lag 35–48 % unter dem Heiler-Median. Spanferkel-Wurf: Nachbarn 50 → 20 % Wucht, Pfad Schwenkbraten sprang auf Stufe 15 von +10 auf +40 %',since:'2026-09-25'},
  kaethe:{abrechnen:{perAuge:1.4,perAugeWeapon:.095,schneider:1.5,schwarz:2,radius:90},luschenGcd:.85,follow:{bonus:.2,max:3},effects:{damage:{flat:45,weapon:3.2},shield:.09,heal:.12,control:{flat:24,weapon:1.5,radius:60,slow:.4,duration:3,stun:1}},handlesen:{perSecond:.01,extend:2},why:'E-72 R3: Abrechnen hing zu 90 % am festen Anteil (2,7 je Auge) und wuchs kaum mit der Waffe – ohne Ausrüstung +25 bis +30 % über dem Median, 1,4 je Auge + 0,095 Waffe je Auge. Luschen mit „Flinke Finger“ 0,5 → 0,85 s, Farbkette +25 → +20 % je Glied: die Rotation spielt jetzt Kartenregen und Gezinkte Karten, Pfade Null ouvert/Ärmel lagen bei +35 bis +70 %. Herz heilt 13 → 12 % (Runde 2: am Grundleben statt am Maximalleben) und Handlesen 2 → 1 % je Sekunde (Heiler-Median)',since:'2026-09-25'}
 },
};
/** Rahmen der Klassen-Buffs: Dauer in Sekunden, Verstärkung je Talentstufe (`classBuff:<id>`), Obergrenze der Stärke beim Empfang. */
export const CLASS_BUFF_TUNING={duration:1800,talentStep:.5,maxPower:2,
 why:'30 Minuten: einmal vor dem Losziehen zaubern, nicht im Kampf nachhalten. Talentstufe +50 %: sichtbar im Tooltip, bleibt im 5–15-%-Rahmen. maxPower begrenzt, was ein fremder Client per Netz schicken darf',since:'2026-09-23'};
// Zusätze gewürfelter Beute (E-40, content/affixes.js). Eigener Block statt TUNING-Zeile, weil TUNING nur Korrekturen je ID trägt: Budgetanteil je Zusatz, Punkte je Budgetpunkt, Chance bei Ungewöhnlich.
// Zusätze kommen OBEN AUF das Grundbudget (BALANCE.items) – ein Fundstück wird dadurch nie schwächer, gespeicherte Teile gewinnen höchstens maxGain.
export const AFFIX_TUNING={
  share:{prefix:.1,epithet:.1,why:'je Zusatz 10 % des Grundbudgets: spürbar im Tooltip (Stufe 10 ≈ +3 Punkte), aber kleiner als der Abstand Ungewöhnlich→Selten (×1,4); ein epischer Doppelzusatz bleibt mit +20 % unter dem Sprung zur nächsten Güte',since:'2026-09-20'},
  uncommonChance:.5,
  maxGain:.2,
  minPoints:1,rate:{might:1,finesse:1,wit:1,stamina:1,armorRating:1,why:'E-56: alle Werte zählen gleich als Punkte (Dicke Haut vorher ×3); ein Zusatz bringt mindestens minPoints Punkt, auch an Teilen der Stufe 1',since:'2026-09-23'},
  why:'uncommonChance .5: die Hälfte der gewöhnlichen Funde bleibt schlicht, damit ein Zusatz auffällt. maxGain .2 ist der Deckel, den content/checks/loot.js gegen die Summe der share-Werte prüft',since:'2026-09-20'
};
/** Legt Zahlen aus `overrides[id]` flach über `target[id]`; verschachtelte Objekte (stats, weapon) werden gemischt. */
export function applyTuning(target,overrides={}){for(const [id,patch] of Object.entries(overrides)){const t=target[id];if(!t)continue;const {why,since,...values}=patch;for(const [k,v] of Object.entries(values))t[k]=v&&typeof v==='object'&&!Array.isArray(v)?{...(t[k]||{}),...v}:v;}return target;}
