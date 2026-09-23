// Startreihe (E-55): geführte kleine Hotspots rund um den Ort. Rolle: Story (Texte) + Gameplay (Arten, Zahlen).
// Jeder Hotspot hat einen Geber am Anker (Treffpunkt, Kiosk), ein eigenes Tiergebiet in der Nähe und zwei, drei
// Aufträge. Sind die erledigt, schickt eine Überleitung zum Geber des nächsten Hotspots. Aushänge liegen irgendwo in
// der Welt; wer sie findet, hat den Auftrag sofort, die Belohnung kommt beim letzten Treffer.
// IDs stehen im Spielstand (E-04): nie umbenennen oder löschen, stattdessen retired:true.
//
// Geber: givers = passende Leute am Ort; je Welt steht der erste, der dort nicht schon Nebenaufträge vergibt.
// Texte nennen Namen nur über {giver} (Geber dieses Hotspots) und {next} (Abgabe der Überleitung bzw. nächster Geber).
// objective: kill {species,count} · drop {species,item,chance,count} – der Gegenstand fällt nur, solange der Auftrag
// läuft, und wird bei der Abgabe eingezogen · talk {} – erledigt, sobald du beim Abgabe-Geber (turnIn) stehst.
// species = ARCHETYPES- oder ELITES-Schlüssel aus content/enemies.js. requires = Auftrags-IDs, die abgeschlossen sein müssen.
// Die Lage legt hotspots.js aus der fertigen Welt fest (eigener Zufall, verschiebt nichts an der Welt).

export const HOTSPOT_RULES={
 spawnRange:1150,      // ab dieser Entfernung zum Gebietsmittelpunkt werden die Tiere des Gebiets angelegt
 giverOffset:58,       // Geber steht so weit vom Anker Richtung Gebiet
 campDistance:320,     // Gebiete halten Abstand zu den Kapitel-Lagern
 areaSpacing:300,      // und zueinander
 talkRange:50
};

/** Questgegenstände: fallen nur während des Auftrags, sind unverkäuflich (quest:true). */
export const HOTSPOT_ITEMS={
 kollektefeder:{name:'Kollekte-Feder',kind:'material',quest:true,rarity:'common',icon:'paper',stack:20,value:0,description:'Für den Klingelbeutel von St. Gangolf. Angeblich wird er damit „würdevoller“.',look:'Weiße Gänsefeder mit einem Tropfen Wachs am Kiel'},
 grillborste:{name:'Grillbesen-Borste',kind:'material',quest:true,rarity:'common',icon:'scrap',stack:20,value:0,description:'Hart, fettig, nach Meinung des Pfandhofs lebensmittelecht.',look:'Büschel schwarzer Keilerborsten mit Grillfett'},
 rabenkronkorken:{name:'Blank gepickter Kronkorken',kind:'material',quest:true,rarity:'common',icon:'ring',stack:20,value:0,description:'Ein Rabe hat ihn poliert. Am Kiosk zählt er trotzdem als Pfand.',look:'Glänzender Kronkorken mit Schnabelkratzern'},
 schnorrbon:{name:'Geschnorrter Verzehrbon',kind:'material',quest:true,rarity:'common',icon:'paper',stack:20,value:0,description:'„Gilt für ein Getränk nach Wahl.“ Die Wahl traf jemand anderes.',look:'Zerknitterter roter Festzelt-Verzehrbon'},
 durchschlag:{name:'Durchschlag von Formular 27b',kind:'material',quest:true,rarity:'common',icon:'paper',stack:20,value:0,description:'Dreifach, in Blau. Das Original liegt vermutlich im Graben.',look:'Blaues Durchschlagpapier mit Amtsstempel'}
};

export const HOTSPOTS=[
 {id:'kirchhof',name:'Kirchhofwiese',anchor:'hub:kirchplatz',givers:['konrad','mara','leander','buergermeister'],level:1,
  area:{distance:[240,560],radius:95,spawns:[{kind:'badger',count:4},{kind:'goose',count:4}]},
  quests:[
   {id:'hs-kirchhof-1',title:'Dachse im Leergut',minLevel:1,objective:{kind:'kill',species:'badger',count:4},
    text:'Hinter der Kirchhofmauer graben Pfanddachse das Leergut der letzten Kirmes aus. Vier davon sollen einsehen, dass das Kirchengut ist.',
    lines:{offer:'Die Dachse klauen mir die Flaschen, bevor ich sie klauen kann. Äh – zurückgeben kann.',progress:'Noch nicht alle. Ich hör sie klirren.',done:'Ruhe im Leergut. Der Herr sieht alles, ich zum Glück nicht.'},
    reward:{xp:110,coins:6}},
   {id:'hs-kirchhof-2',title:'Federn für die Kollekte',minLevel:1,objective:{kind:'drop',species:'goose',item:'kollektefeder',chance:.55,count:5},
    text:'{giver} will den Klingelbeutel von St. Gangolf mit Gänsefedern schmücken. Die Grillgut-Gänse auf der Kirchhofwiese sehen das anders.',
    lines:{offer:'Fünf Federn. Ich sag nicht, dass die Gänse sie freiwillig hergeben.',progress:'Das sind keine fünf. Ich hab Mathe bei den Nonnen gehabt.',done:'Prächtig. Nächsten Sonntag klingelt der Beutel mit Stil.'},
    reward:{xp:130,coins:6}},
   {id:'hs-kirchhof-3',title:'Ein Wort bei {next}',minLevel:1,requires:['hs-kirchhof-1','hs-kirchhof-2'],objective:{kind:'talk'},turnIn:'grillwiese',
    text:'{giver} schickt dich zum Pfandhof: {next} hat Ärger mit Keilern und braucht jemanden, der „nicht nur redet“.',
    lines:{offer:'Geh zu {next} am Pfandhof. Sag, ich schick dich. Und dass da noch eine Wurst offen ist.',progress:'{next} steht am Pfandhof bei der Grillwiese. Du riechst es, bevor du es siehst.',done:'{giver} schickt dich? Dann bist du entweder gut oder mir schuldet jemand was.'},
    reward:{xp:70,coins:4,item:'festivalstiefel'}}
  ]},
 {id:'grillwiese',name:'Grillwiese am Pfandhof',anchor:'hub:pfandhof',givers:['oskar','fenja','fiete'],level:2,
  area:{distance:[260,600],radius:100,spawns:[{kind:'boar',count:6}]},
  quests:[
   {id:'hs-grillwiese-1',title:'Keiler am Grillrost',minLevel:2,requires:['hs-kirchhof-3'],objective:{kind:'kill',species:'boar',count:5},
    text:'Die Pfandkeiler haben die Grillwiese am Pfandhof umgepflügt, als Gegenleistung für Würstchen, die sie nie bekommen haben.',
    lines:{offer:'Fünf Keiler. Danach reden wir über Grillgut. Nicht über die Keiler, keine Sorge.',progress:'Da wühlt noch einer. Ich hör das Grunzen bis hier.',done:'Die Wiese gehört wieder dem Grill. Wie Gott es wollte.'},
    reward:{xp:120,coins:8}},
   {id:'hs-grillwiese-2',title:'Borsten für den Grillbesen',minLevel:2,requires:['hs-kirchhof-3'],objective:{kind:'drop',species:'boar',item:'grillborste',chance:.45,count:6},
    text:'Der Grillbesen vom Pfandhof ist abgebrannt. Ersatz wächst auf den Pfandkeilern, man muss ihn nur überzeugen.',
    lines:{offer:'Sechs Borsten, schön fettig. Die guten sitzen am Nacken.',progress:'Noch zu wenig Borste für einen ganzen Besen.',done:'Ein Besen wie vom Metzger geküsst. Danke.'},
    reward:{xp:140,coins:8}},
   {id:'hs-grillwiese-3',title:'Leergut-Sorgen am Kiosk',minLevel:2,requires:['hs-grillwiese-1','hs-grillwiese-2'],objective:{kind:'talk'},turnIn:'kioskhof',
    text:'{giver} hat gehört, dass {next} vor Kalles Kiosk den Überblick über das Leergut verliert. Raben und Ruhewarte sollen schuld sein.',
    lines:{offer:'{next} steht vorm Kiosk und zählt Flaschen, die die Raben klauen. Hilf da mal, sonst gibt’s nie wieder Pfand für meine Kohle.',progress:'{next} ist vorm Kiosk. Folg einfach dem Geklirr.',done:'{giver} schickt Hilfe? Dann wurde ausnahmsweise mal gezahlt.'},
    reward:{xp:80,coins:5,item:'regenjacke'}}
  ]},
 {id:'kioskhof',name:'Leergutplatz am Kiosk',anchor:'kiosk',givers:['jonna','elke','tilo','kurt'],level:3,
  area:{distance:[240,560],radius:100,spawns:[{kind:'raven',count:4},{kind:'warden',count:3}]},
  quests:[
   {id:'hs-kioskhof-1',title:'Raben am Pfandautomaten',minLevel:3,requires:['hs-grillwiese-3'],objective:{kind:'drop',species:'raven',item:'rabenkronkorken',chance:.5,count:6},
    text:'Die Leergut-Raben picken Kronkorken blank und horten sie. {giver} will das Pfand zurück, auch das polierte.',
    lines:{offer:'Sechs Kronkorken. Die Raben haben sie sauber gemacht, das ist das einzig Gute daran.',progress:'Die Raben haben noch mehr. Ich seh’s an ihrem Blick.',done:'Blank wie ein Kirmes-Pokal. Gebucht.'},
    reward:{xp:140,coins:9}},
   {id:'hs-kioskhof-2',title:'Ruhe vor der Ruhe',minLevel:3,requires:['hs-grillwiese-3'],objective:{kind:'kill',species:'warden',count:4},
    text:'Ruhewarte auf Streife schreiben Knöllchen für jede klirrende Flasche. {giver} klirrt beruflich.',
    lines:{offer:'Vier Ruhewarte. Leise, wenn’s geht. Sonst schreiben sie dich auch auf.',progress:'Ich hör noch Kugelschreiber klicken.',done:'Endlich darf wieder geklirrt werden.'},
    reward:{xp:130,coins:9}},
   {id:'hs-kioskhof-3',title:'Hopfen in Gefahr',minLevel:3,requires:['hs-kioskhof-1','hs-kioskhof-2'],objective:{kind:'talk'},turnIn:'wegestube',
    text:'An der Wegestube kämpft {next} gegen Füchse im Hopfengarten und Schnorrer an der Theke.',
    lines:{offer:'{next} an der Wegestube braucht dich. Und bring bloß kein Bier von Gisela mit.',progress:'Die Wegestube ist die mit der letzten Brezel. Buchstäblich.',done:'{giver} schickt dich? Von da kommen sonst nur Rechnungen.'},
    reward:{xp:90,coins:6,item:'pfandring'}}
  ]},
 {id:'wegestube',name:'Hopfengarten an der Wegestube',anchor:'hub:wegestube',givers:['hedwig','tilo','elke','kurt','pit'],level:4,
  area:{distance:[260,620],radius:105,spawns:[{kind:'fox',count:4},{kind:'scrounger',count:3}]},
  quests:[
   {id:'hs-wegestube-1',title:'Füchse im Hopfengarten',minLevel:4,requires:['hs-kioskhof-3'],objective:{kind:'kill',species:'fox',count:5},
    text:'Pfandfüchse schlafen in den Hopfenranken an der Wegestube und beißen jeden, der erntet.',
    lines:{offer:'Fünf Füchse. Die Ranken sind empfindlich, die Füchse leider nicht.',progress:'Der Garten raschelt noch.',done:'Jetzt kann der Hopfen in Ruhe wachsen. Bitter, wie er soll.'},
    reward:{xp:140,coins:10}},
   {id:'hs-wegestube-2',title:'Schnorrer-Beute',minLevel:4,requires:['hs-kioskhof-3'],objective:{kind:'drop',species:'scrounger',item:'schnorrbon',chance:.5,count:5},
    text:'Festzelt-Schnorrer haben die Verzehrbons der Wegestube eingesackt und trinken damit auf ihre Kosten.',
    lines:{offer:'Fünf Bons zurück. Wer schnorrt, rückt die auch wieder raus. Irgendwie.',progress:'Da trinkt noch einer auf meinen Deckel.',done:'Alle Bons da. Ich lad dich ein. Mit einem davon.'},
    reward:{xp:150,coins:10}},
   {id:'hs-wegestube-3',title:'Zurück zu Kisten-Ida',minLevel:4,requires:['hs-wegestube-1','hs-wegestube-2'],objective:{kind:'talk'},turnIn:'ida',
    text:'{giver} meint, wer so aufräumt, gehört an die großen Sachen. Kisten-Ida in der Bude plant genau so was.',
    lines:{offer:'Geh zu Ida in die Bude. Die hat Aufträge, gegen die meine Füchse Kuscheltiere sind.',progress:'Ida sitzt in der Bude und zählt Kisten.',done:'Du hast das Dorf einmal umrundet und alle mögen dich? Verdächtig. Setz dich.'},
    reward:{xp:120,coins:12,item:'kabelbinderstiefel'}}
  ]}
];

/** Aushänge: liegen in der Welt, der Fund startet den Auftrag, der letzte Treffer schließt ihn ab. */
export const WORLD_NOTICES=[
 {id:'aushang-bruno',title:'Steckbrief: Borsten-Bruno',found:'Steckbrief am Weidezaun',minLevel:4,
  ring:[1400,2600],area:{distance:[220,460],radius:110,spawns:[{kind:'alphaBoar',count:1}]},
  objective:{kind:'kill',species:'alphaBoar',count:1},
  text:'„Gesucht: Borsten-Bruno. Hat drei Zäune, zwei Grills und einen Praktikanten umgepflügt. Belohnung bei Vorlage des Borstenkamms.“',
  done:'Borsten-Bruno liegt. Der Steckbrief ist erledigt, die Belohnung klimpert in deiner Tasche.',
  reward:{xp:260,coins:25,item:'bierdeckelweste'}},
 {id:'aushang-olaf',title:'Olafs Strafzettel',found:'Strafzettel an einem Laternenmast',minLevel:5,
  ring:[1500,2800],area:{distance:[220,460],radius:110,spawns:[{kind:'oberpraktikant',count:1}]},
  objective:{kind:'kill',species:'oberpraktikant',count:1},
  text:'„Wegen Parken im Halteverbot (Grill): 35 Euro. Einspruch persönlich bei Oberpraktikant Olaf.“ Dann legst du halt persönlich Einspruch ein.',
  done:'Olaf hat den Einspruch angenommen. Liegend.',
  reward:{xp:280,coins:30,item:'kabeltalisman'}},
 {id:'aushang-formular',title:'Formular 27b in dreifacher Ausführung',found:'Durchnässtes Formular im Graben',minLevel:3,
  ring:[1000,2200],area:{distance:[200,440],radius:105,spawns:[{kind:'inspector',count:4}]},
  objective:{kind:'drop',species:'inspector',item:'durchschlag',chance:.45,count:4},
  text:'Ein Antrag auf „Genehmigung von Frohsinn“. Die Durchschläge tragen die Ordnungsamt-Praktikanten mit sich herum. Hol sie, bevor sie abgestempelt werden.',
  done:'Alle Durchschläge beisammen. Du stempelst sie selbst: GENEHMIGT.',
  reward:{xp:200,coins:18}}
];

/** Texte für Karte, Questbuch und Dialoge der Startreihe. */
export const HOTSPOT_UI={
 series:'Startreihe',notices:'Aushänge',questFilter:'Aufträge',
 accept:'Auftrag annehmen',claim:'Abgeben',track:'Verfolgen',close:'Weiterziehen',
 kill:(n,name)=>n+' × '+name+' besiegen',drop:(n,item,name)=>n+' × '+item+' (von '+name+')',talk:name=>'Sprich mit '+name,
 turnInAt:name=>'Abgabe bei '+name,level:n=>'Ab Stufe '+n,locked:'Noch nicht freigeschaltet',
 dropHint:p=>'fällt bei etwa '+Math.round(p*100)+' % der Treffer, nur solange der Auftrag läuft',
 accepted:title=>'Neuer Auftrag: '+title,ready:(title,name)=>title+' erledigt – zurück zu '+name+'.',noticeReady:title=>title+' erledigt.',
 claimed:title=>'Abgegeben: '+title,found:title=>'Aushang gefunden: '+title,bagFull:'Der Rucksack ist voll – mach Platz für die Belohnung.',
 dropped:name=>'+1 '+name,
 readNotice:'Aushang lesen',route:'Hinführen',toGiver:'Zum Auftraggeber',talkTo:name=>'Mit '+name+' reden',
 area:names=>'Gebiet: '+names,mapGiver:'Auftrag',mapReady:'Abgabe',mapArea:'Zielgebiet',mapSpawn:'Tiere',
 legendGiver:'! Auftrag · ? Abgabe',legendArea:'◯ Zielgebiet · Tiergebiet'
};
