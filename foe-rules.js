// Weltgegner-Regeln (E-72 Runde 4, 25.09.2026). Kenner-Befund: Helden auf Stufe 12 (Startausrüstung, 1.095 Leben) starben an
// Pfandkeilern der Stufe 2 – Käthe in rund 3 s, Kevin nach 6 s im Rudel der Grillwiese. Gemessen (docs/e72-runde4/welt.md):
//  - Kein Stufenunterschied: Ein Keiler traf einen Stufe-12-Helden genauso hart wie einen Stufe-2-Helden (Sprung 105, Hauer 32–44),
//    obwohl der Zielrahmen ihn grau als „kaum der Rede wert“ anzeigt (unit-colors.js). Die Startausrüstung schützt auf Stufe 12
//    nur noch 3 % statt 11,8 % (Kurs der Dicken Haut wächst mit der Stufe, E-56).
//  - Rudel im Gleichschlag: Jeder Gegner beginnt 3 s nach dem Bemerken mit seinem Spezialangriff. Fünf Keiler sprangen im selben
//    Augenblick – 5 × 105 in einer halben Sekunde.
//  - Kettenzug ohne Obergrenze: „Kumpel kommt“ zog das ganze Tiergebiet (sechs Keiler in 12 m Umkreis) nacheinander in den Kampf.
// Regeln hier: Stufenabstand wie die Farben am Zielrahmen (±2 gelb unverändert, darunter weniger Schaden und Aggro, grau greift nicht
// an), höchstens BALANCE.foes.pack.max Gegner über den Kettenzug, Spezialangriffe eines Rudels zeitversetzt, „kurzer Schutz“ nach dem
// Aufwachen. Nur Weltgegner (Feld, Tiergebiete, Lager, Arena): Dungeon (E-71) und Weltbosse behalten ihre Regeln.
// Dazu: Feldgegner rund um die Startreihe wachsen nicht mehr mit der Spielerstufe (inStartArea).
import {BALANCE,ENEMY_BARKS,SPAWN_TABLES} from './content/index.js';
import {distance} from './world.js';
import {hotspotLayout} from './hotspots.js';

const F=BALANCE.foes;
/** Startreihe (E-55): Tiergebiete der Startreihe und Treffpunkte bleiben auf ihrer Stufe. Die Feldgegner drumherum wuchsen bisher
 *  jenseits von SPAWN_TABLES.tierDistance mit der Spielerstufe – am Pfandhof standen dadurch Keiler der Stufe 10 neben dem
 *  Tiergebiet der Stufe 2. Die Skalierung sollte „den Anfang unverändert lassen“ (encounters.scaledStats); der Anfang reicht heute weiter. */
export function inStartArea(w,p){const pad=F.startPad;return (w?.hubs||[]).some(h=>distance(h,p)<pad)||hotspotLayout(w).areas.some(a=>!a.notice&&distance(a,p)<pad);}
/** Einstieg an Kisten-Ida (E-72 Runde 5): Aggressive Feldreviere hielten nur zur Kirche (Wiederbelebung) Abstand
 *  (SPAWN_TABLES.aggressiveMinDistance), nicht zu Ida – dem ersten Auftraggeber neben der Bude, 66 m von der Kirche entfernt. Dadurch
 *  streifte ein Ruhewart der Stufe 3 47 m neben Ida, noch vor dem Kirchhof (Stufe 1) und auf dem Weg zur Grillwiese (Stufe 2);
 *  er tötete im Kenner-Nachtest Käthe (Stufe 4) und Schorsch (Stufe 6). Ida bekommt denselben Abstand; an der Stelle lebt dann ein
 *  neutrales Tier. Der Zufallsstrom der Weltgenerierung bleibt gleich (Prüfung nach dem Würfeln, encounters.buildCell). */
export const nearEntry=(w,p)=>!!w?.npc&&distance(w.npc,p)<SPAWN_TABLES.aggressiveMinDistance;
/** Weltgegner: Feld, Tiergebiete, Lager und Arena. Dungeon-Gegner und Weltbosse zählen nicht. */
export const worldFoe=e=>!!e&&!e.dungeon&&!e.worldBoss&&(!!e.ambient||!!e.campId);
/** Stufenabstand Gegner − Held (negativ: Gegner liegt darunter). 0 für alle, die keine Weltgegner sind. */
export function levelGap(g,e){if(!worldFoe(e))return 0;const d=Number(e.level)-Number(g?.player?.level);return Number.isFinite(d)?d:0;}
/** Grau wie am Zielrahmen: fünf und mehr Stufen unter dem Helden. */
export const greyFoe=(g,e)=>levelGap(g,e)<=-F.gap.grey;
const below=(g,e)=>Math.max(0,-levelGap(g,e)-F.gap.grace);
/** Faktor auf den Schaden, den ein Weltgegner am Helden anrichtet. */
export const gapDamage=(g,e)=>{const n=below(g,e);return n>0?Math.max(F.gap.damageFloor,1-n*F.gap.damagePerLevel):1;};
/** Faktor auf die Aggro-Reichweite (0 = bemerkt den Helden nicht von sich aus). */
export const gapAggro=(g,e)=>greyFoe(g,e)?0:Math.max(0,1-below(g,e)*F.gap.aggroPerLevel);

/** „Kurzer Schutz“ nach dem Aufwachen: läuft, bis die Zeit um ist oder der Held selbst kämpft. */
export const wakeGuarded=g=>g?.player?.wakeGuard>0&&!(g.player.inCombat>0);
export function startWakeGuard(g){g.player.wakeGuard=F.wakeGuard;}
export function tickWakeGuard(g,dt){const p=g.player;if(!(p.wakeGuard>0))return;p.wakeGuard=p.inCombat>0?0:Math.max(0,p.wakeGuard-dt);}
/** Faktor auf die Reichweite, mit der ein Gegner den Helden bemerkt. */
export const noticeFactor=(g,e)=>!worldFoe(e)?1:wakeGuarded(g)?0:gapAggro(g,e);

/** Gegner, die gerade kämpfen (gegen den Helden oder seine Söldner). */
export const engagedFoes=g=>(g.enemies||[]).filter(o=>o.hp>0&&o.aggro&&o.ai==='combat'&&!o.dummy&&!o.remoteTarget);
/** Kettenzug („Kumpel kommt“): nicht für graue Gegner, nicht im Aufwach-Schutz, höchstens pack.max Gegner zugleich.
 *  Blockiert, verfällt die Wartezeit: Nach einem Kill kommt der nächste Kumpel erst wieder nach chainJoinDelay. */
export function chainAllowed(g,e){
 if(!worldFoe(e))return true;
 if(greyFoe(g,e)||wakeGuarded(g)){e.joinAt=null;return false;}
 /* Die Obergrenze zählt erst im Moment des Beitritts – die Prüfung läuft je Takt für jeden ruhenden Gegner und bleibt so billig. */
 if(e.joinAt!=null&&g.time>=e.joinAt&&engagedFoes(g).length>=F.pack.max){e.joinAt=null;return false;}
 return true;
}
/** Ankündigung (E-72 Runde 5, Kenner-Nachtest 26.09.): Ein Weltgegner, der dich von sich aus bemerkt, zeigt es an – „!“ über dem Kopf,
 *  Menschen rufen ihre Zeile. Fernkämpfer (Ruhewart, Schnorrer, Praktikant, Lager-Ruhewarte) warfen bisher im Augenblick des Bemerkens
 *  aus 18 m (Autoangriff 145 Einheiten ≥ Aggro-Reichweite 100): Der Kenner notierte seinen Tod „vermutlich durch einen Ruhewart“.
 *  Jetzt zücken sie alert.ranged s lang den Block (roter Balken unter dem Namen) und greifen erst danach an. Wer in der Zeit Abstand
 *  nimmt (weiter als alert.calm × Bemerk-Reichweite), ist ihnen egal. Nahkämpfer laufen ohnehin erst heran – sie zeigen nur das „!“.
 *  Wer selbst angreift oder über den Kettenzug („Kumpel kommt“) dazukommt, kündigt nichts an. */
export function announce(g,e,range){
 if(!worldFoe(e))return false;
 const wind=e.autoAttack?.ranged?F.alert.ranged:0;
 e.alertMarkUntil=g.time+Math.max(F.alert.show,wind);e.alertEnd=wind?g.time+wind:0;e.alertTotal=wind;e.alertRange=range;e.alertHp=e.hp;
 const lines=ENEMY_BARKS[e.archetype];if(lines?.length&&g.bark?.(e,lines[((e.id|0)+(e.spawnCount|0))%lines.length],'enemy'))e.announced=g.time;
 return true;
}
/** Zückt e gerade den Block? Anteil 0…1 der Ankündigung für den Balken, sonst null. */
export const alertProgress=(g,e)=>e?.alertEnd>g.time&&e.alertTotal>0?1-(e.alertEnd-g.time)/e.alertTotal:null;
/** „!“ über dem Kopf zeigen? */
export const alertShown=(g,e)=>e?.alertMarkUntil>g.time;
/** Je Takt für jeden kämpfenden Gegner. → 'hold' (zückt noch den Block: nicht bewegen, nicht angreifen), 'calm' (Held ist weg:
 *  Gegner lässt ab) oder false (Kampf läuft). Ein Treffer des Helden beendet die Ankündigung sofort. */
export function alertState(g,e,d){
 if(!e.alertEnd)return false;
 /* getroffen – oder veraltet: lief die Ankündigung ab, ohne dass hier gerechnet wurde (Held tot, Gegner zog ab, Söldner im Kampf) */
 if(e.hp<e.alertHp||g.time>e.alertEnd+.25){e.alertEnd=0;return false;}
 if(g.time<e.alertEnd)return 'hold';
 e.alertEnd=0;if(d>(e.alertRange||e.aggroRange)*F.alert.calm){e.alertMarkUntil=0;return 'calm';}
 return false;
}
/** Die Angriffszeile beim ersten Spezialangriff entfällt, wenn der Gegner gerade erst beim Bemerken gerufen hat. */
export const barkedOnNotice=(g,e)=>g.time-(e.announced??-1e9)<F.alert.barkKeep;
/** Spezialangriffe eines Rudels nicht im Gleichschlag: zwischen zwei Starts liegen mindestens pack.specialGap s.
 *  → true, wenn e jetzt beginnen darf; sonst wartet e (attackTimer) auf seinen Platz. */
export function specialSlot(g,e){
 if(!worldFoe(e))return true;
 const wait=F.pack.specialGap-(g.time-(g.packSpecialAt??-1e9));
 if(wait>0&&engagedFoes(g).filter(worldFoe).length>1){e.attackTimer=wait;return false;}
 g.packSpecialAt=g.time;return true;
}
