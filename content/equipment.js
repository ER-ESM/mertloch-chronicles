// Gemeinsame Ausrüstungsdaten: Plätze, Waffenbauarten und Kniffvoraussetzungen.
export const EQUIPMENT_SLOTS={weapon:'Haupthand',offhand:'Nebenhand',ranged:'Fernkampf',head:'Kopf',neck:'Hals',shoulders:'Schultern',body:'Brust',wrists:'Armschienen',hands:'Handschuhe',waist:'Gürtel',legs:'Beine',feet:'Schuhe',ring1:'Ring I',ring2:'Ring II',trinket1:'Glücksbringer I',trinket2:'Glücksbringer II'};
export const SLOT_ICONS={head:'helmet',neck:'necklace',shoulders:'shoulders',body:'coat',wrists:'bracers',hands:'gloves',waist:'belt',legs:'trousers',feet:'boots',ring1:'ring',ring2:'ring',trinket1:'trinket',trinket2:'trinket',weapon:'bottle',offhand:'shield',ranged:'slingshot'};
export const WEAPON_TYPES={club:{name:'Einhand · Pfandprügel',speed:2.2,hands:1,min:14,max:20,icon:'bottle'},blade:{name:'Einhand · Dosenklinge',speed:1.7,hands:1,min:12,max:22,icon:'blade'},maul:{name:'Zweihand · Tresenhammer',speed:3.2,hands:2,min:21,max:30,icon:'maul'},launcher:{name:'Fernkampf · Pfandschleuder',speed:2.4,hands:0,min:14,max:20,icon:'slingshot'},speaker:{name:'Fernkampf · Sprühwerfer',speed:2,hands:0,min:13,max:21,icon:'anni-spray'}};
export const AFFIXES={tresen:{name:'Wucht & Ausdauer',primary:'might'},bass:{name:'Tempo & Präzision',primary:'finesse'},pfand:{name:'Technik & Regeneration',primary:'wit'}};
// E-53: fünf Werte, jede Spielmechanik hängt an genau einem davon. Schlüssel stehen nicht im Spielstand.
export const STAT_NAMES={stamina:'Standfestigkeit',might:'Wumms',finesse:'Taktgefühl',wit:'Bastelgrips',armorRating:'Dicke Haut'};
/** Wofür jeder Wert da ist – höchstens drei Wirkungen, eine Textquelle für Tooltip, Figur und Glossar. */
export const STAT_EFFECTS={
 stamina:['Leben'],
 might:['Schaden aller Angriffe und Kniffe'],
 finesse:['Glückstreffer-Chance','Tempo (Autoangriff und Abklingzeiten)'],
 wit:['Heilung','Deckung','Randale-Nachschub'],
 armorRating:['weniger erlittener Schaden']
};
/** E-53: Gegenstandsvergleich. Verglichen werden die Wirkungen vorher/nachher, nicht die rohen Werte.
 *  labels – Anzeige je Wirkung; weights – Punkte Kampfkraft je 1 % Änderung, je Klasse (Offensive zählt für alle gleich).
 *  Glückstreffer 0,6: ein Prozentpunkt Chance bringt bei ×1,6 Schaden 0,6 % mehr Schaden. Randale: 1 % des Nachschubs im Kampf.
 *  threshold – ab so viel Kampfkraft gilt ein Teil als Verbesserung bzw. Verschlechterung. */
export const GEAR_COMPARE={
 labels:{health:'Leben',power:'Schaden',crit:'Glückstreffer-Chance',haste:'Tempo',melee:'Nahkampf je Sekunde',ranged:'Fernkampf je Sekunde',heal:'Heilung',shield:'Deckung',energy:'Randale-Nachschub',armor:'Schadensminderung'},
 weights:{
  dieter:{power:1,crit:.6,haste:1,melee:1,ranged:.3,health:1,armor:1,heal:.3,shield:.6,energy:.4},
  baerbel:{power:1,crit:.6,haste:1,melee:.4,ranged:1,health:.5,armor:.5,heal:1,shield:.3,energy:.4},
  kevin:{power:1,crit:.6,haste:1,melee:.4,ranged:1,health:.5,armor:.5,heal:.3,shield:.5,energy:.4}
 },
 threshold:.5
};
export const ROLLED_BASES={weapon:['Pfandprügel','reinforced','m'],offhand:['Zeltplatz-Schild','shield','m'],ranged:['Pfandschleuder','slingshot','f'],head:['Festivalhelm','helmet','m'],neck:['Kronkorkenkette','necklace','f'],shoulders:['Boxenträger-Schultern','shoulders','p'],body:['Festtagsjacke','coat','f'],wrists:['Kabelbinder-Manschetten','bracers','p'],hands:['Grillhandschuhe','gloves','p'],waist:['Zapfhahn-Gürtel','belt','m'],legs:['Abrisshose','trousers','f'],feet:['Maifeldtreter','boots','p'],ring:['Pfandsiegel','ring','n'],trinket:['Clan-Andenken','trinket','n'],charm:['Clan-Andenken','trinket','n']};
export const WEAPON_REQUIREMENT_NAMES={melee:'Nahkampfwaffe in der Haupthand',shield:'Schild in der Nebenhand',ranged:'Waffe im Fernkampfplatz',heavy:'Zweihandwaffe oder zwei Einhandwaffen'};
export const WEAPON_SKILL_RULES={dieter:{strike:'melee',burst:'melee'},baerbel:{strike:'ranged',burst:'ranged'},kevin:{strike:'ranged',burst:'ranged'},schorsch:{strike:'melee'},kaethe:{},'kevin-iron':{burst:'melee'},shared:{throw:'ranged',parry:'shield',barricade:'shield',magnet:'shield',slam:'heavy'}};
export const WEAPON_BASE_NAMES={club:'Pfandprügel',blade:'Dosenklinge',maul:'Tresenhammer',speaker:'Sprühwerfer',launcher:'Pfandschleuder'};
/** Genus der Waffen-Grundteile (m/f/n/p) für deklinierte Vorsilben, siehe content/affixes.js. */
export const WEAPON_BASE_GENUS={club:'m',blade:'f',maul:'m',speaker:'m',launcher:'f'};
