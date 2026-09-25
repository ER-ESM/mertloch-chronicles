// Begleiter (E-45): Söldner heute, dauerhafte Klassen-Pets später – beide laufen über denselben Engine-Baustein
// `companions.js`. Hier stehen nur Daten: wer anheuerbar ist, welche Rolle er spielt, was er kann, was er kostet
// und wie er skaliert. Die Engine führt Fähigkeiten allein über `kind` aus; neue Begleiter brauchen keinen Code.
//
// IDs stehen in Spielständen (`companions[].defId`) – nie umbenennen oder löschen.

/** Regeln für alle Begleiter. Zahlen sind Balancing-Eigentum; Formeln stehen in companions.js. */
export const COMPANION_RULES=Object.freeze({
 maxActive:4,                 // zusammen mit echten Gruppenmitgliedern nie mehr als 5 (SHARED_RULES.partySize)
 gearShare:.85,               // Anteil an der Stärke eines gleichstufig ausgerüsteten Spielers
 // Dungeon Etappe 1 (E-71, 2026-09-25): In Instanzen sind Söldner fast vollwertig wie die Follower-Dungeons in WoW. Gemessen lagen sie
 // dort bei rund 15 % eines Helden (40 Schaden/s je Söldner gegen 240–270), Ziel sind rund 85 %. Gilt NUR im Dungeon (companions.js
 // refreshStats über inDungeon); die offene Welt bleibt unverändert. Schaden trägt Angriffe, heal die Heilung, health das Leben.
 // Messung: scripts/dungeon-sim.mjs, Bericht docs/DUNGEON-ETAPPE-1-2026-09-25.md.
 instanceFactor:{damage:4.8,heal:2.5,health:1.8},
 reaction:.35,                // Sekunden, bis ein Begleiter auf eine Ansage (Fläche, Zauber) reagiert
 // Dungeon Etappe 3 (E-71): Behauptung und Nachsatz. Söldner warten den Nachsatz ab und reagieren dann auf die Wahrheit. lieError =
 // Anteil der Lügen, auf die ein Söldner doch hereinfällt: Er läuft nach der Behauptung und bleibt lieConfusion Sekunden nach dem
 // Nachsatz noch dabei (Schreckmoment) – damit es nicht trivial wird.
 lieError:.05,lieConfusion:.8,
 // Aufstellung nach Rolle im Dungeon gegen Bosse und Eliten (COMPANION_ROLES.position): Abstand der Fernkämpfer vom Boss und Fächer
 // (Grad) links und rechts hinter ihm; formationSlack = so weit darf ein Söldner vom Platz abweichen, bevor er nachrückt.
 spreadDistance:112,spreadFan:[40,72],formationSlack:14,
 followDistance:70,           // Wunschabstand zum Besitzer außerhalb des Kampfs
 formation:[[-46,34],[46,34],[-82,-10],[82,-10]], // Plätze um den Besitzer (x,y), in Laufrichtung gespiegelt
 catchUp:260,                 // ab hier rennt der Begleiter (catchUpSpeed)
 teleport:760,                // ab hier springt er zum Besitzer (Instanzwechsel, Hänger an Kanten)
 speed:132,catchUpSpeed:190,  // Spieler läuft 122
 leashToOwner:520,            // weiter entfernt bricht er den Kampf ab und kommt zurück
 assistRange:360,             // so weit sucht er Ziele um den Besitzer
 threatSwitch:1.1,            // wie am Server: Zielwechsel erst bei 10 % mehr Bedrohung
 healThreat:.5,               // Heilung erzeugt diese Bedrohung je Punkt, verteilt auf alle kämpfenden Gegner
 downSeconds:25,              // so lange liegt ein besiegter Begleiter, danach steht er mit reviveHealth wieder auf
 reviveHealth:.5,
 outOfCombatRegen:.08,        // Anteil des Lebens je Sekunde außerhalb des Kampfs
 avoidMargin:26,              // so weit geht er über den Rand einer angesagten Fläche hinaus
 contractHours:2,             // Vertragsdauer in Spielstunden (echte Zeit im Spiel, pausiert offline)
 costBase:12,costPerLevel:4,  // Münzen je Vertrag: costBase + Stufe × costPerLevel
 critChance:.1,critFactor:1.5,spread:[.85,1.15], // Trefferstreuung der Begleiter
 vulnerableFactor:1.35,        // wie beim Spieler: verwundbare Gegner nehmen mehr Schaden
 pause:1,                     // gemeinsame Pause zwischen zwei Fähigkeiten
 aidRange:420,                // Heilung, Schutz und Buffs des Besitzers auf den gewählten Söldner (wie bei Gruppenmitgliedern)
 tauntLead:50,                // Spott setzt die Bedrohung auf den Höchstwert × threatSwitch + diesen Vorsprung
 interruptStun:.6,interruptThreat:40,
 castSight:230,               // Reichweite unterbrechbarer Gegnerzauber (wie im Spieler-Zweig der Engine)
 xpShare:1,                   // Begleiter nehmen dem Besitzer keine EP weg
 lootRolls:false              // Begleiter würfeln nie um Beute (E-42)
});

/** Rollen: Grundwerte je Stufe und Verhalten. `threat` multipliziert erzeugte Bedrohung (Schutz-Specs am Server: 3).
 *  position (Dungeon Etappe 3, E-71; Analyse Verbesserung 10): Platz gegen Bosse und Eliten – 'tank' dreht den Gegner von der Gruppe weg,
 *  'behind' steht hinter ihm, 'spread' verteilt sich im Fächer hinter ihm. Ein Söldner kann den Platz überschreiben (Fernkampf: spread). */
export const COMPANION_ROLES=Object.freeze({
 tank:  {name:'Schutz',  health:[760,58],damage:[15,2.6],threat:3, range:44, stance:'defend', picksUpLoose:true, position:'tank'},
 heal:  {name:'Heilung', health:[520,40],damage:[9,1.6], threat:.6,range:170,stance:'assist', keepsDistance:150, position:'spread'},
 damage:{name:'Schaden', health:[560,43],damage:[24,4.2],threat:1, range:48, stance:'assist', position:'behind'}
});

/** Fähigkeiten. kind: strike (Schlag) · taunt (Spott) · guard (Schadensminderung auf sich) · heal (Ziel mit wenig Leben)
 *  · interrupt (bricht unterbrechbare Zauber) · cleave (Schlag auf alle in Reichweite). power = Faktor auf den Rollen-Schaden. */
export const COMPANION_ABILITIES=Object.freeze({
 swing:     {name:'Kellenhieb',        kind:'strike',   cooldown:1.8, power:1},
 shot:      {name:'Kronkorkenschuss',  kind:'strike',   cooldown:1.6, power:1, range:190, ranged:true},
 taunt:     {name:'Ey, du da!',        kind:'taunt',    cooldown:8,   range:240},
 lid:       {name:'Deckel hoch',       kind:'guard',    cooldown:18,  duration:6, reduction:.4, below:.6},
 round:     {name:'Runde aufs Haus',   kind:'heal',     cooldown:3.2, power:5.5, below:.78, range:260},
 bigRound:  {name:'Große Runde',       kind:'heal',     cooldown:14,  power:13,  below:.4,  range:260},
 shush:     {name:'Ruhe jetzt!',       kind:'interrupt',cooldown:12,  range:230},
 sweep:     {name:'Rundumschlag',      kind:'cleave',   cooldown:7,   power:.8, radius:70, minTargets:2},
 // Dungeon Etappe 1 (E-71): Heil-Söldner helfen dem gefallenen Helden auf – einmal je Kampf, 8 s Wirkzeit, 35 % Leben wie das
 // Aufhelfen unter Mitspielern (E-44, reviveHere). Nur im Dungeon: nur dort läuft die Welt weiter, wenn der Held fällt.
 revive:    {name:'Aufhelfen',         kind:'revive',   cooldown:0,   cast:8,    share:.35, range:90}
});

/** Anheuerbare Söldner. `look` = Klassen-ID für die Heldengrafik (bis eigene Sprites kommen). */
export const COMPANIONS=Object.freeze([
 {id:'merc-pils-peter',   kind:'merc',name:'Pils-Peter',     role:'tank',  look:'dieter', spec:'dieter-wall',  abilities:['swing','taunt','lid','shush'],
  description:'Steht vorne, hält den Deckel hoch und nimmt alles persönlich. Zieht Gegner auf sich und unterbricht Zauber.',
  lines:{hire:'Wo brennt\'s? Ich stell mich davor.',down:'Ich… leg mich kurz hin.',revive:'Geht wieder. Wo waren wir?',dismiss:'Man sieht sich am Tresen.'}},
 {id:'merc-schorle-susi', kind:'merc',name:'Schorle-Susi',   role:'heal',  look:'baerbel',spec:'baerbel-care', abilities:['shot','round','bigRound','revive'],
  description:'Hält Abstand und die Gruppe am Leben. Schenkt nach, bevor es eng wird.',
  lines:{hire:'Trinkt genug. Den Rest mach ich.',down:'Mir ist schwindelig.',revive:'So. Wer braucht was?',dismiss:'Passt auf euch auf.'}},
 {id:'merc-radler-rita',  kind:'merc',name:'Radler-Rita',    role:'damage',look:'kevin',  spec:'kevin-hunt',   abilities:['shot','shush'],position:'spread',
  description:'Schießt aus der zweiten Reihe und bringt Zauberer zum Schweigen.',
  lines:{hire:'Zeig mir, wer nervt.',down:'Treffer… bei mir.',revive:'Nachgeladen.',dismiss:'Ruf an, wenn\'s wieder knallt.'}},
 {id:'merc-hopfen-horst', kind:'merc',name:'Hopfen-Horst',   role:'damage',look:'dieter', spec:'dieter-brawl', abilities:['swing','sweep'],
  description:'Geht rein und räumt auf. Am besten, wenn viele Gegner dicht stehen.',
  lines:{hire:'Endlich Bewegung.',down:'Der hat angefangen.',revive:'Zweite Halbzeit.',dismiss:'War mir ein Fest.'}},
 {id:'merc-zapf-hannes',  kind:'merc',name:'Zapf-Hannes',    role:'tank',  look:'kevin',  spec:'kevin-iron',   abilities:['swing','taunt','lid'],
  description:'Langsam, schwer, zuverlässig. Hält auch Bosse bei sich.',
  lines:{hire:'Ich halt das schon.',down:'Schrottreif.',revive:'Läuft wieder rund.',dismiss:'Bis zur nächsten Schicht.'}},
 {id:'merc-tresen-tina',  kind:'merc',name:'Tresen-Tina',    role:'heal',  look:'baerbel',spec:'baerbel-stage',abilities:['shot','round','bigRound','shush','revive'],
  description:'Heilt und ruft dazwischen, wenn jemand zu lange redet.',
  lines:{hire:'Bühne frei, ich pass auf.',down:'Licht aus.',revive:'Zugabe!',dismiss:'Danke fürs Publikum.'}}
]);

/** Texte der Oberfläche und Meldungen. */
export const COMPANION_TEXT=Object.freeze({
 title:'Söldner',board:'Schwarzes Brett am Clan-Treff',hire:'Anheuern',dismiss:'Entlassen',
 full:'Mehr als vier Begleiter passen nicht in die Gruppe.',partyFull:'Die Gruppe ist voll – erst jemanden entlassen.',
 money:'Das reicht nicht für den Vertrag.',already:'Der ist schon bei dir.',unknown:'Den kennt hier keiner.',
 hired:n=>n+' ist jetzt bei dir.',dismissed:n=>n+' ist wieder frei.',partyLeave:n=>n+' macht Platz – mehr als fünf passen nicht in die Gruppe.',expired:n=>'Der Vertrag mit '+n+' ist abgelaufen.',
 down:n=>n+' ist am Boden.',revived:n=>n+' steht wieder.',reviving:n=>n+' hilft dir auf.',revivedHero:n=>n+' hat dir aufgeholfen.',interrupted:'UNTERBROCHEN',taunted:'SPOTT',
 orders:{follow:'Folgen',stay:'Warten',attack:'Mein Ziel angreifen'},
 stances:{assist:'Unterstützen',defend:'Verteidigen',passive:'Passiv'},
 orderSet:o=>'Befehl: '+o,stanceSet:s=>'Haltung: '+s,
 // Chat-Befehle (Übergangsbedienung, bis das Schwarze Brett als Fenster da ist)
 chat:{help:'/söldner zeigt das Schwarze Brett · /söldner Name heuert an · /entlassen [Name] · /befehl folgen|warten|angriff · /haltung unterstützen|verteidigen|passiv',
  offer:(o,role)=>o.def.name+' · '+role+' · '+(o.hired?'bei dir':o.cost+' Pfandmarken')+' – '+o.def.description,
  needOrder:'Befehl fehlt: folgen, warten oder angriff.',needStance:'Haltung fehlt: unterstützen, verteidigen oder passiv.',none:'Du hast niemanden angeheuert.',
  orderWords:{folgen:'follow',follow:'follow',warten:'stay',stay:'stay',angriff:'attack',angreifen:'attack',attack:'attack'},
  stanceWords:{'unterstützen':'assist',unterstuetzen:'assist',assist:'assist',verteidigen:'defend',defend:'defend',passiv:'passive',passive:'passive'}}
});

export const companionById=id=>COMPANIONS.find(c=>c.id===id)||null;
export const companionCost=level=>COMPANION_RULES.costBase+Math.max(1,level)*COMPANION_RULES.costPerLevel;
/** Grundwerte eines Begleiters auf einer Stufe: {maxHp,damage}. */
export const companionStats=(role,level)=>{const r=COMPANION_ROLES[role],l=Math.max(1,level)-1,g=COMPANION_RULES.gearShare;return {maxHp:Math.round((r.health[0]+r.health[1]*l)*g),damage:(r.damage[0]+r.damage[1]*l)*g};};
