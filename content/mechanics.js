import {TUNING,applyTuning} from './tuning.js';
import {TALENTS_SCHORSCH} from './talents/schorsch.js';
import {TALENTS_KAETHE} from './talents/kaethe.js';
// Kernmechaniken der neun Spezialisierungen (E-32). Daten der Rolle Klassendesign, Zahlen gehören Balancing (tuning.js
// legt über `mechanics` Werte drüber). Laufzeit: spec-mechanics.js. Ab der Spezialisierung deuten diese Regeln die
// Leistenplätze Markierung (2), Spezialkniff (3), Bodenkniff (7) und Stärkung (Z) um; `kit` überschreibt Name und Text
// des Kniffs, `variant` nennt die Beschriftung, wenn die Bedingung erfüllt ist (Leiste: .skill.variant).
// Alle Texte sagen, wann man drückt (Prüfung content/checks/klassen.js).
// `output` (E-59/E-60): Faktor auf den ausgeteilten Schaden (damage) und die feste Heilung (healing) der Spec, gemessen mit
// npm run balance:sheet – Mittel aus Boss und Feldgruppe, Stufe 10–30, Ausrüstung selten, Pfade 0–2, relativ zum Median der
// Schadens-Specs. Ziel: Schadens-Specs 1,0 · Tanks ≈ 0,82 (dazu Schutz) · Heiler ≈ 0,75 (dazu Heilung). Herleitung: docs/ENTSCHEIDUNGEN.md E-60.
/** Faktoren einer Spezialisierung (E-59/E-60); ohne Spezialisierung oder Eintrag gilt 1. */
export const specOutput=spec=>({damage:1,healing:1,...(SPEC_MECHANICS[spec]?.output||{})});
export const SPEC_MECHANICS={
 'dieter-wall':{kind:'guard',name:'Hausrecht',output:{damage:0.93},
  hausverbot:{threshold:.95,duration:8,reflect:2},burstGuard:80,waveRadius:80,
  kit:{burst:{name:'Rausschmiss',text:'Verbraucht bis zu 80 Deckung: Stoß mit der Tresenkante, die Deckung trifft alle Gegner ringsum.',use:'Zünde ihn, wenn die Deckung fast voll ist – bei 95 % Deckung gilt 8 s Hausverbot und Paraden werfen doppelt zurück.'}},
  variant:{burst:{when:'hausverbot',name:'HAUSVERBOT',tone:'gold'}},
  paths:[{name:'Türsteher-Kodex',bonus4:{guardOnStrike:6},bonus7:{guardOnParry:20}},{name:'Rausschmeißer',bonus4:{parrySlow:1},bonus7:{doubleParry:1}},{name:'Hausrecht',bonus4:{zoneUpgrade:1},bonus7:{waveRadius:40}}]},
 'dieter-brawl':{kind:'stack',name:'Deckelstriche',output:{damage:0.82},
  stack:{max:10,decay:8,gainOnStrike:1,gainOnHit:1,bonusPerStack:.12,hangover:3,hangoverGcd:1.2,hangoverDamage:.8},
  kit:{burst:{name:'Abriss',text:'Verbraucht alle Deckelstriche: je Strich 12 % mehr Schaden.',use:'Zünde ihn, bevor der Pegel abläuft – läuft er ohne Abriss aus, kommt 3 s Kater.'},
   strike:{name:'Kronkorken-Kelle',text:'Eine schwere Kelle im Nahkampf: gibt Randale und einen Deckelstrich und frischt die Deckel-Uhr auf.',use:'Drück sie, sobald sie bereit ist; jeder kassierte Treffer gibt ebenfalls einen Strich.'}},
  variant:{burst:{when:'stackFull',name:'ABRISS ×10',tone:'burst'}},
  paths:[{name:'Dauerpegel',bonus4:{stackDecay:3},bonus7:{hangoverShort:1}},{name:'Blitzabriss',bonus4:{stackBonus:.04},bonus7:{stackBurstAt:4}},{name:'Rundenkämpfer',bonus4:{stackSpread:1},bonus7:{stackWave:1}}]},
 'dieter-brew':{kind:'fields',name:'Fässer',output:{damage:1.15},
  field:{kind:'fass',max:2,duration:20,radius:56,sorts:{pils:{haste:.15},weizen:{heal:12},bock:{damage:14}},defaultSort:'weizen'},
  tap:{bock:{damage:160,radius:80},weizen:{heal:120},pils:{haste:.3,duration:5}},
  kit:{ground:{name:'Anstich',text:'Stellt ein Fass auf den gewählten Boden (höchstens zwei). Im Umkreis wirkt die Sorte: Weizen heilt, Pils gibt Tempo, Bock verletzt Gegner.',use:'Stell es dort, wo du kämpfen willst, bevor die Gegner ankommen.'},
   burst:{name:'Fassanstich',text:'Ein schwerer Treffer; sticht alle stehenden Fässer an: Bock explodiert, Weizen heilt voll, Pils gibt 5 s Laufzauber.',use:'Zünde ihn, wenn zwei Fässer stehen und die Gegner darin sind.'}},
  variant:{burst:{when:'fieldsUp',name:'FASSANSTICH',tone:'gold'}},
  paths:[{name:'Pils',bonus4:{fassPils:1},bonus7:{fieldCount:1}},{name:'Weizen',bonus4:{fassWeizen:1},bonus7:{fieldDuration:8}},{name:'Bock',bonus4:{fassBock:1},bonus7:{fieldRadius:20}}]},
 'baerbel-care':{kind:'supply',name:'Vorrat',output:{damage:1.18,healing:1.15},
  supply:{max:5,cleanDuration:10,cleanDamage:1},overhealShield:.5,
  field:{kind:'nest',duration:12,radius:70,heal:12,honk:{stun:1.5,radius:90}},
  kit:{ground:{name:'Nest',text:'Setzt Gans Gisela auf ein Nest: heilt 12 s lang alle im Umkreis; beim Aufstehen schnattert sie Gegner ringsum kurz nieder.',use:'Stell es unter dich, wenn du länger an einem Fleck heilen musst.'},
   burst:{name:'Großreinemachen',text:'Ein starker Einschlag. Bei 5 Vorrat beginnt 10 s Großreinemachen: jede Heilung trifft das Ziel zusätzlich als Schaden.',use:'Zünde sie, sobald die fünf Gläser voll sind.'},
   heal:{name:'Landhaus-Löffelkur',text:'Heilt dich direkt und füllt ein Vorratsglas (höchstens fünf); Überheilung wird zur Hälfte Deckung.',use:'Drück sie auch bei vollem Leben – der Vorrat zählt.'}},
  variant:{burst:{when:'supplyFull',name:'GROSSREINEMACHEN',tone:'gold'}},
  paths:[{name:'Vorrat',bonus4:{supplyMax:2},bonus7:{cleanDuration:5}},{name:'Gisela',bonus4:{fieldDuration:6},bonus7:{nestHonk:1.5,nestFollows:1}},{name:'Reinemachen',bonus4:{cleanDamage:.5},bonus7:{overhealShield:.5}}]},
 'baerbel-feedback':{kind:'dot',name:'Schimmel',output:{damage:1.18},
  dot:{spreadOnStrike:1,spreadOnKill:2,radius:100,explode:{perTick:5,radius:120}},field:{kind:'spores',duration:4,radius:70},
  kit:{mark:{name:'Schimmel',text:'Markiert das Ziel mit Schimmel, der regelmäßig Schaden macht. Ein Pinsel-Piekser auf ein verschimmeltes Ziel überträgt den Schimmel auf einen Nachbarn, ein Kill auf zwei.',use:'Drück ihn zuerst und verteile ihn dann mit Pieksern.'},
   burst:{name:'Durchputzen',text:'Ein starker Einschlag; lässt jeden Schimmel im Umkreis platzen: fünf Ticks Schaden auf einmal, die Markierungen sind danach weg.',use:'Zünde sie, wenn drei oder mehr Gegner verschimmelt sind.'},
   ground:{name:'Sporenwolke',text:'Legt eine Sporenwolke auf den Boden, die alle Gegner darin verschimmelt.',use:'Stell sie mitten in die Gruppe, bevor du durchputzt.'}},
  variant:{burst:{when:'marked3',name:'DURCHPUTZEN',tone:'burst'}},
  paths:[{name:'Sporen',bonus4:{dotSpread:1},bonus7:{dotRadius:40}},{name:'Provision',bonus4:{markedLeech:.05},bonus7:{dotHeal:1}},{name:'Downline',bonus4:{spreadMark:1},bonus7:{dotExplodeTicks:3}}]},
 'baerbel-stage':{kind:'state',name:'Putzwut',output:{damage:0.89},
  state:{trigger:100,duration:10,damage:1.25,drain:10,finisherPerEnergy:2,mobile:['strike','throw','burst']},
  // Trinkspiel als Ansage/Antwort (E-32 Nr. 8): Parade, während der Gegner einen Zauber ansagt, = „Prost!“ mit Likes-Bonus (E-72: Annis Ressource)
  prost:{energy:30},
  kit:{burst:{name:'Auswringen',text:'Ein starker Einschlag. Bei 100 Likes beginnt 10 s Putzwut: alle Kniffe kostenlos, 25 % härter, im Laufen wirkbar. In der Putzwut beendet Auswringen den Zustand mit Bonusschaden aus den Rest-Likes.',use:'Zünde es kurz vor Ablauf der Putzwut.'},
   buff:{name:'Ringlicht',text:'Kurz mehr Schaden.',use:'Drück es, sobald die Likes über 80 liegen – die Putzwut kommt dann sicher.'}},
  variant:{burst:{when:'state',name:'AUSWRINGEN',tone:'burst'},strike:{when:'state',name:'PUTZWUT',tone:'gold'},throw:{when:'state',name:'PUTZWUT',tone:'gold'}},
  paths:[{name:'Dauerglanz',bonus4:{stateDuration:4},bonus7:{stateDrain:-4}},{name:'Putzwut',bonus4:{stateDamage:.15},bonus7:{stateTrigger:-20}},{name:'Wischer',bonus4:{mobileHeal:1},bonus7:{stateMobileAll:1}}]},
 'kevin-fuse':{kind:'chain',name:'Kurzschluss',output:{damage:0.85},
  chain:{jumps:3,falloff:.3,radius:110},fuse:{explode:{damage:90,radius:70}},reaction:{count:3,window:10,duration:6,jumps:5},
  kit:{mark:{name:'Lunte',text:'Klebt eine Lunte ans Ziel: regelmäßig Schaden, und wenn sie abbrennt oder gezündet wird, explodiert sie im Umkreis.',use:'Drück sie zuerst auf jeden Gegner, den du sprengen willst.'},
   burst:{name:'Kurzschluss',text:'Kostet drei Flaschen: ein Blitz, der auf bis zu drei Nachbarn überspringt (je Sprung 30 % weniger) und Lunten sofort zündet. Drei Zündungen in 10 s lösen eine Kettenreaktion aus: Kurzschluss sofort bereit, fünf Sprünge.',use:'Zünde ihn, wenn mehrere Gegner Lunten tragen.'}},
  variant:{burst:{when:'reaction',name:'KETTENREAKTION',tone:'burst'}},
  paths:[{name:'Lunte',bonus4:{fuseDamage:40},bonus7:{fuseSpread:1}},{name:'Kurzschluss',bonus4:{chainJumps:1},bonus7:{chainFalloff:-.15}},{name:'Kettenreaktion',bonus4:{reactionWindow:5},bonus7:{reactionDuration:4}}]},
 'kevin-iron':{kind:'turret',name:'Dosen-Robbi',output:{damage:1.08},
  field:{kind:'robbi',duration:15,radius:80,hp:300,damage:30,interval:1,taunt:true},overload:{damage:200,radius:90},
  kit:{ground:{name:'Aufstellen',text:'Stellt Dosen-Robbi auf den gewählten Boden: 15 s lang feuert er jede Sekunde auf den nächsten Gegner und bremst alle im Umkreis.',use:'Stell ihn zwischen dich und die Gruppe, bevor du die Flaschen fliegen lässt.'},
   burst:{name:'Überlast',text:'Steht Robbi, überlastet er dabei und explodiert im Umkreis – Robbi ist danach weg. Kostet drei Flaschen für einen schweren Treffer.',use:'Zünde sie, wenn die Gegner um Robbi stehen.'}},
  variant:{burst:{when:'fieldsUp',name:'ÜBERLAST',tone:'burst'}},
  paths:[{name:'Robbi',bonus4:{fieldDuration:5},bonus7:{robbiDamage:15,robbiFollows:1}},{name:'Nieten',bonus4:{guardOnStrike:6},bonus7:{robbiGuard:1}},{name:'Überlast',bonus4:{overloadDamage:80},bonus7:{overloadStun:1.5}}]},
 'kevin-hunt':{kind:'gamble',name:'Bastler-Glück',output:{damage:1.25},
  gamble:{skills:['throw','strike'],misfire:.2,overcharge:.2,misfireMult:.6,overMult:1.8,pity:3,jackpot:{streak:3,duration:8},overSplash:{radius:60,share:.5}},
  kit:{strike:{name:'Pfandgeschoss',text:'Ein Fernkampftreffer für eine Flasche aus dem Kasten – mit Bastler-Glück: 20 % Fehlzündung (schwächer), 20 % Überzündung (fast doppelt, trifft Nachbarn). Nach drei Fehlzündungen ist die nächste garantiert eine Überzündung.',use:'Drück ihn, wenn nichts anderes bereit ist.'},
   throw:{name:'Pfandkanone',text:'Wirft im Laufen und würfelt wie das Pfandgeschoss. Drei Überzündungen in Folge zünden 8 s Jackpot: alles überzündet.',use:'Wirf sie, sobald sie bereit ist.'}},
  variant:{throw:{when:'jackpot',name:'JACKPOT',tone:'gold'},strike:{when:'jackpot',name:'JACKPOT',tone:'gold'}},
  paths:[{name:'Glückssträhne',bonus4:{gambleOver:.1},bonus7:{gamblePity:-1}},{name:'Fangschuss',bonus4:{dashFreeThrow:1},bonus7:{gambleMisfireMult:.3}},{name:'Jackpot',bonus4:{jackpotDuration:4},bonus7:{jackpotStreak:-1}}]}
};
// E-72 Runde 3 (Balance-Sheet): Pfadboni der neuen Klassen nachgezogen – Beilagen +50 % Bratwurst (der Grillplan mit Käse und Mais bringt
// weniger Würste), Stammkundschaft/Stichflamme/Halloumi/Grand/Wahrsagen kleiner, Herzdame Nachheilung statt Herzstärke, Schwenkbraten Garfenster statt Bratenschaden.
// --- E-72: Hauptbäume der neuen Klassen (erst aktiv, wenn ihre Talentbäume im Inhalt stehen). kind 'resource' = die Regel liegt in class-resources.js und dreht an der
// Klassenressource (Grillplan, Flambieren, Räuchern, Grand, Herz, Ärmel). resVariant = Leistenvariante der Ressource.
export const NEW_SPEC_MECHANICS={
 'schorsch-chef':{kind:'resource',name:'Grillbuffet',output:{damage:0.8,healing:1.15},
  chef:{plan:['wurst','wurst','braten'],wurstBonus:.5,wurstChain:1,buffet:{duration:10,radius:85,heal:14}},
  kit:{ground:{name:'Grillbuffet',text:'Schwingt den Schwenkgrill auf einen freien Bodenpunkt und baut dort ein Buffet auf, das zehn Sekunden lang alle im Kreis heilt.',use:'Stell es dorthin, wo ihr gleich kämpft.'},
   burst:{name:'Servieren',text:'Serviert das garste Stück vom Rost. Bratwurst heilt 15 % stärker und reicht für einen zweiten Verbündeten; Braten, Mais und Käse wirken wie gewohnt.',use:'Drück es, sobald eine Wurst golden schimmert.'}},
  resVariant:{burst:{when:'wurstGar',name:'WURST GAR',tone:'gold'}},
  paths:[{name:'Wurstbude',bonus4:{wurstHeal:.05},bonus7:{garWindow:.1}},{name:'Beilagen',bonus4:{cookSpeed:.1,wurstHeal:.5},bonus7:{rostSlots:1}},{name:'Stammkundschaft',bonus4:{ventHeal:.02},bonus7:{serveCleave:1}}]},
 'schorsch-flamme':{kind:'resource',name:'Flambieren',output:{damage:1},
  flamme:{at:85,bonus:.5,splash:{radius:70,share:.4},overheatFactor:2,plan:['braten','mais','braten']},
  kit:{burst:{name:'Servieren',text:'Serviert das garste Stück vom Rost. Ab 85 Glut wird flambiert: 30 % mehr Wirkung und Feuerspritzer an den Nachbarn des Ziels.',use:'Drück es, wenn die Glut über 85 steht und ein Braten gar ist.'}},
  resVariant:{burst:{when:'flambe',name:'FLAMBIEREN',tone:'burst'}},
  paths:[{name:'Stichflamme',bonus4:{overheatDamage:.05},bonus7:{overheatLock:-1}},{name:'Schwenkbraten',bonus4:{garWindow:.05},bonus7:{planBraten:1}},{name:'Spiritus',bonus4:{emberDot:.3},bonus7:{glutStrike:4}}]},
 'schorsch-rauch':{kind:'resource',name:'Räucherware',output:{damage:0.82},
  rauch:{below:45,cook:.5,smoke:{radius:80,duration:6,weaken:.25},plan:['kaese','braten','kaese'],oven:{duration:10,radius:90,damage:10}},
  kit:{ground:{name:'Räucherofen',text:'Schwingt den Schwenkgrill auf einen freien Bodenpunkt und lässt dort einen Räucherofen qualmen: Gegner im Rauch verspotten dich und treffen schwächer.',use:'Stell ihn mitten in die Gruppe, bevor sie auf dich einprügelt.'},
   burst:{name:'Servieren',text:'Serviert das garste Stück vom Rost. Unter 45 Glut gegartes Grillgut ist geräuchert und hinterlässt Rauch, der Gegner verspottet und ihren Schaden senkt.',use:'Drück es, wenn geräuchertes Grillgut gar ist und die Gruppe an dir klebt.'}},
  resVariant:{burst:{when:'smoked',name:'GERÄUCHERT',tone:'gold'}},
  paths:[{name:'Buchenrauch',bonus4:{smokeTaunt:1},bonus7:{ventSteam:.3}},{name:'Halloumi',bonus4:{kaeseShield:.05},bonus7:{planKaese:1}},{name:'Glutnest',bonus4:{glutParry:6},bonus7:{burntGrace:.15}}]},
 'kaethe-grand':{kind:'resource',name:'Grand',output:{damage:1},
  grand:{bubes:4,factor:1.5,radius:90},
  kit:{throw:{name:'Abrechnen',text:'Rechnet das Spiel ab: Schaden je Auge am Ziel, Schneider und Schwarz verstärken. Vier Buben in einem Spiel sind ein Grand: anderthalbfach und gegen alle Gegner ringsum.',use:'Drück es, sobald du 61 Augen hast – mit vier Buben am besten mitten in der Gruppe.'}},
  resVariant:{throw:{when:'grand',name:'GRAND',tone:'gold'}},
  paths:[{name:'Grand',bonus4:{bubePower:.15},bonus7:{abrechnenPower:.1}},{name:'Schneider',bonus4:{augenGain:1},bonus7:{augenWin:-6}},{name:'Null ouvert',bonus4:{luschenPower:.1},bonus7:{luschenGcd:1}}]},
 'kaethe-herz':{kind:'resource',name:'Legekreis',output:{damage:0.75,healing:1.15},
  herz:{bonus:.4,chain:1,seeNext:1,circle:{duration:8,radius:85,heal:12}},
  kit:{ground:{name:'Legekreis',text:'Legt die ganze Hand im Kreis auf einen freien Bodenpunkt: acht Sekunden lang heilt der Kreis alle darin, jede Karte wirkt einmal nach ihrer Farbe, danach ziehst du neu.',use:'Leg ihn unter die Gruppe, wenn mehrere Leben verlieren.'}},
  resVariant:{},
  paths:[{name:'Herzdame',bonus4:{hotHeal:2},bonus7:{herzChain:1}},{name:'Pik-Schutz',bonus4:{pikPower:.15},bonus7:{pikReflect:.2}},{name:'Wahrsagen',bonus4:{followBonus:.03},bonus7:{redealCd:-6}}]},
 'kaethe-falsch':{kind:'resource',name:'Ass im Ärmel',output:{damage:0.9},
  falsch:{sleeve:1,stichTaunt:3,pikBonus:.3},
  kit:{},
  resVariant:{},
  paths:[{name:'Kontra',bonus4:{stichAugen:5},bonus7:{stichAny:1}},{name:'Ärmel',bonus4:{handSize:1},bonus7:{followMax:1}},{name:'Re & Bock',bonus4:{kreuzPower:.15},bonus7:{karoStun:.5}}]}
};
for(const [spec,m] of Object.entries(NEW_SPEC_MECHANICS)){const t=spec.startsWith('schorsch')?TALENTS_SCHORSCH:TALENTS_KAETHE;if(t[spec]?.length)SPEC_MECHANICS[spec]=m;}
applyTuning(SPEC_MECHANICS,TUNING.mechanics);
/** Effektschlüssel der Mechaniken (für Talente und Pfadboni; Prüfung: content/talents.js KNOWN_EFFECTS). */
export const MECHANIC_EFFECTS=['stackDecay','hangoverShort','stackBonus','stackBurstAt','stackSpread','stackWave','waveRadius','fassPils','fassWeizen','fassBock','fieldCount','fieldDuration','fieldRadius','supplyMax','cleanDuration','nestHonk','cleanDamage','dotSpread','dotRadius','dotHeal','dotExplodeTicks','stateDuration','stateDrain','stateDamage','stateTrigger','mobileHeal','mobileStrike','mobileThrow','mobileBurst','stateMobileAll','fuseDamage','fuseSpread','chainJumps','chainFalloff','reactionWindow','reactionDuration','robbiDamage','robbiGuard','overloadDamage','overloadStun','gambleOver','gamblePity','gambleMisfireMult','jackpotDuration','jackpotStreak','hausverbotDuration','mobileCast','mobileMark','mobileGround','overloadRadius','chainRadius','overSplashShare','tapDamage','fieldHeal','robbiHp','robbiFollows','nestFollows'];
export const MECHANIC_UI={schimmel:'SCHIMMEL SPRINGT',pegel:'Deckelstriche',kater:'Kater',vorrat:'Vorrat',putzwut:'Putzwut',jackpot:'Jackpot',kettenreaktion:'Kettenreaktion',hausverbot:'Hausverbot',fass:'Fass',robbi:'Robbi',nest:'Gisela',pfadbonus:'Pfadbonus',pfadkrone:'Pfadkrone'};
