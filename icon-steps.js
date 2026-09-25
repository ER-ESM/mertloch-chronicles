// Anzeigestufen der Symbole (Icon-Review R0, Stilbibel A4): nur 48 / 32 / 24 px, intrinsische Canvas-Größe = CSS-Größe, 1:1.
// Kein CSS-Verkleinern, kein nächster Nachbar im Browser. Jeder Anzeigeort hat hier seine Stufe; icon-steps.css zeigt den Canvas
// genau so groß (Prüfung: tests/icon-steps.test.mjs). Verkleinert wird nur beim Malen, per Flächenmittel (content-art.js drawPixelRect).
export const STEPS=[48,32,24];
export const ICON_STEP={
 bar:48,             // Aktionsleiste: 48 vollflächig im 52er-Knopf, der Knopf ist der Rahmen (WoW)
 barSpecial:32,      // Leer/Q neben der Leiste: 32 im 36er-Knopf
 barNarrow:24,       // schmales Fenster ohne Touch (≤ 760 px): jeder Leistenplatz 24 im 28er-Knopf
 touch:48,           // Touch-Kniffknöpfe ab 52 px (Normal/Groß): 48 vollflächig
 touchSmall:32,      // Touch-Kniffknöpfe unter 52 px (Kompakt, flach quer) und Leer/Unterbrechen: 32
 touchEditor:32,     // Touchbuttons belegen: Platz- und Kniffwahl, 32 im 48er-Knopf
 bag:48,bagTouch:32, // Rucksack: 48 im 56er-Platz; Handy 32 im 44er-Platz (24 Plätze müssen quer in 44-px-Reihen passen)
 loot:48,            // Beutefenster: 48 im 56er-Platz
 gear:32,            // Figurenplätze: 32 im 42er (Handy 44er) Platz
 book:48,bookTouch:32, // Kniff-Buch und Eigenarten: 48 im 52er-Feld; Handy 32 im 44er-Feld
 tooltip:32,         // Tooltip-Kopf (Gegenstand, Kniff, Talent, Vergleich)
 talent:48,talentTouch:32, // Talentknoten: 48 im 52er-Knoten; Handy 32 im 44er-Knoten (Reihenabstand 52 px)
 talentDetail:48,    // Detailkopf der Talentansicht
 specTab:24,         // Spez-Reiter (Wappen in der Titelzeile)
 specLocked:48,      // Wappen der Vorschau vor Stufe 5 (72er-Feld)
 pathTab:24,         // Pfadreiter unter dem Baum
 chat:24,chip:24,    // Chat-Beutezeile, Chips (Beute-Moment)
 reward:32,          // Belohnungskacheln im Auftragsfenster (36er-Kachel)
 dungeonLoot:32,     // Beute-Symbole auf Eingangskarte und im Dungeon-Journal (40er, Handy 44er)
 rewardOption:48,    // Questbelohnung zur Wahl
 roll:48,            // Würfelfenster der Gruppe (52er-Rahmen)
 aura:32,            // Stärkungen am Spielerrahmen (44er-Knopf)
 profession:32,professionDetail:48, // Berufefenster: Listen 32, Rezeptkopf 48
 shop:48,shopTouch:32 // Laden: Warenkarte und Verkaufsplätze 48, Handy-Verkaufsplätze 32
};
/** Touch-Schicht aktiv (mobile-controls.js setzt `touch-mode` am body vor dem ersten Fenster). */
export const touchMode=()=>typeof document!=='undefined'&&!!document.body?.classList.contains('touch-mode');
/** Stufe eines Anzeigeorts; `<ort>Touch` gilt, solange die Touch-Schicht aktiv ist. */
export const iconStep=place=>(touchMode()&&ICON_STEP[place+'Touch'])||ICON_STEP[place];
/** Schmales Fenster ohne Touch: die Leiste rückt auf 28er-Knöpfe (icon-steps.css, gleiche Grenze). */
export const narrowBar=()=>typeof matchMedia==='function'&&matchMedia('(max-width:760px)').matches;
export const barStep=(special=false)=>narrowBar()?ICON_STEP.barNarrow:special?ICON_STEP.barSpecial:ICON_STEP.bar;
/** Touch-Kniffknopf: ab 52 px Kantenlänge 48 (2 px Rand), darunter 32. */
export const touchStep=size=>size>=52?ICON_STEP.touch:ICON_STEP.touchSmall;
