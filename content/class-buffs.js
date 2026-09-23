// Klassen-Buffs: dauerhafte Stärkungen (30 Minuten), die jede Klasse auf sich, einen Söldner oder ein Gruppenmitglied zaubert.
// Nutzerauftrag 2026-09-23: „Jeder Char sollte 2 Buffs mitbringen, je nach Talent später auch mehr oder durch Talente verstärkt."
// Entwurf, Zahlen und Stapelregeln: docs/KLASSEN-BUFFS-2026-09-23.md.
//
// Regeln (Laufzeit: class-buffs.js im Wurzelordner):
//  - Jeder Buff hebt genau einen Wert (Aperol-Spritz zwei kleine). Buffs verschiedener Klassen wirken deshalb zusammen,
//    derselbe Buff von zwei Zaubernden nicht: der stärkere gewinnt, bei gleicher Stärke erneuert der neuere die Dauer.
//  - Ziel: freundliches Ziel (Söldner, Gruppenmitglied) oder das Hilfsziel; ohne freundliches Ziel der Zaubernde selbst.
//  - Keine Kosten, keine Abklingzeit, nur die globale Abklingzeit. Läuft über Ortswechsel und Tod weiter und steht im Spielstand.
//  - Talente verstärken einen Buff über den Effektschlüssel `classBuff:<id>` (Wert = Anzahl Verstärkungsstufen, je Stufe
//    CLASS_BUFF_TUNING.talentStep). Ein dritter Buff über Talente braucht nur eine weitere Definition mit `talent:'<spec>-<index>'`.
// IDs sind Speicherschlüssel (Aktionsleiste, Spielstand): nie umbenennen oder löschen.
// Zahlen: content/tuning.js (TUNING.classBuffs, CLASS_BUFF_TUNING). Hier nur Struktur, Namen und Texte.
import {TUNING,CLASS_BUFF_TUNING,applyTuning} from './tuning.js';
const M=Math.round(CLASS_BUFF_TUNING.duration/60);

/** Werte, die ein Klassen-Buff heben darf, mit Anzeige. `pct` = Anteil (0,05 → 5 %), sonst absolute Zahl je Sekunde. */
export const CLASS_BUFF_STATS={
 health:{label:'Maximales Leben',pct:true},
 armor:{label:'Schadensminderung',pct:true},
 energyRegen:{label:'Randale je Sekunde',pct:false,unit:'/s'},
 healTaken:{label:'Erhaltene Heilung',pct:true},
 haste:{label:'Tempo',pct:true},
 speed:{label:'Laufgeschwindigkeit zu Fuß',pct:true},
 crit:{label:'Glückstreffer-Chance',pct:true,points:true}
};

const DEF={
 dosenpfand:{cls:'dieter',slot:0,level:4,name:'Dosenpfand',icon:'can',effects:{health:0},
  text:v=>`Dieter drückt dir eine volle Dose in die Hand: ${v.health} mehr maximales Leben für ${M} Minuten. Das Pfand kriegt er zurück. Die Dose nicht.`,
  use:'Zünde es, bevor ihr loszieht: auf dich, deinen Söldner oder dein Hilfsziel.',flavor:'„Ich trink die nicht. Ich pass nur drauf auf.“',
  info:{effect:'Hebt eine halbe Stunde lang das maximale Leben des Ziels; das zusätzliche Leben kommt sofort dazu.',why:'Dieters Beitrag für alle: Leben hilft jeder Klasse und jedem Söldner, und kein anderer Klassen-Buff hebt es.',links:['classBuff:kutteDrueber','talent:dieter-wall-10'],terms:['klassenbuff','staerkung','leben']}},
 kutteDrueber:{cls:'dieter',slot:1,level:8,name:'Kutte drüber',icon:'vest',effects:{armor:0},
  text:v=>`Dieter legt dir seine Lederkutte mit den vierzig Aufnähern um: ${v.armor} weniger erlittener Schaden für ${M} Minuten. Gewaschen wurde sie nie. Deshalb hält sie ja.`,
  use:'Zünde sie, bevor ihr loszieht: auf dich, deinen Söldner oder dein Hilfsziel.',flavor:'„Die Kutte hat drei Schlägereien und eine Taufe überlebt. Die Taufe war schlimmer.“',
  info:{effect:'Senkt eine halbe Stunde lang den Schaden, den das Ziel nimmt, um einen festen Anteil – zusätzlich zur Dicken Haut.',why:'Schutz, den man nicht drücken muss: wirkt in jedem Kampf, auch auf Söldnern, die sonst keine Rüstung tragen.',links:['classBuff:dosenpfand'],terms:['klassenbuff','staerkung','schadensminderung']}},
 aperolSpritz:{cls:'baerbel',slot:0,level:4,name:'Aperol-Spritz',icon:'cup',effects:{energyRegen:0,healTaken:0},
  text:v=>`Ein Glas Orange mit extra Eis: ${v.energyRegen} Randale je Sekunde und ${v.healTaken} mehr erhaltene Heilung für ${M} Minuten. Wellness, sagt Anni. Vorglühen, sagt das Dorf.`,
  use:'Reich ihn aus, bevor ihr loszieht: dir, deinem Söldner oder deinem Hilfsziel.',flavor:'„Das ist kein Alkohol. Das ist Selbstfürsorge mit Strohhalm.“',
  info:{effect:'Füllt eine halbe Stunde lang zusätzlich Randale nach und verstärkt jede Heilung, die beim Ziel ankommt.',why:'Annis Buff macht die Gruppe länger kampffähig: mehr Randale für Kniffe und mehr Wirkung aus jeder Heilung – auch aus fremder.',links:['classBuff:vorherNachher','talent:baerbel-care-3'],terms:['klassenbuff','staerkung','randale','heilung']}},
 vorherNachher:{cls:'baerbel',slot:1,level:8,name:'Vorher-Nachher-Filter',icon:'anni-spray',effects:{haste:0},
  text:v=>`Anni legt ihren Lieblingsfilter über dich: ${v.haste} Tempo für ${M} Minuten. Schneller bist du nicht geworden. Du siehst nur so aus. Wirkt trotzdem.`,
  use:'Leg ihn auf, bevor ihr loszieht: auf dich, deinen Söldner oder dein Hilfsziel.',flavor:'„Vorher: Dorftrottel. Nachher: Dorftrottel mit Weichzeichner.“',
  info:{effect:'Erhöht eine halbe Stunde lang das Tempo: Angriffe, Abklingzeiten und die globale Abklingzeit laufen schneller.',why:'Der einzige Klassen-Buff, der direkt Schaden bringt – er wirkt auf jede Rotation und jeden Söldner.',links:['classBuff:aperolSpritz'],terms:['klassenbuff','staerkung','tempo','gcd']}},
 kabelbinderSohlen:{cls:'kevin',slot:0,level:4,name:'Kabelbinder-Sohlen',icon:'boots',effects:{speed:0},
  text:v=>`Zwei Kabelbinder pro Schuh, straff gezogen: ${v.speed} schneller zu Fuß für ${M} Minuten. TÜV-geprüft ist daran nichts. Aber es quietscht motivierend.`,
  use:'Zieh sie fest, bevor ein langer Weg ansteht: dir, deinem Söldner oder deinem Hilfsziel.',flavor:'„Die halten bombenfest. Das Wort ‚bomben‘ ist dabei wichtig.“',
  info:{effect:'Erhöht eine halbe Stunde lang die Laufgeschwindigkeit zu Fuß; auf dem Reittier zählt dessen Tempo.',why:'Kevins Alltagsbuff: kürzere Wege zwischen Aufträgen und mehr Luft beim Ausweichen aus Flächen.',links:['classBuff:pfandradar'],terms:['klassenbuff','staerkung','ausweichen']}},
 pfandradar:{cls:'kevin',slot:1,level:8,name:'Pfandradar',icon:'bottle',effects:{crit:0},
  text:v=>`Kevins selbstgelötetes Pfandradar piept bei jeder Schwachstelle: ${v.crit} Glückstreffer-Chance für ${M} Minuten. Meistens piept es bei Leergut. Getroffen wird trotzdem.`,
  use:'Häng es um, bevor ihr loszieht: dir, deinem Söldner oder deinem Hilfsziel.',flavor:'„Es erkennt Pfand auf dreißig Meter. Und Gegner. Meistens Pfand.“',
  info:{effect:'Erhöht eine halbe Stunde lang die Chance auf Glückstreffer um feste Prozentpunkte.',why:'Ergänzt den Tempo-Buff, statt ihn zu verdoppeln: Glückstreffer lösen bei vielen Talenten Procs aus.',links:['classBuff:kabelbinderSohlen','talent:kevin-hunt-27'],terms:['klassenbuff','staerkung','glueckstreffer','proc']}}
};
applyTuning(DEF,TUNING.classBuffs);

/** Anzeige eines Werts: 0,08 → „8 %“, Prozentpunkte → „4 Prozentpunkte“, sonst „+0,3“. */
export function classBuffValueText(stat,value){const s=CLASS_BUFF_STATS[stat];if(!s)return String(value);const r=x=>String(Math.round(x*10)/10).replace('.',',');
 return s.pct?(s.points?'+'+r(value*100)+' Prozentpunkte':r(value*100)+' %'):'+'+r(value);}
const textFor=(d,power=1)=>d.text(Object.fromEntries(Object.entries(d.effects).map(([k,v])=>[k,classBuffValueText(k,v*power)])));

/** Klassen-Buffs nach ID. `text` ist mit den Zahlen aus content/tuning.js gefüllt; `textAt(power)` rechnet eine Verstärkung ein. */
export const CLASS_BUFFS=Object.fromEntries(Object.entries(DEF).map(([id,d])=>[id,{...d,id,text:textFor(d),textAt:power=>textFor(d,power),duration:CLASS_BUFF_TUNING.duration}]));
/** Buffs einer Klasse in Kniffe-Reihenfolge. */
export const classBuffsFor=cls=>Object.values(CLASS_BUFFS).filter(b=>b.cls===cls).sort((a,b)=>a.slot-b.slot);
/** Gemeinsame Kniff-Felder: kostenlos, ohne eigene Abklingzeit, nur globale Abklingzeit. Farben wie die Stärkung. */
export const CLASS_BUFF_SKILL={cd:0,cost:0,classBuff:true,color:'#f0d59a',bg:'#6b5634'};
/** Oberflächentexte (Buffleiste, Tooltip, Kampflog). */
export const CLASS_BUFF_TEXT={
 minutes:'min',minutesShort:'m',from:n=>'von '+n,
 cast:(name,target)=>name+' · '+M+' Minuten auf '+target+'.',self:'dich',
 received:(from,name)=>from+' stärkt dich: '+name+' für '+M+' Minuten.',
 partyOnly:n=>n+' ist nicht in deiner Gruppe. Klassen-Buffs gibt es nur für die eigene Truppe.',
 weaker:(name)=>name+' wirkt dort schon stärker. Doppelt hält hier nicht besser.',
 talentBonus:(name,pct)=>name+' wirkt '+pct+' % stärker (Talent).'
};
/** Glossarbegriff (wird in content/glossary.js GLOSSARY gemischt). */
export const CLASS_BUFF_GLOSSARY={
 klassenbuff:{name:'Klassen-Buff',short:'Eine lange Stärkung für '+M+' Minuten, die jede Klasse auf sich, ihren Söldner oder ein Gruppenmitglied zaubert.',
  long:'Jede Klasse bringt zwei Klassen-Buffs mit, jeder hebt einen anderen Wert. Buffs verschiedener Klassen wirken deshalb zusammen; derselbe Buff von zwei Zaubernden nicht – der stärkere gewinnt, bei gleicher Stärke erneuert der neuere die Dauer. Ohne freundliches Ziel landet der Buff auf dir. Er kostet keine Randale, läuft über Ortswechsel und Tod hinweg weiter und bleibt im Spielstand. Einzelne Talente verstärken einen Buff.'}
};
