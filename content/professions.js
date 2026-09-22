// First profession tier; stable IDs, deliberately small recipes and adjustable launch values.
export const PROFESSION_RULES={slots:2,cap:75,level:3,learnCost:10,range:42,gatherSeconds:2,craftSeconds:3,windowMs:45000,regrowMs:180000,graceMs:8000,pollMs:1800,recipeFee:2};
export const PROFESSIONS={
 scrap:{name:'Schrottsammeln',kind:'gather',icon:'scrap',teacher:'Schrott-Sigi',station:'werkhof',description:'Dosenblech und brauchbare Kabel aus Schrotthaufen bergen.'},
 herbs:{name:'Kräutersammeln',kind:'gather',icon:'water',teacher:'Kräuter-Gisela',station:'braugarten',description:'Feldkräuter und wilden Eifelhopfen an den Dorfwegen sammeln.'},
 smith:{name:'Schrauberei',kind:'craft',icon:'reinforced',teacher:'Schrauber-Willi',station:'werkhof',description:'Aus geborgenem Metall Waffen und eine robuste Weste bauen.'},
 brew:{name:'Hausbrauerei',kind:'craft',icon:'bottle',teacher:'Braumeisterin Bärbel',station:'braugarten',description:'Alkoholfreie Heil- und Energiegetränke aus Kräutern, Hopfen und Kiosk-Zutaten brauen.'}
};
export const PROFESSION_STATIONS={werkhof:{name:'Willis Werkhof',kind:'workbench',offset:{x:-240,y:30},look:'dieter'},braugarten:{name:'Bärbels Braugarten',kind:'cauldron',offset:{x:180,y:180},look:'baerbel'}};
export const PROFESSION_SOURCES={
 scrap:{name:'Schrotthaufen',profession:'scrap',required:1,grey:35,items:{dosenblech:2,kabel:1}},
 machinery:{name:'Alte Maschinenteile',profession:'scrap',required:25,grey:75,items:{dosenblech:3,kabel:2}},
 herbs:{name:'Feldkräuter',profession:'herbs',required:1,grey:35,items:{feldkraut:2}},
 hops:{name:'Wilder Hopfen',profession:'herbs',required:25,grey:75,items:{hopfen:2,feldkraut:1}}
};
export const PROFESSION_RECIPES={
 blechklinge:{name:'Dosenklinge entgraten',profession:'smith',required:1,grey:20,materials:{dosenblech:4,kabel:1},output:'dosenklinge',count:1},
 blechbrecher:{name:'Dosenbrecher bauen',profession:'smith',required:15,grey:45,materials:{dosenblech:8,kabel:3},output:'dosenbrecher',count:1},
 panzerweste:{name:'Bierdeckel-Panzerweste vernieten',profession:'smith',required:30,grey:75,materials:{dosenblech:16,kabel:8},output:'bierdeckelweste',count:1},
 kraeutersud:{name:'Kräuter-Kontersud',profession:'brew',required:1,grey:20,materials:{feldkraut:2,brauwasser:1,leerflasche:1},output:'kraeutersud',count:1},
 hopfenschorle:{name:'Alkoholfreie Hopfenschorle',profession:'brew',required:15,grey:45,materials:{hopfen:2,brauwasser:1,leerflasche:1},output:'hopfenschorle',count:1},
 feldtee:{name:'Kräftiger Feldtee',profession:'brew',required:30,grey:75,materials:{feldkraut:4,hopfen:2,brauwasser:2,leerflasche:1},output:'feldtee',count:1}
};
export const PROFESSION_ITEMS={
 feldkraut:{name:'Frisches Feldkraut',kind:'material',rarity:'common',icon:'hops',stack:99,value:2,description:'Am Feldrand gesammelt. Grundlage für Kontersud und Feldtee.'},
 brauwasser:{name:'Sauberes Brauwasser',kind:'material',rarity:'common',icon:'water',stack:99,value:1,price:3,description:'Eine abgemessene Portion aus Kalles Kiosk. Zum Brauen, nicht direkt benutzbar.'},
 leerflasche:{name:'Gereinigte Leerflasche',kind:'material',rarity:'common',icon:'bottle',stack:99,value:1,price:3,description:'Zum Abfüllen selbst gebrauter Getränke. Kalle hat Nachschub.'},
 kraeutersud:{name:'Kräuter-Kontersud',kind:'consumable',usable:true,rarity:'common',icon:'water',stack:10,value:4,heal:150,description:'Stellt 150 Leben wieder her. Teilt die Verpflegungs-Abklingzeit mit allen anderen Getränken.'},
 hopfenschorle:{name:'Alkoholfreie Hopfenschorle',kind:'consumable',usable:true,rarity:'uncommon',icon:'bottle',stack:10,value:6,energy:25,level:2,description:'Stellt 25 Randale wieder her. Teilt die Verpflegungs-Abklingzeit mit allen anderen Getränken.'},
 feldtee:{name:'Kräftiger Feldtee',kind:'consumable',usable:true,rarity:'uncommon',icon:'water',stack:10,value:8,heal:300,level:3,description:'Stellt 300 Leben wieder her. Teilt die Verpflegungs-Abklingzeit mit allen anderen Getränken.'}
};
export const PROFESSION_UI={title:'Berufe',unlock:'Ab Stufe 3 nach abgeschlossener Hofprobe.',keys:'Shift + B · Berufe',intro:'Zwei Hauptberufe je Held. Sammeln und Handwerk lassen sich frei kombinieren.',learn:'Beruf lernen · 10 Pfandmarken',forget:'Verlernen',forgetConfirm:'Fertigkeit und Rezepte dieses Berufs löschen?',confirm:'Jetzt verlernen',cancel:'Abbrechen',craft:'Herstellen',gather:'Sammeln',route:'Hinlaufen',recipes:'Rezepte',sources:'Fundstellen',teachers:'Lehrer & Stationen',materials:'Zutaten',skill:'Fertigkeit',none:'Noch keinen Beruf gelernt.',solo:'Solo-Fundstellen · nur dieser Spielstand',online:'Gemeinsame Fundstellen · persönliche Ernte',offline:'Berufsserver nicht erreichbar. Gemeinsame Ernten bleiben gesperrt.',loading:'Fundstellen werden abgeglichen …',pending:'Berufsvorgang wird gespeichert …',retry:'Ergebnis erneut abrufen',done:'Berufsvorgang abgeschlossen.',cancelled:'Berufsaktion abgebrochen.',reserved:'Hauptauftragsmaterial bleibt geschützt. Dosenblech, Kabel, Holz und Hopfen werden auch beim Basisbau gebraucht.',grey:'Zu einfach: kein Fertigkeitspunkt',available:'Erntereif',window:'Erntefenster offen',spent:'Von dir geerntet',empty:'Nachwachsende Fundstelle',level:'Erst Stufe 3 erreichen und die Hofprobe abschließen.',full:'Nicht genug Platz für das ganze Ergebnis. Es wurde nichts verbraucht.',missing:'Zutaten fehlen oder sind für den Hauptauftrag reserviert.',money:'Nicht genug Pfandmarken.',slots:'Du hast bereits zwei Hauptberufe.',unknown:'Unbekannter Berufsvorgang.',required:'Der passende Beruf oder die nötige Fertigkeit fehlt.',range:'Geh näher an die Fundstelle oder den Lehrer.',combat:'Erst den Kampf oder die laufende Aktion beenden.',room:'Berufe stehen nur draußen zur Verfügung.',moving:'Zum Arbeiten stehen bleiben.',stale:'Ein neuerer Berufsvorgang liegt auf dem Server. Der Spielstand wird abgeglichen.',harvested:'Du hast diese Fundstelle in diesem Zyklus bereits geerntet.',expired:'Dieses Erntefenster ist geschlossen.',early:'Die Arbeit ist noch nicht abgeschlossen.',identity:'Aktiven Helden zuerst mit dem Server verbinden.',linked:'Dieser Held nutzt Online-Berufe. Zum Arbeiten bitte anmelden.',locked:'Ergebnis wird noch abgeglichen. Erneut abrufen oder das Spiel neu laden.',ingredients:'Brauwasser und Leerflaschen gibt es in Kalles Kiosk.',progress:(n,max)=>n+' / '+max,need:n=>'Benötigt Fertigkeit '+n};
