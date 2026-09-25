// Klassenressourcen (E-71, docs/KLASSEN-RESSOURCEN-2026-09-25.md). Jede Klasse hat ein eigenes Ressourcenmodell:
// rage (Dieter: Randale als Wut + Zeche), trend (Anni: Likes + Trend), ammo (Kevin: Leergut-Kasten), grill (Schorsch:
// Glut + Grillrost), cards (Käthe: Blatt + Augen). Nur Daten und Texte; die Regeln stehen in class-resources.js.
// Zahlen gehören Balancing: tuning.js legt über `TUNING.resources` Werte drüber.
import {TUNING,applyTuning} from './tuning.js';

export const RESOURCES={
 dieter:{kind:'rage',name:'Randale',unit:'Randale',max:100,start:0,color:'#e2563d',
  // Wut: kein Nachfluss im Kampf, nach dem Kampf verraucht sie.
  decay:{delay:5,perSecond:6},hitGain:1.2,surgeAt:80,throwGain:12,combatStart:30,
  // Zeche: ein Anteil jedes Treffers wird angeschrieben und abgestottert; ausgegebene Randale bezahlt Leben der Zeche.
  tab:{share:.3,payRate:.12,payPerRandale:2,cap:.4},
  prellen:{radius:90,share:1,surgeBonus:.25},
  grantRate:1,
  hud:{tab:'Zeche',paid:'BEZAHLT',prellen:'GEPRELLT'}},
 baerbel:{kind:'trend',name:'Likes',unit:'Likes',max:100,start:60,color:'#ff8f5a',
  restRegen:5,
  trend:{max:5,names:['Flop','Nische','Läuft','Viral','Trending','Aperol-Hype'],likes:[3,5,7,9,11,14],bonusPerLevel:.04,decayAfter:3.5,shitstorm:.12,viralFree:1,viewers:[12,180,1400,9800,64000,480000]},
  beat:{likes:10},
  grantRate:1,
  hud:{up:'NEUER CONTENT',down:'WIEDERHOLUNG',viral:'VIRAL!',shitstorm:'SHITSTORM',forgotten:'VERGESSEN'}},
 kevin:{kind:'ammo',name:'Leergut',unit:'Flaschen',max:12,start:12,color:'#7fb069',
  restRefill:1.5,
  costs:{strike:1,mark:1,throw:1,snare:1,burst:3,ground:3,detonate:2},
  drop:{strike:.5,throw:.5,burst:2,ground:1,kill:1,life:14,spread:14},
  pickupRadius:14,
  reload:{channel:2,zone:[.55,.72],fill:6,jam:1},
  bon:{max:3,power:.35},
  empty:{name:'Pömpel-Schlag',range:45,share:.6},
  grantRate:.1,
  hud:{bon:'BON!',jam:'KLEMMT!',pickup:'+1 Flasche',empty:'PÖMPEL',full:'Kasten voll'}},
 schorsch:{kind:'grill',name:'Glut',unit:'Glut',max:100,start:25,color:'#f07a2a',
  decay:5,rest:25,
  zones:[{id:'kalt',name:'Kalt',to:30,damage:-.15,cook:.5,color:'#6fa8d6'},{id:'gut',name:'Gute Glut',to:60,damage:0,cook:1,color:'#9ccf6a'},{id:'perfekt',name:'Perfekte Glut',to:85,damage:.2,cook:1.4,color:'#f2c14e'},{id:'heiss',name:'Zu heiß',to:100,damage:.35,cook:2,burn:.015,color:'#e2563d'}],
  overheat:{damage:120,radius:80,self:.08,dropTo:20,lock:3,cook:.4},
  gain:{strike:12,parry:15,buff:35},
  spend:{throw:15,ground:30,heal:40},
  rost:{slots:3,cookTime:8,gar:[.6,.9],burnt:1.1,charcoal:1.3},
  plan:['wurst','braten','mais'],
  items:{
   wurst:{name:'Bratwurst',effect:'heal',value:.14,perfect:{hot:6},icon:'currywurst'},
   braten:{name:'Schwenkbraten',effect:'damage',value:1,perfect:{factor:1.6},icon:'food'},
   mais:{name:'Maiskolben',effect:'aoe',value:.7,radius:70,perfect:{knockback:24},icon:'hops'},
   kaese:{name:'Grillkäse',effect:'shield',value:.12,perfect:{parry:.3},icon:'cup'}
  },
  burntFactor:.5,
  vent:{heal:.08,steam:{radius:70,damage:.6,slow:.5,duration:3}},
  ember:{dot:12,duration:6},
  swing:{cook:.2},
  grantRate:.4,
  hud:{gar:'GAR!',burnt:'VERKOHLT',overheat:'STICHFLAMME',locked:'Grill aus',full:'Rost voll',empty:'Rost leer'}},
 kaethe:{kind:'cards',name:'Augen',unit:'Augen',max:120,start:0,color:'#d9c27a',
  hand:3,handByLevel:[[1,1],[2,2],[3,3]],
  suits:{kreuz:{name:'Kreuz',symbol:'♣',effect:'damage',color:'#3b4a3f'},pik:{name:'Pik',symbol:'♠',effect:'shield',color:'#26323a'},herz:{name:'Herz',symbol:'♥',effect:'heal',color:'#c8323a'},karo:{name:'Karo',symbol:'♦',effect:'control',color:'#d8622a'}},
  ranks:{
   7:{name:'Sieben',short:'7',augen:0,power:.6,quick:true,order:1},8:{name:'Acht',short:'8',augen:0,power:.65,quick:true,order:2},9:{name:'Neun',short:'9',augen:0,power:.7,quick:true,order:3},
   D:{name:'Dame',short:'D',augen:3,power:1,order:4},K:{name:'König',short:'K',augen:4,power:1.05,order:5},10:{name:'Zehn',short:'10',augen:10,power:1.4,order:6},A:{name:'Ass',short:'A',augen:11,power:1.5,order:7},
   B:{name:'Bube',short:'B',augen:2,power:1.3,trump:true,order:9}
  },
  augenPerCard:5,win:61,schneider:90,schwarz:120,
  abrechnen:{perAuge:3.2,schneider:1.5,schwarz:2,radius:90},
  follow:{bonus:.25,max:3},
  stich:{bonus:10},
  effects:{damage:{flat:30,weapon:2.2},shield:.08,heal:.1,control:{flat:16,weapon:1,radius:60,slow:.4,duration:3,stun:1}},
  castSuits:{damage:'kreuz',heal:'herz',shield:'pik',buff:'pik',control:'karo'},
  forget:8,redealTrump:true,
  grantRate:.2,
  hud:{won:'GEWONNEN',schneider:'SCHNEIDER',schwarz:'SCHWARZ',stich:'STICH!',follow:'FARBE!',shuffle:'GEMISCHT',grand:'GRAND'}}
};
applyTuning(RESOURCES,TUNING.resources);

/** Kniffe, die eine Ressource mitbringt (Speicherschlüssel wie alle Kniff-IDs). Lernstufe `level`, Leiste über skillsFor. */
export const RESOURCE_SKILLS={
 zeche:{cls:'dieter',level:6,name:'Zeche prellen',cd:18,cost:0,icon:'paper',color:'#e6b769',bg:'#6b3f2c',
  text:'Löscht die ganze Zeche und teilt sie als Druckwelle an alle Gegner ringsum aus.',
  use:'Drück ihn, wenn die Zeche lang ist und mehrere Gegner an dir kleben.',flavor:'„Schreib’s auf die Rechnung von dem da.“',
  info:{effect:'Alles Angeschriebene verschwindet vom Bon und trifft stattdessen die Gegner im Umkreis.',why:'Die Zeche ist Dieters Risiko und seine Munition: wer sie wachsen lässt, statt sie abzubezahlen, bekommt einen Flächenschlag in Höhe dessen, was er eingesteckt hat.',links:['skill:dieter/strike','passive:dieter'],terms:['zeche','randale','flaeche']}},
 reload:{cls:'kevin',level:2,name:'Pfandautomat',cd:0,cost:0,icon:'bottle',color:'#b9d98b',bg:'#3d5a3a',mobile:true,offGcd:true,
  text:'Lädt den Kasten nach: normal sechs Flaschen, in der goldenen Bon-Zone den ganzen Kasten und einen Pfandbon.',
  use:'Drück ihn, wenn der Kasten fast leer ist, und drück ihn noch einmal, sobald der Balken in der goldenen Zone steht.',flavor:'„Der Automat nimmt keine Dosen. Ich schon.“',
  info:{effect:'Füllt den Kasten mit einem kurzen Nachladebalken; ein zweiter Druck im richtigen Moment füllt ihn ganz und legt einen Bon dazu.',why:'Kevins Munition ist endlich. Nachladen kostet Zeit – das Timing entscheidet, ob es sich lohnt oder klemmt.',links:['skill:kevin/strike','passive:kevin'],terms:['leergut','pfandbon']}},
 aermel:{cls:'kaethe',level:5,spec:'kaethe-falsch',name:'Ass im Ärmel',cd:0,cost:0,icon:'book',color:'#e8d9a8',bg:'#4a3b52',
  text:'Legt die erste Karte deiner Hand in den Ärmel oder spielt die Ärmelkarte aus.',
  use:'Drück ihn, wenn du eine starke Karte für den nächsten Gegnerzauber aufheben willst.',flavor:'„Ich hab nix im Ärmel. Außer dem Ärmel.“',
  info:{effect:'Hält eine Karte außerhalb der Hand fest, bis du sie gezielt ausspielst.',why:'Die Falschspielerin wartet auf den Stich: wer die richtige Farbe bereithält, bricht den nächsten Gegnerzauber sicher.',links:['skill:kaethe/interrupt'],terms:['blatt','stich']}}
};

/** Effektschlüssel der Ressourcen (Talente, Pfadboni). Die Engine wertet sie in class-resources.js aus. */
export const RESOURCE_EFFECTS=['zecheShare','zechePay','zecheCap','prellenPower','hitRage','prellenCd',
 'trendDecay','trendStart','trendBonus','repeatForgive','viralFree','shitstormGuard','likesPerCast',
 'crateSize','dropChance','pickupRadius','reloadZone','reloadFill','bonMax','bonPower','robbiPickup','killBottles',
 'glutDecay','perfectLow','perfectHigh','glutStrike','glutParry','overheatSafe','overheatDamage','overheatLock','rostSlots','cookSpeed','garWindow','burntGrace',
 'planWurst','planBraten','planMais','planKaese','wurstHeal','bratenDamage','maisRadius','kaeseShield','serveCleave','ventHeal','ventSteam','emberDot','swingCook','smokeTaunt',
 'handSize','redealCd','followBonus','followMax','bubePower','luschenPower','augenWin','augenGain','abrechnenPower','stichAugen','stichAny','stichHeal',
 'kreuzPower','pikPower','herzPower','karoPower','karoStun','herzChain','pikTaunt','pikReflect','seeNext','luschenGcd'];

/** Neue Proc-Auslöser und -Wirkungen der Ressourcen (content/procs.js mischt sie ein). */
export const RESOURCE_PROC_TRIGGERS=['tabPaid','prellen','trendUp','viral','shitstorm','pickup','perfectReload','bonUsed','serve','perfectServe','overheat','vent','glutPerfect','cardPlayed','follow','stich','gameWon','bubePlayed','shuffle'];
export const RESOURCE_PROC_EFFECTS=['bottles','glut','cook','augen','draw','trend','tab'];

/** Beschreibung der Effektschlüssel für den Zahlenblock (content/glossary.js mischt sie in EFFECT_INFO). */
export const RESOURCE_EFFECT_INFO={
 zecheShare:{label:'Mehr Schaden wird angeschrieben',unit:'%',scale:v=>v*100},zechePay:{label:'Zusätzlich bezahlte Zeche je Randale',unit:'Leben'},zecheCap:{label:'Höhere Obergrenze der Zeche',unit:'% Maximalleben',scale:v=>v*100},
 prellenPower:{label:'Stärkere Druckwelle beim Prellen',unit:'%',scale:v=>v*100},hitRage:{label:'Mehr Randale aus kassierten Treffern',unit:'%',scale:v=>v*100},prellenCd:{label:'Abklingzeit von Zeche prellen',unit:'s'},
 trendDecay:{label:'Trend hält länger ohne Kniff',unit:'s'},trendStart:{label:'Trend zu Kampfbeginn',unit:'Stufen'},trendBonus:{label:'Mehr Wirkung je Trendstufe',unit:'%',scale:v=>v*100},
 repeatForgive:{label:'Pinsel-Piekser gilt nie als Wiederholung',fixed:1,unit:''},viralFree:{label:'Zusätzliche Gratiskniffe bei Viral',unit:'Kniffe'},shitstormGuard:{label:'Shitstorm gibt Deckung statt Trend zu kosten',fixed:1,unit:''},likesPerCast:{label:'Mehr Likes je Kniff',unit:'Likes'},
 crateSize:{label:'Größerer Kasten',unit:'Flaschen'},dropChance:{label:'Mehr heiles Leergut',unit:'%',scale:v=>v*100},pickupRadius:{label:'Größerer Aufsammelkreis',unit:'Welteinheiten'},reloadZone:{label:'Breitere Bon-Zone',unit:'%',scale:v=>v*100},
 reloadFill:{label:'Mehr Flaschen beim normalen Nachladen',unit:'Flaschen'},bonMax:{label:'Mehr Pfandbons auf Vorrat',unit:'Bons'},bonPower:{label:'Stärkerer Pfandbon',unit:'%',scale:v=>v*100},robbiPickup:{label:'Robbi sammelt Leergut ein',fixed:1,unit:''},killBottles:{label:'Mehr Flaschen je Kill',unit:'Flaschen'},
 glutDecay:{label:'Glut kühlt anders ab',unit:'Glut/s'},perfectLow:{label:'Perfekte Glut beginnt früher',unit:'Glut'},perfectHigh:{label:'Perfekte Glut reicht höher',unit:'Glut'},glutStrike:{label:'Mehr Glut je Grillzange',unit:'Glut'},glutParry:{label:'Mehr Glut je Parade',unit:'Glut'},
 overheatSafe:{label:'Stichflamme verletzt dich nicht',fixed:1,unit:''},overheatDamage:{label:'Stärkere Stichflamme',unit:'%',scale:v=>v*100},overheatLock:{label:'Grill aus nach der Stichflamme',unit:'s'},rostSlots:{label:'Mehr Plätze auf dem Grillrost',unit:'Plätze'},
 cookSpeed:{label:'Grillgut gart schneller',unit:'%',scale:v=>v*100},garWindow:{label:'Längeres Garfenster',unit:'%',scale:v=>v*100},burntGrace:{label:'Grillgut verkohlt später',unit:'%',scale:v=>v*100},
 planWurst:{label:'Bratwurst im Grillplan',fixed:1,unit:''},planBraten:{label:'Schwenkbraten im Grillplan',fixed:1,unit:''},planMais:{label:'Maiskolben im Grillplan',fixed:1,unit:''},planKaese:{label:'Grillkäse im Grillplan',fixed:1,unit:''},
 wurstHeal:{label:'Stärkere Bratwurst-Heilung',unit:'%',scale:v=>v*100},bratenDamage:{label:'Mehr Schwenkbraten-Schaden',unit:'%',scale:v=>v*100},maisRadius:{label:'Größere Popcorn-Explosion',unit:'Welteinheiten'},kaeseShield:{label:'Stärkerer Grillkäse-Schild',unit:'%',scale:v=>v*100},
 serveCleave:{label:'Serviertes trifft auch Nachbarn',fixed:1,unit:''},ventHeal:{label:'Ablöschen heilt mehr',unit:'%',scale:v=>v*100},ventSteam:{label:'Stärkere Dampfwolke',unit:'%',scale:v=>v*100},emberDot:{label:'Stärkerer Glutbrand',unit:'%',scale:v=>v*100},
 swingCook:{label:'Schwenkgrill gart mehr',unit:'%',scale:v=>v*100},smokeTaunt:{label:'Rauch verspottet Gegner',fixed:1,unit:''},
 handSize:{label:'Mehr Karten auf der Hand',unit:'Karten'},redealCd:{label:'Abklingzeit von Neu geben',unit:'s'},followBonus:{label:'Mehr Bonus fürs Farbe-Bedienen',unit:'%',scale:v=>v*100},followMax:{label:'Längere Farbkette',unit:'Glieder'},
 bubePower:{label:'Stärkere Buben',unit:'%',scale:v=>v*100},luschenPower:{label:'Stärkere Luschen (7, 8, 9)',unit:'%',scale:v=>v*100},augenWin:{label:'Spiel früher gewonnen',unit:'Augen'},augenGain:{label:'Mehr Augen je Karte',unit:'Augen'},
 abrechnenPower:{label:'Stärkeres Abrechnen',unit:'%',scale:v=>v*100},stichAugen:{label:'Mehr Augen je Stich',unit:'Augen'},stichAny:{label:'Stich auch gegen nicht unterbrechbare Zauber',fixed:1,unit:''},stichHeal:{label:'Stich heilt dich',unit:'% Maximalleben',scale:v=>v*100},
 kreuzPower:{label:'Stärkere Kreuz-Karten',unit:'%',scale:v=>v*100},pikPower:{label:'Stärkere Pik-Karten',unit:'%',scale:v=>v*100},herzPower:{label:'Stärkere Herz-Karten',unit:'%',scale:v=>v*100},karoPower:{label:'Stärkere Karo-Karten',unit:'%',scale:v=>v*100},
 karoStun:{label:'Längere Karo-Betäubung',unit:'s'},herzChain:{label:'Herz springt auf einen zweiten Verbündeten',fixed:1,unit:''},pikTaunt:{label:'Pik verspottet Gegner ringsum',fixed:1,unit:''},pikReflect:{label:'Pik-Schild wirft Schaden zurück',unit:'%',scale:v=>v*100},
 seeNext:{label:'Nächste Karte sichtbar',fixed:1,unit:''},luschenGcd:{label:'Luschen ohne globale Abklingzeit',fixed:1,unit:''}
};
export const RESOURCE_PROC_EFFECT_INFO={
 bottles:{label:'Flaschen in den Kasten',unit:'Flaschen'},glut:{label:'Glut',unit:'Glut'},cook:{label:'Grillgut gart weiter',unit:'%',scale:v=>v*100},
 augen:{label:'Augen',unit:'Augen'},draw:{label:'Neue Hand',fixed:1,unit:''},trend:{label:'Trend',unit:'Stufen'},tab:{label:'Zeche getilgt',unit:'%',scale:v=>v*100}
};

/** Fachbegriffe der Ressourcen (content/glossary.js mischt sie ins GLOSSARY). */
const D=RESOURCES.dieter,A=RESOURCES.baerbel,K=RESOURCES.kevin,S=RESOURCES.schorsch,C=RESOURCES.kaethe;
const pct=v=>Math.round(v*100)+' %';
export const RESOURCE_GLOSSARY={
 zeche:{name:'Zeche',short:'Angeschriebener Schaden: kommt später – oder nie, wenn du vorher Randale ausgibst.',
  long:`${pct(D.tab.share)} jedes Treffers, der nach Deckung übrig bleibt, landet auf dem Bon statt im Leben. Die Zeche stottert ${pct(D.tab.payRate)} ihres Stands je Sekunde als Schaden ab. Jede ausgegebene Randale bezahlt ${D.tab.payPerRandale} Leben davon – dieser Schaden kommt nie an. Höchstens ${pct(D.tab.cap)} deines Maximallebens; darüber trifft alles voll. Zeche prellen löscht den Bon und trifft die Gegner ringsum mit dem ganzen Betrag.`},
 likes:{name:'Likes',short:'Annis Währung: Kniffe kosten Likes, neuer Content bringt neue.',
  long:`Skala 0 bis ${A.max}, Start ${A.start}. Außerhalb des Kampfes kommen ${A.restRegen} je Sekunde nach, im Kampf nur über Kniffe: je nach Trend ${A.trend.likes[0]} bis ${A.trend.likes[A.trend.max]} Likes pro Kniff. Ein Pinsel-Piekser im Takt gibt ${A.beat.likes} zusätzlich.`},
 trend:{name:'Trend',short:'Wie gut dein Content läuft: Abwechslung hebt ihn, Wiederholung senkt ihn.',
  long:`Stufen 0 bis ${A.trend.max} (${A.trend.names.join(', ')}). Ein Kniff, der nicht unter deinen letzten zwei war, hebt den Trend um eins; derselbe Kniff zweimal hintereinander senkt ihn. ${A.trend.decayAfter.toString().replace('.',',')} s ohne Kniff und jeder Treffer über ${pct(A.trend.shitstorm)} deines Lebens senken ihn ebenfalls. Je Stufe wirken Schaden und Heilung ${pct(A.trend.bonusPerLevel)} stärker; bei Stufe ${A.trend.max} ist dein nächster Kniff gratis.`},
 leergut:{name:'Leergut',short:'Kevins Munition: Flaschen im Kasten, und was danebengeht, liegt zum Aufsammeln herum.',
  long:`Der Kasten fasst ${K.max} Flaschen. Pfandgeschoss, Kleber und Wurf kosten eine, Rakete und Bodenzünder drei. Ein Wurf bleibt zu ${pct(K.drop.strike)} heil neben dem Ziel liegen, die Rakete lässt ${K.drop.burst} Flaschen liegen, jeder Kill wirft eine ab. Drüberlaufen sammelt sie ein. Außerhalb des Kampfes sortiert Kevin alle ${K.restRefill.toString().replace('.',',')} s eine Flasche nach. Leer wird die Taste 1 zum Pömpel-Schlag.`},
 pfandbon:{name:'Pfandbon',short:'Belohnung fürs perfekte Nachladen: der nächste Flaschenkniff trifft härter.',
  long:`Wer beim Pfandautomaten den Balken in der goldenen Zone (${pct(K.reload.zone[0])} bis ${pct(K.reload.zone[1])}) erneut drückt, bekommt den vollen Kasten und einen Bon; höchstens ${K.bon.max} auf Vorrat. Jeder Bon macht einen Flaschenkniff ${pct(K.bon.power)} stärker. Daneben gedrückt klemmt der Automat ${K.reload.jam} s länger.`},
 glut:{name:'Glut',short:'Schorschs Temperatur: im goldenen Bereich stark, zu heiß gefährlich.',
  long:`Skala 0 bis ${S.max}, kühlt mit ${S.decay} je Sekunde ab. ${S.zones.map(z=>z.name+' bis '+z.to+(z.damage?' ('+(z.damage>0?'+':'')+pct(z.damage)+' Schaden)':'')).join(', ')}. Grillzange, Parade und Blasebalg heizen, Glutbrocken, Schwenkgrill und Ablöschen kühlen. Bei ${S.max} kommt die Stichflamme.`},
 stichflamme:{name:'Stichflamme',short:'Überhitzt: Feuerring um Schorsch, danach ist der Grill kurz aus.',
  long:`Erreicht die Glut ${S.max}, explodiert sie im Umkreis (${S.overheat.radius} Welteinheiten) und trifft auch Schorsch mit ${pct(S.overheat.self)} seines Lebens. Die Glut fällt auf ${S.overheat.dropTo}, Grillkniffe sind ${S.overheat.lock} s gesperrt, und alles Grillgut gart schlagartig ${pct(S.overheat.cook)} weiter.`},
 grillrost:{name:'Grillrost',short:'Drei Plätze für Grillgut, das mit der Zeit gart und serviert wird.',
  long:`Auflegen legt das nächste Stück aus dem Grillplan (Bratwurst, Schwenkbraten, Maiskolben) auf einen freien Platz. In ${S.rost.cookTime} s bei guter Glut ist es durch; heißer gart schneller. Gar ist es zwischen ${pct(S.rost.gar[0])} und ${pct(S.rost.gar[1])} – dann wirkt es am stärksten. Ab ${pct(S.rost.burnt)} ist es verkohlt und wirkt nur halb, ab ${pct(S.rost.charcoal)} ist es Kohle und fällt vom Rost.`},
 garstufe:{name:'Garstufe',short:'Wie weit ein Grillgut ist: roh, gar, durch oder verkohlt.',
  long:`Die Garstufe wächst je Sekunde um den Faktor des Glutbereichs (kalt ×${S.zones[0].cook}, gut ×${S.zones[1].cook}, perfekt ×${S.zones[2].cook}, zu heiß ×${S.zones[3].cook}). Servieren nimmt immer das garste Stück. Gar serviert: Bratwurst heilt nach, Braten trifft ×${S.items.braten.perfect.factor}, Mais stößt zurück, Käse verlängert die Parade.`},
 augen:{name:'Augen',short:'Käthes Spielstand: jede Karte zählt, ab 61 ist das Spiel gewonnen.',
  long:`Jede ausgespielte Karte gibt ${C.augenPerCard} Augen plus ihren Skatwert (Ass 11, Zehn 10, König 4, Dame 3, Bube 2, sonst 0). Ab ${C.win} Augen ist das Spiel gewonnen und Abrechnen bereit, ab ${C.schneider} Schneider (×${C.abrechnen.schneider}), bei ${C.schwarz} Schwarz (×${C.abrechnen.schwarz}, trifft alle ringsum). Außerhalb des Kampfes verfallen die Augen nach ${C.forget} s.`},
 blatt:{name:'Blatt',short:'Käthes Hand: bis zu drei Karten, die Farbe bestimmt die Wirkung.',
  long:'Zweiunddreißig Karten, gemischt. Kreuz trifft das Ziel, Pik schützt, Herz heilt, Karo trifft und bremst im Umkreis. Sieben bis Neun sind schwach, aber schnell; Zehn und Ass sind stark; Buben sind Trumpf. Nach jeder Karte wird sofort nachgezogen, ein leerer Stapel wird neu gemischt.'},
 stich:{name:'Stich',short:'Gegen einen Gegnerzauber dieselbe Farbe höher spielen – oder einen Buben.',
  long:`Jeder Gegnerzauber zeigt Käthe eine Karte: Schaden ist Kreuz, Heilung Herz, Schutz Pik, Kontrolle Karo. Spielst du auf diesen Gegner dieselbe Farbe mit höherem Rang oder einen Buben, solange der Zauber läuft, ist das ein Stich: unterbrechbare Zauber brechen ab, und du bekommst die Augen der Gegnerkarte plus ${C.stich.bonus}.`},
 farbebedienen:{name:'Farbe bedienen',short:'Dieselbe Farbe wie die letzte Karte spielen – die Kette macht jede Karte stärker.',
  long:`Jedes Kettenglied gibt ${pct(C.follow.bonus)} mehr Wirkung, höchstens ${C.follow.max} Glieder. Ein Bube bedient jede Farbe und verlängert die Kette. Eine andere Farbe beginnt eine neue Kette.`},
 abrechnen:{name:'Abrechnen',short:'Käthes Finisher: zählt die Augen des Spiels zusammen und schlägt damit zu.',
  long:`Erst ab ${C.win} Augen. Schaden je Auge ${String(C.abrechnen.perAuge).replace('.',',')} (wächst mit der Stufe), Schneider ×${C.abrechnen.schneider}, Schwarz ×${C.abrechnen.schwarz} und Umkreis. Danach beginnt ein neues Spiel bei 0 Augen.`}
};
