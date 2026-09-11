// Gegenstandskatalog. IDs sind Speicherschlüssel: nie umbenennen, nie löschen – höchstens `retired:true` setzen.
// Felder: name, slot (weapon|body|feet|charm) ODER kind (consumable|material), rarity, icon (siehe ICONS),
// level (Mindeststufe), stats {stamina,might,finesse,wit,armorRating,critRating,hasteRating,masteryRating},
// heal/energy (Verpflegung), stack, value (Pfandmarken), unique, proc (Effekt-ID aus PROCS), description, look (Bildhinweis).
export const ICONS=['bottle','water','coat','food','boots','ring','paper','cable','scrap','reinforced','shield','sound','speaker','burst','bag','book','map'];
export const SLOTS={weapon:'Waffe',body:'Körper',feet:'Füße',charm:'Talisman'};
export const RARITIES={common:'Gewöhnlich',uncommon:'Ungewöhnlich',rare:'Selten',epic:'Dorflegende'};
/** Passive Effekte einzigartiger Gegenstände. Die Wirkung steht in engine.js / class-mechanics.js; hier nur Beschreibung und Zahlen. */
export const PROCS={
 rage:{text:'Glückstreffer geben 4 Randale zurück.',energy:4},
 fleet:{text:'Ausweichen wird 15 % schneller bereit.',dashCd:.15},
 stout:{text:'8 % weniger Schaden bei weniger als 35 % Leben.',reduction:.08},
 silence:{text:'Unterbrechen lädt 10 zusätzliche Randale.',energy:10},
 verdict:{text:'Markierte Ziele erleiden weitere 10 % Schaden.',bonus:.1},
 thirst:{text:'Jeder Kill gibt 20 Randale zurück.',energy:20},
 hops:{text:'Außerhalb des Kampfes regenerierst du doppelt so schnell.',regen:2}
};
export const ITEM_CATALOG={
 // --- Startausrüstung ---
 flasche:{name:'Bewährte Mehrwegflasche',slot:'weapon',rarity:'common',icon:'bottle',value:2,stats:{might:1},description:'Schon mit Opa auf dem Dorffest gewesen.'},
 kutte:{name:'Abgewetzte Clankutte',slot:'body',rarity:'common',icon:'coat',value:2,stats:{stamina:1,armorRating:4},description:'Riecht nach Heimat. Und Rauch.'},
 // --- Verpflegung ---
 brezel:{name:'Notfallbrezel',kind:'consumable',rarity:'common',icon:'food',heal:160,stack:10,value:3,description:'160 Leben. Erst kauen, dann weiterpöbeln.'},
 wasser:{name:'Konterwasser',kind:'consumable',rarity:'common',icon:'water',energy:40,stack:10,value:3,description:'40 Randale. Verdächtig alkoholfrei.'},
 currywurst:{name:'Oskars Currywurst',kind:'consumable',rarity:'uncommon',icon:'food',heal:240,energy:20,stack:5,value:6,level:3,description:'240 Leben und 20 Randale. Die Soße ist ein Familiengeheimnis und ein Verstoß gegen die Lebensmittelverordnung.',look:'Pappschale mit Currywurst, rote Soße, Holzpieker'},
 kaltgetraenk:{name:'Eiskaltes Kaltgetränk',kind:'consumable',rarity:'uncommon',icon:'water',energy:70,stack:5,value:5,level:2,description:'70 Randale. Auf dem Etikett steht nur „Ja“.',look:'Beschlagene Dose ohne Marke, Kondenswasser, gelbes Etikett'},
 // --- Material ---
 kronkorken:{name:'Verbogene Kronkorken',kind:'material',rarity:'common',icon:'scrap',stack:99,value:1,description:'Irgendwann wird Kevin daraus etwas bauen.'},
 kabel:{name:'Brauchbares Kabel',kind:'material',rarity:'common',icon:'cable',stack:99,value:2,description:'Passt garantiert irgendwo rein.'},
 borste:{name:'Sture Keilerborste',kind:'material',rarity:'common',icon:'scrap',stack:99,value:2,description:'Selbst die Haare wollen Streit.'},
 feder:{name:'Freche Gänsefeder',kind:'material',rarity:'common',icon:'paper',stack:99,value:2,description:'Hat vermutlich schon jemanden angezeigt.'},
 dachsfell:{name:'Zerzaustes Dachsfell',kind:'material',rarity:'common',icon:'coat',stack:99,value:3,description:'Für einen sehr kleinen, sehr schlecht gelaunten Mantel.'},
 fuchsschwanz:{name:'Buschiger Fuchsschwanz',kind:'material',rarity:'common',icon:'coat',stack:99,value:3,description:'Der Fuchs hat ihn freiwillig abgegeben. Sagt der Fuchs.',look:'Rostroter Fuchsschwanz mit weißer Spitze'},
 flugblatt:{name:'Flugblatt von Ruhe 22:01',kind:'material',rarity:'common',icon:'paper',stack:99,value:1,description:'„Lärm ist Gewalt.“ Rückseite: Grillrezept von Oskar, handschriftlich.',look:'Zerknittertes Flugblatt mit rotem Stempel'},
 hopfen:{name:'Wilder Eifelhopfen',kind:'material',rarity:'uncommon',icon:'scrap',stack:99,value:4,description:'Wächst nur dort, wo Gisela nicht hinkommt.',look:'Grüne Hopfendolde mit Ranke'},
 dosenblech:{name:'Verbeultes Dosenblech',kind:'material',rarity:'common',icon:'scrap',stack:99,value:2,description:'Vom Pfandautomaten ausgespuckt. Aus Prinzip.',look:'Zerknautschtes Aluminiumblech'},
 // --- Feste Ausrüstung ---
 dosenbrecher:{name:'Dosenbrecher',slot:'weapon',rarity:'uncommon',icon:'reinforced',level:2,value:18,stats:{might:8,critRating:10},description:'Verstärkte Mehrwegtechnik für mehr Wumms und bessere Glückstreffer.'},
 regenjacke:{name:'Festival-Regenjacke',slot:'body',rarity:'uncommon',icon:'coat',level:1,value:16,stats:{stamina:8,armorRating:32},description:'Hält Regen und schlechte Entscheidungen ab.'},
 festivalstiefel:{name:'Matschfeste Festivalstiefel',slot:'feet',rarity:'uncommon',icon:'boots',level:1,value:14,stats:{finesse:6,hasteRating:12,armorRating:12},description:'Erprobt auf dem schlimmsten Zeltplatz der Eifel.'},
 pfandring:{name:'Ring der ewigen Rückgabe',slot:'charm',rarity:'rare',icon:'ring',level:2,value:32,stats:{wit:8,masteryRating:15},description:'Der Pfand kommt immer zurück.'},
 hausordnung:{name:'Horsts gelochte Hausordnung',slot:'charm',rarity:'rare',icon:'paper',level:1,value:50,stats:{wit:12,stamina:8,masteryRating:22},description:'Endlich zu etwas gut. Ein Andenken an Horsts Niederlage.'},
 bierdeckelweste:{name:'Bierdeckel-Panzerweste',slot:'body',rarity:'rare',icon:'coat',level:5,value:44,stats:{stamina:14,might:6,armorRating:60},description:'Dreihundert Deckel, doppelt geklebt. Dieter nennt es Baugenehmigung.',look:'Weste aus lauter Bierdeckeln, Klebeband an den Nähten'},
 kabelbinderstiefel:{name:'Kabelbinder-Stiefel',slot:'feet',rarity:'rare',icon:'boots',level:4,value:38,stats:{finesse:9,wit:5,hasteRating:22,armorRating:20},description:'Kevin hat sie „gefixt“. Sie quietschen jetzt im Takt.',look:'Gummistiefel mit bunten Kabelbindern'},
 megafon:{name:'Bärbels Notfall-Megafon',slot:'weapon',rarity:'rare',icon:'sound',level:6,value:52,stats:{finesse:11,wit:9,critRating:18,masteryRating:12},description:'Reichweite bis zum Bauamt. Batterie hält für genau eine Zugabe.',look:'Rotes Megafon mit Aufkleber „LAUT“'},
 // --- Dorflegenden (einzigartig, mit Effekt) ---
 keilerzahn:{name:'Hauers letzter Zahn',slot:'charm',rarity:'epic',icon:'ring',level:2,stats:{might:14,stamina:9,critRating:20},unique:true,proc:'rage',description:'Selten aus Pfandkeilern: Glückstreffer geben 4 Randale zurück.'},
 gansorden:{name:'Orden der unverschämten Gans',slot:'charm',rarity:'epic',icon:'paper',level:1,stats:{finesse:12,hasteRating:20},unique:true,proc:'fleet',description:'Selten aus Grillgut-Gänsen: Ausweichen wird 15 % schneller bereit.'},
 dachsdeckel:{name:'Dachsdeckel des Unbeugsamen',slot:'charm',rarity:'epic',icon:'shield',level:1,stats:{stamina:14,armorRating:45},unique:true,proc:'stout',description:'Selten aus Pfanddachsen: 8 % weniger Schaden bei weniger als 35 % Leben.'},
 ruhepfeife:{name:'Trillerpfeife der Ruhestörung',slot:'weapon',rarity:'epic',icon:'sound',level:2,stats:{wit:15,masteryRating:24,critRating:12},unique:true,proc:'silence',description:'Selten aus Ruhewärtern: Unterbrechen lädt 10 zusätzliche Randale.'},
 horststempel:{name:'Horsts endgültige Ablehnung',slot:'weapon',rarity:'epic',icon:'reinforced',level:3,stats:{might:18,finesse:18,wit:18,critRating:25},unique:true,proc:'verdict',description:'Selten von Horst. Markierte Ziele erleiden weitere 10 % Schaden. Der Stempel sagt NEIN.'},
 fuchspfote:{name:'Glückspfote des Pfandfuchses',slot:'feet',rarity:'epic',icon:'boots',level:3,stats:{finesse:14,stamina:6,hasteRating:24,armorRating:18},unique:true,proc:'fleet',description:'Selten aus Pfandfüchsen: Ausweichen wird 15 % schneller bereit. Der Fuchs vermisst sie.',look:'Rostrote Pfote als Anhänger an einem Stiefel'},
 schnorrerbecher:{name:'Der nie leere Schnorrerbecher',slot:'charm',rarity:'epic',icon:'water',level:3,stats:{wit:13,stamina:10,masteryRating:18},unique:true,proc:'thirst',description:'Selten aus Festzelt-Schnorrern: Jeder Kill gibt 20 Randale zurück. Irgendjemand zahlt immer.',look:'Zerkratzter Plastikbecher mit Pfandaufkleber'},
 praktikantenausweis:{name:'Laminierter Praktikantenausweis',slot:'charm',rarity:'epic',icon:'paper',level:4,stats:{wit:16,finesse:10,critRating:16,masteryRating:14},unique:true,proc:'verdict',description:'Selten aus Ordnungsamt-Praktikanten: Markierte Ziele erleiden weitere 10 % Schaden. „Bin nur Praktikant.“',look:'Laminierter Ausweis mit Passbild und Schnur'},
 giesskanne:{name:'Giselas Gießkanne der Gerechtigkeit',slot:'weapon',rarity:'epic',icon:'water',level:6,stats:{might:20,wit:20,stamina:12,masteryRating:28},unique:true,proc:'hops',description:'Selten von Gisela. Außerhalb des Kampfes regenerierst du doppelt so schnell. Innen: Hopfen, kein Wasser.',look:'Grüne Blechgießkanne mit Vereinsaufkleber „Ruhe 22:01“'},
 automatenarm:{name:'Greifarm des Pfandautomaten',slot:'charm',rarity:'epic',icon:'reinforced',level:9,stats:{might:22,finesse:22,wit:22,stamina:14,critRating:30},unique:true,proc:'thirst',description:'Selten vom Pfandautomaten 3000. Jeder Kill gibt 20 Randale zurück. Nimmt weiterhin keine Dosen an.',look:'Verchromter Roboter-Greifarm mit blinkender LED'}
};
