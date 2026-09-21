import {MECHANIC_EFFECTS} from './mechanics.js';
import {TALENTS_DIETER,GLOSSARY_DIETER} from './talents/dieter.js';
import {TALENTS_BAERBEL,GLOSSARY_BAERBEL} from './talents/baerbel.js';
import {TALENTS_KEVIN,GLOSSARY_KEVIN} from './talents/kevin.js';
// Spezialisierungen und Talentbäume (E-32). Die Talente selbst liegen je Klasse in content/talents/<klasse>.js:
// 30 Talente je Spezialisierung in 10 Reihen × 3 Pfaden, je Reihe genau eines wählbar. Talent-IDs entstehen aus
// <spec>-<index>; Reihenfolge nie ändern (Speicherschlüssel). Pfadnamen und Pfadboni: content/mechanics.js (paths).
// effects: Schlüssel, die combatStats()/class-mechanics.js/spec-mechanics.js auswerten. grants: aktive Talentfähigkeit (skills.js TALENT_SKILLS).
export const CLASS_SPECS={dieter:['dieter-wall','dieter-brawl','dieter-brew'],baerbel:['baerbel-care','baerbel-feedback','baerbel-stage'],kevin:['kevin-fuse','kevin-iron','kevin-hunt']};
export const SPECS={
 'dieter-wall':{name:'Türsteher',classId:'dieter',role:'Tank',icon:'shield',text:'Kellen bauen Deckung auf. Paraden kontern; der Rausschmiss wirft die Deckung auf die Gegner, fast volle Deckung gibt Hausverbot.'},
 'dieter-brawl':{name:'Kneipenschläger',classId:'dieter',role:'Nahkampf-Schaden',icon:'burst',text:'Riskante Prügelei: 15 % mehr Schaden einstecken. Kellen und kassierte Treffer füllen die Deckel-Uhr; der Abriss verbraucht sie – wer zu lange wartet, kassiert den Kater.'},
 'dieter-brew':{name:'Zapfmeister',classId:'dieter',role:'Schutz & Heilung',icon:'water',text:'Stellt Fässer: Weizen heilt, Pils gibt Tempo, Bock verletzt. Der Fassanstich sticht alle Fässer auf einmal an. Markierte Ziele liefern heilenden Rücklauf.'},
 'baerbel-care':{name:'Landhaus-Lazarett',classId:'baerbel',role:'Heilung',icon:'food',text:'Jede Heilung füllt ein Vorratsglas; bei fünf beginnt das Großreinemachen, in dem Heilung auch Schaden ist. Gans Gisela heilt vom Nest aus.'},
 'baerbel-feedback':{name:'Putzpyramide',classId:'baerbel',role:'Schadensheilung',icon:'sound',text:'Schimmel springt von Gegner zu Gegner und platzt beim Durchputzen. Schaden an verschimmelten Zielen zahlt Heilprovision.'},
 'baerbel-stage':{name:'Filter-Furie',classId:'baerbel',role:'Fernkampf-Schaden',icon:'speaker',text:'Bei 100 Randale beginnt die Putzwut: alles kostenlos, härter und im Laufen. Auswringen beendet sie mit Bonusschaden aus der Rest-Randale.'},
 'kevin-fuse':{name:'Zündmeister',classId:'kevin',role:'Fernkampf-Schaden',icon:'burst',text:'Lunten kleben und explodieren; der Kurzschluss springt als Blitz über bis zu drei Ziele und zündet sie. Drei Zündungen lösen die Kettenreaktion aus.'},
 'kevin-iron':{name:'Schrottkoloss',classId:'kevin',role:'Tank',icon:'reinforced',text:'Pfandgeschosse bauen auch auf Distanz Deckung auf. Dosen-Robbi steht, feuert und bremst; die Überlast lässt ihn explodieren.'},
 'kevin-hunt':{name:'Pfandjäger',classId:'kevin',role:'Fernkampf-Schaden',icon:'boots',text:'Bastler-Glück: jeder Schuss zündet fehl, normal oder über. Drei Fehlzündungen garantieren die Überzündung, drei Überzündungen den Jackpot. Ausweichen lädt einen kostenlosen Wurf.'}
};
const CLASS_TALENTS={...TALENTS_DIETER,...TALENTS_BAERBEL,...TALENTS_KEVIN};
/** Reihen je Spec: [{name,text,effects,grants,skills,info}] – Index = Speicherschlüssel. */
export const TALENT_ROWS=Object.fromEntries(Object.entries(CLASS_TALENTS).map(([spec,list])=>[spec,list.map(t=>({name:t.name,text:t.text,effects:t.effects||{},grants:t.grants||null,skills:t.skills||[],info:t.info}))]));
/** Zelle je Talent: {row 0–9, path 0–2}. */
export const TALENT_CELLS=Object.fromEntries(Object.entries(CLASS_TALENTS).map(([spec,list])=>[spec,list.map(t=>({row:t.row??0,path:t.path??0}))]));
export const TALENT_INFO=Object.fromEntries(Object.entries(CLASS_TALENTS).flatMap(([spec,list])=>list.map((t,i)=>[spec+'-'+i,t.info])));
/** Glossarbegriffe aus den Klassenmodulen (werden in content/glossary.js GLOSSARY gemischt). */
export const TALENT_GLOSSARY={...GLOSSARY_DIETER,...GLOSSARY_BAERBEL,...GLOSSARY_KEVIN};
export const TALENT_ROWS_PER_SPEC=10,TALENT_PATHS=3,PATH_BONUS_AT=[4,7];
export const TALENT_ICON_FALLBACK=['shield','person','mark','boots','book','ring','burst','food','reinforced','sound'];
/** Effektschlüssel, die die Engine tatsächlich auswertet. Neue Talente dürfen nur diese verwenden (Schema-Prüfung). */
export const isProcEffect=k=>k.startsWith('proc:');
export const KNOWN_EFFECTS=[...MECHANIC_EFFECTS,'stamina','might','finesse','wit','armorRating','critRating','hasteRating','masteryRating','range','guardOnStrike','doubleParry','parrySlow','shieldBonus','guardBurst','guardOnParry','zoneUpgrade','lastGuard','rageGain','rageBurst','dashThrow','burstStun','killHeal','slamUpgrade','killReset','markedLeech','overhealShield','healEnergy','healBonus','burstHot','parryHealCd','zoneEnergy','hotHeal','healEmpower','parryHot','spreadMark','healMarkCd','markedKillHot','interruptHeal','infusionUpgrade','burstSpread','beatEnergy','dashFreeThrow','encoreUpgrade','killThrow','burnGround','interruptEnergy','markedKillEnergy','healGroundCd','detonateUpgrade','parryEnergy','magnetUpgrade','dashEnergy','markRoot','rootThrow','interruptDash','snareUpgrade','hunterFinish','aoe','critDamage','reflect','parryWindow','lastStand','execute','markBonus','burstBonus','energyRegen'];
