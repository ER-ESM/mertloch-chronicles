import {PROFESSION_ITEMS} from './professions.js';
import {HOTSPOT_ITEMS} from './hotspots.js';
// Gegenstandskatalog. IDs sind Speicherschlüssel: nie umbenennen, nie löschen – höchstens `retired:true` setzen.
// Felder: name, slot (Ausrüstungskategorie aus SLOTS) ODER kind (consumable|material), rarity, icon (siehe ICONS),
// level (Mindeststufe), stats {stamina,might,finesse,wit,armorRating} (E-53),
// weapon {type,hands,min,max}: Hände 0 = Fernkampf, 1 = Einhand, 2 = Zweihand; shield:true = Nebenhandschild.
// heal/energy (Verpflegung; energy = Ressourcenpunkte, die Engine rechnet sie je Klasse um – E-72, content/resources.js), stack, value (Pfandmarken), unique, proc (Effekt-ID aus PROCS), description, look (Bildhinweis).
// usable:true = benutzbar und damit für die Aktionsleiste zugelassen (heute genau die Verpflegung; Engine/UI setzen es um).
// Erweiterte Beschreibungen (info: effect/numbers/why/links/terms) stehen in content/item-info.js und hängen sich dort an.
import {ITEM_ICON_OVERRIDES,DETAIL_ICONS} from './item-icons.js';
import {EQUIPMENT_SLOTS,WEAPON_TYPES} from './equipment.js';
export const ICONS=[...DETAIL_ICONS,'anni-spray','helmet','necklace','shoulders','bracers','gloves','belt','trousers','trinket','blade','maul','slingshot','bottle','water','coat','food','boots','ring','paper','cable','scrap','reinforced','shield','sound','speaker','burst','bag','book','map'];
export const SLOTS={...EQUIPMENT_SLOTS,ring:'Ring',trinket:'Glücksbringer',charm:'Talisman'};
export const RARITIES={common:'Gewöhnlich',uncommon:'Ungewöhnlich',rare:'Selten',epic:'Dorflegende'};
/** Passive Effekte einzigartiger Gegenstände. Die Wirkung steht in engine.js / class-mechanics.js; hier nur Beschreibung und Zahlen. */
export const PROCS={
 rage:{text:'Glückstreffer geben 4 Ressourcenpunkte zurück.',energy:4},
 fleet:{text:'Ausweichen wird 15 % schneller bereit.',dashCd:.15},
 stout:{text:'8 % weniger Schaden bei weniger als 35 % Leben.',reduction:.08},
 silence:{text:'Unterbrechen lädt 10 zusätzliche Ressourcenpunkte.',energy:10},
 verdict:{text:'Markierte Ziele erleiden weitere 10 % Schaden.',bonus:.1},
 thirst:{text:'Jeder Kill gibt 20 Ressourcenpunkte zurück.',energy:20},
 hops:{text:'Außerhalb des Kampfes regenerierst du doppelt so schnell.',regen:2}
};
export const ITEM_CATALOG={
 // --- Startausrüstung ---
 topfdeckel:{look:'Runder verbeulter Topfdeckel mit Holzgriff, dicke Konturen und Honiglicht',name:'Omas unzerstörbarer Topfdeckel',slot:'offhand',shield:true,rarity:'common',icon:'shield',stats:{armorRating:1},value:3,description:'Ein Schild mit Suppengeschichte. Schaltet Schildparaden frei.'},
 pfandschleuder:{look:'Astgabel aus Holz, Kabelbinder und gespannte Gummischlinge',name:'Kabelbinder-Pfandschleuder',slot:'ranged',weapon:{type:'launcher',hands:0,min:14,max:20},rarity:'common',icon:'slingshot',value:3,description:'Grundausstattung für Fernkampf. Keine Munition nötig; das Leergut kommt von allein.'},
 dosenklinge:{look:'Entgratete silbergrüne Dosenklinge mit kurzem Ledergriff',name:'Entgratete Dosenklinge',slot:'weapon',weapon:{type:'blade',hands:1,min:12,max:22},rarity:'common',icon:'blade',value:3,description:'Einhand. Auch in der Nebenhand: trägt 50 % ihres Schadens zu Nahkampfkniffen bei.'},
 tresenhammer:{look:'Schwerer rechteckiger Tresenhammer mit Holzstiel und Messingbeschlägen',name:'Abmontierter Tresenhammer',slot:'weapon',weapon:{type:'maul',hands:2,min:21,max:30},rarity:'common',icon:'maul',value:4,description:'Zweihand. Beide Hände voll Abriss; für einen Schild ist kein Platz.'},
 flasche:{weapon:{type:'club',hands:1,min:14,max:20},name:'Bewährte Mehrwegflasche',slot:'weapon',rarity:'common',icon:'bottle',value:2,stats:{might:1},description:'Schon mit Opa auf dem Dorffest gewesen.'},
 kutte:{name:'Abgewetzte Clanjacke',slot:'body',rarity:'common',icon:'coat',value:2,stats:{armorRating:1},description:'Riecht nach Heimat. Und Rauch.'},
 // --- Verpflegung ---
 brezel:{name:'Notfallbrezel',kind:'consumable',usable:true,rarity:'common',icon:'food',heal:160,stack:10,value:3,price:12,description:'160 Leben, auch im Kampf. Erst kauen, dann weiterpöbeln.'},
 wasser:{name:'Konterwasser',kind:'consumable',usable:true,rarity:'common',icon:'water',energy:40,stack:10,value:3,price:12,description:'40 Ressourcenpunkte – Randale, Likes, Leergut, Glut oder Augen. Verdächtig alkoholfrei.'},
 currywurst:{name:'Oskars Currywurst',kind:'consumable',usable:true,rarity:'uncommon',icon:'food',heal:240,energy:20,stack:5,value:6,price:40,level:3,description:'240 Leben und 20 Ressourcenpunkte. Die Soße ist ein Familiengeheimnis und ein Verstoß gegen die Lebensmittelverordnung.',look:'Pappschale mit Currywurst, rote Soße, Holzpieker'},
 kaltgetraenk:{name:'Eiskaltes Kaltgetränk',kind:'consumable',usable:true,rarity:'uncommon',icon:'water',energy:70,stack:5,value:5,price:28,level:2,description:'70 Ressourcenpunkte. Auf dem Etikett steht nur „Ja“.',look:'Beschlagene Dose ohne Marke, Kondenswasser, gelbes Etikett'},
 pfandbon:{name:'Pfandbon-Bündel',kind:'consumable',usable:true,rarity:'uncommon',icon:'paper',energy:20,stack:5,value:14,price:35,level:4,description:'20 Ressourcenpunkte und 60 s lang dreifache Pfandmarken beim nächsten Kill. Kalle nimmt seine eigenen Bons zurück. Ungern.',look:'Bündel zerknitterter Pfandbons mit Gummiband, oberster Bon zeigt „3×“'},
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
 kabelbinder:{name:'Dienstlicher Kabelbinder',kind:'material',rarity:'common',icon:'cable',stack:99,value:2,description:'Er hat sie dutzendweise dabei. Keiner weiß, wofür.',look:'Weißer Kabelbinder mit Amtsstempel auf dem Kopf, aufgerollt'},
 // --- Akt 1: Baumaterial und Beweise ---
 palettenholz:{name:'Trockenes Palettenholz',kind:'material',rarity:'common',icon:'scrap',stack:99,value:2,description:'Europalette, drei Bretter noch dran. Dieter nennt das „tragende Struktur“.',look:'Zerbrochenes Palettenbrett mit rostigem Nagel und EUR-Stempel'},
 'jga-shirt':{name:'Verschwitztes GAME-OVER-Shirt',kind:'material',rarity:'common',icon:'coat',stack:99,value:1,description:'Weiß war es mal. Größe S, getragen von XL. Beweismittel Nummer eins – und Putzlappen Nummer zwei.',look:'Zerknülltes weißes T-Shirt mit schwarzem Aufdruck „GAME OVER“, Bierflecken'},
 // --- Feste Ausrüstung ---
 dosenbrecher:{weapon:{type:'club',hands:1,min:17,max:24},name:'Dosenbrecher',slot:'weapon',rarity:'uncommon',icon:'reinforced',level:2,value:18,stats:{might:2,finesse:1},description:'Verstärkte Mehrwegtechnik für mehr Wumms und bessere Glückstreffer.'},
 regenjacke:{name:'Festival-Regenjacke',slot:'body',rarity:'uncommon',icon:'coat',level:1,value:16,stats:{stamina:1,armorRating:1},description:'Hält Regen und schlechte Entscheidungen ab.'},
 festivalstiefel:{name:'Matschfeste Festivalstiefel',slot:'feet',rarity:'uncommon',icon:'boots',level:1,value:14,stats:{finesse:2},description:'Erprobt auf dem schlimmsten Zeltplatz der Eifel.'},
 pfandring:{name:'Ring der ewigen Rückgabe',slot:'ring',rarity:'rare',icon:'ring',level:2,value:32,stats:{wit:4},description:'Der Pfand kommt immer zurück.'},
 hausordnung:{name:'Horsts gelochte Hausordnung',slot:'trinket',rarity:'rare',icon:'paper',level:1,value:50,stats:{wit:2},description:'Endlich zu etwas gut. Ein Andenken an Horsts Niederlage.'},
 bierdeckelweste:{name:'Bierdeckel-Panzerweste',slot:'body',rarity:'rare',icon:'coat',level:5,value:44,stats:{stamina:2,might:1,armorRating:4},description:'Dreihundert Deckel, doppelt geklebt. Dieter nennt es Baugenehmigung.',look:'Weste aus lauter Bierdeckeln, Klebeband an den Nähten'},
 kabelbinderstiefel:{name:'Kabelbinder-Stiefel',slot:'feet',rarity:'rare',icon:'boots',level:4,value:38,stats:{finesse:4,wit:1,armorRating:1},description:'Kevin hat sie „gefixt“. Sie quietschen jetzt im Takt.',look:'Gummistiefel mit bunten Kabelbindern'},
 megafon:{weapon:{type:'speaker',hands:0,min:21,max:34},name:'Annis Hygiene-Hochdruckspray',slot:'ranged',rarity:'rare',icon:'sound',level:6,value:52,stats:{finesse:5,wit:3},description:'Entfernt Flecken, Freundschaften und Rückgaberechte. Nur noch drei Vorführungen bis zur goldenen Vertriebskrone.',look:'Grüne Pumpsprayflasche mit goldenem Provisionsanhänger'},
 // --- Werkbank: gebaute Talismane (schwächer als gewürfelte Seltene derselben Stufe) ---
 kabeltalisman:{name:'Kabelbinder-Talisman',slot:'charm',rarity:'uncommon',icon:'cable',level:4,value:20,stats:{wit:2,stamina:1,finesse:2},description:'Kevins Werkbank, Stufe 2. Sechs Kabel, vier Kronkorken, null Garantie.',look:'Geflochtener Anhänger aus bunten Kabelbindern mit Kronkorken in der Mitte'},
 blechtalisman:{name:'Dosenblech-Talisman',slot:'charm',rarity:'uncommon',icon:'metal',level:8,value:36,stats:{might:2,stamina:2,wit:1,finesse:3},description:'Kevins Werkbank, Stufe 3. Gehämmertes Dosenblech mit Borsten als Fransen.',look:'Gehämmerte Blechscheibe mit Keilerborsten am Rand, Flugblattschnipsel eingeklebt'},
 // --- Dorflegenden (einzigartig, mit Effekt) ---
 keilerzahn:{look:'Gebogener gelber Hauer an einer Lederschnur, Kerbe an der Spitze',name:'Hauers letzter Zahn',slot:'charm',rarity:'epic',icon:'ring',level:2,stats:{might:2,stamina:1,finesse:2},unique:true,proc:'rage',description:'Selten aus Pfandkeilern: Glückstreffer geben 4 Ressourcenpunkte zurück.'},
 gansorden:{look:'Blecherner Orden mit Gänsekopf-Prägung an rot-weißem Band',name:'Orden der unverschämten Gans',slot:'charm',rarity:'epic',icon:'paper',level:1,stats:{finesse:4},unique:true,proc:'fleet',description:'Selten aus Grillgut-Gänsen: Ausweichen wird 15 % schneller bereit.'},
 dachsdeckel:{look:'Zerzauste Dachsfellmütze mit Schnauze als Schirm',name:'Dachsdeckel des Unbeugsamen',slot:'charm',rarity:'epic',icon:'shield',level:1,stats:{stamina:2,armorRating:2},unique:true,proc:'stout',description:'Selten aus Pfanddachsen: 8 % weniger Schaden bei weniger als 35 % Leben.'},
 ruhepfeife:{look:'Verchromte Trillerpfeife mit Gravur „22:01“ an einer Kordel',weapon:{type:'speaker',hands:0,min:21,max:35},name:'Trillerpfeife der Ruhestörung',slot:'ranged',rarity:'epic',icon:'sound',level:2,stats:{wit:4,finesse:1},unique:true,proc:'silence',description:'Selten aus Ruhewärtern: Unterbrechen lädt 10 zusätzliche Ressourcenpunkte.'},
 horststempel:{look:'Schwerer Bürostempel mit Holzgriff, Stempelplatte „ABGELEHNT“',weapon:{type:'maul',hands:2,min:33,max:47},name:'Horsts endgültige Ablehnung',slot:'weapon',rarity:'epic',icon:'reinforced',level:3,stats:{might:2,finesse:3,wit:2},unique:true,proc:'verdict',description:'Selten von Horst. Markierte Ziele erleiden weitere 10 % Schaden. Der Stempel sagt NEIN.'},
 fuchspfote:{name:'Glückspfote des Pfandfuchses',slot:'feet',rarity:'epic',icon:'boots',level:3,stats:{finesse:5,stamina:1,armorRating:1},unique:true,proc:'fleet',description:'Selten aus Pfandfüchsen: Ausweichen wird 15 % schneller bereit. Der Fuchs vermisst sie.',look:'Rostrote Pfote als Anhänger an einem Stiefel'},
 schnorrerbecher:{name:'Der nie leere Schnorrerbecher',slot:'charm',rarity:'epic',icon:'water',level:3,stats:{wit:5,stamina:2},unique:true,proc:'thirst',description:'Selten aus Festzelt-Schnorrern: Jeder Kill gibt 20 Ressourcenpunkte zurück. Irgendjemand zahlt immer.',look:'Zerkratzter Plastikbecher mit Pfandaufkleber'},
 praktikantenausweis:{name:'Laminierter Praktikantenausweis',slot:'charm',rarity:'epic',icon:'paper',level:4,stats:{wit:5,finesse:4},unique:true,proc:'verdict',description:'Selten aus Ordnungsamt-Praktikanten: Markierte Ziele erleiden weitere 10 % Schaden. „Bin nur Praktikant.“',look:'Laminierter Ausweis mit Passbild und Schnur'}, gaesteliste:{look:'Klemmbrett mit leerer Gästeliste, Kugelschreiber an einer Schnur, Aufkleber „VIP“ halb abgekratzt',name:'Die Gästeliste',slot:'charm',rarity:'epic',icon:'paper',level:9,stats:{wit:6,finesse:6,stamina:5},unique:true,proc:'silence',description:'Selten von Gästeliste-Gerd im Schloss Big B: Unterbrechen füllt zusätzlich deine Klassenressource. „Du stehst auf jeder Liste. Auf keiner steht was.“'},
 dienstmuetze:{name:'Olafs Dienstmütze',slot:'head',rarity:'epic',icon:'helmet',level:4,stats:{stamina:2,wit:2,finesse:3,armorRating:2},unique:true,proc:'silence',description:'Selten von Oberpraktikant Olaf: Unterbrechen lädt 10 zusätzliche Ressourcenpunkte. Zwei Nummern zu groß, ein Vermerk zu viel.',look:'Graue Dienstmütze mit steifem Schirm, silbernes Ordnungsamt-Abzeichen, innen Namensschild „i. A. Olaf“, Schweißrand'},
 // --- Akt 1: Dorflegenden ---
 kegelkugel:{name:'Die Kugel vom Dorfpokal 2011',slot:'charm',rarity:'epic',icon:'reinforced',level:3,stats:{might:3,stamina:2,finesse:2},unique:true,proc:'rage',description:'Selten aus Kegelbrüdern: Glückstreffer geben 4 Ressourcenpunkte zurück. Dieter hat sie „nur ausgeliehen“. Seit 2011.',look:'Schwere schwarze Kegelkugel mit drei Löchern und eingeritztem „PT 2011“'},
 bierbong:{name:'Bierbong des Junggesellen',slot:'charm',rarity:'epic',icon:'water',level:4,stats:{might:3,stamina:3,finesse:3},unique:true,proc:'thirst',description:'Selten aus Junggesellen: Jeder Kill gibt 20 Ressourcenpunkte zurück. Trichter, Schlauch, null Würde.',look:'Roter Trichter mit durchsichtigem Schlauch, Aufkleber „BASTIANS LETZTE NACHT“'},
 sigizange:{weapon:{type:'maul',hands:2,min:36,max:50},name:'Sigis Greifzange',slot:'weapon',rarity:'epic',icon:'reinforced',level:5,stats:{might:3,stamina:3,wit:5},unique:true,proc:'stout',description:'Selten von Sigi. 8 % weniger Schaden bei weniger als 35 % Leben. Greift alles. Gibt nichts zurück.',look:'Verrostete Schrott-Greifzange mit Holzgriff und Kette, ölige Backen'},
 koenigskette:{name:'Die Kegelkönig-Kette',slot:'charm',rarity:'epic',icon:'necklace',level:6,stats:{finesse:8,wit:3,stamina:2},unique:true,proc:'rage',description:'Selten von Klaus. Glückstreffer geben 4 Ressourcenpunkte zurück. Vergoldet, Plakette „2011 – ABERKANNT“.',look:'Goldene Kette mit Kegel-Anhänger und kleiner Plakette, ein Glied geflickt'},
 schaerpe:{name:'Die Schärpe der Wahrheit',slot:'charm',rarity:'epic',icon:'coat',level:7,stats:{stamina:4,might:3,finesse:7},unique:true,proc:'fleet',description:'Selten von Timo. Ausweichen wird 15 % schneller bereit. Aufdruck „TRAUZEUGE“, Rückseite mit Edding: „UND DU?“',look:'Rote Satin-Schärpe mit Goldschrift „TRAUZEUGE“, Bierflecken, Edding auf der Rückseite'},
 giesskanne:{weapon:{type:'maul',hands:2,min:37,max:53},name:'Giselas Gießkanne der Gerechtigkeit',slot:'weapon',rarity:'epic',icon:'water',level:6,stats:{might:4,wit:7,stamina:2},unique:true,proc:'hops',description:'Selten von Gisela. Außerhalb des Kampfes regenerierst du doppelt so schnell. Innen: Hopfen, kein Wasser.',look:'Grüne Blechgießkanne mit Vereinsaufkleber „Ruhe 22:01“'},
 automatenarm:{name:'Greifarm des Pfandautomaten',slot:'charm',rarity:'epic',icon:'reinforced',level:9,stats:{might:4,finesse:8,wit:4,stamina:2},unique:true,proc:'thirst',description:'Selten vom Pfandautomaten 3000. Jeder Kill gibt 20 Ressourcenpunkte zurück. Nimmt weiterhin keine Dosen an.',look:'Verchromter Roboter-Greifarm mit blinkender LED'}
};
Object.assign(ITEM_CATALOG,PROFESSION_ITEMS,HOTSPOT_ITEMS);
for(const d of Object.values(PROFESSION_ITEMS))d.look=d.description;
for(const [id,icon] of Object.entries(ITEM_ICON_OVERRIDES))ITEM_CATALOG[id].icon=icon;
// Balancing-Korrekturen (content/tuning.js): Loot definiert Gegenstände, Balancing korrigiert Zahlen darüber.
import {TUNING,applyTuning} from './tuning.js';
applyTuning(ITEM_CATALOG,TUNING.items);
for(const item of Object.values(ITEM_CATALOG))if(item.weapon)item.weapon.speed??=WEAPON_TYPES[item.weapon.type].speed;
