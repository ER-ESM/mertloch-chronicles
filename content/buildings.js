// Basisbau: Die Bude des Poo-Tang-Clans wird in Akt 1 Stück für Stück wieder aufgebaut. Jedes Gebäude hat einen Paten
// (NPC an der Bude), Ausbaustufen mit Materialkosten (IDs aus items.js) und einen Vorteil je Stufe (effect, Schlüssel aus
// BUILDING_EFFECTS). Freischaltung je Kapitel (unlock.chapter = abgeholte Kapitelbelohnung). Engine-Bedarf: content/BACKLOG.md.
// Speicher: buildings[id] = erreichte Stufe (0 = Trümmer). Stufen sind kumulativ: Stufe 2 setzt Stufe 1 voraus.
export const BUILDING_EFFECTS={
 restRegen:'Regeneration außerhalb des Kampfes (Faktor, additiv zu Procs)',
 foodHeal:'Heilung und Randale aus Verpflegung (Anteil)',
 consumableCd:'Abklingzeit der Verpflegung (Sekunden weniger)',
 coinDrop:'Chance auf Pfandmarken bei menschlichen Gegnern (additiv)',
 gearChance:'Chance auf gewürfelte Ausrüstung (additiv)',
 xpBonus:'Erfahrung aus Kills und Aufträgen (Anteil)',
 damageTaken:'Erlittener Schaden (Faktor, unter 1 = weniger)',
 buffDuration:'Dauer der Klassen-Stärkung (Anteil)',
 dashCd:'Abklingzeit von Ausweichen (Anteil weniger)',
 energyOnKill:'Randale je Kill (flach)',
 respawnHp:'Leben nach dem Erwachen bei St. Gangolf (Anteil vom Maximum)'
};
export const BUILDINGS={
 tresen:{name:'Der Tresen',owner:'dieter',unlock:{chapter:2},icon:'maul',
  text:'Ohne Tresen kein Clan. Dieter baut ihn aus Paletten, Bierdeckeln und Sturheit. Jede Stufe macht die Pause an der Bude wertvoller.',
  look:'Tresen aus Europaletten, Bierdeckel als Fliesen, Kronkorken-Leiste, dahinter Dieter mit Kelle',
  stages:[
   {stage:1,name:'Bierdeckel-Tresen',cost:{palettenholz:6,kronkorken:10},effect:{restRegen:.25},text:'Sechs Paletten, ein Bierdeckel als Baugenehmigung. Schief, aber du kannst dich anlehnen. Regeneration außerhalb des Kampfes +25 %.'},
   {stage:2,name:'Tresen mit Zapfhahn',cost:{palettenholz:10,kabel:4,dosenblech:6},unlock:{chapter:3},effect:{restRegen:.5,respawnHp:.25},text:'Kevin hat einen Zapfhahn angeschlossen. An was, sagt er nicht. Regeneration +50 %, nach dem Erwachen bei St. Gangolf +25 % Leben.'},
   {stage:3,name:'Der Stammtisch',cost:{palettenholz:16,kronkorken:30,borste:8},unlock:{chapter:4},effect:{restRegen:.75,respawnHp:.5,buffDuration:.1},text:'Ein Tisch, an dem alle sitzen. Auch Sigi. Regeneration +75 %, Erwachen mit 50 % Leben, Stärkung 10 % länger.'}]},
 grill:{name:'Oskars Grill',owner:'oskar',unlock:{chapter:2},icon:'food',
  text:'Der Grill lag auf der Seite, Oskar daneben. Beide stehen wieder. Verpflegung wird besser, je runder der Grill.',
  look:'Halbierte Öltonne auf Beinen, Rost aus Einkaufswagen, Oskar mit Zange und Schürze',
  stages:[
   {stage:1,name:'Tonnengrill',cost:{dosenblech:8,kabel:2},effect:{foodHeal:.15},text:'Eine halbe Öltonne. Oskar sagt, das Aroma kommt vom Rost. Verpflegung heilt 15 % mehr.'},
   {stage:2,name:'Grill mit Warmhaltezone',cost:{dosenblech:14,palettenholz:6,feder:6},unlock:{chapter:3},effect:{foodHeal:.3,consumableCd:3},text:'Brezeln bleiben warm, Kaltgetränke bleiben kalt. Physik ist Oskar egal. Verpflegung +30 %, 3 s schneller bereit.'},
   {stage:3,name:'Der Wurstaltar',cost:{dosenblech:24,palettenholz:10,borste:10},unlock:{chapter:4},effect:{foodHeal:.45,consumableCd:5},text:'Drei Roste, ein Rauchabzug, ein Schild „Kiss the Grill“. Verpflegung +45 %, 5 s schneller bereit.'}]},
 werkstatt:{name:'Kevins Werkstatt',owner:'kevin',unlock:{chapter:2},icon:'reinforced',
  text:'Ein Kühlschrank ohne Tür, ein Pömpel, ein Lötkolben. Kevin nennt es Werkstatt. Der TÜV nennt es nicht. Mehr Beute, bessere Beute.',
  look:'Ausgeschlachteter Kühlschrank als Werkbank, Kabelbinder überall, Dosen-Drohne auf dem Regal, Warnschild „HÄLT SCHON“',
  stages:[
   {stage:1,name:'Kühlschrank-Werkbank',cost:{kabel:6,dosenblech:6},effect:{gearChance:.03},text:'Kevin repariert, was Gegner fallen lassen. Chance auf Ausrüstung +3 Punkte.'},
   {stage:2,name:'Werkstatt mit Strom',cost:{kabel:12,dosenblech:10,kronkorken:15},unlock:{chapter:3},effect:{gearChance:.06,coinDrop:.1},text:'Elke hat Strom gelegt. Offiziell von nirgendwo. Ausrüstung +6 Punkte, Pfandmarken +10 Punkte.'},
   {stage:3,name:'Pfand-Ingenieurbüro',cost:{kabel:20,dosenblech:20,'jga-shirt':4},unlock:{chapter:4},effect:{gearChance:.1,coinDrop:.2,energyOnKill:5},text:'Vier Shirts als Putzlappen, eine Drohne mit Greifarm. Ausrüstung +10, Pfandmarken +20, 5 Randale je Kill.'}]},
 anlage:{name:'Leanders Anlage',owner:'leander',unlock:{chapter:3},icon:'speaker',
  text:'Die Anlage war in Sigis Hänger, die Kabel in Kalt. Jetzt ist beides hier. Ruhe 22:01 hat schon angerufen. Erfolg. Stärkungen halten länger, Ausweichen kommt schneller.',
  look:'Turm aus Bollerboxen auf Bierkästen, Kabelsalat, Leander mit Kopfhörern und erhobenem Daumen',
  stages:[
   {stage:1,name:'Bollerbox-Turm',cost:{kabel:8,kronkorken:10},effect:{buffDuration:.1},text:'Drei Boxen, ein Takt. Die Oma drei Straßen weiter schimpft mit. Stärkung 10 % länger.'},
   {stage:2,name:'Anlage mit Subwoofer',cost:{kabel:14,dosenblech:8,palettenholz:6},unlock:{chapter:4},effect:{buffDuration:.2,dashCd:.05},text:'Der Bass ist spürbar. Auch in Kalt. Stärkung 20 % länger, Ausweichen 5 % schneller bereit.'},
   {stage:3,name:'Die Wand',cost:{kabel:24,dosenblech:16,'jga-shirt':6},unlock:{chapter:4},effect:{buffDuration:.3,dashCd:.1},text:'Eine Wand aus Boxen. Horst hat eine Petition gestartet. Gegen Wände. Stärkung 30 % länger, Ausweichen 10 % schneller.'}]},
 landhausecke:{name:'Annis Landhaus-Ecke',owner:'baerbel',unlock:{chapter:4},icon:'anni-spray',
  text:'Eine Ecke mit Kissen, Kerzen und einem Schild „Home is where the Aperol is“. Anni nennt es Lazarett. Weniger Schaden, weil du gepflegt aussiehst.',
  look:'Sofa aus Paletten mit karierten Kissen, Lichterkette, Aperol-Bar, Spiegel mit Ringlicht',
  stages:[
   {stage:1,name:'Die Kuschelecke',cost:{palettenholz:8,feder:10,dachsfell:4},effect:{damageTaken:.97},text:'Ein Sofa aus Paletten, Kissen aus Gänsefedern. Anni streicht dir übers Haar. Erlittener Schaden −3 %.'},
   {stage:2,name:'Landhaus-Lazarett',cost:{palettenholz:12,feder:16,dachsfell:8,kronkorken:20},effect:{damageTaken:.94,restRegen:.25},text:'Mit Erste-Hilfe-Koffer und Putzprovision. Schaden −6 %, Regeneration +25 %.'}]},
 pfandlager:{name:'Idas Pfandlager',owner:'ida',unlock:{chapter:4},icon:'bag',
  text:'Kästen, Kästen, Kästen. Ida zählt sie nachts. Das Lager finanziert den Clan – und deine Erfahrung, weil Ida jeden Auftrag in Pfand umrechnet.',
  look:'Regal aus Paletten voller Bierkästen, Pfandbon-Rolle, Ida mit Zollstock und Klemmbrett',
  stages:[
   {stage:1,name:'Das Kästenregal',cost:{palettenholz:10,kronkorken:20},effect:{xpBonus:.05,coinDrop:.1},text:'Zwanzig Kästen in Reih und Glied. Ida ist gerührt. Erfahrung +5 %, Pfandmarken +10 Punkte.'},
   {stage:2,name:'Das Pfandimperium',cost:{palettenholz:20,kronkorken:40,dosenblech:10},effect:{xpBonus:.1,coinDrop:.2},text:'Ein Regal wie eine Wand. Kalle hat Angst. Erfahrung +10 %, Pfandmarken +20 Punkte.'}]}
};
export const BUILDING_IDS=Object.keys(BUILDINGS);
/** Gebäude, die bei erreichtem Kapitel (abgeholte Belohnung) sichtbar sind. */
export const buildingsUnlocked=chapterClaimed=>BUILDING_IDS.filter(id=>(BUILDINGS[id].unlock?.chapter||1)<=chapterClaimed);
/** Nächste baubare Stufe eines Gebäudes oder null. */
export function nextStage(id,current=0,chapterClaimed=1){const b=BUILDINGS[id];if(!b)return null;const s=b.stages[current];if(!s)return null;if((s.unlock?.chapter||b.unlock?.chapter||1)>chapterClaimed)return null;return s;}
/** Summe aller Vorteile über die erreichten Stufen aller Gebäude. */
export function buildingEffects(state={}){const out={};for(const [id,level] of Object.entries(state)){const b=BUILDINGS[id];if(!b)continue;const s=b.stages[Math.min(level,b.stages.length)-1];if(!s)continue;for(const [k,v] of Object.entries(s.effect))out[k]=k==='damageTaken'?(out[k]??1)*v:(out[k]||0)+v;}return out;}
