// Zusätze gewürfelter Beute (E-40, Vorbild Dreadmyst `affix_template`). Rolle: Gegenstände & Loot.
// Zwei Pools: VORSILBEN stehen vor dem Grundteil, BEINAMEN hinter dem Spec-Nachsatz:
//   „Klebriger Pfandprügel des Tresens ohne TÜV“ = Vorsilbe + Grundteil + Spec (equipment.js AFFIXES) + Beiname.
// Felder je Zusatz:
//   id        – eindeutig über BEIDE Pools; nie umbenennen (steht nicht im Spielstand, aber in Tests/Doku).
//   stem      – deklinierbarer Adjektivstamm; die Endung kommt aus ADJECTIVE_ENDINGS nach dem Genus des Grundteils
//               (ROLLED_BASES[slot][2], WEAPON_BASE_GENUS, FAMILY_TROPHIES[family][2]). ODER
//   fixed     – unveränderliches Bestimmungswort mit Bindestrich („Kirmes-“), braucht kein Genus.
//   text      – nur Beinamen: fertiger Nachsatz.
//   minLevel/maxLevel – Stufenband des Fundstücks. slots – Slotgruppen aus SLOT_GROUPS oder 'alle'.
//   qualities – erlaubte Güten. stats – 1–2 Werte; die Zahl ist der ANTEIL am Zusatzbudget (Summe 1).
// Wie groß das Zusatzbudget ist und wie viele Punkte ein Budgetpunkt je Wert gibt: AFFIX_TUNING (content/tuning.js).
// Hier stehen keine absoluten Werte. Die Auswahl ist deterministisch aus den Rohdaten des Fundstücks (itemization.js).
import {STAT_NAMES} from './equipment.js';

/** Slotgruppen: jeder Ausrüstungsplatz gehört zu genau einer Gruppe. */
export const SLOT_GROUPS={
 waffe:['weapon','ranged'],
 ruestung:['offhand','head','shoulders','body','wrists','hands','waist','legs','feet'],
 schmuck:['neck','ring','trinket','charm']
};
/** Starke Adjektivendung ohne Artikel je Genus des Grundteils: m(askulin), f(eminin), n(eutrum), p(lural). */
export const ADJECTIVE_ENDINGS={m:'er',f:'e',n:'es',p:'e'};

const ALL=['uncommon','rare','epic'],FINE=['rare','epic'];
const P=(id,form,minLevel,maxLevel,slots,qualities,stats)=>({id,...(form.endsWith('-')?{fixed:form}:{stem:form}),minLevel,maxLevel,slots,qualities,stats});
const E=(id,text,minLevel,maxLevel,slots,qualities,stats)=>({id,text,minLevel,maxLevel,slots,qualities,stats});

/** Vorsilben: Zustand und Herkunft. Frühe Stufen sind Schrott, späte sind Dorfprominenz. */
export const LOOT_PREFIXES=[
 // --- überall, jede Stufe: das Grundrauschen des Maifelds ---
 P('klebrig','Klebrig',1,30,['alle'],ALL,{stamina:1}),
 P('kirmes','Kirmes-',1,30,['alle'],ALL,{finesse:1}),
 P('geklaut','Geklaut',1,30,['alle'],ALL,{finesse:1}),
 P('dorfdisko','Dorfdisko-',1,30,['alle'],ALL,{finesse:1}),
 P('stammtisch','Stammtisch-',1,30,['alle'],ALL,{might:.6,stamina:.4}),
 P('bauwagen','Bauwagen-',1,30,['alle'],ALL,{wit:1}),
 // --- Stufe 1–12: Schrott mit Charakter ---
 P('verbeult','Verbeult',1,12,['waffe','ruestung'],ALL,{armorRating:.5,stamina:.5}),
 P('ranzig','Ranzig',1,12,['ruestung','schmuck'],ALL,{stamina:.7,might:.3}),
 P('geflickt','Geflickt',1,12,['ruestung'],ALL,{armorRating:1}),
 P('rostig','Rostig',1,12,['waffe','schmuck'],ALL,{finesse:.6,might:.4}),
 P('versifft','Versifft',1,12,['alle'],ALL,{stamina:.6,wit:.4}),
 P('ausgeleiert','Ausgeleiert',1,12,['ruestung','schmuck'],ALL,{finesse:1}),
 P('angekokelt','Angekokelt',1,14,['alle'],ALL,{wit:.5,finesse:.5}),
 P('sperrmuell','Sperrmüll-',1,14,['alle'],ALL,{might:.5,armorRating:.5}),
 P('flohmarkt','Flohmarkt-',1,14,['alle'],ALL,{wit:.5,finesse:.5}),
 P('krumm','Krumm',1,12,['waffe'],ALL,{finesse:1}),
 P('speckig','Speckig',1,14,['ruestung','schmuck'],ALL,{stamina:1}),
 P('durchgesessen','Durchgesessen',1,12,['ruestung'],ALL,{stamina:.5,armorRating:.5}),
 // --- Stufe 8–22: Festsaison ---
 P('frischgezapft','Frisch gezapft',8,22,['alle'],ALL,{stamina:.5,finesse:.5}),
 P('schuetzenfest','Schützenfest-',8,22,['alle'],ALL,{finesse:1}),
 P('polterabend','Polterabend-',8,22,['alle'],ALL,{might:.5,finesse:.5}),
 P('fruehschoppen','Frühschoppen-',8,22,['alle'],ALL,{stamina:.6,wit:.4}),
 P('feuerwehrfest','Feuerwehrfest-',8,22,['alle'],ALL,{armorRating:.5,might:.5}),
 P('bierselig','Bierselig',8,22,['ruestung','schmuck'],ALL,{wit:.6,stamina:.4}),
 P('wetterfest','Wetterfest',8,24,['ruestung'],ALL,{armorRating:.7,stamina:.3}),
 P('frischgeoelt','Frisch geölt',8,24,['waffe','schmuck'],ALL,{finesse:1}),
 P('doppeltgeklebt','Doppelt geklebt',8,22,['alle'],ALL,{wit:.6,armorRating:.4}),
 P('frisiert','Frisiert',8,24,['waffe','schmuck'],ALL,{finesse:1}),
 P('trecker','Trecker-',8,24,['alle'],ALL,{might:.7,stamina:.3}),
 P('weinfest','Weinfest-',8,22,['alle'],ALL,{finesse:.5,wit:.5}),
 P('vatertags','Vatertags-',8,22,['alle'],ALL,{might:.4,finesse:.6}),
 P('zeltlager','Zeltlager-',8,22,['ruestung','schmuck'],ALL,{stamina:.5,finesse:.5}),
 // --- Stufe 16–30: Dorfprominenz ---
 P('tiefergelegt','Tiefergelegt',16,30,['alle'],ALL,{finesse:1}),
 P('aufgemotzt','Aufgemotzt',16,30,['alle'],ALL,{might:.5,finesse:.5}),
 P('verchromt','Verchromt',16,30,['alle'],ALL,{wit:.5,armorRating:.5}),
 P('praemiert','Prämiert',16,30,['alle'],ALL,{wit:1}),
 P('handsigniert','Handsigniert',16,30,['alle'],ALL,{wit:1}),
 P('rosenmontags','Rosenmontags-',16,30,['alle'],ALL,{finesse:1}),
 P('kreisliga','Kreisliga-',16,30,['alle'],ALL,{might:.6,finesse:.4}),
 P('unkaputtbar','Unkaputtbar',16,30,['waffe','ruestung'],ALL,{armorRating:.6,stamina:.4}),
 P('amtlich','Amtlich beglaubigt',16,30,['alle'],ALL,{wit:.5,stamina:.5}),
 // --- nur Selten/Episch: darüber redet das Dorf ---
 P('vergoldet','Vergoldet',12,30,['alle'],FINE,{finesse:.5,wit:.5}),
 P('sagenhaft','Sagenhaft',1,30,['alle'],FINE,{might:.5,finesse:.5}),
 P('beruechtigt','Berüchtigt',1,30,['alle'],FINE,{finesse:1}),
 P('dorfbekannt','Dorfbekannt',1,30,['alle'],FINE,{stamina:.5,wit:.5}),
 P('eifelweit','Eifelweit gefürchtet',20,30,['alle'],['epic'],{might:.4,finesse:.6})
];

/** Beinamen: woher das Teil stammt und was daran faul ist. Stehen hinter dem Spec-Nachsatz. */
export const LOOT_EPITHETS=[
 // --- überall, jede Stufe ---
 E('ohne-tuev','ohne TÜV',1,30,['alle'],ALL,{finesse:1}),
 E('omas-keller','aus Omas Keller',1,30,['alle'],ALL,{stamina:1}),
 E('mit-pfandbon','mit Pfandbon',1,30,['alle'],ALL,{wit:.6,finesse:.4}),
 E('vom-stammtisch','vom Stammtisch',1,30,['alle'],ALL,{might:.6,wit:.4}),
 E('nach-feierabend','nach Feierabend',1,30,['alle'],ALL,{finesse:.6,stamina:.4}),
 E('auf-pump','auf Pump',1,30,['alle'],ALL,{finesse:1}),
 // --- Stufe 1–12 ---
 E('vom-sperrmuell','vom Sperrmüll',1,12,['alle'],ALL,{armorRating:.5,might:.5}),
 E('zweiter-wahl','zweiter Wahl',1,12,['alle'],ALL,{stamina:.6,finesse:.4}),
 E('vom-wuehltisch','vom Wühltisch',1,12,['alle'],ALL,{wit:.5,finesse:.5}),
 E('mit-bierfleck','mit Bierfleck',1,14,['ruestung','schmuck'],ALL,{stamina:.7,wit:.3}),
 E('grabbelkiste','aus der Grabbelkiste',1,12,['alle'],ALL,{finesse:1}),
 E('ohne-kassenbon','ohne Kassenbon',1,14,['alle'],ALL,{finesse:1}),
 E('vom-trecker','vom Trecker gefallen',1,14,['waffe','ruestung'],ALL,{might:.5,stamina:.5}),
 E('mit-restpfand','mit Restpfand',1,14,['alle'],ALL,{wit:.7,stamina:.3}),
 E('kabelbinder-fix','mit Kabelbinder-Fix',1,14,['waffe','ruestung'],ALL,{armorRating:.4,wit:.6}),
 E('vom-schwager','vom Schwager geliehen',1,14,['alle'],ALL,{might:.4,finesse:.6}),
 E('mit-wackelkontakt','mit Wackelkontakt',1,12,['waffe','schmuck'],ALL,{finesse:1}),
 // --- Stufe 8–22 ---
 E('aus-der-tombola','aus der Tombola',8,22,['alle'],ALL,{finesse:.7,stamina:.3}),
 E('vom-polterabend','vom letzten Polterabend',8,22,['alle'],ALL,{might:.6,finesse:.4}),
 E('vom-feuerwehrfest','vom Feuerwehrfest',8,22,['alle'],ALL,{armorRating:.5,stamina:.5}),
 E('aus-dem-vereinsheim','aus dem Vereinsheim',8,22,['alle'],ALL,{wit:.6,stamina:.4}),
 E('vom-fruehschoppen','vom Frühschoppen',8,22,['alle'],ALL,{stamina:.5,finesse:.5}),
 E('mit-edding','mit Edding-Widmung',8,24,['alle'],ALL,{wit:1}),
 E('vom-kegelabend','vom Kegelabend',8,22,['alle'],ALL,{might:.5,finesse:.5}),
 E('dritte-halbzeit','der dritten Halbzeit',8,24,['alle'],ALL,{stamina:.4,might:.6}),
 E('aus-dem-festzelt','aus dem Festzelt',8,22,['alle'],ALL,{finesse:.6,wit:.4}),
 E('in-uebergroesse','in Übergröße',8,24,['ruestung'],ALL,{armorRating:.6,stamina:.4}),
 E('mit-anlauf','mit Anlauf',8,24,['waffe','schmuck'],ALL,{finesse:.5,might:.5}),
 E('aus-dem-bauwagen','aus dem Bauwagen',8,22,['alle'],ALL,{wit:.6,finesse:.4}),
 E('vom-weinfest','vom Weinfest',8,22,['alle'],ALL,{finesse:1}),
 // --- Stufe 16–30 ---
 E('mit-nachbrenner','mit Nachbrenner',16,30,['waffe','schmuck'],ALL,{finesse:1}),
 E('vom-schuetzenkoenig','vom Schützenkönig',16,30,['alle'],ALL,{finesse:1}),
 E('dorfpokal-gravur','mit Dorfpokal-Gravur',16,30,['alle'],ALL,{wit:.5,might:.5}),
 E('aus-der-kreisliga','aus der Kreisliga',16,30,['alle'],ALL,{might:.5,finesse:.5}),
 E('mit-blaulicht','mit Blaulicht',16,30,['alle'],ALL,{wit:.5,finesse:.5}),
 E('asservatenkammer','aus der Asservatenkammer',16,30,['alle'],ALL,{wit:.6,armorRating:.4}),
 E('mit-ehrenurkunde','mit Ehrenurkunde',16,30,['alle'],ALL,{wit:.6,stamina:.4}),
 E('vom-open-air','vom Maifeld-Open-Air',16,30,['alle'],ALL,{finesse:1}),
 E('eifelmeisterschaft','der Eifelmeisterschaft',16,30,['alle'],ALL,{might:.5,finesse:.5}),
 E('fuer-die-ewigkeit','für die Ewigkeit',16,30,['ruestung','schmuck'],ALL,{stamina:.6,armorRating:.4}),
 E('panzertape','mit Panzertape-Garantie',16,30,['waffe','ruestung'],ALL,{armorRating:.5,wit:.5}),
 // --- nur Selten/Episch ---
 E('vom-buergermeister','vom Bürgermeister persönlich',1,30,['alle'],FINE,{wit:1}),
 E('aus-meisterhand','aus Meisterhand',1,30,['alle'],FINE,{might:.5,finesse:.5}),
 E('mit-goldrand','mit Goldrand',1,30,['alle'],FINE,{finesse:.5,wit:.5}),
 E('fuer-fortgeschrittene','für Fortgeschrittene',10,30,['alle'],FINE,{finesse:1}),
 E('von-der-man-spricht','von dem das Dorf spricht',20,30,['alle'],['epic'],{stamina:.4,finesse:.6})
];

/** Beide Pools nach Art; die Logik kennt nur diese Schlüssel. */
export const LOOT_AFFIX_POOLS={prefix:LOOT_PREFIXES,epithet:LOOT_EPITHETS};
/** Slotgruppe eines Ausrüstungsplatzes. */
export const slotGroupOf=slot=>Object.keys(SLOT_GROUPS).find(g=>SLOT_GROUPS[g].includes(slot))||null;
/** Passt der Zusatz zu Platz, Stufe und Güte? */
export const affixFits=(a,slot,level,quality)=>level>=a.minLevel&&level<=a.maxLevel&&a.qualities.includes(quality)&&(a.slots.includes('alle')||a.slots.includes(slotGroupOf(slot)));
/** Anzeigename eines Zusatzes ohne Beugung – für Tooltip und Beschreibung. */
export const affixLabel=a=>a.text||a.fixed||a.stem;
/** Setzt den Namen zusammen: [Vorsilbe] Grundteil Spec-Nachsatz [Beiname]. `genus` gehört zum Grundteil. */
export function affixedName(base,genus,specSuffix,prefix,epithet){
 const front=prefix?(prefix.fixed?prefix.fixed:prefix.stem+(ADJECTIVE_ENDINGS[genus]||ADJECTIVE_ENDINGS.p)+' '):'';
 return front+base+' '+specSuffix+(epithet?' '+epithet.text:'');}
/** Eine Zeile je Zusatz: „Klebrig“: +3 Standfestigkeit. Die Zahlen kommen aus dem gewürfelten Gegenstand, nie aus Handtext. */
export const affixLines=affixes=>(affixes||[]).map(a=>'„'+a.name+'“: '+Object.entries(a.stats).map(([k,v])=>'+'+v+' '+STAT_NAMES[k]).join(', '));
/** Zahlenzeilen für den Beschreibungs-Standard (describe.js). */
export const affixNumbers=affixes=>(affixes||[]).flatMap(a=>Object.entries(a.stats).map(([k,v])=>({label:'Zusatz „'+a.name+'“ · '+STAT_NAMES[k],value:v,unit:k.endsWith('Rating')?'Wertung':'Punkte',source:'affix.'+a.id})));
/** Spec-Nachsätze der gewürfelten Beute (Schlüssel = AFFIXES in equipment.js; stehen in Spielständen). */
export const SPEC_SUFFIXES={tresen:'des Tresens',bass:'der Zugabe',pfand:'des Kurzschlusses'};
/** Beschreibungstext eines Fundstücks. `specName` = AFFIXES[spec].name. */
export const rolledDescription=(specName,affixes)=>'Maifeld-Fundstück · '+specName+'. Alle Werte wirken bei jeder Klasse. Werte und Waffenbauart wurden beim Fund ausgewürfelt.'+(affixes?.length?' Zusätze – '+affixLines(affixes).join(' · ')+'.':'');
