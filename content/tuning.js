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
  fox:{aggroRange:85,why:'12 m → 11 m, schnellster Feldgegner (10 m/s) braucht keinen Vorsprung',since:'2026-09-18'},
  warden:{aggroRange:100,why:'18 m → 12,5 m: Ruhewart lief los, sobald er am Bildrand auftauchte',since:'2026-09-18'},
  scrounger:{aggroRange:95,why:'16 m → 12 m',since:'2026-09-18'},
  inspector:{aggroRange:105,why:'19 m → 13 m',since:'2026-09-18'},
  kegler:{aggroRange:100,why:'16 m → 12,5 m',since:'2026-09-18'},
  alphaBoar:{aggroRange:110,leash:640,why:'Elite darf etwas weiter sehen (14 m) und verfolgt 80 m weit: Kiten muss möglich sein, ohne dass er abdreht',since:'2026-09-18'},
  oberpraktikant:{aggroRange:115,leash:640,why:'wie Borsten-Bruno: 19 m → 14 m Aggro, Leine 80 m',since:'2026-09-18'},
  // Umland-Tiere (badger, goose, raven, fox) bewusst OHNE Tuning: die Engine skaliert Feldgegner seit Runde A
  // mit der Spielerstufe (encounters.scaledStats, BALANCE.enemies.playerLead). Flaches Leben würde sich damit stapeln.
  goose:{hp:390,why:'zu dünn an beiden Enden: auf eigener Stufe 1 nur 1,4/3,3/3,7 s (Korridor 4–12 s), im Umland auf Stufe 10 für Dieter 2,4 s (trivial). +30 % Grundleben wirkt an beiden Stellen, weil die Engine im Umland darauf aufsetzt',since:'2026-09-17'},
  raven:{hp:380,why:'wie die Gans: Stufe 1 nur 1,4/2,5/3,0 s, im Umland auf Stufe 10 für Dieter 2,3 s. +31 % Grundleben',since:'2026-09-17'},
  // --- Korridor auf eigener Stufe (content/README.md) ---
  jga:{aggroRange:105,hp:840,why:'Aggro: 17,5 m → 13 m (2026-09-18). Feldgegner-Korridor 4–12 s auf eigener Stufe: Junggeselle fiel für Bärbel auf Stufe 4 in 3,9 s; +17 % Leben ergibt 4,6 s, Kevin 5,6 s',since:'2026-09-17'},
  klaus:{hp:4800,why:'Boss-Korridor 10–25 s auf eigener Stufe: Kegelkönig Klaus fiel für Dieter auf Stufe 6 in 9,0 s; +14 % Leben ergibt 10,2 s, Bärbel 18,2 s und Kevin 16,8 s bleiben klar unter 25 s',since:'2026-09-17'},
  timo:{hp:5300,why:'Boss-Korridor 10–25 s: Trauzeuge Timo fiel für Dieter auf eigener Stufe 7 in 9,4 s; +10 % Leben ergibt 10,5 s, Bärbel 18,5 s und Kevin 17,0 s',since:'2026-09-17'}
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
  'kevin-fuse':{chain:{falloff:.45},fuse:{explode:{damage:70}},why:'Kurzschluss + Lunten lagen bei +44 % (mit Lunten-Pfad +151 %): drei Sprünge mit 30 % Verlust plus 90er-Explosionen stapeln sich gegen Gruppen; Verlust 45 %, Explosion 70',since:'2026-09-19'},
  'baerbel-stage':{state:{damage:1.2,drain:12},why:'Putzwut lag bei +29 %: 25 % Bonus bei 10 s Dauer war zu viel; 20 % und schnellerer Randale-Verbrauch (12/s) verkürzen den Zustand',since:'2026-09-19'},
  'kevin-hunt':{gamble:{misfire:.15,overMult:2},why:'Pfandjäger lag bei −25 % trotz Schadensrolle: Fehlzündung 15 % statt 20 %, Überzündung ×2 statt ×1,8',since:'2026-09-19'}
  // dieter-brew (−38 %) und dieter-wall (−18 %) bewusst belassen: Schutz-/Heilrollen, Weizenfass heilt statt zu schaden.
 },
 // Spezialisierungen (E-59): Faktor auf den ausgeteilten Schaden (damage) bzw. feste Heilung (healing) der Spec.
 // Messung: npm run balance:sheet – Schaden/s relativ zum Median der Schadens-Specs, Mittel aus Einzelziel und drei Zielen,
 // Ø Stufe 10–30, Ausrüstung selten, Pfade 0–2. Ziel: Schadens-Specs 1,0 · Tanks ≈ 0,82 (dazu Schutz) · Heiler ≈ 0,75 (dazu Heilung).
 specs:{
  'kevin-hunt':{damage:1.42,why:'0,61 des Medians auf allen Stufen (Glücksspiel trägt zu wenig); stark im Einzelziel, schwach in Gruppen – ×1,42 bringt das Mittel auf ≈ 1,0',since:'2026-09-23'},
  'kevin-fuse':{damage:.88,why:'Kettensprünge und Lunten: 1,24 im Dreierkampf, 0,84 im Einzelziel, steigt mit der Stufe; ×0,88 → Mittel ≈ 1,0',since:'2026-09-23'},
  'dieter-brawl':{damage:.72,why:'1,14 im Dreierkampf, 1,6 im Einzelziel; ×0,72 → Mittel ≈ 1,0 (nach korrigierter Zauberzeit im Sheet: ×0,76 ergab 1,05)',since:'2026-09-23'},
  'baerbel-stage':{damage:.93,why:'Putzwut: Mittel 1,03 ohne Faktor; ×0,93',since:'2026-09-23'},
  'baerbel-feedback':{damage:1.09,why:'Mittel 0,92, fällt mit der Stufe leicht ab; ×1,09',since:'2026-09-23'},
  'dieter-wall':{damage:1.08,why:'Tank: Mittel 0,76 ohne Faktor (Einzelziel stark, Gruppe schwach); ×1,08 → ≈ 0,82 plus Schutz',since:'2026-09-23'},
  'kevin-iron':{damage:1.21,why:'Tank: Mittel 0,68 ohne Faktor; ×1,21 → ≈ 0,82',since:'2026-09-23'},
  'dieter-brew':{damage:1.15,why:'Schutz & Heilung: Mittel 0,65 ohne Faktor; ×1,15 → ≈ 0,75. Die Heilung des Zapfmeisters entsteht aus Schaden und wächst mit',since:'2026-09-23'},
  'baerbel-care':{damage:1.1,healing:1.15,why:'Heilerin: Mittel 0,68 ohne Faktor und ~⅓ der Zapfmeister-Heilung; ×1,1 Schaden, ×1,15 feste Heilung',since:'2026-09-23'}
 },
};
// Zusätze gewürfelter Beute (E-40, content/affixes.js). Eigener Block statt TUNING-Zeile, weil TUNING nur Korrekturen je ID trägt: Budgetanteil je Zusatz, Punkte je Budgetpunkt, Chance bei Ungewöhnlich.
// Zusätze kommen OBEN AUF das Grundbudget (BALANCE.items) – ein Fundstück wird dadurch nie schwächer, gespeicherte Teile gewinnen höchstens maxGain.
export const AFFIX_TUNING={
  share:{prefix:.1,epithet:.1,why:'je Zusatz 10 % des Grundbudgets: spürbar im Tooltip (Stufe 10 ≈ +3 Punkte), aber kleiner als der Abstand Ungewöhnlich→Selten (×1,4); ein epischer Doppelzusatz bleibt mit +20 % unter dem Sprung zur nächsten Güte',since:'2026-09-20'},
  uncommonChance:.5,
  maxGain:.2,
  minPoints:1,rate:{might:1,finesse:1,wit:1,stamina:1,armorRating:1,why:'E-56: alle Werte zählen gleich als Punkte (Dicke Haut vorher ×3); ein Zusatz bringt mindestens minPoints Punkt, auch an Teilen der Stufe 1',since:'2026-09-23'},
  why:'uncommonChance .5: die Hälfte der gewöhnlichen Funde bleibt schlicht, damit ein Zusatz auffällt. maxGain .2 ist der Deckel, den content/checks/loot.js gegen die Summe der share-Werte prüft',since:'2026-09-20'
};
/** Faktoren einer Spezialisierung (E-59); fehlt ein Eintrag, gilt 1. */
export const specOutput=spec=>({damage:1,healing:1,...(TUNING.specs?.[spec]||{})});
/** Legt Zahlen aus `overrides[id]` flach über `target[id]`; verschachtelte Objekte (stats, weapon) werden gemischt. */
export function applyTuning(target,overrides={}){for(const [id,patch] of Object.entries(overrides)){const t=target[id];if(!t)continue;const {why,since,...values}=patch;for(const [k,v] of Object.entries(values))t[k]=v&&typeof v==='object'&&!Array.isArray(v)?{...(t[k]||{}),...v}:v;}return target;}
