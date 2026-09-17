// Erinnerungsfetzen des Helden. Akt 1 „Filmriss“: Der Held wacht ohne Gedächtnis auf; jeder Fetzen kommt zu einem
// bestimmten Ereignis zurück (trigger) und ist ein kurzes Einblend-Fenster (title, text) plus ein Hinweis fürs Clanbuch (clue).
// Reihenfolge = Erzählreihenfolge; die Engine zeigt einen Fetzen genau einmal (Speicher: memories.seen[]).
// Trigger-Arten (MEMORY_TRIGGERS): was die Engine melden muss, damit der Fetzen auslöst. Offen in content/BACKLOG.md.
export const MEMORY_TRIGGERS={
 tutorialDone:'Hofprobe bestanden',
 consumable:'Verpflegung benutzt (item = ID aus items.js)',
 chapterClaimed:'Kapitelbelohnung bei Ida abgeholt (chapter = Kapitel-ID)',
 bossDefeat:'Boss besiegt (boss = ID aus enemies.js BOSSES)',
 firstDeath:'Erster Tod des Helden',
 buildingStage:'Basisbau-Stufe erreicht (building = ID aus buildings.js, stage = Stufe)',
 level:'Stufe erreicht (level = Zahl)'
};
export const MEMORY_FRAGMENTS=[
 {id:'stempel',order:0,trigger:{kind:'tutorialDone'},title:'Der Stempel',
  text:'Ein Stempelkissen. Blau. Jemand drückt dir den Stempel auf den Unterarm und sagt: „Zutritt. Kein Rückgeld.“ Du hast gelacht. Du hattest da noch eine Hose an. Glaubst du.',
  clue:'Der Stempel ist echt: Clan-Tinte, Clan-Hand. Du warst als Gast auf „Nie wieder Montag“.'},
 {id:'kasten-feuerzeug',order:1,trigger:{kind:'consumable',item:'kaltgetraenk'},title:'Halt mal mein Bier',
  text:'Kalt. Dose. Der erste Schluck ist ein Schalter. Ein Kasten in deinen Armen, ein Feuerzeug in deiner Hand, und eine Stimme, die „Halt mal mein Bier“ sagt. Es ist deine Stimme. Es war nicht dein Bier.',
  clue:'Du hattest ein Feuerzeug. Niemand im Clan raucht außer Ida. Ida hat ihres noch.'},
 {id:'pizzeria',order:2,trigger:{kind:'chapterClaimed',chapter:1},title:'22:01',
  text:'Ein Telefon klingelt. Nicht deins. Du nimmst ab und sagst „Pizzeria“. Jemand am anderen Ende brüllt „Polizei!“, und du sagst: „Die liefern wir nicht.“ Alle lachen. Ein Mann mit Aktenordner lacht nicht. Er notiert.',
  clue:'Horsts Anruf um 22:01 ging an die Polizei. Der zweite Anruf, 22:03, ging an die Bude. Du hast abgenommen. Bastians Handy war das nicht – es war das Festnetz der Bude.'},
 {id:'kastenturm',order:3,trigger:{kind:'buildingStage',building:'tresen',stage:1},title:'Statik',
  text:'Du hast schon mal gebaut. Einen Turm aus Bierkästen. Sieben hoch. Auf einem Autodach. Das Auto fuhr. Jemand rief „Das hält!“. Es war Kevin. Es hielt nicht.',
  clue:'Kevin hat dich Samstag schon mal „Statiker“ genannt. Er erinnert sich nicht. Sein Auto schon.'},
 {id:'shirt-zu-klein',order:4,trigger:{kind:'chapterClaimed',chapter:2},title:'Größe S',
  text:'Ein weißes Shirt. Zu klein. Jemand zieht es dir über den Kopf und sagt: „Bastian braucht’s nicht mehr, der hat gekotzt.“ Auf dem Shirt steht GAME OVER. Du sagst: „Neues Spiel.“ Zwölf Männer jubeln. Du kennst keinen davon.',
  clue:'Du warst Teil der Gruppe in den weißen Shirts. Zumindest textil.'},
 {id:'naturtalent',order:5,trigger:{kind:'level',level:5},title:'Naturtalent',
  text:'Ein Griff, den du nie gelernt hast, sitzt trotzdem. Festzelt, Sägemehl, ein Kerl mit Schärpe packt dich an der Schulter. Du drehst dich einmal weg, er liegt im Bierzeltboden und lacht. Jemand brüllt: „Der Dünne kann was!“ Zwölf Mann johlen. Du auch.',
  clue:'Du hast Samstag nicht nur mitgesoffen. Du hast mitgeprügelt, und du warst gut darin. Ida nennt das Beweislage. Dieter nennt es Talent.'},
 {id:'neues-spiel',order:6,trigger:{kind:'bossDefeat',boss:'klaus'},title:'Neues Spiel!',
  text:'Eine Kegelbahn. Blaue Kugeln. Einer mit Schärpe rollt sich selbst die Bahn runter. Du schreist „NEUES SPIEL!“ und wirfst einen Kegel durchs Fenster. Von innen. Der Fahrer sagt: „Das ist nicht Mertloch.“ Alle steigen wieder ein. Auch du. Vor allem du.',
  clue:'Der Bus war zuerst in Kalt. Die Kegelbahn war die Generalprobe. Die Bude war die Aufführung.'},
 {id:'wurst-ins-gesicht',order:7,trigger:{kind:'firstDeath'},title:'Wurst Case',
  text:'Ein Grill. Ein Streit. Ein Mann in Latzhose, der „Finderrecht!“ ruft, obwohl noch nichts auf der Straße liegt. Du drückst jemandem eine Bratwurst ins Gesicht. Aus Liebe. Dann wird es dunkel. Das war der Tresen. Von oben.',
  clue:'Der Tresen ist auf dich gefallen, bevor er auf die Straße kam. Dieter hat ihn nicht umgetreten. Er hat ihn gefangen. Halb.'},
 {id:'der-bus',order:8,trigger:{kind:'chapterClaimed',chapter:3},title:'Der falsche Bus',
  text:'Koblenz Hauptbahnhof. Regen. Ein Bus mit Girlanden. Du fragst: „Fährt der nach Hause?“ Ein Typ mit Schärpe sagt: „Der fährt überall hin, Bruder.“ Du steigst ein. Es riecht nach Pfefferminz und Reue. Du hast nicht gefragt, wo Zuhause ist. Du weißt es bis heute nicht.',
  clue:'Du bist in Koblenz eingestiegen. Wo du davor warst, weiß niemand. Auch du nicht. Das ist Akt 2.'},
 {id:'die-kiste',order:9,trigger:{kind:'chapterClaimed',chapter:4},title:'Die Kiste',
  text:'Die Bude brennt nicht, aber sie hat aufgehört, ein Haus zu sein. Du trägst die Kiste. Sie ist schwer. Sie ist alles. Ein Mann mit Pappkrone steht vor dir und weint, weil er Samstag heiratet. Du gibst ihm die Kiste. Du sagst etwas. Du weißt nicht mehr, was. Du weißt nur: Du hast es ernst gemeint.',
  clue:'Du hast Bastian die Kiste freiwillig gegeben. Was du gesagt hast, weiß nur Bastian. Der ist in Koblenz. Samstag.'}
];
export const memoryFor=id=>MEMORY_FRAGMENTS.find(m=>m.id===id)||null;
/** Liefert die Fetzen, die ein Ereignis auslöst und die noch nicht gesehen wurden. Vergleich über alle Trigger-Felder. */
export function triggeredMemories(event,seen=[]){return MEMORY_FRAGMENTS.filter(m=>!seen.includes(m.id)&&Object.entries(m.trigger).every(([k,v])=>event[k]===v));}
