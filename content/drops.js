// Beutetabellen je Gegnerfamilie (Feld `family` des Gegners, siehe enemies.js).
// Jede Zeile ist eine eigene Wahrscheinlichkeit; ein Gegner kann auch nichts fallen lassen.
// material: Material-ID aus items.js · gearChance: gewürfelte Ausrüstung (slots) · unique: Dorflegende · coinsChance: Pfandmarken.
// extra (optional): feste Ausrüstung ohne Einzigartigkeit, je Zeile {item, chance} ein eigener Wurf nach allen anderen –
// so bleibt die Wurffolge der übrigen Beute unverändert. Dorflegenden gehören weiter nach unique.
export const DROP_TABLES={
 boar:{material:'borste',materialChance:.42,gearChance:.08,unique:'keilerzahn',uniqueChance:.008,coinsChance:0,slots:['charm']},
 goose:{material:'feder',materialChance:.38,gearChance:.04,unique:'gansorden',uniqueChance:.006,coinsChance:0,slots:['charm']},
 badger:{material:'dachsfell',materialChance:.4,gearChance:.06,unique:'dachsdeckel',uniqueChance:.008,coinsChance:0,slots:['charm']},
 warden:{material:'kabel',materialChance:.32,gearChance:.2,unique:'ruhepfeife',uniqueChance:.012,coinsChance:.7,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 horst:{material:'hausordnung',materialChance:.5,gearChance:.85,unique:'horststempel',uniqueChance:.12,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket'],
  extra:[{item:'rohrzange',chance:.15}]},// Waffenkammer 2026-09: Horst regelt auch den Wasserhahn
 // --- neue Familien ---
 raven:{material:'kronkorken',materialChance:.5,gearChance:.03,unique:'gansorden',uniqueChance:.004,coinsChance:.25,slots:['charm']},
 fox:{material:'fuchsschwanz',materialChance:.4,gearChance:.07,unique:'fuchspfote',uniqueChance:.008,coinsChance:0,slots:['feet','charm']},
 scrounger:{material:'kronkorken',materialChance:.35,gearChance:.14,unique:'schnorrerbecher',uniqueChance:.01,coinsChance:.55,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 inspector:{material:'flugblatt',materialChance:.45,gearChance:.22,unique:'praktikantenausweis',uniqueChance:.012,coinsChance:.75,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 elite:{material:'borste',materialChance:.8,gearChance:.5,unique:'keilerzahn',uniqueChance:.06,coinsChance:0,slots:['weapon','charm']},
 gisela:{material:'hopfen',materialChance:.5,gearChance:.85,unique:'giesskanne',uniqueChance:.14,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 automat:{material:'dosenblech',materialChance:.5,gearChance:.85,unique:'automatenarm',uniqueChance:.16,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 // Elite Oberpraktikant Olaf: menschlich, deshalb Marken statt Tiermaterial; lohnt sich spürbar mehr als ein Ruhewart.
 oberpraktikant:{material:'kabelbinder',materialChance:.7,gearChance:.5,unique:'dienstmuetze',uniqueChance:.05,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 // --- Akt 1 ---
 kegler:{material:'kabel',materialChance:.4,gearChance:.18,unique:'kegelkugel',uniqueChance:.012,coinsChance:.6,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket'],
  extra:[{item:'fasskeule',chance:.03}]},// Waffenkammer 2026-09: die Fasskeule kommt von der Kegelbahn
 jga:{material:'jga-shirt',materialChance:.55,gearChance:.2,unique:'bierbong',uniqueChance:.012,coinsChance:.5,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 sigi:{material:'palettenholz',materialChance:.6,gearChance:.85,unique:'sigizange',uniqueChance:.14,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 klaus:{material:'kabel',materialChance:.5,gearChance:.85,unique:'koenigskette',uniqueChance:.14,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket'],
  extra:[{item:'fasskeule',chance:.15}]},
 timo:{material:'jga-shirt',materialChance:.6,gearChance:.85,unique:'schaerpe',uniqueChance:.16,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 // --- Dungeon „Schloss Big B" (E-71, Etappe 1): eigene Tabellen statt der geliehenen Sigi- und Praktikanten-Beute ---
 // Gerd: Boss-Beute mit hoher Güte (rareChance) und Dorflegende „Die Gästeliste" (Plan Abschnitt 11: 15 %). Fällt dabei kein
 // Ausrüstungsteil, legt der Dungeon ein seltenes nach (rpg.js dungeonBossBonus) – ein Boss geht nie leer aus.
 // items = Vorschau für Journal und Eingangskarte (Etappe 2 liest sie über bossLoot); gewürfelt wird nur über die Felder daneben.
 gerd:{items:['gaesteliste','kabelbinder','currywurst'],material:'kabelbinder',materialChance:.6,gearChance:.85,rareChance:.6,unique:'gaesteliste',uniqueChance:.15,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 // Trash im Schloss: Security-Azubis, Makler-Praktikanten, Baumarkt-Ritter, Pappschützen, Pfandratten. Flugblätter (Exposés)
 // als Material; die Dorflegende ist der Praktikantenausweis, den die Azubis am Band tragen (selten).
 schlosstrash:{material:'flugblatt',materialChance:.35,gearChance:.16,unique:'praktikantenausweis',uniqueChance:.01,coinsChance:.6,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 // Big B (Etappe 3, Plan 11): zwei Dorflegenden je 12 % – Siegelring „Echt Gold" (unique) und Pelzmantel des Barons (uniques, eigene
 // Chance je Eintrag, itemization.js rollDrop). Kronkorken als Material (die Goldkette ist daraus). Fällt kein Teil, legt der Dungeon ein
 // seltenes nach (wie bei Gerd); dazu kommt die Endtruhe mit Wahl in der Schatzkammer.
 bigb:{items:['siegelring-echtgold','pelzmantel-baron','kronkorken'],material:'kronkorken',materialChance:.7,gearChance:.9,rareChance:.7,unique:'siegelring-echtgold',uniqueChance:.12,
  uniques:[{id:'pelzmantel-baron',chance:.12}],coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 // Etappe 4 Teil A (E-71, Plan 11): eigene Tabellen der restlichen Schlossbosse, je eine Dorflegende zu 15 %. Fällt kein Teil, legt der
 // Dungeon ein seltenes nach (wie bei Gerd). Das halbe Pferd: immer Hafersäcke (Material, zehn ergeben am Fahrstall das Reittier) und
 // zu mountChance das Reittier selbst (dungeon.js grantMount; V-D8 geändert: 3 % plus Hafersack-Garantie).
 expose:{items:['hochglanz-expose','flugblatt','currywurst'],material:'flugblatt',materialChance:.6,gearChance:.85,rareChance:.6,unique:'hochglanz-expose',uniqueChance:.15,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 korkenkurt:{items:['korkenzieher-kellermeister','kronkorken','kaltgetraenk'],material:'kronkorken',materialChance:.6,gearChance:.85,rareChance:.6,unique:'korkenzieher-kellermeister',uniqueChance:.15,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 rita:{items:['ringlicht-reichweite','kabel','kaltgetraenk'],material:'kabel',materialChance:.6,gearChance:.85,rareChance:.6,unique:'ringlicht-reichweite',uniqueChance:.15,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket','charm']},
 halbespferd:{items:['hafersack','halbes-hufeisen'],material:'hafersack',materialChance:.95,mount:'halbespferd',mountChance:.03,gearChance:.6,rareChance:.5,unique:'halbes-hufeisen',uniqueChance:.08,coinsChance:.5,slots:['weapon','head','shoulders','body','hands','waist','legs','feet','ring','trinket','charm']}
};
/** Verpflegung, die menschliche Gegner und Bosse zusätzlich fallen lassen können. */
export const FOOD_DROPS={warden:'brezel',scrounger:'kaltgetraenk',inspector:'brezel',oberpraktikant:'brezel',horst:'brezel',gisela:'currywurst',automat:'kaltgetraenk',kegler:'brezel',jga:'kaltgetraenk',sigi:'currywurst',klaus:'brezel',timo:'kaltgetraenk',gerd:'currywurst',schlosstrash:'brezel',bigb:'kaltgetraenk',expose:'currywurst',korkenkurt:'kaltgetraenk',rita:'kaltgetraenk'};
