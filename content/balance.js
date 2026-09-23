// Zentrale Stellschrauben. Nur Zahlen, keine Logik. Jede Änderung hier verschiebt das ganze Spiel:
// vorher `npm run content:check` (Schema + Invarianten) und `node scripts/balance-report.mjs` laufen lassen.
export const BALANCE=Object.freeze({
 maxLevel:30,
 xpPerLevel:140,                       // EP bis zur nächsten Stufe = xpPerLevel × aktuelle Stufe
 player:{
  baseHp:600,hpPerLevel:45,            // Lebenspunkte ohne Ausrüstung
  baseStamina:12,basePrimary:5,primaryPerLevel:1, // E-56: halbiert, dafür zählt jeder Punkt doppelt (Grundstärke unverändert) // Grundwerte; Wumms/Taktgefühl/Bastelgrips wachsen je Stufe
  hpPerStamina:30,                     // E-56: Standfestigkeit wirkt nur über Ausrüstung, die jetzt kleine Zahlen trägt
  talentPoints:{perLevelUntil:11,thenEvery:3}, // E-37: bis Stufe 11 ein Punkt je Stufe (10), danach alle 3 Stufen einer → 16 auf Stufe 30; Schlussstein kostet 10 (Verhältnis wie WoW Classic 31/51)
  specLevel:5,                         // Spec-Tor (E-37): bis dahin spielt jede Klasse nur ihren Kern, Talentpunkte werden gespart
  energyRegen:5,                       // Randale je Sekunde
  outOfCombatRegen:16,                 // Leben je Sekunde außerhalb des Kampfes
  consumableCooldown:15,               // gemeinsame Abklingzeit der Verpflegung
  gcdBase:1.5,gcdMin:1,gcdQuick:1,           // E-32: 1,5 s Basis, 1,0 s Untergrenze; Varianten/Procs lösen nur 1,0 s aus
  guardCap:.38,                        // Deckung höchstens 38 % des Maximallebens
  vulnerableBonus:.35,critMultiplier:1.6
 },
 // E-53: fünf Werte, jede Spielmechanik hängt an genau einem davon.
 //   Standfestigkeit → Leben · Wumms → Schaden · Taktgefühl → Glückstreffer-Chance und Tempo
 //   Bastelgrips → Heilung, Deckung, Randale-Nachschub · Dicke Haut → erlittener Schaden
 ratings:{                             // Punkte → Prozent mit abnehmendem Ertrag: r/(r+k)
  // E-56: Kurse steigen mit der Charakterstufe – k = k + perLevel × Stufe. Auf Stufe 1 bringt ein Punkt viel, auf Stufe 20 wenig.
  haste:{k:30,perLevel:10,cap:.35,finesseWeight:.6},       // Tempo aus Taktgefühl
  crit:{base:.04,k:60,perLevel:20,cap:.4,finesseWeight:1}, // Glückstreffer-Chance aus Taktgefühl
  armor:{k:5,perLevel:5,cap:.6}                 // Schadensminderung aus Dicke Haut (E-56: voller Satz ≈ 25–30 % auf jeder Stufe)
 },
 power:{                               // Beitrag je Punkt
  might:.024,                          // Wumms: Schaden aller Angriffe und Kniffe (E-56: ×2, Grundwert halbiert)
  healWit:.016,shieldWit:.014,energyRegenWit:.05 // Bastelgrips: Heilung, Deckung, Randale je Sekunde (E-56: ×2)
 },
 xp:{
  kill:{creature:30,human:45,elite:80,boss:150},
  quest:{gather:180,scout:180,hunt:220,escort:200,main:600},
  discovery:20
 },
 weapons:{referenceDamage:17,offhandShare:.5,perLevel:.055,quality:{uncommon:1.1,rare:1.25,epic:1.4},rollFloor:.93,rollSteps:15,shieldArmorShare:5,smallArmorShare:2},
 items:{
  // E-56: Wertpunkte eines Teils = (Gegenstandsstufe + pointsOffset) × pointsPerLevel × Güte, mindestens 1.
  // Stufe 1: gewöhnlich 1, ungewöhnlich 2, selten 2, episch 3 · Stufe 10 ungewöhnlich 10. Alle fünf Werte zählen dazu.
  pointsPerLevel:.9,pointsOffset:1,
  quality:{uncommon:1,rare:1.3,epic:1.6},commonQuality:.7,uniqueBonus:1.25, // Güte; Dorflegenden (unique) etwas darüber
  rollSpread:.30,                      // 0.85 … 1.15 der Punkte
  shares:{primary:.45,stamina:.25,secondary:.3}, // Verteilung ohne Rüstungsanteil
  armorPart:{offhand:.5,body:.35,legs:.35,head:.25,shoulders:.25,wrists:.2,hands:.2,waist:.2,feet:.2}, // Anteil Dicke Haut je Platz
  worth:{base:6,perLevel:2,quality:{uncommon:1,rare:1.4,epic:1.8}},valuePerBudget:2, // Verkaufswert: altes Maß, Händler (E-34) bleibt stabil
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
  surgeAt:80,surgeBonus:.2,            // „In Fahrt": ab so viel Randale (vor dem Abzug der Kosten) schlägt den Spezialkniff so viel härter
  energyOnKill:25,      // Randale je Kill
  hastePerStack:.08,                   // zusätzliches Tempo je Stapel (über die Tempo-Kappe hinaus)
  combatEnergyRegen:3,                // Randale je Sekunde im Kampf (statt player.energyRegen)
  restRegen:60,restSeconds:4           // Verschnaufen: Leben je Sekunde direkt nach dem letzten Kill
 },
 procs:{defaultWindow:6,chainJoinDelay:2,chainJoinRange:90} // Proc-Zeitfenster; Kettenzug der Gegner
});
/** E-56: Wertpunkte eines Gegenstands aus Gegenstandsstufe und Güte (Formel, keine Verteilung). */
export const itemPoints=(itemLevel,rarity,spread=1,unique=false)=>Math.max(1,Math.round((Math.max(1,itemLevel)+BALANCE.items.pointsOffset)*BALANCE.items.pointsPerLevel*(BALANCE.items.quality[rarity]??BALANCE.items.commonQuality)*(unique?BALANCE.items.uniqueBonus:1)*spread));
/** Verteilt ganze Punkte nach Gewichten (größter Rest; bei Gleichstand gewinnt die frühere Zeile). */
export function splitPoints(total,weights){const entries=Object.entries(weights).filter(([,w])=>w>0),sum=entries.reduce((n,[,w])=>n+w,0);if(!sum||total<=0)return {};const raw=entries.map(([k,w],i)=>({k,i,v:total*w/sum})),out=Object.fromEntries(raw.map(r=>[r.k,Math.floor(r.v)]));let rest=total-raw.reduce((n,r)=>n+Math.floor(r.v),0);for(const r of [...raw].sort((a,b)=>(b.v-Math.floor(b.v))-(a.v-Math.floor(a.v))||a.i-b.i)){if(rest<=0)break;out[r.k]++;rest--;}return Object.fromEntries(Object.entries(out).filter(([,v])=>v>0));}
export const xpToNext=level=>Math.max(1,level)*BALANCE.xpPerLevel;
export const totalXpForLevel=level=>BALANCE.xpPerLevel*(level-1)*level/2;
export const rating=(value,k)=>value/(value+k);
/** E-56: Umrechnungskurs einer Wertung auf der Charakterstufe (Glückstreffer, Tempo, Dicke Haut). */
export const ratingK=(r,level=1)=>r.k+(r.perLevel||0)*Math.max(1,level);
export const killXp=e=>e.type==='boss'?BALANCE.xp.kill.boss:e.elite?BALANCE.xp.kill.elite:e.type==='cultist'?BALANCE.xp.kill.human:BALANCE.xp.kill.creature;
/** Multiplikatoren für Gegner, deren Stufe über der Grundstufe ihres Archetyps liegt. */
export const enemyScale=(level,base=1,elite=false)=>({hp:(1+Math.max(0,level-base)*BALANCE.enemies.hpPerLevel)*(elite?BALANCE.enemies.eliteHp:1),damage:(1+Math.max(0,level-base)*BALANCE.enemies.damagePerLevel)*(elite?BALANCE.enemies.eliteDamage:1)});
