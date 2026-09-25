// Seconds between attacks; ranges are world units (8 units = 1 metre).
export const AUTO_ATTACK={id:'auto',name:'Autoangriff · Leergut läuft',text:'Ein-/ausschalten: Greift dein Ziel selbstständig im Waffentempo an. Nahkampf trifft auch in Bewegung. Fernkampf nutzt den Fernkampfplatz. Während du zauberst, pausieren die Schläge. Ein offensiver Kniff startet den Autoangriff ebenfalls; ein Ziel nur anzuwählen greift es nicht an.',cd:0,cost:0,offGcd:true,auto:true,icon:'auto',color:'#eac981',bg:'#425e37'};
export const AUTO_KITS={dieter:{name:'Autoangriff · Flasche kreist',weaponSource:'melee',range:45},baerbel:{name:'Autoangriff · Dauersprühen',weaponSource:'ranged',range:155},kevin:{name:'Autoangriff · Pfand im Takt',weaponSource:'ranged',range:195},schorsch:{name:'Autoangriff · Zangenklapper',weaponSource:'melee',range:45},kaethe:{name:'Autoangriff · Kartenschnipsen',weaponSource:'ranged',range:170}};
export const ENEMY_AUTOS={
 boar:{name:'Hauer',min:32,max:44,speed:2.1,range:38},badger:{name:'Dachsbiss',min:22,max:32,speed:1.8,range:35},goose:{name:'Wadenkneifer',min:15,max:23,speed:1.35,range:34},raven:{name:'Schnabelhieb',min:13,max:20,speed:1.2,range:34},fox:{name:'Fuchsbiss',min:24,max:34,speed:1.6,range:36},
 warden:{name:'Aktenklammerwurf',min:26,max:38,speed:2.4,range:145,ranged:true},scrounger:{name:'Becherwurf',min:22,max:32,speed:2.2,range:130,ranged:true},inspector:{name:'Stempelwurf',min:30,max:42,speed:2.3,range:150,ranged:true},
 oberpraktikant:{name:'Dienstmützen-Wurf',min:34,max:46,speed:2.3,range:150,ranged:true},
 horst:{name:'Ordnerkante',min:46,max:64,speed:2.6,range:58},elite:{name:'Alphahauer',min:40,max:54,speed:2.1,range:43},gisela:{name:'Kannenschlag',min:55,max:72,speed:2.7,range:60},automat:{name:'Greifarm',min:60,max:85,speed:2.9,range:65}
};
export const COMBAT_RULES={unarmed:{min:3,max:5,speed:2},specialInterval:5.5,firstSpecial:3,lootRange:43};
export const COMBAT_TEXT={surge:'In Fahrt',surgeHint:'In Fahrt: Spezialkniff +20 %',needResources:'Nicht genug Randale. Dein Aufbaukniff lädt sie wieder auf.',moving:'Zum Zaubern stehen bleiben.',cancelled:'Zauber abgebrochen: Du bewegst dich.',busy:'Du wirkst bereits einen Zauber.',notReady:'Noch nicht bereit.',noTarget:'Kein Ziel.',lostTarget:'Zauber abgebrochen: Ziel nicht mehr erreichbar.',autoOn:'Autoangriff an.',autoOff:'Autoangriff aus.',casting:'Wird gewirkt',instant:'Sofort',damage:'Schaden',weaponDamage:'Autoschaden',fixed:'Fester Schaden',underAttack:'Du kriegst auf die Fresse von',cooldown:(name,sekunden)=>name+' muss noch verschnaufen · '+sekunden+' s.'};
// (flat + weapon × rolled auto damage) × (1 + bonusPct).
// No damage model = legacy fixed values, so old content can migrate incrementally.
// E-60: Finisher Waffe ×9,9 → ×5,2 (Nutzerbefund: der Bierzelt-Abriss oneshottete auf Stufe 3 jeden Feldgegner), Aufbaukniff ×2 → ×2,6.
// Gleicher Waffenfaktor für alle Klassen; der Klassenabstand steht im festen Anteil (Bärbel castet 1,1 s und trifft Nachbarn).
export const SKILL_DAMAGE={
 dieter:{strike:{flat:14,weapon:2.6},burst:{flat:30,weapon:5.2}},
 baerbel:{strike:{flat:14,weapon:2.6},burst:{flat:40,weapon:5.2}},
 kevin:{strike:{flat:8,weapon:2.6},burst:{flat:34,weapon:5.2}},
 // E-72: Schorsch serviert den Schwenkbraten mit Finisher-Faktor; Käthes Kreuz-Karte rechnet mit strike (Rang × Stärke), Karo mit control.
 schorsch:{strike:{flat:16,weapon:2.6},burst:{flat:36,weapon:5.2}},
 kaethe:{strike:{flat:30,weapon:2.2},burst:{flat:30,weapon:2.2}},
 shared:{throw:{flat:24,weapon:3},ground:{flat:125},interrupt:{flat:35},slam:{flat:44,weapon:3}}
};
// Markierung und Wurf gehen in Bewegung; nur Finisher, Heilung und Bodenzauber brauchen den Stand.
export const CAST_TIMES={schorsch:{ground:.5},kaethe:{ground:.6},dieter:{ground:.8},baerbel:{burst:1.1,heal:1.25,ground:1,sanctuary:1},kevin:{burst:1.1,ground:1,detonate:.8}};

// --- Beschreibungs-Standard (docs/backlog/klassen.md, Welle D) -----------------------------------------------------
// Zwei Erklärschichten: AUTO_INFO/describeAuto erklärt den Autoangriff jedes Gegners (was er tut, Zahlen, was du
// dagegen tust), COMBAT_RULE_INFO erklärt jede Kampfregel mit einer Zahl in einem glossartauglichen Satz. Klassendesign
// verweist aus content/glossary.js hierher (`rules` nennt die Quelle im Datensatz), statt die Zahlen zu wiederholen.
const m=units=>Math.round(units/8*10)/10;
/** Geschriebener Teil je Gegner-Autoangriff; die Zahlen kommen aus ENEMY_AUTOS selbst. */
export const AUTO_INFO={
 boar:{effect:'Der Keiler hakt die Hauer ein, sobald er an dir klebt – der härteste Tier-Autoangriff im Umland.',why:'Nahkampf: er schlägt weiter, während du zauberst. Wer zaubern will, tut es nach einer Parade, nicht mittendrin.'},
 badger:{effect:'Der Dachs beißt schnell und flach zu.',why:'Der günstigste Autoangriff im Spiel – hier kannst du in Ruhe deine Rotation lernen.'},
 goose:{effect:'Die Gans kneift in die Wade, dafür im schnellsten Takt aller Tiere.',why:'Wenig je Treffer, viele Treffer: gefährlich nur, wenn drei davon gleichzeitig an dir hängen.',terms:['randale']},
 raven:{effect:'Der Rabe hackt im Vorbeiflug nach dem Leergut in deiner Hand.',why:'Kleinster Schaden im Spiel; er kostet dich Zeit, nicht Leben.'},
 fox:{effect:'Der Fuchs beißt kurz zu und setzt sofort zurück.',why:'Sein Autoangriff ist die Hälfte seines Schadens – ihn nur zu unterbrechen reicht nicht, er muss fallen.'},
 warden:{effect:'Der Ruhewart wirft Aktenklammern über die ganze Streifendistanz.',why:'Fernkampf: Weglaufen hilft nicht, nur Deckung nehmen oder ihn schnell schließen.',terms:['deckung']},
 scrounger:{effect:'Der Schnorrer wirft leere Becher nach dir, sobald du außer Reichweite bist.',why:'Sein Wurf ist schwächer als sein Zauber – ihn im Nahkampf zu binden kostet dich am wenigsten.'},
 inspector:{effect:'Der Praktikant stempelt aus der Ferne, mit der weitesten Wurfdistanz der Menschen.',why:'Er hält Abstand und zaubert dabei: schließ die Lücke, dann fällt beides weg.'},
 oberpraktikant:{effect:'Olaf wirft die viel zu große Dienstmütze – härtester Wurf der Menschen.',why:'Elite mit Fernkampf-Autoangriff: der Schaden läuft nebenher, während du seine vier Zauber beantwortest.',terms:['elite']},
 horst:{effect:'Horst schlägt mit der Ordnerkante zu, sobald du in Reichweite stehst.',why:'Erster Boss-Autoangriff, der wehtut: zwischen seinen Zaubern gehört die Parade bereit.'},
 elite:{effect:'Der Alphahauer trifft schwerer und etwas weiter als der Feldkeiler.',why:'Elite-Kämpfe dauern doppelt so lange – über die Zeit ist der Autoangriff der größere Teil des Schadens.',terms:['elite']},
 gisela:{effect:'Gisela schlägt mit der vollen Gießkanne zu.',why:'Ihre Nahkampfreichweite ist größer, als sie aussieht – zwei Schritte Abstand sind keine Deckung.'},
 automat:{effect:'Der Greifarm fährt aus und packt zu – härtester Autoangriff im Spiel.',why:'Bei diesem Takt zählt jede Sekunde im Nahbereich: Fernkämpfer bleiben draußen, Dieter pariert.'}
};
/** Vollständige Erklärung eines Gegner-Autoangriffs: geschriebener Teil plus abgeleitete Zahlen. */
export function describeAuto(id){
 const a=ENEMY_AUTOS[id];if(!a)return null;const base=AUTO_INFO[id]||{};const src='ENEMY_AUTOS.'+id;
 const numbers=[{label:'Schaden je Treffer',value:a.min+'–'+a.max,unit:'Punkte',source:src+'.min/max'},
  {label:'Schlagtempo',value:a.speed,unit:'s zwischen zwei Schlägen',source:src+'.speed'},
  {label:'Reichweite',value:a.range,unit:'Einheiten (≈ '+m(a.range)+' m)',source:src+'.range'},
  {label:'Schaden je Sekunde',value:Math.round((a.min+a.max)/2/a.speed*10)/10,unit:'Punkte/s',source:'berechnet aus min/max/speed'}];
 return {effect:base.effect||'',numbers,why:base.why||'',links:[],terms:[...new Set(['autoangriff',...(base.terms||[]),...(a.ranged?['reichweite']:['parade'])])]};
}
for(const id of Object.keys(ENEMY_AUTOS))ENEMY_AUTOS[id].info=describeAuto(id);
/** Jede Kampfregel mit einer Zahl als Glossareintrag: name/short/long plus die Zahlen und ihre Quelle.
 *  `rules` nennt die abgedeckten Pfade in COMBAT_RULES – die Prüfung in checks/gameplay.js verlangt Vollständigkeit. */
export const COMBAT_RULE_INFO={
 unarmed:{name:'Ohne Waffe',rules:['unarmed.min','unarmed.max','unarmed.speed'],terms:['autoangriff'],
  short:'Ohne Waffe in der Hand schlägst du für 3–5 Punkte alle 2 Sekunden zu.',
  long:'Der unbewaffnete Schlag ist bewusst lächerlich: er hält den Autoangriff am Leben, damit Ressourcen weiter tropfen, taugt aber zu nichts. Jede Waffe ist besser, auch eine kaputte. Kniffe mit Waffenanteil (SKILL_DAMAGE.weapon) rechnen ebenfalls mit diesem Wert, solange die Hand leer ist.',
  numbers:[{label:'Schaden je Schlag',value:COMBAT_RULES.unarmed.min+'–'+COMBAT_RULES.unarmed.max,unit:'Punkte',source:'COMBAT_RULES.unarmed'},
   {label:'Schlagtempo',value:COMBAT_RULES.unarmed.speed,unit:'s',source:'COMBAT_RULES.unarmed.speed'}]},
 specialInterval:{name:'Zauberabstand der Gegner',rules:['specialInterval'],terms:['zauberzeit','abklingzeit'],
  short:'Ein Gegner zaubert höchstens alle 5,5 Sekunden; dazwischen schlägt nur sein Autoangriff.',
  long:'Der Abstand gilt je Gegner, nicht je Gruppe – drei Gänse können ihre Zauber verschränken. Er ist auch dein Zeitfenster: nach einer beantworteten Fähigkeit hast du gut fünf Sekunden, in denen nur der Autoangriff läuft und du gefahrlos zaubern kannst.',
  numbers:[{label:'Abstand zwischen zwei Zaubern',value:COMBAT_RULES.specialInterval,unit:'s',source:'COMBAT_RULES.specialInterval'}]},
 firstSpecial:{name:'Schonfrist zu Kampfbeginn',rules:['firstSpecial'],terms:['zauberzeit'],
  short:'Erst 3 Sekunden nach Kampfbeginn wirkt ein Gegner seinen ersten Zauber.',
  long:'Die Schonfrist gibt dir den Eröffnungszug: Markierung setzen, in Position laufen, den Fernkampfplatz suchen. Sie läuft je Gegner ab dem Moment, in dem er dich angreift – bei einer Gruppe also gestaffelt, wenn du sie gestaffelt ziehst.',
  numbers:[{label:'Vorlauf bis zum ersten Zauber',value:COMBAT_RULES.firstSpecial,unit:'s',source:'COMBAT_RULES.firstSpecial'}]},
 lootRange:{name:'Beutereichweite',rules:['lootRange'],terms:['beute','pfandmarken'],
  short:'Beute hebst du bis 43 Einheiten (rund 5 Meter) auf.',
  long:'Dieselbe Entfernung gilt für das Aufheben von Hand und für das automatische Einsammeln. Wer im Kampf wegläuft, lässt Beute liegen, bis er zurückkommt – Beute verschwindet nicht, aber sie läuft dir auch nicht nach.',
  numbers:[{label:'Reichweite',value:COMBAT_RULES.lootRange,unit:'Einheiten (≈ '+m(COMBAT_RULES.lootRange)+' m)',source:'COMBAT_RULES.lootRange'}]},
 autoRange:{name:'Reichweite des eigenen Autoangriffs',rules:[],terms:['autoangriff','reichweite'],
  short:'Dieter schlägt bis 45 Einheiten zu, Anni sprüht bis 155, Kevin wirft bis 195.',
  long:'Die Reichweite entscheidet, wie viel eines Kampfes du überhaupt bestreiten kannst: Nahkämpfer müssen nach jeder Fläche zurücklaufen, Fernkämpfer nutzen den Fernkampfplatz und verlieren kaum Schläge. Der Autoangriff pausiert, solange du zauberst.',
  numbers:Object.entries(AUTO_KITS).map(([k,v])=>({label:'Reichweite '+k,value:v.range,unit:'Einheiten (≈ '+m(v.range)+' m)',source:'AUTO_KITS.'+k+'.range'}))},
 castTime:{name:'Eigene Zauberzeit',rules:[],terms:['zauberzeit','ausweichen'],
  short:'Nur Finisher, Heilung und Bodenzauber brauchen Stand – zwischen 0,8 und 1,25 Sekunden.',
  long:'Markierung und Wurf gehen in Bewegung, alles andere bricht ab, sobald du dich bewegst (COMBAT_TEXT.cancelled). Deshalb kostet jede Fläche, die du verlassen musst, genau einen Finisher – und deshalb lohnt es, den Finisher direkt nach einer beantworteten Fähigkeit zu setzen.',
  numbers:Object.entries(CAST_TIMES).flatMap(([cls,t])=>Object.entries(t).map(([skill,sec])=>({label:cls+' · '+skill,value:sec,unit:'s',source:'CAST_TIMES.'+cls+'.'+skill})))},
 skillDamage:{name:'Schadensmodell der Kniffe',rules:[],terms:['waffenschaden','randale'],
  short:'Kniffschaden ist ein fester Sockel plus ein Vielfaches deines Autoschadens.',
  long:'Formel: (flat + weapon × gewürfelter Autoschaden) × (1 + Bonusanteil). Deshalb hebt jede bessere Waffe alle Kniffe mit, und deshalb ist der Waffenfaktor (weapon) die Stellschraube für Klassenabstand – nicht der Sockel.',
  numbers:Object.entries(SKILL_DAMAGE).flatMap(([cls,skills])=>Object.entries(skills).map(([skill,d])=>({label:cls+' · '+skill,value:Object.entries(d).map(([k,v])=>k+' '+v).join(', '),unit:'',source:'SKILL_DAMAGE.'+cls+'.'+skill})))},
 enemyAuto:{name:'Autoangriff der Gegner',rules:[],terms:['autoangriff','parade'],
  short:'Jeder Gegner schlägt neben seinen Zaubern dauernd im eigenen Takt zu – 1,2 bis 2,9 Sekunden je nach Art.',
  long:'Der Autoangriff läuft unabhängig vom Zaubermuster weiter und ist über einen langen Kampf die größere Schadensquelle. Fernkämpfer (ranged) treffen dich über die ganze Distanz; gegen sie hilft nur Deckung oder Nähe. Zahlen je Art in ENEMY_AUTOS.',
  numbers:Object.entries(ENEMY_AUTOS).map(([id,a])=>({label:a.name,value:a.min+'–'+a.max+' / '+a.speed+' s',unit:a.ranged?'Fernkampf':'Nahkampf',source:'ENEMY_AUTOS.'+id}))}
};
// Runde 5a (2026-09-24, Kenner-Endurteil): Todesbildschirm, Auftragszeilen am Gegner, Ausweich-Rückmeldung, Autopilot-Stopp.
export const DEATH_UI={
 title:'Du bist umgekippt',wake:'Aufwachen bei St. Gangolf',wakeNote:'Volle Leben, kurzer Schutz. Aufträge und Erfahrung bleiben.',
 by:'Umgehauen von',ground:'Rote Fläche',groundNote:'Aus roten Flächen herauslaufen oder mit Ausweichen herausspringen.',
 others:n=>'+'+n+' weitere Angreifer',othersNote:'Mehrere Gegner zugleich. Einzeln anlocken, Brezel früh essen.',
 tips:{interrupt:['Unterbrechen','Gelbe Zauberbalken im Zielrahmen damit abbrechen.'],dash:['Ausweichen','Rote Bodenmarken verlassen: Sprung in Laufrichtung.'],parry:['Parieren','Angekündigte Nahkampfhiebe abfangen.'],food:['Brezel','Heilt auch im Kampf – früh essen, nicht erst bei 10 %.']},
};
export const UNIT_TIP={
 level:n=>'Stufe '+n,elite:'Elite',neutral:'Neutral',hostile:'Feindlich',
 quest:'Auftrag',chance:p=>'~'+p+' %',chanceNote:'Chance je Gegner, dass er den Gegenstand fallen lässt.',
 outside:'Zählt hier nicht – erst im Zielgebiet',
};
export const DODGE_UI={dodged:'Ausgewichen!',hit:'Getroffen'};
export const AUTOPILOT_UI={stopped:'Angegriffen – Laufweg angehalten.'};
export const QUEST_DONE_UI={eyebrow:'Auftrag abgeschlossen',xp:n=>'+'+n+' EP',coins:n=>'+'+n+' Pfandmarken'};
