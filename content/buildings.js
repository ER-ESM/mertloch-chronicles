// Basisbau: Die Bude des Poo-Tang-Clans wird in Akt 1 Stück für Stück wieder aufgebaut. Jedes Gebäude hat einen Paten
// (NPC an der Bude), Ausbaustufen mit Materialkosten (IDs aus items.js) und einen Vorteil je Stufe (effect, Schlüssel aus
// BUILDING_EFFECTS). Freischaltung je Kapitel (unlock.chapter = abgeholte Kapitelbelohnung). Engine-Bedarf: content/BACKLOG.md.
// Speicher: buildings[id] = erreichte Stufe (0 = Trümmer). Stufen sind kumulativ: Stufe 2 setzt Stufe 1 voraus.
//
// Beschreibungs-Standard (docs/backlog/klassen.md, Welle D): Jeder Basisbau-Effekt erklärt sich in BUILDING_EFFECT_INFO
// (name/short/long/unit), jede Ausbaustufe trägt `info:{effect,numbers,why,links,terms}`. Die `numbers` werden am Ende
// dieser Datei aus `stage.effect` abgeleitet (describeStage) – keine Zahl wird zweimal gepflegt. `terms` verweist auf
// content/glossary.js (Besitzer Klassendesign); zusätzliche Begriffe stehen in docs/backlog/klassen.md.

/** Erklärung je Effektschlüssel. `kind` sagt, wie der rohe Wert zur lesbaren Zahl wird (siehe effectNumber). */
export const BUILDING_EFFECT_INFO={
 restRegen:{name:'Regeneration an der Bude',kind:'pctAdd',unit:'%',
  label:'Regeneration außerhalb des Kampfes (Faktor, additiv zu Procs)',
  short:'Außerhalb des Kampfes füllt sich dein Leben um diesen Anteil schneller.',
  long:'Der Anteil wird additiv auf die Grundregeneration gerechnet und stapelt sich mit Procs aus Dorflegenden. Im Kampf wirkt er nicht – er verkürzt nur die Pause zwischen zwei Kämpfen.',
  terms:['regeneration']},
 foodHeal:{name:'Wirkung der Verpflegung',kind:'pctAdd',unit:'%',
  label:'Heilung und Randale aus Verpflegung (Anteil)',
  short:'Brezel, Bier und Bratwurst geben um diesen Anteil mehr Leben und mehr Randale.',
  long:'Der Anteil liegt auf beiden Werten eines Verpflegungsgegenstands (heal und energy aus items.js), nicht nur auf der Heilung. Er wirkt auch mitten im Kampf.',
  terms:['verpflegung','regeneration','randale']},
 consumableCd:{name:'Verpflegung schneller bereit',kind:'secLess',unit:'s',
  label:'Abklingzeit der Verpflegung (Sekunden weniger)',
  short:'Die Abklingzeit der Verpflegung sinkt um so viele Sekunden.',
  long:'Feste Sekunden, kein Anteil: bei einer Grundabklingzeit von 20 s macht −5 s daraus 15 s. Zwei Gebäude addieren ihre Sekunden.',
  terms:['verpflegung','abklingzeit']},
 coinDrop:{name:'Pfandmarken-Chance',kind:'points',unit:'Punkte Chance',
  label:'Chance auf Pfandmarken bei menschlichen Gegnern (additiv)',
  short:'Menschliche Gegner lassen um so viele Prozentpunkte häufiger Pfandmarken fallen.',
  long:'Additive Prozentpunkte auf die Grundchance, nur bei menschlichen Gegnern (Ruhewart, Schnorrer, Praktikant, Kegelbruder, Junggeselle, Bosse). Tiere zahlen kein Pfand.',
  terms:['pfandmarken','beute']},
 gearChance:{name:'Ausrüstungs-Chance',kind:'points',unit:'Punkte Chance',
  label:'Chance auf gewürfelte Ausrüstung (additiv)',
  short:'Jeder Gegner lässt um so viele Prozentpunkte häufiger ein gewürfeltes Ausrüstungsstück fallen.',
  long:'Additive Prozentpunkte auf die Beutechance für Ausrüstung. Die Seltenheit des Stücks bleibt unberührt – mehr Würfe, keine besseren Würfe.',
  terms:['beute']},
 xpBonus:{name:'Erfahrungsbonus',kind:'pctAdd',unit:'%',
  label:'Erfahrung aus Kills und Aufträgen (Anteil)',
  short:'Kills und Aufträge geben um diesen Anteil mehr Erfahrung.',
  long:'Der Anteil liegt auf beiden Quellen (Gegner und abgegebene Aufträge) und wirkt rückwirkend nicht – nur auf alles, was du nach dem Bau holst.',
  terms:['erfahrung']},
 damageTaken:{name:'Erlittener Schaden',kind:'pctLessFactor',unit:'%',
  label:'Erlittener Schaden (Faktor, unter 1 = weniger)',
  short:'Du nimmst um diesen Anteil weniger Schaden – aus jeder Quelle.',
  long:'Gespeichert als Faktor (0,97 = −3 %). Mehrere Gebäude multiplizieren ihre Faktoren, deshalb summieren sich die Prozente nicht ganz: 0,97 × 0,94 sind −8,8 %, nicht −9 %. Wirkt auf Autoangriffe, Zauber und Flächen gleichermaßen.',
  terms:['schadensminderung','deckung']},
 buffDuration:{name:'Dauer der Stärkung',kind:'pctAdd',unit:'%',
  label:'Dauer der Klassen-Stärkung (Anteil)',
  short:'Deine Klassen-Stärkung hält um diesen Anteil länger an.',
  long:'Nur die eigene Stärkung der Klasse (Dieters Bier, Annis Aperol, Kevins Ladedruck), nicht die Procs der Dorflegenden. Die Abklingzeit bleibt gleich, das Fenster wird größer.',
  terms:['staerkung','abklingzeit']},
 dashCd:{name:'Ausweichen schneller bereit',kind:'pctLess',unit:'%',
  label:'Abklingzeit von Ausweichen (Anteil weniger)',
  short:'Ausweichen ist um diesen Anteil früher wieder bereit.',
  long:'Anteil der Abklingzeit, nicht feste Sekunden: −10 % machen aus 5 s Ausweichen 4,5 s. Die Sprungweite ändert sich nicht.',
  terms:['ausweichen','abklingzeit']},
 energyOnKill:{name:'Randale je Kill',kind:'flat',unit:'Randale je Kill',
  label:'Randale je Kill (flach)',
  short:'Jeder erledigte Gegner schenkt dir so viel Randale.',
  long:'Feste Punkte, unabhängig von Gegnerstufe und Klasse. Bei Gruppen zählt jeder Gegner einzeln, deshalb trägt der Effekt im Umland am meisten.',
  terms:['randale']},
 respawnHp:{name:'Deckung beim Erwachen',kind:'pctAdd',unit:'% vom maximalen Leben',
  label:'Deckung (Schild) beim Erwachen bei St. Gangolf (Anteil vom maximalen Leben)',
  short:'Nach dem Erwachen bei St. Gangolf startest du mit so viel Deckung.',
  long:'Anteil vom maximalen Leben als Deckung (Schild), nicht als Leben – du erwachst ohnehin voll, die Deckung liegt obendrauf und hält bis sie verbraucht ist (content/BACKLOG.md „Grund-Erwachensleben“).',
  terms:['deckung']}
};
/** Kurzform für die UI (Wert + Text), abgeleitet aus BUILDING_EFFECT_INFO – keine zweite Pflegestelle. */
export const BUILDING_EFFECTS=Object.fromEntries(Object.entries(BUILDING_EFFECT_INFO).map(([k,v])=>[k,v.label]));
const round1=n=>Math.round(n*10)/10;
/** Ein Effektwert als lesbare Zahl: {label,value,unit,source,effect}. */
export function effectNumber(key,value,source=''){
 const def=BUILDING_EFFECT_INFO[key];const kind=def?.kind||'pctAdd';
 const v=kind==='pctAdd'?'+'+round1(value*100)
  :kind==='pctLess'?'−'+round1(value*100)
  :kind==='pctLessFactor'?'−'+round1((1-value)*100)
  :kind==='secLess'?'−'+round1(value)
  :kind==='points'?'+'+round1(value*100)
  :kind==='flat'?'+'+round1(value)
  :String(value);
 return {label:def?.name||key,value:v,unit:def?.unit||'',source,effect:key};
}
export const BUILDINGS={
 tresen:{name:'Der Tresen',owner:'dieter',unlock:{chapter:2},icon:'maul',
  text:'Ohne Tresen kein Clan. Dieter baut ihn aus Paletten, Bierdeckeln und Sturheit. Jede Stufe macht die Pause an der Bude wertvoller.',
  look:'Tresen aus Europaletten, Bierdeckel als Fliesen, Kronkorken-Leiste, dahinter Dieter mit Kelle',
  stages:[
   {stage:1,name:'Bierdeckel-Tresen',cost:{palettenholz:6,kronkorken:10},effect:{restRegen:.25},text:'Sechs Paletten, ein Bierdeckel als Baugenehmigung. Schief, aber du kannst dich anlehnen. Regeneration außerhalb des Kampfes +25 %.',
    info:{effect:'Anlehnen an der Bude heilt schneller: außerhalb des Kampfes füllt sich dein Leben um ein Viertel zügiger.',
     why:'Kürzere Pause zwischen zwei Kämpfen – du läufst früher wieder ins Umland, statt an der Bude zu warten.'}},
   {stage:2,name:'Tresen mit Zapfhahn',cost:{palettenholz:10,kabel:4,dosenblech:6},unlock:{chapter:3},effect:{restRegen:.5,respawnHp:.25},text:'Kevin hat einen Zapfhahn angeschlossen. An was, sagt er nicht. Regeneration +50 %, beim Erwachen bei St. Gangolf 25 % Deckung.',
    info:{effect:'Die Regeneration verdoppelt ihren Zuwachs, und nach dem Erwachen bei St. Gangolf trägst du Deckung auf dem vollen Leben.',
     why:'Der Rückweg nach einem Tod wird bezahlbar: die Deckung fängt den ersten Treffer ab, wenn du in einen noch stehenden Gegner läufst.'}},
   {stage:3,name:'Der Stammtisch',cost:{palettenholz:16,kronkorken:30,borste:8},unlock:{chapter:4},effect:{restRegen:.75,respawnHp:.5,buffDuration:.1},text:'Ein Tisch, an dem alle sitzen. Auch Sigi. Regeneration +75 %, Erwachen mit 50 % Deckung, Stärkung 10 % länger.',
    info:{effect:'Regeneration, Deckung beim Erwachen und die Dauer deiner Klassen-Stärkung steigen gemeinsam.',
     why:'Erste Stufe, die auch im Kampf wirkt: die längere Stärkung deckt bei Bossen eine zusätzliche Eskalation ab.',
     links:['anlage']}}]},
 grill:{name:'Oskars Grill',owner:'oskar',unlock:{chapter:2},icon:'food',
  text:'Der Grill lag auf der Seite, Oskar daneben. Beide stehen wieder. Verpflegung wird besser, je runder der Grill.',
  look:'Halbierte Öltonne auf Beinen, Rost aus Einkaufswagen, Oskar mit Zange und Schürze',
  stages:[
   {stage:1,name:'Tonnengrill',cost:{dosenblech:8,kabel:2},effect:{foodHeal:.15},text:'Eine halbe Öltonne. Oskar sagt, das Aroma kommt vom Rost. Verpflegung heilt 15 % mehr.',
    info:{effect:'Jede Verpflegung gibt mehr Leben und mehr Randale – der Anteil liegt auf beiden Werten.',
     why:'Dein Notheilmittel im Kampf wird stärker, ohne dass du einen Platz in der Leiste dafür bezahlst.'}},
   {stage:2,name:'Grill mit Warmhaltezone',cost:{dosenblech:14,palettenholz:6,feder:6},unlock:{chapter:3},effect:{foodHeal:.3,consumableCd:3},text:'Brezeln bleiben warm, Kaltgetränke bleiben kalt. Physik ist Oskar egal. Verpflegung +30 %, 3 s schneller bereit.',
    info:{effect:'Verpflegung wirkt stärker und ist drei Sekunden früher wieder benutzbar.',
     why:'Kürzere Abklingzeit heißt: ein zweiter Bissen im selben Bosskampf, nicht erst im nächsten.'}},
   {stage:3,name:'Der Wurstaltar',cost:{dosenblech:24,palettenholz:10,borste:10},unlock:{chapter:4},effect:{foodHeal:.45,consumableCd:5},text:'Drei Roste, ein Rauchabzug, ein Schild „Kiss the Grill“. Verpflegung +45 %, 5 s schneller bereit.',
    info:{effect:'Höchste Wirkung der Verpflegung und fünf Sekunden weniger Abklingzeit.',
     why:'Macht Verpflegung zur verlässlichen zweiten Heilung neben der Klasse – gerade für Dieter und Kevin, die keine eigene haben.'}}]},
 werkstatt:{name:'Kevins Werkstatt',owner:'kevin',unlock:{chapter:2},icon:'reinforced',
  text:'Ein Kühlschrank ohne Tür, ein Pömpel, ein Lötkolben. Kevin nennt es Werkstatt. Der TÜV nennt es nicht. Mehr Beute, bessere Beute.',
  look:'Ausgeschlachteter Kühlschrank als Werkbank, Kabelbinder überall, Dosen-Drohne auf dem Regal, Warnschild „HÄLT SCHON“',
  stages:[
   {stage:1,name:'Kühlschrank-Werkbank',cost:{kabel:6,dosenblech:6},effect:{gearChance:.03},text:'Kevin repariert, was Gegner fallen lassen. Chance auf Ausrüstung +3 Punkte.',
    info:{effect:'Jeder Gegner würfelt häufiger ein Ausrüstungsstück aus – mehr Würfe, gleiche Seltenheit.',
     why:'Beschleunigt den Ausrüstungsaufbau in Kapitel 2, wo noch fast alles vom Zufall kommt.'}},
   {stage:2,name:'Werkstatt mit Strom',cost:{kabel:12,dosenblech:10,kronkorken:15},unlock:{chapter:3},effect:{gearChance:.06,coinDrop:.1},text:'Elke hat Strom gelegt. Offiziell von nirgendwo. Ausrüstung +6 Punkte, Pfandmarken +10 Punkte.',
    info:{effect:'Doppelte Ausrüstungs-Chance und zusätzlich Pfandmarken von menschlichen Gegnern.',
     why:'Ab hier zahlen Ruhewarte und Schnorrer deinen Einkauf bei Kalle mit – Tiere weiterhin nicht.',
     links:['pfandlager']}},
   {stage:3,name:'Pfand-Ingenieurbüro',cost:{kabel:20,dosenblech:20,'jga-shirt':4},unlock:{chapter:4},effect:{gearChance:.1,coinDrop:.2,energyOnKill:5},text:'Vier Shirts als Putzlappen, eine Drohne mit Greifarm. Ausrüstung +10, Pfandmarken +20, 5 Randale je Kill.',
    info:{effect:'Höchste Beutechancen, doppelte Pfandmarken und fünf Randale für jeden erledigten Gegner.',
     why:'Die Randale je Kill trägt Gruppenkämpfe: der nächste Gegner beginnt nicht mehr bei null Ressourcen.'}}]},
 anlage:{name:'Leanders Anlage',owner:'leander',unlock:{chapter:3},icon:'speaker',
  text:'Die Anlage war in Sigis Hänger, die Kabel in Kalt. Jetzt ist beides hier. Ruhe 22:01 hat schon angerufen. Erfolg. Stärkungen halten länger, Ausweichen kommt schneller.',
  look:'Turm aus Bollerboxen auf Bierkästen, Kabelsalat, Leander mit Kopfhörern und erhobenem Daumen',
  stages:[
   {stage:1,name:'Bollerbox-Turm',cost:{kabel:8,kronkorken:10},effect:{buffDuration:.1},text:'Drei Boxen, ein Takt. Die Oma drei Straßen weiter schimpft mit. Stärkung 10 % länger.',
    info:{effect:'Deine Klassen-Stärkung läuft länger, die Abklingzeit bleibt gleich.',
     why:'Mehr Schläge im offenen Fenster – der Vorteil wächst mit jedem Kniff, den du hineinlegst.'}},
   {stage:2,name:'Anlage mit Subwoofer',cost:{kabel:14,dosenblech:8,palettenholz:6},unlock:{chapter:4},effect:{buffDuration:.2,dashCd:.05},text:'Der Bass ist spürbar. Auch in Kalt. Stärkung 20 % länger, Ausweichen 5 % schneller bereit.',
    info:{effect:'Doppelt so lange Stärkung, und Ausweichen ist anteilig früher wieder bereit.',
     why:'Die erste Stufe, die deine Verteidigung anfasst: kürzere Wartezeit auf Ausweichen heißt mehr Flächen, aus denen du herauskommst.',
     links:['tresen']}},
   {stage:3,name:'Die Wand',cost:{kabel:24,dosenblech:16,'jga-shirt':6},unlock:{chapter:4},effect:{buffDuration:.3,dashCd:.1},text:'Eine Wand aus Boxen. Horst hat eine Petition gestartet. Gegen Wände. Stärkung 30 % länger, Ausweichen 10 % schneller.',
    info:{effect:'Höchste Dauer der Stärkung und zehn Prozent weniger Wartezeit auf Ausweichen.',
     why:'Bei Bossen mit zwei Ausweich-Zaubern im Muster (Sigi, Klaus, Timo) entscheidet genau diese Wartezeit über den zweiten Sprung.'}}]},
 landhausecke:{name:'Annis Landhaus-Ecke',owner:'baerbel',unlock:{chapter:4},icon:'anni-spray',
  text:'Eine Ecke mit Kissen, Kerzen und einem Schild „Home is where the Aperol is“. Anni nennt es Lazarett. Weniger Schaden, weil du gepflegt aussiehst.',
  look:'Sofa aus Paletten mit karierten Kissen, Lichterkette, Aperol-Bar, Spiegel mit Ringlicht',
  stages:[
   {stage:1,name:'Die Kuschelecke',cost:{palettenholz:8,feder:10,dachsfell:4},effect:{damageTaken:.97},text:'Ein Sofa aus Paletten, Kissen aus Gänsefedern. Anni streicht dir übers Haar. Erlittener Schaden −3 %.',
    info:{effect:'Alles, was dich trifft, trifft schwächer – Autoangriff, Zauber und Fläche gleichermaßen.',
     why:'Wirkt auch dort, wo Ausweichen nicht hilft: gegen Autoangriffe und auf dem Weg aus einer Fläche heraus.'}},
   {stage:2,name:'Landhaus-Lazarett',cost:{palettenholz:12,feder:16,dachsfell:8,kronkorken:20},effect:{damageTaken:.94,restRegen:.25},text:'Mit Erste-Hilfe-Koffer und Putzprovision. Schaden −6 %, Regeneration +25 %.',
    info:{effect:'Doppelte Schadensminderung, dazu schnellere Regeneration außerhalb des Kampfes.',
     why:'Die beiden Werte greifen ineinander: weniger Schaden bedeutet weniger nachzufüllendes Leben in der Pause.',
     links:['tresen']}}]},
 pfandlager:{name:'Idas Pfandlager',owner:'ida',unlock:{chapter:4},icon:'bag',
  text:'Kästen, Kästen, Kästen. Ida zählt sie nachts. Das Lager finanziert den Clan – und deine Erfahrung, weil Ida jeden Auftrag in Pfand umrechnet.',
  look:'Regal aus Paletten voller Bierkästen, Pfandbon-Rolle, Ida mit Zollstock und Klemmbrett',
  stages:[
   {stage:1,name:'Das Kästenregal',cost:{palettenholz:10,kronkorken:20},effect:{xpBonus:.05,coinDrop:.1},text:'Zwanzig Kästen in Reih und Glied. Ida ist gerührt. Erfahrung +5 %, Pfandmarken +10 Punkte.',
    info:{effect:'Kills und Aufträge geben mehr Erfahrung, menschliche Gegner häufiger Pfandmarken.',
     why:'Zieht die Stufe nach, während du ohnehin Aufträge läufst – und bezahlt nebenbei den Händler.',
     links:['werkstatt']}},
   {stage:2,name:'Das Pfandimperium',cost:{palettenholz:20,kronkorken:40,dosenblech:10},effect:{xpBonus:.1,coinDrop:.2},text:'Ein Regal wie eine Wand. Kalle hat Angst. Erfahrung +10 %, Pfandmarken +20 Punkte.',
    info:{effect:'Doppelter Erfahrungsbonus und doppelte Pfandmarken-Chance.',
     why:'Letzter Ausbau vor Kapitel 5: Stufe und Geldbeutel wachsen gleichzeitig, damit die Ausrüstung mithält.'}}]}
};
export const BUILDING_IDS=Object.keys(BUILDINGS);
/** Gebäude, die bei erreichtem Kapitel (abgeholte Belohnung) sichtbar sind. */
export const buildingsUnlocked=chapterClaimed=>BUILDING_IDS.filter(id=>(BUILDINGS[id].unlock?.chapter||1)<=chapterClaimed);
/** Nächste baubare Stufe eines Gebäudes oder null. */
export function nextStage(id,current=0,chapterClaimed=1){const b=BUILDINGS[id];if(!b)return null;const s=b.stages[current];if(!s)return null;if((s.unlock?.chapter||b.unlock?.chapter||1)>chapterClaimed)return null;return s;}
/** Summe aller Vorteile über die erreichten Stufen aller Gebäude. */
export function buildingEffects(state={}){const out={};for(const [id,level] of Object.entries(state)){const b=BUILDINGS[id];if(!b)continue;const s=b.stages[Math.min(level,b.stages.length)-1];if(!s)continue;for(const [k,v] of Object.entries(s.effect))out[k]=k==='damageTaken'?(out[k]??1)*v:(out[k]||0)+v;}return out;}
/** Vollständige Erklärung einer Ausbaustufe: geschriebener Teil plus abgeleitete Zahlen. `stage` ist 1-basiert. */
export function describeStage(id,stage){
 const b=BUILDINGS[id];const s=b?.stages?.[stage-1];if(!s)return null;
 const base=s.info||{};const source=b.name+' · '+s.name;
 const numbers=Object.entries(s.effect).map(([k,v])=>effectNumber(k,v,source));
 const terms=[...new Set([...(base.terms||[]),...Object.keys(s.effect).flatMap(k=>BUILDING_EFFECT_INFO[k]?.terms||[]),'basisbau'])];
 return {effect:base.effect||'',numbers,why:base.why||'',links:[...new Set([...(base.links||[])])],terms};
}
// Zahlen einmal ableiten und an der Stufe ablegen – die UI liest `stage.info`, ohne selbst rechnen zu müssen.
for(const [id,b] of Object.entries(BUILDINGS))b.stages.forEach((s,i)=>{s.info=describeStage(id,i+1);});
