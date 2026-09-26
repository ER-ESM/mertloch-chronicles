// Seconds between attacks; ranges are world units (8 units = 1 metre).
export const AUTO_ATTACK={id:'auto',name:'Autoangriff · Leergut läuft',text:'Ein-/ausschalten: Greift dein Ziel selbstständig im Waffentempo an. Nahkampf trifft auch in Bewegung. Fernkampf nutzt den Fernkampfplatz. Während du zauberst, pausieren die Schläge. Ein offensiver Kniff startet den Autoangriff ebenfalls; ein Ziel nur anzuwählen greift es nicht an.',cd:0,cost:0,offGcd:true,auto:true,icon:'auto',color:'#eac981',bg:'#425e37'};
export const AUTO_KITS={dieter:{name:'Autoangriff · Flasche kreist',weaponSource:'melee',range:45},baerbel:{name:'Autoangriff · Dauersprühen',weaponSource:'ranged',range:155},kevin:{name:'Autoangriff · Pfand im Takt',weaponSource:'ranged',range:195},schorsch:{name:'Autoangriff · Zangenklapper',weaponSource:'melee',range:45},kaethe:{name:'Autoangriff · Kartenschnipsen',weaponSource:'ranged',range:170}};
export const ENEMY_AUTOS={
 boar:{name:'Hauer',min:32,max:44,speed:2.1,range:38},badger:{name:'Dachsbiss',min:22,max:32,speed:1.8,range:35},goose:{name:'Wadenkneifer',min:15,max:23,speed:1.35,range:34},raven:{name:'Schnabelhieb',min:13,max:20,speed:1.2,range:34},fox:{name:'Fuchsbiss',min:24,max:34,speed:1.6,range:36},
 warden:{name:'Aktenklammerwurf',min:26,max:38,speed:2.4,range:145,ranged:true},scrounger:{name:'Becherwurf',min:22,max:32,speed:2.2,range:130,ranged:true},inspector:{name:'Stempelwurf',min:30,max:42,speed:2.3,range:150,ranged:true},
 oberpraktikant:{name:'Dienstmützen-Wurf',min:34,max:46,speed:2.3,range:150,ranged:true},
 horst:{name:'Ordnerkante',min:46,max:64,speed:2.6,range:58},elite:{name:'Alphahauer',min:40,max:54,speed:2.1,range:43},gisela:{name:'Kannenschlag',min:55,max:72,speed:2.7,range:60},automat:{name:'Greifarm',min:60,max:85,speed:2.9,range:65},
 // Dungeon Etappe 4 Teil A (E-71): Autoangriffe der restlichen Schlossbosse (Faktor damage am Boss)
 tablet:{name:'Tabletkante',min:44,max:60,speed:2.5,range:56},korkenzieher:{name:'Korkenzieher',min:46,max:62,speed:2.5,range:56},ringlicht:{name:'Ringlicht-Schwinger',min:40,max:56,speed:2.4,range:58},huf:{name:'Hufschlag',min:48,max:64,speed:2.6,range:40}
};
export const COMBAT_RULES={unarmed:{min:3,max:5,speed:2},specialInterval:5.5,firstSpecial:3,lootRange:43,
 // Dungeon-Fix 2 (2026-09-26): Klickfläche einer plünderbaren Leiche um ihren Beutel (Einheiten; up = über dem Fußpunkt) – Links- wie
 // Rechtsklick dort öffnet die Beute vor jedem Söldner, der darauf steht. lootMoment: Boss-Beute öffnet sich delay s nach dem Sieg, sobald
 // der Held lebt, nicht kämpft und in der Arena steht; höchstens wait s lang (Boss-Beutel mit Arena warten ohne Frist, Dungeon-Fix 3).
 // Dungeon-Fix 3: beam = Höhe der Klickfläche über einem Beutel mit Lichtsäule (ab ungewöhnlich) – die Säule ist das, was man anklickt.
 lootClick:{x:18,up:24,down:12,beam:72},lootMoment:{delay:1.4,wait:90}};
export const COMBAT_TEXT={surge:'In Fahrt',surgeHint:'In Fahrt: Spezialkniff +20 %',needResources:'Nicht genug Randale. Dein Aufbaukniff lädt sie wieder auf.',moving:'Zum Zaubern stehen bleiben.',cancelled:'Zauber abgebrochen: Du bewegst dich.',busy:'Du wirkst bereits einen Zauber.',notReady:'Noch nicht bereit.',noTarget:'Kein Ziel.',lostTarget:'Zauber abgebrochen: Ziel nicht mehr erreichbar.',aimGround:'Boden wählen · Rechtsklick / Esc abbrechen.',autoOn:'Autoangriff an.',autoOff:'Autoangriff aus.',casting:'Wird gewirkt',instant:'Sofort',damage:'Schaden',weaponDamage:'Autoschaden',fixed:'Fester Schaden',underAttack:'Du kriegst auf die Fresse von',cooldown:(name,sekunden)=>name+' muss noch verschnaufen · '+sekunden+' s.'};
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
import {DUNGEON_UI} from './dungeon-ui.js';
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
 automat:{effect:'Der Greifarm fährt aus und packt zu – härtester Autoangriff im Spiel.',why:'Bei diesem Takt zählt jede Sekunde im Nahbereich: Fernkämpfer bleiben draußen, Dieter pariert.'},
 // Dungeon Etappe 4 Teil A (E-71)
 tablet:{effect:'Frau Dr. Exposé schlägt mit der Tabletkante zu. Das Exposé ist noch offen.',why:'Sie hält still, solange der Schutz sie hält: Der Schaden läuft auf ihn, die Gruppe kümmert sich um die Interessenten.'},
 korkenzieher:{effect:'Korken-Kurt sticht mit dem Korkenzieher zu, als wär’s ein Tetrapak.',why:'Zwischen Sammeln, Verteilen und Fässern bleibt der Schaden beim Schutz, wenn der ihn in der Mitte hält.'},
 ringlicht:{effect:'Rita schwingt das Ringlicht wie eine Handtasche.',why:'Schwach je Treffer. Gefährlich ist ihr Blitzlicht, nicht der Schlag.'},
 huf:{effect:'Das halbe Pferd tritt mit dem Vorderhuf zu. Hinten ist ja nichts.',why:'Nahkampf in engen Stallungen: Der Schutz hält es vom Trog weg, alle anderen stehen seitlich.'}
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
/** Merkmale eines Gegnerzaubers in Vorrang-Reihenfolge (der gefährlichste Teil zuerst). Etappe 2 Dungeon (E-71). */
export const CAST_TRAITS=['lie','decoy','tankDebuff','cone','line','los','ground','stack','spread','interrupt','interrupts','call','heal','goal','summon','hidden','feeds','guard','random','knockback','brand','persist','wet','tank','hit'];
export function castTraits(c){const t=[];if(!c)return t;if(c.lie)t.push('lie');if(c.cone)t.push('cone');if(c.line)t.push('line');if(c.ground)t.push('ground');if(c.stack)t.push('stack');if(c.spread)t.push('spread');
 if(c.target==='random')t.push('random');if(c.interruptible)t.push('interrupt');if(c.callHelp)t.push('call');if(c.healAllies)t.push('heal');if(c.summon)t.push('summon');if(c.frontGuard)t.push('guard');if(c.knockback)t.push('knockback');if(c.brand)t.push('brand');if(c.tankSafe!=null&&c.tankSafe<1)t.push('tank');/* Etappe 3 */if(c.tankDebuff)t.push('tankDebuff');if(c.persist)t.push('persist');if(c.interrupts>1)t.push('interrupts');/* Etappe 4 Teil A */if(c.decoy)t.push('decoy');if(c.los)t.push('los');if(c.summon?.goal||c.goal||c.signAll)t.push('goal');if(c.hidden)t.push('hidden');if(c.retreat||c.feeds)t.push('feeds');if(c.persist?.slow)t.push('wet');
 if(!t.length)t.push('hit');return t.sort((a,b)=>CAST_TRAITS.indexOf(a)-CAST_TRAITS.indexOf(b));}
/**
 * Etappe 2 (E-71, Analyse Verbesserung 5): Symbol, Merkmale, Antwort und Kurzzahlen eines Gegnerzaubers – vollständig aus seinen
 * Merkmalen. describeCast (content/enemies.js) hängt das an jede Zauberbeschreibung, wie describeAuto beim Autoangriff; Warnleiste
 * (boss-alerts.js), Journal (dungeon-journal.js) und Bossrahmen lesen dieselbe Beschreibung. interrupt: hat der Spieler schon einen Unterbrecher.
 * → {icon, main, hint, traits:[{id,icon,name,tip}], facts:[{label,value,unit}]}
 */
export function castSymbols(c,{interrupt=true}={}){
 if(!c)return null;const T=DUNGEON_UI.traits,N=DUNGEON_UI.numbers,ids=castTraits(c).map(id=>id==='interrupt'&&!interrupt?'noInterrupt':id),main=ids[0];
 const icon=id=>'trait-'+(id==='noInterrupt'?'interrupt':id),traits=ids.map(id=>({id,icon:icon(id),name:T[id]?.name||id,tip:T[id]?.tip||''}));
 const hint=main==='noInterrupt'?T.noInterrupt.answer:c.hint||T[main]?.answer||'';
 const numbers=[];if(c.pct)numbers.push({label:N.pct,value:Math.round(c.pct*100),unit:'%'});else if(c.damage)numbers.push({label:N.damage,value:c.damage,unit:''});
 if(c.total)numbers.push({label:N.cast,value:String(c.total).replace('.',','),unit:'s'});
 if(c.cone)numbers.push({label:N.angle,value:c.cone.angle,unit:'°'},{label:N.range,value:m(c.cone.range),unit:'m'});
 if(c.radius&&(c.ground||c.stack||c.spread))numbers.push({label:N.radius,value:m(c.radius),unit:'m'});
 if(c.knockback)numbers.push({label:N.knockback,value:m(c.knockback),unit:'m'});
 if(c.tankSafe!=null&&c.tankSafe<1)numbers.push({label:N.tankShare,value:Math.round(c.tankSafe*100),unit:'%'});
 if(c.healAllies)numbers.push({label:N.heal,value:Math.round(c.healAllies.share*100),unit:'%'});
 if(c.frontGuard)numbers.push({label:N.guard,value:'−'+Math.round((1-c.frontGuard.factor)*100),unit:'%'});
 if(c.callHelp)numbers.push({label:N.callRange,value:m(c.callHelp.range),unit:'m'});
 if(c.brand)numbers.push({label:c.brand.name||N.brand,value:'+'+Math.round((c.brand.bonus||0)*100),unit:'%'},{label:N.duration,value:c.brand.duration,unit:'s'});
 /* Etappe 3 „Big B“ */if(c.lie)numbers.push({label:N.tell,value:String(c.lie.tell??1).replace('.',','),unit:'s'});if(c.line)numbers.push({label:N.lanes,value:(c.line.pick||(c.line.truth||[]).length)+' / '+c.line.lanes.length,unit:''});
 if(c.tankDebuff)numbers.push({label:c.tankDebuff.name,value:'+'+Math.round(c.tankDebuff.taken*100),unit:'%'},{label:N.stacks,value:c.tankDebuff.stack,unit:''});
 if(c.persist&&!c.persist.edge)numbers.push({label:N.persist,value:c.persist.duration,unit:'s'});if(c.interrupts>1)numbers.push({label:N.interrupts,value:c.interrupts,unit:''});
 /* Etappe 4 Teil A */if(c.decoy)numbers.push({label:N.decoy,value:c.decoy.count+' / '+c.circles,unit:''},{label:N.stamp,value:String(c.decoy.tell).replace('.',','),unit:'s'});
 if(c.stack)numbers.push({label:N.radius,value:m(c.stack.radius),unit:'m'},{label:N.share,value:Math.round(c.stack.share*100),unit:'%'});if(c.spread)numbers.push({label:N.radius,value:m(c.spread.radius),unit:'m'});
 if(c.los)numbers.push({label:N.blind,value:c.los.blind,unit:'s'});if(c.persist?.edge)numbers.push({label:N.stripe,value:c.persist.width,unit:'m'},{label:N.slow,value:'−'+Math.round((c.persist.slow||0)*100),unit:'%'});if(c.retreat)numbers.push({label:N.duration,value:c.retreat.duration,unit:'s'});if(c.hidden)numbers.push({label:N.duration,value:c.hidden.duration,unit:'s'});
 if(c.selfHeal)numbers.push({label:N.heal,value:Math.round(c.selfHeal*100),unit:'%'});
 return {icon:icon(main),main,hint,traits,facts:numbers};
}
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
 // Dungeon-Fix 2 (2026-09-26): Leiche anklicken und Beute-Moment
 lootClick:{name:'Leiche anklicken',rules:['lootClick.x','lootClick.up','lootClick.down','lootClick.beam'],terms:['beute'],
  short:'Klick auf eine Leiche mit Beute öffnet den Beutel – auch wenn ein Söldner darauf steht.',
  long:'Die Klickfläche reicht über den liegenden Körper, nicht nur über den Beutel am Boden. Ein Rechtsklick dort öffnet die Beute vor jedem Söldner an derselben Stelle; nur ein lebender Gegner gewinnt, denn Kampf geht vor. Leuchtet über dem Beutel eine Lichtsäule (ab ungewöhnlicher Beute), zählt auch die Säule. Bist du zu weit weg, läufst du hin.',
  numbers:[{label:'Breite je Seite',value:COMBAT_RULES.lootClick.x,unit:'Einheiten',source:'COMBAT_RULES.lootClick.x'},{label:'Höhe über dem Boden',value:COMBAT_RULES.lootClick.up,unit:'Einheiten',source:'COMBAT_RULES.lootClick.up'},{label:'unter dem Beutel',value:COMBAT_RULES.lootClick.down,unit:'Einheiten',source:'COMBAT_RULES.lootClick.down'},{label:'Höhe mit Lichtsäule',value:COMBAT_RULES.lootClick.beam,unit:'Einheiten',source:'COMBAT_RULES.lootClick.beam'}]},
 lootMoment:{name:'Beute-Moment nach dem Boss',rules:['lootMoment.delay','lootMoment.wait'],terms:['beute'],
  short:'Boss-Beute im Dungeon öffnet sich kurz nach dem Sieg von selbst, sobald du lebst, nicht mehr kämpfst und in der Arena stehst.',
  long:'Liegst du beim Sieg noch als Geist oder stehst an der Tür, wartet das Fenster, bis du aufgestanden bist bzw. die Arena betrittst. Geöffnet wird es einmal; danach findest du den Beutel an der Leiche. Boss-Beute wartet ohne Frist, bis du wieder in der Arena stehst. Nichts wird ungefragt angelegt.',
  numbers:[{label:'Vorlauf nach dem Sieg',value:COMBAT_RULES.lootMoment.delay,unit:'s',source:'COMBAT_RULES.lootMoment.delay'},{label:'wartet höchstens',value:COMBAT_RULES.lootMoment.wait,unit:'s',source:'COMBAT_RULES.lootMoment.wait'}]},
 autoRange:{name:'Reichweite des eigenen Autoangriffs',rules:[],terms:['autoangriff','reichweite'],
  short:'Dieter und Schorsch schlagen bis 45 Einheiten zu, Anni sprüht bis 155, Käthe schnipst Karten bis 170, Kevin wirft bis 195.',
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
 by:'Umgehauen von',amount:n=>n.toLocaleString('de-DE')+' Schaden',ground:'Rote Fläche',groundNote:'Aus roten Flächen herauslaufen oder mit Ausweichen herausspringen.',
 others:n=>'+'+n+' weitere Angreifer',othersNote:'Mehrere Gegner zugleich. Einzeln anlocken, Brezel früh essen.',
 // Dungeon (E-71): Der Tod des Helden ist kein Wipe. Er liegt als Geist, die Söldner kämpfen weiter und helfen ihm auf.
 // Dungeon-Fix 3: Nach dem Kampf heißt der Knopf „Hier aufstehen“ (nichts setzt zurück); nach einem Wipe stehen die Gegner schon wieder.
 dungeon:{wake:'Am Kontrollpunkt aufstehen',wakeNote:r=>'Gibt den Kampf auf: Die Gegner setzen zurück, du stehst am Kontrollpunkt '+r+' auf.',checkpoint:r=>'Kontrollpunkt '+r,
  wakeLost:r=>'Alle lagen, die Gegner stehen schon wieder auf ihren Plätzen. Du stehst am Kontrollpunkt '+r+' auf.',
  here:'Hier aufstehen',hereNote:'Der Kampf ist vorbei. Du stehst hier auf, nichts setzt zurück.',standing:'Du stehst gleich auf',
  checkpointNote:'Hier stehst du auf. Gelegter Trash bleibt liegen.',ghost:'Söldner kämpfen weiter',ghostNote:'Im Kampf hilft ein Heil-Söldner dir einmal auf (8 s). Nach dem Kampf hilft er dir immer auf, ohne Heiler stehst du von selbst auf. Erst wenn alle liegen, ist der Kampf verloren.',
  reviving:n=>n+' hilft dir auf',allDown:'Alle am Boden',
  // Dungeon-Fix 4 (Nachprüfung #726: der goldene Hauptknopf gab im Kampf den Kampf auf, der Tooltip stand offen): im Kampf zweitrangig und erst
  // beim zweiten Klick – der erste macht ihn scharf (armed s lang)
  giveUp:'Kampf aufgeben',giveUpArmed:'Nochmal: aufgeben',armed:3},
 // Dungeon-Fix 4 (Nachprüfung #726: nur der letzte Treffer „Trümmer · 70“, obwohl in 9 s rund 800 kamen): Todesrückblick wie in WoW – die letzten
 // Treffer mit Quelle und Schaden als Symbolzeilen (window s vor dem Tod, höchstens rows Zeilen), darüber die Summe
 // Dungeon-Fix 5 (Prüfer #728: die Zeilen deckten die Summe nicht ab): Treffer derselben Quelle gebündelt („5×“), der Todesschlag unten, der Rest als
 // „+ n weitere“ – die Zeilen ergeben genau Σ. rows = Zeilen insgesamt (mit der Rest-Zeile); das Fenster ist kleiner und sitzt oben
 recap:{rows:4,window:10,label:'Letzte Treffer',note:'Alles, was dich in den letzten Sekunden getroffen hat: gleiche Treffer zusammengefasst, der Todesschlag unten mit Totenkopf. Die Zeilen ergeben die Summe.',sum:(n,s)=>'Σ '+n.toLocaleString('de-DE')+' in '+s+' s',
  ago:s=>'−'+s.toFixed(1).replace('.',',')+' s',auto:'Autoangriff',ground:'Fläche',times:n=>n+'×',rest:n=>'+ '+n+' weitere'},
 tips:{interrupt:['Unterbrechen','Gelbe Zauberbalken im Zielrahmen damit abbrechen.'],dash:['Ausweichen','Rote Bodenmarken verlassen: Sprung in Laufrichtung.'],parry:['Parieren','Angekündigte Nahkampfhiebe abfangen.'],food:['Brezel','Heilt auch im Kampf – früh essen, nicht erst bei 10 %.']},
};
export const UNIT_TIP={
 level:n=>'Stufe '+n,elite:'Elite',neutral:'Neutral',hostile:'Feindlich',
 quest:'Auftrag',chance:p=>'~'+p+' %',chanceNote:'Chance je Gegner, dass er den Gegenstand fallen lässt.',
 outside:'Zählt hier nicht – erst im Zielgebiet',
};
export const DODGE_UI={dodged:'Ausgewichen!',hit:'Getroffen'};
/** E-72 R5 (Kenner-Nachtest): Zusatz zum Bodenziel-Hinweis für die ersten Male (engine.js groundAimText, GROUND_TIPS) – der Standard der Einstellung bleibt aus. */
COMBAT_TEXT.aimGroundTip='Einstellung: „Bodenkniffe sofort an der Maus“';
/** Hinweis mit Tipp als zweite Zeile (#toast bricht am Zeilenumbruch um, resource-hud.css) – so bleibt die Meldung schmal. */
COMBAT_TEXT.aimGroundTipped=COMBAT_TEXT.aimGround+'\n'+COMBAT_TEXT.aimGroundTip;
export const AUTOPILOT_UI={stopped:'Angegriffen – Laufweg angehalten.',resumed:n=>n?'Weiter zu '+n+'.':'Weiter auf dem Laufweg.'};
export const QUEST_DONE_UI={eyebrow:'Auftrag abgeschlossen',xp:n=>'+'+n+' EP',coins:n=>'+'+n+' Pfandmarken'};
