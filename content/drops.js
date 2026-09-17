// Beutetabellen je Gegnerfamilie (Feld `family` des Gegners, siehe enemies.js).
// Jede Zeile ist eine eigene Wahrscheinlichkeit; ein Gegner kann auch nichts fallen lassen.
// material: Material-ID aus items.js · gearChance: gewürfelte Ausrüstung (slots) · unique: Dorflegende · coinsChance: Pfandmarken.
export const DROP_TABLES={
 boar:{material:'borste',materialChance:.42,gearChance:.08,unique:'keilerzahn',uniqueChance:.008,coinsChance:0,slots:['charm']},
 goose:{material:'feder',materialChance:.38,gearChance:.04,unique:'gansorden',uniqueChance:.006,coinsChance:0,slots:['charm']},
 badger:{material:'dachsfell',materialChance:.4,gearChance:.06,unique:'dachsdeckel',uniqueChance:.008,coinsChance:0,slots:['charm']},
 warden:{material:'kabel',materialChance:.32,gearChance:.2,unique:'ruhepfeife',uniqueChance:.012,coinsChance:.7,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 horst:{material:'hausordnung',materialChance:.5,gearChance:.85,unique:'horststempel',uniqueChance:.12,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
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
 kegler:{material:'kabel',materialChance:.4,gearChance:.18,unique:'kegelkugel',uniqueChance:.012,coinsChance:.6,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 jga:{material:'jga-shirt',materialChance:.55,gearChance:.2,unique:'bierbong',uniqueChance:.012,coinsChance:.5,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 sigi:{material:'palettenholz',materialChance:.6,gearChance:.85,unique:'sigizange',uniqueChance:.14,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 klaus:{material:'kabel',materialChance:.5,gearChance:.85,unique:'koenigskette',uniqueChance:.14,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']},
 timo:{material:'jga-shirt',materialChance:.6,gearChance:.85,unique:'schaerpe',uniqueChance:.16,coinsChance:.9,slots:['weapon','offhand','ranged','head','neck','shoulders','body','wrists','hands','waist','legs','feet','ring','trinket']}
};
/** Verpflegung, die menschliche Gegner und Bosse zusätzlich fallen lassen können. */
export const FOOD_DROPS={warden:'brezel',scrounger:'kaltgetraenk',inspector:'brezel',oberpraktikant:'brezel',horst:'brezel',gisela:'currywurst',automat:'kaltgetraenk',kegler:'brezel',jga:'kaltgetraenk',sigi:'currywurst',klaus:'brezel',timo:'kaltgetraenk'};
