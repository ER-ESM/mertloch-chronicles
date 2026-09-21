// Zentrale Stellschrauben. Nur Zahlen, keine Logik. Jede Änderung hier verschiebt das ganze Spiel:
// vorher `npm run content:check` (Schema + Invarianten) und `node scripts/balance-report.mjs` laufen lassen.
export const BALANCE=Object.freeze({
 maxLevel:30,
 xpPerLevel:140,                       // EP bis zur nächsten Stufe = xpPerLevel × aktuelle Stufe
 player:{
  baseHp:600,hpPerLevel:45,            // Lebenspunkte ohne Ausrüstung
  baseStamina:12,basePrimary:10,primaryPerLevel:2, // Grundwerte; Wumms/Taktgefühl/Bastelgrips wachsen je Stufe
  hpPerStamina:8,
  talentPoints:{perLevelUntil:11,thenEvery:3}, // E-37: bis Stufe 11 ein Punkt je Stufe (10), danach alle 3 Stufen einer → 16 auf Stufe 30; Schlussstein kostet 10 (Verhältnis wie WoW Classic 31/51)
  specLevel:5,                         // Spec-Tor (E-37): bis dahin spielt jede Klasse nur ihren Kern, Talentpunkte werden gespart
  energyRegen:5,                       // Randale je Sekunde
  outOfCombatRegen:16,                 // Leben je Sekunde außerhalb des Kampfes
  consumableCooldown:15,               // gemeinsame Abklingzeit der Verpflegung
  gcdBase:1.5,gcdMin:1,gcdQuick:1,           // E-32: 1,5 s Basis, 1,0 s Untergrenze; Varianten/Procs lösen nur 1,0 s aus
  guardCap:.38,                        // Deckung höchstens 38 % des Maximallebens
  vulnerableBonus:.35,critMultiplier:1.6
 },
 ratings:{                             // Wertung → Prozent mit abnehmendem Ertrag: r/(r+k)
  haste:{k:350,cap:.35,finesseWeight:.4},
  crit:{base:.04,k:700,cap:.4,finesseWeight:.8},
  armor:{k:450,perLevel:35,cap:.6,mightWeight:.65},
  mastery:{k:400}
 },
 power:{                               // Beitrag der Primärwerte je Punkt
  might:.003,finesse:.002,wit:.002,
  physicalMight:.002,technicalWit:.002,
  healWit:.006,healMight:.002,
  shieldMight:.003,shieldWit:.004,
  energyRegenWit:.025
 },
 xp:{
  kill:{creature:30,human:45,elite:80,boss:150},
  quest:{gather:180,scout:180,hunt:220,escort:200,main:600},
  discovery:20
 },
 weapons:{referenceDamage:17,offhandShare:.5,perLevel:.055,quality:{uncommon:1.1,rare:1.25,epic:1.4},rollFloor:.93,rollSteps:15,shieldArmorShare:5,smallArmorShare:2},
 items:{
  budgetBase:6,budgetPerLevel:2,       // Wertebudget eines gewürfelten Gegenstands
  quality:{uncommon:1,rare:1.4,epic:1.8},
  rollSpread:.30,                      // 0.85 … 1.15 des Budgets
  itemLevel:{perLevel:5,rare:4,epic:8},
  staminaShare:.45,secondaryShare:1.3,armorShare:3,valuePerBudget:2,
  rareChance:.22                       // Anteil seltener Gegenstände unter gewürfelter Beute
 },
 enemies:{
  hpPerLevel:.12,damagePerLevel:.08,   // Skalierung je Stufe über der Grundstufe des Archetyps
  playerLead:2,                       // Umland-Gegner wachsen mit (Spielerstufe − playerLead); der Spieler behält zwei Stufen Vorsprung
  eliteHp:2.2,eliteDamage:1.3,
  spawnGrace:1.8
 },
 // Gruppenspiel (E-42): EP-Bonus je Gruppenmitglied in Reichweite, Würfeln ab Seltenheit, Anteil fremder Buffs
 party:{reviveHp:.35,worldBossHp:4,worldBossLevel:2,xpPerMember:.05,range:1600,rollRarities:['rare','epic'],buffShare:.5},
 loot:{coinsBoss:25,coinsHuman:2,coinsSpread:6,foodChanceHuman:.15},
 momentum:{                            // Schwung: der Kill ist die Belohnung, nicht das Ende
  duration:8,maxStacks:3,
  surgeAt:80,surgeBonus:.2,            // „In Fahrt": ab so viel Randale (vor dem Abzug der Kosten) schlägt die Eskalation so viel härter
  energyOnKill:25,pointsOnKill:1,      // Randale und Punkte je Kill
  hastePerStack:.08,                   // zusätzliches Tempo je Stapel (über die Drehzahl-Kappe hinaus)
  combatEnergyRegen:3,                // Randale je Sekunde im Kampf (statt player.energyRegen)
  restRegen:60,restSeconds:4           // Verschnaufen: Leben je Sekunde direkt nach dem letzten Kill
 },
 procs:{defaultWindow:6,chainJoinDelay:2,chainJoinRange:90} // Proc-Zeitfenster; Kettenzug der Gegner
});
export const xpToNext=level=>Math.max(1,level)*BALANCE.xpPerLevel;
export const totalXpForLevel=level=>BALANCE.xpPerLevel*(level-1)*level/2;
export const rating=(value,k)=>value/(value+k);
export const killXp=e=>e.type==='boss'?BALANCE.xp.kill.boss:e.elite?BALANCE.xp.kill.elite:e.type==='cultist'?BALANCE.xp.kill.human:BALANCE.xp.kill.creature;
/** Multiplikatoren für Gegner, deren Stufe über der Grundstufe ihres Archetyps liegt. */
export const enemyScale=(level,base=1,elite=false)=>({hp:(1+Math.max(0,level-base)*BALANCE.enemies.hpPerLevel)*(elite?BALANCE.enemies.eliteHp:1),damage:(1+Math.max(0,level-base)*BALANCE.enemies.damagePerLevel)*(elite?BALANCE.enemies.eliteDamage:1)});
