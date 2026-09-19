import {TUNING,applyTuning} from './tuning.js';
// Kernmechaniken der neun Spezialisierungen (E-32). Daten der Rolle Klassendesign, Zahlen gehören Balancing (tuning.js
// legt über `mechanics` Werte drüber). Laufzeit: spec-mechanics.js. Ab der Spezialisierung deuten diese Regeln die
// Leistenplätze Markierung (2), Eskalation (3), Bodenkniff (7) und Stärkung (Z) um; `kit` überschreibt Name und Text
// des Kniffs, `variant` nennt die Beschriftung, wenn die Bedingung erfüllt ist (Leiste: .skill.variant).
// Alle Texte sagen, wann man drückt (Prüfung content/checks/klassen.js).
export const SPEC_MECHANICS={
 'dieter-wall':{kind:'guard',name:'Hausrecht',
  hausverbot:{threshold:.95,duration:8,reflect:2},burstGuard:80,waveRadius:80,
  kit:{burst:{name:'Rausschmiss',text:'Verbraucht Pegel und bis zu 80 Deckung: Stoß mit der Tresenkante, die Deckung trifft alle Gegner ringsum. Zünde ihn, wenn die Deckung fast voll ist – bei 95 % Deckung gilt 8 s Hausverbot und Paraden werfen doppelt zurück.'}},
  variant:{burst:{when:'hausverbot',name:'HAUSVERBOT',tone:'gold'}},
  paths:[{name:'Türsteher-Kodex',bonus4:{guardOnStrike:6},bonus7:{guardOnParry:20}},{name:'Rausschmeißer',bonus4:{parrySlow:1},bonus7:{doubleParry:1}},{name:'Hausrecht',bonus4:{zoneUpgrade:1},bonus7:{waveRadius:40}}]},
 'dieter-brawl':{kind:'stack',name:'Deckelstriche',
  stack:{max:10,decay:8,gainOnStrike:1,gainOnHit:1,bonusPerStack:.12,hangover:3,hangoverGcd:1.2,hangoverDamage:.8},
  kit:{burst:{name:'Abriss',text:'Verbraucht Pegel und alle Deckelstriche: je Strich 12 % mehr Schaden. Zünde ihn, bevor der Pegel abläuft – läuft er ohne Abriss aus, kommt 3 s Kater.'},
   strike:{name:'Kronkorken-Kelle',text:'Eine schwere Kelle im Nahkampf: baut Pegel und einen Deckelstrich auf und frischt die Deckel-Uhr auf. Drück sie, sobald sie bereit ist; jeder kassierte Treffer gibt ebenfalls einen Strich.'}},
  variant:{burst:{when:'stackFull',name:'ABRISS ×10',tone:'burst'}},
  paths:[{name:'Dauerpegel',bonus4:{stackDecay:3},bonus7:{hangoverShort:1}},{name:'Blitzabriss',bonus4:{stackBonus:.04},bonus7:{stackBurstAt:4}},{name:'Rundenkämpfer',bonus4:{stackSpread:1},bonus7:{stackWave:1}}]},
 'dieter-brew':{kind:'fields',name:'Fässer',
  field:{kind:'fass',max:2,duration:20,radius:56,sorts:{pils:{haste:.15},weizen:{heal:12},bock:{damage:14}},defaultSort:'weizen'},
  tap:{bock:{damage:160,radius:80},weizen:{heal:120},pils:{haste:.3,duration:5}},
  kit:{ground:{name:'Anstich',text:'Stellt ein Fass auf den gewählten Boden (höchstens zwei). Im Umkreis wirkt die Sorte: Weizen heilt, Pils gibt Tempo, Bock verletzt Gegner. Stell es dort, wo du kämpfen willst, bevor die Gegner ankommen.'},
   burst:{name:'Fassanstich',text:'Verbraucht Pegel für einen schweren Treffer und sticht alle stehenden Fässer an: Bock explodiert, Weizen heilt voll, Pils gibt 5 s Laufzauber. Zünde ihn, wenn zwei Fässer stehen und die Gegner darin sind.'}},
  variant:{burst:{when:'fieldsUp',name:'FASSANSTICH',tone:'gold'}},
  paths:[{name:'Pils',bonus4:{fassPils:1},bonus7:{fieldCount:1}},{name:'Weizen',bonus4:{fassWeizen:1},bonus7:{fieldDuration:8}},{name:'Bock',bonus4:{fassBock:1},bonus7:{fieldRadius:20}}]},
 'baerbel-care':{kind:'supply',name:'Vorrat',
  supply:{max:5,cleanDuration:10,cleanDamage:1},overhealShield:.5,
  field:{kind:'nest',duration:12,radius:70,heal:12,honk:{stun:1.5,radius:90}},
  kit:{ground:{name:'Nest',text:'Setzt Gans Gisela auf ein Nest: heilt 12 s lang alle im Umkreis; beim Aufstehen schnattert sie Gegner ringsum kurz nieder. Stell es unter dich, wenn du länger an einem Fleck heilen musst.'},
   burst:{name:'Großreinemachen',text:'Verbraucht Glanz für einen starken Einschlag. Bei 5 Vorrat beginnt 10 s Großreinemachen: jede Heilung trifft das Ziel zusätzlich als Schaden. Zünde sie, sobald die fünf Gläser voll sind.'},
   heal:{name:'Landhaus-Löffelkur',text:'Heilt dich direkt und füllt ein Vorratsglas (höchstens fünf); Überheilung wird zur Hälfte Deckung. Drück sie auch bei vollem Leben – der Vorrat zählt.'}},
  variant:{burst:{when:'supplyFull',name:'GROSSREINEMACHEN',tone:'gold'}},
  paths:[{name:'Vorrat',bonus4:{supplyMax:2},bonus7:{cleanDuration:5}},{name:'Gisela',bonus4:{fieldDuration:6},bonus7:{nestHonk:1.5,nestFollows:1}},{name:'Reinemachen',bonus4:{cleanDamage:.5},bonus7:{overhealShield:.5}}]},
 'baerbel-feedback':{kind:'dot',name:'Schimmel',
  dot:{spreadOnStrike:1,spreadOnKill:2,radius:100,explode:{perTick:5,radius:120}},field:{kind:'spores',duration:4,radius:70},
  kit:{mark:{name:'Schimmel',text:'Markiert das Ziel mit Schimmel, der regelmäßig Schaden macht. Ein Pinsel-Piekser auf ein verschimmeltes Ziel überträgt den Schimmel auf einen Nachbarn, ein Kill auf zwei. Drück ihn zuerst und verteile ihn dann mit Pieksern.'},
   burst:{name:'Durchputzen',text:'Verbraucht Glanz für einen starken Einschlag und lässt jeden Schimmel im Umkreis platzen: fünf Ticks Schaden auf einmal, die Markierungen sind danach weg. Zünde sie, wenn drei oder mehr Gegner verschimmelt sind.'},
   ground:{name:'Sporenwolke',text:'Legt eine Sporenwolke auf den Boden, die alle Gegner darin verschimmelt. Stell sie mitten in die Gruppe, bevor du durchputzt.'}},
  variant:{burst:{when:'marked3',name:'DURCHPUTZEN',tone:'burst'}},
  paths:[{name:'Sporen',bonus4:{dotSpread:1},bonus7:{dotRadius:40}},{name:'Provision',bonus4:{markedLeech:.05},bonus7:{dotHeal:1}},{name:'Downline',bonus4:{spreadMark:1},bonus7:{dotExplodeTicks:3}}]},
 'baerbel-stage':{kind:'state',name:'Putzwut',
  state:{trigger:100,duration:10,damage:1.25,drain:10,finisherPerEnergy:2,mobile:['strike','throw','burst']},
  // Trinkspiel als Ansage/Antwort (E-32 Nr. 8): Parade, während der Gegner einen Zauber ansagt, = „Prost!“ mit Randale-Bonus
  prost:{energy:30},
  kit:{burst:{name:'Auswringen',text:'Verbraucht Glanz für einen starken Einschlag. Bei 100 Randale beginnt 10 s Putzwut: alle Kniffe kostenlos, 25 % härter, im Laufen wirkbar. In der Putzwut beendet Auswringen den Zustand mit Bonusschaden aus der Rest-Randale. Zünde es kurz vor Ablauf der Putzwut.'},
   buff:{name:'Ringlicht',text:'Kurz mehr Schaden. Drück es, sobald die Randale über 80 liegt – die Putzwut kommt dann sicher.'}},
  variant:{burst:{when:'state',name:'AUSWRINGEN',tone:'burst'},strike:{when:'state',name:'PUTZWUT',tone:'gold'},throw:{when:'state',name:'PUTZWUT',tone:'gold'}},
  paths:[{name:'Dauerglanz',bonus4:{stateDuration:4},bonus7:{stateDrain:-4}},{name:'Putzwut',bonus4:{stateDamage:.15},bonus7:{stateTrigger:-20}},{name:'Wischer',bonus4:{mobileHeal:1},bonus7:{stateMobileAll:1}}]},
 'kevin-fuse':{kind:'chain',name:'Kurzschluss',
  chain:{jumps:3,falloff:.3,radius:110},fuse:{explode:{damage:90,radius:70}},reaction:{count:3,window:10,duration:6,jumps:5},
  kit:{mark:{name:'Lunte',text:'Klebt eine Lunte ans Ziel: regelmäßig Schaden, und wenn sie abbrennt oder gezündet wird, explodiert sie im Umkreis. Drück sie zuerst auf jeden Gegner, den du sprengen willst.'},
   burst:{name:'Kurzschluss',text:'Verbraucht Druck für einen Blitz, der auf bis zu drei Nachbarn überspringt (je Sprung 30 % weniger) und Lunten sofort zündet. Drei Zündungen in 10 s lösen eine Kettenreaktion aus: Kurzschluss sofort bereit, fünf Sprünge. Zünde ihn, wenn mehrere Gegner Lunten tragen.'}},
  variant:{burst:{when:'reaction',name:'KETTENREAKTION',tone:'burst'}},
  paths:[{name:'Lunte',bonus4:{fuseDamage:40},bonus7:{fuseSpread:1}},{name:'Kurzschluss',bonus4:{chainJumps:1},bonus7:{chainFalloff:-.15}},{name:'Kettenreaktion',bonus4:{reactionWindow:5},bonus7:{reactionDuration:4}}]},
 'kevin-iron':{kind:'turret',name:'Dosen-Robbi',
  field:{kind:'robbi',duration:15,radius:80,hp:300,damage:30,interval:1,taunt:true},overload:{damage:200,radius:90},
  kit:{ground:{name:'Aufstellen',text:'Stellt Dosen-Robbi auf den gewählten Boden: 15 s lang feuert er jede Sekunde auf den nächsten Gegner und bremst alle im Umkreis. Stell ihn zwischen dich und die Gruppe, bevor du Druck aufbaust.'},
   burst:{name:'Überlast',text:'Verbraucht Druck für einen schweren Treffer. Steht Robbi, überlastet er dabei und explodiert im Umkreis – Robbi ist danach weg. Zünde sie, wenn die Gegner um Robbi stehen.'}},
  variant:{burst:{when:'fieldsUp',name:'ÜBERLAST',tone:'burst'}},
  paths:[{name:'Robbi',bonus4:{fieldDuration:5},bonus7:{robbiDamage:15,robbiFollows:1}},{name:'Nieten',bonus4:{guardOnStrike:6},bonus7:{robbiGuard:1}},{name:'Überlast',bonus4:{overloadDamage:80},bonus7:{overloadStun:1.5}}]},
 'kevin-hunt':{kind:'gamble',name:'Bastler-Glück',
  gamble:{skills:['throw','strike'],misfire:.2,overcharge:.2,misfireMult:.6,overMult:1.8,pity:3,jackpot:{streak:3,duration:8},overSplash:{radius:60,share:.5}},
  kit:{strike:{name:'Pfandgeschoss',text:'Ein Fernkampftreffer baut Druck und Randale auf – bei Kevin mit Bastler-Glück: 20 % Fehlzündung (schwächer), 20 % Überzündung (fast doppelt, trifft Nachbarn). Nach drei Fehlzündungen ist die nächste garantiert eine Überzündung. Drück ihn, wenn nichts anderes bereit ist.'},
   throw:{name:'Pfandkanone',text:'Wirft im Laufen und würfelt wie das Pfandgeschoss. Drei Überzündungen in Folge zünden 8 s Jackpot: alles überzündet. Wirf sie, sobald sie bereit ist.'}},
  variant:{throw:{when:'jackpot',name:'JACKPOT',tone:'gold'},strike:{when:'jackpot',name:'JACKPOT',tone:'gold'}},
  paths:[{name:'Glückssträhne',bonus4:{gambleOver:.1},bonus7:{gamblePity:-1}},{name:'Fangschuss',bonus4:{dashFreeThrow:1},bonus7:{gambleMisfireMult:.3}},{name:'Jackpot',bonus4:{jackpotDuration:4},bonus7:{jackpotStreak:-1}}]}
};
applyTuning(SPEC_MECHANICS,TUNING.mechanics);
/** Effektschlüssel der Mechaniken (für Talente und Pfadboni; Prüfung: content/talents.js KNOWN_EFFECTS). */
export const MECHANIC_EFFECTS=['stackDecay','hangoverShort','stackBonus','stackBurstAt','stackSpread','stackWave','waveRadius','fassPils','fassWeizen','fassBock','fieldCount','fieldDuration','fieldRadius','supplyMax','cleanDuration','nestHonk','cleanDamage','dotSpread','dotRadius','dotHeal','dotExplodeTicks','stateDuration','stateDrain','stateDamage','stateTrigger','mobileHeal','mobileStrike','mobileThrow','mobileBurst','stateMobileAll','fuseDamage','fuseSpread','chainJumps','chainFalloff','reactionWindow','reactionDuration','robbiDamage','robbiGuard','overloadDamage','overloadStun','gambleOver','gamblePity','gambleMisfireMult','jackpotDuration','jackpotStreak','hausverbotDuration','mobileCast','mobileMark','mobileGround','overloadRadius','chainRadius','overSplashShare','tapDamage','fieldHeal','robbiHp','robbiFollows','nestFollows'];
export const MECHANIC_UI={schimmel:'SCHIMMEL SPRINGT',pegel:'Deckelstriche',kater:'Kater',vorrat:'Vorrat',putzwut:'Putzwut',jackpot:'Jackpot',kettenreaktion:'Kettenreaktion',hausverbot:'Hausverbot',fass:'Fass',robbi:'Robbi',nest:'Gisela',pfadbonus:'Pfadbonus',pfadkrone:'Pfadkrone'};
